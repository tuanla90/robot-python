/* ============================================================================
   do-v03.mjs — QUÉT ĐỀ: với từng hình học khối, đo tick giao khối của hai
   phương án (dùng chính chương trình mẫu của game). Mục đích: chọn đề mà mỗi
   phương án thắng một kiểu — tức là "part là đề bài" có thật.

   Chạy: node tran/do-v03.mjs
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const TD = require(path.join(day, 'tran-dau.js'));
const G = require(path.join(day, 'tran-game.js'));

const IDLE = { R1: 'for i in range(3):\n    wait()', R2: 'for i in range(3):\n    wait()' };

function doMot(khoi, pa) {
  const de = { ten: 'đo', khoi };
  const dsO = khoi.map((k) => ({ x: k.x, y: k.y }));
  const codeA = { R1: G.mauR1(pa, 'A', dsO), R2: G.mauR2(pa, 'A', dsO.length + 1) };
  const r = TD.chamTranV03(de, { phuongAn: pa, R1: codeA.R1, R2: codeA.R2 },
    { phuongAn: 'TAY_DAI', R1: IDLE.R1, R2: IDLE.R2 }, { dongHo: 1200 });
  let tickDiem = null;
  for (const f of r.khung) if (f.diem.A >= khoi.length) { tickDiem = f.tick; break; }
  return { giao: r.diemA, tick: tickDiem, cd: r.chanDoan.filter((c) => /pick-hut/.test(c)).length };
}

const DE = [
  ['A 1 khối hàng nhà (4,3)', [{ x: 4, y: 3 }]],
  ['B 1 khối lệch trên (4,2)', [{ x: 4, y: 2 }]],
  ['C 1 khối lệch xa (4,1)', [{ x: 4, y: 1 }]],
  ['D 2 khối lệch hai bên (4,2)+(4,4)', [{ x: 4, y: 2 }, { x: 4, y: 4 }]],
  ['E 3 khối cột (4,1)+(4,3)+(4,5)', [{ x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 5 }]],
  ['F 3 khối liền (4,2)+(4,3)+(4,4)', [{ x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }]],
  ['G 2 khối hai cột (4,2)+(6,2)', [{ x: 4, y: 2 }, { x: 6, y: 2 }]],
  ['H 4 khối hai cột (4,2)+(4,4)+(6,2)+(6,4)', [{ x: 4, y: 2 }, { x: 4, y: 4 }, { x: 6, y: 2 }, { x: 6, y: 4 }]]
];

console.log('ĐỀ'.padEnd(42) + 'TAY_DAI'.padEnd(22) + 'CHAN_NHANH'.padEnd(22) + 'AI THẮNG');
for (const [ten, khoi] of DE) {
  const td = doMot(khoi, 'TAY_DAI'), cn = doMot(khoi, 'CHAN_NHANH');
  const fmt = (x) => (x.tick === null ? `hụt(${x.giao})` : `${x.tick} tick`) + (x.cd ? ` [${x.cd} hụt]` : '');
  let ai = 'hòa';
  if (td.tick !== null && cn.tick !== null) ai = td.tick < cn.tick ? 'TAY_DAI' : (cn.tick < td.tick ? 'CHAN_NHANH' : 'hòa');
  else if (td.tick !== null) ai = 'TAY_DAI';
  else if (cn.tick !== null) ai = 'CHAN_NHANH';
  console.log(ten.padEnd(42) + fmt(td).padEnd(22) + fmt(cn).padEnd(22) + ai);
}
