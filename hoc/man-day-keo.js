/* ============================================================================
   man-day-keo.js — Mùa 5 (Bến sông) · Gói 2: Tay Dây phao kéo & Bộ cố định tuple
   Chương 1: day-keo (10 màn) — Quăng dây kéo bè (tow, drop_tow + wait)
   Chương 2: bo-co-dinh (10 màn) — Bộ cố định hai phần (Python B: tuple, gỡ cặp, trả về tuple)
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_DAY_KEO = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'tow', 'drop_tow'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manDayKeo(so, hang, ds) {
    return Object.assign({
      chuong: 'day-keo', so: so, hang: hang,
      vo: 'song', loaiRobot: 'xuong',
      robot: { than: 'xuong', tay: 'day-keo', camBien: [] },
      hamGoc: GOC_DAY_KEO.slice(),
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back'],
      taoHam: [],
      cauTruc: ['for', 'if'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if'] },
      mucTieu: 'dua-vat'
    }, ds);
  }

  function manBoCoDinh(so, hang, ds) {
    return Object.assign({
      chuong: 'bo-co-dinh', so: so, hang: hang,
      vo: 'song', loaiRobot: 'xuong',
      robot: { than: 'xuong', tay: 'day-keo', camBien: [] },
      hamGoc: GOC_DAY_KEO.slice(),
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back'],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'return', 'tuple', 'list'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if', 'return', 'tuple', 'list'] },
      mucTieu: 'dua-vat'
    }, ds);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: day-keo — Quăng dây kéo bè (10 màn)
       ====================================================================== */
    manDayKeo(1, 'lam-quen', {
      ten: 'Quăng dây phao kéo bè',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Tàu thủy lợi R1 vừa gắn tay Dây phao kéo. Lệnh tow() đi kèm wait() quăng dây phao thẳng theo mũi xuồng (tối đa 3 ô) và kéo bè B về ngay ô trước mũi. Khi bè đã ở mũi, mỗi bước tiến của xuồng sẽ đẩy bè đi trước 1 ô vào bến nhận bè q. Bấm Chạy để xem.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem tow() kéo bè về mũi rồi đẩy vào bến q.',
      san: [
        '.......',
        '~~~B~q.',
        '.......'
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['tow()', 'wait()', 'move()', 'move()', 'move()', 'move()']),
      loiGiai: bai(['tow()', 'wait()', 'move()', 'move()', 'move()', 'move()']),
      sao: { o: 9, nhip: 5 },
      goiY: [
        'tow() chỉ ra lệnh cho tay dây phao; cần wait() để kết thúc nhịp kéo bè về ô trước mũi.',
        'Sau khi bè ở ô (1, 1), 4 bước move() đẩy bè tới bến q ở (5, 1).'
      ]
    }),

    manDayKeo(2, 'lam-quen', {
      ten: 'Tầm dây phao ba ô',
      deBai: 'Dây phao bay xa tối đa 3 ô trước mũi xuồng. Chiếc bè B đang nằm ở ô (3, 1), đúng tầm 3 ô tính từ xuồng ở (0, 1). Hãy gọi tow() và wait() để kéo bè về sát mũi ở (1, 1), rồi tiến 4 ô đẩy bè vào bến q ở (5, 1).',
      veMaMau: 'Mã mẫu đã có tow() và wait(). Hãy thêm các bước tiến để đẩy bè tới bến q.',
      san: [
        '.......',
        '~~~B~q.',
        '.......'
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['tow()', 'wait()', 'move()', 'move()']),
      loiGiai: bai(['tow()', 'wait()', 'forward(4)']),
      loiGiaiKhac: {
        moTa: 'Gọi 4 lần move() sau khi kéo bè',
        baiLam: bai(['tow()', 'wait()', 'move()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đẩy bè đi 2 ô, chưa tới bến q', baiLam: bai(['tow()', 'wait()', 'move()', 'move()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi tow() mà tiến thẳng: xuồng húc vào bè B', baiLam: bai(['forward(5)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi tow() nhưng quên wait() ở cuối chương trình', baiLam: bai(['tow()']), phaiCoMa: ['quen-wait', 'chua-dua-vat'] }
      ],
      sao: { o: 8, nhip: 5 },
      goiY: [
        'Khi tow() và wait() chạy xong, bè B đã được kéo về ô (1, 1) ngay trước mũi xuồng.',
        'Từ (1, 1) tới bến q ở (5, 1) là 4 ô, hãy dùng forward(4).'
      ]
    }),

    manDayKeo(3, 'lam-quen', {
      ten: 'Lùi xuồng dắt bè theo',
      deBai: 'Bến nhận bè q nằm ở phía sau lưng xuồng tại (1, 1), còn bè B nằm phía trước ở (6, 1). Khi bè đang gắn ở mũi, mỗi bước lùi back() của xuồng sẽ kéo bè đi theo vào đúng ô xuồng vừa rời. Hãy tiến 1 ô cho đủ tầm 3 ô, quăng dây kéo bè, rồi lùi 3 ô đưa bè về bến q.',
      veMaMau: 'Mã mẫu đã tiến 1 ô và quăng dây kéo bè về (4, 1). Hãy lùi 3 lần để kéo bè về bến q ở (1, 1).',
      san: [
        '........',
        '~q~~~~B.',
        '........'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['move()', 'tow()', 'wait()', 'back()']),
      loiGiai: bai(['move()', 'tow()', 'wait()', 'back()', 'back()', 'back()']),
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for để lùi 3 bước',
        baiLam: bai(['move()', 'tow()', 'wait()', 'for i in range(3):', '    back()'])
      },
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới lùi 1 bước, bè dừng ở (3, 1)', baiLam: bai(['move()', 'tow()', 'wait()', 'back()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quăng dây ngay từ đầu khi bè cách 4 ô: dây hụt ngoài tầm, sau đó lùi vào bờ', baiLam: bai(['tow()', 'wait()', 'back()', 'back()', 'back()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Tiến thay vì lùi sau khi kéo bè: đẩy bè sang phải đụng bờ', baiLam: bai(['move()', 'tow()', 'wait()', 'move()', 'move()', 'move()']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] }
      ],
      sao: { o: 12, nhip: 5 },
      goiY: [
        'Xuồng tiến lên (3, 1), gọi tow() và wait() kéo bè từ (6, 1) về (4, 1).',
        'Lùi 3 bước bằng back() sẽ kéo bè từ (4, 1) qua (3, 1), (2, 1) rồi về đúng bến q ở (1, 1).'
      ]
    }),

    manDayKeo(4, 'lam-quen', {
      ten: 'Quay mũi xoay bè sang nhánh',
      deBai: 'Khi xuồng đang giữ bè ở mũi mà quay 90 độ, chiếc bè cũng xoay theo sang ô trước mũi mới (miễn là ô đó là mặt nước trống). Hãy tiến 1 ô tới ngã rẽ (2, 1), quăng dây kéo bè B từ (4, 1) về (3, 1), rẽ phải để xoay bè xuống (2, 2), rồi tiến 2 ô đẩy bè vào bến q.',
      veMaMau: 'Mã mẫu đã kéo bè về mũi ở ngã rẽ. Hãy rẽ phải rồi đẩy bè xuống bến q.',
      san: [
        '......',
        '~~~~B~',
        '..~...',
        '..~...',
        '..q...'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['move()', 'tow()', 'wait()']),
      loiGiai: bai(['move()', 'tow()', 'wait()', 'turn_right()', 'move()', 'move()']),
      loiGiaiKhac: {
        moTa: 'Dùng forward(2) ở nhánh dọc',
        baiLam: bai(['move()', 'tow()', 'wait()', 'turn_right()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: chưa rẽ phải và đẩy bè xuống nhánh', baiLam: bai(['move()', 'tow()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Rẽ trái thay vì rẽ phải: ô phía trên là bờ nên mũi vướng bờ', baiLam: bai(['move()', 'tow()', 'wait()', 'turn_left()', 'move()', 'move()']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] },
        { moTa: 'Chỉ tiến 1 ô sau khi rẽ phải: bè dừng ở (2, 3), thiếu 1 ô tới bến q', baiLam: bai(['move()', 'tow()', 'wait()', 'turn_right()', 'move()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 11, nhip: 5 },
      goiY: [
        'Khi xuồng ở (2, 1) gọi turn_right(), bè ở (3, 1) sẽ xoay sang ô trước mũi mới là (2, 2).',
        'Sau khi rẽ phải, thêm 2 lần move() để đẩy bè từ (2, 2) xuống bến q ở (2, 4).'
      ]
    }),

    manDayKeo(5, 'luyen', {
      ten: 'Thả dây phao dọn lục bình',
      mucTieu: 'toi-co',
      deBai: 'Cụm lục bình L đang chắn ngang luồng nước hẹp dẫn tới phao đích Q. Lệnh drop_tow() đi kèm wait() dùng để tháo dây phao, thả vật nổi nằm lại tại ô trước mũi. Hãy quăng dây kéo L về (2, 1), rẽ phải xoay L xuống hốc nước (1, 2), gọi drop_tow() và wait() để thả L ở đó, rồi rẽ trái tiến 4 ô tới phao Q.',
      veMaMau: 'Mã mẫu đã xoay cụm lục bình vào hốc (1, 2) nhưng chưa tháo dây. Hãy dùng drop_tow(), wait() rồi rẽ trái tiến tới Q.',
      san: [
        '.......',
        '~~~L~Q.',
        '.~.....',
        '.......'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['tow()', 'wait()', 'turn_right()', 'turn_left()', 'forward(4)']),
      loiGiai: bai([
        'tow()',
        'wait()',
        'turn_right()',
        'drop_tow()',
        'wait()',
        'turn_left()',
        'forward(4)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: quên drop_tow() nên khi rẽ trái cụm lục bình lại xoay về chắn trước mũi và vướng bờ ở cuối kênh', baiLam: bai(['tow()', 'wait()', 'turn_right()', 'turn_left()', 'forward(4)']), phaiCoMa: ['mui-vuong', 'chua-toi-co'] },
        { moTa: 'Gọi drop_tow() nhưng quên wait() trước khi rẽ trái: lệnh thả và lệnh quay cùng nhịp nên thả ở (1, 2) nhưng thiếu bước tiến', baiLam: bai(['tow()', 'wait()', 'turn_right()', 'drop_tow()', 'wait()', 'turn_left()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không kéo lục bình ra mà đi thẳng: xuồng vướng vật nổi L', baiLam: bai(['forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 8 },
      goiY: [
        'Sau turn_right(), cụm lục bình L đang nằm gọn trong hốc (1, 2). Gọi drop_tow() rồi wait() để thả nó ở đó.',
        'Tiếp theo gọi turn_left() và forward(4) để xuồng đi thẳng từ (1, 1) tới phao Q ở (5, 1).'
      ]
    }),

    manDayKeo(6, 'luyen', {
      ten: 'Kéo hai bè vào hai bến',
      deBai: 'Trên sông có 2 chiếc bè B cần đưa vào 2 bến q. Muốn đi kéo chiếc bè thứ hai, xuồng phải tháo dây thả chiếc bè thứ nhất yên vị trên bến q đầu tiên bằng drop_tow() và wait(). Hãy hoàn thành chương trình đưa đủ cả 2 bè vào bến.',
      veMaMau: 'Mã mẫu đã đưa bè thứ nhất vào bến (2, 0) và tháo dây. Hãy lùi xuống, rẽ phải và kéo bè thứ hai vào bến (6, 2).',
      san: [
        '..q....',
        '..B....',
        '..~~~Bq',
        '.......'
      ],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai([
        'tow()',
        'wait()',
        'move()',
        'drop_tow()',
        'wait()'
      ]),
      loiGiai: bai([
        'tow()',
        'wait()',
        'move()',
        'drop_tow()',
        'wait()',
        'back()',
        'turn_right()',
        'tow()',
        'wait()',
        'forward(3)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đưa được 1 bè vào bến trên', baiLam: bai(['tow()', 'wait()', 'move()', 'drop_tow()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop_tow() ở bến đầu: khi lùi và rẽ phải, bè thứ nhất bị kéo lệch và tow() lần hai báo đang kéo', baiLam: bai(['tow()', 'wait()', 'move()', 'back()', 'turn_right()', 'tow()', 'wait()', 'forward(3)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Ở nhánh ngang chỉ tiến 2 ô thay vì 3 ô: bè thứ hai dừng trước bến q', baiLam: bai(['tow()', 'wait()', 'move()', 'drop_tow()', 'wait()', 'back()', 'turn_right()', 'tow()', 'wait()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 20, nhip: 9 },
      goiY: [
        'Sau khi thả bè đầu ở (2, 0), xuồng đang ở (2, 1) hướng lên: gọi back() để lùi về ngã rẽ (2, 2) rồi turn_right().',
        'Từ (2, 2) hướng phải, gọi tow(), wait() để kéo bè từ (5, 2) về (3, 2), rồi forward(3) đẩy bè tới bến (6, 2).'
      ]
    }),

    manDayKeo(7, 'luyen', {
      ten: 'Lặp nhịp kéo bè hai nhánh',
      deBai: 'Hai nhánh kênh dọc ở cột 2 và cột 5 có cấu trúc giống hệt nhau: ở mỗi nhánh, bè B nằm ở hàng 1 và bến q nằm ở hàng 0. Hãy dùng vòng lặp for 2 lần để rẽ trái, quăng dây kéo bè, đẩy lên bến q, tháo dây, lùi về luồng chính rồi rẽ phải tiến sang nhánh kế tiếp.',
      veMaMau: 'Dùng vòng lặp for i in range(2) để xử lý lần lượt hai nhánh kênh.',
      san: [
        '..q..q..',
        '..B..B..',
        '~~~~~~~~',
        '........'
      ],
      batDau: { x: 2, y: 2, huong: 1 },
      maMau: bai([
        'for i in range(2):',
        '    turn_left()',
        '    tow()',
        '    wait()',
        '    move()'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    turn_left()',
        '    tow()',
        '    wait()',
        '    move()',
        '    drop_tow()',
        '    wait()',
        '    back()',
        '    turn_right()',
        '    forward(3)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đẩy bè đầu lên bến nhưng chưa tháo dây và chưa sang nhánh thứ hai', baiLam: bai(['for i in range(2):', '    turn_left()', '    tow()', '    wait()', '    move()']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] },
        { moTa: 'Quên gọi drop_tow() trước khi lùi: bè đầu bị kéo tuột khỏi bến q', baiLam: bai(['for i in range(2):', '    turn_left()', '    tow()', '    wait()', '    move()', '    back()', '    turn_right()', '    forward(3)']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] },
        { moTa: 'Cuối vòng lặp chỉ tiến 2 ô thay vì 3 ô: xuồng dừng ở cột 4, lệch nhánh thứ hai ở cột 5', baiLam: bai(['for i in range(2):', '    turn_left()', '    tow()', '    wait()', '    move()', '    drop_tow()', '    wait()', '    back()', '    turn_right()', '    forward(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 22, nhip: 12 },
      goiY: [
        'Ở mỗi nhánh: turn_left(), tow(), wait(), move() để đẩy bè vào bến q ở hàng 0.',
        'Sau đó gọi drop_tow(), wait(), back() về hàng 2, rồi turn_right() và forward(3) sang nhánh kế.'
      ]
    }),

    manDayKeo(8, 'thu-thach', {
      ten: 'Xoay bè tại ngã ba vịnh hẹp',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'u_turn', 'back'],
      deBai: 'Ở ngã ba (2, 1), chiếc bè đầu tiên nằm bên phải tại (4, 1) cần đưa lên bến trên (2, 0), còn chiếc bè thứ hai nằm ở nhánh dưới (2, 3) cần đẩy xuống bến (2, 5). Hãy kéo bè đầu về mũi rồi rẽ trái để xoay thẳng bè lên (2, 0), tháo dây, sau đó gọi u_turn() quay đầu 180 độ xuống nhánh dưới để kéo và đẩy bè thứ hai vào bến.',
      veMaMau: 'Lập trình kéo lần lượt 2 chiếc bè vào 2 bến q.',
      san: [
        '..q....',
        '~~~~B..',
        '..~....',
        '..B....',
        '..~....',
        '..q....'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([]),
      loiGiai: bai([
        'tow()',
        'wait()',
        'turn_left()',
        'drop_tow()',
        'wait()',
        'u_turn()',
        'tow()',
        'wait()',
        'forward(3)'
      ]),
      loiSai: [
        { moTa: 'Rẽ phải thay vì rẽ trái sau khi kéo bè đầu: bè xoay xuống (2, 2) chắn lối tới bè thứ hai', baiLam: bai(['tow()', 'wait()', 'turn_right()', 'drop_tow()', 'wait()', 'tow()', 'wait()', 'forward(3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop_tow() sau khi xoay bè đầu lên bến (2, 0): khi quay đầu 180 độ, bè đầu bị xoay theo xuống (2, 2)', baiLam: bai(['tow()', 'wait()', 'turn_left()', 'u_turn()', 'tow()', 'wait()', 'forward(3)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Đẩy bè thứ hai thiếu 1 bước: chỉ forward(2) thay vì forward(3)', baiLam: bai(['tow()', 'wait()', 'turn_left()', 'drop_tow()', 'wait()', 'u_turn()', 'tow()', 'wait()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 19, nhip: 8 },
      goiY: [
        'Xuồng ở (2, 1) hướng phải: gọi tow(), wait() kéo bè từ (4, 1) về (3, 1), rồi turn_left() để xoay bè đó lên thẳng bến q ở (2, 0).',
        'Gọi drop_tow(), wait() để thả bè đầu tại (2, 0), rồi u_turn() quay xuống, tow(), wait() kéo bè thứ hai và forward(3) đẩy xuống bến (2, 5).'
      ]
    }),

    manDayKeo(9, 'thu-thach', {
      ten: 'Ba bến nhận bè liên hoàn',
      deBai: 'Dọc bờ kênh có 3 chiếc bè B nằm ở các cột 2, 4, 6 ngay cạnh 3 hốc bến q ở các cột 1, 3, 5. Khi xuồng đứng ở cột bến (1, 3, 5) hướng sang phải, chỉ cần gọi tow(), wait() rồi turn_left() là chiếc bè xoay ngay vào hốc bến q phía trên! Hãy dùng vòng lặp 3 lần để đưa cả 3 bè vào bến.',
      veMaMau: 'Mỗi vòng lặp: kéo bè, rẽ trái xoay bè vào bến q, thả dây, rẽ phải rồi tiến 2 ô sang cột bến tiếp theo.',
      san: [
        '.q.q.q..',
        '~~B~B~B~',
        '........'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([]),
      loiGiai: bai([
        'for i in range(3):',
        '    tow()',
        '    wait()',
        '    turn_left()',
        '    drop_tow()',
        '    wait()',
        '    turn_right()',
        '    forward(2)'
      ]),
      loiSai: [
        { moTa: 'Chỉ lặp 2 lần: còn bè thứ ba chưa vào bến', baiLam: bai(['for i in range(2):', '    tow()', '    wait()', '    turn_left()', '    drop_tow()', '    wait()', '    turn_right()', '    forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop_tow() trong vòng lặp: sang bước rẽ phải bè lại xoay ra khỏi bến q', baiLam: bai(['for i in range(3):', '    tow()', '    wait()', '    turn_left()', '    turn_right()', '    forward(2)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Cuối vòng lặp chỉ tiến 1 ô thay vì 2 ô: xuồng dừng lệch cột bến kế tiếp', baiLam: bai(['for i in range(3):', '    tow()', '    wait()', '    turn_left()', '    drop_tow()', '    wait()', '    turn_right()', '    move()']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] }
      ],
      sao: { o: 17, nhip: 14 },
      goiY: [
        'Xuồng xuất phát ở (1, 1): gọi tow(), wait() nắm bè ở (2, 1), rồi turn_left() xoay bè lên đúng bến q ở (1, 0).',
        'Tháo dây bằng drop_tow(), wait(), rẽ phải bằng turn_right() rồi forward(2) sang cột 3 (ô (2, 1) đã trống vì bè đã lên bến).'
      ]
    }),

    manDayKeo(10, 'trum', {
      ten: 'Trùm: Đội cứu hộ bè nổi',
      huyHieu: { ma: 'day-keo', ten: 'Huy hiệu Tay dây phao kéo' },
      nhipTheo: 'tong',
      deBai: 'Đưa cả 2 chiếc bè B và cụm lục bình L vào đúng các bến q trên cả hai sân. Ở mỗi nhánh dọc, xuồng kéo vật nổi về mũi, xoay vào bến q trên bờ kênh, tháo dây rồi tiến sang vị trí kế tiếp.',
      veMaMau: 'Viết chương trình tổng quát chạy đúng trên cả 2 sân.',
      san: [
        [
          '.q..q..',
          '~~B~~L~',
          '.......'
        ],
        [
          '.q..q..',
          '~~L~~B~',
          '###....'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        'for i in range(2):',
        '    tow()',
        '    wait()',
        '    turn_left()',
        '    drop_tow()',
        '    wait()',
        '    turn_right()',
        '    forward(3)'
      ]),
      loiSai: [
        { moTa: 'Chỉ xử lý 1 vật nổi đầu tiên mà không lặp 2 lần', baiLam: bai(['tow()', 'wait()', 'turn_left()', 'drop_tow()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên drop_tow() trước khi rẽ phải đi tiếp: vật đầu tiên bị xoay ra khỏi bến q', baiLam: bai(['for i in range(2):', '    tow()', '    wait()', '    turn_left()', '    turn_right()', '    forward(3)']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] },
        { moTa: 'Bước chuyển nhánh dùng forward(2) thay vì forward(3): xuồng dừng ở cột 3 lệch bến thứ hai ở cột 4', baiLam: bai(['for i in range(2):', '    tow()', '    wait()', '    turn_left()', '    drop_tow()', '    wait()', '    turn_right()', '    forward(2)']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] }
      ],
      sao: { o: 17, nhip: 18 },
      goiY: [
        'Xuồng xuất phát ở (1, 1) ngay dưới bến q đầu tiên (1, 0). Khi tow(), wait() kéo vật từ (2, 1) về (2, 1) rồi turn_left(), vật xoay lên đúng (1, 0)!',
        'Sau khi drop_tow(), wait() và turn_right(), gọi forward(3) để xuồng từ (1, 1) tới (4, 1) ngay dưới bến thứ hai (4, 0).'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: bo-co-dinh — Bộ cố định hai phần (10 màn, Python B: tuple)
       ====================================================================== */
    manBoCoDinh(1, 'lam-quen', {
      ten: 'Bộ hai số cố định và hàm tow_grab',
      taoHam: ['tow_grab'],
      deBai: 'Trong Python, một bộ cố định (tuple) viết trong ngoặc tròn như p = (2, 3) giữ một cặp giá trị không đổi; ta lấy phần tử đầu bằng p[0] và phần tử sau bằng p[1]. Hãy tạo hàm tow_grab() trong Xưởng hàm gồm 2 dòng tow() và wait() để quăng dây kéo bè gọn trong 1 lệnh, rồi chạy chương trình dùng cặp bước p = (2, 3).',
      veMaMau: 'Tạo hàm tow_grab() không tham số gồm tow() và wait(). Chương trình chính đã dùng p[0] và p[1].',
      san: [
        '........',
        '~~~~B~q.',
        '........'
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'forward(p[1])']),
      loiGiai: bai(
        ['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'forward(p[1])'],
        [],
        [ham('tow_grab', ['tow()', 'wait()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_grab trong Xưởng hàm', baiLam: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'forward(p[1])']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong tow_grab() chỉ viết wait() mà quên gọi tow(): xuồng tiến tới húc vào bè B', baiLam: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'forward(p[1])']), hamCuaEmMoi: [ham('tow_grab', ['wait()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Dùng p[0] cho cả hai đoạn: đoạn sau chỉ đẩy bè 2 ô thay vì 3 ô', baiLam: bai(['p = (2, 3)', 'forward(p[0])', 'tow_grab()', 'forward(p[0])']), hamCuaEmMoi: [ham('tow_grab', ['tow()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 11, nhip: 6 },
      goiY: [
        'Mở Xưởng hàm, tạo hàm tow_grab() có 2 dòng: tow() và wait().',
        'Với p = (2, 3), p[0] là 2 (tiến tới gần bè) và p[1] là 3 (đẩy bè vào bến q).'
      ]
    }),

    manBoCoDinh(2, 'lam-quen', {
      ten: 'Gỡ cặp giá trị và hàm tow_drop',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab'],
      taoHam: ['tow_drop'],
      deBai: 'Thay vì viết p[0], p[1], Python cho phép gỡ cặp trực tiếp: a, b = (2, 3) sẽ gán a = 2 và b = 3 cùng lúc. Hãy tạo hàm tow_drop() gồm 2 dòng drop_tow() và wait() để tháo dây phao gọn trong 1 lệnh, rồi dùng a, b = (2, 3) đưa 2 chiếc bè vào 2 bến q.',
      veMaMau: 'Tạo hàm tow_drop() gồm drop_tow() và wait(). Chương trình chính gỡ cặp a, b = (2, 3).',
      san: [
        '.q..q..',
        '~~B~~B~',
        '.......'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'a, b = (1, 3)',
        'tow_grab()',
        'turn_left()',
        'tow_drop()',
        'turn_right()',
        'forward(b)',
        'tow_grab()',
        'turn_left()'
      ]),
      loiGiai: bai(
        [
          'a, b = (1, 3)',
          'tow_grab()',
          'turn_left()',
          'tow_drop()',
          'turn_right()',
          'forward(b)',
          'tow_grab()',
          'turn_left()'
        ],
        [],
        [ham('tow_drop', ['drop_tow()', 'wait()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_drop', baiLam: bai(['a, b = (1, 3)', 'tow_grab()', 'turn_left()', 'tow_drop()', 'turn_right()', 'forward(b)', 'tow_grab()', 'turn_left()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong tow_drop() gọi tow() thay vì drop_tow(): báo lỗi đang kéo bè', baiLam: bai(['a, b = (1, 3)', 'tow_grab()', 'turn_left()', 'tow_drop()', 'turn_right()', 'forward(b)', 'tow_grab()', 'turn_left()']), hamCuaEmMoi: [ham('tow_drop', ['tow()', 'wait()'])], phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Dùng forward(a) thay vì forward(b) khi chuyển nhánh: xuồng chỉ tiến 1 ô thay vì 3 ô', baiLam: bai(['a, b = (1, 3)', 'tow_grab()', 'turn_left()', 'tow_drop()', 'turn_right()', 'forward(a)', 'tow_grab()', 'turn_left()']), hamCuaEmMoi: [ham('tow_drop', ['drop_tow()', 'wait()'])], phaiCoMa: ['mui-vuong', 'chua-dua-vat'] }
      ],
      sao: { o: 21, nhip: 9 },
      goiY: [
        'Tạo hàm tow_drop() trong Xưởng hàm với 2 dòng: drop_tow() và wait().',
        'Khi a, b = (1, 3), biến b nhận giá trị 3 để đưa xuồng từ cột 1 sang cột 4.'
      ]
    }),

    manBoCoDinh(3, 'lam-quen', {
      ten: 'Hàm kéo lùi pull_back',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop'],
      taoHam: ['pull_back'],
      deBai: 'Nhiều khi xuồng cần quăng dây nắm lấy bè phía trước rồi lùi thẳng n ô để kéo bè về sau. Hãy tạo hàm pull_back(n) gồm: gọi tow_grab(), rồi lặp n lần lệnh back(). Sau đó dùng cặp bước a, b = (2, 3) để tiến a ô tới (3, 1), rồi kéo lùi bè b ô về đúng bến q ở (1, 1).',
      veMaMau: 'Tạo hàm pull_back(n) gọi tow_grab() rồi lặp n lần back().',
      san: [
        '........',
        '~q~~~~B~',
        '........'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'a, b = (2, 3)',
        'forward(a)',
        'pull_back(b)'
      ]),
      loiGiai: bai(
        [
          'a, b = (2, 3)',
          'forward(a)',
          'pull_back(b)'
        ],
        [],
        [ham('pull_back', ['tow_grab()', 'for i in range(n):', '    back()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm pull_back', baiLam: bai(['a, b = (2, 3)', 'forward(a)', 'pull_back(b)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pull_back(n) quên gọi tow_grab() trước khi lùi: xuồng chỉ lùi một mình, bỏ lại bè B', baiLam: bai(['a, b = (2, 3)', 'forward(a)', 'pull_back(b)']), hamCuaEmMoi: [ham('pull_back', ['for i in range(n):', '    back()'], ['n'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Truyền a (bằng 2) thay vì b (bằng 3) vào pull_back: bè dừng ở (2, 1), cách bến q 1 ô', baiLam: bai(['a, b = (2, 3)', 'forward(a)', 'pull_back(a)']), hamCuaEmMoi: [ham('pull_back', ['tow_grab()', 'for i in range(n):', '    back()'], ['n'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 16, nhip: 6 },
      goiY: [
        'Thân hàm pull_back(n) viết: tow_grab(), dòng dưới là for i in range(n):, thụt lề back().',
        'Xuồng tiến a = 2 ô từ (1, 1) lên (3, 1), rồi pull_back(3) kéo bè từ (6, 1) về (4, 1) và lùi 3 bước đưa bè về bến q ở (1, 1).'
      ]
    }),

    manBoCoDinh(4, 'lam-quen', {
      ten: 'Duyệt qua từng phần tử của bộ cố định',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back'],
      deBai: 'Vòng lặp for cũng duyệt trực tiếp qua từng phần tử của một tuple: với steps = (1, 2), viết for a in steps: thì vòng đầu a = 1, vòng hai a = 2. Ở mỗi nhánh dọc (cột 2 và cột 5), hãy rẽ phải, tiến a ô xuống nhánh, gọi pull_back(a) để kéo bè lùi về bến q ở hàng 2, rồi tháo dây, rẽ trái và tiến 3 ô sang nhánh tiếp theo.',
      veMaMau: 'Trong vòng lặp for a in steps:, sau pull_back(a) hãy tháo dây, rẽ trái và tiến 3 ô.',
      san: [
        '.......',
        '~~~~~~~',
        '..q..q.',
        '..~..~.',
        '..~..~.',
        '..B..~.',
        '.....B.'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'steps = (1, 2)',
        'for a in steps:',
        '    turn_right()',
        '    forward(a)',
        '    pull_back(a)'
      ]),
      loiGiai: bai([
        'steps = (1, 2)',
        'for a in steps:',
        '    turn_right()',
        '    forward(a)',
        '    pull_back(a)',
        '    tow_drop()',
        '    turn_left()',
        '    forward(3)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: chưa thả dây và chưa rẽ trái sang nhánh thứ hai', baiLam: bai(['steps = (1, 2)', 'for a in steps:', '    turn_right()', '    forward(a)', '    pull_back(a)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Quên gọi tow_drop() sau pull_back(a): khi rẽ trái ở ngã ba bè đầu bị xoay theo lên bờ', baiLam: bai(['steps = (1, 2)', 'for a in steps:', '    turn_right()', '    forward(a)', '    pull_back(a)', '    turn_left()', '    forward(3)']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] },
        { moTa: 'Cuối vòng lặp dùng forward(2) thay vì forward(3): xuồng dừng ở cột 4 thay vì cột 5', baiLam: bai(['steps = (1, 2)', 'for a in steps:', '    turn_right()', '    forward(a)', '    pull_back(a)', '    tow_drop()', '    turn_left()', '    forward(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 27, nhip: 15 },
      goiY: [
        'Sau pull_back(a), xuồng đã lùi về hàng 1 và bè đã nằm đúng trên bến q ở hàng 2: hãy gọi tow_drop() để tháo dây.',
        'Tiếp theo gọi turn_left() và forward(3) để đi dọc hàng 1 từ cột 2 sang nhánh thứ hai ở cột 5.'
      ]
    }),

    manBoCoDinh(5, 'luyen', {
      ten: 'Hàm trả về bộ hai phần pair_step',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop'],
      taoHam: ['pair_step'],
      deBai: 'Một hàm có thể trả về một tuple gồm 2 giá trị bằng lệnh return d, n + 1, và nơi gọi gỡ cặp ngay bằng h, m = pair_step("R", 2). Hãy tạo hàm pair_step(d, n): nếu d == "R" thì turn_right() ngược lại turn_left(), sau đó forward(n), rồi return d, n + 1.',
      veMaMau: 'Tạo hàm pair_step(d, n) thực hiện rẽ theo d, tiến n ô và trả về cặp d, n + 1.',
      san: [
        '~~~....',
        '..~....',
        '..~~~Bq'
      ],
      batDau: { x: 2, y: 0, huong: 1 },
      maMau: bai([
        'h, m = pair_step("R", 2)',
        'turn_left()',
        'tow_grab()',
        'forward(m)'
      ]),
      loiGiai: bai(
        [
          'h, m = pair_step("R", 2)',
          'turn_left()',
          'tow_grab()',
          'forward(m)'
        ],
        [],
        [ham('pair_step', [
          'if d == "R":',
          '    turn_right()',
          'else:',
          '    turn_left()',
          'forward(n)',
          'return d, n + 1'
        ], ['d', 'n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm pair_step', baiLam: bai(['h, m = pair_step("R", 2)', 'turn_left()', 'tow_grab()', 'forward(m)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong pair_step chỉ return n + 1 thay vì cặp d, n + 1: lệnh gỡ cặp h, m = ... báo lỗi vì không phải bộ 2 phần', baiLam: bai(['h, m = pair_step("R", 2)', 'turn_left()', 'tow_grab()', 'forward(m)']), hamCuaEmMoi: [ham('pair_step', ['if d == "R":', '    turn_right()', 'else:', '    turn_left()', 'forward(n)', 'return n + 1'], ['d', 'n'])], phaiCoMa: ['loi-chay'] },
        { moTa: 'Trả về d, n thay vì d, n + 1: m bằng 2 nên đẩy bè thiếu 1 ô tới bến q', baiLam: bai(['h, m = pair_step("R", 2)', 'turn_left()', 'tow_grab()', 'forward(m)']), hamCuaEmMoi: [ham('pair_step', ['if d == "R":', '    turn_right()', 'else:', '    turn_left()', 'forward(n)', 'return d, n'], ['d', 'n'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 21, nhip: 8 },
      goiY: [
        'Trong pair_step(d, n): kiểm tra if d == "R": turn_right() else: turn_left(), rồi forward(n) và return d, n + 1.',
        'Khi gọi pair_step("R", 2), xuồng rẽ phải tiến 2 ô xuống (2, 2) và trả về ("R", 3) nên m = 3.'
      ]
    }),

    manBoCoDinh(6, 'luyen', {
      ten: 'Sửa hàm trả về cặp fix_pair_tow',
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pair_step'],
      deBai: 'Chương trình chính đã khóa và gọi s, d = fix_pair_tow(1, 2) để tiến 1 ô, quăng dây kéo bè, đẩy bè 2 ô vào bến q đầu tiên, tháo dây và nhận về cặp a + b, b. Nhưng hàm fix_pair_tow(a, b) của màn đang quên gọi tow_drop() và trả về sai phần tử đầu. Hãy sửa lại hàm fix_pair_tow(a, b).',
      veMaMau: 'Chương trình chính đã khóa. Hãy sửa hàm fix_pair_tow(a, b) để tháo dây bằng tow_drop() và return a + b, b.',
      san: [
        '......',
        '~~B~q.',
        '..~...',
        '..~...',
        '..B...',
        '..q...'
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(
        [
          's, d = fix_pair_tow(1, 2)',
          'back()',
          'turn_right()',
          'tow_grab()',
          'forward(s)'
        ],
        [ham('fix_pair_tow', ['forward(a)', 'tow_grab()', 'forward(b)', 'return a, b'], ['a', 'b'])]
      ),
      loiGiai: bai(
        [
          's, d = fix_pair_tow(1, 2)',
          'back()',
          'turn_right()',
          'tow_grab()',
          'forward(s)'
        ],
        [ham('fix_pair_tow', ['forward(a)', 'tow_grab()', 'forward(b)', 'tow_drop()', 'return a + b, b'], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: thiếu tow_drop() nên khi lùi kéo bè đầu rời khỏi bến q', baiLam: bai(['s, d = fix_pair_tow(1, 2)', 'back()', 'turn_right()', 'tow_grab()', 'forward(s)'], [ham('fix_pair_tow', ['forward(a)', 'tow_grab()', 'forward(b)', 'return a, b'], ['a', 'b'])]), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Đã thêm tow_drop() nhưng quên sửa return a, b thành return a + b, b: s chỉ bằng 1 nên đẩy bè thứ hai thiếu 2 ô', baiLam: bai(['s, d = fix_pair_tow(1, 2)', 'back()', 'turn_right()', 'tow_grab()', 'forward(s)'], [ham('fix_pair_tow', ['forward(a)', 'tow_grab()', 'forward(b)', 'tow_drop()', 'return a, b'], ['a', 'b'])]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 11 },
      goiY: [
        'Thêm dòng tow_drop() ngay sau forward(b) trong hàm fix_pair_tow(a, b).',
        'Sửa dòng cuối của fix_pair_tow thành return a + b, b để s = 3, đẩy bè thứ hai từ (2, 2) tới bến (2, 5).'
      ]
    }),

    manBoCoDinh(7, 'luyen', {
      ten: 'So sánh hai bộ cố định',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pair_step'],
      deBai: 'Trong Python, hai tuple được so sánh lần lượt từ phần tử đầu tiên: (3, 1) > (2, 5) là đúng vì 3 > 2; nếu phần tử đầu bằng nhau thì mới so tới phần tử thứ hai. Hàm max(p1, p2) cũng chọn bộ lớn hơn theo đúng quy tắc đó. Hãy dùng a, b = max((2, 1), (2, 3)) để lấy cặp bước lớn hơn và đưa bè vào bến.',
      veMaMau: 'Dùng a, b = max((2, 1), (2, 3)) để lấy a = 2 và b = 3.',
      san: [
        '........',
        '~~~~B~q.',
        '........'
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai([
        'a, b = max((2, 1), (2, 3))',
        'forward(a)',
        'tow_grab()'
      ]),
      loiGiai: bai([
        'a, b = max((2, 1), (2, 3))',
        'forward(a)',
        'tow_grab()',
        'forward(b)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới kéo bè về mũi, chưa đẩy bè đi b ô', baiLam: bai(['a, b = max((2, 1), (2, 3))', 'forward(a)', 'tow_grab()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng min thay vì max: b nhận 1 thay vì 3 nên đẩy bè thiếu 2 ô', baiLam: bai(['a, b = min((2, 1), (2, 3))', 'forward(a)', 'tow_grab()', 'forward(b)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đẩy bè bằng forward(a) thay vì forward(b): mới đi 2 ô, thiếu 1 ô tới bến q', baiLam: bai(['a, b = max((2, 1), (2, 3))', 'forward(a)', 'tow_grab()', 'forward(a)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 11, nhip: 6 },
      goiY: [
        'Hai bộ (2, 1) và (2, 3) có cùng phần tử đầu là 2, nên max chọn (2, 3) vì 3 > 1.',
        'Thêm dòng forward(b) ở cuối chương trình để đẩy bè 3 ô vào bến q.'
      ]
    }),

    manBoCoDinh(8, 'thu-thach', {
      ten: 'Tạo hàm kéo cặp bước tow_pair',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop'],
      taoHam: ['tow_pair'],
      deBai: 'Hãy đóng gói quy trình tiến tiếp cận, kéo bè, đẩy vào bến và tháo dây thành hàm tow_pair(a, b) trong Xưởng hàm: tiến a ô bằng forward(a), gọi tow_grab(), tiến b ô bằng forward(b), gọi tow_drop(), rồi return a + b, b. Chương trình chính sẽ gọi s, d = tow_pair(1, 2) để xử lý bè đầu và dùng s, d cho bè thứ hai.',
      veMaMau: 'Tạo hàm tow_pair(a, b) gồm forward(a), tow_grab(), forward(b), tow_drop() và return a + b, b.',
      san: [
        '......',
        '~~B~q.',
        '..~...',
        '..~...',
        '..B...',
        '..q...'
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai([
        's, d = tow_pair(1, 2)',
        'back()',
        'turn_right()',
        'tow_pair(1, d)'
      ]),
      loiGiai: bai(
        [
          's, d = tow_pair(1, 2)',
          'back()',
          'turn_right()',
          'tow_pair(1, d)'
        ],
        [],
        [ham('tow_pair', [
          'forward(a)',
          'tow_grab()',
          'forward(b)',
          'tow_drop()',
          'return a + b, b'
        ], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_pair', baiLam: bai(['s, d = tow_pair(1, 2)', 'back()', 'turn_right()', 'tow_pair(1, d)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong tow_pair quên gọi tow_drop(): khi back() ở dòng 2 kéo bè đầu rời khỏi bến (4, 1)', baiLam: bai(['s, d = tow_pair(1, 2)', 'back()', 'turn_right()', 'tow_pair(1, d)']), hamCuaEmMoi: [ham('tow_pair', ['forward(a)', 'tow_grab()', 'forward(b)', 'return a + b, b'], ['a', 'b'])], phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Trong tow_pair trả về a, a thay vì a + b, b: d bằng 1 nên bè thứ hai chỉ được đẩy 1 ô thay vì 2 ô', baiLam: bai(['s, d = tow_pair(1, 2)', 'back()', 'turn_right()', 'tow_pair(1, d)']), hamCuaEmMoi: [ham('tow_pair', ['forward(a)', 'tow_grab()', 'forward(b)', 'tow_drop()', 'return a, a'], ['a', 'b'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 23, nhip: 11 },
      goiY: [
        'Thân hàm tow_pair(a, b) gồm 5 dòng: forward(a), tow_grab(), forward(b), tow_drop(), return a + b, b.',
        'Sau tow_pair(1, 2), xuồng ở (3, 1), bè đầu đã thả ở (4, 1), và d = 2.'
      ]
    }),

    manBoCoDinh(9, 'thu-thach', {
      ten: 'Chuỗi hải trình cặp lệnh',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair'],
      deBai: 'Kết hợp các hàm đã chế tow_pair(a, b), pair_step(d, n) và pull_back(n) để giải cứu 2 chiếc bè: chiếc đầu đẩy xuôi vào bến (4, 1), sau đó xuồng lùi 1 ô, dùng pair_step("R", 2) xuống nhánh dưới và dùng pull_back kéo chiếc bè thứ hai lùi về bến q ở (2, 2).',
      veMaMau: 'Kết hợp s, d = tow_pair(1, 2), back(), pair_step("R", d) và pull_back(d).',
      san: [
        '......',
        '~~B~q.',
        '..q...',
        '..~...',
        '..~...',
        '..B...'
      ],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai([
        's, d = tow_pair(1, 2)',
        'back()'
      ]),
      loiGiai: bai([
        's, d = tow_pair(1, 2)',
        'back()',
        'h, m = pair_step("R", d)',
        'pull_back(d)'
      ]),
      loiSai: [
        { moTa: 'Để nguyên mã mẫu: mới đưa được bè đầu tiên vào bến (4, 1)', baiLam: bai(['s, d = tow_pair(1, 2)', 'back()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi back() trước pair_step("R", d): xuồng rẽ phải ở (3, 1) đâm vào bờ', baiLam: bai(['s, d = tow_pair(1, 2)', 'h, m = pair_step("R", d)', 'pull_back(d)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi pull_back(1) thay vì pull_back(d): bè thứ hai mới lùi tới (2, 3), chưa tới bến (2, 2)', baiLam: bai(['s, d = tow_pair(1, 2)', 'back()', 'h, m = pair_step("R", d)', 'pull_back(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 32, nhip: 12 },
      goiY: [
        's, d = tow_pair(1, 2) đưa bè đầu vào (4, 1), xuồng ở (3, 1) và trả về d = 2.',
        'Gọi back() về ngã ba (2, 1), rồi h, m = pair_step("R", d) để rẽ phải tiến 2 ô xuống (2, 3), cuối cùng pull_back(d) kéo bè từ (2, 5) về bến (2, 2).'
      ]
    }),

    manBoCoDinh(10, 'trum', {
      ten: 'Trùm: Hải đồ cặp tọa độ',
      huyHieu: { ma: 'bo-co-dinh', ten: 'Huy hiệu Bộ cố định tuple' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'back', 'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair'],
      nhipTheo: 'tong',
      deBai: 'Trên cả hai sân, hãy dùng s, d = tow_pair(1, 2) để đưa vật nổi đầu tiên vào bến (4, 1), lùi 1 ô về ngã ba (2, 1), gọi h, m = pair_step("R", d) để xuống nhánh dọc rồi đẩy tiếp vật nổi thứ hai vào bến cuối kênh bằng tow_pair(1, d).',
      veMaMau: 'Kết hợp tow_pair, back và pair_step với các biến gỡ cặp từ tuple trả về.',
      san: [
        [
          '......',
          '~~B~q.',
          '..~...',
          '..~...',
          '..~...',
          '..L...',
          '..~...',
          '..q...'
        ],
        [
          '###...',
          '~~L~q.',
          '..~###',
          '..~...',
          '..~...',
          '..B...',
          '..~...',
          '..q...'
        ]
      ],
      batDau: [
        { x: 0, y: 1, huong: 1 },
        { x: 0, y: 1, huong: 1 }
      ],
      maMau: bai([]),
      loiGiai: bai([
        's, d = tow_pair(1, 2)',
        'back()',
        'h, m = pair_step("R", d)',
        'tow_pair(1, d)'
      ]),
      loiSai: [
        { moTa: 'Quên gọi back() trước pair_step("R", d): xuồng rẽ ở (3, 1) đâm bờ', baiLam: bai(['s, d = tow_pair(1, 2)', 'h, m = pair_step("R", d)', 'tow_pair(1, d)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Truyền "L" thay vì "R" vào pair_step: xuồng rẽ trái đâm bờ trên', baiLam: bai(['s, d = tow_pair(1, 2)', 'back()', 'h, m = pair_step("L", d)', 'tow_pair(1, d)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Ở đoạn cuối gọi tow_pair(1, 1) thay vì tow_pair(1, d): vật thứ hai dừng trước bến (2, 7) 1 ô', baiLam: bai(['s, d = tow_pair(1, 2)', 'back()', 'h, m = pair_step("R", d)', 'tow_pair(1, 1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 29, nhip: 26 },
      goiY: [
        's, d = tow_pair(1, 2) đưa vật đầu vào bến (4, 1) và trả về d = 2.',
        'Tiếp theo: back(), h, m = pair_step("R", d) đưa xuồng xuống (2, 3), rồi tow_pair(1, d) tiến xuống (2, 4), kéo vật từ (2, 5) và đẩy 2 ô vào bến (2, 7).'
      ]
    })
  ];

  if (M && M.them) M.manDayKeo = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = DS;
})();
