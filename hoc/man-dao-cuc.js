/* ============================================================================
   man-dao-cuc.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 6 "Đảo cực" (KE-HOACH-MUA-3.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 3 (lo-trinh-hoc.js, khối "MÙA 3 = 10 GÓI", mảng MUA_3) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `dao-cuc`: chương 1 "Đảo cực" magnet_s (2 màn có sẵn: nam-cham.3, .2)
     - `che-dao-cuc`: chương 2 "Hàm đảo cực" (1 màn có sẵn: che-nam-cham.6)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước
   màn trùm có sẵn nếu màn cuối có sẵn là trùm); muốn xen giữa thì sửa đúng dòng chương đó trong MUA_3. Chương còn trống thì chưa hiện.
   Ràng buộc mùa 3 (hoc/kiem-lo-trinh.mjs mục mùa 3): thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ;
   không omni, drone, camera, máy sơn, máy ném, color(); không bậc thang S. Chuỗi làm dữ liệu chỉ từ gói 1 chương 2, and / or chỉ từ gói 2 chương 2;
   magnet_s từ gói 6, front_metal từ gói 3, front_pole từ gói 7, crouch / stand / jump / leap từ gói 5; hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDaoCuc, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // 29/10 phiên Mùa 3. Gói 6 "Đảo cực": cái mới là magnet_s() (cực S). Khác cực thì hút (vật nam châm hút tới 3 ô), cùng cực thì đẩy (trượt tối đa 3 ô,
  // dừng trước vật cản); sắt bị cả hai cực hút; đang dính vật nam châm mà đổi sang cùng cực thì vật bị bắn ra (luật: man-nam-cham.js đầu tệp).
  // Chương dao-cuc (thứ tự MUA_3): 1 (trình diễn) · 2 · nam-cham.3 · 3 · nam-cham.2 · 4 · 5 · 6 · 7 · 8 (trùm).
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var GOC = BANH.concat(['magnet_n', 'magnet_s', 'magnet_off', 'front_clear', 'left_clear', 'right_clear', 'front_metal']);
  var HN = ['magnet_n()', 'wait()'], HS = ['magnet_s()', 'wait()'], THA = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function LAP(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function man(m) {
    m.chuong = m.chuong || 'dao-cuc'; m.cauTruc = ['for', 'if', 'while']; m.vaHoac = true;
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'tu', o: 'hong' }] };
    m.hamGoc = m.hamGoc || GOC;
    m.mucTieu = m.mucTieu || 'dua-vat'; if (m.mucTieu === 'dua-vat') m.vatCan = m.vatCan || 'tu';
    m.nhipTheoLoiGiai = true; m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 }; m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || ['move', 'turn_right', 'turn_left', 'u_turn'];
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    man({
      so: 1, ten: 'Hai cực của nam châm', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'magnet_s() bật cực S. Chữ trên vật nam châm là cực quay về phía xe: KHÁC cực thì hút, CÙNG cực thì đẩy. Bấm Chạy: cực S hút vật chữ N về rồi thả, sau đó đẩy vật chữ S trượt vào ô đích.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy.',
      san: ['..o..', '..D..', '...oD'], vatChat: ['..N..', '.....', '...S.'],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(nhieu(HS, THA, ['turn_right()'], HS)),
      loiGiai: bai(nhieu(HS, THA, ['turn_right()'], HS)),
      sao: { o: 9, nhip: 4 },
      goiY: ['N và S khác nhau thì hút; giống nhau thì đẩy.', 'Vật sắt thì cực nào cũng hút.']
    }),

    man({
      so: 2, ten: 'Kéo vật chữ N', hang: 'lam-quen',
      deBai: 'Vật nam châm chữ N cách xe 3 ô (vật nam châm hút được xa hơn sắt). Bật cực khác chữ N để kéo nó về, chở tới ô đích rồi thả.',
      veMaMau: 'Chương trình có sẵn bật cực N: cùng cực nên vật bị đẩy đi. Chạy thử rồi sửa.',
      san: ['......', '...oD.', '......'], vatChat: ['......', '...N..', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(HN, LAP(3, 'move()'), THA)),
      loiGiai: bai(nhieu(HS, LAP(3, 'move()'), THA)),
      sao: { o: 9, nhip: 5 },
      loiSai: [
        { moTa: 'Bật cực N: cùng cực với vật nên vật bị đẩy ra xa', baiLam: bai(nhieu(HN, LAP(3, 'move()'), THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật ghi chữ N thì bật cực S.', 'Kéo về rồi tiến ba ô, ô đích ngay trước mũi xe.']
    }),

    man({
      so: 3, ten: 'Kéo vật chữ S', hang: 'luyen',
      deBai: 'Vật nam châm chữ S cách xe 3 ô phía trước, ô đích ở bên phải xe. Kéo vật về bằng cực khác chữ S, rẽ phải rồi thả.',
      veMaMau: 'Chương trình có sẵn bật cực S. Chạy thử rồi sửa.',
      san: ['.....', '..o..', '.....', '.....', '...D.'], vatChat: ['.....', '..S..', '.....', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(nhieu(HS, ['turn_right()'], THA)),
      loiGiai: bai(nhieu(HN, ['turn_right()'], THA)),
      sao: { o: 7, nhip: 3 },
      loiSai: [
        { moTa: 'Bật cực S: cùng cực nên vật bị đẩy ra xa', baiLam: bai(nhieu(HS, ['turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật chữ S thì bật cực N để hút.', 'Vật dính ở mũi xe đi theo khi xe rẽ.']
    }),

    man({
      so: 4, ten: 'Đẩy vật chữ S', hang: 'luyen',
      deBai: 'Vật chữ S nằm cạnh lối, ô đích ở sát bức tường phía xa. Đứng ngay bên trái vật, quay mặt về phía nó rồi bật cực trùng chữ S: vật trượt thẳng, dừng sát tường đúng ô đích.',
      veMaMau: 'Chương trình có sẵn đã tới đúng chỗ. Viết tiếp.',
      san: ['......', '......', '.o.D#.', '......', '......'], vatChat: ['......', '......', '.S....', '......', '......'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(['move()', 'move()', 'turn_right()']),
      loiGiai: bai(nhieu(['move()', 'move()', 'turn_right()'], HS)),
      sao: { o: 10, nhip: 4 },
      loiSai: [
        { moTa: 'Bật cực N: khác cực nên vật bị hút về mũi xe', baiLam: bai(nhieu(['move()', 'move()', 'turn_right()'], HN)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Cùng chữ thì đẩy: vật S, cực S.', 'Vật trượt tới khi gặp vật cản rồi dừng.']
    }),

    man({
      so: 5, ten: 'Một cực, hai việc', hang: 'luyen',
      deBai: 'Trước mặt xe có hai vật nam châm xếp hàng: gần là vật chữ N, xa là vật chữ S. Chỉ dùng cực S: kéo vật N về, rẽ phải thả xuống ô đích; quay lại rồi đẩy vật S trượt vào ô đích sát tường.',
      veMaMau: 'Chương trình có sẵn đã kéo và thả vật N. Viết tiếp phần đẩy vật S.',
      san: ['.......', '.......', '..oo.D#', 'D......'], vatChat: ['.......', '.......', '..NS...', '.......'],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(nhieu(HS, ['turn_right()'], THA)),
      loiGiai: bai(nhieu(HS, ['turn_right()'], THA, ['turn_left()'], HS)),
      sao: { o: 12, nhip: 5 },
      loiSai: [
        { moTa: 'Đổi sang cực N để đẩy: khác chữ S nên vật S bị hút về', baiLam: bai(nhieu(HS, ['turn_right()'], THA, ['turn_left()'], HN)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Cực S hút vật N (khác cực) và đẩy vật S (cùng cực).', 'Thả xong rẽ trái để mũi xe quay lại hàng vật.']
    }),

    man({
      so: 6, ten: 'Đổi cực giữa chừng', hang: 'bien-the',
      deBai: 'Hai vật nam châm đều ghi chữ N. Vật gần phải về ô đích bên phải xe, vật xa phải trượt vào ô đích sát tường. Kéo thì dùng cực khác, đẩy thì dùng cực trùng: phải đổi cực giữa chừng.',
      veMaMau: 'Chương trình có sẵn đã kéo và thả vật đầu. Viết tiếp.',
      san: ['.......', '.......', '..oo.D#', 'D......'], vatChat: ['.......', '.......', '..NN...', '.......'],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(nhieu(HS, ['turn_right()'], THA)),
      loiGiai: bai(nhieu(HS, ['turn_right()'], THA, ['turn_left()'], HN)),
      sao: { o: 12, nhip: 5 },
      loiSai: [
        { moTa: 'Giữ cực S: vật N thứ hai bị hút về chứ không bị đẩy', baiLam: bai(nhieu(HS, ['turn_right()'], THA, ['turn_left()'], HS)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật thứ hai cũng chữ N: muốn đẩy thì bật cực N.', 'Kéo: cực khác. Đẩy: cực trùng.']
    }),

    man({
      so: 7, ten: 'Bắn sang ngang', hang: 'bien-the',
      deBai: 'Vật chữ N nằm phía trước, ô đích lại ở bên phải, xa ba ô. Kéo vật về mũi xe, rẽ phải, rồi đổi sang cực trùng chữ: vật đang dính bị bắn ra và trượt tới sát tường.',
      veMaMau: 'Chương trình có sẵn kéo vật về rồi rẽ. Viết tiếp.',
      san: ['o.....', '......', '....D#'], vatChat: ['N.....', '......', '......'],
      batDau: { x: 0, y: 2, huong: 0 },
      maMau: bai(nhieu(HS, ['turn_right()'])),
      loiGiai: bai(nhieu(HS, ['turn_right()'], HN)),
      sao: { o: 7, nhip: 3 },
      loiSai: [
        { moTa: 'Thả bằng magnet_off(): vật rơi ngay trước mũi xe, chưa tới đích', baiLam: bai(nhieu(HS, ['turn_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đang dính vật chữ N mà bật cực N thì vật bị bắn ra.', 'magnet_off() chỉ thả vật xuống ô sát mũi, không bắn.']
    }),

    man({
      so: 8, ten: 'Kho hai cực', hang: 'trum', khung: { chinh: 18, moiHam: 10 },
      deBai: 'Kho có ba vật quanh xe: vật chữ N phía trước, vật chữ S phía sau, vật sắt bên trái. Vật N phải bị bắn sang phải tới ô đích sát tường, vật S bị đẩy xuống ô đích ở mép dưới, vật sắt về ô đích ngay bên phải xe. Chọn cực cho đúng từng việc.',
      veMaMau: 'Chương trình có sẵn mới kéo vật N về. Viết tiếp.',
      san: ['.......', '..o....', '.......', 'o..D.D#', '..o....', '.......', '..D....'],
      vatChat: ['.......', '..N....', '.......', 's......', '..S....', '.......', '.......'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(HS),
      loiGiai: bai(nhieu(HS, ['turn_right()'], HN, THA, ['turn_right()'], HS, ['turn_right()'], HN, ['u_turn()'], THA)),
      sao: { o: 21, nhip: 10 },
      loiSai: [
        { moTa: 'Đẩy vật S bằng cực N: khác cực nên vật S bị hút về', baiLam: bai(nhieu(HS, ['turn_right()'], HN, THA, ['turn_right()'], HN, ['turn_right()'], HN, ['u_turn()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vật N: kéo bằng cực S, rẽ phải, bắn bằng cực N. Vật S: đẩy bằng cực S. Sắt: cực nào cũng hút.', 'Làm từng vật một: N, rồi S, rồi sắt.']
    })
  ];

  /* ================================================= chương che-dao-cuc "Hàm đảo cực" =================================================
     Thứ tự (MUA_3): 1 (trình diễn) · 2 (tạo pull_n) · che-nam-cham.6 (chế fling) · 3 (tạo pull_s) · 4 · 5 (tạo haul_n(k)) · 6 · 7 · 8 · 9 (trùm).
     Hàm của em mới: pull_n() = magnet_s(), wait() (kéo vật chữ N) · pull_s() = magnet_n(), wait() · haul_n(k) (kéo vật N, chở k ô, thả). */
  function che(m) { m.chuong = 'che-dao-cuc'; return man(m); }
  var T_PULL_N = ['magnet_s()', 'wait()'], T_PULL_S = ['magnet_n()', 'wait()'];
  var T_HAUL = ['pull_n()', 'for i in range(k):', '    move()', 'magnet_off()', 'wait()'];

  DS.push(
    che({
      so: 1, ten: 'Hàm kéo vật', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['reel_n'],
      deBai: 'Hàm reel_n() của màn bật cực S để kéo vật chữ N về. Tên hàm nói việc nó làm nên chương trình dễ đọc hơn. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Bấm Chạy.',
      san: ['####', '.D.o', '####'], vatChat: ['....', '...N', '....'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['reel_n()'], THA), { hamCuaMan: [H('reel_n', [], T_PULL_N)] }),
      loiGiai: bai(nhieu(['reel_n()'], THA), { hamCuaMan: [H('reel_n', [], T_PULL_N)] }),
      sao: { o: 5, nhip: 2 },
      goiY: ['Mở Xưởng xem thân reel_n().', 'Màn sau em tự tạo hàm như thế.']
    }),

    che({
      so: 2, ten: 'Hàm pull_n()', hang: 'lam-quen', taoHam: ['pull_n'],
      deBai: 'Tạo hàm pull_n(): bật cực S để kéo vật chữ N về mũi xe (hai dòng). Rồi rẽ phải và thả vật vào ô đích.',
      veMaMau: 'Chương trình có sẵn gọi pull_n() nhưng em chưa có hàm đó. Bấm Hàm mới.',
      san: ['..o...', '......', '......', '...D..'], vatChat: ['..N...', '......', '......', '......'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(nhieu(['pull_n()', 'turn_right()'], THA)),
      loiGiai: bai(nhieu(['pull_n()', 'turn_right()'], THA), { hamCuaEmMoi: [H('pull_n', [], T_PULL_N)] }),
      sao: { o: 8, nhip: 3 },
      loiSai: [
        { moTa: 'Chưa tạo hàm pull_n mà đã gọi nó', baiLam: bai(nhieu(['pull_n()', 'turn_right()'], THA)), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm bật cực N: cùng cực nên vật bị đẩy đi', baiLam: bai(nhieu(['pull_n()', 'turn_right()'], THA)), hamCuaEmMoi: [H('pull_n', [], T_PULL_S)], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Kéo vật chữ N: bật cực S, rồi wait().', 'Hàm hai dòng, không có đối số.']
    }),

    che({
      so: 3, ten: 'Hàm pull_s()', hang: 'lam-quen', taoHam: ['pull_s'],
      deBai: 'Tạo hàm pull_s() kéo vật chữ S về mũi xe. Kéo vật S, rẽ trái rồi thả vào ô đích.',
      veMaMau: 'Chương trình có sẵn gọi pull_s(). Tạo hàm đó.',
      san: ['.....', '..o..', '.....', '.D...', '.....'], vatChat: ['.....', '..S..', '.....', '.....', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(nhieu(['pull_s()', 'turn_left()'], THA)),
      loiGiai: bai(nhieu(['pull_s()', 'turn_left()'], THA), { hamCuaEmMoi: [H('pull_s', [], T_PULL_S)] }),
      sao: { o: 8, nhip: 3 },
      loiSai: [
        { moTa: 'Dùng pull_n() cho vật chữ S: cùng cực nên vật bị đẩy đi', baiLam: bai(nhieu(['pull_n()', 'turn_left()'], THA)), hamCuaEmMoi: [H('pull_s', [], T_PULL_S)], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Kéo vật chữ S: bật cực N.', 'pull_n() và pull_s() khác nhau ở cực được bật.']
    }),

    che({
      so: 4, ten: 'Bắn và kéo', hang: 'luyen', hamCuaEmCan: ['turn_right', 'u_turn', 'fling', 'pull_s'],
      deBai: 'Vật chữ N phía trước phải bị bắn tới ô đích sát mép trên. Vật chữ S bên phải phải được kéo về rồi thả vào ô đích bên trái xe. Dùng fling() và pull_s() của em.',
      veMaMau: 'Chương trình có sẵn đã bắn vật N. Viết tiếp.',
      san: ['..D..', '.....', '..o..', '.....', '.D..o'], vatChat: ['.....', '.....', '..N..', '.....', '....S'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['fling()']),
      loiGiai: bai(nhieu(['fling()', 'turn_right()', 'pull_s()', 'u_turn()'], THA)),
      sao: { o: 17, nhip: 6 },
      loiSai: [
        { moTa: 'Kéo vật S bằng pull_n(): vật bị đẩy đi', baiLam: bai(nhieu(['fling()', 'turn_right()', 'pull_n()', 'u_turn()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['fling() kéo rồi bắn vật N ra xa theo hướng mũi xe.', 'Kéo vật S về, quay đầu rồi thả.']
    }),

    che({
      so: 5, ten: 'Hàm haul_n(k)', hang: 'luyen', taoHam: ['haul_n'], hamCuaEmCan: ['move', 'turn_right', 'pull_n'],
      deBai: 'Tạo hàm haul_n(k): kéo vật chữ N về bằng pull_n(), chở nó tiến k ô rồi thả. Vật đầu cần chở 1 ô, vật sau cần chở 2 ô.',
      veMaMau: 'Chương trình có sẵn gọi haul_n(1), rẽ phải, haul_n(2). Tạo hàm haul_n có đối số k.',
      san: ['.....', '.....', '.....', '..Do.', '.....', '.o...', '.D...'], vatChat: ['.....', '.....', '.....', '...N.', '.....', '.N...', '.....'],
      batDau: { x: 0, y: 3, huong: 1 },
      maMau: bai(['haul_n(1)', 'turn_right()', 'haul_n(2)']),
      loiGiai: bai(['haul_n(1)', 'turn_right()', 'haul_n(2)'], { hamCuaEmMoi: [H('haul_n', ['k'], T_HAUL)] }),
      sao: { o: 15, nhip: 8 },
      loiSai: [
        { moTa: 'Trong hàm chở cứng 1 ô: vật sau chưa tới đích', baiLam: bai(['haul_n(1)', 'turn_right()', 'haul_n(2)']), hamCuaEmMoi: [H('haul_n', ['k'], ['pull_n()', 'move()', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm: pull_n(), vòng for i in range(k): move(), rồi thả.', 'Đối số k là số ô phải chở.']
    }),

    che({
      so: 6, ten: 'Sửa push_off()', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hàm push_off() của màn phải đẩy vật chữ S trượt vào ô đích sát tường, nhưng nó bật nhầm cực nên vật bị hút về. Sửa thân hàm.',
      veMaMau: 'Chạy thử: vật S bay về mũi xe. Mở Xưởng sửa push_off.',
      san: ['......', '......', '.o.D#.', '......', '......'], vatChat: ['......', '......', '.S....', '......', '......'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(['move()', 'move()', 'turn_right()', 'push_off()'], { hamCuaMan: [H('push_off', [], HN)] }),
      loiGiai: bai(['move()', 'move()', 'turn_right()', 'push_off()'], { hamCuaMan: [H('push_off', [], HS)] }),
      sao: { o: 11, nhip: 4 },
      loiSai: [
        { moTa: 'Sửa thành magnet_off(): vật không bị đẩy', baiLam: bai(['move()', 'move()', 'turn_right()', 'push_off()'], { hamCuaMan: [H('push_off', [], THA)] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đẩy vật chữ S thì bật cùng cực: S.', 'Chỉ cần đổi một lệnh trong hàm.']
    }),

    che({
      so: 7, ten: 'Bắn hai vật', hang: 'bien-the', hamCuaEmCan: ['turn_right', 'fling'],
      deBai: 'Hai vật chữ N, một ở phía trước, một ở bên phải. Mỗi vật phải bị bắn tới ô đích ở mép sân theo hướng của nó. Dùng fling() hai lần.',
      veMaMau: 'Chương trình có sẵn bắn được vật đầu. Viết tiếp.',
      san: ['..D...', '......', '..o...', '......', '....oD'], vatChat: ['......', '......', '..N...', '......', '....N.'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['fling()']),
      loiGiai: bai(['fling()', 'turn_right()', 'fling()']),
      sao: { o: 9, nhip: 3 },
      loiSai: [
        { moTa: 'Quên rẽ phải: lần bắn thứ hai không có vật trước mặt', baiLam: bai(['fling()', 'fling()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Bắn xong vật đầu, rẽ phải cho mũi xe quay về vật thứ hai.', 'fling() làm cả việc kéo lẫn bắn.']
    }),

    che({
      so: 8, ten: 'Sắt thì mang, N thì bắn', hang: 'bien-the', hamCuaEmCan: ['u_turn', 'fling'],
      deBai: 'Hai sân. Vật trước mặt có thể là vật sắt hoặc vật chữ N. Sắt thì hút về, quay đầu, thả vào ô đích sau lưng; vật N thì bắn ra xa tới ô đích ở mép trên. Dùng front_metal() để chọn.',
      veMaMau: 'Chương trình có sẵn lúc nào cũng bắn. Thêm if front_metal(): ở đầu.',
      san: [['..D..', '.....', '..o..', '.....', '.....', '..D..'], ['..D..', '.....', '..o..', '.....', '.....', '..D..']],
      vatChat: [['.....', '.....', '..s..', '.....', '.....', '.....'], ['.....', '.....', '..N..', '.....', '.....', '.....']],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['fling()']),
      loiGiai: bai(['if front_metal():', '    magnet_n()', '    wait()', '    u_turn()', '    magnet_off()', '    wait()', 'else:', '    fling()']),
      sao: { o: 15, nhip: 3 },
      loiSai: [
        { moTa: 'Lúc nào cũng bắn: sắt không bị bắn ra, vẫn dính ở mũi xe', baiLam: bai(['fling()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['front_metal() là True khi trước mặt là sắt.', 'Sắt không bị cùng cực đẩy, nên không bắn được sắt.']
    }),

    che({
      so: 9, ten: 'Kho bắn và mang', hang: 'trum', hamCuaEmCan: ['move', 'u_turn', 'fling'],
      deBai: 'Ba kho, mỗi kho một hành lang, cuối hành lang là vật sắt hoặc vật chữ N, xa gần khác nhau. Đi tới khi trước mặt hết trống hoặc thấy sắt. Sắt thì mang về ô đích sau lưng; vật N thì bắn nó vào ô đích ở cuối hành lang.',
      veMaMau: 'Chương trình có sẵn mới đi thẳng tới vật. Viết tiếp.',
      san: [['########', '..D..o..', '########'], ['########', '....o..D', '########'], ['########', '...D..o.', '########']],
      vatChat: [['........', '.....s..', '........'], ['........', '....N...', '........'], ['........', '......s.', '........']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['while front_clear():', '    move()']),
      loiGiai: bai(['while front_clear() and not front_metal():', '    move()', 'if front_metal():', '    magnet_n()', '    wait()', '    u_turn()', '    magnet_off()', '    wait()', 'else:', '    fling()']),
      sao: { o: 20, nhip: 7 },
      loiSai: [
        { moTa: 'Đi tới khi trước mặt hết trống: kho sắt xe sát vật rồi mới hút, thả lệch', baiLam: bai(['while front_clear():', '    move()', 'if front_metal():', '    magnet_n()', '    wait()', '    u_turn()', '    magnet_off()', '    wait()', 'else:', '    fling()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Dừng khi gặp vật chắn hoặc thấy sắt: front_clear() and not front_metal().', 'Sắt thì mang về; không phải sắt thì fling().']
    })
  );

  ManHoc.manDaoCuc = DS;
  if (laNode) module.exports = ManHoc;
})();
