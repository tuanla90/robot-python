/* ============================================================================
   man-m2-cambien.js — diem10code-python: MÙA 2 Bãi tái chế, CỘT 3 "Cảm ứng từ" (Nhện + Nam châm + Cảm ứng từ, combo đầy đủ của mùa).
   Đầu dò nhìn cố định sang phải (batDau.huong = 1): front_metal() True nếu vật đầu tiên là sắt trong 2 ô; front_pole() trả CHUỖI "N", "S" hay "none" (vật đầu tiên trong 3 ô).
   Vật nam châm: nam châm khác cực thì hút, cùng cực thì đẩy ra xa. Hàng 1–5 đầu dò và nam châm cùng nhìn sang phải, hàng 6–8 đầu dò nhìn lên (batDau.huong = 0), vật nằm trên làn đường nên không chắn lối. Dạy so sánh chuỗi, elif, or. Từ hàng 3 có màn nhiều sân để code không đoán sẵn được cực.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var CHON_CUC = ['if front_pole() == "N":', '    magnet_s("right")', 'elif front_pole() == "S":', '    magnet_n("right")'];
  var CHON_LEN = ['if front_pole() == "N":', '    magnet_s("up")', 'elif front_pole() == "S":', '    magnet_n("up")'];
  var CUOI = ['magnet_off()'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  /** Sân một hàng đường đi: hàng rỗng trên, dưới. */
  function HANG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }

  function man(so, m) {
    m.chuong = 'm2-c3-cam-bien';
    m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.mucTieu = 'dua-vat';
    m.moXuong = true;
    m.phienBanNoiDung = 3;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }
  var BD = { x: 0, y: 1, huong: 1 }, BD_LEN = { x: 0, y: 1, huong: 0 };

  ManHoc.them([
    man(1, { ten: 'Khác cực mới hút',
      deBai: 'Đầu dò từ nhìn cố định sang phải: front_metal() báo có sắt khi thùng còn cách 2 ô. Thùng này là vật nam châm có ghi cực, front_pole() đọc được cực đó, trả về một chuỗi. Khác cực thì hút, cùng cực thì đẩy ra xa. Đọc code, đoán rồi bấm Chạy.',
      san: HANG('..o.D..'),
      vatChat: HANG('..N....'),
      batDau: BD, vatCan: 'nam-cham',
      duDoan: { hoi: 'Vật cực N ở phía trước. Nhện chạy lệnh nam châm nào?', luaChon: ['magnet_n("right")', 'magnet_s("right")', 'Cả hai lệnh'], dung: 1, xacMinh: { lenh: { magnet_s: 1, magnet_n: 0 } } },
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: CHON_CUC.concat(FOR(3, ['go_right()']), CUOI) } }),

    man(2, { ten: 'Sắt hoặc cực N', dangBai: 'sap-xep',
      deBai: 'Ba sân: thùng sắt, vật cực N, vật cực S. Đủ dòng nhưng sai thứ tự và hai lệnh nam châm nằm nhầm nhánh. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: [HANG('..o.D..'), HANG('..o.D..'), HANG('..o.D..')],
      vatChat: [HANG('..s....'), HANG('..N....'), HANG('..S....')],
      batDau: [BD, BD, BD], vatCan: 'tu',
      maMau: { chinh: ['for i in range(3):', '    go_right()', 'if front_metal() or front_pole() == "N":', '    magnet_n("right")', 'else:', '    magnet_s("right")', 'magnet_off()'] },
      goiY: ['Phải bật nam châm TRƯỚC khi đi, không thì thùng chắn đường nhện.', 'Cực nào cũng hút sắt, nên sắt và cực N dùng chung một nhánh.'],
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: ['if front_metal() or front_pole() == "N":', '    magnet_s("right")', 'else:', '    magnet_n("right")'].concat(FOR(3, ['go_right()']), CUOI) } }),

    man(3, { ten: 'Bật nhầm cực',
      deBai: 'Code này sai đúng 1 chỗ: ở sân có vật cực N, vật bị đẩy văng đi chứ không dính vào nam châm. Bấm Chạy xem lỗi, rồi sửa dòng sai.',
      san: [HANG('.....oD...'), HANG('...oD..')],
      vatChat: [HANG('.....N....'), HANG('...S...')],
      batDau: [BD, BD], vatCan: 'nam-cham',
      maMau: { chinh: ['while front_pole() == "none":', '    go_right()', 'if front_pole() == "N":', '    magnet_n("right")', 'elif front_pole() == "S":', '    magnet_n("right")'].concat(FOR(3, ['go_right()']), CUOI) },
      goiY: ['Cùng cực thì nam châm đẩy vật ra xa, khác cực mới hút.'],
      sao: { o: 9, nhip: 12 },
      loiGiai: { chinh: ['while front_pole() == "none":', '    go_right()'].concat(CHON_CUC, FOR(3, ['go_right()']), CUOI) } }),

    man(4, { ten: 'Bỏ qua gỗ',
      deBai: 'Màn trống, em tự viết. Hai sân, mỗi hàng có thể có một thùng. Thùng gỗ không hút được. Đi xuống dò từng hàng tới khi thấy sắt, bật nam châm, mang thùng tới ô đích cách thùng 2 ô.',
      san: [['..o...', '......', '..o.D.'], ['..o...', '..o...', '......', '..o.D.']],
      vatChat: [['..g...', '......', '..s...'], ['..g...', '..g...', '......', '..s...']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }], vatCan: 'sat',
      goiY: ['Thùng gỗ là vật đầu tiên thì front_metal() là False, nên cứ đi xuống hàng tiếp theo.', 'Thùng dính phía trước nhện: thả vào ô đích khi nhện đứng ngay trước ô đó.'],
      sao: { o: 6, nhip: 14 },
      loiGiai: { chinh: ['while not front_metal():', '    go_down()', 'magnet_n("right")'].concat(FOR(3, ['go_right()']), CUOI) } }),

    man(5, { ten: 'Đích gần hay đích xa',
      deBai: 'Hai sân, thùng sắt ở xa gần khác nhau. Có hai ô đích, thùng vào ô nào cũng được: ô xa nằm thẳng đường cách thùng 4 ô, ô gần ở chéo phía trên. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: [['....D....', '...o...D.', '.........'], ['......D....', '.....o...D.', '...........']],
      vatChat: [['.........', '...s.....', '.........'], ['...........', '.....s.....', '...........']],
      batDau: [BD, BD], vatCan: 'sat',
      goiY: ['Khi front_metal() đúng, thùng còn cách 2 ô. Cứ đi thẳng thì chỉ cần một vòng for.', 'Nhện không phải quay nên rẽ không mất thêm nhịp: đích gần chỉ tốn thêm một dòng.'],
      sao: { o: 6, nhip: 14 },
      doiCho: true,
      loiGiai: { chinh: ['while not front_metal():', '    go_right()', 'magnet_n("right")'].concat(FOR(5, ['go_right()']), CUOI) },
      cachKhac: [{ chinh: ['while not front_metal():', '    go_right()', 'magnet_n("right")'].concat(FOR(2, ['go_right()']), ['go_up()'], CUOI) }] }),

    man(6, { ten: 'Hai vật: tự viết hàm',
      deBai: 'Hai sân, mỗi sân hai vật nam châm khác cực nhau nằm phía trên đường đi, mỗi vật một ô đích ngay bên phải nó. Màn này đầu dò nhìn lên phía trên. Tự viết hàm tên tùy em cho một lượt rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: [['.oD.oD.', '.......'], ['.oD.oD.', '.......']],
      vatChat: [['.N..S..', '.......'], ['.S..N..', '.......']],
      batDau: [BD_LEN, BD_LEN], vatCan: 'nam-cham',
      khung: { chinh: 3 },
      goiY: ['Một lượt: bước tới dưới vật, đọc cực, bật cực ngược lại lên trên, bước một ô, tắt nam châm, bước tiếp một ô.'],
      sao: { o: 10, nhip: 16 },
      loiGiai: {
        chinh: FOR(2, ['lay_vat()']),
        hamCuaEmMoi: [H('lay_vat', ['go_right()'].concat(CHON_LEN, ['go_right()'], CUOI, ['go_right()']))]
      } }),

    man(7, { ten: 'Hàm dùng chung hay từng chuyến',
      deBai: 'Hai sân, hai vật khác cực nhau nằm phía trên đường đi. Màn này đầu dò nhìn lên. Mỗi vật vào ô đích nào cũng được. Một hàm dùng chung cho hai chuyến thì gọn nhưng phải mang xa, đặt vào ô đích gần thì nhanh nhưng hai chuyến khác nhau. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: [['.oD.DoD.D', '.........'], ['.oD.DoD.D', '.........']],
      vatChat: [['.N...S...', '.........'], ['.S...N...', '.........']],
      batDau: [BD_LEN, BD_LEN], vatCan: 'nam-cham',
      goiY: ['Một lượt dùng chung: bước tới dưới vật, đọc cực, bật cực ngược lại, đi 3 bước, tắt nam châm.', 'Muốn nhanh thì chỉ cho phần đọc cực vào hàm, còn số bước của hai chuyến viết riêng.'],
      sao: { o: 10, nhip: 16 },
      doiCho: true,
      loiGiai: {
        chinh: FOR(2, ['lay_vat()']),
        hamCuaEmMoi: [H('lay_vat', ['go_right()'].concat(CHON_LEN, FOR(3, ['go_right()']), CUOI))]
      },
      cachKhac: [{
        chinh: ['go_right()', 'chon_cuc()', 'go_right()'].concat(CUOI, FOR(3, ['go_right()']), ['chon_cuc()', 'go_right()'], CUOI),
        hamCuaEmMoi: [H('chon_cuc', CHON_LEN)]
      }] }),

    man(8, { ten: 'Băng phân loại',
      deBai: 'Hai sân, mỗi sân ba vật đủ loại nằm phía trên đường đi: sắt, cực N, cực S, cả gỗ. Màn này đầu dò nhìn lên. Mọi vật có từ phải lên ô đích ngay bên phải nó, gỗ thì để yên. Chương trình chính chỉ có 10 ô.',
      san: [['.oD.oD.oD.', '..........'], ['.oD.oD.oD.', '..........']],
      vatChat: [['.s..N..S..', '..........'], ['.S..g..N..', '..........']],
      batDau: [BD_LEN, BD_LEN], vatCan: 'tu',
      sao: { o: 9, nhip: 24 },
      loiGiai: { chinh: FOR(3, ['go_right()', 'if front_metal() or front_pole() == "N":', '    magnet_s("up")', 'elif front_pole() == "S":', '    magnet_n("up")', 'go_right()'].concat(CUOI, ['go_right()'])) },
      huyHieu: { ma: 'm2-c3-cam-bien', ten: 'Thợ dò từ' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
