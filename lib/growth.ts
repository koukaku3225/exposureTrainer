import type { PracticeRecord, Theme } from './types';
import { getStageTitle } from './tasks';

/**
 * 「あなたの森」に渡すデータ。
 *
 * 目標設定コーチ（prototypeManagementTool）の src/lib/forest.ts を参考に、
 * exposure-trainer 向けに設計し直したもの（2026-09-17）。
 *
 * 見た目の決め事:
 *   - 木1本 ＝ テーマ。小枝 ＝ 段（Stage）。葉 ＝ テーマの元気さ。実 ＝ 全段クリア
 *   - 小枝が生えるのは段が「あるとき」だけ。実践の進み具合では小枝を増やさない
 *     （伸ばすと、手が止まった段が枯れたように見えて責める見た目になる）
 *   - 段の進み具合は 蕾（todo）→ 開花直前（now）→ 花（clear）で見せる
 *   - 実践記録で「今回はここでよかった」を選んだ回数ぶん、落ち葉を地面に置く。
 *     失敗ではなく、土に還ったものとして扱う（悪いことではない）
 *   - 木の大きさは、そのテーマの実践回数（累計）で決まる。増えることはあっても
 *     サボった週に縮むことはない
 *   - 元気さ（葉の量・色）はクリア済みの段の割合。こちらも下がらない
 */

/** この回数（累計）で木がフルサイズになる */
export const FULL_GROWTH_RECORDS = 40;
/** 小枝として描く段の最大数（多すぎる段は最新側に寄せて間引く） */
export const MAX_TWIGS = 12;
/** 地面に置く落ち葉の最大数 */
export const MAX_FALLEN = 12;

export type TwigState = 'bud' | 'open' | 'flower';

export interface GrowthTwig {
  id: string;
  title: string;
  state: TwigState;
  /** 0.15〜1。その段の実践回数から決まる育ち具合 */
  maturity: number;
}

export interface GrowthTree {
  themeId: string;
  label: string;
  /** 全段クリア済みか */
  done: boolean;
  /** そのテーマの実践回数（自由記述の記録も含む） */
  totalRecords: number;
  /** 0.3〜1。木の大きさ */
  growth: number;
  /** 0.4〜1。葉の量・色（元気さ） */
  vigor: number;
  twigs: GrowthTwig[];
  /** 落ち葉の数（このテーマで「今回はここでよかった」を選んだ回数） */
  fallenCount: number;
}

export interface GrowthModel {
  trees: GrowthTree[];
}

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

function twigState(status: 'todo' | 'now' | 'clear'): TwigState {
  if (status === 'clear') return 'flower';
  if (status === 'now') return 'open';
  return 'bud';
}

export function buildGrowth(themes: Theme[], records: PracticeRecord[]): GrowthModel {
  const trees = themes.map((theme): GrowthTree => {
    const themeRecords = records.filter((r) => r.themeId === theme.id);
    const totalRecords = themeRecords.length;
    const clearedCount = theme.stages.filter((s) => s.status === 'clear').length;
    const clearedRatio = theme.stages.length > 0 ? clearedCount / theme.stages.length : 0;
    const done = theme.stages.length > 0 && clearedCount === theme.stages.length;

    const sorted = [...theme.stages].sort((a, b) => a.order - b.order);
    const twigs: GrowthTwig[] = sorted.slice(-MAX_TWIGS).map((stage): GrowthTwig => {
      const stageRecords = themeRecords.filter((r) => r.stageId === stage.id).length;
      return {
        id: stage.id,
        title: getStageTitle(stage),
        state: twigState(stage.status),
        maturity: clamp(0.15 + stageRecords / 3, 0.15, 1),
      };
    });

    const fallenCount = Math.min(
      MAX_FALLEN,
      themeRecords.filter((r) => r.choice === 'stop_here').length,
    );

    return {
      themeId: theme.id,
      label: shortLabel(theme.name),
      done,
      totalRecords,
      growth: clamp(0.3 + totalRecords / FULL_GROWTH_RECORDS, 0.3, 1),
      vigor: clamp(0.4 + clearedRatio * 0.6, 0.4, 1),
      twigs,
      fallenCount,
    };
  });

  return { trees };
}

function shortLabel(name: string): string {
  const MAX = 8;
  return name.length > MAX ? `${name.slice(0, MAX)}…` : name;
}
