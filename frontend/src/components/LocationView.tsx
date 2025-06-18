import React from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/LocationView.css";

const LocationView: React.FC = () => {
  const { user, setUser } = useAuth();

  if (!user) return null;

  const handleMove = async (locationId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/location/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ location_id: locationId })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.warn("Не удалось перейти в новую локацию");
      }
    } catch (error) {
      console.error("Ошибка при переходе:", error);
    }
  };

  return (
    <div className="location-view">
      {/* Кнопки над фоном для type_id = 1 */}
      {user.location?.type_id === 1 && (user.available_locations ?? []).length > 0 && (
        <div className="move-buttons move-buttons-top">
          {(user.available_locations ?? []).map((move: {id: number, name: string, is_locked?: boolean}) => (
            <button key={move.id} onClick={() => handleMove(move.id)}>
              Перейти в {move.name}
            </button>
          ))}
        </div>
      )}
      <h2>{user.location?.name}</h2>
      <p>{user.location?.description}</p>
      {/* Кнопки под фоном для type_id = 2 */}
      {user.location?.type_id === 2 && (user.available_locations ?? []).length > 0 && (
        <div className="move-buttons move-buttons-bottom">
          {(user.available_locations ?? []).map((move: {id: number, name: string, is_locked?: boolean}) => (
            <button key={move.id} onClick={() => handleMove(move.id)}>
              Перейти в {move.name}
            </button>
          ))}
        </div>
      )}
      {/* Для остальных типов — как раньше */}
      {![1,2].includes(user.location?.type_id ?? 0) && (
        <div className="move-buttons">
          {(user.available_locations ?? []).map((move: {id: number, name: string, is_locked?: boolean}) => (
            <button key={move.id} onClick={() => handleMove(move.id)}>
              Перейти в {move.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationView;