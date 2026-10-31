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
})();
