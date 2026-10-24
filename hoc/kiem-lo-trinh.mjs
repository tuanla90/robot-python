// Kiểm tra lộ trình XUẤT BẢN, bổ sung cho các kiểm tra ngân hàng bài gốc.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const Cham = require('./cham.js');
const LR = require('./lap-rap.js');
const clone = x => JSON.parse(JSON.stringify(x));
const soSan = m => Array.isArray(m.san[0]) ? m.san.length : 1;
const get = ma => M.timMa(ma);
const kho = new Map(), khoTruoc = new Map();
let dat = 0;
function kiem(ten, fn) { fn(); dat++; }
function cham(m, lg, truoc = khoTruoc.get(m.ma) || []) {
  const hs = new Map(truoc.map(h => [h.ten, clone(h)]));
  for (const h of lg.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
  for (const h of m.hamCuaEmCan || []) assert.ok(hs.has(h), m.ma + ' cần hàm chưa được học: ' + h);
  return Cham.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hs.values()]);
}

kiem('410 mã duy nhất, 41 chương, 10 màn/chương', () => {
  assert.equal(M.danhSach.length, 410);
  assert.equal(new Set(M.danhSach.map(m => m.ma)).size, 410);
  assert.equal(M.chuong().length, 41);
  for (const c of M.chuong()) assert.deepEqual(M.danhSach.filter(m => m.chuong === c.ma).map(m => m.so), [1,2,3,4,5,6,7,8,9,10]);
});
kiem('không còn bài nhiều map trước màn 10, trùm đúng hàng', () => {
  for (const m of M.danhSach) {
    if (m.so < 10) assert.equal(soSan(m), 1, m.ma);
    assert.equal(m.hang === 'trum', m.so === 10, m.ma);
  }
  for (const c of ['khoang-cach', 'che-cam-bien', 'robot-hoan-thien', 'hai-robot', 'che-list', 'mau', 'che-mau', 'rap-nao', 'nam-cham', 'che-nam-cham', 'may-nem', 'che-may-nem', 'drone', 'che-drone', 'flycam', 'rap-du', 'me-cung', 'cam-bien-ben']) {
    assert.equal(soSan(get(c + '.10')), 3, c);
  }
});
kiem('đổi vị trí vẫn giữ mã bài cũ, gói Mê cung sau cảm biến', () => {
  assert.equal(get('khoang-cach.8').so, 4);
  assert.equal(get('khoang-cach.7').ten, 'Nhìn lối bên phải');
  assert.ok(get('cam-bien-ben.1').deBai.includes('left_clear'));
  assert.ok(!get('cam-bien-ben.1').deBai.includes('mê cung'));
  assert.equal(get('cam-bien-ben.10').hang, 'trum');
  assert.equal(get('che-cam-bien.7').so, 3);
  assert.equal(get('che-cam-bien.6').so, 7);
  assert.equal(TT.thuTu.indexOf('cam-bien-ben'), TT.thuTu.indexOf('che-cam-bien') + 1);
  assert.equal(TT.thuTu.indexOf('me-cung'), TT.thuTu.indexOf('cam-bien-ben') + 1);
  assert.equal(TT.goi.find(g => g.ma === 'me-cung').chuong[0], 'me-cung');
  assert.equal(get('me-cung.6').taoHam[0], 'follow_right');
  assert.equal(TT.goi.find(g => g.ma === 'cam-bien-ben').chuong[0], 'cam-bien-ben');
  assert.ok(!get('che-cam-bien.6').taoHam.includes('follow_right'));
});

