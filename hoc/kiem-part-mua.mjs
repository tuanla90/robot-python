// Kiểm luật "R1 là cỗ máy của mùa" (KE-HOACH-PART-DUNG-MUA.md, user chốt 31/10): theo lộ trình XUẤT BẢN, mỗi màn mùa 1–4
// - R1 (man.robot, suy như game/ve-robot.js) chỉ mang part của mùa: thân mùa; tay mùa đã mở (gói 2 trở đi; mùa 1 từ gói 6 chỉ tay xoay); cảm biến mùa (gói 3 trở đi).
// - Đội chỉ ở gói đội (mùa 1: gói 8 Gặp R2; mùa 2–4: gói 9); R2 mang part mùa trước (mùa 1: part mùa 1).
// Mùa đã dựng lại nằm trong XONG thì một màn sai là HỎNG; mùa chưa dựng lại chỉ in số màn còn sai (để theo dõi tiến độ).
// Chạy: node hoc/kiem-part-mua.mjs [--chi-tiet]      Tự chứng minh bắt lỗi: node hoc/kiem-part-mua.mjs --loi-gia (phải HỎNG)
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const VR = require('./game/ve-robot.js');

const XONG = new Set(['mua-1']);      // thêm 'mua-2'… khi mùa đó dựng lại xong (mua-1: PDM1 31/10)
const CHI_TIET = process.argv.includes('--chi-tiet');
const LOI_GIA = process.argv.includes('--loi-gia');

// Part từng mùa. tay(g) / cam(g): part được phép ở gói g (1..10).
const MUA = {
  'mua-1': { than: 'hai-banh', tay: g => g < 2 ? [] : g < 6 ? ['kep'] : ['xoay'], cam: g => g < 3 ? [] : ['khoang-cach'], goiDoi: [8, 9] },
  'mua-2': { than: 'xich', tay: g => g < 2 ? [] : ['hoi'], cam: g => g < 3 ? [] : ['hong-ngoai'], goiDoi: [9] },
  'mua-3': { than: 'nhen', tay: g => g < 2 ? [] : ['nam-cham'], cam: g => g < 3 ? [] : ['tu'], goiDoi: [9] },
  'mua-4': { than: 'drone', tay: g => g < 2 ? [] : ['son'], cam: g => g < 3 ? [] : ['camera-4'], goiDoi: [9] }
};
const THU_MUA = Object.keys(MUA);
const THAN_LOAI = { banh: 'hai-banh', nhen: 'nhen', xich: 'xich', omni: 'omni', drone: 'drone' };
// Cảm biến suy từ khay lệnh (màn cũ không khai man.robot.camBien).
const CAM_THEO_LENH = { front_clear: 'khoang-cach', left_clear: 'khoang-cach', right_clear: 'khoang-cach', distance: 'hong-ngoai', warm: 'hong-ngoai', front_metal: 'tu', front_pole: 'tu' };

/** { than, tay, cam: [mã] } của một robot (cấu hình màn hay một phần tử man.doi). */
function partCua(man, r) {
  const goc = (r && r.hamGoc) || man.hamGoc || [];
  const ch = VR.cauHinhCua({ robot: r || man.robot, hamGoc: goc, loaiRobot: man.loaiRobot });
  const than = (r || man.robot || {}).than || THAN_LOAI[man.loaiRobot] || ch.than;
  const cam = new Set(ch.camBien.map(c => c.ma).filter(c => c !== 'pin'));
  if (!(r || man.robot || {}).camBien) for (const t of goc) if (CAM_THEO_LENH[t]) cam.add(CAM_THEO_LENH[t]);
  return { than, tay: ch.tay, cam: [...cam] };
}
/** Mùa (chỉ số trong THU_MUA) sở hữu một part. */
function muaCuaPart(loai, ma) {
  for (let i = 0; i < THU_MUA.length; i++) {
    const s = MUA[THU_MUA[i]];
    if (loai === 'than' && s.than === ma) return i;
    if (loai === 'tay' && [...s.tay(10), ...s.tay(5)].includes(ma)) return i;
    if (loai === 'cam' && s.cam(10).includes(ma)) return i;
  }
  return 99;        // part mùa sau (omni, máy ném…) hay mã lạ
}

const sai = {};       // mùa → [ "mã: lý do" ]
function ghi(mua, ma, lyDo) { (sai[mua] = sai[mua] || []).push(ma + ': ' + lyDo); }

for (const mua of THU_MUA) {
  const s = MUA[mua];
  const goi = TT.goi.filter(g => g.mua === mua);
  goi.forEach((g, i) => {
    const so = i + 1;
    for (const c of g.chuong) for (const man of M.danhSach.filter(m => m.chuong === c)) {
      const r1 = partCua(man);
      if (LOI_GIA && mua === 'mua-1' && man.ma === 'hai-banh.1') r1.than = 'xich';
      if (r1.than !== s.than) ghi(mua, man.ma, `gói ${so}: R1 thân ${r1.than}, mùa là ${s.than}`);
      if (r1.tay && !s.tay(so).includes(r1.tay)) ghi(mua, man.ma, `gói ${so}: R1 tay ${r1.tay} (được: ${s.tay(so).join(', ') || 'chưa có tay'})`);
      for (const cb of r1.cam) if (!s.cam(so).includes(cb)) ghi(mua, man.ma, `gói ${so}: R1 cảm biến ${cb} (được: ${s.cam(so).join(', ') || 'chưa có cảm biến'})`);
      // Gói 10 "chạy một mình": màn nào cũng nhiều sân (mỗi sân một ngày làm việc), một robot.
      if (so === 10 && !(Array.isArray(man.san[0]) && man.san.length >= 2)) ghi(mua, man.ma, 'gói 10: chỉ một sân (gói chạy một mình cần nhiều sân)');
      if (man.doi && man.doi.length > 1) {
        if (!s.goiDoi.includes(so)) ghi(mua, man.ma, `gói ${so}: có đội, đội chỉ ở gói ${s.goiDoi.join(' / ')}`);
        const muaNay = THU_MUA.indexOf(mua), tran = mua === 'mua-1' ? 0 : muaNay - 1;
        man.doi.slice(1).forEach((d, k) => {
          const r2 = partCua(man, d.robot ? Object.assign({}, d.robot, { hamGoc: d.hamGoc }) : { hamGoc: d.hamGoc });
          const ds = [['than', r2.than], ['tay', r2.tay], ...r2.cam.map(c => ['cam', c])].filter(x => x[1]);
          for (const [loai, ma] of ds) if (muaCuaPart(loai, ma) > tran) ghi(mua, man.ma, `R${k + 2} mang ${ma} (R2 chỉ mang part mùa trước)`);
        });
      }
    }
  });
}

let hong = false;
for (const mua of THU_MUA) {
  const ds = sai[mua] || [];
  const chat = XONG.has(mua) || (LOI_GIA && mua === 'mua-1');
  console.log(`${chat ? '[chặt]' : '[theo dõi]'} ${mua}: ${ds.length} màn sai luật part`);
  if (CHI_TIET || chat) ds.slice(0, CHI_TIET ? 1e9 : 30).forEach(d => console.log('   ✗ ' + d));
  if (chat && ds.length) hong = true;
}
assert.ok(XONG.size === 0 || [...XONG].every(m => MUA[m]), 'XONG có mùa lạ');
console.log(hong ? 'HỎNG: R1 mang part ngoài mùa ở mùa đã dựng lại' : 'ĐẠT: luật part đúng mùa (mùa đã dựng lại: ' + ([...XONG].join(', ') || 'chưa có') + ')');
if (hong) process.exit(1);
