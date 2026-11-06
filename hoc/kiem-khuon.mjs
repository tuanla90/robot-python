// kiem-khuon.mjs — kiểm các mùa đã dựng theo khuôn 4×8 của hoc/KE-HOACH-4-MUA-COT-LOI.md (chạy: node hoc/kiem-khuon.mjs).
// Mỗi màn: lời giải mẫu thắng đủ 3 sao, CHỈ với hàm của chính nó (tên hàm tự đặt nên không màn nào dựa vào màn trước).
// Mỗi dạng bài: code mẫu đúng kiểu của dạng đó (Mùa 1 theo khuôn mới ManHoc.khuonMoi, Mùa 2-4 tạm giữ khuôn cũ). Màn viết mở thì lời giải và các cách khác đều thắng, đi khác đường.
// Mỗi cột: đúng bộ part theo chuỗi chuyển part của kế hoạch. Không tuple / dict / set / list lồng.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'lo-trinh-hoc.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));

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
const HAM_CAM = { 'khoang-cach': 'front_clear', tu: 'front_metal', camera: 'color', 'hong-ngoai': 'warm' };

const loi = [];
const trong = (s) => !String(s).trim();
const ban = (m, chinh) => ({ chinh, hamCuaMan: m.loiGiai.hamCuaMan || [] });

function moiDong(m) {
  const ds = [...m.loiGiai.chinh, ...m.maMau.chinh];
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

function kiemCot(mua, c) {
  const ds = ManHoc.danhSach.filter((m) => m.chuong === c.ma);
  if (ds.length !== 8) loi.push(`${c.ma}: có ${ds.length} màn, phải đúng 8`);
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
  });
}

/** Luật lấp hố của mùa 2: chỉ thùng sắt mang tới rồi magnet_off() mới lấp được, không có cách đi xuyên qua hố. */
function kiemLapHo() {
  const man = ManHoc.danhSach.find((m) => m.ma === 'm2-c4-san.1');
  if (!man) return loi.push('thiếu màn m2-c4-san.1');
  const chay = (chinh, them = {}) => ChamHoc.cham({ ...man, chiChay: false, ...them }, { chinh, hamCuaMan: [] }, []);
  const ma = (kq) => kq.chanDoan.map((c) => c.ma);
  const qua = ['go_right()', 'go_right()', 'go_right()', 'go_right()', 'go_right()', 'go_right()'];
  if (!ma(chay(qua)).includes('roi-ho')) loi.push('lấp hố: không mang thùng mà bước vào hố phải rơi');
  const mang = ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'go_right()', 'go_right()', 'go_right()'];
  const k1 = chay(mang);
  if (k1.thang || ma(k1).includes('roi-ho')) loi.push('lấp hố: mang thùng nhưng chưa thả thì không rơi và không đi xuyên qua được');
  const dungDan = ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'magnet_off()', 'go_right()', 'go_right()', 'go_right()'];
  if (!chay(dungDan).thang) loi.push('lấp hố: thả thùng ở hố rồi đi tiếp phải thắng');
  if (chay(dungDan, { vatChat: man.vatChat.map((h) => h.replace('s', 'N')) }).thang) loi.push('lấp hố: vật nam châm không lấp được hố');
  const batLai = ['go_right()', 'magnet_n()', 'go_right()', 'go_right()', 'magnet_off()', 'magnet_n()', 'go_right()', 'go_right()', 'go_right()'];
  const k2 = chay(batLai);
  if (k2.thang || !ma(k2).includes('dam-tuong')) loi.push('lấp hố: bật lại nam châm trên ô đã lấp thì thùng phải giữ nhện lại');
  const moLai = ['magnet_n()', 'for i in range(3):', '    go_right()', 'magnet_off()', 'magnet_n()', 'magnet_off()', 'for i in range(3):', '    go_right()'];
  if (!chay(moLai).thang) loi.push('lấp hố: tắt nam châm rồi phải bước đi được');
  // hoạt cảnh: nhịp đầu của bước đi được mang .nua (đi nửa ô), nhịp đầu của bước bị chặn thì không
  const nhipDau = (kq) => kq.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien.filter((s) => s.ma === 'chuan-bi'));
  if (!nhipDau(chay(dungDan)).every((s) => s.nua && s.nua.x === 1 && s.nua.y === 0)) loi.push('hoạt cảnh: mọi bước đi được phải đi nửa ô ở nhịp đầu');
  if (nhipDau(k2).filter((s) => s.nua).length !== 3) loi.push('hoạt cảnh: bước bị thùng giữ thì nhịp đầu phải đứng tại chỗ');
}

