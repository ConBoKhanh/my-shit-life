export type CharacterSide = 'left' | 'right';

export interface CharacterConfig {
  id: number | string;
  name: string;
  avatar?: string;
  sprite: string;
  side: CharacterSide;
  color?: string;
  role?: 'player' | 'npc';
}

export type VariableMappingType = {
  fromPool?: string;
  groupBy?: string; // e.g. "gender"
  staticValue?: string;
  userField?: string; // e.g. "characterName", "birthdate"
};

export type VariableMap = Record<string, VariableMappingType | string>;

export interface StoryActionConfig {
  type: 'profile_init' | 'name_picker' | 'choice_modal' | 'custom_modal';
  title: string;
  description?: string;
  saveField?: string;
  options?: string[];
  placeholder?: string;
}

export interface DialogueLine {
  id: string;
  speakerId: number | string;
  text: string;
  side?: CharacterSide;
  expression?: 'neutral' | 'happy' | 'blush' | 'surprised' | 'angry' | 'thinking' | 'proud';
  varMap?: VariableMap;
  triggerAction?: StoryActionConfig;
  bgm?: string;
  sfx?: string;
}

export interface StoryChoice {
  id: string; // e.g. "1.1.2", "1.1.3", "1.1.4"
  text: string;
  icon?: string;
  scoreReward?: number;
  statEffects?: {
    happiness?: number;
    love?: number;
    energy?: number;
    money?: number;
  };
  reactionDialogues?: DialogueLine[]; // Danh sách các câu thoại phản hồi từ NPC/Y tá theo lựa chọn này (1.1.4.1, 1.1.4.2...)
  nextStepId?: string; // Bước tiếp theo để chuyển đến
  nextStageId?: string; // Màn tiếp theo nếu rẽ nhánh sang màn khác
}

export interface StoryStepConfig {
  id: string;
  stepNumber: number;
  title: string;
  dayLabel?: string;
  locationName?: string;
  screenType: 'dialogue_scene' | 'minigame' | 'custom';
  background: {
    url: string;
    overlay?: string;
    ambientEffect?: 'sunlight' | 'sparkles' | 'none';
  };
  bgm?: string;
  characters: Record<string | number, CharacterConfig>;
  randomPools?: Record<string, string[] | { male: string[]; female: string[] }>;
  dialogues: DialogueLine[];
  choices?: StoryChoice[];
  nextStepId?: string;
  isEnding?: boolean;
}

export interface StageStoryConfig {
  stageId: string;
  stageName: string;
  initialStepId: string;
  steps: Record<string, StoryStepConfig>;
}
