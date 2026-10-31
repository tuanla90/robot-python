/* ============================================================================
   kiem-ve-mua-song-cang.mjs — máy kiểm GÓI NỐI HÌNH Bến sông / Cảng sông vào trình vẽ sân thật (31/10; hoc/game/san-ve.js, man-choi.js, cham.js, xem-mua-moi.html).
   Lõi đã có máy riêng (kiem-mua-song / kiem-mua-cang); máy này kiểm phần VẼ ăn khớp với lõi, theo mã nguồn + chạy lõi thật:
     1. Mọi sự kiện lõi Bến sông / Cảng sông phát ra (chạy 5 sân mẫu thật qua SanHoc.chay) đều có tên trong san-ve.js (bước hoạt cảnh NHIP_MOI, bước đi chung, hay HIEU_UNG);
        bảng NHIP_MOI của san-ve.js không thiếu sự kiện nào trong danh sách luật.
     2. san-ve.js vẽ đủ ký hiệu mới (~ Q q K k V T R, B / L là nước + vật nổi), có dải bờ, dòng chảy theo thời gian, vỏ 'song' / 'cang' chỉ bật khi sân có ký hiệu / lớp mới (màn cũ không đổi),
        sprite xuồng truyền neo / dat / dangDat / day / giu, cần cẩu vẽ bằng VeVector.veCanCau với nac / tam / treo / nang, đồng bộ vết cuối nhịp (dongBoMuaMoi).
     3. man-choi.js đưa lớp dong / chong / tau / giao / taiToiDa / luatThap / hamGoc xuống Field và ảnh nhỏ; cham.js theoSan chép cong / van / dongTat / chong / tau / daGiao / ray.
     4. Tên lệnh móc cẩu trên hình (tay moc-cau hamGoc) đúng với lõi (TAY_MOC: pick_up / set_down / pick_up2), không còn hook / unhook là TÊN LỆNH trong hoc/game.
     5. veCanCau nhận nang (0..1) và stCont; trang xem-mua-moi.html có mục Sân chơi thử nạp nhân + lõi + san-ve.js, không có mã màu hex gõ thẳng trong <style>.
   Chạy: node hoc/kiem-ve-mua-song-cang.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const doc = (p) => fs.readFileSync(path.join(day, p), 'utf-8');
const sv = doc('game/san-ve.js'), mc = doc('game/man-choi.js'), ch = doc('cham.js'), xem = doc('game/xem-mua-moi.html'), tc = doc('game/ve-vector-than-cau.js'), moc = doc('game/ve-vector-tay-moc-cau.js'), sh = doc('san-hoc.js');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const co = (src, re) => (re instanceof RegExp ? re : new RegExp(re.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).test(src);

/* ---------- 1. sự kiện lõi ↔ san-ve.js */
console.log('\n== 1. Sự kiện lõi phát ra đều có chỗ trong san-ve.js ==');
const XUONG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'anchor', 'unanchor', 'tow', 'drop_tow', 'tether', 'untether', 'flow_dir', 'flow'];
const CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail'];
const SAN_MAU = [
  ['Bến sông: trôi, neo', { loaiRobot: 'xuong', hamGoc: XUONG, camBien: [{ ma: 'dong-chay' }], san: ['#########', '#~~~~~~Q#', '#~#V~~#~#', '#~~K~~~~#', '#~B~~~L~#', '#..~~~..#', '#########'], batDau: { x: 1, y: 1, huong: 1 },
    dong: [{ x: 3, y: 1, huong: 1, suc: 1 }, { x: 4, y: 1, huong: 1, suc: 1 }, { x: 4, y: 3, huong: 2, suc: 2 }], noi: [{ nut: { x: 3, y: 2 }, cong: [{ x: 3, y: 3 }], dong: [{ x: 4, y: 3 }] }], nhipToiDa: 60 },
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()\nanchor()\nwait()\nwait()\nanchor()\nwait()\nunanchor()\nwait()\nunanchor()\nwait()\nleft_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()\nleft_move()\nwait()\nleft_move()\nright_move()\nwait()\n'],
  ['Bến sông: dây phao, buộc đuôi, thả, vật trôi', { loaiRobot: 'xuong', hamGoc: XUONG, camBien: [{ ma: 'dong-chay' }], mucTieu: 'dua-vat', san: ['#########', '#~~~~~~~#', '#~B~~~~q#', '#~~~~L~~#', '#.......#', '#########'], batDau: { x: 1, y: 2, huong: 1 },
    dong: [{ x: 5, y: 3, huong: 1, suc: 1 }], nhipToiDa: 60 },
    'tow()\nwait()\ntow()\nwait()\nleft_move()\nright_move()\nwait()\ntether()\nwait()\ntether()\nwait()\nleft_move()\nright_move()\nwait()\nuntether()\nwait()\nuntether()\nwait()\nleft_back()\nright_back()\nwait()\n'],
  ['Bến sông: van cống, hụt, đâm cống, chong chóng', { loaiRobot: 'xuong', hamGoc: XUONG, camBien: [{ ma: 'dong-chay' }], san: ['#########', '#~V~~~~~#', '#~~K~~~Q#', '#~~~~~~~#', '#########'], batDau: { x: 1, y: 2, huong: 1 },
    dong: [{ x: 5, y: 2, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 3, suc: 2 }], noi: [{ nut: { x: 2, y: 1 }, cong: [{ x: 3, y: 2 }], dong: [{ x: 5, y: 2 }] }], nhipToiDa: 60 },
    'left_move()\nright_move()\nwait()\nleft_move()\nright_move()\nwait()\nright_move()\nwait()\ntow()\nwait()\nleft_move()\nwait()\nh = flow_dir()\nx = flow()\nfor i in range(5):\n    left_move()\n    right_move()\n    wait()\nright_move()\nwait()\ntow()\nwait()\n'],
  ['Cảng sông: giao tàu', { loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], mucTieu: 'giao-tau', san: ['#########', '#.......#', '#..RRR..#', '#.......#', '#TT~~~TT#', '#########'], batDau: { x: 4, y: 2 },
    chong: [{ x: 4, y: 1, cont: [{ so: 12 }, { so: 7, tan: 2 }] }, { x: 6, y: 2, cont: [{ so: 3 }, { so: 8 }, { so: 21 }] }], tau: [{ o: [{ x: 1, y: 4 }, { x: 2, y: 4 }], co: 6, vang: 2, pha: 0 }, { o: [{ x: 6, y: 4 }, { x: 7, y: 4 }], co: 3, vang: 2, pha: 1 }], giao: [{ tau: 0, so: [7] }, { tau: 1, so: [21] }], nhipToiDa: 60 },
    'pick_up()\npick_up()\nswing_left()\nswing_left()\nswing_left()\nextend()\nset_down()\nset_down()\nretract()\nswing_right()\nswing_right()\nswing_right()\nswing_right()\nswing_right()\nextend()\nso = read_code()\npick_up()\nswing_right()\nset_down()\nwait()\nwait()\n'],
  ['Cảng sông: ray, móc đôi, tải, hết tầm, hết ray, tháp', { loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], taiToiDa: 4, luatThap: true, san: ['#########', '#.......#', '#RRRRR..#', '#.......#', '#########'], batDau: { x: 1, y: 2 },
    chong: [{ x: 1, y: 1, cont: [{ so: 5, tan: 1 }, { so: 9, tan: 1 }] }, { x: 5, y: 3, cont: [{ so: 40, tan: 3 }] }, { x: 5, y: 1, cont: [{ so: 2 }] }], nhipToiDa: 60 },
    'pick_up2()\nrail(4)\nextend()\nextend()\nextend()\nswing_right()\nswing_right()\nswing_right()\nswing_right()\nretract()\nretract()\nset_down()\nswing_left()\nswing_left()\nswing_left()\nswing_left()\npick_up()\nswing_left()\npick_up()\nset_down()\nt = weight()\nrail(-9)\n']
];
const tenSK = new Set(), thieu = [];
for (const [ten, cfg, code] of SAN_MAU) {
  let r = null, loi = '';
  try { r = SanHoc.chay(cfg, code); } catch (e) { loi = e.message; }
  kiem('sân mẫu "' + ten + '" chạy được trong lõi', !!r && !loi, loi || (r && r.loi && JSON.stringify(r.loi)));
  if (!r) continue;
  r.vet.filter((e) => e.loai === 'nhip').forEach((e) => (e.suKien || []).forEach((s) => tenSK.add(s.ma)));
}
const skMoi = [...tenSK].filter((ma) => !['tien', 'lui', 'quay-trai', 'quay-phai', 'quay-dau', 'dam-tuong', 'toi-co', 'dung-yen', 'doc-cam-bien', 'xong-dua-vat'].includes(ma));
kiem('5 sân mẫu phát ra đủ sự kiện mới để kiểm (≥ 28 mã, gồm trôi / neo / dây / van / cống / cẩu / tàu / ray / lỗi)', skMoi.length >= 28 && ['troi', 'keo-vat', 'keo-van', 'cong-doi', 'moc-cont', 'ha-cont', 'tau-roi', 'chay-ray', 'can-het-tam', 'het-ray'].every((k) => skMoi.includes(k)), skMoi.length + ': ' + skMoi.join(' '));
for (const ma of tenSK) if (!co(sv, "'" + ma + "'")) thieu.push(ma);
kiem('mọi sự kiện của 5 sân mẫu đều có tên trong san-ve.js (' + tenSK.size + ' mã)', thieu.length === 0, 'thiếu: ' + thieu.join(' '));
const NHIP_MOI = (sv.match(/var NHIP_MOI = \{([\s\S]*?)\};/) || [, ''])[1].match(/'([a-z0-9-]+)'/g) || [];
const CAN = ['troi', 'troi-chan', 'neo-giu', 'tha-neo', 'nho-neo', 'keo-vat', 'keo-hut', 'keo-van', 'tha-keo', 'coi-duoi', 'buoc-duoi', 'dang-neo', 'mui-vuong', 'duoi-vuong', 'quay-can', 'vuon-can', 'thu-can', 'moc-cont', 'ha-cont', 'chay-ray', 'tau-cap', 'tau-roi', 'can-het-tam', 'qua-tai', 'dang-treo', 'moc-hut', 'moc-thieu', 'khong-treo', 'ha-bi-chan', 'thap-sai', 'het-ray', 'giao-nham'];
const thieuNM = CAN.filter((ma) => !NHIP_MOI.includes("'" + ma + "'"));
kiem('NHIP_MOI của san-ve.js có đủ ' + CAN.length + ' sự kiện có hoạt cảnh riêng theo luật lõi', thieuNM.length === 0, 'thiếu: ' + thieuNM.join(' '));
kiem('keo-theo / van-doi / dong-doi / cong-doi / cong-ket được gom (trượt cùng xuồng, áp lúc dây chạm van, cuối nhịp)', co(sv, "s.ma === 'keo-theo'") && co(sv, 'dsKeoTheo') && co(sv, 'apVanDoi') && co(sv, 'congBatch') && co(sv, "ma: 'cong-batch'"));
kiem("'troi' của xuồng đi chung bước trượt với tien / lui (tween v.x, v.y) và bọt sau đuôi", co(sv, "(s.ma === 'troi' && s.ai === 'robot')") && co(sv, 'laTroi'));

