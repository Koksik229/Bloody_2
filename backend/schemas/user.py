from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=50)
    password: constr(min_length=8)
    email: EmailStr
    nickname: constr(min_length=3, max_length=50)
    race_id: int

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    nickname: str
    level: int
    experience: int
    race_id: int
    location_id: int
    is_active: bool

    class Config:
        from_attributes = True 