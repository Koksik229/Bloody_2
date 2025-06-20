import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Chat.css';

interface Message {
  id: number;
  type: string;
  sender: string;
  content: string;
  timestamp: string;
  is_direct_message: boolean;
  receiver?: string;
  sender_race_color?: string;
}

interface OnlineUser {
  id: number;
  nickname: string;
  race_color?: string;
}

interface UserData {
  id: number;
  username: string;
  nickname: string;
  // ... other fields ...
}

const Chat: React.FC = () => {
  const { user: currentUser, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const [chatHeight, setChatHeight] = useState(30); // Начальная высота в процентах
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Очищаем сообщения при размонтировании компонента
  useEffect(() => {
    return () => {
      setMessages([]);
      processedMessageIds.current.clear();
    };
  }, []);

  // Получаем общее количество пользователей
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/count`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Total users:', data); // Для отладки
        setTotalUsers(data.total);
      } catch (error) {
        console.error('Ошибка при получении количества пользователей:', error);
        setTotalUsers(0); // Устанавливаем 0 в случае ошибки
      }
    };
    fetchTotalUsers();
  }, [token]);

  useEffect(() => {
    if (!currentUser?.id) {
      console.log('No current user, skipping WebSocket connection');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No token found in localStorage');
      return;
    }
    console.log('Token from localStorage:', token);

    const wsUrl = `ws://localhost:8000/ws/${currentUser.id}`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      const authMessage = {
        type: 'authorization',
        token: `Bearer ${token}`
      };
      console.log('Sending auth message:', authMessage);
      websocket.send(JSON.stringify(authMessage));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      
      if (data.type === 'online_users') {
        console.log('Updating online users:', data.users);
        setOnlineUsers(data.users);
      } else if (data.type === 'message') {
        console.log('Message data:', data);
        setMessages(prev => {
          const updated = [...prev, data];
          console.log('Updated messages:', updated);
          return updated;
        });
      } else if (data.type === 'recent_messages') {
        console.log('Recent messages:', data.messages);
        setMessages(data.messages);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    websocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [currentUser?.id]);

  // Добавляем эффект для логирования изменений в messages
  useEffect(() => {
    console.log('Messages state updated:', messages);
  }, [messages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('Message input changed:', value);
    setNewMessage(value);
  };

  const sendMessage = () => {
    console.log('Current message state:', newMessage);
    if (!newMessage.trim() || !ws || !currentUser) {
      console.log('Cannot send message:', { 
        messageEmpty: !newMessage.trim(), 
        wsConnected: !!ws, 
        hasUser: !!currentUser,
        messageLength: newMessage.length,
        messageValue: newMessage
      });
      return;
    }

    console.log('Attempting to send message:', {
      message: newMessage,
      wsState: ws.readyState,
      currentUser: currentUser.nickname
    });

    try {
      const messageData = {
        type: 'message',
        content: newMessage,
        sender: currentUser.nickname,
        sender_id: currentUser.id,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending message data:', messageData);
      ws.send(JSON.stringify(messageData));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startPrivateChat = (nickname: string) => {
    setSelectedUser(nickname);
    setIsPrivateChat(true);
  };

  const adjustChatHeight = (amount: number) => {
    setChatHeight(prev => Math.max(10, Math.min(70, prev + amount)));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isDirectMessage = message.content.startsWith('to ');
    let messageContent = message.content;
    let receiverNickname = '';
    
    if (isDirectMessage) {
      const match = message.content.match(/^to\s+([^:]+):\s*(.*)/);
      if (match) {
        receiverNickname = match[1];
        messageContent = match[2];
      }
    }
    
    // Находим получателя в списке онлайн пользователей
    const receiver = onlineUsers.find(user => user.nickname === receiverNickname);
    const receiverColor = receiver ? receiver.race_color : '#808080';
    
    return (
      <div className="message">
        <div className="message-header">
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="message-sender" style={{ color: message.sender_race_color || '#4CAF50' }}>
            {message.sender}:
          </span>
          {isDirectMessage && (
            <>
              <span>to </span>
              <span 
                className="message-receiver" 
                style={{ color: receiverColor }}
              >
                {receiverNickname}:
              </span>
            </>
          )}
          <span className="message-content">
            {messageContent}
          </span>
        </div>
      </div>
    );
  };

  const handleUserClick = (username: string) => {
    if (inputRef.current) {
      inputRef.current.value = `to ${username}: `;
      inputRef.current.focus();
    }
  };

  return (
    <div className="chat-container" style={{ height: `${chatHeight}%` }}>
      <div className="chat-header">
        <div className="chat-resize-controls">
          <button 
            className="resize-button"
            onClick={() => adjustChatHeight(5)}
            title="Увеличить высоту"
          >
            ▲
          </button>
          <button 
            className="resize-button"
            onClick={() => adjustChatHeight(-5)}
            title="Уменьшить высоту"
          >
            ▼
          </button>
        </div>
      </div>
      <div className="chat-main">
        <div className="messages-container">
          {messages.length > 0 ? (
            messages.map(renderMessage)
          ) : (
            <div className="no-messages">Нет сообщений</div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="online-users">
          <div className="online-users-header">
            Онлайн ({onlineUsers.length}) / {totalUsers}
          </div>
          <div className="online-users-list">
            {onlineUsers.map(user => (
              <div 
                key={user.id} 
                className="online-user"
                onClick={() => handleUserClick(user.nickname)}
                style={{ color: user.race_color || '#4CAF50' }}
              >
                {user.nickname}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="chat-input">
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
        />
        <button onClick={sendMessage}>
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat; 