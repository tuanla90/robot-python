/* ============================================================================
   cham.js — "Đường học": MÁY CHẤM (window.ChamHoc).

   cham(man, baiLam, thuVien) → {
     thang, sao (0–3), soO, soNhip,
     chanDoan: [{ ma, loi, … }],      // lời tiếng Việt cho học sinh, KHÔNG nói đáp án
     vet: [ { loai:'lenh', ten, cho:{cot,dong}, ngan:[{cot,dong}…] },
            { loai:'nhip', nhip, robot:{x,y,huong,banh:{trai,phai}}, suKien:[…] } ],
     theoSan: [ { thang, soNhip, chanDoan, vet } ],     // mỗi sân một mục
     py, anhXa, batDau
   }
   - sao: 1 nếu thắng; +1 nếu soO ≤ man.sao.o; +1 nếu soNhip ≤ man.sao.nhip.
   - man.san có thể là MỘT sân (mảng chuỗi) hoặc MỘT MẢNG sân (cùng khung); thắng khi
     thắng TẤT CẢ sân. man.batDau cũng có thể là mảng song song với man.san.
   - man.hamGoc: hàm gốc cho phép. man.thuVien: tên hàm thư viện được dùng ở màn;
     mã nguồn thư viện truyền vào qua tham số `thuVien` ({ tên: 'def …' }).

   Mã chẩn đoán: quen-wait, banh-goi-lai, dam-tuong, chua-toi-co, tran-khung,
   def-o-cot-chinh, lenh-le-o-cot-ham, chua-mo-cot-ham, ham-chua-co, loi-cu-phap,
   loi-thut-le, loi-chay, qua-nhieu-nhip.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var SanHoc = laNode ? require('./san-hoc.js') : window.SanHoc;
  var KhungCode = laNode ? require('./khung-code.js') : window.KhungCode;

  var TEN_COT = { chinh: 'cột CHÍNH', ham: 'cột HÀM' };
  var LOAI_VAT = { 'tuong': 'tường', 'ngoai-san': 'ngoài sân', 'bac-thang': 'bậc thang (xe bánh không leo được)' };

  function viTri(m) {
    if (!m) return 'một dòng không xác định';
    if (m.cot === 'thuvien') return 'trong hàm thư viện ' + m.ten;
    return TEN_COT[m.cot] + ', dòng ' + m.dong;
  }
  function cho(m) {
    if (!m) return null;
    var o = { cot: m.cot, dong: m.dong };
    if (m.ten) o.ten = m.ten;
    return o;
  }

  /** Dòng nào của mã Python "đáng đổ lỗi" khi core báo thiếu thân khối. */
  function dongDefThieuThan(dong, dongPy) {
    function sach(s) { var k = String(s).indexOf('#'); return (k >= 0 ? s.slice(0, k) : s).trim(); }
    var j = Math.min(dongPy, dong.length);
    if (j >= 1 && /:$/.test(sach(dong[j - 1]))) return j;
    for (j = j - 1; j >= 1; j--) if (sach(dong[j - 1]) !== '') return j;
    return dongPy;
  }

  /** Chẩn đoán từ kết quả chạy MỘT sân. */
  function chanDoanSan(man, res, g) {
    var cd = [], hamGoc = man.hamGoc || [], thuVien = man.thuVien || [];
    var mo = (man.khung && man.khung.ham > 0);
    function them(ma, loi, extra) { var o = { ma: ma, loi: loi }; for (var k in extra) o[k] = extra[k]; cd.push(o); }

    // --- lỗi của nhân chạy code
    var l = res.loi;
    if (l && l.loai !== 'qua-nhieu-nhip') {
      var m = g.anhXa[l.dong] || null;
      var tn = /tên "([^"]+)"/.exec(l.thongDiep || '');
      if (l.loai === 'runtime-error' && tn && /^Chưa có biến hay hàm/.test(l.thongDiep)) {
        var s = 'Ở ' + viTri(m) + ': không có hàm tên "' + tn[1] + '". Hàm gốc dùng được ở màn này: ' +
          (hamGoc.length ? hamGoc.join(', ') : '(không có)') +
          (thuVien.length ? '; thư viện: ' + thuVien.join(', ') : '') + '.';
        if (mo) s += ' Nếu đó là hàm của bạn thì cần viết nó bằng def ở cột HÀM, và kiểm tra lại chính tả.';
        else s += ' Kiểm tra lại chính tả.';
        them('ham-chua-co', s, { ten: tn[1], cho: cho(m) });
      } else if (l.loai === 'syntax-error' || l.loai === 'indent-error') {
        var mm = m, td = l.thongDiep;
        if (/^Thiếu dòng thụt lề/.test(td)) {
          mm = g.anhXa[dongDefThieuThan(g.dong, l.dong)] || m;
          td = 'Dòng này kết thúc bằng dấu ":" nên phải có ít nhất một dòng thụt vào ngay bên dưới làm thân.';
        }
        them(l.loai === 'syntax-error' ? 'loi-cu-phap' : 'loi-thut-le', 'Ở ' + viTri(mm) + ': ' + td, { cho: cho(mm) });
      } else {
        them('loi-chay', 'Ở ' + viTri(m) + ': ' + l.thongDiep, { cho: cho(m), loaiCore: l.loai });
      }
    }
    if (l && l.loai === 'qua-nhieu-nhip') {
      them('qua-nhieu-nhip', 'Robot đã chạy quá ' + (man.nhipToiDa || 200) + ' nhịp mà chưa tới cờ. ' +
        'Xem chương trình có đoạn nào lặp mãi hoặc đi vòng không cần thiết không.', { nhip: res.nhip });
    }

    // --- các mốc trong lúc chạy
    var tuong = res.suKien.filter(function (e) { return e.ma === 'dam-tuong'; });
    if (tuong.length) {
      var e0 = tuong[0];
      var s2 = 'Ở nhịp ' + e0.nhip + ', robot định đi vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng đó là ' +
        (LOAI_VAT[e0.vat] || e0.vat) + ' nên nó đứng yên (vẫn mất một nhịp).' +
        (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
        ' Kiểm tra lại robot đang quay mặt hướng nào trước lệnh đi.';
      them('dam-tuong', s2, { nhip: e0.nhip, den: e0.den, soLan: tuong.length });
    }
    var goiLai = res.suKien.filter(function (e) { return e.ma === 'banh-goi-lai'; });
    if (goiLai.length) {
      var b0 = goiLai[0], mb = g.anhXa[b0.dongPy] || null;
      them('banh-goi-lai', 'Ở ' + viTri(mb) + ': bánh ' + (b0.banh === 'trai' ? 'trái' : 'phải') +
        ' đã nhận lệnh trong nhịp này rồi, nên lệnh ' + b0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp một bánh chỉ nhận một lệnh; wait() mới sang nhịp kế.', { cho: cho(mb), nhip: b0.nhip });
    }
    var quen = res.suKien.filter(function (e) { return e.ma === 'quen-wait'; });
    if (quen.length) {
      var q = quen[0];
      them('quen-wait', 'Chương trình kết thúc khi còn lệnh bánh (' +
        q.lenh.map(function (x) { return x.ten + '()'; }).join(', ') + ') chưa có wait() theo sau, nên những lệnh đó không chạy. ' +
        'Lệnh bánh chỉ có tác dụng khi nhịp kết thúc bằng wait().', { lenh: q.lenh.map(function (x) { return x.ten; }) });
    }

    // --- chạy xong mà chưa tới cờ
    if (!res.thang && !res.loi) {
      var r = res.robot;
      them('chua-toi-co', 'Chương trình chạy xong mà robot chưa tới cờ: robot đang ở ô (' + r.x + ', ' + r.y + ')' +
        (man.loaiRobot === 'nhen' ? '' : ', quay mặt hướng ' + SanHoc.TEN_HUONG[r.huong]) +
        '. Thử chạy lại và theo dõi từng nhịp xem robot đi lệch ở đâu.', { robot: { x: r.x, y: r.y, huong: r.huong } });
    }
    return cd;
  }

  function chuanHoa(baiLam) {
    return { chinh: ((baiLam && baiLam.chinh) || []).slice(), ham: ((baiLam && baiLam.ham) || []).slice() };
  }

  function cham(man, baiLam, thuVien) {
    baiLam = chuanHoa(baiLam);
    thuVien = thuVien || {};
    var khung = man.khung || { chinh: 8, ham: 0 };
    var soO = KhungCode.soO(baiLam);
    var ketQua = { thang: false, sao: 0, soO: soO, soNhip: 0, chanDoan: [], vet: [], theoSan: [], py: '', anhXa: [] };

    // 1. khung
    var loiKhung = KhungCode.kiemTra(khung, baiLam);
    if (loiKhung.length) { ketQua.chanDoan = loiKhung; return ketQua; }

    // 2. ghép Python
    var dsTV = (man.thuVien || []).map(function (ten) {
      if (typeof thuVien[ten] !== 'string') throw new Error('Thiếu mã nguồn thư viện "' + ten + '".');
      return { ten: ten, ma: thuVien[ten] };
    });
    var g = KhungCode.ghep(baiLam, dsTV);
    ketQua.py = g.ma; ketQua.anhXa = g.anhXa;

    // dòng đầu của mỗi cột mà thụt lề → sẽ bị Python nuốt vào hàm đứng trước nó
    var loiDau = [];
    ['ham', 'chinh'].forEach(function (cot) {
      var ds = baiLam[cot];
      for (var i = 0; i < ds.length; i++) {
        if (KhungCode.laTrong(ds[i])) continue;
        if (/^\s/.test(ds[i])) {
          loiDau.push({
            ma: 'loi-thut-le', cot: cot, cho: { cot: cot, dong: i + 1 },
            loi: 'Ở ' + TEN_COT[cot] + ', dòng ' + (i + 1) + ': dòng đầu tiên của cột không được thụt lề — chưa có khối nào cần nó.'
          });
        }
        break;
      }
    });
    if (loiDau.length) { ketQua.chanDoan = loiDau; return ketQua; }

    // 3. chạy từng sân
    var nhieu = Array.isArray(man.san[0]);
    var dsSan = nhieu ? man.san : [man.san];
    var thangHet = true, nhipMax = 0, gom = [], dsMa = {};
    dsSan.forEach(function (rows, i) {
      var bd = Array.isArray(man.batDau) ? man.batDau[i] : man.batDau;
      var res = SanHoc.chay({
        san: rows, batDau: bd, loaiRobot: man.loaiRobot || 'banh',
        hamGoc: man.hamGoc, nhipToiDa: man.nhipToiDa || 200
      }, g.ma);
      var cd = chanDoanSan(man, res, g);
      var vet = res.vet.map(function (e) {
        if (e.loai === 'lenh') {
          return { loai: 'lenh', ten: e.ten, cho: cho(g.anhXa[e.dongPy]), ngan: e.nganPy.map(function (d) { return cho(g.anhXa[d]); }) };
        }
        return e;
      });
      ketQua.theoSan.push({ thang: res.thang, soNhip: res.nhip, chanDoan: cd, vet: vet, robot: res.robot });
      if (!res.thang) thangHet = false;
      if (res.nhip > nhipMax) nhipMax = res.nhip;
      cd.forEach(function (c) {
        if (dsMa[c.ma]) return;
        dsMa[c.ma] = true;
        gom.push(nhieu ? Object.assign({}, c, { loi: 'Sân ' + (i + 1) + ': ' + c.loi, san: i }) : c);
      });
    });
    ketQua.thang = thangHet;
    ketQua.soNhip = nhipMax;
    ketQua.chanDoan = gom;
    ketQua.batDau = Array.isArray(man.batDau) ? man.batDau[0] : man.batDau;
    var viec = ketQua.theoSan.filter(function (s) { return !s.thang; })[0] || ketQua.theoSan[0];
    ketQua.vet = viec.vet;
    if (thangHet) {
      var sao = man.sao || {};
      ketQua.sao = 1 + (sao.o !== undefined && soO <= sao.o ? 1 : 0) + (sao.nhip !== undefined && nhipMax <= sao.nhip ? 1 : 0);
    }
    return ketQua;
  }

  var API = { cham: cham };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ChamHoc = API;
})();
