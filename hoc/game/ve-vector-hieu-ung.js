var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve-vector-hieu-ung.js — "Robot Chấn Hưng": HIỆU ỨNG TRÊN SÂN bằng VECTOR (VeVector.HU), gói V4 (27/10).
   Chế độ vector (?ve=vector) của san-ve.js rẽ nhánh sang đây: mọi hoạt cảnh / hiệu ứng vẽ bằng hình mượt (tròn, bo góc, gradient nhẹ, nét đều) cùng phong cách lab trắng
   với ô / vật / robot vector, KHÔNG còn khối fillRect kiểu pixel. Toạ độ y như nhánh pixel: PIXEL SÂN (T = 14 mỗi ô), nên luồng phát lại của san-ve.js không đổi;
   canvas sân (phép phóng sv) và lớp phủ robot (phép phóng ku) đều theo pixel thiết bị nên nét ở mọi cỡ ô. Màu: chỉ từ bảng màu (BM.vec*, BM.tia*Rgb…).
   Mỗi hàm nhận g (đã đặt phép biến hình theo pixel sân) và dữ liệu đã tính sẵn ở san-ve.js; không đọc luật chơi, không gọi Math.random (nhánh pixel giữ nguyên chuỗi số ngẫu nhiên).
   NHÓM (theo bước gói V4):
     hạt / bụi / khói / mảnh vỡ (hat), chớp đỏ (chop), dấu ? ! (dau), sao choáng (choang), bong chữ màu (bongMau), ô cảnh báo / ô vỡ (oDo, vachMep).
   Node: nạp được (máy kiểm hoc/kiem-ve-vector.mjs vẽ từng hiệu ứng lên canvas giả, đếm lệnh). Giảm chuyển động (prefers-reduced-motion): giam() → lắc / nảy tắt.
   ========================================================================== */
