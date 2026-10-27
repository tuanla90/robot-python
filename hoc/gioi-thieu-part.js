/* ============================================================================
   gioi-thieu-part.js — "Robot Chấn Hưng": THẺ GIỚI THIỆU TỪNG BỘ PHẬN (window.GioiThieuPart). Chỉ dữ liệu + phép chọn, không đụng DOM (máy kiểm kiem-gioi-thieu-part.mjs).

   Mỗi bộ phận (thân, tay, cảm biến) có một thẻ: làm gì, các lệnh gốc nó mở ra, cách ghép lệnh trong một nhịp, giỏi gì, không làm được gì.
   Thẻ hiện ở đầu màn ĐẦU TIÊN mà robot có bộ phận đó (game/the-part.js); bộ phận được mở thêm lệnh ở chương sau (vd. bánh lùi ở Chế lệnh xe)
   thì hiện thẻ "lệnh mới" chỉ với phần mới. Xem lại được ở Sổ lệnh, trang "Bộ phận".

   GioiThieuPart.DS          { mã: { khe: 'than'|'tay'|'camBien', ten, moTa, lenh: [tên lệnh gốc], moTaLenh?: { lệnh: câu thay câu của SoLenh },
                                     ghep?: [{ lenh: [..], ra, ket?: { x, y, huong, quayDo? } } (ket: robot đứng (2,2) mặt lên trên sân trống 5×5, chạy đúng các lệnh này thì tới đây; máy kiểm chạy thật)], gioi: [muc], khong: [muc], luuY?: [muc] } }
                              muc = chuỗi, hoặc { chu, can?: [lệnh] (chỉ hiện khi robot có đủ các lệnh này), than?: mã thân (chỉ hiện với thân đó) }
   GioiThieuPart.THU_TU      thứ tự hiện các mã (thân → tay → cảm biến)
   GioiThieuPart.boPhanCua(cauHinh, hamGoc)   → [{ ma, lenh: [lệnh của bộ phận có trong hamGoc] }]   bộ phận robot của màn đang dùng
                              cauHinh = VeRobot.cauHinhCua(man) ({ than, tay, camBien: [{ ma }] }); hamGoc = man.hamGoc.
   GioiThieuPart.noiDung(ma, lenh, chiMoi, than)  → { ma, khe, ten, moTa, lenh: [{ ten, moTa }], ghep: [..], gioi: [chuỗi], khong: [chuỗi], luuY: [chuỗi] }
                              lenh = các lệnh robot đang có; chiMoi = [lệnh mới] (thẻ "lệnh mới": chỉ lấy phần dính tới lệnh mới), không có = thẻ đầy đủ.
   Lời: lớp 5, câu ngắn, đúng luật lõi (san-hoc.js). Đổi luật lõi thì sửa thẻ ở đây.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back'];
  var DI = ['go_up', 'go_down', 'go_left', 'go_right'];

  var DS = {
    /* ------------------------------------------------------------ THÂN */
    'hai-banh': {
      khe: 'than', ten: 'Thân hai bánh',
      moTa: 'Xe có hai bánh, mỗi bánh nghe một lệnh riêng. Xe này KHÔNG có lệnh move(): muốn xe đi thì ra lệnh cho từng bánh, rồi gọi wait().',
      lenh: BANH.concat(['wait']),
      ghep: [
        { lenh: ['left_move', 'right_move', 'wait'], ra: 'Tiến 1 ô', ket: { x: 2, y: 1, huong: 0 } },
        { lenh: ['left_move', 'wait'], ra: 'Quay phải tại chỗ', ket: { x: 2, y: 2, huong: 1 } },
        { lenh: ['right_move', 'wait'], ra: 'Quay trái tại chỗ', ket: { x: 2, y: 2, huong: 3 } },
        { lenh: ['left_back', 'right_back', 'wait'], ra: 'Lùi 1 ô', ket: { x: 2, y: 3, huong: 0 } },
        { lenh: ['left_move', 'right_back', 'wait'], ra: 'Quay đầu', ket: { x: 2, y: 2, huong: 2 } }
      ],
      gioi: ['Rẻ, dễ điều khiển', 'Quay 90° chỉ trong một nhịp'],
      khong: ['Không leo được bậc thang', 'Không đi ngang được', 'Đứng trên băng chuyền đủ 2 nhịp thì bị đẩy đi 1 ô'],
      luuY: ['Lệnh bánh chỉ là RA LỆNH. Xe đứng yên cho tới khi gặp wait().', 'Một nhịp = các lệnh bánh + một wait(). Hết nhịp thì bánh dừng.',
        { chu: 'Chương sau em sẽ tự chế move() từ các lệnh này.', can: ['left_move', 'right_move'] }]
    },
    'xich': {
      khe: 'than', ten: 'Thân bánh xích',
      moTa: 'Cùng lệnh với xe hai bánh, nhưng bánh là hai dải xích bám chắc.',
      lenh: BANH.concat(['wait']),
      ghep: [
        { lenh: ['left_move', 'right_move', 'wait'], ra: 'Tiến 1 ô', ket: { x: 2, y: 1, huong: 0 } },
        { lenh: ['left_back', 'right_back', 'wait'], ra: 'Lùi 1 ô', ket: { x: 2, y: 3, huong: 0 } },
        { lenh: ['left_move', 'wait'], ra: 'Nhích nửa vòng sang phải; nhịp sau làm y vậy thì quay xong', ket: { x: 2, y: 2, huong: 0, quayDo: 1 } },
        { lenh: ['right_move', 'wait'], ra: 'Nhích nửa vòng sang trái; nhịp sau làm y vậy thì quay xong', ket: { x: 2, y: 2, huong: 0, quayDo: -1 } }
      ],
      gioi: ['Leo được bậc thang', 'Băng chuyền không đẩy được xích'],
      khong: ['Quay chậm: cần 2 nhịp liền, ra lệnh giống nhau, mới quay xong 90°', 'Nhịp sau làm việc khác thì phần quay dở bị mất', 'Không quay đầu trong một nhịp'],
      luuY: ['Lệnh bánh chỉ là ra lệnh, wait() mới cho xe chạy một nhịp.']
    },
    'omni': {
      khe: 'than', ten: 'Thân bánh omni',
      moTa: 'Có đủ lệnh của xe hai bánh, thêm hai lệnh trượt ngang.',
      lenh: BANH.concat(['slide_left', 'slide_right', 'wait']),
      ghep: [
        { lenh: ['left_move', 'right_move', 'wait'], ra: 'Tiến 1 ô', ket: { x: 2, y: 1, huong: 0 } },
        { lenh: ['left_move', 'wait'], ra: 'Quay phải tại chỗ', ket: { x: 2, y: 2, huong: 1 } },
        { lenh: ['slide_right', 'wait'], ra: 'Trượt sang phải 1 ô, mặt giữ nguyên', ket: { x: 3, y: 2, huong: 0 } },
        { lenh: ['slide_left', 'wait'], ra: 'Trượt sang trái 1 ô, mặt giữ nguyên', ket: { x: 1, y: 2, huong: 0 } }
      ],
      gioi: ['Đi ngang mà không cần quay', 'Quay 90° trong một nhịp như xe hai bánh'],
      khong: ['Không đi chéo: nhịp có trượt thì lệnh bánh bị bỏ', 'Không leo được bậc thang', 'Bánh trơn: đứng trên băng chuyền 1 nhịp đã bị đẩy; đi ngược băng thì đứng im'],
      luuY: ['Trượt tính theo hướng mặt xe: slide_left() là sang bên trái của xe, không phải bên trái màn hình.']
    },
    'nhen': {
      khe: 'than', ten: 'Thân nhện',
      moTa: 'Bốn chân, đi lên, xuống, trái, phải theo màn hình. Nhện không có mặt trước nên không cần quay.',
      lenh: DI.concat(['wait', 'crouch', 'stand']),
      moTaLenh: { go_up: 'Bước lên một ô, mất 2 nhịp', go_down: 'Bước xuống một ô, mất 2 nhịp', go_left: 'Bước sang trái một ô, mất 2 nhịp', go_right: 'Bước sang phải một ô, mất 2 nhịp',
        wait: 'Đứng yên một nhịp', crouch: 'Co chân lại, thấp xuống', stand: 'Duỗi chân ra; duỗi ngay lúc bước khi đang co là nhảy' },
      ghep: [
        { lenh: ['crouch', 'wait'], ra: 'Co chân: thấp xuống, chui được gầm thấp' },
        { lenh: ['crouch', 'wait', 'stand', 'go_right'], ra: 'Co chân, rồi duỗi chân cùng lúc bước: nhảy qua 1 ô' }
      ],
      gioi: ['Đi 4 hướng mà không phải quay', 'Leo được bậc thang', { chu: 'Co chân chui qua gầm thấp', can: ['crouch'] }, { chu: 'Nhảy qua hố', can: ['crouch', 'stand'] }],
      khong: ['Chậm: mỗi bước mất 2 nhịp', { chu: 'Đứng thẳng thì không chui được gầm thấp', can: ['crouch'] }, 'Bước vào hố là rơi', 'Đi ngược băng chuyền thì bị đẩy về, đứng im'],
      luuY: ['Mỗi lệnh go_…() tự chạy đủ 2 nhịp, không cần wait().']
    },
    'drone': {
      khe: 'than', ten: 'Thân drone',
      moTa: 'Bay trên cao, đi lên, xuống, trái, phải theo màn hình.',
      lenh: DI.concat(['wait', 'battery']),
      moTaLenh: { go_up: 'Bay lên một ô, 1 nhịp', go_down: 'Bay xuống một ô, 1 nhịp', go_left: 'Bay sang trái một ô, 1 nhịp', go_right: 'Bay sang phải một ô, 1 nhịp',
        wait: 'Lơ lửng một nhịp', battery: 'Hỏi: pin còn bao nhiêu' },
      gioi: ['Nhanh: mỗi lệnh go_…() là 1 nhịp, 1 ô', 'Bay qua hàng rào thấp, băng chuyền, vật, bậc thang'],
      khong: ['Không qua được tường cao, cửa đóng, mép sân', 'Không gắn được tay kẹp, máy ném, súng hơi',
        { chu: 'Mỗi nhịp tốn 1 pin, kể cả nhịp wait(). Hết pin là rơi.', can: ['battery'] }],
      luuY: [{ chu: 'Dừng ở ô sạc P thì pin sạc đầy ở cuối nhịp.', can: ['battery'] }]
    },

    /* ------------------------------------------------------------ TAY */
    'kep': {
      khe: 'tay', ten: 'Tay kẹp',
      moTa: 'Tay gắn trước mũi xe, nhặt vật ở ô ngay trước mặt.',
      lenh: ['arm_down', 'arm_up', 'grab', 'release'],
      ghep: [
        { lenh: ['arm_down', 'grab', 'wait'], ra: 'Hạ tay rồi kẹp vật, trong một nhịp' },
        { lenh: ['arm_up', 'wait'], ra: 'Nâng vật lên, xe đi được' },
        { lenh: ['arm_down', 'release', 'wait'], ra: 'Hạ tay rồi đặt vật xuống' }
      ],
      gioi: ['Nhặt vật lên, mang đi, đặt xuống'],
      khong: ['Vật nằm đất: phải hạ tay rồi mới kẹp được', 'Tay đang hạ thì xe không đi được', 'Thả vật lúc tay đang nâng thì vật rơi vỡ'],
      luuY: ['Lệnh tay cũng chỉ là ra lệnh, wait() mới làm.', 'Trong một nhịp: tay nâng / hạ trước, rồi mới kẹp / thả.']
    },
    'xoay': {
      khe: 'tay', ten: 'Tay xoay',
      moTa: 'Tay kẹp có khớp xoay: chỉ ra trước, sang trái hoặc sang phải xe.',
      lenh: ['arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right'],
      gioi: ['Nhặt, đặt vật ở hai bên mà không cần quay xe'],
      khong: ['Mỗi lệnh chỉ xoay một nấc', 'Vẫn phải hạ tay mới kẹp vật nằm đất; tay hạ thì xe không đi'],
      luuY: ['grab() và release() làm ở ô mà tay đang chỉ tới.']
    },
    'nam-cham': {
      khe: 'tay', ten: 'Nam châm',
      moTa: 'Nam châm chữ U trước mũi xe. Bật cực N hoặc S để hút vật từ xa.',
      lenh: ['magnet_n', 'magnet_s', 'magnet_off'],
      moTaLenh: { magnet_n: 'Bật nam châm cực N, màu đỏ', magnet_s: 'Bật nam châm cực S, màu xanh dương' },
      gioi: ['Hút vật sắt cách tới 2 ô về dính ở mũi xe', 'Vật nam châm: khác cực thì hút, cùng cực thì đẩy ra xa, tầm 3 ô'],
      khong: ['Không hút được vật gỗ', 'Không đẩy được vật sắt', 'Mỗi lần chỉ dính một vật'],
      luuY: ['magnet_off() ngắt điện, thả vật xuống ô trước mũi.', { chu: 'Trên drone, nam châm treo dưới bụng: hút và thả vật ở ô ngay dưới.', than: 'drone' }]
    },
    'nem': {
      khe: 'tay', ten: 'Máy ném',
      moTa: 'Rổ ném trước mũi xe: nạp vật vào rổ rồi ném đi xa.',
      lenh: ['aim', 'load', 'throw'],
      ghep: [{ lenh: ['aim', 'load', 'wait', 'throw', 'wait'], ra: 'Chọn tầm, nạp vật, ném' }],
      gioi: ['Vật bay qua hàng rào, tường, băng chuyền', 'Rơi đúng n ô phía trước'],
      khong: ['Rổ chỉ chứa 1 vật', 'Ô rơi là tường, rào, bậc thang, mép sân hay đã có vật thì vật vỡ', 'Nhịp nạp hoặc ném thì xe đứng yên'],
      luuY: ['aim(n) chọn tầm 1, 2 hoặc 3 ô, đổi ngay, không tốn nhịp.', 'load() nạp vật ở ô trước mặt; throw() ném theo hướng mặt xe.']
    },
    'son': {
      khe: 'tay', ten: 'Máy sơn',
      moTa: 'Đầu sơn có chổi dưới mũi xe, tô ô xe đang đứng.',
      lenh: ['ink', 'dot', 'pen_down', 'pen_up'],
      ghep: [{ lenh: ['ink', 'dot', 'wait'], ra: 'Chọn màu rồi chấm ô đang đứng' }, { lenh: ['pen_down', 'wait'], ra: 'Hạ đầu sơn: tô ô đang đứng, giữ sơn' }],
      gioi: ['Chấm từng ô, hay giữ sơn để vẽ nét liền', 'Đầu sơn hạ thì xe rẽ góc vẫn liền nét', 'Tô lại một ô thì màu mới đè màu cũ'],
      khong: ['Tô ra ngoài hình thì không xóa được', 'Mỗi nhịp đầu sơn chỉ làm một việc'],
      luuY: ['Đầu sơn hạ thì xe đi tới đâu tô tới đó, kể cả lúc quay tại chỗ.', 'ink() chọn màu ngay, không tốn nhịp: "red", "green", "blue", "yellow".', 'dot(), pen_down(), pen_up() chỉ là ra lệnh, wait() mới làm.']
    },
    'hoi': {
      khe: 'tay', ten: 'Súng hơi',
      moTa: 'Hai nòng: shoot() bắn ra trước, shoot_back() bắn ra sau.',
      lenh: ['shoot', 'shoot_back'],
      gioi: ['Bóng bay thẳng; trúng nút thì nút đổi: cửa mở / đóng, băng chuyền bật / tắt', 'Giật: bắn ra trước thì xe lùi 1 ô, bắn ra sau thì xe tiến 1 ô', 'Xe giật vào thùng nặng thì thùng trượt tới khi gặp vật cản'],
      khong: ['Một nhịp chỉ bắn một phát', 'Nhịp bắn thì bánh nghỉ', 'Chạy bánh húc vào thùng nặng thì không đẩy được'],
      luuY: ['Lệnh bắn cũng chỉ là ra lệnh, wait() mới bắn.', 'Ở các màn Lực bắn, lệnh bắn nhận một lực: "charge" bắn tụ như thường, bay xa và xe giật; "fast" bắn nhanh, bóng bay 2 ô và xe không giật.']
    },

    /* ------------------------------------------------------------ CẢM BIẾN */
    'khoang-cach': {
      khe: 'camBien', ten: 'Cảm biến khoảng cách',
      moTa: 'Gắn ở hông xe, cho biết ô ngay cạnh xe có trống không.',
      lenh: ['front_clear', 'left_clear', 'right_clear'],
      gioi: ['Hỏi không tốn nhịp', 'Dùng trong if, while để xe tự quyết định'],
      khong: ['Chỉ thấy ô sát bên, không thấy xa hơn', 'Không biết màu, không biết vật gì'],
      luuY: [{ chu: 'front_clear() trả True khi ô trước mặt trống; tường, mép sân, vật, thùng nặng thì trả False.', can: ['front_clear'] }]
    },
    'tu': {
      khe: 'camBien', ten: 'Cảm biến từ',
      moTa: 'Gắn cạnh cảm biến khoảng cách, cho biết vật phía trước là sắt hay nam châm.',
      lenh: ['front_metal', 'front_pole'],
      gioi: ['Hỏi không tốn nhịp', { chu: 'front_metal() trả True khi vật gần nhất phía trước là sắt và cách xe tới 2 ô', can: ['front_metal'] },
        { chu: 'front_pole() trả "N" hoặc "S" khi vật gần nhất trong 3 ô là nam châm', can: ['front_pole'] }],
      khong: ['Vật gỗ, tường, không có gì: front_metal() là False, front_pole() là "none"'],
      luuY: []
    },
    'hong-ngoai': {
      khe: 'camBien', ten: 'Cảm biến hồng ngoại',
      moTa: 'Mắt đỏ ở mũi xe, đo xem phía trước còn mấy ô trống.',
      lenh: ['distance', 'warm'],
      gioi: ['Hỏi không tốn nhịp', { chu: 'distance() trả một SỐ: số ô trống tới vật cản; sát vật cản là 0. Dùng được trong phép so sánh, như if distance() > 2:', can: ['distance'] },
        { chu: 'warm() trả True khi vật cản trước mặt NÓNG: robot khác, hay nút bắn đang bật', can: ['warm'] }],
      khong: ['Chỉ nhìn thẳng phía trước, không nhìn hai bên', 'Không biết vật cản là gì, chỉ biết cách bao xa', { chu: 'Nút đang tắt, cửa, thùng, tường thì warm() là False', can: ['warm'] }],
      luuY: [{ chu: 'Tường, mép sân, cửa đóng, thùng nặng, vật nằm đất, robot khác đều chắn tia.', can: ['distance'] }, { chu: 'Cùng một tia với distance(): warm() chỉ xét vật cản đầu tiên.', can: ['warm'] }]
    },
    'mau': {
      khe: 'camBien', ten: 'Cảm biến màu ở bụng',
      moTa: 'Gắn dưới bụng xe, đọc màu sàn ở ô xe đang đứng.',
      lenh: ['color'],
      moTaLenh: { color: 'Đọc màu sàn dưới bụng xe' },
      gioi: ['color() trả "red", "green", "blue", "yellow" hoặc "none"', 'Đọc không tốn nhịp, kể cả lúc đang mang vật'],
      khong: ['Không thấy ô trước mặt', 'Không biết vật màu gì'],
      luuY: ['Muốn biết màu của vật thì cần camera.', 'Ô đã có sơn thì color() đọc màu sơn, không đọc màu sàn bên dưới.']
    },
    'camera': {
      khe: 'camBien', ten: 'Camera trước',
      moTa: 'Hai mắt trên thân xe, nhìn ô ngay trước mặt.',
      lenh: ['color'],
      moTaLenh: { color: 'Đọc màu ở ô trước mặt' },
      gioi: ['Có vật trước mặt thì color() cho màu của vật, không có thì màu sàn ô đó', 'Đọc không tốn nhịp'],
      khong: ['Tường, rào, thùng, cửa đóng, mép sân: color() trả "none"', 'Không gắn chung với cảm biến màu ở bụng'],
      luuY: ['Cùng tên color() với cảm biến màu, nhưng đọc chỗ khác. Kết quả của hàm tùy vào bộ phận gắn trên xe.']
    },
    'camera-bay': {
      khe: 'camBien', ten: 'Camera bụng drone',
      moTa: 'Ống kính dưới bụng drone, nhìn ô ngay bên dưới.',
      lenh: ['look'],
      gioi: ['look() cho màu của vật bên dưới; không có vật thì màu sàn', 'Đọc không tốn nhịp'],
      khong: ['Chỉ thấy ô ngay dưới drone', 'Chỉ gắn được trên drone'],
      luuY: []
    }
  };
  var THU_TU = ['hai-banh', 'xich', 'omni', 'nhen', 'drone', 'kep', 'xoay', 'nam-cham', 'nem', 'hoi', 'son', 'khoang-cach', 'tu', 'hong-ngoai', 'mau', 'camera', 'camera-bay'];
  var TEN_KHE = { than: 'Thân', tay: 'Tay', camBien: 'Cảm biến' };

  function co(ds, x) { return ds.indexOf(x) >= 0; }
  function giao(a, b) { return a.filter(function (x) { return co(b, x); }); }

  /** Bộ phận robot của màn: thân luôn có; tay khi màn khai tay và có lệnh tay; cảm biến theo lệnh cảm biến trong hamGoc. */
  function boPhanCua(cauHinh, hamGoc) {
    var c = cauHinh || {}, goc = hamGoc || [], kq = [];
    var cam = (c.camBien || []).map(function (x) { return x.ma; });
    function them(ma) { var d = DS[ma]; if (!d) return; var l = giao(d.lenh, goc); if (l.length || d.khe === 'than') kq.push({ ma: ma, lenh: l }); }
    them(c.than || 'hai-banh');
    if (c.tay) them(c.tay);
    them('khoang-cach');
    them('tu');
    them('hong-ngoai');
    if (co(goc, 'color')) them(co(cam, 'camera') ? 'camera' : 'mau');
    them('camera-bay');
    return kq;
  }

  function hienMuc(m, lenh, than) {
    if (typeof m === 'string') return true;
    if (m.can && !m.can.every(function (x) { return co(lenh, x); })) return false;
    if (m.than && m.than !== than) return false;
    return true;
  }
  function chuMuc(m) { return typeof m === 'string' ? m : m.chu; }
  function dungMoi(m, chiMoi) { return !!(m && typeof m !== 'string' && m.can && m.can.some(function (x) { return co(chiMoi, x); })); }

  /** Nội dung thẻ của bộ phận ma cho robot có các lệnh `lenh`. chiMoi: chỉ phần dính tới các lệnh mới. moTaGoc: { lệnh: câu } (SoLenh.lenhGoc). */
  function noiDung(ma, lenh, chiMoi, than, moTaGoc) {
    var d = DS[ma]; if (!d) return null;
    lenh = lenh || [];
    var moi = chiMoi && chiMoi.length ? chiMoi : null;
    var dsLenh = d.lenh.filter(function (x) { return co(lenh, x) && (!moi || co(moi, x)); }).map(function (x) {
      return { ten: x, moTa: (d.moTaLenh && d.moTaLenh[x]) || (moTaGoc && moTaGoc[x]) || '' };
    });
    var ghep = (d.ghep || []).filter(function (g) {
      var can = g.lenh.filter(function (x) { return x !== 'wait'; });
      if (!can.every(function (x) { return co(lenh, x); })) return false;
      if (co(g.lenh, 'wait') && co(d.lenh, 'wait') && !co(lenh, 'wait')) return false;
      return !moi || can.some(function (x) { return co(moi, x); });
    });
    function loc(ds) {
      return (ds || []).filter(function (m) { return hienMuc(m, lenh, than) && (!moi || dungMoi(m, moi)); }).map(chuMuc);
    }
    return { ma: ma, khe: d.khe, tenKhe: TEN_KHE[d.khe], ten: d.ten, moTa: moi ? '' : d.moTa, lenh: dsLenh, ghep: ghep, gioi: loc(d.gioi), khong: loc(d.khong), luuY: loc(d.luuY), laMoi: !!moi };
  }

  var API = { DS: DS, THU_TU: THU_TU, TEN_KHE: TEN_KHE, boPhanCua: boPhanCua, noiDung: noiDung };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.GioiThieuPart = API;
})();
