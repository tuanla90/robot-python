/* ============================================================================
   am-thanh.js — "Mật Lệnh Robot": ÂM THANH & NHẠC NỀN 8-BIT (window.AmThanh).
   Không dùng tệp âm thanh ngoài: mọi hiệu ứng, tiếng loa robot và nhạc nền nhiều bè
   đều tổng hợp bằng WebAudio (sóng vuông / tam giác / răng cưa / sine / nhiễu).
     AmThanh.phat('thang')                  phát một hiệu ứng (bảng HIEU_UNG ở dưới)
     AmThanh.lenh('grab')                   tiếng của một lệnh robot vừa chạy (bảng LENH)
     AmThanh.sao(i)                         tiếng ngôi sao thứ i (0, 1, 2) trên bảng thắng
     AmThanh.loa(am, dai, giong)            tiếng LOA robot: am = 1…8 (Đô…Đô cao) hay 'x' (trống); giong = 1 (R1) | 2 (R2 bè)
     AmThanh.phatDoanChienThang(so, tuyChon) phát đoạn nhạc chiến thắng thứ so (1…8) hoặc nối đoạn 1…so (Mùa cuối Về CLB)
     AmThanh.datCheDo(ten)                  đổi chế độ nhạc nền: 'soan' | 'chay' | 'trum' | 'khaiHoan' | 'im'
     AmThanh.dat({ hieuUng, nhac })         mức âm lượng 0..4 (0 = tắt), lưu ở Luu (cai-dat.js gọi)
     AmThanh.ganNut(goc)                    bấm nút nào trong goc cũng kêu "tách"
   ========================================================================== */
