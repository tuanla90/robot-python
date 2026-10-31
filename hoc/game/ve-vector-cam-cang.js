var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-cam-cang.js — MÁY QUÉT MÃ 'quet-ma' (Cảng sông, mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.4), ổ 'tren' (góc mũi cabin).
   Hộp quét vỏ trắng, cửa sổ quét đỏ. s.bat (đang đọc read_code / weight): tia quét đỏ toả về phía trước + đèn sáng. s.can (nâng cấp CÂN TẢI): đồng hồ cân tròn
   gắn bên cạnh (mặt trắng, kim). hamGoc: read_code (gốc gói 3) + weight (nâng cấp gói 7).
   HÀM CHO san-ve.js: VeVector.veTiaQuet(g, { x, y, o, pha })  tia quét đỏ quét ngang ô đầu cần tâm (x, y) cạnh o px; pha 0..1 vị trí vạch quét (hoạt cảnh). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'cam-bien', ma: 'quet-ma', hamGoc: ['read_code', 'weight'], ten: 'Máy quét mã', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    s = s || {};
    if (s.bat) { g.beginPath(); g.moveTo(47, 56); g.lineTo(41, 64); g.lineTo(59, 64); g.lineTo(53, 56); g.closePath(); H.to(g, H.rgba(BM.vecLoiRgb, 0.35)); g.beginPath(); g.moveTo(41.5, 63.5); g.lineTo(58.5, 63.5); H.vien(g, BM.vecLoi, 1.6); }
    if (s.can) {
      H.tron(g, 42, 46, 5.2); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.6);
      g.beginPath(); g.moveTo(42, 46); g.lineTo(44.5, 43); H.vien(g, BM.vecLoi, 1.2);
      H.tron(g, 42, 46, 1); H.to(g, BM.vecVien);
    }
    H.bo(g, 44, 42, 12, 15, 3); g.fillStyle = H.gradVo(g, 44, 42, 12, 15); g.fill(); H.vien(g, BM.vecVien, 2);
    H.bo(g, 45.5, 52, 9, 4, 1.5); H.to(g, s.bat ? BM.vecLoi : BM.vecLoiDam); H.vien(g, BM.vecVien, 1);
    H.tron(g, 50, 46.5, 1.8); H.to(g, s.bat ? BM.vecDoSang : BM.vecDo);
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
