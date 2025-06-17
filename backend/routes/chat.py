from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import json
from db import get_db
from services.chat_service import ChatService
from models.chat import MessageType, ChatMessage
from auth import get_current_user_ws
from models.user import User
from datetime import datetime
from fastapi import status
import logging
from sqlalchemy import desc

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter()

# Хранилище активных подключений
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
        self.online_users: Dict[int, User] = {}
        self.logger = logging.getLogger(__name__)

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        # Находим user_id по websocket
        user_id = None
        for uid, ws in self.active_connections.items():
            if ws == websocket:
                user_id = uid
                break
                
        if user_id:
            del self.active_connections[user_id]
            if user_id in self.online_users:
                del self.online_users[user_id]
            self.logger.info(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")

    def add_user(self, user: User):
        self.online_users[user.id] = user
        self.logger.info(f"User {user.nickname} added to online users. Total online: {len(self.online_users)}")

    def remove_user(self, user: User):
        if user.id in self.online_users:
            del self.online_users[user.id]
            self.logger.info(f"User {user.nickname} removed from online users. Total online: {len(self.online_users)}")

    def get_online_users(self) -> List[User]:
        return list(self.online_users.values())

    async def broadcast(self, message: str):
        self.logger.info(f"Broadcasting message to {len(self.active_connections)} connections")
        disconnected = set()
        
        for user_id, connection in self.active_connections.items():
            try:
                self.logger.info(f"Sending message to user {user_id}")
                await connection.send_text(message)
                self.logger.info("Message sent successfully")
            except Exception as e:
                self.logger.error(f"Error sending message to user {user_id}: {str(e)}")
                disconnected.add(connection)
                
        # Удаляем отключенные соединения
        for connection in disconnected:
            await self.disconnect(connection)
            self.logger.info("Disconnected failed connection")

    async def broadcast_online_users(self):
        online_users = self.get_online_users()
        message = {
            "type": "online_users",
            "users": [{
                "id": user.id, 
                "nickname": user.nickname,
                "race_color": user.race.chat_color if user.race else "#4CAF50"
            } for user in online_users]
        }
        await self.broadcast(json.dumps(message))

    async def send_recent_messages(self, websocket: WebSocket, db: Session, limit: int = 15):
        """Отправляет последние сообщения пользователю"""
        try:
            # Получаем последние сообщения
            recent_messages = db.query(ChatMessage).order_by(
                desc(ChatMessage.created_at)
            ).limit(limit).all()
            
            # Преобразуем сообщения в нужный формат
            messages_data = []
            for msg in reversed(recent_messages):  # Разворачиваем список, чтобы сообщения шли в хронологическом порядке
                sender = db.query(User).filter(User.id == msg.sender_id).first()
                if sender:
                    message_data = {
                        "type": "message",
                        "content": msg.content,
                        "sender": sender.nickname,
                        "sender_id": msg.sender_id,
                        "timestamp": msg.created_at.isoformat(),
                        "sender_race_color": sender.race.chat_color if sender.race else "#4CAF50"
                    }
                    messages_data.append(message_data)
            
            # Отправляем сообщения пользователю
            if messages_data:
                await websocket.send_text(json.dumps({
                    "type": "recent_messages",
                    "messages": messages_data
                }))
                logger.info(f"Sent {len(messages_data)} recent messages to user")
            
        except Exception as e:
            logger.error(f"Error sending recent messages: {str(e)}")

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(websocket, user_id)
    logger.info(f"New WebSocket connection attempt for user_id: {user_id}")
    authenticated_user = None
    
    try:
        logger.info("WebSocket connection accepted")
        logger.info("Waiting for authorization message...")
        
        # Ждем сообщение авторизации
        auth_message = await websocket.receive_text()
        logger.info(f"Received auth message: {auth_message}")
        
        auth_data = json.loads(auth_message)
        if auth_data.get("type") != "authorization":
            logger.warning("Invalid message format: missing or invalid type")
            await websocket.close(code=4000)
            return
        
        token = auth_data.get("token", "")
        if not token:
            logger.warning("No token provided")
            await websocket.close(code=4000)
            return
        
        # Убираем префикс "Bearer " если он есть
        if token.startswith("Bearer "):
            token = token[7:]
        
        logger.info(f"Processing token: {token[:10]}...")
        try:
            user = await get_current_user_ws(token, db)
            logger.info(f"User authentication result: {user.nickname if user else 'None'}")
        except Exception as e:
            logger.error(f"Error during user authentication: {str(e)}")
            await websocket.close(code=4000)
            return
        
        if not user:
            logger.warning("User not found")
            await websocket.close(code=4000)
            return
        
        if user.id != user_id:
            logger.warning(f"User ID mismatch: token user {user.id} != path user {user_id}")
            await websocket.close(code=4000)
            return
        
        logger.info(f"User authenticated successfully: {user.nickname}")
        authenticated_user = user
        
        # Добавляем пользователя в список онлайн
        manager.add_user(user)
        logger.info(f"User {user.nickname} added to online users")
        
        # Отправляем список онлайн пользователей
        await manager.broadcast_online_users()
        logger.info("Online users list broadcasted")
        
        # Отправляем последние сообщения
        await manager.send_recent_messages(websocket, db)
        logger.info("Recent messages sent")
        
        # Обрабатываем сообщения
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                message_type = message_data.get("type")
                
                if message_type == "message":
                    logger.info(f"Received message: {message_type}")
                    try:
                        # Создаем сообщение в базе данных
                        db_message = ChatMessage(
                            content=message_data["content"],
                            sender_id=message_data["sender_id"],
                            message_type=MessageType.CHAT,
                            created_at=datetime.utcnow(),
                            is_read=False,
                            is_direct_message=False
                        )
                        db.add(db_message)
                        db.commit()
                        db.refresh(db_message)
                        logger.info(f"Message saved to database with ID: {db_message.id}")
                        
                        # Подготавливаем данные для отправки
                        sender = db.query(User).filter(User.id == message_data["sender_id"]).first()
                        message_data = {
                            "type": "message",
                            "content": message_data["content"],
                            "sender": message_data["sender"],
                            "sender_id": message_data["sender_id"],
                            "timestamp": db_message.created_at.isoformat(),
                            "sender_race_color": sender.race.chat_color if sender and sender.race else "#4CAF50"
                        }
                        
                        # Отправляем сообщение всем
                        logger.info(f"Broadcasting message: {message_data}")
                        await manager.broadcast(json.dumps(message_data))
                        logger.info(f"Message broadcasted: {message_data}")
                        
                    except Exception as e:
                        logger.error(f"Error processing message: {str(e)}")
                        logger.error(f"Message data: {message_data}")
                        continue
                        
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for user {user.nickname}")
                break
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {str(e)}")
                continue
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Удаляем пользователя из списка онлайн при отключении
        if authenticated_user:
            manager.remove_user(authenticated_user)
            logger.info(f"User {authenticated_user.nickname} removed from online users")
            await manager.broadcast_online_users()
        await manager.disconnect(websocket)
        logger.info("WebSocket connection closed") 