for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  kiem(m.ma + ': lời giải thắng, 3 sao, toàn bộ sân', () => {
    for (const h of m.hamCuaEmCan) assert.ok(kho.has(h), m.ma + ' cần hàm chưa được học: ' + h);
    const r = cham(m, m.loiGiai);
    assert.ok(r.thang, m.ma + ': ' + JSON.stringify(r.chanDoan));
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.equal(r.theoSan.length, soSan(m), m.ma);
    assert.ok(r.theoSan.every(s => s.thang), m.ma);
    if (m.phienBanNoiDung === 2) {
      assert.equal(r.soNhip, m.sao.nhip, m.ma + ' ngưỡng nhịp chưa đo lại');
      assert.equal(r.soO, m.sao.o, m.ma + ' ngưỡng ô chưa đo lại');
    }
  });
  if (m.lapRap) kiem(m.ma + ': mọi cách lắp mẫu vẫn thắng', () => {
    assert.deepEqual(LR.kiemDuLieu(m), []);
    for (const c of m.lapRap.cachLap) {
      const a = LR.apDung(m, c);
      assert.ok(cham(a, a.loiGiai, khoTruoc.get(m.ma)).thang, m.ma + ': ' + JSON.stringify(c));
    }
  });
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}

kiem('gói phối hợp hai robot: hai robot đúng vai trò, mẫu chưa giải sẵn', () => {
  for (const c of ['doi-ho-bang', 'doi-gap-nem']) {
    for (let i = 1; i <= 10; i++) {
      const m = get(c + '.' + i);
      assert.equal(m.maMau.doi.length, 2, m.ma);
      assert.equal(m.doi.length, 2, m.ma);
      assert.equal(cham(m, m.maMau).thang, false, m.ma + ' mẫu đã giải sẵn');
    }
  }
  for (let i = 1; i <= 10; i++) {
    assert.deepEqual(get('doi-ho-bang.' + i).doi.map(d => d.loaiRobot), ['banh', 'nhen']);
    assert.deepEqual(get('doi-gap-nem.' + i).doi.map(d => d.robot.tay), ['kep', 'nem']);
  }
});
kiem('ba gói mới: mười màn khác nhau, 1–9 một sân, trùm ba sân', () => {
  for (const c of ['cam-bien-ben', 'doi-ho-bang', 'doi-gap-nem']) {
    const ds = M.danhSach.filter(m => m.chuong === c);
    assert.equal(new Set(ds.map(m => JSON.stringify([m.san, m.loiGiai]))).size, 10, c + ' có màn trùng nhau');
    assert.equal(new Set(ds.map(m => m.ten)).size, 10, c + ' trùng tên màn');
    for (const m of ds) assert.equal(soSan(m), m.so === 10 ? 3 : 1, m.ma);
  }
  for (const m of M.danhSach.filter(m => m.chuong === 'cam-bien-ben')) {
    const lg = JSON.stringify(m.loiGiai);
    assert.ok(/left_clear|right_clear/.test(lg), m.ma + ' không dùng cảm biến hai bên');
  }
  assert.ok(M.danhSach.filter(m => m.chuong === 'cam-bien-ben').filter(m => /left_clear/.test(JSON.stringify(m.loiGiai))).length >= 8);
});
kiem('chương mới không đổi id của ngân hàng bài gốc trong thu-tu-chuong.js', () => {
  const goc = fs.readFileSync(new URL('./thu-tu-chuong.js', import.meta.url), 'utf8');
  for (const c of ['cam-bien-ben', 'me-cung', 'doi-ho-bang', 'doi-gap-nem']) assert.ok(!goc.includes("'" + c + "'"), c);
  assert.equal(TT.thuTu.indexOf('doi-ho-bang'), TT.thuTu.indexOf('che-nhen') + 1);
  assert.equal(TT.thuTu.indexOf('doi-gap-nem'), TT.thuTu.indexOf('rap-tay') + 1);
  assert.ok(TT.dot2.includes('doi-ho-bang') && TT.dot2.includes('doi-gap-nem'));
});

