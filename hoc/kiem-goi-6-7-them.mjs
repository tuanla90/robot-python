/* ============================================================================
   kiem-goi-6-7-them.mjs — máy kiểm brief SM1-C (30/10, nghiệm thu độc lập mùa 1, Đề xuất 5 và 7): gói 6 "Tay xoay" và chương me-cung của gói 7.
   A. Chương me-cung: me-cung.1–.3 cất (dạy lại right_clear / elif của chương cam-bien-ben); me-cung.11 trình diễn bám tường mở chương; .12 bám tường trái,
      .13 dừng ở ngõ cụt; trùm .10 viết lại (ba mê cung, bám tường trái + dừng ở ngõ cụt, nhịp theo mê cung dài nhất).
   B. Chương tay-xoay: tay-xoay.11 (go_wall), .12 (for) đệm trước tay-xoay.6 (khóa chương trình chính); tay-xoay.7, .9 cất.
   C. Chương che-tay-xoay: che-tay-xoay.11 (go_wall, đệm ô trước .5), .12 (go_wall + for, đệm nhịp trước .6); trùm .10 viết lại (go_wall + for sort_two); .7, .8 cất.
   Mỗi mục kiểm: thứ tự chương; màn mới / viết lại: lời giải 3 sao đúng sao.o / sao.nhip, không chẩn đoán lỗi, mã mẫu chưa thắng (trừ trình diễn), lời giải khác
   đúng 2 sao, lời sai thua đủ mã; kho hàm đủ trước màn; ràng buộc mùa 1; đường cong (nhịp / ô / dòng ≤ max(1,5 lần, + bù) mọi cặp liền nhau, trừ danh sách
   cặp cũ đã ghi; trùm khó nhất chương theo nhịp và không quá 2 lần màn 9); recall for / while ở gói 6; hàm của màn không trùng hàm cốt truyện.
   Chạy: node hoc/kiem-goi-6-7-them.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-goi-6-7-them.mjs --loi-gia   (cắm bốn lỗi giả: máy phải ĐỎ ở đúng các ca đó)
   ========================================================================== */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { nhipTayXoayNganNhat } = await import('./do-duong-tay-xoay.mjs');
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const clone = (x) => JSON.parse(JSON.stringify(x));
const get = (ma) => M.timMa(ma);
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

if (LOI_GIA) {
  get('me-cung.10').nhipTheo = 'tong';                       // trùm cộng ba sân: ca trùm me-cung đỏ
  get('tay-xoay.12').sao = { o: 21, nhip: 12 };              // ngưỡng nhịp lệch máy chấm: ca lời giải 3 sao đỏ
  get('tay-xoay.11').hamCuaEmCan = ['pick', 'drop'];         // quên khai go_wall: ca kho hàm đỏ
  get('che-tay-xoay.10').loiGiai = { chinh: ['go_wall()', 'sort_two()', 'sort_two()', 'sort_two()'], hamCuaMan: [] };      // trùm mất vòng for: ca recall / lời giải khác đỏ
}

