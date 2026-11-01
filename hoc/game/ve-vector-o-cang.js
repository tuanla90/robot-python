var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-o-cang.js — Ô SÂN CẢNG SÔNG (mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.1, 3.6, 4). Ô nước '~' dùng chung 'nuoc' (ve-vector-o-song.js).
     'bai-cont'  '.'  bãi container: bê tông xám, vạch sơn vàng khung chỗ đặt container, đinh neo; s.le: ô lệch tông (bàn cờ như sàn lab)
     'boong-tau' 'T'  ô boong tàu. s.co (tàu CÓ MẶT): sàn boong thép, mạn tàu đỏ ở các cạnh s.vien (chuỗi 't' trên 'r' phải 'b' dưới 'l' trái; mặc định 'trbl': một ô một
                      tàu; tàu nhiều ô thì gói nối truyền cạnh ngoài), vạch nắp hầm. Tàu VẮNG: mặt nước + khung nét đứt chỗ tàu đậu + hai cọc buộc.
                      s.so: số tàu (1–9) in nhỏ ở góc boong (tuỳ chọn, để trẻ biết tàu nào khi màn có nhiều tàu).
     'ray'       'R'  ray cẩu: bê tông + hai thanh ray thép + tà vẹt; s.doc: ray dọc (mặc định ngang).
   ky = ký hiệu sân của SanHoc (T, R nhận từ lõi Cảng sông 31/10; '.' của bãi container là sàn chung, san-ve.js chọn hình theo mùa). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  if (typeof module === 'object' && !(root.VeVector && root.VeVector.nenNuoc)) require('./ve-vector-o-song.js');

  function nenBeTong(g, H, le) {
    g.fillStyle = BM.vecSatVien; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2, 2, 96, 96, 4); g.fillStyle = H.gradDoc(g, 0, 0, 100, 100, le ? [[0, BM.vecSatGiua], [1, BM.vecSatToi]] : [[0, BM.vecSat], [1, BM.vecSatGiua]]); g.fill();
  }

  V.dangKy({ loai: 'o', ma: 'bai-cont', ten: 'Bãi container', ky: ['.'], cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    nenBeTong(g, H, le);
    g.beginPath(); g.moveTo(10, 16); g.lineTo(10, 26); g.moveTo(10, 16); g.lineTo(22, 16); g.moveTo(90, 16); g.lineTo(78, 16); g.moveTo(90, 16); g.lineTo(90, 26);   // góc khung chỗ đặt
    g.moveTo(10, 84); g.lineTo(10, 74); g.moveTo(10, 84); g.lineTo(22, 84); g.moveTo(90, 84); g.lineTo(78, 84); g.moveTo(90, 84); g.lineTo(90, 74);
    H.vien(g, BM.vecCanhBao, 4, 'square');
    [[30, 50], [70, 50]].forEach(function (p) { H.tron(g, p[0], p[1], 2.6); H.to(g, BM.vecSatVien); });                                                  // đinh neo
    g.beginPath(); g.moveTo(le ? 60 : 36, 30); g.lineTo(le ? 66 : 42, 36); H.vien(g, H.rgba(BM.vecVienRgb, 0.18), 2);                                    // vết nứt nhỏ
  } });

  V.dangKy({ loai: 'o', ma: 'boong-tau', ten: 'Boong tàu', ky: ['T'], cacTrangThai: [{ co: true }, {}, { co: true, vien: 'tl' }, { co: true, vien: 'b', so: 2 }, { co: true, vien: '' }], ve: function (g, s, H) {
    s = s || {};
    if (!s.co) {
      V.nenNuoc(g, H, true);
      H.bo(g, 8, 8, 84, 84, 10); g.setLineDash([8, 7]); H.vien(g, BM.vecTroiNhat, 3.5); g.setLineDash([]);
      [[14, 50], [86, 50]].forEach(function (p) { H.tron(g, p[0], p[1], 5); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2); });
      return;
    }
    var vien = typeof s.vien === 'string' ? s.vien : 'trbl', t = vien.indexOf('t') >= 0, r = vien.indexOf('r') >= 0, b = vien.indexOf('b') >= 0, l = vien.indexOf('l') >= 0;
    g.fillStyle = BM.vecThepToi; g.fillRect(0, 0, 100, 100);
    g.fillStyle = H.gradDoc(g, 0, 0, 0, 100, [[0, BM.vecThepSang], [1, BM.vecThep]]); g.fillRect(1, 1, 98, 98);
    g.beginPath(); g.moveTo(1, 34); g.lineTo(99, 34); g.moveTo(1, 66); g.lineTo(99, 66); H.vien(g, BM.vecThepToi, 2, 'butt');                                // mép nắp hầm
    g.beginPath(); g.moveTo(1, 50); g.lineTo(99, 50); H.vien(g, H.rgba(BM.vecVienRgb, 0.25), 1.5, 'butt');
    var M = 9;                                                                                                                                              // mạn tàu đỏ
    g.fillStyle = BM.vecLuaDo;
    if (t) g.fillRect(0, 0, 100, M);
    if (b) g.fillRect(0, 100 - M, 100, M);
    if (l) g.fillRect(0, 0, M, 100);
    if (r) g.fillRect(100 - M, 0, M, 100);
    g.beginPath();
    if (t) { g.moveTo(l ? M : 1, M); g.lineTo(r ? 100 - M : 99, M); }
    if (b) { g.moveTo(l ? M : 1, 100 - M); g.lineTo(r ? 100 - M : 99, 100 - M); }
    if (l) { g.moveTo(M, t ? M : 1); g.lineTo(M, b ? 100 - M : 99); }
    if (r) { g.moveTo(100 - M, t ? M : 1); g.lineTo(100 - M, b ? 100 - M : 99); }
    H.vien(g, BM.vecLuaVienToi, 2, 'butt');
    if (s.so) {
      H.bo(g, 14, 14, 20, 16, 4); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.5);
      g.font = '800 13px "Google Sans Flex", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = BM.vecVien; g.fillText(String(s.so), 24, 22.5);
    }
  } });

  V.dangKy({ loai: 'o', ma: 'ray', ten: 'Ray cẩu', ky: ['R'], cacTrangThai: [{}, { doc: true }], ve: function (g, s, H) {
    var doc = !!(s && s.doc), i;
    nenBeTong(g, H, false);
    g.save();
    if (doc) { g.translate(50, 50); g.rotate(Math.PI / 2); g.translate(-50, -50); }
    g.beginPath(); for (i = 0; i < 5; i++) { g.rect(4 + i * 20, 24, 12, 52); } H.to(g, BM.vecDatToi);                                                          // tà vẹt
    [34, 66].forEach(function (y) {
      g.fillStyle = H.gradDoc(g, 0, y - 4, 0, y + 4, [[0, BM.vecBacSang], [1, BM.vecThep]]); g.fillRect(0, y - 4, 100, 8);
      g.beginPath(); g.moveTo(1, y - 4); g.lineTo(99, y - 4); g.moveTo(1, y + 4); g.lineTo(99, y + 4); H.vien(g, BM.vecThepToi, 1.6, 'butt');
    });
    g.restore();
  } });

  // Tường cảng sông (#): KHỐI BỜ KÈ BÊ TÔNG & TRỤ NEO TÀU 3D CAO (mặt trên bê tông sáng y = 8..60 gắn trụ bích neo tàu thép đen, vách đứng trước bê tông sẫm y = 60..94 gắn đệm cao su/vàng cảnh báo)
  V.dangKy({ loai: 'o', ma: 'tuong-cang', ten: 'Khối kè bê tông trụ neo cảng 3D', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecSatVien; g.fillRect(0, 0, 100, 100);
    // Thân khối kè bê tông cảng 3D cao (vách đứng phía trước sẫm màu y = 60..94)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecSatToi], [0.58, BM.vecKhoThep], [1, BM.vecThepToi]]);
    g.fill(); H.vien(g, BM.vecVien, 3);
    // Mặt trên khối bê tông cảng sáng (y = 8..60)
    H.bo(g, 8, 8, 84, 52, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 60, [[0, BM.vecKhoMat], [0.6, BM.vecSat], [1, BM.vecSatGiua]]);
    g.fill(); H.vien(g, BM.vecSatVien, 2);
    H.bo(g, 15, 12, 70, 5, 2.5); H.to(g, BM.vecVo);
    // Bệ thép và trụ bích neo tàu đôi (mooring bollard) trên mặt đỉnh
    H.bo(g, 24, 24, 52, 22, 6); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 2);
    [36, 64].forEach(function (cx) {
      H.tron(g, cx, 35, 7); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2);
      H.tron(g, cx - 1.5, 33.5, 2.5); H.to(g, BM.vecThepSang);
    });
    // Vách đứng trước (y = 60..94): dải đệm chống va tàu vàng-cam cảnh báo
    H.bo(g, 18, 70, 64, 13, 5);
    g.fillStyle = H.gradDoc(g, 0, 70, 0, 83, [[0, BM.vecCanhBao], [1, BM.vecVangToi]]);
    g.fill(); H.vien(g, BM.vecVien, 2);
    H.bo(g, 24, 72, 52, 3.5, 1.5); H.to(g, BM.vecVangSang);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
