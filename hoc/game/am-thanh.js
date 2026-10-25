/* ============================================================================
   am-thanh.js — "Học lập trình": ÂM THANH (window.AmThanh). Không có tệp âm thanh: mọi tiếng kêu và nhạc nền
   tổng hợp bằng WebAudio (sóng vuông / tam giác / nhiễu, kiểu máy chơi game 8-bit).
     AmThanh.phat('thang')      phát một hiệu ứng (bảng HIEU_UNG ở dưới)
     AmThanh.lenh('grab')       tiếng của một lệnh robot vừa chạy (bảng LENH); lệnh bánh không kêu, nhịp kêu 'buoc'
     AmThanh.sao(i)             tiếng ngôi sao thứ i (0, 1, 2) trên bảng thắng
     AmThanh.dat({ hieuUng, nhac })   mức âm lượng 0..4 (0 = tắt), lưu ở Luu (cai-dat.js gọi)
     AmThanh.ganNut(goc)        bấm nút nào trong goc cũng kêu "tách"
   Trình duyệt chỉ cho phát tiếng sau cú chạm đầu tiên: bộ máy âm thanh mở ở cú chạm đó, nhạc nền bắt đầu từ đó.
   Ẩn trang (về màn hình chính, khóa máy) thì dừng hết; hiện lại thì chạy tiếp.
   ========================================================================== */
