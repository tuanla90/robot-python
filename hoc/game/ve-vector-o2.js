var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-o2.js — Ô SÂN TĨNH vector (gói V2): bậc thang S, hố u, gầm thấp n (cả mái riêng), sàn màu r g b y, ô sạc P, hàng rào =, ô đích D / X / h.
   Hệ 100 × 100 một ô (như ve-vector-o.js), phong cách lab trắng của hoc/hinh-mau/thu-vector.html; màu theo vai vec* / luat* của bang-mau.js.
   Mỗi hình khai `cacTrangThai`: các trạng thái mẫu (máy kiểm hoc/kiem-ve-vector.mjs vẽ thử từng cái ở nhiều cỡ, trang xem hoc/hinh-mau/xem-vector.html bày ra hết).
   Ô nào "vẽ đè lên sàn" (sạc, rào, đích) có cờ `phu: true`: san-ve.js vẽ ô sàn (hay sàn màu) trước rồi mới vẽ hình này lên.
   Quy ước biên: mọi điểm (kể cả nửa nét viền) nằm trong [0, 100] — chỗ phải chạm mép ô (rào nối liền) thì tô không viền. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  if (typeof module === 'object' && !(root.VeVector && root.VeVector.lay('o', 'san'))) require('./ve-vector-o.js');
  /** Màu luật của sàn màu (chương cảm biến màu): nền, sáng, tối, viền nổi — nhóm LUAT, cùng màu với bộ pixel (ve.js MAU) để luật đọc như nhau ở hai chế độ. */
  var MAU_SAN = {
    red: ['luatSanDo', 'luatSanDoSang', 'luatSanDoToi', 'luatSanDoVien'],
    green: ['luatSanXanhLa', 'luatSanXanhLaSang', 'luatSanXanhLaToi', 'luatSanXanhLaVien'],
    blue: ['luatSanXanhDuong', 'luatSanXanhDuongSang', 'luatSanXanhDuongToi', 'luatSanXanhDuongVien'],
    yellow: ['luatSanVang', 'luatSanVangSang', 'luatSanVangToi', 'luatSanVangVien']
  };
  function mauSan(mau) { var k = MAU_SAN[mau] || MAU_SAN.red; return { n: BM[k[0]], s: BM[k[1]], t: BM[k[2]], vi: BM[k[3]] }; }
  var MAU = ['red', 'green', 'blue', 'yellow'];
  function sanDuoi(g, H) { V.lay('o', 'san').ve(g, {}, H); }                              // ô sàn lab (ve-vector-o.js) làm nền
  function nenLuoi(g) { g.fillStyle = BM.vecSanToi; g.fillRect(0, 0, 100, 100); }

  /* BẬC THANG (S): khối trắng bạc bốn bậc, bậc dưới tối dần (đọc ra "đi xuống / leo lên"), mép mỗi bậc một vệt sáng và một đường bóng. */
  V.dangKy({ loai: 'o', ma: 'bac-thang', ten: 'Bậc thang', ky: ['S'], cacTrangThai: [{}], ve: function (g, s, H) {
    nenLuoi(g);
    H.bo(g, 3, 3, 94, 94, 8); g.fillStyle = H.gradDoc(g, 0, 3, 0, 97, [[0, BM.vecTuong], [1, BM.vecTuongToi]]); g.fill(); H.vien(g, BM.vecTuongVien, 3);
    var mat = [BM.vecVo, BM.vecVoGiua, BM.vecVoToi, BM.vecSat], i, y;
    for (i = 0; i < 4; i++) {
      y = 9 + i * 21;
      H.bo(g, 9, y + 3, 82, 18, 5); H.to(g, H.rgba(BM.vecVienRgb, 0.18));                       // bóng của bậc trên đổ xuống bậc dưới (đọc ra độ cao)
      H.bo(g, 9, y, 82, 18, 5); H.to(g, mat[i]); H.vien(g, BM.vecTuongVien, 2);
      H.duong(g, 'M14 ' + (y + 4) + ' H86'); H.vien(g, BM.vecCanhBao, 3.5);                       // mép bậc vàng an toàn (như cầu thang thật): khác khe lưới của tường / băng
      H.duong(g, 'M13 ' + (y + 15) + ' H87'); H.vien(g, BM.vecSatVien, 2);
    }
  } });

  /* HỐ (u): sàn lab có miệng hố tròn viền bạc, thành hố chàm tối dần xuống đáy, vệt sáng ở bờ trên trái (ánh sáng từ trái trên). */
  V.dangKy({ loai: 'o', ma: 'ho', ten: 'Hố', ky: ['u'], cacTrangThai: [{}], ve: function (g, s, H) {
    sanDuoi(g, H);
    H.tron(g, 50, 50, 38); g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, BM.vecDinh], [1, BM.vecSatToi]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.tron(g, 51, 52, 30); g.fillStyle = H.gradToa(g, 54, 60, 32, [[0, BM.vecHoToi], [0.65, BM.vecHoToi], [1, BM.vecHo]]); g.fill(); H.vien(g, BM.vecVien, 2.5);
    g.beginPath(); g.arc(50, 50, 34, Math.PI * 1.05, Math.PI * 1.45); H.vien(g, BM.vecVo, 3.5);
  } });

  /* GẦM THẤP (n): mái thép bạc thấp phủ gần kín ô, hai mép có sọc cảnh báo vàng – chàm ("thấp, cúi xuống"), bốn đinh tán.
     s.mai: chỉ vẽ MÁI (nền trong suốt) — san-ve.js vẽ đè lên nhện đang chui, mờ một phần, để thấy nhện nằm dưới mái. */
  function soc(g, H, y0, y1) {                                  // một dải sọc cảnh báo x 8..92, y y0..y1 (cắt theo dải; các điểm vẫn nằm trong ô)
    g.save(); g.beginPath(); g.rect(8, y0, 84, y1 - y0); g.closePath(); g.clip();
    H.to(g, BM.vecCanhBao);
    g.beginPath();
    var h = y1 - y0, cx = function (x) { return Math.min(97, x); };                          // cắt đỉnh ở 97: phần thừa đã nằm ngoài dải (clip) nên hình không đổi
    for (var x = 2; x < 92; x += 14) { g.moveTo(x, y1); g.lineTo(cx(x + 7), y1); g.lineTo(cx(x + 7 + h), y0); g.lineTo(cx(x + h), y0); g.closePath(); }
    H.to(g, BM.vecVien);
    g.restore();
    g.beginPath(); g.rect(8, y0, 84, y1 - y0); g.closePath(); H.vien(g, BM.vecVien, 2, 'butt');
  }
  V.dangKy({ loai: 'o', ma: 'gam', ten: 'Gầm thấp', ky: ['n'], cacTrangThai: [{}, { mai: true }], ve: function (g, s, H) {
    if (!s.mai) sanDuoi(g, H);
    H.bo(g, 5, 8, 90, 84, 9); g.fillStyle = H.gradDoc(g, 0, 8, 0, 92, [[0, BM.vecSat], [1, BM.vecSatToi]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.duong(g, 'M12 38 H88 M12 50 H88 M12 62 H88'); H.vien(g, BM.vecSatVien, 2);
    H.duong(g, 'M14 31 H86'); H.vien(g, BM.vecDinh, 2.5);
    soc(g, H, 13, 24); soc(g, H, 76, 87);
    [[16, 44], [84, 44], [16, 56], [84, 56]].forEach(function (q) { H.tron(g, q[0], q[1], 3); H.to(g, BM.vecDinh); H.vien(g, BM.vecDinhVien, 1.5); });
  } });

  /* SÀN MÀU (r g b y, hay lớp màu riêng): tấm sơn đầy ô, gradient từ màu sáng xuống màu nền, viền tối cùng họ màu, vệt bóng trắng như ô sàn lab.
     Màu lấy nhóm LUAT (luatSan*): là màu luật chơi (cảm biến đọc, ô đích màu) nên phải trùng với bộ pixel và phân biệt rõ trên sân trắng. */
  /* DẤU HÌNH theo màu (gói V3, cho người mù màu): đỏ = tròn, xanh lá = tam giác, xanh dương = vuông, vàng = sao năm cánh. Trắng viền chàm, ở góc dưới phải
     (tâm 74, 74; vật nằm đất chỉ phủ 21..79 nên dấu vẫn ló ra một phần khi có vật; robot đứng trên thì che). Cùng bộ dấu cho mọi chỗ cần đọc màu không qua sắc. */
  function dauHinh(g, H, mau, cx, cy, r) {
    if (mau === 'green') { g.beginPath(); g.moveTo(cx, cy - r * 1.1); g.lineTo(cx + r * 1.05, cy + r * 0.75); g.lineTo(cx - r * 1.05, cy + r * 0.75); g.closePath(); }
    else if (mau === 'blue') H.bo(g, cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7, r * 0.2);
    else if (mau === 'yellow') {
      g.beginPath();
      for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.48 : r * 1.12; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      g.closePath();
    } else H.tron(g, cx, cy, r * 0.9);
    H.vien(g, BM.vecVien, 4.5); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2);
  }
  V.dauHinhMau = dauHinh;
  V.DAU_HINH = { red: 'tron', green: 'tam-giac', blue: 'vuong', yellow: 'sao' };
  V.dangKy({ loai: 'o', ma: 'san-mau', ten: 'Sàn màu', ky: ['r', 'g', 'b', 'y'], cacTrangThai: MAU.map(function (m) { return { mau: m }; }), ve: function (g, s, H) {
    var c = mauSan(s.mau);
    nenLuoi(g);
    H.bo(g, 3, 3, 94, 94, 6); g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, [[0, c.s], [1, c.n]]); g.fill(); H.vien(g, c.t, 3);
    H.bo(g, 11, 11, 78, 78, 4); H.vien(g, c.vi, 2);
    H.duong(g, 'M16 32 L32 16'); g.globalAlpha = 0.6; H.vien(g, BM.vecVo, 5); g.globalAlpha = 1;
    dauHinh(g, H, MAU_SAN[s.mau] ? s.mau : 'red', 74, 74, 10);
  } });

  /* Ô ĐỆM TỪ (mùa 3, cfg.demTu; ô ghi '.' trên sân nên không khai ky; vẽ đè lên sàn): khối nam châm nằm bệt màu CỰC (N đỏ, S xanh dương: cùng nhóm LUAT với vật nam châm),
     chữ cực trắng viền chàm vẽ bằng nét (như ve-vector-vat.js), hai cung sóng từ nhẹ ở hai mép (đệm đang "phát"). Đọc được ở ô 14 px: chữ chiếm nửa ô. */
  var CUC_DEM = { N: ['luatVatDo', 'luatVatDoSang', 'luatVatDoToi'], S: ['luatVatXanhDuong', 'luatVatXanhDuongSang', 'luatVatXanhDuongToi'] };
  var CHU_DEM = { N: 'M38 68 V33 L62 67 V32', S: 'M61 37 C57 30 39 29 39 41 C39 52 61 48 61 59 C61 71 43 71 38 63' };
  V.dangKy({ loai: 'o', ma: 'dem-tu', ten: 'Đệm từ', phu: true, cacTrangThai: [{ cuc: 'N' }, { cuc: 'S' }], ve: function (g, s, H) {
    var cuc = s.cuc === 'S' ? 'S' : 'N', c = CUC_DEM[cuc], rgb = cuc === 'S' ? BM.tiaLamRgb : BM.tiaDoRgb;
    H.elip(g, 52, 56, 44, 42); H.to(g, H.rgba(BM.vecVienRgb, 0.14));                                   // bóng đổ
    H.bo(g, 8, 8, 84, 84, 16); g.fillStyle = H.gradDoc(g, 0, 8, 0, 92, [[0, BM[c[1]]], [0.45, BM[c[0]]], [1, BM[c[2]]]]); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.bo(g, 17, 17, 66, 66, 10); H.vien(g, BM[c[2]], 2.5);                                            // tấm trong tối hơn (đệm nằm bệt, khác khối vật nam châm đứng)
    H.duong(g, 'M20 16 H80'); g.globalAlpha = 0.5; H.vien(g, BM.vecVo, 3.5); g.globalAlpha = 1;      // vệt sáng mép trên
    g.save(); g.lineCap = 'round';                                                                     // hai cung sóng từ nhẹ ở hai mép trái / phải
    g.strokeStyle = H.rgba(rgb, 0.85); g.lineWidth = 2.5;
    g.beginPath(); g.arc(50, 50, 40, Math.PI * 0.8, Math.PI * 1.2); g.stroke();
    g.beginPath(); g.arc(50, 50, 40, -Math.PI * 0.2, Math.PI * 0.2); g.stroke();
    g.strokeStyle = H.rgba(rgb, 0.45); g.lineWidth = 2;
    g.beginPath(); g.arc(50, 50, 47, Math.PI * 0.86, Math.PI * 1.14); g.stroke();
    g.beginPath(); g.arc(50, 50, 47, -Math.PI * 0.14, Math.PI * 0.14); g.stroke();
    g.restore();
    H.duong(g, CHU_DEM[cuc]); H.vien(g, BM.vecVien, 13);
    H.duong(g, CHU_DEM[cuc]); H.vien(g, BM.vecVo, 7);
  } });

  /* ĐÁM CHÁY (30/10, gói lửa mùa 2; cfg.lua, vẽ đè lên sàn): s.suc 1–3 ngọn lửa (số lần tia nước còn phải trúng), s.pha 0–3 lửa lay qua lại;
     s.suc 0 = đã tắt: vết cháy xám và hai làn khói. Ngọn lửa ba lớp đỏ cam / cam / vàng, viền nâu đỏ mảnh. */
  function ngonLua(g, H, x, day, cao, rong, lech) {
    [[1, BM.vecLuaDo], [0.68, BM.vecLuaCam], [0.38, BM.vecLuaVang]].forEach(function (l, i) {
      var k = l[0], w = rong * k, hh = cao * k, dinh = day - hh, dx = lech * k;
      g.beginPath(); g.moveTo(x + dx, dinh);
      g.bezierCurveTo(x + dx * 0.4 + w * 0.5, dinh + hh * 0.38, x + w * 0.62, day - hh * 0.2, x, day);
      g.bezierCurveTo(x - w * 0.62, day - hh * 0.2, x + dx * 0.4 - w * 0.5, dinh + hh * 0.38, x + dx, dinh);
      g.closePath(); H.to(g, l[1]);
      if (i === 0) H.vien(g, BM.vecLuaVienToi, 2.5);
    });
  }
  var CHO_LUA = { 1: [[50, 1]], 2: [[35, 0.85], [65, 0.95]], 3: [[27, 0.75], [50, 1], [73, 0.8]] };
  V.dangKy({ loai: 'o', ma: 'lua', ten: 'Đám cháy', phu: true, cacTrangThai: [{ suc: 1, pha: 0 }, { suc: 2, pha: 1 }, { suc: 3, pha: 2 }, { suc: 3, pha: 3 }, { suc: 0 }], ve: function (g, s, H) {
    var suc = Math.max(0, Math.min(3, s.suc | 0)), pha = (s.pha | 0) & 3;
    if (!suc) {
      H.elip(g, 50, 62, 34, 20); H.to(g, H.rgba(BM.vecVienRgb, 0.18));
      H.elip(g, 50, 60, 28, 15); H.to(g, BM.vecTro);
      g.save(); g.lineCap = 'round'; g.strokeStyle = H.rgba(BM.vecKhoiRgb, 0.7); g.lineWidth = 5;
      g.beginPath(); g.moveTo(42, 52); g.bezierCurveTo(32, 40, 50, 32, 40, 18); g.stroke();
      g.strokeStyle = H.rgba(BM.vecKhoiRgb, 0.45); g.lineWidth = 4;
      g.beginPath(); g.moveTo(58, 54); g.bezierCurveTo(68, 44, 52, 36, 62, 24); g.stroke();
      g.restore();
      return;
    }
    H.elip(g, 50, 82, 36, 10); H.to(g, H.rgba(BM.vecVienRgb, 0.16));                    // bóng đổ
    H.elip(g, 50, 80, 32, 8); H.to(g, BM.vecTro);                                          // than dưới chân lửa
    var lay = [0, 4, 0, -4][pha];
    CHO_LUA[suc].forEach(function (q, i) {
      var cao = 66 * q[1] * (1 + ((pha + i) & 1 ? 0.06 : -0.04));
      ngonLua(g, H, q[0], 82, cao, suc === 1 ? 46 : suc === 2 ? 34 : 28, (i & 1 ? -lay : lay));
    });
  } });

  /* Ô SẠC của drone (P, vẽ đè lên sàn): đế tối bo góc, vòng cyan, tia chớp vàng ở giữa, bốn đèn góc nháy luân phiên theo s.pha (0 / 1). */
  V.dangKy({ loai: 'o', ma: 'sac', ten: 'Ô sạc', ky: ['P'], phu: true, cacTrangThai: [{ pha: 0 }, { pha: 1 }], ve: function (g, s, H) {
    var f = (s.pha || 0) & 1;
    H.elip(g, 52, 56, 40, 38); H.to(g, H.rgba(BM.vecVienRgb, 0.12));
    H.bo(g, 11, 11, 78, 78, 14); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 3);
    H.bo(g, 21, 21, 58, 58, 11); H.vien(g, BM.vecDen, 4);
    H.duong(g, 'M55 27 L36 54 H48 L44 73 L64 45 H52 Z'); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 2);
    H.duong(g, 'M52 32 L42 47'); H.vien(g, BM.vecVangSang, 2);
    [[20, 20], [80, 20], [80, 80], [20, 80]].forEach(function (q, k) { H.tron(g, q[0], q[1], 4); H.to(g, (k + f) % 2 ? BM.vecVang : BM.vecDen); H.vien(g, BM.vecVien, 1.5); });
  } });

  /* HÀNG RÀO THẤP (=, vẽ đè lên sàn: thấy sàn phía sau): hai thanh ngang trắng viền chàm + cọc bạc đầu đèn cyan; bóng đổ nhẹ dưới thanh.
     s.mask: 1 trái, 2 phải, 4 trên, 8 dưới = ô kề cũng là rào (thanh chạy tới mép ô để nối liền). Như pixel: không ô kề nào thì thanh nằm ngang;
     cọc trái / trên chỉ có khi phía đó không nối, cọc phải / dưới luôn có. Bộ dọc = bộ ngang xoay 90° (trên đóng vai trái, dưới đóng vai phải). */
  function raoNgang(g, H, noiTrai, noiPhai) {
    var xa = noiTrai ? 0 : 10, xb = noiPhai ? 100 : 90;
    [24, 58].forEach(function (y) {
      g.fillStyle = H.rgba(BM.vecVienRgb, 0.12); g.fillRect(xa, y + 14, xb - xa, 5);                    // bóng đổ (tô không viền: chạm mép ô được)
      g.fillStyle = BM.vecVo; g.fillRect(xa, y, xb - xa, 14);
      g.beginPath(); g.moveTo(Math.max(xa, 1.5), y); g.lineTo(Math.min(xb, 98.5), y); g.moveTo(Math.max(xa, 1.5), y + 14); g.lineTo(Math.min(xb, 98.5), y + 14); H.vien(g, BM.vecVien, 3, 'butt');
      g.beginPath(); g.moveTo(Math.max(xa, 2), y + 4); g.lineTo(Math.min(xb, 98), y + 4); H.vien(g, BM.vecVoToi, 2, 'butt');
    });
    function coc(x) {
      H.bo(g, x, 10, 20, 80, 7); g.fillStyle = H.gradDoc(g, x, 0, x + 20, 0, [[0, BM.vecDinh], [1, BM.vecSatToi]]); g.fill(); H.vien(g, BM.vecVien, 3);
      H.tron(g, x + 10, 20, 4); H.to(g, BM.vecDen);
    }
    if (!noiTrai) coc(4);
    coc(76);
  }
  V.dangKy({ loai: 'o', ma: 'rao', ten: 'Hàng rào thấp', ky: ['='], phu: true, cacTrangThai: [0, 3, 1, 2, 12, 5, 15].map(function (m) { return { mask: m }; }), ve: function (g, s, H) {
    var m = (s.mask | 0), ngang = (m & 3) || !(m & 12), doc = (m & 12) > 0;
    if (ngang) raoNgang(g, H, !!(m & 1), !!(m & 2));
    if (doc) { g.save(); g.translate(50, 50); g.rotate(Math.PI / 2); g.translate(-50, -50); raoNgang(g, H, !!(m & 4), !!(m & 8)); g.restore(); }
  } });

  /* Ô ĐÍCH (D, X, h — vẽ đè lên sàn / sàn màu). s.kieu: 'trong' (chưa có vật: nền hổ phách mờ + bốn góc khung; san-ve.js thêm viền nét đứt chạy),
     'day' (đã có vật đúng: khung đặc), 'sai' (vật sai màu: góc khung + dấu ✗ đỏ). s.mau: ô đích có màu (chỉ nhận vật cùng màu): khung màu luật (viền nổi luatSan*Vien) có viền chàm lót. */
  function gocKhung(g, H, mau) {
    H.duong(g, 'M10 30 V10 H30 M70 10 H90 V30 M90 70 V90 H70 M30 90 H10 V70');
    if (mau) { H.vien(g, BM.vecVien, 8); H.duong(g, 'M10 30 V10 H30 M70 10 H90 V30 M90 70 V90 H70 M30 90 H10 V70'); H.vien(g, mauSan(mau).vi, 4.5); }
    else H.vien(g, BM.vecDich, 5);
  }
  var TT_DICH = [];
  ['trong', 'day', 'sai'].forEach(function (k) { [null].concat(MAU).forEach(function (m) { if (k === 'sai' && !m) return; TT_DICH.push(m ? { kieu: k, mau: m } : { kieu: k }); }); });
  V.dangKy({ loai: 'o', ma: 'dich', ten: 'Ô đích', ky: ['D', 'X', 'h'], phu: true, cacTrangThai: TT_DICH, ve: function (g, s, H) {
    var k = s.kieu || 'trong';
    if (k === 'day') {
      H.bo(g, 6, 6, 88, 88, 10); H.vien(g, BM.vecVien, 8);
      H.bo(g, 6, 6, 88, 88, 10); H.vien(g, s.mau ? mauSan(s.mau).vi : BM.vecDich, 4.5);
      return;
    }
    if (k === 'trong' && !s.mau) { H.bo(g, 8, 8, 84, 84, 8); H.to(g, H.rgba(BM.vecDichRgb, 0.14)); }
    gocKhung(g, H, s.mau);
    if (k === 'sai') {
      H.duong(g, 'M66 16 L84 34 M84 16 L66 34'); H.vien(g, BM.vecVien, 9);
      H.duong(g, 'M66 16 L84 34 M84 16 L66 34'); H.vien(g, BM.vecDo, 5);
    }
  } });

  V.MAU_SAN = MAU_SAN;
})(typeof window !== 'undefined' ? window : globalThis);
