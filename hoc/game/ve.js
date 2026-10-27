var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve.js — "Robot Chấn Hưng": VẼ PIXEL BẰNG CANVAS (window.Ve).
   Painter, chất liệu (gỗ, bảng xanh, núm khối), icon pixel TRẮNG viền tối 1px,
   sprite (ốc vít, ô sân, băng chuyền, cờ, robot bánh, nhện, sao, khóa, trùm, huy hiệu).
   Không có bút chì / giấy note (đã bỏ theo góp ý).
   ========================================================================== */
(function () {
  'use strict';

  var K = { ink: BM.vienDam };

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
    p.rect(0, 0, 24, 24, BM.bangSang);
    for (var i = 0; i < 46; i++) p.px(Math.floor(r() * 24), Math.floor(r() * 24), r() < 0.6 ? BM.bangSangV6 : BM.bangSangV7);
    for (var j = 0; j < 5; j++) { var x = Math.floor(r() * 20), y = Math.floor(r() * 24); p.rect(x, y, 3 + Math.floor(r() * 3), 1, BM.bangSangV8); }
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
      [BM.goSangV7, BM.goSangV21, BM.camToiV5, BM.goV14, BM.camToiV6, BM.goV15],
      [BM.goSangV22, BM.goSangV23, BM.camToiV7, BM.goV16, BM.camToiV8, BM.goV17],
      [BM.camToiV9, BM.goSangV24, BM.camToiV10, BM.goSangV25, BM.camV4, BM.goV18]], 11) + ')');
    R.setProperty('--woodL', 'url(' + texWood([
      [BM.goSangV26, BM.goV19, BM.goSangV27, BM.goV20, BM.goSangV28, BM.goV21],
      [BM.goSangV29, BM.goV22, BM.goSangV30, BM.goV23, BM.goSangV31, BM.goV24],
      [BM.goSangV32, BM.goSangV33, BM.goSangV34, BM.goV25, BM.camToiV11, BM.goV26]], 23) + ')');
    R.setProperty('--woodD', 'url(' + texWood([
      [BM.goV27, BM.goV28, BM.goV29, BM.goToiV14, BM.goV30, BM.goToiV15],
      [BM.goV31, BM.goV32, BM.goV33, BM.goToiV16, BM.goV34, BM.goToiV17],
      [BM.goV35, BM.goV36, BM.goV37, BM.goToiV18, BM.goSangV35, BM.goToiV19]], 37) + ')');
    R.setProperty('--chalk', 'url(' + texChalk() + ')');
    R.setProperty('--st-cy', 'url(' + texStud(BM.xanhLoSang2V9, BM.xanhLoSang, BM.xanhLoSangV1) + ')');
    R.setProperty('--st-yl', 'url(' + texStud(BM.kemV12, BM.vangV1, BM.goSangV2) + ')');
    R.setProperty('--st-gr', 'url(' + texStud(BM.xanhLaSangV17, BM.xanhLaToi, BM.bangSang2) + ')');
    R.setProperty('--st-pu', 'url(' + texStud(BM.timV8, BM.timToiV1, BM.timToi) + ')');
    R.setProperty('--st-or', 'url(' + texStud(BM.kemV13, BM.camToi, BM.goSangV6) + ')');
    R.setProperty('--st-pk', 'url(' + texStud(BM.hongV3, BM.hongToi, BM.hongToi2) + ')');
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
    plus: ['...xx...', '...xx...', '...xx...', 'xxxxxxxx', 'xxxxxxxx', '...xx...', '...xx...', '...xx...'],
    check: ['......xx', '.....xxx', 'x...xxx.', 'xx.xxx..', 'xxxxx...', '.xxx....', '..x.....'],
    cross: ['xx...xx', 'xxx.xxx', '.xxxxx.', '..xxx..', '.xxxxx.', 'xxx.xxx', 'xx...xx'],
    close: ['xx...xx', 'xxx.xxx', '.xxxxx.', '..xxx..', '.xxxxx.', 'xxx.xxx', 'xx...xx'],
    thutvao: ['....x..xx', '....xx.xx', '....xxxxx', 'xxxxxxxxx', 'xxxxxxxxx', '....xxxxx', '....xx.xx', '....x..xx'],
    thutra: ['xx..x....', 'xx.xx....', 'xxxxx....', 'xxxxxxxxx', 'xxxxxxxxx', 'xxxxx....', 'xx.xx....', 'xx..x....'],
    x5: ['xx.xx', 'xxxxx', '.xxx.', 'xxxxx', 'xx.xx'],
    help: ['.xxxxx.', 'xxxxxxx', 'xx...xx', '....xxx', '...xxx.', '..xxx..', '.......', '..xxx..', '..xxx..'],
    dot: ['.xx.', 'xxxx', 'xxxx', '.xx.'],
    // Xưởng hàm: đặt xe (xe nhìn từ bên hông), khối hàng (thùng gỗ có chữ X), tường (gạch xây so le)
    car: ['...xxxxxx...', '..xx.xx.xx..', '.xxx.xx.xxx.', 'xxxxxxxxxxxx', 'xxxxxxxxxxxx', '.xxx....xxx.', '.xxx....xxx.', '..x......x..'],
    box: ['xxxxxxxxxxx', 'xx.......xx', 'x.x.....x.x', 'x..x...x..x', 'x...x.x...x', 'x....x....x', 'x...x.x...x', 'x..x...x..x', 'x.x.....x.x', 'xx.......xx', 'xxxxxxxxxxx'],
    mau: ['xxx.xxx', 'xxx.xxx', 'xxx.xxx', '.......', 'xxx.xxx', 'xxx.xxx', 'xxx.xxx'],
    rao: ['.x...x...x.', 'xxxxxxxxxxx', '.x...x...x.', '.x...x...x.', 'xxxxxxxxxxx', '.x...x...x.', '.x...x...x.'],
    ro: ['..xxxxxxx..', '.x.......x.', 'x.........x', 'xxxxxxxxxxx', 'x.x.x.x.x.x', 'xxxxxxxxxxx', '.x.x.x.x.x.', '..xxxxxxx..'],
    wall: ['xxxxx.xxxxxx', 'xxxxx.xxxxxx', '............', 'xxx.xxxxx.xx', 'xxx.xxxxx.xx', '............', 'xxxxx.xxxxxx', 'xxxxx.xxxxxx'],
    nutban: ['xxxxxxxxxxx', 'x.........x', 'x..xxxxx..x', 'x.xxxxxxx.x', 'x.xxxxxxx.x', 'x.xxxxxxx.x', 'x..xxxxx..x', 'x.........x', 'xxxxxxxxxxx'],
    sac: ['.....xxxx', '....xxxx.', '...xxxx..', '..xxxx...', '.xxxxxxxx', 'xxxxxxxx.', '....xxx..', '...xxx...', '..xxx....', '..xx.....', '..x......'],
    pin: ['xxxxxxxxxx..', 'x........x..', 'x.xx.xx..xxx', 'x.xx.xx..xxx', 'x.xx.xx..xxx', 'x........x..', 'xxxxxxxxxx..'],
    thung: ['xxxxxxxxxxx', 'xoxxxxxxxox', 'xxoxxxxxoxx', 'xxxoxxxoxxx', 'xxxxoxoxxxx', 'xxxxxoxxxxx', 'xxxxoxoxxxx', 'xxxoxxxoxxx', 'xxoxxxxxoxx', 'xoxxxxxxxox', 'xxxxxxxxxxx'],
    bac: ['........xxx', '........xxx', '.....xxxxxx', '.....xxxxxx', '..xxxxxxxxx', '..xxxxxxxxx', 'xxxxxxxxxxx', 'xxxxxxxxxxx'],
    gam: ['xxxxxxxxxxx', 'xxxxxxxxxxx', 'xxooooooxxx', 'xo.......ox', 'x.........x', 'x.........x'],
    ho: ['...xxxxx...', '.xxooooxxx.', 'xxoooooooxx', 'xooooooooox', 'xxoooooooxx', '.xxooooxxx.', '...xxxxx...'],
    bang: ['xxxxxxxxxxx', 'xwxxxwxxxwx', 'xxwxxxwxxxw', 'xwxxxwxxxwx', 'xxxxxxxxxxx', '.o.......o.'],
    cua: ['xxxxxxxxxxx', 'xx...x...xx', 'xx...x...xx', 'xx.x.x.x.xx', 'xx...x...xx', 'xx...x...xx', 'xx...x...xx', 'xxxxxxxxxxx'],
    // ICON BỘ PHẬN 11×11 (15/10): dùng chung cho đèn nhịp (den-bo-phan.js) và tên thẻ khay (thanh-phan.js); x = màu chính, o = chi tiết tối, w = chi tiết sáng
    denBanh: ['...xxxxx...', '..xxxxxxx..', '.xxx...xxx.', 'xxx.....xxx', 'xx...w...xx', 'xx..wow..xx', 'xx...w...xx', 'xxx.....xxx', '.xxx...xxx.', '..xxxxxxx..', '...xxxxx...'],
    denXich: ['..xxxxxxx..', '.xoxoxoxox.', 'xx.......xx', 'x..w...w..x', 'x.wow.wow.x', 'x..w...w..x', 'xx.......xx', '.xoxoxoxox.', '..xxxxxxx..'],
    denTruot: ['....x......', '...xx......', '..xxxxxxxx.', '...xx......', '....x......', '...........', '......x....', '......xx...', '.xxxxxxxx..', '......xx...', '......x....'],
    denTayLen: ['.....x.....', '....xxx....', '...xxxxx...', '.....x.....', '.....x.....', '....xwx....', '.....x.....', '.....x.....', '.....x.....', '..xxxxxxx..', '..xxxxxxx..'],
    denTayXuong: ['..xxxxxxx..', '..xxxxxxx..', '.....x.....', '.....x.....', '.....x.....', '....xwx....', '.....x.....', '.....x.....', '...xxxxx...', '....xxx....', '.....x.....'],
    denXoay: ['...xxxxx...', '.xxx...xxx.', 'xxx.....xxx', '.x.......x.', '...........', '....xwx....', '.....x.....', '.....x.....', '.....x.....', '...xxxxx...'],
    denKepMo: ['x.........x', 'xx.......xx', '.xx.....xx.', '..xx...xx..', '...xx.xx...', '....xxx....', '....xwx....', '.....x.....', '.....x.....', '....xxx....'],
    denKepDong: ['...xx.xx...', '...x.w.x...', '...x.w.x...', '...xx.xx...', '...xxxxx...', '....xxx....', '....xwx....', '.....x.....', '.....x.....', '....xxx....'],
    denNamCham: ['www.....www', 'www.....www', 'xxx.....xxx', 'xxx.....xxx', 'xxx.....xxx', 'xxxx...xxxx', '.xxxxxxxxx.', '..xxxxxxx..'],
    denNem: ['........ww.', '.......wwww', '.......xww.', '......xx...', '.....xx....', '....xx.....', '...xx......', '..xxx......', 'xxxxxxxxxxx', '.w.......w.'],
    denSon: ['....xxx....', '....xwx....', '....xxx....', '...xxxxx...', '...xwwwx...', '...xxxxx...', '....xox....', '....xox....', '.....x.....', '..wwwwwww..', '..wwwwwww..'],
    denSung: ['....xxx....', '...xxxxx...', 'w.xxxwxxx.w', 'wwxxwwwxxww', 'w.xxxwxxx.w', '...xxxxx...', '....xxx....'],
    denCam: ['...xxxxx...', '.xxwwwwwxx.', 'xxwwooowwxx', 'xwwwooowwwx', 'xxwwooowwxx', '.xxwwwwwxx.', '...xxxxx...'],
    denChan: ['x.x.....x.x', '.x.x...x.x.', '..x.xxx.x..', '...xxwxx...', '..xxxxxxx..', '...xxwxx...', '..x.xxx.x..', '.x.x...x.x.', 'x.x.....x.x'],
    denCanh: ['www.....www', 'wxw.....wxw', 'www.....www', '...x...x...', '....xxx....', '....xox....', '....xxx....', '...x...x...', 'www.....www', 'wxw.....wxw', 'www.....www'],
    denLogic: ['..x.x.x.x..', '.xxxxxxxxx.', 'xxxxxxxxxxx', '.xxwwwwwxx.', 'xxxw...wxxx', '.xxw.w.wxx.', 'xxxw...wxxx', '.xxwwwwwxx.', 'xxxxxxxxxxx', '.xxxxxxxxx.', '..x.x.x.x..'],
    // chế độ lắp ráp (17/10): đồng xu (giá part, ngân sách; đổi màu tô cho xu đã tiêu) và bánh răng (nút "Lắp lại")
    xu: ['...xxxxx...', '..xwwxxxx..', '.xwxxxoxxx.', 'xwxxxxoxxxo', 'xwxxxxoxxxo', 'xxxxxxoxxxo', 'xxxxxxoxxxo', 'xxxxxxoxxxo', '.xxxxxoxxo.', '..xxxxxxo..', '...xxxxx...'],
    banhRang: ['....xxx....', '..x.xxx.x..', '.xxxxxxxxx.', '..xxx.xxx..', 'xxxx...xxxx', 'xxx.....xxx', 'xxxx...xxxx', '..xxx.xxx..', '.xxxxxxxxx.', '..x.xxx.x..', '....xxx....'],
    // sổ lệnh (quyển sách mở) và nhãn cảnh báo (tam giác có dấu !)
    gear: ['....xxx....', '.xx.xxx.xx.', '.xxxxxxxxx.', '..xxxxxxx..', 'xxxx...xxxx', 'xxxx...xxxx', 'xxxx...xxxx', '..xxxxxxx..', '.xxxxxxxxx.', '.xx.xxx.xx.', '....xxx....'],
    loa: ['....x....', '...xx..x.', 'xxxxx...x', 'xxxxx.x.x', 'xxxxx.x.x', 'xxxxx...x', '...xx..x.', '....x....'],
    nhac: ['..xxxxxx', '..xxxxxx', '..x....x', '..x....x', '..x....x', 'xxx..xxx', 'xxx..xxx', '.x....x.'],
    book: ['.xxxxxxxxx.', 'xxxxxxxxxxx', 'xx.......xx', 'xx.xxxxx.xx', 'xx.......xx', 'xx.xxx...xx', 'xx.......xx', 'xxxxxxxxxxx', '.xxxxxxxxx.'],
    canhbao: ['.....xx.....', '....xxxx....', '....xxxx....', '...xxxxxx...', '...xx..xx...', '..xxx..xxx..', '..xxx..xxx..', '.xxxxxxxxxx.', '.xxxx..xxxx.', 'xxxxxxxxxxxx']
  };
  function icon(ten, tuyChon) {
    tuyChon = tuyChon || {};
    var rows = HINH[ten];
    if (!rows) throw new Error('Không có icon ' + ten);
    var p = new Painter(rows[0].length + 2, rows.length + 2);     // chừa 1 pixel quanh cho viền tối
    p.map(rows, { x: tuyChon.fill || BM.trangV2, o: tuyChon.toi || tuyChon.line || BM.goToiV1, w: tuyChon.sang || BM.trangV2 }, 1, 1);     // o / w: chi tiết tối / sáng của icon bộ phận
    if (tuyChon.shade) p.shade(tuyChon.shade);
    p.outline(tuyChon.line || BM.goToiV1);
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
    var pal = tran ? { s: BM.trangToiV3, h: BM.vangV9, b: BM.vangToiV4, d: BM.goSangV36, k: K.ink }
                   : { s: BM.trangToiV3, h: BM.vangV2, b: BM.vangToiV5, d: BM.goSangV37, k: K.ink };
    var p = new Painter(w + 2, rows.length + 2);
    p.map(rows, pal, 1, 1);
    p.outline(K.ink); return p.canvas();
  }
  /** Mũi tên chỉ sang trái (từ bong bóng sang ô code): 8×7, viền tối 1px. */
  function spriteMui(mau) {
    var p = new Painter(10, 9);
    p.map(['...x....', '..xx....', '.xxxxxxx', 'xxxxxxxx', '.xxxxxxx', '..xx....', '...x....'], { x: mau || BM.doV8 }, 1, 1);
    p.outline(K.ink); return p.canvas();
  }
  /** Cây bút chì nằm chéo (đầu chì ở dưới trái, tẩy ở trên phải) cho nút sửa hàm ✎: 9×9 gồm viền tối 1px,
   *  tẩy hồng, vòng kim loại, thân vàng có sọc cam, ngòi gỗ nhạt, đầu chì đen. Mỗi pixel nằm trên một đường chéo i+j = 5, 6 hoặc 7
   *  (i sang phải, j xuống), vị trí dọc thân a = i - j: -6 chì, -5..-3 gỗ, -2..2 thân (sọc xen kẽ), 3 vòng kim loại, 4..6 tẩy. */
  function spriteBut() {
    var p = new Painter(9, 9);
    var MAU = { chi: BM.xamToi2V6, go: BM.camSangV6, vang: BM.vangV4, soc: BM.goSangV38, kim: BM.trangToiV8, te: BM.doSangV12 };
    for (var j = 0; j < 7; j++) for (var i = 0; i < 7; i++) {
      var tong = i + j;
      if (tong < 5 || tong > 7) continue;
      var a = i - j, c;
      if (a <= -6) c = MAU.chi;
      else if (a <= -3) c = (tong === 7 ? BM.camV5 : MAU.go);
      else if (a <= 2) c = (a % 2 === 0) ? MAU.vang : MAU.soc;
      else if (a === 3) c = MAU.kim;
      else c = MAU.te;
      if (a >= -2 && a <= 2 && tong === 7 && c === MAU.vang) c = BM.vangToiV6;          // cạnh dưới của thân hơi tối: có khối
      p.px(i + 1, j + 1, c);
    }
    p.outline(K.ink); return p.canvas();
  }
  function spriteStar(bat) {
    var p = new Painter(11, 10);
    p.map(['....y....', '...yyy...', 'yyyyyyyyy', '.yyyyyyy.', '..yyyyy..', '.yyyyyyy.', '.yy...yy.'], bat ? { y: BM.vangV4 } : { y: BM.xamToiV10 }, 1, 1);
    if (bat) { p.px(3, 3, BM.kemSangV5); p.px(4, 2, BM.kemSangV5); p.rect(4, 5, 3, 1, BM.vangToiV2); p.px(2, 6, BM.vangToiV2); }
    p.outline(K.ink); return p.canvas();
  }
  function spriteScrew() {
    var p = new Painter(4, 4);
    p.map(['.OO.', 'OhgO', 'OgsO', '.OO.'], { O: BM.denV5, h: BM.trangV15, g: BM.xamV10, s: BM.xamToiV11 });
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
      s: BM.xamV11, h: BM.lamSangV11, e: BM.trangV16, m: BM.xamV3, d: BM.xamToiV6,
      n: BM.lamToiV1, N: BM.lamV16,
      r: bat ? BM.doV1 : BM.doToiV10, g: bat ? BM.doSangV2 : BM.doV17, q: bat ? BM.doV3 : BM.doToiV11,
      t: BM.xamToi2V7, u: BM.xamV12, v: BM.xamToi2V8, y: BM.vangV3, k: BM.goToiV20
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
      .map(function (s) { return (s + '                ').slice(0, 14); }), { y: BM.vangV3, w: BM.kemSangV2 }, 1, 1);
    // giữa huy hiệu: đầu robot trùm đã hạ (thép xám, mắt đỏ)
    p.rect(4, 3, 8, 8, K.ink); p.rect(5, 4, 6, 6, BM.xamV3); p.rect(5, 4, 6, 1, BM.lamSangV11); p.rect(5, 9, 6, 1, BM.xamToiV6);
    p.rect(6, 6, 1, 2, BM.doV1); p.rect(9, 6, 1, 2, BM.doV1); p.px(6, 6, BM.doSangV2); p.px(9, 6, BM.doSangV2); p.rect(7, 8, 2, 1, BM.lamToiV1);
    p.outline(K.ink); return p.canvas();
  }

  /* -------------------------------------------------------- ô sân (T = 14) */
  var T = 14;
  function makeRug(alt, pad, seed) {
    var p = new Painter(T, T), r = rng(seed || 3);
    var base = pad ? BM.coSangV2 : (alt ? BM.coV3 : BM.co);
    p.rect(0, 0, T, T, base);
    for (var i = 0; i < 14; i++) p.px(1 + Math.floor(r() * 12), 1 + Math.floor(r() * 12), r() < 0.5 ? (pad ? BM.coSangV3 : BM.coV1) : (pad ? BM.coSangV4 : BM.coToiV1));
    p.rect(0, 0, T, 1, pad ? BM.coSangV1 : BM.coSang); p.rect(0, 0, 1, T, pad ? BM.coSangV1 : BM.coSang);
    p.rect(0, T - 1, T, 1, pad ? BM.coV2 : BM.coToi); p.rect(T - 1, 0, 1, T, pad ? BM.coV2 : BM.coToi);
    return p.canvas();
  }
  function makeWall() {
    var p = new Painter(T, T);
    p.rect(0, 0, T, T, BM.tuong);
    for (var y = 1; y < T - 1; y++) for (var x = 1; x < T - 1; x++) { if (((x + y) % 6) < 3) p.px(x, y, BM.tuongV1); else p.px(x, y, BM.tuongV2); }
    p.rect(0, 0, T, 1, BM.tuongToi); p.rect(0, T - 1, T, 1, BM.tuongToi); p.rect(0, 0, 1, T, BM.tuongToi); p.rect(T - 1, 0, 1, T, BM.tuongToi);
    p.rect(1, 1, T - 2, 1, BM.tuongSang); p.rect(1, 1, 1, T - 2, BM.tuongSang);
    p.rect(1, T - 2, T - 2, 1, BM.tuongToiV1); p.rect(T - 2, 1, 1, T - 2, BM.tuongToiV1);
    [[3, 3], [10, 3], [3, 10], [10, 10]].forEach(function (q) { p.rect(q[0], q[1], 2, 2, BM.tuongToiV1); p.px(q[0], q[1], BM.tuongSangV1); });
    return p.canvas();
  }
  function makeStair() {
    var p = new Painter(T, T);
    var bands = [[BM.sanCamV1, BM.sanKemV3, BM.sanCamToiV3], [BM.sanCamV3, BM.sanCamV4, BM.sanNauSangV4], [BM.sanCamToiV4, BM.sanCamV5, BM.sanNauSangV5], [BM.sanCamToiV5, BM.sanCamV6, BM.sanNauSangV6]];
    for (var b = 0; b < 4; b++) {
      var y0 = b * 3 + 1;
      p.rect(1, y0, T - 2, 3, bands[b][0]);
      p.rect(1, y0, T - 2, 1, bands[b][1]);
      p.rect(1, y0 + 2, T - 2, 1, bands[b][2]);
    }
    p.rect(0, 0, T, 1, BM.sanNau); p.rect(0, T - 1, T, 1, BM.sanNau); p.rect(0, 0, 1, T, BM.sanNau); p.rect(T - 1, 0, 1, T, BM.sanNau);
    return p.canvas();
  }
  /** HỐ (chương nhện, ký hiệu `u`): sàn cỏ có một cái hố tròn, bờ đất sáng ở phía trên-trái, thành hố tối dần xuống đáy đen. Nhện đặt chân vào là rơi. */
  function makeHo() {
    var p = new Painter(T, T), r = rng(41), i;
    p.rect(0, 0, T, T, BM.co);
    for (i = 0; i < 12; i++) p.px(1 + Math.floor(r() * 12), 1 + Math.floor(r() * 12), r() < 0.5 ? BM.coV1 : BM.coToiV1);
    p.rect(0, 0, T, 1, BM.coSang); p.rect(0, 0, 1, T, BM.coSang); p.rect(0, T - 1, T, 1, BM.coToi); p.rect(T - 1, 0, 1, T, BM.coToi);
    p.ell(7, 7, 6.4, 6.2, BM.sanNau);            // viền đất tối
    p.ell(7, 7, 5.6, 5.4, BM.sanNauSangV2);            // bờ đất
    p.ell(7.3, 7.6, 4.8, 4.6, BM.sanNauV2);        // thành hố
    p.ell(7.5, 8.2, 3.6, 3.3, BM.sanDen);        // đáy
    p.ell(7.2, 8.4, 1.9, 1.6, BM.sanDenV1);        // sâu nhất
    [[3, 3], [4, 2], [2, 4], [5, 2], [2, 5]].forEach(function (q) { p.px(q[0], q[1], BM.sanCamToiV1); });   // bờ đất sáng ở phía ánh sáng
    [[9, 10], [10, 9], [8, 11]].forEach(function (q) { p.px(q[0], q[1], BM.sanNauV1); });                // sỏi đáy
    return p.canvas();
  }
  /** GẦM THẤP (chương nhện, ký hiệu `n`): một mái ván gỗ thấp phủ trọn ô, hai mép trên dưới có vạch vàng-đen báo "thấp". mai = true: chỉ riêng mái (nền trong suốt),
   *  vẽ ĐÈ lên nhện khi nhện đang chui trong gầm cho thấy nhện nằm dưới mái. */
  function makeGam(mai) {
    var p = new Painter(T, T), x, y;
    if (!mai) {
      p.rect(0, 0, T, T, BM.co);
      p.rect(0, 0, T, 1, BM.coSang); p.rect(0, 0, 1, T, BM.coSang); p.rect(0, T - 1, T, 1, BM.coToi); p.rect(T - 1, 0, 1, T, BM.coToi);
    }
    p.rect(0, 1, T, T - 2, K.ink);
    p.rect(1, 2, T - 2, T - 4, BM.sanNauSangV7);
    for (y = 0; y < 3; y++) p.rect(1, 4 + y * 3, T - 2, 1, BM.sanNauSang);           // khe giữa các tấm ván
    p.rect(1, 2, T - 2, 1, BM.sanCamV7);                                            // mép trên sáng
    p.rect(1, T - 3, T - 2, 1, BM.sanNauSangV8);                                        // mép dưới tối
    for (x = 1; x < T - 1; x++) {                                                 // vạch vàng - đen ở hai mép: báo hiệu gầm thấp
      var vang = (((x >> 1) & 1) === 0);
      p.px(x, 1, vang ? BM.sanVang : K.ink); p.px(x, T - 2, vang ? K.ink : BM.sanVang);
    }
    [[2, 6], [11, 6], [2, 9], [11, 9]].forEach(function (q) { p.px(q[0], q[1], BM.sanNau); p.px(q[0] + 1, q[1], BM.sanCamToiV1); });   // đinh
    return p.canvas();
  }
  /** Hàng rào THẤP (chương máy ném, ký hiệu `=`): chỉ vẽ cọc gỗ + thanh ngang, nền trong suốt nên thấy sàn phía sau (khác tường cao # đặc kín, xám). mask: 1 trái, 2 phải, 4 trên, 8 dưới
   *  = ô kề bên cũng là hàng rào (thanh nối liền sang ô đó); không ô kề nào thì thanh nằm ngang, hai đầu chừa mép. Có bóng đổ nhẹ xuống sàn. */
  var raoCache = {};
  function makeRao(mask) {
    mask = mask | 0;
    if (raoCache[mask]) return raoCache[mask];
    var p = new Painter(T, T), ngang = (mask & 3) || !(mask & 12), doc = (mask & 12) > 0, xa, xb, ya, yb, x, y;
    function thanh(x, y, w, h, doc) {                                     // thanh gỗ trắng ngà 4 px: viền tối, mép sáng, mép bóng, viền tối (giữa hai thanh thấy sàn)
      var i;
      for (i = 0; i < (doc ? w : h); i++) {
        var c = i === 0 || i === (doc ? w : h) - 1 ? K.ink : i === 1 ? BM.sanTrang : BM.sanVangSangV2;
        if (doc) p.rect(x + i, y, 1, h, c); else p.rect(x, y + i, w, 1, c);
      }
    }
    function coc(x, y, w, h) {                                            // cọc 3 px bản: viền tối, mặt trên sáng, thân ngà, mép phải tối
      p.rect(x, y, w, h, K.ink); p.rect(x + 1, y + 1, w - 2, h - 2, BM.sanKemToiV1); p.rect(x + 1, y + 1, w - 2, 2, BM.sanTrangV1); p.rect(x + w - 2, y + 3, 1, h - 4, BM.sanVangSangV2);
    }
    if (ngang) {
      xa = (mask & 1) ? 0 : 2; xb = (mask & 2) ? T : 12;
      thanh(xa, 2, xb - xa, 4, false); thanh(xa, 8, xb - xa, 4, false);
    }
    if (doc) {
      ya = (mask & 4) ? 0 : 2; yb = (mask & 8) ? T : 12;
      thanh(2, ya, 4, yb - ya, true); thanh(8, ya, 4, yb - ya, true);
    }
    if (ngang) { if (!(mask & 1)) coc(0, 1, 4, 12); coc(10, 1, 4, 12); }
    if (doc) { if (!(mask & 4)) coc(1, 0, 12, 4); coc(1, 10, 12, 4); }
    var cv = document.createElement('canvas'); cv.width = T; cv.height = T;
    var g = cv.getContext('2d');
    g.fillStyle = BM.moToiV25;                                         // bóng đổ: lệch xuống 2 px, chỉ chỗ sàn trống
    for (y = 0; y < T - 2; y++) for (x = 0; x < T; x++) if (p.get(x, y) && !p.get(x, y + 2)) g.fillRect(x, y + 2, 1, 1);
    g.drawImage(p.canvas(), 0, 0);
    raoCache[mask] = cv; return cv;
  }
  /** NÚT BẮN (chương súng hơi, ký hiệu `N`): nằm trên tường nên nền là ô tường; một tấm thép nhỏ có nút tròn. Tắt: nút đỏ nâu nổi, đèn xám.
   *  Bật: nút xanh lá lún xuống, đèn vàng sáng, vòng sáng quanh tấm. loe (0..1): vừa bị bóng trúng, ánh trắng lóe lên. */
  var nutCache = {};
  function makeNut(bat, loe) {
    var khoa = (bat ? 1 : 0) + '_' + (loe ? 1 : 0);
    if (nutCache[khoa]) return nutCache[khoa];
    var p = new Painter(T, T);
    p.rect(2, 2, 10, 10, K.ink);
    p.rect(3, 3, 8, 8, bat ? BM.sanXanhLaV3 : BM.sanXamToiV2);
    p.rect(3, 3, 8, 1, bat ? BM.sanTrangV4 : BM.sanLamV10); p.rect(3, 3, 1, 8, bat ? BM.sanTrangV4 : BM.sanLamV10);
    p.rect(3, 10, 8, 1, bat ? BM.sanXanhLaToiV3 : BM.sanLamToiV4); p.rect(10, 3, 1, 8, bat ? BM.sanXanhLaToiV3 : BM.sanLamToiV4);
    p.ell(7, bat ? 7.5 : 7, 3, 3, K.ink);
    p.ell(7, bat ? 7.5 : 7, 2.2, 2.2, bat ? BM.sanXanhLaToiV7 : BM.sanDoV8);
    p.px(6, bat ? 6 : 5, bat ? BM.sanXanhLaV1 : BM.sanDoSangV2); p.px(7, bat ? 6 : 5, bat ? BM.sanXanhLaV1 : BM.sanDoSangV2);
    p.rect(6, 1, 2, 1, bat ? BM.sanVangSangV4 : BM.sanXamToiV6);                   // đèn nhỏ ở mép trên tấm
    if (loe) { p.rect(3, 3, 8, 8, BM.sanTrangV1); p.ell(7, 7, 3, 3, BM.sanKemV4); }
    var cv = document.createElement('canvas'); cv.width = T; cv.height = T;
    var g = cv.getContext('2d');
    g.drawImage(makeWall(), 0, 0);
    if (bat) { g.fillStyle = BM.moXanhLa; g.fillRect(1, 1, T - 2, 1); g.fillRect(1, T - 2, T - 2, 1); g.fillRect(1, 1, 1, T - 2); g.fillRect(T - 2, 1, 1, T - 2); }
    g.drawImage(p.canvas(), 0, 0);
    nutCache[khoa] = cv; return cv;
  }
  /** NÚT ĐÈ GIỮ TRÊN SÀN (ký hiệu `M`): tấm cảm biến lực đặt trên cỏ. Chưa đè: mặt vàng cam nổi cao. Đang đè: mặt xanh lá lún xuống và sáng viền. */
  var nutDeCache = {};
  function makeNutDe(bat) {
    var khoa = bat ? '1' : '0';
    if (nutDeCache[khoa]) return nutDeCache[khoa];
    var p = new Painter(T, T);
    p.rect(1, 1, 12, 12, K.ink);
    p.rect(2, 2, 10, 10, BM.sanLamToiV11);
    var y0 = bat ? 3 : 2;
    p.rect(3, y0, 8, 8, bat ? BM.sanXanhLaToiV8 : BM.sanNauSangV9);
    p.rect(3, y0, 8, 1, bat ? BM.sanXanhLaV2 : BM.sanVangSangV3);
    p.rect(3, y0, 1, 8, bat ? BM.sanXanhLaV2 : BM.sanVangSangV3);
    p.rect(3, y0 + 7, 8, 1, bat ? BM.sanXanhLaToiV4 : BM.sanNauSangV1);
    p.rect(10, y0, 1, 8, bat ? BM.sanXanhLaToiV4 : BM.sanNauSangV1);
    p.rect(5, y0 + 2, 4, 4, bat ? BM.sanXanhLaToiV9 : BM.sanCamV2);
    p.rect(6, y0 + 3, 2, 2, bat ? BM.sanTrangV7 : BM.sanNauSangV1);
    [[2, 2], [11, 2], [2, 11], [11, 11]].forEach(function (q) { p.px(q[0], q[1], bat ? BM.sanXanhLaToi : BM.sanLamV18); });
    nutDeCache[khoa] = p.canvas(); return nutDeCache[khoa];
  }
  /** BÀN XOAY (ký hiệu `@` chieu = +1 xoay phải 90°, `%` chieu = -1 xoay trái 90°): mâm xoay cơ khí có mũi tên cong chỉ chiều quay. */
  var banXoayCache = {};
  function makeBanXoay(chieu, ph) {
    var f = (ph || 0) & 3, cw = chieu > 0;
    var khoa = (cw ? 'R' : 'L') + '_' + f;
    if (banXoayCache[khoa]) return banXoayCache[khoa];
    var p = new Painter(T, T);
    p.ell(7, 7, 6.3, 6.3, K.ink);
    p.ell(7, 7, 5.3, 5.3, BM.sanLamToiV12);
    p.ell(7, 7, 4.3, 4.3, cw ? BM.sanNauSangV10 : BM.sanXanhLoToiV5);
    p.ell(7, 7, 3.6, 3.6, cw ? BM.sanNauSangV11 : BM.sanXanhLoToiV6);
    // 4 rãnh đinh tán trên vành xoay theo pha f
    var ranh = [[7, 2], [11, 7], [7, 11], [2, 7]];
    for (var i = 0; i < 4; i++) {
      var q = ranh[i];
      p.px(q[0], q[1], ((i + (cw ? f : 4 - f)) & 1) ? BM.sanLamV19 : BM.sanLamToiV13);
    }
    // vòng mũi tên chỉ chiều xoay (xoay 90° * f)
    var b = new Painter(T, T);
    var sang = cw ? BM.sanKemV5 : BM.sanXanhLoV9, V = cw ? BM.sanVangV3 : BM.sanXanhLoV1;
    if (cw) {
      // cung trên sang phải + đầu mũi tên chỉ xuống ở bên phải
      b.px(5, 3, V); b.px(6, 3, V); b.px(7, 3, sang); b.px(8, 3, sang); b.px(9, 4, sang);
      b.px(10, 5, sang); b.px(9, 5, V); b.px(11, 5, V); b.px(10, 6, BM.sanTrangV1);
      // cung dưới sang trái
      b.px(8, 10, V); b.px(7, 10, V); b.px(6, 10, sang); b.px(5, 10, sang); b.px(4, 9, sang);
      b.px(3, 8, sang); b.px(4, 8, V); b.px(2, 8, V); b.px(3, 7, BM.sanTrangV1);
    } else {
      // cung trên sang trái + đầu mũi tên chỉ xuống ở bên trái
      b.px(8, 3, V); b.px(7, 3, V); b.px(6, 3, sang); b.px(5, 3, sang); b.px(4, 4, sang);
      b.px(3, 5, sang); b.px(4, 5, V); b.px(2, 5, V); b.px(3, 6, BM.sanTrangV1);
      // cung dưới sang phải
      b.px(5, 10, V); b.px(6, 10, V); b.px(7, 10, sang); b.px(8, 10, sang); b.px(9, 9, sang);
      b.px(10, 8, sang); b.px(9, 8, V); b.px(11, 8, V); b.px(10, 7, BM.sanTrangV1);
    }
    for (var k = 0; k < f; k++) b = rot90(b);
    p.blit(b, 0, 0);
    p.rect(6, 6, 2, 2, K.ink);
    p.px(6, 6, BM.sanTrangV8); p.px(7, 7, BM.sanLamV20);
    banXoayCache[khoa] = p.canvas(); return banXoayCache[khoa];
  }
  /** CỔNG DỊCH CHUYỂN ĐÔI (ký hiệu `1` xanh lam điện, `2` tím hồng): vòng năng lượng phát sáng trên sàn. */
  var congCache = {};
  function makeCong(so, ph) {
    var f = (ph || 0) & 3, la2 = String(so) === '2';
    var khoa = (la2 ? '2' : '1') + '_' + f;
    if (congCache[khoa]) return congCache[khoa];
    var p = new Painter(T, T);
    var c1 = la2 ? BM.sanTimV1 : BM.sanXanhLoToiV7;
    var c2 = la2 ? BM.sanTimSangV1 : BM.sanXanhLoToiV2;
    var c3 = la2 ? BM.sanTimSang : BM.sanXanhLoV5;
    p.ell(7, 7, 6.3, 6.3, K.ink);
    p.ell(7, 7, 5.3, 5.3, BM.sanLamToiV14);
    p.ell(7, 7, 4.4, 4.4, c1);
    p.ell(7, 7, 3.4 - (f & 1) * 0.3, 3.4 - (f & 1) * 0.3, c2);
    p.ell(7, 7, 2.0, 2.0, c3);
    p.rect(6, 6, 2, 2, BM.sanTrangV1);
    // 4 tia năng lượng xoay quanh tâm theo pha f
    var tia = [[7, 2], [11, 7], [7, 11], [2, 7], [4, 4], [9, 4], [9, 9], [4, 9]];
    for (var i = 0; i < 4; i++) {
      var q = tia[i + ((f & 1) ? 4 : 0)];
      p.px(q[0], q[1], c3);
    }
    // dấu chấm số hiệu cổng ở mép trên (1 chấm = cổng 1, 2 chấm = cổng 2)
    if (la2) { p.px(5, 1, BM.sanTrangV1); p.px(8, 1, BM.sanTrangV1); }
    else { p.px(6, 1, BM.sanTrangV1); p.px(7, 1, BM.sanTrangV1); }
    congCache[khoa] = p.canvas(); return congCache[khoa];
  }
  /** CỬA (chương súng hơi, `C` đóng / `c` mở), vẽ thẳng lên g tại (px, py) trên nền sàn đã có. k = độ mở 0 (đóng) .. 1 (mở); hai cánh cửa trượt vào hai cột khung.
   *  o = { doc: true nếu đi qua cửa theo chiều dọc (cánh trượt ngang), nhip: { mo, dong, pha, p } nếu là cửa nhịp (khung xanh lơ + hàng đèn đếm nhịp ở mép trên), ket: 0..1 cửa đang kẹt (đỏ), rung: lệch px }.
   *  Cửa đóng giống tường nhưng có khung cửa (cột khung màu vàng cam, hoặc xanh lơ nếu là cửa nhịp) và khe giữa hai cánh. */
  function veCua(g, px, py, k, o) {
    o = o || {};
    var nhip = o.nhip, khung = nhip ? [BM.sanXanhLoToiV1, BM.sanXanhLoV10, BM.sanXanhLoToiV8] : [BM.sanVangV4, BM.sanVangSang, BM.sanNauSangV12];
    var doc = o.doc !== false, ox = Math.round(o.rung || 0);
    var P = new Painter(T, T), i;
    // quy ước vẽ cho cửa đi theo chiều dọc (cánh trượt ngang); cửa đi ngang thì xoay 90° ở cuối
    var rong = Math.max(0, Math.min(4, Math.round(4 * (1 - k))));          // bề ngang mỗi cánh còn lại (0..4)
    P.rect(0, 0, 1, T, K.ink); P.rect(1, 0, 1, T, khung[1]); P.rect(2, 0, 1, T, khung[0]);          // cột khung trái
    P.rect(T - 1, 0, 1, T, K.ink); P.rect(T - 2, 0, 1, T, khung[2]); P.rect(T - 3, 0, 1, T, khung[0]);   // cột khung phải
    // hai cánh: trái x = 3 .. 3 + rong - 1, phải x = T - 4 - rong + 1 .. T - 4
    function canh(x0, w) {
      if (w <= 0) return;
      P.rect(x0, 0, w, T, K.ink);
      if (w > 2) {
        P.rect(x0 + 1, 1, w - 2, T - 2, BM.sanLamV9);
        P.rect(x0 + 1, 1, w - 2, 1, BM.sanLam);
        for (var y = 3; y < T - 2; y += 3) P.rect(x0 + 1, y, w - 2, 1, BM.sanXamToiV2);
      } else if (w === 2) { P.rect(x0, 1, 1, T - 2, BM.sanLam); P.rect(x0 + 1, 1, 1, T - 2, BM.sanXamToiV2); P.rect(x0, 0, 2, 1, K.ink); }
    }
    canh(3, rong); canh(T - 3 - rong, rong);
    if (rong >= 4) {                                                       // đóng hẳn: khe giữa + đèn đỏ
      P.rect(6, 0, 2, T, K.ink); P.rect(6, 1, 1, T - 2, BM.sanXamToiV7); P.rect(7, 1, 1, T - 2, BM.sanLamToiV15);
      P.rect(5, 6, 4, 2, K.ink); P.rect(6, 6, 2, 1, BM.sanDo); P.px(6, 7, BM.sanDoV4); P.px(7, 7, BM.sanDoV4);
    } else if (rong <= 0) {                                                // mở hẳn: đèn xanh trên cột khung
      P.px(1, 6, BM.sanXanhLaToi); P.px(T - 2, 6, BM.sanXanhLaToi);
    }
    var cv = document.createElement('canvas'); cv.width = T; cv.height = T;
    var c2 = cv.getContext('2d'), src = P.canvas();
    if (doc) c2.drawImage(src, 0, 0);
    else { c2.translate(T / 2, T / 2); c2.rotate(Math.PI / 2); c2.translate(-T / 2, -T / 2); c2.drawImage(src, 0, 0); c2.setTransform(1, 0, 0, 1, 0, 0); }
    if (k < 1) { c2.fillStyle = 'rgba(' + BM.tiaDenRgb + ',' + (0.3 * (1 - k)).toFixed(3) + ')'; if (doc) c2.fillRect(3 + rong, 1, T - 6 - 2 * rong, T - 2); else c2.fillRect(1, 3 + rong, T - 2, T - 6 - 2 * rong); }
    if (o.ket > 0) { c2.fillStyle = 'rgba(' + BM.tiaDoV2Rgb + ',' + (0.18 + 0.32 * o.ket).toFixed(3) + ')'; c2.fillRect(0, 0, T, T); }
    g.drawImage(cv, px + ox, py);
    if (nhip) {                                                            // hàng đèn đếm nhịp ở mép trên: xanh lá = mở, đỏ = đóng, đèn đang sáng có viền trắng và nhấp nháy khi sắp đổi
      var chu = nhip.mo + nhip.dong, n = Math.min(chu, 6), w = n > 4 ? 1 : 2, gap = 1, tong = n * w + (n - 1) * gap, x0 = px + Math.floor((T - tong) / 2) + ox;
      g.fillStyle = K.ink; g.fillRect(x0 - 1, py, tong + 2, 4);
      for (i = 0; i < n; i++) {
        var dang = i === nhip.p, mo = i < nhip.mo, sapDoi = dang && (((nhip.p + 1) % chu) === 0 || ((nhip.p + 1) % chu) === nhip.mo);
        var tat = dang && sapDoi && (Math.floor(((o.now || 0) / 160)) & 1);
        g.fillStyle = dang ? (tat ? (mo ? BM.sanXanhLaToiV5 : BM.sanDoV5) : (mo ? BM.sanXanhLaToi : BM.sanDoV9)) : (mo ? BM.sanXanhLaToiV5 : BM.sanDoV5);
        g.fillRect(x0 + i * (w + gap), py + 1, w, 2);
        if (dang && !tat) { g.fillStyle = BM.sanTrangV1; g.fillRect(x0 + i * (w + gap), py + 1, w, 1); }
      }
    }
  }
  /** Khối hàng (thùng gỗ) trên sàn sân thử: vẽ trong ô T×T, chừa mép để thấy cỏ quanh. */
  var crateCache = null;
  /** Vẽ thân thùng gỗ vào một Painter T×T (chưa viền): dùng chung cho thùng thường và thùng có dải màu. */
  function veThanThung() {
    var p = new Painter(T, T);
    p.rect(1, 1, T - 2, T - 2, BM.vatCam);
    p.rect(1, 1, T - 2, 1, BM.vatCamV1); p.rect(1, 1, 1, T - 2, BM.vatCamV1);
    p.rect(1, T - 2, T - 2, 1, BM.vatNau); p.rect(T - 2, 1, 1, T - 2, BM.vatNau);
    p.rect(2, 2, T - 4, 1, BM.vatNauV1); p.rect(2, T - 3, T - 4, 1, BM.vatNauV1); p.rect(2, 2, 1, T - 4, BM.vatNauV1); p.rect(T - 3, 2, 1, T - 4, BM.vatNauV1);
    for (var i = 3; i < T - 3; i++) { p.px(i, i, BM.vatNau); p.px(T - 1 - i, i, BM.vatNau); }
    [[2, 2], [T - 3, 2], [2, T - 3], [T - 3, T - 3]].forEach(function (q) { p.px(q[0], q[1], BM.vatKem); });
    return p;
  }
  function makeCrate() {
    if (crateCache) return crateCache;
    var p = veThanThung();
    p.outline(K.ink);
    crateCache = p.canvas(); return crateCache;
  }
  /** Vật SẮT (chương nam châm): khối kim loại xám xanh có ánh bạc, đinh tán ở góc, bu lông sáu cạnh ở giữa. Khác thùng gỗ (nâu, nan chéo) và thùng nặng (xám thép, sọc vàng đen). */
  var sat = null;
  function veThanSat() {
    var p = new Painter(T, T), x, y;
    p.rect(1, 1, T - 2, T - 2, BM.vatLamV2);                                   // thân xám xanh
    for (y = 2; y < T - 2; y += 2) p.rect(2, y, T - 4, 1, BM.vatLamV9);       // thớ kim loại ngang (đánh bóng)
    p.rect(1, 1, T - 2, 1, BM.vatLamV3); p.rect(1, 1, 1, T - 2, BM.vatLamV3);    // mép sáng trên trái: ánh bạc
    p.rect(1, T - 2, T - 2, 1, BM.vatLam); p.rect(T - 2, 1, 1, T - 2, BM.vatLam);   // mép tối dưới phải
    p.rect(2, 2, T - 4, 1, BM.vatLamV4); p.rect(2, 2, 1, T - 4, BM.vatLamV4);
    p.rect(2, T - 3, T - 4, 1, BM.vatLamV5); p.rect(T - 3, 2, 1, T - 4, BM.vatLamV5);
    [[2, 2], [T - 3, 2], [2, T - 3], [T - 3, T - 3]].forEach(function (q) { p.px(q[0], q[1], BM.vatTrang); p.px(q[0] + (q[0] > 6 ? -1 : 1), q[1], BM.vatLam); });
    p.rect(4, 3, 6, 6, BM.vatLam);                                           // ổ bu lông
    p.rect(5, 3, 4, 6, BM.vatLamV6); p.rect(4, 4, 6, 4, BM.vatLamV6);            // đầu bu lông sáu cạnh
    p.rect(6, 5, 2, 2, BM.vatLamV10);                                           // lỗ giữa
    p.px(5, 4, BM.vatTrang); p.px(6, 3, BM.vatTrang); p.px(9, 7, BM.vatLamV11);
    p.px(11, 4, BM.vatTrang); p.px(3, 11, BM.vatLamV12);                          // hai điểm lóe sáng
    return p;
  }
  function makeSat() {
    if (sat) return sat;
    var p = veThanSat(); p.outline(K.ink);
    sat = p.canvas(); return sat;
  }
  /** Bản có dải màu (vật sắt mang màu): dải 3 hàng quanh thân. */
  var satMauCache = {};
  function makeSatMau(mau) {
    if (satMauCache[mau]) return satMauCache[mau];
    var c = MAU[mau], p = veThanSat();
    p.rect(1, 10, T - 2, 3, c.n); p.rect(1, 10, T - 2, 1, c.s); p.rect(1, 12, T - 2, 1, c.t);
    p.rect(1, 9, T - 2, 1, K.ink);
    p.outline(K.ink);
    satMauCache[mau] = p.canvas(); return satMauCache[mau];
  }
  /** Thùng NẶNG (chương súng hơi): thùng thép xám, bốn đinh tán ở góc, sọc vàng đen ở mép trên và mép dưới, viền tối. Khác hẳn thùng gỗ. */
  var thungCache = null;
  function makeThung() {
    if (thungCache) return thungCache;
    var p = new Painter(T, T), x, y;
    p.rect(1, 1, T - 2, T - 2, BM.vatXam);
    p.rect(1, 1, T - 2, 1, BM.vatLamV7); p.rect(1, 1, 1, T - 2, BM.vatLamV7);
    p.rect(1, T - 2, T - 2, 1, BM.vatLamV1); p.rect(T - 2, 1, 1, T - 2, BM.vatLamV1);
    p.rect(3, 4, T - 6, T - 8, BM.vatXamV1);                                  // tấm giữa lõm
    p.rect(3, 4, T - 6, 1, BM.vatLamV1); p.rect(3, 4, 1, T - 8, BM.vatLamV1);
    p.rect(3, T - 5, T - 6, 1, BM.vatLamV8); p.rect(T - 4, 4, 1, T - 8, BM.vatLamV8);
    for (x = 2; x < T - 2; x++) {                                           // sọc vàng đen chéo: hàng 2 (trên) và hàng 11 (dưới)
      var c = ((x >> 1) & 1) ? BM.vienDam : BM.vatVang;
      p.px(x, 2, c); p.px(T - 1 - x, T - 3, c);
    }
    [[1, 1], [T - 2, 1], [1, T - 2], [T - 2, T - 2]].forEach(function (q) { p.px(q[0], q[1], BM.vatTrangV1); });
    [[4, 6], [T - 5, 6], [4, T - 7], [T - 5, T - 7]].forEach(function (q) { p.px(q[0], q[1], BM.vatLamV13); p.px(q[0] + 1, q[1] + 1, BM.vatLamV14); });
    for (y = 6; y < T - 6; y++) p.px(T >> 1, y, BM.vatLamV15);                 // gân giữa
    p.outline(K.ink);
    thungCache = p.canvas(); return thungCache;
  }
  /** Ô SẠC của drone (ký hiệu `P`): đế thép tối nằm trên sàn, vòng xanh lơ ở trong và tia chớp vàng ở giữa (khác ô sàn, ô đích khung vàng nét đứt và cờ).
   *  frame 0 / 1: bốn đèn ở góc nháy luân phiên (đế đang chờ). */
  var sacCache = {};
  function makeSac(frame) {
    frame = frame & 1;
    if (sacCache[frame]) return sacCache[frame];
    var p = new Painter(T, T), i;
    p.rect(1, 1, 12, 12, K.ink);
    p.rect(2, 2, 10, 10, BM.sanLamToiV2);
    p.rect(2, 2, 10, 1, BM.sanLamV11); p.rect(2, 2, 1, 10, BM.sanLamV11);
    p.rect(2, 11, 10, 1, BM.sanLamToiV5); p.rect(11, 2, 1, 10, BM.sanLamToiV5);
    for (i = 3; i <= 10; i++) { p.px(i, 3, BM.sanXanhLoToi); p.px(i, 10, BM.sanXanhLoToi); p.px(3, i, BM.sanXanhLoToi); p.px(10, i, BM.sanXanhLoToi); }     // vòng xanh lơ
    p.rect(4, 4, 6, 6, BM.sanLamToiV3);
    [[1, 1], [12, 1], [1, 12], [12, 12]].forEach(function (q, k) { p.px(q[0], q[1], (k + frame) % 2 ? BM.sanVangV5 : BM.sanNgoc); });
    ['...##', '..##.', '.###.', '..##.', '.##..', '.#...'].forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (row.charAt(x) === '#') p.px(5 + x - 1, 4 + y, y < 2 ? BM.sanKem : BM.sanVang); });     // tia chớp vàng 5×6
    sacCache[frame] = p.canvas(); return sacCache[frame];
  }
  var convCache = {};
  function makeConv(d, frame) {
    var key = d + '_' + frame; if (convCache[key]) return convCache[key];
    var p = new Painter(T, T);
    p.rect(0, 0, T, T, BM.sanLamToiV16);
    p.rect(2, 2, T - 4, T - 4, BM.sanLamToiV17);
    for (var y = 3; y <= 10; y++) {
      var t = (y + frame) % 5;
      if (t === 0) p.rect(6, y, 2, 1, BM.sanTrangV2);
      else if (t === 1) p.rect(5, y, 4, 1, BM.sanTrangV2);
      else if (t === 2) p.rect(4, y, 6, 1, BM.sanLamV21);
      else if (t === 3) p.rect(6, y, 2, 1, BM.sanLamV5);
    }
    p.rect(0, 0, T, 1, BM.sanLamToi); p.rect(0, T - 1, T, 1, BM.sanLamToi); p.rect(0, 0, 1, T, BM.sanLamToi); p.rect(T - 1, 0, 1, T, BM.sanLamToi);
    p.rect(1, 1, T - 2, 1, BM.sanLamV2); p.rect(1, 1, 1, T - 2, BM.sanLamV2);
    [[1, 1], [12, 1], [1, 12], [12, 12]].forEach(function (q) { p.px(q[0], q[1], BM.sanLamV22); });
    var q = p; for (var r = 0; r < d; r++) q = rot90(q);
    convCache[key] = q.canvas(); return convCache[key];
  }
  /** Cờ 12×13 (gọn trong một ô 14 px: trước là 16×16 tràn quá ô, to hơn xe). */
  function makeFlag(frame) {
    var p = new Painter(12, 13);
    p.rect(1, 10, 6, 2, BM.sanXamToiV8); p.rect(1, 10, 6, 1, BM.sanXamToiV9); p.rect(2, 11, 4, 1, BM.sanLamToiV18);
    p.rect(3, 2, 1, 8, BM.sanTrangV9);
    var wave = [0, 1, 0, -1][frame % 4];
    for (var c = 0; c < 7; c++) {
      var yo = (c > 2 ? wave : 0) + (c > 4 ? wave : 0);
      for (var r = 0; r < 5; r++) p.px(4 + c, 3 + r + yo, r === 0 ? BM.sanDoSangV5 : (r === 4 ? BM.sanDoV10 : BM.sanDoV11));
    }
    p.rect(2, 1, 3, 1, BM.sanVang);
    p.outline(K.ink);
    return p.canvas();
  }
  var robotCache = {};
  function makeRobot(dir, wl, wr, ph) {
    var key = dir + '_' + wl + '_' + wr + '_' + ph; if (robotCache[key]) return robotCache[key];
    var p = new Painter(16, 16);
    p.rect(3, 1, 10, 14, BM.robotNauV4); p.rect(4, 2, 8, 12, BM.robotVang);
    p.rect(4, 6, 8, 1, BM.robotVangSang); p.rect(4, 6, 1, 7, BM.robotVangSangV1); p.rect(11, 6, 1, 7, BM.robotNauSang); p.rect(4, 13, 8, 1, BM.robotNauSang);
    p.rect(4, 2, 8, 4, BM.robotLamToi); p.rect(5, 3, 2, 2, BM.robotXanhLo); p.rect(9, 3, 2, 2, BM.robotXanhLo); p.rect(7, 4, 2, 1, BM.robotLamV10);
    p.rect(7, 7, 2, 1, BM.robotNau); p.rect(6, 8, 4, 1, BM.robotNau); p.rect(5, 9, 6, 1, BM.robotNau);
    function wheel(x0, st) {
      var base = st === 0 ? BM.robotXamToiV3 : st === 1 ? BM.robotXanhLoToiV1 : BM.robotXanhLoToiV3;
      p.rect(x0, 3, 3, 12, base);
      for (var y = 3; y < 15; y++) {
        var on = ((y + (st === 2 ? ph : 0)) & 1) === 0;
        var c = st === 0 ? (on ? BM.robotXamV1 : BM.robotXamToiV4) : st === 1 ? (on ? BM.robotXanhLoV3 : BM.robotXanhLoToiV1) : (on ? BM.robotTrang : BM.robotXanhLoV4);
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
    var leg = BM.robotTimV5;
    for (var i = 0; i < 4; i++) {
      var y = 3 + i * 3, off = ((i + ph) & 1);
      p.rect(1 + off, y, 4, 1, leg); p.rect(11 - off, y, 4, 1, leg);
      p.px(1 + off, y + 1, leg); p.px(14 - off, y + 1, leg);
    }
    p.ell(8, 9, 4.6, 5.4, BM.robotTimSangV3); p.ell(8, 9, 3.4, 4.2, BM.robotTimSangV4);
    p.ell(8, 4.5, 3, 2.6, BM.robotTimV6);
    p.rect(6, 4, 1, 2, BM.robotTrangV1); p.rect(9, 4, 1, 2, BM.robotTrangV1); p.px(6, 5, BM.robotDo); p.px(9, 5, BM.robotDo);
    p.rect(7, 11, 2, 2, BM.robotTimSangV5);
    var q = new Painter(18, 18); q.blit(p, 1, 1); q.outline(K.ink);
    nhenCache[key] = q.canvas(); return nhenCache[key];
  }
  /* ---- CHƯƠNG CẢM BIẾN MÀU: ô sàn tô màu (tấm sơn pixel), thùng gỗ có dải màu */
  var MAU = {                                                             // tên màu của lõi → bảng màu: n nền, s sáng, t tối (viền), d đốm
    red: { n: BM.luatSanDo, s: BM.luatSanDoSang, t: BM.luatSanDoToi, d: BM.luatSanDoDom, vi: BM.luatSanDoVien },
    green: { n: BM.luatSanXanhLa, s: BM.luatSanXanhLaSang, t: BM.luatSanXanhLaToi, d: BM.luatSanXanhLaDom, vi: BM.luatSanXanhLaVien },
    blue: { n: BM.luatSanXanhDuong, s: BM.luatSanXanhDuongSang, t: BM.luatSanXanhDuongToi, d: BM.luatSanXanhDuongDom, vi: BM.luatSanXanhDuongVien },
    yellow: { n: BM.luatSanVang, s: BM.luatSanVangSang, t: BM.luatSanVangToi, d: BM.luatSanVangDom, vi: BM.luatSanVangVien }
  };
  var MAU_TEN = ['red', 'green', 'blue', 'yellow'];
  var matMauCache = {};
  /** Ô sàn màu `mau`: tấm sơn có viền tối, vạt sáng ở mép trên trái, vạt tối ở mép dưới phải, vài đốm; mỗi màu thêm một dấu nhỏ ở góc (không phụ thuộc phân biệt màu). */
  function makeMatMau(mau, seed) {
    var k = mau + (seed || 0);
    if (matMauCache[k]) return matMauCache[k];
    var c = MAU[mau], p = new Painter(T, T), r = rng(11 + MAU_TEN.indexOf(mau) * 7 + (seed || 0));
    p.rect(0, 0, T, T, c.t);
    p.rect(1, 1, T - 2, T - 2, c.n);
    for (var i = 0; i < 12; i++) p.px(2 + Math.floor(r() * 10), 2 + Math.floor(r() * 10), c.d);
    p.rect(1, 1, T - 2, 1, c.s); p.rect(1, 1, 1, T - 2, c.s);
    p.rect(1, T - 2, T - 2, 1, c.t); p.rect(T - 2, 1, 1, T - 2, c.t);
    p.rect(2, 2, T - 4, 1, c.d); p.rect(2, 2, 1, T - 4, c.d);
    matMauCache[k] = p.canvas(); return matMauCache[k];
  }
  var thungMauCache = {};
  /** Thùng gỗ có dải màu quanh thân (dải 4 hàng, viền tối trên dưới): thùng sơn màu. */
  function makeCrateMau(mau) {
    if (thungMauCache[mau]) return thungMauCache[mau];
    var c = MAU[mau], p = veThanThung();
    p.rect(1, 5, T - 2, 4, c.n);
    p.rect(1, 5, T - 2, 1, c.s); p.rect(1, 8, T - 2, 1, c.t);
    p.rect(1, 4, T - 2, 1, K.ink); p.rect(1, 9, T - 2, 1, K.ink);
    p.px(3, 6, c.s); p.px(10, 7, c.d); p.px(6, 6, c.d);
    p.outline(K.ink);
    thungMauCache[mau] = p.canvas(); return thungMauCache[mau];
  }

  /** VẬT NHỎ (luật vật 14/10): vật n×n pixel gồm viền tối; n = 8 cho vật nằm đất (≈ 57% ô 14×14), n = 10 cho vật trong kẹp tính theo pixel part.
   *  Hình vẽ nằm ở part/part.js (Part.veVatNho) để tay kẹp và sân dùng chung một kiểu; chưa nạp part thì vẽ khối phẳng. mau: tên màu ('red'…) hoặc null. */
  var vatNhoCache = {};
  function makeVatNho(n, chat, mau, cuc) {
    var nc = chat === 'nam-cham' && (cuc === 'N' || cuc === 'S');
    var k = n + '|' + (nc ? 'n' + cuc : chat === 'sat' ? 's' : 'g') + '|' + (nc ? '' : (mau || ''));
    if (vatNhoCache[k]) return vatNhoCache[k];
    var p = new Painter(n, n), P = (typeof window !== 'undefined') ? window.Part : null;
    if (P && P.veVatNho) P.veVatNho(p, 0, 0, n, chat, mau, cuc);
    else { p.rect(0, 0, n, n, K.ink); p.rect(1, 1, n - 2, n - 2, nc ? (cuc === 'N' ? BM.vatDo : BM.vatLamV16) : chat === 'sat' ? BM.vatLamV2 : BM.vatCam); }
    vatNhoCache[k] = p.canvas(); return vatNhoCache[k];
  }

  var tileCache = null;
  function tiles() {
    if (tileCache) return tileCache;
    var matMau = {}, thungMau = {}, satMau = {};
    MAU_TEN.forEach(function (m) { matMau[m] = [makeMatMau(m, 0), makeMatMau(m, 1)]; thungMau[m] = makeCrateMau(m); satMau[m] = makeSatMau(m); });
    tileCache = {
      mau: matMau, crateMau: thungMau, sat: makeSat(), satMau: satMau,
      crate: makeCrate(), thung: makeThung(), rug: [makeRug(0, 0, 5), makeRug(1, 0, 9), makeRug(0, 0, 13), makeRug(1, 0, 17)], pad: makeRug(0, 1, 7), wall: makeWall(), stair: makeStair(), ho: makeHo(), gam: makeGam(false), gamMai: makeGam(true), sac: [makeSac(0), makeSac(1)],
      flags: [makeFlag(0), makeFlag(1), makeFlag(2), makeFlag(3)], rao: makeRao, nut: makeNut, nutDe: makeNutDe, banXoay: makeBanXoay, cong: makeCong
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
  function ico(ten, s, tuyChon) { return mk(ten === 'edit' ? spriteBut() : icon(ten, tuyChon), s || 2); }
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
      else if (ten === 'huyhieu') node = mk(window.HuyHieu && el.getAttribute('data-ma') ? HuyHieu.ve(el.getAttribute('data-ma'), el.getAttribute('data-tt') || 'xong') : spriteHuyHieu(), s);
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
    spriteTrum: spriteTrum, tiles: tiles, makeConv: makeConv, makeCrate: makeCrate, makeRao: makeRao, makeNut: makeNut, makeNutDe: makeNutDe, makeBanXoay: makeBanXoay, makeCong: makeCong, veCua: veCua, makeSat: makeSat, makeVatNho: makeVatNho, makeThung: makeThung, makeSac: makeSac, MAU: MAU, MAU_TEN: MAU_TEN, makeRobot: makeRobot, makeNhen: makeNhen, HINH: HINH
  };
})();
