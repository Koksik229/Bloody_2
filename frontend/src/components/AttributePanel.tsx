import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AttributePanel() {
  const { user } = useAuth();

  if (!user) return null;

  // determine dominant among strength, agility, power
  const dominant = (()=>{
    const trio = [
      {key:'С', val:user.strength??0, color:'text-yellow-400'},
      {key:'Л', val:user.agility??0, color:'text-green-500'},
      {key:'М', val:user.power??0, color:'text-red-700'},
    ];
    return trio.sort((a,b)=>b.val-a.val)[0];
  })();

  const colorMap: Record<string,string> = {
    'С': dominant.key==='С' ? 'text-yellow-400' : 'text-black',
    'Л': dominant.key==='Л' ? 'text-green-500' : 'text-black',
    'М': dominant.key==='М' ? 'text-red-700'   : 'text-black',
    'И': dominant.color,
    'Р': dominant.color,
  };

  const attrs = [
    { code: 'С', value: user.strength },
    { code: 'Л', value: user.agility },
    { code: 'И', value: user.intuition },
    { code: 'М', value: user.power },
    { code: 'Р', value: 0 },
  ];

  return (
    <div style={{marginTop:'145px'}} className="inventory-skills-panel w-full bg-gradient-to-r from-bw-card-bg to-bw-muted border border-bw-border rounded-lg px-6 py-2 shadow-lg flex items-center gap-6">
      {attrs.map(({ code, value }) => (
        <span key={code} className={`text-sm font-semibold whitespace-nowrap select-none ${colorMap[code]||'text-black'}`}>
          {code}: {value ?? 0}
        </span>
      ))}
    </div>
  );
}
