import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Part = require('./part.js');
['hai-banh','xich','nhen','omni'].forEach(x => require('./part-'+x+'.js'));
['kep','day','nam-cham'].forEach(x => require('./part-'+x+'.js'));
['khoang-cach','mau','cham','camera'].forEach(x => require('./part-'+x+'.js'));

for (const loai of ['than','tay','cam-bien']) for (const d of Part.ds(loai)) {
  assert.ok(d.ma && d.ten && Array.isArray(d.hamGoc) && d.hamGoc.length && typeof d.ve === 'function', `${loai}/${d.ma} thiếu trường`);
  if (loai === 'than') {
    for (const o of ['tay','truoc','duoi','tren']) assert.ok(d.oGan[o] && Number.isInteger(d.oGan[o].x) && Number.isInteger(d.oGan[o].y), `${d.ma} thiếu ổ ${o}`);
    const ports = ['tay','truoc','duoi','tren'].map(o => `${d.oGan[o].x},${d.oGan[o].y}`);
    assert.equal(new Set(ports).size, ports.length, `${d.ma}: ổ tay và các ổ cảm biến không được chồng nhau`);
  } else assert.ok(d.diemNeo && d.gan, `${d.ma} thiếu điểm neo hoặc ổ gắn`);
}

function dat(mask, part, ox, oy) {
  for (let y = 0; y < part.h; y++) for (let x = 0; x < part.w; x++) {
    if (part.get(x, y) && ox + x >= 0 && oy + y >= 0 && ox + x < 40 && oy + y < 40) mask[(oy + y) * 40 + ox + x] = true;
  }
}
function lienMotKhoi(than, tay, tayState) {
  const mask = new Array(40 * 40).fill(false);
  dat(mask, Part._veMot(than, {}), 8, 8);
  const arm = Part._veMot(tay, tayState);
  dat(mask, arm, 8 + than.oGan.tay.x - tay.diemNeo.x, 8 + than.oGan.tay.y - tay.diemNeo.y);
  const first = mask.findIndex(Boolean);
  const seen = new Set([first]), queue = [first];
  while (queue.length) {
    const n = queue.pop(), x = n % 40, y = (n - x) / 40;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy, next = yy * 40 + xx;
      if ((dx || dy) && xx >= 0 && yy >= 0 && xx < 40 && yy < 40 && mask[next] && !seen.has(next)) { seen.add(next); queue.push(next); }
    }
  }
  assert.equal(seen.size, mask.filter(Boolean).length, `${than.ma}/${tay.ma}: tay phải nối liền thân (8 hướng)`);
}

for (const than of Part.ds('than')) for (const tay of Part.ds('tay')) {
  lienMotKhoi(than, tay, {});
  lienMotKhoi(than, tay, {tuThe:'duoi', kep:'mo'});
}
for (const than of Part.ds('than')) for (const tay of Part.ds('tay')) for (const cb of Part.ds('cam-bien')) {
  const c = { than: than.ma, tay: tay.ma, camBien: [{ ma: cb.ma, o: Array.isArray(cb.gan) ? cb.gan[0] : cb.gan }] };
  assert.doesNotThrow(() => Part.ghep(c, { than:{banh:{trai:1,phai:1}}, tay:{tuThe:'duoi',kep:'mo',cam:true}, camBien:{bat:true} }, 0), `${than.ma}/${tay.ma}/${cb.ma}`);
}
assert.throws(() => Part.ghep({than:'hai-banh',tay:'kep',camBien:[{ma:'mau',o:'truoc'}]}), /gắn được/);
const c = {than:'hai-banh',tay:'kep',camBien:[{ma:'khoang-cach',o:'truoc'}]};
const a = Part._veMot(Part.lay('than', 'hai-banh'), {}); let q = a;
for (let i = 0; i < 4; i++) q = Part.rot90(q);
assert.deepEqual(q.buf, a.buf, 'quay 4 lần phải trở về ảnh cũ');
const hs = Part.hamGoc(c); assert.equal(hs.length, new Set(hs).size, 'hamGoc gặp bị trùng');
console.log(`OK: ${Part.ds('than').length + Part.ds('tay').length + Part.ds('cam-bien').length} PART, mọi tổ hợp hợp lệ đã ghép; tay đều liền thân.`);
