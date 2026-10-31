var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-vat-cang.js — VẬT CẢNG SÔNG (mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.1, 4): CONTAINER và CHỒNG CONTAINER (lớp cfg.chong).
   Nhìn từ trên: hộp chữ nhật nằm ngang, gân sóng dọc, bốn góc khoá tối; SỐ in TO giữa nóc (chữ trắng viền chàm: đọc được ở ô 32 px). Màu theo so % 4:
   0 đỏ · 1 xanh dương · 2 vàng · 3 xanh lá (VeVector.MAU_CONT; người gọi có thể ép s.mau 0..3, vd màu theo tàu).
     'container'   s: { so 1–99, tan 1–4, mau?, hienTan? }  — một container. hienTan: vẽ vạch tấn (1–4 vạch) ở đầu phải nóc (mặc định ẨN: chưa có luật cho trẻ thấy tấn).
     'chong-cont'  s: { cont: [{ so, tan? }] đáy → đỉnh (1–4 tầng) } — các tầng dưới lệch dần xuống-phải 4 đơn vị (thấy mép = vạch tầng), CHỈ thấy số của container
                   trên cùng; huy hiệu số tầng tròn ở góc dưới-trái. Một tầng thì không có huy hiệu (y như 'container').
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
    H.bo(g, x, y, w, h, 3); g.fillStyle = H.gradDoc(g, 0, y, 0, y + h, [[0, m.sang], [0.35, m.chinh], [1, m.chinh]]); g.fill(); H.vien(g, BM.vecVien, Math.max(1.6, h * 0.05));
    g.beginPath(); n = 7;
    for (i = 1; i < n; i++) { gx = x + w * i / n; g.moveTo(gx, y + h * 0.12); g.lineTo(gx, y + h * 0.88); }
    H.vien(g, m.toi, Math.max(0.8, w * 0.018));
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(function (p, k) {               // góc khoá
      var cw = w * 0.09, ch = h * 0.13; g.beginPath(); g.rect(k % 2 ? p[0] - cw : p[0], k < 2 ? p[1] : p[1] - ch, cw, ch); H.to(g, m.toi);
    });
    if (s.hienTan) {
      var t = Math.max(1, Math.min(4, Math.round(+s.tan) || 1));
      g.beginPath(); for (i = 0; i < t; i++) { g.moveTo(x + w * 0.9, y + h * (0.24 + i * 0.16)); g.lineTo(x + w * 0.97, y + h * (0.24 + i * 0.16)); }
      H.vien(g, BM.vecVien, Math.max(1.2, h * 0.07));
    }
    var chu = String(so), co = Math.min(h * 0.74, w * (chu.length > 1 ? 0.5 : 0.62));
    g.font = '800 ' + co.toFixed(2) + 'px ' + PHONG; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = co * 0.2; g.strokeStyle = BM.vecVien; g.strokeText(chu, x + w / 2, y + h * 0.54);
    g.fillStyle = BM.vecVo; g.fillText(chu, x + w / 2, y + h * 0.54);
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
      H.tron(g, 11, 88, 10); H.to(g, BM.vecVien); H.vien(g, BM.vecVo, 2);
      g.font = '800 14px ' + PHONG; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = BM.vecVo; g.fillText(String(n), 11, 88.5);
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
})(typeof window !== 'undefined' ? window : globalThis);
