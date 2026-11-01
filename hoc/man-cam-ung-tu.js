/* ============================================================================
   man-cam-ung-tu.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 3 "Cảm biến từ" (KE-HOACH-MUA-3.md; phiên "Mùa 3" tự viết 29/10;
   PDM3a 31/10 viết lại trên ROBOT PHÂN LOẠI: nhện + nam châm bụng + CẢM BIẾN TỪ, luật part đúng mùa KE-HOACH-PART-DUNG-MUA.md).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) xếp màn theo dòng chương khai đủ thứ tự (1 … 10, mã giữ nguyên).
     - `cam-ung-tu`: chương 1 "Dò sắt": front_metal() trên nhện.
     - `che-cam-ung-tu`: chương 2 "Chế lệnh: dò sắt": hàm của em pick_iron(), seek_row(), next_iron(), col_iron(n).
   Cái mới của gói: CẢM BIẾN TỪ gắn hông nhện (robot.camBien [{ ma: 'tu', o: 'hong' }], hamGoc front_metal; front_pole mở ở gói 7). Nhện không có hướng
   mặt nên đầu dò đo theo CẠNH TRƯỚC CỐ ĐỊNH = hướng xuất phát batDau.huong (lõi 31/10, san-hoc.js phần NAM CHÂM, mục CẢM BIẾN TỪ): mọi màn gói này
   nhện xuất phát quay PHẢI, đầu dò nhìn sang phải 3 ô, front_metal() True khi mẩu ĐẦU TIÊN bên phải là SẮT cách ≤ 2 ô (gỗ, mẩu nam châm, trống: False).
   Khuôn sân: nhện đi XUỐNG dọc cột trái, dãy phế liệu ở cột cách 2 ô bên phải, thùng (D) ở cột giữa cùng hàng mẩu sắt; chuyến lấy = sang phải hai ô, hút,
   về trái một ô, thả, về trái một ô (8 dòng), rồi XUỐNG một hàng (mẩu vừa thả nằm cách đầu dò 1 ô nên front_metal() vẫn True: không xuống là chuyến sau
   nhặt lại chính mẩu đó). Mẩu gỗ / mẩu N trong dãy là mồi: đầu dò bỏ qua (vatCan 'sat': chỉ sắt phải về thùng).
   Máy kiểm: hoc/kiem-man-mua-3.mjs, hoc/kiem-lo-trinh.mjs mục mùa 3, hoc/kiem-part-mua.mjs, hoc/kiem-cam-bien-tu.mjs.
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

  function man(m) {
    m.chuong = m.chuong || 'cam-ung-tu';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HG;
    m.mucTieu = 'dua-vat'; m.vatCan = 'sat';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  var SEEK = ['while not front_metal():', '    go_down()'];                                 // xuống từng hàng tới hàng có sắt bên phải
  var TRIP = nhieu(['go_right()', 'go_right()'], NHAT, ['go_left()'], DAT, ['go_left()']);   // chuyến lấy: sang hai ô, hút, về một ô, thả, về một ô
  var CHUYEN = nhieu(SEEK, TRIP, ['go_down()']);                                            // một mẩu: dò hàng, lấy, xuống hàng kế
  var BD = { x: 0, y: 0, huong: 1 };

  var DS = [
    /* ================================================= chương cam-ung-tu "Dò sắt" ================================================= */
    man({
      so: 1, ten: 'Đầu dò thấy sắt', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Robot phân loại gắn thêm CẢM BIẾN TỪ ở hông phải: đầu dò nhìn sang phải ba ô. front_metal() trả lời True khi mẩu đầu tiên bên phải là SẮT cách tới 2 ô; gỗ, mẩu nam châm hay không có gì thì False. Bấm Chạy: đầu dò thấy sắt nên nhện sang lấy, mang về thùng ở giữa.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn đầu dò chữ U sáng lên khi đọc.',
      san: ['.Do'], vatChat: ['..s'],
      batDau: BD,
      maMau: bai(nhieu(['if front_metal():'], thut(TRIP.slice(0, 7)))),
      loiGiai: bai(nhieu(['if front_metal():'], thut(TRIP.slice(0, 7)))),
      sao: { o: 8, nhip: 8 },
      goiY: ['front_metal() chỉ trả lời True hay False, không tốn nhịp.', 'Nhện không quay được: đầu dò luôn nhìn về phía nhện xuất phát (bên phải).']
    }),

    man({
      so: 2, ten: 'Sắt hay gỗ', hang: 'lam-quen',
      deBai: 'Hai bãi. Bên phải nhện có một mẩu cách 2 ô: bãi 1 là sắt, bãi 2 là gỗ còn mẩu sắt nằm ở hàng dưới. Nếu đầu dò KHÔNG thấy sắt thì xuống một hàng. Rồi sang lấy mẩu sắt, mang về thùng cùng hàng.',
      veMaMau: 'Chương trình có sẵn sang lấy luôn. Chạy thử: bãi 2 bên phải là gỗ, nam châm không hút được. Thêm if not front_metal(): go_down() ở đầu.',
      san: [['.Do', '...'], ['..o', '.Do']], vatChat: [['..s', '...'], ['..g', '..s']],
      batDau: BD,
      maMau: bai(TRIP.slice(0, 7)),
      loiGiai: bai(nhieu(['if not front_metal():', '    go_down()'], TRIP.slice(0, 7))),
      sao: { o: 9, nhip: 10 },
      loiSai: [
        { moTa: 'Sang lấy luôn: bãi 2 đứng trên mẩu gỗ mà hút, về tay không', baiLam: bai(TRIP.slice(0, 7)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên not: bãi 1 đầu dò thấy sắt mà nhện lại xuống, hàng dưới trống', baiLam: bai(nhieu(['if front_metal():', '    go_down()'], TRIP.slice(0, 7))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['not front_metal() là True khi bên phải KHÔNG phải sắt.', 'Xuống hay không thì sau đó vẫn sang lấy, về thả như nhau.']
    }),

    man({
      so: 3, ten: 'Xuống tới khi thấy sắt', hang: 'lam-quen',
      deBai: 'Hai bãi, mẩu sắt nằm ở một hàng nào đó dưới cột nhện, mỗi bãi một hàng khác. Xuống từng hàng tới khi đầu dò thấy sắt: while not front_metal(): go_down(). Rồi sang lấy, về thùng.',
      veMaMau: 'Chương trình có sẵn xuống cứng một hàng. Chạy thử: bãi 2 mẩu sắt ở sâu hơn. Thay if bằng while.',
      san: [['...', '.Do', '...', '...'], ['...', '...', '...', '.Do']], vatChat: [['...', '..s', '...', '...'], ['...', '...', '...', '..s']],
      batDau: BD,
      maMau: bai(nhieu(['if not front_metal():', '    go_down()'], TRIP.slice(0, 7))),
      loiGiai: bai(nhieu(SEEK, TRIP.slice(0, 7))),
      sao: { o: 9, nhip: 14 },
      loiSai: [
        { moTa: 'Chỉ hỏi một lần bằng if: bãi 2 nhện dừng ở hàng trống', baiLam: bai(nhieu(['if not front_metal():', '    go_down()'], TRIP.slice(0, 7))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Bỏ chữ not: chưa thấy sắt thì nhện không xuống bước nào', baiLam: bai(nhieu(['while front_metal():', '    go_down()'], TRIP.slice(0, 7))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['while: còn chưa thấy sắt thì còn xuống.', 'Thấy sắt là dừng ngay ở hàng đó, mẩu sắt cách 2 ô bên phải.']
    }),

    man({
      so: 4, ten: 'Hai mẩu, xuống hàng kế', hang: 'luyen',
      deBai: 'Hai mẩu sắt ở hai hàng liền nhau. Mỗi chuyến: xuống tới khi thấy sắt, sang lấy, về thả, rồi XUỐNG một hàng nữa: mẩu vừa thả nằm ngay bên phải nên đầu dò vẫn thấy sắt, không xuống là chuyến sau nhặt lại chính nó. Lặp hai chuyến.',
      veMaMau: 'Chương trình có sẵn làm một chuyến. Đặt vào vòng for và thêm go_down() cuối chuyến.',
      san: ['.Do', '.Do', '...'], vatChat: ['..s', '..s', '...'],
      batDau: BD,
      maMau: bai(nhieu(SEEK, TRIP)),
      loiGiai: bai(LAP(2, CHUYEN)),
      sao: { o: 12, nhip: 20 },
      loiSai: [
        { moTa: 'Quên xuống sau khi thả: chuyến hai nhặt lại mẩu vừa thả', baiLam: bai(LAP(2, nhieu(SEEK, TRIP))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không có while, chỉ xuống cứng một hàng mỗi chuyến: chuyến hai hút ở hàng trống', baiLam: bai(LAP(2, nhieu(['go_down()'], TRIP, ['go_down()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mẩu đã thả nằm cách đầu dò 1 ô: front_metal() vẫn True.', 'Cuối mỗi chuyến go_down() để rời hàng vừa xong.']
    }),

    man({
      so: 5, ten: 'Gỗ và N là mồi', hang: 'luyen',
      deBai: 'Dãy bên phải có cả mẩu gỗ và mẩu chữ N xen giữa hai mẩu sắt. Đầu dò chỉ báo SẮT: gỗ và N cho False nên nhện tự đi qua. Lặp hai chuyến như màn trước.',
      veMaMau: 'Chương trình có sẵn mới làm một chuyến. Đặt vào vòng for.',
      san: ['..o', '.Do', '..o', '..o', '.Do'], vatChat: ['..g', '..s', '..N', '..g', '..s'],
      batDau: BD,
      maMau: bai(CHUYEN),
      loiGiai: bai(LAP(2, CHUYEN)),
      sao: { o: 12, nhip: 26 },
      loiSai: [
        { moTa: 'Không hỏi đầu dò, xuống cứng một hàng mỗi chuyến: chuyến hai đứng trên mẩu N mà hút', baiLam: bai(LAP(2, nhieu(['go_down()'], TRIP, ['go_down()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mẩu gỗ và mẩu N không phải sắt: front_metal() là False.', 'Chương trình y như màn trước, chỉ sân có thêm mồi.']
    }),

    man({
      so: 6, ten: 'Ba bãi, ba độ sâu', hang: 'luyen',
      deBai: 'Ba bãi, mỗi bãi hai mẩu sắt ở những hàng khác nhau, xen mồi gỗ. Một chương trình đúng cả ba bãi: đừng đếm hàng, hãy hỏi đầu dò.',
      veMaMau: 'Chương trình có sẵn xuống cứng số hàng của bãi 1. Chạy thử rồi đổi sang hỏi đầu dò.',
      san: [['.Do', '..o', '.Do', '...'], ['..o', '.Do', '...', '.Do'], ['...', '..o', '.Do', '.Do']],
      vatChat: [['..s', '..g', '..s', '...'], ['..g', '..s', '...', '..s'], ['...', '..g', '..s', '..s']],
      batDau: BD,
      maMau: bai(LAP(2, nhieu(TRIP, ['go_down()', 'go_down()']))),
      loiGiai: bai(LAP(2, CHUYEN)),
      sao: { o: 12, nhip: 24 },
      loiSai: [
        { moTa: 'Đếm hàng theo bãi 1: bãi 2 và 3 hút ở hàng trống hay hàng gỗ', baiLam: bai(LAP(2, nhieu(TRIP, ['go_down()', 'go_down()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mỗi bãi mẩu sắt ở hàng khác: chỉ while not front_metal() mới đúng cả ba.', 'Hai chuyến giống nhau: for i in range(2).']
    }),

    man({
      so: 7, ten: 'Sửa vòng dò', hang: 'bien-the',
      deBai: 'Sola viết chương trình hai chuyến nhưng vòng dò hỏi ngược: while front_metal() nên nhện đứng yên không xuống. Hai bãi, sửa cho đúng.',
      veMaMau: 'Chạy thử: nhện sang lấy ngay ở hàng trống. Chạm điều kiện của while, thêm not.',
      san: [['...', '.Do', '..o', '.Do'], ['...', '..o', '.Do', '.Do']], vatChat: [['...', '..s', '..g', '..s'], ['...', '..g', '..s', '..s']],
      batDau: BD,
      maMau: bai(LAP(2, nhieu(['while front_metal():', '    go_down()'], TRIP, ['go_down()']))),
      loiGiai: bai(LAP(2, CHUYEN)),
      sao: { o: 12, nhip: 24 },
      loiSai: [
        { moTa: 'Giữ while front_metal(): chưa thấy sắt thì không xuống, hút ở hàng trống', baiLam: bai(LAP(2, nhieu(['while front_metal():', '    go_down()'], TRIP, ['go_down()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Sửa thành if not front_metal(): chỉ xuống một hàng, bãi 2 chuyến đầu hút ở hàng gỗ', baiLam: bai(LAP(2, nhieu(['if not front_metal():', '    go_down()'], TRIP, ['go_down()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xuống khi CHƯA thấy sắt: while not front_metal().', 'Chỉ cần thêm một chữ not.']
    }),

    man({
      so: 8, ten: 'Ba mẩu sắt', hang: 'bien-the',
      deBai: 'Hai bãi, mỗi bãi ba mẩu sắt xen mồi gỗ và N ở những hàng khác nhau. Lặp ba chuyến dò, lấy, xuống.',
      veMaMau: 'Chương trình có sẵn lặp hai chuyến. Sửa số chuyến.',
      san: [['.Do', '..o', '.Do', '..o', '.Do'], ['..o', '.Do', '.Do', '..o', '.Do']],
      vatChat: [['..s', '..g', '..s', '..N', '..s'], ['..N', '..s', '..s', '..g', '..s']],
      batDau: BD,
      maMau: bai(LAP(2, CHUYEN)),
      loiGiai: bai(LAP(3, CHUYEN)),
      sao: { o: 12, nhip: 36 },
      loiSai: [
        { moTa: 'Lặp hai chuyến: mẩu sắt thứ ba còn nằm đó', baiLam: bai(LAP(2, CHUYEN)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Bỏ go_down() cuối chuyến: chuyến sau nhặt lại mẩu vừa thả', baiLam: bai(LAP(3, nhieu(SEEK, TRIP))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Ba mẩu sắt: for i in range(3).', 'Mồi gỗ và N đầu dò tự bỏ qua.']
    }),

    man({
      so: 9, ten: 'Thùng bên phải', hang: 'bien-the', khung: { chinh: 14, moiHam: 10 },
      deBai: 'Bãi này thùng nằm BÊN PHẢI mẩu sắt (cách đầu dò 3 ô). Chuyến lấy đổi: sang hai ô, hút, sang thêm một ô, thả, về ba ô. Hai bãi, hai mẩu sắt, mồi xen giữa. Thùng xa 3 ô nên thả xong đầu dò không thấy nó nữa.',
      veMaMau: 'Chương trình có sẵn vẫn thả về bên trái như cũ. Sửa chuyến lấy.',
      san: [['..o.', '..oD', '..o.', '..oD'], ['..oD', '..o.', '..o.', '..oD']],
      vatChat: [['..g.', '..s.', '..N.', '..s.'], ['..s.', '..g.', '..N.', '..s.']],
      batDau: BD,
      maMau: bai(LAP(2, CHUYEN)),
      loiGiai: bai(LAP(2, nhieu(SEEK, ['go_right()', 'go_right()'], NHAT, ['go_right()'], DAT, ['go_left()', 'go_left()', 'go_left()', 'go_down()']))),
      sao: { o: 14, nhip: 28 },
      loiSai: [
        { moTa: 'Thả về bên trái như cũ: ô đó không phải thùng', baiLam: bai(LAP(2, CHUYEN)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Về chỉ hai ô: nhện lệch khỏi cột dò, chuyến sau hút sai chỗ', baiLam: bai(LAP(2, nhieu(SEEK, ['go_right()', 'go_right()'], NHAT, ['go_right()'], DAT, ['go_left()', 'go_left()', 'go_down()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sang hai ô là tới mẩu sắt, sang thêm một ô là tới thùng.', 'Về đủ ba ô để lại đứng ở cột dò.']
    }),

    man({
      so: 10, ten: 'Bãi dò sắt', hang: 'trum', khung: { chinh: 14, moiHam: 10 },
      deBai: 'Trùm. Ba bãi, mỗi bãi ba mẩu sắt ở những hàng khác nhau, xen đầy mồi gỗ và N. Ba chuyến dò, lấy, xuống; thùng ở giữa như các màn đầu.',
      veMaMau: 'Chương trình có sẵn mới làm một chuyến. Viết đủ ba chuyến.',
      san: [['.Do', '..o', '.Do', '..o', '.Do', '...'], ['..o', '.Do', '..o', '.Do', '...', '.Do'], ['..o', '..o', '.Do', '.Do', '..o', '.Do']],
      vatChat: [['..s', '..g', '..s', '..N', '..s', '...'], ['..g', '..s', '..N', '..s', '...', '..s'], ['..N', '..g', '..s', '..s', '..g', '..s']],
      batDau: BD,
      maMau: bai(CHUYEN),
      loiGiai: bai(LAP(3, CHUYEN)),
      sao: { o: 12, nhip: 38 },
      loiSai: [
        { moTa: 'Xuống cứng hai hàng mỗi chuyến theo bãi 1: bãi 2, 3 hút ở hàng mồi', baiLam: bai(LAP(3, nhieu(TRIP, ['go_down()', 'go_down()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Lặp hai chuyến: mẩu sắt thứ ba còn nằm đó', baiLam: bai(LAP(2, CHUYEN)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đừng đếm hàng: hỏi đầu dò.', 'Mỗi chuyến: dò, lấy, xuống; lặp ba lần.']
    })
  ];

  /* ================================================= chương che-cam-ung-tu "Chế lệnh: dò sắt" =================================================
     Hàm của em mới: pick_iron() (chuyến lấy 7 dòng: sang hai, hút, về một, thả, về một), seek_row() (xuống tới khi thấy sắt), next_iron() (seek_row, pick_iron,
     go_down: trọn một mẩu), col_iron(n) (n lần next_iron: cả một cột). Sân dùng lại khuôn chương Dò sắt; hai cột thì trail(...) sang cột kế (ôn gói 1). */
  function che(m) { m.chuong = 'che-cam-ung-tu'; return man(m); }
  var T_PICK = TRIP.slice(0, 7).concat(['go_left()']);
  function hPick(than) { return H('pick_iron', [], than || T_PICK); }
  function hSeek(than) { return H('seek_row', [], than || SEEK); }
  function hNext(than) { return H('next_iron', [], than || ['seek_row()', 'pick_iron()', 'go_down()']); }
  function hCol(than) { return H('col_iron', ['n'], than || ['for i in range(n):', '    next_iron()']); }
  var SAN_2 = [['...', '.Do', '...', '.Do', '...'], ['...', '..o', '.Do', '...', '.Do']], CHAT_2 = [['...', '..s', '...', '..s', '...'], ['...', '..g', '..s', '...', '..s']];

  DS.push(
    che({
      so: 1, ten: 'Hàm chuyến lấy', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['grab_row'],
      deBai: 'Hàm grab_row() của màn gói cả chuyến lấy: sang hai ô, hút, về một ô, thả, về một ô. Chương trình chỉ cần dò tới hàng có sắt rồi gọi nó. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Mở Xưởng xem grab_row, rồi bấm Chạy.',
      san: ['...', '...', '.Do', '...'], vatChat: ['...', '...', '..s', '...'],
      batDau: BD,
      maMau: bai(nhieu(SEEK, ['grab_row()']), { hamCuaMan: [H('grab_row', [], T_PICK)] }),
      loiGiai: bai(nhieu(SEEK, ['grab_row()']), { hamCuaMan: [H('grab_row', [], T_PICK)] }),
      sao: { o: 11, nhip: 12 },
      goiY: ['Gói nhiều dòng hay dùng vào một hàm thì chương trình chính ngắn lại.', 'Màn sau bạn tự tạo hàm của mình.']
    }),

    che({
      so: 2, ten: 'Hàm pick_iron()', hang: 'lam-quen', taoHam: ['pick_iron'],
      deBai: 'Tạo hàm pick_iron(): sang hai ô, hút, về một ô, thả, về một ô. Hai bãi: dò tới hàng có sắt rồi gọi pick_iron().',
      veMaMau: 'Chương trình có sẵn gọi pick_iron() nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: [['...', '.Do', '...'], ['...', '...', '...', '...', '.Do']], vatChat: [['...', '..s', '...'], ['...', '...', '...', '...', '..s']],
      batDau: BD,
      maMau: bai(nhieu(SEEK, ['pick_iron()'])),
      loiGiai: bai(nhieu(SEEK, ['pick_iron()']), { hamCuaEmMoi: [hPick()] }),
      sao: { o: 11, nhip: 16 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pick_iron mà đã gọi nó', baiLam: bai(nhieu(SEEK, ['pick_iron()'])), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm chỉ sang một ô rồi hút: mẩu sắt cách 2 ô, hút ở ô trống', baiLam: bai(nhieu(SEEK, ['pick_iron()'])), hamCuaEmMoi: [hPick(nhieu(['go_right()'], NHAT, ['go_left()'], DAT))], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm tám dòng như chuyến lấy ở chương trước.', 'Hàm kết thúc khi nhện đã về cột dò.']
    }),

    che({
      so: 3, ten: 'Hàm seek_row()', hang: 'lam-quen', taoHam: ['seek_row'], hamCuaEmCan: ['pick_iron'],
      deBai: 'Tạo hàm seek_row(): xuống tới khi đầu dò thấy sắt (while not front_metal(): go_down()). Chương trình chính chỉ còn hai dòng: seek_row() rồi pick_iron(). Hai bãi.',
      veMaMau: 'Chương trình có sẵn gọi seek_row() nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: [['...', '.Do', '...'], ['...', '...', '...', '...', '...', '...', '.Do']], vatChat: [['...', '..s', '...'], ['...', '...', '...', '...', '...', '...', '..s']],
      batDau: BD,
      maMau: bai(['seek_row()', 'pick_iron()']),
      loiGiai: bai(['seek_row()', 'pick_iron()'], { hamCuaEmMoi: [hSeek()] }),
      sao: { o: 12, nhip: 20 },
      loiSai: [
        { moTa: 'Chưa tạo hàm seek_row mà đã gọi nó', baiLam: bai(['seek_row()', 'pick_iron()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm xuống cứng một hàng: bãi 2 mẩu sắt ở sâu hơn', baiLam: bai(['seek_row()', 'pick_iron()']), hamCuaEmMoi: [hSeek(['go_down()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm hai dòng: while not front_metal(): rồi go_down().', 'Hàm dừng khi mẩu sắt cách đầu dò 2 ô.']
    }),

    che({
      so: 4, ten: 'Hai mẩu bằng hàm', hang: 'luyen', hamCuaEmCan: ['seek_row', 'pick_iron'],
      deBai: 'Hai bãi, mỗi bãi hai mẩu sắt, có mồi gỗ. Dùng seek_row() và pick_iron() trong vòng for; nhớ go_down() cuối chuyến để rời hàng vừa xong.',
      veMaMau: 'Chương trình có sẵn làm một chuyến bằng hàm. Đặt vào vòng for.',
      san: SAN_2, vatChat: CHAT_2,
      batDau: BD,
      maMau: bai(['seek_row()', 'pick_iron()']),
      loiGiai: bai(LAP(2, ['seek_row()', 'pick_iron()', 'go_down()'])),
      sao: { o: 14, nhip: 26 },
      loiSai: [
        { moTa: 'Quên go_down(): chuyến hai nhặt lại mẩu vừa thả', baiLam: bai(LAP(2, ['seek_row()', 'pick_iron()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Một chuyến là ba dòng: seek_row(), pick_iron(), go_down().', 'Lặp hai lần.']
    }),

    che({
      so: 5, ten: 'Sửa find_row()', hang: 'luyen', hamCuaEmCan: ['pick_iron'],
      deBai: 'Hàm find_row() của màn phải xuống tới khi thấy sắt, nhưng Sola viết thiếu chữ not nên nhện đứng yên. Sửa thân hàm cho đúng ở cả hai bãi.',
      veMaMau: 'Chạy thử: nhện sang lấy ngay ở hàng trống. Mở Xưởng sửa find_row.',
      san: [['...', '.Do', '...'], ['...', '...', '...', '...', '...', '...', '.Do']], vatChat: [['...', '..s', '...'], ['...', '...', '...', '...', '...', '...', '..s']],
      batDau: BD,
      maMau: bai(['find_row()', 'pick_iron()'], { hamCuaMan: [H('find_row', [], ['while front_metal():', '    go_down()'])] }),
      loiGiai: bai(['find_row()', 'pick_iron()'], { hamCuaMan: [H('find_row', [], SEEK)] }),
      sao: { o: 12, nhip: 20 },
      loiSai: [
        { moTa: 'Đổi while thành if not: chỉ xuống một hàng, bãi 2 chưa tới sắt', baiLam: bai(['find_row()', 'pick_iron()'], { hamCuaMan: [H('find_row', [], ['if not front_metal():', '    go_down()'])] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xuống khi CHƯA thấy sắt: while not front_metal().', 'Chỉ cần thêm một chữ not trong thân hàm.']
    }),

    che({
      so: 6, ten: 'Hàm next_iron()', hang: 'luyen', taoHam: ['next_iron'], hamCuaEmCan: ['seek_row', 'pick_iron'],
      deBai: 'Tạo hàm next_iron() làm trọn một mẩu: seek_row(), pick_iron(), go_down(). Hai bãi, hai mẩu sắt có mồi: gọi next_iron() hai lần bằng vòng for.',
      veMaMau: 'Chương trình có sẵn gọi next_iron() nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: [['...', '.Do', '...', '...', '.Do', '...'], ['...', '..o', '.Do', '...', '...', '.Do']], vatChat: [['...', '..s', '...', '...', '..s', '...'], ['...', '..g', '..s', '...', '...', '..s']],
      batDau: BD,
      maMau: bai(LAP(2, 'next_iron()')),
      loiGiai: bai(LAP(2, 'next_iron()'), { hamCuaEmMoi: [hNext()] }),
      sao: { o: 15, nhip: 28 },
      loiSai: [
        { moTa: 'Chưa tạo hàm next_iron mà đã gọi nó', baiLam: bai(LAP(2, 'next_iron()')), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm thiếu go_down(): chuyến hai nhặt lại mẩu vừa thả', baiLam: bai(LAP(2, 'next_iron()')), hamCuaEmMoi: [hNext(['seek_row()', 'pick_iron()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm ba dòng gọi ba việc: dò, lấy, xuống.', 'Hàm gọi hàm: next_iron() dùng seek_row() và pick_iron() của bạn.']
    }),

    che({
      so: 7, ten: 'Hàm col_iron(n)', hang: 'bien-the', taoHam: ['col_iron'], hamCuaEmCan: ['next_iron', 'trail'],
      deBai: 'Tạo hàm col_iron(n) có tham số: for i in range(n): next_iron(). Bãi có hai cột phế liệu: cột trái hai mẩu sắt, cột phải một mẩu. Làm cột trái bằng col_iron(2), trail("RRRR") sang cột phải, rồi col_iron(1).',
      veMaMau: 'Chương trình có sẵn gọi col_iron(2) và col_iron(1) nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: ['.Do...#', '.Do...#', '......o', '.....Do'], vatChat: ['..s....', '..s....', '......g', '......s'],
      batDau: BD,
      maMau: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(1)']),
      loiGiai: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(1)'], { hamCuaEmMoi: [hCol()] }),
      sao: { o: 28, nhip: 42 },
      loiSai: [
        { moTa: 'Chưa tạo hàm col_iron mà đã gọi nó', baiLam: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm lặp cứng 1 lần thay cho n: cột trái còn sót một mẩu', baiLam: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(1)']), hamCuaEmMoi: [hCol(['for i in range(1):', '    next_iron()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['n là số mẩu sắt của cột: for i in range(n).', 'Sau cột trái nhện đứng ở cột dò, sang phải bốn ô là cột dò kế.']
    }),

    che({
      so: 8, ten: 'Hai cột, hai bãi', hang: 'bien-the', hamCuaEmCan: ['col_iron', 'trail'],
      deBai: 'Hai bãi, mỗi bãi hai cột phế liệu, mỗi cột hai mẩu sắt ở những hàng khác nhau, xen mồi. Làm cột trái, trail("RRRR") sang cột phải, làm nốt.',
      veMaMau: 'Chương trình có sẵn làm xong cột trái. Viết tiếp.',
      san: [['.Do.###', '..o.###', '.Do.###', '.....Do', '......o', '.....Do'], ['..o.###', '.Do.###', '.Do.###', '......o', '.....Do', '.....Do']],
      vatChat: [['..s....', '..g....', '..s....', '......s', '......N', '......s'], ['..N....', '..s....', '..s....', '......g', '......s', '......s']],
      batDau: BD,
      maMau: bai(['col_iron(2)']),
      loiGiai: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(2)']),
      sao: { o: 28, nhip: 56 },
      loiSai: [
        { moTa: 'Quên trail: cột trái hết sắt mà nhện còn dò mãi', baiLam: bai(['col_iron(2)', 'col_iron(2)']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'trail("RRR"): sang chưa tới cột dò kế, đầu dò không thấy sắt nên dò mãi', baiLam: bai(['col_iron(2)', 'trail("RRR")', 'col_iron(2)']), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['col_iron(2) cho mỗi cột; giữa hai cột là trail("RRRR").', 'Cột phải bắt đầu dò từ hàng nhện đang đứng sau cột trái.']
    }),

    che({
      so: 9, ten: 'Sửa cột trái cột phải', hang: 'bien-the', hamCuaEmCan: ['col_iron', 'trail'],
      deBai: 'Sola viết chương trình hai cột nhưng đếm nhầm số mẩu: cột trái ba mẩu, cột phải một mẩu. Hai bãi. Chạy thử, sửa hai số trong lời gọi col_iron.',
      veMaMau: 'Chạy thử: cột trái còn sót một mẩu, cột phải nhện đi quá đáy. Sửa hai số.',
      san: [['.......', '.Do....', '.Do....', '..o....', '.Do....', '......o', '.....Do'], ['.Do....', '..o....', '.Do....', '.Do....', '.....Do', '......o', '.......']],
      vatChat: [['.......', '..s....', '..s....', '..g....', '..s....', '......g', '......s'], ['..s....', '..N....', '..s....', '..s....', '......s', '......g', '.......']],
      batDau: BD,
      maMau: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(2)']),
      loiGiai: bai(['col_iron(3)', 'trail("RRRR")', 'col_iron(1)']),
      sao: { o: 28, nhip: 58 },
      loiSai: [
        { moTa: 'Giữ col_iron(2) cho cột trái: sót một mẩu', baiLam: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đổi ngược hai số: cột trái sót hai mẩu', baiLam: bai(['col_iron(1)', 'trail("RRRR")', 'col_iron(3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đếm mẩu SẮT của mỗi cột, bỏ qua mồi.', 'Đối số n của col_iron là số chuyến của cột đó.']
    }),

    che({
      so: 10, ten: 'Xưởng dò sắt', hang: 'trum', khung: { chinh: 14, moiHam: 10 }, hamCuaEmCan: ['col_iron', 'trail', 'next_iron'],
      deBai: 'Trùm. Ba bãi, mỗi bãi ba cột phế liệu đầy mồi: cột trái hai mẩu sắt, cột giữa một mẩu, cột phải hai mẩu. Ba lần col_iron, giữa các cột trail("RRRR").',
      veMaMau: 'Chương trình có sẵn làm xong cột trái. Viết tiếp hai cột.',
      san: [['...........', '.Do........', '..o........', '.Do........', '......o....', '.....Do....', '.........Do', '..........o', '.........Do'],
        ['..o........', '.Do........', '.Do........', '.....Do....', '......o....', '..........o', '.........Do', '.........Do', '...........'],
        ['...........', '..o........', '.Do........', '.Do........', '......o....', '.....Do....', '.........Do', '..........o', '.........Do']],
      vatChat: [['...........', '..s........', '..g........', '..s........', '......N....', '......s....', '..........s', '..........g', '..........s'],
        ['..g........', '..s........', '..s........', '......s....', '......N....', '..........g', '..........s', '..........s', '...........'],
        ['...........', '..N........', '..s........', '..s........', '......g....', '......s....', '..........s', '..........N', '..........s']],
      batDau: BD,
      maMau: bai(['col_iron(2)']),
      loiGiai: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(1)', 'trail("RRRR")', 'col_iron(2)']),
      sao: { o: 30, nhip: 80 },
      loiSai: [
        { moTa: 'Cột giữa gọi col_iron(2): chỉ có một mẩu, chuyến hai dò mãi không thấy sắt', baiLam: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(2)', 'trail("RRRR")', 'col_iron(2)']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên trail giữa cột giữa và cột phải: cột giữa hết sắt mà còn dò mãi', baiLam: bai(['col_iron(2)', 'trail("RRRR")', 'col_iron(1)', 'col_iron(2)']), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Mỗi cột một lời gọi col_iron với số mẩu sắt của cột đó.', 'Giữa hai cột: trail("RRRR").']
    })
  );

  ManHoc.manCamUngTu = DS;
  if (laNode) module.exports = ManHoc;
})();
