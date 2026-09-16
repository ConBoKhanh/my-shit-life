import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './stores/useGameStore';
import { LoginScreen } from './components/LoginScreen';
import { GameScreen } from './components/GameScreen';
import { GameLoadingScreen } from './components/common/GameLoadingScreen';

export function App() {
  const currentRoute = useGameStore((state) => state.currentRoute);
  const currentUser = useGameStore((state) => state.currentUser);
  const isAuthLoading = useGameStore((state) => state.isAuthLoading);
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

      {/* Loading Screen khi đang kiểm tra phiên đăng nhập (F5 hoặc khởi động) */}
      <AnimatePresence>
        {isAuthLoading && (
          <motion.div
            key="app-loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999999,
            }}
          >
            <GameLoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Router Routing View: chỉ render khi đã xác thực xong */}
      {!isAuthLoading && (
        (currentRoute === '/game' || currentRoute === '/menu') && currentUser ? (
          <GameScreen />
        ) : (
          <LoginScreen />
        )
      )}
    </div>
  );
}

export default App;
