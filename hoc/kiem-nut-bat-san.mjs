/* ============================================================================
   kiem-nut-bat-san.mjs — máy kiểm NÚT BẬT SẴN (cfg.nutBat, 27/10) của "Robot Chấn Hưng" (luật ở san-hoc.js, mục SÚNG BÓNG + HỒNG NGOẠI).
     - Màn khai nutBat = [{ x, y }] (ô nút N): nút đó ĐANG BẬT (nóng) từ đầu màn; bắn trúng thì tắt, bắn nữa lại bật (luật đổi cũ).
     - warm() trước phát bắn nào = True; distance() không đổi; nutBanDau / vết / kết quả cham.js ghi bat true.
     - Nút bật sẵn KHÔNG ĐƯỢC NỐI cửa / băng chuyền (mặc định hay cfg.noi): ném lỗi cấu hình tiếng Việt. Không nối thì được (noi bỏ nút đó, hay cua: [] bang: []).
     - Màn cũ (không khai nutBat) chạy y nguyên: mọi nút tắt lúc đầu; không màn nào ngoài gói Đo nhiệt (do-nhiet, che-do-nhiet) khai nutBat.
     - Giao diện (san-ve.js, man-choi.js, man-lap.js): kiểm theo mã nguồn (vẽ cần trình duyệt).
   Cờ --loi-gia: cắm lỗi giả để chứng minh máy kiểm đỏ được.
   Chạy: node hoc/kiem-nut-bat-san.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const docs = (r) => r.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const loiCfg = (cfg, code) => { try { SanHoc.chay(cfg, code || 'wait()\n'); return ''; } catch (e) { return e.message; } };
/** Lỗi giả: giả vờ luật bị tắt bằng cách đổi giá trị đem so. */
const gia = (v, thay) => (LOI_GIA ? thay : v);

const BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
const SUNG = BANH.concat(['shoot', 'shoot_back', 'distance', 'warm']);
//  x: 0 1 2 3 4 5 6
const SAN = ['#######', '#..N..#', '#.....#', '#.....#', '#.....#', '#######'];      // nút (3,1) trên tường trên
const goc = (them) => Object.assign({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN, batDau: { x: 3, y: 2, huong: 0 } }, them || {});
const BA_LAN = 'a = warm()\nd1 = distance()\nshoot()\nwait()\nb = warm()\nd2 = distance()\nshoot()\nwait()\nc = warm()\nd3 = distance()\nwait()\n';
const nongs = (r) => docs(r).filter((d) => d.ham === 'warm').map((d) => d.nong);
const khoangs = (r) => docs(r).filter((d) => d.ham === 'distance').map((d) => d.khoang);

