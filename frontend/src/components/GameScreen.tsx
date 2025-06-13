import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function GameScreen() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h2>Добро пожаловать, {user?.nickname}</h2>
      <p>Уровень: {user?.level}</p>
      <p>HP: {user?.hp} | MP: {user?.mp}</p>
      <p>Локация: {user?.location_id}</p>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}
