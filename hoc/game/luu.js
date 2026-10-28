/* ============================================================================
   luu.js — "Robot Chấn Hưng": LƯU (window.Luu). Mọi thứ bọc try/catch; hỏng thì chạy không lưu.
     kho hàm  : KhoHam.ghiLuu(Luu.kho)   (khóa của lõi)
     tiến độ  : duong-hoc:tien-do = { phienBan: 1, sao: { 'hai-banh.1': 3, … } }   (khóa = m.ma, cố định khi đổi thứ tự chương)
     bản nháp : duong-hoc:nhap:<ma> = { chinh, hamCuaMan }
     sân thử  : duong-hoc:san-thu:<tenHam> = cách sắp sân thử của Xưởng (xe, vật, tường), riêng từng hàm
     cách lắp : duong-hoc:lap:<ma> = { than, tay, camBien } (màn lắp ráp, lap-rap.js: mỗi khe một mã part hay null), riêng từng màn
     đã xem   : duong-hoc:da-xem = { 'mo-khoa-dot2': true, 'mo-dau': true, 'gioi-thieu': true, … }   (bảng / lời chào chỉ hiện một lần)
     cài đặt  : duong-hoc:cai-dat = { hieuUng, nhac } (mức âm lượng 0..4; xoaHet giữ lại)
     đã mua   : duong-hoc:da-mua = { 'mua-2': true, … } (mùa bán riêng, mo-goi.js; xoaTienDo / xoaHet giữ lại)
     Dữ liệu cũ theo id ('1.1'…'2.10') được chuyển một lần sang ma (chuyenCu).
   ========================================================================== */
