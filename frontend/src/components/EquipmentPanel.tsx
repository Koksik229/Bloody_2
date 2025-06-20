import React, { useState } from 'react';
import '../styles/InventoryScreen.css';
import { Item } from './InventoryScreen';

export interface EquipSlot {
  slot_code: string;
  slot_name: string;
  item: Item | null;
}

const RUS_SLOT_NAMES: Record<string, string> = {
  crossbow: 'Арбалет',
  
  hand: 'Наруч',
  head: 'Шлем',
  amulet: 'Амулет',
  body: 'Броня',
  legs: 'Штаны',
  boots: 'Ботинки',
  weapon: 'Оружие',
  offhand: 'Левая рука',
  gloves: 'Перчатки',
  cloak: 'Плащ',
  belt: 'Пояс',
  ring1: 'Кольцо',
  ring2: 'Кольцо',
  ring3: 'Кольцо 3',
  ring4: 'Кольцо 4',
  weapon2: 'Второе оружие',
  arrows: 'Стрелы',
  magic1: 'Магический камень',
  magic2: 'Магический камень',
  magic3: 'Магический камень',
  magic4: 'Магический камень',
  magic5: 'Магический камень',
  magic6: 'Магический камень',
  magic7: 'Магический камень',
  magic8: 'Магический камень',
  magic9: 'Магический камень',
};

interface Props {
  equipment: EquipSlot[];
}

interface SlotPos { code: string; className: string; sizeClass?: string; }

const SLOT_POSITIONS: SlotPos[] = [
  // top row
  { code: 'crossbow', className: 'slot-crossbow', sizeClass: 's88x85' },
  { code: 'arrows', className: 'slot-arrows', sizeClass: 's70x85' },
  { code: 'head', className: 'slot-head', sizeClass: 's80x85' },
  { code: 'magic1', className: 'slot-magic1', sizeClass: 's28x15' },
  { code: 'magic2', className: 'slot-magic2', sizeClass: 's28x15' },
  { code: 'magic3', className: 'slot-magic3', sizeClass: 's28x15' },
  // second row
  { code: 'hand', className: 'slot-hand', sizeClass: 's54x43' },
  { code: 'neck', className: 'slot-neck' },
  { code: 'magic4', className: 'slot-magic4', sizeClass: 's28x15' },
  { code: 'magic5', className: 'slot-magic5', sizeClass: 's28x15' },
  { code: 'magic6', className: 'slot-magic6', sizeClass: 's28x15' },
  // third row
  { code: 'weapon', className: 'slot-weapon', sizeClass: 's54x69' },
  { code: 'weapon2', className: 'slot-weapon2', sizeClass: 's102x140' },
  { code: 'gloves', className: 'slot-gloves', sizeClass: 's102x76' },
  { code: 'amulet', className: 'slot-amulet', sizeClass: 's102x76' },
  { code: 'magic7', className: 'slot-magic7', sizeClass: 's28x15' },
  { code: 'magic8', className: 'slot-magic8', sizeClass: 's28x15' },
  { code: 'magic9', className: 'slot-magic9', sizeClass: 's28x15' },
  // fourth row (avatar mid)
  { code: 'body', className: 'slot-body', sizeClass: 's54x59' },
  { code: 'offhand', className: 'slot-offhand', sizeClass: 's54x69' },
  // fifth row
  { code: 'boots', className: 'slot-boots', sizeClass: 's70x70' },
  { code: 'cloak', className: 'slot-cloak', sizeClass: 's102x120' },
  // rings and belt rows
  { code: 'ring1', className: 'slot-ring1', sizeClass: 's54x38' },
  { code: 'ring2', className: 'slot-ring2', sizeClass: 's54x38' },
  { code: 'belt', className: 'slot-belt', sizeClass: 's85x76' },
  { code: 'ring3', className: 'slot-ring3', sizeClass: 's54x38' },
  { code: 'ring4', className: 'slot-ring4', sizeClass: 's54x38' },
];

const EquipmentPanel: React.FC<Props> = ({ equipment }) => {
  const [tooltip, setTooltip] = useState<{visible:boolean;text:string;x:number;y:number}>({visible:false,text:'',x:0,y:0});

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>, text: string) => {
    setTooltip({visible:true,text,x:e.clientX+12,y:e.clientY+12});
  };
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setTooltip(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}));
  };
  const handleLeave = () => setTooltip(prev=>({...prev,visible:false}));
  return (
    <div className="equipment-panel">
      <img className="avatar" src="/images/avatar-placeholder.png" alt="Avatar" />
      {SLOT_POSITIONS.map((sp) => {
        const slot = equipment.find((e) => e.slot_code === sp.code);
        return (
          <div
            key={sp.code}
            className={`equip-slot ${sp.className} ${sp.sizeClass ?? ''}`}
            onMouseEnter={(e)=>handleEnter(e, slot?.slot_name || RUS_SLOT_NAMES[sp.code] || sp.code)}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
          >
            {slot?.item ? (
              <img src={slot.item.icon || '/images/placeholder.svg'} alt={slot.item.name} />
            ) : (
              <span className="empty" />
            )}
          </div>
        );
      })}
      {tooltip.visible && (
        <div className="equip-tooltip" style={{ top: tooltip.y, left: tooltip.x }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default EquipmentPanel;
