/* Chạy mọi máy kiểm (kiem-*.mjs) trong nhan/, tran/, hoc/, hoc/game/part/ lần lượt.
   Chạy: npm test        (một bộ trượt thì thoát mã 1)
   Lọc:  npm test -- hoc/kiem-xich     (chỉ chạy các tệp có chứa chuỗi này) */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loc = process.argv[2] || '';
const tep = ['nhan', 'tran', 'hoc', 'hoc/game/part']
  .flatMap((d) => fs.readdirSync(path.join(goc, d))
    .filter((f) => /^kiem-.*\.mjs$/.test(f))
    .map((f) => `${d}/${f}`))
  .filter((f) => f.includes(loc));

const hong = [];
for (const f of tep) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [f], { cwd: goc, encoding: 'utf8' });
  const dong = (r.stdout || '').trim().split('\n').filter((d) => /ĐẠT|HỎNG/.test(d)).pop() || '';
  const ok = r.status === 0;
  console.log(`${ok ? '✓' : '✗'} ${f.padEnd(34)} ${dong.trim()}  (${Date.now() - t0} ms)`);
  if (!ok) {
    hong.push(f);
    console.log((r.stdout || '').split('\n').filter((d) => /✗|HỎNG|Error|lỗi/i.test(d)).slice(0, 15).join('\n'));
    if (r.stderr) console.log(r.stderr.slice(0, 2000));
  }
}

console.log(`\n${tep.length - hong.length}/${tep.length} bộ đạt`);
if (hong.length) {
  console.log('Hỏng: ' + hong.join(', '));
  process.exit(1);
}
