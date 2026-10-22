/* ============================================================================
   tran-dau.js — NHÂN TRẬN ĐẤU tối giản theo "Luật trận v0.1"
   + MÁY CHẤM (trả lời được: đội nào thắng, đội nào thua, vì sao).

   Ý tưởng cốt lõi — vì sao không cần chạy song song thật:
     Luật v0.1 không cho robot cảm biến, nên chương trình của mỗi đội là một
     LỘ TRÌNH CỐ ĐỊNH: nó không rẽ nhánh theo việc nhặt được khối hay không.
     Vì vậy lộ trình của hai đội tính ĐỘC LẬP với nhau, rồi mới GỘP theo tick
     và DIỄN LẠI trên sân chung để giải tranh chấp. Không cần coroutine, không
     cần worker, và kết quả vẫn tất định. (Xem bất biến "lộ trình độc lập".)

   Dùng lại nhân chạy code (tập con Python) của đợt 1:
     nhan/san-robot-core.js
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var core = laNode ? require('../nhan/san-robot-core.js') : window.RobotCore;

  /* ------------------------------------------------------------- LUẬT (dữ liệu) */

  var LUAT = {
    ten: 'Luật trận v0.1',
    rong: 9, cao: 7, truc: 4,                 // đối xứng qua cột x = 4
    xuatPhat: { A: { x: 0, y: 3, huong: 'D' }, B: { x: 8, y: 3, huong: 'T' } },
    nha: { A: { x: 0, y: 3 }, B: { x: 8, y: 3 } },
    khoi: [
      { x: 3, y: 1 }, { x: 5, y: 1 },
      { x: 3, y: 3 }, { x: 5, y: 3 },
      { x: 3, y: 5 }, { x: 5, y: 5 }
    ],
    diemMoiKhoi: 1,
    baoHiemTick: 400,                          // KHÔNG phải luật, chỉ để máy không treo
    nganSachLenh: 200000
  };

  var VONG = ['B', 'D', 'N', 'T'];             // thứ tự khi quay phải

  function loi(loai, thongDiep) {
    var e = new Error(thongDiep);
    e.cuaGame = true; e.loai = loai; e.dong = 0;
    return e;
  }
  function soBuocQuayPhai(tu, den) { return (VONG.indexOf(den) - VONG.indexOf(tu) + 4) % 4; }

  /* ------------------------------------------- chạy lộ trình của MỘT đội (độc lập) */

  /** Chạy chương trình của một đội trên SÂN TRỐNG (không có đối thủ, không tranh chấp).
   *  Kết quả là một NHẬT KÝ HÀNH ĐỘNG có mốc tick. Nhật ký này không phụ thuộc đội kia. */
  function chayLoTrinh(luat, doi, code, tuyChon) {
    tuyChon = tuyChon || {};
    var gioiHan = tuyChon.baoHiemTick || luat.baoHiemTick;
    var st = { x: luat.xuatPhat[doi].x, y: luat.xuatPhat[doi].y, huong: luat.xuatPhat[doi].huong };
    var nhatKy = [], tick = 0, chanDoan = [], loi2 = null;

    function ghi(loai) {
      tick++;
      if (tick > gioiHan) throw loi('qua-tick', 'Vượt ' + gioiHan + ' tick — chương trình chạy quá lâu.');
      nhatKy.push({ tick: tick, doi: doi, loai: loai, x: st.x, y: st.y, huong: st.huong });
    }
    function quayVe(huongDich) {
      var n = soBuocQuayPhai(st.huong, huongDich);
      if (n === 3) { st.huong = core.TRAI[st.huong]; ghi('turn'); return; }   // quay trái 1 bước ngắn hơn
      for (var i = 0; i < n; i++) { st.huong = core.PHAI[st.huong]; ghi('turn'); }
    }

    var api = {
      move: function (n) {
        var so = (n === undefined) ? 1 : Math.floor(n);
        if (!(so >= 0)) throw loi('loi-lenh', 'move() cần số bước không âm.');
        for (var i = 0; i < so; i++) {
          var v = core.VEC_TOA[st.huong];
          st.x += v[0]; st.y += v[1];
          ghi('move');
        }
        return 0;
      },
      turn_left: function () { st.huong = core.TRAI[st.huong]; ghi('turn'); return 0; },
      turn_right: function () { st.huong = core.PHAI[st.huong]; ghi('turn'); return 0; },
      pick: function () { ghi('pick'); return 0; },
      drop: function () { ghi('drop'); return 0; },
      go_to: function (x, y) {
        x = Math.floor(x); y = Math.floor(y);
        if (x < 0 || y < 0 || x >= luat.rong || y >= luat.cao) {
          throw loi('loi-lenh', 'go_to(' + x + ', ' + y + ') ra ngoài sân.');
        }
        if (st.x !== x) {
          quayVe(x > st.x ? 'D' : 'T');
          while (st.x !== x) { st.x += (x > st.x ? 1 : -1); ghi('move'); }
        }
        if (st.y !== y) {
          quayVe(y > st.y ? 'N' : 'B');
          while (st.y !== y) { st.y += (y > st.y ? 1 : -1); ghi('move'); }
        }
        return 0;
      }
    };

    try {
      core.chayCode(code, api, { nganSachLenh: tuyChon.nganSachLenh || luat.nganSachLenh });
    } catch (e) {
      if (e && e.cuaGame) { chanDoan.push(e.loai); loi2 = { loai: e.loai, thongDiep: e.thongDiep || e.message }; }
      else throw e;
    }
    return {
      doi: doi, nhatKy: nhatKy, chanDoan: chanDoan, loi: loi2,
      tickCuoi: tick, xong: !loi2
    };
  }

  /* ------------------------------------------------- MÁY CHẤM: chạy một trận */

  function timKhoi(ds, x, y) {
    for (var i = 0; i < ds.length; i++) if (ds[i].x === x && ds[i].y === y) return i;
    return -1;
  }
  function laNha(luat, doi, x, y) { return luat.nha[doi].x === x && luat.nha[doi].y === y; }

  /** Chạy một trận giữa hai chương trình. Trả về kết quả + bằng chứng + kết luận. */
  function chamTran(luat, codeA, codeB, tuyChon) {
    var A = chayLoTrinh(luat, 'A', codeA, tuyChon);
    var B = chayLoTrinh(luat, 'B', codeB, tuyChon);

    // Gộp hai nhật ký theo tick. Cùng tick mà cùng giành MỘT khối thì
    // khối bên nửa sân nào thì đội nửa đó được (luật đối xứng, §5).
    var suKien = A.nhatKy.concat(B.nhatKy).sort(function (p, q) {
      if (p.tick !== q.tick) return p.tick - q.tick;
      if (p.loai === 'pick' && q.loai === 'pick' && p.x === q.x && p.y === q.y) {
        var uuTien = (p.x < luat.truc) ? 'A' : 'B';
        return p.doi === uuTien ? -1 : 1;
      }
      return 0;
    });

    var conLai = luat.khoi.map(function (k) { return { x: k.x, y: k.y }; });
    var cam = { A: false, B: false };
    var diem = { A: 0, B: 0 };
    var chanDoan = [], khung = [], ketThuc = 'het-chuong-trinh';
    var viTri = {
      A: { x: luat.xuatPhat.A.x, y: luat.xuatPhat.A.y, huong: luat.xuatPhat.A.huong },
      B: { x: luat.xuatPhat.B.x, y: luat.xuatPhat.B.y, huong: luat.xuatPhat.B.huong }
    };
    function chup(tick) {
      return {
        tick: tick,
        A: { x: viTri.A.x, y: viTri.A.y, huong: viTri.A.huong, cam: cam.A },
        B: { x: viTri.B.x, y: viTri.B.y, huong: viTri.B.huong, cam: cam.B },
        diem: { A: diem.A, B: diem.B },
        conLai: conLai.map(function (k) { return { x: k.x, y: k.y }; })
      };
    }
    khung.push(chup(0));

    for (var i = 0; i < suKien.length; i++) {
      var e = suKien[i];
      viTri[e.doi] = { x: e.x, y: e.y, huong: e.huong };
      if (e.loai === 'pick') {
        if (cam[e.doi]) { chanDoan.push(e.doi + ':pick-khi-dang-cam'); }
        else {
          var idx = timKhoi(conLai, e.x, e.y);
          if (idx >= 0) { conLai.splice(idx, 1); cam[e.doi] = true; }
          else { chanDoan.push(e.doi + ':pick-hut@' + e.x + ',' + e.y); }
        }
      } else if (e.loai === 'drop') {
        if (!cam[e.doi]) { chanDoan.push(e.doi + ':drop-rong'); }
        else {
          cam[e.doi] = false;
          if (laNha(luat, e.doi, e.x, e.y)) { diem[e.doi] += luat.diemMoiKhoi; }
          else { conLai.push({ x: e.x, y: e.y }); chanDoan.push(e.doi + ':tha-khong-phai-nha@' + e.x + ',' + e.y); }
        }
      }
      khung.push(chup(e.tick));
      if (diem.A + diem.B >= luat.khoi.length) { ketThuc = 'het-khoi'; break; }
    }

    var thang = diem.A > diem.B ? 'A' : (diem.B > diem.A ? 'B' : 'hòa');
    return {
      luat: luat.ten,
      diem: diem, diemA: diem.A, diemB: diem.B,
      thang: thang,
      lyDo: 'A giao ' + diem.A + ' khối · B giao ' + diem.B + ' khối',
      ketThuc: ketThuc,
      khung: khung,
      chanDoan: chanDoan,
      xong: { A: A.xong, B: B.xong },
      loi: { A: A.loi, B: B.loi },
      nhatKy: { A: A.nhatKy, B: B.nhatKy },
      // Bất biến bảo toàn: điểm + còn trên sân + đang cầm = tổng số khối
      baoToan: diem.A + diem.B + conLai.length + (cam.A ? 1 : 0) + (cam.B ? 1 : 0)
    };
  }

  /* ==========================================================================
     LUẬT TRẬN v0.2 — HAI ROBOT MỖI ĐỘI, BÀN GIAO BẮT BUỘC, CHẠY SONG SONG THẬT

     Khác v0.1 ở ba chỗ, và cả ba đều cần thiết:
       1. Mỗi đội 2 robot: R1 đi lấy khối, R2 giao hàng về nhà.
       2. CÓ CẢM BIẾN → chương trình RẼ NHÁNH → lộ trình không còn độc lập
          → phải chạy bốn chương trình SONG SONG theo tick (không thể tính
            lộ trình riêng rồi gộp như v0.1).
       3. Bàn giao là bắt buộc: khối chỉ tính điểm nếu đã qua TRẠM GIAO.
     ========================================================================== */

  var LUAT_V02 = {
    ten: 'Luật trận v0.2 — 2 robot, bàn giao bắt buộc',
    rong: 11, cao: 7, truc: 5,
    nha: { A: { x: 0, y: 3 }, B: { x: 10, y: 3 } },
    tram: { A: { x: 3, y: 3 }, B: { x: 7, y: 3 } },
    vungGiua: { tu: 4, den: 6 },          // CHỈ R1 được vào vùng giữa
    khoi: [{ x: 4, y: 1 }, { x: 6, y: 1 }, { x: 4, y: 5 }, { x: 6, y: 5 }],
    xuatPhat: {                            // [R1, R2]
      A: [{ x: 2, y: 3, huong: 'D' }, { x: 1, y: 3, huong: 'D' }],
      B: [{ x: 8, y: 3, huong: 'T' }, { x: 9, y: 3, huong: 'T' }]
    },
    baoHiemTick: 4000, nganSachLenh: 200000,
    dongHo: 1800                                     // ĐỒNG HỒ TRẬN theo luật (1 tick ≈ 0,1 giây → 3 phút)
  };

  var HAM_TRUY_VAN = { pos_x: 1, pos_y: 1, huong: 1, item_here: 1, dang_cam: 1 };
  function tam() { }
  var API_V02 = {};
  ['move', 'turn_left', 'turn_right', 'pick', 'drop', 'wait',
    'pos_x', 'pos_y', 'huong', 'item_here', 'dang_cam'].forEach(function (t) { API_V02[t] = tam; });

  /** Thư viện hàm của đội — viết bằng chính Python, chèn trước bài của người chơi.
   *  `huong()`: 0 Bắc · 1 Đông · 2 Nam · 3 Tây (đúng vòng quay phải B→D→N→T). */
  var THU_VIEN = [
    'def quay_ve(h):',
    '    while huong() != h:',
    '        turn_right()',
    '',
    'def go_to(x, y):',
    '    if pos_x() < x:',
    '        quay_ve(1)',
    '        while pos_x() < x:',
    '            move(1)',
    '    if pos_x() > x:',
    '        quay_ve(3)',
    '        while pos_x() > x:',
    '            move(1)',
    '    if pos_y() < y:',
    '        quay_ve(2)',
    '        while pos_y() < y:',
    '            move(1)',
    '    if pos_y() > y:',
    '        quay_ve(0)',
    '        while pos_y() > y:',
    '            move(1)'
  ].join('\n');

  /** AI ĐƯỢC KHỐI KHI NHIỀU ROBOT NHẶT CÙNG LÚC — luật công bằng, KHÔNG phụ
   *  thuộc thứ tự robot trong tick: khối bên nửa sân nào thì đội nửa đó được.
   *  Khối nằm ĐÚNG trục giữa thì không ai được (thiết kế sân cấm đặt khối trên
   *  trục — có test canh). Nhặt một mình thì luật này không chi phối.
   *  `ds` là mảng robot (mỗi con có `.doi`). */
  function chonNguoiThangTie(luat, x, ds) {
    if (ds.length === 1) return ds[0];
    var uuTien = (x < luat.truc) ? 'A' : (x > luat.truc ? 'B' : null);
    if (!uuTien) return null;
    for (var i = 0; i < ds.length; i++) if (ds[i].doi === uuTien) return ds[i];
    return null;
  }

  /** THƯ VIỆN v0.3 — `quay_ve` quay ĐÚNG ĐƯỜNG NGẮN (bản v0.2 quay phải từng
   *  bước nên có lúc tốn 3 tick cho một lần quay trái). Giữ riêng để không đổi
   *  hành vi của luật v0.2 đã kiểm. */
  var THU_VIEN_V03 = [
    'def quay_ve(h):',
    '    if huong() == h:',
    '        return',
    '    if (huong() + 1) % 4 == h:',
    '        turn_right()',
    '    elif (huong() + 3) % 4 == h:',
    '        turn_left()',
    '    else:',
    '        turn_right()',
    '        turn_right()',
    '',
    'def go_to(x, y):',
    '    if pos_x() < x:',
    '        quay_ve(1)',
    '        while pos_x() < x:',
    '            move(1)',
    '    if pos_x() > x:',
    '        quay_ve(3)',
    '        while pos_x() > x:',
    '            move(1)',
    '    if pos_y() < y:',
    '        quay_ve(2)',
    '        while pos_y() < y:',
    '            move(1)',
    '    if pos_y() > y:',
    '        quay_ve(0)',
    '        while pos_y() > y:',
    '            move(1)'
  ].join('\n');

  /* ==========================================================================
     LUẬT TRẬN v0.3 — MỘT KHE CHỌN ĐỀ ("part" theo nghĩa ràng buộc, không phải
     tài sản: cả hai đội chọn từ CÙNG một bộ phương án, không ai mua gì).

     Mỗi phương án phải BỎ một khả năng và THÊM một khả năng, và phải ĐỔI HÌNH
     DẠNG bài toán — không phải chỉ đổi con số:

       TAY_DAI     : gắp được khối ở ô TRƯỚC MẶT   ← thêm
                     mỗi bước đi tốn 2 tick        ← bỏ tốc độ
       CHAN_NHANH  : mọi hành động 1 tick          ← thêm tốc độ
                     KHÔNG có pos_x()/pos_y()      ← bỏ định vị ⇒ mất luôn hàm
                                                     thư viện go_to(), phải tự
                                                     đếm bước
     ========================================================================== */

  var LUAT_V03 = {
    ten: 'Luật trận v0.3 — một khe chọn đề',
    rong: 11, cao: 7, truc: 5,
    nha: { A: { x: 0, y: 3 }, B: { x: 10, y: 3 } },
    tram: { A: { x: 3, y: 3 }, B: { x: 7, y: 3 } },
    vungGiua: { tu: 4, den: 6 },
    xuatPhat: {
      A: [{ x: 2, y: 3, huong: 'D' }, { x: 1, y: 3, huong: 'D' }],
      B: [{ x: 8, y: 3, huong: 'T' }, { x: 9, y: 3, huong: 'T' }]
    },
    dongHo: 1800, baoHiemTick: 4000, nganSachLenh: 200000,
    khe: { ten: 'tay_gap', phuongAn: ['TAY_DAI', 'CHAN_NHANH'] },
    // ĐỀ quyết định khối nằm ở đâu — đây là chỗ "part là đề bài" được kiểm
    de: {
      lech: { ten: 'khối lệch khỏi hàng (phải với tới)', khoi: [{ x: 4, y: 2 }] },
      thang: { ten: 'khối nằm thẳng trên hàng', khoi: [{ x: 4, y: 3 }] }
    }
  };

  /** Tập hàm mà một phương án được dùng — "part mở API".
   *  CHAN_NHANH KHÔNG có `item_here()`: nhanh nhưng MÙ, phải chạy theo lịch.
   *  Bánh xe (OMNI/XICH) không mở hay khoá hàm nào — nó chỉ đổi giá đi và giá quay. */
  function apiTheoPhuongAn(pa) {
    var p = chuanPhuongAn(pa);
    var ds = ['move', 'turn_left', 'turn_right', 'pick', 'drop', 'wait',
      'huong', 'item_here', 'dang_cam', 'pos_x', 'pos_y'];
    if (p.tayGap === 'CHAN_NHANH') ds = ds.filter(function (t) { return t !== 'item_here'; });
    var o = {};
    ds.forEach(function (t) { o[t] = tam; });
    return o;
  }


  /** Chạy một trận v0.2: bốn chương trình chạy SONG SONG, mỗi tick mỗi robot
   *  được đúng một hành động. Dùng `chayCodeGen` để tạm dừng chương trình giữa
   *  chừng — đây là lý do nhân chạy code phải là generator. */
  function chamTranV02(luat, codeA, codeB, tuyChon) {
    tuyChon = tuyChon || {};
    var dongHo = tuyChon.dongHo || luat.dongHo;                   // luật: hết giờ thì trận dừng
    var hanAnToan = tuyChon.baoHiemTick || luat.baoHiemTick;      // không phải luật: chỉ chống treo máy
    var gioiHan = Math.min(dongHo, hanAnToan);
    var phuongAn = {};                              // khe chọn đề: luật v0.3 (1 khe) / v0.4 (2 khe)
    Object.keys(tuyChon.phuongAn || {}).forEach(function (d) { phuongAn[d] = chuanPhuongAn(tuyChon.phuongAn[d]); });
    var thuVien = tuyChon.thuVien || THU_VIEN;
    var chiPhi = tuyChon.chiPhiThuVien || {};
    var hanO = tuyChon.hanO === undefined ? luat.hanO : tuyChon.hanO;   // hạn ô nhớ của đề

    var robots = [];
    function them(doi, chiSo, code) {
      var xp = luat.xuatPhat[doi][chiSo];
      var oNho = demO(code, chiPhi);
      var quaHan = (hanO !== undefined && hanO !== null) && oNho > hanO;
      var rb = {
        doi: doi, chiSo: chiSo, ten: doi + '-R' + (chiSo + 1),
        st: { x: xp.x, y: xp.y, huong: xp.huong },
        oNho: oNho, hanO: hanO === undefined ? null : hanO,
        gen: null,
        gtGui: undefined, dangDi: 0, choThem: 0, demHanhDong: 0, xong: quaHan, cam: false,
        chanDoan: [], loi: null, soBuoc: 0
      };
      if (quaHan) {
        // Ô NHỚ ĐẦY: robot không được nạp chương trình — đây là LUẬT của đề, không phải lỗi code
        rb.chanDoan.push('memory-full');
        rb.loi = {
          loai: 'memory-full',
          thongDiep: 'Chương trình ' + oNho + ' ô, hạn của đề là ' + hanO +
            ' ô. Viết gọn lại: gom phần lặp thành một hàm rồi gọi.'
        };
      } else {
        rb.gen = core.chayCodeGen(thuVien + '\n\n' + code, apiTheoPhuongAn(phuongAn[doi]),
          { nganSachLenh: tuyChon.nganSachLenh || luat.nganSachLenh });
      }
      robots.push(rb);
    }
    them('A', 0, codeA.R1); them('B', 0, codeB.R1);
    them('A', 1, codeA.R2); them('B', 1, codeB.R2);

    var conLai = luat.khoi.map(function (k) { return { x: k.x, y: k.y, quaTram: false }; });
    var diem = { A: 0, B: 0 };
    var chanDoan = [], khung = [], tick = 0, ketThuc = null;

    function timKhoi(o, x, y) {
      for (var i = 0; i < o.length; i++) if (o[i].x === x && o[i].y === y) return i;
      return -1;
    }
    function laNha(doi, x, y) { return luat.nha[doi].x === x && luat.nha[doi].y === y; }
    function laTram(doi, x, y) { return luat.tram[doi].x === x && luat.tram[doi].y === y; }
    function trongVungGiua(x) { return x >= luat.vungGiua.tu && x <= luat.vungGiua.den; }
    function duocVao(rob, x, y) {
      if (x < 0 || y < 0 || x >= luat.rong || y >= luat.cao) return false;
      if (rob.chiSo === 1 && trongVungGiua(x)) return false;   // R2 không được vào vùng giữa
      return true;
    }

    function diMotBuoc(rob) {
      var v = core.VEC_TOA[rob.st.huong];
      var nx = rob.st.x + v[0], ny = rob.st.y + v[1];
      if (duocVao(rob, nx, ny)) { rob.st.x = nx; rob.st.y = ny; }
      else { chanDoan.push(rob.ten + ':bi-chan@' + nx + ',' + ny); }
    }
    function doPick(rob, x, y) {
      var i = timKhoi(conLai, x, y);
      if (i >= 0 && !rob.cam) { conLai.splice(i, 1); rob.cam = true; rob.gtGui = 1; }
      else { rob.gtGui = 0; chanDoan.push(rob.ten + ':pick-hut@' + x + ',' + y); }
    }
    /** Ô mà lệnh pick() nhắm tới: ô đang đứng, và với TAY_DAI thì thêm ô TRƯỚC MẶT. */
    function oNhamToi(rob) {
      var ds = [{ x: rob.st.x, y: rob.st.y }];
      if ((phuongAn[rob.doi] || {}).tayGap === 'TAY_DAI') {
        var v = core.VEC_TOA[rob.st.huong];
        ds.push({ x: rob.st.x + v[0], y: rob.st.y + v[1] });
      }
      for (var i = 0; i < ds.length; i++) if (timKhoi(conLai, ds[i].x, ds[i].y) >= 0) return ds[i];
      return ds[0];
    }
    function doDrop(rob) {
      if (!rob.cam) { rob.gtGui = 0; chanDoan.push(rob.ten + ':drop-rong'); return; }
      var oDaCoKhoi = timKhoi(conLai, rob.st.x, rob.st.y) >= 0;
      // Giao hàng: CHỈ R2, ở NHÀ, và khối phải đã qua trạm giao
      if (rob.chiSo === 1 && laNha(rob.doi, rob.st.x, rob.st.y)) {
        rob.cam = false; diem[rob.doi]++; rob.gtGui = 1; return;
      }
      if (oDaCoKhoi) { rob.gtGui = 0; chanDoan.push(rob.ten + ':o-da-co-khoi@' + rob.st.x + ',' + rob.st.y); return; }
      var k = { x: rob.st.x, y: rob.st.y, quaTram: rob.quaTram || laTram(rob.doi, rob.st.x, rob.st.y) };
      conLai.push(k); rob.cam = false; rob.quaTram = false; rob.gtGui = 1;
    }

    function traLoi(rob, ten, ts) {
      switch (ten) {
        case 'pos_x': return rob.st.x;
        case 'pos_y': return rob.st.y;
        case 'huong': return { B: 0, D: 1, N: 2, T: 3 }[rob.st.huong];
        case 'item_here': return timKhoi(conLai, rob.st.x, rob.st.y) >= 0 ? 1 : 0;
        case 'dang_cam': return rob.cam ? 1 : 0;
      }
      return 0;
    }

    /** Rút chương trình của một robot tới khi nó YÊU CẦU một hành động.
     *  KHÔNG thực hiện hành động ở đây — chỉ gom lại để cả tick giải quyết một lượt,
     *  nhờ vậy mới xử được tranh chấp công bằng (không phụ thuộc thứ tự robot). */
    function layHanhDong(rob) {
      if (rob.xong) return null;
      if (rob.choThem > 0) { rob.choThem--; return { rob: rob, loai: 'cho' }; }   // TAY_DAI: bước đi tốn 2 tick
      if (rob.dangDi > 0) { rob.dangDi--; rob.soBuoc++; return { rob: rob, loai: 'move' }; }
      while (true) {
        var r;
        try { r = rob.gen.next(rob.gtGui); }
        catch (e) {
          rob.xong = true;
          if (e && e.cuaGame) {
            var loai = e.loai, td = e.thongDiep || e.message;
            // Gọi hàm mà PHƯƠNG ÁN không có → nói rõ là chưa mở, đừng để thành lỗi lạ
            if (loai === 'runtime-error') {
              var mTen = /tên "([^"]+)"/.exec(td || '');
              var co = apiTheoPhuongAn(phuongAn[rob.doi]);
              if (mTen && !co[mTen[1]] && apiTheoPhuongAn('TAY_DAI')[mTen[1]]) {
                loai = 'locked-command';
                td = 'Phương án ' + ((phuongAn[rob.doi] || {}).tayGap || 'mặc định') +
                  ' không có "' + mTen[1] + '()".';
              }
            }
            rob.chanDoan.push(loai); rob.loi = { loai: loai, thongDiep: td };
          }
          else throw e;
          return null;
        }
        rob.gtGui = undefined;
        if (r.done) { rob.xong = true; return null; }
        var ten = r.value.ten, ts = r.value.thamSo;
        if (HAM_TRUY_VAN[ten]) { rob.gtGui = traLoi(rob, ten, ts); continue; }
        switch (ten) {
          case 'move': {
            var n = Math.floor(ts[0] === undefined ? 1 : ts[0]);
            if (!(n > 0)) { rob.gtGui = 0; continue; }
            rob.dangDi = n - 1; rob.soBuoc++; return { rob: rob, loai: 'move' };
          }
          case 'turn_left': rob.soBuoc++; return { rob: rob, loai: 'turn_left' };
          case 'turn_right': rob.soBuoc++; return { rob: rob, loai: 'turn_right' };
          case 'wait': rob.soBuoc++; return { rob: rob, loai: 'wait' };
          case 'pick': rob.soBuoc++; var o = oNhamToi(rob); return { rob: rob, loai: 'pick', x: o.x, y: o.y };
          case 'drop': rob.soBuoc++; return { rob: rob, loai: 'drop' };
          default: throw new Error('Lệnh lạ trong luật v0.2: ' + ten);
        }
      }
    }

    /** YÊU CẦU NHẶT nào thắng khi nhiều robot nhặt cùng lúc — bọc luật ở ngoài,
     *  trả về chính YÊU CẦU (không phải robot) để bên gọi so cho đúng. */
    function chonYeuCauThang(x, nhom) {
      var thangRob = chonNguoiThangTie(luat, x, nhom.map(function (yc) { return yc.rob; }));
      if (!thangRob) return null;
      for (var i = 0; i < nhom.length; i++) if (nhom[i].rob === thangRob) return nhom[i];
      return null;
    }

    /** Giải quyết cả tick: đi/quay/chờ → thả → nhặt (có xử tranh chấp). */
    function giaiQuyetTick(ds) {
      ds.forEach(function (yc) {
        var p = phuongAn[yc.rob.doi] || {};
        if (yc.loai === 'move') {
          diMotBuoc(yc.rob); yc.rob.gtGui = 0;
          // TAY_DAI: thân nặng — mỗi bước đi 2 tick · OMNI: đi chậm, mỗi bước 2 tick
          if (p.tayGap === 'TAY_DAI' || p.banhXe === 'OMNI') yc.rob.choThem = 1;
        }
        else if (yc.loai === 'turn_left' || yc.loai === 'turn_right') {
          yc.rob.st.huong = (yc.loai === 'turn_left' ? core.TRAI : core.PHAI)[yc.rob.st.huong];
          yc.rob.gtGui = 0;
          // XICH: quay chậm — mỗi lần quay 2 tick
          if (p.banhXe === 'XICH') yc.rob.choThem = 1;
        }
        else if (yc.loai === 'wait') { yc.rob.gtGui = 0; }
      });
      ds.forEach(function (yc) { if (yc.loai === 'drop') doDrop(yc.rob); });
      var theO = {};
      ds.forEach(function (yc) {
        if (yc.loai !== 'pick') return;
        var k = yc.x + ',' + yc.y;
        (theO[k] = theO[k] || []).push(yc);
      });
      Object.keys(theO).forEach(function (k) {
        var nhom = theO[k], thang = chonYeuCauThang(nhom[0].x, nhom);
        nhom.forEach(function (yc) {
          if (yc === thang) doPick(yc.rob, yc.x, yc.y);
          else { yc.rob.gtGui = 0; chanDoan.push(yc.rob.ten + ':pick-hut@' + yc.x + ',' + yc.y); }
        });
      });
    }

    function chup() {
      var o = { tick: tick, diem: { A: diem.A, B: diem.B }, conLai: [], robot: {} };
      conLai.forEach(function (k) { o.conLai.push({ x: k.x, y: k.y, quaTram: k.quaTram }); });
      robots.forEach(function (rb) {
        o.robot[rb.ten] = { x: rb.st.x, y: rb.st.y, huong: rb.st.huong, cam: rb.cam, xong: rb.xong };
      });
      return o;
    }
    khung.push(chup());

    while (tick < gioiHan) {
      var conChay = false, yeuCau = [];
      for (var i = 0; i < robots.length; i++) {
        if (!robots[i].xong) conChay = true;
        var yc = layHanhDong(robots[i]);
        if (yc) yeuCau.push(yc);
      }
      giaiQuyetTick(yeuCau);
      tick++;
      khung.push(chup());
      if (diem.A + diem.B >= luat.khoi.length) { ketThuc = 'het-khoi'; break; }
      if (!conChay) { ketThuc = 'xong-het'; break; }
    }

    // Vì sao dừng? Hết ĐỒNG HỒ TRẬN (luật) hay chạm HẠN AN TOÀN (không phải luật)
    if (!ketThuc) {
      if (tick >= hanAnToan) {
        ketThuc = 'het-han';
        robots.forEach(function (rb) {
          if (!rb.xong) {
            rb.xong = true;
            rb.chanDoan.push('qua-tick');
            rb.loi = { loai: 'qua-tick', thongDiep: 'Chạm hạn an toàn ' + hanAnToan + ' tick — chương trình chưa xong.' };
          }
        });
      } else {
        ketThuc = 'het-gio';   // hết đồng hồ trận: dừng bình thường, ai nhiều điểm hơn thì thắng
      }
    }

    var camDem = 0;
    robots.forEach(function (rb) { if (rb.cam) camDem++; });

    var thang = diem.A > diem.B ? 'A' : (diem.B > diem.A ? 'B' : 'hòa');
    return {
      luat: luat.ten, diem: diem, diemA: diem.A, diemB: diem.B, thang: thang,
      lyDo: 'A giao ' + diem.A + ' khối · B giao ' + diem.B + ' khối',
      ketThuc: ketThuc, tick: tick, khung: khung, chanDoan: chanDoan,
      xong: robots.map(function (rb) {
        return {
          ten: rb.ten, xong: rb.xong, loi: rb.loi, chanDoan: rb.chanDoan,
          oNho: rb.oNho, hanO: rb.hanO
        };
      }),
      baoToan: diem.A + diem.B + conLai.length + camDem
    };
  }

  /** Chạy một trận theo LUẬT v0.3: mỗi đội chọn MỘT phương án cho khe, rồi viết
   *  chương trình theo phương án đó. `de` quyết định khối nằm ở đâu. */
  function chamTranV03(de, doiA, doiB, tuyChon) {
    tuyChon = tuyChon || {};
    var luat = Object.assign({}, LUAT_V03, { khoi: de.khoi, ten: LUAT_V03.ten + ' · đề "' + de.ten + '"' });
    return chamTranV02(luat,
      { R1: doiA.R1, R2: doiA.R2 }, { R1: doiB.R1, R2: doiB.R2 },
      Object.assign({}, tuyChon, {
        phuongAn: { A: doiA.phuongAn, B: doiB.phuongAn },
        thuVien: THU_VIEN_V03
      }));
  }

  /* ==========================================================================
     LUẬT TRẬN v0.4 — THÊM HAI THỨ, KHÔNG ĐỔI GÌ CỦA v0.3:

     1. KHE THỨ HAI · bánh xe
          OMNI : quay tại chỗ 1 tick        ← thêm
                 nhưng mỗi bước đi 2 tick   ← bỏ tốc độ thẳng
          XICH : đi thẳng 1 tick            ← thêm tốc độ thẳng
                 nhưng mỗi lần quay 2 tick  ← bỏ khả năng quay nhanh

     2. Ô NHỚ CHƯƠNG TRÌNH — loại tiền tệ thứ ba của GDD §6.2, nay có răng:
        mỗi DÒNG LỆNH của người chơi là một ô, và dùng hàm thư viện nào thì trả
        ô cho hàm đó. Vượt hạn của đề thì robot KHÔNG được nạp (memory-full).
        Đề "ô nhớ hẹp" vì thế dạy viết HÀM thay vì copy-paste.
     ========================================================================== */

  var LUAT_V04 = {
    ten: 'Luật trận v0.4 — hai khe chọn đề + ô nhớ chương trình',
    rong: 11, cao: 7, truc: 5,
    nha: { A: { x: 0, y: 3 }, B: { x: 10, y: 3 } },
    tram: { A: { x: 3, y: 3 }, B: { x: 7, y: 3 } },
    vungGiua: { tu: 4, den: 6 },
    xuatPhat: {
      A: [{ x: 2, y: 3, huong: 'D' }, { x: 1, y: 3, huong: 'D' }],
      B: [{ x: 8, y: 3, huong: 'T' }, { x: 9, y: 3, huong: 'T' }]
    },
    dongHo: 1800, baoHiemTick: 4000, nganSachLenh: 200000,
    khe: [
      { ten: 'tay_gap', phuongAn: ['TAY_DAI', 'CHAN_NHANH'] },
      { ten: 'banh_xe', phuongAn: ['OMNI', 'XICH'] }
    ],
    chiPhiThuVien: { go_to: 6, quay_ve: 3 },   // dùng hàm thư viện thì trả ô nhớ (một lần)
    de: {
      thang: { ten: 'khối nằm thẳng trên hàng', khoi: [{ x: 4, y: 3 }] },
      lech: { ten: 'khối lệch khỏi hàng', khoi: [{ x: 4, y: 2 }] }
    }
  };

  /** Một đội chọn gì: nhận cả chuỗi (kiểu v0.3) lẫn object hai khe (v0.4). */
  function chuanPhuongAn(pa) {
    if (!pa) return { tayGap: null, banhXe: null };
    if (typeof pa === 'string') return { tayGap: pa, banhXe: null };
    return { tayGap: pa.tayGap || null, banhXe: pa.banhXe || null };
  }

  /** Đếm Ô NHỚ CHƯƠNG TRÌNH: số dòng lệnh + chi phí hàm thư viện có dùng. */
  function demO(code, chiPhi) {
    chiPhi = chiPhi || {};
    var so = 0;
    String(code == null ? '' : code).split('\n').forEach(function (d) {
      if (d.replace(/#.*$/, '').trim()) so++;
    });
    Object.keys(chiPhi).forEach(function (ten) {
      if (new RegExp('\\b' + ten + '\\s*\\(').test(String(code))) so += chiPhi[ten];
    });
    return so;
  }



  /** Chạy một trận theo LUẬT v0.4: HAI khe chọn đề + hạn ô nhớ chương trình. */
  function chamTranV04(de, doiA, doiB, tuyChon) {
    tuyChon = tuyChon || {};
    var luat = Object.assign({}, LUAT_V04, {
      khoi: de.khoi,
      ten: LUAT_V04.ten + ' · đề "' + de.ten + '"',
      hanO: de.hanO === undefined ? null : de.hanO
    });
    return chamTranV02(luat,
      { R1: doiA.R1, R2: doiA.R2 }, { R1: doiB.R1, R2: doiB.R2 },
      Object.assign({}, tuyChon, {
        phuongAn: {
          A: { tayGap: doiA.tayGap, banhXe: doiA.banhXe },
          B: { tayGap: doiB.tayGap, banhXe: doiB.banhXe }
        },
        thuVien: THU_VIEN_V03,
        chiPhiThuVien: LUAT_V04.chiPhiThuVien,
        hanO: de.hanO === undefined ? null : de.hanO
      }));
  }

  /* ------------------------------------------------------------------ API ra */

  var API = {
    LUAT: LUAT, chayLoTrinh: chayLoTrinh, chamTran: chamTran, soBuocQuayPhai: soBuocQuayPhai,
    LUAT_V02: LUAT_V02, chamTranV02: chamTranV02, THU_VIEN: THU_VIEN,
    chonNguoiThangTie: chonNguoiThangTie,
    LUAT_V03: LUAT_V03, chamTranV03: chamTranV03, THU_VIEN_V03: THU_VIEN_V03,
    LUAT_V04: LUAT_V04, chamTranV04: chamTranV04,
    chuanPhuongAn: chuanPhuongAn, demO: demO,
    apiTheoPhuongAn: apiTheoPhuongAn
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.TranDau = API;
})();
