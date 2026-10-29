/* ============================================================================
   kiem-loi-mua-2.mjs — máy kiểm LÕI MÙA 2 (27/10) của "Robot Chấn Hưng": bốn thứ mới của lõi san-hoc.js (chưa có màn chơi, chỉ sân nhỏ dựng tại chỗ).
     1. Cảm biến HỒNG NGOẠI distance(): số ô trống tới vật cản đầu tiên phía trước; không tốn nhịp; nhện / drone không gắn.
     2. Nâng cấp ĐO NHIỆT warm(): True khi vật cản đầu tiên là robot khác hay nút bắn ĐANG BẬT.
     3. XÍCH ĐẨY THÙNG NẶNG (cfg.xichDay): xích tiến vào thùng thì thùng dời 1 ô nếu ô sau trống; chặn thì đâm như cũ; lùi không kéo.
     4. BỆ SÚNG XÍCH (cfg.beSung): xích + súng hơi bắn tụ không giật; bắn nhanh như cũ; thân khác vẫn giật.
   Mỗi luật: ca đúng, ca biên, ca cấm (thiếu cờ / thiếu part), ca tương tác (băng chuyền / cửa / robot khác), và chẩn đoán của cham.js.
   Cờ --loi-gia: cắm lỗi giả (giả vờ luật bị tắt) để chứng minh máy kiểm đỏ được.
   Chạy: node hoc/kiem-loi-mua-2.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const sk = (r) => r.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien || []);
const docs = (r) => r.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const soNhip = (r) => r.vet.filter((e) => e.loai === 'nhip').length;
const loiCfg = (cfg, code) => { try { SanHoc.chay(cfg, code); return ''; } catch (e) { return e.message; } };
/** Lỗi giả: giả vờ luật bị tắt bằng cách đổi kết quả đọc được. */
const gia = (v, thay) => (LOI_GIA ? thay : v);

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const TIEN = 'left_move()\nright_move()\nwait()\n';

