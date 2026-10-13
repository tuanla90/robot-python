/* ============================================================================
   cham.js — "Đường học": MÁY CHẤM (window.ChamHoc).

   cham(man, baiLam, hamCuaEm) → {
     thang, sao (0–3), soO, soNhip,
     hamDaDung: [tên…],                // hàm (của em + của màn) THỰC SỰ được gọi tới
     chiTietO: { chinh, ham: [{ ten, cot:'hamEm'|'hamMan', o }] },
     chanDoan: [{ ma, muc, loi, … }],  // lời tiếng Việt cho học sinh, KHÔNG nói đáp án
                                       // muc: 'loi' | 'thong-tin' (thông tin, không phải lỗi)
     vet: [ { loai:'lenh', ten, cho:{cot,ten?,dong}, ngan:[{cot,ten?,dong}…] },
            { loai:'nhip', nhip, robot:{x,y,huong,banh:{trai,phai}}, suKien:[…] } ],
     theoSan: [ { thang, soNhip, chanDoan, vet } ],     // mỗi sân một mục
     py, anhXa, batDau
   }
   baiLam = { chinh: [dòng], hamCuaMan: [ { ten, thamSo, than: [dòng] } ] } — hàm CỦA MÀN
     (tạm, bản học sinh đang sửa); xem khung-code.js.
   hamCuaEm = [ { ten, thamSo, than } ] — KHO hàm của em (bền), xem kho-ham.js.
   - Hàm của màn che hàm của em cùng tên (chẩn đoán 'ham-man-che-ham-em', muc 'thong-tin').
   - man.camHamCuaEm: màn cấm hàm của em → kho bị bỏ qua. man.moXuong === false: chưa mở Xưởng.
   - Hàm của em chỉ được ghép vào mã Python nếu bài làm gọi tới nó (kể cả gián tiếp).
   - soO = ô chương trình + thân các hàm THỰC SỰ được gọi khi chạy (dò từ vết, kể cả gọi
     gián tiếp, mỗi hàm tính một lần; nhiều sân lấy HỢP). Hàm không được gọi thì không
     tính; dòng def không tốn ô. Chưa chạy được (lỗi khung, cú pháp…) thì dò tĩnh.
   - sao: 1 nếu thắng; +1 nếu soO ≤ man.sao.o; +1 nếu soNhip ≤ man.sao.nhip.
   - man.san có thể là MỘT sân (mảng chuỗi) hoặc MỘT MẢNG sân (cùng khung); thắng khi
     thắng TẤT CẢ sân. man.batDau cũng có thể là mảng song song với man.san.
   - man.hamGoc: hàm gốc cho phép.

   thuHam(man, baiLam, tenHam, hamCuaEm, tuyChon) — "sân thử" của Xưởng hàm: chạy riêng
   một hàm (của em hoặc của màn) trên sân trống RẤT RỘNG (41×41, robot ở chính giữa quay lên,
   không tường, không cờ, không băng) để hàm bình thường không bao giờ chạm biên.
   Để thử bản đang soạn của một hàm của em, đưa bản đó vào mảng hamCuaEm.
   TỌA ĐỘ trả về (vet, robot, batDau, khung, den/tu trong sự kiện) đã được DỊCH về khung
   quy ước: xuất phát luôn là BAT_DAU_THU = (1, 1) quay lên (hướng 0); đi lên thì y giảm,
   sang phải thì x tăng; có thể âm hay vượt 2 — giao diện tự lấy `khung` mà vẽ.
   khung = { minX, maxX, minY, maxY }: vùng bao mọi ô robot đã đứng, kể cả ô xuất phát.

   Mã chẩn đoán: quen-wait, banh-goi-lai, dam-tuong, chua-toi-co, tran-khung,
   def-trong-chuong-trinh, ham-trung-ten, ham-chua-co, loi-cu-phap, loi-thut-le,
   loi-chay, qua-nhieu-nhip, ham-man-che-ham-em (thông tin).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var SanHoc = laNode ? require('./san-hoc.js') : window.SanHoc;
  var KhungCode = laNode ? require('./khung-code.js') : window.KhungCode;

  var LOAI_VAT = { 'tuong': 'tường', 'ngoai-san': 'ngoài sân', 'bac-thang': 'bậc thang (xe bánh không leo được)' };
  var SAN_THU = ['...', '...', '...'];                       // sân 3×3 cũ — giữ làm khung tối thiểu khi vẽ
  var BAT_DAU_THU = { x: 1, y: 1, huong: 0 };                // gốc quy ước của tọa độ sân thử
  var CO_SAN_RONG = 41;                                      // sân chạy thật: 41×41, robot ở giữa
  var SAN_RONG = (function () { var r = [], d = ''; for (var i = 0; i < CO_SAN_RONG; i++) d += '.'; for (var j = 0; j < CO_SAN_RONG; j++) r.push(d); return r; })();
  var GIUA_RONG = (CO_SAN_RONG - 1) / 2;

  function viTri(m) {
    if (!m) return 'một dòng không xác định';
    if (m.cot === 'hamEm') return m.dong === 0 ? 'hàm ' + m.ten + ' (phần tên hàm)' : 'hàm ' + m.ten + ', dòng ' + m.dong;
    if (m.cot === 'hamMan') return m.dong === 0 ? 'hàm ' + m.ten + ' của màn (phần tên hàm)' : 'hàm ' + m.ten + ' của màn, dòng ' + m.dong;
    if (m.cot === 'thu') return 'lời gọi thử hàm';
    return 'chương trình, dòng ' + m.dong;
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

  function tenCua(ds) { return ds.map(function (h) { return h.ten; }); }

  /**
   * Chẩn đoán từ kết quả chạy MỘT sân. sanThu = true: sân thử, không có cờ để "chưa tới".
   * bc (bối cảnh): { hamMan: [tên], hamEm: [tên], biCam: [tên hàm của em bị cấm mà bài đang gọi] }.
   */
  function chanDoanSan(man, res, g, sanThu, bc) {
    var cd = [], hamGoc = man.hamGoc || [];
    var mo = man.moXuong !== false;
    function them(ma, loi, extra) { var o = { ma: ma, muc: 'loi', loi: loi }; for (var k in extra) o[k] = extra[k]; cd.push(o); }

    // --- lỗi của nhân chạy code
    var l = res.loi;
    if (l && l.loai !== 'qua-nhieu-nhip') {
      var m = g.anhXa[l.dong] || null;
      var tn = /tên "([^"]+)"/.exec(l.thongDiep || '');
      if (l.loai === 'runtime-error' && tn && /^Chưa có biến hay hàm/.test(l.thongDiep)) {
        var ten = tn[1], s;
        if (bc.biCam.indexOf(ten) >= 0) {
          s = 'Ở ' + viTri(m) + ': màn này không cho dùng hàm của em, nên "' + ten + '" chưa có. Hàm gốc dùng được ở màn này: ' +
            (hamGoc.length ? hamGoc.join(', ') : '(không có)') + '.';
        } else {
          s = 'Ở ' + viTri(m) + ': không có hàm tên "' + ten + '". Hàm gốc dùng được ở màn này: ' +
            (hamGoc.length ? hamGoc.join(', ') : '(không có)') + '.';
          if (bc.hamMan.length) s += ' Hàm của màn: ' + bc.hamMan.join(', ') + '.';
          if (bc.hamEm.length) s += ' Hàm của em: ' + bc.hamEm.slice(0, 6).join(", ") + (bc.hamEm.length > 6 ? ', …' : '') + '.';
          s += mo ? ' Nếu đó là hàm của bạn thì cần tạo nó trong Xưởng hàm, và kiểm tra lại chính tả.' : ' Kiểm tra lại chính tả.';
        }
        them('ham-chua-co', s, { ten: ten, cho: cho(m) });
      } else if (l.loai === 'syntax-error' || l.loai === 'indent-error') {
        var mm = m, td = l.thongDiep;
        if (/^Thiếu dòng thụt lề/.test(td)) {
          mm = g.anhXa[dongDefThieuThan(g.dong, l.dong)] || m;
          td = mm && (mm.cot === 'hamEm' || mm.cot === 'hamMan') && mm.dong === 0
            ? 'hàm này chưa có dòng nào trong thân.'
            : 'dòng này kết thúc bằng dấu ":" nên phải có ít nhất một dòng thụt vào ngay bên dưới làm thân.';
        }
        them(l.loai === 'syntax-error' ? 'loi-cu-phap' : 'loi-thut-le', 'Ở ' + viTri(mm) + ': ' + td, { cho: cho(mm) });
      } else {
        them('loi-chay', 'Ở ' + viTri(m) + ': ' + l.thongDiep, { cho: cho(m), loaiCore: l.loai });
      }
    }
    if (l && l.loai === 'qua-nhieu-nhip') {
      them('qua-nhieu-nhip', 'Robot đã chạy quá ' + (res.nhipToiDa || man.nhipToiDa || 200) + ' nhịp' +
        (sanThu ? '. ' : ' mà chưa tới cờ. ') +
        'Xem chương trình có đoạn nào lặp mãi hoặc đi vòng không cần thiết không.', { nhip: res.nhip });
    }

    // --- các mốc trong lúc chạy
    var tuong = res.suKien.filter(function (e) { return e.ma === 'dam-tuong'; });
    if (tuong.length) {
      var e0 = tuong[0];
      var s2 = sanThu && e0.vat === 'ngoai-san'
        ? 'Ở nhịp ' + e0.nhip + ', robot đi quá xa: ra khỏi sân thử (chỉ rộng ' + GIUA_RONG + ' ô mỗi phía quanh chỗ xuất phát) nên nó đứng yên.' +
          ' Kiểm tra vòng lặp hoặc số lần lặp xem có đi mãi không.'
        : 'Ở nhịp ' + e0.nhip + ', robot định đi vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng đó là ' +
        (LOAI_VAT[e0.vat] || e0.vat) + ' nên nó đứng yên (vẫn mất một nhịp).' +
        (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
        ' Kiểm tra lại robot đang quay mặt hướng nào trước lệnh đi.';
      them('dam-tuong', s2, { nhip: e0.nhip, den: e0.den, soLan: tuong.length });
    }
    var goiLai = res.suKien.filter(function (e) { return e.ma === 'banh-goi-lai'; });
    if (goiLai.length) {
      var b0 = goiLai[0], mb = g.anhXa[b0.dongPy] || null;
      var mt = b0.truoc ? (g.anhXa[b0.truoc.dongPy] || null) : null;     // lệnh đã giữ bánh này trong nhịp
      them('banh-goi-lai', 'Ở ' + viTri(mb) + ': bánh ' + (b0.banh === 'trai' ? 'trái' : 'phải') +
        ' đã nhận lệnh' + (mt ? ' ' + b0.truoc.ten + '() (ở ' + viTri(mt) + ')' : '') +
        ' trong nhịp này rồi, nên lệnh ' + b0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp một bánh chỉ nhận một lệnh; wait() mới sang nhịp kế.', { cho: cho(mb), choTruoc: cho(mt), nhip: b0.nhip });
    }
    var quen = res.suKien.filter(function (e) { return e.ma === 'quen-wait'; });
    if (quen.length) {
      var q = quen[0], mq = g.anhXa[q.lenh[0].dongPy] || null;
      them('quen-wait', 'Chương trình kết thúc khi còn lệnh bánh (' +
        q.lenh.map(function (x) { return x.ten + '()'; }).join(', ') + ', bắt đầu từ ' + viTri(mq) + ') chưa có wait() theo sau, nên những lệnh đó không chạy. ' +
        'Lệnh bánh chỉ có tác dụng khi nhịp kết thúc bằng wait().', { lenh: q.lenh.map(function (x) { return x.ten; }), cho: cho(mq) });
    }

    // --- chạy xong mà chưa tới cờ
    if (!sanThu && !res.thang && !res.loi) {
      var r = res.robot;
      them('chua-toi-co', 'Chương trình chạy xong mà robot chưa tới cờ: robot đang ở ô (' + r.x + ', ' + r.y + ')' +
        (man.loaiRobot === 'nhen' ? '' : ', quay mặt hướng ' + SanHoc.TEN_HUONG[r.huong]) +
        '. Thử chạy lại và theo dõi từng nhịp xem robot đi lệch ở đâu.', { robot: { x: r.x, y: r.y, huong: r.huong } });
    }
    return cd;
  }

  /* ------------------------------------------------------------ chuẩn bị bài */

  function chuanHoa(baiLam) {
    return {
      chinh: ((baiLam && baiLam.chinh) || []).slice(),
      hamCuaMan: ((baiLam && baiLam.hamCuaMan) || []).map(saoHam)
    };
  }
  function saoHam(h) { return { ten: h.ten, thamSo: (h.thamSo || []).slice(), than: (h.than || []).slice() }; }

  /** Chẩn đoán loại "thông tin": hàm của màn che hàm của em cùng tên. */
  function thongTinChe(che) {
    return che.map(function (ten) {
      return {
        ma: 'ham-man-che-ham-em', muc: 'thong-tin', ten: ten,
        loi: 'Màn này có sẵn hàm ' + ten + '() riêng, nên trong màn này hàm ' + ten + '() của em được thay bằng hàm của màn.'
      };
    });
  }

  /** Dòng đầu của mỗi khối (chương trình, thân từng hàm) mà thụt lề → Python sẽ hiểu sai khối. */
  function loiDauKhoi(baiLam, hamEmDung, chiHam) {
    var kq = [];
    function xet(ds, tenKhoi, cotInfo) {
      for (var i = 0; i < ds.length; i++) {
        if (KhungCode.laTrong(ds[i])) continue;
        if (/^\s/.test(ds[i])) {
          var c = { cot: cotInfo.cot, dong: i + 1 };
          if (cotInfo.ten) c.ten = cotInfo.ten;
          kq.push({
            ma: 'loi-thut-le', muc: 'loi', cho: c,
            loi: 'Ở ' + tenKhoi + ', dòng ' + (i + 1) + ': dòng đầu tiên không được thụt lề — chưa có khối nào cần nó.'
          });
        }
        break;
      }
    }
    hamEmDung.forEach(function (h) {
      if (chiHam !== undefined && h.ten !== chiHam) return;
      xet(h.than, 'hàm ' + h.ten, { cot: 'hamEm', ten: h.ten });
    });
    baiLam.hamCuaMan.forEach(function (h) {
      if (chiHam !== undefined && h.ten !== chiHam) return;
      xet(h.than, 'hàm ' + h.ten + ' của màn', { cot: 'hamMan', ten: h.ten });
    });
    if (chiHam === undefined) xet(baiLam.chinh, 'chương trình', { cot: 'chinh' });
    return kq;
  }

  function chuyenVet(vet, g) {
    return vet.map(function (e) {
      if (e.loai === 'lenh') {
        return {
          loai: 'lenh', ten: e.ten, cho: cho(g.anhXa[e.dongPy]),
          ngan: e.nganPy.map(function (d) { return cho(g.anhXa[d]); }).filter(function (x) { return x && x.cot !== 'thu'; })
        };
      }
      return e;
    });
  }

  /** Các hàm (cot + ten) xuất hiện trong vết: nơi đặt lệnh và mọi khung đang mở. */
  function hamTrongVet(vet, dung) {
    function ghi(m) { if (m && (m.cot === 'hamEm' || m.cot === 'hamMan')) dung[m.cot + ':' + m.ten] = true; }
    vet.forEach(function (e) {
      if (e.loai !== 'lenh') return;
      ghi(e.cho);
      e.ngan.forEach(ghi);
    });
  }

  /* ------------------------------------------------------------------- chấm */

  function cham(man, baiLam, hamCuaEm) {
    baiLam = chuanHoa(baiLam);
    var cam = !!man.camHamCuaEm;
    var kho = cam ? [] : (hamCuaEm || []).map(saoHam);
    var biCamTen = cam ? tenCua(hamCuaEm || []) : [];
    var khung = Object.assign({ chinh: 10, moiHam: 10 }, man.khung || {}, { moXuong: man.moXuong !== false });

    // hàm nào được ghép: mọi hàm của màn; hàm của em chỉ khi bài làm gọi tới (trực tiếp hay gián tiếp)
    var tap = KhungCode.tapHamDung(baiLam, kho, { tatCaHamMan: true });
    var tinh = KhungCode.tapHamDung(baiLam, kho);             // chỉ những hàm với tới được từ chương trình
    var thongTin = cam ? [] : thongTinChe(tap.che);
    var bc = {
      hamMan: tenCua(baiLam.hamCuaMan), biCam: biCamTen,
      hamEm: tenCua(kho).filter(function (t) { return tap.che.indexOf(t) < 0; })
    };

    function chiTiet(dsHam) {
      return dsHam.map(function (h) { return { ten: h.ten, cot: tap.em.indexOf(h) >= 0 ? 'hamEm' : 'hamMan', o: KhungCode.soOHam(h) }; });
    }
    function dienO(kq, dsHam) {
      kq.soO = KhungCode.demO(baiLam, dsHam);
      kq.hamDaDung = tenCua(dsHam);
      kq.chiTietO = { chinh: KhungCode.soDong(baiLam.chinh), ham: chiTiet(dsHam) };
    }
    var ketQua = { thang: false, sao: 0, soO: 0, soNhip: 0, hamDaDung: [], chiTietO: null, chanDoan: [], vet: [], theoSan: [], py: '', anhXa: [] };
    var tinhDs = tinh.em.concat(tinh.man);
    dienO(ketQua, tinhDs);                                      // tạm: dò tĩnh, chạy xong sẽ thay bằng dò theo vết
    function xong() { ketQua.chanDoan = ketQua.chanDoan.concat(thongTin); return ketQua; }

    // 1. khung
    var loiKhung = KhungCode.kiemTra(khung, baiLam, man.hamGoc, tap.em);
    if (loiKhung.length) { ketQua.chanDoan = loiKhung.map(gan); return xong(); }

    // 2. ghép Python
    var g = KhungCode.ghep(baiLam, tap.em);
    ketQua.py = g.ma; ketQua.anhXa = g.anhXa;
    var loiDau = loiDauKhoi(baiLam, tap.em);
    if (loiDau.length) { ketQua.chanDoan = loiDau; return xong(); }

    // 3. chạy từng sân
    var nhieu = Array.isArray(man.san[0]);
    var dsSan = nhieu ? man.san : [man.san];
    var thangHet = true, nhipMax = 0, gom = [], dsMa = {}, dung = {};
    dsSan.forEach(function (rows, i) {
      var bd = Array.isArray(man.batDau) ? man.batDau[i] : man.batDau;
      var res = SanHoc.chay({
        san: rows, batDau: bd, loaiRobot: man.loaiRobot || 'banh',
        hamGoc: man.hamGoc, nhipToiDa: man.nhipToiDa || 200
      }, g.ma);
      var cd = chanDoanSan(man, res, g, false, bc);
      var vet = chuyenVet(res.vet, g);
      hamTrongVet(vet, dung);
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

    // hàm thực sự được gọi (hợp mọi sân) → số ô
    var daDung = tap.em.concat(tap.man).filter(function (h) {
      return dung[(tap.em.indexOf(h) >= 0 ? 'hamEm' : 'hamMan') + ':' + h.ten];
    });
    dienO(ketQua, daDung);
    if (thangHet) {
      var sao = man.sao || {};
      ketQua.sao = 1 + (sao.o !== undefined && ketQua.soO <= sao.o ? 1 : 0) + (sao.nhip !== undefined && nhipMax <= sao.nhip ? 1 : 0);
    }
    return xong();
  }

  function gan(c) { if (!c.muc) c.muc = 'loi'; return c; }

  /**
   * "Sân thử" của Xưởng hàm: chạy riêng hàm `tenHam` (của em hoặc của màn).
   * tuyChon: { doiSo: [giá trị mặc định cho đối số], nhipToiDa: 100 }.
   * Trả về { vet, robot: {x,y,huong}, batDau, khung, soNhip, chanDoan, py, anhXa } (tọa độ đã dịch, xem đầu tệp).
   * Chỉ chặn bởi lỗi khung thuộc về chính hàm này (tràn ô của nó) hoặc lỗi chung
   * (trùng tên); lỗi của chương trình chính hay của hàm khác không cản.
   */
  function thuHam(man, baiLam, tenHam, hamCuaEm, tuyChon) {
    tuyChon = tuyChon || {};
    baiLam = chuanHoa(baiLam);
    var cam = !!man.camHamCuaEm;
    var kho = cam ? [] : (hamCuaEm || []).map(saoHam);
    var ketQua = { vet: [], robot: Object.assign({}, BAT_DAU_THU), batDau: Object.assign({}, BAT_DAU_THU), soNhip: 0, chanDoan: [], py: '', anhXa: [],
      khung: { minX: BAT_DAU_THU.x, maxX: BAT_DAU_THU.x, minY: BAT_DAU_THU.y, maxY: BAT_DAU_THU.y } };
    var khung = Object.assign({ chinh: 10, moiHam: 10 }, man.khung || {}, { moXuong: man.moXuong !== false });

    var tap = KhungCode.tapHamDung(baiLam, kho, { goc: [tenHam] });
    var thongTin = cam ? [] : thongTinChe(tap.che);
    var bc = {
      hamMan: tenCua(baiLam.hamCuaMan), biCam: cam ? tenCua(hamCuaEm || []) : [],
      hamEm: tenCua(kho).filter(function (t) { return tap.che.indexOf(t) < 0; })
    };
    function xong() { ketQua.chanDoan = ketQua.chanDoan.concat(thongTin); return ketQua; }

    var rieng = { chinh: [], hamCuaMan: tap.man };
    var loiKhung = KhungCode.kiemTra(khung, rieng, man.hamGoc, tap.em).filter(function (e) {
      return e.ma !== 'tran-khung' || e.ten === tenHam;
    });
    if (loiKhung.length) { ketQua.chanDoan = loiKhung.map(gan); return xong(); }

    var doiSo = (tuyChon.doiSo || []).map(String);
    rieng.chinh = [tenHam + '(' + doiSo.join(', ') + ')'];
    var g = KhungCode.ghep(rieng, tap.em);
    g.anhXa[g.anhXa.length - 1] = { cot: 'thu', dong: 1 };
    ketQua.py = g.ma; ketQua.anhXa = g.anhXa;
    var loiDau = loiDauKhoi({ chinh: [], hamCuaMan: tap.man }, tap.em, tenHam);
    if (loiDau.length) { ketQua.chanDoan = loiDau; return xong(); }

    var nhipToiDa = tuyChon.nhipToiDa || 100;
    var res = SanHoc.chay({
      san: SAN_RONG, batDau: { x: GIUA_RONG, y: GIUA_RONG, huong: 0 }, loaiRobot: man.loaiRobot || 'banh',
      hamGoc: man.hamGoc, nhipToiDa: nhipToiDa
    }, g.ma);
    res.nhipToiDa = nhipToiDa;
    // dịch mọi tọa độ về khung quy ước (xuất phát = BAT_DAU_THU)
    var dx = BAT_DAU_THU.x - GIUA_RONG, dy = BAT_DAU_THU.y - GIUA_RONG;
    dich(res.vet, dx, dy); dich(res.suKien, dx, dy); dich(res.robot, dx, dy);
    var kh = { minX: BAT_DAU_THU.x, maxX: BAT_DAU_THU.x, minY: BAT_DAU_THU.y, maxY: BAT_DAU_THU.y };
    function ghiKhung(p) {
      if (p.x < kh.minX) kh.minX = p.x; if (p.x > kh.maxX) kh.maxX = p.x;
      if (p.y < kh.minY) kh.minY = p.y; if (p.y > kh.maxY) kh.maxY = p.y;
    }
    ghiKhung(res.robot);
    res.vet.forEach(function (e) { if (e.loai === 'nhip' && e.robot) ghiKhung(e.robot); });
    ketQua.chanDoan = chanDoanSan(man, res, g, true, bc);
    ketQua.vet = chuyenVet(res.vet, g);
    ketQua.robot = res.robot;
    ketQua.soNhip = res.nhip;
    ketQua.khung = kh;
    return xong();
  }

  /** Dịch (x, y) của mọi đối tượng có hai số x, y bên trong v (sâu), tại chỗ. */
  function dich(v, dx, dy) {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(function (e) { dich(e, dx, dy); }); return; }
    if (typeof v.x === 'number' && typeof v.y === 'number') { v.x += dx; v.y += dy; }
    for (var k in v) if (v[k] && typeof v[k] === 'object') dich(v[k], dx, dy);
  }

  var API = { cham: cham, thuHam: thuHam, SAN_THU: SAN_THU, BAT_DAU_THU: BAT_DAU_THU };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ChamHoc = API;
})();
