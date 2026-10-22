/* ============================================================================
   kiem-che-drone.mjs — máy kiểm chương `che-drone` (Chế lệnh drone) của "Đường học" và các luật lõi nó dùng (KE-HOACH-CHE-LENH.md, mục 5c.6).
   Gồm:
   - bóng mờ với DRONE (không hướng mặt): thắng khi chạy xong, không thắng giữa đường, ◆, pin về 0 ở nhịp cuối (bóng mờ rơi, tới cờ vẫn thắng), ô sạc cứu đúng nhịp, vật mờ + nam châm treo, drone mờ đang dính vật;
     chẩn đoán nói "Drone dừng lệch…" / "Drone chưa đi qua điểm ◆";
   - màn hỏng (phanCung thiếu go_down): gọi lệnh hỏng (cả gián tiếp qua go("D"), recharge()) → lenh-goc-hong nói canhBao của màn; lệnh còn lại chạy bình thường; bộ dò bỏ hành động bay xuống;
   - bộ dò đường tắt do-duong-che-drone.mjs: BFS khớp từng nhịp với san-hoc.js (hơn nghìn chương trình ngẫu nhiên: bóng mờ, ◆, vật mờ, drone dính vật, pin + ô sạc, phần cứng thiếu một hướng bay) và kiểm chính bộ dò;
   - Sổ lệnh có đủ năm hàm mới (so-lenh.js; go_out, come_back, safe_fly, fixed_fly là HÀM CỦA MÀN nên không có ở đó; fly() của em giữ nguyên, không bị sửa ở 9);
   - 10 màn che-drone: lời giải 3 sao, mọi công thức khác thắng, lời giải khác đúng 2 sao, lời sai đúng mã, chinhCoDinh chặn chương trình chính gửi lên,
     nhịp: đường ngắn nhất BFS không dài hơn sao.nhip (bằng nhau trừ các màn nhipTheoLoiGiai: 5, 6, 8, 10), BFS đổi thành lệnh gốc chạy SanHoc.chay thắng đúng nhịp BFS;
   - huy hiệu che-drone và thẻ script của game/choi.html.
   Các kiểm chung cho cả game (đi tuần tự, sao, lời sai, đường tắt…) nằm ở kiem-hoc.mjs. Luật drone: kiem-drone.mjs.
   Chạy: node hoc/kiem-che-drone.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const ChamHoc = require(path.join(day, 'cham.js'));
const KhoHam = require(path.join(day, 'kho-ham.js'));
const ThuTu = require(path.join(day, 'thu-tu-chuong.js'));
const SoLenh = require(path.join(day, 'so-lenh.js'));
let ManHoc = require(path.join(day, 'man-chuoi-1.js'));
for (const f of fs.readdirSync(day).filter((n) => /^man-.*\.js$/.test(n) && n !== 'man-chuoi-1.js').sort()) ManHoc = require(path.join(day, f));
const DoDuong = await import('./do-duong-che-drone.mjs');
const { nhipCheDroneNganNhat, nhipCheDroneTatCa, chuoiThanhMa, dungNguCanh, trangThaiDau, buocMotNhip, laThang } = DoDuong;

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const H = (ten, than, thamSo = []) => ({ ten, thamSo, than });
const maCua = (kq) => kq.chanDoan.map((c) => c.ma);
const maLoi = (kq) => kq.chanDoan.filter((c) => c.muc === 'loi').map((c) => c.ma);
const nhipVet = (kq) => kq.vet.filter((e) => e.loai === 'nhip');
const ev = (kq, ma) => nhipVet(kq).flatMap((n) => n.suKien).filter((e) => e.ma === ma);
const tatCa = ManHoc.danhSach;
const che = tatCa.filter((m) => m.chuong === 'che-drone');
const man = (so) => ManHoc.timMa('che-drone.' + so);
const tenCotTruyen = [...new Set(tatCa.flatMap((m) => m.taoHam))];
const L = (...d) => d.join('\n') + '\n';
const sanCua = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const VT = ThuTu.thuTu.indexOf('che-drone') + 1;               // số thứ tự của chương che-drone (không ghi cứng)

/** Kho của học sinh LÚC TỚI màn `id` (đã chơi mọi màn trước, mỗi màn tạo / sửa hàm theo lời giải). id 'het' = sau cả game. */
function khoTruoc(id) {
  const kho = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  for (const m of tatCa) {
    if (m.id === id) break;
    if (m.tietKiemNhip === true) continue;
    for (const h of m.loiGiai.hamCuaEmMoi) {
      if (!kho.tim(h.ten)) kho.tao(h.ten, h.thamSo, { taoHam: m.taoHam });
      kho.sua(h.ten, h.than);
    }
  }
  return kho.ds();
}
const tron = (kho, moi) => {
  const kq = kho.map((h) => H(h.ten, h.than.slice(), h.thamSo.slice()));
  for (const h of moi || []) { const i = kq.findIndex((x) => x.ten === h.ten); const b = H(h.ten, h.than.slice(), (h.thamSo || []).slice()); if (i >= 0) kq[i] = b; else kq.push(b); }
  return kq;
};

const BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
const NC = ['magnet_n', 'magnet_s', 'magnet_off'];
const trong = (n, m = n) => Array.from({ length: m }, () => '.'.repeat(n));
const dat1 = (rows, x, y, ch) => rows.map((r, j) => (j === y ? r.slice(0, x) + ch + r.slice(x + 1) : r));
/** SanHoc.chay cho drone; extra ghi đè / thêm trường cấu hình. */
function chay(rows, bd, code, extra) {
  return SanHoc.chay(Object.assign({ san: rows, batDau: bd, loaiRobot: 'drone', hamGoc: BAY }, extra || {}), code);
}
/** Cấu hình SanHoc.chay của sân thứ i của màn m (như ChamHoc.cham truyền xuống). */
function cfgSan(m, i, extra) {
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({ san: sanCua(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, loaiRobot: 'drone', hamGoc: m.hamGoc, phanCung: SanHoc.phanCungCua(m), mucTieu: m.mucTieu || 'toi-co',
    vatChat: lm.vatChat, vat: lm.vatThem || undefined, pin: Array.isArray(m.pin) ? m.pin[i] : m.pin, camBien: m.robot ? m.robot.camBien : undefined, bongMo: lm.bongMo || undefined, nhipToiDa: 200 }, extra || {});
}

/* ================================================================= 1. BÓNG MỜ VỚI DRONE */
console.log('\n== 1. Bóng mờ với drone: không hướng mặt, ◆, pin về 0 ở nhịp cuối, vật mờ + nam châm treo ==');
{
  const SAN = trong(5), bd = { x: 2, y: 2, huong: 0 };
  const BM = (bongMo, code, extra) => chay(SAN, bd, code, Object.assign({ mucTieu: 'bong-mo', bongMo }, extra || {}));
  const b1 = BM({ x: 3, y: 2 }, L('go_right()'));
  kiem('drone bay tới ô bóng mờ rồi chương trình xong: thắng, nhịp cuối ghi toi-bong-mo (bóng mờ KHÔNG cần hướng)', b1.thang === true && b1.nhip === 1 && ev(b1, 'toi-bong-mo').length === 1);
  const b2 = BM({ x: 3, y: 2 }, L('go_right()', 'go_right()'));
  kiem('đi ngang qua bóng mờ rồi đi tiếp thì chưa thắng (thắng chỉ xét khi chạy xong)', b2.thang === false && ev(b2, 'toi-bong-mo').length === 0);
  const b3 = BM({ x: 3, y: 2, huong: 2 }, L('go_right()'));
  kiem('huong của bóng mờ bị bỏ qua với drone (drone không có hướng mặt): khai huong 2 vẫn thắng', b3.thang === true);
  const b4 = BM({ x: 2, y: 2, diQua: [{ x: 2, y: 0 }] }, L('wait()'));
  kiem('◆ chưa ghé thì không thắng dù drone đứng đúng ô bóng mờ (chua-qua-diem)', b4.thang === false && b4.diQua[0].da === false);
  const b5 = BM({ x: 2, y: 2, diQua: [{ x: 2, y: 0 }] }, L('go_up()', 'go_up()', 'go_down()', 'go_down()'));
  kiem('◆ ghé rồi về lại ô bóng mờ: thắng, ghi qua-diem một lần', b5.thang === true && ev(b5, 'qua-diem').length === 1 && b5.nhip === 4);
  // pin
  const P5 = ['PPPPP', '.....'], bdP = { x: 0, y: 1, huong: 0 };
  const p1 = chay(['.....'], { x: 0, y: 0, huong: 0 }, L('go_right()', 'go_right()', 'go_right()'), { mucTieu: 'bong-mo', bongMo: { x: 3, y: 0 }, pin: 3 });
  kiem('bóng mờ + pin: nhịp cuối làm pin về 0 mà không ở ô sạc thì drone rơi (het-pin), KHÔNG thắng dù đúng ô bóng mờ', p1.thang === false && p1.dungSom === 'het-pin' && ev(p1, 'toi-bong-mo').length === 0);
  const p2 = chay(['...F.'], { x: 0, y: 0, huong: 0 }, L('go_right()', 'go_right()', 'go_right()'), { mucTieu: 'toi-co', pin: 3 });
  kiem('đối chứng mục tiêu tới cờ: đến cờ đúng nhịp pin về 0 vẫn thắng (luật cũ của chương drone)', p2.thang === true && p2.dungSom === null);
  const p3 = chay(['PPPPP'], { x: 0, y: 0, huong: 0 }, L('go_right()', 'go_right()', 'go_right()'), { mucTieu: 'bong-mo', bongMo: { x: 3, y: 0 }, pin: 3 });
  kiem('bóng mờ + pin: nhịp cuối pin về 0 mà drone đứng trên ô sạc P thì pin đầy lại, thắng', p3.thang === true && p3.pin === 3);
  const p4 = chay(P5, bdP, L('go_right()', 'go_right()', 'go_up()', 'go_down()', 'go_right()'), { mucTieu: 'bong-mo', bongMo: { x: 3, y: 1 }, pin: 3, hamGoc: BAY.concat(['battery']) });
  kiem('ghé ô sạc phía trên giữa đường (pin 3, năm nhịp): đủ pin tới bóng mờ, pin cuối còn 1', p4.thang === true && p4.pin === 1 && ev(p4, 'sac-pin').length === 1, J([p4.thang, p4.pin, p4.dungSom]));
  // vật mờ + nam châm treo
  const SANV = dat1(trong(5, 3), 0, 1, 'o');
  const chat = ['.....', 's....', '.....'];
  const V = (bongMo, code, extra) => chay(SANV, { x: 0, y: 1, huong: 0 }, code, Object.assign({ mucTieu: 'bong-mo', bongMo, vatChat: chat, hamGoc: BAY.concat(NC) }, extra || {}));
  const chuyen = L('magnet_n()', 'wait()', 'go_right()', 'go_right()', 'go_right()', 'magnet_off()', 'go_left()');
  const v1 = V({ x: 2, y: 1, vat: [{ x: 3, y: 1 }] }, chuyen);
  kiem('hộp sắt chở 3 ô sang phải rồi thả (thả cùng nhịp với bước bay về đầu tiên), drone về 2 ô: hộp đúng ô vật mờ, drone đúng ô bóng mờ: thắng', v1.thang === true && v1.nhip === 5, J([v1.thang, v1.nhip, v1.vat]));
  const v2 = V({ x: 2, y: 1, vat: [{ x: 4, y: 1 }] }, chuyen);
  kiem('hộp nằm lệch vật mờ một ô: không thắng, lech-bong-mo nói "Một vật chưa nằm đúng ô như bóng mờ."', v2.thang === false);
  const v3 = V({ x: 3, y: 1, cam: true }, L('magnet_n()', 'wait()', 'go_right()', 'go_right()', 'go_right()'));
  kiem('bongMo.cam: drone đang DÍNH hộp lúc xong (nam châm treo): thắng', v3.thang === true && v3.namCham.cam !== null);
  const v4 = V({ x: 3, y: 1, cam: true }, L('go_right()', 'go_right()', 'go_right()'));
  kiem('bongMo.cam mà drone không dính gì: không thắng', v4.thang === false);
  // lời nói của chẩn đoán
  const manBM = { chuong: 'thu', loaiRobot: 'drone', hamGoc: BAY, moXuong: true, camHamCuaEm: false, khung: { chinh: 10, moiHam: 10 }, cauTruc: [], mucTieu: 'bong-mo', san: SAN, batDau: bd, bongMo: { x: 4, y: 2, diQua: [{ x: 4, y: 0 }] } };
  const kl = ChamHoc.cham(manBM, { chinh: ['go_right()'] }, []);
  const clech = kl.chanDoan.find((c) => c.ma === 'lech-bong-mo'), cqua = kl.chanDoan.find((c) => c.ma === 'chua-qua-diem');
  kiem('chẩn đoán nói "Drone dừng lệch một ô về bên trái so với bóng mờ." và "Drone chưa đi qua điểm ◆" (không còn chữ "Xe")', !!clech && clech.loi === 'Drone dừng lệch một ô về bên trái so với bóng mờ.' && !!cqua && /^Drone chưa đi qua điểm ◆/.test(cqua.loi) && !/\bXe\b|\bxe\b/.test(cqua.loi), J(kl.chanDoan.map((c) => c.loi)));
  const klv = ChamHoc.cham(Object.assign({}, manBM, { hamGoc: BAY.concat(NC), robot: { than: 'drone', tay: 'nam-cham', camBien: [] }, san: SANV, batDau: { x: 0, y: 1, huong: 0 }, vatChat: chat, bongMo: { x: 0, y: 1, vat: [{ x: 3, y: 1 }] } }), { chinh: ['wait()'] }, []);
  const cv = klv.chanDoan.find((c) => c.ma === 'lech-bong-mo');
  kiem('vật mờ: "Drone đúng chỗ rồi. Một vật chưa nằm đúng ô như bóng mờ."', !!cv && /^Drone đúng chỗ rồi\. Một vật chưa nằm đúng ô như bóng mờ\.$/.test(cv.loi), cv && cv.loi);
  const manXe = Object.assign({}, manBM, { loaiRobot: 'banh', hamGoc: ['left_move', 'right_move', 'wait'], bongMo: { x: 4, y: 2, huong: 0 } });
  const kx = ChamHoc.cham(manXe, { chinh: ['wait()'] }, []);
  kiem('xe bánh vẫn nói "Xe dừng lệch…" (chỉ drone đổi lời)', kx.chanDoan.some((c) => c.ma === 'lech-bong-mo' && /^Xe dừng lệch/.test(c.loi)), J(kx.chanDoan.map((c) => c.loi)));
}

/* ================================================================= 2. MÀN HỎNG: CÁNH XUỐNG KẸT */
console.log('\n== 2. Màn hỏng: phanCung thiếu go_down ==');
{
  const m9 = man(9);
  const HONG = ['go_up', 'go_left', 'go_right', 'wait', 'battery'];
  kiem('che-drone.9 hỏng: hamGoc = phanCung = go_up, go_left, go_right, wait, battery (không go_down) và canhBao "Cánh bay xuống hỏng"; không màn nào khác khai phanCung',
    J(m9.hamGoc) === J(HONG) && J(m9.phanCung) === J(HONG) && /Cánh bay xuống hỏng/.test(m9.canhBao) && che.every((m) => m.so === 9 || m.phanCung === undefined));
  const k = ChamHoc.cham(m9, m9.maMau, khoTruoc(m9.id));
  const cd = k.chanDoan.find((c) => c.ma === 'lenh-goc-hong');
  kiem('chạy fixed_fly() của màn chưa sửa (gọi recharge() → go_down()): lenh-goc-hong nói canhBao và "go_down() không chạy được", không phải ham-chua-co',
    !!cd && cd.ten === 'go_down' && /Cánh bay xuống hỏng/.test(cd.loi) && /go_down\(\) không chạy được/.test(cd.loi) && !maCua(k).includes('ham-chua-co'), J(k.chanDoan));
  const k2 = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['go("D")'] }, khoTruoc(m9.id));
  kiem('gọi go("D") ở màn hỏng: lenh-goc-hong (hàm của em gọi lệnh hỏng cũng báo)', maCua(k2).includes('lenh-goc-hong'));
  const k3 = ChamHoc.cham(Object.assign({}, m9, { chinhCoDinh: false }), { chinh: ['go("R")', 'go("R")', 'go("U")'] }, khoTruoc(m9.id));
  kiem('go("R") và go("U") chạy bình thường ở màn hỏng (nhánh "D" không chạy tới thì không lỗi)', !maCua(k3).includes('lenh-goc-hong') && k3.theoSan[0].robot.x === 2 && k3.theoSan[0].robot.y === 1, J(k3.theoSan[0].robot));
  const k4 = ChamHoc.cham(Object.assign({}, m9, { canhBao: undefined }), m9.maMau, khoTruoc(m9.id));
  kiem('không khai canhBao: lời mặc định "Bộ phận này hỏng"', /Bộ phận này hỏng/.test((k4.chanDoan.find((c) => c.ma === 'lenh-goc-hong') || {}).loi || ''));
  const dem = (phanCung) => dungNguCanh(Object.assign({}, m9, { phanCung })).hanhDong.length;
  kiem('bộ dò: hành động bay xuống bị bỏ khi phần cứng thiếu go_down (4 hướng đứng yên + 3 hướng bay = 4, so với 5 khi đủ)',
    dem(HONG) === 4 && dem(BAY.concat(['battery'])) === 5 && !dungNguCanh(m9).hanhDong.some((a) => a.bay === 2));
  const nho = nhipCheDroneNganNhat(Object.assign({}, m9, { hamGoc: BAY.concat(['battery']), phanCung: undefined }));
  kiem('bộ dò: cầu thang đi lên của 9 chỉ cần go_up / go_right nên đường ngắn nhất (8 nhịp) như khi đủ cánh', nho.nhip === 8 && nhipCheDroneNganNhat(m9).nhip === 8);
}

