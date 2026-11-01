var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-day-keo.js — TAY DÂY PHAO KÉO 'day-keo' (Bến sông, mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.5, 2.6) + HÀM VẼ DÂY NỐI trên sân.
   Tay: tời dây ở mũi xuồng + phao tròn cam - trắng ở đầu dây. s.day = đang quăng dây (phao bay ra trước mũi, dây dài hơn); s.giu = đang kéo một vật (phao không còn
   trên tời: dây đi ra khỏi hình, san-ve.js nối bằng V.veDayKeo tới vật).
   hamGoc: tow / drop_tow (gốc gói 2) + tether / untether (nâng cấp gói 6).

   HÀM VẼ PHỤ cho san-ve.js (gói nối lõi), toạ độ PIXEL SÂN (không phải hệ 100):
     VeVector.veDayKeo(g, { x1, y1, x2, y2, o, cang, phao, a })
       Dây phao cam từ (x1, y1) (mũi / đuôi xuồng) tới (x2, y2) (tâm vật kéo, hay điểm dây đang bay tới). o = cạnh ô px (độ dày dây ~ o·0,05).
       cang: dây căng thẳng (đang kéo / vật buộc đuôi); không thì võng nhẹ. phao: vẽ phao tròn ở đầu (x2, y2) (dây đang bay ra / thu về, hụt).
       a: độ mờ 0..1 (mặc định 1). Không đổi transform của g (save / restore bên trong). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var H = V.H;

  function phaoTron(g, x, y, r) {
    H.tron(g, x, y, r); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, Math.max(1, r * 0.3));
    H.tron(g, x, y, r * 0.42); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, Math.max(0.8, r * 0.18));
    g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r * 0.42, y); g.moveTo(x + r * 0.42, y); g.lineTo(x + r, y); H.vien(g, BM.vecVo, Math.max(1, r * 0.28), 'butt');
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
      H.bo(g, 38, 77, 24, 11, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);                                  // khung tời
      H.bo(g, 42, 80, 16, 6, 2.5); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 1.6);                              // cuộn dây
      if (s.giu) { g.beginPath(); g.moveTo(50, 86); g.lineTo(50, 99); H.vien(g, BM.vecVien, 5.5); H.vien(g, BM.vecVanNong, 3); return; }
      var yP = s.day ? 99 : 92;
      g.beginPath(); g.moveTo(50, 86); g.lineTo(50, yP); H.vien(g, BM.vecVien, 5.5); H.vien(g, BM.vecVanNong, 3);
      if (s.day) { g.beginPath(); g.moveTo(40, 93); g.lineTo(37, 97); g.moveTo(60, 93); g.lineTo(63, 97); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.9), 2); }   // vệt bay
      phaoTron(g, 50, yP, 7);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
