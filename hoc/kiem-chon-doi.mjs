/* ============================================================================
   kiem-chon-doi.mjs — máy kiểm CHỌN ĐỘI, LẮP ROBOT THỨ HAI, BA ROBOT (gói M9D1 4/11; kế hoạch hoc/KE-HOACH-MUA-9-TO-HOP.md mục 7, 8, 8b, 9.4) của "Mật Lệnh Robot".
   Chưa màn nào trong lộ trình dùng các trường này → máy kiểm tự dựng MÀN GIẢ trong bộ nhớ (không thêm vào lộ trình) và chứng minh:
   A. man.chonDoi (chương 1 chọn đội): LapRap.kiemChon / dsCachChon / apDungDoi / macDinh / kiemDuLieuDoi / thongKeMauDoi / kiemCanManDoi; lỗi lời Việt khi chọn sai;
      robot khoá (coDinh) không bị chọn thay; cách mẫu chạy thật qua máy chấm.
   B. man.lapRap.robot = i (chương 2 tự lắp cho MỘT robot của màn đội): apDung gắn vào man.doi[i], robot khác y nguyên, cờ cỗ máy cũ không sót; kiemDuLieu / thongKeMau / kiemCanMan.
   C. Ba robot, R3 là máy khách khoá (mục 8b "cứu máy khách"): lõi SanHoc.chay 3 robot, thắng chỉ khi CẢ BA tới cờ (R3 tới cờ của nó); cham.js chấm bài đội 3 chương trình; R3 khoá: giao diện gửi maMau.doi[2] (man-choi.js, như 150 robot khoá hiện có), cham.js không tự thay (các máy kiểm lời sai cố ý đổi chương trình robot khoá).
   D. Tự chứng minh: bài không giữ cửa → thua, chẩn đoán R3 đụng cửa; màn cũ (lắp ráp một robot, màn đội không chọn) không đổi dạng.
   Chạy: node hoc/kiem-chon-doi.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LapRap = require(path.join(day, 'lap-rap.js'));
const CoMay = require(path.join(day, 'co-may.js'));
const Cham = require(path.join(day, 'cham.js'));
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ✓ ' + ten); } else { hong++; console.log('  ✗ HỎNG ' + ten + (chiTiet ? '\n      ' + String(chiTiet).slice(0, 1200) : '')); }
}
const J = (o) => JSON.stringify(o);
const clone = (o) => JSON.parse(JSON.stringify(o));
function nem(f) { try { f(); return null; } catch (e) { return e.message; } }

/* ------------------------------------------------------------- hàm của màn dùng chung */
const FWD = { ten: 'forward', thamSo: ['n'], than: ['for i in range(n):', '    left_move()', '    right_move()', '    wait()'] };
const WN = { ten: 'wait_n', thamSo: ['n'], than: ['for i in range(n):', '    wait()'] };
const FLY = { ten: 'fly_right', thamSo: ['n'], than: ['for i in range(n):', '    go_right()'] };
const QUAY_BANH = { ten: 'turn_back', thamSo: [], than: ['for i in range(2):', '    left_move()', '    wait()'] };      // hai bánh: 2 nhịp = 180°
const QUAY_XICH = { ten: 'turn_back', thamSo: [], than: ['for i in range(4):', '    left_move()', '    wait()'] };      // xích: mỗi 90° cần 2 nhịp liên tiếp cùng tổ hợp
const HAM = [FWD, WN, FLY];

/* ------------------------------------------------------------- A. màn giả CHỌN ĐỘI, ba robot, R3 máy khách khoá
   Sân: R1 hàng 1 đi thẳng tới cờ; R2 hàng 2 lùi lên nút đè M (1,2) GIỮ CỬA C (3,3) rồi quay lại đi tới cờ; R3 (khoá, xe cứu hỏa kẹt) hàng 3: chờ 4 nhịp rồi đi thẳng qua cửa tới cờ.
   Mẹo phối hợp "giữ cửa": R2 đứng trên M trong lúc R3 qua cửa. */