kiem('mê cung: chỉ tiến khi gặp tường thì rẽ phải không giải được trùm', () => {
  const m = get('me-cung.10');
  const sai = { chinh: ['for i in range(60):', '    if front_clear():', '        move()', '    else:', '        turn_right()'] };
  assert.equal(cham(m, sai).thang, false);
});
kiem('các bài mê cung vẫn cần người học hoàn thành mẫu', () => {
  for (let i = 1; i <= 10; i++) {
    const m = get('me-cung.' + i);
    assert.equal(cham(m, m.maMau).thang, false, m.ma + ' mẫu đã giải sẵn');
  }
});
kiem('trùm lắp ráp giữ lựa chọn nhanh hoặc rẻ và mọi hàm vừa 10 ô', () => {
  const m = get('rap-du.10');
  const tk = LR.thongKeMau(m, khoTruoc.get(m.ma));
  assert.ok(tk.every(x => x.thang && x.sao === 3));
  assert.ok(tk[0].nhip < tk[1].nhip && tk[1].gia < tk[0].gia);
  assert.deepEqual(LR.kiemCanMan(m, khoTruoc.get(m.ma)), []);
  for (const c of m.lapRap.cachLap) for (const h of c.loiGiai.hamCuaMan) assert.ok(h.than.length <= 10);
});
kiem('mê cung: bỏ nhánh quay trái sẽ mắc ở ngõ cụt', () => {
  const m = get('me-cung.10');
  const lg = clone(m.loiGiai);
  lg.hamCuaEmMoi = [{ ten: 'follow_right', thamSo: [], than: ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()'] }];
  assert.equal(cham(m, lg).thang, false);
});
kiem('máy ném: ghi cứng tầm theo hàng không vượt cả ba kho', () => {
  const m = get('may-nem.10');
  const lg = { chinh: ['for i in range(3):', '    load()', '    wait()', '    turn_left()', '    aim(3 - i)', '    throw()', '    wait()', '    turn_right()', '    forward(2)'] };
  assert.equal(cham(m, lg).thang, false);
});
kiem('drone: bỏ sạc không giao được cả hai hộp', () => {
  const m = get('drone.10');
  const lg = clone(m.loiGiai);
  lg.chinh = ['ship("RR")', 'walk("RR")', 'ship("RR")'];
  assert.equal(cham(m, lg).thang, false);
});
kiem('lắp ráp: lời giải trùm cũ không thắng nhiệm vụ mới', () => {
  const m = get('rap-du.10');
  assert.equal(cham(m, { chinh: ['jet_back()', 'turn_right()', 'forward(4)'] }).thang, false);
  const lg = clone(m.loiGiai);
  lg.hamCuaMan[0].than = ['pick()', 'arm_left()', 'drop()', 'arm_right()', 'wait()'];
  assert.equal(cham(m, lg).thang, false);
});

// Chạy chính các script HTML trong VM: tránh Node đúng nhưng trình duyệt quên nạp policy.
const html = fs.readFileSync(new URL('./game/choi.html', import.meta.url), 'utf8');
const browser = { console };
browser.window = browser;
const ctx = vm.createContext(browser);
for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  const url = new URL(match[1], new URL('./game/choi.html', import.meta.url));
  vm.runInContext(fs.readFileSync(url, 'utf8'), ctx, { filename: fileURLToPath(url) });
  if (match[1] === '../lo-trinh-hoc.js') break;
}
kiem('HTML và Node dùng cùng 410 màn và cùng ngưỡng sao', () => {
  assert.deepEqual(clone(browser.ManHoc.danhSach), clone(M.danhSach));
  assert.deepEqual(clone(browser.ThuTuChuong), clone(TT));
});
vm.runInContext(fs.readFileSync(new URL('./game/mo-goi.js', import.meta.url), 'utf8'), ctx);
kiem('đi tuần tự toàn bộ lộ trình không gặp khóa phụ thuộc tương lai', () => {
  const sao = {};
  const luu = { saoTot: ma => sao[ma] || 0 };
  for (const m of browser.ManHoc.danhSach) {
    const tt = browser.MoGoi.trangThai(m, luu, false);
    assert.ok(tt.mo, m.ma + ': ' + JSON.stringify(tt));
    sao[m.ma] = 3;
  }
  assert.equal(browser.MoGoi.manTiepTheo(luu, false), null);
});
kiem('hai gói phối hợp nằm sau khi đã học đủ bộ phận, không đẩy ngưỡng sao cũ', () => {
  const doHo = TT.goi.findIndex(g => g.ma === 'doi-ho-bang');
  const doNem = TT.goi.findIndex(g => g.ma === 'doi-gap-nem');
  assert.equal(TT.goi[doHo - 1].ma, 'nhen');
  assert.equal(TT.goi[doNem - 1].ma, 'rap-tay');
  assert.equal(TT.goi[doHo].sao, 195);
  assert.equal(TT.goi[doNem].sao, 480);
  for (const c of ['doi-ho-bang', 'doi-gap-nem']) {
    assert.equal(M.danhSach.filter(m => m.chuong === c).length, 10);
    assert.equal(get(c + '.10').hang, 'trum');
    assert.ok(get(c + '.10').huyHieu);
  }
});
kiem('cảm biến bên và mê cung trước thử thách, không đẩy ngưỡng cũ', () => {
  const ds = browser.MoGoi.dsGoi().filter(g => g.mua === 'mua-1');
  const i = ds.findIndex(g => g.ma === 'cam-bien-ben');
  assert.equal(ds[i].so, 6);
  assert.equal(ds[i].ten, 'Cảm biến hai bên');
  assert.equal(ds[i].man.length, 10);
  assert.equal(ds[i].saoCan, 135);
  assert.equal(ds[i].loai, 'khai-niem');
  assert.equal(ds[i + 1].ma, 'me-cung');
  assert.equal(ds[i + 1].so, 7);
  assert.equal(ds[i + 1].ten, 'Mê cung');
  assert.equal(ds[i + 1].loai, 'khai-niem');
  assert.equal(ds[i + 1].man.length, 10);
  assert.equal(ds[i + 1].saoCan, 135);
  assert.equal(ds[i - 1].ma, 'cam-bien');
  assert.equal(ds[i + 2].ma, 'robot');
  assert.equal(browser.MoGoi.goiTheoMa('robot').saoCan, 135);
  assert.equal(browser.MoGoi.goiTheoMa('rap-du').saoCan, 540);
});

kiem('bản lưu cũ giữ sao theo mã, bỏ nháp lỗi thời, nháp mới đọc lại được', () => {
  const data = new Map();
  data.set('duong-hoc:tien-do', JSON.stringify({ phienBan: 1, sao: { 'khoang-cach.8': 3, 'rap-du.10': 2, 'che-cam-bien.6': 3 } }));
  data.set('duong-hoc:nhap:khoang-cach.7', JSON.stringify({ chinh: ['old()'], hamCuaMan: [] }));
  data.set('duong-hoc:nhap:hai-banh.1', JSON.stringify({ chinh: ['wait()'], hamCuaMan: [] }));
  browser.localStorage = { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k,v) => data.set(k, String(v)), removeItem: k => data.delete(k) };
  vm.runInContext(fs.readFileSync(new URL('./game/luu.js', import.meta.url), 'utf8'), ctx);
  assert.equal(browser.Luu.saoTot('khoang-cach.8'), 3);
  assert.equal(browser.Luu.saoTot('rap-du.10'), 2);
  assert.equal(browser.Luu.saoTot('me-cung.6'), 3);
  assert.equal(browser.ManHoc.timMa('khoang-cach.8').so, 4);
  assert.equal(browser.Luu.docNhap('khoang-cach.7'), null);
  assert.equal(browser.Luu.docNhap('hai-banh.1').chinh[0], 'wait()');
  browser.Luu.ghiNhap('khoang-cach.7', { chinh: ['new()'], hamCuaMan: [] });
  assert.equal(browser.Luu.docNhap('khoang-cach.7').chinh[0], 'new()');
});

console.log('ĐẠT ' + dat + ' kiểm tra lộ trình xuất bản.');
