import type { UserData, UsersDatabase, StageData } from '../types/game';
import initialData from '../data/initialData.json';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  user?: UserData;
  users?: UsersDatabase;
  defaultStages?: StageData[];
  message?: string;
  error?: string;
}

export const gameApi = {
  /**
   * Lấy toàn bộ danh sách users từ backend JSON
   */
  async getAllUsers(): Promise<{ users: UsersDatabase; defaultStages: StageData[] }> {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.users && typeof data.users === 'object') {
          return {
            users: data.users,
            defaultStages: data.defaultStages || (initialData.defaultStages as StageData[]),
          };
        }
      }
    } catch {
      // Fallback khi chạy static hoặc offline
    }
    return {
      users: (initialData.users as UsersDatabase) || {},
      defaultStages: (initialData.defaultStages as StageData[]) || [],
    };
  },

  /**
   * Lấy thông tin chi tiết một user theo username từ backend
   */
  async getUserByUsername(username: string): Promise<UserData | null> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return null;

    try {
      const res = await fetch(`/api/users/${encodeURIComponent(cleanUsername)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          return data.user as UserData;
        }
      }
    } catch {
      // Fallback
    }
    return null;
  },

  /**
   * Lưu hoặc cập nhật người dùng mới vào backend JSON
   */
  async saveUser(user: UserData): Promise<boolean> {
    if (!user || !user.username) return false;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Đồng bộ toàn bộ cơ sở dữ liệu users
   */
  async syncFullDb(usersDb: UsersDatabase): Promise<boolean> {
    try {
      const defaultStages = initialData.defaultStages;
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: usersDb, defaultStages }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