const THU_TU = {
  'me-cung': ['me-cung.11', 'me-cung.4', 'me-cung.5', 'me-cung.6', 'me-cung.7', 'me-cung.8', 'me-cung.9', 'me-cung.12', 'me-cung.13', 'me-cung.10'],
  'tay-xoay': ['tay-xoay.1', 'tay-xoay.2', 'tay-xoay.3', 'tay-xoay.5', 'tay-xoay.4', 'tay-xoay.8', 'tay-xoay.11', 'tay-xoay.12', 'tay-xoay.6', 'tay-xoay.10'],
  'che-tay-xoay': ['che-tay-xoay.1', 'che-tay-xoay.2', 'che-tay-xoay.4', 'che-tay-xoay.9', 'che-tay-xoay.3', 'che-tay-xoay.11', 'che-tay-xoay.5', 'che-tay-xoay.12', 'che-tay-xoay.6', 'che-tay-xoay.10']
};
const CAT = ['me-cung.1', 'me-cung.2', 'me-cung.3', 'tay-xoay.7', 'tay-xoay.9', 'che-tay-xoay.7', 'che-tay-xoay.8'];
const MOI = ['me-cung.11', 'me-cung.12', 'me-cung.13', 'tay-xoay.11', 'tay-xoay.12', 'che-tay-xoay.11', 'che-tay-xoay.12'];
const VIET_LAI = ['me-cung.10', 'che-tay-xoay.10'];
/** Cặp liền nhau vượt luật đường cong có từ trước (màn cũ – màn cũ, không đổi trong gói này): chỉ ghi. */
const CAP_CU = { 'me-cung.7>me-cung.8 nhip': '5 → 17 nhịp (ngõ cụt), có từ trước', 'me-cung.8>me-cung.9 dong': '2 → 9 dòng (sửa hàm của màn), có từ trước',
  'che-tay-xoay.2>che-tay-xoay.4 dong': '7 → 14 dòng: .4 chế hai hàm bảy dòng cùng kiểu .1, .2; có từ trước (.3 → .4 cũng 7 → 14)' };
const BU = { dong: 3, nhip: 4, o: 6 };

/* ------------------------------------------------------------------ kho hàm của em theo thứ tự lộ trình */
const khoTruoc = new Map();
{
  const kho = new Map();
  for (const m of M.danhSach) {
    khoTruoc.set(m.ma, clone([...kho.values()]));
    if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
  }
}
function cham(m, bai, moi) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
  for (const h of moi || []) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: bai.chinh, hamCuaMan: bai.hamCuaMan || [] }, [...hs.values()]);
}
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const chuan = (ds) => ds.map((l) => l.replace(/range\(\d+\)/, 'range(N)')).join('\n');
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }

/* ------------------------------------------------------------------ 1. vị trí, cất, mã mới */
kiem('ba chương đúng thứ tự (10 màn), màn cất ra khỏi lộ trình, mã mới không trùng', () => {
  for (const [c, ds] of Object.entries(THU_TU)) assert.deepEqual(M.danhSach.filter((m) => m.chuong === c).map((m) => m.ma), ds, c);
  for (const ma of CAT) { assert.equal(get(ma), null, ma + ' chưa cất'); assert.ok(M.manCat.includes(ma), ma + ' thiếu trong manCat'); }
  for (const ma of MOI) assert.ok(!M.manCat.includes(ma), ma);
  const ten = new Map();
  for (const m of M.danhSach.filter((x) => (TT.goi.find((g) => g.chuong.includes(x.chuong)) || {}).mua === 'mua-1')) {
    if (MOI.includes(m.ma) || VIET_LAI.includes(m.ma)) assert.ok(!ten.has(m.ten) || ten.get(m.ten) === m.ma, 'tên trùng: ' + m.ten + ' (' + ten.get(m.ten) + ', ' + m.ma + ')');
    ten.set(m.ten, m.ma);
  }
  for (const ma of ['me-cung.10', 'tay-xoay.10', 'che-tay-xoay.10']) assert.ok(get(ma).huyHieu && get(ma).hang === 'trum', ma + ' trùm mang huy hiệu');
});

