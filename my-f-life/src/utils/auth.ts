export interface AuthSession {
  token: string;
  username: string;
  expiresAt: number; // timestamp ms
}

const AUTH_SESSION_KEY = 'life_game_auth_session';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const authUtil = {
  // Tạo token mới sống 1 ngày
  setSession: (username: string): AuthSession => {
    const session: AuthSession = {
      token: `token_${username}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      username,
      expiresAt: Date.now() + ONE_DAY_MS,
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return session;
  },

  // Lấy session và tự động kiểm tra hạn 1 ngày
  getSession: (): AuthSession | null => {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;

    try {
      const session: AuthSession = JSON.parse(raw);
      // Nếu hết hạn 1 ngày -> Xóa token và trả về null
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
  },

  // Đăng xuất / xóa token
  clearSession: () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
  },

  // Lấy thời gian còn lại (giờ, phút)
  getRemainingTimeFormatted: (expiresAt: number): string => {
    const diff = Math.max(0, expiresAt - Date.now());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  },
};
