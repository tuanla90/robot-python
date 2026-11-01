var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-day-keo.js — TAY LƯỚI THỦY LỢI 'day-keo' (Bến sông, mùa 5; tung lưới & cuộn / thả dây lưới 0..3 ô) + HÀM VẼ DÂY LƯỚI trên sân.
   Tay: cụm tời cuốn dây + giá phóng lưới chữ U ở mũi xuồng + tấm lưới mắt cáo viền phao cam nhỏ.
   s.day = đang tung lưới; s.giu = đang giữ lưới dưới nước (dây đi ra khỏi hình, san-ve.js nối bằng V.veDayKeo tới vật);
   s.khoang = độ dài L = 0 (vật nổi đang nằm gọn trong lòng lưới trên boong mũi xuồng: 'be' hoặc 'luc-binh').
   hamGoc: cast_net / drop_net (gốc gói 2) + set_length (nâng cấp gói 6) + tương thích tow / drop_tow / tether / untether. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var H = V.H;

  function phaoTron(g, x, y, r) {
    /* phao tròn cam có 4 đai phản quang trắng 4 hướng */
    H.tron(g, x, y, r); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, Math.max(0.9, r * 0.28));
    g.beginPath();
    g.moveTo(x - r * 0.92, y); g.lineTo(x - r * 0.4, y);
    g.moveTo(x + r * 0.4, y); g.lineTo(x + r * 0.92, y);
    g.moveTo(x, y - r * 0.92); g.lineTo(x, y - r * 0.4);
    g.moveTo(x, y + r * 0.4); g.lineTo(x, y + r * 0.92);
    H.vien(g, BM.vecVo, Math.max(0.9, r * 0.28), 'butt');
    H.tron(g, x, y, r * 0.42); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, Math.max(0.7, r * 0.18));
  }

  function luoiMatCao(g, cx, cy, rx, ry, day) {
    /* tấm lưới mắt cáo ôm vật nổi hoặc đang tung ra, kèm 4 hạt phao cam ở 4 góc vành lưới */
    H.elip(g, cx, cy, rx, ry); H.to(g, H.rgba(BM.vecMatSangRgb, 0.24));
    g.beginPath();
    g.moveTo(cx - rx * 0.72, cy - ry * 0.48); g.lineTo(cx + rx * 0.72, cy + ry * 0.48);
    g.moveTo(cx + rx * 0.72, cy - ry * 0.48); g.lineTo(cx - rx * 0.72, cy + ry * 0.48);
    g.moveTo(cx - rx * 0.88, cy); g.lineTo(cx, cy - ry * 0.88); g.lineTo(cx + rx * 0.88, cy); g.lineTo(cx, cy + ry * 0.88); g.closePath();
    H.vien(g, BM.vecVo, Math.max(0.9, day * 0.55));
    H.elip(g, cx, cy, rx, ry); H.vien(g, BM.vecVien, Math.max(1.2, day * 1.15)); H.vien(g, BM.vecVanNong, Math.max(0.9, day * 0.72));
    var pf = Math.max(1.2, day * 0.85), gx = rx * 0.74, gy = ry * 0.74;
    [[-gx, -gy], [gx, -gy], [-gx, gy], [gx, gy]].forEach(function (d) {
      H.tron(g, cx + d[0], cy + d[1], pf); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, Math.max(0.6, pf * 0.38));
    });
  }

  function vatTrongKhoang(g, loai) {
    /* Vật nổi ('be' hoặc 'luc-binh') đã thu gọn vào khoang lưới (L = 0) ngay trên giá mũi xuồng */
    if (loai === 'luc-binh') {
      H.tron(g, 45.5, 90, 3.6); H.to(g, BM.vecLa); H.vien(g, BM.vecLaToi, 1.1);
      H.tron(g, 54.5, 90, 3.6); H.to(g, BM.vecLa); H.vien(g, BM.vecLaToi, 1.1);
      H.tron(g, 50, 88.5, 4.1); H.to(g, BM.vecCoLaSang); H.vien(g, BM.vecLaToi, 1.1);
      H.tron(g, 50, 88.5, 1.7); H.to(g, BM.vecMauCbSang); H.vien(g, BM.vecTim, 0.8);
    } else {
      H.bo(g, 41.5, 86, 17, 8, 2); H.to(g, BM.vecGoMat); H.vien(g, BM.vecVien, 1.4);
      g.beginPath(); g.moveTo(47, 86.5); g.lineTo(47, 93.5); g.moveTo(53, 86.5); g.lineTo(53, 93.5); H.vien(g, BM.vecGoToi, 1);
      H.bo(g, 40.8, 88, 18.4, 2, 0.8); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 0.9);
    }
    luoiMatCao(g, 50, 90, 10.5, 5.2, 1.6);
  }

  function veDayKeo(g, o) {
    o = o || {};
    var x1 = +o.x1, y1 = +o.y1, x2 = +o.x2, y2 = +o.y2, c = o.o > 0 ? o.o : 48, day = Math.max(1.5, c * 0.05);
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, vong = o.cang ? 0 : Math.min(c * 0.12, L * 0.15);
    var nx = -dy / L, ny = dx / L;
    var mx = (x1 + x2) / 2 + nx * vong, my = (y1 + y2) / 2 + ny * vong;
    g.save();
    if (typeof o.a === 'number') g.globalAlpha = Math.max(0, Math.min(1, o.a));
    /* Chuỗi dây lưới đi qua các mắt dây trung gian (nếu có o.mat) hoặc đường cong tới tâm lưới */
    g.beginPath(); g.moveTo(x1, y1);
    if (Array.isArray(o.mat) && o.mat.length) {
      for (var i = 0; i < o.mat.length; i++) g.lineTo(o.mat[i].x, o.mat[i].y);
      g.lineTo(x2, y2);
    } else g.quadraticCurveTo(mx, my, x2, y2);
    H.vien(g, BM.vecVien, day * 1.9); H.vien(g, BM.vecVanNong, day);
    g.setLineDash([day * 1.2, day * 1.6]); H.vien(g, BM.vecVanNongSang, day * 0.45, 'butt'); g.setLineDash([]);
    /* Hai dây giằng miệng lưới nối từ đoạn gần mục tiêu mở sang hai bên vành lưới */
    var gx = x2 - (dx / L) * Math.min(L * 0.42, c * 0.38), gy = y2 - (dy / L) * Math.min(L * 0.42, c * 0.38), rL = c * (o.phao ? 0.24 : 0.32);
    g.beginPath();
    g.moveTo(gx, gy); g.lineTo(x2 + nx * rL * 0.82, y2 + ny * rL * 0.82);
    g.moveTo(gx, gy); g.lineTo(x2 - nx * rL * 0.82, y2 - ny * rL * 0.82);
    H.vien(g, BM.vecVien, Math.max(1.1, day * 1.1)); H.vien(g, BM.vecVanNongSang, Math.max(0.7, day * 0.6));
    if (o.phao) {
      luoiMatCao(g, x2, y2, rL, rL * 0.78, day);
      phaoTron(g, x2, y2, c * 0.11);
    } else {
      luoiMatCao(g, x2, y2, rL, rL * 0.88, day);
    }
    g.restore();
  }
  V.veDayKeo = veDayKeo;

  V.dangKy({
    loai: 'tay', ma: 'day-keo', hamGoc: ['cast_net', 'drop_net', 'set_length', 'tow', 'drop_tow', 'tether', 'untether'], ten: 'Tay lưới thủy lợi', gan: 'tay', diemNeo: { x: 50, y: 82 },
    ve: function (g, s, M, H) {
      s = s || {};
      /* giá tời & khung phóng lưới chữ U gắn mũi xuồng: hai má thép tối + tang cuốn dây cam có rãnh cáp + hai càng dẫn lưới */
      H.bo(g, 36, 76.5, 28, 11.5, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.4);
      H.bo(g, 37.5, 78, 3.5, 11, 1.2); H.to(g, BM.vecThepToi);
      H.bo(g, 59, 78, 3.5, 11, 1.2); H.to(g, BM.vecThepToi);
      H.bo(g, 42, 78.8, 16, 6.5, 2.5); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 1.6);
      g.beginPath(); g.moveTo(46, 79.3); g.lineTo(46, 84.8); g.moveTo(50, 79.3); g.lineTo(50, 84.8); g.moveTo(54, 79.3); g.lineTo(54, 84.8);
      H.vien(g, BM.vecVanNongSang, 1.1);
      if (s.khoang) { vatTrongKhoang(g, s.khoang); return; }
      if (s.giu) {
        g.beginPath(); g.moveTo(47, 85.5); g.lineTo(44, 98); g.moveTo(53, 85.5); g.lineTo(56, 98);
        H.vien(g, BM.vecVien, 3.8); H.vien(g, BM.vecVanNong, 2.1);
        return;
      }
      var yP = s.day ? 93.2 : 90.2, rx = s.day ? 11.5 : 8.8, ry = s.day ? 4.8 : 3.8;
      g.beginPath(); g.moveTo(47, 85.5); g.lineTo(50 - rx * 0.55, yP); g.moveTo(53, 85.5); g.lineTo(50 + rx * 0.55, yP);
      H.vien(g, BM.vecVien, 3.4); H.vien(g, BM.vecVanNong, 1.9);
      if (s.day) { g.beginPath(); g.moveTo(38, 90.5); g.lineTo(35, 95); g.moveTo(62, 90.5); g.lineTo(65, 95); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.9), 2); }
      luoiMatCao(g, 50, yP, rx, ry, 1.8);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);

