/* ============================================================================
   ve-robot.js — "Robot Chấn Hưng": LỚP VẼ ROBOT TÁCH RIÊNG (window.VeRobot).
   Mọi chỗ vẽ robot (sân chính, sân thử ở Xưởng) đều gọi VeRobot.ve(); muốn đổi hình robot chỉ sửa tệp này
   (hoặc nạp bộ PART, xem dưới).

   VeRobot.ve(cauHinh, trangThai, huong, tiLe) → canvas (tâm canvas = tâm THÂN xe; đặt sao cho trùng tâm ô)
     cauHinh   = { than: 'hai-banh' | 'xich' | 'nhen' | 'omni' | 'drone', tay: 'kep' | 'xoay' | 'nam-cham' | 'nem' | 'hoi' | null, camBien: [{ ma, o }] }
                 VeRobot.cauHinhCua(man) (= cauHinhRobot) suy từ màn: man.robot = { than, tay, camBien } nếu có; không thì
                 than = 'nhen' khi man.loaiRobot === 'nhen', còn lại 'hai-banh'; tay theo lệnh tay trong man.hamGoc.
     tiLe      = số pixel màn hình trên MỖI pixel của part (có thể lẻ, < 1 khi ô sân nhỏ); mặc định 1.
                 VeRobot.tiLeChoO(canhO, cauHinh) chọn tiLe cho một ô sân cạnh canhO pixel màn hình.
     trangThai = { wl, wr: 0|1|2 (bánh trái / phải: đứng / quay chậm / quay), ph: 0|1 (nhịp lật khung bánh),
                   tay: { tuThe: 'tren'|'giua'|'duoi', kep: bool (true = đóng), cam: id | null },
                   loi: 'tay' (tay nháy đỏ) | null }
     huong     = 0 lên, 1 phải, 2 xuống, 3 trái.

   GHÉP PART (bộ part/ do Codex vẽ, nạp mặc định ở choi.html; thêm ?part=0 vào địa chỉ để tắt, so với hình tạm):
     nếu window.Part có Part.ghep thì VeRobot dùng nó:
     Part.ghep(cauHinh, { than: { banh: {trai, phai} }, tay: { tuThe: 'tren'|'duoi', kep: 'mo'|'dong', cam: bool } }, huong)
     (hàm veGhep() ở dưới đổi trangThai của game sang trangThai của part: 'giua' → 'tren'; kep true → 'dong'; cam id → true).
     Ảnh part 40×40, thân 24×24 nằm lệch về cuối ảnh (tay nhô lên trước mũi). veGhep() đệm ảnh thành 58×58 sao cho TÂM THÂN
     = tâm canvas (đúng cả 4 hướng) rồi phóng nguyên lần (hoặc thu nhỏ khi ô quá nhỏ). Hình trả về có cờ .laPart = true.
     Part ném lỗi (cấu hình không ghép được) hoặc chưa nạp → rơi về hình TẠM bên dưới (không có cờ .laPart; đơn vị = pixel sân).
     Tắt hẳn part: VeRobot.dungPart = false (hoặc ?part=0).
     Cách vẽ lên sân (san-ve.js): robot vẽ trên LỚP PHỦ cả sân (có lề tràn ra), nên tay kẹp nhô ra mép sân vẫn không bị cắt.
   NHỆN CO CHÂN (chương nhen / che-nhen, 15/10): trangThai.co = true → part nhện vẽ tư thế co (chân dang sát đất, thân dẹt); ảnh khác hẳn ảnh đứng nên là một phần của khóa bộ nhớ đệm.
   Drone (than 'drone'): bay cao, không có mặt trước nên huong luôn 0 và ảnh không xoay; cánh quạt quay theo pha ph (trangThai.wl / wr > 0 = đang quay); trangThai.camBien.bat sáng đèn thân (đang đo pin).
   CAMERA (camBien { ma:'camera', o:'tren' }, luật color() 14/10): không cắm cột nào lên thân, chỉ hiện HAI ĐỐM SÁNG Ở MẮT trên thân (trangThai.camBien.mat = true: đang đọc, hai mắt sáng rực). Không ghép cùng cảm biến màu ở bụng; drone không gắn camera (Part.ghep ném lỗi, hình rơi về hình tạm).
   CAMERA NHÌN XUỐNG của drone (camBien { ma:'camera-bay', o:'bung' }, hàm look(), 16/10): part cụm ống kính ló ra mép trên khung drone (ổ 'bung'); trangThai.camBien.mat = true: đang đọc look() (kính xanh lơ rực, quầng sáng). Màn có look() mà chưa khai camera-bay thì cauHinhCua tự thêm.
   Nam châm treo dưới bụng drone là tay 'nam-cham' gắn vào ổ 'duoi' (không phải ổ 'tay' ở mũi); camBien { ma: 'pin' } không phải part nên cauHinhCua bỏ khỏi cấu hình ghép và đặt cờ pin: true.
   Hình TẠM: xe hai bánh như cũ (Ve.makeRobot), tay kẹp Ở PHÍA TRƯỚC mũi xe như xe nâng (hai thanh nối vào mũi, hai ngàm ở đầu thanh); cảm biến sẽ ở hai bên hông:
     nâng = thanh ngắn, màu sáng; hạ = thanh dài ra phía trước, màu tối; kẹp mở = ngàm ngắn, đóng = hai ngàm chạm nhau;
     đang cầm = thùng gỗ nhỏ giữa hai ngàm (đi theo xe, xoay theo hướng xe).
   ========================================================================== */
