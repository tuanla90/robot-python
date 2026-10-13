/* ============================================================================
   san-ve.js — "Đường học": VẼ SÂN VÀ PHÁT LẠI VẾT (window.SanVe).
   Vẽ từ cấu hình sân của lõi { san, batDau, loaiRobot }: tường #, cờ F, bậc thang S,
   băng chuyền > < ^ v, robot bánh / nhện. Phát lại từng sự kiện 'nhip' của vết.
   Không chứa luật chơi: mọi kết quả (vị trí, hướng, sự kiện) đến từ lõi (SanHoc).
   ========================================================================== */
(function () {
  'use strict';

  var T = Ve.T;
  var BANG = { '>': 1, 'v': 2, '<': 3, '^': 0 };
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  var FIELDS = [];

  function ngu(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  function Field(cv, tuyChon) {
    tuyChon = tuyChon || {};
    this.cv = cv; this.g = cv.getContext('2d');
    this.kich = tuyChon.kich || 210;           // cạnh khung (px màn hình) dành cho sân
    this.lamps = tuyChon.lamps || null;        // { T, P } phần tử đèn bánh
    this.rid = 0; this.cfg = null;
    this.lst = { L: -1, R: -1 };
    this.clearFx();
    FIELDS.push(this);
  }
  Field.prototype = {
    /** Nạp một sân: cfg = { san: [chuỗi], batDau: {x,y,huong}, loaiRobot }. */
    nap: function (cfg) {
      var rows = cfg.san, w = rows[0].length, h = rows.length;
      this.cfg = { rows: rows, w: w, h: h, bd: cfg.batDau, loai: cfg.loaiRobot || 'banh', co: null };
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (rows[y][x] === 'F' && !this.cfg.co) this.cfg.co = { x: x, y: y };
      this.cv.width = w * T; this.cv.height = h * T;
      var k = Math.max(1, Math.floor(this.kich / (Math.max(w, h) * T)));
      this.k = k;
      this.cv.style.width = (w * T * k) + 'px'; this.cv.style.height = (h * T * k) + 'px';
      this.g = this.cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
      this.datLai();
    },
    datLai: function () {
      this.rid++;
      var b = this.cfg.bd;
      this.vis = { x: b.x, y: b.y, d: b.huong || 0, hop: 0, dx: 0, dy: 0 };
      this.clearFx();
    },
    clearFx: function () { this.wh = { L: 0, R: 0 }; this.parts = []; this.bounce = 0; this.flash = 0; },
    burst: function (cx, cy, n, cols, sp) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, s = (sp || 1) * (0.3 + Math.random() * 0.9);
        this.parts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.5, life: 28 + Math.random() * 30, c: cols[i % cols.length] });
      }
    },
    mungThang: function () {
      this.bounce = performance.now() + 900;
      var f = this.cfg.co; if (!f) return;
      this.burst(f.x * T + 7, f.y * T + 5, 60, ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6fe06a', '#ff5a4a'], 1.2);
    },
    /** Chớp đỏ (đâm tường / lỗi). */
    chopDo: function (ms) { this.flash = performance.now() + (ms || 160); },

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
      if (c.co) {
        var fy = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 3) : 0;
        g.drawImage(TL.flags[ff], Math.max(0, Math.min(this.cv.width - 18, c.co.x * T - 2)), Math.max(0, Math.min(this.cv.height - 18, c.co.y * T - 2)) + fy);
      }
      var v = this.vis, rx = Math.round(v.x * T + v.dx), ry = Math.round(v.y * T + v.dy);
      var sx = Math.max(0, Math.min(this.cv.width - 18, rx - 2)), sy = Math.max(0, Math.min(this.cv.height - 18, ry - 2));
      g.fillStyle = 'rgba(0,30,10,.35)'; g.fillRect(sx + 4, sy + 15, 10, 2);
      var ph = (now / 90 | 0) & 1;
      if (c.loai === 'nhen') g.drawImage(Ve.makeNhen(this.wh.L > 0 || this.wh.R > 0 ? ph : 0), sx, sy - Math.round(v.hop));
      else g.drawImage(Ve.makeRobot(v.d, this.wh.L, this.wh.R, ph), sx, sy - Math.round(v.hop));
      if (this.flash > now) { g.fillStyle = 'rgba(255,60,50,.32)'; g.fillRect(0, 0, this.cv.width, this.cv.height); }
      for (var i = this.parts.length - 1; i >= 0; i--) {
        var q = this.parts[i]; q.life--; q.vy += 0.05; q.x += q.vx; q.y += q.vy;
        if (q.life <= 0) { this.parts.splice(i, 1); continue; }
        g.fillStyle = q.c; g.fillRect(Math.round(q.x), Math.round(q.y), 1, 1);
      }
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
      this.wh.L = b.trai !== 0 ? 2 : 0; this.wh.R = b.phai !== 0 ? 2 : 0;
      var list = evs.filter(function (s) { return s.ma !== 'toi-co'; });
      var n = Math.max(1, list.length), per = ms / n, d = v.d;
      for (var i = 0; i < list.length; i++) {
        var s = list[i];
        if (my !== this.rid) return;
        if (s.den && (s.ma === 'tien' || s.ma === 'lui' || s.ma === 'di' || s.ma === 'bang-day')) {
          var x0 = v.x, y0 = v.y;
          if (s.ma === 'bang-day') await ngu(per * 0.15);
          await this.tween(per * (s.ma === 'bang-day' ? 0.85 : 1), my, function (k) { var k2 = ease(k); v.x = x0 + (s.den.x - x0) * k2; v.y = y0 + (s.den.y - y0) * k2; });
          if (my !== this.rid) return;
          v.x = s.den.x; v.y = s.den.y;
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
          await this.tween(per, my, function (k) {
            var a = Math.sin(k * Math.PI * 3) * (1 - k) * 3; v.dx = ddx * a; v.dy = ddy * a;
            if (bad && k > 0.1 && k < 0.6) self.flash = performance.now() + 120;
          });
          v.dx = 0; v.dy = 0;
          if (bad && this.onRung) this.onRung();
        } else if (s.ma === 'chuan-bi') {
          await this.tween(per, my, function (k) { v.hop = Math.sin(k * Math.PI) * 1; });
          v.hop = 0;
        } else {
          await ngu(per);
        }
      }
      if (my !== this.rid) return;
      // đồng bộ với vết (an toàn nếu có sự kiện lạ)
      v.x = e.robot.x; v.y = e.robot.y; v.d = e.robot.huong; v.hop = 0; v.dx = 0; v.dy = 0;
      this.wh.L = 0; this.wh.R = 0;
    }
  };

  (function loop(now) { FIELDS.forEach(function (f) { f.draw(now || performance.now()); }); requestAnimationFrame(loop); })();

  window.SanVe = { Field: Field, ngu: ngu, ease: ease, DX: DX, DY: DY };
})();
