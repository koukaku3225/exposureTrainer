// パレオな男のブログで紹介されている「心理恐怖尺度」14問を、
// 意味を変えずに日本語表現だけ書き直したもの（原文の丸写しはしない）。
export const FEAR_QUESTIONS: string[] = [
  '難しい状況で責任を負わされたり、人に頼られたりするのが怖い',
  'うまくいくかどうか分からないことをするのは不安だ',
  '物事がすぐに理解できないと不安になる',
  '新しい人と知り合うとき、その人に拒絶されるのが怖い',
  '知らない人に近づくとき、冷たい態度を取られないか不安になる',
  '他人から拒絶されることは、自分にとって大きな脅威に感じる',
  '物事を自分でコントロールできなくなると怖い',
  '自分が何かに影響を与えられていないと気づくと、すぐ心配になる',
  '状況をコントロールできなかったらと考えると怖くなる',
  '親しい友人との連絡が途絶えたら、大きなショックを受けると思う',
  '大切な人との気持ちのふれあいを失うと、動揺すると思う',
  '親しい友人に距離を置かれたら、その関係に不安を覚える',
  '自分の評判が危うくなると、とても心配になる',
  '自分の評判が下がっていないか、いつも気になる',
];

export const FEAR_CATEGORIES: { key: string; label: string; questionIndexes: number[] }[] = [
  { key: 'failure', label: '失敗', questionIndexes: [0, 1, 2] },
  { key: 'rejection', label: '拒絶', questionIndexes: [3, 4, 5] },
  { key: 'control', label: 'コントロール', questionIndexes: [6, 7, 8] },
  { key: 'connection', label: 'つながり', questionIndexes: [9, 10, 11] },
  { key: 'reputation', label: '評判', questionIndexes: [12, 13] },
];

export function scoreFearCheck(
  answers: boolean[],
): { key: string; label: string; yes: number; total: number }[] {
  return FEAR_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    yes: cat.questionIndexes.filter((i) => answers[i]).length,
    total: cat.questionIndexes.length,
  }));
}
