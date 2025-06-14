import React from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/LocationView.css";

const LocationView: React.FC = () => {
  const { user, setUser } = useAuth();

  if (!user) return null;

  const handleMove = async (locationId: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/move`, {
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
      <h2>{user.location_name}</h2>
      <p>{user.location_desc}</p>
      <div className="move-buttons">
        {user.available_moves?.map((move) => (
          <button key={move.id} onClick={() => handleMove(move.id)}>
            Перейти в {move.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationView;