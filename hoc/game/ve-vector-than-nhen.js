var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-nhen.js — THÂN NHỆN BỐN CHÂN vector (gói V3), cùng gia đình thân A: vỏ trắng vuông bo góc (V8a: bán kính bo / cạnh ngắn ≈ 0,34 như thân A, trước 0,46 gần tròn), đường ghép tím nhạt, kính + hai mắt màu đội,
   ăng-ten chấm màu đội. V8a (29/10, user "thân nhện hơi xấu, ko tạo cảm giác đang bò"): bốn chân ba khúc chắc chắn: nắp vai bo ở bốn góc vỏ, đùi trắng vuốt thon
   viền chàm, khớp gối chàm có lõi cyan, cẳng thon dần, bàn chân chàm có chấm cyan.
   Quay mặt XUỐNG, tâm (50, 56). Ổ (không đổi): tay (50, 81); hongTrai (68, 48) / hongPhai (32, 48) trên vỏ; tren (68, 77) góc mũi trái; sau (38, 31) đuôi.
   Trạng thái s:
     lan (0..1, V8a)  pha DÁNG BÒ ở nhịp bước (san-ve.js dangBo: một chu kỳ mỗi ô theo quãng đã đi). Chéo đôi: cặp A (trước phía x lớn + sau phía x nhỏ) nhấc và vươn tới ở nửa đầu,
                      cặp B ở nửa sau; chân đang chạm đất trôi ngược hướng đi (thân lướt qua bàn chân đứng yên); thân nhún lên khi một cặp đang nhấc. lan = 0 (hay 1) = tư thế đứng.
     di (0..3, V8a)   hướng đi trong HỆ THÂN (0 = phía mũi +y, 1 = +x, 2 = đuôi -y, 3 = -x); thiếu = 0.
     nhac (0..1, V8a) pha nhịp CHUẨN BỊ (chưa rời ô): cặp A rồi cặp B nhấc lên đặt xuống tại chỗ (không vươn), thân nhún theo; 0,25 = cặp A nhấc hẳn (húc tường, đang bật nhảy).
                      Không có lan / nhac mà buoc = 1 (người gọi cũ, ngoài sân) → như lan 0,25.
     co               (chương nhện co chân, chui gầm): bốn chân dang sát đất nằm ngang, đốt ngắn, vỏ nhỏ lại và lùi về sau, vạch bóng tối ở bụng; dáng bò vẫn chạy (bước ngắn).
   Ổ gắn KHÔNG đổi theo trạng thái (tay kẹp / cảm biến ở đúng chỗ, như part-nhen.js); camera / camSang như thân A.
   Nhện không tay đi bốn hướng không quay mặt: VeRobot truyền hướng 0 (như bộ pixel). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var HUONG_DI = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  /** Khúc chân vuốt thon: tròn bán kính ra ở a, rb ở b (đường bao một khối, không vạch ngang ở giữa). */
  function khuc(g, a, b, ra, rb) {
    var t = Math.atan2(b[1] - a[1], b[0] - a[0]);
    g.beginPath(); g.arc(a[0], a[1], ra, t + Math.PI / 2, t + Math.PI * 3 / 2); g.arc(b[0], b[1], rb, t - Math.PI / 2, t + Math.PI / 2); g.closePath();
  }
  /** Một chân: hông (h) → gối (k) → bàn (b), [x, y] trong hệ thân; n 0..1 = bàn chân đang nhấc khỏi đất (gối nhô ra to lên, bàn thu về, bóng in dưới bàn chân);
   *  co: chân dang sát đất (đốt mảnh hơn). */
  function chan(g, H, h, k, b, n, co) {
    var s = co ? 0.85 : 1, rg = (4.6 + 1.2 * n) * s;
    var bb = [b[0] + (h[0] - b[0]) * 0.28 * n, b[1] + (h[1] - b[1]) * 0.28 * n];                     // nhấc: bàn chân thu về phía hông (nhìn từ trên xuống thấy ngắn lại)
    if (n > 0.05) { H.elip(g, bb[0] + 1.5 * n, bb[1] + 2 * n, 4.4, 3.2); H.to(g, H.rgba(BM.vecVienRgb, 0.2 * n)); }   // bóng bàn chân in trên sàn khi nhấc
    var kk = [k[0] + (k[0] < 50 ? -1 : 1) * 3 * n, k[1]];                                         // gối nhô ra ngoài
    khuc(g, kk, bb, 3.4 * s, 2 * s); H.to(g, BM.vecVoGiua); H.vien(g, BM.vecVien, 2.2);            // cẳng thon dần
    khuc(g, h, kk, 6 * s, 4.4 * s); g.fillStyle = H.gradDoc(g, h[0], h[1], kk[0], kk[1], [[0, BM.vecVo], [1, BM.vecVoToi]]); g.fill(); H.vien(g, BM.vecVien, 2.4);   // đùi
    H.tron(g, kk[0], kk[1], rg); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 2);                   // khớp gối
    H.tron(g, kk[0], kk[1], rg * 0.42); H.to(g, BM.vecDen);
    H.tron(g, bb[0], bb[1], (3.2 + 0.7 * n) * s); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 1.8);   // bàn chân
    H.tron(g, bb[0], bb[1], 1.1 * s); H.to(g, BM.vecDen);
  }
  /** Nắp vai bo (khớp hông) ở góc vỏ. */
  function vai(g, H, x, y, r) {
    H.tron(g, x, y, r); g.fillStyle = H.gradToa(g, x - r * 0.3, y - r * 0.3, r * 1.3, [[0, BM.vecVo], [1, BM.vecKhop]]); g.fill(); H.vien(g, BM.vecVien, 2.4);
    H.tron(g, x, y, r * 0.38); H.to(g, BM.vecVoGhep);
  }
  /** Dáng bò: mỗi cặp chân { o: dời theo hướng đi, n: độ nhấc }; nhun: thân nhún (+ lên, - hạ). */
  function dang(s) {
    var p = typeof s.lan === 'number' ? ((s.lan % 1) + 1) % 1 : null, S = 10, A = { o: 0, n: 0 }, B = { o: 0, n: 0 }, nhun = 0;
    if (p === null && typeof s.nhac !== 'number' && s.buoc) p = 0.25;
    if (p !== null) {
      var sp = Math.sin(Math.PI * p);
      A = { o: S * sp, n: p < 0.5 ? Math.sin(2 * Math.PI * p) : 0 };                                  // A: nửa đầu nhấc vươn tới, nửa sau chạm đất trôi về
      B = { o: -S * sp, n: p >= 0.5 ? Math.sin(2 * Math.PI * (p - 0.5)) : 0 };                       // B: nửa đầu chạm đất trôi về sau, nửa sau nhấc về chỗ
      nhun = Math.max(A.n, B.n);
    } else if (typeof s.nhac === 'number') {                                                        // nhịp chuẩn bị: hai cặp nhấc luân phiên tại chỗ (không vươn)
      var q = ((s.nhac % 1) + 1) % 1;
      A.n = q < 0.5 ? Math.sin(2 * Math.PI * q) : 0; B.n = q >= 0.5 ? Math.sin(2 * Math.PI * (q - 0.5)) : 0; nhun = Math.max(A.n, B.n);
    }
    return { A: A, B: B, nhun: nhun };
  }
  V.dangKy({ loai: 'than', ma: 'nhen', hamGoc: ['go_up',  'go_down',  'go_left',  'go_right',  'wait',  'crouch',  'stand'], ten: 'Thân nhện bốn chân', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 68, y: 48 }, hongPhai: { x: 32, y: 48 }, tren: { x: 68, y: 77 }, sau: { x: 38, y: 31 } }, oCam: { x: 62, y: 34 }, vo: { x: 25, y: 29, w: 50, h: 52 }, ve: function (g, s, M, H) {
    s = s || {};
    var co = !!s.co, dg = dang(s), u = HUONG_DI[s.di | 0] || HUONG_DI[0], kb = co ? 0.6 : 1;
    /* bốn chân: [hông, gối, bàn] tư thế đứng (phía x nhỏ), lật sang phía x lớn; chân TRƯỚC (y lớn) rồi chân SAU */
    var CHAN = co ? [[[34, 66], [15, 69], [8, 77]], [[34, 44], [15, 41], [8, 34]]] : [[[29, 66], [12, 71], [10, 90]], [[29, 44], [12, 39], [10, 20]]];
    [-1, 1].forEach(function (k) {
      CHAN.forEach(function (c, i) {
        var x = function (v) { return 50 + k * (v - 50); }, cap = (k < 0) === (i === 0) ? dg.A : dg.B, o = cap.o * kb;
        chan(g, H, [x(c[0][0]), c[0][1]], [x(c[1][0]) + u[0] * o * 0.5, c[1][1] + u[1] * o * 0.5], [x(c[2][0]) + u[0] * o, c[2][1] + u[1] * o], cap.n * kb, co);
      });
    });
    /* thân nhún: phóng nhẹ quanh tâm (50, 56) khi một cặp chân đang nhấc (ổ gắn lệch < 2 đơn vị) */
    var z = 1 + 0.045 * dg.nhun * kb;
    g.save(); g.translate(50, 56); g.scale(z, z); g.translate(-50, -56);
    if (co) {
      H.bo(g, 27, 33, 46, 47, 16); g.fillStyle = H.gradVo(g, 27, 33, 46, 47); g.fill(); H.vien(g, BM.vecVien, 3.5);
      vai(g, H, 28, 44, 5); vai(g, H, 72, 44, 5); vai(g, H, 28, 66, 5); vai(g, H, 72, 66, 5);
      H.duong(g, 'M37 39 C35 47 35 54 37 60 M63 39 C65 47 65 54 63 60'); H.vien(g, BM.vecVoGhep, 2.5);
      H.duong(g, 'M33 76 H67'); H.vien(g, BM.vecVoToi, 3);
      H.kinh(g, M, 31, 60, 38, 14, s);
      H.angTen(g, M, 50, 34, 24, 4.5);
    } else {
      H.bo(g, 25, 29, 50, 52, 17); g.fillStyle = H.gradVo(g, 25, 29, 50, 52); g.fill(); H.vien(g, BM.vecVien, 3.5);
      vai(g, H, 26, 44, 6); vai(g, H, 74, 44, 6); vai(g, H, 26, 66, 6); vai(g, H, 74, 66, 6);
      H.duong(g, 'M36 36 C34 45 34 53 36 60 M64 36 C66 45 66 53 64 60 M50 29 v10'); H.vien(g, BM.vecVoGhep, 2.5);
      H.duong(g, 'M34 38 C37 33 41 32 45 32'); H.vien(g, BM.vecVo, 4);
      H.kinh(g, M, 30, 58, 40, 15, s);
      H.angTen(g, M, 50, 30, 18, 5);
    }
    g.restore();
  } });
})(typeof window !== 'undefined' ? window : globalThis);
