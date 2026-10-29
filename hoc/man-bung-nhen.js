/* ============================================================================
   man-bung-nhen.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 9 "Nam châm bụng nhện" (KE-HOACH-MUA-3.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `bung-nhen`: chương 1 "Nam châm bụng nhện" (chưa có màn)
     - `che-bung-nhen`: chương 2 "Hàm cho bụng nhện" (chưa có màn)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manBungNhen, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // 30/10 phiên Mùa 3. Gói 9 "Nam châm bụng nhện" (gói Combo: ôn nhện, chuỗi, nhảy, băng chuyền, cực nam châm). Luật nam châm bụng: san-hoc.js phần NAM CHÂM,
  // mục "NAM CHÂM BỤNG NHỆN": hút / thả ở ô NGAY DƯỚI nhện; nhện đứng trùm lên vật được; vật dính đi theo khi bước, nhảy, bị băng dời; sắt cực nào cũng hút,
  // vật nam châm khác cực thì hút, cùng cực nằm yên. Lệnh nam châm làm ở nhịp wait() hay nhịp đầu của bước kế tiếp.
  var HG = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  var NHAT = ['magnet_n()', 'wait()'], DAT = ['magnet_off()', 'wait()'];
  function man(m) {
    m.chuong = m.chuong || 'bung-nhen'; m.cauTruc = ['for', 'if', 'while']; m.vaHoac = true;
    m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [] };
    m.hamGoc = HG; m.mucTieu = 'dua-vat'; m.vatCan = m.vatCan || 'tu';
    m.nhipTheoLoiGiai = true; m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 }; m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương bung-nhen "Nam châm bụng nhện" ================================================= */
    man({
      so: 1, ten: 'Nhện nhặt sắt', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Nhện gắn nam châm dưới bụng: nhện bước lên trùm qua vật được, magnet_n() hút vật sắt ở ô NGAY DƯỚI bụng, magnet_off() thả nó xuống ô đang đứng. Bấm Chạy xem nhện nhặt vật sắt rồi mang tới ô đích.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['.o.D'], vatChat: ['.s..'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(['go_right()'], NHAT, ['go_right()', 'go_right()'], DAT)),
      loiGiai: bai(nhieu(['go_right()'], NHAT, ['go_right()', 'go_right()'], DAT)),
      sao: { o: 7, nhip: 8 },
      goiY: ['Đứng ngay trên vật rồi mới hút.', 'Vật dính dưới bụng đi theo nhện.']
    }),

    man({
      so: 2, ten: 'Mang xuống dưới', hang: 'lam-quen',
      deBai: 'Vật sắt nằm cách nhện hai ô bên phải, ô đích ở phía dưới vật hai ô. Đi tới đứng trên vật, hút nó lên, mang xuống ô đích rồi thả.',
      veMaMau: 'Chương trình có sẵn đã tới chỗ vật. Viết tiếp.',
      san: ['..o', '...', '..D'], vatChat: ['..s', '...', '...'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(LAP(2, 'go_right()')),
      loiGiai: bai(nhieu(LAP(2, 'go_right()'), NHAT, LAP(2, 'go_down()'), DAT)),
      sao: { o: 8, nhip: 10 },
      loiSai: [
        { moTa: 'Quên hút: nhện đi xuống một mình, vật nằm lại', baiLam: bai(nhieu(LAP(2, 'go_right()'), LAP(2, 'go_down()'), DAT)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên thả: vật còn dính dưới bụng', baiLam: bai(nhieu(LAP(2, 'go_right()'), NHAT, LAP(2, 'go_down()'))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đứng trên vật, magnet_n() rồi wait().', 'Tới ô đích thì magnet_off() rồi wait().']
    }),

    man({
      so: 3, ten: 'Mang sắt qua hố', hang: 'lam-quen',
      deBai: 'Giữa vật sắt và ô đích có một cái hố. Nhện mang vật vẫn nhảy được: co chân, duỗi chân ngay trước bước để bật qua hố, vật dính theo.',
      veMaMau: 'Chương trình có sẵn đã nhặt được vật. Viết tiếp.',
      san: ['#######', '.o.u.D.', '#######'], vatChat: ['.......', '.s.....', '.......'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(nhieu(['go_right()'], NHAT)),
      loiGiai: bai(nhieu(['go_right()'], NHAT, ['crouch()', 'go_right()', 'stand()', 'go_right()', 'go_right()'], DAT)),
      sao: { o: 10, nhip: 10 },
      loiSai: [
        { moTa: 'Không nhảy: nhện mang vật bước xuống hố', baiLam: bai(nhieu(['go_right()'], NHAT, LAP(3, 'go_right()'), DAT)), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Co chân khi bước tới mép hố, duỗi chân ngay trước bước kế tiếp.', 'Vật dính dưới bụng bay theo nhện.']
    }),

    man({
      so: 4, ten: 'Vật chữ N', hang: 'luyen',
      deBai: 'Vật nam châm chữ N nằm trên đường. Cùng cực thì nam châm bụng không hút được (vật nằm yên); bật cực khác để hút. Mang vật xuống ô đích.',
      veMaMau: 'Chương trình có sẵn bật cực N. Chạy thử rồi sửa.',
      san: ['.o..', '....', '...D'], vatChat: ['.N..', '....', '....'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(['go_right()'], NHAT, ['go_right()', 'go_right()', 'go_down()', 'go_down()'], DAT)),
      loiGiai: bai(nhieu(['go_right()', 'magnet_s()', 'wait()', 'go_right()', 'go_right()', 'go_down()', 'go_down()'], DAT)),
      sao: { o: 9, nhip: 12 },
      loiSai: [
        { moTa: 'Bật cực N: cùng cực nên vật nằm yên', baiLam: bai(nhieu(['go_right()'], NHAT, ['go_right()', 'go_right()', 'go_down()', 'go_down()'], DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật chữ N: bật cực S.', 'Sắt thì cực nào cũng hút.']
    }),

    man({
      so: 5, ten: 'Hai vật một hàng', hang: 'luyen',
      deBai: 'Hai vật sắt nằm ở hàng trên, hai ô đích ngay bên dưới mỗi vật. Mỗi chuyến: hút vật, xuống một ô, thả, lên lại, sang phải hai ô. Dùng vòng for.',
      veMaMau: 'Chương trình có sẵn làm một chuyến. Đặt vào vòng for.',
      san: ['o.o', 'D.D'], vatChat: ['s.s', '...'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(NHAT, ['go_down()'], DAT)),
      loiGiai: bai(LAP(2, nhieu(NHAT, ['go_down()'], DAT, ['go_up()', 'go_right()', 'go_right()']))),
      sao: { o: 9, nhip: 14 },
      loiSai: [
        { moTa: 'Sang phải một ô mỗi chuyến: nhện hút nhầm ô trống', baiLam: bai(LAP(2, nhieu(NHAT, ['go_down()'], DAT, ['go_up()', 'go_right()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Một chuyến: hút, xuống, thả, lên, sang hai ô.', 'Lặp hai lần.']
    }),

    man({
      so: 6, ten: 'Đường chuỗi mang vật', hang: 'luyen', hamCuaEmCan: ['go', 'trail'],
      deBai: 'Đường từ vật sắt tới ô đích quanh co. Hút vật lên rồi đi theo chuỗi chỉ đường bằng hàm trail(path) của em, tới ô đích thì thả.',
      veMaMau: 'Chương trình có sẵn đã hút vật. Viết tiếp bằng trail.',
      san: ['o..##', '##.##', '##...', '####D'], vatChat: ['s....', '.....', '.....', '.....'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(NHAT),
      loiGiai: bai(nhieu(NHAT, ['trail(\"RRDDRRD\")'], DAT)),
      sao: { o: 15, nhip: 16 },
      loiSai: [
        { moTa: 'Chuỗi thiếu chữ D cuối: nhện dừng trên ô đích còn một ô', baiLam: bai(nhieu(NHAT, ['trail(\"RRDDRR\")'], DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mỗi chữ là một bước: R phải, D xuống.', 'trail(path) đi hết chuỗi.']
    }),

    man({
      so: 7, ten: 'Băng chuyền chở hàng', hang: 'bien-the',
      deBai: 'Vật sắt nằm đầu băng chuyền. Nhện đứng trên vật, hút nó, rồi đứng chờ: băng chở cả nhện lẫn vật tới cuối băng. Xuống ô đích rồi thả.',
      veMaMau: 'Chương trình có sẵn đã hút vật. Viết tiếp.',
      san: ['o>>>.', '....D'], vatChat: ['s....', '.....'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(NHAT),
      loiGiai: bai(nhieu(NHAT, LAP(4, 'go_right()'), ['go_down()'], DAT)),
      sao: { o: 7, nhip: 12 },
      loiSai: [
        { moTa: 'Quên hút: băng chở nhện đi, vật sắt nằm lại đầu băng', baiLam: bai(nhieu(LAP(4, 'go_right()'), ['go_down()'], DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Trên băng xuôi chiều mỗi bước đi được hai ô.', 'Tới ô cuối băng thì xuống.']
    }),

    man({
      so: 8, ten: 'Sắt và vật chữ S', hang: 'bien-the', khung: { chinh: 16, moiHam: 10 },
      deBai: 'Một vật sắt và một vật chữ S nằm cạnh nhau, mỗi vật một ô đích ngay bên dưới. Vật S chỉ hút được bằng cực N; sắt thì cực nào cũng được. Mang từng vật về ô đích của nó.',
      veMaMau: 'Chương trình có sẵn đã mang vật sắt. Viết tiếp vật S.',
      san: ['oo', 'DD'], vatChat: ['sS', '..'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(NHAT, ['go_down()'], DAT)),
      loiGiai: bai(nhieu(NHAT, ['go_down()'], DAT, ['go_up()', 'go_right()'], NHAT, ['go_down()'], DAT)),
      sao: { o: 12, nhip: 12 },
      loiSai: [
        { moTa: 'Hút vật S bằng cực S: cùng cực nên vật nằm yên', baiLam: bai(nhieu(NHAT, ['go_down()'], DAT, ['go_up()', 'go_right()'], ['magnet_s()', 'wait()'], ['go_down()'], DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật chữ S thì bật cực N.', 'Làm từng vật một.']
    }),

    man({
      so: 9, ten: 'Gầm và hố mang hàng', hang: 'bien-the',
      deBai: 'Nhện mang vật sắt phải chui qua một gầm thấp rồi nhảy qua một cái hố. Co chân để chui, duỗi chân đúng lúc để nhảy.',
      veMaMau: 'Chương trình có sẵn đã hút vật. Viết tiếp.',
      san: ['#########', 'o..n.u.D.', '#########'], vatChat: ['.........', 's........', '.........'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(NHAT),
      loiGiai: bai(nhieu(NHAT, ['crouch()'], LAP(4, 'go_right()'), ['stand()', 'go_right()', 'go_right()'], DAT)),
      sao: { o: 10, nhip: 14 },
      loiSai: [
        { moTa: 'Không co chân: nhện mang vật đụng gầm', baiLam: bai(nhieu(NHAT, LAP(4, 'go_right()'), ['stand()', 'go_right()', 'go_right()'], DAT)), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Co chân ngay từ đầu, chân co vẫn đi được.', 'Đứng sát mép hố thì stand() rồi bước.']
    }),

    man({
      so: 10, ten: 'Kho bụng nhện', hang: 'trum', khung: { chinh: 18, moiHam: 10 }, hamCuaEmCan: ['go', 'trail'],
      deBai: 'Kho có một vật sắt và một vật chữ N. Vật sắt phải qua hố tới ô đích bên phải; vật N đi theo đường quanh co xuống ô đích dưới cùng. Chọn cực cho đúng, nhảy khi cần, dùng trail cho đường quanh co.',
      veMaMau: 'Chương trình có sẵn mới nhặt vật sắt.',
      san: ['o.u.D', '.....', 'o##..', '.#...', '...#D'], vatChat: ['s....', '.....', 'N....', '.....', '.....'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(NHAT),
      loiGiai: bai(nhieu(NHAT, ['crouch()', 'go_right()', 'stand()', 'go_right()', 'go_right()'], DAT, ['trail(\"DLLLLD\")', 'magnet_s()', 'wait()', 'trail(\"DDRRURRD\")'], DAT)),
      sao: { o: 25, nhip: 38 },
      loiSai: [
        { moTa: 'Hút vật N bằng cực N: vật nằm yên', baiLam: bai(nhieu(NHAT, ['crouch()', 'go_right()', 'stand()', 'go_right()', 'go_right()'], DAT, ['trail(\"DLLLLD\")', 'magnet_n()', 'wait()', 'trail(\"DDRRURRD\")'], DAT)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sắt: cực nào cũng hút. Vật N: cực S.', 'Đường quanh co: viết thành chuỗi rồi gọi trail.']
    })
  ];

  ManHoc.manBungNhen = DS;
  if (laNode) module.exports = ManHoc;
})();
