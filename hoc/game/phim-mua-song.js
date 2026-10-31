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

  /* ================================================================ 2. day-keo — Quăng dây kéo bè */
  PG.dangKy('day-keo', [
    { Chu: ['Trên mặt sông có những chiếc bè hàng và đám lục bình nổi.', 'Lắp DÂY PHAO KÉO ở mũi xuồng để quăng dây móc vật nổi!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan'), 4, 1);
        dat(s, veV('be-go', { keo: false }), 2, 1);
        var rb = dat(s, may(XUONG_KEO, { chay: false }, 1), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, may(XUONG_KEO, { chay: true, tay: { day: true } }, 1), 1, 1);
        }, 420);
      }
    },
    { Chu: ['Gọi tow() kèm wait() để buộc vật trước mũi; tiến tới là đẩy vật đi trước, lùi là kéo vật theo.', 'Đưa bè vào bến nhận hàng rồi gọi drop_tow() kèm wait() để cởi dây!'],
      ve: function (m) {
        nen(m);
        var s = sanSong(m, 3, 5);
        dat(s, veO('ben-nhan', { xong: true }), 4, 1);
        dat(s, veV('be-go', { keo: true }), 4, 1);
        dat(s, may(XUONG_KEO, { chay: true, tay: { giu: true } }, 1), 3, 1);
        m.appendChild(code('tow()\nwait()\nforward(2)\ndrop_tow()\nwait()'));
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
})();
