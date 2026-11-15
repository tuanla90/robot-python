var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-vat-cang.js — VẬT CẢNG SÔNG (mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.1, 4): CONTAINER và CHỒNG CONTAINER (lớp cfg.chong).
   Nhìn từ trên: hộp chữ nhật nằm ngang, gân sóng dọc, bốn góc khoá tối; SỐ in TO giữa nóc (chữ trắng viền chàm: đọc được ở ô 32 px). Màu theo so % 4:
   0 đỏ · 1 xanh dương · 2 vàng · 3 xanh lá (VeVector.MAU_CONT; người gọi có thể ép s.mau 0..3, vd màu theo tàu).
     'container'   s: { so 1–99, tan 1–4, mau?, hienTan? }  — một container. hienTan: vẽ vạch tấn (1–4 vạch) ở đầu phải nóc (mặc định ẨN: chưa có luật cho trẻ thấy tấn).
     'chong-cont'  s: { cont: [{ so, tan? }] đáy → đỉnh (1–4 tầng) } — các tầng dưới lệch dần xuống-phải 4 đơn vị (thấy mép = vạch tầng), CHỈ thấy số của container
                   trên cùng; huy hiệu số tầng tròn (chữ trắng nền chàm) ở góc dưới-trái. Một tầng thì không có huy hiệu (y như 'container').
   HÀM DÙNG LẠI (hệ 100 hay bất kỳ hệ nào đã scale):
     VeVector.veContainer(g, H, x, y, w, h, so, s)  vẽ một container hộp (x, y, w, h); s: { mau?, hienTan?, tan? }.
     VeVector.veChongCont(g, H, cont, s)            vẽ chồng trong ô 100 × 100 (dùng cho 'chong-cont' và container treo của VeVector.veCanCau). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MAU = [
    { chinh: BM.luatVatDo, sang: BM.luatVatDoSang, toi: BM.luatVatDoToi },
    { chinh: BM.luatVatXanhDuong, sang: BM.luatVatXanhDuongSang, toi: BM.luatVatXanhDuongToi },
    { chinh: BM.luatSanVang, sang: BM.luatSanVangSang, toi: BM.luatSanVangToi },
    { chinh: BM.luatSanXanhLa, sang: BM.luatSanXanhLaSang, toi: BM.luatSanXanhLaToi }
  ];
  V.MAU_CONT = MAU;
  var PHONG = '"Google Sans Flex", system-ui, sans-serif';

  function soHop(so) { so = Math.round(+so); return isFinite(so) ? so : 0; }
  function veContainer(g, H, x, y, w, h, so, s) {
    s = s || {};
    so = soHop(so);
    var m = MAU[typeof s.mau === 'number' ? ((s.mau % 4) + 4) % 4 : ((so % 4) + 4) % 4], i, n, gx;
    var hTop = h * 0.68;
    // Thân container 3D: vách đứng phía trước sẫm màu (y + hTop .. y + h)
    H.bo(g, x, y, w, h, 4);
    g.fillStyle = H.gradDoc(g, 0, y, 0, y + h, [[0, m.chinh], [0.68, m.toi], [1, m.toi]]);
    g.fill(); H.vien(g, BM.vecVien, Math.max(1.8, h * 0.05));
    // Mặt nóc trên container sáng (y .. y + hTop)
    H.bo(g, x + 1.5, y + 1.5, w - 3, hTop, 3);
    g.fillStyle = H.gradDoc(g, 0, y + 1.5, 0, y + hTop, [[0, m.sang], [1, m.chinh]]);
    g.fill(); H.vien(g, m.toi, Math.max(1.2, h * 0.03));
    // Gân sóng dọc trên mặt nóc và vách đứng trước
    g.beginPath(); n = 7;
    for (i = 1; i < n; i++) {
      gx = x + w * i / n;
      g.moveTo(gx, y + h * 0.08); g.lineTo(gx, y + hTop - 1);
      g.moveTo(gx, y + hTop + 2); g.lineTo(gx, y + h - 2);
    }
    H.vien(g, m.toi, Math.max(0.8, w * 0.018));
    [[x, y], [x + w, y], [x, y + hTop], [x + w, y + hTop]].forEach(function (p, k) {               // góc khoá mặt trên
      var cw = w * 0.09, ch = h * 0.11; g.beginPath(); g.rect(k % 2 ? p[0] - cw : p[0], k < 2 ? p[1] : p[1] - ch, cw, ch); H.to(g, m.toi);
    });
    if (s.hienTan) {
      var t = Math.max(1, Math.min(4, Math.round(+s.tan) || 1));
      g.beginPath(); for (i = 0; i < t; i++) { g.moveTo(x + w * 0.9, y + hTop * (0.24 + i * 0.18)); g.lineTo(x + w * 0.97, y + hTop * (0.24 + i * 0.18)); }
      H.vien(g, BM.vecVien, Math.max(1.2, h * 0.06));
    }
    var chu = String(so), co = Math.min(hTop * 0.82, w * (chu.length > 1 ? 0.46 : 0.56));
    g.font = '800 ' + co.toFixed(2) + 'px ' + PHONG; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = co * 0.2; g.strokeStyle = BM.vecVien; g.strokeText(chu, x + w / 2, y + hTop * 0.54);
    g.fillStyle = BM.vecVo; g.fillText(chu, x + w / 2, y + hTop * 0.54);
  }
  V.veContainer = veContainer;

  /** Chồng container trong ô 100 × 100: tầng dưới lệch xuống-phải, số tầng ở góc. cont = [{ so, tan? }] đáy → đỉnh. */
  function veChongCont(g, H, cont, s) {
    s = s || {};
    cont = (cont && cont.length ? cont : [{ so: 1 }]).slice(0, 4); g.lineWidth = 1;
    var n = cont.length, L = 4.5, w = 84 - (n - 1) * L, h = 58 - (n - 1) * L * 0.5, x0 = 8, y0 = 50 - h / 2 - (n - 1) * L / 2, i, d;
    for (i = 0; i < n; i++) {
      d = (n - 1 - i) * L;
      if (i < n - 1) {                                                                     // tầng dưới: chỉ thấy mép lệch (vạch tầng)
        var m = MAU[((soHop(cont[i].so) % 4) + 4) % 4];
        H.bo(g, x0 + d, y0 + d, w, h, 3); H.to(g, m.toi); H.vien(g, BM.vecVien, 1.8);
      } else veContainer(g, H, x0 + d, y0 + d, w, h, cont[i].so, { tan: cont[i].tan, hienTan: s.hienTan, mau: s.mau });
    }
    if (n > 1) {
      g.lineWidth = 2;
      H.tron(g, 13, 86, 12); H.to(g, BM.vecVien); H.vien(g, BM.vecVo, 2);
      g.font = '800 18px ' + PHONG; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = BM.vecVo; g.fillText(String(n), 13, 87);
    }
  }
  V.veChongCont = veChongCont;

  V.dangKy({ loai: 'vat', ma: 'container', ten: 'Container', cacTrangThai: [{ so: 7 }, { so: 12 }, { so: 25 }, { so: 99 }, { so: 3, tan: 3, hienTan: true }, { so: 40, mau: 1 }], ve: function (g, s, H) {
    s = s || {};
    veContainer(g, H, 6, 21, 88, 58, s.so == null ? 1 : s.so, s);
  } });

  V.dangKy({ loai: 'vat', ma: 'chong-cont', ten: 'Chồng container', cacTrangThai: [
    { cont: [{ so: 5 }, { so: 18 }] }, { cont: [{ so: 31 }, { so: 2 }, { so: 47 }] }, { cont: [{ so: 4 }, { so: 3 }, { so: 2 }, { so: 1 }] }, { cont: [{ so: 64 }] }
  ], ve: function (g, s, H) {
    veChongCont(g, H, s && s.cont, s);
  } });

  /* LUẬT XẾP CHỒNG (ghép nhịp 3c, 15/11; lõi bongMo.chongLuat): hai hình phủ lên ô chồng, chỉ dùng dải TRÊN của ô 100 × 100 (không che số container).
       'bien-luat-chong'  s: { luat: 'nho-tren' | 'lon-tren', mau?: [0..3] } — BIỂN LUẬT ở chồng đích: bảng kem, hình hai hộp chồng nhau (hộp nhỏ nằm trên hộp lớn = "nhỏ ở trên";
                          hộp lớn nằm trên hộp nhỏ = "lớn ở trên"), mũi tên chỉ lên và chữ "nhỏ" / "lớn"; có lọc màu thì mỗi màu một ô màu (so % 4) ở mép phải bảng.
       'dinh-chong'       — mũi tên hai đầu lên / xuống trong huy hiệu tròn ở góc trên-phải chồng: "vào / ra ở đỉnh" (ngăn xếp, vào sau ra trước). */
  V.dangKy({ loai: 'vat', ma: 'bien-luat-chong', ten: 'Biển luật xếp chồng', cacTrangThai: [{ luat: 'nho-tren' }, { luat: 'lon-tren' }, { luat: 'nho-tren', mau: [0] }, { luat: 'lon-tren', mau: [1, 3] }], ve: function (g, s, H) {
    s = s || {};
    var lon = s.luat === 'lon-tren', mau = Array.isArray(s.mau) ? s.mau.slice(0, 4) : [], i;
    var wB = mau.length ? 96 : 84, x0 = 50 - wB / 2;
    g.lineWidth = 1;
    H.bo(g, x0, 2, wB, 30, 7); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2.4);
    // hai hộp chồng nhau: hộp trên (y 7..15), hộp dưới (y 17..27); hộp nhỏ rộng 10, hộp lớn rộng 20
    var cx = x0 + 15, wT = lon ? 20 : 10, wD = lon ? 10 : 20;
    H.bo(g, cx - wT / 2, 6, wT, 9, 2); H.to(g, BM.vecVien);
    H.bo(g, cx - wD / 2, 17, wD, 10, 2); H.to(g, BM.vecVien);
    // mũi tên chỉ lên (phía đỉnh chồng)
    H.duong(g, 'M' + (x0 + 33) + ' 27 V9 M' + (x0 + 28) + ' 14 L' + (x0 + 33) + ' 8 L' + (x0 + 38) + ' 14'); H.vien(g, BM.vecVien, 2.6);
    g.font = '800 ' + (mau.length > 2 ? 13 : 17) + 'px ' + PHONG; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = BM.vecVien; g.fillText(lon ? 'lớn' : 'nhỏ', x0 + 43, 18);
    for (i = 0; i < mau.length; i++) {                                                     // ô màu được nhận (màu = so % 4), xếp dọc / lưới 2 × 2 ở mép phải bảng
      var m = MAU[((mau[i] % 4) + 4) % 4], cot = Math.floor(i / 2), hang = i % 2, c = mau.length === 1 ? 14 : 10;
      var mx = x0 + wB - 6 - c - cot * (c + 2), my = mau.length === 1 ? 10 : 6 + hang * (c + 2);
      H.bo(g, mx, my, c, c, 2.5); H.to(g, m.chinh); H.vien(g, BM.vecVien, 1.6);
    }
  } });

  V.dangKy({ loai: 'vat', ma: 'dinh-chong', ten: 'Mũi tên vào / ra ở đỉnh chồng', cacTrangThai: [{}], ve: function (g, s, H) {
    g.lineWidth = 1;
    H.tron(g, 85, 16, 13); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2.2);
    H.duong(g, 'M80 22 V9 M76 13 L80 8 L84 13 M90 10 V23 M86 19 L90 24 L94 19'); H.vien(g, BM.vecVien, 2.4);
  } });

  /* HÀNG TÀU NỐI ĐUÔI (ghép nhịp 3d, 15/11; lõi cfg.hangTau — hàng đợi, vào trước ra trước):
       'bang-tau'  s: { so } — BẢNG SỐ ở mũi tàu đầu hàng (dải trên của ô bến): bảng kem, hình tàu nhỏ + mũi tên + container MÀU theo so % 4 mang SỐ tàu đang cần.
       'tau-cho'   s: { so, them?, roi? } — MỘT TÀU ĐANG CHỜ trong hàng (ô nước): thân tàu nhìn từ trên (mũi nhọn bên trái, hướng về bến), boong thép viền đỏ,
                   giữa boong là bảng kem ghi SỐ tàu đó cần (viền màu so % 4); them > 0: huy hiệu "+n" (còn n tàu nữa sau tàu này, hết chỗ vẽ); roi: tàu vừa rời bến (không bảng, chở container số đó). */
  function veThanTau(g, H) {
    H.duong(g, 'M6 50 L24 26 H88 Q95 26 95 33 V67 Q95 74 88 74 H24 Z'); H.to(g, BM.vecLuaDo); H.vien(g, BM.vecVien, 3);
    H.duong(g, 'M19 50 L30 34 H84 Q87 34 87 37 V63 Q87 66 84 66 H30 Z'); g.fillStyle = H.gradDoc(g, 0, 34, 0, 66, [[0, BM.vecThepSang], [1, BM.vecThep]]); g.fill(); H.vien(g, BM.vecLuaVienToi, 1.8);
  }
  V.dangKy({ loai: 'vat', ma: 'tau-cho', ten: 'Tàu đang chờ trong hàng', cacTrangThai: [{ so: 8 }, { so: 25 }, { so: 5, them: 2 }, { so: 12, roi: true }], ve: function (g, s, H) {
    s = s || {};
    var so = soHop(s.so == null ? 1 : s.so), m = MAU[((so % 4) + 4) % 4], chu = String(so);
    g.lineWidth = 1;
    veThanTau(g, H);
    if (s.roi) { veContainer(g, H, 36, 37, 42, 26, so, {}); return; }
    H.bo(g, 34, 36, 46, 28, 5); H.to(g, BM.vecVo); H.vien(g, m.toi, 3);
    H.bo(g, 37, 39, 8, 22, 2.5); H.to(g, m.chinh);                                                   // vạch màu của container cần (so % 4)
    g.font = '800 ' + (chu.length > 1 ? 21 : 24) + 'px ' + PHONG; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = BM.vecVien; g.fillText(chu, 62, 51);
    if (s.them > 0) {
      H.tron(g, 84, 22, 14); H.to(g, BM.vecVien);
      g.font = '800 16px ' + PHONG; g.fillStyle = BM.vecVo; g.fillText('+' + Math.min(9, Math.round(s.them)), 84, 23);
    }
  } });
  V.dangKy({ loai: 'vat', ma: 'bang-tau', ten: 'Bảng số tàu đầu hàng cần', cacTrangThai: [{ so: 2 }, { so: 8 }, { so: 25 }, { so: 99 }], ve: function (g, s, H) {
    s = s || {};
    var so = soHop(s.so == null ? 1 : s.so);
    g.lineWidth = 1;
    H.bo(g, 8, 2, 84, 32, 7); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2.4);
    H.duong(g, 'M14 18 L20 11 H34 V25 H20 Z'); H.to(g, BM.vecLuaDo); H.vien(g, BM.vecVien, 1.8);                       // tàu nhỏ (mũi bên trái)
    H.duong(g, 'M39 18 H49 M45 13 L50 18 L45 23'); H.vien(g, BM.vecVien, 2.6);                                         // mũi tên "cần"
    veContainer(g, H, 54, 6, 34, 24, so, {});
  } });

  var MAU_TEN = ['red', 'green', 'blue', 'yellow'];
  var MAU_DAI = { red: 'luatSanDo', green: 'luatSanXanhLa', blue: 'luatSanXanhDuong', yellow: 'luatSanVang' };
  // Vật cảng sông (o): KIỆN HÀNG CẢNG SÔNG 3D CAO (mặt trên tôn gân sóng sáng y = 16..54 + vách đứng trước thép sẫm y = 54..86 gắn đai màu cảng)
  V.dangKy({ loai: 'vat', ma: 'kien-cang', ten: 'Kiện hàng cảng sông 3D',
    cacTrangThai: [{}].concat(MAU_TEN.map(function (m) { return { mau: m }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU_TEN.indexOf(s.mau) >= 0, m = coMau ? s.mau : null;
      var dai = m ? BM[MAU_DAI[m]] : BM.vecCanhBao;
      H.bo(g, 12, 14, 76, 72, 13);
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 86, [[0, BM.vecThepSang], [0.55, BM.vecThep], [1, BM.vecThepToi]]);
      g.fill(); H.vien(g, BM.vecVien, 3);
      // Mặt nắp trên tôn gân sóng sáng (y = 16..54)
      H.bo(g, 15, 16, 70, 38, 9);
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 54, [[0, BM.vecKhoMat], [1, BM.vecThepSang]]);
      g.fill(); H.vien(g, BM.vecThep, 1.8);
      H.duong(g, 'M32 20 V50 M50 20 V50 M68 20 V50'); H.vien(g, BM.vecSatToi, 2);
      // Đai kiện hàng ở vách đứng phía trước (y = 60..77)
      H.bo(g, 18, 61, 64, 15, 4);
      H.to(g, dai); H.vien(g, BM.vecVien, 2);
      H.bo(g, 36, 65, 28, 7, 3); H.to(g, m ? BM.vecThe : BM.vecVangSang);
      if (m) V.dauHinhMau(g, H, m, 50, 35, 14);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
