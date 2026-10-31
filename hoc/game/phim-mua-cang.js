/* ============================================================================
   phim-mua-cang.js — PHIM MỞ GÓI MÙA CẢNG SÔNG (CẦN CẨU CONTAINER, GÓI 1-4).
   Nạp sau phim-goi.js: gọi PhimGoi.dangKy(ma, khungs) cho từng gói mới.
   ========================================================================== */
(function () {
  'use strict';
  var PG = (typeof window !== 'undefined' && window.PhimGoi) || null;
  if (!PG || typeof PG.dangKy !== 'function') return;
  var B = PG._dung;
  var h = B.h, nen = B.nen, san = B.san, dat = B.dat, veO = B.veO, veV = B.veV, may = B.may, chu = B.chu, code = B.code, hen = B.hen;

  var CAU_CO_BAN = { than: 'cau', tay: null, camBien: [] };
  var CAU_MOC = { than: 'cau', tay: 'moc-cau', camBien: [] };
  var CAU_QUET = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };

  function sanCang(m, r, c) {
    var s = san(r, c);
    for (var i = 0; i < r; i++) for (var j = 0; j < c; j++) {
      if (i === 0) dat(s, veO('nuoc', { pha: (i + j) % 2 }), j, i);
      else if (i === r - 1 && (j === 0 || j === c - 1)) dat(s, veO('bai-cang'), j, i);
    }
    m.appendChild(s);
    return s;
  }

  /* ================================================================ 1. can-cau — Quay cần vươn tầm */
  PG.dangKy('can-cau', [
    { Chu: ['Bến cảng sông tấp nập container chờ bốc dỡ.', 'Đội Chấn Hưng dựng CẦN CẨU CẢNG xoay 8 nấc quanh trụ!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        var rb = dat(s, may(CAU_CO_BAN, { nac: 0, tam: 1 }, 0), 2, 1);
        hen(function () {
          rb.remove();
          dat(s, may(CAU_CO_BAN, { nac: 1, tam: 2 }, 0), 2, 1);
        }, 420);
      }
    },
    { Chu: ['swing_left() và swing_right() xoay cần qua 8 nấc quanh trụ.', 'extend() và retract() vươn thu đầu cần từ tầm 1 tới tầm 3.'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, may(CAU_CO_BAN, { nac: 2, tam: 2 }, 0), 2, 1);
        m.appendChild(code('swing_right()\nswing_right()\nextend()'));
      }
    },
    { Chu: ['Hiệu hai nấc d = b - a có thể mang dấu âm khi đích ở bên trái.', 'Dùng abs(d) để lấy số bước dương và điều khiển cần cẩu chính xác!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, may(CAU_CO_BAN, { nac: 6, tam: 2 }, 0), 2, 1);
        m.appendChild(code('d = b - a\nif d < 0:\n    swing_l(abs(d))'));
      }
    }
  ]);

  /* ================================================================ 2. moc-cau — Nhấc container */
  PG.dangKy('moc-cau', [
    { Chu: ['Đầu cần đã lắp MÓC CẨU CONTAINER chắc khỏe.', 'Đưa đầu cần tới chồng hàng để nhấc từng thùng lên cao!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, veO('bai-cang'), 1, 1);
        dat(s, veO('bai-cang'), 3, 1);
        var ct = dat(s, veV('container', { so: 12, mau: 'cam' }, 1.5), 1, 1);
        var rb = dat(s, may(CAU_MOC, { nac: 6, tam: 1, tay: { kep: false, cam: false } }, 0), 2, 1);
        hen(function () {
          ct.remove();
          rb.remove();
          dat(s, may(CAU_MOC, { nac: 6, tam: 1, tay: { kep: true, cam: true } }, 0), 2, 1);
        }, 420);
      }
    },
    { Chu: ['pick_up() nhấc container trên đỉnh chồng ở ô đầu cần.', 'Quay cần sang bãi đích rồi gọi set_down() để hạ hàng xuống.'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, veO('bai-cang'), 1, 1);
        dat(s, veO('bai-cang'), 3, 1);
        dat(s, may(CAU_MOC, { nac: 2, tam: 1, tay: { kep: false, cam: false } }, 0), 2, 1);
        dat(s, veV('container', { so: 12, mau: 'cam' }, 1.5), 3, 1);
        m.appendChild(code('pick_up()\nswing_by(4)\nset_down()'));
      }
    },
    { Chu: ['Phép chia lấy dư (b - a) % 8 giúp tính số nấc xoay phải ngắn gọn.', 'Phép chia nguyên // giúp chia đều chồng container sang hai bãi!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, may(CAU_MOC, { nac: 2, tam: 2, tay: { kep: true, cam: true } }, 0), 2, 1);
        m.appendChild(code('steps = (b - a) % 8\nhalf = n // 2\nrem = n % 2'));
      }
    }
  ]);

  /* ================================================================ 3. quet-ma — Đọc mã số */
  PG.dangKy('quet-ma', [
    { Chu: ['Mỗi container có gắn mã số riêng trên nóc thùng.', 'Lắp ĐẦU ĐỌC MÃ CONTAINER lên đầu cần để quét số tự động!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, veO('bai-cang'), 1, 1);
        dat(s, veV('container', { so: 24, mau: 'lam' }, 1.5), 1, 1);
        dat(s, may(CAU_QUET, { nac: 6, tam: 1, camBien: { bat: true } }, 0), 2, 1);
        hen(function () {
          var b = h('div', 'pg-buble');
          b.appendChild(chu('read_code() = 24', 'pg-nhan-nho'));
          s.appendChild(b);
        }, 380);
      }
    },
    { Chu: ['read_code() trả về mã số container trên đỉnh chồng, hoặc -1 nếu bãi trống.', 'Kết hợp % 2 và // 10 để phân loại hàng chẵn lẻ hoặc theo hàng chục!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, veO('bai-cang'), 1, 1);
        dat(s, veO('bai-cang'), 3, 1);
        dat(s, veV('container', { so: 35, mau: 'tim' }, 1.5), 3, 1);
        dat(s, may(CAU_QUET, { nac: 2, tam: 1, camBien: { bat: true } }, 0), 2, 1);
        m.appendChild(code('while read_code() != -1:\n    c = read_code()\n    pick_up()'));
      }
    }
  ]);

  /* ================================================================ 4. ben-tau — Tàu cập bến */
  PG.dangKy('ben-tau', [
    { Chu: ['Tàu hàng cập bến theo lịch trình và rời bến khi hết nhịp đỗ.', 'Cần cẩu phải canh đúng nhịp tàu đỗ ở ô T để hạ container lên boong!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, veO('boong-tau', { co: true }), 2, 0);
        dat(s, veV('container', { so: 18, mau: 'vang' }, 1.5), 2, 0);
        dat(s, may(CAU_QUET, { nac: 0, tam: 1, camBien: { bat: true } }, 0), 2, 1);
      }
    },
    { Chu: ['Với hàng dễ vỡ có luật tháp, container số nhỏ phải đặt trên số lớn.', 'Dùng bãi phụ làm trung gian để chuyển tháp container an toàn lên tàu!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        dat(s, veO('boong-tau', { co: true }), 1, 0);
        dat(s, veO('boong-tau', { co: true }), 3, 0);
        dat(s, may(CAU_QUET, { nac: 1, tam: 1, tay: { kep: true, cam: true } }, 0), 2, 1);
        m.appendChild(code('wait()\npick_up()\nswing_by(2)\nset_down()'));
      }
    }
  ]);

  /* ================================================================ 5. duong-ray — Đường ray cảng */
  PG.dangKy('duong-ray', [
    { Chu: ['Bãi cảng trải dài nhiều cột, cần cẩu đứng yên không vươn tới hết.', 'Đội Chấn Hưng đặt bệ cẩu lên ĐƯỜNG RAY CẢNG chạy dọc cầu tàu!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        for (var j = 1; j <= 3; j++) dat(s, veO('ray'), j, 1);
        var rb = dat(s, may(CAU_QUET, { nac: 0, tam: 1, camBien: { bat: true } }, 0), 1, 1);
        hen(function () {
          rb.remove();
          dat(s, may(CAU_QUET, { nac: 0, tam: 1, camBien: { bat: true } }, 0), 3, 1);
        }, 420);
      }
    },
    { Chu: ['rail(n) trượt cả bệ cẩu và đầu cần đi n ô dọc theo đường ray.', 'n dương chạy sang phải hoặc xuống dưới; n âm lùi sang trái hoặc lên trên!'],
      ve: function (m) {
        nen(m);
        var s = sanCang(m, 3, 5);
        for (var j = 1; j <= 3; j++) dat(s, veO('ray'), j, 1);
        dat(s, veO('boong-tau', { co: true }), 3, 0);
        dat(s, veV('container', { so: 15, mau: 'cam' }, 1.5), 3, 0);
        dat(s, may(CAU_QUET, { nac: 0, tam: 1, tay: { kep: true, cam: true }, camBien: { bat: true } }, 0), 3, 1);
        m.appendChild(code('pick_up()\nrail(2)\nswing_by(4)\nset_down()'));
      }
    }
  ]);
})();
