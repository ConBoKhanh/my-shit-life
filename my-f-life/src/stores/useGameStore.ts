import { create } from 'zustand';
import type { UserData, UsersDatabase, StageData, UserProfile, UserActionLog } from '../types/game';
import initialData from '../data/initialData.json';
import { authUtil, type AuthSession } from '../utils/auth';
import { gameApi } from '../services/api';

const STORAGE_KEY = 'life_game_users_data';

const persistUsersDb = (updatedDb: UsersDatabase, specificUser?: UserData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDb));
  } catch {}

  // Async sync with Backend API
  if (specificUser) {
    gameApi.saveUser(specificUser).catch(() => {});
  }
  gameApi.syncFullDb(updatedDb).catch(() => {});
};

interface GameStoreState {
  usersDb: UsersDatabase;
  currentUser: UserData | null;
  currentSession: AuthSession | null;
  currentRoute: string;

  // Actions
  navigate: (route: string) => void;
  initAuthAndData: () => Promise<void>;
  checkUserByUsername: (username: string) => Promise<UserData | null>;
  loginUser: (user: UserData) => void;
  startNewLife: (username: string) => void;
  updateUserProgress: (updatedUser: UserData) => void;
  updateDialogueProgress: (dialogueIndex: number) => void;
  updateStepProgress: (stepId: string, dialogueIndex?: number) => void;
  updateUserProfile: (profileUpdate: Partial<UserProfile>, nextDialogueIndex?: number) => void;
  logUserAction: (actionData: Omit<UserActionLog, 'id' | 'timestamp'>) => void;
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

  initAuthAndData: async () => {
    // 1. Khởi tạo từ initialData.json mặc định
    let loadedDb: UsersDatabase = { ...(initialData.users as UsersDatabase) };

    // 2. Hợp nhất dữ liệu đã lưu trong localStorage (Client Cache)
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (rawData) {
        const localDb = JSON.parse(rawData);
        if (localDb && typeof localDb === 'object') {
          Object.entries(localDb as UsersDatabase).forEach(([username, u]) => {
            if (u && typeof u === 'object') {
              if (!loadedDb[username] || (u.lastPlayedAt && u.lastPlayedAt > (loadedDb[username].lastPlayedAt || ''))) {
                loadedDb[username] = u;
              }
            }
          });
        }
      }
    } catch {}

    // 3. Lấy dữ liệu mới nhất từ Backend Server JSON (/api/users)
    try {
      const serverData = await gameApi.getAllUsers();
      if (serverData && serverData.users && typeof serverData.users === 'object') {
        Object.entries(serverData.users).forEach(([username, u]) => {
          if (u && typeof u === 'object') {
            if (!loadedDb[username] || (u.lastPlayedAt && u.lastPlayedAt >= (loadedDb[username].lastPlayedAt || ''))) {
              loadedDb[username] = u;
            }
          }
        });
      }
    } catch {}