(function () {
  'use strict';

  var KHOA_TIEN_DO = 'duong-hoc:tien-do';
  var KHOA_NHAP = 'duong-hoc:nhap:';
  var KHOA_SAN_THU = 'duong-hoc:san-thu:';
  var KHOA_DA_XEM = 'duong-hoc:da-xem';

  // chỗ lưu: localStorage nếu dùng được, không thì bộ nhớ tạm (mất khi tải lại)
  function bo() {
    var mem = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; }
    };
  }
  var kho, laBoNho = false;
  try {
    kho = window.localStorage;
    var thu = 'duong-hoc:thu';
    kho.setItem(thu, '1'); kho.removeItem(thu);
  } catch (e) { kho = bo(); laBoNho = true; }

  function docJson(khoa) {
    try {
      var s = kho.getItem(khoa);
      return s === null || s === undefined ? null : JSON.parse(s);
    } catch (e) { return null; }
  }
  function ghiJson(khoa, v) {
    try { kho.setItem(khoa, JSON.stringify(v)); return true; } catch (e) { return false; }
  }

  /* ---- tiến độ */
  var tienDo = { phienBan: 1, sao: {} };
  function docTienDo() {
    var d = docJson(KHOA_TIEN_DO);
    tienDo = { phienBan: 1, sao: {} };
    if (d && typeof d === 'object' && d.sao && typeof d.sao === 'object') {
      Object.keys(d.sao).forEach(function (id) {
        var n = d.sao[id];
        if (typeof n === 'number' && n >= 0 && n <= 3) tienDo.sao[id] = Math.floor(n);
      });
    }
    if (window.ManHoc && window.ManHoc.phienBanLoTrinh === 2) {
      tienDo.phienBanLoTrinh = 2;
      // Người đã chế follow_right() ở bài cũ vẫn được công nhận đã học hàm.
      // Chỉ chuyển một lần; không cấp lại sao khi người chơi xóa tiến độ sau đó.
      if (d && d.phienBanLoTrinh !== 2 && tienDo.sao['che-cam-bien.6']) {
        tienDo.sao['me-cung.6'] = Math.max(tienDo.sao['me-cung.6'] || 0, tienDo.sao['che-cam-bien.6']);
        ghiJson(KHOA_TIEN_DO, tienDo);
      }
    }
  }
  function saoTot(id) { return tienDo.sao[id] || 0; }
  function daQua(id) { return saoTot(id) > 0; }
  /** Ghi sao nếu tốt hơn bản cũ. Trả về sao tốt nhất mới. */
  function ghiSao(id, sao) {
    if (sao > saoTot(id)) { tienDo.sao[id] = sao; ghiJson(KHOA_TIEN_DO, tienDo); }
    return saoTot(id);
  }

  /* ---- bản nháp theo màn */
  function sachDs(a) {
    return Array.isArray(a) ? a.filter(function (s) { return typeof s === 'string' && s.trim() !== ''; }) : [];
  }
  function phienBanMan(id) {
    var m = window.ManHoc && typeof window.ManHoc.timMa === 'function' && window.ManHoc.timMa(id);
    return m && m.phienBanNoiDung || 1;
  }
  function docNhap(id) {
    var d = docJson(KHOA_NHAP + id);
    // Giữ sao; code nháp của nhiệm vụ cũ được giữ trong storage nhưng không nạp nhầm.
    if (d && (d.phienBanNoiDung || 1) !== phienBanMan(id)) return null;
    if (!d || typeof d !== 'object' || !Array.isArray(d.chinh)) return null;      // không đúng dạng → coi như chưa có bản nháp
    var hm = Array.isArray(d.hamCuaMan) ? d.hamCuaMan : [];
    var kq = {
      chinh: sachDs(d.chinh),
      hamCuaMan: hm.filter(function (h) { return h && typeof h.ten === 'string'; }).map(function (h) {
        return { ten: h.ten, thamSo: Array.isArray(h.thamSo) ? h.thamSo.slice() : [], than: sachDs(h.than) };
      })
    };
    if (Array.isArray(d.doi)) kq.doi = d.doi.map(function (x) { return { chinh: sachDs(x && x.chinh) }; });      // màn nhiều robot: chương trình chính của từng robot
    return kq;
  }
  function ghiNhap(id, bai) {
    return ghiJson(KHOA_NHAP + id, {
      phienBanNoiDung: phienBanMan(id),
      chinh: bai.chinh.slice(),
      hamCuaMan: bai.hamCuaMan.map(function (h) { return { ten: h.ten, thamSo: h.thamSo.slice(), than: h.than.slice() }; }),
      doi: bai.doi ? bai.doi.map(function (x) { return { chinh: x.chinh.slice() }; }) : undefined
    });
  }

  /** Bỏ bản nháp của một màn ("Làm lại từ đầu"). Không đụng tới sao hay kho hàm. */
  function xoaNhap(id) { try { kho.removeItem(KHOA_NHAP + id); return true; } catch (e) { return false; } }

  /* ---- cách sắp sân thử của Xưởng hàm: duong-hoc:san-thu:<tenHam> = { rong, cao, batDau: {x,y,huong}, vat: [{x,y}], tuong: [{x,y}] }
        (lưu riêng từng hàm; dữ liệu hỏng thì trả null, người dùng thấy sân mặc định; chuẩn hóa số liệu là việc của ChamHoc.chuanSanThu) */
  function docSanThu(ten) {
    var d = docJson(KHOA_SAN_THU + ten);
    return d && typeof d === 'object' && !Array.isArray(d) ? d : null;
  }
  function ghiSanThu(ten, cfg) { return ghiJson(KHOA_SAN_THU + ten, cfg); }
  function xoaSanThu(ten) { try { kho.removeItem(KHOA_SAN_THU + ten); return true; } catch (e) { return false; } }

  /* ---- cách lắp robot của màn lắp ráp (chế độ lắp ráp, lap-rap.js): duong-hoc:lap:<ma> = { than, tay, camBien }, mỗi khe một mã part hay null.
        Chỉ kiểm dạng; cách lắp còn hợp lệ với màn hay không là việc của LapRap.kiemCachLap (giao diện tự bỏ cách cũ nếu hỏng). */
  var KHOA_LAP = 'duong-hoc:lap:';
  function motMa(v) { return typeof v === 'string' && v ? v : null; }
  function docLap(id) {
    var d = docJson(KHOA_LAP + id);
    if (!d || typeof d !== 'object' || Array.isArray(d) || !motMa(d.than)) return null;
    return { than: d.than, tay: motMa(d.tay), camBien: motMa(d.camBien) };
  }
  function ghiLap(id, c) { return ghiJson(KHOA_LAP + id, { than: motMa(c && c.than), tay: motMa(c && c.tay), camBien: motMa(c && c.camBien) }); }
  function xoaLap(id) { try { kho.removeItem(KHOA_LAP + id); return true; } catch (e) { return false; } }

  /* ---- cờ "đã xem" (bảng chỉ hiện một lần, vd. 'mo-khoa-dot2' khi vừa mở các chương bộ phận mới) */
  function daXem(ten) {
    var d = docJson(KHOA_DA_XEM);
    return !!(d && typeof d === 'object' && d[ten] === true);
  }
  function datDaXem(ten) {
    var d = docJson(KHOA_DA_XEM);
    if (!d || typeof d !== 'object' || Array.isArray(d)) d = {};
    d[ten] = true;
    return ghiJson(KHOA_DA_XEM, d);
  }

  /** Xóa sao / tiến độ và cờ "đã xem" (bảng Gỡ lỗi, go-loi.js). Bản nháp xóa từng màn bằng xoaNhap; kho hàm và sân thử không bị đụng tới. */
  function xoaTienDo() {
    try { kho.removeItem(KHOA_TIEN_DO); kho.removeItem(KHOA_DA_XEM); } catch (e) { /* bỏ qua */ }
    docTienDo();
    return true;
  }

  /* ---- cài đặt (cai-dat.js): duong-hoc:cai-dat = { hieuUng: 0..4, nhac: 0..4, mat: bool }. Xóa tiến độ không đụng tới. V7c1 (28/10): bỏ trường màu sơn R1 (sơn mở khoá đã bỏ; trường cũ trong kho bị bỏ qua). */
  var KHOA_CAI_DAT = 'duong-hoc:cai-dat';
  var CAI_DAT_GOC = { hieuUng: 3, nhac: 2, mat: true };
  function docCaiDat() {
    var d = docJson(KHOA_CAI_DAT), kq = {};
    ['hieuUng', 'nhac'].forEach(function (k) {
      var v = d && typeof d === 'object' ? d[k] : undefined;
      kq[k] = typeof v === 'number' && v >= 0 && v <= 4 ? Math.floor(v) : CAI_DAT_GOC[k];
    });
    kq.mat = d && typeof d === 'object' && typeof d.mat === 'boolean' ? d.mat : true;
    return kq;
  }
  function ghiCaiDat(c) {
    var cur = docCaiDat(), moi = Object.assign({}, cur, c || {});
    return ghiJson(KHOA_CAI_DAT, {
      hieuUng: typeof moi.hieuUng === 'number' ? Math.max(0, Math.min(4, Math.floor(moi.hieuUng))) : cur.hieuUng,
      nhac: typeof moi.nhac === 'number' ? Math.max(0, Math.min(4, Math.floor(moi.nhac))) : cur.nhac,
      mat: typeof moi.mat === 'boolean' ? moi.mat : cur.mat
    });
  }

  /* ---- mùa đã mua (thu-tu-chuong.js, mùa có `ban`). Hiện là mua THỬ: chưa nối thanh toán, chỉ ghi cờ trên máy này. */
  var KHOA_DA_MUA = 'duong-hoc:da-mua';
  function docDaMua() { var d = docJson(KHOA_DA_MUA); return d && typeof d === 'object' ? d : {}; }
  function daMua(ma) { return docDaMua()[ma] === true; }
  function datDaMua(ma) { var d = docDaMua(); d[ma] = true; return ghiJson(KHOA_DA_MUA, d); }
  /** Bỏ mọi mùa đã mua (bảng Gỡ lỗi, để thử lại nút mua). */
  function xoaDaMua() { try { kho.removeItem(KHOA_DA_MUA); } catch (e) { return false; } return true; }

  /** Xóa SẠCH dữ liệu chơi (sao, bản nháp, kho hàm, sân thử, cách lắp, cờ đã xem); chỉ giữ cài đặt và mùa đã mua. Gọi xong nên tải lại trang. */
  function xoaHet() {
    try {
      var ds = [];
      for (var i = 0; i < kho.length; i++) { var k = kho.key(i); if (k && k.indexOf('duong-hoc:') === 0 && k !== KHOA_CAI_DAT && k !== KHOA_DA_MUA) ds.push(k); }
      ds.forEach(function (k) { kho.removeItem(k); });
    } catch (e) { return false; }
    docTienDo();
    return true;
  }

  /* ---- kho hàm của em */
  var loiKho = null;
  function docKho() {
    var r = KhoHam.docLuu(kho);
    loiKho = r.ok ? null : r;
    return r;
  }
  function ghiKho() {
    var r = KhoHam.ghiLuu(kho);
    if (!r.ok) loiKho = r;
    return r;
  }

  /** Dữ liệu cũ lưu theo id hiển thị cũ: chuỗi 1 = chương hai-banh, chuỗi 2 = xuong-ham. Chuyển sang khóa `ma`, chạy một lần
   *  (khóa cũ bị xóa). Cố tình dùng bảng cố định, không dùng ManHoc.tim(id) vì id đổi theo thứ tự chương. */
  var CU = { 1: 'hai-banh', 2: 'xuong-ham' };
  function chuyenCu() {
    try {
      var doi = false;
      Object.keys(CU).forEach(function (n) {
        for (var so = 1; so <= 10; so++) {
          var id = n + '.' + so, ma = CU[n] + '.' + so;
          if (tienDo.sao[id] !== undefined) {
            if (tienDo.sao[id] > (tienDo.sao[ma] || 0)) tienDo.sao[ma] = tienDo.sao[id];
            delete tienDo.sao[id]; doi = true;
          }
          var nh = kho.getItem(KHOA_NHAP + id);
          if (nh !== null && nh !== undefined) {
            if (kho.getItem(KHOA_NHAP + ma) === null) kho.setItem(KHOA_NHAP + ma, nh);
            kho.removeItem(KHOA_NHAP + id);
          }
        }
      });
      if (doi) ghiJson(KHOA_TIEN_DO, tienDo);
    } catch (e) { /* chạy không chuyển */ }
  }

  docTienDo();
  chuyenCu();

  var Luu = {
    chuyenCu: chuyenCu, docTienDo: docTienDo,
    kho: kho, laBoNho: laBoNho,
    saoTot: saoTot, daQua: daQua, ghiSao: ghiSao,
    docNhap: docNhap, ghiNhap: ghiNhap, xoaNhap: xoaNhap,
    docSanThu: docSanThu, ghiSanThu: ghiSanThu, xoaSanThu: xoaSanThu,
    docLap: docLap, ghiLap: ghiLap, xoaLap: xoaLap,
    daXem: daXem, datDaXem: datDaXem, xoaTienDo: xoaTienDo, xoaHet: xoaHet,
    docCaiDat: docCaiDat, ghiCaiDat: ghiCaiDat,
    daMua: daMua, datDaMua: datDaMua, xoaDaMua: xoaDaMua,
    docKho: docKho, ghiKho: ghiKho,
    coHam: function (ten) { try { return KhoHam.ds().some(function (f) { return f.ten === ten; }); } catch (e) { return true; } },   // kho của em có hàm này chưa (mo-goi.js: lyDo 'mat-ham')
    get loiKho() { return loiKho; },
    KHOA_TIEN_DO: KHOA_TIEN_DO, KHOA_NHAP: KHOA_NHAP
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Luu;
  if (typeof window !== 'undefined') window.Luu = Luu;
})();
