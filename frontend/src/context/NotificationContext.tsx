import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notice {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface Ctx {
  show: (msg: string, type: 'success' | 'error') => void;
}

const NotificationCtx = createContext<Ctx | undefined>(undefined);

export function useNotification(){
  const ctx = useContext(NotificationCtx);
  if(!ctx) throw new Error('NotificationProvider missing');
  return ctx;
}

import '../styles/Notification.css';

export function NotificationProvider({children}:{children:ReactNode}){
  const [notice,setNotice] = useState<Notice|null>(null);

  function show(message:string,type:'success'|'error'='success'){
    setNotice({id:Date.now(),message,type});
  }
  function close(){ setNotice(null); }

  return (
    <NotificationCtx.Provider value={{show}}>
      {children}
      {notice && (
        <div className="notif-backdrop" onClick={close}>
          <div className="notif-box">
            <p className={notice.type==='error'?'notif-error':'notif-success'}>{notice.message}</p>
            <button onClick={close}>OK</button>
          </div>
        </div>
      )}
    </NotificationCtx.Provider>
  );
}
