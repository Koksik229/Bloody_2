import React from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerHUD from './PlayerHUD';
import TopMenu from './TopMenu';
import '../styles/GameScreen.css';
import LocationView from './LocationView';


export default function GameScreen() {
  const { user } = useAuth();

  if (!user) {
    return <div className="game-screen">Загрузка...</div>;
  }

  return (
    <div className="game-screen">
      {/* Главное меню сверху — иконки: инвентарь, навыки, почта, друзья, настройки */}
      <TopMenu />

      {/* Основная информация персонажа: ник, здоровье, мана */}
      <PlayerHUD />
	  
	  {/* Название, описание и кнопки перехода */}
	  <LocationView />


      {/* Фон локации, если есть */}
      {user.location?.background && (
        <div
          className="location-background"
          style={{
            backgroundImage: `url(/images/locations/${user.location.background})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            position: 'absolute',
            height: '25vh',
            width: '65vw',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
          }}
        />
      )}

      
    </div>
  );
}