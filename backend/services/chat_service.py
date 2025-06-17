from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from models.chat import ChatMessage, MessageType
from fastapi import HTTPException
from typing import List, Dict, Optional
import pytz
from fastapi import WebSocket
from models.user import User

class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.message_cooldowns = {}  # {user_id: last_message_time}
        self.blocked_users = {}  # {user_id: block_until_time}

    def check_message_rate(self, user_id: int) -> bool:
        """Проверяет ограничение на частоту сообщений"""
        last_message = self.db.query(ChatMessage).filter(
            ChatMessage.sender_id == user_id
        ).order_by(ChatMessage.created_at.desc()).first()
        
        if not last_message:
            return True
            
        time_diff = datetime.utcnow() - last_message.created_at
        return time_diff.total_seconds() >= 1  # Минимальный интервал между сообщениями - 1 секунда

    def create_message(self, sender_id: int, content: str, message_type: MessageType = MessageType.CHAT, receiver_id: Optional[int] = None, is_direct_message: bool = False) -> ChatMessage:
        """Создает новое сообщение"""
        # Проверяем ограничение на частоту сообщений
        if not self.check_message_rate(sender_id):
            raise ValueError("Слишком много сообщений. Подождите немного.")

        if len(content) > 200:
            raise HTTPException(status_code=400, detail="Сообщение слишком длинное")

        message = ChatMessage(
            sender_id=sender_id,
            content=content,
            message_type=message_type,
            receiver_id=receiver_id,
            is_direct_message=is_direct_message
        )
        
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        return message

    def get_recent_messages(self, limit: int = 50) -> List[ChatMessage]:
        """Получает последние сообщения"""
        return self.db.query(ChatMessage).order_by(
            ChatMessage.created_at.desc()
        ).limit(limit).all()

    def get_online_users(self) -> List[Dict]:
        """Получает список онлайн пользователей"""
        online_users = self.db.query(User).filter(User.is_online == True).all()
        return [{"id": user.id, "nickname": user.nickname} for user in online_users]

    def format_message(self, message: ChatMessage) -> dict:
        """Форматирует сообщение для отправки клиенту"""
        formatted_message = {
            "id": message.id,
            "type": message.message_type.value,
            "sender": message.sender.username,
            "content": message.content,
            "timestamp": message.created_at.isoformat(),
            "is_direct_message": message.is_direct_message
        }
        
        if message.receiver:
            formatted_message["receiver"] = message.receiver.username
            
        return formatted_message

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"User {user_id} connected. Total connections: {len(self.active_connections)}")  # Добавляем лог

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"User {user_id} disconnected. Total connections: {len(self.active_connections)}")  # Добавляем лог

    async def send_private_message(self, message: dict, sender_id: int, receiver_id: int):
        print(f"Sending private message from {sender_id} to {receiver_id}:", message)  # Добавляем лог
        if sender_id in self.active_connections:
            await self.active_connections[sender_id].send_json({
                "type": "message",
                "message": message
            })
        if receiver_id in self.active_connections:
            await self.active_connections[receiver_id].send_json({
                "type": "message",
                "message": message
            })

    async def broadcast(self, message: dict):
        print("Broadcasting message:", message)  # Добавляем лог
        for connection in self.active_connections.values():
            await connection.send_json(message) 