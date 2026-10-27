var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   san-ve.js — "Robot Chấn Hưng": VẼ SÂN VÀ PHÁT LẠI VẾT (window.SanVe).
   Vẽ từ cấu hình sân của lõi { san, batDau, loaiRobot }: tường #, cờ F, bậc thang S,
   băng chuyền > < ^ v, vật o (thùng gỗ), ô đích D (khung vàng nét đứt), X (đích có sẵn vật, khung vàng đặc), robot.
   Robot luôn vẽ qua VeRobot.ve() (ve-robot.js), trên LỚP PHỦ cả sân (một canvas thứ hai nằm đè lên canvas sân, có lề tràn ra ngoài sân
   để tay kẹp nhô ra mép sân không bị cắt; độ phân giải = pixel thiết bị nên hình part luôn nguyên lần, rõ nét). Hạt, chớp đỏ, dấu ?/! cũng vẽ ở lớp phủ. Phát lại từng sự kiện 'nhip' của vết (kể cả tay gắp và vật).
   Chương cảm biến màu: ô sàn màu (ký hiệu r g b y trong sân hoặc lớp cfg.mau), vật có màu (cfg.vatMau, hay vat[i].mau), đích có màu (khung nét đứt tô màu đích;
   vật đúng màu nằm trên thì khung đặc, sai màu thì dấu ✗), vòng sáng + bong chữ màu khi cảm biến màu đọc (docCamBien.cam === 'mau').
   CAMERA (docCamBien.cam === 'camera', color() đọc ô TRƯỚC MẶT): hai tia từ đôi mắt trên thân tới ô được nhìn, ô đó nháy khung theo màu đọc được (nguon 'san' tô cả ô, 'vat' bốn góc ôm vật, 'chan' khung xám + X), hai đốm mắt sáng rực, bong chữ màu nổi trên xe.
   Chương nam châm: vật có chất (vatChat s sắt / g gỗ, hay vat[i].chat; sắt vẽ khối kim loại xám xanh, gỗ vẫn là thùng gỗ); tay nam châm (robot.tay === 'nam-cham'):
   vòng sóng tỏa 2 ô phía trước khi bật (dừng ở vật gỗ / tường), vật sắt bị hút bay về ô sát mũi xe rồi DÍNH (vẽ trên lớp phủ, theo xe và quay theo xe),
   thả thì rơi xuống, hut-go = sóng chạm vật gỗ rồi tắt + dấu ?, tha-bi-chan = vật rung + dấu !, cảm biến từ front_metal() = tia bạc (sắt) / nâu (gỗ).
   Chương máy ném: hàng rào thấp '=' (cọc + thanh ngang, thấy sàn phía sau, thanh nối liền ô kề), cfg.roBanDau = rổ có sẵn vật; robot.tay === 'nem': rổ ở đầu cần ném
   (vật trong rổ đi theo xe và quay theo xe), vạch ngắm mờ + vòng ở ô rơi theo tầm aim(n) (Field.datTam), nap-vat = vật nhảy vào rổ, nem-vat = vật bay vòng cung (to dần rồi nhỏ lại,
   bóng đổ dưới đất) qua rào / tường, nem-roi = nảy nhẹ, nem-vo = vỡ mảnh + ô rơi tô đỏ (ngoài sân thì ở mép), nem-hut / nap-hut = dấu ?, ro-day = dấu !.
   Chương súng hơi (robot.tay === 'hoi', hai nòng: nòng trước ở mũi, nòng sau ở đuôi): nút bắn N (nằm trên tường, bật / tắt theo vết `nut`), cửa C đóng / c mở (trượt mở / đóng theo vết `cua`; cửa nhịp có hàng đèn đếm nhịp),
   băng chuyền tắt (vết `bangTat`) đứng yên và mờ; thùng nặng H (thép xám, chỉ cú giật mới dời được). Một phát bắn = ban + giat chạy CÙNG LÚC: ban = bóng tròn bay thẳng từ miệng nòng (trước hay sau, theo `sau`; làn hơi phun ở miệng)
   tới ô `den` (trúng nút thì nút lóe rồi đổi, băng đổi ngay, cửa đổi ở cuối nhịp; bị chặn thì nảy ra; ra khỏi sân thì bay mất ở mép); giat = xe trượt một ô ngược hướng bắn (di), hay rung tại chỗ nếu ô sau xe bị chặn;
   có thùng nặng sau xe thì thùng trượt thẳng đi (thung-di nguon 'giat', bụi bốc theo), thùng bị chặn ngay thì xe và thùng cùng rung + dấu ! (thung-chan). cua-ket = cửa rung đỏ, ban-hut / ban-bi-chan = dấu ?, het-dan / ban-goi-lai = dấu !,
   số đạn còn (cfg.danToiDa) ở góc sân. Bắn nhanh (s.luc "fast", màn Lực bắn): làn hơi nhỏ, không có giat; hết tầm (s.hetTam) thì bóng rơi ở ô s.cuoi, bụi nhỏ, dấu ?.
   CAMERA NHÌN XUỐNG của drone (docCamBien.cam === 'camera-bay', look() đọc vật hay sàn ở ô NGAY DƯỚI drone, 16/10): kính camera ở mép trên khung sáng rực, ô dưới drone tô màu vừa đọc (vòng sáng như cảm biến màu ở bụng xe + vạch quét chạy từ trên xuống),
   bốn góc ngắm (viewfinder) ôm ô đó ở lớp trên (nguon 'vat' thì ôm vật nhỏ hơn, 'chan' thì góc xám + X), bong chữ màu nổi cạnh drone.
   Chương drone: robot.than === 'drone' (bay cao, không có mặt trước, cánh quạt luôn quay): bóng đổ lệch xuống dưới ô, rơi lên mặt rào / băng / vật / thùng khi bay qua ('bay-qua'),
   ô sạc P (đế sạc, nháy khi 'sac-pin'), thanh pin nhỏ nổi trên drone (robot.pin / cfg.pin; hết pin 'het-pin' thì rơi xuống, khói, dấu !), nam châm treo dưới bụng (vật nhấc lên rồi treo giữa khung
   cánh, thả thì rơi xuống ô dưới), cảm biến pin battery() nháy thanh pin và đèn thân (docCamBien.cam === 'pin').
   MÙA 2 (27/10): cảm biến HỒNG NGOẠI (docCamBien.cam === 'hong-ngoai', distance() / warm()): tia đỏ mảnh từ mũi xe tới vật cản, vạch nhỏ ở mỗi ô trống đi qua, ô vật cản ám đỏ; warm() thấy
   vật nóng thì ô đó loé cam + gợn nhiệt. NÚT BẮN ĐANG BẬT là NÓNG (luật warm): ngoài hình nút xanh còn có quầng đỏ cam thở và hai gợn nhiệt bay lên (veNong) — ở mọi màn có nút.
   XÍCH ĐẨY THÙNG (thung-di nguon 'xich'): thùng trượt cùng nhịp với bước 'tien' của xe (dính sát mũi). BỆ SÚNG XÍCH (be-sung): bắn tụ mà xe không giật, bệ rung tại chỗ (veGiuBe).
   CỠ SÂN (15/10): sân tự co giãn theo số ô (Field.canhO): cạnh ô = số nguyên px lớn nhất mà cả sân còn lọt khung `kich` (210) cả ngang lẫn dọc, trần `oToiDa` (84 px = 2 lần ô sân 5×5), sàn T (14 px);
   mỗi lần nạp sân (đổi sân trong màn nhiều sân, sân thử Xưởng) tính lại, lớp phủ robot dựng lại theo cỡ ô mới (doiCo), mọi hiệu ứng vẽ theo pixel sân nên co giãn cùng ô.
   KHUNG ÔM SÂN (15/10): vùng .ffr luôn 218×218 (cột nút bên cạnh không nhảy) nhưng khung gỗ viền sân là div .khung-san tự đặt theo canvas thật (datKhung: canvas + 4 px mỗi phía, kể cả khi sân dính đáy vì nhãn ⚠), phần còn lại của vùng là nền bàn xưởng; toast bám đáy khung qua --kw / --kdy.
   SÂN THỬ, CHẾ ĐỘ ĐẶT XE (15/10): Field.datSuaXe(bat) = viền vàng nhấp nháy quanh xe + mũi tên ↻ (xoay) ở góc sau-phải; Field.datKeoXe({x, y, tx, ty, hopLe, ngoai}) = xe đi theo ngón tay, ô đích sáng vàng / đỏ,
   khung nét đứt ở chỗ cũ; Field.xoayXe() = hoạt cảnh xe xoay 90°. Việc chạm / kéo nằm ở xuong-ham.js (pointer events); ở đây chỉ vẽ.
   CHẾ ĐỘ VECTOR (gói V1, 27/10, ve-vector.js; bật ?ve=vector, mặc định pixel): canvas sân lấy độ phân giải pixel THIẾT BỊ (pxO px mỗi ô, datDoPhanGiai) và vẽ qua phép phóng sv = pxO / T,
   nên mọi hiệu ứng vẫn tính theo pixel sân (T = 14 mỗi ô) như cũ; ô sàn / tường / cờ và thùng gỗ lấy canvas đệm vector đúng cỡ (oVec, hinhVat) vẽ 1:1 nên nét ở mọi cỡ ô;
   gói V2: MỌI ô (veOVec: bậc thang, băng, nút bắn / đè, cửa, rào, sạc, sàn màu, hố, gầm, bàn xoay, cổng, ô đích) và mọi vật (hinhVat / veVatVec: thùng gỗ, khối sắt,
   nam châm; thùng nặng; bóng hơi) cùng ảnh nhỏ thuSan (thuOVec, theo VeVector.KY_HIEU) vẽ bằng hình vector; trạng thái (pha băng, độ mở cửa…) là tham số của hình,
   còn quầng nóng / lóe / kẹt đỏ / nét đứt chạy của ô đích là lệnh trực tiếp theo pixel sân (nét nhờ sv). Robot vector do VeRobot trả về (cờ .laVector:
   đúng một ô, bóng đổ nằm trong hình, không vẽ vạch đế / mắt động / bóng tay riêng). Chế độ pixel: mọi đường đi y nguyên (sv = 1, canvas T px mỗi ô).
   Không chứa luật chơi: mọi kết quả (vị trí, hướng, sự kiện) đến từ lõi (SanHoc).
   ========================================================================== */
