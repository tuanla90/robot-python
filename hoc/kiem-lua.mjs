/* ============================================================================
   kiem-lua.mjs — máy kiểm LỬA (cfg.lua, 30/10, gói 10 mùa 2 "Xe cứu hỏa R1") của "Mật Lệnh Robot" (luật ở san-hoc.js, mục SÚNG BÓNG, đoạn LỬA; kế hoạch hoc/KE-HOACH-GOI-LUA.md).
     - Lửa đang cháy chặn xe (dam-tuong vat 'lua'), chặn tia nước (trung 'lua'), front_clear() False; distance() đếm tới lửa, warm() thấy lửa nóng.
     - Mỗi lần tia trúng suc giảm 1 (phun nhẹ hay mạnh như nhau), về 0 thì tắt hẳn: đi qua được, không cháy lại; phun nhẹ hết tầm thì không trúng.
     - Lửa chắn tia nên van sau lửa không đổi; cú giật đẩy thùng vào lửa thì cả hai đứng yên.
     - Mục tiêu 'dap-lua': thắng khi hết lửa (và đứng ở cờ nếu sân có cờ); tới cờ mà còn lửa thì chưa thắng.
     - Cửa chống cháy (noi với nut là ô lửa): lửa tắt thì cửa mở một lần, phun nữa không đóng lại.
     - Lỗi cấu hình tiếng Việt; cham.js nói "đang cháy" và con-lua; giao diện (san-ve.js, man-choi.js, man-lap.js, chu.js, ve-vector-o2.js, bang-mau.js) kiểm theo mã nguồn.
     - Chỉ màn gói 10 (chương tong-hop-2, trum-mua-2) được khai lua.
   Cờ --loi-gia: cắm lỗi giả để chứng minh máy kiểm đỏ được.
   Chạy: node hoc/kiem-lua.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const M = require(path.join(day, 'lo-trinh-hoc.js'));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
/** Lỗi giả: đổi giá trị đem so, máy kiểm phải đỏ. */
const gia = (v, thay) => (LOI_GIA ? thay : v);
const docs = (r) => r.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const sks = (r) => r.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien);
const loiCfg = (cfg, code) => { try { SanHoc.chay(cfg, code || 'wait()\n'); return ''; } catch (e) { return e.message; } };

const SUNG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance', 'warm', 'front_clear'];
//  x: 0 1 2 3 4
const SAN = ['#####', '#...#', '#...#', '#...#', '#...#', '#####'];
const goc = (them) => Object.assign({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN, batDau: { x: 2, y: 4, huong: 0 }, lucBan: true, lua: [{ x: 2, y: 2, suc: 2 }] }, them || {});
const TIEN = (n) => 'for i in range(' + n + '):\n    left_move()\n    right_move()\n    wait()\n';

