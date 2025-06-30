// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserData {
  id: number;
  nickname: string;
  level: number;
  location_id: number;
  location?: {
    id: number;
    name: string;
    description?: string;
    background?: string;
    type_id?: number;
  };
  available_locations?: { id: number; name: string; is_locked?: boolean }[];
  available_attribute_points_special: number;
  hp: number;
  mp: number;
  max_hp: number;
  max_mp: number;
  strength: number;
  agility: number;
  power: number;
  intuition: number;
  reason?: number;
  weapon_skill: number;
  parry: number;
  shield_block: number;
}

interface AuthContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  logout: () => void;
  token: string | null;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  const fetchUser = async () => {
    try {
      const currentToken = localStorage.getItem('access_token');
      if (!currentToken) {
        console.log('No token found in localStorage');
        setUser(null);
        return;
      }

      console.log('Fetching user with token:', currentToken.substring(0, 10) + '...');
      const res = await fetch(`${API}/me`, { 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('User data received:', data);
        // если backend вернул attributes вложенным – расплющиваем
        if (data.attributes){
          const {strength, agility, power, intuition} = data.attributes;
          Object.assign(data, {strength, agility, power, intuition});
        }
        setUser(data);
        // Обновляем token в состоянии, чтобы другие компоненты сразу получили актуальный JWT
        setToken(currentToken);
        // сразу сходить на /vital для актуальных hp/mp
        try {
          const vital = await fetch(`${API}/vital`, {headers:{'Authorization':`Bearer ${currentToken}`},credentials:'include'}).then(r=>r.json());
          data.hp = vital.hp; data.mp = vital.mp; data.max_hp = vital.max_hp; data.max_mp = vital.max_mp;
        } catch {}
      } else {
        console.error('Failed to fetch user:', res.status);
        setUser(null);
        setToken(null);
        localStorage.removeItem('access_token');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/logout`, { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
    }
  };

  useEffect(() => {
    const currentToken = localStorage.getItem('access_token');
    if (currentToken) {
      setToken(currentToken);
      fetchUser();
    }
    // глобальный таймер /vital каждые 15 сек
    let iv: any;
    if (currentToken){
      iv = setInterval(()=>{
        fetch(`${API}/vital`, {headers:{'Authorization':`Bearer ${currentToken}`},credentials:'include'}).then(r=>r.json()).then(v=>{
          setUser(prev=> prev? {...prev, hp:v.hp, mp:v.mp, max_hp:v.max_hp, max_mp:v.max_mp}:prev);
        }).catch(()=>{});
      },15000);
    }
    return ()=>{iv && clearInterval(iv);};
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, token, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
