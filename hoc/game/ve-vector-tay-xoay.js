var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-xoay.js — TAY XOAY CÓ KHỚP TRÒN vector (gói V3, mã 'xoay'; arm_left / arm_right + bốn lệnh tay kẹp).
   Gói V8b (user 29/10: "các part có nâng cấp đều dùng chung 1 hình ảnh nhưng tay kẹp và tay kẹp có cần xoay đang dùng 2 hình khác nhau"): tay xoay = TAY KẸP
   gắn trên KHỚP TRÒN. Vẽ bằng đúng hàm của tay kẹp (VeVector.lay('tay', 'kep').dungChung: hai càng cong viền chàm lõi bạc, cụm giữa trắng bo tròn, màu đèn), cái khác
   duy nhất: khớp tròn (vành bạc) ở KHOP (50, 84) hệ của tay, đèn của tay kẹp nằm giữa khớp (nâng cyan / hạ cam, như chấm đèn tay kẹp; bỏ nắp xanh lá / hổ phách cũ).
   Ở nấc trước tay xoay trùng tay kẹp (cụm giữa quanh khớp, gốc càng ở (50 ± 12, 84)); quay sang ngang thì cả đầu kẹp trượt ra theo cần bạc (đoạn r = (L1 − L0)·|sin góc|).
   Cánh tay quay quanh khớp theo góc liên tục s.goc (độ: 0 = trước, âm = trái xe, dương = phải xe) hoặc nấc s.xoay ('trai' | 'truoc' | 'phai').
   LUẬT VƯƠN (giữ như bộ pixel: tay chỉ sang ô bên thì vật nằm cạnh hông xe): tâm vật cách khớp L(góc) = L0 + (L1 − L0)·|sin góc| + HA khi hạ; L0 = 16 (vật trước mũi
   gần chỗ tay kẹp), L1 = 46 (vật cạnh hông, ngoài bánh). Đầu càng ngang tâm vật (ôm: +2, như tay kẹp). Ở nấc trước / trái / phải càng mở vẫn trong ô; lúc xoay
   giữa chừng hay cầm vật to ở nấc ngang, càng ôm vật chờm sang ô bên / ô chéo → canvas robot có lề tràn `tran` = 0,3 ô mỗi bên (VeVector.robot), san-ve.js vẽ trên
   lớp phủ cả sân nên phần chờm vẫn hiện.
   vatXoay(tuThe, goc, k) → { x, y, canh } tâm vật trong hệ của tay (VeVector.vatXoay đổi sang { f, l, n } 1/100 ô, cùng nghĩa với VeRobot.vatXoay pixel).
   Gói V6b: vật cỡ VeVector.coVatKep(k) (hạ = vật nằm sàn, nâng 1,2 lần), k = s.nangK hay theo tuThe; càng ôm mép vật ở cỡ đó (nửa khe = nửa thân vật + 1,5, như tay kẹp).
   Gói V7a: MỞ / KHÉP DẦN: dáng càng chạy từ dáng khép (ôm vật / đóng không vật, như tay kẹp) tới dáng mở theo s.moK (0 khép … 1 mở, san-ve.js hoatVec tween cả lúc
   nhặt vật); khe mở = MO của tay kẹp ở nấc trước, thu dần về MO_NGANG ở nấc trái / phải (càng mở trong ô; nhặt ở nấc ngang thì khe nở dần ra ôm vật).
   Máy kiểm --loi-gia: _loiGia.xoayBat bỏ moK (khe bật một phát), _loiGia.kheCu giữ khe cũ (như tay kẹp). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var KHOP = { x: 50, y: 84 }, L0 = 16, L1 = 46, HA = 2, CANH = V.VAT_SAN / V.CO_THAN;
  var MO_NGANG = 20;                                  // gói V7a: nửa khe khi mở ở nấc trái / phải (càng mở phải nằm trong ô); nấc trước mở bằng tay kẹp (MO)
  /** Hàm vẽ dùng chung của tay kẹp (càng, cụm giữa, đèn): tay kẹp đăng ký trước (choi.html, lap-rap.js nạp theo tên); Node nạp lẻ thì tự nạp tay kẹp. */
  function kep() {
    var d = V.lay('tay', 'kep');
    if (!d && typeof module === 'object') { require('./ve-vector-tay-kep.js'); d = V.lay('tay', 'kep'); }
    return d.dungChung;
  }
  function gocCua(s) { return s.goc !== undefined && s.goc !== null ? +s.goc : ({ trai: -90, phai: 90 }[s.xoay] || 0); }
  /** Tâm vật cách khớp bao nhiêu theo góc; ha = phần hạ 0..1 (gói V6b: chuyển dần theo độ nâng). */
  function dai(goc, ha) { return L0 + (L1 - L0) * Math.abs(Math.sin(goc * Math.PI / 180)) + HA * (ha === true ? 1 : +ha || 0); }
  V.dangKy({ loai: 'tay', ma: 'xoay', hamGoc: ['arm_down',  'arm_up',  'grab',  'release',  'arm_left',  'arm_right'], ten: 'Tay xoay có khớp tròn', gan: 'tay', diemNeo: { x: 50, y: 80 }, tran: 0.3, khop: KHOP, vatKep: { y: KHOP.y + L0, canh: CANH, ha: HA },
    vatXoay: function (tuThe, goc, k) {
      var b = (goc || 0) * Math.PI / 180, L = dai(goc || 0, 1 - V.nangCua(tuThe, k));
      return { x: KHOP.x - L * Math.sin(b), y: KHOP.y + L * Math.cos(b), canh: CANH };       // mặt quay xuống: bên phải xe là phía x nhỏ; cạnh thân vật thật: VeVector.coVatKep(k)
    },
    ve: function (g, s, M, H) {
      s = s || {};
      var KEP = kep(), goc = gocCua(s), sn = Math.abs(Math.sin(goc * Math.PI / 180)), ha = s.tuThe === 'duoi', nk = V.nangCua(s.tuThe, s.nangK), mo = s.kep !== 'dong', om = !mo && !!s.cam;
      var L = dai(goc, 1 - nk), r = (L1 - L0) * sn, yDau = om ? L + 2 : L;                 // r: đoạn đầu kẹp trượt ra theo góc (0 ở nấc trước); đầu càng ngang tâm vật (ôm: +2 như tay kẹp)
      var t = V._loiGia.kheCu ? 15 : V.coVatKep(nk) / V.CO_THAN / 2 + 1.5;                  // nửa khe ôm vật ở cỡ hiện tại, đúng công thức tay kẹp
      var moG = KEP.MO - (KEP.MO - MO_NGANG) * sn;                                          // khe mở theo góc: trước mặt = tay kẹp, sang ngang hẹp lại cho càng trong ô
      var mk = typeof s.moK === 'number' && isFinite(s.moK) && !V._loiGia.xoayBat ? Math.max(0, Math.min(1, s.moK)) : mo ? 1 : 0;
      var a = om ? [t + 3, t + 2, t] : [14, 8, 1.5], b = [moG + 5, moG + 5, moG];         // dáng càng tay kẹp: khép (ôm vật / đóng không vật) … mở; moK chạy dần giữa hai dáng
      var c = [0, 1, 2].map(function (i) { return a[i] + (b[i] - a[i]) * mk; });
      g.save(); g.translate(KHOP.x, KHOP.y); g.rotate(goc * Math.PI / 180);            // hệ cánh tay: +y = dọc cánh tay (góc 0 = trước), xoay dương = sang phải xe (phía x nhỏ)
      if (r > 0.5) { H.duong(g, 'M0 0 V' + r); H.vien(g, BM.vecVien, 9); H.duong(g, 'M0 0 V' + r); H.vien(g, BM.vecNgon, 5); }   // cần trượt bạc (chỉ lộ khi tay quay sang ngang)
      KEP.cang(g, c[0], c[1], c[2], yDau, 0, r); H.vien(g, BM.vecVien, 9);
      KEP.cang(g, c[0], c[1], c[2], yDau, 0, r); H.vien(g, BM.vecNgon, 5);
      KEP.cum(g, H, 0, r - 6);                                                              // cụm giữa trắng của tay kẹp, tâm trùng gốc càng
      g.restore();
      /* khớp tròn (cái khác duy nhất so với tay kẹp): vành bạc quanh đèn; đèn báo nâng / hạ như chấm đèn tay kẹp (cyan / cam) */
      H.tron(g, KHOP.x, KHOP.y, 7); H.to(g, BM.vecBac); H.vien(g, BM.vecVien, 2.5);
      H.tron(g, KHOP.x, KHOP.y, 3); H.to(g, KEP.mauDen(ha));
    } });
})(typeof window !== 'undefined' ? window : globalThis);
