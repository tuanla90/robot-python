/* ============================================================================
   mo-goi.js — "Đường học": GÓI MÀN và LUẬT MỞ KHÓA (window.MoGoi). Không đụng DOM: chạy được trong Node (máy kiểm kiem-goi.mjs).

   Gói (ThuTuChuong.goi, kiểu hộp của Cut the Rope): mỗi gói là một bộ phận (chương làm quen + chương chế lệnh) hoặc một logic mới.
   MÙA (ThuTuChuong.mua, kiểu episode của Angry Birds, 22/10): mỗi gói thuộc một mùa (g.mua, mặc định mùa đầu). Mùa 1 là lộ trình chính;
   gói mở rộng nằm ở mùa sau, nên thêm nội dung KHÔNG làm đổi ngưỡng sao của mùa trước. Mùa mở theo `mo`: { sao: n, mua } (đủ n sao ở mùa đó)
   hay { goi: mã } (qua hết màn của gói đó); không khai thì luôn mở.
   Gói mở khi SỐ SAO TRONG MÙA của nó đủ. Sao cần = gói khai `sao: n` (mùa 1 khai cứng cả 22 gói, 22/10), không khai thì
   TI_LE_SAO × tổng sao tối đa của các gói đứng trước TRONG CÙNG MÙA (làm tròn xuống bội 5). Gói đầu mỗi mùa cần 0 sao.
   Gói ĐÃ MỞ thì không bao giờ khóa lại: cờ 'goi-mo:<mã>' (Luu.daXem, ghi khi bảng "Mở gói mới!" hiện) giữ gói mở dù ngưỡng sau này có đổi.
   Gói chưa có màn nào là gói "Sắp có" (không mở, không tính sao).

   Luật mở một màn m — MoGoi.trangThai(m, luu, moHet) → { mo: true } hoặc { mo: false, lyDo, … }:
     1. gói của m chưa đủ sao                                         → lyDo 'sao'     (can, co, goi)
     2. m ở chương thứ hai trở đi của gói, chưa thắng thử thách chương ngay trước → 'chuoi'   (chuong = mã, chuoi = số chương hiển thị)
     3. chương của m cần hàm em chế ở MỘT MÀN của chương khác mà màn đó chưa qua  → 'can-ham' (ham, canChuong, canMan)
        (gói mở bằng sao nên có thể tới gói sau mà chưa chế hàm cần dùng; luật này chặn đúng chỗ đó)
     3b. màn cần hàm em đã "tạo" ở một màn đã qua mà kho không có hàm đó (luu.coHam) → 'mat-ham' (ham, canChuong, canMan): quay lại màn đó tạo hàm
     4. trong chương: hàng Làm quen chơi lần lượt ('hang1'); Luyện + Biến thể mở khi xong Làm quen ('hang23'); thử thách mở khi qua đủ 9 màn ('trum').
   luu = { saoTot(maMan) → 0..3, daXem(cờ)? } (game/luu.js); moHet = true: mở hết (bảng Gỡ lỗi). Gói chưa mở vì MÙA chưa mở → lyDo 'mua' (mua, dieuKien).
   ========================================================================== */
