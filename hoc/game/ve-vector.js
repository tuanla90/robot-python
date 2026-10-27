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
   GÓI V3 (27/10): đủ 5 thân (ve-vector-than-*.js), 6 tay (ve-vector-tay-*.js), 6 cảm biến (ve-vector-cam.js), cùng mã / ổ với part/*.js. Thân có đủ ổ như pixel
     (tay, hongTrai, hongPhai, tren + sau cho nòng sau; drone: hongTrai, hongPhai, duoi, tren, bung); cảm biến 'hong' = một cái mỗi hông (doiCam như Part.ghep);
     kiemGhep(cfg) ném ĐÚNG lỗi của Part.ghep cho cấu hình cấm; thân khongHuong (drone) không xoay, bongRieng không có bóng trong hình; tay.tran (tay xoay) → canvas
     rộng hơn ô (tâm vẫn ở giữa); vatXoay / hinhHoc trả hình học tay theo 1/100 ô cho san-ve.js (qua VeRobot). H.kinh / H.angTen: kính + mắt + chấm ăng-ten màu đội dùng chung.
   GÓI V4 (27–28/10): H.kinh vẽ mắt biểu cảm theo s.mat ('thuong' | 'chop1' | 'chop2' | 'lim' | 'dam' | 'xoay' | 'vui' | 'ngac' | 'buon' | 'cho', kèm ':±1' liếc) — nét dày có
     sàn 2 px thiết bị, hình gần hết dải kính; camera KHÔNG còn đổi mắt: khối ống kính ở đuôi (than.oCam, cảm biến oVe 'cam'), diemOngKinh = gốc tia camera; diemCamBien = gốc tia
     cảm biến khác; ổ hông mọi thân nằm trên vỏ (than.vo = hộp vỏ, máy kiểm "dính vỏ"); hiệu ứng trên sân ở VeVector.HU (ve-vector-hieu-ung.js).
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
  /** "GIA ĐÌNH" thân A (gói V3, mọi thân dùng chung): KÍNH dải ngang (gradient màu đội toi → chinh) + HAI MẮT viên thuốc (vecMat, viền chinh) trong hộp (x, y, w, h).
   *  Màu đội chỉ ở đúng hai chỗ này (một gradient, hai viền mắt) + chấm ăng-ten (angTen): máy kiểm đếm. Gói V4: camera KHÔNG còn đổi mắt (camera là khối ống kính ở đuôi,
   *  ve-vector-cam.js); mắt luôn là mắt cảm xúc (s.mat). s.sang (drone đo pin): quầng sáng quanh mắt, mắt trắng rực. */
  function kinh(g, M, x, y, w, h, s) {
    s = s || {};
    bo(g, x, y, w, h, h / 2); g.fillStyle = gradDoc(g, 0, y, 0, y + h, [[0, M.toi], [1, M.chinh]]); g.fill(); vien(g, BM.vecVien, 2.5);
    var ew = w * 0.1522, eh = h * 0.588, ey = y + (h - eh) / 2, mt = String(s.mat || 'thuong').split(':'), kieu = mt[0], liec = +mt[1] || 0;
    var sang = !!(s.camSang || s.sang) && (kieu === 'thuong' || kieu === 'ngac'), dx = liec * ew * 0.38;
    [x + w * 0.2174, x + w * 0.6304].forEach(function (ex0, i) {
      var ex = ex0 + dx, cx = ex + ew / 2, cy = ey + eh / 2, trong = i === 0 ? 1 : -1;   // trong: hướng về giữa mặt theo x (mắt x nhỏ → +x)
      if (veMat(g, M, kieu, cx, cy, w, h, trong)) return;
      if (sang) { bo(g, ex - 2.5, ey - 2.5, ew + 5, eh + 5, (ew + 5) / 2); to(g, rgba(BM.vecMatSangRgb, 0.6)); }
      bo(g, ex, ey, ew, eh, ew / 2); to(g, sang ? BM.vecMatSang : BM.vecMat); vien(g, M.chinh, 1);
    });
  }
  /** Bao nhiêu px thiết bị trên một đơn vị của g lúc này (để nét biểu cảm có SÀN theo px thật: ô sân nhỏ ~24 px vẫn đọc ra). Canvas giả (Node): 1. */
  function pxMoiDv(g) { try { var m = g.getTransform(); return Math.sqrt(Math.abs(m.a * m.d - (m.b || 0) * (m.c || 0))) || 1; } catch (e) { return 1; } }
  /** MẮT BIỂU CẢM (gói V4, sửa theo góp ý 28/10: nét DÀY, hình TO gần hết chiều cao dải kính, quầng sáng cho tương phản) — mắt tâm (cx, cy) trên kính w × h,
   *  hệ của thân (mặt quay xuống: "trên" của khuôn mặt là −y). Nét = max(0,3·h, 2 px thiết bị) (trần 0,55·h), đầu bo tròn; màu lõi sáng vecMat trên quầng vecMatSang.
   *  chop1 nửa nhắm · chop2 khép thành vạch · lim lim dim (nửa dưới) · dam chữ X · xoay "> <" (va nhau) · vui chữ "^" · ngac tròn to có con ngươi · buon vạch xệ ra ngoài ·
   *  cho chấm nhỏ. Trả true nếu đã vẽ (kiểu khác 'thuong'). */
  function veMat(g, M, kieu, cx, cy, w, h, trong) {
    if (!kieu || kieu === 'thuong') return false;
    var rw = w * 0.12, rh = h * 0.42, day = Math.min(h * 0.55, Math.max(h * 0.3, 2 / pxMoiDv(g)));
    function net(d) { d = d || day; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = rgba(BM.vecMatSangRgb, 0.55); g.lineWidth = d * 1.75; g.stroke(); g.strokeStyle = BM.vecMat; g.lineWidth = d; g.stroke(); }
    function dac() { g.lineJoin = 'round'; g.strokeStyle = rgba(BM.vecMatSangRgb, 0.55); g.lineWidth = day * 0.75; g.stroke(); to(g, BM.vecMat); }
    switch (kieu) {
      case 'chop1': bo(g, cx - rw, cy - rh * 0.15, 2 * rw, rh * 0.95, rh * 0.45); dac(); return true;
      case 'chop2': g.beginPath(); g.moveTo(cx - rw, cy + rh * 0.05); g.quadraticCurveTo(cx, cy + rh * 0.45, cx + rw, cy + rh * 0.05); net(); return true;
      case 'lim': g.beginPath(); g.moveTo(cx - rw, cy - rh * 0.05); g.lineTo(cx + rw, cy - rh * 0.05); g.arc(cx, cy - rh * 0.05, rw, 0, Math.PI); g.closePath(); dac(); return true;
      case 'dam': g.beginPath(); g.moveTo(cx - rw, cy - rh * 0.85); g.lineTo(cx + rw, cy + rh * 0.85); g.moveTo(cx + rw, cy - rh * 0.85); g.lineTo(cx - rw, cy + rh * 0.85); net(day * 0.85); return true;
      case 'xoay': g.beginPath(); g.moveTo(cx - trong * rw, cy - rh * 0.8); g.lineTo(cx + trong * rw * 0.9, cy); g.lineTo(cx - trong * rw, cy + rh * 0.8); net(day * 0.9); return true;      // "> <" nhăn mắt (va nhau): khác hẳn X và tròn ở ô nhỏ
      case 'vui': g.beginPath(); g.moveTo(cx - rw * 1.1, cy + rh * 0.55); g.lineTo(cx, cy - rh * 0.65); g.lineTo(cx + rw * 1.1, cy + rh * 0.55); net(); return true;
      case 'ngac': var R = rh * 1.05; tron(g, cx, cy, R); dac(); tron(g, cx, cy + R * 0.1, R * 0.42); to(g, M.toi); return true;
      case 'buon': g.beginPath(); g.moveTo(cx - trong * rw * 1.1, cy + rh * 0.75); g.lineTo(cx + trong * rw * 0.8, cy - rh * 0.55); net(); return true;      // vạch xệ dốc: ngoài thấp, trong cao
      case 'cho': tron(g, cx, cy + rh * 0.15, day * 0.62); to(g, BM.vecMat); return true;
      default: return false;
    }
  }
  /** Ăng-ten: cột bạc từ (x, yGoc) lên tới (x, yDinh + r), chấm màu đội bán kính r ở (x, yDinh). */
  function angTen(g, M, x, yGoc, yDinh, r) {
    duong(g, 'M' + x + ' ' + yGoc + ' V' + (yDinh + r - 2)); vien(g, BM.vecBacToi, 3);
    tron(g, x, yDinh, r); to(g, M.chinh); vien(g, BM.vecVien, 2);
  }
  var H = { bo: bo, duong: duong, tron: tron, elip: elip, to: to, vien: vien, gradDoc: gradDoc, gradToa: gradToa, gradVo: gradVo, rgba: rgba, kinh: kinh, angTen: angTen, VIEN: function () { return BM.vecVien; } };

  /* ---------------------------------------------------------------- kho hình */
  var kho = { o: {}, vat: {}, than: {}, tay: {}, 'cam-bien': {} };
  function dangKy(d) {
    if (!d || !kho[d.loai] || !d.ma || typeof d.ve !== 'function') throw new Error('VeVector.dangKy: cần loai (o | vat | than | tay | cam-bien), ma và ve().');
    if (kho[d.loai][d.ma]) throw new Error('VeVector: hình đã có ' + d.loai + '/' + d.ma);
    var oTayHop = function (o) { return !!(o && isFinite(o.x) && isFinite(o.y)); };
    if (d.loai === 'than' && !(d.oGan && (oTayHop(d.oGan.tay) || (d.khongHuong && oTayHop(d.oGan.duoi))))) throw new Error('VeVector: thân ' + d.ma + ' cần oGan.tay {x, y} (drone: oGan.duoi).');
    if (d.loai === 'tay' && !(d.diemNeo && isFinite(d.diemNeo.x) && isFinite(d.diemNeo.y) && d.gan)) throw new Error('VeVector: tay ' + d.ma + ' cần diemNeo {x, y} và gan.');
    if (d.loai === 'cam-bien' && !(d.diemNeo && isFinite(d.diemNeo.x) && isFinite(d.diemNeo.y) && d.gan)) throw new Error('VeVector: cảm biến ' + d.ma + ' cần diemNeo {x, y} và gan.');
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

  /* ---------------------------------------------------------------- luật ghép: Y NHƯ Part.ghep của bộ pixel (part/part.js) — cùng điều cấm, cùng câu báo lỗi */
  function ganCua(d) { return Array.isArray(d.gan) ? d.gan : [d.gan]; }
  /** camBien [{ ma, o }] → danh sách ổ thật: 'truoc' = 'hong'; 'hong' = một cái ở hongTrai + một cái ở hongPhai (như Part.ghep). */
  function doiCam(cams) {
    var out = [];
    (cams || []).forEach(function (c) { var o = c.o === 'truoc' ? 'hong' : c.o; if (o === 'hong') { out.push({ ma: c.ma, o: 'hongTrai' }); out.push({ ma: c.ma, o: 'hongPhai' }); } else out.push({ ma: c.ma, o: o }); });
    return out;
  }
  /** Ổ tay mà tay gắn vào thân: drone (khongHuong) treo ở ổ 'duoi'; thân khác ở ổ 'tay' (nếu tay gắn được ổ đó). */
  function oTay(than, tay) { return than.khongHuong ? ['duoi'] : ganCua(tay).filter(function (o) { return o === 'tay' && than.oGan[o]; }); }
  /** Kiểm cấu hình như Part.ghep: ném Error với ĐÚNG câu báo của bộ pixel khi ghép cấm (drone + camera, drone + tay khác nam châm, camera-bay trên thân thường,
   *  camera + cảm biến màu, ổ không có / cảm biến sai ổ). Trả { than, tay, cams } (cams đã đổi 'hong' → hai ổ). Thiếu hình vector: ném "Không có …". */
  function kiemGhep(cfg) {
    cfg = cfg || {};
    var than = lay('than', cfg.than || 'hai-banh'), tay = cfg.tay ? lay('tay', cfg.tay) : null, cams = doiCam(cfg.camBien), i, d;
    if (!than) throw new Error('Không có than "' + cfg.than + '".');
    if (cfg.tay && !tay) throw new Error('Không có tay "' + cfg.tay + '".');
    var drone = !!than.khongHuong, co = function (ma) { return cams.some(function (c) { return c.ma === ma; }); };
    for (i = 0; i < cams.length; i++) if (!lay('cam-bien', cams[i].ma)) throw new Error('Không có cam-bien "' + cams[i].ma + '".');
    if (drone && co('camera')) throw new Error('Drone không gắn được camera: drone không có hướng mặt để nhìn "phía trước".');
    if (drone) {
      if (tay && tay.ma !== 'nam-cham') throw new Error('Drone không gắn được ' + tay.ten + '.');
      for (i = 0; i < cams.length; i++) if (['khoang-cach', 'mau', 'camera-bay'].indexOf(cams[i].ma) < 0) throw new Error('Drone không gắn được ' + lay('cam-bien', cams[i].ma).ten + '.');
    }
    if (!drone && co('camera-bay')) throw new Error('Camera nhìn xuống (camera-bay) chỉ gắn được lên drone.');
    if (co('camera') && co('mau')) throw new Error('Robot không gắn được cả cảm biến màu lẫn camera: color() sẽ không biết đọc ô nào. Chỉ giữ một trong hai.');
    if (tay && !oTay(than, tay).length) throw new Error((drone ? 'Drone' : 'Tay ' + tay.ma) + ' không gắn được vào ổ này.');
    for (i = 0; i < cams.length; i++) {
      d = lay('cam-bien', cams[i].ma);
      if (!than.oGan[cams[i].o]) throw new Error('Thân ' + than.ma + ' không có ổ "' + cams[i].o + '".');
      if (ganCua(d).indexOf(cams[i].o) < 0) throw new Error('Cảm biến ' + d.ma + ' không gắn được vào ổ ' + cams[i].o + '.');
    }
    return { than: than, tay: tay, cams: cams };
  }

  /* ---------------------------------------------------------------- robot: ghép rồi xoay cả nhóm */
  function gocXoay(huong) { huong = ((huong || 0) % 4 + 4) % 4; return ((huong + 2 + (loiGia.gocXoay ? 1 : 0)) % 4) * Math.PI / 2; }   // thân vẽ quay XUỐNG: lên = 180°, phải = 270°, xuống = 0°, trái = 90°
  /** Góc quay thật của nhóm: thân không có hướng mặt (drone, khongHuong) KHÔNG xoay — vẽ thẳng theo màn hình (như bộ pixel: drone luôn hướng 0, ảnh không xoay). */
  function gocCua(than, huong) { return than && than.khongHuong ? 0 : gocXoay(huong); }
  /** Điểm (x, y) trong hệ của thân → toạ độ pixel trên canvas ô cạnh `canh` sau khi thu CO_THAN và xoay theo hướng (than: để biết drone không xoay). */
  function diemTrenO(pt, huong, canh, than) {
    var k = (canh / HE) * CO_THAN, a = gocCua(than, huong), dx = pt.x - TAM_THAN.x, dy = pt.y - TAM_THAN.y;
    return { x: canh / 2 + (dx * Math.cos(a) - dy * Math.sin(a)) * k, y: canh / 2 + (dx * Math.sin(a) + dy * Math.cos(a)) * k };
  }
  /** Ổ `o` của thân trong cfg (sau xoay) trên canvas ô cạnh `canh` (tâm canvas = tâm thân); null nếu thân không có ổ đó. */
  function diemO(cfg, o, huong, canh) { var t = lay('than', (cfg && cfg.than) || 'hai-banh'); return t && t.oGan[o] ? diemTrenO(t.oGan[o], huong, canh, t) : null; }
  /** Ổ gắn tay của thân (sau xoay) trên canvas ô: để kiểm "tay luôn ở phía hướng mặt" (drone: ổ 'duoi' dưới bụng). */
  function diemGan(cfg, huong, canh) { var t = lay('than', (cfg && cfg.than) || 'hai-banh'); return t ? diemO(cfg, t.khongHuong ? 'duoi' : 'tay', huong, canh) : null; }
  /** Mọi ổ đang gắn cảm biến `ma` của cfg (sau đổi 'hong' → hai ổ, sau xoay) trên canvas ô cạnh `canh`: [{ o, x, y }] — gốc tia của cảm biến (gói V4, san-ve.js oTia). */
  function diemCamBien(cfg, ma, huong, canh) {
    var t = lay('than', (cfg && cfg.than) || 'hai-banh'); if (!t) return [];
    return doiCam(cfg && cfg.camBien).filter(function (c) { return c.ma === ma && t.oGan[c.o]; }).map(function (c) { var p = diemTrenO(t.oGan[c.o], huong, canh, t); p.o = c.o; return p; });
  }
  /** Tâm ống kính CAMERA (gói V4: khối camera ở đuôi, than.oCam + ongKinh − diemNeo) sau xoay trên canvas ô cạnh `canh`; null nếu cfg không có camera / thân không có oCam. */
  function diemOngKinh(cfg, huong, canh) {
    var t = lay('than', (cfg && cfg.than) || 'hai-banh'), cb = lay('cam-bien', 'camera');
    if (!t || !t.oCam || !cb || !doiCam(cfg && cfg.camBien).some(function (c) { return c.ma === 'camera'; })) return null;
    return diemTrenO({ x: t.oCam.x + cb.ongKinh.x - cb.diemNeo.x, y: t.oCam.y + cb.ongKinh.y - cb.diemNeo.y }, huong, canh, t);
  }
  /** Hộp kính (x, y, w, h) mà thân vẽ qua H.kinh (đo một lần bằng cách cho thân vẽ lên canvas giả với H.kinh ghi lại): để biết chỗ hai mắt. */
  var kinhDem = {};
  function kinhCua(than) {
    if (!than) return null;
    if (kinhDem[than.ma] !== undefined) return kinhDem[than.ma];
    var cap = null, Hc = Object.assign({}, H, { kinh: function (g, M, x, y, w, h) { if (!cap) cap = { x: x, y: y, w: w, h: h }; } });
    try { than.ve(new CanvasGia(1, 1).getContext('2d'), {}, mauDoi(''), Hc); } catch (e) { cap = null; }
    return (kinhDem[than.ma] = cap);
  }
  /** Tâm hai mắt (camera là đôi mắt trên kính) của thân trong cfg, sau xoay, trên canvas ô cạnh `canh`: [mắt x nhỏ, mắt x lớn] (hệ thân); [] nếu thân không có kính. */
  function diemMat(cfg, huong, canh) {
    var t = lay('than', (cfg && cfg.than) || 'hai-banh'), k = kinhCua(t); if (!k) return [];
    var ew = k.w * 0.1522, ey = k.y + k.h / 2;
    return [k.x + k.w * 0.2174 + ew / 2, k.x + k.w * 0.6304 + ew / 2].map(function (ex) { return diemTrenO({ x: ex, y: ey }, huong, canh, t); });
  }
  /** Dịch của tay trong hệ thân (ổ − điểm neo) và ổ đã dùng; null nếu không gắn được. */
  function dichTay(than, tay) {
    var os = oTay(than, tay)[0]; if (!os) return null;
    var oG = than.oGan[os], neo = os === 'duoi' && tay.diemNeoDuoi ? tay.diemNeoDuoi : tay.diemNeo;
    return { o: os, x: oG.x - neo.x, y: oG.y - neo.y };
  }
  /** Vật trong kẹp: { ahead, n } theo đơn vị "1/100 ô" (VeRobot.tiLeChoO trả p = cạnh ô / 100): tâm vật cách tâm thân `ahead` về phía mũi, cạnh vật `n`. Tay hạ: xa thêm một chút (càng dài ra). */
  function vatKep(cfg, tuThe) {
    var t = lay('than', (cfg && cfg.than) || 'hai-banh'), tay = cfg && cfg.tay ? lay('tay', cfg.tay) : null;
    if (!t || !tay || !tay.vatKep) return null;
    var d = dichTay(t, tay); if (!d) return null;
    var y = d.y + tay.vatKep.y + (tuThe === 'duoi' ? (tay.vatKep.ha || 0) : 0);
    return { ahead: (y - TAM_THAN.y) * CO_THAN, n: tay.vatKep.canh * CO_THAN };
  }
  /** TAY XOAY: vật trong kẹp khi khớp ở góc `goc` độ (0 = trước, âm = trái, dương = phải): { f, l, n } theo 1/100 ô — f về phía mũi, l về bên PHẢI xe, cạnh n
   *  (cùng nghĩa với VeRobot.vatXoay của bộ pixel). Hình học ở tay (tay.vatXoay(tuThe, goc) → tâm vật { x, y, canh } trong hệ của tay). */
  function vatXoay(cfg, tuThe, goc) {
    var t = lay('than', (cfg && cfg.than) || 'hai-banh'), tay = cfg && cfg.tay ? lay('tay', cfg.tay) : null;
    if (!t || !tay || typeof tay.vatXoay !== 'function') return null;
    var d = dichTay(t, tay); if (!d) return null;
    var v = tay.vatXoay(tuThe, goc || 0), x = v.x + d.x, y = v.y + d.y;
    return { f: (y - TAM_THAN.y) * CO_THAN, l: (TAM_THAN.x - x) * CO_THAN, n: v.canh * CO_THAN };      // mặt quay xuống: bên phải xe là phía x nhỏ
  }
  /** Hình học tay / thân cho hiệu ứng của san-ve.js, theo 1/100 ô từ tâm thân (đã thu CO_THAN): mz miệng nòng trước, mzs miệng nòng sau (súng hơi), bk rổ máy ném,
   *  pp "một điểm ảnh part" (độ rộng chân tia camera), dinh từ tâm tới đỉnh hình drone (thanh pin). Cùng nghĩa các hằng 24 / 10,5 / 23,5 / 1 / 11 của bộ pixel. */
  function hinhHoc(cfg) {
    var t = lay('than', (cfg && cfg.than) || 'hai-banh'), tay = cfg && cfg.tay ? lay('tay', cfg.tay) : null; if (!t) return null;
    var d = tay ? dichTay(t, tay) : null, dy = d ? d.y : 0, truoc = function (y) { return (y + dy - TAM_THAN.y) * CO_THAN; };
    return {
      mz: tay && tay.mieng ? truoc(tay.mieng.truoc) : 44,
      mzs: (TAM_THAN.y - (t.oGan.sau ? t.oGan.sau.y : 22) + (tay && tay.mieng ? tay.mieng.lui || 0 : 0)) * CO_THAN,
      bk: tay && tay.ro ? truoc(tay.ro.y) : 36,
      pp: 2.6,
      dinh: (TAM_THAN.y - (isFinite(t.dinh) ? t.dinh : 14)) * CO_THAN
    };
  }
  /** Phần tràn ra ngoài ô mỗi bên (theo cạnh ô) của canvas robot: tay xoay vươn sang ô bên (tay.tran); còn lại 0 (canvas đúng một ô). */
  function tranCua(cfg) { var tay = cfg && cfg.tay ? lay('tay', cfg.tay) : null; return tay && tay.tran > 0 ? tay.tran : 0; }
  function robot(cfg, st, huong, canhPx) {
    cfg = cfg || {}; st = st || {};
    if (!coDu(cfg)) return null;
    var kq = kiemGhep(cfg), than = kq.than, tay = kq.tay, cams = kq.cams;                  // cấu hình cấm: ném lỗi y như Part.ghep (VeRobot bắt, báo một lần, như bộ pixel)
    huong = ((huong || 0) % 4 + 4) % 4; if (than.khongHuong) huong = 0;
    var canh = Math.max(1, Math.round(canhPx)), tran = tranCua(cfg), canhCv = canh + 2 * Math.round(canh * tran), M = mauDoi(cfg.son);
    var sCb = st.camBien || {}, coCam = cams.some(function (c) { return c.ma === 'camera'; });
    var sT = Object.assign({}, st.than || {}), sTay = st.tay || {};                          // gói V4: camera không đổi mắt (khối ống kính ở đuôi), coCam chỉ còn cho khoá đệm
    var khoa = ['robot', than.ma, tay ? tay.ma : '-', JSON.stringify(cams), huong, '#' + canh, M.ma, JSON.stringify(sT), tay ? JSON.stringify(sTay) : '', cams.length ? JSON.stringify(sCb) : ''].join('|');
    return nho(khoa, function () {
      var cv = taoCanvas(canhCv, canhCv), g = cv.getContext('2d'), k = (canh / HE) * CO_THAN;
      g.save(); g.translate(canhCv / 2, canhCv / 2); g.scale(k, k);
      if (!than.bongRieng) { elip(g, 2, 5, 33, 31); to(g, rgba(BM.vecVienRgb, 0.12)); }   // bóng đổ: lớp riêng, không xoay, lệch phải-dưới; drone có bóng riêng theo độ cao (san-ve.js veDuoiDrone)
      g.rotate(gocCua(than, huong)); g.translate(-TAM_THAN.x, -TAM_THAN.y);
      than.ve(g, sT, M, H);
      if (tay) {
        var d = dichTay(than, tay), sau = than.oGan.sau ? { x: than.oGan.sau.x - d.x, y: than.oGan.sau.y - d.y } : null;
        g.save(); g.translate(d.x, d.y); tay.ve(g, Object.assign({}, sTay, { than: than.ma, duoi: d.o === 'duoi', sau: sau }), M, H); g.restore();
      }
      cams.forEach(function (c) {                                                       // cảm biến: vẽ ở ổ (điểm neo trùng ổ), trên thân và tay; ra = phía ngoài (dấu x) của ổ
        var cb = lay('cam-bien', c.ma), o = cb.oVe === 'cam' && than.oCam ? than.oCam : than.oGan[c.o];     // camera (gói V4): vẽ ở đuôi (than.oCam), ổ logic giữ nguyên
        g.save(); g.translate(o.x - cb.diemNeo.x, o.y - cb.diemNeo.y);
        cb.ve(g, Object.assign({}, sCb, { ben: c.o === 'hongTrai' ? 'trai' : c.o === 'hongPhai' ? 'phai' : null, o: c.o, ra: o.x >= TAM_THAN.x ? 1 : -1, than: than.ma }), M, H);
        g.restore();
      });
      g.restore();
      cv.laPart = true; cv.laVector = true;
      return cv;
    });
  }

  return {
    HE: HE, CO_THAN: CO_THAN, TAM_THAN: TAM_THAN, H: H, CanvasGia: CanvasGia, taoCanvas: taoCanvas,
    bat: bat, datCheDo: datCheDo, luuCheDo: luuCheDo,
    dangKy: dangKy, lay: lay, ds: ds, coDu: coDu,
    o: o, vat: vat, robot: robot, mauDoi: mauDoi, vatKep: vatKep, vatXoay: vatXoay, hinhHoc: hinhHoc, tranCua: tranCua, gocXoay: gocXoay, gocCua: gocCua,
    diemTrenO: diemTrenO, diemGan: diemGan, diemO: diemO, diemCamBien: diemCamBien, diemMat: diemMat, diemOngKinh: diemOngKinh, kinhCua: kinhCua, kiemGhep: kiemGhep, doiCam: doiCam, oTay: oTay,
    xoaDem: xoaDem, _loiGia: loiGia
  };
});
