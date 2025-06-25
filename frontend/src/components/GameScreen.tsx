import React from 'react';
import { useAuth } from '../context/AuthContext';
import PlayerHUD from './PlayerHUD';
import TopMenu from './TopMenu';
import InventoryScreen from './InventoryScreen';
import '../styles/GameScreen.css';
import LocationView from './LocationView';
import SkillsScreen from './SkillsScreen';

export default function GameScreen() {
  const [showInventory, setShowInventory] = React.useState(false);
  const [showSkills, setShowSkills] = React.useState(false);
  const { user } = useAuth();

  // Рассчитываем позицию HUD в зависимости от типа локации
  const hudStyle: React.CSSProperties | undefined = (() => {
    if (!user?.location) return undefined;
    if (user.location.type_id === 1) {
      // Фон слева: left 16%, ширина 42vw; HUD 5px левее
      return {
        left: `calc(16% - 85px)`,
        top: 'calc(50% - 100px)',
        transform: 'translateY(-50%)',
      };
    }
    if (user.location.type_id === 2) {
      // Фон центрирован, левый край: 50% - 43vw/2
      return {
        left: `calc(50% - 43vw/2 - 85px)`,
        top: '40%',
        transform: 'translateY(-50%)',
      };
    }
    return undefined;
  })();

  if (!user) {
    return <div className="game-screen">Загрузка...</div>;
  }

  if (showInventory) {
    return <InventoryScreen onClose={() => setShowInventory(false)} onSkills={() => { setShowInventory(false); setShowSkills(true); }} />;
  }

  if (showSkills) {
    return <SkillsScreen onClose={() => setShowSkills(false)} onInventory={() => { setShowSkills(false); setShowInventory(true); }} />;
  }


  return (
    <div className="game-screen">
      {/* Главное меню сверху — иконки: инвентарь, навыки, почта, друзья, настройки */}
      <TopMenu onInventory={() => setShowInventory(true)} onSkills={() => setShowSkills(true)} />

      <div className="game-body">
      {/* Основная информация персонажа: ник, здоровье, мана */}
      <PlayerHUD style={hudStyle} />
	  
	  {/* Название, описание и кнопки перехода */}
	  <LocationView />

      {/* Фон локации, если есть */}
      {user.location?.background && (
        <div
          className="location-background"
          style={
            user.location.type_id === 1
              ? {
                  backgroundImage: `url(/images/locations/${user.location.background})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center left',
                  position: 'absolute',
                  height: '33vh',
                  width: '42vw',
                  top: 'calc(50% - 100px)',
                  left: '16%',
                  transform: 'translateY(-50%)',
                  zIndex: 0,
                }
              : {
                  backgroundImage: `url(/images/locations/${user.location.background})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  position: 'absolute',
                  height: '40vh',
                  width: '43vw',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                }
          }
        />
      )}

      </div>

      {/* Skills overlay */}
      {showSkills && (
        <SkillsScreen onClose={() => setShowSkills(false)} />
      )}

      {/* Чат */}
    </div>
  );
}