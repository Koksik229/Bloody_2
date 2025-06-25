import { useAuth } from './context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import GameScreen from './components/GameScreen';
import Chat from './components/Chat';

import { NotificationProvider } from './context/NotificationContext';

import SkillsBlock from './components/SkillsBlock';

export default function App() {
  const { user } = useAuth();

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/skills-design" element={<SkillsBlock />} />
        <Route path="/*" element={user ? (
          <>
            <GameScreen />
            <Chat />
          </>
        ) : (
          <Login />
        )} />
      </Routes>
    </NotificationProvider>
  );
}
