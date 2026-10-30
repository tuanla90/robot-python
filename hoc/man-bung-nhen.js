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

  /* ================================================= chương che-bung-nhen "Hàm cho bụng nhện" =================================================
     Hàm của em mới: hook() (magnet_n, wait: hút sắt dưới bụng) · unhook() (magnet_off, wait) · tote(path) (hook, trail(path), unhook: chở vật theo chuỗi) ·
     hook_for(p) (p là chữ trên vật: "N" thì bật cực S, không thì cực N). */
  function che(m) { m.chuong = 'che-bung-nhen'; return man(m); }
  var T_HOOK = ['magnet_n()', 'wait()'], T_UNHOOK = ['magnet_off()', 'wait()'];
  var T_TOTE = ['hook()', 'trail(path)', 'unhook()'];
  var T_HOOK_FOR = ['if p == \"N\":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'];

  DS.push(
    che({
      so: 1, ten: 'Hàm nhấc vật', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['lift'],
      deBai: 'Hàm lift() của màn bật nam châm bụng để nhấc vật sắt ở ô dưới nhện. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Bấm Chạy.',
      san: ['.o.D'], vatChat: ['.s..'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(['go_right()', 'lift()', 'go_right()', 'go_right()'], DAT), { hamCuaMan: [H('lift', [], T_HOOK)] }),
      loiGiai: bai(nhieu(['go_right()', 'lift()', 'go_right()', 'go_right()'], DAT), { hamCuaMan: [H('lift', [], T_HOOK)] }),
      sao: { o: 8, nhip: 8 },
      goiY: ['Mở Xưởng xem thân lift().', 'Màn sau em tự tạo hàm như thế.']
    }),

    che({
      so: 2, ten: 'Hàm hook()', hang: 'lam-quen', taoHam: ['hook'],
      deBai: 'Tạo hàm hook(): bật nam châm bụng hút vật sắt (magnet_n(), wait()). Rồi mang vật xuống ô đích và thả.',
      veMaMau: 'Chương trình có sẵn gọi hook() nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['..o', '...', '..D'], vatChat: ['..s', '...', '...'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(LAP(2, 'go_right()'), ['hook()'], LAP(2, 'go_down()'), DAT)),
      loiGiai: bai(nhieu(LAP(2, 'go_right()'), ['hook()'], LAP(2, 'go_down()'), DAT), { hamCuaEmMoi: [H('hook', [], T_HOOK)] }),
      sao: { o: 9, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa tạo hàm hook mà đã gọi nó', baiLam: bai(nhieu(LAP(2, 'go_right()'), ['hook()'], LAP(2, 'go_down()'), DAT)), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thân hàm hai dòng: magnet_n() rồi wait().', 'Gọi hook() khi đang đứng trên vật.']
    }),

    che({
      so: 3, ten: 'Hàm unhook()', hang: 'lam-quen', taoHam: ['unhook'], hamCuaEmCan: ['hook'],
      deBai: 'Tạo hàm unhook(): ngắt nam châm để thả vật (magnet_off(), wait()). Mang vật sắt sang phải tới ô đích.',
      veMaMau: 'Chương trình có sẵn gọi unhook(). Tạo hàm đó.',
      san: ['o...D'], vatChat: ['s....'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(nhieu(['hook()'], LAP(4, 'go_right()'), ['unhook()'])),
      loiGiai: bai(nhieu(['hook()'], LAP(4, 'go_right()'), ['unhook()']), { hamCuaEmMoi: [H('unhook', [], T_UNHOOK)] }),
      sao: { o: 8, nhip: 10 },
      loiSai: [
        { moTa: 'Trong hàm quên wait(): lệnh ngắt chưa kịp chạy', baiLam: bai(nhieu(['hook()'], LAP(4, 'go_right()'), ['unhook()'])), hamCuaEmMoi: [H('unhook', [], ['magnet_off()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm: magnet_off() rồi wait().', 'hook() và unhook() là một cặp.']
    }),

    che({
      so: 4, ten: 'Hai chuyến bằng hàm', hang: 'luyen', hamCuaEmCan: ['hook', 'unhook'],
      deBai: 'Hai vật sắt ở hàng trên, hai ô đích ngay bên dưới. Dùng hook() và unhook() trong vòng for.',
      veMaMau: 'Chương trình có sẵn làm một chuyến. Đặt vào vòng for.',
      san: ['o.o', 'D.D'], vatChat: ['s.s', '...'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['hook()', 'go_down()', 'unhook()']),
      loiGiai: bai(LAP(2, ['hook()', 'go_down()', 'unhook()', 'go_up()', 'go_right()', 'go_right()'])),
      sao: { o: 11, nhip: 14 },
      loiSai: [
        { moTa: 'Quên lên lại: chuyến hai nhện đi ở hàng dưới', baiLam: bai(LAP(2, ['hook()', 'go_down()', 'unhook()', 'go_right()', 'go_right()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Một chuyến: hook, xuống, unhook, lên, sang hai ô.', 'Lặp hai lần.']
    }),

    che({
      so: 5, ten: 'Hàm tote(path)', hang: 'luyen', taoHam: ['tote'], hamCuaEmCan: ['hook', 'unhook', 'trail', 'go'],
      deBai: 'Tạo hàm tote(path): hook(), đi theo chuỗi path bằng trail(path), rồi unhook(). Chở vật sắt theo đường quanh co tới ô đích.',
      veMaMau: 'Chương trình có sẵn gọi tote(\"RRDDRRD\"). Tạo hàm tote có đối số path.',
      san: ['o..##', '##.##', '##...', '####D'], vatChat: ['s....', '.....', '.....', '.....'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['tote(\"RRDDRRD\")']),
      loiGiai: bai(['tote(\"RRDDRRD\")'], { hamCuaEmMoi: [H('tote', ['path'], T_TOTE)] }),
      sao: { o: 18, nhip: 16 },
      loiSai: [
        { moTa: 'Trong hàm quên hook(): nhện đi một mình', baiLam: bai(['tote(\"RRDDRRD\")']), hamCuaEmMoi: [H('tote', ['path'], ['trail(path)', 'unhook()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm ba dòng: hook(), trail(path), unhook().', 'path là chuỗi chỉ đường được truyền vào.']
    }),

    che({
      so: 6, ten: 'Hai đơn hàng', hang: 'luyen', hamCuaEmCan: ['tote', 'trail', 'go'],
      deBai: 'Hai vật sắt, hai ô đích, đường khác nhau. Chở vật đầu bằng tote(...), đi tới vật thứ hai, rồi chở nó bằng tote(...) với chuỗi khác.',
      veMaMau: 'Chương trình có sẵn chở được vật đầu. Viết tiếp.',
      san: ['o.D', '...', 'o.D'], vatChat: ['s..', '...', 's..'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['tote(\"RR\")']),
      loiGiai: bai(['tote(\"RR\")', 'trail(\"DDLL\")', 'tote(\"RR\")']),
      sao: { o: 20, nhip: 20 },
      loiSai: [
        { moTa: 'Chở vật thứ hai mà chưa đi tới nó', baiLam: bai(['tote(\"RR\")', 'tote(\"DD\")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Giữa hai chuyến: trail(...) đi tới vật thứ hai.', 'Mỗi chuyến một chuỗi riêng.']
    }),

    che({
      so: 7, ten: 'Hàm hook_for(p)', hang: 'bien-the', taoHam: ['hook_for'], hamCuaEmCan: ['unhook'],
      deBai: 'Tạo hàm hook_for(p): p là chữ trên vật; \"N\" thì bật cực S, không thì bật cực N, rồi wait(). Mang vật chữ N và vật chữ S về hai ô đích.',
      veMaMau: 'Chương trình có sẵn gọi hook_for(\"N\") và hook_for(\"S\"). Tạo hàm đó.',
      san: ['oo', 'DD'], vatChat: ['NS', '..'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['hook_for(\"N\")', 'go_down()', 'unhook()', 'go_up()', 'go_right()', 'hook_for(\"S\")', 'go_down()', 'unhook()']),
      loiGiai: bai(['hook_for(\"N\")', 'go_down()', 'unhook()', 'go_up()', 'go_right()', 'hook_for(\"S\")', 'go_down()', 'unhook()'], { hamCuaEmMoi: [H('hook_for', ['p'], T_HOOK_FOR)] }),
      sao: { o: 15, nhip: 12 },
      loiSai: [
        { moTa: 'Trong hàm bật cùng cực với chữ: vật nằm yên', baiLam: bai(['hook_for(\"N\")', 'go_down()', 'unhook()', 'go_up()', 'go_right()', 'hook_for(\"S\")', 'go_down()', 'unhook()']), hamCuaEmMoi: [H('hook_for', ['p'], ['if p == \"N\":', '    magnet_n()', 'else:', '    magnet_s()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Khác cực mới hút: chữ N thì cực S.', 'p là chuỗi \"N\" hay \"S\" truyền vào lúc gọi.']
    }),

    che({
      so: 8, ten: 'Đơn hàng qua gầm và hố', hang: 'bien-the', hamCuaEmCan: ['hook', 'unhook'],
      deBai: 'Vật sắt phải chui qua một gầm thấp rồi qua một cái hố tới ô đích. trail() không nhảy được, nên giữa hai hàm của em phải viết phần co chân, duỗi chân bằng crouch() / stand().',
      veMaMau: 'Chương trình có sẵn đã nhặt vật. Viết tiếp.',
      san: ['#########', 'o.n.u.D..', '#########'], vatChat: ['.........', 's........', '.........'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(['hook()']),
      loiGiai: bai(['hook()', 'crouch()', 'go_right()', 'go_right()', 'go_right()', 'stand()', 'go_right()', 'go_right()', 'unhook()']),
      sao: { o: 13, nhip: 12 },
      loiSai: [
        { moTa: 'Không co chân: nhện mang vật đụng gầm', baiLam: bai(['hook()', 'go_right()', 'go_right()', 'go_right()', 'stand()', 'go_right()', 'go_right()', 'unhook()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Co chân từ đầu để chui gầm; đứng sát mép hố thì duỗi chân rồi bước.', 'Vật dính bay theo khi nhảy.']
    }),

    che({
      // 30/10 nghiệm thu độc lập: thay màn Sửa đường chở (lời giải trùng hệt che-bung-nhen.6) bằng màn nối chuỗi làm dữ liệu của gói 1: duyệt chuỗi cực "NS".
      so: 9, ten: 'Chuỗi cực hai đơn', hang: 'bien-the', hamCuaEmCan: ['hook_for', 'trail', 'unhook'],
      deBai: 'Hai vật nam châm xếp dọc: trên là chữ N, dưới là chữ S. Việc của hai vật y hệt nhau, chỉ khác chữ: duyệt for p in "NS", mỗi lượt hook_for(p), trail("RR") sang ô đích, unhook(), rồi trail("DDLL") về đầu hàng dưới.',
      veMaMau: 'Chương trình có sẵn chở xong vật chữ N. Gói lại thành một vòng for trên chuỗi "NS".',
      san: ['o.D', '...', 'o.D', '...', '...'], vatChat: ['N..', '...', 'S..', '...', '...'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['hook_for("N")', 'trail("RR")', 'unhook()']),
      loiGiai: bai(['for p in "NS":', '    hook_for(p)', '    trail("RR")', '    unhook()', '    trail("DDLL")']),
      sao: { o: 22, nhip: 20 },
      loiSai: [
        { moTa: 'Chuỗi viết ngược "SN": vật chữ N gặp cực N, nằm yên', baiLam: bai(['for p in "SN":', '    hook_for(p)', '    trail("RR")', '    unhook()', '    trail("DDLL")']), phaiCoMa: ['cung-cuc'] }
      ],
      goiY: ['for p in "NS" cho p lần lượt là "N" rồi "S".', 'Cuối mỗi lượt về đầu hàng dưới: xuống hai, sang trái hai.']
    }),

    che({
      so: 10, ten: 'Xưởng bụng nhện', hang: 'trum', khung: { chinh: 14, moiHam: 10 }, hamCuaEmCan: ['tote', 'trail', 'go', 'hook_for', 'unhook', 'hook'],
      deBai: 'Ba đơn hàng: một vật sắt, một vật chữ N, một vật chữ S, mỗi vật một ô đích. Dùng tote() cho sắt, hook_for() cho vật nam châm, trail() để đi giữa các đơn.',
      veMaMau: 'Chương trình có sẵn mới chở vật sắt.',
      san: ['o..D', '....', 'o..D', '....', 'o..D'], vatChat: ['s...', '....', 'N...', '....', 'S...'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['tote(\"RRR\")']),
      loiGiai: bai(['tote(\"RRR\")', 'trail(\"DDLLL\")', 'hook_for(\"N\")', 'trail(\"RRR\")', 'unhook()', 'trail(\"DDLLL\")', 'hook_for(\"S\")', 'trail(\"RRR\")', 'unhook()']),
      sao: { o: 31, nhip: 44 },
      loiSai: [
        { moTa: 'Chở vật N bằng tote(): hook() bật cực N, cùng cực nên vật nằm yên', baiLam: bai(['tote(\"RRR\")', 'trail(\"DDLLL\")', 'tote(\"RRR\")', 'trail(\"DDLLL\")', 'hook_for(\"S\")', 'trail(\"RRR\")', 'unhook()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['tote() dùng hook() (cực N): chỉ hợp với sắt và vật chữ S.', 'Vật chữ N: hook_for(\"N\") rồi trail, unhook.']
    })
  );

  ManHoc.manBungNhen = DS;
  if (laNode) module.exports = ManHoc;
})();
