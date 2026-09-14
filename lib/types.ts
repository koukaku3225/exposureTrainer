export type Stage = {
  id: string;
  level: number;
  name: string;
  status: 'todo' | 'now' | 'clear';
  order: number;
  clearRequirement: { count: number; maxAnxietyAfter: number };
};

export type Theme = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ifThen: { trigger: string; action: string } | null;
  stages: Stage[];
};

export type PracticeRecord = {
  id: string;
  themeId: string;
  stageId: string;
  isImagined: boolean;
  anxietyBefore: number;
  anxietyAfter: number;
  choice: 'advance' | 'repeat' | 'stop_here' | null;
  createdAt: string;
};

export type FearCheckResult = {
  id: string;
  answers: boolean[];
  createdAt: string;
};

export type RewardSetting = {
  id: string;
  thresholdPt: number;
  label: string;
};

export type Settings = {
  clearRequirement: { count: number; maxAnxietyAfter: number };
  guardrailThreshold: number;
  points: number;
  rewards: RewardSetting[];
  onboardingCompleted: boolean;
};