console.log('== 1. Dập lửa: warm(), distance(), suc giảm, tắt hẳn ==');
{
  const r = SanHoc.chay(goc(), 'a = warm()\nb = distance()\nf = front_clear()\nspray()\nwait()\nc = warm()\nspray()\nwait()\nd = warm()\ne = distance()\n' + TIEN(3));
  const ds = docs(r), w = ds.filter((d) => d.ham === 'warm'), dk = ds.filter((d) => d.ham === 'distance');
  kiem('trước khi phun: warm() True, distance() 1 (vat lua), front_clear() True (ô trước mặt còn trống)', w[0].nong === gia(true, false) && dk[0].khoang === 1 && dk[0].vat === 'lua' && ds.find((d) => d.ham === 'front_clear').trong === true, J(ds));
  kiem('trúng lần 1: lua-nho suc 1, vẫn nóng; trúng lần 2: lua-nho suc 0 + lua-tat, hết nóng', J(sks(r).filter((e) => e.ma === 'lua-nho').map((e) => e.suc)) === J([1, 0]) && sks(r).filter((e) => e.ma === 'lua-tat').length === 1 && w[1].nong === true && w[2].nong === false);
  kiem('tắt rồi: distance() đếm tới tường (3), xe đi qua ô lửa cũ tới hàng 1; kết quả lua suc 0, luaBanDau suc 2', dk[1].khoang === 3 && r.robot.y === 1 && J(r.lua) === J([{ x: 2, y: 2, suc: 0 }]) && J(r.luaBanDau) === J([{ x: 2, y: 2, suc: 2 }]), J([dk[1], r.robot, r.lua]));
  const r2 = SanHoc.chay(goc({ lua: [{ x: 2, y: 3, suc: 1 }] }), 'f = front_clear()\nwait()\n');
  kiem('lửa ngay trước mũi: front_clear() False, vat lua', docs(r2)[0].trong === false && docs(r2)[0].vat === 'lua', J(docs(r2)));
  const r3 = SanHoc.chay(goc({ lua: [{ x: 2, y: 2, suc: 1 }] }), 'spray()\nwait()\nspray()\nwait()\na = warm()\n');
  kiem('một chiều: phun lần nữa sau khi tắt thì tia bay qua (không trúng lửa), lửa không cháy lại, warm() False', sks(r3).filter((e) => e.ma === 'lua-nho').length === 1 && J(r3.lua) === J([{ x: 2, y: 2, suc: gia(0, 1) }]) && docs(r3)[0].nong === false);
  const r4 = SanHoc.chay(goc({ lua: [{ x: 2, y: 2, suc: 2 }] }), 'spray("high")\nwait()\n');
  kiem('phun mạnh cũng chỉ trừ một (suc 2 → 1)', J(r4.lua) === J([{ x: 2, y: 2, suc: 1 }]), J(r4.lua));
  const r5 = SanHoc.chay(goc({ lua: [{ x: 2, y: 1, suc: 1 }] }), 'spray()\nwait()\n');
  kiem('phun nhẹ hết tầm (lửa cách 2 ô trống): không trúng, lửa còn', J(r5.lua) === J([{ x: 2, y: 1, suc: 1 }]) && sks(r5).some((e) => e.ma === 'ban' && e.hetTam));
}

console.log('== 2. Lửa chắn xe, tia nước, thùng ==');
{
  const r = SanHoc.chay(goc(), TIEN(2));
  const dam = sks(r).filter((e) => e.ma === 'dam-tuong');
  kiem('xe tiến vào ô lửa: dam-tuong vat lua, đứng yên ở hàng 3', dam.length === 1 && dam[0].vat === gia('lua', 'cua') && r.robot.y === 3, J([dam, r.robot]));
  const rv = SanHoc.chay(goc({ san: ['##N##', '#...#', '#...#', '#...#', '#...#', '#####'], lua: [{ x: 2, y: 2, suc: 1 }], noi: [] }), 'spray("high")\nwait()\n');
  const ban = sks(rv).find((e) => e.ma === 'ban');
  kiem('lửa đứng trước van: tia trúng lửa (trung lua), van không đổi', ban.trung === 'lua' && !sks(rv).some((e) => e.ma === 'nut-doi') && rv.nut[0].bat === false, J(ban));
  // thùng nặng ngay sau đuôi xe, lửa sau thùng: cú giật không đẩy được thùng vào lửa
  const rt = SanHoc.chay(goc({ san: ['#####', '#...#', '#...#', '#.H.#', '#...#', '#...#', '#####'], batDau: { x: 2, y: 2, huong: 0 }, lua: [{ x: 2, y: 4, suc: 1 }] }), 'spray("high")\nwait()\n');
  const tc = sks(rt).find((e) => e.ma === 'thung-chan');
  kiem('cú giật đẩy thùng vào lửa: thung-chan vat lua, xe và thùng đứng yên', !!tc && tc.vat === 'lua' && rt.robot.y === 2, J(sks(rt)));
}

