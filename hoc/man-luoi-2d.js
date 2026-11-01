/* ============================================================================
   man-luoi-2d.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 6 "Mỏ đá",
   gói 1 "Bánh omni" (chương `omni` thêm màn trình diễn 11 và màn trùm 12 không tay;
   chương `luoi-2d` "Đọc bản đồ mỏ" dạy danh sách 2 chiều và vòng lặp lồng nhau trên xe omni).
   Mọi màn dùng R1 bánh omni nguyên bản: loaiRobot 'omni', robot { than: 'omni', tay: null, camBien: [] }.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_OMNI = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }

  function manOmni(m) {
    m.chuong = 'omni';
    m.cauTruc = ['for', 'if'];
    m.loaiRobot = 'omni';
    m.robot = { than: 'omni', tay: null, camBien: [] };
    m.hamGoc = HAM_OMNI.slice();
    m.mucTieu = 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  function manLuoi(m) {
    m.chuong = 'luoi-2d';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'omni';
    m.robot = { than: 'omni', tay: null, camBien: [] };
    m.hamGoc = HAM_OMNI.slice();
    m.mucTieu = 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  var T_RUN_ROW = ['slide_r(r[0])', 'forward(r[1])'];
  var T_RUN_GRID = ['for r in g:', '    run_row(r)'];

  var CHINH_OMNI_11 = ['slide_right()', 'wait()', 'move()', 'slide_right()', 'wait()', 'slide_right()', 'wait()', 'move()'];
  var CHINH_OMNI_12 = ['forward(2)', 'slide_r(2)', 'forward(3)', 'slide_l(2)', 'move()'];

  var DS = [
    /* ================================================= chương omni: màn 11 (trình diễn) & 12 (trùm không tay) ================================================= */
    manOmni({
      so: 11, ten: 'Trượt ngang mỏ đá', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['move'],
      deBai: 'Sola làm mẫu: ở mỏ đá, bộ não R1 lắp vào thân bánh omni. Ngoài tiến và quay như xe hai bánh, bánh omni có slide_left() và slide_right() để trượt ngang một ô mà không đổi hướng mặt. Bấm Chạy xem xe trượt ngang qua các bậc đá tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem xe omni vừa trượt ngang vừa tiến lên mà mũi xe luôn hướng lên trên.',
      san: ['###F', '#...', '..##'],
      batDau: { x: 0, y: 2, huong: 0 },
      maMau: bai(CHINH_OMNI_11),
      loiGiai: bai(CHINH_OMNI_11),
      sao: { o: 11, nhip: 5 },
      goiY: ['Luna: slide_right() trượt sang phải một ô theo hướng mặt xe, kèm wait() để hết nhịp.', 'Luna: Kết hợp trượt ngang và move() giúp xe đi bậc thang không cần quay mặt.']
    }),

    manOmni({
      so: 12, ten: 'Hành trình mỏ đá', hang: 'trum', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'slide_r', 'slide_l'],
      huyHieu: { ma: 'omni', ten: 'Huy hiệu Bánh omni' },
      deBai: 'Sola nhờ bạn: xe omni quay mặt sang phải ở cửa mỏ đá. Tiến hai ô tới đầu băng chuyền dọc, trượt xuống theo băng xuống đáy mỏ, tiến ba ô sang phải, rồi trượt lên theo băng bên phải để tới sát lá cờ và tiến vào cờ.',
      veMaMau: 'Chương trình có sẵn đưa xe tiến hai ô tới đầu dải băng dọc. Hãy viết tiếp phần trượt xuống, đi ngang đáy mỏ và trượt lên.',
      san: ['#####.F', '...##^#', '##v##^#', '##v##^#', '##....#'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['forward(2)']),
      loiGiai: bai(CHINH_OMNI_12),
      sao: { o: 16, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Đoạn đầu gọi hai lần move() thay vì forward(2)',
        baiLam: bai(['move()', 'move()', 'slide_r(2)', 'forward(3)', 'slide_l(2)', 'move()'])
      },
      loiSai: [
        { moTa: 'Nhầm hướng trượt khi mặt xe quay phải: gọi slide_l(2) trước nên xe đâm tường trên', baiLam: bai(['forward(2)', 'slide_l(2)', 'forward(3)', 'slide_r(2)', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên băng chuyền đẩy thêm ô: trượt xuống 3 nhịp nên đâm tường đáy', baiLam: bai(['forward(2)', 'slide_r(3)', 'forward(3)', 'slide_l(2)', 'move()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Thiếu bước move() cuối cùng để vào ô cờ', baiLam: bai(['forward(2)', 'slide_r(2)', 'forward(3)', 'slide_l(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Khi mặt xe quay sang phải, slide_r(n) trượt xuống dưới còn slide_l(n) trượt lên trên.', 'Luna: Đi xuôi băng chuyền mỗi nhịp được hai ô: hai nhịp trượt là qua hết dải băng.']
    }),

    /* ================================================= chương luoi-2d: Đọc bản đồ mỏ (10 màn) ================================================= */
    manLuoi({
      so: 1, ten: 'Bản đồ hai chiều', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Sola làm mẫu: bản đồ mỏ đá ghi các bậc thang bằng danh sách hai chiều g = [[2, 1], [3, 2]]. Mỗi phần tử r trong g là một cặp số [ngang, lên]: r[0] là số ô trượt phải, r[1] là số ô tiến lên. Bấm Chạy xem xe đọc từng cặp số để leo mỏ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem vòng lặp for r in g lấy từng hàng con r và chạy slide_r(r[0]), forward(r[1]).',
      san: ['#####F', '#####.', '##....', '...###'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: bai(['g = [[2, 1], [3, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']),
      loiGiai: bai(['g = [[2, 1], [3, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']),
      sao: { o: 12, nhip: 8 },
      goiY: ['Luna: Danh sách hai chiều là danh sách chứa các danh sách con.', 'Luna: Khi duyệt for r in g, mỗi lần lặp r là một cặp số [r[0], r[1]].']
    }),

    manLuoi({
      so: 2, ten: 'Lấy ô trong lưới', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Sola nhờ bạn: lưới g = [[3, 1], [2, 2]] có hai hàng: hàng đầu g[0] là [3, 1], hàng sau g[1] là [2, 2]. Chương trình mới chạy xong hàng đầu g[0]. Hãy gọi tiếp slide_r(g[1][0]) và forward(g[1][1]) để xe đi nốt hàng thứ hai tới cờ.',
      veMaMau: 'Chương trình có sẵn đã đi theo g[0][0] và g[0][1]. Viết thêm hai dòng lấy g[1][0] và g[1][1].',
      san: ['#####F', '#####.', '###...', '....##'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: bai(['g = [[3, 1], [2, 2]]', 'slide_r(g[0][0])', 'forward(g[0][1])']),
      loiGiai: bai(['g = [[3, 1], [2, 2]]', 'slide_r(g[0][0])', 'forward(g[0][1])', 'slide_r(g[1][0])', 'forward(g[1][1])']),
      sao: { o: 13, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for r in g để đi qua cả hai hàng',
        baiLam: bai(['g = [[3, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])'])
      },
      loiSai: [
        { moTa: 'Gọi lại g[0][0] và g[0][1] ở đoạn hai: xe trượt quá đà đâm tường', baiLam: bai(['g = [[3, 1], [2, 2]]', 'slide_r(g[0][0])', 'forward(g[0][1])', 'slide_r(g[0][0])', 'forward(g[0][1])']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ trượt g[1][0] mà quên forward(g[1][1])', baiLam: bai(['g = [[3, 1], [2, 2]]', 'slide_r(g[0][0])', 'forward(g[0][1])', 'slide_r(g[1][0])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng chỉ số g[2][0] vượt quá số hàng của lưới', baiLam: bai(['g = [[3, 1], [2, 2]]', 'slide_r(g[0][0])', 'forward(g[0][1])', 'slide_r(g[2][0])']), phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Luna: g[1] là hàng thứ hai [2, 2]; phần tử đầu là g[1][0], phần tử sau là g[1][1].', 'Luna: Sau hai dòng có sẵn, thêm slide_r(g[1][0]) rồi forward(g[1][1]).']
    }),

    manLuoi({
      so: 3, ten: 'Sửa ô trong lưới', hang: 'lam-quen', hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Sola viết vội, nhờ bạn sửa: đường lên mỏ có ba bậc, nhưng cặp số ở giữa g[1] trong lưới g = [[2, 2], [1, 1], [2, 1]] bị ghi sai số ô trượt phải. Hãy đếm lại bậc giữa trên sân và sửa lại số đầu của cặp giữa.',
      veMaMau: 'Chạy thử chương trình có sẵn: ở bậc thứ hai xe trượt thiếu nên đâm vào vách đá. Sửa lại cặp giữa trong g.',
      san: ['#######F', '#####...', '##....##', '##.#####', '...#####'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(['g = [[2, 2], [1, 1], [2, 1]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']),
      loiGiai: bai(['g = [[2, 2], [3, 1], [2, 1]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']),
      sao: { o: 12, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Duyệt theo chỉ số i trong range(len(g))',
        baiLam: bai(['g = [[2, 2], [3, 1], [2, 1]]', 'for i in range(len(g)):', '    slide_r(g[i][0])', '    forward(g[i][1])'])
      },
      loiSai: [
        { moTa: 'Không sửa gì: bậc giữa chỉ trượt 1 ô nên tiến lên đâm tường', baiLam: bai(['g = [[2, 2], [1, 1], [2, 1]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa thành [2, 1] ở bậc giữa: vẫn thiếu 1 ô trượt phải', baiLam: bai(['g = [[2, 2], [2, 1], [2, 1]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đổi nhầm r[1] thay vì r[0]: bậc giữa thành [1, 3] nên đâm tường ngay', baiLam: bai(['g = [[2, 2], [1, 3], [2, 1]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Bậc đầu dừng ở cột 2, bậc giữa cần trượt sang cột 5 rồi mới tiến lên 1 ô.', 'Luna: Đổi cặp [1, 1] ở giữa thành [3, 1].']
    }),

    manLuoi({
      so: 4, ten: 'Hai vòng lặp lồng nhau', hang: 'luyen', hamCuaEmCan: ['move', 'slide_r'],
      deBai: 'Sola nhờ bạn: lưới g = [[2, 1], [2, 2]] ghi độ dài bốn bậc đá chia làm hai tầng. Với mỗi số n trong từng hàng r của g, xe cần trượt phải n ô rồi tiến lên một ô bằng move(). Dùng hai vòng lặp for lồng nhau để duyệt hết lưới.',
      veMaMau: 'Chương trình có sẵn đã mở vòng lặp ngoài for r in g. Viết tiếp vòng lặp trong for n in r để trượt phải n ô rồi move().',
      san: ['#######F', '#####...', '###...##', '##..####', '...#####'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])']),
      loiGiai: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    for n in r:', '        slide_r(n)', '        move()']),
      sao: { o: 11, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Viết tường minh hai bậc của mỗi hàng r[0] và r[1]',
        baiLam: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    slide_r(r[0])', '    move()', '    slide_r(r[1])', '    move()'])
      },
      loiSai: [
        { moTa: 'Quên move() sau mỗi lần slide_r(n): xe trượt thẳng vào vách đá', baiLam: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    for n in r:', '        slide_r(n)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đặt move() ở ngoài vòng lặp trong: hết cả hàng mới tiến lên nên đâm tường', baiLam: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    for n in r:', '        slide_r(n)', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Tiến trước rồi mới trượt: đâm tường ngay từ nhịp đầu', baiLam: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    for n in r:', '        move()', '        slide_r(n)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Bên trong for r in g:, viết thêm for n in r: để lấy từng số n trong hàng r.', 'Luna: Trong vòng for n in r:, gọi slide_r(n) rồi move().']
    }),

    manLuoi({
      so: 5, ten: 'Hàng ba cột số', hang: 'luyen', hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Sola nhờ bạn: mỗi hàng r trong lưới g = [[2, 2, 1], [1, 2, 2]] có đủ ba số [r[0], r[1], r[2]]: trượt phải r[0] ô, tiến lên r[1] ô, trượt phải r[2] ô rồi tiến thêm 1 ô bằng move(). Hoàn thành thân vòng lặp để xe vượt hai tầng đá tới cờ.',
      veMaMau: 'Chương trình có sẵn mới chạy hai cột đầu r[0] và r[1]. Thêm bước trượt phải r[2] ô và move() vào cuối vòng lặp.',
      san: ['######F', '####...', '####.##', '###..##', '##..###', '##.####', '...####'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: bai(['g = [[2, 2, 1], [1, 2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])']),
      loiGiai: bai(['g = [[2, 2, 1], [1, 2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])', '    slide_r(r[2])', '    move()']),
      sao: { o: 14, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Bước lên cuối mỗi hàng gọi forward(1) thay vì move()',
        baiLam: bai(['g = [[2, 2, 1], [1, 2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])', '    slide_r(r[2])', '    forward(1)'])
      },
      loiSai: [
        { moTa: 'Thiếu move() ở cuối vòng lặp: hết hàng đầu xe chưa lên tầng hai nên đâm tường', baiLam: bai(['g = [[2, 2, 1], [1, 2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])', '    slide_r(r[2])']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi nhầm slide_r(r[0]) thay vì slide_r(r[2]) ở cột thứ ba', baiLam: bai(['g = [[2, 2, 1], [1, 2, 2]]', 'for r in g:', '    slide_r(r[0])', '    forward(r[1])', '    slide_r(r[0])', '    move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Ba số của mỗi hàng lần lượt ở chỉ số r[0], r[1] và r[2].', 'Luna: Sau forward(r[1]), thêm slide_r(r[2]) rồi move().']
    }),

    manLuoi({
      so: 6, ten: 'Hàm đọc hàng lưới', hang: 'luyen', canHam: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'slide_r'], taoHam: ['run_row'],
      deBai: 'Sola nhờ bạn: chế hàm run_row(r) nhận một hàng r gồm hai số [ngang, lên], trượt phải r[0] ô rồi tiến lên r[1] ô. Dùng run_row(r) để đi hết bốn bậc đá trong lưới g tới cờ.',
      veMaMau: 'Chương trình chính đã gọi run_row(r) cho từng hàng trong g, nhưng bạn chưa tạo hàm run_row. Hãy vào Xưởng hàm tạo run_row(r).',
      san: ['######F', '######.', '#####..', '###...#', '###.###', '##..###', '...####'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: bai(['g = [[2, 1], [1, 2], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)']),
      loiGiai: bai(['g = [[2, 1], [1, 2], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)'], { hamCuaEmMoi: [H('run_row', ['r'], T_RUN_ROW)] }),
      sao: { o: 13, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Gọi run_row cho từng hàng g[0], g[1], g[2], g[3]',
        baiLam: bai(['g = [[2, 1], [1, 2], [2, 1], [1, 2]]', 'run_row(g[0])', 'run_row(g[1])', 'run_row(g[2])', 'run_row(g[3])']),
        hamCuaEmMoi: [H('run_row', ['r'], T_RUN_ROW)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm run_row mà đã bấm Chạy', baiLam: bai(['g = [[2, 1], [1, 2], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân run_row(r) viết ngược thành forward(r[0]) trước rồi slide_r(r[1])', baiLam: bai(['g = [[2, 1], [1, 2], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)']), hamCuaEmMoi: [H('run_row', ['r'], ['forward(r[0])', 'slide_r(r[1])'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng hàm hay vòng lặp: viết thẳng 8 dòng trượt và tiến cùng các lệnh lẻ làm tràn 10 ô', baiLam: bai(nhieu(['slide_r(2)', 'forward(1)', 'slide_r(1)', 'move()', 'move()', 'slide_r(2)', 'forward(1)', 'slide_r(1)', 'move()', 'move()', 'wait()'])), phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Luna: Hàm run_row có một tham số r.', 'Luna: Thân hàm run_row(r) chỉ cần hai dòng: slide_r(r[0]) và forward(r[1]).']
    }),

    manLuoi({
      so: 7, ten: 'Đếm số hàng bằng len', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r', 'run_row'],
      deBai: 'Sola nhờ bạn: sau khi đi hết các bậc trong lưới g = [[2, 1], [2, 1], [1, 2]] bằng run_row(r), đoạn hành lang ngang cuối cùng tới cờ dài đúng bằng số hàng của lưới g. Hãy dùng len(g) cho bước trượt phải cuối cùng.',
      veMaMau: 'Chương trình có sẵn đã đi hết ba hàng của g. Thêm một dòng cuối trượt phải len(g) ô để tới cờ.',
      san: ['#####...F', '#####.###', '####..###', '##...####', '...######'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(['g = [[2, 1], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)']),
      loiGiai: bai(['g = [[2, 1], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)', 'slide_r(len(g))']),
      sao: { o: 14, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Gán n = len(g) vào biến rồi gọi slide_r(n)',
        baiLam: bai(['g = [[2, 1], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)', 'n = len(g)', 'slide_r(n)'])
      },
      loiSai: [
        { moTa: 'Chưa thêm bước trượt cuối cùng: xe dừng đầu hành lang trên', baiLam: bai(['g = [[2, 1], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng len(g[0]) thay vì len(g): mỗi hàng chỉ có 2 số nên xe trượt thiếu 1 ô', baiLam: bai(['g = [[2, 1], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)', 'slide_r(len(g[0]))']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đặt slide_r(len(g)) thụt lề vào trong vòng lặp for: xe đâm tường hai hàng đầu', baiLam: bai(['g = [[2, 1], [2, 1], [1, 2]]', 'for r in g:', '    run_row(r)', '    slide_r(len(g))']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Luna: Lưới g có 3 hàng con nên len(g) bằng 3, còn len(g[0]) là độ dài một hàng (bằng 2).', 'Luna: Đặt dòng slide_r(len(g)) ở ngoài vòng lặp for.']
    }),

    manLuoi({
      so: 8, ten: 'Lưới có băng chuyền', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r', 'run_row'],
      deBai: 'Sola viết vội, nhờ bạn sửa: hai hàng ngang trên sân đều có băng chuyền đẩy sang phải. Đi xuôi băng chuyền mỗi nhịp trượt được 2 ô, nhưng lưới g = [[1, 1], [1, 2]] mới trượt 1 nhịp chưa hết băng đã rẽ lên nên đâm tường. Hãy sửa lại hai số trượt ngang trong g.',
      veMaMau: 'Chạy thử chương trình có sẵn: mới trượt 1 nhịp trên băng xe đã rẽ lên đâm vách đá. Sửa lại số đầu của từng cặp trong g.',
      san: ['######F', '######.', '###>>..', '.>>.###'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: bai(['g = [[1, 1], [1, 2]]', 'for r in g:', '    run_row(r)']),
      loiGiai: bai(['g = [[2, 1], [2, 2]]', 'for r in g:', '    run_row(r)']),
      sao: { o: 13, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gọi run_row(g[0]) rồi run_row(g[1])',
        baiLam: bai(['g = [[2, 1], [2, 2]]', 'run_row(g[0])', 'run_row(g[1])'])
      },
      loiSai: [
        { moTa: 'Không sửa gì: mới trượt 1 nhịp chưa hết băng đã tiến lên đâm tường', baiLam: bai(['g = [[1, 1], [1, 2]]', 'for r in g:', '    run_row(r)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Tăng quá tay thành [[3, 1], [3, 2]]: trượt 3 nhịp trên băng đẩy xe đâm tường', baiLam: bai(['g = [[3, 1], [3, 2]]', 'for r in g:', '    run_row(r)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Luna: Trên băng chuyền, nhịp trượt đầu tiên đưa xe đi 2 ô, nhịp thứ hai ra tới ô sàn cuối hàng.', 'Luna: Mỗi hàng ngang chỉ cần 2 nhịp trượt: đổi g thành [[2, 1], [2, 2]].']
    }),

    manLuoi({
      so: 9, ten: 'Hàm đọc cả lưới', hang: 'bien-the', hamCuaEmCan: ['move', 'forward', 'slide_r', 'run_row'], taoHam: ['run_grid'],
      deBai: 'Sola nhờ bạn: chế hàm run_grid(g) nhận cả một lưới hai chiều g và duyệt từng hàng r trong g bằng run_row(r). Chương trình chính sẽ gọi run_grid hai lần cho hai khu mỏ liên tiếp.',
      veMaMau: 'Chương trình chính đã gọi run_grid cho hai lưới hai chiều, nhưng bạn chưa tạo hàm run_grid. Hãy vào Xưởng hàm tạo run_grid(g).',
      san: ['######F', '#####..', '###...#', '###.###', '##..###', '...####'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: bai(['run_grid([[2, 1], [1, 2]])', 'run_grid([[2, 1], [1, 1]])']),
      loiGiai: bai(['run_grid([[2, 1], [1, 2]])', 'run_grid([[2, 1], [1, 1]])'], { hamCuaEmMoi: [H('run_grid', ['g'], T_RUN_GRID)] }),
      sao: { o: 14, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Duyệt theo chỉ số i trong thân hàm run_grid(g)',
        baiLam: bai(['run_grid([[2, 1], [1, 2]])', 'run_grid([[2, 1], [1, 1]])']),
        hamCuaEmMoi: [H('run_grid', ['g'], ['for i in range(len(g)):', '    run_row(g[i])'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm run_grid mà đã bấm Chạy', baiLam: bai(['run_grid([[2, 1], [1, 2]])', 'run_grid([[2, 1], [1, 1]])']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'run_grid(g) chỉ gọi run_row(g[0]) mà không lặp qua cả lưới g', baiLam: bai(['run_grid([[2, 1], [1, 2]])', 'run_grid([[2, 1], [1, 1]])']), hamCuaEmMoi: [H('run_grid', ['g'], ['run_row(g[0])'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm run_grid có một tham số g là danh sách hai chiều.', 'Luna: Trong thân run_grid(g), viết for r in g: rồi gọi run_row(r).']
    }),

    manLuoi({
      so: 10, ten: 'Bản đồ mỏ đá lớn', hang: 'trum', hamCuaEmCan: ['move', 'forward', 'slide_r', 'run_row', 'run_grid'],
      huyHieu: { ma: 'luoi-2d', ten: 'Huy hiệu Đọc bản đồ mỏ' },
      deBai: 'Sola nhờ bạn: trùm cuối gói, lập lưới g = [[2, 1], [1, 2], [2, 1]] cho ba tầng đá đầu tiên rồi gọi run_grid(g). Sau khi lên tới tầng áp chót, trượt phải đúng len(g) ô rồi tiến lên 1 ô bằng move() để cắm cờ.',
      veMaMau: 'Chương trình có sẵn đã khai báo lưới g. Hãy gọi run_grid(g), trượt phải len(g) ô rồi move().',
      san: ['########F', '#####....', '###...###', '###.#####', '##..#####', '...######'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: bai(['g = [[2, 1], [1, 2], [2, 1]]']),
      loiGiai: bai(['g = [[2, 1], [1, 2], [2, 1]]', 'run_grid(g)', 'slide_r(len(g))', 'move()']),
      sao: { o: 16, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Bước cuối gọi forward(1) thay vì move()',
        baiLam: bai(['g = [[2, 1], [1, 2], [2, 1]]', 'run_grid(g)', 'slide_r(len(g))', 'forward(1)'])
      },
      loiSai: [
        { moTa: 'Quên trượt phải len(g) ô trước khi tiến lên ở tầng cuối', baiLam: bai(['g = [[2, 1], [1, 2], [2, 1]]', 'run_grid(g)', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt phải len(g) ô nhưng quên move() cuối cùng để vào cờ', baiLam: bai(['g = [[2, 1], [1, 2], [2, 1]]', 'run_grid(g)', 'slide_r(len(g))']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ghi sai hàng giữa của lưới g thành [1, 1]: xe thiếu một ô tiến lên nên đâm tường', baiLam: bai(['g = [[2, 1], [1, 1], [2, 1]]', 'run_grid(g)', 'slide_r(len(g))', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Gọi run_grid(g) để xe tự leo hết ba bậc trong lưới g.', 'Luna: Sau run_grid(g), gọi slide_r(len(g)) rồi move() để vào ô cờ.']
    })
  ];

  ManHoc.manLuoi2D = DS;
  if (laNode) module.exports = DS;
})();
