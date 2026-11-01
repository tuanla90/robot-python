var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-nong-trai.js — HÌNH VECTOR MÔI TRƯỜNG CỐT TRUYỆN MÙA 1–4 (30–31/10):
   Thống nhất tiêu chí khối 3D cao (mặt trên sáng y = 8..60 + vách đứng phía trước tối hơn y = 60..94 tạo độ cao 3D rõ rệt), hình vuông bo góc, ít màu sắc / ít họa tiết:
   - Mùa 4 (vo = 'nong-trai'): đường vườn cát ấm (co-non), luống hoa & cỏ ba lá tràn ô (luong-hoa), kiện rơm vàng 3D buộc 2 dây thừng (bui-cay), bông hoa vừa gieo (o-hoa), bao hạt giống (bao-hat).
   - Mùa 1 (vo = 'kho-hang'): sàn bê tông kho (san-kho), khối kiện gỗ pallet 3D cao (ke-hang), thùng carton vuông bo góc dán 1 băng keo (thung-carton).
   - Mùa 2 (vo = 'nha-may'): sàn thép công nghiệp (san-nha-may), khối máy thép 3D cao có khe gió & dải đèn cam (tuong-nha-may), hộp năng lượng 3D đai cam (pin-nha-may).
   - Mùa 3 (vo = 'bai-tai-che'): sàn bãi phế liệu (san-bai-tai-che), khối tôn thép tái chế 3D cao nẹp đai thép (tuong-bai-tai-che), hộp tôn gỉ 3D đai thép (hop-phe-lieu).
   Mọi màu lấy từ BangMau (BM.<vai>). Nạp sau ve-vector-vat.js, trước ve-vector-ky-hieu.js. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var dk = V.dangKy;
  var MAU = ['red', 'green', 'blue', 'yellow'];
  var MAU_DAI = { red: 'luatVatDo', green: 'luatVatXanhLa', blue: 'luatVatXanhDuong', yellow: 'luatVatVang' };
  var MAU_VIEN = { red: 'luatSanDoToi', green: 'luatSanXanhLaToi', blue: 'luatSanXanhDuongToi', yellow: 'luatSanVangToi' };

  /* ---- 1. MÙA 4 (NÔNG TRẠI HOA, vo = 'nong-trai'): ĐƯỜNG VƯỜN · KIỆN RƠM VÀNG 3D · THẢM HOA TRÀN Ô · BAO HẠT ---- */

  // Ô đường vườn (thay 'san' khi màn có vo === 'nong-trai'): đá lát vườn màu kem-cát ấm, có cạnh đáy 3D dịu
  dk({ loai: 'o', ma: 'co-non', ten: 'Sàn đường vườn nông trại', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    g.fillStyle = BM.vecCoVien; g.fillRect(0, 0, 100, 100);
    H.bo(g, 3, 3, 94, 94, 9); H.to(g, le ? BM.vecCoDeLe : BM.vecCoDe); H.vien(g, BM.vecCoGach, 2);
    H.bo(g, 5, 4, 90, 86, 7);
    g.fillStyle = H.gradDoc(g, 5, 4, 95, 90, le ? [[0, BM.vecCoLe], [1, BM.vecCoLeToi]] : [[0, BM.vecCo], [1, BM.vecCoToi]]);
    g.fill();
    H.duong(g, 'M15 27 L27 15'); g.globalAlpha = 0.8; H.vien(g, BM.vecThe, 4.5); g.globalAlpha = 1;
  }});

  // Bông hoa 5 cánh tròn xoay quanh (cx, cy), bán kính ngoài r; dùng cho luống hoa màu và bông hoa vừa gieo
  function veBongHoa(g, H, cx, cy, r, mauCanh, mauVien) {
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      H.tron(g, cx + Math.cos(a) * r * 0.48, cy + Math.sin(a) * r * 0.48, r * 0.46);
      H.to(g, mauCanh); H.vien(g, mauVien, 1.8);
    }
    H.tron(g, cx, cy, r * 0.34); H.to(g, BM.vecNhuy); H.vien(g, BM.vecNhuyToi, 1.5);
  }
  var CANH = { red: ['luatSonDo', 'luatSonDoSang', 'luatSonDoToi'], blue: ['luatSonXanhDuong', 'luatSonXanhDuongSang', 'luatSonXanhDuongToi'], yellow: ['luatSonVang', 'luatSonVangSang', 'luatSonVangToi'] };
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

  // Cụm cỏ ba lá mềm mại cho luống xanh lá (green)
  function veCumCoBaLaMem(g, H, cx, cy, r) {
    H.tron(g, cx, cy + 2, r * 0.95); H.to(g, BM.vecLaDam);
    for (var i = 0; i < 3; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 3;
      H.tron(g, cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45, r * 0.5);
      H.to(g, BM.vecXanhLaSang); H.vien(g, BM.vecLaDam, 1.6);
    }
    H.tron(g, cx, cy, r * 0.17); H.to(g, BM.vecLa);
  }

  // Bông hoa trắng nhỏ điểm trên thảm cỏ ba lá
  function veBongTrangNho(g, H, cx, cy, r) {
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      H.tron(g, cx + Math.cos(a) * r * 0.48, cy + Math.sin(a) * r * 0.48, r * 0.44);
      H.to(g, BM.vecThe);
    }
    H.tron(g, cx, cy, r * 0.34); H.to(g, BM.vecNhuy); H.vien(g, BM.vecNhuyToi, 1);
  }

  // Bông hoa màu trên thảm hoa đỏ / vàng / xanh dương
  function veBongHoaMauMem(g, H, cx, cy, r, bh) {
    H.tron(g, cx, cy + 2, r * 0.95); H.to(g, BM[bh.nen1]);
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / 5;
      H.tron(g, cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45, r * 0.48);
      H.to(g, BM[bh.trong]); H.vien(g, BM[bh.vien], 1.5);
    }
    H.tron(g, cx, cy, r * 0.3); H.to(g, BM[bh.nhuy]); H.vien(g, BM[bh.vien], 1.3);
  }

  var BANG_HOA = {
    red:    { nen0: 'vecHong',       nen1: 'luatVatDo',        vien: 'luatSanDoToi',        trong: 'vecLoiNhat',     nhuy: 'vecNhuy' },
    yellow: { nen0: 'vecLuaVang',    nen1: 'luatVatVang',      vien: 'luatSanVangToi',      trong: 'vecHoPhachNhat', nhuy: 'vecCamDam' },
    blue:   { nen0: 'vecHoaLamSang', nen1: 'luatVatXanhDuong', vien: 'luatSanXanhDuongToi', trong: 'vecLamNhat',     nhuy: 'vecNhuy' }
  };

  // Luống hoa trên sân (thay 'san-mau' cho ô r / g / b / y): bố cục 2x2 cân đối, chừa góc (73,73) cho ký hiệu mù màu
  dk({ loai: 'o', ma: 'luong-hoa', ten: 'Luống hoa tràn ô', cacTrangThai: MAU.map(function (m) { return { mau: m }; }), ve: function (g, s, H) {
    var m = MAU.indexOf(s && s.mau) >= 0 ? s.mau : 'red';
    g.fillStyle = BM.vecCoVien; g.fillRect(0, 0, 100, 100);
    if (m === 'green') {
      H.bo(g, 3, 3, 94, 94, 9);
      g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, [[0, BM.vecCoLaSang], [0.55, BM.vecXanhLa], [1, BM.vecLa]]);
      g.fill(); H.vien(g, BM.vecLaDam, 3);
      [[22, 22, 13], [50, 18, 12], [78, 22, 13], [18, 52, 12], [50, 50, 14], [80, 48, 12], [22, 78, 13], [50, 78, 12]].forEach(function (c) {
        H.tron(g, c[0], c[1], c[2]); H.to(g, BM.vecLa);
      });
      [[28, 28, 15], [72, 28, 15], [28, 72, 15]].forEach(function (c) {
        veCumCoBaLaMem(g, H, c[0], c[1], c[2]);
      });
      veBongTrangNho(g, H, 50, 50, 8.5);
    } else {
      var bh = BANG_HOA[m];
      H.bo(g, 3, 3, 94, 94, 9);
      g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, [[0, BM[bh.nen0]], [1, BM[bh.nen1]]]);
      g.fill(); H.vien(g, BM[bh.vien], 3);
      [[28, 28, 15.5], [72, 28, 15.5], [28, 72, 15.5]].forEach(function (c) {
        veBongHoaMauMem(g, H, c[0], c[1], c[2], bh);
      });
    }
    V.dauHinhMau(g, H, m, 73, 73, 15);
  }});

  // Tường nông trại (thay 'tuong' cho ô '#'): KIỆN RƠM VÀNG 3D BUỘC 2 DÂY THỪNG (mẫu bó rơm vuông bo góc 3D cao, 0% xanh lá)
  dk({ loai: 'o', ma: 'bui-cay', ten: 'Kiện rơm vàng nông trại', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecCoVien; g.fillRect(0, 0, 100, 100);
    // Thân kiện rơm 3D cao (vách đứng phía trước tối hơn ở y = 62..94, mặt trên vàng sáng ở y = 8..62)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecHoPhach], [0.64, BM.vecNhuyToi], [1, BM.vecHoPhachDam]]);
    g.fill(); H.vien(g, BM.vecVien, 3);

    // Mặt trên kiện rơm vàng óng (y = 8..62)
    H.bo(g, 8, 8, 84, 54, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 62, [[0, BM.vecLuaVang], [0.6, BM.vecNhuy], [1, BM.vecHoPhach]]);
    g.fill(); H.vien(g, BM.vecHoPhachDam, 2);

    // Vệt ánh sáng đỉnh kiện rơm + vài nét sợi rơm ngang tối giản
    H.bo(g, 15, 13, 70, 6, 3); H.to(g, BM.vecGoSang);
    H.duong(g, 'M15 28 H26 M42 27 H58 M74 28 H85 M16 44 H26 M43 45 H57 M74 44 H84');
    H.vien(g, BM.vecGoRanh, 2);
    H.duong(g, 'M16 74 H26 M43 75 H57 M74 74 H84');
    H.vien(g, BM.vecGoToi, 2.2);

    // Hai vòng dây thừng nâu siết dọc từ đỉnh mặt trên vòng xuống hết vách đứng phía trước (x = 28..35 và x = 65..72)
    [28, 65].forEach(function (rx) {
      H.bo(g, rx, 6, 7, 88, 3);
      g.fillStyle = H.gradDoc(g, rx, 6, rx, 94, [[0, BM.vecGoMat], [0.6, BM.vecGo], [0.68, BM.vecGoGiua], [1, BM.vecGoToi]]);
      g.fill(); H.vien(g, BM.vecGoKhe, 2);
    });
  }});

  // Ô đã gieo (thay hình bông chấm sơn của daSon trên sân khi vo === 'nong-trai'): cụm 3 bông hoa nở trên khóm lá
  dk({ loai: 'o', ma: 'o-hoa', ten: 'Khóm hoa vừa gieo', cacTrangThai: MAU.map(function (m) { return { mau: m }; }), ve: function (g, s, H) {
    var m = MAU.indexOf(s && s.mau) >= 0 ? s.mau : 'red';
    H.tron(g, 50, 56, 32); H.to(g, BM.vecLa); H.vien(g, BM.vecLaToi, 2.5);
    H.tron(g, 30, 58, 16); H.to(g, BM.vecXanhLa);
    H.tron(g, 70, 58, 16); H.to(g, BM.vecXanhLa);
    veBongHoa(g, H, 34, 48, 15, BM[MAU_DAI[m]], BM[MAU_VIEN[m]]);
    veBongHoa(g, H, 66, 48, 15, BM[MAU_DAI[m]], BM[MAU_VIEN[m]]);
    veBongHoa(g, H, 50, 34, 17, BM[MAU_DAI[m]], BM[MAU_VIEN[m]]);
    V.dauHinhMau(g, H, m, 50, 74, 15);
  }});

  // Bao hạt giống (vật nhặt / phân loại ở mùa 4): bao vải bố màu kraft ấm áp, cổ bao xoè tự nhiên, giữa thân có huy hiệu tròn trắng in bông hoa
  dk({ loai: 'vat', ma: 'bao-hat', ten: 'Bao hạt giống',
    cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; }), MAU.map(function (m) { return { mau: m, sat: true }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU.indexOf(s.mau) >= 0, m = coMau ? s.mau : null, sat = !!(s && s.sat);
      H.duong(g, 'M31 28 L35 14 Q43 18 50 13 Q57 18 65 14 L69 28 Z');
      H.to(g, sat ? BM.vecDat : BM.vecBaoToi); H.vien(g, BM.vecVien, 3);
      H.duong(g, 'M31 28 C18 40 15 62 18 79 C20 88 80 88 82 79 C85 62 82 40 69 28 Z');
      g.fillStyle = H.gradDoc(g, 0, 28, 0, 88, [[0, sat ? BM.vecDatSang : BM.vecBao], [0.7, BM.vecBaoToi], [1, BM.vecDatToi]]);
      g.fill(); H.vien(g, BM.vecVien, 3.2);
      if (sat) {
        H.bo(g, 39, 9, 22, 8, 3); H.to(g, BM.vecSat); H.vien(g, BM.vecVien, 2);
      }
      H.bo(g, 30, 25, 40, 6.5, 3); H.to(g, sat ? BM.vecSat : BM.vecBaoVien); H.vien(g, BM.vecVien, 2.2);
      H.tron(g, 50, 58, 19); H.to(g, BM.vecThe); H.vien(g, m ? BM[MAU_DAI[m]] : BM.vecBaoVien, 2.8);
      if (m) {
        hoa(g, H, 50, 58, 13.5, m);
        V.dauHinhMau(g, H, m, 74, 74, 12);
      } else {
        veBongHoa(g, H, 50, 58, 12, BM.vecHoPhach, BM.vecBaoVien);
      }
    }
  });

  /* ---- 2. MÙA 1 (KHO HÀNG, vo = 'kho-hang'): SÀN BÊ TÔNG · KHỐI KIỆN KHO 3D CAO · THÙNG CARTON 3D ---- */

  // Sàn kho hàng (.): tấm bê tông công nghiệp có mạch ghép và vạch góc nhẹ
  dk({ loai: 'o', ma: 'san-kho', ten: 'Sàn bê tông kho hàng', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    g.fillStyle = BM.vecKhoVien; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2.5, 2.5, 95, 95, 7);
    g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecKhoSanToi], [1, BM.vecKhoSanLeToi]] : [[0, BM.vecKhoSan], [1, BM.vecKhoSanToi]]);
    g.fill(); H.vien(g, BM.vecKhoGach, 1.8);
    H.duong(g, 'M12 18 H22 M12 18 V28 M88 82 H78 M88 82 V72');
    g.globalAlpha = 0.45; H.vien(g, BM.vecThe, 2); g.globalAlpha = 1;
  }});

  // Tường kho hàng (#): KHỐI KIỆN GỖ KHO HÀNG 3D CAO (hình vuông bo góc, mặt trên gỗ sáng y = 8..60, vách đứng trước sẫm màu y = 60..94 có thanh đà cam kho vận, ít họa tiết)
  dk({ loai: 'o', ma: 'ke-hang', ten: 'Kiện gỗ kho hàng 3D', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecKhoVien; g.fillRect(0, 0, 100, 100);
    // Khối thân 3D cao (vách đứng phía trước tối hơn ở y = 60..94 tạo chiều cao rõ rệt)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecGo], [0.62, BM.vecGoGiua], [1, BM.vecGoToi]]);
    g.fill(); H.vien(g, BM.vecVien, 3);

    // Mặt trên kiện gỗ phẳng sáng (y = 8..60)
    H.bo(g, 8, 8, 84, 52, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 60, [[0, BM.vecGoMat], [1, BM.vecGoMatToi]]);
    g.fill(); H.vien(g, BM.vecGoVien, 2);
    // Vệt sáng mép trên + 2 khe ván ngang tối giản trên mặt kiện
    H.bo(g, 15, 12, 70, 5, 2.5); H.to(g, BM.vecGoSang);
    H.duong(g, 'M10 26 H90 M10 43 H90'); H.vien(g, BM.vecGoVien, 2);

    // Vách đứng 3D phía trước (y = 60..94): chỉ 1 thanh đà kệ cam-vàng kho vận nổi bật giữa vách
    H.bo(g, 16, 70, 68, 12, 4);
    g.fillStyle = H.gradDoc(g, 0, 70, 0, 82, [[0, BM.vecVang], [1, BM.vecVanNong]]);
    g.fill(); H.vien(g, BM.vecVien, 2);
    H.tron(g, 23, 76, 1.8); H.to(g, BM.vecKhoThep);
    H.tron(g, 77, 76, 1.8); H.to(g, BM.vecKhoThep);
  }});

  // Vật kho hàng (o): THÙNG CARTON VUÔNG BO GÓC 3D DÁN 1 DẢI BĂNG KEO
  dk({ loai: 'vat', ma: 'thung-carton', ten: 'Thùng giấy carton kho hàng',
    cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU.indexOf(s.mau) >= 0, m = coMau ? s.mau : null;
      // Thân thùng carton 3D cao (vách trước y = 56..86 tối hơn nắp trên y = 14..56)
      H.bo(g, 12, 14, 76, 72, 13);
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 86, [[0, BM.vecCarton], [0.58, BM.vecCartonGiua], [1, BM.vecCartonToi]]);
      g.fill(); H.vien(g, BM.vecVien, 3);
      // Mặt nắp trên sáng
      H.bo(g, 15, 16, 70, 40, 9);
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 56, [[0, BM.vecCartonMat], [1, BM.vecCarton]]);
      g.fill(); H.vien(g, BM.vecCartonVien, 1.8);
      // 1 dải băng keo dọc chính giữa nắp gập xuống mặt trước
      H.bo(g, 42, 16, 16, 54, 3);
      H.to(g, m ? BM[MAU_DAI[m]] : BM.vecGoSang);
      H.vien(g, m ? BM[MAU_VIEN[m]] : BM.vecCartonVien, 2);
      if (m) V.dauHinhMau(g, H, m, 50, 38, 15);
    }
  });

  /* ---- 3. MÙA 2 (NHÀ MÁY, vo = 'nha-may'): SÀN THÉP · KHỐI MÁY THÉP 3D CAO · HỘP NĂNG LƯỢNG 3D ---- */

  // Sàn nhà máy (.): tấm thép sàn công nghiệp xám xanh có đinh tán 4 góc
  dk({ loai: 'o', ma: 'san-nha-may', ten: 'Sàn thép nhà máy', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    g.fillStyle = BM.vecNmVien; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2.5, 2.5, 95, 95, 7);
    g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecNmSanToi], [1, BM.vecNmSanLeToi]] : [[0, BM.vecNmSan], [1, BM.vecNmSanToi]]);
    g.fill(); H.vien(g, BM.vecNmGach, 1.8);
    [[12, 12], [88, 12], [12, 88], [88, 88]].forEach(function (q) {
      H.tron(g, q[0], q[1], 1.8); H.to(g, BM.vecNmGach);
    });
  }});

  // Tường nhà máy (#): KHỐI MÁY THÉP 3D CAO (cấu trúc khối hộp 3D cao như tường Lab: mặt trên thép sáng y = 8..60 có 2 khe gió ngang, vách đứng trước thép sẫm y = 60..94 gắn 1 dải đèn cam-vàng)
  dk({ loai: 'o', ma: 'tuong-nha-may', ten: 'Khối máy thép nhà máy', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecNmVien; g.fillRect(0, 0, 100, 100);
    // Thân khối máy 3D cao (vách đứng phía trước y = 60..94 sẫm màu tạo chiều cao 3D)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecThep], [0.6, BM.vecThepToi], [1, BM.vecDe]]);
    g.fill(); H.vien(g, BM.vecVien, 3);

    // Mặt trên khối máy thép xám xanh sáng (y = 8..60)
    H.bo(g, 8, 8, 84, 52, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 60, [[0, BM.vecThepSang], [1, BM.vecThep]]);
    g.fill(); H.vien(g, BM.vecDe, 2);
    // Vệt sáng mép trên + 2 khe gió ngang tối giản ở mặt trên
    H.bo(g, 16, 12, 68, 5, 2.5); H.to(g, BM.vecKhoMat);
    H.bo(g, 24, 26, 52, 7, 3.5); H.to(g, BM.vecDe);
    H.bo(g, 24, 40, 52, 7, 3.5); H.to(g, BM.vecDe);

    // Vách đứng 3D phía trước (y = 60..94): 1 dải tấm/đèn cam-vàng gọn gàng ở giữa vách đứng
    H.bo(g, 22, 70, 56, 13, 5);
    g.fillStyle = H.gradDoc(g, 0, 70, 0, 83, [[0, BM.vecVang], [0.6, BM.vecVanNong], [1, BM.vecCamDam]]);
    g.fill(); H.vien(g, BM.vecVien, 2);
    H.bo(g, 28, 72, 44, 3.5, 1.5); H.to(g, BM.vecVangSang);
  }});

  // Vật nhà máy (o): HỘP NĂNG LƯỢNG VUÔNG BO GÓC 3D CAO (nắp trên sáng y = 16..54 + vách đứng trước thép sẫm y = 54..86 gắn lõi năng lượng)
  dk({ loai: 'vat', ma: 'pin-nha-may', ten: 'Hộp năng lượng nhà máy 3D',
    cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU.indexOf(s.mau) >= 0, m = coMau ? s.mau : null;
      var dai = m ? BM[MAU_DAI[m]] : BM.vecVanNong;
      // Thân hộp năng lượng 3D cao (vách trước y = 54..86 sẫm màu tạo chiều cao khối thực)
      H.bo(g, 12, 14, 76, 72, 13);
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 86, [[0, BM.vecThepSang], [0.55, BM.vecThep], [1, BM.vecThepToi]]);
      g.fill(); H.vien(g, BM.vecVien, 3);
      // Mặt nắp trên thép sáng (y = 16..54)
      H.bo(g, 15, 16, 70, 38, 9);
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 54, [[0, BM.vecKhoMat], [1, BM.vecThepSang]]);
      g.fill(); H.vien(g, BM.vecKhoThep, 1.8);
      H.duong(g, 'M26 22 H74'); H.vien(g, BM.vecThe, 3);
      // Đai / ô năng lượng ở vách đứng phía trước (y = 60..78)
      H.bo(g, 20, 61, 60, 16, 5);
      H.to(g, dai); H.vien(g, BM.vecVien, 2);
      H.bo(g, 36, 65, 28, 8, 3); H.to(g, m ? BM.vecThe : BM.vecVangSang);
      if (m) V.dauHinhMau(g, H, m, 50, 35, 14);
      else {
        H.bo(g, 36, 31, 28, 8, 4); H.to(g, BM.vecThep);
      }
    }
  });

  /* ---- 4. MÙA 3 (BÃI TÁI CHẾ, vo = 'bai-tai-che'): SÀN BÃI · KHỐI TÔN THÉP TÁI CHẾ 3D CAO · HỘP TÔN GỈ 3D ---- */

  // Sàn bãi tái chế (.): tấm bê tông bãi phế liệu ngả cát xám ấm
  dk({ loai: 'o', ma: 'san-bai-tai-che', ten: 'Sàn bãi tái chế', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    g.fillStyle = BM.vecBtcVien; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2.5, 2.5, 95, 95, 7);
    g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecBtcSanToi], [1, BM.vecBtcSanLeToi]] : [[0, BM.vecBtcSan], [1, BM.vecBtcSanToi]]);
    g.fill(); H.vien(g, BM.vecBtcGach, 1.8);
    H.duong(g, 'M16 14 L24 14 M84 86 L76 86');
    g.globalAlpha = 0.45; H.vien(g, BM.vecBtcGach, 2); g.globalAlpha = 1;
  }});

  // Tường mùa 3 (#): KHỐI TÔN THÉP TÁI CHẾ 3D CAO (cấu trúc khối vuông bo góc 3D cao đồng bộ với Bó rơm Mùa 4 và ban-do/mua-3b.jpg: mặt trên tôn đồng gỉ sáng y = 8..60, vách đứng trước nâu-thép sẫm y = 60..94, siết 2 đai thép xám dọc từ đỉnh xuống đáy)
  dk({ loai: 'o', ma: 'tuong-bai-tai-che', ten: 'Khối phế liệu ép đai thép 3D', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecBtcVien; g.fillRect(0, 0, 100, 100);
    // Thân khối tôn phế liệu 3D cao (vách đứng phía trước sẫm màu ở y = 60..94)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecGo], [0.6, BM.vecGoGiua], [1, BM.vecGoToi]]);
    g.fill(); H.vien(g, BM.vecVien, 3);

    // Mặt trên khối tôn đồng gỉ sáng ấm (y = 8..60)
    H.bo(g, 8, 8, 84, 52, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 60, [[0, BM.vecGoMat], [0.55, BM.vecGoMatToi], [1, BM.vecGo]]);
    g.fill(); H.vien(g, BM.vecGoVien, 2);

    // Vệt sáng mép trên + 2 đường gân tôn gợn sóng ngang tối giản
    H.bo(g, 15, 12, 70, 5, 2.5); H.to(g, BM.vecGoSang);
    H.duong(g, 'M12 27 H88 M12 43 H88'); H.vien(g, BM.vecGoVien, 2.2);
    H.duong(g, 'M14 75 H86'); H.vien(g, BM.vecGoKhe, 2.4);

    // Hai đai thép xám bạc siết dọc từ mặt trên gấp xuống hết vách đứng phía trước (x = 27..35 và x = 65..73, như kiện phế liệu trong ban-do/mua-3b.jpg)
    [27, 65].forEach(function (sx) {
      H.bo(g, sx, 6, 8, 88, 3);
      g.fillStyle = H.gradDoc(g, sx, 6, sx, 94, [[0, BM.vecSat], [0.6, BM.vecThepSang], [0.68, BM.vecThep], [1, BM.vecThepToi]]);
      g.fill(); H.vien(g, BM.vecVien, 2.2);
    });
  }});

  // Vật mùa 3 (o): KIỆN PHẾ LIỆU ÉP VUÔNG BO GÓC 3D CAO (mặt trên tôn đồng sáng y = 16..54 + vách đứng trước đồng nâu sẫm y = 54..86 siết đai thép)
  dk({ loai: 'vat', ma: 'hop-phe-lieu', ten: 'Kiện tôn tái chế 3D',
    cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU.indexOf(s.mau) >= 0, m = coMau ? s.mau : null;
      var dai = m ? BM[MAU_DAI[m]] : BM.vecThep;
      // Thân kiện tôn ép 3D cao (vách trước y = 54..86 sẫm màu)
      H.bo(g, 12, 14, 76, 72, 13);
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 86, [[0, BM.vecCartonGiua], [0.55, BM.vecGo], [1, BM.vecGoGiua]]);
      g.fill(); H.vien(g, BM.vecVien, 3);
      // Mặt trên kiện tôn sáng ấm (y = 16..54)
      H.bo(g, 15, 16, 70, 38, 9);
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 54, [[0, BM.vecGoMat], [1, BM.vecCartonGiua]]);
      g.fill(); H.vien(g, BM.vecGoVien, 1.8);
      H.duong(g, 'M24 23 H76'); H.vien(g, BM.vecGoSang, 3);
      // Đai thép / đai màu ở vách đứng phía trước (y = 60..77)
      H.bo(g, 16, 61, 68, 15, 4);
      H.to(g, dai); H.vien(g, BM.vecVien, 2);
      H.bo(g, 38, 64.5, 24, 8, 3); H.to(g, m ? BM.vecThe : BM.vecSat);
      if (m) V.dauHinhMau(g, H, m, 50, 35, 14);
      else {
        H.duong(g, 'M26 36 H74'); H.vien(g, BM.vecGoVien, 2.2);
      }
    }
  });

  /* ---- 5. MÙA 7 (MỎ ĐÁ, vo = 'mo-da'): SÀN ĐÁ CÁT · VÁCH ĐÁ TẦNG 3D CAO · KHỐI ĐÁ / QUẶNG 3D ---- */

  // Sàn mỏ đá (.): phiến đá sa thạch vàng đất ấm
  dk({ loai: 'o', ma: 'san-mo-da', ten: 'Sàn đá mỏ lộ thiên', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    g.fillStyle = BM.vecDatToi; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2.5, 2.5, 95, 95, 7);
    g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecBao], [1, BM.vecDatSang]] : [[0, BM.vecCartonMat], [1, BM.vecBao]]);
    g.fill(); H.vien(g, BM.vecBaoVien, 1.8);
    // Vết thớ đá cắt tự nhiên tối giản ở hai góc
    H.duong(g, 'M14 20 L26 20 M74 82 L86 82');
    g.globalAlpha = 0.45; H.vien(g, BM.vecDatToi, 2); g.globalAlpha = 1;
  }});

  // Tường mỏ đá (#): KHỐI VÁCH ĐÁ TẦNG 3D CAO (mặt đỉnh đá sa thạch sáng y = 8..60 + vách đứng trước phân tầng đá nâu-vàng sẫm y = 60..94)
  dk({ loai: 'o', ma: 'tuong-mo-da', ten: 'Khối vách đá mỏ 3D', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecDatToi; g.fillRect(0, 0, 100, 100);
    // Thân vách đá 3D cao (vách đứng trước y = 60..94 phân tầng sẫm)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecDat], [0.58, BM.vecDatToi], [1, BM.vecGoToi]]);
    g.fill(); H.vien(g, BM.vecVien, 3);
    // Mặt đỉnh đá phẳng cắt vuông (y = 8..60)
    H.bo(g, 8, 8, 84, 52, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 60, [[0, BM.vecCartonMat], [0.6, BM.vecCarton], [1, BM.vecDatSang]]);
    g.fill(); H.vien(g, BM.vecBaoVien, 2);
    // Vệt sáng cạnh đỉnh + 2 đường thớ đá ngang trên mặt đỉnh
    H.bo(g, 15, 12, 70, 5, 2.5); H.to(g, BM.vecGoSang);
    H.duong(g, 'M18 30 H64 M36 44 H82'); H.vien(g, BM.vecDatToi, 2.2);
    // Hai tầng địa chất ngang trên vách đứng 3D phía trước (y = 60..94)
    H.bo(g, 10, 64, 80, 11, 4); H.to(g, BM.vecGoGiua);
    H.duong(g, 'M10 76 H90'); H.vien(g, BM.vecGoKhe, 2.6);
    H.bo(g, 24, 81, 52, 6, 3); H.to(g, BM.vecGoToi);
  }});

  // Vật mỏ đá (o): KHỐI ĐÁ / QUẶNG CẮT VUÔNG BO GÓC 3D CAO (mặt trên đá sáng y = 16..54 + vách đứng trước đá sẫm y = 54..86 kèm mạch khoáng sản)
  dk({ loai: 'vat', ma: 'da-mo', ten: 'Khối đá quặng mỏ 3D',
    cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU.indexOf(s.mau) >= 0, m = coMau ? s.mau : null;
      var dai = m ? BM[MAU_DAI[m]] : BM.vecVang;
      // Thân khối đá 3D cao
      H.bo(g, 12, 14, 76, 72, 13);
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 86, [[0, BM.vecDatSang], [0.55, BM.vecDat], [1, BM.vecDatToi]]);
      g.fill(); H.vien(g, BM.vecVien, 3);
      // Mặt trên khối đá cắt sáng (y = 16..54)
      H.bo(g, 15, 16, 70, 38, 9);
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 54, [[0, BM.vecCartonMat], [1, BM.vecBao]]);
      g.fill(); H.vien(g, BM.vecBaoVien, 1.8);
      H.duong(g, 'M24 22 H76'); H.vien(g, BM.vecGoSang, 3);
      // Đai / mạch quặng ở vách đứng phía trước (y = 60..77)
      H.bo(g, 18, 61, 64, 15, 5);
      H.to(g, dai); H.vien(g, BM.vecVien, 2);
      H.bo(g, 36, 65, 28, 7, 3); H.to(g, m ? BM.vecThe : BM.vecVangSang);
      if (m) V.dauHinhMau(g, H, m, 50, 35, 14);
      else {
        H.bo(g, 38, 30, 24, 10, 4); H.to(g, BM.vecVang); H.vien(g, BM.vecBaoVien, 1.8);
      }
    }
  });

  /* ---- 6. MÙA 8 (HANG ĐỘNG ĐÁ VÔI, vo = 'hang'): SÀN ĐÁ VÔI · ĐÁ ƯỚT TRƠN (I) · KHỐI VÁCH ĐÁ VÔI 3D CAO · ĐÁ VANG 3D ---- */

  // Sàn hang động (.): phiến đá vôi xám lam trầm trong lòng hang
  dk({ loai: 'o', ma: 'san-hang-dong', ten: 'Sàn đá vôi hang động', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    g.fillStyle = BM.vecThepToi; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2.5, 2.5, 95, 95, 7);
    g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecSatToi], [1, BM.vecKhoThep]] : [[0, BM.vecThepSang], [1, BM.vecSatToi]]);
    g.fill(); H.vien(g, BM.vecThep, 1.8);
    H.duong(g, 'M16 18 L28 18 M72 82 L84 82');
    g.globalAlpha = 0.45; H.vien(g, BM.vecThepToi, 2); g.globalAlpha = 1;
  }});

  // Đá ướt trơn trong hang (I): phiến đá vôi phủ lớp nước ngầm xanh ngọc bóng loáng
  dk({ loai: 'o', ma: 'da-uot', ten: 'Phiến đá ướt trơn trong hang', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecThepToi; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2.5, 2.5, 95, 95, 7);
    g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, [[0, BM.vecQuat], [0.55, BM.vecDen], [1, BM.vecDenToi]]);
    g.fill(); H.vien(g, BM.vecCyanDam, 2);
    // Vệt nước bóng loáng chéo trên mặt đá ướt
    H.duong(g, 'M18 30 L38 16 M30 58 L70 30 M56 80 L82 62');
    H.vien(g, BM.vecDenSang, 3.5);
  }});

  // Tường hang động (#): KHỐI ĐÁ VÔI / THẠCH NHŨ 3D CAO (mặt đỉnh đá vôi xám lam sáng y = 8..60 + vách đứng trước sẫm y = 60..94 có rãnh thạch nhũ và mạch tinh thể cyan)
  dk({ loai: 'o', ma: 'tuong-hang-dong', ten: 'Khối vách đá vôi hang động 3D', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecThepToi; g.fillRect(0, 0, 100, 100);
    // Thân khối đá vôi 3D cao (vách đứng phía trước sẫm màu y = 60..94)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecThep], [0.58, BM.vecThepToi], [1, BM.vecDe]]);
    g.fill(); H.vien(g, BM.vecVien, 3);
    // Mặt đỉnh đá vôi sáng (y = 8..60)
    H.bo(g, 8, 8, 84, 52, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 60, [[0, BM.vecBac], [0.6, BM.vecThepSang], [1, BM.vecThep]]);
    g.fill(); H.vien(g, BM.vecThepToi, 2);
    H.bo(g, 15, 12, 70, 5, 2.5); H.to(g, BM.vecBacSang);
    // Hai vết rãnh đá vôi trên mặt đỉnh
    H.duong(g, 'M20 30 H62 M38 44 H80'); H.vien(g, BM.vecThepToi, 2.2);
    // Vách đứng trước (y = 60..94): dải tinh thể khoáng thạch phát sáng xanh ngọc trong lòng hang
    H.bo(g, 22, 70, 56, 12, 5);
    g.fillStyle = H.gradDoc(g, 0, 70, 0, 82, [[0, BM.vecQuat], [0.6, BM.vecDen], [1, BM.vecDenToi]]);
    g.fill(); H.vien(g, BM.vecVien, 2);
    H.bo(g, 28, 72, 44, 3.5, 1.5); H.to(g, BM.vecDenSang);
  }});

  // Vật hang động (o): KHỐI ĐÁ VANG RỖNG 3D CAO (mặt trên đá vôi sáng y = 16..54 + vách đứng trước sẫm y = 54..86 gắn hốc tinh thể cộng hưởng âm thanh)
  dk({ loai: 'vat', ma: 'da-hang', ten: 'Khối đá vang hang động 3D',
    cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU.indexOf(s.mau) >= 0, m = coMau ? s.mau : null;
      var dai = m ? BM[MAU_DAI[m]] : BM.vecDen;
      // Thân khối đá vang 3D cao
      H.bo(g, 12, 14, 76, 72, 13);
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 86, [[0, BM.vecThepSang], [0.55, BM.vecThep], [1, BM.vecThepToi]]);
      g.fill(); H.vien(g, BM.vecVien, 3);
      // Mặt trên khối đá vôi sáng (y = 16..54)
      H.bo(g, 15, 16, 70, 38, 9);
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 54, [[0, BM.vecBacSang], [1, BM.vecThepSang]]);
      g.fill(); H.vien(g, BM.vecThep, 1.8);
      H.duong(g, 'M24 22 H76'); H.vien(g, BM.vecThe, 3);
      // Hốc cộng hưởng / đai màu ở vách đứng phía trước (y = 60..77)
      H.bo(g, 18, 61, 64, 15, 5);
      H.to(g, dai); H.vien(g, BM.vecVien, 2);
      H.bo(g, 36, 65, 28, 7, 3); H.to(g, m ? BM.vecThe : BM.vecDenSang);
      if (m) V.dauHinhMau(g, H, m, 50, 35, 14);
      else {
        H.tron(g, 50, 35, 8); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 2);
        H.tron(g, 48, 33, 3); H.to(g, BM.vecDenSang);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
