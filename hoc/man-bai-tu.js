/* ============================================================================
   man-bai-tu.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 4 "Bãi từ" (KE-HOACH-MUA-3.md; phiên "Mùa 3" tự viết 30/10;
   PDM3a 31/10 viết lại trên ROBOT PHÂN LOẠI: nhện + nam châm bụng + cảm biến từ, luật part đúng mùa KE-HOACH-PART-DUNG-MUA.md).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) xếp màn theo `so` (1 … 10, mã giữ nguyên).
     - `bai-tu`: chương 1 "Bãi từ": đệm từ hút / đẩy nhện, nút bật đệm, đệm kéo và giữ mẩu sắt.
     - `che-bai-tu`: chương 2 "Hàm cho bãi từ": hàm của em detour(n), call_out(), shield_run(n); ôn trail (gói 1).
   Cái mới của gói: ĐỆM TỪ (san-hoc.js phần ĐỆM TỪ): ô đệm cực N (đỏ) / S (xanh dương) là khối; thân đứng CÙNG HÀNG / CỘT trong 2 ô (ô giữa không có
   khối chặn: tường chắn từ) bị dời 1 ô mỗi nhịp ('dem-keo'): nhện không bật nam châm hay bật KHÁC cực đệm thì bị HÚT về phía đệm (dừng sát đệm), bật
   CÙNG cực thì bị ĐẨY ra xa (tường phía sau thì đứng im 'dem-chan'). Đệm cũng kéo mẩu sắt nằm đất và GIỮ mẩu sát nó (nam châm bụng không nhấc được:
   'dem-giu-vat'). Đệm có CÔNG TẮC nút đè M (đè thì chạy, đổi từ nhịp sau; nhện bước đi mất 2 nhịp nên nhịp đầu của bước rời nút vẫn là đè).
   Gói này chỉ có cực N (magnet_s mở ở gói 6); không hố (hố đi cùng nhảy ở gói 5). Nhện xuất phát quay phải (đầu dò nhìn phải) như gói 3.
   Máy kiểm: hoc/kiem-man-mua-3.mjs, hoc/kiem-lo-trinh.mjs mục mùa 3, hoc/kiem-dem-tu.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HG = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'magnet_n', 'magnet_off', 'front_metal'];
  var NHAT = ['magnet_n()', 'wait()'], DAT = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function thut(ds, n) { var p = new Array((n || 1) * 4 + 1).join(' '); return ds.map(function (s) { return p + s; }); }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }
  function lap(n, s) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }

  function man(m) {
    m.chuong = m.chuong || 'bai-tu';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HG;
    m.mucTieu = m.mucTieu || 'dua-vat'; if (m.mucTieu === 'dua-vat') m.vatCan = m.vatCan || 'sat';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }
  var P = function (x, y) { return { x: x, y: y, huong: 1 }; };
  var KEO = ['dem-keo', 'chua-toi-co'], KEO_VAT = ['dem-keo', 'chua-dua-vat'];

  var DS = [
    /* ================================================= chương bai-tu "Bãi từ" ================================================= */
    man({
      so: 1, ten: 'Đệm từ hút nhện', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, mucTieu: 'toi-co',
      deBai: 'Ô vuông xanh có chữ S là một ĐỆM TỪ. Đệm hút thân nhện đứng cùng hàng hay cùng cột với nó, cách tới 2 ô: mỗi nhịp kéo nhện 1 ô về phía đệm. Bấm Chạy: nhện đi thẳng hàng dưới nhưng tới cột đệm thì bị kéo lên hàng trên, rồi đi tiếp tới đúng lá cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn sóng từ kéo nhện.',
      san: ['##.##', '....F', '.....'], demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(LAP(4, 'go_right()')),
      loiGiai: bai(LAP(4, 'go_right()')),
      sao: { o: 2, nhip: 8 },
      goiY: ['Đệm chỉ kéo khi nhện đứng cùng hàng hay cùng cột với nó, cách 1 hay 2 ô.', 'Mỗi nhịp đệm kéo 1 ô.']
    }),

    man({
      so: 2, ten: 'Tránh xa đệm', hang: 'lam-quen', mucTieu: 'toi-co',
      deBai: 'Lá cờ ở hàng dưới cùng. Đi thẳng hàng giữa thì tới cột đệm nhện bị kéo lên hàng trên, lạc đường. Xuống hàng dưới cùng trước: cách đệm 3 ô thì đệm không với tới.',
      veMaMau: 'Chương trình có sẵn đi thẳng hàng giữa. Chạy thử rồi sửa.',
      san: ['##.##', '.....', '.....', '....F'], demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(LAP(4, 'go_right()')),
      loiGiai: bai(nhieu(['go_down()'], LAP(4, 'go_right()'))),
      sao: { o: 3, nhip: 10 },
      loiSai: [
        { moTa: 'Đi thẳng hàng giữa: tới cột đệm nhện bị kéo lên', baiLam: bai(LAP(4, 'go_right()')), phaiCoMa: KEO }
      ],
      goiY: ['Đệm với tới 2 ô. Hàng dưới cùng cách đệm 3 ô.', 'Xuống trước rồi mới đi thẳng.']
    }),

    man({
      so: 3, ten: 'Cùng cực thì đẩy', hang: 'lam-quen', mucTieu: 'toi-co',
      deBai: 'Đệm này là cực N (đỏ). Nhện không bật nam châm thì bị hút như sắt, kéo lên hàng trên. Bật magnet_n(): nam châm bụng cùng cực với đệm nên bị ĐẨY ra xa, mà phía dưới là tường nên nhện cứ đi thẳng được tới cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng, không bật nam châm. Chạy thử rồi sửa.',
      san: ['##.##', '.....', '....F', '#####'], demTu: [{ x: 2, y: 0, cuc: 'N' }],
      batDau: P(0, 2),
      maMau: bai(LAP(4, 'go_right()')),
      loiGiai: bai(nhieu(['magnet_n()'], LAP(4, 'go_right()'))),
      sao: { o: 3, nhip: 8 },
      loiSai: [
        { moTa: 'Không bật nam châm: đệm N hút nhện lên hàng trên', baiLam: bai(LAP(4, 'go_right()')), phaiCoMa: KEO }
      ],
      goiY: ['Cùng cực thì đẩy, khác cực thì hút.', 'magnet_n() ở dòng đầu, trước khi tới cột đệm.']
    }),

    man({
      so: 4, ten: 'Khác cực vẫn hút', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Đệm này là cực S, nằm dưới hành lang. Bật N thì KHÁC cực, đệm vẫn hút nhện xuống. Đi vòng bằng hàng trên cùng (cách đệm 3 ô) rồi xuống lại chỗ lá cờ.',
      veMaMau: 'Chương trình có sẵn bật nam châm rồi đi thẳng như màn trước. Chạy thử: đệm S vẫn kéo. Sửa đường.',
      san: ['.....', '....F', '.....', '##.##'], demTu: [{ x: 2, y: 3, cuc: 'S' }],
      batDau: P(0, 1),
      maMau: bai(nhieu(['magnet_n()'], LAP(4, 'go_right()'))),
      loiGiai: bai(nhieu(['go_up()'], LAP(4, 'go_right()'), ['go_down()'])),
      sao: { o: 4, nhip: 12 },
      loiSai: [
        { moTa: 'Bật N đi thẳng: khác cực, đệm S vẫn kéo nhện xuống', baiLam: bai(nhieu(['magnet_n()'], LAP(4, 'go_right()'))), phaiCoMa: KEO },
        { moTa: 'Đi hàng trên nhưng quên xuống: lá cờ ở hàng giữa', baiLam: bai(nhieu(['go_up()'], LAP(4, 'go_right()'))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đẩy chỉ khi CÙNG cực: đệm S thì cực N của nhện bị hút.', 'Hàng trên cùng cách đệm 3 ô: đi ở đó rồi xuống ở cột cờ.']
    }),

    man({
      so: 5, ten: 'Nút bật đệm', hang: 'luyen',
      deBai: 'Đệm này có CÔNG TẮC: nút đè vàng dưới sàn, dây nối từ nút tới đệm. Nhện đứng lên nút thì đệm chạy, nhưng đổi từ nhịp SAU. Đệm chạy sẽ kéo mẩu sắt vụn ở hàng trên sang thùng ngay cạnh nó. Đi lên nút rồi chờ một nhịp.',
      veMaMau: 'Chương trình có sẵn lên tới nút rồi hết. Chạy thử: đệm chưa kịp chạy. Thêm wait().',
      san: ['#oD.#', '...#.', '...M.'], vatChat: ['.s...', '.....', '.....'],
      demTu: [{ x: 3, y: 0, cuc: 'N', nut: { x: 3, y: 2 } }],
      batDau: P(0, 2),
      maMau: bai(LAP(3, 'go_right()')),
      loiGiai: bai(nhieu(lap(3, 'go_right()'), ['wait()'])),
      sao: { o: 4, nhip: 7 },
      loiSai: [
        { moTa: 'Lên nút rồi hết chương trình: đệm chưa kịp chạy', baiLam: bai(LAP(3, 'go_right()')), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dừng trước nút một ô rồi chờ: nút chưa bị đè', baiLam: bai(nhieu(LAP(2, 'go_right()'), ['wait()', 'wait()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nút đè đổi đệm từ nhịp sau: lên nút rồi wait() một nhịp.', 'Đệm kéo sắt 1 ô mỗi nhịp, tới sát đệm thì thôi.']
    }),

    man({
      so: 6, ten: 'Đệm giữ sắt', hang: 'luyen',
      deBai: 'Hai mẩu sắt vụn. Mẩu ở hàng trên nằm sát đệm S đang chạy: đệm GIỮ nó, nam châm bụng không nhấc nổi, nhưng nó đã nằm ngay trên thùng rồi. Chỉ cần mang mẩu ngay dưới nhện xuống thùng ở cuối cột trái.',
      veMaMau: 'Chương trình có sẵn đi nhấc mẩu sát đệm. Chạy thử: đệm giữ chặt. Đổi sang mẩu gần.',
      san: ['...X.', 'o####', '.####', '.####', 'D####'], vatChat: ['...s.', 's....', '.....', '.....', '.....'],
      demTu: [{ x: 4, y: 0, cuc: 'S' }],
      batDau: P(0, 0),
      maMau: bai(nhieu(LAP(3, 'go_right()'), NHAT, LAP(3, 'go_left()'), ['go_down()'], DAT)),
      loiGiai: bai(nhieu(['go_down()'], NHAT, LAP(3, 'go_down()'), DAT)),
      sao: { o: 7, nhip: 10 },
      loiSai: [
        { moTa: 'Nhấc mẩu sát đệm: đệm đang chạy giữ chặt, nhện về tay không', baiLam: bai(nhieu(LAP(3, 'go_right()'), NHAT, LAP(3, 'go_left()'), ['go_down()'], DAT)), phaiCoMa: ['dem-giu-vat', 'chua-dua-vat'] }
      ],
      goiY: ['Mẩu sắt sát đệm đang chạy thì bị giữ: đừng mất công.', 'Mẩu dưới nhện cách đệm xa, nhấc bình thường.']
    }),

    man({
      so: 7, ten: 'Mang sắt qua đệm N', hang: 'bien-the',
      deBai: 'Mang mẩu sắt từ trái sang thùng bên phải. Trên đường có đệm N ở hàng trên: nhện đang bật nam châm (để giữ mẩu sắt) nên tới cột đệm bị ĐẨY xuống hàng dưới, lạc đường. Chở bằng hàng dưới cùng (cách đệm 3 ô) rồi lên lại chỗ thùng.',
      veMaMau: 'Chương trình có sẵn chở thẳng hàng giữa. Chạy thử: đệm N đẩy nhện xuống. Sửa đường.',
      san: ['##.##', '##.##', 'o...D', '.....'], vatChat: ['.....', '.....', 's....', '.....'],
      demTu: [{ x: 2, y: 0, cuc: 'N' }],
      batDau: P(0, 2),
      maMau: bai(nhieu(NHAT, LAP(4, 'go_right()'), DAT)),
      loiGiai: bai(nhieu(NHAT, ['go_down()'], LAP(4, 'go_right()'), ['go_up()'], DAT)),
      sao: { o: 8, nhip: 14 },
      loiSai: [
        { moTa: 'Chở thẳng hàng giữa: đang bật N nên đệm N đẩy nhện xuống, thả lệch thùng', baiLam: bai(nhieu(NHAT, LAP(4, 'go_right()'), DAT)), phaiCoMa: KEO_VAT },
        { moTa: 'Đi hàng dưới nhưng quên lên lại: thả dưới thùng một ô', baiLam: bai(nhieu(NHAT, ['go_down()'], LAP(4, 'go_right()'), DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đang mang hàng là đang bật N: gặp đệm N thì bị đẩy.', 'Cách đệm 3 ô thì không sao: xuống, đi, lên.']
    }),

    man({
      so: 8, ten: 'Gọi sắt ra', hang: 'bien-the',
      deBai: 'Mẩu sắt nằm trong hốc trên. Đệm S dưới hành lang có nút đè BẬT ở đầu trái: đè nút thì đệm kéo mẩu sắt ra hành lang. Đi tới nút, chờ một nhịp, rồi quay lại đứng trên mẩu sắt, hút, mang về thùng bên trái.',
      veMaMau: 'Chương trình có sẵn tới nút và chờ. Viết tiếp phần lấy sắt.',
      san: ['##o##', 'M....', '#D.##'], vatChat: ['..s..', '.....', '.....'],
      demTu: [{ x: 2, y: 2, cuc: 'S', nut: { x: 0, y: 1 } }],
      batDau: P(4, 1),
      maMau: bai(nhieu(LAP(4, 'go_left()'), ['wait()'])),
      loiGiai: bai(nhieu(LAP(4, 'go_left()'), ['wait()'], LAP(2, 'go_right()'), NHAT, ['go_left()', 'go_down()'], DAT)),
      sao: { o: 11, nhip: 19 },
      loiSai: [
        { moTa: 'Không tới nút, chờ ở giữa hành lang: đệm không chạy, sắt vẫn trong hốc', baiLam: bai(nhieu(LAP(3, 'go_left()'), ['wait()', 'go_right()'], NHAT, ['go_left()', 'go_down()'], DAT)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Lấy xong thả ngay ở hành lang: chưa xuống thùng', baiLam: bai(nhieu(LAP(4, 'go_left()'), ['wait()'], LAP(2, 'go_right()'), NHAT, ['go_left()'], DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đè nút một nhịp: mẩu sắt rơi ra hành lang, sát đệm.', 'Nhện rời nút thì đệm tắt, mẩu sắt mới nhấc được.']
    }),

    man({
      so: 9, ten: 'Sửa đường chở', hang: 'bien-the',
      deBai: 'Sola viết chương trình chở sắt sang thùng nhưng chọn nhầm hàng: hàng giữa đi ngang đệm S nên nhện bị kéo lên. Hai bãi, đệm ở hai cột khác nhau. Sửa cho nhện chở bằng hàng dưới cùng rồi lên thùng.',
      veMaMau: 'Chạy thử: tới cột đệm nhện bị kéo lên. Sửa đường đi.',
      san: [['##.###', '##.###', 'o....D', '......'], ['####.#', '####.#', 'o....D', '......']], vatChat: [['......', '......', 's.....', '......'], ['......', '......', 's.....', '......']],
      demTu: [[{ x: 2, y: 0, cuc: 'S' }], [{ x: 4, y: 0, cuc: 'S' }]],
      batDau: P(0, 2),
      maMau: bai(nhieu(NHAT, LAP(5, 'go_right()'), DAT)),
      loiGiai: bai(nhieu(NHAT, ['go_down()'], LAP(5, 'go_right()'), ['go_up()'], DAT)),
      sao: { o: 8, nhip: 16 },
      loiSai: [
        { moTa: 'Giữ hàng giữa: đệm S kéo nhện lên, thả lệch', baiLam: bai(nhieu(NHAT, LAP(5, 'go_right()'), DAT)), phaiCoMa: KEO_VAT },
        { moTa: 'Đi hàng dưới nhưng quên lên lại: thả dưới thùng một ô', baiLam: bai(nhieu(NHAT, ['go_down()'], LAP(5, 'go_right()'), DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hàng dưới cùng cách đệm 3 ô ở cả hai bãi.', 'Chỉ cần thêm go_down() đầu và go_up() cuối.']
    }),

    man({
      so: 10, ten: 'Bãi từ hai mẩu', hang: 'trum', khung: { chinh: 18, moiHam: 10 }, hamCuaEmCan: ['trail'],
      deBai: 'Trùm. Hai hành lang, hai mẩu sắt, hai thùng. Hành lang trên có đệm N ở hàng trên, hành lang dưới có đệm S ở hàng dưới cùng: hàng giữa (cách cả hai đệm 3 ô) là đường an toàn. Mẩu trên: xuống hàng giữa, sang phải, lên thùng. Rồi trail về mẩu dưới, lên hàng giữa, sang phải, xuống thùng.',
      veMaMau: 'Chương trình có sẵn chở xong mẩu trên. Viết tiếp mẩu dưới.',
      san: ['##.##', '.....', 'o...D', '.....', 'o...D', '.....', '##.##'], vatChat: ['.....', '.....', 's....', '.....', 's....', '.....', '.....'],
      demTu: [{ x: 2, y: 0, cuc: 'N' }, { x: 2, y: 6, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(nhieu(NHAT, ['go_down()'], LAP(4, 'go_right()'), ['go_up()'], DAT)),
      loiGiai: bai(nhieu(NHAT, ['go_down()'], LAP(4, 'go_right()'), ['go_up()'], DAT, ['trail("DLLLLD")'], NHAT, ['go_up()'], LAP(4, 'go_right()'), ['go_down()'], DAT)),
      sao: { o: 27, nhip: 40 },
      loiSai: [
        { moTa: 'Mẩu dưới chở thẳng hàng của nó: cột đệm S kéo nhện xuống, thả lệch', baiLam: bai(nhieu(NHAT, ['go_down()'], LAP(4, 'go_right()'), ['go_up()'], DAT, ['trail("DLLLLD")'], NHAT, LAP(4, 'go_right()'), DAT)), phaiCoMa: KEO_VAT },
        { moTa: 'Mẩu trên chở thẳng: đang bật N, cột đệm N đẩy nhện xuống', baiLam: bai(nhieu(NHAT, LAP(4, 'go_right()'), DAT)), phaiCoMa: KEO_VAT }
      ],
      goiY: ['Hàng giữa cách cả hai đệm 3 ô: mọi chuyến đều đi ở đó.', 'Sau khi thả mẩu trên: xuống, trái bốn, xuống là tới mẩu dưới.']
    })
  ];

  /* ================================================= chương che-bai-tu "Hàm cho bãi từ" =================================================
     Hàm của em mới: detour(n) (xuống, đi n ô sang phải, lên: chở hàng vòng dưới đệm), call_out() (đè nút một nhịp, sang hai ô, hút: gọi sắt ra rồi lấy),
     shield_run(n) (bật N rồi đi n ô: qua cột đệm N có tường chắn phía dưới). Ôn trail (gói 1). */
  function che(m) { m.chuong = 'che-bai-tu'; return man(m); }
  var T_DETOUR = ['go_down()', 'for i in range(n):', '    go_right()', 'go_up()'];
  var T_CALL = ['wait()', 'go_right()', 'go_right()', 'magnet_n()', 'wait()'];
  var T_SHIELD = ['magnet_n()', 'for i in range(n):', '    go_right()'];
  function hDetour(than) { return H('detour', ['n'], than || T_DETOUR); }
  function hCall(than) { return H('call_out', [], than || T_CALL); }
  function hShield(than) { return H('shield_run', ['n'], than || T_SHIELD); }
  var SAN_VONG = ['##.##', '.....', 'o...D', '.....'], CHAT_VONG = ['.....', '.....', 's....', '.....'];
  var SAN_HOC = ['##o##', 'M....', '#D.##'], CHAT_HOC = ['..s..', '.....', '.....'], DEM_HOC = [{ x: 2, y: 2, cuc: 'S', nut: { x: 0, y: 1 } }];
  var LAY_HOC = ['call_out()', 'go_left()', 'go_down()'];

  DS.push(
    che({
      so: 1, ten: 'Hàm đi vòng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['go_wide'],
      deBai: 'Hàm go_wide() của màn gói cả đoạn đi vòng dưới đệm: xuống một hàng, đi bốn ô, lên lại. Chương trình chỉ cần hút, gọi go_wide(), thả. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Mở Xưởng xem go_wide, rồi bấm Chạy.',
      san: SAN_VONG, vatChat: CHAT_VONG, demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(nhieu(NHAT, ['go_wide()'], DAT), { hamCuaMan: [H('go_wide', [], ['go_down()', 'for i in range(4):', '    go_right()', 'go_up()'])] }),
      loiGiai: bai(nhieu(NHAT, ['go_wide()'], DAT), { hamCuaMan: [H('go_wide', [], ['go_down()', 'for i in range(4):', '    go_right()', 'go_up()'])] }),
      sao: { o: 9, nhip: 14 },
      goiY: ['Đi vòng xa đệm 3 ô thì không bị kéo.', 'Màn sau bạn tự tạo hàm detour có tham số.']
    }),

    che({
      so: 2, ten: 'Hàm detour(n)', hang: 'lam-quen', taoHam: ['detour'],
      deBai: 'Tạo hàm detour(n) có tham số n: go_down(), đi n ô sang phải, go_up(). Hai bãi, đệm ở hai cột khác nhau: hút mẩu sắt, detour(6) vòng dưới đệm tới thùng, thả.',
      veMaMau: 'Chương trình có sẵn gọi detour(6) nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: [['##.####', '##.####', 'o.....D', '.......'], ['####.##', '####.##', 'o.....D', '.......']], vatChat: [['.......', '.......', 's......', '.......'], ['.......', '.......', 's......', '.......']],
      demTu: [[{ x: 2, y: 0, cuc: 'S' }], [{ x: 4, y: 0, cuc: 'N' }]],
      batDau: P(0, 2),
      maMau: bai(nhieu(NHAT, ['detour(6)'], DAT)),
      loiGiai: bai(nhieu(NHAT, ['detour(6)'], DAT), { hamCuaEmMoi: [hDetour()] }),
      sao: { o: 9, nhip: 18 },
      loiSai: [
        { moTa: 'Chưa tạo hàm detour mà đã gọi nó', baiLam: bai(nhieu(NHAT, ['detour(6)'], DAT)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm đi cứng 4 ô thay cho n: dừng trước thùng hai ô', baiLam: bai(nhieu(NHAT, ['detour(6)'], DAT)), hamCuaEmMoi: [hDetour(['go_down()', 'for i in range(4):', '    go_right()', 'go_up()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong hàm quên go_up(): thả dưới thùng một ô', baiLam: bai(nhieu(NHAT, ['detour(6)'], DAT)), hamCuaEmMoi: [hDetour(['go_down()', 'for i in range(n):', '    go_right()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm: go_down(), for i in range(n): go_right(), go_up().', 'n là số ô đi ở hàng dưới.']
    }),

    che({
      so: 3, ten: 'Hai chuyến, hai độ dài', hang: 'lam-quen', hamCuaEmCan: ['detour'],
      deBai: 'Hai mẩu sắt, hai thùng, hai đệm S ở hàng trên. Chuyến một ngắn: detour(2). Thả xong sang phải một ô là đứng trên mẩu thứ hai, chuyến hai dài: detour(4). Một hàm, hai lần gọi với số khác nhau.',
      veMaMau: 'Chương trình có sẵn làm chuyến một. Viết tiếp chuyến hai.',
      san: ['#.###.##', '#.###.##', 'o.Do...D', '........'], vatChat: ['........', '........', 's..s....', '........'],
      demTu: [{ x: 1, y: 0, cuc: 'S' }, { x: 5, y: 0, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(nhieu(NHAT, ['detour(2)'], DAT)),
      loiGiai: bai(nhieu(NHAT, ['detour(2)'], DAT, ['go_right()'], NHAT, ['detour(4)'], DAT)),
      sao: { o: 15, nhip: 26 },
      loiSai: [
        { moTa: 'Chuyến hai cũng detour(2): thả giữa đường, ngay cột đệm', baiLam: bai(nhieu(NHAT, ['detour(2)'], DAT, ['go_right()'], NHAT, ['detour(2)'], DAT)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chuyến hai đi thẳng không vòng: qua cột đệm thứ hai bị kéo lên', baiLam: bai(nhieu(NHAT, ['detour(2)'], DAT, ['go_right()'], NHAT, LAP(4, 'go_right()'), DAT)), phaiCoMa: KEO_VAT }
      ],
      goiY: ['Sau khi thả, sang phải một ô là đứng trên mẩu thứ hai.', 'Đếm ô từ mẩu thứ hai tới thùng thứ hai: đó là n của chuyến hai.']
    }),

    che({
      so: 4, ten: 'Hàm call_out()', hang: 'luyen', taoHam: ['call_out'],
      deBai: 'Tạo hàm call_out(): đè nút một nhịp (wait()), sang hai ô, hút (magnet_n(), wait()). Nhện đứng sẵn trên nút; mẩu sắt trong hốc trên bị đệm S kéo ra hành lang, nhện tới đứng trên nó mà hút. Rồi về trái một ô, xuống thùng, thả.',
      veMaMau: 'Chương trình có sẵn gọi call_out() nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: SAN_HOC, vatChat: CHAT_HOC, demTu: DEM_HOC,
      batDau: P(0, 1),
      maMau: bai(nhieu(LAY_HOC, DAT)),
      loiGiai: bai(nhieu(LAY_HOC, DAT), { hamCuaEmMoi: [hCall()] }),
      sao: { o: 10, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa tạo hàm call_out mà đã gọi nó', baiLam: bai(nhieu(LAY_HOC, DAT)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm chỉ sang một ô: mẩu sắt ở ô kế, nhện hút ô trống', baiLam: bai(nhieu(LAY_HOC, DAT)), hamCuaEmMoi: [hCall(['wait()', 'go_right()', 'magnet_n()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm năm dòng: wait(), go_right(), go_right(), magnet_n(), wait().', 'Đè nút lúc nào thì nhịp sau đệm chạy, mẩu sắt rơi ra hành lang.']
    }),

    che({
      so: 9, ten: 'Hai hốc bằng hàm', hang: 'bien-the', hamCuaEmCan: ['call_out', 'trail'],
      deBai: 'Hai hốc giống nhau, mỗi hốc một nút và một đệm, nút sau cách thùng trước hai ô. Lặp hai lần: call_out(), về trái một ô, xuống thùng, thả, rồi trail("URR") lên hàng nút và sang nút sau.',
      veMaMau: 'Chương trình có sẵn làm một hốc. Đặt vào vòng for và thêm trail sang nút sau.',
      san: ['##o##o##', 'M..M....', '#D.#D.##'], vatChat: ['..s..s..', '........', '........'],
      demTu: [{ x: 2, y: 2, cuc: 'S', nut: { x: 0, y: 1 } }, { x: 5, y: 2, cuc: 'S', nut: { x: 3, y: 1 } }],
      batDau: P(0, 1),
      maMau: bai(nhieu(LAY_HOC, DAT)),
      loiGiai: bai(LAP(2, nhieu(LAY_HOC, DAT, ['trail("URR")']))),
      sao: { o: 22, nhip: 28 },
      loiSai: [
        { moTa: 'trail("UR"): chưa tới nút sau, hốc hai không mở', baiLam: bai(LAP(2, nhieu(LAY_HOC, DAT, ['trail("UR")']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'trail("RR") quên lên: nhện đi ở hàng thùng, đâm tường', baiLam: bai(LAP(2, nhieu(LAY_HOC, DAT, ['trail("RR")']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thả xong nhện ở thùng, ngay dưới ô cạnh nút: lên một, sang phải hai là nút sau.', 'Hai hốc y hệt: for i in range(2).']
    }),

    che({
      so: 5, ten: 'Sửa call_far()', hang: 'luyen',
      deBai: 'Hàm call_far() của màn phải đè nút một nhịp rồi sang hai ô tới mẩu sắt vừa rơi ra, nhưng Sola viết chỉ sang một ô nên nhện hút ở ô trống. Sửa thân hàm, rồi về trái, xuống thùng, thả.',
      veMaMau: 'Chạy thử: nhện dừng cách mẩu sắt một ô mà hút. Mở Xưởng sửa call_far.',
      san: SAN_HOC, vatChat: CHAT_HOC, demTu: DEM_HOC,
      batDau: P(0, 1),
      maMau: bai(nhieu(['call_far()', 'go_left()', 'go_down()'], DAT), { hamCuaMan: [H('call_far', [], ['wait()', 'go_right()', 'magnet_n()', 'wait()'])] }),
      loiGiai: bai(nhieu(['call_far()', 'go_left()', 'go_down()'], DAT), { hamCuaMan: [H('call_far', [], T_CALL)] }),
      sao: { o: 10, nhip: 11 },
      loiSai: [
        { moTa: 'Sửa thành sang ba ô: đi quá mẩu sắt', baiLam: bai(nhieu(['call_far()', 'go_left()', 'go_down()'], DAT), { hamCuaMan: [H('call_far', [], ['wait()', 'go_right()', 'go_right()', 'go_right()', 'magnet_n()', 'wait()'])] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mẩu sắt rơi ra ngay dưới hốc, cách nút hai ô.', 'Thêm một go_right() trong thân hàm.']
    }),

    che({
      so: 7, ten: 'Hàm shield_run(n)', hang: 'bien-the', taoHam: ['shield_run'], mucTieu: 'toi-co',
      deBai: 'Tạo hàm shield_run(n): bật magnet_n() rồi đi n ô sang phải. Hành lang có đệm N ở hàng trên và tường ở hàng dưới: nam châm bật thì đệm đẩy nhện vào tường, đi thẳng được. Hai bãi, đệm ở hai cột khác nhau: shield_run(8).',
      veMaMau: 'Chương trình có sẵn gọi shield_run(8) nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: [['##.######', '##.######', '........F', '#########'], ['#####.###', '#####.###', '........F', '#########']],
      demTu: [[{ x: 2, y: 0, cuc: 'N' }], [{ x: 5, y: 0, cuc: 'N' }]],
      batDau: P(0, 2),
      maMau: bai(['shield_run(8)']),
      loiGiai: bai(['shield_run(8)'], { hamCuaEmMoi: [hShield()] }),
      sao: { o: 4, nhip: 16 },
      loiSai: [
        { moTa: 'Chưa tạo hàm shield_run mà đã gọi nó', baiLam: bai(['shield_run(8)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm quên magnet_n(): đệm N hút nhện lên', baiLam: bai(['shield_run(8)']), hamCuaEmMoi: [hShield(['for i in range(n):', '    go_right()'])], phaiCoMa: KEO }
      ],
      goiY: ['Thân hàm: magnet_n() rồi for i in range(n): go_right().', 'Nam châm bật thì cùng cực với đệm N, bị đẩy vào tường, đứng vững.']
    }),

    che({
      so: 8, ten: 'Khiên rồi vòng', hang: 'bien-the', hamCuaEmCan: ['shield_run', 'detour'],
      deBai: 'Mẩu sắt ở giữa hành lang, sau cột đệm N (dưới cột đó là tường): shield_run(4) đi qua, tới đứng trên mẩu sắt là nam châm đang bật hút luôn. Tiếp theo là cột đệm S, dưới có sàn: detour(3) vòng xuống tới thùng rồi thả.',
      veMaMau: 'Chương trình có sẵn mới qua đệm N và hút. Viết tiếp.',
      san: ['##.##.##', '##.##.##', '....o..D', '###.....'], vatChat: ['........', '........', '....s...', '........'],
      demTu: [{ x: 2, y: 0, cuc: 'N' }, { x: 5, y: 0, cuc: 'S' }],
      batDau: P(0, 2),
      maMau: bai(['shield_run(4)']),
      loiGiai: bai(nhieu(['shield_run(4)', 'detour(3)'], DAT)),
      sao: { o: 11, nhip: 19 },
      loiSai: [
        { moTa: 'Đi thẳng tiếp bằng shield_run(3): đệm S khác cực, kéo nhện lên', baiLam: bai(nhieu(['shield_run(4)', 'shield_run(3)'], DAT)), phaiCoMa: KEO_VAT },
        { moTa: 'Vòng ngay từ đầu bằng detour(7): dưới cột đệm N là tường, nhện đâm tường', baiLam: bai(nhieu(['detour(7)'], DAT)), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Đệm N có tường chắn phía dưới: dùng khiên. Đệm S có sàn phía dưới: đi vòng.', 'Tới đứng trên mẩu sắt khi nam châm đang bật là hút ngay.']
    }),

    che({
      so: 6, ten: 'Sửa detour_left(n)', hang: 'luyen', hamCuaEmCan: ['detour'],
      deBai: 'Bãi này lật gương: mẩu sắt bên phải, thùng bên trái, đệm S ở giữa hàng trên. Hàm detour_left(n) của màn chép từ detour nên vẫn đi sang phải. Sửa thân hàm, rồi hút, detour_left(4), thả.',
      veMaMau: 'Chạy thử: nhện đi nhầm sang phải, đâm tường. Mở Xưởng sửa detour_left.',
      san: ['##.##', '##.##', 'D...o', '.....'], vatChat: ['.....', '.....', '....s', '.....'],
      demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: P(4, 2),
      maMau: bai(nhieu(NHAT, ['detour_left(4)'], DAT), { hamCuaMan: [H('detour_left', ['n'], T_DETOUR)] }),
      loiGiai: bai(nhieu(NHAT, ['detour_left(4)'], DAT), { hamCuaMan: [H('detour_left', ['n'], ['go_down()', 'for i in range(n):', '    go_left()', 'go_up()'])] }),
      sao: { o: 9, nhip: 14 },
      loiSai: [
        { moTa: 'Không sửa hàm, gọi detour(4) của bạn: vẫn đi sang phải', baiLam: bai(nhieu(NHAT, ['detour(4)'], DAT), { hamCuaMan: [H('detour_left', ['n'], T_DETOUR)] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đi vòng về bên trái thì trong hàm go_left() thay cho go_right().', 'Chỉ cần đổi một dòng trong thân hàm.']
    }),

    che({
      so: 10, ten: 'Bãi từ ba hàm', hang: 'trum', khung: { chinh: 14, moiHam: 10 }, hamCuaEmCan: ['call_out', 'shield_run', 'detour'],
      deBai: 'Trùm. Nhện đứng trên nút: call_out() gọi mẩu sắt trong hốc ra rồi hút, về trái một ô, xuống thùng, thả. Lên lại, shield_run(4) qua cột đệm N (tường phía dưới) tới đứng trên mẩu sắt thứ hai (hút luôn), rồi detour(5) vòng dưới cột đệm S tới thùng thứ hai, thả.',
      veMaMau: 'Chương trình có sẵn làm xong mẩu thứ nhất. Viết tiếp.',
      san: ['##o#.##.###', 'M....o.#..D', '#D.##......', '###########'], vatChat: ['..s........', '.....s.....', '...........', '...........'],
      demTu: [{ x: 2, y: 2, cuc: 'S', nut: { x: 0, y: 1 } }, { x: 4, y: 0, cuc: 'N' }, { x: 7, y: 0, cuc: 'S' }],
      batDau: P(0, 1),
      maMau: bai(nhieu(LAY_HOC, DAT)),
      loiGiai: bai(nhieu(LAY_HOC, DAT, ['go_up()', 'shield_run(4)', 'detour(5)'], DAT)),
      sao: { o: 22, nhip: 36 },
      loiSai: [
        { moTa: 'Mẩu thứ hai đi thẳng hàng trên: đâm tường chắn cột đệm S', baiLam: bai(nhieu(LAY_HOC, DAT, ['go_up()', 'shield_run(4)', 'shield_run(5)'], DAT)), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên lên lại sau khi thả: shield_run chạy ở hàng thùng, đâm tường', baiLam: bai(nhieu(LAY_HOC, DAT, ['shield_run(4)', 'detour(5)'], DAT)), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Ba hàm, ba đoạn: gọi sắt ra, qua đệm N bằng khiên, vòng dưới đệm S.', 'Đếm ô từ mẩu thứ hai tới thùng để biết n của detour.']
    })
  );

  ManHoc.manBaiTu = DS;
  if (laNode) module.exports = ManHoc;
})();