const SAN3 = ['########', '#.....F#', '#M....F#', '#..C..F#', '########'];
const R2_GIU_CUA_BANH = ['forward(1)', 'wait_n(10)', 'turn_back()', 'forward(5)'];
const R2_GIU_CUA_XICH = ['forward(1)', 'wait_n(10)', 'turn_back()', 'forward(5)'];
function manChonDoi(them) {
  const r3 = Object.assign(CoMay.dung('CU', { son: 'lam', batDau: { x: 1, y: 3, huong: 1 } }), { coDinh: true, co: [{ x: 6, y: 3 }] });
  return Object.assign({
    ma: 'thu.chon-doi', chuong: 'thu', so: 1, ten: 'thử chọn đội', hang: 'lam-quen', san: SAN3,
    noi: [{ nut: { x: 1, y: 2 }, cua: [{ x: 3, y: 3 }] }],
    batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'toi-co', khung: { chinh: 10, moiHam: 8 }, cauTruc: ['for'], hamCuaEmCan: [], camHamCuaEm: false,
    doi: [{ batDau: { x: 1, y: 1, huong: 1 }, co: [{ x: 6, y: 1 }] }, { batDau: { x: 2, y: 2, huong: 3 }, co: [{ x: 6, y: 2 }] }, r3],
    chonDoi: {
      menu: ['CH', 'DR', 'CU'],
      cachMau: [
        { chon: ['CH', 'CU'], ghiChu: 'đôi tốt', loiGiai: { doi: [{ chinh: ['forward(5)'] }, { chinh: R2_GIU_CUA_XICH }], hamCuaMan: HAM.concat([QUAY_XICH]) } },
        { chon: ['DR', 'CH'], loiGiai: { doi: [{ chinh: ['fly_right(5)'] }, { chinh: R2_GIU_CUA_BANH }], hamCuaMan: HAM.concat([QUAY_BANH]) } }
      ]
    },
    maMau: { doi: [{ chinh: [] }, { chinh: [] }, { chinh: ['wait_n(4)', 'forward(5)'] }], hamCuaMan: HAM },
    loiSai: [], sao: { o: 20, nhip: 24 }
  }, them || {});
}
function chuan(m) { LapRap.macDinh(m); return ManHoc.chuanHoa(m); }

