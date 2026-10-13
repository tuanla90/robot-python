/* ============================================================================
   chu.js — "Đường học": BẢNG CHỮ giao diện (window.CHU) và hàm t('khoa', thamSo).
   Mọi chữ của giao diện nằm ở đây; mã giao diện không viết cứng chữ tiếng Việt.
   Thêm ngôn ngữ: thêm CHU.en = { ... } rồi gọi CHU.dat('en'). Tham số: {ten} trong chuỗi.
   (Đề bài, gợi ý, tên màn, lời chẩn đoán đến từ lõi — xem ghi chú trong báo cáo.)
   ========================================================================== */
(function () {
  'use strict';

  var CHU = {
    vi: {
      /* ---- chung */
      'chung.tenGame': 'Đường học',
      'chung.dong': 'Đóng',
      'chung.dongY': 'Đồng ý',
      'chung.huy': 'Hủy',
      'chung.xacNhan': 'Chắc chưa?',

      /* ---- chọn màn */
      'chon.truoc': 'Chương trước',
      'chon.sau': 'Chương sau',
      'chon.chuoi': 'Chương {n}',
      'chon.tienDo': '{n}/{tong}',
      'chon.hang.lam-quen': 'Làm quen',
      'chon.hang.luyen': 'Luyện',
      'chon.hang.bien-the': 'Biến thể',
      'chon.choi': 'CHƠI!',
      'chon.khoaMan': 'Màn này đang khóa.',
      'chon.khoaHang1': 'Chơi lần lượt: xong màn trước mới mở màn này.',
      'chon.khoaHang23': 'Xong hết hàng "Làm quen" để mở hàng này.',
      'chon.khoaChuoi': 'Thắng trùm chương {n} để mở chương này.',
      'chon.trum': 'TRÙM',
      'chon.trumMo': 'Thử sức với màn tổng hợp!',
      'chon.trumKhoa': 'Qua đủ 9 màn để mở',
      'chon.trumXong': 'Đã hạ trùm!',
      'chon.hamCuaEm': 'Hàm của em',
      'chon.hamRong': 'Chưa có hàm nào',
      'chon.hamGoiY': 'Em tạo hàm ở Xưởng hàm, trong lúc chơi chương Xưởng hàm.',
      'chon.hamGoiYCo': 'Hàm đã lưu · dùng được ở mọi màn có Xưởng',
      'chon.moHet.bat': 'Đã mở hết các màn (chế độ thử).',
      'chon.moHet.tat': 'Đã tắt chế độ mở hết.',
      'chon.moHetNhan': 'MỞ HẾT',

      /* ---- màn chơi */
      'choi.menu': 'Menu',
      'menu.veChon': 'Về màn chọn',
      'menu.lamLai': 'Làm lại từ đầu',
      'menu.lamLaiHoi': 'Nạp lại chương trình mẫu của màn này? Bài em đang viết ở màn này sẽ mất (hàm đã lưu và sao vẫn giữ).',
      'menu.lamLaiCo': 'Làm lại',
      'choi.chay': 'Chạy',
      'choi.nhip': 'Nhịp',
      'choi.lai': 'Lại',
      'choi.goiY': 'Gợi ý',
      'choi.deBai': 'Đề bài',
      'choi.toc': '×{n}',
      'choi.nhipDong': 'NHỊP',
      'choi.banhTrai': 'T',
      'choi.banhPhai': 'P',
      'choi.chuongTrinh': 'main',
      'choi.chuongTrinhNgan': 'main',
      'choi.khoiLenh': 'KHỐI LỆNH',
      'choi.xoaHet': 'Xóa hết chương trình',
      'choi.daXoa': 'Đã xóa',
      'choi.hoanTac': 'Hoàn tác',
      'keo.thung': 'Thả vào đây để xóa',
      'choi.xoaHetHoi': 'Xóa hết các dòng của chương trình?',
      'choi.xoaHetCo': 'Xóa hết',
      'choi.khoaO': 'Ô này đang khóa',
      'choi.nhom.goc': 'GỐC',
      'choi.nhom.tay': 'TAY',
      'choi.nhom.day': 'ĐẨY',
      'choi.nhom.em': 'HÀM CỦA EM',
      'choi.nhom.man': 'HÀM CỦA MÀN',
      'choi.nhom.vong': 'VÒNG LẶP',
      'choi.nhom.bien': 'BIẾN',
      'choi.nhom.chan': 'CHÂN',
      'choi.nhom.truot': 'TRƯỢT',
      'choi.nhom.dk': 'ĐIỀU KIỆN',
      'choi.chonChuoi': 'Chọn chữ chỉ đường',
      'choi.xoaChu': 'Xóa chữ cuối',
      'choi.xongChuoi': 'Xong',
      'choi.palLen': 'Kho khối: lên',
      'choi.palXuong': 'Kho khối: xuống',
      'choi.thutRa': 'Thụt ra',
      'choi.thutVao': 'Thụt vào',
      'choi.chonSo': 'Số lần lặp',
      'choi.nhom.chiMan': 'chỉ màn này',
      'choi.hamMoi': 'Hàm mới',
      'choi.suaHam': 'Sửa hàm {ten}',
      'choi.dayKhung': 'Đầy khung rồi: xóa bớt một dòng.',
      'choi.trong': 'Chương trình còn trống.',
      'choi.anBong': 'Ẩn',
      'choi.goiYSo': 'Gợi ý {i}/{n}',
      'choi.khongGoiY': 'Màn này chưa có gợi ý.',
      'choi.chanDoan': 'Chưa được',
      'choi.thongTin': 'Lưu ý',
      'choi.tiep': 'tiếp',
      'choi.truoc': 'trước',
      'choi.chanDoanSo': '{i}/{n}',
      'choi.xemLoi': 'Có lỗi: xem hộp báo ở khối lệnh',
      'choi.loiLuu': 'Không lưu được bài làm trên máy này.',

      /* ---- bảng thắng */
      'thang.tieuDe': 'TỚI CỜ!',
      'thang.tieuDe.duaVat': 'ĐỦ HÀNG!',
      'thang.tieuDe.dayThung': 'ĐÃ XẾP KHO!',
      'thang.o': 'Gọn: {x} ô (cần ≤ {y})',
      'thang.nhip': 'Nhanh: {x} nhịp (cần ≤ {y})',
      'thang.thieuO': 'Còn thiếu sao này: viết gọn hơn.',
      'thang.thieuNhip': 'Còn thiếu sao này: đi đường ngắn hơn.',
      'thang.thieuNhipVat': 'Còn thiếu sao này: làm đủ việc trong ít nhịp hơn.',
      'thang.duSao': 'Đủ 3 sao!',
      'thang.huyHieu': 'Huy hiệu mới',
      'thang.manTiep': 'Màn tiếp',
      'thang.hetChuoi': 'Về màn chọn',
      'thang.choiLai': 'Chơi lại',

      /* ---- xưởng hàm */
      'xuong.ve': 'Về sân',
      'xuong.thu': 'Thử',
      'xuong.lai': 'Lại',
      'xuong.datXe': 'Đặt xe',
      'xuong.vat': 'Vật',
      'xuong.tuong': 'Tường',
      'xuong.def': 'def',
      'xuong.xong': 'Xong: {n} nhịp',
      'xuong.xoaHam': 'Xóa hàm này',
      'xuong.xoaHoi': 'Xóa hàm {ten}?',
      'xuong.xoaCanhBao': 'Các hàm {ds} đang gọi hàm này. Xóa thì chúng sẽ báo lỗi.',
      'xuong.xoaCo': 'Xóa',
      'xuong.trong': 'Thân hàm còn trống.',
      'xuong.hamCoDinh': 'Hàm này cần cho các màn sau, không xóa được.',
      'xuong.oDaCo': 'Ô này đã có {gi}.',
      'xuong.doiSo': 'Giá trị thử của {ten}',
      'xuong.doiChuoi': 'Chuỗi thử của {ten}',
      'xuong.khongCoSo': 'Chưa có dòng nào để thay bằng {ten}: thêm dòng có số (for … range hoặc lời gọi hàm) rồi chọn dòng đó.',
      'xuong.gi.xe': 'xe',
      'xuong.gi.vat': 'vật',
      'xuong.gi.tuong': 'tường',
      'xuong.gi.thung': 'thùng nặng',

      /* ---- hộp đặt tên */
      'ten.tieuDe': 'Đặt tên hàm mới',
      'ten.coDinh': 'Màn này cần hàm có tên này, tên đã đặt sẵn.',
      'ten.coDinhDoiSo': 'Màn này cần hàm có tên và đối số này, đã đặt sẵn.',
      'ten.doiSo': 'Đối số, tối đa {n}: chọn tên hoặc gõ',
      'ten.doiSoCoDinh': 'Đối số',
      'ten.themDoiSo': '+ đối số',
      'ten.boDoiSo': 'Bỏ đối số {ten}',
      'ten.doiSoTrong': 'Đối số chưa có tên.',
      'ten.mauGo': 'ten_ham',
      'ten.tao': 'Tạo hàm',

      /* ---- thông báo chung */
      'tb.khoGhiLoi': 'Không lưu được kho hàm: {loi}',
      'tb.khoDoc': 'Không đọc được kho hàm đã lưu: {loi}'
    }
  };

  var hienTai = 'vi';

  function t(khoa, tham) {
    var bang = CHU[hienTai] || CHU.vi;
    var s = bang[khoa];
    if (s === undefined) s = (CHU.vi[khoa] !== undefined) ? CHU.vi[khoa] : khoa;
    if (tham) s = s.replace(/\{(\w+)\}/g, function (m, k) { return tham[k] === undefined ? m : String(tham[k]); });
    return s;
  }
  CHU.dat = function (ma) { if (CHU[ma]) hienTai = ma; };
  CHU.t = t;
  window.CHU = CHU;
  window.t = t;
})();
