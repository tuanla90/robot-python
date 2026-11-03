var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-cau.js — THÂN CẦN CẨU CONTAINER 'cau' (Cảng sông, mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.2, 3.5, 4) + HÀM VẼ CẦN CẨU trên sân.
   THÂN (vẽ trong ô bệ, quay mặt XUỐNG, tâm (50, 56) như mọi thân): chân đế bốn chân chống thủy lực chéo (đệm vàng), mâm quay bánh răng thép, đối trọng sọc vàng ở đuôi,
   cabin vỏ trắng chuẩn gia đình thân R1 (kính + mắt màu đội + ăng-ten + vệt sáng) giữa mâm, chốt chân cần ở mép trước mâm và một ĐOẠN CẦN ngắn trước mặt.
   Trạng thái s: ray (nâng cấp chạy trên ray: hai giá bánh ray; true / 'doc' = giá dọc theo thân, 'ngang' = giá ngang), coCan (ẩn đoạn cần ngắn:
   veCanCau đã vẽ cần thật), mat (mắt biểu cảm).
   hamGoc: swing_left, swing_right, extend, retract, wait (gốc gói 1) + rail (nâng cấp gói 5). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var NAC = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  V.NAC_CAU = NAC;

  /** Giàn cần nằm dọc trục +x từ 0 tới L, bề ngang w (đang ở hệ đã xoay). */
  function gianCan(g, H, L, w) {
    var i, n = Math.max(2, Math.round(L / (w * 0.9)));
    H.bo(g, -w * 0.35, -w / 2, L + w * 0.35, w, w * 0.28);
    g.fillStyle = H.gradDoc(g, 0, -w / 2, 0, w / 2, [[0, BM.vecVangSang], [0.5, BM.vecVang], [1, BM.vecVangToi]]); g.fill();
    H.vien(g, BM.vecVien, Math.max(1.1, w * 0.16));
    /* lòng rãnh giàn thép tối làm nổi các thanh giằng chéo */
    H.bo(g, 0, -w * 0.3, Math.max(1, L - w * 0.15), w * 0.6, w * 0.12); H.to(g, BM.vecThepToi);
    g.beginPath(); g.moveTo(0, -w * 0.28);
    for (i = 1; i <= n; i++) g.lineTo(L * i / n, i % 2 ? w * 0.28 : -w * 0.28);
    H.vien(g, BM.vecVang, Math.max(0.9, w * 0.12));
    g.beginPath(); g.moveTo(0, -w * 0.3); g.lineTo(L, -w * 0.3); g.moveTo(0, w * 0.3); g.lineTo(L, w * 0.3);
    H.vien(g, BM.vecVangSang, Math.max(0.7, w * 0.07));
  }

  /* -------- thân: chân đế (không quay trên sân) + phần trên (quay theo nấc) */
  function veDe(g, s, H) {
    s = s || {};
    var i;
    if (s.ray) {
      var ngang = s.ray === 'ngang';
      (ngang ? [[24, 5, 52, 13], [24, 92, 52, 13]] : [[5, 30, 13, 52], [82, 30, 13, 52]]).forEach(function (b) {
        H.bo(g, b[0], b[1], b[2], b[3], 4); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2.2);
        for (i = 0; i < 2; i++) {
          var cx = ngang ? b[0] + 13 + i * 26 : b[0] + b[2] / 2, cy = ngang ? b[1] + b[3] / 2 : b[1] + 13 + i * 26;
          H.tron(g, cx, cy, 4.6); H.to(g, BM.vecBanhGach); H.vien(g, BM.vecVien, 1.6);
          H.tron(g, cx, cy, 1.8); H.to(g, BM.vecBac);
        }
      });
    }
    /* bốn chân chống thủy lực chữ X + bàn đạp chân đế vàng cảnh báo */
    [[15, 23], [85, 23], [15, 89], [85, 89]].forEach(function (p) {
      g.beginPath(); g.moveTo(50, 56); g.lineTo(p[0], p[1]);
      H.vien(g, BM.vecVien, 9.5); H.vien(g, BM.vecThepToi, 5.8);
      g.beginPath(); g.moveTo((50 + p[0]) / 2, (56 + p[1]) / 2); g.lineTo(p[0], p[1]);
      H.vien(g, BM.vecSat, 3.2);
      H.bo(g, p[0] - 6.5, p[1] - 6.5, 13, 13, 3.5); H.to(g, BM.vecCanhBao); H.vien(g, BM.vecVien, 2.2);
      H.tron(g, p[0], p[1], 2.6); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 1.2);
    });
    /* bệ khung gầm vuông thép tối */
    H.bo(g, 25, 31, 50, 50, 10); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2.6);
    [[30, 36], [70, 36], [30, 76], [70, 76]].forEach(function (p) { H.tron(g, p[0], p[1], 1.6); H.to(g, BM.vecDinh); });
  }

  function veTren(g, s, M, H) {
    s = s || {};
    var i, a;
    /* mâm quay thép lớn + vành răng xoay */
    H.tron(g, 50, 56, 29.5); g.fillStyle = H.gradDoc(g, 0, 26, 0, 86, [[0, BM.vecThepSang], [1, BM.vecThep]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.tron(g, 50, 56, 24.5); H.to(g, BM.vecDe); H.vien(g, BM.vecThepToi, 1.5);
    g.beginPath();
    for (i = 0; i < 12; i++) {
      a = i * Math.PI / 6;
      g.moveTo(50 + Math.cos(a) * 24.5, 56 + Math.sin(a) * 24.5);
      g.lineTo(50 + Math.cos(a) * 28.5, 56 + Math.sin(a) * 28.5);
    }
    H.vien(g, BM.vecThepToi, 1.6);
    /* khối đối trọng thép đen sọc vàng cảnh báo ở đuôi mâm */
    H.bo(g, 29, 21.5, 42, 13.5, 4.5); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2.6);
    g.beginPath();
    g.moveTo(35, 33); g.lineTo(41, 23.5);
    g.moveTo(44, 33); g.lineTo(50, 23.5);
    g.moveTo(53, 33); g.lineTo(59, 23.5);
    g.moveTo(62, 33); g.lineTo(67, 25);
    H.vien(g, BM.vecCanhBao, 3, 'butt');
    /* cabin chuẩn gia đình R1: vỏ trắng bo góc tròn đầy đặn (42 × 40, r = 14), đường ghép tím nhạt + vệt sáng trắng */
    H.bo(g, 29, 34, 42, 39, 14); g.fillStyle = H.gradVo(g, 29, 34, 42, 39); g.fill(); H.vien(g, BM.vecVien, 3.2);
    H.duong(g, 'M38 40 C36.5 47 36.5 53 38 60 M62 40 C63.5 47 63.5 53 62 60 M50 34 v8'); H.vien(g, BM.vecVoGhep, 2.2);
    H.duong(g, 'M36 41 C38.5 37 42.5 36.5 47.5 36.5'); H.vien(g, BM.vecVo, 3.4);
    H.kinh(g, M, 33, 50, 34, 13, s);
    H.angTen(g, M, 50, 35, 24, 4.2);
    /* gối đỡ + đoạn cần ngắn trước mặt + chốt trục */
    H.bo(g, 42, 72.5, 16, 8.5, 3); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);
    if (!s.coCan) { g.save(); g.translate(50, 79); g.rotate(Math.PI / 2); gianCan(g, H, 13, 12.5); g.restore(); }
    H.tron(g, 50, 79, 5.2); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 79, 2.1); H.to(g, BM.vecSat);
  }

  V.dangKy({
    loai: 'than', ma: 'cau', hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'rail'], ten: 'Thân cần cẩu container',
    oGan: { tay: { x: 50, y: 86 }, hongTrai: { x: 70, y: 54 }, hongPhai: { x: 30, y: 54 }, tren: { x: 66, y: 72 }, sau: { x: 50, y: 25 }, bung: { x: 50, y: 72 } },   // M9B2: ổ bung ở mép dưới vỏ, sát gốc cần (camera bụng L13 vẽ tạm theo ổ; hình ở đầu cần là gói hình sau)
    oCam: { x: 58, y: 36 }, vo: { x: 29, y: 34, w: 42, h: 39 },
    ve: function (g, s, M, H) { veDe(g, s, H); veTren(g, s, M, H); }
  });
  V.veDeCau = veDe; V.veTrenCau = veTren;

  function gocNac(nac) { return (((+nac || 0) % 8) + 8) % 8 * Math.PI / 4; }      // 0 = lên, tăng theo chiều kim đồng hồ
  /** Véc-tơ (ô) tới đầu cần ở nấc (cho phép lẻ: nội suy theo góc, độ dài như nấc gần nhất chéo / thẳng để quay mượt mà đầu cần vẫn đi qua tâm ô ở nấc nguyên). */
  function vecNac(nac) {
    var n = (((+nac || 0) % 8) + 8) % 8, a = Math.floor(n), b = (a + 1) % 8, t = n - a;
    var A = NAC[a], B = NAC[b];
    if (t === 0) return { x: A[0], y: A[1] };
    var la = Math.hypot(A[0], A[1]), lb = Math.hypot(B[0], B[1]), L = la + (lb - la) * t, ang = gocNac(n);
    return { x: Math.sin(ang) * L, y: -Math.cos(ang) * L };
  }

  function veBeCau(g, o) {
    o = o || {};
    var H = V.H, cfg = o.cfg || { than: 'cau' }, st = o.st || {}, c = o.o > 0 ? o.o : 48, k = c / 100 * V.CO_THAN, M = V.mauDoi(cfg.son), than = V.lay('than', 'cau');
    var sT = Object.assign({}, st.than || {}, { coCan: true, ray: o.ray || (st.than && st.than.ray) || false }), A = gocNac(o.nac) + Math.PI;
    g.save(); g.translate(o.bx, o.by); g.scale(k, k);
    H.elip(g, 2, 5, 36, 34); H.to(g, H.rgba(BM.vecVienRgb, 0.12));
    g.translate(-V.TAM_THAN.x, -V.TAM_THAN.y);
    veDe(g, sT, H);
    g.translate(V.TAM_THAN.x, V.TAM_THAN.y); g.rotate(A); g.translate(-V.TAM_THAN.x, -V.TAM_THAN.y);
    veTren(g, sT, M, H);
    var tay = cfg.tay ? V.lay('tay', cfg.tay) : null;
    if (tay && tay.diemNeo) { g.save(); g.translate(than.oGan.tay.x - tay.diemNeo.x, than.oGan.tay.y - tay.diemNeo.y); tay.ve(g, Object.assign({}, st.tay || {}, { than: 'cau', trenCan: true }), M, H); g.restore(); }
    V.doiCam(cfg.camBien).forEach(function (cb) {
      var d = V.lay('cam-bien', cb.ma), p = than.oGan[cb.o]; if (!d || !p) return;
      g.save(); g.translate(p.x - d.diemNeo.x, p.y - d.diemNeo.y);
      d.ve(g, Object.assign({}, st.camBien || {}, { ben: cb.o === 'hongTrai' ? 'trai' : cb.o === 'hongPhai' ? 'phai' : null, o: cb.o, ra: p.x >= 50 ? 1 : -1, than: 'cau' }), M, H);
      g.restore();
    });
    g.restore();
  }
  V.veBeCau = veBeCau;

  function veCanCau(g, o) {
    o = o || {};
    var H = V.H, c = o.o > 0 ? o.o : 48, tam = typeof o.tam === 'number' ? o.tam : 1, v = vecNac(o.nac), bx = +o.bx, by = +o.by;
    var tx = bx + v.x * tam * c, ty = by + v.y * tam * c, A = gocNac(o.nac) + Math.PI, k = c / 100 * V.CO_THAN;
    var rx = bx + (-(80 - 56) * Math.sin(A)) * k, ry = by + ((80 - 56) * Math.cos(A)) * k;   // chân cần (chốt trên mâm)
    var treo = (o.treo || []).filter(Boolean).slice(0, 2);
    if (o.be) veBeCau(g, o);
    g.save();
    g.translate(rx, ry); g.rotate(Math.atan2(ty - ry, tx - rx));
    var L = Math.hypot(tx - rx, ty - ry), w = c * 0.15;
    gianCan(g, H, L, w);
    H.tron(g, L, 0, w * 0.64); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, Math.max(1, w * 0.14));                                                   // ròng rọc đầu cần
    H.tron(g, L, 0, w * 0.25); H.to(g, BM.vecCanhBao);
    g.restore();
    H.tron(g, rx, ry, c * 0.06); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, Math.max(1, c * 0.02));
    if (treo.length) {
      var ng = typeof o.nang === 'number' ? Math.max(0, Math.min(1, o.nang)) : 1;                                                                   // gói nối 31/10: 0 = vừa chạm sàn (cỡ 86 % ô, bóng sát) … 1 = treo (112 %, bóng xa)
      var s = c * (0.86 + 0.26 * ng), x0 = tx - s / 2, y0 = ty - s / 2;
      if (o.bong !== false) { H.bo(g, x0 + s * 0.06 + c * (0.02 + 0.08 * ng), y0 + s * 0.21 + c * (0.03 + 0.1 * ng), s * 0.88, s * 0.58, c * 0.05); H.to(g, H.rgba(BM.vecBongRgb, 0.28)); }
      g.save(); g.translate(x0, y0); g.scale(s / 100, s / 100);
      if (treo.length > 1) V.veChongCont(g, H, treo, o.stCont); else V.veContainer(g, H, 6, 21, 88, 58, treo[0].so, Object.assign({ tan: treo[0].tan }, o.stCont || {}));
      g.restore();
      g.beginPath(); g.rect(x0 + s * 0.04, y0 + s * 0.17, s * 0.92, s * 0.66); H.vien(g, BM.vecVien, Math.max(1, c * 0.025));                     // khung kẹp (spreader) ôm nóc
      if (V.veMocCau) V.veMocCau(g, tx, y0 + s * 0.17, c * 0.09, !!o.doi);
    } else {
      var hy = ty + c * 0.1;
      if (o.bong !== false) { H.elip(g, tx + c * 0.1, hy + c * 0.13, c * 0.1, c * 0.06); H.to(g, H.rgba(BM.vecBongRgb, 0.25)); }
      g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx, hy); H.vien(g, BM.vecVien, Math.max(1.4, c * 0.035)); H.vien(g, BM.vecBacToi, Math.max(0.8, c * 0.015));
      if (V.veMocCau) V.veMocCau(g, tx, hy, c * 0.14, !!o.doi);
    }
    return { tx: tx, ty: ty };
  }
  V.veCanCau = veCanCau;
})(typeof window !== 'undefined' ? window : globalThis);
