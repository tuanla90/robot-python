/* ============================================================================
   ve-robot.js — "Đường học": LỚP VẼ ROBOT TÁCH RIÊNG (window.VeRobot).
   Mọi chỗ vẽ robot (sân chính, sân thử ở Xưởng) đều gọi VeRobot.ve(); muốn đổi hình robot chỉ sửa tệp này
   (hoặc nạp bộ PART, xem dưới).

   VeRobot.ve(cauHinh, trangThai, huong) → canvas (vẽ ở tâm ô: đặt sao cho tâm canvas trùng tâm ô)
     cauHinh   = { than: 'hai-banh' | 'nhen', tay: 'kep' | null, camBien: [{ ma, o }] }   (VeRobot.cauHinhCua(man) suy từ màn)
     trangThai = { wl, wr: 0|1|2 (bánh trái / phải: đứng / quay chậm / quay), ph: 0|1 (nhịp lật khung bánh),
                   tay: { tuThe: 'tren'|'giua'|'duoi', kep: bool (true = đóng), cam: id | null },
                   loi: 'tay' (tay nháy đỏ) | null }
     huong     = 0 lên, 1 phải, 2 xuống, 3 trái.

   CHỖ GHÉP PART (bộ part/ do Codex vẽ): nếu window.Part có Part.ghep thì VeRobot dùng nó:
     Part.ghep(cauHinh, { than: { banh: {trai, phai} }, tay: { tuThe: 'tren'|'duoi', kep: 'mo'|'dong', cam: bool } }, huong)
     (hàm veGhep() ở dưới đổi trangThai của game sang trangThai của part: 'giua' → 'tren'; kep true → 'dong'; cam id → true).
     Ảnh part to 40×40 (xe 24×24 giữa ảnh); veGhep() thu về TI_LE_PART (mặc định 0.75) rồi trả canvas có tâm = tâm xe.
     Part ném lỗi (cấu hình không ghép được) hoặc chưa nạp → rơi về hình TẠM bên dưới. Tắt hẳn part: VeRobot.dungPart = false.
     Ô sân hiện 14px; khi ô sân to lên cho vừa hình part thì đổi TI_LE_PART = 1 và Ve.T.
   Hình TẠM: xe hai bánh như cũ (Ve.makeRobot), tay kẹp Ở PHÍA TRƯỚC mũi xe như xe nâng (hai thanh nối vào mũi, hai ngàm ở đầu thanh); cảm biến sẽ ở hai bên hông:
     nâng = thanh ngắn, màu sáng; hạ = thanh dài ra phía trước, màu tối; kẹp mở = ngàm ngắn, đóng = hai ngàm chạm nhau;
     đang cầm = thùng gỗ nhỏ giữa hai ngàm (đi theo xe, xoay theo hướng xe).
   ========================================================================== */