/** Luật đất của mùa 4: tưới đất không khô thì úng, ô phủ rơm warm() không đọc được, gieo ngoài luống hỏng, không dùng danh sách thì chưa qua, lưới bắt đúng tầm 2 ô. */
function kiemNongTrai() {
  const tim = (ma) => ManHoc.danhSach.find((m) => m.ma === ma);
  const chay = (man, chinh) => ChamHoc.cham({ ...man, chiChay: false, chiSapXep: false }, { chinh, hamCuaMan: man.loiGiai.hamCuaMan || [] }, []);
  const ma = (kq) => kq.chanDoan.map((c) => c.ma);
  const m2 = tim('m4-c3-cam-bien.2'), m6 = tim('m4-c3-cam-bien.6'), g1 = tim('m4-c2-tay.1'), g6 = tim('m4-c2-tay.6'), l3 = tim('m4-c1-than.3');
  if (chay(m2, ['spray()', 'spray()', 'spray()']).thang !== true) loi.push('nông trại: tưới đủ số lần phải thắng');
  if (!ma(chay({ ...m2, datKho: ['...', '1..', '...'] }, ['go_right()', 'spray()'])).includes('ung-dat')) loi.push('nông trại: tưới đất không khô phải úng');
  if (chay(m6, ['for i in range(4):', '    if warm():', '        spray()', '    go_right()']).thang) loi.push('nông trại: không được tưới được cả hai sân mà không dùng luống đo');
  const quaRom = chay(m6, ['go_down()', 'for i in range(4):', '    if warm():', '        spray()', '    go_right()']);
  if (quaRom.thang) loi.push('nông trại: warm() không được đọc xuyên rơm');
  if (!ma(chay(g1, ['seed("red")', 'go_right()', 'go_right()', 'go_right()', 'seed("red")'])).includes('to-thua')) loi.push('nông trại: gieo ngoài luống phải dừng');
  if (chay(g6, ['for i in range(3):', '    go_right()']).thang) loi.push('nông trại: không gieo thì không thắng');
  const khongList = chay({ ...g1, canList: true, chiChay: false }, ['seed("red")', 'go_right()', 'seed("blue")', 'go_right()', 'seed("yellow")']);
  if (khongList.thang || !ma(khongList).includes('chua-dung-list')) loi.push('nông trại: canList phải bắt dùng danh sách');
  if (chay(l3, ['go_left()', 'cast_net("right")']).thang) loi.push('nông trại: lưới không được thắng khi chưa đưa bao tới đích');
  const xa = chay(l3, ['go_left()', 'cast_net("right")', 'go_left()', 'go_left()', 'go_down()', 'drop_net()']);
  if (xa.thang || !ma(xa).length) loi.push('nông trại: bao ngoài tầm 2 ô thì lưới phải hụt');
}

/** Bảng nhịp: mọi lệnh trên khay 128 màn phải có số nhịp trong SanHoc.SO_NHIP (cảm biến 0 nhịp), và chạy thật đúng số đó trên sân trống. */
function kiemBangNhip() {
  const CAM = /^(front_clear|left_clear|right_clear|front_metal|front_pole|color|warm)$/;
  const CHAY_THU = { seed: 'seed("red")' };
  const daThu = {};
  ManHoc.danhSach.forEach((m) => m.hamGoc.forEach((ten) => {
    if (CAM.test(ten)) return;
    const can = SanHoc.soNhipLenh(m.loaiRobot, ten);
    if (can === undefined) { loi.push(`bảng nhịp: ${m.loaiRobot} thiếu ${ten}`); return; }
    const khoa = m.loaiRobot + ':' + ten;
    if (daThu[khoa]) return;
    daThu[khoa] = true;
    const nen = m.loaiRobot === 'xuong' ? '~' : '.', co = m.loaiRobot === 'xuong' ? 'Q' : 'F';
    const san = [co + nen.repeat(4)].concat(Array(4).fill(nen.repeat(5)));
    const man = { ...m, san, batDau: { x: 2, y: 2, huong: 0 }, mucTieu: 'toi-co', vatChat: undefined, mau: undefined, dong: undefined, datKho: undefined, hinh: undefined, chiChay: false, chiSapXep: false, canList: false, noi: undefined };
    const kq = ChamHoc.cham(man, { chinh: [(CHAY_THU[ten] || ten + '()')], hamCuaMan: [] }, []);
    const nhip = kq.soNhip;
    if (nhip !== can) loi.push(`bảng nhịp: ${khoa} khai ${can} nhịp, chạy thật ${nhip}`);
  }));
}

/** wait() là lệnh đợi để đồng bộ hai xe: hai đường cắt nhau ở cùng một nhịp thì đụng, một xe đợi 2 nhịp thì cả hai tới cờ. Lệnh nhiều nhịp vẫn đúng khi chạy đội. */
function kiemHaiXe() {
  const cfg = {
    san: ['..F..', '.....', '....F', '.....', '.....'], loaiRobot: 'banh', mucTieu: 'toi-co',
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
loi.forEach((s) => console.log('HỎNG:', s));
console.log('---');
console.log(`${MUA.map((x) => x.ten).join(', ')}: ${tong} màn, ${loi.length} lỗi.`);
process.exit(loi.length ? 1 : 0);
