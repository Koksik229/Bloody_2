import React from "react";
import "../styles/GameScreen.css";

const icons = [
  { name: "Инвентарь", src: "/icons/inventory.svg" },
  { name: "Навыки", src: "/icons/skills.svg" },
  { name: "Друзья", src: "/icons/friends.svg" },
  { name: "Почта", src: "/icons/mail.svg" },
  { name: "Настройки", src: "/icons/settings.svg" },
  { name: "Выход", src: "/icons/logout.svg" }
];

const TopMenu: React.FC = () => {
  return (
    <div className="game-icons">
      {icons.map((icon) => (
        <button
          key={icon.name}
          className="menu-icon"
          onClick={() => console.log("Открыть: " + icon.name)}
          title={icon.name}
        >
          <img src={icon.src} alt={icon.name} />
        </button>
      ))}
    </div>
  );
};

export default TopMenu;