console.log('== 1. Hồng ngoại distance() ==');
{
  //  x: 0 1 2 3 4 5 6 7 8
  const SAN = [
    '#########',   // y0
    '#F..N...#',   // y1  cờ (1,1), nút (4,1)
    '#.......#',   // y2
    '#.H....>#',   // y3  thùng (2,3), băng (7,3)
    '#...o...#',   // y4  vật (4,4)
    '#...C..c#',   // y5  cửa đóng (4,5), cửa mở (7,5)
    '#.......#',   // y6
    '#########'    // y7
  ];
  const goc = { loaiRobot: 'banh', hamGoc: BANH.concat(['distance']), san: SAN };
  const chay = (bd, code, them) => SanHoc.chay(Object.assign({}, goc, { batDau: bd }, them || {}), code);
  const doc1 = (bd, them) => { const r = chay(bd, 'd = distance()\nwait()\n', them); return r.loi ? { loi: r.loi } : docs(r)[0]; };

  let d = doc1({ x: 1, y: 6, huong: 0 });
  kiem('nhìn lên 5 ô trống tới tường: distance() = 5, vat tuong, o là ô tường', gia(d.khoang, 4) === 5 && d.vat === 'tuong' && d.o.x === 1 && d.o.y === 0 && d.cam === 'hong-ngoai' && d.ham === 'distance', J(d));
  d = doc1({ x: 4, y: 6, huong: 0 });
  kiem('sát cửa đóng: distance() = 0, vat cua', d.khoang === 0 && d.vat === 'cua', J(d));
  d = doc1({ x: 7, y: 6, huong: 0 });
  kiem('cửa MỞ (c) và băng chuyền là ô trống: tia đi qua tới tường, distance() = 5', d.khoang === 5 && d.vat === 'tuong', J(d));
  d = doc1({ x: 2, y: 6, huong: 0 });
  kiem('thùng nặng chắn: 2 ô trống rồi thùng (vat thung-nang)', d.khoang === 2 && d.vat === 'thung-nang' && d.o.x === 2 && d.o.y === 3, J(d));
  d = doc1({ x: 4, y: 2, huong: 0 });
  kiem('sát nút bắn: distance() = 0, vat nut', d.khoang === 0 && d.vat === 'nut', J(d));
  d = doc1({ x: 4, y: 3, huong: 2 });
  kiem('vật nằm đất chắn ngay trước: 0, vat vat', d.khoang === 0 && d.vat === 'vat', J(d));
  d = doc1({ x: 1, y: 2, huong: 1 });
  kiem('nhìn ngang sang phải: 6 ô trống tới tường phải', d.khoang === 6 && d.vat === 'tuong' && d.huong === 1, J(d));
  let r = SanHoc.chay({ loaiRobot: 'banh', hamGoc: BANH.concat(['distance']), san: ['....', '....'], batDau: { x: 0, y: 0, huong: 1 } }, 'd = distance()\nwait()\n');
  d = docs(r)[0];
  kiem('sân không viền: mép sân = tường (vat ngoai-san, o ngoài sân)', d.khoang === 3 && d.vat === 'ngoai-san' && d.o.x === 4, J(d));

  r = chay({ x: 1, y: 6, huong: 0 }, 'a = distance()\nb = distance()\nc = distance()\nd = distance()\ne = distance()\nwait()\n');
  kiem('đọc 5 lần không tốn nhịp: chỉ 1 nhịp (của wait), 5 mục docCamBien, sự kiện doc-cam-bien gắn vào nhịp 1', !r.loi && soNhip(r) === 1 && docs(r).length === 5 && r.soLanDoc === 5 && sk(r).filter((e) => e.ma === 'doc-cam-bien').length === 5, J({ nhip: soNhip(r), doc: docs(r).length }));
  r = chay({ x: 1, y: 6, huong: 0 }, 'while distance() > 0:\n    left_move()\n    right_move()\n    wait()\n');
  kiem('dùng trong while distance() > 0: đi 5 nhịp rồi dừng sát tường, không đâm', !r.loi && soNhip(r) === 5 && r.robot.y === 1 && !sk(r).some((e) => e.ma === 'dam-tuong'), J({ nhip: soNhip(r), robot: r.robot }));
  r = chay({ x: 2, y: 6, huong: 0 }, 'd = distance()\nif d > 2:\n    left_move()\n    right_move()\n    wait()\nelse:\n    wait()\n');
  kiem('gán biến d = distance() rồi so sánh: d = 2 nên rẽ nhánh else (xe đứng yên)', !r.loi && r.robot.y === 6 && soNhip(r) === 1, J(r.robot));
  r = chay({ x: 1, y: 6, huong: 0 }, 'for i in range(distance()):\n    left_move()\n    right_move()\n    wait()\n');
  kiem('range(distance()): đi đúng 5 ô', !r.loi && r.robot.y === 1 && soNhip(r) === 5, J({ loi: r.loi, robot: r.robot }));
  r = chay({ x: 1, y: 6, huong: 0 }, 'while distance() > 0:\n    pass\n');
  kiem('vòng lặp chỉ đọc cảm biến không có nhịp → infinite-loop (chống treo)', r.loi && r.loi.loai === 'infinite-loop', J(r.loi));

  // xích leo được bậc thang: S là ô trống với xích, là vật cản với xe bánh (như front_clear)
  const SAN_S = ['#####', '#...#', '#.S.#', '#...#', '#####'];
  d = docs(SanHoc.chay({ loaiRobot: 'banh', hamGoc: BANH.concat(['distance']), san: SAN_S, batDau: { x: 2, y: 3, huong: 0 } }, 'd = distance()\nwait()\n'))[0];
  kiem('xe bánh: bậc thang S chắn (0, bac-thang)', d.khoang === 0 && d.vat === 'bac-thang', J(d));
  d = docs(SanHoc.chay({ loaiRobot: 'xich', hamGoc: BANH.concat(['distance']), san: SAN_S, batDau: { x: 2, y: 3, huong: 0 } }, 'd = distance()\nwait()\n'))[0];
  kiem('xích: bậc thang là ô trống, tia đi tới tường (2)', d.khoang === 2 && d.vat === 'tuong', J(d));
  d = docs(SanHoc.chay({ loaiRobot: 'omni', hamGoc: BANH.concat(['slide_left', 'slide_right', 'distance']), san: SAN, batDau: { x: 1, y: 6, huong: 0 } }, 'd = distance()\nwait()\n'))[0];
  kiem('omni cũng gắn được: 5 ô', d.khoang === 5, J(d));

  // nhiều robot: đồng đội dưới đất chắn tia; drone bay trên không chắn
  const DOI = { san: ['......', '......', '......'], doi: [{ batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['distance']) }, { batDau: { x: 4, y: 1, huong: 3 }, loaiRobot: 'banh', hamGoc: BANH }] };
  r = SanHoc.chay(DOI, ['d = distance()\nwait()\n', 'wait()\n']);
  d = docs(r)[0];
  kiem('nhiều robot: đồng đội đứng cách 3 ô chắn tia (3, dong-doi)', d && d.khoang === 3 && d.vat === 'dong-doi', J(d));
  r = SanHoc.chay(Object.assign({}, DOI, { doi: [DOI.doi[0], { batDau: { x: 4, y: 1 }, loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] }] }), ['d = distance()\nwait()\n', 'wait()\n']);
  d = docs(r)[0];
  kiem('drone đồng đội bay trên không chắn tia: 5 ô tới mép sân', d && d.khoang === 5 && d.vat === 'ngoai-san', J(d));

  // cấm / thiếu part
  let lc = loiCfg({ loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'distance'], san: SAN, batDau: { x: 1, y: 6 } }, 'wait()\n');
  kiem('nhện gắn hồng ngoại → lỗi cấu hình tiếng Việt', /Nhện không gắn cảm biến hồng ngoại/.test(lc), lc);
  lc = loiCfg({ loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'distance'], san: SAN, batDau: { x: 1, y: 6 } }, 'wait()\n');
  kiem('drone gắn hồng ngoại → lỗi cấu hình tiếng Việt', /Drone không gắn cảm biến hồng ngoại/.test(lc), lc);
  r = SanHoc.chay({ loaiRobot: 'banh', hamGoc: BANH, san: SAN, batDau: { x: 1, y: 6, huong: 0 } }, 'd = distance()\nwait()\n');
  kiem('khay không có distance: nhân báo chưa có hàm', r.loi && /distance/.test(r.loi.thongDiep), J(r.loi));
  kiem('SanHoc xuất CAM_HONG_NGOAI_HAM, MA_CAM_HONG_NGOAI, laHamCamBien biết distance / warm', J(SanHoc.CAM_HONG_NGOAI_HAM) === '["distance","warm"]' && SanHoc.MA_CAM_HONG_NGOAI === 'hong-ngoai' && SanHoc.laHamCamBien('distance') && SanHoc.laHamCamBien('warm'));

  // chẩn đoán qua máy chấm
  const man = { ma: 'thu-hn', chuong: 'thu', loaiRobot: 'banh', hamGoc: BANH, san: SAN, batDau: { x: 1, y: 6, huong: 0 }, khung: { chinh: 10, moiHam: 10, cauTruc: [] }, cauTruc: [], moXuong: false, sao: { o: 9, nhip: 9 } };
  let kq = ChamHoc.cham(man, { chinh: ['d = distance()', 'wait()'], hamCuaMan: [] }, []);
  const cd = kq.chanDoan.find((c) => c.ma === 'chua-gan-cam-bien');
  kiem('cham.js: gọi distance() khi chưa gắn → chua-gan-cam-bien nói "hồng ngoại"', !!cd && /hồng ngoại/.test(cd.loi), cd && cd.loi);
  kq = ChamHoc.cham(Object.assign({}, man, { hamGoc: BANH.concat(['distance']) }), { chinh: ['while distance() > 0:', '    left_move()', '    right_move()', '    wait()'], hamCuaMan: [] }, []);
  kiem('cham.js: chương trình dùng distance() chạy sạch (không lỗi, không dam-tuong)', !kq.chanDoan.some((c) => c.muc === 'loi') && !kq.chanDoan.some((c) => c.ma === 'dam-tuong'), J(kq.chanDoan.map((c) => c.ma)));
}

