/* ============================================================================
   mo-goi.js — "Đường học": GÓI MÀN và LUẬT MỞ KHÓA (window.MoGoi). Không đụng DOM: chạy được trong Node (máy kiểm kiem-goi.mjs).

   Gói (ThuTuChuong.goi, kiểu hộp của Cut the Rope): mỗi gói là một bộ phận (chương làm quen + chương chế lệnh) hoặc một logic mới.
   Gói mở khi TỔNG SAO của người chơi đủ. Sao cần của gói = TI_LE_SAO × tổng sao tối đa của mọi gói đứng trước (làm tròn xuống bội 5),
   trừ khi gói khai `sao: n`. Gói đầu luôn mở (0 sao). Gói chưa có màn nào là gói "Sắp có" (không mở, không tính sao).

   Luật mở một màn m — MoGoi.trangThai(m, luu, moHet) → { mo: true } hoặc { mo: false, lyDo, … }:
     1. gói của m chưa đủ sao                                         → lyDo 'sao'     (can, co, goi)
     2. m ở chương thứ hai trở đi của gói, chưa thắng thử thách chương ngay trước → 'chuoi'   (chuong = mã, chuoi = số chương hiển thị)
     3. chương của m cần hàm em chế ở MỘT MÀN của chương khác mà màn đó chưa qua  → 'can-ham' (ham, canChuong, canMan)
        (gói mở bằng sao nên có thể tới gói sau mà chưa chế hàm cần dùng; luật này chặn đúng chỗ đó)
     4. trong chương: hàng Làm quen chơi lần lượt ('hang1'); Luyện + Biến thể mở khi xong Làm quen ('hang23'); thử thách mở khi qua đủ 9 màn ('trum').
   luu = { saoTot(maMan) → 0..3 } (game/luu.js); moHet = true: mở hết (bảng Gỡ lỗi).
   ========================================================================== */
