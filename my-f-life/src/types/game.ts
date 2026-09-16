export interface StageData {
  id: string;
  name: string;
  currentStep: number;
  totalSteps: number;
  score: number;
  status: 'locked' | 'in_progress' | 'completed';
}

export interface UserProfile {
  characterName?: string;
  gender?: 'male' | 'female';
  birthdate?: string;
  babyAvatar?: string;
  [key: string]: any;
}

export type UserActionType =
  | 'STAGE_SELECTED'
  | 'STAGE_STARTED'
  | 'STAGE_RESTARTED'
  | 'STAGE_COMPLETED'
  | 'CHOICE_SELECTED'
  | 'PROFILE_INITIALIZED'
  | 'CHARACTER_NAMED';

export interface UserActionLog {
  id: string;
  actionType: UserActionType;
  stageId: string;
  stageName?: string;
  stepId?: string;
  choiceId?: string; // Mã định danh lựa chọn (e.g. "1.1.2", "1.1.3", "1.1.4")
  choiceText?: string;
  details?: string;
  scoreReward?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface UserData {
  username: string;
  createdAt: string;
  lastPlayedAt: string;
  currentStageId: string;
  currentStepId?: string;
  currentDialogueIndex?: number;
  totalScore: number;
  profile?: UserProfile;
  stages: StageData[];
  selectedChoiceIds?: string[]; // Danh sách mã các lựa chọn đã chọn để tra cứu nhanh (e.g. ["1.1.2", "1.2.1"])
  actionLogs?: UserActionLog[]; // Lịch sử chi tiết toàn bộ hành động và quyết định của người chơi
}

export type UsersDatabase = Record<string, UserData>;