(function () {
  'use strict';

  var T = Ve.T;
  var K_INK = BM.vienDam;
  var SON_XE = ['vang', 'lam', 'do', 'tim'];                          // nhiều robot: màu sơn thân của R1, R2… (Part.SON); R1 giữ vàng chuẩn, đối thủ sau này dùng 'do'
  var MAU_XE = [BM.doiR1Vach, BM.doiR2Vach, BM.doiR3Vach, BM.doiR4Vach];          // màu đế (vạch dưới thân) của R1, R2…, trùng màu sơn và màu thẻ R1 / R2 ở khung code
  var ALT = 3;                      // drone: độ cao hiển thị (pixel sân) so với mặt ô; bóng đổ nằm ở mặt ô, lệch xuống dưới
  var HANG = 5.5;                   // drone: tâm vật treo dưới nam châm cách tâm thân drone bao nhiêu pixel sân (về phía dưới)
  var DEM_KHUNG = 4;                // khung gỗ ôm sát sân: bề dày gỗ quanh canvas sân (px CSS), bằng đệm của .ffr trước đây (xem Field.datKhung)
  var BANG = { '>': 1, 'v': 2, '<': 3, '^': 0 };
  var BAN_XOAY = { '@': 1, '%': -1 };
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  var FIELDS = [];
  var MAU_KY = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
  var MAU_RA = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };
  var GOC_XOAY = { trai: -90, truoc: 0, phai: 90 };                       // tay xoay: nấc khớp → góc (độ, 0 = phía trước, âm = sang trái)
  function HU() { return VeVector.HU; }                                 // hiệu ứng vector (ve-vector-hieu-ung.js, gói V4): chỉ gọi khi this.vec
  function laTayKep(t) { return t === 'kep' || t === 'xoay'; }            // tay kẹp thường và tay xoay đều kẹp vật ở ô tay chỉ
  var MAU_VIEN = { red: BM.luatKhungDo, green: BM.luatKhungXanhLa, blue: BM.luatKhungXanhDuong, yellow: BM.luatKhungVang };         // màu khung của vật mờ có màu (bóng mờ che-tay)
  function chuanMau(m) { return typeof m === 'string' ? (MAU_KY[m] || (MAU_RA[m] ? m : null)) : null; }
  /** Lớp màu (mảng chuỗi r g b y '.') + ký hiệu r g b y trong hàng sân → mảng hàng tên màu / null; null nếu sân không có ô màu. */
  function dungLopMau(rows, lop) {
    var h = rows.length, w = rows[0].length, kq = [], co = false;
    for (var y = 0; y < h; y++) {
      var hang = [];
      for (var x = 0; x < w; x++) {
        var m = MAU_KY[rows[y][x]] || (lop && lop[y] ? MAU_KY[lop[y][x]] : null) || null;
        if (m && rows[y][x] === '#') m = null;
        if (m) co = true;
        hang.push(m);
      }
      kq.push(hang);
    }
    return co ? kq : null;
  }
  var HIEU_UNG = { 'dinh-vat': 1, 'nhat-vat': 1, 'dat-vat': 1, 'vat-vo': 1, 'kep-hut': 1, 'xong-dua-vat': 1, 'xich-quay-do': 1, 'omni-khong-cheo': 1, 'xong-day-thung': 1, 'nem-dung-yen': 1, 'giat-chan': 1, 'doc-cam-bien': 1, 'ban-hut': 1, 'ban-bi-chan': 1, 'ban-goi-lai': 1, 'ban-dung-yen': 1, 'nut-doi': 1, 'nut-de': 1, 'bang-doi': 1, 'cua-doi': 1, 'cua-ket': 1, 'bay-qua': 1, 'qua-diem': 1, 'to-o': 1, 'to-thua': 1, 'to-sai-mau': 1, 'ha-but': 1, 'nhac-but': 1, 'xong-to-hinh': 1, 'son-goi-lai': 1, 'doi-thu-thang': 1, 'be-sung': 1 };   // sự kiện tức thì của tay (không chiếm thời gian của nhịp); be-sung: bệ súng xích giữ xe (rung trong bước 'ban')

  /** Hình mờ của máy sơn (man.hinh, một sân: mảng chuỗi r g b y '.') → mảng hàng tên màu / null; null nếu không có. */
  function dungHinh(lop) {
    if (!Array.isArray(lop) || !lop.length) return null;
    return lop.map(function (hang) { var kq = []; for (var x = 0; x < String(hang).length; x++) kq.push(MAU_KY[hang[x]] || null); return kq; });
  }
  function ngu(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  /** Bóng mờ của lõi (man.bongMo, một sân) → { x, y, d, diQua: [{x,y}], vat: [{x,y}] } hoặc null. Ô sai dạng bị bỏ; huong theo quy ước của lõi (0 lên, 1 phải, 2 xuống, 3 trái). */
  function chuanBongMo(b) {
    if (!b || typeof b !== 'object' || Array.isArray(b) || !isFinite(b.x) || !isFinite(b.y)) return null;
    function dsO(a) { return (Array.isArray(a) ? a : []).filter(function (o) { return o && isFinite(o.x) && isFinite(o.y); }).map(function (o) { var r = { x: Math.floor(o.x), y: Math.floor(o.y) }, m = chuanMau(o.mau); if (m) r.mau = m; return r; }); }   // vật mờ có thể mang màu (chấm theo màu)
    return { x: Math.floor(b.x), y: Math.floor(b.y), d: (((b.huong || 0) % 4) + 4) % 4, diQua: dsO(b.diQua), vat: dsO(b.vat), thung: dsO(b.thung),
      cam: !!b.cam, camMau: chuanMau(b.cam && typeof b.cam === 'object' ? b.cam.mau : b.camMau),
      xoay: b.xoay === 'trai' || b.xoay === 'phai' ? b.xoay : 'truoc',
      chan: b.chan === 'co' ? 'co' : 'dung' };                     // nhện: bóng mờ chân co hay duỗi            // cam: xe mờ đang cầm một vật (tay kẹp khép, vật mờ trong kẹp)
  }
  var bienCache = typeof WeakMap === 'function' ? new WeakMap() : null;
  /** Viền nét đứt quanh hình bóng của sprite (canvas cùng cỡ): những pixel TRONG suốt sát hình, cắt thành các đoạn theo đường chéo, độ dày ~ nửa pixel part. */
  function vienDut(spr, p) {
    var k = (bienCache && bienCache.get(spr)) || null;
    if (k && k.p === p) return k.cv;
    var w = spr.width, h = spr.height, o = document.createElement('canvas'); o.width = w; o.height = h;
    try {
      var d = spr.getContext('2d').getImageData(0, 0, w, h).data, r = Math.max(1, Math.round(p * 0.5)), dai = Math.max(3, Math.round(p * 2)), out = o.getContext('2d').createImageData(w, h), x, y, i, j, n, near;
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 60) continue;
        if ((Math.floor((x + y) / dai) & 1) === 1) continue;
        near = false;
        for (j = -r; j <= r && !near; j++) for (i = -r; i <= r; i++) {
          n = (y + j) * w + (x + i);
          if (x + i < 0 || y + j < 0 || x + i >= w || y + j >= h || (i === 0 && j === 0)) continue;
          if (i * i + j * j <= r * r + 1 && d[n * 4 + 3] > 60) { near = true; break; }
        }
        if (near) { n = (y * w + x) * 4; out.data[n] = 255; out.data[n + 1] = 217; out.data[n + 2] = 90; out.data[n + 3] = 255; }
      }
      o.getContext('2d').putImageData(out, 0, 0);
    } catch (e) { /* canvas không đọc được: không viền */ }
    if (bienCache) bienCache.set(spr, { p: p, cv: o });
    return o;
  }

  function Field(cv, tuyChon) {
    tuyChon = tuyChon || {};
    this.cv = cv; this.g = cv.getContext('2d');
    this.kich = tuyChon.kich || 210;           // cạnh khung (px màn hình) dành cho sân: sân tự co giãn cho vừa khung này (xem canhO)
    this.coNhoNhat = tuyChon.coNhoNhat || 0;   // >0: cạnh ô nhỏ nhất (px màn hình) khi sân đông ô; mặc định T (14 px)
    this.oToiDa = tuyChon.oToiDa || 0;         // cạnh ô lớn nhất (px màn hình); mặc định 6 × T = 84 px
    this.catMep = !!tuyChon.catMep;            // true: khi VẼ bỏ các hàng / cột ở mép toàn tường '#' trơn (xem vungCat); sân thử Xưởng không bật (người chơi đặt tường tự do)
    this.rid = 0; this.cfg = null;
    this.lop = null; this.lg = null; this.lopOK = false; this.lopKhoa = ''; this.dem = 0;   // lớp phủ robot
    this.khung = null; this.khungKhoa = '';                                                   // khung gỗ ôm sát sân (xem datKhung)
    this.suaXe = false; this.keoXe = null;                                                    // sân thử Xưởng, chế độ Đặt xe (xem datSuaXe / datKeoXe)
    this.pw = 0; this.ph = 0; this.pxO = 0; this.sv = 1; this.vec = false;                     // cỡ canvas theo pixel sân; chế độ vector: px thiết bị mỗi ô và phép phóng (datDoPhanGiai)
    this.clearFx();
    FIELDS.push(this);
  }
  Field.prototype = {
    /** Nạp một sân: cfg = { san: [chuỗi], batDau: {x,y,huong}, loaiRobot,
     *  danhDau: {x,y} (tuỳ chọn: vòng mờ đánh dấu ô xuất phát), vat: [{x,y}] (tuỳ chọn: khối hàng vẽ trên sàn, không ảnh hưởng luật), cat: {trai,phai,tren,duoi} (tuỳ chọn: cạnh nào bị cắt → vẽ dấu …) }. */
    nap: function (cfg) {
      var rows = cfg.san, w = rows[0].length, h = rows.length;
      var loai = cfg.loaiRobot || 'banh';
      this.cfg = { rows: rows, w: w, h: h, bd: cfg.batDau, loai: loai, co: null, dd: cfg.danhDau || null, cat: cfg.cat || null, vat: cfg.vat || [], mauO: dungLopMau(rows, cfg.mau), vatMau: cfg.vatMau || null, vatChat: cfg.vatChat || null, roBanDau: cfg.roBanDau || null, danToiDa: typeof cfg.danToiDa === 'number' ? cfg.danToiDa : null, nutBat: Array.isArray(cfg.nutBat) ? cfg.nutBat : null, pin: typeof cfg.pin === 'number' && cfg.pin > 0 ? cfg.pin : null, sac: [],
        robot: cfg.robot || { than: loai === 'nhen' ? 'nhen' : 'hai-banh', tay: null, camBien: [] }, dich: [], cacCo: [],
        bm: chuanBongMo(cfg.bongMo),                     // mục tiêu 'bong-mo': xe mờ ở tư thế đích, vật mờ, ô ◆ phải đi qua
        hinh: dungHinh(cfg.hinh), sonBanDau: dungHinh(cfg.sonBanDau), mucBanDau: typeof cfg.mucBanDau === 'string' ? cfg.mucBanDau : 'red' };      // máy sơn: hình mờ cần tô, màu sơn lúc đầu
      // nhiều robot (cfg.doi = [{ robot, batDau, loaiRobot, pin, danToiDa }]): mỗi xe một ngữ cảnh (xem chonXe); this.cfg mang phần của xe đang xét
      this.cfgXe = Array.isArray(cfg.doi) ? cfg.doi.map(function (r, i) {
        var l = r.loaiRobot || 'banh', rb = r.robot || { than: l === 'nhen' ? 'nhen' : 'hai-banh', tay: null, camBien: [] };
        var son = rb.son || (cfg.doiKhang && i === 1 ? 'do' : SON_XE[i % SON_XE.length]);
        var idxM = SON_XE.indexOf(son);
        return { robot: Object.assign({}, rb, { son: son }), mauXe: MAU_XE[idxM >= 0 ? idxM : (i % MAU_XE.length)], bd: r.batDau, loai: l,
          pin: typeof r.pin === 'number' && r.pin > 0 ? r.pin : null, danToiDa: typeof r.danToiDa === 'number' ? r.danToiDa : null,
          roBanDau: r.roBanDau || null, co: Array.isArray(r.co) ? r.co : null };
      }) : null;
      this.xe = null; this.xeDang = 0;
      if (this.cfgXe) this.apCfgXe(0);
      this.vat0 = []; this.thung0 = [];
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var ch = rows[y][x];
        if (ch === 'F' && !this.cfg.co) this.cfg.co = { x: x, y: y };
        if (ch === 'F') this.cfg.cacCo.push({ x: x, y: y, chu: this.chuCo(x, y) });       // màn nhiều robot có nhiều cờ (mỗi robot một cờ): vẽ hết; cờ riêng mang màu robot chủ
        if (ch === 'P') this.cfg.sac.push({ x: x, y: y });
        if (ch === 'D' || ch === 'X' || ch === 'h') this.cfg.dich.push({ x: x, y: y, mau: this.mauNen(x, y) });
        if (ch === 'o' || ch === 'X') {
          var kc = this.cfg.vatChat && this.cfg.vatChat[y] ? this.cfg.vatChat[y][x] : null;                    // s sắt · N / S vật nam châm (chữ là cực) · còn lại gỗ
          this.themVat(x, y, this.cfg.vatMau && this.cfg.vatMau[y] ? MAU_KY[this.cfg.vatMau[y][x]] : null, kc === 's' ? 'sat' : (kc === 'N' || kc === 'S') ? 'nam-cham' : null, (kc === 'N' || kc === 'S') ? kc : null);
        }
        if (ch === 'H' || ch === 'h') this.themThung(x, y);
      }
      (cfg.vat || []).forEach(function (o) { this.themVat(Math.floor(o.x), Math.floor(o.y), chuanMau(o.mau), o.chat === 'sat' ? 'sat' : o.chat === 'nam-cham' ? 'nam-cham' : null, o.cuc); }, this);   // cùng thứ tự với SanHoc.chay: id 1, 2, ...
      if (cfg.roBanDau && this.cfg.robot.tay === 'nem') {          // máy ném: rổ có sẵn một vật lúc xuất phát (id cuối cùng, như SanHoc.chay)
        var rb = typeof cfg.roBanDau === 'object' ? cfg.roBanDau : {};
        this.vat0.push({ id: this.vat0.length + 1, x: cfg.batDau.x, y: cfg.batDau.y, mau: chuanMau(rb.mau), chat: rb.chat === 'sat' ? 'sat' : 'go', ro: true });
      }
      (this.cfgXe || []).forEach(function (xe) {                   // nhiều robot: rổ có sẵn vật của từng xe máy ném, cùng thứ tự id với SanHoc.chay (R1 trước)
        if (!xe.roBanDau || xe.robot.tay !== 'nem') return;
        var rx = typeof xe.roBanDau === 'object' ? xe.roBanDau : {};
        this.vat0.push({ id: this.vat0.length + 1, x: xe.bd.x, y: xe.bd.y, mau: chuanMau(rx.mau), chat: rx.chat === 'sat' ? 'sat' : 'go', ro: true });
      }, this);
      this.dungCua(rows, cfg.cuaNhip);
      (cfg.thung || []).forEach(function (o) { this.themThung(Math.floor(o.x), Math.floor(o.y)); }, this);   // thùng nặng thêm ngoài sân (sân thử của Xưởng): cùng thứ tự với SanHoc.chay
      var cat = cfg.catMep === undefined ? this.catMep : !!cfg.catMep, vg = cat ? this.vungCat() : { ox: 0, oy: 0, vw: w, vh: h };
      this.cfg.ox = vg.ox; this.cfg.oy = vg.oy; this.cfg.vw = vg.vw; this.cfg.vh = vg.vh;      // cửa sổ VẼ (ô): mọi tọa độ vẫn là tọa độ ô của lõi, chỉ canvas / lớp phủ dịch gốc về (ox, oy)
      var canhO = this.canhO(vg.vw, vg.vh), xuongDay = this.nhanDeLenO(vg, canhO);    // sân tự co giãn theo số ô nhìn thấy: ô to nhất mà cả sân còn lọt khung (xem canhO)
      if (xuongDay) canhO = Math.min(canhO, Math.floor(xuongDay / vg.vh));              // nhãn ⚠ sẽ đè lên ô có gì đó: sân nhường chỗ phía trên cho nhãn (canvas dính đáy khung)
      this.cv.style.alignSelf = xuongDay ? 'flex-end' : '';
      var k = canhO / T;
      this.k = k;
      this.pw = vg.vw * T; this.ph = vg.vh * T;                                             // cỡ canvas theo PIXEL SÂN (hệ toạ độ logic, T px mỗi ô): mọi hiệu ứng vẽ theo hệ này
      this.vec = !!(window.VeVector && VeVector.bat());                                     // chế độ vector: canvas sân theo pixel thiết bị (doiCo đo lại f thật khi canvas đã hiện)
      this.datDoPhanGiai(this.vec ? Math.round(canhO * (window.devicePixelRatio || 1)) : 0);
      var rongPx = vg.vw * canhO, caoPx = vg.vh * canhO;                                   // cạnh ô là SỐ NGUYÊN px màn hình nên cả hai chiều đều tròn px, lớp phủ robot (doiCo) khớp từng ô
      this.cv.style.width = rongPx + 'px'; this.cv.style.height = caoPx + 'px';
      this.cv.style.marginRight = (rongPx & 1) ? '1px' : ''; this.cv.style.marginBottom = (caoPx & 1) ? '1px' : '';    // bề rộng / cao lẻ thì khung canh giữa sẽ đặt sân ở nửa px (nhòe cạnh, lệch lớp phủ nửa px): thêm 1 px lề để vị trí tròn px
      this.lopKhoa = ''; this.doiCo();
      this.datLai();
    },
    /** Độ phân giải canvas sân. pxO = 0: chế độ pixel, T px canvas mỗi ô, CSS phóng pixelated (như cũ). pxO > 0 (chế độ vector): pxO px thiết bị mỗi ô, draw() phóng sv = pxO / T
     *  nên mọi hiệu ứng vẫn tính theo pixel sân; ô / vật vector lấy canvas đệm đúng pxO px (oVec, hinhVat) vẽ 1:1; hình pixel còn lại phóng nguyên (imageSmoothing tắt). */
    datDoPhanGiai: function (pxO) {
      var c = this.cfg; if (!c) return;
      this.pxO = pxO || 0; this.sv = pxO ? pxO / T : 1;
      this.cv.width = pxO ? c.vw * pxO : this.pw; this.cv.height = pxO ? c.vh * pxO : this.ph;
      this.cv.style.imageRendering = pxO ? 'auto' : '';
      this.g = this.cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
    },
    /** Chế độ vector: canvas đệm của ô vector `ma` (trạng thái s) cạnh MỘT Ô theo pixel thiết bị của g (canvas sân: pxO; lớp phủ robot: theo phép biến hình của nó). */
    oV: function (ma, s, g) { return VeVector.o(ma, g ? Math.max(1, Math.round(T * this.tiLeCua(g))) : this.pxO, s); },
    /** Chế độ vector (gói V2): vẽ trọn một ô (x, y) ký hiệu ch bằng hình vector (ve-vector-o*.js, ve-vector-may.js), trạng thái lấy từ vết như nhánh pixel của draw():
     *  nút bắn bật / loé, băng tắt / pha chạy, nút đè, bàn xoay và cổng theo pha đồng hồ, cửa theo độ mở; ô "vẽ đè" (sạc, nút đè, bàn xoay, cổng, cửa, rào) vẽ trên sàn (hay sàn màu).
     *  Còn lệnh trực tiếp theo pixel sân (nét nhờ phép phóng sv): quầng nóng nút bắn (veNong), lóe trắng băng vừa tắt (veBangTat). */
    veOVec: function (g, x, y, ch, kO, now, cf, ff) {
      var self = this, c = this.cfg, px = x * T, py = y * T;
      function ve(ma, s) { g.drawImage(self.oV(ma, s), px, py, T, T); }
      if (ch === '#') { ve('tuong'); return; }
      if (ch === 'N') { var nt = this.nutT[kO], bat = !!(nt && nt.bat); ve('nut-ban', { bat: bat, loe: !!(nt && nt.loe > now) }); if (bat) this.veNong(g, x, y, now); return; }
      if (BANG[ch] !== undefined) { var tat = !!this.bangTat[kO]; ve('bang', { huong: BANG[ch], pha: tat ? 0 : Math.floor((now / 130) % 5 * 4) / 4, tat: tat }); if (tat) this.veBangTat(g, x, y, now); return; }   // gói V4: băng chạy liên tục (pha lẻ 1/4)
      if (ch === 'S') { ve('bac-thang'); return; }
      if (ch === 'n') { ve('gam'); return; }
      if (ch === 'u') { ve('ho'); return; }
      var mn = (ch === '=' || ch === 'C' || ch === 'c') ? null : this.mauNen(x, y);   // như nhánh pixel: sàn màu ở mọi ô trừ tường, bậc, rào, nút bắn, cửa, gầm, hố, băng
      ve(mn ? 'san-mau' : 'san', mn ? { mau: mn } : (x + y) & 1 ? { le: 1 } : undefined);      // gói V4: sàn bàn cờ hai tông theo (x + y)
      if (ch === 'P') { ve('sac', { pha: (now / 450 | 0) & 1 }); HU().thoSac(g, x, y, now); }        // gói V4: ô sạc thở
      else if (ch === 'M') ve('nut-de', { de: !!this.nutDeT[kO] });
      else if (BAN_XOAY[ch] !== undefined) ve('ban-xoay', { chieu: BAN_XOAY[ch], pha: Math.floor((now / 180) % 4 * 4) / 4 });   // gói V4: mâm quay liên tục
      else if (ch === '1' || ch === '2') ve('cong', { so: ch, pha: ff });
      else if (ch === 'C' || ch === 'c') this.veMotCua(g, this.cuaT[kO], now);
      else if (ch === '=') ve('rao', { mask: (x > 0 && c.rows[y][x - 1] === '=' ? 1 : 0) | (x < c.w - 1 && c.rows[y][x + 1] === '=' ? 2 : 0) | (y > 0 && c.rows[y - 1][x] === '=' ? 4 : 0) | (y < c.h - 1 && c.rows[y + 1][x] === '=' ? 8 : 0) });
    },
    /** Chế độ vector: vẽ vật o (thùng gỗ / khối sắt / nam châm, ve-vector-ky-hieu.js vatCua) tâm (cx, cy), THÂN cạnh `than` (đơn vị của g; thân vector chiếm 76% hộp nên hộp = than / 0,76). */
    veVatVec: function (g, o, cx, cy, than) {
      var h = than / 0.76; g.drawImage(this.hinhVat(o, 8, Math.round(h * this.tiLeCua(g))), cx - h / 2, cy - h / 2, h, h);
    },
    /** Vật nằm đất: cạnh (pixel sân). Pixel: 8 (≈ 57% ô, luật vật 14/10); vector: 10,5 (thùng vector chiếm 76% hộp → cũng ≈ 57% ô). Và tâm theo chiều dọc: pixel 6 (bóng đổ chiếm 2 hàng dưới), vector 7 (giữa ô). */
    coVatDat: function () { return this.vec ? 10.5 : 8; },
    yVatDat: function () { return this.vec ? 7 : 6; },
    /** Tỉ lệ pixel thiết bị trên một đơn vị của g (phép biến hình hiện tại), để lấy canvas đệm vector đúng cỡ. */
    tiLeCua: function (g) { try { var m = g.getTransform(); return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1; } catch (e) { return 1; } },
    /** Cửa sổ vẽ { ox, oy, vw, vh } (ô): bao quanh mọi ô KHÔNG phải tường '#' trơn và mọi ô có gì đó đặt lên (ô xuất phát, ô đánh dấu, vật, thùng, xe mờ / vật mờ / ◆ của bóng mờ),
     *  tức là bỏ các hàng / cột ở MÉP toàn tường '#' (lặp tới khi mép còn một ô khác tường). Chỉ để vẽ: luật chạy và tọa độ của lõi không đổi, mép gỗ của khung đóng vai bức tường đã cắt. */
    vungCat: function () {
      var c = this.cfg, w = c.w, h = c.h, giu = {}, x0 = w, y0 = h, x1 = -1, y1 = -1, x, y;
      function danh(o) { if (o && isFinite(o.x) && isFinite(o.y)) giu[Math.floor(o.x) + ',' + Math.floor(o.y)] = 1; }
      danh(c.bd); danh(c.dd); this.vat0.forEach(danh); this.thung0.forEach(danh);
      if (c.bm) { danh(c.bm); c.bm.vat.forEach(danh); c.bm.thung.forEach(danh); c.bm.diQua.forEach(danh); }
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        if (c.rows[y][x] === '#' && !giu[x + ',' + y]) continue;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      return x1 < 0 ? { ox: 0, oy: 0, vw: w, vh: h } : { ox: x0, oy: y0, vw: x1 - x0 + 1, vh: y1 - y0 + 1 };
    },
    /** Nhãn ⚠ (datCanhBao, nằm góc trái trên khung, CSS, DƯỚI lớp phủ robot nên không che xe) sẽ đè lên một ô QUAN TRỌNG nếu sân vẽ cỡ canhO và canh giữa khung? Ô quan trọng = ô có gì khác sàn trơn / tường
     *  (cờ, ô đích, vật, thùng, băng, nút, cửa, ô màu, ◆, vật mờ...). Có thì trả về chiều cao (px) còn lại dưới nhãn cho sân (canvas sẽ dính đáy khung, nhãn nằm trên đầu sân);
     *  không thì 0 (nhãn nằm trên gỗ trống, hoặc chỉ che tường / sàn trơn nơi xe đi qua vẫn thấy). Sân thử Xưởng không có nhãn. */
    nhanDeLenO: function (vg, canhO) {
      var par = this.cv.parentNode, lb = par && par.querySelector ? par.querySelector('.canh-bao') : null, c = this.cfg;
      if (!lb || lb.style.display === 'none' || !lb.offsetWidth || !par.clientWidth) return 0;
      var pad = Math.max(0, (par.clientWidth - this.kich) / 2), lx0 = lb.offsetLeft, ly0 = lb.offsetTop, lx1 = lx0 + lb.offsetWidth + 2, ly1 = ly0 + lb.offsetHeight + 2;
      var cx0 = pad + (this.kich - vg.vw * canhO) / 2, cy0 = pad + (this.kich - vg.vh * canhO) / 2, x, y, qt = {};
      function danh(o) { if (o && isFinite(o.x) && isFinite(o.y)) qt[Math.floor(o.x) + ',' + Math.floor(o.y)] = 1; }
      danh(c.dd); this.vat0.forEach(danh); this.thung0.forEach(danh); if (c.bm) { c.bm.vat.forEach(danh); c.bm.thung.forEach(danh); c.bm.diQua.forEach(danh); }
      for (y = vg.oy; y < vg.oy + vg.vh; y++) for (x = vg.ox; x < vg.ox + vg.vw; x++) {
        if ((c.rows[y][x] === '#' || c.rows[y][x] === '.') && !qt[x + ',' + y] && !this.mauNen(x, y)) continue;
        var x0 = cx0 + (x - vg.ox) * canhO, y0 = cy0 + (y - vg.oy) * canhO;
        if (x0 < lx1 && x0 + canhO > lx0 && y0 < ly1 && y0 + canhO > ly0) return Math.max(1, this.kich + pad - ly1 - 1);
      }
      return 0;
    },
    /** Ô (x, y) (tọa độ lõi) nằm ngoài cửa sổ vẽ chưa (ô ngoài sân, hoặc tường mép đã cắt). */
    ngoaiKhung: function (x, y) {
      var c = this.cfg;
      return x < c.ox || y < c.oy || x >= c.ox + c.vw || y >= c.oy + c.vh;
    },
    /** Cạnh một ô sân (px màn hình, số nguyên) cho sân w × h ô: ô to nhất mà CẢ sân còn lọt vừa khung `kich` (ngang lẫn dọc, nên theo cạnh dài), không quá `oToiDa`
     *  (mặc định 6 pixel sân = 84 px, gấp đôi ô của sân 5×5 để sân 1×2 không thành khổng lồ), không dưới `coNhoNhat` (mặc định T = 14 px, một pixel sân = một pixel màn hình).
     *  Ví dụ khung 210: 3 ô → 70, 4 → 52, 5 → 42, 6 → 35, 7 → 30, 12 → 17 (trước đây chỉ nhảy theo số nguyên lần pixel sân: 70 / 42 / 28 / 14, nên sân 6 ô chỉ còn 28 và sân 8 ô chỉ còn 14).
     *  Hình sân vẫn vẽ ở độ phân giải gốc (T pixel mỗi ô) rồi phóng (image-rendering: pixelated); tỉ lệ lẻ chỉ làm bề rộng pixel sân lệch nhau một chút. */
    canhO: function (w, h) {
      var vua = Math.floor(this.kich / Math.max(w, h, 1)), tran = this.oToiDa > 0 ? this.oToiDa : 6 * T, san = this.coNhoNhat > 0 ? Math.min(this.coNhoNhat, T) : T;
      return Math.max(san, Math.min(tran, vua));
    },
    /** Màu sàn của ô (x, y) (tên màu của lõi) hoặc null. */
    mauNen: function (x, y) {
      var m = this.cfg.mauO;
      return m && m[y] && m[y][x] ? m[y][x] : null;
    },
    /** Thêm một vật ban đầu (mỗi ô tối đa một, không nằm trong tường / ngoài sân), id = thứ tự thêm. mau: tên màu của vật hoặc null. */
    /** Robot chủ của cờ (x, y) ở màn nhiều robot có cờ riêng (cfg.doi[i].co); null = cờ chung. */
    chuCo: function (x, y) {
      var ds = this.cfgXe || [];
      for (var i = 0; i < ds.length; i++) if (ds[i].co && ds[i].co.some(function (q) { return q.x === x && q.y === y; })) return i;
      return null;
    },
    themVat: function (x, y, mau, chat, cuc) {
      var c = this.cfg;
      if (!(x >= 0 && y >= 0 && x < c.w && y < c.h) || c.rows[y][x] === '#' || c.rows[y][x] === '=') return;
      for (var i = 0; i < this.vat0.length; i++) if (this.vat0[i].x === x && this.vat0[i].y === y) return;
      var laNC = chat === 'nam-cham' && (cuc === 'N' || cuc === 'S');                                 // vật nam châm: chữ N / S là cực quay về phía xe (màu theo cực nếu màn không khai màu riêng)
      this.vat0.push({ id: this.vat0.length + 1, x: x, y: y, mau: mau || (laNC ? (cuc === 'N' ? 'red' : 'blue') : null), chat: chat === 'sat' ? 'sat' : laNC ? 'nam-cham' : 'go', cuc: laNC ? cuc : null });
    },
    /** Thêm một thùng nặng ban đầu (mỗi ô tối đa một, không nằm trong tường / ngoài sân), id = thứ tự thêm. */
    themThung: function (x, y) {
      var c = this.cfg;
      if (!(x >= 0 && y >= 0 && x < c.w && y < c.h) || c.rows[y][x] === '#') return;
      for (var i = 0; i < this.thung0.length; i++) if (this.thung0[i].x === x && this.thung0[i].y === y) return;
      this.thung0.push({ id: this.thung0.length + 1, x: x, y: y });
    },
    /** Súng hơi: danh sách cửa (C đóng / c mở) và hướng đi qua cửa, cùng chu kỳ của cửa nhịp [{ x, y, mo, dong, pha }]. Cửa đi theo chiều dọc (doc: hai cánh trượt ngang)
     *  khi hai bên trái / phải là tường, đi theo chiều ngang khi hai bên trên / dưới là tường; không rõ thì coi là chiều dọc. */
    dungCua: function (rows, cuaNhip) {
      var w = rows[0].length, h = rows.length, x, y, ch;
      function tuong(a, b) { if (a < 0 || b < 0 || a >= w || b >= h) return true; var c = rows[b][a]; return c === '#' || c === 'N'; }
      this.cuaDS = []; this.cuaNhipBy = {};
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        ch = rows[y][x];
        if (ch !== 'C' && ch !== 'c') continue;
        var ngang = tuong(x - 1, y) && tuong(x + 1, y), dung = tuong(x, y - 1) && tuong(x, y + 1);
        this.cuaDS.push({ x: x, y: y, mo0: ch === 'c', doc: !(dung && !ngang) });
      }
      (cuaNhip || []).forEach(function (cn) { this.cuaNhipBy[cn.x + ',' + cn.y] = { mo: cn.mo, dong: cn.dong, pha: cn.pha || 0 }; }, this);
    },
    /** Trạng thái hiển thị ban đầu của nút, cửa, băng chuyền: nút tắt (trừ nút bật sẵn cfg.nutBat: bật, nóng ngay khung đầu), cửa theo ký hiệu (cửa nhịp: theo pha), băng chạy hết. */
    datLaiCua: function () {
      this.nutT = {}; this.nutDeT = {}; this.cuaT = {}; this.bangTat = {}; this.bangLoe = {}; this.nhipDa = 0;
      var self = this;
      ((this.cfg && this.cfg.nutBat) || []).forEach(function (o) { self.nutO(o.x, o.y).bat = true; });
      this.cuaDS.forEach(function (d) {
        var nh = self.cuaNhipBy[d.x + ',' + d.y], mo = nh ? (nh.pha % (nh.mo + nh.dong)) < nh.mo : d.mo0;
        self.cuaT[d.x + ',' + d.y] = { x: d.x, y: d.y, mo: mo, k: mo ? 1 : 0, doc: d.doc, nhip: nh || null, ket: 0, rung: 0 };
      });
    },
    /** Nhiều robot: đưa phần cấu hình của xe i (robot, xuất phát, loại, pin, đạn) vào this.cfg. */
    apCfgXe: function (i) {
      var x = this.cfgXe[i];
      this.cfg.robot = x.robot; this.cfg.bd = x.bd; this.cfg.loai = x.loai; this.cfg.pin = x.pin; this.cfg.danToiDa = x.danToiDa;
    },
    /** Nhiều robot: đổi sang ngữ cảnh xe i (hình xe, bánh, tia cảm biến, cấu hình). Hoạt cảnh (phatNhip) và vẽ xe luôn làm việc với xe đang xét. */
    chonXe: function (i) {
      if (!this.xe || i === this.xeDang) return;
      var cu = this.xe[this.xeDang];
      cu.vis = this.vis; cu.wh = this.wh; cu.docs = this.docs;
      var mo = this.xe[i];
      this.vis = mo.vis; this.wh = mo.wh; this.docs = mo.docs;
      this.apCfgXe(i); this.xeDang = i;
    },
    datLai: function () {
      this.rid++;
      if (this.xe) this.chonXe(0);
      this.khoiVis();
      this.objs = this.vat0.map(function (o) { return { id: o.id, x: o.x, y: o.y, tt: o.ro ? 'ro' : 'dat', voLuc: 0, mau: o.mau || null, chat: o.chat || 'go', cuc: o.cuc || null, nang: 0, dx: 0, dy: 0 }; });
      this.oVo = [];                                                                                          // ô rơi vỡ (nem-vo): tô đỏ tới khi chạy lại
      this.keoXe = null;                                                                                        // nạp lại / thử lại thì hết cảnh kéo xe dở (chế độ Đặt xe vẫn bật: this.suaXe)
      this.sacO = null;                                                                                         // ô sạc đang lóe: { x, y }
      this.bong = null;                                                                                         // quả bóng đang bay: { x, y, r, a } (pixel sân)
      this.datLaiCua();
      this.canhBao = null;
      this.daSon = {}; this.sonLoe = {};                                                                       // máy sơn: ô đã tô ('x,y' → màu), ô vừa tô (khóa → lúc tô, để lóe)
      var sbd = this.cfg.sonBanDau, self0 = this;                                                              // ô sơn sẵn từ lúc xuất phát (màn đọc sơn bằng color())
      if (sbd) sbd.forEach(function (hang, y) { hang.forEach(function (m, x) { if (m) self0.daSon[x + ',' + y] = m; }); });
      this.diQuaSang = {}; this.bmNhay = 0;                                                                    // bóng mờ: ô ◆ đã sáng (khóa 'x,y' → lúc sáng), tới lúc nào bóng còn nháy (sai chỗ / chưa qua ◆)
      this.thungs = this.thung0.map(function (o) { return { id: o.id, x: o.x, y: o.y, dx: 0, dy: 0, ket: false }; });
      this.clearFx();
      if (this.cfgXe) {                                                                                         // nhiều robot: mỗi xe một hình xe, bánh, tia cảm biến riêng
        var ds = [];
        for (var i = 0; i < this.cfgXe.length; i++) { this.apCfgXe(i); this.khoiVis(); ds.push({ vis: this.vis, wh: { L: 0, R: 0 }, docs: [] }); }
        this.xe = ds; this.xeDang = 0; this.apCfgXe(0);
        this.vis = ds[0].vis; this.wh = ds[0].wh; this.docs = ds[0].docs;
      }
    },
    /** Hình xe ở chỗ xuất phát theo this.cfg (xe đang xét). */
    khoiVis: function () {
      var b = this.cfg.bd;
      this.vis = { x: b.x, y: b.y, d: b.huong || 0, goc: 0, chan: 0, co: b.chan === 'co', roi: 0, hop: 0, dx: 0, dy: 0, tay: this.cfg.robot.tay === 'xoay' ? { tuThe: 'tren', kep: false, cam: null, xoay: 'truoc' } : { tuThe: 'tren', kep: false, cam: null }, tayDo: 0, bao: null, baoDen: 0, choang: 0 };
      this.vis.nem = this.cfg.robot.tay === 'nem' ? { tam: 1, ang: null, dang: 0, rung: 0, loi: 0, doi: 0 } : null;      // máy ném: tam = tầm đang đặt; ang = góc đầu cần khi đang quay; dang = tới lúc nào cần còn vung lên; rung = rổ rung; doi = lúc vừa đổi tầm
      this.vis.nc = this.cfg.robot.tay === 'nam-cham' ? { bat: false, cuc: null, ang: null, rung: 0 } : null;       // tay nam châm: bat = đang bật; ang = góc mũi xe khi đang quay (null: theo hướng xe); rung = tới lúc nào vật dính còn rung
      this.vis.son = this.cfg.robot.tay === 'son' ? { ha: false, mau: this.cfg.mucBanDau || 'red' } : null;      // máy sơn: đầu sơn đang hạ không, màu đang chọn
      this.vis.sung = this.cfg.robot.tay === 'hoi' ? { dan: this.cfg.danToiDa, truoc: 0, sau: 0, het: 0 } : null;      // súng hơi: dan = số viên còn (null: vô hạn); truoc / sau = tới lúc nào nòng trước / nòng sau còn lóe; het = hết đạn, nhấp nháy đỏ
      this.vis.dr = this.cfg.robot.than === 'drone' ? { alt: ALT, roi: false, nguy: false, pin: this.cfg.pin, pinMax: this.cfg.pin, nhay: 0, sacLoe: 0 } : null;          // drone: alt = độ cao, roi = đã rơi xuống đất, nguy = đang rơi, pin / pinMax (null: pin vô hạn, ẩn thanh pin), nhay = tới lúc nào thanh pin còn nháy (đọc battery()), sacLoe = tới lúc nào ô sạc còn lóe
    },
    clearFx: function () { this.wh = { L: 0, R: 0 }; this.parts = []; this.bounce = 0; this.mung = 0; this.flash = 0; this.docs = []; },
    /**
     * Cảm biến khoảng cách vừa đọc (mục lệnh có `docCamBien` của vết): cảm biến ở hông sáng và một tia mờ chạy tới ô được đo
     * (xanh nếu trống, đỏ nếu chặn) trong ms mili giây. Đọc nhiều lần liên tiếp thì GỘP: cảm biến sáng liền một lượt, mỗi ô được đo một tia
     * (đọc lại đúng ô cũ chỉ làm tia sáng lại).
     */
    docCamBien: function (d, ms) {
      if (!d || !d.tu || (!d.o && d.cam !== 'tu')) return;           // cảm biến từ không thấy vật thì o = null: vẫn có tia (tới chỗ tường hay hết tầm)
      var now = performance.now(), key = d.tu.x + ',' + d.tu.y + '>' + (d.o ? d.o.x + ',' + d.o.y : '-' + d.huong), ds = this.docs, i;
      ms = Math.max(140, ms || 360);
      for (i = ds.length - 1; i >= 0; i--) if (ds[i].key === key) { ds.splice(i, 1); break; }
      ds.push({ key: key, tu: d.tu, o: d.o, huong: d.huong, trong: !!d.trong, vat: d.vat || null, cam: d.cam || null, mau: d.mau || null, nguon: d.nguon || null, chat: d.chat || null, dai: d.cam === 'tu' ? this.tamTrong(d.tu, d.huong) : 0, ham: d.ham || null, khoang: d.khoang || 0, nong: !!d.nong, t0: now, ms: ms });     // ham / khoang / nong: hồng ngoại (distance / warm)
      while (ds.length > 6) ds.shift();
      if (d.cam === 'pin' && this.vis && this.vis.dr) this.vis.dr.nhay = now + Math.max(ms, 320);                 // đọc battery(): thanh pin nháy, đèn thân sáng
      if ((d.cam === 'mau' || d.cam === 'camera' || d.cam === 'camera-bay') && this.vis) this.vis.bongMau = { mau: d.mau || 'none', den: now + Math.max(ms, 300), o: d.o ? { x: d.o.x, y: d.o.y } : null, tu: d.tu ? { x: d.tu.x, y: d.tu.y } : null };      // bong chữ màu vừa đọc nổi trên xe trong khoảng một nhịp (cảm biến bụng và camera)
    },
    /** Camera đang đọc không (hai đốm mắt trên thân sáng rực trong lúc tia còn chạy). */
    camMatSang: function (now) {
      for (var i = 0; i < this.docs.length; i++) if ((this.docs[i].cam === 'camera' || this.docs[i].cam === 'camera-bay') && now - this.docs[i].t0 < this.docs[i].ms * 0.85) return true;       // camera ở xe (hai mắt) hay camera nhìn xuống của drone (kính)
      return false;
    },
    /** Còn tia cảm biến đang sáng không (cảm biến trên thân xe sáng cùng lúc). */
    camBienSang: function (now) {
      for (var i = 0; i < this.docs.length; i++) if (now - this.docs[i].t0 < this.docs[i].ms * 0.85) return true;
      return false;
    },
    /** Vẽ các tia cảm biến (theo pixel sân): vệt mờ dần từ mũi xe tới ô được đo; ô bị chặn có dấu X ở sát mép ô đó. */
    veTia: function (g, now) {
      var ds = this.docs, i;
      for (i = ds.length - 1; i >= 0; i--) if (now - ds[i].t0 >= ds[i].ms) ds.splice(i, 1);
      for (i = 0; i < ds.length; i++) {
        var d = ds[i], u = (now - d.t0) / d.ms, a = u < 0.55 ? 1 : Math.max(0, 1 - (u - 0.55) / 0.45), rgb = d.trong ? BM.tiaXanhLaRgb : BM.tiaDoV3Rgb;
        if (d.cam === 'mau' || d.cam === 'pin') continue;                         // cảm biến màu: vòng sáng vẽ dưới robot (veVongMauDuoi); cảm biến pin: thanh pin nháy (veThanhPin)
        if (this.vec) { this.veTiaVec(g, d, now, u, a, 'tren'); continue; }           // vector (gói V4): tia từ ổ thật của cảm biến (oTia), hình mượt
        if (d.cam === 'camera') { this.veTiaCamera(g, d, now, u, a, 'tren'); continue; }
        if (d.cam === 'camera-bay') { this.veTiaNhin(g, d, now, u, a, 'tren'); continue; }                  // camera nhìn xuống của drone: bốn góc ngắm quanh ô dưới drone   // camera: hai tia từ đôi mắt tới ô trước mặt, ô đó nháy khung theo màu đọc được
        if (d.cam === 'tu') { this.veTiaTu(g, d, u, a); continue; }              // cảm biến từ: tia bạc tới vật sắt / tia nâu tới vật gỗ
        if (d.cam === 'hong-ngoai') { this.veTiaHongNgoai(g, d, now, u, a); continue; }      // hồng ngoại (mùa 2): tia đỏ mảnh từ mũi xe tới vật cản, vạch ở từng ô trống; warm() thấy nóng thì loé cam
        var vx = DX[d.huong], vy = DY[d.huong], x0 = d.tu.x * T + 7 + vx * 5, y0 = d.tu.y * T + 7 + vy * 5;
        var cx = d.o.x * T + 7, cy = d.o.y * T + 7, x1 = d.trong ? cx : cx - vx * 6, y1 = d.trong ? cy : cy - vy * 6;
        g.fillStyle = 'rgba(' + rgb + ',' + (0.3 * a).toFixed(3) + ')'; g.fillRect(d.o.x * T, d.o.y * T, T, T);     // ô được đo ám nhẹ
        g.save();
        g.strokeStyle = 'rgba(' + rgb + ',' + (0.95 * a).toFixed(3) + ')'; g.lineWidth = 1.5; g.setLineDash([3, 1]); g.lineDashOffset = -((now / 40) % 3);
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.setLineDash([]); g.lineWidth = 1;
        g.lineWidth = 1.5;
        if (d.trong) g.strokeRect(Math.round(cx) - 3, Math.round(cy) - 3, 6, 6);
        else { g.beginPath(); g.moveTo(x1 - 2.5, y1 - 2.5); g.lineTo(x1 + 2.5, y1 + 2.5); g.moveTo(x1 + 2.5, y1 - 2.5); g.lineTo(x1 - 2.5, y1 + 2.5); g.stroke(); }
        g.restore();
      }
    },
    /**
     * Tia của CAMERA (luật color() 14/10), hai lớp: pha 'duoi' (vẽ TRƯỚC robot, nên càng kẹp và vật đang cầm đè lên, tia không lẫn vào tay): mũi tia mờ từ hai con mắt chụm vào tâm ô được nhìn
     * + một nét tia MẢNH bắt đầu từ mép trước của thân; pha 'tren' (vẽ SAU robot): ô được nhìn nháy khung theo màu đọc được: nguon 'san' = cả ô tô màu sàn; 'vat' = bốn góc ôm quanh vật (màu vật);
     * 'chan' = tường / rào / thùng / cửa / mép: khung xám + dấu X. Màu 'none' là xám nhạt.
     */
    veTiaCamera: function (g, d, now, u, a, pha) {
      var vx = DX[d.huong], vy = DY[d.huong], e = 2.5 * (this.pp || 0.7), tx = d.tu.x * T + 7, ty = d.tu.y * T + 7;
      var cx = d.o.x * T + 7, cy = d.o.y * T + 7, chan = d.nguon === 'chan', vat = d.nguon === 'vat';
      var col = chan ? BM.sanLamV3 : this.mauHien(d.mau), nhay = u < 0.55 ? (((now / 80) | 0) & 1 ? 1 : 0.6) : 1, ox = d.o.x * T, oy = d.o.y * T, i;
      g.save();
      if (pha === 'duoi') {
        g.globalAlpha = 0.3 * a; g.fillStyle = col;                                   // mũi tia: tam giác hẹp từ hai mắt tới tâm ô
        g.beginPath(); g.moveTo(tx + vy * e, ty - vx * e); g.lineTo(tx - vy * e, ty + vx * e); g.lineTo(cx, cy); g.closePath(); g.fill();
        g.setLineDash([3, 1]); g.lineDashOffset = -((now / 40) % 3);
        var x0 = tx + vx * 6.5, y0 = ty + vy * 6.5, x1 = cx - vx * (vat ? 5 : 2), y1 = cy - vy * (vat ? 5 : 2);
        g.globalAlpha = 0.9 * a; g.lineWidth = 2; g.strokeStyle = BM.vienDam;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.lineWidth = 1; g.strokeStyle = col;
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.restore(); return;
      }
      g.globalAlpha = a * nhay;
      if (vat) {                                                                      // bốn góc ôm vật (khung 12×12 quanh tâm ô)
        var L = [[-6, -6, 1, 1], [5, -6, -1, 1], [-6, 5, 1, -1], [5, 5, -1, -1]];
        for (i = 0; i < 4; i++) {
          var px = Math.round(cx + L[i][0]), py = Math.round(cy + L[i][1]), hx = L[i][2] > 0 ? px : px - 2, vy2 = L[i][3] > 0 ? py : py - 2;
          g.fillStyle = BM.vienDam; g.fillRect(hx - 1, py - 1, 5, 3); g.fillRect(px - 1, vy2 - 1, 3, 5);
          g.fillStyle = col; g.fillRect(hx, py, 3, 1); g.fillRect(px, vy2, 1, 3);
        }
        g.fillStyle = col; g.globalAlpha = 0.16 * a * nhay; g.fillRect(ox + 1, oy + 1, T - 2, T - 2);
      } else {
        g.fillStyle = col; g.globalAlpha = (chan ? 0.26 : 0.38) * a * nhay; g.fillRect(ox, oy, T, T);
        g.globalAlpha = a * nhay; g.lineWidth = 3; g.strokeStyle = BM.vienDam; g.strokeRect(ox + 1.5, oy + 1.5, T - 3, T - 3);
        g.lineWidth = 1.5; g.strokeStyle = col; if (chan) g.setLineDash([3, 2]); g.strokeRect(ox + 1.5, oy + 1.5, T - 3, T - 3); g.setLineDash([]);
      }
      if (chan) {                                                                     // dấu X: không nhìn thấy màu gì
        g.globalAlpha = a; g.lineCap = 'butt';
        g.lineWidth = 3; g.strokeStyle = BM.vienDam; g.beginPath(); g.moveTo(cx - 3.5, cy - 3.5); g.lineTo(cx + 3.5, cy + 3.5); g.moveTo(cx + 3.5, cy - 3.5); g.lineTo(cx - 3.5, cy + 3.5); g.stroke();
        g.lineWidth = 1.5; g.strokeStyle = col; g.beginPath(); g.moveTo(cx - 3.5, cy - 3.5); g.lineTo(cx + 3.5, cy + 3.5); g.moveTo(cx + 3.5, cy - 3.5); g.lineTo(cx - 3.5, cy + 3.5); g.stroke();
      }
      g.restore();
    },
    /**
     * Camera NHÌN XUỐNG của drone (look()), hai lớp: pha 'duoi' (vẽ TRƯỚC drone, nên thân drone đè lên): ô ngay dưới drone ám màu vừa đọc được + một vạch quét sáng chạy từ trên xuống trong nửa đầu thời gian đọc
     * (vòng sáng như cảm biến màu ở bụng xe do veVongMauDuoi vẽ); pha 'tren' (vẽ SAU drone): bốn góc ngắm ôm ô đó theo màu đọc được — nguon 'san' ôm cả ô, 'vat' ôm vật nhỏ hơn (vật che sàn), 'chan' (rào / thùng / cửa)
     * góc xám + dấu X. Màu 'none' là xám nhạt. Kính camera trên thân drone sáng rực nhờ camMatSang().
     */
    veTiaNhin: function (g, d, now, u, a, pha) {
      var cx = d.o.x * T + 7, cy = d.o.y * T + 7, ox = d.o.x * T, oy = d.o.y * T, chan = d.nguon === 'chan', vat = d.nguon === 'vat';
      var col = chan ? BM.sanLamV3 : this.mauHien(d.mau), nhay = u < 0.55 ? (((now / 80) | 0) & 1 ? 1 : 0.6) : 1, i;
      g.save();
      if (pha === 'duoi') {
        g.globalAlpha = (chan ? 0.24 : vat ? 0.2 : 0.4) * a * nhay; g.fillStyle = col; g.fillRect(ox, oy, T, T);
        if (u < 0.6) {                                                              // vạch quét: từ mép trên xuống mép dưới ô
          var yy = Math.round(oy + 1 + (T - 3) * (u / 0.6));
          g.globalAlpha = 0.35 * a; g.fillStyle = BM.sanTrangV1; g.fillRect(ox + 1, yy - 1, T - 2, 3);
          g.globalAlpha = 0.95 * a; g.fillRect(ox + 1, yy, T - 2, 1);
        }
        g.restore(); return;
      }
      g.globalAlpha = a * nhay;
      var m = vat ? 4.5 : 6.5, L = [[-1, -1], [1, -1], [-1, 1], [1, 1]];          // m: nửa cạnh khung ngắm (vật nhỏ hơn ô)
      for (i = 0; i < 4; i++) {
        var px = Math.round(cx + L[i][0] * m), py = Math.round(cy + L[i][1] * m), hx = L[i][0] > 0 ? px - 2 : px, vy2 = L[i][1] > 0 ? py - 2 : py;       // (px, py) = đỉnh góc; mỗi góc hai nét dài 3 pixel hướng vào tâm ô, viền mực quanh nét
        g.fillStyle = BM.vienDam; g.fillRect(hx - 1, py - 1, 5, 3); g.fillRect(px - 1, vy2 - 1, 3, 5);
        g.fillStyle = col; g.fillRect(hx, py, 3, 1); g.fillRect(px, vy2, 1, 3);
      }
      if (chan) {                                                                   // dấu X: nhìn xuống mà không thấy màu gì
        g.lineCap = 'butt'; g.lineWidth = 3; g.strokeStyle = BM.vienDam; g.beginPath(); g.moveTo(cx - 3.5, cy - 3.5); g.lineTo(cx + 3.5, cy + 3.5); g.moveTo(cx + 3.5, cy - 3.5); g.lineTo(cx - 3.5, cy + 3.5); g.stroke();
        g.lineWidth = 1.5; g.strokeStyle = col; g.beginPath(); g.moveTo(cx - 3.5, cy - 3.5); g.lineTo(cx + 3.5, cy + 3.5); g.moveTo(cx + 3.5, cy - 3.5); g.lineTo(cx - 3.5, cy + 3.5); g.stroke();
      }
      g.restore();
    },
    /** Phần tia camera vẽ DƯỚI robot (xem veTiaCamera và veTiaNhin, pha 'duoi'); veTia() không vẽ lại phần này. */
    veTiaCameraDuoi: function (g, now) {
      var ds = this.docs, i;
      for (i = 0; i < ds.length; i++) {
        var d = ds[i], u = (now - d.t0) / d.ms, a = u < 0.55 ? 1 : Math.max(0, 1 - (u - 0.55) / 0.45);
        if (this.vec && (d.cam === 'camera' || d.cam === 'camera-bay') && u < 1) this.veTiaVec(g, d, now, u, a, 'duoi');
        else if (d.cam === 'camera' && u < 1) this.veTiaCamera(g, d, now, u, a, 'duoi');
        else if (d.cam === 'camera-bay' && u < 1) this.veTiaNhin(g, d, now, u, a, 'duoi');
      }
    },
    /** GỐC TIA của một lần đọc d (chế độ vector, gói V4): ổ THẬT của cảm biến trên robot đang xét (VeVector.diemCamBien / diemMat, theo hướng xe lúc vẽ), pixel sân.
     *  camera: hai mắt; hồng ngoại: ổ tren ở góc mũi; khoảng cách / cảm biến từ: ổ hông nào chĩa xa nhất về hướng tia (tia trước: cả hai hông), lùi ra mép thấu kính 0,9 pixel sân.
     *  Không có ổ (cấu hình lạ): mũi xe như nhánh pixel (5 / 7 pixel sân trước tâm ô; cảm biến từ thiếu tai thì ở ổ tay nam châm). */
    oTia: function (d) {
      var r = this.cfg.robot, v = this.vis, h = v.d || 0, dx = DX[d.huong] || 0, dy = DY[d.huong] || 0, bx = d.tu.x * T, by = d.tu.y * T - (v.dr ? v.hop : 0), ds, i;
      if (d.cam === 'camera') ds = VeVector.diemMat(r, h, T);
      else ds = VeVector.diemCamBien(r, d.cam === 'hong-ngoai' ? 'hong-ngoai' : 'khoang-cach', h, T);
      if (!ds.length && d.cam === 'tu') { var gn = VeVector.diemGan(r, h, T); if (gn) ds = [gn]; }
      if (!ds.length) return [{ x: bx + 7 + dx * (d.cam === 'tu' || d.cam === 'hong-ngoai' ? 7 : 5), y: by + 7 + dy * (d.cam === 'tu' || d.cam === 'hong-ngoai' ? 7 : 5) }];
      if (d.cam === 'camera') return ds.map(function (p) { return { x: bx + p.x, y: by + p.y }; });
      var max = -1e9, kq = [];
      for (i = 0; i < ds.length; i++) max = Math.max(max, (ds[i].x - T / 2) * dx + (ds[i].y - T / 2) * dy);
      for (i = 0; i < ds.length; i++) if ((ds[i].x - T / 2) * dx + (ds[i].y - T / 2) * dy >= max - 0.3) kq.push({ x: bx + ds[i].x + dx * 0.9, y: by + ds[i].y + dy * 0.9 });
      return kq;
    },
    /** Một tia cảm biến ở chế độ vector (gói V4, VeVector.HU): pha 'duoi' (dưới robot: chùm camera, ô ám của camera nhìn xuống) hay 'tren'. */
    veTiaVec: function (g, d, now, u, a, pha) {
      var hu = HU(), c = this.cfg, col = d.nguon === 'chan' ? BM.sanLamV3 : this.mauHien(d.mau);
      if (d.cam === 'camera') hu.tiaCamera(g, d, now, u, a, pha, this.oTia(d), col, DX, DY);
      else if (d.cam === 'camera-bay') hu.tiaNhin(g, d, now, u, a, pha, col);
      else if (d.cam === 'tu') hu.tiaTu(g, d, u, a, this.oTia(d), now, DX, DY);
      else if (d.cam === 'hong-ngoai') hu.tiaHongNgoai(g, d, now, u, a, this.oTia(d), d.o.x >= c.ox && d.o.y >= c.oy && d.o.x < c.ox + c.vw && d.o.y < c.oy + c.vh, DX, DY);
      else hu.tiaKc(g, d, now, u, a, this.oTia(d), DX, DY);
    },
    /** Số pixel (từ mũi xe) mà tia / sóng nam châm đi được theo hướng h từ ô `tu`, tối đa 3 ô: tường, mép sân, thùng nặng chắn thì dừng sát mép ô đó (không xét vật). */
    tamTrong: function (tu, h) {
      var c = this.cfg, d, x, y;
      for (d = 1; d <= 3; d++) {
        x = tu.x + DX[h] * d; y = tu.y + DY[h] * d;
        if (x < 0 || y < 0 || x >= c.w || y >= c.h || c.rows[y][x] === '#' || this.thungTaiO(x, y)) return (d - 1) * T + 1;
      }
      return 3 * T + 2;
    },
    /** Tia của cảm biến từ front_metal(): nét đứt từ mũi xe tới vật được đo (bạc nếu sắt, nâu nếu gỗ); không có vật thì tia mờ chạy hết tầm. u = tiến độ 0..1, a = độ đậm. */
    veTiaTu: function (g, d, u, a) {
      var vx = DX[d.huong], vy = DY[d.huong], sat = d.chat === 'sat', go = d.chat === 'go', nch = d.chat === 'nam-cham';
      var rgb = sat ? BM.tiaTrangV1Rgb : go ? BM.tiaCamRgb : nch ? (d.cuc === 'N' ? BM.tiaDoRgb : BM.tiaLamRgb) : BM.tiaLamV1Rgb;           // vật nam châm: tia đỏ (chữ N) hay xanh dương (chữ S)
      var x0 = d.tu.x * T + 7 + vx * 7, y0 = d.tu.y * T + 7 + vy * 7, dai, x1, y1;
      if (d.o) { x1 = d.o.x * T + 7; y1 = d.o.y * T + 7; g.fillStyle = 'rgba(' + rgb + ',' + ((sat ? 0.34 : 0.26) * a).toFixed(3) + ')'; g.fillRect(d.o.x * T, d.o.y * T, T, T); }
      else { dai = d.dai || 0; x1 = x0 + vx * dai; y1 = y0 + vy * dai; }
      g.save();
      var dm = Math.min(1, u / 0.35);                                           // tia chạy ra trong 35% đầu
      var xe = x0 + (x1 - x0) * dm, ye = y0 + (y1 - y0) * dm;
      g.strokeStyle = 'rgba(' + rgb + ',' + ((d.o ? 0.95 : 0.55) * a).toFixed(3) + ')'; g.lineWidth = sat ? 2 : 1.5; g.setLineDash(sat ? [4, 1] : [3, 2]); g.lineDashOffset = -((performance.now() / 40) % 5);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(xe, ye); g.stroke();
      g.setLineDash([]);
      if (d.o && dm >= 1) {
        var cx = x1, cy = y1;
        if (sat) {                                                              // lóe bốn cánh trên vật sắt
          var s = 2 + Math.round(Math.abs(Math.sin(u * 9)) * 2);
          g.strokeStyle = 'rgba(' + BM.tiaTrangRgb + ',' + a.toFixed(3) + ')'; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(cx - s - 2, cy); g.lineTo(cx + s + 2, cy); g.moveTo(cx, cy - s - 2); g.lineTo(cx, cy + s + 2); g.stroke();
        } else if (nch) {                                                       // vòng tròn màu cực quanh vật nam châm: đọc được chữ
          g.strokeStyle = 'rgba(' + rgb + ',' + a.toFixed(3) + ')'; g.lineWidth = 1.5;
          g.beginPath(); g.arc(cx, cy, 5 + Math.abs(Math.sin(u * 9)), 0, Math.PI * 2); g.stroke();
        } else {                                                                // dấu X nâu trên vật gỗ: không hút được
          g.strokeStyle = 'rgba(' + BM.tiaNauRgb + ',' + a.toFixed(3) + ')'; g.lineWidth = 2;
          g.beginPath(); g.moveTo(cx - 3, cy - 3); g.lineTo(cx + 3, cy + 3); g.moveTo(cx + 3, cy - 3); g.lineTo(cx - 3, cy + 3); g.stroke();
        }
      } else if (!d.o && dm >= 1) {                                             // không thấy gì: gạch cụt ở cuối tia
        g.strokeStyle = 'rgba(' + rgb + ',' + (0.7 * a).toFixed(3) + ')'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(x1 - vy * 3, y1 + vx * 3); g.lineTo(x1 + vy * 3, y1 - vx * 3); g.stroke();
      }
      g.restore();
    },
    /** Tia HỒNG NGOẠI (mùa 2; docCamBien.cam 'hong-ngoai'): nét đỏ mảnh chạy từ mũi xe tới mép ô vật cản (d.o; ngoài sân thì tới mép sân), một vạch ngang nhỏ ở mỗi ô trống đi qua (đếm được
     *  bằng mắt = distance()), ô vật cản ám đỏ nhạt. warm(): vật cản nóng (d.nong) thì ô đó loé cam và ba gợn nhiệt bay lên; không nóng thì chấm xanh lơ lạnh. u = tiến độ 0..1, a = độ đậm. */
    veTiaHongNgoai: function (g, d, now, u, a) {
      var vx = DX[d.huong], vy = DY[d.huong], nong = d.ham === 'warm' && !!d.nong, lanh = d.ham === 'warm' && !d.nong;
      var rgb = nong ? BM.tiaCamV1Rgb : BM.tiaDoV4Rgb;
      var x0 = d.tu.x * T + 7 + vx * 7, y0 = d.tu.y * T + 7 + vy * 7, cx = d.o.x * T + 7, cy = d.o.y * T + 7, x1 = cx - vx * 7, y1 = cy - vy * 7;     // dừng sát mép ô vật cản
      var c = this.cfg, trong = d.o.x >= c.ox && d.o.y >= c.oy && d.o.x < c.ox + c.vw && d.o.y < c.oy + c.vh;
      g.save();
      if (trong) { g.fillStyle = 'rgba(' + rgb + ',' + ((nong ? 0.42 : 0.22) * a).toFixed(3) + ')'; g.fillRect(d.o.x * T, d.o.y * T, T, T); }
      var dm = Math.min(1, u / 0.3), xe = x0 + (x1 - x0) * dm, ye = y0 + (y1 - y0) * dm;                 // tia chạy ra trong 30% đầu
      g.strokeStyle = 'rgba(' + rgb + ',' + (0.95 * a).toFixed(3) + ')'; g.lineWidth = 1; g.setLineDash([2, 2]); g.lineDashOffset = -((now / 30) % 4);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(xe, ye); g.stroke();
      g.setLineDash([]);
      for (var i = 1; i <= (d.khoang || 0); i++) {                                                      // vạch ngang ở tâm mỗi ô trống: đếm được số ô
        var px = (d.tu.x + vx * i) * T + 7, py = (d.tu.y + vy * i) * T + 7;
        if ((Math.abs(px - x0) + Math.abs(py - y0)) > (Math.abs(xe - x0) + Math.abs(ye - y0))) break;
        g.strokeStyle = 'rgba(' + rgb + ',' + (0.8 * a).toFixed(3) + ')'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(px - vy * 3, py + vx * 3); g.lineTo(px + vy * 3, py - vx * 3); g.stroke();
      }
      if (dm >= 1 && trong) {
        if (nong) {                                                                                    // nóng: lõi cam sáng + ba gợn nhiệt bay lên trên ô
          g.fillStyle = 'rgba(' + BM.tiaVangRgb + ',' + a.toFixed(3) + ')'; g.fillRect(cx - 2, cy - 2, 4, 4);
          g.strokeStyle = 'rgba(' + BM.tiaCamV2Rgb + ',' + (0.9 * a).toFixed(3) + ')'; g.lineWidth = 1;
          for (var k = -1; k <= 1; k++) { var ph = now / 160 + k, gy = cy - 4 - ((now / 25 + k * 5) % 8); g.beginPath(); g.moveTo(cx + k * 4 - 1.5, gy + 2); g.quadraticCurveTo(cx + k * 4 + Math.sin(ph) * 2, gy, cx + k * 4 + 1.5, gy - 2); g.stroke(); }
        } else if (lanh) {                                                                             // không nóng: chấm xanh lơ lạnh ở điểm chạm
          g.fillStyle = 'rgba(' + BM.tiaXanhLoV2Rgb + ',' + a.toFixed(3) + ')'; g.fillRect(x1 - 1.5, y1 - 1.5, 3, 3);
        } else {                                                                                       // distance(): chấm đỏ ở điểm chạm
          g.fillStyle = 'rgba(' + BM.tiaDoV5Rgb + ',' + a.toFixed(3) + ')'; g.fillRect(x1 - 1.5, y1 - 1.5, 3, 3);
        }
      }
      g.restore();
    },
    /** NÚT BẮN ĐANG BẬT thì NÓNG (luật warm() mùa 2): quầng đỏ cam thở quanh tấm nút và hai gợn nhiệt bay lên, vẽ đè lên ô nút ở mọi màn có nút (nhìn thấy ngay khi đọc code). */
    veNong: function (g, x, y, now) {
      if (this.vec) { HU().nong(g, x, y, now); return; }                           // vector: quầng cam thở bo góc + gợn nhiệt (gói V4)
      var px = x * T, py = y * T, th = 0.55 + 0.45 * Math.sin(now / 260);
      g.save();
      g.strokeStyle = 'rgba(' + BM.tiaCamV3Rgb + ',' + (0.35 + 0.4 * th).toFixed(3) + ')'; g.lineWidth = 1;
      g.strokeRect(px + 1.5, py + 1.5, T - 3, T - 3);
      g.strokeStyle = 'rgba(' + BM.tiaCamV4Rgb + ',' + (0.5 + 0.3 * th).toFixed(3) + ')';
      for (var k = 0; k < 2; k++) { var gy = py + 3 - ((now / 30 + k * 7) % 6), gx = px + 5 + k * 5; g.beginPath(); g.moveTo(gx - 1, gy + 2); g.quadraticCurveTo(gx + Math.sin(now / 140 + k) * 1.5, gy, gx + 1, gy - 2); g.stroke(); }
      g.restore();
    },
    /** BỆ SÚNG XÍCH (be-sung): bắn tụ mà xe không giật — bệ giữ, xe rung tại chỗ rất nhẹ về phía giật rồi về, tia bụi nhỏ dưới xích. */
    veGiuBe: async function (s, ms, my) {
      var v = this.vis, self = this, rx = DX[s.huong], ry = DY[s.huong];
      await this.tween(ms * 0.9, my, function (k) {
        var a = Math.sin(k * Math.PI * 4) * (1 - k) * 1.2; v.dx = rx * a; v.dy = ry * a;
        if (k < 0.5 && Math.random() < 0.4) self.burst(v.x * T + 3 + Math.random() * 8, v.y * T + 12, 1, [BM.sanXam, BM.sanTrang], 0.35);
      });
      v.dx = 0; v.dy = 0;
    },
    /** Màu hiển thị của một lần đọc màu: 'none' (ô không màu) là xám nhạt. */
    mauHien: function (mau) { return Ve.MAU[mau] ? Ve.MAU[mau].vi : BM.sanLamV4; },
    /** Vòng sáng của cảm biến màu ở ô vừa đọc (vẽ DƯỚI robot): vòng nở ra rồi mờ dần, tô màu vừa đọc được (ô không màu: xám nhạt). */
    veVongMauDuoi: function (g, now) {
      var ds = this.docs, i;
      for (i = 0; i < ds.length; i++) {
        var d = ds[i]; if (d.cam !== 'mau' && d.cam !== 'camera-bay') continue;                  // cảm biến màu ở bụng xe và camera nhìn xuống của drone: cùng vòng sáng ở ô dưới thân
        var u = Math.min(1, (now - d.t0) / d.ms), a = u < 0.5 ? 1 : Math.max(0, 1 - (u - 0.5) / 0.5), col = this.mauHien(d.mau), cx = d.o.x * T + 7, cy = d.o.y * T + 7 + 1;
        g.save();
        g.globalAlpha = (d.mau === 'none' ? 0.32 : 0.5) * a; g.fillStyle = col;
        g.beginPath(); g.ellipse(cx, cy, 6.2, 5.2, 0, 0, 6.2832); g.fill();
        g.globalAlpha = 0.95 * a; g.strokeStyle = col; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(cx, cy, 4 + u * 3.4, 3.4 + u * 2.8, 0, 0, 6.2832); g.stroke();
        g.restore();
      }
    },
    /** Chỗ đặt bong chữ (kích thước W×H pixel sân, kể cả viền) quanh xe có tâm (cx, cy): thử nhiều vị trí, bỏ chỗ đè lên xe + tay + hướng nhìn, chấm điểm theo diện tích đè lên ô ĐƯỢC NHÌN
     *  (nặng nhất), ô đích / cờ, vật, thùng; ưu tiên gần xe; hơi thích chỗ trống ngoài mép sân (lớp phủ có lề). Trả { x, y } = góc trái trên của hình chữ nhật ngoài. */
    viTriBong: function (cx, cy, W, H) {
      var c = this.cfg, v = this.vis, b = v.bongMau, hx = DX[v.d || 0] || 0, hy = DY[v.d || 0] || 0, m = (this.mc || 8) / (this.kk || 1) - 1, i;
      var no = { x: cx - 9, y: cy - 9, w: 18, h: 18 };                                 // xe + tay kẹp / mũi: không đặt đè lên
      if (hx > 0) no.w += 12; else if (hx < 0) { no.x -= 12; no.w += 12; }
      if (hy > 0) no.h += 12; else if (hy < 0) { no.y -= 12; no.h += 12; }
      var ds = [];
      function them(x, y, tt) { if (x >= 0 && y >= 0) ds.push({ x: x * T, y: y * T, w: T, h: T, tt: tt }); }
      if (b && b.o) them(b.o.x, b.o.y, 10);
      for (i = 0; i < c.dich.length; i++) them(c.dich[i].x, c.dich[i].y, 6);
      for (i = 0; i < c.cacCo.length; i++) them(c.cacCo[i].x, c.cacCo[i].y, 6);
      for (i = 0; i < this.objs.length; i++) if (this.objs[i].tt === 'dat') them(this.objs[i].x, this.objs[i].y, 3);
      for (i = 0; i < this.thungs.length; i++) them(this.thungs[i].x, this.thungs[i].y, 3);
      function giao(a, r) { var w = Math.min(a.x + a.w, r.x + r.w) - Math.max(a.x, r.x), h = Math.min(a.y + a.h, r.y + r.h) - Math.max(a.y, r.y); return w > 0 && h > 0 ? w * h : 0; }
      var best = null, dx, dy, r, cost, k, fw = this.pw, fh = this.ph, gx = c.ox * T, gy = c.oy * T;        // (gx, gy) = góc trái trên của cửa sổ vẽ (pixel sân)
      for (dy = -34; dy <= 34; dy += 2) for (dx = -40; dx <= 40; dx += 3) {
        r = { x: Math.round(cx - W / 2 + dx), y: Math.round(cy - H / 2 + dy), w: W, h: H };
        if (r.x < gx - m || r.y < gy - m || r.x + W > gx + fw + m || r.y + H > gy + fh + m) continue;
        if (giao(no, r) > 0) continue;
        cost = 0.04 * (Math.abs(dx) + Math.abs(dy)) + (dy > 0 ? 0.6 : 0);
        for (k = 0; k < ds.length; k++) cost += giao(ds[k], r) * ds[k].tt;
        cost += (W * H - giao({ x: gx, y: gy, w: fw, h: fh }, r)) * 0.01;               // phần nằm ngoài sân: phạt nhẹ
        if (!best || cost < best.cost - 1e-6) best = { x: r.x, y: r.y, cost: cost };
      }
      return best || { x: Math.round(cx - W / 2), y: Math.round(cy - 24 - H) };
    },
    /** Bong chữ màu cảm biến vừa đọc ("red" ...), nhỏ gọn, đặt ở chỗ không che ô được nhìn, ô đích, cờ (xem viTriBong); một nhịp. */
    veBongMau: function (g, cx, cy, now, cao) {
      var b = this.vis.bongMau; if (!b || b.den <= now) return;
      var col = this.mauHien(b.mau), txt = '"' + b.mau + '"';
      g.save();
      g.font = '8px VT323, monospace'; g.textBaseline = 'middle'; g.textAlign = 'center';
      var w = Math.ceil(g.measureText(txt).width) + 5, hh = 9, pos = this.viTriBong(cx, cy, w + 2, hh + 2), x = pos.x + 1, y = pos.y + 1;
      if (this.vec) { g.restore(); HU().bongMau(g, x, y, w, hh, col, txt, Math.min(1, (b.den - now) / 120)); return; }      // vector: viên thuốc trắng viền màu (gói V4)
      g.globalAlpha = Math.min(1, (b.den - now) / 120);
      g.fillStyle = BM.vienDam; g.fillRect(x - 1, y - 1, w + 2, hh + 2);
      g.fillStyle = BM.sanTim; g.fillRect(x, y, w, hh);
      g.fillStyle = col; g.fillRect(x, y, w, 1); g.fillRect(x, y + hh - 1, w, 1); g.fillRect(x, y, 1, hh); g.fillRect(x + w - 1, y, 1, hh);
      g.fillText(txt, Math.round(x + w / 2), y + hh / 2 + 0.5);
      g.restore();
    },
    /** Phun hạt. Tùy chọn: sz = cạnh hạt (px sân), mo = true thì hạt mờ dần khi sắp hết. */
    burst: function (cx, cy, n, cols, sp, sz, mo) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, s = (sp || 1) * (0.3 + Math.random() * 0.9);
        this.parts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.5, life: 28 + Math.random() * 30, c: cols[i % cols.length], s: sz || 1, mo: !!mo });
      }
    },
    mungThang: function () {
      var now = performance.now();
      this.bounce = now + 900; this.mung = now + 900;
      var cols = [BM.sanVang, BM.sanTrang, BM.sanXanhLoToiV1, BM.sanHong, BM.sanXanhLaToiV2, BM.sanDo];
      if (this.xe) { for (var xi = 0; xi < this.xe.length; xi++) this.burst(this.xe[xi].vis.x * T + 7, this.xe[xi].vis.y * T + 4, 18, cols, 1.3, 2, true); }
      else if (this.vis) this.burst(this.vis.x * T + 7, this.vis.y * T + 4, 24, cols, 1.35, 2, true);
      var f = this.cfg.co;
      if (f) { var cc = this.cfg.cacCo; for (var k = 0; k < cc.length; k++) this.burst(cc[k].x * T + 7, cc[k].y * T + 5, Math.floor(60 / cc.length), cols, 1.2); return; }
      if (this.cfg.bm && !this.cfg.dich.length) { this.burst(this.cfg.bm.x * T + 7, this.cfg.bm.y * T + 5, 60, cols, 1.2); return; }      // mục tiêu bóng mờ: pháo giấy ở ô của xe mờ
      var ds = this.cfg.dich;                                   // mục tiêu đưa vật: pháo giấy trên các ô đích
      for (var i = 0; i < ds.length; i++) this.burst(ds[i].x * T + 7, ds[i].y * T + 5, Math.max(12, Math.floor(60 / ds.length)), cols, 1.2);
    },
    /** Đặt dấu nổi trên xe ('?' kẹp hụt, '!' ô đã có vật) trong ms mili giây. */
    baoHieu: function (kieu, ms) { this.vis.bao = kieu; this.vis.baoDen = performance.now() + (ms || 1200); this.matSuKien(kieu === '!' ? 'dam' : 'ngac', kieu === '!' ? 750 : 800); },
    /** MẮT BIỂU CẢM (gói V4, chỉ nhánh vector vẽ): đặt biểu cảm theo sự kiện cho xe đang xét trong ms mili giây — 'dam' (đâm / bị chặn: mắt X + rung), 'xoay' (va nhau: mắt xoáy + rung),
     *  'vui' (tới đích / đặt đúng / bắn trúng nút: "^ ^" + nảy), 'ngac' (dấu ?: mắt tròn to), 'buon' (thua), 'lim' / 'cho' (đang chờ). Biểu cảm mạnh hơn không bị biểu cảm nhẹ đè. */
    matSuKien: function (kieu, ms, v) {
      v = v || this.vis; if (!v) return;
      var now = performance.now(), cu = v.matSK, MANH = { dam: 3, xoay: 3, vui: 2, buon: 2, ngac: 1, lim: 0, cho: 0 };
      if (cu && cu.den > now && (MANH[cu.kieu] || 0) > (MANH[kieu] || 0)) return;
      v.matSK = { kieu: kieu, t0: now, den: now + (ms || 800) };
    },
    /** Chớp đỏ (đâm tường / lỗi). */
    chopDo: function (ms) { this.flash = performance.now() + (ms || 160); },

    /* ---- MÁY SƠN: hình mờ cần tô (ô nét đứt mang màu, chấm màu mờ ở giữa) và ô đã tô (sơn đặc, viền tối; ô vừa tô lóe sáng). Ô tô ngoài hình viền đỏ. */
    veSon: function (g, now) {
      var c = this.cfg, hinh = c.hinh, x, y, k, m;
      if (this.vec) {                                                           // vector (gói V4): ô cần tô = chấm màu mờ + viền nét đứt bo góc; ô đã tô = tấm sơn bo góc có bóng, lóe trắng; sai: viền + gạch chéo
        if (hinh) for (y = 0; y < hinh.length; y++) for (x = 0; x < hinh[y].length; x++) { m = hinh[y][x]; if (m && this.daSon[x + ',' + y] !== m) HU().sonCan(g, x, y, MAU_VIEN[m], now); }
        for (k in this.daSon) {
          var av = k.split(','), xv = +av[0], yv = +av[1], mv = this.daSon[k], lv = this.sonLoe[k], sai = hinh && hinh[yv] && hinh[yv][xv] !== mv;
          HU().sonDa(g, xv, yv, MAU_VIEN[mv] || BM.sanLamV4, lv ? (now - lv) / 380 : 1, sai ? (hinh[yv][xv] ? MAU_VIEN[hinh[yv][xv]] : BM.vecDo) : null, sai && hinh[yv][xv] ? MAU_VIEN[hinh[yv][xv]] : null);
        }
        return;
      }
      if (hinh) for (y = 0; y < hinh.length; y++) for (x = 0; x < hinh[y].length; x++) {
        m = hinh[y][x]; if (!m || this.daSon[x + ',' + y] === m) continue;
        g.save(); g.globalAlpha = 0.55; g.fillStyle = MAU_VIEN[m]; g.fillRect(x * T + 5, y * T + 5, T - 10, T - 10); g.restore();
        g.save(); g.setLineDash([2, 2]); g.lineDashOffset = -((now / 160) % 4); g.lineWidth = 1; g.strokeStyle = MAU_VIEN[m]; g.strokeRect(x * T + 1.5, y * T + 1.5, T - 3, T - 3); g.restore();
      }
      for (k in this.daSon) {
        var a = k.split(','); x = +a[0]; y = +a[1]; m = this.daSon[k];
        var loe = this.sonLoe[k], kk = loe ? (now - loe) / 380 : 1;
        g.fillStyle = BM.moToiSangV8; g.fillRect(x * T + 1, y * T + 1, T - 2, T - 2);
        g.fillStyle = MAU_VIEN[m] || BM.sanLamV4; g.fillRect(x * T + 2, y * T + 2, T - 4, T - 4);
        g.fillStyle = BM.moSangSangV1; g.fillRect(x * T + 2, y * T + 2, T - 4, 1); g.fillRect(x * T + 2, y * T + 2, 1, T - 4);
        if (kk >= 0 && kk < 1) { g.fillStyle = 'rgba(' + BM.tiaTrangRgb + ',' + (0.7 * (1 - kk)).toFixed(3) + ')'; g.fillRect(x * T + 2, y * T + 2, T - 4, T - 4); }
        if (hinh && hinh[y] && hinh[y][x] !== m) {                                           // ngoài hình (đỏ) hay sai màu (dấu chéo màu cần tô)
          g.save(); g.strokeStyle = hinh[y][x] ? MAU_VIEN[hinh[y][x]] : BM.sanDoV1; g.lineWidth = 1; g.strokeRect(x * T + 0.5, y * T + 0.5, T - 1, T - 1); g.restore();
          if (hinh[y][x]) { g.fillStyle = MAU_VIEN[hinh[y][x]]; for (var q = 3; q < T - 3; q++) { g.fillRect(x * T + q, y * T + q, 1, 1); } }
        }
      }
    },
    /** Tô ô o màu mau (hoạt cảnh): ô lóe trắng rồi hiện màu. */
    toO: function (o, mau) { var k = o.x + ',' + o.y; this.daSon[k] = mau; this.sonLoe[k] = performance.now(); },
    /** ink(c) vừa chạy: lon sơn trên xe đổi màu ngay. */
    datMauSon: function (mau) { if (this.vis && this.vis.son) this.vis.son.mau = mau; },

    /* ---- BÓNG MỜ (mục tiêu 'bong-mo'): xe mờ ở tư thế đích, vật mờ, ô ◆ phải đi qua */
    /** Vật mờ + ô ◆ (vẽ trên sân, dưới lớp robot). Vật đích: thùng mờ trong khung vàng nét đứt. ◆ chưa tới: kim cương kem viền tối; đã tới ('qua-diem'): vàng sáng + vòng tỏa. */
    veBongMoNen: function (g, now) {
      var b = this.cfg.bm; if (!b) return;
      var nhay = this.bmNhay > now && ((now / 150 | 0) & 1) === 0, i, o;
      for (i = 0; i < b.vat.length; i++) {
        o = b.vat[i];
        if (this.vec) HU().khungO(g, o.x, o.y, 1.5, 2.2, 0.9, o.mau ? MAU_VIEN[o.mau] : BM.vecDich, [3, 2], -((now / 140) % 5));     // vector: khung nét đứt bo góc
        else {
        g.save(); g.setLineDash([3, 2]); g.lineDashOffset = -((now / 140) % 5); g.lineWidth = 1; g.strokeStyle = o.mau ? MAU_VIEN[o.mau] : BM.sanVang;       // vật mờ có màu: khung nét đứt tô màu đó (đổi chỗ hai vật khác màu vẫn đọc được)
        g.strokeRect(o.x * T + 1.5, o.y * T + 1.5, T - 3, T - 3); g.restore(); }
        if (this.vatTaiO(o.x, o.y)) continue;                                                              // ô đã có vật thật nằm đó: chỉ giữ khung, khỏi vẽ vật mờ chồng lên (màu trộn lẫn)
        g.globalAlpha = nhay ? 0.85 : 0.45;
        this.veMotVat(g, this.kieuVatMo(o.mau), 8, o.x * T + 7, o.y * T + 6, 8, 2);        // vật mờ có màu thì vẽ dải màu như vật thật
        g.globalAlpha = 1;
      }
      for (i = 0; i < (b.thung || []).length; i++) {                                                       // thùng mờ (chương che-sung-hoi): thùng nặng nằm ô đó khi xong; khung nét đứt + thùng mờ, khỏi chồng lên thùng thật đã nằm đúng ô
        o = b.thung[i];
        if (this.vec) HU().khungO(g, o.x, o.y, 1.5, 2.2, 0.9, BM.vecDich, [3, 2], -((now / 140) % 5));
        else { g.save(); g.setLineDash([3, 2]); g.lineDashOffset = -((now / 140) % 5); g.lineWidth = 1; g.strokeStyle = BM.sanVang;
        g.strokeRect(o.x * T + 1.5, o.y * T + 1.5, T - 3, T - 3); g.restore(); }
        if (this.thungTaiO(o.x, o.y)) continue;
        g.globalAlpha = nhay ? 0.85 : 0.45;
        if (this.vec) g.drawImage(VeVector.vat('thung-nang', Math.round(T * this.sv)), o.x * T, o.y * T, T, T);     // vector: thùng thép mờ
        else g.drawImage(Ve.tiles().thung, o.x * T, o.y * T);
        g.globalAlpha = 1;
      }
      for (i = 0; i < b.diQua.length; i++) this.veDiQua(g, b.diQua[i], now, nhay);
    },
    /** Kiểu của một vật mờ: mặc định thùng gỗ (có dải màu nếu vật mờ mang màu). Sân của xe tay NAM CHÂM mà mọi vật thật đều cùng loại (cùng sắt, hay cùng vật nam châm cùng chữ N / S) thì vật mờ vẽ đúng loại đó. */
    kieuVatMo: function (mau) {
      var ds = this.vat0, v0 = ds[0];
      if (mau || !v0 || !this.cfg || !this.cfg.robot || this.cfg.robot.tay !== 'nam-cham') return { chat: 'go', mau: mau || null };
      for (var i = 1; i < ds.length; i++) if (ds[i].chat !== v0.chat || ds[i].cuc !== v0.cuc) return { chat: 'go', mau: null };
      return { chat: v0.chat, cuc: v0.cuc, mau: null };
    },
    /** Một ô ◆ (kim cương nhỏ, 7 pixel sân cao + viền tối); sang = đã có sự kiện 'qua-diem'. */
    veDiQua: function (g, o, now, nhay) {
      var cx = o.x * T + 7, cy = o.y * T + 7, t0 = this.diQuaSang[o.x + ',' + o.y], sang = t0 !== undefined;
      if (this.vec) { HU().kimCuong(g, cx, cy, sang ? BM.vecVang : nhay ? BM.vecDoSang : BM.vecVoToi, sang, sang ? (now - t0) / 650 : 1); return; }     // vector (gói V4): kim cương bo, vòng toả
      function kim(r, c) { g.fillStyle = c; for (var dy = -r; dy <= r; dy++) { var w = r - Math.abs(dy); g.fillRect(cx - w, cy + dy, 2 * w + 1, 1); } }
      function vien(r, c) { g.fillStyle = c; for (var dy = -r; dy <= r; dy++) { var w = r - Math.abs(dy); g.fillRect(cx - w, cy + dy, 1, 1); g.fillRect(cx + w, cy + dy, 1, 1); } }
      if (sang) {
        var k = (now - t0) / 650;
        if (k >= 0 && k < 1) { vien(4 + Math.round(k * 3), 'rgba(' + BM.tiaVangV1Rgb + ',' + (0.9 * (1 - k)).toFixed(3) + ')'); }
        kim(4, BM.vienDam); kim(3, BM.sanVang); g.fillStyle = BM.sanTrang; g.fillRect(cx - 1, cy - 2, 1, 1); g.fillRect(cx - 2, cy - 1, 1, 1);
      } else {
        kim(4, BM.vienDam); kim(3, nhay ? BM.sanDoSang : BM.moSangV5);
      }
    },
    /** Ô ◆ vừa tới (sự kiện 'qua-diem' của vết): sáng lên cho tới khi chạy lại / tua lại. */
    diQuaLen: function (o) {
      var k = o.x + ',' + o.y;
      if (this.diQuaSang[k] !== undefined) return;
      this.diQuaSang[k] = performance.now();
      this.burst(o.x * T + 7, o.y * T + 7, 8, [BM.sanVang, BM.sanTrang, BM.sanKemV2], 0.7);
    },
    /** Bóng mờ nháy ms mili giây (thua vì lệch bóng mờ / chưa qua ◆): hút mắt người chơi tới chỗ cần tới. */
    nhayBongMo: function (ms) { if (this.cfg && this.cfg.bm) this.bmNhay = performance.now() + (ms || 1200); },

    /* ---- SÂN THỬ XƯỞNG, CHẾ ĐỘ ĐẶT XE: kéo thả xe tới ô khác, chạm xe để xoay (việc chạm / kéo nằm ở xuong-ham.js; ở đây chỉ vẽ) */
    /** Bật / tắt chế độ sửa vị trí xe: bật thì xe có viền vàng nhấp nháy + mũi tên vòng (nhện, drone không có). Tắt thì hủy luôn cảnh kéo dở. */
    datSuaXe: function (bat) { this.suaXe = !!bat; if (!bat) this.keoXe = null; },
    /** Đang kéo xe: o = { x, y (tọa độ ô THỰC của xe, đã kẹp trong sân: xe đi theo ngón tay), tx, ty (ô sẽ thả xuống), hopLe (thả được), ngoai (ngón tay ra ngoài sân: không vẽ ô đích) }.
     *  o = null: hết kéo, người gọi tự datLai() (về chỗ cũ) hay nap() lại sân (chỗ mới). */
    datKeoXe: function (o) {
      this.keoXe = o || null;
      if (o && this.vis) { this.vis.x = o.x; this.vis.y = o.y; }
    },
    /** Xe vừa xoay 90° theo chiều kim đồng hồ (sân đã nạp lại với hướng mới): quay lại từ hướng cũ, hơi nhảy lên, đổi hướng ở nửa chừng, như lúc xe rẽ phải khi chạy. */
    xoayXe: function (ms) {
      var v = this.vis, self = this, my = this.rid, moi = v.d, cu = (moi + 3) % 4;
      v.d = cu;
      var mem = this.xoayMem();
      return this.tween(ms || 190, my, function (k) {
        v.hop = Math.sin(k * Math.PI) * 2;
        if (mem) v.gocMem = ease(k) * Math.PI / 2;                     // vector: xoay mượt (gói V4)
        else if (k > 0.5) v.d = moi;
        if (Math.random() < 0.4) self.burst(v.x * T + 11, v.y * T + 12, 1, [BM.sanTrang, BM.sanVangV2], 0.6);
      }).then(function () { if (my === self.rid) { v.d = moi; v.hop = 0; v.gocMem = 0; } });
    },
    /** Vẽ (pixel sân, DƯỚI thân xe): đang kéo thì ô đích (vàng nếu thả được, đỏ nếu không) + khung nét đứt mờ ở chỗ cũ (xe sẽ về đó nếu thả hỏng); không kéo thì khung vàng nhấp nháy quanh ô xe. */
    veSuaXe: function (g, now) {
      var b = this.cfg.bd, k = this.keoXe;
      if (this.vec) {                                                           // vector (gói V4): tấm + khung bo góc
        if (k) {
          if (!k.ngoai) { HU().tamO(g, k.tx, k.ty, 0.5, 2.4, k.hopLe ? BM.moVangV3 : BM.moDoToi); HU().khungO(g, k.tx, k.ty, 0.6, 2.4, 0.9, k.hopLe ? BM.vecVang : BM.vecDo); }
          HU().khungO(g, b.x, b.y, 1.5, 2.2, 0.8, BM.moSangV6, [2, 2]);
          return;
        }
        var sv2 = HU().giam() ? 1 : 0.5 + 0.5 * Math.sin(now / 210);
        HU().tamO(g, b.x, b.y, 0.5, 2.4, HU().rgba(BM.vecDichRgb, 0.08 + 0.1 * sv2)); HU().khungO(g, b.x, b.y, 0.6, 2.4, 1, HU().rgba(BM.vecDichRgb, 0.55 + 0.45 * sv2));
        return;
      }
      if (k) {
        if (!k.ngoai) {
          g.fillStyle = k.hopLe ? BM.moVangV3 : BM.moDoToi; g.fillRect(k.tx * T, k.ty * T, T, T);
          g.strokeStyle = k.hopLe ? BM.sanVangV2 : BM.sanDo; g.lineWidth = 1; g.strokeRect(k.tx * T + 0.5, k.ty * T + 0.5, T - 1, T - 1);
        }
        g.save(); g.setLineDash([2, 2]); g.strokeStyle = BM.moSangV6; g.lineWidth = 1; g.strokeRect(b.x * T + 1.5, b.y * T + 1.5, T - 3, T - 3); g.restore();
        return;
      }
      var sang = ((now / 330) | 0) & 1;                                                  // nháy từng nấc như viền hướng dẫn (steps), không mờ dần
      g.strokeStyle = sang ? BM.sanVangV2 : BM.moVangV4; g.lineWidth = 1; g.strokeRect(b.x * T + 0.5, b.y * T + 0.5, T - 1, T - 1);
      g.fillStyle = sang ? BM.moVangV5 : BM.moVangV6; g.fillRect(b.x * T, b.y * T, T, T);
    },
    /** Mũi tên vòng nhỏ (↻), viền tối + lõi vàng: gợi ý "chạm xe để xoay theo chiều kim đồng hồ". Nằm ở góc SAU-PHẢI của ô xe (xe quay lên: góc dưới phải; quay phải: dưới trái; xuống: trên trái; trái: trên phải)
     *  để khỏi đè lên tay kẹp / cần ở phía trước mũi xe. Vẽ TRÊN thân xe. */
    veMuiTenXoay: function (g, b) {
      var d = ((b.huong || 0) % 4 + 4) % 4, sx = (d === 0 || d === 3) ? 1 : -1, sy = (d === 0 || d === 1) ? 1 : -1;
      var cx = b.x * T + (sx > 0 ? T - 3.8 : 3.8), cy = b.y * T + (sy > 0 ? T - 3.8 : 3.8), r = 2.1, a0 = Math.PI * 0.85, a1 = Math.PI * 2.1, i;
      var px = cx + r * Math.cos(a1), py = cy + r * Math.sin(a1), tx = -Math.sin(a1), ty = Math.cos(a1), nx = Math.cos(a1), ny = Math.sin(a1);
      g.save(); g.lineCap = 'butt';
      for (i = 0; i < 2; i++) {
        g.strokeStyle = g.fillStyle = i ? BM.sanVangV2 : BM.vienDam; g.lineWidth = i ? 1 : 2.2;
        g.beginPath(); g.arc(cx, cy, r, a0, a1); g.stroke();
        var e = i ? 0 : 0.7;                                                           // lượt viền tối to hơn lượt vàng một chút
        g.beginPath();
        g.moveTo(px + tx * (2.2 + e), py + ty * (2.2 + e));
        g.lineTo(px + nx * (1.7 + e), py + ny * (1.7 + e));
        g.lineTo(px - nx * (1.7 + e), py - ny * (1.7 + e));
        g.closePath(); g.fill();
      }
      g.restore();
    },
    /** Xe mờ ở tư thế đích, vẽ trên lớp phủ DƯỚI robot thật: hình robot độ đục 0,35 + viền nét đứt vàng quanh hình bóng. (mx, my, ku) như veLop: gốc pixel thiết bị của tọa độ ô (đã trừ góc cửa sổ vẽ), pixel thiết bị trên pixel sân. */
    veBongMoXe: function (g, mx, my, ku, now) {
      var b = this.cfg.bm, c = this.cfg, p = this.p; if (!b || !p) return;
      var nhay = this.bmNhay > now && ((now / 150 | 0) & 1) === 0;
      var X = Math.round(mx + (b.x * T + 7) * ku), Y = Math.round(my + (b.y * T + 7) * ku);
      var camVat = !!b.cam && laTayKep(c.robot.tay);                              // xe mờ đang CẦM vật: kẹp khép, vật mờ nằm giữa hai càng
      var spr = VeRobot.ve(c.robot, { co: c.robot.than === 'nhen' && b.chan === 'co', wl: 0, wr: 0, ph: 0, tay: c.robot.tay ? { tuThe: 'tren', kep: camVat, cam: camVat ? 1 : null, xoay: c.robot.tay === 'xoay' ? b.xoay : undefined } : null, camBien: null }, b.d, p);
      var w = spr.width, h = spr.height, sc = spr.laPart ? 1 : ku, dw = Math.round(w * sc), dh = Math.round(h * sc), x0 = Math.round(X - dw / 2), y0 = Math.round(Y - dh / 2);
      g.imageSmoothingEnabled = false;
      g.globalAlpha = nhay ? 0.7 : 0.35;
      if (camVat) {                                                                  // vật mờ trong kẹp: vẽ TRƯỚC hình xe để hai càng đè lên mép vật như xe thật (tamVatKep, tay nâng)
        var vk = VeRobot.vatKep(c.robot, 'tren'), ang = b.d * Math.PI / 2, A = vk.ahead * p, nv = Math.round(vk.n || 10), vx = X + Math.sin(ang) * A, vy = Y - Math.cos(ang) * A;
        if (c.robot.tay === 'xoay') {                                                // tay xoay: vật mờ nằm trong kẹp ở nấc khớp của xe mờ
          var vq = VeRobot.vatXoay(c.robot, 'tren', GOC_XOAY[b.xoay]);
          vx = X + (Math.sin(ang) * vq.f + Math.cos(ang) * vq.l) * p; vy = Y + (-Math.cos(ang) * vq.f + Math.sin(ang) * vq.l) * p;
        }
        this.veMotVat(g, { chat: 'go', mau: b.camMau || null }, nv, vx, vy, nv * p, 4.5 * p);
      }
      if (b.cam && c.robot.tay === 'nam-cham') {                                      // xe mờ của tay nam châm đang HÚT một vật: vật mờ dính ở ô sát mũi (như veVatTu)
        var an = b.d * Math.PI / 2;
        this.veMotVat(g, this.kieuVatMo(b.camMau), 8, X + Math.sin(an) * T * ku, Y - Math.cos(an) * T * ku - ku, 8 * ku, 2 * ku);
      }
      g.drawImage(spr, 0, 0, w, h, x0, y0, dw, dh);
      g.globalAlpha = nhay ? 1 : 0.9;
      if (spr.laPart) g.drawImage(vienDut(spr, p), x0, y0);
      else { g.save(); g.setLineDash([4, 3]); g.lineWidth = Math.max(1, ku * 0.8); g.strokeStyle = BM.sanVangV2; g.strokeRect(Math.round(mx + b.x * T * ku) + 1, Math.round(my + b.y * T * ku) + 1, T * ku - 2, T * ku - 2); g.restore(); }
      g.globalAlpha = 1;
    },

    /* ---- ô đích, vật, dấu nổi */
    /** Ô đích còn trống: nền vàng nhạt + khung nét đứt chạy chậm. Đích có màu: ô đã là tấm màu, khung nét đứt tô màu đích (sáng hơn nền). */
    veDichTrong: function (g, now) {
      var ds = this.cfg.dich; if (!ds.length) return;
      if (this.vec) {                                                           // vector: hình 'dich' {trong} (nền hổ phách mờ + bốn góc khung) + viền nét đứt chạy, bo góc, ở trong (lệnh trực tiếp theo pixel sân)
        for (var j = 0; j < ds.length; j++) {
          var e = ds[j], ex = e.x * T, ey = e.y * T, vo2 = this.vatTaiO(e.x, e.y);
          if ((vo2 && this.vatDungMau(vo2, e)) || this.thungTaiO(e.x, e.y)) continue;
          g.drawImage(this.oV('dich', e.mau ? { kieu: 'trong', mau: e.mau } : { kieu: 'trong' }), ex, ey, T, T);
          g.save(); g.setLineDash([2, 1.5]); g.lineDashOffset = -((now / 140) % 3.5);
          if (e.mau) { g.lineWidth = 1.6; g.strokeStyle = BM.vecVien; VeVector.H.bo(g, ex + 3.5, ey + 3.5, T - 7, T - 7, 1.2); g.stroke(); }
          g.lineWidth = 0.9; g.strokeStyle = e.mau ? Ve.MAU[e.mau].vi : BM.vecDich; VeVector.H.bo(g, ex + 3.5, ey + 3.5, T - 7, T - 7, 1.2); g.stroke();
          g.restore();
        }
        return;
      }
      g.save(); g.lineWidth = 1; g.setLineDash([3, 2]); g.lineDashOffset = -((now / 140) % 5);
      for (var i = 0; i < ds.length; i++) {
        var d = ds[i], x = d.x * T, y = d.y * T, vo = this.vatTaiO(d.x, d.y);
        if ((vo && this.vatDungMau(vo, d)) || this.thungTaiO(d.x, d.y)) continue;
        if (d.mau) {
          g.setLineDash([]); g.strokeStyle = BM.vienDam; g.strokeRect(x + 2.5, y + 2.5, T - 5, T - 5);     // viền tối trong để khung sáng nổi trên nền cùng màu
          g.setLineDash([3, 2]); g.strokeStyle = Ve.MAU[d.mau].vi; g.lineWidth = 1.5; g.strokeRect(x + 1.25, y + 1.25, T - 2.5, T - 2.5); g.lineWidth = 1;
          continue;
        }
        g.fillStyle = BM.moVangV7; g.fillRect(x, y, T, T);
        g.strokeStyle = BM.sanVang; g.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
      }
      g.restore();
    },
    /** Vật o có hợp ô đích d không (đích không màu nhận mọi vật; đích có màu chỉ nhận vật cùng màu). */
    vatDungMau: function (o, d) { return !d.mau || o.mau === d.mau; },
    /** Khung đặc của ô đích đã có vật nằm (đích có màu: màu đích, có viền tối cho nổi). */
    veKhungDay: function (g, d) {
      if (d.mau) {
        g.lineWidth = 3; g.strokeStyle = BM.vienDam; g.strokeRect(d.x * T + 1.5, d.y * T + 1.5, T - 3, T - 3);
        g.lineWidth = 2; g.strokeStyle = Ve.MAU[d.mau].vi;
      } else { g.lineWidth = 2; g.strokeStyle = BM.sanVang; }
      g.strokeRect(d.x * T + 1, d.y * T + 1, T - 2, T - 2); g.lineWidth = 1;
    },
    /** Dấu ✗ nhỏ ở góc trên phải ô (x, y): vật thả sai màu đích. */
    veDauSai: function (g, x, y) {
      var X = [[0, 0], [1, 1], [2, 2], [3, 3], [0, 3], [1, 2], [2, 1], [3, 0]], i, ox = x * T + T - 6, oy = y * T + 2;
      g.fillStyle = BM.vienDam;
      for (i = 0; i < X.length; i++) { g.fillRect(ox + X[i][0] - 1, oy + X[i][1], 3, 1); g.fillRect(ox + X[i][0], oy + X[i][1] - 1, 1, 3); }
      g.fillStyle = BM.sanDoV2;
      for (i = 0; i < X.length; i++) g.fillRect(ox + X[i][0], oy + X[i][1], 1, 1);
    },
    /** Ô đích đã có vật nằm: khung đặc đè lên viền thùng (đích có màu mà vật sai màu: giữ khung nét đứt, thêm ✗). */
    veDichDay: function (g) {
      var ds = this.cfg.dich;
      for (var i = 0; i < ds.length; i++) {
        var d = ds[i], o = this.vatTaiO(d.x, d.y);
        if (!o && !this.thungTaiO(d.x, d.y)) continue;
        if (this.vec) { g.drawImage(this.oV('dich', { kieu: o && !this.vatDungMau(o, d) ? 'sai' : 'day', mau: d.mau || undefined }), d.x * T, d.y * T, T, T); continue; }   // vector: khung đặc / góc khung + ✗
        if (o && !this.vatDungMau(o, d)) {
          g.save(); g.lineWidth = 1; g.setLineDash([3, 2]); g.strokeStyle = Ve.MAU[d.mau].vi; g.strokeRect(d.x * T + 1.25, d.y * T + 1.25, T - 2.5, T - 2.5); g.restore();
          this.veDauSai(g, d.x, d.y);
          continue;
        }
        this.veKhungDay(g, d);
      }
    },
    /** Thùng nặng đang nằm đúng ô (x, y) (đã dừng hẳn, không đang trượt). */
    thungTaiO: function (x, y) {
      var ds = this.thungs || [];
      for (var i = 0; i < ds.length; i++) if (Math.abs(ds[i].x - x) < 0.01 && Math.abs(ds[i].y - y) < 0.01) return ds[i];
      return null;
    },
    thungTheoId: function (id) {
      var ds = this.thungs || [];
      for (var i = 0; i < ds.length; i++) if (ds[i].id === id) return ds[i];
      return null;
    },
    /** Thùng nặng: thép xám có đinh tán và sọc vàng đen. Thùng kẹt góc thì ô tô đỏ nhấp nháy và thùng ngả đỏ. */
    veThung: function (g, TL, now) {
      var ds = this.thungs || [];
      var nhun = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 2) : 0;
      for (var i = 0; i < ds.length; i++) {
        var o = ds[i], px = Math.round(o.x * T + o.dx), py = Math.round(o.y * T + o.dy);
        if (o.ket && this.vec) HU().tamO(g, Math.round(o.x), Math.round(o.y), 0.4, 2.4, 'rgba(' + BM.tiaDoV2Rgb + ',' + (0.28 + 0.14 * Math.sin(now / 120)).toFixed(2) + ')');
        else if (o.ket) {
          var nhay = 0.28 + 0.14 * Math.sin(now / 120);
          g.fillStyle = 'rgba(' + BM.tiaDoV2Rgb + ',' + nhay.toFixed(2) + ')'; g.fillRect(Math.round(o.x) * T, Math.round(o.y) * T, T, T);
        }
        if (this.vec) {                                                          // vector: thùng thép 'thung-nang' cỡ một ô, trượt mượt (không làm tròn px); kẹt: phủ đỏ bo góc
          var vx = o.x * T + o.dx, vy = o.y * T + o.dy + (this.thungTaiDich(o) ? nhun : 0);
          g.drawImage(VeVector.vat('thung-nang', Math.round(T * this.sv)), vx, vy, T, T);
          if (o.ket) { g.fillStyle = BM.moDoToiV1; VeVector.H.bo(g, vx + 1, vy + 1, T - 2, T - 2, 1.5); g.fill(); HU().khungO(g, Math.round(o.x), Math.round(o.y), 0.5, 2.4, 1, BM.sanDoV1); }
          continue;
        }
        g.drawImage(TL.thung, px, py + (this.thungTaiDich(o) ? nhun : 0));
        if (o.ket) { g.fillStyle = BM.moDoToiV1; g.fillRect(px + 1, py + 1, T - 2, T - 2); g.strokeStyle = BM.sanDoV1; g.lineWidth = 1; g.strokeRect(Math.round(o.x) * T + 0.5, Math.round(o.y) * T + 0.5, T - 1, T - 1); }
      }
    },
    thungTaiDich: function (o) {
      for (var i = 0; i < this.cfg.dich.length; i++) if (this.cfg.dich[i].x === o.x && this.cfg.dich[i].y === o.y) return true;
      return false;
    },
    vatTaiO: function (x, y) {
      for (var i = 0; i < this.objs.length; i++) { var o = this.objs[i]; if (o.tt === 'dat' && o.x === x && o.y === y) return o; }
      return null;
    },
    dichTaiO: function (x, y) {
      for (var i = 0; i < this.cfg.dich.length; i++) if (this.cfg.dich[i].x === x && this.cfg.dich[i].y === y) return this.cfg.dich[i];
      return null;
    },
    vatTaiDich: function (o) {
      for (var i = 0; i < this.cfg.dich.length; i++) if (this.cfg.dich[i].x === o.x && this.cfg.dich[i].y === o.y) return true;
      return false;
    },
    /** Vật nằm đất (luật vật 14/10): nhỏ, khoảng 57% ô (8 trên 14 pixel sân), giữa ô, có bóng đổ; vật vỡ mờ dần trong 0,8 giây; vật đang cầm (kẹp) vẽ ở lớp phủ
     *  ngay dưới ảnh robot (veVatKep); vật đang trượt vào / ra kẹp (tt 'anim', o.k 0 = nằm đất, 1 = trong kẹp) vẽ ở đây theo vị trí xe hiện tại. */
    veVat: function (g, TL, now) {
      var nhun = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 2) : 0;
      for (var i = 0; i < this.objs.length; i++) {
        var o = this.objs[i], rg = o.rung > now ? Math.sin(now / 22) * 1.3 : 0;
        if (o.tt === 'dat') this.veMotVat(g, o, 8, o.x * T + 7 + (o.dx || 0) + rg, o.y * T + this.yVatDat() + (o.dy || 0) - (o.nang || 0) + (this.vatTaiDich(o) ? nhun : 0), this.coVatDat(), 2);
        else if (o.tt === 'anim') this.veVatTruot(g, o, now);
        else if (o.tt === 'vo' && o.voLuc) {
          var k = (now - o.voLuc) / 800;
          if (k < 1 && this.vec) { g.globalAlpha = 0.7 * (1 - k); this.veVatVec(g, o, o.x * T + 7, o.y * T + this.yVatDat() - k * 4, 8); g.globalAlpha = 1; }   // vector: vật vỡ bay lên mờ dần, cùng cỡ thân vật nằm đất
          else if (k < 1) { g.globalAlpha = 0.7 * (1 - k); g.drawImage(this.hinhVat(o, 8), Math.round(o.x * T + 3), Math.round(o.y * T + 2 - k * 4)); g.globalAlpha = 1; }
        }
      }
    },
    /** Hình của vật o: sắt (khối kim loại) hay gỗ (thùng), có dải màu nếu vật mang màu; n = cạnh (8: nằm đất, 10: trong kẹp tính theo pixel part). */
    hinhVat: function (o, n, px) {
      if (this.vec && px > 0) { var hv = VeVector.vatCua(o), v = VeVector.vat(hv[0], px, hv[1]); if (v) return v; }   // vector: thùng gỗ / khối sắt / nam châm (ve-vector-ky-hieu.js vatCua) đúng px pixel thiết bị
      return Ve.makeVatNho(n || 8, o.chat, o.mau, o.cuc);
    },
    /** Vẽ một vật: sprite n×n phóng thành cạnh sz, tâm (x, y), bóng đổ = bản đen mờ của vật lệch (so / 2, so) về phía phải-dưới (ánh sáng từ trái trên, như mọi hình trong game):
     *  vật nằm sát đất so ≈ 1/4 cạnh, bóng đậm; vật nhấc cao so ≈ 0,45 cạnh, bóng nhạt, rời xa. Mọi số theo đơn vị của g.
     *  dd: độ đậm lớp tô đỏ phủ lên vật (thả bị chặn), 0 = không tô. */
    veMotVat: function (g, o, n, x, y, sz, so, dd) {
      if (this.vec) {                                                           // vector (gói V4): không làm tròn px (trượt mượt), bóng khối bo góc mềm, lớp đỏ bo góc
        var hv2 = this.hinhVat(o, n, Math.max(2, Math.round(sz * this.tiLeCua(g)))), vx0 = x - sz / 2, vy0 = y - sz / 2;
        HU().bongVat(g, vx0, vy0, sz, so, so > sz * 0.3);
        g.drawImage(hv2, vx0, vy0, sz, sz);
        if (dd) HU().toDo(g, vx0, vy0, sz, dd);
        return;
      }
      var h = Math.max(2, Math.round(sz)), x0 = Math.round(x - sz / 2), y0 = Math.round(y - sz / 2), hv = this.vec ? this.hinhVat(o, n, Math.round(h * this.tiLeCua(g))) : this.hinhVat(o, n);
      g.fillStyle = so > sz * 0.3 ? BM.moToiV20 : BM.moToiV21;
      if (hv.width !== n && this.vec) g.fillRect(x0 + Math.round(so * 0.5) + h * 0.12, y0 + Math.round(so) + h * 0.14, h * 0.76, h * 0.72);   // thùng vector chiếm 76% hộp: bóng theo chân thùng
      else g.fillRect(x0 + Math.round(so * 0.5), y0 + Math.round(so), h, h);
      g.drawImage(hv, x0, y0, h, h);
      if (dd) { g.fillStyle = 'rgba(' + BM.tiaDoV6Rgb + ',' + dd.toFixed(2) + ')'; g.fillRect(x0, y0, h, h); }
    },
    /** Tâm vật trong kẹp theo pixel THIẾT BỊ của lớp phủ, cho xe có thân tâm (X, Y): { x, y, n, sz, so, a } (a = góc mũi xe, n = cạnh sprite, so = độ lệch bóng).
     *  Tay hạ: vật sát đất, nhỏ hơn một chút (9 pixel part), bóng sát; tay nâng: vật cao hơn nên to hơn (10), bóng nhạt và xa. */
    tamVatKep: function (X, Y) {
      var v = this.vis, a = this.gocMui(), low = v.tay.tuThe === 'duoi', vk = VeRobot.vatKep(this.cfg.robot, v.tay.tuThe), p = this.p, A = vk.ahead * p, n = vk.n ? Math.round(low ? vk.n * 0.9 : vk.n) : (low ? 9 : 10);
      if (this.cfg.robot.tay === 'xoay') {                                         // tay xoay: tâm vật theo góc cánh tay (nấc khớp, hay góc đang xoay giữa chừng) quanh khớp ở mũi xe
        var vq = VeRobot.vatXoay(this.cfg.robot, v.tay.tuThe, typeof v.tay.goc === 'number' ? v.tay.goc : GOC_XOAY[v.tay.xoay || 'truoc']);
        return { x: X + (Math.sin(a) * vq.f + Math.cos(a) * vq.l) * p, y: Y + (-Math.cos(a) * vq.f + Math.sin(a) * vq.l) * p, n: n, sz: n * p * (this.vec ? 1 / 0.76 : 1), so: (low ? 2 : 4.5) * p, a: a };
      }
      return { x: X + Math.sin(a) * A, y: Y - Math.cos(a) * A, n: n, sz: n * p * (this.vec ? 1 / 0.76 : 1), so: (low ? 2 : 4.5) * p, a: a };     // vector (gói V4): THÂN vật (76% hộp) = cạnh khe kẹp, dễ thấy
    },
    /** Vật đang nằm trong kẹp (robot kẹp, trangThai 'cam'), hoặc null. */
    vatCamKep: function () {
      if (!laTayKep(this.cfg.robot.tay)) return null;
      var id = this.xe && this.vis.tay ? this.vis.tay.cam : undefined;                // nhiều robot: chỉ vật xe đang xét đang cầm
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].tt === 'cam' && (id === undefined || this.objs[i].id === id)) return this.objs[i];
      return null;
    },
    /** Vật trong kẹp, vẽ trên lớp phủ NGAY DƯỚI ảnh robot (hai càng đè lên mép vật): đi theo xe, quay theo xe; thả bị chặn thì rung + tô đỏ. (X, Y) = tâm thân, pixel thiết bị. */
    veVatKep: function (g, X, Y, now) {
      var o = this.vatCamKep(); if (!o) return;
      var t = this.tamVatKep(X, Y), rung = this.vis.kepRung > now, lech = rung ? Math.sin(now / 22) * 1.3 * this.kk * this.u : 0;
      g.imageSmoothingEnabled = false;
      this.veMotVat(g, o, t.n, t.x + Math.cos(t.a) * lech, t.y + Math.sin(t.a) * lech, t.sz, t.so, rung ? 0.3 + 0.2 * Math.abs(Math.sin(now / 60)) : 0);
    },
    /** Vật đang trượt giữa ô trước mặt và kẹp (nhặt / đặt / thả vỡ): vị trí, cỡ và độ cao của bóng nội suy theo o.k (0 = nằm đất ở ô (tx, ty), 1 = trong kẹp). Vẽ trên sân, dưới lớp robot. */
    veVatTruot: function (g, o, now) {
      var v = this.vis, f = this.kk * this.u, k = o.k || 0, gx = o.tx * T + 7, gy = o.ty * T + this.yVatDat(), nD = this.coVatDat();
      if (!this.lopOK || !this.p) { this.veMotVat(g, o, 8, gx, gy, nD, 2); return; }
      var t = this.tamVatKep((v.x * T + v.dx + 7) * f, (v.y * T + v.dy + 7 - v.hop) * f);       // đo theo pixel thiết bị gốc (không cộng lề: chỉ cần hiệu), rồi đổi về pixel sân
      var cx = t.x / f, cy = t.y / f, sz = t.sz / f, so = t.so / f;
      this.veMotVat(g, o, k > 0.5 ? t.n : 8, gx + (cx - gx) * k, gy + (cy - gy) * k, nD + (sz - nD) * k, 2 + (so - 2) * k);
    },
    /** Vật nằm ngay dưới xe (xe đứng đúng giữa ô, chưa cầm): thân xe che hết thùng nên robot được vẽ hơi trong suốt, thùng lộ ra. */
    vatDuoiXe: function () {
      var v = this.vis, o = this.vatTaiO(Math.round(v.x), Math.round(v.y));
      return (o && Math.abs(v.x - o.x) < 0.01 && Math.abs(v.y - o.y) < 0.01) ? o : null;
    },

    /* ---- KHUNG GỖ ÔM SÂN */
    /** Khung gỗ (div `.khung-san`, dưới canvas sân, trên nền bàn xưởng) ôm sát canvas sân sau khi cắt: rộng / cao bằng canvas + DEM_KHUNG mỗi phía, theo vị trí THẬT của canvas trong .ffr
     *  (canh giữa, hoặc dính đáy khi nhãn ⚠ cần chỗ phía trên), nên sân hẹp (1×4, 5×1) không nằm giữa một khung vuông to. Vùng .ffr 218×218 giữ nguyên (cột nút bên phải không nhảy), phần ngoài khung là nền bàn.
     *  Đặt hai biến CSS trên .ffr cho toast: --kw (bề ngang khung) và --kdy (khoảng từ đáy khung tới đáy .ffr), để toast nằm trong khung chứ không trôi ra giữa nền bàn.
     *  Gọi từ doiCo (khi nạp sân và ~30 khung một lần): chỉ ghi lại style khi hình học đổi. */
    datKhung: function () {
      var cv = this.cv, par = cv.parentNode;
      if (!par || !par.style || !cv.offsetWidth) return;
      if (!this.khung) {
        var k = document.createElement('div'); k.className = 'khung-san'; k.setAttribute('aria-hidden', 'true');
        par.insertBefore(k, par.firstChild); this.khung = k; this.khungKhoa = '';
      }
      var x = cv.offsetLeft - DEM_KHUNG, y = cv.offsetTop - DEM_KHUNG, w = cv.offsetWidth + 2 * DEM_KHUNG, h = cv.offsetHeight + 2 * DEM_KHUNG, kdy = Math.max(0, par.clientHeight - y - h);
      var khoa = [x, y, w, h, kdy].join('|');
      if (khoa === this.khungKhoa) return;
      this.khungKhoa = khoa;
      var s = this.khung.style;
      s.left = x + 'px'; s.top = y + 'px'; s.width = w + 'px'; s.height = h + 'px'; s.display = 'block';
      par.style.setProperty('--kw', w + 'px'); par.style.setProperty('--kdy', kdy + 'px');
    },

    /* ---- LỚP PHỦ ROBOT */
    taoLop: function () {
      if (this.lop) return;
      var l = document.createElement('canvas'); l.className = 'tex lop-robot';
      this.cv.parentNode.insertBefore(l, this.cv.nextSibling);
      this.lop = l; this.lg = l.getContext('2d');
    },
    /** Đo lại cỡ hiển thị của sân (kể cả co giãn khung 360×640 và devicePixelRatio) rồi dựng lớp phủ: lề tràn ra, độ phân giải = pixel thiết bị,
     *  tỉ lệ robot (pixel thiết bị / pixel part) nguyên lần cho vừa một ô. Gọi khi nạp sân và cứ ~30 khung một lần (đổi cỡ cửa sổ). */
    doiCo: function () {
      var cv = this.cv, ow = cv.offsetWidth, c = this.cfg;
      if (!c) return;
      if (!ow) { this.lopOK = false; return; }
      this.datKhung();
      this.taoLop();
      var r = cv.getBoundingClientRect(), f = Math.max(0.5, (r.width / ow) * (window.devicePixelRatio || 1));
      var khoa = [ow, cv.offsetHeight, cv.offsetLeft, cv.offsetTop, f.toFixed(3), c.robot.than, c.robot.tay].join('|');
      if (khoa === this.lopKhoa && this.lopOK) return;
      this.lopKhoa = khoa;
      var kk = ow / this.pw, S = T * kk * f, p = VeRobot.tiLeChoO(S, c.robot);
      if (this.vec && Math.round(S) !== this.pxO) this.datDoPhanGiai(Math.round(S));   // vector: canvas sân đúng pixel thiết bị thật (kể cả khung 360×640 bị phóng / thu)
      if (c.robot.tay && p > 1) {                                                   // tay nhô ra khi xe sát mép TRÁI: bên trái sân chỉ còn lề khung (mép màn hình cắt), các phía khác lớp phủ nằm trên mọi thứ
        var host = cv.closest('.screen') || cv.closest('.ws-ov'), tr = host ? r.left - host.getBoundingClientRect().left : 0, dr = window.devicePixelRatio || 1;
        var pTran = (0.15 * S + S / 2 + tr * dr) / VeRobot.REACH;                   // tay vượt quá ~15% ô thì thu robot nhỏ lại cho tay không bị cắt
        if (p > pTran) p = Math.max(1, Number.isInteger(p) ? Math.floor(pTran) : pTran);   // tỉ lệ nguyên thì lùi về số nguyên (nét đều), tỉ lệ lẻ thì thu vừa đủ
      }
      var mc = Math.max(4, Math.ceil(((VeRobot.reachCua ? VeRobot.reachCua(c.robot) : VeRobot.REACH) * p - S / 2) / f) + 3);          // lề (px CSS): tay nhô ra khi xe sát mép sân (vector: tay xoay vươn sang ô bên)
      var cw = ow + 2 * mc, ch = cv.offsetHeight + 2 * mc, l = this.lop;
      l.width = Math.max(1, Math.round(cw * f)); l.height = Math.max(1, Math.round(ch * f));
      l.style.width = cw + 'px'; l.style.height = ch + 'px'; l.style.imageRendering = this.vec ? 'auto' : '';
      l.style.left = (cv.offsetLeft - mc) + 'px'; l.style.top = (cv.offsetTop - mc) + 'px';
      this.kk = kk; this.u = l.width / cw; this.mc = mc; this.p = p;
      var hh = this.hh = VeRobot.hinhHoc ? VeRobot.hinhHoc(c.robot) : { mz: 24, mzs: 10.5, bk: 23.5, pp: 1, dinh: 11 };   // hình học tay: pixel = hằng pixel part; vector = 1/100 ô đo từ hình (gói V3)
      this.pp = hh.pp * p / (kk * this.u);                                           // camera: 1 pixel part = bao nhiêu pixel sân
      this.mz = hh.mz * p / (kk * this.u);                                           // súng hơi: từ tâm xe tới miệng NÒNG TRƯỚC (pixel sân) = 24 pixel part
      this.mzs = hh.mzs * p / (kk * this.u);                                         // súng hơi: từ tâm xe tới miệng NÒNG SAU (nhô khỏi đuôi xe) = 10,5 pixel part
      this.bk = hh.bk * p / (kk * this.u);                                           // máy ném: từ tâm xe tới rổ ở đầu cần (pixel sân) = 23,5 pixel part
      this.lopOK = true;
    },
    /** Vẽ robot + hạt + chớp đỏ + dấu nổi lên lớp phủ. */
    veLop: function (now) {
      if (!this.xe) { this.veLopXe(now, true, true); return; }
      var dang = this.xeDang, n = this.xe.length;
      for (var k = 1; k <= n; k++) { this.chonXe((dang + k) % n); this.veLopXe(now, k === 1, k === n); }      // vòng cuối là xe đang xét: ngữ cảnh trả về như cũ
    },
    /** Lớp phủ của MỘT xe (xe đang xét). dau: xóa lớp phủ trước khi vẽ (xe đầu tiên); cuoi: vẽ cả hạt bụi, chớp đỏ (xe cuối cùng). Một robot: cả hai true. */
    veLopXe: function (now, dau, cuoi) {
      var v = this.vis, c = this.cfg, g = this.lg;
      if ((this.dem = (this.dem + 1) % 30) === 0 || !this.lopOK) this.doiCo();
      var ok = this.lopOK, kk = this.kk, u = this.u, ku = kk * u, mcu = this.mc * u, i;
      var mx = mcu - c.ox * T * ku, my = mcu - c.oy * T * ku;                          // gốc pixel thiết bị của hệ tọa độ ô đầy đủ (lõi): lớp phủ có lề mcu, sân đã dịch về góc cửa sổ vẽ (ox, oy)
      var rx = v.x * T + v.dx, ry = v.y * T + v.dy, cx = rx + 7, cy = ry + 7;           // tâm ô (pixel sân)
      if (v.dr) v.hop = this.altDrone(now);                                               // drone: luôn lơ lửng, độ cao theo từng khung hình
      if (ok) {
        g.setTransform(1, 0, 0, 1, 0, 0);
        if (dau) g.clearRect(0, 0, this.lop.width, this.lop.height);
        var hopMung = (this.mung > now && !v.dr && !v.roi) ? Math.abs(Math.sin((this.mung - now) / 85 + (this.vec ? (this.xeDang || 0) * 0.9 : 0))) * 2.8 : 0;      // vector: nhiều robot nảy lệch pha (gói V4)
        var X = Math.round(mx + cx * ku), Y = Math.round(my + cy * ku - (v.hop + hopMung) * ku), p = this.p;
        var ph = (now / 90 | 0) & 1, duoi = this.vatDuoiXe();
        if (this.docs.length) { g.setTransform(ku, 0, 0, ku, mx, my); this.veVongMauDuoi(g, now); this.veTiaCameraDuoi(g, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // cảm biến màu vừa đọc: vòng sáng dưới gầm
        if (v.dr) { g.setTransform(ku, 0, 0, ku, mx, my); this.veDuoiDrone(g, cx, cy, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // drone: ô sạc lóe, bóng đổ, từ trường treo, vật treo (dưới thân)
        if (v.nc) { g.setTransform(ku, 0, 0, ku, mx, my); if (!v.dr) this.veSongTu(g, cx, cy - v.hop, now); this.veVatTu(g, cx, cy - v.hop, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // nam châm: sóng hút ở phía trước, vật dính / đang bị hút bay (dưới thân xe: hai càng nam châm ôm lên vật)
        if (v.nem) { g.setTransform(ku, 0, 0, ku, mx, my); this.veNgam(g, cx, cy - v.hop, now); this.veOVo(g, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // máy ném: vạch ngắm + ô rơi vỡ dưới thân xe
        if (this.canhBao) { g.setTransform(ku, 0, 0, ku, mx, my); this.veOCanhBao(g, now); g.setTransform(1, 0, 0, 1, 0, 0); }          // ô trước mặt bị chặn khi thả (kẹp lẫn nam châm): ô đỏ nhấp nháy dưới thân xe
        if (this.suaXe) { g.setTransform(ku, 0, 0, ku, mx, my); this.veSuaXe(g, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // sân thử, chế độ Đặt xe: viền nhấp nháy quanh xe, hoặc ô đích + chỗ cũ khi đang kéo (dưới thân xe)
        if (c.bm) this.veBongMoXe(g, mx, my, ku, now);                                                         // bóng mờ: xe mờ ở tư thế đích, nằm DƯỚI robot thật
        var wL = this.wh.L, wR = this.wh.R, phC = ph;
        if (v.dr) { wL = wR = (v.dr.roi || (v.dr.nguy && ((now / 110 | 0) & 1))) ? 0 : 2; phC = wL ? (now / 70 | 0) & 1 : 0; }          // drone: cánh quạt quay không ngừng (tắt khi rơi / nằm đất), hai cặp cánh đổi nhau
        if (c.robot.than === 'nhen') { wL = wR = v.chan ? 2 : 0; if (v.chan === 1) phC = 1; }   // nhện: chan 1 = nhấc chân (khung `buoc` đứng yên), 2 = chân bước luân phiên
        var ttR = { wl: wL, wr: wR, ph: phC, tay: v.son ? { tuThe: v.son.ha ? 'duoi' : 'tren', kep: false, cam: null, mauSon: v.son.mau } : v.sung ? { tuThe: 'tren', kep: false, cam: null, dangBanTruoc: v.sung.truoc > now, dangBanSau: v.sung.sau > now } : v.nem ? { tuThe: 'tren', kep: false, cam: !!this.vatRo(), ngam: v.nem.tam, dangNem: v.nem.dang > now } : v.nc ? { tuThe: 'tren', kep: false, cam: null, bat: v.nc.bat, cuc: v.nc.cuc } : v.tay, camBien: (v.camBien || this.camBienSang(now)) ? { bat: true, mat: this.camMatSang(now) } : null, loi: v.tayDo > now && ((now / 130 | 0) & 1) === 0 ? 'tay' : null };
        if (c.robot.than === 'nhen' && v.co) ttR.co = true;                                // nhện đang CO CHÂN: ảnh part thấp sát đất
        if (this.vec) { this.hoatVec(v, ttR, now); X += (v.lacMat || 0) * ku; Y -= (v.nayMat || 0) * ku; }      // vector (gói V4): bánh theo quãng đi, kẹp / gáo tween, mắt biểu cảm (rung khi đâm, nảy khi vui)
        var spr = VeRobot.ve(c.robot, ttR, v.d, p);
        g.imageSmoothingEnabled = false;
        if (spr.laPart && laTayKep(c.robot.tay)) this.veVatKep(g, X, Y, now);                 // vật trong kẹp: dưới ảnh part, hai càng đè lên mép vật
        var w = spr.width, h = spr.height, sc = spr.laPart ? 1 : ku;
        if (!v.dr) {                                                                      // drone có bóng riêng (veDuoiDrone)
          g.fillStyle = this.xe ? (this.cfgXe[this.xeDang].mauXe || MAU_XE[this.xeDang % MAU_XE.length]) : BM.moToiV22;      // bóng dưới thân; nhiều robot: đế mang màu của xe (R1 vàng, R2 lam / đỏ đối kháng)
          if (spr.laVector) { /* vector: bóng đổ nằm trong hình robot; màu đội ở kính + mắt + ăng-ten */ }
          else if (spr.laPart) g.fillRect(Math.round(X - 9 * p), Math.round(Y + 7 * p), Math.round(18 * p), Math.max(1, Math.round(2.5 * p)));
          else g.fillRect(Math.round(X - 5 * ku), Math.round(Y + 6 * ku), Math.round(10 * ku), Math.max(1, Math.round(2 * ku)));
        }
        if (spr.laPart && laTayKep(c.robot.tay) && !v.goc) {                              // bóng của TAY KẸP (khác bóng thân): tay hạ = bóng sát, đậm; tay nâng = bóng xa, nhạt
          var bt = VeRobot.bongTay(c.robot, ttR, v.d, p);
          if (bt) {
            var thap = v.tay.tuThe === 'duoi', lech = (thap ? 1 : 3.5) * p;
            g.globalAlpha = thap ? 0.42 : 0.28;
            g.drawImage(bt, 0, 0, bt.width, bt.height, Math.round(X - bt.width * sc / 2 + lech * 0.5), Math.round(Y - bt.height * sc / 2 + lech), Math.round(bt.width * sc), Math.round(bt.height * sc));
            g.globalAlpha = 1;
          }
        }
        if (duoi) g.globalAlpha = v.dr ? 0.7 : 0.66;                                    // vật nằm ngay dưới thân (kể cả drone lơ lửng phía trên): thân hơi trong suốt cho lộ vật
        var gocV = ((v.goc || 0) + (this.vec && v.gocMem || 0)) || (v.dr && v.dr.roi ? 0.22 : 0);      // vector: cộng góc quay mượt (gói V4)                               // drone đã rơi: nằm nghiêng
        var coMat = spr.laPart && !spr.laVector && coMatDong();                        // vector: mắt đã vẽ trong hình (mắt động biểu cảm: gói V4)
        if (gocV || v.roi) {                                                              // xích quay dở: xoay thêm góc `goc` (rad) quanh tâm thân; nhện RƠI HỐ (v.roi 0→1): nhỏ dần, xoay, mờ dần
          g.save(); g.translate(X, Y); if (gocV) g.rotate(gocV);
          if (v.roi) { var ss = Math.max(0.1, 1 - 0.88 * v.roi); g.scale(ss, ss); g.rotate(v.roi * 2.2); g.globalAlpha = Math.max(0, 1 - 0.92 * v.roi); }
          g.drawImage(spr, 0, 0, w, h, Math.round(-w * sc / 2), Math.round(-h * sc / 2), Math.round(w * sc), Math.round(h * sc));
          if (coMat) this.veMatDong(g, 0, 0, p, c.robot, v, now);
          g.restore();
        } else {
          g.drawImage(spr, 0, 0, w, h, Math.round(X - w * sc / 2), Math.round(Y - h * sc / 2), Math.round(w * sc), Math.round(h * sc));
          if (coMat) this.veMatDong(g, X, Y, p, c.robot, v, now);
        }
        g.globalAlpha = 1;
        g.setTransform(ku, 0, 0, ku, mx, my);                                           // từ đây vẽ theo pixel sân
        if (c.robot.than === 'nhen') this.veMaiGam(g, v, c);                                // nhện chui trong gầm: mái ván trong mờ phủ lên nhện
        if (v.dr) this.veThanhPin(g, cx, cy, now);                                        // drone: thanh pin nhỏ nổi trên đỉnh
        if (this.suaXe && !this.keoXe && !v.dr && c.robot.than !== 'nhen') this.veMuiTenXoay(g, c.bd);       // chế độ Đặt xe: mũi tên vòng ở góc ô xe gợi ý "chạm để xoay" (nhện, drone không xoay)
        var tx = Math.round(v.x), ty = Math.round(v.y);                                   // ô đích đã có vật dưới xe: khung vàng đặc nằm TRÊN xe
        if (this.vatTaiO(tx, ty) && this.vatTaiDich(this.vatTaiO(tx, ty)) && Math.abs(v.x - tx) < 0.01 && Math.abs(v.y - ty) < 0.01) {
          var dd = this.dichTaiO(tx, ty);
          if (this.vec) g.drawImage(this.oV('dich', { kieu: dd && !this.vatDungMau(this.vatTaiO(tx, ty), dd) ? 'sai' : 'day', mau: (dd && dd.mau) || undefined }, g), tx * T, ty * T, T, T);   // vector: hình 'dich' đúng pixel thiết bị của lớp phủ
          else if (dd && !this.vatDungMau(this.vatTaiO(tx, ty), dd)) this.veDauSai(g, tx, ty); else this.veKhungDay(g, dd || { x: tx, y: ty });
        }
        if (v.nem) this.veVatNem(g, cx, cy - v.hop, now);                                 // máy ném: vật trong rổ / vật đang bay phía TRÊN thân xe
        if (v.sung) { this.veBong(g, now); this.veDan(g, now); }                          // súng hơi: quả bóng đang bay (trên cả cửa, nút), số đạn còn
        if (this.docs.length) this.veTia(g, now);
        if (v.bongMau && v.bongMau.den > now) this.veBongMau(g, cx, cy, now, c.robot.tay ? 24 : 20);
        if (v.choang > now) this.veChoang(g, cx, cy - v.hop, now, v.dr ? this.dinhDrone() : c.robot.tay ? 16 : 13);
        if (v.bao && v.baoDen > now) this.veDau(g, v.bao, v.dr ? cx + 5 : cx, cy, now, v.dr ? this.dinhDrone() - 3 : c.robot.tay ? 25 : 21);       // drone: dấu nổi ở phía trên bên phải thân (phía trên là thanh pin)
        if (cuoi && this.flash > now) {
          if (this.vec) HU().chop(g, c.ox * T, c.oy * T, this.pw, this.ph, Math.min(1, (this.flash - now) / 90 + 0.35));       // vector: viền đỏ toả vào từ mép (gói V4)
          else { g.fillStyle = BM.moDoToiV2; g.fillRect(c.ox * T, c.oy * T, this.pw, this.ph); }
        }
      }
      for (i = cuoi ? this.parts.length - 1 : -1; i >= 0; i--) {
        var q = this.parts[i]; q.life--; q.vy += 0.05; q.x += q.vx; q.y += q.vy;
        if (q.life <= 0) { this.parts.splice(i, 1); continue; }
        if (!ok || this.vec) continue;                                                   // vector: vẽ cả lượt sau vòng (HU.hat: tròn, khói, mảnh vỡ)
        if (q.mo) g.globalAlpha = Math.min(1, q.life / 18);
        g.fillStyle = q.c; g.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
        if (q.mo) g.globalAlpha = 1;
      }
      if (cuoi && ok && this.vec) HU().hat(g, this.parts);
      if (v.dr && v.dr.roi && ok && Math.random() < 0.1) { this.burst(cx + (Math.random() - 0.5) * 6, cy - 2, 1, [BM.sanXamToi, BM.sanXamToiV1, BM.sanLamV1], 0.22, 2, true); this.kieuHat(1, 'khoi'); }          // drone nằm đất: khói bốc lên
    },
    /** Đặt kiểu vẽ vector (gói V4: 'khoi' cụm tròn nở dần, 'manh' mảnh vỡ tam giác) cho n hạt vừa phun; nhánh pixel không đọc trường này. */
    kieuHat: function (n, kieu) { for (var i = Math.max(0, this.parts.length - n); i < this.parts.length; i++) this.parts[i].kieu = kieu; },
    /** Chế độ vector (gói V4): thêm vào trạng thái robot ttR những thứ chạy MƯỢT theo khung hình — pha bánh / xích / con lăn theo quãng đã đi (lan 0..1, 1/8),
     *  kẹp mở / đóng dần (moK), gáo máy ném vung dần (vung); nhánh pixel không gọi. */
    hoatVec: function (v, ttR, now) {
      var r = this.cfg.robot, dt = v._t ? Math.min(100, Math.max(0, now - v._t)) : 0, px = v.x * T + v.dx, py = v.y * T + v.dy, gq = (v.goc || 0) + (v.gocMem || 0);
      v._t = now;
      var diChuyen = v._px !== undefined && (Math.abs(px - v._px) + Math.abs(py - v._py) + Math.abs(gq - (v._gq || 0))) > 0.01;
      if (r.than !== 'drone' && r.than !== 'nhen') {
        var dq = v._px === undefined ? 0 : Math.sqrt((px - v._px) * (px - v._px) + (py - v._py) * (py - v._py)) + Math.abs(gq - (v._gq || 0)) * 6;
        if (dq < 0.01 && (this.wh.L || this.wh.R)) dq = dt * 0.02;                     // bánh quay tại chỗ (đâm tường, băng không đẩy được)
        v.quang = (v.quang || 0) + dq;
        ttR.lan = Math.floor(((v.quang / 4.5) % 1) * 8) / 8;
      }
      v._px = px; v._py = py; v._gq = gq;
      var mu = Math.min(1, dt / 70);
      if (r.tay === 'kep' && ttR.tay && !ttR.tay.cam) {
        var dich = ttR.tay.kep ? 0 : 1; v.kepK = v.kepK === undefined ? dich : v.kepK + (dich - v.kepK) * mu;
        if (Math.abs(v.kepK - dich) < 0.04) v.kepK = dich; else ttR.tay = Object.assign({}, ttR.tay, { moK: v.kepK });
      } else v.kepK = undefined;
      this.bieuCam(v, ttR, now, diChuyen ? 1 : 0);
      if (v.nem && ttR.tay) {
        var dv = v.nem.dang > now ? 1 : 0; v.nem.vungK = v.nem.vungK === undefined ? dv : v.nem.vungK + (dv - v.nem.vungK) * Math.min(1, dt / 55);
        if (Math.abs(v.nem.vungK - dv) < 0.04) v.nem.vungK = dv; else ttR.tay = Object.assign({}, ttR.tay, { vung: v.nem.vungK });
      }
    },
    /** Chọn biểu cảm mắt của xe v lúc now (gói V4) → ttR.mat ('kieu' hay 'kieu:liec'), v.lacMat / v.nayMat (pixel sân: rung khi đâm, nảy khi vui).
     *  Thứ tự: sự kiện mạnh (matSuKien) > xong màn (mung: cười tới khi hộp kết quả hiện) > drone nằm đất (lim) > chớp theo thời gian (2,5–5 s ngẫu nhiên mỗi xe, thỉnh thoảng
     *  chớp đôi, ~150 ms) > đứng lâu (lim dim). Liếc theo hướng đang quay (gocMem) hay hướng sắp đi. Giảm chuyển động: không chớp, không rung / nảy. */
    bieuCam: function (v, ttR, now, dq) {
      var giam = HU().giam(), sk = v.matSK && v.matSK.den > now ? v.matSK : null, kieu = 'thuong', liec = 0;
      if (dq > 0.01 || v._tDi === undefined) v._tDi = now;
      if (v.chopKe === undefined) { v.hatMat = 1013904223 + 2654435761 * ((this.xeDang || 0) + 1) >>> 0; v.chopKe = now + 700 + this.soMat(v) * 2600; }
      var kc = now - v.chopKe, chop = null;
      if (kc >= 0) {
        if (kc < 150) chop = kc < 45 || kc > 110 ? 'chop1' : 'chop2';
        else if (v.chopDoi && kc >= 230 && kc < 380) chop = kc - 230 < 45 || kc - 230 > 110 ? 'chop1' : 'chop2';
        else if (kc >= (v.chopDoi ? 380 : 150)) { v.chopKe = now + 2500 + this.soMat(v) * 2500; v.chopDoi = this.soMat(v) < 0.25; }
      }
      v.lacMat = 0; v.nayMat = 0;
      if (sk) {
        kieu = sk.kieu;
        var p = (now - sk.t0) / Math.max(1, sk.den - sk.t0);
        if (!giam && (kieu === 'dam' || kieu === 'xoay')) v.lacMat = Math.sin((now - sk.t0) / 26) * 0.75 * (1 - p);
        if (!giam && kieu === 'vui') v.nayMat = Math.abs(Math.sin((now - sk.t0) / 95)) * 1.4 * (1 - p);
      } else if (this.mung > now) kieu = 'vui';
      else if (v.dr && v.dr.roi) kieu = 'lim';
      else if (chop && !giam) kieu = chop;
      else if (now - v._tDi > 9000 && !this.camBienSang(now)) kieu = 'lim';
      if (kieu === 'thuong' || kieu === 'chop1' || kieu === 'ngac' || kieu === 'lim') {
        if (v.gocMem) liec = v.gocMem > 0 ? -1 : 1;                                       // đang quay phải (thuận kim) → liếc sang phải xe (phía x nhỏ của thân)
        else if (v.liecMat) liec = v.liecMat;
      }
      ttR.mat = kieu + (liec ? ':' + liec : '');
    },
    /** Số ngẫu nhiên 0..1 riêng của mắt xe v (LCG, không đụng Math.random: nhánh pixel giữ nguyên chuỗi số ngẫu nhiên). */
    soMat: function (v) { v.hatMat = (Math.imul(v.hatMat || 1, 1664525) + 1013904223) >>> 0; return v.hatMat / 4294967296; },
    /** Gầm thấp (ô n): nhện đang nằm trên ô gầm (hay sắp vào / vừa ra) thì vẽ lại MÁI ván đè lên nhện, độ đục 0,55, để thấy nhện chui DƯỚI mái. Vẽ theo pixel sân. */
    veMaiGam: function (g, v, c) {
      var TL = Ve.tiles(), x0 = Math.floor(v.x - 0.9), x1 = Math.ceil(v.x + 0.9), y0 = Math.floor(v.y - 0.9), y1 = Math.ceil(v.y + 0.9), x, y;
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        if (x < 0 || y < 0 || x >= c.w || y >= c.h || c.rows[y][x] !== 'n') continue;
        var ov = Math.max(0, 1 - Math.abs(v.x - x)) * Math.max(0, 1 - Math.abs(v.y - y)); if (ov <= 0.05) continue;       // phần nhện chồng lên ô gầm
        g.globalAlpha = 0.28 + 0.4 * ov;
        if (this.vec) g.drawImage(this.oV('gam', { mai: true }, g), x * T, y * T, T, T);       // vector: mái thép (nền trong suốt) đúng pixel thiết bị của lớp phủ
        else g.drawImage(TL.gamMai, x * T, y * T);
        g.globalAlpha = 1;
      }
    },
    /* ---- DRONE: độ cao, bóng đổ, ô sạc, thanh pin, vật treo dưới bụng, rơi khi hết pin */
    /** Độ cao hiển thị (pixel sân) của drone lúc này: bay thì ALT nhấp nhô nhẹ, đã rơi thì 0. */
    altDrone: function (now) {
      var d = this.vis.dr;
      return d.roi ? 0 : d.alt + (d.alt >= ALT ? Math.sin(now / 330) * 0.5 : 0);
    },
    /** Độ cao mặt sàn ở ô (x, y) so với sàn thường (pixel sân): băng chuyền 0,5; hàng rào và bậc thang 2; vật nằm đất 2,5; thùng nặng 4. Bóng drone rơi lên mặt đó. */
    matCao: function (x, y) {
      var c = this.cfg;
      if (x < 0 || y < 0 || x >= c.w || y >= c.h) return 0;
      if (this.thungTaiO(x, y)) return 4;
      if (this.vatTaiO(x, y)) return 2.5;
      var ch = c.rows[y][x];
      return ch === '=' || ch === 'S' ? 2 : BANG[ch] !== undefined ? 0.5 : 0;
    },
    /** Độ cao mặt sàn dưới drone, nội suy khi đang bay giữa hai ô (bóng trượt lên / xuống mượt). */
    caoDuoi: function () {
      var v = this.vis, x0 = Math.floor(v.x + 1e-6), y0 = Math.floor(v.y + 1e-6), fx = v.x - x0, fy = v.y - y0;
      if (fx > 0.01) return this.matCao(x0, Math.round(v.y)) * (1 - fx) + this.matCao(x0 + 1, Math.round(v.y)) * fx;
      if (fy > 0.01) return this.matCao(Math.round(v.x), y0) * (1 - fy) + this.matCao(Math.round(v.x), y0 + 1) * fy;
      return this.matCao(Math.round(v.x), Math.round(v.y));
    },
    /** Từ tâm ô tới đỉnh hình drone (pixel sân), cộng độ cao: chỗ đặt thanh pin và dấu nổi. */
    dinhDrone: function () { return this.vis.hop + (this.hh ? this.hh.dinh : 11) * this.p / (this.kk * this.u); },
    /** Phần drone vẽ DƯỚI thân (đơn vị pixel sân): ô sạc đang lóe, bóng đổ, từ trường nam châm, vật treo dưới bụng. (cx, cy) = tâm ô (kể cả lệch khi đâm tường). */
    veDuoiDrone: function (g, cx, cy, now) {
      var v = this.vis, d = v.dr, cao = this.caoDuoi(), alt = v.hop, i, o;
      if (this.sacO && d.sacLoe > now) {                                              // vừa sạc: đế sạc lóe xanh lơ
        var a = Math.min(1, (d.sacLoe - now) / 400) * (0.35 + 0.25 * Math.abs(Math.sin(now / 70)));
        if (this.vec) HU().sacLoe(g, this.sacO.x, this.sacO.y, a); else {
        g.fillStyle = 'rgba(' + BM.tiaNgocRgb + ',' + a.toFixed(3) + ')'; g.fillRect(this.sacO.x * T, this.sacO.y * T, T, T);
        g.strokeStyle = 'rgba(' + BM.tiaTrangRgb + ',' + (a * 1.4).toFixed(3) + ')'; g.lineWidth = 1; g.strokeRect(this.sacO.x * T + 0.5, this.sacO.y * T + 0.5, T - 1, T - 1); }
      }
      var w = Math.max(7, Math.round(13 - alt * 0.8 - cao * 0.4)), sy = Math.round(cy + 3 - cao), sx = Math.round(cx);          // bóng: hình bầu dục ba hàng, nằm ở mặt ô, lệch xuống dưới thân
      if (this.vec) HU().bongDrone(g, cx, cy + 3 - cao, Math.max(7, 13 - alt * 0.8 - cao * 0.4), Math.min(0.5, 0.24 + (4 - Math.min(4, alt)) * 0.04 + cao * 0.03));    // vector: bóng elip mềm, không làm tròn
      else {
      g.fillStyle = 'rgba(' + BM.tiaDenRgb + ',' + Math.min(0.5, 0.24 + (4 - Math.min(4, alt)) * 0.04 + cao * 0.03).toFixed(3) + ')';
      g.fillRect(sx - ((w - 4) >> 1), sy - 2, w - 4, 1); g.fillRect(sx - (w >> 1), sy - 1, w, 2); g.fillRect(sx - ((w - 4) >> 1), sy + 1, w - 4, 1); }
      if (v.nc) this.veTuTreo(g, cx, cy, now);
      for (i = 0; i < this.objs.length; i++) {                                         // vật treo dưới bụng: nằm giữa khung bốn cánh, ngay dưới nam châm (thân drone che phần giữa)
        o = this.objs[i];
        if (o.tt !== 'cam') continue;
        var rung = v.nc && v.nc.rung > now, lech = rung ? Math.sin(now / 22) * 1.3 : 0;
        this.veMotVat(g, o, 8, cx + lech, d.roi ? cy - 1 : cy - alt + HANG, 8, d.roi ? 2 : 3.2, rung ? 0.3 + 0.2 * Math.abs(Math.sin(now / 60)) : 0);     // treo ngay dưới thân: hai càng nam châm đè lên mép trên của vật
      }
    },
    /** Nam châm treo đang bật mà chưa dính gì: hai vòng sóng nhỏ nở ra rồi mờ dần ở mặt ô dưới bụng. */
    veTuTreo: function (g, cx, cy, now) {
      var nc = this.vis.nc; if (!nc || !nc.bat || this.vis.dr.roi) return;
      var co = this.vatDinh(), i, rgbT = nc.cuc === 'N' ? BM.tiaDoRgb : nc.cuc === 'S' ? BM.tiaLamRgb : BM.tiaXanhLoV1Rgb;           // sóng theo cực: N đỏ, S xanh dương
      for (i = 0; i < 2; i++) {
        var ph = ((now / 700) + i / 2) % 1, r = co ? 5.5 : 2.5 + ph * 4.5, al = co ? 0.25 : Math.pow(1 - ph, 0.9) * 0.85;
        g.strokeStyle = 'rgba(' + rgbT + ',' + al.toFixed(3) + ')'; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(cx, cy + 1, r, r * 0.72, 0, 0, 6.2832); g.stroke();
        if (co) break;
      }
    },
    /** Thanh pin nhỏ nổi trên đỉnh drone: ô viền tối, nền sẫm, phần đầy xanh lá → vàng → đỏ theo mức pin, vạch ngăn mỗi đơn vị, số pin bên phải. Nháy trắng khi đọc battery(), xanh lơ khi đang sạc, đỏ nháy khi gần hết. */
    veThanhPin: function (g, cx, cy, now) {
      var d = this.vis.dr; if (!d || d.pin === null || d.pin === undefined || !d.pinMax) return;
      var W = 10, so = String(Math.max(0, Math.round(d.pin)));
      g.save(); g.font = '8px VT323, monospace'; g.textBaseline = 'middle'; g.textAlign = 'left';
      var tw = Math.ceil(g.measureText(so).width), tong = W + 3 + tw + 2, x = Math.round(cx - tong / 2 + 1), y = Math.round(cy - this.dinhDrone() - 6);
      var tl = Math.max(0, Math.min(1, d.pin / d.pinMax)), fill = d.pin > 0 ? Math.max(1, Math.round(W * tl)) : 0;
      var sac = d.sacLoe > now, nay = d.nhay > now && ((now / 90 | 0) & 1) === 0, thap = d.pin <= Math.max(1.5, d.pinMax * 0.25), nguy = thap && !d.roi && ((now / 240 | 0) & 1) === 0;
      var mau = sac ? BM.sanNgoc : thap ? BM.sanDo : tl <= 0.6 ? BM.sanVang : BM.sanXanhLaToiV2;
      if (this.vec) {                                                           // vector (gói V4): viên pin bo tròn, ruột theo mức (không làm tròn: sạc chạy mượt)
        g.restore();
        HU().thanhPin(g, { x: cx - tong / 2 + 1, y: cy - this.dinhDrone() - 6, W: W, tong: tong, fill: d.pin > 0 ? Math.max(1, W * tl) : 0, mau: sac ? BM.vecDen : thap ? BM.vecDo : tl <= 0.6 ? BM.vecVang : BM.vecXanhLa,
          nen: nay ? BM.vecVo : nguy ? BM.vecDoSang : BM.vecDe, vach: d.pinMax <= 16 ? d.pinMax : 0, so: so, mauSo: sac ? BM.vecDenToi : thap ? BM.vecDo : BM.vecVien });
        return;
      }
      g.fillStyle = K_INK; g.fillRect(x - 1, y - 1, tong + 2, 5);
      g.fillStyle = nay ? BM.sanTrangV1 : nguy ? BM.sanDoV3 : BM.sanTim; g.fillRect(x, y, W, 3);
      if (fill) { g.fillStyle = mau; g.fillRect(x, y, fill, 3); g.fillStyle = BM.moSangV3; g.fillRect(x, y, fill, 1); }
      if (d.pinMax <= 16) { g.fillStyle = BM.moToiSangV9; for (var i = 1; i < d.pinMax; i++) g.fillRect(x + Math.round(W * i / d.pinMax), y, 1, 3); }
      g.fillStyle = sac ? BM.sanNgoc : thap ? BM.sanDoSangV1 : BM.sanTrang; g.fillText(so, x + W + 2, y + 1.7);
      g.restore();
    },
    /** Gió cánh quạt xả xuống vật bị bay qua ('bay-qua'): vài hạt bụi / mảnh gỗ / bọt xanh quanh ô. */
    giuQuat: function (s) {
      var cols = s.tren.indexOf('rao') >= 0 ? [BM.sanCam, BM.sanTrang, BM.sanCamToi] : s.tren.indexOf('bang') >= 0 ? [BM.sanLamV5, BM.sanTrangV2, BM.sanLamV2] : s.tren.indexOf('bac-thang') >= 0 ? [BM.sanCamV1, BM.sanTrang] : [BM.sanTrang, BM.sanXam, BM.sanXanhLa];
      this.burst(s.o.x * T + 7, s.o.y * T + 8, 7, cols, 0.55, 1, true);
    },
    /** Pin đầy lại ở ô sạc ('sac-pin'): thanh pin chạy từ mức sau khi trừ lên đầy, đế sạc lóe, tia lửa điện xanh lơ / vàng. */
    sacPin: async function (s, ms, my) {
      var d = this.vis.dr, self = this, t0 = performance.now();
      if (!d) { await ngu(ms); return; }
      this.sacO = { x: s.o.x, y: s.o.y }; d.sacLoe = t0 + ms + 450; d.pin = s.tu;
      var cx = s.o.x * T + 7, cy = s.o.y * T + 8;
      await this.tween(ms, my, function (k) {
        d.pin = s.tu + (s.den - s.tu) * k;
        if (Math.random() < 0.6) self.burst(cx + (Math.random() - 0.5) * 10, cy + 2, 1, [BM.sanXanhLo, BM.sanVangV5, BM.sanTrangV1], 0.5, 1, true);
      });
      if (my !== this.rid) return;
      d.pin = s.den;
    },
    /** Hết pin ('het-pin'): cánh quạt chập chờn, drone rơi xuống mặt ô (rung nhẹ, khói xám), nằm nghiêng với cánh quạt đứng, dấu '!'. */
    hetPin: async function (s, ms, my) {
      var d = this.vis.dr, v = this.vis, self = this;
      if (!d) { await ngu(ms); return; }
      d.pin = 0; d.nguy = true; this.baoHieu('!', 2400); v.choang = performance.now() + ms + 1300;
      var a0 = d.alt, cx = s.o.x * T + 7, cy = s.o.y * T + 8;
      await this.tween(ms * 0.8, my, function (k) {
        d.alt = a0 * (1 - k * k);
        v.dx = Math.sin(k * Math.PI * 9) * (1 - k) * 1.2;
        if (Math.random() < 0.55) { self.burst(cx + (Math.random() - 0.5) * 8, cy - d.alt, 1, [BM.sanXamToi, BM.sanXamToiV1, BM.sanLamV1], 0.3, 2, true); self.kieuHat(1, 'khoi'); }
      });
      if (my !== this.rid) return;
      d.alt = 0; v.dx = 0; d.roi = true; d.nguy = false;
      this.burst(cx, cy, 16, [BM.sanXamToi, BM.sanXamToiV1, BM.sanLamV1, BM.sanVangV6, BM.sanTrang], 0.95, 2, true); this.kieuHat(16, 'khoi');
      this.chopDo(220);
      await ngu(ms * 0.2);
    },
    /* ---- NAM CHÂM: sóng hút, vật dính, vật bay */
    /** Góc (rad, 0 = lên, quay thuận chiều kim đồng hồ) của hướng mũi xe: theo hướng xe, cộng góc xích quay dở; đang quay thì dùng góc đang nội suy. */
    gocMui: function () {
      var v = this.vis, q = v.nc || v.nem, base = q && q.ang !== null && q.ang !== undefined ? q.ang : (v.d || 0) * Math.PI / 2;
      return base + (v.goc || 0) + (q && q.ang !== null && q.ang !== undefined ? 0 : (v.gocMem || 0));     // gocMem: vector quay mượt (gói V4), pixel luôn 0
    },
    /** Chế độ vector và robot có hướng mặt (không phải drone / nhện không tay): quay thì xoay mượt cả hình (v.gocMem) thay vì đổi hướng ở nửa nhịp. */
    xoayMem: function () { var r = this.cfg.robot; return this.vec && r.than !== 'drone' && !(r.than === 'nhen' && !r.tay); },
    /** Nhìn từ ô xe (làm tròn) theo hướng mặt: vật đầu tiên trong 3 ô (tường, mép sân, thùng nặng chắn). { khoang, chan, vat } (khoang 4 = hết tầm trống). */
    nhinTruoc: function () {
      var v = this.vis, c = this.cfg, bx = Math.round(v.x), by = Math.round(v.y), h = v.d || 0, d, x, y, o;
      for (d = 1; d <= 3; d++) {
        x = bx + DX[h] * d; y = by + DY[h] * d;
        if (x < 0 || y < 0 || x >= c.w || y >= c.h || c.rows[y][x] === '#' || this.thungTaiO(x, y)) return { khoang: d, chan: 'tuong', vat: null };
        o = this.vatTaiO(x, y);
        if (o) return { khoang: d, chan: null, vat: o };
      }
      return { khoang: 4, chan: null, vat: null };
    },
    /** Có vật đang dính ở nam châm không. */
    vatDinh: function () {
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].tt === 'cam' || this.objs[i].tt === 'bay') return this.objs[i];
      return null;
    },
    /** Vòng sóng của nam châm có cực mà chưa dính vật: ba cung từ mũi xe tới hết 3 ô phía trước (dừng ở tường, dừng sát vật đầu tiên). MÀU theo CỰC: N đỏ, S xanh dương.
     *  Vật gỗ: sóng xám, chập chờn rồi tắt ngay trước vật (không tương tác). Vật sắt hay vật nam châm KHÁC cực: cung chạy VÀO về mũi xe (hút). Vật nam châm CÙNG cực: cung chạy RA, đẩy vật.
     *  (cx, cy) = tâm ô xe (pixel sân). */
    veSongTu: function (g, cx, cy, now) {
      var v = this.vis, nc = v.nc;
      if (!nc || !nc.bat || this.vatDinh()) return;
      var ang = this.gocMui(), dx = Math.sin(ang), dy = -Math.cos(ang), nt = this.nhinTruoc();
      var tamMax = (nt.chan || nt.vat) ? (nt.khoang - 1) * T + 1 : 3 * T + 2, go = !!(nt.vat && nt.vat.chat !== 'sat' && nt.vat.chat !== 'nam-cham');
      var cuc = nc.cuc, rgb = cuc === 'N' ? BM.tiaDoRgb : cuc === 'S' ? BM.tiaLamRgb : BM.tiaXanhLoV1Rgb, rgb2 = cuc === 'N' ? BM.tiaDoV7Rgb : cuc === 'S' ? BM.tiaTrangV2Rgb : BM.tiaTrangV3Rgb;
      var vao = !!(nt.vat && !go && (nt.vat.chat === 'sat' || nt.vat.cuc !== cuc));                         // hút: cung chạy vào mũi xe
      if (tamMax < 4) return;
      var nx = cx + dx * 8, ny = cy + dy * 8, a0 = Math.atan2(dy, dx), i;
      g.save(); g.lineCap = 'round';
      for (i = 0; i < 3; i++) {
        var ph = ((now / 900) + i / 3) % 1, pos = vao ? 1 - ph : ph, r = 2 + pos * (tamMax - 2), nua = Math.min(1.0, 8 / Math.max(r, 3)), al = Math.pow(1 - ph, 0.8) * (go ? 0.55 : 0.9);
        if (go && ph > 0.7) al *= 0.4 + 0.6 * Math.abs(Math.sin(now / 50));
        g.strokeStyle = (go ? 'rgba(' + BM.tiaCamV5Rgb + ',' : 'rgba(' + rgb + ',') + al.toFixed(3) + ')'; g.lineWidth = 1.4;
        g.beginPath(); g.arc(nx, ny, r, a0 - nua, a0 + nua); g.stroke();
        g.strokeStyle = (go ? 'rgba(' + BM.tiaKemV1Rgb + ',' : 'rgba(' + rgb2 + ',') + (al * 0.7).toFixed(3) + ')'; g.lineWidth = 0.6;
        g.beginPath(); g.arc(nx, ny, r, a0 - nua * 0.7, a0 + nua * 0.7); g.stroke();
      }
      g.restore();
    },
    /** Ô bị chặn khi thả (tha-bi-chan): ô đỏ nhấp nháy một lúc. */
    veOCanhBao: function (g, now) {
      var b = this.canhBao; if (!b) return;
      if (now > b.den) { this.canhBao = null; return; }
      var al = 0.18 + 0.2 * Math.abs(Math.sin(now / 90));
      if (this.vec) { HU().oDo(g, b.x, b.y, al); return; }                         // vector: tấm đỏ bo góc (gói V4)
      g.fillStyle = 'rgba(' + BM.tiaDoV1Rgb + ',' + al.toFixed(3) + ')'; g.fillRect(b.x * T, b.y * T, T, T);
      g.strokeStyle = BM.moDo; g.lineWidth = 1; g.strokeRect(b.x * T + 0.5, b.y * T + 0.5, T - 1, T - 1);
    },
    /** Vật dính ở mũi xe (vẽ sát mũi, đi theo xe, quay theo xe) và vật đang bị hút bay: vẽ trên thân xe. */
    veVatTu: function (g, cx, cy, now) {
      var v = this.vis, i, o, px, py;
      var ang = this.gocMui(), dx = Math.sin(ang), dy = -Math.cos(ang);
      for (i = 0; i < this.objs.length; i++) {
        o = this.objs[i];
        if (o.tt === 'cam') {
          if (v.dr) continue;                                                       // drone: vật treo dưới bụng vẽ ở veDuoiDrone
          var rung = v.nc.rung > now, lech = rung ? Math.sin(now / 22) * 1.3 : 0;
          px = cx + dx * T + (rung ? -dy : 0) * lech; py = cy + dy * T + (rung ? dx : 0) * lech;
          this.veMotVat(g, o, 8, px, py - 1, 8, 2, rung ? 0.3 : 0);
        } else if (o.tt === 'bay' && o.bay) {
          var b = o.bay;
          px = b.x * T + 7; py = b.y * T + 7 - b.cao;
          if (this.vec) {                                                       // vector (gói V4): bóng elip mềm, thân vật 8 pixel sân như hình pixel, vòng hút bo góc
            HU().bongElip(g, b.x * T + 7, b.y * T + 11, 3.6, 1.3, 0.24);
            this.veVatVec(g, o, px + (b.rx || 0), py - 1 + (b.ry || 0), 8);
            if (b.vong) HU().vongHut(g, px, py, 0.35 + 0.35 * Math.abs(Math.sin(now / 60)));
            continue;
          }
          g.fillStyle = BM.moToiV23; g.fillRect(Math.round(b.x * T + 4), Math.round(b.y * T + 10), 6, 2);
          if (this.vec) this.veVatVec(g, o, px + (b.rx || 0), py - 1 + (b.ry || 0), 8);         // vector: thân vật 8 pixel sân như hình pixel
          else g.drawImage(this.hinhVat(o, 8), Math.round(px - 4 + (b.rx || 0)), Math.round(py - 5 + (b.ry || 0)));
          if (b.vong) {
            g.strokeStyle = 'rgba(' + BM.tiaXanhLoV3Rgb + ',' + (0.35 + 0.35 * Math.abs(Math.sin(now / 60))).toFixed(3) + ')'; g.lineWidth = 1;
            g.strokeRect(Math.round(px - 6) + 0.5, Math.round(py - 7) + 0.5, 11, 11);
          }
        }
      }
    },
    /** Vật bị hút (hut-vat): rung tại chỗ, rồi bay về ô sát mũi xe (cung nhẹ, bụi sáng phía sau), rồi dính. ms = thời gian dành cho cả sự kiện. */
    hutVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id), v = this.vis, self = this;
      if (!o) { await ngu(ms); return; }
      var x0 = s.tu.x, y0 = s.tu.y, x1 = s.den.x, y1 = s.den.y;
      o.tt = 'bay'; o.bay = { x: x0, y: y0, cao: 0, vong: true, rx: 0, ry: 0 };
      await this.tween(ms * 0.28, my, function (k) { o.bay.rx = Math.sin(k * Math.PI * 7) * (0.4 + k) * 0.8; o.bay.ry = Math.cos(k * Math.PI * 5) * 0.4; o.bay.cao = k * 1.5; });
      if (my !== this.rid) return;
      o.bay.rx = 0; o.bay.ry = 0;
      await this.tween(ms * 0.72, my, function (k) {
        var k2 = k * k * (3 - 2 * k);
        o.bay.x = x0 + (x1 - x0) * k2; o.bay.y = y0 + (y1 - y0) * k2;
        o.bay.cao = v.dr ? -(HANG - ALT) * k2 + Math.sin(k * Math.PI) * 2.5 : 1.5 + Math.sin(k * Math.PI) * 2.5;       // drone: vật nhấc nhẹ rồi trôi vào chỗ treo ngay dưới nam châm
        if (Math.random() < 0.7) self.burst(o.bay.x * T + 7 - (x1 - x0) * 3 * (1 - k), o.bay.y * T + 7 - (y1 - y0) * 3 * (1 - k), 1, [BM.sanTrangV3, BM.sanXanhLoV2, BM.sanTrangV1], 0.3);
      });
      if (my !== this.rid) return;
      o.bay = null; o.tt = 'cam'; o.x = Math.round(v.x); o.y = Math.round(v.y);
      this.burst(x1 * T + 7, y1 * T + 7, 8, [BM.sanTrangV3, BM.sanXanhLoV2, BM.sanTrangV1], 0.8, 1, true);
      v.nc.rung = 0;
    },
    /** Đẩy vật nam châm (day-vat): vật trượt thẳng ra xa xe từ ô `tu` tới ô `den` (nhanh dần rồi chậm, bụi và tia màu cực phía sau).
     *  tuMui = vật đang dính ở mũi xe bị BẮN ra: nó rời mũi xe, hạ xuống ô sát mũi `tu` rồi trượt tiếp. */
    dayVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id);
      if (!o) { await ngu(ms); return; }
      var self = this, x0 = s.tu.x, y0 = s.tu.y, x1 = s.den.x, y1 = s.den.y, ux = Math.sign(x1 - x0), uy = Math.sign(y1 - y0);
      var mau = s.cuc === 'N' ? [BM.sanDoSangV3, BM.sanDoSangV4, BM.sanTrangV1] : [BM.sanLamV12, BM.sanLamV13, BM.sanTrangV1];
      if (s.tuMui) { o.tt = 'dat'; o.x = x0; o.y = y0; o.nang = 3; }
      await this.tween(ms, my, function (k) {
        var k2 = 1 - Math.pow(1 - k, 2.2);
        o.x = x0 + (x1 - x0) * k2; o.y = y0 + (y1 - y0) * k2;
        if (s.tuMui) o.nang = 3 * (1 - Math.min(1, k * 3));
        if ((x1 !== x0 || y1 !== y0) && Math.random() < 0.8) self.burst(o.x * T + 7 - ux * 6, o.y * T + 9 - uy * 6, 1, mau, 0.5);
      });
      if (my !== this.rid) return;
      o.x = x1; o.y = y1; o.nang = 0;
      if (s.chan) this.burst(x1 * T + 7 + ux * 5, y1 * T + 7 + uy * 5, 4, [BM.sanTrang, BM.sanXam], 0.5);
    },
    /** Thả vật (tha-vat): vật dính rời mũi xe, rơi xuống ô sát mũi xe (nảy nhẹ, bụi). */
    thaVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id);
      if (!o) { await ngu(ms); return; }
      var self = this, bui = false;
      var n0 = this.vis.dr ? -(HANG - ALT) : 5;                          // drone: vật nhả từ chỗ treo (thấp hơn tâm ô một chút) rơi nhẹ xuống mặt ô
      o.tt = 'dat'; o.x = s.den.x; o.y = s.den.y; o.nang = n0;
      this.vis.nc.rung = 0;
      await this.tween(ms * 0.8, my, function (k) {
        o.nang = k < 0.7 ? n0 * (1 - Math.pow(k / 0.7, 2)) : Math.abs(Math.sin((k - 0.7) / 0.3 * Math.PI)) * 1.2 * (1 - k);
        if (k >= 0.7 && !bui) { bui = true; self.burst(o.x * T + 7, o.y * T + 11, 4, [BM.sanTrang, BM.sanXanhLa], 0.5); }
      });
      o.nang = 0;
    },
    objTheoId: function (id) {
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].id === id) return this.objs[i];
      return null;
    },

    /* ---- MÁY NÉM: rổ, vạch ngắm, vật bay */
    /** Vật đang nằm trong rổ (trangThai 'ro'), hoặc null. */
    vatRo: function () {
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].tt === 'ro') return this.objs[i];
      return null;
    },
    /** Vị trí rổ (pixel sân) ở đầu cần ném, theo hướng mũi xe (theo xe, quay theo xe); dang = đang vung cần thì rổ ra xa thêm 4 pixel part. */
    viTriRo: function (dang, vung) {
      var v = this.vis, a = this.gocMui(), bk = (this.bk || 15) * (typeof vung === 'number' ? 1 + (27.5 / 23.5 - 1) * vung : dang ? 27.5 / 23.5 : 1);      // vung (vector, gói V4): gáo vung dần 0..1
      return { x: v.x * T + 7 + v.dx + Math.sin(a) * bk, y: v.y * T + 7 + v.dy - Math.cos(a) * bk - v.hop };
    },
    /** Đổi tầm (aim(n) vừa chạy): số ngắm của cần đổi ngay, vòng ở ô rơi nháy to một lúc. */
    datTam: function (n) {
      var q = this.vis && this.vis.nem; if (!q || !(n >= 1 && n <= 3) || q.tam === n) return;
      q.tam = n; q.doi = performance.now();
    },
    /** Vạch ngắm mờ từ xe tới ô rơi (tầm n ô trước mặt): chấm ở từng ô đi qua, vòng + số n ở ô rơi (vẽ dưới thân xe; ô rơi có thể ở ngoài sân). */
    veNgam: function (g, cx, cy, now) {
      var q = this.vis.nem; if (!q) return;
      var a = this.gocMui(), dx = Math.sin(a), dy = -Math.cos(a), n = q.tam, i, nho = now - q.doi < 420 ? (1 - (now - q.doi) / 420) : 0;
      if (this.vec) { HU().ngam(g, cx, cy, dx, dy, n, now, nho, !!this.vatRo()); return; }      // vector (gói V4): chấm tròn, góc bo, thẻ số bo góc
      var tx = cx + dx * n * T, ty = cy + dy * n * T, al = 0.5 + 0.12 * Math.sin(now / 260);
      g.save();
      g.strokeStyle = 'rgba(' + BM.tiaXanhLoRgb + ',' + (al * 0.8).toFixed(3) + ')'; g.lineWidth = 1; g.setLineDash([2, 2]); g.lineDashOffset = -((now / 120) % 4);
      g.beginPath(); g.moveTo(cx + dx * 9, cy + dy * 9); g.lineTo(tx - dx * 5, ty - dy * 5); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(' + BM.tiaXanhLoRgb + ',' + (al * 0.9).toFixed(3) + ')';
      for (i = 1; i < n; i++) g.fillRect(Math.round(cx + dx * i * T) - 1, Math.round(cy + dy * i * T) - 1, 2, 2);
      var col = nho ? BM.tiaKemRgb : BM.tiaXanhLoRgb, a2 = Math.min(1, al + nho) * (this.vatRo() ? 1 : 0.6), x0 = Math.round(tx) - 7, y0 = Math.round(ty) - 7, k = 4 + (nho ? 1 : 0);
      g.strokeStyle = 'rgba(' + col + ',' + a2.toFixed(3) + ')'; g.lineWidth = 1.5;                  // bốn góc khung ô rơi (không che vật nằm trong ô)
      g.beginPath();
      g.moveTo(x0, y0 + k); g.lineTo(x0, y0); g.lineTo(x0 + k, y0);
      g.moveTo(x0 + 14 - k, y0); g.lineTo(x0 + 14, y0); g.lineTo(x0 + 14, y0 + k);
      g.moveTo(x0 + 14, y0 + 14 - k); g.lineTo(x0 + 14, y0 + 14); g.lineTo(x0 + 14 - k, y0 + 14);
      g.moveTo(x0 + k, y0 + 14); g.lineTo(x0, y0 + 14); g.lineTo(x0, y0 + 14 - k);
      g.stroke();
      g.fillStyle = 'rgba(' + BM.tiaXanhLoV4Rgb + ',' + (0.85 * Math.min(1, a2 + 0.2)).toFixed(3) + ')'; g.fillRect(x0 + 1, y0 + 1, 6, 8);               // thẻ số tầm ở góc trên trái ô rơi
      g.font = '8px VT323, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(' + (nho ? BM.tiaKemRgb : BM.tiaXanhLoV5Rgb) + ',' + Math.min(1, a2 + 0.3).toFixed(3) + ')';
      g.fillText(String(n), x0 + 4, y0 + 5.5);
      g.restore();
    },
    /** Ô rơi vỡ (nem-vo): ô tô đỏ nhấp nháy + khung đỏ, giữ tới khi chạy lại. Ô ngoài sân thì vạch đỏ + mũi nhọn ở mép sân. */
    veOVo: function (g, now) {
      var ds = this.oVo || [], c = this.cfg, i, o, al = 0.2 + 0.14 * Math.abs(Math.sin(now / 200));
      for (i = 0; i < ds.length; i++) {
        o = ds[i];
        if (this.vec) {                                                           // vector: tấm đỏ bo góc + vết nứt; ngoài sân: vạch đỏ bo tròn ở mép (gói V4)
          if (!this.ngoaiKhung(o.x, o.y)) { HU().oDo(g, o.x, o.y, al, true); continue; }
          var vx0 = c.ox * T, vy0 = c.oy * T, vx1 = (c.ox + c.vw) * T, vy1 = (c.oy + c.vh) * T, vng = o.x < c.ox || o.x >= c.ox + c.vw;
          HU().vachMep(g, vng ? (o.x < c.ox ? vx0 : vx1 - 2) : Math.max(vx0, Math.min(vx1, o.px)), vng ? Math.max(vy0, Math.min(vy1, o.py)) : (o.y < c.oy ? vy0 : vy1 - 2), vng, al + 0.25);
          continue;
        }
        if (!this.ngoaiKhung(o.x, o.y)) {
          g.fillStyle = 'rgba(' + BM.tiaDoV1Rgb + ',' + al.toFixed(3) + ')'; g.fillRect(o.x * T, o.y * T, T, T);
          g.strokeStyle = BM.moDo; g.lineWidth = 1; g.strokeRect(o.x * T + 0.5, o.y * T + 0.5, T - 1, T - 1);
        } else {
          var gx0 = c.ox * T, gy0 = c.oy * T, gx1 = (c.ox + c.vw) * T, gy1 = (c.oy + c.vh) * T;       // mép cửa sổ vẽ (tường mép đã cắt thì vạch đỏ nằm ở mép sân)
          var px = Math.max(gx0, Math.min(gx1, o.px)), py = Math.max(gy0, Math.min(gy1, o.py)), ngang = o.x < c.ox || o.x >= c.ox + c.vw;
          g.fillStyle = 'rgba(' + BM.tiaDoV1Rgb + ',' + (al + 0.25).toFixed(3) + ')';
          if (ngang) g.fillRect(o.x < c.ox ? gx0 : gx1 - 2, Math.round(py) - 6, 2, 12); else g.fillRect(Math.round(px) - 6, o.y < c.oy ? gy0 : gy1 - 2, 12, 2);
        }
      }
    },
    /** Vật trong rổ (nhỏ, ở đầu cần, đi theo xe, quay theo xe, rung khi rổ đầy) và vật đang bay (nb: bóng đổ dưới đất + vật to dần ở đỉnh cung rồi nhỏ lại). */
    veVatNem: function (g, cx, cy, now) {
      var v = this.vis, i, o, q = v.nem;
      g.imageSmoothingEnabled = false;
      for (i = 0; i < this.objs.length; i++) {
        o = this.objs[i];
        if (o.tt === 'ro') {
          var a = this.viTriRo(q.dang > now, this.vec && typeof q.vungK === 'number' ? q.vungK : undefined), sz = Math.max(4, Math.round((this.bk || 15) * 0.34)), rg = q.rung > now ? Math.sin(now / 20) * 1.2 : 0;
          if (this.vec) { this.veVatVec(g, o, a.x + rg, a.y, sz); if (q.loi > now) HU().vienLoi(g, a.x - sz / 2 + rg, a.y - sz / 2, sz); continue; }      // vector: thân vật cạnh sz như hình pixel, viền lỗi bo góc
          else g.drawImage(this.hinhVat(o, 8), Math.round(a.x - sz / 2 + rg), Math.round(a.y - sz / 2), sz, sz);
          if (q.loi > now) { g.strokeStyle = BM.moDo; g.lineWidth = 1; g.strokeRect(Math.round(a.x - sz / 2 + rg) - 0.5, Math.round(a.y - sz / 2) - 0.5, sz + 1, sz + 1); }
        } else if (o.tt === 'bay' && o.nb) {
          var b = o.nb, d = Math.max(3, Math.round(8 * b.esc));
          if (this.vec) {                                                       // vector (gói V4): cỡ không làm tròn, bóng elip mềm co theo độ cao, vệt vòng cung chấm mờ phía sau
            var dv = Math.max(3, 8 * b.esc), yv = Math.max(-1, b.py - dv / 2 - b.cao) + dv / 2, vt = b.vet || (b.vet = []);
            if (!vt.length || Math.abs(vt[vt.length - 1].x - b.px) + Math.abs(vt[vt.length - 1].y - yv) > 1.2) { vt.push({ x: b.px, y: yv }); if (vt.length > 7) vt.shift(); }
            HU().bongElip(g, b.px, b.py + 6, Math.max(1.6, dv * 0.36 * (1 - Math.min(0.5, b.cao * 0.03))), 0.9, Math.max(0.1, 0.3 - b.cao * 0.012));
            if (b.cao > 0.5) HU().vetCung(g, vt.slice(0, -1));
            this.veVatVec(g, o, b.px, yv, dv);
            continue;
          }
          g.fillStyle = 'rgba(' + BM.tiaDenRgb + ',' + Math.max(0.12, 0.34 - b.cao * 0.012).toFixed(3) + ')';
          var sw = Math.max(3, Math.round(d * 0.7 * (1 - Math.min(0.5, b.cao * 0.03))));
          g.fillRect(Math.round(b.px - sw / 2), Math.round(b.py + 5), sw, 2);
          if (this.vec) this.veVatVec(g, o, b.px, Math.max(-1, b.py - d / 2 - b.cao) + d / 2, d);
          else g.drawImage(this.hinhVat(o, 8), Math.round(b.px - d / 2), Math.max(-1, Math.round(b.py - d / 2 - b.cao)), d, d);          // vật bay cao không vượt khỏi mép trên của lớp phủ
        }
      }
    },
    /** load(): vật ở ô TRƯỚC MẶT nhảy lên rổ ở đầu cần (cung nhẹ, nhỏ dần). */
    napVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id), v = this.vis, self = this;
      if (!o) { await ngu(ms); return; }
      var x0 = o.x * T + 7, y0 = o.y * T + 6, a = this.viTriRo(false), sz = Math.max(4, (this.bk || 15) * 0.34) / 8;
      o.tt = 'bay'; o.nb = { px: x0, py: y0, cao: 0, esc: 1 };
      await this.tween(ms * 0.9, my, function (k) {
        var k2 = k * k * (3 - 2 * k);
        o.nb.px = x0 + (a.x - x0) * k2; o.nb.py = y0 + (a.y - y0) * k2;
        o.nb.cao = Math.sin(k * Math.PI) * 6; o.nb.esc = 1 + (sz - 1) * k2;
        if (Math.random() < 0.5) self.burst(o.nb.px, o.nb.py - o.nb.cao, 1, [BM.sanTrang, BM.sanCam], 0.3);
      });
      if (my !== this.rid) return;
      o.nb = null; o.tt = 'ro';
      v.nem.rung = performance.now() + 140;
      this.burst(a.x, a.y, 5, [BM.sanTrang, BM.sanXanhLa], 0.5);
    },
    /** throw(): cần vung lên, xe giật lùi nhẹ, vật bay vòng cung từ rổ tới ô rơi (to dần rồi nhỏ lại, bóng đổ dưới đất), bay qua mọi thứ ở giữa. */
    nemVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id), v = this.vis, self = this, c = this.cfg;
      if (!o) { await ngu(ms); return; }
      var hx = DX[Math.round(((v.d || 0) % 4 + 4) % 4)], hy = DY[Math.round(((v.d || 0) % 4 + 4) % 4)];
      var tx = s.den.x * T + 7, ty = s.den.y * T + 7;
      if (this.ngoaiKhung(s.den.x, s.den.y)) { tx = Math.max(c.ox * T + 3, Math.min((c.ox + c.vw) * T - 3, tx)); ty = Math.max(c.oy * T + 3, Math.min((c.oy + c.vh) * T - 3, ty)); }   // ngoài sân (hoặc tường mép đã cắt): bay tới mép
      v.nem.dang = performance.now() + ms + 260;
      var a = this.viTriRo(true), t1 = ms * 0.2, esc0 = Math.max(4, (this.bk || 15) * 0.34) / 8, hcao = 5 + 3 * (s.tam || 1);
      o.tt = 'bay'; o.nb = { px: a.x, py: a.y, cao: 0, esc: esc0 };
      await this.tween(t1, my, function (k) { v.dx = -hx * Math.sin(k * Math.PI) * 1.4; v.dy = -hy * Math.sin(k * Math.PI) * 1.4; });        // vung cần: giật lùi nhẹ
      if (my !== this.rid) return;
      v.dx = 0; v.dy = 0;
      await this.tween(ms - t1, my, function (k) {
        o.nb.px = a.x + (tx - a.x) * k; o.nb.py = a.y + (ty - a.y) * k;
        o.nb.cao = Math.sin(k * Math.PI) * hcao;
        o.nb.esc = esc0 + (1 - esc0) * k + 0.4 * Math.sin(k * Math.PI);
        if (Math.random() < 0.55) self.burst(o.nb.px, o.nb.py - o.nb.cao, 1, [BM.sanTrang, BM.sanLamV14], 0.25);
      });
      if (my !== this.rid) return;
      o.nb = { px: tx, py: ty, cao: 0, esc: 1 }; o.x = s.den.x; o.y = s.den.y;
    },
    /** Vật chạm đất ở ô rơi: nảy nhẹ một lần, bụi. */
    nemRoi: async function (s, ms, my) {
      var o = this.objTheoId(s.id);
      if (!o) { await ngu(ms); return; }
      var self = this;
      o.nb = null; o.tt = 'dat'; o.x = s.o.x; o.y = s.o.y; o.nang = 0;
      this.burst(o.x * T + 7, o.y * T + 11, 5, [BM.sanTrang, BM.sanXanhLa], 0.5);
      await this.tween(ms, my, function (k) { o.nang = Math.sin(k * Math.PI) * 3 * (1 - k); });
      o.nang = 0;
    },
    /** Vật rơi vào ô không nhận: vỡ thành mảnh ngay chỗ rơi (ngoài sân thì ở mép), ô rơi tô đỏ giữ tới khi chạy lại. */
    nemVo: async function (s, ms, my) {
      var o = this.objTheoId(s.id), c = this.cfg, ngoai = this.ngoaiKhung(s.o.x, s.o.y);
      var px = Math.max(c.ox * T + 3, Math.min((c.ox + c.vw) * T - 3, s.o.x * T + 7)), py = Math.max(c.oy * T + 3, Math.min((c.oy + c.vh) * T - 3, s.o.y * T + 7));
      var cols = o && o.chat === 'sat' ? [BM.sanLamV15, BM.sanLamV6, BM.sanLamToiV6, BM.sanLamV7] : [BM.sanCamToi, BM.sanNauSang, BM.sanCam, BM.sanNauV1];
      if (o) { o.nb = null; o.tt = 'vo'; o.x = s.o.x; o.y = s.o.y; o.voLuc = performance.now(); }
      this.burst(px, py, 22, cols, 1.9, 2, true); this.kieuHat(22, 'manh');
      this.burst(px, py, 8, [BM.sanTrang, BM.sanVang], 1.1, 1, true);
      this.oVo.push({ x: s.o.x, y: s.o.y, px: s.o.x * T + 7, py: s.o.y * T + 7, ngoai: ngoai });
      this.chopDo(180);
      await ngu(ms);
    },
    /* ---- SÚNG HƠI: bóng bay thẳng từ hai nòng, xe giật, thùng trượt, nút, cửa */
    /** Quả bóng (vẽ trên lớp phủ, tâm (x, y) pixel sân; 7×7 pixel: viền tối, lõi vàng, đốm sáng trái trên, bóng tối phải dưới). b.a = độ đậm; b.bay = đang bay thẳng theo (b.dx, b.dy): có vệt ngắn mờ dần phía sau. */
    veBong: function (g, now) {
      var b = this.bong; if (!b) return;
      var x = Math.round(b.x), y = Math.round(b.y), sq = b.sq || 0, i;
      g.save(); g.globalAlpha = Math.max(0, Math.min(1, b.a === undefined ? 1 : b.a));
      if (this.vec) {                                                                                      // vector: vệt tròn mờ dần, bóng đổ elip, quả bóng 'bong' (bẹp khi đập vào vật) cỡ 7 pixel sân
        x = b.x; y = b.y;
        if (b.bay && (b.dx || b.dy)) for (i = 1; i <= 3; i++) {
          g.fillStyle = 'rgba(' + BM.tiaVangV2Rgb + ',' + (0.5 - i * 0.12).toFixed(2) + ')'; g.beginPath(); g.arc(x - b.dx * (3 + i * 3), y - b.dy * (3 + i * 3), (5 - i) / 2, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = BM.moToiV24; g.beginPath(); g.ellipse(x + 0.5, y + 4.5, 2.6, 0.8, 0, 0, Math.PI * 2); g.fill();
        g.drawImage(VeVector.vat('bong', Math.max(1, Math.round(7 * this.tiLeCua(g))), sq ? { bep: true } : undefined), x - 3.5, y - 3.5, 7, 7);
        g.restore(); return;
      }
      if (b.bay && (b.dx || b.dy)) {                                                                       // vệt: ba vệt vàng nhạt nhỏ dần phía sau, cùng đường bay
        for (i = 1; i <= 3; i++) {
          var sz = 5 - i, tx = x - b.dx * (3 + i * 3), ty = y - b.dy * (3 + i * 3);
          g.fillStyle = 'rgba(' + BM.tiaVangV2Rgb + ',' + (0.5 - i * 0.12).toFixed(2) + ')'; g.fillRect(Math.round(tx - sz / 2), Math.round(ty - sz / 2), sz, sz);
        }
      }
      g.fillStyle = BM.moToiV24; g.fillRect(x - 2, y + 4, 5, 1);                                    // bóng đổ nhỏ dưới đất
      var M = ['..XXX..', '.XwyyX.', 'XwyyyyX', 'XyyyyyX', 'XyyyydX', '.XdddX.', '..XXX..'], C = { X: K_INK, w: BM.sanKemV1, y: BM.sanVangV1, d: BM.sanNauSangV3 }, r, c;
      if (sq) { g.fillStyle = K_INK; g.fillRect(x - 4, y - 2, 9, 5); g.fillStyle = BM.sanVangV1; g.fillRect(x - 3, y - 1, 7, 3); g.fillStyle = BM.sanKemV1; g.fillRect(x - 3, y - 1, 2, 1); }           // lúc đập vào vật: bẹp ra một chút
      else for (r = 0; r < 7; r++) for (c = 0; c < 7; c++) { var ch = M[r].charAt(c); if (ch !== '.') { g.fillStyle = C[ch]; g.fillRect(x - 3 + c, y - 3 + r, 1, 1); } }
      g.restore();
    },
    /** Số đạn còn (màn có danToiDa): thẻ nhỏ ở góc trên trái của sân, quả bóng + "x n"; hết đạn thì đỏ và nháy. */
    veDan: function (g, now) {
      var sg = this.vis.sung; if (!sg || sg.dan === null || sg.dan === undefined) return;
      var txt = '×' + sg.dan, het = sg.dan <= 0, nhay = sg.het > now && ((now / 110 | 0) & 1) === 0;
      g.save();
      g.font = '8px VT323, monospace'; g.textBaseline = 'middle'; g.textAlign = 'left';
      var w = Math.ceil(g.measureText(txt).width) + 10, hh = 9, x = 1, y = 1;
      if (this.vec) { g.restore(); HU().theDan(g, this.cfg.ox * T + x + 0.5, this.cfg.oy * T + y + 0.5, w, hh, txt, het, nhay); return; }     // vector (gói V4): thẻ viên thuốc ở góc cửa sổ vẽ
      g.fillStyle = K_INK; g.fillRect(x - 1, y - 1, w + 2, hh + 2);
      g.fillStyle = het || nhay ? BM.sanDoV3 : BM.sanTim; g.fillRect(x, y, w, hh);
      g.fillStyle = het ? BM.sanXamToiV3 : BM.sanVangV1; g.fillRect(x + 2, y + 3, 3, 3);
      g.fillStyle = K_INK; g.fillRect(x + 2, y + 3, 1, 1);
      g.fillStyle = het ? BM.sanDoSangV1 : BM.sanTrang; g.fillText(txt, x + 7, y + hh / 2 + 0.5);
      g.restore();
    },
    nutO: function (x, y) { var k = x + ',' + y; return this.nutT[k] || (this.nutT[k] = { bat: false, loe: 0 }); },
    /** Chỗ bóng dừng (pixel sân) khi trúng ô den, đi theo hướng bay (dx, dy): cách tâm ô một đoạn bằng nửa bề rộng vật cản cộng bán kính bóng. */
    banDung: function (s, dx, dy) {
      var nua = s.trung === 'vat' ? 4 : s.trung === 'thung' ? 6 : 7;
      return { x: s.den.x * T + 7 - dx * (nua + 4), y: s.den.y * T + 7 - dy * (nua + 4) };
    },
    /** Làn hơi phun ra ở miệng nòng (x, y pixel sân) theo hướng bay (dx, dy): hạt trắng / xanh nhạt tỏa theo hình quạt, mờ dần. */
    phunHoi: function (x, y, dx, dy, n, sp) {
      for (var i = 0; i < n; i++) {
        var v = (sp || 0.9) * (0.45 + Math.random() * 0.9), ng = (Math.random() - 0.5) * 1.1;
        this.parts.push({ x: x, y: y, vx: dx * v - dy * ng, vy: dy * v + dx * ng - 0.12, life: 14 + Math.random() * 16, c: [BM.sanTrangV1, BM.sanXanhLoV3, BM.sanXanhLo, BM.sanTrangV5][i % 4], s: i % 3 === 0 ? 2 : 1, mo: true });
      }
    },
    /** shoot() / shoot_back(): quả bóng bay thẳng từ miệng nòng (nòng trước ở mũi xe, nòng sau ở đuôi xe; nòng sau là s.sau) tới ô `den`, kèm làn hơi ở miệng nòng và nòng lóe;
     *  chạm vật cản thì nảy ra / lóe; trúng nút thì nút lóe rồi đổi (băng chuyền đổi ngay); hụt (ra khỏi sân) thì bay mờ dần ở mép. Cú GIẬT của xe do giatXe() làm CÙNG LÚC (xem phatNhip).
     *  evs = các sự kiện của nhịp (nut-doi, bang-doi, ban-hut, ban-bi-chan). */
    banBong: async function (s, evs, ms, my) {
      var v = this.vis, c = this.cfg, self = this, dx = DX[s.huong], dy = DY[s.huong], sg = v.sung, sau = !!s.sau;
      var kc = sau ? (this.mzs || 4) : (this.mz || 8);
      var x0 = s.tu.x * T + 7 + dx * kc, y0 = s.tu.y * T + 7 + dy * kc;
      var tx, ty, roi = !!s.hetTam, hut = !s.trung && !roi, nhanh = s.luc === 'fast';             // roi: bắn nhanh hết tầm, bóng rơi ở ô cuối (s.cuoi)
      if (roi) { tx = s.cuoi.x * T + 7; ty = s.cuoi.y * T + 7; }
      else if (hut) { tx = dx ? (dx > 0 ? (c.ox + c.vw) * T + 5 : c.ox * T - 5) : x0; ty = dy ? (dy > 0 ? (c.oy + c.vh) * T + 5 : c.oy * T - 5) : y0; }
      else { var st = this.banDung(s, dx, dy); tx = st.x; ty = st.y; }
      if ((tx - x0) * dx + (ty - y0) * dy < 0) { tx = x0; ty = y0; }                                    // vật cản dính sát miệng nòng: bóng không bay được đoạn nào
      if (sg) { var den = performance.now() + ms * 0.3; if (sau) sg.sau = den; else sg.truoc = den; }
      this.phunHoi(x0, y0, dx, dy, nhanh ? 4 : 9, nhanh ? 0.6 : 1.0);                                   // bắn nhanh: làn hơi nhỏ (không giật)
      this.burst(x0, y0, 3, [BM.sanKem, BM.sanVangV1], 0.4, 1, true);
      this.bong = { x: x0, y: y0, a: 1, dx: dx, dy: dy, bay: true };
      var dai = Math.abs(tx - x0) + Math.abs(ty - y0), tBay = Math.max(90, dai * 8.5 * (ms / 483));          // chậm hơn cho nhìn kịp: ~0,4 giây cho 4 ô ở ×1 (ms = 2,1 nhịp = 483), ×2 nhanh gấp đôi
      await this.tween(tBay, my, function (k) {
        if (!self.bong) return;
        self.bong.x = x0 + (tx - x0) * k; self.bong.y = y0 + (ty - y0) * k;
        if (hut && k > 0.7) self.bong.a = 1 - (k - 0.7) / 0.3;
        if (Math.random() < 0.8) self.burst(self.bong.x - dx * 2, self.bong.y - dy * 2, 1, [BM.sanKem, BM.sanVangV1, BM.sanXanhLoV3], 0.12, 1, true);
      });
      if (my !== this.rid || !this.bong) return;
      this.bong.bay = false;
      if (hut) { this.bong = null; this.baoHieu('?', 1400); return; }
      if (roi) {                                                                                       // bắn nhanh hết tầm: bóng rơi xuống sàn, bụi nhỏ, mờ đi
        this.burst(tx, ty + 2, 5, [BM.sanLam, BM.sanTrangV1, BM.sanXamV1], 0.35);
        await this.tween(ms * 0.3, my, function (k) { if (!self.bong) return; self.bong.y = ty + k * 2; self.bong.a = 1 - k; });
        this.bong = null;
        if (my === this.rid) this.baoHieu('?', 1200);
        return;
      }
      // chạm vật cản
      var kind = s.trung, tNay = performance.now(), og = null;
      var nutEv = evs.filter(function (q) { return q.ma === 'nut-doi'; })[0];
      if (kind === 'nut') {
        var nt = this.nutO(s.den.x, s.den.y); nt.loe = tNay + 340;
        this.burst(tx + dx * 2, ty + dy * 2, 14, [BM.sanTrangV1, BM.sanVangV1, BM.sanKem, BM.sanXanhLaToi], 1.3, 1, true);
        this.bong.sq = 1;
        await ngu(ms * 0.1); if (my !== this.rid) return;
        if (nutEv) nt.bat = !!nutEv.bat;
        evs.filter(function (q) { return q.ma === 'bang-doi'; }).forEach(function (q) { var k2 = q.o.x + ',' + q.o.y; if (q.bat) delete self.bangTat[k2]; else self.bangTat[k2] = true; self.bangLoe[k2] = performance.now() + 300; });
      } else if (kind === 'cua') {
        var cd = this.cuaT[s.den.x + ',' + s.den.y]; if (cd) cd.rung = tNay + 220;
        this.burst(tx + dx * 2, ty + dy * 2, 9, [BM.sanVangSang, BM.sanTrangV1, BM.sanVangV4], 1.0, 1, true);
        this.bong.sq = 1;
      } else if (kind === 'vat' || kind === 'thung') {
        og = kind === 'vat' ? this.vatTaiO(s.den.x, s.den.y) : this.thungTaiO(s.den.x, s.den.y);
        this.burst(tx + dx * 2, ty + dy * 2, 7, [BM.sanCam, BM.sanTrang, BM.sanCamToi], 0.6);
        this.bong.sq = 1;
      } else {
        this.burst(tx + dx * 2, ty + dy * 2, 8, [BM.sanTrangV1, BM.sanLam, BM.sanXamV1], 0.8, 1, true);
        this.bong.sq = 1;
      }
      var bx = this.bong.x, by = this.bong.y;
      await this.tween(ms * 0.3, my, function (k) {                                                      // nảy ngược lại một đoạn nhỏ rồi mờ đi
        if (!self.bong) return;
        var bd = Math.sin(Math.min(1, k * 1.3) * Math.PI * 0.5) * 4;
        self.bong.x = bx - dx * bd; self.bong.y = by - dy * bd; self.bong.a = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6; self.bong.sq = k < 0.25 ? 1 : 0;
        if (og) { var r = Math.sin(k * Math.PI * 6) * (1 - k) * 0.9; og.dx = dx * r; og.dy = dy * r; }
      });
      if (og) { og.dx = 0; og.dy = 0; }
      this.bong = null;
      if (my !== this.rid) return;
      if (kind !== 'nut' && evs.some(function (q) { return q.ma === 'ban-bi-chan'; })) this.baoHieu('?', 1400);       // bắn trúng thứ khác, không phải nút
    },
    /** Thùng nặng và xe cùng rung (thùng bị chặn ngay: 'thung-chan' / băng chuyền không đẩy nổi 'thung-bang-chan'); xe có dấu '!'. s.o = ô thùng, s.den = ô kế tiếp theo hướng đẩy. */
    rungThung: async function (s, per, my) {
      var v = this.vis, th = this.thungTheoId(s.id), laXe = s.ma === 'thung-chan';
      var cx = Math.sign(s.den.x - s.o.x), cy = Math.sign(s.den.y - s.o.y);
      if (laXe) this.baoHieu('!', 1400);
      await this.tween(per, my, function (k) {
        var a = Math.sin(k * Math.PI * 3) * (1 - k);
        if (laXe) { v.dx = cx * a * 1.6; v.dy = cy * a * 1.6; }
        if (th) { th.dx = cx * a * 1.2; th.dy = cy * a * 1.2; }
      });
      v.dx = 0; v.dy = 0; if (th) { th.dx = 0; th.dy = 0; }
    },
    /** GIẬT của phát bắn (sự kiện 'giat' s: huong = hướng giật, di = xe có dời không, thung = id thùng nặng bị đẩy), chạy cùng lúc với bóng bay.
     *  thungs = các 'thung-di' nguon 'giat' của nhịp; chan = 'thung-chan' kieu 'giat' (thùng bị chặn ngay, cả hai đứng yên).
     *    di: xe trượt một ô ngược hướng bắn (giảm tốc), bụi sau bánh;
     *    thùng trượt: xe nhún nhẹ về phía thùng, thùng trượt thẳng soO ô thật nhanh, vệt bụi sau thùng;
     *    bị chặn (tường, mép sân, cửa, nút, rào, bậc thang, vật): xe rung tại chỗ (nhích về phía chỗ chặn rồi về), tia bụi ở chỗ chạm. */
    giatXe: async function (s, thungs, chan, ms, my) {
      var v = this.vis, self = this, rx = DX[s.huong], ry = DY[s.huong];
      if (chan) { await this.rungThung(chan, ms * 1.5, my); return; }
      if (thungs && thungs.length) {
        var m = thungs.map(function (q) { var th = self.thungTheoId(q.id); return th ? { th: th, x0: q.tu.x, y0: q.tu.y, x1: q.den.x, y1: q.den.y, soO: q.soO || 1 } : null; }).filter(function (q) { return q; });
        var soO = 1; m.forEach(function (q) { if (q.soO > soO) soO = q.soO; });
        var dur = Math.min(ms * 2.2, ms * (1.0 + 0.28 * soO));
        await this.tween(dur, my, function (k) {
          var e = 1 - Math.pow(1 - k, 2.4);
          m.forEach(function (q) {
            q.th.x = q.x0 + (q.x1 - q.x0) * e; q.th.y = q.y0 + (q.y1 - q.y0) * e;
            if (k < 0.85 && Math.random() < 0.8) self.burst(q.th.x * T + 7 - rx * 7, q.th.y * T + 10 - ry * 7, 1, [BM.sanTrang, BM.sanXam, BM.sanXanhLa], 0.5);
          });
          var a = Math.sin(Math.min(1, k * 5) * Math.PI) * (1 - k);
          v.dx = rx * a * 1.4; v.dy = ry * a * 1.4;                                             // xe nhún về phía thùng khi thùng bị hất đi
        });
        m.forEach(function (q) { q.th.x = q.x1; q.th.y = q.y1; });
        v.dx = 0; v.dy = 0;
        return;
      }
      if (s.di) {
        var x0 = v.x, y0 = v.y, dur2 = ms * 1.05;
        await this.tween(dur2, my, function (k) {
          var e = 1 - Math.pow(1 - k, 2.4);
          v.x = x0 + (s.den.x - x0) * e; v.y = y0 + (s.den.y - y0) * e; v.hop = Math.sin(Math.min(1, k * 2.2) * Math.PI) * 0.8;
          if (k < 0.8 && Math.random() < 0.6) self.burst(v.x * T + 7 - rx * 6, v.y * T + 10 - ry * 6, 1, [BM.sanTrang, BM.sanXam, BM.sanXanhLa], 0.45);
        });
        v.x = s.den.x; v.y = s.den.y; v.hop = 0;
        return;
      }
      var ox = s.tu.x + rx, oy = s.tu.y + ry, cd = s.vat === 'cua' ? this.cuaT[ox + ',' + oy] : null, vv = s.vat === 'vat' ? this.vatTaiO(ox, oy) : null;
      if (cd) cd.rung = performance.now() + ms;
      this.burst(s.tu.x * T + 7 + rx * 8, s.tu.y * T + 7 + ry * 8, 5, [BM.sanTrangV1, BM.sanLam, BM.sanXamV1], 0.6, 1, true);
      await this.tween(ms * 1.1, my, function (k) {
        var a = Math.sin(k * Math.PI * 3) * (1 - k) * 2.4; v.dx = rx * a; v.dy = ry * a;
        if (vv) { vv.dx = rx * a * 0.5; vv.dy = ry * a * 0.5; }
      });
      v.dx = 0; v.dy = 0; if (vv) { vv.dx = 0; vv.dy = 0; }
    },
    /** Cuối nhịp: các cửa đổi (cua-doi: trượt mở / đóng, theo nút hay theo nhịp) và cửa kẹt (cua-ket: rung, đỏ, vẫn mở vì có xe / vật dưới cửa). */
    cuaBatch: async function (cuaEvs, ms, my) {
      var self = this, jobs = [];
      cuaEvs.forEach(function (q) {
        var d = self.cuaT[q.o.x + ',' + q.o.y]; if (!d) return;
        if (q.ma === 'cua-doi') jobs.push({ d: d, k0: d.k, k1: q.mo ? 1 : 0, mo: !!q.mo, ket: false });
        else jobs.push({ d: d, ket: true });
      });
      if (!jobs.length) { await ngu(ms); return; }
      var tn = performance.now();
      jobs.forEach(function (j) { if (j.ket) { j.d.rung = tn + ms; self.baoHieu('!', Math.max(1200, ms * 1.5)); } });
      await this.tween(ms, my, function (k) {
        jobs.forEach(function (j) {
          if (j.ket) j.d.ket = Math.sin(Math.min(1, k * 1.2) * Math.PI);
          else j.d.k = j.k0 + (j.k1 - j.k0) * ease(k);
        });
      });
      jobs.forEach(function (j) { if (j.ket) j.d.ket = 0; else { j.d.k = j.k1; j.d.mo = j.mo; } });
    },
    /** Đưa nút, cửa, băng chuyền, số nhịp (đèn cửa nhịp), số đạn về đúng vết ở cuối nhịp. */
    dongBoSung: function (e) {
      var self = this, d;
      if (e.nut) e.nut.forEach(function (n) { self.nutO(n.x, n.y).bat = !!n.bat; });
      if (e.nutDe) e.nutDe.forEach(function (m) { self.nutDeT[m.x + ',' + m.y] = !!m.bat; });
      if (e.bangTat) { this.bangTat = {}; e.bangTat.forEach(function (q) { self.bangTat[q.x + ',' + q.y] = true; }); }
      if (e.cua) e.cua.forEach(function (q) { d = self.cuaT[q.x + ',' + q.y]; if (d) { d.mo = !!q.mo; d.k = q.mo ? 1 : 0; d.ket = 0; d.rung = 0; } });
      if (typeof e.nhip === 'number') this.nhipDa = e.nhip;
      if (this.vis.sung && e.robot && e.robot.sung && e.robot.sung.dan !== undefined) this.vis.sung.dan = e.robot.sung.dan;
      this.bong = null;
    },
    /** Đôi mắt LED biểu cảm trên kính robot (áp dụng cho cả 5 mẫu thân; tắt được qua Cài đặt, ?mat=0 hoặc SanVe.dungMat = false). */
    veMatDong: function (g, cx, cy, p, cfgR, v, now) {
      var chay = this.wh.L > 0 || this.wh.R > 0 || v.chan > 0 || Math.abs(v.dx) > 0.05 || Math.abs(v.dy) > 0.05;
      var re = this.wh.L > this.wh.R ? 1 : this.wh.R > this.wh.L ? -1 : 0;
      veMatTam(g, cx, cy, p, cfgR, {
        co: !!(cfgR.than === 'nhen' && v.co),
        choang: !!(v.choang > now || (v.dr && v.dr.roi) || v.tayDo > now),
        mung: !!(this.mung > now),
        bao: (v.bao && v.baoDen > now) ? v.bao : null,
        quet: !!(v.camBien || this.camBienSang(now)),
        chay: chay,
        re: re,
        xe: this.xe ? (this.xeDang || 0) : 0
      }, v.d, now);
    },
    /** Ba ngôi sao choáng quay vòng trên đầu robot khi va chạm / vướng tay / hết pin. */
    veChoang: function (g, cx, cy, now, cao) {
      var v = this.vis, a = Math.min(1, (v.choang - now) / 250);
      if (a <= 0) return;
      var y0 = Math.max(this.cfg.oy * T + 2, cy - (cao || 14));
      if (this.vec) { HU().choang(g, cx, y0, now, a); return; }                    // vector: sao bốn cánh quay vòng (gói V4)
      g.save(); g.globalAlpha = a;
      for (var k = 0; k < 3; k++) {
        var ang = now / 145 + k * 2.0944;
        var sx = Math.round(cx + Math.cos(ang) * 6.5), sy = Math.round(y0 + Math.sin(ang) * 2.2);
        g.fillStyle = BM.vienDam;
        g.fillRect(sx - 1, sy - 1, 3, 3);
        g.fillStyle = (k + ((now / 120) | 0)) % 2 === 0 ? BM.sanVang : BM.sanTrang;
        g.fillRect(sx, sy - 1, 1, 3); g.fillRect(sx - 1, sy, 3, 1);
      }
      g.restore();
    },
    /** Dấu '?' (kẹp hụt) / '!' (ô đã có vật) nổi trên xe. */
    veDau: function (g, kieu, cx, cy, now, cao) {
      if (this.vec) { HU().dau(g, kieu, cx, cy, now, cao, this.cfg.oy * T); return; }     // vector: bong bóng tròn có đuôi (gói V4)
      var Q = ['.##.', '#..#', '...#', '..#.', '.#..', '....', '.#..'], B = ['.#.', '.#.', '.#.', '.#.', '...', '.#.', '...'];
      var rows = kieu === '!' ? B : Q, w = rows[0].length;
      var bob = Math.round(Math.sin(now / 110));
      var x = Math.round(cx - w / 2) + 6, y = Math.max(this.cfg.oy * T + 1, cy - (cao || 21) + bob);
      var i, j;
      g.fillStyle = BM.vienDam;
      for (j = 0; j < rows.length; j++) for (i = 0; i < w; i++) if (rows[j][i] === '#') {
        g.fillRect(x + i - 1, y + j, 3, 1); g.fillRect(x + i, y + j - 1, 1, 3);
      }
      g.fillStyle = kieu === '!' ? BM.sanDoSang : BM.sanKem;
      for (j = 0; j < rows.length; j++) for (i = 0; i < w; i++) if (rows[j][i] === '#') g.fillRect(x + i, y + j, 1, 1);
    },

    /** Băng chuyền đã tắt (bóng trúng nút): mờ đi, không có mũi tên chạy, đèn đỏ nhỏ ở góc; vừa tắt / bật lại thì sáng trắng một chút. */
    veBangTat: function (g, x, y, now) {
      if (this.vec) {                                                           // vector: băng tắt (mũi tên xám, đèn đỏ) đã nằm trong hình 'bang' {tat}; ở đây chỉ còn lóe trắng lúc vừa tắt
        var lv = this.bangLoe[x + ',' + y];
        if (lv > now) HU().tamO(g, x, y, 0.4, 2, 'rgba(' + BM.tiaTrangRgb + ',' + (0.45 * (lv - now) / 300).toFixed(3) + ')');      // gói V4: tấm bo góc
        return;
      }
      g.fillStyle = BM.moLam; g.fillRect(x * T + 1, y * T + 1, T - 2, T - 2);
      g.fillStyle = K_INK; g.fillRect(x * T + 2, y * T + 2, 4, 4);
      g.fillStyle = BM.sanDo; g.fillRect(x * T + 3, y * T + 3, 2, 2);
      var l = this.bangLoe[x + ',' + y];
      if (l > now) { g.fillStyle = 'rgba(' + BM.tiaTrangRgb + ',' + (0.45 * (l - now) / 300).toFixed(3) + ')'; g.fillRect(x * T, y * T, T, T); }
    },
    /** Một ô cửa: cánh trượt theo độ mở d.k (0 đóng .. 1 mở), rung / đỏ khi kẹt; cửa nhịp có hàng đèn đếm nhịp (xanh = mở, đỏ = đóng). */
    veMotCua: function (g, d, now) {
      if (!d) return;
      var nh = d.nhip ? { mo: d.nhip.mo, dong: d.nhip.dong, p: (this.nhipDa + d.nhip.pha) % (d.nhip.mo + d.nhip.dong) } : null;
      if (this.vec) {                                                           // vector: hình 'cua' (ve-vector-may.js), độ mở lượng tử hoá 1/10, đèn nhịp trong hình; rung lệch theo pixel sân, kẹt tô đỏ bo góc
        var s = { k: Math.round(Math.max(0, Math.min(1, d.k)) * 20) / 20, doc: d.doc !== false }, rg = d.rung > now ? Math.sin(now / 22) * 1.2 : 0;
        if (nh) { var chu = nh.mo + nh.dong, sap = ((nh.p + 1) % chu) === 0 || ((nh.p + 1) % chu) === nh.mo; s.nhip = { n: Math.min(chu, 6), mo: nh.mo, p: nh.p, tat: !!(sap && (Math.floor(now / 160) & 1)) }; }
        g.drawImage(this.oV('cua', s), d.x * T + rg, d.y * T, T, T);
        if (d.ket > 0) { g.fillStyle = 'rgba(' + BM.tiaDoV2Rgb + ',' + (0.18 + 0.32 * d.ket).toFixed(3) + ')'; VeVector.H.bo(g, d.x * T + 0.5, d.y * T + 0.5, T - 1, T - 1, 1.5); g.fill(); }
      } else
      Ve.veCua(g, d.x * T, d.y * T, d.k, { doc: d.doc, nhip: nh, ket: d.ket, rung: d.rung > now ? Math.sin(now / 22) * 1.2 : 0, now: now });
      if (d.ket > 0.02 && this.vec) { HU().khungO(g, d.x, d.y, 1, 2.4, 1.6, 'rgba(' + BM.tiaDoV8Rgb + ',' + Math.min(1, d.ket + 0.15).toFixed(3) + ')'); return; }
      if (d.ket > 0.02) {                                                       // cửa kẹt: khung đỏ quanh ô (không bị xe che)
        g.save(); g.strokeStyle = 'rgba(' + BM.tiaDoV8Rgb + ',' + Math.min(1, d.ket + 0.15).toFixed(3) + ')'; g.lineWidth = 2; g.strokeRect(d.x * T + 1, d.y * T + 1, T - 2, T - 2); g.restore();
      }
    },
    draw: function (now) {
      if (!this.cfg || !this.vis) return;
      var g = this.g, c = this.cfg, TL = Ve.tiles(), cf = Math.floor(now / 130) % 5, ff = Math.floor(now / 180) & 3;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.cv.width, this.cv.height);
      if (this.sv !== 1) g.setTransform(this.sv, 0, 0, this.sv, 0, 0);          // chế độ vector: canvas theo pixel thiết bị, vẽ theo pixel sân qua phép phóng
      g.save(); g.translate(-c.ox * T, -c.oy * T);                // canvas chỉ là cửa sổ vẽ (ox, oy, vw, vh): từ đây tới veLop vẽ theo tọa độ ô đầy đủ của lõi
      for (var y = c.oy; y < c.oy + c.vh; y++) for (var x = c.ox; x < c.ox + c.vw; x++) {
        var ch = c.rows[y][x], t;
        var kO = x + ',' + y, bangTat = BANG[ch] !== undefined && this.bangTat[kO];
        if (this.vec) { this.veOVec(g, x, y, ch, kO, now, cf, ff); continue; }              // vector (gói V2): mọi ô vẽ bằng hình vector đúng cỡ, nhánh pixel bên dưới giữ y nguyên
        if (BANG[ch] !== undefined) t = Ve.makeConv(BANG[ch], bangTat ? 0 : cf);                 // băng tắt (nút đã đổi): đứng yên ở một khung
        else if (ch === '#') t = TL.wall;
        else if (ch === 'N') { var nt = this.nutT[kO]; t = TL.nut(!!(nt && nt.bat), !!(nt && nt.loe > now)); }                 // nút bắn nằm trên tường
        else if (ch === 'C' || ch === 'c') t = TL.rug[(x + y * 2) & 3];                           // cửa: sàn ở dưới, cánh cửa + khung vẽ đè lên
        else if (ch === '=') t = TL.rug[(x + y * 2) & 3];                // hàng rào thấp: sàn nguyên, cọc + thanh vẽ đè lên (thấy sàn phía sau)
        else if (ch === 'S') t = TL.stair;
        else if (ch === 'n') t = TL.gam;                                                        // gầm thấp (nhện co chân mới chui qua)
        else if (ch === 'u') t = TL.ho;                                                         // hố (nhện bước vào là rơi)
        else if (ch === 'F') t = TL.pad;
        else if (ch === 'P') { g.drawImage(TL.rug[(x + y * 2) & 3], x * T, y * T); t = TL.sac[(now / 450 | 0) & 1]; }      // ô sạc: sàn ở dưới, đế sạc vẽ đè
        else t = TL.rug[(x + y * 2) & 3];
        var mn = (ch === '#' || ch === 'S' || ch === '=' || ch === 'N' || ch === 'C' || ch === 'c' || ch === 'n' || ch === 'u' || BANG[ch] !== undefined) ? null : this.mauNen(x, y);
        if (mn) t = TL.mau[mn][(x + y) & 1];                  // sàn tô màu (kể cả dưới cờ và ô đích)
        g.drawImage(t, x * T, y * T, T, T);
        if (ch === 'M') g.drawImage(TL.nutDe(!!this.nutDeT[kO]), x * T, y * T);
        if (ch === 'N' && this.nutT[kO] && this.nutT[kO].bat) this.veNong(g, x, y, now);                // nút đang bật thì nóng (warm() đọc được): quầng đỏ cam + gợn nhiệt
        else if (BAN_XOAY[ch] !== undefined) g.drawImage(TL.banXoay(BAN_XOAY[ch], ff), x * T, y * T);
        else if (ch === '1' || ch === '2') g.drawImage(TL.cong(ch, ff), x * T, y * T);
        if (bangTat) this.veBangTat(g, x, y, now);
        else if (ch === 'C' || ch === 'c') this.veMotCua(g, this.cuaT[kO], now);
        if (ch === '=') g.drawImage(TL.rao((x > 0 && c.rows[y][x - 1] === '=' ? 1 : 0) | (x < c.w - 1 && c.rows[y][x + 1] === '=' ? 2 : 0) | (y > 0 && c.rows[y - 1][x] === '=' ? 4 : 0) | (y < c.h - 1 && c.rows[y + 1][x] === '=' ? 8 : 0)), x * T, y * T);
      }
      this.veSon(g, now);                                      // máy sơn: hình mờ cần tô + ô đã tô (trên sàn, dưới vật và xe)
      this.veDichTrong(g, now);
      this.veVat(g, TL, now);
      this.veThung(g, TL, now);
      this.veDichDay(g);
      this.veBongMoNen(g, now);                                // bóng mờ: vật mờ + ô ◆ (xe mờ vẽ ở lớp phủ robot)
      if (c.dd && this.vec) HU().khungO(g, c.dd.x, c.dd.y, 1.5, 2.4, 0.8, BM.moSangV7, [2, 2]);   // vector: khung nét đứt bo góc
      else if (c.dd) {                                              // vòng mờ nét đứt: ô xuất phát
        g.save(); g.strokeStyle = BM.moSangV7; g.lineWidth = 1; g.setLineDash([2, 2]);
        g.strokeRect(c.dd.x * T + 1.5, c.dd.y * T + 1.5, T - 3, T - 3); g.restore();
      }
      if (c.cat) {                                             // dấu … ở cạnh bị cắt
        g.save(); g.translate(c.ox * T, c.oy * T);
        g.fillStyle = BM.moSangV8;
        var cw = this.pw, ch2 = this.ph, m = 3;
        for (var q2 = -1; q2 <= 1; q2++) {
          if (this.vec) {                                      // vector: chấm tròn
            if (c.cat.tren) HU().cham(g, cw / 2 + q2 * 4, m + 1, 1, BM.moSangV8);
            if (c.cat.duoi) HU().cham(g, cw / 2 + q2 * 4, ch2 - m - 1, 1, BM.moSangV8);
            if (c.cat.trai) HU().cham(g, m + 1, ch2 / 2 + q2 * 4, 1, BM.moSangV8);
            if (c.cat.phai) HU().cham(g, cw - m - 1, ch2 / 2 + q2 * 4, 1, BM.moSangV8);
            continue;
          }
          if (c.cat.tren) g.fillRect(cw / 2 + q2 * 4 - 1, m, 2, 2);
          if (c.cat.duoi) g.fillRect(cw / 2 + q2 * 4 - 1, ch2 - m - 2, 2, 2);
          if (c.cat.trai) g.fillRect(m, ch2 / 2 + q2 * 4 - 1, 2, 2);
          if (c.cat.phai) g.fillRect(cw - m - 2, ch2 / 2 + q2 * 4 - 1, 2, 2);
        }
        g.restore();
      }
      for (var ci = 0; ci < c.cacCo.length; ci++) {
        var co = c.cacCo[ci];
        var fy = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 3) : 0;
        var fl = TL.flags[ff], fx = co.x * T + Math.floor((T - fl.width) / 2), fyy = co.y * T + (T - fl.height) - 1;   // cờ gọn trong ô: giữa theo bề ngang, đế cách đáy ô 1 px (sát đáy thì viền đế chạm đường kẻ ô)
        if (this.vec) g.drawImage(VeVector.o('co', this.pxO), co.x * T, co.y * T + fy, T, T);     // vector: cờ hồng trên cột bạc, đầy ô (nhún theo fy như cũ)
        else g.drawImage(fl, Math.max(c.ox * T, Math.min(c.ox * T + this.pw - fl.width, fx)), Math.max(c.oy * T, Math.min(c.oy * T + this.ph - fl.height, fyy)) + fy);
        if (co.chu !== null && this.vec) HU().vach(g, co.x * T + 2.5, co.y * T + T - 2.8, T - 5, 1.8, (this.cfgXe && this.cfgXe[co.chu] && this.cfgXe[co.chu].mauXe) || MAU_XE[co.chu % MAU_XE.length]);   // vector: vạch bo tròn
        else if (co.chu !== null) { g.fillStyle = (this.cfgXe && this.cfgXe[co.chu] && this.cfgXe[co.chu].mauXe) || MAU_XE[co.chu % MAU_XE.length]; g.fillRect(co.x * T + 2, co.y * T + T - 3, T - 4, 2); }    // cờ riêng: vạch màu của robot chủ dưới chân cờ
      }
      g.restore();
      this.veLop(now);
    },

    tween: function (ms, my, fn) {
      var self = this;
      return new Promise(function (res) {
        var t0 = performance.now();
        (function f() {
          if (my !== self.rid) { res(); return; }
          var k = ms <= 0 ? 1 : Math.min(1, (performance.now() - t0) / ms);
          fn(k);
          if (k < 1) setTimeout(f, 16); else res();
        })();
      });
    },

    /**
     * Phát lại MỘT sự kiện 'nhip' của vết trong `ms` mili giây.
     * Trả về Promise; nếu sân bị datLai() giữa chừng thì dừng sớm.
     */
    phatNhip: async function (e, ms) {
      var my = this.rid, v = this.vis, self = this, evs = e.suKien || [];
      var b = (e.robot && e.robot.banh) || { trai: 0, phai: 0 };
      if (v.nc && e.robot && e.robot.namCham) { v.nc.bat = !!e.robot.namCham.bat; v.nc.cuc = e.robot.namCham.cuc || null; }     // nam châm: trạng thái bật / tắt và cực của nhịp (lệnh bật tắt chạy ĐẦU nhịp)
      v.camBien = (e.robot && e.robot.camBien) ? { bat: true } : null;       // cảm biến sáng trong nhịp có lệnh đọc cảm biến (lõi chưa có: chương sau điền e.robot.camBien)
      this.wh.L = b.trai !== 0 ? 2 : 0; this.wh.R = b.phai !== 0 ? 2 : 0;
      if (e.robot && e.robot.truot) { this.wh.L = 2; this.wh.R = 2; }       // omni trượt ngang: cả bốn bánh nhỏ cùng quay
      if (v.son) evs.forEach(function (s) {                                 // máy sơn: chấm / hạ đầu sơn làm ĐẦU nhịp (trước khi xe đi): ô đứng đổi màu ngay
        if (s.ma === 'ha-but') v.son.ha = true;
        else if (s.ma === 'nhac-but') v.son.ha = false;
        else if (s.ma === 'to-o' && s.kieu !== 'net') self.toO(s.o, s.mau);
      });
      var list = evs.filter(function (s) { return s.ma !== 'toi-co' && !HIEU_UNG[s.ma]; });
      var thungBang = evs.filter(function (s) { return s.ma === 'thung-di' && s.nguon === 'bang'; });      // thùng nằm trên băng: băng đưa đi 1 ô
      var coBan = evs.some(function (s) { return s.ma === 'ban'; });                                      // súng hơi: phát bắn = bóng bay + xe giật (+ thùng trượt) CÙNG LÚC, gom làm một bước 'ban'
      var giatEv = evs.filter(function (s) { return s.ma === 'giat'; })[0] || null;
      var thungGiat = evs.filter(function (s) { return s.ma === 'thung-di' && s.nguon === 'giat'; });     // thùng nặng nằm sau xe bị cú giật hất đi
      var thungXich = evs.filter(function (s) { return s.ma === 'thung-di' && s.nguon === 'xich'; });     // mùa 2: xích tiến đẩy thùng trước mũi đi 1 ô, thùng trượt cùng bước 'tien'
      var beSungEv = evs.filter(function (s) { return s.ma === 'be-sung'; })[0] || null;                 // mùa 2: bệ súng xích giữ xe khi bắn tụ (không giật)
      var chanGiat = evs.filter(function (s) { return s.ma === 'thung-chan' && s.kieu === 'giat'; })[0] || null;   // thùng sau xe bị chặn ngay: xe và thùng cùng rung
      list = list.filter(function (s) {
        if (s.ma === 'thung-di') return s.nguon !== 'bang' && s.nguon !== 'xich' && !(s.nguon === 'giat' && coBan);
        if (coBan && (s.ma === 'giat' || (s.ma === 'thung-chan' && s.kieu === 'giat'))) return false;
        return true;
      });
      if (thungBang.length && !list.some(function (s) { return s.ma === 'bang-day'; })) list.push({ ma: 'thung-bang' });
      var cuaEvs = evs.filter(function (s) { return s.ma === 'cua-doi' || s.ma === 'cua-ket'; });                // súng hơi: cửa đổi ở CUỐI nhịp, gom làm một bước
      var nutDeEvs = evs.filter(function (s) { return s.ma === 'nut-de'; });
      if (cuaEvs.length || nutDeEvs.length) list.push({ ma: 'cua-batch' });
      var dsT = function (arr) {
        return arr.map(function (q) { var th = self.thungTheoId(q.id); return th ? { th: th, x0: q.tu.x, y0: q.tu.y, x1: q.den.x, y1: q.den.y } : null; }).filter(function (q) { return q; });
      };
      var capT = function (m, k2) { m.forEach(function (q) { q.th.x = q.x0 + (q.x1 - q.x0) * k2; q.th.y = q.y0 + (q.y1 - q.y0) * k2; }); };
      var xongT = function (m) { m.forEach(function (q) { q.th.x = q.x1; q.th.y = q.y1; }); };
      var tgian = ms;
      if (e.robot && e.robot.tay) {                                 // (a) tay đổi tư thế, (b) kẹp / thả: xong rồi mới tới bánh
        tgian = await this.apTay(e, ms, my);
        if (tgian < 0) return;
      }
      var laNhen = this.cfg.robot.than === 'nhen', laXich = this.cfg.robot.than === 'xich', d = v.d;
      if (v.nem && e.robot && e.robot.nem) { var nvs = evs.filter(function (s) { return s.ma === 'nem-vat'; })[0]; v.nem.tam = nvs ? nvs.tam : e.robot.nem.tam; }   // tầm hiển thị khi ném = tầm LÚC GỌI throw()
      if (evs.some(function (s) { return s.ma === 'omni-khong-cheo' || s.ma === 'nem-dung-yen' || s.ma === 'ban-dung-yen'; })) this.baoHieu('?', 1100);
      else if (evs.some(function (s) { return s.ma === 'ban-goi-lai'; })) this.baoHieu('!', 1300);                  // súng hơi: lệnh bắn thứ hai trong nhịp bị bỏ
      if (v.sung && e.robot && e.robot.sung && e.robot.sung.dan !== undefined) v.sung.dan = e.robot.sung.dan;        // omni: lệnh bánh cùng nhịp với slide bị bỏ
      if (evs.some(function (s) { return s.ma === 'xich-quay-do'; })) {                            // xích: phần quay dở bị mất, xoay ngược về thẳng, dấu ?
        var g0 = v.goc, tq = Math.min(tgian * 0.3, 90);
        this.baoHieu('?', 1300);
        await this.tween(tq, my, function (k) { v.goc = g0 * (1 - ease(k)); });
        if (my !== this.rid) return;
        v.goc = 0; tgian = Math.max(ms * 0.3, tgian - tq);
      }
      var TRONG = function (s) { return s.ma === 'bang-khong-day' ? 0.5 : s.ma === 'ban-xoay' ? 0.95 : s.ma === 'dich-chuyen' ? 1.15 : s.ma === 'hut-vat' ? 1.5 : s.ma === 'day-vat' ? 1.6 : s.ma === 'tha-vat' ? 0.8 : s.ma === 'nem-vat' ? 2.4 : s.ma === 'nem-roi' ? 0.8 : s.ma === 'nem-vo' ? 1.2 : s.ma === 'ban' ? 2.2 : s.ma === 'cua-batch' ? 1.2 : s.ma === 'sac-pin' ? 1.3 : s.ma === 'het-pin' ? 1.7 : s.ma === 'roi-ho' ? 2.5 : 1; };
      var tong = 0; list.forEach(function (s) { tong += TRONG(s); });
      if (!list.length) await ngu(tgian);
      for (var i = 0; i < list.length; i++) {
        var s = list[i], per = tgian * TRONG(s) / tong;
        if (my !== this.rid) return;
        if (s.den && (s.ma === 'tien' || s.ma === 'lui' || s.ma === 'di' || s.ma === 'bang-day' || s.ma === 'truot')) {
          var x0 = v.x, y0 = v.y, sx = Math.sign(s.den.x - x0), sy = Math.sign(s.den.y - y0), laTruot = s.ma === 'truot';
          var mt = (s.ma === 'bang-day' && thungBang.length) ? dsT(thungBang.splice(0)) : (s.ma === 'tien' && thungXich.length) ? dsT(thungXich.splice(0)) : [];     // thùng bị xích đẩy: trượt dính sát mũi xe
          if (laNhen && s.ma === 'di') v.chan = 2;                    // nhịp 2 của bước nhện: trượt sang ô mới, chân bước
          if (s.ma === 'bang-day') await ngu(per * 0.15);
          await this.tween(per * (s.ma === 'bang-day' ? 0.85 : 1), my, function (k) {
            var k2 = ease(k); v.x = x0 + (s.den.x - x0) * k2; v.y = y0 + (s.den.y - y0) * k2;
            if (mt.length) capT(mt, k2);
            if (laTruot && Math.random() < 0.5) self.burst(v.x * T + 7 - sx * 6, v.y * T + 9 - sy * 6, 1, [BM.sanTrang, BM.sanXanhLa], 0.5);      // omni: bụi phía sau, xe giữ nguyên hướng mặt
          });
          if (my !== this.rid) return;
          v.x = s.den.x; v.y = s.den.y; v.chan = 0; xongT(mt);
        } else if (s.ma === 'thung-di') {                            // thùng trượt thẳng soO ô thật nhanh do cú giật (thường đã nằm trong bước 'ban'), vệt bụi phía sau
          await this.giatXe({ huong: Math.abs(s.den.x - s.tu.x) ? (s.den.x > s.tu.x ? 1 : 3) : (s.den.y > s.tu.y ? 2 : 0), di: false, tu: s.tu, den: s.tu }, [s], null, ms, my);
        } else if (s.ma === 'thung-bang') {                          // băng chuyền đưa thùng đi 1 ô (xe đứng ngoài băng)
          var m2 = dsT(thungBang.splice(0));
          await ngu(per * 0.15);
          await this.tween(per * 0.85, my, function (k) { capT(m2, ease(k)); });
          xongT(m2);
        } else if (s.ma === 'thung-chan' || s.ma === 'thung-bang-chan') {      // thùng không đi được: xe và thùng rung nhẹ, dấu '!'
          await this.rungThung(s, per, my);
        } else if (s.ma === 'thung-ket') {                           // thùng kẹt góc: ô tô đỏ (giữ tới khi chạy lại), thùng rung
          var tk = this.thungTheoId(s.id);
          if (tk) tk.ket = true;
          await this.tween(per, my, function (k) { if (tk) { tk.dx = Math.sin(k * Math.PI * 9) * (1 - k) * 1.6; tk.dy = Math.cos(k * Math.PI * 7) * (1 - k) * 0.8; } });
          if (tk) { tk.dx = 0; tk.dy = 0; }
        } else if (s.ma === 'quay-nua') {                             // xích: nhịp quay thứ nhất, xoay 45° (nhịp kế cùng lệnh mới đủ 90°)
          var q0 = v.goc, q1 = (s.huong > 0 ? 1 : -1) * Math.PI / 4;
          await this.tween(per, my, function (k) {
            v.goc = q0 + (q1 - q0) * ease(k); v.hop = Math.sin(k * Math.PI) * 1.5;
            if (Math.random() < 0.4) self.burst(v.x * T + (s.huong < 0 ? 3 : 11), v.y * T + 12, 1, [BM.sanTrang, BM.sanXanhLoV4], 0.6);
          });
          if (my !== this.rid) return;
          v.goc = q1; v.hop = 0;
        } else if (s.ma === 'bang-khong-day') {                       // xích: băng chạy dưới xích mà xe đứng yên, xích bám chặt rung nhẹ
          await this.tween(per, my, function (k) {
            v.dx = Math.sin(k * Math.PI * 6) * (1 - k) * 1.1;
            if (Math.random() < 0.35) self.burst(v.x * T + 3 + Math.random() * 8, v.y * T + 12, 1, [BM.sanXam, BM.sanTrang], 0.4);
          });
          v.dx = 0;
        } else if (s.ma === 'hut-vat') {                             // nam châm hút được vật sắt: vật rung rồi bay về mũi xe và dính
          await this.hutVat(s, per, my);
        } else if (s.ma === 'nap-vat') {                             // load(): vật ở ô trước mặt nhảy lên rổ
          await this.napVat(s, ms * 1.7, my);
        } else if (s.ma === 'nem-vat') {                             // throw(): vật bay vòng cung tới ô rơi
          await this.nemVat(s, ms * 2.8, my);
        } else if (s.ma === 'nem-roi') {                             // vật chạm đất, nảy nhẹ
          await this.nemRoi(s, ms * 1.1, my);
        } else if (s.ma === 'nem-vo') {                              // vật vỡ ở ô rơi
          await this.nemVo(s, ms * 2.2, my);
        } else if (s.ma === 'nem-hut' || s.ma === 'nap-hut') {       // throw() khi rổ trống / load() khi ô trước mặt không có vật: cần vung hụt, dấu '?'
          this.baoHieu('?', 1400);
          if (v.nem) v.nem.dang = performance.now() + Math.min(per, 400);
          await ngu(per);
        } else if (s.ma === 'ro-day') {                              // load() khi rổ đã có vật: vật trong rổ rung, dấu '!'
          this.baoHieu('!', 1500);
          if (v.nem) { v.nem.rung = performance.now() + Math.max(per, 500); v.nem.loi = v.nem.rung; }
          await ngu(per);
        } else if (s.ma === 'ban') {                                  // shoot() / shoot_back(): bóng bay thẳng từ miệng nòng tới ô den, CÙNG LÚC xe giật (hay thùng sau xe trượt đi)
          await Promise.all([this.banBong(s, evs, ms * 2.1, my), giatEv ? this.giatXe(giatEv, thungGiat, chanGiat, ms, my) : beSungEv ? this.veGiuBe(beSungEv, ms, my) : null]);
          if (my !== this.rid) return;
        } else if (s.ma === 'giat') {                                 // giật mà không có sự kiện bắn đi kèm (dự phòng)
          await this.giatXe(s, thungGiat, chanGiat, ms, my);
        } else if (s.ma === 'cua-batch') {                            // cuối nhịp: nút đè sáng/tắt, cửa trượt mở / đóng, cửa kẹt rung đỏ
          if (typeof e.nhip === 'number') this.nhipDa = e.nhip;
          nutDeEvs.forEach(function (nd) {
            self.nutDeT[nd.o.x + ',' + nd.o.y] = !!nd.bat;
            self.burst(nd.o.x * T + 7, nd.o.y * T + 7, 5, nd.bat ? [BM.sanXanhLaToi, BM.sanTrang] : [BM.sanVangV3, BM.sanTrang], 0.55);
          });
          if (cuaEvs.length) await this.cuaBatch(cuaEvs, ms * 0.95, my);
        } else if (s.ma === 'ban-xoay') {                             // bàn xoay (@ xoay phải 90°, % xoay trái 90°): mâm xoay đưa robot quay 90°
          var d1bx = s.den, h0bx = v.goc, h1bx = (s.huong > 0 ? 1 : -1) * Math.PI / 2, dqbx = s.huong > 0 ? 1 : -1, memBx = this.xoayMem();
          this.burst(v.x * T + 7, v.y * T + 7, 5, s.huong > 0 ? [BM.sanVangV3, BM.sanTrang] : [BM.sanXanhLoV1, BM.sanTrang], 0.65);
          await this.tween(per, my, function (k) {
            v.hop = Math.sin(k * Math.PI) * 1.6;
            if ((v.nc || v.nem) && !laXich) (v.nc || v.nem).ang = (d + dqbx * ease(k)) * Math.PI / 2;
            if (laXich) v.goc = h0bx + (h1bx - h0bx) * ease(k);
            else if (memBx) v.gocMem = dqbx * ease(k) * Math.PI / 2;  // vector: mâm xoay đưa xe quay mượt (gói V4)
            else if (k > 0.5) v.d = d1bx;
          });
          if (my !== this.rid) return;
          v.d = d1bx; v.hop = 0; v.goc = 0; v.gocMem = 0; d = d1bx;
          if (v.nc) v.nc.ang = null;
          if (v.nem) v.nem.ang = null;
        } else if (s.ma === 'dich-chuyen') {                          // cổng dịch chuyển (1, 2): lóe sáng ở cổng vào rồi xuất hiện ở cổng ra
          var mCong = s.cong === '2' ? [BM.sanTimSang, BM.sanTimSangV1, BM.sanTrangV1] : [BM.sanXanhLoV5, BM.sanXanhLoToiV2, BM.sanTrangV1];
          this.burst(s.tu.x * T + 7, s.tu.y * T + 7, 10, mCong, 1.0, 1, true);
          await this.tween(per * 0.45, my, function (k) { v.hop = Math.sin(k * Math.PI * 0.5) * 5; });
          if (my !== this.rid) return;
          v.x = s.den.x; v.y = s.den.y;
          this.burst(s.den.x * T + 7, s.den.y * T + 7, 12, mCong, 1.1, 1, true);
          await this.tween(per * 0.55, my, function (k) { v.hop = (1 - ease(k)) * 5; });
          if (my !== this.rid) return;
          v.hop = 0;
        } else if (s.ma === 'cong-chan') {                            // cổng đầu kia bị chắn: xe rung tại cổng vào, cổng ra nháy đỏ, dấu '!'
          this.baoHieu('!', 1400);
          if (s.den) this.canhBao = { x: s.den.x, y: s.den.y, den: performance.now() + 1100 };
          await this.tween(per, my, function (k) { v.dx = Math.sin(k * Math.PI * 6) * (1 - k) * 1.8; });
          v.dx = 0;
        } else if (s.ma === 'het-dan') {                              // shoot() / shoot_back() khi hết đạn: nòng (trước hay sau) chỉ lóe xám, thẻ đạn nháy đỏ, dấu '!'; xe không giật
          var sauH = !!(s.lenh && s.lenh.ten === 'shoot_back'), kcH = sauH ? (this.mzs || 4) : (this.mz || 8), dH = sauH ? (d + 2) % 4 : d;
          var mzx = Math.round(v.x) * T + 7 + DX[dH] * kcH, mzy = Math.round(v.y) * T + 7 + DY[dH] * kcH;
          if (v.sung) v.sung.het = performance.now() + 900;
          this.baoHieu('!', 1500); this.burst(mzx, mzy, 5, [BM.sanXamToiV3, BM.sanLam, BM.sanTrangV1], 0.4, 1, true);
          await ngu(per);
        } else if (s.ma === 'sac-pin') {                             // drone: cuối nhịp ở trên ô sạc, pin đầy lại
          await this.sacPin(s, per, my);
        } else if (s.ma === 'het-pin') {                             // drone: pin về 0, hạ cánh khẩn
          await this.hetPin(s, per, my);
        } else if (s.ma === 'tha-vat') {                             // magnet_off(): vật dính rơi xuống ô sát mũi xe (drone: ô ngay dưới bụng)
          await this.thaVat(s, per, my);
        } else if (s.ma === 'day-vat') {                             // vật nam châm CÙNG cực: bị đẩy (hay bị bắn khỏi mũi xe) trượt thẳng ra xa xe, bụi theo sau
          await this.dayVat(s, per, my);
        } else if (s.ma === 'day-bi-chan' || s.ma === 'sat-khong-day' || s.ma === 'ngoai-tam' || s.ma === 'cung-cuc') {          // đẩy mà sát vật cản / đổi cực khi dính sắt / sắt ngoài tầm / drone cùng cực: vật rung nhẹ, dấu '!' hay '?'
          var ov = s.id ? this.objTheoId(s.id) : null, nho = s.ma === 'day-bi-chan';
          this.baoHieu(nho ? '!' : '?', 1400);
          if (nho && s.o) this.canhBao = { x: s.o.x, y: s.o.y, den: performance.now() + 900 };
          await this.tween(per, my, function (k) { if (ov) { ov.dx = Math.sin(k * Math.PI * 7) * (1 - k) * (nho ? 1.2 : 0.7); } });
          if (ov) ov.dx = 0;
        } else if (s.ma === 'hut-go') {                              // nam châm bật mà trước mặt là vật gỗ: sóng chạm vật rồi tắt, vật gỗ rung nhẹ, dấu '?'
          var og = this.vatTaiO(s.o.x, s.o.y), hx = Math.sign(s.o.x - Math.round(v.x)), hy = Math.sign(s.o.y - Math.round(v.y));
          this.baoHieu('?', 1400);
          await this.tween(per, my, function (k) {
            if (og && v.dr) { og.nang = Math.abs(Math.sin(k * Math.PI * 2)) * 1.6 * (1 - k); og.dx = Math.sin(k * Math.PI * 5) * (1 - k) * 0.3; }       // drone: vật gỗ trượt nhẹ lên rồi rơi lại, không dính (theo phương thẳng đứng)
            else if (og) { og.dx = Math.sin(k * Math.PI * 6) * (1 - k) * 0.9; }
            if (Math.random() < 0.3 * (1 - k)) self.burst(s.o.x * T + 7 - hx * 6, s.o.y * T + 7 - hy * 6, 1, [BM.sanKemToi, BM.sanTrang], 0.35);
          });
          if (og) { og.dx = 0; og.nang = 0; }
        } else if (s.ma === 'tha-bi-chan') {                         // magnet_off() / release() mà ô trước mũi xe bị chặn: vật dính / trong kẹp rung đỏ, ô trước nhấp nháy đỏ, dấu '!'
          var tn = performance.now();
          this.baoHieu('!', 1500); this.canhBao = { x: s.o.x, y: s.o.y, den: tn + 1300 };
          if (v.nc) v.nc.rung = tn + Math.max(per, 500); else if (s.kieu === 'kep') v.kepRung = tn + Math.max(per, 500);          // kẹp: vật trong kẹp rung đỏ
          await ngu(per);
        } else if (s.ma === 'quay-phai' || s.ma === 'quay-trai' || s.ma === 'quay-dau') {
          var d1 = (d + (s.ma === 'quay-phai' ? 1 : s.ma === 'quay-trai' ? 3 : 2)) % 4, lt = s.ma === 'quay-trai' ? 'L' : 'R';
          var h0 = v.goc, h1 = (s.ma === 'quay-trai' ? -1 : 1) * Math.PI / 2, xoayDan = laXich && s.ma !== 'quay-dau';
          var dq = s.ma === 'quay-phai' ? 1 : s.ma === 'quay-trai' ? -1 : 2, mem = this.xoayMem();
          await this.tween(per, my, function (k) {
            v.hop = Math.sin(k * Math.PI) * 2;
            if ((v.nc || v.nem) && !xoayDan) (v.nc || v.nem).ang = (d + dq * ease(k)) * Math.PI / 2;      // vật dính / vật trong rổ quay theo mũi xe (vòng cung), không nhảy cóc
            if (xoayDan) v.goc = h0 + (h1 - h0) * ease(k);            // xích: nhịp quay thứ hai, xoay nốt từ 45° tới 90°
            else if (mem) v.gocMem = dq * ease(k) * Math.PI / 2;      // vector: cả hình xoay mượt từ hướng cũ (gói V4)
            else if (k > 0.5) v.d = d1;
            if (Math.random() < 0.4) self.burst(v.x * T + (lt === 'L' ? 3 : 11), v.y * T + 12, 1, [BM.sanTrang, BM.sanXanhLoV4], 0.6);
          });
          if (my !== this.rid) return;
          v.d = d1; v.hop = 0; v.goc = 0; v.gocMem = 0; d = d1;
          if (v.nc) v.nc.ang = null;
          if (v.nem) v.nem.ang = null;
        } else if (s.ma === 'dam-tuong' || s.ma === 'bang-chan') {
          var ddx = s.den ? Math.sign(s.den.x - (s.tu ? s.tu.x : v.x)) : 0, ddy = s.den ? Math.sign(s.den.y - (s.tu ? s.tu.y : v.y)) : 0;
          var bad = s.ma === 'dam-tuong', thd = (bad && s.vat === 'thung-nang' && s.den) ? this.thungTaiO(s.den.x, s.den.y) : null;
          if (bad) { v.choang = performance.now() + per + 1100; this.matSuKien('dam', 750); }
          var cdr = (bad && s.vat === 'cua' && s.den) ? this.cuaT[s.den.x + ',' + s.den.y] : null;                                // xe húc cửa đang đóng: cánh cửa rung
          if (cdr) cdr.rung = performance.now() + per;
          var vv = (s.vat === 'vat' && s.den) ? (this.objTheoId(s.idVat) || this.vatTaiO(s.den.x, s.den.y)) : null;                         // vướng vật nằm đất: xe giật lại, vật rung, bụi
          if (vv) this.burst(vv.x * T + 7 - ddx * 3, vv.y * T + 7 - ddy * 3, 4, vv.chat === 'sat' ? [BM.sanLamV6, BM.sanLamV7, BM.sanTrang] : [BM.sanCam, BM.sanTrang, BM.sanCamToi], 0.5);
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) {
            var a = Math.sin(k * Math.PI * 3) * (1 - k) * 3; v.dx = ddx * a; v.dy = ddy * a;
            if (thd) { thd.dx = ddx * a * 0.4; thd.dy = ddy * a * 0.4; }
            if (vv) { vv.dx = ddx * a * 0.5; vv.dy = ddy * a * 0.5; }
            if (bad && k > 0.1 && k < 0.6) self.flash = performance.now() + 120;
          });
          v.dx = 0; v.dy = 0; v.chan = 0; if (thd) { thd.dx = 0; thd.dy = 0; } if (vv) { vv.dx = 0; vv.dy = 0; }
          if (bad && this.onRung) this.onRung();
        } else if (s.ma === 'doi-chan') {                           // nhện co / duỗi chân: nhún xuống (co) hay vươn lên (duỗi), ảnh part đổi giữa nhịp, bụi nhẹ
          var coDen = s.den === 'co';
          await this.tween(per, my, function (k) {
            v.hop = (coDen ? -1 : 1) * Math.sin(k * Math.PI) * 1.4;
            if (k > 0.45) v.co = coDen;
            if (k > 0.25 && k < 0.55 && Math.random() < 0.5) self.burst(v.x * T + 3 + Math.random() * 8, v.y * T + 11, 1, [BM.sanTrang, BM.sanVangSangV1], 0.5);
          });
          v.co = coDen; v.hop = 0;
        } else if (s.ma === 'nhay') {                               // nhện BẬT QUA một ô: bay vòng cung (cao nhất ở ô giữa), đáp xuống ô cách 2 ô, bụi khi đáp
          var jx0 = v.x, jy0 = v.y;
          await this.tween(per, my, function (k) {
            var k2 = ease(k); v.x = jx0 + (s.den.x - jx0) * k2; v.y = jy0 + (s.den.y - jy0) * k2;
            v.hop = Math.sin(k * Math.PI) * 7;
          });
          if (my !== this.rid) return;
          v.x = s.den.x; v.y = s.den.y; v.hop = 0; v.chan = 0;
          this.burst(s.den.x * T + 7, s.den.y * T + 11, 6, [BM.sanTrang, BM.sanXanhLa, BM.sanVangSangV1], 0.7);
        } else if (s.ma === 'nhay-hut') {                           // nhảy hụt: nhện bật lên, đụng chỗ chắn rồi rơi lại ô cũ, dấu '!'
          var hux = Math.sign(s.den.x - s.tu.x), huy = Math.sign(s.den.y - s.tu.y);
          this.baoHieu('!', 1500); v.choang = performance.now() + per + 1100;
          await this.tween(per, my, function (k) {
            var a = Math.sin(k * Math.PI);
            v.hop = a * 6; v.dx = hux * a * (s.giua ? 4 : 9); v.dy = huy * a * (s.giua ? 4 : 9);
            if (k > 0.45 && k < 0.6) self.flash = performance.now() + 100;
          });
          v.dx = 0; v.dy = 0; v.hop = 0;
          if (this.onRung) this.onRung();
        } else if (s.ma === 'roi-ho') {                             // nhện rơi hố: nhỏ dần, xoay, mờ dần, bụi đất bắn lên, dấu '!'
          this.baoHieu('!', 2200); v.choang = performance.now() + per + 1100;
          this.burst(s.o.x * T + 7, s.o.y * T + 7, 8, [BM.sanNauSangV2, BM.sanNauV1, BM.sanTrang], 0.8, 1, true);
          await this.tween(Math.max(per, ms * 0.9), my, function (k) { v.roi = ease(k); });
          v.roi = 1;
          if (this.onRung) this.onRung();
        } else if (s.ma === 'dau-dung-tran') {                      // stand() trong gầm: nhện nhổm lên rồi đụng mái, rung, dấu '!'
          this.baoHieu('!', 1500); v.choang = performance.now() + per + 1100;
          await this.tween(per, my, function (k) { v.hop = Math.sin(k * Math.PI * 2) * (k < 0.5 ? 2 : 0.7) * (1 - k); if (k > 0.2 && k < 0.45) self.flash = performance.now() + 80; });
          v.hop = 0;
        } else if (s.ma === 'chuan-bi') {                            // nhện: nhịp 1 của bước, nhấc chân (đổi khung `buoc`), chưa rời ô; s.nhay: ngồi thụp xuống lấy đà trước cú nhảy
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) { v.hop = s.nhay ? -Math.sin(k * Math.PI) * 1.8 : Math.sin(k * Math.PI) * 1; });
          v.hop = 0;
        } else if (s.ma === 'tay-vuong') {                           // tay hạ sát đất: xe rung tại chỗ, tay nháy đỏ
          var tNow = performance.now();
          v.tayDo = tNow + per + 700; v.choang = tNow + per + 1100; this.matSuKien('dam', 750);
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) { v.dx = Math.sin(k * Math.PI * 7) * (1 - k) * 2.5; });
          v.dx = 0; v.chan = 0;
        } else {
          await ngu(per);
        }
      }
      if (my !== this.rid) return;
      if (v.dr) evs.forEach(function (s) { if (s.ma === 'bay-qua') self.giuQuat(s); });             // drone vừa bay qua rào / băng / vật / thùng: gió cánh quạt thổi bụi
      evs.forEach(function (s) { if (s.ma === 'qua-diem' && s.o) self.diQuaLen(s.o); });                // bóng mờ: xe vừa tới ô ◆ (lần đầu): ◆ sáng lên
      if (evs.some(function (s) { return s.ma === 'toi-co' || s.ma === 'xong-dua-vat' || s.ma === 'xong-day-thung' || s.ma === 'xong-to-hinh' || s.ma === 'nut-doi' || (s.ma === 'dat-vat' && s.o && self.dichTaiO(s.o.x, s.o.y)); })) this.matSuKien('vui', 1000);   // mắt cười (gói V4)
      if (evs.some(function (s) { return s.ma === 'doi-thu-thang'; })) { this.baoHieu('!', 1800); v.choang = performance.now() + 1400; }
      // đồng bộ với vết (an toàn nếu có sự kiện lạ)
      if (laNhen && e.robot && e.robot.chan !== undefined) v.co = e.robot.chan === 'co';            // nhện: chân co / duỗi đúng vết
      v.x = e.robot.x; v.y = e.robot.y; v.d = laNhen ? (this.cfg.bd.huong || 0) : e.robot.huong; v.hop = 0; v.dx = 0; v.dy = 0; v.chan = 0; v.gocMem = 0;
      v.goc = laXich && e.robot.quayDo ? (e.robot.quayDo > 0 ? 1 : -1) * Math.PI / 4 : 0;       // xích còn quay dở: nghiêng 45° chờ nhịp kế   // nhện không quay: mặt trước (cạnh gắn tay) cố định theo batDau.huong
      if (e.thung) this.dongBoThung(e.thung);
      if (v.nc) {                                                       // nam châm: đưa vật (dính / nằm) và trạng thái bật về đúng vết
        v.nc.ang = null; if (e.robot.namCham) { v.nc.bat = !!e.robot.namCham.bat; v.nc.cuc = e.robot.namCham.cuc || null; }
        this.dongBoVat(e.vat);
        for (var oi = 0; oi < this.objs.length; oi++) { this.objs[oi].bay = null; this.objs[oi].nang = 0; this.objs[oi].dx = 0; this.objs[oi].dy = 0; }
      }
      if (v.dr && e.robot) { v.dr.pin = e.robot.pin === undefined ? v.dr.pin : e.robot.pin; if (v.dr.pin !== null && v.dr.pin !== undefined && v.dr.pin > v.dr.pinMax) v.dr.pinMax = v.dr.pin; }       // drone: pin đúng vết ở cuối nhịp
      this.dongBoSung(e);                                               // súng hơi: nút, cửa, băng chuyền tắt, số nhịp, số đạn
      if (v.nem) {                                                      // máy ném: đưa vật (nằm / trong rổ / vỡ) và tầm về đúng vết
        v.nem.ang = null; v.nem.dang = 0; if (e.robot.nem) v.nem.tam = e.robot.nem.tam;
        this.dongBoVat(e.vat);
        for (var ni = 0; ni < this.objs.length; ni++) { this.objs[ni].nb = null; this.objs[ni].nang = 0; this.objs[ni].dx = 0; this.objs[ni].dy = 0; }
      }
      if (e.robot.tay) v.tay = { tuThe: e.robot.tay.tuThe, kep: e.robot.tay.kep, cam: e.robot.tay.cam, xoay: e.robot.tay.xoay };
      if (v.son) {                                                      // máy sơn: nét tô cuối nhịp (ô xe vừa tới) lóe lên, rồi lớp đã tô và đầu sơn đúng vết
        evs.forEach(function (s) { if (s.ma === 'to-o' && s.kieu === 'net') self.toO(s.o, s.mau); });
        if (e.daSon) { this.daSon = {}; e.daSon.forEach(function (q) { self.daSon[q.x + ',' + q.y] = q.mau; }); }
        if (e.robot.son) { v.son.ha = !!e.robot.son.ha; v.son.mau = e.robot.son.mau; }
        if (evs.some(function (s) { return s.ma === 'to-thua' || s.ma === 'son-goi-lai'; })) this.baoHieu('!', 1300);
      }
      v.camBien = null;
      this.wh.L = 0; this.wh.R = 0;
    },

    /** Đưa vị trí các thùng nặng về đúng vết (theo id). */
    dongBoThung: function (ds) {
      for (var i = 0; i < ds.length; i++) {
        var o = this.thungTheoId(ds[i].id);
        if (o) { o.x = ds[i].x; o.y = ds[i].y; o.dx = 0; o.dy = 0; }
      }
    },

    /** Xích: chương trình dừng khi còn quay dở thì phần quay dở mất: xoay ngược về thẳng kèm dấu '?'. */
    quayVe: async function () {
      var v = this.vis, my = this.rid, g0 = v ? v.goc : 0;
      if (!g0) return;
      this.baoHieu('?', 1400);
      await this.tween(260, my, function (k) { v.goc = g0 * (1 - ease(k)); });
      if (my === this.rid) v.goc = 0;
    },

    /**
     * Áp phần TAY của một nhịp: tay đổi tư thế (qua một khung nửa chừng), kẹp / thả, cập nhật vật và hiệu ứng.
     * Trả về thời gian còn lại cho bánh chạy, hoặc -1 nếu sân bị datLai() giữa chừng.
     */
    apTay: async function (e, ms, my) {
      var v = this.vis, tm = e.robot.tay, cu = v.tay, con = ms, evs = e.suKien || [];
      var doiXoay = tm.xoay !== undefined && (cu.xoay || 'truoc') !== tm.xoay;
      var xoayBi = evs.some(function (q) { return q.ma === 'tay-xoay-ket'; });
      if (doiXoay) {                                                 // tay xoay: (a1) nâng, (a2) khớp xoay một nấc (tay quay quanh khớp, vật trong kẹp đi theo), rồi mới (a3) hạ
        var g0 = GOC_XOAY[cu.xoay || 'truoc'], g1 = GOC_XOAY[tm.xoay], tq = Math.min(ms * 0.3, 260);
        if (cu.tuThe === 'duoi' && tm.tuThe === 'tren') {
          v.tay = { tuThe: 'giua', kep: cu.kep, cam: cu.cam, xoay: cu.xoay };
          await ngu(ms * 0.08); con -= ms * 0.08;
          if (my !== this.rid) return -1;
        }
        await this.tween(tq, my, function (k) { v.tay = { tuThe: cu.tuThe === 'duoi' && tm.tuThe === 'tren' ? 'tren' : cu.tuThe, kep: cu.kep, cam: cu.cam, xoay: tm.xoay, goc: g0 + (g1 - g0) * ease(k) }; });
        con -= tq;
        if (my !== this.rid) return -1;
        v.tay = { tuThe: cu.tuThe === 'duoi' && tm.tuThe === 'tren' ? 'tren' : cu.tuThe, kep: cu.kep, cam: cu.cam, xoay: tm.xoay };
        cu = v.tay;
      } else if (xoayBi && tm.xoay !== undefined) {                  // khớp kẹt vì tay đang hạ: tay giật nhẹ tại chỗ, dấu ?
        this.baoHieu('?', 1300); v.kepRung = performance.now() + 380;
      }
      var doiThe = cu.tuThe !== tm.tuThe, doiKep = cu.kep !== tm.kep || (cu.cam !== null) !== (tm.cam !== null);
      if (doiThe) {
        v.tay = { tuThe: 'giua', kep: cu.kep, cam: cu.cam, xoay: tm.xoay };
        await ngu(ms * 0.14); con -= ms * 0.14;
        if (my !== this.rid) return -1;
      }
      var nhat = evs.filter(function (s) { return s.ma === 'nhat-vat'; })[0], dat = evs.filter(function (s) { return s.ma === 'dat-vat'; })[0], vo = evs.filter(function (s) { return s.ma === 'vat-vo'; })[0];
      var ev1 = nhat || dat || vo, ob = ev1 && ev1.o ? this.objTheoId(ev1.id) : null, tr = ms * 0.65;
      if (ob && this.lopOK) {                                    // vật TRƯỢT giữa ô trước mặt và kẹp (nhặt: vào kẹp; đặt / thả vỡ: ra khỏi kẹp xuống ô trước mặt)
        ob.tx = ev1.o.x; ob.ty = ev1.o.y; con -= tr;
        if (nhat) {
          v.tay = { tuThe: tm.tuThe, kep: true, cam: nhat.id, xoay: tm.xoay }; ob.tt = 'anim'; ob.k = 0;                   // hai càng khép lại ôm vật trong lúc vật trượt vào
          await this.tween(tr, my, function (k) { ob.k = ease(k); });
        } else {
          var mo = false;
          v.tay = { tuThe: tm.tuThe, kep: cu.kep, cam: cu.cam, xoay: tm.xoay }; ob.tt = 'anim'; ob.k = 1;
          await this.tween(tr, my, function (k) { ob.k = 1 - ease(k); if (k > 0.4 && !mo) { mo = true; v.tay = { tuThe: tm.tuThe, kep: tm.kep, cam: tm.cam, xoay: tm.xoay }; } });       // vật rời kẹp, rồi hai càng mở
        }
        if (my !== this.rid) return -1;
        ob.k = nhat ? 1 : 0;
      }
      v.tay = { tuThe: tm.tuThe, kep: tm.kep, cam: tm.cam, xoay: tm.xoay };
      this.dongBoVat(e.vat);
      this.hieuUngTay(evs);
      if (!ob && (doiThe || doiKep)) { await ngu(ms * 0.1); con -= ms * 0.1; if (my !== this.rid) return -1; }
      return Math.max(ms * 0.3, con);
    },
    /** Đưa vị trí / trạng thái các vật về đúng vết (theo id). */
    dongBoVat: function (ds) {
      if (!ds) return;
      var now = performance.now();
      for (var i = 0; i < ds.length; i++) {
        var it = ds[i], o = null;
        for (var j = 0; j < this.objs.length; j++) if (this.objs[j].id === it.id) { o = this.objs[j]; break; }
        if (!o) continue;
        var cu = o.tt;
        o.x = it.x; o.y = it.y; o.tt = it.trangThai === 'vo' ? 'vo' : it.trangThai === 'cam' ? 'cam' : it.trangThai === 'ro' ? 'ro' : 'dat';
        if (o.tt === 'vo' && cu !== 'vo') o.voLuc = now;
      }
    },
    /** Hiệu ứng tức thì của các sự kiện tay: nhặt, đặt, vỡ (mảnh vỡ rồi mờ), kẹp hụt (?), ô đã có vật (!). */
    hieuUngTay: function (evs) {
      for (var i = 0; i < evs.length; i++) {
        var s = evs[i], o = s.o, px = o ? o.x * T + 7 : 0, py = o ? o.y * T + 7 : 0;
        if (s.ma === 'nhat-vat' && o) this.burst(px, py, 8, [BM.sanCam, BM.sanTrang, BM.sanCamToi], 0.7);
        else if (s.ma === 'dat-vat' && o) this.burst(px, py + 3, 6, [BM.sanTrang, BM.sanXanhLa], 0.5);
        else if (s.ma === 'vat-vo' && o) {
          this.burst(px, py, 16, [BM.sanCamToi, BM.sanNauSang, BM.sanCam, BM.sanNauV1], 1.7, 2, true); this.kieuHat(16, 'manh');
          this.chopDo(160);
        } else if (s.ma === 'kep-hut') {
          this.baoHieu('?', 1300);
          var oh = (s.lyDo === 'tay-nang' && o) ? this.vatTaiO(o.x, o.y) : null;                          // tay còn nâng: vật ngay trước mặt rung nhẹ như bị chạm hụt
          if (oh) oh.rung = performance.now() + 450;
        }
      }
    }
  };

  /** Vật trong ảnh nhỏ của sân: ô vuông nhỏ giữa ô; gỗ nâu, SẮT xám xanh có viền sáng; mv = tên màu của vật (dải ngang). */
  function thuVat(g, px, py, s, mv, sat, cuc) {
    var q = s >> 2, w2 = s >> 1;
    g.fillStyle = cuc ? (cuc === 'N' ? BM.sanDoV6 : BM.sanLamToiV7) : sat ? BM.sanLamV16 : BM.sanCamToi; g.fillRect(px + q, py + q, w2, w2);          // vật nam châm: khối đỏ (chữ N) hay xanh dương (chữ S), một vạch trắng ở giữa
    if (cuc) { g.fillStyle = BM.sanTrangV1; g.fillRect(px + q + Math.max(1, s >> 4), py + (s >> 1) - Math.max(1, s >> 5), Math.max(2, w2 - 2 * Math.max(1, s >> 4)), Math.max(1, s >> 4)); }
    if (sat) { g.fillStyle = BM.sanTrangV6; g.fillRect(px + q, py + q, w2, Math.max(1, s >> 4)); g.fillRect(px + q, py + q, Math.max(1, s >> 4), w2); g.fillStyle = BM.sanLamToiV8; g.fillRect(px + q + w2 - Math.max(1, s >> 4), py + q, Math.max(1, s >> 4), w2); g.fillRect(px + q, py + q + w2 - Math.max(1, s >> 4), w2, Math.max(1, s >> 4)); }
    if (mv) { g.fillStyle = Ve.MAU[mv].s; g.fillRect(px + q, py + (s >> 1) - 1, w2, Math.max(2, s >> 3)); }
  }
  /** Ảnh nhỏ, chế độ vector (gói V2): vật o = { chat, mau, cuc } (ve-vector-ky-hieu.js vatCua) thân nửa ô giữa ô như thuVat (thân vector chiếm 76% hộp). */
  function thuVatVec(g, px, py, s, o) {
    var hv = VeVector.vatCua(o), h = s * 0.5 / 0.76;
    g.drawImage(VeVector.vat(hv[0], Math.max(1, Math.round(h)), hv[1]), px + (s - h) / 2, py + (s - h) / 2, h, h);
  }
  /** Ảnh nhỏ, chế độ vector (gói V2): mọi ô vẽ theo bảng VeVector.KY_HIEU (lớp ô dưới trước, rồi vật nằm sẵn), trạng thái lúc đầu màn như thuSan pixel:
   *  sàn màu (lớp màu / ký hiệu r g b y) thay ô sàn, ô đích trên sàn màu mang màu, nút bắn bật sẵn, cửa nhịp theo pha, rào nối theo ô kề; vật o / X theo lớp màu / chất. */
  function thuOVec(g, rows, w, h, s, mauO, vm, vc, cuaNhip, nutBat) {
    var x, y, ch, px, py, i, kh, lop, ma, st;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      ch = rows[y][x]; px = x * s; py = y * s; kh = VeVector.KY_HIEU[ch] || VeVector.KY_HIEU['.'];
      var mn = mauO && mauO[y][x] && '#S=NCcnu'.indexOf(ch) < 0 && BANG[ch] === undefined ? mauO[y][x] : null;
      for (i = 0; i < kh.o.length; i++) {
        lop = kh.o[i]; ma = lop[0]; st = lop[1] ? Object.assign({}, lop[1]) : undefined;
        if (ma === 'san' && mn) { ma = 'san-mau'; st = { mau: mn }; }
        else if (ma === 'san' && (x + y) & 1) st = { le: 1 };                    // gói V4: sàn bàn cờ hai tông
        else if (ma === 'dich' && mn) st.mau = mn;
        else if (ma === 'nut-ban' && nutBat[x + ',' + y]) st.bat = true;
        else if (ma === 'cua' && cuaNhip[x + ',' + y]) { var cn = cuaNhip[x + ',' + y], chu = cn.mo + cn.dong; st.k = (cn.pha % chu) < cn.mo ? 1 : 0; st.nhip = { n: Math.min(chu, 6), mo: cn.mo, p: cn.pha % chu }; }
        else if (ma === 'rao') st.mask = (x > 0 && rows[y][x - 1] === '=' ? 1 : 0) | (x < w - 1 && rows[y][x + 1] === '=' ? 2 : 0) | (y > 0 && rows[y - 1][x] === '=' ? 4 : 0) | (y < h - 1 && rows[y + 1][x] === '=' ? 8 : 0);
        if (ma === 'tuong' && s < 24) {                                         // ảnh nhỏ thật (vài px mỗi ô): khối tường trắng lẫn với sàn trắng → tô phẳng xám chàm + vạch đèn cyan, đọc ra ngay đâu là tường
          g.fillStyle = BM.vecTuongVien; g.fillRect(px, py, s, s);
          g.fillStyle = BM.vecDen; g.fillRect(px + s * 0.25, py + s * 0.3, s * 0.5, Math.max(1, s * 0.12));
          continue;
        }
        g.drawImage(VeVector.o(ma, s, st), px, py, s, s);
      }
      (kh.vat || []).forEach(function (v) {
        if (v[0] === 'thung-nang') { g.drawImage(VeVector.vat('thung-nang', s), px, py, s, s); return; }
        var cuc = vc && vc[y] && (vc[y][x] === 'N' || vc[y][x] === 'S') ? vc[y][x] : null;
        thuVatVec(g, px, py, s, { chat: cuc ? 'nam-cham' : vc && vc[y] && vc[y][x] === 's' ? 'sat' : 'go', cuc: cuc, mau: vm && vm[y] ? MAU_KY[vm[y][x]] : null });
      });
    }
  }

  /**
   * Ảnh nhỏ của một sân (cho dải chọn sân): vẽ lên canvas cv, mỗi ô vuông nguyên px CSS (vừa khung rong × cao px CSS), hai px canvas mỗi px CSS.
   * rows = hàng sân của lõi, bd = { x, y, huong } ô xuất phát (chấm xanh lơ có mũi chỉ hướng mặt). Không có luật chơi, chỉ để nhận ra sân.
   * Như sân chính (Field.vungCat): bỏ các hàng / cột ở mép toàn tường '#' trơn (ô xuất phát và vật thêm giữ lại), nên ảnh nhỏ cùng hình với sân đang vẽ.
   */
  function thuSan(cv, rows, bd, rong, cao, lopMau) {
    var w = rows[0].length, h = rows.length, gx0 = w, gy0 = h, gx1 = -1, gy1 = -1, xx, yy, giuO = {};
    if (bd) giuO[bd.x + ',' + bd.y] = 1;
    ((lopMau && lopMau.vatThem) || []).forEach(function (o) { giuO[Math.floor(o.x) + ',' + Math.floor(o.y)] = 1; });
    for (yy = 0; yy < h; yy++) for (xx = 0; xx < w; xx++) {
      if (rows[yy][xx] === '#' && !giuO[xx + ',' + yy]) continue;
      if (xx < gx0) gx0 = xx; if (xx > gx1) gx1 = xx; if (yy < gy0) gy0 = yy; if (yy > gy1) gy1 = yy;
    }
    if (gx1 < 0) { gx0 = 0; gy0 = 0; gx1 = w - 1; gy1 = h - 1; }
    var vecT = !!(window.VeVector && VeVector.bat() && VeVector.KY_HIEU);                 // chế độ vector (gói V2): ô / vật vẽ bằng hình vector, canvas theo pixel thiết bị (ít nhất 2 px canvas mỗi px CSS như cũ)
    var vw = gx1 - gx0 + 1, vh = gy1 - gy0 + 1, c = Math.max(2, Math.floor(Math.min((rong || 29) / vw, (cao || 28) / vh))), q = vecT ? Math.max(2, Math.ceil(window.devicePixelRatio || 1)) : 2, s = c * q;
    cv.width = vw * s; cv.height = vh * s; cv.style.width = (vw * c) + 'px'; cv.style.height = (vh * c) + 'px';
    var g = cv.getContext('2d'), x, y, ch, px, py;
    g.translate(-gx0 * s, -gy0 * s);                                         // vẽ theo tọa độ ô đầy đủ, canvas chỉ là cửa sổ
    var mauO = dungLopMau(rows, lopMau && lopMau.mau), vm = lopMau && lopMau.vatMau, vc = lopMau && lopMau.vatChat;       // sân có ô màu / vật màu (chương cảm biến màu), chất vật (chương nam châm)
    var them = (lopMau && lopMau.vatThem) || [], cuaNhip = {}, nutBat = {};
    ((lopMau && lopMau.nutBat) || []).forEach(function (o) { nutBat[o.x + ',' + o.y] = true; });                          // nút bật sẵn: ảnh nhỏ vẽ nút xanh + viền cam (nóng)
    ((lopMau && lopMau.cuaNhip) || []).forEach(function (cn) { cuaNhip[cn.x + ',' + cn.y] = cn; });                      // cửa nhịp: ảnh nhỏ vẽ trạng thái lúc đầu (theo pha), khung xanh lơ                                                                          // vật thêm ngoài ký hiệu (vd trên băng chuyền)
    if (vecT) thuOVec(g, rows, w, h, s, mauO, vm, vc, cuaNhip, nutBat);
    else for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      ch = rows[y][x]; px = x * s; py = y * s;
      if (ch === '#') { g.fillStyle = BM.sanLamToiV1; g.fillRect(px, py, s, s); g.fillStyle = BM.sanLamV8; g.fillRect(px, py, s, Math.max(1, s >> 3)); continue; }
      if (ch === '=') {                                                       // hàng rào thấp: sàn xanh + thanh gỗ ngang + cọc (khác ô tường đặc)
        g.fillStyle = BM.sanXanhLaToiV1; g.fillRect(px, py, s, s);
        var rh = Math.max(1, s >> 3), ry = py + (s >> 1) - (rh >> 1);
        g.fillStyle = BM.vienDam; g.fillRect(px, ry - 1, s, rh + 2);
        g.fillStyle = BM.sanCam; g.fillRect(px, ry, s, rh);
        g.fillStyle = BM.vienDam; g.fillRect(px + (s >> 1) - (s >> 3) - 1, py + (s >> 2), (s >> 2) + 2, (s >> 1));
        g.fillStyle = BM.sanCamToi; g.fillRect(px + (s >> 1) - (s >> 3), py + (s >> 2) + 1, s >> 2, (s >> 1) - 2);
        continue;
      }
      if (ch === 'P') {                                                       // ô sạc của drone: sàn xanh + đế thép tối viền xanh lơ + chấm vàng ở giữa (khác ô đích khung vàng, cờ)
        var pm = Math.max(1, s >> 3);
        g.fillStyle = BM.sanXanhLaToiV1; g.fillRect(px, py, s, s);
        g.fillStyle = K_INK; g.fillRect(px + 1, py + 1, s - 2, s - 2);
        g.fillStyle = BM.sanLamToiV2; g.fillRect(px + 1 + pm, py + 1 + pm, s - 2 - 2 * pm, s - 2 - 2 * pm);
        g.fillStyle = BM.sanLamToiV3; g.fillRect(px + (s >> 2) + 1, py + (s >> 2) + 1, s - 2 * ((s >> 2) + 1), s - 2 * ((s >> 2) + 1));
        g.fillStyle = BM.sanNgoc; g.fillRect(px + 1 + pm, py + 1 + pm, s - 2 - 2 * pm, 1);
        g.fillStyle = BM.sanVang; g.fillRect(px + (s >> 1) - 1, py + (s >> 2) + 1, Math.max(2, s >> 3), (s >> 1) - 1);
        continue;
      }
      if (ch === 'N') {                                                       // nút bắn: tường xám + nút tròn đỏ ở giữa (nút bật sẵn: nút xanh, viền cam nóng)
        var nbT = !!nutBat[x + ',' + y];
        g.fillStyle = BM.sanLamToiV1; g.fillRect(px, py, s, s); g.fillStyle = BM.sanLamV8; g.fillRect(px, py, s, Math.max(1, s >> 3));
        if (nbT) { g.fillStyle = BM.sanCamToiV2; g.fillRect(px + (s >> 2) - 1, py + (s >> 2) - 1, (s >> 1) + 2, (s >> 1) + 2); }
        g.fillStyle = K_INK; g.fillRect(px + (s >> 2), py + (s >> 2), s >> 1, s >> 1);
        g.fillStyle = nbT ? BM.sanXanhLaToiV6 : BM.sanDoV7; g.fillRect(px + (s >> 2) + 1, py + (s >> 2) + 1, Math.max(1, (s >> 1) - 2), Math.max(1, (s >> 1) - 2));
        continue;
      }
      if (ch === 'C' || ch === 'c') {                                         // cửa: đóng = khối xám khung vàng; mở = sàn có hai cột khung vàng
        var nhT = cuaNhip[x + ',' + y], moT = nhT ? (nhT.pha % (nhT.mo + nhT.dong)) < nhT.mo : ch === 'c', kh = nhT ? BM.sanXanhLoToiV1 : BM.sanVangV4, cd = Math.max(1, s >> 3);
        g.fillStyle = BM.sanXanhLaToiV1; g.fillRect(px, py, s, s);
        if (!moT) { g.fillStyle = K_INK; g.fillRect(px, py, s, s); g.fillStyle = BM.sanLamV9; g.fillRect(px + cd, py, s - 2 * cd, s); g.fillStyle = K_INK; g.fillRect(px + (s >> 1) - 1, py, 1, s); }
        g.fillStyle = kh; g.fillRect(px, py, cd, s); g.fillRect(px + s - cd, py, cd, s);
        continue;
      }
      var mn = mauO && mauO[y][x] && BANG[ch] === undefined && ch !== 'S' ? mauO[y][x] : null;
      g.fillStyle = mn ? Ve.MAU[mn].n : BANG[ch] !== undefined ? BM.sanLamToiV9 : ch === 'S' ? BM.sanXamToiV4 : BM.sanXanhLaToiV1; g.fillRect(px, py, s, s);
      if (mn) { g.fillStyle = Ve.MAU[mn].t; g.fillRect(px, py, s, 1); g.fillRect(px, py + s - 1, s, 1); g.fillRect(px, py, 1, s); g.fillRect(px + s - 1, py, 1, s); }
      if (ch === 'H' || ch === 'h') { g.fillStyle = BM.sanXamToiV5; g.fillRect(px + (s >> 3), py + (s >> 3), s - (s >> 2), s - (s >> 2)); }
      if (ch === 'M') { g.fillStyle = BM.sanCamV2; g.fillRect(px + (s >> 2), py + (s >> 2), s >> 1, s >> 1); }
      if (BAN_XOAY[ch] !== undefined) { g.fillStyle = BAN_XOAY[ch] > 0 ? BM.sanVangV3 : BM.sanXanhLoV1; g.fillRect(px + (s >> 2), py + (s >> 2), s >> 1, s >> 1); }
      if (ch === '1' || ch === '2') { g.fillStyle = ch === '2' ? BM.sanTimSangV2 : BM.sanXanhLoV6; g.fillRect(px + (s >> 2), py + (s >> 2), s >> 1, s >> 1); }
      if (ch === 'o' || ch === 'X') {
        var mv = vm && vm[y] ? MAU_KY[vm[y][x]] : null, sat = !!(vc && vc[y] && vc[y][x] === 's'), cucV = vc && vc[y] && (vc[y][x] === 'N' || vc[y][x] === 'S') ? vc[y][x] : null;
        thuVat(g, px, py, s, mv, sat, cucV);
      }
      if (ch === 'D' || ch === 'X' || ch === 'h') { g.strokeStyle = mn ? Ve.MAU[mn].vi : BM.sanVang; g.lineWidth = Math.max(1, s >> 3); g.strokeRect(px + g.lineWidth / 2, py + g.lineWidth / 2, s - g.lineWidth, s - g.lineWidth); }
      if (ch === 'F') {
        g.fillStyle = BM.sanTrang; g.fillRect(px + (s >> 1) - 1, py + 1, Math.max(1, s >> 3), s - 2);
        g.fillStyle = BM.sanDoV2; g.fillRect(px + (s >> 1), py + 1, s >> 1, s >> 1);
      }
    }
    var hinhT = dungHinh(lopMau && lopMau.hinh), sonT = dungHinh(lopMau && lopMau.sonBanDau), vien = Math.max(1, s >> 3);       // máy sơn: ô hình mờ (khung màu) và ô sơn sẵn (sơn đặc)
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var mh = hinhT && hinhT[y] ? hinhT[y][x] : null, ms = sonT && sonT[y] ? sonT[y][x] : null;
      if (ms) { g.fillStyle = K_INK; g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2); g.fillStyle = MAU_VIEN[ms]; g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4); }
      else if (mh) { g.fillStyle = MAU_VIEN[mh]; g.fillRect(x * s, y * s, s, vien); g.fillRect(x * s, y * s + s - vien, s, vien); g.fillRect(x * s, y * s, vien, s); g.fillRect(x * s + s - vien, y * s, vien, s); }
    }
    them.forEach(function (o) {
      var ox = Math.floor(o.x), oy = Math.floor(o.y);
      if (ox < 0 || oy < 0 || ox >= w || oy >= h || rows[oy][ox] === '#' || rows[oy][ox] === 'o' || rows[oy][ox] === 'X') return;
      if (vecT) thuVatVec(g, ox * s, oy * s, s, { chat: o.chat, cuc: o.cuc, mau: chuanMau(o.mau) });
      else thuVat(g, ox * s, oy * s, s, chuanMau(o.mau), o.chat === 'sat', o.chat === 'nam-cham' ? o.cuc : null);
    });
    if (bd && vecT) {                                                         // vector: chấm tròn màu R1 viền chàm, chấm trắng chỉ hướng mặt
      var vx = bd.x * s + s / 2, vy = bd.y * s + s / 2, vr = s * 0.3;
      g.beginPath(); g.arc(vx, vy, vr, 0, Math.PI * 2); g.fillStyle = BM.vecDoiR1; g.fill(); g.lineWidth = Math.max(1, s / 14); g.strokeStyle = BM.vecVien; g.stroke();
      g.beginPath(); g.arc(vx + DX[bd.huong || 0] * vr * 0.55, vy + DY[bd.huong || 0] * vr * 0.55, Math.max(1, vr * 0.32), 0, Math.PI * 2); g.fillStyle = BM.vecVo; g.fill();
    } else if (bd) {
      var cx = bd.x * s + s / 2, cy = bd.y * s + s / 2, r = s * 0.28;
      g.fillStyle = BM.sanXanhLo; g.fillRect(Math.round(cx - r), Math.round(cy - r), Math.round(r * 2), Math.round(r * 2));
      g.fillStyle = BM.vienDam; g.fillRect(Math.round(cx + DX[bd.huong || 0] * r - 1), Math.round(cy + DY[bd.huong || 0] * r - 1), 2, 2);
    }
  }

  /** Nhãn ⚠ nhỏ ở mép trên khung sân (màn có `canhBao`, vd. "Dây bánh trái đấu ngược"). Nằm DƯỚI lớp phủ robot (z-index 1 < 2) nên robot, tay, dấu nổi không bao giờ bị che.
   *  ffr = khung chứa canvas sân (.ffr); chu rỗng / null thì ẩn. */
  function datCanhBao(ffr, chu) {
    if (!ffr) return;
    var el = ffr.querySelector('.canh-bao');
    if (!chu) { if (el) el.style.display = 'none'; return; }
    if (!el) {
      el = document.createElement('div'); el.className = 'canh-bao'; el.setAttribute('data-canh-bao', '1');
      var ic = document.createElement('span'); ic.className = 'cb-ic'; ic.appendChild(Ve.ico('canhbao', 1, { fill: BM.sanVang, line: BM.vienDam }));
      var tx = document.createElement('span'); tx.className = 'cb-chu';
      el.appendChild(ic); el.appendChild(tx); ffr.appendChild(el);
    }
    el.style.display = ''; el.querySelector('.cb-chu').textContent = chu;
  }

  /* ---- MẮT LED BIỂU CẢM CHO CẢ 5 MẪU THÂN (hai-banh, xich, nhen, omni, drone) — thiết kế tách rời, bật/tắt tức thì ---- */
  var KINH_THAN = {
    'hai-banh': { x: 7, y: 6, w: 10, h: 5, lx: 8, rx: 13, ey: 7, ew: 3, eh: 2, may: [[8, 6], [15, 6]] },
    xich:       { x: 7, y: 10, w: 10, h: 5, lx: 8, rx: 13, ey: 11, ew: 3, eh: 2 },
    nhen:       { x: 8, y: 10, w: 8, h: 5, lx: 9, rx: 13, ey: 11, ew: 2, eh: 2, may: [[9, 10], [15, 10]] },
    'nhen-co':  { x: 8, y: 11, w: 8, h: 4, lx: 9, rx: 13, ey: 12, ew: 2, eh: 2, may: [[9, 11], [15, 11]] },
    omni:       { x: 8, y: 10, w: 8, h: 4, lx: 9, rx: 13, ey: 11, ew: 2, eh: 2 },
    drone:      { x: 8, y: 9, w: 8, h: 5, lx: 9, rx: 13, ey: 10, ew: 2, eh: 2, gocSang: [8, 9] }
  };
  function coMatDong() {
    if (!SanVe.dungMat) return false;
    if (typeof window !== 'undefined' && window.Luu && Luu.docCaiDat && Luu.docCaiDat().mat === false) return false;
    return true;
  }
  /**
   * Vẽ đôi mắt LED biểu cảm lên canvas `g` quanh tâm thân `(cx, cy)` với tỉ lệ `p` (px thiết bị / px part).
   * Khớp từng pixel với tấm part 24×24 sau khi xoay theo hướng `huong` (0 lên, 1 phải, 2 xuống, 3 trái).
   */
  function veMatTam(g, cx, cy, p, cauHinh, st, huong, now) {
    if (!p || p <= 0) return;
    cauHinh = cauHinh || {}; st = st || {};
    var than = cauHinh.than || 'hai-banh';
    var k = KINH_THAN[than === 'nhen' && st.co ? 'nhen-co' : than] || KINH_THAN['hai-banh'];
    var h = ((than === 'nhen' && !cauHinh.tay) || than === 'drone') ? 0 : (((huong || 0) % 4 + 4) % 4);
    var coCam = (cauHinh.camBien || []).some(function (c) { return c && c.ma === 'camera'; });

    function pxB(bx, by, col) {
      var dx = h === 0 ? bx - 12 : h === 1 ? 11 - by : h === 2 ? 11 - bx : by - 12;
      var dy = h === 0 ? by - 12 : h === 1 ? bx - 12 : h === 2 ? 11 - by : 11 - bx;
      var x0 = Math.round(cx + dx * p), y0 = Math.round(cy + dy * p);
      var x1 = Math.round(cx + (dx + 1) * p), y1 = Math.round(cy + (dy + 1) * p);
      g.fillStyle = col;
      g.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    }
    function rectB(x, y, w, hh, col) {
      for (var j = 0; j < hh; j++) for (var i = 0; i < w; i++) pxB(x + i, y + j, col);
    }

    // 1. Nền kính tối (xóa mắt tĩnh để vẽ mắt động; giữ chấm chân mày camera nếu có)
    rectB(k.x, k.y, k.w, k.h, BM.sanLamToiV10);
    if (k.gocSang) pxB(k.gocSang[0], k.gocSang[1], BM.sanLamV17);
    if (coCam && k.may) k.may.forEach(function (m) { pxB(m[0], m[1], BM.sanXanhLo); });

    var lx = k.lx, rx = k.rx, ey = k.ey, ew = k.ew;
    // 2. Biểu cảm CHOÁNG / VA CHẠM (> <)
    if (st.choang) {
      var cChoang = ((now / 120) | 0) & 1 ? BM.sanVang : BM.sanDoSang;
      if (k.h >= 5) {
        var yC = k.y + 1;
        pxB(lx, yC, cChoang); pxB(lx + ew - 1, yC + 1, BM.sanTrangV1); pxB(lx, yC + 2, cChoang);
        pxB(rx + ew - 1, yC, cChoang); pxB(rx, yC + 1, BM.sanTrangV1); pxB(rx + ew - 1, yC + 2, cChoang);
      } else {
        pxB(lx, ey, cChoang); pxB(lx + ew - 1, ey, BM.sanTrangV1); pxB(lx, ey + 1, cChoang);
        pxB(rx + ew - 1, ey, cChoang); pxB(rx, ey, BM.sanTrangV1); pxB(rx + ew - 1, ey + 1, cChoang);
      }
      return;
    }
    // 3. Biểu cảm THẮNG MÀN (^ ^ mắt cười)
    if (st.mung) {
      var nhay = ((now / 140) | 0) & 1;
      var cVui = nhay ? BM.sanTrangV1 : BM.sanXanhLo, cVien = BM.sanNgocToi;
      [lx, rx].forEach(function (ex) {
        if (ew >= 3) {
          pxB(ex + 1, ey, cVui); pxB(ex, ey + 1, cVien); pxB(ex + 2, ey + 1, cVien);
        } else {
          pxB(ex, ey, cVui); pxB(ex + 1, ey, cVui); pxB(ex, ey + 1, cVien); pxB(ex + 1, ey + 1, cVien);
        }
      });
      return;
    }
    // 4. Biểu cảm THẮC MẮC '?' hoặc GIẬT MÌNH '!'
    if (st.bao === '?') {
      rectB(lx, ey + 1, ew, 1, BM.sanXanhLo);
      rectB(rx, ey, ew, 2, BM.sanXanhLo); pxB(rx, ey, BM.sanTrangV1);
      return;
    }
    if (st.bao === '!') {
      rectB(lx, ey, ew, 2, BM.sanVangV1); pxB(lx, ey, BM.sanTrangV1);
      rectB(rx, ey, ew, 2, BM.sanVangV1); pxB(rx, ey, BM.sanTrangV1);
      return;
    }
    // 5. Đang đọc cảm biến: mắt sáng rực
    if (st.quet) {
      [lx, rx].forEach(function (ex) {
        rectB(ex, ey, ew, 2, BM.sanXanhLo);
        rectB(ex, ey, Math.max(1, ew - 1), 1, BM.sanTrangV1);
      });
      return;
    }
    // 6. Bình thường / Đang chạy: chớp mắt tự nhiên khi đứng yên + con ngươi liếc theo hướng đi
    var pha = (now + (st.xe || 0) * 970) % 3200;
    if (!st.chay && pha > 3050) {
      rectB(lx, ey + 1, ew, 1, BM.sanXanhLoToiV3);
      rectB(rx, ey + 1, ew, 1, BM.sanXanhLoToiV3);
      return;
    }
    var gx = st.re || 0, gy = st.chay ? 0 : 1;
    if (!st.chay && !gx) {
      var liec = ((now + (st.xe || 0) * 530) / 1400) | 0;
      gx = liec % 4 === 1 ? 1 : liec % 4 === 3 ? -1 : 0;
    }
    var nenMat = st.chay ? BM.sanXanhLoV7 : BM.sanXanhLoV8;
    [lx, rx].forEach(function (ex) {
      rectB(ex, ey, ew, 2, nenMat);
      var px = ex + (gx > 0 ? ew - 1 : gx < 0 ? 0 : Math.min(1, ew - 1));
      var py = ey + (gy > 0 ? 0 : 0);
      pxB(px, py, BM.sanTrangV1);
      if (ew >= 3 && gx === 0) pxB(ex, ey + 1, BM.sanXanhLoToiV4);
    });
  }

  (function loop(now) { FIELDS.forEach(function (f) { f.draw(now || performance.now()); }); requestAnimationFrame(loop); })();

  var SanVe = {
    Field: Field, ngu: ngu, ease: ease, DX: DX, DY: DY, thuSan: thuSan, datCanhBao: datCanhBao,
    MAU_XE: MAU_XE, SON_XE: SON_XE, KINH_THAN: KINH_THAN,
    coMatDong: coMatDong, veMatTam: veMatTam,
    dungMat: !/[?&]mat=0/.test((typeof location !== 'undefined' && location.search) || '')
  };
  window.SanVe = SanVe;
})();