console.log('== 3. Mục tiêu dap-lua ==');
{
  const ok = SanHoc.chay(goc({ mucTieu: 'dap-lua' }), 'spray()\nwait()\nspray()\nwait()\nwait()\n');
  kiem('sân không cờ: dập hết là thắng ngay (xong-dap-lua), không cần đi tiếp', ok.thang === gia(true, false) && sks(ok).some((e) => e.ma === 'xong-dap-lua'));
  const thieu = SanHoc.chay(goc({ mucTieu: 'dap-lua' }), 'spray()\nwait()\nwait()\n');
  kiem('còn lửa: không thắng', thieu.thang === false);
  const SAN_CO = ['#####', '#.F.#', '#...#', '#...#', '#...#', '#####'];
  const coLua = SanHoc.chay(goc({ mucTieu: 'dap-lua', san: SAN_CO, lua: [{ x: 1, y: 3, suc: 1 }] }), TIEN(3));
  kiem('sân có cờ: tới cờ mà còn lửa (ngoài đường đi) thì chưa thắng', coLua.thang === false && coLua.robot.y === 1, J(coLua.robot));
  const du = SanHoc.chay(goc({ mucTieu: 'dap-lua', san: SAN_CO }), 'spray()\nwait()\nspray()\nwait()\n' + TIEN(3));
  kiem('sân có cờ: dập hết rồi tới cờ thì thắng', du.thang === true);
  kiem('màn đội không dùng dap-lua (lỗi cấu hình)', /dap-lua chưa dùng cho nhiều robot/.test(loiCfg({ san: SAN, mucTieu: 'dap-lua', lua: [{ x: 2, y: 2, suc: 1 }], doi: [{ batDau: { x: 1, y: 4, huong: 0 }, loaiRobot: 'banh', hamGoc: SUNG }, { batDau: { x: 3, y: 4, huong: 0 }, loaiRobot: 'banh', hamGoc: SUNG }] }, ['wait()\n', 'wait()\n'])) || /dap-lua/.test(loiCfg({ san: SAN, mucTieu: 'dap-lua', lua: [{ x: 2, y: 2, suc: 1 }], doi: [{ batDau: { x: 1, y: 4, huong: 0 }, loaiRobot: 'banh', hamGoc: SUNG }, { batDau: { x: 3, y: 4, huong: 0 }, loaiRobot: 'banh', hamGoc: SUNG }] })));
}

console.log('== 4. Cửa chống cháy ==');
{
  const SAN_C = ['##C##', '#...#', '#...#', '#...#', '#...#', '#####'];
  const cfg = goc({ san: SAN_C, lua: [{ x: 2, y: 2, suc: 1 }], noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 0 }] }] });
  const r = SanHoc.chay(cfg, 'spray()\nwait()\nspray("high")\nwait()\nwait()\n');
  kiem('lửa tắt thì cửa mở ở cuối nhịp; phun lần nữa (tia bay ra cửa mở) không đóng lại', J(r.cua) === J([{ x: 2, y: 0, mo: gia(true, false) }]) && sks(r).filter((e) => e.ma === 'cua-doi').length === 1, J(r.cua));
  const khong = SanHoc.chay(goc({ san: SAN_C, lua: [{ x: 2, y: 2, suc: 1 }] }), 'spray()\nwait()\nwait()\n');
  kiem('lửa không có trong noi thì không điều khiển cửa (sân không khai noi)', J(khong.cua) === J([{ x: 2, y: 0, mo: false }]), J(khong.cua));
  kiem('lửa không điều khiển băng chuyền (lỗi cấu hình)', /không điều khiển băng chuyền/.test(loiCfg(goc({ san: ['#####', '#.>.#', '#...#', '#...#', '#...#', '#####'], noi: [{ nut: { x: 2, y: 2 }, bang: [{ x: 2, y: 1 }] }] }))));
}

console.log('== 5. Lỗi cấu hình ==');
kiem('lửa trên tường', /phải nằm trên ô sàn/.test(loiCfg(goc({ lua: [{ x: 0, y: 0, suc: 1 }] }))));
kiem('suc ngoài 1–3', /từ 1 tới 3/.test(loiCfg(goc({ lua: [{ x: 2, y: 2, suc: 4 }] }))) && /từ 1 tới 3/.test(loiCfg(goc({ lua: [{ x: 2, y: 2, suc: 0 }] }))));
kiem('robot xuất phát trong ô lửa', /xuất phát trong ô lửa/.test(loiCfg(goc({ lua: [{ x: 2, y: 4, suc: 1 }] }))));
kiem('khai hai lần một ô', /khai hai lần/.test(loiCfg(goc({ lua: [{ x: 2, y: 2, suc: 1 }, { x: 2, y: 2, suc: 2 }] }))));
kiem('lua không phải mảng', /lua phải là mảng/.test(loiCfg(goc({ lua: { x: 2, y: 2, suc: 1 } }))));

