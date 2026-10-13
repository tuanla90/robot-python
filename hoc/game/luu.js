/* ============================================================================
   luu.js — "Đường học": LƯU (window.Luu). Mọi thứ bọc try/catch; hỏng thì chạy không lưu.
     kho hàm  : KhoHam.ghiLuu(Luu.kho)   (khóa của lõi)
     tiến độ  : duong-hoc:tien-do = { phienBan: 1, sao: { '1.1': 3, … } }
     bản nháp : duong-hoc:nhap:<id> = { chinh, hamCuaMan }
   ========================================================================== */
(function () {
  'use strict';

  var KHOA_TIEN_DO = 'duong-hoc:tien-do';
  var KHOA_NHAP = 'duong-hoc:nhap:';

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
  function docNhap(id) {
    var d = docJson(KHOA_NHAP + id);
    if (!d || typeof d !== 'object' || !Array.isArray(d.chinh)) return null;      // không đúng dạng → coi như chưa có bản nháp
    var hm = Array.isArray(d.hamCuaMan) ? d.hamCuaMan : [];
    return {
      chinh: sachDs(d.chinh),
      hamCuaMan: hm.filter(function (h) { return h && typeof h.ten === 'string'; }).map(function (h) {
        return { ten: h.ten, thamSo: Array.isArray(h.thamSo) ? h.thamSo.slice() : [], than: sachDs(h.than) };
      })
    };
  }
  function ghiNhap(id, bai) {
    return ghiJson(KHOA_NHAP + id, {
      chinh: bai.chinh.slice(),
      hamCuaMan: bai.hamCuaMan.map(function (h) { return { ten: h.ten, thamSo: h.thamSo.slice(), than: h.than.slice() }; })
    });
  }

  /** Bỏ bản nháp của một màn ("Làm lại từ đầu"). Không đụng tới sao hay kho hàm. */
  function xoaNhap(id) { try { kho.removeItem(KHOA_NHAP + id); return true; } catch (e) { return false; } }

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

  docTienDo();

  window.Luu = {
    kho: kho, laBoNho: laBoNho,
    docTienDo: docTienDo, saoTot: saoTot, daQua: daQua, ghiSao: ghiSao,
    docNhap: docNhap, ghiNhap: ghiNhap, xoaNhap: xoaNhap,
    docKho: docKho, ghiKho: ghiKho,
    get loiKho() { return loiKho; },
    KHOA_TIEN_DO: KHOA_TIEN_DO, KHOA_NHAP: KHOA_NHAP
  };
})();
