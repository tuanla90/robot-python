var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve-robot.js — "Robot Chấn Hưng": LỚP VẼ ROBOT TÁCH RIÊNG (window.VeRobot).
   Mọi chỗ vẽ robot (sân chính, sân thử ở Xưởng, Lắp robot, thẻ Bộ phận, mở đầu, phim) đều gọi VeRobot.ve() / veCo(); hình do BỘ VẼ VECTOR
   (ve-vector.js, VeVector.robot) dựng. V7c2 (28/10): bộ PART điểm ảnh (game/part/) và hình tạm pixel đã xoá, tệp này chỉ còn đổi trạng thái của game
   sang trạng thái của hình vector + bộ đệm.

   VeRobot.ve(cauHinh, trangThai, huong, tiLe) → canvas đúng MỘT Ô (tâm canvas = tâm THÂN xe; cờ .laPart + .laVector)
     cauHinh   = { than: 'hai-banh' | 'xich' | 'nhen' | 'omni' | 'drone', tay: 'kep' | 'xoay' | 'nam-cham' | 'nem' | 'hoi' | 'son' | null, camBien: [{ ma, o }] }
                 VeRobot.cauHinhCua(man) (= cauHinhRobot) suy từ màn: man.robot = { than, tay, camBien } nếu có; không thì
                 than = 'nhen' khi man.loaiRobot === 'nhen', còn lại 'hai-banh'; tay theo lệnh tay trong man.hamGoc.
     tiLe      = cạnh ô / 100 (robot vẽ trong hệ 100 của một ô): VeRobot.tiLeChoO(canhO, cauHinh) = canhO / 100.
     trangThai = { wl, wr: 0|1|2 (bánh trái / phải: đứng / quay chậm / quay), ph: 0|1 (nhịp lật khung bánh),
                   tay: { tuThe: 'tren'|'giua'|'duoi', kep: bool (true = đóng), cam: id | null, … },
                   loi: 'tay' | null, lan / mat / tay.moK / tay.vung (gói V4: pha bánh theo quãng đi, mắt biểu cảm, kẹp mở dần, gáo vung dần) }
     huong     = 0 lên, 1 phải, 2 xuống, 3 trái.
   Gói V3: mọi thân / tay / cảm biến có hình vector (veVec đổi trạng thái: drone và nhện không tay hướng 0; nam châm có cực, súng, máy ném, máy sơn, tay xoay góc,
     nhện co, drone quạt / đo pin, camera sáng mắt); cấu hình cấm → VeVector.kiemGhep ném lỗi (cùng câu báo của bộ pixel cũ), báo một lần, rơi về hình TẠM
     (xe hai bánh vector không tay). vatXoay / hinhHoc / reachCua theo 1/100 ô (san-ve.js doiCo nhân với tiLe: miệng nòng, rổ máy ném, chân tia camera,
     đỉnh drone, lề lớp phủ khi tay xoay vươn sang ô bên). Cách vẽ lên sân (san-ve.js): robot vẽ trên LỚP PHỦ cả sân (có lề tràn ra), nên tay kẹp nhô ra mép sân vẫn không bị cắt.
   GÓI V4: VeRobot.veCo(cauHinh, trangThai, huong, pxCss) = robot NGOÀI SÂN theo cỡ ô hiển thị (px CSS): canvas một ô pxCss × PHONG_NGOAI_SAN × dpr,
     hiển thị cỡ width × heSoCss(cv).
   NHỆN CO CHÂN (chương nhen / che-nhen, 15/10): trangThai.co = true → nhện vẽ tư thế co (chân dang sát đất, thân dẹt); ảnh khác hẳn ảnh đứng nên là một phần của khóa bộ nhớ đệm.
   Drone (than 'drone'): bay cao, không có mặt trước nên huong luôn 0 và ảnh không xoay; cánh quạt quay theo pha ph (trangThai.wl / wr > 0 = đang quay); trangThai.camBien.bat sáng đèn thân (đang đo pin).
   CAMERA (camBien { ma:'camera', o:'tren' }, luật color() 14/10): không cắm cột nào lên thân, chỉ hiện HAI ĐỐM SÁNG Ở MẮT trên thân (trangThai.camBien.mat = true: đang đọc, hai mắt sáng rực). Không ghép cùng cảm biến màu ở bụng; drone không gắn camera (kiemGhep ném lỗi, hình rơi về hình tạm).
   CAMERA NHÌN XUỐNG của drone (camBien { ma:'camera-bay', o:'bung' }, hàm look(), 16/10): cụm ống kính ló ra mép trên khung drone (ổ 'bung'); trangThai.camBien.mat = true: đang đọc look() (kính xanh lơ rực, quầng sáng). Màn có look() mà chưa khai camera-bay thì cauHinhCua tự thêm.
   Nam châm treo dưới bụng drone là tay 'nam-cham' gắn vào ổ 'duoi' (không phải ổ 'tay' ở mũi); camBien { ma: 'pin' } không phải bộ phận nên cauHinhCua bỏ khỏi cấu hình ghép và đặt cờ pin: true.
   ========================================================================== */
(function () {
  'use strict';

  var cache = {};

  /* ---------------------------------------------------------------- cấu hình */
  /** Lệnh gốc của tay → mã tay (tay nào mở ra lệnh nào). Màn có lệnh tay mà không khai man.robot.tay thì lấy theo bảng này. */
  var TAY_THEO_LENH = {
    arm_down: 'kep', arm_up: 'kep', grab: 'kep', release: 'kep', arm_left: 'xoay', arm_right: 'xoay',
    magnet_n: 'nam-cham', magnet_s: 'nam-cham', magnet_off: 'nam-cham', aim: 'nem', throw: 'nem', load: 'nem', spray: 'hoi', spray_back: 'hoi',
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
    if (than !== 'drone' && than !== 'nhen' && (goc.indexOf('distance') >= 0 || goc.indexOf('warm') >= 0) && !cam.some(function (c) { return c.ma === 'hong-ngoai'; })) cam.push({ ma: 'hong-ngoai', o: 'tren' });
    // P1 mùa 3: cảm biến từ 'tu' là part riêng. Màn có front_metal / front_pole mà KHÔNG khai cảm biến nào ở hông (không khoang-cach, không tu) thì lắp 'tu' ở hông;
    // màn cũ mùa 1–2 đều khai khoang-cach (cảm biến từ ngày xưa ghép vào tai khoảng cách) nên hình cũ y nguyên; màn mùa 3 khai thẳng { ma: 'tu', o: 'hong' }.
    if (than !== 'drone' && than !== 'nhen' && (goc.indexOf('front_metal') >= 0 || goc.indexOf('front_pole') >= 0) && !cam.some(function (c) { return c.ma === 'tu' || c.ma === 'khoang-cach'; })) cam.push({ ma: 'tu', o: 'hong' });      // mùa 2: màn có distance() / warm() mà chưa khai: lắp cảm biến hồng ngoại ở mũi xe (ổ tren)
    return { than: than, tay: tay, camBien: cam, pin: !!(r.camBien || []).some(function (c) { return c.ma === 'pin'; }) };       // pin: drone có pin (đo battery()); không phải bộ phận nên không đưa vào ghép hình
  }

  function chuanTay(t) {
    t = t || {};
    return { tuThe: t.tuThe === 'duoi' ? 'duoi' : t.tuThe === 'giua' ? 'giua' : 'tren', kep: t.kep === true || t.kep === 'dong', cam: t.cam !== null && t.cam !== undefined && t.cam !== false,
      bat: !!t.bat, ngam: t.ngam || 1, dangNem: !!t.dangNem, dangBanTruoc: !!t.dangBanTruoc, dangBanSau: !!t.dangBanSau,
      mauSon: typeof t.mauSon === 'string' ? t.mauSon : null,                                     // máy sơn: màu đang chọn (ruột lon sơn); tuThe 'duoi' = đầu sơn đang hạ
      xoay: t.xoay === 'trai' || t.xoay === 'phai' ? t.xoay : 'truoc', goc: typeof t.goc === 'number' ? Math.round(t.goc / 5) * 5 : null,       // tay xoay: nấc khớp, và góc (độ, 0 = trước, âm = trái) khi đang xoay giữa chừng
      cuc: t.cuc === 'N' || t.cuc === 'S' ? t.cuc : null,                                                                                      // nam châm: cực đang bật (màu cực)
      moK: typeof t.moK === 'number' ? Math.round(Math.max(0, Math.min(1, t.moK)) * 4) / 4 : null, vung: typeof t.vung === 'number' ? Math.round(Math.max(0, Math.min(1, t.vung)) * 4) / 4 : null };   // gói V4: kẹp mở dần, gáo ném vung dần
  }

  /* ------------------------------------------------------------ bộ vẽ vector */
  var daBao = {};
  /** Bộ vẽ vector (ve-vector.js). */
  function VV() { var r = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : null); return (r && r.VeVector) || null; }
  /** Game luôn vẽ vector (V7c1 gỡ công tắc; V7c2 xoá bộ pixel). Giữ tên cho người gọi cũ. */
  function cheDoVector() { return true; }
  /** Cấu hình này đủ hình vector (mọi bộ phận đã đăng ký)? Mã lạ → false → ve() rơi về hình tạm. */
  function veVector(cauHinh) { var v = VV(); return !!(v && v.coDu(cauHinh || { than: 'hai-banh' })); }
  /** tiLe cho một ô sân cạnh canhO px: robot vẽ trong hệ 100 của một ô → 1 đơn vị = cạnh ô / 100 px. */
  function tiLeChoO(canhO) { return canhO / 100; }

  /** Màu sơn thật khi vẽ (26/10 user: mọi thân cùng một màu để chia phe và làm gói sơn): màu đội khác vàng giữ nguyên; còn lại là màu người chơi chọn,
   *  thiếu thì VÀNG, kể cả màn một robot (nhện, omni, xích, drone cũng sơn vàng như xe hai bánh). 'goc' = màu nhận diện gốc của thân (không sơn). */
  function sonHieuLuc(son) {
    if (son === 'goc') return null;
    if (son && son !== 'vang') return son;
    return 'vang';                                    // V7c1 (28/10): bỏ sơn mở khoá: R1 luôn 'vang' = màu đội (vecDoiR1 #38BDF8)
  }

  /** Robot vector (gói V3: mọi thân / tay / cảm biến): đổi trangThai của game sang trạng thái của hình (cùng quy ước hướng: drone và nhện không tay luôn hướng 0).
   *  Cấu hình cấm (drone + camera…): VeVector ném đúng lỗi của luật ghép → báo một lần, trả null (ve() rơi về hình tạm). */
  function veVec(cauHinh, tt, tay, son, huong, tiLe) {
    var cfg = { than: cauHinh.than || 'hai-banh', tay: cauHinh.tay || null, camBien: cauHinh.camBien || [], son: son }, cb = tt.camBien || {};
    var dThan = VV().lay('than', cfg.than), chay = tt.wl > 0 || tt.wr > 0, h = ((cfg.than === 'nhen' && (!cfg.tay || cfg.tay === 'nam-cham')) || (dThan && dThan.khongHuong)) ? 0 : huong;     // không hướng: đọc cờ khongHuong của hình vector (drone); nhện không tay / nam châm bụng (mùa 3) luôn hướng 0
    var st = {
      than: { banh: { trai: tt.wl > 0 ? 1 : 0, phai: tt.wr > 0 ? 1 : 0 }, buoc: chay && tt.ph ? 1 : 0, quat: chay, doc: !!cb.bat, co: !!tt.co },
      tay: cfg.tay ? { tuThe: tay.tuThe === 'duoi' ? 'duoi' : 'tren', kep: tay.kep ? 'dong' : 'mo', cam: !!tay.cam, bat: tay.bat, ngam: tay.ngam, dangNem: tay.dangNem, dangBanTruoc: tay.dangBanTruoc, dangBanSau: tay.dangBanSau,
        mauSon: tay.mauSon, xoay: tay.xoay, goc: tay.goc === null ? undefined : tay.goc, cuc: tay.cuc || undefined } : null,
      camBien: { bat: !!cb.bat, mat: !!cb.mat }
    };
    if (typeof tt.lan === 'number') st.than.lan = tt.lan;                                       // gói V4: pha bánh / xích / con lăn theo quãng đi (0..1)
    if (tt.mat) st.than.mat = tt.mat;                                                           // gói V4: biểu cảm mắt ('thuong' | 'chop1' | 'chop2' | 'dam' | 'vui' | 'ngac' | 'buon' | 'lim' …, kèm ':' + liếc)
    if (st.tay && tay.moK !== null) st.tay.moK = tay.moK;
    if (st.tay && tay.vung !== null) st.tay.vung = tay.vung;
    if (cfg.than !== 'drone') { delete st.than.quat; delete st.than.doc; }
    if (cfg.than !== 'nhen') delete st.than.co;
    else {                                                                                      // V8a: dáng bò của nhện (san-ve.js dangBo): hướng đi trong hệ thân, nhịp chuẩn bị nhấc chân
      if (typeof tt.di === 'number') st.than.di = tt.di;
      if (typeof tt.nhac === 'number') st.than.nhac = tt.nhac;
    }
    if (!cfg.camBien.length) delete st.camBien;
    try { return VV().robot(cfg, st, h, Math.round(tiLe * 100)); }
    catch (e) {
      var kb = 'vector:' + cfg.than + '/' + cfg.tay + '/' + JSON.stringify(cfg.camBien);
      if (!daBao[kb]) { daBao[kb] = 1; if (typeof console !== 'undefined' && console.warn) console.warn('VeRobot: vector không ghép được (' + kb + '): ' + e.message); }
      return null;
    }
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
      cauHinh.tay ? tay.tuThe + (tay.kep ? 'K' : 'm') + (tay.cam ? 'C' : '-') + (tay.bat ? 'B' : '') + tay.ngam + (tay.dangNem ? 'N' : '') + (tay.dangBanTruoc ? 'T' : '') + (tay.dangBanSau ? 'S' : '') + (cauHinh.tay === 'xoay' ? 'x' + (tay.goc === null ? tay.xoay : tay.goc) : '') + (cauHinh.tay === 'son' ? 's' + (tay.mauSon || '') : '') + (cauHinh.tay === 'nam-cham' && tay.cuc ? 'c' + tay.cuc : '') : '', tt.loi || '', son,
      typeof tt.lan === 'number' ? tt.lan : '', typeof tt.di === 'number' ? 'd' + tt.di : '', typeof tt.nhac === 'number' ? 'n' + tt.nhac : '', tt.mat || '', tay.moK === null ? '' : tay.moK, tay.vung === null ? '' : tay.vung].join('|');
    if (cache[khoa]) return cache[khoa];
    var cv = veVector(cauHinh) ? veVec(cauHinh, tt, tay, son, huong, tiLe) : null;      // VeVector tự đệm; tiLe = cạnh ô / 100 → canvas đúng một ô (tay xoay: tràn sang ô bên)
    if (!cv) cv = veVec({ than: 'hai-banh', tay: null, camBien: [] }, { wl: wl, wr: wr, ph: ph }, tay, son, huong, tiLe);     // hình TẠM (cấu hình cấm / mã lạ): xe hai bánh vector không tay (V7c2: trước là hình pixel Ve.makeRobot)
    cache[khoa] = cv;
    return cv;
  }

  /** ROBOT NGOÀI SÂN theo CỠ HIỂN THỊ (gói V4): màn Lắp robot, thẻ Bộ phận mới, mở đầu, phim gọi veCo thay vì ve(…, tiLe). pxCss = cạnh MỘT Ô hiển thị (px CSS)
   *  mà robot đứng trong đó (một ô = PX_O_PART (24) "pixel part" theo quy ước cũ: 48 → 2, 72 → 3…): canvas đúng một ô cạnh pxCss × PHONG_NGOAI_SAN × devicePixelRatio
   *  (tay xoay: tràn sang ô bên), cờ .cssMoiPx = px CSS mỗi px canvas (người gọi hiển thị canvas cỡ width × heSoCss(cv)). */
  var PX_O_PART = 24;
  /** Gói V5a (28/10): robot vector ngoài sân vẽ trong đúng một ô nên nhỏ hơn bản pixel cũ cùng pxCss ~17%; người giao chốt phóng ×1,2 (Lắp robot / thẻ Bộ phận mới). */
  var PHONG_NGOAI_SAN = 1.2;
  function veCo(cauHinh, trangThai, huong, pxCss) {
    pxCss = pxCss > 0 ? pxCss : 2 * PX_O_PART;
    var co = pxCss * PHONG_NGOAI_SAN;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1, canh = Math.max(1, Math.round(co * dpr));
    var cv = ve(cauHinh, trangThai, huong, canh / 100);
    if (cv) cv.cssMoiPx = co / canh;
    return cv;
  }
  /** Px CSS mỗi px của canvas robot (veCo) = 1 / devicePixelRatio (đúng cạnh ô pxCss); canvas không qua veCo: 1. */
  function heSoCss(cv) { return cv && cv.laVector && cv.cssMoiPx > 0 ? cv.cssMoiPx : 1; }

  /** Vật trong tay kẹp (luật vật 14/10): tâm vật cách tâm thân bao nhiêu (1/100 ô) về phía mũi xe và cạnh vật; gói V6b: cỡ theo độ nâng nangK (0..1, bỏ trống = theo tư thế).
   *  Dự phòng (tay không có khe): số gần đúng của tay kẹp. */
  var VAT_KEP_DU_PHONG = { ahead: 75, n: 42 };
  function vatKep(cauHinh, tuThe, nangK) {
    var vk = cauHinh && cauHinh.tay && veVector(cauHinh) ? VV().vatKep(cauHinh, tuThe, nangK) : null;
    return vk || VAT_KEP_DU_PHONG;
  }

  /** TAY XOAY: vị trí vật trong kẹp khi khớp ở góc `goc` độ (0 = phía trước, âm = sang trái, dương = sang phải; mặc định theo nấc `xoay`): { f, l, n } = vật cách tâm thân f
   *  (1/100 ô) về phía MŨI xe và l về bên PHẢI xe (theo hướng xe), cạnh vật n; hình học đo từ tay xoay vector; gói V6b: cỡ theo độ nâng. */
  function vatXoay(cauHinh, tuThe, goc, nangK) {
    var vx = veVector(cauHinh) ? VV().vatXoay(cauHinh, tuThe, goc, nangK) : null;
    if (vx) return vx;
    var b = (goc || 0) * Math.PI / 180, R = 42;                                   // dự phòng (không có tay xoay vector): vật cách tâm ~ nửa ô theo góc
    return { f: 50 + R * Math.cos(b) - R, l: R * Math.sin(b), n: VAT_KEP_DU_PHONG.n };
  }

  /** Hình học cho hiệu ứng (san-ve.js doiCo nhân với tiLe): { mz, mzs, bk, pp, dinh } = miệng nòng trước / nòng sau (súng hơi), rổ máy ném, một "pixel part" (chân tia camera),
   *  tâm → đỉnh hình drone (thanh pin), đơn vị 1/100 ô, đo từ hình vector. Dự phòng: hằng của bộ pixel cũ (24, 10,5, 23,5, 1, 11 pixel part) đổi sang 1/100 ô (× 100 / 24). */
  var HH_DU_PHONG = { mz: 100, mzs: 44, bk: 98, pp: 4.2, dinh: 46 };
  function hinhHoc(cauHinh) { var h = veVector(cauHinh) ? VV().hinhHoc(cauHinh) : null; return h || HH_DU_PHONG; }
  /** Tầm với của hình (tâm thân → mép xa nhất, đơn vị 1/100 ô) cho lề lớp phủ: nửa ô (50), tay xoay vươn sang ô bên thì hơn; gói V6b: chừa cả vật to trong tay nâng. */
  var REACH = 50;
  function reachCua(cauHinh) { var v = VV(); if (!v || !veVector(cauHinh)) return REACH; return v.tamVoi ? v.tamVoi(cauHinh) : REACH + 100 * v.tranCua(cauHinh); }

  var VeRobot = {
    ve: ve, veCo: veCo, heSoCss: heSoCss, PX_O_PART: PX_O_PART, PHONG_NGOAI_SAN: PHONG_NGOAI_SAN, vatKep: vatKep, vatXoay: vatXoay, hinhHoc: hinhHoc, reachCua: reachCua, cauHinhCua: cauHinhCua, cauHinhRobot: cauHinhCua, chuanTay: chuanTay, tiLeChoO: tiLeChoO, sonHieuLuc: sonHieuLuc,
    cheDoVector: cheDoVector, veVector: veVector, REACH: REACH
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = VeRobot;
  if (typeof window !== 'undefined') window.VeRobot = VeRobot;
})();
