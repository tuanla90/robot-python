/* ============================================================================
   kiem-doi-ten-phun.mjs — 29/10 (user chốt): vòi phun đổi tên lệnh shoot → spray, lực "fast" / "charge" → "low" / "high",
   PHUN NHẸ LÀ MẶC ĐỊNH (spray() không đối số = "low": tia bay ≤ 2 ô, xe không giật), lực mạnh mở ở gói 6 Lực phun (cfg.lucBan).
   Kiểm: luật lõi, lời báo tên cũ, chuyển dữ liệu đã lưu một lần (game/luu.js), không màn nào còn tên cũ.
   Chạy: node hoc/kiem-doi-ten-phun.mjs
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));

let dat = 0, hong = 0;
function kiem(ten, dk, chiTiet) {
  if (dk) { dat++; console.log('  ok   ' + ten); } else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);

console.log('== Luật lõi ==');
const HOI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back'];
const chay = (code, them) => SanHoc.chay(Object.assign({ san: ['#####', '#...#', '#...#', '#...#', '#####'], batDau: { x: 2, y: 2, huong: 0 }, loaiRobot: 'banh', hamGoc: HOI }, them || {}), code);
const sk = (r) => r.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien || []);
const xe = (r) => { const n = r.vet.filter((e) => e.loai === 'nhip'); return n.length ? n[n.length - 1].robot : { x: 2, y: 2 }; };
const r1 = chay('spray()\nwait()\n');
kiem('spray() không đối số = phun nhẹ: sự kiện ban luc "low", xe không giật, đứng yên', !r1.loi && sk(r1).some((e) => e.ma === 'ban' && e.luc === 'low') && !sk(r1).some((e) => e.ma === 'giat') && xe(r1).y === 2, J(r1.loi || xe(r1)));
const r2 = chay('spray("high")\nwait()\n');
kiem('màn chưa mở lực: spray("high") là lỗi luc-chua-mo', r2.loi && r2.loi.ma === 'luc-chua-mo', J(r2.loi));
const r3 = chay('spray("high")\nwait()\n', { lucBan: true });
kiem('màn mở lực: spray("high") phun mạnh, xe giật lùi một ô', !r3.loi && sk(r3).some((e) => e.ma === 'giat' && e.di) && xe(r3).y === 3, J(r3.loi || xe(r3)));
const r4 = chay('spray_back("high")\nwait()\n', { lucBan: true });
kiem('spray_back("high") giật tới một ô', !r4.loi && xe(r4).y === 1, J(r4.loi || xe(r4)));
const r5 = chay('spray("fast")\nwait()\n', { lucBan: true });
kiem('chữ lực cũ "fast" là lỗi luc-ban-sai, lời báo nêu "low" hoặc "high"', r5.loi && r5.loi.ma === 'luc-ban-sai' && /"low" hoặc "high"/.test(r5.loi.thongDiep), J(r5.loi));
kiem('SanHoc.LUC_BAN = ["low", "high"]; TEN_CU_VOI_PHUN shoot → spray, shoot_back → spray_back', J(SanHoc.LUC_BAN) === J(['low', 'high']) && SanHoc.TEN_CU_VOI_PHUN.shoot === 'spray' && SanHoc.TEN_CU_VOI_PHUN.shoot_back === 'spray_back');

console.log('== Lời báo tên cũ ==');
const manPhun = ManHoc.danhSach.find((m) => m.ma === 'sung-hoi.3');
const rc = ChamHoc.cham(JSON.parse(J(manPhun)), { chinh: ['shoot()', 'wait()'], hamCuaMan: [] }, []);
const cd = (rc.chanDoan || []).map((c) => c.loi || '').join(' ');
kiem('gõ shoot() ở màn vòi phun: chẩn đoán nói "shoot() giờ là spray()"', /shoot\(\) giờ là spray\(\)/.test(cd), cd.slice(0, 160));

console.log('== Chuyển dữ liệu đã lưu (luu.js) ==');
function taoLuu(duLieu) {
  const m = new Map(Object.entries(duLieu));
  const ls = {
    get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }
  };
  const window = { localStorage: ls };
  vm.runInNewContext(fs.readFileSync(path.join(day, 'game', 'luu.js'), 'utf8'), { window, console });
  return { Luu: window.Luu, m };
}
const khoCu = J({ ds: [{ ten: 'fire', thamSo: ['p'], than: ['shoot(p)', 'wait()'] }, { ten: 'blast_left', thamSo: [], than: ['tr_left()', 'fire("charge")', 'tr_right()'] },
  { ten: 'firewall', thamSo: [], than: ['move()'] }] });
const { Luu, m } = taoLuu({
  'duong-hoc:kho-ham': khoCu,
  'duong-hoc:nhap:luc-ban.3': J({ chinh: ['shoot_back("fast")', 'wait()', "shoot('charge')"], hamCuaMan: [] }),
  'duong-hoc:san-thu:aim_fire': J({ rong: 5 }),
  'khac:shoot': 'shoot()'
});
const kho = m.get('duong-hoc:kho-ham');
kiem('kho hàm: fire → squirt, shoot(p) → spray(p), blast_left → spray_left, fire("charge") → squirt("high"); tên chứa chữ fire (firewall) giữ nguyên',
  /"ten":"squirt"/.test(kho) && /spray\(p\)/.test(kho) && /"ten":"spray_left"/.test(kho) && /squirt\(\\"high\\"\)/.test(kho) && /"ten":"firewall"/.test(kho) && !/shoot|blast|"fire"/.test(kho), kho);
const nh = m.get('duong-hoc:nhap:luc-ban.3');
kiem('bản nháp: shoot_back("fast") → spray_back("low"), nháy đơn \'charge\' → \'high\'', /spray_back\(\\"low\\"\)/.test(nh) && /spray\('high'\)/.test(nh), nh);
kiem('sân thử đổi khóa theo tên hàm mới: san-thu:aim_fire → san-thu:auto_spray', m.has('duong-hoc:san-thu:auto_spray') && !m.has('duong-hoc:san-thu:aim_fire'));
kiem('khóa ngoài duong-hoc: không đụng; cờ đã chuyển ghi 1', m.get('khac:shoot') === 'shoot()' && m.get('duong-hoc:doi-ten-phun') === '1');
m.set('duong-hoc:nhap:x', J({ chinh: ['shoot()'] }));
Luu.chuyenTenPhun();
kiem('chạy lại không chuyển nữa (cờ đã có)', /shoot/.test(m.get('duong-hoc:nhap:x')));
kiem('doiTenPhun giữ ranh giới từ: my_shoot_x, shooter không đổi', Luu.doiTenPhun('my_shoot_x() shooter shoot()') === 'my_shoot_x() shooter spray()', Luu.doiTenPhun('my_shoot_x() shooter shoot()'));

console.log('== Màn không còn tên cũ ==');
const CU = new RegExp('\\b(' + Object.keys(Luu.TEN_PHUN).join('|') + ')\\b|["\'](fast|charge)["\']');
const conCu = [];
for (const mn of ManHoc.danhSach) {
  for (const b of [mn.loiGiai, mn.maMau, ...(mn.loiSai || []).map((x) => x.baiLam || x)]) {
    if (!b || typeof b !== 'object') continue;
    const s = J(b);
    if (CU.test(s)) { conCu.push(mn.ma); break; }
  }
}
kiem('không lời giải / mã mẫu / lời sai nào còn tên cũ', conCu.length === 0, conCu.slice(0, 12).join(', '));

console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exitCode = hong ? 1 : 0;
