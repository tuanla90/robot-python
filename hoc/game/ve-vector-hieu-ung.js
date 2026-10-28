var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve-vector-hieu-ung.js — "Robot Chấn Hưng": HIỆU ỨNG TRÊN SÂN bằng VECTOR (VeVector.HU), gói V4 (27/10).
   Chế độ vector (?ve=vector) của san-ve.js rẽ nhánh sang đây: mọi hoạt cảnh / hiệu ứng vẽ bằng hình mượt (tròn, bo góc, gradient nhẹ, nét đều) cùng phong cách lab trắng
   với ô / vật / robot vector, KHÔNG còn khối fillRect kiểu pixel. Toạ độ y như nhánh pixel: PIXEL SÂN (T = 14 mỗi ô), nên luồng phát lại của san-ve.js không đổi;
   canvas sân (phép phóng sv) và lớp phủ robot (phép phóng ku) đều theo pixel thiết bị nên nét ở mọi cỡ ô. Màu: chỉ từ bảng màu (các vai vec… và bộ ba tia…Rgb).
   Mỗi hàm nhận g (đã đặt phép biến hình theo pixel sân) và dữ liệu đã tính sẵn ở san-ve.js; không đọc luật chơi, không gọi Math.random (nhánh pixel giữ nguyên chuỗi số ngẫu nhiên).
   NHÓM (theo bước gói V4):
     bước 2: hạt / bụi / khói / mảnh vỡ (hat), chớp đỏ (chop), dấu ? ! … (dau), sao choáng (choang), bong chữ màu (bongMau), ô cảnh báo / ô vỡ (oDo, vachMep);
     bước 3: tia cảm biến từ ổ thật (tiaKc, tiaCamera, tiaNhin, tiaTu, tiaHongNgoai), quầng nóng + gợn nhiệt (nong);
     bước 4: bóng vật (bongVat, bongElip, toDo), vòng hút, viền lỗi, vạch ngắm (ngam), vệt vòng cung (vetCung), ô sạc lóe / thở (sacLoe, thoSac), bóng drone, thanh pin, thẻ đạn,
             ô sơn (sonCan, sonDa), kim cương bóng mờ, khung / tấm ô bo góc (khungO, tamO), chấm, vạch.
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
  /** Chữ trên canvas ở vector (gói V5a): phông giao diện mới thay VT323. Cỡ chọn để bề ngang chữ ≤ bản VT323 8px (san-ve.js đo hộp bằng VT323):
   *  nhãn màu (bong chữ) Google Sans Flex 6,5px, số (pin, đạn, lượt sạc) Google Sans Code 6px. */
  var PHONG_CHU = '600 6.5px "Google Sans Flex", system-ui, sans-serif', PHONG_SO = '600 6px "Google Sans Code", ui-monospace, monospace';
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
    var bob = giam() ? 0 : Math.sin(now / 110) * 0.8, x = cx + 6, y = Math.max(yTran + 5, cy - (cao || 21) + 3.5 + bob), r = 4.1, mau = kieu === '!' ? BM.vecDo : kieu === '…' ? BM.vecBacToi : BM.vecDenToi;
    g.save();
    g.beginPath(); g.moveTo(x - 2.6, y + 2.6); g.lineTo(x - 4.6, y + 5.6); g.lineTo(x - 0.6, y + 3.6); g.closePath();     // đuôi bong bóng
    g.fillStyle = BM.vecVo; g.fill(); g.lineWidth = 0.7; g.strokeStyle = BM.vecVien; g.lineJoin = 'round'; g.stroke();
    tron(g, x, y, r); g.fillStyle = H.gradToa(g, x - 1.2, y - 1.4, r * 1.4, [[0, BM.vecVo], [1, BM.vecVoGiua]]); g.fill(); g.lineWidth = 0.75; g.strokeStyle = BM.vecVien; g.stroke();
    g.strokeStyle = mau; g.fillStyle = mau; g.lineCap = 'round';
    if (kieu === '…') {                                                          // đang chờ (nhiều robot): ba chấm xám
      for (var k = -1; k <= 1; k++) { tron(g, x + k * 1.6, y + 0.3, 0.62); g.fill(); }
    } else if (kieu === '!') {
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
    g.font = PHONG_CHU; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = BM.vecVien;
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

  /* ================================================================ TIA CẢM BIẾN + SÓNG (bước 3): mọi tia xuất phát từ Ổ THẬT của cảm biến (goc = các điểm pixel sân do Field.oTia tính
     từ VeVector.diemO / diemMat), không từ tâm xe. d = mục docCamBien của san-ve.js, u = tiến độ 0..1, a = độ đậm. */
  function oTint(g, x, y, rgb, al) { boO(g, x, y, 0.6, 2.2); g.fillStyle = rgba(rgb, al); g.fill(); }
  function dauX(g, x, y, r, mau, day) {
    g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x + r, y + r); g.moveTo(x + r, y - r); g.lineTo(x - r, y + r);
    g.lineCap = 'round'; g.lineWidth = day + 1.1; g.strokeStyle = BM.vecVo; g.stroke(); g.lineWidth = day; g.strokeStyle = mau; g.stroke();
  }
  /** Chấm sáng ở đầu tia (thấu kính đang phát). */
  function chamGoc(g, p, rgb, a) {
    tron(g, p.x, p.y, 1.6); g.fillStyle = rgba(rgb, 0.35 * a); g.fill();
    tron(g, p.x, p.y, 0.75); g.fillStyle = rgba(rgb, a); g.fill();
  }
  /** Nét đứt chạy từ mỗi gốc tới (x1, y1) (dm: phần đã chạy ra 0..1), lót nét trắng mờ cho nổi trên sàn trắng. */
  function netTia(g, goc, x1, y1, dm, rgb, a, day, dash, now, toc) {
    for (var i = 0; i < goc.length; i++) {
      var p = goc[i], xe = p.x + (x1 - p.x) * dm, ye = p.y + (y1 - p.y) * dm;
      g.setLineDash([]); g.lineCap = 'round';
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(xe, ye); g.lineWidth = day + 1; g.strokeStyle = rgba(BM.vecVienRgb, 0.12 * a); g.stroke();
      g.setLineDash(dash); g.lineDashOffset = -((now / (toc || 40)) % (dash[0] + dash[1]));
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(xe, ye); g.lineWidth = day; g.strokeStyle = rgba(rgb, a); g.stroke();
      g.setLineDash([]);
      chamGoc(g, p, rgb, a);
    }
  }
  /** Cảm biến KHOẢNG CÁCH (front_clear / left_clear / right_clear): ô được đo ám nhẹ, tia nét đứt từ thấu kính, ô trống: khung bo nhỏ; bị chặn: dấu X sát mép ô. */
  function tiaKc(g, d, now, u, a, goc, DX, DY) {
    var rgb = d.trong ? BM.tiaXanhLaRgb : BM.tiaDoV3Rgb, vx = DX[d.huong], vy = DY[d.huong];
    var cx = d.o.x * T + 7, cy = d.o.y * T + 7, x1 = d.trong ? cx : cx - vx * 6, y1 = d.trong ? cy : cy - vy * 6;
    g.save();
    oTint(g, d.o.x, d.o.y, rgb, 0.26 * a);
    netTia(g, goc, x1, y1, 1, rgb, 0.95 * a, 1.2, [3, 1.4], now, 40);
    if (d.trong) { H.bo(g, cx - 3, cy - 3, 6, 6, 1.6); g.lineWidth = 1.1; g.strokeStyle = rgba(rgb, a); g.stroke(); }
    else dauX(g, x1, y1, 2.3, rgba(rgb, a), 1.1);
    g.restore();
  }
  /** Bốn góc ngắm bo tròn ôm tâm (cx, cy), nửa cạnh m (camera ở xe: ôm vật; camera nhìn xuống của drone). */
  function gocNgam(g, cx, cy, m, col) {
    var L = [[-1, -1], [1, -1], [-1, 1], [1, 1]], k = 2.6, i;
    g.beginPath();
    for (i = 0; i < 4; i++) { var px = cx + L[i][0] * m, py = cy + L[i][1] * m; g.moveTo(px - L[i][0] * k, py); g.lineTo(px, py); g.lineTo(px, py - L[i][1] * k); }
    g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 2.1; g.strokeStyle = BM.vecVien; g.stroke(); g.lineWidth = 1.1; g.strokeStyle = col; g.stroke();
  }
  /** CAMERA ở xe (color() đọc ô trước mặt), hai lớp như nhánh pixel: 'duoi' (dưới robot) chùm sáng từ HAI MẮT (mat = hai điểm) chụm vào ô + hai nét mảnh;
   *  'tren' (trên robot) ô được nhìn: nguon 'san' tô cả ô bo góc, 'vat' bốn góc ôm vật, 'chan' khung xám nét đứt + X. */
  function tiaCamera(g, d, now, u, a, pha, mat, col, DX, DY) {
    var vx = DX[d.huong], vy = DY[d.huong], cx = d.o.x * T + 7, cy = d.o.y * T + 7, chan = d.nguon === 'chan', vat = d.nguon === 'vat';
    var nhay = u < 0.55 && !giam() ? 0.8 + 0.2 * Math.sin(now / 40) : 1;
    g.save();
    if (pha === 'duoi') {
      var e1 = mat[0], e2 = mat[mat.length - 1], x1 = cx - vx * (vat ? 5 : 2), y1 = cy - vy * (vat ? 5 : 2);
      g.beginPath(); g.moveTo(e1.x, e1.y); g.lineTo(e2.x, e2.y); g.lineTo(cx, cy); g.closePath();
      g.globalAlpha = 0.28 * a; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
      mat.forEach(function (p) {
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(x1, y1); g.lineCap = 'round';
        g.lineWidth = 1.5; g.strokeStyle = rgba(BM.vecVienRgb, 0.35 * a); g.stroke(); g.lineWidth = 0.7; g.globalAlpha = 0.9 * a; g.strokeStyle = col; g.stroke(); g.globalAlpha = 1;
      });
      g.restore(); return;
    }
    g.globalAlpha = a * nhay;
    if (vat) { gocNgam(g, cx, cy, 5.5, col); boO(g, d.o.x, d.o.y, 1, 2.4); g.globalAlpha = 0.14 * a * nhay; g.fillStyle = col; g.fill(); }
    else {
      boO(g, d.o.x, d.o.y, 0.6, 2.4); g.globalAlpha = (chan ? 0.24 : 0.36) * a * nhay; g.fillStyle = col; g.fill();
      g.globalAlpha = a * nhay; boO(g, d.o.x, d.o.y, 1.4, 2); g.lineWidth = 2; g.strokeStyle = BM.vecVien; g.stroke();
      if (chan) g.setLineDash([2.5, 1.6]); g.lineWidth = 1.1; g.strokeStyle = col; g.stroke(); g.setLineDash([]);
    }
    if (chan) { g.globalAlpha = a; dauX(g, cx, cy, 3, col, 1.2); }
    g.restore();
  }
  /** CAMERA NHÌN XUỐNG của drone (look()): 'duoi' ô dưới drone ám màu + vạch quét sáng (gradient) chạy từ trên xuống; 'tren' bốn góc ngắm (vật: nhỏ hơn), chặn: X. */
  function tiaNhin(g, d, now, u, a, pha, col) {
    var cx = d.o.x * T + 7, cy = d.o.y * T + 7, ox = d.o.x * T, oy = d.o.y * T, chan = d.nguon === 'chan', vat = d.nguon === 'vat';
    var nhay = u < 0.55 && !giam() ? 0.8 + 0.2 * Math.sin(now / 40) : 1;
    g.save();
    if (pha === 'duoi') {
      boO(g, d.o.x, d.o.y, 0.6, 2.4); g.globalAlpha = (chan ? 0.22 : vat ? 0.18 : 0.36) * a * nhay; g.fillStyle = col; g.fill();
      if (u < 0.6) {
        var yy = oy + 1.5 + (T - 3) * (u / 0.6), gr = g.createLinearGradient(0, yy - 2.2, 0, yy + 0.6);
        gr.addColorStop(0, rgba(BM.tiaTrangRgb, 0)); gr.addColorStop(1, rgba(BM.tiaTrangRgb, 0.9));
        g.globalAlpha = a; H.bo(g, ox + 1.2, yy - 2.2, T - 2.4, 2.8, 1); g.fillStyle = gr; g.fill();
        H.bo(g, ox + 1.2, yy - 0.3, T - 2.4, 0.7, 0.35); g.fillStyle = rgba(BM.tiaTrangRgb, 0.95); g.fill();
      }
      g.restore(); return;
    }
    g.globalAlpha = a * nhay;
    gocNgam(g, cx, cy, vat ? 4.5 : 6, col);
    if (chan) dauX(g, cx, cy, 3, col, 1.2);
    g.restore();
  }
  /** Cảm biến TỪ front_metal(): tia bạc (sắt) / nâu (gỗ) / màu cực (vật nam châm) từ thấu kính cảm biến; không thấy gì: tia mờ hết tầm + gạch cụt. Dấu ở vật như nhánh pixel. */
  function tiaTu(g, d, u, a, goc, now, DX, DY) {
    var vx = DX[d.huong], vy = DY[d.huong], sat = d.chat === 'sat', go = d.chat === 'go', nch = d.chat === 'nam-cham';
    var rgb = sat ? BM.tiaTrangV1Rgb : go ? BM.tiaCamRgb : nch ? (d.cuc === 'N' ? BM.tiaDoRgb : BM.tiaLamRgb) : BM.tiaLamV1Rgb, x1, y1, p0 = goc[0];
    if (d.o) { x1 = d.o.x * T + 7; y1 = d.o.y * T + 7; }
    else { var dai = d.dai || 0; x1 = d.tu.x * T + 7 + vx * (7 + dai); y1 = d.tu.y * T + 7 + vy * (7 + dai); }
    g.save();
    if (d.o) oTint(g, d.o.x, d.o.y, sat ? BM.tiaLamV1Rgb : rgb, (sat ? 0.3 : 0.24) * a);
    var dm = Math.min(1, u / 0.35);
    netTia(g, goc, x1, y1, dm, sat ? BM.tiaLamV1Rgb : rgb, (d.o ? 0.95 : 0.55) * a, sat ? 1.5 : 1.15, sat ? [4, 1.2] : [3, 2], now, 40);
    if (d.o && dm >= 1) {
      if (sat) {                                                                     // lóe bốn cánh trên vật sắt
        var s = 2.5 + Math.abs(Math.sin(u * 9)) * 1.6;
        g.beginPath(); g.moveTo(x1 - s - 1.5, y1); g.lineTo(x1 + s + 1.5, y1); g.moveTo(x1, y1 - s - 1.5); g.lineTo(x1, y1 + s + 1.5);
        g.lineCap = 'round'; g.lineWidth = 1.2; g.strokeStyle = rgba(BM.tiaLamV1Rgb, a); g.stroke(); tron(g, x1, y1, 1.1); g.fillStyle = rgba(BM.tiaTrangRgb, a); g.fill();
      } else if (nch) { tron(g, x1, y1, 5 + Math.abs(Math.sin(u * 9))); g.lineWidth = 1.2; g.strokeStyle = rgba(rgb, a); g.stroke(); }
      else dauX(g, x1, y1, 2.6, rgba(BM.tiaNauRgb, a), 1.3);
    } else if (!d.o && dm >= 1) {
      g.beginPath(); g.moveTo(x1 - vy * 2.8, y1 + vx * 2.8); g.lineTo(x1 + vy * 2.8, y1 - vx * 2.8); g.lineCap = 'round'; g.lineWidth = 1.2; g.strokeStyle = rgba(rgb, 0.7 * a); g.stroke();
    }
    g.restore();
    return p0;
  }
  /** Gợn nhiệt: ba (hay hai) nét cong bay lên trên (x, y), pha theo thời gian; giảm chuyển động: đứng yên. */
  function gonNhiet(g, x, y, n, buoc, cao, now, rgb, al, day) {
    for (var k = 0; k < n; k++) {
      var t = giam() ? 0.4 : ((now / 25 + k * 5) % cao) / cao, gx = x + (k - (n - 1) / 2) * buoc, gy = y - t * cao, sw = giam() ? 0 : Math.sin(now / 150 + k) * 1.2;
      g.beginPath(); g.moveTo(gx - 1.2, gy + 2.2); g.bezierCurveTo(gx + 1.4 + sw, gy + 1, gx - 1.4 + sw, gy - 0.8, gx + 1.1, gy - 2.2);
      g.lineCap = 'round'; g.lineWidth = day; g.strokeStyle = rgba(rgb, al * (1 - t * 0.7)); g.stroke();
    }
  }
  /** HỒNG NGOẠI (distance() / warm()): tia đỏ mảnh từ thấu kính ở mũi tới mép ô vật cản, vạch nhỏ ở mỗi ô trống (đếm được), ô vật cản ám đỏ;
   *  warm(): nóng → lõi cam sáng + gợn nhiệt; lạnh → chấm xanh lơ; distance() → chấm đỏ ở điểm chạm. trong: ô vật cản nằm trong cửa sổ vẽ. */
  function tiaHongNgoai(g, d, now, u, a, goc, trong, DX, DY) {
    var vx = DX[d.huong], vy = DY[d.huong], nong = d.ham === 'warm' && !!d.nong, lanh = d.ham === 'warm' && !d.nong, rgb = nong ? BM.tiaCamV1Rgb : BM.tiaDoV4Rgb;
    var cx = d.o.x * T + 7, cy = d.o.y * T + 7, x1 = cx - vx * 7, y1 = cy - vy * 7, p0 = goc[0];
    g.save();
    if (trong) oTint(g, d.o.x, d.o.y, rgb, (nong ? 0.4 : 0.2) * a);
    var dm = Math.min(1, u / 0.3), xe = p0.x + (x1 - p0.x) * dm, ye = p0.y + (y1 - p0.y) * dm;
    netTia(g, goc, x1, y1, dm, rgb, 0.95 * a, 0.85, [2, 1.6], now, 30);
    for (var i = 1; i <= (d.khoang || 0); i++) {
      var px = (d.tu.x + vx * i) * T + 7, py = (d.tu.y + vy * i) * T + 7;
      if ((Math.abs(px - p0.x) + Math.abs(py - p0.y)) > (Math.abs(xe - p0.x) + Math.abs(ye - p0.y))) break;
      g.beginPath(); g.moveTo(px - vy * 2.6, py + vx * 2.6); g.lineTo(px + vy * 2.6, py - vx * 2.6); g.lineCap = 'round'; g.lineWidth = 1.2; g.strokeStyle = rgba(rgb, 0.8 * a); g.stroke();
    }
    if (dm >= 1 && trong) {
      if (nong) {
        var gr = g.createRadialGradient(cx, cy, 0, cx, cy, 4.5); gr.addColorStop(0, rgba(BM.tiaVangRgb, a)); gr.addColorStop(1, rgba(BM.tiaCamV1Rgb, 0));
        tron(g, cx, cy, 4.5); g.fillStyle = gr; g.fill();
        gonNhiet(g, cx, cy - 4, 3, 4, 8, now, BM.tiaCamV2Rgb, 0.9 * a, 0.9);
      } else { tron(g, x1, y1, 1.5); g.fillStyle = rgba(lanh ? BM.tiaXanhLoV2Rgb : BM.tiaDoV5Rgb, a); g.fill(); g.lineWidth = 0.4; g.strokeStyle = rgba(BM.vecVienRgb, 0.5 * a); g.stroke(); }
    }
    g.restore();
  }
  /** NÚT BẮN ĐANG BẬT thì NÓNG (luật warm()): quầng cam thở bo góc quanh tấm nút + hai gợn nhiệt bay lên. Giảm chuyển động: quầng đứng yên. */
  function nong(g, x, y, now) {
    var px = x * T, py = y * T, th = giam() ? 0.6 : 0.55 + 0.45 * Math.sin(now / 260);
    g.save();
    var gr = g.createRadialGradient(px + 7, py + 7, 3, px + 7, py + 7, 9.5);
    gr.addColorStop(0, rgba(BM.tiaCamV3Rgb, 0)); gr.addColorStop(1, rgba(BM.tiaCamV3Rgb, 0.12 + 0.18 * th));
    boO(g, x, y, 0.5, 2.6); g.fillStyle = gr; g.fill();
    boO(g, x, y, 1.4, 2.2); g.lineWidth = 0.9; g.strokeStyle = rgba(BM.tiaCamV3Rgb, 0.35 + 0.4 * th); g.stroke();
    gonNhiet(g, px + 7, py + 4.5, 2, 5, 6, now, BM.tiaCamV4Rgb, 0.5 + 0.3 * th, 0.8);
    g.restore();
  }

  /* ================================================================ VẬT / ĐẠN / NÉM / SƠN / DRONE (bước 4) */
  /** Bóng đổ của vật cạnh h (hộp vẽ góc (x0, y0)), lệch so về phải-dưới: khối bo góc mềm hai lớp; cao (so lớn) thì nhạt và nhỏ lại. */
  function bongVat(g, x0, y0, h, so, cao) {
    var k = cao ? 0.7 : 0.78, w = h * k, hh = h * (k - 0.04), x = x0 + so * 0.5 + (h - w) / 2, y = y0 + so + (h - hh) / 2 + h * 0.04;
    H.bo(g, x - 0.4, y - 0.3, w + 0.8, hh + 0.6, Math.min(w, hh) * 0.28); g.fillStyle = rgba(BM.vecVienRgb, cao ? 0.07 : 0.1); g.fill();
    H.bo(g, x + 0.3, y + 0.3, w - 0.6, hh - 0.6, Math.min(w, hh) * 0.22); g.fillStyle = rgba(BM.vecVienRgb, cao ? 0.1 : 0.17); g.fill();
  }
  /** Lớp đỏ phủ lên vật (thả bị chặn), bo góc theo thân vật vector (76% hộp). */
  function toDo(g, x0, y0, h, dd) { H.bo(g, x0 + h * 0.12, y0 + h * 0.12, h * 0.76, h * 0.76, h * 0.12); g.fillStyle = rgba(BM.vecDoRgb, dd); g.fill(); }
  /** Bóng elip mềm dưới vật đang bay / nằm (cx, cy) bán trục rx, ry, độ đậm al. */
  function bongElip(g, cx, cy, rx, ry, al) {
    g.save(); g.translate(cx, cy); g.scale(1, ry / Math.max(0.01, rx));
    var gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, rgba(BM.vecVienRgb, al)); gr.addColorStop(0.6, rgba(BM.vecVienRgb, al * 0.7)); gr.addColorStop(1, rgba(BM.vecVienRgb, 0));
    tron(g, 0, 0, rx); g.fillStyle = gr; g.fill(); g.restore();
  }
  /** Vòng sáng quanh vật đang bị nam châm hút (cyan, thở). */
  function vongHut(g, px, py, al) { H.bo(g, px - 6, py - 7, 11, 11, 3); g.lineWidth = 0.9; g.strokeStyle = rgba(BM.tiaXanhLoV3Rgb, al); g.stroke(); }
  /** Viền đỏ quanh vật trong rổ (load() khi rổ đầy). */
  function vienLoi(g, x, y, sz) { H.bo(g, x - 0.6, y - 0.6, sz + 1.2, sz + 1.2, Math.max(1, sz * 0.25)); g.lineWidth = 0.9; g.strokeStyle = BM.vecDo; g.stroke(); }
  /** MÁY NÉM — vạch ngắm: nét đứt từ đầu cần tới ô rơi, chấm tròn ở từng ô đi qua, bốn góc bo ở ô rơi, thẻ số tầm bo góc. (cx, cy) tâm xe, (dx, dy) hướng mũi. */
  function ngam(g, cx, cy, dx, dy, n, now, nho, coVat) {
    var tx = cx + dx * n * T, ty = cy + dy * n * T, al = 0.5 + (giam() ? 0 : 0.12 * Math.sin(now / 260)), i;
    g.save();
    g.lineCap = 'round'; g.setLineDash([2, 2]); g.lineDashOffset = -((now / 120) % 4);
    g.beginPath(); g.moveTo(cx + dx * 9, cy + dy * 9); g.lineTo(tx - dx * 5, ty - dy * 5); g.lineWidth = 0.9; g.strokeStyle = rgba(BM.tiaXanhLoRgb, al * 0.9); g.stroke(); g.setLineDash([]);
    for (i = 1; i < n; i++) { tron(g, cx + dx * i * T, cy + dy * i * T, 1.1); g.fillStyle = rgba(BM.tiaXanhLoRgb, al); g.fill(); g.lineWidth = 0.3; g.strokeStyle = rgba(BM.vecVienRgb, 0.4); g.stroke(); }
    var col = nho ? BM.tiaKemRgb : BM.tiaXanhLoRgb, a2 = Math.min(1, al + nho) * (coVat ? 1 : 0.6), x0 = tx - 7, y0 = ty - 7, k = 4 + (nho ? 1 : 0);
    g.beginPath();
    g.moveTo(x0 + 0.8, y0 + k); g.arcTo(x0 + 0.8, y0 + 0.8, x0 + k, y0 + 0.8, 1.6); g.lineTo(x0 + k, y0 + 0.8);
    g.moveTo(x0 + 13.2 - k, y0 + 0.8); g.arcTo(x0 + 13.2, y0 + 0.8, x0 + 13.2, y0 + k, 1.6); g.lineTo(x0 + 13.2, y0 + k);
    g.moveTo(x0 + 13.2, y0 + 13.2 - k); g.arcTo(x0 + 13.2, y0 + 13.2, x0 + 13.2 - k, y0 + 13.2, 1.6); g.lineTo(x0 + 13.2 - k, y0 + 13.2);
    g.moveTo(x0 + k, y0 + 13.2); g.arcTo(x0 + 0.8, y0 + 13.2, x0 + 0.8, y0 + 13.2 - k, 1.6); g.lineTo(x0 + 0.8, y0 + 13.2 - k);
    g.lineWidth = 2.2; g.strokeStyle = rgba(BM.vecVienRgb, 0.25 * a2); g.stroke(); g.lineWidth = 1.2; g.strokeStyle = rgba(col, a2); g.stroke();
    H.bo(g, x0 + 1.2, y0 + 1.2, 6, 7.6, 2); g.fillStyle = rgba(BM.tiaXanhLoV4Rgb, 0.85 * Math.min(1, a2 + 0.2)); g.fill();
    g.font = PHONG_SO; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba(nho ? BM.tiaKemRgb : BM.tiaXanhLoV5Rgb, Math.min(1, a2 + 0.3));
    g.fillText(String(n), x0 + 4.2, y0 + 5.4);
    g.restore();
  }
  /** Máy ném — vệt vòng cung mờ phía sau vật đang bay (vài chấm nhỏ dần theo đường đã bay). pts = [{ x, y }] cũ → mới. */
  function vetCung(g, pts) {
    for (var i = 0; i < pts.length; i++) { var t = (i + 1) / (pts.length + 1); tron(g, pts[i].x, pts[i].y, 0.35 + 0.6 * t); g.fillStyle = rgba(BM.tiaXanhLoRgb, 0.15 + 0.35 * t); g.fill(); }
  }
  /** Ô sạc vừa lóe (drone sạc pin): tấm xanh lơ bo góc thở + viền trắng. */
  function sacLoe(g, x, y, a) { boO(g, x, y, 0.6, 2.4); g.fillStyle = rgba(BM.tiaNgocRgb, a); g.fill(); g.lineWidth = 0.8; g.strokeStyle = rgba(BM.tiaTrangRgb, Math.min(1, a * 1.4)); g.stroke(); }
  /** Ô sạc THỞ (gói V4, ô động): quầng cyan mềm nở / co quanh đế sạc theo đồng hồ; giảm chuyển động: đứng yên. */
  function thoSac(g, x, y, now) {
    var th = giam() ? 0.5 : 0.5 + 0.5 * Math.sin(now / 420), cx = x * T + 7, cy = y * T + 7, gr = g.createRadialGradient(cx, cy, 2, cx, cy, 6.5 + th);
    gr.addColorStop(0, rgba(BM.tiaNgocRgb, 0)); gr.addColorStop(0.7, rgba(BM.tiaNgocRgb, 0.1 + 0.16 * th)); gr.addColorStop(1, rgba(BM.tiaNgocRgb, 0));
    tron(g, cx, cy, 6.5 + th); g.fillStyle = gr; g.fill();
  }
  /** Bóng drone ở mặt ô: elip mềm, rộng w (pixel sân), đậm al. */
  function bongDrone(g, cx, cy, w, al) { bongElip(g, cx, cy, w / 2, Math.max(1.4, w * 0.2), al); }
  /** Thanh pin nổi trên drone: viên thuốc viền mực, ruột màu theo mức (xanh → vàng → đỏ), vạch ngăn mỗi đơn vị, số pin bên phải.
   *  o = { x, y, W, tong, fill (0..W), mau, nen, vach (số vạch hay 0), so, mauSo }. */
  function thanhPin(g, o) {
    g.save();
    H.bo(g, o.x - 1, o.y - 1.2, o.tong + 2, 5.4, 2.7); g.fillStyle = BM.vecVo; g.fill(); g.lineWidth = 0.6; g.strokeStyle = BM.vecVien; g.stroke();
    H.bo(g, o.x, o.y - 0.2, o.W, 3.4, 1.7); g.fillStyle = o.nen; g.fill();
    if (o.fill > 0) { H.bo(g, o.x, o.y - 0.2, Math.max(1.8, o.fill), 3.4, 1.7); g.fillStyle = o.mau; g.fill(); H.bo(g, o.x + 0.6, o.y + 0.2, Math.max(0.6, o.fill - 1.2), 0.9, 0.45); g.fillStyle = rgba(BM.tiaTrangRgb, 0.55); g.fill(); }
    if (o.vach) { g.beginPath(); for (var i = 1; i < o.vach; i++) { var vx = o.x + o.W * i / o.vach; g.moveTo(vx, o.y + 0.2); g.lineTo(vx, o.y + 2.8); } g.lineWidth = 0.35; g.strokeStyle = rgba(BM.vecVienRgb, 0.45); g.stroke(); }
    H.bo(g, o.x + o.W + 0.4, o.y + 0.6, 0.9, 1.8, 0.4); g.fillStyle = BM.vecVien; g.fill();                 // núm pin
    g.font = PHONG_SO; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = o.mauSo; g.fillText(o.so, o.x + o.W + 2, o.y + 1.7);
    g.restore();
  }
  /** Thẻ số đạn (súng hơi) ở góc trên trái cửa sổ vẽ: viên thuốc trắng, quả bóng vàng nhỏ, "×n"; hết đạn / nháy: nền đỏ nhạt, chữ đỏ. */
  function theDan(g, x, y, w, hh, txt, het, nhay) {
    g.save();
    H.bo(g, x - 0.5, y - 0.5, w + 1, hh + 1, (hh + 1) / 2); g.fillStyle = het || nhay ? rgba(BM.vecDoRgb, 0.18) : BM.vecVo; g.fill(); g.lineWidth = 0.7; g.strokeStyle = het || nhay ? BM.vecDo : BM.vecVien; g.stroke();
    tron(g, x + 3.6, y + hh / 2, 1.8); g.fillStyle = het ? BM.vecBacToi : BM.vecVang; g.fill(); g.lineWidth = 0.4; g.strokeStyle = het ? BM.vecBacToi : BM.vecVangToi; g.stroke();
    tron(g, x + 3.1, y + hh / 2 - 0.5, 0.5); g.fillStyle = BM.vecVo; g.fill();
    g.font = PHONG_SO; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = het ? BM.vecDo : BM.vecVien; g.fillText(txt, x + 7, y + hh / 2 + 0.5);
    g.restore();
  }
  /** MÁY SƠN — ô cần tô (hình mờ): chấm màu mờ bo góc giữa ô + viền nét đứt bo góc chạy chậm. */
  function sonCan(g, x, y, mau, now) {
    g.save();
    boO(g, x, y, 4.6, 1.6); g.globalAlpha = 0.5; g.fillStyle = mau; g.fill(); g.globalAlpha = 1;
    g.setLineDash([2, 1.6]); g.lineDashOffset = -((now / 160) % 3.6); boO(g, x, y, 1.5, 2.2); g.lineWidth = 0.9; g.strokeStyle = mau; g.stroke();
    g.restore();
  }
  /** Ô đã tô: tấm sơn bo góc, gradient bóng nhẹ, viền mực mờ; kk (0..1): vừa tô thì lóe trắng; sai: viền màu cần tô (hay đỏ nếu ngoài hình) + gạch chéo màu cần tô. */
  function sonDa(g, x, y, mau, kk, vienSai, gachSai) {
    var px = x * T, py = y * T;
    boO(g, x, y, 1, 2.2); g.fillStyle = mau; g.fill();
    boO(g, x, y, 1, 2.2); g.fillStyle = H.gradDoc(g, 0, py + 1, 0, py + T - 1, [[0, rgba(BM.tiaTrangRgb, 0.35)], [0.5, rgba(BM.tiaTrangRgb, 0)], [1, rgba(BM.vecVienRgb, 0.12)]]); g.fill();
    g.lineWidth = 0.6; g.strokeStyle = rgba(BM.vecVienRgb, 0.45); g.stroke();
    if (kk >= 0 && kk < 1) { boO(g, x, y, 1, 2.2); g.fillStyle = rgba(BM.tiaTrangRgb, 0.7 * (1 - kk)); g.fill(); }
    if (vienSai) { boO(g, x, y, 0.5, 2.4); g.lineWidth = 0.9; g.strokeStyle = vienSai; g.stroke(); }
    if (gachSai) { g.beginPath(); g.moveTo(px + 3.5, py + 3.5); g.lineTo(px + T - 3.5, py + T - 3.5); g.lineCap = 'round'; g.lineWidth = 1.1; g.strokeStyle = gachSai; g.stroke(); }
  }
  /** Ô ◆ của bóng mờ (phải đi qua): kim cương bo nhẹ, viền mực; sang (đã qua): vàng có đốm sáng + vòng toả k (0..1). */
  function kimCuong(g, cx, cy, mau, sang, k) {
    function kc(r) { g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx + r, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r, cy); g.closePath(); }
    if (sang && k >= 0 && k < 1) { kc(4.5 + k * 3); g.lineWidth = 0.8; g.strokeStyle = rgba(BM.tiaVangV1Rgb, 0.9 * (1 - k)); g.lineJoin = 'round'; g.stroke(); }
    kc(4.3); g.fillStyle = mau; g.fill(); g.lineWidth = 0.9; g.strokeStyle = BM.vecVien; g.lineJoin = 'round'; g.stroke();
    if (sang) { g.beginPath(); g.moveTo(cx - 1.8, cy - 0.4); g.lineTo(cx - 0.4, cy - 1.8); g.lineCap = 'round'; g.lineWidth = 0.8; g.strokeStyle = BM.vecVo; g.stroke(); }
  }
  /** Khung bo góc quanh một ô (m: lùi vào, day, mau, dash: mảng nét đứt hay null). */
  function khungO(g, x, y, m, r, day, mau, dash, off) {
    g.save(); if (dash) { g.setLineDash(dash); g.lineDashOffset = off || 0; }
    boO(g, x, y, m, r); g.lineWidth = day; g.strokeStyle = mau; g.stroke(); g.restore();
  }
  /** Tấm bo góc phủ một ô (m lùi vào), màu mau (chuỗi màu đầy đủ). */
  function tamO(g, x, y, m, r, mau) { boO(g, x, y, m, r); g.fillStyle = mau; g.fill(); }
  /** Chấm tròn nhỏ (dấu … ở cạnh sân bị cắt). */
  function cham(g, x, y, r, mau) { tron(g, x, y, r); g.fillStyle = mau; g.fill(); }
  /** Vạch bo tròn (x, y, w, h) màu mau (vạch màu robot chủ dưới chân cờ riêng). */
  function vach(g, x, y, w, h, mau) { H.bo(g, x, y, w, h, h / 2); g.fillStyle = mau; g.fill(); }

  /** Gói V7a: DÂY NỐI nút ↔ cửa trên sàn: đường gấp khúc p = [[x, y] …] (pixel sân, đã cắt ở mép ô nút / cửa), góc bo nhẹ, chấm ổ cắm hai đầu.
   *  Tắt: nét mảnh mờ trung tính (le: sân chỉ một dây, còn mờ hơn). Bật (nút đang bật): xanh lá như mặt nút bật, quầng mềm, vệt sáng chạy từ nút tới cửa (giảm chuyển động: đứng yên). */
  function dayNoi(g, p, sang, le, now) {
    function net() { g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length - 1; i++) g.arcTo(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], 2); g.lineTo(p[p.length - 1][0], p[p.length - 1][1]); }
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    if (sang) {
      net(); g.lineWidth = 2.6; g.strokeStyle = rgba(BM.vecDayNoiSangRgb, 0.22); g.stroke();
      net(); g.lineWidth = 1; g.strokeStyle = rgba(BM.vecDayNoiSangRgb, 0.85); g.stroke();
      if (!giam()) { g.setLineDash([1.6, 5]); g.lineDashOffset = -((now / 40) % 6.6); net(); g.lineWidth = 1; g.strokeStyle = rgba(BM.tiaTrangRgb, 0.8); g.stroke(); g.setLineDash([]); }
    } else { net(); g.lineWidth = le ? 0.6 : 0.8; g.strokeStyle = rgba(BM.vecDayNoiRgb, le ? 0.22 : 0.34); g.stroke(); }
    [p[0], p[p.length - 1]].forEach(function (q) { tron(g, q[0], q[1], sang ? 1.1 : 0.8); g.fillStyle = sang ? rgba(BM.vecDayNoiSangRgb, 0.95) : rgba(BM.vecDayNoiRgb, le ? 0.3 : 0.45); g.fill(); });
    g.restore();
  }

  V.HU = { giam: giam, rgba: rgba, hat: hat, chop: chop, dau: dau, choang: choang, bongMau: bongMau, oDo: oDo, vachMep: vachMep,
    tiaKc: tiaKc, tiaCamera: tiaCamera, tiaNhin: tiaNhin, tiaTu: tiaTu, tiaHongNgoai: tiaHongNgoai, nong: nong,
    bongVat: bongVat, toDo: toDo, bongElip: bongElip, vongHut: vongHut, vienLoi: vienLoi, ngam: ngam, vetCung: vetCung, sacLoe: sacLoe, thoSac: thoSac, bongDrone: bongDrone, thanhPin: thanhPin, theDan: theDan,
    sonCan: sonCan, sonDa: sonDa, kimCuong: kimCuong, khungO: khungO, tamO: tamO, cham: cham, vach: vach, dayNoi: dayNoi,
    PHONG_CHU: PHONG_CHU, PHONG_SO: PHONG_SO };                                    // V7c3: san-ve.js đo bề ngang chữ bằng đúng phông vẽ chữ
  if (typeof module === 'object' && module.exports) module.exports = V.HU;
})(typeof window !== 'undefined' ? window : globalThis);
