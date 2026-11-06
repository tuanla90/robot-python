// kiem-m1-nhanh.mjs — kiểm Mùa 1 theo khuôn 4×8 của hoc/KE-HOACH-4-MUA-COT-LOI.md (chạy: node hoc/kiem-m1-nhanh.mjs).
// Mỗi màn: lời giải mẫu thắng đủ 3 sao, CHỈ với hàm của chính nó (tên hàm tự đặt nên không màn nào dựa vào màn trước).
// Mỗi dạng bài: code mẫu đúng kiểu của hàng đó. Mỗi cột: đúng bộ part theo chuỗi xây dần. Không tuple / dict / set / list lồng.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));

const O_TOI_DA = 10;                     // khung chương trình trên giao diện vẽ đúng 10 hàng (man-choi.js, TP.Editor tong: 10)
const COT = [
  { ma: 'm1-c1-than', tay: null, cam: false, wait: false },
  { ma: 'm1-c2-tay', tay: 'kep', cam: false, wait: true },
  { ma: 'm1-c3-cam-bien', tay: 'kep', cam: true, wait: true },
  { ma: 'm1-c4-san', tay: 'kep', cam: true, wait: true }
];

const loi = [];
const trong = (s) => !String(s).trim();
const ban = (m, chinh) => ({ chinh, hamCuaMan: m.loiGiai.hamCuaMan || [] });

function moiDong(m) {
  const ds = [...m.loiGiai.chinh, ...m.maMau.chinh];
  [...(m.loiGiai.hamCuaMan || []), ...(m.loiGiai.hamCuaEmMoi || [])].forEach((f) => ds.push(...f.than));
  return ds;
}
/** Thay lời gọi hàm của em bằng thân hàm (để thử: không dùng hàm thì có qua được không). */
function traiHam(dong, ham) {
  return dong.flatMap((d) => {
    const k = /^(\s*)(\w+)\(\)$/.exec(d), f = k && ham.find((x) => x.ten === k[2]);
    return f ? traiHam(f.than, ham).map((s) => k[1] + s) : [d];
  });
}
function kiemDuDoan(m, kq, bao) {
  const dd = m.duDoan;
  if (!dd || !Array.isArray(dd.luaChon) || dd.luaChon.length < 2 || !(dd.dung >= 0 && dd.dung < dd.luaChon.length)) return bao('hàng 2 thiếu duDoan hợp lệ');
  const xm = dd.xacMinh || {}, ts = kq.theoSan[0];
  if (!Object.keys(xm).length) bao('duDoan thiếu xacMinh');
  Object.entries(xm.lenh || {}).forEach(([ten, n]) => {
    const co = ts.vet.filter((e) => e.loai === 'lenh' && e.ten === ten).length;
    if (co !== n) bao(`đáp án dự đoán sai: ${ten}() chạy ${co} lần, đáp án ghi ${n}`);
  });
  ['x', 'y', 'huong'].forEach((k) => { if (xm[k] !== undefined && ts.robot[k] !== xm[k]) bao(`đáp án dự đoán sai: robot.${k} = ${ts.robot[k]}, đáp án ghi ${xm[k]}`); });
  (xm.vat || []).forEach((o) => { if (!(ts.vat || []).some((v) => v.x === o.x && v.y === o.y)) bao(`đáp án dự đoán sai: không có vật ở (${o.x},${o.y}), vật cuối: ${JSON.stringify(ts.vat)}`); });
}
function kiemDang(m, kq, bao) {
  const lg = m.loiGiai.chinh, mm = m.maMau.chinh, hamLg = m.loiGiai.hamCuaEmMoi || [];
  const thuaMau = () => { if (ChamHoc.cham(m, ban(m, mm), []).thang) bao('code mẫu đã thắng sẵn'); };
  if (m.so <= 2 && !m.chiChay) bao('thiếu chiChay');
  if (m.so === 2) kiemDuDoan(m, kq, bao);
  if (m.so === 3) {
    const oTrong = mm.filter(trong).length;
    if (oTrong < 1 || oTrong > 2) bao(`hàng 3 phải thiếu 1-2 dòng, đang thiếu ${oTrong}`);
    if (mm.length !== lg.length || mm.some((d, i) => !trong(d) && d !== lg[i])) bao('code mẫu hàng 3 phải trùng lời giải, trừ ô trống');
    thuaMau();
  }
  if (m.so === 4) {
    if (!m.chiSapXep) bao('thiếu chiSapXep');
    if ([...mm].sort().join('|') !== [...lg].sort().join('|')) bao('hàng 4: code mẫu phải đúng các dòng của lời giải, chỉ khác thứ tự');
    thuaMau();
  }
  if (m.so === 5) {
    const khac = mm.length === lg.length ? mm.filter((d, i) => d !== lg[i]).length : -1;
    const moDau = mm.length === lg.length ? null : ChamHoc.cham(m, ban(m, mm), []);
    if (khac !== 1 && !(moDau && Math.abs(mm.length - lg.length) <= 2)) bao(`hàng 5 phải sai đúng 1 chỗ, đang khác ${khac} dòng`);
    thuaMau();
    if (m.loiMa) { const cd = ChamHoc.cham(m, ban(m, mm), []).chanDoan.map((c) => c.ma); if (!cd.includes(m.loiMa)) bao(`hàng 5: code mẫu không báo mã ${m.loiMa}, có: ${cd.join(', ')}`); }
  }
  if (m.so >= 6 && mm.length) bao('hàng 6-8 phải là màn trống');
  if (m.so <= 7 && m.so >= 3 && !m.goiY.length) bao('hàng này cần có gợi ý');
  if (m.so === 7) {
    if (!m.canHamTuDat || m.taoHam.length) bao('hàng 7 phải tự đặt tên hàm (canHamTuDat, không taoHam)');
    if (!hamLg.length) bao('hàng 7 thiếu hàm mẫu');
    const phang = traiHam(lg, hamLg);
    if (ChamHoc.cham(m, ban(m, phang), []).thang) bao('hàng 7: không viết hàm mà vẫn qua được');
  }
  if (m.so === 8) {
    if (m.goiY.length) bao('hàng 8 không có gợi ý');
    if (m.hang !== 'trum' || !m.huyHieu || !m.huyHieu.ma || !m.huyHieu.ten) bao('hàng 8 phải là trum, có huyHieu { ma, ten }');
  }
}

