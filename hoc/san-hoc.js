/* ============================================================================
   san-hoc.js — "Đường học": MÔ PHỎNG SÂN theo NHỊP cho game dạy Python qua robot.

   Chạy được trong Node (module.exports) và trình duyệt (window.SanHoc).
   Dựa trên nhân chạy code của docs/mockups/san-robot-core.js (window.RobotCore):
   nhân nhường ra ngoài từng lời gọi hàm của game, ở đây ta thực hiện chúng.

   Sân: mảng chuỗi, (x, y) với y = 0 ở hàng trên.
     .  sàn      #  tường     F  cờ đích     S  bậc thang (chỉ nhện leo được)
     >  <  ^  v  băng chuyền, chiều đẩy
     o  vật nằm trên sàn     D  ô đích (khung vàng)     X  ô đích đã có vật sẵn
   (o / D / X đều là sàn: xe đi qua ô vật không bị chặn.)
   Hướng robot: 0 lên, 1 phải, 2 xuống, 3 trái.

   Bốn loại robot (banh, nhen, xich, omni; xich và omni xem bên dưới):
     'banh' (xe bánh): left_move / right_move / left_back / right_back chỉ RA LỆNH
        cho bánh trong nhịp hiện tại; wait() kết thúc nhịp và robot làm theo tổ hợp.
     'nhen' (nhện): go_up / go_down / go_left / go_right, mỗi lệnh 2 nhịp, sang ô mới
        ở CUỐI nhịp thứ hai; wait() = 1 nhịp đứng yên. Không có hướng mặt (đi 4 hướng TUYỆT ĐỐI
        theo màn hình). Qua được bậc thang S. Nhện bị băng chuyền đẩy như xe: đứng trên băng
        đủ 2 nhịp thì bị đẩy (kể cả giữa hai nhịp của một bước). Đi NGƯỢC băng: nhịp 2 bước sang
        ô băng, nhịp kế bị đẩy lùi về → đứng im (kẹt).

   TAY GẮP (hamGoc có lệnh tay; xe bánh VÀ nhện): arm_down / arm_up / grab / release cũng
   chỉ RA LỆNH; wait() cho nhịp trôi. Trong MỘT nhịp:
     (a) tay đổi tư thế  →  (b) kẹp / thả, ở tư thế MỚI  →  (c) bánh chạy  →  (d) băng chuyền.
   Tay: { tuThe: 'tren'|'duoi' (mặc định 'tren'), kep: true|false, cam: id vật đang cầm | null }.
   - grab: chỉ gắp được vật ở ô xe đứng khi tay 'duoi'. Tay 'tren' mà grab → kẹp vào không khí
     (kep = true, không cầm gì, sự kiện 'kep-hut'). Đang cầm vật thì grab không đổi gì.
   - Tay 'duoi' thì xe KHÔNG đi, KHÔNG quay được: lệnh bánh của nhịp đó bị bỏ ('tay-vuong', kèm
     `lenh` = lệnh bánh bị chặn {ten, dongPy}).
   - Xe đi thì vật đang cầm đi theo.
   - NHỆN CÓ TAY: lệnh tay đang chờ xảy ra ở NHỊP ĐẦU của bước go_* kế tiếp (hoặc ở nhịp của wait()
     kế tiếp), theo đúng thứ tự (a)(b) ở trên; nhịp thứ hai của bước chỉ là bước chân. Tay 'duoi' ở
     nhịp thứ hai thì chân bị vướng: bước bị bỏ, nhện đứng im ('tay-vuong', `lenh` = lệnh go_* bị bỏ)
     — nhịp đã mất. Nên "arm_up(); go_up()" nâng tay ở nhịp đầu rồi bước ngay trong cùng bước 2 nhịp
     (không cần wait() riêng); còn "arm_down(); grab(); go_up()" thì bước bị vướng.
   - release: tay 'duoi' → vật nằm xuống ô hiện tại ('dat-vat'); tay 'tren' → vật rơi VỠ, biến
     mất ('vat-vo'). Không cầm gì thì không sao. Ô đã có vật nằm sẵn thì không đặt được ('o-co-vat',
     vật vẫn ở tay). Mỗi ô tối đa một vật đang nằm.
   Mục tiêu 'dua-vat' (cfg.mucTieu): thắng NGAY khi MỌI vật trên sân đều đang nằm trên ô đích.
   Có vật vỡ thì không thể thắng nữa: dừng ngay cuối nhịp đó (dungSom = 'vat-vo').

   'xich' (xe BÁNH XÍCH): CÙNG bộ lệnh với xe bánh (left_move / right_move / left_back / right_back / wait và tay gắp
        nếu có), cũng chỉ RA LỆNH, wait() cho nhịp trôi. Khác xe bánh ở ba chỗ:
        - Tiến / lùi (hai bên cùng chiều): 1 ô mỗi nhịp, như xe bánh.
        - QUAY CHẬM: một nhịp chỉ một bên xích chạy ((1,0) (0,-1) quay phải; (0,1) (-1,0) quay trái), hay hai bên ngược
          chiều ((1,-1) quay phải tại chỗ; (-1,1) quay trái tại chỗ), thì xe mới "nhích nửa vòng" (quayDo = +1 phải / -1 trái,
          sự kiện 'quay-nua'). Phải có 2 nhịp LIÊN TIẾP CÙNG tổ hợp (cùng cặp trai, phai) mới quay đủ 90° ('quay-phai' /
          'quay-trai'). Nhịp kế KHÔNG cùng tổ hợp (tiến, lùi, đứng yên, tay vướng, hay một tổ hợp quay khác) thì phần quay dở
          MẤT, hướng xe không đổi: sự kiện 'xich-quay-do' {nhip, nhipNua, huong, lenh}. Chương trình dừng khi còn quay dở
          (chưa thắng) cũng ghi 'xich-quay-do' với cuoi: true. Không có "quay đầu" 180° trong một nhịp.
        - Leo được bậc thang S như đi trên sàn; băng chuyền KHÔNG đẩy được xích (bám chắc): xích đứng đủ 2 nhịp trên băng
          chỉ ghi 'bang-khong-day' (thông tin cho hoạt cảnh), vị trí không đổi.
        Vết nhịp của xích có thêm robot.quayDo (0, +1, -1) cho hoạt cảnh xoay dở.

   'omni' (xe BÁNH OMNI): có MỌI lệnh bánh của xe hai bánh (left_move / right_move / left_back / right_back, wait và tay gắp
        nếu có) với đúng luật cũ (tiến / lùi 1 ô, quay 90° trong 1 nhịp), nên move(), turn_right(), turn_left() cũ chạy ĐÚNG. Thêm HAI
        lệnh gốc: slide_left() / slide_right(): trượt ngang 1 ô sang trái / phải SO VỚI HƯỚNG MẶT, không đổi hướng (cũng chỉ RA LỆNH,
        wait() cho nhịp trôi). Luật riêng:
        - KHÔNG ĐI CHÉO: nhịp có slide mà còn lệnh bánh thì chỉ làm slide, lệnh bánh bị bỏ (sự kiện 'omni-khong-cheo' {nhip, lenh, truot}).
        - slide_left() và slide_right() cùng một nhịp: lệnh gọi sau bị bỏ (sự kiện 'slide-goi-lai', kiểu 'banh-goi-lai').
        - Tay hạ sát đất thì slide cũng bị chặn ('tay-vuong'), như lệnh bánh.
        - Không leo được bậc thang S (như xe bánh).
        - Băng chuyền đẩy omni MẠNH HƠN: bánh nhỏ trơn, đứng trên băng chỉ 1 nhịp đã bị đẩy 1 ô (không phải 2). Đi xuôi băng = 2 ô / nhịp
          (1 ô tự đi + 1 ô băng đẩy); đi ngược băng thì đứng im (bước lên ô băng rồi bị đẩy lùi về chỗ cũ).
        Vết nhịp của omni có thêm robot.truot (0, -1 trái, +1 phải) cho hoạt cảnh trượt.

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
    nhen: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'],
    xich: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'],      // cùng bộ lệnh với xe bánh
    omni: ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait']   // bộ lệnh xe bánh + hai lệnh trượt ngang
  };
  // omni: lệnh trượt → bên trượt so với hướng mặt (-1 trái, +1 phải)
  var OMNI_TRUOT = { slide_left: -1, slide_right: 1 };
  // xích quay chậm: tổ hợp (bánh trái, bánh phải) → chiều quay (+1 phải, -1 trái); cần 2 nhịp liên tiếp cùng tổ hợp mới đủ 90°
  var XICH_QUAY = { '1,0': 1, '0,-1': 1, '1,-1': 1, '0,1': -1, '-1,0': -1, '-1,1': -1 };
  var NHEN_HUONG = { go_up: 0, go_right: 1, go_down: 2, go_left: 3 };
  // lệnh tay gắp của xe bánh. Hai nhóm: tư thế (arm_down / arm_up) và kẹp (grab / release);
  // mỗi nhịp mỗi nhóm nhận MỘT lệnh, lệnh sau bị bỏ ('tay-goi-lai').
  var TAY_LENH = ['arm_down', 'arm_up', 'grab', 'release'];
  var TAY_NHOM = { arm_down: 'tu-the', arm_up: 'tu-the', grab: 'kep', release: 'kep' };
  var BANH_LENH = {
    left_move: ['trai', 1], left_back: ['trai', -1],
    right_move: ['phai', 1], right_back: ['phai', -1]
  };

  /* ------------------------------------------------------------------- sân */

  function docSan(rows) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Sân phải là mảng chuỗi, không rỗng.');
    var rong = rows[0].length, co = null, vat = [], dich = [];
    for (var y = 0; y < rows.length; y++) {
      if (rows[y].length !== rong) throw new Error('Sân không phải hình chữ nhật (dòng ' + (y + 1) + ').');
      for (var x = 0; x < rong; x++) {
        var c = rows[y][x];
        if (c === 'F') { if (!co) co = { x: x, y: y }; }
        else if (c === 'o') vat.push({ x: x, y: y });
        else if (c === 'D') dich.push({ x: x, y: y });
        else if (c === 'X') { vat.push({ x: x, y: y }); dich.push({ x: x, y: y }); }
        else if ('.#S'.indexOf(c) < 0 && BANG[c] === undefined) {
          throw new Error('Ký hiệu lạ trong sân: "' + c + '" (' + x + ', ' + y + ').');
        }
      }
    }
    // vat: các vật nằm sẵn (ký hiệu o, X) theo thứ tự đọc từng hàng; dich: các ô đích (D, X)
    return { o: rows.slice(), rong: rong, cao: rows.length, co: co, vat: vat, dich: dich };
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
    if (c === 'S' && (loai === 'banh' || loai === 'omni')) return 'bac-thang';
    return null;
  }

  /* ----------------------------------------------------------------- chạy */

  /**
   * Chạy một chương trình Python trên một sân.
   * cfg: { san: [chuỗi], batDau: {x,y,huong}, loaiRobot: 'banh'|'nhen'|'xich'|'omni',
   *        hamGoc: [tên hàm gốc được phép] (mặc định: đủ bộ của loại robot, chưa có lệnh tay),
   *        nhipToiDa: 200,
   *        mucTieu: 'toi-co' (mặc định) | 'dua-vat',
   *        vat: [{x,y}] (vật thêm vào ngoài các ô 'o' / 'X' của sân), dich: [{x,y}] (ô đích thêm) }
   * opt: { nganSachLenh: 20000 }
   * Trả về:
   *   { thang, nhip, robot: {x,y,huong}, loi, vet, suKien, lenhTon, batDau,
   *     tay, vat, vatBanDau, dich, dungSom }
   *   - loi: null | { loai, dong, thongDiep } — loại của core ('syntax-error',
   *     'indent-error', 'runtime-error', 'infinite-loop') hoặc 'qua-nhieu-nhip'.
   *     `dong` là số dòng của mã Python (đổi sang cột/dòng là việc của ChamHoc).
   *   - vet: dãy { loai:'lenh', ten, dongPy, nganPy } và
   *          { loai:'nhip', nhip, robot:{x,y,huong,banh:{trai,phai}, tay}, vat, suKien:[…] }
   *          `tay` = { tuThe, kep, cam } và `vat` = [{ id, x, y, trangThai:'dat'|'cam'|'vo' }]
   *          chỉ có khi hamGoc có lệnh tay (xe bánh có tay gắp). Vật đang cầm có (x, y) của xe.
   *   - suKien: các mốc chẩn đoán { ma:'dam-tuong'|'banh-goi-lai'|'quen-wait'|'tay-goi-lai'|'xich-quay-do'|
   *     'tay-vuong'|'kep-hut'|'vat-vo'|'o-co-vat', … };
   *     'banh-goi-lai' / 'tay-goi-lai' có thêm `truoc` = lệnh đã giữ bánh / nhóm đó trong nhịp {ten, dongPy}
   *     Trong vet.suKien của nhịp còn có 'nhat-vat', 'dat-vat' (thông tin cho hoạt cảnh) và 'xong-dua-vat'.
   *   - tay, vat: trạng thái CUỐI (tay null nếu không có tay gắp); vatBanDau: vật lúc xuất phát;
   *     dich: các ô đích [{x,y}]; dungSom: null | 'vat-vo' (dừng sớm vì vật vỡ, chỉ ở mục tiêu dua-vat)
   */
  function chay(cfg, code, opt) {
    opt = opt || {};
    var loai = cfg.loaiRobot || 'banh';
    if (loai !== 'banh' && loai !== 'nhen' && loai !== 'xich' && loai !== 'omni') throw new Error('Loại robot lạ: ' + loai);
    var laBanh = loai === 'banh' || loai === 'xich' || loai === 'omni';      // dùng chung bộ lệnh bánh
    var mucTieu = cfg.mucTieu || 'toi-co';
    if (mucTieu !== 'toi-co' && mucTieu !== 'dua-vat') throw new Error('Mục tiêu lạ: ' + mucTieu);
    var san = docSan(cfg.san);
    var bd = cfg.batDau;
    if (!bd) throw new Error('Thiếu vị trí xuất phát (batDau).');
    if (lyDoChan(san, loai, bd.x, bd.y)) throw new Error('Robot xuất phát trong chỗ không đứng được.');
    var nhipToiDa = cfg.nhipToiDa || 200;

    var hamGoc = cfg.hamGoc || HAM_GOC[loai];
    hamGoc.forEach(function (t) {
      if (HAM_GOC[loai].indexOf(t) < 0 && TAY_LENH.indexOf(t) < 0) {
        throw new Error('Hàm gốc "' + t + '" không thuộc loại robot ' + loai + '.');
      }
    });
    var api = {};
    hamGoc.forEach(function (t) { api[t] = function () { return 0; }; });   // chỉ để nhân biết tên
    var coTay = hamGoc.some(function (t) { return TAY_LENH.indexOf(t) >= 0; });

    var rb = { x: bd.x, y: bd.y, huong: bd.huong || 0 };
    var nhip = 0, demBang = 0;
    var quayDo = null;                          // xích: phần quay dở { khoa:'t,p', huong:+1|-1, nhip, lenh:{ten,dongPy}|null }
    var lenh = { trai: 0, phai: 0 };            // lệnh bánh đang chờ wait()
    var lenhTon = [];                           // các lệnh (bánh và tay) chưa wait(): {ten, dongPy}
    var tayCho = { 'tu-the': null, 'kep': null };   // lệnh tay đang chờ wait(), theo nhóm: {ten, dongPy}
    var truotCho = null;                        // omni: lệnh trượt đang chờ wait(): {ten, dongPy, bien:-1|+1}
    var vet = [], suKienChan = [];
    var thang = false, loi = null, dungSom = null;

    // ---- tay gắp, vật, ô đích
    var tay = { tuThe: 'tren', kep: false, cam: null };
    var vats = [], dichSet = {}, dsDich = [];
    function themVat(o) {
      var x = Math.floor(o.x), y = Math.floor(o.y);
      if (!(x >= 0 && y >= 0 && x < san.rong && y < san.cao) || san.o[y][x] === '#') return;
      for (var i = 0; i < vats.length; i++) if (vats[i].x === x && vats[i].y === y) return;     // mỗi ô một vật
      vats.push({ id: vats.length + 1, x: x, y: y, trangThai: 'dat' });
    }
    function themDich(o) {
      var k = o.x + ',' + o.y;
      if (!dichSet[k]) { dichSet[k] = true; dsDich.push({ x: o.x, y: o.y }); }
    }
    function chup() { return { x: rb.x, y: rb.y, huong: rb.huong }; }
    function chupTay() { return { tuThe: tay.tuThe, kep: tay.kep, cam: tay.cam }; }
    function chupVat() { return vats.map(function (v) { return { id: v.id, x: v.x, y: v.y, trangThai: v.trangThai }; }); }
    san.vat.forEach(themVat); (cfg.vat || []).forEach(themVat);
    san.dich.forEach(themDich); (cfg.dich || []).forEach(themDich);
    var vatBanDau = chupVat();

    function vatNamTai(x, y) {
      for (var i = 0; i < vats.length; i++) if (vats[i].trangThai === 'dat' && vats[i].x === x && vats[i].y === y) return vats[i];
      return null;
    }
    function vatTheoId(id) { return vats[id - 1]; }

    /** (b) kẹp / thả ở tư thế hiện tại. Trả về true nếu có vật vỡ. */
    function kepHoacTha(kieu, sk) {
      var o = { x: rb.x, y: rb.y }, v;
      if (kieu === 'kep') {
        if (tay.cam !== null) return false;                     // đang cầm: không đổi gì
        v = vatNamTai(rb.x, rb.y);
        tay.kep = true;
        if (v && tay.tuThe === 'duoi') {
          v.trangThai = 'cam'; tay.cam = v.id;
          sk.push({ ma: 'nhat-vat', id: v.id, o: o });
        } else if (v || tay.tuThe === 'duoi') {
          var kh = { ma: 'kep-hut', nhip: nhip, o: o, lyDo: v ? 'tay-nang' : 'khong-co-vat' };
          sk.push(kh); suKienChan.push(kh);
        }
        return false;
      }
      // thả
      if (tay.cam === null) { tay.kep = false; return false; }
      v = vatTheoId(tay.cam);
      if (tay.tuThe === 'tren') {
        v.trangThai = 'vo'; v.x = rb.x; v.y = rb.y; tay.cam = null; tay.kep = false;
        var e = { ma: 'vat-vo', nhip: nhip, id: v.id, o: o };
        sk.push(e); suKienChan.push(e);
        return true;
      }
      if (vatNamTai(rb.x, rb.y)) {
        var e2 = { ma: 'o-co-vat', nhip: nhip, id: v.id, o: o };
        sk.push(e2); suKienChan.push(e2);                       // vật vẫn ở tay, kẹp vẫn đóng
        return false;
      }
      v.trangThai = 'dat'; v.x = rb.x; v.y = rb.y; tay.cam = null; tay.kep = false;
      sk.push({ ma: 'dat-vat', id: v.id, o: o });
      return false;
    }
    function vatTheoXe() {
      if (tay.cam !== null) { var v = vatTheoId(tay.cam); v.x = rb.x; v.y = rb.y; }
    }
    function duaVatXong() {
      if (!vats.length) return false;
      return vats.every(function (v) { return v.trangThai === 'dat' && dichSet[v.x + ',' + v.y]; });
    }

    /** Xích: bỏ phần quay dở (nhịp này không cùng tổ hợp), ghi sự kiện. */
    function xichThoi(sk) {
      if (!quayDo) return;
      var e = { ma: 'xich-quay-do', nhip: nhip, nhipNua: quayDo.nhip, huong: quayDo.huong, lenh: quayDo.lenh };
      sk.push(e); suKienChan.push(e);
      quayDo = null;
    }

    /** Xích: một nhịp với tổ hợp bánh (t, p). thuDi: hàm đi 1 ô của nhịp. */
    function xichBanh(t, p, lenhBanh, sk, thuDi) {
      var khoa = t + ',' + p, q = XICH_QUAY[khoa];
      if (q === undefined) {                                                // tiến, lùi hoặc đứng yên: không quay
        xichThoi(sk);
        if (t === 1 && p === 1) thuDi(rb.huong, 1, 'tien');
        else if (t === -1 && p === -1) thuDi(rb.huong, -1, 'lui');
        else sk.push({ ma: 'dung-yen' });
        return;
      }
      if (quayDo && quayDo.khoa === khoa) {                                 // nhịp thứ hai cùng tổ hợp: quay đủ 90°
        rb.huong = (rb.huong + (q > 0 ? 1 : 3)) % 4; quayDo = null;
        sk.push({ ma: q > 0 ? 'quay-phai' : 'quay-trai' });
        return;
      }
      xichThoi(sk);                                                         // tổ hợp khác: quay dở cũ mất, bắt đầu quay dở mới
      quayDo = { khoa: khoa, huong: q, nhip: nhip, lenh: lenhBanh || null };
      sk.push({ ma: 'quay-nua', huong: q });
    }

    /** Một nhịp trôi qua. hanhDong: {kieu:'banh', trai, phai, tay:{tuThe,kep}} | {kieu:'nhen', huong|null, buoc:1|2, tay, lenhDi}.
     *  Trả về true nếu phải dừng (thắng, vật vỡ hoặc hết nhịp). */
    function motNhip(hanhDong) {
      if (nhip >= nhipToiDa) {
        loi = { loai: 'qua-nhieu-nhip', dong: 0, thongDiep: 'Quá ' + nhipToiDa + ' nhịp.' };
        return true;
      }
      nhip++;
      var sk = [];
      var banhGhi = { trai: 0, phai: 0 };
      var truotGhi = 0;
      var coVo = false;

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

      function apTay() {
        if (!coTay) return;
        var lt = hanhDong.tay || {};
        if (lt.tuThe) tay.tuThe = lt.tuThe;                                 // (a) tay đổi tư thế
        if (lt.kep) coVo = kepHoacTha(lt.kep, sk);                          // (b) kẹp / thả ở tư thế mới
      }

      if (hanhDong.kieu === 'banh') {
        var t = hanhDong.trai, p = hanhDong.phai, tr = hanhDong.truot || null;
        if (tr) banhGhi = { trai: 0, phai: 0 };                               // omni trượt: bánh chạy dọc đứng yên, chỉ trượt ngang
        else banhGhi = { trai: t, phai: p };
        apTay();
        if (coTay && tay.tuThe === 'duoi' && (tr || t !== 0 || p !== 0)) {   // (c) bánh chạy — nhưng tay vướng sàn
          var ev = { ma: 'tay-vuong', nhip: nhip, tu: { x: rb.x, y: rb.y }, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : hanhDong.lenhBanh) || null };
          sk.push(ev); suKienChan.push(ev);
          if (loai === 'xich') xichThoi(sk);                                // bánh không chạy: quay dở (nếu có) mất
        }
        else if (tr) {                                                      // omni: trượt ngang; lệnh bánh cùng nhịp (nếu có) bị bỏ
          if (t !== 0 || p !== 0) {
            var ec = { ma: 'omni-khong-cheo', nhip: nhip, lenh: hanhDong.lenhBanh || null, truot: { ten: tr.ten, dongPy: tr.dongPy } };
            sk.push(ec); suKienChan.push(ec);
          }
          truotGhi = tr.bien;
          thuDi((rb.huong + (tr.bien > 0 ? 1 : 3)) % 4, 1, 'truot');
        }
        else if (loai === 'xich') xichBanh(t, p, hanhDong.lenhBanh, sk, thuDi);
        else if (t === 1 && p === 1) thuDi(rb.huong, 1, 'tien');
        else if (t === -1 && p === -1) thuDi(rb.huong, -1, 'lui');
        else if ((t === 1 && p === -1) || (t === -1 && p === 1)) { rb.huong = (rb.huong + 2) % 4; sk.push({ ma: 'quay-dau' }); }
        else if ((t === 1 && p === 0) || (t === 0 && p === -1)) { rb.huong = (rb.huong + 1) % 4; sk.push({ ma: 'quay-phai' }); }
        else if ((t === 0 && p === 1) || (t === -1 && p === 0)) { rb.huong = (rb.huong + 3) % 4; sk.push({ ma: 'quay-trai' }); }
        else sk.push({ ma: 'dung-yen' });
      } else {
        if (hanhDong.huong === null || hanhDong.huong === undefined) { apTay(); sk.push({ ma: 'dung-yen' }); }
        else if (hanhDong.buoc === 2) {
          if (coTay && tay.tuThe === 'duoi') {                              // tay hạ sát đất: chân vướng, bước bị bỏ
            var evn = { ma: 'tay-vuong', nhip: nhip, tu: { x: rb.x, y: rb.y }, lenh: hanhDong.lenhDi || null };
            sk.push(evn); suKienChan.push(evn);
          } else thuDi(hanhDong.huong, 1, 'di');
        } else { apTay(); sk.push({ ma: 'chuan-bi' }); }   // nhịp thứ nhất của lệnh go_*: chưa rời ô (tay làm việc ở nhịp này)
      }

      // băng chuyền — sau hành động của nhịp
      var c = oTai(san, rb.x, rb.y);
      if (c !== null && BANG[c] !== undefined) {
        demBang++;
        if (demBang >= 2 && loai === 'xich') { sk.push({ ma: 'bang-khong-day' }); demBang = 0; }     // xích bám chắc, băng không đẩy được
        else if (demBang >= (loai === 'omni' ? 1 : 2)) {                    // omni: bánh nhỏ trơn, 1 nhịp trên băng đã bị đẩy
          var hd = BANG[c], vb = VEC[hd], bx = rb.x + vb[0], by = rb.y + vb[1];
          var lyB = lyDoChan(san, loai, bx, by);
          if (lyB) sk.push({ ma: 'bang-chan', den: { x: bx, y: by }, vat: lyB });
          else { rb.x = bx; rb.y = by; sk.push({ ma: 'bang-day', den: { x: bx, y: by } }); }
          demBang = 0;
        }
      } else demBang = 0;
      vatTheoXe();                                                           // vật đang cầm đi theo xe

      if (mucTieu === 'toi-co') {
        if (san.co && rb.x === san.co.x && rb.y === san.co.y) { thang = true; sk.push({ ma: 'toi-co' }); }
      } else if (duaVatXong()) { thang = true; sk.push({ ma: 'xong-dua-vat' }); }
      if (!thang && coVo && mucTieu === 'dua-vat') dungSom = 'vat-vo';       // vật vỡ: không thể thắng nữa
      var r = chup(); r.banh = banhGhi;
      if (loai === 'xich') r.quayDo = quayDo ? quayDo.huong : 0;
      if (loai === 'omni') r.truot = truotGhi;
      var mucVet = { loai: 'nhip', nhip: nhip, robot: r, suKien: sk };
      if (coTay) { r.tay = chupTay(); mucVet.vat = chupVat(); }
      vet.push(mucVet);
      return thang || !!dungSom;
    }

    /** Lấy các lệnh tay đang chờ thành {tuThe, kep} cho nhịp này, và xóa chúng khỏi hàng chờ. */
    function rutTay() {
      var tt = tayCho['tu-the'], kk = tayCho['kep'];
      tayCho = { 'tu-the': null, 'kep': null };
      return { tuThe: tt ? (tt.ten === 'arm_down' ? 'duoi' : 'tren') : null, kep: kk ? (kk.ten === 'grab' ? 'kep' : 'tha') : null };
    }

    /** Xử lý một lời gọi hàm gốc nhân nhường ra. Trả về true nếu phải dừng. */
    function xuLy(yc) {
      vet.push({ loai: 'lenh', ten: yc.ten, dongPy: yc.dong, nganPy: yc.ngan });
      if (yc.ten === 'wait') {
        if (laBanh) {
          var lenhBanh = null;                                   // lệnh bánh đầu tiên của nhịp (để chỉ ra khi tay vướng sàn)
          lenhTon.forEach(function (x) { if (!lenhBanh && BANH_LENH[x.ten]) lenhBanh = { ten: x.ten, dongPy: x.dongPy }; });
          var h = { kieu: 'banh', trai: lenh.trai, phai: lenh.phai, lenhBanh: lenhBanh, tay: rutTay(), truot: truotCho };
          lenh.trai = 0; lenh.phai = 0; lenhTon = []; truotCho = null;
          return motNhip(h);
        }
        var hw = { kieu: 'nhen', huong: null, tay: rutTay() };
        lenhTon = [];
        return motNhip(hw);
      }
      if (TAY_NHOM[yc.ten]) {                                    // lệnh tay (xe bánh và nhện): chỉ ra lệnh, chờ nhịp
        var nhom = TAY_NHOM[yc.ten];
        if (tayCho[nhom]) {
          suKienChan.push({ ma: 'tay-goi-lai', nhip: nhip + 1, nhom: nhom, ten: yc.ten, dongPy: yc.dong,
            truoc: { ten: tayCho[nhom].ten, dongPy: tayCho[nhom].dongPy } });
          return false;
        }
        tayCho[nhom] = { ten: yc.ten, dongPy: yc.dong };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (OMNI_TRUOT[yc.ten] !== undefined) {                    // omni: slide_left / slide_right chỉ ra lệnh, chờ nhịp
        if (truotCho) {
          suKienChan.push({ ma: 'slide-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: truotCho.ten, dongPy: truotCho.dongPy } });
          return false;
        }
        truotCho = { ten: yc.ten, dongPy: yc.dong, bien: OMNI_TRUOT[yc.ten] };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (laBanh) {
        var bl = BANH_LENH[yc.ten];
        if (lenh[bl[0]] !== 0) {
          // lệnh nào đã giữ bánh này trong nhịp (để chẩn đoán chỉ ra cả nơi gây ra)
          var truoc = null;
          lenhTon.forEach(function (x) { if (!truoc && BANH_LENH[x.ten] && BANH_LENH[x.ten][0] === bl[0]) truoc = { ten: x.ten, dongPy: x.dongPy }; });
          suKienChan.push({ ma: 'banh-goi-lai', nhip: nhip + 1, banh: bl[0], ten: yc.ten, dongPy: yc.dong, truoc: truoc });
          return false;
        }
        lenh[bl[0]] = bl[1];
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      var hh = NHEN_HUONG[yc.ten];
      var tayBuoc = rutTay();                                    // lệnh tay đang chờ làm ở nhịp ĐẦU của bước
      lenhTon = [];
      return motNhip({ kieu: 'nhen', huong: hh, buoc: 1, tay: tayBuoc }) ||
        motNhip({ kieu: 'nhen', huong: hh, buoc: 2, lenhDi: { ten: yc.ten, dongPy: yc.dong } });
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

    // xích: chương trình hết khi còn quay dở (chưa thắng) → ghi lại, để chẩn đoán nói rõ
    if (loai === 'xich' && quayDo && !thang && !loi && !dungSom) {
      suKienChan.push({ ma: 'xich-quay-do', nhip: nhip, nhipNua: quayDo.nhip, huong: quayDo.huong, lenh: quayDo.lenh, cuoi: true });
    }

    // chương trình hết mà còn lệnh chưa wait() → lệnh đó không chạy
    if (!thang && !loi && !dungSom && lenhTon.length) {
      suKienChan.push({ ma: 'quen-wait', nhip: nhip, lenh: lenhTon.slice() });
    }

    return {
      thang: thang, nhip: nhip, robot: chup(), loi: loi, vet: vet,
      suKien: suKienChan, lenhTon: lenhTon, batDau: { x: bd.x, y: bd.y, huong: bd.huong || 0 },
      tay: coTay ? chupTay() : null, vat: chupVat(), vatBanDau: vatBanDau, dich: dsDich, dungSom: dungSom,
      quayDo: loai === 'xich' ? (quayDo ? quayDo.huong : 0) : undefined
    };
  }

  var API = {
    VEC: VEC, TEN_HUONG: TEN_HUONG, HAM_GOC: HAM_GOC, TAY_LENH: TAY_LENH, TAY_NHOM: TAY_NHOM, BANG: BANG, XICH_QUAY: XICH_QUAY, OMNI_TRUOT: OMNI_TRUOT,
    docSan: docSan, lyDoChan: lyDoChan, chay: chay
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.SanHoc = API;
})();
