/* ============================================================================
   man-than-nhen.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 1 "Nhện" (KE-HOACH-MUA-3.md; phiên "Mùa 3" tự viết, 29/10).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) xếp màn: dòng chương trong MUA_3 khai ĐỦ thứ tự 10 màn (có sẵn xen màn mới).
     - `nhen`: chương 1 "Thân nhện": màn mới khai so từ 11 (mã nhen.1 … nhen.10 đã có). Thứ tự: 11 (trình diễn) · 1 · 12 · 13 · 14 · 15 · 8 · 16 · 17 · 18 (trùm).
       Cái mới của gói: thân nhện đi 4 hướng không quay (go_up / go_down / go_left / go_right, mỗi bước 2 nhịp). Ôn mùa 1, 2: for, hàm của em,
       hàm có tham số, băng chuyền. CHƯA có crouch / stand (gói 5), chưa có chuỗi (chương 2).
     - `chuoi-nhen`: chương 2 "Chuỗi cho nhện" (nhen.4, nhen.7 có sẵn + màn mới so 1 …). Cái mới: CHUỖI LÀM DỮ LIỆU (for c in "…", so chữ d == "U",
       biến giữ chuỗi, hàm nhận chuỗi).
   Mỗi màn khai `chuong` và `so`; mã `ma` = chuong + '.' + so là khóa lưu sao, KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có.
   Luật nhện (san-hoc.js phần NHỆN): đi 4 hướng tuyệt đối, mỗi bước 2 nhịp, sang ô mới cuối nhịp 2; wait() 1 nhịp. Băng chuyền đẩy nhện như xe:
   đứng trên băng đủ 2 nhịp thì bị đẩy 1 ô (kể cả giữa hai nhịp của một bước): đi XUÔI băng thì mỗi bước tiến 2 ô, đi NGƯỢC thì kẹt.
   Máy kiểm: hoc/kiem-man-mua-3.mjs (chấm từng màn mới), hoc/kiem-lo-trinh.mjs mục mùa 3.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các dòng `than` `n` lần. */
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }

  // hàm của em mới của chương nhen
  var T_STEP_DOWN = ['go_right()', 'go_down()'];
  var T_STAIRS = ['for i in range(n):', '    go_right()', '    go_up()'];
  function hStepDown(than) { return H('step_down', [], than || T_STEP_DOWN); }
  function hStairs(than) { return H('stairs', ['n'], than || T_STAIRS); }

  function man(m) {
    m.chuong = m.chuong || 'nhen';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: null };
    m.hamGoc = m.hamGoc || HAM_NHEN;
    m.moXuong = true; m.camHamCuaEm = false;
    m.nhipTheoLoiGiai = true;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương nhen "Thân nhện" ================================================= */
    man({
      so: 11, ten: 'Nhện đi bốn hướng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Nhện không có mũi xe, không cần quay. go_right() sang phải, go_down() xuống, go_left() sang trái, go_up() lên. Bấm Chạy xem nhện đi vòng quanh bức tường tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn nhện đi đủ bốn hướng mà thân không xoay.',
      san: ['...', 'F#.', '...'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['go_right()', 'go_right()', 'go_down()', 'go_down()', 'go_left()', 'go_left()', 'go_up()']),
      loiGiai: bai(['go_right()', 'go_right()', 'go_down()', 'go_down()', 'go_left()', 'go_left()', 'go_up()']),
      sao: { o: 7, nhip: 14 },
      goiY: ['Mỗi lệnh đi đúng một ô theo hướng của màn hình, mất 2 nhịp.', 'Xe hai bánh phải quay rồi mới đi; nhện thì không cần quay.']
    }),

    man({
      so: 12, ten: 'Vòng qua tường', hang: 'lam-quen',
      deBai: 'Bức tường chắn giữa nhện và cờ. Đi xuống dưới, sang phải, rồi đi lên tới cờ. Dùng vòng for cho mỗi đoạn thẳng.',
      veMaMau: 'Chương trình có sẵn mới đi xuống hai ô. Chạy thử rồi viết tiếp.',
      san: ['.##F', '.##.', '....'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(LAP(2, 'go_down()')),
      loiGiai: bai(nhieu(LAP(2, 'go_down()'), LAP(3, 'go_right()'), LAP(2, 'go_up()'))),
      sao: { o: 6, nhip: 14 },
      loiGiaiKhac: { moTa: 'Viết từng bước một, không dùng vòng lặp', baiLam: bai(nhieu(lap('go_down()', 2), lap('go_right()', 3), lap('go_up()', 2))) },
      loiSai: [
        { moTa: 'Quên đoạn đi lên: nhện dừng ở góc dưới, chưa tới cờ', baiLam: bai(nhieu(LAP(2, 'go_down()'), LAP(3, 'go_right()'))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sang phải trước khi xuống: nhện đâm tường', baiLam: bai(nhieu(LAP(3, 'go_right()'), LAP(2, 'go_down()'), LAP(2, 'go_up()'))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đi lên dùng go_down(): nhện đi ngược hướng', baiLam: bai(nhieu(LAP(2, 'go_down()'), LAP(3, 'go_right()'), LAP(2, 'go_down()'))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đếm ô từng đoạn: xuống 2, sang phải 3, lên 2.', 'Mỗi đoạn là một vòng for với đúng một lệnh đi bên trong.']
    }),

    man({
      so: 13, ten: 'Hàm bước xuống', hang: 'luyen', taoHam: ['step_down'], hamCuaEmCan: [],
      deBai: 'Bậc thang đi xuống: mỗi bậc là sang phải một ô rồi xuống một ô. Tạo hàm step_down() làm đúng một bậc, rồi gọi nó bốn lần để xuống tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi step_down() bốn lần, nhưng em chưa có hàm đó. Bấm Hàm mới, đặt tên step_down, ghép thân hàm ở Xưởng.',
      san: ['..###', '#..##', '##..#', '###..', '####F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(LAP(4, 'step_down()')),
      loiGiai: bai(LAP(4, 'step_down()'), { hamCuaEmMoi: [hStepDown()] }),
      sao: { o: 4, nhip: 16 },
      loiSai: [
        { moTa: 'Chưa tạo hàm step_down mà đã gọi nó', baiLam: bai(LAP(4, 'step_down()')), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm xuống trước rồi mới sang phải: nhện đâm tường', baiLam: bai(LAP(4, 'step_down()')), hamCuaEmMoi: [hStepDown(['go_down()', 'go_right()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Gọi hàm thiếu một lần: nhện dừng ở bậc cuối', baiLam: bai(LAP(3, 'step_down()')), hamCuaEmMoi: [hStepDown()], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Một bậc là hai bước: go_right() rồi go_down().', 'Có bốn bậc nên gọi step_down() bốn lần.']
    }),

    man({
      so: 14, ten: 'Bậc thang lên', hang: 'luyen', taoHam: ['stairs'], hamCuaEmCan: [],
      deBai: 'Hai đoạn bậc thang đi lên: đoạn đầu ba bậc, đoạn sau hai bậc, giữa có một ô bằng. Tạo hàm stairs(n) leo n bậc (mỗi bậc sang phải rồi lên), rồi gọi stairs(3), bước sang phải một ô, gọi stairs(2).',
      veMaMau: 'Chương trình có sẵn gọi stairs(3), go_right() và stairs(2). Tạo hàm stairs có một đối số n.',
      san: ['######F', '#####..', '###...#', '##..###', '#..####', '..#####'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: bai(['stairs(3)', 'go_right()', 'stairs(2)']),
      loiGiai: bai(['stairs(3)', 'go_right()', 'stairs(2)'], { hamCuaEmMoi: [hStairs()] }),
      sao: { o: 6, nhip: 22 },
      loiSai: [
        { moTa: 'Chưa tạo hàm stairs mà đã gọi nó', baiLam: bai(['stairs(3)', 'go_right()', 'stairs(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm viết range(2) thay cho range(n): đoạn đầu leo thiếu một bậc, nhện đâm tường', baiLam: bai(['stairs(3)', 'go_right()', 'stairs(2)']), hamCuaEmMoi: [hStairs(['for i in range(2):', '    go_right()', '    go_up()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Mỗi bậc đi lên trước rồi mới sang phải: nhện đâm tường', baiLam: bai(['stairs(3)', 'go_right()', 'stairs(2)']), hamCuaEmMoi: [hStairs(['for i in range(n):', '    go_up()', '    go_right()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên bước sang phải ở ô bằng: nhện đâm tường', baiLam: bai(['stairs(3)', 'stairs(2)']), hamCuaEmMoi: [hStairs()], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Đối số n là số bậc: trong hàm viết for i in range(n).', 'Gọi stairs(3) cho đoạn đầu, stairs(2) cho đoạn sau.']
    }),

    man({
      so: 15, ten: 'Thung lũng', hang: 'luyen', hamCuaEmCan: ['step_down', 'stairs'],
      deBai: 'Đường đi xuống ba bậc tới đáy thung lũng rồi leo lên ba bậc tới cờ. Dùng lại hai hàm của em: step_down() và stairs(n).',
      veMaMau: 'Chương trình có sẵn mới xuống một bậc. Viết tiếp bằng hai hàm em đã có.',
      san: ['..####F', '#..##..', '##....#', '###..##'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['step_down()']),
      loiGiai: bai(nhieu(LAP(3, 'step_down()'), ['stairs(3)'])),
      sao: { o: 8, nhip: 24 },
      loiGiaiKhac: { moTa: 'Gọi step_down() ba dòng liền, không dùng vòng lặp', baiLam: bai(['step_down()', 'step_down()', 'step_down()', 'stairs(3)']) },
      loiSai: [
        { moTa: 'Xuống hai bậc rồi leo luôn: nhện đâm tường', baiLam: bai(nhieu(LAP(2, 'step_down()'), ['stairs(3)'])), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Leo thiếu một bậc: nhện dừng dưới cờ', baiLam: bai(nhieu(LAP(3, 'step_down()'), ['stairs(2)'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đếm số bậc đi xuống và số bậc đi lên.', 'step_down() không có đối số nên dùng vòng for; stairs(n) nhận số bậc.']
    }),

    man({
      so: 16, ten: 'Băng xuôi chiều', hang: 'bien-the',
      deBai: 'Hàng băng chuyền chạy cùng hướng nhện muốn đi: đứng trên băng đủ 2 nhịp thì bị đẩy đi một ô, nên bước theo chiều mũi tên thì mỗi bước đi được hai ô. Đi hết băng rồi xuống hai ô tới cờ. Bước thừa thì nhện đâm mép sân và mất nhịp.',
      veMaMau: 'Chương trình có sẵn đi ba bước sang phải rồi xuống. Chạy thử, đếm xem mỗi bước trên băng nhện đi được mấy ô.',
      san: ['.>>>>>>>.', '########.', '########F'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(LAP(3, 'go_right()'), LAP(2, 'go_down()'))),
      loiGiai: bai(nhieu(LAP(4, 'go_right()'), LAP(2, 'go_down()'))),
      sao: { o: 4, nhip: 12 },
      loiGiaiKhac: { moTa: 'Đi tám bước như trên sàn thường: bốn bước sau đâm mép sân (thừa nhịp)', baiLam: bai(nhieu(LAP(8, 'go_right()'), LAP(2, 'go_down()'))) },
      loiSai: [
        { moTa: 'Đi ba bước: nhện chưa tới cuối băng, đi xuống là đâm tường', baiLam: bai(nhieu(LAP(3, 'go_right()'), LAP(2, 'go_down()'))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Bước đầu chỉ lên được băng; từ đó mỗi bước đi hai ô.', 'Đếm thử: cần mấy bước để tới ô cuối hàng, ngay trên cờ?']
    }),

    man({
      so: 17, ten: 'Băng và bậc thang', hang: 'bien-the', hamCuaEmCan: ['stairs'],
      deBai: 'Đầu đường là một băng chuyền chạy sang phải, cuối băng là hai bậc thang đi lên, rồi một băng nữa tới cờ. Đi xuôi băng cho nhanh, dùng stairs(n) để leo.',
      veMaMau: 'Chương trình có sẵn mới đi trên băng đầu. Chạy thử rồi viết tiếp.',
      san: ['#####.>>F', '####..###', '>>>>.####'],
      batDau: { x: 0, y: 2, huong: 0 },
      maMau: bai(LAP(2, 'go_right()')),
      loiGiai: bai(nhieu(LAP(2, 'go_right()'), ['stairs(2)', 'go_up()'], LAP(2, 'go_right()'))),
      sao: { o: 9, nhip: 18 },
      loiSai: [
        { moTa: 'Không leo bậc: nhện đâm tường cuối băng', baiLam: bai(LAP(6, 'go_right()')), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Trên băng xuôi chiều mỗi bước đi được hai ô.', 'Leo xong hai bậc còn phải đi lên một ô nữa mới tới băng thứ hai.']
    }),

    man({
      so: 18, ten: 'Kho nhện', hang: 'trum', hamCuaEmCan: ['stairs'],
      deBai: 'Kho có hai băng chuyền: băng dưới chạy sang phải, băng trên chạy sang trái. Giữa hai băng là ba bậc thang. Đi xuôi cả hai băng, leo bậc bằng stairs(n), rồi lên tới cờ ở góc trên. Ít bước nhất thì được ba sao.',
      veMaMau: 'Chương trình có sẵn mới đi trên băng dưới. Chạy thử, đếm xem nhện dừng ở đâu rồi viết tiếp.',
      san: ['#F#######', '#.#######', '#.<<<<<<.', '########.', '#######..', '######..#', '.>>>>..##'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: bai(LAP(3, 'go_right()')),
      loiGiai: bai(nhieu(LAP(3, 'go_right()'), ['stairs(3)', 'go_up()'], LAP(4, 'go_left()'), LAP(2, 'go_up()'))),
      sao: { o: 11, nhip: 32 },
      loiGiaiKhac: { moTa: 'Đi thêm một bước trên mỗi băng cho chắc (thừa nhịp, ít sao hơn)', baiLam: bai(nhieu(LAP(4, 'go_right()'), ['stairs(3)', 'go_up()'], LAP(5, 'go_left()'), LAP(2, 'go_up()'))) },
      saoKhac: 2,
      loiSai: [
        { moTa: 'Đi hai bước trên băng dưới: nhện chưa tới chân bậc thang nên leo lệch và đâm tường', baiLam: bai(nhieu(LAP(2, 'go_right()'), ['stairs(3)', 'go_up()'], LAP(4, 'go_left()'), LAP(2, 'go_up()'))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Leo xong quên đi lên một ô: nhện đâm tường khi sang trái', baiLam: bai(nhieu(LAP(3, 'go_right()'), ['stairs(3)'], LAP(4, 'go_left()'), LAP(2, 'go_up()'))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đi sang trái quá ít trên băng trên: nhện lên nhầm chỗ', baiLam: bai(nhieu(LAP(3, 'go_right()'), ['stairs(3)', 'go_up()'], LAP(2, 'go_left()'), LAP(2, 'go_up()'))), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Trên băng xuôi chiều mỗi bước đi hai ô; bước đầu chỉ lên được băng.', 'Ba bậc thang: stairs(3). Leo xong đi lên một ô nữa mới tới băng trên.']
    })
  ];

  ManHoc.manThanNhen = DS;
  if (laNode) module.exports = ManHoc;
})();
