// kiem-khuon.mjs — kiểm các mùa đã dựng theo khuôn 4×8 của hoc/KE-HOACH-4-MUA-COT-LOI.md (chạy: node hoc/kiem-khuon.mjs).
// Mỗi màn: lời giải mẫu thắng đủ 3 sao, CHỈ với hàm của chính nó (tên hàm tự đặt nên không màn nào dựa vào màn trước).
// Mỗi dạng bài: code mẫu đúng kiểu của dạng đó (cả 4 mùa theo khuôn mới ManHoc.khuonMoi). Màn viết mở thì lời giải và các cách khác đều thắng, đi khác đường.
// Mỗi cột: đúng bộ part theo chuỗi chuyển part của kế hoạch. Không tuple / dict / set / list lồng.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
globalThis.BAN_GAME = 'on-thi';                 // bản Ôn thi (hoc/ban.js): kho hàm, bảng ghép, Sổ lệnh theo bản 5 mùa
const ChamHoc = require(path.join(day, '..', 'cham.js'));
const LapRap = require('../lap-rap.js');
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));
const SanHoc = require(path.join(day, '..', 'san-hoc.js'));
require(path.join(day, '..', 'game', 'huy-hieu-vector.js'));
const HuyHieuVector = globalThis.VeVector.HUY_HIEU;

const O_TOI_DA = 10;                     // khung chương trình trên giao diện vẽ đúng 10 hàng (man-choi.js, TP.Editor tong: 10)
const NHEN = ['go_up', 'go_down', 'go_left', 'go_right'];
const BANH = ['forward', 'backward', 'turn_left', 'turn_right'];
const DRONE = ['go_up', 'go_down', 'go_left', 'go_right'];
const MUA = [
  { ten: 'Mùa 1', tien: 'm1-', than: 'hai-banh', loai: 'banh', di: BANH, cot: [
    { ma: 'm1-c1-than', tay: null, cam: null },
    { ma: 'm1-c2-tay', tay: 'kep', cam: null },
    { ma: 'm1-c3-cam-bien', tay: 'kep', cam: 'khoang-cach' },
    { ma: 'm1-c4-san', tay: 'kep', cam: 'khoang-cach' }
  ] },
  { ten: 'Mùa 2', tien: 'm2-', than: 'nhen', loai: 'nhen', di: NHEN, cot: [
    { ma: 'm2-c1-than', tay: 'kep', cam: 'khoang-cach' },
    { ma: 'm2-c2-tay', tay: 'nam-cham', cam: 'khoang-cach' },
    { ma: 'm2-c3-cam-bien', tay: 'nam-cham', cam: 'tu' },
    { ma: 'm2-c4-san', tay: 'nam-cham', cam: 'tu' }
  ] },
  { ten: 'Mùa 3', tien: 'm3-', than: 'xuong', loai: 'xuong', di: BANH, cot: [
    { ma: 'm3-c1-than', tay: 'nam-cham', cam: 'tu' },
    { ma: 'm3-c2-tay', tay: 'day-keo', cam: 'tu' },
    { ma: 'm3-c3-cam-bien', tay: 'day-keo', cam: 'camera' },
    { ma: 'm3-c4-san', tay: 'day-keo', cam: 'camera' }
  ] },
  { ten: 'Mùa 4', tien: 'm4-', than: 'drone', loai: 'drone', di: DRONE, cot: [
    { ma: 'm4-c1-than', tay: 'day-keo', cam: 'camera' },
    { ma: 'm4-c2-tay', tay: 'hoi', cam: 'camera' },
    { ma: 'm4-c3-cam-bien', tay: 'hoi', cam: 'hong-ngoai' },
    { ma: 'm4-c4-san', tay: 'hoi', cam: 'hong-ngoai,camera' }
  ] }
];
// Mùa 5: mỗi màn hai xe. Mỗi xe là một cỗ máy "nhà". khoa: số xe khóa của cột. Cột 3, 4 làm sau nên mùa này chưa đủ 32 màn.
const MUA_DOI = { ten: 'Mùa 5', tien: 'm5-', soMan: 32, cot: [{ ma: 'm5-c1-co-san', khoa: 1 }, { ma: 'm5-c2-hai-xe', khoa: 0 }, { ma: 'm5-c3-chon-xe', khoa: 0, chon: 7 }, { ma: 'm5-c4-lap-part', khoa: 0, chon: 7, lap: true }] };
const HAM_CAM = { 'khoang-cach': 'front_clear', tu: 'front_metal', camera: 'color', 'hong-ngoai': 'warm' };

const loi = [];
const trong = (s) => !String(s).trim();
const ban = (m, chinh) => ({ chinh, hamCuaMan: m.loiGiai.hamCuaMan || [] });