/* ================================================================= 3. SỔ LỆNH */
console.log('\n== 3. Sổ lệnh: năm hàm mới của che-drone ==');
{
  const moi = ['hurdle', 'scout', 'glide', 'fly', 'airlift'];
  kiem('SoLenh.theoChuong("che-drone") đúng năm hàm theo thứ tự chế: hurdle, scout, glide, fly, airlift; nhóm drone', J(SoLenh.theoChuong('che-drone').map((h) => h.ten)) === J(moi) && SoLenh.theoChuong('che-drone').every((h) => h.nhom === 'drone'));
  const dau = {};
  for (const m of tatCa) for (const t of m.taoHam) if (!dau[t]) dau[t] = m;
  kiem('go_out, come_back, safe_fly, fixed_fly là hàm CỦA MÀN: không là hàm cốt truyện, không trong Sổ lệnh, không trong hamCuaEmMoi của lời giải nào (come_back còn là tên của hàm của màn ở chương khác)',
    ['go_out', 'safe_fly', 'fixed_fly'].every((t) => !tenCotTruyen.includes(t) && SoLenh.tim(t) === null && tatCa.every((m) => !m.loiGiai.hamCuaEmMoi.some((h) => h.ten === t))) && che.every((m) => m.loiGiai.hamCuaEmMoi.every((h) => ['hurdle', 'scout', 'glide', 'fly', 'airlift'].includes(h.ten))));
  kiem('mỗi hàm có chuong và man đúng màn đầu tiên chế nó (taoHam của màn che-drone)', moi.every((t) => dau[t] && SoLenh.tim(t) && SoLenh.tim(t).man === dau[t].ma && SoLenh.tim(t).chuong === 'che-drone'));
  kiem('moTa là MỘT câu ngắn lớp 5: 8–80 chữ, không xuống dòng, không dấu chấm cuối', moi.every((t) => { const d = SoLenh.tim(t).moTa; return d.length >= 8 && d.length <= 80 && !/\n/.test(d) && !/[.]$/.test(d); }));
  kiem('tên hàm cốt truyện không trùng với lệnh gốc hay hàm của chương khác (mỗi tên đúng một mục Sổ lệnh, đúng một taoHam)',
    moi.every((t) => SoLenh.ds.filter((h) => h.ten === t).length === 1 && tatCa.filter((m) => m.taoHam.includes(t)).length === 1 && !KhoHam.HAM_GOC_MAC_DINH.includes(t)));
  const idx = (t) => SoLenh.ds.findIndex((h) => h.ten === t);
  kiem('thứ tự trong Sổ lệnh: nhóm drone — recharge, ship rồi hurdle, scout, glide, fly, airlift (sau ship của chương drone)', idx('hurdle') === idx('ship') + 1 && idx('airlift') === idx('ship') + 5);
  kiem('fly chỉ được tạo ở che-drone.5 (Sổ lệnh man che-drone.5); che-drone.9 không tạo cũng không sửa hàm của em nào (bản bỏ recharge() chỉ đúng khi cánh hỏng nên là hàm của màn fixed_fly)',
    SoLenh.tim('fly').man === 'che-drone.5' && J(man(9).taoHam) === '[]' && man(9).loiGiai.hamCuaEmMoi.length === 0 && man(9).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0) && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_fly"]');
  kiem('chương che-drone ngay sau drone, rồi flycam (17/10), thuộc đợt 2, tên "Chế lệnh drone", cùng gói với drone',
    ThuTu.thuTu.indexOf('flycam') === ThuTu.thuTu.indexOf('che-drone') + 1 && ThuTu.thuTu.indexOf('che-drone') === ThuTu.thuTu.indexOf('drone') + 1 && ThuTu.laDot2('che-drone') && ThuTu.ten['che-drone'] === 'Chế lệnh drone' &&
      ThuTu.goi.some((g) => g.chuong.includes('drone') && g.chuong.includes('che-drone')));
}