(function (goc) {
  'use strict';

  var TI_LE_SAO = 0.5;            // gói sau cần một nửa số sao tối đa của các gói trước (trung bình 1,5 sao mỗi màn)
  var cache = null, khoaCache = '', cacheMua = null;

  function MH() { return goc.ManHoc; }
  function TT() { return goc.ThuTuChuong || {}; }
  function tenChuong(ma) { var t = TT(); return (t.ten && t.ten[ma]) || ma; }
  function manCua(ma) { return MH().danhSach.filter(function (m) { return m.chuong === ma; }); }
  function trumCua(ma) { return manCua(ma).filter(function (m) { return m.hang === 'trum'; })[0] || null; }
  function sao(luu, ma) { var s = luu && luu.saoTot ? luu.saoTot(ma) : 0; return s > 0 ? s : 0; }
  function qua(luu, ma) { return sao(luu, ma) > 0; }
  function daXem(luu, co) { try { return !!(luu && luu.daXem && luu.daXem(co)); } catch (e) { return false; } }
  /** Các mùa khai trong ThuTuChuong.mua (không khai: một mùa duy nhất 'mua-1'). */
  function muaKhai() { var m = TT().mua; return m && m.length ? m : [{ ma: 'mua-1', ten: 'Mùa 1' }]; }

  /** Các gói theo thứ tự chương (thuTu): [{ ma, ten, so, chuong (chương CÓ màn), chuongKhai, man, saoToiDa, saoCan, sapCo, hinh, loai, mua, dot }]. */
  function dsGoi() {
    var ds = MH().danhSach, tt = TT();
    var thuTu = (tt.thuTu || []).slice();
    var khoa = ds.length + '|' + thuTu.join(',') + '|' + (tt.goi || []).map(function (g) { return g.ma + ':' + (g.mua || '') + ':' + (g.sao === undefined ? '' : g.sao); }).join(',') + '|' + JSON.stringify(tt.mua || null);
    if (cache && khoa === khoaCache) return cache;
    ds.forEach(function (m) { if (thuTu.indexOf(m.chuong) < 0) thuTu.push(m.chuong); });
    var theoChuong = {};
    (tt.goi || []).forEach(function (g) { (g.chuong || []).forEach(function (c) { if (!theoChuong[c]) theoChuong[c] = g; }); });
    var dot2 = tt.dot2 || [], kq = [], daCo = {}, truoc = {}, muaDau = muaKhai()[0].ma;
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
        loai: (g && g.loai) || 'khai-niem',                  // 'bo-phan' | 'khai-niem' | 'thu-thach' (thu-tu-chuong.js)
        mua: (g && g.mua) || muaDau,
        dot: khai.some(function (x) { return dot2.indexOf(x) >= 0; }) ? 2 : 1
      };
      var tr = truoc[goi.mua] || 0;                           // tổng sao tối đa các gói trước, chỉ trong mùa này
      goi.saoCan = goi.sapCo ? 0 : (g && typeof g.sao === 'number' ? g.sao : Math.floor(TI_LE_SAO * tr / 5) * 5);
      if (!goi.sapCo) truoc[goi.mua] = tr + goi.saoToiDa;
      kq.push(goi);
    });
    cache = kq; khoaCache = khoa;
    cacheMua = muaKhai().map(function (x, i) {
      return { ma: x.ma, ten: x.ten || x.ma, so: i + 1, mo: x.mo || null, goi: kq.filter(function (gg) { return gg.mua === x.ma; }) };
    });
    return kq;
  }
  /** Các mùa: [{ ma, ten, so, mo (điều kiện mở hay null), goi: [gói của mùa] }]. */
  function dsMua() { dsGoi(); return cacheMua; }
  function muaTheoMa(ma) { var ds = dsMua(); for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i]; return null; }
  /** Tổng sao người chơi lấy được trong các gói của mùa maMua. */
  function saoMua(maMua, luu) { var m = muaTheoMa(maMua); return m ? m.goi.reduce(function (s, g) { return s + saoGoi(g, luu); }, 0) : 0; }
  /** Mùa đã mở chưa: không khai điều kiện thì mở; đã mở một lần (cờ 'mua-mo:<mã>') thì mở mãi. */
  function muaMo(mua, luu, moHet) {
    if (!mua) return false;
    if (moHet || !mua.mo || daXem(luu, 'mua-mo:' + mua.ma)) return true;
    var c = mua.mo, ok = true;
    if (typeof c.sao === 'number') ok = ok && saoMua(c.mua || muaKhai()[0].ma, luu) >= c.sao;
    if (c.goi) { var g = goiTheoMa(c.goi); ok = ok && !!g && g.man.length > 0 && soQua(g, luu) === g.man.length; }
    return ok;
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
  /** Gói mở: mùa của nó mở và đủ sao trong mùa — hoặc đã từng mở (cờ 'goi-mo:<mã>', không bao giờ khóa lại). */
  function goiMo(g, luu, moHet) {
    if (!g || g.sapCo) return false;
    if (moHet || daXem(luu, 'goi-mo:' + g.ma)) return true;
    return muaMo(muaTheoMa(g.mua), luu) && saoMua(g.mua, luu) >= g.saoCan;
  }

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

  /** Màn đầu tiên tạo ra từng hàm (theo taoHam): { tên: màn }. */
  var noiTaoCache = null, noiTaoKhoa = -1;
  function noiTaoHam() {
    var ds = MH().danhSach;
    if (noiTaoCache && noiTaoKhoa === ds.length) return noiTaoCache;
    var kq = {};
    ds.forEach(function (x) { (x.taoHam || []).forEach(function (t) { if (!kq[t]) kq[t] = x; }); });
    noiTaoCache = kq; noiTaoKhoa = ds.length;
    return kq;
  }

  function trangThai(m, luu, moHet) {
    if (moHet) return { mo: true };
    var n = m.chuong, g = goiCua(n);
    if (g && !goiMo(g, luu)) {
      var mu = muaTheoMa(g.mua);
      if (!muaMo(mu, luu)) return { mo: false, lyDo: 'mua', mua: g.mua, dieuKien: mu && mu.mo, goi: g.ma };
      return { mo: false, lyDo: 'sao', can: g.saoCan, co: saoMua(g.mua, luu), goi: g.ma };
    }
    var vt = g ? g.chuong.indexOf(n) : -1;
    if (vt > 0) {
      var cTruoc = g.chuong[vt - 1], tr = trumCua(cTruoc);
      if (tr && !qua(luu, tr.ma)) return { mo: false, lyDo: 'chuoi', chuong: cTruoc, chuoi: (TT().thuTu || []).indexOf(cTruoc) + 1 };
    }
    var can = canHam(n);
    for (var i = 0; i < can.length; i++) {
      if (!qua(luu, can[i].man.ma)) return { mo: false, lyDo: 'can-ham', ham: can[i].ham, canChuong: can[i].man.chuong, canMan: can[i].man.ma };
    }
    // kho của em thiếu hàm mà màn cần (vd đã qua màn tạo hàm từ bản cũ, lúc máy chấm chưa bắt tạo): khóa, chỉ về màn tạo hàm đó (luu.coHam: game/luu.js)
    if (luu && luu.coHam) {
      var nt = noiTaoHam(), dsCan = m.hamCuaEmCan || [];
      for (var j = 0; j < dsCan.length; j++) {
        var tao = nt[dsCan[j]];
        if (tao && tao !== m && qua(luu, tao.ma) && !luu.coHam(dsCan[j])) return { mo: false, lyDo: 'mat-ham', ham: dsCan[j], canChuong: tao.chuong, canMan: tao.ma };
      }
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
    dsMua: dsMua, muaTheoMa: muaTheoMa, saoMua: saoMua, muaMo: muaMo,
    canHam: canHam, trangThai: trangThai, manTiepTheo: manTiepTheo, trumCua: trumCua
  };
  goc.MoGoi = MoGoi;
  if (typeof module !== 'undefined' && module.exports) module.exports = MoGoi;
})(typeof window !== 'undefined' ? window : globalThis);
