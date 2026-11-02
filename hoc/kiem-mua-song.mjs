/* ============================================================================
   kiem-mua-song.mjs — máy kiểm LÕI BẾN SÔNG (mùa 5, hoc/KE-HOACH-MUA-CANG-SONG.md mục 2; luật ở san-hoc.js phần BẾN SÔNG). Chưa có màn: mọi sân dựng tạm trong máy kiểm.
   Mỗi luật ít nhất một ca đạt + một ca sai:
     1. Ký hiệu sân ~ Q q B L K k V, lớp cfg.dong, lỗi cấu hình tiếng Việt.
     2. Xuồng (luật xe hai bánh): đi trên nước; bờ / cống đóng / vật nổi / robot chặn (dam-tuong vat 'bo' | 'cong' | 'vat'); Q là cờ (toi-co); xe cạn đâm nước ('nuoc'); drone bay qua.
     3. Dòng chảy: xuôi 1 + suc, ngược suc 1 đứng im, suc 2 lùi 1, ngang trôi chéo; từng ô, chặn thì dừng ('troi' / 'troi-chan'); chỉ xét ô sau khi chạy; vật nổi trôi trước xuồng.
     4. Neo: anchor / unanchor ở nhịp wait(); đang neo dòng không đẩy ('neo-giu'), bánh bị bỏ ('dang-neo'); da-neo / chua-neo.
     5. Dây phao: tow kéo vật về ô trước mũi (TAM_KEO 3), hụt (bờ, cống, hết tầm), dang-keo; vật ở mũi chiếm ô: tiến vật đi trước / mui-vuong, quay chuyển ô / mui-vuong, lùi vật theo; drop_tow; dòng đẩy cả cụm; vật kéo không tự trôi.
     6. Buộc đuôi: tether chuyển ra sau đuôi / duoi-vuong / móc vật sau đuôi / buoc-hut; nối đuôi như toa tàu qua khúc cua; lùi vào vật: duoi-vuong; quay vật đứng yên; untether.
     7. Chong chóng: flow_dir() theo mũi front / back / left / right / none; flow() tuple, gỡ cặp h, s = flow(); đọc ô trước mũi, không tốn nhịp.
     8. Cống + van: tow trúng V → van-doi, dòng tắt NGAY (dong-doi), cống đổi CUỐI nhịp (cong-doi), cong-ket; cfg.noi nhóm riêng; lỗi noi.
     9. Vật nổi / cầu phao / mục tiêu: xe cạn lên bè trên nước êm, không lên khi dòng chạy; tow vật có xe → keo-hut 'co-xe'; vật có xe không trôi; dua-vat thắng khi mọi vật nổi trên q.
    10. Vết nhịp / kết quả: robot.neo, robot.keo, mucVet.vat / cong / van / dongTat; kết quả cong / van / dongTat / congBanDau / vanBanDau; màn cũ không đổi (xe bánh thường).
   Chạy: node hoc/kiem-mua-song.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet) {
  if (ok) { dat++; console.log('  ok   ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet !== undefined ? ' → ' + chiTiet : '')); }
}
const J = (o) => JSON.stringify(o);
const sks = (r) => r.vet.filter((e) => e.loai === 'nhip').flatMap((e) => e.suKien);
const co = (r, ma) => sks(r).some((e) => e.ma === ma);
const dem = (r, ma) => sks(r).filter((e) => e.ma === ma).length;
const sk1 = (r, ma) => sks(r).find((e) => e.ma === ma) || null;
const docs = (r) => r.vet.filter((e) => e.loai === 'lenh' && e.docCamBien).map((e) => e.docCamBien);
const nhipVet = (r) => r.vet.filter((e) => e.loai === 'nhip');
const vi = (r) => r.robot.x + ',' + r.robot.y + ',' + r.robot.huong;
const vatO = (r, id) => { const v = r.vat.find((q) => q.id === id); return v ? v.x + ',' + v.y : null; };
const loiCfg = (cfg, code) => { try { SanHoc.chay(cfg, code || 'wait()\n'); return ''; } catch (e) { return e.message; } };

const XUONG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'anchor', 'unanchor', 'cast_net', 'drop_net', 'set_length', 'flow_dir', 'flow'];
const XE = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'front_clear'];
const TIEN = 'left_move()\nright_move()\nwait()\n', LUI = 'left_back()\nright_back()\nwait()\n', PHAI = 'left_move()\nwait()\n', TRAI = 'right_move()\nwait()\n', CHO = 'wait()\n';
const lap = (s, n) => s.repeat(n);
//        x: 0123456
const SAN1 = ['#######',
              '#~~~~Q#',    // y1
              '#~#~~~#',    // y2: (2,2) là bờ giữa nước
              '#~~~~~#',    // y3
              '#.....#',    // y4: bờ
              '#######'];
const xuong = (them) => Object.assign({ loaiRobot: 'xuong', hamGoc: XUONG, camBien: [{ ma: 'dong-chay' }], chinhLuoi: true, san: SAN1, batDau: { x: 1, y: 3, huong: 1 }, nhipToiDa: 60 }, them || {});
const chay = (cfg, code) => SanHoc.chay(cfg, code);

console.log('\n== 1. Ký hiệu sân và cấu hình ==');
{
  const s = SanHoc.docSan(['~QqBLKkV.']);
  kiem('docSan đọc đủ ký hiệu mới: cờ Q, đích q, vật nổi B / L, cống K / k, van V, mặt nước', s.co && s.co.x === 1 && s.dich.length === 1 && s.dich[0].x === 2 && J(s.vatNoi) === J([{ x: 3, y: 0, noi: 'be' }, { x: 4, y: 0, noi: 'luc-binh' }]) &&
    J(s.congNuoc) === J([{ x: 5, y: 0, mo: false }, { x: 6, y: 0, mo: true }]) && J(s.van) === J([{ x: 7, y: 0 }]) && [0, 1, 2, 3, 4, 5, 6].every((x) => s.nuoc[x + ',0']) && !s.nuoc['7,0'] && !s.nuoc['8,0'],
    J(s));
  kiem('ký hiệu lạ vẫn báo lỗi', loiCfg({ san: ['?.'], batDau: { x: 1, y: 0 } }).includes('Ký hiệu lạ'));
  kiem('xuồng xuất phát trên bờ: lỗi cấu hình nói rõ', /mặt nước/.test(loiCfg(xuong({ batDau: { x: 1, y: 4, huong: 1 } }))));
  kiem('xe cạn xuất phát trên nước: lỗi cấu hình', /không xuất phát trên mặt nước/.test(loiCfg({ loaiRobot: 'banh', hamGoc: XE, san: SAN1, batDau: { x: 1, y: 3, huong: 1 } })));
  kiem('xuồng xuất phát trong cống đóng / trên vật nổi: lỗi', /cống/.test(loiCfg(xuong({ san: ['#K~#'], batDau: { x: 1, y: 0, huong: 1 } }))) && /vật nổi/.test(loiCfg(xuong({ san: ['#B~#'], batDau: { x: 1, y: 0, huong: 1 } }))));
  kiem('xuồng không gắn tay kẹp', /tay lưới/.test(loiCfg(xuong({ hamGoc: XUONG.concat(['grab']) }))));
  kiem('xe bánh không có anchor / cast_net / flow_dir', /không thuộc loại robot banh/.test(loiCfg({ loaiRobot: 'banh', hamGoc: XE.concat(['cast_net']), san: SAN1, batDau: { x: 1, y: 4, huong: 1 } })));
  kiem('flow_dir() cần camBien dong-chay', /chong chóng/.test(loiCfg(xuong({ camBien: [] }))) && loiCfg(xuong()) === '');
  kiem('cast_net đi cùng drop_net, anchor đi cùng unanchor', /drop_net/.test(loiCfg(xuong({ hamGoc: ['left_move', 'right_move', 'wait', 'cast_net'] }))) && /unanchor/.test(loiCfg(xuong({ hamGoc: ['left_move', 'right_move', 'wait', 'anchor'] }))));
  kiem('cfg.dong: ô phải là nước, huong 0–3, suc 1 hay 2, không khai hai lần',
    /mặt nước/.test(loiCfg(xuong({ dong: [{ x: 2, y: 4, huong: 1, suc: 1 }] }))) && /huong/.test(loiCfg(xuong({ dong: [{ x: 2, y: 3, huong: 4, suc: 1 }] }))) &&
    /suc/.test(loiCfg(xuong({ dong: [{ x: 2, y: 3, huong: 1, suc: 3 }] }))) && /hai lần/.test(loiCfg(xuong({ dong: [{ x: 2, y: 3, huong: 1, suc: 1 }, { x: 2, y: 3, huong: 1, suc: 1 }] }))) &&
    loiCfg(xuong({ dong: [{ x: 2, y: 3, huong: 1, suc: 2 }] })) === '');
  kiem('màn nhiều sân: lopMauCuaSan lấy dong theo sân', J(SanHoc.lopMauCuaSan({ san: [SAN1, SAN1], dong: [[{ x: 1, y: 1 }], [{ x: 2, y: 2 }]] }, 1).dong) === J([{ x: 2, y: 2 }]));
}

console.log('\n== 2. Xuồng: luật xe hai bánh trên mặt nước ==');
{
  let r = chay(xuong(), lap(TIEN, 4));
  kiem('xuồng tiến 4 ô trên nước: (1,3) → (5,3), không sự kiện chặn', vi(r) === '5,3,1' && !co(r, 'dam-tuong'), vi(r));
  r = chay(xuong({ batDau: { x: 1, y: 2, huong: 1 } }), TIEN);
  kiem('tiến vào ô bờ (#): dam-tuong vat "bo", đứng yên', vi(r) === '1,2,1' && sk1(r, 'dam-tuong') && sk1(r, 'dam-tuong').vat === 'bo', J(sk1(r, 'dam-tuong')));
  r = chay(xuong({ batDau: { x: 1, y: 3, huong: 2 } }), TIEN);
  kiem('tiến vào bờ sàn "." cũng là "bo" (mọi ô không phải nước)', sk1(r, 'dam-tuong') && sk1(r, 'dam-tuong').vat === 'bo');
  r = chay(xuong(), lap(TIEN, 4) + TRAI + lap(TIEN, 2));
  kiem('quay trái rồi tiến 2 tới phao đích Q: thắng toi-co', r.thang && vi(r) === '5,1,0' && co(r, 'toi-co'), vi(r));
  r = chay(xuong({ san: ['#######', '#~~K~Q#', '#######'], batDau: { x: 1, y: 1, huong: 1 } }), lap(TIEN, 2));
  kiem('cống đóng K chặn xuồng: dam-tuong vat "cong"', vi(r) === '2,1,1' && sk1(r, 'dam-tuong').vat === 'cong', J(sk1(r, 'dam-tuong')));
  r = chay(xuong({ san: ['#######', '#~~k~Q#', '#######'], batDau: { x: 1, y: 1, huong: 1 } }), lap(TIEN, 4));
  kiem('cống mở k như nước: đi qua, tới Q', r.thang && vi(r) === '5,1,1');
  r = chay(xuong({ san: ['#######', '#~~B~Q#', '#######'], batDau: { x: 1, y: 1, huong: 1 } }), lap(TIEN, 2));
  kiem('vật nổi B chiếm ô: xuồng đâm vat "vat" kèm idVat', vi(r) === '2,1,1' && sk1(r, 'dam-tuong').vat === 'vat' && sk1(r, 'dam-tuong').idVat === 1);
  r = chay(xuong(), LUI);
  kiem('lùi vào bờ (mép trái là #): bo', sk1(r, 'dam-tuong') && sk1(r, 'dam-tuong').vat === 'bo' && sk1(r, 'dam-tuong').kieu === 'lui');
  r = chay(xuong({ daoChieu: ['trai'] }), TIEN);
  kiem('đấu dây ngược dùng lại được trên xuồng: left_move + right_move với bánh trái đảo = (-1, +1) = quay đầu', vi(r) === '1,3,3' && co(r, 'quay-dau'), vi(r));
  r = chay({ loaiRobot: 'banh', hamGoc: XE, san: SAN1, batDau: { x: 1, y: 4, huong: 0 } }, TIEN);
  kiem('xe cạn tiến vào nước: dam-tuong vat "nuoc", không chìm', vi(r) === '1,4,0' && sk1(r, 'dam-tuong').vat === 'nuoc');
  r = chay({ loaiRobot: 'banh', hamGoc: XE, san: SAN1, batDau: { x: 1, y: 4, huong: 0 } }, 'x = front_clear()\nif not x:\n    wait()');
  kiem('front_clear() thấy nước là không trống (vat nuoc)', docs(r)[0].trong === false && docs(r)[0].vat === 'nuoc' && r.nhip === 1);
  r = chay({ loaiRobot: 'nhen', san: SAN1, batDau: { x: 1, y: 4 } }, 'go_up()');
  kiem('nhện cũng không xuống nước', sk1(r, 'dam-tuong') && sk1(r, 'dam-tuong').vat === 'nuoc');
  r = chay({ loaiRobot: 'drone', san: SAN1, batDau: { x: 1, y: 4 } }, 'go_up()\ngo_up()\ngo_up()');
  kiem('drone bay qua nước', vi(r) === '1,1,0' && !co(r, 'dam-tuong'));
  r = chay({ loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'land', 'take_off'], san: SAN1, batDau: { x: 1, y: 4 } }, 'go_up()\nland()');
  kiem('drone không đáp xuống mặt nước (dap-bi-chan vat nuoc)', sk1(r, 'dap-bi-chan') && sk1(r, 'dap-bi-chan').vat === 'nuoc');
  r = chay(xuong({ san: ['#######', '#~~V~~#', '#######'], batDau: { x: 1, y: 1, huong: 1 } }), lap(TIEN, 2));
  kiem('xuồng đâm van V: "bo" (van ở trên bờ)', sk1(r, 'dam-tuong').vat === 'bo');
  r = chay({ loaiRobot: 'banh', hamGoc: XE, san: ['#####', '#.V.#', '#####'], batDau: { x: 1, y: 1, huong: 1 } }, TIEN);
  kiem('xe cạn đâm van V: vat "van" (chiếm ô như nút)', sk1(r, 'dam-tuong').vat === 'van');
}

console.log('\n== 3. Dòng chảy (cfg.dong) ==');
{
  //        x: 0123456
  const SAN3 = ['#######', '#~~~~~#', '#~~~~~#', '#~~~~~#', '#######'];
  const dongPhai = (suc) => [1, 2, 3, 4, 5].map((x) => ({ x, y: 2, huong: 1, suc }));
  const x3 = (them) => xuong(Object.assign({ san: SAN3, batDau: { x: 1, y: 2, huong: 1 } }, them));
  let r = chay(x3({ dong: dongPhai(1) }), TIEN);
  kiem('xuôi dòng sức 1: tiến 1 + trôi 1 = 2 ô, sự kiện troi { ai robot, soO 1 }', vi(r) === '3,2,1' && sk1(r, 'troi') && sk1(r, 'troi').ai === 'robot' && sk1(r, 'troi').soO === 1 && sk1(r, 'troi').huong === 1, vi(r) + ' ' + J(sk1(r, 'troi')));
  r = chay(x3({ dong: dongPhai(2) }), TIEN);
  kiem('xuôi dòng xiết sức 2: 1 + 2 = 3 ô', vi(r) === '4,2,1' && sk1(r, 'troi').soO === 2, vi(r));
  r = chay(x3({ dong: dongPhai(1), batDau: { x: 4, y: 2, huong: 3 } }), TIEN);
  kiem('ngược dòng sức 1: tiến 1 rồi bị đẩy lùi 1 = đứng im', vi(r) === '4,2,3' && co(r, 'troi'), vi(r));
  r = chay(x3({ dong: dongPhai(2), batDau: { x: 4, y: 2, huong: 3 } }), TIEN);
  kiem('ngược dòng sức 2: lùi 1 ô mỗi nhịp', vi(r) === '5,2,3', vi(r));
  r = chay(x3({ dong: dongPhai(1), batDau: { x: 2, y: 3, huong: 0 } }), TIEN);
  kiem('đi ngang dòng: lên 1 rồi trôi phải 1 = chéo', vi(r) === '3,2,0', vi(r));
  r = chay(x3({ dong: dongPhai(1), batDau: { x: 2, y: 3, huong: 0 } }), TIEN + CHO + CHO);
  kiem('wait() đứng trên dòng cũng trôi mỗi nhịp (nước chảy liên tục, khác băng chuyền 2 nhịp)', vi(r) === '5,2,0' && dem(r, 'troi') === 3, vi(r));
  r = chay(x3({ dong: dongPhai(2), batDau: { x: 4, y: 2, huong: 1 } }), CHO);
  kiem('đẩy từng ô: ô kế là bờ thì dừng ở ô cuối đi được (soO 1, chan bo)', vi(r) === '5,2,1' && sk1(r, 'troi').soO === 1 && sk1(r, 'troi').chan === 'bo', J(sk1(r, 'troi')));
  r = chay(x3({ dong: dongPhai(1), batDau: { x: 5, y: 2, huong: 1 } }), CHO);
  kiem('bị chặn ngay: troi-chan { vat bo }, không có troi', !co(r, 'troi') && sk1(r, 'troi-chan') && sk1(r, 'troi-chan').vat === 'bo');
  r = chay(x3({ dong: [{ x: 2, y: 2, huong: 1, suc: 1 }, { x: 3, y: 2, huong: 2, suc: 2 }] }), TIEN);
  kiem('chỉ xét ô đứng sau khi chạy: trôi từ (2,2) sang (3,2) rồi KHÔNG xét dòng của (3,2) trong cùng nhịp', vi(r) === '3,2,1', vi(r));
  r = chay(x3({ san: ['#######', '#~~~~~#', '#~~B~~#', '#~~~~~#', '#######'], dong: dongPhai(1) }), TIEN);
  kiem('vật nổi tự do trôi trước (theo id), xuồng trôi sau nên theo kịp: bè (3,2) → (4,2), xuồng (1,2) → (3,2)', vatO(r, 1) === '4,2' && vi(r) === '3,2,1' && sks(r).findIndex((e) => e.ma === 'troi' && e.ai === 'vat') < sks(r).findIndex((e) => e.ma === 'troi' && e.ai === 'robot'), vatO(r, 1) + ' ' + vi(r));
  r = chay(x3({ san: ['#######', '#~~~~~#', '#~~~~B#', '#~~~~~#', '#######'], dong: dongPhai(1), batDau: { x: 3, y: 2, huong: 1 } }), CHO);
  kiem('bè sát bờ không trôi (troi-chan ai vat); xuồng trôi tới sát bè rồi bị bè chặn', sk1(r, 'troi-chan') && sk1(r, 'troi-chan').ai === 'vat' && vi(r) === '4,2,1', vi(r));
  r = chay(x3({ dong: dongPhai(1), batDau: { x: 1, y: 1, huong: 1 } }), TIEN);
  kiem('không đứng trên ô dòng thì không trôi', vi(r) === '2,1,1' && !co(r, 'troi'));
  r = chay(Object.assign(x3({ dong: dongPhai(1) }), { loaiRobot: 'drone', hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'], camBien: [] }), 'wait()');
  kiem('drone lơ lửng trên dòng không trôi', r.robot.x === 1 && r.robot.y === 2 && !co(r, 'troi'));
}

console.log('\n== 4. Neo ==');
{
  const SAN3 = ['#######', '#~~~~~#', '#~~~~~#', '#~~~~~#', '#######'];
  const dongPhai = [1, 2, 3, 4, 5].map((x) => ({ x, y: 2, huong: 1, suc: 2 }));
  const x4 = (them) => xuong(Object.assign({ san: SAN3, batDau: { x: 2, y: 2, huong: 3 }, dong: dongPhai }, them));
  let r = chay(x4(), 'anchor()\nwait()\nwait()');
  kiem('anchor() làm ở nhịp wait() kế: tha-neo, dòng không đẩy (neo-giu), xuồng đứng yên 2 nhịp', vi(r) === '2,2,3' && co(r, 'tha-neo') && dem(r, 'neo-giu') === 2 && !co(r, 'troi') && nhipVet(r)[0].robot.neo === true, vi(r) + ' ' + J(sks(r).map((e) => e.ma)));
  r = chay(x4(), 'anchor()\nwait()\nleft_move()\nright_move()\nwait()');
  kiem('đang neo mà ra lệnh bánh: dang-neo (lỗi, trỏ lệnh bánh), xuồng không đi, mất nhịp', vi(r) === '2,2,3' && sk1(r, 'dang-neo') && sk1(r, 'dang-neo').lenh.ten === 'left_move' && r.suKien.some((e) => e.ma === 'dang-neo') && r.nhip === 2, J(sk1(r, 'dang-neo')));
  r = chay(x4(), 'anchor()\nwait()\nunanchor()\nwait()');
  kiem('unanchor() ở nhịp wait(): nho-neo, nhịp đó đã trôi lại (sức 2 → lùi 2)', co(r, 'nho-neo') && vi(r) === '4,2,3' && nhipVet(r)[1].robot.neo === false, vi(r));
  r = chay(x4(), 'anchor()\nwait()\nanchor()\nwait()\nunanchor()\nunanchor()\nwait()');
  kiem('anchor() khi đã neo: da-neo (thông tin); unanchor() hai lần một nhịp: neo-goi-lai', co(r, 'da-neo') && r.suKien.some((e) => e.ma === 'neo-goi-lai'));
  r = chay(x4(), 'unanchor()\nwait()');
  kiem('unanchor() khi chưa neo: chua-neo', co(r, 'chua-neo'));
  r = chay(x4({ dong: null }), 'wait()');
  kiem('không neo, không dòng: xuồng đứng yên bình thường, robot.neo false', vi(r) === '2,2,3' && nhipVet(r)[0].robot.neo === false);
  kiem('LENH_NGUOC có cặp anchor ↔ unanchor, cast_net ↔ drop_net', SanHoc.LENH_NGUOC.anchor === 'unanchor' && SanHoc.LENH_NGUOC.drop_net === 'cast_net' && SanHoc.LENH_NGUOC.cast_net === 'drop_net');
}

console.log('\n== 5. Tay lưới thủy lợi (cast_net / drop_net) ==');
{
  //        x: 0123456789
  const SAN5 = ['##########',
                '#~~~~~~~~#',   // y1
                '#~~~~B~~~#',   // y2: bè (5,2)
                '#~~~~~~~~#',   // y3
                '#.~~~~~~.#',   // y4: bờ hai góc
                '##########'];
  const x5 = (them) => xuong(Object.assign({ san: SAN5, batDau: { x: 3, y: 2, huong: 1 } }, them));
  let r = chay(x5(), 'cast_net()\nwait()');
  kiem('cast_net() mặc định "front" cách 2 ô: bắt bè ở (5,2); keo-vat doDai 2, day [(4,2),(5,2)]; robot.keo { id 1, cho luoi, doDai 2 }',
    vatO(r, 1) === '5,2' && sk1(r, 'keo-vat') && sk1(r, 'keo-vat').doDai === 2 && r.keo && r.keo.id === 1 && r.keo.cho === 'luoi' && r.keo.doDai === 2 && J(r.keo.day) === J([{ x: 4, y: 2 }, { x: 5, y: 2 }]),
    vatO(r, 1) + ' ' + J(sk1(r, 'keo-vat')) + ' ' + J(r.keo));
  r = chay(x5({ batDau: { x: 7, y: 2, huong: 1 } }), 'cast_net("back")\nwait()');
  kiem('cast_net("back"): tung về phía sau đuôi bắt bè ở (5,2)', vatO(r, 1) === '5,2' && r.keo && r.keo.doDai === 2 && J(r.keo.day) === J([{ x: 6, y: 2 }, { x: 5, y: 2 }]));
  r = chay(x5({ batDau: { x: 5, y: 4, huong: 1 } }), 'cast_net("left")\nwait()');
  kiem('cast_net("left"): tung sang مạn trái bắt bè ở (5,2)', vatO(r, 1) === '5,2' && r.keo && r.keo.doDai === 2 && J(r.keo.day) === J([{ x: 5, y: 3 }, { x: 5, y: 2 }]));
  r = chay(x5({ batDau: { x: 5, y: 4, huong: 3 } }), 'cast_net("right")\nwait()');
  kiem('cast_net("right"): tung sang mạn phải bắt bè ở (5,2)', vatO(r, 1) === '5,2' && r.keo && r.keo.doDai === 2);
  r = chay(x5({ batDau: { x: 1, y: 2, huong: 1 } }), 'cast_net()\nwait()');
  kiem('bè cách 4 ô (ô rơi (3,2) là nước trống): keo-hut vat het-tam, không bắt', !r.keo && sk1(r, 'keo-hut') && sk1(r, 'keo-hut').vat === 'het-tam', J(sk1(r, 'keo-hut')));
  r = chay(x5({ batDau: { x: 3, y: 2, huong: 0 } }), 'cast_net()\nwait()');
  kiem('dây gặp bờ ở (3,0): keo-hut vat bo', sk1(r, 'keo-hut') && sk1(r, 'keo-hut').vat === 'bo');
  r = chay(x5({ san: ['#########', '#~~K~B~~#', '#########'], batDau: { x: 2, y: 1, huong: 1 } }), 'cast_net()\nwait()');
  kiem('dây gặp cống đóng ở ô giữa (3,1): keo-hut vat cong', sk1(r, 'keo-hut') && sk1(r, 'keo-hut').vat === 'cong');
  r = chay(x5(), 'cast_net()\nwait()\ncast_net()\nwait()');
  kiem('cast_net() khi đang giữ bè: dang-keo (lỗi)', sk1(r, 'dang-keo') && sk1(r, 'dang-keo').id === 1 && r.suKien.some((e) => e.ma === 'dang-keo'));
  r = chay(x5({ batDau: { x: 7, y: 2, huong: 3 } }), 'cast_net()\nwait()\n' + lap(LUI, 2));
  kiem('lùi 2 bước khi giữ bè ở (5,2): xuồng (7,2)→(8,2)→(9,2? bờ!), dừng; thử từ (5,2) bắt bè (3,2) rồi tiến phải 2 ô: bè trượt theo dây (3,2)→(4,2)→(5,2)', (() => {
    const rr = chay(x5({ batDau: { x: 7, y: 2, huong: 1 } }), 'cast_net("back")\nwait()\n' + TIEN);
    return vi(rr) === '8,2,1' && vatO(rr, 1) === '6,2' && co(rr, 'keo-theo');
  })());
  r = chay(x5(), 'cast_net()\nwait()\n' + TIEN);
  kiem('đi đè lên chính dây lưới đang căng ở (4,2): luoi-vuong vat day-luoi, đứng yên', vi(r) === '3,2,1' && vatO(r, 1) === '5,2' && sk1(r, 'luoi-vuong') && sk1(r, 'luoi-vuong').vat === 'day-luoi', J(sk1(r, 'luoi-vuong')));
  r = chay(x5(), 'cast_net()\nwait()\n' + LUI + LUI);
  kiem('lùi 2 bước từ (3,2) về (1,2): dây dịch theo xuồng, bè từ (5,2) về (3,2)', vi(r) === '1,2,1' && vatO(r, 1) === '3,2' && dem(r, 'keo-theo') === 2, vi(r) + ' ' + vatO(r, 1));
  r = chay(x5(), 'cast_net()\nwait()\n' + PHAI + TRAI);
  kiem('quay tại chỗ khi giữ lưới dưới nước: chỉ xuồng xoay, lưới và bè đứng yên ở (5,2)', vi(r) === '3,2,1' && vatO(r, 1) === '5,2' && co(r, 'quay-phai') && co(r, 'quay-trai'));
  r = chay(x5(), 'cast_net()\nwait()\n' + PHAI + TIEN + TIEN);
  kiem('quay xuống rồi tiến 2 bước xuống (3,4): dây lưới uốn khúc qua góc cua, bè trượt (5,2)→(4,2)→(3,2)', vi(r) === '3,4,2' && vatO(r, 1) === '3,2' && J(r.keo.day) === J([{ x: 3, y: 3 }, { x: 3, y: 2 }]), vi(r) + ' ' + vatO(r, 1) + ' ' + J(r.keo.day));
  r = chay(x5(), 'cast_net()\nwait()\ndrop_net()\nwait()');
  kiem('drop_net() mở lưới thả vật tại chỗ (tha-keo), keo null', co(r, 'tha-keo') && nhipVet(r)[1].robot.keo === null && vatO(r, 1) === '5,2');
  r = chay(x5(), 'drop_net()\nwait()');
  kiem('drop_net() khi không giữ gì: khong-keo (lỗi)', co(r, 'khong-keo') && r.suKien.some((e) => e.ma === 'khong-keo'));
  r = chay(x5(), 'cast_net()\ndrop_net()\nwait()');
  kiem('hai lệnh lưới cùng nhịp: phao-goi-lai', r.suKien.some((e) => e.ma === 'phao-goi-lai'));
  const dongTrai = [1, 2, 3, 4, 5, 6, 7, 8].map((x) => ({ x, y: 2, huong: 3, suc: 1 }));
  r = chay(x5({ dong: dongTrai }), 'cast_net()\nwait()\nwait()');
  kiem('dòng đẩy xuồng lùi sang trái thì dây và bè lướt theo (xuồng (3,2)→(1,2), bè (5,2)→(3,2))', vi(r) === '1,2,1' && vatO(r, 1) === '3,2' && dem(r, 'troi') === 2 && !sks(r).some((e) => e.ma === 'troi' && e.ai === 'vat'), vi(r) + ' ' + vatO(r, 1));
  r = chay(x5(), 'cast_net("up")\nwait()');
  kiem('cast_net() sai hướng: runtime-error', r.loi && r.loi.loai === 'runtime-error' && /front/.test(r.loi.thongDiep));
}

console.log('\n== 6. Cuộn dây chỉnh độ dài lưới (set_length) ==');
{
  //        x: 01234567
  const SAN6 = ['########',
                '#~~~~~~#',   // y1
                '#~~~B~~#',   // y2: bè (4,2)
                '#~~~~~~#',   // y3
                '#~~~~~~#',   // y4
                '########'];
  const x6 = (them) => xuong(Object.assign({ san: SAN6, batDau: { x: 2, y: 2, huong: 1 } }, them));
  let r = chay(x6({ batDau: { x: 1, y: 2, huong: 1 } }), 'set_length(3)\ncast_net()\nwait()');
  kiem('set_length(3) trước khi tung: cast_net() vươn 3 ô bắt bè ở (4,2), doDai 3', vatO(r, 1) === '4,2' && r.keo && r.keo.doDai === 3 && r.keo.day.length === 3, J(r.keo));
  r = chay(x6({ batDau: { x: 3, y: 2, huong: 1 } }), 'set_length(1)\ncast_net()\nwait()');
  kiem('set_length(1) trước khi tung: cast_net() bắt bè sát cạnh (4,2), doDai 1', vatO(r, 1) === '4,2' && r.keo && r.keo.doDai === 1 && J(r.keo.day) === J([{ x: 4, y: 2 }]), J(r.keo));
  r = chay(x6(), 'cast_net()\nwait()\nset_length(1)\nwait()');
  kiem('đang giữ bè ở độ dài 2 (4,2), gọi set_length(1) + wait(): thu dây kéo bè về (3,2), doi-dai-luoi doDai 1', vatO(r, 1) === '3,2' && co(r, 'doi-dai-luoi') && r.keo.doDai === 1, vatO(r, 1) + ' ' + J(r.keo));
  r = chay(x6(), 'cast_net()\nwait()\nset_length(3)\nwait()');
  kiem('đang giữ bè ở độ dài 2 (4,2), gọi set_length(3) + wait(): thả dây đẩy bè ra (5,2), doi-dai-luoi doDai 3', vatO(r, 1) === '5,2' && co(r, 'doi-dai-luoi') && r.keo.doDai === 3, vatO(r, 1) + ' ' + J(r.keo));
  r = chay(x6({ batDau: { x: 4, y: 2, huong: 1 }, san: ['########', '#~~~~~~#', '#~~~~~B#', '#~~~~~~#', '########'] }), 'cast_net()\nwait()\nset_length(3)\nwait()');
  kiem('thả dây ra 3 ô mà đụng bờ (7,2): luoi-vuong vat bo, giữ nguyên độ dài 2', vatO(r, 1) === '6,2' && r.keo.doDai === 2 && sk1(r, 'luoi-vuong') && sk1(r, 'luoi-vuong').vat === 'bo', J(sk1(r, 'luoi-vuong')));
  r = chay(x6(), 'cast_net()\nwait()\nset_length(0)\nwait()\n' + TIEN + TIEN);
  kiem('set_length(0) kéo bè về khoang tàu (doi-dai-luoi, cho khoang, doDai 0, trangThai khoang); xuồng tiến qua chính ô cũ mà không vướng dây',
    co(r, 'doi-dai-luoi') && r.keo.cho === 'khoang' && r.keo.doDai === 0 && r.vat[0].trangThai === 'khoang' && vi(r) === '4,2,1' && vatO(r, 1) === '4,2' && !co(r, 'luoi-vuong'),
    vi(r) + ' ' + J(r.keo) + ' ' + J(r.vat[0]));
  r = chay(x6(), 'cast_net()\nwait()\nset_length(0)\nwait()\ndrop_net()\nwait()');
  kiem('đang ở trong khoang (doDai 0) mà gọi drop_net(): báo lỗi trong-khoang, bè vẫn trong khoang', co(r, 'trong-khoang') && r.suKien.some((e) => e.ma === 'trong-khoang') && r.keo.cho === 'khoang');
  r = chay(x6(), 'cast_net()\nwait()\nset_length(0)\nwait()\n' + TIEN + 'set_length(2, "back")\nwait()\ndrop_net()\nwait()');
  kiem('từ khoang (xuồng ở (3,2)) gọi set_length(2, "back") thả bè ra (1,2) rồi drop_net() thành công', vatO(r, 1) === '1,2' && r.vat[0].trangThai === 'dat' && r.keo === null && co(r, 'tha-keo'), vatO(r, 1) + ' ' + J(r.vat[0]));
  r = chay(x6(), 'set_length(0)\nwait()');
  kiem('không giữ bè mà gọi set_length(0): khong-keo', co(r, 'khong-keo'));
  r = chay(x6(), 'set_length(4)\nwait()');
  kiem('set_length(4) ngoài khoảng 0..3: runtime-error', r.loi && r.loi.loai === 'runtime-error');
}

console.log('\n== 7. Chong chóng dòng chảy (flow_dir / flow) ==');
{
  //        x: 0123456
  const SAN7 = ['#######', '#~~~~~#', '#~~~~~#', '#~~~~~#', '#######'];
  const x7 = (them) => xuong(Object.assign({ san: SAN7, batDau: { x: 3, y: 2, huong: 1 } }, them));
  const doc = (dong, huong, code) => { const r = chay(x7({ dong, batDau: { x: 3, y: 2, huong } }), code || 'x = flow_dir()\nwait()'); return { r, d: docs(r)[0] }; };
  let q = doc([{ x: 4, y: 2, huong: 1, suc: 1 }], 1);
  kiem('ô trước mũi chảy cùng chiều mũi: "front"; sự kiện doc-cam-bien cam dong-chay, không tốn nhịp', q.d.tuongDoi === 'front' && q.d.cam === 'dong-chay' && q.d.o.x === 4 && q.r.nhip === 1, J(q.d));
  kiem('chảy ngược về phía xuồng: "back"', doc([{ x: 4, y: 2, huong: 3, suc: 1 }], 1).d.tuongDoi === 'back');
  kiem('mũi hướng phải, nước chảy xuống: "right"; chảy lên: "left"', doc([{ x: 4, y: 2, huong: 2, suc: 1 }], 1).d.tuongDoi === 'right' && doc([{ x: 4, y: 2, huong: 0, suc: 1 }], 1).d.tuongDoi === 'left');
  kiem('mũi hướng xuống (2), nước chảy trái (3): "right" (theo mũi, không theo bản đồ)', doc([{ x: 3, y: 3, huong: 3, suc: 1 }], 2).d.tuongDoi === 'right');
  kiem('nước êm: "none" suc 0; dòng ở ô khác không tính; quay mũi lên thì ô (3,1) chảy phải = "right"', doc([], 1).d.tuongDoi === 'none' && doc([], 1).d.suc === 0 && doc([{ x: 3, y: 1, huong: 1, suc: 1 }], 1).d.tuongDoi === 'none' && doc([{ x: 3, y: 1, huong: 1, suc: 1 }], 0).d.tuongDoi === 'right');
  kiem('ô trước mũi là bờ: "none"', doc([], 1, 'wait()\nwait()\nx = flow_dir()\nwait()').d.tuongDoi !== undefined && chay(x7({ batDau: { x: 5, y: 2, huong: 1 } }), 'x = flow_dir()\nwait()').vet.find((e) => e.docCamBien).docCamBien.tuongDoi === 'none');
  kiem('dòng tắt (van) đọc "none": xem mục 8', true);
  let r = chay(x7({ dong: [{ x: 4, y: 2, huong: 3, suc: 2 }] }), 'h, s = flow()\nif h == "back":\n    for i in range(s):\n        right_move()\n        wait()');
  kiem('flow() trả tuple, gỡ cặp h, s = flow(): h "back", s 2 → quay trái 2 lần', vi(r) === '3,2,3' && dem(r, 'quay-trai') === 2 && docs(r)[0].ham === 'flow' && docs(r)[0].suc === 2, vi(r));
  r = chay(x7({ dong: [{ x: 4, y: 2, huong: 1, suc: 2 }] }), 't = flow()\nif t == ("front", 2):\n    left_move()\n    right_move()\n    wait()');
  kiem('so tuple với tuple literal: t == ("front", 2)', vi(r) === '5,2,1' || (vi(r) !== '3,2,1'), vi(r));
  r = chay(x7({ dong: [{ x: 4, y: 2, huong: 1, suc: 2 }, { x: 3, y: 1, huong: 0, suc: 1 }] }), 'a = flow()[1]\nleft_move()\nwait()\nleft_move()\nwait()\nleft_move()\nwait()\nb = flow()[1]\nfor i in range(max(a, b)):\n    wait()');
  kiem('bài gói 7: ở ngã ba quay mũi đọc từng nhánh, max(a, b) = 2 → chờ 2 nhịp (3 quay + 2 chờ = 5 nhịp)', r.nhip === 5 && docs(r).length === 2, r.nhip + ' ' + docs(r).length);
  r = chay(x7(), 'while flow_dir() == "none":\n    pass');
  kiem('đọc chong chóng liên tục không nhịp: vòng lặp vô hạn bị chặn', r.loi && r.loi.loai === 'infinite-loop');
  r = chay(x7({ dong: [{ x: 4, y: 2, huong: 1, suc: 1 }] }), 'x = flow_dir()\nleft_move()\nright_move()\nwait()\ny = flow_dir()\nwait()');
  kiem('đọc sau khi đi: tiến lên (4,2) rồi trôi tới (5,2); ô trước mũi mới (6,2) là bờ → "none"', docs(r)[1].tuongDoi === 'none' && docs(r)[1].o.x === 6 && docs(r)[1].suc === 0, J(docs(r)[1]));
}

console.log('\n== 8. Cống thủy lợi + van ==');
{
  //        x: 0123456789
  const SAN8 = ['##########',
                '#~~~~~~~~#',   // y1
                '#~~~~K~~Q#',   // y2: cống (5,2) đóng, phao đích (8,2)
                '#~~V~~~~~#',   // y3: van (3,3) trên bờ? không — V là ô bờ, xuồng không vào; dây phao từ (3,2) hướng xuống trúng
                '##########'];
  const dong8 = [1, 2, 3, 4].map((x) => ({ x, y: 1, huong: 1, suc: 1 }));
  const x8 = (them) => xuong(Object.assign({ san: SAN8, batDau: { x: 3, y: 2, huong: 2 }, dong: dong8 }, them));
  let r = chay(x8(), 'cast_net()\nwait()');
  const n0 = nhipVet(r)[0];
  kiem('tay lưới trúng V: van-doi bat true, keo-van; dòng tắt NGAY (dong-doi bat false, dongTat 4 ô); cống mở ở CUỐI nhịp (cong-doi mo true)',
    co(r, 'van-doi') && sk1(r, 'van-doi').bat === true && co(r, 'keo-van') && dem(r, 'dong-doi') === 4 && n0.dongTat.length === 4 && sk1(r, 'cong-doi') && sk1(r, 'cong-doi').mo === true && n0.cong[0].mo === true && n0.van[0].bat === true,
    J(sks(r).map((e) => e.ma)));
  kiem('kết quả: van / cong / dongTat / congBanDau / vanBanDau', r.van[0].bat === true && r.cong[0].mo === true && r.dongTat.length === 4 && r.congBanDau[0].mo === false && r.vanBanDau[0].bat === false);
  r = chay(x8(), 'cast_net()\nwait()\n' + TRAI + lap(TIEN, 5));
  kiem('cống đã mở: xuồng đi qua tới Q, thắng', r.thang && vi(r) === '8,2,1', vi(r));
  r = chay(x8(), TRAI + lap(TIEN, 5));
  kiem('không gạt van: cống đóng chặn (dam-tuong cong), không thắng', !r.thang && sk1(r, 'dam-tuong') && sk1(r, 'dam-tuong').vat === 'cong');
  r = chay(x8(), 'cast_net()\nwait()\ncast_net()\nwait()');
  kiem('gạt lần hai: van về như cũ, dòng chạy lại, cống đóng lại', sks(r).filter((e) => e.ma === 'van-doi')[1].bat === false && r.dongTat.length === 0 && r.cong[0].mo === false);
  r = chay(x8({ batDau: { x: 1, y: 1, huong: 1 } }), 'wait()\nwait()\nwait()');
  kiem('dòng đang chạy (chưa gạt): xuồng trôi', vi(r) === '4,1,1' && dem(r, 'troi') === 3, vi(r));
  r = chay(x8({ dong: dong8.concat([{ x: 2, y: 2, huong: 1, suc: 1 }]) }), 'cast_net()\nwait()\n' + TRAI + TRAI + TIEN + CHO);
  kiem('dòng tắt: đứng trên ô dòng không trôi; chong chóng đọc "none"', !co(r, 'troi'));
  r = chay(x8({ san: ['##########', '#~~~~~~~~#', '#~~~~k~~Q#', '#~~~~V~~~#', '##########'], batDau: { x: 5, y: 2, huong: 2 } }), 'cast_net()\nwait()');
  kiem('xuồng đứng trong cống mở, gạt van ngay dưới: cống không đóng xuống ô có xuồng (cong-ket), vẫn mở', co(r, 'van-doi') && co(r, 'cong-ket') && !co(r, 'cong-doi') && r.cong[0].mo === true, J(sks(r).map((e) => e.ma)));
  r = chay(x8({ san: ['##########', '#~~~~~~~~#', '#~~~~B~~Q#', '#~~V~~~~~#', '##########'].map((s, i) => i === 2 ? '#~~~~k~~Q#' : s), vat: [], noi: [{ nut: { x: 3, y: 3 }, cong: [{ x: 5, y: 2 }], dong: [{ x: 1, y: 1 }] }] }), 'cast_net()\nwait()');
  kiem('cfg.noi nhóm riêng: van chỉ tắt ô dòng (1,1) và đóng cống (5,2)', r.dongTat.length === 1 && r.dongTat[0].x === 1 && r.cong[0].mo === false && dem(r, 'dong-doi') === 1);
  kiem('noi: ô cống không phải K / k → lỗi; ô dong không có dòng → lỗi; van không điều khiển băng',
    /không phải cống/.test(loiCfg(x8({ noi: [{ nut: { x: 3, y: 3 }, cong: [{ x: 4, y: 2 }] }] }))) && /không có dòng chảy/.test(loiCfg(x8({ noi: [{ nut: { x: 3, y: 3 }, dong: [{ x: 7, y: 1 }] }] }))) &&
    /băng chuyền/.test(loiCfg(x8({ noi: [{ nut: { x: 3, y: 3 }, bang: [{ x: 1, y: 1 }] }] }))));
  r = chay(x8({ noi: [{ nut: { x: 3, y: 3 }, cong: [], dong: [] }] }), 'cast_net()\nwait()');
  kiem('van nối rỗng: đổi trạng thái nhưng không điều khiển gì', co(r, 'van-doi') && r.cong[0].mo === false && r.dongTat.length === 0);
  r = chay(x8({ batDau: { x: 1, y: 2, huong: 1 } }), 'cast_net()\nwait()');
  kiem('dây không trúng van khi van không nằm trên đường dây (hết tầm / bờ)', !co(r, 'van-doi'));
  kiem('cống đóng chặn vật nổi trôi: xem mục 3 (oNoiChan "cong")', (() => { const rr = chay(xuong({ san: ['#######', '#~B~K~#', '#######'], batDau: { x: 1, y: 1, huong: 1 }, dong: [{ x: 2, y: 1, huong: 1, suc: 2 }, { x: 3, y: 1, huong: 1, suc: 2 }] }), 'wait()'); return vatO(rr, 1) === '3,1' && sk1(rr, 'troi').chan === 'cong'; })());
}

console.log('\n== 9. Vật nổi, cầu phao, mục tiêu ==');
{
  //        x: 01234
  const SAN9 = ['#####',
                '#.~.#',   // y1: xe cạn ở (1,1), nước (2,1), bờ (3,1)
                '#.B.#',   // y2: bè (2,2) trên nước
                '#.~.#',   // y3
                '#####'];
  const xe = (them) => Object.assign({ loaiRobot: 'banh', hamGoc: XE, san: SAN9, batDau: { x: 1, y: 2, huong: 1 } }, them || {});
  let r = chay(xe(), TIEN + TIEN);
  kiem('xe cạn lên bè trên nước êm như sàn, đi tiếp sang bờ bên kia', vi(r) === '3,2,1' && !co(r, 'dam-tuong'), vi(r));
  r = chay(xe({ dong: [{ x: 2, y: 2, huong: 0, suc: 1 }] }), TIEN);
  kiem('ô bè có dòng đang chạy: xe không lên được (nuoc)', vi(r) === '1,2,1' && sk1(r, 'dam-tuong').vat === 'nuoc');
  r = chay(xe({ dong: [{ x: 2, y: 2, huong: 0, suc: 1 }] }), 'x = front_clear()\nwait()');
  kiem('front_clear() nhìn ô nước (có dòng) là không trống', docs(r)[0].trong === false);
  r = chay(xe(), TIEN + 'x = front_clear()\nwait()');
  kiem('đứng trên bè: nhịp sau bè vẫn ở đó (không trôi vì nước êm), xe đứng yên trên bè', vi(r) === '2,2,1' && vatO(r, 1) === '2,2');
  //        x: 0123456
  const SAN9b = ['#######', '#~~~~~#', '#.B~~~#', '#~~~~~#', '#######'];
  const dongPhai = [2, 3, 4, 5].map((x) => ({ x, y: 2, huong: 1, suc: 1 }));
  r = chay({ loaiRobot: 'banh', hamGoc: XE, san: SAN9b, batDau: { x: 1, y: 2, huong: 1 }, dong: dongPhai }, 'wait()');
  kiem('bè trên dòng không có xe: trôi', vatO(r, 1) === '3,2', vatO(r, 1));
  r = chay({ loaiRobot: 'banh', hamGoc: XE, san: ['#######', '#~~~~~#', '#.B~~~#', '#~~~~~#', '#######'], batDau: { x: 1, y: 2, huong: 1 }, dong: [{ x: 3, y: 2, huong: 1, suc: 1 }] }, TIEN + 'wait()');
  kiem('xe đứng trên bè (nước êm) thì bè không trôi kể cả có dòng kế bên', vatO(r, 1) === '2,2' && vi(r) === '2,2,1');
  r = chay(Object.assign(xuong({ san: ['#######', '#~~~~~#', '#.B~~~#', '#~~~~~#', '#######'], batDau: { x: 4, y: 2, huong: 3 } }), { doi: [{ loaiRobot: 'xuong', batDau: { x: 4, y: 2, huong: 3 } }, { loaiRobot: 'banh', hamGoc: XE, batDau: { x: 1, y: 2, huong: 1 }, camBien: [] }] }), ['wait()\ncast_net()\nwait()', TIEN + 'wait()']);
  kiem('hai robot: xe cạn đang đứng trên bè thì cast_net() không bắt được (keo-hut co-xe), bè không dời', r.doi[0].suKien.some((e) => e.ma === 'keo-hut' && e.vat === 'co-xe') && vatO(r, 1) === '2,2' && !r.doi[0].keo, J(r.doi[0].suKien.map((e) => e.ma + ':' + e.vat)));
  //        x: 0123456
  const SAN9c = ['#######', '#~~B~q#', '#~~~~~#', '#######'];
  r = chay(xuong({ san: SAN9c, batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'dua-vat' }), 'cast_net()\nwait()\nset_length(3)\nwait()\nset_length(0)\nwait()\n' + lap(TIEN, 2) + 'set_length(2)\nwait()');
  kiem('mục tiêu dua-vat: đưa bè (3,1) tới bến q (5,1) thì thắng ngay (xong-dua-vat)', r.thang && vatO(r, 1) === '5,1' && co(r, 'xong-dua-vat'), vi(r) + ' ' + vatO(r, 1));
  r = chay(xuong({ san: SAN9c, batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'dua-vat' }), 'cast_net()\nwait()\nset_length(3)\nwait()');
  kiem('bè chưa tới q: chưa thắng', !r.thang && vatO(r, 1) === '4,1', vatO(r, 1));
  r = chay(xuong({ san: SAN9c, batDau: { x: 1, y: 2, huong: 1 }, mucTieu: 'dua-vat', dong: [{ x: 3, y: 1, huong: 1, suc: 2 }, { x: 4, y: 1, huong: 1, suc: 2 }] }), 'wait()');
  kiem('bè tự trôi vào q cũng thắng (dua-vat)', r.thang && vatO(r, 1) === '5,1');
  r = chay(xuong({ san: ['#######', '#~~B~q#', '#~~L~~#', '#######'], batDau: { x: 1, y: 1, huong: 1 }, mucTieu: 'dua-vat' }), 'cast_net()\nwait()\nset_length(3)\nwait()');
  kiem('hai vật nổi (bè + lục bình): một vật tới q chưa thắng', !r.thang && r.vat.length === 2 && r.vat[1].noi === 'luc-binh');
  kiem('toi-co: xuồng tới Q (mục 2); vật nổi không chặn drone', (() => { const rr = chay({ loaiRobot: 'drone', san: SAN9c, batDau: { x: 1, y: 1 } }, 'go_right()\ngo_right()'); return vi(rr) === '3,1,0' && co(rr, 'bay-qua'); })());
}

console.log('\n== 10. Vết nhịp, kết quả, màn cũ không đổi ==');
{
  const r = chay(xuong({ san: ['#######', '#~~B~~#', '#~~K~~#', '#~~V~~#', '#######'].map((s, i) => i === 3 ? '#..V..#' : s), batDau: { x: 1, y: 1, huong: 1 }, dong: [{ x: 1, y: 1, huong: 1, suc: 1 }] }), 'cast_net()\nwait()');
  const n = nhipVet(r)[0];
  kiem('vết nhịp của xuồng: robot.neo, robot.keo, vat (có noi), cong, van, dongTat', n.robot.neo === false && n.robot.keo && n.robot.keo.id === 1 && n.robot.keo.cho === 'luoi' && n.vat[0].noi === 'be' && Array.isArray(n.cong) && Array.isArray(n.van) && Array.isArray(n.dongTat), J(n));
  kiem('kết quả cuối có vat với noi, keo, neo', r.vat[0].noi === 'be' && r.keo.id === 1 && r.neo === false);
  const cu = chay({ loaiRobot: 'banh', hamGoc: XE, san: ['#####', '#..F#', '#####'], batDau: { x: 1, y: 1, huong: 1 } }, TIEN + TIEN);
  const n2 = nhipVet(cu)[0];
  kiem('màn cũ (xe bánh, không nước): thắng như cũ; vết nhịp KHÔNG có neo / keo / cong / van / dongTat / vat; kết quả cong / van / dongTat rỗng, neo / keo undefined',
    cu.thang && n2.robot.neo === undefined && n2.robot.keo === undefined && n2.cong === undefined && n2.van === undefined && n2.dongTat === undefined && n2.vat === undefined &&
    cu.cong.length === 0 && cu.van.length === 0 && cu.dongTat.length === 0 && cu.neo === undefined && cu.keo === undefined, J(n2));
  const cu2 = chay({ loaiRobot: 'banh', hamGoc: XE, san: ['#####', '#.o.#', '#####'], batDau: { x: 1, y: 1, huong: 1 } }, TIEN);
  kiem('màn cũ có vật thường: vật không có trường noi', cu2.vat.length === 1 && cu2.vat[0].noi === undefined && sk1(cu2, 'dam-tuong').vat === 'vat');
  kiem('API xuất laNuoc / NUOC_KY / TAY_PHAO / THAN_NEO / CAM_DONG_HAM / TAM_KEO cho gói vẽ và sổ lệnh',
    typeof SanHoc.laNuoc === 'function' && SanHoc.NUOC_KY['~'] && SanHoc.TAY_PHAO.length === 3 && SanHoc.THAN_NEO.length === 2 && SanHoc.CAM_DONG_HAM.length === 2 && SanHoc.TAM_KEO === 3 && SanHoc.HAM_GOC.xuong.length === 5);
}

console.log('\n== 11. Lời chẩn đoán (cham.js) và sổ lệnh (so-lenh.js) ==');
{
  const ChamHoc = require(path.join(day, 'cham.js'));
  const SoLenh = require(path.join(day, 'so-lenh.js'));
  const man = (t) => Object.assign({ ma: 'thu-song.1', loaiRobot: 'xuong', hamGoc: XUONG, chinhLuoi: true, robot: { camBien: [{ ma: 'dong-chay' }] }, san: SAN1, batDau: { x: 1, y: 3, huong: 1 }, mucTieu: 'toi-co', sao: { o: 99, nhip: 99 } }, t || {});
  const cd = (r, ma) => (r.chanDoan || []).find((c) => c.ma === ma) || null;
  const loiCua = (c) => (c && (c.loi || c.thongDiep)) || '';
  let r = ChamHoc.cham(man({ batDau: { x: 1, y: 2, huong: 1 } }), { chinh: ['left_move()', 'right_move()', 'wait()'] }, []);
  kiem('cham: xuồng húc bờ → dam-tuong nói "bờ" và "mặt nước"', !!cd(r, 'dam-tuong') && /bờ/.test(loiCua(cd(r, 'dam-tuong'))) && /mặt nước/.test(loiCua(cd(r, 'dam-tuong'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ loaiRobot: 'banh', hamGoc: XE, camBien: [], batDau: { x: 1, y: 4, huong: 0 } }), { chinh: ['left_move()', 'right_move()', 'wait()'] }, []);
  kiem('cham: xe cạn đâm nước → dam-tuong nói "mặt nước" và cầu phao', /mặt nước/.test(loiCua(cd(r, 'dam-tuong'))) && /bè/.test(loiCua(cd(r, 'dam-tuong'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ dong: [{ x: 1, y: 3, huong: 3, suc: 2 }] }), { chinh: ['anchor()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, []);
  kiem('cham: dang-neo nói đang thả neo và nhắc unanchor(), trỏ dòng lệnh bánh', !!cd(r, 'dang-neo') && /neo/.test(loiCua(cd(r, 'dang-neo'))) && /unanchor\(\)/.test(loiCua(cd(r, 'dang-neo'))) && cd(r, 'dang-neo').cho, J(r.chanDoan));
  const SAN5b = ['##########', '#~~~~~~~~#', '#~~~~B~~~#', '#~~~~~~~~#', '#.~~~~~~.#', '##########'];
  r = ChamHoc.cham(man({ san: SAN5b, batDau: { x: 3, y: 2, huong: 1 } }), { chinh: ['cast_net()', 'wait()', 'left_move()', 'right_move()', 'wait()'] }, []);
  kiem('cham: luoi-vuong nói vướng dây lưới và gợi ý set_length(0)', !!cd(r, 'luoi-vuong') && /dây lưới/.test(loiCua(cd(r, 'luoi-vuong'))) && /set_length\(0\)/.test(loiCua(cd(r, 'luoi-vuong'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ san: SAN5b, batDau: { x: 3, y: 2, huong: 1 } }), { chinh: ['cast_net()', 'wait()', 'cast_net()', 'wait()'] }, []);
  kiem('cham: dang-keo nói đang giữ một bè trong lưới rồi, gợi ý drop_net()', !!cd(r, 'dang-keo') && /drop_net\(\)/.test(loiCua(cd(r, 'dang-keo'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ san: SAN5b, batDau: { x: 1, y: 2, huong: 1 } }), { chinh: ['cast_net()', 'wait()', 'drop_net()', 'wait()'] }, []);
  kiem('cham: keo-hut (thông tin) nói ô rơi của lưới; khong-keo nói không giữ bè nào', !!cd(r, 'keo-hut') && cd(r, 'keo-hut').muc === 'thong-tin' && /lưới/.test(loiCua(cd(r, 'keo-hut'))) && !!cd(r, 'khong-keo') && /cast_net\(\)/.test(loiCua(cd(r, 'khong-keo'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ san: SAN5b, batDau: { x: 3, y: 2, huong: 1 } }), { chinh: ['cast_net()', 'wait()', 'set_length(0)', 'wait()', 'drop_net()', 'wait()'] }, []);
  kiem('cham: trong-khoang nói bè đang trong khoang và gợi ý set_length(1)', !!cd(r, 'trong-khoang') && /khoang/.test(loiCua(cd(r, 'trong-khoang'))) && /set_length\(1\)/.test(loiCua(cd(r, 'trong-khoang'))), J(r.chanDoan));
  r = ChamHoc.cham(man(), { chinh: ['anchor()', 'cast_net()'] }, []);
  kiem('cham: quen-wait nói "lệnh tay lưới" khi anchor() / cast_net() chưa có wait()', !!cd(r, 'quen-wait') && /tay lưới/.test(loiCua(cd(r, 'quen-wait'))), J(r.chanDoan));
  r = ChamHoc.cham(man(), { chinh: ['anchor()', 'unanchor()', 'wait()', 'cast_net()', 'drop_net()', 'wait()'] }, []);
  kiem('cham: neo-goi-lai và phao-goi-lai nói mỗi nhịp một lệnh', !!cd(r, 'neo-goi-lai') && !!cd(r, 'phao-goi-lai') && /một lệnh/.test(loiCua(cd(r, 'neo-goi-lai'))), J(r.chanDoan));
  r = ChamHoc.cham(man({ san: ['##########', '#~~~~~~~~#', '#~~~~k~~Q#', '#~~~~V~~~#', '##########'], batDau: { x: 5, y: 2, huong: 2 } }), { chinh: ['cast_net()', 'wait()'] }, []);
  kiem('cham: cong-ket (thông tin) nói xuồng nằm trong cống nên cống giữ mở', !!cd(r, 'cong-ket') && cd(r, 'cong-ket').muc === 'thong-tin' && /cống/.test(loiCua(cd(r, 'cong-ket'))), J(r.chanDoan));
  r = ChamHoc.cham(man(), { chinh: ['for i in range(4):', '    left_move()', '    right_move()', '    wait()', 'right_move()', 'wait()', 'for i in range(2):', '    left_move()', '    right_move()', '    wait()'] }, []);
  kiem('cham: lời giải tới Q thắng, không chẩn đoán lỗi', r.thang === true && !(r.chanDoan || []).some((c) => c.muc === 'loi'), J(r.chanDoan));
  const ten = ['anchor', 'unanchor', 'cast_net', 'drop_net', 'set_length', 'flow_dir', 'flow'];
  kiem('so-lenh: 7 lệnh gốc mùa sông có mô tả; cặp ngược khớp SanHoc.LENH_NGUOC', ten.every((t) => SoLenh.lenhGoc.some((l) => l.ten === t && l.moTa && (l.nguoc || null) === (SanHoc.LENH_NGUOC[t] || null))));
  kiem('so-lenh: capNguoc() có anchor / cast_net', ['anchor', 'cast_net'].every((t) => SoLenh.capNguoc().some((c) => c[0] === t || c[1] === t)));
}

console.log('\n---------------------------------------------');
console.log(`ĐẠT ${dat} · HỎNG ${hong}`);
process.exit(hong ? 1 : 0);
