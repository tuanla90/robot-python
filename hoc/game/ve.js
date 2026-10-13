/* ============================================================================
   ve.js — "Đường học": VẼ PIXEL BẰNG CANVAS (window.Ve).
   Painter, chất liệu (gỗ, bảng xanh, núm khối), icon pixel TRẮNG viền tối 1px,
   sprite (ốc vít, ô sân, băng chuyền, cờ, robot bánh, nhện, sao, khóa, trùm, huy hiệu).
   Không có bút chì / giấy note (đã bỏ theo góp ý).
   ========================================================================== */
(function () {
  'use strict';

  var K = { ink: '#1b120a' };

  /* ------------------------------------------------------------- Painter */
  function Painter(w, h) { this.w = w; this.h = h; this.buf = new Array(w * h).fill(null); }
  Painter.prototype = {
    px: function (x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.buf[y * this.w + x] = c; return this; },
    get: function (x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null; return this.buf[y * this.w + x]; },
    rect: function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.px(x + i, y + j, c); return this; },
    ell: function (cx, cy, rx, ry, c) {
      for (var y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
        for (var x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
          var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1) this.px(x, y, c);
        }
      return this;
    },
    map: function (rows, pal, ox, oy) {
      ox = ox || 0; oy = oy || 0; var s = this;
      rows.forEach(function (row, y) { for (var x = 0; x < row.length; x++) { var c = pal[row.charAt(x)]; if (c) s.px(ox + x, oy + y, c); } });
      return this;
    },
    blit: function (q, ox, oy) { for (var y = 0; y < q.h; y++) for (var x = 0; x < q.w; x++) { var c = q.get(x, y); if (c) this.px(ox + x, oy + y, c); } return this; },
    outline: function (c) {
      var add = [];
      for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y]);
      }
      for (var i = 0; i < add.length; i++) this.px(add[i][0], add[i][1], c || K.ink);
      return this;
    },
    /** Điểm dưới cùng của mỗi cột đổi sang màu đổ bóng. */
    shade: function (c) {
      for (var x = 0; x < this.w; x++) {
        for (var y = this.h - 1; y >= 0; y--) { if (this.get(x, y)) { this.px(x, y, c); break; } }
      }
      return this;
    },
    canvas: function () {
      var cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h;
      var g = cv.getContext('2d'), id = g.createImageData(this.w, this.h);
      for (var i = 0; i < this.buf.length; i++) {
        var c = this.buf[i]; if (!c) continue;
        if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
        var n = parseInt(c.slice(1), 16);
        id.data[i * 4] = n >> 16; id.data[i * 4 + 1] = (n >> 8) & 255; id.data[i * 4 + 2] = n & 255; id.data[i * 4 + 3] = 255;
      }
      g.putImageData(id, 0, 0); return cv;
    }
  };
  function rot90(p) { var q = new Painter(p.w, p.h); for (var y = 0; y < p.h; y++) for (var x = 0; x < p.w; x++) { var c = p.get(x, y); if (c) q.px(p.h - 1 - y, x, c); } return q; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ------------------------------------------------------------ chất liệu */
  function texWood(pals, seed) {
    var W = 96, H = 60, p = new Painter(W, H), r = rng(seed);
    for (var k = 0; k < 3; k++) {
      var y0 = k * 20, b = pals[k];
      p.rect(0, y0, W, 20, b[0]);
      for (var s = 0; s < 58; s++) {
        var y = y0 + 2 + Math.floor(r() * 16), x = Math.floor(r() * W), len = 8 + Math.floor(r() * 34), q = r(), c = q < 0.45 ? b[2] : (q < 0.8 ? b[1] : b[5]);
        for (var i = 0; i < len; i++) { if (r() < 0.06) y += (r() < 0.5 ? -1 : 1); if (y < y0 + 1) y = y0 + 1; if (y > y0 + 17) y = y0 + 17; p.px((x + i) % W, y, c); }
      }
      if (r() < 0.9) { var kx = 8 + Math.floor(r() * 80), ky = y0 + 6 + Math.floor(r() * 8); p.ell(kx, ky, 3, 2, b[3]); p.ell(kx, ky, 1.5, 1, b[2]); p.px(kx, ky, b[3]); }
      p.rect(0, y0, W, 1, b[4]); p.rect(0, y0 + 19, W, 1, b[5]);
      for (var j = 0; j < 2; j++) { var sx = (k * 37 + j * 53) % W; p.rect(sx, y0 + 1, 1, 18, b[5]); }
    }
    return p.canvas().toDataURL();
  }
  function texChalk() {
    var p = new Painter(24, 24), r = rng(41);
    p.rect(0, 0, 24, 24, '#1d5a44');
    for (var i = 0; i < 46; i++) p.px(Math.floor(r() * 24), Math.floor(r() * 24), r() < 0.6 ? '#236650' : '#184d3a');
    for (var j = 0; j < 5; j++) { var x = Math.floor(r() * 20), y = Math.floor(r() * 24); p.rect(x, y, 3 + Math.floor(r() * 3), 1, '#2b7258'); }
    return p.canvas().toDataURL();
  }
  function texStud(c1, c2, c3) {
    var p = new Painter(8, 4);
    p.map(['.KKKK...', 'KhhcKK..', 'KhccdK..', 'KKKKKK..'], { K: K.ink, h: c1, c: c2, d: c3 });
    return p.canvas().toDataURL();
  }
  function datChatLieu() {
    var R = document.documentElement.style;
    R.setProperty('--wood', 'url(' + texWood([
      ['#c07a3a', '#ac6a2e', '#d28f4c', '#8a5222', '#d89a58', '#7a4619'],
      ['#b87238', '#a46428', '#c98846', '#82501f', '#d09050', '#744216'],
      ['#c58140', '#b07030', '#d79858', '#8e5624', '#dca262', '#7e4a1c']], 11) + ')');
    R.setProperty('--woodL', 'url(' + texWood([
      ['#9c5f2c', '#8a5024', '#b0723a', '#6c3e18', '#b87c44', '#5e3414'],
      ['#965a28', '#84481f', '#a66a34', '#683a14', '#b0743c', '#583010'],
      ['#a2662e', '#8e5626', '#b67a40', '#70421a', '#bc8248', '#603616']], 23) + ')');
    R.setProperty('--woodD', 'url(' + texWood([
      ['#6a4020', '#5a3418', '#7a4c28', '#3e220c', '#84552e', '#321b08'],
      ['#643c1c', '#553016', '#744824', '#3a1f0b', '#7e5028', '#2e1807'],
      ['#6c4222', '#5c361a', '#7c4e2a', '#40240e', '#865830', '#341c09']], 37) + ')');
    R.setProperty('--chalk', 'url(' + texChalk() + ')');
    R.setProperty('--st-cy', 'url(' + texStud('#c4f8ff', '#38c6de', '#1b8aa4') + ')');
    R.setProperty('--st-yl', 'url(' + texStud('#fff6bb', '#ffc933', '#cf8f10') + ')');
    R.setProperty('--st-gr', 'url(' + texStud('#c8fac2', '#4cc24f', '#2a8a35') + ')');
    R.setProperty('--st-pu', 'url(' + texStud('#e6d8ff', '#a070e6', '#6a3fb4') + ')');
    R.setProperty('--st-or', 'url(' + texStud('#ffe0b8', '#e08a3a', '#9c5418') + ')');
  }

  /* ---------------------------------------------------------------- icon
     Icon pixel màu TRẮNG, viền tối 1px (màu viền chọn theo nút), nổi rõ trên nền nút màu. */
  /** Tam giác pixel ĐẶC kiểu ký tự ▶ của Galmuri11: mỗi hàng dài thêm theo mẫu `bac`, hai nửa đối xứng, đỉnh dày 2 hàng. */
  function tamGiac(bac) {
    var rong = bac[bac.length - 1], rows = [];
    for (var i = 0; i < bac.length; i++) rows.push(new Array(bac[i] + 1).join('x') + new Array(rong - bac[i] + 1).join('.'));
    return rows.concat(rows.slice().reverse());
  }
  /** Mũi tên quay lại ↻: vành đặc dày 3 pixel hở góc trên bên phải; đầu mũi tên là tam giác đặc cùng kiểu, chỉ sang phải. */
  function vong() {
    var W = 13, H = 14, cx = 6.5, cy = 7.5, g = [];
    for (var y = 0; y < H; y++) {
      var r = [];
      for (var x = 0; x < W; x++) {
        var dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.sqrt(dx * dx + dy * dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
        r.push(d >= 3.2 && d <= 6.3 && !(ang > -88 && ang < -12) ? 'x' : '.');
      }
      g.push(r);
    }
    [2, 4, 5, 6, 5, 4, 2].forEach(function (w, j) { for (var i = 0; i < w; i++) g[j + 0][6 + i] = 'x'; });
    return g.map(function (r) { return r.join(''); });
  }
  var HINH = {
    play: tamGiac([2, 4, 6, 8, 10, 12]),
    step: tamGiac([2, 3, 5, 6, 8, 9]).map(function (s) { return s + '.xx'; }),
    reset: vong(),
    bulb: ['...xxxxxx...', '..xxxxxxxx..', '.xxxxxxxxxx.', '.xxxxxxxxxx.', '.xxxxxxxxxx.', '.xxxxxxxxxx.', '..xxxxxxxx..', '...xxxxxx...', '....xxxx....', '............', '...xxxxxx...', '....xxxx....'],
    menu: ['xxxxxxxxxx', 'xxxxxxxxxx', '..........', 'xxxxxxxxxx', 'xxxxxxxxxx', '..........', 'xxxxxxxxxx', 'xxxxxxxxxx'],
    back: ['...xx', '..xxx', '.xxx.', 'xxx..', 'xxx..', '.xxx.', '..xxx', '...xx'],
    next: ['xx...', 'xxx..', '.xxx.', '..xxx', '..xxx', '.xxx.', 'xxx..', 'xx...'],
    del: ['..xxxxxxxx', '.xxxxxxxxx', 'xxx.xx.xxx', 'xxxx..xxxx', 'xxx.xx.xxx', '.xxxxxxxxx', '..xxxxxxxx'],
    trash: ['...xxx...', 'xxxxxxxxx', '.........', '.xxxxxxx.', '.xx.x.xx.', '.xx.x.xx.', '.xx.x.xx.', '.xx.x.xx.', '.xxxxxxx.'],
    edit: ['......xx', '.....xxx', '....xxx.', '...xxx..', '..xxx...', '.xxx....', 'xxx.....', 'xx......'],
    plus: ['...xx...', '...xx...', '...xx...', 'xxxxxxxx', 'xxxxxxxx', '...xx...', '...xx...', '...xx...'],
    check: ['......xx', '.....xxx', 'x...xxx.', 'xx.xxx..', 'xxxxx...', '.xxx....', '..x.....'],
    cross: ['xx...xx', 'xxx.xxx', '.xxxxx.', '..xxx..', '.xxxxx.', 'xxx.xxx', 'xx...xx'],
    close: ['xx...xx', 'xxx.xxx', '.xxxxx.', '..xxx..', '.xxxxx.', 'xxx.xxx', 'xx...xx'],
    help: ['.xxxxx.', 'xxxxxxx', 'xx...xx', '....xxx', '...xxx.', '..xxx..', '.......', '..xxx..', '..xxx..'],
    dot: ['.xx.', 'xxxx', 'xxxx', '.xx.']
  };
  function icon(ten, tuyChon) {
    tuyChon = tuyChon || {};
    var rows = HINH[ten];
    if (!rows) throw new Error('Không có icon ' + ten);
    var p = new Painter(rows[0].length + 2, rows.length + 2);     // chừa 1 pixel quanh cho viền tối
    p.map(rows, { x: tuyChon.fill || '#ffffff' }, 1, 1);
    if (tuyChon.shade) p.shade(tuyChon.shade);
    p.outline(tuyChon.line || '#3a2410');
    return p.canvas();
  }

  /** Ổ khóa: quai thép vòng cung, thân vàng bo góc, lỗ khóa (chấm tròn + vạch dọc). nho = bản gọn cho ô code. */
  function spriteLock(tran, nho) {
    var big = [
      '..ssssss..', '.ssssssss.', '.ss....ss.', '.ss....ss.', '.ss....ss.',
      '.hhhhhhhh.', 'bbbbbbbbbb', 'bbbkkkkbbb', 'bbbkkkkbbb', 'bbbbkkbbbb', 'bbbbkkbbbb', '.dddddddd.'
    ];
    var small = [
      '..ssss..', '.ss..ss.', '.ss..ss.',
      '.hhhhhh.', 'bbbkkbbb', 'bbkkkkbb', 'bbbkkbbb', 'bbbkkbbb', '.dddddd.'
    ];
    var rows = nho ? small : big, w = rows[0].length;
    var pal = tran ? { s: '#e4e5ee', h: '#e8c46a', b: '#c9a23c', d: '#8c6a1c', k: K.ink }
                   : { s: '#e4e5ee', h: '#ffe27a', b: '#f2b533', d: '#b87a14', k: K.ink };
    var p = new Painter(w + 2, rows.length + 2);
    p.map(rows, pal, 1, 1);
    p.outline(K.ink); return p.canvas();
  }
  /** Mũi tên chỉ sang trái (từ bong bóng sang ô code): 8×7, viền tối 1px. */
  function spriteMui(mau) {
    var p = new Painter(10, 9);
    p.map(['...x....', '..xx....', '.xxxxxxx', 'xxxxxxxx', '.xxxxxxx', '..xx....', '...x....'], { x: mau || '#ff5a4a' }, 1, 1);
    p.outline(K.ink); return p.canvas();
  }
  function spriteStar(bat) {
    var p = new Painter(11, 10);
    p.map(['....y....', '...yyy...', 'yyyyyyyyy', '.yyyyyyy.', '..yyyyy..', '.yyyyyyy.', '.yy...yy.'], bat ? { y: '#ffd23f' } : { y: '#6a5a50' }, 1, 1);
    if (bat) { p.px(3, 3, '#fff8d0'); p.px(4, 2, '#fff8d0'); p.rect(4, 5, 3, 1, '#e8a92a'); p.px(2, 6, '#e8a92a'); }
    p.outline(K.ink); return p.canvas();
  }
  function spriteScrew() {
    var p = new Painter(4, 4);
    p.map(['.OO.', 'OhgO', 'OgsO', '.OO.'], { O: '#2a1608', h: '#f2f2f6', g: '#a9aebd', s: '#4e5364' });
    return p.canvas();
  }
  /**
   * Trùm: ROBOT ĐỐI THỦ cỡ lớn, cùng nét và bảng màu với robot hai bánh của người chơi
   * (viền tối 1px, mép sáng trên / tối dưới, bánh đen sọc) nhưng thân thép xám đinh tán, bánh xích dày,
   * kính đỏ phát sáng, ăng-ten có đèn và hai càng kẹp. bat = false: tắt đèn, tắt mắt (trùm chưa mở).
   */
  function spriteTrum(bat) {
    bat = bat !== false;
    var p = new Painter(24, 24);
    var C = {
      s: '#9aa3b5', h: '#d3dae8', e: '#f4f7ff', m: '#7a849b', d: '#4f576d',
      n: '#26324e', N: '#46567c',
      r: bat ? '#ff4a3c' : '#6a2a30', g: bat ? '#ffc0b0' : '#8a4a52', q: bat ? '#a52a2c' : '#4a1c22',
      t: '#4a4a5a', u: '#8a8a9c', v: '#2e2e3a', y: '#ffcf30', k: '#3a3020'
    };
    function R(x, y, w, h, c) { p.rect(x + 1, y + 1, w, h, C[c]); }
    function P(x, y, c) { p.px(x + 1, y + 1, C[c]); }
    function X(x, y) { p.px(x + 1, y + 1, null); }
    // ăng-ten + đèn
    R(10, 4, 2, 3, 'm'); R(10, 4, 1, 3, 's');
    R(9, 1, 4, 3, 'r'); R(10, 0, 2, 1, 'r'); R(9, 3, 4, 1, 'q'); P(10, 1, 'g'); P(10, 2, 'g');
    // bánh xích dày hai bên (sọc ngang như bánh của robot hai bánh, hai đầu bo tròn)
    [0, 18].forEach(function (x0) {
      for (var y = 10; y < 22; y++) R(x0, y, 4, 1, (y % 2 === 0) ? 'u' : 'v');
      R(x0, 10, 4, 1, 't'); R(x0, 21, 4, 1, 't');
      R(x0 === 0 ? 3 : 18, 10, 1, 12, 't');
      X(x0, 10); X(x0 + 3, 10); X(x0, 21); X(x0 + 3, 21);
    });
    // càng kẹp hai bên (cánh tay từ vai, hai ngàm hướng lên)
    [[0, 3], [18, 21]].forEach(function (c, i) {
      var x0 = c[0];
      R(x0, 3, 1, 3, 'd'); R(x0 + 3, 3, 1, 3, 'd');           // hai ngàm
      R(x0, 6, 4, 2, 'm'); R(x0, 6, 4, 1, 's');               // lòng bàn càng
      R(x0 + 1, 8, 2, 1, 'd');                                 // cổ tay
      R(i === 0 ? 3 : 17, 8, 2, 2, 'm');                       // vai nối vào thân
    });
    // thân: hộp thép, mép sáng trên, mép tối dưới
    R(4, 7, 14, 13, 's');
    R(5, 7, 12, 1, 'h'); R(4, 8, 1, 10, 'h'); R(17, 8, 1, 11, 'm'); R(5, 19, 12, 1, 'm');
    X(4, 7); X(17, 7); X(4, 19); X(17, 19);
    // kính: dải tối, hai mắt đỏ phát sáng (mép trong hơi cụp xuống cho dữ vừa phải mà vẫn dễ thương)
    R(6, 9, 10, 5, 'n'); R(6, 9, 10, 1, 'N');
    R(7, 10, 3, 3, 'r'); R(12, 10, 3, 3, 'r'); R(7, 12, 3, 1, 'q'); R(12, 12, 3, 1, 'q');
    P(9, 10, 'n'); P(12, 10, 'n'); P(7, 10, 'g'); P(14, 10, 'g'); P(7, 11, 'g'); P(14, 11, 'g');
    // lưới miệng
    R(7, 15, 8, 2, 'n'); [8, 10, 12].forEach(function (x) { R(x, 15, 1, 2, 'm'); });
    // tấm chân bụng sọc vàng - đen (dải cảnh báo)
    R(4, 17, 14, 1, 'd');
    for (var x = 5; x < 17; x++) R(x, 18, 1, 2, ((x >> 1) & 1) ? 'k' : 'y');
    // đinh tán bốn góc thân
    [[5, 8], [16, 8], [5, 16], [16, 16]].forEach(function (q) { P(q[0], q[1], 'e'); });
    p.outline(K.ink); return p.canvas();
  }
  function spriteHuyHieu() {
    var p = new Painter(16, 18);
    p.map(['.yyyyyyyyyyyy.', 'yyyyyyyyyyyyyy', 'yyyywwyyyyyyyy', 'yyywwwwyyyyyyy', 'yyyyyyyyyyyyyy', 'yyyyyyyyyyyyyy', '.yyyyyyyyyyyy.', '..yyyyyyyyyy..', '...yyyyyyyy...', '....yyyyyy....', '.....yyyy.....', '......yy......']
      .map(function (s) { return (s + '                ').slice(0, 14); }), { y: '#ffcf30', w: '#fff6c0' }, 1, 1);
    // giữa huy hiệu: đầu robot trùm đã hạ (thép xám, mắt đỏ)
    p.rect(4, 3, 8, 8, K.ink); p.rect(5, 4, 6, 6, '#7a849b'); p.rect(5, 4, 6, 1, '#d3dae8'); p.rect(5, 9, 6, 1, '#4f576d');
    p.rect(6, 6, 1, 2, '#ff4a3c'); p.rect(9, 6, 1, 2, '#ff4a3c'); p.px(6, 6, '#ffc0b0'); p.px(9, 6, '#ffc0b0'); p.rect(7, 8, 2, 1, '#26324e');
    p.outline(K.ink); return p.canvas();
  }

  /* -------------------------------------------------------- ô sân (T = 14) */
  var T = 14;
  function makeRug(alt, pad, seed) {
    var p = new Painter(T, T), r = rng(seed || 3);
    var base = pad ? '#86d680' : (alt ? '#3f9a48' : '#43a24c');
    p.rect(0, 0, T, T, base);
    for (var i = 0; i < 14; i++) p.px(1 + Math.floor(r() * 12), 1 + Math.floor(r() * 12), r() < 0.5 ? (pad ? '#9fe69a' : '#52b25c') : (pad ? '#74c46f' : '#37873f'));
    p.rect(0, 0, T, 1, pad ? '#b8f2b2' : '#6ccb72'); p.rect(0, 0, 1, T, pad ? '#b8f2b2' : '#6ccb72');
    p.rect(0, T - 1, T, 1, pad ? '#5aa857' : '#2c7436'); p.rect(T - 1, 0, 1, T, pad ? '#5aa857' : '#2c7436');
    return p.canvas();
  }
  function makeWall() {
    var p = new Painter(T, T);
    p.rect(0, 0, T, T, '#8d95a6');
    for (var y = 1; y < T - 1; y++) for (var x = 1; x < T - 1; x++) { if (((x + y) % 6) < 3) p.px(x, y, '#757d90'); else p.px(x, y, '#9ba3b4'); }
    p.rect(0, 0, T, 1, '#2d3340'); p.rect(0, T - 1, T, 1, '#2d3340'); p.rect(0, 0, 1, T, '#2d3340'); p.rect(T - 1, 0, 1, T, '#2d3340');
    p.rect(1, 1, T - 2, 1, '#d0d6e4'); p.rect(1, 1, 1, T - 2, '#d0d6e4');
    p.rect(1, T - 2, T - 2, 1, '#4c5568'); p.rect(T - 2, 1, 1, T - 2, '#4c5568');
    [[3, 3], [10, 3], [3, 10], [10, 10]].forEach(function (q) { p.rect(q[0], q[1], 2, 2, '#4c5568'); p.px(q[0], q[1], '#dfe4ee'); });
    return p.canvas();
  }
  function makeStair() {
    var p = new Painter(T, T);
    var bands = [['#f2c98a', '#ffe9bd', '#b98a4c'], ['#e0b270', '#f6d79e', '#a07238'], ['#cf9d5c', '#e8c184', '#8a6030'], ['#bd8a48', '#d6a96c', '#76501f']];
    for (var b = 0; b < 4; b++) {
      var y0 = b * 3 + 1;
      p.rect(1, y0, T - 2, 3, bands[b][0]);
      p.rect(1, y0, T - 2, 1, bands[b][1]);
      p.rect(1, y0 + 2, T - 2, 1, bands[b][2]);
    }
    p.rect(0, 0, T, 1, '#4a2e10'); p.rect(0, T - 1, T, 1, '#4a2e10'); p.rect(0, 0, 1, T, '#4a2e10'); p.rect(T - 1, 0, 1, T, '#4a2e10');
    return p.canvas();
  }
  var convCache = {};
  function makeConv(d, frame) {
    var key = d + '_' + frame; if (convCache[key]) return convCache[key];
    var p = new Painter(T, T);
    p.rect(0, 0, T, T, '#2f74d0');
    p.rect(2, 2, T - 4, T - 4, '#2563b8');
    for (var y = 3; y <= 10; y++) {
      var t = (y + frame) % 5;
      if (t === 0) p.rect(6, y, 2, 1, '#f4f9ff');
      else if (t === 1) p.rect(5, y, 4, 1, '#f4f9ff');
      else if (t === 2) p.rect(4, y, 6, 1, '#d4e6ff');
      else if (t === 3) p.rect(6, y, 2, 1, '#bcd6ff');
    }
    p.rect(0, 0, T, 1, '#14336a'); p.rect(0, T - 1, T, 1, '#14336a'); p.rect(0, 0, 1, T, '#14336a'); p.rect(T - 1, 0, 1, T, '#14336a');
    p.rect(1, 1, T - 2, 1, '#7fb0f2'); p.rect(1, 1, 1, T - 2, '#7fb0f2');
    [[1, 1], [12, 1], [1, 12], [12, 12]].forEach(function (q) { p.px(q[0], q[1], '#dde6f4'); });
    var q = p; for (var r = 0; r < d; r++) q = rot90(q);
    convCache[key] = q.canvas(); return convCache[key];
  }
  function makeFlag(frame) {
    var p = new Painter(16, 16);
    p.rect(2, 13, 7, 2, '#4a4f60'); p.rect(2, 13, 7, 1, '#7a8094'); p.rect(3, 14, 5, 1, '#2e3240');
    p.rect(4, 1, 1, 12, '#eef0f6');
    var wave = [0, 1, 0, -1][frame % 4];
    for (var c = 0; c < 9; c++) {
      var yo = (c > 2 ? wave : 0) + (c > 5 ? wave : 0);
      for (var r = 0; r < 6; r++) p.px(5 + c, 2 + r + yo, r === 0 ? '#ff7a68' : (r === 5 ? '#b32020' : '#e8352e'));
    }
    p.rect(3, 0, 3, 1, '#ffd23f');
    p.outline(K.ink);
    return p.canvas();
  }
  var robotCache = {};
  function makeRobot(dir, wl, wr, ph) {
    var key = dir + '_' + wl + '_' + wr + '_' + ph; if (robotCache[key]) return robotCache[key];
    var p = new Painter(16, 16);
    p.rect(3, 1, 10, 14, '#a8681c'); p.rect(4, 2, 8, 12, '#ffcf30');
    p.rect(4, 6, 8, 1, '#ffe888'); p.rect(4, 6, 1, 7, '#ffe070'); p.rect(11, 6, 1, 7, '#e5a416'); p.rect(4, 13, 8, 1, '#e5a416');
    p.rect(4, 2, 8, 4, '#26324e'); p.rect(5, 3, 2, 2, '#7ff0ff'); p.rect(9, 3, 2, 2, '#7ff0ff'); p.rect(7, 4, 2, 1, '#46567c');
    p.rect(7, 7, 2, 1, '#7a3e0a'); p.rect(6, 8, 4, 1, '#7a3e0a'); p.rect(5, 9, 6, 1, '#7a3e0a');
    function wheel(x0, st) {
      var base = st === 0 ? '#4a4a5a' : st === 1 ? '#1b6a82' : '#2aa6c6';
      p.rect(x0, 3, 3, 12, base);
      for (var y = 3; y < 15; y++) {
        var on = ((y + (st === 2 ? ph : 0)) & 1) === 0;
        var c = st === 0 ? (on ? '#8a8a9c' : '#2e2e3a') : st === 1 ? (on ? '#58d8f0' : '#1b6a82') : (on ? '#ffffff' : '#7fe8ff');
        p.rect(x0, y, 3, 1, c);
      }
    }
    wheel(0, wl); wheel(13, wr);
    for (var k = 0; k < dir; k++) p = rot90(p);
    var q = new Painter(18, 18); q.blit(p, 1, 1); q.outline(K.ink);
    robotCache[key] = q.canvas(); return robotCache[key];
  }
  var nhenCache = {};
  function makeNhen(ph) {
    var key = ph & 1; if (nhenCache[key]) return nhenCache[key];
    var p = new Painter(16, 16);
    var leg = '#3a2466';
    for (var i = 0; i < 4; i++) {
      var y = 3 + i * 3, off = ((i + ph) & 1);
      p.rect(1 + off, y, 4, 1, leg); p.rect(11 - off, y, 4, 1, leg);
      p.px(1 + off, y + 1, leg); p.px(14 - off, y + 1, leg);
    }
    p.ell(8, 9, 4.6, 5.4, '#7a4fd0'); p.ell(8, 9, 3.4, 4.2, '#9a72f0');
    p.ell(8, 4.5, 3, 2.6, '#6a3fc0');
    p.rect(6, 4, 1, 2, '#fff6e3'); p.rect(9, 4, 1, 2, '#fff6e3'); p.px(6, 5, '#e8352e'); p.px(9, 5, '#e8352e');
    p.rect(7, 11, 2, 2, '#c9aaff');
    var q = new Painter(18, 18); q.blit(p, 1, 1); q.outline(K.ink);
    nhenCache[key] = q.canvas(); return nhenCache[key];
  }
  var tileCache = null;
  function tiles() {
    if (tileCache) return tileCache;
    tileCache = {
      rug: [makeRug(0, 0, 5), makeRug(1, 0, 9), makeRug(0, 0, 13), makeRug(1, 0, 17)], pad: makeRug(0, 1, 7), wall: makeWall(), stair: makeStair(),
      flags: [makeFlag(0), makeFlag(1), makeFlag(2), makeFlag(3)]
    };
    return tileCache;
  }

  /* -------------------------------------------------- canvas → phần tử DOM */
  function mk(cv, s) {
    var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height;
    c.getContext('2d').drawImage(cv, 0, 0);
    c.style.width = cv.width * s + 'px'; c.style.height = cv.height * s + 'px'; c.className = 'pxi';
    return c;
  }
  function ico(ten, s, tuyChon) { return mk(icon(ten, tuyChon), s || 2); }
  function sao(bat, s) { return mk(spriteStar(bat), s || 2); }
  function mui(mau, s) { return mk(spriteMui(mau), s || 2); }
  function khoa(s, tran) { return mk(spriteLock(tran, tran), s || 2); }

  /** Điền icon vào mọi [data-i] chưa có nội dung. data-s tỉ lệ, data-l màu viền, data-f màu tô. */
  function hydrate(goc) {
    var els = goc.querySelectorAll('[data-i]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; if (el.firstChild) continue;
      var ten = el.getAttribute('data-i'), s = +(el.getAttribute('data-s') || 2);
      var opt = { line: el.getAttribute('data-l') || undefined, fill: el.getAttribute('data-f') || undefined };
      var node;
      if (ten === 'star') node = sao(el.getAttribute('data-on') !== '0', s);
      else if (ten === 'lock') node = khoa(s);
      else if (ten === 'trum') node = mk(spriteTrum(el.getAttribute('data-on') !== '0'), s);
      else if (ten === 'huyhieu') node = mk(spriteHuyHieu(), s);
      else node = ico(ten, s, opt);
      el.appendChild(node); el.style.display = 'flex';
    }
  }

  /** Khung gỗ: bề mặt tối + vành sáng + 6 ốc vít (không bút chì, không giấy note). */
  function khungGo(host) {
    var sf = document.createElement('div'); sf.className = 'surf'; host.appendChild(sf);
    var bv = document.createElement('div'); bv.className = 'bev'; host.appendChild(bv);
    var sc = spriteScrew();
    // ốc vít bám theo mép (khung có thể cao hơn 640 trên điện thoại dài)
    [['left:4px;top:4px'], ['right:4px;top:4px'], ['left:4px;bottom:4px'], ['right:4px;bottom:4px'], ['left:4px;top:50%;margin-top:-4px'], ['right:4px;top:50%;margin-top:-4px']].forEach(function (q) {
      var c = mk(sc, 2); c.style.cssText += ';position:absolute;' + q[0]; host.appendChild(c);
    });
  }

  window.Ve = {
    K: K, Painter: Painter, rot90: rot90, rng: rng, T: T,
    datChatLieu: datChatLieu, icon: icon, mk: mk, ico: ico, sao: sao, khoa: khoa, mui: mui, hydrate: hydrate, khungGo: khungGo,
    spriteTrum: spriteTrum, tiles: tiles, makeConv: makeConv, makeRobot: makeRobot, makeNhen: makeNhen, HINH: HINH
  };
})();
