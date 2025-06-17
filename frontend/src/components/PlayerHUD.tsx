import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/PlayerHUD.css';

export default function PlayerHUD() {
  const { user } = useAuth();

  useEffect(() => {
    console.log("PlayerHUD отрисовался");
    console.log("User:", user);
  }, [user]);

  if (!user) {
    return <div className="player-hud">Загрузка данных игрока...</div>;
  }

  // Вычисляем проценты для баров
  const hpPercent = Math.min(100, Math.max(0, (user.hp / 100) * 100));
  const mpPercent = Math.min(100, Math.max(0, (user.mp / 100) * 100));

  // Определяем цвет HP бара в зависимости от количества здоровья
  const getHpBarColor = () => {
    if (hpPercent > 60) return '#00cc00'; // Зеленый для высокого HP
    if (hpPercent > 30) return '#cccc00'; // Желтый для среднего HP
    return '#cc0000'; // Красный для низкого HP
  };

  return (
    <div className="player-hud">
      <div className="nickname-row">
        <span className="nickname">{user.nickname}</span>
        <span className="info-icon" title="Информация персонажа">[i]</span>
      </div>
      <div className="bars-container">
        <div className="bar-container">
          <div className="bar-outer hp-bar">
            <div
              className="bar-inner"
              style={{ 
                height: `${hpPercent}%`,
                backgroundColor: getHpBarColor()
              }}
            />
          </div>
          <div className="bar-value">{user.hp}</div>
        </div>
        <div className="bar-container">
          <div className="bar-outer mp-bar">
            <div
              className="bar-inner"
              style={{ height: `${mpPercent}%` }}
            />
          </div>
          <div className="bar-value">{user.mp}</div>
        </div>
      </div>
    </div>
  );
}