/* ------------------------------------------------------------------ 2. từng màn mới / viết lại */
for (const ma of MOI.concat(VIET_LAI)) {
  const m = get(ma);
  kiem(ma + ': lời giải 3 sao đúng sao.o / sao.nhip, không chẩn đoán lỗi', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, 'không thắng: ' + (r.chanDoan || []).map((c) => c.ma));
    assert.equal(r.sao, 3, 'sao ' + r.sao + ' (nhịp ' + r.soNhip + ', ô ' + r.soO + ')');
    assert.equal(r.soNhip, m.sao.nhip, 'sao.nhip');
    assert.equal(r.soO, m.sao.o, 'sao.o');
    assert.deepEqual((r.chanDoan || []).filter((c) => c.muc === 'loi').map((c) => c.ma), []);
  });
  kiem(ma + ': mã mẫu ' + (m.chiChay ? 'trình diễn thắng sẵn' : 'chưa thắng') + '; lời giải khác đúng 2 sao; lời sai thua đủ mã', () => {
    const r = cham(m, m.maMau, []);
    assert.equal(r.thang, !!m.chiChay, 'mã mẫu');
    if (m.loiGiaiKhac) {
      const k = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
      assert.ok(k.thang, 'lời giải khác không thắng');
      if (ma !== 'tay-xoay.6') assert.equal(k.sao, 2, 'lời giải khác ' + k.sao + ' sao (' + m.loiGiaiKhac.moTa + ')');
    }
    if (!m.chiChay) assert.ok(m.loiSai.length >= 1, 'chưa có lời sai');
    for (const ls of m.loiSai) {
      const s = cham(m, ls.baiLam, ls.hamCuaEmMoi);
      assert.ok(!s.thang, 'lời sai thắng: ' + ls.moTa);
      const co = (s.chanDoan || []).map((c) => c.ma);
      for (const p of ls.phaiCoMa) assert.ok(co.includes(p), ls.moTa + ': thiếu ' + p + ' (có ' + co + ')');
    }
  });
  kiem(ma + ': hàm của em cần có trong kho trước màn; ràng buộc mùa 1; hàm của màn không trùng hàm cốt truyện', () => {
    const kho = new Set(khoTruoc.get(ma).map((h) => h.ten));
    for (const t of m.hamCuaEmCan) assert.ok(kho.has(t), 'kho thiếu ' + t);
    const dong = [...m.loiGiai.chinh, ...(m.loiGiai.hamCuaEmMoi || []).flatMap((h) => h.than)];
    for (const t of loiGoi(dong)) if (kho.has(t)) assert.ok(m.hamCuaEmCan.includes(t) || (m.loiGiai.hamCuaEmMoi || []).some((h) => h.ten === t), 'gọi ' + t + ' mà hamCuaEmCan không khai');
    assert.ok(!dong.some((l) => /^\s*[A-Za-z_]\w*\s*[-+*/]?=(?!=)/.test(l)), 'có biến');
    assert.ok(!(m.loiGiai.hamCuaEmMoi || []).concat(m.loiGiai.hamCuaMan || []).some((h) => (h.thamSo || []).length), 'hàm có tham số');
    if (m.chuong !== 'me-cung') assert.ok(!['left_clear', 'right_clear'].some((t) => (m.hamGoc || []).includes(t) || loiGoi(dong).has(t)), 'gói 6 có cảm biến bên');
    const cot = new Set(M.hamCotTruyen ? M.hamCotTruyen() : []);
    for (const h of m.loiGiai.hamCuaMan || []) assert.ok(!cot.has(h.ten), 'hàm của màn ' + h.ten + '() trùng hàm cốt truyện');
    for (const h of m.loiGiai.hamCuaEmMoi || []) assert.ok((m.taoHam || []).includes(h.ten), 'hàm mới ' + h.ten + '() không nằm trong taoHam');
  });
}

/* ------------------------------------------------------------------ 3. đường cong + trùm */
for (const [c, ds] of Object.entries(THU_TU)) {
  kiem(c + ': đường cong nhịp / ô / dòng (mọi cặp liền nhau, trừ trùm và cặp cũ đã ghi)', () => {
    const ghi = [];
    for (let i = 1; i < ds.length - 1; i++) {
      let truoc = get(ds[i - 1]);
      if (truoc.chiChay) { if (i < 2) continue; truoc = get(ds[i - 2]); }       // sau màn trình diễn: so với màn trước nó
      const sau = get(ds[i]);
      const so = { nhip: [truoc.sao.nhip, sau.sao.nhip], o: [truoc.sao.o, sau.sao.o], dong: [soDong(truoc), soDong(sau)] };
      for (const k of ['nhip', 'o', 'dong']) {
        const [a, b] = so[k];
        if (b <= Math.max(1.5 * a, a + BU[k])) continue;
        const khoa = truoc.ma + '>' + sau.ma + ' ' + k;
        if (CAP_CU[khoa]) { ghi.push(khoa); continue; }
        assert.fail(khoa + ': ' + a + ' → ' + b);
      }
    }
    if (ghi.length) console.log('  (ghi) ' + c + ': ' + ghi.map((k) => k + ' (' + CAP_CU[k] + ')').join('; '));
  });
  kiem(c + ': trùm khó nhất chương theo nhịp, không quá 2 lần màn 9 (nhịp và ô)', () => {
    const trum = get(ds[9]), m9 = get(ds[8]);
    for (const ma of ds.slice(0, 9)) assert.ok(trum.sao.nhip > get(ma).sao.nhip, 'trùm ' + trum.sao.nhip + ' nhịp ≤ ' + ma + ' ' + get(ma).sao.nhip);
    assert.ok(trum.sao.nhip <= 2 * m9.sao.nhip, 'nhịp ' + trum.sao.nhip + ' > 2 × ' + m9.sao.nhip);
    assert.ok(trum.sao.o <= 2 * m9.sao.o, 'ô ' + trum.sao.o + ' > 2 × ' + m9.sao.o);
  });
}

