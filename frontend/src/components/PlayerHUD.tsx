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

  return (
    <div className="player-hud">
      <div className="nickname-row">
        <span className="nickname">{user.nickname}</span>
        <span className="info-icon" title="Информация персонажа">[i]</span>
      </div>
      <div className="bar-container">
        <div className="bar-label">HP</div>
        <div className="bar-outer hp-bar">
          <div
            className="bar-inner"
            style={{ height: `${(user.hp / 100) * 100}%` }}
          />
        </div>
      </div>
      <div className="bar-container">
        <div className="bar-label">MP</div>
        <div className="bar-outer mp-bar">
          <div
            className="bar-inner"
            style={{ height: `${(user.mp / 100) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}