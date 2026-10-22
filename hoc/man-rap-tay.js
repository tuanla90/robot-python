/* ============================================================================
   man-rap-tay.js — "Đường học": CHƯƠNG `rap-tay` · LẮP RÁP: THÂN + TAY (10 màn, chế độ lắp ráp: KE-HOACH-LAP-RAP.md, lõi lap-rap.js).
   Người chơi tự chọn THÂN (hai bánh · xích · omni · nhện) và TAY (kẹp · xoay · nam châm · máy ném · súng hơi · không gắn) dưới một NGÂN SÁCH XU, rồi mới viết code.
   Không có drone, không có khe não (cảm biến). Yếu tố sân chỉ dùng thứ đã gặp tới gói Máy ném: tường, vật (gỗ / sắt), hàng rào, bậc thang, hố, băng chuyền, nút + cửa, ô đích.
   Giá (lap-rap.js): thân 2 · 3 · 4 · 4 (hai bánh · xích · omni · nhện); tay 0 · 2 · 3 · 3 · 3 · 3 (không · kẹp · xoay · nam châm · máy ném · súng hơi).

   LỜI GIẢI MẪU DÙNG KHO (khác chương rap-nao): khung chương trình của giao diện chỉ có 10 dòng nên mỗi cách lắp mẫu là chương trình chính ≤ 10 dòng gọi các hàm của em đã chế ở các chương trước
   (forward, pick, drop, turn_right, back, u_turn, carry_throw, slide_r, pick_left, jet_fwd, jump, tr_right…) cùng vài lệnh gốc. Màn khai `lapRap.dungKho: true`: lap-rap.js chạy lời giải mẫu
   trên KHO THAM CHIẾU (LapRap.khoMau: mọi hàm của em các màn thường đứng trước) nên bảng "Cách lắp khác" không phụ thuộc kho thật của người chơi. hamCuaEmCan để trống: khay chỉ hiện
   hàm hợp với robot đang lắp (TP.locHamTheoRobot). Lời giải KHÔNG tạo / sửa hàm của em nào (taoHam rỗng), nên chương không làm kho phình ra.

   SAO Ô (điều phối 17/10): sao.o = ô của lời giải cách đầu = ô LỚN NHẤT trong các cách viết tự nhiên (hàm khác của kho như deliver / cross_belt / leap, có hay không vòng for, viết thẳng lệnh gốc);
   mọi biến thể tự nhiên đánh dấu dat3sao: true trong congThucKhac phải đạt 3 sao (kiem-rap-tay.mjs kiểm), nên dùng hàm của kho không bị mất sao ô. Lời giải khác (2 sao) thêm dòng chú thích hay đi lòng vòng để nhiều ô hơn.

   NHỊP. sao.nhip = nhịp của lời giải mẫu tự nhiên (pick() / drop() của kho tốn hai nhịp). Người chơi gộp lệnh (hạ tay + kẹp một nhịp, nâng tay cùng bước đi…) có thể ít nhịp hơn: các màn đó khai
   `nhipTheoLoiGiai: true` (BFS ≤ sao.nhip). Máy kiểm kiem-rap-tay.mjs dò BFS cho MỌI cách lắp vừa ngân sách (do-duong-rap-tay.mjs): không cách nào đi ít nhịp hơn robot của cachLap[0],
   và không cách nào khác cachLap[0] đạt sao.nhip ngoài các cách mẫu đã khai.

   Bảng màn (xu · nhịp · ô của từng cách mẫu; cách đầu = ba sao):
     1  Vật chắn lối       tới cờ    khe tường bị vật chắn, lối vòng xa        hai bánh + kẹp 4 · hai bánh 2 (đi vòng)
     2  Bậc thang          đưa vật   hàng bậc thang, lối hở xa                  xích + kẹp 5 (leo thẳng) · hai bánh + kẹp 4 (vòng)
     3  Qua hàng rào       đưa vật   đích sau hàng rào thấp                     hai bánh + máy ném 5 (ném qua) · hai bánh + kẹp 4 (vòng)
     4  Hút qua rào        đưa vật   vật sắt bên kia hàng rào, đích sau lưng    hai bánh + nam châm 5 (hút qua rào) · hai bánh + kẹp 4 (vòng, đi và về)
     5  Đường rắn          đưa vật   lối ngoằn ngoèo đổi cột liên tục           omni + kẹp 6 (trượt ngang) · hai bánh + kẹp 4 (quay mỗi chỗ gấp)
     6  Hai bên lối  đưa vật   hai vật bên trái, hai đích bên phải         hai bánh + xoay 5 (kẹp sang bên không quay) · hai bánh + kẹp 4 (quay rồi quay lại)
     7  Cửa và nút         tới cờ    cửa đóng, nút ở tường trái, lối vòng xa    hai bánh + súng hơi 5 (bắn nút) · hai bánh 2 (vòng)
     8  Sông hố            đưa vật   dòng hố chắn ngang, lối hở xa              nhện + kẹp 6 (nhảy qua hố) · hai bánh + kẹp 4 (vòng)
     9  Băng ngược  đưa vật   làn băng chạy ngược chiều xe               xích + kẹp 5 (băng không đẩy) · hai bánh + kẹp 4 (bị đẩy lùi); omni không đi ngược băng được
    10  Kho ba lối     tới cờ    cửa đóng · vật chắn · bậc thang (trùm)     hai bánh + súng hơi 5 · hai bánh + kẹp 4 · xích 3

   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các dòng `lenh` n lần (thụt 4 dấu cách). */
  function lap(n, lenh) { return ['for i in range(' + n + '):'].concat(lenh.map(function (s) { return '    ' + s; })); }

  /**
   * Dựng một màn lắp ráp: điền chương, cấu trúc cho phép, khung (10 ô như giao diện), kho tham chiếu cho lời giải mẫu. ManHoc.chuanHoa điền robot mặc định (loaiRobot, robot, hamGoc, loiGiai) theo cachLap[0].
   */
  function man(m) {
    m.chuong = 'rap-tay';
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.lapRap.dungKho = true;
    m.maMau = { chinh: [] };
    return ManHoc.chuanHoa(m);
  }

  /* ---------------------------------------------------------------------------- sân */
  // 1: tường ngang có khe ở cột 2 (vật chắn), lối hở ở cột 5; cờ sau khe, xe ở đáy cột 2
  var SAN_1 = ['......', '..F...', '##o##.', '......', '......', '......'];
  // 2: hàng bậc thang S chắn ngang, chỉ chừa cột 4; vật sát mũi xe, ô đích sau hàng bậc thang
  var SAN_2 = ['.....', '..D..', 'SSSS.', '.....', '..o..', '.....'];
  // 3: hàng rào thấp chắn ngang ba cột đầu (cột 3, 4 hở); vật sát mũi xe, ô đích sau hàng rào cùng cột với xe
  var SAN_3 = ['.D...', '.....', '===..', '.....', '.o...', '.....'];
  // 4: vật SẮT sau hàng rào (cột 1), cột 2 hở; ô đích ngay sau lưng xe
  var SAN_4 = ['...', '.o.', '==.', '...', '...', '.D.'], CHAT_4 = ['...', '.s.', '...', '...', '...', '...'];
  // 5: hai hàng tường gấp khúc (lối hở đổi bên liên tục); vật sát mũi xe, ô đích ở đầu kia
  var SAN_5 = ['D...', '....', '.###', '....', '###.', 'o...', '....'];
  // 6: hành lang hẹp một cột; hai vật bên trái (cột 0) và hai ô đích bên phải (cột 2), từng cặp đối diện
  var SAN_6 = ['#.#', 'o.D', '#.#', 'o.D', '#.#', '...'];
  // 7: cửa đóng C ở tường ngang, lối vòng ở cột 6; nút N ở tường bên trái hàng 3
  var SAN_7 = ['..F....', '##C###.', '.......', 'N......', '.......', '.......'];
  // 8: dòng hố u chắn ngang bốn cột, cột 4 hở; vật sát mũi xe, ô đích sau dòng hố
  var SAN_8 = ['.D...', '.....', 'uuuu.', '.....', '.o...', '.....'];
  // 9: làn băng chuyền chạy xuống (ngược chiều xe) dài năm ô, tường hai bên; vật sát mũi xe, ô đích cuối làn
  var SAN_9 = ['.D.', '#v#', '#v#', '#v#', '#v#', '#v#', '.o.', '...'];
  // 10: ba lối vào kho: trái có vật chắn, giữa có cửa đóng, phải có bậc thang; nút mở cửa ở tường trái hàng 6
  var SAN_10 = ['...F...', '#.#C#.#', '#.#.#.#', '#o#.#S#', '#.#.#.#', '#.#.#.#', 'N......', '.......'];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Vật chắn lối', hang: 'lam-quen',
      deBai: 'Lá cờ nằm sau một bức tường. Khe hở của tường bị một vật chắn, còn lối vòng bên phải thì xa hơn nhiều. Lắp robot rồi đưa xe tới cờ.',
      san: SAN_1, batDau: { x: 2, y: 5, huong: 0 },
      lapRap: {
        than: ['hai-banh'], tay: ['kep'], camBien: [], nganSach: 4,
        cachLap: [
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Kẹp vật khỏi khe rồi đi thẳng: nhanh, gọn, tốn 4 xu.', loiGiai: { chinh: ['forward(2)', 'pick()', 'forward(2)'] } },
          { than: 'hai-banh', tay: null, camBien: null, ghiChu: 'Không tay, chỉ 2 xu: phải đi vòng qua lối bên phải.', loiGiai: { chinh: ['forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'back()', 'back()', 'turn_right()', 'forward(3)'] } }
        ]
      },
      sao: { o: 13, nhip: 6, re: { gia: 2, o: 18 } }, nhipTheoLoiGiai: true,
      loiGiaiKhac: { moTa: 'Cùng cách làm, đi từng ô bằng move() thay cho forward(2)', baiLam: { chinh: ['move()', 'move()', 'pick()', 'forward(2)'] } },
      congThucKhac: [
        { moTa: 'Đi từng ô bằng move() cả hai đoạn (cùng 13 ô)', dat3sao: true, baiLam: { chinh: ['move()', 'move()', 'pick()', 'move()', 'move()'] } },
        { moTa: 'Kẹp bằng lệnh gốc, nâng tay cùng nhịp với bước đi (nhanh hơn một nhịp)', dat3sao: true, baiLam: { chinh: ['forward(2)', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'forward(2)'] } },
        { moTa: 'Gắn tay kẹp mà vẫn đi vòng bên phải (chậm hơn)', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'back()', 'back()', 'turn_right()', 'forward(3)'] } }
      ],
      loiSai: [
        { moTa: 'Đi thẳng, không kẹp vật: xe đâm vào vật chắn khe', baiLam: { chinh: ['forward(5)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Kẹp xong không nâng tay: tay hạ thì xe không đi được', baiLam: { chinh: ['forward(2)', 'arm_down()', 'grab()', 'wait()', 'forward(2)'] }, phaiCoMa: ['tay-vuong'] },
        { moTa: 'Kẹp khi tay chưa hạ: kẹp vào không khí rồi đâm vào vật', baiLam: { chinh: ['forward(2)', 'grab()', 'wait()', 'forward(2)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Kẹp vật rồi đi thiếu một ô: xe dừng ngay khe tường', baiLam: { chinh: ['forward(2)', 'pick()', 'forward(1)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Tay kẹp phải hạ xuống mới kẹp được vật, và phải nâng lên thì xe mới đi được.', 'Không gắn tay thì xe phải đi vòng qua lối bên phải.']
    }),

    man({
      so: 2, ten: 'Bậc thang', hang: 'lam-quen', mucTieu: 'dua-vat',
      deBai: 'Một vật nằm sát trước mũi xe, còn ô đích nằm bên kia hàng bậc thang. Chỉ có một lối hở ở bên phải. Lắp robot rồi đưa vật vào ô đích.',
      san: SAN_2, batDau: { x: 2, y: 5, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich'], tay: ['kep'], camBien: [], nganSach: 5, phaiCo: ['tay'],
        cachLap: [
          { than: 'xich', tay: 'kep', camBien: null, ghiChu: 'Xích leo thẳng qua bậc thang mang theo vật: nhanh, tốn 5 xu.', loiGiai: { chinh: ['deliver(3)'] } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Hai bánh không leo được bậc thang: rẻ hơn 1 xu nhưng phải đi vòng.', loiGiai: { chinh: ['pick()', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_right()', 'back()', 'back()', 'turn_right()', 'move()', 'drop()'] } }
        ]
      },
      sao: { o: 19, nhip: 6, re: { gia: 4, o: 30 } }, nhipTheoLoiGiai: true,
      loiGiaiKhac: { moTa: 'Cùng cách làm, nhặt, đi từng ô rồi thả (nhiều ô hơn deliver)', baiLam: { chinh: ['pick()', 'move()', 'move()', 'forward(1)', 'drop()'] } },
      congThucKhac: [
        { moTa: 'Nhặt, đi ba ô, thả bằng pick(), forward(3), drop() (18 ô)', dat3sao: true, baiLam: { chinh: ['pick()', 'forward(3)', 'drop()'] } },
        { moTa: 'Nhặt và thả bằng lệnh gốc, nâng tay cùng nhịp với bước đi (nhanh hơn)', dat3sao: true, baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'forward(3)', 'arm_down()', 'release()', 'wait()'] } }
      ],
      loiSai: [
        { moTa: 'Mang vật tới nơi nhưng quên thả xuống ô đích', baiLam: { chinh: ['pick()', 'forward(3)'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả khi mũi xe đang chỉ vào bậc thang: bậc thang không đặt được vật', baiLam: { chinh: ['pick()', 'forward(2)', 'drop()'] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Dùng turn_right() của hai bánh cho xích: xích quay chậm nên quay dở', baiLam: { chinh: ['pick()', 'forward(1)', 'turn_right()', 'forward(1)'] }, phaiCoMa: ['xich-quay-do'] },
        { moTa: 'Đi quá một ô rồi mới thả: vật không nằm đúng ô đích', baiLam: { chinh: ['pick()', 'forward(4)', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hai bánh không leo được bậc thang, nên phải đi vòng qua lối hở.', 'Xích leo được bậc thang, nhưng quay chậm hơn hai bánh.']
    }),

    man({
      so: 3, ten: 'Qua hàng rào', hang: 'lam-quen', mucTieu: 'dua-vat',
      deBai: 'Ô đích nằm bên kia hàng rào thấp. Vật nằm ngay trước mũi xe, còn lối hở của hàng rào ở bên phải. Lắp robot rồi đưa vật vào ô đích.',
      san: SAN_3, batDau: { x: 1, y: 5, huong: 0 },
      lapRap: {
        than: ['hai-banh'], tay: ['kep', 'nem'], camBien: [], nganSach: 5, phaiCo: ['tay'],
        cachLap: [
          { than: 'hai-banh', tay: 'nem', camBien: null, ghiChu: 'Ném vật qua hàng rào: chỉ 4 nhịp, tốn 5 xu.', loiGiai: { chinh: ['carry_throw(2)'] } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Kẹp vật đi vòng qua lối hở: rẻ hơn 1 xu nhưng rất chậm.', loiGiai: { chinh: ['pick()', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(3)', 'turn_left()', 'move()', 'drop()'] } }
        ]
      },
      sao: { o: 13, nhip: 4, re: { gia: 4, o: 28 } },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# nạp vật, chở tới sát hàng rào rồi ném', 'carry_throw(2)'] } },
      congThucKhac: [
        { moTa: 'Viết thẳng nạp, đi hai ô, ném tầm 3 (ít ô hơn)', dat3sao: true, baiLam: { chinh: ['load()', 'wait()', 'forward(2)', 'toss(3)'] } },
        { moTa: 'Chờ thêm một nhịp giữa hai bước (chậm hơn một nhịp)', baiLam: { chinh: ['load()', 'wait()', 'move()', 'wait()', 'move()', 'toss(3)'] } }
      ],
      loiSai: [
        { moTa: 'Ném tầm 2: vật rơi xuống sân, chưa tới ô đích', baiLam: { chinh: ['load()', 'wait()', 'forward(2)', 'toss(2)'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ném tầm 1: vật rơi vào hàng rào nên vỡ', baiLam: { chinh: ['load()', 'wait()', 'forward(2)', 'toss(1)'] }, phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên wait() sau load(): lệnh đi bị bỏ vì nhịp có load() thì xe đứng yên', baiLam: { chinh: ['load()', 'forward(2)', 'toss(3)'] }, phaiCoMa: ['nem-dung-yen', 'chua-dua-vat'] },
        { moTa: 'Ném mà chưa nạp vật: rổ trống', baiLam: { chinh: ['forward(2)', 'toss(3)'] }, phaiCoMa: ['nem-hut'] }
      ],
      goiY: ['Hàng rào thấp: vật ném bay qua được, xe thì không đi qua.', 'Máy ném chỉ ném xa tối đa ba ô.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Hút qua rào', hang: 'luyen', mucTieu: 'dua-vat',
      deBai: 'Một vật sắt nằm bên kia hàng rào, ô đích ở ngay sau lưng xe. Lối hở của hàng rào ở bên phải. Lắp robot rồi đưa vật sắt vào ô đích.',
      san: SAN_4, vatChat: CHAT_4, batDau: { x: 1, y: 4, huong: 0 },
      lapRap: {
        than: ['hai-banh'], tay: ['kep', 'nam-cham'], camBien: [], nganSach: 5, phaiCo: ['tay'],
        cachLap: [
          { than: 'hai-banh', tay: 'nam-cham', camBien: null, ghiChu: 'Hút vật sắt qua hàng rào từ xa: chỉ 4 nhịp, tốn 5 xu.', loiGiai: { chinh: ['magnet_n()', 'move()', 'back()', 'u_turn()', 'magnet_off()', 'wait()'] } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Đi vòng sang bên kia kẹp vật rồi mang về: rẻ hơn 1 xu nhưng rất chậm.', loiGiai: { chinh: ['turn_right()', 'move()', 'turn_left()', 'forward(3)', 'turn_left()', 'pick()', 'turn_left()', 'forward(4)', 'turn_right()', 'drop()'] } }
        ]
      },
      sao: { o: 15, nhip: 4, re: { gia: 4, o: 29 } },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# hút, lùi, quay đầu rồi thả', 'magnet_n()', 'move()', 'back()', 'u_turn()', 'magnet_off()', 'wait()'] } },
      congThucKhac: [
        { moTa: 'Viết thẳng left_move(), right_move(), wait() thay cho move() (14 ô)', dat3sao: true, baiLam: { chinh: ['magnet_n()', 'left_move()', 'right_move()', 'wait()', 'back()', 'u_turn()', 'magnet_off()', 'wait()'] } },
        { moTa: 'Tiến một ô trước, hút xong quay đầu rồi tiến thêm một ô mới thả (5 nhịp)', baiLam: { chinh: ['move()', 'magnet_n()', 'wait()', 'u_turn()', 'move()', 'magnet_off()', 'wait()'] } }
      ],
      loiSai: [
        { moTa: 'Bật nam châm ngay tại chỗ: vật sắt cách xe ba ô nên ngoài tầm hút', baiLam: { chinh: ['magnet_n()', 'wait()'] }, phaiCoMa: ['ngoai-tam', 'chua-dua-vat'] },
        { moTa: 'Ngắt điện ngay trước hàng rào: vật rơi vào hàng rào, không thả được', baiLam: { chinh: ['magnet_n()', 'move()', 'magnet_off()', 'wait()'] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Hút xong mà chưa ngắt điện: vật vẫn dính ở mũi xe', baiLam: { chinh: ['magnet_n()', 'move()', 'back()', 'u_turn()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên wait() sau magnet_off(): lệnh thả không chạy', baiLam: { chinh: ['magnet_n()', 'move()', 'back()', 'u_turn()', 'magnet_off()'] }, phaiCoMa: ['quen-wait', 'chua-dua-vat'] }
      ],
      goiY: ['Nam châm hút được vật sắt cách xe tối đa hai ô, kể cả qua hàng rào.', 'Vật dính ở mũi xe thì đi theo xe, tới khi ngắt điện thì rơi xuống ô trước mặt.']
    }),

    man({
      so: 5, ten: 'Đường rắn', hang: 'luyen', mucTieu: 'dua-vat',
      deBai: 'Lối đi ngoằn ngoèo, mỗi chỗ gấp lại phải sang một cột khác. Vật nằm sát mũi xe, ô đích ở đầu kia. Lắp robot rồi đưa vật vào ô đích.',
      san: SAN_5, batDau: { x: 0, y: 6, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'omni'], tay: ['kep'], camBien: [], nganSach: 6, phaiCo: ['tay'],
        cachLap: [
          { than: 'omni', tay: 'kep', camBien: null, ghiChu: 'Omni trượt ngang không cần quay: ít nhịp hơn, tốn 6 xu.', loiGiai: { chinh: ['pick()', 'move()', 'cross_belt()', 'slide_l(3)', 'forward(2)', 'drop()'] } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Hai bánh phải quay ở mỗi chỗ gấp: rẻ hơn 2 xu nhưng nhiều nhịp hơn.', loiGiai: { chinh: ['pick()', 'move()', 'turn_right()', 'forward(3)', 'bend_left()', 'forward(3)', 'turn_right()', 'forward(2)', 'drop()'] } }
        ]
      },
      sao: { o: 29, nhip: 14, re: { gia: 4, o: 32 } }, nhipTheoLoiGiai: true,
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# trượt ngang qua từng chỗ gấp', 'pick()', 'move()', 'cross_belt()', 'slide_l(3)', 'forward(2)', 'drop()'] } },
      congThucKhac: [
        { moTa: 'Viết slide_r(3) và forward(2) riêng thay cho cross_belt() (28 ô)', dat3sao: true, baiLam: { chinh: ['pick()', 'move()', 'slide_r(3)', 'forward(2)', 'slide_l(3)', 'forward(2)', 'drop()'] } },
        { moTa: 'Gắn omni mà vẫn quay như xe hai bánh (chậm hơn)', baiLam: { chinh: ['pick()', 'move()', 'turn_right()', 'forward(3)', 'bend_left()', 'forward(3)', 'turn_right()', 'forward(2)', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Trượt hết đường nhưng quên thả vật', baiLam: { chinh: ['pick()', 'move()', 'slide_r(3)', 'forward(2)', 'slide_l(3)', 'forward(2)'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt khi tay còn hạ: tay hạ thì xe không đi, không trượt', baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'slide_r(3)', 'forward(3)'] }, phaiCoMa: ['tay-vuong'] },
        { moTa: 'Đi thẳng lên sau khi nhặt: xe đâm vào tường', baiLam: { chinh: ['pick()', 'move()', 'forward(2)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Vừa tiến vừa trượt trong một nhịp: omni không đi chéo, lệnh tiến bị bỏ', baiLam: { chinh: ['pick()', 'move()', 'slide_right()', 'move()', 'wait()'] }, phaiCoMa: ['omni-khong-cheo'] }
      ],
      goiY: ['Xe hai bánh phải quay mỗi lần đổi cột.', 'Xe omni trượt ngang được mà không cần quay.']
    }),

    man({
      so: 6, ten: 'Hai bên lối', hang: 'luyen', mucTieu: 'dua-vat',
      deBai: 'Hành lang hẹp có hai vật bên trái và hai ô đích bên phải, từng cặp đối diện nhau. Lắp robot rồi chuyển từng vật sang ô đích.',
      san: SAN_6, batDau: { x: 1, y: 5, huong: 0 },
      lapRap: {
        than: ['hai-banh'], tay: ['kep', 'xoay'], camBien: [], nganSach: 5, phaiCo: ['tay'],
        cachLap: [
          { than: 'hai-banh', tay: 'xoay', camBien: null, ghiChu: 'Tay xoay kẹp sang bên mà xe không quay: ít nhịp, ít ô hơn, tốn 5 xu.', loiGiai: { chinh: ['forward(2)', 'pick_left()', 'drop_right()', 'forward(2)', 'pick_left()', 'drop_right()'] } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Tay kẹp phải quay xe mỗi lần: rẻ hơn 1 xu nhưng nhiều nhịp hơn.', loiGiai: { chinh: lap(2, ['forward(2)', 'turn_left()', 'pick()', 'u_turn()', 'drop()', 'turn_left()']) } }
        ]
      },
      sao: { o: 25, nhip: 11, re: { gia: 4, o: 27 } }, nhipTheoLoiGiai: true,
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# từng cặp vật và ô đích', 'forward(2)', 'pick_left()', 'drop_right()', 'forward(2)', 'pick_left()', 'drop_right()'] } },
      congThucKhac: [
        { moTa: 'Gộp hai cặp bằng vòng for (23 ô)', dat3sao: true, baiLam: { chinh: lap(2, ['forward(2)', 'pick_left()', 'drop_right()']) } },
        { moTa: 'Gắn tay xoay mà vẫn quay xe như tay kẹp (chậm hơn)', baiLam: { chinh: lap(2, ['forward(2)', 'turn_left()', 'pick()', 'u_turn()', 'drop()', 'turn_left()']) } }
      ],
      loiSai: [
        { moTa: 'Chỉ nhặt vật bên trái, quên thả sang ô đích', baiLam: { chinh: lap(2, ['forward(2)', 'pick_left()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhặt bên phải rồi thả bên trái: sai bên, ô đích bên phải vẫn trống', baiLam: { chinh: lap(2, ['forward(2)', 'pick_right()', 'drop_left()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thả lại bên trái: vật không sang được ô đích', baiLam: { chinh: lap(2, ['forward(2)', 'pick_left()', 'drop_left()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ làm một cặp rồi dừng', baiLam: { chinh: ['forward(2)', 'pick_left()', 'drop_right()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Tay kẹp chỉ kẹp được vật ở trước mũi xe, nên xe phải quay mặt về phía vật.', 'Tay xoay kẹp được vật ở bên trái và bên phải mà xe không cần quay.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Cửa và nút', hang: 'bien-the',
      deBai: 'Cửa đóng chắn đường tới cờ, còn nút mở cửa gắn trên tường bên trái. Lối vòng thì rất xa. Lắp robot rồi đưa xe tới cờ.',
      san: SAN_7, batDau: { x: 2, y: 5, huong: 0 },
      lapRap: {
        than: ['hai-banh'], tay: ['kep', 'hoi'], camBien: [], nganSach: 5,
        cachLap: [
          { than: 'hai-banh', tay: 'hoi', camBien: null, ghiChu: 'Bắn trúng nút để mở cửa rồi đi thẳng: 9 nhịp, tốn 5 xu.', loiGiai: { chinh: ['forward(2)', 'turn_right()', 'back()', 'jet_fwd()', 'turn_right()', 'back()', 'back()', 'back()'] } },
          { than: 'hai-banh', tay: null, camBien: null, ghiChu: 'Không tay, chỉ 2 xu: đi vòng qua lối ở xa, gọn nhưng chậm.', loiGiai: { chinh: ['forward(3)', 'turn_right()', 'forward(4)', 'turn_right()', 'back()', 'back()', 'turn_right()', 'forward(4)'] } }
        ]
      },
      sao: { o: 20, nhip: 9, re: { gia: 2, o: 18 } },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# lùi, bắn ra sau trúng nút, rồi lùi thẳng qua cửa', 'forward(2)', 'turn_right()', 'back()', 'jet_fwd()', 'turn_right()', 'back()', 'back()', 'back()'] } },
      congThucKhac: [
        { moTa: 'Lùi ba ô bằng vòng for (19 ô)', dat3sao: true, baiLam: { chinh: nhieu(['forward(2)', 'turn_right()', 'back()', 'jet_fwd()', 'turn_right()'], lap(3, ['back()'])) } },
        { moTa: 'Quay mặt sang nút, bắn ra trước rồi quay lại đi lên (cùng 9 nhịp)', dat3sao: true, baiLam: { chinh: ['forward(2)', 'turn_left()', 'jet_back()', 'move()', 'turn_right()', 'forward(3)'] } },
        { moTa: 'Gắn súng hơi mà vẫn đi vòng (chậm hơn)', baiLam: { chinh: ['forward(3)', 'turn_right()', 'forward(4)', 'turn_right()', 'back()', 'back()', 'turn_right()', 'forward(4)'] } }
      ],
      loiSai: [
        { moTa: 'Đi thẳng: xe đâm vào cửa đóng', baiLam: { chinh: ['forward(5)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quay phải rồi bắn ra trước: bóng bay sang phải, không trúng nút', baiLam: { chinh: ['forward(2)', 'turn_right()', 'jet_back()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bắn ra trước khi chưa quay: bóng bay lên phía cửa, cửa vẫn đóng', baiLam: { chinh: ['forward(2)', 'jet_back()', 'forward(3)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn trúng nút, cửa mở nhưng xe vẫn quay mặt sang trái: đi thẳng là đâm vào tường chứa nút', baiLam: { chinh: ['forward(2)', 'turn_left()', 'jet_back()', 'forward(3)'] }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Nút nằm ở tường bên trái: xe phải đứng cùng hàng với nút thì bóng mới bay tới.', 'Cú giật của súng hơi cũng là một bước đi.']
    }),

    man({
      so: 8, ten: 'Sông hố', hang: 'bien-the', mucTieu: 'dua-vat',
      deBai: 'Một dòng hố chắn ngang sân, chỉ chừa lối hở bên phải. Vật nằm sát mũi xe, ô đích ở bên kia. Lắp robot rồi đưa vật vào ô đích.',
      san: SAN_8, batDau: { x: 1, y: 5, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'nhen'], tay: ['kep'], camBien: [], nganSach: 6, phaiCo: ['tay'],
        cachLap: [
          { than: 'nhen', tay: 'kep', camBien: null, ghiChu: 'Nhện bật qua hố mang theo vật: ít nhịp hơn, tốn 6 xu.', loiGiai: { chinh: ['pick()', 'leap("UU")', 'drop()'] } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Hai bánh không qua được hố: rẻ hơn 2 xu nhưng phải đi vòng.', loiGiai: { chinh: ['pick()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(2)', 'drop()'] } }
        ]
      },
      sao: { o: 27, nhip: 9, re: { gia: 4, o: 28 } }, nhipTheoLoiGiai: true,
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# nhặt vật rồi nhảy qua hố hai lần', 'pick()', 'leap("UU")', 'drop()'] } },
      congThucKhac: [
        { moTa: 'Nhảy hai lần bằng hai lệnh jump() thay cho leap() (26 ô)', dat3sao: true, baiLam: { chinh: ['pick()', 'jump("U")', 'jump("U")', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Đi bộ qua hố: nhện bước vào hố nên rơi', baiLam: { chinh: ['pick()', 'walk("UUUU")'] }, phaiCoMa: ['roi-ho'] },
        { moTa: 'Không co chân trước khi bước: bước vào hố là rơi', baiLam: { chinh: ['pick()', 'go("U")', 'go("U")', 'go("U")', 'drop()'] }, phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhảy một lần rồi thả: mũi xe chỉ vào hố nên không thả được', baiLam: { chinh: ['pick()', 'jump("U")', 'drop()'] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Nhảy qua hố mà không nhặt vật', baiLam: { chinh: ['jump("U")', 'jump("U")'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xe bánh rơi xuống hố là thua, nên phải đi vòng.', 'Nhện co chân rồi duỗi chân khi bước thì bật qua được một ô.']
    }),

    man({
      so: 9, ten: 'Băng ngược', hang: 'bien-the', mucTieu: 'dua-vat',
      deBai: 'Làn băng chuyền chạy ngược chiều xe, hai bên là tường. Vật nằm sát mũi xe, ô đích ở cuối làn. Lắp robot rồi đưa vật vào ô đích.',
      san: SAN_9, batDau: { x: 1, y: 7, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni'], tay: ['kep'], camBien: [], nganSach: 6, phaiCo: ['tay'],
        khongQua: [
          { than: 'omni', lyDo: 'Bánh omni trơn: đi ngược băng chuyền thì bị đẩy về, đứng im tại chỗ.' }
        ],
        cachLap: [
          { than: 'xich', tay: 'kep', camBien: null, ghiChu: 'Xích bám chắc nên băng không đẩy được: đi thẳng, tốn 5 xu.', loiGiai: { chinh: ['deliver(6)'] } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Hai bánh bị băng đẩy lùi một ô sau mỗi hai bước trên băng: rẻ hơn 1 xu nhưng nhiều nhịp hơn.', loiGiai: { chinh: ['deliver(10)'] } }
        ]
      },
      sao: { o: 19, nhip: 9, re: { gia: 4, o: 19 } }, nhipTheoLoiGiai: true,
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# xích đi thẳng qua làn băng', 'deliver(6)'] } },
      congThucKhac: [
        { moTa: 'Nhặt, đi sáu ô, thả bằng pick(), forward(6), drop() (18 ô)', dat3sao: true, baiLam: { chinh: ['pick()', 'forward(6)', 'drop()'] } },
        { moTa: 'Nhặt và thả bằng lệnh gốc, nâng tay cùng nhịp với bước đi (nhanh hơn)', dat3sao: true, baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'forward(6)', 'arm_down()', 'release()', 'wait()'] } }
      ],
      loiSai: [
        { moTa: 'Đi thiếu một ô rồi thả: vật chưa tới ô đích', baiLam: { chinh: ['pick()', 'forward(5)', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tới nơi nhưng quên thả vật', baiLam: { chinh: ['pick()', 'forward(6)'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi quá một ô: mũi xe chỉ vào tường nên không thả được', baiLam: { chinh: ['pick()', 'forward(7)', 'drop()'] }, phaiCoMa: ['tha-bi-chan'] }
      ],
      goiY: ['Xe bánh nằm trên băng hai nhịp liền thì bị đẩy lùi một ô.', 'Xích bám chắc nên băng chuyền không đẩy được.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho ba lối', hang: 'trum',
      huyHieu: { ma: 'rap-tay', ten: 'Huy hiệu Lắp ráp: Thân + Tay' },
      deBai: 'Kho có ba lối vào: giữa là cửa đóng, trái có vật chắn, phải có bậc thang. Nút mở cửa ở tường trái. Lắp robot rồi đưa xe tới cờ.',
      san: SAN_10, batDau: { x: 3, y: 7, huong: 0 },
      lapRap: {
        than: ['hai-banh', 'xich', 'omni', 'nhen'], tay: ['kep', 'xoay', 'nam-cham', 'nem', 'hoi'], camBien: [], nganSach: 5,
        khongQua: [
          { than: 'hai-banh', tay: null, lyDo: 'Ba lối đều bị chặn: vật nằm giữa lối trái, cửa đóng ở lối giữa, bậc thang ở lối phải. Xe không gắn tay thì không dời được vật, không mở được cửa.' },
          { than: 'omni', tay: null, lyDo: 'Ba lối đều bị chặn: vật nằm giữa lối trái, cửa đóng ở lối giữa, bậc thang ở lối phải. Bánh omni không gắn tay thì không dời được vật, không mở được cửa, không leo được bậc.' },
          { than: 'hai-banh', tay: 'nam-cham', lyDo: 'Vật chắn lối trái là gỗ, nam châm không hút được. Cửa giữa phải bắn nút mới mở, lối phải có bậc thang.' }
        ],
        cachLap: [
          { than: 'hai-banh', tay: 'hoi', camBien: null, ghiChu: 'Bắn nút mở cửa rồi đi thẳng lối giữa: ít nhịp nhất, tốn 5 xu.', loiGiai: { chinh: nhieu(['move()', 'turn_right()', 'back()', 'jet_fwd()', 'turn_right()'], lap(6, ['back()'])) } },
          { than: 'hai-banh', tay: 'kep', camBien: null, ghiChu: 'Kẹp vật khỏi lối trái rồi đi thẳng: rẻ hơn 1 xu, chậm hơn.', loiGiai: { chinh: ['move()', 'turn_right()', 'back()', 'back()', 'turn_left()', 'forward(2)', 'pick()', 'forward(4)', 'turn_right()', 'forward(2)'] } },
          { than: 'xich', tay: null, camBien: null, ghiChu: 'Xích leo bậc thang ở lối phải, không cần tay: chỉ 3 xu, chậm nhất.', loiGiai: { chinh: nhieu(['move()', 'tr_right()', 'forward(2)', 'tr_right()'], lap(6, ['back()']), ['tr_right()', 'forward(2)']) } }
        ]
      },
      sao: { o: 17, nhip: 11, re: { gia: 3, o: 19 } },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# bắn nút từ hàng dưới rồi lùi thẳng qua cửa'], ['move()', 'turn_right()', 'back()', 'jet_fwd()', 'turn_right()'], lap(6, ['back()'])) } },
      congThucKhac: [
        { moTa: 'Quay mặt sang nút, bắn ra trước rồi quay lại đi lên (cùng 11 nhịp)', dat3sao: true, baiLam: { chinh: ['move()', 'turn_left()', 'jet_back()', 'move()', 'turn_right()', 'forward(6)'] } },
        { moTa: 'Chờ thêm một nhịp sau khi bắn (chậm hơn một nhịp)', baiLam: { chinh: ['move()', 'turn_left()', 'jet_back()', 'move()', 'wait()', 'turn_right()', 'forward(6)'] } }
      ],
      loiSai: [
        { moTa: 'Đi thẳng lối giữa: xe đâm vào cửa đóng', baiLam: { chinh: ['forward(6)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn từ sai hàng: bóng không trúng nút nên cửa vẫn đóng', baiLam: { chinh: ['move()', 'jet_back()', 'turn_right()', 'forward(6)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đi lối phải bằng xe hai bánh: xe không leo được bậc thang', baiLam: { chinh: ['move()', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(6)'] }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Mỗi lối cần một bộ phận khác nhau, mà ngân sách chỉ đủ cho vài cách.', 'Tính xem lối nào ít nhịp nhất với số xu em có.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
