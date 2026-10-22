/* ============================================================================
   san-robot-dot-1.js — UI cho mockup của ĐỢT 1 (+ màn dạy vòng lặp của chặng 2).
   Dùng window.RobotCore (san-robot-core.js). Không phụ thuộc gì khác.

   Hai thứ đáng chú ý trong bản này:
     - KHAY THEO BÀI: khay thẻ lọc theo bai.khay (GDD v0.2 §7.5).
     - THẺ LỒNG ĐƯỢC: thẻ while có THÂN; bấm thẻ để chọn "khe thân" rồi thêm
       thẻ vào trong. Đây là thứ chặng 3–4 cũng cần.
   ========================================================================== */
(function () {
  'use strict';
  var R = window.RobotCore;
  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------- thẻ lệnh */

  var THE = [
    { ma: 'move', nhan: 'move(3)', mo: 'đi 3 bước theo hướng đang quay', thamSo: true,
      code: function (c) { return 'move(' + c.n + ')'; } },
    { ma: 'turn_left', nhan: 'turn_left()', mo: 'quay sang trái tại chỗ',
      code: function () { return 'turn_left()'; } },
    { ma: 'turn_right', nhan: 'turn_right()', mo: 'quay sang phải tại chỗ',
      code: function () { return 'turn_right()'; } },
    { ma: 'pick', nhan: 'pick()', mo: 'nhặt vật ở ô đang đứng',
      code: function () { return 'pick()'; } },
    { ma: 'wait', nhan: 'wait()', mo: 'chờ 1 tick',
      code: function () { return 'wait()'; } },
    { ma: 'while_at_goal', nhan: 'while not at_goal():', khoi: true,
      mo: 'lặp thân bên dưới chừng nào robot CHƯA tới đích',
      code: function () { return 'while not at_goal():'; } }
  ];
  function theTheoMa(ma) {
    for (var i = 0; i < THE.length; i++) if (THE[i].ma === ma) return THE[i];
    return null;
  }

  /* ---------------------------------------------------------- mã chẩn đoán */

  var CD = {
    'hit-wall': { ten: 'húc tường', ai: 'Khánh', noi: 'Nó húc tường rồi. Cậu xem lại chỗ rẽ ấy.' },
    'syntax-error': { ten: 'sai cú pháp', ai: 'thầy Khải', noi: 'Chỗ này viết chưa đúng cú pháp Python.' },
    'indent-error': { ten: 'sai thụt lề', ai: 'thầy Khải', noi: 'Thụt lề chưa khớp. Dòng trong khối phải lùi vào đều nhau.' },
    'unfinished': { ten: 'chưa xong việc', ai: 'Hà Vy', noi: 'Chạy hết code rồi mà robot chưa tới đích, hoặc còn vật chưa nhặt.' },
    'missed-item': { ten: 'về đích khi còn vật', ai: 'Khánh', noi: 'Về đích mà tay không thì không tính điểm.' },
    'timeout': { ten: 'chạy quá lâu', ai: 'Quân', noi: 'Hết giờ rồi.' },
    'infinite-loop': { ten: 'lặp vô tận', ai: 'thầy Khải', noi: 'Vòng lặp này không có đường ra. Máy không tự biết dừng đâu.' },
    'runtime-error': { ten: 'lỗi khi chạy', ai: 'thầy Khải', noi: '' },
    'pick-miss': { ten: 'pick() hụt', ai: 'Khánh', noi: 'Ô đó không có vật nào để nhặt.' },
    'locked-command': { ten: 'lệnh chưa mở', ai: 'Khánh', noi: 'Bài này chưa mở lệnh đó.' }
  };

  var NGHIA_HANG = {
    A: 'Qua cả sân ẩn — code đúng ở chỗ chưa từng thấy.',
    B: 'Qua sân chính sạch sẽ. Còn sân ẩn chưa qua.',
    C: 'Qua sân chính nhưng còn va tường hoặc nhặt hụt.',
    '': 'Chưa qua sân chính.'
  };

  var KHOA_LUU = 'robot-dot1';

  /* ------------------------------------------------------------------ state */

  var st = {
    baiIdx: 0,
    cheDo: 'the',                 // 'the' | 'go'
    the: {},                      // baiId → cây thẻ
    go: {},                       // baiId → code
    daQua: {},                    // baiId → hạng
    goiY: 0,
    ketQua: null,
    henGio: null,
    dangChay: false,
    hienSanAn: false,
    noiThem: []                   // đường dẫn tới khe thân đang chọn ([] = ngoài cùng)
  };

  function bai() { return R.BAI[st.baiIdx]; }

  function luu() {
    try {
      localStorage.setItem(KHOA_LUU, JSON.stringify({
        baiIdx: st.baiIdx, the: st.the, go: st.go, daQua: st.daQua
      }));
    } catch (e) { /* trình duyệt chặn localStorage thì thôi */ }
  }
  function doc() {
    try {
      var d = JSON.parse(localStorage.getItem(KHOA_LUU) || '{}');
      if (d && typeof d === 'object') {
        st.the = d.the || {}; st.go = d.go || {}; st.daQua = d.daQua || {};
        if (typeof d.baiIdx === 'number' && R.BAI[d.baiIdx]) st.baiIdx = d.baiIdx;
      }
    } catch (e) { /* bỏ qua */ }
  }

  /* --------------------------------------------------- mô hình chương trình */

  function theCuaBai() {
    var id = bai().id;
    if (!st.the[id]) st.the[id] = [];
    return st.the[id];
  }
  function taoThe(ma) {
    var t = theTheoMa(ma);
    if (t.khoi) return { ma: ma, than: [] };
    return { ma: ma, n: t.thamSo ? 1 : undefined };
  }
  /** Đường dẫn = mảng chỉ số, ví dụ [0,1] = thẻ thứ 1, con thứ 2 của nó. */
  function ddStr(dd) { return dd.join('.'); }
  function layMang(dd) {
    var arr = theCuaBai();
    for (var i = 0; i < dd.length; i++) {
      var c = arr[dd[i]];
      if (!c || !c.than) return theCuaBai();   // đường dẫn hỏng thì về ngoài cùng
      arr = c.than;
    }
    return arr;
  }
  function layMangCha(dd) { return layMang(dd.slice(0, dd.length - 1)); }

  function codeTuDs(ds, cap) {
    var ra = [];
    ds.forEach(function (c) {
      var t = theTheoMa(c.ma);
      var thut = new Array(cap * 4 + 1).join(' ');
      if (t.khoi) {
        ra.push(thut + t.code(c));
        var than = c.than || [];
        if (!than.length) ra.push(thut + '    pass');     // thân rỗng = pass, đúng Python
        else ra = ra.concat(codeTuDs(than, cap + 1));
      } else {
        ra.push(thut + t.code(c));
      }
    });
    return ra;
  }
  function codeTuThe() { return codeTuDs(theCuaBai(), 0).join('\n'); }
  function demThe(ds) {
    var n = 0;
    ds.forEach(function (c) { n++; if (c.than) n += demThe(c.than); });
    return n;
  }
  function codeHienTai() { return st.cheDo === 'the' ? codeTuThe() : ($('o-code').value || ''); }

  /* ------------------------------------------------------------ vẽ giao diện */

  function veChuDeBai() {
    var b = bai();
    $('ten-bai').textContent = 'Bài ' + b.so + ' · ' + b.ten + (b.chang > 1 ? ' (chặng ' + b.chang + ')' : '');
    $('muc-tieu').textContent = 'Mục tiêu: ' + b.mucTieu;
    $('so-o-nho-dau').textContent = 'Hạn ' + b.gioiHanTick + ' tick';
    if (b.theMoi === 'while') {
      $('the-moi').className = '';
      $('the-moi').innerHTML = '🆕 <b>Thẻ mới: <span class="mono">while not at_goal():</span></b> — ' +
        'thẻ này có <b>thân</b>. Bấm thẻ trên khay để thêm, rồi bấm vào <b>khe thân</b> của nó và thêm ' +
        '<span class="mono">move(1)</span> vào trong. Đọc thành lời: <i>"lặp lại chừng nào robot chưa tới đích"</i>.';
    } else {
      $('the-moi').className = 'an';
    }
    veChips();
  }

  function veChips() {
    var chips = $('chips');
    chips.innerHTML = '';
    R.BAI.forEach(function (bb, i) {
      var n = document.createElement('button');
      n.className = 'chip' + (i === st.baiIdx ? ' on' : '') + (st.daQua[bb.id] ? ' dat' : '');
      n.textContent = (bb.chang > 1 ? 'C' + bb.chang + ' · ' : bb.so + '. ') + bb.ten +
        (st.daQua[bb.id] ? ' · ' + st.daQua[bb.id] : '');
      n.onclick = function () { chonBai(i); };
      chips.appendChild(n);
    });
  }

  function veKhayThe() {
    var k = $('khay'), khay = bai().khay || [];
    k.innerHTML = '';
    THE.forEach(function (t) {
      // LUẬT KHAY: thẻ hàm thì gác theo bai.khay, thẻ KHỐI thì gác theo bai.khoi
      if (t.khoi) {
        if ((bai().khoi || []).indexOf('while') < 0) return;
      } else if (khay.indexOf(t.ma) < 0) return;
      var n = document.createElement('button');
      n.className = 'the-lenh' + (t.khoi ? ' the-khoi' : '');
      n.innerHTML = t.nhan + '<i>' + t.mo + '</i>';
      n.onclick = function () {
        layMang(st.noiThem).push(taoThe(t.ma));
        veChuongTrinh(); luu();
      };
      k.appendChild(n);
    });
  }

  function veChuongTrinh() {
    var ct = $('chuong-trinh'), ds = theCuaBai();
    ct.innerHTML = '';
    if (!ds.length) {
      ct.innerHTML = '<div class="trong">Chưa có dòng nào. Bấm một thẻ ở khay trên để thêm.</div>';
    }
    veMotCap(ds, [], ct);
    capNhatONho();
  }

  function veMotCap(ds, dd, vaoEl) {
    ds.forEach(function (c, i) {
      var t = theTheoMa(c.ma);
      var ddCon = dd.concat(i);

      var d = document.createElement('div');
      d.className = 'dong' + (t.khoi ? ' khoi' : '');
      d.draggable = true;
      d.dataset.dd = ddStr(ddCon);

      var so = document.createElement('span'); so.className = 'so'; so.textContent = (i + 1);
      var nd = document.createElement('span'); nd.className = 'nd';

      if (t.thamSo) {
        nd.appendChild(document.createTextNode('move('));
        var inp = document.createElement('input');
        inp.type = 'number'; inp.min = '0'; inp.max = '99'; inp.value = c.n;
        inp.onchange = function () {
          var v = parseInt(inp.value, 10);
          if (isNaN(v) || v < 0) v = 1;
          if (v > 99) v = 99;
          c.n = v; inp.value = v; luu(); capNhatONho();
        };
        nd.appendChild(inp);
        nd.appendChild(document.createTextNode(')'));
      } else {
        nd.textContent = t.code(c);
      }

      var n2 = document.createElement('span'); n2.className = 'nd2';
      var len = document.createElement('button'); len.textContent = '↑'; len.title = 'lên';
      len.onclick = function (e) { e.stopPropagation(); if (i > 0) { ds.splice(i - 1, 0, ds.splice(i, 1)[0]); veChuongTrinh(); luu(); } };
      var xuong = document.createElement('button'); xuong.textContent = '↓'; xuong.title = 'xuống';
      xuong.onclick = function (e) { e.stopPropagation(); if (i < ds.length - 1) { ds.splice(i + 1, 0, ds.splice(i, 1)[0]); veChuongTrinh(); luu(); } };
      var xoa = document.createElement('button'); xoa.textContent = '✕'; xoa.title = 'xoá';
      xoa.onclick = function (e) { e.stopPropagation(); ds.splice(i, 1); if (ddStr(st.noiThem).indexOf(ddStr(ddCon)) === 0) st.noiThem = []; veChuongTrinh(); luu(); };
      n2.appendChild(len); n2.appendChild(xuong); n2.appendChild(xoa);

      d.appendChild(so); d.appendChild(nd); d.appendChild(n2);

      if (t.khoi) {
        var nutVao = document.createElement('button');
        nutVao.className = 'vao';
        nutVao.textContent = 'thân ▾';
        nutVao.title = 'chọn khe thân để thêm thẻ vào trong';
        nutVao.onclick = function (e) { e.stopPropagation(); st.noiThem = ddCon; veChuongTrinh(); };
        n2.appendChild(nutVao);
        d.onclick = function () { st.noiThem = ddCon; veChuongTrinh(); };
      }

      d.ondragstart = function (e) { e.dataTransfer.setData('text/plain', ddStr(ddCon)); };
      d.ondragover = function (e) { e.preventDefault(); };
      d.ondrop = function (e) {
        e.preventDefault(); e.stopPropagation();
        var tu = e.dataTransfer.getData('text/plain').split('.').map(Number);
        if (tu.length && ddStr(tu) !== ddStr(ddCon)) {
          var chaTu = layMangCha(tu), chaDen = layMangCha(ddCon);
          if (chaTu === chaDen) {
            var x = chaTu.splice(tu[tu.length - 1], 1)[0];
            chaTu.splice(ddCon[ddCon.length - 1], 0, x);
            veChuongTrinh(); luu();
          }
        }
      };

      // Thẻ khối: hàng đầu + thân nằm trong MỘT bọc, để số con của mỗi cấp
      // luôn đúng bằng số thẻ của cấp đó (kéo thả và đếm đều dựa vào đó).
      var boc = document.createElement('div');
      boc.className = 'muc';
      boc.appendChild(d);
      if (t.khoi) {
        var than = document.createElement('div');
        than.className = 'than' + (ddStr(st.noiThem) === ddStr(ddCon) ? ' chon' : '');
        veMotCap(c.than || [], ddCon, than);
        var khe = document.createElement('div');
        khe.className = 'khe';
        khe.textContent = (c.than && c.than.length)
          ? '﹢ thêm vào thân'
          : 'khe thân — bấm để thêm thẻ vào trong';
        khe.onclick = function (e) { e.stopPropagation(); st.noiThem = ddCon; veChuongTrinh(); };
        than.appendChild(khe);
        boc.appendChild(than);
      }
      vaoEl.appendChild(boc);
    });
  }

  function capNhatONho() {
    var n = st.cheDo === 'the' ? demThe(theCuaBai())
      : ($('o-code').value || '').split('\n').filter(function (l) { return l.trim(); }).length;
    $('o-nho').textContent = n;
    $('o-nho2').textContent = n;
    $('o-nho-ghi').textContent = '· hạn ô nhớ mở ở chặng 4';
  }

  /* ---------------------------------------------------------------- vẽ sân */

  function veSan(kq, idx, oNho) {
    var el = oNho || $('san');
    var san = kq.san || (kq.chinh && kq.chinh.san);
    var khung = kq.chinh ? kq.chinh.khung : kq.khung;
    var k = khung[Math.min(idx, khung.length - 1)];

    var rong = san.rong, cao = san.cao;
    var co = oNho ? 20 : Math.max(20, Math.min(46, Math.floor(360 / rong)));
    el.style.setProperty('--co', co + 'px');
    el.style.gridTemplateColumns = 'repeat(' + rong + ', ' + co + 'px)';

    var vet = {};
    for (var f = 0; f <= Math.min(idx, khung.length - 1); f++) vet[khung[f].x + ',' + khung[f].y] = 1;

    var html = '';
    for (var y = 0; y < cao; y++) {
      for (var x = 0; x < rong; x++) {
        var c = san.o[y][x];
        var lop = 'o';
        if (c === '#') lop += ' tuong';
        if (c === 'D') lop += ' di';
        if (vet[x + ',' + y]) lop += ' da-di';
        var trong = '';
        if (c === 'o') {
          var idxVat = -1;
          for (var q = 0; q < san.dsVat.length; q++) {
            if (san.dsVat[q].x === x && san.dsVat[q].y === y) { idxVat = q; break; }
          }
          lop += ' vat' + ((idxVat >= 0 && k.daNhat[idxVat]) ? ' da-nhat' : '');
        }
        if (k.x === x && k.y === y) {
          lop = 'o robot' + (k.ma === 'hit-wall' ? ' huc' : '');
          var q2 = { B: 0, D: 90, N: 180, T: 270 }[k.huong];
          trong = '<span style="--q:' + q2 + 'deg">▲</span>';
        }
        html += '<div class="' + lop + '">' + trong + '</div>';
      }
    }
    el.innerHTML = html;
    if (oNho) return;

    var huong = R.TEN_HUONG[k.huong];
    $('trang-thai').innerHTML =
      o('x', k.x) + o('y', k.y) + o('hướng', huong) + o('tick', k.tick) +
      o('đã nhặt', k.soVat) + o('va tường', k.vaTuong);
    function o(nhan, gt) {
      var doi = (nhan === 'tick' || nhan === 'đã nhặt') ? ' doi' : '';
      return '<div><i>' + nhan + '</i><b class="' + doi + '">' + gt + '</b></div>';
    }
  }

  /* ------------------------------------------------------------- chạy bài */

  function dungPhatLai() {
    if (st.henGio) { clearTimeout(st.henGio); st.henGio = null; }
    st.dangChay = false;
  }

  function chay() {
    dungPhatLai();
    var code = codeHienTai();
    if (!code.trim()) {
      $('chan-doan').innerHTML = '<div class="cd"><span class="ma">trống</span> — chưa có dòng lệnh nào để chạy.</div>';
      return;
    }
    var kq = R.chamBai(bai(), code);
    st.ketQua = kq;
    st.goiY = 0; $('goi-y').innerHTML = '';
    $('chan-doan').innerHTML = '';
    $('ds-san-an').innerHTML = ''; $('ra').innerHTML = '';
    var cu = $('xem-san-an'); if (cu) cu.remove();
    st.hienSanAn = false;
    $('nut-san-an').textContent = '👁 Xem sân ẩn';
    ['A', 'B', 'C'].forEach(function (h) { $('h-' + h).className = 'h'; });
    $('hang-nghia').textContent = '';

    var tocDo = parseInt($('toc-do').value, 10);
    st.dangChay = true;
    $('nut-chay').disabled = true;

    var khung = kq.chinh.khung;
    var i = 0;
    function buoc() {
      veSan(kq, i, null);
      if (i >= khung.length - 1) { xongChay(); return; }
      i++;
      if (tocDo > 0) st.henGio = setTimeout(buoc, tocDo);
      else buoc();
    }
    buoc();
  }

  function xongChay() {
    st.dangChay = false;
    $('nut-chay').disabled = false;
    var kq = st.ketQua;

    if (kq.hang) {
      $('h-' + kq.hang).className = 'h on ' + kq.hang;
      st.daQua[bai().id] = kq.hang;
      luu(); veChips();
      $('nut-san-an').disabled = false;
    }
    $('hang-nghia').textContent = NGHIA_HANG[kq.hang || ''];

    var ds = [];
    ds.push('<span class="' + (kq.chinh.ok ? (kq.chinh.vaTuong === 0 ? 'ok' : 'khong') : 'khong') + '">sân chính: ' +
      (kq.chinh.ok ? (kq.chinh.vaTuong === 0 ? 'sạch' : 'qua, có ' + kq.chinh.vaTuong + ' lần húc tường') : 'chưa qua') +
      ' · ' + kq.chinh.tick + ' tick</span>');
    kq.sanAn.forEach(function (r, i) {
      ds.push('<span class="' + (r.ok && r.vaTuong === 0 ? 'ok' : 'khong') + '">sân ẩn ' + (i + 1) + ': ' +
        (r.ok ? (r.vaTuong === 0 ? 'đạt' : 'qua nhưng húc tường') : 'chưa qua') + '</span>');
    });
    $('ds-san-an').innerHTML = ds.join('');

    var html = '';
    if (kq.chinh.loi) {
      var cd = CD[kq.chinh.loi.loai] || { ten: kq.chinh.loi.loai, ai: '', noi: '' };
      html += '<div class="cd' + (kq.chinh.loi.loai === 'runtime-error' || kq.chinh.loi.loai === 'locked-command' ? ' do' : '') + '">' +
        '<span class="ma">' + kq.chinh.loi.loai + '</span> · <b>' + cd.ten + '</b>' +
        (kq.chinh.loi.dong ? ' <span class="ai">(dòng ' + kq.chinh.loi.dong + ')</span>' : '') +
        '<div>' + (kq.chinh.loi.thongDiep || cd.noi) + '</div>' +
        (cd.ai ? '<div class="ai">' + cd.ai + ' nói</div>' : '') + '</div>';
    } else {
      kq.chanDoan.forEach(function (ma) {
        var cd = CD[ma]; if (!cd) return;
        var nhe = (ma === 'hit-wall' || ma === 'pick-miss');
        html += '<div class="cd' + (nhe ? '' : ' do') + '">' +
          '<span class="ma">' + ma + '</span> · <b>' + cd.ten + '</b>' +
          '<div>' + cd.noi + '</div><div class="ai">' + cd.ai + ' nói</div></div>';
      });
      if (!kq.chanDoan.length && kq.hang) {
        html += '<div class="cd tot"><span class="ma">sạch</span> · <b>không có lỗi nào</b>' +
          '<div>Robot chạy đúng đường, không húc tường, nhặt đủ vật.</div>' +
          '<div class="ai">Khánh nói</div></div>';
      }
    }
    $('chan-doan').innerHTML = html;

    var ra = kq.chinh.ra || [];
    if (ra.length) $('ra').innerHTML = '<div class="ra">' + ra.map(function (l) {
      return l.replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; });
    }).join('<br>') + '</div>';
  }

  /* ------------------------------------------------------------ xem sân ẩn */

  function veSanAn() {
    if (!st.ketQua) return;
    st.hienSanAn = !st.hienSanAn;
    $('nut-san-an').textContent = st.hienSanAn ? '👁 Ẩn sân ẩn' : '👁 Xem sân ẩn';
    veKetQuaSanAn();
  }

  function veKetQuaSanAn() {
    var kq = st.ketQua;
    var cu = $('xem-san-an');
    if (!st.hienSanAn) { if (cu) cu.remove(); return; }
    if (!cu) {
      cu = document.createElement('div');
      cu.id = 'xem-san-an';
      cu.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;margin:8px 0';
      $('ds-san-an').parentNode.insertBefore(cu, $('ds-san-an').nextSibling);
    }
    cu.innerHTML = '';
    kq.sanAn.forEach(function (r, i) {
      var b = document.createElement('div');
      b.innerHTML = '<div class="nhan" style="margin-bottom:4px">sân ẩn ' + (i + 1) + '</div>';
      var g = document.createElement('div');
      g.className = 'san';
      b.appendChild(g);
      cu.appendChild(b);
      veSan({ chinh: r, san: r.san }, r.khung.length - 1, g);
    });
  }

  /* -------------------------------------------------------------- chọn bài */

  function khungDau(rows) {
    var s = R.docSan(rows);
    return {
      x: s.batDau.x, y: s.batDau.y, huong: s.batDau.huong, tick: 0, vaTuong: 0,
      soVat: 0, ma: null, daNhat: s.dsVat.map(function () { return false; })
    };
  }

  function chonBai(i) {
    dungPhatLai();
    st.baiIdx = i; st.ketQua = null; st.goiY = 0; st.hienSanAn = false; st.noiThem = [];
    var cu = $('xem-san-an'); if (cu) cu.remove();
    $('nut-san-an').textContent = '👁 Xem sân ẩn';
    $('nut-san-an').disabled = !st.daQua[bai().id];
    $('o-code').value = st.go[bai().id] || '';
    $('goi-y').innerHTML = ''; $('chan-doan').innerHTML = ''; $('ra').innerHTML = '';
    $('ds-san-an').innerHTML = '';
    ['A', 'B', 'C'].forEach(function (h) { $('h-' + h).className = 'h'; });
    $('hang-nghia').textContent = '';
    var b = bai();
    veSan({ chinh: { khung: [khungDau(b.san)], san: R.docSan(b.san) }, san: R.docSan(b.san) }, 0, null);
    veKhayThe();
    veChuongTrinh(); veChuDeBai(); capNhatONho(); luu();
  }

  /* --------------------------------------------------------------- sự kiện */

  function doiCheDo(cheDo) {
    if (cheDo === 'go' && st.cheDo === 'the') {
      var c = codeTuThe();
      if (c && !$('o-code').value.trim()) $('o-code').value = c;
    }
    st.cheDo = cheDo;
    $('tab-the').className = cheDo === 'the' ? 'on' : '';
    $('tab-go').className = cheDo === 'go' ? 'on' : '';
    $('khu-the').className = cheDo === 'the' ? '' : 'an';
    $('khu-go').className = cheDo === 'go' ? '' : 'an';
    capNhatONho();
  }

  $('nut-chay').onclick = chay;
  $('nut-ve-dau').onclick = function () { dungPhatLai(); if (st.ketQua) veSan(st.ketQua, 0, null); };
  $('nut-goi-y').onclick = function () {
    var gy = bai().goiY || [];
    if (st.goiY >= gy.length) return;
    var d = document.createElement('div');
    d.className = 'goi-y';
    d.textContent = 'Khánh: ' + gy[st.goiY];
    $('goi-y').appendChild(d);
    st.goiY++;
  };
  $('nut-san-an').onclick = veSanAn;
  $('tab-the').onclick = function () { doiCheDo('the'); };
  $('tab-go').onclick = function () { doiCheDo('go'); };
  $('nut-chep').onclick = function () {
    $('o-code').value = codeTuThe();
    st.go[bai().id] = $('o-code').value;
    doiCheDo('go'); luu();
  };
  $('nut-lui').onclick = function () { doiCheDo('the'); };
  $('o-code').oninput = function () { st.go[bai().id] = $('o-code').value; capNhatONho(); luu(); };
  $('o-code').onkeydown = function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var t = e.target, s = t.selectionStart;
      t.value = t.value.slice(0, s) + '    ' + t.value.slice(t.selectionEnd);
      t.selectionStart = t.selectionEnd = s + 4;
    }
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); chay(); }
  });
  $('nut-ghichu').onclick = function () { $('ghichu').className = 'mo'; };
  $('dong-ghichu').onclick = function () { $('ghichu').className = ''; };
  $('ghichu').onclick = function (e) { if (e.target === $('ghichu')) $('ghichu').className = ''; };

  /* -------------------------------------------------------------- khởi động */

  doc();
  veKhayThe();
  chonBai(st.baiIdx);
  doiCheDo('the');
})();
