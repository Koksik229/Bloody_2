import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import '../styles/ShopCatalog.css';

interface ItemGroup { id:number; code:string; name:string; }
interface ItemCategory { id:number; code:string; name:string; groups:ItemGroup[]; }
interface ShopItem {
  id:number;
  name:string;
  icon?:string;
  price_copper:number;
  min_level:number;
  min_damage?:number;
  max_damage?:number;
  str_bonus?:number;
  agi_bonus?:number;
  int_bonus?:number;
  max_durability?:number;
}

function renderPrice(copper:number){
  const silver=Math.floor(copper/10);
  const rem=copper%10;
  return (
    <span className="item-price">
      {silver>0 && (
        <>
          {silver}
          <img src="/images/монеты/coin-silver.png" className="coin-icon" />
        </>
      )}
      {rem>0 && (
        <>
          {silver>0 && ' '}
          {rem}
          <img src="/images/монеты/coin-copper.png" className="coin-icon" />
        </>
      )}
      {silver===0 && rem===0 && (<>
        0<img src="/images/монеты/coin-copper.png" className="coin-icon" />
      </>)}
    </span>
  );
}

export default function ShopCatalog(){
  const [cats,setCats] = useState<ItemCategory[]>([]);
  const [view,setView] = useState<'catalog'|'group'>('catalog');
  const [activeGroup,setActiveGroup] = useState<{code:string;name:string}|null>(null);
  const [items,setItems] = useState<ShopItem[]>([]);

  useEffect(()=>{ fetchCats();},[]);

  const {show}=useNotification();

  async function buyItem(itemId:number){
    try{
      setBuying(true);
      const token=localStorage.getItem('access_token');
      const res=await fetch(`${import.meta.env.VITE_API_URL}/shop/buy`,{
        method:'POST',
        headers:{'Content-Type':'application/json', ...(token? { 'Authorization':`Bearer ${token}`}:{})},
        body:JSON.stringify({item_id:itemId}),
        credentials:'include'
      });
      if(res.ok){
        show('Предмет куплен!','success');
      }else{
        const data=await res.json();
        show(data.detail || 'Ошибка покупки','error');
      }
    }catch(e){console.error(e); show('Ошибка соединения','error');}
    finally{setBuying(false);}
  }

  const [buying,setBuying]=useState(false);

  async function fetchCats(){
    try{
      const token=localStorage.getItem('access_token');
      const res=await fetch(`${import.meta.env.VITE_API_URL}/inventory/categories`,{
        headers: token? { 'Authorization':`Bearer ${token}`}:undefined,
        credentials:'include'
      });
      if(res.ok) setCats(await res.json());
    }catch(e){console.error(e);}
  }

  async function openGroup(code:string,name:string){
    setView('group');
    setActiveGroup({code,name});
    try{
      const token=localStorage.getItem('access_token');
      const res=await fetch(`${import.meta.env.VITE_API_URL}/shop/items/${code}`,{
        headers: token? { 'Authorization':`Bearer ${token}`}:undefined,
        credentials:'include'
      });
      if(res.ok) setItems(await res.json()); else setItems([]);
    }catch(e){console.error(e); setItems([]);}  
  }

  function back(){
    setView('catalog');
    setActiveGroup(null);
    setItems([]);
  }

  return (
    <div className="shop-catalog">
      {view==='catalog' && cats.map(cat=>(
        <div key={cat.id} className="shop-cat">
          <div className={`cat-icon icon-${cat.code}`} />
          <div className="cat-groups">
            {cat.groups.map(g=>(
              <span key={g.id} onClick={()=>openGroup(g.code, g.name)}>{g.name}</span>
            ))}
          </div>
        </div>
      ))}

      {view==='group' && activeGroup && (
        <>
          <div className="group-header">
            <span className="back-btn" onClick={back}>← Назад</span>
            <span className="group-title">{activeGroup.name}</span>
          </div>
          <div className="shop-items">
            {items.map(it=>(
              <div key={it.id} className="item-card">
                {it.icon && (
                  <img
                    src={it.icon.startsWith('/') ? it.icon : `/icons/items/${it.icon}`}
                    alt={it.name}
                    className="item-icon"
                  />
                )}
                <div className="item-main">
                  <span className="item-name">{it.name}</span>
                  {it.min_damage && (
                    <span className="item-dmg">Урон {it.min_damage}-{it.max_damage}</span>
                  )}
                  {/* Attributes */}
                  {(it.str_bonus ?? 0) > 0 && <span>Сила +{it.str_bonus}</span>}
                  {(it.agi_bonus ?? 0) > 0 && <span>Ловкость +{it.agi_bonus}</span>}
                  {(it.int_bonus ?? 0) > 0 && <span>Интуиция +{it.int_bonus}</span>}
                  { (it.max_durability ?? 0) > 0 && <span>Прочность {it.max_durability}</span>}
                </div>
                <div className="item-stats">
                  <span className="item-level">Lvl {it.min_level}</span>
                  {renderPrice(it.price_copper)}
                  <button className="buy-btn" onClick={()=>buyItem(it.id)}>Купить</button>
                </div>
              </div>
            ))}
            {items.length===0 && <div className="empty-note">Товары отсутствуют</div>}
          </div>
        </>
      )}
    </div>
  );
}








