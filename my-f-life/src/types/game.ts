export interface StageData {
  id: string;
  name: string;
  currentStep: number;
  totalSteps: number;
  score: number;
  status: 'locked' | 'in_progress' | 'completed';
}

export interface UserData {
  username: string;
  createdAt: string;
  lastPlayedAt: string;
  currentStageId: string;
  totalScore: number;
  stages: StageData[];
}

export type UsersDatabase = Record<string, UserData>;
