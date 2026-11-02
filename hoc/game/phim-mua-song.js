/* ============================================================================
   phim-mua-song.js — PHIM MỞ GÓI MÙA BẾN SÔNG (TÀU THỦY LỢI R1, GÓI 1-4).
   Nạp sau phim-goi.js: gọi PhimGoi.dangKy(ma, khungs) cho từng gói mới.
   ========================================================================== */
(function () {
  'use strict';
  var PG = (typeof window !== 'undefined' && window.PhimGoi) || null;
  if (!PG || typeof PG.dangKy !== 'function') return;
  var B = PG._dung;
  var nen = B.nen, san = B.san, dat = B.dat, veO = B.veO, veV = B.veV, may = B.may, code = B.code, hen = B.hen;

  var XUONG_CO_BAN = { than: 'xuong', tay: null, camBien: [] };
  var XUONG_KEO = { than: 'xuong', tay: 'day-keo', camBien: [] };
  var XUONG_DONG = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };

  function sanSong(m, r, c) {
    var s = san(r, c);
    for (var i = 0; i < r; i++) for (var j = 0; j < c; j++) {
      if (i === 1) dat(s, veO('nuoc', { le: (i + j) % 2 }), j, i);
    }
    m.appendChild(s);
    return s;
  }

  /* ================================================================ 1. xuong — Lướt sóng ra khơi */
  PG.dangKy('xuong', [
    { Chu: ['Bến sông rộng mở với những luồng nước dẫn vào đồng ruộng.', 'Đội Chấn Hưng hạ thủy XUỒNG CHÂN VỊT lướt sóng ra khơi!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('phao-dich'), 4, 1);
        var rb = dat(s, may(XUONG_CO_BAN, { chay: false }, 1), 0, 1);
        hen(function () {
          rb.remove();
          dat(s, may(XUONG_CO_BAN, { chay: true }, 1), 2, 1);
        }, 420);
      }
    },
    { Chu: ['Hai chân vịt trái phải nhận cùng lệnh như xe hai bánh.', 'Các hàm move(), turn_left(), turn_right(), back() dùng lại ngay!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_CO_BAN, { chay: true }, 1), 3, 1);
        m.appendChild(code('left_move()\nright_move()\nwait()'));
      }
    },
    { Chu: ['Từ khóa return gửi kết quả tính được từ hàm ra ngoài.', 'Hứng kết quả vào biến d rồi gọi forward(d) để đi đúng chặng!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_CO_BAN, { chay: true }, 1), 4, 1);
        m.appendChild(code('def span_dist(a, b):\n    d = a + b\n    forward(d)\n    return d'));
      }
    }
  ]);

  /* ================================================================ 2. day-keo — Tung lưới bắt bè */
  PG.dangKy('day-keo', [
    { Chu: ['Trên mặt sông có những chiếc bè hàng và đám lục bình nổi.', 'Lắp TAY LƯỚI THỦY LỢI ở mũi xuồng để tung lưới bắt vật nổi cách 2 ô!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan'), 4, 1);
        dat(s, veV('be-go', { keo: false }), 2, 1);
        var rb = dat(s, may(XUONG_KEO, { chay: false }, 1), 0, 1);
        hen(function () {
          rb.remove();
          dat(s, may(XUONG_KEO, { chay: true, tay: { day: true } }, 1), 0, 1);
        }, 420);
      }
    },
    { Chu: ['Gọi cast_net(d) kèm wait() để tung lưới ra 4 phía ("front", "back", "left", "right"); khi xuồng chạy, dây lưới kéo vật lướt theo sau.', 'Đưa bè vào đúng ô bến nhận hàng rồi gọi drop_net() kèm wait() để mở lưới!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 2, 1);
        dat(s, veV('be-go', { keo: true }), 2, 1);
        dat(s, may(XUONG_KEO, { chay: true, tay: { giu: true } }, 1), 4, 1);
        m.appendChild(code('cast_net("back")\nwait()\nforward(2)\ndrop_net()\nwait()'));
      }
    },
    { Chu: ['Bộ cố định (tuple) gói hai số trong ngoặc tròn như p = (2, 1).', 'Đọc p[0], p[1] hoặc tách a, b = p để điều khiển hai chặng gọn gàng!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 4, 1);
        dat(s, veV('be-go', { keo: false }), 4, 1);
        dat(s, may(XUONG_KEO, { chay: true }, 1), 3, 1);
        m.appendChild(code('p = (2, 1)\na, b = p\ntow_pair(p)'));
      }
    }
  ]);

  /* ================================================================ 3. dong-chay — Đo hướng nước chảy */
  PG.dangKy('dong-chay', [
    { Chu: ['Khúc sông phía trước có những luồng nước chảy xuôi và chảy ngược.', 'Gắn CHONG CHÓNG DÒNG CHẢY ở mũi xuồng để đo chiều nước trước khi tiến!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 1 }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        var rb = dat(s, may(XUONG_DONG, { chay: false }, 1), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Hàm flow_dir() đọc chiều nước ở ô trước mũi: "front", "back", "left", "right" hoặc "none".', 'Bước vào ô dòng xuôi "front" sức 1 giúp xuồng tiến 1 ô rồi trôi thêm 1 ô!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 1 }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 3, 1);
        m.appendChild(code('if flow_dir() == "front":\n    move()\nelse:\n    forward(2)'));
      }
    },
    { Chu: ['Chế các hàm is_calm_front(), flow_step(), scan_calm_side() để tự lựa luồng êm.', 'Dù dòng chảy đổi chỗ giữa các ngày, một chương trình vẫn về đích gọn gàng!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 1 }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 4, 1);
        m.appendChild(code('def is_calm_front():\n    return flow_dir() == "none"'));
      }
    }
  ]);

  /* ================================================================ 4. cong-thuy-loi — Mở cống dẫn nước */
  PG.dangKy('cong-thuy-loi', [
    { Chu: ['Trên kênh dẫn có những cánh CỐNG THỦY LỢI đóng kín chắn ngang luồng nước.', 'Quay mũi xuồng về phía VAN CỐNG trên bờ rồi quăng dây kéo để gạt van!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('van-cong', { bat: false }), 1, 0);
        dat(s, veO('cong-thuy-loi', { mo: false }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        var rb = dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 0), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, veO('van-cong', { bat: true }), 1, 0);
          dat(s, veO('cong-thuy-loi', { mo: true }), 2, 1);
          dat(s, may(XUONG_DONG, { chay: true, tay: { day: true }, camBien: { bat: true } }, 0), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Mỗi lần gạt van bằng tow_grab() sẽ đảo trạng thái cống và dòng chảy nối cùng dây.', 'Cống mở thông luồng hoặc tắt dòng chảy xiết để xuồng và bè đi qua an toàn!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('van-cong', { bat: true }), 1, 0);
        dat(s, veO('cong-thuy-loi', { mo: true }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 3, 1);
        m.appendChild(code('turn_left()\ntow_grab()\nturn_right()\nforward(3)'));
      }
    },
    { Chu: ['Chế các hàm flip_valve(), open_gate_pass(), shut_stream_tow() để điều tiết dòng nước.', 'Phối hợp mở cống, tắt dòng xiết và kéo bè về bến gọn gàng!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('van-cong', { bat: true }), 1, 0);
        dat(s, veO('cong-thuy-loi', { mo: true }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 4, 1);
        m.appendChild(code('def open_gate_pass(n):\n    flip_valve()\n    forward(n)'));
      }
    }
  ]);

  /* ================================================================ 5. tha-neo — Mỏ neo chống trôi */
  PG.dangKy('tha-neo', [
    { Chu: ['Giữa dòng nước xiết, xuồng cần đứng yên chờ bè gỗ trôi vào tầm dây kéo.', 'Nâng cấp thân xuồng với MỎ NEO CHỐNG TRÔI để bám chặt đáy sông!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 3 }), 1, 1);
        dat(s, veO('dong-nuoc', { huong: 3 }), 3, 1);
        dat(s, veV('be-go', { keo: false }), 3, 1);
        var rb = dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, may(XUONG_DONG, { neo: true, camBien: { bat: true } }, 1), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Gọi anchor() kèm wait() để thả neo giữ xuồng đứng yên trên dòng chảy.', 'Khi đã móc được bè, nhớ gọi unanchor() kèm wait() để nhổ neo trước khi chạy chân vịt!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 3 }), 1, 1);
        dat(s, veV('be-go', { keo: true }), 2, 1);
        dat(s, may(XUONG_DONG, { neo: true, tay: { day: true }, camBien: { bat: true } }, 1), 1, 1);
        m.appendChild(code('anchor()\nwait()\ntow_grab()\nunanchor()\nwait()'));
      }
    },
    { Chu: ['Chế các hàm drop_anchor(), lift_anchor(), anchor_tow() và hold_and_valve(n).', 'Giữ nhịp chuẩn xác giữa dòng xiết để giải cứu mọi bè hàng!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 4, 1);
        dat(s, veV('be-go', { keo: false }), 4, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 3, 1);
        m.appendChild(code('def anchor_tow():\n    drop_anchor()\n    tow_grab()\n    lift_anchor()'));
      }
    }
  ]);

  /* ================================================================ 6. buoc-duoi — Cuộn dây chỉnh lưới */
  PG.dangKy('buoc-duoi', [
    { Chu: ['Ở những khúc kênh hẹp hay bến sát góc bờ, dây lưới cố định 2 ô chưa đủ linh hoạt.', 'Nâng cấp CUỘN DÂY CHỈNH LƯỚI để thu ngắn, thả dài dây từ 1..3 ô hoặc kéo bè gọn vào khoang (0)!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veV('be-go', { keo: true }), 3, 1);
        var rb = dat(s, may(XUONG_DONG, { chay: true, tay: { day: true }, camBien: { bat: true } }, 1), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, veV('be-go', { keo: true }), 2, 1);
          dat(s, may(XUONG_DONG, { chay: true, tay: { giu: true }, camBien: { bat: true } }, 1), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Gọi set_length(n) kèm wait() để đặt độ dài dây lưới: n = 0 kéo bè về khoang tàu, n = 1..3 đặt số ô dây dưới nước.', 'Khi bè đã ở đúng ô bến hoặc nhánh dòng chảy, gọi drop_net() kèm wait() để mở lưới!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 2, 1);
        dat(s, veV('be-go', { keo: true }), 2, 1);
        dat(s, may(XUONG_DONG, { chay: true, tay: { giu: true }, camBien: { bat: true } }, 1), 3, 1);
        m.appendChild(code('set_length(1)\nwait()\ndrop_net()\nwait()'));
      }
    },
    { Chu: ['Chế các hàm tether_grab(), tether_drop(), tow_to_tail(), tug_corner() và deliver_tail().', 'Thu thả dây lưới mượt mà qua mọi khúc cua gấp trên bến sông!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 3, 1);
        dat(s, veV('be-go', { keo: false }), 3, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 4, 1);
        m.appendChild(code('def tug_corner(d, n):\n    tow_to_tail()\n    pair_step(d, n)'));
      }
    }
  ]);

  /* ================================================================ 7. suc-nuoc — Đo sức nước chảy */
  PG.dangKy('suc-nuoc', [
    { Chu: ['Trên sông có những luồng nước chảy êm sức 1 và những thác ghềnh chảy xiết sức 2.', 'Nâng cấp CHONG CHÓNG ĐO SỨC NƯỚC để biết chính xác dòng đẩy mạnh bao nhiêu!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 1, suc: 2 }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        var rb = dat(s, may(XUONG_DONG, { chay: false }, 1), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Lệnh flow() trả về bộ đôi (huong, suc) gồm hướng chảy và sức đẩy 0, 1 hoặc 2.', 'Kết hợp hàm min(a, b) và max(a, b) để so sánh hai nhánh sông và chọn luồng êm nhất!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 1, suc: 2 }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 3, 1);
        m.appendChild(code('h, s = flow()\nforward(6 - s)'));
      }
    },
    { Chu: ['Chế các hàm flow_power(), calmer_power(), faster_power(), turn_to_calmer() và best_branch(n).', 'Lựa nhánh sông an toàn nhất để lai dắt bè hàng về bến!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('dong-nuoc', { huong: 1, suc: 1 }), 2, 1);
        dat(s, veO('phao-dich'), 4, 1);
        dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 4, 1);
        m.appendChild(code('def flow_power():\n    h, s = flow()\n    return s'));
      }
    }
  ]);

  /* ================================================================ 8. ben-cu — Bến sông cũ */
  PG.dangKy('ben-cu', [
    { Chu: ['Khu bến sông cũ còn sót lại hàng rào =, hố cạn u và thùng nặng H dọc hai bờ.', 'Xuồng R1 đã đủ trọn bộ đồ nghề: dây phao mũi, dây đuôi, mỏ neo và chong chóng đo sức nước!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('van-cong', { bat: false }), 1, 0);
        dat(s, veO('cong-thuy-loi', { mo: false }), 2, 1);
        dat(s, veV('be-go', { keo: false }), 4, 1);
        var rb = dat(s, may(XUONG_DONG, { chay: false, camBien: { bat: true } }, 1), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, veO('van-cong', { bat: true }), 1, 0);
          dat(s, veO('cong-thuy-loi', { mo: true }), 2, 1);
          dat(s, may(XUONG_DONG, { chay: true, tay: { day: true }, camBien: { bat: true } }, 1), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Kiểm tra flow_power() > 0 trước khi gạt van để không làm đóng sập cống đang mở sẵn.', 'Kết hợp mỏ neo, dây đuôi và đọc sức nước để cứu hộ bè hàng qua mọi khúc kênh cổ!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 1, 1);
        dat(s, veO('cong-thuy-loi', { mo: true }), 2, 1);
        dat(s, veV('be-go', { keo: true }), 1, 1);
        dat(s, may(XUONG_DONG, { chay: true, tay: { giu: true }, camBien: { bat: true } }, 1), 2, 1);
        m.appendChild(code('def calm_gate_pass(n):\n    if flow_power() > 0:\n        flip_valve()\n    forward(n)'));
      }
    }
  ]);

  /* ================================================================ 9. doi-xuong — Đội xuồng và xe */
  PG.dangKy('doi-xuong', [
    { Chu: ['Xuồng thủy lợi R1 của Sola dưới lòng kênh phối hợp với xe hai bánh R2 của Luna trên bờ.', 'Khi R1 kéo bè gỗ về nằm yên trên mặt nước êm q, chiếc bè trở thành CẦU PHAO nối liền hai bờ!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: false }), 2, 1);
        dat(s, veV('be-go', { keo: false }), 4, 1);
        var rb1 = dat(s, may(XUONG_DONG, { chay: true, camBien: { bat: true } }, 1), 2, 1);
        dat(s, may({ than: 'hai-banh', tay: 'kep', son: 'lam' }, { chay: false }, 2), 2, 0);
        hen(function () {
          rb1.remove();
          dat(s, veO('ben-nhan', { xong: true }), 2, 1);
          dat(s, veV('be-go', { keo: true }), 2, 1);
          dat(s, may(XUONG_DONG, { chay: false, camBien: { bat: true } }, 1), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Chế hàm bridge_lay(n), cross_and_pick(n), ferry_drop(n) và sync_dock_pass(t, n) để đồng bộ nhịp cầu.', 'R1 bắc cầu phao đúng nhịp, R2 lăn bánh qua sông lấy kiện hàng về đích!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 2, 1);
        dat(s, veV('be-go', { keo: false }), 2, 1);
        dat(s, may(XUONG_DONG, { chay: false, camBien: { bat: true } }, 1), 1, 1);
        dat(s, may({ than: 'hai-banh', tay: 'kep', son: 'lam' }, { chay: true }, 2), 2, 1);
        m.appendChild(code('def bridge_lay(n):\n    pull_back(n)\n    tow_drop()'));
      }
    }
  ]);

  /* ================================================================ 10. tong-hop-song — Xuồng thủy lợi R1 */
  PG.dangKy('tong-hop-song', [
    { Chu: ['Xuồng thủy lợi R1 hoàn thiện hội tụ đủ chân vịt, dây phao kéo mũi, dây dắt đuôi, mỏ neo và chong chóng đo dòng chảy.', 'Trên nhiều sân liên tiếp, R1 tự đọc flow() để mở cống, lựa dòng êm và cứu hộ bè hàng!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veV('van-cong', { bat: false }), 1, 0);
        dat(s, veO('cong-thuy-loi', { mo: false }), 2, 1);
        dat(s, veO('ben-nhan', { xong: false }), 3, 1);
        dat(s, veV('be-go', { keo: false }), 4, 1);
        var rb = dat(s, may(XUONG_DONG, { chay: true, tay: { day: true }, camBien: { bat: true } }, 0), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, veV('van-cong', { bat: true }), 1, 0);
          dat(s, veO('cong-thuy-loi', { mo: true }), 2, 1);
          dat(s, may(XUONG_DONG, { chay: true, tay: { day: true }, camBien: { bat: true } }, 1), 3, 1);
        }, 420);
      }
    },
    { Chu: ['Chế các hàm tổng lực river_span_pass(a, b), calm_tug_run(d, n), anchor_gate_tow(t, n) và master_river_dock(a, b, n).', 'Hoàn thành cả hai chương cuối trên nhiều sân liên tiếp để giành Huy hiệu Trùm mùa Bến sông!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('cong-thuy-loi', { mo: true }), 2, 1);
        dat(s, veO('ben-nhan', { xong: true }), 3, 1);
        dat(s, veV('be-go', { keo: true }), 3, 1);
        dat(s, may(XUONG_DONG, { chay: true, tay: { giu: true }, camBien: { bat: true } }, 1), 2, 1);
        m.appendChild(code('def master_river_dock(a, b, n):\n    river_span_pass(a, b)\n    bridge_lay(n)'));
      }
    }
  ]);
})();
