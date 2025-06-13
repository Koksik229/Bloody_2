from sqlalchemy.orm import Session
from datetime import datetime
from models.user import User
from models.race import Race
from models.location import Location
from models.location_link import LocationLink
from models.level_progression import LevelProgression
from models.race_stats import RaceLevelStat


def get_user_stats(db: Session, user: User):
    stats = db.query(RaceLevelStat).filter(
        RaceLevelStat.race_id == user.race_id,
        RaceLevelStat.level == user.level
    ).first()
    return stats or DummyStats()


class DummyStats:
    def __init__(self):
        self.hp = 30
        self.mp = 10


def get_player_profile(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "Пользователь не найден"}

    user.last_seen = datetime.utcnow()
    db.commit()

    # Получаем расу
    race = db.query(Race).filter(Race.id == user.race_id).first()
    race_name = race.name if race else "Неизвестная раса"

    # Получаем ап и сколько до следующего
    progress_rows = db.query(LevelProgression).filter(LevelProgression.level == user.level).order_by(LevelProgression.ap).all()
    current_ap = 0
    exp_to_next = None
    for i, row in enumerate(progress_rows):
        if row.experience_required <= user.experience:
            current_ap = row.ap
        elif row.experience_required > user.experience and exp_to_next is None:
            exp_to_next = row.experience_required - user.experience

    # Получаем статы по расе и уровню
    stats = db.query(RaceLevelStat).filter(
        RaceLevelStat.race_id == user.race_id,
        RaceLevelStat.level == user.level
    ).first()

    # Локация
    loc = db.query(Location).filter(Location.id == user.location_id).first()
    location_name = loc.name if loc else "Неизвестно"
    location_desc = loc.description if loc else ""
    background = loc.background if loc else ""

    # Доступные переходы
    links = db.query(LocationLink).filter(LocationLink.from_id == user.location_id).all()
    move_list = []
    for link in links:
        target = db.query(Location).filter(Location.id == link.to_id).first()
        if target:
            move_list.append({"id": target.id, "name": target.name})

    return {
        "nickname": user.nickname,
        "level": user.level,
        "ap": current_ap,
        "experience": user.experience,
        "exp_to_next_ap": exp_to_next,
        "race_id": user.race_id,
        "race_name": race_name,
        "hp": stats.hp if stats else 0,
        "mp": stats.mp if stats else 0,
        "strength": stats.strength if stats else 0,
        "agility": stats.agility if stats else 0,
        "power": stats.power if stats else 0,
        "location_id": user.location_id,
        "location_name": location_name,
        "location_desc": location_desc,
        "background": background,
        "available_moves": move_list
    }
