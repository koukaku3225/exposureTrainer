import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const files = ['Onboard1.dc.html','Onboard2.dc.html','Main.dc.html','Ladder.dc.html','Practice.dc.html','Review.dc.html','Quiz.dc.html','Result.dc.html','Ai.dc.html'];
const links = new Set(); let bodies='';
for (const f of files) {
  const s = readFileSync(f,'utf8');
  (s.match(/<link[^>]*>/g)||[]).forEach(l=>links.add(l));
  const inner = s.split('</helmet>')[1].split('</x-dc>')[0];
  const bodyRule = (s.match(/body \{([^}]*)\}/)||[,''])[1].replace(/"/g,"'");
  bodies += `<figure style="margin:0;display:inline-flex;flex-direction:column;gap:6px"><figcaption style="color:#333;font:12px sans-serif">${f}</figcaption><div style="width:390px;height:844px;overflow:hidden;${bodyRule}">${inner}</div></figure>`;
}
mkdirSync('_preview',{recursive:true});
writeFileSync('_preview/duo3.html', `<!doctype html><meta charset="utf-8">${[...links].join('')}<style>body{margin:0;background:#ddd;display:flex;flex-wrap:wrap;gap:20px;padding:16px;width:2400px}</style>${bodies}`);
