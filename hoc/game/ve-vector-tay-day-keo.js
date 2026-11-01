var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-day-keo.js — TAY DÂY PHAO KÉO 'day-keo' (Bến sông, mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.5, 2.6) + HÀM VẼ DÂY NỐI trên sân.
   Tay: cụm tời dây ở mũi xuồng + phao cứu sinh tròn cam - trắng ở đầu dây. s.day = đang quăng dây (phao bay ra trước mũi, dây dài hơn); s.giu = đang kéo một vật (phao không còn
   trên tời: dây đi ra khỏi hình, san-ve.js nối bằng V.veDayKeo tới vật).
   hamGoc: tow / drop_tow (gốc gói 2) + tether / untether (nâng cấp gói 6). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var H = V.H;

  function phaoTron(g, x, y, r) {
    /* phao cứu sinh tròn cam có 4 đai phản quang trắng 4 hướng */
    H.tron(g, x, y, r); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, Math.max(1, r * 0.28));
    g.beginPath();
    g.moveTo(x - r * 0.92, y); g.lineTo(x - r * 0.4, y);
    g.moveTo(x + r * 0.4, y); g.lineTo(x + r * 0.92, y);
    g.moveTo(x, y - r * 0.92); g.lineTo(x, y - r * 0.4);
    g.moveTo(x, y + r * 0.4); g.lineTo(x, y + r * 0.92);
    H.vien(g, BM.vecVo, Math.max(1, r * 0.28), 'butt');
    H.tron(g, x, y, r * 0.42); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, Math.max(0.8, r * 0.18));
  }

  function veDayKeo(g, o) {
    o = o || {};
    var x1 = +o.x1, y1 = +o.y1, x2 = +o.x2, y2 = +o.y2, c = o.o > 0 ? o.o : 48, day = Math.max(1.5, c * 0.05);
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, vong = o.cang ? 0 : Math.min(c * 0.12, L * 0.15);
    var mx = (x1 + x2) / 2 - dy / L * vong, my = (y1 + y2) / 2 + dx / L * vong;
    g.save();
    if (typeof o.a === 'number') g.globalAlpha = Math.max(0, Math.min(1, o.a));
    g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx, my, x2, y2);
    H.vien(g, BM.vecVien, day * 1.9); H.vien(g, BM.vecVanNong, day);
    g.setLineDash([day * 1.2, day * 1.6]); H.vien(g, BM.vecVanNongSang, day * 0.45, 'butt'); g.setLineDash([]);
    if (o.phao) phaoTron(g, x2, y2, c * 0.13);
    else { H.tron(g, x2, y2, day * 1.1); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, Math.max(1, day * 0.5)); }
    g.restore();
  }
  V.veDayKeo = veDayKeo;

  V.dangKy({
    loai: 'tay', ma: 'day-keo', hamGoc: ['tow', 'drop_tow', 'tether', 'untether'], ten: 'Dây phao kéo', gan: 'tay', diemNeo: { x: 50, y: 82 },
    ve: function (g, s, M, H) {
      s = s || {};
      /* giá tời dây cứu hộ gắn mũi xuồng: hai má thép tối + tang cuốn dây cam có rãnh cáp */
      H.bo(g, 37, 76.5, 26, 11.5, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.4);
      H.bo(g, 38.5, 78, 3.5, 8.5, 1.2); H.to(g, BM.vecThepToi);
      H.bo(g, 58, 78, 3.5, 8.5, 1.2); H.to(g, BM.vecThepToi);
      H.bo(g, 42, 79, 16, 6.5, 2.5); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 1.6);
      g.beginPath(); g.moveTo(46, 79.5); g.lineTo(46, 85); g.moveTo(50, 79.5); g.lineTo(50, 85); g.moveTo(54, 79.5); g.lineTo(54, 85);
      H.vien(g, BM.vecVanNongSang, 1.1);
      if (s.giu) { g.beginPath(); g.moveTo(50, 86); g.lineTo(50, 98); H.vien(g, BM.vecVien, 5.5); H.vien(g, BM.vecVanNong, 3); return; }
      var yP = s.day ? 93.5 : 89.5;
      g.beginPath(); g.moveTo(50, 86); g.lineTo(50, yP); H.vien(g, BM.vecVien, 5.5); H.vien(g, BM.vecVanNong, 3);
      if (s.day) { g.beginPath(); g.moveTo(40, 91); g.lineTo(37, 95); g.moveTo(60, 91); g.lineTo(63, 95); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.9), 2); }
      phaoTron(g, 50, yP, 6.2);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
