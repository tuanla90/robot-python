/* ============================================================================
   man-dem-tu-thu.js — "Robot Chấn Hưng": gói THỬ "Thử đệm từ" (đầu mùa 3, ẩn; hiện khi Gỡ lỗi bật "Mở hết"), chương `dem-tu-thu`.
   Bản thử cho user chơi thử LUẬT ĐỆM TỪ (cơ chế mùa 3; luật ở san-hoc.js phần ĐỆM TỪ, cờ màn `demTu = [{ x, y, cuc: 'N' | 'S' }]`):
     - ô đệm là KHỐI (đâm như tường), kéo / đẩy robot đứng cùng hàng hay cột trong 2 ô, 1 ô mỗi nhịp, sau hành động của robot (sau băng chuyền);
     - robot không bật nam châm hay bật KHÁC cực đệm → bị HÚT về sát đệm; bật CÙNG cực → bị ĐẨY ra xa tới khi ra khỏi tầm; bị chặn thì đứng im;
     - đệm gần hơn thắng; bị kéo vào hố thì rơi. Xe hai bánh gắn tay nam châm (magnet_n / magnet_s / magnet_off), chỉ Python mùa 1–2.
   Đăng ký: ManHoc.chuongCoChe (lo-trinh-hoc.js chenGoi) sau 'tham-so' → gói đứng đầu mùa 3, sao 0 (khối mùa 2 đặt gói đầu mùa 3 = 0 sao).
   Mã màn `dem-tu-thu.1` … `dem-tu-thu.6` là khóa lưu sao: gói thử, có thể đổi khi làm gói thật.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'magnet_n', 'magnet_s', 'magnet_off'];
  var KHUNG = { chinh: 10, moiHam: 10 };

  function man(m) {
    m.chuong = 'dem-tu-thu';
    m.cauTruc = m.cauTruc || ['for', 'if', 'while'];
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC; m.khung = KHUNG;
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [] };
    m.moXuong = true; m.camHamCuaEm = false;
    m.nhipTheoLoiGiai = true;
    return ManHoc.chuanHoa(m);
  }

  var DS = [];

  ManHoc.manDemTuThu = DS;
  ManHoc.chuongCoChe = (ManHoc.chuongCoChe || []).concat([{
    sau: 'tham-so', ds: DS,
    chuong: [{ ma: 'dem-tu-thu', ten: 'Thử đệm từ' }],
    goi: { ma: 'dem-tu-thu', ten: 'Thử đệm từ', loai: 'khai-niem', hinh: 'nam-cham' }
  }]);
  if (laNode) module.exports = ManHoc;
})();
