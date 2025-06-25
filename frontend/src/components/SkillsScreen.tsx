import React from 'react';
import TopMenu from './TopMenu';
import SkillsBlock from './SkillsBlock';

import '../styles/SkillsScreen.css';

interface Props {
  onClose: () => void;
  onInventory?: () => void;
}

const SkillsScreen: React.FC<Props> = ({ onClose, onInventory }) => {
  return (
    <div className="skills-screen">
      {/* фиксированное верхнее меню */}
      <TopMenu onSkills={onClose} onInventory={onInventory} />

      {/* Центрированный блок навыков */}
      <div className="game-body">
      <div className="skills-container">
        <SkillsBlock onBack={onClose} />
      </div>

    </div>
  </div>
  );
};

export default SkillsScreen;
