import React, { useState } from "react";
import "../styles/GameScreen.css";
import { useAuth } from "../context/AuthContext";

const icons = [
  { name: "Инвентарь", src: "/icons/inventory.png" },
  { name: "Навыки", src: "/icons/skills.png" },
  { name: "Друзья", src: "/icons/friends.png" },
  { name: "Почта", src: "/icons/mail.png" },
  { name: "Настройки", src: "/icons/settings.png" },
  { name: "Выход", src: "/icons/logout.png" }
];

const TopMenu: React.FC = () => {
  const { logout } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="game-icons">
      {icons.map((icon) => (
        <button
          key={icon.name}
          className="menu-icon"
          onClick={() => {
            if (icon.name === "Выход") {
              logout();
            } else {
              console.log("Открыть: " + icon.name);
            }
          }}
          onMouseEnter={() => setHovered(icon.name)}
          onMouseLeave={() => setHovered(null)}
        >
          <img src={icon.src} alt={icon.name} />
          {hovered === icon.name && (
            <div className="menu-tooltip">{icon.name}</div>
          )}
        </button>
      ))}
    </div>
  );
};

export default TopMenu;