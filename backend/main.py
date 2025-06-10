from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в Кровавый Мир 2.0"}