console.log('\n== 2. Đo nhiệt warm() ==');
{
  const SUNG = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  const SAN = ['#######', '#..N..#', '#.....#', '#.....#', '#.....#', '#######'];      // nút (3,1) trên tường trên
  const chay = (bd, code, them) => SanHoc.chay(Object.assign({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN, batDau: bd, lucBan: true }, them || {}), code);
  const nongs = (r) => docs(r).filter((d) => d.ham === 'warm').map((d) => d.nong);

  let r = chay({ x: 3, y: 2, huong: 0 }, 'a = warm()\nspray("high")\nwait()\nb = warm()\nspray("high")\nwait()\nc = warm()\nwait()\n');
  let ds = docs(r).filter((d) => d.ham === 'warm');
  kiem('nút tắt → False; bắn trúng (nút BẬT) → True; bắn lần hai (tắt lại) → False', !r.loi && J(nongs(r)) === J([false, gia(true, false), false]) && ds.every((d) => d.vat === 'nut' && d.cam === 'hong-ngoai'), J(ds.map((d) => [d.nong, d.vat, d.khoang])));
  kiem('warm() đi cùng tia với distance(): sau cú giật xe ở (3,3), khoang tới nút = 1', ds[1].khoang === 1 && ds[1].tu.y === 3 && ds[1].o.x === 3 && ds[1].o.y === 1, J(ds[1]));
  r = chay({ x: 1, y: 2, huong: 0 }, 'w = warm()\nwait()\n');
  kiem('tường: False (vat tuong)', nongs(r)[0] === false && docs(r)[0].vat === 'tuong');
  r = chay({ x: 3, y: 2, huong: 0 }, 'w = warm()\nx = warm()\ny = warm()\nwait()\n');
  kiem('đọc 3 lần không tốn nhịp (1 nhịp)', !r.loi && soNhip(r) === 1 && docs(r).length === 3);
  // nút bật nhưng vật cản ĐẦU TIÊN là thùng: không nóng (chỉ xét vật cản đầu của tia)
  {
    const SAN_T = ['#######', '#..N..#', '#.....#', '#..H..#', '#.....#', '#.....#', '#######'];   // thùng (3,3) giữa xe (3,5) và nút (3,1)
    const r2 = SanHoc.chay({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN_T, batDau: { x: 3, y: 5, huong: 0 } }, 'w = warm()\nd = distance()\nwait()\n');
    const dd = docs(r2);
    kiem('thùng chắn trước nút: warm() False (vat thung-nang), distance() = 1', dd[0].nong === false && dd[0].vat === 'thung-nang' && dd[1].khoang === 1, J(dd));
  }
  r = SanHoc.chay({ loaiRobot: 'banh', hamGoc: SUNG, san: ['#####', '#...#', '#.C.#', '#.o.#', '#...#', '#####'], batDau: { x: 2, y: 4, huong: 0 } }, 'w = warm()\nwait()\n');
  kiem('vật nằm đất chắn: False (vat vat)', nongs(r)[0] === false && docs(r)[0].vat === 'vat');
  r = SanHoc.chay({ loaiRobot: 'banh', hamGoc: SUNG, san: ['#####', '#...#', '#.C.#', '#...#', '#####'], batDau: { x: 2, y: 3, huong: 0 } }, 'w = warm()\nwait()\n');
  kiem('cửa đóng chắn: False (vat cua)', nongs(r)[0] === false && docs(r)[0].vat === 'cua');
  // cửa nhịp: distance đổi theo nhịp (tương tác cửa)
  r = SanHoc.chay({ loaiRobot: 'banh', hamGoc: SUNG, san: ['#####', '#...#', '#.c.#', '#...#', '#####'], batDau: { x: 2, y: 3, huong: 0 }, cuaNhip: [{ x: 2, y: 2, mo: 2, dong: 2 }] }, 'a = distance()\nwait()\nwait()\nb = distance()\nwait()\nwait()\nc = distance()\nwait()\n');
  kiem('cửa nhịp (mở 2 / đóng 2): distance() = 2 lúc mở, 0 lúc đóng, 2 khi mở lại', J(docs(r).map((d) => d.khoang)) === J([2, 0, 2]), J(docs(r).map((d) => [d.khoang, d.vat])));

  // robot khác: nóng. R2 đứng trước mặt R1 (dưới đất) → True; drone bay trên → tia qua, không nóng
  const DOI = { san: ['......', '......', '......'], doi: [{ batDau: { x: 0, y: 1, huong: 1 }, loaiRobot: 'banh', hamGoc: SUNG }, { batDau: { x: 3, y: 1, huong: 3 }, loaiRobot: 'banh', hamGoc: BANH }] };
  r = SanHoc.chay(DOI, ['w = warm()\nwait()\n', 'wait()\n']);
  kiem('nhiều robot: robot khác dưới đất phía trước → warm() True (vat dong-doi, khoang 2)', nongs(r)[0] === gia(true, false) && docs(r)[0].vat === 'dong-doi' && docs(r)[0].khoang === 2, J(docs(r)[0]));
  r = SanHoc.chay(Object.assign({}, DOI, { doi: [DOI.doi[0], { batDau: { x: 3, y: 1 }, loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'] }] }), ['w = warm()\nwait()\n', 'wait()\n']);
  kiem('drone bay trên không chắn tia: warm() False, tia tới mép sân', nongs(r)[0] === false && docs(r)[0].vat === 'ngoai-san', J(docs(r)[0]));
  // đồng đội bắn nút, mình chờ: while not warm(): wait()
  const CHO = { san: ['#######', '#.....#', '#..N..#', '#.....#', '#######'], doi: [{ batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['warm']) }, { batDau: { x: 3, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['spray', 'spray_back']), lucBan: true }] };
  r = SanHoc.chay(CHO, ['while not warm():\n    wait()\n', 'wait()\nspray("high")\nwait()\n']);
  kiem('while not warm(): wait() — chờ đồng đội bắn nút sáng: R1 chờ đúng 2 nhịp, đọc được [False, False, True]', !r.loi && J(nongs(r)) === J([false, false, true]) && r.doi[0].vet.filter((e) => e.loai === 'nhip').length === 2, J({ loi: r.loi, nong: nongs(r) }));

  // cấm: khay chỉ có distance (chưa nâng cấp) → warm chưa có hàm; cham.js nói rõ
  r = SanHoc.chay({ loaiRobot: 'banh', hamGoc: BANH.concat(['distance']), san: SAN, batDau: { x: 3, y: 2, huong: 0 } }, 'w = warm()\nwait()\n');
  kiem('khay chỉ có distance: warm() là "chưa có hàm"', r.loi && /warm/.test(r.loi.thongDiep), J(r.loi));
  const man = { ma: 'thu-warm', chuong: 'thu', loaiRobot: 'banh', hamGoc: BANH.concat(['distance']), san: SAN, batDau: { x: 3, y: 2, huong: 0 }, khung: { chinh: 10, moiHam: 10, cauTruc: [] }, cauTruc: [], moXuong: false, sao: { o: 9, nhip: 9 } };
  const kq = ChamHoc.cham(man, { chinh: ['w = warm()', 'wait()'], hamCuaMan: [] }, []);
  const cd = kq.chanDoan.find((c) => c.ma === 'chua-gan-cam-bien');
  kiem('cham.js: gọi warm() khi khay mới có distance → chua-gan-cam-bien nói "mới dùng được distance(), chưa có warm()"', !!cd && /distance\(\)/.test(cd.loi) && /chưa có warm\(\)/.test(cd.loi), cd && cd.loi);
  const lc = loiCfg({ loaiRobot: 'nhen', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'warm'], san: SAN, batDau: { x: 1, y: 2 } }, 'wait()\n');
  kiem('nhện gắn đo nhiệt → lỗi cấu hình', /Nhện không gắn cảm biến hồng ngoại/.test(lc), lc);
}

console.log('\n== 3. Xích đẩy thùng nặng (cfg.xichDay) ==');
{
  //  x: 0 1 2 3 4 5 6
  const SAN = ['#######', '#.....#', '#.H..D#', '#.....#', '#######'];      // thùng (2,2), ô đích (5,2)
  const goc = { loaiRobot: 'xich', hamGoc: BANH, san: SAN, batDau: { x: 1, y: 2, huong: 1 }, xichDay: true, mucTieu: 'day-thung' };
  const chay = (them, code) => SanHoc.chay(Object.assign({}, goc, them || {}), code);
  const thungDi = (r) => sk(r).filter((e) => e.ma === 'thung-di');
  const dam = (r) => r.suKien.filter((e) => e.ma === 'dam-tuong');

  let r = chay({}, TIEN + TIEN + TIEN);
  kiem('xích tiến 3 nhịp đẩy thùng 3 ô lên ô đích: thắng, thùng ở (5,2), xe ở (4,2), mỗi nhịp một thung-di nguon xich + tien có dayThung', r.thang && soNhip(r) === 3 && r.thung[0].x === gia(5, 4) && r.robot.x === 4 && thungDi(r).length === 3 && thungDi(r).every((e) => e.nguon === 'xich' && e.soO === 1) && sk(r).filter((e) => e.ma === 'tien' && e.dayThung === 1).length === 3, J({ thang: r.thang, thung: r.thung, robot: r.robot }));
  kiem('thùng đi đúng từng ô: (2→3), (3→4), (4→5)', J(thungDi(r).map((e) => [e.tu.x, e.den.x])) === J([[2, 3], [3, 4], [4, 5]]), J(thungDi(r)));
  r = chay({}, TIEN + TIEN + TIEN + TIEN + TIEN);
  kiem('thùng đã lên đích thì thắng NGAY (nhịp 3), không chạy tiếp', r.thang && soNhip(r) === 3, J({ nhip: soNhip(r) }));
  r = chay({ batDau: { x: 3, y: 2, huong: 3 } }, TIEN + TIEN);
  const d0 = dam(r)[0];
  kiem('nhịp 1 đẩy thùng (2→1), nhịp 2 ô sau thùng là tường: thùng không nhúc nhích, xích đứng yên — dam-tuong vat thung-nang kèm xichDay, chan tuong, sau (0,2)', !r.thang && r.robot.x === 2 && r.thung[0].x === 1 && thungDi(r).length === 1 && !!d0 && d0.nhip === 2 && d0.vat === 'thung-nang' && d0.xichDay === true && d0.chan === 'tuong' && d0.sau.x === 0 && dam(r).length === 1, J(d0));
  r = chay({ batDau: { x: 3, y: 2, huong: 1 } }, 'left_back()\nright_back()\nwait()\n');
  kiem('LÙI vào thùng không kéo được: đâm như cũ (dam-tuong kieu lui, không có xichDay), thùng y nguyên', !thungDi(r).length && dam(r).length === 1 && dam(r)[0].kieu === 'lui' && !dam(r)[0].xichDay && r.thung[0].x === 2, J(dam(r)[0]));

  // không cờ / thân khác: cờ chỉ có nghĩa với xích
  r = chay({ xichDay: false }, TIEN);
  kiem('xích KHÔNG khai xichDay: húc thùng đâm như cũ (dam-tuong thung-nang, không thung-di)', !thungDi(r).length && dam(r).length === 1 && dam(r)[0].vat === 'thung-nang' && !dam(r)[0].xichDay && r.robot.x === 1, J(dam(r)[0]));
  r = chay({ loaiRobot: 'banh' }, TIEN);
  kiem('xe hai bánh có cờ xichDay: vẫn đâm (cờ bỏ qua)', !thungDi(r).length && dam(r).length === 1 && !dam(r)[0].xichDay, J(dam(r)[0]));
  r = chay({ loaiRobot: 'omni', hamGoc: BANH.concat(['slide_left', 'slide_right']) }, TIEN);
  kiem('omni có cờ xichDay: vẫn đâm', !thungDi(r).length && dam(r).length === 1, J(dam(r)[0]));

  // tương tác: băng chuyền, cửa, vật, thùng khác, đồng đội
  r = chay({ san: ['#######', '#.....#', '#.H>..#', '#.....#', '#######'], mucTieu: 'toi-co' }, TIEN + 'wait()\nwait()\n');
  kiem('đẩy thùng lên băng chuyền: nhịp 1 xích đẩy (nguon xich), băng đếm từ 0 rồi đưa thùng đi ở nhịp 3 (nguon bang)', J(thungDi(r).map((e) => [e.nguon, e.den.x])) === J([['xich', 3], ['bang', 4]]), J(thungDi(r)));
  r = chay({ san: ['#######', '#.....#', '#.HC..#', '#.....#', '#######'], mucTieu: 'toi-co' }, TIEN);
  kiem('cửa đóng sau thùng: chặn (chan cua)', !thungDi(r).length && dam(r)[0] && dam(r)[0].chan === 'cua', J(dam(r)[0]));
  r = chay({ san: ['#######', '#.....#', '#.Hc..#', '#.....#', '#######'], mucTieu: 'toi-co' }, TIEN);
  kiem('cửa MỞ sau thùng: đẩy được thùng vào ô cửa', thungDi(r).length === 1 && r.thung[0].x === 3, J(r.thung));
  r = chay({ san: ['#######', '#.....#', '#.Ho..#', '#.....#', '#######'], mucTieu: 'toi-co' }, TIEN);
  kiem('vật nằm đất sau thùng: chặn (chan vat)', !thungDi(r).length && dam(r)[0] && dam(r)[0].chan === 'vat', J(dam(r)[0]));
  r = chay({ san: ['#######', '#.....#', '#.HH..#', '#.....#', '#######'], mucTieu: 'toi-co' }, TIEN);
  kiem('thùng khác sau thùng: chặn (chan thung-nang), không đẩy dây chuyền', !thungDi(r).length && dam(r)[0] && dam(r)[0].chan === 'thung-nang', J(dam(r)[0]));
  r = chay({ san: ['#######', '#.....#', '#.H=..#', '#.....#', '#######'], mucTieu: 'toi-co' }, TIEN);
  kiem('hàng rào sau thùng: chặn (chan rao)', !thungDi(r).length && dam(r)[0] && dam(r)[0].chan === 'rao', J(dam(r)[0]));
  r = SanHoc.chay({ san: ['#######', '#.....#', '#.H...#', '#.....#', '#######'], xichDay: true, doi: [{ batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'xich', hamGoc: BANH }, { batDau: { x: 3, y: 2, huong: 3 }, loaiRobot: 'banh', hamGoc: BANH }] }, [TIEN, 'wait()\n']);
  kiem('nhiều robot: đồng đội đứng sau thùng chặn (chan dong-doi)', !thungDi(r).length && r.doi[0].suKien.some((e) => e.ma === 'dam-tuong' && e.chan === 'dong-doi'), J(r.doi[0].suKien));
  // góc chết: đẩy thùng vào góc (không phải đích) ở mục tiêu day-thung → thung-ket, dừng sớm
  r = chay({ san: ['#######', '#....D#', '#.H...#', '#.....#', '#######'], batDau: { x: 1, y: 2, huong: 1 } }, TIEN + TIEN + TIEN + TIEN);
  kiem('đẩy thùng vào góc chết (5,2)? không — (5,2) có mép phải nhưng trên/dưới trống: không kẹt; thùng dừng sát tường, nhịp 4 đâm', !r.dungSom && r.thung[0].x === 5 && dam(r).length === 1, J({ dungSom: r.dungSom, thung: r.thung }));
  r = chay({ san: ['#######', '#.H...#', '#....D#', '#.....#', '#######'], batDau: { x: 1, y: 1, huong: 1 } }, TIEN + TIEN + TIEN);
  kiem('đẩy thùng vào góc chết (5,1) thật: dungSom thung-ket ngay cuối nhịp 3', r.dungSom === 'thung-ket' && soNhip(r) === 3 && r.thung[0].x === 5 && r.thung[0].y === 1, J({ dungSom: r.dungSom, thung: r.thung, nhip: soNhip(r) }));

  // chẩn đoán qua máy chấm
  const man = { ma: 'thu-xich-day', chuong: 'thu', loaiRobot: 'xich', hamGoc: BANH, san: ['#######', '#.....#', '#H...F#', '#.....#', '#######'], batDau: { x: 2, y: 2, huong: 3 }, xichDay: true, khung: { chinh: 10, moiHam: 10, cauTruc: [] }, cauTruc: [], moXuong: false, sao: { o: 9, nhip: 9 } };
  let kq = ChamHoc.cham(man, { chinh: ['left_move()', 'right_move()', 'wait()'], hamCuaMan: [] }, []);
  let cd = kq.chanDoan.find((c) => c.ma === 'dam-tuong');
  kiem('cham.js: xích đẩy thùng mà ô sau là tường → dam-tuong nói "ô sau thùng ... là tường", gợi đi vòng', !!cd && /ô sau thùng/.test(cd.loi) && /tường/.test(cd.loi) && /đi vòng/.test(cd.loi), cd && cd.loi);
  kq = ChamHoc.cham(Object.assign({}, man, { batDau: { x: 2, y: 2, huong: 1 } }), { chinh: ['left_back()', 'right_back()', 'wait()'], hamCuaMan: [] }, []);
  cd = kq.chanDoan.find((c) => c.ma === 'dam-tuong');
  kiem('cham.js: xích LÙI vào thùng ở màn xichDay → nhắc "chỉ đẩy được thùng khi TIẾN"', !!cd && /khi TIẾN/.test(cd.loi), cd && cd.loi);
  kq = ChamHoc.cham(Object.assign({}, man, { xichDay: false }), { chinh: ['left_move()', 'right_move()', 'wait()'], hamCuaMan: [] }, []);
  cd = kq.chanDoan.find((c) => c.ma === 'dam-tuong');
  kiem('cham.js: màn không khai xichDay → lời cũ y nguyên ("chỉ cú giật của vòi phun mới dời được thùng")', !!cd && /chỉ cú giật của vòi phun mới dời được thùng\.$/.test(cd.loi), cd && cd.loi);
}

console.log('\n== 4. Bệ súng xích (cfg.beSung) ==');
{
  const KHAY = BANH.concat(['spray', 'spray_back']);
  // nút (3,1) cách xe 2 ô phía trên; thùng (3,4) ngay sau lưng xe (3,3); (3,5) chỗ thùng trượt tới
  const SAN = ['#######', '###N###', '#.....#', '###.###', '###H###', '###.###', '#######'];
  const goc = { loaiRobot: 'xich', hamGoc: KHAY, san: SAN, batDau: { x: 3, y: 3, huong: 0 }, beSung: true, lucBan: true };
  const chay = (them, code) => SanHoc.chay(Object.assign({}, goc, them || {}), code);
  const ma = (r) => sk(r).map((e) => e.ma);

  let r = chay({}, 'spray("high")\nwait()\n');
  kiem('xích + beSung bắn tụ: bóng vẫn trúng nút (nut-doi), KHÔNG có giat / thung-di, có be-sung, xe và thùng đứng yên', !r.loi && ma(r).includes('nut-doi') && !ma(r).includes(gia('giat', 'nut-doi')) && !ma(r).includes('thung-di') && ma(r).includes('be-sung') && r.robot.y === 3 && r.thung[0].y === 4, J(ma(r)));
  const bs = sk(r).find((e) => e.ma === 'be-sung');
  kiem('sự kiện be-sung ghi nhịp và hướng giật bị giữ (2 = xuống)', !!bs && bs.nhip === 1 && bs.huong === 2, J(bs));
  r = chay({}, 'spray("high")\nwait()\n');
  kiem('spray("high") cũng không giật', !ma(r).includes('giat') && ma(r).includes('be-sung'), J(ma(r)));
  r = chay({}, 'spray("low")\nwait()\n');
  kiem('bắn nhanh ("low") như cũ: trúng nút cách 2 ô, không giật, không be-sung', ma(r).includes('nut-doi') && !ma(r).includes('giat') && !ma(r).includes('be-sung'), J(ma(r)));
  r = chay({ batDau: { x: 3, y: 2, huong: 2 } }, 'spray_back("high")\nwait()\n');
  kiem('spray_back("high") tụ với bệ súng: bóng ra sau trúng nút, xe không giật tới', ma(r).includes('nut-doi') && !ma(r).includes('giat') && r.robot.y === 2, J(ma(r)));
  r = chay({ batDau: { x: 1, y: 2, huong: 1 } }, 'spray("high")\nwait()\n');
  kiem('bắn vào tường ở sân có nút với bệ súng: vẫn có ban-bi-chan (thông tin) vì xe chẳng dời được gì', r.suKien.some((e) => e.ma === 'ban-bi-chan') && !ma(r).includes('giat'), J(r.suKien.map((e) => e.ma)));
  r = chay({ san: ['.....'], batDau: { x: 0, y: 0, huong: 1 } }, 'spray("high")\nwait()\n');
  kiem('bắn hụt ra ngoài sân với bệ súng: ban-hut (thông tin), không giật, có be-sung', r.suKien.some((e) => e.ma === 'ban-hut') && !ma(r).includes('giat') && ma(r).includes('be-sung'), J(r.suKien.map((e) => e.ma)));
  r = chay({ beSung: false }, 'spray("high")\nwait()\n');
  kiem('xích KHÔNG khai beSung: giật như hiện nay (giat, thùng sau lưng trượt)', ma(r).includes('giat') && ma(r).includes('thung-di') && !ma(r).includes('be-sung') && r.thung[0].y === 5, J(ma(r)));
  r = chay({ loaiRobot: 'banh' }, 'spray("high")\nwait()\n');
  kiem('xe hai bánh có beSung: vẫn giật (cờ chỉ có nghĩa với xích)', ma(r).includes('giat') && ma(r).includes('thung-di') && !ma(r).includes('be-sung'), J(ma(r)));
  r = chay({ loaiRobot: 'omni', hamGoc: KHAY.concat(['slide_left', 'slide_right']) }, 'spray("high")\nwait()\n');
  kiem('omni có beSung: vẫn giật', ma(r).includes('giat') && !ma(r).includes('be-sung'), J(ma(r)));
  r = chay({ beSung: true, lucBan: false }, 'spray()\nwait()\n');
  kiem('màn chưa mở lực (lucBan false): spray("high") không đối số là phun nhẹ, bệ không có việc (không be-sung, không giật)', !r.loi && !ma(r).includes('be-sung') && !ma(r).includes('giat'), J({ loi: r.loi, ma: ma(r) }));
  r = chay({ daoChieu: ['sung'], batDau: { x: 3, y: 2, huong: 2 } }, 'spray("high")\nwait()\n');
  kiem('súng lắp ngược + bệ súng: spray("high") bắn ra sau trúng nút, vẫn không giật', ma(r).includes('nut-doi') && sk(r).find((e) => e.ma === 'ban').sau === true && !ma(r).includes('giat'), J(ma(r)));
  r = chay({ danToiDa: 1 }, 'spray("high")\nwait()\nspray("high")\nwait()\n');
  kiem('hết đạn: phát hai không bắn, không be-sung', r.suKien.some((e) => e.ma === 'het-dan') && sk(r).filter((e) => e.ma === 'be-sung').length === 1, J(ma(r)));
  r = chay({}, 'spray("high")\nleft_move()\nright_move()\nwait()\n');
  kiem('nhịp bắn thì bánh vẫn nghỉ (ban-dung-yen), xe không đi', r.suKien.some((e) => e.ma === 'ban-dung-yen') && r.robot.y === 3, J(r.suKien.map((e) => e.ma)));
  // băng chuyền: xích bám chắc, bắn tụ không giật, đứng trên băng vẫn không trôi
  r = chay({ san: ['#######', '###N###', '#.....#', '###v###', '###.###', '###.###', '#######'], batDau: { x: 3, y: 3, huong: 0 }, noi: [{ nut: { x: 3, y: 1 }, cua: [], bang: [] }] }, 'spray("high")\nwait()\nwait()\n');
  kiem('đứng trên băng chuyền bắn tụ: không giật, băng không đẩy xích (bang-khong-day), xe vẫn ở (3,3)', !ma(r).includes('giat') && ma(r).includes('bang-khong-day') && r.robot.y === 3, J(ma(r)));
  // nhiều robot: xích bệ súng không "định tới" ô sau lưng → đồng đội đi vào ô đó được ngay nhịp ấy
  r = SanHoc.chay({ san: ['#######', '###N###', '#.....#', '#.....#', '#######'], beSung: true, doi: [{ batDau: { x: 3, y: 2, huong: 0 }, loaiRobot: 'xich', hamGoc: KHAY, lucBan: true }, { batDau: { x: 2, y: 3, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH }] }, ['spray("high")\nwait()\n', TIEN]);
  kiem('nhiều robot: xích bắn tụ không giật nên đồng đội tiến vào ô sau lưng xích cùng nhịp được (không dam-tuong dong-doi)', !r.loi && r.doi[1].robot.x === 3 && !r.doi[1].suKien.some((e) => e.ma === 'dam-tuong'), J({ r2: r.doi[1].robot, sk: r.doi[1].suKien.map((e) => e.ma) }));
  r = SanHoc.chay({ san: ['#######', '###N###', '#.....#', '#.....#', '#######'], beSung: false, doi: [{ batDau: { x: 3, y: 2, huong: 0 }, loaiRobot: 'xich', hamGoc: KHAY, lucBan: true }, { batDau: { x: 2, y: 3, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH }] }, ['spray("high")\nwait()\n', TIEN]);
  kiem('(đối chứng) không beSung: xích giật lùi vào (3,3) nên đồng đội bị chặn (dong-doi)', r.doi[1].suKien.some((e) => e.ma === 'dam-tuong' && e.vat === 'dong-doi'), J(r.doi[1].suKien.map((e) => e.ma)));
  r = SanHoc.chay({ loaiRobot: 'xich', hamGoc: BANH, san: SAN, batDau: { x: 3, y: 3, huong: 0 }, beSung: true }, TIEN);
  kiem('beSung trên robot không có súng: bỏ qua cờ, chạy bình thường (màn nhiều robot khai một chỗ cho cả đội)', !r.loi && r.robot.y === 2, J({ loi: r.loi, robot: r.robot }));
  // chẩn đoán: bắn tụ không giật ở màn bệ súng không sinh giat-chan / thung-chan
  const man = { ma: 'thu-be-sung', chuong: 'thu', loaiRobot: 'xich', hamGoc: KHAY, san: SAN, batDau: { x: 3, y: 3, huong: 0 }, beSung: true, lucBan: true, khung: { chinh: 10, moiHam: 10, cauTruc: [] }, cauTruc: [], moXuong: false, sao: { o: 9, nhip: 9 } };
  const kq = ChamHoc.cham(man, { chinh: ['spray("high")', 'wait()'], hamCuaMan: [] }, []);
  kiem('cham.js: màn bệ súng, spray("high") trúng nút → không có giat-chan / thung-chan / lỗi (ngoài chua-toi-co vì sân thử không có cờ)', !kq.chanDoan.some((c) => c.ma === 'giat-chan' || c.ma === 'thung-chan' || (c.muc === 'loi' && c.ma !== 'chua-toi-co')), J(kq.chanDoan.map((c) => c.ma)));
}

console.log('\n== 5. Part hồng ngoại và giao diện (hình, thẻ bộ phận, Sổ lệnh, khay, đèn, hoạt cảnh) ==');
{
  const fs = await import('node:fs');
  const vm = await import('node:vm');
  /* V7c2 (28/10): bộ pixel game/part đã xoá; bộ phận, luật ghép, hàm gốc và hình đọc từ bộ vẽ VECTOR (VeVector; lap-rap.js tự nạp ve-vector*.js ở Node) */
  const VV = require(path.join(day, 'lap-rap.js')).veVector();
  const GT = require(path.join(day, 'gioi-thieu-part.js'));
  const SoLenh = require(path.join(day, 'so-lenh.js'));
  const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };

  // bộ phận vector
  const hn = VV.lay('cam-bien', 'hong-ngoai');
  kiem('bộ phận hong-ngoai đăng ký ở bộ vẽ vector: loại cam-bien, gắn ổ tren (mũi xe), mở distance + warm', !!hn && hn.gan === 'tren' && J(hn.hamGoc) === '["distance","warm"]', hn && J([hn.gan, hn.hamGoc]));
  const ghepOK = ['hai-banh', 'xich', 'omni'].every((than) => [null, 'kep', 'hoi'].every((tay) => !loi(() => VV.robot({ than: than, tay: tay, camBien: [{ ma: 'hong-ngoai', o: 'tren' }, { ma: 'khoang-cach', o: 'hong' }] }, { camBien: { bat: true } }, 0, 100))));
  kiem('VeVector.robot: ba thân xe × (không tay / kẹp / súng hơi) + hồng ngoại + khoảng cách đều ghép và vẽ được, cả khi đang đọc (bat)', ghepOK);
  kiem('VeVector.kiemGhep: drone không gắn hồng ngoại (lỗi tiếng Việt)', /Drone không gắn được/.test(loi(() => VV.kiemGhep({ than: 'drone', tay: null, camBien: [{ ma: 'hong-ngoai', o: 'tren' }] })) || ''));
  const cfgHN = { than: 'xich', tay: null, camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, tat = VV.robot(cfgHN, { camBien: { bat: false } }, 0, 100), bat = VV.robot(cfgHN, { camBien: { bat: true } }, 0, 100);
  kiem('hình: đang đọc (bat) vẽ khác lúc tắt và nhiều lệnh vẽ hơn (mắt đỏ rực + tia)', J(tat.lenh) !== J(bat.lenh) && bat.lenh.length > tat.lenh.length, J([tat.lenh.length, bat.lenh.length]));
  const deTay = [];
  for (const than of VV.ds('than').filter((t) => t.ma !== 'drone' && t.ma !== 'nhen')) for (const tay of VV.ds('tay')) {
    const e = loi(() => VV.robot({ than: than.ma, tay: tay.ma, camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, { tay: { tuThe: 'duoi', kep: 'dong', cam: true, dangBanTruoc: true, dangNem: true, ngam: 3, bat: true }, camBien: { bat: true } }, 0, 100));
    if (e) deTay.push(than.ma + '/' + tay.ma + ': ' + e);
  }
  kiem('hồng ngoại (đang đọc) ghép và vẽ được cùng MỌI tay ở mũi của ba thân xe', deTay.length === 0, deTay.join(' '));

  // ve-robot.cauHinhCua suy part từ hamGoc
  const ctxV = vm.createContext({ console, Ve: {}, document: { createElement: () => ({ getContext: () => ({}) }) }, VeVector: VV });
  ctxV.window = ctxV;
  vm.runInContext(fs.readFileSync(path.join(day, 'game', 've-robot.js'), 'utf8'), ctxV, { filename: 've-robot.js' });
  const VR = ctxV.VeRobot;
  const c1 = VR.cauHinhCua({ loaiRobot: 'xich', hamGoc: BANH.concat(['distance']), robot: { than: 'xich', tay: null, camBien: [] } });
  const c2 = VR.cauHinhCua({ loaiRobot: 'banh', hamGoc: BANH.concat(['spray', 'spray_back', 'warm']), robot: { than: 'hai-banh', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] } });
  const c3 = VR.cauHinhCua({ loaiRobot: 'banh', hamGoc: BANH, robot: { than: 'hai-banh', tay: null, camBien: [] } });
  kiem('cauHinhCua: hamGoc có distance / warm mà màn chưa khai → tự lắp hong-ngoai ở ổ tren; đã khai thì không lắp đôi; không có thì không lắp', J(c1.camBien) === J([{ ma: 'hong-ngoai', o: 'tren' }]) && c2.camBien.length === 1 && c3.camBien.length === 0, J([c1.camBien, c2.camBien, c3.camBien]));
  kiem('cauHinhCua + VeVector.kiemGhep: robot của màn mùa 2 (xích + súng hơi + hồng ngoại) ghép được', !loi(() => VV.kiemGhep(VR.cauHinhCua({ loaiRobot: 'xich', hamGoc: BANH.concat(['spray', 'spray_back', 'distance', 'warm']), robot: { than: 'xich', tay: 'hoi', camBien: [] } }))));

  // thẻ bộ phận, Sổ lệnh
  const d = GT.DS['hong-ngoai'];
  kiem('gioi-thieu-part: thẻ hong-ngoai ở khe camBien, lệnh distance + warm, có trong THU_TU', !!d && d.khe === 'camBien' && J(d.lenh) === '["distance","warm"]' && GT.THU_TU.includes('hong-ngoai'));
  const bp = GT.boPhanCua({ than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, BANH.concat(['spray', 'spray_back', 'distance']));
  kiem('boPhanCua: màn chỉ mở distance → thẻ hồng ngoại chỉ có distance (warm để sau)', bp.some((b) => b.ma === 'hong-ngoai' && J(b.lenh) === '["distance"]'), J(bp));
  const moTaGoc = Object.fromEntries(SoLenh.lenhGoc.map((l) => [l.ten, l.moTa]));
  const nd = GT.noiDung('hong-ngoai', ['distance', 'warm'], ['warm'], 'xich', moTaGoc);
  kiem('noiDung chỉ phần mới (warm): lệnh mới là warm, mục nói về nóng, không lặp mục distance', nd.lenh.length === 1 && nd.lenh[0].ten === 'warm' && nd.gioi.some((s) => /nóng|NÓNG/.test(s)) && !nd.gioi.some((s) => /distance\(\) trả/.test(s)), J(nd));
  kiem('Sổ lệnh lenhGoc có distance và warm, câu mô tả không có dấu ngoặc', ['distance', 'warm'].every((t) => moTaGoc[t] && !/[()]/.test(moTaGoc[t].replace(/\(\)/g, ''))), J([moTaGoc.distance, moTaGoc.warm]));

  // đèn bộ phận (den-bo-phan.js trong ngữ cảnh giả)
  const ctxD = vm.createContext({ console, document: { createElement: () => ({ getContext: () => ({}), classList: { add() {}, remove() {} }, style: {}, appendChild() {}, setAttribute() {} }), getElementById: () => null, addEventListener() {} }, Ve: { ico: () => ({}), khoa: () => ({}) }, setTimeout, clearTimeout });
  ctxD.window = ctxD;
  ['chu.js', 'den-bo-phan.js'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(day, 'game', f), 'utf8'), ctxD, { filename: f }));
  const DBP = ctxD.DenBoPhan;
  kiem('DenBoPhan.boPhanCuaMan: màn xích có distance → đèn cảm biến; phan(): mục lệnh distance / warm làm đèn cảm biến sáng', J(DBP.boPhanCuaMan({ loaiRobot: 'xich', hamGoc: BANH.concat(['distance']) })) === '["banhT","banhP","camBien"]' && DBP.phan({ robot: {}, suKien: [] }, [{ ten: 'distance', docCamBien: { cam: 'hong-ngoai' } }]).camBien === true && DBP.phan({ robot: {}, suKien: [] }, [{ ten: 'warm' }]).camBien === true && DBP.phan({ robot: {}, suKien: [] }, [{ ten: 'wait' }]).camBien === false);

  // khay (thanh-phan.js), hoạt cảnh (san-ve.js), choi.html: kiểm theo mã nguồn (giao diện cần trình duyệt)
  const tp = fs.readFileSync(path.join(day, 'game', 'thanh-phan.js'), 'utf8');
  kiem('thanh-phan.js: distance / warm là hàm cảm biến (CAM_BIEN_TEN, LENH_GOC, RE_DK_CAM), khối mẫu `if distance() > 2:`, `d = distance()`, `while distance() > 0:`, `while not warm():`',
    /CAM_BIEN_TEN = \[[^\]]*'distance', 'warm'\]/.test(tp) && /'look', 'distance', 'warm'\];/.test(tp) && /battery\|distance\|warm\)\\s\*\\\(/.test(tp) && tp.includes("'if distance() > 2:'") && tp.includes("'d = distance()'") && tp.includes("'while distance() > 0:'") && tp.includes("'while not warm():'"));
  const sv = fs.readFileSync(path.join(day, 'game', 'san-ve.js'), 'utf8');
  kiem('san-ve.js: tia hồng ngoại (veTiaVec → HU.tiaHongNgoai, nhánh cam hong-ngoai; V7c2: hết bản pixel veTiaHongNgoai), nút bật nóng (veNong, gọi từ veOVec khi nút bật), thùng bị xích đẩy đi cùng bước tien (thungXich), bệ súng giữ (be-sung trong HIEU_UNG, veGiuBe)',
    /hu\.tiaHongNgoai\(/.test(sv) && !/veTiaHongNgoai: function/.test(sv) && /d\.cam === 'hong-ngoai'/.test(sv) && /veNong: function/.test(sv) && /if \(bat\) this\.veNong\(g, x, y, now\)/.test(sv) && /s\.nguon === 'xich'/.test(sv) && /'be-sung': 1/.test(sv) && /veGiuBe: async function/.test(sv) && /ham: d\.ham \|\| null, khoang: d\.khoang \|\| 0, nong: !!d\.nong/.test(sv));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8'), xem = fs.readFileSync(path.join(day, 'hinh-mau', 'xem-vector.html'), 'utf8'), cam = fs.readFileSync(path.join(day, 'game', 've-vector-cam.js'), 'utf8');
  kiem('choi.html và trang xem hinh-mau/xem-vector.html nạp ve-vector-cam.js; tệp đó đăng ký hong-ngoai (V7c2: bộ pixel part/ đã xoá)', /ve-vector-cam\.js/.test(html) && /ve-vector-cam\.js/.test(xem) && /'hong-ngoai'/.test(cam));
  kiem('kho-ham.js biết tên gốc distance / warm (không cho đặt tên hàm trùng)', /'distance'/.test(fs.readFileSync(path.join(day, 'kho-ham.js'), 'utf8')) && /'warm'/.test(fs.readFileSync(path.join(day, 'kho-ham.js'), 'utf8')));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' : 'ĐẠT ') + (dat + hong) + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);
