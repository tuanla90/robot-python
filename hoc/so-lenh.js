/* ============================================================================
   so-lenh.js — "Robot Chấn Hưng": DỮ LIỆU SỔ LỆNH (window.SoLenh). Kế hoạch "Chế lệnh" 14/10, mục 3.4.

   Sổ lệnh là màn hình liệt kê MỌI hàm cốt truyện (hàm người chơi tự chế ở một màn nào đó của game) theo nhóm:
   hàm đã chế thì hiện tên + thân hàm (lấy từ kho hàm của em), chưa chế thì hiện "???" + moTa + "chế ở chương …".
   Tệp này chỉ giữ DỮ LIỆU, không biết kho hàm hay giao diện; giao diện ghép với KhoHam (kho.tim(ten)) và ThuTuChuong (tên chương).

   SoLenh.ds         [{ ten, nhom, moTa, chuong, man }]   mọi hàm cốt truyện, đúng một mục cho mỗi tên trong `taoHam` của các màn.
                      ten: tên hàm (khớp taoHam); nhom: mã nhóm (xem tenNhom); moTa: MỘT câu ngắn, lời lớp 5, nói hàm làm việc gì;
                      chuong: mã chương chế hàm đó (ThuTuChuong.ten[chuong] là tên hiển thị); man: mã màn đầu tiên chế nó (vd 'xuong-ham.2').
                      Thứ tự = thứ tự chế trong game (chương trước, màn trước).
   SoLenh.tenNhom    { mã nhóm: tên hiển thị }
   SoLenh.thuTuNhom  [mã nhóm] theo thứ tự nên hiện trong Sổ lệnh (đợt 1 trước, đợt 2 sau)
   SoLenh.lenhGoc    [{ ten, nguoc, moTa }]   các lệnh gốc của robot; nguoc là lệnh ngược (null nếu không có: wait, lệnh cảm biến, bắn / ném…).
                      Cặp lệnh ngược lấy từ SanHoc.LENH_NGUOC (kiem-che-xe.mjs kiểm hai bảng khớp nhau).
   SoLenh.capNguoc() [[tên, tên ngược]]       mỗi cặp lệnh ngược một lần, cho trang "Lệnh gốc".
   SoLenh.tim(ten) / SoLenh.theoNhom(nhom) / SoLenh.theoChuong(chuong)   tiện tra cứu.

   Thêm chương chế hàm mới: thêm mục vào `ds` (và nhóm mới vào tenNhom / thuTuNhom nếu cần). kiem-che-xe.mjs kiểm mọi tên trong taoHam đều có ở đây.
   HÀM CỦA MÀN (15/10) KHÔNG có ở đây: hàm chỉ đúng cho một màn (xe đang hỏng, đường đi riêng của màn: come_back, fixed_move, put_back, fixed_pick, fixed_drop,
   come_home, reverse_run, safe_move2) sống trong màn (`maMau.hamCuaMan`), không vào kho hàm của em, nên không có mục Sổ lệnh. Sổ lệnh chỉ giữ hàm dùng lại được.
   Chạy được trong Node (module.exports) và trình duyệt (window.SoLenh).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var tenNhom = {
    'xe': 'Xe hai bánh',
    'tay': 'Tay gắp',
    'lap': 'Vòng lặp',
    'cam-bien': 'Cảm biến khoảng cách',
    'tham-so': 'Hàm có tham số',
    'bang-chuyen': 'Băng chuyền',
    'nhen': 'Thân nhện',
    'list': 'Danh sách',
    'xich': 'Bánh xích',
    'omni': 'Bánh omni',
    'hoi': 'Súng hơi',
    'mau': 'Cảm biến màu',
    'nam-cham': 'Nam châm',
    'tay-xoay': 'Tay xoay',
    'son': 'Máy sơn',
    'nem': 'Máy ném',
    'drone': 'Drone',
    'hong-ngoai': 'Hồng ngoại'
  };
  var thuTuNhom = ['xe', 'tay', 'lap', 'cam-bien', 'tham-so', 'bang-chuyen', 'nhen', 'list', 'xich', 'omni', 'hoi', 'mau', 'son', 'nam-cham', 'tay-xoay', 'nem', 'drone', 'hong-ngoai'];

  function m(ten, nhom, moTa, chuong, man) { return { ten: ten, nhom: nhom, moTa: moTa, chuong: chuong, man: man }; }

  var ds = [
    // chương 2 · Xưởng hàm
    m('move', 'xe', 'Tiến lên một ô', 'xuong-ham', 'xuong-ham.2'),
    m('turn_right', 'xe', 'Quay xe sang phải một góc vuông', 'xuong-ham', 'xuong-ham.4'),
    m('turn_left', 'xe', 'Quay xe sang trái một góc vuông', 'xuong-ham', 'xuong-ham.5'),
    m('u_turn', 'xe', 'Quay đầu xe, mặt hướng về phía ngược lại', 'xuong-ham', 'xuong-ham.7'),
    m('corner', 'xe', 'Đi hai ô rồi rẽ phải', 'xuong-ham', 'xuong-ham.9'),
    m('stair', 'xe', 'Leo một bậc thang: đi, rẽ phải, đi, rẽ trái', 'xuong-ham', 'xuong-ham.10'),
    m('two', 'xe', 'Leo hai bậc thang liền nhau', 'xuong-ham', 'xuong-ham.10'),
    // chương 3 · Chế lệnh xe
    m('dodge_right', 'xe', 'Né sang phải một ô, giữ hướng', 'che-xe', 'che-xe.1'),
    m('dodge_left', 'xe', 'Né sang trái một ô, giữ hướng', 'che-xe', 'che-xe.2'),
    m('back', 'xe', 'Lùi một ô, mặt vẫn quay như cũ', 'che-xe', 'che-xe.4'),
    m('park', 'xe', 'Lùi vào chỗ đỗ bên phải, đầu xe quay ra đường', 'che-xe', 'che-xe.6'),
    // chương 4 · Tay gắp
    m('pick', 'tay', 'Nhặt vật ở ô trước mặt rồi nâng tay lên', 'tay-gap', 'tay-gap.5'),
    m('drop', 'tay', 'Đặt vật xuống ô trước mặt rồi nâng tay lên', 'tay-gap', 'tay-gap.6'),
    m('carry', 'tay', 'Nhặt vật, đi một ô, rẽ trái, đặt vật xuống rồi quay lại', 'tay-gap', 'tay-gap.10'),
    // chương 5 · Chế lệnh tay (agent che-tay thêm mục ở đây, nhóm 'tay')
    m('pass_back', 'tay', 'Chuyền vật trước mặt ra ô sau lưng, xe giữ chỗ và hướng', 'che-tay', 'che-tay.1'),
    m('put_right', 'tay', 'Đặt vật trước mặt sang ô bên phải, xe giữ chỗ và hướng', 'che-tay', 'che-tay.2'),
    m('grab_back', 'tay', 'Nhặt vật sau lưng rồi quay về, tay vẫn đang cầm vật', 'che-tay', 'che-tay.4'),
    m('drag', 'tay', 'Nhặt vật, lùi hai ô rồi đặt vật xuống trước mặt', 'che-tay', 'che-tay.5'),
    m('swap', 'tay', 'Đổi chỗ vật ở trước mặt với vật ở bên phải', 'che-tay', 'che-tay.6'),
    // chương 6 · Vòng lặp
    m('side', 'lap', 'Đi thẳng ba ô', 'vong-lap', 'vong-lap.6'),
    m('row', 'lap', 'Đi thẳng sáu ô', 'vong-lap', 'vong-lap.10'),
    m('bend_left', 'lap', 'Rẽ trái, đi hai ô rồi rẽ trái nữa', 'vong-lap', 'vong-lap.10'),
    m('bend_right', 'lap', 'Rẽ phải, đi hai ô rồi rẽ phải nữa', 'vong-lap', 'vong-lap.10'),
    // chương 7 · Chế lệnh có for
    m('dash', 'lap', 'Chạy thẳng bốn ô', 'che-lap', 'che-lap.1'),
    m('square', 'lap', 'Đi một vòng vuông cạnh hai ô, về đúng chỗ cũ', 'che-lap', 'che-lap.2'),
    m('zigzag', 'lap', 'Lên ba bậc chéo sang phải, giữ nguyên hướng', 'che-lap', 'che-lap.4'),
    m('sweep', 'lap', 'Dời ba vật thẳng hàng sang ô bên phải mỗi vật', 'che-lap', 'che-lap.5'),
    m('ring', 'lap', 'Đi một vòng vuông cạnh ba ô, về đúng chỗ cũ', 'che-lap', 'che-lap.6'),
    // chương 8 · Cảm biến khoảng cách
    m('go_wall', 'cam-bien', 'Đi thẳng cho tới khi trước mặt là tường', 'khoang-cach', 'khoang-cach.5'),
    // chương 9 · Chế lệnh có if, while
    m('safe_move', 'cam-bien', 'Tiến một ô nếu trước mặt trống, không thì đứng yên', 'che-cam-bien', 'che-cam-bien.1'),
    m('face_open', 'cam-bien', 'Quay phải cho tới khi trước mặt trống', 'che-cam-bien', 'che-cam-bien.2'),
    m('to_gap', 'cam-bien', 'Đi thẳng cho tới khi bên phải xe có cửa mở', 'che-cam-bien', 'che-cam-bien.4'),
    m('bounce', 'cam-bien', 'Đi tới tường rồi lùi về đúng chỗ cũ, đếm số ô bằng biến n', 'che-cam-bien', 'che-cam-bien.5'),
    m('follow_right', 'cam-bien', 'Một bước bám tường bên tay phải', 'che-cam-bien', 'che-cam-bien.6'),
    m('fetch_back', 'cam-bien', 'Đi tới vật, nhặt, lùi về chỗ cũ rồi đặt vật xuống', 'che-cam-bien', 'che-cam-bien.9'),
    // chương 10 · Robot hoàn thiện (agent robot-hoan-thien thêm mục ở đây nếu chương có hàm cốt truyện)
    // đợt 2: hàm có tham số
    m('forward', 'tham-so', 'Tiến n ô liền nhau', 'tham-so', 'tham-so.3'),
    m('right', 'tham-so', 'Quay phải k lần', 'tham-so', 'tham-so.4'),
    m('deliver', 'tham-so', 'Nhặt vật, tiến n ô rồi đặt vật xuống', 'tham-so', 'tham-so.6'),
    m('step', 'tham-so', 'Đi ngang a ô rồi đi xuống b ô, làm trọn một bậc thang', 'tham-so', 'tham-so.8'),
    // đợt 2: thân nhện
    m('go', 'nhen', 'Nhện đi một bước theo một chữ: U lên, D xuống, L trái, R phải', 'nhen', 'nhen.4'),
    m('walk', 'nhen', 'Nhện đi hết một chuỗi chỉ đường', 'nhen', 'nhen.6'),
    // chương 14 · Chế lệnh nhện
    m('crawl', 'nhen', 'Co chân, bò qua gầm thấp theo hướng d rồi duỗi chân lại', 'che-nhen', 'che-nhen.1'),
    m('jump', 'nhen', 'Nhảy qua một ô theo hướng d, đáp xuống ô bên kia', 'che-nhen', 'che-nhen.2'),
    m('leap', 'nhen', 'Nhảy liên tiếp theo từng chữ của chuỗi chỉ đường', 'che-nhen', 'che-nhen.4'),
    m('crawl_jump', 'nhen', 'Bò qua gầm rồi nhảy luôn qua cái hố ngay sau gầm', 'che-nhen', 'che-nhen.5'),
    m('bring', 'nhen', 'Nhặt vật, đi theo chuỗi chỉ đường rồi đặt vật xuống', 'che-nhen', 'che-nhen.6'),
    // chương 16 · Chế lệnh danh sách (route, route_left, scan, box; go_out, come_back, scan2, scan3 là hàm CỦA MÀN nên không có ở đây; tour, tour_left của chương Danh sách cũng vậy)
    m('route', 'list', 'Đi theo từng số trong danh sách, hết mỗi đoạn thì rẽ phải', 'che-list', 'che-list.1'),
    m('route_left', 'list', 'Đi theo từng số trong danh sách, hết mỗi đoạn thì rẽ trái', 'che-list', 'che-list.2'),
    m('scan', 'list', 'Đi tới khi trước mặt có tường, ghi số ô đã đi vào danh sách', 'che-list', 'che-list.4'),
    m('box', 'list', 'Đi nốt ba cạnh hình vuông, mỗi cạnh dài bằng số đầu danh sách', 'che-list', 'che-list.5'),
    // đợt 2: bánh xích, bánh omni
    m('tr_right', 'xich', 'Xe xích quay phải một góc vuông (hai nhịp)', 'xich', 'xich.3'),
    m('tr_left', 'xich', 'Xe xích quay trái một góc vuông (hai nhịp)', 'xich', 'xich.4'),
    // chương Chế lệnh xích (spin, sidestep, climb, descend, pick_behind; to_hill, back_home, fixed_drive, fixed_turn là hàm của màn nên không có ở đây; tr_right được SỬA ở che-xich.9 chứ không tạo mới)
    m('spin', 'xich', 'Quay xe xích nửa vòng tại chỗ, mặt hướng về phía ngược lại', 'che-xich', 'che-xich.1'),
    m('sidestep', 'xich', 'Né sang phải một ô, mặt xe xích giữ nguyên hướng', 'che-xich', 'che-xich.2'),
    m('climb', 'xich', 'Leo n bậc: mỗi bậc đi một ô, rẽ trái, đi một ô rồi rẽ phải', 'che-xich', 'che-xich.4'),
    m('descend', 'xich', 'Lùi xuống n bậc, làm ngược lại climb, không cần quay đầu', 'che-xich', 'che-xich.5'),
    m('pick_behind', 'xich', 'Nhặt vật sau lưng rồi quay về, tay vẫn đang cầm vật', 'che-xich', 'che-xich.6'),
    m('slide_r', 'omni', 'Trượt sang phải n ô, mặt xe không đổi', 'omni', 'omni.3'),
    m('slide_l', 'omni', 'Trượt sang trái n ô, mặt xe không đổi', 'omni', 'omni.4'),
    // chương Chế lệnh omni (diag, zig, bypass, cross, shift; hop_right, north, east, step_out, step_back là hàm của màn nên không có ở đây)
    m('diag', 'omni', 'Đi chéo lên phía phải một ô, mặt xe không đổi', 'che-omni', 'che-omni.1'),
    m('zig', 'omni', 'Đi chéo lên phía phải n bước liền nhau', 'che-omni', 'che-omni.2'),
    m('bypass', 'omni', 'Vòng qua khối tường chắn ngay trước mặt, đứng ngay sau nó', 'che-omni', 'che-omni.4'),
    m('cross_belt', 'omni', 'Qua hai băng chuyền chạy xuống rồi về cùng hàng', 'che-omni', 'che-omni.5'),
    m('shift', 'omni', 'Dời vật trước mặt sang cột bên phải, xe về chỗ cũ', 'che-omni', 'che-omni.6'),
    // chương Chế lệnh súng hơi (jet_back, jet_fwd, kick_right, tap_right, kick_left, kick_ahead; fixed_jet, fixed_kick, go_out, come_back là hàm CỦA MÀN nên không có ở đây)
    m('jet_back', 'hoi', 'Lùi một ô bằng cú giật của súng, mặt vẫn quay như cũ', 'che-sung-hoi', 'che-sung-hoi.1'),
    m('jet_fwd', 'hoi', 'Tiến một ô bằng cú giật của nòng sau, mặt vẫn quay như cũ', 'che-sung-hoi', 'che-sung-hoi.2'),
    m('kick_right', 'hoi', 'Đá thùng nặng bên phải xe trượt sang phải, xe giữ chỗ và hướng', 'che-sung-hoi', 'che-sung-hoi.4'),
    m('tap_right', 'hoi', 'Bắn nút bên phải xe rồi về đúng chỗ cũ, mặt vẫn quay như cũ', 'che-sung-hoi', 'che-sung-hoi.5'),
    m('kick_left', 'hoi', 'Đá thùng nặng bên trái xe trượt sang trái, xe giữ chỗ và hướng', 'che-sung-hoi', 'che-sung-hoi.6'),
    m('kick_ahead', 'hoi', 'Đá thùng nặng ngay trước mặt trượt đi xa, xe quay mặt như cũ', 'che-sung-hoi', 'che-sung-hoi.8'),
    // chương Lực bắn (tap_left, pick_fire là hàm của màn nên không có ở đây)
    m('fire', 'hoi', 'Bắn ra trước với lực p, "fast" hay "charge", rồi chờ một nhịp', 'luc-ban', 'luc-ban.4'),
    m('fire_back', 'hoi', 'Bắn ra sau với lực p rồi chờ một nhịp', 'luc-ban', 'luc-ban.5'),
    m('smart_fire', 'hoi', 'Trước mũi trống thì bắn tụ cho bóng bay xa, có vật sát mũi thì bắn nhanh', 'luc-ban', 'luc-ban.8'),
    // đợt 2: cảm biến màu, nam châm, máy ném, drone
    m('read_turn', 'mau', 'Đọc màu dưới xe: đỏ thì rẽ phải, xanh dương thì rẽ trái', 'mau', 'mau.5'),
    // chương Chế lệnh màu (go_out, come_back, line_step, trace là hàm của màn nên không có ở đây)
    m('to_red', 'mau', 'Đi thẳng cho tới khi xe đứng trên ô đỏ', 'che-mau', 'che-mau.1'),
    m('cross', 'mau', 'Đi thẳng qua hết dải ô cùng màu với ô đang đứng', 'che-mau', 'che-mau.2'),
    m('stop_line', 'mau', 'Dừng sát trước vạch đỏ: lên vạch rồi lùi lại một ô', 'che-mau', 'che-mau.4'),
    m('follow_line', 'mau', 'Đi theo vạch kẻ đỏ, xanh dương cho tới khi gặp ô vàng', 'che-mau', 'che-mau.5'),
    m('sort_color', 'mau', 'Vật đỏ chuyền sang ô bên phải, vật xanh dương sang ô bên trái', 'che-mau', 'che-mau.6'),
    // chương Máy sơn + Chế lệnh máy sơn (nhóm 'son'; stair_step là hàm của màn nên không có ở đây)
    m('dots', 'son', 'Chấm n chấm cách nhau một ô theo hướng xe', 'may-son', 'may-son.6'),
    m('frame', 'son', 'Vẽ khung vuông cạnh ba ô rồi về đúng chỗ, đúng hướng cũ', 'may-son', 'may-son.10'),
    m('line', 'son', 'Hạ đầu sơn, đi n bước rồi nhấc đầu sơn: nét n + 1 ô', 'che-may-son', 'che-may-son.1'),
    m('color_line', 'son', 'Chọn màu c rồi vẽ nét n + 1 ô', 'che-may-son', 'che-may-son.2'),
    m('next_row', 'son', 'Lùi n ô về đầu hàng rồi xuống hàng dưới, giữ hướng', 'che-may-son', 'che-may-son.3'),
    m('stripes', 'son', 'Mỗi màu trong danh sách vẽ một sọc bốn ô, sọc nọ dưới sọc kia', 'che-may-son', 'che-may-son.5'),
    m('copy_row', 'son', 'Đọc màu n ô bằng cảm biến, xuống hàng dưới rồi chép lại đúng các màu đó', 'che-may-son', 'che-may-son.6'),
    m('grid', 'son', 'Lưới chấm r hàng, mỗi hàng k chấm, hàng cách hàng một ô', 'che-may-son', 'che-may-son.7'),
    m('border', 'son', 'Khung vuông mỗi cạnh đi n bước, về chỗ cũ', 'che-may-son', 'che-may-son.8'),
    m('fill_gaps', 'son', 'Đi qua n ô, ô nào chưa có sơn thì chấm màu c', 'che-may-son', 'che-may-son.9'),
    m('fetch', 'nam-cham', 'Hút vật sắt trước mặt, quay đầu, tiến một ô rồi thả vật', 'nam-cham', 'nam-cham.5'),
    m('grip', 'nam-cham', 'Bật cực khác chữ trên vật nam châm trước mặt để kéo nó về', 'nam-cham', 'nam-cham.6'),
    // chương Chế lệnh nam châm (kick, reel, lane, sort, fling; fixed_grip, go_pull, put_back là hàm của màn nên không có ở đây)
    m('kick', 'nam-cham', 'Đá vật nam châm chữ N ra xa bằng cực N rồi ngắt điện', 'che-nam-cham', 'che-nam-cham.1'),
    m('reel', 'nam-cham', 'Kéo vật nam châm về rồi thả sát trước mũi xe', 'che-nam-cham', 'che-nam-cham.2'),
    m('lane', 'nam-cham', 'Chuyền vật trước mặt sang ô bên phải, xe giữ chỗ và hướng', 'che-nam-cham', 'che-nam-cham.4'),
    m('sort', 'nam-cham', 'Vật chữ N chuyền sang phải, vật chữ S chuyền sang trái', 'che-nam-cham', 'che-nam-cham.5'),
    m('fling', 'nam-cham', 'Hút vật chữ N rồi đổi cực để bắn nó ra xa', 'che-nam-cham', 'che-nam-cham.6'),
    // chương Tay xoay + Chế lệnh tay xoay (nhóm mới 'tay-xoay'; tay-xoay.6 / tay-xoay.10 rồi sáu hàm của che-tay-xoay)
    m('clear_left', 'tay-xoay', 'Nhặt vật trước mặt, đặt sang ô bên trái, tay về phía trước', 'tay-xoay', 'tay-xoay.6'),
    m('relay', 'tay-xoay', 'Chuyền vật bên trái sang ô bên phải, tay về phía trước', 'tay-xoay', 'tay-xoay.10'),
    m('pick_left', 'tay-xoay', 'Nhặt vật bên trái xe, tay về phía trước và đang cầm vật', 'che-tay-xoay', 'che-tay-xoay.1'),
    m('drop_right', 'tay-xoay', 'Đặt vật đang cầm sang ô bên phải xe, tay về phía trước', 'che-tay-xoay', 'che-tay-xoay.2'),
    m('pick_right', 'tay-xoay', 'Nhặt vật bên phải xe, tay về phía trước và đang cầm vật', 'che-tay-xoay', 'che-tay-xoay.4'),
    m('drop_left', 'tay-xoay', 'Đặt vật đang cầm sang ô bên trái xe, tay về phía trước', 'che-tay-xoay', 'che-tay-xoay.4'),
    m('swap_sides', 'tay-xoay', 'Đổi chỗ vật bên trái với vật bên phải, ô trước mặt trống làm chỗ cất tạm', 'che-tay-xoay', 'che-tay-xoay.5'),
    m('sort_two', 'tay-xoay', 'Vật trước mặt sang trái, tiến một ô, vật kế sang phải, tiến một ô', 'che-tay-xoay', 'che-tay-xoay.6'),
    m('toss', 'nem', 'Đặt tầm n, ném vật, rồi chờ một nhịp', 'may-nem', 'may-nem.4'),
    // chương Chế lệnh máy ném (launch, side_throw, carry_throw, toss_back, split; fixed_toss, go_load, undo_load là hàm của màn nên không có ở đây)
    m('launch', 'nem', 'Nạp vật trước mặt rồi ném thẳng ra xa n ô', 'che-may-nem', 'che-may-nem.1'),
    m('side_throw', 'nem', 'Nạp vật trước mặt, ném sang phải n ô, xe giữ chỗ và hướng', 'che-may-nem', 'che-may-nem.2'),
    m('carry_throw', 'nem', 'Nạp vật, chở vật đi k ô trong rổ rồi ném ra xa ba ô', 'che-may-nem', 'che-may-nem.4'),
    m('toss_back', 'nem', 'Nạp vật trước mặt rồi ném ra sau lưng n ô, xe giữ chỗ và hướng', 'che-may-nem', 'che-may-nem.5'),
    m('split', 'nem', 'Vật đỏ ném sang phải, vật xanh dương ném sang trái, đều ở ô thứ hai', 'che-may-nem', 'che-may-nem.6'),
    m('recharge', 'drone', 'Nếu pin còn dưới 3 thì bay lên ô sạc rồi bay xuống', 'drone', 'drone.5'),
    m('ship', 'drone', 'Hút vật dưới bụng, bay theo chuỗi đường rồi thả vật', 'drone', 'drone.10'),
    // chương Chế lệnh drone (hurdle, scout, glide, fly, airlift; go_out, come_back, safe_fly, fixed_fly là hàm CỦA MÀN nên không có ở đây)
    m('hurdle', 'drone', 'Bay vòng qua cột đá ngay bên phải, đáp xuống ô sau cột cùng hàng', 'che-drone', 'che-drone.1'),
    m('scout', 'drone', 'Bay ra n ô sang phải rồi bay về đúng chỗ cũ', 'che-drone', 'che-drone.2'),
    m('glide', 'drone', 'Bay xuống n bậc thang: mỗi bậc sang phải một ô rồi xuống một ô', 'che-drone', 'che-drone.4'),
    m('fly', 'drone', 'Bay theo chuỗi đường, sau mỗi ô xét pin: thấp thì ghé ô sạc ngay phía trên', 'che-drone', 'che-drone.5'),
    m('airlift', 'drone', 'Hút hộp sắt, chở sang phải n ô, thả xuống rồi bay về chỗ cũ', 'che-drone', 'che-drone.6'),
    // chương Flycam (seek_red, steer, survey, obey, dispatch, patrol; go_out, come_back, scan_row, fetch_red là hàm CỦA MÀN nên không có ở đây)
    m('seek_red', 'drone', 'Bay sang phải tới khi camera dưới bụng thấy ô đỏ', 'flycam', 'flycam.1'),
    m('steer', 'drone', 'Nhìn ô bên dưới: đỏ bay lên, xanh dương bay xuống, còn lại bay sang phải', 'flycam', 'flycam.2'),
    m('survey', 'drone', 'Bay qua các ô có màu, ghi màu từng ô vào danh sách seen', 'flycam', 'flycam.3'),
    m('obey', 'drone', 'Bay theo từng màu đã ghi: đỏ xuống, xanh dương sang phải, còn lại lên', 'flycam', 'flycam.4'),
    m('dispatch', 'drone', 'Xuống từng hộp rồi chở đi theo màu đã ghi: đỏ 2 ô, xanh dương 3 ô', 'flycam', 'flycam.5'),
    m('patrol', 'drone', 'Bay tới ô vàng và ghi màu từng ô, rồi bay về đúng chỗ cũ, ghé sạc dọc đường', 'flycam', 'flycam.6'),
    // MÙA 2 (màn ngân hàng mùa 2 chỉ lo-trinh-hoc.js đưa vào game; kiem-che-xe.mjs thấy chúng theo thứ tự lộ trình)
    // gói 3 · chương Hàm cho hồng ngoại (man-hong-ngoai.js)
    m('go_to_wall', 'hong-ngoai', 'Đi thẳng tới khi sát tường, dùng mắt hồng ngoại đo số ô trống', 'che-hong-ngoai', 'che-hong-ngoai.1'),
    m('go_safe', 'hong-ngoai', 'Đi thẳng tới khi phía trước chỉ còn an_toan ô trống', 'che-hong-ngoai', 'che-hong-ngoai.2'),
    m('clean_step', 'hong-ngoai', 'Một bước hút bụi: còn an_toan ô trống trở xuống thì rẽ phải, không thì đi một ô', 'che-hong-ngoai', 'che-hong-ngoai.3'),
    m('go_get', 'hong-ngoai', 'Đo khoảng cách, tới nhặt vật, quay đầu đi về đúng chừng ấy ô rồi đặt vật', 'che-hong-ngoai', 'che-hong-ngoai.4')
  ];

  // lệnh gốc: nguoc là lệnh ngược (cùng bảng với SanHoc.LENH_NGUOC), null nếu không có
  function g(ten, nguoc, moTa) { return { ten: ten, nguoc: nguoc, moTa: moTa }; }
  var lenhGoc = [
    g('left_move', 'left_back', 'Bánh trái quay tới'),
    g('left_back', 'left_move', 'Bánh trái quay lùi'),
    g('right_move', 'right_back', 'Bánh phải quay tới'),
    g('right_back', 'right_move', 'Bánh phải quay lùi'),
    g('wait', null, 'Hết một nhịp: xe làm theo các lệnh đã ra'),
    g('arm_down', 'arm_up', 'Hạ tay xuống sát đất'),
    g('arm_up', 'arm_down', 'Nâng tay lên'),
    g('arm_left', 'arm_right', 'Tay xoay: xoay khớp một nấc sang trái'),
    g('arm_right', 'arm_left', 'Tay xoay: xoay khớp một nấc sang phải'),
    g('grab', 'release', 'Kẹp lại'),
    g('release', 'grab', 'Mở kẹp'),
    g('go_up', 'go_down', 'Nhện hay drone đi lên một ô'),
    g('go_down', 'go_up', 'Nhện hay drone đi xuống một ô'),
    g('go_left', 'go_right', 'Nhện hay drone đi sang trái một ô'),
    g('go_right', 'go_left', 'Nhện hay drone đi sang phải một ô'),
    g('crouch', 'stand', 'Nhện co chân lại (chui được gầm thấp)'),
    g('stand', 'crouch', 'Nhện duỗi chân ra; duỗi ngay trước một bước đi lúc đang co là nhảy'),
    g('slide_left', 'slide_right', 'Xe omni trượt sang trái một ô'),
    g('slide_right', 'slide_left', 'Xe omni trượt sang phải một ô'),
    g('shoot', 'shoot_back', 'Súng hơi: bắn bóng ra trước, xe giật lùi một ô. Màn Lực bắn: lực "fast" bắn nhanh, bay 2 ô, xe không giật'),
    g('shoot_back', 'shoot', 'Súng hơi: bắn bóng ra sau, xe giật tới một ô. Màn Lực bắn: lực "fast" bắn nhanh, xe không giật'),
    g('front_clear', null, 'Hỏi: ô trước mặt có trống không'),
    g('left_clear', null, 'Hỏi: ô bên trái có trống không'),
    g('right_clear', null, 'Hỏi: ô bên phải có trống không'),
    g('color', null, 'Đọc màu'),
    g('magnet_n', 'magnet_s', 'Bật nam châm cực N (đỏ)'),
    g('magnet_s', 'magnet_n', 'Bật nam châm cực S (xanh dương)'),
    g('magnet_off', null, 'Ngắt điện nam châm, thả vật đang dính'),
    g('front_metal', null, 'Hỏi: vật trước mặt có phải sắt không'),
    g('front_pole', null, 'Hỏi: vật nam châm trước mặt có chữ N hay S'),
    g('distance', null, 'Hỏi: phía trước còn mấy ô trống tới vật cản — trả một số, sát vật cản là 0'),
    g('warm', null, 'Hỏi: vật cản trước mặt có nóng không — robot khác hay nút bắn đang bật thì nóng'),
    g('aim', null, 'Đặt tầm ném'),
    g('throw', null, 'Ném vật trong rổ'),
    g('load', null, 'Nạp vật ở ô trước mặt vào rổ'),
    g('ink', null, 'Máy sơn: chọn màu sơn, đổi ngay'),
    g('dot', null, 'Máy sơn: chấm sơn vào ô xe đang đứng'),
    g('pen_down', 'pen_up', 'Máy sơn: hạ đầu sơn, xe đi tới đâu tô tới đó'),
    g('pen_up', 'pen_down', 'Máy sơn: nhấc đầu sơn, thôi tô'),
    g('battery', null, 'Hỏi: pin còn bao nhiêu'),
    g('look', null, 'Hỏi: camera dưới bụng drone thấy màu gì')
  ];

  function tim(ten) { for (var i = 0; i < ds.length; i++) if (ds[i].ten === ten) return ds[i]; return null; }
  function theoNhom(nhom) { return ds.filter(function (h) { return h.nhom === nhom; }); }
  function theoChuong(chuong) { return ds.filter(function (h) { return h.chuong === chuong; }); }
  function capNguoc() {
    var kq = [];
    lenhGoc.forEach(function (l) { if (l.nguoc && lenhGoc.some(function (k) { return k.ten === l.nguoc; }) && !kq.some(function (c) { return c[0] === l.nguoc; })) kq.push([l.ten, l.nguoc]); });
    return kq;
  }

  var API = { ds: ds, tenNhom: tenNhom, thuTuNhom: thuTuNhom, lenhGoc: lenhGoc, capNguoc: capNguoc, tim: tim, theoNhom: theoNhom, theoChuong: theoChuong };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.SoLenh = API;
})();
