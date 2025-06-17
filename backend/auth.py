from fastapi import Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from db import get_db
from models.user import User
import json
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Константы для JWT
SECRET_KEY = "your-secret-key-here"  # В продакшене используйте безопасный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Настройка для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    try:
        # Convert user_id to string if it exists
        if "sub" in to_encode:
            to_encode["sub"] = str(to_encode["sub"])
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Created token: {encoded_jwt[:10]}...")  # Логируем только начало токена
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating token: {str(e)}")
        raise

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    logger.info(f"get_current_user called with token: {token[:10]}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        logger.info("Attempting to decode JWT token...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Token decoded successfully. Payload: {payload}")
        
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("No user_id found in token payload")
            raise credentials_exception
            
        # Convert string user_id to int for database query
        user_id = int(user_id)
        logger.info(f"Looking up user with id: {user_id}")
        user = db.query(User).filter(User.id == user_id).first()
        
        if user is None:
            logger.warning(f"User not found for id: {user_id}")
            raise credentials_exception
            
        logger.info(f"User found: {user.nickname}")
        return user
        
    except JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Unexpected error in get_current_user: {str(e)}")
        raise credentials_exception

async def get_current_user_ws(token: str, db: Session) -> Optional[User]:
    try:
        if not token:
            logger.warning("No token provided to get_current_user_ws")
            return None
            
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
            
        logger.info(f"Processing token: {token[:10]}...")  # Логируем только начало токена для безопасности
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                logger.warning("No user_id in token payload")
                return None
                
            # Convert string user_id to int for database query
            user_id = int(user_id)
            user = db.query(User).filter(User.id == user_id).first()
            if user is None:
                logger.warning(f"User not found for id: {user_id}")
                return None
                
            return user
        except JWTError as e:
            logger.error(f"JWT decode error: {str(e)}")
            return None
            
    except Exception as e:
        logger.error(f"Error in get_current_user_ws: {str(e)}")
        return None 