console.log('== 1. warm() / distance() với nút bật sẵn ==');
{
  const rBat = SanHoc.chay(goc({ nutBat: [{ x: 3, y: 1 }] }), BA_LAN);
  const rCu = SanHoc.chay(goc(), BA_LAN);
  kiem('nút bật sẵn: warm() trước / sau phát 1 / sau phát 2 = [True, False, True]', !rBat.loi && J(nongs(rBat)) === J(gia([true, false, true], [false, true, false])), J(nongs(rBat)));
  kiem('cùng sân không khai nutBat (luật cũ): [False, True, False]', !rCu.loi && J(nongs(rCu)) === J([false, true, false]), J(nongs(rCu)));
  kiem('distance() không đổi: hai bản cùng số ô (0, 1, 2 sau hai cú giật), vật cản là nút', J(khoangs(rBat)) === J(khoangs(rCu)) && J(khoangs(rBat)) === '[0,1,2]' && docs(rBat).every((d) => d.vat === 'nut'), J([khoangs(rBat), khoangs(rCu)]));
  kiem('nutBanDau ghi bat true; trạng thái cuối (hai phát) lại bật', J(rBat.nutBanDau) === J([{ x: 3, y: 1, bat: gia(true, false) }]) && J(rBat.nut) === J([{ x: 3, y: 1, bat: true }]), J([rBat.nutBanDau, rBat.nut]));
  const nutDoi = rBat.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien || []).filter((s) => s.ma === 'nut-doi').map((s) => s.bat);
  kiem('sự kiện nut-doi: phát 1 TẮT (bat false), phát 2 BẬT (bat true)', J(nutDoi) === J(gia([false, true], [true, false])), J(nutDoi));
  const vetNut = rBat.vet.filter((e) => e.loai === 'nhip' && e.nut).map((e) => e.nut[0].bat);
  kiem('vết nhịp ghi nút: sau nhịp 1 tắt, sau nhịp 2 bật, nhịp 3 bật', J(vetNut) === J([false, true, true]), J(vetNut));
  // warm đọc ngay đầu màn, không bắn gì: nóng; nút KHÁC trên sân vẫn tắt
  const SAN2 = ['#N###N#', '#.....#', '#.....#', '#######'];
  const r2 = SanHoc.chay({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN2, batDau: { x: 1, y: 2, huong: 0 }, nutBat: [{ x: 5, y: 0 }] }, 'a = warm()\nwait()\n');
  const r3 = SanHoc.chay({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN2, batDau: { x: 5, y: 2, huong: 0 }, nutBat: [{ x: 5, y: 0 }] }, 'a = warm()\nwait()\n');
  kiem('hai nút, chỉ (5,0) bật sẵn: nhìn nút (1,0) → False, nhìn nút (5,0) → True; nutBanDau đúng từng nút', J(nongs(r2)) === '[false]' && J(nongs(r3)) === J([gia(true, false)]) && J(r2.nutBanDau) === J([{ x: 1, y: 0, bat: false }, { x: 5, y: 0, bat: true }]), J([nongs(r2), nongs(r3), r2.nutBanDau]));
  // nutBat rỗng / undefined / null: như màn cũ, kết quả chạy giống hệt
  const giong = [[], undefined, null].every((v) => J(SanHoc.chay(goc({ nutBat: v }), BA_LAN)) === J(rCu));
  kiem('nutBat [] / undefined / null: kết quả chạy giống hệt màn không khai', giong);
  // nhiều robot: R2 bắn nút bật sẵn, R1 chờ cho tới khi nút NGUỘI (while warm(): wait())
  const CHO = {
    san: ['#######', '#.....#', '#..N..#', '#.....#', '#######'], nutBat: [{ x: 3, y: 2 }],
    doi: [{ batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['warm']) }, { batDau: { x: 3, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['shoot', 'shoot_back']) }]
  };
  const rd = SanHoc.chay(CHO, ['n = 0\nwhile warm():\n    n = n + 1\n    wait()\n', 'wait()\nwait()\nshoot()\nwait()\n']);
  const nd = docs(rd).filter((d) => d.ham === 'warm').map((d) => d.nong);
  kiem('nhiều robot (cfg.doi cùng sân): R1 thấy nút bật sẵn nóng, R2 bắn ở nhịp 3 thì R1 thấy nguội', !rd.loi && nd[0] === gia(true, false) && nd[nd.length - 1] === false && nd.length === 4, J([rd.loi, nd]));
}

