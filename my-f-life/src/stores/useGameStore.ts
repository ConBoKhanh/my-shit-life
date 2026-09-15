import { create } from 'zustand';
import type { UserData, UsersDatabase, StageData } from '../types/game';
import initialData from '../data/initialData.json';
import { authUtil, type AuthSession } from '../utils/auth';

const STORAGE_KEY = 'life_game_users_data';

interface GameStoreState {
  usersDb: UsersDatabase;
  currentUser: UserData | null;
  currentSession: AuthSession | null;
  currentRoute: string;

  // Actions
  navigate: (route: string) => void;
  initAuthAndData: () => void;
  loginUser: (user: UserData) => void;
  startNewLife: (username: string) => void;
  updateUserProgress: (updatedUser: UserData) => void;
  logout: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  usersDb: {},
  currentUser: null,
  currentSession: null,
  currentRoute: window.location.pathname === '/game' ? '/game' : '/login',

  navigate: (route: string) => {
    window.history.pushState({}, '', route);
    set({ currentRoute: route });
  },

  initAuthAndData: () => {
    // 1. Load users database
    let loadedDb: UsersDatabase = initialData.users as UsersDatabase;
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      try {
        loadedDb = JSON.parse(rawData);
      } catch {
        loadedDb = initialData.users as UsersDatabase;
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedDb));
    }
    set({ usersDb: loadedDb });

    // 2. Check 24h Token Session
    const session = authUtil.getSession();
    if (session) {
      const user = loadedDb[session.username];
      if (user) {
        set({ currentUser: user, currentSession: session });
        get().navigate('/game');
        return;
      }
    }

    // Nếu không có token hợp lệ
    authUtil.clearSession();
    set({ currentUser: null, currentSession: null });
    get().navigate('/login');
  },

  loginUser: (user: UserData) => {
    const session = authUtil.setSession(user.username);
    const updatedDb = { ...get().usersDb, [user.username]: user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDb));
    
    set({
      usersDb: updatedDb,
      currentUser: user,
      currentSession: session,
    });
    get().navigate('/game');
  },

  startNewLife: (username: string) => {
    const freshStages: StageData[] = JSON.parse(JSON.stringify(initialData.defaultStages));
    const newUser: UserData = {
      username,
      createdAt: get().usersDb[username]?.createdAt || new Date().toISOString(),
      lastPlayedAt: new Date().toISOString(),
      currentStageId: 'stage_1',
      totalScore: 0,
      stages: freshStages,
    };

    const session = authUtil.setSession(username);
    const updatedDb = { ...get().usersDb, [username]: newUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDb));

    set({
      usersDb: updatedDb,
      currentUser: newUser,
      currentSession: session,
    });
    get().navigate('/game');
  },

  updateUserProgress: (updatedUser: UserData) => {
    const updatedDb = { ...get().usersDb, [updatedUser.username]: updatedUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDb));
    set({ usersDb: updatedDb, currentUser: updatedUser });
  },

  logout: () => {
    authUtil.clearSession();
    set({ currentUser: null, currentSession: null });
    get().navigate('/login');
  },
}));
