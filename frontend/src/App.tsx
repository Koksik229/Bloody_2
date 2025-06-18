import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import GameScreen from './components/GameScreen';
import Chat from './components/Chat';

export default function App() {
  const { user } = useAuth();

  return user ? (
    <>
      <GameScreen />
      <Chat />
    </>
  ) : <Login />;
}
