export type Stage = {
  id: string;
  level: number;
  name: string;
  status: 'todo' | 'now' | 'clear';
  order: number;
  // 進級目安（count・maxAnxietyAfter）はテーマ側に複製しない。
  // 常に Settings.clearRequirement を参照する（設定変更が既存テーマにも効くように）。
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
  // 段階表の課題に紐づく記録は stageId を持つ。
  // 予定外の出来事を自由記述で記録したときは null にし、freeText に内容を書く。
  stageId: string | null;
  freeText: string | null;
  // 任意のひとことメモ。段階表つきの記録にも自由記述の記録にも使える。
  memo: string | null;
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