(function (root) {
  'use strict';
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var H = V.H, T = 14, PI2 = Math.PI * 2;
  var _giam = null;
  /** Người dùng xin giảm chuyển động (prefers-reduced-motion): chớp mắt / thở / lắc / nảy giảm hoặc tắt; chuyển động có nghĩa luật (đi, bắn) vẫn chạy. */
  function giam() {
    if (_giam === null) { try { _giam = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { _giam = false; } }
    return _giam;
  }
  function rgba(rgb, a) { return 'rgba(' + rgb + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; }
  function tron(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0.05, r), 0, PI2); }
  function boO(g, x, y, m, r) { H.bo(g, x * T + m, y * T + m, T - 2 * m, T - 2 * m, r); }

  /* ---------------------------------------------------------------- hạt: bụi, tia lửa, pháo giấy (tròn, viền mực mờ cho thấy trên sàn trắng), khói (cụm tròn nở dần), mảnh vỡ (tam giác xoay) */
  function hat(g, ds) {
    for (var i = 0; i < ds.length; i++) {
      var q = ds[i], a = q.mo ? Math.min(1, q.life / 18) : 1, s = q.s || 1, x = q.x + s / 2, y = q.y + s / 2;
      if (a <= 0) continue;
      g.globalAlpha = a;
      if (q.kieu === 'khoi') {                                                       // khói: cụm tròn mềm, nở ra khi bay lên và nhạt dần
        var r = s * 0.55 + Math.max(0, 1 - q.life / 58) * 1.8;
        g.globalAlpha = a * 0.55; tron(g, x, y, r); g.fillStyle = q.c; g.fill();
        g.globalAlpha = a * 0.3; tron(g, x - r * 0.3, y - r * 0.3, r * 0.55); g.fillStyle = BM.vecVo; g.fill();
      } else if (q.kieu === 'manh') {                                                // mảnh vỡ: tam giác nhỏ, xoay theo đường bay
        var goc = (q.x * 0.7 + q.y * 0.45 + i) % PI2, k = s * 0.75;
        g.beginPath();
        g.moveTo(x + Math.cos(goc) * k, y + Math.sin(goc) * k);
        g.lineTo(x + Math.cos(goc + 2.3) * k * 0.8, y + Math.sin(goc + 2.3) * k * 0.8);
        g.lineTo(x + Math.cos(goc + 4.1) * k * 0.65, y + Math.sin(goc + 4.1) * k * 0.65);
        g.closePath(); g.fillStyle = q.c; g.fill();
        g.lineWidth = 0.22; g.strokeStyle = rgba(BM.vecVienRgb, 0.55); g.stroke();
      } else {
        tron(g, x, y, Math.max(0.42, s * 0.55)); g.fillStyle = q.c; g.fill();
        g.lineWidth = 0.2; g.strokeStyle = rgba(BM.vecVienRgb, 0.32); g.stroke();
      }
    }
    g.globalAlpha = 1;
  }

  /* ---------------------------------------------------------------- chớp đỏ (đâm tường / lỗi): viền đỏ toả vào từ mép cửa sổ vẽ, giữa trong */
  function chop(g, x, y, w, h, a) {
    var cx = x + w / 2, cy = y + h / 2, r = Math.sqrt(w * w + h * h) / 2;
    var gr = g.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
    gr.addColorStop(0, rgba(BM.vecDoRgb, 0.06 * a)); gr.addColorStop(0.7, rgba(BM.vecDoRgb, 0.22 * a)); gr.addColorStop(1, rgba(BM.vecDoRgb, 0.5 * a));
    H.bo(g, x, y, w, h, 3); g.fillStyle = gr; g.fill();
    H.bo(g, x + 0.6, y + 0.6, w - 1.2, h - 1.2, 2.6); g.lineWidth = 1.2; g.strokeStyle = rgba(BM.vecDoRgb, 0.7 * a); g.stroke();
  }

  /* ---------------------------------------------------------------- dấu nổi '?' (hụt, thắc mắc) / '!' (bị chặn, giật mình): bong bóng tròn trắng viền mực, đuôi chỉ về robot */
  /** (cx, cy) tâm ô robot, cao: từ tâm tới chân dấu (như nhánh pixel), yTran: mép trên cửa sổ vẽ (pixel sân). */
  function dau(g, kieu, cx, cy, now, cao, yTran) {
    var bob = giam() ? 0 : Math.sin(now / 110) * 0.8, x = cx + 6, y = Math.max(yTran + 5, cy - (cao || 21) + 3.5 + bob), r = 4.1, mau = kieu === '!' ? BM.vecDo : BM.vecDenToi;
    g.save();
    g.beginPath(); g.moveTo(x - 2.6, y + 2.6); g.lineTo(x - 4.6, y + 5.6); g.lineTo(x - 0.6, y + 3.6); g.closePath();     // đuôi bong bóng
    g.fillStyle = BM.vecVo; g.fill(); g.lineWidth = 0.7; g.strokeStyle = BM.vecVien; g.lineJoin = 'round'; g.stroke();
    tron(g, x, y, r); g.fillStyle = H.gradToa(g, x - 1.2, y - 1.4, r * 1.4, [[0, BM.vecVo], [1, BM.vecVoGiua]]); g.fill(); g.lineWidth = 0.75; g.strokeStyle = BM.vecVien; g.stroke();
    g.strokeStyle = mau; g.fillStyle = mau; g.lineCap = 'round';
    if (kieu === '!') {
      g.lineWidth = 1.35; g.beginPath(); g.moveTo(x, y - 2.3); g.lineTo(x, y + 0.5); g.stroke();
      tron(g, x, y + 2.15, 0.72); g.fill();
    } else {
      g.lineWidth = 1.05; g.beginPath(); g.arc(x, y - 1.15, 1.3, Math.PI * 1.08, Math.PI * 2.35); g.lineTo(x, y + 0.6); g.stroke();
      tron(g, x, y + 2.2, 0.62); g.fill();
    }
    g.restore();
  }

  /* ---------------------------------------------------------------- ba ngôi sao choáng quay quanh đầu (va chạm / vướng tay / hết pin): sao bốn cánh, sao sau nhỏ và mờ hơn */
  function choang(g, cx, y0, now, a) {
    g.save();
    for (var k = 0; k < 3; k++) {
      var ang = now / 145 + k * 2.0944, sau = Math.sin(ang) < 0, sx = cx + Math.cos(ang) * 6.5, sy = y0 + Math.sin(ang) * 2.2, r = sau ? 1.35 : 1.8;
      g.globalAlpha = a * (sau ? 0.7 : 1);
      g.beginPath();
      for (var j = 0; j < 8; j++) { var rr = j & 1 ? r * 0.38 : r, aa = j * Math.PI / 4 + now / 400; if (j) g.lineTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr); else g.moveTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr); }
      g.closePath(); g.fillStyle = (k + ((now / 120) | 0)) % 2 === 0 ? BM.vecVang : BM.vecVangSang; g.fill();
      g.lineWidth = 0.4; g.strokeStyle = BM.vecVien; g.lineJoin = 'round'; g.stroke();
    }
    g.restore();
  }

  /* ---------------------------------------------------------------- bong chữ màu cảm biến vừa đọc ("red"…): viên thuốc trắng, viền + chấm màu đọc được, chữ mực */
  /** (x, y, w, hh): hộp chữ (như nhánh pixel, chỗ đặt đã chọn bằng Field.viTriBong), col: màu hiển thị, txt: chữ, a: độ đậm. */
  function bongMau(g, x, y, w, hh, col, txt, a) {
    g.save(); g.globalAlpha = a;
    H.bo(g, x - 0.5, y - 0.5, w + 1, hh + 1, (hh + 1) / 2); g.fillStyle = BM.vecVo; g.fill(); g.lineWidth = 0.8; g.strokeStyle = col; g.stroke();
    H.bo(g, x - 0.5, y - 0.5, w + 1, hh + 1, (hh + 1) / 2); g.lineWidth = 0.35; g.strokeStyle = BM.vecVien; g.stroke();
    tron(g, x + 2.6, y + hh / 2, 1.3); g.fillStyle = col; g.fill(); g.lineWidth = 0.3; g.strokeStyle = BM.vecVien; g.stroke();
    g.font = '8px VT323, monospace'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = BM.vecVien;
    g.fillText(txt, x + w / 2 + 1.4, y + hh / 2 + 0.5);
    g.restore();
  }

  /* ---------------------------------------------------------------- ô đỏ nhấp nháy (thả bị chặn, ô rơi vỡ, cổng bị chắn): tấm đỏ bo góc + viền đỏ; vo: thêm vết nứt */
  function oDo(g, x, y, al, vo) {
    boO(g, x, y, 0.7, 2.4); g.fillStyle = rgba(BM.vecDoRgb, al); g.fill();
    g.lineWidth = 0.8; g.strokeStyle = rgba(BM.vecDoRgb, 0.85); g.stroke();
    if (vo) {
      var px = x * T, py = y * T;
      g.beginPath(); g.moveTo(px + 3, py + 4); g.lineTo(px + 6, py + 6.5); g.lineTo(px + 5, py + 8.5); g.lineTo(px + 8.5, py + 10.5);
      g.moveTo(px + 6, py + 6.5); g.lineTo(px + 10, py + 5);
      g.lineWidth = 0.55; g.strokeStyle = rgba(BM.vecDoRgb, 0.9); g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
    }
  }
  /** Vạch đỏ bo tròn ở mép sân (ô rơi ngoài sân): ngang = mép trái / phải (vạch đứng). */
  function vachMep(g, x, y, ngang, al) {
    if (ngang) H.bo(g, x, y - 6, 2, 12, 1); else H.bo(g, x - 6, y, 12, 2, 1);
    g.fillStyle = rgba(BM.vecDoRgb, al); g.fill();
  }

  V.HU = { giam: giam, rgba: rgba, hat: hat, chop: chop, dau: dau, choang: choang, bongMau: bongMau, oDo: oDo, vachMep: vachMep };
  if (typeof module === 'object' && module.exports) module.exports = V.HU;
})(typeof window !== 'undefined' ? window : globalThis);
