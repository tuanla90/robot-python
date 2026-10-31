/* ============================================================================
   man-dao-cuc.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 6 "Đảo cực" (KE-HOACH-MUA-3.md;
   PDM3b1 31/10 viết lại trên ROBOT PHÂN LOẠI: nhện + nam châm bụng + cảm biến từ, luật part đúng mùa KE-HOACH-PART-DUNG-MUA.md).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) xếp màn theo `so` (1 … 10):
     - `dao-cuc`: chương 1 "Đảo cực": lệnh mới magnet_s() trên nam châm bụng nhện; vật nam châm N (đỏ) cần cực S mới hút (cùng cực N thì 'cung-cuc' nằm yên),
       vật nam châm S (xanh dương) cần cực N; kết hợp đệm từ cực S / N (gói 4), nhảy hố / bò gầm (gói 5), cảm biến từ front_metal() (gói 3).
     - `che-dao-cuc`: chương 2 "Hàm đảo cực": hàm của em pull_n(), pull_s(), haul_n(k); kết hợp detour(n), jump(d), front_metal().
   Máy kiểm: hoc/kiem-man-mua-3.mjs, hoc/kiem-lo-trinh.mjs mục mùa 3, hoc/kiem-part-mua.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HG = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal'];
  var HUT_N = ['magnet_s()', 'wait()'];       // hút mẩu chữ N (đỏ) bằng cực S
  var HUT_S = ['magnet_n()', 'wait()'];       // hút mẩu chữ S (xanh dương) bằng cực N
  var THA = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function thut(ds, n) { var p = new Array((n || 1) * 4 + 1).join(' '); return ds.map(function (s) { return p + s; }); }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }

  function man(m) {
    m.chuong = m.chuong || 'dao-cuc';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HG;
    m.mucTieu = m.mucTieu || 'dua-vat';
    if (m.mucTieu === 'dua-vat') m.vatCan = m.vatCan || 'nam-cham';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 14, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }
  var P = function (x, y) { return { x: x, y: y, huong: 1 }; };
  var KEO = ['dem-keo', 'chua-toi-co'], KEO_VAT = ['dem-keo', 'chua-dua-vat'];

  var T_PULL_N = ['magnet_s()', 'wait()'];
  var T_PULL_S = ['magnet_n()', 'wait()'];
  var T_HAUL_N = ['pull_n()', 'for i in range(k):', '    go_right()', 'magnet_off()', 'wait()'];
  var T_HAUL_S = ['pull_s()', 'for i in range(k):', '    go_right()', 'magnet_off()', 'wait()'];
  function hPullN(than) { return H('pull_n', [], than || T_PULL_N); }
  function hPullS(than) { return H('pull_s', [], than || T_PULL_S); }
  function hHaulN(than) { return H('haul_n', ['k'], than || T_HAUL_N); }

  var DS = [
    /* ================================================= chương dao-cuc "Đảo cực" ================================================= */
    man({
      so: 1, ten: 'Bật cực S hút chữ N', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Nam châm bụng nhện giờ mở thêm cực S: magnet_s(). Mẩu nam châm chữ N (màu đỏ) cùng cực với N nên magnet_n() không hút được; phải bật cực S (khác cực) mới hút nó lên dưới bụng. Bấm Chạy xem nhện hút mẩu N mang tới thùng đỏ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: magnet_s() rồi wait() hút mẩu N lên bụng, đi hai ô sang thùng đỏ rồi thả.',
      san: ['o.D', '###'], vatChat: ['N..', '...'], mau: ['..r', '...'],
      batDau: P(0, 0),
      maMau: bai(nhieu(HUT_N, ['go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(HUT_N, ['go_right()', 'go_right()'], THA)),
      sao: { o: 6, nhip: 6 },
      goiY: ['Hai cực khác nhau mới hút nhau: mẩu chữ N cần cực S.', 'Màn sau bạn tự đổi cực nam châm bụng.']
    }),

    man({
      so: 2, ten: 'Khác cực mới hút', hang: 'lam-quen',
      deBai: 'Mẩu nam châm chữ N nằm ở ô bên phải. Chương trình có sẵn bật magnet_n() nên cùng cực với mẩu N, mẩu nằm yên dưới đất. Đổi sang magnet_s() để hút mẩu N mang về thùng đỏ cuối hàng.',
      veMaMau: 'Chạy thử: bật cực N trên mẩu N thì mẩu không nhúc nhích. Đổi dòng magnet_n() thành magnet_s().',
      san: ['.o..D', '#####'], vatChat: ['.N...', '.....'], mau: ['....r', '.....'],
      batDau: P(0, 0),
      maMau: bai(nhieu(['go_right()'], HUT_S, LAP(3, 'go_right()'), THA)),
      loiGiai: bai(nhieu(['go_right()'], HUT_N, LAP(3, 'go_right()'), THA)),
      sao: { o: 7, nhip: 10 },
      loiSai: [
        { moTa: 'Để nguyên magnet_n(): cùng cực với mẩu N nên không hút được', baiLam: bai(nhieu(['go_right()'], HUT_S, LAP(3, 'go_right()'), THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Đi chưa tới thùng đã thả: mẩu N nằm lệch trước thùng đỏ', baiLam: bai(nhieu(['go_right()'], HUT_N, LAP(2, 'go_right()'), THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chở tới thùng nhưng quên magnet_off(): mẩu N còn dính dưới bụng', baiLam: bai(nhieu(['go_right()'], HUT_N, LAP(3, 'go_right()'))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mẩu chữ N cần nam châm bụng bật cực S: magnet_s() rồi wait().', 'Tới đứng trên thùng đỏ ở cuối hàng rồi magnet_off() và wait().']
    }),

    man({
      so: 3, ten: 'Mẩu S và mẩu N', hang: 'lam-quen', hamCuaEmCan: ['go', 'walk', 'bring'],
      deBai: 'Hàng trên có mẩu chữ S (xanh dương, cần cực N nên hàm bring("R") của bạn dùng được ngay). Xuống hàng dưới là mẩu chữ N (đỏ): phải bật magnet_s() để hút, sang phải một ô tới thùng đỏ rồi thả.',
      veMaMau: 'Chương trình có sẵn dùng bring("R") cho cả hai hàng, nhưng ở hàng dưới mẩu chữ N cùng cực với magnet_n() trong bring(). Sửa phần hàng dưới.',
      san: ['oD..', '#oD.'], vatChat: ['S...', '.N..'], mau: ['.b..', '..r.'],
      batDau: P(0, 0),
      maMau: bai(['bring("R")', 'go_down()', 'bring("R")']),
      loiGiai: bai(nhieu(['bring("R")', 'go_down()'], HUT_N, ['go_right()'], THA)),
      sao: { o: 22, nhip: 10 },
      loiSai: [
        { moTa: 'Dùng bring("R") cho cả mẩu N: bring() bật cực N nên không hút được mẩu N', baiLam: bai(['bring("R")', 'go_down()', 'bring("R")']), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Hàng trên cũng bật magnet_s(): cùng cực với mẩu S nên mẩu S nằm lại', baiLam: bai(nhieu(HUT_N, ['go_right()'], THA, ['go_down()'], HUT_N, ['go_right()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['bring("R") bật magnet_n() nên hút được mẩu S ở hàng trên.', 'Xuống đứng trên mẩu N ở (1, 1) thì gọi magnet_s(), wait(), go_right(), magnet_off(), wait().']
    }),

    man({
      so: 4, ten: 'Khiên cực S qua đệm S', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Ở gói Bãi từ, nhện chỉ có cực N nên đi ngang cột đệm S là bị kéo lên. Giờ có magnet_s(): bật cực S thì cùng cực với đệm S, đệm đẩy nhện xuống sát tường dưới nên nhện đi thẳng tới cờ.',
      veMaMau: 'Chạy thử: chưa bật cực S nên cột đệm S kéo nhện lên hàng giữa, lệch cờ. Thêm magnet_s() trước vòng lặp.',
      san: ['##.##', '.....', '....F'], demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(LAP(4, 'go_right()')),
      loiGiai: bai(nhieu(['magnet_s()'], LAP(4, 'go_right()'))),
      sao: { o: 3, nhip: 8 },
      loiSai: [
        { moTa: 'Không bật nam châm: đệm S hút nhện lên hàng giữa', baiLam: bai(LAP(4, 'go_right()')), phaiCoMa: KEO },
        { moTa: 'Bật magnet_n(): khác cực với đệm S nên vẫn bị đệm S hút lên', baiLam: bai(nhieu(['magnet_n()'], LAP(4, 'go_right()'))), phaiCoMa: KEO }
      ],
      goiY: ['Cực S cùng cực với đệm S nên đệm đẩy nhện ra xa (vào tường dưới).', 'magnet_s() tự chạy ở nhịp đầu của bước go_right() kế tiếp, không cần wait() riêng.']
    }),

    man({
      so: 5, ten: 'Đệm S đẩy nhện chở hàng', hang: 'luyen',
      deBai: 'Nhện đứng trên mẩu chữ N ở hàng giữa, thùng đỏ ở hàng dưới cuối hành lang. Bật magnet_s() rồi wait() để hút mẩu N; khi đi ngang cột đệm S ở hàng trên, chính cực S đang giữ mẩu N sẽ bị đệm S đẩy xuống hàng dưới đúng đường tới thùng đỏ.',
      veMaMau: 'Chương trình mới hút mẩu N. Thêm vòng lặp đi 4 ô sang phải rồi thả vật.',
      san: ['##.##', 'o..##', '##..D'], vatChat: ['.....', 'N....', '.....'], mau: ['.....', '.....', '....r'],
      demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: P(0, 1),
      maMau: bai(HUT_N),
      loiGiai: bai(nhieu(HUT_N, LAP(4, 'go_right()'), THA)),
      sao: { o: 6, nhip: 10 },
      loiSai: [
        { moTa: 'Bật magnet_n(): không hút được mẩu N và bị đệm S giữ ở hàng giữa, đâm tường', baiLam: bai(nhieu(HUT_S, LAP(4, 'go_right()'), THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Đi 3 ô rồi thả: chưa tới thùng đỏ cuối hàng', baiLam: bai(nhieu(HUT_N, LAP(3, 'go_right()'), THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đang giữ mẩu N bằng cực S thì khi bước vào cột 2, đệm S đẩy nhện xuống hàng dưới.', 'Đi đủ 4 lần go_right() là đứng trên thùng đỏ, rồi magnet_off() và wait().']
    }),

    man({
      so: 6, ten: 'Đổi cực giữa hai đệm', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Hành lang có hai đệm ở hàng trên: cột 2 là đệm S, cột 4 là đệm N. Dưới chân nhện là tường. Đầu đường bật magnet_s() để qua đệm S; tới giữa hai đệm (sau 3 bước) đổi sang magnet_n() để qua đệm N tới cờ.',
      veMaMau: 'Chương trình có sẵn giữ nguyên magnet_s() suốt đường nên tới cột đệm N (khác cực) bị kéo lên. Đổi cực ở giữa đường.',
      san: ['##.#.##', '#..#.##', '......F'], demTu: [{ x: 2, y: 0, cuc: 'S' }, { x: 4, y: 0, cuc: 'N' }],
      batDau: P(0, 2),
      maMau: bai(nhieu(['magnet_s()'], LAP(6, 'go_right()'))),
      loiGiai: bai(nhieu(['magnet_s()'], LAP(3, 'go_right()'), ['magnet_n()'], LAP(3, 'go_right()'))),
      sao: { o: 6, nhip: 12 },
      loiSai: [
        { moTa: 'Giữ magnet_s() suốt đường: qua cột đệm N bị hút lên hàng giữa', baiLam: bai(nhieu(['magnet_s()'], LAP(6, 'go_right()'))), phaiCoMa: KEO },
        { moTa: 'Bật magnet_n() ngay từ đầu: qua cột đệm S bị hút lên hàng giữa', baiLam: bai(nhieu(['magnet_n()'], LAP(6, 'go_right()'))), phaiCoMa: KEO },
        { moTa: 'Đổi sang magnet_n() quá sớm (sau 1 bước): chưa qua cột đệm S đã đổi cực', baiLam: bai(nhieu(['magnet_s()', 'go_right()', 'magnet_n()'], LAP(5, 'go_right()'))), phaiCoMa: KEO }
      ],
      goiY: ['Ba bước đầu đi qua cột đệm S: bật magnet_s().', 'Sau 3 bước nhện ở cột 3 (giữa hai đệm): bật magnet_n() rồi đi 3 bước nữa.']
    }),

    man({
      so: 7, ten: 'Nhảy qua hố chở chữ N', hang: 'bien-the', hamCuaEmCan: ['go', 'jump', 'crawl'],
      deBai: 'Mẩu chữ N vẫn dính chắc dưới bụng khi nhện nhảy qua hố hay bò qua gầm thấp. Hút mẩu N bằng cực S, tiến một ô, dùng jump("R") nhảy qua hố, crawl("R") bò qua gầm thấp, tiến một ô tới thùng đỏ rồi thả.',
      veMaMau: 'Chương trình mới hút mẩu N và tiến tới mép hố. Dùng jump("R") và crawl("R") để vượt chướng ngại.',
      san: ['o.u.n.D', '#.#.#.#'], vatChat: ['N......', '.......'], mau: ['......r', '.......'],
      batDau: P(0, 0),
      maMau: bai(nhieu(HUT_N, ['go_right()'])),
      loiGiai: bai(nhieu(HUT_N, ['go_right()', 'jump("R")', 'crawl("R")', 'go_right()'], THA)),
      sao: { o: 25, nhip: 14 },
      loiSai: [
        { moTa: 'Đi bộ qua hố thay vì jump("R"): rơi xuống hố', baiLam: bai(nhieu(HUT_N, LAP(6, 'go_right()'), THA)), phaiCoMa: ['roi-ho'] },
        { moTa: 'Bật magnet_n() thay vì magnet_s(): không hút được mẩu N', baiLam: bai(nhieu(HUT_S, ['go_right()', 'jump("R")', 'crawl("R")', 'go_right()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Mẩu N cần magnet_s() rồi wait().', 'Sau go_right() là sát hố: gọi jump("R"), rồi crawl("R"), rồi go_right() tới thùng đỏ và thả.']
    }),

    man({
      so: 8, ten: 'Bỏ qua sắt, lấy chữ N', hang: 'bien-the',
      deBai: 'Ba hàng bên phải có hai mẩu sắt vụn và một mẩu nam châm chữ N ở hàng dưới. Thùng đích màu đỏ chỉ nhận mẩu chữ N (đỏ). Đầu dò front_metal() trả về True khi thấy sắt vụn và False khi thấy vật nam châm: đi xuống chừng nào front_metal() còn True, rồi sang hút mẩu N đưa vào thùng đỏ.',
      veMaMau: 'Chương trình có sẵn dùng while not front_metal() nên dừng ngay ở hàng sắt đầu tiên, thả sắt vào thùng đỏ bị báo sai màu.',
      san: ['.o.#', '.o.#', '.o.D'], vatChat: ['.s..', '.s..', '.N..'], mau: ['....', '....', '...r'],
      batDau: P(0, 0),
      maMau: bai(nhieu(['while not front_metal():', '    go_down()', 'go_right()'], HUT_N, ['go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['while front_metal():', '    go_down()', 'go_right()'], HUT_N, ['go_right()', 'go_right()'], THA)),
      sao: { o: 9, nhip: 12 },
      loiSai: [
        { moTa: 'while not front_metal(): dừng ngay ở hàng 0 có sắt, mang sắt thả vào thùng đỏ', baiLam: bai(nhieu(['while not front_metal():', '    go_down()', 'go_right()'], HUT_N, ['go_right()', 'go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tìm đúng hàng mẩu N nhưng bật magnet_n(): cùng cực nên không hút được', baiLam: bai(nhieu(['while front_metal():', '    go_down()', 'go_right()'], HUT_S, ['go_right()', 'go_right()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Cảm biến từ front_metal() chỉ báo True với sắt vụn; gặp vật nam châm N hay S nó trả về False.', 'Đổi điều kiện vòng while thành while front_metal(): để bỏ qua hai hàng sắt.']
    }),

    man({
      so: 9, ten: 'Sửa cực ở hai trạm', hang: 'bien-the', hamCuaEmCan: ['go', 'walk', 'jump'],
      deBai: 'Sola viết chương trình giao hai mẩu qua hố và cột đệm N nhưng gắn nhầm cực ở cả hai trạm: trạm một là mẩu N (đỏ), trạm hai sau hố là mẩu S (xanh dương, đi qua dưới cột đệm N có tường chắn dưới chân). Sửa lại hai lệnh bật cực.',
      veMaMau: 'Chạy thử: trạm một bật magnet_n() nên không nhặt được mẩu N. Đổi cực ở cả hai trạm cho khớp.',
      san: ['#####.#', '.oDuo.D', '#######'], vatChat: ['.......', '.N..S..', '.......'], mau: ['.......', '..r...b', '.......'],
      demTu: [{ x: 5, y: 0, cuc: 'N' }],
      batDau: P(0, 1),
      maMau: bai(nhieu(['go_right()'], HUT_S, ['go_right()'], THA, ['jump("R")'], HUT_N, ['walk("RR")'], THA)),
      loiGiai: bai(nhieu(['go_right()'], HUT_N, ['go_right()'], THA, ['jump("R")'], HUT_S, ['walk("RR")'], THA)),
      sao: { o: 26, nhip: 15 },
      loiSai: [
        { moTa: 'Không sửa gì: cả hai trạm đều bật cùng cực với vật', baiLam: bai(nhieu(['go_right()'], HUT_S, ['go_right()'], THA, ['jump("R")'], HUT_N, ['walk("RR")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Chỉ sửa trạm một, trạm hai vẫn magnet_s(): không hút được mẩu S và bị đệm N kéo lên', baiLam: bai(nhieu(['go_right()'], HUT_N, ['go_right()'], THA, ['jump("R")'], HUT_N, ['walk("RR")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Trạm một là mẩu N (đỏ): dùng magnet_s().', 'Sau jump("R") nhện đáp lên mẩu S (xanh dương): dùng magnet_n() vừa hút mẩu S vừa làm khiên đẩy lại đệm N ở (5, 0).']
    }),

    man({
      so: 10, ten: 'Bãi tái chế hai cực', hang: 'trum', khung: { chinh: 18, moiHam: 10 }, hamCuaEmCan: ['go', 'walk', 'jump'],
      deBai: 'Trùm. Hàng dưới có mẩu N (đỏ): bật magnet_s() hút lên, walk("RR") qua trên cột đệm S (cực S đẩy nhện vào tường giữa), jump("R") qua hố tới thùng đỏ, thả. Rồi walk("UU") lên mẩu S (xanh dương) ở hàng trên: bật magnet_n() hút lên, walk("LLL") qua dưới cột đệm N tới thùng xanh dương, thả.',
      veMaMau: 'Chương trình có sẵn mới chở xong mẩu N ở hàng dưới. Viết tiếp phần lên hàng trên chở mẩu S về thùng xanh.',
      san: ['##.####', '#D..o.#', '####.##', 'o..uD.#', '#.#####'],
      vatChat: ['.......', '....S..', '.......', 'N......', '.......'],
      mau: ['.......', '.b.....', '.......', '....r..', '.......'],
      demTu: [{ x: 2, y: 0, cuc: 'N' }, { x: 1, y: 4, cuc: 'S' }],
      batDau: P(0, 3),
      maMau: bai(nhieu(HUT_N, ['walk("RR")', 'jump("R")'], THA)),
      loiGiai: bai(nhieu(HUT_N, ['walk("RR")', 'jump("R")'], THA, ['walk("UU")'], HUT_S, ['walk("LLL")'], THA)),
      sao: { o: 26, nhip: 21 },
      loiSai: [
        { moTa: 'Mẩu S ở hàng trên cũng bật magnet_s(): cùng cực không hút được và bị đệm N kéo lên', baiLam: bai(nhieu(HUT_N, ['walk("RR")', 'jump("R")'], THA, ['walk("UU")'], HUT_N, ['walk("LLL")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Quên thả mẩu N trước khi lên lấy mẩu S', baiLam: bai(nhieu(HUT_N, ['walk("RR")', 'jump("R")', 'walk("UU")'], HUT_S, ['walk("LLL")'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hàng dưới: mẩu N cần magnet_s(), giữ nguyên cực đó khi walk("RR") để đệm S ở (1, 4) đẩy nhện vào tường giữa.', 'Thả mẩu N xong: walk("UU"), magnet_n(), wait(), walk("LLL"), magnet_off(), wait().']
    })
  ];

  /* ================================================= chương che-dao-cuc "Hàm đảo cực" =================================================
     Hàm của em mới: pull_n() (magnet_s(), wait()), pull_s() (magnet_n(), wait()), haul_n(k) (pull_n(), đi k ô sang phải, thả). */
  function che(m) { m.chuong = 'che-dao-cuc'; return man(m); }

  DS.push(
    che({
      so: 1, ten: 'Hàm hút chữ N', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['reel_n'],
      deBai: 'Hàm reel_n() của màn gói hai lệnh magnet_s() và wait() để nhấc mẩu chữ N lên dưới bụng nhện. Chương trình gọi reel_n(), đi hai ô sang phải rồi thả vào thùng đỏ. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm reel_n() đã viết sẵn, khoá. Mở Xưởng xem reel_n, rồi bấm Chạy.',
      san: ['o.D', '###'], vatChat: ['N..', '...'], mau: ['..r', '...'],
      batDau: P(0, 0),
      maMau: bai(nhieu(['reel_n()', 'go_right()', 'go_right()'], THA), { hamCuaMan: [H('reel_n', [], T_PULL_N)] }),
      loiGiai: bai(nhieu(['reel_n()', 'go_right()', 'go_right()'], THA), { hamCuaMan: [H('reel_n', [], T_PULL_N)] }),
      sao: { o: 7, nhip: 6 },
      goiY: ['Gói magnet_s() và wait() vào một hàm giúp khỏi quên wait() mỗi lần hút mẩu N.', 'Màn sau bạn tự tạo hàm pull_n().']
    }),

    che({
      so: 2, ten: 'Tạo hàm pull_n()', hang: 'lam-quen', taoHam: ['pull_n'],
      deBai: 'Tạo hàm pull_n() không tham số: bật magnet_s() rồi wait() để hút mẩu nam châm chữ N dưới bụng. Chương trình đã gọi pull_n(), đi hai ô sang thùng đỏ rồi thả.',
      veMaMau: 'Chương trình gọi pull_n() nhưng bạn chưa có hàm đó. Bấm Hàm mới để tạo pull_n().',
      san: ['o.D.', '..##'], vatChat: ['N...', '....'], mau: ['..r.', '....'],
      batDau: P(0, 0),
      maMau: bai(nhieu(['pull_n()', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['pull_n()', 'go_right()', 'go_right()'], THA), { hamCuaEmMoi: [hPullN()] }),
      sao: { o: 7, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pull_n mà đã bấm Chạy', baiLam: bai(nhieu(['pull_n()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pull_n() viết magnet_n() thay vì magnet_s(): cùng cực nên không hút được mẩu N', baiLam: bai(nhieu(['pull_n()', 'go_right()', 'go_right()'], THA)), hamCuaEmMoi: [hPullN(T_PULL_S)], phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Trong pull_n() quên bật magnet_s(): nhện đi tay không', baiLam: bai(nhieu(['pull_n()', 'go_right()', 'go_right()'], THA)), hamCuaEmMoi: [hPullN(['wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm pull_n() gồm hai dòng: magnet_s() rồi wait().', 'Tạo xong trong Xưởng thì bấm Về sân rồi Chạy.']
    }),

    che({
      so: 3, ten: 'Tạo hàm pull_s()', hang: 'lam-quen', taoHam: ['pull_s'],
      deBai: 'Tạo tiếp hàm pull_s() để hút mẩu nam châm chữ S (xanh dương): thân hàm bật magnet_n() rồi wait(). Chương trình gọi pull_s(), đi hai ô sang thùng xanh dương rồi thả.',
      veMaMau: 'Chương trình gọi pull_s() nhưng bạn chưa có hàm đó. Bấm Hàm mới để tạo pull_s().',
      san: ['o.D.', '...#'], vatChat: ['S...', '....'], mau: ['..b.', '....'],
      batDau: P(0, 0),
      maMau: bai(nhieu(['pull_s()', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'go_right()', 'go_right()'], THA), { hamCuaEmMoi: [hPullS()] }),
      sao: { o: 7, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pull_s mà đã bấm Chạy', baiLam: bai(nhieu(['pull_s()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pull_s() viết magnet_s(): cùng cực với mẩu S nên không hút được', baiLam: bai(nhieu(['pull_s()', 'go_right()', 'go_right()'], THA)), hamCuaEmMoi: [hPullS(T_PULL_N)], phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Mẩu chữ S cần cực N: thân hàm pull_s() là magnet_n() rồi wait().', 'Hai hàm pull_n() và pull_s() đặt tên theo chữ trên mẩu vật bạn muốn hút.']
    }),

    che({
      so: 4, ten: 'Gọi pull_n() và pull_s()', hang: 'luyen', hamCuaEmCan: ['pull_n', 'pull_s'],
      deBai: 'Hai hàng: hàng trên là mẩu N (đỏ) cách thùng đỏ 1 ô; thả xong xuống hàng dưới là đứng ngay trên mẩu S (xanh dương) cách thùng xanh dương 1 ô. Dùng pull_n() và pull_s() để giao cả hai mẩu.',
      veMaMau: 'Chương trình có sẵn mới giao mẩu N ở hàng trên. Viết tiếp phần xuống hàng dưới giao mẩu S.',
      san: ['oD...', '#oD..'], vatChat: ['N....', '.S...'], mau: ['.r...', '..b..'],
      batDau: P(0, 0),
      maMau: bai(nhieu(['pull_n()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['pull_n()', 'go_right()'], THA, ['go_down()', 'pull_s()', 'go_right()'], THA)),
      sao: { o: 13, nhip: 10 },
      loiSai: [
        { moTa: 'Hàng dưới gọi nhầm pull_n(): cùng cực với mẩu S nên không hút được', baiLam: bai(nhieu(['pull_n()', 'go_right()'], THA, ['go_down()', 'pull_n()', 'go_right()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Quên go_down() trước khi gọi pull_s()', baiLam: bai(nhieu(['pull_n()', 'go_right()'], THA, ['pull_s()', 'go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Tên hàm nhắc ngay vật cần hút: pull_n() hút chữ N, pull_s() hút chữ S.', 'Thả ở (1, 0) xong thì go_down() là đứng ngay trên mẩu S ở (1, 1).']
    }),

    che({
      so: 5, ten: 'Hàm chở chữ N: haul_n(k)', hang: 'luyen', taoHam: ['haul_n'], hamCuaEmCan: ['pull_n'],
      deBai: 'Tạo hàm haul_n(k) có tham số k: gọi pull_n() để hút mẩu N, lặp k lần go_right(), rồi magnet_off() và wait() để thả. Hai mẩu N trên cùng hàng: chuyến đầu haul_n(1), sang phải một ô, chuyến sau haul_n(3).',
      veMaMau: 'Chương trình đã gọi haul_n(1) và haul_n(3), nhưng bạn chưa tạo hàm haul_n(k). Bấm Hàm mới.',
      san: ['oDo..D...', '#####....'], vatChat: ['N.N......', '.........'], mau: ['.r...r...', '.........'],
      batDau: P(0, 0),
      maMau: bai(['haul_n(1)', 'go_right()', 'haul_n(3)']),
      loiGiai: bai(['haul_n(1)', 'go_right()', 'haul_n(3)'], { hamCuaEmMoi: [hHaulN()] }),
      sao: { o: 10, nhip: 14 },
      loiSai: [
        { moTa: 'Chưa tạo hàm haul_n mà đã bấm Chạy', baiLam: bai(['haul_n(1)', 'go_right()', 'haul_n(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong haul_n(k) đi cứng 1 ô thay vì range(k): chuyến hai thả giữa đường', baiLam: bai(['haul_n(1)', 'go_right()', 'haul_n(3)']), hamCuaEmMoi: [hHaulN(['pull_n()', 'go_right()', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong haul_n(k) quên magnet_off(): mẩu N đầu tiên không thả xuống thùng', baiLam: bai(['haul_n(1)', 'go_right()', 'haul_n(3)']), hamCuaEmMoi: [hHaulN(['pull_n()', 'for i in range(k):', '    go_right()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm haul_n(k): pull_n(), for i in range(k): go_right(), magnet_off(), wait().', 'Nhớ dùng pull_n() đã chế để hàm ngắn gọn.']
    }),

    che({
      so: 6, ten: 'Sửa hàm haul_s(k)', hang: 'luyen', hamCuaEmCan: ['pull_n', 'pull_s', 'haul_n'],
      deBai: 'Hàm haul_s(k) của màn chở mẩu S sang phải k ô rồi thả, nhưng Sola chép từ haul_n(k) nên đầu hàm vẫn gọi pull_n(). Sửa thân hàm haul_s(k) trong Xưởng để chương trình giao mẩu N ở hàng trên và mẩu S ở hàng dưới.',
      veMaMau: 'Chạy thử: ở hàng dưới haul_s(3) bật cực S nên mẩu S nằm yên. Mở Xưởng sửa dòng đầu của haul_s(k).',
      san: ['o.D....', '##o..D.'], vatChat: ['N......', '..S....'], mau: ['..r....', '.....b.'],
      batDau: P(0, 0),
      maMau: bai(['haul_n(2)', 'go_down()', 'haul_s(3)'], { hamCuaMan: [H('haul_s', ['k'], T_HAUL_N)] }),
      loiGiai: bai(['haul_n(2)', 'go_down()', 'haul_s(3)'], { hamCuaMan: [H('haul_s', ['k'], T_HAUL_S)] }),
      sao: { o: 17, nhip: 16 },
      loiSai: [
        { moTa: 'Không sửa haul_s(k): gọi pull_n() trên mẩu S nên cùng cực', baiLam: bai(['haul_n(2)', 'go_down()', 'haul_s(3)'], { hamCuaMan: [H('haul_s', ['k'], T_HAUL_N)] }), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Đổi nhầm số bước ở main thành haul_s(2): thả trước thùng xanh một ô', baiLam: bai(['haul_n(2)', 'go_down()', 'haul_s(2)'], { hamCuaMan: [H('haul_s', ['k'], T_HAUL_S)] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mẩu S cần pull_s() chứ không phải pull_n().', 'Chỉ cần đổi dòng đầu tiên trong thân hàm haul_s(k) thành pull_s().']
    }),

    che({
      so: 7, ten: 'Khiên chữ N, vòng chữ S', hang: 'bien-the', hamCuaEmCan: ['pull_n', 'pull_s', 'haul_n', 'detour'],
      deBai: 'Hai đệm ở hàng trên đều là đệm S. Mẩu đầu là chữ N: haul_n(3) bật cực S giữ mẩu N nên khi đi qua dưới đệm S thứ nhất (có tường chắn dưới chân), đệm S đẩy nhện vào tường, đi thẳng tới thùng đỏ. Sang phải một ô là mẩu chữ S: hút bằng pull_s() (bật cực N, bị đệm S hút) nên phải dùng detour(4) vòng dưới đệm S thứ hai tới thùng xanh.',
      veMaMau: 'Chương trình mới giao xong mẩu N đầu tiên. Viết tiếp phần sang phải, hút mẩu S và đi vòng detour(4).',
      san: ['#.####.##', '#.####.##', 'o..Do...D', '####.....'], vatChat: ['.........', '.........', 'N...S....', '.........'], mau: ['.........', '.........', '...r....b', '.........'],
      demTu: [{ x: 1, y: 0, cuc: 'S' }, { x: 6, y: 0, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(['haul_n(3)']),
      loiGiai: bai(nhieu(['haul_n(3)', 'go_right()', 'pull_s()', 'detour(4)'], THA)),
      sao: { o: 19, nhip: 24 },
      loiSai: [
        { moTa: 'Mẩu S đi thẳng không dùng detour(4): đang bật cực N nên bị đệm S thứ hai kéo lên', baiLam: bai(nhieu(['haul_n(3)', 'go_right()', 'pull_s()'], LAP(4, 'go_right()'), THA)), phaiCoMa: KEO_VAT },
        { moTa: 'Hút mẩu S bằng pull_n(): cùng cực nên mẩu S nằm lại', baiLam: bai(nhieu(['haul_n(3)', 'go_right()', 'pull_n()', 'detour(4)'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Trong haul_n(3), nhện bật cực S nên đi thẳng qua cột đệm S thứ nhất an toàn.', 'Với mẩu S, sau go_right() gọi pull_s(), detour(4), rồi magnet_off() và wait().']
    }),

    che({
      so: 8, ten: 'Dò hàng chữ N ở hai bãi', hang: 'bien-the', hamCuaEmCan: ['pull_n', 'haul_n'],
      deBai: 'Hai bãi có số hàng sắt vụn ở trên khác nhau, dưới các hàng sắt mới tới hàng có mẩu chữ N (đỏ) và thùng đỏ ở cuối hàng. Đi xuống chừng nào front_metal() còn True, rồi sang phải một ô vào mẩu N và gọi haul_n(3) chở tới thùng đỏ.',
      veMaMau: 'Đếm cứng số bước xuống chỉ đúng một bãi. Dùng vòng while front_metal(): để tìm hàng có mẩu N.',
      san: [['.o..#', '.o..D', '.o..#'], ['.o..#', '.o..#', '.o..D']],
      vatChat: [['.s...', '.N...', '.s...'], ['.s...', '.s...', '.N...']],
      mau: [['.....', '....r', '.....'], ['.....', '.....', '....r']],
      batDau: P(0, 0),
      maMau: bai(['go_down()', 'go_right()', 'haul_n(3)']),
      loiGiai: bai(['while front_metal():', '    go_down()', 'go_right()', 'haul_n(3)']),
      sao: { o: 11, nhip: 14 },
      loiSai: [
        { moTa: 'Đếm cứng 1 bước go_down(): bãi 2 hàng 1 là sắt vụn, cuối hàng là tường', baiLam: bai(['go_down()', 'go_right()', 'haul_n(3)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Đếm cứng 2 bước go_down(): bãi 1 hàng 2 là sắt vụn, cuối hàng là tường', baiLam: bai(['go_down()', 'go_down()', 'go_right()', 'haul_n(3)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Dùng while not front_metal(): dừng ngay ở hàng 0 có sắt', baiLam: bai(['while not front_metal():', '    go_down()', 'go_right()', 'haul_n(3)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Hàng nào có sắt vụn thì front_metal() là True; hàng có mẩu N thì front_metal() là False.', 'Dừng vòng while rồi thì go_right() và haul_n(3).']
    }),

    che({
      so: 9, ten: 'Nhảy hố giao hai cực', hang: 'bien-the', hamCuaEmCan: ['pull_n', 'pull_s', 'haul_n', 'go', 'jump'],
      deBai: 'Hàng trên có mẩu N cách thùng đỏ 3 ô phẳng: gọi haul_n(3). Thả xong xuống hàng dưới là đứng ngay trên mẩu S, trước mặt là cái hố chắn trước thùng xanh: gọi pull_s(), jump("R") nhảy qua hố đáp lên thùng rồi thả.',
      veMaMau: 'Chương trình có sẵn mới giao xong mẩu N ở hàng trên bằng haul_n(3). Viết tiếp phần xuống hàng dưới giao mẩu S qua hố.',
      san: ['o..D..', '###ouD', '######'], vatChat: ['N.....', '...S..', '......'], mau: ['...r..', '.....b', '......'],
      batDau: P(0, 0),
      maMau: bai(['haul_n(3)']),
      loiGiai: bai(nhieu(['haul_n(3)', 'go_down()', 'pull_s()', 'jump("R")'], THA)),
      sao: { o: 27, nhip: 15 },
      loiSai: [
        { moTa: 'Hàng dưới gọi nhầm pull_n(): cùng cực với mẩu S nên không hút được', baiLam: bai(nhieu(['haul_n(3)', 'go_down()', 'pull_n()', 'jump("R")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Đi bộ qua hố thay vì jump("R"): rơi xuống hố', baiLam: bai(nhieu(['haul_n(3)', 'go_down()', 'pull_s()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Thả mẩu N ở (3, 0) xong thì go_down() là đứng ngay trên mẩu S ở (3, 1), sát mép hố.', 'Gọi pull_s(), jump("R"), rồi magnet_off() và wait().']
    }),

    che({
      so: 10, ten: 'Trùm hàm đảo cực', hang: 'trum', khung: { chinh: 16, moiHam: 10 }, hamCuaEmCan: ['pull_n', 'pull_s', 'haul_n', 'detour', 'go', 'jump'],
      deBai: 'Trùm. Bỏ qua hàng sắt bằng while front_metal(): go_down(). Tới hàng có mẩu N: sang phải một ô, haul_n(2) chở qua dưới cột đệm S thứ nhất tới thùng đỏ. Rồi jump("R") nhảy qua hố đáp lên mẩu S: gọi pull_s(), detour(3) vòng dưới cột đệm S thứ hai tới thùng xanh dương, thả.',
      veMaMau: 'Chương trình có sẵn đã dò tới hàng mẩu N và chở vào thùng đỏ. Viết tiếp từ cú nhảy qua hố.',
      san: ['##.####.#', '.o......#', '.o.Duo..D', '#####....'],
      vatChat: ['.........', '.s.......', '.N...S...', '.........'],
      mau: ['.........', '.........', '...r....b', '.........'],
      demTu: [{ x: 2, y: 0, cuc: 'S' }, { x: 7, y: 0, cuc: 'S' }],
      batDau: P(0, 1),
      maMau: bai(['while front_metal():', '    go_down()', 'go_right()', 'haul_n(2)']),
      loiGiai: bai(nhieu(['while front_metal():', '    go_down()', 'go_right()', 'haul_n(2)', 'jump("R")', 'pull_s()', 'detour(3)'], THA)),
      sao: { o: 34, nhip: 25 },
      loiSai: [
        { moTa: 'Sau khi nhảy qua hố gọi pull_n() thay vì pull_s(): không hút được mẩu S', baiLam: bai(nhieu(['while front_metal():', '    go_down()', 'go_right()', 'haul_n(2)', 'jump("R")', 'pull_n()', 'detour(3)'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Mẩu S đi thẳng không dùng detour(3): bị đệm S ở (7, 0) kéo lên', baiLam: bai(nhieu(['while front_metal():', '    go_down()', 'go_right()', 'haul_n(2)', 'jump("R")', 'pull_s()'], LAP(3, 'go_right()'), THA)), phaiCoMa: KEO_VAT }
      ],
      goiY: ['Ở (3, 2) sau haul_n(2), ngay bên phải là hố (4, 2) và bên kia hố là mẩu S (5, 2): gọi jump("R").', 'Đáp lên mẩu S rồi thì gọi pull_s(), detour(3), magnet_off(), wait().']
    })
  );

  ManHoc.manDaoCuc = DS;
  if (laNode) module.exports = ManHoc;
})();
