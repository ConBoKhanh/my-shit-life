import type { UserData, UsersDatabase, StageData } from '../types/game';
import initialData from '../data/initialData.json';
import { supabase } from './supabase';

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
   * Lấy toàn bộ danh sách users từ Supabase
   */
  async getAllUsers(): Promise<{ users: UsersDatabase; defaultStages: StageData[] }> {
    const defaultStages = (initialData.defaultStages as StageData[]) || [];
    const resultUsers: UsersDatabase = {};

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('game_users')
          .select('username, data');

        if (!error && data) {
          data.forEach((row: { username: string; data: UserData }) => {
            if (row.data && row.username) {
              resultUsers[row.username] = row.data;
            }
          });
          return {
            users: resultUsers,
            defaultStages,
          };
        }
      } catch (err) {
        console.warn('Lỗi kết nối Supabase, chuyển sang fallback:', err);
      }
    }

    return {
      users: (initialData.users as UsersDatabase) || {},
      defaultStages,
    };
  },

  /**
   * Lấy thông tin chi tiết một user theo username từ Supabase
   */
  async getUserByUsername(username: string): Promise<UserData | null> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('game_users')
          .select('data')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (!error && data && data.data) {
          return data.data as UserData;
        }
      } catch (err) {
        console.warn(`Lỗi lấy user ${cleanUsername} từ Supabase:`, err);
      }
    }

    return null;
  },

  /**
   * Lưu hoặc cập nhật người dùng vào Supabase
   */
  async saveUser(user: UserData): Promise<boolean> {
    if (!user || !user.username) return false;
    const cleanUsername = user.username.trim().toLowerCase();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('game_users')
          .upsert(
            {
              username: cleanUsername,
              data: user,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'username' }
          );

        return !error;
      } catch (err) {
        console.warn('Lỗi lưu user lên Supabase:', err);
        return false;
      }
    }

    return false;
  },

  /**
   * Đồng bộ toàn bộ cơ sở dữ liệu users lên Supabase
   */
  async syncFullDb(usersDb: UsersDatabase): Promise<boolean> {
    if (!supabase || !usersDb) return false;

    try {
      const rows = Object.entries(usersDb).map(([username, user]) => ({
        username: username.toLowerCase(),
        data: user,
        updated_at: new Date().toISOString(),
      }));

      if (rows.length === 0) return true;

      const { error } = await supabase
        .from('game_users')
        .upsert(rows, { onConflict: 'username' });

      return !error;
    } catch (err) {
      console.warn('Lỗi sync full db lên Supabase:', err);
      return false;
    }
  },
};
