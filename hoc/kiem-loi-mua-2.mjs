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
  const SUNG = BANH.concat(['shoot', 'shoot_back', 'distance', 'warm']);
  const SAN = ['#######', '#..N..#', '#.....#', '#.....#', '#.....#', '#######'];      // nút (3,1) trên tường trên
  const chay = (bd, code, them) => SanHoc.chay(Object.assign({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN, batDau: bd }, them || {}), code);
  const nongs = (r) => docs(r).filter((d) => d.ham === 'warm').map((d) => d.nong);

  let r = chay({ x: 3, y: 2, huong: 0 }, 'a = warm()\nshoot()\nwait()\nb = warm()\nshoot()\nwait()\nc = warm()\nwait()\n');
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
  const CHO = { san: ['#######', '#.....#', '#..N..#', '#.....#', '#######'], doi: [{ batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['warm']) }, { batDau: { x: 3, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['shoot', 'shoot_back']) }] };
  r = SanHoc.chay(CHO, ['while not warm():\n    wait()\n', 'wait()\nshoot()\nwait()\n']);
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

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' : 'ĐẠT ') + (dat + hong) + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);
