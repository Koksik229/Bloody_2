import React from 'react';
import SkillsDesign from '@/pages/Skills';
import '../styles/skills-vars.css';
import '../styles/skills.css';

/**
 * Wrapper around standalone Skills design.
 * Hides global chrome (header, full-screen background) and shows only the core block.
 */
interface Props { onBack?: () => void; }
export default function SkillsBlock({ onBack }: Props) {
  return (
    <div className="skills-only">
      <SkillsDesign onBack={onBack} />
    </div>
  );
}
