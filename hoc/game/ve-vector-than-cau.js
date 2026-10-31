var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-cau.js — THÂN CẦN CẨU CONTAINER 'cau' (Cảng sông, mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.2, 3.5, 4) + HÀM VẼ CẦN CẨU trên sân.
   THÂN (vẽ trong ô bệ, quay mặt XUỐNG, tâm (50, 56) như mọi thân): chân đế bốn chân chống chéo (đệm vàng), mâm quay thép, đối trọng sọc vàng ở đuôi, cabin vỏ trắng
   gia đình thân A (kính + mắt màu đội + ăng-ten) giữa mâm, chốt chân cần ở mép trước mâm và một ĐOẠN CẦN ngắn trước mặt (để thẻ part / Lắp robot đọc ra "cần cẩu"; trên sân cần thật do
   VeVector.veCanCau vẽ). Trạng thái s: ray (nâng cấp chạy trên ray: hai giá bánh ray; true / 'doc' = giá dọc theo thân, 'ngang' = giá ngang), coCan (ẩn đoạn cần ngắn:
   veCanCau đã vẽ cần thật), mat (mắt biểu cảm).
   hamGoc: swing_left, swing_right, extend, retract, wait (gốc gói 1) + rail (nâng cấp gói 5).

   HÀM VẼ CHO san-ve.js (gói nối lõi), toạ độ PIXEL SÂN:
     VeVector.veCanCau(g, { bx, by, nac, tam, o, treo, doi, be, cfg, st, ray, bong })  → { tx, ty } tâm ô đầu cần (px)
       bx, by   tâm ô BỆ (px);  o  cạnh ô (px);  nac 0–7 (0 lên, 1 lên-phải, 2 phải, 3 xuống-phải, 4 xuống, 5 xuống-trái, 6 trái, 7 lên-trái; số lẻ / vượt 8 lấy mod 8;
                 nấc chéo đi chéo ô: đầu cần ở bệ + tam × (±1, ±1) ô);  tam 1–3 (cho phép số lẻ, vd 1,5, để hoạt cảnh vươn / thu mượt; nac cũng được lẻ khi quay mượt).
       treo     mảng container đang treo [{ so, tan? }] đáy → đỉnh (0, 1 hay 2 cái); trống = chỉ cáp + móc.
       doi      móc đôi (nâng cấp nhấc đôi): khung móc hai móc.
       be       true: vẽ luôn BỆ (chân đế đứng yên theo màn hình, mâm + cabin + tay + cảm biến quay theo nac) bằng VeVector.veBeCau; false: người gọi tự vẽ bệ (vd VeRobot).
       cfg, st  cấu hình robot { than: 'cau', tay, camBien, son } và trạng thái { than: { mat }, tay: {…}, camBien: { bat, can } } như VeVector.robot (chỉ dùng khi be).
       ray      'ngang' | 'doc' | false: giá bánh ray dưới chân đế (chỉ khi be).
       bong     false: không vẽ bóng đổ của container treo / móc (mặc định có).
       Thứ tự vẽ: [bệ] → cần (giàn vàng) → bóng đổ → container treo (to hơn 12%, gần camera hơn) / cáp + móc. Gọi SAU khi vẽ vật trên sân (cần cao hơn mọi thứ).
     VeVector.veBeCau(g, { bx, by, o, nac, cfg, st, ray })  bệ riêng (chân đế không quay, phần trên quay theo nac, cùng cỡ thu CO_THAN như robot).
     VeVector.NAC_CAU = [[dx, dy] × 8]  véc-tơ ô của từng nấc. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var NAC = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  V.NAC_CAU = NAC;

  /** Giàn cần nằm dọc trục +x từ 0 tới L, bề ngang w (đang ở hệ đã xoay). */
  function gianCan(g, H, L, w) {
    var i, n = Math.max(2, Math.round(L / w));
    H.bo(g, -w * 0.35, -w / 2, L + w * 0.35, w, w * 0.3); g.fillStyle = H.gradDoc(g, 0, -w / 2, 0, w / 2, [[0, BM.vecVangSang], [0.5, BM.vecVang], [1, BM.vecVangToi]]); g.fill();
    H.vien(g, BM.vecVien, Math.max(1, w * 0.16));
    g.beginPath(); g.moveTo(0, -w * 0.28);
    for (i = 1; i <= n; i++) g.lineTo(L * i / n, i % 2 ? w * 0.28 : -w * 0.28);
    H.vien(g, BM.vecVangToi, Math.max(0.8, w * 0.1));
    g.beginPath(); g.moveTo(0, -w * 0.28); g.lineTo(L, -w * 0.28); g.moveTo(0, w * 0.28); g.lineTo(L, w * 0.28); H.vien(g, BM.vecVangToi, Math.max(0.6, w * 0.06));
  }

  /* -------- thân: chân đế (không quay trên sân) + phần trên (quay theo nấc) */
  function veDe(g, s, H) {
    s = s || {};
    [[16, 24], [84, 24], [16, 90], [84, 90]].forEach(function (p) {
      g.beginPath(); g.moveTo(50, 56); g.lineTo(p[0], p[1]); H.vien(g, BM.vecVien, 9); H.vien(g, BM.vecThep, 5);
      H.bo(g, p[0] - 6, p[1] - 6, 12, 12, 3); H.to(g, BM.vecCanhBao); H.vien(g, BM.vecVien, 2);
    });
    H.bo(g, 27, 33, 46, 46, 8); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2.5);
    if (s.ray) {
      var ngang = s.ray === 'ngang', i;
      (ngang ? [[30, 6, 40, 13], [30, 93, 40, 13]] : [[6, 36, 13, 40], [81, 36, 13, 40]]).forEach(function (b) {
        H.bo(g, b[0], b[1], b[2], b[3], 4); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2);
        for (i = 0; i < 2; i++) {
          var cx = ngang ? b[0] + 10 + i * 20 : b[0] + b[2] / 2, cy = ngang ? b[1] + b[3] / 2 : b[1] + 10 + i * 20;
          H.tron(g, cx, cy, 4.2); H.to(g, BM.vecBanhGach); H.vien(g, BM.vecBacToi, 1.5);
        }
      });
    }
  }
  function veTren(g, s, M, H) {
    s = s || {};
    H.tron(g, 50, 56, 29); g.fillStyle = H.gradDoc(g, 0, 27, 0, 85, [[0, BM.vecThepSang], [1, BM.vecThep]]); g.fill(); H.vien(g, BM.vecVien, 3);   // mâm quay
    H.tron(g, 50, 56, 23); H.vien(g, BM.vecThepToi, 1.5);
    H.bo(g, 31, 24, 38, 13, 4); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2.5);                                                                      // đối trọng
    g.beginPath(); g.moveTo(38, 35); g.lineTo(44, 26); g.moveTo(48, 35); g.lineTo(54, 26); g.moveTo(58, 35); g.lineTo(64, 26); H.vien(g, BM.vecCanhBao, 3, 'butt');
    H.bo(g, 32, 38, 36, 36, 10); g.fillStyle = H.gradVo(g, 32, 38, 36, 36); g.fill(); H.vien(g, BM.vecVien, 3);                                      // cabin giữa mâm
    H.duong(g, 'M39 43 C38 45 38 47 38 48 M61 43 C62 45 62 47 62 48 M40 66 H60'); H.vien(g, BM.vecVoGhep, 2);
    H.kinh(g, M, 35, 50, 30, 11, s);
    H.angTen(g, M, 50, 39, 31, 3.8);
    if (!s.coCan) { g.save(); g.translate(50, 80); g.rotate(Math.PI / 2); gianCan(g, H, 14, 13); g.restore(); }                                    // đoạn cần ngắn trước mặt
    H.tron(g, 50, 80, 5.5); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);                                                                        // chốt chân cần
  }
  V.dangKy({
    loai: 'than', ma: 'cau', hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'rail'], ten: 'Thân cần cẩu container',
    oGan: { tay: { x: 50, y: 90 }, hongTrai: { x: 68, y: 56 }, hongPhai: { x: 32, y: 56 }, tren: { x: 63, y: 72 }, sau: { x: 50, y: 26 } },
    oCam: { x: 58, y: 39 }, vo: { x: 32, y: 38, w: 36, h: 36 },
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
    H.tron(g, L, 0, w * 0.62); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, Math.max(1, w * 0.14));                                                   // ròng rọc đầu cần
    g.restore();
    H.tron(g, rx, ry, c * 0.06); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, Math.max(1, c * 0.02));
    if (treo.length) {
      var s = c * 1.12, x0 = tx - s / 2, y0 = ty - s / 2;
      if (o.bong !== false) { H.bo(g, x0 + s * 0.06 + c * 0.1, y0 + s * 0.21 + c * 0.13, s * 0.88, s * 0.58, c * 0.05); H.to(g, H.rgba(BM.vecBongRgb, 0.28)); }
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
