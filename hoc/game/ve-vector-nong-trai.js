var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-nong-trai.js — VỎ NÔNG TRẠI HOA của mùa 4 (30/10, user: "Đổi sang nông nghiệp"; luật giữ nguyên, chỉ đổi hình): sân cỏ, luống hoa, bụi cây, bao hạt, bông hoa.
   Màn mùa 4 mang man.vo = 'nong-trai' (lo-trinh-hoc.js); san-ve.js đọc cfg.vo: ô sàn '.' → 'co-non', sàn màu r g b y → 'luong-hoa', tường # → 'bui-cay',
   vật có màu → 'bao-hat'. Bông hoa (V.hoa) dùng chung cho ô đã gieo của bộ gieo hạt (tay 'son', ve-vector-hieu-ung.js hoaDa / hoaCan) ở mọi màn.
   Bốn màu luật là bốn loài: đỏ = hoa hồng, vàng = hoa cúc, xanh dương = cẩm tú cầu (năm cánh tròn), xanh lá = cỏ ba lá (ba lá tròn, không có nhụy).
   Hệ 100 × 100 một ô như ve-vector-o*.js; mỗi hình khai cacTrangThai cho máy kiểm hoc/kiem-ve-vector.mjs. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  if (typeof module === 'object' && !(root.VeVector && root.VeVector.dauHinhMau)) require('./ve-vector-o2.js');
  var MAU = ['red', 'green', 'blue', 'yellow'];
  var CANH = { red: ['luatSonDo', 'luatSonDoSang', 'luatSonDoToi'], blue: ['luatSonXanhDuong', 'luatSonXanhDuongSang', 'luatSonXanhDuongToi'], yellow: ['luatSonVang', 'luatSonVangSang', 'luatSonVangToi'] };
  function nenLuoi(g) { g.fillStyle = BM.vecCoVien; g.fillRect(0, 0, 100, 100); }

  /** Một bông hoa tâm (cx, cy), bán kính r (hệ 100 một ô), loài theo màu luật `mau`; xanh lá là cỏ ba lá. */
  function hoa(g, H, cx, cy, r, mau) {
    var i, a;
    if (mau === 'green') {
      H.duong(g, 'M' + cx + ' ' + (cy + r * 0.2) + ' C' + (cx + r * 0.25) + ' ' + (cy + r * 0.5) + ' ' + (cx + r * 0.25) + ' ' + (cy + r * 0.8) + ' ' + (cx + r * 0.1) + ' ' + (cy + r)); H.vien(g, BM.vecLaToi, Math.max(1.5, r * 0.14));
      for (i = 0; i < 3; i++) { a = -Math.PI / 2 + i * 2 * Math.PI / 3; H.tron(g, cx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42, r * 0.44); H.to(g, BM.vecLa); H.vien(g, BM.vecLaToi, Math.max(1.2, r * 0.1)); }
      H.tron(g, cx, cy, r * 0.12); H.to(g, BM.vecLaToi);
      return;
    }
    var c = CANH[mau] || CANH.red, cs = BM[c[0]], sang = BM[c[1]], toi = BM[c[2]];
    var so = mau === 'yellow' ? 8 : 5, rc = mau === 'yellow' ? r * 0.3 : r * 0.42, xa = mau === 'yellow' ? r * 0.6 : r * 0.52;
    for (i = 0; i < so; i++) {
      a = -Math.PI / 2 + i * 2 * Math.PI / so;
      H.tron(g, cx + Math.cos(a) * xa, cy + Math.sin(a) * xa, rc); g.fillStyle = H.gradDoc(g, 0, cy - r, 0, cy + r, [[0, sang], [1, cs]]); g.fill(); H.vien(g, toi, Math.max(1, r * 0.09));
    }
    H.tron(g, cx, cy, r * 0.3); H.to(g, mau === 'yellow' ? BM.vecDatToi : BM.vecNhuy); H.vien(g, mau === 'yellow' ? BM.vecBaoVien : BM.vecNhuyToi, Math.max(1, r * 0.08));
  }
  V.hoa = hoa;
  V.LOAI_HOA = { red: 'hoa hồng', yellow: 'hoa cúc', blue: 'cẩm tú cầu', green: 'cỏ ba lá' };

  /* Ô CỎ (sàn '.' của nông trại): tấm cỏ bo góc hai tông bàn cờ như sàn lab, vài ngọn cỏ. */
  V.dangKy({ loai: 'o', ma: 'co-non', ten: 'Cỏ nông trại', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    nenLuoi(g);
    H.bo(g, 3, 3, 94, 94, 6); g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecCoLe], [1, BM.vecCoLeToi]] : [[0, BM.vecCo], [1, BM.vecCoToi]]); g.fill();
    H.duong(g, le ? 'M24 70 L27 60 M30 72 L31 62 M68 34 L70 25 M74 36 L76 27' : 'M22 34 L24 25 M28 36 L30 27 M66 74 L68 64 M72 75 L74 66'); H.vien(g, BM.vecCoVien, 3);
  } });

  /* LUỐNG HOA (sàn màu r g b y của nông trại): luống đất nâu hai rãnh, ba bông nhỏ đúng loài màu luật, dấu hình màu ở góc dưới phải (cho người mù màu, như sàn màu). */
  V.dangKy({ loai: 'o', ma: 'luong-hoa', ten: 'Luống hoa', cacTrangThai: MAU.map(function (m) { return { mau: m }; }), ve: function (g, s, H) {
    var m = MAU.indexOf(s && s.mau) >= 0 ? s.mau : 'red';
    nenLuoi(g);
    H.bo(g, 3, 3, 94, 94, 8); g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, [[0, BM.vecDatSang], [1, BM.vecDat]]); g.fill(); H.vien(g, BM.vecDatToi, 3);
    H.duong(g, 'M12 36 H88 M12 64 H88'); H.vien(g, BM.vecDatToi, 3);
    hoa(g, H, 28, 26, 15, m); hoa(g, H, 64, 30, 15, m); hoa(g, H, 34, 66, 15, m);
    V.dauHinhMau(g, H, m, 74, 74, 10);
  } });

  /* BỤI CÂY (tường # của nông trại): bụi cây xanh tròn ba cụm, vệt sáng lá. */
  V.dangKy({ loai: 'o', ma: 'bui-cay', ten: 'Bụi cây', cacTrangThai: [{}], ve: function (g, s, H) {
    nenLuoi(g);
    H.bo(g, 2, 2, 96, 96, 14); H.to(g, BM.vecLaToi);
    [[34, 36, 26], [66, 38, 26], [50, 66, 30]].forEach(function (q) { H.tron(g, q[0], q[1], q[2]); g.fillStyle = H.gradDoc(g, 0, q[1] - q[2], 0, q[1] + q[2], [[0, BM.vecLa], [1, BM.vecLaToi]]); g.fill(); });
    [[28, 28], [62, 30], [44, 58], [60, 70], [74, 46]].forEach(function (q) { H.elip(g, q[0], q[1], 5, 2.6); H.to(g, BM.vecCo); });
  } });

  /* Ô ĐÃ GIEO (phim gói mùa 4; trên sân chơi ve-vector-hieu-ung.js hoaDa vẽ thẳng): một bông hoa đúng loài giữa ô, nền trong suốt (đặt chồng lên ô sàn). */
  V.dangKy({ loai: 'o', ma: 'o-hoa', ten: 'Ô đã gieo hoa', phu: true, cacTrangThai: MAU.map(function (m) { return { mau: m }; }), ve: function (g, s, H) {
    hoa(g, H, 50, 50, 34, MAU.indexOf(s && s.mau) >= 0 ? s.mau : 'red');
  } });

  /* BAO HẠT GIỐNG (vật có màu ở nông trại; luật như hộp màu): bao giấy kraft buộc dây ở cổ, in bông hoa đúng loài màu luật; s.sat: bao có móc sắt
     trên cổ (vật chất sắt, nam châm hút được). Thân trong hộp 12..88 như vật nhỏ khác. */
  V.dangKy({ loai: 'vat', ma: 'bao-hat', ten: 'Bao hạt giống', cacTrangThai: MAU.map(function (m) { return { mau: m }; }).concat([{ mau: 'red', sat: true }]), ve: function (g, s, H) {
    var m = MAU.indexOf(s && s.mau) >= 0 ? s.mau : 'red';
    H.duong(g, 'M30 30 C22 44 16 62 18 80 C20 88 80 88 82 80 C84 62 78 44 70 30 Z'); g.fillStyle = H.gradDoc(g, 0, 30, 0, 88, [[0, BM.vecBao], [1, BM.vecBaoToi]]); g.fill(); H.vien(g, BM.vecBaoVien, 3);
    H.duong(g, 'M30 30 L36 18 H64 L70 30'); H.to(g, BM.vecBaoToi); H.vien(g, BM.vecBaoVien, 3);
    H.duong(g, 'M31 30 H69'); H.vien(g, BM.vecBaoVien, 4);
    if (s && s.sat) { H.bo(g, 42, 12, 16, 9, 3); H.to(g, BM.vecSat); H.vien(g, BM.vecVien, 2); }
    H.tron(g, 50, 60, 17); H.to(g, BM.vecVo); H.vien(g, BM.vecBaoToi, 2);
    hoa(g, H, 50, 60, 13, m);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
