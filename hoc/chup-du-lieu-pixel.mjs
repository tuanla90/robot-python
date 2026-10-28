/* ============================================================================
   chup-du-lieu-pixel.mjs — V7c1 (28/10), việc c0: CHỤP dữ liệu LOGIC đang sinh từ mã pixel (part/*.js, huy-hieu.js) ra hoc/du-lieu-chup-pixel.json
   TRƯỚC khi tách logic sang chỗ không phụ thuộc pixel (c2) và xoá mã pixel (V7c2). Máy kiểm (kiem-lap-rap, kiem-ve-vector 12, kiem-huy-hieu-phim-vector)
   so kết quả mới với tệp chụp này: phải y hệt.
     ghep     : câu báo lỗi của Part.ghep (null = ghép được) cho MỌI tổ hợp thân × (không tay + tay) × bộ cảm biến (từng cảm biến ở từng ổ + vài cặp,
                đúng danh sách của kiem-ve-vector mục 12b) VÀ 180 tổ hợp của Lắp robot (LapRap.cauHinhCua: 5 thân × 6 tay × 6 não).
     boPhan   : từng bộ phận của part/*.js: loai, ma, ten, hamGoc, gan, oGan (thân), diemNeo / diemNeoDuoi (tay, cảm biến).
     hamGoc   : Part.hamGoc(cfg) cho 180 tổ hợp Lắp robot (hợp lệnh gốc, giữ thứ tự).
     huyHieu  : HuyHieu.DS (Object.keys(HINH) của huy-hieu.js, đúng thứ tự) + biDanh { mã: mã gốc } (HINH[a] = HINH[b]).
     son      : Part.SON, Part.DS_SON, Part.LOP_SON (chụp để lưu; V7c1 bỏ hẳn sơn theo quyết định người giao).
   Chạy: node hoc/chup-du-lieu-pixel.mjs        (ghi đè hoc/du-lieu-chup-pixel.json; ghi commit đang đứng)
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(day, 'game');
const require = createRequire(import.meta.url);
const J = (o) => JSON.stringify(o);

/* --- bộ Part pixel (Node) */
const Part = require(path.join(GAME, 'part', 'part.js'));
for (const f of fs.readdirSync(path.join(GAME, 'part')).filter((f) => /^part-.*\.js$/.test(f)).sort()) require(path.join(GAME, 'part', f));
const LapRap = require(path.join(day, 'lap-rap.js'));

/* --- ghep: mọi tổ hợp */
const O = ['hong', 'truoc', 'hongTrai', 'hongPhai', 'tren', 'bung', 'duoi'];
const boCam = [[]];
for (const cb of Part.ds('cam-bien')) for (const o of O) boCam.push([{ ma: cb.ma, o }]);
boCam.push([{ ma: 'camera', o: 'tren' }, { ma: 'mau', o: 'hong' }], [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'mau', o: 'hong' }], [{ ma: 'camera', o: 'tren' }, { ma: 'hong-ngoai', o: 'tren' }],
  [{ ma: 'khoang-cach', o: 'hong' }, { ma: 'cham', o: 'hong' }, { ma: 'hong-ngoai', o: 'tren' }], [{ ma: 'camera-bay', o: 'bung' }, { ma: 'khoang-cach', o: 'hong' }, { ma: 'mau', o: 'hong' }]);
