/* ============================================================================
   man-m2-cambien.js — diem10code-python: MÙA 2 Bãi tái chế, CỘT 3 "Cảm ứng từ" (Nhện + Nam châm + Cảm ứng từ, combo đầy đủ của mùa).
   Đầu dò nhìn cố định sang phải (batDau.huong = 1): front_metal() True nếu vật đầu tiên là sắt trong 2 ô; front_pole() trả CHUỖI "N", "S" hay "none" (vật đầu tiên trong 3 ô).
   Vật nam châm: nam châm khác cực thì hút, cùng cực thì nằm yên. Dạy so sánh chuỗi, elif, or. Từ hàng 3 có màn nhiều sân để code không đoán sẵn được cực.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var CHON_CUC = ['if front_pole() == "N":', '    magnet_s()', 'elif front_pole() == "S":', '    magnet_n()'];
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
    m.phienBanNoiDung = 1;                     // wait() không còn chốt lệnh: bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }
  var BD = { x: 0, y: 1, huong: 1 };

  ManHoc.them([
    man(1, { ten: 'Dò ra sắt',
      deBai: 'Bấm Chạy và xem: front_metal() báo có sắt phía trước khi thùng còn cách 2 ô. Nhện đi tiếp hai bước để đứng lên thùng rồi mang đi.',
      san: HANG('.....o.D'),
      vatChat: HANG('.....s..'),
      batDau: BD, vatCan: 'sat',
      sao: { o: 8, nhip: 16 },
      loiGiai: { chinh: ['while not front_metal():', '    go_right()', 'go_right()', 'go_right()', 'magnet_n()', 'go_right()', 'go_right()'].concat(CUOI) } }),

    man(2, { ten: 'Khác cực mới hút',
      deBai: 'Thùng này là vật nam châm có ghi cực. front_pole() đọc được cực đó, trả về một chuỗi. Đọc code, đoán rồi bấm Chạy.',
      san: HANG('..o.D'),
      vatChat: HANG('..N..'),
      batDau: BD, vatCan: 'nam-cham',
      duDoan: { hoi: 'Vật cực N ở phía trước. Nhện chạy lệnh nam châm nào?', luaChon: ['magnet_n()', 'magnet_s()', 'Cả hai lệnh'], dung: 1, xacMinh: { lenh: { magnet_s: 1, magnet_n: 0 } } },
      sao: { o: 7, nhip: 10 },
      loiGiai: { chinh: CHON_CUC.concat(FOR(4, ['go_right()']), CUOI) } }),

    man(3, { ten: 'Nhánh còn thiếu',
      deBai: 'Hai sân: một sân vật cực N, một sân vật cực S. Nhánh elif đang thiếu lệnh. Điền vào để cả hai sân đều hút được vật.',
      san: [HANG('..o.D'), HANG('..o.D')],
      vatChat: [HANG('..N..'), HANG('..S..')],
      batDau: [BD, BD], vatCan: 'nam-cham',
      maMau: { chinh: ['if front_pole() == "N":', '    magnet_s()', 'elif front_pole() == "S":', '    '].concat(FOR(4, ['go_right()']), CUOI) },
      goiY: ['Vật cực S thì phải bật cực nào mới hút?'],
      sao: { o: 7, nhip: 10 },
      loiGiai: { chinh: CHON_CUC.concat(FOR(4, ['go_right()']), CUOI) } }),

    man(4, { ten: 'Sắt hoặc cực N',
      deBai: 'Ba sân: thùng sắt, vật cực N, vật cực S. Đủ dòng nhưng sai thứ tự và hai lệnh nam châm nằm nhầm nhánh. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: [HANG('..o.D'), HANG('..o.D'), HANG('..o.D')],
      vatChat: [HANG('..s..'), HANG('..N..'), HANG('..S..')],
      batDau: [BD, BD, BD], vatCan: 'tu',
      maMau: { chinh: ['for i in range(4):', '    go_right()', 'if front_metal() or front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'magnet_off()'] },
      goiY: ['Phải bật nam châm TRƯỚC khi đi, vì đi qua rồi đầu dò không còn thấy vật.', 'Cực nào cũng hút sắt, nên sắt và cực N dùng chung một nhánh.'],
      sao: { o: 7, nhip: 10 },
      loiGiai: { chinh: ['if front_metal() or front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()'].concat(FOR(4, ['go_right()']), CUOI) } }),

    man(5, { ten: 'Bật nhầm cực',
      deBai: 'Code này sai đúng 1 chỗ: ở sân có vật cực N, nhện đi qua mà vật vẫn nằm yên. Bấm Chạy xem lỗi, rồi sửa dòng sai.',
      san: [HANG('.....oD'), HANG('...oD..')],
      vatChat: [HANG('.....N.'), HANG('...S...')],
      batDau: [BD, BD], vatCan: 'nam-cham',
      maMau: { chinh: ['while front_pole() == "none":', '    go_right()', 'if front_pole() == "N":', '    magnet_n()', 'elif front_pole() == "S":', '    magnet_n()'].concat(FOR(4, ['go_right()']), CUOI) },
      goiY: ['Cùng cực thì nam châm không hút.'],
      sao: { o: 9, nhip: 14 },
      loiGiai: { chinh: ['while front_pole() == "none":', '    go_right()'].concat(CHON_CUC, FOR(4, ['go_right()']), CUOI) } }),

    man(6, { ten: 'Bỏ qua gỗ',
      deBai: 'Màn trống, em tự viết. Hai sân, trên đường có thùng gỗ chắn trước thùng sắt. Dò tới khi thấy sắt, bật nam châm, mang thùng tới ô đích ở cách thùng 3 ô.',
      san: [HANG('..o..o..D'), HANG('.o....o..D')],
      vatChat: [HANG('..g..s...'), HANG('.g....s...')],
      batDau: [BD, BD], vatCan: 'sat',
      goiY: ['Thùng gỗ là vật đầu tiên thì front_metal() vẫn là False. Nhện đứng trùm lên gỗ được nên cứ đi tiếp.', 'Khi front_metal() đúng, thùng sắt còn cách 2 ô.'],
      sao: { o: 6, nhip: 20 },
      loiGiai: { chinh: ['while not front_metal():', '    go_right()', 'magnet_n()'].concat(FOR(5, ['go_right()']), CUOI) } }),

    man(7, { ten: 'Hai vật: tự viết hàm',
      deBai: 'Hai sân, mỗi sân hai vật nam châm khác cực nhau, mỗi vật một ô đích ngay sau nó. Tự viết hàm tên tùy em cho một lượt rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: [HANG('..oD.oD'), HANG('..oD.oD')],
      vatChat: [HANG('..N..S.'), HANG('..S..N.')],
      batDau: [BD, BD], vatCan: 'nam-cham',
      khung: { chinh: 3 },
      goiY: ['Một lượt: đọc cực, bật cực ngược lại, đi 3 bước, tắt nam châm.'],
      sao: { o: 9, nhip: 16 },
      loiGiai: {
        chinh: FOR(2, ['lay_vat()']),
        hamCuaEmMoi: [H('lay_vat', CHON_CUC.concat(FOR(3, ['go_right()']), CUOI))]
      } }),

    man(8, { ten: 'Băng phân loại',
      deBai: 'Hai sân, mỗi sân ba vật đủ loại: sắt, cực N, cực S, cả gỗ. Mọi vật có từ phải lên ô đích ngay sau nó, gỗ thì để yên. Chương trình chính chỉ có 10 ô.',
      san: [HANG('..oD.oD.oD'), HANG('..oD.oD.oD')],
      vatChat: [HANG('..s..N..S.'), HANG('..S..g..N.')],
      batDau: [BD, BD], vatCan: 'tu',
      sao: { o: 9, nhip: 24 },
      loiGiai: { chinh: FOR(3, ['go_right()', 'if front_metal() or front_pole() == "N":', '    magnet_s()', 'elif front_pole() == "S":', '    magnet_n()', 'go_right()', 'go_right()'].concat(CUOI)) },
      huyHieu: { ma: 'che-nam-cham', ten: 'Thợ dò từ' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