/* ---------- 2. san-ve.js vẽ */
console.log('\n== 2. san-ve.js vẽ ô, vật, robot của hai mùa ==');
kiem('veOMuaMoi vẽ đủ ký hiệu ~ B L Q q K k V T R', ['~', 'Q', 'q', 'T', 'R'].every((k) => co(sv, "ch === '" + k + "'")) && co(sv, "ch === 'K' || ch === 'k'") && co(sv, "ch === '~' || ch === 'B' || ch === 'L'"));
kiem('nước liền mặt sông + dải bờ ở mép giáp ô không phải nước (veBo), dòng chảy có pha theo thời gian và dòng tắt', co(sv, 'veBo: function') && co(sv, "ve('dong-nuoc', { huong: dg.huong, xiet: dg.suc === 2, tat: !!dg.tat, pha:") && co(sv, 'this.nuocT[nx'));
kiem('cống nâng cánh theo congT.k, van quay theo vanT.quay, boong tàu theo tauT.coMat với cạnh ngoài (vienTau), ray dọc / ngang theo rayT', co(sv, "ve('cong-thuy-loi', k <= 0") && co(sv, 'vn.quay') && co(sv, 'vienTau: function') && co(sv, "ve('ray', this.rayT && this.rayT.doc"));
kiem("vỏ 'cang' / 'song' chỉ bật khi sân có T / R / cẩu / chồng / tàu hay ký hiệu nước / xuồng / dòng (màn cũ giữ 'san' / 'tuong')",
  co(sv, /laCang = cfg\.vo === 'cang' \|\| \(cfg\.vo === undefined && \(loai === 'cau' \|\| Array\.isArray\(cfg\.chong\) \|\| Array\.isArray\(cfg\.tau\) \|\| rows\.some/) && co(sv, /\? 'song' : null/) && co(sv, "c.vo === 'cang' ? 'bai-cont' : 'san'"));
kiem('vật nổi B / L thêm SAU vật thường + cfg.vat (thứ tự id của lõi), vẽ to 86 % ô không bóng (veVatNoi), vòng bọt cam khi bị kéo (keo)', co(sv, "vatNoi.push({ x: x, y: y, noi: ch === 'B'") && /\(cfg\.vat \|\| \[\]\)\.forEach[\s\S]{0,400}vatNoi\.forEach/.test(sv) && co(sv, 'veVatNoi: function') && co(sv, "if (o.noi && o.keo) hv = [hv[0], { keo: true }]"));
kiem('chồng container vẽ trên sân (veChong) trước lớp phủ, hienTan khi có taiToiDa, container theo tàu rời mờ dần (giaoMo)', co(sv, 'veChong: function') && co(sv, 'this.veChong(g, now);') && co(sv, 'hienTan = c.taiToiDa !== null') && co(sv, 'giaoMo'));
kiem('sprite xuồng qua VeVector.robot truyền neo / dat / dangDat / chay, tời day / giu, chong chóng bat / nang; dây phao vẽ dưới thân (veDayPhao → VeVector.veDayKeo)',
  co(sv, 'spriteXuong: function') && co(sv, 'neo: !!xu.neo, dat: !!nc.dat, dangDat:') && co(sv, 'day: xu.day > now, giu:') && co(sv, 'VeVector.veDayKeo(g, { x1: p1.x'));
kiem('cần cẩu vẽ bằng VeVector.veCanCau (be: true, nac / tam lẻ, treo, doi, ray, nang, stCont) + tia quét (veTiaQuet) ở lớp phủ', co(sv, 'VeVector.veCanCau(g, { bx: cx, by: cy, nac: ca.nac') && co(sv, 'nang: ca.nang') && co(sv, 'VeVector.veTiaQuet(g, { x: r.tx'));
kiem('quay-can / vuon-can tween nac / tam; moc-cont rời chồng + nang 0 → 1; ha-cont nang 1 → 0 rồi vào chồng; chay-ray tween bệ; tau-roi đẩy container vào giaoMo',
  co(sv, 'ca.nac = n0 + (n1 - n0) * ease(k)') && co(sv, 'ca.tam = t0 + (t1 - t0) * ease(k)') && co(sv, 'q.cont.splice(Math.max(0, q.cont.length - n), n)') && co(sv, 'ca.nang = 1 - ease(k)') && co(sv, "m === 'chay-ray'") && co(sv, 'self.giaoMo.push'));
kiem('lỗi mới dùng hiệu ứng cũ: baoHieu ! / ?, choang, matSuKien dam, canhBao ô đỏ, flash, onRung', /m === 'can-het-tam'[\s\S]{0,900}baoHieu\('!'[\s\S]{0,900}v\.choang[\s\S]{0,900}self\.flash[\s\S]{0,300}this\.onRung/.test(sv) && /m === 'dang-neo'[\s\S]{0,700}this\.canhBao = \{ x: s\.o\.x/.test(sv));
kiem('cuối nhịp đồng bộ vết: neo / keo / vật nổi / cống / van / dòng tắt / nac / tam / treo / chồng / tàu (dongBoMuaMoi)', co(sv, 'dongBoMuaMoi: function') && co(sv, 'this.dongBoMuaMoi(e);') && ['e.cong', 'e.van', 'e.dongTat', 'e.chong', 'e.tau', 'r.nac', 'r.treo', 'r.keo'].every((k) => co(sv, k)));
kiem('datLai đưa cống / van / dòng / chồng / tàu về đầu (datLaiMuaMoi), nap dựng bảng (dungMuaMoi) kể cả coMat theo pha', co(sv, 'this.datLaiMuaMoi();') && co(sv, 'dungMuaMoi: function') && co(sv, '(pha % (co + vang)) < co'));
kiem('máy quét mã: tia quét ở đầu cần (không tia từ bệ); chong chóng: tia xanh tới ô trước mũi', co(sv, "d.cam === 'quet-ma'") && co(sv, "d.cam === 'dong-chay'"));
kiem('ảnh nhỏ (thuSan) nhận vỏ song / cang theo ký hiệu, vẽ lớp dòng và chồng lúc đầu', co(sv, "sg = vo === 'song' ||") && co(sv, "lopMau.dong) || []).forEach") && co(sv, "lopMau.chong) || []).forEach"));

/* ---------- 3. man-choi / cham */
console.log('\n== 3. man-choi.js và cham.js truyền lớp ==');
kiem('man-choi.js cauHinhSan đưa dong / chong / tau / giao / taiToiDa / luatThap / hamGoc xuống Field', co(mc, 'dong: lm.dong || undefined') && co(mc, 'chong: lm.chong || undefined, tau: lm.tau || undefined, giao: lm.giao || undefined, taiToiDa: m.taiToiDa, luatThap: m.luatThap, hamGoc: m.hamGoc'));
kiem('man-choi.js ảnh nhỏ dải chọn sân nhận dong / chong', co(mc, 'vo: ch.vo, dong: ch.dong, chong: ch.chong'));
kiem('cham.js theoSan chép cong / van / dongTat / congBanDau / vanBanDau và chong / tau / daGiao / ray / nac / tam / dau / treo (cả màn nhiều robot)', (ch.match(/cong: res\.cong, van: res\.van, dongTat: res\.dongTat, congBanDau: res\.congBanDau, vanBanDau: res\.vanBanDau/g) || []).length === 2 && (ch.match(/chong: res\.chong, chongBanDau: res\.chongBanDau, tau: res\.tau, tauBanDau: res\.tauBanDau, daGiao: res\.daGiao, ray: res\.ray/g) || []).length === 2);
kiem('SanHoc.lopMauCuaSan trả dong / chong / tau / giao (man-choi dựa vào)', typeof SanHoc.lopMauCuaSan === 'function' && (() => { const l = SanHoc.lopMauCuaSan({ san: ['~'], dong: [1], chong: [2], tau: [3], giao: [4] }, 0); return l.dong[0] === 1 && l.chong[0] === 2 && l.tau[0] === 3 && l.giao[0] === 4; })());

/* ---------- 4. tên lệnh móc cẩu */
console.log('\n== 4. Tên lệnh móc cẩu trên hình = lõi ==');
const TAY_MOC = (sh.match(/var TAY_MOC = \[([^\]]*)\]/) || [, ''])[1].match(/'([a-z0-9_]+)'/g).map((s) => s.replace(/'/g, ''));
const hamGocMoc = (moc.match(/hamGoc: \[([^\]]*)\]/) || [, ''])[1].match(/'([a-z0-9_]+)'/g).map((s) => s.replace(/'/g, ''));
kiem('tay moc-cau hamGoc = TAY_MOC của lõi (' + TAY_MOC.join(', ') + ')', JSON.stringify(hamGocMoc) === JSON.stringify(TAY_MOC), JSON.stringify(hamGocMoc));
kiem("hoc/game không còn 'hook' / 'unhook' / 'hook2' là TÊN LỆNH gốc của cẩu (chữ hook của hàm trẻ tự đặt ở mùa 3 vẫn được)", !/hamGoc: \[[^\]]*'hook'/.test(moc) && !/'unhook'|'hook2'/.test(moc + tc + sv));
kiem('kho lệnh xem-mua-moi.html / máy này dùng pick_up / set_down / pick_up2 và nhân nhận (sân Cảng mẫu đã chạy ở mục 1)', co(xem, "'pick_up', 'set_down', 'pick_up2'") && tenSK.has('moc-cont') && tenSK.has('ha-cont'));

/* ---------- 5. veCanCau + trang xem */
console.log('\n== 5. veCanCau nang / stCont và trang Sân chơi thử ==');
kiem('veCanCau: nang 0..1 đổi cỡ và bóng container treo, stCont truyền hienTan', co(tc, "typeof o.nang === 'number'") && co(tc, 's = c * (0.86 + 0.26 * ng)') && co(tc, 'o.stCont'));
kiem('xem-mua-moi.html có mục Sân chơi thử (#san-thu, nút Chạy / Đặt lại), nạp nhân + san-hoc + ve + san-ve, 5 sân mẫu, phát vết qua Field.phatNhip + docCamBien',
  co(xem, 'id="san-thu"') && co(xem, 'nhan/san-robot-core.js') && co(xem, '../san-hoc.js') && co(xem, 'src="ve.js"') && co(xem, 'src="san-ve.js"') && co(xem, 'new SanVe.Field(cv') && co(xem, 'field.phatNhip(e, 560)') && co(xem, 'field.docCamBien(e.docCamBien') && (xem.match(/\{ ten: '(Bến sông|Cảng sông) \d/g) || []).length === 5);
const style = (xem.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
kiem('CSS trang xem dùng màu qua var(--g-…), không mã hex gõ thẳng', !/#[0-9a-fA-F]{3,8}\b/.test(style) && /var\(--g-/.test(style));
kiem('Sân chơi thử không tràn ngang 375 px: khung sân max-width 100 %, canvas max-width 100 %', co(xem, '.thu .ffr{') && co(xem, 'max-width:100%') && co(xem, 'canvas{display:block;max-width:100%}'));

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
process.exit(hong ? 1 : 0);
