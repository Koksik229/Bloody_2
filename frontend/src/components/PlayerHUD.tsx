import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/PlayerHUD.css';

interface PlayerHUDProps {
  style?: React.CSSProperties;
  floating?: boolean;
}

export default function PlayerHUD({ style, floating = true }: PlayerHUDProps) {
  const { user, token, setUser } = useAuth();
  const [dispHp, setDispHp] = useState<number>(user?.hp ?? 0);
  const [dispMp, setDispMp] = useState<number>(user?.mp ?? 0);
  const latestStats = useRef({maxHp: user?.max_hp ?? 0, maxMp: user?.max_mp ?? 0});

  useEffect(() => {
    if (!user) return;
    setDispHp(user.hp);
    setDispMp(user.mp);
    // локальный таймер анимации 1 сек
    const tick = setInterval(() => {
      setDispHp(prev => {
        const {maxHp} = latestStats.current;
        if (!maxHp) return prev;
        const inc = maxHp / 300;
        return prev < maxHp ? Math.min(maxHp, prev + inc) : prev;
      });
      setDispMp(prev => {
        const {maxMp} = latestStats.current;
        if (!maxMp) return prev;
        const inc = maxMp / 600;
        return prev < maxMp ? Math.min(maxMp, prev + inc) : prev;
      });
    }, 1000);

    // первичная синхронизация сразу
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/vital`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      }).then(r=>r.json()).then(data=>{
        setDispHp(data.hp);
        setDispMp(data.mp);
        // обновляем глобальный user, чтобы другие компоненты тоже увидели коррекцию
        setUser(prev=> prev ? {...prev, hp:data.hp, mp:data.mp} : prev);
      }).catch(()=>{});
    }

        return () => { clearInterval(tick); };
  }, [token]);

  // Обновляем ref и дисплеи на новое значение
  useEffect(()=>{
    if (user){
      latestStats.current = {maxHp: user.max_hp, maxMp: user.max_mp};
      setDispHp(user.hp);
      setDispMp(user.mp);
    }
  }, [user]);

  if (!user) {
    return <div className="player-hud" style={style}>Загрузка данных игрока...</div>;
  }

  // Вычисляем проценты для баров
  const hpPercent = user && user.max_hp ? Math.min(100, (dispHp / user.max_hp) * 100) : 0;
  const mpPercent = user && user.max_mp ? Math.min(100, (dispMp / user.max_mp) * 100) : 0;

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
          <div className="bar-value">{Math.floor(dispHp)}</div>
        </div>
        <div className="bar-container">
          <div className="bar-outer mp-bar">
            <div
              className="bar-inner"
              style={{ height: `${mpPercent}%`, backgroundColor: mpColor }}
            />
          </div>
          <div className="bar-value">{Math.floor(dispMp)}</div>
        </div>
      </div>
    </div>
  );
}