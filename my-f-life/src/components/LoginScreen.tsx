import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Search,
  Play,
  RotateCcw,
  LogOut,
  User,
  Users,
  Sparkles,
  CheckCircle2,
  Flame,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { UserData } from '../types/game';
import { useGameStore } from '../stores/useGameStore';
import { ConfirmDialog } from './common/ConfirmDialog';

export const LoginScreen: React.FC = () => {
  const usersDb = useGameStore((state) => state.usersDb);
  const loginUser = useGameStore((state) => state.loginUser);
  const startNewLife = useGameStore((state) => state.startNewLife);
  const checkUserByUsername = useGameStore((state) => state.checkUserByUsername);

  const [usernameInput, setUsernameInput] = useState('');
  const [checkedUsername, setCheckedUsername] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  const cleanInput = usernameInput.trim().toLowerCase();
  const existingUser = checkedUsername ? usersDb[checkedUsername] : null;

  // Xử lý nút "Kiểm tra người dùng"
  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanInput) {
      setError('Vui lòng nhập tên người chơi');
      setCheckedUsername(null);
      toast.error('Vui lòng nhập tên người chơi');
      return;
    }
    setError('');
    setIsChecking(true);

    try {
      const foundUser = await checkUserByUsername(cleanInput);
      setCheckedUsername(cleanInput);

      if (foundUser || usersDb[cleanInput]) {
        toast.info(`Tìm thấy hồ sơ người chơi "${cleanInput}"`);
      } else {
        toast.info(`Chào mừng tân thủ "${cleanInput}"`);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Xử lý Tiếp tục (User cũ)
  const handleContinue = () => {
    if (existingUser) {
      const updatedUser: UserData = {
        ...existingUser,
        lastPlayedAt: new Date().toISOString(),
      };
      loginUser(updatedUser);
      toast.success(`Chào mừng trở lại, ${existingUser.username}`);
    }
  };

  // Xử lý Bắt đầu cuộc đời mới (User mới)
  const handleStartNewUser = () => {
    if (!checkedUsername) return;
    startNewLife(checkedUsername);
    toast.success(`Khởi tạo thành công! Bắt đầu Cuộc Đua Chuyển Sinh`);
  };

  // Xử lý Reset cuộc đời mới cho User cũ (Sau khi Confirm Dialog)
  const handleConfirmResetLife = () => {
    if (checkedUsername) {
      setIsConfirmResetOpen(false);
      startNewLife(checkedUsername);
      toast.success(`Đã làm lại cuộc đời cho "${checkedUsername}" từ Cuộc Đua Chuyển Sinh`);
    }
  };

  // Quay lại / Logout đổi username
  const handleResetCheck = () => {
    setCheckedUsername(null);
    setError('');
    toast.info('Đã hủy chọn tài khoản');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', maxWidth: '540px', padding: '16px' }}
    >
      <div className="game-card">
        {/* Header game */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-background-secondary)',
              color: 'var(--color-primary)',
              marginBottom: '12px',
              boxShadow: 'inset 0 2px 6px rgba(108, 92, 231, 0.2)',
            }}
          >
            <Gamepad2 size={38} />
          </motion.div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Cuộc đời của tôi
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px', fontWeight: 600 }}>
            Mô phỏng hành trình cuộc đời đầy bất ngờ và lựa chọn
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* BƯỚC 1: CHƯA KIỂM TRA USERNAME */}
          {!checkedUsername ? (
            <motion.form
              key="step-input"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handleCheckUser}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  htmlFor="username-input"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Nhập tên người chơi
                </label>
                <input
                  id="username-input"
                  type="text"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setError('');
                  }}
                  placeholder="Nhập tên người chơi (vd: duynk)..."
                  maxLength={25}
                  className="game-input"
                  autoFocus
                />
                {error && (
                  <p style={{ fontSize: '14px', color: 'var(--color-error)', fontWeight: 600, marginTop: '6px' }}>
                    {error}
                  </p>
                )}
              </div>

              {/* Nút Kiểm tra người dùng */}
              <button
                type="submit"
                className="btn-primary"
                disabled={isChecking}
                style={{ width: '100%', padding: '14px', opacity: isChecking ? 0.7 : 1 }}
              >
                <Search size={18} />
                <span>{isChecking ? 'Đang Kiểm Tra...' : 'Kiểm Tra Người Dùng'}</span>
              </button>
            </motion.form>
          ) : (
            /* BƯỚC 2: ĐÃ KIỂM TRA USERNAME */
            <motion.div
              key="step-options"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              {/* Header User info đã check */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="var(--color-primary)" />
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {checkedUsername}
                  </span>
                </div>
                <span className={existingUser ? 'badge badge-primary' : 'badge badge-warning'}>
                  {existingUser ? 'Người Chơi Cũ' : 'Người Chơi Mới'}
                </span>
              </div>

              {/* TRƯỜNG HỢP 1: NGƯỜI CHƠI MỚI -> 2 OPTIONS */}
              {!existingUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: '#FFFDF9',
                      border: '1.5px solid var(--color-secondary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <Sparkles size={24} color="#D98200" />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        Tài khoản mới chưa có dữ liệu
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Bạn sẽ khởi đầu cuộc đời mới từ <b>Màn 1: Tuổi Thơ Dữ Dội</b>.
                      </p>
                    </div>
                  </div>

                  {/* 2 Options cho User mới */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleStartNewUser}
                      className="btn-primary"
                      style={{ width: '100%', padding: '14px' }}
                    >
                      <Sparkles size={18} />
                      <span>Bắt Đầu Cuộc Đời Mới</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetCheck}
                      className="btn-outline"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      <LogOut size={16} />
                      <span>Đổi Tài Khoản Khác</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* TRƯỜNG HỢP 2: NGƯỜI CHƠI CŨ -> HIỂN THỊ TIẾN TRÌNH & 3 OPTIONS */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* List màn: Tên màn, Step, Score */}
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#FAFAFD',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                        Tiến độ các màn:
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        Tổng: {existingUser.totalScore.toLocaleString()} đ
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                      {existingUser.stages.map((stg) => {
                        const isInProgress = stg.status === 'in_progress';
                        const isCompleted = stg.status === 'completed';
                        return (
                          <div
                            key={stg.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              background: isInProgress ? '#FFFFFF' : isCompleted ? '#F8F7FC' : 'rgba(255, 255, 255, 0.4)',
                              border: `1px solid ${isInProgress ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '14px',
                              fontWeight: 600,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isCompleted ? (
                                <CheckCircle2 size={16} color="var(--color-success)" />
                              ) : isInProgress ? (
                                <Flame size={16} color="var(--color-primary)" />
                              ) : (
                                <Lock size={16} color="var(--color-text-disabled)" />
                              )}
                              <span style={{ color: isInProgress ? 'var(--color-primary)' : 'inherit', fontWeight: isInProgress ? 700 : 600 }}>
                                {stg.name}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  fontSize: '13px',
                                  background: '#FFFFFF',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                Step {stg.currentStep}/{stg.totalSteps}
                              </span>
                              <span style={{ color: '#D98200', fontWeight: 700, minWidth: '45px', textAlign: 'right' }}>
                                {stg.score} đ
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 OPTIONS CHO NGƯỜI DÙNG CŨ */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    {/* Option 1: Tiếp tục */}
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="btn-primary"
                      style={{ width: '100%', padding: '14px' }}
                    >
                      <Play size={18} />
                      <span>Tiếp Tục</span>
                    </button>

                    {/* Option 2: Bắt đầu cuộc đời mới (Mở Confirm Dialog) */}
                    <button
                      type="button"
                      onClick={() => setIsConfirmResetOpen(true)}
                      className="btn-secondary"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      <RotateCcw size={16} />
                      <span>Bắt Đầu Cuộc Đời Mới (Làm lại từ Màn 1)</span>
                    </button>

                    {/* Option 3: Logout / Quay lại */}
                    <button
                      type="button"
                      onClick={handleResetCheck}
                      className="btn-outline"
                      style={{ width: '100%', padding: '10px' }}
                    >
                      <LogOut size={16} />
                      <span>Đổi Tài Khoản Khác</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thống kê số người chơi đã từng tham gia */}
        {!checkedUsername && (
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <Users size={16} color="var(--color-primary)" />
            <span>
              Đã có <b style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{Object.keys(usersDb).length}</b> người từng tham gia cuộc đời
            </span>
          </div>
        )}

      </div>

      {/* DIALOG XÁC NHẬN: BẮT ĐẦU CUỘC ĐỜI MỚI */}
      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        title="Bắt đầu lại cuộc đời mới?"
        message={`Bạn có chắc chắn muốn làm lại cuộc đời cho tài khoản "${checkedUsername}" không? Toàn bộ điểm số và tiến trình các màn trước sẽ được thiết lập lại từ Màn 1 Step 1 (Xóa mềm).`}
        confirmText="Đồng ý làm lại"
        cancelText="Giữ lại tiến trình"
        confirmVariant="warning"
        onConfirm={handleConfirmResetLife}
        onCancel={() => setIsConfirmResetOpen(false)}
      />
    </motion.div>
  );
};