/* ================================================================= 4. SO CHÉO BỘ DÒ VỚI SAN-HOC.JS */
console.log('\n== 4. So chéo bộ dò (BFS) với san-hoc.js bằng chương trình ngẫu nhiên ==');
{
  let seed = 424242429;
  const rnd = (n) => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed % n; };
  let soCa = 0, lech = 0, ghiLech = '', soThang = 0, soThua = 0, soRoi = 0, soCam = 0, soVat = 0, soDiQua = 0, soHong = 0, soSac = 0, soHut = 0, soTha = 0, soRoiCuoi = 0;
  for (let lan = 0; lan < 2200; lan++) {
    const rong = 4 + rnd(4), cao = 3 + rnd(4);
    const g = Array.from({ length: cao }, () => Array(rong).fill('.'));
    const dat0 = (ch, n) => { for (let i = 0; i < n; i++) { const x = rnd(rong), y = rnd(cao); if (g[y][x] === '.') g[y][x] = ch; } };
    dat0('#', rnd(5)); dat0('=', rnd(3)); dat0('S', rnd(2)); dat0('>', rnd(2)); dat0('<', rnd(2)); dat0('^', rnd(2)); dat0('v', rnd(2)); dat0('P', rnd(3));
    const coVat = rnd(3) !== 0;
    if (coVat) dat0('o', 1 + rnd(3));
    const rows = g.map((r) => r.join(''));
    const sanh = []; g.forEach((r, y) => r.forEach((c, x) => { if (c !== '#') sanh.push([x, y]); }));
    if (!sanh.length) continue;
    const [bx, by] = sanh[rnd(sanh.length)];
    const bd = { x: bx, y: by, huong: rnd(4) };
    const vatChat = rows.map((r) => [...r].map((c) => (c === 'o' && rnd(5) !== 0 ? 's' : '.')).join(''));
    const vatThem = [];
    for (let k = 0; k < 2; k++) { const x = rnd(rong), y = rnd(cao); if ('<>^vS'.includes(g[y][x]) && !vatThem.some((q) => q.x === x && q.y === y) && coVat) vatThem.push({ x, y, chat: rnd(3) ? 'sat' : 'go' }); }
    const pin = rnd(5) !== 0 ? 3 + rnd(7) : undefined;
    const hongHuong = rnd(4) === 0 ? ['go_up', 'go_down', 'go_left', 'go_right'][rnd(4)] : null;
    let phanCung = BAY.concat(coVat || vatThem.length ? NC : []);
    if (pin !== undefined) phanCung = phanCung.concat(['battery']);
    if (hongHuong) phanCung = phanCung.filter((t) => t !== hongHuong);
    const manR = { loaiRobot: 'drone', san: rows, batDau: bd, hamGoc: phanCung, phanCung, mucTieu: 'bong-mo', bongMo: { x: bx, y: by }, vatChat, vatThem, pin };
    let ctx0;
    try { ctx0 = dungNguCanh(manR); } catch (e) { continue; }
    const HD = ctx0.hanhDong;
    const dai = 6 + rnd(26);
    const chuoi = [];
    for (let i = 0; i < dai; i++) chuoi.push(rnd(4) === 0 && chuoi.length ? chuoi[chuoi.length - 1] : HD[rnd(HD.length)]);
    // chạy thử bằng bộ dò (bóng mờ tạm) để biết trạng thái cuối và các ô đã ghé, rồi chọn bóng mờ
    let S = trangThaiDau(ctx0), n = 0, roi0 = false;
    const ghe = [];
    for (const a of chuoi) { S = buocMotNhip(ctx0, S, a); n++; ghe.push(S.y * ctx0.rong + S.x); if (S.roi) { roi0 = true; break; } }
    const bm = { x: S.x, y: S.y };
    if (rnd(2) === 0) { const [qx, qy] = sanh[rnd(sanh.length)]; bm.x = qx; bm.y = qy; }
    if (rnd(2) === 0) { const nd = 1 + rnd(2), ds = []; for (let i = 0; i < nd; i++) { const c = ghe[rnd(ghe.length)]; if (!ds.includes(c) && rnd(6) !== 0) ds.push(c); } bm.diQua = ds.map((c) => ({ x: c % ctx0.rong, y: Math.floor(c / ctx0.rong) })); }
    if (S.pos.length && rnd(3) !== 0) {
      const dat = S.pos.filter((p) => p >= 0);
      bm.vat = dat.map((p) => ({ x: p % ctx0.rong, y: Math.floor(p / ctx0.rong) }));
      if (rnd(4) === 0 && bm.vat.length) bm.vat[0] = { x: (bm.vat[0].x + 1) % ctx0.rong, y: bm.vat[0].y };
      if (S.pos.includes(-1) && rnd(5) !== 0) bm.cam = true;
    }
    manR.bongMo = bm;
    let ctx;
    try { ctx = dungNguCanh(manR); } catch (e) { continue; }
    let S2 = trangThaiDau(ctx), roi = false;
    for (const a of chuoi.slice(0, n)) { S2 = buocMotNhip(ctx, S2, a); if (S2.roi) { roi = true; break; } }
    const thangBfs = !roi && laThang(ctx, S2);
    const code = chuoiThanhMa(chuoi.slice(0, n));
    let kq;
    try { kq = SanHoc.chay({ san: rows, batDau: bd, loaiRobot: 'drone', hamGoc: phanCung, phanCung, mucTieu: 'bong-mo', bongMo: bm, vatChat, vat: vatThem, pin }, code); } catch (e) { lech++; if (!ghiLech) ghiLech = 'NÉM LỖI ' + e.message + ' ' + J({ rows, bd, bm }); soCa++; continue; }
    soCa++;
    const vatBfs = S2.pos.map((p) => (p === -1 ? 'cam' : (p % ctx.rong) + ',' + Math.floor(p / ctx.rong)));
    const vatSan = kq.vat.map((v) => (v.trangThai === 'cam' ? 'cam' : v.x + ',' + v.y));
    const maskSan = kq.diQua.reduce((m, q, i) => m | (q.da ? (1 << i) : 0), 0);
    const ok = kq.robot.x === S2.x && kq.robot.y === S2.y && (pin === undefined ? kq.pin === null : kq.pin === S2.pin) && J(vatBfs) === J(vatSan) && maskSan === S2.mask && kq.thang === thangBfs && (kq.dungSom === 'het-pin') === roi && kq.nhip === (roi ? Math.min(kq.nhip, n) : n);
    if (thangBfs) soThang++; else soThua++;
    if (roi) { soRoi++; if (bm.x === S2.x && bm.y === S2.y && !(bm.diQua || []).length) soRoiCuoi++; }
    if (bm.cam) soCam++;
    if (bm.vat && bm.vat.length) soVat++;
    if (bm.diQua && bm.diQua.length) soDiQua++;
    if (hongHuong) soHong++;
    soSac += ev(kq, 'sac-pin').length; soHut += ev(kq, 'hut-vat').length; soTha += ev(kq, 'tha-vat').length;
    if (!ok) { lech++; if (!ghiLech) ghiLech = J({ rows, bd, bm, pin, vatChat, vatThem, hongHuong, code: code.split('\n').join(';'), bfs: [S2.x, S2.y, S2.pin, S2.mask, vatBfs, thangBfs, roi], san: [kq.robot.x, kq.robot.y, kq.pin, maskSan, vatSan, kq.thang, kq.dungSom] }); }
  }
  kiem('so chéo ' + soCa + ' chương trình ngẫu nhiên (tường cao, rào, bậc thang, băng chuyền, ô sạc, vật sắt / gỗ kể cả vật trên băng / bậc thang, nam châm gộp lệnh bay, pin ngẫu nhiên hay vô hạn, cánh hỏng một hướng; bóng mờ, ◆, vật mờ, drone mờ dính vật): từng nhịp bộ dò và san-hoc.js trùng ô, pin, vị trí vật, ◆, kết quả thắng / thua / rơi',
    soCa >= 1000 && lech === 0, lech + ' lệch · ' + ghiLech);
  kiem('mẫu ngẫu nhiên đủ loại ca: thắng ' + soThang + ' / thua ' + soThua + ', rơi hết pin ' + soRoi + ' (đúng ô bóng mờ mà vẫn rơi ' + soRoiCuoi + '), dính vật mờ ' + soCam + ', vật mờ ' + soVat + ', ◆ ' + soDiQua + ', cánh hỏng ' + soHong + ', sạc ' + soSac + ', hút ' + soHut + ', thả ' + soTha,
    soThang >= 100 && soThua >= 300 && soRoi >= 60 && soCam >= 15 && soVat >= 100 && soDiQua >= 150 && soHong >= 150 && soSac >= 100 && soHut >= 100 && soTha >= 50, [soThang, soThua, soRoi, soRoiCuoi, soCam, soVat, soDiQua, soHong, soSac, soHut, soTha].join());
}