COT.forEach((c) => {
  const ds = ManHoc.danhSach.filter((m) => m.chuong === c.ma);
  if (ds.length !== 8) loi.push(`${c.ma}: có ${ds.length} màn, phải đúng 8`);
  ds.forEach((m) => {
    const bao = (s) => loi.push(`${m.ma} (${m.dangBai}) ${m.ten}: ${s}`);
    if (m.robot.than !== 'hai-banh' || m.loaiRobot !== 'banh') bao('thân phải là hai bánh');
    if (m.robot.tay !== c.tay) bao(`tay phải là ${c.tay}`);
    if (!!(m.robot.camBien || []).length !== c.cam || m.hamGoc.includes('front_clear') !== c.cam) bao(`cảm biến phải ${c.cam ? 'có' : 'chưa có'}`);
    if (m.hamGoc.includes('wait') !== c.wait) bao(`wait() ${c.wait ? 'phải có' : 'không được có'} trên khay`);
    if (m.khung.chinh > O_TOI_DA || m.khung.moiHam > O_TOI_DA) bao(`khung quá ${O_TOI_DA} ô, giao diện không vẽ hết`);
    if (m.hamGoc.some((n) => /left_move|right_move|left_back|right_back/.test(n))) bao('còn lệnh hai bánh độc lập cũ');
    moiDong(m).forEach((d) => { if (/[\[\]{}]|\btuple\b|\bdict\b|\bset\(/.test(d)) bao(`cú pháp bị cấm: ${d}`); });
    let kq;
    try { kq = ChamHoc.cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi || []); }
    catch (e) { return bao('ném lỗi: ' + e.message); }
    if (!kq.thang) return bao('lời giải không thắng: ' + JSON.stringify(kq.chanDoan.slice(0, 2).map((x) => x.ma + ': ' + x.loi)));
    if (kq.sao !== 3 || m.sao.o !== kq.soO || m.sao.nhip !== kq.soNhip) bao(`sao ${kq.sao}; thực tế o=${kq.soO} nhip=${kq.soNhip}, đang khai o=${m.sao.o} nhip=${m.sao.nhip}`);
    if (kq.chanDoan.some((x) => x.muc === 'loi')) bao('lời giải còn lỗi: ' + kq.chanDoan.map((x) => x.ma).join(','));
    kiemDang(m, kq, bao);
  });
});

const tong = ManHoc.danhSach.filter((m) => m.chuong.startsWith('m1-')).length;
if (tong !== 32) loi.push(`Mùa 1 có ${tong} màn, phải đúng 32`);
loi.forEach((s) => console.log('HỎNG:', s));
console.log('---');
console.log(`Mùa 1: ${tong} màn, ${loi.length} lỗi.`);
process.exit(loi.length ? 1 : 0);