console.log('A. Chọn đội (man.chonDoi)');
{
  const m = manChonDoi();
  kiem('kiemDuLieuDoi: màn giả hợp lệ (không lỗi)', LapRap.kiemDuLieuDoi(m).length === 0, J(LapRap.kiemDuLieuDoi(m)));
  kiem('robotEm: hai robot em lập trình [0, 1], R3 khoá không tính; soChonCua = 2', J(LapRap.robotEm(m)) === '[0,1]' && LapRap.soChonCua(m) === 2);
  const ds = LapRap.dsCachChon(m);
  kiem('dsCachChon: 3 cỗ máy chọn 2 khác nhau, có thứ tự = 6 cách', ds.length === 6 && ds.every((c) => c[0] !== c[1]), J(ds));
  kiem('kiemChon: chọn trùng → ma trung, lời Việt', (() => { const k = LapRap.kiemChon(m, ['CH', 'CH']); return !k.ok && k.ma === 'trung' && /không chọn cùng/.test(k.lyDo); })());
  kiem('kiemChon: cỗ máy ngoài bảng → ma khong-co, gọi tên cỗ máy', (() => { const k = LapRap.kiemChon(m, ['CH', 'XU']); return !k.ok && k.ma === 'khong-co' && /xuồng/.test(k.lyDo); })());
  kiem('kiemChon: thiếu → ma thieu; thừa → ma thua', LapRap.kiemChon(m, ['CH']).ma === 'thieu' && LapRap.kiemChon(m, ['CH', 'DR', 'CU']).ma === 'thua');
  kiem('kiemChon: màn không chonDoi → khong-chon-doi', LapRap.kiemChon({ doi: [{}, {}] }, ['CH', 'DR']).ma === 'khong-chon-doi');
  kiem('apDungDoi ném lỗi lời Việt khi chọn sai', /Hai bạn không chọn cùng một xe chở hàng\./.test(nem(() => LapRap.apDungDoi(m, ['CH', 'CH'])) || ''));
  const a = LapRap.apDungDoi(m, ['DR', 'CU']);
  kiem('apDungDoi: R1 = drone (CoMay.dung DR), R2 = xích có cờ xichDay / lucBan, đế lam; R3 khoá giữ nguyên (xích, coDinh, cờ riêng)',
    a.doi[0].loaiRobot === 'drone' && a.doi[0].robot.than === 'drone' && a.doi[0].hamGoc.includes('go_right') && !a.doi[0].robot.son
    && a.doi[1].loaiRobot === 'xich' && a.doi[1].xichDay === true && a.doi[1].lucBan === true && a.doi[1].robot.son === 'lam' && a.doi[1].hamGoc.includes('spray')
    && a.doi[2] === m.doi[2] && a.doi[2].coDinh === true, J(a.doi.map((r) => [r.loaiRobot, r.robot && r.robot.son, r.coDinh])));
  kiem('apDungDoi: giữ batDau / co riêng của từng robot, trường đầu màn = R1, chonDaChon, manGoc', J(a.doi[1].batDau) === J(m.doi[1].batDau) && J(a.doi[1].co) === J(m.doi[1].co) && a.loaiRobot === 'drone' && J(a.chonDaChon) === '["DR","CU"]' && a.manGoc === m);
  kiem('apDungDoi không đụng màn gốc (man.doi[0] vẫn chưa có cỗ máy)', m.doi[0].loaiRobot === undefined && m.doi[1].robot === undefined);
  kiem('apDungDoi với cách mẫu → loiGiai đội { doi, hamCuaMan, hamCuaEmMoi }; R3 khoá không có trong cách mẫu thì điền maMau.doi[2]', (() => { const b = LapRap.apDungDoi(m, m.chonDoi.cachMau[0]); return Array.isArray(b.loiGiai.doi) && b.loiGiai.doi.length === 3 && J(b.loiGiai.doi[2].chinh) === J(m.maMau.doi[2].chinh) && b.loiGiai.hamCuaMan.length === 4 && Array.isArray(b.loiGiai.hamCuaEmMoi); })());
  const mt = manChonDoi({ chonDoi: Object.assign(clone(manChonDoi().chonDoi), { trung: true }) });
  kiem('chonDoi.trung = true: được chọn hai bạn cùng cỗ máy (9 cách)', LapRap.kiemChon(mt, ['CH', 'CH']).ok && LapRap.dsCachChon(mt).length === 9);
  const ms = manChonDoi({ chonDoi: Object.assign(clone(manChonDoi().chonDoi), { so: 1 }) });
  kiem('chonDoi.so = 1: chỉ chọn một; chọn hai → thua', LapRap.kiemChon(ms, ['DR']).ok && LapRap.kiemChon(ms, ['DR', 'CH']).ma === 'thua');
  const mp = manChonDoi(); mp.doi[0].pin = 6;
  const ap = LapRap.apDungDoi(mp, ['DR', 'CH']);
  kiem('doi[0].pin = 6 + chọn drone → R1 có pin 6 và battery; chọn xe thì không mang pin', ap.doi[0].pin === 6 && ap.doi[0].hamGoc.includes('battery') && LapRap.apDungDoi(mp, ['CH', 'DR']).doi[0].pin === undefined, J([ap.doi[0].pin, ap.doi[0].hamGoc]));

  // bản mặc định (macDinh) + chuanHoa: màn đủ trường để mọi nơi đọc danh sách
  const md = chuan(manChonDoi());
  kiem('macDinh: điền man.doi theo cachMau[0] (R1 xe chở hàng, R2 xe cứu hỏa), trường đầu màn = R1, loiGiai đội', md.doi[0].loaiRobot === 'banh' && md.doi[1].loaiRobot === 'xich' && md.loaiRobot === 'banh' && md.robot.than === 'hai-banh' && Array.isArray(md.loiGiai.doi) && md.doi[2].coDinh === true,
    J([md.doi.map((r) => r.loaiRobot), md.loaiRobot]));
  kiem('macDinh: màn không chonDoi và không lapRap → trả nguyên màn', (() => { const x = { ma: 'x', doi: [{ batDau: { x: 1, y: 1 } }] }; return LapRap.macDinh(x) === x && x.doi[0].loaiRobot === undefined; })());

  // cách mẫu chạy thật qua máy chấm
  const tk = LapRap.thongKeMauDoi(md);
  kiem('thongKeMauDoi: 2 cách mẫu đều THẮNG (R3 máy khách tới cờ), tên cỗ máy, ghiChu', tk.length === 2 && tk.every((x) => x.thang && !x.loi) && tk[0].ten === 'Xe chở hàng + Xe cứu hỏa' && tk[0].ghiChu === 'đôi tốt', J(tk));
  const bay = Cham.cham(LapRap.apDungDoi(md, ['CH', 'DR']), { doi: [{ chinh: ['forward(5)'] }, { chinh: ['go_left()', 'wait_n(10)', 'fly_right(5)'] }], hamCuaMan: HAM }, []);
  kiem('bẫy: chọn drone giữ cửa → drone không đè được nút, R3 kẹt, không thắng (bảng chọn có cỗ máy trông hợp nhưng thiếu đúng một việc)', !bay.thang && !bay.doi[2].toiCo && bay.doi[1].toiCo, J(bay.chanDoan.map((c) => c.ma)));
  kiem('kiemCanManDoi: rỗng (cachMau[0] đạt 3 sao)', LapRap.kiemCanManDoi(md).length === 0 && tk[0].sao === 3, J(LapRap.kiemCanManDoi(md)) + ' sao ' + tk[0].sao);
  const mx = chuan(manChonDoi({ sao: { o: 20, nhip: 5 } }));
  kiem('kiemCanManDoi kêu khi cachMau[0] không đạt 3 sao', LapRap.kiemCanManDoi(mx).some((l) => /3 sao/.test(l)), J(LapRap.kiemCanManDoi(mx)));
  const mh = manChonDoi(); mh.chonDoi.cachMau[1].chon = ['CH', 'CU'];
  kiem('kiemDuLieuDoi kêu cách mẫu trùng, menu mã lạ, thiếu loiGiai.doi', (() => { mh.chonDoi.menu.push('ZZ'); mh.chonDoi.cachMau.push({ chon: ['DR', 'CU'] }); const l = LapRap.kiemDuLieuDoi(mh); return l.some((x) => /trùng/.test(x)) && l.some((x) => /mã lạ/.test(x)) && l.some((x) => /loiGiai\.doi/.test(x)); })());
}

