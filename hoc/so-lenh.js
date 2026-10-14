/* ============================================================================
   so-lenh.js — "Đường học": DỮ LIỆU SỔ LỆNH (window.SoLenh). Kế hoạch "Chế lệnh" 14/10, mục 3.4.

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
    'xich': 'Bánh xích',
    'omni': 'Bánh omni',
    'day': 'Tấm đẩy',
    'mau': 'Cảm biến màu',
    'nam-cham': 'Nam châm',
    'nem': 'Máy ném',
    'bong': 'Súng bóng',
    'drone': 'Drone'
  };
  var thuTuNhom = ['xe', 'tay', 'lap', 'cam-bien', 'tham-so', 'bang-chuyen', 'nhen', 'xich', 'omni', 'day', 'mau', 'nam-cham', 'nem', 'bong', 'drone'];

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
    m('come_back', 'xe', 'Đi ngược lại đường go_out() để về chỗ cũ', 'che-xe', 'che-xe.7'),
    m('fixed_move', 'xe', 'Tiến một ô khi dây bánh trái bị đấu ngược', 'che-xe', 'che-xe.8'),
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
    m('put_back', 'tay', 'Đi ngược lại go_get(): đặt vật về chỗ cũ rồi về chỗ xuất phát', 'che-tay', 'che-tay.7'),
    m('fixed_pick', 'tay', 'Nhặt vật khi dây tay bị đấu ngược', 'che-tay', 'che-tay.8'),
    m('fixed_drop', 'tay', 'Đặt vật xuống khi dây tay bị đấu ngược', 'che-tay', 'che-tay.8'),
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
    m('come_home', 'lap', 'Đi ngược lại go_round(): cùng số lần, lệnh ngược, thứ tự ngược', 'che-lap', 'che-lap.7'),
    m('reverse_run', 'lap', 'Lùi một mạch sáu ô khi chỉ còn số lùi', 'che-lap', 'che-lap.9'),
    // chương 8 · Cảm biến khoảng cách
    m('go_wall', 'cam-bien', 'Đi thẳng cho tới khi trước mặt là tường', 'khoang-cach', 'khoang-cach.5'),
    // chương 9 · Chế lệnh có if, while
    m('safe_move', 'cam-bien', 'Tiến một ô nếu trước mặt trống, không thì đứng yên', 'che-cam-bien', 'che-cam-bien.1'),
    m('face_open', 'cam-bien', 'Quay phải cho tới khi trước mặt trống', 'che-cam-bien', 'che-cam-bien.2'),
    m('to_gap', 'cam-bien', 'Đi thẳng cho tới khi bên phải xe có cửa mở', 'che-cam-bien', 'che-cam-bien.4'),
    m('bounce', 'cam-bien', 'Đi tới tường rồi lùi về đúng chỗ cũ, đếm số ô bằng biến n', 'che-cam-bien', 'che-cam-bien.5'),
    m('follow_right', 'cam-bien', 'Một bước bám tường bên tay phải', 'che-cam-bien', 'che-cam-bien.6'),
    m('safe_move2', 'cam-bien', 'Tiến một ô nếu trống, khi cảm biến bị lắp ngược', 'che-cam-bien', 'che-cam-bien.7'),
    m('fetch_back', 'cam-bien', 'Đi tới vật, nhặt, lùi về chỗ cũ rồi đặt vật xuống', 'che-cam-bien', 'che-cam-bien.9'),
    // chương 10 · Robot hoàn thiện (agent robot-hoan-thien thêm mục ở đây nếu chương có hàm cốt truyện)
    // đợt 2: hàm có tham số
    m('forward', 'tham-so', 'Tiến n ô liền nhau', 'tham-so', 'tham-so.3'),
    m('right', 'tham-so', 'Quay phải k lần', 'tham-so', 'tham-so.4'),
    m('deliver', 'tham-so', 'Nhặt vật, tiến n ô rồi đặt vật xuống', 'tham-so', 'tham-so.6'),
    m('step', 'tham-so', 'Đi ngang a ô rồi đi xuống b ô, làm trọn một bậc thang', 'tham-so', 'tham-so.8'),
    // đợt 2: thân nhện
    m('go', 'nhen', 'Nhện đi một bước theo một chữ: U lên, D xuống, L trái, R phải', 'nhen', 'nhen.4'),
    m('walk', 'nhen', 'Nhện đi hết một chuỗi chỉ đường', 'nhen', 'nhen.9'),
    m('bring', 'nhen', 'Nhặt vật, đi theo chuỗi chỉ đường rồi đặt vật xuống', 'nhen', 'nhen.10'),
    // đợt 2: bánh xích, bánh omni
    m('tr_right', 'xich', 'Xe xích quay phải một góc vuông (hai nhịp)', 'xich', 'xich.3'),
    m('tr_left', 'xich', 'Xe xích quay trái một góc vuông (hai nhịp)', 'xich', 'xich.4'),
    m('slide_r', 'omni', 'Trượt sang phải n ô, mặt xe không đổi', 'omni', 'omni.3'),
    m('slide_l', 'omni', 'Trượt sang trái n ô, mặt xe không đổi', 'omni', 'omni.4'),
    // đợt 2: tấm đẩy, cảm biến màu, nam châm, máy ném, súng bóng, drone
    m('shove', 'day', 'Đẩy thùng n ô rồi vòng ra sau thùng cho lần đẩy kế', 'tam-day', 'tam-day.6'),
    m('read_turn', 'mau', 'Đọc màu dưới xe: đỏ thì rẽ phải, xanh dương thì rẽ trái', 'mau', 'mau.5'),
    m('fetch', 'nam-cham', 'Hút vật sắt trước mặt, quay đầu, tiến một ô rồi thả vật', 'nam-cham', 'nam-cham.3'),
    m('toss', 'nem', 'Đặt tầm n, ném vật, rồi chờ một nhịp', 'may-nem', 'may-nem.4'),
    m('hit_right', 'bong', 'Quay phải, bắn một phát, rồi quay lại', 'sung-bong', 'sung-bong.5'),
    m('recharge', 'drone', 'Nếu pin còn dưới 3 thì bay lên ô sạc rồi bay xuống', 'drone', 'drone.5'),
    m('ship', 'drone', 'Hút vật dưới bụng, bay theo chuỗi đường rồi thả vật', 'drone', 'drone.10')
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
    g('grab', 'release', 'Kẹp lại'),
    g('release', 'grab', 'Mở kẹp'),
    g('go_up', 'go_down', 'Nhện hay drone đi lên một ô'),
    g('go_down', 'go_up', 'Nhện hay drone đi xuống một ô'),
    g('go_left', 'go_right', 'Nhện hay drone đi sang trái một ô'),
    g('go_right', 'go_left', 'Nhện hay drone đi sang phải một ô'),
    g('slide_left', 'slide_right', 'Xe omni trượt sang trái một ô'),
    g('slide_right', 'slide_left', 'Xe omni trượt sang phải một ô'),
    g('push', null, 'Đẩy thùng nặng trượt thẳng tới vật cản'),
    g('front_clear', null, 'Hỏi: ô trước mặt có trống không'),
    g('left_clear', null, 'Hỏi: ô bên trái có trống không'),
    g('right_clear', null, 'Hỏi: ô bên phải có trống không'),
    g('color', null, 'Đọc màu'),
    g('magnet_on', null, 'Bật nam châm'),
    g('magnet_off', null, 'Tắt nam châm, thả vật đang dính'),
    g('front_metal', null, 'Hỏi: vật trước mặt có phải sắt không'),
    g('aim', null, 'Đặt tầm ném'),
    g('throw', null, 'Ném vật trong rổ'),
    g('load', null, 'Nạp vật ở ô trước mặt vào rổ'),
    g('shoot', null, 'Bắn một quả bóng thẳng về phía trước'),
    g('battery', null, 'Hỏi: pin còn bao nhiêu')
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
