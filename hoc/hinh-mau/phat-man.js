/* phat-man.js — công cụ xem (gói V7a): phát lại lời giải của một màn lên MỘT sân riêng phủ trên choi.html, để chụp hình hiệu ứng vector ở một bước bất kỳ.
   Dùng trong console của choi.html?ve=vector (hay nạp bằng thẻ script):
     await phatMan('nut-de.5', { dung: 6, w: 760 })   // phát tới trước sự kiện thứ 6 của vết (bỏ dung = phát hết), sân rộng 760 px, trả các dây nối nút ↔ cửa
     chup()                                            // vẽ lại một khung ngay (ô trình duyệt bị ẩn thì requestAnimationFrame đứng)
   Cấu hình sân dựng như man-choi.js cauHinhSan (một sân, sân đầu). Không đụng trạng thái game. */
(function () {
  window.phatMan = async function (ma, opts) {
    opts = opts || {};
    var m = ManHoc.danhSach.find(function (x) { return x.ma === ma; });
    if (!m) throw new Error('không có màn ' + ma);
    var lg = opts.sai !== undefined ? m.loiSai[opts.sai] : m.loiGiai;
    var r = ChamHoc.cham(m, lg.baiLam || lg, ManHoc.khoThamChieu(m).concat(lg.hamCuaEmMoi || []));
    var ts = r.theoSan && r.theoSan[0], vet = (ts && ts.vet) || r.vet || [];
    var hop = document.getElementById('xem-hop'); if (hop) hop.remove();
    hop = document.createElement('div'); hop.id = 'xem-hop';
    hop.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:9999;background:#eee;display:flex;align-items:center;justify-content:center';
    var tr = document.createElement('div'); tr.className = 'ffr'; tr.style.cssText = 'position:relative;width:auto;height:auto'; hop.appendChild(tr);
    var cv = document.createElement('canvas'); cv.className = 'tex'; tr.appendChild(cv); document.body.appendChild(hop);
    var lm = SanHoc.lopMauCuaSan(m, 0), nhieu = Array.isArray(m.san[0]);
    var F = new SanVe.Field(cv, { kich: opts.w || 560, catMep: true, oToiDa: 200 }); window.F = F;
    F.nap({ san: nhieu ? m.san[0] : m.san, batDau: Array.isArray(m.batDau) && nhieu ? m.batDau[0] : m.batDau, loaiRobot: m.loaiRobot || 'banh', robot: VeRobot.cauHinhCua(m),
      mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vat: lm.vatThem || undefined, roBanDau: Array.isArray(m.roBanDau) ? m.roBanDau[0] : m.roBanDau,
      cuaNhip: lm.cuaNhip || undefined, nutBat: lm.nutBat || undefined, noi: lm.noi || undefined, danToiDa: m.danToiDa,
      pin: Array.isArray(m.pin) ? m.pin[0] : m.pin, hinh: lm.hinh || undefined, sonBanDau: lm.sonBanDau || undefined, mucBanDau: m.mucBanDau });
    window.VET = vet;
    for (var i = 0; i < vet.length; i++) {
      var e = vet[i]; if (opts.dung !== undefined && i >= opts.dung) break;
      if (e.loai === 'lenh') { if (e.docCamBien) F.docCamBien(e.docCamBien, 380); await new Promise(function (ok) { setTimeout(ok, 30); }); }
      else await F.phatNhip(e, opts.ms || 300);
    }
    window.chup();
    return (F.dayNoi || []).map(function (d) { return d.nut.ma + d.nut.x + ',' + d.nut.y + '>' + d.cua.x + ',' + d.cua.y; }).join(' ');
  };
  window.chup = function () { var F = window.F; if (!F) return 0; F.lopKhoa = ''; F.doiCo(); F.draw(performance.now()); return 1; };
})();
