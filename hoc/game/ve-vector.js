var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve-vector.js — "Robot Chấn Hưng": BỘ VẼ VECTOR (window.VeVector), gói V1 (27/10).
   Chạy song song với bộ vẽ pixel (ve.js / part/), bật bằng công tắc (mặc định PIXEL):
     ?ve=vector trên địa chỉ (hay ?ve=pixel để ép pixel), hoặc đã lưu VeVector.luuCheDo('vector') (localStorage duong-hoc:ve-vector).
   Mẫu chuẩn: hoc/hinh-mau/thu-vector.html (thân A, sân lab trắng). Mọi hình vẽ trên hệ toạ độ 100 × 100 của MỘT Ô
   bằng lệnh canvas (không Path2D, để chạy được ở Node với canvas giả), rồi rasterise ra canvas đệm đúng cỡ điểm ảnh thật
   (cạnh ô × devicePixelRatio) nên nét ở mọi cỡ ô, không cần bội số 14. Bộ đệm theo (tên, cỡ, trạng thái, màu đội).

   KHO HÌNH: VeVector.dangKy({ loai: 'o' | 'vat' | 'than' | 'tay' | 'cam-bien', ma, ten, ve(g, s, M), ... })
     o / vat    ve(g, s): vẽ một ô / một vật đầy ô 100 × 100 (vật vẽ ở giữa, cỡ do người gọi quyết khi rasterise).
     than       quay mặt XUỐNG trong ô 100 × 100, tâm thân ở TAM_THAN; oGan: { tay: {x, y}, … } điểm gắn (hệ của thân);
                ve(g, s, M) với M = màu đội { chinh, toi } (mauDoi) cho kính + mắt + chấm ăng-ten.
     tay        diemNeo {x, y}: điểm của tay đặt trùng ổ gắn; gan: 'tay'; ve(g, s, M); vatKep: { y, canh } (vật trong kẹp, hệ của tay, tay nâng).
   ROBOT: VeVector.robot(cauHinh, trangThai, huong, canhPx) → canvas canhPx × canhPx (một ô), tâm thân = tâm canvas, cờ .laPart và .laVector.
     Ghép: thân + tay (dịch oGan − diemNeo) rồi XOAY CẢ NHÓM theo hướng (0 lên, 1 phải, 2 xuống, 3 trái); cả nhóm thu CO_THAN (0,86) như mẫu;
     bóng đổ vẽ lớp riêng KHÔNG xoay. Chỉ cấu hình coDu(cauHinh) (mọi bộ phận đã có hình vector) mới vẽ được; VeRobot rơi về pixel khi thiếu.
   Ô / VẬT: VeVector.o(ma, canhPx, s) · VeVector.vat(ma, canhPx, s) → canvas đệm.
   Node: không có document → CanvasGia ghi lại từng lệnh vẽ (máy kiểm hoc/kiem-ve-vector.mjs đọc .lenh).
   ========================================================================== */