const ghep = [];
const loiGhep = (cfg) => { try { Part.ghep(cfg); return null; } catch (e) { return e.message; } };
for (const than of Part.ds('than').map((d) => d.ma)) for (const tay of [null, ...Part.ds('tay').map((d) => d.ma)]) for (const camBien of boCam) {
  const cfg = { than, tay, camBien };
  ghep.push({ cfg, loi: loiGhep(cfg) });
}
/* --- 180 tổ hợp Lắp robot (cauHinhCua) + hamGoc */
const TAYS = [null, ...LapRap.DANH_MUC.tay.map((d) => d.ma)], CAMS = [null, ...LapRap.DANH_MUC.camBien.map((d) => d.ma)], THANS = LapRap.DANH_MUC.than.map((d) => d.ma);
const lapRap = [];
for (const th of THANS) for (const ta of TAYS) for (const cb of CAMS) {
  const c = { than: th, tay: ta, camBien: cb }, cfg = LapRap.cauHinhCua(c);
  let hamGoc = null; try { hamGoc = Part.hamGoc(cfg); } catch (e) { hamGoc = 'ném: ' + e.message; }
  lapRap.push({ cach: c, cfg, loi: loiGhep(cfg), hamGoc });
}
/* --- từng bộ phận */
const boPhan = [];
for (const loai of ['than', 'tay', 'cam-bien']) for (const d of Part.ds(loai)) {
  const o = { loai, ma: d.ma, ten: d.ten, hamGoc: d.hamGoc.slice(), gan: d.gan === undefined ? undefined : [].concat(d.gan) };
  if (loai === 'than') o.oGan = d.oGan;
  if (d.diemNeo) o.diemNeo = d.diemNeo;
  if (d.diemNeoDuoi) o.diemNeoDuoi = d.diemNeoDuoi;
  boPhan.push(o);
}

/* --- huy hiệu: HuyHieu.DS trong ngữ cảnh vm (huy-hieu.js chỉ cần BM, Ve.Painter, Part, window lúc nạp; hình vẽ khi gọi) + bí danh đọc từ nguồn */
const hhSrc = fs.readFileSync(path.join(GAME, 'huy-hieu.js'), 'utf8');
const ctx = { window: null, document: { createElement: () => ({ getContext: () => ({}), style: {} }), documentElement: { style: { setProperty() {} } }, body: {} }, console, Object, Array, JSON, Math, Error };
ctx.window = ctx; ctx.globalThis = ctx; ctx.BangMau = require(path.join(GAME, 'bang-mau.js')); ctx.Part = Part; ctx.Ve = { Painter: function () {} };
vm.createContext(ctx);
vm.runInContext(hhSrc, ctx, { filename: 'huy-hieu.js' });
const DS = ctx.HuyHieu.DS.slice();
const biDanh = {};
for (const m of hhSrc.matchAll(/^\s*HINH\['([\w-]+)'\] = HINH\['([\w-]+)'\];/gm)) biDanh[m[1]] = biDanh[m[2]] || m[2];
const hinhRieng = [...hhSrc.matchAll(/^\s*HINH\['([\w-]+)'\] = function/gm)].map((m) => m[1]);
if (hinhRieng.length + Object.keys(biDanh).length !== DS.length || !DS.every((m) => hinhRieng.includes(m) || biDanh[m])) throw new Error('huy-hieu.js: DS (' + DS.length + ') ≠ hình riêng (' + hinhRieng.length + ') + bí danh (' + Object.keys(biDanh).length + ')');

let commit = '?'; try { commit = execFileSync('git', ['-C', day, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch (e) { /* không có git */ }
const ra = {
  ghiChu: 'V7c1 c0: dữ liệu logic chụp từ mã pixel (part/*.js, huy-hieu.js) bằng hoc/chup-du-lieu-pixel.mjs. KHÔNG sửa tay. Máy kiểm so dữ liệu sau khi tách logic với tệp này.',
  commit, ngay: '2026-10-28',
  ghep, lapRap, boPhan, huyHieu: { DS, biDanh, hinhRieng },
  son: { SON: Part.SON, DS_SON: Part.DS_SON, LOP_SON: Part.LOP_SON }
};
fs.writeFileSync(path.join(day, 'du-lieu-chup-pixel.json'), JSON.stringify(ra, null, 1) + '\n');
console.log('đã ghi hoc/du-lieu-chup-pixel.json tại ' + commit + ': ghep ' + ghep.length + ' tổ hợp (' + ghep.filter((g) => g.loi).length + ' cấm), lắp robot ' + lapRap.length + ', bộ phận ' + boPhan.length + ', huy hiệu ' + DS.length + ' (bí danh ' + Object.keys(biDanh).length + ')');
