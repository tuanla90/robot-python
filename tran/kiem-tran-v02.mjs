/* ============================================================================
   kiem-tran-v02.mjs — MÁY CHECK cho "Luật trận v0.2" (2 robot, bàn giao).

   Chạy:  node tran/kiem-tran-v02.mjs

   Điều đáng kiểm nhất ở v0.2: bốn chương trình chạy SONG SONG THẬT theo tick
   (không còn tính lộ trình riêng rồi gộp), và bàn giao là BẮT BUỘC.
   ========================================================================== */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const TD = require(path.join(day, 'tran-dau.js'));
const CT = require(path.join(day, 'chuong-trinh.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? ' → ' + chiTiet : '')); }
}

const L = TD.LUAT_V02;
const tr = (a, b) => TD.chamTranV02(L, a, b);

console.log('\n== 1. Sân v0.2 đối xứng ==');
{
  const co = new Set(L.khoi.map((k) => k.x + ',' + k.y));
  kiem('mọi khối có khối đối xứng', L.khoi.every((k) => co.has((2 * L.truc - k.x) + ',' + k.y)));
  kiem('nhà và trạm giao đối xứng',
    L.nha.A.x + L.nha.B.x === 2 * L.truc && L.tram.A.x + L.tram.B.x === 2 * L.truc);
  kiem('xuất phát R1/R2 của hai đội đối xứng',
    L.xuatPhat.A[0].x + L.xuatPhat.B[0].x === 2 * L.truc &&
    L.xuatPhat.A[1].x + L.xuatPhat.B[1].x === 2 * L.truc);
  kiem('trạm giao nằm NGOÀI vùng giữa (R2 tới được)',
    L.tram.A.x < L.vungGiua.tu && L.tram.B.x > L.vungGiua.den);
  kiem('khối nằm TRONG vùng giữa (chỉ R1 tới được)', L.khoi.every((k) => k.x >= L.vungGiua.tu && k.x <= L.vungGiua.den));
}

console.log('\n== 2. Chạy song song thật: mỗi tick mỗi robot đúng một hành động ==');
{
  const r = tr(CT.NHIP_A, CT.NHIP_B);
  let viPham = null;
  for (let i = 1; i < r.khung.length && !viPham; i++) {
    const t = r.khung[i - 1], s = r.khung[i];
    for (const ten of Object.keys(s.robot)) {
      const a = t.robot[ten], b = s.robot[ten];
      const d = Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      const quay = a.huong !== b.huong ? 1 : 0;
      if (d > 1 || (d === 1 && quay)) viPham = `tick ${s.tick} · ${ten} đi ${d} ô`;
    }
  }
  kiem('không robot nào nhảy quá 1 ô mỗi tick', !viPham, viPham || '');
  kiem('trận có bản ghi nhiều tick', r.khung.length > 10, String(r.khung.length) + ' khung');
}

console.log('\n== 3. Tất định ==');
{
  const a = tr(CT.NHIP_A, CT.MOT_CHUYEN_B), b = tr(CT.NHIP_A, CT.MOT_CHUYEN_B);
  kiem('hai lần chạy cho cùng điểm và cùng kết luận',
    a.diemA === b.diemA && a.diemB === b.diemB && a.thang === b.thang && a.tick === b.tick,
    `${a.diemA}-${a.diemB} vs ${b.diemA}-${b.diemB}`);
  kiem('bản ghi giống nhau', JSON.stringify(a.khung) === JSON.stringify(b.khung));
}

console.log('\n== 4. Logic đối xứng → hòa ==');
{
  const r = tr(CT.NHIP_A, CT.NHIP_B);
  kiem('"ăn nhịp" vs bản gương của nó → hòa', r.thang === 'hòa', r.lyDo);
  kiem('và cả hai đội đều giao được khối', r.diemA > 0 && r.diemB > 0, r.lyDo);
}

console.log('\n== 5. BÀN GIAO LÀ BẮT BUỘC (R1 tự mang về nhà thì không có điểm) ==');
{
  const r = tr(CT.R1_TU_MANG_A, CT.R1_TU_MANG_B);
  kiem('hai đội đều nhờ R1 mang thẳng về nhà → 0–0', r.diemA === 0 && r.diemB === 0, r.lyDo);
  kiem('khối không mất: vẫn bảo toàn', r.baoToan === L.khoi.length, String(r.baoToan));
}

console.log('\n== 6. HAI LOGIC KHÁC NHAU → KẾT QUẢ KHÁC NHAU (điều kiện pass) ==');
{
  const r = tr(CT.NHIP_A, CT.MOT_CHUYEN_B);
  kiem('"ăn nhịp 4 chuyến" vs "giao 1 chuyến" có đội thắng', r.thang !== 'hòa', r.lyDo);
  kiem('CẢ HAI đội đều giao được khối', r.diemA > 0 && r.diemB > 0, r.lyDo);
  console.log('       → ' + r.thang + ' thắng · ' + r.lyDo + ' · kết thúc: ' + r.ketThuc + ' ở tick ' + r.tick);
}

console.log('\n== 7. R2 KHÔNG TỚI TRẠM → CẢ DÂY CHUYỀN ĐỨNG (bài học "ăn nhịp") ==');
{
  const r = tr(CT.NHIP_A, CT.KHONG_GIAO_B);
  kiem('đội B không giao được khối nào', r.diemB === 0, r.lyDo);
  kiem('đội A vẫn giao được (đối thủ hỏng không làm A hỏng)', r.diemA > 0, r.lyDo);
  kiem('trận dừng vì HẾT ĐỒNG HỒ TRẬN (luật), không phải hạn an toàn',
    r.ketThuc === 'het-gio' && r.tick === L.dongHo, r.ketThuc + ' · tick ' + r.tick);
  kiem('còn khối kẹt trên sân (không giao hết được)',
    r.khung[r.khung.length - 1].conLai.length > 0,
    JSON.stringify(r.khung[r.khung.length - 1].conLai));
  const b1 = r.khung[r.khung.length - 1].robot['B-R1'];
  kiem('R1 đội B vẫn đang cầm khối khi hết giờ (dây chuyền đứng)', b1.cam === true, JSON.stringify(b1));
}

console.log('\n== 8. Luật vùng: R2 không được vào vùng giữa ==');
{
  const r = tr(CT.R2_VAO_VUNG_GIUA_A, CT.NHIP_B);
  const r2 = r.khung[r.khung.length - 1].robot['A-R2'];
  kiem('R2 đội A bị chặn, không vào được vùng giữa', r2.x < L.vungGiua.tu, 'x=' + r2.x);
  kiem('có chẩn đoán bị chặn', r.chanDoan.some((c) => /A-R2:bi-chan/.test(c)), r.chanDoan.slice(0, 3).join(' | '));
  const r1 = r.khung[r.khung.length - 1].robot['A-R1'];
  kiem('R1 thì vào được vùng giữa', r1.x >= 0, 'x=' + r1.x);
}

console.log('\n== 9. ĐỒNG HỒ TRẬN là luật — HẠN AN TOÀN thì không ==');
{
  const r = tr(CT.LAP_VO_TAN_V02, CT.LAP_VO_TAN_V02);
  kiem('không ai giao được khối nào (cả hai treo)', r.diemA === 0 && r.diemB === 0, r.lyDo);
  kiem('trận dừng ở ĐỒNG HỒ TRẬN', r.ketThuc === 'het-gio' && r.tick === L.dongHo, r.ketThuc + ' · ' + r.tick);
  kiem('robot treo KHÔNG bị coi là lỗi khi hết giờ',
    r.xong.every((x) => x.loi === null), JSON.stringify(r.xong.find((x) => x.ten === 'A-R1')));
  kiem('vẫn ra được kết luận', r.thang === 'hòa', r.lyDo);
}

console.log('\n== 10. TRANH CHẤP CÙNG TICK: luật công bằng, không theo thứ tự robot ==');
{
  const A = { doi: 'A' }, B = { doi: 'B' };
  kiem('nhặt một mình thì luật không chi phối', TD.chonNguoiThangTie(L, 6, [B]) === B);
  kiem('(6,1) là nửa sân B → B được', TD.chonNguoiThangTie(L, 6, [A, B]) === B);
  kiem('(4,1) là nửa sân A → A được', TD.chonNguoiThangTie(L, 4, [A, B]) === A);
  kiem('ĐẢO THỨ TỰ trong mảng vẫn ra kết quả đó (hết thiên vị)',
    TD.chonNguoiThangTie(L, 6, [B, A]) === B && TD.chonNguoiThangTie(L, 4, [B, A]) === A);
  kiem('khối đúng trục giữa thì không ai được', TD.chonNguoiThangTie(L, L.truc, [A, B]) === null);
  kiem('sân không có khối nào trên trục giữa', L.khoi.every((k) => k.x !== L.truc));

  // Tích hợp: hai R1 cùng pick (6,1) ở tick 8 — cách xử cũ theo thứ tự sẽ cho A
  const r = tr(CT.TRANH_CHAP_A, CT.TRANH_CHAP_B);
  const f = r.khung[8];
  kiem('sau tick 8, khối (6,1) đã bị lấy',
    !f.conLai.some((k) => k.x === 6 && k.y === 1), JSON.stringify(f.conLai));
  kiem('B-R1 là bên lấy được (khối nằm nửa sân B)',
    f.robot['B-R1'].cam === true && f.robot['A-R1'].cam === false,
    'A cam=' + f.robot['A-R1'].cam + ' · B cam=' + f.robot['B-R1'].cam);
  kiem('A-R1 bị ghi pick-hut (thua tranh chấp)',
    r.chanDoan.some((c) => /A-R1:pick-hut@6,1/.test(c)), r.chanDoan.slice(0, 3).join(' | '));
}

console.log('\n== 11. Hạn an toàn (KHÔNG phải luật) vẫn hoạt động ==');
{
  const r = TD.chamTranV02(L, CT.LAP_VO_TAN_V02, CT.LAP_VO_TAN_V02, { baoHiemTick: 50 });
  kiem('ép hạn an toàn 50 tick → dừng bằng het-han', r.ketThuc === 'het-han' && r.tick === 50, r.ketThuc + ' · ' + r.tick);
  const r1 = r.xong.find((x) => x.ten === 'A-R1');
  kiem('robot còn chạy bị đánh dấu qua-tick', r1.loi !== null && r1.loi.loai === 'qua-tick', JSON.stringify(r1));
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);
