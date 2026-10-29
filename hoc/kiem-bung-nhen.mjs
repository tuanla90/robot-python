/* ============================================================================
   kiem-bung-nhen.mjs — máy kiểm NAM CHÂM BỤNG NHỆN (mùa 3 gói 9, P1 29/10; luật ở san-hoc.js phần NAM CHÂM, mục "NAM CHÂM BỤNG NHỆN").
   Phần A: lõi (cấu hình, hút / thả ở ô ngay dưới, đứng trùm lên vật, mang theo khi đi / nhảy qua hố, thả bị chặn, gỗ / cùng cực, nhịp của lệnh, quên wait,
           đệm từ với nhện có nam châm, rơi hố khi đang mang, nhện KHÔNG nam châm vẫn bị vật chắn như cũ).
   Phần B: lời cham.js (tha-bi-chan / hut-go nói "ô ngay dưới nhện"), luật ghép lap-rap.js, thẻ bộ phận gioi-thieu-part.js.
   Phần C: hình vector (ve-vector.js + thân nhện + tay nam châm): nhện + nam châm ghép được, treo ở ổ duoi (tâm thân), hình khác nhện trần / nhện kẹp, đổi theo cực
           và bật / tắt, thân nhện trần y nguyên khi có ổ duoi, drone vẫn vẽ chữ U.
   Chạy: node hoc/kiem-bung-nhen.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-bung-nhen.mjs --loi-gia  (cố ý bẻ luật: phải ĐỎ; nếu xanh thì máy kiểm không bắt được gì)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const LapRap = require(path.join(day, 'lap-rap.js'));
const GTP = require(path.join(day, 'gioi-thieu-part.js'));

const LOI_GIA = process.argv.includes('--loi-gia');
let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const loi = (f) => { try { f(); return null; } catch (e) { return e.message; } };
const HG = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off'];
const HG_TRAN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'];
const nhip = (kq) => kq.vet.filter((v) => v.loai === 'nhip');
const maNhip = (kq, i) => (nhip(kq)[i - 1] ? nhip(kq)[i - 1].suKien.map((s) => s.ma) : []);
const vt = (kq) => kq.robot.x + ',' + kq.robot.y;
const vat1 = (kq) => kq.vat && kq.vat[0];
/** Chạy nhện trên sân `san` (vật ở ô 'o', chất theo `chat`), xuất phát `bd`, chương trình `ct` (mỗi dòng một lệnh). */
function nhen(san, chat, bd, ct, them) {
  return SanHoc.chay(Object.assign({ loaiRobot: 'nhen', hamGoc: HG, mucTieu: 'toi-co', san, vatChat: chat, batDau: bd }, them || {}), ct.join('\n') + '\n');
}

