/* ============================================================================
   kiem-mua-cang.mjs — máy kiểm LÕI CẢNG SÔNG (mùa 4, hoc/KE-HOACH-MUA-CANG-SONG.md mục 3; luật ở san-hoc.js phần CẢNG SÔNG). Chưa có màn: mọi sân dựng tạm trong máy kiểm.
   Mỗi luật ít nhất một ca đạt + một ca sai:
     1. Ký hiệu T (boong tàu) / R (ray), lớp cfg.chong / tau / giao / taiToiDa / luatThap, lỗi cấu hình tiếng Việt.
     2. Quay cần: 8 nấc hai chiều, mod 8, đầu cần đúng véc-tơ nấc (chéo = (±tam, ±tam)), quay qua tường / chồng / robot không bị chặn, mỗi lệnh một nhịp.
     3. Vươn / thu: tầm 1–3; quá 3, dưới 1, đầu cần ra ngoài sân → can-het-tam (mất nhịp); container treo đi theo đầu cần.
     4. Móc: pick_up trên cùng / moc-hut / dang-treo; pick_up2 giữ thứ tự / moc-thieu; set_down lên đỉnh chồng / khong-treo; ha-bi-chan (tường, nước, ray, tàu vắng, chồng 4, robot khác).
     5. Máy quét mã: read_code số / −1; weight treo / đầu cần / đôi cộng / 0; không tốn nhịp.
     6. Luật tải cfg.taiToiDa: qua-tai ở pick_up / pick_up2 (không nhấc) và ở extend (không vươn).
     7. Ray: rail(n) tốn abs(n) nhịp, ± theo ray ngang / dọc, het-ray (hết ray, robot), container treo đi theo, bệ không trên ray thì lỗi cấu hình, n sai → lỗi chạy ray-sai, ray đứt / gãy → lỗi cấu hình.
     8. Tàu: có mặt theo chu kỳ (co, vang, pha), tau-roi giao container trên boong, boong trống lượt sau, tau-cap; container treo trên T không rơi; giao-tau thắng; giao-nham thua sớm.
     9. bongMo.chong thắng / không thắng (ô không khai có chồng); luatThap → thap-sai.
    10. Bài số học: (b - a) % 8 với số âm, rail(dich - x), abs — nhân + lõi ăn khớp.
    11. Vết nhịp / kết quả: robot.nac / tam / dau / treo / doi, mucVet.chong / tau, kết quả chong / chongBanDau / tau / daGiao / ray; màn cũ (xe bánh) không đổi.
    12. Nhiều robot: bệ cẩu chiếm ô như tường với xe; xe đi qua ray như sàn; rail bị xe chặn; đầu cần không chặn ai.
    13. cham.js đưa lớp mới xuống SanHoc.chay; lời chẩn đoán cho các sự kiện mới; so-lenh / kho-ham đủ tên.
   Chạy: node hoc/kiem-mua-cang.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const sks = (r) => r.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien);
const co = (r, ma) => sks(r).some((e) => e.ma === ma);
const dem = (r, ma) => sks(r).filter((e) => e.ma === ma).length;
const sk1 = (r, ma) => sks(r).find((e) => e.ma === ma) || null;
const skAll = (r, ma) => sks(r).filter((e) => e.ma === ma);
const docs = (r) => r.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const nhipVet = (r) => r.vet.filter((e) => e.loai === 'nhip');
const loiCfg = (cfg, code) => { try { SanHoc.chay(cfg, code || 'wait()\n'); return ''; } catch (e) { return e.message; } };
const chongO = (r, x, y) => { const c = r.chong.find((q) => q.x === x && q.y === y); return c ? c.cont.map((k) => k.so) : []; };

const CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail'];
const XE = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
//        x: 012345678
const SAN1 = ['#########',
              '#.......#',    // y1: chồng mặc định ở (4,1) = đầu cần lúc đầu (nấc 0, tầm 1)
              '#..RRR..#',    // y2: bệ cẩu ở (4,2), ray ngang x = 3..5
              '#.......#',    // y3
              '#TT~~~..#',    // y4: tàu 0 = (1,4) (2,4); (2,4) = nấc 5 tầm 2 từ bệ
              '#########'];
const CHONG1 = [{ x: 4, y: 1, cont: [{ so: 12 }, { so: 7, tan: 2 }] }];
const TAU1 = [{ o: [{ x: 1, y: 4 }, { x: 2, y: 4 }], co: 5, vang: 3 }];
const cau = (them) => Object.assign({ loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], san: SAN1, batDau: { x: 4, y: 2 }, chong: CHONG1, tau: TAU1, nhipToiDa: 60 }, them || {});
const chay = (cfg, code) => SanHoc.chay(cfg, code);
const lap = (s, n) => s.repeat(n);

console.log('\n== 1. Ký hiệu sân và cấu hình ==');
{
  const s = SanHoc.docSan(['TR.~']);
  kiem('docSan đọc T là boong (và là nước), R là ray (sàn)', J(s.boong) === J([{ x: 0, y: 0 }]) && J(s.ray) === J([{ x: 1, y: 0 }]) && s.nuoc['0,0'] && !s.nuoc['1,0'] && s.nuoc['3,0'], J(s));
  kiem('T / R không phải ký hiệu lạ; ký hiệu lạ khác vẫn báo', loiCfg({ san: ['?.'], batDau: { x: 1, y: 0 } }).includes('Ký hiệu lạ'));
  kiem('xe cạn đâm T như nước, drone bay qua', SanHoc.lyDoChan(s, 'banh', 0, 0) === 'nuoc' && SanHoc.lyDoChan(s, 'drone', 0, 0) === null && SanHoc.lyDoChan(s, 'banh', 1, 0) === null && SanHoc.lyDoChan(s, 'cau', 1, 0) === null);
  kiem('ô T không thuộc tàu nào: lỗi cấu hình', /không thuộc tàu nào/.test(loiCfg(cau({ tau: undefined }))) && loiCfg(cau()) === '');
  kiem('tàu: ô phải là T, co ≥ 1, vang ≥ 0, pha ≥ 0, một ô không thuộc hai tàu',
    /không phải ô boong/.test(loiCfg(cau({ tau: [{ o: [{ x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }], co: 5, vang: 3 }] }))) && /co/.test(loiCfg(cau({ tau: [{ o: TAU1[0].o, co: 0, vang: 3 }] }))) &&
    /vang/.test(loiCfg(cau({ tau: [{ o: TAU1[0].o, co: 5, vang: -1 }] }))) && /pha/.test(loiCfg(cau({ tau: [{ o: TAU1[0].o, co: 5, vang: 3, pha: 1.5 }] }))) &&
    /hai tàu/.test(loiCfg(cau({ tau: [{ o: [{ x: 1, y: 4 }], co: 5, vang: 3 }, { o: [{ x: 1, y: 4 }, { x: 2, y: 4 }], co: 5, vang: 3 }] }))) && loiCfg(cau({ tau: [{ o: TAU1[0].o, co: 5, vang: 0 }] })) === '');
  kiem('chồng: cao > 4, so ngoài 1–99, tan ngoài 1–4, trên T / ray / nước / tường, trên ô bệ, khai hai lần: lỗi',
    /tối đa 4/.test(loiCfg(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 1 }, { so: 2 }, { so: 3 }, { so: 4 }, { so: 5 }] }] }))) && /so phải/.test(loiCfg(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 100 }] }] }))) &&
    /so phải/.test(loiCfg(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 0 }] }] }))) && /tan phải/.test(loiCfg(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 5, tan: 5 }] }] }))) &&
    /bãi/.test(loiCfg(cau({ chong: [{ x: 2, y: 4, cont: [{ so: 5 }] }] }))) && /bãi/.test(loiCfg(cau({ chong: [{ x: 3, y: 2, cont: [{ so: 5 }] }] }))) && /bãi/.test(loiCfg(cau({ chong: [{ x: 4, y: 4, cont: [{ so: 5 }] }] }))) &&
    /bãi/.test(loiCfg(cau({ chong: [{ x: 0, y: 0, cont: [{ so: 5 }] }] }))) && /xuất phát/.test(loiCfg(cau({ chong: [{ x: 4, y: 2, cont: [{ so: 5 }] }] }))) &&
    /hai lần/.test(loiCfg(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 5 }] }, { x: 4, y: 1, cont: [{ so: 6 }] }] }))) && loiCfg(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 1 }, { so: 2 }, { so: 3 }, { so: 99, tan: 4 }] }] })) === '');
  kiem('batDau.nac 0–7, batDau.tam 1–3, đầu cần lúc đầu phải trong sân; nac / tam không dùng cho xe bánh',
    /nac/.test(loiCfg(cau({ batDau: { x: 4, y: 2, nac: 8 } }))) && /tam/.test(loiCfg(cau({ batDau: { x: 4, y: 2, tam: 4 } }))) && /ngoài sân/.test(loiCfg(cau({ batDau: { x: 4, y: 2, nac: 0, tam: 3 } }))) &&
    loiCfg(cau({ batDau: { x: 4, y: 2, nac: 7, tam: 2 } })) === '' && /cần cẩu/.test(loiCfg({ loaiRobot: 'banh', hamGoc: XE, san: SAN1, batDau: { x: 1, y: 1, nac: 2 }, tau: TAU1 })));
  kiem('cần cẩu không có lệnh bánh / tay kẹp / cảm biến khác; xe bánh không có pick_up / read_code / rail',
    /không thuộc loại robot cau/.test(loiCfg(cau({ hamGoc: CAU.concat(['left_move']) }))) && /không thuộc loại robot cau/.test(loiCfg(cau({ hamGoc: CAU.concat(['grab']) }))) &&
    /không thuộc loại robot cau/.test(loiCfg(cau({ hamGoc: CAU.concat(['front_clear']) }))) && /chỉ dành cho cần cẩu/.test(loiCfg({ loaiRobot: 'banh', hamGoc: XE.concat(['pick_up']), san: SAN1, batDau: { x: 1, y: 1 }, tau: TAU1 })) &&
    /chỉ dành cho cần cẩu/.test(loiCfg({ loaiRobot: 'xuong', hamGoc: ['left_move', 'right_move', 'wait', 'rail'], san: SAN1, batDau: { x: 3, y: 4 }, tau: TAU1 })));
  kiem('read_code() cần camBien quet-ma; weight() cần read_code(); pick_up2 cần pick_up; pick_up đi cùng set_down; bệ cẩu phải trên sàn / ray',
    /quét mã/.test(loiCfg(cau({ camBien: [] }))) && /read_code/.test(loiCfg(cau({ hamGoc: ['wait', 'weight'] }))) && /pick_up2/.test(loiCfg(cau({ hamGoc: ['wait', 'pick_up2'] }))) &&
    /set_down/.test(loiCfg(cau({ hamGoc: ['wait', 'pick_up'] }))) && /Bệ cẩu/.test(loiCfg(cau({ san: ['#########', '#.......#', '#..>RR..#', '#.......#', '#TT~~~..#', '#########'], batDau: { x: 3, y: 2 }, chong: [], hamGoc: ['wait'] }))));
  kiem('rail() trên khay thì bệ phải xuất phát trên ray R', /ray R/.test(loiCfg(cau({ batDau: { x: 2, y: 2 } }))) && loiCfg(cau({ batDau: { x: 2, y: 2 }, hamGoc: CAU.filter((t) => t !== 'rail') })) === '');
  kiem('ray phải là một dải thẳng liền nhau từ 2 ô', /liền nhau/.test(loiCfg(cau({ san: ['#########', '#.......#', '#..R.R..#', '#.......#', '#TT~~~..#', '#########'], batDau: { x: 3, y: 2 } }))) &&
    /MỘT dải thẳng/.test(loiCfg(cau({ san: ['#########', '#..R....#', '#..RRR..#', '#.......#', '#TT~~~..#', '#########'], batDau: { x: 3, y: 2 } }))) &&
    /2 ô/.test(loiCfg(cau({ san: ['#########', '#.......#', '#..R....#', '#.......#', '#TT~~~..#', '#########'], batDau: { x: 3, y: 2 } }))));
  kiem('taiToiDa / luatThap chỉ cho màn có cẩu; taiToiDa nguyên dương', /cần cẩu/.test(loiCfg({ loaiRobot: 'banh', hamGoc: XE, san: SAN1, batDau: { x: 1, y: 1 }, tau: TAU1, taiToiDa: 5 })) && /nguyên dương/.test(loiCfg(cau({ taiToiDa: 0 }))) && loiCfg(cau({ taiToiDa: 6, luatThap: true })) === '');
  kiem('giao chỉ với mục tiêu giao-tau; giao-tau cần tau + giao; tau phải là chỉ số tàu; so phải có container trên sân; không khai một tàu hai lần',
    /giao-tau/.test(loiCfg(cau({ giao: [{ tau: 0, so: [7] }] }))) && /cfg.giao/.test(loiCfg(cau({ mucTieu: 'giao-tau' }))) && /cfg.tau/.test(loiCfg(cau({ mucTieu: 'giao-tau', tau: [], san: ['#.RR..#', '#.....#'], batDau: { x: 2, y: 0, nac: 4 }, chong: [], hamGoc: ['wait'] }))) &&
    /chỉ số tàu/.test(loiCfg(cau({ mucTieu: 'giao-tau', giao: [{ tau: 1, so: [7] }] }))) && /không có container số 9/.test(loiCfg(cau({ mucTieu: 'giao-tau', giao: [{ tau: 0, so: [9] }] }))) &&
    /hai lần/.test(loiCfg(cau({ mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7] }, { tau: 0, so: [12] }] }))) && loiCfg(cau({ mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7, 12] }] })) === '');
  kiem('daoChieu không dùng cho cần cẩu', /daoChieu/.test(loiCfg(cau({ daoChieu: ['trai'] }))));
}

console.log('\n== 2. Quay cần 8 nấc ==');
{
  let r = chay(cau(), lap('swing_right()\n', 8));
  const nacs = nhipVet(r).map((n) => n.robot.nac), daus = nhipVet(r).map((n) => n.robot.dau.x + ',' + n.robot.dau.y);
  kiem('swing_right() 8 lần: nấc 1 2 3 4 5 6 7 0 (mod 8), mỗi lệnh một nhịp, không cần wait()', r.nhip === 8 && J(nacs) === J([1, 2, 3, 4, 5, 6, 7, 0]) && r.nac === 0 && !r.loi, J(nacs));
  kiem('đầu cần theo véc-tơ nấc từ bệ (4,2) tầm 1: (5,1) (5,2) (5,3) (4,3) (3,3) (3,2) (3,1) (4,1)', J(daus) === J(['5,1', '5,2', '5,3', '4,3', '3,3', '3,2', '3,1', '4,1']), J(daus));
  kiem('sự kiện quay-can { tu, den, chieu, dau }', dem(r, 'quay-can') === 8 && J(sk1(r, 'quay-can')) === J({ ma: 'quay-can', nhip: 1, tu: 0, den: 1, chieu: 1, dau: { x: 5, y: 1 } }), J(sk1(r, 'quay-can')));
  r = chay(cau(), lap('swing_left()\n', 3));
  kiem('swing_left() từ nấc 0: 7 6 5 (mod 8 chiều âm), đầu cần (3,1) (3,2) (3,3)', J(nhipVet(r).map((n) => n.robot.nac)) === J([7, 6, 5]) && J(r.dau) === J({ x: 3, y: 3 }) && sk1(r, 'quay-can').chieu === -1);
  r = chay(cau({ batDau: { x: 4, y: 2, nac: 3, tam: 2 } }), 'swing_left()\n');
  kiem('batDau.nac / tam dùng được: nấc 3 tầm 2 → đầu (6,4); quay trái → nấc 2 đầu (6,2)', J(nhipVet(r)[0].robot.dau) === J({ x: 6, y: 2 }) && r.nac === 2 && r.tam === 2);
  r = chay(cau({ batDau: { x: 4, y: 2, nac: 0, tam: 2 } }), 'swing_right()\nswing_right()\n');
  kiem('cần cao hơn mọi thứ: đầu cần ở tường (4,0) lúc đầu, quay qua góc tường (6,0) sang (6,2) không bị chặn', !co(r, 'can-het-tam') && J(nhipVet(r).map((n) => n.robot.dau)) === J([{ x: 6, y: 0 }, { x: 6, y: 2 }]));
  r = chay(cau({ san: ['...', '...', '...'], tau: undefined, batDau: { x: 0, y: 1 }, chong: [], hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait'], camBien: [] }), 'swing_left()\nswing_right()\nswing_right()\n');
  kiem('quay mà đầu cần ra ngoài sân: can-het-tam vat ngoai-san kèm lenh, nấc không đổi, vẫn mất nhịp', r.nhip === 3 && co(r, 'can-het-tam') && sk1(r, 'can-het-tam').vat === 'ngoai-san' && sk1(r, 'can-het-tam').lenh.ten === 'swing_left' && J(nhipVet(r).map((n) => n.robot.nac)) === J([0, 1, 2]), J(sks(r)));
  r = chay(cau(), 'wait()\nwait()\n');
  kiem('wait() của cẩu là một nhịp đứng yên', r.nhip === 2 && dem(r, 'dung-yen') === 2 && r.nac === 0 && r.tam === 1);
}

console.log('\n== 3. Vươn / thu cần ==');
{
  let r = chay(cau({ batDau: { x: 4, y: 2, nac: 2 } }), lap('extend()\n', 4));
  kiem('extend() tầm 1 → 2 → 3, lần thứ ba / tư can-het-tam vat tam, tầm giữ 3, mất nhịp', r.nhip === 4 && J(nhipVet(r).map((n) => n.robot.tam)) === J([2, 3, 3, 3]) && dem(r, 'vuon-can') === 2 && dem(r, 'can-het-tam') === 2 && sk1(r, 'can-het-tam').vat === 'tam' && J(r.dau) === J({ x: 7, y: 2 }));
  r = chay(cau(), 'retract()\nextend()\nretract()\n');
  kiem('retract() dưới tầm 1: can-het-tam; vươn rồi thu về được', J(nhipVet(r).map((n) => n.robot.tam)) === J([1, 2, 1]) && dem(r, 'can-het-tam') === 1 && co(r, 'vuon-can') && co(r, 'thu-can'));
  r = chay(cau(), 'extend()\nextend()\n');
  kiem('nấc 0 tầm 2 đầu cần vào tường (4,0) được; tầm 3 ra ngoài sân (4,-1): can-het-tam vat ngoai-san', J(nhipVet(r)[0].robot.dau) === J({ x: 4, y: 0 }) && sk1(r, 'can-het-tam').vat === 'ngoai-san' && r.tam === 2);
  r = chay(cau({ batDau: { x: 4, y: 2, nac: 1 } }), 'extend()\n');
  kiem('nấc chéo: tầm 2 nấc 1 → đầu (6,0) = (+2, −2)', J(r.dau) === J({ x: 6, y: 0 }) && !co(r, 'can-het-tam'));
  r = chay(cau(), 'pick_up()\nswing_right()\nswing_right()\nextend()\n');
  kiem('container treo đi theo đầu cần khi quay / vươn (robot.treo, sự kiện kèm dau)', J(r.treo) === J([{ so: 7, tan: 2 }]) && J(r.dau) === J({ x: 6, y: 2 }) && nhipVet(r).every((n) => n.robot.treo.length === 1));
}

console.log('\n== 4. Móc cẩu: pick_up / set_down / pick_up2 ==');
{
  let r = chay(cau(), 'pick_up()\n');
  kiem('pick_up() nhấc container TRÊN CÙNG (7) ở đầu cần (4,1); chồng còn [12]; sự kiện moc-cont', r.nhip === 1 && J(r.treo) === J([{ so: 7, tan: 2 }]) && J(chongO(r, 4, 1)) === J([12]) && J(sk1(r, 'moc-cont').cont) === J([{ so: 7, tan: 2 }]) && sk1(r, 'moc-cont').doi === false, J(r.chong));
  r = chay(cau(), 'pick_up()\npick_up()\n');
  kiem('đang treo mà pick_up(): dang-treo (lỗi), không nhấc thêm', co(r, 'dang-treo') && r.treo.length === 1 && J(chongO(r, 4, 1)) === J([12]) && sk1(r, 'dang-treo').lenh.ten === 'pick_up');
  r = chay(cau(), 'swing_right()\npick_up()\n');
  kiem('pick_up() ở ô không có container: moc-hut vat trong (lỗi), mất nhịp', r.nhip === 2 && co(r, 'moc-hut') && sk1(r, 'moc-hut').vat === 'trong' && J(sk1(r, 'moc-hut').o) === J({ x: 5, y: 1 }) && r.treo.length === 0);
  r = chay(cau(), 'pick_up2()\n');
  kiem('pick_up2() nhấc HAI container trên cùng, giữ thứ tự đáy → đỉnh [12, 7], doi true; chồng trống', J(r.treo) === J([{ so: 12, tan: 1 }, { so: 7, tan: 2 }]) && J(chongO(r, 4, 1)) === J([]) && sk1(r, 'moc-cont').doi === true && nhipVet(r)[0].robot.doi === true);
  r = chay(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 3 }] }] }), 'pick_up2()\n');
  kiem('pick_up2() trên chồng chỉ có 1: moc-thieu (lỗi), không nhấc', co(r, 'moc-thieu') && sk1(r, 'moc-thieu').co === 1 && r.treo.length === 0 && J(chongO(r, 4, 1)) === J([3]));
  r = chay(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 1 }, { so: 2 }, { so: 3 }] }] }), 'pick_up2()\nswing_right()\nset_down()\n');
  kiem('pick_up2 lấy [2, 3] từ [1, 2, 3]; set_down() hạ cả hai lên ô (5,1) đúng thứ tự; ha-cont doi true', J(chongO(r, 4, 1)) === J([1]) && J(chongO(r, 5, 1)) === J([2, 3]) && sk1(r, 'ha-cont').doi === true && r.treo.length === 0 && nhipVet(r)[2].robot.doi === false);
  r = chay(cau(), 'pick_up()\nswing_right()\nset_down()\nswing_left()\npick_up()\nswing_right()\nset_down()\n');
  kiem('hạ lên ĐỈNH chồng có sẵn: (5,1) thành [7, 12]', J(chongO(r, 5, 1)) === J([7, 12]) && J(chongO(r, 4, 1)) === J([]) && dem(r, 'ha-cont') === 2);
  r = chay(cau(), 'set_down()\n');
  kiem('set_down() khi không treo gì: khong-treo (lỗi)', co(r, 'khong-treo') && r.nhip === 1);
  // ha-bi-chan
  r = chay(cau({ batDau: { x: 4, y: 2, nac: 7 } }), 'swing_right()\npick_up()\nswing_left()\nextend()\nset_down()\n');
  kiem('hạ vào tường (2,0) (nấc 7 tầm 2): ha-bi-chan vat tuong, container vẫn treo', co(r, 'ha-bi-chan') && sk1(r, 'ha-bi-chan').vat === 'tuong' && r.treo.length === 1 && J(sk1(r, 'ha-bi-chan').o) === J({ x: 2, y: 0 }), J(sks(r)));
  r = chay(cau(), 'pick_up()\nswing_right()\nswing_right()\nswing_right()\nswing_right()\nextend()\nset_down()\n');
  kiem('hạ xuống nước (4,4): ha-bi-chan vat nuoc', sk1(r, 'ha-bi-chan') && sk1(r, 'ha-bi-chan').vat === 'nuoc' && r.treo.length === 1);
  r = chay(cau(), 'pick_up()\nswing_left()\nswing_left()\nset_down()\n');
  kiem('hạ xuống ô ray (3,2): ha-bi-chan vat ray', sk1(r, 'ha-bi-chan') && sk1(r, 'ha-bi-chan').vat === 'ray');
  r = chay(cau({ tau: [{ o: TAU1[0].o, co: 5, vang: 3, pha: 5 }], batDau: { x: 4, y: 2, nac: 5 }, chong: [{ x: 3, y: 3, cont: [{ so: 7 }] }] }), 'pick_up()\nextend()\nset_down()\n');
  kiem('hạ xuống ô T khi tàu VẮNG (pha 5: vắng nhịp 1–3): ha-bi-chan vat tau-vang', sk1(r, 'ha-bi-chan') && sk1(r, 'ha-bi-chan').vat === 'tau-vang' && J(sk1(r, 'ha-bi-chan').o) === J({ x: 2, y: 4 }), J(sks(r)));
  r = chay(cau({ chong: CHONG1.concat([{ x: 5, y: 1, cont: [{ so: 1 }, { so: 2 }, { so: 3 }, { so: 4 }] }]) }), 'pick_up()\nswing_right()\nset_down()\n');
  kiem('hạ lên chồng đã 4: ha-bi-chan vat chong-day', sk1(r, 'ha-bi-chan') && sk1(r, 'ha-bi-chan').vat === 'chong-day');
  r = chay(cau({ chong: CHONG1.concat([{ x: 5, y: 1, cont: [{ so: 1 }, { so: 2 }, { so: 3 }] }]) }), 'pick_up2()\nswing_right()\nset_down()\n');
  kiem('hạ đôi lên chồng 3 (thành 5): chong-day; hạ đôi lên chồng 2 thì được', sk1(r, 'ha-bi-chan') && sk1(r, 'ha-bi-chan').vat === 'chong-day' &&
    J(chongO(chay(cau({ chong: CHONG1.concat([{ x: 5, y: 1, cont: [{ so: 1 }, { so: 2 }] }]) }), 'pick_up2()\nswing_right()\nset_down()\n'), 5, 1)) === J([1, 2, 12, 7]));
  r = chay(cau({ chong: [{ x: 4, y: 1, cont: [{ so: 5 }] }, { x: 5, y: 1, cont: [{ so: 6 }] }], tau: [{ o: TAU1[0].o, co: 5, vang: 0 }] }), 'pick_up()\nswing_right()\npick_up()\nset_down()\nswing_left()\nset_down()\n');
  kiem('pick_up ở ô có chồng nhưng đang treo: dang-treo; set_down lên chồng khác được; vang 0 tàu không bao giờ rời', dem(r, 'dang-treo') === 1 && J(chongO(r, 5, 1)) === J([6, 5]) && J(chongO(r, 4, 1)) === J([]) && !co(r, 'tau-roi') && r.tau[0].coMat === true);
}

console.log('\n== 5. Máy quét mã: read_code / weight ==');
{
  let r = chay(cau(), 'a = read_code()\nswing_right()\nb = read_code()\nswing_left()\npick_up()\nc = read_code()\n');
  const d = docs(r);
  kiem('read_code(): số container trên cùng (7), ô trống → −1, nhấc rồi đọc chồng còn lại (12); không tốn nhịp', r.nhip === 3 && J(d.map((q) => q.so)) === J([7, -1, 12]) && d.every((q) => q.cam === 'quet-ma' && q.ham === 'read_code') && J(d[1].o) === J({ x: 5, y: 1 }), J(d));
  r = chay(cau(), 'x = read_code()\nif x == 7:\n    pick_up()\n');
  kiem('read_code() dùng được trong điều kiện (trả số cho nhân)', co(r, 'moc-cont') && r.nhip === 1);
  r = chay(cau(), 'a = weight()\npick_up()\nb = weight()\nset_down()\npick_up2()\nc = weight()\nset_down()\nswing_right()\nd = weight()\n');
  kiem('weight(): không treo → tấn container trên cùng (2); treo 7 → 2; treo đôi 12 + 7 → 3; ô trống → 0', J(docs(r).map((q) => q.tan)) === J([2, 2, 3, 0]) && docs(r)[2].treo === 2, J(docs(r)));
  r = chay(cau(), 'while read_code() != -1:\n    pick_up()\n    swing_right()\n    set_down()\n    swing_left()\n');
  kiem('vòng while read_code() != -1 dọn hết chồng (2 container) rồi dừng, không vòng vô hạn', !r.loi && r.nhip === 8 && J(chongO(r, 5, 1)) === J([7, 12]) && J(chongO(r, 4, 1)) === J([]), J(r.loi));
  r = chay(cau(), 'while read_code() != -1:\n    x = 1\n');
  kiem('đọc liên tiếp không có nhịp vẫn bị chặn vòng vô hạn', r.loi && r.loi.loai === 'infinite-loop');
}

console.log('\n== 6. Luật tải cfg.taiToiDa ==');
{
  let r = chay(cau({ taiToiDa: 3 }), 'pick_up()\nextend()\nextend()\n');
  kiem('taiToiDa 3: pick_up 2 tấn ở tầm 1 (2 ≤ 3) được; extend lên tầm 2 (4 > 3): qua-tai, tầm giữ 1, mất nhịp', co(r, 'moc-cont') && dem(r, 'qua-tai') === 2 && r.tam === 1 && r.nhip === 3 && J(sk1(r, 'qua-tai')) === J({ ma: 'qua-tai', nhip: 2, lenh: { ten: 'extend', dongPy: 2 }, tan: 2, tam: 2, tai: 4, taiToiDa: 3, o: { x: 4, y: 1 }, cont: [{ so: 7, tan: 2 }] }), J(sk1(r, 'qua-tai')));
  kiem('(sân kiểm: chồng không đặt trên tường)', /bãi/.test(loiCfg(cau({ chong: [{ x: 4, y: 0, cont: [{ so: 1 }] }] }))));
  r = chay(cau({ taiToiDa: 3, batDau: { x: 4, y: 2, nac: 2, tam: 2 }, chong: [{ x: 6, y: 2, cont: [{ so: 1, tan: 2 }] }] }), 'pick_up()\nretract()\npick_up()\nextend()\n');
  kiem('pick_up ở tầm 2 với 2 tấn (4 > 3): qua-tai, không nhấc; thu về tầm 1 rồi... container ở (6,2) không còn dưới cần → moc-hut', dem(r, 'qua-tai') === 1 && sk1(r, 'qua-tai').lenh.ten === 'pick_up' && J(chongO(r, 6, 2)) === J([1]) && co(r, 'moc-hut') && r.treo.length === 0);
  r = chay(cau({ taiToiDa: 3, chong: [{ x: 4, y: 1, cont: [{ so: 1, tan: 2 }, { so: 2, tan: 2 }] }] }), 'pick_up2()\npick_up()\n');
  kiem('pick_up2 tính tổng tấn (4 × 1 > 3): qua-tai; pick_up một cái (2) thì được', dem(r, 'qua-tai') === 1 && J(r.treo) === J([{ so: 2, tan: 2 }]));
  kiem('(sân kiểm: chồng không đặt trên ray)', /bãi/.test(loiCfg(cau({ chong: [{ x: 5, y: 2, cont: [{ so: 1 }] }] }))));
  r = chay(cau({ taiToiDa: 12, batDau: { x: 4, y: 2, nac: 3 }, chong: [{ x: 5, y: 3, cont: [{ so: 1, tan: 4 }] }] }), 'pick_up()\nextend()\nextend()\n');
  kiem('taiToiDa 12: 4 tấn × tầm 3 = 12 vừa đủ (≤), không qua-tai', !co(r, 'qua-tai') && r.tam === 3);
  r = chay(cau({ batDau: { x: 4, y: 2, nac: 3 }, chong: [{ x: 5, y: 3, cont: [{ so: 1, tan: 4 }] }] }), 'pick_up()\nextend()\nextend()\n');
  kiem('không khai taiToiDa: không có luật tải', !co(r, 'qua-tai') && r.tam === 3 && J(r.dau) === J({ x: 7, y: 5 }));
}

console.log('\n== 7. Ray: rail(n) ==');
{
  let r = chay(cau(), 'rail(1)\n');
  kiem('rail(1): bệ (4,2) → (5,2), 1 nhịp, sự kiện chay-ray { tu, den, huong 1, doc false, dau }', r.nhip === 1 && J(r.robot) === J({ x: 5, y: 2, huong: 0 }) && J(sk1(r, 'chay-ray')) === J({ ma: 'chay-ray', nhip: 1, tu: { x: 4, y: 2 }, den: { x: 5, y: 2 }, huong: 1, doc: false, dau: { x: 5, y: 1 } }), J(sk1(r, 'chay-ray')));
  r = chay(cau({ batDau: { x: 5, y: 2 } }), 'rail(-2)\n');
  kiem('rail(-2): 2 nhịp, bệ 5 → 3; đầu cần đi theo (3,1)', r.nhip === 2 && r.robot.x === 3 && J(r.dau) === J({ x: 3, y: 1 }) && dem(r, 'chay-ray') === 2 && J(nhipVet(r).map((n) => n.robot.x)) === J([4, 3]));
  r = chay(cau({ batDau: { x: 5, y: 2 } }), 'rail(3)\nrail(1)\n');
  kiem('rail(3) từ đầu ray phải: ô kế (6,2) không phải ray → het-ray ngay nhịp 1 (lỗi, kèm lenh, n, daDi), bệ đứng yên, 3 nhịp vẫn trôi; rail(1) sau đó cũng het-ray',
    dem(r, 'het-ray') === 2 && r.nhip === 4 && r.robot.x === 5 && J(sk1(r, 'het-ray')) === J({ ma: 'het-ray', nhip: 1, o: { x: 5, y: 2 }, den: { x: 6, y: 2 }, vat: 'het-ray', n: 3, daDi: 0, lenh: { ten: 'rail', dongPy: 1 } }) && dem(r, 'dung-yen') === 2, J(sks(r)));
  r = chay(cau(), 'rail(5)\n');
  kiem('rail(5) từ giữa: đi 1 ô rồi het-ray (daDi 1), 5 nhịp', r.nhip === 5 && r.robot.x === 5 && dem(r, 'chay-ray') === 1 && sk1(r, 'het-ray').daDi === 1 && dem(r, 'dung-yen') === 3);
  r = chay(cau(), 'pick_up()\nrail(-1)\n');
  kiem('container treo đi theo bệ khi chạy ray: đầu cần (3,1), treo vẫn 1', J(r.dau) === J({ x: 3, y: 1 }) && r.treo.length === 1 && J(sk1(r, 'chay-ray').dau) === J({ x: 3, y: 1 }));
  const SAN_DOC = ['#######', '#..R..#', '#..R..#', '#..R..#', '#..R..#', '#######'];
  r = chay(cau({ san: SAN_DOC, batDau: { x: 3, y: 2, nac: 2 }, chong: [], tau: undefined }), 'rail(2)\nrail(-9)\n');
  kiem('ray DỌC: rail(2) đi xuống (3,2) → (3,4); rail(-9) đi lên tới (3,1) rồi het-ray; kết quả ray { doc: true, o }', co(r, 'chay-ray') && sk1(r, 'chay-ray').doc === true && J(sk1(r, 'chay-ray').den) === J({ x: 3, y: 3 }) && r.robot.y === 1 && dem(r, 'chay-ray') === 5 && r.ray.doc === true && r.ray.o.length === 4 && r.nhip === 11, J(r.robot));
  r = chay(cau({ san: SAN_DOC, batDau: { x: 3, y: 2, nac: 6 }, chong: [], tau: undefined }), 'rail(1)\n');
  kiem('ray dọc với đầu cần ngang: vẫn chạy, đầu cần (2,3)', J(r.dau) === J({ x: 2, y: 3 }));
  r = chay(cau({ san: ['RR...', '.....'], batDau: { x: 1, y: 0, nac: 6 }, chong: [], tau: undefined }), 'rail(-1)\nswing_left()\nswing_left()\nrail(-1)\n');
  kiem('bệ chạy mà đầu cần sẽ lòi ra ngoài sân: het-ray vat can-ngoai-san, bệ đứng yên; quay cần vào trong (nấc 4) rồi chạy được', sk1(r, 'het-ray') && sk1(r, 'het-ray').vat === 'can-ngoai-san' && dem(r, 'chay-ray') === 1 && r.robot.x === 0 && J(r.dau) === J({ x: 0, y: 1 }), J(sks(r)));
  for (const [code, mau] of [['rail(0)\n', /khác 0/], ['rail(10)\n', /-9 đến 9/], ['rail(-10)\n', /-9 đến 9/], ['rail("a")\n', /"a"/], ['rail(1.5)\n', /1\.5/], ['rail()\n', /1 đối số/], ['rail(1, 2)\n', /1 đối số/]]) {
    r = chay(cau(), code);
    kiem('rail n sai: ' + code.trim() + ' → lỗi chạy ray-sai lời Việt', r.loi && r.loi.ma === 'ray-sai' && mau.test(r.loi.thongDiep) && r.nhip === 0, J(r.loi));
  }
  r = chay(cau({ hamGoc: CAU.filter((t) => t !== 'rail'), batDau: { x: 2, y: 2 } }), 'rail(1)\n');
  kiem('rail() khi khay không có: nhân báo chưa có hàm (lỗi chạy)', r.loi && r.loi.loai === 'runtime-error' && /rail/.test(r.loi.thongDiep));
  kiem('rail trong phần cứng nhưng bệ không trên ray: lỗi cấu hình ray R', /ray R/.test(loiCfg(cau({ hamGoc: CAU.filter((t) => t !== 'rail'), phanCung: CAU, batDau: { x: 2, y: 2 } }))));
}

console.log('\n== 8. Tàu cập / rời, giao tàu ==');
{
  const cauTau = (them) => cau(Object.assign({ batDau: { x: 4, y: 2, nac: 5 }, chong: [{ x: 3, y: 3, cont: [{ so: 7 }] }] }, them || {}));
  let r = chay(cauTau(), 'pick_up()\nextend()\nset_down()\nwait()\nwait()\nwait()\n');
  kiem('tàu co 5 vang 3: hạ 7 lên boong (2,4) nhịp 3 (ha-cont tau 0); cuối nhịp 5 tàu rời: tau-roi { tau 0, cont [7] }, boong trống, daGiao [[7]]',
    sk1(r, 'ha-cont').tau === 0 && J(sk1(r, 'tau-roi')) === J({ ma: 'tau-roi', nhip: 5, tau: 0, o: TAU1[0].o, cont: [7] }) && J(chongO(r, 2, 4)) === J([]) && J(r.daGiao) === J([[7]]) && r.chong.length === 0, J(sks(r)));
  kiem('vết nhịp: mucVet.tau coMat true nhịp 1–4, false từ nhịp 5 (tàu rời ở pha d, vết ghi cuối nhịp); kết quả tau[0].coMat false, tauBanDau coMat true', J(nhipVet(r).map((n) => n.tau[0].coMat)) === J([true, true, true, true, false, false]) && r.tau[0].coMat === false && r.tauBanDau[0].coMat === true);
  r = chay(cauTau(), 'pick_up()\nextend()\n' + lap('wait()\n', 7) + 'x = read_code()\nset_down()\ny = read_code()\n');
  kiem('tàu cập lại cuối nhịp 8 (tau-cap), nhịp 9 đọc boong trống (−1), hạ được; container treo trên T lúc tàu rời không rơi (tau-roi cont [])',
    sk1(r, 'tau-cap') && sk1(r, 'tau-cap').nhip === 8 && J(sk1(r, 'tau-roi').cont) === J([]) && J(docs(r).map((q) => q.so)) === J([-1, 7]) && co(r, 'ha-cont') && r.treo.length === 0, J(sks(r)));
  r = chay(cauTau({ tau: [{ o: TAU1[0].o, co: 5, vang: 3, pha: 5 }] }), 'pick_up()\nextend()\nset_down()\nwait()\nset_down()\n');
  kiem('pha 5: tàu vắng nhịp 1–3 (ha-bi-chan tau-vang), cập cuối nhịp 3, nhịp 5 hạ được', sk1(r, 'ha-bi-chan').vat === 'tau-vang' && sk1(r, 'tau-cap').nhip === 3 && sk1(r, 'ha-cont').nhip === 5);
  r = chay(cauTau({ tau: [{ o: TAU1[0].o, co: 5, vang: 3, pha: 5 }] }), 'extend()\npick_up()\n');
  kiem('pick_up trên T khi tàu vắng: moc-hut vat tau-vang', sk1(r, 'moc-hut') && sk1(r, 'moc-hut').vat === 'tau-vang');
  r = chay(cauTau(), 'pick_up()\nextend()\nset_down()\npick_up()\nretract()\nset_down()\n');
  kiem('móc lại container đang trên boong khi tàu có mặt: được (quyết định brief)', dem(r, 'moc-cont') === 2 && J(chongO(r, 3, 3)) === J([7]) && sk1(r, 'moc-cont', 1) && skAll(r, 'moc-cont')[1].tau === 0);
  r = chay(cauTau({ mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7] }] }), 'pick_up()\nextend()\nset_down()\n' + lap('wait()\n', 10));
  kiem('giao-tau: thắng ngay cuối nhịp 5 khi tàu rời mang đúng 7 (xong-giao-tau), không chạy tiếp', r.thang === true && r.nhip === 5 && co(r, 'xong-giao-tau') && !r.dungSom);
  r = chay(cauTau({ mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7] }] }), 'pick_up()\nextend()\n' + lap('wait()\n', 10));
  kiem('giao-tau: không hạ xuống boong thì không thắng', r.thang === false && r.nhip === 12 && J(r.daGiao) === J([[]]));
  r = chay(cauTau({ mucTieu: 'giao-tau', chong: [{ x: 3, y: 3, cont: [{ so: 12 }] }, { x: 1, y: 1, cont: [{ so: 7 }] }], giao: [{ tau: 0, so: [7] }] }), 'pick_up()\nextend()\nset_down()\n' + lap('wait()\n', 10));
  kiem('giao-nham: 12 không có trong danh sách tàu 0 → thua ngay cuối nhịp 5 (dungSom giao-nham, sự kiện kèm so, can)', r.thang === false && r.dungSom === 'giao-nham' && r.nhip === 5 && J(sk1(r, 'giao-nham').can) === J([7]) && sk1(r, 'giao-nham').so === 12, J(sks(r)));
  const SAN2 = ['#########', '#.......#', '#..RRR..#', '#.......#', '#TT~~~TT#', '#########'];
  const TAU2 = [{ o: [{ x: 1, y: 4 }, { x: 2, y: 4 }], co: 5, vang: 3 }, { o: [{ x: 6, y: 4 }, { x: 7, y: 4 }], co: 4, vang: 4, pha: 2 }];
  r = chay(cau({ san: SAN2, tau: TAU2, mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7] }, { tau: 1, so: [12] }], batDau: { x: 4, y: 2, nac: 5 }, chong: [{ x: 3, y: 3, cont: [{ so: 7 }] }, { x: 5, y: 3, cont: [{ so: 12 }] }] }),
    'pick_up()\nextend()\nset_down()\nretract()\nswing_left()\nswing_left()\npick_up()\nextend()\nset_down()\n' + lap('wait()\n', 12));
  kiem('hai tàu, hai danh sách: 7 lên tàu 0 (rời nhịp 5), 12 lên tàu 1 (co 4 vang 4 pha 2: có mặt nhịp 7–10, rời cuối nhịp 10) → thắng nhịp 10', r.thang === true && r.nhip === 10 && J(r.daGiao) === J([[7], [12]]) && dem(r, 'tau-roi') >= 2, J(sks(r)));
  r = chay(cau({ san: SAN2, tau: TAU2, mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7, 12] }], batDau: { x: 4, y: 2, nac: 5 }, chong: [{ x: 3, y: 3, cont: [{ so: 7 }, { so: 12 }] }] }), 'pick_up2()\nextend()\nset_down()\n' + lap('wait()\n', 4));
  kiem('danh sách hai số: pick_up2 hạ cả hai lên boong, tàu 0 rời mang [7, 12] → thắng nhịp 5', r.thang === true && r.nhip === 5 && J(skAll(r, 'tau-roi').find((e) => e.tau === 0).cont) === J([7, 12]));
  r = chay(cau({ san: SAN2, tau: TAU2, mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7, 12] }], batDau: { x: 4, y: 2, nac: 5 }, chong: [{ x: 3, y: 3, cont: [{ so: 7 }, { so: 12 }] }] }), 'pick_up()\nextend()\nset_down()\n' + lap('wait()\n', 4));
  kiem('chỉ giao 12 trong hai số: chưa thắng, không giao-nham', r.thang === false && !r.dungSom && J(r.daGiao) === J([[12], []]));
}

console.log('\n== 9. bongMo.chong và luật tháp ==');
{
  //        bệ (4,2) nấc 5 → A (3,3); nấc 4 → B (4,3); nấc 3 → C (5,3). Từ nấc 5, swing_left sang nấc 4 (B), nấc 3 (C); swing_right quay về.
  const thap = (them) => cau(Object.assign({ batDau: { x: 4, y: 2, nac: 5 }, tau: undefined, san: ['#########', '#.......#', '#..RRR..#', '#.......#', '#.......#', '#########'], chong: [{ x: 3, y: 3, cont: [{ so: 2 }, { so: 1 }] }],
    mucTieu: 'bong-mo', bongMo: { chong: [{ x: 3, y: 3, so: [] }, { x: 4, y: 3, so: [] }, { x: 5, y: 3, so: [2, 1] }] }, luatThap: true }, them || {}));
  const GIAI = 'pick_up()\nswing_left()\nset_down()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\npick_up()\nswing_left()\nset_down()\n';
  let r = chay(thap(), GIAI);
  kiem('Tháp Hà Nội 2 tầng: lời giải 12 nhịp dời [2, 1] từ (3,3) sang (5,3) → bong-mo thắng (bongMo không khai x, y: bệ ở nguyên chỗ)', r.thang === true && J(chongO(r, 5, 3)) === J([2, 1]) && r.bongMo.chong.length === 3, J(r.chong) + J(sks(r)));
  r = chay(thap(), 'pick_up()\nswing_left()\nset_down()\nswing_right()\npick_up()\nswing_left()\nset_down()\n');
  kiem('luatThap: hạ 2 lên 1 → thap-sai (lỗi, kèm so, tren), container vẫn treo, không thắng', co(r, 'thap-sai') && sk1(r, 'thap-sai').so === 2 && sk1(r, 'thap-sai').tren === 1 && r.treo.length === 1 && r.thang === false);
  r = chay(thap({ luatThap: false }), 'pick_up()\nswing_left()\nset_down()\nswing_right()\npick_up()\nswing_left()\nset_down()\n');
  kiem('không luatThap: hạ 2 lên 1 được (chồng [1, 2]) nhưng bongMo.chong chưa đúng → không thắng', !co(r, 'thap-sai') && J(chongO(r, 4, 3)) === J([1, 2]) && r.thang === false);
  r = chay(thap({ luatThap: false }), 'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\n');
  kiem('chồng đích [1, 2] (sai thứ tự) → không thắng', r.thang === false && J(chongO(r, 5, 3)) === J([1, 2]));
  r = chay(thap({ bongMo: { chong: [{ x: 5, y: 3, so: [2, 1] }] } }), GIAI);
  kiem('bongMo.chong chỉ khai ô đích: mọi ô khác phải trống → vẫn thắng vì đã dọn hết', r.thang === true);
  r = chay(thap({ bongMo: { chong: [{ x: 4, y: 3, so: [1] }] } }), 'pick_up()\nswing_left()\nset_down()\n');
  kiem('ô không khai (3,3) còn container 2 → không thắng (chặt)', r.thang === false && J(chongO(r, 4, 3)) === J([1]));
  r = chay(thap({ bongMo: { chong: [{ x: 3, y: 3, so: [2] }] } }), 'pick_up()\n');
  kiem('còn treo thì không thắng', r.thang === false && r.treo.length === 1);
  kiem('bongMo.chong: lỗi cấu hình khi không phải cẩu, ô không phải bãi, so sai, cao > 4',
    /cần cẩu/.test(loiCfg({ loaiRobot: 'banh', hamGoc: XE, san: SAN1, batDau: { x: 1, y: 1, huong: 1 }, tau: TAU1, mucTieu: 'bong-mo', bongMo: { x: 2, y: 1, huong: 1, chong: [{ x: 3, y: 1, so: [1] }] } })) &&
    /bãi/.test(loiCfg(thap({ bongMo: { chong: [{ x: 3, y: 2, so: [1] }] } }))) && /đáy → đỉnh/.test(loiCfg(thap({ bongMo: { chong: [{ x: 3, y: 3, so: [0] }] } }))) && /cao quá/.test(loiCfg(thap({ bongMo: { chong: [{ x: 3, y: 3, so: [1, 2, 3, 4, 5] }] } }))));
  r = chay(cau({ mucTieu: 'bong-mo', bongMo: { x: 5, y: 2 } }), 'rail(1)\n');
  kiem('bongMo với x, y: bệ phải chạy ray tới đó (thắng); không khai chong thì không xét chồng', r.thang === true);
}

console.log('\n== 10. Bài số học: % với số âm, rail(dich - x), abs ==');
{
  const cauTau = (them) => cau(Object.assign({ batDau: { x: 4, y: 2, nac: 0 }, chong: [{ x: 3, y: 3, cont: [{ so: 7 }] }], tau: [{ o: TAU1[0].o, co: 10, vang: 3 }], mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7] }] }, them || {}));
  let r = chay(cauTau(), 'a = 0\nb = 5\nfor i in range((b - a) % 8):\n    swing_right()\npick_up()\nextend()\nset_down()\nfor i in range(5):\n    wait()\n');
  kiem('(b - a) % 8 = 5 lần swing_right từ nấc 0 tới nấc 5, móc, vươn, hạ lên tàu, thắng nhịp 10', r.thang === true && r.nhip === 10 && dem(r, 'quay-can') === 5, J(r.loi) + J(sks(r)));
  r = chay(cauTau({ batDau: { x: 4, y: 2, nac: 5 } }), 'a = 5\nb = 0\nfor i in range((b - a) % 8):\n    swing_right()\nx = read_code()\n');
  kiem('(0 - 5) % 8 = 3 (phép mod Python với số âm, nhân sửa 31/10): quay phải 3 lần từ nấc 5 về nấc 0, đọc ô (4,1) trống → −1', r.nac === 0 && dem(r, 'quay-can') === 3 && docs(r)[0].so === -1, J(r.loi) + ' nac ' + r.nac);
  r = chay(cauTau(), 'a = -5 % 8\nb = 5 % -8\nc = -7 // 2\nd = 7 % 3\nfor i in range(a):\n    swing_right()\nif b == -3 and c == -4 and d == 1:\n    wait()\n');
  kiem('nhân: -5 % 8 = 3, 5 % -8 = -3, -7 // 2 = -4, 7 % 3 = 1 (đúng Python)', dem(r, 'quay-can') === 3 && dem(r, 'dung-yen') === 1, J(r.loi));
  r = chay(cauTau({ chong: [{ x: 3, y: 1, cont: [{ so: 7 }] }] }), 'x = 4\ndich = 3\nrail(dich - x)\nn = abs(dich - x)\nfor i in range(n):\n    pick_up()\n');
  kiem('rail(dich - x) = rail(-1) chạy sang trái 1 nhịp; abs(dich - x) = 1 → một lần pick_up đúng container ở (3,1)', r.robot.x === 3 && dem(r, 'chay-ray') === 1 && dem(r, 'moc-cont') === 1 && r.nhip === 2, J(r.loi) + J(sks(r)));
  r = chay(cauTau({ chong: [{ x: 4, y: 1, cont: [{ so: 23 }, { so: 12 }] }], giao: [{ tau: 0, so: [12] }] }), 'so = read_code()\ntau = so // 10\nvi = so % 10\nif tau == 1 and vi == 2:\n    pick_up()\n');
  kiem('so // 10 và so % 10 tách mã container 12 → 1 và 2 (nhân có // và %)', co(r, 'moc-cont') && r.treo[0].so === 12);
  r = chay(cauTau({ taiToiDa: 6, chong: [{ x: 4, y: 1, cont: [{ so: 7, tan: 3 }] }] }), 'pick_up()\nif weight() * 3 <= 6:\n    extend()\n    extend()\nelse:\n    extend()\n');
  kiem('weight() * tam <= M quyết định vươn bao xa: 3 × 3 = 9 > 6 nên chỉ vươn một lần (3 × 2 = 6 ≤ 6), không qua-tai', r.tam === 2 && !co(r, 'qua-tai'));
}

console.log('\n== 11. Vết nhịp, kết quả, màn cũ ==');
{
  let r = chay(cau(), 'pick_up2()\nswing_right()\n');
  const n0 = nhipVet(r)[0], n1 = nhipVet(r)[1];
  kiem('vết nhịp robot: nac, tam, dau, treo (đáy → đỉnh), doi; mucVet.chong; mucVet.tau', n0.robot.nac === 0 && n0.robot.tam === 1 && J(n0.robot.dau) === J({ x: 4, y: 1 }) && J(n0.robot.treo) === J([{ so: 12, tan: 1 }, { so: 7, tan: 2 }]) && n0.robot.doi === true &&
    J(n0.chong) === J([]) && J(n1.robot.dau) === J({ x: 5, y: 1 }) && J(n0.tau) === J([{ coMat: true }]), J(n0));
  kiem('kết quả: chong / chongBanDau / tau / tauBanDau / daGiao / ray / taiToiDa / luatThap / nac / tam / dau / treo', J(r.chongBanDau) === J([{ x: 4, y: 1, cont: [{ so: 12, tan: 1 }, { so: 7, tan: 2 }] }]) && J(r.chong) === J([]) && r.tau.length === 1 && J(r.tau[0].o) === J(TAU1[0].o) &&
    J(r.daGiao) === J([[]]) && J(r.ray) === J({ doc: false, o: [{ x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }] }) && r.taiToiDa === null && r.luatThap === false && r.nac === 1 && r.tam === 1 && J(r.dau) === J({ x: 5, y: 1 }) && r.treo.length === 2);
  kiem('không có quen-wait với cẩu (không có hàng chờ)', !r.suKien.some((e) => e.ma === 'quen-wait') && r.lenhTon.length === 0);
  r = chay({ loaiRobot: 'banh', hamGoc: XE, san: ['#####', '#..F#', '#####'], batDau: { x: 1, y: 1, huong: 1 } }, 'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()\n');
  kiem('màn cũ (xe bánh, sân không T / R / chong): chạy như cũ, kết quả chong [] tau [] ray null, nac undefined', r.thang === true && J(r.chong) === J([]) && J(r.tau) === J([]) && r.ray === null && r.nac === undefined && nhipVet(r)[0].chong === undefined && nhipVet(r)[0].tau === undefined);
  kiem('hằng xuất: HAM_GOC.cau, LENH_NGUOC swing / extend / pick_up, NAC_VEC 8, CHONG_TOI_DA 4, TAM_CAU_TOI_DA 3, RAY_TOI_DA 9, MUC_TIEU có giao-tau, laHamCamBien read_code / weight',
    J(SanHoc.HAM_GOC.cau) === J(['swing_left', 'swing_right', 'extend', 'retract', 'wait']) && SanHoc.LENH_NGUOC.swing_left === 'swing_right' && SanHoc.LENH_NGUOC.extend === 'retract' && SanHoc.LENH_NGUOC.pick_up === 'set_down' && SanHoc.LENH_NGUOC.pick_up2 === undefined &&
    SanHoc.NAC_VEC.length === 8 && SanHoc.CHONG_TOI_DA === 4 && SanHoc.TAM_CAU_TOI_DA === 3 && SanHoc.RAY_TOI_DA === 9 && SanHoc.MUC_TIEU.includes('giao-tau') && SanHoc.laHamCamBien('read_code') && SanHoc.laHamCamBien('weight') && SanHoc.MA_CAM_QUET === 'quet-ma' && J(SanHoc.CANG_KY) === J({ T: 'boong', R: 'ray' }));
  kiem('phanCungMacDinh("cau", khay) = bộ lệnh cẩu + khay', J(SanHoc.phanCungMacDinh('cau', ['pick_up', 'set_down'])) === J(['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down']));
}

console.log('\n== 12. Nhiều robot: cẩu và xe ==');
{
  const doi = (code2, them) => chay(Object.assign({ san: SAN1, tau: TAU1, chong: CHONG1, nhipToiDa: 30, doi: [
    { loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], batDau: { x: 4, y: 2 } },
    { loaiRobot: 'banh', hamGoc: XE, batDau: { x: 6, y: 2, huong: 3 } }] }, them || {}), ['wait()\nwait()\nwait()\n', code2]);
  let r = doi('left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()\n');
  kiem('xe đi qua ô ray (5,2) như sàn, rồi đâm vào bệ cẩu (4,2) như tường (dam-tuong dong-doi)', r.doi[1].robot.x === 5 && r.doi[1].suKien.some((e) => e.ma === 'dam-tuong' && e.vat === 'dong-doi'), J(r.doi[1].suKien));
  r = chay({ san: SAN1, tau: TAU1, chong: CHONG1, nhipToiDa: 30, doi: [{ loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], batDau: { x: 4, y: 2 } }, { loaiRobot: 'banh', hamGoc: XE, batDau: { x: 5, y: 2, huong: 3 } }] }, ['rail(1)\nrail(-1)\n', 'wait()\nwait()\n']);
  kiem('rail(1) vào ô xe đang đứng: het-ray vat robot; rail(-1) được', r.doi[0].suKien.some((e) => e.ma === 'het-ray' && e.vat === 'robot') && r.doi[0].robot.x === 3);
  r = chay({ san: SAN1, tau: TAU1, chong: CHONG1, nhipToiDa: 30, doi: [{ loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], batDau: { x: 4, y: 2 } }, { loaiRobot: 'banh', hamGoc: XE, batDau: { x: 5, y: 1, huong: 3 } }] }, ['pick_up()\nswing_right()\nset_down()\n', 'wait()\nwait()\nwait()\n']);
  kiem('set_down xuống ô xe khác đang đứng (5,1): ha-bi-chan vat robot', r.doi[0].suKien.some((e) => e.ma === 'ha-bi-chan' && e.vat === 'robot'));
  r = chay({ san: SAN1, tau: TAU1, chong: CHONG1, nhipToiDa: 30, doi: [{ loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], batDau: { x: 4, y: 2, nac: 2 } }, { loaiRobot: 'banh', hamGoc: XE, batDau: { x: 6, y: 2, huong: 3 } }] }, ['wait()\n', 'left_move()\nright_move()\nwait()\n']);
  kiem('đầu cần (5,2) không chặn xe: xe đi vào (5,2) bình thường', r.doi[1].robot.x === 5 && !r.doi[1].suKien.some((e) => e.ma === 'dam-tuong'));
  kiem('hai cẩu xuất phát cùng ô: lỗi', /cùng một ô/.test(loiCfg({ san: SAN1, tau: TAU1, doi: [{ loaiRobot: 'cau', hamGoc: ['wait'], batDau: { x: 4, y: 2 } }, { loaiRobot: 'cau', hamGoc: ['wait'], batDau: { x: 4, y: 2 } }] }, ['wait()\n', 'wait()\n'])));
  r = chay({ san: ['#######', '#.....#', '#.RRR.#', '#.....#', '#######'], nhipToiDa: 30, doi: [{ loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], batDau: { x: 2, y: 2, nac: 1 } }, { loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], batDau: { x: 4, y: 2, nac: 7 } }], chong: [{ x: 3, y: 1, cont: [{ so: 5 }] }] },
    ['pick_up()\nswing_right()\nset_down()\n', 'wait()\npick_up()\n']);
  kiem('hai cẩu cùng với tới (3,1): cẩu 1 nhấc 5 ở nhịp 1 rồi hạ xuống ray (3,2) → ha-bi-chan ray; cẩu 2 móc ở nhịp 2 thì hụt', r.doi[0].suKien.some((e) => e.ma === 'ha-bi-chan' && e.vat === 'ray') && r.doi[1].suKien.some((e) => e.ma === 'moc-hut'), J(r.doi[0].suKien) + J(r.doi[1].suKien));
}

console.log('\n== 13. cham.js: lớp mới xuống SanHoc.chay, lời chẩn đoán, sổ lệnh, kho hàm ==');
{
  const ChamHoc = require(path.join(day, 'cham.js'));
  const SoLenh = require(path.join(day, 'so-lenh.js'));
  const KhoHam = require(path.join(day, 'kho-ham.js'));
  const man = (t) => Object.assign({ ma: 'thu-cang.1', loaiRobot: 'cau', hamGoc: CAU, robot: { camBien: [{ ma: 'quet-ma' }] }, san: SAN1, batDau: { x: 4, y: 2, nac: 5 }, chong: [{ x: 3, y: 3, cont: [{ so: 7, tan: 2 }] }], tau: TAU1,
    mucTieu: 'giao-tau', giao: [{ tau: 0, so: [7] }], sao: { o: 99, nhip: 99 } }, t || {});
  const cd = (r, ma) => (r.chanDoan || []).find((c) => c.ma === ma) || null;
  const loiCua = (c) => (c && (c.loi || c.thongDiep)) || '';
  const khongLoi = (r) => !(r.chanDoan || []).some((c) => c.muc === 'loi');
  let r = ChamHoc.cham(man(), { chinh: ['pick_up()', 'extend()', 'set_down()', 'for i in range(3):', '    wait()'] }, []);
  kiem('cham đưa chong / tau / giao xuống lõi: lời giải giao-tau thắng, không chẩn đoán lỗi', r.thang === true && khongLoi(r), J(r.chanDoan));
  r = ChamHoc.cham(man(), { chinh: ['pick_up()', 'extend()', 'set_down()'] }, []);
  kiem('cham: chua-giao-tau nói container đang trên boong, chờ tàu đi', !r.thang && !!cd(r, 'chua-giao-tau') && /boong/.test(loiCua(cd(r, 'chua-giao-tau'))) && /số 7/.test(loiCua(cd(r, 'chua-giao-tau'))), J(r.chanDoan));
  r = ChamHoc.cham(man(), { chinh: ['extend()', 'extend()', 'extend()', 'retract()', 'retract()', 'retract()'] }, []);
  kiem('cham: can-het-tam nói tầm 3 không vươn xa hơn, giữ nấc / tầm, mất nhịp', !!cd(r, 'can-het-tam') && /tầm 3/.test(loiCua(cd(r, 'can-het-tam'))) && cd(r, 'can-het-tam').soLan === 2, J(r.chanDoan));
  r = ChamHoc.cham(man({ taiToiDa: 3 }), { chinh: ['pick_up()', 'extend()'] }, []);
  kiem('cham đưa taiToiDa xuống: qua-tai nói 2 tấn × tầm 2 = 4 > 3, gợi ý weight()', !!cd(r, 'qua-tai') && /2 tấn × tầm 2 = 4/.test(loiCua(cd(r, 'qua-tai'))) && /weight\(\)/.test(loiCua(cd(r, 'qua-tai'))), J(r.chanDoan));
  r = ChamHoc.cham(man(), { chinh: ['pick_up()', 'pick_up()', 'set_down()', 'set_down()', 'swing_left()', 'pick_up()'] }, []);
  kiem('cham: dang-treo (gợi ý set_down / pick_up2), moc-hut (gợi ý read_code), khong-treo', !!cd(r, 'dang-treo') && /set_down\(\)/.test(loiCua(cd(r, 'dang-treo'))) && !!cd(r, 'moc-hut') && /read_code\(\)/.test(loiCua(cd(r, 'moc-hut'))) && !!cd(r, 'khong-treo'), J(r.chanDoan));
  r = ChamHoc.cham(man({ chong: [{ x: 3, y: 3, cont: [{ so: 7 }] }] }), { chinh: ['pick_up2()'] }, []);
  kiem('cham: moc-thieu nói chồng chỉ có 1, dùng pick_up()', !!cd(r, 'moc-thieu') && /pick_up\(\)/.test(loiCua(cd(r, 'moc-thieu'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ tau: [{ o: TAU1[0].o, co: 5, vang: 3, pha: 5 }] }), { chinh: ['pick_up()', 'extend()', 'set_down()'] }, []);
  kiem('cham: ha-bi-chan tau-vang nói tàu đang vắng, chờ tàu về', !!cd(r, 'ha-bi-chan') && /tàu đang vắng/.test(loiCua(cd(r, 'ha-bi-chan'))) && /chờ tàu về/.test(loiCua(cd(r, 'ha-bi-chan'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ mucTieu: 'bong-mo', giao: undefined, tau: undefined, san: ['#########', '#.......#', '#..RRR..#', '#.......#', '#.......#', '#########'], chong: [{ x: 3, y: 3, cont: [{ so: 2 }, { so: 1 }] }], luatThap: true,
    bongMo: { chong: [{ x: 3, y: 3, so: [] }, { x: 4, y: 3, so: [] }, { x: 5, y: 3, so: [2, 1] }] } }), { chinh: ['pick_up()', 'swing_left()', 'set_down()', 'swing_right()', 'pick_up()', 'swing_left()', 'set_down()'] }, []);
  kiem('cham đưa luatThap / bongMo.chong xuống: thap-sai nói luật tháp; chua-xep-chong nói móc còn treo', !!cd(r, 'thap-sai') && /luật tháp/.test(loiCua(cd(r, 'thap-sai'))) && !!cd(r, 'chua-xep-chong') && /treo/.test(loiCua(cd(r, 'chua-xep-chong'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ mucTieu: 'bong-mo', giao: undefined, tau: undefined, san: ['#########', '#.......#', '#..RRR..#', '#.......#', '#.......#', '#########'], chong: [{ x: 3, y: 3, cont: [{ so: 2 }, { so: 1 }] }],
    bongMo: { chong: [{ x: 3, y: 3, so: [] }, { x: 4, y: 3, so: [] }, { x: 5, y: 3, so: [2, 1] }] } }), { chinh: ['pick_up()', 'swing_left()', 'set_down()'] }, []);
  kiem('cham: chua-xep-chong nói ô nào cần gì, đang là gì (đáy → đỉnh)', !!cd(r, 'chua-xep-chong') && /\(3, 3\) cần trống, đang là \[2\]/.test(loiCua(cd(r, 'chua-xep-chong'))) && cd(r, 'chua-xep-chong').sai.length === 3, J(r.chanDoan));
  r = ChamHoc.cham(man({ mucTieu: 'bong-mo', giao: undefined, tau: undefined, san: ['#########', '#.......#', '#..RRR..#', '#.......#', '#.......#', '#########'], chong: [{ x: 3, y: 3, cont: [{ so: 2 }, { so: 1 }] }], luatThap: true, khung: { chinh: 12 },
    bongMo: { chong: [{ x: 3, y: 3, so: [] }, { x: 4, y: 3, so: [] }, { x: 5, y: 3, so: [2, 1] }] } }), { chinh: ['pick_up()', 'swing_left()', 'set_down()', 'swing_right()', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()', 'swing_right()', 'pick_up()', 'swing_left()', 'set_down()'] }, []);
  kiem('cham: lời giải Tháp Hà Nội thắng qua cham, không lỗi', r.thang === true && khongLoi(r), J(r.chanDoan));
  r = ChamHoc.cham(man(), { chinh: ['rail(3)', 'rail(0)'] }, []);
  kiem('cham: het-ray nói dừng sau 1 ô, nhịp còn lại đứng yên; ray-sai là lỗi chạy lời Việt kèm cách tính n', !!cd(r, 'het-ray') && /sau 1 ô/.test(loiCua(cd(r, 'het-ray'))) && /đứng yên/.test(loiCua(cd(r, 'het-ray'))) && !!cd(r, 'ray-sai') && /dich - x/.test(loiCua(cd(r, 'ray-sai'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ chong: [{ x: 3, y: 3, cont: [{ so: 12 }] }, { x: 1, y: 1, cont: [{ so: 7 }] }] }), { chinh: ['pick_up()', 'extend()', 'set_down()', 'for i in range(3):', '    wait()'] }, []);
  kiem('cham: giao-nham nói tàu 1 chỉ nhận số 7, thua ngay, gợi ý read_code()', !r.thang && !!cd(r, 'giao-nham') && /chỉ nhận các container số 7/.test(loiCua(cd(r, 'giao-nham'))) && /thua/.test(loiCua(cd(r, 'giao-nham'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ mucTieu: 'toi-co', giao: undefined, san: ['#########', '#.......#', '#..RRRF.#', '#.......#', '#TT~~~..#', '#########'] }), { chinh: ['swing_right()'] }, []);
  kiem('cham: cẩu chưa tới cờ không nói "quay mặt hướng"; không có quen-wait', !!cd(r, 'chua-toi-co') && !/quay mặt/.test(loiCua(cd(r, 'chua-toi-co'))) && !cd(r, 'quen-wait'), J(r.chanDoan));
  const ten = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail'];
  kiem('so-lenh: 10 lệnh gốc mới có mô tả; cặp ngược khớp SanHoc.LENH_NGUOC', ten.every((t) => SoLenh.lenhGoc.some((l) => l.ten === t && l.moTa && (l.nguoc || null) === (SanHoc.LENH_NGUOC[t] || null))));
  kiem('so-lenh: capNguoc() có swing_left / extend / pick_up', ['swing_left', 'extend', 'pick_up'].every((t) => SoLenh.capNguoc().some((c) => c[0] === t || c[1] === t)));
  kiem('kho-ham: 10 tên mới là tên gốc (cấm đặt); hook / unhook KHÔNG bị cấm (mùa 3 đã dạy trẻ tự tạo hook() / unhook())', ten.every((t) => KhoHam.HAM_GOC_MAC_DINH.includes(t)) && !KhoHam.HAM_GOC_MAC_DINH.includes('hook') && !KhoHam.HAM_GOC_MAC_DINH.includes('unhook'));
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);
