/* ============================================================================
   man-bai-tu.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 4 "Bãi từ" (KE-HOACH-MUA-3.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `bai-tu`: chương 1 "Bãi từ": sắt, nam châm điện, hố, đệm từ (chưa có màn)
     - `che-bai-tu`: chương 2 "Hàm cho bãi từ" (chưa có màn)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manBaiTu, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // 30/10 phiên Mùa 3: 20 màn của gói 4. Cái mới của gói: ĐỆM TỪ (luật ở san-hoc.js phần ĐỆM TỪ): ô đệm cực N (đỏ) / S (xanh dương) kéo thân xe đứng cùng hàng / cột
  // trong 2 ô 1 ô mỗi nhịp (xe không bật nam châm, hay bật N mà đệm S: hút; bật N mà đệm N: đẩy), tường / vật chắn từ; đệm kéo cả vật sắt nằm đất; đệm có CÔNG TẮC
  // nút đè M (đè thì chạy, hay đè thì tắt), đổi từ nhịp sau; vật đang bị đệm hút thì không lấy được (user 30/10). Gói này chỉ có magnet_n (magnet_s từ gói 6).
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var GOC = BANH.concat(['magnet_n', 'magnet_off', 'front_clear', 'left_clear', 'right_clear', 'front_metal']);
  var HUT = ['magnet_n()', 'wait()'], THA = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function thut(ds, n) { var p = new Array((n || 1) * 4 + 1).join(' '); return ds.map(function (s) { return p + s; }); }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }

  function man(m) {
    m.chuong = m.chuong || 'bai-tu';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'tu', o: 'hong' }] };
    m.hamGoc = m.hamGoc || GOC;
    m.mucTieu = m.mucTieu || 'dua-vat'; if (m.mucTieu === 'dua-vat') m.vatCan = m.vatCan || 'sat';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || ['move', 'turn_right', 'turn_left', 'u_turn'];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương bai-tu "Bãi từ" ================================================= */
    man({
      so: 1, ten: 'Đệm từ hút xe', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, mucTieu: 'toi-co',
      deBai: 'Ô vuông xanh có chữ S là một ĐỆM TỪ. Đệm hút thân xe đứng cùng hàng hay cùng cột với nó, cách tới 2 ô: mỗi nhịp kéo xe 1 ô về phía đệm. Bấm Chạy: xe đi thẳng nhưng bị đệm kéo lên hàng trên, tới đúng lá cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn sóng từ kéo xe.',
      san: ['##.##', '....F', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(LAP(4, 'move()')),
      loiGiai: bai(LAP(4, 'move()')),
      sao: { o: 5, nhip: 4 },
      goiY: ['Đệm chỉ kéo khi xe đứng cùng hàng hay cùng cột với nó, cách 1 hay 2 ô.', 'Mỗi nhịp đệm kéo 1 ô.']
    }),

    man({
      so: 2, ten: 'Tránh xa đệm', hang: 'lam-quen', mucTieu: 'toi-co',
      deBai: 'Giữa đệm S và hàng xe đang đứng là một cái hố. Đi thẳng thì xe bị đệm kéo xuống hố. Đi bằng hàng dưới: cách đệm 3 ô thì đệm không với tới.',
      veMaMau: 'Chương trình có sẵn đi thẳng hàng trên rồi mới xuống. Chạy thử rồi sửa.',
      san: ['##.##', '##u##', '.....', '....F'], demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(nhieu(LAP(4, 'move()'), ['turn_right()', 'move()'])),
      loiGiai: bai(nhieu(['turn_right()', 'move()', 'turn_left()'], LAP(4, 'move()'))),
      sao: { o: 12, nhip: 7 },
      loiSai: [
        { moTa: 'Đi thẳng hàng trên: đệm kéo xe xuống hố', baiLam: bai(nhieu(LAP(4, 'move()'), ['turn_right()', 'move()'])), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Đệm kéo tới 2 ô. Hàng dưới cách đệm 3 ô.', 'Xuống hàng dưới ngay từ đầu rồi mới đi thẳng.']
    }),

    man({
      so: 3, ten: 'Cùng cực thì đẩy', hang: 'lam-quen', mucTieu: 'toi-co',
      deBai: 'Đệm này là cực N (đỏ). Xe không bật nam châm thì bị hút như sắt, rơi xuống hố. Bật magnet_n(): nam châm của xe cùng cực với đệm nên bị ĐẨY ra xa, mà phía dưới là tường nên xe cứ đi thẳng được.',
      veMaMau: 'Chương trình có sẵn đi thẳng, không bật nam châm. Chạy thử rồi sửa.',
      san: ['##.##', '##u##', '....F', '#####'], demTu: [{ x: 2, y: 0, cuc: 'N' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(LAP(4, 'move()')),
      loiGiai: bai(nhieu(['magnet_n()'], LAP(4, 'move()'))),
      sao: { o: 6, nhip: 4 },
      loiSai: [
        { moTa: 'Không bật nam châm: đệm N hút xe xuống hố', baiLam: bai(LAP(4, 'move()')), phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Bật nam châm quá muộn, sau hai bước', baiLam: bai(nhieu(LAP(2, 'move()'), ['magnet_n()'], LAP(2, 'move()'))), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Cùng cực thì đẩy, khác cực thì hút.', 'magnet_n() ở dòng đầu, trước khi tới gần đệm.']
    }),

    man({
      so: 4, ten: 'Nút bật đệm', hang: 'lam-quen',
      deBai: 'Đệm này có CÔNG TẮC: nút đè vàng dưới sàn, dây nối từ nút tới đệm. Xe đứng lên nút thì đệm chạy, nhưng đổi từ nhịp SAU. Đệm chạy sẽ kéo vật sắt sang ô đích ngay cạnh nó. Lái xe lên nút rồi chờ một nhịp.',
      veMaMau: 'Chương trình có sẵn dừng trước nút một ô. Chạy thử rồi sửa.',
      san: ['#oD.#', '#####', '...M.'], vatChat: ['.s...', '.....', '.....'],
      demTu: [{ x: 3, y: 0, cuc: 'N', nut: { x: 3, y: 2 } }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(nhieu(LAP(2, 'move()'), ['wait()'])),
      loiGiai: bai(nhieu(LAP(3, 'move()'), ['wait()'])),
      sao: { o: 6, nhip: 4 },
      loiSai: [
        { moTa: 'Lên nút rồi hết chương trình: đệm chưa kịp chạy', baiLam: bai(LAP(3, 'move()')), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nút đè đổi đệm từ nhịp sau: lên nút rồi wait() một nhịp.', 'Đệm kéo sắt 1 ô mỗi nhịp, tới sát đệm thì thôi.']
    }),

    man({
      so: 5, ten: 'Đứng trên nút tắt đệm', hang: 'luyen',
      deBai: 'Vật sắt nằm sát đệm S: đệm đang HÚT GIỮ nó, nam châm của xe không lấy được. Nút đè này là nút TẮT: xe đứng trên nút thì đệm tắt từ nhịp sau. Đứng trên nút mà hút sắt về, rồi quay sang thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn tiến sát vật sắt rồi hút. Chạy thử: đệm giữ chặt vật sắt.',
      san: ['#####', '.M.o.', '#D###'], vatChat: ['.....', '...s.', '.....'],
      demTu: [{ x: 4, y: 1, cuc: 'S', nut: { x: 1, y: 1 }, khiDe: 'tat' }],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(LAP(2, 'move()'), HUT, ['turn_right()'], THA)),
      loiGiai: bai(nhieu(['move()'], HUT, ['turn_right()'], THA)),
      sao: { o: 11, nhip: 4 },
      loiSai: [
        { moTa: 'Tiến sát vật sắt, rời khỏi nút: đệm bật lại và giữ vật', baiLam: bai(nhieu(LAP(2, 'move()'), HUT, ['turn_right()'], THA)), phaiCoMa: ['dem-giu-vat'] },
        { moTa: 'Hút ngay ở chỗ xuất phát: vật sắt cách 3 ô, ngoài tầm', baiLam: bai(nhieu(HUT, ['move()', 'turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nam châm hút sắt cách tới 2 ô: đứng trên nút cũng hút tới.', 'Xe rời nút thì đệm chạy lại, nhưng vật đã dính ở mũi xe thì đệm không giật ra.']
    }),

    man({
      so: 6, ten: 'Chở sắt qua đệm N', hang: 'luyen',
      deBai: 'Vật sắt ở cuối hành lang, ô đích ở đầu kia. Giữa đường có đệm N trên một cái hố. Bật magnet_n() từ đầu: đi qua đệm N thì được đẩy vào tường, an toàn, và tới gần là hút được sắt. Hút về rồi chở qua đệm lần nữa, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn thiếu dòng bật nam châm ở đầu. Chạy thử rồi sửa.',
      san: ['###.###', '###u###', 'D.....o', '#######'], vatChat: ['.......', '.......', '......s', '.......'],
      demTu: [{ x: 3, y: 0, cuc: 'N' }],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(nhieu(LAP(3, 'move()'), ['wait()', 'u_turn()'], LAP(3, 'move()'), THA)),
      loiGiai: bai(nhieu(['magnet_n()'], LAP(3, 'move()'), ['u_turn()'], LAP(3, 'move()'), THA)),
      sao: { o: 14, nhip: 8 },
      loiSai: [
        { moTa: 'Không bật nam châm khi đi: đệm N hút xe xuống hố', baiLam: bai(nhieu(LAP(3, 'move()'), ['magnet_n()', 'wait()', 'u_turn()'], LAP(3, 'move()'), THA)), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Nam châm bật thì đệm N đẩy xe ra, tường giữ xe lại trong hành lang.', 'Đang bật nam châm mà tới cách sắt 2 ô là sắt bay về dính mũi xe.']
    }),

    man({
      so: 7, ten: 'Đệm S thì đi vòng', hang: 'luyen',
      deBai: 'Đệm này là cực S. Bật N thì khác cực, đệm vẫn HÚT. Hút vật sắt bên phải xe rồi chở về ô đích. Đường thẳng đi ngang đệm S có hố. Đi vòng xuống hàng dưới: ba lần rẽ phải, mỗi lần đi hai ô.',
      veMaMau: 'Chương trình có sẵn chở sắt đi thẳng ngang đệm. Chạy thử rồi sửa.',
      san: ['##.##', '#Du##', '#...o', '#.#.#', '#...#'], vatChat: ['.....', '.....', '....s', '.....', '.....'],
      demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: { x: 3, y: 2, huong: 1 },
      maMau: bai(nhieu(HUT, ['u_turn()'], LAP(2, 'move()'), ['turn_right()'], THA)),
      loiGiai: bai(nhieu(HUT, LAP(3, ['turn_right()', 'move()', 'move()']), THA)),
      sao: { o: 13, nhip: 11 },
      loiSai: [
        { moTa: 'Chở thẳng ngang đệm S: bật N vẫn bị hút xuống hố', baiLam: bai(nhieu(HUT, ['u_turn()'], LAP(2, 'move()'), ['turn_right()'], THA)), phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Vòng hai lần rồi thả: chưa tới ô đích', baiLam: bai(nhieu(HUT, LAP(2, ['turn_right()', 'move()', 'move()']), THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Khác cực thì hút: bật N mà đệm S thì vẫn bị kéo.', 'Ba đoạn giống nhau: rẽ phải, đi hai ô. Dùng vòng lặp.']
    }),

    man({
      so: 8, ten: 'Gọi sắt ra', hang: 'bien-the',
      deBai: 'Vật sắt nằm trong hốc tường. Lái vào tận hốc mà lấy thì phải đi vòng, tốn nhịp. Đệm S dưới hành lang có nút đè BẬT ở chỗ xe đứng: đè nút thì đệm kéo sắt ra hành lang, nhưng sắt sát đệm thì bị giữ. Đè nút một nhịp, rời nút để đệm tắt, rồi hút sắt và thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn rời nút ngay nhịp đầu: đệm không bao giờ chạy.',
      san: ['##o##', 'M....', '#D.##'], vatChat: ['..s..', '.....', '.....'],
      demTu: [{ x: 2, y: 2, cuc: 'S', nut: { x: 0, y: 1 } }],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['move()'], HUT, ['turn_right()'], THA)),
      loiGiai: bai(nhieu(['wait()', 'move()'], HUT, ['turn_right()'], THA)),
      sao: { o: 12, nhip: 5 },
      loiSai: [
        { moTa: 'Rời nút ngay: đệm chưa chạy nhịp nào, sắt vẫn trong hốc', baiLam: bai(nhieu(['move()'], HUT, ['turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đứng lì trên nút mà hút: sắt ra tới hành lang nhưng đệm giữ chặt', baiLam: bai(nhieu(['wait()', 'wait()'], HUT, ['turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nút đổi đệm từ nhịp sau: đè một nhịp thì đệm chạy đúng một nhịp sau đó.', 'Sắt ra hành lang rồi, đệm tắt thì mới hút được.']
    }),

    man({
      so: 9, ten: 'Qua đệm N, tắt đệm S', hang: 'bien-the',
      deBai: 'Ô đích ở sau lưng xe. Đi qua đệm N trên hố (nhớ bật nam châm), tới nút đè thì dừng: nút này TẮT đệm S đang giữ vật sắt ở cuối hành lang. Đứng trên nút chờ đệm tắt là nam châm hút được sắt. Chở về ô đích.',
      veMaMau: 'Chương trình có sẵn đi quá nút một ô. Chạy thử: rời nút thì đệm S giữ chặt vật sắt.',
      san: ['###.####', '###u####', 'D...M.o.', '########'], vatChat: ['........', '........', '......s.', '........'],
      demTu: [{ x: 3, y: 0, cuc: 'N' }, { x: 7, y: 2, cuc: 'S', nut: { x: 4, y: 2 }, khiDe: 'tat' }],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(nhieu(['magnet_n()'], LAP(4, 'move()'), ['wait()', 'u_turn()'], LAP(4, 'move()'), THA)),
      loiGiai: bai(nhieu(['magnet_n()'], LAP(3, 'move()'), ['wait()', 'u_turn()'], LAP(3, 'move()'), THA)),
      sao: { o: 15, nhip: 9 },
      loiSai: [
        { moTa: 'Đi quá nút: đệm S bật lại, giữ vật sắt', baiLam: bai(nhieu(['magnet_n()'], LAP(4, 'move()'), ['wait()', 'u_turn()'], LAP(4, 'move()'), THA)), phaiCoMa: ['dem-giu-vat'] },
        { moTa: 'Quên bật nam châm lúc đi: đệm N hút xe xuống hố', baiLam: bai(nhieu(LAP(3, 'move()'), HUT, ['u_turn()'], LAP(3, 'move()'), THA)), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Đứng trên nút thì vật sắt cách mũi xe đúng 2 ô: vừa tầm nam châm.', 'Lên nút ở nhịp nào thì đệm tắt từ nhịp sau: chờ một nhịp.']
    }),

    man({
      so: 10, ten: 'Bãi từ hai vật', hang: 'trum', khung: { chinh: 18, moiHam: 10 },
      deBai: 'Hai vật sắt, hai ô đích. Vật thứ nhất trong hốc trên: đè nút dưới chân xe một nhịp để đệm S kéo nó ra, rời nút rồi hút, thả vào ô đích ngay dưới. Vật thứ hai ở cuối hành lang, phải đi qua đệm N trên hố. Hút về, thả vào ô đích thứ hai.',
      veMaMau: 'Chương trình có sẵn làm xong vật thứ nhất. Viết tiếp cho vật thứ hai.',
      san: ['#####.###', '##o##u###', 'M.......o', '#D.#D####'], vatChat: ['.........', '..s......', '........s', '.........'],
      demTu: [{ x: 5, y: 0, cuc: 'N' }, { x: 2, y: 3, cuc: 'S', nut: { x: 0, y: 2 } }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(nhieu(['wait()', 'move()'], HUT, ['turn_right()'], THA)),
      loiGiai: bai(nhieu(['wait()', 'move()'], HUT, ['turn_right()'], THA, ['turn_left()', 'magnet_n()'], LAP(5, 'move()'), ['u_turn()'], LAP(2, 'move()'), ['turn_left()'], THA)),
      sao: { o: 27, nhip: 16 },
      loiSai: [
        { moTa: 'Quên bật nam châm trước khi đi qua đệm N', baiLam: bai(nhieu(['wait()', 'move()'], HUT, ['turn_right()'], THA, ['turn_left()'], LAP(5, 'move()'), HUT, ['u_turn()'], LAP(2, 'move()'), ['turn_left()'], THA)), phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Không chờ trên nút: đệm S không chạy, vật thứ nhất vẫn trong hốc', baiLam: bai(nhieu(['move()'], HUT, ['turn_right()'], THA, ['turn_left()', 'magnet_n()'], LAP(5, 'move()'), ['u_turn()'], LAP(2, 'move()'), ['turn_left()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật thứ hai: đang bật nam châm thì cách sắt 2 ô là hút được, khỏi đi sát.', 'Về tới ô trên ô đích thứ hai thì rẽ trái cho mũi xe chĩa xuống rồi thả.']
    })
  ];

  /* ================================================= chương che-bai-tu "Hàm cho bãi từ" =================================================
     Hai hàm của em: fetch_iron(n) bật N, đi n ô (qua đệm N an toàn, tới gần là hút sắt), quay đầu, đi n ô về; loop_right(k) ba lần rẽ phải đi k ô (đi vòng tránh đệm S). */
  function che(m) { m.chuong = 'che-bai-tu'; return man(m); }
  var T_FETCH = nhieu(['magnet_n()'], LAP('n', 'move()'), ['u_turn()'], LAP('n', 'move()'));
  var T_RING = ['for i in range(3):', '    turn_right()', '    for j in range(k):', '        move()'];
  function hFetch(than) { return H('fetch_iron', ['n'], than || T_FETCH); }
  function hRing(than) { return H('loop_right', ['k'], than || T_RING); }
  var SAN_CHO = ['###.###', '###u###', 'D.....o', '#######'], CHAT_CHO = ['.......', '.......', '......s', '.......'];
  var SAN_VONG = ['##.####.##', '#Du####u##', '#........o', '#.##.#####', '#.##.#####', '#....#####'];
  var CHAT_VONG = ['..........', '..........', '.........s', '..........', '..........', '..........'];
  function lat(h) { return h.split('').reverse().join(''); }
  var SAN_DAI = ['###.##.##', '###u##u##', 'D.......o', '#########'], CHAT_DAI = ['.........', '.........', '........s', '.........'];

  DS.push(
    che({
      so: 1, ten: 'Hàm đi lấy sắt', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['get_iron'],
      deBai: 'Hàm get_iron(n) của màn gói cả chuyến đi lấy sắt: bật N, đi n ô, quay đầu, đi n ô về. Đi qua đệm N vẫn an toàn vì nam châm đang bật. Chương trình chỉ cần gọi get_iron(3) rồi thả. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Mở Xưởng xem get_iron, rồi bấm Chạy.',
      san: SAN_CHO, vatChat: CHAT_CHO, demTu: [{ x: 3, y: 0, cuc: 'N' }],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(nhieu(['get_iron(3)'], THA), { hamCuaMan: [H('get_iron', ['n'], T_FETCH)] }),
      loiGiai: bai(nhieu(['get_iron(3)'], THA), { hamCuaMan: [H('get_iron', ['n'], T_FETCH)] }),
      sao: { o: 15, nhip: 8 },
      goiY: ['n là số ô đi mỗi chiều.', 'Màn sau em tự tạo hàm fetch_iron giống vậy.']
    }),

    che({
      so: 2, ten: 'Hàm fetch_iron(n)', hang: 'lam-quen', taoHam: ['fetch_iron'], hamCuaEmCan: ['move', 'u_turn', 'turn_right'],
      deBai: 'Tạo hàm fetch_iron(n) có tham số n: magnet_n(), đi n ô, u_turn(), đi n ô về. Xe đứng giữa ngã tư: vật sắt bên phải ở xa, vật sắt phía trên ở gần. Một hàm, hai lần gọi với số ô khác nhau: fetch_iron(3) rồi thả, rẽ phải, fetch_iron(1) rồi thả.',
      veMaMau: 'Chương trình có sẵn gọi fetch_iron(3) và fetch_iron(1) nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['###o#####', '###.#.###', '###.#u###', '##D.....o', '###D#####'], vatChat: ['...s.....', '.........', '.........', '........s', '.........'],
      demTu: [{ x: 5, y: 1, cuc: 'N' }],
      batDau: { x: 3, y: 3, huong: 1 },
      maMau: bai(nhieu(['fetch_iron(3)'], THA, ['turn_right()', 'fetch_iron(1)'], THA)),
      loiGiai: bai(nhieu(['fetch_iron(3)'], THA, ['turn_right()', 'fetch_iron(1)'], THA), { hamCuaEmMoi: [hFetch()] }),
      sao: { o: 21, nhip: 13 },
      loiSai: [
        { moTa: 'Chưa tạo hàm fetch_iron mà đã gọi nó', baiLam: bai(nhieu(['fetch_iron(3)'], THA, ['turn_right()', 'fetch_iron(1)'], THA)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm đi cứng 1 ô: vật bên phải còn xa, ngoài tầm', baiLam: bai(nhieu(['fetch_iron(3)'], THA, ['turn_right()', 'fetch_iron(1)'], THA)), hamCuaEmMoi: [hFetch(nhieu(['magnet_n()'], LAP(1, 'move()'), ['u_turn()'], LAP(1, 'move()')))], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong hàm quên magnet_n(): đệm N hút xe xuống hố', baiLam: bai(nhieu(['fetch_iron(3)'], THA, ['turn_right()', 'fetch_iron(1)'], THA)), hamCuaEmMoi: [hFetch(nhieu(LAP('n', 'move()'), ['u_turn()'], LAP('n', 'move()')))], phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Viết for i in range(n): thì vòng lặp chạy đúng n lần.', 'Đang bật nam châm thì cách sắt 2 ô là hút: phía trên chỉ cần đi 1 ô.']
    }),

    che({
      so: 3, ten: 'Hành lang hai đệm', hang: 'lam-quen', hamCuaEmCan: ['fetch_iron', 'move', 'turn_right', 'turn_left'],
      deBai: 'Hành lang dài, có hai đệm N trên hai cái hố, vật sắt ở cuối. Xe đứng dưới đầu hành lang, trên ô đích. Tiến lên một ô, rẽ phải, gọi fetch_iron với số ô vừa đủ tới cách vật sắt 2 ô. Về rồi rẽ trái thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn gọi fetch_iron(3): chưa tới gần vật sắt. Sửa số ô và viết tiếp.',
      san: ['###.##.##', '###u##u##', '#.......o', '#D#######'], vatChat: CHAT_DAI, demTu: [{ x: 3, y: 0, cuc: 'N' }, { x: 6, y: 0, cuc: 'N' }],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['move()', 'turn_right()', 'fetch_iron(3)']),
      loiGiai: bai(nhieu(['move()', 'turn_right()', 'fetch_iron(5)', 'turn_left()'], THA)),
      sao: { o: 22, nhip: 15 },
      loiSai: [
        { moTa: 'fetch_iron(3): dừng cách vật sắt 4 ô, ngoài tầm', baiLam: bai(nhieu(['move()', 'turn_right()', 'fetch_iron(3)', 'turn_left()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Về rồi thả luôn: vật rơi vào tường bên trái', baiLam: bai(nhieu(['move()', 'turn_right()', 'fetch_iron(5)'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đếm ô từ đầu hành lang tới ô cách vật sắt 2 ô.', 'fetch_iron xong xe quay mặt về bên trái: rẽ trái là chĩa xuống ô đích.']
    }),

    che({
      so: 4, ten: 'Hàm loop_right(k)', hang: 'luyen', taoHam: ['loop_right'], hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Tạo hàm loop_right(k): ba lần rẽ phải, mỗi lần đi k ô. Hút vật sắt bên phải, rồi loop_right(3) đi vòng tránh đệm S, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn gọi loop_right(3) nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['##.###', '#Du###', '#....o', '#.##.#', '#.##.#', '#....#'], vatChat: ['......', '......', '.....s', '......', '......', '......'],
      demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: { x: 4, y: 2, huong: 1 },
      maMau: bai(nhieu(HUT, ['loop_right(3)'], THA)),
      loiGiai: bai(nhieu(HUT, ['loop_right(3)'], THA), { hamCuaEmMoi: [hRing()] }),
      sao: { o: 14, nhip: 14 },
      loiSai: [
        { moTa: 'Chưa tạo hàm loop_right mà đã gọi nó', baiLam: bai(nhieu(HUT, ['loop_right(3)'], THA)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm vòng trong đi cứng 2 ô: chưa về tới ô đích', baiLam: bai(nhieu(HUT, ['loop_right(3)'], THA)), hamCuaEmMoi: [hRing(['for i in range(3):', '    turn_right()', '    for j in range(2):', '        move()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hai vòng lặp lồng nhau: vòng ngoài 3 lần, vòng trong k lần.', 'Vòng trong đặt tên biến khác (j) cho dễ đọc.']
    }),

    che({
      so: 5, ten: 'Lấy xa, về vòng', hang: 'luyen', hamCuaEmCan: ['fetch_iron', 'u_turn', 'loop_right'],
      deBai: 'Vật sắt ở cuối hành lang bên phải, sau một đệm N. Ô đích ở góc trên bên trái, cạnh đệm S trên hố. Lấy sắt bằng fetch_iron(2), lùi về thêm một ô tới chỗ rẽ xuống, quay đầu, rồi loop_right(3) đi vòng tránh đệm S, thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn lấy được sắt rồi thả ngay chỗ xe đứng. Viết tiếp đoạn đi vòng.',
      san: SAN_VONG, vatChat: CHAT_VONG, demTu: [{ x: 2, y: 0, cuc: 'S' }, { x: 7, y: 0, cuc: 'N' }],
      batDau: { x: 5, y: 2, huong: 1 },
      maMau: bai(nhieu(['fetch_iron(2)'], THA)),
      loiGiai: bai(nhieu(['fetch_iron(2)', 'move()', 'u_turn()', 'loop_right(3)'], THA)),
      sao: { o: 24, nhip: 20 },
      loiSai: [
        { moTa: 'Quên quay đầu: loop_right bắt đầu bằng rẽ phải nên xe rẽ lên tường', baiLam: bai(nhieu(['fetch_iron(2)', 'move()', 'loop_right(3)'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên lùi một ô: chỗ xe đứng không rẽ xuống được', baiLam: bai(nhieu(['fetch_iron(2)', 'u_turn()', 'loop_right(3)'], THA)), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chở thẳng về ô đích ngang đệm S', baiLam: bai(nhieu(['fetch_iron(2)'], LAP(4, 'move()'), ['turn_right()'], THA)), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['fetch_iron xong xe quay mặt về bên trái. loop_right bắt đầu bằng rẽ phải: quay đầu trước để rẽ xuống.', 'Hai hàm của em, mỗi hàm một việc: lấy xa, đi vòng.']
    }),

    che({
      so: 6, ten: 'Sửa tap_pad()', hang: 'luyen',
      deBai: 'Hàm tap_pad() của màn phải đè nút một nhịp rồi bước khỏi nút, để đệm S kéo vật sắt ra hành lang rồi tắt. Nó viết ngược thứ tự nên đệm không chạy. Sửa thân hàm, rồi hút sắt, chở dọc hành lang tới ô đích ở đầu kia.',
      veMaMau: 'Chạy thử: xe rời nút ngay, đệm không chạy nhịp nào. Mở Xưởng sửa tap_pad.',
      san: ['######o##', 'D.......M', '######.##'], vatChat: ['......s..', '.........', '.........'],
      demTu: [{ x: 6, y: 2, cuc: 'S', nut: { x: 8, y: 1 } }],
      batDau: { x: 8, y: 1, huong: 3 },
      maMau: bai(nhieu(['tap_pad()'], HUT, LAP(6, 'move()'), THA), { hamCuaMan: [H('tap_pad', [], ['move()', 'wait()'])] }),
      loiGiai: bai(nhieu(['tap_pad()'], HUT, LAP(6, 'move()'), THA), { hamCuaMan: [H('tap_pad', [], ['wait()', 'move()'])] }),
      sao: { o: 12, nhip: 10 },
      loiSai: [
        { moTa: 'Bỏ wait(): chỉ bước khỏi nút, đệm không chạy nhịp nào', baiLam: bai(nhieu(['tap_pad()'], HUT, LAP(6, 'move()'), THA), { hamCuaMan: [H('tap_pad', [], ['move()'])] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đè nút trước: wait() khi xe còn đứng trên nút.', 'Rồi mới move() ra khỏi nút: đệm chạy thêm đúng một nhịp rồi tắt.']
    }),

    che({
      so: 7, ten: 'Hàm pull_iron()', hang: 'bien-the', taoHam: ['pull_iron'], hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Tạo hàm pull_iron(): đè nút một nhịp, bước khỏi nút, rồi hút sắt về (wait(), move(), magnet_n(), wait()). Hai hốc sắt giống nhau, mỗi hốc một nút: lặp hai lần gọi hàm, thả, rồi đi ba ô tới nút sau.',
      veMaMau: 'Chương trình có sẵn gọi pull_iron() nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['##o###o##', 'M...M....', '#D.##D.##'], vatChat: ['..s...s..', '.........', '.........'],
      demTu: [{ x: 2, y: 2, cuc: 'S', nut: { x: 0, y: 1 } }, { x: 6, y: 2, cuc: 'S', nut: { x: 4, y: 1 } }],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(LAP(2, ['pull_iron()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'for j in range(3):', '    move()'])),
      loiGiai: bai(LAP(2, ['pull_iron()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'for j in range(3):', '    move()']), { hamCuaEmMoi: [H('pull_iron', [], nhieu(['wait()', 'move()'], HUT))] }),
      sao: { o: 19, nhip: 14 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pull_iron mà đã gọi nó', baiLam: bai(LAP(2, ['pull_iron()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'for j in range(3):', '    move()'])), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm bước trước rồi mới chờ: đệm không chạy', baiLam: bai(LAP(2, ['pull_iron()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'for j in range(3):', '    move()'])), hamCuaEmMoi: [H('pull_iron', [], nhieu(['move()', 'wait()'], HUT))], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi hai ô: xe chưa tới nút sau', baiLam: bai(LAP(2, ['pull_iron()', 'turn_right()', 'magnet_off()', 'wait()', 'turn_left()', 'for j in range(2):', '    move()'])), hamCuaEmMoi: [H('pull_iron', [], nhieu(['wait()', 'move()'], HUT))], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm bốn dòng: wait(), move(), magnet_n(), wait().', 'Thả xong xe ở ngay cạnh nút cũ: rẽ trái, đi ba ô là tới nút sau.']
    }),

    che({
      so: 8, ten: 'Gọi ra rồi đi lấy', hang: 'bien-the', hamCuaEmCan: ['pull_iron', 'fetch_iron', 'turn_right', 'turn_left'],
      deBai: 'Hai vật sắt. Vật thứ nhất trong hốc: pull_iron() rồi thả vào ô đích dưới. Vật thứ hai ở cuối hành lang sau đệm N: fetch_iron(5) mang về, rồi rẽ phải thả vào ô đích phía trên.',
      veMaMau: 'Chương trình có sẵn làm xong vật thứ nhất. Viết tiếp.',
      san: ['#####.###', '#Do##u###', 'M.......o', '#D.######'], vatChat: ['.........', '..s......', '........s', '.........'],
      demTu: [{ x: 5, y: 0, cuc: 'N' }, { x: 2, y: 3, cuc: 'S', nut: { x: 0, y: 2 } }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(nhieu(['pull_iron()', 'turn_right()'], THA)),
      loiGiai: bai(nhieu(['pull_iron()', 'turn_right()'], THA, ['turn_left()', 'fetch_iron(5)', 'turn_right()'], THA)),
      sao: { o: 29, nhip: 19 },
      loiSai: [
        { moTa: 'fetch_iron(4): xe dừng cách vật sắt 3 ô, chưa hút được', baiLam: bai(nhieu(['pull_iron()', 'turn_right()'], THA, ['turn_left()', 'fetch_iron(3)', 'turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Về tới nơi rẽ trái: ô đích dưới đã có vật thứ nhất', baiLam: bai(nhieu(['pull_iron()', 'turn_right()'], THA, ['turn_left()', 'fetch_iron(5)', 'turn_left()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đếm ô từ chỗ xe đứng tới chỗ cách vật sắt 2 ô.', 'fetch_iron xong xe quay mặt về bên trái: rẽ phải là chĩa lên trên.']
    }),

    che({
      so: 9, ten: 'Sửa loop_left(k)', hang: 'bien-the', hamCuaEmCan: ['fetch_iron', 'u_turn'],
      deBai: 'Sân này là sân màn trước lật gương: đường vòng phải đi về bên trái. Hàm loop_left(k) của màn chép từ loop_right nên vẫn rẽ phải. Sửa thân hàm, rồi lấy sắt bằng fetch_iron(3), quay đầu, loop_left(3), thả.',
      veMaMau: 'Chạy thử: xe rẽ nhầm sang phải. Mở Xưởng sửa loop_left.',
      san: SAN_VONG.map(lat), vatChat: CHAT_VONG.map(lat), demTu: [{ x: 7, y: 0, cuc: 'S' }, { x: 2, y: 0, cuc: 'N' }],
      batDau: { x: 5, y: 2, huong: 3 },
      maMau: bai(nhieu(['fetch_iron(3)', 'u_turn()', 'loop_left(3)'], THA), { hamCuaMan: [H('loop_left', ['k'], T_RING)] }),
      loiGiai: bai(nhieu(['fetch_iron(3)', 'u_turn()', 'loop_left(3)'], THA), { hamCuaMan: [H('loop_left', ['k'], T_RING.map(function (d) { return d.replace('turn_right', 'turn_left'); }))] }),
      sao: { o: 23, nhip: 21 },
      loiSai: [
        { moTa: 'Đổi chỗ khác: gọi loop_right(3) của em, vẫn rẽ phải', baiLam: bai(nhieu(['fetch_iron(3)', 'u_turn()', 'loop_right(3)'], THA), { hamCuaMan: [H('loop_left', ['k'], T_RING)] }), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Đi vòng bên trái thì mỗi góc rẽ trái.', 'Chỉ cần đổi một dòng trong thân hàm.']
    }),

    che({
      so: 10, ten: 'Bãi từ ba hàm', hang: 'trum', khung: { chinh: 14, moiHam: 10 }, hamCuaEmCan: ['pull_iron', 'fetch_iron', 'loop_right', 'move', 'u_turn', 'turn_right', 'turn_left'],
      deBai: 'Hai vật sắt, hai ô đích, ba hàm của em. Xe đứng trên nút: pull_iron() gọi vật trong hốc ra, thả vào ô đích ngay dưới. Rồi fetch_iron(2) lấy vật sau đệm N, lùi về một ô lên nút, quay đầu, loop_right(3) đi vòng tránh đệm S tới ô đích góc trên.',
      veMaMau: 'Chương trình có sẵn làm xong vật thứ nhất. Viết tiếp.',
      san: ['##.####.##', '#Du###ou##', '#...M....o', '#.##.D.###', '#.##.#####', '#....#####'],
      vatChat: ['..........', '......s...', '.........s', '..........', '..........', '..........'],
      demTu: [{ x: 2, y: 0, cuc: 'S' }, { x: 7, y: 0, cuc: 'N' }, { x: 6, y: 3, cuc: 'S', nut: { x: 4, y: 2 } }],
      batDau: { x: 4, y: 2, huong: 1 },
      maMau: bai(nhieu(['pull_iron()', 'turn_right()'], THA)),
      loiGiai: bai(nhieu(['pull_iron()', 'turn_right()'], THA, ['turn_left()', 'fetch_iron(2)', 'move()', 'u_turn()', 'loop_right(3)'], THA)),
      sao: { o: 35, nhip: 26 },
      loiSai: [
        { moTa: 'Quên lùi về một ô: loop_right rẽ xuống ô đích đã có vật', baiLam: bai(nhieu(['pull_iron()', 'turn_right()'], THA, ['turn_left()', 'fetch_iron(2)', 'u_turn()', 'loop_right(3)'], THA)), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chở thẳng về ngang đệm S', baiLam: bai(nhieu(['pull_iron()', 'turn_right()'], THA, ['turn_left()', 'fetch_iron(2)'], LAP(4, 'move()'), ['turn_right()'], THA)), phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Mỗi hàm một đoạn: gọi vật ra, lấy xa, đi vòng.', 'loop_right(3) bắt đầu ở ô nút, mặt quay sang phải.']
    })
  );

  ManHoc.manBaiTu = DS;
  if (laNode) module.exports = ManHoc;
})();
