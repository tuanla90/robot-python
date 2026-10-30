/* ============================================================================
   kiem-may-son.mjs — máy kiểm MÁY SƠN (luật lõi san-hoc.js phần MÁY SƠN, chẩn đoán cham.js, chương may-son + che-may-son, đăng ký gói).
   Kiểm:
   - luật: dot() / pen_down() / pen_up() chỉ ra lệnh, wait() chốt nhịp; thứ tự trong nhịp (lệnh sơn → bánh → nét cuối nhịp); nét liền qua góc khi xe quay tại chỗ;
     ink(c) đổi ngay, màu lạ là lỗi chạy; hai lệnh sơn một nhịp; tô đè; tô ngoài hình dừng sớm; thắng ngay khi hình đủ; lỗi cấu hình (một tay, chỉ xe bánh, hình trên tường);
   - chẩn đoán: mau-son-sai, son-goi-lai, to-thua, chua-to-hinh (đếm ô thiếu / sai màu), quen-wait nói "lệnh sơn";
   - 20 màn: lời giải 3 sao đúng sao.o / sao.nhip, không chẩn đoán; mọi congThucKhac thắng; lời sai đủ mã; BFS (do-duong-may-son.mjs) ≤ sao.nhip;
   - đăng ký: gói 'may-son' mùa 3 ngay sau gói Cảm biến màu (trong ngân hàng), choi.html nạp tệp màn và part-son.js, Sổ lệnh nhóm 'son', huy hiệu, thẻ giới thiệu.
   Chạy: node hoc/kiem-may-son.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { coHuyHieu } from './huy-hieu-ds.mjs';   // V7c1: danh sách mã huy hiệu từ dữ liệu bộ vector (không regex huy-hieu.js pixel)

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
const GT = require(path.join(day, 'gioi-thieu-part.js'));
for (const f of fs.readdirSync(day).filter((f) => /^man-.*\.js$/.test(f))) require(path.join(day, f));
const ManHoc = require(path.join(day, 'man-chuoi-1.js'));
const LoTrinh = require(path.join(day, 'lo-trinh-hoc.js'));
const { nhipMaySonTatCa } = await import('./do-duong-may-son.mjs');

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = JSON.stringify;
const KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'ink', 'dot', 'pen_down', 'pen_up'];
const F = 'left_move()\nright_move()\nwait()\n';
const loi = (fn) => { try { fn(); return ''; } catch (e) { return e.message; } };
const chay = (san, hinh, code, them) => SanHoc.chay(Object.assign({ san, batDau: { x: 0, y: 1, huong: 1 }, hamGoc: KHAY, mucTieu: hinh ? 'to-hinh' : 'toi-co', hinh: hinh || undefined }, them || {}), code);
const toO = (r) => r.daSon.map((q) => q.x + ',' + q.y + q.mau[0]).sort().join(' ');
const S5 = ['.....', '.....', '.....', '.....'];

console.log('== 1. Luật lõi ==');
{
  let r = chay(S5, null, 'dot()\n');
  kiem('dot() chỉ ra lệnh: không có wait() thì không tô, báo quen-wait', r.daSon.length === 0 && r.suKien.some((e) => e.ma === 'quen-wait'));
  r = chay(S5, null, 'dot()\n' + F);
  kiem('dot() rồi tiến cùng một nhịp: tô ô CŨ rồi mới đi', toO(r) === '0,1r' && r.robot.x === 1 && r.nhip === 1);
  r = chay(S5, null, 'pen_down()\n' + F + F);
  kiem('pen_down() rồi đi: tô ô xuất phát và mọi ô đi qua (một nét)', toO(r) === '0,1r 1,1r 2,1r' && r.son.ha === true);
  r = chay(S5, null, 'pen_down()\n' + F + 'left_move()\nwait()\n' + F);
  kiem('nét liền qua góc: quay tại chỗ vẫn giữ sơn, đoạn sau tiếp nối', toO(r) === '0,1r 1,1r 1,2r');
  r = chay(S5, null, 'pen_down()\n' + F + 'pen_up()\n' + F);
  kiem('pen_up() cùng nhịp với bước đi: nhấc TRƯỚC khi đi, ô mới không tô', toO(r) === '0,1r 1,1r' && r.son.ha === false);
  r = chay(S5, null, 'ink("blue")\ndot()\nink("green")\nwait()\n');
  kiem('dot() tô bằng màu LÚC GỌI, ink() đổi ngay không tốn nhịp', toO(r) === '0,1b' && r.son.mau === 'green' && r.nhip === 1);
  r = chay(S5, null, 'pen_down()\n' + 'ink("yellow")\n' + F);
  kiem('nét đang giữ tô ô cuối nhịp bằng màu hiện tại', toO(r) === '0,1r 1,1y');
  r = chay(S5, null, 'dot()\nwait()\nink("blue")\ndot()\nwait()\n');
  kiem('tô lại một ô thì màu mới đè màu cũ', toO(r) === '0,1b');
  r = chay(S5, null, 'dot()\npen_down()\nwait()\n');
  kiem('hai lệnh sơn một nhịp: lệnh sau bị bỏ (son-goi-lai)', r.suKien.some((e) => e.ma === 'son-goi-lai') && r.son.ha === false);
  r = chay(S5, null, 'ink("Red")\n');
  kiem('ink() màu lạ (chữ hoa) là lỗi chạy mau-son-sai', r.loi && r.loi.ma === 'mau-son-sai' && r.loi.mauDat === 'Red');
  r = chay(S5, null, 'ink()\n');
  kiem('ink() thiếu đối số là lỗi chạy mau-son-sai', r.loi && r.loi.ma === 'mau-son-sai');
  r = chay(S5, ['.....', 'rr...', '.....', '.....'], 'pen_down()\n' + F + F + F);
  kiem('mục tiêu to-hinh: thắng NGAY cuối nhịp hình đủ (không chạy tiếp)', r.thang && r.nhip === 1 && r.robot.x === 1);
  r = chay(S5, ['.....', 'r.r..', '.....', '.....'], 'pen_down()\n' + F + F);
  kiem('tô ô ngoài hình: to-thua, dừng sớm', !r.thang && r.dungSom === 'to-thua' && r.suKien.some((e) => e.ma === 'to-thua' && e.o.x === 1));
  r = chay(S5, ['.....', 'b....', '.....', '.....'], 'dot()\nwait()\nink("blue")\ndot()\nwait()\n');
  kiem('tô sai màu trong hình thì tô lại được rồi thắng', r.thang && r.nhip === 2 && r.suKien.some((e) => e.ma === 'to-sai-mau'));
  r = chay(S5, null, 'pen_down()\n' + F);
  kiem('vết nhịp có robot.son và daSon', r.vet.filter((e) => e.loai === 'nhip').every((e) => e.robot.son && Array.isArray(e.daSon)));
  kiem('lỗi cấu hình: máy sơn đi chung tay kẹp / chỉ gắn xe bánh hay drone (P1 mùa 4: drone treo dưới bụng, nhện thì không) / hình trên tường / hinh ngoài to-hinh',
    /một tay/.test(loi(() => SanHoc.chay({ san: S5, batDau: { x: 0, y: 0 }, hamGoc: KHAY.concat(['grab']) }, ''))) &&
      /xe có bánh/.test(loi(() => SanHoc.chay({ san: S5, batDau: { x: 0, y: 0 }, loaiRobot: 'nhen', hamGoc: ['go_up', 'wait', 'dot'] }, ''))) &&
      /tường/.test(loi(() => SanHoc.chay({ san: ['#....'], batDau: { x: 1, y: 0 }, hamGoc: KHAY, mucTieu: 'to-hinh', hinh: ['r....'] }, ''))) &&
      /to-hinh/.test(loi(() => SanHoc.chay({ san: S5, batDau: { x: 0, y: 0 }, hamGoc: KHAY, hinh: S5 }, ''))));
  kiem('LENH_NGUOC: pen_down ↔ pen_up', SanHoc.LENH_NGUOC.pen_down === 'pen_up' && SanHoc.LENH_NGUOC.pen_up === 'pen_down');
}

console.log('\n== 1b. Sơn và cảm biến màu ==');
{
  const HG = KHAY.concat(['color']), CB = [{ ma: 'mau', o: 'hong' }];
  const doc = (r) => r.vet.filter((e) => e.docCamBien).map((e) => e.docCamBien.mau + '/' + e.docCamBien.nguon).join(' ');
  let r = SanHoc.chay({ san: ['.r...'], batDau: { x: 0, y: 0, huong: 1 }, hamGoc: HG, camBien: CB, sonBanDau: ['y....'] }, 'a = color()\n' + F + 'b = color()\nink("blue")\ndot()\nwait()\nc = color()\n');
  kiem('color() đọc ô sơn sẵn (nguon son), ô sàn màu (nguon san), ô vừa chấm (sơn phủ lên sàn)', doc(r) === 'yellow/son red/san blue/son', doc(r));
  kiem('kết quả có sonBanDau', J(r.sonBanDau) === '[{"x":0,"y":0,"mau":"yellow"}]');
  r = SanHoc.chay({ san: ['.....'], batDau: { x: 0, y: 0, huong: 1 }, hamGoc: HG, camBien: [{ ma: 'camera', o: 'tren' }] }, 'pen_down()\n' + F + 'pen_up()\nleft_back()\nright_back()\nwait()\na = color()\n');
  kiem('camera đọc ô trước mặt đã sơn', doc(r) === 'red/son', doc(r));
  kiem('lỗi cấu hình: ô sơn sẵn trên tường / ngoài hình mờ',
    /tường/.test(loi(() => SanHoc.chay({ san: ['#....'], batDau: { x: 1, y: 0 }, hamGoc: KHAY, sonBanDau: ['r....'] }, ''))) &&
      /ngoài hình/.test(loi(() => SanHoc.chay({ san: S5, batDau: { x: 0, y: 0 }, hamGoc: KHAY, mucTieu: 'to-hinh', hinh: ['r....', '.....', '.....', '.....'], sonBanDau: ['.b...', '.....', '.....', '.....'] }, ''))));
  const m10 = ManHoc.timMa('che-may-son.10');
  kiem('che-may-son.10: ba sân, hoa văn sơn sẵn khác nhau ở mỗi sân (không đếm cứng được)', m10.san.length === 3 && new Set(m10.sonBanDau.map(J)).size === 3);
}

console.log('\n== 2. Chẩn đoán ==');
{
  const man = (o) => Object.assign({ chuong: 'may-son', san: S5, batDau: { x: 0, y: 1, huong: 1 }, hamGoc: KHAY, mucTieu: 'to-hinh', hinh: ['.....', 'rrb..', '.....', '.....'], khung: { chinh: 10, moiHam: 10 } }, o);
  const ma = (bai) => ChamHoc.cham(man({}), { chinh: bai }, []).chanDoan.map((c) => c.ma);
  const c1 = ChamHoc.cham(man({}), { chinh: ['pen_down()', 'left_move()', 'right_move()', 'wait()'] }, []);
  const ct = c1.chanDoan.find((c) => c.ma === 'chua-to-hinh');
  kiem('chua-to-hinh đếm ô thiếu (1) và nói ô cần màu gì', ct && ct.thieu === 1 && ct.saiMau === 0 && /xanh dương/.test(ct.loi), J(c1.chanDoan));
  kiem('mau-son-sai có chỗ dòng', ma(['ink("Blue")']).includes('mau-son-sai'));
  kiem('son-goi-lai', ma(['dot()', 'pen_up()', 'wait()']).includes('son-goi-lai'));
  kiem('to-thua (nét đi quá hình)', ma(['pen_down()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()']).includes('to-thua'));
  const q = ChamHoc.cham(man({}), { chinh: ['dot()'] }, []).chanDoan.find((c) => c.ma === 'quen-wait');
  kiem('quen-wait nói "lệnh sơn"', q && /lệnh sơn/.test(q.loi), q && q.loi);
}

console.log('\n== 3. Hai chương ==');
{
  // P0 mùa 4: may-son tách chấm ô (gói 2) / nét liền net-lien (gói 6); che-may-son.7, .8 sang mùa 5 (che-may-son-cu) nên lọc theo mã.
  const ds = ManHoc.danhSach.filter((m) => m.chuong === 'may-son' || m.chuong === 'net-lien' || m.chuong === 'che-may-son' || /^che-may-son\./.test(m.ma));
  // Màn mới mùa 4 (man-cham-son.js may-son.11–16, man-net-lien.js net-lien.N và che-may-son.11, .12) có thêm ở hoc/kiem-man-mua-4.mjs; ở đây đếm màn cũ.
  kiem('20 màn: may-son.1–10 và che-may-son.1–10', ds.filter((m) => /^(che-)?may-son\.([1-9]|10)$/.test(m.ma)).length === 20);
  const DOC = ['che-may-son.6', 'che-may-son.9', 'che-may-son.10'];
  kiem('mọi màn: xe hai bánh gắn đầu sơn, khay 9 lệnh, gói Chấm sơn bớt pen_down / pen_up (che-may-son 6, 9, 10: thêm color() và cảm biến màu dưới bụng), mục tiêu to-hinh, có hình mờ', ds.every((m) => m.loaiRobot === 'banh' && m.robot.tay === 'son' && m.mucTieu === 'to-hinh' && Array.isArray(m.hinh) &&
    (DOC.includes(m.ma) ? J(m.hamGoc) === J(KHAY.concat(['color'])) && J(m.robot.camBien) === '[{"ma":"mau","o":"hong"}]' && !!m.sonBanDau : J(m.hamGoc) === J(m.chuong === 'may-son' ? KHAY.filter((t) => t !== 'pen_down' && t !== 'pen_up') : KHAY) && !m.robot.camBien.length)));
  kiem('che-may-son 1–9 chương trình chính cố định; 10 gioiHanHam 2', ds.filter((m) => m.chuong === 'che-may-son').every((m) => (m.so < 10) === (m.chinhCoDinh === true)) && ManHoc.timMa('che-may-son.10').gioiHanHam === 2);
  // kho: hàm cốt truyện các màn trước theo lộ trình (như người chơi mua mùa 3)
  const kho = new Map();
  for (const m of LoTrinh.danhSach) { if (m.doi) continue; if (m.chuong === 'may-son') break; for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, h); }
  const tron = (b) => { const k = new Map(kho); (b || []).forEach((h) => k.set(h.ten, h)); return [...k.values()]; };
  for (const m of ds) {
    const r = ChamHoc.cham(m, m.loiGiai, tron(m.loiGiai.hamCuaEmMoi));
    kiem(m.ma + ': lời giải 3 sao, ' + m.sao.o + ' ô, ' + m.sao.nhip + ' nhịp, không chẩn đoán', r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && !r.chanDoan.length, J({ sao: r.sao, o: r.soO, n: r.soNhip, cd: r.chanDoan.map((c) => c.ma) }));
    (m.congThucKhac || []).forEach((ct) => {
      const q = ChamHoc.cham(m, ct.baiLam || m.loiGiai, tron(ct.hamCuaEmMoi));
      kiem(m.ma + ': cách khác "' + ct.moTa + '" thắng', q.thang, J(q.chanDoan.map((c) => c.ma)));
    });
    m.loiSai.forEach((ls) => {
      const q = ChamHoc.cham(m, ls.baiLam, tron(ls.hamCuaEmMoi)), co = q.chanDoan.map((c) => c.ma);
      kiem(m.ma + ': lời sai "' + ls.moTa + '" đủ mã ' + ls.phaiCoMa.join('+'), q.sao < 3 && ls.phaiCoMa.every((x) => co.includes(x)), co.join());
    });
    const b = nhipMaySonTatCa(m);
    kiem(m.ma + ': BFS ' + b + ' ≤ sao.nhip ' + m.sao.nhip, b !== null && b <= m.sao.nhip);
    for (const h of m.loiGiai.hamCuaEmMoi) kho.set(h.ten, h);
  }
}

console.log('\n== 4. Đăng ký ==');
{
  const g = ThuTu.goi.find((x) => x.ma === 'may-son'), i = ThuTu.goi.indexOf(g);
  // lo-trinh-hoc.js đã chèn gói đội vào chính mảng ThuTu.goi: gói đội Cảm biến màu (nếu có) đứng giữa gói mau và gói may-son
  const truoc = ThuTu.goi.slice(0, i).filter((x) => x.ma !== 'doi-mau').pop();
  // 29/10 khung mùa 3 (KE-HOACH-MUA-3.md): may-son ngoài khuôn mùa 3, sang đầu mùa 4 (ẩn) cùng gói Cảm biến màu, giữ thứ tự.
  kiem('P0 mùa 4: gói may-son (Chấm sơn) bộ phận mùa 4 chương may-son + che-list; gói net-lien (Nét liền) chương net-lien + che-may-son, đứng sau', g && g.loai === 'bo-phan' && g.mua === 'mua-4' && J(g.chuong) === '["may-son","che-list"]' && J((ThuTu.goi.find((x) => x.ma === 'net-lien') || {}).chuong) === '["net-lien","che-may-son"]' && ThuTu.goi.findIndex((x) => x.ma === 'net-lien') > i);
  kiem('thuTu (P0 mùa 4): may-son trước net-lien, che-may-son ngay sau net-lien', ThuTu.thuTu.indexOf('may-son') >= 0 && ThuTu.thuTu.indexOf('net-lien') > ThuTu.thuTu.indexOf('may-son') && ThuTu.thuTu.indexOf('che-may-son') === ThuTu.thuTu.indexOf('net-lien') + 1);
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  kiem('choi.html nạp man-may-son.js, man-che-may-son.js (sau man-che-mau.js) và ve-vector-tay-son.js (V7c2: bộ pixel part/ đã xoá)', html.indexOf('../man-may-son.js') > html.indexOf('../man-che-mau.js') && html.indexOf('../man-che-may-son.js') > html.indexOf('../man-may-son.js') && html.includes('ve-vector-tay-son.js'));
  kiem('Sổ lệnh: nhóm "son", bảy hàm cốt truyện đúng chương, bốn lệnh gốc', SoLenh.tenNhom.son && ['dots', 'frame', 'line', 'color_line', 'next_row', 'stripes', 'copy_row', 'grid', 'border', 'fill_gaps'].every((t) => SoLenh.tim(t) && SoLenh.tim(t).nhom === 'son') &&
    ['ink', 'dot', 'pen_down', 'pen_up'].every((t) => SoLenh.lenhGoc.some((l) => l.ten === t)));
  kiem('huy hiệu may-son và che-may-son có hình (bộ vector, V7c1)', coHuyHieu('may-son') && coHuyHieu('che-may-son'));
  kiem('thẻ giới thiệu bộ phận "son" (khe tay, bốn lệnh)', GT.DS.son && GT.DS.son.khe === 'tay' && J(GT.DS.son.lenh) === '["ink","dot","pen_down","pen_up"]');
  kiem('kế hoạch hoc/KE-HOACH-MAY-SON.md có trên đĩa', fs.existsSync(path.join(day, 'KE-HOACH-MAY-SON.md')));
}

console.log('\nĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
