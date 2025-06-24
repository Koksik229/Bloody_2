import React from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/LocationView.css";
import ShopCatalog from './ShopCatalog';

const LocationView: React.FC = () => {
  const { user, fetchUser } = useAuth();

  if (!user) return null;

  const handleMove = async (locationId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/location/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ location_id: locationId })
      });

      if (res.ok) {
        // После успешного перехода запрашиваем обновлённый профиль,
        // чтобы получить актуальные данные локации и очки.
        await fetchUser();
      } else {
        console.warn("Не удалось перейти в новую локацию");
      }
    } catch (error) {
      console.error("Ошибка при переходе:", error);
    }
  };

  const [tooltip, setTooltip] = React.useState<{text: string; x: number; y: number; visible: boolean}>({text: '', x: 0, y: 0, visible: false});

  const handleTooltip = (visible: boolean, text: string, e?: React.MouseEvent) => {
    if (visible && e) {
      setTooltip({text, x: e.clientX + 12, y: e.clientY + 12, visible: true});
    } else {
      setTooltip(t => ({...t, visible: false}));
    }
  };

  const renderMoveButtons = () => {
    let moves = user.available_locations ?? [];

    // Специальное упорядочивание и ярлыки для различных локаций
    if (user.location?.name === 'Городская площадь') {
      const order = [
        'Площадь шахтёров',
        'Магазин',
        'Лавка Гендальфа',
        'Рынок',
        'Королевская лавка',
        'Дом',
        'Тёмная улица'
      ];
      moves = order
        .map(name => moves.find(m => m.name === name))
        .filter(Boolean) as typeof moves;
    } else if (user.location?.name === 'Площадь шахтёров') {
      const order = ['Рыбалка', 'Городская площадь'];
      moves = order
        .map(name => moves.find(m => m.name === name))
        .filter(Boolean) as typeof moves;
    } else if (user.location?.name === 'Тёмная улица') {
      const order = ['Городская площадь', 'Кузница', 'Портал Битв', 'Охота'];
      moves = order.map(name => moves.find(m => m.name === name)).filter(Boolean) as typeof moves;
    } else if (user.location?.name === 'Охота') {
      const order = ['Тёмная улица'];
      moves = order.map(name => moves.find(m => m.name === name)).filter(Boolean) as typeof moves;
    }

    return moves.map(move => {
      let label: React.ReactNode = move.name;

      // Ярлыки стрелок
      if (user.location?.name === 'Городская площадь') {
        if (move.name === 'Площадь шахтёров') label = '←';
        else if (move.name === 'Тёмная улица') label = '→';
      } else if (user.location?.name === 'Площадь шахтёров') {
        if (move.name === 'Рыбалка') label = '←';
        else if (move.name === 'Городская площадь') label = '→';
      } else if (user.location?.name === 'Тёмная улица') {
        if (move.name === 'Городская площадь') label = '←';
        else if (move.name === 'Охота') label = '→';
      } else if (user.location?.name === 'Охота') {
        if (move.name === 'Тёмная улица') label = '←';
      }

      const isArrow = label === '←' || label === '→';

      const commonProps = {
        key: move.id,
        onClick: () => { handleTooltip(false, ''); handleMove(move.id); },
      } as React.ButtonHTMLAttributes<HTMLButtonElement>;

      if (isArrow) {
        return (
          <button
            {...commonProps}
            onMouseEnter={e => handleTooltip(true, move.name, e)}
            onMouseMove={e => handleTooltip(true, move.name, e)}
            onMouseLeave={() => handleTooltip(false, '')}
          >
            {label}
          </button>
        );
      }

      return <button {...commonProps}>{label}</button>;
    });
  };

  return (
    <div className={`location-view ${user.location?.type_id === 1 ? 'type1' : ''}`}>
      {/* Кнопки над фоном для type_id = 1 */}
      {user.location?.type_id === 1 && (
        <div className="move-buttons move-buttons-top">
          {renderMoveButtons()}
        </div>
      )}

      <h2>{user.location?.name}</h2>
      <p>{user.location?.description}</p>

      {/* Кнопки под фоном для type_id = 2 */}
      {user.location?.type_id === 2 && (
        <div className="move-buttons move-buttons-bottom">
          {renderMoveButtons()}
        </div>
      )}

      {/* Для остальных типов — по центру */}
      {![1, 2].includes(user.location?.type_id ?? 0) && (
        <div className="move-buttons">
          {renderMoveButtons()}
        </div>
      )}
      {tooltip.visible && (
        <div
          className="move-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            pointerEvents: 'none',
            background: 'rgba(40,40,40,0.95)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: '14px',
            zIndex: 999,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.text}
        </div>
      )}
      {user.location?.name === 'Магазин' && <ShopCatalog />}
    </div>
  );
};

export default LocationView;