/* ------------------------------------------------------------- C + D. ba robot, máy khách khoá */
console.log('C. Ba robot: R3 máy khách khoá (coDinh) chạy maMau, thắng chỉ khi cả ba tới cờ');
{
  const md = chuan(manChonDoi());
  const a = LapRap.apDungDoi(md, ['DR', 'CH']);
  const R3 = { chinh: md.maMau.doi[2].chinh.slice() };                                   // giao diện gửi chương trình khoá của màn cho robot coDinh (man-choi.js)
  const bai = { doi: [{ chinh: ['fly_right(5)'] }, { chinh: R2_GIU_CUA_BANH }, R3], hamCuaMan: HAM.concat([QUAY_BANH]) };
  const r = Cham.cham(a, bai, []);
  kiem('cham: bài giữ cửa (R2 đứng trên M lúc R3 qua cửa) → thắng, ketQua.doi có 3 robot, R3 toiCo', r.thang && r.doi.length === 3 && r.doi[2].toiCo === true && r.doi[2].loaiRobot === 'xich', J([r.thang, r.doi.length, r.chanDoan.slice(0, 2)]));
  const sk = r.theoSan[0].doi.flatMap((d) => d.vet.filter((v) => v.loai === 'nhip').flatMap((v) => v.suKien || [])).filter((e) => e.ma === 'nut-de');
  kiem('vết có sự kiện nut-de bật ở ô M (giữ cửa) rồi tắt (sự kiện sân nằm ở vết R1, pha D cuối nhịp)', sk.length >= 2 && sk[0].bat === true && sk[0].o.x === 1 && sk[0].o.y === 2 && sk[sk.length - 1].bat === false, J(sk));
  const rSua = Cham.cham(a, { doi: bai.doi.slice(0, 2).concat([{ chinh: ['wait()'] }]), hamCuaMan: bai.hamCuaMan }, []);
  kiem('bài gửi lên đổi chương trình R3 → máy chấm chạy đúng bài đó (R3 đứng yên, không tới cờ, thua): khoá R3 là việc của giao diện (man-choi.js gửi maMau cho robot coDinh)', !rSua.thang && rSua.doi[2].toiCo === false);
  const src = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8');
  kiem('man-choi.js: robot coDinh luôn gửi chương trình của màn (maMau.doi[i]) — R3 máy khách khoá dùng chung cơ chế', /!r\.coDinh && !m\.chiChay \? nd\[i\]\.chinh\.slice\(\) : \(\(md\[i\] && md\[i\]\.chinh\)/.test(src));
  const rK = Cham.cham(a, { doi: [{ chinh: ['fly_right(5)'] }, { chinh: ['turn_back()', 'forward(4)'] }, R3], hamCuaMan: HAM.concat([QUAY_BANH]) }, []);
  kiem('D. bài KHÔNG giữ cửa → thua dù R1, R2 tới cờ; chẩn đoán "R3:" đụng cửa đóng', !rK.thang && rK.doi[0].toiCo && rK.doi[1].toiCo && !rK.doi[2].toiCo && rK.chanDoan.some((c) => /^R3: /.test(c.loi) && /cửa/.test(c.loi)), J(rK.chanDoan.map((c) => c.ma + ' ' + c.loi.slice(0, 60))));
  const rL = Cham.cham(a, { doi: [{ chinh: ['fly_right(5)'] }, { chinh: ['forward(1)', 'turn_back()', 'forward(5)'] }, R3], hamCuaMan: HAM.concat([QUAY_BANH]) }, []);
  kiem('D. R2 rời nút sớm (cửa đóng lại trước khi R3 qua) → thua', !rL.thang && !rL.doi[2].toiCo, J(rL.chanDoan.map((c) => c.ma)));

  // lõi trực tiếp: 3 robot, thắng cần cả ba
  function cfg3(ch3) {
    const mans = a.doi.map((r) => Object.assign({}, a, r));
    return SanHoc.chay({
      san: SAN3, noi: a.noi, mucTieu: 'toi-co', nhipToiDa: 100,
      doi: mans.map((mi) => ({ batDau: mi.batDau, loaiRobot: mi.loaiRobot, hamGoc: mi.hamGoc, camBien: mi.robot.camBien, co: mi.co, xichDay: mi.xichDay, lucBan: mi.lucBan, phanCung: SanHoc.phanCungCua(mi) }))
    }, ['for i in range(5):\n    go_right()', 'left_move()\nright_move()\nwait()\nfor i in range(10):\n    wait()\nleft_move()\nwait()\nleft_move()\nwait()\nfor i in range(5):\n    left_move()\n    right_move()\n    wait()', ch3]);
  }
  const k1 = cfg3('for i in range(4):\n    wait()\nfor i in range(5):\n    left_move()\n    right_move()\n    wait()');
  kiem('lõi SanHoc.chay 3 robot: cả ba tới cờ → thang, doi.length 3', k1.thang === true && k1.doi.length === 3 && k1.doi.every((d) => d.toiCo));
  const k2 = cfg3('for i in range(4):\n    wait()\nfor i in range(3):\n    left_move()\n    right_move()\n    wait()');
  kiem('lõi: R3 dừng trước cờ → KHÔNG thắng dù R1, R2 tới cờ', k2.thang === false && k2.doi[0].toiCo && k2.doi[1].toiCo && !k2.doi[2].toiCo);
  kiem('lõi: cfg.doi 5 robot → ném lỗi (tối đa 4)', /1 đến 4/.test(nem(() => SanHoc.chay({ san: SAN3, doi: [{}, {}, {}, {}, {}] }, ['', '', '', '', ''])) || ''));
}

/* ------------------------------------------------------------- B. lắp robot thứ hai trong màn đội (man.lapRap.robot) */
console.log('B. Lắp ráp cho một robot của màn đội (man.lapRap.robot = 1)');
{
  // R1 = xe chở hàng nhà (đặt sẵn), R2 tự lắp: hai cách mẫu (xích + vòi phun; hai bánh không tay), mỗi cách lời giải đội riêng
  function manLap(them) {
    const r1 = Object.assign(CoMay.dung('CH', { batDau: { x: 1, y: 1, huong: 1 } }), { co: [{ x: 6, y: 1 }] });
    return Object.assign({
      ma: 'thu.lap-r2', chuong: 'thu', so: 2, ten: 'thử lắp R2', hang: 'lam-quen', san: ['########', '#.....F#', '#.....F#', '########'],
      batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'toi-co', khung: { chinh: 10, moiHam: 8 }, cauTruc: ['for'], hamCuaEmCan: [], camHamCuaEm: false,
      loaiRobot: r1.loaiRobot, robot: clone(r1.robot), hamGoc: r1.hamGoc.slice(),                                   // trường đầu màn = R1 (quy ước manCK của man-cuu-*.js)
      doi: [r1, { batDau: { x: 6, y: 2, huong: 3 }, co: [{ x: 6, y: 2 }], son: 'lam' }],
      lapRap: {
        robot: 1, than: ['xich', 'hai-banh'], tay: ['hoi'], camBien: [], nganSach: 6,
        cachLap: [
          { than: 'xich', tay: 'hoi', loiGiai: { doi: [{ chinh: ['forward(5)'] }, { chinh: ['forward(1)', 'turn_back()', 'forward(1)'] }], hamCuaMan: HAM.concat([QUAY_XICH]) } },
          { than: 'hai-banh', tay: null, loiGiai: { doi: [{ chinh: ['forward(5)'] }, { chinh: ['forward(1)', 'turn_back()', 'forward(1)'] }], hamCuaMan: HAM.concat([QUAY_BANH]) } }
        ]
      },
      maMau: { doi: [{ chinh: [] }, { chinh: [] }], hamCuaMan: HAM },
      loiSai: [], sao: { o: 20, nhip: 20 }
    }, them || {});
  }
  const m = manLap();
  kiem('robotLapCua = 1; kiemDuLieu rỗng (loiGiai.doi thay loiGiai.chinh)', LapRap.robotLapCua(m) === 1 && LapRap.kiemDuLieu(m).length === 0, J(LapRap.kiemDuLieu(m)));
  const a = LapRap.apDung(m, m.lapRap.cachLap[0]);
  kiem('apDung cách xích + vòi phun → man.doi[1] = xích, có spray, đế lam, giữ batDau / co; R1 y nguyên; trường đầu màn (R1) không đổi',
    a.doi[1].loaiRobot === 'xich' && a.doi[1].robot.than === 'xich' && a.doi[1].robot.tay === 'hoi' && a.doi[1].hamGoc.includes('spray') && a.doi[1].robot.son === 'lam' && J(a.doi[1].batDau) === J(m.doi[1].batDau) && J(a.doi[1].co) === J(m.doi[1].co)
    && a.doi[0] === m.doi[0] && a.loaiRobot === 'banh' && a.robot.than === 'hai-banh' && a.robot.tay === 'xoay' && a.cachLapDaChon.than === 'xich' && Array.isArray(a.loiGiai.doi),
    J([a.doi[1], a.loaiRobot, a.robot]));
  kiem('apDung không đụng màn gốc', m.doi[1].loaiRobot === undefined && m.doi[1].son === 'lam');
  const md = chuan(manLap());
  kiem('macDinh: điền man.doi[1] theo cachLap[0] (xích), R1 vẫn xe chở hàng, loiGiai đội', md.doi[1].loaiRobot === 'xich' && md.doi[0].loaiRobot === 'banh' && md.loaiRobot === 'banh' && Array.isArray(md.loiGiai.doi), J(md.doi.map((r) => r.loaiRobot)));
  const b = LapRap.apDung(md, md.lapRap.cachLap[1]);
  kiem('"Lắp lại" từ bản mặc định xích sang hai bánh: hamGoc không còn spray, không còn cờ xichDay; vẫn giữ co', b.doi[1].loaiRobot === 'banh' && !b.doi[1].hamGoc.includes('spray') && b.doi[1].xichDay === undefined && J(b.doi[1].co) === J(m.doi[1].co), J(b.doi[1]));
  const md2 = chuan(manLap()); md2.doi[1].xichDay = true; md2.doi[1].thuGai = true;
  kiem('cờ cỗ máy cũ sót trên doi[i] (xichDay, thuGai) bị bỏ khi lắp cách mới', (() => { const c = LapRap.apDung(md2, md2.lapRap.cachLap[1]); return c.doi[1].xichDay === undefined && c.doi[1].thuGai === undefined; })());
  const tk = LapRap.thongKeMau(md);
  kiem('thongKeMau: hai cách mẫu đều thắng (lời giải đội chạy qua máy chấm), nhịp xích > nhịp hai bánh (quay lâu hơn)', tk.length === 2 && tk.every((x) => x.thang && !x.loi) && tk[0].nhip > tk[1].nhip, J(tk));
  kiem('kiemCanMan chạy trên màn đội: dữ liệu + cách mẫu thắng, và áp luật cân màn (ở màn giả này hai bánh rẻ hơn, nhanh hơn → kêu "hơn hẳn"; màn thật phải cho xích việc riêng)', (() => { const l = LapRap.kiemCanMan(md); return l.length === 1 && /hơn hẳn/.test(l[0]); })(), J(LapRap.kiemCanMan(md)));
  const r = Cham.cham(b, { doi: [{ chinh: ['forward(5)'] }, { chinh: ['forward(1)', 'turn_back()', 'forward(1)'] }], hamCuaMan: HAM.concat([QUAY_BANH]) }, []);
  kiem('cham màn đã lắp (hai bánh cho R2): thắng, R2 trong kết quả là banh', r.thang && r.doi[1].loaiRobot === 'banh', J(r.chanDoan.slice(0, 2)));
  const mk = manLap(); mk.doi[1].coDinh = true;
  kiem('lapRap.robot trỏ robot khoá → kiemDuLieu kêu, apDung ném lỗi', LapRap.kiemDuLieu(mk).some((l) => /không phải robot em/.test(l)) && /bị khoá/.test(nem(() => LapRap.apDung(mk, mk.lapRap.cachLap[0])) || ''));
  const m0 = manLap({ lapRap: Object.assign(clone(manLap().lapRap), { robot: 0 }) }); m0.doi[0] = { batDau: { x: 1, y: 1, huong: 1 }, co: [{ x: 6, y: 1 }] }; m0.doi[1] = Object.assign(CoMay.dung('CH', { son: 'lam', batDau: { x: 6, y: 2, huong: 3 } }), { co: [{ x: 6, y: 2 }] });
  const a0 = LapRap.apDung(m0, { than: 'xich', tay: 'hoi' });
  kiem('lapRap.robot = 0: gắn vào doi[0] và trường đầu màn (loaiRobot / robot / hamGoc) theo R1', a0.doi[0].loaiRobot === 'xich' && a0.loaiRobot === 'xich' && a0.robot.than === 'xich' && !a0.robot.son && a0.doi[1].loaiRobot === 'banh');
}

/* ------------------------------------------------------------- màn cũ không đổi dạng */
console.log('Màn cũ');
{
  const M = require(path.join(day, 'lo-trinh-hoc.js'));
  const doi = M.danhSach.filter((m) => Array.isArray(m.doi)), rap = M.danhSach.filter((m) => m.lapRap);
  kiem('lộ trình: chưa màn nào khai chonDoi / lapRap.robot (D2 mới dựng màn); mọi màn đội vẫn 2 robot', doi.every((m) => !m.chonDoi && LapRap.robotLapCua(m) === null && m.doi.length === 2) && rap.every((m) => LapRap.robotLapCua(m) === null), doi.length + ' màn đội, ' + rap.length + ' màn lắp');
  const m1 = rap[0], a1 = LapRap.apDung(m1, m1.lapRap.cachLap[0]);
  kiem('màn lắp ráp một robot: apDung không sinh trường doi, loiGiai vẫn { chinh, hamCuaMan, hamCuaEmMoi }', a1.doi === undefined && J(Object.keys(a1.loiGiai)) === '["chinh","hamCuaMan","hamCuaEmMoi"]' && a1.loaiRobot === m1.loaiRobot, m1.ma);
}

console.log('---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
