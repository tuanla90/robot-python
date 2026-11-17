/* ============================================================================
   man-chon-doi.js — diem10code-python: MÀN CHỌN XE / LẮP PART (window.ChonDoi), mùa 5 cột 3 và cột 4. Màn hình 'doi' (#sc-doi), App.vaoManDuLieu mở trước màn chơi khi màn có man.chonDoi.
   ChonDoi.vao(m, { chon, khiVe, khiXong(chon) }): m là màn gốc, chon là lựa chọn đã lưu (có thể null), khiXong nhận mảng mã cỗ máy của từng xe.

   Trên cùng là sân vẽ đúng hai xe đang chọn, đổi xe là sân đổi theo. Hai ô R1, R2 chọn xe đang sửa. Bên dưới:
     - cột 3 (không có m.chonDoi.khe): các thẻ cỗ máy trong bảng chọn của xe đó, mỗi thẻ nói làm được gì, vướng gì;
     - cột 4 (có m.chonDoi.khe = { than, tay, cam }): ba hàng part, chỉ cho ghép các cặp đã gặp (CoMay.GHEP), đổi thân thì tay và cảm biến không hợp tự về cái đầu tiên hợp.
   Màn có code mẫu thì hiện code của xe đang chọn, dòng gọi lệnh cỗ máy không có thì tô đỏ, để em đọc code rồi mới chọn. Luật chọn của LapRap (lap-rap.js), bảng part của CoMay (co-may.js).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var el = {};
  var S = { m: null, chon: [], xe: 0, tuy: null, field: null };
  var KHE = [['than', 'THÂN'], ['tay', 'TAY'], ['cam', 'CẢM BIẾN']];

  function C() { return S.m.chonDoi; }
  function laLap() { return !!C().khe; }
  function menuXe(i) { return (C().menuXe && C().menuXe[i]) || C().menu; }
  function may(ma) { return CoMay.thongTin(ma); }
  function chuoiChon(ma) { return CoMay.tachMa(ma); }
  function maGhep(c) { return c.than + '|' + c.tay + '|' + c.cam; }

  function dung(host) {
    host.innerHTML = '';
    host.appendChild(h('div', 'deco'));
    var dau = h('div', 'c-dau');
    var ve = h('button', 'bt g-pu nav'); ve.setAttribute('aria-label', t('goi.ve')); ve.setAttribute('data-nut', 've-doi');
    var ic = h('span'); ic.setAttribute('data-i', 'back'); ic.setAttribute('data-s', '2'); ve.appendChild(ic);
    el.tieuDe = h('div', 'c-td cx-td');
    dau.appendChild(ve); dau.appendChild(el.tieuDe);
    host.appendChild(dau);

    var cuon = h('div', 'cx-cuon');
    var tren = h('div', 'cx-tren');
    var khungSan = h('div', 'ffr cx-san');
    el.cv = h('canvas', 'tex'); khungSan.appendChild(el.cv);
    tren.appendChild(khungSan);
    el.deBai = h('div', 'cx-de'); tren.appendChild(el.deBai);
    cuon.appendChild(tren);
    el.xe = h('div', 'cx-xe'); cuon.appendChild(el.xe);
    el.chon = h('div', 'cx-chon'); cuon.appendChild(el.chon);
    el.code = h('div', 'cx-code'); cuon.appendChild(el.code);
    el.tom = h('div', 'cx-tom'); cuon.appendChild(el.tom);
    host.appendChild(cuon);

    el.vao = h('button', 'bt g-gr lr-xong cx-vao', t('doi.vao')); el.vao.setAttribute('data-nut', 'vao-man');
    host.appendChild(el.vao);
    Ve.hydrate(host);

    ve.addEventListener('click', function () { if (S.tuy && S.tuy.khiVe) S.tuy.khiVe(); });
    el.vao.addEventListener('click', function () {
      if (!LapRap.kiemChon(S.m, S.chon).ok) return;
      Luu.ghiDoi(S.m.ma, S.chon);
      if (S.tuy && S.tuy.khiXong) S.tuy.khiXong(S.chon.slice());
    });
    S.field = new SanVe.Field(el.cv, { kich: 150, catMep: true });
  }

  /** Lựa chọn lúc vào màn: đã lưu, không thì màn đặt sẵn, không thì cỗ máy đầu tiên của mỗi xe. */
  function chonDau(m, chon) {
    if (chon && LapRap.kiemChon(m, chon).ok) return chon.slice();
    var md = m.chonDoi.macDinh;
    if (md && LapRap.kiemChon(m, md).ok) return md.slice();
    var so = LapRap.soChonCua(m), kq = [], i;
    for (i = 0; i < so; i++) kq.push(((m.chonDoi.menuXe && m.chonDoi.menuXe[i]) || m.chonDoi.menu)[0]);
    return kq;
  }

  function hinhRobot(ma, i, px) {
    var d = CoMay.dung(ma, i === 1 ? { son: 'lam' } : {});
    var cv;
    try { cv = VeRobot.veCo(d.robot, { tay: { tuThe: 'tren', kep: false }, camBien: { mat: true } }, 0, px); }
    catch (e) { cv = h('canvas'); }
    cv.classList.add('cx-hinh');
    return cv;
  }

  function veSan() {
    var m = LapRap.apDungDoi(S.m, S.chon);
    S.field.nap(Choi.cauHinhSanCua(m, 0));
  }

  function veXe() {
    el.xe.innerHTML = '';
    S.chon.forEach(function (ma, i) {
      var nut = h('button', 'lr-the cd-khe cx-o' + (i === S.xe ? ' chon' : ''));
      nut.setAttribute('data-nut', 'xe-' + (i + 1));
      var hinh = h('div', 'cx-o-hinh'); hinh.appendChild(hinhRobot(ma, i, 40)); nut.appendChild(hinh);
      var tx = h('div', 'cx-o-chu');
      tx.appendChild(h('div', 'cx-o-ai', 'R' + (i + 1)));
      tx.appendChild(h('div', 'lr-the-ten', may(ma).ten));
      nut.appendChild(tx);
      nut.addEventListener('click', function () { S.xe = i; veTat(); });
      el.xe.appendChild(nut);
    });
  }

  function doiMa(ma) {
    S.chon[S.xe] = ma;
    veTat(); veSan();
  }

  /** Cột 3: mỗi cỗ máy một thẻ. */
  function veTheMay() {
    el.chon.className = 'cx-chon cx-the';
    menuXe(S.xe).forEach(function (ma) {
      var d = may(ma), nut = h('button', 'lr-the cx-may' + (S.chon[S.xe] === ma ? ' chon' : ''));
      nut.setAttribute('data-may', ma);
      var hinh = h('div', 'cx-may-hinh'); hinh.appendChild(hinhRobot(ma, S.xe, 34)); nut.appendChild(hinh);
      nut.appendChild(h('div', 'lr-the-ten', d.ten));
      nut.addEventListener('click', function () { doiMa(ma); });
      el.chon.appendChild(nut);
    });
  }

  /** Cột 4: ba hàng part. Hàng tay và cảm biến chỉ bật các part ghép được với thân đang chọn. */
  function veKhePart() {
    el.chon.className = 'cx-chon cx-khes';
    var hien = chuoiChon(S.chon[S.xe]), khe = C().khe, ghep = CoMay.GHEP[hien.than];
    KHE.forEach(function (k) {
      var hang = h('div', 'cx-khe');
      hang.appendChild(h('div', 'cx-khe-ten', k[1]));
      var ds = h('div', 'cx-khe-ds');
      khe[k[0]].forEach(function (ma) {
        var duoc = k[0] === 'than' || ghep[k[0]].indexOf(ma) >= 0;
        var nut = h('button', 'lr-the cx-part' + (hien[k[0]] === ma ? ' chon' : '') + (duoc ? '' : ' mo'), CoMay.PART[k[0]][ma].ten);
        nut.setAttribute('data-khe', k[0]); nut.setAttribute('data-part', ma);
        if (!duoc) nut.setAttribute('aria-disabled', 'true');
        nut.addEventListener('click', function () {
          if (!duoc) { if (window.App && App.thongBao) App.thongBao(t('doi.khongGhep', { than: CoMay.PART.than[hien.than].ten, part: CoMay.PART[k[0]][ma].ten })); return; }
          var moi = { than: hien.than, tay: hien.tay, cam: hien.cam };
          moi[k[0]] = ma;
          if (k[0] === 'than') {             // đổi thân: tay, cảm biến không hợp thì về cái đầu tiên hợp trong bảng của màn
            var g = CoMay.GHEP[ma];
            if (g.tay.indexOf(moi.tay) < 0) moi.tay = khe.tay.filter(function (x) { return g.tay.indexOf(x) >= 0; })[0];
            if (g.cam.indexOf(moi.cam) < 0) moi.cam = khe.cam.filter(function (x) { return g.cam.indexOf(x) >= 0; })[0];
          }
          doiMa(maGhep(moi));
        });
        ds.appendChild(nut);
      });
      hang.appendChild(ds);
      el.chon.appendChild(hang);
    });
  }

  function veTom() {
    var d = may(S.chon[S.xe]);
    el.tom.innerHTML = '';
    el.tom.appendChild(h('div', 'cx-tom-dong', d.moTa));
    if (laLap()) el.tom.appendChild(h('div', 'cx-tom-dong', d.moTaTay + ' ' + d.moTaCam));
    el.tom.appendChild(h('div', 'cx-tom-dong ket', d.ket));
    el.tom.appendChild(h('div', 'cx-tom-lenh', d.lenh.map(function (l) { return d.than === 'nhen' && /^magnet_[ns]$/.test(l) ? l + '("up")' : l + '()'; }).join('  ')));
  }

  /** Code mẫu của xe đang chọn: dòng gọi lệnh cỗ máy không có thì tô đỏ. */
  function veCode() {
    var dong = (S.m.maMau && S.m.maMau.doi && S.m.maMau.doi[S.xe] && S.m.maMau.doi[S.xe].chinh) || [];
    el.code.innerHTML = '';
    el.code.style.display = dong.length ? '' : 'none';
    if (!dong.length) return;
    var mk = Object.assign({}, S.m, { hamGoc: may(S.chon[S.xe]).lenh });
    var mat = LapRap.lenhKhongCon(mk, dong);
    el.code.appendChild(h('div', 'cx-code-td', t('doi.codeCua', { xe: 'R' + (S.xe + 1) })));
    dong.forEach(function (d, i) {
      el.code.appendChild(h('div', 'cx-dong' + (mat.indexOf(i) >= 0 ? ' mat' : '') + (d.trim() ? '' : ' trong'), d.trim() ? d : '...'));
    });
  }

  function veTat() {
    veXe();
    el.chon.innerHTML = '';
    if (laLap()) veKhePart(); else veTheMay();
    veTom();
    veCode();
  }

  function vao(m, tuy) {
    S.m = m; S.tuy = tuy || {}; S.xe = 0;
    S.chon = chonDau(m, S.tuy.chon);
    if (!el.vao) dung(document.getElementById('sc-doi'));
    el.tieuDe.textContent = m.id + ' ' + m.ten;
    el.deBai.textContent = m.deBai;
    el.vao.textContent = t('doi.vao');
    veTat();
    veSan();
    if (window.VeIcon && VeIcon.thay) Promise.resolve().then(function () { VeIcon.thay(document.getElementById('sc-doi')); });
  }

  window.ChonDoi = { dung: dung, vao: vao, trangThai: function () { return { man: S.m, chon: S.chon.slice(), xe: S.xe }; } };
})();