function moiDong(m) {
  const chinh = (b) => (b.doi ? b.doi.flatMap((x) => x.chinh) : b.chinh);
  const ds = [...chinh(m.loiGiai), ...chinh(m.maMau)];
  [...(m.loiGiai.hamCuaMan || []), ...(m.loiGiai.hamCuaEmMoi || [])].forEach((f) => ds.push(...f.than));
  return ds;
}
/** Thay lời gọi hàm của em bằng thân hàm, đối số thay vào tên tham số (để thử: không dùng hàm thì có qua được không). */
function traiHam(dong, ham) {
  return dong.flatMap((d) => {
    const k = /^(\s*)(\w+)\((.*)\)$/.exec(d), f = k && ham.find((x) => x.ten === k[2]);
    if (!f) return [d];
    const doiSo = f.thamSo && f.thamSo.length === 1 ? [k[3].trim()] : k[3].split(',').map((x) => x.trim());      // một tham số: đối số có thể là danh sách [2, 1]
    const gan = (s) => (f.thamSo || []).reduce((t, p, i) => t.replace(new RegExp('\\b' + p + '\\b', 'g'), doiSo[i]), s);
    return traiHam(f.than.map(gan), ham).map((s) => k[1] + s);
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
/** Đường robot đi qua trên sân đầu: để biết hai cách có thật sự đi khác nhau không. */
function duongDi(kq) {
  return kq.vet.filter((e) => e.loai === 'nhip').map((e) => e.robot.x + ',' + e.robot.y + ',' + e.robot.huong).join(' ');
}
/** Màn viết mở: có ít nhất hai cách thắng đi khác đường. doiCho: có bài chỉ đạt mốc gọn và bài chỉ đạt mốc nhanh. Không doiCho: lời giải hoặc một cách khác đủ 3 sao. Mốc sao không chặt hơn các cách đã biết. */
function kiemVietMo(m, kq, bao) {
  const cach = [kq];
  (m.cachKhac || []).forEach((c, i) => {
    const k = ChamHoc.cham(m, { chinh: c.chinh, hamCuaMan: m.loiGiai.hamCuaMan || [] }, c.hamCuaEmMoi || []);
    if (!k.thang) return bao(`cách khác ${i + 1} không thắng: ${JSON.stringify(k.chanDoan.slice(0, 2).map((x) => x.ma))}`);
    cach.push(k);
  });
  if (cach.length < 2) return bao('viết mở phải có ít nhất một cách khác');
  if (new Set(cach.map(duongDi)).size < 2) bao('viết mở: các cách phải đi khác đường');
  const oIt = Math.min(...cach.map((k) => k.soO)), nhipIt = Math.min(...cach.map((k) => k.soNhip));
  if (m.sao.o < oIt) bao(`mốc gọn ${m.sao.o} chặt hơn mọi cách đã biết (ít nhất ${oIt} ô)`);
  if (m.sao.nhip < nhipIt) bao(`mốc nhanh ${m.sao.nhip} chặt hơn mọi cách đã biết (ít nhất ${nhipIt} nhịp)`);
  if (m.doiCho) {
    if (!cach.some((k) => k.datO && !k.datNhip)) bao('doiCho: thiếu bài chỉ đạt mốc gọn');
    if (!cach.some((k) => k.datNhip && !k.datO)) bao('doiCho: thiếu bài chỉ đạt mốc nhanh');
  } else if (!cach.some((k) => k.sao === 3)) bao('viết mở không đánh đổi: phải có một cách đủ 3 sao');
}
function kiemDang(m, kq, bao) {
  const lg = m.loiGiai.chinh, mm = m.maMau.chinh, hamLg = m.loiGiai.hamCuaEmMoi || [], dang = m.dangBai;
  const thuaMau = () => { if (ChamHoc.cham(m, ban(m, mm), []).thang) bao('code mẫu đã thắng sẵn'); };
  if (['chi-xem', 'du-doan', 'xem-doan'].includes(dang) && !m.chiChay) bao('thiếu chiChay');
  if (dang === 'du-doan' || dang === 'xem-doan') kiemDuDoan(m, kq, bao);
  if (dang === 'dien') {
    const oTrong = mm.filter(trong).length;
    if (oTrong < 1 || oTrong > 2) bao(`dạng điền phải thiếu 1-2 dòng, đang thiếu ${oTrong}`);
    if (mm.length !== lg.length || mm.some((d, i) => !trong(d) && d !== lg[i])) bao('code mẫu dạng điền phải trùng lời giải, trừ ô trống');
    thuaMau();
  }
  if (dang === 'sap-xep') {
    if (!m.chiSapXep) bao('thiếu chiSapXep');
    if ([...mm].sort().join('|') !== [...lg].sort().join('|')) bao('dạng sắp xếp: code mẫu phải đúng các dòng của lời giải, chỉ khác thứ tự');
    thuaMau();
    if (m.chonDoi) LapRap.dsCachChon(m).forEach((chon) => {
      if (chon.join() === m.chonDoi.cachMau[0].chon.join()) return;
      if (ChamHoc.cham(LapRap.apDungDoi(m, chon), m.loiGiai, hamLg(m)).thang) bao(`dạng điền phải đọc code mới chọn được xe: đội ${chon.join(' + ')} cũng thắng`);
    });
  }
  if (dang === 'sua-loi') {
    const khac = mm.length === lg.length ? mm.filter((d, i) => d !== lg[i]).length : -1;
    const moDau = mm.length === lg.length ? null : ChamHoc.cham(m, ban(m, mm), []);
    if (khac !== 1 && !(moDau && Math.abs(mm.length - lg.length) <= 2)) bao(`dạng sửa lỗi phải sai đúng 1 chỗ, đang khác ${khac} dòng`);
    thuaMau();
    if (m.loiMa) { const cd = ChamHoc.cham(m, ban(m, mm), []).chanDoan.map((c) => c.ma); if (!cd.includes(m.loiMa)) bao(`dạng sửa lỗi: code mẫu không báo mã ${m.loiMa}, có: ${cd.join(', ')}`); }
  }
  if (['viet', 'viet-mo', 'viet-ham', 'tu-luc'].includes(dang) && mm.length) bao('các dạng tự viết phải là màn trống');
  if (['dien', 'sap-xep', 'sua-loi', 'viet', 'viet-mo', 'viet-ham'].includes(dang) && !m.goiY.length) bao('hàng này cần có gợi ý');
  if (dang === 'viet-mo') kiemVietMo(m, kq, bao);
  if (dang === 'viet-ham') {
    if (!m.canHamTuDat || m.taoHam.length) bao('dạng viết hàm phải tự đặt tên hàm (canHamTuDat, không taoHam)');
    if (!hamLg.length) bao('dạng viết hàm thiếu hàm mẫu');
    const phang = traiHam(lg, hamLg);
    if (ChamHoc.cham(m, ban(m, phang), []).thang) bao('dạng viết hàm: không viết hàm mà vẫn qua được');
    if (m.canThamSo) {                                                                          // màn dạy tham số: mỗi lời gọi chép thành một hàm riêng không tham số thì không được qua
      const rieng = [];
      const chinh = lg.map((d) => {
        const k = /^(\s*)(\w+)\((.*)\)$/.exec(d), f = k && hamLg.find((x) => x.ten === k[2]);
        if (!f || !(f.thamSo || []).length) return d;
        const doiSo = f.thamSo.length === 1 ? [k[3].trim()] : k[3].split(',').map((x) => x.trim());
        const gan = (s) => f.thamSo.reduce((t, p, i) => t.replace(new RegExp('\\b' + p + '\\b', 'g'), doiSo[i]), s);
        rieng.push({ ten: f.ten + '_' + rieng.length, thamSo: [], than: f.than.map(gan) });
        return k[1] + rieng[rieng.length - 1].ten + '()';
      });
      if (!(m.loiGiai.hamCuaEmMoi || []).some((h) => (h.thamSo || []).length)) bao('canThamSo mà hàm mẫu không có tham số');
      if (ChamHoc.cham(m, ban(m, chinh), rieng).thang) bao('canThamSo: hàm không tham số mà vẫn qua được');
    }
  }
  if (dang === 'tu-luc') {
    if (m.goiY.length) bao('hàng 8 không có gợi ý');
    if (m.hang !== 'trum' || !m.huyHieu || !m.huyHieu.ma || !m.huyHieu.ten) bao('hàng 8 phải là trum, có huyHieu { ma, ten }');
  }
}

/** Màn dạy biến: bỏ biến n, viết thẳng một số vào chỗ đọc n mà vẫn qua thì biến chỉ để trang trí. */
function kiemBoBien(m, bao) {
  const hamEm = m.loiGiai.hamCuaEmMoi || [];
  const coN = (ds) => ds.some((d) => /^\s*n = \d+\s*$/.test(d));
  if (m.chiChay || !(coN(m.loiGiai.chinh) || hamEm.some((f) => coN(f.than)))) return;
  const bo = (ds, k) => ds.filter((d) => !/^\s*n = (\d+|n \+ \d+)\s*$/.test(d)).map((d) => d.replace(/\bn\b/g, String(k)));
  for (let k = 1; k <= 12; k++) {
    const ham = hamEm.map((f) => ({ ...f, than: bo(f.than, k) }));
    if (ChamHoc.cham(m, ban(m, bo(m.loiGiai.chinh, k)), ham).thang) return bao(`biến n chỉ để trang trí: bỏ biến, viết thẳng số ${k} vẫn qua`);
  }
}

/** Chọn số thật cao không được qua: đổi từng số trong lời giải (range, n = ..., n = n + ..., đối số của lời gọi) thành 9 hoặc 12, rồi đổi tất cả cùng lúc. */
function kiemSoCao(m, bao) {
  if (m.chiChay) return;
  const RE = /^(.*\brange\(\s*|\s*n\s*=\s*n\s*\+\s*|\s*n\s*=\s*|\s*\w+\()(\d+)(\s*\)?:?\s*)$/;
  const hamEm = m.loiGiai.hamCuaEmMoi || [], hamMan = m.loiGiai.hamCuaMan || [];
  const coSo = (d, v) => { const k = RE.exec(d); return k && Number(k[2]) < v ? k : null; };
  const doi = (ds, v, chiSo) => ds.map((d, i) => { const k = (chiSo === undefined || chiSo === i) && coSo(d, v); return k ? k[1] + v + k[3] : d; });
  const thang = (chinh, em, man) => ChamHoc.cham(m, { chinh, hamCuaMan: man }, em).thang;
  [9, 12].forEach((v) => {
    const baoNeu = (qua, moTa) => { if (qua) bao(`chọn số cao vẫn qua: ${moTa} thành ${v}`); };
    m.loiGiai.chinh.forEach((d, i) => { if (coSo(d, v)) baoNeu(thang(doi(m.loiGiai.chinh, v, i), hamEm, hamMan), d.trim()); });
    hamEm.forEach((f, j) => f.than.forEach((d, i) => { if (coSo(d, v)) baoNeu(thang(m.loiGiai.chinh, hamEm.map((x, q) => (q === j ? { ...x, than: doi(x.than, v, i) } : x)), hamMan), f.ten + ': ' + d.trim()); }));
    hamMan.forEach((f, j) => f.than.forEach((d, i) => { if (coSo(d, v) && moiDong(m).some((x) => new RegExp('\\b' + f.ten + '\\(').test(x))) baoNeu(thang(m.loiGiai.chinh, hamEm, hamMan.map((x, q) => (q === j ? { ...x, than: doi(x.than, v, i) } : x))), f.ten + ': ' + d.trim()); }));
    baoNeu(thang(doi(m.loiGiai.chinh, v), hamEm.map((x) => ({ ...x, than: doi(x.than, v) })), hamMan.map((x) => ({ ...x, than: doi(x.than, v) }))) && moiDong(m).some((d) => coSo(d, v)), 'mọi số');
  });
}

function kiemCot(mua, c) {
  const ds = ManHoc.danhSach.filter((m) => m.chuong === c.ma);
  if (ds.length !== 8) loi.push(`${c.ma}: có ${ds.length} màn, phải đúng 8`);
  const rb = HuyHieuVector.ROBOT_COT[c.ma], gon = (r) => JSON.stringify({ than: r.than, tay: r.tay || null, camBien: r.camBien || [] });
  if (!rb) loi.push(`${c.ma}: chưa có hình huy hiệu cột (ROBOT_COT, huy-hieu-vector.js)`);
  ds.forEach((m) => { if (rb && gon(rb) !== gon(m.robot)) loi.push(`${m.ma}: huy hiệu cột vẽ ${gon(rb)}, màn dùng ${gon(m.robot)}`); if (m.huyHieu && m.huyHieu.ma !== c.ma) loi.push(`${m.ma}: huy hiệu hàng 8 phải là hình của cột ${c.ma}`); });
  ds.forEach((m) => {
    const bao = (s) => loi.push(`${m.ma} (${m.dangBai}) ${m.ten}: ${s}`);
    if (m.robot.than !== mua.than || m.loaiRobot !== mua.loai) bao(`thân phải là ${mua.than}`);
    if (m.robot.tay !== c.tay) bao(`tay phải là ${c.tay}`);
    const cam = (m.robot.camBien || []).map((x) => x.ma);
    if (cam.join() !== (c.cam || '')) bao(`cảm biến phải là ${c.cam}, đang là ${cam.join()}`);
    Object.entries(HAM_CAM).forEach(([ma, ham]) => { const can = (c.cam || '').split(',').includes(ma); if (m.hamGoc.includes(ham) !== can) bao(`${ham}() ${can ? 'phải có' : 'không được có'} trên khay`); });
    if (!m.doi && m.hamGoc.includes('wait')) bao('wait() chỉ để đợi: chỉ màn có hai xe mới đưa lên khay');
    if (!m.doi && moiDong(m).some((d) => /^\s*wait\(\)/.test(d))) bao('còn wait() trong code: lệnh tự chốt nhịp rồi');
    if (mua.di.some((n) => !m.hamGoc.includes(n))) bao(`khay thiếu lệnh đi: ${mua.di.join(', ')}`);
    if (m.khung.chinh > O_TOI_DA || m.khung.moiHam > O_TOI_DA) bao(`khung quá ${O_TOI_DA} ô, giao diện không vẽ hết`);
    if (m.hamGoc.some((n) => /left_move|right_move|left_back|right_back/.test(n))) bao('còn lệnh hai bánh độc lập cũ');
    moiDong(m).forEach((d) => { if ((m.cauTruc.includes('list') ? /\[\s*\[|\]\s*\[|[{}]|\btuple\b|\bdict\b|\bset\(/ : /[\[\]{}]|\btuple\b|\bdict\b|\bset\(/).test(d)) bao(`cú pháp bị cấm: ${d}`); });
    let kq;
    try { kq = ChamHoc.cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi || []); }
    catch (e) { return bao('ném lỗi: ' + e.message); }
    if (!kq.thang) return bao('lời giải không thắng: ' + JSON.stringify(kq.chanDoan.slice(0, 2).map((x) => x.ma + ': ' + x.loi)));
    if (m.dangBai !== 'viet-mo' && (kq.sao !== 3 || m.sao.o !== kq.soO || m.sao.nhip !== kq.soNhip)) bao(`sao ${kq.sao}; thực tế o=${kq.soO} nhip=${kq.soNhip}, đang khai o=${m.sao.o} nhip=${m.sao.nhip}`);
    if (kq.chanDoan.some((x) => x.muc === 'loi')) bao('lời giải còn lỗi: ' + kq.chanDoan.map((x) => x.ma).join(','));
    kiemDang(m, kq, bao);
    kiemBoBien(m, bao);
    kiemSoCao(m, bao);
  });
}

/** Luật lấp hố của mùa 2: chỉ thùng sắt mang tới rồi magnet_off() mới lấp được, không có cách đi xuyên qua hố. */
function kiemLapHo() {
  const man = ManHoc.danhSach.find((m) => m.ma === 'm2-c4-san.1');
  if (!man) return loi.push('thiếu màn m2-c4-san.1');
  const chay = (chinh, them = {}) => ChamHoc.cham({ ...man, chiChay: false, ...them }, { chinh, hamCuaMan: [] }, []);
  const ma = (kq) => kq.chanDoan.map((c) => c.ma);
  const qua = ['go_right()', 'go_right()', 'go_right()', 'go_right()', 'go_right()', 'go_right()'];
  const khongThung = { san: man.san.map((h) => h.replace('o', '.')), vatChat: man.vatChat.map((h) => h.replace('s', '.')) };
  if (!ma(chay(qua, khongThung)).includes('roi-ho')) loi.push('lấp hố: không mang thùng mà bước vào hố phải rơi');
  const chan = chay(['go_right()', 'go_right()']);
  if (!ma(chan).includes('dam-tuong')) loi.push('nam châm: thùng nằm đất phải chắn đường nhện');
  const R = '"right"', mang = [`magnet_n(${R})`, 'go_right()', 'go_right()', 'go_right()', 'go_right()'];
  const k1 = chay(mang);
  if (k1.thang || !ma(k1).includes('roi-ho')) loi.push('lấp hố: mang thùng mà bước vào hố vẫn phải rơi');
  const dungDan = [`magnet_n(${R})`, 'go_right()', 'go_right()', 'magnet_off()', 'go_right()', 'go_right()', 'go_right()', 'go_right()'];
  if (!chay(dungDan).thang) loi.push('lấp hố: thả thùng xuống hố kề bên rồi đi tiếp phải thắng');
  const cucN = { vatChat: man.vatChat.map((h) => h.replace('s', 'N')) };
  if (chay(dungDan.map((d) => d.replace('magnet_n', 'magnet_s')), cucN).thang) loi.push('lấp hố: vật nam châm không lấp được hố');
  if (chay(dungDan, cucN).thang) loi.push('nam châm: cùng cực thì đẩy, không mang được vật');
  const batLai = dungDan.slice(0, 4).concat([`magnet_n(${R})`], dungDan.slice(4));
  if (!chay(batLai).thang) loi.push('lấp hố: bật lại nam châm trên ô đã lấp vẫn phải bước đi được');
  if (!ma(chay(['magnet_n()'])).includes('huong-nam-cham-sai')) loi.push('nam châm: nhện bật không kèm hướng phải báo lỗi');
  if (!ma(chay(['magnet_n("xeo")'])).includes('huong-nam-cham-sai')) loi.push('nam châm: nhện bật sai hướng phải báo lỗi');
  // hoạt cảnh: nhịp đầu của bước đi được mang .nua (đi nửa ô), nhịp đầu của bước bị chặn thì không
  const nhipDau = (kq) => kq.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien.filter((s) => s.ma === 'chuan-bi'));
  if (!nhipDau(chay(dungDan)).every((s) => s.nua && s.nua.x === 1 && s.nua.y === 0)) loi.push('hoạt cảnh: mọi bước đi được phải đi nửa ô ở nhịp đầu');
  if (nhipDau(chan).some((s) => s.nua)) loi.push('hoạt cảnh: bước bị thùng chắn thì nhịp đầu phải đứng tại chỗ');
}

/** Luật đất của mùa 4: tưới đất không khô thì úng, ô phủ rơm warm() không đọc được, gieo ngoài luống hỏng, không dùng danh sách thì chưa qua, lưới bắt đúng tầm 2 ô. */
function kiemNongTrai() {
  const tim = (ma) => ManHoc.danhSach.find((m) => m.ma === ma);
  const chay = (man, chinh) => ChamHoc.cham({ ...man, chiChay: false, chiSapXep: false }, { chinh, hamCuaMan: man.loiGiai.hamCuaMan || [] }, []);
  const ma = (kq) => kq.chanDoan.map((c) => c.ma);
  const m2 = tim('m4-c3-cam-bien.1'), m6 = tim('m4-c3-cam-bien.4'), g1 = tim('m4-c2-tay.1'), g6 = tim('m4-c2-tay.4'), l3 = tim('m4-c1-than.2');
  if (chay(m2, ['spray()', 'spray()', 'spray()']).thang !== true) loi.push('nông trại: tưới đủ số lần phải thắng');
  if (!ma(chay({ ...m2, datKho: ['...', '1..', '...'] }, ['go_right()', 'spray()'])).includes('ung-dat')) loi.push('nông trại: tưới đất không khô phải úng');
  if (chay(m6, ['for i in range(4):', '    if warm():', '        spray()', '    go_right()']).thang) loi.push('nông trại: không được tưới được cả hai sân mà không dùng luống đo');
  const quaRom = chay(m6, ['go_down()', 'for i in range(4):', '    if warm():', '        spray()', '    go_right()']);
  if (quaRom.thang) loi.push('nông trại: warm() không được đọc xuyên rơm');
  if (!ma(chay(g1, ['seed("red")', 'go_right()', 'go_right()', 'go_right()', 'seed("red")'])).includes('to-thua')) loi.push('nông trại: gieo ngoài luống phải dừng');
  if (chay(g6, ['for i in range(3):', '    go_right()']).thang) loi.push('nông trại: không gieo thì không thắng');
  const khongList = chay({ ...g1, canList: true, chiChay: false }, ['seed("red")', 'go_right()', 'seed("blue")', 'go_right()', 'seed("yellow")']);
  if (khongList.thang || !ma(khongList).includes('chua-dung-list')) loi.push('nông trại: canList phải bắt dùng danh sách');
  const baoHat = tim('m4-c1-than.4'), viet = (dau, do_, xanh) => [...dau, 'c = color()', 'trai(2)', 'cast_net("right")', 'if c == "red":', '    trai(' + do_ + ')', 'else:', '    trai(' + xanh + ')', 'tha()'];
  const dsA = ['a = [5, 3]'];
  if (!ma(chay(baoHat, viet(dsA, '5', '3'))).includes('chua-dung-list')) loi.push('nông trại: gán danh sách rồi không đọc thì chưa tính là dùng');
  if (!ma(chay(baoHat, viet(dsA, 'a[0]', '3'))).includes('chua-dung-chi-so')) loi.push('nông trại: canChiSo phải bắt lấy đủ các vị trí');
  if (!chay(baoHat, viet(['a = [3, 5]'], 'a[1]', 'a[0]')).thang) loi.push('nông trại: đổi thứ tự danh sách rồi lấy đúng vị trí vẫn phải thắng');
  if (!chay(baoHat, ['a = [5, 3]', 'k = 0', 'if color() == "blue":', '    k = 1', 'trai(2)', 'cast_net("right")', 'trai(a[k])', 'tha()']).thang) loi.push('nông trại: chỉ số là biến a[k] vẫn phải thắng');
  if (chay(l3, ['go_left()', 'cast_net("right")']).thang) loi.push('nông trại: lưới không được thắng khi chưa đưa bao tới đích');
  const xa = chay(l3, ['go_left()', 'cast_net("right")', 'go_left()', 'go_left()', 'go_down()', 'drop_net()']);
  if (xa.thang || !ma(xa).length) loi.push('nông trại: bao ngoài tầm 2 ô thì lưới phải hụt');
}

/** Bảng nhịp: mọi lệnh trên khay 128 màn phải có số nhịp trong SanHoc.SO_NHIP (cảm biến 0 nhịp), và chạy thật đúng số đó trên sân trống. */
function kiemBangNhip() {
  const CAM = /^(front_clear|left_clear|right_clear|front_metal|front_pole|color|warm)$/;
  const CHAY_THU = { seed: 'seed("red")' };
  const daThu = {};
  // Khay lọc hàm của em theo robot (thanh-phan.js LENH_GOC): lệnh gốc nào không có trong đó thì hàm của xe khác lọt vào khay mà không chạy được.
  const nguonTP = fs.readFileSync(path.join(day, '..', 'game', 'thanh-phan.js'), 'utf8');
  const nguonKhay = nguonTP.match(/var LENH_GOC = \[([^\]]*)\]/)[1] + ',' + nguonTP.match(/if \(OT\) LENH_GOC = \[([^\]]*)\]/)[1];   // bản Ôn thi thêm forward / pick… (thanh-phan.js)
  const lenhKhay = new Set(nguonKhay.match(/[a-z_0-9]+/g).concat(require('../kho-ham.js').HAM_GOC_ON_THI));
  ManHoc.danhSach.forEach((m) => m.hamGoc.forEach((ten) => { if (!lenhKhay.has(ten)) loi.push(`khay: bộ lọc hàm theo robot không biết lệnh ${ten} (thanh-phan.js LENH_GOC)`); }));
  ManHoc.danhSach.forEach((m) => m.hamGoc.forEach((ten) => {
    if (CAM.test(ten)) return;
    const can = SanHoc.soNhipLenh(m.loaiRobot, ten);
    if (can === undefined) { loi.push(`bảng nhịp: ${m.loaiRobot} thiếu ${ten}`); return; }
    const khoa = m.loaiRobot + ':' + ten;
    if (daThu[khoa]) return;
    daThu[khoa] = true;
    const nen = m.loaiRobot === 'xuong' ? '~' : '.', co = m.loaiRobot === 'xuong' ? 'Q' : 'F';
    const san = [co + nen.repeat(4)].concat(Array(4).fill(nen.repeat(5)));
    const man = { ...m, doi: undefined, san, batDau: { x: 2, y: 2, huong: 0 }, mucTieu: 'toi-co', vatChat: undefined, mau: undefined, dong: undefined, datKho: undefined, hinh: undefined, chiChay: false, chiSapXep: false, canList: false, noi: undefined };
    const chayThu = m.loaiRobot === 'nhen' && /^magnet_[ns]$/.test(ten) ? ten + '("up")' : (CHAY_THU[ten] || ten + '()');
    const kq = ChamHoc.cham(man, { chinh: [chayThu], hamCuaMan: [] }, []);
    const nhip = kq.soNhip;
    if (nhip !== can) loi.push(`bảng nhịp: ${khoa} khai ${can} nhịp, chạy thật ${nhip}`);
  }));
}

/** wait() là lệnh đợi để đồng bộ hai xe: hai đường cắt nhau ở cùng một nhịp thì đụng, một xe đợi 2 nhịp thì cả hai tới cờ. Lệnh nhiều nhịp vẫn đúng khi chạy đội. */
function kiemHaiXe() {
  const cfg = {
    san: ['..F..', '.....', '....F', '.....', '.....'], loaiRobot: 'banh', mucTieu: 'toi-co', banOnThi: true,
    hamGoc: ['forward', 'backward', 'turn_left', 'turn_right', 'wait'],
    doi: [{ batDau: { x: 0, y: 2, huong: 1 } }, { batDau: { x: 2, y: 4, huong: 0 } }]
  };
  const di = (n) => Array(n).fill('forward()').join('\n');
  if (SanHoc.chay(cfg, [di(4), di(4)]).thang) loi.push('hai xe: cùng đi qua ngã tư cùng nhịp phải đụng nhau');
  if (!SanHoc.chay(cfg, ['wait()\nwait()\n' + di(4), di(4)]).thang) loi.push('hai xe: một xe wait() hai nhịp (đợi xe kia đi khỏi ngã tư) thì phải qua được');
  // xe quay 2 nhịp: xe 1 mất 2 nhịp quay nên tới ngã tư sau xe 2, không cần wait()
  const cfgQuay = { ...cfg, doi: [{ batDau: { x: 0, y: 2, huong: 0 } }, cfg.doi[1]] };
  if (!SanHoc.chay(cfgQuay, ['turn_right()\n' + di(4), di(4)]).thang) loi.push('hai xe: xe quay 2 nhịp phải tới ngã tư muộn hơn xe đi thẳng');
}

/** Mùa 1: cột 1 chỉ dùng lệnh thường, for bắt đầu từ hàng 1 của cột 2. */
function kiemThuTuFor() {
  const coFor = (m) => moiDong(m).some((d) => /^\s*for\b/.test(d));
  ManHoc.danhSach.filter((m) => m.chuong === 'm1-c1-than').forEach((m) => {
    if (m.cauTruc.includes('for') || coFor(m)) loi.push(`${m.ma}: cột 1 Mùa 1 chưa được dùng for`);
  });
  ['m1-c2-tay.1', 'm1-c2-tay.2'].forEach((ma) => { const m = ManHoc.danhSach.find((x) => x.ma === ma); if (!m || !coFor(m)) loi.push(`${ma}: phải giới thiệu for`); });
}

/* ---------------------------------------------------------------- màn hai xe */
const baiDoi = (m, ds) => ({ doi: ds.map((chinh) => ({ chinh })), hamCuaMan: m.loiGiai.hamCuaMan || [] });
const dsLg = (m) => m.loiGiai.doi.map((x) => x.chinh);
const dsMau = (m) => m.maMau.doi.map((x) => x.chinh);
const hamLg = (m) => m.loiGiai.hamCuaEmMoi || [];
/** Nhịp cuối cùng xe còn đổi vị trí hay hướng. */
function nhipDung(d) {
  let cuoi = 0, t = 0, truoc = null;
  d.vet.filter((e) => e.loai === 'nhip').forEach((e) => { t++; const s = [e.robot.x, e.robot.y, e.robot.huong].join(); if (s !== truoc) cuoi = t; truoc = s; });
  return cuoi;
}
function duongDoi(kq) { return kq.theoSan[0].doi.map((d) => d.vet.filter((e) => e.loai === 'nhip').map((e) => [e.robot.x, e.robot.y, e.robot.huong].join()).join(' ')).join(' | '); }
function kiemDangDoi(m, kq, bao) {
  const lg = dsLg(m), mm = dsMau(m), dang = m.dangBai, em = m.doi.map((r, i) => i).filter((i) => !m.doi[i].coDinh);
  const thuaMau = () => { if (ChamHoc.cham(m, baiDoi(m, mm), []).thang) bao('code mẫu đã thắng sẵn'); };
  m.doi.forEach((r, i) => { if (r.coDinh && mm[i].join('|') !== lg[i].join('|')) bao('xe khóa phải chạy đúng lời giải'); });
  if (dang === 'xem-doan') {
    if (!m.chiChay) bao('thiếu chiChay');
    const dd = m.duDoan, xm = (dd && dd.xacMinh) || {};
    if (!dd || !Array.isArray(dd.luaChon) || !(dd.dung >= 0 && dd.dung < dd.luaChon.length)) bao('hàng 1 thiếu duDoan hợp lệ');
    if (!xm.nhipXe) bao('duDoan hai xe thiếu xacMinh.nhipXe');
    else kq.theoSan[0].doi.forEach((d, i) => { if (nhipDung(d) !== xm.nhipXe[i]) bao(`đáp án dự đoán sai: R${i + 1} xong ở nhịp ${nhipDung(d)}, đáp án ghi ${xm.nhipXe[i]}`); });
  }
  if (dang === 'dien') {
    const oTrong = em.flatMap((i) => mm[i]).filter(trong).length;
    if (oTrong < 1 || oTrong > 2) bao(`dạng điền phải thiếu 1-2 dòng, đang thiếu ${oTrong}`);
    em.forEach((i) => { if (mm[i].length !== lg[i].length || mm[i].some((d, j) => !trong(d) && d !== lg[i][j])) bao(`R${i + 1}: code mẫu dạng điền phải trùng lời giải, trừ ô trống`); });
    thuaMau();
  }
  if (dang === 'sua-loi') {
    let khac = 0;
    em.forEach((i) => { if (mm[i].length !== lg[i].length) khac = 99; else khac += mm[i].filter((d, j) => d !== lg[i][j]).length; });
    if (khac !== 1) bao(`dạng sửa lỗi phải sai đúng 1 chỗ, đang khác ${khac} dòng`);
    thuaMau();
  }
  if (['viet', 'viet-mo', 'viet-ham', 'tu-luc'].includes(dang) && em.some((i) => mm[i].length)) bao('các dạng tự viết: xe của em phải trống');
  if (['dien', 'sua-loi', 'viet', 'viet-mo', 'viet-ham'].includes(dang) && !m.goiY.length) bao('hàng này cần có gợi ý');
  if (dang === 'viet-mo') {
    const cach = [kq];
    (m.cachKhac || []).forEach((c, i) => {
      const k = ChamHoc.cham(m, { doi: c.doi, hamCuaMan: m.loiGiai.hamCuaMan || [] }, c.hamCuaEmMoi || []);
      if (!k.thang) return bao(`cách khác ${i + 1} không thắng: ${JSON.stringify(k.chanDoan.slice(0, 2).map((x) => x.ma))}`);
      cach.push(k);
    });
    ((m.chonDoi && m.chonDoi.cachMau) || []).slice(1).forEach((c) => {
      const k = ChamHoc.cham(LapRap.apDungDoi(m, c), { doi: c.loiGiai.doi, hamCuaMan: [] }, c.loiGiai.hamCuaEmMoi || []);
      if (!k.thang) return bao(`đội ${c.chon.join(' + ')} không thắng: ${JSON.stringify(k.chanDoan.slice(0, 2).map((x) => x.ma + ': ' + x.loi))}`);
      cach.push(k);
    });
    if (cach.length < 2) return bao('viết mở phải có ít nhất một cách khác');
    if (new Set(cach.map(duongDoi)).size < 2) bao('viết mở: các cách phải đi khác đường');
    if (m.sao.o < Math.min(...cach.map((k) => k.soO))) bao('mốc gọn chặt hơn mọi cách đã biết');
    if (m.sao.nhip < Math.min(...cach.map((k) => k.soNhip))) bao('mốc nhanh chặt hơn mọi cách đã biết');
    if (m.doiCho) {
      if (!cach.some((k) => k.datO && !k.datNhip)) bao('doiCho: thiếu bài chỉ đạt mốc gọn');
      if (!cach.some((k) => k.datNhip && !k.datO)) bao('doiCho: thiếu bài chỉ đạt mốc nhanh');
    } else if (!cach.some((k) => k.sao === 3)) bao('viết mở không đánh đổi: phải có một cách đủ 3 sao');
  }
  if (dang === 'viet-ham') {
    if (!m.canHamTuDat || m.taoHam.length) bao('dạng viết hàm phải tự đặt tên hàm (canHamTuDat, không taoHam)');
    if (!hamLg(m).length) bao('dạng viết hàm thiếu hàm mẫu');
    if (ChamHoc.cham(m, baiDoi(m, lg.map((d) => traiHam(d, hamLg(m)))), []).thang) bao('dạng viết hàm: không viết hàm mà vẫn qua được');
  }
  if (dang === 'tu-luc') {
    if (m.goiY.length) bao('hàng 8 không có gợi ý');
    if (m.hang !== 'trum' || !m.huyHieu || !m.huyHieu.ten) bao('hàng 8 phải là trum, có huyHieu { ma, ten }');
    if (m.huyHieu && !HuyHieuVector.co(m.huyHieu.ma)) bao('huy hiệu hàng 8 chưa có hình');
  }
}
/** Chọn số cao không qua được. Riêng số vòng wait(): đợi thừa vẫn thắng nhưng phải mất sao Nhanh. */
function kiemSoCaoDoi(m, bao) {
  if (m.chiChay) return;
  const RE = /^(.*\brange\(\s*)(\d+)(\s*\):?\s*)$/;
  const lg = dsLg(m), ham = hamLg(m);
  [9, 12].forEach((v) => {
    lg.forEach((ds, i) => {
      if (m.doi[i].coDinh) return;
      ds.forEach((d, j) => {
        const k = RE.exec(d);
        if (!k || Number(k[2]) >= v) return;
        const moi = lg.map((x) => x.slice()); moi[i][j] = k[1] + v + k[3];
        const kq = ChamHoc.cham(m, baiDoi(m, moi), ham);
        if (!kq.thang) return;
        const laDoi = (ds[j + 1] || '').trim() === 'wait()';
        if (!laDoi) bao(`chọn số cao vẫn qua: R${i + 1} ${d.trim()} thành ${v}`);
        else if (kq.datNhip) bao(`đợi thừa mà không mất sao Nhanh: R${i + 1} ${d.trim()} thành ${v}`);
      });
    });
  });
}
function kiemCotDoi(c) {
  const ds = ManHoc.danhSach.filter((m) => m.chuong === c.ma);
  if (ds.length !== 8) loi.push(`${c.ma}: có ${ds.length} màn, phải đúng 8`);
  const may = Object.values(ManHoc.CO_MAY).map((x) => JSON.stringify(x.robot));
  const soChon = ds.filter((m) => m.chonDoi).length;
  if (c.chon !== undefined && soChon !== c.chon) loi.push(`${c.ma}: có ${soChon} màn chọn xe, phải đúng ${c.chon}`);
  ds.forEach((m) => {
    const bao = (s) => loi.push(`${m.ma} (${m.dangBai}) ${m.ten}: ${s}`);
    if (!Array.isArray(m.doi) || m.doi.length !== 2) return bao('màn Mùa 5 phải có đúng hai xe');
    if (m.doi.filter((r) => r.coDinh).length !== c.khoa) bao(`cột này phải có ${c.khoa} xe khóa`);
    if (m.chonDoi) LapRap.kiemDuLieuDoi(m).forEach((s) => bao(s));
    if (m.chonDoi) LapRap.dsCachChon(m).forEach((chon) => {
      try { ChamHoc.cham(LapRap.apDungDoi(m, chon), { doi: m.doi.map(() => ({ chinh: [] })), hamCuaMan: [] }, []); }
      catch (e) { bao(`đội ${chon.join(' + ')} làm máy chấm ném lỗi, bảng chọn phải bỏ lựa chọn này: ${e.message}`); }
    });
    m.doi.forEach((r, i) => {
      const { son, ...goc } = r.robot;
      if (!m.chonDoi && !c.lap && !may.includes(JSON.stringify(goc))) bao(`R${i + 1} không phải cỗ máy nhà`);
      if (!r.hamGoc.includes('wait')) bao(`R${i + 1} thiếu wait trên khay`);
    });
    if (m.khung.chinh > O_TOI_DA || m.khung.moiHam > O_TOI_DA) bao(`khung quá ${O_TOI_DA} ô, giao diện không vẽ hết`);
    let kq;
    try { kq = ChamHoc.cham(m, m.loiGiai, hamLg(m)); }
    catch (e) { return bao('ném lỗi: ' + e.message); }
    if (!kq.thang) return bao('lời giải không thắng: ' + JSON.stringify(kq.chanDoan.slice(0, 2).map((x) => x.ma + ': ' + x.loi)));
    if (m.dangBai !== 'viet-mo' && (kq.sao !== 3 || m.sao.o !== kq.soO || m.sao.nhip !== kq.soNhip)) bao(`sao ${kq.sao}; thực tế o=${kq.soO} nhip=${kq.soNhip}, đang khai o=${m.sao.o} nhip=${m.sao.nhip}`);
    if (kq.chanDoan.some((x) => x.muc === 'loi')) bao('lời giải còn lỗi: ' + kq.chanDoan.map((x) => x.ma).join(','));
    moiDong(m).forEach((d) => { if (/[\[\]{}]|\btuple\b|\bdict\b|\bset\(/.test(d)) bao(`cú pháp bị cấm: ${d}`); });
    kiemDangDoi(m, kq, bao);
    kiemSoCaoDoi(m, bao);
    if (m.huyHieu && m.huyHieu.ma !== c.ma) bao(`huy hiệu hàng 8 phải là hình của cột ${c.ma}`);
  });
}
/** Luật hai xe: tới cờ rồi vẫn chạy tiếp, qua cờ là chưa thắng; đụng nhau là thua; xe khóa không tính vào mốc Gọn. */
function kiemLuatDoi() {
  const doi = [{ batDau: { x: 0, y: 2, huong: 0 } }, { batDau: { x: 2, y: 2, huong: 0 } }];
  const nen = { doi, loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep' }, hamGoc: ['forward', 'wait'], mucTieu: 'toi-co', banOnThi: true, damLaThua: true, thangKhiXong: true, khung: { chinh: 10, moiHam: 10, cauTruc: ['for'] }, cauTruc: ['for'], sao: { o: 2, nhip: 1 }, san: ['...', 'F.F', '...'] };
  const chay = (m, a, b) => ChamHoc.cham(m, { doi: [{ chinh: a }, { chinh: b }], hamCuaMan: [] }, []);
  if (!chay(nen, ['forward()'], ['forward()']).thang) loi.push('luật hai xe: đúng cờ phải thắng');
  if (chay(nen, ['forward()', 'forward()'], ['forward()']).thang) loi.push('luật hai xe: một xe đi qua cờ không được thắng');
  const r9 = ['for i in range(9):', '    forward()'];
  if (chay(nen, r9, r9).thang) loi.push('luật hai xe: range(9) không được thắng');
  if (chay(nen, ['forward()'], []).thang) loi.push('luật hai xe: một xe chưa tới cờ không được thắng');
  const khoa = { ...nen, doi: [doi[0], { ...doi[1], coDinh: true }] };
  if (chay(khoa, ['forward()'], ['forward()']).soO !== 1) loi.push('luật hai xe: xe khóa không được tính vào mốc Gọn');
}

let tong = 0;
MUA.forEach((mua) => {
  mua.cot.forEach((c) => kiemCot(mua, c));
  const n = ManHoc.danhSach.filter((m) => m.chuong.startsWith(mua.tien)).length;
  if (n !== 32) loi.push(`${mua.ten} có ${n} màn, phải đúng 32`);
  tong += n;
});
kiemLapHo();
kiemNongTrai();
kiemBangNhip();
kiemHaiXe();
kiemThuTuFor();
MUA_DOI.cot.forEach(kiemCotDoi);
kiemLuatDoi();
{ const n = ManHoc.danhSach.filter((m) => m.chuong.startsWith(MUA_DOI.tien)).length; if (n !== MUA_DOI.soMan) loi.push(`${MUA_DOI.ten} có ${n} màn, phải đúng ${MUA_DOI.soMan}`); tong += n; }
loi.forEach((s) => console.log('HỎNG:', s));
console.log('---');
console.log(`${MUA.map((x) => x.ten).concat(MUA_DOI.ten).join(', ')}: ${tong} màn, ${loi.length} lỗi.`);
process.exit(loi.length ? 1 : 0);
