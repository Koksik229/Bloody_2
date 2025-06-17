from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from db import Base

class MessageType(str, Enum):
    CHAT = "CHAT"
    PRIVATE = "PRIVATE"
    SYSTEM = "SYSTEM"

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    message_type = Column(SQLEnum(MessageType))
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    is_direct_message = Column(Boolean, default=False)  # True если сообщение адресовано конкретному игроку

    # Отношения
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "message_type": self.message_type.value,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "sender_nickname": self.sender.nickname if self.sender else None,
            "receiver_nickname": self.receiver.nickname if self.receiver else None,
            "sender_race_color": self.sender.race.chat_color if self.sender and self.sender.race else "#4CAF50"
        } 