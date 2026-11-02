var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-o-hang.js — VẬT TRÊN SÂN HANG ĐỘNG (mùa 8, hoc/KE-HOACH-MUA-8.md mục 2, P2). Vẽ ĐÈ lên sàn hang (san-ve.js vẽ sàn trước, vẽ hình này sau):
     'chuong-da'  cfg.chuongDa / danDoi {x, y, not}: nhũ đá treo tự ngân, nhìn từ trên: chóp thạch nhũ tròn + hai vòng sóng + nhãn nốt (màu theo nốt).
                  Không chặn đường (xe đi dưới được). s.not 1–8; s.pha 0…1 (vòng sóng lan, lượng tử 1/8).
     'da-chuong'  cfg.daChuong {x, y, not, ben}: khối thạch nhũ chặn đường, mặt trên có số nốt, vạch ben ở vách trước (s.ngan vạch đã sáng / s.ben vạch);
                  s.vo: đã vỡ, còn đống đá vụn thấp (đi qua được). s.rung: đang rung (lệch nhẹ do san-ve.js lo, ở đây chỉ vẽ vạch sáng).
     'cua-ngach'  cfg.ngachHang [{a, b}]: miệng ngách hang ngầm trên sàn: hố tối hình vòm, vành đá màu theo cặp (s.mau 0…5), mũi tên vào trong; s.dau 'a' / 'b' (hai đầu cùng màu).
   MAU_NOT[n]: màu của nốt n (Đô đỏ, Rê cam, Mi vàng, Fa lá, Sol ngọc, La lam, Si tím, Đô cao hồng), cũng dùng cho sóng loa ở san-ve.js. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));

  var MAU_NOT = [null, 'vecDo', 'vecLuaCam', 'vecVang', 'vecLa', 'vecNgoc', 'vecLam', 'vecTim', 'vecHong'];
  var MAU_NGACH = ['vecCyanDam', 'vecHoPhach', 'vecHong', 'vecLa', 'vecTim', 'vecLuaCam'];
  function mauNot(n) { return BM[MAU_NOT[n] || 'vecDen'] || BM.vecDen; }
  V.mauNot = mauNot;

  /** Nhãn nốt: viên tròn màu nốt, số trắng viền tối (cỡ r). */
  function nhanNot(g, H, n, cx, cy, r) {
    H.tron(g, cx, cy, r); H.to(g, mauNot(n)); H.vien(g, BM.vecVien, 2.4);
    g.font = '800 ' + Math.round(r * 1.35) + 'px "Google Sans Flex", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 3; g.strokeStyle = BM.vecVien; g.lineJoin = 'round'; g.strokeText(String(n), cx, cy + 1);
    g.fillStyle = BM.vecThe; g.fillText(String(n), cx, cy + 1);
  }

  V.dangKy({ loai: 'o', ma: 'chuong-da', ten: 'Chuông đá (nhũ đá tự ngân)', cacTrangThai: [{ not: 1 }, { not: 3, pha: 0.5 }, { not: 5 }, { not: 8, pha: 0.25 }], ve: function (g, s, H) {
    s = s || {};
    var n = s.not | 0, pha = typeof s.pha === 'number' ? s.pha : 0, m = mauNot(n);
    [0, 0.5].forEach(function (lech) {                                                  // hai vòng sóng lan ra, mờ dần
      var k = (pha + lech) % 1;
      H.tron(g, 50, 46, 20 + k * 26);
      g.globalAlpha = 0.65 * (1 - k); H.vien(g, m, 3); g.globalAlpha = 1;
    });
    H.tron(g, 50, 50, 24); g.fillStyle = H.rgba(BM.vecVienRgb, 0.22); g.fill();          // bóng đổ xuống sàn
    H.tron(g, 50, 46, 22);                                                              // chóp thạch nhũ nhìn từ trên: các vòng đá vôi thu nhỏ dần
    g.fillStyle = H.gradDoc(g, 0, 24, 0, 68, [[0, BM.vecBacSang], [0.6, BM.vecThepSang], [1, BM.vecThep]]); g.fill(); H.vien(g, BM.vecVien, 2.6);
    H.tron(g, 50, 44, 15); H.to(g, BM.vecBac); H.vien(g, BM.vecThep, 1.6);
    H.tron(g, 50, 42, 8); g.fillStyle = H.gradDoc(g, 0, 34, 0, 50, [[0, BM.vecQuat], [1, BM.vecDen]]); g.fill(); H.vien(g, BM.vecCyanDam, 1.6);
    H.tron(g, 48, 40, 2.6); H.to(g, BM.vecDenSang);
    if (n) nhanNot(g, H, n, 76, 76, 12);
  } });

  V.dangKy({ loai: 'o', ma: 'da-chuong', ten: 'Đá chuông cộng hưởng', cacTrangThai: [{ not: 2, ben: 1 }, { not: 4, ben: 3, ngan: 1 }, { not: 6, ben: 2, ngan: 2 }, { not: 7, ben: 4 }, { not: 3, ben: 2, vo: true }], ve: function (g, s, H) {
    s = s || {};
    var n = s.not | 0, ben = Math.max(1, Math.min(6, s.ben | 0 || 1)), ngan = Math.max(0, Math.min(ben, s.ngan | 0)), m = mauNot(n), i;
    if (s.vo) {                                                                          // đã vỡ: đống đá vụn thấp, vài mảnh tinh thể màu nốt
      [[28, 62, 13], [52, 70, 15], [72, 58, 11], [42, 48, 9], [64, 44, 8]].forEach(function (p) {
        H.tron(g, p[0], p[1], p[2]); g.fillStyle = H.gradDoc(g, 0, p[1] - p[2], 0, p[1] + p[2], [[0, BM.vecThepSang], [1, BM.vecThepToi]]); g.fill(); H.vien(g, BM.vecVien, 2);
      });
      [[36, 58], [60, 62], [56, 46]].forEach(function (p) { g.beginPath(); g.moveTo(p[0], p[1] - 6); g.lineTo(p[0] + 5, p[1]); g.lineTo(p[0], p[1] + 6); g.lineTo(p[0] - 5, p[1]); g.closePath(); H.to(g, m); H.vien(g, BM.vecVien, 1.4); });
      return;
    }
    H.bo(g, 10, 10, 80, 84, 12);                                                         // thân khối 3D cao: vách đứng trước sẫm
    g.fillStyle = H.gradDoc(g, 0, 10, 0, 94, [[0, BM.vecThep], [0.6, BM.vecThepToi], [1, BM.vecDe]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.bo(g, 13, 12, 74, 50, 10);                                                         // mặt trên đá vôi sáng, vân tinh thể màu nốt
    g.fillStyle = H.gradDoc(g, 0, 12, 0, 62, [[0, BM.vecBacSang], [1, BM.vecThepSang]]); g.fill(); H.vien(g, BM.vecThep, 1.8);
    g.beginPath(); g.moveTo(20, 54); g.lineTo(30, 22); g.lineTo(36, 54); g.moveTo(64, 54); g.lineTo(72, 28); g.lineTo(80, 54);
    g.globalAlpha = 0.55; H.to(g, m); g.globalAlpha = 1;
    if (n) nhanNot(g, H, n, 50, 37, 15);
    var w = 60 / ben, x0 = 20;                                                           // vạch ben ở vách trước: sáng dần theo số nhịp đã cộng hưởng
    for (i = 0; i < ben; i++) {
      H.bo(g, x0 + i * w + 1.5, 70, w - 3, 14, 3);
      H.to(g, i < ngan ? m : BM.vecThepToi); H.vien(g, i < ngan ? BM.vecVien : BM.vecThep, 1.6);
    }
  } });

  V.dangKy({ loai: 'o', ma: 'cua-ngach', ten: 'Miệng ngách hang ngầm', cacTrangThai: [{ mau: 0, dau: 'a' }, { mau: 0, dau: 'b' }, { mau: 1, dau: 'a' }, { mau: 2, dau: 'b' }], ve: function (g, s, H) {
    s = s || {};
    var mau = BM[MAU_NGACH[((s.mau | 0) % MAU_NGACH.length + MAU_NGACH.length) % MAU_NGACH.length]];
    H.bo(g, 14, 14, 72, 72, 30);                                                         // vành đá màu của cặp
    H.to(g, mau); H.vien(g, BM.vecVien, 3);
    H.bo(g, 22, 22, 56, 56, 24);                                                         // lòng ngách tối, sâu dần
    g.fillStyle = H.gradDoc(g, 0, 22, 0, 78, [[0, BM.vecDe], [1, BM.vecVien]]); g.fill();
    H.bo(g, 30, 34, 40, 36, 16); H.to(g, BM.vecVien);
    g.beginPath(); g.moveTo(50, 40); g.lineTo(60, 52); g.lineTo(54, 52); g.lineTo(54, 62); g.lineTo(46, 62); g.lineTo(46, 52); g.lineTo(40, 52); g.closePath();   // mũi tên chui xuống
    H.to(g, mau);
    [[18, 30], [82, 30], [18, 70], [82, 70]].forEach(function (p) { H.tron(g, p[0], p[1], 3); H.to(g, BM.vecThe); H.vien(g, BM.vecVien, 1.4); });   // đinh đá ở vành: hai đầu cùng cặp trông y hệt
  } });

  V.MAU_NOT = MAU_NOT;
  V.MAU_NGACH = MAU_NGACH;
})(typeof window !== 'undefined' ? window : globalThis);
