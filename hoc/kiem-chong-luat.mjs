/* ============================================================================
   kiem-chong-luat.mjs — máy kiểm LUẬT XẾP CHỒNG (mùa 4 Cảng sông, hoc/KE-HOACH-GHEP-NHIP.md mục 3c; luật ở san-hoc.js phần CẢNG SÔNG, mục "LUẬT XẾP CHỒNG").
   Mục tiêu bongMo.chongLuat = [{ x, y, luat: 'nho-tren' | 'lon-tren', mau?, du? }]: chấm theo LUẬT, không theo dãy số cố định.
     1. Ngăn xếp: bốc lẻ thì ĐẢO thứ tự, móc đôi thì GIỮ → cùng một sân, luật quyết cách nào thắng.
     2. Chấm theo luật: đổi bộ số, lời giải theo luật vẫn thắng; dãy lệnh cố định thắng bộ này thua bộ kia.
     3. Lọc màu (màu = so % 4), du (đếm từ sân / khai tay), luật kép hai chồng đích, ô không khai không bị xét.
     4. Móc còn treo, thiếu, thừa, lạ màu, sai chiều: SanHoc.soatChongLuat chỉ chỗ sai ĐẦU TIÊN.
     5. Lỗi cấu hình tiếng Việt.
     6. cham.js: 'sai-luat-chong' + lời Việt cho từng kiểu sai; lời giải đúng thì không lỗi; bongMo.chong cũ không đổi.
     7. MÀN: mọi màn mùa 4 có bongMo.chongLuat (đi qua hoc/lo-trinh-hoc.js): lời giải thắng MỌI sân, mọi loiSai không thắng, màn có loiSai thì ít nhất một lời sai ra đúng 'sai-luat-chong';
        màn từ gói 6 trở đi (đã có read_code) phải nhiều sân và các sân khác bộ số.
     8. TỰ CHỨNG MINH: lấy lời giải của màn, trao cho sai luật → máy kiểm phải thấy THUA + 'sai-luat-chong' (nếu không, mục 7 vô nghĩa).
   Chạy: node hoc/kiem-chong-luat.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-chong-luat.mjs --pha      (cố ý nộp một lời giải SAI LUẬT làm "lời giải" → phải in HỎNG và thoát mã 1: chứng minh máy kiểm bắt lỗi thật)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const PHA = process.argv.includes('--pha');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const chongO = (r, x, y) => { const c = r.chong.find((q) => q.x === x && q.y === y); return c ? c.cont.map((k) => k.so) : []; };
const loiCfg = (cfg) => { try { SanHoc.chay(cfg, 'wait()\n'); return ''; } catch (e) { return e.message; } };

const CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail'];
//   bệ (4,2): nấc 0 → A (4,1); swing_left → nấc 3 → B (3,2); swing_left nữa → nấc 2 → C (4,3).
const SAN = ['#########', '#.......#', '#...RR..#', '#.......#', '#.......#', '#########'];
const A = (so) => [{ x: 4, y: 1, cont: so.map((n) => ({ so: n })) }];
const cau = (chong, luat, them) => Object.assign({ loaiRobot: 'cau', hamGoc: CAU, camBien: [{ ma: 'quet-ma' }], san: SAN, batDau: { x: 4, y: 2, nac: 0 }, chong, nhipToiDa: 80, mucTieu: 'bong-mo', bongMo: { chongLuat: luat } }, them || {});
const chay = (cfg, code) => SanHoc.chay(cfg, code);
const soat = (r) => SanHoc.soatChongLuat(r.bongMo.chongLuat, r.chong, r.treo);
const LE = 'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\n';   // bốc lẻ hai lần A → C
const DOI = 'pick_up2()\nswing_left()\nswing_left()\nset_down()\n';                                                                                 // móc đôi A → C
const C_NHO = [{ x: 4, y: 3, luat: 'nho-tren' }], C_LON = [{ x: 4, y: 3, luat: 'lon-tren' }];

console.log('\n== 1. Ngăn xếp: bốc lẻ đảo, móc đôi giữ ==');
{
  let r = chay(cau(A([3, 7]), C_NHO), LE);
  kiem('A [3, 7] bốc lẻ sang C → [7, 3] (đảo); luật "nhỏ ở trên" → thắng', r.thang === true && J(chongO(r, 4, 3)) === J([7, 3]) && soat(r) === null, J(r.chong));
  r = chay(cau(A([3, 7]), C_LON), LE);
  kiem('cùng lời giải bốc lẻ, luật "lớn ở trên" → không thắng, sai-chieu dưới 7 trên 3', r.thang === false && J(soat(r)) === J({ kieu: 'sai-chieu', x: 4, y: 3, luat: 'lon-tren', duoi: 7, tren: 3 }), J(soat(r)));
  r = chay(cau(A([3, 7]), C_LON), DOI);
  kiem('A [3, 7] móc đôi sang C → [3, 7] (giữ); luật "lớn ở trên" → thắng', r.thang === true && J(chongO(r, 4, 3)) === J([3, 7]));
  r = chay(cau(A([3, 7]), C_NHO), DOI);
  kiem('móc đôi mà luật "nhỏ ở trên" → không thắng, sai-chieu dưới 3 trên 7', r.thang === false && soat(r).kieu === 'sai-chieu' && soat(r).duoi === 3 && soat(r).tren === 7);
}

console.log('\n== 2. Chấm theo luật, không theo dãy số ==');
{
  let r = chay(cau(A([9, 2]), C_NHO), LE);
  kiem('đổi bộ số A [9, 2]: dãy lệnh bốc lẻ (thắng bộ [3, 7]) nay ra [2, 9] → thua', r.thang === false && J(chongO(r, 4, 3)) === J([2, 9]));
  r = chay(cau(A([9, 2]), C_NHO), DOI);
  kiem('A [9, 2] móc đôi → [9, 2] nhỏ ở trên → thắng (cùng một mục tiêu, hai bộ số)', r.thang === true);
  const DOC = 'a = read_code()\npick_up()\nswing_left()\nset_down()\nswing_right()\nb = read_code()\nswing_left()\npick_up()\nswing_right()\nif a < b:\n    pick_up2()\nelse:\n    pick_up()\n';
  kiem('bongMo.chongLuat giữ nguyên trên kết quả, du đã đếm (2)', r.bongMo.chongLuat.length === 1 && r.bongMo.chongLuat[0].du === 2 && r.bongMo.chongLuat[0].mau === null && r.bongMo.chongLuat[0].luat === 'nho-tren' && !!DOC);
  r = chay(cau(A([5, 5]), C_NHO), LE);
  kiem('hai số bằng nhau: chiều nào cũng đạt', r.thang === true);
  r = chay(cau(A([4, 6, 9]), [{ x: 3, y: 2, luat: 'lon-tren' }]), 'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nset_down()\nswing_left()\npick_up()\nswing_right()\nset_down()\nswing_left()\npick_up()\nswing_right()\nset_down()\n');
  kiem('ba container qua chồng tạm C rồi về B: [4, 6, 9] lớn ở trên → thắng', r.thang === true && J(chongO(r, 3, 2)) === J([4, 6, 9]), J(r.chong));
}

console.log('\n== 3. Lọc màu (so % 4), du, luật kép ==');
{
  const DO_NHO = [{ x: 4, y: 3, luat: 'nho-tren', mau: 0 }];
  // A [4, 5, 8]: 8 đỏ (đỉnh), 5 xanh dương, 4 đỏ. Đỏ sang C nhỏ ở trên = [8, 4]; 5 cất sang B.
  const LOC = 'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nset_down()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\n';
  let r = chay(cau(A([4, 5, 8]), DO_NHO), LOC);
  kiem('lọc đỏ: C = [8, 4], xanh dương 5 nằm ở chồng tạm B (ô không khai không bị xét) → thắng; du đếm = 2', r.thang === true && J(chongO(r, 4, 3)) === J([8, 4]) && J(chongO(r, 3, 2)) === J([5]) && r.bongMo.chongLuat[0].du === 2 && J(r.bongMo.chongLuat[0].mau) === J([0]), J(r.chong));
  r = chay(cau(A([4, 5, 8]), DO_NHO), 'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\n');
  kiem('hạ 5 (xanh dương) lên chồng đỏ → la-mau số 5', r.thang === false && J(soat(r)) === J({ kieu: 'la-mau', x: 4, y: 3, so: 5, mau: [0] }), J(soat(r)));
  r = chay(cau(A([4, 5, 8]), DO_NHO), 'pick_up()\nswing_left()\nswing_left()\nset_down()\n');
  kiem('mới đưa 8, còn 4 ở A → thieu (có 1, cần 2), chỉ ô (4, 1) số 4', r.thang === false && J(soat(r)) === J({ kieu: 'thieu', x: 4, y: 3, co: 1, can: 2, con: { x: 4, y: 1, so: 4 } }), J(soat(r)));
  r = chay(cau(A([4, 5, 8]), [{ x: 4, y: 3, luat: 'nho-tren', mau: 0, du: 1 }]), LOC);
  kiem('du khai tay = 1 mà chồng đích có 2 → thua (thừa)', r.thang === false && soat(r).kieu === 'thua' && soat(r).co === 2 && soat(r).can === 1);
  r = chay(cau(A([4, 5, 8]), [{ x: 4, y: 3, luat: 'nho-tren', mau: [0, 1] }]), 'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\n');
  kiem('mau là mảng [0, 1]: cả ba vào C thành [8, 5, 4] nhỏ ở trên → thắng', r.thang === true && J(chongO(r, 4, 3)) === J([8, 5, 4]));
  // luật kép: đỏ sang C nhỏ ở trên, xanh dương sang B lớn ở trên. A [5, 4, 9, 8]: 8 → C, 9 → B?? 9 trên 5 mới là lớn ở trên → 9 phải hạ SAU 5.
  const KEP = [{ x: 4, y: 3, luat: 'nho-tren', mau: 0 }, { x: 3, y: 2, luat: 'lon-tren', mau: 1 }];
  r = chay(cau([{ x: 4, y: 1, cont: [{ so: 9 }, { so: 4 }, { so: 5 }, { so: 8 }] }], KEP),
    'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nset_down()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nset_down()\n');
  kiem('luật kép: đỏ [8, 4] ở C (nhỏ ở trên), xanh dương [5, 9] ở B (lớn ở trên) → thắng', r.thang === true && J(chongO(r, 4, 3)) === J([8, 4]) && J(chongO(r, 3, 2)) === J([5, 9]), J(r.chong));
  r = chay(cau([{ x: 4, y: 1, cont: [{ so: 5 }, { so: 4 }, { so: 9 }, { so: 8 }] }], KEP),
    'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nset_down()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nset_down()\n');
  kiem('luật kép, bộ số khác (9 nằm trên 5 trong chồng gốc): cùng dãy lệnh ra xanh dương [9, 5] → thua sai-chieu ở B', r.thang === false && soat(r).kieu === 'sai-chieu' && soat(r).x === 3 && soat(r).y === 2 && soat(r).luat === 'lon-tren', J(soat(r)));
}

console.log('\n== 4. Móc còn treo; hàm soát chỉ chỗ sai đầu tiên ==');
{
  let r = chay(cau(A([3, 7]), C_NHO), 'pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\n');
  kiem('còn treo số 3 → không thắng, kieu treo', r.thang === false && J(soat(r)) === J({ kieu: 'treo', so: [3] }));
  const L = [{ x: 1, y: 1, luat: 'nho-tren', mau: null, du: 3 }];
  kiem('soatChongLuat: [9, 5, 7] nhỏ ở trên → cặp sai đầu tiên dưới 5 trên 7', J(SanHoc.soatChongLuat(L, [{ x: 1, y: 1, cont: [{ so: 9 }, { so: 5 }, { so: 7 }] }], [])) === J({ kieu: 'sai-chieu', x: 1, y: 1, luat: 'nho-tren', duoi: 5, tren: 7 }));
  kiem('soatChongLuat: [9, 7, 5] nhỏ ở trên → null (đạt); không có luật → null', SanHoc.soatChongLuat(L, [{ x: 1, y: 1, cont: [{ so: 9 }, { so: 7 }, { so: 5 }] }], []) === null && SanHoc.soatChongLuat(null, [], []) === null);
  kiem('soatChongLuat: chồng đích trống → thieu, con = null khi sân không còn container', J(SanHoc.soatChongLuat(L, [], [])) === J({ kieu: 'thieu', x: 1, y: 1, co: 0, can: 3, con: null }));
  kiem('SanHoc.LUAT_CHONG có đúng hai luật', J(SanHoc.LUAT_CHONG) === J(['nho-tren', 'lon-tren']));
}

console.log('\n== 5. Lỗi cấu hình ==');
{
  kiem('không phải cẩu', /cần cẩu/.test(loiCfg({ loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], san: SAN, batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'bong-mo', bongMo: { x: 2, y: 1, huong: 1, chongLuat: C_NHO } })));
  kiem('luat lạ ("tang-dan") bị từ chối, lời nói "nhỏ ở trên / lớn ở trên"', /số nhỏ ở trên/.test(loiCfg(cau(A([3, 7]), [{ x: 4, y: 3, luat: 'tang-dan' }]))));
  kiem('ô đích không phải bãi (ray)', /ô bãi/.test(loiCfg(cau(A([3, 7]), [{ x: 5, y: 2, luat: 'nho-tren' }]))));
  kiem('mau ngoài 0..3; mau trùng', /0\.\.3/.test(loiCfg(cau(A([3, 7]), [{ x: 4, y: 3, luat: 'nho-tren', mau: 4 }]))) && /không trùng/.test(loiCfg(cau(A([3, 7]), [{ x: 4, y: 3, luat: 'nho-tren', mau: [1, 1] }]))));
  kiem('du ngoài 1..4', /du phải là/.test(loiCfg(cau(A([3, 7]), [{ x: 4, y: 3, luat: 'nho-tren', du: 5 }]))));
  kiem('một ô khai hai lần', /khai hai lần/.test(loiCfg(cau(A([3, 7]), [{ x: 4, y: 3, luat: 'nho-tren', mau: 3 }, { x: 4, y: 3, luat: 'lon-tren', mau: 2 }]))));
  kiem('hai chồng đích cùng nhận một màu mà không khai du', /cùng nhận màu/.test(loiCfg(cau(A([3, 7]), [{ x: 4, y: 3, luat: 'nho-tren' }, { x: 3, y: 2, luat: 'lon-tren', mau: 3 }]))));
  kiem('sân không có container hợp màu', /không có container nào hợp màu/.test(loiCfg(cau(A([3, 7]), [{ x: 4, y: 3, luat: 'nho-tren', mau: 0 }]))));
  kiem('dùng chung với bongMo.chong', /không dùng chung/.test(loiCfg(cau(A([3, 7]), C_NHO, { bongMo: { chong: [{ x: 4, y: 3, so: [7, 3] }], chongLuat: C_NHO } }))));
  kiem('mảng rỗng', /ít nhất một chồng đích/.test(loiCfg(cau(A([3, 7]), []))));
}

console.log('\n== 6. cham.js: sai-luat-chong ==');
{
  const man = (chong, luat, them) => Object.assign({ ma: 'thu-chong-luat.1', loaiRobot: 'cau', hamGoc: CAU, robot: { camBien: [{ ma: 'quet-ma' }] }, san: SAN, batDau: { x: 4, y: 2, nac: 0 }, chong, mucTieu: 'bong-mo', bongMo: { chongLuat: luat },
    khung: { chinh: 30 }, sao: { o: 30, nhip: 30 }, cauTruc: ['for', 'if', 'while'], hamCuaEmCan: [], taoHam: [] }, them || {});
  const dong = (s) => s.trim().split('\n');
  const cd = (r, ma) => (r.chanDoan || []).find((c) => c.ma === ma) || null;
  const khongLoi = (r) => !(r.chanDoan || []).some((c) => c.muc === 'loi');
  let r = ChamHoc.cham(man(A([3, 7]), C_NHO), { chinh: dong(LE) }, []);
  kiem('lời giải đúng luật qua cham: thắng, không lỗi', r.thang === true && khongLoi(r), J(r.chanDoan));
  r = ChamHoc.cham(man(A([3, 7]), C_LON), { chinh: dong(LE) }, []);
  kiem('sai chiều: "phải xếp số lớn ở trên, mà số 3 đang nằm trên số 7", nhắc ngăn xếp, "Hạ số nhỏ trước"', !!cd(r, 'sai-luat-chong') && /\(4, 3\) phải xếp số lớn ở trên, mà số 3 đang nằm trên số 7/.test(cd(r, 'sai-luat-chong').loi) && /ngăn xếp/.test(cd(r, 'sai-luat-chong').loi) && /Hạ số nhỏ trước/.test(cd(r, 'sai-luat-chong').loi) && cd(r, 'sai-luat-chong').kieu === 'sai-chieu' && !cd(r, 'chua-xep-chong'), J(r.chanDoan));
  r = ChamHoc.cham(man(A([3, 7]), C_NHO), { chinh: dong(DOI) }, []);
  kiem('sai chiều luật nhỏ ở trên: "số 7 đang nằm trên số 3", "Hạ số lớn trước"; không có chữ tăng dần / giảm dần', !!cd(r, 'sai-luat-chong') && /số nhỏ ở trên, mà số 7 đang nằm trên số 3/.test(cd(r, 'sai-luat-chong').loi) && /Hạ số lớn trước/.test(cd(r, 'sai-luat-chong').loi) && !/tăng dần|giảm dần/.test(cd(r, 'sai-luat-chong').loi), J(r.chanDoan));
  r = ChamHoc.cham(man(A([4, 5, 8]), [{ x: 4, y: 3, luat: 'nho-tren', mau: 0 }]), { chinh: dong('pick_up()\nswing_left()\nswing_left()\nset_down()\nswing_right()\nswing_right()\npick_up()\nswing_left()\nswing_left()\nset_down()\n') }, []);
  kiem('lạ màu: "chỉ nhận container màu đỏ, mà có container số 5 màu xanh dương", "5 % 4 = 1"', !!cd(r, 'sai-luat-chong') && /chỉ nhận container màu đỏ, mà có container số 5 màu xanh dương/.test(cd(r, 'sai-luat-chong').loi) && /5 % 4 = 1/.test(cd(r, 'sai-luat-chong').loi), J(r.chanDoan));
  r = ChamHoc.cham(man(A([4, 5, 8]), [{ x: 4, y: 3, luat: 'nho-tren', mau: 0 }]), { chinh: dong('pick_up()\nswing_left()\nswing_left()\nset_down()\n') }, []);
  kiem('thiếu: "mới có 1 container, cần đủ 2. Container số 4 còn nằm ở ô (4, 1)."', !!cd(r, 'sai-luat-chong') && /mới có 1 container, cần đủ 2\. Container số 4 còn nằm ở ô \(4, 1\)\./.test(cd(r, 'sai-luat-chong').loi), J(r.chanDoan));
  r = ChamHoc.cham(man(A([3, 7]), C_NHO), { chinh: dong('pick_up()\nswing_left()\nswing_left()') }, []);
  kiem('còn treo: "móc vẫn treo container số 7", gợi ý set_down()', !!cd(r, 'sai-luat-chong') && /móc vẫn treo container số 7/.test(cd(r, 'sai-luat-chong').loi) && /set_down\(\)/.test(cd(r, 'sai-luat-chong').loi), J(r.chanDoan));
  r = ChamHoc.cham(man(A([2, 1]), null, { bongMo: { chong: [{ x: 4, y: 3, so: [2, 1] }] } }), { chinh: dong('pick_up()\nswing_left()\nset_down()') }, []);
  kiem('bongMo.chong cũ không đổi: vẫn chua-xep-chong, không sai-luat-chong', !!cd(r, 'chua-xep-chong') && !cd(r, 'sai-luat-chong'), J(r.chanDoan));
}

/* ---- 7, 8. MÀN thật: đi qua lộ trình xuất bản (hoc/lo-trinh-hoc.js), không require man-*.js thô ---- */
const LoTrinh = require(path.join(day, 'lo-trinh-hoc.js'));
const clone = (x) => JSON.parse(JSON.stringify(x));
const khoHam = new Map(), khoTruoc = new Map();
for (const m of LoTrinh.danhSach) {
  khoTruoc.set(m.ma, [...khoHam.values()].map(clone));
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) khoHam.set(h.ten, clone(h));
}
function chamMan(m, lg) {                                  // như hoc/kiem-man-mua-cang.mjs: kho hàm em = mọi hàm đã chế trước màn + hàm màn này chế
  const hs = new Map((khoTruoc.get(m.ma) || []).map((h) => [h.ten, clone(h)]));
  for (const h of lg.hamCuaEmMoi || m.loiGiai.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
  return ChamHoc.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hs.values()]);
}
const SO_MAN_TOI_THIEU = 0;                                // nâng lên 9 khi đủ màn (gói 2 ≥ 3, gói 6 ≥ 3, gói 8 ≥ 1, gói 10 ≥ 2)
const dsMan = LoTrinh.danhSach.filter((m) => {
  const bm = Array.isArray(m.bongMo) ? m.bongMo : [m.bongMo];
  return m.loaiRobot === 'cau' && bm.some((b) => b && b.chongLuat);
});
const CHUONG_CHUA_DOC_MA = ['moc-cau', 'chia-du'];        // gói 2: chưa có read_code → được phép một sân
const cdMa = (r) => (r.chanDoan || []).map((c) => c.ma);
function trao(bai) {                                       // lời giải "phá": đổi pick_up2() ↔ pick_up() (giữ ↔ đảo); không có thì bỏ dòng set_down() cuối (còn treo)
  const b = JSON.parse(JSON.stringify(bai));
  const coDoi = b.chinh.some((d) => /pick_up2\(\)/.test(d));
  if (coDoi) b.chinh = b.chinh.map((d) => d.replace('pick_up2()', 'pick_up()'));
  else { const i = b.chinh.map((d) => /set_down\(\)/.test(d)).lastIndexOf(true); if (i >= 0) b.chinh.splice(i, 1); }
  return b;
}

