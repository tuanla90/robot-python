/* ============================================================================
   man-nhay.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 5 "Nhảy" (KE-HOACH-MUA-3.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `nhay`: chương 1 "Nhảy" crouch / stand, gầm, hố (6 màn có sẵn, nhen.10 là trùm có sẵn: màn mới chen TRƯỚC nó)
     - `che-nhen`: chương 2 "Chế lệnh nhện" (đủ 10 màn có sẵn: không thêm)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manNhay, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // 29/10 phiên Mùa 3: bốn màn mới của chương nhay (Nhảy), xen giữa màn có sẵn (thứ tự ở MUA_3): nhay.1 (trình diễn) · nhen.3 · nhen.2 · nhay.2 · nhen.9 ·
  // nhay.3 · nhay.4 · nhen.5 · nhen.6 · nhen.10 (trùm). Cái mới của gói: crouch() / stand() (co, duỗi chân), chui gầm n, nhảy qua hố u (luật: man-nhen.js đầu tệp).
  var CHAN = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function bai(chinh) { return { chinh: chinh.slice() }; }
  function man(m) {
    m.chuong = 'nhay'; m.cauTruc = ['for', 'if', 'while']; m.vaHoac = true;
    m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: null };
    m.hamGoc = CHAN; m.moXuong = true; m.camHamCuaEm = false; m.nhipTheoLoiGiai = true;
    m.khung = m.khung || { chinh: 10, moiHam: 10 }; m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    man({
      so: 1, ten: 'Co chân, bật nhảy', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'crouch() co chân: nhện thấp xuống, chui được qua gầm. Đang co chân mà gọi stand() ngay trước một bước đi thì nhện bật nhảy qua một ô, qua được cả hố. Bấm Chạy xem nhện chui gầm rồi nhảy qua hố.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['#######', '..n.u.F', '#######'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(nhieu(['crouch()'], LAP(3, 'go_right()'), ['stand()', 'go_right()', 'go_right()'])),
      loiGiai: bai(nhieu(['crouch()'], LAP(3, 'go_right()'), ['stand()', 'go_right()', 'go_right()'])),
      sao: { o: 6, nhip: 10 },
      goiY: ['Co chân trước khi tới gầm.', 'stand() ngay trước một bước đi là bật nhảy.']
    }),

    man({
      so: 2, ten: 'Gầm rồi hố', hang: 'lam-quen',
      deBai: 'Ngay trước mặt nhện là một gầm thấp, sau đó một ô sàn rồi tới hố. Co chân để chui gầm, rồi duỗi chân đúng lúc để nhảy qua hố, đi tiếp tới cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng: nhện đụng gầm. Chạy thử rồi sửa.',
      san: ['#######', '.n.u..F', '#######'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(LAP(6, 'go_right()')),
      loiGiai: bai(nhieu(['crouch()'], LAP(2, 'go_right()'), ['stand()'], LAP(3, 'go_right()'))),
      sao: { o: 6, nhip: 10 },
      loiSai: [
        { moTa: 'Chui gầm rồi đi tiếp mà quên duỗi chân: nhện bước thẳng xuống hố', baiLam: bai(nhieu(['crouch()'], LAP(5, 'go_right()'))), phaiCoMa: ['roi-ho'] },
        { moTa: 'Không co chân: nhện đụng gầm', baiLam: bai(LAP(6, 'go_right()')), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Co chân ở đầu chương trình để chui gầm.', 'Đứng sát mép hố thì stand() rồi bước: nhện bật qua hố.']
    }),

    man({
      so: 3, ten: 'Hố sau góc', hang: 'luyen',
      deBai: 'Đi xuống hai ô tới góc, rồi sang trái. Ngay sau góc là một cái hố, cờ ở bên kia hố. Nhớ: muốn nhảy phải đang co chân.',
      veMaMau: 'Chương trình có sẵn mới đi xuống. Viết tiếp.',
      san: ['###..', '####.', 'F.u..'],
      batDau: { x: 3, y: 0, huong: 0 },
      maMau: bai(nhieu(['go_right()'], LAP(2, 'go_down()'))),
      loiGiai: bai(nhieu(['crouch()', 'go_right()'], LAP(2, 'go_down()'), ['go_left()', 'stand()', 'go_left()', 'go_left()'])),
      sao: { o: 8, nhip: 12 },
      loiSai: [
        { moTa: 'Không co chân: stand() không làm gì, nhện bước xuống hố', baiLam: bai(nhieu(['go_right()'], LAP(2, 'go_down()'), ['go_left()', 'stand()', 'go_left()', 'go_left()'])), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Co chân từ đầu rồi đi như thường: chân co thì nhện vẫn đi được.', 'Đứng sát mép hố thì stand() rồi bước sang trái.']
    }),

    man({
      so: 4, ten: 'Hai hố một gầm', hang: 'luyen',
      deBai: 'Hành lang có một gầm và hai cái hố. Mỗi lần nhảy xong chân đang duỗi: muốn nhảy tiếp hay chui gầm thì phải co chân lại.',
      veMaMau: 'Chương trình có sẵn qua được cái hố đầu. Viết tiếp.',
      san: ['############', '..u...n..u.F', '############'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(['crouch()', 'go_right()', 'stand()', 'go_right()']),
      loiGiai: bai(nhieu(['crouch()', 'go_right()', 'stand()', 'go_right()', 'crouch()'], LAP(5, 'go_right()'), ['stand()', 'go_right()', 'go_right()'])),
      sao: { o: 10, nhip: 18 },
      loiSai: [
        { moTa: 'Nhảy xong quên co chân: nhện đụng gầm', baiLam: bai(nhieu(['crouch()', 'go_right()', 'stand()', 'go_right()'], LAP(5, 'go_right()'), ['stand()', 'go_right()', 'go_right()'])), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Sau cú nhảy chân duỗi: crouch() trước gầm.', 'Qua gầm rồi vẫn đang co chân: stand() ngay mép hố thứ hai.']
    })
  ];

  ManHoc.manNhay = DS;
  if (laNode) module.exports = ManHoc;
})();
