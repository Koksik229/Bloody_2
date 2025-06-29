import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/PlayerHUD.css';

interface PlayerHUDProps {
  style?: React.CSSProperties;
  floating?: boolean;
}

export default function PlayerHUD({ style, floating = true }: PlayerHUDProps) {
  const { user } = useAuth();

  useEffect(() => {
    console.log("PlayerHUD отрисовался");
    console.log("User:", user);
  }, [user]);

  if (!user) {
    return <div className="player-hud" style={style}>Загрузка данных игрока...</div>;
  }

  // Вычисляем проценты для баров
  const hpPercent = user.max_hp ? Math.min(100, Math.max(0, (user.hp / user.max_hp) * 100)) : 0;
  const mpPercent = user.max_mp ? Math.min(100, Math.max(0, (user.mp / user.max_mp) * 100)) : 0;

  // Цвета баров
  const hpColor = '#cc0000';
  const mpColor = '#0066cc';

    const combinedStyle: React.CSSProperties = {
    ...(floating ? {} : { position: 'static', left: undefined, top: undefined, transform: 'none' }),
    ...style,
  };

  return (
    <div className="player-hud" style={combinedStyle}>
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
                backgroundColor: hpColor
              }}
            />
          </div>
          <div className="bar-value">{user.hp}</div>
        </div>
        <div className="bar-container">
          <div className="bar-outer mp-bar">
            <div
              className="bar-inner"
              style={{ height: `${mpPercent}%`, backgroundColor: mpColor }}
            />
          </div>
          <div className="bar-value">{user.mp}</div>
        </div>
      </div>
    </div>
  );
}