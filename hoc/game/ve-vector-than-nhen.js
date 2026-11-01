var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-nhen.js — THÂN NHỆN BỐN CHÂN vector (gói V3), cùng gia đình thân A: vỏ trắng vuông bo góc (V8a: bán kính bo / cạnh ngắn ≈ 0,34 như thân A, trước 0,46 gần tròn), đường ghép tím nhạt, kính + hai mắt màu đội,
   ăng-ten chấm màu đội. V8a (29/10, user "thân nhện hơi xấu, ko tạo cảm giác đang bò"): bốn chân ba khúc chắc chắn: nắp vai bo ở bốn góc vỏ, đùi trắng vuốt thon
   viền chàm, khớp gối chàm có lõi cyan, cẳng thon dần, bàn chân chàm có chấm cyan.
   Quay mặt XUỐNG, tâm (50, 56). Ổ (không đổi): tay (50, 81); hongTrai (68, 48) / hongPhai (32, 48) trên vỏ; tren (68, 77) góc mũi trái; sau (38, 31) đuôi.
   P1 mùa 3 (29/10): thêm chỗ treo oTayDuoi (50, 42) = giữa vỏ phía đuôi (dưới dải mắt), chỉ cho NAM CHÂM BỤNG (tayDuoi ['nam-cham']; không phải ổ trong oGan nên cảm biến không gắn được):
   ve-vector-tay-nam-cham.js vẽ đĩa nam châm tròn đè lên giữa vỏ (s.duoi + s.than 'nhen'); hình thân y nguyên, tay kẹp vẫn ở ổ tay (50, 81).
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
  /** Một đốt chân cơ khí vuốt thon có độ vòm nhẹ (cong): đầu a bán kính ra, đầu b bán kính rb. */
  function dotChan(g, a, b, ra, rb, cong) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / L, ny = dx / L, mx = (a[0] + b[0]) / 2 + nx * (cong || 0), my = (a[1] + b[1]) / 2 + ny * (cong || 0);
    var rm = (ra + rb) * 0.52, goc = Math.atan2(dy, dx);
    g.beginPath();
    g.moveTo(a[0] + nx * ra, a[1] + ny * ra);
    g.quadraticCurveTo(mx + nx * rm, my + ny * rm, b[0] + nx * rb, b[1] + ny * rb);
    g.arc(b[0], b[1], rb, goc + Math.PI / 2, goc - Math.PI / 2, true);
    g.quadraticCurveTo(mx - nx * rm, my - ny * rm, a[0] - nx * ra, a[1] - ny * ra);
    g.arc(a[0], a[1], ra, goc - Math.PI / 2, goc + Math.PI / 2, true);
    g.closePath();
  }
  /** Một chân nhện cơ khí 2 đốt theo thế "CONG LÊN RỒI CONG XUỐNG" (đùi cong vươn chéo LÊN đỉnh gối, cẳng chân mở ra ngoài cắm XUỐNG đế trụ cơ khí cứng cáp — tuyệt đối không khép vào dạng dấu ngoặc ()):
   *  hông (h) ↗ khớp gối cao (k) ↘ bàn chân đế trụ (b, đặt xa thân hơn gối); n (0..1): độ nhấc chân khi bò; co: tư thế co chân hạ thấp thân; duoi (0..1): độ duỗi thẳng chân khi bật nhảy. */
  function chan(g, H, h, k, b, n, co, duoi) {
    var s = co ? 0.92 : 1, dau = h[0] < 50 ? -1 : 1, d = duoi || 0, kCong = 1 - 0.65 * d;
    var bb = [b[0] + (h[0] - b[0]) * 0.14 * n, b[1] - 4.0 * n];                                       // khi nhấc: bàn chân nhấc lên (-y)
    var kk = [k[0] + dau * 1.2 * n, k[1] - 3.0 * n];                                                  // đỉnh gối nhô cao hơn khi nhấc chân
    /* 1. Bóng đổ dưới đế bàn chân (mờ dần khi bật nhảy lên không) */
    if (d < 0.85) {
      H.elip(g, bb[0], bb[1] + 2.4 + 1.8 * n, (4.8 - 0.5 * n) * s * (1 - 0.5 * d), (2.0 - 0.3 * n) * s * (1 - 0.5 * d));
      H.to(g, H.rgba(BM.vecVienRgb, (0.2 + 0.1 * n) * (1 - d)));
    }
    /* 2. Khớp hông cơ khí gắn vào cạnh thân */
    H.bo(g, h[0] - 3.4 * s, h[1] - 3.4 * s, 6.8 * s, 6.8 * s, 1.8 * s);
    H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 2.0);
    /* 3. Đốt đùi (h ↗ kk): cong vươn chéo LÊN TRÊN ra ngoài tới đỉnh gối (cong lên) */
    dotChan(g, h, kk, 3.6 * s, 2.8 * s, -dau * 1.4 * s * kCong);
    g.fillStyle = H.gradDoc(g, h[0], h[1], kk[0], kk[1], [[0, BM.vecVoToi], [0.45, BM.vecVoGiua], [1, BM.vecVo]]);
    g.fill(); H.vien(g, BM.vecVien, 2.3);
    H.duong(g, 'M' + (h[0] + (kk[0] - h[0]) * 0.22).toFixed(1) + ' ' + (h[1] + (kk[1] - h[1]) * 0.22 - 0.9).toFixed(1) +
      ' L' + (h[0] + (kk[0] - h[0]) * 0.78).toFixed(1) + ' ' + (h[1] + (kk[1] - h[1]) * 0.78 - 0.9).toFixed(1));
    H.vien(g, BM.vecVo, 1.4);
    /* 4. Đốt cẳng chân (kk ↘ bb): từ đỉnh gối mở RA XA THÂN xuống cổ chân (cong rất nhẹ 0.45 để cẳng chân vươn thẳng khỏe ra ngoài, tuyệt đối không bị cong khép hình dấu ngoặc ()) */
    dotChan(g, kk, [bb[0], bb[1] - 1.5 * s], 3.2 * s, 2.3 * s, -dau * 0.45 * s * kCong);
    g.fillStyle = H.gradDoc(g, kk[0] + dau * 3, kk[1], bb[0] - dau * 3, bb[1], [[0, BM.vecVo], [0.55, BM.vecVoGiua], [1, BM.vecVoToi]]);
    g.fill(); H.vien(g, BM.vecVien, 2.3);
    g.beginPath();
    g.moveTo(kk[0] + dau * 0.7 * s, kk[1] + 3.0 * s);
    g.quadraticCurveTo((kk[0] + bb[0]) / 2 + dau * 0.4 * s * kCong, (kk[1] + bb[1]) / 2, bb[0] + dau * 0.4 * s, bb[1] - 4.2 * s);
    H.vien(g, BM.vecVo, 1.3);
    /* 5. Khớp gối servo ở ĐỈNH CAO (kk): cụm bản lề thép chàm + lõi đèn cyan */
    var rg = (3.4 + 0.4 * n) * s;
    H.tron(g, kk[0], kk[1], rg); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 2.1);
    H.tron(g, kk[0], kk[1], rg * 0.48); H.to(g, BM.vecDen);
    H.tron(g, kk[0] - dau * 0.5, kk[1] - 0.5, rg * 0.2); H.to(g, BM.vecVo);
    /* 6. Cuối chân CỨNG CÁP: cổ chân thép + đế trụ hình thang vát góc đáy phẳng bám sàn */
    var fx = bb[0], fy = bb[1];
    H.bo(g, fx - 2.8 * s, fy - 4.4 * s, 5.6 * s, 2.8 * s, 0.9 * s);
    H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.0);
    g.beginPath();
    g.moveTo(fx - 3.1 * s, fy - 2.0 * s);
    g.lineTo(fx + 3.1 * s, fy - 2.0 * s);
    g.lineTo(fx + 4.7 * s, fy + 1.3 * s);
    g.lineTo(fx + 4.0 * s, fy + 2.4 * s);
    g.lineTo(fx - 4.0 * s, fy + 2.4 * s);
    g.lineTo(fx - 4.7 * s, fy + 1.3 * s);
    g.closePath();
    H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 2.2);
    H.bo(g, fx - 2.8 * s, fy - 0.6 * s, 5.6 * s, 2.0 * s, 0.7 * s);
    H.to(g, BM.vecDen);
  }
  /** Nội suy điểm 2D [x, y] theo hệ số t (0..1). */
  function noi(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
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
  V.dangKy({ loai: 'than', ma: 'nhen', hamGoc: ['go_up',  'go_down',  'go_left',  'go_right',  'wait',  'crouch',  'stand'], ten: 'Thân nhện bốn chân', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 68, y: 48 }, hongPhai: { x: 32, y: 48 }, tren: { x: 68, y: 77 }, sau: { x: 38, y: 31 } }, tayDuoi: ['nam-cham'], oTayDuoi: { x: 50, y: 42 }, oCam: { x: 62, y: 34 }, vo: { x: 25, y: 29, w: 50, h: 52 }, ve: function (g, s, M, H) {
    s = s || {};
    var co = !!s.co, dg = dang(s), u = HUONG_DI[s.di | 0] || HUONG_DI[0], kb = co ? 0.55 : 1;
    var duoi = Math.max(0, Math.min(1, s.nhay || 0)), nen = Math.max(0, Math.min(1, -(s.nhay || 0)));   // duoi: đang bật nhảy (4 chân duỗi thẳng dài xuống); nen: nhún lấy đà trước khi nhảy
    if (co) {
      H.elip(g, 50, 81, 21, 4.5); H.to(g, H.rgba(BM.vecVienRgb, 0.18));                              // bóng gầm sát đất khi nhện co chân hạ thấp thân
    }
    /* bốn chân theo thế "CONG LÊN RỒI CONG XUỐNG" (hông ↗ đỉnh gối cao ↘ bàn chân đặt mở ra xa thân):
       - Cặp chân ngoài (i = 0): hông (27, 41) ↗ gối (11, 26) ↘ bàn chân (4.5, 62) (mở rộng thoáng ra ngoài);
       - Cặp chân trong (i = 1): hông (28.5, 58) ↗ gối (20, 48) ↘ bàn chân (14.5, 84) — bàn chân (x = 14.5) đặt LÙI RA XA THÂN hơn đầu gối (x = 20) tới 5.5 đơn vị, tạo thế chống chữ A (/ \) vững chãi, tuyệt đối không khép vào như dấu ();
       - Khi bật nhảy (duoi > 0): cả 4 chân duỗi thẳng dài xuống dưới. */
    var C_DUNG = [[[27, 41], [11, 26], [4.5, 62]], [[28.5, 58], [20, 48], [14.5, 84]]];
    var C_CO   = [[[27, 49], [10.5, 34], [4.5, 58]], [[28.5, 65], [19.5, 54], [14, 80]]];
    var C_DUOI = [[[27, 37], [14, 53], [9.5, 79]], [[28.5, 55], [21, 70], [18, 92]]];
    var C_NEN  = [[[27, 45], [10.5, 30], [4.5, 60]], [[28.5, 61], [19.5, 51], [14, 82]]];
    var base = co ? C_CO : C_DUNG;
    var CHAN = base.map(function (c, i) {
      if (duoi > 0) return [noi(c[0], C_DUOI[i][0], duoi), noi(c[1], C_DUOI[i][1], duoi), noi(c[2], C_DUOI[i][2], duoi)];
      if (nen > 0) return [noi(c[0], C_NEN[i][0], nen), noi(c[1], C_NEN[i][1], nen), noi(c[2], C_NEN[i][2], nen)];
      return c;
    });
    function veCapChan(i) {
      var c = CHAN[i];
      [-1, 1].forEach(function (k) {
        var x = function (v) { return 50 + k * (v - 50); }, cap = (k < 0) === (i === 1) ? dg.A : dg.B, o = cap.o * kb * 0.45 * (1 - duoi);
        chan(g, H, [x(c[0][0]), c[0][1]], [x(c[1][0]) + u[0] * o * 0.55, c[1][1] + u[1] * o * 0.55], [x(c[2][0]) + u[0] * o, c[2][1] + u[1] * o], cap.n * kb * (1 - duoi), co, duoi);
      });
    }
    /* 1. Vẽ cặp chân xa (i = 0) và cặp chân gần (i = 1) */
    veCapChan(0);
    veCapChan(1);
    /* 2. Vẽ THÂN CHUẨN R1 (tỉ lệ vuông bo tròn chuẩn của Thân A: w = 48, h = 46, r = 16, đường ghép cong, vệt sáng, kính + 2 mắt, ăng-ten) */
    var z = 1 + 0.04 * dg.nhun * kb, dy = -4.5 * duoi + 3.5 * nen;
    g.save(); g.translate(50, 56 + dy); g.scale(z, z); g.translate(-50, -56);
    if (co) {
      /* khi cúi: thân chuẩn R1 hạ thấp xuống (+9 đơn vị theo +y) nằm gọn giữa 4 chân đang co */
      H.bo(g, 26, 34, 48, 45, 15.5); g.fillStyle = H.gradVo(g, 26, 34, 48, 45); g.fill(); H.vien(g, BM.vecVien, 3.5);
      H.duong(g, 'M36 40 C34 48 34 55 36 62 M64 40 C66 48 66 55 64 62 M50 34 v9'); H.vien(g, BM.vecVoGhep, 2.5);
      H.duong(g, 'M34 42 C36 38 41 37 47 37'); H.vien(g, BM.vecVo, 3.6);
      H.kinh(g, M, 31, 59, 38, 14, s);
      H.angTen(g, M, 50, 35, 24, 4.6);
    } else {
      /* khi đứng: thân chuẩn R1 (w = 48, h = 46, r = 16, r/h ≈ 0.348 đúng chuẩn R1) nâng cao trên 4 chân */
      H.bo(g, 26, 25, 48, 46, 16); g.fillStyle = H.gradVo(g, 26, 25, 48, 46); g.fill(); H.vien(g, BM.vecVien, 3.5);
      H.duong(g, 'M36 32 C34 40 34 48 36 55 M64 32 C66 40 66 48 64 55 M50 25 v10'); H.vien(g, BM.vecVoGhep, 2.5);
      H.duong(g, 'M34 33 C36 29 41 28 47 28'); H.vien(g, BM.vecVo, 4);
      H.kinh(g, M, 31, 51, 38, 14.5, s);
      H.angTen(g, M, 50, 26, 15, 5);
    }
    g.restore();
  } });
})(typeof window !== 'undefined' ? window : globalThis);
