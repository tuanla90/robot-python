/* ============================================================================
   man-nhen.js — "Đường học": CHƯƠNG `nhen` · THÂN NHỆN (10 màn).
   Robot là NHỆN (loaiRobot 'nhen'; mỗi màn khai robot: { than: 'nhen', tay: 'kep' | null } để giao diện
   vẽ đúng part). Xưởng hàm mở (moXuong true), được dùng hàm của em. Chương trình 10 ô; mỗi hàm một
   khung riêng 10 ô. Đã học `for`; chương này học thêm `if / elif` nên cauTruc ['for', 'if'].

   LUẬT NHỆN (san-hoc.js):
   - Đi 4 hướng TUYỆT ĐỐI theo màn hình: go_up / go_down / go_left / go_right. Không có hướng mặt, không quay.
   - Mỗi bước 2 nhịp; sang ô mới ở cuối nhịp thứ hai. wait() = 1 nhịp đứng yên.
   - Qua được bậc thang S (xe bánh không qua). Đâm tường: đứng yên, vẫn mất 2 nhịp.
   - Băng chuyền như xe: đứng trên băng đủ 2 nhịp (kể cả nhịp đầu của bước kế) thì bị đẩy 1 ô theo mũi tên.
     Đi NGƯỢC băng thì kẹt (bước sang ô băng, nhịp kế bị đẩy lùi về). Đi XUÔI băng thì được lời: hai bước
     qua một đoạn băng liền ăn thêm một ô, nên số chữ trong chuỗi chỉ đường KHÔNG bằng số ô đi qua.
   - Tay kẹp (6, 9, 10): arm_down / arm_up / grab / release chỉ ra lệnh; chúng làm việc ở NHỊP ĐẦU của bước
     go_* kế tiếp hoặc ở nhịp wait() kế tiếp (đúng thứ tự: tay đổi tư thế, rồi kẹp / thả). Tay đang hạ ở
     nhịp thứ hai của bước thì chân vướng: bước bị bỏ ('tay-vuong'). Nên pick() / drop() của kho (hạ tay,
     kẹp / thả, nâng tay) chạy được với nhện như với xe bánh.

   Python học thêm: CHUỖI KÝ TỰ làm đối số, `if / elif` so sánh chuỗi (`d == "U"`), `for c in "UURR":`.
   Quy ước chữ chỉ đường: "U" lên, "D" xuống, "L" trái, "R" phải (chữ HOA; chữ thường không khớp nhánh nào).

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     nhen.4   go(d)       = if/elif d == "U"/"D"/"L"/"R": go_up / go_down / go_left / go_right   (8 ô)
     nhen.9   walk(path)  = for c in path: go(c)                                                   (2 ô)
     nhen.10  bring(path) = pick(); walk(path); drop()                                             (3 ô)
   Tên không trùng hàm cốt truyện chương trước. Hàm CỦA MÀN (tạm): 7 cho sẵn go_sai(d) viết nhầm một nhánh.

   Trường riêng của chương này:
   - canHam: 'tran-khung' — viết KHÔNG dùng hàm / chuỗi (mỗi bước một dòng go_*, chỉ gộp đoạn thẳng bằng for)
             thì tràn khung 10 ô. (kiem-nhen.mjs tự đếm từ vết chạy của lời giải để chứng minh.)
   - nhipTheoLoiGiai: true — sao.nhip là nhịp của lời giải CHUẨN, có thể dài hơn đường ngắn nhất (BFS): màn có
     pick() / drop() (6, 9, 10) vì chúng còn nâng tay ở nhịp riêng.

   Sân là HÀNH LANG (mọi ô ngoài đường đi là tường) nên không có đường tắt; BFS cho nhện (do-duong-nhen.mjs)
   xác nhận: màn 8 có hai đường (đường thẳng ngược băng KHÔNG đi được, chỉ còn đường vòng qua bậc thang).

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var HAM_NHEN_TAY = HAM_NHEN.concat(['arm_down', 'arm_up', 'grab', 'release']);

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp lệnh `lenh` `n` lần (2 ô). */
  function LAP(n, lenh) { return ['for i in range(' + n + '):', '    ' + lenh]; }
  /** Đi theo chuỗi chữ bằng go(): 2 ô. */
  function DI(chuoi, ham) { return ['for c in "' + chuoi + '":', '    ' + (ham || 'go') + '(c)']; }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_GO = ['if d == "U":', '    go_up()', 'elif d == "D":', '    go_down()', 'elif d == "L":', '    go_left()', 'elif d == "R":', '    go_right()'];
  var T_WALK = ['for c in path:', '    go(c)'];
  var T_BRING = ['pick()', 'walk(path)', 'drop()'];
  function hGo() { return H('go', ['d'], T_GO); }
  function hWalk() { return H('walk', ['path'], T_WALK); }
  function hBring() { return H('bring', ['path'], T_BRING); }
  // 7: go_sai(d) viết nhầm nhánh "U" (gọi go_down thay vì go_up)
  var T_GO_SAI = ['if d == "U":', '    go_down()', 'elif d == "D":', '    go_down()', 'elif d == "L":', '    go_left()', 'elif d == "R":', '    go_right()'];
  function hGoSai(than) { return H('go_sai', ['d'], than || T_GO); }

  function man(m, coTay) {
    m.chuong = 'nhen';
    m.cauTruc = ['for', 'if'];
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: coTay ? 'kep' : null };
    m.hamGoc = coTay ? HAM_NHEN_TAY : HAM_NHEN;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chuỗi chỉ đường dùng lại */

  var C4 = 'RRDRDDLLDDRR';            // 4: 12 bước
  var C5 = 'URRDRRDDLLDLD';           // 5: 13 bước
  var C7 = 'DDRRUURRDDDL';            // 7: 12 bước

  // 6: đi tới vật, nhặt, mang tới đích, thả
  var CHINH_6 = nhieu(DI('DRRDR'), ['pick()'], DI('DDLLD'), ['drop()']);
  // 9: hai vật, tám dòng
  var CHINH_9 = ['walk("RRR")', 'pick()', 'walk("DDL")', 'drop()', 'walk("LDD")', 'pick()', 'walk("RRR")', 'drop()'];
  // 10: ba vật, sáu dòng (chữ ít hơn số ô ở hai chỗ có băng xuôi chiều)
  var CHINH_10 = ['walk("RR")', 'bring("RR")', 'walk("RDD")', 'bring("LL")', 'walk("DD")', 'bring("LLL")'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Bước chân nhện', hang: 'lam-quen',
      deBai: 'Nhện không cần quay: go_right() sang phải, go_down() xuống, go_left() sang trái, go_up() lên, mỗi bước mất 2 nhịp. Đưa nhện tới cờ.',
      veMaMau: 'Chương trình có sẵn mới đưa nhện đi hai ô sang phải. Chạy thử, xem nhện làm gì rồi viết tiếp.',
      san: ['....', '###.', '###.', '###F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: ['go_right()', 'go_right()'] },
      sao: { o: 4, nhip: 12 },
      loiGiai: { chinh: nhieu(LAP(3, 'go_right()'), LAP(3, 'go_down()')) },
      loiGiaiKhac: {
        moTa: 'Viết từng bước một, không dùng vòng lặp',
        baiLam: { chinh: nhieu(lap('go_right()', 3), lap('go_down()', 3)) }
      },
      loiSai: [
        { moTa: 'Đi xuống thiếu một ô: nhện dừng sát cờ', baiLam: { chinh: nhieu(LAP(3, 'go_right()'), LAP(2, 'go_down()')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi xuống trước khi sang phải: nhện đâm tường', baiLam: { chinh: nhieu(LAP(3, 'go_down()'), LAP(3, 'go_right()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dùng lệnh của xe bánh, nhện không có lệnh đó', baiLam: { chinh: ['left_move()', 'right_move()', 'wait()'] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Nhện không quay: muốn sang phải thì gọi go_right(), muốn xuống thì gọi go_down().',
        'Đếm số ô cần đi theo từng hướng rồi lặp lệnh đúng số lần.']
    }, false),

    man({
      so: 2, ten: 'Bậc thang', hang: 'lam-quen',
      deBai: 'Ô có chữ S là bậc thang: xe bánh không leo được, nhện leo như đi trên sàn. Mỗi bước vẫn mất 2 nhịp. Đưa nhện lên cờ.',
      veMaMau: 'Chương trình có sẵn đưa nhện sang trái hai ô. Phần còn lại là lối lên bậc thang.',
      san: ['F...', 'S###', 'S###', '...#'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['go_left()', 'go_left()'] },
      sao: { o: 4, nhip: 10 },
      loiGiai: { chinh: nhieu(LAP(2, 'go_left()'), LAP(3, 'go_up()')) },
      loiGiaiKhac: {
        moTa: 'Viết từng bước một, không dùng vòng lặp',
        baiLam: { chinh: nhieu(lap('go_left()', 2), lap('go_up()', 3)) }
      },
      loiSai: [
        { moTa: 'Lên bậc thang thiếu một ô: nhện dừng giữa đường', baiLam: { chinh: nhieu(LAP(2, 'go_left()'), LAP(2, 'go_up()')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi lên trước khi sang trái: nhện đâm tường', baiLam: { chinh: nhieu(LAP(3, 'go_up()'), LAP(2, 'go_left()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chen wait() thừa giữa đường: vẫn tới cờ nhưng chậm hơn', baiLam: { chinh: nhieu(LAP(2, 'go_left()'), ['wait()'], LAP(3, 'go_up()')) }, phaiCoMa: [] }
      ],
      goiY: ['Bậc thang S chỉ nhện đi qua được, và đi qua như một ô thường.',
        'Mỗi go_*() mất 2 nhịp, còn wait() chỉ mất 1: đi 5 ô thì mất 10 nhịp.']
    }, false),

    man({
      so: 3, ten: 'Đường zíc zắc', hang: 'lam-quen',
      deBai: 'Đường đi xuống một bước rồi sang phải một bước, cứ thế tới cờ. Nhện đổi hướng thoải mái mà không cần quay.',
      veMaMau: 'Chương trình có sẵn đi xuống một bước, sang phải một bước. Chạy thử rồi viết tiếp.',
      san: ['.####', '..###', '#..##', '##..#', '###.F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: ['go_down()', 'go_right()'] },
      sao: { o: 3, nhip: 16 },
      loiGiai: { chinh: ['for i in range(4):', '    go_down()', '    go_right()'] },
      loiGiaiKhac: {
        moTa: 'Viết từng bước một, không dùng vòng lặp',
        baiLam: { chinh: nhieu(['go_down()', 'go_right()'], ['go_down()', 'go_right()'], ['go_down()', 'go_right()'], ['go_down()', 'go_right()']) }
      },
      loiSai: [
        { moTa: 'Lặp ba lần thay vì bốn: nhện dừng sát cờ', baiLam: { chinh: ['for i in range(3):', '    go_down()', '    go_right()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sang phải trước rồi mới xuống: nhện đâm tường', baiLam: { chinh: ['for i in range(4):', '    go_right()', '    go_down()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'go_right() thụt ra ngoài vòng lặp: nhện cứ đi xuống rồi đâm tường', baiLam: { chinh: ['for i in range(4):', '    go_down()', 'go_right()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Cứ một bước xuống rồi một bước sang phải, lặp lại.',
        'Cặp hai lệnh lặp đi lặp lại thì đặt cả cặp vào một vòng for.']
    }, false),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm go(d)', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: [], taoHam: ['go'],
      deBai: 'Mỗi chữ trong chuỗi chỉ đường là một bước: "U" lên, "D" xuống, "L" trái, "R" phải. Tạo hàm go(d) đi một bước theo chữ d (dùng if / elif), rồi cho nhện đi hết chuỗi tới cờ.',
      veMaMau: 'Chương trình có sẵn đã đi theo một chuỗi chữ bằng go(c), nhưng em chưa có hàm go. Tạo hàm go với một đối số d.',
      san: ['...#', '##..', '###.', '#...', '#.##', '#..F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: DI(C4) },
      sao: { o: 10, nhip: 24 },
      loiGiai: { chinh: DI(C4), hamCuaEmMoi: [hGo()] },
      loiGiaiKhac: {
        moTa: 'Hàm go() chép d sang biến trung gian rồi mới so sánh',
        baiLam: { chinh: DI(C4) },
        hamCuaEmMoi: [H('go', ['d'], nhieu(['huong = d'], T_GO.map(function (s) { return s.replace('d ==', 'huong =='); })))]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm go mà đã gọi nó', baiLam: { chinh: DI(C4) }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thiếu nhánh "L": nhện không bao giờ đi trái', baiLam: { chinh: DI(C4) }, hamCuaEmMoi: [H('go', ['d'], T_GO.slice(0, 4).concat(T_GO.slice(6)))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhánh "D" gọi nhầm go_up()', baiLam: { chinh: DI(C4) }, hamCuaEmMoi: [H('go', ['d'], T_GO.map(function (s) { return s === '    go_down()' ? '    go_up()' : s; }))], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'So sánh với chữ thường "u", "d", "l", "r": không nhánh nào khớp nên nhện đứng im', baiLam: { chinh: DI(C4) }, hamCuaEmMoi: [H('go', ['d'], T_GO.map(function (s) { return s.replace('"U"', '"u"').replace('"D"', '"d"').replace('"L"', '"l"').replace('"R"', '"r"'); }))], phaiCoMa: ['nhen-khong-buoc', 'chua-toi-co'] },
        { moTa: 'Quên dấu hai chấm sau điều kiện if', baiLam: { chinh: DI(C4) }, hamCuaEmMoi: [H('go', ['d'], ['if d == "U"'].concat(T_GO.slice(1)))], phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['d là một chữ: "U" lên, "D" xuống, "L" trái, "R" phải. So sánh bằng ==, mỗi chữ một nhánh.',
        'if cho nhánh đầu, elif cho các nhánh còn lại; mỗi nhánh gọi đúng một lệnh go_*.']
    }, false),

    man({
      so: 5, ten: 'Tự viết chỉ đường', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['go'],
      deBai: 'Nhìn sân rồi tự viết chuỗi chữ chỉ đường cho nhện (U lên, D xuống, L trái, R phải), mỗi chữ một bước. Hàm go(d) của em đi một bước theo từng chữ.',
      veMaMau: 'Chương trình có sẵn đi theo chuỗi "DD": nhện đi xuống hai ô rồi dừng. Sửa chuỗi để nhện đi tiếp tới cờ.',
      san: ['...##', '.#...', '####.', '##...', '#..##', '#F###'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: DI('DD') },
      sao: { o: 10, nhip: 26 },
      loiGiai: { chinh: DI(C5) },
      loiGiaiKhac: {
        moTa: 'Chia chuỗi làm hai đoạn, mỗi đoạn một vòng for',
        baiLam: { chinh: nhieu(DI('URRDRR'), DI('DDLLDLD')) }
      },
      loiSai: [
        { moTa: 'Viết chuỗi bằng chữ thường: nhện không hiểu chữ nào nên đứng im', baiLam: { chinh: DI(C5.toLowerCase()) }, phaiCoMa: ['nhen-khong-buoc', 'chua-toi-co'] },
        { moTa: 'Thiếu chữ cuối cùng: nhện dừng sát cờ', baiLam: { chinh: DI(C5.slice(0, -1)) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhầm một chữ ở giữa chuỗi: nhện đâm tường', baiLam: { chinh: DI('URRDRRDULLDLD') }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên dấu nháy quanh chuỗi', baiLam: { chinh: ['for c in ' + C5 + ':', '    go(c)'] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Mỗi chữ gõ thành một dòng go("…") riêng: quá 10 ô', baiLam: { chinh: C5.split('').map(function (c) { return 'go("' + c + '")'; }) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đọc đường đi từng ô một từ chỗ nhện đứng: mỗi bước sang ô kế là một chữ.',
        'Chuỗi viết trong ngoặc kép: "U", "D", "L", "R", viết HOA, không cách và không chữ thừa.']
    }, false),

    man({
      so: 6, ten: 'Nhện nhặt hàng', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['go', 'pick', 'drop'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Nhện cũng có tay kẹp: pick() và drop() dùng như ở xe bánh. Nhặt vật rồi mang tới ô đích (khung vàng).',
      veMaMau: 'Chương trình có sẵn đưa nhện tới chỗ vật rồi dừng. Viết tiếp phần nhặt vật và mang tới đích.',
      san: ['.###', 'S..#', '##.o', '###.', '#...', '#D##'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: DI('DRRDR') },
      sao: { o: 24, nhip: 23 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn đi tới vật chia làm hai chuỗi',
        baiLam: { chinh: nhieu(DI('DRR'), DI('DR'), ['pick()'], DI('DDLLD'), ['drop()']) }
      },
      loiSai: [
        { moTa: 'Quên pick(): nhện tới đích tay không', baiLam: { chinh: nhieu(DI('DRRDR'), DI('DDLLD'), ['drop()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop(): vật vẫn nằm trên tay', baiLam: { chinh: nhieu(DI('DRRDR'), ['pick()'], DI('DDLLD')) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hạ tay và kẹp rồi bước luôn: tay vướng sàn nên nhện không bước được', baiLam: { chinh: nhieu(DI('DRRDR'), ['arm_down()', 'grab()'], DI('DDLLD'), ['drop()']) }, phaiCoMa: ['tay-vuong', 'chua-dua-vat'] },
        { moTa: 'Thả bằng release() khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: nhieu(DI('DRRDR'), ['pick()'], DI('DDLLD'), ['release()', 'wait()']) }, phaiCoMa: ['vat-vo'] }
      ],
      goiY: ['pick() và drop() tự hạ tay, kẹp hoặc thả, rồi nâng tay lên lại, nên gọi xong là nhện bước tiếp được.',
        'Đếm số bước từ chỗ nhện đứng tới vật, rồi từ vật tới ô đích.']
    }, true),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Sửa hàm go_sai', hang: 'bien-the',
      deBai: 'Hàm go_sai(d) của màn viết nhầm một nhánh nên nhện đi lạc khỏi đường. Tìm nhánh sai và sửa để nhện đi đúng theo chuỗi tới cờ.',
      veMaMau: 'Chương trình có sẵn đi theo chuỗi chữ bằng go_sai(c). Chạy thử, xem nhện lạc từ chữ nào rồi sửa thân hàm.',
      san: ['.#...', '.#.#.', '...#.', '###F.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: DI(C7, 'go_sai'), hamCuaMan: [hGoSai(T_GO_SAI)] },
      sao: { o: 10, nhip: 24 },
      loiGiai: { chinh: DI(C7, 'go_sai'), hamCuaMan: [hGoSai(T_GO)] },
      loiGiaiKhac: {
        moTa: 'Sửa nhánh sai và chép d sang biến trung gian trước khi so sánh',
        baiLam: { chinh: DI(C7, 'go_sai'), hamCuaMan: [hGoSai(nhieu(['huong = d'], T_GO.map(function (s) { return s.replace('d ==', 'huong =='); })))] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: nhánh "U" vẫn gọi go_down(), nhện đâm tường', baiLam: { chinh: DI(C7, 'go_sai'), hamCuaMan: [hGoSai(T_GO_SAI)] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa nhầm nhánh "D" thành go_up()', baiLam: { chinh: DI(C7, 'go_sai'), hamCuaMan: [hGoSai(T_GO_SAI.map(function (s, i) { return i === 1 ? '    go_up()' : i === 3 ? '    go_up()' : s; }))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Xóa luôn nhánh "U" thay vì sửa: nhện không bao giờ đi lên', baiLam: { chinh: DI(C7, 'go_sai'), hamCuaMan: [hGoSai(['if d == "D":', '    go_down()', 'elif d == "L":', '    go_left()', 'elif d == "R":', '    go_right()'])] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Chạy thử và xem nhện bước sai ở chữ nào: chữ đó thuộc nhánh nào của go_sai?',
        'Mỗi nhánh phải gọi đúng lệnh của hướng nó: U là go_up, D là go_down, L là go_left, R là go_right.']
    }, false),

    man({
      so: 8, ten: 'Băng ngược chiều', hang: 'bien-the',
      deBai: 'Hàng băng chuyền chạy ngược hướng nhện muốn đi: nhện bước vào là bị đẩy lùi lại, không qua được. Tìm đường vòng qua các bậc thang S để tới cờ.',
      san: ['..SSS..', '.#####.', '.#####.', '.<<<<<F'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: LAP(6, 'go_right()') },
      veMaMau: 'Chương trình có sẵn đi thẳng sang phải dọc băng chuyền. Chạy thử, xem nhện có tới được cờ không.',
      sao: { o: 6, nhip: 24 },
      loiGiai: { chinh: nhieu(LAP(3, 'go_up()'), LAP(6, 'go_right()'), LAP(3, 'go_down()')) },
      loiGiaiKhac: {
        moTa: 'Đi theo chuỗi chỉ đường bằng hàm go()',
        baiLam: { chinh: DI('UUURRRRRRDDD') }
      },
      loiSai: [
        { moTa: 'Đi thẳng dọc băng chuyền ngược chiều: nhện kẹt tại chỗ', baiLam: { chinh: LAP(6, 'go_right()') }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi vòng nhưng thiếu một bước ngang: nhện xuống nhầm chỗ và đâm tường', baiLam: { chinh: nhieu(LAP(3, 'go_up()'), LAP(5, 'go_right()'), LAP(3, 'go_down()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi vòng đủ bước ngang nhưng xuống thiếu một ô: nhện dừng sát cờ', baiLam: { chinh: nhieu(LAP(3, 'go_up()'), LAP(6, 'go_right()'), LAP(2, 'go_down()')) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Băng chuyền đẩy theo mũi tên: nhện bước ngược mũi tên thì bị đẩy lùi đúng bằng quãng vừa bước.',
        'Thử đi vào băng một lần để thấy nó chặn thế nào, rồi tìm lối khác qua các bậc thang.']
    }, false),

    man({
      so: 9, ten: 'Hàm walk(path)', hang: 'bien-the', canHam: 'tran-khung', hamCuaEmCan: ['go', 'pick', 'drop'], taoHam: ['walk'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Tạo hàm walk(path): đi theo từng chữ của chuỗi path. Dùng nó cùng pick() và drop() để đưa hai vật tới hai ô đích.',
      veMaMau: 'Chương trình có sẵn gọi walk() cho từng đoạn đường, nhưng em chưa có hàm đó. Tạo hàm walk với một đối số path.',
      san: ['..So#', '###.#', '#.D.#', '#.###', '#o..D'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: CHINH_9.slice() },
      sao: { o: 28, nhip: 31 },
      loiGiai: { chinh: CHINH_9.slice(), hamCuaEmMoi: [hWalk()] },
      loiGiaiKhac: {
        moTa: 'Đoạn đầu tiên gọi walk() hai lần: "RR" rồi "R"',
        baiLam: { chinh: nhieu(['walk("RR")', 'walk("R")'], CHINH_9.slice(1)) },
        hamCuaEmMoi: [hWalk()]
      },
      loiSai: [
        { moTa: 'Gọi walk() mà chưa tạo hàm', baiLam: { chinh: CHINH_9.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi walk(RRR) quên dấu nháy quanh chuỗi', baiLam: { chinh: ['walk(RRR)'].concat(CHINH_9.slice(1)) }, hamCuaEmMoi: [hWalk()], phaiCoMa: ['loi-chay'] },
        { moTa: 'Gọi walk() không đưa chuỗi vào', baiLam: { chinh: ['walk()'].concat(CHINH_9.slice(1)) }, hamCuaEmMoi: [hWalk()], phaiCoMa: ['loi-chay'] },
        { moTa: 'Thiếu một chữ ở đoạn mang vật thứ nhất: vật đặt sai chỗ', baiLam: { chinh: CHINH_9.map(function (s) { return s === 'walk("DDL")' ? 'walk("DD")' : s; }) }, hamCuaEmMoi: [hWalk()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không dùng walk(): mỗi đoạn một vòng for, quá 10 ô', baiLam: { chinh: nhieu(DI('RRR'), ['pick()'], DI('DDL'), ['drop()'], DI('LDD'), ['pick()'], DI('RRR'), ['drop()']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['walk(path) chỉ cần đi qua từng chữ của path và mỗi chữ gọi go(): giống chương trình ở màn trước.',
        'Mỗi đoạn đường là một lần gọi walk() với chuỗi của đoạn đó; giữa các đoạn là pick() hoặc drop().']
    }, true),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Ba vật, ba băng', hang: 'trum', canHam: 'tran-khung', hamCuaEmCan: ['go', 'walk', 'pick', 'drop'], taoHam: ['bring'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Ba vật nằm rải trên đường có bậc thang và băng chuyền xuôi chiều. Tạo hàm bring(path): nhặt vật, đi theo path rồi thả; dùng nó cùng walk() để đưa mỗi vật tới ô đích.',
      veMaMau: 'Chương trình có sẵn đã gọi bring() cho ba chuyến, nhưng em chưa có hàm đó. Tạo hàm bring với một đối số path.',
      san: ['..o>>D.', '######S', '###D<<o', '###S###', 'D..o###'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: CHINH_10.slice() },
      sao: { o: 29, nhip: 39 },
      huyHieu: { ma: 'nhen', ten: 'Huy hiệu Thân nhện' },
      loiGiai: { chinh: CHINH_10.slice(), hamCuaEmMoi: [hBring()] },
      loiGiaiKhac: {
        moTa: 'Đoạn tới vật thứ nhất gọi walk() hai lần',
        baiLam: { chinh: nhieu(['walk("R")', 'walk("R")'], CHINH_10.slice(1)) },
        hamCuaEmMoi: [hBring()]
      },
      loiSai: [
        { moTa: 'Gọi bring() mà chưa tạo hàm', baiLam: { chinh: CHINH_10.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đếm theo số ô: bring("RRR") ở chặng đầu, băng đã đưa nhện đi xa nên vật thả sai chỗ', baiLam: { chinh: CHINH_10.map(function (s) { return s === 'bring("RR")' ? 'bring("RRR")' : s; }) }, hamCuaEmMoi: [hBring()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'bring() quên thả vật: vật vẫn trên tay', baiLam: { chinh: CHINH_10.slice() }, hamCuaEmMoi: [H('bring', ['path'], ['pick()', 'walk(path)'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không dùng bring(): mỗi chuyến viết walk, pick, walk, drop riêng, quá 10 ô', baiLam: { chinh: ['walk("RR")', 'pick()', 'walk("RR")', 'drop()', 'walk("RDD")', 'pick()', 'walk("LL")', 'drop()', 'walk("DD")', 'pick()', 'walk("LLL")', 'drop()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Băng chuyền xuôi chiều đẩy nhện thêm một ô: ở hai chặng có băng, số chữ trong chuỗi ít hơn số ô.',
        'Mỗi chuyến là: đi tới vật (walk), rồi bring() để nhặt, mang và thả.']
    }, true)
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