(function () {
  'use strict';

  var CAN = 34;                      // cạnh canvas hình tạm có tay (xe 16 + viền ở giữa, càng nhô 8px phía trước; tâm canvas = tâm xe)
  var ND = { ink: '#1b120a' };
  var cache = {};

  /* ---------------------------------------------------------------- cấu hình */
  /** Lệnh gốc của tay → mã part tay (tay nào mở ra lệnh nào). Màn có lệnh tay mà không khai man.robot.tay thì lấy theo bảng này. */
  var TAY_THEO_LENH = {
    arm_down: 'kep', arm_up: 'kep', grab: 'kep', release: 'kep', arm_left: 'xoay', arm_right: 'xoay',
    magnet_n: 'nam-cham', magnet_s: 'nam-cham', magnet_off: 'nam-cham', aim: 'nem', throw: 'nem', load: 'nem', shoot: 'hoi', shoot_back: 'hoi',
    ink: 'son', dot: 'son', pen_down: 'son', pen_up: 'son'
  };
  function copyCam(ds) { return (ds || []).map(function (c) { return { ma: c.ma, o: c.o }; }); }
  /**
   * Cấu hình robot của một màn — MỘT CHỖ DUY NHẤT. Chương sau (nhện, xích, omni, cảm biến…) chỉ cần thêm vào dữ liệu màn:
   *   man.robot = { than: 'xich', tay: 'hoi' | null, camBien: [{ ma: 'khoang-cach', o: 'hong' }] }   (trường nào thiếu thì suy từ màn)
   * than: man.robot.than, hoặc 'nhen' nếu man.loaiRobot === 'nhen', hoặc 'hai-banh'.
   * tay : man.robot.tay (null = không tay), hoặc theo lệnh tay có trong man.hamGoc (kẹp: arm_down/arm_up/grab/release...).
   */
  function cauHinhCua(man) {
    var r = (man && man.robot) || {}, goc = (man && man.hamGoc) || [];
    var than = r.than || (man && man.loaiRobot === 'nhen' ? 'nhen' : 'hai-banh'), tay = null;
    if (r.tay !== undefined) tay = r.tay || null;
    else if (goc.indexOf('arm_left') >= 0 || goc.indexOf('arm_right') >= 0) tay = 'xoay';                    // tay xoay có đủ bốn lệnh tay kẹp + hai lệnh xoay: ưu tiên mã 'xoay'
    else for (var i = 0; i < goc.length && !tay; i++) tay = TAY_THEO_LENH[goc[i]] || null;
    var cam = copyCam(r.camBien).filter(function (c) { return c.ma !== 'pin'; });
    if (than === 'drone' && goc.indexOf('look') >= 0 && !cam.some(function (c) { return c.ma === 'camera-bay'; })) cam.push({ ma: 'camera-bay', o: 'bung' });       // màn có look() mà chưa khai camera nhìn xuống: lắp camera-bay ở ổ bung (như tay suy từ lệnh tay)
    return { than: than, tay: tay, camBien: cam, pin: !!(r.camBien || []).some(function (c) { return c.ma === 'pin'; }) };       // pin: drone có pin (đo battery()); chưa là bộ PART nên không đưa vào ghép hình
  }

  function chuanTay(t) {
    t = t || {};
    return { tuThe: t.tuThe === 'duoi' ? 'duoi' : t.tuThe === 'giua' ? 'giua' : 'tren', kep: t.kep === true || t.kep === 'dong', cam: t.cam !== null && t.cam !== undefined && t.cam !== false,
      bat: !!t.bat, ngam: t.ngam || 1, dangNem: !!t.dangNem, dangBanTruoc: !!t.dangBanTruoc, dangBanSau: !!t.dangBanSau,
      mauSon: typeof t.mauSon === 'string' ? t.mauSon : null,                                     // máy sơn: màu đang chọn (ruột lon sơn); tuThe 'duoi' = đầu sơn đang hạ
      xoay: t.xoay === 'trai' || t.xoay === 'phai' ? t.xoay : 'truoc', goc: typeof t.goc === 'number' ? Math.round(t.goc / 5) * 5 : null };       // tay xoay: nấc khớp, và góc (độ, 0 = trước, âm = trái) khi đang xoay giữa chừng
  }

  /* ----------------------------------------------------------------- hình tạm */
  function ctxMoi(n) {
    var cv = document.createElement('canvas'); cv.width = n; cv.height = n;
    var g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    return { cv: cv, g: g };
  }
  function veTamTay(huong, wl, wr, ph, tay, loi) {
    var o = ctxMoi(CAN), g = o.g, i;
    var tuThe = tay.tuThe, tren = tuThe === 'tren', duoi = tuThe === 'duoi';
    var dong = tay.kep, cam = tay.cam;
    var mau = loi ? { f: '#ff3b30', h: '#ffb0a8' } : duoi ? { f: '#c8661a', h: '#e48a3c' } : tren ? { f: '#ffb13b', h: '#ffe0a0' } : { f: '#e68a24', h: '#ffc070' };
    // Hệ toạ độ canvas 34×34, xe (18×18 có viền) đặt ở (8, 8) → mũi xe ở hàng y = 8, tâm xe = tâm canvas. Tay ở PHÍA TRƯỚC mũi (hàng 0..7).
    // hai thanh (như càng xe nâng) x 9..10 và 23..24 (đúng hai góc trước của thân, hàng 1..10) nối vào xe; ngàm ở hàng 2..3: mở = ngắn, đóng = chạm nhau, ôm thùng = chạm hai bên thùng.
    var dauNgam = !dong ? 11 : cam ? 12 : 16;                         // x cuối của ngàm trái
    var rect = [[9, 1, 2, 10], [23, 1, 2, 10], [9, 2, dauNgam - 8, 2], [33 - dauNgam, 2, dauNgam - 8, 2]];   // [x, y, w, h]
    if (tren) {                                                       // tay nâng: có bóng đổ xuống đất (cao hơn mặt đất)
      g.fillStyle = 'rgba(0,0,0,.3)';
      rect.forEach(function (r) { g.fillRect(r[0] + 1, r[1] + 2, r[2], r[3]); });
      if (cam) g.fillRect(15, 3, 8, 8);
    }
    g.fillStyle = ND.ink;
    rect.forEach(function (r) { g.fillRect(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2); });
    g.drawImage(Ve.makeRobot(0, wl, wr, ph), 8, 8);                   // thân xe (đã có viền) đè lên chân hai thanh
    rect.forEach(function (r) { g.fillStyle = mau.f; g.fillRect(r[0], r[1], r[2], r[3]); });
    g.fillStyle = mau.h;
    g.fillRect(9, 3, 1, 8); g.fillRect(23, 3, 1, 8); g.fillRect(9, 2, dauNgam - 8, 1); g.fillRect(33 - dauNgam, 2, dauNgam - 8, 1);
    if (duoi) { g.fillStyle = '#fff6e3'; g.fillRect(9, 1, 1, 1); g.fillRect(24, 1, 1, 1); }   // đầu càng chạm đất
    if (cam) {                                                        // thùng giữa hai càng, ngay trước mũi: 6×6 + viền
      var cx = 14, cy = 1;
      g.fillStyle = ND.ink; g.fillRect(cx - 1, cy - 1, 8, 8);
      g.fillStyle = '#c98a45'; g.fillRect(cx, cy, 6, 6);
      g.fillStyle = '#e8b574'; g.fillRect(cx, cy, 6, 1); g.fillRect(cx, cy, 1, 6);
      g.fillStyle = '#8a5a24'; g.fillRect(cx, cy + 5, 6, 1); g.fillRect(cx + 5, cy, 1, 6);
      for (i = 1; i < 5; i++) { g.fillRect(cx + i, cy + i, 1, 1); g.fillRect(cx + 5 - i, cy + i, 1, 1); }
    }
    return xoay(o.cv, huong);
  }
  function xoay(cv, huong) {
    huong = ((huong || 0) % 4 + 4) % 4;
    if (!huong) return cv;
    var o = ctxMoi(cv.width), g = o.g, c = cv.width / 2;
    g.translate(c, c); g.rotate(huong * Math.PI / 2); g.translate(-c, -c);
    g.drawImage(cv, 0, 0);
    return o.cv;
  }

  /* --------------------------------------------------------------- ghép PART */
  var DEM = 58, TAM_THAN = [[20, 29], [11, 20], [20, 11], [29, 20]];   // ảnh part 40×40; thân tâm (20,29) khi hướng lên, xoay theo hướng
  var REACH = 26;                    // từ tâm thân tới mép xa nhất của ảnh part (pixel part), mọi hướng

  /** Bề ngang thân (pixel part): xích 24, còn lại 20. Đo từ part nếu có. */
  var rongThan = {}, daBao = {};
  function beNgangThan(ma) {
    if (rongThan[ma]) return rongThan[ma];
    var w = 20, P = window.Part;
    try {
      var d = P.lay('than', ma), q = P._veMot(d, {}), x0 = 99, x1 = -1, x, y;
      for (y = 0; y < q.h; y++) for (x = 0; x < q.w; x++) if (q.get(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
      if (x1 >= x0) w = x1 - x0 + 1;
    } catch (e) { /* giữ 20 */ }
    return (rongThan[ma] = w);
  }
  function coPart() { var P = (typeof window !== 'undefined') ? window.Part : null; return !!(P && typeof P.ghep === 'function' && VeRobot.dungPart !== false); }
  /** Chọn tiLe (px màn hình / px part) cho một ô sân cạnh canhO px màn hình, sao cho thân xe chiếm khoảng 80–90% bề ngang ô trên MỌI máy
   *  (trước đây lấy số nguyên lớn nhất vừa ô: máy tính tỉ lệ thấp thì xe chỉ còn nửa ô, cờ to hơn xe).
   *  Ưu tiên số nguyên (nét pixel đều); số nguyên nào cũng ngoài khoảng đó thì dùng tỉ lệ lẻ ~85% ô (veGhep vẽ lớn rồi thu lại cho khỏi méo). */
  var THAN_MIN = 0.8, THAN_MAX = 0.9, THAN_DICH = 0.85;        // 14/10 user: xe tầm 85% ô (trước 0,6–0,85 rồi 0,66–0,84)
  function tiLeChoO(canhO, cauHinh) {
    var w = coPart() ? beNgangThan((cauHinh && cauHinh.than) || 'hai-banh') : 20, n = Math.floor(THAN_MAX * canhO / w);
    if (n >= 1 && n * w >= THAN_MIN * canhO) return n;
    return Math.max(0.3, THAN_DICH * canhO / w);
  }

  /** Màu sơn R1 mà người chơi đang chọn trong Cài đặt (nếu đã đủ sao mở khóa), hoặc '' (nguyên bản). */
  function sonChon() {
    var L = typeof window !== 'undefined' && window.Luu, P = typeof window !== 'undefined' && window.Part;
    if (!L || !L.docCaiDat || !P || !P.SON) return '';
    var s = L.docCaiDat().son;
    if (!s || !P.SON[s]) return '';
    if (P.DS_SON && typeof window !== 'undefined' && window.App && App.tongSao && !App.moHet) {
      var muc = P.DS_SON.filter(function (x) { return x.ma === s; })[0];
      if (muc && muc.saoCan > App.tongSao()) return '';
    }
    return s;
  }
  function sonHieuLuc(son) {
    if (son === 'goc') return null;
    if (son && son !== 'vang') return son;
    return sonChon() || son || null;
  }

  function veGhep(cauHinh, tt, huong, tiLe) {
    if (!coPart()) return null;
    var P = window.Part, tay = chuanTay(tt.tay), cb = tt.camBien || {};
    var cfg = { than: cauHinh.than || 'hai-banh', tay: cauHinh.tay || null, camBien: cauHinh.camBien || [], son: sonHieuLuc(cauHinh.son) };     // son: màu sơn đội / người chơi chọn (Part.SON), thiếu = màu gốc của thân
    var chay = tt.wl > 0 || tt.wr > 0, h = ((cfg.than === 'nhen' && !cfg.tay) || cfg.than === 'drone') ? 0 : huong;     // drone bay 4 hướng, không có mặt trước (cánh quạt luôn quay); nhện đi 4 hướng không quay mặt; nhện CÓ TAY: ảnh quay theo cạnh gắn tay (cố định theo batDau.huong, san-ve.js truyền vào `huong`)
    var st = {
      than: { banh: { trai: tt.wl > 0 ? 1 : 0, phai: tt.wr > 0 ? 1 : 0 }, buoc: chay && tt.ph ? 1 : 0, quat: chay, doc: !!cb.bat, co: !!tt.co },       // drone: buoc = pha cánh quạt, doc = đèn thân sáng khi đo pin
      tay: { tuThe: tay.tuThe === 'duoi' ? 'duoi' : 'tren', kep: tay.kep ? 'dong' : 'mo', cam: tay.cam, bat: tay.bat, ngam: tay.ngam, dangNem: tay.dangNem, dangBanTruoc: tay.dangBanTruoc, dangBanSau: tay.dangBanSau, mauSon: tay.mauSon, xoay: tay.xoay, goc: tay.goc === null ? undefined : tay.goc },
      camBien: { bat: !!cb.bat, mat: !!cb.mat }                                  // mat: camera đang đọc (hai đốm mắt trên thân sáng lên)
    };
    var raw;
    try { raw = P.ghep(cfg, st, h); }
    catch (e) {                                                       // cấu hình không ghép được: báo một lần (lỗi dữ liệu màn), vẽ hình tạm
      var kb = cfg.than + '/' + cfg.tay + '/' + JSON.stringify(cfg.camBien);
      if (!daBao[kb]) { daBao[kb] = 1; if (typeof console !== 'undefined' && console.warn) console.warn('VeRobot: Part không ghép được (' + kb + '): ' + e.message); }
      return null;
    }
    if (!raw || !raw.width) return null;
    var tam = TAM_THAN[h], n = Math.max(1, Math.round(DEM * tiLe));
    var dem = ctxMoi(DEM);                                            // đệm: tâm thân ra giữa canvas
    dem.g.drawImage(raw, DEM / 2 - tam[0], DEM / 2 - tam[1]);
    var o = ctxMoi(n), nguon = dem.cv, cn = DEM, le = tiLe > 1 && Math.abs(tiLe - Math.round(tiLe)) > 1e-6;
    if (le) {                                                         // tỉ lệ lẻ > 1: phóng nguyên lần (pixel đều) lên trước, rồi thu mịn về cỡ đích — đỡ méo hơn phóng lẻ thẳng
      var N = Math.ceil(tiLe), lon = ctxMoi(DEM * N);
      lon.g.imageSmoothingEnabled = false;
      lon.g.drawImage(dem.cv, 0, 0, DEM, DEM, 0, 0, DEM * N, DEM * N);
      nguon = lon.cv; cn = DEM * N;
    }
    o.g.imageSmoothingEnabled = tiLe < 1 || le; if (tiLe < 1 || le) o.g.imageSmoothingQuality = 'high';
    o.g.drawImage(nguon, 0, 0, cn, cn, 0, 0, n, n);
    o.cv.laPart = true;
    return o.cv;
  }

  /* ------------------------------------------------------------------- chính */
  function ve(cauHinh, trangThai, huong, tiLe) {
    cauHinh = cauHinh || { than: 'hai-banh', tay: null, camBien: [] };
    tiLe = tiLe > 0 ? tiLe : 1;
    var tt = trangThai || {}, wl = tt.wl || 0, wr = tt.wr || 0, ph = tt.ph ? 1 : 0;
    huong = ((huong || 0) % 4 + 4) % 4;
    var tay = chuanTay(tt.tay);
    var son = sonHieuLuc(cauHinh.son) || '';
    var khoa = [cauHinh.than, cauHinh.tay || '-', JSON.stringify(cauHinh.camBien || []), huong, wl, wr, ph, tiLe, tt.camBien && tt.camBien.bat ? 'b' : '-', tt.camBien && tt.camBien.mat ? 'm' : '-', tt.co ? 'co' : '-',
      cauHinh.tay ? tay.tuThe + (tay.kep ? 'K' : 'm') + (tay.cam ? 'C' : '-') + (tay.bat ? 'B' : '') + tay.ngam + (tay.dangNem ? 'N' : '') + (tay.dangBanTruoc ? 'T' : '') + (tay.dangBanSau ? 'S' : '') + (cauHinh.tay === 'xoay' ? 'x' + (tay.goc === null ? tay.xoay : tay.goc) : '') + (cauHinh.tay === 'son' ? 's' + (tay.mauSon || '') : '') : '', tt.loi || '', coPart() ? 'P' : 'x', son].join('|');
    if (cache[khoa]) return cache[khoa];
    var cv = veGhep(cauHinh, { wl: wl, wr: wr, ph: ph, tay: cauHinh.tay ? tay : null, camBien: tt.camBien, co: tt.co }, huong, tiLe);
    if (!cv) {                                                        // hình TẠM (đơn vị pixel sân)
      if (cauHinh.than === 'nhen' || cauHinh.than === 'drone') cv = Ve.makeNhen(wl > 0 || wr > 0 ? ph : 0);       // chưa nạp part: drone tạm dùng hình nhện
      else if (!cauHinh.tay) cv = Ve.makeRobot(huong, wl, wr, ph);
      else cv = veTamTay(huong, wl, wr, ph, tay, tt.loi === 'tay');
    }
    cache[khoa] = cv;
    return cv;
  }

  /** BÓNG CỦA TAY (chỉ part kẹp): ảnh đen một màu = đúng phần pixel mà hình có tay khác hình không tay (hai càng + cụm giữa), cùng cỡ với VeRobot.ve().
   *  san-ve.js vẽ nó DƯỚI robot, lệch phải-dưới: tay hạ lệch ít (bóng sát), tay nâng lệch nhiều (bóng xa). Không có part / không có tay: null. */
  var cacheBong = {};
  function bongTay(cauHinh, trangThai, huong, tiLe) {
    if (!cauHinh || (cauHinh.tay !== 'kep' && cauHinh.tay !== 'xoay') || !coPart()) return null;
    var cv = ve(cauHinh, trangThai, huong, tiLe);
    if (!cv || !cv.laPart) return null;
    var son = sonHieuLuc(cauHinh.son) || '';
    var tt = trangThai || {}, k = [cauHinh.than, JSON.stringify(cauHinh.camBien || []), ((huong || 0) % 4 + 4) % 4, tt.wl || 0, tt.wr || 0, tt.ph ? 1 : 0, tiLe, cv.width, chuanTay(tt.tay).tuThe, chuanTay(tt.tay).kep, chuanTay(tt.tay).cam, chuanTay(tt.tay).xoay, chuanTay(tt.tay).goc, son].join('|');
    if (cacheBong[k] !== undefined) return cacheBong[k];
    var khong = ve({ than: cauHinh.than, tay: null, camBien: cauHinh.camBien, son: cauHinh.son }, { wl: tt.wl, wr: tt.wr, ph: tt.ph, tay: null, camBien: tt.camBien }, huong, tiLe), r = null;
    try {
      if (khong && khong.width === cv.width) {
        var o = ctxMoi(cv.width), a = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height), b = khong.getContext('2d').getImageData(0, 0, cv.width, cv.height), d = o.g.createImageData(cv.width, cv.height), i, co = false;
        for (i = 0; i < cv.width * cv.height; i++) {
          var j = i * 4;
          if (a.data[j + 3] > 100 && (b.data[j + 3] < 100 || Math.abs(a.data[j] - b.data[j]) + Math.abs(a.data[j + 1] - b.data[j + 1]) + Math.abs(a.data[j + 2] - b.data[j + 2]) > 24)) { d.data[j + 3] = 255; co = true; }
        }
        if (co) { o.g.putImageData(d, 0, 0); r = o.cv; }
      }
    } catch (e) { r = null; }
    return (cacheBong[k] = r);
  }

  /** Vật trong tay kẹp (luật vật 14/10): tâm vật cách tâm thân bao nhiêu pixel PART về phía mũi xe (tay nâng; tay hạ xa thêm 2: càng dài ra chạm đất) và cạnh vật (pixel part).
   *  Part kẹp chừa khe giữa hai càng cho vật (cột 7..16, hàng 8..17 của ảnh tay); thân hai bánh có ổ tay ở y = 4, các thân khác y = 5. */
  function vatKep(cauHinh, tuThe) {
    var oy = 4, P = (typeof window !== 'undefined') ? window.Part : null;
    try { var d = P && P.lay('than', (cauHinh && cauHinh.than) || 'hai-banh'); if (d && d.oGan && d.oGan.tay) oy = d.oGan.tay.y; } catch (e) { /* giữ 4 */ }
    return { ahead: 22 - oy + (tuThe === 'duoi' ? 2 : 0), n: 10 };
  }

  /** TAY XOAY: vị trí vật trong kẹp khi khớp ở góc `goc` độ (0 = phía trước, âm = sang trái, dương = sang phải; mặc định theo nấc `xoay`): { f, l, n } = vật cách tâm thân f pixel part
   *  về phía MŨI xe và l pixel về bên PHẢI xe (theo hướng xe), cạnh vật n. Khớp ở mũi xe, trụ ngắn: tâm khớp cách tâm thân F0 = 16 - (y ổ tay của thân) pixel về phía mũi; vật cách khớp U = 10 pixel
   *  theo hướng cánh tay (tay hạ: +1,5, vật nhỏ hơn một pixel). Cùng hằng số với part-tay-xoay.js (U_VAT). */
  function vatXoay(cauHinh, tuThe, goc) {
    var oy = 4, P = (typeof window !== 'undefined') ? window.Part : null, U = 10;
    try {
      var d = P && P.lay('than', (cauHinh && cauHinh.than) || 'hai-banh'); if (d && d.oGan && d.oGan.tay) oy = d.oGan.tay.y;
      var t = P && P.lay('tay', 'xoay'); if (t && t.U_VAT) U = t.U_VAT;
    } catch (e) { /* giữ mặc định */ }
    var low = tuThe === 'duoi', R = U + (low ? 1.5 : 0), b = (goc || 0) * Math.PI / 180;
    return { f: 16 - oy + R * Math.cos(b), l: R * Math.sin(b), n: low ? 9 : 10 };
  }

  var VeRobot = {
    ve: ve, bongTay: bongTay, vatKep: vatKep, vatXoay: vatXoay, cauHinhCua: cauHinhCua, cauHinhRobot: cauHinhCua, chuanTay: chuanTay, tiLeChoO: tiLeChoO, coPart: coPart, sonChon: sonChon, sonHieuLuc: sonHieuLuc,
    REACH: REACH,                                                     // tâm thân → mép xa nhất của hình part (pixel part)
    dungPart: !/[?&]part=0/.test((typeof location !== 'undefined' && location.search) || '')
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = VeRobot;
  if (typeof window !== 'undefined') window.VeRobot = VeRobot;
})();
