import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import GameScreen from './components/GameScreen';

export default function App() {
  const { user } = useAuth();

  return user ? <GameScreen /> : <Login />;
}
