/* ============================================================================
   san-ve.js — "Đường học": VẼ SÂN VÀ PHÁT LẠI VẾT (window.SanVe).
   Vẽ từ cấu hình sân của lõi { san, batDau, loaiRobot }: tường #, cờ F, bậc thang S,
   băng chuyền > < ^ v, vật o (thùng gỗ), ô đích D (khung vàng nét đứt), X (đích có sẵn vật, khung vàng đặc), robot.
   Robot luôn vẽ qua VeRobot.ve() (ve-robot.js), trên LỚP PHỦ cả sân (một canvas thứ hai nằm đè lên canvas sân, có lề tràn ra ngoài sân
   để tay kẹp nhô ra mép sân không bị cắt; độ phân giải = pixel thiết bị nên hình part luôn nguyên lần, rõ nét). Hạt, chớp đỏ, dấu ?/! cũng vẽ ở lớp phủ. Phát lại từng sự kiện 'nhip' của vết (kể cả tay gắp và vật).
   Không chứa luật chơi: mọi kết quả (vị trí, hướng, sự kiện) đến từ lõi (SanHoc).
   ========================================================================== */
(function () {
  'use strict';

  var T = Ve.T;
  var BANG = { '>': 1, 'v': 2, '<': 3, '^': 0 };
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  var FIELDS = [];
  var HIEU_UNG = { 'nhat-vat': 1, 'dat-vat': 1, 'vat-vo': 1, 'kep-hut': 1, 'o-co-vat': 1, 'xong-dua-vat': 1 };   // sự kiện tức thì của tay (không chiếm thời gian của nhịp)

  function ngu(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  function Field(cv, tuyChon) {
    tuyChon = tuyChon || {};
    this.cv = cv; this.g = cv.getContext('2d');
    this.kich = tuyChon.kich || 210;           // cạnh khung (px màn hình) dành cho sân
    this.coNhoNhat = tuyChon.coNhoNhat || 0;   // >0: sân đông ô thì thu nhỏ ô (không nguyên lần) tới cỡ này (px màn hình)
    this.lamps = tuyChon.lamps || null;        // { T, P } phần tử đèn bánh
    this.rid = 0; this.cfg = null;
    this.lop = null; this.lg = null; this.lopOK = false; this.lopKhoa = ''; this.dem = 0;   // lớp phủ robot
    this.lst = { L: -1, R: -1 };
    this.clearFx();
    FIELDS.push(this);
  }
  Field.prototype = {
    /** Nạp một sân: cfg = { san: [chuỗi], batDau: {x,y,huong}, loaiRobot,
     *  danhDau: {x,y} (tuỳ chọn: vòng mờ đánh dấu ô xuất phát), vat: [{x,y}] (tuỳ chọn: khối hàng vẽ trên sàn, không ảnh hưởng luật), cat: {trai,phai,tren,duoi} (tuỳ chọn: cạnh nào bị cắt → vẽ dấu …) }. */
    nap: function (cfg) {
      var rows = cfg.san, w = rows[0].length, h = rows.length;
      var loai = cfg.loaiRobot || 'banh';
      this.cfg = { rows: rows, w: w, h: h, bd: cfg.batDau, loai: loai, co: null, dd: cfg.danhDau || null, cat: cfg.cat || null, vat: cfg.vat || [],
        robot: cfg.robot || { than: loai === 'nhen' ? 'nhen' : 'hai-banh', tay: null, camBien: [] }, dich: [] };
      this.vat0 = [];
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var ch = rows[y][x];
        if (ch === 'F' && !this.cfg.co) this.cfg.co = { x: x, y: y };
        if (ch === 'D' || ch === 'X') this.cfg.dich.push({ x: x, y: y });
        if (ch === 'o' || ch === 'X') this.themVat(x, y);
      }
      (cfg.vat || []).forEach(function (o) { this.themVat(Math.floor(o.x), Math.floor(o.y)); }, this);   // cùng thứ tự với SanHoc.chay: id 1, 2, ...
      this.cv.width = w * T; this.cv.height = h * T;
      var thoGoc = this.kich / (Math.max(w, h) * T), k = Math.max(1, Math.floor(thoGoc));
      if (this.coNhoNhat && thoGoc < 1) k = Math.max(thoGoc, this.coNhoNhat / T);   // ô nhỏ lại cho vừa khung, không dưới coNhoNhat
      this.k = k;
      this.cv.style.width = (w * T * k) + 'px'; this.cv.style.height = (h * T * k) + 'px';
      this.g = this.cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
      this.lopKhoa = ''; this.doiCo();
      this.datLai();
    },
    /** Thêm một vật ban đầu (mỗi ô tối đa một, không nằm trong tường / ngoài sân), id = thứ tự thêm. */
    themVat: function (x, y) {
      var c = this.cfg;
      if (!(x >= 0 && y >= 0 && x < c.w && y < c.h) || c.rows[y][x] === '#') return;
      for (var i = 0; i < this.vat0.length; i++) if (this.vat0[i].x === x && this.vat0[i].y === y) return;
      this.vat0.push({ id: this.vat0.length + 1, x: x, y: y });
    },
    datLai: function () {
      this.rid++;
      var b = this.cfg.bd;
      this.vis = { x: b.x, y: b.y, d: b.huong || 0, chan: 0, hop: 0, dx: 0, dy: 0, tay: { tuThe: 'tren', kep: false, cam: null }, tayDo: 0, bao: null, baoDen: 0 };
      this.objs = this.vat0.map(function (o) { return { id: o.id, x: o.x, y: o.y, tt: 'dat', voLuc: 0 }; });
      this.clearFx();
    },
    clearFx: function () { this.wh = { L: 0, R: 0 }; this.parts = []; this.bounce = 0; this.flash = 0; },
    /** Phun hạt. Tùy chọn: sz = cạnh hạt (px sân), mo = true thì hạt mờ dần khi sắp hết. */
    burst: function (cx, cy, n, cols, sp, sz, mo) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, s = (sp || 1) * (0.3 + Math.random() * 0.9);
        this.parts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.5, life: 28 + Math.random() * 30, c: cols[i % cols.length], s: sz || 1, mo: !!mo });
      }
    },
    mungThang: function () {
      this.bounce = performance.now() + 900;
      var cols = ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6fe06a', '#ff5a4a'];
      var f = this.cfg.co;
      if (f) { this.burst(f.x * T + 7, f.y * T + 5, 60, cols, 1.2); return; }
      var ds = this.cfg.dich;                                   // mục tiêu đưa vật: pháo giấy trên các ô đích
      for (var i = 0; i < ds.length; i++) this.burst(ds[i].x * T + 7, ds[i].y * T + 5, Math.max(12, Math.floor(60 / ds.length)), cols, 1.2);
    },
    /** Đặt dấu nổi trên xe ('?' kẹp hụt, '!' ô đã có vật) trong ms mili giây. */
    baoHieu: function (kieu, ms) { this.vis.bao = kieu; this.vis.baoDen = performance.now() + (ms || 1200); },
    /** Chớp đỏ (đâm tường / lỗi). */
    chopDo: function (ms) { this.flash = performance.now() + (ms || 160); },

    /* ---- ô đích, vật, dấu nổi */
    /** Ô đích còn trống: nền vàng nhạt + khung nét đứt chạy chậm. */
    veDichTrong: function (g, now) {
      var ds = this.cfg.dich; if (!ds.length) return;
      g.save(); g.lineWidth = 1; g.setLineDash([3, 2]); g.lineDashOffset = -((now / 140) % 5);
      for (var i = 0; i < ds.length; i++) {
        var d = ds[i], x = d.x * T, y = d.y * T;
        if (this.vatTaiO(d.x, d.y)) continue;
        g.fillStyle = 'rgba(255,210,63,.22)'; g.fillRect(x, y, T, T);
        g.strokeStyle = '#ffd23f'; g.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
      }
      g.restore();
    },
    /** Ô đích đã có vật nằm: khung vàng đặc đè lên viền thùng. */
    veDichDay: function (g) {
      var ds = this.cfg.dich;
      for (var i = 0; i < ds.length; i++) {
        var d = ds[i];
        if (!this.vatTaiO(d.x, d.y)) continue;
        g.strokeStyle = '#ffd23f'; g.lineWidth = 2; g.strokeRect(d.x * T + 1, d.y * T + 1, T - 2, T - 2); g.lineWidth = 1;
      }
    },
    vatTaiO: function (x, y) {
      for (var i = 0; i < this.objs.length; i++) { var o = this.objs[i]; if (o.tt === 'dat' && o.x === x && o.y === y) return o; }
      return null;
    },
    vatTaiDich: function (o) {
      for (var i = 0; i < this.cfg.dich.length; i++) if (this.cfg.dich[i].x === o.x && this.cfg.dich[i].y === o.y) return true;
      return false;
    },
    /** Thùng gỗ đang nằm; thùng vỡ mờ dần trong 0,8 giây; thùng đang cầm do VeRobot vẽ trong tay xe. */
    veVat: function (g, TL, now) {
      var nhun = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 2) : 0;
      for (var i = 0; i < this.objs.length; i++) {
        var o = this.objs[i];
        if (o.tt === 'dat') g.drawImage(TL.crate, o.x * T, o.y * T + (this.vatTaiDich(o) ? nhun : 0));
        else if (o.tt === 'vo' && o.voLuc) {
          var k = (now - o.voLuc) / 800;
          if (k < 1) { g.globalAlpha = 0.7 * (1 - k); g.drawImage(TL.crate, o.x * T, o.y * T - Math.round(k * 4)); g.globalAlpha = 1; }
        }
      }
    },
    /** Vật nằm ngay dưới xe (xe đứng đúng giữa ô, chưa cầm): thân xe che hết thùng nên robot được vẽ hơi trong suốt, thùng lộ ra. */
    vatDuoiXe: function () {
      var v = this.vis, o = this.vatTaiO(Math.round(v.x), Math.round(v.y));
      return (o && Math.abs(v.x - o.x) < 0.01 && Math.abs(v.y - o.y) < 0.01) ? o : null;
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
      this.taoLop();
      var r = cv.getBoundingClientRect(), f = Math.max(0.5, (r.width / ow) * (window.devicePixelRatio || 1));
      var khoa = [ow, cv.offsetHeight, cv.offsetLeft, cv.offsetTop, f.toFixed(3), c.robot.than, c.robot.tay].join('|');
      if (khoa === this.lopKhoa && this.lopOK) return;
      this.lopKhoa = khoa;
      var kk = ow / cv.width, S = T * kk * f, p = VeRobot.tiLeChoO(S, c.robot);
      var mc = Math.max(4, Math.ceil((VeRobot.REACH * p - S / 2) / f) + 3);          // lề (px CSS): tay nhô ra khi xe sát mép sân
      var cw = ow + 2 * mc, ch = cv.offsetHeight + 2 * mc, l = this.lop;
      l.width = Math.max(1, Math.round(cw * f)); l.height = Math.max(1, Math.round(ch * f));
      l.style.width = cw + 'px'; l.style.height = ch + 'px';
      l.style.left = (cv.offsetLeft - mc) + 'px'; l.style.top = (cv.offsetTop - mc) + 'px';
      this.kk = kk; this.u = l.width / cw; this.mc = mc; this.p = p;
      this.lopOK = true;
    },
    /** Vẽ robot + hạt + chớp đỏ + dấu nổi lên lớp phủ. */
    veLop: function (now) {
      var v = this.vis, c = this.cfg, g = this.lg;
      if ((this.dem = (this.dem + 1) % 30) === 0 || !this.lopOK) this.doiCo();
      var ok = this.lopOK, kk = this.kk, u = this.u, ku = kk * u, mcu = this.mc * u, i;
      var rx = v.x * T + v.dx, ry = v.y * T + v.dy, cx = rx + 7, cy = ry + 7;           // tâm ô (pixel sân)
      if (ok) {
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.lop.width, this.lop.height);
        var X = Math.round(mcu + cx * ku), Y = Math.round(mcu + cy * ku - v.hop * ku), p = this.p;
        var ph = (now / 90 | 0) & 1, duoi = this.vatDuoiXe();
        var wL = this.wh.L, wR = this.wh.R, phC = ph;
        if (c.robot.than === 'nhen') { wL = wR = v.chan ? 2 : 0; if (v.chan === 1) phC = 1; }   // nhện: chan 1 = nhấc chân (khung `buoc` đứng yên), 2 = chân bước luân phiên
        var spr = VeRobot.ve(c.robot, { wl: wL, wr: wR, ph: phC, tay: v.tay, camBien: v.camBien, loi: v.tayDo > now && ((now / 130 | 0) & 1) === 0 ? 'tay' : null }, v.d, p);
        g.imageSmoothingEnabled = false;
        var w = spr.width, h = spr.height, sc = spr.laPart ? 1 : ku;
        g.fillStyle = 'rgba(0,30,10,.35)';                                                // bóng dưới thân
        if (spr.laPart) g.fillRect(Math.round(X - 9 * p), Math.round(Y + 7 * p), Math.round(18 * p), Math.max(1, Math.round(2.5 * p)));
        else g.fillRect(Math.round(X - 5 * ku), Math.round(Y + 6 * ku), Math.round(10 * ku), Math.max(1, Math.round(2 * ku)));
        if (duoi) g.globalAlpha = 0.66;
        g.drawImage(spr, 0, 0, w, h, Math.round(X - w * sc / 2), Math.round(Y - h * sc / 2), Math.round(w * sc), Math.round(h * sc));
        g.globalAlpha = 1;
        g.setTransform(ku, 0, 0, ku, mcu, mcu);                                           // từ đây vẽ theo pixel sân
        var tx = Math.round(v.x), ty = Math.round(v.y);                                   // ô đích đã có vật dưới xe: khung vàng đặc nằm TRÊN xe
        if (this.vatTaiO(tx, ty) && this.vatTaiDich(this.vatTaiO(tx, ty)) && Math.abs(v.x - tx) < 0.01 && Math.abs(v.y - ty) < 0.01) {
          g.strokeStyle = '#ffd23f'; g.lineWidth = 2; g.strokeRect(tx * T + 1, ty * T + 1, T - 2, T - 2); g.lineWidth = 1;
        }
        if (v.bao && v.baoDen > now) this.veDau(g, v.bao, cx, cy, now, c.robot.tay ? 25 : 21);
        if (this.flash > now) { g.fillStyle = 'rgba(255,60,50,.32)'; g.fillRect(0, 0, this.cv.width, this.cv.height); }
      }
      for (i = this.parts.length - 1; i >= 0; i--) {
        var q = this.parts[i]; q.life--; q.vy += 0.05; q.x += q.vx; q.y += q.vy;
        if (q.life <= 0) { this.parts.splice(i, 1); continue; }
        if (!ok) continue;
        if (q.mo) g.globalAlpha = Math.min(1, q.life / 18);
        g.fillStyle = q.c; g.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
        if (q.mo) g.globalAlpha = 1;
      }
    },
    /** Dấu '?' (kẹp hụt) / '!' (ô đã có vật) nổi trên xe. */
    veDau: function (g, kieu, cx, cy, now, cao) {
      var Q = ['.##.', '#..#', '...#', '..#.', '.#..', '....', '.#..'], B = ['.#.', '.#.', '.#.', '.#.', '...', '.#.', '...'];
      var rows = kieu === '!' ? B : Q, w = rows[0].length;
      var bob = Math.round(Math.sin(now / 110));
      var x = Math.round(cx - w / 2) + 6, y = Math.max(1, cy - (cao || 21) + bob);
      var i, j;
      g.fillStyle = '#1b120a';
      for (j = 0; j < rows.length; j++) for (i = 0; i < w; i++) if (rows[j][i] === '#') {
        g.fillRect(x + i - 1, y + j, 3, 1); g.fillRect(x + i, y + j - 1, 1, 3);
      }
      g.fillStyle = kieu === '!' ? '#ff8a6a' : '#fff6a8';
      for (j = 0; j < rows.length; j++) for (i = 0; i < w; i++) if (rows[j][i] === '#') g.fillRect(x + i, y + j, 1, 1);
    },

    draw: function (now) {
      if (!this.cfg || !this.vis) return;
      var g = this.g, c = this.cfg, TL = Ve.tiles(), cf = Math.floor(now / 130) % 5, ff = Math.floor(now / 180) & 3;
      g.clearRect(0, 0, this.cv.width, this.cv.height);
      for (var y = 0; y < c.h; y++) for (var x = 0; x < c.w; x++) {
        var ch = c.rows[y][x], t;
        if (BANG[ch] !== undefined) t = Ve.makeConv(BANG[ch], cf);
        else if (ch === '#') t = TL.wall;
        else if (ch === 'S') t = TL.stair;
        else if (ch === 'F') t = TL.pad;
        else t = TL.rug[(x + y * 2) & 3];
        g.drawImage(t, x * T, y * T);
      }
      this.veDichTrong(g, now);
      this.veVat(g, TL, now);
      this.veDichDay(g);
      if (c.dd) {                                              // vòng mờ nét đứt: ô xuất phát
        g.save(); g.strokeStyle = 'rgba(255,246,227,.7)'; g.lineWidth = 1; g.setLineDash([2, 2]);
        g.strokeRect(c.dd.x * T + 1.5, c.dd.y * T + 1.5, T - 3, T - 3); g.restore();
      }
      if (c.cat) {                                             // dấu … ở cạnh bị cắt
        g.fillStyle = 'rgba(255,246,227,.85)';
        var cw = this.cv.width, ch2 = this.cv.height, m = 3;
        for (var q2 = -1; q2 <= 1; q2++) {
          if (c.cat.tren) g.fillRect(cw / 2 + q2 * 4 - 1, m, 2, 2);
          if (c.cat.duoi) g.fillRect(cw / 2 + q2 * 4 - 1, ch2 - m - 2, 2, 2);
          if (c.cat.trai) g.fillRect(m, ch2 / 2 + q2 * 4 - 1, 2, 2);
          if (c.cat.phai) g.fillRect(cw - m - 2, ch2 / 2 + q2 * 4 - 1, 2, 2);
        }
      }
      if (c.co) {
        var fy = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 3) : 0;
        g.drawImage(TL.flags[ff], Math.max(0, Math.min(this.cv.width - 18, c.co.x * T - 2)), Math.max(0, Math.min(this.cv.height - 18, c.co.y * T - 2)) + fy);
      }
      this.veLop(now);
      if (this.lamps) {
        var wl = this.wh.L > 0 ? 1 : 0, wr = this.wh.R > 0 ? 1 : 0;
        if (wl !== this.lst.L) { this.lst.L = wl; this.lamps.T.classList.toggle('on', !!wl); }
        if (wr !== this.lst.R) { this.lst.R = wr; this.lamps.P.classList.toggle('on', !!wr); }
      }
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
      v.camBien = (e.robot && e.robot.camBien) ? { bat: true } : null;       // cảm biến sáng trong nhịp có lệnh đọc cảm biến (lõi chưa có: chương sau điền e.robot.camBien)
      this.wh.L = b.trai !== 0 ? 2 : 0; this.wh.R = b.phai !== 0 ? 2 : 0;
      var list = evs.filter(function (s) { return s.ma !== 'toi-co' && !HIEU_UNG[s.ma]; });
      var tgian = ms;
      if (e.robot && e.robot.tay) {                                 // (a) tay đổi tư thế, (b) kẹp / thả: xong rồi mới tới bánh
        tgian = await this.apTay(e, ms, my);
        if (tgian < 0) return;
      }
      var n = Math.max(1, list.length), per = tgian / n, d = v.d, laNhen = this.cfg.robot.than === 'nhen';
      if (!list.length) await ngu(tgian);
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        if (my !== this.rid) return;
        if (s.den && (s.ma === 'tien' || s.ma === 'lui' || s.ma === 'di' || s.ma === 'bang-day')) {
          var x0 = v.x, y0 = v.y;
          if (laNhen && s.ma === 'di') v.chan = 2;                    // nhịp 2 của bước nhện: trượt sang ô mới, chân bước
          if (s.ma === 'bang-day') await ngu(per * 0.15);
          await this.tween(per * (s.ma === 'bang-day' ? 0.85 : 1), my, function (k) { var k2 = ease(k); v.x = x0 + (s.den.x - x0) * k2; v.y = y0 + (s.den.y - y0) * k2; });
          if (my !== this.rid) return;
          v.x = s.den.x; v.y = s.den.y; v.chan = 0;
        } else if (s.ma === 'quay-phai' || s.ma === 'quay-trai' || s.ma === 'quay-dau') {
          var d1 = (d + (s.ma === 'quay-phai' ? 1 : s.ma === 'quay-trai' ? 3 : 2)) % 4, lt = s.ma === 'quay-trai' ? 'L' : 'R';
          await this.tween(per, my, function (k) {
            v.hop = Math.sin(k * Math.PI) * 2; if (k > 0.5) v.d = d1;
            if (Math.random() < 0.4) self.burst(v.x * T + (lt === 'L' ? 3 : 11), v.y * T + 12, 1, ['#fff6e3', '#7fe8ff'], 0.6);
          });
          if (my !== this.rid) return;
          v.d = d1; v.hop = 0; d = d1;
        } else if (s.ma === 'dam-tuong' || s.ma === 'bang-chan') {
          var ddx = s.den ? Math.sign(s.den.x - (s.tu ? s.tu.x : v.x)) : 0, ddy = s.den ? Math.sign(s.den.y - (s.tu ? s.tu.y : v.y)) : 0;
          var bad = s.ma === 'dam-tuong';
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) {
            var a = Math.sin(k * Math.PI * 3) * (1 - k) * 3; v.dx = ddx * a; v.dy = ddy * a;
            if (bad && k > 0.1 && k < 0.6) self.flash = performance.now() + 120;
          });
          v.dx = 0; v.dy = 0; v.chan = 0;
          if (bad && this.onRung) this.onRung();
        } else if (s.ma === 'chuan-bi') {                            // nhện: nhịp 1 của bước, nhấc chân (đổi khung `buoc`), chưa rời ô
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) { v.hop = Math.sin(k * Math.PI) * 1; });
          v.hop = 0;
        } else if (s.ma === 'tay-vuong') {                           // tay hạ sát đất: xe rung tại chỗ, tay nháy đỏ
          v.tayDo = performance.now() + per + 700;
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) { v.dx = Math.sin(k * Math.PI * 7) * (1 - k) * 2.5; });
          v.dx = 0; v.chan = 0;
        } else {
          await ngu(per);
        }
      }
      if (my !== this.rid) return;
      // đồng bộ với vết (an toàn nếu có sự kiện lạ)
      v.x = e.robot.x; v.y = e.robot.y; v.d = laNhen ? 0 : e.robot.huong; v.hop = 0; v.dx = 0; v.dy = 0; v.chan = 0;   // nhện không có hướng mặt: luôn hướng lên
      if (e.robot.tay) v.tay = { tuThe: e.robot.tay.tuThe, kep: e.robot.tay.kep, cam: e.robot.tay.cam };
      v.camBien = null;
      this.wh.L = 0; this.wh.R = 0;
    },

    /**
     * Áp phần TAY của một nhịp: tay đổi tư thế (qua một khung nửa chừng), kẹp / thả, cập nhật vật và hiệu ứng.
     * Trả về thời gian còn lại cho bánh chạy, hoặc -1 nếu sân bị datLai() giữa chừng.
     */
    apTay: async function (e, ms, my) {
      var v = this.vis, tm = e.robot.tay, cu = v.tay, con = ms;
      var doiThe = cu.tuThe !== tm.tuThe, doiKep = cu.kep !== tm.kep || (cu.cam !== null) !== (tm.cam !== null);
      if (doiThe) {
        v.tay = { tuThe: 'giua', kep: cu.kep, cam: cu.cam };
        await ngu(ms * 0.14); con -= ms * 0.14;
        if (my !== this.rid) return -1;
      }
      v.tay = { tuThe: tm.tuThe, kep: tm.kep, cam: tm.cam };
      this.dongBoVat(e.vat);
      this.hieuUngTay(e.suKien || []);
      if (doiThe || doiKep) { await ngu(ms * 0.1); con -= ms * 0.1; if (my !== this.rid) return -1; }
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
        o.x = it.x; o.y = it.y; o.tt = it.trangThai === 'vo' ? 'vo' : it.trangThai === 'cam' ? 'cam' : 'dat';
        if (o.tt === 'vo' && cu !== 'vo') o.voLuc = now;
      }
    },
    /** Hiệu ứng tức thì của các sự kiện tay: nhặt, đặt, vỡ (mảnh vỡ rồi mờ), kẹp hụt (?), ô đã có vật (!). */
    hieuUngTay: function (evs) {
      for (var i = 0; i < evs.length; i++) {
        var s = evs[i], o = s.o, px = o ? o.x * T + 7 : 0, py = o ? o.y * T + 7 : 0;
        if (s.ma === 'nhat-vat' && o) this.burst(px, py, 8, ['#e8b574', '#fff6e3', '#c98a45'], 0.7);
        else if (s.ma === 'dat-vat' && o) this.burst(px, py + 3, 6, ['#fff6e3', '#bfe8b0'], 0.5);
        else if (s.ma === 'vat-vo' && o) {
          this.burst(px, py, 16, ['#c98a45', '#8a5a24', '#e8b574', '#5a3a14'], 1.7, 2, true);
          this.chopDo(160);
        } else if (s.ma === 'kep-hut') this.baoHieu('?', 1300);
        else if (s.ma === 'o-co-vat') { this.baoHieu('!', 1300); this.chopDo(140); }
      }
    }
  };

  (function loop(now) { FIELDS.forEach(function (f) { f.draw(now || performance.now()); }); requestAnimationFrame(loop); })();

  window.SanVe = { Field: Field, ngu: ngu, ease: ease, DX: DX, DY: DY };
})();