    // Đảm bảo tất cả users đều có stage_0 Cuộc Đua Chuyển Sinh
    Object.values(loadedDb).forEach((u) => {
      if (u.stages && !u.stages.some((s) => s.id === 'stage_0')) {
        u.stages.unshift({
          id: 'stage_0',
          name: 'Cuộc Đua Chuyển Sinh',
          currentStep: 1,
          totalSteps: 1,
          score: 0,
          status: 'in_progress',
        });
        if (!u.currentStageId || u.currentStageId === 'stage_1') {
          u.currentStageId = 'stage_0';
          u.currentStepId = 'step_race';
        }
      } else if (u.stages) {
        const s0 = u.stages.find((s) => s.id === 'stage_0');
        if (s0) s0.name = 'Cuộc Đua Chuyển Sinh';
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedDb));
    set({ usersDb: loadedDb });

    // 4. Kiểm tra Session Token 24h
    const session = authUtil.getSession();
    if (session) {
      let user: UserData | null | undefined = loadedDb[session.username];
      if (!user) {
        // Cố gắng query từ BE nếu local cache chưa kịp có
        user = await gameApi.getUserByUsername(session.username);
      }

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

  checkUserByUsername: async (username: string) => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) return null;

    // 1. Kiểm tra trong store hiện tại
    const inMemoryUser = get().usersDb[cleanUsername];
    if (inMemoryUser) return inMemoryUser;

    // 2. Query BE API
    try {
      const serverUser = await gameApi.getUserByUsername(cleanUsername);
      if (serverUser) {
        const updatedDb = { ...get().usersDb, [cleanUsername]: serverUser };
        set({ usersDb: updatedDb });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDb));
        return serverUser;
      }
    } catch {}

    return null;
  },

  loginUser: (user: UserData) => {
    const session = authUtil.setSession(user.username);
    const updatedDb = { ...get().usersDb, [user.username]: user };
    persistUsersDb(updatedDb, user);
    
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
      currentStageId: 'stage_0',
      currentStepId: 'step_race',
      currentDialogueIndex: 0,
      totalScore: 0,
      profile: {
        gender: 'male',
        birthdate: '2000-09-16',
        characterName: '',
      },
      stages: freshStages,
      selectedChoiceIds: [],
      actionLogs: [
        {
          id: `log_init_${Date.now()}`,
          actionType: 'STAGE_STARTED',
          stageId: 'stage_0',
          stageName: 'Cuộc Đua Chuyển Sinh',
          stepId: 'step_race',
          timestamp: new Date().toISOString(),
          metadata: { note: 'Bắt đầu cuộc đua chuyển sinh tranh slot làm người' },
        },
      ],
    };

    const session = authUtil.setSession(username);
    const updatedDb = { ...get().usersDb, [username]: newUser };
    persistUsersDb(updatedDb, newUser);

    set({
      usersDb: updatedDb,
      currentUser: newUser,
      currentSession: session,
    });
    get().navigate('/game');
  },

  updateUserProgress: (updatedUser: UserData) => {
    const userWithTimestamp = {
      ...updatedUser,
      lastPlayedAt: new Date().toISOString(),
    };
    const updatedDb = { ...get().usersDb, [userWithTimestamp.username]: userWithTimestamp };
    persistUsersDb(updatedDb, userWithTimestamp);
    set({ usersDb: updatedDb, currentUser: userWithTimestamp });
  },

  updateDialogueProgress: (dialogueIndex: number) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;
    if (currentUser.currentDialogueIndex === dialogueIndex) return;

    const updatedUser: UserData = {
      ...currentUser,
      currentDialogueIndex: dialogueIndex,
      lastPlayedAt: new Date().toISOString(),
    };

    const updatedDb = { ...get().usersDb, [updatedUser.username]: updatedUser };
    persistUsersDb(updatedDb, updatedUser);
    set({ usersDb: updatedDb, currentUser: updatedUser });
  },

  updateStepProgress: (stepId: string, dialogueIndex: number = 0) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const updatedUser: UserData = {
      ...currentUser,
      currentStepId: stepId,
      currentDialogueIndex: dialogueIndex,
      lastPlayedAt: new Date().toISOString(),
    };

    const updatedDb = { ...get().usersDb, [updatedUser.username]: updatedUser };
    persistUsersDb(updatedDb, updatedUser);
    set({ usersDb: updatedDb, currentUser: updatedUser });
  },

  updateUserProfile: (profileUpdate: Partial<UserProfile>, nextDialogueIndex?: number) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const updatedUser: UserData = {
      ...currentUser,
      profile: {
        ...(currentUser.profile || {}),
        ...profileUpdate,
      },
      ...(nextDialogueIndex !== undefined ? { currentDialogueIndex: nextDialogueIndex } : {}),
      lastPlayedAt: new Date().toISOString(),
    };

    const updatedDb = { ...get().usersDb, [updatedUser.username]: updatedUser };
    persistUsersDb(updatedDb, updatedUser);
    set({ usersDb: updatedDb, currentUser: updatedUser });
  },

  logUserAction: (actionData: Omit<UserActionLog, 'id' | 'timestamp'>) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const newLog: UserActionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...actionData,
    };

    const currentLogs = currentUser.actionLogs || [];
    const currentSelectedChoices = currentUser.selectedChoiceIds || [];

    const updatedSelectedChoices = actionData.choiceId && !currentSelectedChoices.includes(actionData.choiceId)
      ? [...currentSelectedChoices, actionData.choiceId]
      : currentSelectedChoices;

    const updatedUser: UserData = {
      ...currentUser,
      selectedChoiceIds: updatedSelectedChoices,
      actionLogs: [newLog, ...currentLogs],
      lastPlayedAt: new Date().toISOString(),
    };

    const updatedDb = { ...get().usersDb, [updatedUser.username]: updatedUser };
    persistUsersDb(updatedDb, updatedUser);
    set({ usersDb: updatedDb, currentUser: updatedUser });
  },

  logout: () => {
    authUtil.clearSession();
    set({ currentUser: null, currentSession: null });
    get().navigate('/login');
  },
}));
