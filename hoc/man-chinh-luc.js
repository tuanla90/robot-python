/* ============================================================================
   man-chinh-luc.js — Mùa 7 "Mỏ đá" · Gói 6 "Chỉnh lực hất" (20 màn)
   Dựng lại 16/11 theo ghép nhịp 5b NÉM ĐÀ (cfg.nemDa, lo-trinh-hoc.js bật cho gói này):
   aim(n) chỉ còn n = 1, 2. Muốn xa hơn thì CHẠY ĐÀ: throw() cùng nhịp với tiến thẳng,
   xe tiến 1 ô, đá rời tay ở ô mới và bay thêm 1 ô ("ném lao phải chạy đà").
   - Chương 1: chinh-luc (10 màn) — "Hất gần, hất xa": ĐỨNG YÊN, tầm 1 và tầm 2.
     .1 trình diễn aim(1) · .2 ép aim(1) (aim(3) là tam-sai) · .3 đổi tầm 2 → 1 · .4 danh sách tầm (2 sân)
     .5 đè nút mở cửa, nhắc đi chéo · .6 đổi tầm 1 → 2 · .7 radar chọn tầm (2 sân) · .8 cọc báo tầm (2 sân)
     .9 bảng trượt + tầm (2 sân) · .10 trùm (2 sân)
   - Chương 2: che-chinh-luc (10 màn) — "Chế lệnh: chạy đà": NÉM ĐÀ + hàm của em.
     .1 trình diễn chạy đà (khoá, bấm Chạy) · .2 ép: đứng yên không tới (giấu hàm của em) · .3 chế run_throw()
     .4 chế run_lob() · .5 chế aim_lob(n): n = 3 thì tự chạy đà · .6 chế fill_far() · .7 chế lob_step(r)
     .8 chế auto_aim() (2 sân) · .9 chế diag_aim(n) · .10 trùm (2 sân)
     Hàm giữ TÊN + CHỮ KÝ cho gói 7–10 và mùa 8, 9: aim_lob(n), fill_far(), lob_step(r), auto_aim(), diag_aim(n).
     aim_lob(3) kết thúc ở đúng ô xuất phát (chạy đà rồi back()), nên màn sau gọi aim_lob(3) không phải đổi sân.
   Toàn bộ 20 màn chạy trên Máy khai mỏ R1 (loaiRobot: 'omni', tay: 'nem',
   camBien: [{ ma: 'radar', o: 'tren' }], omniCheo: true, chinhLuc: true,
   tamNemMacDinh: 2, daLapHo: true).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_CHINH_LUC = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim'];
  var ROBOT_CHINH_LUC = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_RUN_THROW = ['left_move()', 'right_move()', 'throw()', 'wait()'];
  var T_RUN_LOB = ['load()', 'wait()', 'run_throw()'];
  var T_AIM_LOB = ['if n == 3:', '    aim(1)', '    run_lob()', '    back()', 'else:', '    aim(n)', '    lob()'];
  var T_FILL_FAR = ['aim(1)', 'run_lob()', 'forward(2)'];
  var T_LOB_STEP = ['slide_r(r[0])', 'aim_lob(r[1])'];
  var T_AUTO_AIM = ['g = radar()', 't = g[1][2]', 'if t == "#":', '    aim_lob(3)', 'else:', '    aim_lob(2)', 'forward(3)'];
  var T_DIAG_AIM = ['dir_fr()', 'aim_lob(n)'];

  // chương 1 màn 8, 10: một chặng = đọc cọc bên phải, xúc, tiến 1 ô, chọn tầm, hất, tiến 3 ô
  var CHANG = [
    '    g = radar()',
    '    t = g[1][2]',
    '    load()',
    '    wait()',
    '    move()',
    '    if t == "#":',
    '        aim(1)',
    '    else:',
    '        aim(2)',
    '    throw()',
    '    wait()',
    '    forward(3)'
  ];
  var CHANG_THIEU_ELSE = CHANG.slice(0, 7).concat(CHANG.slice(9));

  function manCL(o) {
    return Object.assign({
      loaiRobot: 'omni',
      robot: ROBOT_CHINH_LUC,
      omniCheo: true,
      chinhLuc: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_CHINH_LUC,
      moXuong: true,
      mucTieu: 'toi-co',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: [],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, o);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: chinh-luc — "Hất gần, hất xa" (10 màn): đứng yên, tầm 1 và tầm 2
       ======================================================================== */

    /* ---- Màn 1: Trình diễn cần gạt aim(n): aim(1) thả đá xuống hố ngay trước mũi (chiChay) ---- */
    manCL({
      id: 6601, chuong: 'chinh-luc', so: 1, ma: 'chinh-luc.1',
      ten: 'Cần gạt chỉnh tầm', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Tay hất của R1 có thêm cần gạt `aim(n)`. `aim(1)` hất gần 1 ô. `aim(2)` hất xa 2 ô. Đổi tầm không tốn nhịp. Bấm Chạy để xem R1 thả đá xuống hố ngay trước mũi.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy để xem.',
      goiY: ['Bấm Chạy. Nhìn dòng aim(1): viên đá chỉ bay 1 ô, rơi đúng hố.'],
      san: [
        '####',
        '##F#',
        '#ou#',
        '#..#',
        '####'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['load()', 'wait()', 'slide_r(1)', 'aim(1)', 'throw()', 'wait()', 'forward(2)']),
      loiGiai: bai(['load()', 'wait()', 'slide_r(1)', 'aim(1)', 'throw()', 'wait()', 'forward(2)']),
      sao: { o: 15, nhip: 5 },
      loiBinh: 'aim(n) đổi tầm ngay, không tốn nhịp. Đứng yên thì tay hất ném được 1 hoặc 2 ô.'
    }),

    /* ---- Màn 2: Ép aim(1): không chỉnh thì đá vọt qua hố; aim(3) không còn ---- */
    manCL({
      id: 6602, chuong: 'chinh-luc', so: 2, ma: 'chinh-luc.2',
      ten: 'Hất gần một ô', hang: 'lam-quen',
      hamCuaEmCan: ['move', 'forward', 'slide_l'],
      deBai: 'Hố sâu `u` nằm ở cột trái, ngay sát đường lên cờ. R1 xúc đá rồi trượt sang đó. Tầm đang là 2 ô nên đá sẽ vọt qua hố. Hãy chỉnh tầm cho đá rơi đúng hố.',
      veMaMau: 'Chương trình có sẵn chưa chỉnh tầm. Bấm Chạy xem đá rơi ở đâu, rồi thêm một lệnh.',
      goiY: [
        'Sau khi trượt, hố nằm ngay trước mũi xe: cách 1 ô.',
        'Thêm aim(1) trước throw().'
      ],
      san: [
        '#####',
        '#F###',
        '#u#o#',
        '#...#',
        '#####'
      ],
      batDau: { x: 3, y: 3, huong: 0 },
      maMau: bai(['load()', 'wait()', 'slide_l(2)', 'throw()', 'wait()', 'forward(2)']),
      loiGiai: bai(['load()', 'wait()', 'slide_l(2)', 'aim(1)', 'throw()', 'wait()', 'forward(2)']),
      sao: { o: 15, nhip: 6 },
      loiSai: [
        { moTa: 'Không chỉnh tầm: đá bay 2 ô, vọt qua hố; xe tiến lên thì rơi hố', baiLam: bai(['load()', 'wait()', 'slide_l(2)', 'throw()', 'wait()', 'forward(2)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Gọi aim(3): đứng yên thì tay hất chỉ nhận tầm 1 hoặc 2', baiLam: bai(['load()', 'wait()', 'slide_l(2)', 'aim(3)', 'throw()', 'wait()', 'forward(2)']), phaiCoMa: ['tam-sai'] }
      ],
      loiBinh: 'aim(1) thả đá xuống ô ngay trước mũi xe.'
    }),

    /* ---- Màn 3: Tầm 2 rồi đổi sang tầm 1 ---- */
    manCL({
      id: 6603, chuong: 'chinh-luc', so: 3, ma: 'chinh-luc.3',
      ten: 'Hai máng xa gần', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Có hai viên đá và hai máng `D`. Máng trái cách viên đá 1 ô: `lob()` hất tới ngay. Máng phải nằm bên cạnh viên đá thứ hai: R1 phải xúc, trượt sang rồi thả gần 1 ô.',
      veMaMau: 'Chương trình có sẵn đã hất viên đầu, xúc viên thứ hai và trượt sang cột máng. Hãy chỉnh tầm rồi hất.',
      goiY: [
        'Ở cột cuối, máng nằm ngay trước mũi xe: cách 1 ô.',
        'Thêm aim(1), throw(), wait().'
      ],
      san: [
        '######',
        '#D####',
        '#o#oD#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['lob()', 'slide_r(2)', 'load()', 'wait()', 'slide_r(1)']),
      loiGiai: bai(['lob()', 'slide_r(2)', 'load()', 'wait()', 'slide_r(1)', 'aim(1)', 'throw()', 'wait()']),
      sao: { o: 15, nhip: 7 },
      loiSai: [
        { moTa: 'Chưa hất viên đá thứ hai', baiLam: bai(['lob()', 'slide_r(2)', 'load()', 'wait()', 'slide_r(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên aim(1): đá bay 2 ô, đập vào tường phía sau máng', baiLam: bai(['lob()', 'slide_r(2)', 'load()', 'wait()', 'slide_r(1)', 'throw()', 'wait()']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Tầm giữ nguyên cho tới lần aim() kế tiếp.'
    }),

    /* ---- Màn 4: Danh sách tầm (2 sân, dữ liệu theo sân) ---- */
    manCL({
      id: 6604, chuong: 'chinh-luc', so: 4, ma: 'chinh-luc.4',
      ten: 'Dãy máng theo danh sách', hang: 'luyen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r'],
      deBai: 'Ba viên đá, ba máng `D`. Mỗi lượt R1 xúc đá, trượt phải 1 ô, hất vào máng, rồi trượt phải 1 ô nữa. Máng gần hay xa ghi trong `dists`. Mỗi sân một danh sách riêng (sân 1: `dists = [2, 1, 2]`). Hãy duyệt `for d in dists:` và đặt tầm bằng `d`.',
      veMaMau: 'Chương trình có sẵn dòng dists. Hãy viết vòng lặp ở dưới.',
      goiY: [
        'Trong vòng lặp: load(), wait(), slide_r(1), rồi đặt tầm aim(d).',
        'Sau đó throw(), wait(), và slide_r(1) để tới viên đá kế.'
      ],
      // dữ liệu theo sân: mỗi sân một danh sách dists, điền thẳng số của sân 1 thì vỡ đá ở sân 2 (và ngược lại)
      san: [[
        '#########',
        '#########',
        '##D###D##',
        '#o#oDo###',
        '#.......#',
        '#########'
      ], [
        '#########',
        '#########',
        '####D####',
        '#oDo#oD##',
        '#.......#',
        '#########'
      ]],
      duLieuSan: ['dists = [2, 1, 2]', 'dists = [1, 2, 1]'],
      batDau: { x: 1, y: 4, huong: 0 },
      khung: { chinh: 12, moiHam: 10, cauTruc: CAU_TRUC },
      maMau: bai(['dists = [2, 1, 2]']),
      loiGiai: bai([
        'dists = [2, 1, 2]',
        'for d in dists:',
        '    load()',
        '    wait()',
        '    slide_r(1)',
        '    aim(d)',
        '    throw()',
        '    wait()',
        '    slide_r(1)'
      ]),
      sao: { o: 12, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa viết vòng lặp duyệt dists', baiLam: bai(['dists = [2, 1, 2]']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên aim(d): lượt nào cũng hất 2 ô, đá đập vào tường', baiLam: bai(['dists = [2, 1, 2]', 'for d in dists:', '    load()', '    wait()', '    slide_r(1)', '    throw()', '    wait()', '    slide_r(1)']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Bỏ danh sách, điền thẳng tầm của sân 1: sang sân 2 đá đập vào tường', baiLam: bai(['dists = [2, 1, 2]', 'for d in [2, 1, 2]:', '    load()', '    wait()', '    slide_r(1)', '    aim(d)', '    throw()', '    wait()', '    slide_r(1)']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Danh sách dists cho R1 biết mỗi máng gần hay xa.'
    }),

    /* ---- Màn 5: Thả đá đè nút mở cửa, nhắc lại đi chéo ---- */
    manCL({
      id: 6605, chuong: 'chinh-luc', so: 5, ma: 'chinh-luc.5',
      ten: 'Thả đá đè công tắc', hang: 'luyen',
      hamCuaEmCan: ['move', 'dir_fr'],
      deBai: 'Cửa `C` chỉ mở khi có đá đè lên nút `M`. R1 xúc đá, lách chéo tới trước nút, thả đá gần 1 ô. Rồi lách chéo qua cửa và tiến tới cờ.',
      veMaMau: 'Chương trình có sẵn đã xúc đá và lách chéo tới trước nút M. Hãy thả đá lên nút rồi đi tiếp.',
      goiY: [
        'Nút M nằm ngay trước mũi xe: aim(1), throw(), wait().',
        'Cửa mở rồi thì dir_fr() qua cửa, move() tới cờ.'
      ],
      san: [
        '#####',
        '###F#',
        '##MC#',
        '#o..#',
        '#.###',
        '#####'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['load()', 'wait()', 'dir_fr()']),
      loiGiai: bai(['load()', 'wait()', 'dir_fr()', 'aim(1)', 'throw()', 'wait()', 'dir_fr()', 'move()']),
      sao: { o: 15, nhip: 5 },
      loiSai: [
        { moTa: 'Chưa thả đá lên nút M', baiLam: bai(['load()', 'wait()', 'dir_fr()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên aim(1): đá bay 2 ô, đập vào tường; cửa không mở', baiLam: bai(['load()', 'wait()', 'dir_fr()', 'throw()', 'wait()', 'dir_fr()', 'move()']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Xúc đá, mang đi, rồi thả gần 1 ô: đá nằm đúng chỗ em muốn.'
    }),

    /* ---- Màn 6: Tầm 1 rồi đổi lại tầm 2 ---- */
    manCL({
      id: 6606, chuong: 'chinh-luc', so: 6, ma: 'chinh-luc.6',
      ten: 'Hai hố lệch tầm', hang: 'luyen',
      roBanDau: true,
      hamCuaEmCan: ['move', 'forward', 'lob', 'dir_fr'],
      deBai: 'Rổ của R1 có sẵn một viên đá. Hố đầu nằm ngay trước mũi xe. Hố thứ hai ở nhánh phải, cách viên đá 1 ô. Hãy lấp cả hai hố rồi tới cờ. Nhớ đổi tầm cho từng hố.',
      veMaMau: 'Chương trình có sẵn đã lấp hố đầu bằng tầm 1 và lách sang nhánh phải. Hãy lấp hố thứ hai rồi tới cờ.',
      goiY: [
        'Tầm đang là 1. lob() lúc này chỉ thả đá lại chỗ cũ.',
        'Gọi aim(2) trước lob(), rồi forward(3).'
      ],
      san: [
        '####',
        '##F#',
        '##u#',
        '##o#',
        '#..#',
        '#.##',
        '#.##',
        '#u##',
        '#.##',
        '####'
      ],
      batDau: { x: 1, y: 8, huong: 0 },
      maMau: bai(['aim(1)', 'throw()', 'wait()', 'forward(3)', 'dir_fr()']),
      loiGiai: bai(['aim(1)', 'throw()', 'wait()', 'forward(3)', 'dir_fr()', 'aim(2)', 'lob()', 'forward(3)']),
      sao: { o: 21, nhip: 10 },
      loiSai: [
        { moTa: 'Dừng ở nhánh phải, chưa lấp hố thứ hai', baiLam: bai(['aim(1)', 'throw()', 'wait()', 'forward(3)', 'dir_fr()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên đổi lại aim(2): đá rơi về chỗ cũ, chắn đường xe', baiLam: bai(['aim(1)', 'throw()', 'wait()', 'forward(3)', 'dir_fr()', 'lob()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Mỗi hố một tầm. Đổi tầm trước khi hất.'
    }),

    /* ---- Màn 7: Bước lên sát máng rồi dùng radar chọn aim(1) hay aim(2) (2 sân) ---- */
    manCL({
      id: 6607, chuong: 'chinh-luc', so: 7, ma: 'chinh-luc.7',
      ten: 'Radar đo máng gần xa', hang: 'bien-the',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['move'],
      khung: { chinh: 12, moiHam: 10, cauTruc: CAU_TRUC },
      deBai: 'R1 xúc đá rồi tiến 1 ô. Máng `D` có sân nằm ngay trước mũi, có sân nằm xa hơn 1 ô. Hãy quét `g = radar()`, đọc ô trước mũi `g[0][1]`. Thấy `"D"` thì hất gần, không thì hất xa.',
      veMaMau: 'Chương trình có sẵn đã xúc đá, tiến lên và quét radar(). Hãy thêm if / else chọn tầm trước khi ném.',
      goiY: [
        'Ô ngay trước mũi xe là g[0][1].',
        'Viết t = g[0][1], rồi if t == "D": aim(1), else: aim(2).'
      ],
      san: [
        [
          '#####',
          '#...#',
          '#...#',
          '#.D.#',
          '#.o.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#...#',
          '#.D.#',
          '#...#',
          '#.o.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 5, huong: 0 },
        { x: 2, y: 5, huong: 0 }
      ],
      maMau: bai([
        'load()',
        'wait()',
        'move()',
        'g = radar()',
        'throw()',
        'wait()'
      ]),
      loiGiai: bai([
        'load()',
        'wait()',
        'move()',
        'g = radar()',
        't = g[0][1]',
        'if t == "D":',
        '    aim(1)',
        'else:',
        '    aim(2)',
        'throw()',
        'wait()'
      ]),
      sao: { o: 13, nhip: 3 },
      loiSai: [
        { moTa: 'Không chỉnh aim(1) khi máng ở ngay trước mặt: ở sân 1 đá vọt qua máng', baiLam: bai(['load()', 'wait()', 'move()', 'g = radar()', 'throw()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Luôn đặt aim(1): ở sân 2 đá chưa tới máng', baiLam: bai(['load()', 'wait()', 'move()', 'aim(1)', 'throw()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Radar nhìn ô trước mũi, R1 tự chọn tầm 1 hay tầm 2.'
    }),

    /* ---- Màn 8: Cọc đá bên phải báo tầm, lặp 2 chặng (2 sân) ---- */
    manCL({
      id: 6608, chuong: 'chinh-luc', so: 8, ma: 'chinh-luc.8',
      ten: 'Cọc đá báo tầm hất', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward'],
      khung: { chinh: 14, moiHam: 10, cauTruc: CAU_TRUC },
      deBai: 'Đường hầm có 2 chặng. Đầu mỗi chặng, R1 đọc ô bên phải `g[1][2]`. Có cọc đá `"#"` thì hố ở gần: xúc đá, tiến 1 ô, hất 1 ô. Không có cọc thì hố xa hơn: hất 2 ô. Xong mỗi chặng tiến 3 ô. Cuối cùng bước vào cờ.',
      veMaMau: 'Chương trình có sẵn đã đọc cọc, xúc đá và tiến 1 ô. Hãy chọn tầm, hất, rồi tiến 3 ô.',
      goiY: [
        'Trong vòng lặp, sau move(): if t == "#": aim(1), else: aim(2).',
        'Rồi throw(), wait(), forward(3). Ngoài vòng lặp gọi move().'
      ],
      san: [
        [
          '#####',
          '##F##',
          '##.##',
          '##u##',
          '##.##',
          '##o##',
          '##..#',
          '##.##',
          '##u##',
          '##o##',
          '##.##',
          '#####'
        ],
        [
          '#####',
          '##F##',
          '##.##',
          '##.##',
          '##u##',
          '##o##',
          '##.##',
          '##u##',
          '##.##',
          '##o##',
          '##..#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 10, huong: 0 },
        { x: 2, y: 10, huong: 0 }
      ],
      maMau: bai(['for i in range(2):'].concat(CHANG.slice(0, 5))),
      loiGiai: bai(['for i in range(2):'].concat(CHANG, ['move()'])),
      sao: { o: 19, nhip: 13 },
      loiSai: [
        { moTa: 'Mới xúc đá và tiến 1 ô, chưa hất', baiLam: bai(['for i in range(2):'].concat(CHANG.slice(0, 5))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu nhánh else: sau chặng tầm 1, tay hất vẫn giữ tầm 1', baiLam: bai(['for i in range(2):'].concat(CHANG_THIEU_ELSE, ['move()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Cọc đá bên phải là mốc: có cọc hất gần, không cọc hất xa.'
    }),

    /* ---- Màn 9: Bảng 2 chiều: trượt mấy ô, hất tầm nào (2 sân, dữ liệu theo sân) ---- */
    manCL({
      id: 6609, chuong: 'chinh-luc', so: 9, ma: 'chinh-luc.9',
      ten: 'Bảng phối tầm hất', hang: 'bien-the',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r'],
      khung: { chinh: 12, moiHam: 10, cauTruc: CAU_TRUC },
      deBai: 'Bảng `plan` ghi từng lượt. Mỗi sân một bảng riêng (sân 1: `plan = [[1, 2], [2, 1], [1, 2]]`). Mỗi hàng `r`: `r[0]` là số ô trượt phải sau khi xúc đá, `r[1]` là tầm hất. Hất xong, R1 trượt phải 1 ô tới viên đá kế.',
      veMaMau: 'Chương trình có sẵn dòng plan. Hãy viết vòng lặp ở dưới.',
      goiY: [
        'Trong vòng lặp: load(), wait(), slide_r(r[0]), aim(r[1]).',
        'Sau đó throw(), wait(), slide_r(1).'
      ],
      // dữ liệu theo sân: mỗi sân một bảng plan, điền thẳng số của sân 1 thì vỡ đá ở sân 2 (và ngược lại)
      san: [[
        '##########',
        '##########',
        '##D####D##',
        '#o#o#Do###',
        '#........#',
        '##########'
      ], [
        '##########',
        '##########',
        '#####D####',
        '#o#Do#oD##',
        '#........#',
        '##########'
      ]],
      duLieuSan: ['plan = [[1, 2], [2, 1], [1, 2]]', 'plan = [[2, 1], [1, 2], [1, 1]]'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['plan = [[1, 2], [2, 1], [1, 2]]']),
      loiGiai: bai([
        'plan = [[1, 2], [2, 1], [1, 2]]',
        'for r in plan:',
        '    load()',
        '    wait()',
        '    slide_r(r[0])',
        '    aim(r[1])',
        '    throw()',
        '    wait()',
        '    slide_r(1)'
      ]),
      sao: { o: 12, nhip: 12 },
      loiSai: [
        { moTa: 'Chưa viết vòng lặp duyệt bảng plan', baiLam: bai(['plan = [[1, 2], [2, 1], [1, 2]]']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên aim(r[1]): lượt nào cũng hất 2 ô, đá đập vào tường', baiLam: bai(['plan = [[1, 2], [2, 1], [1, 2]]', 'for r in plan:', '    load()', '    wait()', '    slide_r(r[0])', '    throw()', '    wait()', '    slide_r(1)']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Bỏ bảng, điền thẳng số của sân 1: sang sân 2 đá đập vào tường', baiLam: bai(['plan = [[1, 2], [2, 1], [1, 2]]', 'for r in [[1, 2], [2, 1], [1, 2]]:', '    load()', '    wait()', '    slide_r(r[0])', '    aim(r[1])', '    throw()', '    wait()', '    slide_r(1)']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Một hàng của bảng cho hai số: trượt mấy ô và hất tầm nào.'
    }),

    /* ---- Màn 10: Trùm chương 1 (2 sân): lách chéo vào hầm rồi vượt 2 chặng theo cọc ---- */
    manCL({
      id: 6610, chuong: 'chinh-luc', so: 10, ma: 'chinh-luc.10',
      ten: 'Trùm chỉnh lực mỏ đá', hang: 'trum',
      huyHieu: { ma: 'chinh-luc', ten: 'Tay Hất Chuẩn Tầm' },
      hamCuaEmCan: ['move', 'forward', 'dir_fr'],
      khung: { chinh: 16, moiHam: 10, cauTruc: CAU_TRUC },
      deBai: 'R1 đứng ngoài cửa hầm. Hãy lách chéo vào hầm. Trong hầm có 2 chặng: đầu mỗi chặng đọc ô bên phải `g[1][2]`. Có cọc `"#"` thì hố gần, không cọc thì hố xa. Vượt hết hai chặng rồi bước vào cờ.',
      veMaMau: 'Chương trình có sẵn mới lách chéo vào hầm. Hãy viết phần vượt 2 chặng.',
      goiY: [
        'Mỗi chặng: đọc cọc, load(), wait(), move(), chọn aim(1) hay aim(2), throw(), wait(), forward(3).',
        'Lặp 2 lần bằng for i in range(2):, cuối cùng move().'
      ],
      san: [
        [
          '#####',
          '##F##',
          '##.##',
          '##.##',
          '##u##',
          '##o##',
          '##.##',
          '##u##',
          '##.##',
          '##o##',
          '##..#',
          '#..##',
          '#####'
        ],
        [
          '#####',
          '##F##',
          '##.##',
          '##.##',
          '##u##',
          '##o##',
          '##.##',
          '##.##',
          '##u##',
          '##o##',
          '##.##',
          '#..##',
          '#####'
        ]
      ],
      batDau: [
        { x: 1, y: 11, huong: 0 },
        { x: 1, y: 11, huong: 0 }
      ],
      maMau: bai(['dir_fr()']),
      loiGiai: bai(['dir_fr()', 'for i in range(2):'].concat(CHANG, ['move()'])),
      sao: { o: 24, nhip: 14 },
      loiSai: [
        { moTa: 'Mới lách vào hầm, chưa vượt 2 chặng', baiLam: bai(['dir_fr()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không đọc cọc, chặng nào cũng hất 2 ô: gặp hố gần thì đá vọt qua, xe rơi hố', baiLam: bai(['dir_fr()', 'for i in range(2):', '    load()', '    wait()', '    move()', '    throw()', '    wait()', '    forward(3)', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Đứng yên, tay hất lo được hố gần và hố xa 2 ô. Xa hơn nữa thì sao? Sang chương sau.'
    }),

    /* ========================================================================
       CHƯƠNG 2: che-chinh-luc — "Chế lệnh: chạy đà" (10 màn): ném đà + hàm của em
       Hàm chế mới:
       1. run_throw()     (che-chinh-luc.3)   tiến + hất cùng nhịp
       2. run_lob()       (che-chinh-luc.4)   xúc rồi chạy đà hất
       3. aim_lob(n)      (che-chinh-luc.5)   n = 3 thì tự chạy đà, hất xong lùi về chỗ cũ
       4. fill_far()      (che-chinh-luc.6)
       5. lob_step(r)     (che-chinh-luc.7)
       6. auto_aim()      (che-chinh-luc.8)
       7. diag_aim(n)     (che-chinh-luc.9)
       ======================================================================== */

    /* ---- Màn 11 (che-chinh-luc.1): TRÌNH DIỄN chạy đà (khoá, bấm Chạy) ---- */
    manCL({
      id: 6611, chuong: 'che-chinh-luc', so: 1, ma: 'che-chinh-luc.1',
      ten: 'Chạy đà rồi hất', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      chiChay: true, chinhCoDinh: true,
      roBanDau: true,
      camHamCuaEm: true,
      deBai: 'Máng `D` nằm sau hai hàng rào, xa quá 2 ô. Sola bảo: ném lao phải chạy đà mới xa. R1 cũng vậy: tiến và hất trong cùng một nhịp thì đá bay thêm 1 ô. Bấm Chạy để xem.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy để xem.',
      goiY: ['Bấm Chạy. Ba lệnh left_move(), right_move(), throw() nằm chung một nhịp: xe tiến 1 ô rồi đá bay 3 ô.'],
      san: [
        '###',
        '#D#',
        '#=#',
        '#=#',
        '#.#',
        '#.#',
        '###'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['aim(2)', 'left_move()', 'right_move()', 'throw()', 'wait()']),
      loiGiai: bai(['aim(2)', 'left_move()', 'right_move()', 'throw()', 'wait()']),
      sao: { o: 5, nhip: 1 },
      loiBinh: 'Chạy đà: tiến và hất cùng một nhịp. Đá rời tay ở ô mới và bay thêm 1 ô.'
    }),

    /* ---- Màn 12 (che-chinh-luc.2): ÉP: đứng yên hất thì không tới (giấu hàm của em) ---- */
    manCL({
      id: 6612, chuong: 'che-chinh-luc', so: 2, ma: 'che-chinh-luc.2',
      ten: 'Đứng yên thì không tới', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      camHamCuaEm: true,
      deBai: 'Lần này viên đá nằm dưới đất. Máng `D` vẫn ở sau hai hàng rào. R1 xúc đá xong, đứng yên hất thì đá đập vào hàng rào. Hãy cho R1 chạy đà: tiến và hất trong cùng một nhịp.',
      veMaMau: 'Chương trình có sẵn đứng yên mà hất. Bấm Chạy xem đá rơi ở đâu, rồi sửa nhịp hất.',
      goiY: [
        'Viên đá vào rổ rồi thì ô trước mũi xe trống: đó là chỗ chạy đà.',
        'Đặt left_move(), right_move() ngay trước throw(), chung một nhịp với nó.'
      ],
      san: [
        '###',
        '#D#',
        '#=#',
        '#=#',
        '#o#',
        '#.#',
        '###'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['load()', 'wait()', 'throw()', 'wait()']),
      loiGiai: bai(['load()', 'wait()', 'left_move()', 'right_move()', 'throw()', 'wait()']),
      sao: { o: 6, nhip: 2 },
      loiSai: [
        { moTa: 'Đứng yên mà hất: đá bay 2 ô, đập vào hàng rào', baiLam: bai(['load()', 'wait()', 'throw()', 'wait()']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Tiến một nhịp rồi mới hất ở nhịp sau: không có đà, đá vẫn đập vào hàng rào', baiLam: bai(['load()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'throw()', 'wait()']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Gọi aim(3): tay hất chỉ nhận tầm 1 hoặc 2', baiLam: bai(['load()', 'wait()', 'aim(3)', 'throw()', 'wait()']), phaiCoMa: ['tam-sai'] },
        { moTa: 'Lùi và hất cùng nhịp: lùi không có đà, xe đứng yên', baiLam: bai(['load()', 'wait()', 'left_back()', 'right_back()', 'throw()', 'wait()']), phaiCoMa: ['nem-dung-yen', 'nem-vo'] }
      ],
      loiBinh: 'Tiến rồi mới hất thì không có đà. Phải tiến và hất trong cùng một nhịp.'
    }),

    /* ---- Màn 13 (che-chinh-luc.3): Chế hàm run_throw() ---- */
    manCL({
      id: 6613, chuong: 'che-chinh-luc', so: 3, ma: 'che-chinh-luc.3',
      ten: 'Chế hàm chạy đà', hang: 'lam-quen',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['run_throw'],
      chinhCoDinh: true,
      hamCuaEmCan: ['slide_r'],
      deBai: 'Hai viên đá, hai máng `D` sau hàng rào. Lần nào cũng phải chạy đà. Hãy viết hàm `run_throw()`: tiến và hất trong cùng một nhịp.',
      veMaMau: 'Chương trình chính đã xúc đá và gọi run_throw() hai lần. Hãy vào Xưởng hàm sửa thân hàm run_throw().',
      goiY: [
        'Thân hàm cần bốn dòng: hai lệnh bánh tiến, throw(), rồi wait().',
        'Không đặt wait() giữa lệnh bánh và throw().'
      ],
      san: [
        '#####',
        '###D#',
        '#D#=#',
        '#=#=#',
        '#=#o#',
        '#o..#',
        '#.###',
        '#####'
      ],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['load()', 'wait()', 'run_throw()', 'slide_r(2)', 'load()', 'wait()', 'run_throw()'], { hamCuaEmMoi: [H('run_throw', [], ['throw()', 'wait()'])] }),
      loiGiai: bai(['load()', 'wait()', 'run_throw()', 'slide_r(2)', 'load()', 'wait()', 'run_throw()'], { hamCuaEmMoi: [H('run_throw', [], T_RUN_THROW)] }),
      sao: { o: 14, nhip: 6 },
      loiSai: [
        { moTa: 'run_throw() chỉ hất, không chạy đà: đá đập vào hàng rào', baiLam: bai(['load()', 'wait()', 'run_throw()', 'slide_r(2)', 'load()', 'wait()', 'run_throw()']), hamCuaEmMoi: [H('run_throw', [], ['throw()', 'wait()'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'run_throw() có wait() chen giữa: tiến một nhịp, hất nhịp sau, không có đà', baiLam: bai(['load()', 'wait()', 'run_throw()', 'slide_r(2)', 'load()', 'wait()', 'run_throw()']), hamCuaEmMoi: [H('run_throw', [], ['left_move()', 'right_move()', 'wait()', 'throw()', 'wait()'])], phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'run_throw() gói cú chạy đà thành một lệnh.'
    }),

    /* ---- Màn 14 (che-chinh-luc.4): Chế hàm run_lob() ---- */
    manCL({
      id: 6614, chuong: 'che-chinh-luc', so: 4, ma: 'che-chinh-luc.4',
      ten: 'Chế hàm xúc rồi chạy đà', hang: 'luyen',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['run_lob'],
      chinhCoDinh: true,
      hamCuaEmCan: ['slide_r', 'back', 'run_throw'],
      deBai: 'Ba viên đá xếp hàng, mỗi viên có một máng `D` sau hai hàng rào. Hãy viết hàm `run_lob()`: xúc viên đá trước mũi, rồi chạy đà hất.',
      veMaMau: 'Chương trình chính đã lặp 3 lần: run_lob(), lùi về, trượt sang cột kế. Hãy vào Xưởng hàm viết thân hàm run_lob().',
      goiY: [
        'Xúc trước: load(), wait().',
        'Rồi gọi run_throw().'
      ],
      san: [
        '#########',
        '#########',
        '#D#D#D###',
        '#=#=#=###',
        '#=#=#=###',
        '#o#o#o###',
        '#.......#',
        '#########'
      ],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['for i in range(3):', '    run_lob()', '    back()', '    slide_r(2)'], { hamCuaEmMoi: [H('run_lob', [], ['load()', 'wait()'])] }),
      loiGiai: bai(['for i in range(3):', '    run_lob()', '    back()', '    slide_r(2)'], { hamCuaEmMoi: [H('run_lob', [], T_RUN_LOB)] }),
      sao: { o: 17, nhip: 12 },
      loiSai: [
        { moTa: 'run_lob() mới xúc, chưa chạy đà hất', baiLam: bai(['for i in range(3):', '    run_lob()', '    back()', '    slide_r(2)']), hamCuaEmMoi: [H('run_lob', [], ['load()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'run_lob() chạy đà trước khi xúc: viên đá còn chắn ô trước mũi, xe không có chỗ chạy đà', baiLam: bai(['for i in range(3):', '    run_lob()', '    back()', '    slide_r(2)']), hamCuaEmMoi: [H('run_lob', [], ['run_throw()', 'load()', 'wait()'])], phaiCoMa: ['khong-co-da', 'nem-vo'] }
      ],
      loiBinh: 'Xúc đá xong thì ô trước mũi trống: đúng chỗ để chạy đà.'
    }),

    /* ---- Màn 15 (che-chinh-luc.5): Chế hàm aim_lob(n): n = 3 thì chạy đà ---- */
    manCL({
      id: 6615, chuong: 'che-chinh-luc', so: 5, ma: 'che-chinh-luc.5',
      ten: 'Chế hàm hất theo tầm', hang: 'luyen',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['aim_lob'],
      chinhCoDinh: true,
      hamCuaEmCan: ['slide_r', 'lob', 'back', 'run_throw', 'run_lob'],
      deBai: 'Hàm `aim_lob(n)` xúc viên đá trước mũi rồi hất tới ô cách xe `n` ô. Với `n` là 1 hay 2 thì đứng yên hất. Với `n` là 3 thì phải chạy đà: đặt tầm 1, chạy đà 1 ô, đá bay 2 ô từ ô mới, rồi lùi về chỗ cũ. Hãy sửa thân hàm.',
      veMaMau: 'Chương trình chính đã gọi aim_lob(3), slide_r(2), aim_lob(2). Thân hàm có sẵn gọi aim(3) nên báo lỗi. Hãy vào Xưởng hàm sửa.',
      goiY: [
        'Viết if n == 3: rồi aim(1), run_lob(), back().',
        'Nhánh else: giữ aim(n) và lob().'
      ],
      san: [
        '#####',
        '#D###',
        '#=#D#',
        '#o#o#',
        '#...#',
        '#####'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)'], { hamCuaEmMoi: [H('aim_lob', ['n'], ['aim(n)', 'lob()'])] }),
      loiGiai: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)'], { hamCuaEmMoi: [H('aim_lob', ['n'], T_AIM_LOB)] }),
      sao: { o: 27, nhip: 7 },
      loiSai: [
        { moTa: 'aim_lob(n) gọi thẳng aim(n): với n = 3 thì tay hất báo lỗi tầm', baiLam: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)']), hamCuaEmMoi: [H('aim_lob', ['n'], ['aim(n)', 'lob()'])], phaiCoMa: ['tam-sai'] },
        { moTa: 'Nhánh n = 3 quên aim(1): chạy đà với tầm 2, đá bay quá máng, đập vào tường', baiLam: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)']), hamCuaEmMoi: [H('aim_lob', ['n'], ['if n == 3:', '    run_lob()', '    back()', 'else:', '    aim(n)', '    lob()'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Nhánh n = 3 quên back(): xe còn đứng ở ô trên, trượt sang thì đâm tường', baiLam: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)']), hamCuaEmMoi: [H('aim_lob', ['n'], ['if n == 3:', '    aim(1)', '    run_lob()', 'else:', '    aim(n)', '    lob()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      loiBinh: 'aim_lob(n) lo cả ba tầm: 1 và 2 đứng yên, 3 thì tự chạy đà rồi lùi về.'
    }),

    /* ---- Màn 16 (che-chinh-luc.6): Chế hàm fill_far() ---- */
    manCL({
      id: 6616, chuong: 'che-chinh-luc', so: 6, ma: 'che-chinh-luc.6',
      ten: 'Chế hàm lấp hố xa', hang: 'luyen',
      canHam: 'tran-khung',
      taoHam: ['fill_far'],
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'run_throw', 'run_lob'],
      deBai: 'Dọc đường hầm, mỗi hố sâu cách R1 đúng 3 ô, ngay sau một viên đá. Hãy viết hàm `fill_far()`: đặt tầm 1, xúc đá và chạy đà để lấp hố, rồi tiến tiếp tới đứng trên ô vừa lấp. Chạy đà xong không cần lùi.',
      veMaMau: 'Chương trình chính đã gọi fill_far() 2 lần rồi move() vào cờ. Thân hàm có sẵn mới chạy đà lấp hố. Hãy thêm phần tiến tiếp.',
      goiY: [
        'Chạy đà xong, R1 đã tiến 1 ô. Ô vừa lấp còn cách 2 ô.',
        'Thêm forward(2) ở cuối hàm.'
      ],
      san: [
        '###',
        '#F#',
        '#u#',
        '#.#',
        '#o#',
        '#u#',
        '#.#',
        '#o#',
        '#.#',
        '###'
      ],
      batDau: { x: 1, y: 8, huong: 0 },
      maMau: bai(['fill_far()', 'fill_far()', 'move()'], { hamCuaEmMoi: [H('fill_far', [], ['aim(1)', 'run_lob()'])] }),
      loiGiai: bai(['fill_far()', 'fill_far()', 'move()'], { hamCuaEmMoi: [H('fill_far', [], T_FILL_FAR)] }),
      sao: { o: 18, nhip: 9 },
      loiSai: [
        { moTa: 'fill_far() thiếu forward(2): xe chưa tới viên đá kế, xúc hụt', baiLam: bai(['fill_far()', 'fill_far()', 'move()']), hamCuaEmMoi: [H('fill_far', [], ['aim(1)', 'run_lob()'])], phaiCoMa: ['nap-hut', 'chua-toi-co'] },
        { moTa: 'fill_far() quên aim(1): chạy đà với tầm 2, đá bay quá hố; xe tiến lên thì rơi hố', baiLam: bai(['fill_far()', 'fill_far()', 'move()']), hamCuaEmMoi: [H('fill_far', [], ['run_lob()', 'forward(2)'])], phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'fill_far() bắc cầu qua hố cách 3 ô: chạy đà lấp hố rồi đi tiếp luôn.'
    }),

    /* ---- Màn 17 (che-chinh-luc.7): Chế hàm lob_step(r) ---- */
    manCL({
      id: 6617, chuong: 'che-chinh-luc', so: 7, ma: 'che-chinh-luc.7',
      ten: 'Chế hàm trượt và hất theo cặp', hang: 'bien-the',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['lob_step'],
      chinhCoDinh: true,
      hamCuaEmCan: ['slide_r', 'lob', 'back', 'run_throw', 'run_lob', 'aim_lob'],
      deBai: 'Mỗi hàng `r` của bảng `plan` có hai số: `r[0]` là số ô trượt phải, `r[1]` là tầm hất. Hãy viết hàm `lob_step(r)`: trượt phải `r[0]` ô, rồi xúc và hất viên đá tới ô cách `r[1]` ô.',
      veMaMau: 'Chương trình chính đã duyệt bảng plan và gọi lob_step(r). Hãy hoàn thiện thân hàm lob_step(r).',
      goiY: [
        'Dòng đầu: slide_r(r[0]).',
        'Dòng hai: aim_lob(r[1]). Tầm 3 thì aim_lob tự chạy đà.'
      ],
      san: [
        '#######',
        '##D##D#',
        '##=#D=#',
        '##o#oo#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(
        ['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)'],
        { hamCuaEmMoi: [H('lob_step', ['r'], ['slide_r(r[0])'])] }
      ),
      loiGiai: bai(
        ['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)'],
        { hamCuaEmMoi: [H('lob_step', ['r'], T_LOB_STEP)] }
      ),
      sao: { o: 29, nhip: 11 },
      loiSai: [
        { moTa: 'lob_step(r) chỉ trượt, quên gọi aim_lob(r[1])', baiLam: bai(['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)']), hamCuaEmMoi: [H('lob_step', ['r'], ['slide_r(r[0])'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'lob_step(r) hất trước rồi mới trượt: xúc hụt ngay từ đầu', baiLam: bai(['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)']), hamCuaEmMoi: [H('lob_step', ['r'], ['aim_lob(r[1])', 'slide_r(r[0])'])], phaiCoMa: ['nap-hut', 'nem-vo'] }
      ],
      loiBinh: 'lob_step(r) nhận một cặp số: trượt mấy ô, hất tầm nào.'
    }),

    /* ---- Màn 18 (che-chinh-luc.8): Chế hàm auto_aim() (2 sân) ---- */
    manCL({
      id: 6618, chuong: 'che-chinh-luc', so: 8, ma: 'che-chinh-luc.8',
      ten: 'Chế hàm tự chọn tầm lấp hố', hang: 'bien-the',
      canHam: 'tran-khung',
      taoHam: ['auto_aim'],
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'lob', 'back', 'run_throw', 'run_lob', 'aim_lob'],
      deBai: 'Mỗi chặng dài 3 ô. Bên phải R1 có cọc đá `"#"` thì hố cách 3 ô, không có cọc thì hố cách 2 ô. Hãy viết hàm `auto_aim()`: quét `g = radar()`, đọc ô bên phải `g[1][2]`, chọn tầm cho `aim_lob`, rồi tiến 3 ô.',
      veMaMau: 'Chương trình chính đã lặp 2 lần auto_aim() rồi bước vào cờ. Thân hàm có sẵn luôn hất 2 ô. Hãy vào Xưởng hàm sửa.',
      goiY: [
        'Viết t = g[1][2], rồi if t == "#": aim_lob(3), else: aim_lob(2).',
        'forward(3) đứng ngoài khối if / else.'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.u.#',
          '#.o.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 8, huong: 0 },
        { x: 2, y: 8, huong: 0 }
      ],
      maMau: bai(
        ['for i in range(2):', '    auto_aim()', 'move()'],
        { hamCuaEmMoi: [H('auto_aim', [], ['g = radar()', 'aim_lob(2)', 'forward(3)'])] }
      ),
      loiGiai: bai(
        ['for i in range(2):', '    auto_aim()', 'move()'],
        { hamCuaEmMoi: [H('auto_aim', [], T_AUTO_AIM)] }
      ),
      sao: { o: 36, nhip: 12 },
      loiSai: [
        { moTa: 'auto_aim() luôn gọi aim_lob(2): gặp hố xa thì đá rơi ngắn, chắn đường xe', baiLam: bai(['for i in range(2):', '    auto_aim()', 'move()']), hamCuaEmMoi: [H('auto_aim', [], ['g = radar()', 'aim_lob(2)', 'forward(3)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'auto_aim() quên forward(3) ở cuối: xe chưa tới cờ', baiLam: bai(['for i in range(2):', '    auto_aim()', 'move()']), hamCuaEmMoi: [H('auto_aim', [], ['g = radar()', 't = g[1][2]', 'if t == "#":', '    aim_lob(3)', 'else:', '    aim_lob(2)'])], phaiCoMa: ['nap-hut', 'chua-toi-co'] }
      ],
      loiBinh: 'auto_aim() nhìn cọc mốc bên phải rồi tự chọn: hất 2 ô, hay chạy đà cho đủ 3 ô.'
    }),

    /* ---- Màn 19 (che-chinh-luc.9): Chế hàm diag_aim(n) ---- */
    manCL({
      id: 6619, chuong: 'che-chinh-luc', so: 9, ma: 'che-chinh-luc.9',
      ten: 'Chế hàm lách chéo hất theo tầm', hang: 'bien-the',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['diag_aim'],
      chinhCoDinh: true,
      hamCuaEmCan: ['lob', 'back', 'dir_fr', 'run_throw', 'run_lob', 'aim_lob'],
      deBai: 'Ba viên đá nằm trên bậc thang chéo sang phải. Máng `D` của mỗi viên cách xa khác nhau. Hãy viết hàm `diag_aim(n)`: lách chéo lên phải tới dưới viên đá, rồi xúc và hất tới ô cách `n` ô.',
      veMaMau: 'Chương trình chính đã gọi diag_aim(3), diag_aim(2), diag_aim(3). Hãy viết thân hàm diag_aim(n).',
      goiY: [
        'Dòng đầu: dir_fr().',
        'Dòng hai: aim_lob(n).'
      ],
      san: [
        '#######',
        '#...D.#',
        '#...=.#',
        '#.DDo.#',
        '#.=o..#',
        '#.o...#',
        '#.....#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(
        ['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)'],
        { hamCuaEmMoi: [H('diag_aim', ['n'], ['dir_fr()'])] }
      ),
      loiGiai: bai(
        ['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)'],
        { hamCuaEmMoi: [H('diag_aim', ['n'], T_DIAG_AIM)] }
      ),
      sao: { o: 30, nhip: 10 },
      loiSai: [
        { moTa: 'diag_aim(n) chỉ lách chéo, chưa gọi aim_lob(n)', baiLam: bai(['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)']), hamCuaEmMoi: [H('diag_aim', ['n'], ['dir_fr()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'diag_aim(n) hất trước rồi mới lách chéo: xúc hụt', baiLam: bai(['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)']), hamCuaEmMoi: [H('diag_aim', ['n'], ['aim_lob(n)', 'dir_fr()'])], phaiCoMa: ['nap-hut', 'nem-vo'] }
      ],
      loiBinh: 'diag_aim(n) gộp một bước chéo với một cú hất có tầm n.'
    }),

    /* ---- Màn 20 (che-chinh-luc.10): Trùm chương 2 (2 sân) ---- */
    manCL({
      id: 6620, chuong: 'che-chinh-luc', so: 10, ma: 'che-chinh-luc.10',
      ten: 'Trùm chế lệnh chạy đà', hang: 'trum',
      huyHieu: { ma: 'che-chinh-luc', ten: 'Bậc Thầy Chỉnh Lực' },
      hamCuaEmCan: ['move', 'forward', 'lob', 'back', 'dir_fr', 'run_throw', 'run_lob', 'aim_lob', 'fill_far', 'auto_aim'],
      deBai: 'Nhánh trái có một hố xa 3 ô. Vượt hố xong, R1 lách chéo sang trục chính. Ở đó có thêm một chặng: có sân hố cách 3 ô, có sân hố cách 2 ô, cọc đá bên phải báo cho R1 biết. Hãy dùng các hàm em đã chế để tới cờ.',
      veMaMau: 'Chương trình có sẵn đã vượt hố ở nhánh trái và lách sang trục chính. Hãy vượt chặng cuối rồi vào cờ.',
      goiY: [
        'Chặng cuối cần hàm tự đọc cọc và chọn tầm: auto_aim().',
        'Rồi move() vào cờ.'
      ],
      san: [
        [
          '#####',
          '##F##',
          '##u##',
          '##.##',
          '##o##',
          '#..##',
          '#u###',
          '#.###',
          '#o###',
          '#.###',
          '#####'
        ],
        [
          '#####',
          '##F##',
          '##.##',
          '##u##',
          '##o##',
          '#...#',
          '#u###',
          '#.###',
          '#o###',
          '#.###',
          '#####'
        ]
      ],
      batDau: [
        { x: 1, y: 9, huong: 0 },
        { x: 1, y: 9, huong: 0 }
      ],
      maMau: bai(['fill_far()', 'dir_fr()']),
      loiGiai: bai(['fill_far()', 'dir_fr()', 'auto_aim()', 'move()']),
      sao: { o: 44, nhip: 12 },
      loiSai: [
        { moTa: 'Mới lách sang trục chính, chưa vượt chặng cuối', baiLam: bai(['fill_far()', 'dir_fr()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng fill_far() ở chặng cuối thay cho auto_aim(): ở sân 2 đá bay quá hố gần, xe rơi hố', baiLam: bai(['fill_far()', 'dir_fr()', 'fill_far()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Hố gần thì đứng yên hất. Hố xa thì chạy đà. Em đã có đủ hàm cho cả hai.'
    })
  ];

  ManHoc.manChinhLuc = DS;
  if (laNode) module.exports = DS;
})();
