/* ============================================================================
   man-che-tay.js — "Học lập trình": CHƯƠNG `che-tay` · CHẾ LỆNH TAY (10 màn). Kế hoạch "Chế lệnh" 14/10 (KE-HOACH-CHE-LENH.md, mục 5.1).
   Chương thứ 5 (sau Tay gắp). Robot là XE HAI BÁNH GẮN TAY KẸP: robot { than: 'hai-banh', tay: 'kep', camBien: [] }.
   Luật thiết kế như che-xe: lệnh gốc chỉ đổi MỘT trạng thái (tay lên / xuống, kẹp đóng / mở); động tác hay (chuyền vật ra sau, đặt sang phải, nhặt sau lưng…)
   là thứ NGƯỜI CHƠI TỰ CHẾ. Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (kiem-che-tay.mjs chạy từng cách).
   Màn dùng HÀM CỦA MÀN (5.7, 5.8: hàm chỉ đúng cho màn đó, không vào kho) khai cách khác bằng `{ moTa, baiLam: { chinh, hamCuaMan } }`.

   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế của "xe mờ" khi chương trình CHẠY XONG, và VẬT MỜ cho biết mỗi vật phải nằm ở ô nào (vật có màu
   thì chấm theo màu: `bongMo.vat = [{ x, y, mau }]`); xe mờ cầm vật (`bongMo.cam: true`) nghĩa là lúc xong tay phải đang kẹp một vật.
   `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng. 5.3 và 5.10 không khóa: người chơi tự viết chương trình chính.
   5.3 tới cờ (mục tiêu 'toi-co': vật chỉ là chướng ngại); 5.10 là bóng mờ có vật màu.

   LUẬT TAY (san-hoc.js, phần TAY GẮP): vật nằm đất CHIẾM Ô; grab / release làm ở Ô TRƯỚC MẶT; trong một nhịp tay đổi tư thế trước, kẹp sau, rồi mới tới bánh; tay hạ thì xe không đi
   hay quay được; thả khi tay đang nâng thì vật rơi vỡ. Hàm của em có sẵn ở chương này: move, turn_right, turn_left (bánh lùi), u_turn (một nhịp), dodge_*, back, park…, pick, drop, carry.
     pick() = arm_down(), grab(), wait(), arm_up(), wait()      (2 nhịp: nhặt vật ở ô trước mặt, tay về tư thế nâng)
     drop() = arm_down(), release(), wait(), arm_up(), wait()   (2 nhịp: đặt vật xuống ô trước mặt, tay về tư thế nâng)

   KHAY: cả chương mở đủ bánh (có bánh lùi, em đã dùng ở che-xe) và đủ bốn lệnh tay; 5.9 là màn HỎNG nên khay hẹp hơn (xem dưới).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-tay.1 pass_back()  = pick(), u_turn(), drop(), u_turn()                  chuyền vật ở trước mặt ra ô SAU LƯNG, xe giữ ô và hướng (6 nhịp)
     che-tay.2 put_right()  = pick(), turn_right(), drop(), turn_left()           đặt vật ở trước mặt sang ô bên PHẢI xe, xe giữ ô và hướng (6 nhịp)
     che-tay.4 grab_back()  = u_turn(), pick(), u_turn()                          nhặt vật SAU LƯNG; xong xe đang CẦM vật, mặt như cũ (4 nhịp)
     che-tay.5 drag()       = pick(), back(), back(), drop()                      nhặt vật trước mặt, lùi hai ô, đặt vật xuống trước mặt (6 nhịp)
     che-tay.6 swap()       = pass_back(), turn_right(), pick(), turn_left(), drop(), u_turn(), pick(), turn_left(), drop(), turn_left()
                              vật trước mặt và vật bên phải đổi chỗ (đúng 10 dòng nhờ các hàm vừa chế; viết thẳng thì tràn khung)
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-tay.7 put_back()   thân ban đầu `pass`; lời giải drop(), back(), back()   đi NGƯỢC lại go_get() = move(), move(), pick() của màn: đặt vật về chỗ cũ, xe về chỗ cũ
     che-tay.8 fixed_pick() thân ban đầu = pick() cũ (arm_down, grab, wait, arm_up, wait: tay đấu ngược nên kẹp hụt); lời giải arm_up(), grab(), wait(), arm_down(), wait()
               fixed_drop() thân ban đầu = drop() cũ; lời giải arm_up(), release(), wait(), arm_down(), wait()     tay lắp ngược (daoChieu 'tay'): arm_up() mới là HẠ tay, arm_down() là NÂNG tay
   Hàm của em được SỬA ở chương này (không tính là tạo mới):
     che-tay.9 turn_right() = left_move(), wait()   u_turn() = left_back(), right_move(), wait()    bánh phải KẸT SỐ LÙI (không có right_back): rẽ phải bằng bánh trái tiến,
               quay đầu bằng trái lùi + phải tiến. Cả hai vẫn MỘT nhịp như bản che-xe nên kho dùng chung không đổi nhịp, và vẫn đúng ở mọi màn khác (phần cứng mặc định đủ bánh).

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (nhipTheoLoiGiai: nâng tay có nhịp wait() riêng trong pick() / drop(), nên đường ngắn nhất BFS — do-duong-che-tay.mjs, gộp
   nâng tay với lệnh bánh cùng nhịp — luôn ngắn hơn hay bằng); sao.o = ô của lời giải cách 1.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH_TAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];   // khay cả chương
  var BANH_TAY_HONG = ['left_move', 'right_move', 'left_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];             // 5.9: bánh phải kẹt số lùi (không có right_back)

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_PASS_BACK = ['pick()', 'u_turn()', 'drop()', 'u_turn()'];
  var T_PUT_RIGHT = ['pick()', 'turn_right()', 'drop()', 'turn_left()'];
  var T_GRAB_BACK = ['u_turn()', 'pick()', 'u_turn()'];
  var T_DRAG = ['pick()', 'back()', 'back()', 'drop()'];
  var T_SWAP = ['pass_back()', 'turn_right()', 'pick()', 'turn_left()', 'drop()', 'u_turn()', 'pick()', 'turn_left()', 'drop()', 'turn_left()'];
  var T_PUT_BACK = ['drop()', 'back()', 'back()'];
  var T_PUT_BACK_TRONG = ['pass'];                                                       // thân ban đầu của put_back() ở 5.7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó
  var T_FIXED_PICK = ['arm_up()', 'grab()', 'wait()', 'arm_down()', 'wait()'];
  var T_FIXED_DROP = ['arm_up()', 'release()', 'wait()', 'arm_down()', 'wait()'];
  var T_FIXED_PICK_CU = ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'];            // thân ban đầu của fixed_pick() ở 5.8: pick() cũ, chạy sai vì tay đấu ngược
  var T_FIXED_DROP_CU = ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'];         // thân ban đầu của fixed_drop() ở 5.8: drop() cũ
  var T_TURN_RIGHT_BANH_TRAI = ['left_move()', 'wait()'];
  var T_U_TURN_DOI_BANH = ['left_back()', 'right_move()', 'wait()'];

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['pass_back()'];
  var C_2 = ['put_right()'];
  var C_4 = ['grab_back()'];
  var C_5 = ['drag()'];
  var C_6 = ['swap()'];
  var C_7 = ['go_get()', 'put_back()'];
  var C_8 = ['fixed_pick()', 'move()', 'move()', 'fixed_drop()'];
  var C_9 = ['put_right()', 'u_turn()', 'put_right()', 'u_turn()'];
  // 5.3 (người chơi tự viết): dẹp vật thứ nhất ra sau lưng (hành lang thẳng), tiến ba ô tới góc, rẽ phải, dẹp vật thứ hai sang phải (sau lưng là tường), tiến ba ô tới cờ
  var L_3 = ['pass_back()', 'move()', 'move()', 'move()', 'turn_right()', 'put_right()', 'move()', 'move()', 'move()'];
  // 5.10 (người chơi tự viết): dọn thùng xanh lá sang trái (quay lưng lại thì bên phải xe là bên trái cũ), rồi đổi chỗ hai thùng còn lại
  var L_10 = ['u_turn()', 'put_right()', 'u_turn()', 'swap()'];

  // hàm của màn 5.7: nhặt vật (khóa, xem được)
  var T_GO_GET = ['move()', 'move()', 'pick()'];
  function hGoGet() { return H('go_get', T_GO_GET); }

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'che-tay';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'kep', camBien: [] };
    m.hamGoc = m.hamGoc || BANH_TAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = [];
    if (m.mucTieu !== 'toi-co') m.mucTieu = m.mucTieu || 'bong-mo';
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    m.nhipTheoLoiGiai = true;
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Chuyền ra sau', hang: 'lam-quen',
      hamCuaEmCan: ['pick', 'drop', 'u_turn'], taoHam: ['pass_back'],
      deBai: 'Một vật nằm ngay trước mặt xe. Chương trình chính chỉ gọi pass_back(): em tự chế lệnh này để chuyền vật ra ô sau lưng xe. Xe phải đứng lại đúng chỗ cũ, mặt vẫn quay lên như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi pass_back(). Mở Xưởng hàm, tạo pass_back() rồi bấm Chạy.',
      san: ['.....', '.....', '..o..', '.....', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 2, y: 4 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 18, nhip: 6 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('pass_back', T_PASS_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('pass_back', nhieu(['# chuyền vật ra sau'], T_PASS_BACK))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay trái (chậm hơn hai nhịp)', hamCuaEmMoi: [H('pass_back', ['pick()', 'turn_left()', 'turn_left()', 'drop()', 'turn_left()', 'turn_left()'])] },
        { moTa: 'Viết thẳng lệnh tay và gộp việc nâng tay vào nhịp quay đầu (nhanh hơn)', hamCuaEmMoi: [H('pass_back', ['pick()', 'u_turn()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'left_move()', 'right_back()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quên quay lưng lại: đặt vật xuống lại đúng chỗ cũ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('pass_back', ['pick()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chuyền xong không quay về: xe quay lưng lại với hướng cũ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('pass_back', ['pick()', 'u_turn()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhặt xong không đặt: xe còn cầm vật', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('pass_back', ['pick()', 'u_turn()', 'u_turn()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi pass_back() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Nhặt vật lên, quay lưng lại, đặt xuống rồi quay về. Em đã chế sẵn pick(), drop() và u_turn().', 'Chạy thử rồi so vật với vật mờ: vật nằm lệch về phía nào?']
    }),

    man({
      so: 2, ten: 'Đặt sang phải', hang: 'lam-quen',
      hamCuaEmCan: ['pick', 'drop', 'turn_right', 'turn_left'], taoHam: ['put_right'],
      deBai: 'Vật vẫn nằm trước mặt xe, nhưng lần này vật phải sang ô bên phải xe. Chế lệnh put_right() để đặt vật vào ô đó. Xe giữ nguyên chỗ và hướng, giống xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi put_right(). Mở Xưởng hàm, tạo put_right() rồi bấm Chạy.',
      san: ['.....', '.....', '.o...', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      bongMo: { x: 1, y: 3, huong: 0, vat: [{ x: 2, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 19, nhip: 6 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('put_right', T_PUT_RIGHT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('put_right', nhieu(['# đặt vật sang phải'], T_PUT_RIGHT))]
      },
      congThucKhac: [
        { moTa: 'Quay phải bằng ba lần quay trái (chậm hơn hai nhịp)', hamCuaEmMoi: [H('put_right', ['pick()', 'turn_left()', 'turn_left()', 'turn_left()', 'drop()', 'turn_left()'])] },
        { moTa: 'Viết thẳng lệnh tay và gộp việc nâng tay vào nhịp quay trái (nhanh hơn)', hamCuaEmMoi: [H('put_right', ['pick()', 'turn_right()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'left_back()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quay nhầm sang trái: vật nằm bên trái xe', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('put_right', ['pick()', 'turn_left()', 'drop()', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đặt vật xong không quay lại: xe quay mặt sang phải', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('put_right', ['pick()', 'turn_right()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thả bằng release() thẳng khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('put_right', ['pick()', 'turn_right()', 'release()', 'wait()', 'turn_left()'])], phaiCoMa: ['vat-vo'] },
        { moTa: 'Gọi put_right() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Nhặt vật, quay sang phải, đặt xuống rồi quay lại.', 'Xe phải nhìn lên như xe mờ khi xong.']
    }),

    man({
      so: 3, ten: 'Dọn đường', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: ['move', 'turn_right', 'pass_back', 'put_right'],
      deBai: 'Hai vật chắn lối trong hành lang hẹp, mà xe cần đi tới cờ. Dùng pass_back() và put_right() em đã chế để dẹp vật khỏi đường. Chương trình chỉ có 10 ô.',
      san: ['#####', '#.o.F', '#.###', '#o###', '#.###', '#.###'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 37, nhip: 19 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# dẹp vật rồi tiến'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Hai hàm dẹp vật chế bằng cách quay trái (chậm hơn nhưng vẫn qua)',
          hamCuaEmMoi: [H('pass_back', ['pick()', 'turn_left()', 'turn_left()', 'drop()', 'turn_left()', 'turn_left()']), H('put_right', ['pick()', 'turn_left()', 'turn_left()', 'turn_left()', 'drop()', 'turn_left()'])] },
        { moTa: 'Không dẹp vật thứ hai, nhặt nó và mang theo tới cờ (nhặt xong vật không còn chiếm ô)',
          baiLam: { chinh: ['pass_back()', 'move()', 'move()', 'move()', 'turn_right()', 'pick()', 'move()', 'move()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Không dẹp vật: xe đâm vật chắn lối', baiLam: { chinh: ['move()', 'move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dẹp vật thứ nhất sang phải: bên phải xe là tường nên vật không có chỗ đặt', baiLam: { chinh: ['put_right()', 'move()', 'move()', 'move()', 'turn_right()', 'put_right()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['tha-bi-chan', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên rẽ phải ở góc hành lang: xe nhìn thẳng vào tường', baiLam: { chinh: ['pass_back()', 'move()', 'move()', 'move()', 'put_right()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng lệnh đã chế, viết từng bước nhặt thả: quá 10 ô', baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'right_back()', 'wait()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Vật chắn ngay trước mặt thì dẹp ra sau lưng hoặc sang bên phải. Xe chỉ tiến được khi ô phía trước trống.', 'Dẹp vật phải có ô trống để đặt: nhìn xem sau lưng và bên phải xe, chỗ nào là tường.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Nhặt sau lưng', hang: 'luyen',
      hamCuaEmCan: ['pick', 'u_turn'], taoHam: ['grab_back'],
      deBai: 'Một vật nằm ngay sau lưng xe, một vật khác nằm bên phải xe. Chế lệnh grab_back() để xe nhặt vật sau lưng, quay về nhìn lên và đang cầm vật, giống xe mờ. Vật bên phải phải nằm yên.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi grab_back(). Mở Xưởng hàm, tạo grab_back() rồi bấm Chạy.',
      san: ['.....', '.....', '...o.', '..o..', '.....'],
      batDau: { x: 2, y: 2, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0, cam: true, vat: [{ x: 3, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 12, nhip: 4 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('grab_back', T_GRAB_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('grab_back', nhieu(['# nhặt vật sau lưng'], T_GRAB_BACK))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay trái (chậm hơn hai nhịp)', hamCuaEmMoi: [H('grab_back', ['turn_left()', 'turn_left()', 'pick()', 'turn_left()', 'turn_left()'])] },
        { moTa: 'Viết thẳng lệnh tay và gộp việc nâng tay vào nhịp quay đầu (nhanh hơn)', hamCuaEmMoi: [H('grab_back', ['u_turn()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_back()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quên quay lưng lại: tay kẹp vào không khí trước mặt, vật sau lưng vẫn nằm đó', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('grab_back', ['pick()'])], phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Quay nhầm sang phải: nhặt vật bên phải, còn vật sau lưng bị bỏ lại', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('grab_back', ['turn_right()', 'pick()', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhặt xong không quay về: xe quay mặt xuống', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('grab_back', ['u_turn()', 'pick()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay lưng lại mà quên nhặt: tay không', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('grab_back', ['u_turn()', 'u_turn()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhặt xong đặt xuống lại: tay không còn cầm gì', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('grab_back', ['u_turn()', 'pick()', 'drop()', 'u_turn()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Quay lưng lại, nhặt, rồi quay về chỗ cũ.', 'Xe mờ đang cầm vật trên tay: nhìn xe mờ xem tay kẹp đang giữ gì.']
    }),

    man({
      so: 5, ten: 'Lùi mang hàng', hang: 'luyen',
      hamCuaEmCan: ['pick', 'drop', 'back'], taoHam: ['drag'],
      deBai: 'Xe cần mang một vật lùi về phía sau hai ô. Chế lệnh drag(): nhặt vật trước mặt, lùi hai ô, rồi đặt vật xuống ngay trước mặt. Xe và vật phải nằm đúng chỗ như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi drag(). Mở Xưởng hàm, tạo drag() rồi bấm Chạy.',
      san: ['..o..', '.....', '.....', '.....', '.....'],
      batDau: { x: 2, y: 1, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 2, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 18, nhip: 6 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('drag', T_DRAG)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('drag', nhieu(['# lùi mang hàng'], T_DRAG))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu, tiến hai ô, quay đầu lại rồi đặt (chậm hơn hai nhịp)', hamCuaEmMoi: [H('drag', ['pick()', 'u_turn()', 'move()', 'move()', 'u_turn()', 'drop()'])] },
        { moTa: 'Đặt xong không nâng tay lên: bỏ drop(), viết thẳng lệnh thả (nhanh hơn một nhịp)', hamCuaEmMoi: [H('drag', ['pick()', 'back()', 'back()', 'arm_down()', 'release()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Lùi thiếu một ô: vật nằm sai chỗ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('drag', ['pick()', 'back()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Tiến thay vì lùi: xe và vật đi lên', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('drag', ['pick()', 'move()', 'move()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi mà chưa nhặt: đặt vật không có gì để đặt, vật vẫn ở chỗ cũ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('drag', ['back()', 'back()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên đặt vật xuống: xe vẫn cầm vật', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('drag', ['pick()', 'back()', 'back()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cầm vật mà lùi thì xe không cần quay đầu.', 'Em đã chế sẵn back() để lùi một ô.']
    }),

    man({
      so: 6, ten: 'Đổi chỗ', hang: 'luyen',
      hamCuaEmCan: ['pick', 'drop', 'turn_right', 'turn_left', 'u_turn', 'pass_back'], taoHam: ['swap'],
      deBai: 'Trước mặt xe có một vật đỏ, bên phải xe có một vật xanh dương. Chế lệnh swap() để hai vật đổi chỗ cho nhau, xe vẫn đứng yên nhìn lên. Mỗi hàm chỉ có 10 ô, nên hãy dùng các lệnh em đã chế.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi swap(). Mở Xưởng hàm, tạo swap() rồi bấm Chạy.',
      san: ['.....', '..o..', '...o.', '.....', '.....'],
      vatMau: ['.....', '..r..', '...b.', '.....', '.....'],
      batDau: { x: 2, y: 2, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 2, y: 1, mau: 'blue' }, { x: 3, y: 2, mau: 'red' }] },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 32, nhip: 19 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('swap', T_SWAP)] },
      loiGiaiKhac: {
        moTa: 'Gói ba lệnh lấy vật bên phải vào hàm take_right() (swap() chỉ còn 8 dòng, cùng số nhịp, nhiều ô hơn)',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('take_right', ['turn_right()', 'pick()', 'turn_left()']), H('swap', ['pass_back()', 'take_right()', 'drop()', 'u_turn()', 'pick()', 'turn_left()', 'drop()', 'turn_left()'])]
      },
      congThucKhac: [
        { moTa: 'Dùng grab_back() để lấy vật cất tạm, ngắn hơn một dòng', hamCuaEmMoi: [H('swap', ['pass_back()', 'turn_right()', 'pick()', 'turn_left()', 'drop()', 'grab_back()', 'turn_right()', 'drop()', 'turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Chỉ cất vật đỏ ra sau lưng rồi thôi: hai vật chưa đổi chỗ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('swap', ['pass_back()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi chỗ nhưng bỏ quên bước cuối: quay về nhìn lên', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('swap', ['pass_back()', 'turn_right()', 'pick()', 'turn_left()', 'drop()', 'u_turn()', 'pick()', 'turn_left()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không dùng hàm đã chế, viết từng bước: quá 10 ô', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('swap', ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'left_move()', 'right_back()', 'wait()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'])], phaiCoMa: ['tran-khung'] },
        { moTa: 'Đặt vật xanh lên chỗ vật đỏ còn đứng: ô đã có vật nên không đặt được', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('swap', ['turn_right()', 'pick()', 'turn_left()', 'drop()', 'turn_left()'])], phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] }
      ],
      goiY: ['Cần một ô trống để tạm cất một vật: ô sau lưng xe còn trống.', 'Xe mờ cho biết vật nào phải nằm ở đâu: màu của vật cũng được chấm.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đặt lại chỗ cũ', hang: 'bien-the',
      hamCuaEmCan: ['move', 'pick', 'drop', 'back', 'u_turn'],
      deBai: 'Hàm go_get() của màn đưa xe lên nhặt một vật. Viết thân hàm put_back() của màn để xe đặt vật về đúng chỗ cũ rồi về đúng chỗ và hướng xuất phát, như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_get() rồi put_back(). Hàm go_get() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm put_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Điểm ◆ là chỗ xe đứng nhặt vật.',
      san: ['.....', '..o..', '.....', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 4, huong: 0, diQua: [{ x: 2, y: 2 }], vat: [{ x: 2, y: 1 }] },       // ◆ ở chỗ go_get() dừng nhặt vật: chương trình rỗng hay go_get() hỏng thì không qua ◆, không thể "thắng" chỉ vì xe chưa rời chỗ
      chinhCoDinh: true, khoaHamMan: ['go_get'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', T_PUT_BACK_TRONG)] },
      sao: { o: 24, nhip: 8 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', T_PUT_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', nhieu(['# làm ngược lại go_get()'], T_PUT_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Đặt vật, quay đầu, đi lại đường cũ rồi quay đầu lần nữa (chậm hơn hai nhịp)', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', ['drop()', 'u_turn()', 'move()', 'move()', 'u_turn()'])] } },
        { moTa: 'Đặt vật rồi lùi bằng lệnh bánh viết thẳng, không gọi back()', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', ['drop()', 'left_back()', 'right_back()', 'wait()', 'left_back()', 'right_back()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe cầm vật đứng ở chỗ go_get() dừng, chưa đặt gì', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', T_PUT_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đặt vật rồi để xe đứng yên ở chỗ nhặt: xe chưa về', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', ['drop()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi tiếp thay vì đi ngược lại: xe đâm vào chỗ đặt vật', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', ['drop()', 'move()', 'move()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Lùi trước rồi mới đặt: sai thứ tự, vật đặt giữa đường', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet(), H('put_back', ['back()', 'back()', 'drop()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm put_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoGet()] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại go_get() từng bước, theo thứ tự ngược.', 'Mỗi lệnh có một lệnh ngược: nhặt thì đặt, tiến thì lùi.']
    }),

    man({
      so: 8, ten: 'Tay lắp ngược', hang: 'bien-the',
      hamCuaEmCan: ['move'],
      daoChieu: ['tay'], canhBao: 'Dây tay đấu ngược',
      deBai: 'Dây tay kẹp bị đấu ngược nên hai hàm fixed_pick() và fixed_drop() của màn chạy sai. Sửa chúng cho tay chạy đúng, để chương trình đưa vật lên hai ô như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa: nhặt, tiến hai ô, đặt. Hai hàm của màn đang giống pick() và drop() cũ. Thử chúng trong sân thử của Xưởng hàm trước để thấy tay làm gì.',
      san: ['.....', '.....', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 2, y: 1 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', T_FIXED_PICK_CU), H('fixed_drop', T_FIXED_DROP_CU)] },
      sao: { o: 17, nhip: 6 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', T_FIXED_PICK), H('fixed_drop', T_FIXED_DROP)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', nhieu(['# tay đấu ngược'], T_FIXED_PICK)), H('fixed_drop', T_FIXED_DROP)] }
      },
      congThucKhac: [
        { moTa: 'fixed_pick() bỏ wait() cuối: nâng tay chạy chung nhịp với lệnh đi kế (nhanh hơn một nhịp)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', ['arm_up()', 'grab()', 'wait()', 'arm_down()']), H('fixed_drop', T_FIXED_DROP)] } },
        { moTa: 'Mỗi lệnh tay một nhịp riêng (chậm hơn nhưng vẫn đúng)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', ['arm_up()', 'wait()', 'grab()', 'wait()', 'arm_down()', 'wait()']), H('fixed_drop', ['arm_up()', 'wait()', 'release()', 'wait()', 'arm_down()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hai hàm của màn (còn là pick() và drop() cũ): tay đi ngược nên kẹp hụt', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', T_FIXED_PICK_CU), H('fixed_drop', T_FIXED_DROP_CU)] }, phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Chỉ sửa fixed_pick(), fixed_drop() còn như cũ: thả khi tay còn nâng, vật vỡ', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', T_FIXED_PICK), H('fixed_drop', T_FIXED_DROP_CU)] }, phaiCoMa: ['vat-vo'] },
        { moTa: 'Quên nâng tay sau khi nhặt: tay còn hạ nên xe không đi được', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick', ['arm_up()', 'grab()', 'wait()']), H('fixed_drop', T_FIXED_DROP)] }, phaiCoMa: ['tay-vuong', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hai hàm của màn: lệnh gọi chúng không còn hàm nào', baiLam: { chinh: C_8.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử gọi arm_down() ở sân thử: tay đang đi lên hay đi xuống?', 'Muốn hạ tay xuống thì phải ra lệnh cho tay đi lên.']
    }),

    man({
      so: 9, ten: 'Cần cẩu', hang: 'bien-the', hamGoc: BANH_TAY_HONG,
      hamCuaEmCan: ['put_right', 'u_turn', 'turn_right', 'turn_left'],
      phanCung: BANH_TAY_HONG, canhBao: 'Bánh phải kẹt số lùi',
      deBai: 'Bánh phải của xe kẹt số lùi. Chương trình chính đã có sẵn, nhưng turn_right() và u_turn() của em vẫn dùng số lùi đó. Sửa hai hàm đó để xe chuyển hai vật sang hai bên như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa: chuyển vật trước mặt sang phải, quay lưng lại, chuyển vật vừa tới trước mặt sang phải, rồi quay về. Chạy thử để biết hàm nào của em báo hỏng.',
      san: ['.....', '..o..', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 2, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 2 }, { x: 1, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice() },
      sao: { o: 25, nhip: 14 },
      loiGiai: { chinh: C_9.slice(), hamCuaEmMoi: [H('turn_right', T_TURN_RIGHT_BANH_TRAI), H('u_turn', T_U_TURN_DOI_BANH)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice() },
        hamCuaEmMoi: [H('turn_right', nhieu(['# rẽ phải bằng bánh trái tiến'], T_TURN_RIGHT_BANH_TRAI)), H('u_turn', T_U_TURN_DOI_BANH)]
      },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay trái (chậm hơn một nhịp mỗi lần)', hamCuaEmMoi: [H('turn_right', T_TURN_RIGHT_BANH_TRAI), H('u_turn', ['turn_left()', 'turn_left()'])] },
        { moTa: 'Quay phải bằng ba lần quay trái', hamCuaEmMoi: [H('turn_right', ['turn_left()', 'turn_left()', 'turn_left()']), H('u_turn', T_U_TURN_DOI_BANH)] }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: hai hàm vẫn gọi bánh phải đã hỏng', baiLam: { chinh: C_9.slice() }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Mới sửa turn_right(), u_turn() còn dùng số lùi bánh phải', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('turn_right', T_TURN_RIGHT_BANH_TRAI)], phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Mới sửa u_turn(), turn_right() còn dùng số lùi bánh phải', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('u_turn', T_U_TURN_DOI_BANH)], phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Sửa lộn bánh: rẽ phải thành rẽ trái', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('turn_right', ['left_back()', 'wait()']), H('u_turn', T_U_TURN_DOI_BANH)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên wait() trong hàm đã sửa: lệnh bánh dính sang nhịp sau, lúc tay còn hạ', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('turn_right', ['left_move()']), H('u_turn', T_U_TURN_DOI_BANH)], phaiCoMa: ['tay-vuong', 'lech-bong-mo'] }
      ],
      goiY: ['Một bánh quay một mình thì xe quay. Bánh trái quay tới thì xe quay về phía nào?', 'Quay đầu là hai bánh quay ngược chiều nhau, hoặc hai lần quay cùng một phía.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho đồ', hang: 'trum',
      hamCuaEmCan: ['u_turn', 'put_right', 'swap'],
      huyHieu: { ma: 'che-tay', ten: 'Huy hiệu Chế lệnh tay' },
      gioiHanHam: 4,
      deBai: 'Kho có ba thùng: đỏ ở trước mặt xe, xanh dương bên phải xe, xanh lá sau lưng xe. Xếp lại cho giống vật mờ: thùng xanh dương lên trước, thùng đỏ sang phải, thùng xanh lá sang trái. Chương trình chính chỉ được gọi 4 hàm của em khác nhau.',
      san: ['.....', '.....', '..o..', '...o.', '..o..'],
      vatMau: ['.....', '.....', '..r..', '...b.', '..g..'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 2, y: 2, mau: 'blue' }, { x: 3, y: 3, mau: 'red' }, { x: 1, y: 3, mau: 'green' }] },
      maMau: { chinh: [] },
      sao: { o: 39, nhip: 27 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# dọn thùng xanh lá, đổi chỗ hai thùng'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Nhặt thùng xanh lá bằng grab_back(), quay trái đặt xuống bằng lệnh tay viết thẳng (vẫn đúng 4 hàm khác nhau)',
          baiLam: { chinh: ['grab_back()', 'turn_left()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()', 'turn_right()', 'swap()'] } }
      ],
      loiSai: [
        { moTa: 'Đổi chỗ khi sau lưng còn thùng xanh lá: swap() không còn ô trống để cất tạm', baiLam: { chinh: ['swap()'] }, phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Dùng 5 hàm khác nhau: vượt giới hạn 4 hàm', baiLam: { chinh: ['grab_back()', 'turn_left()', 'drop()', 'turn_right()', 'swap()'] }, phaiCoMa: ['qua-gioi-han-ham'] },
        { moTa: 'Quên đổi chỗ hai thùng: thùng đỏ và xanh dương còn nguyên', baiLam: { chinh: ['u_turn()', 'put_right()', 'u_turn()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết từng bước, không dùng hàm đã chế: quá 10 ô', baiLam: { chinh: ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'left_move()', 'right_back()', 'wait()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Thùng sau lưng làm hết chỗ cất tạm của swap(): dọn nó sang trái trước.', 'Quay lưng lại thì bên phải xe chính là bên trái lúc đầu.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
