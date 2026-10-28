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
   cửa phải được bắn mở, bạn phải đi qua…). L = min theo r, tối thiểu TOI_THIEU_L (2), chặn trên TRAN_L_CHO (8). Không đếm được thì dùng TRAN_L_CHO và ghi rõ.
   Liệt kê: ĐỦ mọi dãy dài ≤ min(L, TRAN_L_DU = 3); với 4 ≤ |x| ≤ L (khi ngưỡng nhịp còn rộng) thì liệt kê các dãy "chờ rồi làm" W…W y và "làm rồi chờ" y W…W
   (|y| ≤ 2, y tùy ý): thân dài mà không chủ yếu là chờ thì làm xe lệch chỗ / lệch hướng / bắn đổi nút ở mọi lần gọi, chương trình khóa phía sau đi sai.
   Chạy thử với nhipToiDa = sao.nhip + 1 (chỉ cần biết có thắng trong ngưỡng không), nên mỗi lần chấm ngắn.
   Hàm có tham số p (chương 2): thân cố định còn dùng được p. Tham số là CHUỖI (lực bắn: X("fast")) thì thêm chữ p = fire(p), q = fire_back(p) vào bảng;
   tham số là SỐ (X(3)) thì thêm các thân có một vòng `for i in range(p):` (trước vòng, trong vòng, sau vòng là dãy chữ, tổng dài ≤ 2, trong vòng ≥ 1).

   Hàm xuất: CHU_DOI, demGoi, timThanCoDinhDoi
   ========================================================================== */
import { moRong } from './do-duong-che-luc-ban.mjs';

export const CHU_DOI = {
  M: ['move()'], B: ['back()'], W: ['wait()'], R: ['turn_right()'], L: ['turn_left()'], U: ['u_turn()'], P: ['tr_right()'], Q: ['tr_left()'],
  f: ['fire("fast")'], c: ['fire("charge")'], g: ['fire_back("fast")'], h: ['fire_back("charge")']
};
const CHU_THAM = (p) => ({ p: ['fire(' + p + ')'], q: ['fire_back(' + p + ')'] });
const TRAN_L_DU = 3, TRAN_L_CHO = 8, TOI_THIEU_L = 2;

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
  const hv = (m.loiGiai.hamCuaEmMoi || []).concat(m.loiGiai.hamCuaMan || []).find((h) => h.ten === tenX) || { thamSo: [] };
  const p = hv.thamSo[0] || null;
  const doiSo = chinh.flatMap((c) => c.flatMap((l) => [...l.matchAll(/([A-Za-z_]\w*)\(([^()]*)\)/g)].filter((x) => x[1] === tenX).map((x) => x[2].trim())));
  const kieu = !p ? null : doiSo.some((a) => /^"/.test(a)) ? 'chuoi' : 'so';
  const CHU = Object.assign({}, CHU_DOI, kieu === 'chuoi' ? CHU_THAM(p) : {});
  const chu = 'MBWRLUPQ' + (sung ? 'fcgh' : '') + (kieu === 'chuoi' && sung ? 'pq' : '');
  const bang = [];
  let L = tuy.L || TRAN_L_CHO, demDuoc = true;
  chinh.forEach((c, i) => {
    if (!coGoi[i]) return;
    const d = demGoi(c, kho, tenX);
    if (!d || !d.goi) { demDuoc = false; bang.push({ robot: i, goi: null, nhip: null }); return; }
    bang.push({ robot: i, goi: d.goi, nhip: d.nhip });
    L = Math.min(L, Math.floor((m.sao.nhip - d.nhip) / d.goi));
  });
  L = Math.min(TRAN_L_CHO, Math.max(TOI_THIEU_L, L));
  const thang = [], da = new Set();
  let soThu = 0;
  function thu(x) {
    if (da.has(x)) return;
    da.add(x); soThu++;
    const than = x ? [...x].flatMap((k) => CHU[k]) : ['pass'];
    thuThan(x, than);
  }
  function thuThan(x, than) {
    const r = chamThan(than);
    if (r.thang && r.soNhip <= m.sao.nhip) thang.push({ day: x, than, soO: r.soO, soNhip: r.soNhip, sao: r.sao });
  }
  const du = Math.min(L, TRAN_L_DU);
  (function di(x) { thu(x); if (x.length < du) for (const k of chu) di(x + k); })('');
  const ngan = [''].concat([...chu], [...chu].flatMap((a) => [...chu].map((b) => a + b)));
  for (let n = du + 1; n <= L; n++) for (const y of ngan) if (y.length < n) { thu('W'.repeat(n - y.length) + y); thu(y + 'W'.repeat(n - y.length)); }
  if (kieu === 'so') {                                                  // thân có vòng for theo tham số số
    const dong = (y) => [...y].flatMap((k) => CHU[k]);
    for (const trong of ngan.filter((y) => y.length >= 1 && y.length <= 2)) for (const ngoai of ngan.filter((y) => y.length <= 2 - trong.length)) for (let k = 0; k <= ngoai.length; k++) {
      const truoc = ngoai.slice(0, k), sau = ngoai.slice(k), ma = truoc + '(' + trong + ')' + sau;
      if (da.has(ma)) continue;
      da.add(ma); soThu++;
      thuThan(ma, dong(truoc).concat(['for i in range(' + p + '):'], dong(trong).map((l) => '    ' + l), dong(sau)));
    }
  }
  return { L, du, demDuoc, bang, soThu, chu: chu + (kieu === 'so' ? ' + for theo ' + p : ''), thang };
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
