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
   một hàm (của em hoặc của màn) trên một sân thử CỐ ĐỊNH do người chơi sắp (mặc định 5×5 trống,
   xe ở giữa (2, 2) quay lên). Để thử bản đang soạn của một hàm của em, đưa bản đó vào mảng hamCuaEm.
   tuyChon.sanThu = { rong: 5, cao: 5, batDau: { x, y, huong }, vat: [{ x, y }], tuong: [{ x, y }] }
   (không truyền thì dùng SAN_THU_MAC_DINH; chuanSanThu() sửa số liệu bậy: ô ngoài sân, ô trùng,
   tường đè lên xe, vật đè lên tường đều bị bỏ). Vật ĐƯỢC nằm dưới xe (để thử pick() ngay tại chỗ).
   Tọa độ là tọa độ THẬT của sân thử: x sang phải,
   y xuống dưới, (0, 0) là góc trên trái; không còn phép dịch tọa độ.
   - Tường chặn như sân thường (san-hoc 'dam-tuong', vat = 'tuong'); ra khỏi sân là 'dam-tuong'
     với vat = 'ngoai-san', lời "ra ngoài sân thử".
   - VẬT (khối hàng): chuẩn hóa rồi trả lại ở `kq.sanThu.vat`, và được đưa xuống SanHoc.chay như một
     lớp riêng cạnh `san`. Màn có tay gắp (man.hamGoc có arm_down / arm_up / grab / release) thì vật
     là vật thật: học sinh thử pick() / drop() trong Xưởng được; vết có `vat` và `robot.tay` từng nhịp,
     `kq.vat` là trạng thái cuối. Màn không có tay gắp thì vật chỉ là ô có vật — KHÔNG chặn đường.
     Xe đi qua ô vật không bị chặn. Sân thử chưa có ô đích nên không có điều kiện thắng.
   tuyChon.sanThu.mau = [{ x, y, mau: 'red'|'green'|'blue'|'yellow' (hay 'r' 'g' 'b' 'y') }] (tuỳ chọn): ô sàn màu cho color() trong Xưởng (bỏ ô tường, ô ngoài sân, ô trùng);
   vật trong sân thử cũng có thể mang `mau`. Chuẩn hóa trả lại ở `kq.sanThu.mau`.
   tuyChon.sanThu.thung = [{ x, y }] (tuỳ chọn): thùng nặng trong sân thử, chuẩn hóa như vật (ô ngoài sân, ô trùng, ô tường, ô xe bị bỏ);
   chỉ có nghĩa với màn có tấm đẩy (hamGoc có push). Kết quả có thêm `thung` (trạng thái cuối).
   Trả về { vet, robot: {x,y,huong}, batDau, sanThu, soNhip, chanDoan, py, anhXa, tay, vat, thung }.
   Chỉ chặn bởi lỗi khung thuộc về chính hàm này (tràn ô của nó) hoặc lỗi chung
   (trùng tên); lỗi của chương trình chính hay của hàm khác không cản.

   TAY GẮP / MỤC TIÊU dua-vat (man.mucTieu === 'dua-vat'; luật đầy đủ ở san-hoc.js):
   - thắng khi MỌI vật nằm trên ô đích; ô đích và vật nằm trong sân (ký hiệu D, o, X).
   - kết quả có thêm `vatBanDau` [{id,x,y,trangThai}], `dich` [{x,y}] (của sân đang xem) và, ở mỗi mục
     theoSan, `tay` / `vat` cuối cùng; vết nhịp có `robot.tay` và `vat` (xem san-hoc.js).
   - vật vỡ thì chương trình dừng ngay cuối nhịp đó.

   CẢM BIẾN KHOẢNG CÁCH (chương khoang-cach; luật đầy đủ ở san-hoc.js): hamGoc có front_clear / left_clear / right_clear thì robot có cảm biến
   (man.robot.camBien = [{ ma:'khoang-cach', o:'hong' }]). Mỗi lần đọc là một mục lệnh trong vết có `docCamBien` { ma:'doc-cam-bien', ham, tu, huong, o,
   trong, vat, nhip } (cũng nằm trong suKien của nhịp kế tiếp), để giao diện nháy cảm biến. Mã chẩn đoán mới:
   - vong-vo-han (lỗi): vòng while chạy mãi — hoặc nhân bắt vòng không có nhịp (loaiCore 'infinite-loop'), hoặc robot chạy quá nhipToiDa mà chương
     trình có `while` (loaiCore 'qua-nhieu-nhip'); `cho` trỏ tới dòng while. Chương trình KHÔNG có while mà quá nhịp thì vẫn là qua-nhieu-nhip.
   - chua-gan-cam-bien (lỗi): gọi front_clear / left_clear / right_clear mà màn không cho (robot chưa gắn cảm biến, hay màn này chưa mở hàm đó).
   NHIỀU SÂN: mặc định soNhip = số nhịp của sân DÀI NHẤT. man.nhipTheo === 'tong' thì soNhip = TỔNG nhịp mọi sân (dùng cho sao.nhip), để chương trình
   viết cứng số bước (bước thừa chỉ húc tường ở sân ngắn) mất sao nhịp. Kết quả luôn có thêm nhipMax, nhipTong.

   CẢM BIẾN MÀU (chương mau; luật đầy đủ ở san-hoc.js, phần CẢM BIẾN MÀU): hamGoc có color thì robot có cảm biến màu (man.robot.camBien = [{ ma:'mau', o:'hong' }],
   có thể kèm khoang-cach ở màn phối hợp). color() trả chuỗi "red" | "green" | "blue" | "yellow" | "none" của ô dưới xe (vật có màu nằm trên sàn dưới xe thì trả
   màu vật). Màn khai lớp màu bằng man.mau (mảng chuỗi cùng cỡ sân, ký tự r g b y) và man.vatMau (màu từng vật); màn nhiều sân thì hai trường này là mảng song song
   với man.san (như batDau). Ô đích có màu chỉ nhận vật cùng màu. Mỗi lần đọc là một mục lệnh trong vết có `docCamBien` { cam:'mau', ham:'color', tu, o, mau, nguon:'san'|'vat', idVat, nhip }.
   Kết quả có `mauO` (lớp màu sàn của sân đang xem, null nếu không màu), mỗi mục theoSan cũng vậy; vật / đích có `mau` khi có màu. Mã chẩn đoán mới:
   - chua-gan-cam-bien (lỗi): gọi color() khi màn không cho (như cảm biến khoảng cách; lời nói rõ "cảm biến màu").
   - ten-mau-sai (lỗi): một chuỗi trong phép so sánh gần giống tên màu nhưng không đúng (chữ hoa chữ thường, gõ nhầm một chữ): color() chỉ trả chữ thường
     "red", "green", "blue", "yellow", "none". Chỉ báo khi chưa thắng.
   - mau-thieu-nhay (lỗi): viết red / green / blue / yellow / none không có dấu nháy (Python tưởng là tên biến).
   - dat-sai-mau (lỗi): thả vật xuống ô đích khác màu (vật vẫn nằm đó, nhặt lên lại được).
   NAM CHÂM (chương nam-cham; luật đầy đủ ở san-hoc.js, phần NAM CHÂM): hamGoc có magnet_on / magnet_off thì robot có tay nam châm (man.robot.tay = 'nam-cham');
   có front_metal thì cảm biến khoảng cách ở hông còn đo được chất vật (cảm biến từ). Màn khai chất vật bằng man.vatChat (mảng chuỗi cùng cỡ sân, s = sắt, g hay '.' = gỗ,
   đặt đúng ô có vật; màn nhiều sân thì mảng song song với man.san) và man.vatCan = 'sat' nếu chỉ vật sắt phải về đích (vật gỗ ở đâu cũng được). Kết quả có
   thêm `namCham` { bat, cam } (trạng thái cuối, null nếu robot không có tay nam châm); vết nhịp có robot.namCham; vật có `chat`. Sân thử của Xưởng: vật có thể mang chat: 'sat'.
   man.vatThem = [{ x, y, chat?, mau? }] (màn nhiều sân: mảng song song với man.san) đặt thêm vật ở ô không viết được bằng ký hiệu o, vd ô băng chuyền hay bậc thang (cfg.vat của SanHoc).
   Mã chẩn đoán mới: tha-bi-chan (lỗi: magnet_off() không thả được vì ô trước mũi xe bị chặn), magnet-goi-lai (lỗi: hai lệnh nam châm cùng nhịp), hut-go (thông tin: nam châm bật mà
   vật đầu tiên trước mặt là gỗ); chua-gan-cam-bien nói thêm "cảm biến từ" cho front_metal; chua-dua-vat nói "vật sắt" khi man.vatCan = 'sat'; quen-wait tính magnet_on / magnet_off là lệnh tay.
   TẤM ĐẨY / THÙNG NẶNG / MỤC TIÊU day-thung (man.mucTieu === 'day-thung'; luật đầy đủ ở san-hoc.js):
   - thắng khi MỌI thùng nặng (ký hiệu H, h) nằm trên ô đích (D, X, h). Kết quả có thêm `thung`, `thungBanDau` [{id,x,y}] (cuối / đầu), ở
     mỗi mục theoSan cũng vậy; vết nhịp có `thung` (vị trí thùng cuối nhịp) và sự kiện 'thung-di' {id, tu, den, nguon:'xe'|'truot'|'bang'}.
   - thùng kẹt góc → dừng ngay cuối nhịp đó (chẩn đoán thung-ket).
   Mã chẩn đoán: thung-chan, thung-ket (lỗi), push-goi-lai (lỗi), day-hut (thông tin), day-dung-yen (thông tin), chua-day-thung, và dam-tuong với
   vat 'thung-nang' (xe không có tấm đẩy, hay lùi / trượt vào thùng). Các mã khác:
   quen-wait, banh-goi-lai, tay-goi-lai, dam-tuong, tay-vuong, vat-vo, o-co-vat,
   kep-hut (thông tin), xich-quay-do (thông tin: xe xích quay dở bị mất), omni-khong-cheo (thông tin: xe omni không đi chéo, lệnh bánh cùng nhịp với slide bị bỏ), slide-goi-lai (hai lệnh slide cùng nhịp), chua-toi-co, chua-dua-vat, nhen-khong-buoc (nhện chạy xong chưa bước lần nào), tran-khung,
   def-trong-chuong-trinh, ham-trung-ten, ham-chua-co, loi-cu-phap, loi-thut-le,
   loi-chay, qua-nhieu-nhip, ham-man-che-ham-em (thông tin).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var SanHoc = laNode ? require('./san-hoc.js') : window.SanHoc;
  var KhungCode = laNode ? require('./khung-code.js') : window.KhungCode;

  var LOAI_VAT = { 'tuong': 'tường', 'ngoai-san': 'ngoài sân', 'bac-thang': 'bậc thang (xe bánh không leo được)', 'thung-nang': 'thùng nặng' };
  // lý do một thùng nặng không đẩy được (san-hoc.js 'thung-chan')
  // lý do magnet_off() không thả được vật (san-hoc.js 'tha-bi-chan')
  var LY_THA = { 'tuong': 'tường', 'ngoai-san': 'mép sân', 'bac-thang': 'bậc thang', 'thung-nang': 'thùng nặng', 'vat': 'ô đã có một vật nằm sẵn' };
  var LY_DO_THUNG = { 'tuong': 'tường', 'ngoai-san': 'mép sân', 'bac-thang': 'bậc thang', 'thung-nang': 'một thùng nặng khác', 'xe': 'chính chiếc xe' };
  // Sân thử mặc định của Xưởng hàm: 5×5 trống, xe ở giữa quay lên (hướng 0).
  var SAN_THU_MAC_DINH = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [], thung: [] };
  var MAU_CHU = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };       // tên màu → ký tự trong lớp màu của SanHoc
  function chuanMau(m) {                                                // 'red' | 'r' … → tên màu, hoặc null
    if (typeof m !== 'string') return null;
    if (MAU_CHU[m]) return m;
    for (var k in MAU_CHU) if (MAU_CHU[k] === m) return k;
    return null;
  }
  var CO_TOI_DA = 12;

  /** Chuẩn hóa cấu hình sân thử (xem đầu tệp). Luôn trả về bản mới, hợp lệ. */
  function chuanSanThu(c) {
    c = c || {};
    function so(v, mac, lo, hi) { v = Math.floor(Number(v)); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : mac; }
    var rong = so(c.rong, 5, 1, CO_TOI_DA), cao = so(c.cao, 5, 1, CO_TOI_DA);
    var b = c.batDau || {};
    var bd = { x: so(b.x, Math.floor((rong - 1) / 2), 0, rong - 1), y: so(b.y, Math.floor((cao - 1) / 2), 0, cao - 1), huong: ((so(b.huong, 0, 0, 1e6) % 4) + 4) % 4 };
    var thay = {};
    thay[bd.x + ',' + bd.y] = true;                              // ô có xe: không đặt tường (vật thì được)
    function loc(ds) {
      var kq = [];
      (Array.isArray(ds) ? ds : []).forEach(function (o) {
        if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') return;
        var x = Math.floor(o.x), y = Math.floor(o.y), k = x + ',' + y;
        if (x < 0 || y < 0 || x >= rong || y >= cao || thay[k]) return;
        thay[k] = true; kq.push({ x: x, y: y });
      });
      return kq;
    }
    var tuong = loc(c.tuong);
    var thung = loc(c.thung);                                    // thùng nặng: không đè tường, không đè xe
    delete thay[bd.x + ',' + bd.y];                              // vật có thể nằm ngay dưới xe
    var vat = loc(c.vat);                                        // tường được ưu tiên hơn vật
    // màu: vật có thể mang màu (mau: 'red' | 'r' …); ô sàn màu { x, y, mau } (không đè tường; mỗi ô một màu, ô sau không đè ô trước)
    var tuongKhoa = {};
    tuong.forEach(function (o) { tuongKhoa[o.x + ',' + o.y] = true; });
    (Array.isArray(c.vat) ? c.vat : []).forEach(function (src) {
      if (!src || typeof src.x !== 'number' || typeof src.y !== 'number') return;
      var mv = chuanMau(src.mau);
      if (!mv) return;
      vat.forEach(function (v) { if (v.x === Math.floor(src.x) && v.y === Math.floor(src.y) && !v.mau) v.mau = mv; });
    });
    var mauSan = [], daMau = {};
    (Array.isArray(c.mau) ? c.mau : []).forEach(function (o) {
      if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') return;
      var x = Math.floor(o.x), y = Math.floor(o.y), k = x + ',' + y, mo = chuanMau(o.mau);
      if (!mo || x < 0 || y < 0 || x >= rong || y >= cao || tuongKhoa[k] || daMau[k]) return;
      daMau[k] = true; mauSan.push({ x: x, y: y, mau: mo });
    });
    (Array.isArray(c.vat) ? c.vat : []).forEach(function (src) {            // chất vật (chương nam-cham): chat 'sat' | 'go'; mặc định gỗ, chỉ ghi lại khi là sắt
      if (!src || typeof src.x !== 'number' || typeof src.y !== 'number' || src.chat !== 'sat') return;
      vat.forEach(function (v) { if (v.x === Math.floor(src.x) && v.y === Math.floor(src.y)) v.chat = 'sat'; });
    });
    var kq = { rong: rong, cao: cao, batDau: bd, vat: vat, tuong: tuong, thung: thung };
    if (mauSan.length) kq.mau = mauSan;                          // chỉ có khi sân thử có ô màu (các sân thử cũ giữ nguyên dạng)
    return kq;
  }
  /** Lớp màu sàn của sân thử (mảng chuỗi r g b y / '.'), hoặc null nếu sân thử không có ô màu. */
  function lopMauSanThu(st) {
    if (!st.mau || !st.mau.length) return null;
    var rows = [];
    for (var y = 0; y < st.cao; y++) { var d = ''; for (var x = 0; x < st.rong; x++) d += '.'; rows.push(d); }
    st.mau.forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + MAU_CHU[o.mau] + rows[o.y].slice(o.x + 1); });
    return rows;
  }
  /** Sân thử dạng mảng chuỗi cho SanHoc ('.' sàn, '#' tường). */
  function hangSanThu(st) {
    var rows = [];
    for (var y = 0; y < st.cao; y++) {
      var d = '';
      for (var x = 0; x < st.rong; x++) d += '.';
      rows.push(d);
    }
    st.tuong.forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + '#' + rows[o.y].slice(o.x + 1); });
    return rows;
  }

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

  var TEN_MAU_VI = { red: 'đỏ (red)', green: 'xanh lá (green)', blue: 'xanh dương (blue)', yellow: 'vàng (yellow)', none: 'không màu (none)' };
  var TEN_MAU_HOP_LE = ['red', 'green', 'blue', 'yellow', 'none'];
  /** Khoảng cách sửa giữa a và b, tính cả đổi chỗ hai chữ liền nhau (bản OSA). */
  function khoangSua(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d.push([i]); }
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
      var cp = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cp);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  /** Các chuỗi trong phép so sánh (dòng có ==, != hay in) gần giống một tên màu nhưng không đúng tên nào. */
  function chuoiMauSai(dong) {
    var kq = [];
    dong.forEach(function (d, i) {
      var s = String(d).replace(/#.*$/, '');
      if (!/==|!=|\bin\b/.test(s)) return;
      var re = /(["'])((?:(?!\1).)*)\1/g, m;
      while ((m = re.exec(s))) {
        var t = m[2];
        if (TEN_MAU_HOP_LE.indexOf(t) >= 0) continue;
        var l = t.trim().toLowerCase();
        if (TEN_MAU_HOP_LE.some(function (n) { return l === n || (l.length > 2 && khoangSua(l, n) <= 1); })) kq.push({ dongPy: i + 1, chuoi: t });
      }
    });
    return kq;
  }

  /** Dòng Python (không tính chú thích) có phải câu lệnh while không. */
  function laDongWhile(s) { return /^\s*while\b/.test(String(s).replace(/#.*$/, '')); }
  function coWhile(g) { return g.dong.some(laDongWhile); }
  /** Dòng Python cuối cùng mà chương trình gọi một hàm gốc (để biết vòng nào đang chạy mãi). */
  function ultLenhPy(res) {
    for (var i = res.vet.length - 1; i >= 0; i--) if (res.vet[i].loai === 'lenh') return res.vet[i].dongPy;
    return 0;
  }
  /** Ánh xạ tới dòng while đang bao quanh dòng Python `dong` (hoặc chính nó); không thấy thì lấy while đầu tiên. */
  function viTriWhile(g, dong) {
    var ds = g.dong, j = Math.min(dong || 0, ds.length);
    function thut(s) { return /^\s*/.exec(s)[0].length; }
    if (j >= 1 && laDongWhile(ds[j - 1])) return g.anhXa[j] || null;
    if (j >= 1) {
      var t = thut(ds[j - 1]);
      for (var k = j - 1; k >= 1; k--) if (laDongWhile(ds[k - 1]) && thut(ds[k - 1]) < t) return g.anhXa[k] || null;
    }
    for (var q = 1; q <= ds.length; q++) if (laDongWhile(ds[q - 1])) return g.anhXa[q] || null;
    return g.anhXa[j] || null;
  }

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
    if (l && l.loai !== 'qua-nhieu-nhip' && l.loai !== 'infinite-loop') {
      var m = g.anhXa[l.dong] || null;
      var tn = /tên "([^"]+)"/.exec(l.thongDiep || '');
      if (l.loai === 'runtime-error' && tn && /^Chưa có biến hay hàm/.test(l.thongDiep) && SanHoc.laHamCamBien(tn[1]) && hamGoc.indexOf(tn[1]) < 0) {
        var dsCam = hamGoc.filter(function (t) { return SanHoc.laHamCamBien(t); });
        them('chua-gan-cam-bien', 'Ở ' + viTri(m) + ': ' + (dsCam.length
          ? 'màn này mới dùng được ' + dsCam.map(function (t) { return t + '()'; }).join(', ') + ', chưa có ' + tn[1] + '().'
          : 'robot này chưa gắn cảm biến ' + (SanHoc.CAM_MAU_HAM.indexOf(tn[1]) >= 0 ? 'màu' : SanHoc.CAM_TU_HAM.indexOf(tn[1]) >= 0 ? 'từ (kim loại)' : 'khoảng cách') + ' nên chưa có hàm ' + tn[1] + '().') +
          ' Hàm gốc dùng được ở màn này: ' + (hamGoc.length ? hamGoc.join(', ') : '(không có)') + '.', { ten: tn[1], cho: cho(m) });
      } else if (l.loai === 'runtime-error' && tn && /^Chưa có biến( hay hàm)? tên/.test(l.thongDiep) && SanHoc.MAU_TEN.concat(['none']).indexOf(tn[1]) >= 0 && hamGoc.indexOf('color') >= 0) {
        them('mau-thieu-nhay', 'Ở ' + viTri(m) + ': ' + tn[1] + ' đang viết không có dấu nháy nên Python tưởng đó là tên một biến hay một hàm và không tìm thấy. ' +
          'Tên màu là một chuỗi chữ, phải đặt trong dấu nháy: "' + tn[1] + '".', { ten: tn[1], cho: cho(m) });
      } else if (l.loai === 'runtime-error' && tn && /^Chưa có biến hay hàm/.test(l.thongDiep)) {
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
    if (l && l.loai === 'infinite-loop') {
      var mw = viTriWhile(g, l.dong);
      them('vong-vo-han', 'Ở ' + viTri(mw) + ': vòng while chạy mãi không dừng: điều kiện không bao giờ sai và bên trong không có lệnh nào cho robot chạy tiếp, nên chương trình bị ngắt. ' +
        'Xem lại điều kiện của vòng while và những gì nằm trong thân vòng.', { cho: cho(mw), loaiCore: 'infinite-loop' });
    } else if (l && l.loai === 'qua-nhieu-nhip' && coWhile(g)) {
      var mw2 = viTriWhile(g, ultLenhPy(res));
      them('vong-vo-han', 'Robot đã chạy quá ' + (res.nhipToiDa || man.nhipToiDa || 200) + ' nhịp mà vòng while vẫn chưa dừng (ở ' + viTri(mw2) + '): điều kiện không bao giờ sai.' +
        ' Xem lại điều kiện của vòng while, và xem trong thân vòng có lệnh nào làm điều kiện đổi không.', { cho: cho(mw2), loaiCore: 'qua-nhieu-nhip', nhip: res.nhip });
    } else if (l && l.loai === 'qua-nhieu-nhip') {
      them('qua-nhieu-nhip', 'Robot đã chạy quá ' + (res.nhipToiDa || man.nhipToiDa || 200) + ' nhịp' +
        (sanThu ? '. ' : ' mà chưa tới cờ. ') +
        'Xem chương trình có đoạn nào lặp mãi hoặc đi vòng không cần thiết không.', { nhip: res.nhip });
    }

    // --- các mốc trong lúc chạy
    var tuong = res.suKien.filter(function (e) { return e.ma === 'dam-tuong'; });
    if (tuong.length) {
      var e0 = tuong[0];
      var s2;
      if (sanThu) {
        s2 = e0.vat === 'thung-nang'
          ? 'Xe đâm vào thùng nặng ở nhịp ' + e0.nhip + ' nên đứng yên (vẫn mất một nhịp).' +
            (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
            (e0.coDay ? ' Tấm đẩy chỉ đẩy khi xe TIẾN thẳng vào thùng; lùi hay trượt thì thùng cản như tường.' : ' Xe không có tấm đẩy thì thùng nặng cản đường như tường: cần tấm đẩy để đẩy thùng nặng.')
          : e0.vat === 'ngoai-san'
          ? 'Xe đi ra ngoài sân thử (ở nhịp ' + e0.nhip + '). Đặt xe chỗ khác rồi thử lại.'
          : 'Xe đâm vào tường ở nhịp ' + e0.nhip + ' nên đứng yên (vẫn mất một nhịp).' +
            (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
            ' Đặt xe hoặc tường chỗ khác, rồi thử lại.';
      } else if (e0.vat === 'thung-nang') {
        s2 = 'Ở nhịp ' + e0.nhip + ', robot định ' + (e0.kieu === 'lui' ? 'lùi' : e0.kieu === 'truot' ? 'trượt' : 'đi') + ' vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng đó là thùng nặng nên nó đứng yên (vẫn mất một nhịp).' +
          (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
          (e0.coDay ? ' Tấm đẩy chỉ đẩy khi xe TIẾN thẳng vào thùng; lùi hay trượt thì thùng cản như tường.' : ' Xe không có tấm đẩy thì thùng nặng cản đường như tường: cần tấm đẩy để đẩy thùng nặng.');
      } else {
        s2 = 'Ở nhịp ' + e0.nhip + ', robot định đi vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng đó là ' +
          (LOAI_VAT[e0.vat] || e0.vat) + ' nên nó đứng yên (vẫn mất một nhịp).' +
          (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
          (man.loaiRobot === 'nhen' ? ' Kiểm tra lại hướng của lệnh go_* (nhện không quay, đi thẳng theo hướng em chọn).' : man.loaiRobot === 'omni' ? ' Kiểm tra lại robot đang quay mặt hướng nào: slide_left() và slide_right() tính theo hướng mặt của xe.' : ' Kiểm tra lại robot đang quay mặt hướng nào trước lệnh đi.');
      }
      them('dam-tuong', s2, { nhip: e0.nhip, den: e0.den, soLan: tuong.length });
    }
    var thungChan = res.suKien.filter(function (e) { return e.ma === 'thung-chan'; });
    if (thungChan.length) {
      var tc0 = thungChan[0], mtc = tc0.lenh ? (g.anhXa[tc0.lenh.dongPy] || null) : null;
      them('thung-chan', 'Ở nhịp ' + tc0.nhip + ', thùng ở ô (' + tc0.o.x + ', ' + tc0.o.y + ') không đẩy được vì ô sau nó, (' + tc0.den.x + ', ' + tc0.den.y + '), là ' +
        (LY_DO_THUNG[tc0.vat] || tc0.vat) + ': xe và thùng đứng yên (vẫn mất một nhịp).' +
        (thungChan.length > 1 ? ' Chuyện này xảy ra ' + thungChan.length + ' lần.' : '') +
        ' Xem lại hướng đẩy: thùng chỉ đi được vào ô trống.', { nhip: tc0.nhip, soLan: thungChan.length, cho: cho(mtc), kieu: tc0.kieu });
    }
    var thungKetSk = res.suKien.filter(function (e) { return e.ma === 'thung-ket'; });
    if (thungKetSk.length) {
      var tk0 = thungKetSk[0];
      them('thung-ket', 'Thùng kẹt vào góc ở ô (' + tk0.o.x + ', ' + tk0.o.y + ') từ nhịp ' + tk0.nhip + ', không đẩy ra được nữa nên chương trình dừng ở đó. ' +
        'Hai cạnh vuông góc của góc đó là tường hay mép sân; muốn thùng khỏi kẹt, đẩy nó theo hướng khác trước khi nó chạm góc.', { nhip: tk0.nhip, id: tk0.id, o: tk0.o });
    }
    var pushLai = res.suKien.filter(function (e) { return e.ma === 'push-goi-lai'; });
    if (pushLai.length) {
      var pl0 = pushLai[0], mpl = g.anhXa[pl0.dongPy] || null, mplt = pl0.truoc ? (g.anhXa[pl0.truoc.dongPy] || null) : null;
      them('push-goi-lai', 'Ở ' + viTri(mpl) + ': xe đã nhận lệnh push() (ở ' + viTri(mplt) + ') trong nhịp này rồi, nên lệnh push() này bị bỏ qua. ' +
        'Mỗi nhịp tấm đẩy chỉ đẩy mạnh một lần; wait() mới sang nhịp kế.', { cho: cho(mpl), choTruoc: cho(mplt), nhip: pl0.nhip });
    }
    var dayHut = res.suKien.filter(function (e) { return e.ma === 'day-hut'; });
    if (dayHut.length) {
      var dh0 = dayHut[0], mdh = dh0.lenh ? (g.anhXa[dh0.lenh.dongPy] || null) : null;
      cd.push({
        ma: 'day-hut', muc: 'thong-tin', nhip: dh0.nhip, soLan: dayHut.length, o: dh0.o, cho: cho(mdh),
        loi: 'Ở nhịp ' + dh0.nhip + ', push() không đẩy được gì: ô ngay trước mặt xe, (' + dh0.o.x + ', ' + dh0.o.y + '), không có thùng nặng.' +
          (dayHut.length > 1 ? ' Chuyện này xảy ra ' + dayHut.length + ' lần.' : '') + ' push() chỉ đẩy thùng nằm sát trước mặt xe.'
      });
    }
    var dayDungYen = res.suKien.filter(function (e) { return e.ma === 'day-dung-yen'; });
    if (dayDungYen.length) {
      var dy0 = dayDungYen[0], mdy = dy0.lenh ? (g.anhXa[dy0.lenh.dongPy] || null) : null, mdyp = dy0.push ? (g.anhXa[dy0.push.dongPy] || null) : null;
      cd.push({
        ma: 'day-dung-yen', muc: 'thong-tin', nhip: dy0.nhip, soLan: dayDungYen.length, cho: cho(mdy), choPush: cho(mdyp),
        loi: 'Ở nhịp ' + dy0.nhip + ': lệnh push() (ở ' + viTri(mdyp) + ') và lệnh ' + (dy0.lenh ? dy0.lenh.ten + '() (ở ' + viTri(mdy) + ') ' : 'bánh ') + 'nằm chung một nhịp, nên xe đứng yên và lệnh kia bị bỏ.' +
          (dayDungYen.length > 1 ? ' Chuyện này xảy ra ' + dayDungYen.length + ' lần.' : '') + ' Nhịp có push() chỉ đẩy, không đi.'
      });
    }
    var thaChan = res.suKien.filter(function (e) { return e.ma === 'tha-bi-chan'; });
    if (thaChan.length) {
      var tb0 = thaChan[0], mtb = tb0.lenh ? (g.anhXa[tb0.lenh.dongPy] || null) : null;
      them('tha-bi-chan', 'Ở nhịp ' + tb0.nhip + ', magnet_off() không thả được vật: ô ngay trước mũi xe, (' + tb0.o.x + ', ' + tb0.o.y + '), là ' + (LY_THA[tb0.vat] || tb0.vat) +
        ' nên vật vẫn dính ở nam châm (nam châm vẫn bật).' + (thaChan.length > 1 ? ' Chuyện này xảy ra ' + thaChan.length + ' lần.' : '') +
        ' Vật chỉ thả được xuống ô trống ngay trước mặt: xoay hay đi tới chỗ khác rồi thả.', { nhip: tb0.nhip, soLan: thaChan.length, o: tb0.o, vat: tb0.vat, cho: cho(mtb) });
    }
    var hutGo = res.suKien.filter(function (e) { return e.ma === 'hut-go'; });
    if (hutGo.length) {
      var hg0 = hutGo[0];
      cd.push({
        ma: 'hut-go', muc: 'thong-tin', nhip: hg0.nhip, soLan: hutGo.length, o: hg0.o, khoang: hg0.khoang,
        loi: 'Ở nhịp ' + hg0.nhip + ', nam châm đang bật nhưng vật đầu tiên trước mặt, ở ô (' + hg0.o.x + ', ' + hg0.o.y + '), là vật GỖ: nam châm chỉ hút vật sắt, và vật gỗ còn chắn đường hút của vật sắt đứng sau nó.' +
          (hutGo.length > 1 ? ' Chuyện này xảy ra ' + hutGo.length + ' lần.' : '') + ' Dùng front_metal() (nếu có) để biết trước mặt là sắt hay không.'
      });
    }
    var magnetLai = res.suKien.filter(function (e) { return e.ma === 'magnet-goi-lai'; });
    if (magnetLai.length) {
      var ml0 = magnetLai[0], mml = g.anhXa[ml0.dongPy] || null, mmlt = ml0.truoc ? (g.anhXa[ml0.truoc.dongPy] || null) : null;
      them('magnet-goi-lai', 'Ở ' + viTri(mml) + ': nam châm đã nhận lệnh ' + ml0.truoc.ten + '() (ở ' + viTri(mmlt) + ') trong nhịp này rồi, nên lệnh ' + ml0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp nam châm chỉ nhận một lệnh (bật hoặc tắt); wait() mới sang nhịp kế.', { cho: cho(mml), choTruoc: cho(mmlt), nhip: ml0.nhip });
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
    var slideGoiLai = res.suKien.filter(function (e) { return e.ma === 'slide-goi-lai'; });
    if (slideGoiLai.length) {
      var s0 = slideGoiLai[0], ms = g.anhXa[s0.dongPy] || null, mst = s0.truoc ? (g.anhXa[s0.truoc.dongPy] || null) : null;
      them('slide-goi-lai', 'Ở ' + viTri(ms) + ': xe đã nhận lệnh ' + s0.truoc.ten + '() (ở ' + viTri(mst) + ') trong nhịp này rồi, nên lệnh ' + s0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp xe omni chỉ trượt một lần, sang một bên; wait() mới sang nhịp kế.', { cho: cho(ms), choTruoc: cho(mst), nhip: s0.nhip });
    }
    var tayGoiLai = res.suKien.filter(function (e) { return e.ma === 'tay-goi-lai'; });
    if (tayGoiLai.length) {
      var t0 = tayGoiLai[0], mt0 = g.anhXa[t0.dongPy] || null, mtt = t0.truoc ? (g.anhXa[t0.truoc.dongPy] || null) : null;
      them('tay-goi-lai', 'Ở ' + viTri(mt0) + ': tay đã nhận lệnh ' + t0.truoc.ten + '() (ở ' + viTri(mtt) +
        ') trong nhịp này rồi, nên lệnh ' + t0.ten + '() này bị bỏ qua. ' +
        (t0.nhom === 'tu-the' ? 'Mỗi nhịp tay chỉ đổi tư thế một lần' : 'Mỗi nhịp tay chỉ kẹp hoặc thả một lần') + '; wait() mới sang nhịp kế.',
        { cho: cho(mt0), choTruoc: cho(mtt), nhip: t0.nhip, nhom: t0.nhom });
    }
    var vuong = res.suKien.filter(function (e) { return e.ma === 'tay-vuong'; });
    if (vuong.length) {
      var ml = vuong[0].lenh ? (g.anhXa[vuong[0].lenh.dongPy] || null) : null;
      var laNhen = man.loaiRobot === 'nhen', laTruot = vuong[0].lenh && /^slide_/.test(vuong[0].lenh.ten);
      them('tay-vuong', 'Ở nhịp ' + vuong[0].nhip + ', tay đang hạ sát đất nên ' + (laNhen ? 'nhện không bước được' : man.loaiRobot === 'omni' ? 'xe không đi, quay hay trượt được' : 'xe không đi hay quay được') + ' (tay vướng sàn): ' +
        (laNhen ? 'lệnh' : laTruot ? 'lệnh trượt' : 'lệnh bánh') + (vuong[0].lenh ? ' ' + vuong[0].lenh.ten + '() (ở ' + viTri(ml) + ')' : '') + ' của nhịp đó bị bỏ.' +
        (vuong.length > 1 ? ' Chuyện này xảy ra ' + vuong.length + ' lần.' : '') +
        (laNhen ? ' Xem lại tư thế tay trước khi cho nhện bước.' : ' Xem lại tư thế tay trước khi cho xe chạy.'), { nhip: vuong[0].nhip, soLan: vuong.length, cho: cho(ml) });
    }
    var omniCheo = res.suKien.filter(function (e) { return e.ma === 'omni-khong-cheo'; });
    if (omniCheo.length) {
      var oc = omniCheo[0], moc = oc.lenh ? (g.anhXa[oc.lenh.dongPy] || null) : null, mos = oc.truot ? (g.anhXa[oc.truot.dongPy] || null) : null;
      cd.push({
        ma: 'omni-khong-cheo', muc: 'thong-tin', nhip: oc.nhip, soLan: omniCheo.length, cho: cho(moc), choTruot: cho(mos),
        loi: 'Ở nhịp ' + oc.nhip + ': lệnh ' + (oc.lenh ? oc.lenh.ten + '() (ở ' + viTri(moc) + ') ' : 'bánh ') + 'và lệnh ' + oc.truot.ten + '() (ở ' + viTri(mos) + ') nằm chung một nhịp, nên xe chỉ trượt còn lệnh bánh bị bỏ.' +
          (omniCheo.length > 1 ? ' Chuyện này xảy ra ' + omniCheo.length + ' lần.' : '') +
          ' Bánh omni không đi chéo: một nhịp chỉ trượt ngang HOẶC tiến/quay.'
      });
    }
    var xichDo = res.suKien.filter(function (e) { return e.ma === 'xich-quay-do'; });
    if (xichDo.length) {
      var xd = xichDo[0], mxd = xd.lenh ? (g.anhXa[xd.lenh.dongPy] || null) : null;
      var mat = xd.cuoi
        ? 'chương trình kết thúc khi xe xích mới quay nửa vòng ' + (xd.huong > 0 ? 'sang phải' : 'sang trái') + ' (ở nhịp ' + xd.nhipNua + ')'
        : 'xe xích mới quay nửa vòng ' + (xd.huong > 0 ? 'sang phải' : 'sang trái') + ' ở nhịp ' + xd.nhipNua + ', nhịp kế lại làm việc khác nên phần quay dở mất';
      cd.push({
        ma: 'xich-quay-do', muc: 'thong-tin', nhip: xd.nhip, nhipNua: xd.nhipNua, soLan: xichDo.length, cuoi: !!xd.cuoi, cho: cho(mxd),
        loi: 'Ở nhịp ' + xd.nhip + ': ' + mat + (mxd ? ' (lệnh ' + xd.lenh.ten + '() ở ' + viTri(mxd) + ')' : '') + ', xe vẫn quay mặt như cũ.' +
          (xichDo.length > 1 ? ' Chuyện này xảy ra ' + xichDo.length + ' lần.' : '') +
          ' Xe xích cần 2 nhịp liên tiếp cùng một lệnh để quay đủ 90°.'
      });
    }
    var vatVo = res.suKien.filter(function (e) { return e.ma === 'vat-vo'; });
    if (vatVo.length) {
      them('vat-vo', 'Ở nhịp ' + vatVo[0].nhip + ', vật bị thả từ trên cao nên rơi vỡ' +
        (sanThu ? '.' : '; vật vỡ rồi thì không đưa tới đích được nữa, chương trình dừng ở đó.'),
        { nhip: vatVo[0].nhip, id: vatVo[0].id, o: vatVo[0].o });
    }
    var oCoVat = res.suKien.filter(function (e) { return e.ma === 'o-co-vat'; });
    if (oCoVat.length) {
      them('o-co-vat', 'Ở nhịp ' + oCoVat[0].nhip + ', ô (' + oCoVat[0].o.x + ', ' + oCoVat[0].o.y +
        ') đã có một vật nằm sẵn nên không đặt thêm được; vật vẫn ở trên tay. Mỗi ô chỉ chứa một vật.',
        { nhip: oCoVat[0].nhip, id: oCoVat[0].id, o: oCoVat[0].o });
    }
    var kepHut = res.suKien.filter(function (e) { return e.ma === 'kep-hut'; });
    if (kepHut.length) {
      var kh = kepHut[0];
      cd.push({
        ma: 'kep-hut', muc: 'thong-tin', nhip: kh.nhip, lyDo: kh.lyDo, o: kh.o,
        loi: kh.lyDo === 'qua-nang'
          ? 'Ở nhịp ' + kh.nhip + ', tay kẹp không gắp nổi thùng nặng ở ô (' + kh.o.x + ', ' + kh.o.y + '): thùng nặng chỉ đẩy được, không nhấc được.'
          : 'Ở nhịp ' + kh.nhip + ', tay kẹp vào không khí: ' +
          (kh.lyDo === 'tay-nang' ? 'vật nằm dưới đất mà tay đang nâng.' : 'ô (' + kh.o.x + ', ' + kh.o.y + ') không có vật nào để gắp.')
      });
    }
    var datSaiMau = res.suKien.filter(function (e) { return e.ma === 'dat-sai-mau'; });
    if (datSaiMau.length) {
      var sm = datSaiMau[0];
      them('dat-sai-mau', 'Ở nhịp ' + sm.nhip + ', vật ' + (sm.mauVat === 'none' ? 'không màu' : 'màu ' + TEN_MAU_VI[sm.mauVat]) + ' được thả xuống ô đích màu ' + TEN_MAU_VI[sm.mauDich] +
        ' ở (' + sm.o.x + ', ' + sm.o.y + '): ô đích màu nào thì chỉ nhận vật cùng màu, nên vật này chưa được tính.' +
        (datSaiMau.length > 1 ? ' Chuyện này xảy ra ' + datSaiMau.length + ' lần.' : '') + ' Nhặt vật lên và mang tới đúng ô đích.', { nhip: sm.nhip, id: sm.id, o: sm.o, mauVat: sm.mauVat, mauDich: sm.mauDich });
    }
    if (!sanThu && !res.thang && hamGoc.indexOf('color') >= 0) {
      var cs = chuoiMauSai(g.dong);
      if (cs.length) {
        var c0 = cs[0], mcs = g.anhXa[c0.dongPy] || null;
        them('ten-mau-sai', 'Ở ' + viTri(mcs) + ': so sánh với "' + c0.chuoi + '", nhưng color() chỉ trả về các chữ thường "red", "green", "blue", "yellow" hoặc "none". ' +
          'Hai chuỗi chỉ bằng nhau khi giống từng chữ, kể cả chữ hoa chữ thường, nên phép so sánh này không khớp với màu nào.' +
          (cs.length > 1 ? ' Còn ' + (cs.length - 1) + ' chỗ tương tự.' : ''), { chuoi: c0.chuoi, cho: cho(mcs), soCho: cs.length });
      }
    }
    var quen = res.suKien.filter(function (e) { return e.ma === 'quen-wait'; });
    if (quen.length) {
      var q = quen[0], mq = g.anhXa[q.lenh[0].dongPy] || null;
      var soTay = q.lenh.filter(function (x) { return SanHoc.TAY_LENH.indexOf(x.ten) >= 0 || SanHoc.TAY_DAY.indexOf(x.ten) >= 0 || SanHoc.TAY_NAM_CHAM.indexOf(x.ten) >= 0; }).length;
      var loaiLenh = soTay === 0 ? 'bánh' : soTay === q.lenh.length ? 'tay' : 'bánh và tay';
      if (man.loaiRobot === 'nhen') {
        // nhện: lệnh tay làm ở nhịp đầu của bước go_* kế tiếp hoặc ở nhịp wait() kế tiếp
        them('quen-wait', 'Chương trình kết thúc khi còn lệnh tay (' +
          q.lenh.map(function (x) { return x.ten + '()'; }).join(', ') + ', bắt đầu từ ' + viTri(mq) + ') chưa có wait() hay bước go_*() theo sau, nên những lệnh đó không chạy. ' +
          'Lệnh tay chỉ có tác dụng khi có một nhịp wait() hoặc một bước go_*() đi sau nó.', { lenh: q.lenh.map(function (x) { return x.ten; }), cho: cho(mq) });
      } else {
        them('quen-wait', 'Chương trình kết thúc khi còn lệnh ' + loaiLenh + ' (' +
          q.lenh.map(function (x) { return x.ten + '()'; }).join(', ') + ', bắt đầu từ ' + viTri(mq) + ') chưa có wait() theo sau, nên những lệnh đó không chạy. ' +
          'Lệnh ' + (soTay === 0 ? 'bánh' : loaiLenh) + ' chỉ có tác dụng khi nhịp kết thúc bằng wait().', { lenh: q.lenh.map(function (x) { return x.ten; }), cho: cho(mq) });
      }
    }

    // --- chạy xong mà chưa tới cờ
    if (!sanThu && !res.thang && !res.loi && man.mucTieu === 'dua-vat') {
      if (!res.dungSom) {
        var canVat = man.vatCan === 'sat' ? res.vat.filter(function (v) { return v.chat === 'sat'; }) : res.vat;
        var chuaXong = canVat.filter(function (v) { return !(v.trangThai === 'dat' && res.dich.some(function (d) { return d.x === v.x && d.y === v.y && (!d.mau || d.mau === v.mau); })); }).length;
        them('chua-dua-vat', 'Chương trình chạy xong mà chưa đưa hết ' + (man.vatCan === 'sat' ? 'vật sắt' : 'vật') + ' tới ô đích: còn ' + chuaXong + ' trong ' + canVat.length +
          ' ' + (man.vatCan === 'sat' ? 'vật sắt' : 'vật') + ' chưa nằm yên trên đích.' + (res.dich.some(function (d) { return d.mau; }) ? ' Đích có màu chỉ tính vật cùng màu.' : '') + ' Thử chạy lại và theo dõi tay cùng xe từng nhịp.', { conLai: chuaXong, tong: res.vat.length });
      }
    } else if (!sanThu && !res.thang && !res.loi && man.mucTieu === 'day-thung') {
      if (!res.dungSom) {
        var chuaThung = res.thung.filter(function (t) { return !res.dich.some(function (d) { return d.x === t.x && d.y === t.y; }); }).length;
        them('chua-day-thung', 'Chương trình chạy xong mà chưa đưa hết thùng nặng tới ô đích: còn ' + chuaThung + ' trong ' + res.thung.length +
          ' thùng chưa nằm trên đích. Thử chạy lại và theo dõi xe cùng thùng từng nhịp.', { conLai: chuaThung, tong: res.thung.length });
      }
    } else if (!sanThu && !res.thang && !res.loi) {
      var r = res.robot;
      them('chua-toi-co', 'Chương trình chạy xong mà robot chưa tới cờ: robot đang ở ô (' + r.x + ', ' + r.y + ')' +
        (man.loaiRobot === 'nhen' ? '' : ', quay mặt hướng ' + SanHoc.TEN_HUONG[r.huong]) +
        '. Thử chạy lại và theo dõi từng nhịp xem robot đi lệch ở đâu.', { robot: { x: r.x, y: r.y, huong: r.huong } });
    }
    // nhện chạy xong mà chưa có bước go_* nào: thường do hàm đi nhận chữ không khớp nhánh nào (viết thường thay vì hoa…)
    if (man.loaiRobot === 'nhen' && !sanThu && !res.thang && !res.loi && !res.dungSom &&
        !res.vet.some(function (e) { return e.loai === 'lenh' && /^go_/.test(e.ten); })) {
      them('nhen-khong-buoc', 'Chương trình chạy xong mà nhện chưa bước lần nào: không có lệnh go_up(), go_down(), go_left() hay go_right() nào được chạy. ' +
        'Nếu em dùng hàm để đi, kiểm tra hàm đó có thật sự gọi go_* không, và chữ em đưa vào có khớp một nhánh if / elif không (chữ hoa và chữ thường là khác nhau).', {});
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
        var mucLenh = {
          loai: 'lenh', ten: e.ten, cho: cho(g.anhXa[e.dongPy]),
          ngan: e.nganPy.map(function (d) { return cho(g.anhXa[d]); }).filter(function (x) { return x && x.cot !== 'thu'; })
        };
        if (e.docCamBien) mucLenh.docCamBien = e.docCamBien;             // đọc cảm biến: giao diện nháy cảm biến
        return mucLenh;
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
    var thangHet = true, nhipMax = 0, nhipTong = 0, gom = [], dsMa = {}, dung = {};
    dsSan.forEach(function (rows, i) {
      var bd = Array.isArray(man.batDau) ? man.batDau[i] : man.batDau;
      var lm = SanHoc.lopMauCuaSan(man, i);
      var res = SanHoc.chay({
        san: rows, batDau: bd, loaiRobot: man.loaiRobot || 'banh',
        hamGoc: man.hamGoc, nhipToiDa: man.nhipToiDa || 200, mucTieu: man.mucTieu || 'toi-co',
        mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatCan: man.vatCan, vat: lm.vatThem || undefined
      }, g.ma);
      var cd = chanDoanSan(man, res, g, false, bc);
      var vet = chuyenVet(res.vet, g);
      hamTrongVet(vet, dung);
      ketQua.theoSan.push({ thang: res.thang, soNhip: res.nhip, chanDoan: cd, vet: vet, robot: res.robot, tay: res.tay, namCham: res.namCham, vat: res.vat, vatBanDau: res.vatBanDau, dich: res.dich, thung: res.thung, thungBanDau: res.thungBanDau, mauO: res.mauO });
      if (!res.thang) thangHet = false;
      if (res.nhip > nhipMax) nhipMax = res.nhip;
      nhipTong += res.nhip;
      cd.forEach(function (c) {
        if (dsMa[c.ma]) return;
        dsMa[c.ma] = true;
        gom.push(nhieu ? Object.assign({}, c, { loi: 'Sân ' + (i + 1) + ': ' + c.loi, san: i }) : c);
      });
    });
    ketQua.thang = thangHet;
    ketQua.nhipMax = nhipMax; ketQua.nhipTong = nhipTong;
    ketQua.soNhip = man.nhipTheo === 'tong' ? nhipTong : nhipMax;       // nhiều sân: mặc định sân dài nhất; nhipTheo 'tong' = tổng mọi sân
    ketQua.chanDoan = gom;
    ketQua.batDau = Array.isArray(man.batDau) ? man.batDau[0] : man.batDau;
    var viec = ketQua.theoSan.filter(function (s) { return !s.thang; })[0] || ketQua.theoSan[0];
    ketQua.vet = viec.vet;
    ketQua.vatBanDau = viec.vatBanDau; ketQua.dich = viec.dich; ketQua.tay = viec.tay; ketQua.namCham = viec.namCham; ketQua.vat = viec.vat;
    ketQua.thungBanDau = viec.thungBanDau; ketQua.thung = viec.thung; ketQua.mauO = viec.mauO;

    // hàm thực sự được gọi (hợp mọi sân) → số ô
    var daDung = tap.em.concat(tap.man).filter(function (h) {
      return dung[(tap.em.indexOf(h) >= 0 ? 'hamEm' : 'hamMan') + ':' + h.ten];
    });
    dienO(ketQua, daDung);
    if (thangHet) {
      var sao = man.sao || {};
      ketQua.sao = 1 + (sao.o !== undefined && ketQua.soO <= sao.o ? 1 : 0) + (sao.nhip !== undefined && ketQua.soNhip <= sao.nhip ? 1 : 0);
    }
    return xong();
  }

  function gan(c) { if (!c.muc) c.muc = 'loi'; return c; }

  /** "Sân thử" của Xưởng hàm: xem mô tả ở đầu tệp. */
  function thuHam(man, baiLam, tenHam, hamCuaEm, tuyChon) {
    tuyChon = tuyChon || {};
    baiLam = chuanHoa(baiLam);
    var cam = !!man.camHamCuaEm;
    var kho = cam ? [] : (hamCuaEm || []).map(saoHam);
    var st = chuanSanThu(tuyChon.sanThu || SAN_THU_MAC_DINH);
    var ketQua = { vet: [], robot: Object.assign({}, st.batDau), batDau: Object.assign({}, st.batDau), sanThu: st, soNhip: 0, chanDoan: [], py: '', anhXa: [], tay: null, namCham: null, vat: [], thung: [] };
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
      san: hangSanThu(st), batDau: st.batDau, loaiRobot: man.loaiRobot || 'banh',
      hamGoc: man.hamGoc, nhipToiDa: nhipToiDa, vat: st.vat, thung: st.thung, mau: lopMauSanThu(st)
    }, g.ma);
    res.nhipToiDa = nhipToiDa;
    ketQua.chanDoan = chanDoanSan(man, res, g, true, bc);
    ketQua.vet = chuyenVet(res.vet, g);
    ketQua.robot = res.robot;
    ketQua.soNhip = res.nhip;
    ketQua.tay = res.tay; ketQua.namCham = res.namCham; ketQua.vat = res.vat; ketQua.thung = res.thung;
    return xong();
  }

  var API = { cham: cham, thuHam: thuHam, chuanSanThu: chuanSanThu, hangSanThu: hangSanThu, SAN_THU_MAC_DINH: SAN_THU_MAC_DINH };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ChamHoc = API;
})();
