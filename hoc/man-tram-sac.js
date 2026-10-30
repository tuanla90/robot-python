/* ============================================================================
   man-tram-sac.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 5 "Trạm sạc" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 30/10).
   User 29/10: drone nâng cấp phải ĐÁP ĐẤT mới sạc, sạc đầy luôn, tránh bay đậu nhiều lần; pin gốc 5–6. User 30/10 chọn phương án A: màn drone cũ dựng quanh
   sạc tự động trên P (drone.4, .5, .6, .10, che-drone.5, .8, .9, .10) sang mùa 5; gói 5 dựng màn mới.
     - `tram-sac`: chương 1 "Đáp đất sạc pin" (màn mới tram-sac.1 … .10).
     - `che-drone`: chương 2 "Chế lệnh: bay xa": màn có sẵn che-drone.1, .2, .3, .4, .6, .7 (không ô sạc) + màn mới che-drone.11 … .14.
   Cái mới của gói: NÂNG CẤP drone: land() hạ xuống ô đang ở, trên ô sạc P thì pin đầy ngay; take_off() cất cánh; đang đậu không bay được; nhịp đậu trọn không
   tốn pin (san-hoc.js phần DRONE, ĐÁP ĐẤT ĐỂ SẠC). Khay mọi màn: bay + land / take_off + battery().
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-dap-sac.mjs (lõi).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var DAP = ['land', 'take_off', 'battery'];
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }

  /** Drone nâng cấp đáp đất (land / take_off), có pin; m.nam: true thì treo thêm nam châm (chở hộp). */
  function man(m) {
    var nam = m.nam;
    delete m.nam;
    m.chuong = m.chuong || 'tram-sac';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: nam ? 'nam-cham' : null, camBien: [] };
    m.hamGoc = m.hamGoc || BAY.concat(nam ? NC : [], DAP);
    m.mucTieu = m.mucTieu || (nam ? 'dua-vat' : 'toi-co');
    if (nam) { m.vatCan = 'sat'; m.nhipTheoLoiGiai = true; }
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }
  function manChe(m) { m.chuong = 'che-drone'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }

  var C_DEMO = LAP(3, 'go_right()').concat(['land()', 'take_off()'], LAP(3, 'go_right()'));
  var C_HAI_TRAM = ['for i in range(2):', '    for j in range(3):', '        go_right()', '    land()', '    take_off()', 'for j in range(3):', '    go_right()'];
  var C_PIN_YEU = LAP(5, ['go_right()', 'go_right()', 'if battery() < 3:', '    land()', '    take_off()']);
  var C_MAI = LAP(3, 'go_right()').concat(['go_up()', 'land()', 'take_off()', 'go_down()'], LAP(4, 'go_right()'));
  var C_IT_NHAT = LAP(8, ['go_right()', 'if battery() < 2:', '    land()', '    take_off()']);
  var SAN_IT_NHAT = ['...PPP.PF'];
  var C_DOCK = ['for j in range(2):', '    go_right()', 'dock()', 'for j in range(3):', '    go_right()'];
  var C_STOP = ['for j in range(3):', '    go_right()', 'charge_stop()', 'for j in range(4):', '    go_right()'];
  var C_BAY_SAC = ['fly_dock(3)', 'fly_dock(3)', 'for j in range(3):', '    go_right()'];
  var T_BAY_SAC = ['for i in range(n):', '    go_right()', 'dock()'];
  var C_CAU = ['go_right()', 'magnet_n()', 'wait()', 'fly_dock(2)', 'fly_dock(3)', 'for j in range(3):', '    go_right()', 'magnet_off()', 'wait()'];
  var T_SAFE = ['for i in range(n):', '    go_right()', '    if battery() < 2:', '        dock()'];

  var DS = [
    man({
      so: 1, ten: 'Đáp xuống ô sạc', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, pin: 4, hamCuaEmCan: [],
      deBai: 'Em nâng cấp drone: land() hạ cánh xuống ô đang ở, take_off() cất cánh. Đáp xuống ô sạc P thì pin đầy ngay; bay ngang qua P thì không sạc. ' +
        'Pin chỉ có 4, cờ cách 6 ô. Bấm Chạy xem drone bay tới ô sạc, đáp, sạc đầy, cất cánh rồi bay tiếp tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn thanh pin cạn dần, đầy lại lúc drone đáp trên ô P.',
      san: ['...P..F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_DEMO),
      loiGiai: bai(C_DEMO),
      sao: { o: 6, nhip: 8 },
      goiY: ['Đáp mới sạc: bay ngang qua P không sạc.', 'Đang đậu thì phải take_off() rồi mới bay được.']
    }),

    man({
      so: 2, ten: 'Ghé trạm sạc', hang: 'lam-quen', pin: 4, hamCuaEmCan: [],
      deBai: 'Pin có 4, cờ cách 5 ô: bay thẳng thì hết pin giữa đường. Ô sạc P nằm trên đường bay. Đáp xuống ô sạc, cất cánh rồi bay tiếp.',
      veMaMau: 'Chương trình có sẵn bay thẳng một mạch. Chạy thử, xem drone hết pin ở đâu.',
      san: ['..P..F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(5, 'go_right()')),
      loiGiai: bai(LAP(2, 'go_right()').concat(['land()', 'take_off()'], LAP(3, 'go_right()'))),
      sao: { o: 6, nhip: 7 },
      loiSai: [
        { moTa: 'Bay thẳng, không đáp: hết pin trước cờ', baiLam: bai(LAP(5, 'go_right()')), phaiCoMa: ['het-pin'] },
        { moTa: 'Đáp mà quên cất cánh: drone đứng yên ở trạm', baiLam: bai(LAP(2, 'go_right()').concat(['land()'], LAP(3, 'go_right()'))), phaiCoMa: ['dang-dau'] },
        { moTa: 'Dừng trên P mà không đáp: không sạc', baiLam: bai(LAP(2, 'go_right()').concat(['wait()'], LAP(3, 'go_right()'))), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Trạm sạc ở ô thứ ba: bay hai ô là tới.', 'land() rồi take_off(): hai nhịp, pin đầy.']
    }),

    man({
      so: 3, ten: 'Trạm trên mái', hang: 'lam-quen', pin: 5, hamCuaEmCan: [],
      deBai: 'Ô sạc nằm trên mái nhà, ngay phía trên ô thứ tư của con phố. Pin có 5, cờ cách 6 ô. Bay lên trạm, đáp sạc, cất cánh, bay xuống rồi bay tiếp tới cờ.',
      veMaMau: 'Chương trình có sẵn bay thẳng. Chen phần lên trạm sạc vào giữa.',
      san: ['###P###', '......F'],
      batDau: { x: 0, y: 1 },
      maMau: bai(LAP(6, 'go_right()')),
      loiGiai: bai(LAP(3, 'go_right()').concat(['go_up()', 'land()', 'take_off()', 'go_down()'], LAP(3, 'go_right()'))),
      sao: { o: 8, nhip: 10 },
      loiSai: [
        { moTa: 'Bay thẳng: hết pin', baiLam: bai(LAP(6, 'go_right()')), phaiCoMa: ['het-pin'] },
        { moTa: 'Đáp ngay dưới trạm: ô thường, không sạc', baiLam: bai(LAP(3, 'go_right()').concat(['land()', 'take_off()'], LAP(3, 'go_right()'))), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Phải đáp ĐÚNG trên ô P.', 'Bay lên một ô, đáp, cất cánh, bay xuống một ô.']
    }),

    man({
      so: 4, ten: 'Đậu chờ cửa mở', hang: 'luyen', pin: 6, hamCuaEmCan: [],
      cuaNhip: [{ x: 2, y: 0, mo: 2, dong: 6, pha: 2 }],
      deBai: 'Cửa phía trước tự đóng mở theo nhịp: đang đóng, phải chờ mấy nhịp mới mở. Lơ lửng chờ thì tốn pin; ĐẬU chờ thì không tốn pin. Bay tới sát cửa, đáp xuống chờ, cửa sắp mở thì cất cánh bay qua.',
      veMaMau: 'Chương trình có sẵn lơ lửng chờ bằng wait() nên hết pin. Đáp xuống trước khi chờ.',
      san: ['..C.F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()'].concat(LAP(5, 'wait()'), LAP(3, 'go_right()'))),
      loiGiai: bai(['go_right()', 'land()'].concat(LAP(3, 'wait()'), ['take_off()'], LAP(3, 'go_right()'))),
      sao: { o: 7, nhip: 9 },
      loiSai: [
        { moTa: 'Lơ lửng chờ: hết pin trước khi cửa mở', baiLam: bai(['go_right()'].concat(LAP(5, 'wait()'), LAP(3, 'go_right()'))), phaiCoMa: ['het-pin'] },
        { moTa: 'Chờ ít quá: cửa còn đóng, drone đâm cửa', baiLam: bai(['go_right()', 'land()', 'wait()', 'take_off()'].concat(LAP(3, 'go_right()'))), phaiCoMa: [] }
      ],
      goiY: ['Nhịp đậu từ đầu tới cuối không tốn pin.', 'Cất cánh cũng mất một nhịp: tính cho khớp lúc cửa mở.']
    }),

    man({
      so: 5, ten: 'Hai trạm sạc', hang: 'luyen', pin: 5, hamCuaEmCan: [],
      deBai: 'Đường bay dài 9 ô, có hai ô sạc cách đều: cứ ba ô một trạm. Pin có 5. Đáp sạc ở cả hai trạm. Dùng vòng lặp: hai lần "bay ba ô, đáp, cất cánh", rồi bay ba ô cuối.',
      veMaMau: 'Chương trình có sẵn mới qua được trạm thứ nhất.',
      san: ['...P..P..F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(3, 'go_right()').concat(['land()', 'take_off()'], LAP(6, 'go_right()'))),
      loiGiai: bai(C_HAI_TRAM),
      sao: { o: 7, nhip: 13 },
      loiSai: [
        { moTa: 'Chỉ sạc trạm đầu: hết pin trước cờ', baiLam: bai(LAP(3, 'go_right()').concat(['land()', 'take_off()'], LAP(6, 'go_right()'))), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Vòng ngoài lặp hai lần, vòng trong bay ba ô.', 'Sau hai trạm còn ba ô nữa tới cờ.']
    }),

    man({
      so: 6, ten: 'Đáp khi pin yếu', hang: 'luyen', pin: 6, hamCuaEmCan: [],
      deBai: 'Mười ô tới cờ, ô sạc ở ô thứ 5 và thứ 9. Đáp ở mọi ô thì phí nhịp và hết pin; chỉ đáp khi pin yếu: mỗi lần bay hai ô, hỏi battery(), dưới 3 thì đáp sạc rồi cất cánh.',
      veMaMau: 'Chương trình có sẵn đã bay từng đôi ô. Thêm câu hỏi pin: battery() < 3.',
      san: ['....P...P.F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(5, ['go_right()', 'go_right()'])),
      loiGiai: bai(C_PIN_YEU),
      sao: { o: 6, nhip: 14 },
      loiSai: [
        { moTa: 'Lần nào cũng đáp: đáp nhầm ô thường, hết pin', baiLam: bai(LAP(5, ['go_right()', 'go_right()', 'land()', 'take_off()'])), phaiCoMa: ['het-pin'] },
        { moTa: 'Không đáp: hết pin', baiLam: bai(LAP(5, ['go_right()', 'go_right()'])), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['battery() không tốn nhịp.', 'Pin dưới 3 đúng lúc drone đứng trên ô sạc.']
    }),

    man({
      so: 7, ten: 'Quên cất cánh', hang: 'bien-the', pin: 6, hamCuaEmCan: [],
      deBai: 'Chương trình có sẵn đáp xuống trạm sạc trên mái nhưng quên cất cánh: drone đậu trên mái mãi. Sửa để drone tới cờ.',
      veMaMau: 'Chạy thử: lỗi "drone đang đậu". Thêm take_off() đúng chỗ.',
      san: ['###P####', '.......F'],
      batDau: { x: 0, y: 1 },
      maMau: bai(LAP(3, 'go_right()').concat(['go_up()', 'land()', 'go_down()'], LAP(4, 'go_right()'))),
      loiGiai: bai(C_MAI),
      sao: { o: 8, nhip: 11 },
      loiSai: [
        { moTa: 'Không sửa: drone đậu trên mái', baiLam: bai(LAP(3, 'go_right()').concat(['go_up()', 'land()', 'go_down()'], LAP(4, 'go_right()'))), phaiCoMa: ['dang-dau'] },
        { moTa: 'Cất cánh trước khi đáp: không sạc', baiLam: bai(LAP(3, 'go_right()').concat(['go_up()', 'take_off()', 'land()', 'go_down()'], LAP(4, 'go_right()'))), phaiCoMa: [] }
      ],
      goiY: ['Sau land() là take_off() rồi mới bay xuống.', 'take_off() lúc đang bay thì không làm gì.']
    }),

    man({
      so: 8, ten: 'Đáp ít nhất', hang: 'bien-the', pin: [4, 5], hamCuaEmCan: [],
      deBai: 'Cùng một con phố có bốn ô sạc, nhưng hai drone có pin khác nhau: 4 và 5. Mỗi bước bay một ô, pin dưới 2 thì đáp sạc. Drone pin lớn đáp ít lần hơn. Một chương trình cho cả hai.',
      veMaMau: 'Chương trình có sẵn bay tám ô không sạc. Thêm câu hỏi pin trong vòng lặp.',
      san: [SAN_IT_NHAT, SAN_IT_NHAT],
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(8, 'go_right()')),
      loiGiai: bai(C_IT_NHAT),
      sao: { o: 5, nhip: 14 },
      loiSai: [
        { moTa: 'Ngưỡng 3: đáp ở ô thường, không sạc', baiLam: bai(LAP(8, ['go_right()', 'if battery() < 3:', '    land()', '    take_off()'])), phaiCoMa: [] },
        { moTa: 'Không đáp', baiLam: bai(LAP(8, 'go_right()')), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Pin còn 1 thì đáp: ô đó luôn là ô sạc.', 'Đáp ít thì ít nhịp.']
    }),

    man({
      so: 9, ten: 'Ngưỡng pin sai', hang: 'bien-the', pin: 6, hamCuaEmCan: [],
      deBai: 'Chương trình có sẵn chỉ đáp khi battery() < 1: tới lúc hỏi thì pin đã cạn. Sửa ngưỡng để drone đáp đúng hai trạm sạc.',
      veMaMau: 'Chạy thử: drone hết pin. Đổi số trong battery() < 1.',
      san: ['....P...P.F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(5, ['go_right()', 'go_right()', 'if battery() < 1:', '    land()', '    take_off()'])),
      loiGiai: bai(C_PIN_YEU),
      sao: { o: 6, nhip: 14 },
      loiSai: [
        { moTa: 'Không sửa: pin cạn trước khi hỏi', baiLam: bai(LAP(5, ['go_right()', 'go_right()', 'if battery() < 1:', '    land()', '    take_off()'])), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['Pin về 0 là rơi ngay: phải đáp trước đó.', 'Thử ngưỡng 3.']
    }),

    man({
      so: 10, ten: 'Giao hàng qua trạm sạc', hang: 'trum', nam: true, pin: [7, 6], hamCuaEmCan: [],
      deBai: 'Hút thùng hàng ở ô thứ hai rồi chở tới ô đích cuối phố. Hai drone pin 7 và 6, trạm sạc đặt ở chỗ khác nhau. Bay từng ô, pin dưới 2 thì đáp sạc (thùng vẫn treo dưới bụng), tới nơi thả thùng.',
      veMaMau: 'Chương trình có sẵn đã hút thùng. Viết phần bay có sạc và thả thùng.',
      san: [['.o...P...D'], ['.o..P...PD']],
      vatChat: [['.s........'], ['.s........']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'magnet_n()', 'wait()']),
      loiGiai: bai(['go_right()', 'magnet_n()', 'wait()'].concat(C_IT_NHAT, ['magnet_off()', 'wait()'])),
      sao: { o: 10, nhip: 15 },
      loiSai: [
        { moTa: 'Không đáp sạc: hết pin giữa phố', baiLam: bai(['go_right()', 'magnet_n()', 'wait()'].concat(LAP(8, 'go_right()'), ['magnet_off()', 'wait()'])), phaiCoMa: ['het-pin'] },
        { moTa: 'Quên thả thùng', baiLam: bai(['go_right()', 'magnet_n()', 'wait()'].concat(C_IT_NHAT)), phaiCoMa: [] }
      ],
      goiY: ['Bật, tắt nam châm cũng tốn nhịp và pin.', 'Vòng lặp bay có sạc giống màn Đáp ít nhất.']
    }),

    /* ================================================= chương che-drone "Chế lệnh: bay xa" (màn mới từ 11) ================================================= */
    manChe({
      so: 11, ten: 'Hàm đáp sạc', hang: 'luyen', pin: 4, taoHam: ['dock'], hamCuaEmCan: [],
      deBai: 'Chế dock(): đáp xuống ô đang ở rồi cất cánh, hai nhịp. Chương trình chính đã khóa: bay hai ô tới trạm, dock(), rồi bay ba ô tới cờ.',
      veMaMau: 'Mở Xưởng hàm, tạo dock() không có đối số.',
      san: ['..P..F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_DOCK),
      loiGiai: bai(C_DOCK, { hamCuaEmMoi: [H('dock', [], ['land()', 'take_off()'])] }),
      sao: { o: 7, nhip: 7 },
      loiSai: [
        { moTa: 'Gọi dock() mà chưa chế hàm', baiLam: bai(C_DOCK), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'dock() chỉ đáp, quên cất cánh', baiLam: bai(C_DOCK), hamCuaEmMoi: [H('dock', [], ['land()'])], phaiCoMa: ['dang-dau'] }
      ],
      goiY: ['land() rồi take_off().', 'dock() đúng ở ô sạc thì pin đầy.']
    }),

    manChe({
      so: 12, ten: 'Hàm bay giữ pin', hang: 'luyen', pin: [4, 5], taoHam: ['safe_go'], hamCuaEmCan: ['dock'],
      deBai: 'Chế safe_go(n): bay sang phải n ô, mỗi ô hỏi pin, dưới 2 thì dock(). Chương trình chính đã khóa: safe_go(8). Hai drone pin 4 và 5.',
      veMaMau: 'Tạo safe_go với một đối số n. Thân hàm giống vòng lặp của màn Đáp ít nhất, gọi dock() em đã chế.',
      san: [SAN_IT_NHAT, SAN_IT_NHAT],
      batDau: { x: 0, y: 0 },
      maMau: bai(['safe_go(8)']),
      loiGiai: bai(['safe_go(8)'], { hamCuaEmMoi: [H('safe_go', ['n'], T_SAFE)] }),
      sao: { o: 7, nhip: 14 },
      congThucKhac: [{ moTa: 'Viết thẳng land() và take_off()', hamCuaEmMoi: [H('safe_go', ['n'], ['for i in range(n):', '    go_right()', '    if battery() < 2:', '        land()', '        take_off()'])] }],
      loiSai: [
        { moTa: 'Gọi safe_go mà chưa chế hàm', baiLam: bai(['safe_go(8)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay n ô không hỏi pin', baiLam: bai(['safe_go(8)']), hamCuaEmMoi: [H('safe_go', ['n'], ['for i in range(n):', '    go_right()'])], phaiCoMa: ['het-pin'] }
      ],
      goiY: ['range(n): bay đúng n ô chương trình chính đưa vào.', 'Hỏi pin sau mỗi ô bay.']
    }),

    manChe({
      so: 13, ten: 'Sửa hàm sạc', hang: 'bien-the', pin: 5, hamCuaEmCan: [],
      deBai: 'Hàm của màn charge_stop() phải đáp sạc rồi cất cánh, nhưng nó cất cánh TRƯỚC rồi mới đáp nên drone đậu luôn. Sửa charge_stop(); chương trình chính đã khóa: bay ba ô, charge_stop(), bay bốn ô tới cờ.',
      veMaMau: 'Chạy thử: drone đậu ở trạm. Đổi thứ tự hai lệnh trong charge_stop().',
      san: ['...P...F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_STOP, { hamCuaMan: [H('charge_stop', [], ['take_off()', 'land()'])] }),
      loiGiai: bai(C_STOP, { hamCuaMan: [H('charge_stop', [], ['land()', 'take_off()'])] }),
      sao: { o: 7, nhip: 9 },
      loiSai: [
        { moTa: 'Không sửa: drone đậu luôn ở trạm', baiLam: bai(C_STOP, { hamCuaMan: [H('charge_stop', [], ['take_off()', 'land()'])] }), phaiCoMa: ['dang-dau'] }
      ],
      goiY: ['Đáp trước, cất cánh sau.', 'take_off() lúc đang bay thì không làm gì.']
    }),

    manChe({
      so: 15, ten: 'Hàm bay rồi sạc', hang: 'bien-the', pin: 5, taoHam: ['fly_dock'], hamCuaEmCan: ['dock'],
      deBai: 'Chế fly_dock(n): bay sang phải n ô rồi dock(). Chương trình chính đã khóa: hai lần fly_dock(3) qua hai trạm, rồi bay ba ô tới cờ.',
      veMaMau: 'Tạo fly_dock với một đối số n. Gọi dock() em đã chế ở cuối hàm.',
      san: ['...P..P..F'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_BAY_SAC),
      loiGiai: bai(C_BAY_SAC, { hamCuaEmMoi: [H('fly_dock', ['n'], T_BAY_SAC)] }),
      sao: { o: 9, nhip: 13 },
      congThucKhac: [{ moTa: 'Viết thẳng land() và take_off()', hamCuaEmMoi: [H('fly_dock', ['n'], ['for i in range(n):', '    go_right()', 'land()', 'take_off()'])] }],
      loiSai: [
        { moTa: 'Gọi fly_dock mà chưa chế hàm', baiLam: bai(C_BAY_SAC), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'dock() nằm trong vòng lặp: đáp ở mọi ô, hết pin', baiLam: bai(C_BAY_SAC), hamCuaEmMoi: [H('fly_dock', ['n'], ['for i in range(n):', '    go_right()', '    dock()'])], phaiCoMa: ['het-pin'] }
      ],
      goiY: ['dock() thụt ra ngoài vòng lặp: bay đủ n ô rồi mới đáp.', 'Hai trạm cách nhau ba ô.']
    }),

    manChe({
      so: 16, ten: 'Cẩu hàng qua hai trạm', hang: 'bien-the', nam: true, pin: 5, chinhCoDinh: false, hamCuaEmCan: ['fly_dock'],
      deBai: 'Hút thùng ở ô thứ hai, chở qua hai trạm sạc tới ô đích cuối phố. Tự viết chương trình chính bằng fly_dock(n): trạm đầu cách thùng hai ô, trạm sau cách ba ô.',
      veMaMau: 'Chương trình có sẵn đã hút thùng. Viết phần bay qua hai trạm và thả thùng.',
      san: ['.o.P..P..D'],
      vatChat: ['.s........'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'magnet_n()', 'wait()']),
      loiGiai: bai(C_CAU),
      sao: { o: 14, nhip: 15 },
      loiSai: [
        { moTa: 'Bỏ qua trạm sau: hết pin trước ô đích', baiLam: bai(['go_right()', 'magnet_n()', 'wait()', 'fly_dock(2)', 'for j in range(6):', '    go_right()', 'magnet_off()', 'wait()']), phaiCoMa: ['het-pin'] },
        { moTa: 'Quên thả thùng', baiLam: bai(C_CAU.slice(0, -2)), phaiCoMa: [] }
      ],
      goiY: ['fly_dock(2) rồi fly_dock(3).', 'Tới ô đích: tắt nam châm, chờ một nhịp.']
    }),

    manChe({
      so: 14, ten: 'Kho hàng có trạm sạc', hang: 'trum', nam: true, pin: [7, 6], chinhCoDinh: false, hamCuaEmCan: ['safe_go'],
      deBai: 'Như màn Giao hàng qua trạm sạc, nhưng giờ em đã có safe_go(n). Tự viết chương trình chính: hút thùng, bay có sạc tới ô đích, thả thùng. Hai drone, hai cách đặt trạm.',
      veMaMau: 'Chương trình có sẵn đã hút thùng. Viết tiếp bằng safe_go().',
      san: [['.o...P...D'], ['.o..P...PD']],
      vatChat: [['.s........'], ['.s........']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'magnet_n()', 'wait()']),
      loiGiai: bai(['go_right()', 'magnet_n()', 'wait()', 'safe_go(8)', 'magnet_off()', 'wait()']),
      sao: { o: 12, nhip: 15 },
      loiSai: [
        { moTa: 'Bay thẳng không sạc', baiLam: bai(['go_right()', 'magnet_n()', 'wait()'].concat(LAP(8, 'go_right()'), ['magnet_off()', 'wait()'])), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['safe_go(8) bay tám ô có sạc.', 'Tắt nam châm rồi wait() để thả.']
    })
  ];

  ManHoc.manTramSac = DS;
  if (laNode) module.exports = ManHoc;
})();