console.log('\n== 7. Màn mùa 4 có luật xếp chồng (' + dsMan.length + ' màn) ==');
{
  kiem('lộ trình có ít nhất ' + SO_MAN_TOI_THIEU + ' màn chongLuat', dsMan.length >= SO_MAN_TOI_THIEU, 'đang có ' + dsMan.length);
  dsMan.forEach((m) => {
    const giai = PHA && m === dsMan[0] ? trao(m.loiGiai) : m.loiGiai;
    let r = chamMan(m, giai);
    kiem(m.ma + ' "' + m.ten + '": lời giải thắng mọi sân' + (Array.isArray(m.san[0]) ? ' (' + m.san.length + ' sân)' : ''), r.thang === true, J(cdMa(r)));
    const nhieuSan = Array.isArray(m.san[0]);
    if (CHUONG_CHUA_DOC_MA.indexOf(m.chuong) < 0 && !m.chinhCoDinh) {
      const bo = nhieuSan ? m.chong.map((c) => J(c)) : [];
      kiem(m.ma + ': đã có read_code → nhiều sân, mỗi sân một bộ số', nhieuSan && new Set(bo).size === bo.length && bo.length >= 2, nhieuSan ? 'bộ số trùng' : 'chỉ một sân');
    }
    let coMa = false;
    (m.loiSai || []).forEach((ls) => {
      r = chamMan(m, Object.assign({}, ls.baiLam, { hamCuaEmMoi: ls.hamCuaEmMoi }));
      if (cdMa(r).includes('sai-luat-chong')) coMa = true;
      kiem(m.ma + ' lời sai "' + ls.moTa + '": không thắng' + (ls.phaiCoMa ? ', có mã ' + ls.phaiCoMa.join(' + ') : ''), r.thang === false && (ls.phaiCoMa || []).every((ma) => cdMa(r).includes(ma)), J(cdMa(r)));
    });
    if ((m.loiSai || []).length) kiem(m.ma + ': ít nhất một lời sai ra đúng sai-luat-chong', coMa);
  });
}

console.log('\n== 8. Tự chứng minh: trao lời giải → phải thua ==');
{
  dsMan.filter((m) => !m.chinhCoDinh).forEach((m) => {
    const r = chamMan(m, trao(m.loiGiai));
    kiem(m.ma + ': lời giải bị trao (pick_up2 ↔ pick_up, hay bỏ set_down cuối) → thua', r.thang === false, J(cdMa(r)));
  });
}

console.log('\n' + (hong ? 'HỎNG ' + hong + ' · ' : '') + 'ĐẠT ' + dat + ' · HỎNG ' + hong + (PHA ? '   (chạy --pha: PHẢI hỏng)' : ''));
process.exit(hong ? 1 : 0);
