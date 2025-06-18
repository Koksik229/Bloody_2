import React from 'react';
import '../styles/InventoryScreen.css';
import { Item } from './InventoryScreen';

export interface EquipSlot {
  slot_code: string;
  slot_name: string;
  item: Item | null;
}

const RUS_SLOT_NAMES: Record<string,string> = {
  head:'Шлем', neck:'Ожерелье', body:'Броня', legs:'Штаны', boots:'Ботинки', weapon:'Оружие', offhand:'Левая рука', gloves:'Перчатки', ring1:'Кольцо', ring2:'Кольцо', ring3:'Кольцо', ring4:'Кольцо', belt:'Пояс', cloak:'Плащ'};

interface Props {
  equipment: EquipSlot[];
}

const SLOT_POSITIONS: { code: string; className: string }[] = [
  { code: 'head', className: 'slot-head' },
  { code: 'neck', className: 'slot-neck' },
  { code: 'body', className: 'slot-body' },
  { code: 'legs', className: 'slot-legs' },
  { code: 'boots', className: 'slot-boots' },
  { code: 'weapon', className: 'slot-weapon' },
  { code: 'offhand', className: 'slot-offhand' },
  { code: 'gloves', className: 'slot-gloves' },
  { code: 'ring1', className: 'slot-ring1' },
  { code: 'ring2', className: 'slot-ring2' },
  { code: 'ring3', className: 'slot-ring3' },
  { code: 'ring4', className: 'slot-ring4' },
  { code: 'belt', className: 'slot-belt' },
  { code: 'cloak', className: 'slot-cloak' },
];

const EquipmentPanel: React.FC<Props> = ({ equipment }) => {
  return (
    <div className="equipment-panel">
      <img className="avatar" src="/images/avatar-placeholder.png" alt="Avatar" />
      {SLOT_POSITIONS.map((sp) => {
        const slot = equipment.find((e) => e.slot_code === sp.code);
        return (
          <div key={sp.code} className={`equip-slot ${sp.className}`} data-title={slot?.slot_name || RUS_SLOT_NAMES[sp.code] || sp.code}>
            {slot?.item ? (
              <img src={slot.item.icon || '/images/placeholder.svg'} alt={slot.item.name} />
            ) : (
              <span className="empty" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EquipmentPanel;
