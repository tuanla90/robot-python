/* ============================================================================
   huy-hieu.js — "Robot Chấn Hưng": HUY HIỆU (window.HuyHieu). Từ V7c2 (28/10) chỉ là lớp mỏng trên bộ vector VeVector.HUY_HIEU (huy-hieu-vector.js):
   bộ 36 × 36 điểm ảnh (Painter, partTho, HINH['x'] = function, vePixel, bí danh HINH[a] = HINH[b]) đã xoá; dữ liệu (mã, bí danh) là của huy-hieu-vector.js.

     HuyHieu.DS           mọi mã huy hiệu (hình riêng + bí danh) = VeVector.HUY_HIEU.dsTatCa()
     HuyHieu.maVec(ma)    mã có hình: chính nó, hay mã gốc theo bảng bí danh (doi-* / che-doi-* = hai-robot; me-cung / cam-bien-ben = khoang-cach); null nếu không có
     HuyHieu.ve(ma, tt)   canvas vector (cờ .laVector, .huyHieu = { ma, tt }), tt = 'khoa' | 'mo' | 'xong'; null nếu mã lạ
     HuyHieu.mk(ma, tt, s) phần tử canvas hiển thị 36·s px CSS, rasterise đúng điểm ảnh thiết bị (× 2 chừa phép phóng của #stage); mã lạ: canvas trống cùng cỡ
     Ve.hydrate [data-i="huyhieu"] (ve.js) gọi HuyHieu.mk. Thêm huy hiệu mới: dangKy ở huy-hieu-vector.js (máy kiểm đọc mã qua hoc/huy-hieu-ds.mjs).
   ========================================================================== */
(function () {
  'use strict';

  var CO_GOC = 36, SIEU_MAU = 2;                                    // cạnh hiển thị = 36 · s px CSS; rasterise × dpr × 2 (chừa phép phóng của #stage) rồi trình duyệt thu mịn
  function VV() { return (typeof window !== 'undefined' && window.VeVector && window.VeVector.HUY_HIEU) ? window.VeVector : null; }
  function maVec(ma) {
    var v = VV(); if (!v) return null;
    if (v.HUY_HIEU.co(ma)) return ma;
    var g = v.HUY_HIEU.maGoc(ma); return g !== ma && v.HUY_HIEU.co(g) ? g : null;
  }
  function canhVec(s) { return Math.max(8, Math.round(CO_GOC * (s > 0 ? s : 2) * ((typeof window !== 'undefined' && window.devicePixelRatio) || 1) * SIEU_MAU)); }
  function veVec(ma, tt, s) {
    var m = maVec(ma); if (!m) return null;
    tt = tt === 'khoa' || tt === 'xong' ? tt : 'mo';
    var cv = VV().HUY_HIEU.ve(m, tt, canhVec(s)); if (cv) cv.huyHieu = { ma: ma, tt: tt };
    return cv;
  }
  function ve(ma, tt) { return veVec(ma, tt, 2); }
  function mk(ma, tt, s) {
    s = s > 0 ? s : 2;
    var cv = veVec(ma, tt, s), e = document.createElement('canvas');
    if (cv) { e.width = cv.width; e.height = cv.height; e.getContext('2d').drawImage(cv, 0, 0); }
    else { e.width = e.height = canhVec(s); if (typeof console !== 'undefined' && console.warn) console.warn('HuyHieu: không có hình cho mã "' + ma + '"'); }
    e.style.width = e.style.height = CO_GOC * s + 'px'; e.className = 'pxi'; e.laVector = true;
    return e;
  }

  window.HuyHieu = { ve: ve, mk: mk, maVec: maVec, veVec: veVec, DS: VV() ? VV().HUY_HIEU.dsTatCa() : [] };
})();
