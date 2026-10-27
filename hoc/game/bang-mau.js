/* bang-mau.js — BẢNG MÀU THEO VAI TRÒ của "Robot Chấn Hưng" (gói A1, 27/10/2026).
   Một nguồn sự thật cho mọi màu của game: JS dùng BangMau.<vai>, CSS dùng var(--g-<vai>).
   Lúc nạp trong trình duyệt, tệp này ghi mỗi vai thành biến CSS --g-<vai> trên <html>
   (nạp trong <head> TRƯỚC choi.css và mọi script vẽ), nên CSS và canvas đọc cùng một giá trị.
   Gói A1 chỉ gom màu, KHÔNG đổi màu: giá trị ở đây đúng bằng mã cũ (máy kiểm hoc/kiem-bang-mau.mjs).
   Gói A2 đổi màu bằng cách sửa giá trị ở đây. Vai "luat*" là màu luật chơi (cảm biến màu, màu vật, màu sơn):
   đổi được nhưng phải giữ đủ khác nhau để người chơi phân biệt. (Chạy ở Node: module.exports; trình duyệt: window.BangMau.) */
(function (root) {
  var M = {
    // ================================================================ (đang gom; các nhóm điền dần)
  };

  if (typeof module === 'object' && module.exports) module.exports = M;
  if (root) {
    root.BangMau = M;
    var d = root.document;
    if (d && d.documentElement && d.documentElement.style && d.documentElement.style.setProperty) {
      for (var k in M) if (Object.prototype.hasOwnProperty.call(M, k)) d.documentElement.style.setProperty('--g-' + k, M[k]);
    }
  }
})(typeof window !== 'undefined' ? window : null);
