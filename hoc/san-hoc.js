/* ============================================================================
   san-hoc.js — "Đường học": MÔ PHỎNG SÂN theo NHỊP cho game dạy Python qua robot.

   Chạy được trong Node (module.exports) và trình duyệt (window.SanHoc).
   Dựa trên nhân chạy code của docs/mockups/san-robot-core.js (window.RobotCore):
   nhân nhường ra ngoài từng lời gọi hàm của game, ở đây ta thực hiện chúng.

   Sân: mảng chuỗi, (x, y) với y = 0 ở hàng trên.
     .  sàn      #  tường     F  cờ đích     S  bậc thang (chỉ nhện leo được)
     >  <  ^  v  băng chuyền, chiều đẩy
   Hướng robot: 0 lên, 1 phải, 2 xuống, 3 trái.

   Hai loại robot:
     'banh' (xe bánh): left_move / right_move / left_back / right_back chỉ RA LỆNH
        cho bánh trong nhịp hiện tại; wait() kết thúc nhịp và robot làm theo tổ hợp.
     'nhen' (nhện): go_up / go_down / go_left / go_right, mỗi lệnh 2 nhịp, sang ô mới
        ở CUỐI nhịp thứ hai; wait() = 1 nhịp đứng yên. Không có hướng mặt.

   Băng chuyền: mỗi nhịp, SAU khi robot làm xong hành động, nếu robot đang đứng trên
   ô băng thì demBang++; đủ 2 thì đẩy 1 ô theo mũi tên (bị chặn thì đứng yên) và
   demBang = 0. Không đứng trên băng thì demBang = 0.

   Thắng NGAY khi robot chạm ô cờ (tự đi tới hoặc bị băng đẩy tới).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var Core = laNode ? require('../../docs/mockups/san-robot-core.js') : window.RobotCore;

  /* ------------------------------------------------------------------ hằng */

  // 0 lên, 1 phải, 2 xuống, 3 trái → vectơ (dx, dy), y = 0 ở hàng trên
  var VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  var TEN_HUONG = ['lên', 'phải', 'xuống', 'trái'];
  var BANG = { '>': 1, 'v': 2, '<': 3, '^': 0 };      // ký hiệu băng → hướng đẩy

  var HAM_GOC = {
    banh: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'],
    nhen: ['go_up', 'go_down', 'go_left', 'go_right', 'wait']
  };
  var NHEN_HUONG = { go_up: 0, go_right: 1, go_down: 2, go_left: 3 };
  var BANH_LENH = {
    left_move: ['trai', 1], left_back: ['trai', -1],
    right_move: ['phai', 1], right_back: ['phai', -1]
  };

  /* ------------------------------------------------------------------- sân */

  function docSan(rows) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Sân phải là mảng chuỗi, không rỗng.');
    var rong = rows[0].length, co = null;
    for (var y = 0; y < rows.length; y++) {
      if (rows[y].length !== rong) throw new Error('Sân không phải hình chữ nhật (dòng ' + (y + 1) + ').');
      for (var x = 0; x < rong; x++) {
        var c = rows[y][x];
        if (c === 'F') { if (!co) co = { x: x, y: y }; }
        else if ('.#S'.indexOf(c) < 0 && BANG[c] === undefined) {
          throw new Error('Ký hiệu lạ trong sân: "' + c + '" (' + x + ', ' + y + ').');
        }
      }
    }
    return { o: rows.slice(), rong: rong, cao: rows.length, co: co };
  }

  function oTai(san, x, y) {
    if (x < 0 || y < 0 || x >= san.rong || y >= san.cao) return null;   // ngoài sân
    return san.o[y][x];
  }

  /** Robot loại `loai` có vào được ô (x, y) không? Trả về null nếu được,
   *  hoặc lý do bị chặn: 'ngoai-san' | 'tuong' | 'bac-thang'. */
  function lyDoChan(san, loai, x, y) {
    var c = oTai(san, x, y);
    if (c === null) return 'ngoai-san';
    if (c === '#') return 'tuong';
    if (c === 'S' && loai === 'banh') return 'bac-thang';
    return null;
  }

  /* ----------------------------------------------------------------- chạy */

  /**
   * Chạy một chương trình Python trên một sân.
   * cfg: { san: [chuỗi], batDau: {x,y,huong}, loaiRobot: 'banh'|'nhen',
   *        hamGoc: [tên hàm gốc được phép] (mặc định: đủ bộ của loại robot),
   *        nhipToiDa: 200 }
   * opt: { nganSachLenh: 20000 }
   * Trả về:
   *   { thang, nhip, robot: {x,y,huong}, loi, vet, suKien, lenhTon }
   *   - loi: null | { loai, dong, thongDiep } — loại của core ('syntax-error',
   *     'indent-error', 'runtime-error', 'infinite-loop') hoặc 'qua-nhieu-nhip'.
   *     `dong` là số dòng của mã Python (đổi sang cột/dòng là việc của ChamHoc).
   *   - vet: dãy { loai:'lenh', ten, dongPy, nganPy } và
   *          { loai:'nhip', nhip, robot:{x,y,huong,banh:{trai,phai}}, suKien:[…] }
   *   - suKien: các mốc chẩn đoán { ma:'dam-tuong'|'banh-goi-lai'|'quen-wait', … }
   */
  function chay(cfg, code, opt) {
    opt = opt || {};
    var loai = cfg.loaiRobot || 'banh';
    if (loai !== 'banh' && loai !== 'nhen') throw new Error('Loại robot lạ: ' + loai);
    var san = docSan(cfg.san);
    var bd = cfg.batDau;
    if (!bd) throw new Error('Thiếu vị trí xuất phát (batDau).');
    if (lyDoChan(san, loai, bd.x, bd.y)) throw new Error('Robot xuất phát trong chỗ không đứng được.');
    var nhipToiDa = cfg.nhipToiDa || 200;

    var hamGoc = cfg.hamGoc || HAM_GOC[loai];
    hamGoc.forEach(function (t) {
      if (HAM_GOC[loai].indexOf(t) < 0) throw new Error('Hàm gốc "' + t + '" không thuộc loại robot ' + loai + '.');
    });
    var api = {};
    hamGoc.forEach(function (t) { api[t] = function () { return 0; }; });   // chỉ để nhân biết tên

    var rb = { x: bd.x, y: bd.y, huong: bd.huong || 0 };
    var nhip = 0, demBang = 0;
    var lenh = { trai: 0, phai: 0 };            // lệnh bánh đang chờ wait()
    var lenhTon = [];                           // các lệnh bánh chưa wait(): {ten, dongPy}
    var vet = [], suKienChan = [];
    var thang = false, loi = null;

    function chup() { return { x: rb.x, y: rb.y, huong: rb.huong }; }

    /** Một nhịp trôi qua. hanhDong: {kieu:'banh', trai, phai} | {kieu:'nhen', huong|null}.
     *  Trả về true nếu phải dừng (thắng hoặc hết nhịp). */
    function motNhip(hanhDong) {
      if (nhip >= nhipToiDa) {
        loi = { loai: 'qua-nhieu-nhip', dong: 0, thongDiep: 'Quá ' + nhipToiDa + ' nhịp.' };
        return true;
      }
      nhip++;
      var sk = [];
      var banhGhi = { trai: 0, phai: 0 };

      function thuDi(huongDi, soBuoc, ma) {
        var v = VEC[huongDi], nx = rb.x + v[0] * soBuoc, ny = rb.y + v[1] * soBuoc;
        var ly = lyDoChan(san, loai, nx, ny);
        if (ly) {
          var e = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: { x: rb.x, y: rb.y }, vat: ly };
          sk.push(e); suKienChan.push(e);
        } else {
          rb.x = nx; rb.y = ny; sk.push({ ma: ma, den: { x: nx, y: ny } });
        }
      }

      if (hanhDong.kieu === 'banh') {
        var t = hanhDong.trai, p = hanhDong.phai;
        banhGhi = { trai: t, phai: p };
        if (t === 1 && p === 1) thuDi(rb.huong, 1, 'tien');
        else if (t === -1 && p === -1) thuDi(rb.huong, -1, 'lui');
        else if ((t === 1 && p === -1) || (t === -1 && p === 1)) { rb.huong = (rb.huong + 2) % 4; sk.push({ ma: 'quay-dau' }); }
        else if ((t === 1 && p === 0) || (t === 0 && p === -1)) { rb.huong = (rb.huong + 1) % 4; sk.push({ ma: 'quay-phai' }); }
        else if ((t === 0 && p === 1) || (t === -1 && p === 0)) { rb.huong = (rb.huong + 3) % 4; sk.push({ ma: 'quay-trai' }); }
        else sk.push({ ma: 'dung-yen' });
      } else {
        if (hanhDong.huong === null || hanhDong.huong === undefined) sk.push({ ma: 'dung-yen' });
        else if (hanhDong.buoc === 2) thuDi(hanhDong.huong, 1, 'di');
        else sk.push({ ma: 'chuan-bi' });         // nhịp thứ nhất của lệnh go_*: chưa rời ô
      }

      // băng chuyền — sau hành động của nhịp
      var c = oTai(san, rb.x, rb.y);
      if (c !== null && BANG[c] !== undefined) {
        demBang++;
        if (demBang >= 2) {
          var hd = BANG[c], vb = VEC[hd], bx = rb.x + vb[0], by = rb.y + vb[1];
          var lyB = lyDoChan(san, loai, bx, by);
          if (lyB) sk.push({ ma: 'bang-chan', den: { x: bx, y: by }, vat: lyB });
          else { rb.x = bx; rb.y = by; sk.push({ ma: 'bang-day', den: { x: bx, y: by } }); }
          demBang = 0;
        }
      } else demBang = 0;

      if (san.co && rb.x === san.co.x && rb.y === san.co.y) { thang = true; sk.push({ ma: 'toi-co' }); }
      var r = chup(); r.banh = banhGhi;
      vet.push({ loai: 'nhip', nhip: nhip, robot: r, suKien: sk });
      return thang;
    }

    /** Xử lý một lời gọi hàm gốc nhân nhường ra. Trả về true nếu phải dừng. */
    function xuLy(yc) {
      vet.push({ loai: 'lenh', ten: yc.ten, dongPy: yc.dong, nganPy: yc.ngan });
      if (yc.ten === 'wait') {
        if (loai === 'banh') {
          var h = { kieu: 'banh', trai: lenh.trai, phai: lenh.phai };
          lenh.trai = 0; lenh.phai = 0; lenhTon = [];
          return motNhip(h);
        }
        return motNhip({ kieu: 'nhen', huong: null });
      }
      if (loai === 'banh') {
        var bl = BANH_LENH[yc.ten];
        if (lenh[bl[0]] !== 0) {
          suKienChan.push({ ma: 'banh-goi-lai', nhip: nhip + 1, banh: bl[0], ten: yc.ten, dongPy: yc.dong });
          return false;
        }
        lenh[bl[0]] = bl[1];
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      var hh = NHEN_HUONG[yc.ten];
      return motNhip({ kieu: 'nhen', huong: hh, buoc: 1 }) || motNhip({ kieu: 'nhen', huong: hh, buoc: 2 });
    }

    var g = Core.chayCodeGen(code, api, { nganSachLenh: opt.nganSachLenh || 20000 });
    try {
      var r = g.next();
      while (!r.done) {
        if (xuLy(r.value)) { g.return(); break; }
        r = g.next(0);
      }
    } catch (e) {
      if (e && e.cuaGame) loi = { loai: e.loai, dong: e.dong, thongDiep: e.thongDiep };
      else throw e;
    }

    // chương trình hết mà còn lệnh bánh chưa wait() → lệnh đó không chạy
    if (!thang && !loi && lenhTon.length) {
      suKienChan.push({ ma: 'quen-wait', nhip: nhip, lenh: lenhTon.slice() });
    }

    return {
      thang: thang, nhip: nhip, robot: chup(), loi: loi, vet: vet,
      suKien: suKienChan, lenhTon: lenhTon, batDau: { x: bd.x, y: bd.y, huong: bd.huong || 0 }
    };
  }

  var API = {
    VEC: VEC, TEN_HUONG: TEN_HUONG, HAM_GOC: HAM_GOC, BANG: BANG,
    docSan: docSan, lyDoChan: lyDoChan, chay: chay
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.SanHoc = API;
})();
