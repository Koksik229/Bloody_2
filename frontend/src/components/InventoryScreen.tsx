import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '../context/NotificationContext';
import '../styles/InventoryScreen.css';
import { useAuth } from '../context/AuthContext';
import { EquipSlot } from './EquipmentPanel';
import TopMenu from './TopMenu';
import PlayerHUD from './PlayerHUD';
import EquipmentLayout from './EquipmentLayout';
import V2InventoryPanel from './V2InventoryPanel';

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
  onSkills?: () => void;
}

const InventoryScreen: React.FC<Props> = ({ onClose, onSkills }) => {
  const {show}=useNotification();
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<EquipSlot[]>([]);
  const [invTick, setInvTick] = useState(0);

  const refreshEquipment = () => {
    fetch(`${API}/inventory/equipment`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(setEquipment);
  };
  const refreshCategories = () => {
    fetch(`${API}/inventory/categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(setCategories);
  };
  const [wallet, setWallet] = useState<Record<string, number>>({});
  const { fetchUser } = useAuth();
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
        body:JSON.stringify({user_id:user!.id, slot_code:'auto', user_item_id: item.id}),
        credentials:'include'
      });
      console.debug('equip request',{itemId:item.id});
      console.log('equip response status', res.status);
      if(res.ok){
        // убрать предмет локально из списка инвентаря
        setCategories(prev=>prev.map(cat=>({
          ...cat,
          groups: cat.groups.map(g=>({...g, items: g.items.filter(it=>it.id!==item.id)}))
        })));
        setInvTick(t=>t+1);
          fetchUser();
        refreshEquipment();
        refreshCategories();
          fetchUser();
      }else{
        let errText='Ошибка';
        try{const data=await res.json(); errText=data.detail||JSON.stringify(data);}catch{errText=`HTTP ${res.status}`;}
        console.error('equip error', errText);
        show(errText,'error');
      }
    }catch(e){console.error(e); show('Ошибка соединения','error');}
  }

  async function handleUnequip(slotCode:string){
    try{
      const token=localStorage.getItem('access_token');
      const res=await fetch(`${API}/inventory/equipment/unequip`,{
        method:'POST',
        headers:{'Content-Type':'application/json', ...(token? { 'Authorization':`Bearer ${token}`}:{})},
        body:JSON.stringify({slot_code:slotCode}),
        credentials:'include'
      });
      if(res.ok){
        const data=await res.json();
        if(data.status==='ok'){
          refreshEquipment();
          refreshCategories();
          fetchUser();
          setInvTick(t=>t+1);
          fetchUser();
        }
      }else{
        console.error('unequip error', res.status);
      }
    }catch(err){console.error(err);}
  }

  return (
    <div className="inventory-screen flex gap-[5px] h-full p-8">
      {/* фиксированное верхнее меню */}
      <TopMenu onSkills={onSkills ?? onClose} />
      <PlayerHUD floating={false} />
     
      <div className="avatar-bg relative h-full overflow-y-auto bg-gradient-to-br from-bw-dark-bg via-bw-card-bg to-bw-dark-bg p-8 flex flex-col items-center rounded-xl pt-6">
        {/* wallet & currency */}
        <div className="wallet-panel w-[calc(100%+2rem)] -mx-4 mb-4 bg-gradient-to-r from-bw-card-bg to-bw-muted border border-bw-border rounded-lg px-8 py-2 shadow-lg flex items-center gap-8">
          <button onClick={onClose} className="h-8 px-3 bg-bw-accent-gold rounded flex items-center justify-center text-xs text-bw-dark-bg font-semibold">Вернуться</button>
          <div className="coins flex items-center gap-3 ml-auto pr-2"><span className="coin gold" style={{marginRight:'4px'}}   onMouseEnter={e=>setTt({visible:true,text:'Золото',x:e.clientX+12,y:e.clientY+12})}
            onMouseMove={e=>setTt(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}))}
            onMouseLeave={()=>setTt(prev=>({...prev,visible:false}))}
          >{wallet.GOLD ?? 0}</span>
          <span className="coin silver" style={{marginRight:'4px'}} onMouseEnter={e=>setTt({visible:true,text:'Серебро',x:e.clientX+12,y:e.clientY+12})}
            onMouseMove={e=>setTt(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}))}
            onMouseLeave={()=>setTt(prev=>({...prev,visible:false}))}
          >{wallet.SILVER ?? 0}</span>
          <span className="coin copper" style={{marginRight:'0px'}} onMouseEnter={e=>setTt({visible:true,text:'Медь',x:e.clientX+12,y:e.clientY+12})}
            onMouseMove={e=>setTt(prev=>({...prev,x:e.clientX+12,y:e.clientY+12}))}
            onMouseLeave={()=>setTt(prev=>({...prev,visible:false}))}
          >{wallet.COPPER ?? 0}</span></div>
        </div>
        <EquipmentLayout equipment={equipment} onUnequip={handleUnequip}/>
        {tt.visible && createPortal(<div className="equip-tooltip" style={{ top: tt.y, left: tt.x, transform: 'translate(-50%, -50%) scale(1.1, 1.15)' }}>{tt.text}</div>, document.body)}
        
        
      </div>
      <div className="items-side h-full bg-bw-dark-bg p-8 overflow-y-auto rounded-xl flex-1">
        <V2InventoryPanel refreshKey={invTick} onEquip={equipItem} />
        {/*

          <div>
            {categories.map((c) => (
              <button key={c.code} className={c.code === activeCat ? 'active' : ''} onClick={() => {setActiveCat(c.code); setActiveGroup('all');}}>
                {c.name}
          
        )}
      </div>

      <div className="groups-area">
        {(activeGroup==='all' ? curr?.groups : curr?.groups.filter(g=>g.code===activeGroup))?.map((g) => (
          <div key={g.code} className="group-block">
            <h4>{g.name}</h4>
            <div className="group-items grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {g.items.length === 0 && <span className="no-items">Пусто</span>}
              {g.items.map((it) => (
                <div key={it.id} className="item-card bg-gradient-to-r from-bw-card-bg to-bw-dark-bg border border-bw-border rounded-lg p-4 flex items-center justify-between hover:shadow-lg hover:-translate-y-0.5 transition-transform">
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
             )}
          )}
        </div>

        <div className="groups-area">
          {(activeGroup==='all' ? curr?.groups : curr?.groups.filter(g=>g.code===activeGroup))?.map((g) => (
            <div key={g.code} className="group-block">
              <h4>{g.name}</h4>
              <div className="group-items grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {g.items.length === 0 && <span className="no-items">Пусто</span>}
                {g.items.map((it) => (
                  <div key={it.id} className="item-card bg-gradient-to-r from-bw-card-bg to-bw-dark-bg border border-bw-border rounded-lg p-4 flex items-center justify-between hover:shadow-lg hover:-translate-y-0.5 transition-transform">
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
      */}
    </div>
    </div>
  );
};

export default InventoryScreen;
