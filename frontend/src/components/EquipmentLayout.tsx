import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/EquipmentLayout.css';
import { EquipSlot } from './EquipmentPanel';

interface Props {
  equipment: EquipSlot[];
  onUnequip: (slotCode:string)=>void;
}

// Map backend slot_code to prototype class names
const SLOT_CLASS_MAP: Record<string, string> = {
  crossbow: 'slot-crossbow',
  dart: 'slot-dart',
  helm: 'slot-helm',
  cape: 'slot-cape',
  shield: 'slot-shield',
  armor: 'slot-armor',
  boots: 'slot-boots',
  necklace: 'slot-necklace',
  gloves: 'slot-gloves',
  weapon_main: 'slot-shield',  // now left hand
  weapon_off: 'slot-weapon', // now right hand
  cloak: 'slot-cloak',
  belt: 'slot-belt',
};

// fallback RU names
const SLOT_RU:Record<string,string>={
  crossbow:'Арбалет',dart:'Дротик',helm:'Шлем',cape:'Наручи',shield:'Щит',armor:'Доспех',boots:'Сапоги',necklace:'Ожерелье',gloves:'Перчатки',weapon_main:'Правая рука',weapon_off:'Левая рука',cloak:'Плащ',belt:'Пояс',ring1:'Кольцо 1',ring2:'Кольцо 2',ring3:'Кольцо 3',ring4:'Кольцо 4'};

// RU labels for stats
const STAT_RU:Record<string,string>={
  str:'Сила', strength:'Сила',
  agi:'Ловкость', agility:'Ловкость',
  int:'Интеллект', intelligence:'Интеллект',
  vit:'Выносливость', stamina:'Выносливость',
  min_damage:'Мин. урон', max_damage:'Макс. урон',
  dmg_min:'Мин. урон', dmg_max:'Макс. урон',
  attack:'Атака', atk:'Атака',
  defence:'Защита', defense:'Защита', armor:'Защита',
  crit:'Крит', crit_chance:'Крит',
  hp:'Здоровье', health:'Здоровье',
  mp:'Мана', mana:'Мана',
  intuition:'Интуиция', power:'Мощь',
};

const EquipmentLayout: React.FC<Props> = ({ equipment, onUnequip }) => {
  const [tooltip, setTooltip] = useState<{visible:boolean;item?:EquipSlot['item'];text?:string;x:number;y:number}>({visible:false,x:0,y:0});

  function handleEnter(e:React.MouseEvent, item?:EquipSlot['item'], text?:string){
    setTooltip({visible:true,item,text,x:e.clientX+12,y:e.clientY+12});
  }
  function handleMove(e:React.MouseEvent){
    setTooltip(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}));
  }
  function handleLeave(){setTooltip(prev=>({...prev,visible:false}));}

  return (
    <div className="equipment-panel-container select-none">
      <div className="character-preview" />
      {/* main standalone slots */}
      {Object.entries(SLOT_CLASS_MAP).map(([code, cls]) => {
        const slot = equipment.find((e) => e.slot_code === code);
        return (
          <div
            key={code}
            className={`item-slot ${cls}`}
            onClick={()=> slot?.item && onUnequip(code)}
            onMouseEnter={(e)=>handleEnter(e, slot?.item, slot?.slot_name || SLOT_RU[code] || code)}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
          >
            {slot?.item && (
              <img
                src={slot.item.icon?.startsWith('/')? slot.item.icon: `/icons/items/${slot.item.icon}`}
                alt={slot.item.name}
                style={{width:'100%',height:'100%',objectFit:'contain'}}
              />
            )}
          </div>
        );
      })}
      {/* spell slots 3×3 */}
      <div className="spell-slots-container">
        {Array.from({ length: 9 }).map((_, i) => {
          const code = `spell${i+1}`;
          const slot = equipment.find((e) => e.slot_code === code);
          const nameFallback = SLOT_RU[code] || `Свиток ${i+1}`;
          return (
            <div
              key={code}
              className={`item-slot spell-slot-${i+1}`}
              onClick={() => slot?.item && onUnequip(code)}
              onMouseEnter={(e) => handleEnter(e, slot?.item, slot?.slot_name || nameFallback)}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
            >
              {slot?.item && (
                <img
                  src={slot.item.icon?.startsWith('/')? slot.item.icon: `/icons/items/${slot.item.icon}`}
                  alt={slot.item.name}
                  style={{width:'100%',height:'100%',objectFit:'contain'}}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ring slots 2×2 */}
      <div className="ring-slots-container">
        {['ring1','ring2','ring3','ring4'].map((code, idx) => {
          const slot = equipment.find((e) => e.slot_code === code);
          return (
            <div
              key={code}
              className={`item-slot ring-slot-${idx+1}`}
              onClick={() => slot?.item && onUnequip(code)}
              onMouseEnter={(e) => handleEnter(e, slot?.item, slot?.slot_name || SLOT_RU[code] || code)}
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
            >
              {slot?.item && (
                <img
                  src={slot.item.icon?.startsWith('/')? slot.item.icon: `/icons/items/${slot.item.icon}`}
                  alt={slot.item.name}
                  style={{width:'100%',height:'100%',objectFit:'contain'}}
                />
              )}
            </div>
          );
        })}
      </div>

      {tooltip.visible && createPortal(
        <div className="equip-tooltip fixed z-50 text-sm leading-tight bg-bw-card-bg border border-bw-border rounded p-2 shadow-lg max-w-xs" style={{top:tooltip.y,left:tooltip.x, pointerEvents:'none', whiteSpace:'normal', wordBreak:'break-word'}}>
          {tooltip.item? (
            <>
              <div className="font-bold text-center mb-1">{tooltip.item.name}</div>
              {tooltip.item.min_level!==undefined && (
                <div>Требуемый уровень: <span className="text-bw-accent-gold">{tooltip.item.min_level}</span></div>
              )}
              {tooltip.item.durability_max && (
                <div>Прочность: {tooltip.item.durability_cur ?? tooltip.item.durability_max}/{tooltip.item.durability_max}</div>
              )}
              {/* bonuses */}
              {tooltip.item.effects && Object.entries(tooltip.item.effects).map(([stat,val])=> (
                <div key={stat}>+{val} {STAT_RU[stat.toLowerCase()] ?? stat}</div>
              ))}
              {tooltip.item.base_stats && Object.entries(tooltip.item.base_stats).map(([stat,val])=> (
                <div key={stat}>+{val} {STAT_RU[stat.toLowerCase()] ?? stat}</div>
              ))}
              {tooltip.item.description && (
                <div className="italic text-gray-400 mt-1">{tooltip.item.description}</div>
              )}
            </>
          ) : (
            <>{tooltip.text}</>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default EquipmentLayout;