console.log('== 6. Chấm điểm (cham.js) ==');
{
  const man = (t) => Object.assign({ ma: 'thu-lua.1', loaiRobot: 'banh', hamGoc: SUNG, san: SAN, batDau: { x: 2, y: 4, huong: 0 }, mucTieu: 'dap-lua', lua: [{ x: 2, y: 2, suc: 2 }], sao: { o: 99, nhip: 99 } }, t || {});
  const ma = (r) => (r.chanDoan || []).map((c) => c.ma);
  const lap = ChamHoc.cham(man(), { chinh: ['while warm():', '    spray()', '    wait()'] }, []);
  kiem('while warm(): spray() dập lửa cỡ 2: thắng', lap.thang === true, J(ma(lap)));
  const mot = ChamHoc.cham(man(), { chinh: ['spray()', 'wait()'] }, []);
  const cl = (mot.chanDoan || []).find((c) => c.ma === 'con-lua');
  kiem('phun một lần: con-lua, nói ô lửa và số lần còn phải trúng', !!cl && /ô \(2, 2\)/.test(cl.loi || cl.thongDiep) && /1 lần nữa/.test(cl.loi || cl.thongDiep), J(mot.chanDoan));
  const dam = ChamHoc.cham(man({ mucTieu: 'toi-co', san: ['#####', '#.F.#', '#...#', '#...#', '#...#', '#####'] }), { chinh: ['for i in range(3):', '    left_move()', '    right_move()', '    wait()'] }, []);
  const dt = (dam.chanDoan || []).find((c) => c.ma === 'dam-tuong');
  kiem('đâm vào lửa: dam-tuong nói "đang cháy" và cách dập', !!dt && /đang cháy/.test(dt.loi || dt.thongDiep) && /phun nước/.test(dt.loi || dt.thongDiep), J(dam.chanDoan));
}

console.log('== 7. Giao diện (theo mã nguồn) ==');
{
  const doc = (f) => fs.readFileSync(path.join(day, 'game', f), 'utf8');
  const sv = doc('san-ve.js'), mc = doc('man-choi.js'), ml = doc('man-lap.js'), chu = doc('chu.js'), vo2 = doc('ve-vector-o2.js');
  kiem('san-ve.js: cfg.lua giữ trong this.cfg, datLaiCua dựng luaT, veOVec vẽ ô lua, tia trúng lửa cập nhật suc, dongBoSung theo vết, ảnh nhỏ vẽ lửa',
    /lua: Array\.isArray\(cfg\.lua\) \? cfg\.lua : null/.test(sv) && /this\.luaT = \{\}/.test(sv) && /ve\('lua', \{ suc: lu\.suc/.test(sv) && /kind === 'lua'/.test(sv) && /e\.lua && this\.luaT/.test(sv) && /lopMau && lopMau\.lua/.test(sv));
  kiem('man-choi.js truyền lua (cauHinhSan, ảnh nhỏ), tiêu đề thắng dap-lua; man-lap.js ảnh nhỏ truyền lua; chu.js có thang.tieuDe.dapLua',
    /lua: lm\.lua \|\| undefined/.test(mc) && /lua: ch\.lua/.test(mc) && /'thang\.tieuDe\.dapLua'/.test(mc) && /lua: lm\.lua \}/.test(ml) && /'thang\.tieuDe\.dapLua': /.test(chu));
  kiem('ve-vector-o2.js đăng ký ô lua (phu, trạng thái suc 0–3)', /ma: 'lua', ten: 'Đám cháy', phu: true/.test(vo2) && /\{ suc: 0 \}/.test(vo2));
  kiem('cham.js truyền lua cho lõi ở màn một robot và màn đội', (fs.readFileSync(path.join(day, 'cham.js'), 'utf8').match(/lua: lm\.lua \|\| undefined/g) || []).length === 2);
}

console.log('== 8. Chỉ gói 10 khai lửa ==');
{
  const ngoai = M.danhSach.filter((m) => m.lua && !['tong-hop-2', 'trum-mua-2'].includes(m.chuong)).map((m) => m.ma);
  kiem('màn khai lua chỉ thuộc chương tong-hop-2, trum-mua-2', ngoai.length === 0, J(ngoai));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' + (dat + hong) + ' kiểm' : 'ĐẠT ' + dat + ' kiểm'));
if (LOI_GIA) { if (!hong) { console.log('LỖI GIẢ KHÔNG BỊ BẮT'); process.exitCode = 1; } else console.log('(lỗi giả bị bắt: đúng)'); }
else if (hong) process.exitCode = 1;
