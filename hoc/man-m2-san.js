/* ============================================================================
   man-m2-san.js — diem10code-python: MÙA 2 Bãi tái chế, CỘT 4 "+Sân" (combo đầy đủ + môi trường bãi tái chế). Hàng 8 là TRÙM CỦA MÙA.
   u = hố. Mang thùng sắt tới sát hố, cho nam châm chỉ về phía hố rồi magnet_off(): thùng lấp hố, ô thành sàn. Bước vào hố chưa lấp là rơi, có mang thùng cũng vậy.
   Đệm từ (demTu, ô ghi '.'): khối, kéo / đẩy robot đứng cùng hàng, cùng cột trong 2 ô. Tắt nam châm hay khác cực thì bị hút, cùng cực thì bị đẩy.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  /** Hành lang một hàng, trên dưới là tường. */
  function HL(s) { var t = s.replace(/./g, '#'); return [t, s, t]; }
  function CHAT(s) { var t = s.replace(/./g, '.'); return [t, s, t]; }

  function man(so, m) {
    m.chuong = 'm2-c4-san';
    m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.moXuong = true;
    m.phienBanNoiDung = 3;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }
  var BD = { x: 0, y: 1, huong: 1 };
  var TRUM = ['##########', '#####.####', '#####u####', '.o.u....oD', '##########'], DEM = [{ x: 5, y: 1, cuc: 'N' }], BD3 = { x: 0, y: 3, huong: 1 };

  ManHoc.them([
    man(1, { ten: 'Lấp hố',
      deBai: 'Bước vào hố là rơi, có mang thùng cũng vậy. Mang thùng sắt tới sát hố rồi magnet_off(): thùng rơi xuống lấp hố, ô đó thành sàn. Đọc code, đoán rồi bấm Chạy.',
      san: HL('.o.u..F'),
      vatChat: CHAT('.s.....'),
      batDau: BD,
      duDoan: { hoi: 'Thùng sắt thả xuống hố rồi thì sao?', luaChon: ['Ô hố thành sàn, nhện đi tiếp được', 'Thùng chìm mất, hố vẫn còn', 'Thùng nằm lại bên cạnh hố'], dung: 0, xacMinh: { x: 6, y: 1 } },
      sao: { o: 8, nhip: 14 },
      loiGiai: { chinh: ['magnet_n("right")', 'go_right()', 'go_right()', 'magnet_off()', 'go_right()', 'go_right()', 'go_right()', 'go_right()'] } }),

    man(2, { ten: 'Quên thả thùng',
      deBai: 'Nhện dò ra thùng sắt, mang tới sát hố nhưng không thả nên bước luôn xuống hố. Thiếu một lệnh ở ô trống. Điền vào để lấp hố rồi đi tiếp tới cờ.',
      san: HL('...o.u.F'),
      vatChat: CHAT('...s....'),
      batDau: BD,
      maMau: { chinh: ['while not front_metal():', '    go_right()', 'magnet_n("right")', 'for i in range(3):', '    go_right()', '', 'for i in range(3):', '    go_right()'] },
      goiY: ['Thùng dính phía trước nhện, nên đứng sát hố là thả được.'],
      sao: { o: 8, nhip: 16 },
      loiGiai: { chinh: ['while not front_metal():', '    go_right()', 'magnet_n("right")', 'for i in range(3):', '    go_right()', 'magnet_off()', 'for i in range(3):', '    go_right()'] } }),

    man(3, { ten: 'Đệm bên đường',
      deBai: 'Đệm từ là khối kéo, đẩy nhện đứng cùng hàng, cùng cột trong 2 ô: nam châm tắt hay khác cực thì bị hút, cùng cực thì bị đẩy. Code này sai đúng 1 chỗ: đi ngang đệm từ cực N, nhện bị hút vào hố nằm giữa. Bấm Chạy xem lỗi, rồi sửa dòng sai.',
      san: ['#######', '###.###', '###u###', '.....F#', '#######'],
      demTu: [{ x: 3, y: 1, cuc: 'N' }],
      batDau: { x: 0, y: 3, huong: 1 },
      maMau: { chinh: ['magnet_s("right")', 'for i in range(5):', '    go_right()'] },
      goiY: ['Cùng cực thì đệm đẩy ra xa; phía dưới đường là tường nên nhện đứng vững.'],
      sao: { o: 3, nhip: 11 },
      loiGiai: { chinh: ['magnet_n("right")', 'for i in range(5):', '    go_right()'] } }),

    man(4, { ten: 'Dò thùng, lấp hố',
      deBai: 'Màn trống, em tự viết. Hai sân, thùng sắt ở xa gần khác nhau, nhưng từ thùng tới hố luôn 2 ô, từ hố tới cờ luôn 2 ô. Dò ra thùng, mang tới lấp hố rồi đi tới cờ.',
      san: [HL('...o.u.F'), HL('.....o.u.F')],
      vatChat: [CHAT('...s....'), CHAT('.....s....')],
      batDau: [BD, BD],
      goiY: ['Khi front_metal() đúng, thùng còn cách 2 ô, hố còn cách 4 ô. Thùng dính sát nhện nên đi 3 bước là tới sát hố.', 'magnet_off() mất 1 nhịp: thùng rơi ngay, rồi nhện mới bước tiếp.'],
      sao: { o: 8, nhip: 20 },
      loiGiai: { chinh: ['while not front_metal():', '    go_right()', 'magnet_n("right")', 'for i in range(3):', '    go_right()', 'magnet_off()', 'for i in range(3):', '    go_right()'] } }),

    man(5, { ten: 'Lấp hố hay đi vòng',
      deBai: 'Tới cờ bằng đường vòng phía trên, hoặc lấp hố rồi đi thẳng. Một sao cho bài gọn, một sao cho bài nhanh, có thể lấy bằng hai bài khác nhau.',
      san: ['.........', '.#######.', '...o.u..F'],
      vatChat: ['.........', '.........', '...s.....'],
      batDau: { x: 0, y: 2, huong: 1 },
      goiY: ['Đường vòng chỉ có ba đoạn thẳng, nhưng mỗi bước của nhện mất 2 nhịp.', 'Thùng còn cách 3 ô, nam châm chưa với tới: bước một ô rồi mới bật. Lệnh nam châm chỉ 1 nhịp, nên lấp hố rẻ hơn đi vòng.'],
      sao: { o: 6, nhip: 18 },
      doiCho: true,
      loiGiai: { chinh: FOR(2, ['go_up()']).concat(FOR(8, ['go_right()']), FOR(2, ['go_down()'])) },
      cachKhac: [{ chinh: ['go_right()', 'magnet_n("right")'].concat(FOR(3, ['go_right()']), ['magnet_off()'], FOR(4, ['go_right()'])) }] }),

    man(6, { ten: 'Hai hố: tự viết hàm',
      deBai: 'Hai đoạn đường giống hệt nhau, mỗi đoạn một thùng sắt, một hố. Tự viết hàm tên tùy em cho một đoạn rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: HL('.o.u.o.uF'),
      vatChat: CHAT('.s...s...'),
      batDau: BD,
      khung: { chinh: 3 },
      goiY: ['Một đoạn: hút thùng phía trước, đi hai bước tới sát hố, tắt nam châm, đi hai bước qua hố.'],
      sao: { o: 8, nhip: 20 },
      loiGiai: {
        chinh: FOR(2, ['lap_ho()']),
        hamCuaEmMoi: [H('lap_ho', ['magnet_n("right")', 'go_right()', 'go_right()', 'magnet_off()', 'go_right()', 'go_right()'])]
      } }),

    man(7, { ten: 'Hai hố hay đường vòng',
      deBai: 'Trên đường thẳng có hai hố, mỗi hố một thùng sắt, phía trên có đường vòng. Hàm nào cũng được, tên tùy em. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['.........', '.#######.', '.o.u.o.uF'],
      vatChat: ['.........', '.........', '.s...s...'],
      batDau: { x: 0, y: 2, huong: 1 },
      goiY: ['Hai đoạn lấp hố giống hệt nhau: viết thành hàm rồi gọi trong for.', 'Đường vòng vẫn gọn hơn, nhưng đi xa hơn 4 bước.'],
      sao: { o: 6, nhip: 20 },
      doiCho: true,
      loiGiai: { chinh: FOR(2, ['go_up()']).concat(FOR(8, ['go_right()']), FOR(2, ['go_down()'])) },
      cachKhac: [{ chinh: FOR(2, ['lap_ho()']), hamCuaEmMoi: [H('lap_ho', ['magnet_n("right")', 'go_right()', 'go_right()', 'magnet_off()', 'go_right()', 'go_right()'])] }] }),

    man(8, { ten: 'TRÙM: Bãi tái chế sạch bong',
      deBai: 'Màn trùm của mùa. Ba sân: lấp hố bằng thùng sắt đầu đường, đi qua đệm từ cực N có hố bên cạnh, rồi đọc vật cuối đường (sắt, cực N hay cực S) để hút đúng cực, mang lên ô đích. Lúc đi ngang đệm, cho nam châm chỉ ra phía sau để khỏi đụng vật cuối đường. Chương trình chính chỉ có 10 ô.',
      san: [TRUM, TRUM, TRUM],
      vatChat: [
        ['..........', '..........', '..........', '.s......s.', '..........'],
        ['..........', '..........', '..........', '.s......N.', '..........'],
        ['..........', '..........', '..........', '.s......S.', '..........']
      ],
      demTu: [DEM, DEM, DEM],
      batDau: [BD3, BD3, BD3],
      vatCan: 'tu',
      mucTieu: 'dua-vat',
      sao: { o: 17, nhip: 21 },
      loiGiai: {
        chinh: ['lap_ho()', 'magnet_n("left")', 'for i in range(3):', '    go_right()', 'chon_cuc()', 'for i in range(2):', '    go_right()', 'magnet_off()'],
        hamCuaEmMoi: [
          H('lap_ho', ['magnet_n("right")', 'go_right()', 'go_right()', 'magnet_off()', 'go_right()']),
          H('chon_cuc', ['if front_metal() or front_pole() == "N":', '    magnet_s("right")', 'else:', '    magnet_n("right")'])
        ]
      },
      huyHieu: { ma: 'm2-c4-san', ten: 'Bãi tái chế sạch bong' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