/* ------------------------------------------------------------------ 4. riêng chương me-cung */
kiem('me-cung: đầu chương không tụt sâu sau trùm chương cam-bien-ben (≥ 2/3 nhịp), là màn trình diễn bám tường', () => {
  const dau = get('me-cung.11'), trum1 = M.danhSach.filter((m) => m.chuong === 'cam-bien-ben').pop();
  assert.ok(dau.chiChay && dau.chinhCoDinh && dau.so === 1);
  assert.ok(dau.sao.nhip * 3 >= trum1.sao.nhip * 2, dau.sao.nhip + ' so với ' + trum1.ma + ' ' + trum1.sao.nhip);
  // không màn nào của chương chỉ dạy một câu hỏi right_clear (lời giải không vòng lặp, không hàm) như ba màn đã cất
  for (const ma of THU_TU['me-cung']) { const m = get(ma); assert.ok(m.loiGiai.chinh.some((l) => /^for |^while /.test(l)) || m.chinhCoDinh || ma === 'me-cung.5', ma + ' không có vòng lặp'); }
});
kiem('me-cung: bốn màn cuối có lời giải khác nhau từng đôi; lời giải trùm không trùng màn nào khác của chương', () => {
  const cuoi = THU_TU['me-cung'].slice(6).map((ma) => chuan(get(ma).loiGiai.chinh));
  assert.equal(new Set(cuoi).size, cuoi.length);
  const trum = chuan(get('me-cung.10').loiGiai.chinh);
  for (const ma of THU_TU['me-cung'].slice(0, 9)) assert.notEqual(chuan(get(ma).loiGiai.chinh), trum, ma);
});
kiem('me-cung.10: ba mê cung, nhịp theo mê cung dài nhất (không cộng), ba mê cung dài khác nhau, follow_right() / bám phải dừng / bám trái không dừng đều thua', () => {
  const m = get('me-cung.10');
  assert.equal(dsSan(m).length, 3);
  assert.notEqual(m.nhipTheo, 'tong');
  const r = cham(m, m.loiGiai, []);
  const nh = r.theoSan.map((s) => s.soNhip);
  assert.equal(Math.max(...nh), m.sao.nhip, 'nhịp ' + nh);
  assert.equal(new Set(nh).size, 3, 'hai mê cung cùng số nhịp: ' + nh);
  for (const ls of m.loiSai) assert.ok(r.thang && !cham(m, ls.baiLam, []).thang, ls.moTa);
});
kiem('me-cung.12, .13: điều mới đúng một (bám trái ở .12, dừng ở ngõ cụt ở .13); trùm gộp cả hai', () => {
  const l12 = get('me-cung.12').loiGiai.chinh.join('\n'), l13 = get('me-cung.13').loiGiai.chinh.join('\n'), l10 = get('me-cung.10').loiGiai.chinh.join('\n');
  assert.ok(/if left_clear/.test(l12) && /else:/.test(l12), '.12 bám trái có else');
  assert.ok(/if right_clear/.test(l13) && !/else:/.test(l13) && /elif left_clear/.test(l13), '.13 bám phải, nhánh cuối elif');
  assert.ok(/if left_clear/.test(l10) && !/else:/.test(l10) && /elif right_clear/.test(l10), 'trùm bám trái, nhánh cuối elif');
});

