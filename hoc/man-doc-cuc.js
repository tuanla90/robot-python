/* ============================================================================
   man-doc-cuc.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 7 "Đọc cực" (KE-HOACH-MUA-3.md, PDM3b1).
   Dựng lại đủ 20 màn (doc-cuc.1..10, che-doc-cuc.1..10) trên Robot phân loại mùa 3:
     - Thân nhện + nam châm bụng + cảm biến từ ở hông (đầu dò chữ U nhìn sang phải, batDau.huong = 1).
     - Cái mới của gói 7: front_pole() trả CHUỖI "N" / "S" (cực của vật nam châm đầu tiên trong 3 ô bên phải) hay "none" (trống, sắt, gỗ);
       so sánh chuỗi bằng ==, if / elif / else, biến p giữ chuỗi đọc từ cảm biến trước khi bước lên vật, hàm nhận đối số chuỗi sort_drop(p),
       hàm grab_pole(), sort_row(), sort_back().
     - Phối hợp với các bộ phận đã mở ở gói 1–6: đệm từ (detour), nhảy qua hố (jump), đảo cực (pull_n, pull_s, magnet_n, magnet_s), dò sắt (front_metal).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDocCuc, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var THA = ['magnet_off()', 'wait()'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function man(m) {
    m.chuong = m.chuong || 'doc-cuc';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] };
    m.hamGoc = m.hamGoc || GOC;
    m.mucTieu = 'dua-vat';
    m.vatCan = m.vatCan || 'tu';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 16, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }
  function che(m) { m.chuong = 'che-doc-cuc'; return man(m); }

  var KEO_BUOC = ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()'];
  var CHIA_BA = ['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'elif p == "S":', '    pull_s()', '    go_down()', 'else:', '    pull_s()', '    go_right()'];
  var T_SORT_DROP = ['if p == "N":', '    go_up()', 'else:', '    go_down()', 'magnet_off()', 'wait()'];
  var T_GRAB_POLE = KEO_BUOC.slice();
  var T_SORT_ROW = ['p = front_pole()', 'grab_pole()', 'sort_drop(p)'];
  var T_SORT_BACK = ['p = front_pole()', 'sort_row()', 'if p == "N":', '    go_down()', '    go_down()', 'go_left()', 'go_down()'];

  var DS = [
    /* ============================================================ CHƯƠNG 1: doc-cuc (10 màn) ============================================================ */
    man({
      so: 1, ten: 'Đọc chữ trên vật', hang: 'lam-quen', chiChay: true, chinhCoDinh: true,
      deBai: 'Đầu dò từ bên phải nhện có thêm lệnh front_pole(): nó đọc cực của vật nam châm đầu tiên bên phải (trong 3 ô) và trả về chuỗi "N" hoặc "S"; không có vật nam châm thì trả "none". Bấm Chạy: nhện thấy chữ "S" nên bật cực N dưới bụng, bước sang nhấc vật rồi đem vào thùng xanh.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy để xem nhện đọc cực và nhấc vật.',
      san: ['.oD'], vatChat: ['.S.'], mau: ['..b'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['if front_pole() == "S":', '    magnet_n()', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(['if front_pole() == "S":', '    magnet_n()', 'go_right()', 'go_right()'], THA)),
      sao: { o: 6, nhip: 5 },
      goiY: ['front_pole() trả chuỗi có ngoặc kép: "N", "S" hoặc "none".', 'Bật cực khác chữ trước khi bước lên vật thì nam châm bụng hút vật ngay khi bước tới.']
    }),

    man({
      so: 2, ten: 'Chữ N hay chữ S', hang: 'lam-quen',
      deBai: 'Hai bãi: mẩu nam châm bên phải nhện ghi chữ N ở bãi 1, chữ S ở bãi 2. Đọc chữ bằng front_pole(), bật cực khác chữ dưới bụng, bước sang nhấc vật rồi đưa tiếp sang phải vào thùng.',
      veMaMau: 'Chương trình có sẵn lúc nào cũng bật cực S nên bãi 2 gặp vật S bị cùng cực. Thêm if / else.',
      san: [['.oD'], ['.oD']], vatChat: [['.N.'], ['.S.']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['magnet_s()', 'go_right()', 'go_right()'], THA)),
      loiGiai: bai(nhieu(KEO_BUOC, ['go_right()'], THA)),
      congThucKhac: [
        { moTa: 'So với chữ S trước rồi else bật cực S', baiLam: bai(nhieu(['if front_pole() == "S":', '    magnet_n()', 'else:', '    magnet_s()', 'go_right()', 'go_right()'], THA)) },
        { moTa: 'Dùng pull_n() và pull_s() trong hai nhánh', baiLam: bai(nhieu(['if front_pole() == "N":', '    go_right()', '    pull_n()', 'else:', '    go_right()', '    pull_s()', 'go_right()'], THA)) }
      ],
      sao: { o: 8, nhip: 5 },
      loiSai: [
        { moTa: 'Lúc nào cũng bật cực S: bãi 2 cùng cực nên không nhấc được mẩu S', baiLam: bai(nhieu(['magnet_s()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'So với chữ thường "n": không khớp nên bãi 1 bật nhầm cực N', baiLam: bai(nhieu(['if front_pole() == "n":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Bật cùng cực với chữ trên vật: cả hai bãi đều cùng cực', baiLam: bai(nhieu(['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'go_right()', 'go_right()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Chữ N thì bật magnet_s(); ngược lại bật magnet_n().', 'Đọc front_pole() khi nhện còn đứng bên trái vật, trước khi go_right() bước lên vật.']
    }),

    man({
      so: 3, ten: 'Đọc cực rồi nhảy qua hố', hang: 'lam-quen', hamCuaEmCan: ['go', 'jump'],
      deBai: 'Hai bãi: bên phải nhện là mẩu nam châm (bãi 1 chữ S, bãi 2 chữ N), sau đó là cái hố rồi tới thùng. Đọc cực để nhấc mẩu nam châm lên bụng, nhảy qua hố bằng jump("R") rồi thả vào thùng.',
      veMaMau: 'Chương trình có sẵn luôn bật cực N. Thêm if / else theo front_pole() trước khi bước sang.',
      san: [['.ouD'], ['.ouD']], vatChat: [['.S..'], ['.N..']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['magnet_n()', 'go_right()', 'jump("R")'], THA)),
      loiGiai: bai(nhieu(KEO_BUOC, ['jump("R")'], THA)),
      congThucKhac: [
        { moTa: 'So với "S" trước trong if', baiLam: bai(nhieu(['if front_pole() == "S":', '    magnet_n()', 'else:', '    magnet_s()', 'go_right()', 'jump("R")'], THA)) }
      ],
      sao: { o: 20, nhip: 6 },
      loiSai: [
        { moTa: 'Luôn bật cực N: bãi 2 gặp vật N cùng cực', baiLam: bai(nhieu(['magnet_n()', 'go_right()', 'jump("R")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Bước lên vật rồi mới hỏi front_pole(): đầu dò nhìn qua bên phải vật nên trả "none"', baiLam: bai(nhieu(['go_right()', 'if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'jump("R")'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Đi thường thay vì jump("R"): nhện rơi xuống hố', baiLam: bai(nhieu(KEO_BUOC, ['go_right()'], THA)), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Đứng ở ô đầu, hỏi front_pole() để bật cực ngược với vật rồi mới go_right().', 'Nhấc vật xong gọi jump("R") để bật qua hố tới thẳng thùng.']
    }),

    man({
      so: 4, ten: 'Biến giữ cực, hai thùng màu', hang: 'luyen', hamCuaEmCan: ['pull_n', 'pull_s'],
      deBai: 'Hai bãi: mẩu chữ N màu đỏ phải về thùng ĐỎ phía trên, mẩu chữ S màu xanh phải về thùng XANH phía dưới. Khi còn đứng bên trái vật, lưu p = front_pole(), bước lên vật rồi dựa theo p mà nhấc và đi lên hay đi xuống.',
      veMaMau: 'Chương trình có sẵn đã lưu p = front_pole() và bước lên vật. Viết tiếp if p == "N": / else: để nhấc và đưa về đúng thùng.',
      san: [['#D', '.o', '#D'], ['#D', '.o', '#D']],
      vatChat: [['..', '.N', '..'], ['..', '.S', '..']],
      mau: [['.r', '..', '.b'], ['.r', '..', '.b']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['p = front_pole()', 'go_right()']),
      loiGiai: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)),
      congThucKhac: [
        { moTa: 'Bật cực trước khi bước sang rồi rẽ lên / xuống theo p', baiLam: bai(nhieu(['p = front_pole()', 'if p == "N":', '    magnet_s()', '    go_right()', '    go_up()', 'else:', '    magnet_n()', '    go_right()', '    go_down()'], THA)) }
      ],
      sao: { o: 14, nhip: 6 },
      loiSai: [
        { moTa: 'Đi ngược hướng: đưa vật N xuống thùng xanh, vật S lên thùng đỏ', baiLam: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_down()', 'else:', '    pull_s()', '    go_up()'], THA)), phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Bước lên vật rồi mới gán p = front_pole(): lúc đó vật đã ở dưới bụng nên p là "none"', baiLam: bai(nhieu(['go_right()', 'p = front_pole()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Phải đọc p = front_pole() trước khi go_right() bước lên vật.', 'Nếu p == "N" thì pull_n() rồi go_up(); ngược lại pull_s() rồi go_down().']
    }),

    man({
      so: 5, ten: 'Dò xuống tới hàng có vật từ', hang: 'luyen', vatCan: 'nam-cham',
      deBai: 'Hai bãi: đi dọc cột trái xuống cho tới hàng có mẩu nam châm bên phải (bỏ qua hàng trống hay hàng chỉ có sắt vụn, vì với sắt front_pole() vẫn trả "none"). Tới đúng hàng thì đọc cực, nhấc mẩu nam châm đưa sang thùng bên phải.',
      veMaMau: 'Chương trình có sẵn mới bước xuống một hàng cố định. Thay bằng vòng while front_pole() == "none":.',
      san: [['..#', '.oD', '###'], ['..#', '.o#', '.oD']],
      vatChat: [['...', '.N.', '...'], ['...', '.s.', '.S.']],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['go_down()'], KEO_BUOC, ['go_right()'], THA)),
      loiGiai: bai(nhieu(['while front_pole() == "none":', '    go_down()'], KEO_BUOC, ['go_right()'], THA)),
      congThucKhac: [
        { moTa: 'Dùng pull_n() / pull_s() sau khi bước lên vật', baiLam: bai(nhieu(['while front_pole() == "none":', '    go_down()', 'if front_pole() == "N":', '    go_right()', '    pull_n()', 'else:', '    go_right()', '    pull_s()', 'go_right()'], THA)) }
      ],
      sao: { o: 10, nhip: 9 },
      loiSai: [
        { moTa: 'Đi cứng một bước xuống: bãi 2 dừng ở hàng sắt vụn', baiLam: bai(nhieu(['go_down()'], KEO_BUOC, ['go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng while not front_metal(): bãi 1 không có sắt nên đi lố, bãi 2 dừng ở hàng sắt', baiLam: bai(nhieu(['while not front_metal():', '    go_down()'], KEO_BUOC, ['go_right()'], THA)), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Sắt vụn không có cực nên front_pole() trả "none", chỉ vật N hoặc S mới trả "N" / "S".', 'Lặp while front_pole() == "none": go_down() sẽ dừng đúng hàng có vật nam châm.']
    }),

    man({
      so: 6, ten: 'Ba cửa phân loại', hang: 'bien-the', hamCuaEmCan: ['pull_n', 'pull_s'],
      deBai: 'Ba bãi: vật bên phải nhện là mẩu chữ N, mẩu chữ S hoặc mẩu sắt vụn. Mẩu N về thùng đỏ phía trên, mẩu S về thùng xanh phía dưới, mẩu sắt về thùng không màu bên phải. Lưu p = front_pole(), bước sang rồi dùng if / elif / else.',
      veMaMau: 'Chương trình có sẵn mới chia hai nhánh nên mẩu sắt ở bãi 3 bị đưa nhầm xuống thùng xanh. Thêm nhánh elif p == "S":.',
      san: [['#D#', '.oD', '#D#'], ['#D#', '.oD', '#D#'], ['#D#', '.oD', '#D#']],
      vatChat: [['...', '.N.', '...'], ['...', '.S.', '...'], ['...', '.s.', '...']],
      mau: [['.r.', '...', '.b.'], ['.r.', '...', '.b.'], ['.r.', '...', '.b.']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)),
      loiGiai: bai(nhieu(CHIA_BA, THA)),
      congThucKhac: [
        { moTa: 'Bật nam châm trước khi bước sang rồi chia ba đường theo p', baiLam: bai(nhieu(['p = front_pole()', 'if p == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()', 'if p == "N":', '    go_up()', 'elif p == "S":', '    go_down()', 'else:', '    go_right()'], THA)) }
      ],
      sao: { o: 17, nhip: 6 },
      loiSai: [
        { moTa: 'Thiếu nhánh elif cho chữ S: sắt vụn rơi vào else và bị đưa xuống thùng xanh', baiLam: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)), phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Nhánh else quên nhấc sắt trước khi sang phải', baiLam: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'elif p == "S":', '    pull_s()', '    go_down()', 'else:', '    go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Sắt vụn làm front_pole() trả "none", và cực nào cũng hút được sắt nên pull_s() nhấc được cả S lẫn sắt.', 'Ba nhánh: if p == "N" đi lên, elif p == "S" đi xuống, else đi sang phải.']
    }),

    man({
      so: 7, ten: 'Sửa chữ hoa', hang: 'bien-the', hamCuaEmCan: ['pull_n', 'pull_s'],
      deBai: 'Hai bãi: mẩu N về thùng đỏ phía trên, mẩu S về thùng xanh phía dưới. Chương trình của Sola viết chữ "s" thường trong nhánh elif nên mẩu S không khớp, bị đưa sang phải. Sửa lại thành chữ hoa "S".',
      veMaMau: 'Chạy thử: bãi 2 mẩu S không khớp với "s" nên đi sang phải. Chạm chữ "s" để đổi thành "S".',
      san: [['#D#', '.o.', '#D#'], ['#D#', '.o.', '#D#']],
      vatChat: [['...', '.N.', '...'], ['...', '.S.', '...']],
      mau: [['.r.', '...', '.b.'], ['.r.', '...', '.b.']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'elif p == "s":', '    pull_s()', '    go_down()', 'else:', '    go_right()'], THA)),
      loiGiai: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'elif p == "S":', '    pull_s()', '    go_down()', 'else:', '    go_right()'], THA)),
      congThucKhac: [
        { moTa: 'Dùng if p == "N": / else: vì chỉ có hai loại vật N và S', baiLam: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)) }
      ],
      sao: { o: 16, nhip: 6 },
      loiSai: [
        { moTa: 'Để nguyên chữ "s" thường: bãi 2 không khớp nên mẩu S không vào thùng xanh', baiLam: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'elif p == "s":', '    pull_s()', '    go_down()', 'else:', '    go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đổi thành "none": mẩu S vẫn rơi vào else', baiLam: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'elif p == "none":', '    pull_s()', '    go_down()', 'else:', '    go_right()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['front_pole() luôn trả chữ HOA: "N" hoặc "S".', 'Đổi "s" ở dòng elif thành "S".']
    }),

    man({
      so: 8, ten: 'Hành lang phân loại', hang: 'bien-the', hamCuaEmCan: ['pull_n', 'pull_s'],
      deBai: 'Ba bãi: đi xuống dọc hành lang trái tới hàng có vật nam châm bên phải, đọc chữ vào p, bước sang nhấc vật rồi đưa vật N lên thùng đỏ phía trên, vật S xuống thùng xanh phía dưới.',
      veMaMau: 'Chương trình có sẵn đã phân loại theo p nhưng chưa đi xuống tìm hàng có vật.',
      san: [
        ['.D#', '.o#', '#D#', '###'],
        ['.##', '.D#', '.o#', '#D#'],
        ['.##', '.D#', '.o#', '#D#']
      ],
      vatChat: [
        ['...', '.N.', '...', '...'],
        ['...', '...', '.S.', '...'],
        ['...', '...', '.N.', '...']
      ],
      mau: [
        ['.r.', '...', '.b.', '...'],
        ['...', '.r.', '...', '.b.'],
        ['...', '.r.', '...', '.b.']
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)),
      loiGiai: bai(nhieu(['while front_pole() == "none":', '    go_down()', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)),
      congThucKhac: [
        { moTa: 'Bật cực trước khi bước sang rồi rẽ lên / xuống theo p', baiLam: bai(nhieu(['while front_pole() == "none":', '    go_down()', 'p = front_pole()', 'if p == "N":', '    magnet_s()', '    go_right()', '    go_up()', 'else:', '    magnet_n()', '    go_right()', '    go_down()'], THA)) }
      ],
      sao: { o: 16, nhip: 10 },
      loiSai: [
        { moTa: 'Quên đi xuống tới hàng có vật: phân loại ngay ở hàng đầu', baiLam: bai(nhieu(['p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi cứng một bước xuống: bãi 2 và bãi 3 chưa tới hàng có vật', baiLam: bai(nhieu(['go_down()', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Dùng while front_pole() == "none": go_down() ở đầu chương trình.', 'Khi vòng while dừng, nhện đang đứng ngay bên trái vật nam châm.']
    }),

    man({
      so: 9, ten: 'Nhảy qua hố rồi dò cực', hang: 'bien-the', hamCuaEmCan: ['go', 'jump', 'pull_n', 'pull_s'],
      deBai: 'Hai bãi: nhảy qua cái hố trước mặt bằng jump("R") để sang cột dò, đi xuống tới hàng có vật nam châm, rồi phân loại vật N lên thùng đỏ, vật S xuống thùng xanh.',
      veMaMau: 'Chương trình có sẵn quên nhảy qua hố và mới đi cứng một bước xuống. Sửa lại cho đủ.',
      san: [
        ['###D', '.u.o', '###D', '####'],
        ['####', '.u.D', '##.o', '###D']
      ],
      vatChat: [
        ['....', '...S', '....', '....'],
        ['....', '....', '...N', '....']
      ],
      mau: [
        ['...r', '....', '...b', '....'],
        ['....', '...r', '....', '...b']
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(nhieu(['go_right()', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)),
      loiGiai: bai(nhieu(['jump("R")', 'while front_pole() == "none":', '    go_down()', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)),
      congThucKhac: [
        { moTa: 'Bật cực trước khi bước sang ở cuối vòng while', baiLam: bai(nhieu(['jump("R")', 'while front_pole() == "none":', '    go_down()', 'p = front_pole()', 'if p == "N":', '    magnet_s()', '    go_right()', '    go_up()', 'else:', '    magnet_n()', '    go_right()', '    go_down()'], THA)) }
      ],
      sao: { o: 29, nhip: 11 },
      loiSai: [
        { moTa: 'Đi thường go_right() ở đầu: rơi ngay xuống hố', baiLam: bai(nhieu(['go_right()', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhảy qua hố nhưng quên while dò xuống: bãi 2 chưa tới hàng có vật N', baiLam: bai(nhieu(['jump("R")', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Gọi jump("R") đầu tiên để nhảy từ cột 0 qua hố sang cột 2.', 'Từ cột 2, lặp while front_pole() == "none": go_down() rồi phân loại theo p.']
    }),

    man({
      so: 10, ten: 'Trùm Đọc cực: Ba độ sâu, ba cửa', hang: 'trum', khung: { chinh: 18, moiHam: 10 }, hamCuaEmCan: ['pull_n', 'pull_s'],
      huyHieu: { ma: 'doc-cuc', ten: 'Huy hiệu Đọc cực' },
      deBai: 'Trùm Đọc cực. Ba bãi có hành lang dài ngắn khác nhau, ở cuối là mẩu chữ N, mẩu chữ S hoặc mẩu sắt vụn. Đi xuống cho tới khi gặp vật nam châm hoặc sắt (while front_pole() == "none" and not front_metal():), lưu p = front_pole(), bước sang rồi chia ba cửa: N lên thùng đỏ, S xuống thùng xanh, sắt sang phải.',
      veMaMau: 'Chương trình có sẵn đi cứng hai bước rồi mới chia hai nhánh. Thay bằng vòng while kết hợp and và chia đủ ba nhánh.',
      san: [
        ['.D##', '.oD#', '#D##'],
        ['.###', '.###', '.D##', '.oD#', '#D##'],
        ['.###', '.D##', '.oD#', '#D##']
      ],
      vatChat: [
        ['....', '.S..', '....'],
        ['....', '....', '....', '.s..', '....'],
        ['....', '....', '.N..', '....']
      ],
      mau: [
        ['.r..', '....', '.b..'],
        ['....', '....', '.r..', '....', '.b..'],
        ['....', '.r..', '....', '.b..']
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['go_down()', 'go_down()', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)),
      loiGiai: bai(nhieu(['while front_pole() == "none" and not front_metal():', '    go_down()'], CHIA_BA, THA)),
      congThucKhac: [
        { moTa: 'Bật nam châm trước khi bước sang rồi chia ba hướng theo p', baiLam: bai(nhieu(['while front_pole() == "none" and not front_metal():', '    go_down()', 'p = front_pole()', 'if p == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()', 'if p == "N":', '    go_up()', 'elif p == "S":', '    go_down()', 'else:', '    go_right()'], THA)) }
      ],
      sao: { o: 19, nhip: 12 },
      loiSai: [
        { moTa: 'Đi cứng hai bước xuống: bãi 1 đâm tường, bãi 2 chưa tới hàng sắt', baiLam: bai(nhieu(['go_down()', 'go_down()'], CHIA_BA, THA)), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Chỉ dò front_pole() == "none": bãi 2 gặp sắt vụn không dừng nên đâm tường cuối hành lang', baiLam: bai(nhieu(['while front_pole() == "none":', '    go_down()'], CHIA_BA, THA)), phaiCoMa: ['vong-vo-han', 'dam-tuong'] },
        { moTa: 'Chỉ chia hai nhánh if / else: bãi 2 đưa sắt vụn vào thùng xanh', baiLam: bai(nhieu(['while front_pole() == "none" and not front_metal():', '    go_down()', 'p = front_pole()', 'go_right()', 'if p == "N":', '    pull_n()', '    go_up()', 'else:', '    pull_s()', '    go_down()'], THA)), phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] }
      ],
      goiY: ['Hàng cần dừng có thể là vật nam châm hoặc sắt: lặp khi front_pole() == "none" and not front_metal().', 'Tới hàng rồi thì đọc p = front_pole(): "N" lên trên, "S" xuống dưới, "none" (sắt) sang phải.']
    }),

    /* ============================================================ CHƯƠNG 2: che-doc-cuc (10 màn) ============================================================ */
    che({
      so: 1, ten: 'Hàm có if bên trong', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoaHamMan: ['catch'],
      deBai: 'Hàm catch() của màn tự đọc chữ trên vật bên phải, bật cực ngược lại dưới bụng rồi bước sang nhấc vật. Chương trình chính không cần biết vật là N hay S. Bấm Chạy.',
      veMaMau: 'Chương trình và hàm của màn đã viết sẵn, khoá. Mở Xưởng xem catch() rồi bấm Chạy.',
      san: ['.oD'], vatChat: ['.N.'], mau: ['..r'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(nhieu(['catch()', 'go_right()'], THA), { hamCuaMan: [H('catch', [], KEO_BUOC)] }),
      loiGiai: bai(nhieu(['catch()', 'go_right()'], THA), { hamCuaMan: [H('catch', [], KEO_BUOC)] }),
      sao: { o: 9, nhip: 5 },
      goiY: ['Hàm có thể chứa if / else và đọc cảm biến bên trong.', 'Màn sau em tạo hàm nhận đối số là chuỗi đọc từ cảm biến.']
    }),

    che({
      so: 2, ten: 'Hàm sort_drop(p)', hang: 'lam-quen', taoHam: ['sort_drop'],
      deBai: 'Tạo hàm sort_drop(p) nhận chuỗi p: nếu p == "N" thì đi lên (go_up), ngược lại đi xuống (go_down), rồi ngắt điện thả vật. Hai bãi: mẩu N về thùng đỏ phía trên, mẩu S về thùng xanh phía dưới.',
      veMaMau: 'Chương trình có sẵn đã đọc p, bật cực ngược lại, bước sang nhấc vật rồi gọi sort_drop(p). Mở Xưởng tạo hàm sort_drop có đối số p.',
      san: [['#D', '.o', '#D'], ['#D', '.o', '#D']],
      vatChat: [['..', '.N', '..'], ['..', '.S', '..']],
      mau: [['.r', '..', '.b'], ['.r', '..', '.b']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['p = front_pole()', 'if p == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()', 'sort_drop(p)']),
      loiGiai: bai(['p = front_pole()', 'if p == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()', 'sort_drop(p)'], { hamCuaEmMoi: [H('sort_drop', ['p'], T_SORT_DROP)] }),
      sao: { o: 13, nhip: 5 },
      loiSai: [
        { moTa: 'Chưa tạo hàm sort_drop mà đã bấm Chạy', baiLam: bai(['p = front_pole()', 'if p == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()', 'sort_drop(p)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm so với "S" mà vẫn đi lên: mẩu S vào nhầm thùng đỏ', baiLam: bai(['p = front_pole()', 'if p == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'go_right()', 'sort_drop(p)']), hamCuaEmMoi: [H('sort_drop', ['p'], ['if p == "S":', '    go_up()', 'else:', '    go_down()', 'magnet_off()', 'wait()'])], phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] }
      ],
      goiY: ['Đối số p giữ chuỗi "N" hoặc "S" truyền từ chương trình chính vào.', 'Thân hàm sort_drop(p): if p == "N": go_up() else: go_down(), rồi magnet_off(), wait().']
    }),

    che({
      so: 3, ten: 'Tạo hàm grab_pole()', hang: 'lam-quen', taoHam: ['grab_pole'], hamCuaEmCan: ['sort_drop'],
      deBai: 'Tạo hàm grab_pole() không tham số để tự đọc front_pole(), bật cực ngược lại dưới bụng (chữ N bật cực S, còn lại bật cực N) rồi bước sang phải nhấc vật. Dùng grab_pole() cùng sort_drop(p) ở hai bãi.',
      veMaMau: 'Chương trình chính đã lưu p = front_pole(), gọi grab_pole() rồi sort_drop(p). Mở Xưởng tạo grab_pole().',
      san: [['#D', '.o', '#D'], ['#D', '.o', '#D']],
      vatChat: [['..', '.S', '..'], ['..', '.N', '..']],
      mau: [['.r', '..', '.b'], ['.r', '..', '.b']],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['p = front_pole()', 'grab_pole()', 'sort_drop(p)']),
      loiGiai: bai(['p = front_pole()', 'grab_pole()', 'sort_drop(p)'], { hamCuaEmMoi: [H('grab_pole', [], T_GRAB_POLE)] }),
      sao: { o: 14, nhip: 5 },
      loiSai: [
        { moTa: 'Chưa tạo hàm grab_pole mà đã gọi', baiLam: bai(['p = front_pole()', 'grab_pole()', 'sort_drop(p)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong grab_pole() bật cùng cực với chữ trên vật: không nhấc được vật', baiLam: bai(['p = front_pole()', 'grab_pole()', 'sort_drop(p)']), hamCuaEmMoi: [H('grab_pole', [], ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'go_right()'])], phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Trong grab_pole() bước sang phải trước rồi mới hỏi front_pole()', baiLam: bai(['p = front_pole()', 'grab_pole()', 'sort_drop(p)']), hamCuaEmMoi: [H('grab_pole', [], ['go_right()', 'if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()'])], phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Thân hàm grab_pole() giống hệt hàm catch() ở màn 1: if front_pole() == "N": magnet_s() else: magnet_n(), rồi go_right().', 'Chương trình chính chỉ cần 3 dòng: p = front_pole(), grab_pole(), sort_drop(p).']
    }),

    che({
      so: 4, ten: 'Phân loại cuối hành lang', hang: 'luyen', hamCuaEmCan: ['grab_pole', 'sort_drop'],
      deBai: 'Hai bãi: đi xuống dọc hành lang tới hàng có mẩu nam châm bên phải, lưu chữ vào p, gọi grab_pole() nhấc vật rồi gọi sort_drop(p).',
      veMaMau: 'Chương trình có sẵn mới đi xuống tới hàng có vật. Viết tiếp ba dòng phân loại.',
      san: [
        ['.D', '.o', '#D', '##'],
        ['.#', '.D', '.o', '#D']
      ],
      vatChat: [
        ['..', '.S', '..', '..'],
        ['..', '..', '.N', '..']
      ],
      mau: [
        ['.r', '..', '.b', '..'],
        ['..', '.r', '..', '.b']
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_pole() == "none":', '    go_down()']),
      loiGiai: bai(['while front_pole() == "none":', '    go_down()', 'p = front_pole()', 'grab_pole()', 'sort_drop(p)']),
      sao: { o: 16, nhip: 9 },
      loiSai: [
        { moTa: 'Đọc p = front_pole() trước vòng while: lúc đó còn xa vật nên p là "none", mẩu N ở bãi 2 đi nhầm xuống thùng xanh', baiLam: bai(['p = front_pole()', 'while front_pole() == "none":', '    go_down()', 'grab_pole()', 'sort_drop(p)']), phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] },
        { moTa: 'Gọi grab_pole() trước khi lưu p = front_pole(): bước lên vật rồi nên p là "none"', baiLam: bai(['while front_pole() == "none":', '    go_down()', 'grab_pole()', 'p = front_pole()', 'sort_drop(p)']), phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] }
      ],
      goiY: ['Đi tới đúng hàng có vật rồi mới đọc p = front_pole().', 'Đọc p xong gọi grab_pole() rồi sort_drop(p).']
    }),

    che({
      so: 5, ten: 'Sửa hàm đấu ngược cực', hang: 'luyen', chinhCoDinh: true, hamCuaEmCan: ['go', 'jump', 'sort_drop'],
      deBai: 'Hai bãi: nhện nhảy qua hố tới trước mẩu nam châm rồi gọi fixed_grab() và sort_drop(p). Nhưng hàm fixed_grab() của màn đang đấu ngược dây cực (gặp N lại bật N, gặp S lại bật S). Mở Xưởng sửa lại fixed_grab().',
      veMaMau: 'Chương trình chính đã khoá. Mở Xưởng sửa hai lệnh bật cực trong fixed_grab().',
      san: [
        ['###D', '.u.o', '###D'],
        ['###D', '.u.o', '###D']
      ],
      vatChat: [
        ['....', '...N', '....'],
        ['....', '...S', '....']
      ],
      mau: [
        ['...r', '....', '...b'],
        ['...r', '....', '...b']
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['jump("R")', 'p = front_pole()', 'fixed_grab()', 'sort_drop(p)'], { hamCuaMan: [H('fixed_grab', [], ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'go_right()'])] }),
      loiGiai: bai(['jump("R")', 'p = front_pole()', 'fixed_grab()', 'sort_drop(p)'], { hamCuaMan: [H('fixed_grab', [], T_GRAB_POLE)] }),
      sao: { o: 27, nhip: 8 },
      loiSai: [
        { moTa: 'Để nguyên hàm fixed_grab() đấu ngược cực: cùng cực nên không nhấc được vật', baiLam: bai(['jump("R")', 'p = front_pole()', 'fixed_grab()', 'sort_drop(p)'], { hamCuaMan: [H('fixed_grab', [], ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'go_right()'])] }), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] },
        { moTa: 'Đổi cả hai nhánh thành magnet_s(): bãi 2 gặp vật S bị cùng cực', baiLam: bai(['jump("R")', 'p = front_pole()', 'fixed_grab()', 'sort_drop(p)'], { hamCuaMan: [H('fixed_grab', [], ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_s()', 'go_right()'])] }), phaiCoMa: ['cung-cuc', 'chua-dua-vat'] }
      ],
      goiY: ['Khác cực mới hút: thấy "N" phải bật magnet_s(), nhánh else bật magnet_n().', 'Giữ nguyên lệnh go_right() ở cuối hàm fixed_grab().']
    }),

    che({
      so: 6, ten: 'Tạo hàm sort_row()', hang: 'luyen', taoHam: ['sort_row'], hamCuaEmCan: ['grab_pole', 'sort_drop'],
      deBai: 'Ba dòng p = front_pole(), grab_pole(), sort_drop(p) luôn đi cùng nhau mỗi khi phân loại một hàng. Hãy đóng gói chúng thành hàm sort_row() không tham số, rồi đi xuống tới hàng có vật và gọi sort_row().',
      veMaMau: 'Tạo hàm sort_row() trong Xưởng, rồi dùng while front_pole() == "none": go_down() và gọi sort_row().',
      san: [
        ['.D', '.o', '#D', '##', '##'],
        ['.#', '.#', '.D', '.o', '#D']
      ],
      vatChat: [
        ['..', '.N', '..', '..', '..'],
        ['..', '..', '..', '.S', '..']
      ],
      mau: [
        ['.r', '..', '.b', '..', '..'],
        ['..', '..', '.r', '..', '.b']
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_pole() == "none":', '    go_down()']),
      loiGiai: bai(['while front_pole() == "none":', '    go_down()', 'sort_row()'], { hamCuaEmMoi: [H('sort_row', [], T_SORT_ROW)] }),
      sao: { o: 17, nhip: 11 },
      loiSai: [
        { moTa: 'Gọi sort_row() trước khi đi xuống tới hàng có vật', baiLam: bai(['sort_row()']), hamCuaEmMoi: [H('sort_row', [], T_SORT_ROW)], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong sort_row() gọi grab_pole() trước p = front_pole(): p luôn là "none"', baiLam: bai(['while front_pole() == "none":', '    go_down()', 'sort_row()']), hamCuaEmMoi: [H('sort_row', [], ['grab_pole()', 'p = front_pole()', 'sort_drop(p)'])], phaiCoMa: ['dat-sai-mau', 'chua-dua-vat'] }
      ],
      goiY: ['Thân hàm sort_row() gồm 3 dòng: p = front_pole(), grab_pole(), sort_drop(p).', 'Ở chương trình chính: sau vòng while chỉ cần gọi sort_row().']
    }),

    che({
      so: 7, ten: 'Nhảy qua hố rồi gọi sort_row()', hang: 'bien-the', hamCuaEmCan: ['go', 'jump', 'sort_row'],
      deBai: 'Hai bãi: nhảy qua hố bằng jump("R") sang hành lang bên kia, dò xuống tới hàng có vật nam châm rồi gọi sort_row() để phân loại.',
      veMaMau: 'Chương trình có sẵn nhảy qua hố rồi gọi sort_row() ngay nên ở bãi 2 chưa tới hàng có vật. Bổ sung vòng while dò xuống trước sort_row().',
      san: [
        ['.u.D', '##.o', '###D', '####', '####'],
        ['.u.#', '##.#', '##.D', '##.o', '###D']
      ],
      vatChat: [
        ['....', '...N', '....', '....', '....'],
        ['....', '....', '....', '...S', '....']
      ],
      mau: [
        ['...r', '....', '...b', '....', '....'],
        ['....', '....', '...r', '....', '...b']
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['jump("R")', 'go_down()', 'sort_row()']),
      loiGiai: bai(['jump("R")', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      sao: { o: 30, nhip: 14 },
      loiSai: [
        { moTa: 'Quên nhảy qua hố: nhện bước xuống đâm vào tường dưới ô xuất phát', baiLam: bai(['while front_pole() == "none":', '    go_down()', 'sort_row()']), phaiCoMa: ['vong-vo-han', 'dam-tuong'] },
        { moTa: 'Đi cứng 1 bước xuống sau khi nhảy: bãi 2 vật S nằm sâu hơn nên chưa tới hàng', baiLam: bai(['jump("R")', 'go_down()', 'sort_row()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Dùng jump("R") để vượt qua hố sang cột 2.', 'Dùng while front_pole() == "none": go_down() rồi gọi sort_row().']
    }),

    che({
      so: 8, ten: 'Hàm phân loại rồi quay về: sort_back()', hang: 'bien-the', chinhCoDinh: true, taoHam: ['sort_back'], hamCuaEmCan: ['grab_pole', 'sort_drop', 'sort_row'],
      deBai: 'Sau khi sort_drop(p) thả vật N ở thùng trên hoặc vật S ở thùng dưới, nhện cần bước xuống tới hàng thùng dưới (nếu đang ở thùng trên), sang trái về hành lang rồi bước xuống một hàng để qua khỏi trạm. Tạo hàm sort_back() làm trọn việc này.',
      veMaMau: 'Chương trình chính đã khoá: gọi sort_back() ở trạm 1, bước xuống một hàng tới trạm 2 rồi gọi sort_row(). Mở Xưởng tạo sort_back().',
      san: [
        ['#D', '.o', '.D', '.D', '.o', '#D'],
        ['#D', '.o', '.D', '.D', '.o', '#D']
      ],
      vatChat: [
        ['..', '.N', '..', '..', '.S', '..'],
        ['..', '.S', '..', '..', '.N', '..']
      ],
      mau: [
        ['.r', '..', '.b', '.r', '..', '.b'],
        ['.r', '..', '.b', '.r', '..', '.b']
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['sort_back()', 'go_down()', 'sort_row()']),
      loiGiai: bai(['sort_back()', 'go_down()', 'sort_row()'], { hamCuaEmMoi: [H('sort_back', [], T_SORT_BACK)] }),
      sao: { o: 24, nhip: 20 },
      loiSai: [
        { moTa: 'Chưa tạo hàm sort_back mà đã bấm Chạy', baiLam: bai(['sort_back()', 'go_down()', 'sort_row()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong sort_back() quên bước xuống khi p == "N": từ thùng trên go_left() đâm vào tường', baiLam: bai(['sort_back()', 'go_down()', 'sort_row()']), hamCuaEmMoi: [H('sort_back', [], ['p = front_pole()', 'grab_pole()', 'sort_drop(p)', 'go_left()', 'go_down()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quay về ngược chiều (p == "N" lại go_up()): đâm tường phía trên thùng đỏ', baiLam: bai(['sort_back()', 'go_down()', 'sort_row()']), hamCuaEmMoi: [H('sort_back', [], ['p = front_pole()', 'grab_pole()', 'sort_drop(p)', 'if p == "N":', '    go_up()', 'go_left()', 'go_down()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Khi p == "N", nhện đang ở thùng trên nên cần hai lần go_down() để xuống ngang hàng thùng dưới.', 'Sau đó go_left() về hành lang trái rồi go_down() thêm một bước là qua khỏi trạm 1.']
    }),

    che({
      so: 9, ten: 'Hai trạm xa gần ở hai bãi', hang: 'bien-the', hamCuaEmCan: ['sort_back', 'sort_row'],
      deBai: 'Hai bãi có hai trạm phân loại nằm ở độ sâu khác nhau. Dò xuống tới trạm đầu và gọi sort_back(), rồi dò tiếp xuống tới trạm thứ hai và phân loại.',
      veMaMau: 'Chương trình có sẵn mới xử lý trạm đầu. Viết tiếp vòng while thứ hai để dò xuống trạm dưới.',
      san: [
        ['.D', '.o', '.D', '.#', '.D', '.o', '#D'],
        ['.#', '.D', '.o', '.D', '.D', '.o', '#D']
      ],
      vatChat: [
        ['..', '.N', '..', '..', '..', '.S', '..'],
        ['..', '..', '.S', '..', '..', '.N', '..']
      ],
      mau: [
        ['.r', '..', '.b', '..', '.r', '..', '.b'],
        ['..', '.r', '..', '.b', '.r', '..', '.b']
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_pole() == "none":', '    go_down()', 'sort_back()']),
      loiGiai: bai(['while front_pole() == "none":', '    go_down()', 'sort_back()', 'while front_pole() == "none":', '    go_down()', 'sort_row()']),
      congThucKhac: [
        { moTa: 'Dùng vòng for lặp 2 lần cặp while và sort_back()', baiLam: bai(['for i in range(2):', '    while front_pole() == "none":', '        go_down()', '    sort_back()']) }
      ],
      sao: { o: 27, nhip: 24 },
      loiSai: [
        { moTa: 'Chỉ xử lý trạm đầu: mẩu nam châm ở trạm dưới chưa được phân loại', baiLam: bai(['while front_pole() == "none":', '    go_down()', 'sort_back()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ở trạm đầu gọi sort_row() thay vì sort_back(): nhện đứng kẹt trong thùng, không đi xuống trạm dưới được', baiLam: bai(['while front_pole() == "none":', '    go_down()', 'sort_row()', 'while front_pole() == "none":', '    go_down()', 'sort_row()']), phaiCoMa: ['vong-vo-han', 'dam-tuong'] }
      ],
      goiY: ['sort_back() đã đưa nhện về hành lang trái và bước qua khỏi trạm đầu.', 'Viết tiếp while front_pole() == "none": go_down() rồi sort_row() (hoặc bọc trong for i in range(2):).']
    }),

    che({
      so: 10, ten: 'Trùm Hàm đọc cực: Kho từ ba trạm', hang: 'trum', hamCuaEmCan: ['sort_back'],
      huyHieu: { ma: 'che-doc-cuc', ten: 'Huy hiệu Hàm đọc cực' },
      deBai: 'Trùm Hàm đọc cực. Ba bãi, mỗi bãi có ba trạm vật nam châm (N hoặc S) nằm ở các độ sâu khác nhau dọc hành lang. Hãy lặp 3 lần: dò xuống tới khi front_pole() khác "none" rồi gọi sort_back() để phân loại cả ba trạm.',
      veMaMau: 'Viết chương trình dùng for, while front_pole() == "none": và sort_back() để phân loại cả ba trạm.',
      san: [
        ['.D', '.o', '.D', '.#', '.D', '.o', '.D', '.D', '.o', '#D'],
        ['.D', '.o', '.D', '.D', '.o', '.D', '.#', '.D', '.o', '#D'],
        ['.#', '.D', '.o', '.D', '.D', '.o', '.D', '.D', '.o', '#D']
      ],
      vatChat: [
        ['..', '.N', '..', '..', '..', '.S', '..', '..', '.N', '..'],
        ['..', '.S', '..', '..', '.N', '..', '..', '..', '.S', '..'],
        ['..', '..', '.N', '..', '..', '.N', '..', '..', '.S', '..']
      ],
      mau: [
        ['.r', '..', '.b', '..', '.r', '..', '.b', '.r', '..', '.b'],
        ['.r', '..', '.b', '.r', '..', '.b', '..', '.r', '..', '.b'],
        ['..', '.r', '..', '.b', '.r', '..', '.b', '.r', '..', '.b']
      ],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['while front_pole() == "none":', '    go_down()', 'sort_back()']),
      loiGiai: bai(['for i in range(3):', '    while front_pole() == "none":', '        go_down()', '    sort_back()']),
      congThucKhac: [
        { moTa: 'Lặp 2 lần sort_back() rồi trạm cuối gọi sort_row()', baiLam: bai(['for i in range(2):', '    while front_pole() == "none":', '        go_down()', '    sort_back()', 'while front_pole() == "none":', '    go_down()', 'sort_row()']) }
      ],
      sao: { o: 25, nhip: 39 },
      loiSai: [
        { moTa: 'Chỉ lặp 2 lần: trạm thứ ba ở cuối hành lang chưa được phân loại', baiLam: bai(['for i in range(2):', '    while front_pole() == "none":', '        go_down()', '    sort_back()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đi cứng số bước giữa các trạm: mỗi bãi có khoảng cách trạm khác nhau', baiLam: bai(['go_down()', 'sort_back()', 'go_down()', 'sort_back()', 'go_down()', 'sort_back()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng sort_row() trong vòng lặp: sau trạm 1 nhện chưa về hành lang trái nên đâm tường', baiLam: bai(['for i in range(3):', '    while front_pole() == "none":', '        go_down()', '    sort_row()']), phaiCoMa: ['vong-vo-han', 'dam-tuong'] }
      ],
      goiY: ['Mỗi trạm cách nhau khác nhau ở từng bãi: dùng while front_pole() == "none": go_down() để tìm trạm kế.', 'Bọc while và sort_back() trong for i in range(3): là xử lý gọn cả ba trạm.']
    })
  ];

  ManHoc.manDocCuc = DS;
  if (laNode) module.exports = ManHoc;
})();