(function (root, factory) { var api = factory(root); if (typeof module === 'object' && module.exports) module.exports = api; root.VeVector = api; })(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  var HE = 100;                                   // cạnh hệ toạ độ gốc của mọi hình (một ô)
  var CO_THAN = 0.86;                             // robot: cả nhóm (thân + tay) thu lại bấy nhiêu để lọt ô, như mẫu
  var TAM_THAN = { x: 50, y: 56 };                // tâm thân trong hệ của thân (đặt vào tâm ô)
  var KHOA_LUU = 'duong-hoc:ve-vector';
  var loiGia = { gocXoay: false, demBoCo: false };   // chỉ máy kiểm --loi-gia bật

  /* ---------------------------------------------------------------- công tắc */
  var cheDo = null;
  function doCheDo() {
    var q = (root.location && root.location.search) || '';
    if (/[?&]ve=vector(?:&|$)/.test(q)) return true;
    if (/[?&]ve=pixel(?:&|$)/.test(q)) return false;
    try { if (root.localStorage && root.localStorage.getItem(KHOA_LUU) === 'vector') return true; } catch (e) { /* không có localStorage */ }
    return false;
  }
  /** Đang ở chế độ vector? Tính một lần (đổi giữa phiên phải nạp lại sân: datCheDo chỉ cho máy kiểm / trang thử). */
  function bat() { if (cheDo === null) cheDo = doCheDo(); return cheDo; }
  function datCheDo(v) { cheDo = v === 'vector' || v === true; return cheDo; }
  /** Ghi lựa chọn cho lần mở sau ('vector' | 'pixel'); có hiệu lực sau khi nạp lại trang. */
  function luuCheDo(v) { try { if (v === 'vector') root.localStorage.setItem(KHOA_LUU, 'vector'); else root.localStorage.removeItem(KHOA_LUU); return true; } catch (e) { return false; } }

  /* ---------------------------------------------------------------- canvas giả cho Node: ghi lại lệnh */
  var THUOC = ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'font', 'textAlign', 'textBaseline', 'miterLimit'];
  var LENH = ['save', 'restore', 'translate', 'rotate', 'scale', 'setTransform', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'drawImage', 'setLineDash', 'clip', 'fillText', 'strokeText'];
  function GradientGia(kieu, thamSo) { this.kieu = kieu; this.thamSo = thamSo; this.stops = []; }
  GradientGia.prototype.addColorStop = function (o, c) { this.stops.push([o, c]); };
  function ContextGia(cv) {
    var self = this; this.canvas = cv; this.lenh = []; this._t = {};
    THUOC.forEach(function (k) { Object.defineProperty(self, k, { get: function () { return self._t[k]; }, set: function (v) { self._t[k] = v; self.lenh.push([k, v]); } }); });
  }
  LENH.forEach(function (k) { ContextGia.prototype[k] = function () { this.lenh.push([k].concat(Array.prototype.slice.call(arguments))); }; });
  ContextGia.prototype.createLinearGradient = function (x0, y0, x1, y1) { var gr = new GradientGia('linear', [x0, y0, x1, y1]); this.lenh.push(['createLinearGradient', gr]); return gr; };
  ContextGia.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) { var gr = new GradientGia('radial', [x0, y0, r0, x1, y1, r1]); this.lenh.push(['createRadialGradient', gr]); return gr; };
  ContextGia.prototype.getTransform = function () { return { a: 1, d: 1 }; };
  ContextGia.prototype.measureText = function (t) { return { width: String(t).length * 6 }; };
  function CanvasGia(w, h) { this.width = w; this.height = h; this.gia = true; this.ctx = new ContextGia(this); this.lenh = this.ctx.lenh; }
  CanvasGia.prototype.getContext = function () { return this.ctx; };
  function taoCanvas(w, h) {
    if (root.document && root.document.createElement) { var c = root.document.createElement('canvas'); c.width = w; c.height = h; return c; }
    return new CanvasGia(w, h);
  }

  /* ---------------------------------------------------------------- bút vẽ trong hệ 100 */
  /** Đường bo góc (x, y, w, h, r) thành path hiện tại (không fill / stroke). */
  function bo(g, x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    g.beginPath(); g.moveTo(x + r, y);
    g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r);
    g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
    g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r);
    g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r);
    g.closePath();
  }
  /** Đường SVG rút gọn (M L C H V Z tuyệt đối, m l c h v tương đối; nhiều hình con) → lệnh path. Đủ cho các hình của mẫu. */
  function duong(g, d) {
    var tk = String(d).match(/[MLCHVZmlchvz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [], i = 0, x = 0, y = 0, sx = 0, sy = 0, c = '', n;
    function so() { return parseFloat(tk[i++]); }
    g.beginPath();
    while (i < tk.length) {
      if (/[A-Za-z]/.test(tk[i])) c = tk[i++];
      switch (c) {
        case 'M': x = so(); y = so(); sx = x; sy = y; g.moveTo(x, y); c = 'L'; break;
        case 'm': x += so(); y += so(); sx = x; sy = y; g.moveTo(x, y); c = 'l'; break;
        case 'L': x = so(); y = so(); g.lineTo(x, y); break;
        case 'l': x += so(); y += so(); g.lineTo(x, y); break;
        case 'H': x = so(); g.lineTo(x, y); break;
        case 'h': x += so(); g.lineTo(x, y); break;
        case 'V': y = so(); g.lineTo(x, y); break;
        case 'v': y += so(); g.lineTo(x, y); break;
        case 'C': n = [so(), so(), so(), so(), so(), so()]; g.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]); x = n[4]; y = n[5]; break;
        case 'c': n = [x + so(), y + so(), x + so(), y + so(), x + so(), y + so()]; g.bezierCurveTo(n[0], n[1], n[2], n[3], n[4], n[5]); x = n[4]; y = n[5]; break;
        case 'Z': case 'z': g.closePath(); x = sx; y = sy; break;
        default: throw new Error('duong: lệnh lạ "' + c + '" trong ' + d);
      }
    }
  }
  function tron(g, cx, cy, r) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.closePath(); }
  function elip(g, cx, cy, rx, ry) { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.closePath(); }
  function to(g, mau) { g.fillStyle = mau; g.fill(); }
  function vien(g, mau, day, dau) { g.strokeStyle = mau; g.lineWidth = day; g.lineCap = dau || 'round'; g.lineJoin = 'round'; g.stroke(); }
  function gradDoc(g, x0, y0, x1, y1, stops) { var gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
  function gradToa(g, cx, cy, r, stops) { var gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); }); return gr; }
  /** Vỏ trắng toả sáng như mẫu (radialGradient cx 42% cy 35% r 70% của hộp (x, y, w, h)). */
  function gradVo(g, x, y, w, h) { return gradToa(g, x + w * 0.42, y + h * 0.35, Math.max(w, h) * 0.7, [[0, BM.vecVo], [0.7, BM.vecVoGiua], [1, BM.vecVoToi]]); }
  function rgba(boBa, a) { return 'rgba(' + boBa + ',' + (+a).toFixed(3) + ')'; }
  var H = { bo: bo, duong: duong, tron: tron, elip: elip, to: to, vien: vien, gradDoc: gradDoc, gradToa: gradToa, gradVo: gradVo, rgba: rgba, VIEN: function () { return BM.vecVien; } };

  /* ---------------------------------------------------------------- kho hình */
  var kho = { o: {}, vat: {}, than: {}, tay: {}, 'cam-bien': {} };
  function dangKy(d) {
    if (!d || !kho[d.loai] || !d.ma || typeof d.ve !== 'function') throw new Error('VeVector.dangKy: cần loai (o | vat | than | tay | cam-bien), ma và ve().');
    if (kho[d.loai][d.ma]) throw new Error('VeVector: hình đã có ' + d.loai + '/' + d.ma);
    if (d.loai === 'than' && !(d.oGan && d.oGan.tay && isFinite(d.oGan.tay.x) && isFinite(d.oGan.tay.y))) throw new Error('VeVector: thân ' + d.ma + ' cần oGan.tay {x, y}.');
    if (d.loai === 'tay' && !(d.diemNeo && isFinite(d.diemNeo.x) && isFinite(d.diemNeo.y) && d.gan)) throw new Error('VeVector: tay ' + d.ma + ' cần diemNeo {x, y} và gan.');
    kho[d.loai][d.ma] = d; return d;
  }
  function lay(loai, ma) { return (kho[loai] && kho[loai][ma]) || null; }
  function ds(loai) { if (!kho[loai]) throw new Error('VeVector: loại lạ ' + loai); return Object.keys(kho[loai]); }
  /** Cấu hình robot { than, tay, camBien } đã có đủ hình vector chưa (thiếu thì VeRobot vẽ bằng pixel). */
  function coDu(cfg) {
    cfg = cfg || {};
    if (!lay('than', cfg.than || 'hai-banh')) return false;
    if (cfg.tay && !lay('tay', cfg.tay)) return false;
    var cb = cfg.camBien || [], i;
    for (i = 0; i < cb.length; i++) if (!cb[i] || !lay('cam-bien', cb[i].ma)) return false;
    return true;
  }

  /* ---------------------------------------------------------------- bộ đệm */
  var dem = {}, soDem = 0, DEM_TOI_DA = 600;
  function nho(khoa, lam) {
    if (loiGia.demBoCo) khoa = khoa.replace(/#\d+/, '#*');
    if (dem[khoa]) return dem[khoa];
    if (++soDem > DEM_TOI_DA) { dem = {}; soDem = 1; }
    return (dem[khoa] = lam());
  }
  function xoaDem() { dem = {}; soDem = 0; }
  function raster(canh, ve) {
    var cv = taoCanvas(canh, canh), g = cv.getContext('2d');
    g.save(); g.scale(canh / HE, canh / HE); ve(g); g.restore();
    return cv;
  }
  /** Ô sân `ma` ('san', 'tuong', 'co'…) cạnh canhPx pixel thật, trạng thái s → canvas đệm; null nếu chưa có hình. */
  function o(ma, canhPx, s) {
    var d = lay('o', ma); if (!d) return null;
    var canh = Math.max(1, Math.round(canhPx));
    return nho('o|' + ma + '|#' + canh + '|' + JSON.stringify(s || {}), function () { return raster(canh, function (g) { d.ve(g, s || {}, H); }); });
  }
  /** Vật `ma` ('thung-go'…) vẽ đầy canvas cạnh canhPx (người gọi quyết cỡ: vật nằm đất, vật trong kẹp…). */
  function vat(ma, canhPx, s) {
    var d = lay('vat', ma); if (!d) return null;
    var canh = Math.max(1, Math.round(canhPx));
    return nho('vat|' + ma + '|#' + canh + '|' + JSON.stringify(s || {}), function () { return raster(canh, function (g) { d.ve(g, s || {}, H); }); });
  }

  /* ---------------------------------------------------------------- màu đội */
  /** son (mã sơn của Part.SON / VeRobot.sonHieuLuc) → { chinh, toi }: '' / 'vang' = R1 xanh Sola; 'lam' = R2 hồng Luna; đối thủ 'do'; bộ sơn mở khoá theo bộ ba SON (nền, tối). */
  var SON_DOI = { do: ['sonDo', 'sonDoToi'], tim: ['sonTim', 'sonTimToi'], ngoc: ['sonNgoc', 'sonNgocToi'], cam: ['sonCam', 'sonCamToi'], trang: ['sonTrang', 'sonTrangToi'], 'hoang-kim': ['sonHoangKim', 'sonHoangKimToi'] };
  function mauDoi(son) {
    if (son === 'lam') return { ma: 'R2', chinh: BM.vecDoiR2, toi: BM.vecDoiR2Toi };
    var k = SON_DOI[son];
    if (k) return { ma: son, chinh: BM[k[0]], toi: BM[k[1]] };
    return { ma: 'R1', chinh: BM.vecDoiR1, toi: BM.vecDoiR1Toi };
  }

  /* ---------------------------------------------------------------- robot: ghép rồi xoay cả nhóm */
  function gocXoay(huong) { huong = ((huong || 0) % 4 + 4) % 4; return ((huong + 2 + (loiGia.gocXoay ? 1 : 0)) % 4) * Math.PI / 2; }   // thân vẽ quay XUỐNG: lên = 180°, phải = 270°, xuống = 0°, trái = 90°
  /** Điểm (x, y) trong hệ của thân → toạ độ pixel trên canvas ô cạnh `canh` sau khi thu CO_THAN và xoay theo hướng. */
  function diemTrenO(pt, huong, canh) {
    var k = (canh / HE) * CO_THAN, a = gocXoay(huong), dx = pt.x - TAM_THAN.x, dy = pt.y - TAM_THAN.y;
    return { x: canh / 2 + (dx * Math.cos(a) - dy * Math.sin(a)) * k, y: canh / 2 + (dx * Math.sin(a) + dy * Math.cos(a)) * k };
  }
  /** Ổ gắn tay của thân (sau xoay) trên canvas ô: để kiểm "tay luôn ở phía hướng mặt". */
  function diemGan(cfg, huong, canh) { var t = lay('than', (cfg && cfg.than) || 'hai-banh'); return t ? diemTrenO(t.oGan.tay, huong, canh) : null; }
  /** Vật trong kẹp: { ahead, n } theo đơn vị "1/100 ô" (VeRobot.tiLeChoO trả p = cạnh ô / 100): tâm vật cách tâm thân `ahead` về phía mũi, cạnh vật `n`. Tay hạ: xa thêm một chút (càng dài ra). */
  function vatKep(cfg, tuThe) {
    var t = lay('than', (cfg && cfg.than) || 'hai-banh'), tay = cfg && cfg.tay ? lay('tay', cfg.tay) : null;
    if (!t || !tay || !tay.vatKep) return null;
    var y = t.oGan.tay.y - tay.diemNeo.y + tay.vatKep.y + (tuThe === 'duoi' ? (tay.vatKep.ha || 0) : 0);
    return { ahead: (y - TAM_THAN.y) * CO_THAN, n: tay.vatKep.canh * CO_THAN };
  }
  function robot(cfg, st, huong, canhPx) {
    cfg = cfg || {}; st = st || {};
    var than = lay('than', cfg.than || 'hai-banh'), tay = cfg.tay ? lay('tay', cfg.tay) : null;
    if (!than || (cfg.tay && !tay) || !coDu(cfg)) return null;
    huong = ((huong || 0) % 4 + 4) % 4;
    var canh = Math.max(1, Math.round(canhPx)), M = mauDoi(cfg.son), sT = st.than || {}, sTay = st.tay || {};
    var khoa = ['robot', than.ma, tay ? tay.ma : '-', huong, '#' + canh, M.ma, JSON.stringify(sT), tay ? JSON.stringify(sTay) : ''].join('|');
    return nho(khoa, function () {
      var cv = taoCanvas(canh, canh), g = cv.getContext('2d'), k = (canh / HE) * CO_THAN;
      g.save(); g.translate(canh / 2, canh / 2); g.scale(k, k);
      elip(g, 2, 5, 33, 31); to(g, rgba(BM.vecVienRgb, 0.12));                 // bóng đổ: lớp riêng, không xoay, lệch phải-dưới (ánh sáng từ trái trên như mọi hình trong game)
      g.rotate(gocXoay(huong)); g.translate(-TAM_THAN.x, -TAM_THAN.y);
      than.ve(g, sT, M, H);
      if (tay) {
        var oG = than.oGan.tay, neo = tay.diemNeo;
        g.save(); g.translate(oG.x - neo.x, oG.y - neo.y); tay.ve(g, Object.assign({}, sTay, { than: than.ma }), M, H); g.restore();
      }
      g.restore();
      cv.laPart = true; cv.laVector = true;
      return cv;
    });
  }

  return {
    HE: HE, CO_THAN: CO_THAN, TAM_THAN: TAM_THAN, H: H, CanvasGia: CanvasGia, taoCanvas: taoCanvas,
    bat: bat, datCheDo: datCheDo, luuCheDo: luuCheDo,
    dangKy: dangKy, lay: lay, ds: ds, coDu: coDu,
    o: o, vat: vat, robot: robot, mauDoi: mauDoi, vatKep: vatKep, gocXoay: gocXoay, diemTrenO: diemTrenO, diemGan: diemGan,
    xoaDem: xoaDem, _loiGia: loiGia
  };
});
