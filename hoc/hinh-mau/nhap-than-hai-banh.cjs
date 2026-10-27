// Nháp 3 (user 27/10): bánh như cũ, đầu (mũi + kính) như cũ, đuôi bo tròn của bản M1, hoa văn của bản A hoặc M1 (thêm M2 để so).
const path = require('path'), fs = require('fs');
const G = path.join(__dirname, '..', 'game', 'part') + '/';   // chạy: node hoc/hinh-mau/nhap-than-hai-banh.cjs <thư-mục-ra>
const Part = require(G + 'part.js');
['hai-banh', 'kep', 'hong-ngoai'].forEach(x => require(G + 'part-' + x + '.js'));
const C = Part.K, goc = Part.lay('than', 'hai-banh');

function banhCu(p, run) { [2, 19].forEach(x => { p.rect(x, 9, 3, 12, C.ink); p.rect(x + 1, 10, 1, 10, run ? C.denSang : C.den); for (let y = 11; y < 20; y += 4) p.px(x + 1, y, run ? C.vangToi : C.thepToi); }); }
// mép: đầu như cũ (3–5), giữa thẳng, đuôi bo của M1 (18–20)
const MEP = { 3: [8, 15], 4: [7, 16], 5: [6, 17], 18: [6, 17], 19: [7, 16], 20: [9, 14] };
function vo(p) {
  for (let y = 3; y <= 20; y++) { const m = MEP[y] || [5, 18];
    if (y === 3 || y === 20) { p.rect(m[0], y, m[1] - m[0] + 1, 1, C.ink); continue; }
    p.px(m[0], y, C.ink); p.px(m[1], y, C.ink); p.rect(m[0] + 1, y, m[1] - m[0] - 1, 1, C.vang);
    [MEP[y - 1] || [5, 18], MEP[y + 1] || [5, 18]].forEach((k, i) => { if ((i ? y + 1 : y - 1) === (i ? 20 : 3)) return;
      for (let x = m[0]; x < k[0]; x++) p.px(x, y, C.ink); for (let x = k[1] + 1; x <= m[1]; x++) p.px(x, y, C.ink); });
  }
}
function dauCu(p, s) {   // y hệt thân hai bánh hiện tại: dải sáng trên mũi + kính tối, mắt camera khi có
  p.rect(8, 4, 8, 1, C.vangSang); p.rect(7, 6, 10, 5, C.kinh);
  if (s.camera) { Part.veMat(p, 8, 7, 3, 2, s.camSang); Part.veMat(p, 13, 7, 3, 2, s.camSang); p.px(8, 6, C.xanh); p.px(15, 6, C.xanh); }
}
function denDuoi(p) { p.px(7, 18, C.do); p.px(16, 18, C.do); }
const HOA = {
  A: { ten: 'Hoa văn A: hai gân dọc', ve(p) { [8, 15].forEach(x => p.rect(x, 12, 1, 6, C.vangToi)); p.rect(9, 12, 1, 5, C.vangSang); denDuoi(p); } },
  M1: { ten: 'Hoa văn M1: viền trong + chấm giữa', ve(p) { p.rect(7, 12, 1, 6, C.vangToi); p.rect(16, 12, 1, 6, C.vangToi); p.rect(8, 18, 8, 1, C.vangToi); p.rect(8, 12, 1, 5, C.vangSang);
      p.rect(11, 14, 2, 2, C.do); p.px(11, 14, '#ffb3ac'); } },
  M2: { ten: 'Hoa văn M2: khung dọc + dải giữa', ve(p) { p.rect(8, 12, 1, 6, C.vangToi); p.rect(15, 12, 1, 6, C.vangToi); p.rect(8, 12, 8, 1, C.vangToi); p.rect(9, 13, 1, 4, C.vangSang);
      p.rect(11, 13, 2, 5, C.vangToi); p.rect(11, 13, 1, 4, C.vangSang); denDuoi(p); } },
};
Object.keys(HOA).forEach(k => Part.dangKy({ loai: 'than', ma: 'hb-g' + k, ten: 'Thân hai bánh ghép ' + k, hamGoc: goc.hamGoc, oGan: goc.oGan,
  ve(p, s) { banhCu(p, s.banh && (s.banh.trai || s.banh.phai)); vo(p); dauCu(p, s); HOA[k].ve(p); } }));

function svgCua(img, ox, oy, s, out) { for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const c = img.buf[y * img.w + x]; if (c) out.push(`<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" fill="${c}"/>`); } }
const s = 7, W = 40 * s, o = [], cot = [['Hiện tại', 'hai-banh'], ...Object.keys(HOA).map(k => [HOA[k].ten, 'hb-g' + k])];
const rong = 16 + cot.length * (W + 20), cao = 46 + 2 * (W + 30) + 110;
o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${rong}" height="${cao}" shape-rendering="crispEdges" font-family="sans-serif" font-size="14"><rect width="100%" height="100%" fill="#f5f3ff"/>`);
cot.forEach(([t, ma], i) => { const x = 16 + i * (W + 20); let y = 36;
  o.push(`<text x="${x}" y="24" fill="#1e1b4b">${t}</text>`);
  [{ than: ma }, { than: ma, tay: 'kep', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }].forEach(ch => {
    o.push(`<rect x="${x}" y="${y}" width="${W}" height="${W}" fill="#7cb35b"/>`); svgCua(Part.ghep(ch), x, y, s, o); y += W + 30; });
  for (let h = 0; h < 4; h++) { const xx = x + h * 68; o.push(`<rect x="${xx}" y="${y}" width="60" height="60" fill="#7cb35b"/>`); svgCua(Part.ghep({ than: ma, tay: 'kep' }, {}, h), xx - 10, y - 10, 2, o); } });
o.push(`<text x="16" y="${cao - 10}" fill="#64748b">Bánh và đầu giữ như thân hiện tại, đuôi bo tròn của M1 · Hàng 2: gắn tay kẹp + hồng ngoại · Hàng 3: cỡ gần thật, 4 hướng</text></svg>`);
const ra = path.join(process.argv[2], 'hai-banh-ghep.svg'); fs.writeFileSync(ra, o.join('\n')); console.log(ra);
