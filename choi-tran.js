/* ============================================================================
   choi-tran.js — giao diện game "Đội Robot Chấn Hưng · Trận đấu" (luật v0.4).
   Dùng window.RobotCore (nhân chạy code) · window.TranDau (nhân trận) ·
   window.TranGame (lớp màn chơi). Không phụ thuộc gì khác.
   ========================================================================== */
(function () {
  'use strict';
  var TG = window.TranGame, TD = window.TranDau;
  var $ = function (id) { return document.getElementById(id); };
  var KHOA = 'robot-tran-v4';

  var st = {
    manIdx: 0,
    khe: { tay_gap: 'TAY_DAI', banh_xe: 'OMNI' },
    dangSua: 'R1',
    code: {},                 // manIdx → { R1, R2 }
    xongMan: {},              // manIdx → true
    kq: null,
    khungIdx: 0,
    henGio: null,
    dangChay: false,
    quaHanTruoc: false
  };

  function man() { return TG.MAN[st.manIdx]; }
  function luu() {
    try {
      localStorage.setItem(KHOA, JSON.stringify({
        manIdx: st.manIdx, khe: st.khe, code: st.code, xongMan: st.xongMan
      }));
    } catch (e) { }
  }
  function doc() {
    try {
      var d = JSON.parse(localStorage.getItem(KHOA) || '{}');
      if (d && typeof d === 'object') {
        st.code = d.code || {}; st.xongMan = d.xongMan || {};
        if (d.khe) st.khe = d.khe;
        if (typeof d.manIdx === 'number' && TG.MAN[d.manIdx]) st.manIdx = d.manIdx;
      }
    } catch (e) { }
  }
  function codeMan() {
    if (!st.code[st.manIdx]) st.code[st.manIdx] = { R1: '', R2: '' };
    return st.code[st.manIdx];
  }
  function chon() { return { tayGap: st.khe.tay_gap, banhXe: st.khe.banh_xe }; }

  /* ------------------------------------------------------- lời thoại + chẩn đoán */

  function noi(tinhHuong) {
    var l = TG.loiThoai(tinhHuong, man(), st.kq);
    st.thoai = l;
    var el = $('thoai');
    if (el) {
      el.innerHTML = '<b>' + l.ai + '</b><span>' + l.noi + '</span>';
      el.className = 'thoai ' + (l.lop || '');
    }
  }

  var NGHIA = {
    'pick-hut': 'nhặt hụt — ô đó không có khối',
    'drop-rong': 'thả khối khi tay không có gì',
    'o-da-co-khoi': 'ô đã có khối, không thả được (trạm đang bận)',
    'bi-chan': 'bị chặn — R2 không được vào vùng giữa',
    'locked-command': 'phương án này không có hàm đó',
    'memory-full': 'hết ô nhớ — chương trình dài hơn hạn của đề',
    'qua-tick': 'chạy quá lâu, bị cắt bằng hạn an toàn',
    'runtime-error': 'lỗi khi chạy',
    'syntax-error': 'sai cú pháp',
    'indent-error': 'sai thụt lề',
    'infinite-loop': 'lặp vô tận',
    'timeout': 'hết giờ giữa chừng',
    'unfinished': 'chạy xong mà chưa tới đích',
    'missed-item': 'về đích khi còn khối'
  };
  var maNgan = (c) => c.split('@')[0].split(':').slice(-1)[0];
  var aiNoi = (c) => c.split(':')[0];

  /* ------------------------------------------------------------------- vẽ sân */

  function veSan() {
    var m = man(), khoi = m.san[0].khoi, el = $('san');
    var rong = TG.L.rong, cao = TG.L.cao, co = 38;
    el.style.setProperty('--co', co + 'px');
    el.style.gridTemplateColumns = 'repeat(' + rong + ', ' + co + 'px)';

    var f = null;
    if (st.kq) { var kh = st.kq.san[0].khung; f = kh[Math.min(st.khungIdx, kh.length - 1)]; }
    var conLai = f ? f.conLai : khoi.map(function (k) { return { x: k.x, y: k.y }; });
    var robot = f ? f.robot : {
      'A-R1': { x: TG.L.xuatPhat.A[0].x, y: TG.L.xuatPhat.A[0].y, huong: TG.L.xuatPhat.A[0].huong, cam: false },
      'A-R2': { x: TG.L.xuatPhat.A[1].x, y: TG.L.xuatPhat.A[1].y, huong: TG.L.xuatPhat.A[1].huong, cam: false },
      'B-R1': { x: TG.L.xuatPhat.B[0].x, y: TG.L.xuatPhat.B[0].y, huong: TG.L.xuatPhat.B[0].huong, cam: false },
      'B-R2': { x: TG.L.xuatPhat.B[1].x, y: TG.L.xuatPhat.B[1].y, huong: TG.L.xuatPhat.B[1].huong, cam: false }
    };

    var html = '';
    for (var y = 0; y < cao; y++) {
      for (var x = 0; x < rong; x++) {
        var lop = 'o', trong = '';
        if (x >= TG.L.vungGiua.tu && x <= TG.L.vungGiua.den) lop += ' giua';
        if (x === TG.L.nha.A.x && y === TG.L.nha.A.y) { lop += ' nha'; trong = '<span class="nhan-o">A</span>'; }
        if (x === TG.L.nha.B.x && y === TG.L.nha.B.y) { lop += ' nha'; trong = '<span class="nhan-o">B</span>'; }
        if (x === TG.L.tram.A.x && y === TG.L.tram.A.y) { lop += ' tram'; trong = '<span class="nhan-o">trạm</span>'; }
        if (x === TG.L.tram.B.x && y === TG.L.tram.B.y) { lop += ' tram'; trong = '<span class="nhan-o">trạm</span>'; }
        if (conLai.some(function (k) { return k.x === x && k.y === y; })) lop += ' khoi';
        ['A-R1', 'A-R2', 'B-R1', 'B-R2'].forEach(function (ten) {
          var r = robot[ten];
          if (r && r.x === x && r.y === y) {
            lop = 'o robot ' + (ten[0] === 'A' ? 'rA' : 'rB') + (r.cam ? ' cam' : '');
            var q = { B: 0, D: 90, N: 180, T: 270 }[r.huong];
            trong = '<span style="--q:' + q + 'deg">▲</span><span class="nhan-o">' + ten.slice(2) + '</span>';
          }
        });
        html += '<div class="' + lop + '">' + trong + '</div>';
      }
    }
    el.innerHTML = html;
  }

  function veSo() {
    var f = null;
    if (st.kq) { var kh = st.kq.san[0].khung; f = kh[Math.min(st.khungIdx, kh.length - 1)]; }
    $('diem-a').textContent = f ? f.diem.A : 0;
    $('diem-b').textContent = f ? f.diem.B : 0;
    $('dong-ho').textContent = (f ? f.tick : 0) + ' / ' + man().dongHo;
    $('khoi-con').textContent = f ? f.conLai.length : man().san[0].khoi.length;
    $('tick-hien').textContent = f ? ('tick ' + f.tick) : '';
  }

  /* ------------------------------------------------------- đầu trang + ô code */

  function veChuDe() {
    var m = man();
    $('ten-man').textContent = 'Màn ' + m.so + ' · ' + m.ten;
    $('muc-tieu').textContent = 'Mục tiêu: ' + m.mucTieu;
    $('de-bai').textContent = 'Đề: ' + m.de;
    var chips = $('chips'); chips.innerHTML = '';
    TG.MAN.forEach(function (mm, i) {
      var b = document.createElement('button');
      b.className = 'chip' + (i === st.manIdx ? ' on' : '') + (st.xongMan[mm.so] ? ' xong' : '');
      b.textContent = 'Màn ' + mm.so + (st.xongMan[mm.so] ? ' ✓' : '');
      b.onclick = function () { chonMan(i); };
      chips.appendChild(b);
    });
  }

  var MO_TA = {
    TAY_DAI: { nhan: 'tay gắp dài', them: 'gắp được khối ở ô trước mặt', bo: 'mỗi bước đi tốn 2 tick' },
    CHAN_NHANH: { nhan: 'chân nhanh', them: 'mọi hành động 1 tick', bo: 'MÙ: không có item_here()' },
    OMNI: { nhan: 'bánh omni', them: 'quay tại chỗ 1 tick', bo: 'mỗi bước đi tốn 2 tick' },
    XICH: { nhan: 'bánh xích', them: 'đi thẳng 1 tick', bo: 'mỗi lần quay tốn 2 tick' }
  };
  var TEN_KHE = { tay_gap: 'Khe 1 · tay gắp', banh_xe: 'Khe 2 · bánh xe' };

  function veMotKhe(hopId, khe) {
    var el = $(hopId);
    el.innerHTML = '<div class="nhan">' + TEN_KHE[khe.ten] + ' — chọn một phương án</div>';
    var hang = document.createElement('div');
    hang.className = 'pa';
    khe.phuongAn.forEach(function (ma) {
      var mt = MO_TA[ma], b = document.createElement('button');
      b.className = st.khe[khe.ten] === ma ? 'on' : '';
      b.innerHTML = '<b>' + ma + '</b>' + mt.nhan +
        '<div class="them">＋ ' + mt.them + '</div><div class="bo">－ ' + mt.bo + '</div>';
      b.onclick = function () {
        st.khe[khe.ten] = ma;
        veChonPa(); veKhay(); veONho();
        noi(khe.ten === 'tay_gap' ? (ma === 'TAY_DAI' ? 'chon-tay-gap' : 'chon-chan-nhanh') : 'chon-banh');
        luu();
      };
      hang.appendChild(b);
    });
    el.appendChild(hang);
  }

  function veChonPa() {
    veMotKhe('chon-pa', TG.L.khe[0]);
    var el2 = $('hop-khe2');
    if (man().khe > 1) {
      el2.style.display = '';
      veMotKhe('chon-pa2', TG.L.khe[1]);
    } else {
      el2.style.display = 'none';
      el2.innerHTML = '<div class="nhan">Khe 2 · bánh xe — <b>mở ở màn 4</b>. Ba màn đầu chỉ có một khe.</div>';
      el2.style.display = '';
    }
    $('pa-nghia').textContent = 'Đang chọn: ' + st.khe.tay_gap +
      (man().khe > 1 ? ' + ' + st.khe.banh_xe : '') + '.';
  }

  /* ------------------------------------------------------------ khay thẻ lệnh */

  var THE = [
    { nhan: 'move(1)', doan: 'move(1)' },
    { nhan: 'turn_left()', doan: 'turn_left()' },
    { nhan: 'turn_right()', doan: 'turn_right()' },
    { nhan: 'pick()', doan: 'pick()' },
    { nhan: 'drop()', doan: 'drop()' },
    { nhan: 'wait()', doan: 'wait()' },
    { nhan: 'go_to(x, y)', doan: 'go_to(4, 3)' },
    { nhan: 'quay_ve(h)', doan: 'quay_ve(0)' },
    { nhan: 'if item_here():', doan: 'if item_here():\n    pick()', conTro: 'if item_here():\n    '.length, canCam: true },
    { nhan: 'while not item_here():', doan: 'while not item_here():\n    wait()', conTro: 'while not item_here():\n    '.length, canCam: true },
    { nhan: 'if dang_cam():', doan: 'if dang_cam():\n    drop()', conTro: 'if dang_cam():\n    '.length },
    { nhan: 'for i in range(3):', doan: 'for i in range(3):\n    wait()', conTro: 'for i in range(3):\n    '.length },
    { nhan: 'def chuyen(x, y):', doan: 'def chuyen(x, y):\n    go_to(x, y)\n    pick()\n    go_to(3, 3)\n    drop()' },
    { nhan: 'def + gọi 4 khối', doan: 'def chuyen(x, y):\n    go_to(x, y + 1)\n    quay_ve(0)\n    pick()\n    go_to(3, 3)\n    while item_here():\n        wait()\n    drop()\n\nchuyen(4, 1)\nchuyen(6, 1)\nchuyen(4, 5)\nchuyen(6, 5)', canCam: true }
  ];

  function veKhay() {
    var el = $('khay'), mu = st.khe.tay_gap === 'CHAN_NHANH';
    el.innerHTML = '';
    THE.forEach(function (t) {
      var khoa = mu && t.canCam;
      var b = document.createElement('button');
      b.className = 'the-lenh' + (khoa ? ' khong' : '');
      b.textContent = t.nhan;
      if (khoa) { b.disabled = true; b.title = 'Phương án CHAN_NHANH không có item_here()'; }
      else b.onclick = function () { chen(t.doan, t.conTro); };
      el.appendChild(b);
    });
    $('khay-theo-pa').textContent = mu ? '(chân nhanh: 3 thẻ dùng cảm biến bị khoá)' : '(tay gắp dài: đủ thẻ)';
  }

  /** Chèn đoạn code vào chỗ con trỏ; container thì đặt con trỏ vào trong thân. */
  function chen(doan, conTro) {
    var ta = $('o-code'), s = ta.selectionStart, v = ta.value;
    var truoc = v.slice(0, s), sau = v.slice(ta.selectionEnd);
    if (truoc && !/\n$/.test(truoc)) { doan = '\n' + doan; conTro = (conTro || 0) + 1; }
    var them = doan + (sau && !/^\n/.test(sau) ? '\n' : '');
    ta.value = truoc + them + sau;
    codeMan()[st.dangSua] = ta.value;
    ta.focus();
    var viTri = truoc.length + (conTro === undefined ? them.length : conTro);
    ta.selectionStart = ta.selectionEnd = viTri;
    veONho(); luu();
  }

  /* ------------------------------------------------------------- ô nhớ chương trình */

  function veONho() {
    var c = codeMan(), m = man(), han = m.hanO;
    var o1 = TG.demO(c.R1 || ''), o2 = TG.demO(c.R2 || '');
    var el = $('o-nho');
    if (han === undefined || han === null) {
      el.innerHTML = '<span class="onho">Ô nhớ: R1 <b>' + o1 + '</b> · R2 <b>' + o2 + '</b>' +
        '<i> (màn này không hạn chế)</i></span>';
      st.quaHanTruoc = false;
      return;
    }
    var qua = o1 > han || o2 > han;
    el.innerHTML = '<span class="onho' + (qua ? ' qua' : '') + '">Ô nhớ (hạn ' + han + '): R1 <b>' + o1 +
      '</b> · R2 <b>' + o2 + '</b>' + (qua ? ' — quá hạn, robot sẽ bị chặn khi chạy' : '') + '</span>';
    if (qua && !st.quaHanTruoc) noi('memory-full');
    st.quaHanTruoc = qua;
  }

  /* ----------------------------------------------------------- vẽ ô code + gợi ý */

  function veODangSua() {
    $('o-code').value = codeMan()[st.dangSua] || '';
    $('tab-r1').className = st.dangSua === 'R1' ? 'on' : '';
    $('tab-r2').className = st.dangSua === 'R2' ? 'on' : '';
    $('dang-sua').textContent = st.dangSua === 'R1'
      ? 'R1 — đi vào vùng giữa lấy khối, mang về trạm giao'
      : 'R2 — tới trạm giao, nhặt khối, mang về nhà (chỉ R2 mới tính điểm)';
    veONho();
  }

  function goiY() {
    var m = man(), t = [];
    if (m.hanO) t.push('Màn này hạn ' + m.hanO + ' ô nhớ — dùng thẻ "def + gọi" thay vì copy-paste.');
    if (st.khe.tay_gap === 'TAY_DAI') t.push('Tay gắp dài: đứng cạnh khối rồi quay_ve(0) và gắp ô trước mặt.');
    else t.push('Chân nhanh thì MÙ: R2 phải chờ theo lịch (for k in range(n): wait()).');
    if (m.khe > 1) t.push(st.khe.banh_xe === 'OMNI' ? 'Omni quay nhanh — hợp đường nhiều góc cua.' : 'Xích đi nhanh — hợp đường thẳng, ít phải quay.');
    $('goiy').textContent = 'Gợi ý: ' + t.join(' ');
  }

  /* ------------------------------------------------------------- chạy + phát lại */

  function dung() { if (st.henGio) { clearTimeout(st.henGio); st.henGio = null; } st.dangChay = false; }

  function chay() {
    dung();
    var c = codeMan();
    if (!(c.R1 || '').trim() || !(c.R2 || '').trim()) {
      $('ket-qua').innerHTML = '<div class="ket thua"><b>Chưa chạy được</b><div>Cần cả hai chương trình: R1 và R2.</div></div>';
      noi('chua-viet-code');
      return;
    }
    var kq = TG.chayMan(man(), chon(), { R1: c.R1, R2: c.R2 });
    st.kq = kq; st.khungIdx = 0;
    $('ket-qua').innerHTML = '';
    $('nut-chay').disabled = true;
    st.dangChay = true;

    var kh = kq.san[0].khung, i = 0, tocDo = parseInt($('toc-do').value, 10);
    (function buoc() {
      st.khungIdx = i; veSan(); veSo();
      if (i >= kh.length - 1) { xongChay(); return; }
      i++;
      if (tocDo > 0) st.henGio = setTimeout(buoc, tocDo); else buoc();
    })();
  }

  function xongChay() {
    st.dangChay = false;
    $('nut-chay').disabled = false;
    var kq = st.kq, m = man();

    var lop = kq.thang === 'A' ? 'thang' : (kq.thang === 'B' ? 'thua' : 'hoa');
    var dau = kq.thang === 'A' ? 'THẮNG' : (kq.thang === 'B' ? 'THUA' : 'HOÀ');
    var html = '<div class="ket ' + lop + '"><b>' + dau + '</b> · ' + kq.lyDo +
      '<div>' + kq.san.map(function (s) {
        return s.ten + ': <b>' + s.diemA + '–' + s.diemB + '</b> (' + s.ketThuc + ', ' + s.tick + ' tick)';
      }).join(' · ') + '</div>';
    if (kq.thang === 'A' && !kq.dat) {
      html += '<div>Chưa qua màn: ' + (m.yeuCauKhoi
        ? 'màn này đòi <b>thắng tuyệt đối</b> — phải giao đủ ' + m.san[0].khoi.length + ' khối.'
        : 'cần thắng đội bạn.') + '</div>';
    }
    if (kq.dat) {
      html += '<div>✅ Qua màn ' + m.so + '!</div>';
      st.xongMan[m.so] = true;
      if (st.manIdx < TG.MAN.length - 1) html += '<div>Mở màn kế tiếp ở thanh trên.</div>';
      luu(); veChuDe();
    }
    html += '</div>';

    kq.san[0].xong.forEach(function (r) {
      if (r.loi) {
        html += '<div class="cd do"><span class="ma">' + r.ten + ' · ' + r.loi.loai + '</span><div>' +
          (r.loi.thongDiep || '') + '</div></div>';
      }
      if (r.oNho !== undefined && r.hanO) {
        html += '<div class="cd' + (r.oNho > r.hanO ? ' do' : '') + '"><span class="ma">' + r.ten + ' · ô nhớ ' +
          r.oNho + '/' + r.hanO + '</span></div>';
      }
    });
    var dem = {};
    kq.san.forEach(function (s) { s.chanDoan.forEach(function (c) { dem[c] = (dem[c] || 0) + 1; }); });
    Object.keys(dem).forEach(function (c) {
      var ma = maNgan(c);
      html += '<div class="cd"><span class="ma">' + ma + ' ×' + dem[c] + '</span> · ' + (NGHIA[ma] || ma) +
        '<div class="nhan">' + aiNoi(c) + '</div></div>';
    });
    if (!kq.san[0].chanDoan.length && !kq.san[0].xong.some(function (r) { return r.loi; })) {
      html += '<div class="cd" style="border-color:var(--la);background:#0f1f14"><span class="ma" style="color:var(--la)">sạch</span> · không có lỗi nào trong trận.</div>';
    }
    $('ket-qua').innerHTML = html;
    veSo();
    noi(null);
  }

  /* -------------------------------------------------------------- chuyển màn */

  function chonMan(i) {
    dung();
    st.manIdx = i; st.kq = null; st.khungIdx = 0;
    $('ket-qua').innerHTML = '';
    veChuDe(); veChonPa(); veODangSua(); veKhay(); veSan(); veSo(); goiY(); noi('mo-man'); luu();
  }

  /* ------------------------------------------------------------------ sự kiện */

  $('nut-chay').onclick = chay;
  $('nut-ve-dau').onclick = function () { dung(); if (st.kq) { st.khungIdx = 0; veSan(); veSo(); } };
  $('tab-r1').onclick = function () { st.dangSua = 'R1'; veODangSua(); };
  $('tab-r2').onclick = function () { st.dangSua = 'R2'; veODangSua(); };
  $('o-code').oninput = function () { codeMan()[st.dangSua] = $('o-code').value; veONho(); luu(); };
  $('o-code').onkeydown = function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var t = e.target, s = t.selectionStart;
      t.value = t.value.slice(0, s) + '    ' + t.value.slice(t.selectionEnd);
      t.selectionStart = t.selectionEnd = s + 4;
      codeMan()[st.dangSua] = t.value; luu();
    }
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); chay(); }
  });
  $('nut-mau').onclick = function () {
    var mau = TG.mauChoMan(man(), chon());
    codeMan().R1 = mau.R1; codeMan().R2 = mau.R2;
    veODangSua(); luu();
  };
  $('nut-mau-dai').onclick = function () {
    var mau = TG.mauDaiChoMan(man(), chon());
    codeMan().R1 = mau.R1; codeMan().R2 = mau.R2;
    veODangSua(); luu();
    noi('memory-full');
  };
  $('nut-xoa').onclick = function () { codeMan()[st.dangSua] = ''; veODangSua(); luu(); };
  $('nut-ghichu').onclick = function () { $('ghichu').className = 'mo'; };
  $('dong-ghichu').onclick = function () { $('ghichu').className = ''; };
  $('ghichu').onclick = function (e) { if (e.target === $('ghichu')) $('ghichu').className = ''; };

  /* --------------------------------------------------------------- khởi động */

  doc();
  chonMan(st.manIdx);
})();