(function () {
  'use strict';

  var TI_LE_PART = 0.75;
  var CAN = 34;                      // cạnh canvas hình tạm có tay (xe 16 + viền ở giữa, càng nhô 8px phía trước; tâm canvas = tâm xe)
  var ND = { ink: '#1b120a' };
  var cache = {};

  /* ---------------------------------------------------------------- cấu hình */
  /** Cấu hình robot của một màn: có lệnh tay trong hamGoc thì có tay kẹp. */
  function cauHinhCua(man) {
    var goc = (man && man.hamGoc) || [];
    var coTay = goc.some(function (t) { return t === 'arm_down' || t === 'arm_up' || t === 'grab' || t === 'release'; });
    var loai = man && man.loaiRobot === 'nhen' ? 'nhen' : 'hai-banh';
    return { than: loai, tay: loai === 'hai-banh' && coTay ? 'kep' : null, camBien: [] };
  }

  function chuanTay(t) {
    t = t || {};
    return { tuThe: t.tuThe === 'duoi' ? 'duoi' : t.tuThe === 'giua' ? 'giua' : 'tren', kep: t.kep === true || t.kep === 'dong', cam: t.cam !== null && t.cam !== undefined && t.cam !== false };
  }

  /* ----------------------------------------------------------------- hình tạm */
  function ctxMoi(n) {
    var cv = document.createElement('canvas'); cv.width = n; cv.height = n;
    var g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    return { cv: cv, g: g };
  }
  function veTamTay(huong, wl, wr, ph, tay, loi) {
    var o = ctxMoi(CAN), g = o.g, i;
    var tuThe = tay.tuThe, tren = tuThe === 'tren', duoi = tuThe === 'duoi';
    var dong = tay.kep, cam = tay.cam;
    var mau = loi ? { f: '#ff3b30', h: '#ffb0a8' } : duoi ? { f: '#c8661a', h: '#e48a3c' } : tren ? { f: '#ffb13b', h: '#ffe0a0' } : { f: '#e68a24', h: '#ffc070' };
    // Hệ toạ độ canvas 34×34, xe (18×18 có viền) đặt ở (8, 8) → mũi xe ở hàng y = 8, tâm xe = tâm canvas. Tay ở PHÍA TRƯỚC mũi (hàng 0..7).
    // hai thanh (như càng xe nâng) x 9..10 và 23..24 (đúng hai góc trước của thân, hàng 1..10) nối vào xe; ngàm ở hàng 2..3: mở = ngắn, đóng = chạm nhau, ôm thùng = chạm hai bên thùng.
    var dauNgam = !dong ? 11 : cam ? 12 : 16;                         // x cuối của ngàm trái
    var rect = [[9, 1, 2, 10], [23, 1, 2, 10], [9, 2, dauNgam - 8, 2], [33 - dauNgam, 2, dauNgam - 8, 2]];   // [x, y, w, h]
    if (tren) {                                                       // tay nâng: có bóng đổ xuống đất (cao hơn mặt đất)
      g.fillStyle = 'rgba(0,0,0,.3)';
      rect.forEach(function (r) { g.fillRect(r[0] + 1, r[1] + 2, r[2], r[3]); });
      if (cam) g.fillRect(15, 3, 8, 8);
    }
    g.fillStyle = ND.ink;
    rect.forEach(function (r) { g.fillRect(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2); });
    g.drawImage(Ve.makeRobot(0, wl, wr, ph), 8, 8);                   // thân xe (đã có viền) đè lên chân hai thanh
    rect.forEach(function (r) { g.fillStyle = mau.f; g.fillRect(r[0], r[1], r[2], r[3]); });
    g.fillStyle = mau.h;
    g.fillRect(9, 3, 1, 8); g.fillRect(23, 3, 1, 8); g.fillRect(9, 2, dauNgam - 8, 1); g.fillRect(33 - dauNgam, 2, dauNgam - 8, 1);
    if (duoi) { g.fillStyle = '#fff6e3'; g.fillRect(9, 1, 1, 1); g.fillRect(24, 1, 1, 1); }   // đầu càng chạm đất
    if (cam) {                                                        // thùng giữa hai càng, ngay trước mũi: 6×6 + viền
      var cx = 14, cy = 1;
      g.fillStyle = ND.ink; g.fillRect(cx - 1, cy - 1, 8, 8);
      g.fillStyle = '#c98a45'; g.fillRect(cx, cy, 6, 6);
      g.fillStyle = '#e8b574'; g.fillRect(cx, cy, 6, 1); g.fillRect(cx, cy, 1, 6);
      g.fillStyle = '#8a5a24'; g.fillRect(cx, cy + 5, 6, 1); g.fillRect(cx + 5, cy, 1, 6);
      for (i = 1; i < 5; i++) { g.fillRect(cx + i, cy + i, 1, 1); g.fillRect(cx + 5 - i, cy + i, 1, 1); }
    }
    return xoay(o.cv, huong);
  }
  function xoay(cv, huong) {
    huong = ((huong || 0) % 4 + 4) % 4;
    if (!huong) return cv;
    var o = ctxMoi(cv.width), g = o.g, c = cv.width / 2;
    g.translate(c, c); g.rotate(huong * Math.PI / 2); g.translate(-c, -c);
    g.drawImage(cv, 0, 0);
    return o.cv;
  }

  /* --------------------------------------------------------------- ghép PART */
  function veGhep(cauHinh, tt, huong) {
    var P = (typeof window !== 'undefined') ? window.Part : null;
    if (!P || typeof P.ghep !== 'function' || VeRobot.dungPart === false) return null;
    var tay = chuanTay(tt.tay);
    var cfg = { than: cauHinh.than === 'nhen' ? 'nhen' : (cauHinh.than || 'hai-banh'), tay: cauHinh.tay || null, camBien: cauHinh.camBien || [] };
    var st = {
      than: { banh: { trai: tt.wl > 0 ? 1 : 0, phai: tt.wr > 0 ? 1 : 0 } },
      tay: { tuThe: tay.tuThe === 'duoi' ? 'duoi' : 'tren', kep: tay.kep ? 'dong' : 'mo', cam: tay.cam }
    };
    var raw;
    try { raw = P.ghep(cfg, st, huong); } catch (e) { return null; }
    if (!raw || !raw.width) return null;
    var n = Math.max(1, Math.round(raw.width * VeRobot.TI_LE_PART));
    var o = ctxMoi(n);
    o.g.drawImage(raw, 0, 0, raw.width, raw.height, 0, 0, n, n);
    return o.cv;
  }

  /* ------------------------------------------------------------------- chính */
  function ve(cauHinh, trangThai, huong) {
    cauHinh = cauHinh || { than: 'hai-banh', tay: null, camBien: [] };
    var tt = trangThai || {}, wl = tt.wl || 0, wr = tt.wr || 0, ph = tt.ph ? 1 : 0;
    huong = ((huong || 0) % 4 + 4) % 4;
    var tay = cauHinh.tay ? chuanTay(tt.tay) : null;
    var khoa = [cauHinh.than, cauHinh.tay || '-', JSON.stringify(cauHinh.camBien || []), huong, wl, wr, ph,
      tay ? tay.tuThe + (tay.kep ? 'K' : 'm') + (tay.cam ? 'C' : '-') : '', tt.loi || '', VeRobot.dungPart === false ? 'x' : (typeof window !== 'undefined' && window.Part ? 'P' : 'x')].join('|');
    if (cache[khoa]) return cache[khoa];
    var cv = null;
    if (cauHinh.than !== 'nhen') cv = veGhep(cauHinh, { wl: wl, wr: wr, tay: tay, loi: tt.loi }, huong);
    if (!cv) {
      if (cauHinh.than === 'nhen') cv = Ve.makeNhen(wl > 0 || wr > 0 ? ph : 0);
      else if (!tay) cv = Ve.makeRobot(huong, wl, wr, ph);
      else cv = veTamTay(huong, wl, wr, ph, tay, tt.loi === 'tay');
    }
    cache[khoa] = cv;
    return cv;
  }

  var VeRobot = { ve: ve, cauHinhCua: cauHinhCua, chuanTay: chuanTay, dungPart: true, TI_LE_PART: TI_LE_PART };
  window.VeRobot = VeRobot;
})();
