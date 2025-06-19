import React, { useEffect, useState } from 'react';
import '../styles/InventoryScreen.css';
import { useAuth } from '../context/AuthContext';
import EquipmentPanel, { EquipSlot } from './EquipmentPanel';
import TopMenu from './TopMenu';

export interface Item {
  id: number;
  name: string;
  icon?: string;
  durability_cur?: number;
  durability_max?: number;
  enhance_level: number;
}

interface ItemGroup {
  id: number;
  code: string;
  name: string;
  items: Item[];
}
interface Category {
  id: number;
  code: string;
  name: string;
  groups: ItemGroup[];
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Props {
  onClose: () => void;
}

const InventoryScreen: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<EquipSlot[]>([]);
  const [activeCat, setActiveCat] = useState<string>('weapon');
  const [activeGroup, setActiveGroup] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/inventory/categories?user_id=${user.id}`)
      .then((res) => res.json())
      .then(setCategories);
    fetch(`${API}/inventory/equipment?user_id=${user.id}`)
      .then((res) => res.json())
      .then(setEquipment);
  }, [user]);

  if (!user) return null;

  const curr = categories.find((c) => c.code === activeCat);

  return (
    <div className="inventory-screen">
      {/* фиксированное верхнее меню */}
      <TopMenu />
      <div className="equip-side">
        <EquipmentPanel equipment={equipment} />
        <button className="back-btn" onClick={onClose}>Назад</button>
      </div>
      <div className="items-side">
        <div className="cat-tabs">
          {categories.map((c) => (
            <button key={c.code} className={c.code === activeCat ? 'active' : ''} onClick={() => {setActiveCat(c.code); setActiveGroup('all');}}>
              {c.name}
            </button>
          ))}
        </div>

        {/* sub-tabs */}
        <div className="sub-tabs">
          {curr && (
            <>
              <button className={activeGroup==='all'? 'active': ''} onClick={()=>setActiveGroup('all')}>Все</button>
              {curr.groups.map(g=> (
                <button key={g.code} className={activeGroup===g.code? 'active': ''} onClick={()=>setActiveGroup(g.code)}>{g.name}</button>
              ))}
            </>
          )}
        </div>

        <div className="groups-area">
          {(activeGroup==='all' ? curr?.groups : curr?.groups.filter(g=>g.code===activeGroup))?.map((g) => (
            <div key={g.code} className="group-block">
              <h4>{g.name}</h4>
              <div className="group-items">
                {g.items.length === 0 && <span className="no-items">Пусто</span>}
                {g.items.map((it) => (
                  <div key={it.id} className="item-card" title={it.name}>
                    <img src={it.icon || '/images/placeholder.svg'} alt={it.name} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;