/* ================================================================= 5. MƯỜI MÀN CHE-DRONE */
console.log('\n== 5. Chương che-drone: dữ liệu và luật từng màn ==');
const BANG = [];
{
  kiem('đúng 10 màn, số 1..10, mã che-drone.1…, id theo vị trí trong thuTu (cuối cùng, ngay sau drone), tên "Chế lệnh drone"',
    che.length === 10 && che.every((m, i) => m.so === i + 1 && m.id === VT + '.' + (i + 1) && m.ma === 'che-drone.' + (i + 1)) && ThuTu.thuTu.indexOf('che-drone') === ThuTu.thuTu.indexOf('drone') + 1 && ThuTu.ten['che-drone'] === 'Chế lệnh drone' && ThuTu.laDot2('che-drone'));
  kiem('tên các màn: Vòng qua cột, Bay ra rồi về, Rừng cột đá, Bậc thang bay, Bay có sạc, Cẩu hàng, Đường về, Sạc ở phía dưới, Cánh xuống hỏng, Kho hàng trên cao; hàng 3 làm quen · 3 luyện · 3 biến thể · 1 trùm; chỉ trùm có huy hiệu che-drone "Huy hiệu Chế lệnh drone"',
    J(che.map((m) => m.ten)) === J(['Vòng qua cột', 'Bay ra rồi về', 'Rừng cột đá', 'Bậc thang bay', 'Bay có sạc', 'Cẩu hàng', 'Đường về', 'Sạc ở phía dưới', 'Cánh xuống hỏng', 'Kho hàng trên cao']) &&
      J(che.map((m) => m.hang)) === J(['lam-quen', 'lam-quen', 'lam-quen', 'luyen', 'luyen', 'luyen', 'bien-the', 'bien-the', 'bien-the', 'trum']) && che.every((m) => !!m.huyHieu === (m.so === 10)) && che[9].huyHieu.ma === 'che-drone' && che[9].huyHieu.ten === 'Huy hiệu Chế lệnh drone');
  kiem('mọi màn: DRONE (robot { than: "drone", tay: null | "nam-cham", camBien: [] | pin }), nam châm treo chỉ ở 6 và 10, pin (camBien pin) chỉ ở 5, 8, 9; chương trình 10 ô, mỗi hàm 10 ô, Xưởng mở, được dùng hàm của em, cauTruc for/if/while',
    che.every((m) => m.loaiRobot === 'drone' && m.robot.than === 'drone' && (m.robot.tay === ([6, 10].includes(m.so) ? 'nam-cham' : null)) && (m.robot.camBien.length === ([5, 8, 9].includes(m.so) ? 1 : 0)) && (m.robot.camBien.length === 0 || (m.robot.camBien[0].ma === 'pin' && m.robot.camBien[0].o === 'than')) &&
      m.khung.chinh === 10 && m.khung.moiHam === 10 && m.moXuong === true && m.camHamCuaEm === false && J(m.cauTruc) === '["for","if","while"]'));
  const KHAY_HONG = ['go_up', 'go_left', 'go_right', 'wait', 'battery'];
  kiem('khay: bốn lệnh bay + wait() ở mọi màn; + battery() ở 5 và 8; + magnet_n / magnet_s / magnet_off ở 6 và 10; 9 hỏng cánh xuống: khay = phần cứng = thiếu go_down (còn battery)',
    che.every((m) => J(m.hamGoc) === J(m.so === 9 ? KHAY_HONG : BAY.concat([5, 8].includes(m.so) ? ['battery'] : [], [6, 10].includes(m.so) ? NC : []))));
  kiem('lệnh chế ở từng màn (taoHam): hurdle, scout, —, glide, fly, airlift, —, —, —, —; 7, 8 và 9 viết / sửa HÀM CỦA MÀN (không hàm của em mới, không sửa hàm của em nào)',
    J(che.map((m) => m.taoHam)) === J([['hurdle'], ['scout'], [], ['glide'], ['fly'], ['airlift'], [], [], [], []]) && [7, 8, 9].every((i) => man(i).loiGiai.hamCuaEmMoi.length === 0 && man(i).congThucKhac.every((c) => !c.hamCuaEmMoi || c.hamCuaEmMoi.length === 0)) &&
      J(man(7).loiGiai.hamCuaMan.map((h) => h.ten)) === '["go_out","come_back"]' && J(man(8).loiGiai.hamCuaMan.map((h) => h.ten)) === '["safe_fly"]' && J(man(9).loiGiai.hamCuaMan.map((h) => h.ten)) === '["fixed_fly"]');
  kiem('mục tiêu bong-mo ở cả 10 màn (có bongMo, không có cờ F hay ô đích D); chinhCoDinh ở mọi màn trừ 3 và 10; khoaHamMan ["go_out"] chỉ ở 7; phanCung + canhBao chỉ ở 9; gioiHanHam 3 chỉ ở 10; không daoChieu',
    che.every((m) => m.mucTieu === 'bong-mo' && !!m.bongMo && !/[FD]/.test(sanCua(m).flat().join('')) && (m.chinhCoDinh === true) === ![3, 10].includes(m.so) && (m.so === 7) === (J(m.khoaHamMan) === '["go_out"]') &&
      (m.so === 9) === !!m.phanCung && (m.so === 9) === !!m.canhBao && (m.so === 10 ? m.gioiHanHam === 3 : m.gioiHanHam === undefined) && m.daoChieu === undefined));
  kiem('pin: 5 ba sân pin 7, 6, 5 (mảng song song với sân); 8 pin 4; 9 pin 5; các màn khác không pin. Ô sạc P: 5 cả hàng trên, 8 cả hàng dưới, 9 một ô trên đường bay; ◆: 2 (một), 3 (hai), 7 (một); hộp sắt: 6 (ba, hàng rào cột 1) và 10 (hai)',
    J(che.map((m) => m.pin)) === J([undefined, undefined, undefined, undefined, [7, 6, 5], undefined, undefined, 4, 5, undefined]) &&
      che.every((m) => (/P/.test(sanCua(m).flat().join('')) === [5, 8, 9].includes(m.so))) && J(che.map((m) => ((m.bongMo && !Array.isArray(m.bongMo) && m.bongMo.diQua) || []).length)) === J([0, 1, 2, 0, 0, 0, 1, 0, 0, 0]) &&
      J(che.map((m) => (Array.isArray(m.bongMo) ? 0 : (m.bongMo.vat || []).length))) === J([0, 0, 0, 0, 0, 3, 0, 0, 0, 2]) && che.every((m) => (/o/.test(sanCua(m).flat().join('')) && !!m.vatChat) === [6, 10].includes(m.so)));
  kiem('sân ≤ 7 cột × 9 hàng; MỘT sân mỗi màn trừ 5 (ba sân giống nhau); drone xuất phát đứng được',
    che.every((m) => sanCua(m).length === (m.so === 5 ? 3 : 1) && sanCua(m).every((s) => s.length <= 9 && s[0].length <= 7 && s.every((r) => r.length === s[0].length)) && sanCua(m).every((s, i) => { const b = Array.isArray(m.batDau) ? m.batDau[i] : m.batDau; return !SanHoc.lyDoChan(SanHoc.docSan(s), 'drone', b.x, b.y); })));
  kiem('nhipTheoLoiGiai chỉ ở 5 (ghé sạc sau mỗi ô tốn nhiều nhịp hơn đường ngắn nhất), 6 và 10 (nhấc hộp ở ô kế gộp với bước bay xuống), 8 (như 5); các màn khác sao.nhip = đường ngắn nhất BFS; màn 5 nhiều sân tính nhịp theo TỔNG',
    che.every((m) => (m.nhipTheoLoiGiai === true) === [5, 6, 8, 10].includes(m.so)) && man(5).nhipTheo === 'tong');

  for (const m of che) {
    const kho = khoTruoc(m.id);
    const khoNay = tron(kho, m.loiGiai.hamCuaEmMoi);
    const r = ChamHoc.cham(m, m.loiGiai, khoNay);
    kiem(m.id + ' ' + m.ten + ': lời giải cách 1 thắng 3 sao, ' + r.soO + ' ô = sao.o, ' + r.soNhip + ' nhịp = sao.nhip, không chẩn đoán nào (kể cả thông tin)',
      r.thang && r.sao === 3 && r.soO === m.sao.o && r.soNhip === m.sao.nhip && r.chanDoan.length === 0, J({ thang: r.thang, sao: r.sao, soO: r.soO, saoO: m.sao.o, soNhip: r.soNhip, saoNhip: m.sao.nhip, cd: maCua(r) }));
    const bfs = nhipCheDroneTatCa(m, khoNay);
    BANG.push({ m, r, bfs });
    kiem(m.id + ': BFS đường ngắn nhất = ' + bfs + (m.nhipTheoLoiGiai ? ' ≤' : ' =') + ' sao.nhip ' + m.sao.nhip, bfs !== null && (m.nhipTheoLoiGiai ? bfs <= m.sao.nhip : bfs === m.sao.nhip), 'BFS = ' + bfs + ', sao.nhip = ' + m.sao.nhip);
    if (m.chinhCoDinh) {
      const gui = ChamHoc.cham(m, { chinh: ['wait()', 'wait()', 'wait()'], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính gửi lên bị bỏ qua (kết quả y hệt lời giải)', J([gui.thang, gui.soO, gui.soNhip, gui.py]) === J([r.thang, r.soO, r.soNhip, r.py]) && m.maMau.chinh.length >= 1 && m.maMau.chinh.length <= m.khung.chinh);
      const rong = ChamHoc.cham(m, { chinh: [], hamCuaMan: m.loiGiai.hamCuaMan }, khoNay);
      kiem(m.id + ': chinhCoDinh — chương trình chính RỖNG gửi lên vẫn chạy bản mẫu (cùng nhịp, cùng sao)', rong.thang === r.thang && rong.sao === r.sao && rong.soNhip === r.soNhip);
    } else {
      kiem(m.id + ': người chơi tự viết chương trình chính (maMau.chinh rỗng, lời giải ≤ 10 dòng, gọi hàm đã chế)', m.maMau.chinh.length === 0 && m.loiGiai.chinh.length >= 1 && m.loiGiai.chinh.length <= 10 && !ChamHoc.cham(m, { chinh: [] }, khoNay).thang);
    }
    // bóng mờ: nằm trên ô bay được, số vật mờ đúng bằng số vật, ◆ bay được; chạy xong thắng đúng ở nhịp cuối
    const bmc = (m.so === 5 ? m.bongMo[0] : m.bongMo), snc = SanHoc.docSan(sanCua(m)[0]);
    const nVat = Array.isArray(m.san[0]) ? 0 : SanHoc.docSan(m.san, undefined, undefined, m.vatChat).vat.length;
    kiem(m.id + ': bóng mờ và ◆ nằm trên ô bay được; số vật mờ đúng bằng số hộp của sân; không khai huong (drone không có hướng mặt); chạy xong thắng ở nhịp cuối',
      !SanHoc.lyDoChan(snc, 'drone', bmc.x, bmc.y) && (bmc.diQua || []).every((q) => !SanHoc.lyDoChan(snc, 'drone', q.x, q.y)) && (bmc.vat || []).length === nVat && bmc.huong === undefined &&
        r.thang && nhipVet(r).slice(-1)[0] && ev(r, 'toi-bong-mo').length >= 1 && (m.so === 5 || (r.theoSan[0].bongMo.x === bmc.x && r.theoSan[0].bongMo.y === bmc.y)));
    kiem(m.id + ': có ít nhất 1 công thức khác (congThucKhac), khác cách 1', Array.isArray(m.congThucKhac) && m.congThucKhac.length >= 1 && m.congThucKhac.every((c) => c.moTa && (Array.isArray(c.hamCuaEmMoi) || c.baiLam) && J({ b: c.baiLam || m.loiGiai, h: c.hamCuaEmMoi || [] }) !== J({ b: m.loiGiai, h: m.loiGiai.hamCuaEmMoi })));
    m.congThucKhac.forEach((c, i) => {
      const rc = ChamHoc.cham(m, c.baiLam || m.loiGiai, tron(khoNay, c.hamCuaEmMoi));
      kiem(m.id + ' công thức khác #' + (i + 1) + ' (' + c.moTa + '): thắng, không lỗi — ' + rc.sao + ' sao, ' + rc.soO + ' ô, ' + rc.soNhip + ' nhịp', rc.thang && maLoi(rc).length === 0, J({ thang: rc.thang, cd: rc.chanDoan.map((x) => x.ma) }));
    });
    const rk = ChamHoc.cham(m, m.loiGiaiKhac.baiLam, tron(kho, m.loiGiaiKhac.hamCuaEmMoi));
    kiem(m.id + ': loiGiaiKhac (' + m.loiGiaiKhac.moTa + ') thắng đúng 2 sao, nhiều ô hơn, cùng nhịp, vừa khung', rk.thang && rk.sao === 2 && rk.soO > m.sao.o && rk.soNhip === m.sao.nhip && !maCua(rk).includes('tran-khung'), J({ sao: rk.sao, soO: rk.soO, soNhip: rk.soNhip, cd: maCua(rk) }));
    m.loiSai.forEach((ls, i) => {
      const rs = ChamHoc.cham(m, ls.baiLam, tron(kho, ls.hamCuaEmMoi));
      const co = maCua(rs), thieu = ls.phaiCoMa.filter((x) => !co.includes(x));
      kiem(m.id + ' lời sai #' + (i + 1) + ' (' + ls.moTa + '): ' + (ls.phaiCoMa.length ? 'không thắng, có mã ' + ls.phaiCoMa.join('+') : 'thắng nhưng thiếu sao'),
        rs.sao < 3 && thieu.length === 0 && (ls.phaiCoMa.length ? !rs.thang : rs.thang), 'thiếu ' + thieu.join() + ' · có ' + co.join() + ' · sao ' + rs.sao);
    });
    const khoaTen = m.khoaHamMan || [];
    const suaTen = m.loiGiai.hamCuaEmMoi.map((h) => h.ten).concat(m.loiGiai.hamCuaMan.filter((h) => !khoaTen.includes(h.ten)).map((h) => h.ten));
    kiem(m.id + ': đề bài nhắc tên lệnh cần chế / sửa (' + (suaTen.join(', ') || 'màn dùng') + ')', suaTen.every((t) => (m.deBai + ' ' + (m.veMaMau || '')).includes(t + '(')), m.deBai);
    kiem(m.id + ': gợi ý 1–2 câu, không nói tên nút; đề 1–3 câu', m.goiY.length >= 1 && m.goiY.length <= 2 && (m.deBai.match(/[.?!](\s|$)/g) || []).length <= 3 && !/bấm|nút/i.test(m.goiY.join(' ')), m.deBai);
  }

  // luật riêng từng màn
  const m1 = man(1), k1 = khoTruoc(m1.id), s1 = tron(k1, m1.loiGiai.hamCuaEmMoi);
  kiem('30.1 Vòng qua cột: cột đá ở ngay bên phải drone, bóng mờ ngay sau cột cùng hàng; hurdle() = lên, phải, phải, xuống (4 nhịp); bay vòng phía dưới cũng 4 nhịp; bay thẳng đâm cột; BFS 4',
    m1.san[m1.batDau.y][m1.batDau.x + 1] === '#' && m1.bongMo.x === m1.batDau.x + 2 && m1.bongMo.y === m1.batDau.y && ChamHoc.cham(m1, m1.loiGiai, s1).soNhip === 4 && nhipCheDroneTatCa(m1, s1) === 4 &&
      ChamHoc.cham(m1, m1.loiGiai, tron(k1, m1.congThucKhac[0].hamCuaEmMoi)).soNhip === 4 && !ChamHoc.cham(m1, m1.loiSai[2].baiLam, tron(k1, m1.loiSai[2].hamCuaEmMoi)).thang);
  const m2 = man(2), k2 = khoTruoc(m2.id), s2 = tron(k2, m2.loiGiai.hamCuaEmMoi);
  kiem('30.2 Bay ra rồi về: bóng mờ cùng ô với drone nhưng có ◆ cách 3 ô; scout(3) 6 nhịp; scout(5) trên sân dài hơn 10 nhịp (n là đối số thật); thiếu ◆ thì chương trình rỗng không thắng',
    m2.bongMo.x === m2.batDau.x && m2.bongMo.y === m2.batDau.y && m2.bongMo.diQua[0].x === 3 && ChamHoc.cham(m2, m2.loiGiai, s2).soNhip === 6 && !ChamHoc.cham(Object.assign({}, m2, { chinhCoDinh: false }), { chinh: [] }, s2).thang &&
      (() => { const t = ChamHoc.cham(Object.assign({}, m2, { chinhCoDinh: false, san: ['......', '######'], bongMo: { x: 0, y: 0, diQua: [{ x: 5, y: 0 }] } }), { chinh: ['scout(5)'] }, s2); return t.thang && t.soNhip === 10; })());
  const m3 = man(3), k3 = khoTruoc(m3.id);
  const r3 = ChamHoc.cham(m3, m3.loiGiai, k3);
  kiem('30.3 Rừng cột đá: ba cột đá, ◆ giữa các cột ép đi qua hàng giữa; hurdle() ba lần = 12 nhịp = BFS; bay hàng trên không ghé ◆ thì chua-qua-diem',
    r3.thang && r3.soNhip === 12 && nhipCheDroneTatCa(m3, k3) === 12 && m3.bongMo.diQua.length === 2 && maCua(ChamHoc.cham(m3, m3.loiSai[1].baiLam, k3)).includes('chua-qua-diem'));
  const m4 = man(4), k4 = khoTruoc(m4.id), s4 = tron(k4, m4.loiGiai.hamCuaEmMoi);
  const kt = (ch) => { let n = 0; for (let y = 0; y < m4.san.length; y++) for (let x = 0; x < m4.san[0].length; x++) if (m4.san[y][x] === ch) n++; return n; };
  kiem('30.4 Bậc thang bay: hành lang bậc thang rộng đúng một ô (9 ô trống), glide(4) = 8 nhịp = BFS; glide(2) lên đúng hai bậc',
    kt('.') === 9 && ChamHoc.cham(m4, m4.loiGiai, s4).soNhip === 8 && nhipCheDroneTatCa(m4, s4) === 8 && (() => { const t = ChamHoc.cham(Object.assign({}, m4, { chinhCoDinh: false, bongMo: { x: 2, y: 2 } }), { chinh: ['glide(2)'] }, s4); return t.thang && t.soNhip === 4; })());
  const m5 = man(5), k5 = khoTruoc(m5.id), s5 = tron(k5, m5.loiGiai.hamCuaEmMoi);
  const r5 = ChamHoc.cham(m5, m5.loiGiai, s5);
  const w5 = ChamHoc.cham(m5, m5.maMau, tron(k5, [H('fly', ['walk(path)'], ['path'])]));
  kiem('30.5 Bay có sạc: ba sân pin 7, 6, 5; fly() ghé sạc theo pin: 8 + 8 + 10 = 26 nhịp, sân nào cũng còn pin cuối ≥ 1; bay thẳng walk(path) chỉ thắng sân pin 7 và hết pin ở hai sân kia; đường ray sạc là cả hàng trên',
    r5.thang && J(r5.theoSan.map((s) => s.soNhip)) === '[8,8,10]' && r5.soNhip === 26 && r5.theoSan.every((s) => s.pin >= 1) && J(w5.theoSan.map((s) => s.thang)) === '[true,false,false]' && maCua(w5).includes('het-pin') &&
      m5.san.every((s) => s[0] === 'PPPPPPP') && J(m5.pin) === '[7,6,5]');
  const bfsSan = m5.san.map((rows, i) => { const lm = SanHoc.lopMauCuaSan(m5, i); return nhipCheDroneNganNhat(Object.assign({}, m5, { san: rows, batDau: m5.batDau[i], pin: m5.pin[i], bongMo: lm.bongMo })).nhip; });
  kiem('30.5: BFS từng sân [6, 8, 8] = 22 < 26 (dọc đường ray sạc không cần ghé; chuẩn của màn lấy theo fly())', J(bfsSan) === '[6,8,8]' && bfs5Tong() === 22);
  function bfs5Tong() { return nhipCheDroneTatCa(m5, s5); }
  const m6 = man(6), k6 = khoTruoc(m6.id), s6 = tron(k6, m6.loiGiai.hamCuaEmMoi);
  const a6 = ChamHoc.cham(Object.assign({}, m6, { chinhCoDinh: false }), { chinh: ['airlift(3)'] }, s6);
  kiem('30.6 Cẩu hàng: ba hộp sắt cột 0 (drone xuất phát ngay trên hộp đầu), hàng rào cột 1, ba hộp mờ cột 3; airlift(3) một lần = 7 nhịp (thả cùng nhịp với bước bay về đầu tiên); cả màn 23 nhịp, BFS 21 gộp nhấc hộp với bước xuống',
    m6.san.every((r) => r[0] === 'o' && r[1] === '=') && J(m6.batDau) === '{"x":0,"y":0,"huong":0}' && a6.soNhip === 7 && ChamHoc.cham(m6, m6.loiGiai, s6).soNhip === 23 && nhipCheDroneTatCa(m6, s6) === 21 && ev(a6, 'hut-vat').length === 1 && ev(a6, 'tha-vat').length === 1);
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const pre = ChamHoc.cham(Object.assign({}, m7, { chinhCoDinh: false }), { chinh: ['go_out()'], hamCuaMan: m7.maMau.hamCuaMan }, k7);
  kiem('30.7 Đường về: go_out() của màn đưa drone từ nhà (0,1) tới ◆ (4,3) trong 8 nhịp (hurdle + glide(2)); go_out khóa và xem được; thân come_back() ban đầu chỉ có pass; bóng mờ = chỗ xuất phát, ◆ ở (4,3); hành lang rộng đúng một ô',
    pre.theoSan[0].soNhip === 8 && pre.theoSan[0].robot.x === 4 && pre.theoSan[0].robot.y === 3 && pre.theoSan[0].diQua[0].da === true && J(m7.khoaHamMan) === '["go_out"]' && J(m7.maMau.hamCuaMan.map((h) => h.ten)) === '["go_out","come_back"]' && J(m7.maMau.hamCuaMan[1].than) === J(['pass']) &&
      J(m7.bongMo) === J({ x: m7.batDau.x, y: m7.batDau.y, diQua: [{ x: 4, y: 3 }] }) && m7.san.join('').split('').filter((c) => c === '.').length === 9);
  const hb = m7.loiGiai.hamCuaMan.find((h) => h.ten === 'come_back');
  kiem('30.7: come_back() là LỆNH NGƯỢC của go_out() theo thứ tự ngược: hurdle (lên, phải, phải, xuống) rồi glide(2) (phải, xuống) × 2 → lên, trái × 3, trái, xuống; sửa go_out gửi lên vẫn bị bản mẫu thay',
    J(hb.than) === J(['for i in range(3):', '    go_up()', '    go_left()', 'go_left()', 'go_down()']) && (() => { const a = ChamHoc.cham(m7, { chinh: [], hamCuaMan: [H('go_out', ['go_right()']), hb] }, k7); const b = ChamHoc.cham(m7, m7.loiGiai, k7); return J([a.thang, a.soO, a.soNhip]) === J([b.thang, b.soO, b.soNhip]) && b.sao === 3; })());
  const rp = ChamHoc.cham(m7, m7.maMau, k7);
  kiem('30.7: để nguyên pass thì không thắng (lech-bong-mo, drone còn ở ◆); come_back KHÔNG khóa; không vào kho, không taoHam', !rp.thang && maCua(rp).includes('lech-bong-mo') && m7.taoHam.length === 0 && !k7.some((h) => h.ten === 'come_back' || h.ten === 'go_out') && !(m7.khoaHamMan || []).includes('come_back'));
  const m8 = man(8), k8 = khoTruoc(m8.id);
  const cu8 = ChamHoc.cham(m8, m8.maMau, k8);
  kiem('30.8 Sạc ở phía dưới: pin 4, đường ray sạc cả hàng dưới; safe_fly() của màn bay LÊN khi pin thấp: đâm mép sân rồi hết pin; bản sửa (xuống rồi lên) thắng 10 nhịp, pin cuối 2; BFS 8 (xuống ray, bay dọc, lên)',
    m8.san[1] === 'PPPPPPP' && !cu8.thang && maCua(cu8).includes('het-pin') && ChamHoc.cham(m8, m8.loiGiai, k8).thang && ChamHoc.cham(m8, m8.loiGiai, k8).soNhip === 10 && ChamHoc.cham(m8, m8.loiGiai, k8).theoSan[0].pin === 2 && nhipCheDroneTatCa(m8, k8) === 8);
  const m9 = man(9), k9 = khoTruoc(m9.id);
  const r9 = ChamHoc.cham(m9, m9.loiGiai, k9);
  const fh = m9.loiGiai.hamCuaMan[0];
  kiem('30.9 Cánh xuống hỏng: cầu thang đi lên (0,2) → (6,0) chỉ dùng go_up / go_right, ô sạc P ở (4,1) ngay trên đường bay; pin 5, tám bước: drone qua P ở bước thứ 5 (pin 0 → đầy), tới bóng mờ còn pin 2; fixed_fly() sửa (không recharge) thắng 8 nhịp; thân ban đầu = fly() có recharge()',
    m9.san[1][4] === 'P' && r9.thang && r9.soNhip === 8 && r9.theoSan[0].pin === 2 && ev(r9, 'sac-pin').length === 1 && !fh.than.join(' ').includes('recharge') && m9.maMau.hamCuaMan[0].than.join(' ').includes('recharge()') && !ChamHoc.cham(m9, m9.maMau, k9).thang);
  kiem('30.9: không có ô sạc thì tám bước không đủ pin 5 (đối chứng bộ dò: bỏ P khỏi sân thì BFS không giải được); fly() của em trong kho còn nguyên recharge()',
    nhipCheDroneNganNhat(Object.assign({}, m9, { san: m9.san.map((r) => r.replace('P', '.')) })).nhip === null && k9.find((h) => h.ten === 'fly').than.includes('    recharge()'));
  const m10 = man(10), k10 = khoTruoc(m10.id);
  const r10 = ChamHoc.cham(m10, m10.loiGiai, k10);
  const gh = ChamHoc.cham(m10, m10.loiSai[4].baiLam, k10);
  kiem('30.10 Kho hàng trên cao: gioiHanHam 3 — lời giải gọi 3 hàm khác nhau (hurdle, glide, airlift) vừa giới hạn; 4 hàm khác nhau bị qua-gioi-han-ham (nêu "3"); trùm không khóa chương trình chính; 19 nhịp, BFS 17',
    r10.thang && J([...new Set(m10.loiGiai.chinh.filter((s) => /^\s*[a-z_]+\(/.test(s) && !/^go_/.test(s.trim())).map((s) => s.trim().replace(/\(.*$/, '')))].sort()) === J(['airlift', 'glide', 'hurdle']) && maCua(gh).join() === 'qua-gioi-han-ham' && /3/.test(gh.chanDoan[0].loi) && !gh.thang && m10.chinhCoDinh !== true &&
      r10.soNhip === 19 && nhipCheDroneTatCa(m10, k10) === 17);
  kiem('30.10: hai hộp sắt (4,3) và (4,4), hàng rào cột 5, hộp mờ (6,3) (6,4); drone về (4,4); walk thay cho hurdle / glide vẫn thắng (nhưng nhiều ô hơn)',
    m10.san[3][4] === 'o' && m10.san[4][4] === 'o' && m10.san[3][5] === '=' && m10.san[4][5] === '=' && J(m10.bongMo) === J({ x: 4, y: 4, vat: [{ x: 6, y: 3 }, { x: 6, y: 4 }] }) && m10.congThucKhac.every((c) => ChamHoc.cham(m10, c.baiLam, k10).thang));

  console.log('\n  Bảng 10 màn che-drone (lời giải cách 1, sao; BFS = nhịp ngắn nhất)');
  console.log('  màn   | tên                  | ô  | nhịp | BFS | tạo / sửa      | lời giải (chương trình chính)');
  for (const { m, bfs } of BANG) {
    console.log('  ' + m.id.padEnd(5) + ' | ' + m.ten.padEnd(20) + ' | ' + String(m.sao.o).padEnd(2) + ' | ' + String(m.sao.nhip).padEnd(4) + ' | ' + String(bfs).padEnd(3) + ' | ' + (m.loiGiai.hamCuaEmMoi.map((h) => h.ten).join(',') || (m.loiGiai.hamCuaMan.length ? 'hàm của màn' : '—')).padEnd(14) + ' | ' + m.loiGiai.chinh.join(' ; '));
  }
}

/* ================================================================= 6. ĐƯỜNG BFS CHẠY THẬT */
console.log('\n== 6. Đường BFS (do-duong-che-drone.mjs) đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng nhịp BFS ==');
{
  for (const m of che.filter((x) => !x.khoaHamMan)) {
    let ok = true, tong = 0, bfsTong = 0, chiTiet = '';
    sanCua(m).forEach((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const con = Object.assign({}, m, { san: rows, batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, pin: Array.isArray(m.pin) ? m.pin[i] : m.pin, bongMo: lm.bongMo || m.bongMo, vatChat: lm.vatChat });
      const b = nhipCheDroneNganNhat(con);
      const k = SanHoc.chay(cfgSan(m, i), chuoiThanhMa(b.chuoi));
      bfsTong += b.nhip; tong += k.nhip;
      if (!(k.thang === true && k.nhip === b.nhip && !k.loi)) { ok = false; chiTiet += J([i, b.nhip, k.thang, k.nhip, k.loi]); }
    });
    kiem(m.id + ': đường BFS (' + bfsTong + ' nhịp' + (sanCua(m).length > 1 ? ' tổng ' + sanCua(m).length + ' sân' : '') + ') đổi thành lệnh gốc rồi chạy SanHoc.chay: thắng đúng số nhịp BFS, không lỗi', ok && tong === bfsTong, chiTiet);
  }
  // màn 7: đoạn cố định + BFS
  const m7 = man(7), k7 = khoTruoc(m7.id);
  const bf = nhipCheDroneTatCa(m7, k7);
  const sau = nhipCheDroneNganNhat(m7, { batDau: { x: 4, y: 3, mask: 1 } });
  const pb = chuoiThanhMa(sau.chuoi).split('\n').filter(Boolean);
  const r = ChamHoc.cham(m7, { chinh: m7.maMau.chinh, hamCuaMan: [m7.maMau.hamCuaMan[0], H('come_back', pb)] }, k7);
  kiem('30.7: tính cả đoạn go_out() cố định (8 nhịp chạy thật) + BFS còn lại ' + sau.nhip + ' = ' + bf + '; đường BFS đổi thành lệnh gốc làm thân come_back() chạy thật thắng đúng ' + bf + ' nhịp', bf === 16 && sau.nhip === 8 && r.thang && r.soNhip === bf, J([bf, sau.nhip, r.thang, r.soNhip]));
  // bộ dò tự kiểm
  const m2 = man(2);
  kiem('bộ dò tự kiểm: bỏ ◆ ở 30.2 (bóng mờ cùng ô với drone, không ◆) thì chương trình rỗng là xong: 0 nhịp', nhipCheDroneNganNhat(Object.assign({}, m2, { bongMo: { x: m2.batDau.x, y: m2.batDau.y } })).nhip === 0);
  kiem('bộ dò: pin về 0 ở nhịp cuối rơi — bóng mờ cách 3 ô, pin 3, không ô sạc: không giải được; pin 4: 3 nhịp; mục tiêu tới cờ pin 3: 3 nhịp',
    nhipCheDroneNganNhat({ loaiRobot: 'drone', san: ['....'], batDau: { x: 0, y: 0, huong: 0 }, hamGoc: BAY, mucTieu: 'bong-mo', bongMo: { x: 3, y: 0 }, pin: 3 }).nhip === null &&
      nhipCheDroneNganNhat({ loaiRobot: 'drone', san: ['....'], batDau: { x: 0, y: 0, huong: 0 }, hamGoc: BAY, mucTieu: 'bong-mo', bongMo: { x: 3, y: 0 }, pin: 4 }).nhip === 3 &&
      nhipCheDroneNganNhat({ loaiRobot: 'drone', san: ['...F'], batDau: { x: 0, y: 0, huong: 0 }, hamGoc: BAY, mucTieu: 'toi-co', pin: 3 }).nhip === 3);
  kiem('bộ dò: toiDaTrangThai nhỏ → catNgang true (không kết luận)', nhipCheDroneNganNhat(man(10), { toiDaTrangThai: 50 }).catNgang === true);
  kiem('bộ dò: vật gỗ không hút được (không bao giờ tới hộp mờ); phần cứng thiếu magnet_n và magnet_s thì không có hành động bật nam châm',
    nhipCheDroneNganNhat(Object.assign({}, man(6), { vatChat: ['....', '....', '....'] })).nhip === null && !dungNguCanh(Object.assign({}, man(6), { phanCung: BAY.concat(['magnet_off']) })).hanhDong.some((a) => a.nc === 'on'));
}

/* ================================================================= 7. KHO CUỐI GAME VÀ HUY HIỆU */
console.log('\n== 7. Kho hàm của em, huy hiệu, thẻ script ==');
{
  const cuoi = khoTruoc('het');
  kiem('kho cuối game có đủ năm hàm của che-drone (hurdle, scout, glide, fly, airlift), fly còn nguyên recharge() (không bị sửa ở 30.9); go_out, come_back, safe_fly, fixed_fly (hàm của màn) không có trong kho',
    ['hurdle', 'scout', 'glide', 'fly', 'airlift', 'go', 'walk', 'recharge', 'ship'].every((t) => cuoi.some((h) => h.ten === t)) && ['go_out', 'come_back', 'safe_fly', 'fixed_fly'].every((t) => !cuoi.some((h) => h.ten === t)) &&
      J(cuoi.find((h) => h.ten === 'fly').than) === J(['for c in path:', '    go(c)', '    recharge()']));
  const sach = KhoHam.moi({ tenCoDinh: tenCotTruyen });
  kiem('KhoHam khóa tên: người chơi không tạo được hàm tên hurdle / scout / glide / fly / airlift bằng tên trùng ngoài màn chế nó', ['hurdle', 'scout', 'glide', 'fly', 'airlift'].every((t) => tenCotTruyen.includes(t) && sach.tao(t, [], {}).ok === false));
  const hh = fs.readFileSync(path.join(day, 'game', 'huy-hieu.js'), 'utf8');
  kiem("huy hiệu: game/huy-hieu.js có HINH['che-drone'] dựng bằng code từ thân drone, có bánh răng (themBanhRang)", /HINH\['che-drone'\] = function \(\)[\s\S]*?thanPart\('drone'\)[\s\S]*?themBanhRang\(p\);\s*return p;\s*\};/.test(hh));
  const html = fs.readFileSync(path.join(day, 'game', 'choi.html'), 'utf8');
  const tags = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]);
  const vtri = (f) => tags.indexOf('../' + f);
  kiem('choi.html có thẻ script ../man-che-drone.js đúng một lần, sau man-che-may-nem.js (cùng sổ màn)', tags.filter((t) => t === '../man-che-drone.js').length === 1 && vtri('man-che-drone.js') > vtri('man-che-may-nem.js'), J(tags));
  kiem('so-lenh.js nạp trước man-che-drone.js', vtri('so-lenh.js') >= 0 && vtri('so-lenh.js') < vtri('man-che-drone.js'));
}

console.log('\n---------------------------------------------');
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong);
if (hong) process.exit(1);
