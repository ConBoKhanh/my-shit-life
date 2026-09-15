import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useGameStore } from './stores/useGameStore';
import { LoginScreen } from './components/LoginScreen';
import { GameScreen } from './components/GameScreen';

export function App() {
  const currentRoute = useGameStore((state) => state.currentRoute);
  const currentUser = useGameStore((state) => state.currentUser);
  const initAuthAndData = useGameStore((state) => state.initAuthAndData);
  const navigate = useGameStore((state) => state.navigate);

  // Khởi tạo Auth & Data khi mount
  useEffect(() => {
    initAuthAndData();

    const handlePopState = () => {
      navigate(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initAuthAndData, navigate]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Toast Notification Container (Sonner) */}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            borderRadius: '12px',
          },
        }}
      />

      {/* Router Routing View */}
      {currentRoute === '/game' && currentUser ? (
        <GameScreen />
      ) : (
        <LoginScreen />
      )}
    </div>
  );
}

export default App;
