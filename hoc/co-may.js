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

  /* ---- Mùa 5 Đồng đội (diem10code-python): 4 máy nhà và mã ghép "thân|tay|cảm biến", đều dùng LỆNH HIỆN HÀNH. 8 máy cũ phía trên giữ tên lệnh cũ, các màn hiện tại không dùng. */
  var DI_XE = ['forward', 'backward', 'turn_left', 'turn_right'], DI_BAY = ['go_up', 'go_down', 'go_left', 'go_right'];
  var PART = {
    than: {
      'hai-banh': { ten: 'Xe', loai: 'banh', lenh: DI_XE, moTa: 'Tiến 1 nhịp, quay 2 nhịp. Đứng giữ được nút.', ket: 'Hố và thùng chặn đường.' },
      nhen: { ten: 'Nhện', loai: 'nhen', lenh: DI_BAY, moTa: 'Đi 4 hướng, 2 nhịp một ô, giữ được nút.', ket: 'Hố chặn đường.' },
      xuong: { ten: 'Xuồng', loai: 'xuong', lenh: DI_XE, moTa: 'Chạy trên mặt nước, tiến 1 nhịp, quay 2 nhịp.', ket: 'Không lên được bờ.' },
      drone: { ten: 'Drone', loai: 'drone', lenh: DI_BAY, co: { luoiBay: true }, moTa: 'Bay 4 hướng, 1 nhịp một ô, qua hố, nước và thùng.', ket: 'Tường và cửa chặn, không giữ được nút.' }
    },
    tay: {
      kep: { ten: 'Tay kẹp', lenh: ['pick', 'drop'], moTa: 'Nhặt và đặt thùng.', moTaNhen: 'Nhặt và đặt thùng dưới chân.' },
      'nam-cham': { ten: 'Nam châm', lenh: ['magnet_n', 'magnet_s', 'magnet_off'], moTa: 'Hút thùng sắt, không hút được gỗ.', moTaNhen: 'Hút thùng sắt theo hướng em chọn, không hút được gỗ. Thùng chắn đường.' },
      'day-keo': { ten: 'Lưới', lenh: ['cast_net', 'drop_net'], moTa: 'Bắt vật cách đúng 2 ô.' },
      hoi: { ten: 'Vòi phun', lenh: ['spray', 'seed'], moTa: 'Phun nước và gieo hạt.' }
    },
    cam: {
      'khoang-cach': { ten: 'Cảm biến khoảng cách', o: 'hong', lenh: ['front_clear', 'left_clear', 'right_clear'], moTa: 'Biết đường có trống không.' },
      tu: { ten: 'Cảm biến từ', o: 'hong', lenh: ['front_metal', 'front_pole'], moTa: 'Biết phía trước có sắt không.' },
      camera: { ten: 'Camera', o: 'tren', lenh: ['color'], moTa: 'Đọc màu ô đang đứng.' },
      'hong-ngoai': { ten: 'Hồng ngoại', o: 'tren', lenh: ['warm'], moTa: 'Đo độ ấm ô đang đứng.' }
    }
  };
  /** Cặp part đã gặp trong 4 mùa đầu: mùa 5 chỉ cho ghép các cặp này. */
  var GHEP = {
    'hai-banh': { tay: ['kep'], cam: ['khoang-cach'] },
    nhen: { tay: ['kep', 'nam-cham'], cam: ['khoang-cach', 'tu'] },
    xuong: { tay: ['nam-cham', 'day-keo'], cam: ['tu', 'camera'] },
    drone: { tay: ['day-keo', 'hoi'], cam: ['camera', 'hong-ngoai'] }
  };
  /** Mã của 4 máy nhà: bảng chọn xe của cột 3. */
  var MAY_NHA = { XE: 'hai-banh|kep|khoang-cach', NHEN: 'nhen|kep|khoang-cach', XUONG: 'xuong|day-keo|camera', DRONE: 'drone|day-keo|camera' };
  /** Tách mã thành { than, tay, cam } (mã 4 máy nhà hay mã ghép); không đúng bảng ghép thì null. */
  function tachMa(ma) {
    var p = String(MAY_NHA[ma] || ma).split('|');
    if (p.length !== 3) return null;
    var g = GHEP[p[0]];
    if (!g || g.tay.indexOf(p[1]) < 0 || g.cam.indexOf(p[2]) < 0) return null;
    return { than: p[0], tay: p[1], cam: p[2] };
  }
  function laMa(ma) { return !!DS[ma] || !!tachMa(ma); }
  /** Thông tin hiện lên giao diện của một mã: { ten, than, tay, cam, lenh, moTa, ket }. */
  function thongTin(ma) {
    if (DS[ma]) return { ten: DS[ma].ten, moTa: DS[ma].gioi, ket: DS[ma].ket, lenh: DS[ma].hamGoc };
    var c = tachMa(ma); if (!c) return null;
    var th = PART.than[c.than], ty = PART.tay[c.tay], ca = PART.cam[c.cam];
    var tayNhen = c.than === 'nhen' && ty.moTaNhen;
    return { ten: th.ten, than: c.than, tay: c.tay, cam: c.cam, moTa: c.than === 'nhen' && c.tay === 'kep' ? th.moTa + ' Trèo qua thùng.' : th.moTa, ket: th.ket, lenh: th.lenh.concat(ty.lenh, ca.lenh, ['wait']), moTaTay: tayNhen || ty.moTa, moTaCam: ca.moTa, tenTay: ty.ten, tenCam: ca.ten };
  }
  /** Bảng chọn của một màn lắp part: mọi mã ghép hợp lệ từ các khe { than, tay, cam }. */
  function menuLap(khe) {
    var kq = [];
    khe.than.forEach(function (th) { khe.tay.forEach(function (ty) { khe.cam.forEach(function (ca) { var m = th + '|' + ty + '|' + ca; if (tachMa(m)) kq.push(m); }); }); });
    return kq;
  }
  function sao(o) { return JSON.parse(JSON.stringify(o)); }
  /** Cấu hình robot của màn cho cỗ máy `ma` (như R_XICH / R1_CAU… trong man-cuu-*.js). */
  function dung(ma, t) {
    t = t || {};
    var ghep = !DS[ma] && tachMa(ma);
    if (ghep) {
      var pt = PART.than[ghep.than], pc = PART.cam[ghep.cam], kqg = { loaiRobot: pt.loai };
      Object.assign(kqg, pt.co || {}, t.co || {});
      kqg.robot = { than: ghep.than, tay: ghep.tay, camBien: [{ ma: ghep.cam, o: pc.o }] };
      if (t.son) kqg.robot.son = t.son;
      kqg.hamGoc = pt.lenh.concat(PART.tay[ghep.tay].lenh, pc.lenh, ['wait']);
      if (t.batDau) kqg.batDau = sao(t.batDau);
      return kqg;
    }
    var d = DS[ma]; if (!d) throw new Error('CoMay.dung: không có cỗ máy "' + ma + '".');
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

  var API = { DS: DS, THU_TU: THU_TU, dung: dung, cuaThan: cuaThan, laGoc: laGoc, PART: PART, GHEP: GHEP, MAY_NHA: MAY_NHA, tachMa: tachMa, laMa: laMa, thongTin: thongTin, menuLap: menuLap };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.CoMay = API;
})();
