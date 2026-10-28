/* ve-vector-ky-hieu.js — BẢNG NỐI ký hiệu sân / ô pixel / vật → hình vector (gói V2). Không vẽ gì: chỉ nói mỗi thứ của game dùng hình nào trong kho VeVector.
   Dùng ở: san-ve.js (ảnh nhỏ sân thuSan ở chế độ vector vẽ từng ô theo KY_HIEU; vật theo vatCua), máy kiểm hoc/kiem-ve-vector.mjs (mọi ký hiệu SanHoc.docSan
   nhận, mọi tên ô của bộ pixel cũ (bảng TILES), mọi hàm vẽ trực tiếp cũ của san-ve.js (VE_TRUC_TIEP) đều có ở đây và trỏ tới hình đã đăng ký (V7c2: bộ pixel đã xoá, bảng là dữ liệu)), trang xem hoc/hinh-mau/xem-vector.html.
   KY_HIEU[ký hiệu] = { o: [[mã ô, trạng thái], …] (vẽ lần lượt, lớp dưới trước), vat: [[mã vật, trạng thái]] (vật nằm sẵn trên ô) }. Trạng thái ở đây là lúc ĐẦU màn
   (băng chạy pha 0, cửa đóng / mở theo C / c…); trên sân thật san-ve.js tính trạng thái theo vết. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var SAN = ['san'];
  var KY_HIEU = {
    '.': { o: [SAN] },
    '#': { o: [['tuong']] },
    'F': { o: [SAN, ['co']] },
    'o': { o: [SAN], vat: [['thung-go']] },
    'D': { o: [SAN, ['dich', { kieu: 'trong' }]] },
    'X': { o: [SAN, ['dich', { kieu: 'day' }]], vat: [['thung-go']] },
    'H': { o: [SAN], vat: [['thung-nang']] },
    'h': { o: [SAN, ['dich', { kieu: 'day' }]], vat: [['thung-nang']] },
    'N': { o: [['nut-ban', {}]] },
    'M': { o: [SAN, ['nut-de', {}]] },
    '@': { o: [SAN, ['ban-xoay', { chieu: 1, pha: 0 }]] },
    '%': { o: [SAN, ['ban-xoay', { chieu: -1, pha: 0 }]] },
    '1': { o: [SAN, ['cong', { so: '1', pha: 0 }]] },
    '2': { o: [SAN, ['cong', { so: '2', pha: 0 }]] },
    'C': { o: [SAN, ['cua', { k: 0, doc: true }]] },
    'c': { o: [SAN, ['cua', { k: 1, doc: true }]] },
    'P': { o: [SAN, ['sac', { pha: 0 }]] },
    'n': { o: [['gam', {}]] },
    'u': { o: [['ho']] },
    'S': { o: [['bac-thang']] },
    '=': { o: [SAN, ['rao', { mask: 0 }]] },
    'r': { o: [['san-mau', { mau: 'red' }]] }, 'g': { o: [['san-mau', { mau: 'green' }]] }, 'b': { o: [['san-mau', { mau: 'blue' }]] }, 'y': { o: [['san-mau', { mau: 'yellow' }]] },
    '^': { o: [['bang', { huong: 0, pha: 0 }]] }, '>': { o: [['bang', { huong: 1, pha: 0 }]] }, 'v': { o: [['bang', { huong: 2, pha: 0 }]] }, '<': { o: [['bang', { huong: 3, pha: 0 }]] }
  };
  /** Tên ô của bộ pixel cũ (Ve.tiles, đã xoá ở V7c2) → hình vector thay nó (phim-vector / máy kiểm còn gọi theo tên cũ). */
  var TILES = {
    rug: 'san', pad: 'san', wall: 'tuong', flags: 'co', mau: 'san-mau', stair: 'bac-thang', ho: 'ho', gam: 'gam', gamMai: 'gam', sac: 'sac', rao: 'rao', nut: 'nut-ban', nutDe: 'nut-de',
    banXoay: 'ban-xoay', cong: 'cong', crate: 'thung-go', crateMau: 'thung-go', sat: 'khoi-sat', satMau: 'khoi-sat', thung: 'thung-nang'
  };
  /** Hàm vẽ TRỰC TIẾP cũ của san-ve.js (Ve.make* / Ve.ve*, đã xoá ở V7c2) → hình vector thay; Field.* phải có trong san-ve.js. */
  var VE_TRUC_TIEP = {
    'Ve.makeConv': ['o', 'bang'], 'Ve.veCua': ['o', 'cua'], 'Ve.makeVatNho': ['vat', 'thung-go', 'khoi-sat', 'nam-cham'],
    'Field.veDichTrong': ['o', 'dich'], 'Field.veDichDay': ['o', 'dich'], 'Field.veBangTat': ['o', 'bang'], 'Field.veMaiGam': ['o', 'gam'], 'Field.veBong': ['vat', 'bong'], 'Field.veThung': ['vat', 'thung-nang']
  };
  /** Icon sân trong Ve.ico (ve.js HINH) dùng ở Xưởng hàm (xuong-ham.js, ngoài phạm vi V2): hình vector tương ứng để gói giao diện (V5) thay khi cần. */
  var ICON_SAN = { box: 'thung-go', mau: 'san-mau', rao: 'rao', wall: 'tuong', nutban: 'nut-ban', sac: 'sac', thung: 'thung-nang', bac: 'bac-thang', gam: 'gam', ho: 'ho', bang: 'bang', cua: 'cua' };
  /** Vật của lõi (o: { chat 'go' | 'sat' | 'nam-cham', mau, cuc }) → [mã vật, trạng thái]. Nam châm thiếu cực vẽ như thùng gỗ (như bộ pixel makeVatNho). */
  function vatCua(o) {
    o = o || {};
    if (o.chat === 'nam-cham' && (o.cuc === 'N' || o.cuc === 'S')) return ['nam-cham', { cuc: o.cuc }];
    if (o.chat === 'sat') return ['khoi-sat', o.mau ? { mau: o.mau } : {}];
    return ['thung-go', o.mau ? { mau: o.mau } : {}];
  }
  V.KY_HIEU = KY_HIEU; V.TILES = TILES; V.VE_TRUC_TIEP = VE_TRUC_TIEP; V.ICON_SAN = ICON_SAN; V.vatCua = vatCua;
})(typeof window !== 'undefined' ? window : globalThis);
