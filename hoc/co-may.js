/* ============================================================================
   co-may.js — "Mật Lệnh Robot": TÁM BỘ CỖ MÁY (window.CoMay / module.exports). Kế hoạch: hoc/KE-HOACH-MUA-9-TO-HOP.md mục 5a (user duyệt 3/11).
   Mỗi cỗ máy = thân + tay + cảm biến + cờ nâng cấp + hamGoc, ĐÚNG bộ đang chạy trong các màn mùa 9 (hoc/man-cuu-*.js: R1_KHO, R_XICH, R_NHEN, R1_CAU, R1_XUONG, R_DRONE, R_OMNI, R_GAI)
   và gói 10 các mùa. Gói M9A chỉ gom về một chỗ; các tệp màn CHƯA đổi sang dùng tệp này (gói D).

   API:
     DS                { CH: {…}, CU, PL, CC, XU, DR, KT, HD }   mỗi bộ { ma, ten, noi, mua, than, tay, camBien: [{ ma, o, … }], loaiRobot, co: { cờ nâng cấp }, hamGoc, gioi, ket }
     THU_TU            ['CH', 'CU', 'PL', 'CC', 'XU', 'DR', 'KT', 'HD']
     dung(ma, tuyChon) → cấu hình robot cho màn: { loaiRobot, …cờ, robot: { than, tay, camBien, son? }, hamGoc, batDau?, pin? }
                         tuyChon: { son: 'lam' (R2 hồng Luna; mặc định R1 xanh Sola), batDau, pin (drone), co: { cờ thêm / bớt } }
     cuaThan(than)     → mã cỗ máy có thân đó (null nếu không)
     laGoc(than, khe, ma) → part này là part gốc của cỗ máy thân đó (bang-ghep.js ô ● phải khớp)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];

  var DS = {
    CH: {
      ma: 'CH', ten: 'Xe chở hàng', noi: 'Kho hàng', mua: 1, loaiRobot: 'banh',
      than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], co: {},
      hamGoc: BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']),
      gioi: 'mang thùng gỗ, đè nút', ket: 'hố, nước, thùng nặng, bùn trơn, băng chuyền'
    },
    CU: {
      ma: 'CU', ten: 'Xe cứu hỏa', noi: 'Nhà máy', mua: 2, loaiRobot: 'xich',
      than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], co: { xichDay: true, lucBan: true },
      hamGoc: BANH.concat(['spray', 'spray_back', 'distance', 'warm']),
      gioi: 'ủi thùng nặng, đứng vững trên băng chuyền, phun van từ xa, đo nhiệt', ket: 'hố, nước, bùn trơn, gầm thấp'
    },
    PL: {
      ma: 'PL', ten: 'Robot phân loại', noi: 'Bãi tái chế', mua: 3, loaiRobot: 'nhen',
      than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], co: {},
      hamGoc: BAY.concat(['crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole']),
      gioi: 'nhảy hố, chui gầm, hút sắt, đệm từ', ket: 'nước, thùng nặng, không mang được đồ gỗ'
    },
    CC: {
      ma: 'CC', ten: 'Cần cẩu', noi: 'Cảng sông', mua: 4, loaiRobot: 'cau',
      than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }], co: {},
      hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'],   // rail: bệ phải xuất phát trên ô ray R
      gioi: 'nhấc container qua tường / nước, đọc số', ket: 'ngoài tầm cần 3 ô; không đi (trừ ray), không đè nút'
    },
    XU: {
      ma: 'XU', ten: 'Xuồng thủy lợi', noi: 'Bến sông', mua: 5, loaiRobot: 'xuong',
      than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], co: { chinhLuoi: true },
      hamGoc: BANH.concat(['cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor', 'set_length', 'flow']),
      gioi: 'đi nước, kéo bè, ghép cầu phao, gạt van cống', ket: 'mọi ô bờ'
    },
    DR: {
      ma: 'DR', ten: 'Drone nông nghiệp', noi: 'Nông trại', mua: 6, loaiRobot: 'drone',
      than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }], co: {},
      hamGoc: BAY.concat(['ink', 'dot', 'pen_down', 'pen_up', 'color', 'land', 'take_off']),                       // + battery khi màn khai pin (dung())
      gioi: 'bay qua mọi thứ, gieo / rắc cát, đọc màu', ket: 'pin ít; không đè nút, không đẩy, không nhấc'
    },
    KT: {
      ma: 'KT', ten: 'Máy khai thác', noi: 'Mỏ đá', mua: 7, loaiRobot: 'omni',
      than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], co: { omniCheo: true, chinhLuc: true, nhanDang: true, tamNemMacDinh: 2, daLapHo: true },
      hamGoc: BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']),
      gioi: 'trượt ngang, đi chéo, ném vật qua rào, lăn đá lấp hố, biết đá tròn / vuông', ket: 'nước, bùn trơn'
    },
    HD: {
      ma: 'HD', ten: 'Xe hang động', noi: 'Hang động', mua: 8, loaiRobot: 'gai',
      than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }], co: { thuGai: true, phatNot: true, phanAm: true },
      hamGoc: BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']),
      gioi: 'bám bùn trơn, phá đá chuông, nghe chuông đá', ket: 'hố, nước'
    }
  };
  var THU_TU = ['CH', 'CU', 'PL', 'CC', 'XU', 'DR', 'KT', 'HD'];

  function sao(o) { return JSON.parse(JSON.stringify(o)); }
  /** Cấu hình robot của màn cho cỗ máy `ma` (như R_XICH / R1_CAU… trong man-cuu-*.js). */
  function dung(ma, t) {
    var d = DS[ma]; if (!d) throw new Error('CoMay.dung: không có cỗ máy "' + ma + '".');
    t = t || {};
    var kq = { loaiRobot: d.loaiRobot };
    var co = Object.assign({}, d.co, t.co || {});
    Object.keys(co).forEach(function (k) { if (co[k] !== false && co[k] !== undefined) kq[k] = co[k]; });
    kq.robot = { than: d.than, tay: d.tay, camBien: sao(d.camBien) };
    if (t.son) kq.robot.son = t.son;
    kq.hamGoc = d.hamGoc.slice();
    if (d.than === 'drone' && t.pin !== undefined && t.pin !== null) {
      kq.pin = t.pin;
      if (kq.hamGoc.indexOf('battery') < 0) kq.hamGoc.push('battery');
    }
    if (t.batDau) kq.batDau = sao(t.batDau);
    return kq;
  }
  function cuaThan(than) {
    for (var i = 0; i < THU_TU.length; i++) if (DS[THU_TU[i]].than === than) return THU_TU[i];
    return null;
  }
  function laGoc(than, khe, ma) {
    var m = cuaThan(than), d = m && DS[m];
    if (!d) return false;
    if (khe === 'tay') return d.tay === ma;
    if (khe === 'camBien') return d.camBien.some(function (c) { return c.ma === ma; });
    return false;
  }

  var API = { DS: DS, THU_TU: THU_TU, dung: dung, cuaThan: cuaThan, laGoc: laGoc };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.CoMay = API;
})();
