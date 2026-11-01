var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-cam-cang.js — MÁY QUÉT MÃ 'quet-ma' (Cảng sông, mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.4), ổ 'tren' (góc mũi cabin).
   Hộp quét vỏ trắng công nghiệp, đầu đọc tối, cửa sổ laser đỏ. s.bat (đang đọc read_code / weight): chùm tia laser đỏ quét vạch mã về phía trước + đèn sáng.
   s.can (nâng cấp CÂN TẢI): đồng hồ đo tải trọng tròn gắn bên cạnh (vành thép, mặt trắng, vạch chia tải, kim đỏ). hamGoc: read_code (gốc gói 3) + weight (nâng cấp gói 7).
   HÀM CHO san-ve.js: VeVector.veTiaQuet(g, { x, y, o, pha })  tia quét đỏ quét ngang ô đầu cần tâm (x, y) cạnh o px; pha 0..1 vị trí vạch quét (hoạt cảnh). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'cam-bien', ma: 'quet-ma', hamGoc: ['read_code', 'weight'], ten: 'Máy quét mã', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    s = s || {};
    if (s.bat) {
      g.beginPath(); g.moveTo(46.5, 56); g.lineTo(41, 64); g.lineTo(59, 64); g.lineTo(53.5, 56); g.closePath();
      H.to(g, H.rgba(BM.vecLoiRgb, 0.35));
      g.beginPath(); g.moveTo(41.5, 63.2); g.lineTo(58.5, 63.2); H.vien(g, BM.vecLoi, 1.8);
      g.beginPath(); g.moveTo(45, 60); g.lineTo(45, 62.5); g.moveTo(48.5, 59.5); g.lineTo(48.5, 62.5); g.moveTo(51.5, 59.5); g.lineTo(51.5, 62.5); g.moveTo(55, 60); g.lineTo(55, 62.5);
      H.vien(g, BM.vecHongSang, 1.1);
    }
    if (s.can) {
      H.tron(g, 41.5, 46, 5.6); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 1.6);
      H.tron(g, 41.5, 46, 4.2); H.to(g, BM.vecVo);
      g.beginPath(); g.arc(41.5, 46, 3.2, -Math.PI * 0.85, -Math.PI * 0.15); H.vien(g, BM.vecXanhLa, 1.1);
      g.beginPath(); g.moveTo(41.5, 46); g.lineTo(44.2, 43.2); H.vien(g, BM.vecLoi, 1.4);
      H.tron(g, 41.5, 46, 1.1); H.to(g, BM.vecVien);
    }
    H.bo(g, 43.5, 41.5, 13, 15.5, 3.6); g.fillStyle = H.gradVo(g, 43.5, 41.5, 13, 15.5); g.fill(); H.vien(g, BM.vecVien, 2.1);
    H.duong(g, 'M46.5 44.5 H53.5'); H.vien(g, BM.vecVoGhep, 1.4);
    H.tron(g, 50, 47.4, 1.8); H.to(g, s.bat ? BM.vecDoSang : BM.vecDo); H.vien(g, BM.vecVien, 0.9);
    H.bo(g, 44.8, 50.8, 10.4, 5.4, 2); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.2);
    H.bo(g, 46, 51.8, 8, 3.4, 1.2); H.to(g, s.bat ? BM.vecLoi : BM.vecLoiDam);
    H.duong(g, 'M47.2 53.5 H52.8'); H.vien(g, s.bat ? BM.vecHongSang : BM.vecHong, 1.2);
  } });

  V.veTiaQuet = function (g, o) {
    o = o || {};
    var H = V.H, c = o.o > 0 ? o.o : 48, p = typeof o.pha === 'number' ? ((o.pha % 1) + 1) % 1 : 0.5, y = o.y - c * 0.32 + c * 0.64 * p;
    g.save();
    g.beginPath(); g.rect(o.x - c * 0.46, y - c * 0.06, c * 0.92, c * 0.12); H.to(g, H.rgba(BM.vecLoiRgb, 0.22));
    g.beginPath(); g.moveTo(o.x - c * 0.46, y); g.lineTo(o.x + c * 0.46, y); H.vien(g, BM.vecLoi, Math.max(1.2, c * 0.035));
    g.restore();
  };
})(typeof window !== 'undefined' ? window : globalThis);
