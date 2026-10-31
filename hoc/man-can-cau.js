/* ============================================================================
   man-can-cau.js — "Robot Chấn Hưng": GÓI 1 MÙA 4 "CẢNG SÔNG" (CẦN CẨU CONTAINER)
   Gồm 20 màn mới trên Cần cẩu R1 (thân cau, chưa có móc cẩu, chưa có cảm biến):
   - can-cau.1..10 (10 màn chương can-cau "Quay cần vươn tầm")
   - so-am.1..10   (10 màn chương so-am "Số âm và khoảng cách")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait'];
  var ROBOT_CAU = { than: 'cau', tay: null, camBien: [] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  var SAN_CANG = [
    '~~~~~~~',
    '.D.D.D.',
    '..DDD..',
    '.DD.DD.',
    '..DDD..',
    '.D.D.D.',
    'D..D..D'
  ];

  var SAN_CANG_RONG = [
    '~~~~~~~',
    '.D.D.D.',
    '..DDD..',
    'DDD.DDD',
    '..DDD..',
    '.D.D.D.',
    'D..D..D'
  ];

  function bai(chinh, Phu) {
    return {
      chinh: chinh.slice(),
      hamCuaMan: (Phu && Phu.hamCuaMan) ? Phu.hamCuaMan.slice() : [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) ? Phu.hamCuaEmMoi.slice() : []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  var T_SWING_L = ['for i in range(n):', '    swing_left()'];
  var T_SWING_R = ['for i in range(n):', '    swing_right()'];
  var T_SWING_BY = ['if d < 0:', '    swing_l(abs(d))', 'else:', '    swing_r(d)'];
  var T_REACH_BY = ['if d < 0:', '    for i in range(abs(d)):', '        retract()', 'else:', '    for i in range(d):', '        extend()'];
  var T_AIM_CRANE = ['swing_by(da)', 'reach_by(dr)'];

  function manCanCau(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'can-cau',
      loaiRobot: 'cau',
      vo: 'cang',
      robot: ROBOT_CAU,
      hamGoc: HAM_CAU.slice(),
      moXuong: true,
      camHamCuaEm: false,
      mucTieu: 'bong-mo',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: [],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg));
  }

  function manSoAm(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'so-am',
      loaiRobot: 'cau',
      vo: 'cang',
      robot: ROBOT_CAU,
      hamGoc: HAM_CAU.slice(),
      moXuong: true,
      camHamCuaEm: false,
      mucTieu: 'bong-mo',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: [],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, cfg));
  }

  var DS = [
    /* =========================================================================
       Chương 1: can-cau (1..10) — Quay cần vươn tầm
       ========================================================================= */
    manCanCau({
      so: 1, ten: 'Làm quen cần cẩu cảng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: ở cảng sông, bộ não R1 được lắp vào trụ Cần cẩu cảng. Trụ cẩu xoay tròn 8 nấc (nấc 0 hướng lên trên, tăng dần theo chiều kim đồng hồ) và vươn đầu cần từ tầm 1 tới tầm 3. Bấm Chạy để xem cần cẩu quay phải 2 nấc rồi vươn ra tầm 2.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem mỗi lệnh swing_right() và extend() tự chạy trong 1 nhịp.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 2, tam: 2 },
      maMau: bai(['swing_right()', 'swing_right()', 'extend()']),
      loiGiai: bai(['swing_right()', 'swing_right()', 'extend()']),
      sao: { o: 3, nhip: 3 },
      goiY: ['Luna: Cần cẩu xoay 8 nấc một vòng: swing_right() tăng 1 nấc, swing_left() giảm 1 nấc.', 'Luna: extend() vươn đầu cần xa thêm 1 ô, mỗi lệnh tự tốn 1 nhịp.']
    }),

    manCanCau({
      so: 2, ten: 'Quay phải tới bãi đông nam', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: cần cẩu đang ở nấc 0 tầm 1. Hãy quay cần sang phải 3 nấc để đầu cần khớp với bóng mờ ở nấc 3 tầm 1.',
      veMaMau: 'Chương trình có sẵn mới quay phải 1 nấc. Hãy thêm các lệnh swing_right() để tới đúng nấc 3.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 3, tam: 1 },
      maMau: bai(['swing_right()']),
      loiGiai: bai(['swing_right()', 'swing_right()', 'swing_right()']),
      sao: { o: 3, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for i in range(3) kèm wait() cuối',
        baiLam: bai(['for i in range(3):', '    swing_right()'])
      },
      loiSai: [
        { moTa: 'Mới quay phải 1 nấc, chưa tới nấc 3', baiLam: bai(['swing_right()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay nhầm sang trái 3 nấc nên dừng ở nấc 5', baiLam: bai(['swing_left()', 'swing_left()', 'swing_left()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Nấc 0 là hướng lên trên, quay phải 3 lần sẽ lần lượt qua nấc 1, 2 rồi tới nấc 3.', 'Luna: Gọi đủ 3 dòng swing_right().']
    }),

    manCanCau({
      so: 3, ten: 'Quay trái qua mốc không', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: cần cẩu đang ở nấc 1 tầm 1. Hãy quay cần sang trái 3 nấc qua mốc 0 để về nấc 6 tầm 1 ở phía tây.',
      veMaMau: 'Chương trình có sẵn mới quay trái 1 nấc về nấc 0. Hãy viết tiếp để quay tới nấc 6.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 6, tam: 1 },
      maMau: bai(['swing_left()']),
      loiGiai: bai(['swing_left()', 'swing_left()', 'swing_left()']),
      sao: { o: 3, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Quay trái 3 nấc rồi gọi thêm wait()',
        baiLam: bai(['swing_left()', 'swing_left()', 'swing_left()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Chỉ quay trái 2 nấc nên dừng ở nấc 7', baiLam: bai(['swing_left()', 'swing_left()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Vươn cần thêm 1 tầm làm lệch tầm bóng mờ', baiLam: bai(['swing_left()', 'swing_left()', 'swing_left()', 'extend()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Bàn xoay 8 nấc nối vòng tròn: từ nấc 0 quay trái 1 nấc sẽ sang nấc 7.', 'Luna: Từ nấc 1 quay trái 3 lần sẽ qua nấc 0, 7 rồi dừng ở nấc 6.']
    }),

    manCanCau({
      so: 4, ten: 'Vươn xa tới bờ kè ngoài', hang: 'luyen',
      deBai: 'Sola nhờ bạn: từ nấc 0 tầm 1, hãy quay cần sang phải tới nấc 2 rồi vươn đầu cần ra tận tầm 3 ở mép phải cảng.',
      veMaMau: 'Chương trình có sẵn đã quay phải 2 nấc sang nấc 2. Hãy vươn đầu cần từ tầm 1 lên tầm 3.',
      san: SAN_CANG_RONG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 2, tam: 3 },
      maMau: bai(['swing_right()', 'swing_right()']),
      loiGiai: bai(['swing_right()', 'swing_right()', 'extend()', 'extend()']),
      sao: { o: 4, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Vươn 2 tầm trước rồi mới quay phải 2 nấc',
        baiLam: bai(['extend()', 'extend()', 'swing_right()', 'swing_right()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Mới gọi extend() 1 lần nên đầu cần dừng ở tầm 2', baiLam: bai(['swing_right()', 'swing_right()', 'extend()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi extend() 3 lần vượt quá tầm tối đa 3', baiLam: bai(['swing_right()', 'swing_right()', 'extend()', 'extend()', 'extend()']), phaiCoMa: ['can-het-tam'] }
      ],
      goiY: ['Luna: Cần cẩu đang ở tầm 1, mỗi lệnh extend() tăng tầm thêm 1.', 'Luna: Thêm hai dòng extend() sau hai dòng swing_right().']
    }),

    manCanCau({
      so: 5, ten: 'Thu cần về bãi trong', hang: 'luyen',
      deBai: 'Sola nhờ bạn: cần cẩu đang vươn xa ở nấc 4 tầm 3. Hãy thu đầu cần về tầm 1 và quay phải tới nấc 6.',
      veMaMau: 'Chương trình có sẵn mới thu cần 1 bước về tầm 2. Hãy thu tiếp về tầm 1 và quay phải 2 nấc.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 4, tam: 3 },
      bongMo: { x: 3, y: 3, nac: 6, tam: 1 },
      maMau: bai(['retract()']),
      loiGiai: bai(['retract()', 'retract()', 'swing_right()', 'swing_right()']),
      sao: { o: 4, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Quay phải 2 nấc trước rồi thu cần 2 bước kèm wait()',
        baiLam: bai(['swing_right()', 'swing_right()', 'retract()', 'retract()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Chỉ thu cần 1 lần nên còn ở tầm 2', baiLam: bai(['retract()', 'swing_right()', 'swing_right()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thu cần 3 lần xuống dưới tầm tối thiểu 1', baiLam: bai(['retract()', 'retract()', 'retract()', 'swing_right()', 'swing_right()']), phaiCoMa: ['can-het-tam'] }
      ],
      goiY: ['Luna: Lệnh retract() thu đầu cần ngắn lại 1 tầm (tối thiểu tầm 1).', 'Luna: Gọi retract() 2 lần rồi gọi swing_right() 2 lần.']
    }),

    manCanCau({
      so: 6, ten: 'Quét qua cọc tiêu trung gian', hang: 'luyen',
      deBai: 'Sola nhờ bạn: từ nấc 0 tầm 1, hãy đưa đầu cần chạm cọc tiêu trung gian ở nấc 1 tầm 2 (ô (5, 1)) rồi quay tiếp tới dừng ở nấc 3 tầm 2.',
      veMaMau: 'Chương trình có sẵn mới quay phải sang nấc 1 tầm 1. Hãy vươn ra tầm 2 để chạm ô (5, 1) rồi quay tiếp tới nấc 3.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 3, tam: 2, diQua: [{ x: 5, y: 1 }] },
      maMau: bai(['swing_right()']),
      loiGiai: bai(['swing_right()', 'extend()', 'swing_right()', 'swing_right()']),
      sao: { o: 4, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Vươn lên tầm 2 ở nấc 0 trước rồi quay phải 3 nấc qua (5, 1)',
        baiLam: bai(['extend()', 'swing_right()', 'swing_right()', 'swing_right()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Quay thẳng tới nấc 3 ở tầm 1 rồi mới vươn ra tầm 2 nên bỏ sót cọc tiêu (5, 1)', baiLam: bai(['swing_right()', 'swing_right()', 'swing_right()', 'extend()']), phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Chạm cọc tiêu (5, 1) nhưng mới quay thêm 1 nấc tới nấc 2', baiLam: bai(['swing_right()', 'extend()', 'swing_right()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Cọc tiêu (5, 1) nằm ở nấc 1 tầm 2: cần vươn lên tầm 2 khi cần đang ở nấc 1.', 'Luna: Sau swing_right() đầu tiên, gọi extend() rồi gọi thêm 2 lần swing_right().']
    }),

    manCanCau({
      so: 7, ten: 'Vòng lặp quay năm nấc', hang: 'bien-the',
      deBai: 'Sola nhờ bạn: từ nấc 0 tầm 1, hãy dùng vòng lặp for để quay cần sang phải 5 nấc tới nấc 5, rồi vươn đầu cần ra tầm 3.',
      veMaMau: 'Chương trình có sẵn mới mở vòng lặp for 5 lần. Hãy thêm lệnh vươn ra tầm 3 sau vòng lặp.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 5, tam: 3 },
      maMau: bai(['for i in range(5):', '    swing_right()']),
      loiGiai: bai(['for i in range(5):', '    swing_right()', 'extend()', 'extend()']),
      sao: { o: 4, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Vươn 2 tầm trước vòng lặp for',
        baiLam: bai(['extend()', 'extend()', 'for i in range(5):', '    swing_right()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Quên vươn cần sau vòng lặp nên còn ở tầm 1', baiLam: bai(['for i in range(5):', '    swing_right()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đặt extend() thụt lề vào trong vòng lặp for nên vươn quá tầm 3', baiLam: bai(['for i in range(5):', '    swing_right()', '    extend()']), phaiCoMa: ['can-het-tam'] }
      ],
      goiY: ['Luna: Đặt hai lệnh extend() ở ngoài vòng lặp for (không thụt lề).', 'Luna: Vòng lặp quay 5 nấc tới nấc 5, hai lệnh extend() đưa đầu cần từ tầm 1 ra tầm 3.']
    }),

    manCanCau({
      so: 8, ten: 'Chạm mốc xa rồi thu về', hang: 'bien-the',
      deBai: 'Sola nhờ bạn: đưa đầu cần chạm mốc góc đông nam ở nấc 3 tầm 3 (ô (6, 6)), sau đó thu đầu cần về dừng tại nấc 3 tầm 1.',
      veMaMau: 'Chương trình có sẵn đã quay phải 3 nấc và vươn ra tầm 3 chạm ô (6, 6). Hãy thu cần về tầm 1.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 3, tam: 1, diQua: [{ x: 6, y: 6 }] },
      maMau: bai(['for i in range(3):', '    swing_right()', 'extend()', 'extend()']),
      loiGiai: bai(['for i in range(3):', '    swing_right()', 'extend()', 'extend()', 'retract()', 'retract()']),
      sao: { o: 6, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Viết 3 dòng swing_right() tường minh thay cho vòng lặp',
        baiLam: bai(['swing_right()', 'swing_right()', 'swing_right()', 'extend()', 'extend()', 'retract()', 'retract()'])
      },
      loiSai: [
        { moTa: 'Không vươn ra tầm 3 nên chưa chạm mốc (6, 6)', baiLam: bai(['for i in range(3):', '    swing_right()']), phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Chạm mốc (6, 6) nhưng chỉ thu cần 1 bước về tầm 2', baiLam: bai(['for i in range(3):', '    swing_right()', 'extend()', 'extend()', 'retract()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Khi đã ở nấc 3 tầm 3, đầu cần vừa chạm đúng mốc (6, 6).', 'Luna: Thêm hai dòng retract() ở cuối để thu đầu cần về tầm 1.']
    }),

    manCanCau({
      so: 9, ten: 'Sửa vòng quét hai mốc', hang: 'bien-the',
      deBai: 'Sola viết vội, nhờ bạn sửa: cần cẩu cần chạm mốc (3, 6) ở nấc 4 tầm 3 rồi thu về tầm 2 và quay trái 3 nấc về dừng ở nấc 1 tầm 2. Chương trình có sẵn đang lặp sai số nấc quay trái.',
      veMaMau: 'Chạy thử chương trình có sẵn: cần cẩu mới quay trái 1 nấc nên dừng ở nấc 3 tầm 2. Hãy sửa lại số lần lặp ở vòng for thứ hai.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 1, tam: 2, diQua: [{ x: 3, y: 6 }] },
      maMau: bai(['for i in range(4):', '    swing_right()', 'extend()', 'extend()', 'retract()', 'for i in range(1):', '    swing_left()']),
      loiGiai: bai(['for i in range(4):', '    swing_right()', 'extend()', 'extend()', 'retract()', 'for i in range(3):', '    swing_left()']),
      sao: { o: 7, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Viết 3 dòng swing_left() thay cho vòng for thứ hai',
        baiLam: bai(['for i in range(4):', '    swing_right()', 'extend()', 'extend()', 'retract()', 'swing_left()', 'swing_left()', 'swing_left()'])
      },
      loiSai: [
        { moTa: 'Để nguyên range(1) ở vòng lặp cuối nên dừng ở nấc 3 tầm 2', baiLam: bai(['for i in range(4):', '    swing_right()', 'extend()', 'extend()', 'retract()', 'for i in range(1):', '    swing_left()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên retract() về tầm 2 trước khi quay trái', baiLam: bai(['for i in range(4):', '    swing_right()', 'extend()', 'extend()', 'for i in range(3):', '    swing_left()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Từ nấc 4 quay trái về nấc 1 cần 4 - 1 = 3 nấc.', 'Luna: Đổi range(1) ở vòng lặp cuối thành range(3).']
    }),

    manCanCau({
      so: 10, ten: 'Trùm cuối: Kiểm tra cọc tiêu cảng', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'can-cau', ten: 'Huy hiệu Quay cần vươn tầm' },
      deBai: 'Sola nhờ bạn: trên cả hai sân, từ vị trí xuất phát ở tầm 1, hãy quay phải 4 nấc và vươn ra tầm 3 để chạm cọc tiêu xa, sau đó thu về tầm 2 và quay trái 2 nấc về vị trí đích.',
      veMaMau: 'Chương trình có sẵn mới quay phải 4 nấc. Hãy vươn ra tầm 3, thu về tầm 2 rồi quay trái 2 nấc.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 1, tam: 1 }],
      bongMo: [
        { x: 3, y: 3, nac: 2, tam: 2, diQua: [{ x: 3, y: 6 }] },
        { x: 3, y: 3, nac: 3, tam: 2, diQua: [{ x: 0, y: 6 }] }
      ],
      maMau: bai(['for i in range(4):', '    swing_right()']),
      loiGiai: bai(['for i in range(4):', '    swing_right()', 'extend()', 'extend()', 'retract()', 'for i in range(2):', '    swing_left()']),
      sao: { o: 7, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Viết 2 dòng swing_left() tường minh kèm wait() ở cuối',
        baiLam: bai(['for i in range(4):', '    swing_right()', 'extend()', 'extend()', 'retract()', 'swing_left()', 'swing_left()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Mới quay phải 4 nấc mà chưa vươn ra tầm 3 và quay lại', baiLam: bai(['for i in range(4):', '    swing_right()']), phaiCoMa: ['chua-qua-diem', 'lech-bong-mo'] },
        { moTa: 'Chỉ vươn lên tầm 2 nên không chạm cọc tiêu tầm 3', baiLam: bai(['for i in range(4):', '    swing_right()', 'extend()', 'swing_left()', 'swing_left()']), phaiCoMa: ['chua-qua-diem'] }
      ],
      goiY: ['Luna: Sau vòng lặp quay phải 4 nấc, gọi extend() 2 lần để đầu cần vươn tới tầm 3.', 'Luna: Tiếp theo gọi retract() 1 lần về tầm 2 rồi gọi swing_left() 2 lần.']
    }),

    /* =========================================================================
       Chương 2: so-am (1..10) — Số âm và khoảng cách
       ========================================================================= */
    manSoAm({
      so: 1, ten: 'Hiệu âm và giá trị tuyệt đối', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: cần cẩu đang ở nấc a = 5 và cần quay về nấc b = 2. Hiệu d = b - a = 2 - 5 = -3 là số âm (vì đích ở bên trái). Hàm abs(d) lấy giá trị tuyệt đối (bỏ dấu âm, thành 3) để truyền vào range(abs(d)). Bấm Chạy xem cần cẩu tự xét dấu của d!',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem cách kết hợp if d < 0: và abs(d).',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 5, tam: 2 },
      bongMo: { x: 3, y: 3, nac: 2, tam: 2 },
      maMau: bai(['d = 2 - 5', 'if d < 0:', '    for i in range(abs(d)):', '        swing_left()', 'else:', '    for i in range(d):', '        swing_right()']),
      loiGiai: bai(['d = 2 - 5', 'if d < 0:', '    for i in range(abs(d)):', '        swing_left()', 'else:', '    for i in range(d):', '        swing_right()']),
      sao: { o: 7, nhip: 3 },
      goiY: ['Luna: Khi b < a thì hiệu d = b - a mang dấu âm, cho biết cần quay sang trái.', 'Luna: range() cần số nguyên không âm nên ta dùng abs(d) để lấy độ lớn khoảng cách.']
    }),

    manSoAm({
      so: 2, ten: 'Khoảng cách lùi bằng abs', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: cần cẩu đang ở nấc 6 tầm 2, cần quay về nấc 1 tầm 2. Chương trình đã tính hiệu d = 1 - 6. Hãy dùng range(abs(d)) để quay trái đúng số nấc.',
      veMaMau: 'Chương trình có sẵn đã tính d = 1 - 6 (bằng -5). Hãy viết vòng lặp for i in range(abs(d)): để gọi swing_left().',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 6, tam: 2 },
      bongMo: { x: 3, y: 3, nac: 1, tam: 2 },
      maMau: bai(['d = 1 - 6']),
      loiGiai: bai(['d = 1 - 6', 'for i in range(abs(d)):', '    swing_left()']),
      sao: { o: 3, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if d < 0 trước vòng lặp',
        baiLam: bai(['d = 1 - 6', 'if d < 0:', '    for i in range(abs(d)):', '        swing_left()'])
      },
      loiSai: [
        { moTa: 'Mới tính d = 1 - 6 mà chưa quay cần', baiLam: bai(['d = 1 - 6']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Truyền thẳng số âm d vào range(d) nên vòng lặp không chạy lần nào', baiLam: bai(['d = 1 - 6', 'for i in range(d):', '    swing_left()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Vì d = -5 là số âm, range(d) sẽ rỗng (0 lần lặp).', 'Luna: Dùng for i in range(abs(d)): rồi thụt lề swing_left().']
    }),

    manSoAm({
      so: 3, ten: 'Chế hàm: Quay trái n nấc', hang: 'lam-quen', taoHam: ['swing_l'],
      deBai: 'Sola nhờ bạn: vào Xưởng hàm tạo hàm swing_l(n) để quay cần sang trái n nấc. Sau đó chương trình chính sẽ gọi swing_l(abs(2 - 6)) và extend() để đưa cần từ nấc 6 tầm 1 về nấc 2 tầm 2.',
      veMaMau: 'Chương trình chính đã gọi swing_l(abs(2 - 6)) và extend(), nhưng bạn chưa tạo hàm swing_l. Hãy vào Xưởng hàm tạo swing_l(n).',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 6, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 2, tam: 2 },
      maMau: bai(['d = 2 - 6', 'swing_l(abs(d))', 'extend()']),
      loiGiai: bai(['d = 2 - 6', 'swing_l(abs(d))', 'extend()'], { hamCuaEmMoi: [H('swing_l', ['n'], T_SWING_L)] }),
      sao: { o: 5, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Gọi thẳng swing_l(abs(2 - 6)) rồi extend() kèm wait()',
        baiLam: bai(['d = 2 - 6', 'swing_l(abs(d))', 'extend()', 'wait()']),
        hamCuaEmMoi: [H('swing_l', ['n'], T_SWING_L)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm swing_l mà đã bấm Chạy', baiLam: bai(['d = 2 - 6', 'swing_l(abs(d))', 'extend()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong swing_l(n) quên vòng lặp range(n), chỉ quay trái 1 nấc', baiLam: bai(['d = 2 - 6', 'swing_l(abs(d))', 'extend()']), hamCuaEmMoi: [H('swing_l', ['n'], ['swing_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Hàm swing_l có tham số n.', 'Luna: Thân hàm swing_l(n) gồm 2 dòng: for i in range(n): và swing_left().']
    }),

    manSoAm({
      so: 4, ten: 'Chế hàm: Quay phải n nấc', hang: 'luyen', hamCuaEmCan: ['swing_l'], taoHam: ['swing_r'],
      deBai: 'Sola nhờ bạn: tạo thêm hàm swing_r(n) để quay cần sang phải n nấc. Chương trình chính dùng swing_r(4) chạm mốc (3, 5) ở nấc 4 tầm 2, rồi dùng swing_l(abs(1 - 4)) quay về nấc 1 tầm 2.',
      veMaMau: 'Chương trình chính đã viết sẵn lời gọi swing_r và swing_l. Hãy vào Xưởng hàm tạo swing_r(n).',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 2 },
      bongMo: { x: 3, y: 3, nac: 1, tam: 2, diQua: [{ x: 3, y: 5 }] },
      maMau: bai(['swing_r(4)', 'swing_l(abs(1 - 4))']),
      loiGiai: bai(['swing_r(4)', 'swing_l(abs(1 - 4))'], { hamCuaEmMoi: [H('swing_r', ['n'], T_SWING_R)] }),
      sao: { o: 6, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gán d = 1 - 4 vào biến trước khi gọi swing_l(abs(d))',
        baiLam: bai(['swing_r(4)', 'd = 1 - 4', 'swing_l(abs(d))']),
        hamCuaEmMoi: [H('swing_r', ['n'], T_SWING_R)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm swing_r mà đã bấm Chạy', baiLam: bai(['swing_r(4)', 'swing_l(abs(1 - 4))']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm swing_r(n) chỉ quay 1 lần không dùng vòng lặp range(n)', baiLam: bai(['swing_r(4)', 'swing_l(abs(1 - 4))']), hamCuaEmMoi: [H('swing_r', ['n'], ['swing_right()'])], phaiCoMa: ['chua-qua-diem', 'lech-bong-mo'] }
      ],
      goiY: ['Luna: Giống như swing_l(n), hàm swing_r(n) lặp range(n) lần lệnh swing_right().', 'Luna: Mở Xưởng hàm và tạo swing_r(n).']
    }),

    manSoAm({
      so: 5, ten: 'Chế hàm: Quay theo độ lệch có dấu', hang: 'luyen', hamCuaEmCan: ['swing_l', 'swing_r'], taoHam: ['swing_by'],
      deBai: 'Sola nhờ bạn: chế hàm swing_by(d) nhận độ lệch có dấu d: nếu d < 0 thì gọi swing_l(abs(d)), ngược lại gọi swing_r(d). Chương trình sẽ gọi swing_by(5 - 1) chạm mốc (1, 5) rồi gọi swing_by(2 - 5) về đích.',
      veMaMau: 'Chương trình chính đã gọi swing_by cho cả độ lệch dương (5 - 1) và độ lệch âm (2 - 5). Hãy vào Xưởng hàm tạo swing_by(d).',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 2 },
      bongMo: { x: 3, y: 3, nac: 2, tam: 2, diQua: [{ x: 1, y: 5 }] },
      maMau: bai(['swing_by(5 - 1)', 'swing_by(2 - 5)']),
      loiGiai: bai(['swing_by(5 - 1)', 'swing_by(2 - 5)'], { hamCuaEmMoi: [H('swing_by', ['d'], T_SWING_BY)] }),
      sao: { o: 10, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gán d1, d2 vào biến rồi truyền vào swing_by',
        baiLam: bai(['d1 = 5 - 1', 'swing_by(d1)', 'd2 = 2 - 5', 'swing_by(d2)']),
        hamCuaEmMoi: [H('swing_by', ['d'], T_SWING_BY)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm swing_by mà đã bấm Chạy', baiLam: bai(['swing_by(5 - 1)', 'swing_by(2 - 5)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong swing_by(d) quên nhánh d < 0, luôn gọi swing_r(abs(d))', baiLam: bai(['swing_by(5 - 1)', 'swing_by(2 - 5)']), hamCuaEmMoi: [H('swing_by', ['d'], ['swing_r(abs(d))'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Trong swing_by(d), kiểm tra if d < 0: để gọi swing_l(abs(d)).', 'Luna: Nhánh else: gọi swing_r(d).']
    }),

    manSoAm({
      so: 6, ten: 'Chế hàm: Đổi tầm theo độ lệch có dấu', hang: 'luyen', hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'], taoHam: ['reach_by'],
      deBai: 'Sola nhờ bạn: chế hàm reach_by(d) để đổi tầm theo độ lệch d: nếu d < 0 thì lặp abs(d) lần retract(), ngược lại lặp d lần extend(). Chương trình chính sẽ vươn từ tầm 1 lên tầm 3 chạm mốc (6, 3), rồi quay về nấc 5 tầm 1.',
      veMaMau: 'Chương trình chính đã gọi reach_by(3 - 1) và reach_by(1 - 3). Hãy vào Xưởng hàm tạo reach_by(d).',
      san: SAN_CANG_RONG,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 5, tam: 1, diQua: [{ x: 6, y: 3 }] },
      maMau: bai(['reach_by(3 - 1)', 'swing_by(5 - 2)', 'reach_by(1 - 3)']),
      loiGiai: bai(['reach_by(3 - 1)', 'swing_by(5 - 2)', 'reach_by(1 - 3)'], { hamCuaEmMoi: [H('reach_by', ['d'], T_REACH_BY)] }),
      sao: { o: 15, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Quay sang nấc 5 sau khi thu cần bằng cách tách bước',
        baiLam: bai(['dr = 3 - 1', 'reach_by(dr)', 'swing_by(5 - 2)', 'reach_by(1 - 3)']),
        hamCuaEmMoi: [H('reach_by', ['d'], T_REACH_BY)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm reach_by mà đã bấm Chạy', baiLam: bai(['reach_by(3 - 1)', 'swing_by(5 - 2)', 'reach_by(1 - 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết ngược nhánh d < 0 gọi extend() làm cần vươn quá tầm', baiLam: bai(['reach_by(3 - 1)', 'swing_by(5 - 2)', 'reach_by(1 - 3)']), hamCuaEmMoi: [H('reach_by', ['d'], ['if d < 0:', '    for i in range(abs(d)):', '        extend()', 'else:', '    for i in range(d):', '        retract()'])], phaiCoMa: ['can-het-tam'] }
      ],
      goiY: ['Luna: Khi d < 0 cần thu đầu cần vào bằng retract() đúng abs(d) lần.', 'Luna: Khi d >= 0 cần vươn đầu cần ra bằng extend() đúng d lần.']
    }),

    manSoAm({
      so: 7, ten: 'Sửa hàm: Quay nhầm dấu', hang: 'bien-the', hamCuaEmCan: ['swing_l', 'swing_r', 'reach_by'],
      deBai: 'Sola viết vội, nhờ bạn sửa: hàm turn_to(a, b) của màn tính hiệu d = b - a để quay cần từ nấc a tới nấc b, nhưng đang gọi ngược swing_r và swing_l. Hãy sửa lại hàm turn_to(a, b).',
      veMaMau: 'Chạy thử chương trình có sẵn: khi d < 0 hàm turn_to lại quay sang phải nên lệch khỏi mốc (5, 3). Hãy sửa thân hàm turn_to.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 5, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 5, tam: 2, diQua: [{ x: 5, y: 3 }] },
      maMau: bai(['turn_to(5, 2)', 'reach_by(2 - 1)', 'turn_to(2, 5)'], {
        hamCuaMan: [H('turn_to', ['a', 'b'], ['d = b - a', 'if d < 0:', '    swing_r(abs(d))', 'else:', '    swing_l(d)'])]
      }),
      loiGiai: bai(['turn_to(5, 2)', 'reach_by(2 - 1)', 'turn_to(2, 5)'], {
        hamCuaMan: [H('turn_to', ['a', 'b'], ['d = b - a', 'if d < 0:', '    swing_l(abs(d))', 'else:', '    swing_r(d)'])]
      }),
      sao: { o: 18, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Thêm wait() cuối chương trình chính sau khi sửa hàm turn_to',
        baiLam: bai(['turn_to(5, 2)', 'reach_by(2 - 1)', 'turn_to(2, 5)', 'wait()'], {
          hamCuaMan: [H('turn_to', ['a', 'b'], ['d = b - a', 'if d < 0:', '    swing_l(abs(d))', 'else:', '    swing_r(d)'])]
        })
      },
      loiSai: [
        { moTa: 'Không sửa hàm turn_to: quay ngược chiều nên không qua mốc (5, 3)', baiLam: bai(['turn_to(5, 2)', 'reach_by(2 - 1)', 'turn_to(2, 5)'], {
          hamCuaMan: [H('turn_to', ['a', 'b'], ['d = b - a', 'if d < 0:', '    swing_r(abs(d))', 'else:', '    swing_l(d)'])]
        }), phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Chỉ đổi nhánh if sang swing_l(abs(d)) mà quên đổi nhánh else sang swing_r(d)', baiLam: bai(['turn_to(5, 2)', 'reach_by(2 - 1)', 'turn_to(2, 5)'], {
          hamCuaMan: [H('turn_to', ['a', 'b'], ['d = b - a', 'if d < 0:', '    swing_l(abs(d))', 'else:', '    swing_l(d)'])]
        }), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Khi d = b - a < 0, nấc đích b nhỏ hơn nấc a nên phải gọi swing_l(abs(d)).', 'Luna: Ở nhánh else (khi d >= 0), đổi swing_l(d) thành swing_r(d).']
    }),

    manSoAm({
      so: 8, ten: 'Chế hàm: Ngắm cần cẩu', hang: 'bien-the', hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by'], taoHam: ['aim_crane'],
      deBai: 'Sola nhờ bạn: chế hàm aim_crane(da, dr) kết hợp swing_by(da) và reach_by(dr) để chỉnh cả góc quay lẫn tầm vươn. Chương trình chính dùng aim_crane đi từ (nấc 6, tầm 1) qua mốc (6, 3) ở (nấc 2, tầm 3) rồi về (nấc 5, tầm 1).',
      veMaMau: 'Chương trình chính đã gọi aim_crane cho hai chặng. Hãy vào Xưởng hàm tạo aim_crane(da, dr).',
      san: SAN_CANG_RONG,
      batDau: { x: 3, y: 3, nac: 6, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 5, tam: 1, diQua: [{ x: 6, y: 3 }] },
      maMau: bai(['aim_crane(2 - 6, 3 - 1)', 'aim_crane(5 - 2, 1 - 3)']),
      loiGiai: bai(['aim_crane(2 - 6, 3 - 1)', 'aim_crane(5 - 2, 1 - 3)'], { hamCuaEmMoi: [H('aim_crane', ['da', 'dr'], T_AIM_CRANE)] }),
      sao: { o: 18, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Thêm wait() cuối chương trình chính',
        baiLam: bai(['aim_crane(2 - 6, 3 - 1)', 'aim_crane(5 - 2, 1 - 3)', 'wait()']),
        hamCuaEmMoi: [H('aim_crane', ['da', 'dr'], T_AIM_CRANE)]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm aim_crane mà đã bấm Chạy', baiLam: bai(['aim_crane(2 - 6, 3 - 1)', 'aim_crane(5 - 2, 1 - 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền nhầm dr vào swing_by và da vào reach_by làm vươn quá tầm', baiLam: bai(['aim_crane(2 - 6, 3 - 1)', 'aim_crane(5 - 2, 1 - 3)']), hamCuaEmMoi: [H('aim_crane', ['da', 'dr'], ['swing_by(dr)', 'reach_by(da)'])], phaiCoMa: ['can-het-tam'] }
      ],
      goiY: ['Luna: Hàm aim_crane có hai tham số (da, dr).', 'Luna: Trong thân hàm aim_crane, gọi swing_by(da) rồi gọi reach_by(dr).']
    }),

    manSoAm({
      so: 9, ten: 'Danh sách độ lệch quanh cảng', hang: 'bien-the', hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane'],
      deBai: 'Sola nhờ bạn: danh sách steps = [[3, 2], [-4, -1], [2, 1]] lưu các cặp độ lệch [da, dr] cho ba chặng kiểm tra cảng. Hãy duyệt từng cặp s trong steps và gọi aim_crane(s[0], s[1]).',
      veMaMau: 'Chương trình có sẵn đã khai báo steps và vòng lặp for s in steps. Hãy gọi aim_crane(s[0], s[1]) trong vòng lặp.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      bongMo: { x: 3, y: 3, nac: 3, tam: 3, diQua: [{ x: 0, y: 6 }, { x: 5, y: 1 }] },
      maMau: bai(['steps = [[3, 2], [-4, -1], [2, 1]]', 'for s in steps:', '    swing_by(s[0])']),
      loiGiai: bai(['steps = [[3, 2], [-4, -1], [2, 1]]', 'for s in steps:', '    aim_crane(s[0], s[1])']),
      sao: { o: 19, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Thêm wait() sau vòng lặp',
        baiLam: bai(['steps = [[3, 2], [-4, -1], [2, 1]]', 'for s in steps:', '    aim_crane(s[0], s[1])', 'wait()'])
      },
      loiSai: [
        { moTa: 'Chỉ gọi swing_by(s[0]) mà quên đổi tầm s[1]', baiLam: bai(['steps = [[3, 2], [-4, -1], [2, 1]]', 'for s in steps:', '    swing_by(s[0])']), phaiCoMa: ['chua-qua-diem', 'lech-bong-mo'] },
        { moTa: 'Đổi nhầm vị trí s[1] và s[0] trong aim_crane', baiLam: bai(['steps = [[3, 2], [-4, -1], [2, 1]]', 'for s in steps:', '    aim_crane(s[1], s[0])']), phaiCoMa: ['can-het-tam'] }
      ],
      goiY: ['Luna: Mỗi phần tử s trong steps là cặp [da, dr], nên s[0] là độ lệch góc và s[1] là độ lệch tầm.', 'Luna: Thay dòng swing_by(s[0]) bằng aim_crane(s[0], s[1]).']
    }),

    manSoAm({
      so: 10, ten: 'Trùm cuối: Điều phối ba trạm cảng', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'so-am', ten: 'Huy hiệu Số âm và khoảng cách' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane'],
      deBai: 'Sola nhờ bạn: trùm cuối gói 1! Dùng aim_crane điều khiển cần cẩu đi qua 3 chặng độ lệch liên tiếp: chặng 1 (5 - 1, 3 - 1), chặng 2 (2 - 5, 1 - 3) và chặng 3 (6 - 2, 2 - 1) để hoàn thành kiểm tra trên cả hai sân.',
      veMaMau: 'Chương trình có sẵn mới chạy chặng đầu tiên. Hãy viết tiếp chặng 2 và chặng 3 bằng aim_crane.',
      san: [SAN_CANG_RONG, SAN_CANG_RONG],
      batDau: [{ x: 3, y: 3, nac: 1, tam: 1 }, { x: 3, y: 3, nac: 2, tam: 1 }],
      bongMo: [
        { x: 3, y: 3, nac: 6, tam: 2, diQua: [{ x: 0, y: 6 }, { x: 4, y: 3 }] },
        { x: 3, y: 3, nac: 7, tam: 2, diQua: [{ x: 0, y: 3 }, { x: 4, y: 4 }] }
      ],
      maMau: bai(['aim_crane(5 - 1, 3 - 1)']),
      loiGiai: bai(['aim_crane(5 - 1, 3 - 1)', 'aim_crane(2 - 5, 1 - 3)', 'aim_crane(6 - 2, 2 - 1)']),
      sao: { o: 19, nhip: 32 },
      loiGiaiKhac: {
        moTa: 'Đặt ba cặp độ lệch vào danh sách rồi duyệt bằng for',
        baiLam: bai(['steps = [[4, 2], [-3, -2], [4, 1]]', 'for s in steps:', '    aim_crane(s[0], s[1])'])
      },
      loiSai: [
        { moTa: 'Mới chạy chặng đầu tiên nên thiếu mốc thứ hai và lệch đích', baiLam: bai(['aim_crane(5 - 1, 3 - 1)']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Tính ngược hiệu ở chặng 2 thành (5 - 2, 1 - 3) nên quay sai chiều', baiLam: bai(['aim_crane(5 - 1, 3 - 1)', 'aim_crane(5 - 2, 1 - 3)', 'aim_crane(6 - 2, 2 - 1)']), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Luna: Chặng 2 đi từ (nấc 5, tầm 3) về (nấc 2, tầm 1) nên gọi aim_crane(2 - 5, 1 - 3).', 'Luna: Chặng 3 đi từ (nấc 2, tầm 1) sang (nấc 6, tầm 2) nên gọi aim_crane(6 - 2, 2 - 1).']
    })
  ];

  ManHoc.manCanCau = DS;
  if (laNode) module.exports = DS;
})();
