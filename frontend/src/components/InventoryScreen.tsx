import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import '../styles/InventoryScreen.css';
import { useAuth } from '../context/AuthContext';
import EquipmentPanel, { EquipSlot } from './EquipmentPanel';
import TopMenu from './TopMenu';
import { createPortal } from 'react-dom';

export interface Item {
  id:number;
  name:string;
  icon?:string;
  durability_cur?:number;
  durability_max?:number;
  enhance_level:number;
  min_level?:number;
  min_damage?:number;
  max_damage?:number;
  str_bonus?:number;
  agi_bonus?:number;
  int_bonus?:number;
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
  const {show}=useNotification();
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<EquipSlot[]>([]);
  const [wallet, setWallet] = useState<Record<string, number>>({});
  const [tt, setTt] = useState<{visible:boolean;text:string;x:number;y:number}>({visible:false,text:'',x:0,y:0});
  const [activeCat, setActiveCat] = useState<string>('weapon');
  const [activeGroup, setActiveGroup] = useState<string>('all');

  

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/inventory/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(setCategories);

    fetch(`${API}/inventory/equipment`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(setEquipment);
          
    // кошелёк
    fetch(`${API}/wallet/balance`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then((data) => {
        const map: Record<string, number> = {};
        data.forEach((it: {code: string; amount: number}) => map[it.code] = it.amount);
        setWallet(map);
      });

  }, [user, token]);

  if (!user) return null;

  const curr = categories.find((c) => c.code === activeCat);

  async function equipItem(item:Item){
    try{
      const token=localStorage.getItem('access_token');
      const res=await fetch(`${API}/inventory/equipment/equip`,{
        method:'POST',
        headers:{'Content-Type':'application/json', ...(token? { 'Authorization':`Bearer ${token}`}:{})},
        body:JSON.stringify({user_id:user!.id, slot_code: 'weapon', user_item_id: item.id}),
        credentials:'include'
      });
      if(res.ok){
        show('Предмет надет','success');
        // refresh equip
      }else{
        const data=await res.json();
        show(data.detail || 'Ошибка','error');
      }
    }catch(e){console.error(e); show('Ошибка соединения','error');}
  }

  return (
    <div className="inventory-screen">
      {/* фиксированное верхнее меню */}
      <TopMenu />
      <div className="equip-side">
        <div className="wallet-panel">
          <span className="coin gold"   onMouseEnter={e=>setTt({visible:true,text:'Золото',x:e.clientX+12,y:e.clientY+12})}
            onMouseMove={e=>setTt(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}))}
            onMouseLeave={()=>setTt(prev=>({...prev,visible:false}))}
          >{wallet.GOLD ?? 0}</span>
          <span className="coin silver" onMouseEnter={e=>setTt({visible:true,text:'Серебро',x:e.clientX+12,y:e.clientY+12})}
            onMouseMove={e=>setTt(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}))}
            onMouseLeave={()=>setTt(prev=>({...prev,visible:false}))}
          >{wallet.SILVER ?? 0}</span>
          <span className="coin copper" onMouseEnter={e=>setTt({visible:true,text:'Медь',x:e.clientX+12,y:e.clientY+12})}
            onMouseMove={e=>setTt(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}))}
            onMouseLeave={()=>setTt(prev=>({...prev,visible:false}))}
          >{wallet.COPPER ?? 0}</span>
        </div>
        {tt.visible && createPortal(<div className="equip-tooltip" style={{top:tt.y,left:tt.x}}>{tt.text}</div>, document.body)}
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
                  <div key={it.id} className="item-card">
                    {it.icon && (
                      <img src={it.icon.startsWith('/')? it.icon: `/icons/items/${it.icon}`} className="item-icon" alt={it.name} />
                    )}
                    <div className="item-main">
                      <span className="item-name">{it.name}</span>
                      {it.min_damage && <span className="item-dmg">Урон {it.min_damage}-{it.max_damage}</span>}
                      {(it.str_bonus ?? 0) > 0 && <span>Сила +{it.str_bonus}</span>}
                      {(it.agi_bonus ?? 0) > 0 && <span>Ловкость +{it.agi_bonus}</span>}
                      {(it.int_bonus ?? 0) > 0 && <span>Интуиция +{it.int_bonus}</span>}
                      {(it.durability_max ?? 0) > 0 && <span>Прочность {it.durability_cur}/{it.durability_max}</span>}
                    </div>
                    <div className="item-stats">
                      {it.min_level && <span className="item-level">Lvl {it.min_level}</span>}
                      <button className="equip-btn" onClick={()=>equipItem(it)}>Надеть</button>
                    </div>
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
