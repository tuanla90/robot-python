/* ============================================================================
   man-bang-cu.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 8 "Băng chuyền cũ" (PDM3b 31/10, KE-HOACH-PART-DUNG-MUA.md mục 1 và 3).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3): tệp có trong danh sách require của lo-trinh-hoc.js, TEP_MUA_3 và thẻ <script> của game/choi.html.
     - `bang-cu` (mã bang-cu.1 … bang-cu.10): chương 1 "Né băng, mở cổng": robot phân loại đầy đủ gặp yếu tố mùa 1–2
     - `che-bang-cu` (mã che-bang-cu.1 … che-bang-cu.10): chương 2 "Chế lệnh: qua băng cũ"
   Mỗi màn khai `chuong` và `so`; mã `ma` = chuong + '.' + so là khóa lưu sao, KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manBangCu, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG: gói 8 theo khuôn mới "cỗ máy mùa gặp yếu tố của các mùa trước". R1 là ROBOT PHÂN LOẠI ĐẦY ĐỦ: thân NHỆN (bốn hướng + co/duỗi chân nhảy),
   NAM CHÂM BỤNG (hút / thả ở ô dưới bụng, hai cực N/S), CẢM BIẾN TỪ HÔNG (front_metal + front_pole đo theo cạnh trước cố định).
   Gặp yếu tố mùa 1–2:
     > < ^ v  băng chuyền: nhện đứng trên băng đủ hai nhịp (bước lên rồi chờ hoặc chuẩn bị bước kế) bị băng đẩy một ô theo mũi tên; nhảy vọt qua một ô băng ngược / băng ngang.
     M + C    nút đè và cửa: đặt sắt vụn lên M để giữ cửa C mở (hoặc chờ thùng nặng trên băng chuyền trôi tới đè M); cửa tự động đóng mở theo nhịp (cuaNhip).
     H        thùng nặng: chắn đường (nhện không đẩy được, phải đi vòng); nằm trên băng chuyền (thungThem) thì trôi theo băng tới đè nút M.
     g        thùng gỗ (vatChat 'g'): nam châm không hút được gỗ (hut-go), front_metal() trả về False giúp lọc gỗ lấy sắt.
   Tên hàm của em mới: ride_belt(d), hop_belt(d), hold_gate(d), take_metal_to(d).
   Hàm của màn: pass_old (bang-cu.9), belt_step(d) (che-bang-cu.1), check_gate (che-bang-cu.8).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HG = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var THA = ['magnet_off()', 'wait()'];

  /** Gộp các mảng dòng lệnh thành một mảng phẳng. */
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Tạo đối tượng bài làm chuẩn cho màn học. */
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] }, them || {}); }
  /** Tạo đối tượng định nghĩa hàm. */
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Tạo tọa độ ô (x, y). */
  function o(x, y) { return { x: x, y: y }; }
  /** Tạo nhóm nối từ nút đè (x, y) tới danh sách cửa [[x, y], ...]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }

  /** Điền trường mặc định cho màn chương 1 `bang-cu` trên robot phân loại đầy đủ. */
  function man(m) {
    m.chuong = m.chuong || 'bang-cu';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HG;
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    m.taoHam = m.taoHam || [];
    m.loiSai = m.loiSai || [];
    m.goiY = m.goiY || [];
    if (Array.isArray(m.san[0])) m.nhipTheo = m.nhipTheo || 'max';
    m.ma = m.id = m.chuong + '.' + m.so;
    return ManHoc.chuanHoa(m);
  }

  /** Điền trường mặc định cho màn chương 2 `che-bang-cu`. */
  function che(m) { m.chuong = 'che-bang-cu'; return man(m); }

  var T_RIDE_BELT = ['go(d)', 'wait()'];
  var T_HOP_BELT = ['go(d)', 'jump(d)'];
  var T_HOLD_GATE = ['pull_s()', 'go(d)', 'magnet_off()', 'wait()'];
  var T_TAKE_METAL_TO = ['if front_metal():', '    go("R")', '    pull_s()', '    go(d)', '    magnet_off()', '    wait()', 'else:', '    go("R")', '    go(d)'];

  var DS = [
    /* ================================================= chương bang-cu "Né băng, mở cổng" ================================================= */
    man({
      so: 1, ten: 'Trôi xuôi băng chuyền', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['pull_s'],
      deBai: 'Góc bãi tái chế còn lại dải băng chuyền cũ của nhà máy. Nhện đứng trên băng đủ hai nhịp sẽ bị băng đẩy một ô theo mũi tên. Bấm Chạy xem nhện hút sắt vụn, bước lên băng rồi chờ băng đẩy tới sát ô đích.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem băng chuyền đẩy nhện.',
      san: ['#####', 'o>.D#', '#####'], vatChat: ['.....', 's....', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'go_right()', 'wait()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'go_right()', 'wait()', 'go_right()'], THA)),
      sao: { o: 8, nhip: 7 },
      goiY: ['Một bước go_right() tốn hai nhịp: nhịp đầu chuẩn bị, nhịp hai đặt chân lên băng.', 'Thêm một nhịp wait() trên băng là đủ hai nhịp đứng trên băng: băng đẩy nhện sang phải một ô.']
    }),

    man({
      so: 2, ten: 'Đứng chờ băng đẩy', hang: 'lam-quen',
      hamCuaEmCan: ['pull_s'],
      deBai: 'Hai ô băng chuyền liền nhau đều chảy sang phải. Hút mẩu sắt vụn bằng pull_s(), bước lên ô băng đầu rồi chờ hai nhịp để hai ô băng lần lượt đẩy nhện qua, sau đó bước vào ô đích và thả.',
      veMaMau: 'Chương trình có sẵn thiếu một nhịp chờ trên băng nên dừng trước ô đích.',
      san: ['#####', 'o>>.D', '#####'], vatChat: ['.....', 's....', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'go_right()', 'wait()'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'go_right()', 'wait()', 'wait()', 'go_right()'], THA)),
      sao: { o: 9, nhip: 8 },
      loiSai: [
        { moTa: 'Thiếu bước cuối vào ô đích: thả sắt vụn trước ô đích một ô', baiLam: bai(nhieu(['pull_s()', 'go_right()', 'wait()', 'wait()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên hút sắt vụn: nhện đi một mình tới ô đích', baiLam: bai(nhieu(['go_right()', 'wait()', 'wait()', 'go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mỗi ô băng đẩy nhện một ô khi nhện ở trên nó thêm một nhịp.', 'Qua hết hai ô băng thì nhện ở ngay trước ô đích: thêm go_right() rồi magnet_off(), wait().']
    }),

    man({
      so: 3, ten: 'Nhảy qua băng ngược', hang: 'lam-quen',
      hamCuaEmCan: ['pull_s', 'jump'],
      deBai: 'Ô băng chuyền ở giữa chạy ngược sang trái: bước chân vào đó sẽ bị đẩy lùi lại. Hãy hút mẩu sắt vụn bằng pull_s(), tiến sát mép băng rồi dùng jump("R") nhảy vọt qua băng ngược tới thẳng ô bên kia.',
      veMaMau: 'Chương trình có sẵn đi bộ vào băng ngược nên bị đẩy lùi.',
      san: ['#####', 'o.<.D', '#####'], vatChat: ['.....', 's....', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'go_right()', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'go_right()', 'jump("R")', 'go_right()'], THA)),
      sao: { o: 20, nhip: 9 },
      loiSai: [
        { moTa: 'Đi bộ vào băng ngược: bị đẩy lùi, thả sắt vụn chưa tới đích', baiLam: bai(nhieu(['pull_s()', 'go_right()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhảy ngay từ ô đầu: đáp đúng lên ô băng ngược nên bị đẩy lùi', baiLam: bai(nhieu(['pull_s()', 'jump("R")', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Bước một ô tới sát mép băng ngược rồi mới gọi jump("R").', 'Nhảy qua một ô tương tự như nhảy qua hố.']
    }),

    man({
      so: 4, ten: 'Nhảy qua băng ngang', hang: 'luyen',
      hamCuaEmCan: ['grab_pole', 'jump'],
      deBai: 'Vật nam châm nằm ở (1,0) chưa rõ cực trên mặt. Ô băng chuyền ở (3,0) chảy xuống cái hố ngay bên dưới: bước vào băng sẽ bị đẩy rơi xuống hố. Dùng grab_pole() hút vật rồi nhảy qua ô băng ngang tới đích.',
      veMaMau: 'Chương trình có sẵn đi bộ qua ô băng ngang nên bị đẩy xuống hố.',
      san: [['.o.vD', '###u#'], ['.o.vD', '###u#']],
      vatChat: [['.N...', '.....'], ['.S...', '.....']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(nhieu(['grab_pole()', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['grab_pole()', 'go_right()', 'jump("R")'], THA)),
      sao: { o: 22, nhip: 8 },
      loiSai: [
        { moTa: 'Đi bộ vào băng ngang: bị băng đẩy xuống hố bên dưới', baiLam: bai(nhieu(['grab_pole()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['roi-ho'] },
        { moTa: 'Luôn bật cực N: gặp vật cực N thì cùng cực, nằm yên', baiLam: bai(nhieu(['magnet_n()', 'go_right()', 'go_right()', 'jump("R")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['grab_pole() đọc cực vật ở (1,0), chọn cực ngược rồi bước lên hút.', 'Từ (1,0) bước thêm một ô sang (2,0) rồi jump("R") qua băng ngang (3,0) đáp thẳng vào D (4,0).']
    }),

    man({
      so: 5, ten: 'Thùng nặng mở cổng', hang: 'luyen',
      hamCuaEmCan: ['pull_s'],
      deBai: 'Trên làn băng phía trên có một thùng nặng đang trôi về phía nút đè M. Khi thùng đè lên M, cánh cửa C ở làn dưới sẽ mở ra và giữ mở. Hãy hút mẩu sắt vụn bằng pull_s() rồi đi qua cửa C tới ô đích.',
      veMaMau: 'Chương trình có sẵn quên hút sắt vụn nên vừa chạy sớm đụng cửa đóng vừa bỏ quên hàng.',
      san: ['#>>M#', 'o..CD'], vatChat: ['.....', 's....'],
      thungThem: [{ x: 1, y: 0 }],
      noi: [noi(3, 0, [[3, 1]])],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['go_right()', 'go_right()', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'go_right()', 'go_right()', 'go_right()', 'go_right()'], THA)),
      sao: { o: 9, nhip: 10 },
      loiSai: [
        { moTa: 'Không hút sắt vụn: đi sớm đụng cửa chưa kịp mở và bỏ lại sắt', baiLam: bai(nhieu(['go_right()', 'go_right()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dừng lại ở ô cửa: chưa bước vào ô đích đã thả', baiLam: bai(nhieu(['pull_s()', 'go_right()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Trong lúc nhện pull_s() và đi tới trước cửa, băng chuyền đã đẩy thùng nặng lên nút đè M.', 'Khi cửa C mở, đi thẳng qua cửa tới D rồi thả.']
    }),

    man({
      so: 6, ten: 'Sắt đè nút mở cổng', hang: 'luyen', mucTieu: 'toi-co',
      hamCuaEmCan: ['pull_s', 'walk'],
      deBai: 'Nút đè M nằm cách cánh cửa C một ô trống: nếu nhện tự đứng lên M rồi bước đi thì vừa rời M là cửa C đóng sập lại. Hãy hút mẩu sắt vụn bằng pull_s(), mang đặt lên M để giữ cửa mở rồi đi qua cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn không đặt sắt lên M nên khi tới cửa thì cửa đã đóng.',
      san: ['#######', 'o.M.CF#', '#######'], vatChat: ['.......', 's......', '.......'],
      noi: [noi(2, 1, [[4, 1]])],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['walk("RRRRR")']),
      loiGiai: bai(nhieu(['pull_s()', 'walk("RR")'], THA, ['walk("RRR")'])),
      sao: { o: 17, nhip: 12 },
      loiSai: [
        { moTa: 'Không mang sắt đặt lên M: rời M là cửa C đóng lại, đụng cửa', baiLam: bai(['walk("RRRRR")']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Hút sắt nhưng quên thả xuống M: mang sắt đi theo nên rời M là cửa đóng', baiLam: bai(['pull_s()', 'walk("RRRRR")']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Hút mẩu sắt ở (0,1) bằng pull_s(), đi hai bước sang M (2,1) rồi gọi magnet_off(), wait().', 'Mẩu sắt nằm lại trên M sẽ giữ cửa C (4,1) mở để nhện walk("RRR") tới cờ F (5,1).']
    }),

    man({
      so: 7, ten: 'Lọc gỗ lấy sắt mở cổng', hang: 'bien-the', mucTieu: 'toi-co',
      hamCuaEmCan: ['bring', 'walk'],
      deBai: 'Cánh cửa C trước cờ chỉ mở khi có sắt nằm đè trên nút M. Một vật ở ngay bên phải nhện, vật kia ở hàng dưới: một bên là sắt vụn, một bên là thùng gỗ (nam châm không hút được gỗ). Dùng front_metal() chọn đúng mẩu sắt rồi dùng bring(path) mang lên M.',
      veMaMau: 'Chương trình có sẵn luôn lấy vật ở hàng trên nên gặp bãi để thùng gỗ ở hàng trên sẽ hút trượt.',
      san: [['.oM.CF', '.o...#'], ['.oM.CF', '.o...#']],
      vatChat: [['.s....', '.g....'], ['.g....', '.s....']],
      noi: [[noi(2, 0, [[4, 0]])], [noi(2, 0, [[4, 0]])]],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(['go_right()', 'bring("R")', 'walk("RRR")']),
      loiGiai: bai(['if front_metal():', '    go_right()', '    bring("R")', 'else:', '    walk("DR")', '    bring("RU")', 'walk("RRR")']),
      sao: { o: 22, nhip: 16 },
      loiSai: [
        { moTa: 'Luôn lấy vật ở (1,0): bãi 2 ô đó là thùng gỗ nên không có gì đè nút M, đụng cửa đóng', baiLam: bai(['go_right()', 'bring("R")', 'walk("RRR")']), phaiCoMa: ['hut-go', 'dam-tuong'] },
        { moTa: 'Luôn lấy vật ở (1,1): bãi 1 ô đó là thùng gỗ nên cửa không mở', baiLam: bai(['walk("DR")', 'bring("RU")', 'walk("RRR")']), phaiCoMa: ['hut-go', 'dam-tuong'] }
      ],
      goiY: ['Ở (0,0) gọi front_metal(): nếu True thì sắt ở (1,0), bước sang rồi bring("R") lên M (2,0).', 'Nếu False thì sắt ở (1,1) hàng dưới: walk("DR") tới vật rồi bring("RU") lên M (2,0), cuối cùng walk("RRR") tới cờ F.']
    }),

    man({
      so: 8, ten: 'Canh nhịp cửa đóng mở', hang: 'bien-the',
      hamCuaEmCan: ['pull_s', 'walk'],
      deBai: 'Cánh cửa C là cửa tự động đóng mở theo nhịp. Hút mẩu sắt vụn bằng pull_s(), đi tới sát trước cửa, chờ một nhịp cho cửa mở ra rồi bước qua cửa tới ô đích.',
      veMaMau: 'Chương trình có sẵn lao thẳng vào cửa lúc cửa đang đóng.',
      san: ['#####', 'o..CD', '#####'], vatChat: ['.....', 's....', '.....'],
      cuaNhip: [{ x: 3, y: 1, mo: 2, dong: 2, pha: 1 }],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'walk("RRRR")'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'walk("RR")', 'wait()', 'walk("RR")'], THA)),
      sao: { o: 18, nhip: 11 },
      loiSai: [
        { moTa: 'Không chờ trước cửa: nhịp bước vào đúng lúc cửa đang đóng nên đụng cửa', baiLam: bai(nhieu(['pull_s()', 'walk("RRRR")'], THA)), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Đi hai bước tới (2,1) sát trước cửa C.', 'Gọi wait() một nhịp cho cửa mở rồi walk("RR") qua cửa tới D và thả.']
    }),

    man({
      so: 9, ten: 'Sửa hàm qua góc kho cũ', hang: 'bien-the', chinhCoDinh: true,
      hamCuaEmCan: ['pull_s', 'jump', 'walk'],
      deBai: 'Thùng nặng H chắn giữa đường, phía sau lại có ô băng chuyền ngược. Hàm pass_old() của màn đã vòng qua thùng nặng nhưng lại đi bộ vào băng ngược. Hãy sửa pass_old() để nhảy qua băng ngược.',
      veMaMau: 'Chương trình chính đã khóa. Mở Xưởng hàm sửa pass_old() rồi bấm Chạy.',
      san: ['.....', 'oH.<D', '#####'],
      vatChat: ['.....', 's....', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'pass_old()'], THA), { hamCuaMan: [H('pass_old', [], ['walk("URRD")', 'go_right()', 'go_right()'])] }),
      loiGiai: bai(nhieu(['pull_s()', 'pass_old()'], THA), { hamCuaMan: [H('pass_old', [], ['walk("URRD")', 'jump("R")'])] }),
      sao: { o: 22, nhip: 13 },
      loiSai: [
        { moTa: 'Chưa sửa pass_old(): đi bộ vào băng ngược bị đẩy lùi', baiLam: bai(nhieu(['pull_s()', 'pass_old()'], THA), { hamCuaMan: [H('pass_old', [], ['walk("URRD")', 'go_right()', 'go_right()'])] }), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đổi walk("URRD") thành đi thẳng: đụng thùng nặng H ở (1,1)', baiLam: bai(nhieu(['pull_s()', 'pass_old()'], THA), { hamCuaMan: [H('pass_old', [], ['go_right()', 'go_right()', 'jump("R")'])] }), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Sau walk("URRD"), nhện đứng ở (2,1), ngay trước ô băng ngược (3,1).', 'Thay hai dòng go_right() cuối trong pass_old() bằng jump("R") để đáp thẳng vào D (4,1).']
    }),

    man({
      so: 10, ten: 'Trùm: Góc bãi băng cũ', hang: 'trum',
      hamCuaEmCan: ['grab_pole', 'jump', 'walk'],
      deBai: 'Hai vật nam châm ở hai bãi có cực khác nhau. Thùng nặng trên băng chuyền trên sẽ trôi tới đè nút M mở cửa C. Hãy dùng grab_pole() hút vật nam châm, đi qua cửa C vừa mở, nhảy qua dải băng ngang chắn trên miệng hố rồi thả vật vào ô đích.',
      veMaMau: 'Chương trình có sẵn mới hút vật nam châm bằng grab_pole().',
      san: [['#>>M###', '.o.C.vD', '#####u#'], ['#>>M###', '.o.C.vD', '#####u#']],
      vatChat: [['.......', '.N.....', '.......'], ['.......', '.S.....', '.......']],
      thungThem: [[{ x: 1, y: 0 }], [{ x: 1, y: 0 }]],
      noi: [[noi(3, 0, [[3, 1]])], [noi(3, 0, [[3, 1]])]],
      batDau: [{ x: 0, y: 1, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      maMau: bai(['grab_pole()']),
      loiGiai: bai(nhieu(['grab_pole()', 'walk("RRR")', 'jump("R")'], THA)),
      sao: { o: 24, nhip: 12 },
      loiSai: [
        { moTa: 'Đi bộ qua ô băng ngang (5,1): bị băng đẩy rơi xuống hố (5,2)', baiLam: bai(nhieu(['grab_pole()', 'walk("RRRRR")'], THA)), phaiCoMa: ['roi-ho'] },
        { moTa: 'Luôn bật cực N: bãi 1 vật cực N nằm yên', baiLam: bai(nhieu(['magnet_n()', 'walk("RRRR")', 'jump("R")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['grab_pole() đưa nhện tới (1,1) và hút vật nam châm đúng cực; lúc đó thùng nặng trên băng cũng kịp đè nút M mở cửa C (3,1).', 'Đi ba bước sang phải tới (4,1) sát băng ngang, gọi jump("R") đáp vào D (6,1) rồi thả.']
    }),

    /* ================================================= chương che-bang-cu "Chế lệnh: qua băng cũ" ================================================= */
    che({
      so: 1, ten: 'Hàm lướt theo băng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['belt_step'],
      hamCuaEmCan: ['go', 'pull_s'],
      deBai: 'Hàm belt_step(d) bước vào ô băng chuyền theo hướng d rồi chờ một nhịp để băng đẩy nhện đi thêm một ô nữa. Bấm Chạy xem nhện lướt qua hai dải băng tới đích.',
      veMaMau: 'Chương trình và hàm belt_step(d) đã khóa. Bấm Chạy.',
      san: ['#####', 'o>.>D', '#####'], vatChat: ['.....', 's....', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'belt_step("R")', 'belt_step("R")'], THA), { hamCuaMan: [H('belt_step', ['d'], T_RIDE_BELT)] }),
      loiGiai: bai(nhieu(['pull_s()', 'belt_step("R")', 'belt_step("R")'], THA), { hamCuaMan: [H('belt_step', ['d'], T_RIDE_BELT)] }),
      sao: { o: 17, nhip: 8 },
      goiY: ['Mở Xưởng hàm xem thân belt_step(d): go(d) rồi wait().', 'Màn sau bạn sẽ tự chế hàm ride_belt(d) giống như vậy.']
    }),

    che({
      so: 2, ten: 'Chế ride_belt(d)', hang: 'lam-quen', taoHam: ['ride_belt'], chinhCoDinh: true,
      hamCuaEmCan: ['go', 'pull_s'],
      deBai: 'Chế hàm ride_belt(d): bước một ô theo hướng d bằng go(d), rồi wait() một nhịp để băng chuyền đẩy nhện đi tiếp một ô.',
      veMaMau: 'Chương trình chính đã khóa và gọi ride_belt("R"). Mở Xưởng hàm tạo ride_belt(d).',
      san: ['#####', 'o>.>D', '#####'], vatChat: ['.....', 's....', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'ride_belt("R")', 'ride_belt("R")'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'ride_belt("R")', 'ride_belt("R")'], THA), { hamCuaEmMoi: [H('ride_belt', ['d'], T_RIDE_BELT)] }),
      sao: { o: 17, nhip: 8 },
      loiSai: [
        { moTa: 'Chưa tạo hàm ride_belt mà đã bấm Chạy', baiLam: bai(nhieu(['pull_s()', 'ride_belt("R")', 'ride_belt("R")'], THA)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong ride_belt quên wait(): băng chưa kịp đẩy nên nhện dừng trước đích', baiLam: bai(nhieu(['pull_s()', 'ride_belt("R")', 'ride_belt("R")'], THA)), hamCuaEmMoi: [H('ride_belt', ['d'], ['go(d)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm ride_belt(d) chỉ hai dòng: go(d) rồi wait().', 'Mỗi lần gọi ride_belt("R") trên dải o>.>D đưa nhện tiến hai ô chỉ trong ba nhịp.']
    }),

    che({
      so: 3, ten: 'Khúc cua băng chuyền', hang: 'lam-quen',
      hamCuaEmCan: ['ride_belt', 'pull_s'],
      deBai: 'Đường băng chuyền gập góc chữ L: đoạn ngang chảy sang phải, đoạn dọc chảy xuống dưới. Hút mẩu sắt vụn bằng pull_s() rồi dùng ride_belt("R") và ride_belt("D") để lướt tới ô đích.',
      veMaMau: 'Chương trình có sẵn mới lướt hết đoạn ngang.',
      san: ['o>.#', '##v#', '##D#'],
      vatChat: ['s...', '....', '....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['pull_s()', 'ride_belt("R")']),
      loiGiai: bai(nhieu(['pull_s()', 'ride_belt("R")', 'ride_belt("D")'], THA)),
      sao: { o: 17, nhip: 8 },
      loiSai: [
        { moTa: 'Đoạn dọc gọi ride_belt("R") thay vì "D": nhện đâm tường bên phải', baiLam: bai(nhieu(['pull_s()', 'ride_belt("R")', 'ride_belt("R")'], THA)), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên thả sắt vụn ở ô đích', baiLam: bai(['pull_s()', 'ride_belt("R")', 'ride_belt("D")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sau ride_belt("R"), nhện đứng ở đầu cột dọc (2,0).', 'Gọi ride_belt("D") để băng dọc đẩy xuống tới thẳng ô đích (2,2) rồi thả.']
    }),

    che({
      so: 4, ten: 'Chế hop_belt(d)', hang: 'luyen', taoHam: ['hop_belt'], chinhCoDinh: true,
      hamCuaEmCan: ['go', 'jump', 'pull_s'],
      deBai: 'Chế hàm hop_belt(d): bước một ô theo hướng d bằng go(d) tới sát mép băng ngược, rồi gọi jump(d) nhảy vọt qua ô băng đó.',
      veMaMau: 'Chương trình chính đã khóa. Mở Xưởng hàm tạo hop_belt(d).',
      san: ['######', 'o.<..D', '######'], vatChat: ['......', 's.....', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['pull_s()', 'hop_belt("R")', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'hop_belt("R")', 'go_right()', 'go_right()'], THA), { hamCuaEmMoi: [H('hop_belt', ['d'], T_HOP_BELT)] }),
      sao: { o: 22, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa tạo hàm hop_belt', baiLam: bai(nhieu(['pull_s()', 'hop_belt("R")', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hop_belt nhảy trước rồi mới bước: đáp đúng vào ô băng ngược nên bị đẩy lùi', baiLam: bai(nhieu(['pull_s()', 'hop_belt("R")', 'go_right()', 'go_right()'], THA)), hamCuaEmMoi: [H('hop_belt', ['d'], ['jump(d)', 'go(d)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm hop_belt(d): go(d) rồi jump(d).', 'go(d) đưa nhện tới sát mép băng, jump(d) nhảy qua ô băng đáp sang bên kia.']
    }),

    che({
      so: 5, ten: 'Hai trạm băng ngược', hang: 'luyen',
      hamCuaEmCan: ['hop_belt', 'pull_s'],
      deBai: 'Hành lang có hai ô băng ngược cách đều nhau. Hút mẩu sắt vụn bằng pull_s() rồi dùng vòng for gọi hop_belt("R") hai lần để vượt qua cả hai ô băng tới đích.',
      veMaMau: 'Chương trình có sẵn mới vượt qua ô băng ngược đầu tiên.',
      san: ['#######', 'o.<..<D', '#######'], vatChat: ['.......', 's......', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['pull_s()', 'hop_belt("R")']),
      loiGiai: bai(nhieu(['pull_s()', 'for i in range(2):', '    hop_belt("R")'], THA)),
      sao: { o: 21, nhip: 12 },
      loiSai: [
        { moTa: 'Chỉ gọi hop_belt("R") một lần: dừng ở giữa hai ô băng', baiLam: bai(nhieu(['pull_s()', 'hop_belt("R")'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi bộ thay vì dùng hop_belt: bị băng ngược đẩy lùi', baiLam: bai(nhieu(['pull_s()', 'for i in range(6):', '    go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mỗi lần hop_belt("R") tiến một ô rồi nhảy hai ô, tổng cộng tiến ba ô.', 'Hai lần hop_belt("R") đưa nhện từ (0,1) tới thẳng D (6,1).']
    }),

    che({
      so: 6, ten: 'Chế hold_gate(d)', hang: 'luyen', taoHam: ['hold_gate'], chinhCoDinh: true,
      hamCuaEmCan: ['go', 'pull_s', 'walk'],
      deBai: 'Chế hàm hold_gate(d): hút mẩu sắt dưới bụng bằng pull_s(), bước một ô theo hướng d bằng go(d) lên nút đè M, rồi magnet_off() và wait() để mẩu sắt giữ cửa C mở.',
      veMaMau: 'Chương trình chính đã khóa. Mở Xưởng hàm tạo hold_gate(d).',
      san: ['######', 'oM.CF#', '######'], vatChat: ['......', 's.....', '......'],
      mucTieu: 'toi-co',
      noi: [noi(1, 1, [[3, 1]])],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['hold_gate("R")', 'walk("RRR")']),
      loiGiai: bai(['hold_gate("R")', 'walk("RRR")'], { hamCuaEmMoi: [H('hold_gate', ['d'], T_HOLD_GATE)] }),
      sao: { o: 18, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa tạo hàm hold_gate', baiLam: bai(['hold_gate("R")', 'walk("RRR")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hold_gate quên ngắt nam châm: mẩu sắt vẫn dính bụng nhện nên khi rời M cửa C đóng lại', baiLam: bai(['hold_gate("R")', 'walk("RRR")']), hamCuaEmMoi: [H('hold_gate', ['d'], ['pull_s()', 'go(d)'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thân hàm hold_gate(d): pull_s(), go(d), magnet_off(), wait().', 'Khi thả mẩu sắt xuống M, nút đè được giữ mãi để nhện đi qua cửa C tới cờ F.']
    }),

    che({
      so: 7, ten: 'Mở buồng lấy nam châm', hang: 'bien-the', mucTieu: 'bong-mo',
      hamCuaEmCan: ['hold_gate', 'grab_pole', 'walk'],
      deBai: 'Sau cánh cửa C là một vật nam châm đổi cực theo từng bãi. Dùng hold_gate("R") đặt mẩu sắt ngoài lên nút đè M để giữ cửa C mở, đi qua cửa dùng grab_pole() lấy vật nam châm rồi đặt vào vị trí bóng mờ ở cuối hành lang.',
      veMaMau: 'Chương trình có sẵn mới mở cửa bằng hold_gate("R").',
      san: [['#######', 'oM.C.o.', '#######'], ['#######', 'oM.C.o.', '#######']],
      vatChat: [['.......', 's....N.', '.......'], ['.......', 's....S.', '.......']],
      noi: [[noi(1, 1, [[3, 1]])], [noi(1, 1, [[3, 1]])]],
      bongMo: [
        { x: 6, y: 1, huong: 1, vat: [{ x: 1, y: 1 }, { x: 6, y: 1 }] },
        { x: 6, y: 1, huong: 1, vat: [{ x: 1, y: 1 }, { x: 6, y: 1 }] }
      ],
      batDau: [{ x: 0, y: 1, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      maMau: bai(['hold_gate("R")']),
      loiGiai: bai(nhieu(['hold_gate("R")', 'walk("RRR")', 'grab_pole()', 'go_right()'], THA)),
      sao: { o: 27, nhip: 15 },
      loiSai: [
        { moTa: 'Dùng pull_s() thay vì grab_pole() cho vật trong buồng: bãi 1 vật cực N cùng cực nằm yên', baiLam: bai(nhieu(['hold_gate("R")', 'walk("RRRR")', 'pull_s()', 'go_right()'], THA)), phaiCoMa: ['cung-cuc', 'lech-bong-mo'] },
        { moTa: 'Quên thả vật nam châm xuống ô cuối', baiLam: bai(['hold_gate("R")', 'walk("RRR")', 'grab_pole()', 'go_right()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Sau hold_gate("R") ở (1,1), gọi walk("RRR") tới (4,1) sát trước vật nam châm.', 'Gọi grab_pole() để hút vật ở (5,1), bước sang (6,1) rồi thả.']
    }),

    che({
      so: 8, ten: 'Sửa hàm lọc gỗ mở cổng', hang: 'bien-the', chinhCoDinh: true, mucTieu: 'toi-co',
      hamCuaEmCan: ['pull_s', 'go'],
      deBai: 'Trước mỗi nút đè M có đặt một vật: mẩu sắt hoặc thùng gỗ. Hàm check_gate() của màn viết ngược điều kiện nên lại cố hút thùng gỗ và bỏ qua mẩu sắt. Hãy sửa check_gate() để thấy sắt mới hút đặt lên M.',
      veMaMau: 'Chương trình chính đã khóa. Mở Xưởng hàm sửa check_gate() rồi bấm Chạy.',
      san: [['.oM.oM.CF', '#########'], ['.oM.oM.CF', '#########']],
      vatChat: [['.s..g....', '.........'], ['.g..s....', '.........']],
      noi: [[noi(2, 0, [[7, 0]]), noi(5, 0, [[7, 0]])], [noi(2, 0, [[7, 0]]), noi(5, 0, [[7, 0]])]],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(['check_gate()', 'go_right()', 'check_gate()', 'go_right()', 'go_right()', 'go_right()'], {
        hamCuaMan: [H('check_gate', [], ['if not front_metal():', '    go("R")', '    pull_s()', '    go("R")', '    magnet_off()', '    wait()', 'else:', '    go("R")', '    go("R")'])]
      }),
      loiGiai: bai(['check_gate()', 'go_right()', 'check_gate()', 'go_right()', 'go_right()', 'go_right()'], {
        hamCuaMan: [H('check_gate', [], ['if front_metal():', '    go("R")', '    pull_s()', '    go("R")', '    magnet_off()', '    wait()', 'else:', '    go("R")', '    go("R")'])]
      }),
      sao: { o: 25, nhip: 18 },
      loiSai: [
        { moTa: 'Chưa sửa check_gate(): cố hút thùng gỗ và bỏ qua sắt nên cửa C không mở', baiLam: bai(['check_gate()', 'go_right()', 'check_gate()', 'go_right()', 'go_right()', 'go_right()'], {
          hamCuaMan: [H('check_gate', [], ['if not front_metal():', '    go("R")', '    pull_s()', '    go("R")', '    magnet_off()', '    wait()', 'else:', '    go("R")', '    go("R")'])]
        }), phaiCoMa: ['hut-go', 'dam-tuong'] }
      ],
      goiY: ['front_metal() trả về True khi ô phía trước là sắt, False khi là thùng gỗ.', 'Bỏ chữ not trong dòng if của check_gate().']
    }),

    che({
      so: 9, ten: 'Chế take_metal_to(d)', hang: 'bien-the', taoHam: ['take_metal_to'], chinhCoDinh: true, mucTieu: 'toi-co',
      hamCuaEmCan: ['go', 'pull_s'],
      deBai: 'Chế hàm take_metal_to(d): kiểm tra front_metal(); nếu có sắt thì go("R"), pull_s(), go(d), magnet_off(), wait(); nếu không phải sắt (là thùng gỗ) thì chỉ go("R") rồi go(d) để đi qua.',
      veMaMau: 'Chương trình chính đã khóa. Mở Xưởng hàm tạo take_metal_to(d).',
      san: [['.oM.oM.CF', '#########'], ['.oM.oM.CF', '#########']],
      vatChat: [['.s..g....', '.........'], ['.g..s....', '.........']],
      noi: [[noi(2, 0, [[7, 0]]), noi(5, 0, [[7, 0]])], [noi(2, 0, [[7, 0]]), noi(5, 0, [[7, 0]])]],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(['take_metal_to("R")', 'go_right()', 'take_metal_to("R")', 'go_right()', 'go_right()', 'go_right()']),
      loiGiai: bai(['take_metal_to("R")', 'go_right()', 'take_metal_to("R")', 'go_right()', 'go_right()', 'go_right()'], { hamCuaEmMoi: [H('take_metal_to', ['d'], T_TAKE_METAL_TO)] }),
      sao: { o: 25, nhip: 18 },
      loiSai: [
        { moTa: 'Chưa tạo hàm take_metal_to', baiLam: bai(['take_metal_to("R")', 'go_right()', 'take_metal_to("R")', 'go_right()', 'go_right()', 'go_right()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đảo điều kiện if not front_metal(): cố hút thùng gỗ và bỏ qua sắt nên cửa C đóng', baiLam: bai(['take_metal_to("R")', 'go_right()', 'take_metal_to("R")', 'go_right()', 'go_right()', 'go_right()']),
          hamCuaEmMoi: [H('take_metal_to', ['d'], ['if not front_metal():', '    go("R")', '    pull_s()', '    go(d)', '    magnet_off()', '    wait()', 'else:', '    go("R")', '    go(d)'])], phaiCoMa: ['hut-go', 'dam-tuong'] }
      ],
      goiY: ['Dùng if front_metal(): để chỉ bật nam châm khi vật ở ô bên phải là sắt.', 'Ở nhánh else chỉ cần go("R") rồi go(d) để đi qua thùng gỗ mà không bật nam châm.']
    }),

    che({
      so: 10, ten: 'Trùm: Dây chuyền bãi cũ', hang: 'trum', mucTieu: 'bong-mo',
      hamCuaEmCan: ['hold_gate', 'grab_pole', 'ride_belt', 'hop_belt', 'walk'],
      deBai: 'Dây chuyền bãi cũ kết hợp đủ mọi chướng ngại: dùng hold_gate("R") đặt mẩu sắt lên nút đè M mở cổng, tiến tới dùng grab_pole() hút vật nam châm sau cổng, lướt băng xuôi bằng ride_belt("R"), rồi nhảy qua băng ngược bằng hop_belt("R") đưa vật tới bóng mờ.',
      veMaMau: 'Chương trình có sẵn mới mở cổng bằng hold_gate("R").',
      san: [['#########', 'oM.Co>.<.', '#########'], ['#########', 'oM.Co>.<.', '#########']],
      vatChat: [['.........', 's...N....', '.........'], ['.........', 's...S....', '.........']],
      noi: [[noi(1, 1, [[3, 1]])], [noi(1, 1, [[3, 1]])]],
      bongMo: [
        { x: 8, y: 1, huong: 1, vat: [{ x: 1, y: 1 }, { x: 8, y: 1 }] },
        { x: 8, y: 1, huong: 1, vat: [{ x: 1, y: 1 }, { x: 8, y: 1 }] }
      ],
      batDau: [{ x: 0, y: 1, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      maMau: bai(['hold_gate("R")']),
      loiGiai: bai(nhieu(['hold_gate("R")', 'walk("RR")', 'grab_pole()', 'ride_belt("R")', 'hop_belt("R")'], THA)),
      sao: { o: 36, nhip: 19 },
      loiSai: [
        { moTa: 'Đi bộ qua băng ngược thay vì hop_belt("R"): bị băng ngược đẩy lùi', baiLam: bai(nhieu(['hold_gate("R")', 'walk("RR")', 'grab_pole()', 'ride_belt("R")', 'walk("RR")'], THA)), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng pull_s() thay vì grab_pole(): bãi 1 vật cực N cùng cực nằm yên', baiLam: bai(nhieu(['hold_gate("R")', 'walk("RRR")', 'pull_s()', 'ride_belt("R")', 'hop_belt("R")'], THA)), phaiCoMa: ['cung-cuc', 'lech-bong-mo'] }
      ],
      goiY: ['Sau hold_gate("R") ở (1,1), gọi walk("RR") qua cửa C tới (3,1), rồi gọi grab_pole() để hút vật nam châm ở (4,1).', 'Từ (4,1), ride_belt("R") đưa nhện qua băng xuôi tới (6,1), rồi hop_belt("R") nhảy qua băng ngược (7,1) đáp vào (8,1).']
    })
  ];

  ManHoc.manBangCu = DS;
  if (laNode) module.exports = ManHoc;
})();