(function () {
  'use strict';

  var MUC = [0, 0.25, 0.5, 0.75, 1];            // mức 0..4 → hệ số
  var HE_SO_HU = 0.55, HE_SO_NHAC = 0.32;       // nhạc nền cân bằng với hiệu ứng
  var cd = (typeof window !== 'undefined' && window.Luu && Luu.docCaiDat) ? Luu.docCaiDat() : { hieuUng: 3, nhac: 2 };

  var ctx = null, kenhHU = null, kenhNhac = null, nhieu = null, daMo = false;

  function moMay() {
    if (ctx) return ctx;
    var AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    kenhHU = ctx.createGain(); kenhHU.connect(ctx.destination);
    kenhNhac = ctx.createGain(); kenhNhac.connect(ctx.destination);
    datAmLuong();
    // 1 giây nhiễu trắng, dùng lại cho bộ gõ / phun nước / va chạm
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
  if (typeof document !== 'undefined') {
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (su) { document.addEventListener(su, moKhoa, true); });
    document.addEventListener('visibilitychange', function () {
      if (!ctx || !daMo) return;
      if (document.hidden) ctx.suspend(); else ctx.resume();
    });
  }

  /* ------------------------------------------------------------- nốt, bộ gõ và nhiễu */
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
  function on(t0, dai, am, loc, tan, kenh) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = nhieu; f.type = loc; f.frequency.setValueAtTime(tan, t0);
    g.gain.setValueAtTime(am, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dai);
    s.connect(f); f.connect(g); g.connect(kenh || kenhHU);
    s.start(t0); s.stop(t0 + dai + 0.03);
  }
  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function arp(ds, t0, buoc, dai, o) {
    ds.forEach(function (m, i) {
      not(hz(m), t0 + i * buoc, i === ds.length - 1 ? dai * 2.5 : dai, o);
    });
  }

  /* ------------------------------------------------------------- hiệu ứng âm thanh */
  var HIEU_UNG = {
    bam: function (t) { not(1250, t, 0.035, { am: 0.09 }); },
    buoc: function (t) { not(130, t, 0.055, { song: 'triangle', am: 0.32, den: 80 }); },
    kep: function (t) { not(520, t, 0.05, { am: 0.14 }); not(780, t + 0.05, 0.07, { am: 0.14 }); },
    tha: function (t) { not(780, t, 0.05, { am: 0.14 }); not(440, t + 0.05, 0.08, { am: 0.14 }); },
    nap: function (t) { not(330, t, 0.04, { am: 0.12 }); not(392, t + 0.06, 0.05, { am: 0.12 }); },
    ban: function (t) { on(t, 0.12, 0.3, 'highpass', 1800); not(900, t, 0.14, { song: 'sawtooth', am: 0.1, den: 180 }); },
    nem: function (t) { not(180, t, 0.28, { song: 'triangle', am: 0.3, den: 900 }); on(t, 0.22, 0.12, 'bandpass', 1200); },
    tu: function (t) { not(220, t, 0.2, { song: 'sine', am: 0.3, den: 340 }); not(223, t, 0.2, { song: 'sine', am: 0.2, den: 345 }); },
    quet: function (t) { not(1760, t, 0.07, { song: 'sine', am: 0.16 }); not(2350, t + 0.06, 0.06, { song: 'sine', am: 0.1 }); },
    dam: function (t) { on(t, 0.2, 0.45, 'lowpass', 500); not(95, t, 0.16, { am: 0.22, den: 50 }); },
    thang: function (t) {
      // Fanfare chiến thắng vui nhộn 2 bè (Đô - Mi - Sol - Đô cao - Sol - Đô cao)
      var giai = [72, 76, 79, 84, 79, 84], be = [60, 64, 67, 72, 67, 76], d = [0, 0.08, 0.16, 0.24, 0.36, 0.45];
      for (var i = 0; i < giai.length; i++) {
        var dai = i === giai.length - 1 ? 0.34 : 0.09;
        not(hz(giai[i]), t + d[i], dai, { song: 'square', am: 0.15 });
        not(hz(be[i]), t + d[i], dai, { song: 'triangle', am: 0.2 });
      }
      not(hz(48), t, 0.22, { song: 'triangle', am: 0.32 });
      not(hz(55), t + 0.24, 0.2, { song: 'triangle', am: 0.3 });
      not(hz(60), t + 0.45, 0.42, { song: 'triangle', am: 0.36 });
    },
    thangTrum: function (t) {
      // Fanfare xuất xưởng / thắng màn Trùm rộn ràng (có trống dồn + kèn đồng 2 bè)
      on(t, 0.05, 0.25, 'bandpass', 1600);
      on(t + 0.06, 0.05, 0.28, 'bandpass', 1800);
      var giai = [72, 76, 79, 84, 81, 84, 86, 84, 88, 91, 96];
      var be   = [64, 67, 72, 76, 72, 76, 77, 76, 79, 84, 88];
      var buoc = [0.12, 0.20, 0.28, 0.36, 0.48, 0.56, 0.66, 0.76, 0.86, 0.96, 1.08];
      for (var i = 0; i < giai.length; i++) {
        var cuoi = i === giai.length - 1, dai = cuoi ? 0.48 : 0.095;
        not(hz(giai[i]), t + buoc[i], dai, { song: 'square', am: 0.16 });
        not(hz(be[i]), t + buoc[i], dai, { song: 'triangle', am: 0.22 });
      }
      not(hz(48), t + 0.12, 0.32, { song: 'triangle', am: 0.35 });
      not(hz(53), t + 0.48, 0.28, { song: 'triangle', am: 0.35 });
      not(hz(55), t + 0.76, 0.30, { song: 'triangle', am: 0.35 });
      not(hz(60), t + 1.08, 0.52, { song: 'triangle', am: 0.4 });
    },
    hong: function (t) { not(hz(67), t, 0.14, { am: 0.14 }); not(hz(63), t + 0.16, 0.32, { am: 0.14, den: hz(60) }); },
    loi: function (t) { not(150, t, 0.12, { am: 0.12, den: 120 }); },
    moKhoa: function (t) { arp([79, 83, 86, 91], t, 0.07, 0.09, { am: 0.14 }); arp([91, 95, 98], t + 0.3, 0.06, 0.1, { song: 'triangle', am: 0.22 }); },
    lat: function (t) { not(660, t, 0.04, { song: 'triangle', am: 0.25, den: 990 }); },
    // Hiệu ứng bổ trợ cho các mùa mới (Cảng sông, Bến sông, Nông trại, Mỏ đá, Hang động, Ngày hội)
    nuoc: function (t) { on(t, 0.16, 0.18, 'bandpass', 750); not(240, t, 0.12, { song: 'sine', am: 0.15, den: 360 }); },
    neo: function (t) { not(190, t, 0.08, { song: 'triangle', am: 0.28, den: 95 }); on(t + 0.05, 0.14, 0.22, 'lowpass', 650); },
    cau: function (t) { not(310, t, 0.06, { song: 'sawtooth', am: 0.12, den: 460 }); not(620, t + 0.06, 0.07, { song: 'triangle', am: 0.18 }); },
    gieoHat: function (t) { not(880, t, 0.045, { song: 'sine', am: 0.16, den: 1320 }); not(1175, t + 0.05, 0.06, { song: 'triangle', am: 0.14 }); },
    daLan: function (t) { on(t, 0.18, 0.28, 'lowpass', 420); not(110, t, 0.15, { song: 'triangle', am: 0.26, den: 70 }); },
    chuongDa: function (t) { not(hz(76), t, 0.55, { song: 'sine', am: 0.22 }); not(hz(88), t, 0.35, { song: 'triangle', am: 0.1 }); },
    phaoHoa: function (t) { not(260, t, 0.18, { song: 'sine', am: 0.16, den: 1200 }); on(t + 0.18, 0.28, 0.32, 'highpass', 1500); arp([84, 88, 91, 96], t + 0.2, 0.05, 0.08, { song: 'triangle', am: 0.16 }); }
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
  /** Ngôi sao thứ i trên bảng thắng: mỗi sao cao hơn một chút; sao thứ 3 ngân hợp âm lấp lánh. */
  function sao(i) {
    if (!daMo || !ctx || !cd.hieuUng) return;
    var t = ctx.currentTime + 0.01, f = hz([81, 85, 88][i] || 88);
    not(f, t, 0.2, { am: 0.14 }); not(f * 2, t + 0.04, 0.18, { song: 'triangle', am: 0.13 });
    if (i === 2) not(hz(93), t + 0.08, 0.24, { song: 'sine', am: 0.12 });
  }

  /** LOA robot (Mùa Hang động & Mùa cuối Về CLB): nốt 1…8 = Đô Rê Mi Fa Son La Si Đô cao (MIDI 60…72), 'x' = trống.
   *  giong = 1 (mặc định, R1 của Sola: sóng vuông + bồi âm tam giác) hoặc 2 (R2 của Luna: sóng tam giác + sine ấm để hòa âm song ca). */
  var NOT_LOA = [null, 60, 62, 64, 65, 67, 69, 71, 72];
  function loa(am, dai, giong) {
    if (!daMo || !ctx || !cd.hieuUng || document.hidden) return;
    var t = ctx.currentTime + 0.01;
    try {
      if (am === 'x') { on(t, 0.14, 0.5, 'lowpass', 900); not(110, t, 0.12, { song: 'sine', am: 0.4, den: 55 }); return; }
      if (!NOT_LOA[am]) return;
      dai = dai || 0.32;
      var f = hz(NOT_LOA[am]);
      if (giong === 2) {
        not(f, t, dai, { song: 'triangle', am: 0.2 }); not(f * 1.5, t, dai * 0.5, { song: 'sine', am: 0.05 });
      } else {
        not(f, t, dai, { song: 'square', am: 0.13 }); not(f * 2, t, dai * 0.6, { song: 'triangle', am: 0.07 });
      }
    } catch (e) { /* bỏ qua */ }
  }

  /** Lệnh robot → tiếng. Lệnh bánh / bay không có ở đây (nhịp đã kêu 'buoc'). */
  var LENH = [
    [/^grab$/, 'kep'], [/^(release|magnet_off|untether)$/, 'tha'], [/^spray/, 'ban'], [/^throw$/, 'nem'],
    [/^(aim|load|dot|pen_)$/, 'nap'], [/^magnet_/, 'tu'], [/^arm_/, 'lat'],
    [/^(tow|tether)$/, 'nuoc'], [/^anchor$/, 'neo'], [/^(hoist|drop)$/, 'cau']
  ];
  function lenh(ten) {
    for (var i = 0; i < LENH.length; i++) if (LENH[i][0].test(ten || '')) { phat(LENH[i][1]); return; }
  }

  /* ------------------------------------------------------------- 9 ĐOẠN NHẠC CHIẾN THẮNG (MÙA CUỐI VỀ CLB) */
  // Mỗi gói giải cứu (Gói 1..9) ở Mùa cuối (Về CLB) hoàn thành màn 10 sẽ mở khóa 1 đoạn song ca 8 nhịp (R1 giai điệu + R2 bè hòa âm + trống).
  // Gói 10 (Ngày hội) nối toàn bộ 9 đoạn thành "Khúc Khải Hoàn CLB Mật Lệnh Robot" (72 phách nhạc).
  var DOAN_CHIEN_THANG = [
    // Đoạn 1 (Kho hàng): Khởi hành vững chãi (Đô trưởng)
    { ten: 'kho-hang',    r1: [1, 3, 5, 5, 6, 5, 3, 1], r2: [1, 1, 3, 3, 4, 3, 1, 1], trong: 'x . x . x . x x' },
    // Đoạn 2 (Nhà máy): Nhịp máy hơi nước rộn ràng (Sol trưởng / Rê thứ)
    { ten: 'nha-may',     r1: [2, 4, 5, 6, 5, 4, 3, 2], r2: [1, 2, 3, 4, 3, 2, 1, 5], trong: 'x . x x x . x .' },
    // Đoạn 3 (Bãi tái chế): Bước nhảy đệm từ (Mi / Đô trưởng)
    { ten: 'bai-tai-che', r1: [3, 5, 8, 6, 5, 3, 2, 3], r2: [1, 3, 5, 4, 3, 1, 5, 1], trong: 'x x . x x . x .' },
    // Đoạn 4 (Cảng sông): Còi tàu rẽ sóng ra khơi (Fa trưởng → Sol trưởng)
    { ten: 'cang-song',   r1: [1, 4, 6, 6, 5, 4, 2, 5], r2: [1, 2, 4, 4, 3, 2, 5, 3], trong: 'x . x x . x x .' },
    // Đoạn 5 (Bến sông): Lướt sóng vượt sông (Fa trưởng → Sol trưởng)
    { ten: 'ben-song',    r1: [4, 6, 8, 7, 6, 5, 3, 5], r2: [2, 4, 6, 5, 4, 3, 1, 3], trong: 'x . . x x . x .' },
    // Đoạn 6 (Nông trại hoa): Trăm hoa đua nở (Đô trưởng → La thứ)
    { ten: 'nong-trai',   r1: [5, 6, 5, 3, 4, 5, 3, 1], r2: [3, 4, 3, 1, 2, 3, 1, 6], trong: 'x . x . x x . x' },
    // Đoạn 7 (Mỏ đá): Vượt dốc núi cao (Rê thứ → Sol trưởng)
    { ten: 'mo-da',       r1: [2, 3, 4, 6, 5, 6, 7, 5], r2: [5, 1, 2, 4, 3, 4, 5, 3], trong: 'x x x . x x x .' },
    // Đoạn 8 (Hang động đá vôi): Chuông đá ngân vang (Đô cao cộng hưởng)
    { ten: 'hang-dong',   r1: [8, 7, 6, 5, 6, 7, 8, 5], r2: [5, 5, 4, 3, 4, 5, 6, 3], trong: 'x . . . x . x .' },
    // Đoạn 9 (Về lại CLB): Khúc Khải Hoàn Ngày Hội Robot (Kết Đô cao rực rỡ)
    { ten: 'ngay-hoi',    r1: [6, 7, 8, 5, 6, 4, 5, 8], r2: [4, 5, 6, 3, 4, 2, 3, 5], trong: 'x x x x x . x x' }
  ];

  /** Phát một đoạn nhạc chiến thắng (soDoan = 1…9) hoặc nối từ đoạn 1 tới soDoan (tuyChon.noi = true).
   *  Trả về tổng thời lượng phát (ms) để giao diện/phim đồng bộ hoạt cảnh. */
  function phatDoanChienThang(soDoan, tuyChon) {
    tuyChon = tuyChon || {};
    var ds = [];
    var idx = Math.max(1, Math.min(DOAN_CHIEN_THANG.length, soDoan | 0));
    if (tuyChon.noi) {
      for (var k = 0; k < idx; k++) ds.push(DOAN_CHIEN_THANG[k]);
    } else {
      ds.push(DOAN_CHIEN_THANG[idx - 1]);
    }
    var buocS = (tuyChon.msNhip || 280) / 1000;
    var tongNhip = ds.length * 8;
    if (!daMo || !ctx || !cd.hieuUng || document.hidden) return Math.round(tongNhip * buocS * 1000);
    var t0 = ctx.currentTime + 0.03, nhip = 0;
    ds.forEach(function (d) {
      var tr = d.trong.split(' ');
      for (var i = 0; i < 8; i++) {
        var t = t0 + nhip * buocS, laCuoi = (nhip === tongNhip - 1);
        var dai = laCuoi ? buocS * 2.2 : buocS * 0.88;
        var n1 = NOT_LOA[d.r1[i]], n2 = NOT_LOA[d.r2[i]];
        if (n1) not(hz(n1 + 12), t, dai, { song: 'square', am: 0.13 });
        if (n2) not(hz(n2), t, dai, { song: 'triangle', am: 0.18 });
        if (tr[i] === 'x') {
          not(115, t, 0.07, { song: 'sine', am: 0.28, den: 48 });
          on(t, 0.05, 0.14, 'highpass', 3200);
        }
        nhip++;
      }
    });
    return Math.round(tongNhip * buocS * 1000);
  }

  /* ------------------------------------------------------------- nhạc nền nhiều bè (5 chế độ) */
  // 1) 'soan' (104 BPM — Xưởng chế tạo): nhịp nảy vui tươi, giai điệu + bè phụ sóng tam giác lấp lánh, bass pizzicato.
  // 2) 'chay' (120 BPM — Robot hành động): hành khúc 8-bit sôi nổi (128 bước, 2 đoạn A-B), giai điệu + bè hòa âm + Kick/Snare/Hi-hat.
  // 3) 'trum' (136 BPM — Màn Trùm kịch tính): 128 bước anh hùng (La thứ – Fa – Rê thứ – Mi), bass chạy nốt móc + bộ trống dồn.
  // 4) 'khaiHoan' (128 BPM — Lễ hội Chiến thắng Mùa cuối): phát nối 8 đoạn Khúc Khải Hoàn CLB Robot với đầy đủ 2 bè + bass + trống lễ hội.
  // 5) 'im' (Màn có loa đang chạy / nghe đề): tạm tắt nhạc nền để nghe rõ tiếng loa của robot.

  var SOAN_DIEU = [
    // Đoạn A (64 bước): Tươi sáng, nảy nhẹ trong xưởng
    72, null, 76, null, 79, null, 76, 79,  84, null, 79, null, 76, null, 72, null,
    69, null, 72, null, 76, null, 72, 76,  81, null, 76, null, 72, null, 69, null,
    65, null, 69, null, 72, null, 77, null, 76, null, 72, null, 69, null, 72, null,
    67, null, 71, null, 74, null, 79, null, 74, null, 71, 74,  72, null, null, null,
    // Đoạn B (64 bước): Chuyển câu linh hoạt, gợi mở sáng tạo
    76, null, 79, 81,  79, null, 76, null, 74, null, 77, 79,  77, null, 74, null,
    72, null, 76, 79,  84, null, 81, 79,  76, null, 72, null, 69, null, 72, null,
    77, null, 81, null, 84, null, 81, 77,  76, null, 79, null, 84, null, 79, 76,
    74, null, 77, 76,  74, null, 71, 74,  72, null, 76, 79,  84, null, null, null
  ];
  var SOAN_BE = [
    null, null, 64, null, 67, null, 64, null, 72, null, 67, null, 64, null, 60, null,
    null, null, 60, null, 64, null, 60, null, 69, null, 64, null, 60, null, 57, null,
    null, null, 57, null, 60, null, 65, null, 64, null, 60, null, 57, null, 60, null,
    null, null, 59, null, 62, null, 67, null, 62, null, 59, null, 60, null, null, null,
    null, null, 67, null, 67, null, 64, null, null, null, 65, null, 65, null, 62, null,
    null, null, 64, null, 72, null, 69, null, 64, null, 60, null, 57, null, 60, null,
    null, null, 69, null, 72, null, 69, null, 64, null, 67, null, 72, null, 67, null,
    null, null, 65, null, 62, null, 59, null, 60, null, 64, 67,  72, null, null, null
  ];

  var GIAI_DIEU = [
    // Đoạn A (64 bước): Hành khúc Sola & Luna lên đường
    76, null, 79, 76,  81, 79, 76, null, 72, 74, 76, 79,  74, 72, 69, null,
    72, null, 74, 76,  79, 81, 79, 76,  74, null, 71, 74,  79, null, 74, null,
    79, null, 76, 79,  84, 81, 79, 76,  72, 76, 79, 84,  81, 79, 76, null,
    77, 76, 74, 72,   76, 79, 84, 79,  74, 76, 77, 79,  72, null, null, null,
    // Đoạn B (64 bước): Điệp khúc đối đáp sôi nổi
    84, null, 81, 79,  76, 79, 84, null, 81, null, 79, 76,  72, 76, 81, null,
    77, null, 79, 81,  84, 81, 79, 77,  79, null, 74, 76,  79, 81, 79, null,
    84, 84, 81, 79,   76, 79, 84, 86,  88, null, 84, 81,  79, 76, 72, null,
    77, 79, 81, 84,   79, 76, 72, 76,  74, 71, 74, 79,  84, null, 72, null
  ];
  var GIAI_DIEU_BE = [
    64, null, 67, null, 69, 67, 64, null, 60, null, 64, 67,  62, 60, 57, null,
    60, null, 62, 64,  67, 69, 67, 64,  62, null, 59, 62,  67, null, 62, null,
    67, null, 64, 67,  72, 69, 67, 64,  60, 64, 67, 72,  69, 67, 64, null,
    65, 64, 62, 60,   64, 67, 72, 67,  62, 64, 65, 67,  60, null, null, null,
    72, null, 69, 67,  64, 67, 72, null, 69, null, 67, 64,  60, 64, 69, null,
    65, null, 67, 69,  72, 69, 67, 65,  67, null, 62, 64,  67, 69, 67, null,
    72, 72, 69, 67,   64, 67, 72, 74,  76, null, 72, 69,  67, 64, 60, null,
    65, 67, 69, 72,   67, 64, 60, 64,  62, 59, 62, 67,  72, null, 60, null
  ];

  var GIAI_DIEU_TRUM = [
    // Đoạn A (64 bước): Kịch tính, dồn dập
    69, 72, 76, 69,  81, null, 79, 76,  77, 76, 74, 72,  74, 76, 77, null,
    69, 72, 76, 81,  84, null, 81, 79,  76, 74, 72, 74,  76, null, 64, null,
    81, null, 84, 81, 79, 76, 79, 81,  77, null, 81, 77,  76, 72, 76, 79,
    74, 76, 77, 81,  79, 76, 72, 69,  71, 74, 76, 80,  81, null, 69, null,
    // Đoạn B (64 bước): Cao trào giải cứu hiện trường
    84, 81, 76, 81,  86, 84, 81, 79,  77, 79, 81, 84,  79, 76, 72, null,
    81, 79, 76, 79,  84, 81, 79, 76,  74, 76, 77, 79,  76, null, 80, null,
    81, 84, 88, 84,  83, 79, 76, 79,  77, 81, 84, 81,  79, 76, 72, 76,
    74, 77, 81, 77,  76, 72, 69, 72,  71, 76, 80, 83,  81, null, null, null
  ];
  var GIAI_DIEU_TRUM_BE = [
    57, null, 64, null, 69, null, 67, 64,  65, 64, 62, 60,  62, 64, 65, null,
    57, null, 64, 69,  72, null, 69, 67,  64, 62, 60, 62,  64, null, 52, null,
    69, null, 72, 69,  67, 64, 67, 69,  65, null, 69, 65,  64, 60, 64, 67,
    62, 64, 65, 69,  67, 64, 60, 57,  59, 62, 64, 68,  69, null, 57, null,
    72, 69, 64, 69,  74, 72, 69, 67,  65, 67, 69, 72,  67, 64, 60, null,
    69, 67, 64, 67,  72, 69, 67, 64,  62, 64, 65, 67,  64, null, 68, null,
    69, 72, 76, 72,  71, 67, 64, 67,  65, 69, 72, 69,  67, 64, 60, 64,
    62, 65, 69, 65,  64, 60, 57, 60,  59, 64, 68, 71,  69, null, null, null
  ];

  // Xây dựng bản nhạc 144 bước cho chế độ 'khaiHoan' từ 9 đoạn DOAN_CHIEN_THANG
  var KHAI_HOAN_DIEU = [], KHAI_HOAN_BE = [];
  DOAN_CHIEN_THANG.forEach(function (d) {
    for (var i = 0; i < 8; i++) {
      var m1 = NOT_LOA[d.r1[i]], m2 = NOT_LOA[d.r2[i]];
      KHAI_HOAN_DIEU.push(m1 ? m1 + 12 : null, null);
      KHAI_HOAN_BE.push(m2 || null, m2 ? m2 + 12 : null);
    }
  });

  var GOC_BASS = [
    48, 45, 41, 43, 48, 45, 41, 43,
    48, 43, 45, 40, 41, 48, 43, 48
  ];
  var GOC_BASS_TRUM = [
    45, 41, 38, 40, 45, 48, 38, 40,
    45, 43, 41, 40, 38, 45, 40, 45
  ];
  var GOC_BASS_KHAI_HOAN = [
    48, 48, 43, 45, 48, 40, 41, 43,
    41, 43, 48, 45, 38, 43, 48, 43, 41, 48
  ];

  var CHE_DO_NHAC = {
    soan: { buocS: 60 / 104 / 2, dieu: SOAN_DIEU, be: SOAN_BE, bass: GOC_BASS, songDieu: 'triangle', amDieu: 0.08, amBe: 0.045, amBass: 0.24, trong: 'nhe' },
    chay: { buocS: 60 / 120 / 2, dieu: GIAI_DIEU, be: GIAI_DIEU_BE, bass: GOC_BASS, songDieu: 'square', amDieu: 0.088, amBe: 0.09, amBass: 0.30, trong: 'vui' },
    trum: { buocS: 60 / 136 / 2, dieu: GIAI_DIEU_TRUM, be: GIAI_DIEU_TRUM_BE, bass: GOC_BASS_TRUM, songDieu: 'square', amDieu: 0.10, amBe: 0.10, amBass: 0.34, trong: 'manh' },
    khaiHoan: { buocS: 60 / 128 / 2, dieu: KHAI_HOAN_DIEU, be: KHAI_HOAN_BE, bass: GOC_BASS_KHAI_HOAN, songDieu: 'square', amDieu: 0.10, amBe: 0.12, amBass: 0.34, trong: 'leHoi' },
    im: { buocS: 60 / 96 / 2, im: true }
  };
  var nhac = { hen: null, buoc: 0, luc: 0, cheDo: 'soan' };

  /** Bộ trống trên kênh nhạc nền: Kick, Snare và Hi-hat 8-bit. */
  function trongKickNhac(t0, am) {
    not(125, t0, 0.075, { song: 'sine', am: am, den: 44, kenh: kenhNhac });
  }
  function trongSnareNhac(t0, am) {
    on(t0, 0.055, am, 'bandpass', 1800, kenhNhac);
    not(180, t0, 0.04, { song: 'triangle', am: am * 0.7, den: 95, kenh: kenhNhac });
  }
  function hiHatNhac(t0, am, dai) {
    on(t0, dai || 0.026, am, 'highpass', 5400, kenhNhac);
  }

  function xepNhac() {
    var cfg = CHE_DO_NHAC[nhac.cheDo] || CHE_DO_NHAC.soan, bs = cfg.buocS;
    if (cfg.im) { nhac.luc = ctx.currentTime + 0.25; return; }
    while (nhac.luc < ctx.currentTime + 0.25) {
      var b = nhac.buoc % cfg.dieu.length, t = nhac.luc;
      // 1. Giai điệu chính
      var m = cfg.dieu[b];
      if (m) not(hz(m), t, bs * 1.5, { song: cfg.songDieu, am: cfg.amDieu, kenh: kenhNhac });
      // 2. Bè hòa âm / đối âm
      var mb = cfg.be && cfg.be[b];
      if (mb) not(hz(mb), t, bs * 1.35, { song: 'triangle', am: cfg.amBe || 0.06, kenh: kenhNhac });
      // 3. Bass nảy theo mẫu từng chế độ
      var vt = b % 8, goc = cfg.bass[Math.floor(b / 8) % cfg.bass.length];
      if (nhac.cheDo === 'trum') {
        var bacTrum = [0, 12, 0, 12, 7, 12, 0, 7][vt];
        not(hz(goc + bacTrum), t, bs * 1.15, { song: 'triangle', am: cfg.amBass * (vt % 2 === 0 ? 1 : 0.68), kenh: kenhNhac });
      } else if (nhac.cheDo === 'chay' || nhac.cheDo === 'khaiHoan') {
        if (vt % 2 === 0) {
          not(hz(goc + [0, 12, 7, 12][vt / 2]), t, bs * 1.6, { song: 'triangle', am: cfg.amBass, kenh: kenhNhac });
        } else if (vt === 7) {
          not(hz(goc + 7), t, bs * 0.9, { song: 'triangle', am: cfg.amBass * 0.65, kenh: kenhNhac });
        }
      } else if (vt % 2 === 0) {
        not(hz(goc + [0, 7, 12, 7][vt / 2]), t, bs * 1.75, { song: 'triangle', am: cfg.amBass, kenh: kenhNhac });
      }
      // 4. Bộ trống 8-bit theo chế độ
      if (cfg.trong === 'nhe') {
        if (vt === 0) trongKickNhac(t, 0.12);
        else if (vt === 3 || vt === 7) hiHatNhac(t, 0.018, 0.022);
      } else if (cfg.trong === 'vui' || cfg.trong === 'leHoi') {
        if (vt === 0 || vt === 5) trongKickNhac(t, 0.20);
        if (vt === 2 || vt === 6) trongSnareNhac(t, 0.055);
        if (vt % 2 === 1) hiHatNhac(t, 0.032, vt === 7 ? 0.045 : 0.025);
      } else if (cfg.trong === 'manh') {
        if (vt === 0 || vt === 3 || vt === 4) trongKickNhac(t, 0.24);
        if (vt === 2 || vt === 6 || (b % 32 === 31)) trongSnareNhac(t, 0.07);
        hiHatNhac(t, vt % 2 === 1 ? 0.042 : 0.02);
      }
      nhac.buoc++; nhac.luc += bs;
    }
  }
  function nhacChay() {
    if (!ctx || !daMo || !cd.nhac || nhac.hen) return;
    nhac.luc = ctx.currentTime + 0.1;
    nhac.hen = setInterval(function () { if (!document.hidden) xepNhac(); else nhac.luc = ctx.currentTime + 0.1; }, 80);
  }
  function nhacDung() { clearInterval(nhac.hen); nhac.hen = null; }
  /** Đổi chế độ nhạc nền: 'soan' (đang xếp lệnh / ngoài màn), 'chay' (robot đang chạy), 'trum' (màn Trùm), 'khaiHoan' (nhạc chiến thắng mùa cuối), 'im' (tắt nhạc nền khi loa hát). */
  function datCheDo(ten) {
    var m = CHE_DO_NHAC[ten] ? ten : 'soan';
    if (nhac.cheDo === m) return;
    nhac.cheDo = m;
    nhac.buoc = 0;
    if (ctx && daMo) nhac.luc = Math.max(nhac.luc, ctx.currentTime + 0.05);
  }
  function cheDo() { return nhac.cheDo; }

  /* ------------------------------------------------------------- cài đặt */
  function dat(moi) {
    if (moi && moi.hieuUng !== undefined) cd.hieuUng = Math.max(0, Math.min(4, moi.hieuUng | 0));
    if (moi && moi.nhac !== undefined) cd.nhac = Math.max(0, Math.min(4, moi.nhac | 0));
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

  var AmThanh = {
    phat: phat, lenh: lenh, sao: sao, loa: loa, NOT_LOA: NOT_LOA,
    DOAN_CHIEN_THANG: DOAN_CHIEN_THANG, phatDoanChienThang: phatDoanChienThang,
    dat: dat, caiDat: caiDat, datCheDo: datCheDo, cheDo: cheDo, CHE_DO_NHAC: CHE_DO_NHAC, ganNut: ganNut, MUC: MUC.length - 1
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = AmThanh;
  if (typeof window !== 'undefined') window.AmThanh = AmThanh;
})();
