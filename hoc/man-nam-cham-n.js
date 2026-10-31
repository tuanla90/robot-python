/* ============================================================================
   man-nam-cham-n.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 2 "Nam châm" (KE-HOACH-MUA-3.md; phiên "Mùa 3" tự viết 29/10;
   PDM3a 31/10 viết lại trên ROBOT PHÂN LOẠI: nhện + NAM CHÂM BỤNG, luật part đúng mùa KE-HOACH-PART-DUNG-MUA.md).
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) xếp màn theo dòng chương khai đủ thứ tự.
     - `nam-cham`: chương 1 "Nam châm" một cực N trên bụng nhện. Màn mới so 11–20 (mã nam-cham.1 … .10 là màn xe cũ: .1 .4 .5 .7 .8 cất ra chương rời
       nam-cham-xe; .2 .3 .6 ở gói 6–7; .9 .10 ở nam-cham-omni). Thứ tự 11 (trình diễn) … 20 (trùm).
       Cái mới của gói: NAM CHÂM BỤNG một cực N (magnet_n / magnet_off; magnet_s mở ở gói 6): hút / thả ở Ô NGAY DƯỚI nhện, nhện đứng trùm lên vật
       được, vật dính đi theo; lệnh nam châm làm ở nhịp wait() hay nhịp đầu của bước kế. Luật: san-hoc.js phần NAM CHÂM, mục "NAM CHÂM BỤNG NHỆN".
       Sắt: cực nào cũng hút. Gỗ: không hút ('hut-go'). Vật chữ N: cùng cực nên nằm yên ('cung-cuc'; gói 6 mới đổi cực). Vật chữ S: cực N hút được.
       Nam châm bật thì mỗi nhịp lại hút tiếp: đi ngang qua mẩu sắt là dính (màn 15, 16 đặt mẩu sắt lệch khỏi đường đi để lời sai không "vô tình" nhặt).
     - `logic-nam-cham`: chương 2 "Logic cho nam châm": and / or (/ elif ôn) với CHUỖI DỮ LIỆU trong mã (gói 1 chương 2 dạy chuỗi): mỗi chữ của chuỗi
       là chất của một mẩu phế liệu xếp thành hàng (s sắt · g gỗ · S vật chữ S · N vật chữ N), duyệt for c in "sgS" rồi if c == "s" or c == "S".
       Gói 2 CHƯA có cảm biến (front_metal mở ở gói 3). Hàm của em mới: carry_down() (hút, xuống một ô, thả, lên lại), carry_up() (hút, lên, thả, xuống).
       Sân: dưới (hay trên) mẩu không được mang là TƯỜNG, phía kia là SÀN: nhánh sai thì nhện đâm tường (đâm không thua), thả, rồi bước sang hàng khác
       và lệch khỏi dãy mẩu, chuyến sau hút ở ô trống → thua 'chua-dua-vat' (lời sai chứng minh). Mẩu chữ N nằm sẵn trên thùng (ô X: đích đã có vật).
   Hàm của em gói 1 (go, trail) dùng lại. Máy kiểm: hoc/kiem-man-mua-3.mjs, hoc/kiem-lo-trinh.mjs mục mùa 3, hoc/kiem-part-mua.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HG = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'magnet_n', 'magnet_off'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function thut(ds, n) { var p = new Array((n || 1) * 4 + 1).join(' '); return ds.map(function (s) { return p + s; }); }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function lap(n, s) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }

  var NHAT = ['magnet_n()', 'wait()'], DAT = ['magnet_off()', 'wait()'];

  function man(m) {
    m.chuong = m.chuong || 'nam-cham';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [] };
    m.hamGoc = HG;
    m.mucTieu = 'dua-vat'; m.vatCan = m.vatCan || 'tu';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương nam-cham "Nam châm" (nam châm bụng, cực N) ================================================= */
    man({
      so: 11, ten: 'Nhện nhặt sắt vụn', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Robot phân loại gắn nam châm điện DƯỚI BỤNG. Nhện bước lên trùm qua mẩu sắt vụn, magnet_n() bật cực N hút mẩu sắt ở ô ngay dưới bụng, magnet_off() thả nó xuống ô đang đứng. Bấm Chạy xem nhện nhặt sắt rồi mang tới thùng (ô đích).',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn mẩu sắt dính lên bụng nhện rồi đi theo.',
      san: ['.o..D'], vatChat: ['.s...'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['go_right()'], NHAT, lap(3, 'go_right()'), DAT)),
      loiGiai: bai(nhieu(['go_right()'], NHAT, lap(3, 'go_right()'), DAT)),
      sao: { o: 8, nhip: 10 },
      goiY: ['Nam châm ở bụng: phải đứng NGAY TRÊN mẩu sắt rồi mới hút.', 'Lệnh nam châm chỉ ra lệnh; wait() cho nhịp trôi để nam châm làm.']
    }),

    man({
      so: 12, ten: 'Mang xuống thùng', hang: 'lam-quen',
      deBai: 'Mẩu sắt vụn cách nhện ba ô bên phải, thùng (ô đích) ở dưới mẩu sắt hai ô. Đi tới đứng trên mẩu sắt, hút nó lên, mang xuống thùng rồi thả.',
      veMaMau: 'Chương trình có sẵn đi tới mẩu sắt rồi đi xuống luôn, quên hút. Chạy thử rồi sửa.',
      san: ['...o', '....', '...D'], vatChat: ['...s', '....', '....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(LAP(3, 'go_right()'), LAP(2, 'go_down()'), DAT)),
      loiGiai: bai(nhieu(LAP(3, 'go_right()'), NHAT, LAP(2, 'go_down()'), DAT)),
      sao: { o: 8, nhip: 12 },
      loiSai: [
        { moTa: 'Quên hút: nhện đi xuống một mình, mẩu sắt nằm lại', baiLam: bai(nhieu(LAP(3, 'go_right()'), LAP(2, 'go_down()'), DAT)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên thả: mẩu sắt còn dính dưới bụng', baiLam: bai(nhieu(LAP(3, 'go_right()'), NHAT, LAP(2, 'go_down()'))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đứng trên mẩu sắt: magnet_n() rồi wait().', 'Tới thùng: magnet_off() rồi wait().']
    }),

    man({
      so: 13, ten: 'Hai chuyến', hang: 'lam-quen',
      deBai: 'Hai mẩu sắt vụn ở hàng trên, hai thùng ngay bên dưới mỗi mẩu. Mỗi chuyến: hút, xuống một ô, thả, lên lại, sang phải ba ô. Dùng vòng for cho hai chuyến.',
      veMaMau: 'Chương trình có sẵn làm được một chuyến. Đặt nó vào vòng for và thêm đường sang mẩu sắt kế tiếp.',
      san: ['o..o', 'D..D'], vatChat: ['s..s', '....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(NHAT, ['go_down()'], DAT)),
      loiGiai: bai(LAP(2, nhieu(NHAT, ['go_down()'], DAT, ['go_up()'], lap(3, 'go_right()')))),
      sao: { o: 10, nhip: 16 },
      loiSai: [
        { moTa: 'Sang phải hai ô mỗi chuyến: chuyến hai nhện hút ở ô trống', baiLam: bai(LAP(2, nhieu(NHAT, ['go_down()'], DAT, ['go_up()'], lap(2, 'go_right()')))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên lên lại: chuyến hai nhện đi ở hàng dưới', baiLam: bai(LAP(2, nhieu(NHAT, ['go_down()'], DAT, lap(3, 'go_right()')))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Một chuyến: hút, xuống, thả, lên, sang phải ba ô.', 'Hai chuyến giống nhau: for i in range(2).']
    }),

    man({
      so: 14, ten: 'Ba chuyến', hang: 'luyen',
      deBai: 'Ba mẩu sắt vụn cách nhau hai ô, ba thùng ngay bên dưới. Mỗi chuyến như màn trước nhưng chỉ sang phải hai ô. Lặp ba lần.',
      veMaMau: 'Chương trình có sẵn làm hai chuyến như màn trước: sang phải ba ô là nhầm. Sửa số ô và số chuyến.',
      san: ['o.o.o', 'D.D.D'], vatChat: ['s.s.s', '.....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(LAP(2, nhieu(NHAT, ['go_down()'], DAT, ['go_up()'], lap(3, 'go_right()')))),
      loiGiai: bai(LAP(3, nhieu(NHAT, ['go_down()'], DAT, ['go_up()'], lap(2, 'go_right()')))),
      sao: { o: 9, nhip: 24 },
      loiSai: [
        { moTa: 'Lặp hai lần: mẩu sắt thứ ba còn nằm đó', baiLam: bai(LAP(2, nhieu(NHAT, ['go_down()'], DAT, ['go_up()'], lap(2, 'go_right()')))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Sang phải ba ô: chuyến hai hút ở ô trống', baiLam: bai(LAP(3, nhieu(NHAT, ['go_down()'], DAT, ['go_up()'], lap(3, 'go_right()')))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mẩu sắt cách nhau hai ô: sang phải hai lần.', 'Ba mẩu sắt: for i in range(3).']
    }),

    man({
      so: 15, ten: 'Gỗ thì để yên', hang: 'luyen',
      deBai: 'Trên đường tới thùng có một mẩu gỗ, mẩu sắt vụn nằm ngay dưới mẩu gỗ. Nam châm KHÔNG hút gỗ: đứng trên gỗ mà bật nam châm thì chẳng có gì dính. Xuống đứng trên mẩu sắt rồi mới hút, lên lại, mang tới thùng.',
      veMaMau: 'Chương trình có sẵn hút ngay ở mẩu gỗ. Chạy thử: nhện tới thùng tay không. Sửa chỗ hút.',
      san: ['.o.D', '.o..'], vatChat: ['.g..', '.s..'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['go_right()'], NHAT, lap(2, 'go_right()'), DAT)),
      loiGiai: bai(nhieu(['go_right()', 'go_down()'], NHAT, ['go_up()', 'go_right()', 'go_right()'], DAT)),
      sao: { o: 9, nhip: 12 },
      loiSai: [
        { moTa: 'Hút khi đứng trên mẩu gỗ: nam châm không hút gỗ, nhện đi tiếp tay không', baiLam: bai(nhieu(['go_right()'], NHAT, lap(2, 'go_right()'), DAT)), phaiCoMa: ['hut-go', 'chua-dua-vat'] }
      ],
      goiY: ['Gỗ không có từ tính: nam châm bỏ qua nó.', 'Mẩu sắt ở ngay dưới mẩu gỗ: xuống một ô rồi hút.']
    }),

    man({
      so: 16, ten: 'Mẩu chữ N nằm yên', hang: 'luyen', vatCan: 'sat',
      deBai: 'Mẩu nam châm có chữ N nằm trên đường, mẩu sắt vụn ở hàng dưới xa hơn. Nam châm bụng đang là cực N, CÙNG CỰC nên mẩu N nằm yên, không hút lên được (gói sau mới học đổi cực). Hôm nay chỉ cần mang mẩu sắt tới thùng: bước qua mẩu N, xuống chỗ mẩu sắt.',
      veMaMau: 'Chương trình có sẵn hút ngay ở mẩu N. Chạy thử: cùng cực, mẩu N không nhúc nhích. Sửa chỗ hút.',
      san: ['.o..D', '...o.'], vatChat: ['.N...', '...s.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['go_right()'], NHAT, lap(3, 'go_right()'), DAT)),
      loiGiai: bai(nhieu(lap(3, 'go_right()'), ['go_down()'], NHAT, ['go_up()', 'go_right()'], DAT)),
      sao: { o: 10, nhip: 14 },
      loiSai: [
        { moTa: 'Hút khi đứng trên mẩu N: cùng cực nên nó nằm yên, nhện đi tiếp tay không', baiLam: bai(nhieu(['go_right()'], NHAT, lap(3, 'go_right()'), DAT)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Cùng cực thì đẩy nhau: cực N không hút mẩu chữ N.', 'Sắt thì cực nào cũng hút: đứng trên mẩu sắt mới bật nam châm.']
    }),

    man({
      so: 17, ten: 'Đường chuỗi mang hàng', hang: 'bien-the', hamCuaEmCan: ['go', 'trail'],
      deBai: 'Đường từ mẩu sắt tới thùng quanh co. Bước sang mẩu sắt, hút nó lên rồi đi theo chuỗi chỉ đường bằng hàm trail(path) của bạn, tới thùng thì thả.',
      veMaMau: 'Chương trình có sẵn đã hút mẩu sắt. Viết tiếp bằng trail("...") rồi thả.',
      san: ['.o.##', '##.##', '##..#', '###.D'], vatChat: ['.s...', '.....', '.....', '.....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['go_right()'], NHAT)),
      loiGiai: bai(nhieu(['go_right()'], NHAT, ['trail("RDDRDR")'], DAT)),
      sao: { o: 16, nhip: 16 },
      loiSai: [
        { moTa: 'Chuỗi thiếu chữ R cuối: nhện thả ngay trước thùng', baiLam: bai(nhieu(['go_right()'], NHAT, ['trail("RDDRD")'], DAT)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chuỗi viết "RDRDRR": đi lệch đường, đâm tường', baiLam: bai(nhieu(['go_right()'], NHAT, ['trail("RDRDRR")'], DAT)), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Mỗi chữ là một bước: R phải, D xuống.', 'Mẩu sắt dính dưới bụng đi theo nhện suốt đường.']
    }),

    man({
      so: 18, ten: 'Băng chuyền chở hàng', hang: 'bien-the',
      deBai: 'Mẩu sắt nằm ngay trước băng chuyền. Nhện đi tới đứng trên mẩu sắt, hút nó, rồi bước lên băng: băng chở cả nhện lẫn mẩu sắt đi nhanh gấp đôi. Tới cuối băng thì xuống thùng và thả.',
      veMaMau: 'Chương trình có sẵn đã hút mẩu sắt. Viết tiếp đường qua băng.',
      san: ['..o>>.', '.....D'], vatChat: ['..s...', '......'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(lap(2, 'go_right()'), NHAT)),
      loiGiai: bai(nhieu(lap(2, 'go_right()'), NHAT, lap(2, 'go_right()'), ['go_down()'], DAT)),
      sao: { o: 9, nhip: 12 },
      loiSai: [
        { moTa: 'Quên hút: băng chở nhện đi, mẩu sắt nằm lại đầu băng', baiLam: bai(nhieu(lap(2, 'go_right()'), lap(2, 'go_right()'), ['go_down()'], DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Trên băng xuôi chiều, mỗi bước nhện đi được hai ô.', 'Tới ô cuối băng thì xuống một ô là thùng.']
    }),

    man({
      so: 19, ten: 'Sửa chuyến hàng', hang: 'bien-the',
      deBai: 'Hai mẩu sắt xếp dọc bên trái, hai thùng xếp dọc bên phải. Sola viết chương trình chở từng mẩu sang phải rồi quay về cột cũ đi xuống, nhưng chuyến hai nhện hút nhầm ô trống. Chạy thử, tìm chỗ sai rồi sửa.',
      veMaMau: 'Chạy thử và nhìn chuyến hai: nhện quay về chưa tới cột sắt.',
      san: ['o.D', 'o.D'], vatChat: ['s..', 's..'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(LAP(2, nhieu(NHAT, lap(2, 'go_right()'), DAT, ['go_left()', 'go_down()']))),
      loiGiai: bai(LAP(2, nhieu(NHAT, lap(2, 'go_right()'), DAT, lap(2, 'go_left()'), ['go_down()']))),
      sao: { o: 10, nhip: 18 },
      loiSai: [
        { moTa: 'Về chỉ một ô: chuyến hai hút ở ô trống', baiLam: bai(LAP(2, nhieu(NHAT, lap(2, 'go_right()'), DAT, ['go_left()', 'go_down()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xuống trước rồi mới về: nhện ra khỏi cột sắt', baiLam: bai(LAP(2, nhieu(NHAT, lap(2, 'go_right()'), DAT, ['go_down()', 'go_left()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sang phải hai ô thì phải về trái hai ô.', 'Về đúng cột rồi mới xuống hàng dưới.']
    }),

    man({
      so: 20, ten: 'Kho sắt vụn', hang: 'trum', khung: { chinh: 14, moiHam: 10 },
      deBai: 'Hàng trên có một mẩu gỗ rồi hai mẩu sắt, mỗi mẩu sắt có thùng ở hàng dưới cùng. Bỏ qua gỗ, rồi lặp hai chuyến: hút, xuống hai ô, thả, lên hai ô, sang phải hai ô.',
      veMaMau: 'Chương trình có sẵn đi qua mẩu gỗ. Viết tiếp hai chuyến bằng vòng for.',
      san: ['o.o.o', '.....', '..D.D'], vatChat: ['g.s.s', '.....', '.....'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(lap(2, 'go_right()')),
      loiGiai: bai(nhieu(lap(2, 'go_right()'), LAP(2, nhieu(NHAT, lap(2, 'go_down()'), DAT, lap(2, 'go_up()'), lap(2, 'go_right()'))))),
      sao: { o: 13, nhip: 24 },
      loiSai: [
        { moTa: 'Hút ngay ở mẩu gỗ rồi mới đi: chuyến đầu tay không', baiLam: bai(nhieu(NHAT, lap(2, 'go_right()'), LAP(2, nhieu(lap(2, 'go_down()'), DAT, lap(2, 'go_up()'), lap(2, 'go_right()'))))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xuống một ô đã thả: thùng ở hàng dưới cùng', baiLam: bai(nhieu(lap(2, 'go_right()'), LAP(2, nhieu(NHAT, ['go_down()'], DAT, ['go_up()'], lap(2, 'go_right()'))))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Gỗ không hút được: đi qua nó trước.', 'Hai chuyến y hệt nhau: viết một chuyến rồi for i in range(2).']
    })
  ];

  /* ================================================= chương logic-nam-cham "Logic cho nam châm" (and / or, chuỗi dữ liệu) =================================================
     Thứ tự (MUA_3): 1 (trình diễn or) · 2 (ép or) · 3 (tạo carry_down) · 4 (tạo carry_up) · 5 (trình diễn and) · 6 (ép and) · 7 (biến + elif) · 8 (sửa) · 9 · 10 (trùm).
     Sân: hàng mẩu phế liệu xếp ngang, chuỗi trong mã ghi chất từng mẩu theo thứ tự (s sắt · g gỗ · S chữ S · N chữ N). Thùng (D) ngay dưới (hay trên) mẩu
     cần mang; phía đó của mẩu gỗ / mẩu N là tường, phía kia là sàn (xem đầu tệp). Mẩu chữ N đã nằm sẵn trên thùng của nó (ô X). */
  function logic(m) { m.chuong = 'logic-nam-cham'; m.vaHoac = true; return man(m); }
  var TRIP = nhieu(NHAT, ['go_down()'], DAT, ['go_up()']);
  var T_DOWN = TRIP, T_UP = nhieu(NHAT, ['go_up()'], DAT, ['go_down()']);
  function hDown(than) { return H('carry_down', [], than || T_DOWN); }
  function hUp(than) { return H('carry_up', [], than || T_UP); }
  var HOAC = 'if c == "s" or c == "S":', VA = 'if c != "g" and c != "N":';
  function FOR(chuoi, than) { return ['for c in ' + chuoi + ':'].concat(thut(than)); }
  var RE_NHANH = ['if c == "s":', '    carry_down()', 'elif c == "S":', '    carry_up()', 'go_right()'];
  var RE_VA = ['if c == "s":', '    carry_down()', 'elif c != "g" and c != "N":', '    carry_up()', 'go_right()'];

  DS.push(
    logic({
      so: 1, ten: 'Hoặc: sắt hay chữ S', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Hai mẩu phế liệu xếp hàng: mẩu sắt rồi mẩu chữ S, chuỗi "sS" ghi lại chất của chúng. Cực N hút được sắt (s) và cả mẩu chữ S (khác cực). Điều kiện ghép hai vế bằng or: chỉ cần MỘT vế đúng là làm. Bấm Chạy xem nhện duyệt chuỗi, mẩu nào là s HOẶC S thì hút rồi mang xuống thùng.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['oo', 'DD'], vatChat: ['sS', '..'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(FOR('"sS"', nhieu([HOAC], thut(TRIP), ['go_right()']))),
      loiGiai: bai(FOR('"sS"', nhieu([HOAC], thut(TRIP), ['go_right()']))),
      sao: { o: 9, nhip: 12 },
      goiY: ['or: một trong hai vế đúng là cả điều kiện đúng.', 'Mỗi chữ của chuỗi là một mẩu; sau mỗi mẩu nhện sang phải một ô.']
    }),

    logic({
      so: 2, ten: 'Gỗ xen giữa', hang: 'lam-quen',
      deBai: 'Ba mẩu: sắt, gỗ, chữ S, chuỗi "sgS". Gỗ thì bỏ qua (dưới mẩu gỗ là tường). Sửa điều kiện cho nhện hút cả mẩu sắt lẫn mẩu chữ S.',
      veMaMau: 'Chương trình có sẵn chỉ hỏi c == "s": mẩu chữ S bị bỏ sót. Ghép thêm một vế bằng or.',
      san: ['...', 'ooo', 'D#D'], vatChat: ['...', 'sgS', '...'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(FOR('"sgS"', nhieu(['if c == "s":'], thut(TRIP), ['go_right()']))),
      loiGiai: bai(FOR('"sgS"', nhieu([HOAC], thut(TRIP), ['go_right()']))),
      sao: { o: 9, nhip: 14 },
      loiSai: [
        { moTa: 'Chỉ hỏi c == "s": mẩu chữ S nằm lại', baiLam: bai(FOR('"sgS"', nhieu(['if c == "s":'], thut(TRIP), ['go_right()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ghép bằng and: một chữ không thể vừa là "s" vừa là "S", chẳng mẩu nào được hút', baiLam: bai(FOR('"sgS"', nhieu(['if c == "s" and c == "S":'], thut(TRIP), ['go_right()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không hỏi gì, mẩu nào cũng xuống: ở mẩu gỗ nhện đâm tường rồi đi lạc lên hàng trên', baiLam: bai(FOR('"sgS"', nhieu(TRIP, ['go_right()']))), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Hút khi c là "s" HOẶC c là "S": c == "s" or c == "S".', 'Chữ "g" không khớp vế nào nên nhện chỉ sang phải.']
    }),

    logic({
      so: 3, ten: 'Hàm carry_down()', hang: 'lam-quen', taoHam: ['carry_down'],
      deBai: 'Một chuyến xuống thùng là sáu dòng: hút, xuống, thả, lên. Tạo hàm carry_down() làm cả chuyến đó, rồi duyệt chuỗi "gsS": mẩu sắt hay chữ S thì carry_down().',
      veMaMau: 'Chương trình có sẵn gọi carry_down() nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: ['...', 'ooo', '#DD'], vatChat: ['...', 'gsS', '...'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(FOR('"gsS"', [HOAC, '    carry_down()', 'go_right()'])),
      loiGiai: bai(FOR('"gsS"', [HOAC, '    carry_down()', 'go_right()']), { hamCuaEmMoi: [hDown()] }),
      sao: { o: 10, nhip: 14 },
      loiSai: [
        { moTa: 'Chưa tạo hàm carry_down mà đã gọi nó', baiLam: bai(FOR('"gsS"', [HOAC, '    carry_down()', 'go_right()'])), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm quên lên lại: chuyến sau nhện đi ở hàng thùng', baiLam: bai(FOR('"gsS"', [HOAC, '    carry_down()', 'go_right()'])), hamCuaEmMoi: [hDown(nhieu(NHAT, ['go_down()'], DAT))], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm: magnet_n(), wait(), go_down(), magnet_off(), wait(), go_up().', 'Chương trình chính chỉ còn bốn dòng.']
    }),

    logic({
      so: 4, ten: 'Hàm carry_up()', hang: 'luyen', taoHam: ['carry_up'],
      deBai: 'Lần này thùng ở hàng TRÊN. Tạo hàm carry_up(): hút, lên, thả, xuống. Duyệt chuỗi "SgS": mẩu sắt hay chữ S thì carry_up().',
      veMaMau: 'Chương trình có sẵn gọi carry_up() nhưng bạn chưa có hàm đó. Bấm Hàm mới.',
      san: ['D#D', 'ooo', '...'], vatChat: ['...', 'SgS', '...'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(FOR('"SgS"', [HOAC, '    carry_up()', 'go_right()'])),
      loiGiai: bai(FOR('"SgS"', [HOAC, '    carry_up()', 'go_right()']), { hamCuaEmMoi: [hUp()] }),
      sao: { o: 10, nhip: 14 },
      loiSai: [
        { moTa: 'Chưa tạo hàm carry_up mà đã gọi nó', baiLam: bai(FOR('"SgS"', [HOAC, '    carry_up()', 'go_right()'])), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm quên xuống lại: nhện ở lại hàng thùng, mẩu sau không ai mang', baiLam: bai(FOR('"SgS"', [HOAC, '    carry_up()', 'go_right()'])), hamCuaEmMoi: [hUp(nhieu(NHAT, ['go_up()'], DAT))], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm như carry_down nhưng go_up() rồi go_down().', 'Hàm phải đưa nhện về đúng hàng mẩu phế liệu.']
    }),

    logic({
      so: 5, ten: 'Và: không gỗ, không N', hang: 'luyen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['carry_down'],
      deBai: 'Ba mẩu: sắt, chữ N, chữ S ("sNS"). Mẩu chữ N đã nằm sẵn trên thùng của nó: cùng cực, không nhấc được, dưới nó là tường. Điều kiện ghép bằng and: CẢ HAI vế đúng mới làm. c != "g" and c != "N" nghĩa là: không phải gỗ VÀ không phải N thì mới hút. Bấm Chạy.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['...', 'oXo', 'D#D'], vatChat: ['...', 'sNS', '...'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(FOR('"sNS"', [VA, '    carry_down()', 'go_right()'])),
      loiGiai: bai(FOR('"sNS"', [VA, '    carry_down()', 'go_right()'])),
      sao: { o: 10, nhip: 14 },
      goiY: ['and: cả hai vế phải đúng.', '!= nghĩa là KHÁC: c != "g" đúng khi c không phải chữ g.']
    }),

    logic({
      so: 6, ten: 'Chữ N đã xếp xong', hang: 'luyen', hamCuaEmCan: ['carry_down'],
      deBai: 'Bốn mẩu "sgNS": sắt, gỗ, chữ N (đã nằm trên thùng), chữ S. Dưới gỗ và dưới mẩu N là tường. Sửa điều kiện: không phải gỗ VÀ không phải N thì mới carry_down().',
      veMaMau: 'Chương trình có sẵn chỉ hỏi c != "g". Chạy thử: tới mẩu N nhện cố mang xuống, đâm tường rồi đi lạc. Ghép thêm một vế bằng and.',
      san: ['....', 'ooXo', 'D##D'], vatChat: ['....', 'sgNS', '....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(FOR('"sgNS"', ['if c != "g":', '    carry_down()', 'go_right()'])),
      loiGiai: bai(FOR('"sgNS"', [VA, '    carry_down()', 'go_right()'])),
      sao: { o: 10, nhip: 16 },
      loiSai: [
        { moTa: 'Chỉ hỏi c != "g": tới mẩu N nhện xuống nhầm, đâm tường rồi lạc lên hàng trên', baiLam: bai(FOR('"sgNS"', ['if c != "g":', '    carry_down()', 'go_right()'])), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Ghép bằng or: chữ nào cũng khác ít nhất một trong hai nên mẩu gỗ cũng bị mang xuống', baiLam: bai(FOR('"sgNS"', ['if c != "g" or c != "N":', '    carry_down()', 'go_right()'])), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Hút khi KHÔNG phải gỗ VÀ KHÔNG phải N: c != "g" and c != "N".', 'Mẩu N nằm sẵn trên thùng rồi: cứ bước qua.']
    }),

    logic({
      so: 7, ten: 'Biến giữ kho, lên hay xuống', hang: 'bien-the', hamCuaEmCan: ['carry_down', 'carry_up'],
      deBai: 'Kho "sSgs" ghi vào biến kho. Mẩu sắt có thùng ở hàng DƯỚI, mẩu chữ S có thùng ở hàng TRÊN. Dùng if / elif: c == "s" thì carry_down(), còn c == "S" thì carry_up().',
      veMaMau: 'Chương trình có sẵn cho cả hai nhánh đều carry_down(): mẩu chữ S bị mang xuống tường. Sửa nhánh elif.',
      san: ['.D..', 'oooo', 'D##D'], vatChat: ['....', 'sSgs', '....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['kho = "sSgs"'].concat(FOR('kho', ['if c == "s":', '    carry_down()', 'elif c == "S":', '    carry_down()', 'go_right()']))),
      loiGiai: bai(['kho = "sSgs"'].concat(FOR('kho', RE_NHANH))),
      sao: { o: 19, nhip: 22 },
      loiSai: [
        { moTa: 'Cả hai nhánh đều carry_down(): mẩu chữ S bị mang xuống tường, nhện đi lạc', baiLam: bai(['kho = "sSgs"'].concat(FOR('kho', ['if c == "s":', '    carry_down()', 'elif c == "S":', '    carry_down()', 'go_right()']))), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Biến kho viết thiếu chữ: kho = "sSg", mẩu sắt cuối nằm lại', baiLam: bai(['kho = "sSg"'].concat(FOR('kho', RE_NHANH))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['elif: nhánh thứ hai chỉ xét khi nhánh if sai.', 'for c in kho duyệt từng chữ trong biến kho.']
    }),

    logic({
      so: 8, ten: 'Sửa nhánh elif', hang: 'bien-the', hamCuaEmCan: ['carry_down', 'carry_up'],
      deBai: 'Kho "sgNSs": sắt xuống thùng dưới, chữ S lên thùng trên, gỗ và mẩu N (đã trên thùng) bỏ qua. Sola viết nhánh elif chỉ hỏi "không phải gỗ" nên mẩu N bị nhấc lên tường. Sửa nhánh đó bằng and.',
      veMaMau: 'Chạy thử: tới mẩu N nhện nhấc lên, đâm tường rồi đi lạc. Chạm điều kiện của elif, ghép thêm vế c != "N".',
      san: ['..#D.', 'ooXoo', 'D#.#D'], vatChat: ['.....', 'sgNSs', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['kho = "sgNSs"'].concat(FOR('kho', ['if c == "s":', '    carry_down()', 'elif c != "g":', '    carry_up()', 'go_right()']))),
      loiGiai: bai(['kho = "sgNSs"'].concat(FOR('kho', RE_VA))),
      sao: { o: 19, nhip: 24 },
      loiSai: [
        { moTa: 'elif chỉ hỏi c != "g": mẩu N bị nhấc lên tường, nhện đi lạc', baiLam: bai(['kho = "sgNSs"'].concat(FOR('kho', ['if c == "s":', '    carry_down()', 'elif c != "g":', '    carry_up()', 'go_right()']))), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Đổi thành elif c == "s": không mẩu chữ S nào được mang lên', baiLam: bai(['kho = "sgNSs"'].concat(FOR('kho', ['if c == "s":', '    carry_down()', 'elif c == "s":', '    carry_up()', 'go_right()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nhánh lên chỉ cho mẩu chữ S: không phải gỗ VÀ không phải N.', 'Có thể hỏi thẳng elif c == "S" cũng đúng.']
    }),

    logic({
      so: 9, ten: 'Hai dãy một kho', hang: 'bien-the', hamCuaEmCan: ['carry_down', 'carry_up', 'trail'],
      deBai: 'Hai dãy phế liệu giống hệt nhau, cùng chuỗi "sS": sắt xuống, chữ S lên. Làm dãy trên, đi theo trail("DDD") xuống dãy dưới, làm lại. Dùng vòng for lồng nhau.',
      veMaMau: 'Chương trình có sẵn làm xong dãy trên. Đặt vào vòng for i in range(2) và thêm đường xuống dãy dưới.',
      san: ['.D##', 'oo.#', 'D#.#', '##.D', '##oo', '##D#'], vatChat: ['....', 'sS..', '....', '....', '..sS', '....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['kho = "sS"'].concat(FOR('kho', RE_NHANH))),
      loiGiai: bai(['kho = "sS"', 'for i in range(2):'].concat(thut(FOR('kho', RE_NHANH)), ['    trail("DDD")'])),
      sao: { o: 31, nhip: 34 },
      loiSai: [
        { moTa: 'Quên trail: dãy dưới không ai làm', baiLam: bai(['kho = "sS"'].concat(FOR('kho', RE_NHANH))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'trail("DD"): dừng cách dãy dưới một ô, hút ở ô trống', baiLam: bai(['kho = "sS"', 'for i in range(2):'].concat(thut(FOR('kho', RE_NHANH)), ['    trail("DD")'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vòng ngoài hai lần: mỗi lần một dãy rồi trail xuống.', 'Sau dãy trên nhện đứng ngay trên cột của dãy dưới: xuống ba ô.']
    }),

    logic({
      so: 10, ten: 'Kho phân loại', hang: 'trum', khung: { chinh: 14, moiHam: 10 }, hamCuaEmCan: ['carry_down', 'carry_up', 'trail'],
      deBai: 'Trùm. Hai dãy, cùng kho "sNgS": sắt xuống thùng dưới; chữ S lên thùng trên; gỗ và mẩu N (đã trên thùng) bỏ qua. Làm dãy trên, trail("DDDLLLL") về đầu dãy dưới, làm lại. Nhánh lên dùng and.',
      veMaMau: 'Chương trình có sẵn làm được dãy trên. Đặt vào vòng for và thêm đường về dãy dưới.',
      san: ['.#.D.', 'oXoo.', 'D.##.', '.#.D.', 'oXoo.', 'D.###'], vatChat: ['.....', 'sNgS.', '.....', '.....', 'sNgS.', '.....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['kho = "sNgS"'].concat(FOR('kho', RE_VA))),
      loiGiai: bai(['kho = "sNgS"', 'for i in range(2):'].concat(thut(FOR('kho', RE_VA)), ['    trail("DDDLLLL")'])),
      sao: { o: 31, nhip: 50 },
      loiSai: [
        { moTa: 'Nhánh elif chỉ hỏi c != "g": mẩu N bị nhấc lên tường, nhện đi lạc', baiLam: bai(['kho = "sNgS"', 'for i in range(2):'].concat(thut(FOR('kho', ['if c == "s":', '    carry_down()', 'elif c != "g":', '    carry_up()', 'go_right()'])), ['    trail("DDDLLLL")'])), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Về dãy dưới thiếu một chữ L: dãy dưới làm lệch một ô', baiLam: bai(['kho = "sNgS"', 'for i in range(2):'].concat(thut(FOR('kho', RE_VA)), ['    trail("DDDLLL")'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hai dãy y hệt: vòng ngoài hai lần, cuối mỗi lần về đầu dãy dưới.', 'Lên chỉ khi không gỗ VÀ không N; xuống khi là sắt.']
    })
  );

  ManHoc.manNamChamN = DS;
  if (laNode) module.exports = ManHoc;
})();