(function (goc) {
  'use strict';

  var TI_LE_SAO = 0.5;            // gói sau cần một nửa số sao tối đa của các gói trước (trung bình 1,5 sao mỗi màn)
  var cache = null, khoaCache = '';

  function MH() { return goc.ManHoc; }
  function TT() { return goc.ThuTuChuong || {}; }
  function tenChuong(ma) { var t = TT(); return (t.ten && t.ten[ma]) || ma; }
  function manCua(ma) { return MH().danhSach.filter(function (m) { return m.chuong === ma; }); }
  function trumCua(ma) { return manCua(ma).filter(function (m) { return m.hang === 'trum'; })[0] || null; }
  function sao(luu, ma) { var s = luu && luu.saoTot ? luu.saoTot(ma) : 0; return s > 0 ? s : 0; }
  function qua(luu, ma) { return sao(luu, ma) > 0; }

  /** Các gói theo thứ tự chương (thuTu): [{ ma, ten, so, chuong (chương CÓ màn), chuongKhai, man, saoToiDa, saoCan, sapCo, hinh, dot }]. */
  function dsGoi() {
    var ds = MH().danhSach, tt = TT();
    var thuTu = (tt.thuTu || []).slice();
    var khoa = ds.length + '|' + thuTu.join(',') + '|' + (tt.goi || []).length;
    if (cache && khoa === khoaCache) return cache;
    ds.forEach(function (m) { if (thuTu.indexOf(m.chuong) < 0) thuTu.push(m.chuong); });
    var theoChuong = {};
    (tt.goi || []).forEach(function (g) { (g.chuong || []).forEach(function (c) { if (!theoChuong[c]) theoChuong[c] = g; }); });
    var dot2 = tt.dot2 || [], kq = [], daCo = {}, truoc = 0;
    thuTu.forEach(function (c) {
      var g = theoChuong[c], ma = g ? g.ma : c;
      if (daCo[ma]) return;
      daCo[ma] = true;
      var khai = g ? g.chuong.slice() : [c];
      var coMan = khai.filter(function (x) { return manCua(x).length > 0; });
      var man = [];
      coMan.forEach(function (x) { man = man.concat(manCua(x).slice().sort(function (a, b) { return a.so - b.so; })); });
      var goi = {
        ma: ma, ten: (g && g.ten) || tenChuong(c), so: kq.length + 1,
        chuong: coMan, chuongKhai: khai, man: man,
        saoToiDa: man.length * 3, sapCo: !man.length,
        hinh: (g && g.hinh) || khai[0],
        dot: khai.some(function (x) { return dot2.indexOf(x) >= 0; }) ? 2 : 1
      };
      goi.saoCan = goi.sapCo ? 0 : (g && typeof g.sao === 'number' ? g.sao : Math.floor(TI_LE_SAO * truoc / 5) * 5);
      if (!goi.sapCo) truoc += goi.saoToiDa;
      kq.push(goi);
    });
    cache = kq; khoaCache = khoa;
    return kq;
  }
  function goiTheoMa(ma) { var ds = dsGoi(); for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i]; return null; }
  /** Gói chứa chương maChuong (hoặc null). */
  function goiCua(maChuong) {
    var ds = dsGoi();
    for (var i = 0; i < ds.length; i++) if (ds[i].chuongKhai.indexOf(maChuong) >= 0) return ds[i];
    return null;
  }
  function tongSao(luu) { return MH().danhSach.reduce(function (s, m) { return s + sao(luu, m.ma); }, 0); }
  function saoGoi(g, luu) { return g ? g.man.reduce(function (s, m) { return s + sao(luu, m.ma); }, 0) : 0; }
  function soQua(g, luu) { return g ? g.man.filter(function (m) { return qua(luu, m.ma); }).length : 0; }
  function goiMo(g, luu, moHet) { return !!g && !g.sapCo && (!!moHet || tongSao(luu) >= g.saoCan); }

  /** Hàm em mà chương maChuong cần nhưng được chế ở màn của chương KHÁC: [{ ham, man }] (mỗi hàm một lần; man = màn chế ra nó đầu tiên). */
  function canHam(maChuong) {
    var noiTao = {}, kq = [], da = {};
    MH().danhSach.forEach(function (x) { (x.taoHam || []).forEach(function (t) { if (!noiTao[t]) noiTao[t] = x; }); });
    manCua(maChuong).forEach(function (x) {
      (x.hamCuaEmCan || []).forEach(function (t) {
        var c = noiTao[t];
        if (c && c.chuong !== maChuong && !da[t]) { da[t] = true; kq.push({ ham: t, man: c }); }
      });
    });
    return kq;
  }

  function trangThai(m, luu, moHet) {
    if (moHet) return { mo: true };
    var n = m.chuong, g = goiCua(n);
    if (g && !goiMo(g, luu)) return { mo: false, lyDo: 'sao', can: g.saoCan, co: tongSao(luu), goi: g.ma };
    var vt = g ? g.chuong.indexOf(n) : -1;
    if (vt > 0) {
      var cTruoc = g.chuong[vt - 1], tr = trumCua(cTruoc);
      if (tr && !qua(luu, tr.ma)) return { mo: false, lyDo: 'chuoi', chuong: cTruoc, chuoi: (TT().thuTu || []).indexOf(cTruoc) + 1 };
    }
    var can = canHam(n);
    for (var i = 0; i < can.length; i++) {
      if (!qua(luu, can[i].man.ma)) return { mo: false, lyDo: 'can-ham', ham: can[i].ham, canChuong: can[i].man.chuong, canMan: can[i].man.ma };
    }
    var ds = manCua(n), h1 = ds.filter(function (x) { return x.hang === 'lam-quen'; });
    if (m.hang === 'lam-quen') {
      var k = h1.indexOf(m);
      return k <= 0 || qua(luu, h1[k - 1].ma) ? { mo: true } : { mo: false, lyDo: 'hang1' };
    }
    if (m.hang === 'trum') {
      return ds.every(function (x) { return x.hang === 'trum' || qua(luu, x.ma); }) ? { mo: true } : { mo: false, lyDo: 'trum' };
    }
    return h1.every(function (x) { return qua(luu, x.ma); }) ? { mo: true } : { mo: false, lyDo: 'hang23' };
  }

  /** Màn nên chơi tiếp: màn mở đầu tiên (theo thứ tự) chưa qua; hết thì null. */
  function manTiepTheo(luu, moHet) {
    var ds = MH().danhSach;
    for (var i = 0; i < ds.length; i++) if (!qua(luu, ds[i].ma) && trangThai(ds[i], luu, moHet).mo) return ds[i];
    return null;
  }

  var MoGoi = {
    TI_LE_SAO: TI_LE_SAO,
    dsGoi: dsGoi, goiTheoMa: goiTheoMa, goiCua: goiCua, tongSao: tongSao, saoGoi: saoGoi, soQua: soQua, goiMo: goiMo,
    canHam: canHam, trangThai: trangThai, manTiepTheo: manTiepTheo, trumCua: trumCua
  };
  goc.MoGoi = MoGoi;
  if (typeof module !== 'undefined' && module.exports) module.exports = MoGoi;
})(typeof window !== 'undefined' ? window : globalThis);
