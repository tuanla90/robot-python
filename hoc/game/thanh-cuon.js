/* ============================================================================
   thanh-cuon.js — "Robot Chấn Hưng": THANH CUỘN KIỂU PIXEL (window.ThanhCuon).
   Thanh cuộn của trình duyệt không hợp giao diện, và trên điện thoại (iOS, Android) không đổi kiểu được bằng CSS. Nên vùng cuộn trong hộp
   (thẻ bộ phận, sổ lệnh, bảng mở gói) ẩn thanh gốc và vẽ thanh riêng: rãnh tối viền mực, cục kéo vàng như nút game.
   ThanhCuon.gan(el)  el là phần tử có overflow-y:auto. Thanh nằm bên phải el (cha của el được đặt position:relative), tự ẩn khi không có gì để cuộn.
                      Vuốt / lăn trong el như cũ; kéo cục vàng để cuộn; chạm vào rãnh thì cuộn một trang về phía đó.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var CUC_TOI_THIEU = 24;                     // chiều cao tối thiểu của cục kéo (px giao diện), đủ to cho ngón tay

  function gan(el) {
    if (!el || el.__tc) return;
    var cha = el.parentNode;
    if (!cha) return;
    if (getComputedStyle(cha).position === 'static') cha.style.position = 'relative';
    el.classList.add('tc-an');
    var ray = h('div', 'tc-ray'), cuc = h('div', 'tc-cuc');
    ray.appendChild(cuc);
    cha.appendChild(ray);
    el.__tc = ray;

    function veLai() {
      var ch = el.clientHeight, sh = el.scrollHeight;
      if (!el.isConnected || sh <= ch + 1) { ray.style.display = 'none'; return; }
      ray.style.display = '';
      ray.style.top = el.offsetTop + 'px';
      ray.style.height = ch + 'px';
      ray.style.left = (el.offsetLeft + el.offsetWidth - ray.offsetWidth) + 'px';
      var cao = Math.max(CUC_TOI_THIEU, Math.round(ch * ch / sh)), chay = ch - cao;
      cuc.style.height = cao + 'px';
      cuc.style.top = Math.round(chay * el.scrollTop / (sh - ch)) + 'px';
    }
    /** Tỉ lệ px màn hình / px giao diện (khung game co giãn bằng transform). */
    function tiLe() { return el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1; }

    var keo = null;
    cuc.addEventListener('pointerdown', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      keo = { y: ev.clientY, dau: el.scrollTop, id: ev.pointerId };
      try { cuc.setPointerCapture(ev.pointerId); } catch (e) { /* bỏ qua */ }
      ray.classList.add('dang-keo');
    });
    cuc.addEventListener('pointermove', function (ev) {
      if (!keo || ev.pointerId !== keo.id) return;
      var ch = el.clientHeight, sh = el.scrollHeight, chay = ch - cuc.offsetHeight;
      if (chay <= 0) return;
      el.scrollTop = keo.dau + (ev.clientY - keo.y) / tiLe() * (sh - ch) / chay;
    });
    function tha() { keo = null; ray.classList.remove('dang-keo'); }
    cuc.addEventListener('pointerup', tha);
    cuc.addEventListener('pointercancel', tha);
    ray.addEventListener('pointerdown', function (ev) {
      if (ev.target !== ray) return;
      ev.preventDefault();
      var r = cuc.getBoundingClientRect();
      el.scrollTop += (ev.clientY < r.top ? -1 : 1) * el.clientHeight * 0.9;
    });

    el.addEventListener('scroll', veLai, { passive: true });
    if (window.ResizeObserver) { var ro = new ResizeObserver(veLai); ro.observe(el); if (el.firstElementChild) ro.observe(el.firstElementChild); }
    if (window.MutationObserver) new MutationObserver(function () { requestAnimationFrame(veLai); }).observe(el, { childList: true, subtree: true });
    requestAnimationFrame(veLai);
  }

  window.ThanhCuon = { gan: gan };
})();
