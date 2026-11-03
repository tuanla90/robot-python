/* ============================================================================
   bang-ghep.js — "Mật Lệnh Robot": BẢNG GHÉP PART MỘT CHỖ (window.BangGhep / module.exports). Kế hoạch: hoc/KE-HOACH-MUA-9-TO-HOP.md mục 2–3 (user duyệt 3/11).
   Luật ghép thân × tay và thân × cảm biến của CẢ GAME nằm ở đây; lap-rap.js (kiemGhep / apDung) và game/ve-vector.js (kiemGhep, phần part mới) cùng đọc bảng này.
   Lõi san-hoc.js vẫn còn các câu `throw` ghép part theo mùa; máy kiểm hoc/kiem-bang-ghep.mjs chứng minh mọi ô ✔ chạy được trong lõi.

   MÃ PART = mã bộ phận thật của bộ vẽ vector (game/ve-vector-*.js):
     thân  hai-banh · xich · omni · gai · xuong · nhen · drone · cau                                  (8)
     tay   kep · xoay · hoi · nam-cham · moc-cau · day-keo (tay lưới) · son (bộ gieo hạt) · nem · loa   (9: kẹp và kẹp xoay là hai thẻ riêng của lắp ráp)
     não   khoang-cach · hong-ngoai · tu · quet-ma · dong-chay · camera · camera-4 · camera-bay · radar · am-thanh · mau   (11: ba camera là ba thẻ; màu bụng của lắp ráp cũ giữ)

   TRẠNG THÁI mỗi ô:
     'goc'      ●  part gốc của cỗ máy mùa đó (co-may.js)
     'duoc'     ✔  ghép được theo luật ba câu, lõi không chặn (máy kiểm chạy thử từng ô)
     'lai'      ★  tổ hợp lai mới mùa 9, còn phải thêm luật (mã lai L1…L14, mục 4 kế hoạch); kiemGhep trả ok:false ma:'lai-chua-co' cho tới khi gói sau bật cờ MO_LAI[mã] = true
     'khong-mo' ·  ghép được về lý nhưng mùa 9 không mở (giữ bảng chọn nhỏ); kiemGhep trả ok:false ma:'khong-mo'
     'cam'      ✗  không ghép; lý do tiếng Việt cho trẻ theo LUẬT BA CÂU (mục 2):
                   1. đồ "phía trước" (kẹp, kẹp xoay, vòi phun, máy ném, tay lưới, gieo hạt; khoảng cách, hồng ngoại, camera trước, chong chóng) cần thân CÓ MŨI;
                   2. thân KHÔNG MŨI (nhện, drone) dùng đồ "treo bụng" hay "nhìn quanh" (nam châm, gieo hạt, đầu đọc mã; camera bốn hướng / bụng, radar, mic, cảm biến từ); cần cẩu làm mọi việc ở ô dưới đầu cần;
                   3. ba điều cấm VÌ SỨC: drone chở nhẹ (không loa, móc cẩu, vòi phun, máy ném); xuồng không gắn đồ giật (vòi phun, máy ném); chong chóng phải nhúng nước (chỉ xuồng).
                   Ô cũ của lắp ráp 5 × 5 × 5 (drone + kẹp, nhện + kẹp xoay, nhện + khoảng cách…) GIỮ NGUYÊN CÂU BÁO CŨ (màn rap-* và máy kiểm kiem-lap-rap / kiem-rap-nao đang so câu đó).

   API:
     THAN · TAY · CAM_BIEN                 mảng mã theo thứ tự bảng kế hoạch
     NHOM_THAN[than] → mã nhóm; NHOM[nhom] → { ten, mui, bung }   (xe có bánh / xuồng / không mũi / đứng yên) — lời báo sinh từ dữ liệu
     o(than, khe, ma)   → { tt, lai?, lyDo }   khe = 'tay' | 'camBien'; mã lạ → null
     trangThai(than, khe, ma) → tt | null ;  lyDo(than, khe, ma) → chuỗi ('' khi không phải ô cấm)
     kiemGhep(than, tay, camBien)  → { ok, ma: null | 'khe-la' | 'ghep-sai' | 'lai-chua-co' | 'khong-mo', lyDo, xung: ['than', 'tay' | 'camBien'], lai?: 'L3' }
                                     camBien: mã hay [{ ma }] (cấu hình bộ vẽ) hay mảng mã; null / [] = không cảm biến
     dsO(tt?)           → [{ than, khe, ma, tt, lai, lyDo }]  mọi ô (lọc theo trạng thái)
     tongKet()          → { goc, duoc, lai, 'khong-mo', cam, tong }
     laMoi(khe, ma)     → part thêm sau dữ liệu chụp bộ pixel (bộ vẽ chỉ áp bảng cho ô có part mới: câu báo ô cũ của VeVector.kiemGhep phải y như đã chụp)
     MO_LAI             { L1: true… } cờ mở lai (gói B / C bật)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var THAN = ['hai-banh', 'xich', 'omni', 'gai', 'xuong', 'nhen', 'drone', 'cau'];
  var TAY = ['kep', 'xoay', 'hoi', 'nam-cham', 'moc-cau', 'day-keo', 'son', 'nem', 'loa'];
  var CAM_BIEN = ['khoang-cach', 'hong-ngoai', 'tu', 'quet-ma', 'dong-chay', 'camera', 'camera-4', 'camera-bay', 'radar', 'am-thanh', 'mau'];
  var TRANG_THAI = ['goc', 'duoc', 'lai', 'khong-mo', 'cam'];
  var KY_HIEU = { goc: '●', duoc: '✔', lai: '★', 'khong-mo': '·', cam: '✗' };

  var NHOM_THAN = { 'hai-banh': 'banh', xich: 'banh', omni: 'banh', gai: 'banh', xuong: 'xuong', nhen: 'khong-mui', drone: 'khong-mui', cau: 'dung-yen' };
  var NHOM = {
    banh: { ten: 'Xe có bánh', mui: true, bung: false, moTa: 'có mũi, không có bụng treo' },
    xuong: { ten: 'Xuồng', mui: true, bung: false, moTa: 'có mũi xuồng, chỉ đi trên nước' },
    'khong-mui': { ten: 'Không mũi', mui: false, bung: true, moTa: 'đi bốn hướng, có bụng treo' },
    'dung-yen': { ten: 'Đứng yên', mui: false, bung: true, moTa: 'bệ không đi, làm việc ở ô dưới đầu cần' }
  };

  /* part thêm SAU dữ liệu chụp bộ pixel (hoc/du-lieu-chup-pixel.json; kiem-ve-vector.mjs THEM_SAU_CHUP) — VeVector.kiemGhep chỉ áp bảng cho ô có part trong nhóm này */
  var MOI = { than: ['xuong', 'cau', 'gai'], tay: ['day-keo', 'moc-cau', 'loa'], camBien: ['tu', 'camera-4', 'radar', 'dong-chay', 'quet-ma', 'am-thanh'] };

  var MO_LAI = {};                                                                      // gói B / C: MO_LAI.L1 = true khi luật lai đã có trong lõi + hình

  /* ---------------------------------------------------------- câu báo chung */
  var C = {
    mocXe: 'Móc cẩu nặng, phải treo trên đầu cần cẩu, xe không mang được.',
    mocNhen: 'Móc cẩu nặng, phải treo trên đầu cần cẩu, nhện không mang được.',
    chongChong: 'Chong chóng phải nhúng nước, chỉ xuồng mới gắn được.',
    quetMaXe: 'Đầu đọc mã nhìn xuống ô dưới đầu cần, xe có mũi không có chỗ treo.',
    camBay: 'Camera bụng chỉ gắn được lên drone.'                                        // câu cũ (lap-rap 5 × 5 × 5)
  };

  /* ---------------------------------------------------------------- thân × tay */
  // mỗi hàng: mã tay → trạng thái, hoặc { tt, lai, lyDo }. Hàng xe có bánh giống nhau trừ ô gốc.
  function xe(goc) {
    var h = { kep: 'duoc', xoay: 'duoc', hoi: 'duoc', 'nam-cham': 'duoc', 'moc-cau': { tt: 'cam', lyDo: C.mocXe }, 'day-keo': { tt: 'lai', lai: 'L3' }, son: 'duoc', nem: 'duoc', loa: 'duoc' };
    h[goc] = 'goc';
    return h;
  }
  var BANG_TAY = {
    'hai-banh': xe('xoay'),
    xich: xe('hoi'),
    omni: xe('nem'),
    gai: xe('loa'),
    xuong: {
      kep: { tt: 'cam', lyDo: 'Kẹp trên xuồng không với tới mặt nước.' },
      xoay: { tt: 'cam', lyDo: 'Kẹp xoay trên xuồng không với tới mặt nước.' },
      hoi: { tt: 'cam', lyDo: 'Vòi phun giật mạnh, làm xuồng trôi đi.' },
      'nam-cham': { tt: 'cam', lyDo: 'Nam châm không với tới mặt nước, trên sông không có sắt để hút.' },
      'moc-cau': { tt: 'cam', lyDo: 'Móc cẩu nặng, phải treo trên đầu cần cẩu, xuồng không mang được.' },
      'day-keo': 'goc',
      son: { tt: 'cam', lyDo: 'Bộ gieo hạt chấm xuống sàn, dưới xuồng chỉ có nước.' },
      nem: { tt: 'cam', lyDo: 'Máy ném giật mạnh, làm xuồng trôi đi.' },
      loa: { tt: 'lai', lai: 'L5' }
    },
    nhen: {
      kep: 'duoc',
      xoay: { tt: 'cam', lyDo: 'Nhện không có hướng mặt, không gắn tay kẹp xoay.' },        // câu cũ
      hoi: { tt: 'cam', lyDo: 'Nhện không có hướng mặt, không gắn vòi phun.' },             // câu cũ
      'nam-cham': 'goc',
      'moc-cau': { tt: 'cam', lyDo: C.mocNhen },
      'day-keo': { tt: 'cam', lyDo: 'Nhện không có mũi để tung lưới về phía trước.' },
      son: { tt: 'lai', lai: 'L6' },
      nem: { tt: 'cam', lyDo: 'Nhện không có hướng mặt, không gắn máy ném.' },              // câu cũ
      loa: { tt: 'lai', lai: 'L7' }
    },
    drone: {
      kep: { tt: 'cam', lyDo: 'Drone chỉ treo được nam châm dưới bụng, không gắn tay kẹp.' },        // câu cũ
      xoay: { tt: 'cam', lyDo: 'Drone chỉ treo được nam châm dưới bụng, không gắn tay kẹp xoay.' },  // câu cũ
      hoi: { tt: 'cam', lyDo: 'Drone chỉ treo được nam châm dưới bụng, không gắn vòi phun.' },       // câu cũ
      'nam-cham': 'duoc',
      'moc-cau': { tt: 'cam', lyDo: 'Drone chở nhẹ, không mang nổi móc cẩu.' },
      'day-keo': { tt: 'lai', lai: 'L10' },
      son: 'goc',
      nem: { tt: 'cam', lyDo: 'Drone chỉ treo được nam châm dưới bụng, không gắn máy ném.' },        // câu cũ
      loa: { tt: 'cam', lyDo: 'Drone chở nhẹ, không mang nổi loa.' }
    },
    cau: {
      kep: { tt: 'lai', lai: 'L8' },
      xoay: { tt: 'cam', lyDo: 'Cần cẩu không có mũi để xoay tay, đầu cần đã quay được rồi.' },
      hoi: { tt: 'cam', lyDo: 'Vòi phun bắn về phía trước, cần thân có mũi; cần cẩu chỉ làm việc ở ô dưới đầu cần.' },
      'nam-cham': { tt: 'lai', lai: 'L1' },
      'moc-cau': 'goc',
      'day-keo': { tt: 'lai', lai: 'L9' },
      son: { tt: 'cam', lyDo: 'Bộ gieo hạt chấm ô xe đang đi qua; cần cẩu đứng yên một chỗ.' },
      nem: { tt: 'cam', lyDo: 'Máy ném bắn về phía trước, cần thân có mũi; cần cẩu không có mũi.' },
      loa: { tt: 'cam', lyDo: 'Loa hát theo nhịp xe chạy, cần thân có mũi; cần cẩu không có mũi.' }
    }
  };

  /* ----------------------------------------------------------- thân × cảm biến */
  function xeCam(goc) {
    var h = {
      'khoang-cach': 'duoc', 'hong-ngoai': 'duoc', tu: 'duoc',
      'quet-ma': { tt: 'cam', lyDo: C.quetMaXe },
      'dong-chay': { tt: 'cam', lyDo: C.chongChong },
      camera: 'duoc', 'camera-4': 'duoc',
      'camera-bay': { tt: 'cam', lyDo: C.camBay },
      radar: 'duoc', 'am-thanh': 'duoc', mau: 'duoc'
    };
    h[goc] = 'goc';
    return h;
  }
  var BANG_CAM = {
    'hai-banh': xeCam('khoang-cach'),
    xich: xeCam('hong-ngoai'),
    omni: xeCam('radar'),
    gai: xeCam('am-thanh'),
    xuong: {
      'khoang-cach': 'duoc', 'hong-ngoai': 'duoc',
      tu: 'khong-mo',
      'quet-ma': { tt: 'lai', lai: 'L2' },
      'dong-chay': 'goc',
      camera: { tt: 'lai', lai: 'L14' },
      'camera-4': 'khong-mo',
      'camera-bay': { tt: 'cam', lyDo: C.camBay },
      radar: { tt: 'lai', lai: 'L14' },
      'am-thanh': { tt: 'lai', lai: 'L5' },
      mau: 'khong-mo'
    },
    nhen: {
      'khoang-cach': { tt: 'cam', lyDo: 'Nhện không có hướng mặt, không gắn "khoảng cách".' },                 // câu cũ
      'hong-ngoai': { tt: 'cam', lyDo: 'Nhện không có hướng mặt, không gắn cảm biến hồng ngoại.' },
      tu: 'goc',
      'quet-ma': 'khong-mo',
      'dong-chay': { tt: 'cam', lyDo: C.chongChong },
      camera: 'duoc',                                                                                           // ô cũ: màn rap-nao.10 cho nhện + camera trước (lõi cho phép); kế hoạch mục 3b ghi ✗ — xem CÂU HỎI báo cáo M9A
      'camera-4': { tt: 'lai', lai: 'L12' },
      'camera-bay': { tt: 'cam', lyDo: C.camBay },
      radar: { tt: 'lai', lai: 'L12' },
      'am-thanh': { tt: 'lai', lai: 'L4' },
      mau: 'duoc'
    },
    drone: {
      'khoang-cach': { tt: 'cam', lyDo: 'Drone không có mặt trước để đo hay nhìn phía trước, không gắn "khoảng cách".' },   // câu cũ
      'hong-ngoai': { tt: 'cam', lyDo: 'Drone không có mặt trước để đo phía trước, không gắn cảm biến hồng ngoại.' },
      tu: { tt: 'cam', lyDo: 'Drone không có mặt trước để đo hay nhìn phía trước, không gắn "cảm biến từ".' },           // câu cũ
      'quet-ma': 'khong-mo',
      'dong-chay': { tt: 'cam', lyDo: C.chongChong },
      camera: { tt: 'cam', lyDo: 'Drone không có mặt trước để đo hay nhìn phía trước, không gắn "camera trước".' },      // câu cũ
      'camera-4': 'goc',
      'camera-bay': 'duoc',
      radar: { tt: 'lai', lai: 'L11' },
      'am-thanh': 'khong-mo',
      mau: 'duoc'
    },
    cau: {
      'khoang-cach': { tt: 'cam', lyDo: 'Cảm biến khoảng cách nhìn phía trước, cần thân có mũi; cần cẩu không có mũi.' },
      'hong-ngoai': { tt: 'cam', lyDo: 'Cảm biến hồng ngoại đo phía trước, cần thân có mũi; cần cẩu không có mũi.' },
      tu: { tt: 'lai', lai: 'L13' },
      'quet-ma': 'goc',
      'dong-chay': { tt: 'cam', lyDo: C.chongChong },
      camera: { tt: 'cam', lyDo: 'Camera trước nhìn phía trước, cần thân có mũi; cần cẩu không có mũi.' },
      'camera-4': { tt: 'cam', lyDo: 'Cần cẩu đứng yên, chỉ cần nhìn ô dưới đầu cần, không cần nhìn bốn hướng.' },
      'camera-bay': { tt: 'lai', lai: 'L13' },
      radar: { tt: 'cam', lyDo: 'Radar quét quanh xe đang đi; cần cẩu đứng yên, chỉ nhìn ô dưới đầu cần.' },
      'am-thanh': { tt: 'cam', lyDo: 'Mic nghe trong hang khi xe đi tìm lối; cần cẩu đứng yên một chỗ.' },
      mau: { tt: 'cam', lyDo: 'Cảm biến màu đọc ô dưới bụng xe đang đi; bệ cẩu đứng yên.' }
    }
  };

  /* ------------------------------------------------------------------ tra cứu */
  function bangCua(khe) { return khe === 'tay' ? BANG_TAY : khe === 'camBien' ? BANG_CAM : null; }
  function dsCua(khe) { return khe === 'than' ? THAN : khe === 'tay' ? TAY : khe === 'camBien' ? CAM_BIEN : []; }
  /** Ô (thân, khe, mã) → { tt, lai?, lyDo }; mã lạ → null. */
  function o(than, khe, ma) {
    var b = bangCua(khe), h = b && b[than], x = h && h[ma];
    if (x === undefined) return null;
    if (typeof x === 'string') return { tt: x, lyDo: '' };
    return { tt: x.tt, lai: x.lai || null, lyDo: x.lyDo || (x.tt === 'lai' ? 'Tổ hợp lai ' + x.lai + ' chưa mở ở mùa này.' : x.tt === 'khong-mo' ? 'Ghép được, nhưng mùa này chưa mở.' : '') };
  }
  /** CHỈ cho máy kiểm (kiem-bang-ghep.mjs mục f: tự chứng minh bắt được lỗi): đổi một ô trong bộ nhớ, trả ô cũ để đặt lại. Không ghi tệp. */
  function dat(than, khe, ma, oMoi) {
    var b = bangCua(khe); if (!b || !b[than] || b[than][ma] === undefined) throw new Error('BangGhep.dat: không có ô ' + than + '/' + khe + '/' + ma);
    var cu = b[than][ma]; b[than][ma] = oMoi; return cu;
  }
  function trangThai(than, khe, ma) { var x = o(than, khe, ma); return x ? x.tt : null; }
  function lyDo(than, khe, ma) { var x = o(than, khe, ma); return x && x.tt === 'cam' ? x.lyDo : ''; }
  function laMoi(khe, ma) { return (MOI[khe] || []).indexOf(ma) >= 0; }

  function maCam(cb) {                                                                  // mã hay [{ ma }] hay [mã] → mảng mã (bỏ 'pin': không phải part)
    if (!cb) return [];
    if (typeof cb === 'string') return [cb];
    return cb.map(function (c) { return typeof c === 'string' ? c : c && c.ma; }).filter(function (m) { return m && m !== 'pin'; });
  }
  function ketQua(x, khe) {
    if (x.tt === 'goc' || x.tt === 'duoc') return null;
    if (x.tt === 'lai') return MO_LAI[x.lai] ? null : { ok: false, ma: 'lai-chua-co', lyDo: 'Tổ hợp lai ' + x.lai + ' chưa mở ở mùa này.', xung: ['than', khe], lai: x.lai };
    if (x.tt === 'khong-mo') return { ok: false, ma: 'khong-mo', lyDo: 'Ghép được, nhưng mùa này chưa mở.', xung: ['than', khe] };
    return { ok: false, ma: 'ghep-sai', lyDo: x.lyDo, xung: ['than', khe] };
  }
  /** Luật ghép một chỗ: thân + (tay | null) + (cảm biến | null). Không xét ngân sách / danh sách màn. */
  function kiemGhep(than, tay, camBien) {
    if (!than || THAN.indexOf(than) < 0) return { ok: false, ma: 'khe-la', lyDo: than ? 'Không có thân "' + than + '".' : 'Chưa chọn thân.', xung: ['than'] };
    if (tay) {
      var xt = o(than, 'tay', tay);
      if (!xt) return { ok: false, ma: 'khe-la', lyDo: 'Không có tay "' + tay + '".', xung: ['tay'] };
      var kt = ketQua(xt, 'tay'); if (kt) return kt;
    }
    var cams = maCam(camBien);
    for (var i = 0; i < cams.length; i++) {
      var xc = o(than, 'camBien', cams[i]);
      if (!xc) return { ok: false, ma: 'khe-la', lyDo: 'Không có cảm biến "' + cams[i] + '".', xung: ['camBien'] };
      var kc = ketQua(xc, 'camBien'); if (kc) return kc;
    }
    return { ok: true, ma: null, lyDo: '', xung: [] };
  }
  /** Mọi ô của bảng (hai mặt), lọc theo trạng thái. */
  function dsO(tt) {
    var kq = [];
    THAN.forEach(function (th) {
      ['tay', 'camBien'].forEach(function (khe) {
        dsCua(khe).forEach(function (ma) {
          var x = o(th, khe, ma);
          if (x && (!tt || x.tt === tt)) kq.push({ than: th, khe: khe, ma: ma, tt: x.tt, lai: x.lai || null, lyDo: x.lyDo });
        });
      });
    });
    return kq;
  }
  function tongKet() {
    var kq = { tong: 0 };
    TRANG_THAI.forEach(function (t) { kq[t] = 0; });
    dsO().forEach(function (x) { kq[x.tt]++; kq.tong++; });
    return kq;
  }
  /** Bảng chữ (một mặt) để in ra máy kiểm / báo cáo. */
  function inBang(khe) {
    var cols = dsCua(khe), dong = ['thân \\ ' + khe + ' | ' + cols.join(' | ')];
    THAN.forEach(function (th) { dong.push(th + ' | ' + cols.map(function (ma) { var x = o(th, khe, ma); return KY_HIEU[x.tt] + (x.lai ? ' ' + x.lai : ''); }).join(' | ')); });
    return dong.join('\n');
  }

  var API = {
    THAN: THAN, TAY: TAY, CAM_BIEN: CAM_BIEN, TRANG_THAI: TRANG_THAI, KY_HIEU: KY_HIEU, NHOM_THAN: NHOM_THAN, NHOM: NHOM, MOI: MOI, MO_LAI: MO_LAI,
    o: o, trangThai: trangThai, lyDo: lyDo, laMoi: laMoi, kiemGhep: kiemGhep, dsO: dsO, tongKet: tongKet, inBang: inBang, dsCua: dsCua, dat: dat
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.BangGhep = API;
})();
