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
   cảm biến khoang-cach · mau · camera · camera-bay · và 'tu' = CẢM BIẾN TỪ, part riêng từ P1 mùa 3 29/10 (trước: part khoang-cach + hai hàm front_metal / front_pole; hình giống khoang-cach).
   M9A (3/11, mùa 9 Về CLB): thêm thân gai · xuong · cau; tay son · loa · moc-cau · day-keo; não hong-ngoai · camera-4 · radar · am-thanh · quet-ma · dong-chay (8 × 9 × 11).
   LUẬT GHÉP đọc từ hoc/bang-ghep.js (BangGhep.kiemGhep, một chỗ cho cả game; trạng thái ● ✔ ★ · ✗ + lý do ba câu); kiemGhep trả thêm ma 'lai-chua-co' (ô ★, kèm lai 'L1'…) và 'khong-mo' (ô ·).
   Mục có `nangCap` (cần cẩu rail): lệnh chỉ lên khay khi màn khai trong man.hamGoc; `tenCu` (tay lưới tow…): tên cũ trong bộ vẽ, không lên khay.

   API (window.LapRap, hay module.exports trong Node; trong Node tự nạp game/ve-vector.js + các bộ phận vector):
     KHE                          ['than', 'tay', 'camBien']
     DANH_MUC                     { than: [...], tay: [...], camBien: [...] } — mỗi mục { ma, part, ten, gia, vuot (một dòng "vượt được gì"), icon (tên icon ve.js), loai | o | hamThem }
     tim(khe, ma) · tenCua(khe, ma) · moTa(cach) → "Hai bánh + Tay kẹp + Màu bụng"
     chuanCach(c) → { than, tay, camBien }      giaCach(c) → số xu
     cauHinhCua(c) → { than, tay, camBien: [{ ma, o }] }   (đưa thẳng cho VeRobot.ve / VeVector.kiemGhep)
     kiemGhep(c, man?) → { ok, lyDo, ma: 'ghep-sai' | 'khe-la' | 'lai-chua-co' | 'khong-mo', xung: [khe…] }   ghép có hợp lệ không (KHÔNG xét ngân sách, không xét danh sách màn cho phép)
                                  man (M9B1 4/11): màn mở lai ★ nào — moLaiCua(man) = man.lapRap.moLai, không thì man.moLai (vd ['L4']); không có man = không mở lai nào
     moLaiCua(man) → ['L4', …]
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

   M9D1 (4/11, mùa 9 chương 1 CHỌN ĐỘI + chương 2 LẮP ROBOT THỨ HAI; KE-HOACH-MUA-9-TO-HOP.md mục 7, 8, 8b, 9.4; máy kiểm hoc/kiem-chon-doi.mjs):
     man.chonDoi = { menu: ['CH', 'DR', 'CU'], so?: 2, trung?: false, cachMau: [{ chon: ['CH', 'CU'], loiGiai: { doi: [{ chinh }…], hamCuaMan?, hamCuaEmMoi? }, ghiChu? }] }
       man.doi[i] của robot em lập trình chỉ khai phần riêng (batDau, co, son, pin, coThem); robot khoá (coDinh) khai đủ như màn đội thường, chạy maMau.doi[i]. chon[k] = robot em thứ k.
     man.lapRap.robot = i  → màn đội, lắp cho robot thứ i: apDung gắn vào man.doi[i] (bỏ cờ cỗ máy cũ, giữ batDau / co / son), cachLap[k].loiGiai = { doi } (lời giải đội).
     robotEm(man) · soChonCua(man) · robotLapCua(man) · coMay() (co-may.js)
     kiemChon(man, chon) → { ok, ma: 'khong-chon-doi' | 'thieu' | 'thua' | 'khong-co' | 'trung' | null, lyDo }    dsCachChon(man) → [[mã…]] mọi lựa chọn hợp lệ (có thứ tự)
     apDungDoi(man, chon | cachMau) → bản màn đủ man.doi[i] (CoMay.dung: loaiRobot, robot, hamGoc, cờ), chonDaChon, manGoc, loiGiai (khi là cách mẫu). Ném lỗi lời Việt khi chọn sai.
     kiemDuLieuDoi(man) · thongKeMauDoi(man, kho?) → [{ chon, ten, thang, nhip, o, sao, loi, ghiChu }] · kiemCanManDoi(man, kho?)
     loiGiaiCua(lg, man?) → lời giải dạng máy chấm chạy (màn đội: robot khoá không có trong lg thì lấy maMau.doi[i]) · baiCua(lg) → bài làm đưa Cham.cham
     macDinh(man) điền thêm: chonDoi theo cachMau[0]; lapRap.robot theo cachLap[0] vào man.doi[i]. (man-chuoi-1.js chuanHoa chỉ gọi macDinh khi m.lapRap → màn chọn đội gọi LapRap.macDinh trước chuanHoa, hay chuanHoa thêm `|| m.chonDoi` ở gói D2.)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var KHE = ['than', 'tay', 'camBien'];
  var TEN_KHE = { than: 'Thân', tay: 'Tay', camBien: 'Não' };

  /* ------------------------------------------------------------------ danh mục */
  // loai: loaiRobot của thân trong lõi SanHoc ('banh' cho hai bánh). gia: xu (khởi điểm, chỉnh khi cân màn).
  // ham: các lệnh gốc part mở ra (đúng hamGoc của bộ phận vector; kiem-lap-rap.mjs so từng mục) — để apDung / macDinh chạy được cả lúc nạp màn, khi bộ vẽ chưa nạp.
  // M9A (3/11): danh mục 8 thân × 9 tay × 11 não (mùa 9 Về CLB, KE-HOACH-MUA-9-TO-HOP.md mục 9.3). Năm thân / tay / não đầu giữ nguyên thứ tự, giá, câu "vượt" (màn rap-* đang dùng).
  // nangCap: lệnh nâng cấp của part CHỈ lên khay khi màn khai nó trong man.hamGoc (như land / take_off của drone): rail của cần cẩu cần xuất phát trên ray R.
  // tenCu: tên lệnh cũ còn trong hamGoc của bộ vẽ (tay lưới: tow / drop_tow / tether / untether), lõi không nhận → không lên khay.
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back'], BAY = ['go_up', 'go_down', 'go_left', 'go_right'], KHOANG_CACH = ['front_clear', 'left_clear', 'right_clear'];
  var THAN = [
    { ma: 'hai-banh', part: 'hai-banh', loai: 'banh', ten: 'Hai bánh', gia: 2, icon: 'denBanh', vuot: 'Đi, rẽ trên sàn phẳng', ham: BANH.concat(['wait']) },
    { ma: 'xich', part: 'xich', loai: 'xich', ten: 'Bánh xích', gia: 3, icon: 'denXich', vuot: 'Leo bậc, không trôi băng chuyền', ham: BANH.concat(['wait']) },
    { ma: 'omni', part: 'omni', loai: 'omni', ten: 'Bánh omni', gia: 4, icon: 'denTruot', vuot: 'Trượt ngang, không cần quay', ham: BANH.concat(['slide_left', 'slide_right', 'wait']), nangCap: ['diag_left', 'diag_right'] },   // M9A: đi chéo (mùa 6 gói 5) là nâng cấp lõi, bộ vẽ không có
    { ma: 'nhen', part: 'nhen', loai: 'nhen', ten: 'Thân nhện', gia: 4, icon: 'denChan', vuot: 'Chui gầm, nhảy hố, leo bậc', ham: BAY.concat(['wait', 'crouch', 'stand']) },
    { ma: 'drone', part: 'drone', loai: 'drone', ten: 'Thân drone', gia: 5, icon: 'denCanh', vuot: 'Bay qua rào, băng chuyền, vật', ham: BAY.concat(['wait', 'battery', 'land', 'take_off']) },
    { ma: 'gai', part: 'gai', loai: 'gai', ten: 'Bánh gai', gia: 4, icon: 'denBanh', vuot: 'Bám đá ướt, bùn trơn khi bung gai', ham: BANH.concat(['wait', 'retract_spikes', 'extend_spikes']) },
    { ma: 'xuong', part: 'xuong', loai: 'xuong', ten: 'Xuồng', gia: 5, icon: 'denTruot', vuot: 'Đi trên nước, thả neo', ham: BANH.concat(['wait', 'anchor', 'unanchor']) },
    { ma: 'cau', part: 'cau', loai: 'cau', ten: 'Cần cẩu', gia: 6, icon: 'denTayLen', vuot: 'Quay, vươn cần qua tường, nước', ham: ['swing_left', 'swing_right', 'extend', 'retract', 'wait'], nangCap: ['rail'] }
  ];
  var TAY = [
    { ma: 'kep', part: 'kep', ten: 'Tay kẹp', gia: 2, icon: 'denKepMo', vuot: 'Nhặt vật lên, thả xuống', ham: ['arm_down', 'arm_up', 'grab', 'release'] },
    { ma: 'xoay', part: 'xoay', ten: 'Tay kẹp xoay', gia: 3, icon: 'denXoay', vuot: 'Kẹp vật ở trước, trái, phải', ham: ['arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right'] },
    { ma: 'nam-cham', part: 'nam-cham', ten: 'Nam châm', gia: 3, icon: 'denNamCham', vuot: 'Hút vật sắt, vật nam châm từ xa', ham: ['magnet_n', 'magnet_s', 'magnet_off'] },
    { ma: 'nem', part: 'nem', ten: 'Máy ném', gia: 3, icon: 'denNem', vuot: 'Ném vật qua rào, xa 1 đến 3 ô', ham: ['aim', 'throw', 'load'] },
    { ma: 'hoi', part: 'hoi', ten: 'Vòi phun', gia: 3, icon: 'denSung', vuot: 'Phun mạnh đẩy thùng nặng', ham: ['spray', 'spray_back'] },
    { ma: 'son', part: 'son', ten: 'Bộ gieo hạt', gia: 3, icon: 'denSon', vuot: 'Gieo hạt, chấm màu ô đang đứng', ham: ['ink', 'dot', 'pen_down', 'pen_up'] },
    { ma: 'loa', part: 'loa', ten: 'Loa', gia: 3, icon: 'denLoa', vuot: 'Phát nốt nhạc, phá đá chuông', ham: ['note', 'beat'] },
    { ma: 'moc-cau', part: 'moc-cau', ten: 'Móc cẩu', gia: 4, icon: 'denKepDong', vuot: 'Nhấc, hạ container ở đầu cần', ham: ['pick_up', 'set_down', 'pick_up2'] },
    { ma: 'day-keo', part: 'day-keo', ten: 'Tay lưới', gia: 3, icon: 'denTayXuong', vuot: 'Tung lưới kéo bè, vật nổi về mũi', ham: ['cast_net', 'drop_net', 'set_length'], tenCu: ['tow', 'drop_tow', 'tether', 'untether'] }
  ];
  // o: ổ gắn trên thân (VeVector.kiemGhep). Cảm biến từ ('tu'): PART RIÊNG (P1 mùa 3 29/10; hình ve-vector-cam.js 'tu'), chỉ hai hàm front_metal / front_pole; trước đó là
  // part khoang-cach + hai hàm. Giá giữ 2 (rap-du.9 cách mẫu 'tu' không dùng front_clear nên kết quả cũ y nguyên).
  var CAM_BIEN = [
    { ma: 'khoang-cach', part: 'khoang-cach', o: 'hong', ten: 'Khoảng cách', gia: 1, icon: 'denCam', vuot: 'Thấy tường, vật ở trước, trái, phải', ham: KHOANG_CACH },
    { ma: 'mau', part: 'mau', o: 'hong', ten: 'Màu bụng', gia: 2, icon: 'denCam', vuot: 'Đọc màu ô dưới bụng xe', ham: ['color'] },
    { ma: 'camera', part: 'camera', o: 'tren', ten: 'Camera trước', gia: 2, icon: 'denCam', vuot: 'Đọc màu và vật ở ô trước mặt', ham: ['color'] },
    { ma: 'tu', part: 'tu', o: 'hong', ten: 'Cảm biến từ', gia: 2, icon: 'denCam', vuot: 'Biết vật sắt hay cực nam châm', ham: ['front_metal', 'front_pole'] },
    { ma: 'camera-bay', part: 'camera-bay', o: 'bung', ten: 'Camera bụng', gia: 2, icon: 'denCam', vuot: 'Drone thấy màu ô và vật dưới bụng', ham: ['look'] },
    { ma: 'hong-ngoai', part: 'hong-ngoai', o: 'tren', ten: 'Hồng ngoại', gia: 2, icon: 'denCam', vuot: 'Đếm ô trống phía trước, đo nóng', ham: ['distance', 'warm'] },
    { ma: 'camera-4', part: 'camera-4', o: 'tren', ten: 'Camera bốn hướng', gia: 3, icon: 'denCam', vuot: 'Đọc màu ô ở bốn hướng quanh xe', ham: ['color'] },
    { ma: 'radar', part: 'radar', o: 'tren', ten: 'Radar tròn', gia: 3, icon: 'denCam', vuot: 'Thấy 3 × 3 ô quanh xe, dạng đá', ham: ['radar', 'shape'] },
    { ma: 'am-thanh', part: 'am-thanh', o: 'tren', ten: 'Mic', gia: 2, icon: 'denCam', vuot: 'Nghe nốt chuông đá quanh xe', ham: ['hear', 'listen'] },
    { ma: 'quet-ma', part: 'quet-ma', o: 'tren', ten: 'Đầu đọc mã', gia: 2, icon: 'denCam', vuot: 'Đọc số, cân container ở đầu cần', ham: ['read_code', 'weight'] },
    { ma: 'dong-chay', part: 'dong-chay', o: 'tren', ten: 'Chong chóng', gia: 2, icon: 'denCam', vuot: 'Biết hướng, sức dòng chảy trước mũi', ham: ['flow_dir', 'flow'] }
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
      fs.readdirSync(dir).filter(function (n) { return /^ve-vector-(than|tay)-[\w-]+\.js$|^ve-vector-cam(-[\w-]+)?\.js$/.test(n); }).sort().forEach(function (n) { require(path.join(dir, n)); });   // M9A: cả ve-vector-cam-cang / cam-song (quet-ma, dong-chay)
    }
    return vvNode;
  }
  /** Bảng ghép một chỗ (bang-ghep.js): trình duyệt dùng window.BangGhep (choi.html nạp trước lap-rap.js), Node tự require. */
  var bgNode = null;
  function BG() {
    var b = (typeof window !== 'undefined' && window.BangGhep) || (typeof globalThis !== 'undefined' && globalThis.BangGhep) || null;
    if (b) return b;
    if (!laNode) throw new Error('lap-rap.js cần bang-ghep.js nạp trước (window.BangGhep).');
    return bgNode || (bgNode = require('./bang-ghep.js'));
  }
  /** Tám bộ cỗ máy (co-may.js): trình duyệt dùng window.CoMay (nạp trước lap-rap.js khi màn có chonDoi), Node tự require. */
  var cmNode = null;
  function CM() {
    var c = (typeof window !== 'undefined' && window.CoMay) || (typeof globalThis !== 'undefined' && globalThis.CoMay) || null;
    if (c) return c;
    if (!laNode) throw new Error('lap-rap.js cần co-may.js nạp trước (window.CoMay) cho màn chọn đội.');
    return cmNode || (cmNode = require('./co-may.js'));
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
   * Ghép có hợp lệ không (không xét ngân sách, không xét danh sách màn cho phép). M9A (3/11): luật đọc từ BẢNG GHÉP MỘT CHỖ bang-ghep.js (trước: các nhánh if riêng cho drone / nhện,
   * câu báo cũ nay nằm trong bảng, y nguyên chữ). ma: 'khe-la' | 'ghep-sai' (ô ✗, lyDo theo ba câu) | 'lai-chua-co' (ô ★, kèm `lai` = mã L; gói B bật BangGhep.MO_LAI) | 'khong-mo' (ô ·).
   * Cuối cùng nhờ VeVector.kiemGhep xét lại (ổ gắn thật của bộ vẽ; V7c1: trước là Part.ghep của bộ pixel, cùng câu báo).
   */
  /** Mã lai ★ màn mở (M9B1 4/11): man.lapRap.moLai, không thì man.moLai (màn không lắp ráp mà robot là tổ hợp lai); mảng mới, không có thì []. */
  function moLaiCua(man) {
    if (!man) return [];
    var g = man.manGoc || null;
    var ds = (man.lapRap && man.lapRap.moLai) || man.moLai || (g && ((g.lapRap && g.lapRap.moLai) || g.moLai)) || [];
    return Array.isArray(ds) ? ds.slice() : [];
  }
  function kiemGhep(c, man) {
    c = chuanCach(c);
    if (!c.than || !tim('than', c.than)) return { ok: false, ma: 'khe-la', lyDo: c.than ? 'Không có thân "' + c.than + '".' : 'Chưa chọn thân.', xung: ['than'] };
    if (c.tay && !tim('tay', c.tay)) return { ok: false, ma: 'khe-la', lyDo: 'Không có tay "' + c.tay + '".', xung: ['tay'] };
    if (c.camBien && !tim('camBien', c.camBien)) return { ok: false, ma: 'khe-la', lyDo: 'Không có cảm biến "' + c.camBien + '".', xung: ['camBien'] };
    var b = BG().kiemGhep(c.than, c.tay, c.camBien, { moLai: moLaiCua(man) });
    if (!b.ok) { var kq = { ok: false, ma: b.ma, lyDo: b.lyDo, xung: b.xung }; if (b.lai) kq.lai = b.lai; return kq; }
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
    var g = kiemGhep(c, man);
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
    if (c.than === 'cau') goc = goc.filter(function (h) { return h !== 'arm_down' && h !== 'arm_up'; });   // M9B2 (L8): gầu ngoạm trên cần cẩu chỉ grab() / release() (gầu thả từ đầu cần, không nâng hạ tay)
    if (c.than === 'cau' || c.than === 'drone') goc = goc.filter(function (h) { return h !== 'set_length'; });   // M9C2 (L9, L10): giỏ cứu hộ / phao chỉ cast_net() / drop_net()
    if (!(c.than === 'drone' && coPinMan(man))) goc = goc.filter(function (h) { return h !== 'battery'; });
    // land / take_off: nâng cấp drone đáp đất để sạc (mùa 4 gói 5) chỉ khi màn mở nó trên khay
    if (!(c.than === 'drone' && (man.hamGoc || []).indexOf('land') >= 0)) goc = goc.filter(function (h) { return h !== 'land' && h !== 'take_off'; });
    // M9A: lệnh nâng cấp (nangCap) của part mới chỉ lên khay khi màn khai nó trong man.hamGoc (cần cẩu rail: bệ phải xuất phát trên ray)
    KHE.forEach(function (k) {
      var d = c[k] ? tim(k, c[k]) : null;
      (d && d.nangCap || []).forEach(function (h) { if ((man.hamGoc || []).indexOf(h) < 0) goc = goc.filter(function (x) { return x !== h; }); else if (goc.indexOf(h) < 0) goc.push(h); });
    });
    return goc;
  }
  /** Lời giải của một cách mẫu (lắp hay chọn đội) ở dạng máy chấm / máy kiểm chạy được: màn một robot { chinh, hamCuaMan, hamCuaEmMoi }; màn đội { doi: [{ chinh }…], hamCuaMan, hamCuaEmMoi }.
   *  Màn đội (truyền `man`): robot KHOÁ (man.doi[i].coDinh) mà lời giải không ghi chương trình thì lấy maMau.doi[i] của màn (máy khách R3 chạy chương trình khoá; cách mẫu chỉ cần viết cho robot em lập trình). */
  function loiGiaiCua(lg, man) {
    lg = lg || {};
    var kq = Array.isArray(lg.doi) ? { doi: lg.doi.map(function (d) { return { chinh: ((d && d.chinh) || []).slice() }; }) } : { chinh: (lg.chinh || []).slice() };
    if (kq.doi && man && Array.isArray(man.doi)) man.doi.forEach(function (r, i) {
      var mm = r.coDinh && man.maMau && man.maMau.doi && man.maMau.doi[i];
      if (mm && !(lg.doi[i] && lg.doi[i].chinh && lg.doi[i].chinh.length)) kq.doi[i] = { chinh: (mm.chinh || []).slice() };
      else if (!kq.doi[i]) kq.doi[i] = { chinh: [] };
    });
    kq.hamCuaMan = lg.hamCuaMan || []; kq.hamCuaEmMoi = lg.hamCuaEmMoi || [];
    return kq;
  }
  /** Bài làm đưa máy chấm từ loiGiai (chinh hay doi). */
  function baiCua(lg) { return lg.doi ? { doi: lg.doi.map(function (d) { return { chinh: d.chinh.slice() }; }), hamCuaMan: lg.hamCuaMan || [] } : { chinh: lg.chinh.slice(), hamCuaMan: lg.hamCuaMan || [] }; }
  /** Chỉ số robot được lắp trong màn đội (man.lapRap.robot); null = màn một robot (lắp vào chính màn). */
  function robotLapCua(man) {
    var L = lapRapCua(man);
    return L && typeof L.robot === 'number' && Array.isArray(man.doi) ? L.robot : null;
  }
  /** Các khoá cấu hình cỗ máy trên một mục man.doi[i] (CoMay.dung đặt): bỏ đi trước khi gắn cỗ máy / cách lắp mới, để cờ của cỗ máy cũ không sót lại. */
  function khoaCoMay() {
    var ks = ['loaiRobot', 'robot', 'hamGoc', 'pin'], DS = CM().DS;
    Object.keys(DS).forEach(function (m) { Object.keys(DS[m].co || {}).forEach(function (k) { if (ks.indexOf(k) < 0) ks.push(k); }); });
    return ks;
  }
  function locCoMay(r) {
    var kq = Object.assign({}, r), ks = khoaCoMay();
    ks.forEach(function (k) { delete kq[k]; });
    return kq;
  }
  /** Màu đế của robot thứ i trong đội: khai ở doi[i].son hay doi[i].robot.son; mặc định R2 'lam' (hồng Luna), R1 không (xanh Sola). */
  function sonCua(r, i) { return r.son || (r.robot && r.robot.son) || (i === 1 ? 'lam' : undefined); }
  function apDung(man, cach) {
    var c = chuanCach(cach), g = kiemGhep(c, man);
    if (!g.ok) throw new Error(g.lyDo);
    var th = tim('than', c.than), ch = cauHinhCua(c);
    var kq = Object.assign({}, man);
    kq.manGoc = man.manGoc || man;
    kq.cachLapDaChon = c;
    kq.giaLap = giaCach(c);                                                                // máy chấm dùng cho sao "rẻ" (man.sao.re)
    var i = robotLapCua(man);
    if (i !== null) {                                                                      // M9D1: màn đội, lắp cho robot thứ i (man.lapRap.robot): gắn vào man.doi[i], không đụng robot khác
      if (!man.doi[i]) throw new Error('Màn không có robot thứ ' + (i + 1) + ' để lắp.');
      if (man.doi[i].coDinh) throw new Error('Robot thứ ' + (i + 1) + ' bị khoá, không lắp được.');
      var r = locCoMay(man.doi[i]), pinR = man.doi[i].pin !== undefined ? man.doi[i].pin : pinCua(man);
      r.loaiRobot = th.loai;
      if (c.than === 'drone' && pinR !== undefined && pinR !== null) { ch.camBien.push({ ma: 'pin', o: 'than' }); r.pin = pinR; }
      r.robot = { than: c.than, tay: c.tay, camBien: ch.camBien };
      var sonR = sonCua(man.doi[i], i); if (sonR) r.robot.son = sonR;
      r.hamGoc = hamGocCua(Object.assign({}, man, { hamGoc: man.doi[i].hamGoc || man.hamGoc }), c);
      delete r.son;
      kq.doi = man.doi.slice(); kq.doi[i] = r;
      if (i === 0) { kq.loaiRobot = r.loaiRobot; kq.robot = r.robot; kq.hamGoc = r.hamGoc; }   // trường đầu màn = R1 (quy ước màn đội)
    } else {
      kq.loaiRobot = th.loai;
      if (c.than === 'drone' && coPinMan(man)) { ch.camBien.push({ ma: 'pin', o: 'than' }); kq.pin = pinCua(man); }
      else delete kq.pin;
      delete kq.pinDrone;                                                                  // pin chỉ dành cho drone: thân khác thì lõi ném lỗi nếu còn pin
      kq.robot = { than: c.than, tay: c.tay, camBien: ch.camBien };
      kq.hamGoc = hamGocCua(man, c);
    }
    if (cach && cach.loiGiai) kq.loiGiai = loiGiaiCua(cach.loiGiai, man);                  // cách mẫu: máy kiểm / máy chấm chạy lời giải của chính cách này (màn đội: loiGiai.doi, robot khoá lấy maMau)
    return kq;
  }

  /* ------------------------------------------------------------- chọn đội (M9D1, mùa 9 chương 1; KE-HOACH-MUA-9-TO-HOP.md mục 7, 8, 9.4)
     man.chonDoi = {
       menu: ['CH', 'DR', 'CU'],              // mã cỗ máy (CoMay.DS) trên bảng chọn
       so: 2,                                  // (tuỳ chọn) số cỗ máy phải chọn; mặc định = số robot em lập trình (man.doi[i] không coDinh)
       trung: false,                           // (tuỳ chọn) true = được chọn cùng một cỗ máy cho hai robot; mặc định cấm trùng
       cachMau: [ { chon: ['CH', 'DR'], loiGiai: { doi: [{ chinh }, { chinh }], hamCuaMan?, hamCuaEmMoi? }, ghiChu? }, … ]   // đôi tốt đứng đầu (ứng với sao 3)
     }
     man.doi[i] của robot em lập trình chỉ khai phần riêng (batDau, co, son, pin cho drone…); cỗ máy do người chơi chọn điền vào (CoMay.dung). Robot khoá (coDinh) khai đủ như màn đội thường
     và chạy maMau.doi[i] (cham.js). chon[k] ứng với robot em lập trình thứ k theo thứ tự trong man.doi. */
  function chonDoiCua(man) { return (man && man.chonDoi) || null; }
  /** Chỉ số các robot em lập trình (không coDinh) của màn đội. */
  function robotEm(man) {
    var kq = [];
    (Array.isArray(man && man.doi) ? man.doi : []).forEach(function (r, i) { if (!r.coDinh) kq.push(i); });
    return kq;
  }
  function soChonCua(man) { var C = chonDoiCua(man); return C && typeof C.so === 'number' ? C.so : robotEm(man).length; }
  function tenCoMay(ma) { var d = CM().DS[ma]; return d ? d.ten : String(ma); }
  /** Lựa chọn `chon` (mảng mã cỗ máy) có hợp lệ với màn không: { ok, lyDo, ma: 'khong-chon-doi' | 'thieu' | 'thua' | 'khong-co' | 'trung' | null }. */
  function kiemChon(man, chon) {
    var C = chonDoiCua(man);
    if (!C) return { ok: false, ma: 'khong-chon-doi', lyDo: 'Màn này không phải màn chọn đội.' };
    chon = Array.isArray(chon) ? chon : [];
    var so = soChonCua(man), menu = C.menu || [];
    if (chon.length < so) return { ok: false, ma: 'thieu', lyDo: 'Chọn đủ ' + so + ' cỗ máy cho đội.' };
    if (chon.length > so) return { ok: false, ma: 'thua', lyDo: 'Đội này chỉ có ' + so + ' chỗ.' };
    for (var i = 0; i < chon.length; i++) {
      if (menu.indexOf(chon[i]) < 0) return { ok: false, ma: 'khong-co', lyDo: 'Bảng chọn không có ' + (CM().DS[chon[i]] ? tenCoMay(chon[i]).toLowerCase() : 'cỗ máy "' + chon[i] + '"') + '.' };
      if (C.trung !== true && chon.indexOf(chon[i]) < i) return { ok: false, ma: 'trung', lyDo: 'Hai bạn không chọn cùng một ' + tenCoMay(chon[i]).toLowerCase() + '.' };
    }
    return { ok: true, ma: null, lyDo: '' };
  }
  /** Mọi lựa chọn hợp lệ của màn (thứ tự theo menu; [R1, R2]): bảng chọn của giao diện / máy kiểm. */
  function dsCachChon(man) {
    var C = chonDoiCua(man), kq = [];
    if (!C) return kq;
    var so = soChonCua(man), menu = C.menu || [];
    (function de(dang) {
      if (dang.length === so) { if (kiemChon(man, dang).ok) kq.push(dang.slice()); return; }
      menu.forEach(function (m) { dang.push(m); de(dang); dang.pop(); });
    })([]);
    return kq;
  }
  /**
   * Gắn đội đã chọn vào màn: bản màn mới với man.doi[i] đủ loaiRobot / robot / hamGoc / cờ cỗ máy (CoMay.dung) cho từng robot em lập trình, robot khoá giữ nguyên.
   * `chon` là mảng mã hay một cách mẫu { chon, loiGiai } (khi đó kq.loiGiai = lời giải đội của cách ấy). Ném lỗi lời Việt khi chọn sai (kiemChon).
   */
  function apDungDoi(man, chon) {
    var cach = chon && !Array.isArray(chon) ? chon : null;
    chon = cach ? cach.chon : chon;
    var k = kiemChon(man, chon);
    if (!k.ok) throw new Error(k.lyDo);
    var kq = Object.assign({}, man), em = robotEm(man), CoMay = CM();
    kq.manGoc = man.manGoc || man;
    kq.chonDaChon = chon.slice();
    kq.doi = man.doi.map(function (r, i) {
      var j = em.indexOf(i);
      if (j < 0) return r;
      var goc = locCoMay(r), d = CoMay.dung(chon[j], { son: sonCua(r, i), pin: r.pin !== undefined ? r.pin : man.pin, co: r.coThem || undefined });
      delete goc.son; delete goc.coThem;
      return Object.assign(goc, d);
    });
    if (em.indexOf(0) >= 0) { kq.loaiRobot = kq.doi[0].loaiRobot; kq.robot = kq.doi[0].robot; kq.hamGoc = kq.doi[0].hamGoc; }   // trường đầu màn = R1 (quy ước màn đội)
    if (cach && cach.loiGiai) kq.loiGiai = loiGiaiCua(cach.loiGiai, man);
    return kq;
  }
  /** Lỗi dữ liệu chonDoi của màn (rỗng = ổn). */
  function kiemDuLieuDoi(man) {
    var C = chonDoiCua(man), ma = (man && man.ma) || '(màn)', loi = [], DS = CM().DS;
    function them(s) { loi.push(ma + ': ' + s); }
    if (!C) { them('thiếu chonDoi.'); return loi; }
    if (!Array.isArray(man.doi) || !man.doi.length) { them('màn chọn đội phải có man.doi.'); return loi; }
    if (!Array.isArray(C.menu) || C.menu.length < 2) them('chonDoi.menu cần ít nhất 2 cỗ máy.');
    (C.menu || []).forEach(function (m) { if (!DS[m]) them('chonDoi.menu có mã lạ "' + m + '".'); });
    var so = soChonCua(man), em = robotEm(man);
    if (so < 1 || so > em.length) them('chonDoi.so = ' + so + ' mà màn có ' + em.length + ' robot em lập trình.');
    if (C.trung !== true && so > (C.menu || []).length) them('bảng ' + (C.menu || []).length + ' cỗ máy không đủ chọn ' + so + ' khác nhau.');
    if (!Array.isArray(C.cachMau) || !C.cachMau.length) { them('chonDoi.cachMau cần ít nhất 1 cách mẫu.'); return loi; }
    var thay = {};
    C.cachMau.forEach(function (cm, i) {
      var nhan = 'cachMau[' + i + ']', r = kiemChon(man, cm.chon);
      if (!r.ok) them(nhan + ' (' + (cm.chon || []).join(' + ') + ') không hợp lệ: ' + r.lyDo);
      var khoa = (cm.chon || []).join('|');
      if (thay[khoa] !== undefined) them(nhan + ' trùng với cachMau[' + thay[khoa] + '].'); else thay[khoa] = i;
      if (!cm.loiGiai || !Array.isArray(cm.loiGiai.doi) || cm.loiGiai.doi.length < em.length) them(nhan + ' thiếu loiGiai.doi (mỗi robot em lập trình một chương trình).');
    });
    return loi;
  }
  /** Chạy lời giải từng cách mẫu chọn đội qua máy chấm: [{ chon, ten, thang, nhip, o, sao, loi }]. */
  function thongKeMauDoi(man, kho) {
    var C = chonDoiCua(man), cham = chamHoc(), kq = [];
    if (!C || !cham) return kq;
    (C.cachMau || []).forEach(function (cm) {
      var mau = { chon: (cm.chon || []).slice(), ten: (cm.chon || []).map(tenCoMay).join(' + '), thang: false, nhip: null, o: null, sao: 0, loi: null, ghiChu: cm.ghiChu || '' };
      try {
        var m = apDungDoi(man, cm), lg = m.loiGiai || loiGiaiCua({ doi: [] }, man);
        var r = cham.cham(m, baiCua(lg), (kho || []).concat(lg.hamCuaEmMoi || []));
        mau.thang = !!r.thang; mau.nhip = r.soNhip; mau.o = r.soO; mau.sao = r.sao;
      } catch (e) { mau.loi = e.message; }
      kq.push(mau);
    });
    return kq;
  }
  /** Kiểm cân màn chọn đội: dữ liệu + mọi cách mẫu thắng + cachMau[0] đạt 3 sao (mảng lỗi; rỗng = ổn). */
  function kiemCanManDoi(man, kho) {
    var loi = kiemDuLieuDoi(man), ma = (man && man.ma) || '(màn)';
    if (loi.length) return loi;
    var tk = thongKeMauDoi(man, kho);
    tk.forEach(function (x, i) {
      if (x.loi) loi.push(ma + ': cachMau[' + i + '] (' + x.ten + ') chấm lỗi: ' + x.loi);
      else if (!x.thang) loi.push(ma + ': cachMau[' + i + '] (' + x.ten + ') không thắng.');
    });
    if (loi.length) return loi;
    var ss = man.sao || {};
    if ((ss.nhip !== undefined && tk[0].nhip > ss.nhip) || (ss.o !== undefined && tk[0].o > ss.o)) loi.push(ma + ': cachMau[0] (' + tk[0].ten + ') phải đạt 3 sao: ' + tk[0].nhip + ' nhịp, ' + tk[0].o + ' ô so với sao ' + JSON.stringify(ss) + '.');
    return loi;
  }

  /**
   * Màn lắp ráp ở dạng "bản mặc định": điền (nếu màn chưa khai) loaiRobot, robot, hamGoc và loiGiai theo cách lắp mẫu ĐẦU TIÊN (cachLap[0], cách ứng với sao 3), để mọi chỗ đọc thẳng
   * ManHoc.danhSach (máy kiểm chung, Sổ lệnh, Gỡ lỗi) thấy một màn đủ trường. Giao diện không chơi bản này mà chơi apDung(màn, cách người chơi chọn). man-chuoi-1.js gọi hàm này trong chuanHoa.
   */
  function macDinh(man) {
    var C = chonDoiCua(man), i = robotLapCua(man), a;
    if (C && Array.isArray(C.cachMau) && C.cachMau.length && kiemChon(man, C.cachMau[0].chon).ok) {   // M9D1: màn chọn đội: bản mặc định = cách mẫu đầu (đôi tốt)
      a = apDungDoi(man, C.cachMau[0]);
      man.doi = man.doi.map(function (r, j) { return Object.assign({}, a.doi[j], r); });
      ['loaiRobot', 'robot', 'hamGoc'].forEach(function (k) { if (man[k] === undefined) man[k] = a[k]; });
      if (!man.loiGiai && a.loiGiai) man.loiGiai = a.loiGiai;
    }
    var L = lapRapCua(man);
    if (!L || !Array.isArray(L.cachLap) || !L.cachLap.length || !kiemGhep(L.cachLap[0], man).ok) return man;
    if (i !== null && (!man.doi[i] || man.doi[i].coDinh)) return man;
    a = apDung(man, L.cachLap[0]);
    if (i !== null) {                                                                      // M9D1: lắp cho robot thứ i của màn đội: điền man.doi[i] (và trường đầu màn khi i = 0)
      man.doi[i] = Object.assign({}, a.doi[i], man.doi[i]);
      if (i === 0) ['loaiRobot', 'robot', 'hamGoc'].forEach(function (k) { if (man[k] === undefined) man[k] = a[k]; });
      if (!man.loiGiai && a.loiGiai) man.loiGiai = a.loiGiai;
      return man;
    }
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
      if (robotLapCua(man) !== null) { if (!cl.loiGiai || !Array.isArray(cl.loiGiai.doi)) them(nhan + ' thiếu loiGiai.doi (màn đội lắp robot thứ ' + (robotLapCua(man) + 1) + ').'); }
      else if (!cl.loiGiai || !Array.isArray(cl.loiGiai.chinh)) them(nhan + ' thiếu loiGiai.chinh.');
    });
    var ri = robotLapCua(man);
    if (ri !== null && (!man.doi[ri] || man.doi[ri].coDinh)) them('lapRap.robot = ' + ri + ' không phải robot em lập trình của màn.');
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
        var r = cham.cham(m, baiCua(lg), (kho || []).concat(lg.hamCuaEmMoi || []));
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
    KHE.forEach(function (k) { DANH_MUC[k].forEach(function (d) { d.ham.concat(d.nangCap || []).forEach(function (h) { if (kq.indexOf(h) < 0) kq.push(h); }); }); });
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
    kiemGhep: kiemGhep, moLaiCua: moLaiCua, kiemCachLap: kiemCachLap, dsCachLap: dsCachLap, apDung: apDung, cachMacDinh: cachMacDinh, khongQua: khongQua, dsKhe: dsKhe,
    macDinh: macDinh, kiemDuLieu: kiemDuLieu, kiemCanMan: kiemCanMan, thongKeMau: thongKeMau, khoMau: khoMau, honHan: honHan, cachBiHonHan: cachBiHonHan, lenhKhongCon: lenhKhongCon, veVector: VV, bangGhep: BG,
    // M9D1: màn đội chọn đội (man.chonDoi) và lắp cho một robot của màn đội (man.lapRap.robot)
    coMay: CM, robotLapCua: robotLapCua, robotEm: robotEm, soChonCua: soChonCua, kiemChon: kiemChon, dsCachChon: dsCachChon, apDungDoi: apDungDoi, kiemDuLieuDoi: kiemDuLieuDoi, thongKeMauDoi: thongKeMauDoi, kiemCanManDoi: kiemCanManDoi, loiGiaiCua: loiGiaiCua, baiCua: baiCua
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.LapRap = API;
})();