console.log('\n== 2. Nối cửa / băng chuyền: nút bật sẵn không được nối ==');
{
  const SAN_C = ['#######', '#..N..#', '#.....#', '#..C..#', '#.....#', '#######'];      // cửa đóng (3,3)
  const SAN_B = ['#######', '#..N..#', '#.....#', '#.>>..#', '#.....#', '#######'];      // băng chuyền (2,3), (3,3)
  const cfgC = (them) => Object.assign({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN_C, batDau: { x: 3, y: 2, huong: 0 }, nutBat: [{ x: 3, y: 1 }] }, them || {});
  let e = loiCfg(cfgC());
  kiem('sân có cửa, không khai noi (mặc định nút điều khiển mọi cửa) → lỗi cấu hình "Nút bật sẵn (3, 1) đang điều khiển 1 cửa"', gia(/Nút bật sẵn \(3, 1\) đang điều khiển 1 cửa/.test(e), !e), e);
  e = loiCfg(Object.assign({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN_B, batDau: { x: 3, y: 2, huong: 0 }, nutBat: [{ x: 3, y: 1 }] }));
  kiem('sân có băng chuyền, không khai noi → lỗi "đang điều khiển 2 ô băng chuyền"', /đang điều khiển 2 ô băng chuyền/.test(e), e);
  e = loiCfg(cfgC({ noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 3 }] }] }));
  kiem('noi ghi nút bật sẵn với cửa → lỗi cấu hình', /Nút bật sẵn \(3, 1\)/.test(e), e);
  e = loiCfg(cfgC({ noi: [{ nut: { x: 3, y: 1 }, cua: [], bang: [] }] }));
  kiem('noi ghi nút bật sẵn với cua: [] và bang: [] → chạy được', e === '', e);
  // hai nút: nút (1,1) mở cửa (noi), nút (5,1) bật sẵn không nối gì
  const SAN_2 = ['#######', '#N...N#', '#.....#', '###C###', '#.....#', '#######'];
  const cfg2 = { loaiRobot: 'banh', hamGoc: SUNG, san: SAN_2, batDau: { x: 1, y: 2, huong: 0 }, nutBat: [{ x: 5, y: 1 }], noi: [{ nut: { x: 1, y: 1 }, cua: [{ x: 3, y: 3 }] }] };
  e = loiCfg(cfg2);
  kiem('noi bỏ nút bật sẵn (nút không có trong noi thì không điều khiển gì) → chạy được', e === '', e);
  const r = SanHoc.chay(cfg2, 'shoot()\nwait()\n');
  kiem('nút thường (1,1) vẫn mở cửa như cũ; nút bật sẵn (5,1) vẫn bật, cửa ban đầu đúng ký hiệu C', !r.loi && J(r.cua) === '[{"x":3,"y":3,"mo":true}]' && J(r.cuaBanDau) === '[{"x":3,"y":3,"mo":false}]' && J(r.nut) === J([{ x: 1, y: 1, bat: true }, { x: 5, y: 1, bat: true }]) && J(r.nutBanDau) === J([{ x: 1, y: 1, bat: false }, { x: 5, y: 1, bat: true }]), J([r.loi, r.cua, r.nut, r.nutBanDau]));
  const r2 = SanHoc.chay(Object.assign({}, cfg2, { batDau: { x: 5, y: 2, huong: 0 } }), 'shoot()\nwait()\n');
  kiem('bắn nút bật sẵn: nút tắt, cửa KHÔNG đổi (không nối gì), không có sự kiện cua-doi / bang-doi', !r2.loi && J(r2.nut[1]) === J({ x: 5, y: 1, bat: false }) && J(r2.cua) === '[{"x":3,"y":3,"mo":false}]' && !r2.suKien.some((s) => s.ma === 'cua-doi' || s.ma === 'bang-doi'), J([r2.loi, r2.nut, r2.cua]));
  // cửa nhịp không do nút điều khiển: sân chỉ có cửa nhịp thì nút bật sẵn được (không nối gì)
  e = loiCfg({ loaiRobot: 'banh', hamGoc: SUNG, san: SAN_C, batDau: { x: 3, y: 2, huong: 0 }, nutBat: [{ x: 3, y: 1 }], cuaNhip: [{ x: 3, y: 3, mo: 1, dong: 1 }] });
  kiem('sân chỉ có cửa nhịp (nút không điều khiển cửa nhịp) → chạy được', e === '', e);
}

console.log('\n== 3. Lỗi cấu hình khác ==');
{
  let e = loiCfg(goc({ nutBat: [{ x: 2, y: 1 }] }));
  kiem('ô không phải nút N → lỗi "Nút bật sẵn: ô (2, 1) không phải nút bắn N"', /Nút bật sẵn: ô \(2, 1\) không phải nút bắn N\./.test(e), e);
  e = loiCfg({ loaiRobot: 'banh', hamGoc: SUNG, san: ['#####', '#.M.#', '#...#', '#####'], batDau: { x: 1, y: 2, huong: 0 }, nutBat: [{ x: 2, y: 1 }] });
  kiem('ô nút đè M → lỗi ghi rõ nút đè M không bật sẵn được', /nút đè M không bật sẵn được/.test(e), e);
  e = loiCfg(goc({ nutBat: { x: 3, y: 1 } }));
  kiem('nutBat không phải mảng → lỗi "nutBat phải là mảng"', /nutBat phải là mảng/.test(e), e);
}

