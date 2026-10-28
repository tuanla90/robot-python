/* ============================================================================
   do-duong-doi-mua-2.mjs — BỘ DÒ "THÂN HÀM CỐ ĐỊNH" cho gói 8 mùa 2 "Đội" (man-doi-mua-2.js: chương doi-mua-2, che-doi-mua-2). Dùng trong kiem-doi-mua-2.mjs; không nằm trong game.

   Mọi màn của gói KHÓA chương trình chính của CẢ HAI robot (doi[i].coDinh); người chơi chỉ viết / sửa thân MỘT hàm X (hàm của màn ở chương 1,
   hàm của em mới ở chương 2). Chương trình khóa gọi X ở nhiều chỗ (một robot hay cả hai). Thân X KHÔNG đọc cảm biến thì mọi lần gọi chạy CÙNG
   một dãy hành động (không biến, không tham số), nên "né cảm biến" = có một dãy cố định x làm thân X mà cả đội vẫn thắng trong sao.nhip.

   Bộ dò liệt kê MỌI dãy x dài ≤ L trên bảng chữ (mỗi chữ = một lệnh của kho, 1 nhịp; P / Q là tr_right / tr_left của xích, 2 nhịp):
       M move  B back  W wait  R turn_right  L turn_left  U u_turn  P tr_right  Q tr_left
       f fire("fast")  c fire("charge")  g fire_back("fast")  h fire_back("charge")      (chữ bắn chỉ khi MỌI robot gọi X đều có súng)
   rồi chấm thật bằng cham.js (luật san-hoc.js đầy đủ: đồng đội chặn, cửa, nút, thùng, giật…, kể cả chương trình khóa có đọc cảm biến).
   Mỗi lệnh gốc tự viết (left_move() … wait()) đều trùng một chữ trên về kết quả (xe hai bánh: một bánh tới hay bánh kia lùi đều quay 90°;
   xích: nửa vòng quay lẻ bị mất như đứng yên, hai nửa liền nhau cùng tổ hợp = tr_right / tr_left), nên bảng chữ đủ.
   L: robot r gọi X c_r lần (đếm tĩnh: mở chương trình khóa bằng moRong của gói 6, X giữ thành chữ 'X'; chương trình có while / if thì không đếm được)
   và các lệnh đứng TRƯỚC lần gọi X cuối của r tốn b_r nhịp; thắng trong sao.nhip thì c_r · |x| + b_r ≤ sao.nhip (mỗi chữ ≥ 1 nhịp), với giả thiết
   mọi lần gọi đều chạy (cờ của robot nằm sau lần gọi cuối: thân X không tự đưa robot tới cờ sớm, vì đường tới cờ cần phần chương trình khóa sau đó:
   cửa phải được bắn mở, bạn phải đi qua…). L = min theo r, tối thiểu TOI_THIEU_L (2), chặn trên TRAN_L (3). Không đếm được thì dùng TRAN_L và ghi rõ.

   Hàm xuất: CHU_DOI, demGoi, timThanCoDinhDoi
   ========================================================================== */
import { moRong } from './do-duong-che-luc-ban.mjs';

export const CHU_DOI = {
  M: ['move()'], B: ['back()'], W: ['wait()'], R: ['turn_right()'], L: ['turn_left()'], U: ['u_turn()'], P: ['tr_right()'], Q: ['tr_left()'],
  f: ['fire("fast")'], c: ['fire("charge")'], g: ['fire_back("fast")'], h: ['fire_back("charge")']
};
const TRAN_L = 3, TOI_THIEU_L = 2;

/** Số lần chương trình (dòng) gọi tenX và số nhịp tối thiểu của phần còn lại; null nếu không mở tĩnh được. */
export function demGoi(dong, kho, tenX) {
  const e = moRong(dong, kho, {}, tenX);
  if (e === null) return null;
  return { goi: e.split('X').length - 1, nhip: e.slice(0, Math.max(0, e.lastIndexOf('X'))).replace(/X/g, '').length };
}

/**
 * Màn khóa: thân X cố định (dãy chữ) nào thắng trong sao.nhip? chamThan(than) → kết quả cham.js của cả màn với thân X = than.
 * Trả { L, demDuoc, bang: [{ robot, goi, nhip }], soThu, thang: [{ day, than, soO, soNhip, sao }] }.
 */
export function timThanCoDinhDoi(m, tenX, kho, chamThan, tuy = {}) {
  const chinh = m.loiGiai.doi.map((d) => d.chinh);
  const goiX = chinh.map((c) => moRongGoi(c, kho, tenX));            // robot nào gọi X (kể cả qua hàm của em)
  const coGoi = goiX.map((g) => g.coGoi);
  const sung = m.doi.every((d, i) => !coGoi[i] || (d.hamGoc || []).includes('shoot'));
  const chu = 'MBWRLUPQ' + (sung ? 'fcgh' : '');
  const bang = [];
  let L = tuy.L || TRAN_L, demDuoc = true;
  chinh.forEach((c, i) => {
    if (!coGoi[i]) return;
    const d = demGoi(c, kho, tenX);
    if (!d || !d.goi) { demDuoc = false; bang.push({ robot: i, goi: null, nhip: null }); return; }
    bang.push({ robot: i, goi: d.goi, nhip: d.nhip });
    L = Math.min(L, Math.floor((m.sao.nhip - d.nhip) / d.goi));
  });
  L = Math.min(TRAN_L, Math.max(TOI_THIEU_L, L));
  const thang = [];
  let soThu = 0;
  (function di(x) {
    soThu++;
    const than = x ? [...x].flatMap((k) => CHU_DOI[k]) : ['pass'];
    const r = chamThan(than);
    if (r.thang && r.soNhip <= m.sao.nhip) thang.push({ day: x, than, soO: r.soO, soNhip: r.soNhip, sao: r.sao });
    if (x.length >= L) return;
    for (const k of chu) di(x + k);
  })('');
  return { L, demDuoc, bang, soThu, chu, thang };
}

/** X có được gọi trong chương trình (thẳng hay qua một hàm của em gọi X) không. */
function moRongGoi(dong, kho, tenX) {
  const bang = new Map(kho.map((h) => [h.ten, h]));
  const goi = (ds) => [...new Set(ds.flatMap((l) => [...l.replace(/#.*$/, '').matchAll(/([A-Za-z_]\w*)\s*\(/g)].map((x) => x[1])))];
  const da = new Set(), cho = goi(dong);
  while (cho.length) {
    const t = cho.pop();
    if (t === tenX) return { coGoi: true };
    if (da.has(t) || !bang.has(t)) continue;
    da.add(t); cho.push(...goi(bang.get(t).than));
  }
  return { coGoi: false };
}
