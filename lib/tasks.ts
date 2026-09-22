import type { Stage } from './types';

export const MAX_TASKS_PER_STAGE = 3;

// 段の tasks を常に3枠にそろえる（足りない分は空文字で埋める）。
export function padTasks(tasks: string[]): string[] {
  const padded = [...tasks];
  while (padded.length < MAX_TASKS_PER_STAGE) padded.push('');
  return padded.slice(0, MAX_TASKS_PER_STAGE);
}

// 実践のときに選べる課題を返す。空欄は除く。
// tasks が1件も入っていない（古いデータなど）場合は stage.name にフォールバックする。
export function getTaskOptions(stage: Stage): string[] {
  const filled = (stage.tasks ?? []).map((t) => t.trim()).filter((t) => t.length > 0);
  return filled.length > 0 ? filled : [stage.name];
}

/**
 * 段のタイトル。課題1（空欄なら次に書いてある課題）をそのまま使う。
 * 段の名前だけ編集できない画面は不便だ、という指摘を受けての方針で、
 * 「課題1を書き換える＝タイトルを書き換える」にそろえている。
 * どの課題も空欄なら、もとの stage.name をそのまま残す。
 */
export function getStageTitle(stage: Stage): string {
  return getTaskOptions(stage)[0];
}

// 段階表の編集フォームを開くときの初期値。
// tasks が無い（今回の機能より前に作られたテーマ）場合、フォームを空欄3つで
// 開くと「課題1件」というヘッダー表示（getTaskOptionsがnameにフォールバックした結果）と
// 矛盾するので、name を1枠目に補ってから渡す。
export function getEditableTasks(stage: Stage): string[] {
  return stage.tasks && stage.tasks.length > 0 ? stage.tasks : [stage.name];
}
