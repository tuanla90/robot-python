/* ============================================================================
   kiem-game.mjs — máy check cho LỚP MÀN CHƠI (5 màn, 2 khe, ô nhớ, lời thoại).
   Chạy: node robotics/kiem-game.mjs
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const G = require(path.join(day, 'tran-game.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? ' → ' + chiTiet : '')); }
}
const loiCua = (kq) => kq.san.flatMap((s) => s.xong.filter((x) => x.loi).map((x) => x.ten + ':' + x.loi.loai));
const xongLuc = (s) => { for (const f of s.khung) if (f.diem.A >= s.khoi.length) return f.tick; return null; };
const choi = (man, chon, mau) => G.chayMan(man, chon, mau || G.mauChoMan(man, chon));
const MN = (i) => G.MAN[i];

console.log('\n== 1. Năm màn, khe mở dần, đề rõ ràng ==');
{
  kiem('có 5 màn', G.MAN.length === 5, String(G.MAN.length));
  kiem('màn 1–3 mở 1 khe (tay gắp)', G.MAN.slice(0, 3).every((m) => m.khe === 1));
  kiem('màn 4–5 mở 2 khe (thêm bánh xe)', G.MAN.slice(3).every((m) => m.khe === 2));
  kiem('chỉ màn 4 có hạn ô nhớ', MN(3).hanO === 24 && G.MAN.filter((m) => m.hanO).length === 1);
  kiem('màn 3–5 đòi thắng tuyệt đối', G.MAN.slice(2).every((m) => m.yeuCauKhoi === true));
  kiem('không khối nào nằm trên trục giữa',
    G.MAN.every((m) => m.san.every((s) => s.khoi.every((k) => k.x !== G.L.truc))));
  kiem('mọi màn có đối thủ đủ hai robot', G.MAN.every((m) => m.doiThu.R1 && m.doiThu.R2));
  kiem('màn 5 siết đồng hồ (80 tick)', MN(4).dongHo === 80, String(MN(4).dongHo));
}

console.log('\n== 2. Mẫu phải chạy được, không lỗi cú pháp, ở mọi màn × mọi tổ hợp ==');
{
  let soLoi = 0;
  for (const man of G.MAN) {
    for (const tg of ['TAY_DAI', 'CHAN_NHANH']) {
      for (const bx of (man.khe > 1 ? ['OMNI', 'XICH'] : ['OMNI'])) {
        const chon = { tayGap: tg, banhXe: bx };
        const kq = choi(man, chon);
        const loi = loiCua(kq).filter((l) => /syntax-error|indent-error|runtime-error|locked-command/.test(l));
        if (loi.length) { soLoi++; console.log(`       màn ${man.so} ${tg}+${bx} → ${loi.join(' ')}`); }
      }
    }
  }
  kiem('không tổ hợp nào lỗi cú pháp / lệnh bị khoá', soLoi === 0, String(soLoi));
}

console.log('\n== 3. ĐỀ QUYẾT ĐỊNH PHƯƠNG ÁN: đo từng màn ==');
{
  const hang = [];
  for (const man of G.MAN) {
    for (const tg of ['TAY_DAI', 'CHAN_NHANH']) {
      const bx = man.khe > 1 ? 'OMNI' : null;
      const kq = choi(man, { tayGap: tg, banhXe: bx });
      const s = kq.san[0];
      hang.push({ so: man.so, tg, bx, dat: kq.dat, diem: s.diemA, xong: xongLuc(s) });
      console.log(`       màn ${man.so} · ${tg.padEnd(11)} + ${String(bx).padEnd(4)} · điểm ${s.diemA}-${s.diemB} · giao đủ lúc ${xongLuc(s) === null ? '(chưa)' : xongLuc(s)} · ${kq.dat ? 'QUA MÀN' : 'chưa qua'}`);
    }
  }
  const lay = (so, tg) => hang.find((h) => h.so === so && h.tg === tg);
  kiem('màn 1: cả hai phương án đều qua', lay(1, 'TAY_DAI').dat && lay(1, 'CHAN_NHANH').dat);
  kiem('màn 2: cả hai đều qua (đề hai cột)', lay(2, 'TAY_DAI').dat && lay(2, 'CHAN_NHANH').dat);
  kiem('màn 3: tay gắp dài qua, chân nhanh KHÔNG (mù nên trượt nhịp)',
    lay(3, 'TAY_DAI').dat === true && lay(3, 'CHAN_NHANH').dat === false,
    JSON.stringify([lay(3, 'TAY_DAI').diem, lay(3, 'CHAN_NHANH').diem]));
  kiem('màn 4: tay gắp dài + omni qua', lay(4, 'TAY_DAI').dat === true);
  kiem('màn 4: chân nhanh không qua (R2 mù trượt nhịp với 4 khối)', lay(4, 'CHAN_NHANH').dat === false);
}

console.log('\n== 4. Ô NHỚ HẸP: bản copy-paste bị chặn, bản viết hàm qua ==');
{
  const man = MN(3);
  const chon = { tayGap: 'TAY_DAI', banhXe: 'OMNI' };
  const gon = G.mauChoMan(man, chon), dai = G.mauDaiChoMan(man, chon);
  const oGon = G.demO(gon.R1), oDai = G.demO(dai.R1);
  console.log(`       R1 bản gọn: ${oGon} ô · R1 copy-paste: ${oDai} ô · hạn ${man.hanO} ô`);
  kiem('mẫu gọn vừa hạn ô nhớ', oGon <= man.hanO, `${oGon} > ${man.hanO}`);
  kiem('bản copy-paste vượt hạn', oDai > man.hanO, `${oDai} <= ${man.hanO}`);
  kiem('bản copy-paste bị chặn bằng memory-full',
    loiCua(choi(man, chon, dai)).some((l) => /memory-full/.test(l)), loiCua(choi(man, chon, dai)).join(' '));
  kiem('bản gọn chạy được và giao đủ khối', choi(man, chon, gon).dat === true);
}

console.log('\n== 5. KHE BÁNH XE quyết định ở màn nhiều góc ==');
{
  const man = MN(4);
  const omni = choi(man, { tayGap: 'TAY_DAI', banhXe: 'OMNI' });
  const xich = choi(man, { tayGap: 'TAY_DAI', banhXe: 'XICH' });
  console.log(`       omni: ${xongLuc(omni.san[0])} tick · xích: ${xichLuc(xich.san[0])}`);  kiem('omni qua màn (về đích trong 80 tick)', omni.dat === true, JSON.stringify([omni.san[0].diemA, omni.san[0].tick]));
  kiem('xích KHÔNG qua (chậm ở góc cua)', xich.dat === false, JSON.stringify([xich.san[0].diemA, xich.san[0].ketThuc]));
  function xichLuc(s) { const t = xongLuc(s); return t === null ? '(hết giờ, ' + s.diemA + ' khối)' : t + ' tick'; }
}

console.log('\n== 6. Đối thủ chạy được · kết luận trận ==');
{
  for (const man of G.MAN) {
    const kq = G.chayMan(man, { tayGap: 'TAY_DAI', banhXe: 'OMNI' }, { R1: 'wait()', R2: 'wait()' }, { dongHo: 300 });
    kiem(`màn ${man.so}: đối thủ không lỗi`,
      kq.san.every((s) => s.xong.filter((x) => x.ten[0] === 'B').every((x) => !x.loi)),
      kq.san.flatMap((s) => s.xong.filter((x) => x.loi && x.ten[0] === 'B').map((x) => x.ten + ':' + x.loi.loai)).join(' '));
    kiem(`màn ${man.so}: người chơi im lặng thì thua`, kq.thang === 'B', kq.lyDo);
  }
  const thang = choi(MN(0), { tayGap: 'TAY_DAI', banhXe: null });
  kiem('dùng mẫu màn 1 thì THẮNG và qua màn', thang.thang === 'A' && thang.dat === true, thang.lyDo);
  kiem('màn 4 đòi đủ khối nên thắng điểm mà thiếu khối là chưa qua',
    MN(3).yeuCauKhoi === true && choi(MN(3), { tayGap: 'CHAN_NHANH', banhXe: 'OMNI' }).dat === false);
}

console.log('\n== 7. Lời thoại nhân vật ==');
{
  const kqThang = choi(MN(0), { tayGap: 'TAY_DAI', banhXe: null });
  const kqO = choi(MN(3), { tayGap: 'TAY_DAI', banhXe: 'OMNI' }, G.mauDaiChoMan(MN(3), { tayGap: 'TAY_DAI', banhXe: 'OMNI' }));
  const kqThua = G.chayMan(MN(0), { tayGap: 'TAY_DAI', banhXe: null }, { R1: 'wait()', R2: 'wait()' }, { dongHo: 300 });
  kiem('thắng thì Hà Vy nói', G.loiThoai(null, MN(0), kqThang).ai === 'Hà Vy', JSON.stringify(G.loiThoai(null, MN(0), kqThang)));
  kiem('hết ô nhớ thì thầy Khải nói, và nhắc tới hàm',
    G.loiThoai(null, MN(3), kqO).ai === 'thầy Khải' && /hàm/.test(G.loiThoai(null, MN(3), kqO).noi),
    JSON.stringify(G.loiThoai(null, MN(3), kqO)));
  kiem('thua thì Quân nói', G.loiThoai(null, MN(0), kqThua).ai === 'Quân', JSON.stringify(G.loiThoai(null, MN(0), kqThua)));
  const dsTinhHuong = ['mo-man', 'chon-tay-gap', 'chon-chan-nhanh', 'chon-banh', 'thang', 'thang-tuyet-doi',
    'thua', 'hoa', 'thieu-khoi', 'memory-full', 'locked-command', 'syntax-error', 'indent-error',
    'pick-hut', 'het-gio', 'chua-viet-code'];
  kiem('mọi tình huống đều có câu nói của một nhân vật',
    dsTinhHuong.every((t) => { const l = G.loiThoai(t, MN(0), null); return l.ai && l.noi && l.noi.length > 5; }));
  kiem('nhân vật nằm trong bốn người của đội',
    dsTinhHuong.every((t) => ['Khánh', 'thầy Khải', 'Hà Vy', 'Quân'].indexOf(G.loiThoai(t, MN(0), null).ai) >= 0));
}

console.log('\n== 8. Tất định ==');
{
  const a = choi(MN(3), { tayGap: 'TAY_DAI', banhXe: 'OMNI' });
  const b = choi(MN(3), { tayGap: 'TAY_DAI', banhXe: 'OMNI' });
  kiem('chạy hai lần cho cùng kết quả',
    JSON.stringify(a.san.map((s) => [s.diemA, s.diemB, s.tick])) === JSON.stringify(b.san.map((s) => [s.diemA, s.diemB, s.tick])),
    a.lyDo);
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);