(function () {
  'use strict';

  var MUC = [0, 0.25, 0.5, 0.75, 1];            // mức 0..4 → hệ số
  var HE_SO_HU = 0.55, HE_SO_NHAC = 0.3;        // nhạc nền nhỏ hơn hiệu ứng
  var cd = window.Luu && Luu.docCaiDat ? Luu.docCaiDat() : { hieuUng: 3, nhac: 2 };

  var ctx = null, kenhHU = null, kenhNhac = null, nhieu = null, daMo = false;

  function moMay() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    kenhHU = ctx.createGain(); kenhHU.connect(ctx.destination);
    kenhNhac = ctx.createGain(); kenhNhac.connect(ctx.destination);
    datAmLuong();
    // 1 giây nhiễu trắng, dùng lại cho tiếng bắn / va chạm
    nhieu = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = nhieu.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function datAmLuong() {
    if (!ctx) return;
    kenhHU.gain.setValueAtTime(MUC[cd.hieuUng] * HE_SO_HU, ctx.currentTime);
    kenhNhac.gain.setValueAtTime(MUC[cd.nhac] * HE_SO_NHAC, ctx.currentTime);
  }

  /** Cú chạm đầu tiên: mở bộ máy âm thanh (trình duyệt chặn tiếng trước đó), bắt đầu nhạc nền. */
  function moKhoa() {
    if (daMo) return;
    if (!moMay()) return;
    daMo = true;
    if (ctx.state === 'suspended') ctx.resume();
    nhacChay();
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (su) { document.addEventListener(su, moKhoa, true); });
  document.addEventListener('visibilitychange', function () {
    if (!ctx || !daMo) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  /* ------------------------------------------------------------- nốt và nhiễu */
  /** Một nốt: tần số f (Hz), bắt đầu t0 (giây, đồng hồ ctx), dài dai; o.song kiểu sóng, o.am độ to, o.den trượt tới tần số này, o.kenh kênh ra. */
  function not(f, t0, dai, o) {
    o = o || {};
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.song || 'square';
    osc.frequency.setValueAtTime(f, t0);
    if (o.den) osc.frequency.exponentialRampToValueAtTime(o.den, t0 + dai);
    var am = o.am === undefined ? 0.2 : o.am;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(am, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dai);
    osc.connect(g); g.connect(o.kenh || kenhHU);
    osc.start(t0); osc.stop(t0 + dai + 0.03);
  }
  /** Một tràng nhiễu qua bộ lọc (loc: 'lowpass' / 'highpass' / 'bandpass', tan: tần số cắt). */
  function on(t0, dai, am, loc, tan) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = nhieu; f.type = loc; f.frequency.setValueAtTime(tan, t0);
    g.gain.setValueAtTime(am, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dai);
    s.connect(f); f.connect(g); g.connect(kenhHU);
    s.start(t0); s.stop(t0 + dai + 0.03);
  }
  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function arp(ds, t0, buoc, dai, o) { ds.forEach(function (m, i) { not(hz(m), t0 + i * buoc, i === ds.length - 1 ? dai * 2.5 : dai, o); }); }

  /* ------------------------------------------------------------- hiệu ứng */
  var HIEU_UNG = {
    bam: function (t) { not(1250, t, 0.035, { am: 0.09 }); },
    buoc: function (t) { not(120, t, 0.06, { song: 'triangle', am: 0.35, den: 75 }); },
    kep: function (t) { not(520, t, 0.05, { am: 0.14 }); not(780, t + 0.05, 0.07, { am: 0.14 }); },
    tha: function (t) { not(780, t, 0.05, { am: 0.14 }); not(440, t + 0.05, 0.08, { am: 0.14 }); },
    nap: function (t) { not(330, t, 0.04, { am: 0.12 }); not(330, t + 0.07, 0.04, { am: 0.12 }); },
    ban: function (t) { on(t, 0.12, 0.3, 'highpass', 1800); not(900, t, 0.14, { song: 'sawtooth', am: 0.1, den: 180 }); },
    nem: function (t) { not(180, t, 0.28, { song: 'triangle', am: 0.3, den: 900 }); on(t, 0.22, 0.12, 'bandpass', 1200); },
    tu: function (t) { not(220, t, 0.2, { song: 'sine', am: 0.3, den: 340 }); not(223, t, 0.2, { song: 'sine', am: 0.2, den: 345 }); },
    quet: function (t) { not(1760, t, 0.07, { song: 'sine', am: 0.16 }); not(2350, t + 0.06, 0.06, { song: 'sine', am: 0.1 }); },
    dam: function (t) { on(t, 0.2, 0.45, 'lowpass', 500); not(95, t, 0.16, { am: 0.22, den: 50 }); },
    thang: function (t) { arp([72, 76, 79, 84], t, 0.09, 0.1, { am: 0.16 }); not(hz(48), t, 0.5, { song: 'triangle', am: 0.35 }); },
    hong: function (t) { not(hz(67), t, 0.14, { am: 0.14 }); not(hz(63), t + 0.16, 0.32, { am: 0.14, den: hz(60) }); },
    loi: function (t) { not(150, t, 0.12, { am: 0.12, den: 120 }); },
    moKhoa: function (t) { arp([79, 83, 86, 91], t, 0.07, 0.09, { am: 0.14 }); arp([91, 95], t + 0.32, 0.05, 0.08, { song: 'triangle', am: 0.2 }); },
    lat: function (t) { not(660, t, 0.04, { song: 'triangle', am: 0.25, den: 990 }); }
  };
  var CACH_MS = { buoc: 70, bam: 40 };             // cùng một tiếng gần nhau quá thì bỏ (phát lại nhanh)
  var lanCuoi = {};

  function phat(ten) {
    if (!daMo || !ctx || !cd.hieuUng || !HIEU_UNG[ten] || document.hidden) return;
    var bay = performance.now();
    if (bay - (lanCuoi[ten] || 0) < (CACH_MS[ten] || 30)) return;
    lanCuoi[ten] = bay;
    try { HIEU_UNG[ten](ctx.currentTime + 0.01); } catch (e) { /* bỏ qua */ }
  }
  /** Ngôi sao thứ i trên bảng thắng: mỗi sao cao hơn một chút. */
  function sao(i) {
    if (!daMo || !ctx || !cd.hieuUng) return;
    var t = ctx.currentTime + 0.01, f = hz([81, 85, 88][i] || 88);
    not(f, t, 0.2, { am: 0.14 }); not(f * 2, t + 0.04, 0.16, { song: 'triangle', am: 0.12 });
  }

  /** Lệnh robot → tiếng. Lệnh bánh / bay không có ở đây (nhịp đã kêu 'buoc'). */
  var LENH = [
    [/^grab$/, 'kep'], [/^(release|magnet_off)$/, 'tha'], [/^shoot/, 'ban'], [/^throw$/, 'nem'],
    [/^(aim|load)$/, 'nap'], [/^magnet_/, 'tu'], [/^arm_/, 'lat']
  ];
  function lenh(ten) {
    for (var i = 0; i < LENH.length; i++) if (LENH[i][0].test(ten || '')) { phat(LENH[i][1]); return; }
  }

  /* ------------------------------------------------------------- nhạc nền */
  // Hai câu nhạc, mỗi câu 4 nhịp (Đô – La thứ – Fa – Sol), nốt móc đơn; null = lặng. Số là MIDI (72 = Đô 5).
  var GIAI_DIEU = [
    76, null, 79, null, 81, 79, 76, null, 72, null, 76, null, 74, 72, 69, null,
    72, null, 74, 76, 79, null, 76, 74, 74, null, 71, null, 74, null, null, null,
    79, null, 76, 79, 84, null, 81, 79, 76, null, 72, 76, 81, null, 79, 76,
    77, null, 76, 74, 72, null, 74, 76, 74, null, null, null, 71, null, 74, null
  ];
  var GOC_BASS = [48, 45, 41, 43, 48, 45, 41, 43];   // nốt gốc từng ô nhịp
  var BUOC_S = 60 / 104 / 2;                          // 104 phách / phút, móc đơn
  var nhac = { hen: null, buoc: 0, luc: 0 };

  function xepNhac() {
    while (nhac.luc < ctx.currentTime + 0.25) {
      var b = nhac.buoc % GIAI_DIEU.length, t = nhac.luc, o = { kenh: kenhNhac };
      var m = GIAI_DIEU[b];
      if (m) not(hz(m), t, BUOC_S * 1.6, { song: 'square', am: 0.09, kenh: kenhNhac });
      var vt = b % 8, goc = GOC_BASS[Math.floor(b / 8)];
      if (vt % 2 === 0) { o.song = 'triangle'; o.am = 0.32; not(hz(goc + [0, 12, 7, 12][vt / 2]), t, BUOC_S * 1.8, o); }
      nhac.buoc++; nhac.luc += BUOC_S;
    }
  }
  function nhacChay() {
    if (!ctx || !daMo || !cd.nhac || nhac.hen) return;
    nhac.luc = ctx.currentTime + 0.1;
    nhac.hen = setInterval(function () { if (!document.hidden) xepNhac(); else nhac.luc = ctx.currentTime + 0.1; }, 80);
  }
  function nhacDung() { clearInterval(nhac.hen); nhac.hen = null; }

  /* ------------------------------------------------------------- cài đặt */
  function dat(moi) {
    Object.keys(moi || {}).forEach(function (k) { if (k in cd) cd[k] = Math.max(0, Math.min(4, moi[k] | 0)); });
    if (window.Luu && Luu.ghiCaiDat) Luu.ghiCaiDat(cd);
    datAmLuong();
    if (cd.nhac) nhacChay(); else nhacDung();
  }
  function caiDat() { return { hieuUng: cd.hieuUng, nhac: cd.nhac }; }

  /** Bấm nút (button, ô có data-nut, khối lệnh) trong goc: tiếng "tách". */
  function ganNut(goc) {
    goc.addEventListener('click', function (ev) {
      var e = ev.target && ev.target.closest && ev.target.closest('button, [data-nut], .brick');
      if (e && !e.disabled) phat('bam');
    }, true);
  }

  window.AmThanh = { phat: phat, lenh: lenh, sao: sao, dat: dat, caiDat: caiDat, ganNut: ganNut, MUC: MUC.length - 1 };
})();