/* ------------------------------------------------------------------ 5. riêng gói 6 */
kiem('tay-xoay.6 (sau tay-xoay.12 vòng for): bản vòng for không chế clear_left() không thắng (máy chấm đòi tạo hàm)', () => {
  const m = get('tay-xoay.6');
  assert.deepEqual(m.taoHam, ['clear_left']);
  const vong = { chinh: ['for i in range(2):', '    pick()', '    arm_left()', '    drop()', '    arm_right()', '    wait()', '    move()', '    move()', 'move()'] };
  const r = cham(m, vong, []);
  assert.ok(!r.thang && r.chanDoan.some((c) => c.ma === 'chua-tao-ham'), 'bản vòng for: ' + r.sao + ' sao');
  assert.ok(cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi).sao === 3);
});
kiem('gói 6 dùng lại for / while (gói 2, 3) ở ít nhất 3 màn, trong đó có trùm chương 2', () => {
  const ds = THU_TU['tay-xoay'].concat(THU_TU['che-tay-xoay']).filter((ma) => {
    const l = get(ma).loiGiai.chinh;
    return l.some((d) => /^\s*(for|while) /.test(d)) || loiGoi(l).has('go_wall');
  });
  console.log('  (ghi) màn gói 6 dùng for / while / go_wall: ' + ds.join(', '));
  assert.ok(ds.length >= 3, ds.join(', '));
  const t = get('che-tay-xoay.10').loiGiai.chinh;
  assert.ok(t.some((d) => /^for /.test(d)) && loiGoi(t).has('go_wall') && loiGoi(t).has('sort_two'), 'trùm che-tay-xoay.10: go_wall + for + sort_two');
});
kiem('tay-xoay.12, che-tay-xoay.12: viết thẳng không vòng for thì quá 10 ô hoặc thiếu sao', () => {
  const m = get('tay-xoay.12');
  const s = m.loiSai.find((ls) => /Viết thẳng/.test(ls.moTa));
  assert.ok(s && cham(m, s.baiLam, []).chanDoan.some((c) => c.ma === 'tran-khung'));
  const c = get('che-tay-xoay.12');
  const thang = { chinh: ['go_wall()', 'pick()', 'drop_left()', 'move()', 'pick()', 'drop_left()', 'move()', 'pick()', 'drop_left()', 'move()'] };
  const r = cham(c, thang, []);
  assert.ok(!r.thang || r.sao < 3, 'viết thẳng ' + r.sao + ' sao');
});

console.log('\n---------------------------------------------');
kiem('bộ dò BFS tay xoay (do-duong-tay-xoay.mjs): bốn màn mới gói 6 có đường lệnh gốc, ngắn nhất không chậm hơn ngưỡng sao.nhip', () => {
  for (const ma of ['tay-xoay.11', 'tay-xoay.12', 'che-tay-xoay.11', 'che-tay-xoay.12']) {
    const r = nhipTayXoayNganNhat(get(ma), { toiDaTrangThai: 2000000 });
    assert.ok(r.nhip !== null, ma + ': bộ dò không tìm được đường');
    assert.ok(r.nhip <= get(ma).sao.nhip, ma + ': ' + r.nhip + ' > ' + get(ma).sao.nhip);
    console.log('  (ghi) ' + ma + ': đường lệnh gốc ngắn nhất ' + r.nhip + ' nhịp, ngưỡng ' + get(ma).sao.nhip);
  }
});

console.log((hong ? 'HỎNG' : 'ĐẠT') + ' ' + dat + ' · HỎNG ' + hong + ' kiểm tra brief SM1-C (gói 6 Tay xoay, chương Mê cung gói 7).');
if (hong) process.exitCode = 1;
