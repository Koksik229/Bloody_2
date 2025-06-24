import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import GameScreen from './components/GameScreen';
import Chat from './components/Chat';

import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  const { user } = useAuth();

  return (
    <NotificationProvider>
      {user ? (
        <>
          <GameScreen />
          <Chat />
        </>
      ) : (
        <Login />
      )}
    </NotificationProvider>
  );
}
