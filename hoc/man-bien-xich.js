/* ============================================================================
   man-bien-xich.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 1 "Bánh xích" (KE-HOACH-MUA-2.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `bien-xich` (mã bien-xich.1 … bien-xich.10): chương 2 "Biến cho xích": 1 màn mới (đếm nhịp quay); nối vào CUỐI chương (9 màn có sẵn) và thành trùm (màn thứ 10)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manBienXich, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // Xe xích (không tay) gắn mắt khoảng cách ở mũi: chỉ hỏi được front_clear() (như doi-xich ở mùa ẩn). Lệnh gốc: bánh xích + front_clear.
  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'front_clear'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function bai(chinh) { return { chinh: chinh.slice(), hamCuaMan: [] }; }

  /* TRÙM bien-xich.1 (thành màn 10 của chương): "Đếm để về đúng hàng". Ba sân CÙNG MỘT phòng hai làn × 5 hàng; chỉ hàng xuất phát khác nhau
     (xe ở hàng 2, 4, 3 tính từ trên, tức phía trên còn 2, 4, 3 ô; phía dưới còn 2, 0, 1 ô). Xe đi lên sát tường (đếm bằng biến n), né sang làn phải
     bằng sidestep(), spin() quay mặt xuống rồi đi đúng n ô về hàng xuất phát như xe mờ. Ô ◆ ở đầu làn trái buộc xe lên tới tường (không có nó thì sidestep(); spin() thắng luôn ba sân). Không đếm thì không biết dừng ở đâu: hàng đích không có dấu hiệu gì mà
     front_clear() thấy được (đi tới đáy thì quá chỗ ở hai sân, chiều sâu dưới chân khác nhau nên "tới đáy rồi lên c ô" cũng không đúng cả ba sân).
     kiem-bien-xich.mjs chứng minh: không dãy lệnh cố định nào thắng cả ba sân, các lời không biến tiêu biểu không được 3 sao. */
  var PHONG = ['#..#', '#..#', '#..#', '#..#', '#..#'];
  var HANG = [2, 4, 3];
  var DEM = ['n = 0', 'while front_clear():', '    move()', '    n = n + 1'];
  var LG = DEM.concat(['sidestep()', 'spin()', 'for i in range(n):', '    move()']);

  var DS = [
    ManHoc.chuanHoa({
      chuong: 'bien-xich', so: 1, ten: 'Trùm: Đếm để về đúng hàng', hang: 'trum',
      huyHieu: { ma: 'bien-xich', ten: 'Huy hiệu Biến cho xích' },
      kieuBai: 'nhieu-san',
      loaiRobot: 'xich', robot: { than: 'xich', tay: null, camBien: [{ ma: 'khoang-cach', o: 'hong' }] },
      hamGoc: HAM_GOC, cauTruc: ['for', 'if', 'while'], bienDem: true,
      moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 },
      hamCuaEmCan: ['move', 'back', 'sidestep', 'spin'],
      deBai: 'Ba sân cùng một phòng hai làn, chỉ khác hàng xe xích xuất phát. Một chương trình cho cả ba sân: xe đi lên tới sát tường (qua ô ◆ ở đầu làn trái), né sang làn bên phải rồi về đúng hàng đã xuất phát, mặt quay xuống như xe mờ. Dùng biến n đếm số ô đã đi lên.',
      veMaMau: 'Chương trình có sẵn đi lên rồi né sang phải, nhưng chưa biết phải về bao nhiêu ô. Đếm bằng biến n rồi đi về đúng n ô.',
      san: [PHONG, PHONG, PHONG].map(function (s) { return s.slice(); }),
      batDau: HANG.map(function (y) { return { x: 1, y: y, huong: 0 }; }),
      mucTieu: 'bong-mo',
      bongMo: HANG.map(function (y) { return { x: 2, y: y, huong: 2, diQua: [{ x: 1, y: 0 }] }; }),
      nhipTheo: 'tong',
      maMau: bai(['while front_clear():', '    move()', 'sidestep()']),
      sao: { o: 22, nhip: 45 },
      loiGiai: bai(LG),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: bai(['# đếm số ô đi lên, lùi lại đúng chừng ấy'].concat(LG)) },
      congThucKhac: [
        { moTa: 'Né sang phải, lùi n ô bằng back() rồi mới quay mặt xuống (đúng nhưng back() dài hơn move() nên tốn ô hơn)', baiLam: bai(DEM.concat(['sidestep()', 'for i in range(n):', '    back()', 'spin()'])) }
      ],
      loiSai: [
        { moTa: 'Không đếm, quay mặt xuống rồi đi tới đáy: hai sân xe đi quá hàng xuất phát', baiLam: bai(['while front_clear():', '    move()', 'sidestep()', 'spin()', 'while front_clear():', '    move()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi về cứng hai ô theo sân đầu: hai sân sau xe dừng quá sớm', baiLam: bai(DEM.concat(['sidestep()', 'spin()', 'for i in range(2):', '    move()'])), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên tăng n trong vòng while: n luôn bằng 0 nên xe đứng ở hàng trên cùng', baiLam: bai(['n = 0', 'while front_clear():', '    move()', 'sidestep()', 'spin()', 'for i in range(n):', '    move()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên né sang phải: xe về đúng chỗ cũ nhưng ở làn trái', baiLam: bai(DEM.concat(['spin()', 'for i in range(n):', '    move()'])), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Phòng nào cũng năm hàng nhưng xe đứng ở hàng khác nhau, nên số ô phải lùi cũng khác: đếm, đừng đoán.',
        'n = 0 trước vòng while, n = n + 1 mỗi lần tiến; né, quay mặt xuống rồi lặp move() đúng n lần.']
    })
  ];

  ManHoc.manBienXich = DS;
  if (laNode) module.exports = ManHoc;
})();
