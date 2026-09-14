// 確認用：全画面を1枚のHTMLに並べる（Artifactにはしない）
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const files = readdirSync('.').filter((f) => /^(Main|P[123]\w+)\.dc\.html$/.test(f)).sort();
const links = new Set();
let bodies = '';
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  (s.match(/<link[^>]*>/g) || []).forEach((l) => links.add(l));
  const inner = s.split('</helmet>')[1].split('</x-dc>')[0];
  // 本物ではヘルメットの body 指定（文字色・書体）が効くので、確認用でも外枠に移す
  const bodyRule = (s.match(/body \{([^}]*)\}/) || [, ''])[1].replace(/"/g, "'");
  bodies += `<figure style="margin:0;display:inline-flex;flex-direction:column;gap:6px"><figcaption style="color:#fff;font:12px sans-serif">${f}</figcaption><div style="width:390px;height:844px;overflow:hidden;${bodyRule}">${inner}</div></figure>`;
}
mkdirSync('_preview', { recursive: true });
writeFileSync('_preview/index.html', `<!doctype html><meta charset="utf-8">${[...links].join('')}<style>body{margin:0;background:#555;display:flex;flex-wrap:wrap;gap:24px;padding:16px;width:2960px}</style>${bodies}`);
console.log(`${files.length} screens`);
