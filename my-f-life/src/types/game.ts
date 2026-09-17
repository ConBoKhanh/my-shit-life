export interface StageData {
  id: string;
  name: string;
  currentStep: number;
  totalSteps: number;
  score: number;
  status: 'locked' | 'in_progress' | 'completed';
}

export interface CharacterAvatarConfig {
  skinTone: string;         // Mã màu da (e.g. '#FFE0BD')
  hairId: string;           // Kiểu tóc (12 kiểu)
  hairColor: string;        // Màu tóc
  faceId: string;           // Khuôn mặt biểu cảm (8 kiểu)
  shirtId: string;          // Áo (20 kiểu)
  pantsId: string;          // Quần/Váy (20 kiểu)
  shoesId: string;          // Giày (6 kiểu)
  accessoryId?: string;     // Phụ kiện (6 kiểu)
  ageStage?: 'baby' | 'kindergarten' | 'elementary' | 'highschool' | 'adult';
  heightScale?: number;     // Hệ số kéo dài chiều cao cơ thể
  legScale?: number;        // Hệ số kéo dài chân
  headScale?: number;       // Tỷ lệ đầu
}

export interface UserProfile {
  characterName?: string;
  gender?: 'male' | 'female';
  birthdate?: string;
  babyAvatar?: string;
  avatarConfig?: CharacterAvatarConfig;
  [key: string]: any;
}

export type UserActionType =
  | 'STAGE_SELECTED'
  | 'STAGE_STARTED'
  | 'STAGE_RESTARTED'
  | 'STAGE_COMPLETED'
  | 'CHOICE_SELECTED'
  | 'PROFILE_INITIALIZED'
  | 'CHARACTER_NAMED'
  | 'CHARACTER_CUSTOMIZED';

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