console.log('\n== 4. cham.js và màn nhiều sân ==');
{
  const man = { ma: 'thu.nut-bat', loaiRobot: 'banh', hamGoc: SUNG, san: SAN, batDau: { x: 3, y: 2, huong: 0 }, mucTieu: 'toi-co', nutBat: [{ x: 3, y: 1 }] };
  const kq = ChamHoc.cham(man, { chinh: ['w = warm()', 'wait()'], hamCuaMan: [] }, []);
  kiem('ChamHoc.cham đưa man.nutBat xuống lõi: nutBanDau bat true, warm() True', J(kq.nutBanDau) === J([{ x: 3, y: 1, bat: gia(true, false) }]) && docs(kq).some((d) => d.ham === 'warm' && d.nong === true), J(kq.nutBanDau));
  const kq0 = ChamHoc.cham(Object.assign({}, man, { nutBat: undefined }), { chinh: ['w = warm()', 'wait()'], hamCuaMan: [] }, []);
  kiem('cùng màn không khai nutBat: nutBanDau bat false (như cũ)', J(kq0.nutBanDau) === J([{ x: 3, y: 1, bat: false }]), J(kq0.nutBanDau));
  // nhiều sân: nutBat song song với san (sân 1 bật sẵn, sân 2 không)
  const manN = Object.assign({}, man, { san: [SAN, SAN], batDau: [{ x: 3, y: 2, huong: 0 }, { x: 3, y: 2, huong: 0 }], nutBat: [[{ x: 3, y: 1 }], null] });
  kiem('SanHoc.lopMauCuaSan lấy nutBat theo sân (mảng song song)', J(SanHoc.lopMauCuaSan(manN, 0).nutBat) === '[{"x":3,"y":1}]' && SanHoc.lopMauCuaSan(manN, 1).nutBat === null && J(SanHoc.lopMauCuaSan(man, 0).nutBat) === '[{"x":3,"y":1}]');
  const kqN = ChamHoc.cham(manN, { chinh: ['w = warm()', 'wait()'], hamCuaMan: [] }, []);
  const wN = kqN.theoSan.map((s) => docs(s).filter((d) => d.ham === 'warm').map((d) => d.nong)[0]);
  const bdN = kqN.theoSan.map((s) => s.nutBanDau[0].bat);
  kiem('màn hai sân (theoSan): sân 1 warm() True + nutBanDau bật, sân 2 warm() False + tắt', J(wN) === J([gia(true, false), false]) && J(bdN) === '[true,false]', J([wN, bdN]));
  // đội robot (cham chung, cfg.doi)
  const manDoi = { ma: 'thu.nut-bat-doi', san: ['#######', '#.....#', '#..N..#', '#.....#', '#######'], nutBat: [{ x: 3, y: 2 }], mucTieu: 'toi-co',
    doi: [{ batDau: { x: 1, y: 2, huong: 1 }, loaiRobot: 'banh', hamGoc: BANH.concat(['warm']) }, { batDau: { x: 3, y: 3, huong: 0 }, loaiRobot: 'banh', hamGoc: BANH.concat(['shoot', 'shoot_back']) }] };
  const kd = ChamHoc.cham(manDoi, { doi: [{ chinh: ['w = warm()', 'wait()'] }, { chinh: ['wait()'] }], hamCuaMan: [] }, []);
  kiem('cham.js đội robot (cfg.doi) cũng đưa nutBat xuống: nutBanDau bat true', J(kd.nutBanDau) === J([{ x: 3, y: 2, bat: gia(true, false) }]), J([kd.nutBanDau, kd.chanDoan && kd.chanDoan.slice(0, 2)]));
}

