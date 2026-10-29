/* ============================================================================
   lap-rap.js — "Robot Chấn Hưng": LÕI CHẾ ĐỘ LẮP RÁP (window.LapRap). Kế hoạch: KE-HOACH-LAP-RAP.md (17/10).
   Màn thường: robot CỐ ĐỊNH theo màn (man.loaiRobot / man.robot / man.hamGoc). Màn LẮP RÁP: người chơi tự chọn part (thân · tay · não = cảm biến) dưới một
   NGÂN SÁCH XU, rồi mới chơi. Tệp này không biết gì về giao diện: chỉ có danh mục part, luật ghép, giá, và hàm gắn robot đã chọn vào màn.

   DỮ LIỆU MÀN (man.lapRap):
     lapRap: {
       than:    ['hai-banh', 'xich'],     // mã thân được chọn (ít nhất một)
       tay:     ['kep'] | [],             // mã tay được chọn; [] = màn không có khe tay (giao diện ẩn khe)
       camBien: ['mau'] | [],             // mã cảm biến ("não") được chọn; [] = không có khe não
       nganSach: 5,                       // số xu
       phaiCo:  ['tay', 'camBien'],       // (tuỳ chọn) khe bắt buộc phải gắn; mặc định tay / camBien có thể "không gắn"
       cachLap: [ { than, tay, camBien, loiGiai: { chinh, hamCuaMan?, hamCuaEmMoi? }, ghiChu }, … ]   // cách lắp MẪU (≥ 2), mỗi cách có lời giải chạy thật
     }
   Một cách lắp là { than: 'hai-banh', tay: 'kep' | null, camBien: 'mau' | null } (mỗi khe một part). Trường khác của màn (san, batDau, pin, sao, maMau, khung…) viết như màn thường;
   KHÔNG cần khai loaiRobot / robot / hamGoc: chúng được suy ra lúc vào màn bằng apDung (có khai thì bị apDung ghi đè). sao.nhip / sao.o ứng với cách lắp tốt nhất; cách khác có thể chỉ đạt 2 sao (đó là đánh đổi).
   pin (nếu màn khai) chỉ có nghĩa với drone: apDung giữ pin + battery() + camBien { ma:'pin' } khi thân là drone, và bỏ pin khi thân khác.

   MÃ PART lấy đúng mã bộ phận của bộ vẽ vector game/ve-vector-*.js (VeVector.lay; V7c1: bộ pixel game/part không còn là nguồn; bảng DANH_MUC giữ thêm `ham` = lệnh gốc
   của bộ phận, máy kiểm so với VeVector.hamGoc và dữ liệu chụp hoc/du-lieu-chup-pixel.json): thân hai-banh · xich · omni · nhen · drone; tay kep · xoay · nam-cham · nem · hoi;
   cảm biến khoang-cach · mau · camera · camera-bay · và 'tu' = cảm biến khoảng cách có đầu dò từ (part khoang-cach + hai hàm front_metal / front_pole; hình giống khoang-cach).

   API (window.LapRap, hay module.exports trong Node; trong Node tự nạp game/ve-vector.js + các bộ phận vector):
     KHE                          ['than', 'tay', 'camBien']
     DANH_MUC                     { than: [...], tay: [...], camBien: [...] } — mỗi mục { ma, part, ten, gia, vuot (một dòng "vượt được gì"), icon (tên icon ve.js), loai | o | hamThem }
     tim(khe, ma) · tenCua(khe, ma) · moTa(cach) → "Hai bánh + Tay kẹp + Màu bụng"
     chuanCach(c) → { than, tay, camBien }      giaCach(c) → số xu
     cauHinhCua(c) → { than, tay, camBien: [{ ma, o }] }   (đưa thẳng cho VeRobot.ve / VeVector.kiemGhep)
     kiemGhep(c) → { ok, lyDo, ma: 'ghep-sai' | 'khe-la', xung: [khe…] }   ghép có hợp lệ không (KHÔNG xét ngân sách, không xét danh sách màn cho phép)
     kiemCachLap(man, c) → { ok, gia, lyDo, ma, thieu, khe }    ma: 'khong-cho' | 'thieu-khe' | 'ghep-sai' | 'vuot-ngan-sach' | null; thieu = số xu còn thiếu khi vượt ngân sách; khe = khe liên quan (khong-cho, thieu-khe)
                                  (có thêm bí danh không đếm được `giá` = gia)
     dsCachLap(man) → [{ than, tay, camBien, gia }]  mọi cách lắp hợp lệ trong ngân sách, xếp theo giá rồi theo thứ tự danh sách
     apDung(man, c) → bản màn đã gắn robot: loaiRobot, robot { than, tay, camBien }, hamGoc (hợp lệnh các part + wait; battery khi drone có pin), loiGiai của cách mẫu (nếu c có),
                     manGoc (màn gốc), cachLapDaChon. Ném lỗi tiếng Việt nếu ghép sai. KHÔNG xét ngân sách (đó là việc của kiemCachLap).
     cachMacDinh(man) → cách lắp mở đầu của giao diện (thân đầu tiên, khe khác trống trừ khi bắt buộc)
     macDinh(man) → (man-chuoi-1.js chuanHoa gọi) điền loaiRobot / robot / hamGoc / loiGiai của màn theo cachLap[0] nếu màn chưa khai, để mọi nơi đọc ManHoc.danhSach thấy màn đủ trường
                   (=> cachLap[0] là cách ứng với sao 3; game chơi bản apDung theo cách người chơi chọn, không chơi bản mặc định này)
     dsKhe(man) → các khe màn có (khe có danh sách rỗng bị ẩn)
     kiemDuLieu(man) → mảng lỗi dữ liệu lapRap của màn (rỗng = ổn); máy kiểm các chương lắp ráp dùng
     kiemCanMan(man) → kiemDuLieu + mọi cách mẫu thắng + cachLap[0] đạt 3 sao + không cách nào hơn hẳn cách khác (mảng lỗi; rỗng = ổn)
     khoMau(man) → kho tham chiếu lúc tới màn (mọi hàm của em các màn thường trước đó tạo / sửa); màn khai lapRap.dungKho: true thì thongKeMau / kiemCanMan chạy lời giải mẫu trên kho này (lời giải được dùng pick(), forward(n)…)
     thongKeMau(man, kho?) → chạy lời giải từng cách mẫu qua máy chấm: [{ cach, ten, gia, thang, nhip, o, sao, loi }] (bảng "Cách lắp khác")
     veVector() → bộ vẽ vector đã nạp (Node: tự nạp game/ve-vector.js + ve-vector-than-* / tay-* / cam.js); null nếu không có (khi đó bỏ bước nhờ kiemGhep xét lại)
     honHan(a, b) · cachBiHonHan(thongKe) → các cặp { hon, kem }: cách hơn hẳn cách khác ở cả giá, nhịp, ô (luật cân màn: phải rỗng)
     lenhKhongCon(man, dong) → chỉ số các dòng gọi lệnh gốc của part mà robot hiện tại không có (khi "Lắp lại" đổi part mà chương trình còn lệnh cũ)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var KHE = ['than', 'tay', 'camBien'];
  var TEN_KHE = { than: 'Thân', tay: 'Tay', camBien: 'Não' };

  /* ------------------------------------------------------------------ danh mục */
  // loai: loaiRobot của thân trong lõi SanHoc ('banh' cho hai bánh). gia: xu (khởi điểm, chỉnh khi cân màn).
  // ham: các lệnh gốc part mở ra (đúng hamGoc của bộ phận vector; kiem-lap-rap.mjs so từng mục) — để apDung / macDinh chạy được cả lúc nạp màn, khi bộ vẽ chưa nạp.
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back'], BAY = ['go_up', 'go_down', 'go_left', 'go_right'], KHOANG_CACH = ['front_clear', 'left_clear', 'right_clear'];
  var THAN = [
    { ma: 'hai-banh', part: 'hai-banh', loai: 'banh', ten: 'Hai bánh', gia: 2, icon: 'denBanh', vuot: 'Đi, rẽ trên sàn phẳng', ham: BANH.concat(['wait']) },
    { ma: 'xich', part: 'xich', loai: 'xich', ten: 'Bánh xích', gia: 3, icon: 'denXich', vuot: 'Leo bậc, không trôi băng chuyền', ham: BANH.concat(['wait']) },
    { ma: 'omni', part: 'omni', loai: 'omni', ten: 'Bánh omni', gia: 4, icon: 'denTruot', vuot: 'Trượt ngang, không cần quay', ham: BANH.concat(['slide_left', 'slide_right', 'wait']) },
    { ma: 'nhen', part: 'nhen', loai: 'nhen', ten: 'Thân nhện', gia: 4, icon: 'denChan', vuot: 'Chui gầm, nhảy hố, leo bậc', ham: BAY.concat(['wait', 'crouch', 'stand']) },
    { ma: 'drone', part: 'drone', loai: 'drone', ten: 'Thân drone', gia: 5, icon: 'denCanh', vuot: 'Bay qua rào, băng chuyền, vật', ham: BAY.concat(['wait', 'battery']) }
  ];
  var TAY = [
    { ma: 'kep', part: 'kep', ten: 'Tay kẹp', gia: 2, icon: 'denKepMo', vuot: 'Nhặt vật lên, thả xuống', ham: ['arm_down', 'arm_up', 'grab', 'release'] },
    { ma: 'xoay', part: 'xoay', ten: 'Tay kẹp xoay', gia: 3, icon: 'denXoay', vuot: 'Kẹp vật ở trước, trái, phải', ham: ['arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right'] },
    { ma: 'nam-cham', part: 'nam-cham', ten: 'Nam châm', gia: 3, icon: 'denNamCham', vuot: 'Hút vật sắt, vật nam châm từ xa', ham: ['magnet_n', 'magnet_s', 'magnet_off'] },
    { ma: 'nem', part: 'nem', ten: 'Máy ném', gia: 3, icon: 'denNem', vuot: 'Ném vật qua rào, xa 1 đến 3 ô', ham: ['aim', 'throw', 'load'] },
    { ma: 'hoi', part: 'hoi', ten: 'Vòi phun', gia: 3, icon: 'denSung', vuot: 'Bắn nước đẩy thùng nặng', ham: ['shoot', 'shoot_back'] }
  ];
  // o: ổ gắn trên thân (VeVector.kiemGhep). Cảm biến từ ('tu') = part khoang-cach + hai hàm front_metal / front_pole.
  var CAM_BIEN = [
    { ma: 'khoang-cach', part: 'khoang-cach', o: 'hong', ten: 'Khoảng cách', gia: 1, icon: 'denCam', vuot: 'Thấy tường, vật ở trước, trái, phải', ham: KHOANG_CACH },
    { ma: 'mau', part: 'mau', o: 'hong', ten: 'Màu bụng', gia: 2, icon: 'denCam', vuot: 'Đọc màu ô dưới bụng xe', ham: ['color'] },
    { ma: 'camera', part: 'camera', o: 'tren', ten: 'Camera trước', gia: 2, icon: 'denCam', vuot: 'Đọc màu và vật ở ô trước mặt', ham: ['color'] },
    { ma: 'tu', part: 'khoang-cach', o: 'hong', ten: 'Cảm biến từ', gia: 2, icon: 'denCam', vuot: 'Biết vật sắt hay cực nam châm', ham: KHOANG_CACH.concat(['front_metal', 'front_pole']) },
    { ma: 'camera-bay', part: 'camera-bay', o: 'bung', ten: 'Camera bụng', gia: 2, icon: 'denCam', vuot: 'Drone thấy màu ô và vật dưới bụng', ham: ['look'] }
  ];
  var DANH_MUC = { than: THAN, tay: TAY, camBien: CAM_BIEN };

  function tim(khe, ma) {
    var ds = DANH_MUC[khe] || [];
    for (var i = 0; i < ds.length; i++) if (ds[i].ma === ma) return ds[i];
    return null;
  }
  function tenCua(khe, ma) { var d = tim(khe, ma); return d ? d.ten : String(ma); }
  function giaMot(khe, ma) { var d = ma ? tim(khe, ma) : null; return d ? d.gia : 0; }

  /* ----------------------------------------------------------- bộ vẽ vector (V7c1: luật ghép + dữ liệu bộ phận nằm ở VeVector, không còn ở game/part pixel) */
  var vvNode = null;
  /** Bộ vẽ vector: trình duyệt dùng window.VeVector (nạp trước khi gọi), Node tự nạp game/ve-vector.js + mọi ve-vector-than-* / tay-* / cam.js. null nếu không có (khi đó bỏ bước nhờ kiemGhep xét lại). */
  function VV() {
    var v = (typeof window !== 'undefined' && window.VeVector) || (typeof globalThis !== 'undefined' && globalThis.VeVector) || null;
    if (v && v.lay('than', 'hai-banh')) return v;
    if (!laNode) return v;
    if (!vvNode) {
      var fs = require('fs'), path = require('path'), dir = path.join(__dirname, 'game');
      vvNode = require(path.join(dir, 've-vector.js'));
      fs.readdirSync(dir).filter(function (n) { return /^ve-vector-(than|tay)-[\w-]+\.js$|^ve-vector-cam\.js$/.test(n); }).sort().forEach(function (n) { require(path.join(dir, n)); });
    }
    return vvNode;
  }

  /* ------------------------------------------------------------- một cách lắp */
  function mot(v) {                                                              // chuỗi mã | mảng một phần tử | rỗng → mã hay null
    if (Array.isArray(v)) v = v[0];
    return typeof v === 'string' && v ? v : null;
  }
  function chuanCach(c) { c = c || {}; return { than: mot(c.than), tay: mot(c.tay), camBien: mot(c.camBien) }; }
  function giaCach(c) {
    c = chuanCach(c);
    return giaMot('than', c.than) + giaMot('tay', c.tay) + giaMot('camBien', c.camBien);
  }
  function cauHinhCua(c) {
    c = chuanCach(c);
    var cb = c.camBien ? tim('camBien', c.camBien) : null;
    return { than: c.than, tay: c.tay, camBien: cb ? [{ ma: cb.part, o: cb.o }] : [] };
  }
  /** Tên part ở khe `khe` của cách `c` (cho lời báo). */
  function tenKhe(c, khe) { return c[khe] ? tenCua(khe, c[khe]) : ''; }

  /**
   * Ghép có hợp lệ không (không xét ngân sách, không xét danh sách màn cho phép). Luật = luật của VeVector.kiemGhep + luật của lõi SanHoc.chay (cấu hình robot):
   *   drone: chỉ treo nam châm dưới bụng, không camera trước / cảm biến khoảng cách / cảm biến từ (không có mặt trước); camera bụng chỉ gắn lên drone;
   *   nhện: chỉ tay kẹp (không tay xoay, nam châm, máy ném, súng hơi), không cảm biến khoảng cách / từ (không có hướng mặt).
   * Cuối cùng nhờ VeVector.kiemGhep xét lại (bắt luật ghép mới thêm vào bộ vẽ; V7c1: trước là Part.ghep của bộ pixel, cùng câu báo).
   */
  function kiemGhep(c) {
    c = chuanCach(c);
    if (!c.than || !tim('than', c.than)) return { ok: false, ma: 'khe-la', lyDo: c.than ? 'Không có thân "' + c.than + '".' : 'Chưa chọn thân.', xung: ['than'] };
    if (c.tay && !tim('tay', c.tay)) return { ok: false, ma: 'khe-la', lyDo: 'Không có tay "' + c.tay + '".', xung: ['tay'] };
    if (c.camBien && !tim('camBien', c.camBien)) return { ok: false, ma: 'khe-la', lyDo: 'Không có cảm biến "' + c.camBien + '".', xung: ['camBien'] };
    var sai = null;
    var than = tenKhe(c, 'than'), tay = tenKhe(c, 'tay'), cam = tenKhe(c, 'camBien');
    if (c.than === 'drone') {
      if (c.tay && c.tay !== 'nam-cham') sai = { lyDo: 'Drone chỉ treo được nam châm dưới bụng, không gắn ' + tay.toLowerCase() + '.', xung: ['than', 'tay'] };
      else if (c.camBien === 'khoang-cach' || c.camBien === 'tu' || c.camBien === 'camera') sai = { lyDo: 'Drone không có mặt trước để đo hay nhìn phía trước, không gắn "' + cam.toLowerCase() + '".', xung: ['than', 'camBien'] };
    } else {
      if (c.camBien === 'camera-bay') sai = { lyDo: 'Camera bụng chỉ gắn được lên drone.', xung: ['than', 'camBien'] };
      else if (c.than === 'nhen') {
        if (c.tay && c.tay !== 'kep') sai = { lyDo: 'Nhện không có hướng mặt, không gắn ' + tay.toLowerCase() + '.', xung: ['than', 'tay'] };
        else if (c.camBien === 'khoang-cach' || c.camBien === 'tu') sai = { lyDo: 'Nhện không có hướng mặt, không gắn "' + cam.toLowerCase() + '".', xung: ['than', 'camBien'] };
      }
    }
    if (sai) return { ok: false, ma: 'ghep-sai', lyDo: sai.lyDo, xung: sai.xung };
    var vv = VV();
    if (vv) {
      try { vv.kiemGhep(cauHinhCua(c)); }
      catch (e) { return { ok: false, ma: 'ghep-sai', lyDo: 'Ghép không được: ' + e.message, xung: ['than'].concat(c.tay ? ['tay'] : [], c.camBien ? ['camBien'] : []) }; }
    }
    return { ok: true, ma: null, lyDo: '', xung: [] };
  }

  /* ------------------------------------------------------------------ theo màn */
  function lapRapCua(man) { return (man && man.lapRap) || null; }
  function phaiCoCua(L) { return (L && L.phaiCo) || []; }
  function nganSachCua(L) { return L && typeof L.nganSach === 'number' ? L.nganSach : Infinity; }
  function dsKhe(man) {
    var L = lapRapCua(man);
    if (!L) return [];
    return KHE.filter(function (k) { return k === 'than' || (L[k] || []).length > 0; });
  }
  function ketQua(ok, gia, ma, lyDo, thieu, khe) {
    var kq = { ok: ok, gia: gia, lyDo: lyDo || '', ma: ma || null, thieu: thieu || 0, khe: khe || null };
    Object.defineProperty(kq, 'giá', { value: gia, enumerable: false });                  // bí danh có dấu
    return kq;
  }
  /** Cách lắp `c` cho màn `man`: ghép hợp lệ, mọi part nằm trong danh sách màn cho phép, đủ khe bắt buộc, không vượt ngân sách. */
  function kiemCachLap(man, c) {
    var L = lapRapCua(man);
    c = chuanCach(c);
    var gia = giaCach(c);
    if (!L) return ketQua(false, gia, 'khong-cho', 'Màn này không phải màn lắp ráp.');
    var cho = KHE.filter(function (k) { return c[k] && (L[k] || []).indexOf(c[k]) < 0; })[0];
    if (cho) return ketQua(false, gia, 'khong-cho', (L[cho] || []).length ? 'Màn này không cho dùng ' + tenKhe(c, cho).toLowerCase() + '.' : 'Màn này không có khe ' + TEN_KHE[cho].toLowerCase() + '.', 0, cho);
    if (!c.than) return ketQua(false, gia, 'thieu-khe', 'Chưa chọn thân.', 0, 'than');
    var can = phaiCoCua(L).filter(function (k) { return (L[k] || []).length && !c[k]; })[0];
    if (can) return ketQua(false, gia, 'thieu-khe', 'Màn này cần gắn khe ' + TEN_KHE[can].toLowerCase() + '.', 0, can);
    var g = kiemGhep(c);
    if (!g.ok) return ketQua(false, gia, 'ghep-sai', g.lyDo);
    var ns = nganSachCua(L);
    if (gia > ns) return ketQua(false, gia, 'vuot-ngan-sach', 'Thiếu ' + (gia - ns) + ' xu.', gia - ns);
    return ketQua(true, gia, null, '');
  }
  /** Mọi cách lắp hợp lệ trong ngân sách của màn. */
  function dsCachLap(man) {
    var L = lapRapCua(man), kq = [];
    if (!L) return kq;
    var tays = (L.tay || []).slice(), cams = (L.camBien || []).slice();
    if (phaiCoCua(L).indexOf('tay') < 0 || !tays.length) tays.unshift(null);
    if (phaiCoCua(L).indexOf('camBien') < 0 || !cams.length) cams.unshift(null);
    (L.than || []).forEach(function (th) {
      tays.forEach(function (ta) {
        cams.forEach(function (cb) {
          var c = { than: th, tay: ta, camBien: cb }, r = kiemCachLap(man, c);
          if (r.ok) kq.push({ than: th, tay: ta, camBien: cb, gia: r.gia });
        });
      });
    });
    return kq.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) { return a.x.gia - b.x.gia || a.i - b.i; }).map(function (e) { return e.x; });
  }
  /** Lý do nếu cách lắp c nằm trong lapRap.khongQua của màn ({ than, tay?, camBien?, lyDo }; khe không khai = khe nào cũng khớp), không thì null.
   *  Cùng phép khớp với lyDoKhongQua của cham.js. */
  function khongQua(man, c) {
    var L = lapRapCua(man), ds = (L && L.khongQua) || [];
    c = chuanCach(c);
    for (var i = 0; i < ds.length; i++) {
      var k = ds[i];
      if (KHE.every(function (kh) { return !(kh in k) || (k[kh] || null) === (c[kh] || null); })) return k.lyDo;
    }
    return null;
  }
  /** Cách lắp chọn sẵn khi vào màn Lắp robot: thân đầu tiên, khe khác trống (trừ khe bắt buộc: part đầu của khe đó).
   *  Cách đó nằm trong lapRap.khongQua, hay có cách qua được rẻ hơn, thì lấy cách RẺ NHẤT qua được (22/10: không chọn sẵn cách không bao giờ tới đích). */
  function cachMacDinh(man) {
    var L = lapRapCua(man), c = { than: L && L.than && L.than[0] || null, tay: null, camBien: null };
    if (L) phaiCoCua(L).forEach(function (k) { if ((L[k] || []).length) c[k] = L[k][0]; });
    if (!L || !(L.khongQua || []).length) return c;
    var qua = dsCachLap(man).filter(function (x) { return !khongQua(man, x); });
    if (!qua.length) return c;
    var gocQua = !khongQua(man, c) && kiemCachLap(man, c).ok;
    if (gocQua && giaCach(c) <= qua[0].gia) return c;
    return { than: qua[0].than, tay: qua[0].tay, camBien: qua[0].camBien };
  }
  function moTa(c) {
    c = chuanCach(c);
    return KHE.filter(function (k) { return c[k]; }).map(function (k) { return tenCua(k, c[k]); }).join(' + ');
  }

  /* -------------------------------------------------------------------- apDung */
  /** Có pin không: màn khai pin (số hay mảng theo từng sân). */
  // pin của màn lắp ráp chỉ có nghĩa với drone. macDinh cất pin sang `pinDrone` khi cách mẫu đầu tiên KHÔNG phải drone (để bản mặc định của màn không mang pin cho xe thường: lõi ném lỗi), apDung đọc cả hai.
  function pinCua(man) { return man.pinDrone !== undefined ? man.pinDrone : man.pin; }
  function coPinMan(man) { var p = pinCua(man); return p !== undefined && p !== null; }
  /** Hợp lệnh gốc các part của cách lắp + wait (thân nào cũng có wait). battery chỉ khi drone có pin. */
  function hamGocCua(man, c) {
    var goc = [];
    KHE.forEach(function (k) {
      var d = c[k] ? tim(k, c[k]) : null;
      (d && d.ham || []).forEach(function (h) { if (goc.indexOf(h) < 0) goc.push(h); });
    });
    if (goc.indexOf('wait') < 0) goc.push('wait');
    if (!(c.than === 'drone' && coPinMan(man))) goc = goc.filter(function (h) { return h !== 'battery'; });
    return goc;
  }
  function apDung(man, cach) {
    var c = chuanCach(cach), g = kiemGhep(c);
    if (!g.ok) throw new Error(g.lyDo);
    var th = tim('than', c.than), ch = cauHinhCua(c);
    var kq = Object.assign({}, man);
    kq.manGoc = man.manGoc || man;
    kq.cachLapDaChon = c;
    kq.giaLap = giaCach(c);                                                                // máy chấm dùng cho sao "rẻ" (man.sao.re)
    kq.loaiRobot = th.loai;
    if (c.than === 'drone' && coPinMan(man)) { ch.camBien.push({ ma: 'pin', o: 'than' }); kq.pin = pinCua(man); }
    else delete kq.pin;
    delete kq.pinDrone;                                                                    // pin chỉ dành cho drone: thân khác thì lõi ném lỗi nếu còn pin
    kq.robot = { than: c.than, tay: c.tay, camBien: ch.camBien };
    kq.hamGoc = hamGocCua(man, c);
    if (cach && cach.loiGiai) {                                                            // cách mẫu: máy kiểm / máy chấm chạy lời giải của chính cách này
      var lg = cach.loiGiai;
      kq.loiGiai = { chinh: (lg.chinh || []).slice(), hamCuaMan: lg.hamCuaMan || [], hamCuaEmMoi: lg.hamCuaEmMoi || [] };
    }
    return kq;
  }

  /**
   * Màn lắp ráp ở dạng "bản mặc định": điền (nếu màn chưa khai) loaiRobot, robot, hamGoc và loiGiai theo cách lắp mẫu ĐẦU TIÊN (cachLap[0], cách ứng với sao 3), để mọi chỗ đọc thẳng
   * ManHoc.danhSach (máy kiểm chung, Sổ lệnh, Gỡ lỗi) thấy một màn đủ trường. Giao diện không chơi bản này mà chơi apDung(màn, cách người chơi chọn). man-chuoi-1.js gọi hàm này trong chuanHoa.
   */
  function macDinh(man) {
    var L = lapRapCua(man);
    if (!L || !Array.isArray(L.cachLap) || !L.cachLap.length || !kiemGhep(L.cachLap[0]).ok) return man;
    var a = apDung(man, L.cachLap[0]);
    ['loaiRobot', 'robot', 'hamGoc'].forEach(function (k) { if (man[k] === undefined) man[k] = a[k]; });
    if (!man.loiGiai && a.loiGiai) man.loiGiai = a.loiGiai;
    if (a.loaiRobot !== 'drone' && man.pin !== undefined && man.pinDrone === undefined) { man.pinDrone = man.pin; delete man.pin; }          // bản mặc định không phải drone thì không mang pin
    return man;
  }

  /* ------------------------------------------------------------- kiểm dữ liệu */
  function kiemDuLieu(man) {
    var L = lapRapCua(man), ma = (man && man.ma) || '(màn)', loi = [];
    function them(s) { loi.push(ma + ': ' + s); }
    if (!L) { them('thiếu lapRap.'); return loi; }
    if (!Array.isArray(L.than) || !L.than.length) them('lapRap.than phải là mảng có ít nhất một thân.');
    KHE.forEach(function (k) {
      if (L[k] !== undefined && !Array.isArray(L[k])) them('lapRap.' + k + ' phải là mảng.');
      (Array.isArray(L[k]) ? L[k] : []).forEach(function (m) { if (!tim(k, m)) them('lapRap.' + k + ' có mã lạ "' + m + '".'); });
    });
    if (!(typeof L.nganSach === 'number' && L.nganSach >= 1 && Math.floor(L.nganSach) === L.nganSach)) them('lapRap.nganSach phải là số nguyên từ 1.');
    phaiCoCua(L).forEach(function (k) { if (['tay', 'camBien'].indexOf(k) < 0 || !(L[k] || []).length) them('lapRap.phaiCo có khe "' + k + '" mà màn không có khe đó.'); });
    if (!Array.isArray(L.cachLap) || L.cachLap.length < 2) { them('lapRap.cachLap cần ít nhất 2 cách lắp mẫu.'); return loi; }
    var thay = {};
    L.cachLap.forEach(function (cl, i) {
      var nhan = 'cachLap[' + i + ']', c = chuanCach(cl), r = kiemCachLap(man, c);
      if (!r.ok) them(nhan + ' (' + moTa(c) + ') không hợp lệ: ' + r.lyDo);
      var khoa = c.than + '|' + c.tay + '|' + c.camBien;
      if (thay[khoa]) them(nhan + ' trùng với cachLap[' + thay[khoa].i + '].'); else thay[khoa] = { i: i };
      if (!cl.loiGiai || !Array.isArray(cl.loiGiai.chinh)) them(nhan + ' thiếu loiGiai.chinh.');
    });
    return loi;
  }

  /* --------------------------------------------------------- thống kê cách mẫu */
  function chamHoc() {
    if (typeof window !== 'undefined' && window.ChamHoc) return window.ChamHoc;
    return laNode ? require('./cham.js') : null;
  }
  /**
   * KHO THAM CHIẾU lúc tới màn `man` (dùng khi màn khai `lapRap.dungKho: true`): mọi hàm của em mà các màn THƯỜNG đứng trước tạo / sửa (loiGiai.hamCuaEmMoi theo thứ tự màn;
   * bản sửa riêng của màn tietKiemNhip không vào kho), như người chơi đã đi hết các chương trước. Lời giải mẫu dùng kho (pick(), forward(n), turn_right()…) chạy trên kho này,
   * nên bảng "Cách lắp khác" và máy kiểm không phụ thuộc kho thật của người chơi.
   */
  function khoMau(man) {
    var MH = (typeof window !== 'undefined' && window.ManHoc) || (laNode ? require('./man-chuoi-1.js') : null);
    var ds = [], chi = {}, ma = (man && (man.manGoc || man).ma) || null;
    if (!MH) return ds;
    for (var i = 0; i < MH.danhSach.length; i++) {
      var x = MH.danhSach[i];
      if (x.ma === ma) break;
      if (x.lapRap) continue;
      ((x.loiGiai && x.loiGiai.hamCuaEmMoi) || []).forEach(function (f) {
        var h = { ten: f.ten, thamSo: (f.thamSo || []).slice(), than: (f.than || []).slice() }, k = chi[f.ten];
        if (k === undefined) { chi[f.ten] = ds.length; ds.push(h); }
        else if (x.tietKiemNhip !== true) ds[k] = h;
      });
    }
    return ds;
  }
  /** Chạy lời giải của từng cách lắp mẫu qua máy chấm: nhịp, ô, sao. Cho bảng "Cách lắp khác" và máy kiểm. kho (tuỳ chọn): các hàm của em có sẵn ở kho lúc tới màn, cộng thêm vào hamCuaEmMoi của lời giải. */
  function thongKeMau(man, kho) {
    var L = lapRapCua(man), cham = chamHoc(), kq = [];
    if (!L || !cham) return kq;
    if (kho === undefined && L.dungKho) kho = khoMau(man);                                 // màn có lời giải mẫu dùng kho (lapRap.dungKho): chạy trên kho tham chiếu
    (L.cachLap || []).forEach(function (cl) {
      var c = chuanCach(cl), mau = { cach: c, ten: moTa(c), gia: giaCach(c), thang: false, nhip: null, o: null, sao: 0, loi: null, ghiChu: cl.ghiChu || '' };
      try {
        var m = apDung(man, cl), lg = m.loiGiai || { chinh: [], hamCuaMan: [], hamCuaEmMoi: [] };
        var r = cham.cham(m, { chinh: lg.chinh.slice(), hamCuaMan: lg.hamCuaMan || [] }, (kho || []).concat(lg.hamCuaEmMoi || []));
        mau.thang = !!r.thang; mau.nhip = r.soNhip; mau.o = r.soO; mau.sao = r.sao;
      } catch (e) { mau.loi = e.message; }
      kq.push(mau);
    });
    return kq;
  }

  /** Cách `a` hơn hẳn cách `b`: không kém ở cả giá, nhịp lẫn ô (đều ≤) và hơn ở ít nhất một. a, b = mục của thongKeMau ({ gia, nhip, o }). */
  function honHan(a, b) {
    var ks = ['gia', 'nhip', 'o'];
    return ks.every(function (k) { return a[k] <= b[k]; }) && ks.some(function (k) { return a[k] < b[k]; });
  }
  /** Từ bảng thongKeMau: các cặp { hon, kem } (chỉ số trong bảng) mà cách `hon` hơn hẳn cách `kem`. Chỉ xét cách thắng. Rỗng = không cách nào bị hơn hẳn (luật cân màn). */
  function cachBiHonHan(tk) {
    var kq = [];
    tk.forEach(function (a, i) {
      tk.forEach(function (b, j) { if (i !== j && a.thang && b.thang && honHan(a, b)) kq.push({ hon: i, kem: j }); });
    });
    return kq;
  }

  /**
   * Kiểm cân màn cho một màn lắp ráp (máy kiểm các chương lắp ráp gọi): dữ liệu (kiemDuLieu), mọi cách mẫu THẮNG (lời giải chạy thật qua máy chấm), cách mẫu đầu tiên đạt 3 sao
   * (sao.nhip / sao.o ứng với cách tốt nhất), không cách mẫu nào hơn hẳn cách khác ở cả giá, nhịp lẫn ô. Trả về mảng lỗi (rỗng = ổn).
   * (Chạy BFS / dò đường ngắn nhất cho TỪNG cách lắp hợp lệ là việc riêng của từng chương: bộ dò đường của chương đó.)
   */
  function kiemCanMan(man, kho) {
    var loi = kiemDuLieu(man), ma = (man && man.ma) || '(màn)';
    if (loi.length) return loi;
    var tk = thongKeMau(man, kho);
    tk.forEach(function (x, i) {
      if (x.loi) loi.push(ma + ': cachLap[' + i + '] (' + x.ten + ') chấm lỗi: ' + x.loi);
      else if (!x.thang) loi.push(ma + ': cachLap[' + i + '] (' + x.ten + ') không thắng.');
    });
    if (loi.length) return loi;
    var ss = man.sao || {};
    if ((ss.nhip !== undefined && tk[0].nhip > ss.nhip) || (ss.o !== undefined && tk[0].o > ss.o)) loi.push(ma + ': cachLap[0] (' + tk[0].ten + ') phải đạt 3 sao: ' + tk[0].nhip + ' nhịp, ' + tk[0].o + ' ô so với sao ' + JSON.stringify(ss) + '.');
    cachBiHonHan(tk).forEach(function (p) { loi.push(ma + ': cách "' + tk[p.hon].ten + '" hơn hẳn cách "' + tk[p.kem].ten + '" ở cả giá, nhịp lẫn ô (cách kém vô dụng).'); });
    return loi;
  }

  /* ------------------------------------------------ lệnh không còn sau khi đổi part */
  var tatCaLenh = null;
  function lenhCuaMoiPart() {
    if (tatCaLenh) return tatCaLenh;
    var kq = [];
    KHE.forEach(function (k) { DANH_MUC[k].forEach(function (d) { d.ham.forEach(function (h) { if (kq.indexOf(h) < 0) kq.push(h); }); }); });
    return (tatCaLenh = kq);
  }
  /** Chỉ số (từ 0) các dòng của `dong` gọi một lệnh gốc của part (mọi part trong danh mục) mà robot của `man` KHÔNG có; wait() thì thân nào cũng có. */
  function lenhKhongCon(man, dong) {
    var co = {}, moi = lenhCuaMoiPart(), kq = [], ten = [];
    (man.hamGoc || []).forEach(function (h) { co[h] = true; });
    (dong || []).forEach(function (s, i) {
      var re = /([A-Za-z_]\w*)\s*\(/g, m, d = String(s).replace(/#.*$/, ''), thieu = [];
      while ((m = re.exec(d))) if (moi.indexOf(m[1]) >= 0 && !co[m[1]] && thieu.indexOf(m[1]) < 0) thieu.push(m[1]);
      if (thieu.length) { kq.push(i); thieu.forEach(function (h) { if (ten.indexOf(h) < 0) ten.push(h); }); }
    });
    kq.ten = ten;                                                                          // tên các lệnh thiếu (cho lời báo)
    return kq;
  }

  var API = {
    KHE: KHE, TEN_KHE: TEN_KHE, DANH_MUC: DANH_MUC,
    tim: tim, tenCua: tenCua, moTa: moTa, chuanCach: chuanCach, giaCach: giaCach, cauHinhCua: cauHinhCua,
    kiemGhep: kiemGhep, kiemCachLap: kiemCachLap, dsCachLap: dsCachLap, apDung: apDung, cachMacDinh: cachMacDinh, khongQua: khongQua, dsKhe: dsKhe,
    macDinh: macDinh, kiemDuLieu: kiemDuLieu, kiemCanMan: kiemCanMan, thongKeMau: thongKeMau, khoMau: khoMau, honHan: honHan, cachBiHonHan: cachBiHonHan, lenhKhongCon: lenhKhongCon, veVector: VV
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.LapRap = API;
})();
