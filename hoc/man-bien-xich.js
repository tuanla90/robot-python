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

  // PDM2a (31/10, part đúng mùa): gói 1 R1 chỉ có thân xích, CHƯA có cảm biến (bản cũ gắn mắt khoảng cách, front_clear). Lệnh gốc: bánh xích.
  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  function bai(chinh) { return { chinh: chinh.slice(), hamCuaMan: [] }; }

  /* TRÙM bien-xich.1 (thành màn 10 của chương "Đi xoắn ốc"; mã giữ, nội dung PDM2a): "Xoắn ốc đôi". Đường xoắn ốc dày quanh chỗ xe đứng: các đoạn dài
     1, 1, 2, 2, 3, 3 ô, mỗi đoạn xong quẹo phải; mỗi độ dài dùng HAI lần rồi mới tăng. Xe phải đi qua ba góc ◆ của xoắn ốc rồi đứng như xe mờ.
     Lời giải: n = 1, ba vòng ngoài, mỗi vòng hai đoạn n ô (vòng lặp giữa range(2)), n = n + 1. Các đoạn nằm sát nhau nên không có vách ngăn: chỉ ô ◆ và xe mờ
     buộc đúng đường. kiem-bien-xich.mjs chứng minh: viết cứng từng đoạn (không biến) không được 3 sao; thay n bằng một số thì không thắng. */
  var DAI = ['for i in range(3):', '    for k in range(2):', '        for j in range(n):', '            move()', '        tr_right()', '    n = n + 1'];
  var LG = ['n = 1'].concat(DAI);

  var DS = [
    ManHoc.chuanHoa({
      chuong: 'bien-xich', so: 1, ten: 'Trùm: Xoắn ốc đôi', hang: 'trum',
      huyHieu: { ma: 'bien-xich', ten: 'Huy hiệu Biến cho xích' },
      loaiRobot: 'xich', robot: { than: 'xich', tay: null },
      hamGoc: HAM_GOC, cauTruc: ['for', 'if', 'while'], bienDem: true,
      moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 },
      hamCuaEmCan: ['move', 'tr_right'],
      deBai: 'Đường xoắn ốc quấn sát quanh chỗ xe đứng: các đoạn dài 1, 1, 2, 2, 3, 3 ô, hết mỗi đoạn quẹo phải. Mỗi độ dài đi HAI đoạn rồi mới dài thêm một ô. Đi qua ba góc ◆ rồi dừng như xe mờ. Dùng biến n cho độ dài đoạn.',
      veMaMau: 'Chương trình có sẵn là xoắn ốc 1, 2, 3 ô: mỗi độ dài chỉ đi một đoạn. Sửa để mỗi vòng ngoài đi hai đoạn n ô rồi mới tăng n.',
      san: ['#....', '#...#', '#...#', '#...#'],
      batDau: { x: 2, y: 2, huong: 0 },
      mucTieu: 'bong-mo',
      bongMo: { x: 4, y: 0, huong: 2, diQua: [{ x: 3, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 0 }] },
      maMau: bai(['n = 1', 'for i in range(3):', '    for j in range(n):', '        move()', '    tr_right()', '    n = n + 1']),
      sao: { o: 13, nhip: 24 },
      loiGiai: bai(LG),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: bai(['# mỗi độ dài đi hai đoạn'].concat(LG)) },
      congThucKhac: [
        { moTa: 'Viết hai đoạn n ô liền nhau thay cho vòng lặp range(2) (đúng nhưng tốn ô hơn)', baiLam: bai(['n = 1', 'for i in range(3):', '    for j in range(n):', '        move()', '    tr_right()', '    for j in range(n):', '        move()', '    tr_right()', '    n = n + 1']) }
      ],
      loiSai: [
        { moTa: 'Mỗi độ dài chỉ đi một đoạn (xoắn ốc 1, 2, 3): xe đâm tường', baiLam: bai(['n = 1', 'for i in range(3):', '    for j in range(n):', '        move()', '    tr_right()', '    n = n + 1']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quẹo trái thay quẹo phải: xoắn ốc ngược chiều, không qua các góc ◆', baiLam: bai(['n = 1', 'for i in range(3):', '    for k in range(2):', '        for j in range(n):', '            move()', '        tr_left()', '    n = n + 1']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Vòng ngoài chỉ hai lần: xe dừng giữa xoắn ốc', baiLam: bai(['n = 1', 'for i in range(2):'].concat(DAI.slice(1))), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Đoạn 1 và 2 dài 1 ô, đoạn 3 và 4 dài 2 ô, đoạn 5 và 6 dài 3 ô.',
        'Trong vòng lặp ngoài: một vòng range(2) đi n ô rồi quẹo phải; sau vòng đó mới n = n + 1.']
    })
  ];

  ManHoc.manBienXich = DS;
  if (laNode) module.exports = ManHoc;
})();
