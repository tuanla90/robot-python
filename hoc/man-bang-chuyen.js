/* ============================================================================
   man-bang-chuyen.js — kho màn băng chuyền, chờ chương riêng.

   Hai màn này từng là 1.9 và 1.10 của chuỗi 1 "Hai bánh"; băng chuyền là cơ chế mới
   nên được tách ra, chờ một chương riêng. KHÔNG nạp vào ManHoc và KHÔNG nạp trong
   game/choi.html: tệp này chỉ để giữ dữ liệu (luật băng chuyền ở san-hoc.js vẫn còn
   và vẫn được máy kiểm thử).
   Dùng như ManHoc: định dạng màn y hệt man-chuoi-1.js (xe hai bánh, chương trình
   10 ô, chưa mở Xưởng hàm, cấm hàm của em).
   Xuất window.ManBangChuyen / module.exports: { danhSach, tim(id) }.
   Lưu ý: bc.2 là trùm cũ của chuỗi 1; huy hiệu 'hai-banh' đã chuyển sang màn 1.10 mới
   ("Xếp lại cho đúng") nên ở đây không còn huyHieu.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var HAM_GOC = ['left_move', 'right_move', 'wait'];
  var KHUNG = { chinh: 10, moiHam: 10 };

  var TIEN = ['left_move()', 'right_move()', 'wait()'];
  var QUAY_PHAI = ['left_move()', 'wait()'];
  function lap(ds, n) { var kq = []; for (var i = 0; i < n; i++) kq = kq.concat(ds); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  /** Điền các trường mặc định giống ManHoc.chuanHoa (hàm của màn rỗng, hàm của em rỗng…). */
  function chuanHoaMan(m) {
    function bai(b) { if (!b.hamCuaMan) b.hamCuaMan = []; return b; }
    bai(m.maMau);
    bai(m.loiGiai);
    if (!m.loiGiai.hamCuaEmMoi) m.loiGiai.hamCuaEmMoi = [];
    if (m.loiGiaiKhac) {
      bai(m.loiGiaiKhac.baiLam);
      if (!m.loiGiaiKhac.hamCuaEmMoi) m.loiGiaiKhac.hamCuaEmMoi = [];
    }
    m.loiSai.forEach(function (ls) {
      bai(ls.baiLam);
      if (!ls.hamCuaEmMoi) ls.hamCuaEmMoi = [];
    });
    if (!m.hamCuaEmCan) m.hamCuaEmCan = [];
    if (!m.taoHam) m.taoHam = [];
    return m;
  }

  function man(m) {
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC; m.khung = KHUNG;
    m.moXuong = false; m.camHamCuaEm = true;
    return chuanHoaMan(m);
  }

  var DS = [
    man({
      id: 'bc.1', ten: 'Băng chuyền', hang: 'bien-the',
      deBai: 'Ba ô băng chuyền chạy sang phải sẽ đẩy xe đi. Đứng chờ trên băng cũng tiến được; rẽ đúng lúc còn nhanh hơn.',
      san: ['.....', '.....', '.....', '>>>F.', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 9, nhip: 4 },
      loiGiai: { chinh: nhieu(TIEN, QUAY_PHAI, TIEN, ['wait()']) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# lên băng'], TIEN, QUAY_PHAI, TIEN, ['wait()']) }
      },
      loiSai: [
        { moTa: 'Cố tự lái dọc băng: không đủ ô',
          baiLam: { chinh: nhieu(TIEN, QUAY_PHAI, TIEN, TIEN) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Lên băng rồi chờ chưa đủ lâu, băng chưa đưa tới cờ',
          baiLam: { chinh: nhieu(TIEN, ['wait()', 'wait()', 'wait()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cứ hai nhịp đứng trên băng, băng đẩy xe một ô.', 'Quay đúng lúc băng đang đẩy thì không mất thêm nhịp.']
    }),

    man({
      id: 'bc.2', ten: 'Thuận hay nghịch', hang: 'trum',
      deBai: 'Hai cột băng chuyền: một cột chạy xuống, một cột chạy lên. Chọn cột nào để băng đưa xe tới cờ?',
      san: ['v....', 'v....', 'v....', 'vF...', '.^...'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: nhieu(QUAY_PHAI, TIEN, ['wait()']) },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, ghi chú từng đoạn',
        baiLam: { chinh: nhieu(['# quay sang cột phải'], QUAY_PHAI, ['# lên băng'], TIEN, ['# chờ băng đẩy'], ['wait()']) }
      },
      loiSai: [
        { moTa: 'Lao thẳng vào băng ngược chiều: bị đẩy lùi, không tới được',
          baiLam: { chinh: nhieu(TIEN, TIEN, QUAY_PHAI) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cố lái bằng tay từng ô: hết ô',
          baiLam: { chinh: lap(TIEN, 4) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đi cùng chiều băng thì băng giúp xe; đi ngược chiều thì băng kéo xe lại.']
    })
  ];

  var ManBangChuyen = {
    danhSach: DS,
    tim: function (id) { return DS.filter(function (m) { return m.id === id; })[0] || null; }
  };

  if (laNode) module.exports = ManBangChuyen;
  if (typeof window !== 'undefined') window.ManBangChuyen = ManBangChuyen;
})();