console.log('\n== 5. Màn cũ y nguyên ==');
{
  const M = require(path.join(day, 'lo-trinh-hoc.js'));
  // Gói 7 Đo nhiệt (man-do-nhiet.js, chương do-nhiet / che-do-nhiet) là nơi DÙNG nutBat: kiem-do-nhiet.mjs kiểm các màn đó. Mọi màn khác vẫn phải y nguyên.
  const GOI_DUNG = ['do-nhiet', 'che-do-nhiet'];
  const GOI_DUNG_SAU = ['doi-mua-2', 'che-doi-mua-2',   // gói 8 Đội (man-doi-mua-2.js): vài màn có đèn nóng (nutBat), kiem-doi-mua-2.mjs kiểm; không bắt buộc màn nào cũng khai
    'be-sung', 'che-be-sung',                           // gói 9 Bệ súng xích (man-be-sung.js): màn đọc warm() ở trạm có nút bật sẵn, kiem-be-sung.mjs kiểm
    'tong-hop-2', 'trum-mua-2'];                        // gói 10 Nhà máy chạy lại (man-trum-mua-2.js): màn đọc warm() có nút bật sẵn, kiem-trum-mua-2.mjs kiểm
  const ds = M.danhSach.filter((m) => !GOI_DUNG.includes(m.chuong) && !GOI_DUNG_SAU.includes(m.chuong));
  const dung = M.danhSach.filter((m) => GOI_DUNG.includes(m.chuong));
  kiem('không màn nào ngoài gói Đo nhiệt khai nutBat; màn gói Đo nhiệt nào cũng khai', ds.length > 500 && ds.every((m) => m.nutBat === undefined && !(m.doi || []).some((r) => r.nutBat !== undefined)) && dung.every((m) => Array.isArray(m.nutBat) && m.nutBat.length),
    ds.length + ' màn khác, ' + dung.length + ' màn Đo nhiệt');
  const coNut = ds.filter((m) => m.loiGiai && /N/.test(J(m.san)));
  let sai = [];
  for (const m of coNut) {
    const kq = ChamHoc.cham(m, m.loiGiai, []);
    if (!Array.isArray(kq.nutBanDau) || kq.nutBanDau.some((n) => n.bat !== gia(false, true))) sai.push(m.ma);
  }
  kiem('mọi màn có nút N (lời giải mẫu qua cham.js): nutBanDau đủ nút, tất cả tắt', coNut.length > 20 && !sai.length, coNut.length + ' màn; sai: ' + sai.slice(0, 5).join(', '));
}

console.log('\n== 6. Giao diện (theo mã nguồn) ==');
{
  const sv = fs.readFileSync(path.join(day, 'game', 'san-ve.js'), 'utf8');
  const mc = fs.readFileSync(path.join(day, 'game', 'man-choi.js'), 'utf8');
  const ml = fs.readFileSync(path.join(day, 'game', 'man-lap.js'), 'utf8');
  kiem('san-ve.js nap(): cfg.nutBat giữ trong this.cfg; datLaiCua bật nút đó ngay khung đầu (veOVec vẽ nút bật + veNong quầng nóng vì nutT bat; V7c2: hết nhánh pixel)',
    /nutBat: Array\.isArray\(cfg\.nutBat\) \? cfg\.nutBat : null/.test(sv) && /\(\(this\.cfg && this\.cfg\.nutBat\) \|\| \[\]\)\.forEach\(function \(o\) \{ self\.nutO\(o\.x, o\.y\)\.bat = true; \}\)/.test(sv) && /sN = \{ bat: bat, loe: [^}]*\}[\s\S]{0,400}?ve\('nut-ban', sN\); if \(bat\) this\.veNong\(g, x, y, now\)/.test(sv));   // 29/10 van hơi: trạng thái gom vào sN (thêm góc quay goc khi đổi)
  // ảnh nhỏ: nút bật sẵn → hình vector 'nut-ban' {bat} (thuOVec, V7c2: hết bản pixel xanh / viền cam)
  kiem('san-ve.js thuSan (ảnh nhỏ): nút bật sẵn vẽ hình nut-ban trạng thái bat (thuOVec)', /lopMau && lopMau\.nutBat/.test(sv) && /else if \(ma === 'nut-ban' && nutBat\[x \+ ',' \+ y\]\) st\.bat = true;/.test(sv));
  kiem('man-choi.js cauHinhSan + ảnh nhỏ từng sân, man-lap.js ảnh nhỏ: truyền nutBat', /nutBat: lm\.nutBat \|\| undefined/.test(mc) && /nutBat: ch\.nutBat/.test(mc) && /nutBat: lm\.nutBat \}/.test(ml));
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' / ' : 'ĐẠT ') + (dat + hong) + ' kiểm' + (LOI_GIA ? ' (đang cắm lỗi giả: phải đỏ)' : ''));
process.exit(hong ? 1 : 0);
