var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-may.js — Ô MÁY vector có TRẠNG THÁI (gói V2): băng chuyền ^ > v <, van hơi N (trước là nút bắn), nút đè M, cửa C / c (cả cửa nhịp), bàn xoay @ %, cổng dịch chuyển 1 / 2.
   Hệ 100 × 100 một ô; trạng thái là tham số s (bộ đệm VeVector theo JSON của s), nên hoạt cảnh cũ (băng chạy, cửa trượt, đèn nhịp, bàn xoay) vẽ lại
   theo hệ 100 qua dangKy: san-ve.js chỉ tính trạng thái (pha theo đồng hồ, độ mở cửa lượng tử hoá) rồi lấy canvas đệm đúng cỡ.
   Còn giữ lệnh trực tiếp trong san-ve.js (theo pixel sân, phép phóng sv của chế độ vector làm nét): quầng nóng + làn hơi của van hơi mở (veNong), lóe trắng băng
   vừa tắt, khung đỏ / tô đỏ của cửa kẹt, độ rung của cửa. Mỗi hình khai cacTrangThai (mẫu cho máy kiểm và trang xem); phu: true = vẽ đè lên sàn. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  if (typeof module === 'object' && !(root.VeVector && root.VeVector.lay('o', 'tuong'))) require('./ve-vector-o.js');
  function nenLuoi(g) { g.fillStyle = BM.vecSanToi; g.fillRect(0, 0, 100, 100); }
  function xoayQuanh(g, goc) { g.translate(50, 50); g.rotate(goc); g.translate(-50, -50); }
  /** Thêm đoạn (x1, y1) → (x2, y2) vào path, cắt theo dải y ∈ [a, b] (băng chuyền: mũi tên trôi ra mép ô thì cụt dần, mọi điểm vẫn nằm trong ô). */
  function doanCat(g, x1, y1, x2, y2, a, b) {
    if (y1 > y2) { var t = x1; x1 = x2; x2 = t; t = y1; y1 = y2; y2 = t; }
    if (y2 < a || y1 > b) return;
    var ya = Math.max(y1, a), yb = Math.min(y2, b);
    if (y2 > y1 && yb - ya < 4) return;                                              // mẩu cụt quá ngắn: bỏ (không thành chấm tròn ở mép ô)
    var tai = function (y) { return y2 === y1 ? x1 : x1 + (x2 - x1) * (y - y1) / (y2 - y1); };
    g.moveTo(tai(ya), ya); g.lineTo(tai(yb), yb);
  }

  /* BĂNG CHUYỀN: vẽ đẩy LÊN (huong 0) rồi xoay theo s.huong (0 lên, 1 phải, 2 xuống, 3 trái, như SanHoc.BANG). Hai ray bạc hai bên, mặt băng tối
     chạy suốt ô (nối liền ô kề), nan băng và mũi tên cyan trôi theo s.pha (0..4: năm khung như bộ pixel, mũi tên cách 50, nan cách 25 → vòng lặp liền).
     s.tat: băng đã tắt (bóng trúng nút): mũi tên xám đứng yên, đèn đỏ trên ray trái. */
  var TT_BANG = [];
  [0, 1, 2, 3].forEach(function (h) { [0, 1, 2, 3, 4].forEach(function (p) { TT_BANG.push({ huong: h, pha: p }); }); TT_BANG.push({ huong: h, pha: 0, tat: true }); });
  V.dangKy({ loai: 'o', ma: 'bang', ten: 'Băng chuyền', ky: ['^', '>', 'v', '<'], cacTrangThai: TT_BANG, ve: function (g, s, H) {
    var p = s.tat ? 0 : ((+s.pha || 0) % 5 + 5) % 5, j, y;                                       // pha có thể lẻ (gói V4: san-ve.js cho băng chạy liên tục theo đồng hồ)
    g.save(); xoayQuanh(g, (((s.huong | 0) % 4 + 4) % 4) * Math.PI / 2);
    nenLuoi(g);
    g.fillStyle = BM.vecDe; g.fillRect(18, 0, 64, 100);                                            // mặt băng: tô không viền, chạm mép ô (nối liền ô kề)
    g.beginPath(); for (j = 0; j < 4; j++) { y = ((j * 25 - p * 10) % 100 + 100) % 100; if (y < 3 || y > 95) continue; g.moveTo(21, y); g.lineTo(79, y); }
    H.vien(g, BM.vecDeSang, 3, 'butt');
    g.beginPath(); for (j = -1; j < 3; j++) { y = 12 + j * 50 - p * 10; doanCat(g, 31, y + 16, 50, y, 8, 92); doanCat(g, 50, y, 69, y + 16, 8, 92); }
    H.vien(g, s.tat ? BM.vecBacToi : BM.vecDen, 7);
    g.lineWidth = 2.5;                                                                              // (máy kiểm đo nửa nét theo lineWidth lúc dựng path: đặt trước nét của ray)
    [3, 82].forEach(function (x) {
      H.bo(g, x, 2, 15, 96, 5); g.fillStyle = H.gradDoc(g, x, 0, x + 15, 0, [[0, BM.vecDinh], [1, BM.vecSatToi]]); g.fill(); H.vien(g, BM.vecVien, 2.5);
      H.duong(g, 'M' + (x + 7.5) + ' 30 V70'); H.vien(g, s.tat ? BM.vecSatVien : BM.vecDenSang, 3);
    });
    if (s.tat) { H.tron(g, 10.5, 14, 4.5); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 1.5); }
    g.restore();
  } });

  /* VAN HƠI (N, mã nội bộ 'nut-ban', nằm trên tường; 29/10 user chốt: nút bắn là VAN HƠI của nhà máy chạy bằng hơi nước nóng): khối tường lab, ống hơi chạy ngang
     sau mặt bích tròn bốn bu lông, BÁNH VAN tay quay ba nan có CÁNH HỨNG NƯỚC vàng ở đầu một nan (tia nước của vòi phun đập vào cánh làm van quay nửa vòng).
     Đóng: bánh thép xanh nguội, cánh hứng ở trên. Mở (s.bat): bánh cam nóng, quầng cam quanh mặt bích, cánh hứng xuống dưới (quay nửa vòng).
     s.goc (0..1, tuỳ chọn): góc quay của bánh tính theo nửa vòng (0 đóng, 1 mở) cho hoạt cảnh quay khi đổi (san-ve.js lượng tử hoá 1/8); không có thì theo s.bat.
     s.loe: vừa bị tia nước trúng → mặt bích loé trắng. (Van mở còn NÓNG: quầng cam thở + làn hơi trắng do san-ve.js veNong vẽ đè.) */
  V.dangKy({ loai: 'o', ma: 'nut-ban', ten: 'Van hơi', ky: ['N'], cacTrangThai: [{}, { bat: true }, { loe: true }, { bat: true, loe: true }, { goc: 0.5 }, { bat: true, goc: 0.25 }], ve: function (g, s, H) {
    var mo = !!s.bat, k = typeof s.goc === 'number' ? Math.max(0, Math.min(1, s.goc)) : (mo ? 1 : 0), a0 = -Math.PI / 2 + k * Math.PI, i, a;
    var vanh = mo ? BM.vecVanNong : BM.vecVanNguoi, cx = 50, cy = 50;
    V.lay('o', 'tuong').ve(g, {}, H);
    H.bo(g, 2, 41, 96, 18, 3); g.fillStyle = H.gradDoc(g, 0, 41, 0, 59, [[0, BM.vecThepSang], [1, BM.vecThep]]); g.fill(); H.vien(g, BM.vecVien, 2.5);   // ống hơi ngang trong tường
    [10, 90].forEach(function (x) { H.bo(g, x - 3.5, 38, 7, 24, 2); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2); });                                // khớp nối ống hai bên
    if (mo) { H.tron(g, cx, cy, 37); H.vien(g, BM.vecVanNongSang, 5); }
    H.tron(g, cx, cy, 31); g.fillStyle = H.gradDoc(g, 0, 19, 0, 81, [[0, BM.vecSat], [1, BM.vecSatToi]]); g.fill(); H.vien(g, BM.vecVien, 3);                // mặt bích
    for (i = 0; i < 4; i++) { a = Math.PI / 4 + i * Math.PI / 2; H.tron(g, cx + 26 * Math.cos(a), cy + 26 * Math.sin(a), 2.6); H.to(g, BM.vecDinh); H.vien(g, BM.vecDinhVien, 1.2); }
    H.tron(g, cx, cy, 21); H.vien(g, BM.vecVien, 9.5); H.vien(g, vanh, 5.5);                                                                     // vành bánh van
    g.beginPath(); for (i = 0; i < 3; i++) { a = a0 + i * Math.PI * 2 / 3; g.moveTo(cx, cy); g.lineTo(cx + 21 * Math.cos(a), cy + 21 * Math.sin(a)); }
    H.vien(g, BM.vecVien, 7); H.vien(g, mo ? BM.vecCamDam : BM.vecVanNguoiToi, 3.5);                                                             // ba nan
    g.save(); g.translate(cx + 19 * Math.cos(a0), cy + 19 * Math.sin(a0)); g.rotate(a0 + Math.PI / 2);                                            // cánh hứng nước (chén vàng) ở đầu nan 0, lòng chén quay ra ngoài
    H.duong(g, 'M-12 0 C-12 -18 12 -18 12 0 Z'); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 2.5);
    H.duong(g, 'M-6.5 -1.5 C-6.5 -10 6.5 -10 6.5 -1.5 Z'); H.to(g, BM.vecVangToi);
    g.restore();
    H.tron(g, cx, cy, 7.5); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2);                                                                        // trục
    H.tron(g, cx - 2.2, cy - 2.2, 2.2); H.to(g, mo ? BM.vecVanNongSang : BM.vecBacSang);
    if (s.loe) { H.tron(g, cx, cy, 33); g.globalAlpha = 0.75; H.to(g, BM.vecVo); g.globalAlpha = 1; }
  } });

  /* NÚT ĐÈ GIỮ (M, vẽ đè lên sàn): như mẫu vat-nut — khung trắng, đế tối, hai vòng cyan, bốn chấm góc. s.de: đang có vật / xe đè: mặt lún xuống (lệch 2), vòng xanh lá. */
  V.dangKy({ loai: 'o', ma: 'nut-de', ten: 'Nút đè', ky: ['M'], phu: true, cacTrangThai: [{}, { de: true }], ve: function (g, s, H) {
    var d = s.de ? 2 : 0, c1 = s.de ? BM.vecXanhLa : BM.vecDen, c2 = s.de ? BM.vecXanhLaSang : BM.vecDenSang;
    H.bo(g, 10, 12, 80, 80, 12); H.to(g, H.rgba(BM.vecVienRgb, 0.12));
    H.bo(g, 10, 10, 80, 80, 12); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 3);
    H.bo(g, 20, 20 + d, 60, 60 - d, 10); H.to(g, BM.vecDe);
    if (s.de) { H.tron(g, 50, 51, 24); H.vien(g, c2, 2); }
    H.tron(g, 50, 50 + d / 2, 19); H.vien(g, c1, 6);
    H.tron(g, 50, 50 + d / 2, 8); H.vien(g, c2, 3);
    [[17, 17], [83, 17], [17, 83], [83, 83]].forEach(function (q) { H.tron(g, q[0], q[1], 3); H.to(g, c1); });
  } });

  /* CỬA (C đóng / c mở, vẽ đè lên sàn): hai cột khung (hổ phách; cửa nhịp: cyan) và hai cánh trắng bạc trượt vào hai cột theo s.k (0 đóng .. 1 mở, san-ve.js
     lượng tử hoá 1/10). Đóng hẳn: đèn đỏ giữa khe; mở hẳn: đèn xanh trên hai cột. Vẽ cho xe đi DỌC (cánh trượt ngang), s.doc = false thì xoay 90°.
     s.nhip = { n, mo, p, tat }: cửa nhịp — hàng n đèn ở mép trên (KHÔNG xoay): xanh = nhịp mở, đỏ = nhịp đóng, đèn nhịp hiện tại sáng có viền trắng, tat = đang nháy (sắp đổi). */
  var TT_CUA = [];
  [true, false].forEach(function (doc) { [0, 0.3, 0.7, 1].forEach(function (k) { TT_CUA.push({ k: k, doc: doc }); }); });
  TT_CUA.push({ k: 0, doc: true, nhip: { n: 3, mo: 1, p: 0 } }, { k: 1, doc: false, nhip: { n: 5, mo: 2, p: 1, tat: true } }, { k: 0.5, doc: true, nhip: { n: 6, mo: 3, p: 4 } });
  V.dangKy({ loai: 'o', ma: 'cua', ten: 'Cửa', ky: ['C', 'c'], phu: true, cacTrangThai: TT_CUA, ve: function (g, s, H) {
    var k = Math.max(0, Math.min(1, +s.k || 0)), w = 34 * (1 - k), nh = s.nhip, kh = nh ? [BM.vecDen, BM.vecDenToi] : [BM.vecVang, BM.vecVangToi];
    g.save(); if (s.doc === false) xoayQuanh(g, Math.PI / 2);
    if (k < 1) { g.fillStyle = H.rgba(BM.vecVienRgb, 0.22 * (1 - k)); g.fillRect(16 + w, 6, 68 - 2 * w, 88); }       // khe đang mở: tối dần về sàn
    [16, 84 - w].forEach(function (x) {
      if (w < 2) return;
      H.bo(g, x, 6, w, 88, Math.min(3, w / 2)); g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecTuong], [1, BM.vecTuongToi]]); g.fill(); H.vien(g, BM.vecVien, 2.5);
      if (w > 9) { g.beginPath(); [26, 44, 62, 80].forEach(function (y) { g.moveTo(x + 3.5, y); g.lineTo(x + w - 3.5, y); }); H.vien(g, BM.vecTuongVien, 1.5, 'butt'); }
    });
    [2, 84].forEach(function (x) { H.bo(g, x, 3, 14, 94, 4); g.fillStyle = H.gradDoc(g, x, 0, x + 14, 0, [[0, kh[0]], [1, kh[1]]]); g.fill(); H.vien(g, BM.vecVien, 2.5); });
    if (k === 0) { H.bo(g, 43, 43, 14, 14, 4); H.to(g, BM.vecVien); H.tron(g, 50, 50, 4.5); H.to(g, BM.vecDo); }
    else if (k === 1) [9, 91].forEach(function (x) { H.tron(g, x, 50, 3.5); H.to(g, BM.vecXanhLa); H.vien(g, BM.vecVien, 1.5); });
    g.restore();
    if (nh && nh.n > 0) {
      var n = Math.min(6, nh.n | 0), tong = n * 11 - 3, x0 = 50 - tong / 2, i;
      H.bo(g, x0 - 4, 2, tong + 8, 13, 6.5); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2);
      for (i = 0; i < n; i++) {
        var mo = i < nh.mo, dang = i === nh.p, sang = dang && !nh.tat;
        H.tron(g, x0 + 4 + i * 11, 8.5, 3.6);
        g.globalAlpha = sang ? 1 : 0.45; H.to(g, mo ? BM.vecXanhLa : BM.vecDo); g.globalAlpha = 1;
        if (sang) H.vien(g, BM.vecVo, 1.5);
      }
    }
  } });

  /* BÀN XOAY (@ xoay phải 90°, % xoay trái): mâm bạc tròn, mặt trắng, hai mũi tên cong chỉ chiều quay (phải: vàng hổ phách, trái: ngọc), bốn đinh trên vành.
     s.chieu (+1 / −1), s.pha (0..3): mâm quay một nấc 22,5° mỗi pha (đối xứng 90° nên bốn pha lặp liền). */
  var TT_BAN = [];
  [1, -1].forEach(function (c) { [0, 1, 2, 3].forEach(function (p) { TT_BAN.push({ chieu: c, pha: p }); }); });
  V.dangKy({ loai: 'o', ma: 'ban-xoay', ten: 'Bàn xoay', ky: ['@', '%'], phu: true, cacTrangThai: TT_BAN, ve: function (g, s, H) {
    var d = s.chieu < 0 ? -1 : 1, a0 = d * (((+s.pha || 0) % 4 + 4) % 4) * Math.PI / 8, mau = d > 0 ? BM.vecVang : BM.vecNgoc, k, a;
    H.elip(g, 52, 55, 42, 40); H.to(g, H.rgba(BM.vecVienRgb, 0.12));
    H.tron(g, 50, 50, 43); g.fillStyle = H.gradDoc(g, 0, 7, 0, 93, [[0, BM.vecSat], [1, BM.vecSatToi]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.tron(g, 50, 50, 32); H.to(g, BM.vecVo); H.vien(g, BM.vecTuongTrongVien, 2);
    for (k = 0; k < 4; k++) { a = a0 + k * Math.PI / 2 + Math.PI / 4; H.tron(g, 50 + 37.5 * Math.cos(a), 50 + 37.5 * Math.sin(a), 3); H.to(g, BM.vecDinh); H.vien(g, BM.vecDinhVien, 1.5); }
    for (k = 0; k < 2; k++) {
      var s0 = a0 + k * Math.PI + 0.35, e = s0 + d * 2.0, px = 50 + 21 * Math.cos(e), py = 50 + 21 * Math.sin(e), tx = -d * Math.sin(e), ty = d * Math.cos(e), nx = Math.cos(e), ny = Math.sin(e);
      [[BM.vecVien, 10], [mau, 5.5]].forEach(function (b) { g.beginPath(); g.arc(50, 50, 21, s0, e, d < 0); H.vien(g, b[0], b[1]); });
      g.beginPath(); g.moveTo(px + tx * 9, py + ty * 9); g.lineTo(px + nx * 7, py + ny * 7); g.lineTo(px - nx * 7, py - ny * 7); g.closePath();
      H.to(g, mau); H.vien(g, BM.vecVien, 2);
    }
    H.tron(g, 50, 50, 7); H.to(g, BM.vecVien); H.tron(g, 48, 48, 2.5); H.to(g, BM.vecVo);
  } });

  /* CỔNG DỊCH CHUYỂN (1, 2 — mỗi số có đúng hai ô, đi vào ô này ra ô kia): đĩa tối, vòng năng lượng (1 xanh lam, 2 tím), lõi sáng thở theo pha,
     bốn tia xoay; số chấm trắng ở mép trên = số hiệu cổng (đọc được cả khi không phân biệt màu). Vẽ trung tính: luật cổng có thể đổi sau, hình không nói gì thêm. */
  var TT_CONG = [];
  ['1', '2'].forEach(function (so) { [0, 1, 2, 3].forEach(function (p) { TT_CONG.push({ so: so, pha: p }); }); });
  V.dangKy({ loai: 'o', ma: 'cong', ten: 'Cổng dịch chuyển', ky: ['1', '2'], phu: true, cacTrangThai: TT_CONG, ve: function (g, s, H) {
    var hai = String(s.so) === '2', c = hai ? BM.vecCong2 : BM.vecCong1, cs = hai ? BM.vecCong2Sang : BM.vecCong1Sang, f = (s.pha | 0) & 3, k, a;
    H.elip(g, 52, 55, 41, 39); H.to(g, H.rgba(BM.vecVienRgb, 0.12));
    H.tron(g, 50, 50, 42); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 3);
    H.tron(g, 50, 50, 27); g.fillStyle = H.gradToa(g, 50, 50, 27, [[0, cs], [0.55, c], [1, BM.vecDe]]); g.fill();
    H.tron(g, 50, 50, 31); H.vien(g, c, 6);
    g.beginPath(); for (k = 0; k < 4; k++) { a = f * Math.PI / 8 + k * Math.PI / 2; g.moveTo(50 + 13 * Math.cos(a), 50 + 13 * Math.sin(a)); g.lineTo(50 + 22 * Math.cos(a), 50 + 22 * Math.sin(a)); }
    H.vien(g, cs, 3);
    H.tron(g, 50, 50, f & 1 ? 8 : 10); g.globalAlpha = 0.9; H.to(g, BM.vecVo); g.globalAlpha = 1;
    (hai ? [44, 56] : [50]).forEach(function (x) { H.tron(g, x, 13, 3.2); H.to(g, BM.vecVo); });
  } });
})(typeof window !== 'undefined' ? window : globalThis);