console.log('A. Lõi nam châm bụng nhện');
{
  // 1 cấu hình
  kiem('nhện + magnet_n / magnet_s / magnet_off: chạy không lỗi cấu hình (trước P1 mùa 3 là "Nhện không gắn nam châm")', loi(() => nhen(['...', '...'], null, { x: 0, y: 0, huong: 1 }, ['wait()'])) === null);
  kiem('nhện + nam châm + tay kẹp (grab): lỗi "một tay"', /chỉ có một tay/.test(loi(() => SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG.concat(['grab', 'release']), mucTieu: 'toi-co', san: ['...'], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n')) || ''));
  kiem('nhện + nam châm + front_metal: vẫn lỗi (nhện không có hướng mặt, không cảm biến từ)', /không gắn cảm biến/.test(loi(() => SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG.concat(['front_metal']), mucTieu: 'toi-co', san: ['...'], batDau: { x: 0, y: 0, huong: 1 } }, 'wait()\n')) || ''));
  // 2 hút sắt ở ô ngay dưới: magnet_n(); go_right() → nhịp 1 chuẩn bị (bật), nhịp 2 bước lên ô sắt rồi hút ở cuối nhịp
  const k2 = nhen(['.o..'], ['.s..'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'go_right()']);
  const hv2 = nhip(k2)[1].suKien.find((s) => s.ma === 'hut-vat');
  kiem('magnet_n(); go_right(): nhịp 1 bật N (chuẩn bị), nhịp 2 đứng lên ô sắt (1,0) rồi hut-vat soO 0 + dinh-vat; vật trangThai cam tại ô nhện',
    nhip(k2)[0].robot.namCham.cuc === 'N' && maNhip(k2, 1).includes('chuan-bi') && vt(k2) === '1,0' && !!hv2 && hv2.soO === 0 && J(hv2.den) === J({ x: 1, y: 0 }) && maNhip(k2, 2).includes('dinh-vat') &&
    vat1(k2).trangThai === (LOI_GIA ? 'dat' : 'cam') && vat1(k2).x === 1 && k2.namCham.cam === 1 && nhip(k2)[1].robot.dangMang === 1, vt(k2) + ' ' + J(nhip(k2).map((n) => n.suKien.map((s) => s.ma))) + ' ' + J(k2.vat));
  // 3 cực S cũng hút sắt; gỗ không; vật nam châm cùng cực nằm yên, khác cực hút
  const k3 = nhen(['.o..'], ['.s..'], { x: 0, y: 0, huong: 1 }, ['magnet_s()', 'go_right()']);
  kiem('magnet_s() cũng hút sắt (cực nào cũng hút sắt)', vat1(k3).trangThai === 'cam' && k3.namCham.cuc === 'S', J(k3.vat));
  const k3g = nhen(['.o..'], ['.g..'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'go_right()']);
  kiem('vật GỖ dưới bụng: hut-go (thông tin), không dính, nhện vẫn đứng trùm lên ô vật', maNhip(k3g, 2).includes('hut-go') && vat1(k3g).trangThai === 'dat' && vt(k3g) === '1,0', J(nhip(k3g).map((n) => n.suKien.map((s) => s.ma))));
  const k3c = nhen(['.o..'], ['.N..'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'go_right()']);
  const k3k = nhen(['.o..'], ['.N..'], { x: 0, y: 0, huong: 1 }, ['magnet_s()', 'go_right()']);
  kiem('vật nam châm N dưới bụng: tay N → cung-cuc, nằm yên; tay S → hút dính', maNhip(k3c, 2).includes('cung-cuc') && vat1(k3c).trangThai === 'dat' && vat1(k3k).trangThai === 'cam', J(maNhip(k3c, 2)) + ' ' + J(k3k.vat));
  // 4 đứng trùm lên vật khi nam châm tắt; nhện KHÔNG nam châm vẫn bị vật chắn (luật cũ)
  const k4 = nhen(['.o..'], ['.s..'], { x: 0, y: 0, huong: 1 }, ['go_right()', 'go_right()']);
  kiem('nhện có nam châm bụng (đang tắt) đi lên ô có vật được (đứng trùm), không hút, đi tiếp được: cuối (2,0), vật nằm yên (1,0)', vt(k4) === '2,0' && vat1(k4).trangThai === 'dat' && vat1(k4).x === 1 && !nhip(k4).some((n) => n.suKien.some((s) => s.ma === 'dam-tuong')), vt(k4) + ' ' + J(nhip(k4).map((n) => n.suKien.map((s) => s.ma))));
  const k4t = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG_TRAN, mucTieu: 'toi-co', san: ['.o..'], vatChat: ['.s..'], batDau: { x: 0, y: 0, huong: 1 } }, 'go_right()\n');
  const dt4 = nhip(k4t)[1].suKien.find((s) => s.ma === 'dam-tuong');
  kiem('nhện KHÔNG nam châm (khay không magnet_*) bước vào ô vật: vẫn đâm "vat" như cũ, đứng yên (0,0)', !!dt4 && dt4.vat === 'vat' && vt(k4t) === '0,0', J(maNhip(k4t, 2)));
  // 5 mang theo khi đi, khi nhảy qua hố; đáp lên ô có vật
  const k5 = nhen(['.ou..', '.....'], ['.s...', '.....'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'go_right()', 'crouch()', 'wait()', 'stand()', 'go_right()', 'go_down()']);
  const sk5 = nhip(k5).map((n) => n.suKien.map((s) => s.ma));
  kiem('mang vật đi: dính ở (1,0), nhảy qua hố (2,0) đáp (3,0), đi xuống (3,1): vật đi theo từng nhịp, không rơi hố', vt(k5) === '3,1' && vat1(k5).trangThai === 'cam' && vat1(k5).x === 3 && vat1(k5).y === 1 && sk5.some((s) => s.includes('nhay')) && !sk5.some((s) => s.includes('roi-ho')) &&
    nhip(k5).every((n) => !n.robot.dangMang || (n.vat[0].x === n.robot.x && n.vat[0].y === n.robot.y)), vt(k5) + ' ' + J(sk5) + ' ' + J(k5.vat));
  const k5d = nhen(['...o.'], ['...s.'], { x: 1, y: 0, huong: 1 }, ['magnet_n()', 'crouch()', 'wait()', 'stand()', 'go_right()']);
  kiem('nhảy đáp lên ô có vật sắt (3,0) được (không nhay-hut), hút ở cuối nhịp nhảy', vt(k5d) === '3,0' && maNhip(k5d, 3).includes('nhay') && maNhip(k5d, 3).includes('hut-vat') && vat1(k5d).trangThai === 'cam', vt(k5d) + ' ' + J(nhip(k5d).map((n) => n.suKien.map((s) => s.ma))));
  // 6 thả: magnet_off(); wait() → tha-vat ở ô nhện; đi tiếp được; dua-vat thắng khi vật trên X
  const k6 = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG, mucTieu: 'dua-vat', san: ['.o.D'], vatChat: ['.s..'], batDau: { x: 0, y: 0, huong: 1 } }, 'magnet_n()\ngo_right()\ngo_right()\ngo_right()\nmagnet_off()\nwait()\n');
  const tv6 = nhip(k6)[nhip(k6).length - 1].suKien.find((s) => s.ma === 'tha-vat');
  kiem('mang sắt tới đích D (3,0), magnet_off(); wait(): tha-vat den (3,0), vật nằm đất trên đích, nam châm tắt, THẮNG dua-vat', !!tv6 && J(tv6.den) === J({ x: 3, y: 0 }) && vat1(k6).trangThai === 'dat' && vat1(k6).x === 3 && k6.namCham.bat === false && k6.thang === true, J(k6.vat) + ' ' + J(k6.namCham) + ' thang=' + k6.thang);
  const k6b = SanHoc.chay({ loaiRobot: 'nhen', hamGoc: HG, mucTieu: 'dua-vat', san: ['.o.D'], vatChat: ['.s..'], batDau: { x: 0, y: 0, huong: 1 } }, 'magnet_n()\ngo_right()\ngo_right()\nmagnet_off()\nwait()\ngo_right()\n');
  kiem('thả ở (2,0) rồi đi tiếp tới (3,0): vật ở (2,0) không trên D, chưa thắng; nhện rời ô được', vat1(k6b).x === 2 && vat1(k6b).trangThai === 'dat' && vt(k6b) === '3,0' && !k6b.thang, J(k6b.vat) + ' ' + vt(k6b));
  // 7 thả bị chặn: đang mang vật A, đứng trùm lên vật B rồi magnet_off → tha-bi-chan 'vat', vật A vẫn dính
  const k7 = nhen(['.oo.'], ['.sg.'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']);
  const tb7 = nhip(k7)[nhip(k7).length - 1].suKien.find((s) => s.ma === 'tha-bi-chan');
  kiem('đang mang sắt, đứng trùm lên vật gỗ (2,0), magnet_off(): tha-bi-chan vat "vat", sắt vẫn dính, nam châm vẫn bật', !!tb7 && tb7.vat === 'vat' && vat1(k7).trangThai === 'cam' && k7.namCham.bat === true, J(nhip(k7).map((n) => n.suKien.map((s) => s.ma))) + ' ' + J(k7.vat));
  // 8 nhịp của lệnh nam châm: wait() làm; quên wait; gọi lại
  const k8 = nhen(['o...'], ['s...'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'wait()']);
  kiem('magnet_n(); wait(): nhịp wait bật và hút luôn vật dưới chân (nhện xuất phát trên ô sắt)', nhip(k8).length === 1 && maNhip(k8, 1).includes('hut-vat') && vat1(k8).trangThai === 'cam', J(nhip(k8).map((n) => n.suKien.map((s) => s.ma))));
  const k8q = nhen(['o...'], ['s...'], { x: 0, y: 0, huong: 1 }, ['wait()', 'magnet_n()']);
  kiem('magnet_n() cuối chương trình không có wait / go_* theo sau: quen-wait, chưa hút', k8q.suKien.some((e) => e.ma === 'quen-wait') && vat1(k8q).trangThai === 'dat', J(k8q.suKien.map((e) => e.ma)));
  const k8g = nhen(['o...'], ['s...'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'magnet_s()', 'wait()']);
  kiem('hai lệnh nam châm chưa trôi nhịp: magnet-goi-lai, cực giữ N', k8g.suKien.some((e) => e.ma === 'magnet-goi-lai') && k8g.namCham.cuc === 'N', J(k8g.suKien.map((e) => e.ma)) + ' ' + J(k8g.namCham));
  // 9 đệm từ: nhện nam châm bụng bật cùng cực đệm → đẩy; khác cực → hút; đang nhảy → miễn
  const SAN9 = ['.....', '.....', '.....', '.....'], DEM9 = [{ x: 2, y: 0, cuc: 'S' }];
  const k9a = nhen(SAN9, null, { x: 2, y: 2, huong: 1 }, ['magnet_s()', 'wait()'], { demTu: DEM9 });
  const k9b = nhen(SAN9, null, { x: 2, y: 2, huong: 1 }, ['magnet_n()', 'wait()'], { demTu: DEM9 });
  const k9c = nhen(SAN9, null, { x: 0, y: 2, huong: 1 }, ['magnet_s()', 'crouch()', 'wait()', 'stand()', 'go_right()'], { demTu: DEM9 });
  kiem('đệm S (2,0), nhện (2,2) bật S: bị đẩy xuống (2,3); bật N: bị hút lên (2,1)', vt(k9a) === '2,3' && maNhip(k9a, 1).includes('dem-day') && vt(k9b) === '2,1' && maNhip(k9b, 1).includes('dem-hut'), vt(k9a) + ' ' + vt(k9b));
  kiem('nhện bật S nhảy từ (0,2) đáp (2,2) dưới đệm S: nhịp nhảy miễn đệm (không dem-day), cuối (2,2)', vt(k9c) === '2,2' && !nhip(k9c).some((n) => n.suKien.some((s) => s.ma === 'nhay') && n.suKien.some((s) => /^dem-/.test(s.ma))), vt(k9c) + ' ' + J(nhip(k9c).map((n) => n.suKien.map((s) => s.ma))));
  // 10 rơi hố khi đang mang: chương trình dừng, vật vẫn 'cam' ở nhịp cuối
  const k10 = nhen(['.ou.'], ['.s..'], { x: 0, y: 0, huong: 1 }, ['magnet_n()', 'go_right()', 'go_right()', 'go_right()']);
  kiem('mang sắt đi bộ vào hố (2,0): roi-ho, dừng sớm, không thắng, vật rơi theo (vết cuối vẫn cam tại ô hố)', k10.dungSom === 'roi-ho' && !k10.thang && vat1(k10).trangThai === 'cam' && vat1(k10).x === 2 && nhip(k10).length === 4, J({ dungSom: k10.dungSom, vat: k10.vat, n: nhip(k10).length }));
  // 11 xe bánh / drone không đổi: xe bánh nam châm vẫn hút trước mũi (2 ô), drone vẫn hút ô dưới
  const kx = SanHoc.chay({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait', 'magnet_n', 'magnet_off'], mucTieu: 'toi-co', san: ['...o'], vatChat: ['...s'], batDau: { x: 0, y: 0, huong: 1 } }, 'magnet_n()\nwait()\n');
  const kd = SanHoc.chay({ loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'magnet_n', 'magnet_off'], mucTieu: 'toi-co', san: ['.o..'], vatChat: ['.s..'], batDau: { x: 0, y: 0, huong: 1 } }, 'magnet_n()\ngo_right()\n');
  kiem('xe bánh: sắt cách 3 ô ngoài tầm (ngoai-tam), không hút; drone: bay lên ô sắt rồi hút (soO 0) như cũ', kx.suKien.some((e) => e.ma === 'ngoai-tam') && vat1(kx).trangThai === 'dat' && vat1(kd).trangThai === 'cam' && kd.robot.dangMang === undefined, J(kx.suKien.map((e) => e.ma)) + ' ' + J(kd.vat));
}

console.log('B. Lời cham.js, luật ghép, thẻ bộ phận');
{
  function man(m) {
    return ManHoc.chuanHoa(Object.assign({ ma: 'thu.1', id: 'thu.1', chuong: 'bung-nhen', so: 1, ten: 'thử', hang: 'lam-quen', deBai: '', loaiRobot: 'nhen', hamGoc: HG, mucTieu: 'toi-co', cauTruc: [], moXuong: true, camHamCuaEm: false,
      khung: { chinh: 10, moiHam: 10 }, maMau: { chinh: [] }, hamCuaEmCan: [], taoHam: [], sao: { o: 5, nhip: 5 }, loiGiai: { chinh: ['wait()'] }, loiSai: [], goiY: [], robot: { than: 'nhen', tay: 'nam-cham', camBien: [] } }, m));
  }
  const mB = man({ san: ['.oo..', '....F'], vatChat: ['.sg..', '.....'], batDau: { x: 0, y: 0, huong: 1 } });
  const cB = ChamHoc.cham(mB, { chinh: ['magnet_n()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()'] }, []);
  const tbB = (cB.chanDoan || []).find((c) => c.ma === 'tha-bi-chan');
  kiem('cham.js tha-bi-chan cho nhện: nói "ô ngay dưới nhện", "đi sang ô khác rồi thả", không nói drone', !!tbB && /ô ngay dưới nhện/.test(tbB.loi) && /đi sang ô khác/.test(tbB.loi) && !/drone/i.test(tbB.loi), J((cB.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
  const mG = man({ san: ['.o...', '....F'], vatChat: ['.g...', '.....'], batDau: { x: 0, y: 0, huong: 1 } });
  const cG = ChamHoc.cham(mG, { chinh: ['magnet_n()', 'go_right()'] }, []);
  const hgG = (cG.chanDoan || []).find((c) => c.ma === 'hut-go');
  kiem('cham.js hut-go cho nhện: "vật ngay dưới nhện", "đi tới đúng ô có vật sắt"', !!hgG && /vật ngay dưới nhện/.test(hgG.loi) && /nhện: đi tới đúng ô có vật sắt/.test(hgG.loi), J((cG.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
  const cQ = ChamHoc.cham(mG, { chinh: ['go_right()', 'magnet_n()'] }, []);
  const qw = (cQ.chanDoan || []).find((c) => c.ma === 'quen-wait');
  kiem('cham.js quen-wait cho nhện với lệnh nam châm: lời nhện ("bước go_*()")', !!qw && /bước go_\*\(\)/.test(qw.loi), J((cQ.chanDoan || []).map((c) => c.ma + ': ' + c.loi)));
  const gh = (than, tay, camBien) => LapRap.kiemGhep({ than, tay, camBien });
  kiem('lap-rap.js: nhện + nam châm ghép được; nhện + máy ném / vòi phun / tay xoay vẫn sai; nhện + cảm biến từ vẫn sai', gh('nhen', 'nam-cham', null).ok && !gh('nhen', 'nem', null).ok && !gh('nhen', 'hoi', null).ok && !gh('nhen', 'xoay', null).ok && !gh('nhen', null, 'tu').ok, J([gh('nhen', 'nam-cham', null), gh('nhen', 'nem', null)]));
  const nd = GTP.noiDung('nam-cham', HG, [], 'nhen');
  kiem('thẻ bộ phận Nam châm trên thân nhện: có lưu ý "treo dưới bụng", "mang theo khi đi và khi nhảy"; trên hai bánh không có', (nd.luuY || []).some((s) => /nhện, nam châm treo dưới bụng/.test(s) && /nhảy/.test(s)) && !(GTP.noiDung('nam-cham', HG, [], 'hai-banh').luuY || []).some((s) => /nhện/.test(s)), J(nd.luuY));
}

console.log('C. Hình vector: nam châm bụng nhện');
{
  // Harness nhỏ: canvas ghi lệnh (như kiem-ve-vector.mjs taoKhung) cho ve-vector.js chạy trong node.
  class Ctx {
    constructor(cv) { this.canvas = cv; this.lenh = []; }
    ghi(t, a) { this.lenh.push(t + '(' + Array.from(a).map((v) => (v && v.__cv ? 'cv' : v && v.__gr ? 'gr' : typeof v === 'number' ? +v.toFixed(3) : String(v))).join(',') + ')'); }
    createLinearGradient() { return { __gr: true, addColorStop() {} }; }
    createRadialGradient() { return { __gr: true, addColorStop() {} }; }
    measureText(s) { return { width: String(s).length * 5 }; }
    getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; }
    getImageData(x, y, w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
    setLineDash(a) { this.ghi('setLineDash', [a]); }
  }
  for (const k of ['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'globalAlpha', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'font', 'textAlign', 'textBaseline', 'miterLimit', 'globalCompositeOperation', 'filter', 'shadowBlur', 'shadowColor'])
    Object.defineProperty(Ctx.prototype, k, { get() { return this['_' + k]; }, set(v) { this['_' + k] = v; this.ghi('=' + k, [v]); } });
  for (const k of ['save', 'restore', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'bezierCurveTo', 'quadraticCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'drawImage', 'clip', 'fillText', 'strokeText', 'translate', 'rotate', 'scale', 'setTransform', 'putImageData', 'roundRect'])
    Ctx.prototype[k] = function () { this.ghi(k, arguments); };
  class Cv { constructor() { this.__cv = true; this.width = 1; this.height = 1; this.style = {}; this.__ctx = new Ctx(this); } getContext() { return this.__ctx; } }
  globalThis.document = { createElement() { return new Cv(); } };
  const VV = require(path.join(day, 'game', 've-vector.js'));
  for (const f of ['ve-vector-than-nhen', 've-vector-than-drone', 've-vector-than-hai-banh', 've-vector-tay-nam-cham', 've-vector-tay-kep']) require(path.join(day, 'game', f + '.js'));
  if (LOI_GIA) VV.lay('than', 'nhen').tayDuoi = [];                                  // lỗi giả: thân nhện không nhận tay ở ổ duoi (như trước P1 mùa 3): ghép phải ném lỗi, mục C đỏ
  const ve = (cfg, st, h) => { VV.xoaDem(); const cv = VV.robot(cfg, st, h || 0, 84); return cv ? cv.getContext().lenh.join('\n') : null; };
  const ghep = loi(() => VV.kiemGhep({ than: 'nhen', tay: 'nam-cham' }));
  kiem('VeVector.kiemGhep: nhện + nam châm ghép được (treo ở oTayDuoi tâm thân); cảm biến ở "ổ duoi" của nhện vẫn bị từ chối như cũ (duoi không phải ổ của nhện)', ghep === null && /không có ổ "duoi"/.test(loi(() => VV.kiemGhep({ than: 'nhen', camBien: [{ ma: 'khoang-cach', o: 'duoi' }] })) || ''), String(ghep));
  const t = VV.lay('than', 'nhen');
  kiem('thân nhện khai oTayDuoi (50, 42) = giữa vỏ phía đuôi (không đè dải mắt) và tayDuoi ["nam-cham"]; oGan KHÔNG có duoi; ổ tay (50, 81) giữ nguyên cho tay kẹp', !!t && t.oTayDuoi && t.oTayDuoi.x === 50 && t.oTayDuoi.y === 42 && !t.oGan.duoi && J(t.tayDuoi) === J(['nam-cham']) && t.oGan.tay.y === 81, J(t && t.oGan));
  const dk = VV.diemGan({ than: 'nhen', tay: 'kep' }, 0, 84);
  kiem('diemGan: nhện + kẹp vẫn ở ổ tay (mũi); diemO duoi của nhện = null (không phải ổ)', !!dk && VV.diemO({ than: 'nhen' }, 'duoi', 0, 84) === null, J([dk, VV.diemO({ than: 'nhen' }, 'duoi', 0, 84)]));
  const tran = ve({ than: 'nhen' }, {}), kep = ve({ than: 'nhen', tay: 'kep' }, { tay: { tuThe: 'tren', kep: 'mo' } });
  const ncN = ve({ than: 'nhen', tay: 'nam-cham' }, { tay: { cuc: 'N', bat: true } }), ncS = ve({ than: 'nhen', tay: 'nam-cham' }, { tay: { cuc: 'S', bat: true } }), ncOff = ve({ than: 'nhen', tay: 'nam-cham' }, { tay: { cuc: 'N', bat: false } }), nc0 = ve({ than: 'nhen', tay: 'nam-cham' }, { tay: {} });
  kiem('hình nhện + nam châm bụng vẽ được, khác nhện trần, khác nhện kẹp', !!ncN && ncN !== tran && ncN !== kep, (ncN || '').length);
  kiem('đĩa nam châm đổi theo cực (N khác S), bật khác tắt, chưa khai cực khác N', ncN !== ncS && ncN !== ncOff && nc0 !== ncN && nc0 !== ncS, [ncN.length, ncS.length, ncOff.length, nc0.length].join('/'));
  kiem('hình nhện + nam châm bụng = hình nhện trần + thêm lệnh (thân vẽ y nguyên, đĩa đè lên sau)', ncOff.startsWith(tran.split('\nrestore()').slice(0, -1).join('\nrestore()')) || ncOff.indexOf(tran.slice(0, Math.floor(tran.length * 0.6))) === 0, ncOff.slice(0, 80));
  kiem('nhện + nam châm bụng: bốn hướng 0..3 ra cùng một hình (không quay mặt; VeRobot truyền hướng 0)', ve({ than: 'nhen', tay: 'nam-cham' }, { tay: { cuc: 'N', bat: true } }, 0) === ncN && ve({ than: 'nhen', tay: 'nam-cham' }, { tay: { cuc: 'N', bat: true } }, 0) === ncN);
  const drN = ve({ than: 'drone', tay: 'nam-cham' }, { tay: { cuc: 'N', bat: true } }), xeN = ve({ than: 'hai-banh', tay: 'nam-cham' }, { tay: { cuc: 'N', bat: true } });
  kiem('drone + nam châm (chữ U treo) và hai bánh + nam châm (chữ U mũi) vẫn vẽ được, khác hình nhện', !!drN && !!xeN && drN !== ncN && xeN !== ncN);
  kiem('mã tay nam châm: nhánh nhện chỉ chạy khi s.duoi && s.than === "nhen" (drone giữ nhánh cũ "treo dưới bụng drone")', /s\.duoi && s\.than === 'nhen'/.test(require('node:fs').readFileSync(path.join(day, 'game', 've-vector-tay-nam-cham.js'), 'utf8')));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) : 'Đạt ' + dat + ' / ' + dat) + (LOI_GIA ? ' (--loi-gia: phải HỎNG)' : ''));
process.exit(hong ? 1 : 0);
