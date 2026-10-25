/* ============================================================================
   man-nhen.js — "Robot Chấn Hưng": CHƯƠNG `nhen` · THÂN NHỆN (10 màn). Làm lại 15/10 theo khuôn "làm quen" (KE-HOACH-CHE-LENH.md, mục 5b.1):
   mã màn nhen.1…10 giữ nguyên, nội dung viết lại. Chương chế lệnh đi kèm: man-che-nhen.js (crawl, jump, leap…).
   Robot là NHỆN (loaiRobot 'nhen'; robot { than: 'nhen', tay: null }, chương này chưa gắn tay). Xưởng hàm mở, được dùng hàm của em. Chương trình 10 ô; mỗi hàm một khung riêng 10 ô.
   Đã học `for` và `if`; cauTruc ['for', 'if'].

   LUẬT NHỆN (san-hoc.js, phần NHỆN và phần CHÂN NHỆN):
   - Đi 4 hướng TUYỆT ĐỐI theo màn hình: go_up / go_down / go_left / go_right. Không có hướng mặt, không quay. Mỗi bước 2 nhịp; sang ô mới ở cuối nhịp thứ hai. wait() = 1 nhịp đứng yên.
   - Qua được bậc thang S (xe bánh không qua). Đâm tường: đứng yên, vẫn mất 2 nhịp. Băng chuyền như xe (xuôi thì lợi, ngược thì kẹt).
   - LỆNH CHÂN MỚI (chỉ ra lệnh, như lệnh tay): crouch() co chân, stand() duỗi chân. Chúng làm ở nhịp đầu của bước go_*() kế tiếp hay ở nhịp wait() kế tiếp; mỗi nhịp một lệnh chân.
   - Ô GẦM THẤP n: chỉ nhện đang CO chân chui qua được. Ô HỐ u: bước vào là rơi (thua). Hàng rào thấp =: đi không qua, nhảy qua được.
   - NHẢY: đang co chân mà stand() ngay trước một bước go_*() thì nhện bật qua MỘT ô (hố, hàng rào, hay ô sàn) và đáp ở ô kế. "crouch(); go_right(); stand(); go_right()" co chân khi bước, rồi nhảy.
     Chân phải CO lúc gọi stand(): chân đang duỗi thì stand() không làm gì và go_*() chỉ là một bước thường. Muốn duỗi chân mà KHÔNG nhảy thì đặt wait() sau stand().

   Python học ở chương: CHUỖI KÝ TỰ làm đối số, `if / elif` so sánh chuỗi (`d == "U"`), `for c in "UURR":`. Quy ước chữ chỉ đường: "U" lên, "D" xuống, "L" trái, "R" phải (chữ HOA).

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     nhen.4   go(d)       = if/elif d == "U"/"D"/"L"/"R": go_up / go_down / go_left / go_right   (8 ô)
     nhen.6   walk(path)  = for c in path: go(c)                                                   (2 ô)
   Hàm CỦA MÀN: nhen.7 cho sẵn go_sai(d) viết nhầm một nhánh. (go và walk giữ tên: chương drone dùng lại; bring và các hàm chế nằm ở man-che-nhen.js.)

   Trường riêng của chương này:
   - canHam: 'tran-khung' — viết KHÔNG dùng hàm / chuỗi thì tràn khung 10 ô (kiem-nhen.mjs chứng minh bằng chương trình viết thẳng trong loiSai).
   - nhipTheoLoiGiai: true (từ nhen.4) — sao.nhip là nhịp của lời giải CHUẨN. Nhện nhảy được qua ô sàn thường nên đường ngắn nhất (BFS, do-duong-nhen.mjs) có thể ngắn hơn lời giải
     viết theo chuỗi chỉ đường; kiem-hoc chỉ đòi BFS ≤ sao.nhip.
   - nhen.2 là màn BÓNG MỜ có bongMo.chan 'dung': xong việc chân nhện phải duỗi thẳng như bóng mờ.

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var HAM_NHEN_CHAN = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait'];       // từ nhen.2: khay mở thêm co / duỗi chân

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
  function hGo() { return H('go', ['d'], T_GO); }
  function hWalk() { return H('walk', ['path'], T_WALK); }
  // 7: go_sai(d) viết nhầm nhánh "U" (gọi go_down thay vì go_up)
  var T_GO_SAI = ['if d == "U":', '    go_down()', 'elif d == "D":', '    go_down()', 'elif d == "L":', '    go_left()', 'elif d == "R":', '    go_right()'];
  function hGoSai(than) { return H('go_sai', ['d'], than || T_GO); }

  function man(m) {
    m.chuong = 'nhen';
    m.cauTruc = ['for', 'if'];
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: null };
    m.hamGoc = m.hamGoc || HAM_NHEN_CHAN;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chuỗi chỉ đường dùng lại */

  var C4 = 'RRDRDDLLDDRR';            // 4: 12 bước
  var C7 = 'DDRRUURRDDDL';            // 7: 12 bước

  // 5: đi tới sát gầm, co chân chui gầm hai ô xuống, duỗi chân rồi NHẢY qua hố sang trái, đi nốt tới cờ
  var CHINH_5 = nhieu(DI('URRDRR'), ['crouch()'], DI('DD'), ['stand()', 'go("L")'], DI('DLD'));
  // 6: co chân từ đầu, đi tới sát hàng rào, duỗi chân nhảy qua, co chân chui gầm, duỗi chân (wait để khỏi nhảy), đi nốt
  var CHINH_6 = ['crouch()', 'walk("RRRRRRDDL")', 'stand()', 'walk("L")', 'crouch()', 'walk("LL")', 'stand()', 'wait()', 'walk("L")'];
  // 10 (trùm): hang ba tầng
  var CHINH_10 = ['crouch()', 'walk("RRRRRRDDLLLL")', 'stand()', 'walk("LDD")', 'crouch()', 'walk("RRRR")', 'stand()', 'walk("RDDLLLLLL")'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Bước chân nhện', hang: 'lam-quen', hamGoc: HAM_NHEN,
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
    }),

    man({
      so: 2, ten: 'Chui gầm', hang: 'lam-quen', mucTieu: 'bong-mo',
      deBai: 'Ô có vòm thấp là gầm (xe bánh phải đi vòng ở màn Sửa số cố định): nhện đứng thẳng thì đụng đầu. Gọi crouch() để co chân, gọi stand() để duỗi chân. Chui qua gầm rồi đứng đúng chỗ bóng mờ, chân duỗi thẳng như bóng mờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng hai ô. Chạy thử: nhện có qua được gầm không?',
      san: ['#####', '..n..', '#####'],
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 4, y: 1, huong: 0, chan: 'dung' },
      maMau: { chinh: ['go_right()', 'go_right()'] },
      sao: { o: 5, nhip: 9 },
      loiGiai: { chinh: nhieu(['crouch()'], LAP(4, 'go_right()'), ['stand()', 'wait()']) },
      loiGiaiKhac: {
        moTa: 'Viết từng bước một, không dùng vòng lặp',
        baiLam: { chinh: nhieu(['crouch()'], lap('go_right()', 4), ['stand()', 'wait()']) }
      },
      loiSai: [
        { moTa: 'Không co chân: nhện đứng thẳng nên đâm vào gầm', baiLam: { chinh: LAP(4, 'go_right()') }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Chui qua rồi quên duỗi chân: chân nhện vẫn co', baiLam: { chinh: nhieu(['crouch()'], LAP(4, 'go_right()')) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'stand() mà quên wait(): lệnh chân chưa kịp chạy', baiLam: { chinh: nhieu(['crouch()'], LAP(4, 'go_right()'), ['stand()']) }, phaiCoMa: ['quen-wait', 'lech-bong-mo'] },
        { moTa: 'Duỗi chân rồi đi thêm một bước: nhện bật nhảy quá sân', baiLam: { chinh: nhieu(['crouch()'], LAP(3, 'go_right()'), ['stand()', 'go_right()']) }, phaiCoMa: ['nhay-hut', 'lech-bong-mo'] },
        { moTa: 'Duỗi chân ngay trong gầm: đầu đụng trần nên chân vẫn co', baiLam: { chinh: ['crouch()', 'go_right()', 'go_right()', 'stand()', 'wait()', 'go_right()', 'go_right()'] }, phaiCoMa: ['dau-dung-tran', 'lech-bong-mo'] }
      ],
      goiY: ['Co chân trước khi bước vào gầm, duỗi chân sau khi chui ra.',
        'Lệnh chân chỉ chạy khi có một nhịp: viết wait() ngay sau stand() để chân kịp duỗi.']
    }),

    man({
      so: 3, ten: 'Cái hố', hang: 'lam-quen',
      deBai: 'Hố sâu (xe bánh phải tránh ở màn Tạo hàm forward): nhện bước vào là rơi. Muốn qua hố, nhện phải nhảy: đang co chân thì gọi stand() ngay trước một bước đi, nhện sẽ bật qua một ô. Đưa nhện qua hố tới cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng hai ô. Chạy thử xem nhện làm gì ở chỗ hố.',
      san: ['#####', '..u.F', '#####'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['go_right()', 'go_right()'] },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'go_right()'] },
      loiGiaiKhac: {
        moTa: 'Bước cuối cùng viết trong một vòng for',
        baiLam: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'for i in range(1):', '    go_right()'] }
      },
      loiSai: [
        { moTa: 'Đi thẳng vào hố: nhện rơi', baiLam: { chinh: LAP(3, 'go_right()') }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Chưa co chân đã gọi stand(): nhện không nhảy mà bước vào hố', baiLam: { chinh: ['go_right()', 'stand()', 'go_right()', 'go_right()'] }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'crouch() rồi stand() liền nhau: hai lệnh chân cùng một nhịp nên stand() bị bỏ', baiLam: { chinh: ['go_right()', 'crouch()', 'stand()', 'go_right()', 'go_right()'] }, phaiCoMa: ['chan-goi-lai', 'roi-ho', 'chua-toi-co'] },
        { moTa: 'Nhảy từ xa quá: đáp xuống chính cái hố', baiLam: { chinh: ['crouch()', 'wait()', 'stand()', 'go_right()', 'go_right()', 'go_right()'] }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Nhảy qua hố rồi dừng, chưa tới cờ', baiLam: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Chân phải đang co lúc gọi stand(), và stand() phải đứng ngay trước một lệnh go_*().',
        'Nhảy từ ô sát hố: nhện bay qua đúng một ô rồi đáp xuống ô bên kia.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm go(d)', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: [], taoHam: ['go'], nhipTheoLoiGiai: true,
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
        { moTa: 'Quên dấu hai chấm sau điều kiện if', baiLam: { chinh: DI(C4) }, hamCuaEmMoi: [H('go', ['d'], ['if d == "U"'].concat(T_GO.slice(1)))], phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Không dùng go(): mỗi bước một dòng go_*(), quá 10 ô', baiLam: { chinh: C4.split('').map(function (c) { return { U: 'go_up()', D: 'go_down()', L: 'go_left()', R: 'go_right()' }[c]; }) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['d là một chữ: "U" lên, "D" xuống, "L" trái, "R" phải. So sánh bằng ==, mỗi chữ một nhánh.',
        'if cho nhánh đầu, elif cho các nhánh còn lại; mỗi nhánh gọi đúng một lệnh go_*.']
    }),

    man({
      so: 5, ten: 'Tự viết chỉ đường', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['go'], nhipTheoLoiGiai: true,
      deBai: 'Nhìn sân rồi tự viết chuỗi chữ chỉ đường cho nhện (U lên, D xuống, L trái, R phải). Giữa đường có một gầm và một cái hố, nhớ co chân, duỗi chân và nhảy đúng chỗ.',
      veMaMau: 'Chương trình có sẵn đi theo chuỗi "URR": nhện đi lên rồi sang phải hai ô. Viết tiếp đường tới cờ.',
      san: ['...##', '.#...', '####n', '##.u.', '#..##', '#F###'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: DI('URR') },
      sao: { o: 17, nhip: 24 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: {
        moTa: 'Co chân ngay từ đầu, có chú thích ở chỗ nhảy',
        baiLam: { chinh: nhieu(['crouch()'], DI('URRDRR'), DI('DD'), ['stand()', '# nhảy qua hố', 'go("L")'], DI('DLD')) }
      },
      loiSai: [
        { moTa: 'Viết chuỗi bằng chữ thường: nhện không hiểu chữ nào nên đứng im', baiLam: { chinh: DI('urrdrrddldld') }, phaiCoMa: ['nhen-khong-buoc', 'chua-toi-co'] },
        { moTa: 'Quên co chân: nhện đâm vào gầm', baiLam: { chinh: nhieu(DI('URRDRR'), DI('DD'), ['stand()', 'go("L")'], DI('DLD')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi thẳng vào hố, không nhảy: nhện rơi', baiLam: { chinh: nhieu(['crouch()'], DI('URRDRRDDLLDLD')) }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Thiếu chữ cuối cùng: nhện dừng sát cờ', baiLam: { chinh: nhieu(['crouch()'], DI('URRDRR'), DI('DD'), ['stand()', 'go("L")'], DI('DL')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên dấu nháy quanh chuỗi', baiLam: { chinh: ['for c in URR:', '    go(c)'] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Mỗi chữ gõ thành một dòng go("…") riêng: quá 10 ô', baiLam: { chinh: 'URRDRRDDLDLD'.split('').map(function (c) { return 'go("' + c + '")'; }) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đọc đường đi từng ô một từ chỗ nhện đứng: mỗi bước sang ô kế là một chữ. Cú nhảy cũng chỉ là một bước go("…") sau stand().',
        'Chuỗi viết trong ngoặc kép, chữ HOA, không cách và không chữ thừa.']
    }),

    man({
      so: 6, ten: 'Hàm walk(path)', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['go'], taoHam: ['walk'], nhipTheoLoiGiai: true,
      deBai: 'Hàng rào thấp chắn đường: nhện không bước qua được nhưng nhảy qua được. Tạo hàm walk(path): đi theo từng chữ của chuỗi path. Dùng nó để đưa nhện qua hàng rào và gầm tới cờ.',
      veMaMau: 'Chương trình có sẵn co chân rồi gọi walk() cho đoạn đường đầu, nhưng em chưa có hàm walk. Tạo hàm walk với một đối số path.',
      san: ['.......', '######.', 'F.n.=..'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: ['crouch()', 'walk("RRRRRRDDL")'] },
      sao: { o: 19, nhip: 27 },
      loiGiai: { chinh: CHINH_6.slice(), hamCuaEmMoi: [hWalk()] },
      loiGiaiKhac: {
        moTa: 'Đoạn đầu chia làm hai lần gọi walk()',
        baiLam: { chinh: nhieu(['crouch()', 'walk("RRRRRR")', 'walk("DDL")'], CHINH_6.slice(2)) },
        hamCuaEmMoi: [hWalk()]
      },
      loiSai: [
        { moTa: 'Gọi walk() mà chưa tạo hàm', baiLam: { chinh: CHINH_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi walk(RRRRRR) quên dấu nháy quanh chuỗi', baiLam: { chinh: ['walk(RRRRRR)'].concat(CHINH_6.slice(1)) }, hamCuaEmMoi: [hWalk()], phaiCoMa: ['loi-chay'] },
        { moTa: 'Đi thẳng vào hàng rào, không nhảy: nhện đâm hàng rào', baiLam: { chinh: ['crouch()', 'walk("RRRRRRDDLLLLLL")'] }, hamCuaEmMoi: [hWalk()], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên wait() sau stand(): nhện bật nhảy ra khỏi cờ', baiLam: { chinh: ['crouch()', 'walk("RRRRRRDDL")', 'stand()', 'walk("L")', 'crouch()', 'walk("LL")', 'stand()', 'walk("L")'] }, hamCuaEmMoi: [hWalk()], phaiCoMa: ['nhay-hut', 'chua-toi-co'] },
        { moTa: 'Không dùng walk(): mỗi đoạn một vòng for, quá 10 ô', baiLam: { chinh: nhieu(['crouch()'], DI('RRRRRRDDL'), ['stand()', 'go("L")', 'crouch()'], DI('LL'), ['stand()', 'wait()', 'go("L")']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['walk(path) chỉ cần đi qua từng chữ của path và mỗi chữ gọi go(): giống chương trình ở màn trước.',
        'Mỗi đoạn đường là một lần gọi walk(); giữa các đoạn là crouch(), stand() hoặc wait().']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Sửa hàm go_sai', hang: 'bien-the', nhipTheoLoiGiai: true,
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
    }),

    man({
      so: 8, ten: 'Băng ngược chiều', hang: 'bien-the', nhipTheoLoiGiai: true,
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
    }),

    man({
      so: 9, ten: 'Sửa cú nhảy', hang: 'bien-the', nhipTheoLoiGiai: true,
      deBai: 'Hai cái hố nằm cách nhau một ô. Chương trình có sẵn nhảy qua được hố đầu nhưng nhện cứ rơi xuống hố thứ hai. Tìm chỗ sai và sửa để nhện nhảy qua cả hai hố tới cờ.',
      veMaMau: 'Chương trình có sẵn nhảy hai lần liên tiếp. Chạy thử, xem nhện rơi ở đâu rồi sửa.',
      san: ['#######', '..u.u.F'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'crouch()', 'stand()', 'go_right()', 'go_right()'] },
      sao: { o: 9, nhip: 9 },
      loiGiai: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'crouch()', 'wait()', 'stand()', 'go_right()', 'go_right()'] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, bước cuối viết trong một vòng for',
        baiLam: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'crouch()', 'wait()', 'stand()', 'go_right()', 'for i in range(1):', '    go_right()'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: stand() bị bỏ nên nhện không nhảy mà rơi xuống hố thứ hai', baiLam: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'crouch()', 'stand()', 'go_right()', 'go_right()'] }, phaiCoMa: ['chan-goi-lai', 'roi-ho', 'chua-toi-co'] },
        { moTa: 'Đổi chỗ crouch() và stand() cho nhau: vẫn hai lệnh chân cùng một nhịp', baiLam: { chinh: ['crouch()', 'go_right()', 'stand()', 'go_right()', 'stand()', 'crouch()', 'go_right()', 'go_right()'] }, phaiCoMa: ['chan-goi-lai', 'roi-ho', 'chua-toi-co'] },
        { moTa: 'Chèn wait() sau mỗi lệnh chân: nhện nhảy được nhưng chậm hơn hai nhịp', baiLam: { chinh: ['crouch()', 'wait()', 'go_right()', 'stand()', 'wait()', 'go_right()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Chạy thử và xem: nhện rơi ở hố nào? Hai lệnh chân đứng liền nhau thì lệnh sau có chạy không?',
        'Giữa crouch() và stand() cần một nhịp để chân kịp co.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Hang nhện', hang: 'trum', canHam: 'tran-khung', hamCuaEmCan: ['go', 'walk'], nhipTheoLoiGiai: true,
      deBai: 'Hang nhện có ba tầng nối nhau: hai cái hố, một đoạn gầm thấp và đường dài tới cờ. Dùng walk(), crouch() và stand() để đưa nhện tới cờ; chương trình chỉ có 10 ô.',
      veMaMau: 'Chương trình có sẵn co chân rồi đi tới sát hố đầu. Viết tiếp: nhảy qua hố, chui gầm, nhảy hố nữa rồi tới cờ.',
      san: ['.......', '######.', '.u.....', '.######', '...n.u.', '######.', 'F......'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: ['crouch()', 'walk("RRRRRRDDLLLL")'] },
      sao: { o: 18, nhip: 56 },
      huyHieu: { ma: 'nhen', ten: 'Huy hiệu Thân nhện' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn cuối chia làm hai lần gọi walk()',
        baiLam: { chinh: nhieu(CHINH_10.slice(0, 7), ['walk("R")', 'walk("DDLLLLLL")']) }
      },
      loiSai: [
        { moTa: 'Đi thẳng vào hố đầu, không nhảy: nhện rơi', baiLam: { chinh: ['crouch()', 'walk("RRRRRRDDLLLLL")'] }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Quên co chân trước khi vào gầm: nhện đâm', baiLam: { chinh: ['crouch()', 'walk("RRRRRRDDLLLL")', 'stand()', 'walk("LDD")', 'walk("RRRR")', 'stand()', 'walk("RDDLLLLLL")'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không duỗi chân trước hố thứ hai: nhện đi thẳng và rơi', baiLam: { chinh: ['crouch()', 'walk("RRRRRRDDLLLL")', 'stand()', 'walk("LDD")', 'crouch()', 'walk("RRRRRDDLLLLLL")'] }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Không dùng walk(): mỗi đoạn một vòng for, quá 10 ô', baiLam: { chinh: nhieu(['crouch()'], DI('RRRRRRDDLLLL'), ['stand()'], DI('LDD'), ['crouch()'], DI('RRRR'), ['stand()'], DI('RDDLLLLLL')) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đoạn nào cũng đi bằng walk(); crouch() và stand() chỉ cần ở chỗ hố và chỗ gầm.',
        'Nhảy qua hố là stand() ngay trước một bước đi, khi chân đang co. Chui xong gầm mà chân còn co thì nhảy luôn được.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
