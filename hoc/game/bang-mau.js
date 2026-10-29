/* bang-mau.js — BẢNG MÀU THEO VAI TRÒ của "Robot Chấn Hưng" (gói A1, 27/10/2026).
   Một nguồn sự thật cho mọi màu của game: JS dùng BangMau.<vai> (qua biến BM ở đầu mỗi tệp), CSS dùng var(--g-<vai>).
   Lúc nạp trong trình duyệt, tệp này ghi mỗi vai thành biến CSS --g-<vai> trên <html> (choi.html nạp nó trong <head>,
   trước choi.css và mọi script vẽ), nên CSS và canvas đọc cùng một giá trị. Ở Node: module.exports.
   HAI TẦNG: G là bảng gốc nhỏ theo vai thị giác (chỗ A2 sửa); BT là biến thể vẽ tay (mã lệch vài đơn vị so với một gốc),
   giữ nguyên mã cũ để gói A1 không đổi điểm ảnh nào, mỗi biến thể ghi gốc gần nhất; bật GOP_HET là gộp hết về gốc.
   DOI (sơn / màu đội) và LUAT (màu luật chơi) để riêng. Máy kiểm: hoc/kiem-bang-mau.mjs. */
(function (root) {
  var GOP_HET = false;   // A2: đặt true thì mọi biến thể (BT) lấy giá trị gốc của nó; rồi chỉ cần sửa G (và DOI, LUAT)

  // ======================================================================== BẢNG GỐC G (203 màu sau V7c3): chỗ gói A2 sửa
  // Tên theo vai thị giác: <họ> + Sang / Toi (sáng hơn / tối hơn màu chính của họ); số = mấy chỗ trong code dùng thẳng tên gốc
  var G = {
    // ---- dùng chung
    vienDam: '#1b120a',                // 48 chỗ (choi.css, part/xem-part.html, bang-mo-khoa.js, cai-dat.js, gioi-thieu.js, huy-hieu.js, man-choi.js, man-chon.js, man-goi.js, man-lap.js, man-so-lenh.js, mo-dau.js, part/part.js, phim-goi.js, san-ve.js, ve-robot.js, ve.js): :root { --ink }
    // ---- SÂN (ô sàn, tường, cỏ, bảng đen, hiệu ứng trên sân)
    bang: '#0e3a2b',                   // 11 chỗ (choi.css): .tab { background }
    bangSang: '#1d5a44',               // 5 chỗ (choi.css, ve.js): .chalk { background-color }
    bangSang2: '#2a8a35',              // 4 chỗ (choi.css, ve.js): .g-gr { --lo }
    sanLam: '#d0d6e4',                 // 6 chỗ (san-ve.js, ve.js): this.burst(tx, ty + 2, 5, ['#d0d6e4', '#ffffff', '#9ba3b4'], 0.35);
    sanLamToi: '#14336a',              // 4 chỗ (ve.js): p.rect(0, 0, T, 1, '#14336a'); p.rect(0, T - 1, T, 1, '#14336a'); p.r…
    sanTrang: '#fff6e3',               // 40 chỗ (san-ve.js, ve.js): if (k < 0.5 && Math.random() < 0.4) self.burst(v.x * T + 3 + Math.ran…
    sanXam: '#d8d8d8',                 // 6 chỗ (san-ve.js): if (k < 0.5 && Math.random() < 0.4) self.burst(v.x * T + 3 + Math.ran…
    sanXamToi: '#6b707c',              // 3 chỗ (san-ve.js): if (v.dr && v.dr.roi && ok && Math.random() < 0.1) this.burst(cx + (M…
    sanTimSang: '#f0b8ff',             // 2 chỗ (san-ve.js, ve.js): var mCong = s.cong === '2' ? ['#f0b8ff', '#a84cff', '#ffffff'] : ['#9…
    sanVang: '#ffd23f',                // 18 chỗ (san-ve.js, ve.js): var cols = ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6fe06a', '#…
    sanVangSang: '#ffe27a',            // 2 chỗ (san-ve.js, ve.js): this.burst(tx + dx * 2, ty + dy * 2, 9, ['#ffe27a', '#ffffff', '#f2b5…
    sanXanhLo: '#7ff0ff',              // 8 chỗ (san-ve.js): if (Math.random() < 0.6) self.burst(cx + (Math.random() - 0.5) * 10, …
    sanXanhLoToi: '#1593b3',           // 4 chỗ (ve.js): for (i = 3; i <= 10; i++) { p.px(i, 3, '#1593b3'); p.px(i, 10, '#1593…
    sanHong: '#ff7ac8',                // 1 chỗ (san-ve.js): var cols = ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6fe06a', '#…
    sanXanhLa: '#bfe8b0',              // 9 chỗ (san-ve.js): var cols = s.tren.indexOf('rao') >= 0 ? ['#e8b574', '#fff6e3', '#c98a…
    sanXanhLaToi: '#7cff86',           // 6 chỗ (san-ve.js, ve.js): this.burst(tx + dx * 2, ty + dy * 2, 14, ['#ffffff', '#ffe14a', '#fff…
    sanDo: '#ff5a4a',                  // 5 chỗ (san-ve.js, ve.js): var cols = ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6fe06a', '#…
    sanDoSang: '#ff8a6a',              // 3 chỗ (san-ve.js): kim(4, '#1b120a'); kim(3, nhay ? '#ff8a6a' : 'rgba(255,246,227,.82)');
    sanKem: '#fff6a8',                 // 5 chỗ (san-ve.js, ve.js): this.burst(x0, y0, 3, ['#fff6a8', '#ffe14a'], 0.4, 1, true);
    sanKemToi: '#d8d0c0',              // 1 chỗ (san-ve.js): if (Math.random() < 0.3 * (1 - k)) self.burst(s.o.x * T + 7 - hx * 6,…
    sanCam: '#e8b574',                 // 8 chỗ (san-ve.js): var cols = s.tren.indexOf('rao') >= 0 ? ['#e8b574', '#fff6e3', '#c98a…
    sanCamToi: '#c98a45',              // 8 chỗ (san-ve.js): var cols = s.tren.indexOf('rao') >= 0 ? ['#e8b574', '#fff6e3', '#c98a…
    sanNau: '#4a2e10',                 // 6 chỗ (ve.js): p.rect(0, 0, T, 1, '#4a2e10'); p.rect(0, T - 1, T, 1, '#4a2e10'); p.r…
    sanNauSang: '#8a5a24',             // 3 chỗ (san-ve.js, ve.js): var cols = o && o.chat === 'sat' ? ['#7f97b2', '#dcecfa', '#3f536c', …
    // ---- VẬT (thùng gỗ, khối sắt, vật nhỏ)
    // ---- ROBOT (part, hình tạm)
    robotCam: '#ff8a35',               // 3 chỗ (part/part-kep.js, part/part-tay-xoay.js): if(low){p.rect(10,22,4,1,'#ff8a35');p.rect(11,23,2,1,'#ff8a35');}else…
    // ---- HUY HIỆU
    // ---- TIA / VỆT trên sân: bộ ba "r,g,b" ghép với độ mờ thay đổi (rgba(<gốc>, a))
    tiaXanhLaRgb: '93,255,122',        // 1 chỗ (san-ve.js): var d = ds[i], u = (now - d.t0) / d.ms, a = u < 0.55 ? 1 : Math.max(0…
    tiaDoRgb: '255,126,112',           // 3 chỗ (san-ve.js): var rgb = sat ? '226,238,252' : go ? '196,134,72' : nch ? (d.cuc === …
    tiaTrangRgb: '255,255,255',        // 4 chỗ (san-ve.js): g.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.lineWidth…
    tiaCamRgb: '196,134,72',           // 1 chỗ (san-ve.js): var rgb = sat ? '226,238,252' : go ? '196,134,72' : nch ? (d.cuc === …
    tiaLamRgb: '120,176,255',          // 3 chỗ (san-ve.js): var rgb = sat ? '226,238,252' : go ? '196,134,72' : nch ? (d.cuc === …
    tiaNauRgb: '120,70,30',            // 1 chỗ (san-ve.js): g.strokeStyle = 'rgba(120,70,30,' + a.toFixed(3) + ')'; g.lineWidth =…
    tiaVangRgb: '255,220,120',         // 1 chỗ (san-ve.js): g.fillStyle = 'rgba(255,220,120,' + a.toFixed(3) + ')'; g.fillRect(cx…
    tiaXanhLoRgb: '127,240,255',       // 3 chỗ (san-ve.js): g.strokeStyle = 'rgba(127,240,255,' + (al * 0.8).toFixed(3) + ')'; g.…
    tiaNgocRgb: '95,240,255',          // 1 chỗ (san-ve.js): g.fillStyle = 'rgba(95,240,255,' + a.toFixed(3) + ')'; g.fillRect(thi…
    tiaKemRgb: '255,246,168',          // 2 chỗ (san-ve.js): var col = nho ? '255,246,168' : '127,240,255', a2 = Math.min(1, al + …
    // ---- BÓNG / LỚP MỜ (rgba, mã hex có kênh mờ)
    moSang: '#fff8',                   // 8 chỗ (choi.css): .bt { box-shadow }
    moSangSang: 'rgba(255,255,255,.2)', // 3 chỗ (choi.css): .pal .nk:active { background }
    moToi: 'rgba(0,0,0,.4)',           // 21 chỗ (choi.css): .bong .pg { text-shadow }
    moToiSang: 'rgba(50,25,8,.55)',    // 7 chỗ (choi.css): .ffr .khung-san { box-shadow }
    moCam: 'rgba(255,210,150,.55)',    // 6 chỗ (choi.css): .ffr .khung-san { box-shadow }
    moVang: 'rgba(255,217,90,.16)',    // 3 chỗ (choi.css): .th-huy { background }
    moVangSang: 'rgba(255,217,90,.7)', // 1 chỗ (choi.css): .pan.keo-dich { box-shadow }
    moDoToi: 'rgba(255,60,48,.36)',    // 1 chỗ (san-ve.js): g.fillStyle = k.hopLe ? 'rgba(255,217,90,.3)' : 'rgba(255,60,48,.36)'…
    // ---- GIAO DIỆN và PHIM (choi.css, khay, hộp thoại, nút, icon, chất liệu gỗ / núm, phim)
    kem: '#fff2a6',                    // 8 chỗ (choi.css, man-choi.js, man-lap.js): .plaque { box-shadow }
    kemSang: '#fff3d6',                // 6 chỗ (choi.css): :root { --cream }
    kemToi: '#ffc299',                 // 1 chỗ (cai-dat.js): { ma: 'cam', saoCan: 150, mau: ['#ff7a2f', '#ffc299', '#b84309'] },
    den: '#1d0f05',                    // 3 chỗ (choi.css): .deco .surf { box-shadow }
    go: '#7a3a0a',                     // 6 chỗ (choi.css): .plaque .n { color }
    goSang: '#9a6a0a',                 // 6 chỗ (choi.css): .tc-cuc { background }
    goToi: '#2a1c0e',                  // 5 chỗ (choi.css): .strip { color }
    cam: '#ffb050',                    // 9 chỗ (choi.css, den-bo-phan.js, man-lap.js, thanh-phan.js): .gl.g-tay { color }
    camToi: '#e08a3a',                 // 7 chỗ (choi.css, ve.js): .g-or { --c }
    camSang: '#ffcf94',                // 6 chỗ (choi.css): .g-or { --hi }
    trang: '#fff',                     // 68 chỗ (choi.css, man-choi.js, thanh-phan.js): .bt { background }
    trangToi: '#ffe0dc',               // 2 chỗ (choi.css): .strip.err { box-shadow }
    xanhLa: '#9fd3b8',                 // 10 chỗ (choi.css): .clock .l { color }
    xanhLaSang: '#9dffa4',             // 6 chỗ (choi.css): .th-dong.ok { color }
    xanhLaToi: '#4cc24f',              // 4 chỗ (choi.css, ve.js): .g-gr { --c }
    vang: '#ffd95a',                   // 79 chỗ (choi.css, bang-mo-khoa.js, cai-dat.js, gioi-thieu.js, man-chon.js, man-goi.js, man-so-lenh.js, mo-dau.js, phim-goi.js, phim-mua-1.js): .plaque { background }
    vangToi: '#e0a92a',                // 3 chỗ (choi.css): .plaque { box-shadow }
    vangSang: '#d9c58e',               // 3 chỗ (choi.css): .strip { box-shadow }
    lam: '#1c3a8a',                    // 4 chỗ (choi.css): .bk.wh { box-shadow }
    lamSang: '#c0c6d4',                // 4 chỗ (mo-dau.js, phim-mua-1.js): { ten: 'denXich', mau: '#c0c6d4', x: -70, y: -40, r: '-90deg' },
    lamToi: '#1d2433',                 // 3 chỗ (choi.css): .strip .num.dkm.op,.strip .num.dkm.noi { box-shadow }
    tim: '#d9c4ff',                    // 5 chỗ (choi.css, thanh-phan.js): .g-pu { --hi }
    timToi: '#6a3fb4',                 // 5 chỗ (choi.css, ve.js): .g-pu { --lo }
    timToi2: '#2f1a6a',                // 5 chỗ (choi.css, man-choi.js, thanh-phan.js): .num { box-shadow }
    do: '#e8504a',                     // 6 chỗ (choi.css, mo-dau.js): .g-rd { --c }
    doSang: '#ff9a90',                 // 5 chỗ (choi.css): .bh .del.het { --hi }
    doToi: '#4a0e0c',                  // 5 chỗ (choi.css, man-choi.js, thanh-phan.js, xuong-ham.js): .num.mc-red { box-shadow }
    xanhLo: '#07303a',                 // 8 chỗ (choi.css, man-chon.js, man-dau.js, man-goi.js): .mini .g-cy { color }
    xanhLoSang2: '#7ff0ff',            // 7 chỗ (choi.css, cai-dat.js, mo-dau.js, phim-mua-1.js): .pg-tia { background }
    xanhLoSang: '#38c6de',             // 3 chỗ (choi.css, ve.js): .g-cy { --c }
    ngoc: '#9ff0e2',                   // 5 chỗ (choi.css, den-bo-phan.js, man-lap.js): .the-chu.k-cam { color }
    ngocToi2: '#0c4a42',               // 4 chỗ (choi.css): .bk.if { box-shadow }
    ngocToi: '#5ff0ff',                // 3 chỗ (den-bo-phan.js, man-lap.js): banhT: { hinh: ['denBanh'], mau: '#5ff0ff', nhan: 'choi.den.banhT' },
    xam: '#8d95a6',                    // 3 chỗ (choi.css): .g-gy { --c }
    xamToi: '#6a5a6e',                 // 3 chỗ (choi.css): .g-the.khoa,.g-the.sap { --c }
    xamToi2: '#473a4c',                // 3 chỗ (choi.css): .g-the.khoa,.g-the.sap { --lo }
    hong: '#ffb4d4',                   // 5 chỗ (choi.css): .g-pk { --hi }
    hongToi: '#ee5a9c',                // 4 chỗ (choi.css, ve.js): .g-pk { --c }
    hongToi2: '#b02e6c',               // 4 chỗ (choi.css, ve.js): .g-pk { --lo }
    // ---- VECTOR (gói V1, 27/10): bộ vẽ vector theo mẫu hoc/hinh-mau/thu-vector.html (ve-vector*.js). Sân lab trắng, viền chàm, vỏ trắng, đèn cyan
    vecVien: '#2e2a5a',                // viền chàm đậm của mọi hình vector (ô, vật, thân, tay)
    vecVienRgb: '46,42,90',            // bộ ba của vecVien cho bóng đổ rgba(…, a)
    vecVo: '#ffffff',                  // vỏ robot / thùng / cụm tay kẹp: điểm sáng của gradient toả
    vecVoGiua: '#f3f1fc',              // vỏ: giữa gradient
    vecVoToi: '#d9d3f1',               // vỏ: mép gradient
    vecVoGhep: '#c4bbea',              // đường ghép tím nhạt chạy dọc trên vỏ
    vecSan: '#ffffff',                 // ô sàn: góc sáng của gradient chéo
    vecSanToi: '#f1effb',              // ô sàn: góc tối của gradient chéo
    vecSanVien: '#e3dff5',             // ô sàn: viền lưới lavender nhạt
    vecTuong: '#f8f8fc',               // ô tường: đỉnh gradient khối
    vecTuongToi: '#d6d9e6',            // ô tường: đáy gradient khối
    vecTuongVien: '#8b93aa',           // ô tường: viền khối
    vecTuongTrong: '#ffffff',          // ô tường: mặt trên của khối
    vecTuongTrongVien: '#c9cee0',      // ô tường: viền mặt trên
    vecDen: '#22d3ee',                 // dải đèn cyan (tường, bánh xe, chấm cụm tay)
    vecDenSang: '#cffafe',             // vệt sáng của dải đèn / đai thùng
    vecDai: '#38bdf8',                 // đai xanh quanh thùng gỗ (vật 'o')
    vecBanh: '#3b4266',                // bánh xe con nhộng
    vecBanhGach: '#5a6290',            // gạch trên bánh xe
    vecMat: '#e0fbff',                 // hai mắt viên thuốc trên kính
    vecBac: '#cbd5e1',                 // cột cờ bạc
    vecBacSang: '#e0f2fe',             // đỉnh cột cờ
    vecBacToi: '#94a3b8',              // cột ăng-ten
    vecBong: '#d9d4f2',                // đế cờ (vệt bóng dưới chân cột)
    // ---- VECTOR (gói V2, 27/10): ô sân + vật còn lại (ve-vector-o2.js, ve-vector-may.js, ve-vector-vat.js), cùng tông lab trắng
    vecDe: '#1e293b',                  // đế tối của máy (nút đè, nút bắn, băng chuyền, ô sạc, cổng), như mẫu vat-nut
    vecDeSang: '#334155',              // nan băng chuyền, mặt trong đế tối
    vecSat: '#c9ced9',                 // khối sắt / thùng nặng / mái gầm: đỉnh gradient xám bạc
    vecSatToi: '#8f98aa',              // khối sắt: đáy gradient
    vecSatGiua: '#b8bfcc',             // khối sắt: tấm giữa lõm
    vecSatVien: '#7b8496',             // khối sắt: viền tấm giữa
    vecDinh: '#e2e8f0',                // đinh tán
    vecDinhVien: '#5b6478',            // viền đinh tán
    vecCanhBao: '#facc15',             // sọc cảnh báo vàng (xen viền chàm) ở thùng nặng, mái gầm thấp
    vecDo: '#ef4444',                  // đèn / nút đỏ (nút bắn tắt, cửa đóng, băng tắt, dấu ✗)
    vecDoSang: '#fca5a5',              // vệt sáng trên nút đỏ / đèn đỏ đang sáng
    vecXanhLa: '#22c55e',              // đèn / nút xanh (nút bắn bật, nút đè đang đè, cửa mở)
    vecXanhLaSang: '#86efac',          // quầng sáng xanh
    vecVang: '#fbbf24',                // tia chớp ô sạc, đèn nút bắn bật, khung cửa, mũi tên bàn xoay phải, bóng hơi
    vecVangSang: '#fde68a',            // vệt sáng vàng
    vecVangToi: '#d97706',             // mép tối của khung cửa / bóng hơi
    vecNgoc: '#14b8a6',                // mũi tên bàn xoay trái (khác bàn xoay phải màu vàng)
    vecDenToi: '#0891b2',              // khung cửa nhịp (cyan tối)
    vecCong1: '#3b82f6',               // cổng dịch chuyển 1: vòng xanh lam
    vecCong1Sang: '#bfdbfe',           // cổng 1: tia / lõi sáng
    vecCong2: '#a855f7',               // cổng dịch chuyển 2: vòng tím
    vecCong2Sang: '#e9d5ff',           // cổng 2: tia / lõi sáng
    vecHo: '#3b3772',                  // thành hố
    vecHoToi: '#0e0c2b',               // đáy hố
    vecDich: '#f59e0b',                // ô đích: góc khung hổ phách (vàng thuần chìm trên nền trắng)
    vecDichRgb: '245,158,11',          // bộ ba của vecDich (nền ô đích mờ, nét đứt chạy)
    // ---- VECTOR (gói V3, 27/10): thùng nặng tông thép tối riêng; thân / tay / cảm biến robot (ve-vector-than-*.js, ve-vector-tay-*.js, ve-vector-cam.js)
    vecThep: '#5b6b84',                // thùng nặng: đỉnh gradient thép xám xanh đậm (khác khối sắt xám bạc vecSat)
    vecThepToi: '#36425a',             // thùng nặng: đáy gradient, tấm giữa
    vecThepSang: '#a9b6cc',            // thùng nặng: thanh giằng chữ X, vệt sáng mép trên
    vecKhop: '#e7e3f8',                // khớp / đế tay tròn (vỏ trắng ngả lavender: tách khỏi vỏ thân)
    vecTim: '#8b7fd6',                 // cổ tay xoay, cột cần ném (tím lavender đậm, cùng họ vecVoGhep)
    vecLoi: '#0f172a',                 // lòng nòng / lòng ống tối sâu
    vecNuoc: '#3b9cf2',                // NƯỚC của vòi phun (Xe cứu hỏa R1, 29/10; thay làn hơi vecHoi): giọt, tia nước, mực nước trong bình (xanh nước, khác cyan đèn vecDen)
    vecNuocSang: '#c4e6ff',            // nước: vệt sáng trên giọt, ô kính bình nước, miệng vòi đang phun
    vecNuocToi: '#1e6fc4',             // nước: viền giọt, mép tia
    vecNuocRgb: '59,156,242',          // bộ ba của vecNuoc: vệt tia nước mờ dần, vũng nước
    vecHong: '#fb7185',                // thấu kính cảm biến hồng ngoại đang đọc / đèn cần gạt khi chạm (đỏ hồng)
    vecHongToi: '#9f1239',             // thấu kính hồng ngoại lúc tắt (đỏ sẫm)
    vecHongSang: '#fecdd3',            // lõi sáng thấu kính hồng ngoại đang đọc
    vecMauCb: '#c084fc',               // thấu kính cảm biến màu lúc tắt (tím)
    vecMauCbSang: '#f5d0fe',           // cảm biến màu đang đọc: lõi sáng
    vecQuat: '#a5f3fc',                // cánh quạt drone đang quay (đĩa mờ cyan nhạt)
    vecXichMat: '#4b5380',             // mắt xích bánh xích (nhạt hơn vecBanh)
    vecMatSang: '#ffffff',             // mắt camera đang đọc: lõi trắng rực
    vecMatSangRgb: '207,250,254',      // bộ ba quầng sáng quanh mắt camera / ống kính đang đọc
    // ---- VECTOR (gói V4, 27/10): hiệu ứng trên sân bằng vector (ve-vector-hieu-ung.js) — bộ ba rgb cho lớp mờ / quầng của các màu vec đã có
    vecDoRgb: '239,68,68',             // bộ ba của vecDo: chớp đỏ, ô bị chặn / vỡ, vật thả bị chặn
    vecNgon: '#b9c2d6',                // ngón tay kẹp / tay xoay (bạc nhạt): vật trắng trong kẹp nổi rõ
    vecSanChan: '#fbfaff',             // sàn bàn cờ, ô (x + y) chẵn: trắng lab hơi xám (đỉnh gradient chéo)
    vecSanChanToi: '#efedf7',          // sàn ô chẵn: góc tối gradient
    vecSanLe: '#f3f2f9',               // sàn ô lẻ: xám nhạt hơn một bậc
    vecSanLeToi: '#e7e5f0',            // sàn ô lẻ: góc tối gradient
    // ---- VECTOR (gói V5a, 28/10): GIAO DIỆN PHẲNG màn chơi theo diem10code (tin_hoc/public/css/tokens.css), chỉ áp ở body.ve-vector (choi-vector.css)
    vecNen: '#f5f4fc',                 // nền màn hình (lavender rất nhạt, cùng tông sàn sân)
    vecNenSau: '#e8e6f6',              // nền trang ngoài khung 360 × 640 (máy tính), nền điện thoại
    vecThe: '#ffffff',                 // mặt thẻ / nút phụ / hộp thoại (--surface)
    vecTheLom: '#f1f0f9',              // mặt lõm: ô nhập, vùng phụ, đáy khay (--surface-sunken ngả lavender)
    vecChu: '#1e1b4b',                 // chữ chính chàm đậm (indigo-950): 15,9:1 trên trắng
    vecChuRgb: '30,27,75',             // bộ ba của vecChu: lớp phủ chàm mờ sau hộp thoại (#lop-hop)
    vecChuPhu: '#475569',              // chữ phụ (slate-600, --fg-muted): 7,6:1 trên trắng
    vecChuMo: '#5f6d82',               // chữ mờ nhất còn đọc được (slate-550, --fg-faint): 4,8:1 trên nền lõm
    vecKe: '#e2e0f0',                  // viền thường (--stroke ngả lavender)
    vecKeDam: '#c9c5e3',               // viền cần thấy rõ (--stroke-strong ngả lavender)
    vecBongRgb: '15,23,42',            // bộ ba bóng đổ mềm --elev-1 / --elev-2 (slate-900)
    vecBrand: '#4f46e5',               // tím chàm thương hiệu (--brand, indigo-600): nút chính, dòng chọn, vòng focus
    vecBrandDam: '#3730a3',            // tím chàm nhấn (--brand-strong, indigo-800): nút chính khi nhấn, chữ trên nền nhạt
    vecBrandNhat: '#eef2ff',           // nền rất nhạt thương hiệu (--brand-wash)
    vecBrandRgb: '79,70,229',          // bộ ba của vecBrand: bóng nút chính --elev-3, quầng focus
    vecMa: '#eef2f8',                  // nền ô mã (--code-surface)
    vecMaKe: '#d7dfec',                // kẻ / viền ô mã (--code-line)
    vecLa: '#16a34a',                  // xanh lá (đúng, xong): viền, dải màu
    vecLaDam: '#15803d',               // xanh lá đậm: chữ / nền đặc chữ trắng (5,0:1)
    vecLaNhat: '#dcfce7',              // xanh lá nhạt: nền
    vecHoPhach: '#f59e0b',             // hổ phách (nhịp, chờ wait): dải màu, chấm
    vecHoPhachDam: '#b45309',          // hổ phách đậm: chữ / nền đặc chữ trắng (5,0:1)
    vecHoPhachNhat: '#fef3c7',         // hổ phách nhạt: nền toast, dòng đang chạy
    vecLam: '#2563eb',                 // xanh lam (Lại, chân nhện): dải màu
    vecLamDam: '#1d4ed8',              // xanh lam đậm: chữ / nền đặc (6,7:1)
    vecLamNhat: '#eff6ff',             // xanh lam nhạt: nền
    vecTimDam: '#7c3aed',              // tím (vòng lặp for, Gợi ý, ô số range): nền đặc chữ trắng (5,7:1), chữ từ khoá
    vecTimNhat: '#f3e8ff',             // tím nhạt: nền dòng for
    vecLoi: '#e11d48',                 // hồng đỏ báo lỗi (rose-600): viền dòng lỗi, nút xoá
    vecLoiDam: '#b91c1c',              // đỏ đậm: chữ lỗi (--code-err), nền đặc chữ trắng
    vecLoiNhat: '#fff1f2',             // nền lỗi rất nhạt
    vecLoiRgb: '225,29,72',            // bộ ba của vecLoi: quầng chớp đỏ khung code
    vecCyanDam: '#0e7490',             // cyan đậm (lệnh đi move): chữ, nền đặc
    vecCyanNhat: '#ecfeff',            // cyan nhạt: nền khối lệnh đi
    vecCamDam: '#c2410c',              // cam đậm (lệnh tay, chuỗi chữ): chữ, nền đặc
    vecCamNhat: '#fff7ed',             // cam nhạt: nền khối lệnh tay
    vecNgocDam: '#0f766e',             // xanh ngọc đậm (điều kiện if / elif / else): chữ, nền đặc
    vecNgocNhat: '#ccfbf1',            // xanh ngọc nhạt: nền dòng if
    vecHongDam: '#be185d',             // hồng đậm (biến, đếm): chữ, nền đặc
    vecHongNhat: '#fce7f3',            // hồng nhạt: nền khối biến
    vecTroiDam: '#0369a1',             // xanh trời đậm (while): chữ, nền đặc
    vecTroiNhat: '#e0f2fe',            // xanh trời nhạt: nền dòng while
    vecChanhDam: '#4d7c0f',            // xanh chanh đậm (danh sách, trượt slide_): chữ, nền đặc
    vecChanhNhat: '#ecfccb',           // xanh chanh nhạt: nền khối danh sách
    vecHoPhachChu: '#92400e',          // chữ wait() trong dòng code (amber-800): đậm hơn vecHoPhachDam cho đủ 4,5:1 trên nền ô mã vecMa
    vecLaChu: '#166534',               // chữ tên hàm trong dòng code (green-800): vecLaDam trên vecMa chỉ 4,46:1
    vecChanhChu: '#3f6212',            // chữ lệnh trượt / danh sách trong dòng code (lime-800): vecChanhDam trên vecMa chỉ 4,44:1
    // ---- VECTOR (gói V7a, 28/10): dây nối nút ↔ cửa trên sàn (ve-vector-hieu-ung.js dayNoi, san-ve.js veDayNoi)
    vecDayNoiRgb: '108,104,150',       // dây nối lúc tắt: xám chàm trung tính, ghép độ mờ thấp (chìm trên sàn trắng)
    vecDayNoiSangRgb: '34,197,94',     // dây nối lúc nút đè đang bị đè (M): xanh lá như mặt nút đè lún (vecXanhLa)
    // ---- VECTOR (29/10, van hơi): nút bắn N vẽ thành VAN HƠI tay quay trên tường, dây nối N ↔ cửa thành ỐNG HƠI (ve-vector-may.js nut-ban, ve-vector-hieu-ung.js ongHoi / hoiVan)
    vecVanNguoi: '#4f7cac',            // bánh van lúc ĐÓNG: thép xanh nguội (không hơi, không nóng)
    vecVanNguoiToi: '#2f5580',         // nan / vành tối của bánh van đóng
    vecVanNong: '#f97316',             // bánh van lúc MỞ: cam nóng (hơi nóng chảy qua, luật warm())
    vecVanNongSang: '#fdba74',         // quầng / vệt sáng của van mở
    vecOngHoiRgb: '120,134,160',       // ống hơi lúc van đóng: thép xám, ghép độ mờ
    vecOngHoiNongRgb: '249,115,22'     // ống hơi lúc van mở: ấm cam như bánh van mở (vecVanNong)
  };

  // ======================================================================== ĐỘI / SƠN ROBOT (12 sau V7c3; sơn của bộ pixel part.js / cai-dat.js đã xoá): màu đối thủ (ve-vector.js SON_DOI), vạch đế R1..R4 (san-ve.js), màu đội vector. R1 vàng, R2 lam, đối thủ đỏ
  var DOI = {
    sonDo: '#ff5f57',                  // 1 chỗ (part/part.js): vang:['#ffcf30','#ffe888','#d99418'],lam:['#5aa9ff','#b3dcff','#2c62c…
    sonDoToi: '#b8302a',               // 1 chỗ (part/part.js): vang:['#ffcf30','#ffe888','#d99418'],lam:['#5aa9ff','#b3dcff','#2c62c…
    sonTim: '#b07cff',                 // 1 chỗ (part/part.js): vang:['#ffcf30','#ffe888','#d99418'],lam:['#5aa9ff','#b3dcff','#2c62c…
    sonTimToi: '#6f42c1',              // 1 chỗ (part/part.js): vang:['#ffcf30','#ffe888','#d99418'],lam:['#5aa9ff','#b3dcff','#2c62c…
    doiR1Vach: '#ffcf30',              // 1 chỗ (san-ve.js): var MAU_XE = ['#ffcf30', '#5aa9ff', '#ff5f57', '#b07cff']; // màu đế …
    doiR2Vach: '#5aa9ff',              // 1 chỗ (san-ve.js): var MAU_XE = ['#ffcf30', '#5aa9ff', '#ff5f57', '#b07cff']; // màu đế …
    doiR3Vach: '#ff5f57',              // 1 chỗ (san-ve.js): var MAU_XE = ['#ffcf30', '#5aa9ff', '#ff5f57', '#b07cff']; // màu đế …
    doiR4Vach: '#b07cff',              // 1 chỗ (san-ve.js): var MAU_XE = ['#ffcf30', '#5aa9ff', '#ff5f57', '#b07cff']; // màu đế …
    // ---- VECTOR (gói V1): màu đội ở kính + mắt + chấm ăng-ten của robot vector (ve-vector.js, mauDoi). R1 xanh Sola, R2 hồng Luna (hoc/KE-HOACH-GOP-DIEM10CODE.md mục 2c)
    vecDoiR1: '#38bdf8',               // R1: màu chính (đáy kính, chấm ăng-ten)
    vecDoiR1Toi: '#2563eb',            // R1: đỉnh gradient kính
    vecDoiR2: '#f472b6',               // R2: màu chính
    vecDoiR2Toi: '#db2777',            // R2: đỉnh gradient kính
    vecMatR2: '#ffe4f1',               // R2: lõi mắt (R1 dùng vecMat); mắt thường và mắt biểu cảm theo màu đội (29/10 user: mắt R2 không còn xanh)
    vecMatSangR2Rgb: '251,207,232'     // R2: bộ ba quầng sáng quanh mắt (R1 dùng vecMatSangRgb)
  };

  // ======================================================================== LUẬT CHƠI (44 sau V7c3): màu đọc bằng color() / màu vật / ô sàn màu / sơn. Đổi được, nhưng bốn màu đỏ / xanh lá / xanh dương / vàng phải luôn phân biệt rõ với nhau và với nền sân
  var LUAT = {
    luatSonDo: '#df4b4b',              // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonDoSang: '#ff9a8a',          // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonDoToi: '#9a2a24',           // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonXanhLa: '#3fc46a',          // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonXanhLaSang: '#9cf0a8',      // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonXanhLaToi: '#1d7a3a',       // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonXanhDuong: '#4f8dff',       // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonXanhDuongSang: '#a8c8ff',   // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonXanhDuongToi: '#2a54b0',    // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonVang: '#ffcf30',            // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonVangSang: '#ffe888',        // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatSonVangToi: '#c08a10',         // 1 chỗ (part/part-son.js): var MAU={red:['#df4b4b','#ff9a8a','#9a2a24'],green:['#3fc46a','#9cf0a…
    luatVatDo: '#d6493e',              // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatVatDoSang: '#f0847a',          // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatVatDoToi: '#8f2822',           // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatVatXanhLa: '#35c47a',          // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatVatXanhDuong: '#3f7fe0',       // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatVatXanhDuongSang: '#7db0f7',   // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatVatXanhDuongToi: '#22489c',    // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatVatVang: '#efc531',            // 1 chỗ (part/part.js): var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7…
    luatKhungDo: '#ff5a4a',            // 1 chỗ (san-ve.js): var MAU_VIEN = { red: '#ff5a4a', green: '#5fe06a', blue: '#4aa8ff', y…
    luatKhungXanhLa: '#5fe06a',        // 1 chỗ (san-ve.js): var MAU_VIEN = { red: '#ff5a4a', green: '#5fe06a', blue: '#4aa8ff', y…
    luatKhungXanhDuong: '#4aa8ff',     // 1 chỗ (san-ve.js): var MAU_VIEN = { red: '#ff5a4a', green: '#5fe06a', blue: '#4aa8ff', y…
    luatKhungVang: '#ffd23f',          // 1 chỗ (san-ve.js): var MAU_VIEN = { red: '#ff5a4a', green: '#5fe06a', blue: '#4aa8ff', y…
    luatSanDo: '#d6493e',              // 1 chỗ (ve.js): red: { n: '#d6493e', s: '#f0847a', t: '#8f2822', d: '#e9675c', vi: '#…
    luatSanDoSang: '#f0847a',          // 1 chỗ (ve.js): red: { n: '#d6493e', s: '#f0847a', t: '#8f2822', d: '#e9675c', vi: '#…
    luatSanDoToi: '#8f2822',           // 1 chỗ (ve.js): red: { n: '#d6493e', s: '#f0847a', t: '#8f2822', d: '#e9675c', vi: '#…
    luatSanDoDom: '#e9675c',           // 1 chỗ (ve.js): red: { n: '#d6493e', s: '#f0847a', t: '#8f2822', d: '#e9675c', vi: '#…
    luatSanDoVien: '#ff8a7e',          // 1 chỗ (ve.js): red: { n: '#d6493e', s: '#f0847a', t: '#8f2822', d: '#e9675c', vi: '#…
    luatSanXanhLa: '#35c47a',          // 1 chỗ (ve.js): green: { n: '#35c47a', s: '#7cf0aa', t: '#16703f', d: '#52d98e', vi: …
    luatSanXanhLaSang: '#7cf0aa',      // 1 chỗ (ve.js): green: { n: '#35c47a', s: '#7cf0aa', t: '#16703f', d: '#52d98e', vi: …
    luatSanXanhLaToi: '#16703f',       // 1 chỗ (ve.js): green: { n: '#35c47a', s: '#7cf0aa', t: '#16703f', d: '#52d98e', vi: …
    luatSanXanhLaDom: '#52d98e',       // 1 chỗ (ve.js): green: { n: '#35c47a', s: '#7cf0aa', t: '#16703f', d: '#52d98e', vi: …
    luatSanXanhLaVien: '#8dffb8',      // 1 chỗ (ve.js): green: { n: '#35c47a', s: '#7cf0aa', t: '#16703f', d: '#52d98e', vi: …
    luatSanXanhDuong: '#3f7fe0',       // 1 chỗ (ve.js): blue: { n: '#3f7fe0', s: '#7db0f7', t: '#22489c', d: '#5c94ec', vi: '…
    luatSanXanhDuongSang: '#7db0f7',   // 1 chỗ (ve.js): blue: { n: '#3f7fe0', s: '#7db0f7', t: '#22489c', d: '#5c94ec', vi: '…
    luatSanXanhDuongToi: '#22489c',    // 1 chỗ (ve.js): blue: { n: '#3f7fe0', s: '#7db0f7', t: '#22489c', d: '#5c94ec', vi: '…
    luatSanXanhDuongDom: '#5c94ec',    // 1 chỗ (ve.js): blue: { n: '#3f7fe0', s: '#7db0f7', t: '#22489c', d: '#5c94ec', vi: '…
    luatSanXanhDuongVien: '#8fc0ff',   // 1 chỗ (ve.js): blue: { n: '#3f7fe0', s: '#7db0f7', t: '#22489c', d: '#5c94ec', vi: '…
    luatSanVang: '#efc531',            // 1 chỗ (ve.js): yellow: { n: '#efc531', s: '#ffe784', t: '#a07c10', d: '#f7d556', vi:…
    luatSanVangSang: '#ffe784',        // 1 chỗ (ve.js): yellow: { n: '#efc531', s: '#ffe784', t: '#a07c10', d: '#f7d556', vi:…
    luatSanVangToi: '#a07c10',         // 1 chỗ (ve.js): yellow: { n: '#efc531', s: '#ffe784', t: '#a07c10', d: '#f7d556', vi:…
    luatSanVangDom: '#f7d556',         // 1 chỗ (ve.js): yellow: { n: '#efc531', s: '#ffe784', t: '#a07c10', d: '#f7d556', vi:…
    luatSanVangVien: '#ffe45c'        // 1 chỗ (ve.js): yellow: { n: '#efc531', s: '#ffe784', t: '#a07c10', d: '#f7d556', vi:…
  };

  // ======================================================================== BIẾN THỂ VẼ TAY (439 sau V7c3): mã lệch vài đơn vị so với gốc, giữ đúng mã cũ để A1 không đổi điểm ảnh nào
  // [mã cũ, gốc gần nhất]  · "lệch" = khoảng cách RGB tới gốc · gộp được ở A2 (GOP_HET = true)
  var BT = {
    // ~ bang
    bangV1: ['#0a2a1f', 'bang'],                 // lệch 20 · 8 chỗ (choi.css, den-bo-phan.js, man-lap.js, thanh-phan.js): .bh .ham-dem { box-shadow }
    bangV2: ['#0e3a12', 'bang'],                 // lệch 25 · 4 chỗ (choi.css, thanh-phan.js): .chon-so .cs.ptu-them { color }
    bangV3: ['#0e2a14', 'bang'],                 // lệch 28 · 3 chỗ (man-choi.js, man-lap.js, man-so-lenh.js): var ic = h('span', 'ic'); ic.appendChild(Ve.ico(ok ? 'check…
    bangV4: ['#0a3a1f', 'bang'],                 // lệch 13 · 2 chỗ (choi.css): .num.mc-green { box-shadow }
    bangV5: ['#0e3a14', 'bang'],                 // lệch 23 · 2 chỗ (choi.css): .go-sw.bat { color }
    bangV6: ['#2e5a08', 'bang'],                 // lệch 57 · 2 chỗ (choi.css): .num.ptu.them { color }
    bangV7: ['#14561e', 'bang'],                 // lệch 31 · 2 chỗ (man-choi.js, xuong-ham.js): '<button class="bt g-gr cbtn" data-nut="chay"><span data-i=…
    bangV8: ['#16341f', 'bang'],                 // lệch 16 · 1 chỗ (choi.css): .ffr canvas { background }
    bangV9: ['#0d2e22', 'bang'],                 // lệch 15 · 1 chỗ (choi.css): .tc-ray { background }
    bangV10: ['#223d05', 'bang'],                // lệch 43 · 1 chỗ (choi.css): .num.lsten { box-shadow }
    // ~ bangSang
    bangSangV1: ['#14582c', 'bangSang'],         // lệch 26 · 2 chỗ (choi.css): .c-man.trum.done { --lo }
    bangSangV2: ['#16703f', 'bangSang'],         // lệch 24 · 2 chỗ (choi.css): .num.mc-green { box-shadow }
    bangSangV3: ['#22602e', 'bangSang'],         // lệch 23 · 1 chỗ (choi.css): .g-the.xong { --lo }
    bangSangV4: ['#236c50', 'bangSang'],         // lệch 22 · 1 chỗ (choi.css): .cd-son-o.on { background }
    // ~ bangSang2
    bangSang2V1: ['#3f6a0e', 'bangSang2'],       // lệch 55 · 3 chỗ (choi.css): .num.lsten { box-shadow }
    bangSang2V2: ['#1a7a2e', 'bangSang2'],       // lệch 24 · 2 chỗ (choi.css): .strip .fn { color }
    bangSang2V3: ['#2a8a4a', 'bangSang2'],       // lệch 21 · 2 chỗ (choi.css): .c-man.trum.done { --c }
    bangSang2V4: ['#2f7a5c', 'bangSang2'],       // lệch 42 · 1 chỗ (choi.css): .gl::after { background }
    bangSang2V5: ['#3f7d12', 'bangSang2'],       // lệch 43 · 1 chỗ (choi.css): .strip .sl,.keo-dong .sl { color }
    bangSang2V6: ['#5a8e1a', 'bangSang2'],       // lệch 55 · 1 chỗ (choi.css): .brick.ls { --lo }
    bangSang2V7: ['#5f9a1c', 'bangSang2'],       // lệch 61 · 1 chỗ (choi.css): .num.lsten { background }
    bangSang2V8: ['#2b7d5d', 'bangSang2'],       // lệch 42 · 1 chỗ (choi.css): .lr-the.chon { background-color }
    // ~ cam
    camV1: ['#ffb02e', 'cam'],                   // lệch 34 · 2 chỗ (choi.css): .strip.on { background }
    camV2: ['#ff9a3c', 'cam'],                   // lệch 30 · 1 chỗ (choi.css): .c-mh { background }
    camV3: ['#e0a35a', 'cam'],                   // lệch 35 · 1 chỗ (choi.css): .pg-nap { background }
    // ~ camSang
    camSangV1: ['#f0b878', 'camSang'],           // lệch 39 · 2 chỗ (choi.css): .g-wd { --hi }
    camSangV2: ['#d8cdb8', 'camSang'],           // lệch 53 · 2 chỗ (choi.css): .pan .rv { background }
    camSangV3: ['#ffbf80', 'camSang'],           // lệch 26 · 2 chỗ (choi.css): .gl.g-ma { color }
    // ~ camToi
    camToiV1: ['#c98a45', 'camToi'],             // lệch 25 · 3 chỗ (mo-dau.js, phim-mua-1.js): nhun.appendChild(dat(ico('box', 3, '#c98a45'), 6, 0));
    camToiV2: ['#e9a21c', 'camToi'],             // lệch 39 · 2 chỗ (choi.css): .g-am { --c }
    camToiV3: ['#ff9a2e', 'camToi'],             // lệch 37 · 2 chỗ (choi.css): .brick.tay { --c }
    camToiV12: ['#e0a050', 'camToi'],            // lệch 31 · 1 chỗ (xuong-ham.js): vat: { bieu: 'box', mau: '#e0a050', chu: 'xuong.loai.vat', …
    camToiV13: ['#b08860', 'camToi'],            // lệch 61 · 1 chỗ (xuong-ham.js): thung: { bieu: 'thung', mau: '#b08860', chu: 'xuong.loai.th…
    // ~ co
    // ~ coSang
    // ~ coToi
    // ~ den
    denV1: ['#2a1400', 'den'],                   // lệch 15 · 2 chỗ (choi.css): .gl .tg { color }
    denV2: ['#16110c', 'den'],                   // lệch 10 · 1 chỗ (choi.css): body { background }
    denV3: ['#2a2000', 'den'],                   // lệch 22 · 1 chỗ (choi.css): .chon-so .cs.mau-nut.g-yl,.chon-so .cs.mau-nut.g-g { color }
    denV4: ['#101814', 'den'],                   // lệch 22 · 1 chỗ (man-lap.js): return Ve.ico('xu', s || 1, sang ? { fill: '#ffcf30', toi: …
    // ~ do
    doV1: ['#ff4a3c', 'do'],                     // lệch 28 · 5 chỗ (choi.css, ve.js): .strip.err { box-shadow }
    doV2: ['#ff3b30', 'do'],                     // lệch 41 · 4 chỗ (choi.css): 25%,75% { box-shadow }
    doV3: ['#a52a2c', 'do'],                     // lệch 83 · 3 chỗ (choi.css, ve.js): .g-rd { --lo }
    doV4: ['#e03a34', 'do'],                     // lệch 32 · 3 chỗ (choi.css): .bh .del.het { --c }
    doV5: ['#ff6a60', 'do'],                     // lệch 41 · 2 chỗ (choi.css): .toast.bad { background }
    doV6: ['#e0766c', 'do'],                     // lệch 52 · 2 chỗ (choi.css): .strip.err { box-shadow }
    doV7: ['#d6493e', 'do'],                     // lệch 23 · 2 chỗ (choi.css): .num.mc-red { background }
    doV8: ['#ff5a4a', 'do'],                     // lệch 25 · 2 chỗ (thanh-phan.js, ve.js): var m = Ve.mui(b.classList.contains('tin') ? '#4aa0ff' : '#…
    doV9: ['#b0231c', 'do'],                     // lệch 85 · 1 chỗ (choi.css): .bong.loi .bg-td { color }
    doV10: ['#d6342c', 'do'],                    // lệch 45 · 1 chỗ (choi.css): .bh .ham-dem.qua { background }
    doV11: ['#ff5a4e', 'do'],                    // lệch 25 · 1 chỗ (choi.css): 50% { background }
    doV12: ['#e0443c', 'do'],                    // lệch 20 · 1 chỗ (choi.css): .thung.on { background-color }
    doV13: ['#c4413a', 'do'],                    // lệch 42 · 1 chỗ (choi.css): .lr-loi.bad { background }
    doV14: ['#ff4a3d', 'do'],                    // lệch 27 · 1 chỗ (choi.css): .xe-tab.co-loi::after { background }
    doV15: ['#ff5f57', 'do'],                    // lệch 30 · 1 chỗ (choi.css): to { background-image }
    doV16: ['#d04a40', 'do'],                    // lệch 27 · 1 chỗ (man-choi.js): var ic = h('span', 'ic'); ic.appendChild(Ve.ico(ok ? 'check…
    doV18: ['#ff6a5a', 'do'],                    // lệch 38 · 1 chỗ (xuong-ham.js): nut: { bieu: 'nutban', mau: '#ff6a5a', chu: 'xuong.loai.nut…
    // ~ doSang
    doSangV1: ['#ffb0a8', 'doSang'],             // lệch 33 · 4 chỗ (choi.css): .toast.bad { box-shadow }
    doSangV3: ['#ffaaa2', 'doSang'],             // lệch 24 · 2 chỗ (choi.css): .g-rd { --hi }
    doSangV4: ['#f0847a', 'doSang'],             // lệch 35 · 2 chỗ (choi.css): .num.mc-red { box-shadow }
    doSangV5: ['#ff8a80', 'doSang'],             // lệch 23 · 2 chỗ (choi.css, man-choi.js): .tp-muc.khong .tp-dau { color }
    doSangV6: ['#ff7a6a', 'doSang'],             // lệch 50 · 2 chỗ (den-bo-phan.js, man-lap.js): namCham: { hinh: ['denNamCham'], mau: '#ff7a6a', nhan: 'cho…
    doSangV7: ['#f0b4aa', 'doSang'],             // lệch 40 · 1 chỗ (choi.css): .bong.loi { box-shadow }
    doSangV8: ['#ffb4ac', 'doSang'],             // lệch 38 · 1 chỗ (choi.css): .strip.err { background }
    doSangV9: ['#ffc6bf', 'doSang'],             // lệch 64 · 1 chỗ (choi.css): .th-dong.chua { color }
    doSangV10: ['#ffc0b8', 'doSang'],            // lệch 55 · 1 chỗ (choi.css): .keo-bong.keo-dong.bad { background }
    doSangV11: ['#e0b0aa', 'doSang'],            // lệch 46 · 1 chỗ (thanh-phan.js): var ic = h('div', 'thung-ic'); ic.appendChild(Ve.ico('trash…
    // ~ doToi
    doToiV1: ['#8c1a18', 'doToi'],               // lệch 68 · 2 chỗ (choi.css): .bh .del.het { --lo }
    doToiV2: ['#8a1a14', 'doToi'],               // lệch 66 · 2 chỗ (choi.css): .strip.err { box-shadow }
    doToiV3: ['#8f2822', 'doToi'],               // lệch 77 · 2 chỗ (choi.css): .num.mc-red { box-shadow }
    doToiV4: ['#7a1a14', 'doToi'],               // lệch 50 · 1 chỗ (choi.css): .bong.loi { box-shadow }
    doToiV5: ['#6a0e0a', 'doToi'],               // lệch 32 · 1 chỗ (choi.css): .bh .ham-dem.qua { box-shadow }
    doToiV6: ['#9c2a26', 'doToi'],               // lệch 90 · 1 chỗ (choi.css): .thung { background-color }
    doToiV8: ['#5a0e0c', 'doToi'],               // lệch 16 · 1 chỗ (thanh-phan.js): var xi = Ve.ico('x5', 2, { fill: '#fff', line: '#5a0e0c' })…
    doToiV9: ['#3a0806', 'doToi'],               // lệch 18 · 1 chỗ (thanh-phan.js): var ic = h('div', 'thung-ic'); ic.appendChild(Ve.ico('trash…
    // ~ go
    goV1: ['#5a2f08', 'go'],                     // lệch 34 · 5 chỗ (choi.css, xuong-ham.js): .num.chuoi { box-shadow }
    goV2: ['#6a4400', 'go'],                     // lệch 21 · 3 chỗ (man-choi.js, xuong-ham.js): '<button class="bt g-am cbtn" data-nut="nhip"><span data-i=…
    goV3: ['#7c4a20', 'go'],                     // lệch 27 · 2 chỗ (choi.css): .g-wd { --lo }
    goV4: ['#8a5200', 'go'],                     // lệch 31 · 2 chỗ (choi.css): .strip .wt { color }
    goV5: ['#5a4a2a', 'go'],                     // lệch 48 · 2 chỗ (choi.css): .hop-in[readonly] { color }
    goV6: ['#5a4300', 'go'],                     // lệch 35 · 2 chỗ (choi.css): .num.mc-yellow { box-shadow }
    goV9: ['#5a3a1a', 'go'],                     // lệch 36 · 1 chỗ (choi.css): .bong .bg-ch .so { color }
    goV10: ['#5a3a10', 'go'],                    // lệch 33 · 1 chỗ (choi.css): .strip.on .pu { color }
    goV11: ['#5a3a00', 'go'],                    // lệch 34 · 1 chỗ (choi.css): .d-tiep .d-tiep-ten { color }
    goV12: ['#5a3a1e', 'go'],                    // lệch 38 · 1 chỗ (choi.css): .md-san { background }
    // ~ goSang
    goSangV1: ['#d89a1a', 'goSang'],             // lệch 80 · 5 chỗ (choi.css): .c-man.cur { --lo }
    goSangV2: ['#cf8f10', 'goSang'],             // lệch 65 · 4 chỗ (choi.css, ve.js): .g-yl { --lo }
    goSangV3: ['#8e5528', 'goSang'],             // lệch 39 · 4 chỗ (choi.css): .ffr .khung-san { background-color }
    goSangV4: ['#a8651f', 'goSang'],             // lệch 26 · 4 chỗ (choi.css): .gl.g-ma::after { background }
    goSangV5: ['#d99418', 'goSang'],             // lệch 77 · 4 chỗ (choi.css, part/xem-part.html, cai-dat.js): .tc-cuc { box-shadow }
    goSangV6: ['#9c5418', 'goSang'],             // lệch 26 · 3 chỗ (choi.css, ve.js): .g-or { --lo }
    goSangV7: ['#c07a3a', 'goSang'],             // lệch 63 · 3 chỗ (choi.css, ve.js): .g-wd { --c }
    goSangV8: ['#b87638', 'goSang'],             // lệch 56 · 2 chỗ (choi.css): .screen { background-color }
    goSangV9: ['#a96a08', 'goSang'],             // lệch 15 · 2 chỗ (choi.css): .g-am { --lo }
    goSangV10: ['#b87918', 'goSang'],            // lệch 36 · 2 chỗ (choi.css): .plaque::after { background }
    goSangV11: ['#b24a08', 'goSang'],            // lệch 40 · 2 chỗ (choi.css): .strip .ty { color }
    goSangV12: ['#7a6a4a', 'goSang'],            // lệch 72 · 2 chỗ (choi.css): .strip .pu { color }
    goSangV13: ['#a07c10', 'goSang'],            // lệch 20 · 2 chỗ (choi.css): .num.mc-yellow { box-shadow }
    goSangV14: ['#c27a10', 'goSang'],            // lệch 43 · 2 chỗ (man-choi.js, man-lap.js): var so = h('div', 'so'); so.appendChild(Ve.ico('xu', 1, { f…
    goSangV15: ['#8a6a4a', 'goSang'],            // lệch 66 · 1 chỗ (choi.css): .bong .bg-phu { color }
    goSangV16: ['#d77a10', 'goSang'],            // lệch 63 · 1 chỗ (choi.css): .strip.on { box-shadow }
    goSangV17: ['#d9780f', 'goSang'],            // lệch 65 · 1 chỗ (choi.css): .gl.g-tay::after { background }
    goSangV18: ['#c25d08', 'goSang'],            // lệch 42 · 1 chỗ (choi.css): .brick.tay { --lo }
    goSangV39: ['#8a7058', 'goSang'],            // lệch 80 · 1 chỗ (xuong-ham.js): ho: { bieu: 'ho', mau: '#8a7058', chu: 'xuong.loai.ho', goi…
    // ~ goToi
    goToiV1: ['#3a2410', 'goToi'],               // lệch 18 · 4 chỗ (choi.css, man-dau.js, ve.js): .hop { box-shadow }
    goToiV2: ['#2a1a0a', 'goToi'],               // lệch 4 · 4 chỗ (xuong-ham.js): ds: ds.map(function (ma) { return { ma: ma, chu: t(LOAI[ma]…
    goToiV3: ['#4a3114', 'goToi'],               // lệch 39 · 3 chỗ (choi.css): .njb { background }
    goToiV4: ['#3a2200', 'goToi'],               // lệch 22 · 2 chỗ (choi.css, huong-dan.js): .screen>.hd-bong { color }
    goToiV5: ['#3a2a00', 'goToi'],               // lệch 25 · 2 chỗ (choi.css): .num.mc-yellow { color }
    goToiV6: ['#4a2c14', 'goToi'],               // lệch 36 · 1 chỗ (choi.css): body.dien-thoai { background-color }
    goToiV7: ['#3a2400', 'goToi'],               // lệch 23 · 1 chỗ (choi.css): .cbtn.dark { color }
    goToiV8: ['#2a170a', 'goToi'],               // lệch 6 · 1 chỗ (choi.css): .c-bar .seg { background }
    goToiV9: ['#3a1c00', 'goToi'],               // lệch 21 · 1 chỗ (choi.css): .chon-so .cs.ghep-nut { color }
    goToiV10: ['#4a3a2a', 'goToi'],              // lệch 52 · 1 chỗ (choi.css): .xe-tab:not(.on) { background }
    goToiV11: ['#2a1d14', 'goToi'],              // lệch 6 · 1 chỗ (choi.css): .md { background-color }
    goToiV12: ['#3a2412', 'goToi'],              // lệch 18 · 1 chỗ (choi.css): .pg-vet { background }
    goToiV13: ['#4a2a08', 'goToi'],              // lệch 35 · 1 chỗ (man-choi.js): '<button class="bt g-or lap-lai" data-nut="lap-lai" style="…
    // ~ hhCam
    // ~ hhDo
    // ~ hhKem
    // ~ hhLam
    // ~ hhNau
    // ~ hhTim
    // ~ hhTrang
    // ~ hhVang
    // ~ hhXam
    // ~ hhXanhLa
    // ~ hhXanhLo
    // ~ hong
    hongV1: ['#f58ab8', 'hong'],                 // lệch 51 · 2 chỗ (choi.css): .num.bien { box-shadow }
    hongV2: ['#ff7ad9', 'hong'],                 // lệch 58 · 1 chỗ (den-bo-phan.js): son: { hinh: ['denSon'], mau: '#ff7ad9', nhan: 'choi.den.so…
    // ~ hongToi
    hongToiV1: ['#d6478a', 'hongToi'],           // lệch 36 · 2 chỗ (choi.css): .num.bien { background }
    hongToiV2: ['#ff7ab8', 'hongToi'],           // lệch 46 · 1 chỗ (choi.css): .row.dich .strip { box-shadow }
    hongToiV3: ['#ff7ab0', 'hongToi'],           // lệch 41 · 1 chỗ (xuong-ham.js): mau: { bieu: 'mau', mau: '#ff7ab0', chu: 'xuong.loai.mau', …
    // ~ hongToi2
    hongToi2V1: ['#5a1238', 'hongToi2'],         // lệch 104 · 3 chỗ (choi.css, xuong-ham.js): .num.bien { box-shadow }
    hongToi2V2: ['#a62a68', 'hongToi2'],         // lệch 11 · 2 chỗ (choi.css): .num.bien { box-shadow }
    hongToi2V3: ['#c2407f', 'hongToi2'],         // lệch 32 · 2 chỗ (choi.css): .gl.g-bien::after { background }
    hongToi2V4: ['#b01f68', 'hongToi2'],         // lệch 16 · 1 chỗ (choi.css): .strip .vr.dem,.keo-dong .vr.dem { color }
    // ~ kem
    kemV1: ['#fff3a8', 'kem'],                   // lệch 2 · 6 chỗ (choi.css): .c-man.cur { --hi }
    kemV2: ['#ffe6a0', 'kem'],                   // lệch 13 · 4 chỗ (choi.css): .hop-mo .chu { color }
    kemV3: ['#fff09a', 'kem'],                   // lệch 12 · 3 chỗ (choi.css): .g-yl { --hi }
    kemV4: ['#fff3b0', 'kem'],                   // lệch 10 · 3 chỗ (choi.css, huong-dan.js): .screen>.hd-bong { background }
    kemV5: ['#e8dcb0', 'kem'],                   // lệch 33 · 2 chỗ (choi.css): .hop-in[readonly] { background }
    kemV6: ['#ffe9a8', 'kem'],                   // lệch 9 · 2 chỗ (choi.css): .njn { color }
    kemV7: ['#f0d8b0', 'kem'],                   // lệch 32 · 1 chỗ (choi.css): .g-ch { background }
    kemV8: ['#fff6a8', 'kem'],                   // lệch 4 · 1 chỗ (choi.css): .cbtn.nut-pin .pin-so { color }
    kemV9: ['#fff2a8', 'kem'],                   // lệch 2 · 1 chỗ (choi.css): .tc-cuc { box-shadow }
    // ~ kemSang
    kemSangV1: ['#fff6d0', 'kemSang'],           // lệch 7 · 3 chỗ (choi.css): .th-huy .v { color }
    kemSangV2: ['#fff6c0', 'kemSang'],           // lệch 22 · 2 chỗ (choi.css, ve.js): .strip.on { box-shadow }
    kemSangV3: ['#fff3c8', 'kemSang'],           // lệch 14 · 2 chỗ (choi.css): .keo-dong { background }
    kemSangV6: ['#f6e8c0', 'kemSang'],           // lệch 26 · 1 chỗ (choi.css): .strip { background }
    kemSangV7: ['#fff0d0', 'kemSang'],           // lệch 7 · 1 chỗ (choi.css): .g-mota { color }
    kemSangV8: ['#f3e4d0', 'kemSang'],           // lệch 20 · 1 chỗ (choi.css): .so-tab.khoa { color }
    // ~ kemToi
    kemToiV1: ['#ffd9a0', 'kemToi'],             // lệch 24 · 1 chỗ (choi.css): .brick.tay { --hi }
    kemToiV2: ['#ffd0a0', 'kemToi'],             // lệch 16 · 1 chỗ (choi.css): .hop-chu.canh { color }
    // ~ lam
    lamV1: ['#0f2f6a', 'lam'],                   // lệch 36 · 3 chỗ (man-choi.js, xuong-ham.js): '<button class="bt g-bl cbtn" data-nut="lai"><span data-i="…
    lamV2: ['#3b82e0', 'lam'],                   // lệch 116 · 2 chỗ (choi.css): .g-bl { --c }
    lamV3: ['#1f56a8', 'lam'],                   // lệch 41 · 2 chỗ (choi.css): .g-bl { --lo }
    lamV4: ['#1f64a8', 'lam'],                   // lệch 52 · 2 chỗ (choi.css): .c-man.open { --lo }
    lamV5: ['#4a46b0', 'lam'],                   // lệch 61 · 2 chỗ (choi.css): .c-man.trum { --c }
    lamV6: ['#2a2878', 'lam'],                   // lệch 29 · 2 chỗ (choi.css): .c-man.trum { --lo }
    lamV7: ['#3f7fe0', 'lam'],                   // lệch 116 · 2 chỗ (choi.css): .num.mc-blue { background }
    lamV8: ['#0f2a66', 'lam'],                   // lệch 41 · 2 chỗ (choi.css): .num.mc-blue { box-shadow }
    lamV9: ['#22489c', 'lam'],                   // lệch 24 · 2 chỗ (choi.css): .num.mc-blue { box-shadow }
    lamV10: ['#14407a', 'lam'],                  // lệch 19 · 1 chỗ (choi.css): .bong.tin { box-shadow }
    lamV11: ['#1456b0', 'lam'],                  // lệch 48 · 1 chỗ (choi.css): .bong.tin .bg-td { color }
    lamV12: ['#4a6ed0', 'lam'],                  // lệch 99 · 1 chỗ (choi.css): .gl.g-chan::after { background }
    lamV13: ['#2f58c4', 'lam'],                  // lệch 68 · 1 chỗ (choi.css): .brick.chan { --lo }
    lamV14: ['#2a56c8', 'lam'],                  // lệch 69 · 1 chỗ (choi.css): .strip .kw.wh,.keo-dong .kw.wh { color }
    lamV15: ['#2f56bc', 'lam'],                  // lệch 60 · 1 chỗ (choi.css): .brick.wh { --lo }
    // ~ lamSang
    lamSangV1: ['#9cc6ff', 'lamSang'],           // lệch 56 · 2 chỗ (choi.css): .g-bl { --hi }
    lamSangV2: ['#d0d6e4', 'lamSang'],           // lệch 28 · 2 chỗ (choi.css): .g-gy { --hi }
    lamSangV3: ['#a4d6ff', 'lamSang'],           // lệch 54 · 2 chỗ (choi.css): .c-man.open { --hi }
    lamSangV4: ['#7f7be0', 'lamSang'],           // lệch 100 · 2 chỗ (choi.css): .c-man.trum { --hi }
    lamSangV5: ['#b4ccff', 'lamSang'],           // lệch 45 · 2 chỗ (choi.css): .gl.g-chan { color }
    lamSangV6: ['#6f96f2', 'lamSang'],           // lệch 99 · 2 chỗ (choi.css): .bk.wh { background }
    lamSangV7: ['#bcd0ff', 'lamSang'],           // lệch 44 · 2 chỗ (choi.css): .bk.wh { box-shadow }
    lamSangV8: ['#7db0f7', 'lamSang'],           // lệch 79 · 2 chỗ (choi.css): .num.mc-blue { box-shadow }
    lamSangV9: ['#c3cad8', 'lamSang'],           // lệch 6 · 2 chỗ (choi.css): .num.mc-none { box-shadow }
    lamSangV10: ['#8fb4ff', 'lamSang'],          // lệch 68 · 2 chỗ (den-bo-phan.js): chan: { hinh: ['denChan'], mau: '#8fb4ff', nhan: 'choi.den.…
    lamSangV12: ['#9aaabb', 'lamSang'],          // lệch 53 · 2 chỗ (xuong-ham.js): gam: { bieu: 'gam', mau: '#9aaabb', chu: 'xuong.loai.gam', …
    lamSangV13: ['#a8d0f0', 'lamSang'],          // lệch 38 · 1 chỗ (choi.css): .bong.tin { box-shadow }
    lamSangV14: ['#5b8cff', 'lamSang'],          // lệch 124 · 1 chỗ (choi.css): .brick.chan { --c }
    lamSangV15: ['#a9c0f0', 'lamSang'],          // lệch 37 · 1 chỗ (choi.css): .strip.wh:not(.on):not(.err) { box-shadow }
    lamSangV16: ['#5b86f4', 'lamSang'],          // lệch 124 · 1 chỗ (choi.css): .brick.wh { --c }
    lamSangV17: ['#9aa6bd', 'lamSang'],          // lệch 55 · 1 chỗ (choi.css): .strip .num.dkm.op,.strip .num.dkm.noi { box-shadow }
    lamSangV18: ['#9fd3ff', 'lamSang'],          // lệch 56 · 1 chỗ (choi.css): .md-mua { background-image }
    lamSangV19: ['#5aa9ff', 'lamSang'],          // lệch 114 · 1 chỗ (choi.css): .pg-ten.pg-ten-r2 { background }
    lamSangV20: ['#b5bccb', 'lamSang'],          // lệch 17 · 1 chỗ (choi.css): .pg-cua-lon { box-shadow }
    lamSangV24: ['#4aa0ff', 'lamSang'],          // lệch 131 · 1 chỗ (thanh-phan.js): var m = Ve.mui(b.classList.contains('tin') ? '#4aa0ff' : '#…
    lamSangV25: ['#b0b8c8', 'lamSang'],          // lệch 24 · 1 chỗ (xuong-ham.js): tuong: { bieu: 'wall', mau: '#b0b8c8', chu: 'xuong.loai.tuo…
    // ~ lamToi
    lamToiV2: ['#3d4658', 'lamToi'],             // lệch 60 · 1 chỗ (choi.css): .strip .num.dkm.op,.strip .num.dkm.noi { box-shadow }
    // ~ moDoToi
    moDoToiV1: ['rgba(230,30,20,.42)', 'moDoToi'], // lệch 50 · 1 chỗ (san-ve.js): if (o.ket) { g.fillStyle = 'rgba(230,30,20,.42)'; g.fillRec…
    // ~ moSang
    moSangV1: ['rgba(255,255,255,.4)', 'moSang'], // lệch 34 · 6 chỗ (choi.css): .cbtn.dark { text-shadow }
    moSangV2: ['rgba(255,255,255,.55)', 'moSang'], // lệch 4 · 2 chỗ (choi.css): .strip.slot { box-shadow }
    moSangV3: ['rgba(255,255,255,.45)', 'moSang'], // lệch 21 · 2 chỗ (choi.css, san-ve.js): .xe-tab { box-shadow }
    moSangV4: ['rgba(255,240,180,.85)', 'moSang'], // lệch 111 · 1 chỗ (choi.css): .pg-anh { background }
    moSangV6: ['rgba(255,246,227,.6)', 'moSang'], // lệch 34 · 1 chỗ (san-ve.js): g.save(); g.setLineDash([2, 2]); g.strokeStyle = 'rgba(255,…
    moSangV7: ['rgba(255,246,227,.7)', 'moSang'], // lệch 52 · 1 chỗ (san-ve.js): g.save(); g.strokeStyle = 'rgba(255,246,227,.7)'; g.lineWid…
    moSangV8: ['rgba(255,246,227,.85)', 'moSang'], // lệch 86 · 1 chỗ (san-ve.js): g.fillStyle = 'rgba(255,246,227,.85)';
    // ~ moSangSang
    moSangSangV1: ['rgba(255,255,255,.35)', 'moSangSang'], // lệch 38 · 3 chỗ (choi.css, san-ve.js): .go-sw.bat { text-shadow }
    moSangSangV2: ['#ffffff06', 'moSangSang'],   // lệch 45 · 2 chỗ (choi.css): body { background-image }
    moSangSangV3: ['rgba(255,255,255,.18)', 'moSangSang'], // lệch 5 · 2 chỗ (choi.css): .lr-the.chon { box-shadow }
    moSangSangV4: ['rgba(255,255,255,.12)', 'moSangSang'], // lệch 20 · 2 chỗ (choi.css): .th-cach-dong { border-top }
    moSangSangV5: ['rgba(255,240,180,0)', 'moSangSang'], // lệch 92 · 2 chỗ (choi.css): .pg-anh { background }
    moSangSangV6: ['rgba(255,255,255,.06)', 'moSangSang'], // lệch 36 · 1 chỗ (choi.css): .gl .nb { background }
    moSangSangV7: ['rgba(255,255,255,.25)', 'moSangSang'], // lệch 13 · 1 chỗ (choi.css): .gl .nb:active { background }
    moSangSangV8: ['rgba(255,255,255,.05)', 'moSangSang'], // lệch 38 · 1 chỗ (choi.css): .pal .nk { background }
    moSangSangV9: ['rgba(255,255,255,.10)', 'moSangSang'], // lệch 26 · 1 chỗ (choi.css): .lr-the { box-shadow }
    // ~ moToi
    moToiV1: ['rgba(0,0,0,.45)', 'moToi'],       // lệch 13 · 14 chỗ (choi.css): .back { text-shadow }
    moToiV2: ['#0004', 'moToi'],                 // lệch 34 · 8 chỗ (choi.css): .bt { box-shadow }
    moToiV3: ['rgba(0,0,0,.28)', 'moToi'],       // lệch 31 · 8 chỗ (choi.css): .chalk { box-shadow }
    moToiV4: ['rgba(0,0,0,.35)', 'moToi'],       // lệch 13 · 7 chỗ (choi.css): .brick .ed { box-shadow }
    moToiV5: ['rgba(0,0,0,.25)', 'moToi'],       // lệch 38 · 7 chỗ (choi.css): .g-so { box-shadow }
    moToiV6: ['rgba(0,0,0,.3)', 'moToi'],        // lệch 26 · 4 chỗ (choi.css, ve-robot.js): .g-dong { background }
    moToiV7: ['rgba(0,0,0,.22)', 'moToi'],       // lệch 46 · 3 chỗ (choi.css): .deco .surf { box-shadow }
    moToiV8: ['rgba(0,0,0,.5)', 'moToi'],        // lệch 25 · 3 chỗ (choi.css): .thung-chu { text-shadow }
    moToiV9: ['rgba(0,0,0,.38)', 'moToi'],       // lệch 5 · 2 chỗ (choi.css): .deco .surf { box-shadow }
    moToiV10: ['rgba(0,0,0,.32)', 'moToi'],      // lệch 20 · 1 chỗ (choi.css): .bh .ham-dem { background }
    moToiV11: ['rgba(0,40,10,.28)', 'moToi'],    // lệch 51 · 1 chỗ (choi.css): .brick .ed { background }
    moToiV12: ['rgba(0,0,0,.1)', 'moToi'],       // lệch 77 · 1 chỗ (choi.css): .g-the { background-image }
    moToiV13: ['rgba(0,0,0,.12)', 'moToi'],      // lệch 71 · 1 chỗ (choi.css): .thung { background-image }
    moToiV14: ['rgba(0,0,0,0)', 'moToi'],        // lệch 102 · 1 chỗ (choi.css): .thung { background-image }
    moToiV15: ['rgba(0,0,0,.18)', 'moToi'],      // lệch 56 · 1 chỗ (choi.css): .so-the.chua { background }
    moToiV16: ['rgba(0,0,0,.55)', 'moToi'],      // lệch 38 · 1 chỗ (choi.css): .cbtn.g-am,.mini .g-te { text-shadow }
    moToiV17: ['rgba(0,0,0,.24)', 'moToi'],      // lệch 41 · 1 chỗ (choi.css): .lr-robot { background }
    moToiV18: ['rgba(0,0,0,.26)', 'moToi'],      // lệch 36 · 1 chỗ (choi.css): .lr-san { background }
    moToiV19: ['rgba(0,0,0,.2)', 'moToi'],       // lệch 51 · 1 chỗ (choi.css): .tp-muc { background }
    moToiV24: ['rgba(0,28,10,.3)', 'moToi'],     // lệch 39 · 1 chỗ (san-ve.js): g.fillStyle = 'rgba(0,28,10,.3)'; g.fillRect(x - 2, y + 4, …
    // ~ moToiSang
    moToiSangV1: ['rgba(40,20,6,.45)', 'moToiSang'], // lệch 28 · 1 chỗ (choi.css): .top .stars { background }
    moToiSangV2: ['rgba(70,25,0,.3)', 'moToiSang'], // lệch 67 · 1 chỗ (choi.css): .brick.or .ed { background }
    moToiSangV3: ['rgba(50,30,0,.42)', 'moToiSang'], // lệch 34 · 1 chỗ (choi.css): .brick .ed.khoa { background }
    moToiSangV4: ['rgba(14,8,3,.66)', 'moToiSang'], // lệch 49 · 1 chỗ (choi.css): #lop-hop { background }
    moToiSangV5: ['rgba(40,20,6,.5)', 'moToiSang'], // lệch 17 · 1 chỗ (choi.css): .d-sao,.g-tong,.c-saog { background }
    moToiSangV6: ['rgba(40,20,6,.42)', 'moToiSang'], // lệch 35 · 1 chỗ (choi.css): .c-bia { background }
    moToiSangV7: ['rgba(14,8,3,.55)', 'moToiSang'], // lệch 40 · 1 chỗ (choi.css): .md::before { background }
    // ~ moVang
    moVangV1: ['rgba(255,217,90,.25)', 'moVang'], // lệch 23 · 1 chỗ (choi.css): .strip.slot { box-shadow }
    moVangV2: ['rgba(255,217,90,.18)', 'moVang'], // lệch 5 · 1 chỗ (choi.css): .lr-loi.canh { background }
    moVangV3: ['rgba(255,217,90,.3)', 'moVang'], // lệch 36 · 1 chỗ (san-ve.js): g.fillStyle = k.hopLe ? 'rgba(255,217,90,.3)' : 'rgba(255,6…
    // ~ moVangSang
    moVangSangV1: ['rgba(255,217,90,.95)', 'moVangSang'], // lệch 64 · 1 chỗ (choi.css): .canh-bao { background }
    // ~ ngoc
    ngocV1: ['#d4f4ee', 'ngoc'],                 // lệch 54 · 2 chỗ (choi.css): .strip.if:not(.on):not(.err) { background }
    ngocV2: ['#bdfaff', 'ngoc'],                 // lệch 43 · 1 chỗ (choi.css): .den.sang { box-shadow }
    ngocV3: ['#9fddd0', 'ngoc'],                 // lệch 26 · 1 chỗ (choi.css): .strip.if:not(.on):not(.err) { box-shadow }
    ngocV4: ['#a8f2e6', 'ngoc'],                 // lệch 10 · 1 chỗ (choi.css): .bk.if { box-shadow }
    // ~ ngocToi
    ngocToiV1: ['#4fd6c4', 'ngocToi'],           // lệch 66 · 2 chỗ (choi.css): .bk.if { background }
    ngocToiV2: ['#2fc2ad', 'ngocToi'],           // lệch 106 · 1 chỗ (choi.css): .brick.dk { --c }
    // ~ ngocToi2
    ngocToi2V1: ['#123f30', 'ngocToi2'],         // lệch 22 · 2 chỗ (choi.css): .gt-hinh.chalk { background-color }
    ngocToi2V2: ['#12382c', 'ngocToi2'],         // lệch 29 · 1 chỗ (choi.css): .den { background }
    ngocToi2V3: ['#1fa08f', 'ngocToi2'],         // lệch 117 · 1 chỗ (choi.css): .gl.g-dk::after { background }
    ngocToi2V4: ['#128474', 'ngocToi2'],         // lệch 77 · 1 chỗ (choi.css): .brick.dk { --lo }
    ngocToi2V5: ['#0c7a6e', 'ngocToi2'],         // lệch 65 · 1 chỗ (choi.css): .strip .kw.if,.keo-dong .kw.if { color }
    // ~ robotCam
    // ~ robotCamToi
    // ~ robotDo
    // ~ robotLam
    // ~ robotLamToi
    // ~ robotNau
    // ~ robotNauSang
    // ~ robotNgoc
    // ~ robotTim
    // ~ robotTimSang
    // ~ robotTrang
    // ~ robotVangSang
    // ~ robotXam
    // ~ robotXamToi
    // ~ robotXanhLa
    // ~ robotXanhLo
    // ~ robotXanhLoToi
    // ~ sanCam
    sanCamV1: ['#f2c98a', 'sanCam'],             // lệch 31 · 2 chỗ (san-ve.js, ve.js): var cols = s.tren.indexOf('rao') >= 0 ? ['#e8b574', '#fff6e…
    // ~ sanCamToi
    // ~ sanDen
    // ~ sanDo
    sanDoV1: ['#ff3b30', 'sanDo'],               // lệch 40 · 2 chỗ (san-ve.js): g.save(); g.strokeStyle = hinh[y][x] ? MAU_VIEN[hinh[y][x]]…
    // ~ sanDoSang
    sanDoSangV3: ['#ff9a8e', 'sanDoSang'],       // lệch 39 · 1 chỗ (san-ve.js): var mau = s.cuc === 'N' ? ['#ff9a8e', '#ffd9d2', '#ffffff']…
    sanDoSangV4: ['#ffd9d2', 'sanDoSang'],       // lệch 131 · 1 chỗ (san-ve.js): var mau = s.cuc === 'N' ? ['#ff9a8e', '#ffd9d2', '#ffffff']…
    // ~ sanKem
    sanKemV2: ['#fff09a', 'sanKem'],             // lệch 15 · 1 chỗ (san-ve.js): this.burst(o.x * T + 7, o.y * T + 7, 8, ['#ffd23f', '#fff6e…
    // ~ sanKemToi
    // ~ sanLam
    sanLamV1: ['#c9cedb', 'sanLam'],             // lệch 14 · 3 chỗ (san-ve.js): if (v.dr && v.dr.roi && ok && Math.random() < 0.1) this.bur…
    sanLamV2: ['#7fb0f2', 'sanLam'],             // lệch 91 · 3 chỗ (san-ve.js, ve.js): var cols = s.tren.indexOf('rao') >= 0 ? ['#e8b574', '#fff6e…
    sanLamV3: ['#aab3c4', 'sanLam'],             // lệch 61 · 2 chỗ (san-ve.js): var col = chan ? '#aab3c4' : this.mauHien(d.mau), nhay = u …
    sanLamV4: ['#d8dfeb', 'sanLam'],             // lệch 14 · 2 chỗ (san-ve.js): mauHien: function (mau) { return Ve.MAU[mau] ? Ve.MAU[mau].…
    sanLamV5: ['#bcd6ff', 'sanLam'],             // lệch 34 · 2 chỗ (san-ve.js, ve.js): var cols = s.tren.indexOf('rao') >= 0 ? ['#e8b574', '#fff6e…
    sanLamV6: ['#dcecfa', 'sanLam'],             // lệch 33 · 2 chỗ (san-ve.js): var cols = o && o.chat === 'sat' ? ['#7f97b2', '#dcecfa', '…
    sanLamV7: ['#a9c0d8', 'sanLam'],             // lệch 46 · 2 chỗ (san-ve.js): var cols = o && o.chat === 'sat' ? ['#7f97b2', '#dcecfa', '…
    sanLamV12: ['#8fbaff', 'sanLam'],            // lệch 76 · 1 chỗ (san-ve.js): var mau = s.cuc === 'N' ? ['#ff9a8e', '#ffd9d2', '#ffffff']…
    sanLamV13: ['#d6e6ff', 'sanLam'],            // lệch 32 · 1 chỗ (san-ve.js): var mau = s.cuc === 'N' ? ['#ff9a8e', '#ffd9d2', '#ffffff']…
    sanLamV14: ['#cfe9ff', 'sanLam'],            // lệch 33 · 1 chỗ (san-ve.js): if (Math.random() < 0.55) self.burst(o.nb.px, o.nb.py - o.n…
    sanLamV15: ['#7f97b2', 'sanLam'],            // lệch 114 · 1 chỗ (san-ve.js): var cols = o && o.chat === 'sat' ? ['#7f97b2', '#dcecfa', '…
    // ~ sanLamToi
    sanLamToiV6: ['#3f536c', 'sanLamToi'],       // lệch 54 · 1 chỗ (san-ve.js): var cols = o && o.chat === 'sat' ? ['#7f97b2', '#dcecfa', '…
    // ~ sanNau
    sanNauV1: ['#5a3a14', 'sanNau'],             // lệch 20 · 4 chỗ (san-ve.js, ve.js): var cols = o && o.chat === 'sat' ? ['#7f97b2', '#dcecfa', '…
    // ~ sanNauSang
    sanNauSangV2: ['#a8742f', 'sanNauSang'],     // lệch 41 · 2 chỗ (san-ve.js, ve.js): this.burst(s.o.x * T + 7, s.o.y * T + 7, 8, ['#a8742f', '#5…
    // ~ sanTim
    // ~ sanTimSang
    sanTimSangV1: ['#a84cff', 'sanTimSang'],     // lệch 130 · 2 chỗ (san-ve.js, ve.js): var mCong = s.cong === '2' ? ['#f0b8ff', '#a84cff', '#fffff…
    // ~ sanTrang
    sanTrangV1: ['#ffffff', 'sanTrang'],         // lệch 29 · 39 chỗ (san-ve.js, ve.js): g.globalAlpha = 0.35 * a; g.fillStyle = '#ffffff'; g.fillRe…
    sanTrangV2: ['#f4f9ff', 'sanTrang'],         // lệch 30 · 3 chỗ (san-ve.js, ve.js): var cols = s.tren.indexOf('rao') >= 0 ? ['#e8b574', '#fff6e…
    sanTrangV3: ['#dff3ff', 'sanTrang'],         // lệch 43 · 2 chỗ (san-ve.js): if (Math.random() < 0.7) self.burst(o.bay.x * T + 7 - (x1 -…
    sanTrangV5: ['#eafcff', 'sanTrang'],         // lệch 36 · 1 chỗ (san-ve.js): this.parts.push({ x: x, y: y, vx: dx * v - dy * ng, vy: dy …
    // ~ sanVang
    sanVangV1: ['#ffe14a', 'sanVang'],           // lệch 19 · 8 chỗ (san-ve.js): var M = ['..XXX..', '.XwyyX.', 'XwyyyyX', 'XyyyyyX', 'Xyyyy…
    sanVangV2: ['#ffd95a', 'sanVang'],           // lệch 28 · 5 chỗ (san-ve.js): if (Math.random() < 0.4) self.burst(v.x * T + 11, v.y * T +…
    sanVangV3: ['#ffd04d', 'sanVang'],           // lệch 14 · 4 chỗ (san-ve.js, ve.js): self.burst(nd.o.x * T + 7, nd.o.y * T + 7, 5, nd.bat ? ['#7…
    sanVangV4: ['#f2b533', 'sanVang'],           // lệch 34 · 3 chỗ (san-ve.js, ve.js): this.burst(tx + dx * 2, ty + dy * 2, 9, ['#ffe27a', '#fffff…
    sanVangV5: ['#ffe84a', 'sanVang'],           // lệch 25 · 2 chỗ (san-ve.js, ve.js): if (Math.random() < 0.6) self.burst(cx + (Math.random() - 0…
    sanVangV6: ['#ffcf30', 'sanVang'],           // lệch 15 · 1 chỗ (san-ve.js): this.burst(cx, cy, 16, ['#6b707c', '#9aa0ae', '#c9cedb', '#…
    // ~ sanVangSang
    sanVangSangV1: ['#d8c8a0', 'sanVangSang'],   // lệch 60 · 2 chỗ (san-ve.js): if (k > 0.25 && k < 0.55 && Math.random() < 0.5) self.burst…
    // ~ sanXam
    sanXamV1: ['#9ba3b4', 'sanXam'],             // lệch 88 · 3 chỗ (san-ve.js): this.burst(tx, ty + 2, 5, ['#d0d6e4', '#ffffff', '#9ba3b4']…
    // ~ sanXamToi
    sanXamToiV1: ['#9aa0ae', 'sanXamToi'],       // lệch 84 · 3 chỗ (san-ve.js): if (v.dr && v.dr.roi && ok && Math.random() < 0.1) this.bur…
    sanXamToiV3: ['#9a8a86', 'sanXamToi'],       // lệch 55 · 2 chỗ (san-ve.js): g.fillStyle = het ? '#9a8a86' : '#ffe14a'; g.fillRect(x + 2…
    // ~ sanXanhLa
    // ~ sanXanhLaToi
    sanXanhLaToiV2: ['#6fe06a', 'sanXanhLaToi'], // lệch 44 · 2 chỗ (san-ve.js): var cols = ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6…
    // ~ sanXanhLo
    sanXanhLoV1: ['#58dcff', 'sanXanhLo'],       // lệch 44 · 3 chỗ (san-ve.js, ve.js): this.burst(v.x * T + 7, v.y * T + 7, 5, s.huong > 0 ? ['#ff…
    sanXanhLoV2: ['#8fd8ff', 'sanXanhLo'],       // lệch 29 · 2 chỗ (san-ve.js): if (Math.random() < 0.7) self.burst(o.bay.x * T + 7 - (x1 -…
    sanXanhLoV3: ['#d8f6ff', 'sanXanhLo'],       // lệch 89 · 2 chỗ (san-ve.js): this.parts.push({ x: x, y: y, vx: dx * v - dy * ng, vy: dy …
    sanXanhLoV4: ['#7fe8ff', 'sanXanhLo'],       // lệch 8 · 2 chỗ (san-ve.js): if (Math.random() < 0.4) self.burst(v.x * T + (s.huong < 0 …
    sanXanhLoV5: ['#9cf0ff', 'sanXanhLo'],       // lệch 29 · 2 chỗ (san-ve.js, ve.js): var mCong = s.cong === '2' ? ['#f0b8ff', '#a84cff', '#fffff…
    // ~ sanXanhLoToi
    sanXanhLoToiV1: ['#38c6de', 'sanXanhLoToi'], // lệch 75 · 3 chỗ (san-ve.js, ve.js): var cols = ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6…
    sanXanhLoToiV2: ['#26a8f0', 'sanXanhLoToi'], // lệch 67 · 2 chỗ (san-ve.js, ve.js): var mCong = s.cong === '2' ? ['#f0b8ff', '#a84cff', '#fffff…
    // ~ tiaCamRgb
    tiaCamV1Rgb: ['255,140,40', 'tiaCamRgb'],    // lệch 67 · 1 chỗ (san-ve.js): var rgb = nong ? '255,140,40' : '255,58,48';
    tiaCamV2Rgb: ['255,170,60', 'tiaCamRgb'],    // lệch 70 · 1 chỗ (san-ve.js): g.strokeStyle = 'rgba(255,170,60,' + (0.9 * a).toFixed(3) +…
    tiaCamV3Rgb: ['255,110,40', 'tiaCamRgb'],    // lệch 71 · 1 chỗ (san-ve.js): g.strokeStyle = 'rgba(255,110,40,' + (0.35 + 0.4 * th).toFi…
    tiaCamV4Rgb: ['255,170,80', 'tiaCamRgb'],    // lệch 70 · 1 chỗ (san-ve.js): g.strokeStyle = 'rgba(255,170,80,' + (0.5 + 0.3 * th).toFix…
    tiaCamV5Rgb: ['182,168,150', 'tiaCamRgb'],   // lệch 86 · 1 chỗ (san-ve.js): g.strokeStyle = (go ? 'rgba(182,168,150,' : 'rgba(' + rgb +…
    // ~ tiaDoRgb
    tiaDoV2Rgb: ['255,40,30', 'tiaDoRgb'],       // lệch 119 · 2 chỗ (san-ve.js, ve.js): g.fillStyle = 'rgba(255,40,30,' + nhay.toFixed(2) + ')'; g.…
    tiaDoV3Rgb: ['255,74,60', 'tiaDoRgb'],       // lệch 74 · 1 chỗ (san-ve.js): var d = ds[i], u = (now - d.t0) / d.ms, a = u < 0.55 ? 1 : …
    tiaDoV4Rgb: ['255,58,48', 'tiaDoRgb'],       // lệch 93 · 1 chỗ (san-ve.js): var rgb = nong ? '255,140,40' : '255,58,48';
    tiaDoV5Rgb: ['255,90,70', 'tiaDoRgb'],       // lệch 55 · 1 chỗ (san-ve.js): g.fillStyle = 'rgba(255,90,70,' + a.toFixed(3) + ')'; g.fil…
    tiaDoV7Rgb: ['255,226,218', 'tiaDoRgb'],     // lệch 146 · 1 chỗ (san-ve.js): var cuc = nc.cuc, rgb = cuc === 'N' ? '255,126,112' : cuc =…
    tiaDoV8Rgb: ['255,60,48', 'tiaDoRgb'],       // lệch 92 · 1 chỗ (san-ve.js): g.save(); g.strokeStyle = 'rgba(255,60,48,' + Math.min(1, d…
    // ~ tiaKemRgb
    tiaKemV1Rgb: ['235,225,205', 'tiaKemRgb'],   // lệch 47 · 1 chỗ (san-ve.js): g.strokeStyle = (go ? 'rgba(235,225,205,' : 'rgba(' + rgb2 …
    // ~ tiaLamRgb
    tiaLamV1Rgb: ['150,176,206', 'tiaLamRgb'],   // lệch 57 · 1 chỗ (san-ve.js): var rgb = sat ? '226,238,252' : go ? '196,134,72' : nch ? (…
    // ~ tiaTrangRgb
    tiaTrangV1Rgb: ['226,238,252', 'tiaTrangRgb'], // lệch 34 · 1 chỗ (san-ve.js): var rgb = sat ? '226,238,252' : go ? '196,134,72' : nch ? (…
    tiaTrangV2Rgb: ['222,238,255', 'tiaTrangRgb'], // lệch 37 · 1 chỗ (san-ve.js): var cuc = nc.cuc, rgb = cuc === 'N' ? '255,126,112' : cuc =…
    tiaTrangV3Rgb: ['235,250,255', 'tiaTrangRgb'], // lệch 21 · 1 chỗ (san-ve.js): var cuc = nc.cuc, rgb = cuc === 'N' ? '255,126,112' : cuc =…
    // ~ tiaVangRgb
    tiaVangV1Rgb: ['255,236,150', 'tiaVangRgb'], // lệch 34 · 1 chỗ (san-ve.js): if (k >= 0 && k < 1) { vien(4 + Math.round(k * 3), 'rgba(25…
    // ~ tiaXanhLoRgb
    tiaXanhLoV1Rgb: ['150,222,255', 'tiaXanhLoRgb'], // lệch 29 · 2 chỗ (san-ve.js): var co = this.vatDinh(), i, rgbT = nc.cuc === 'N' ? '255,12…
    tiaXanhLoV2Rgb: ['140,220,255', 'tiaXanhLoRgb'], // lệch 24 · 1 chỗ (san-ve.js): g.fillStyle = 'rgba(140,220,255,' + a.toFixed(3) + ')'; g.f…
    tiaXanhLoV3Rgb: ['200,236,255', 'tiaXanhLoRgb'], // lệch 73 · 1 chỗ (san-ve.js): g.strokeStyle = 'rgba(200,236,255,' + (0.35 + 0.35 * Math.a…
    tiaXanhLoV4Rgb: ['15,40,52', 'tiaXanhLoRgb'], // lệch 306 · 1 chỗ (san-ve.js): g.fillStyle = 'rgba(15,40,52,' + (0.85 * Math.min(1, a2 + 0…
    tiaXanhLoV5Rgb: ['214,250,255', 'tiaXanhLoRgb'], // lệch 88 · 1 chỗ (san-ve.js): g.font = '8px VT323, monospace'; g.textAlign = 'center'; g.…
    // ~ tim
    timV1: ['#d9b8ff', 'tim'],                   // lệch 12 · 2 chỗ (choi.css): .bh .tt.code { color }
    timV2: ['#b98cf5', 'tim'],                   // lệch 65 · 2 chỗ (choi.css): .num { box-shadow }
    timV3: ['#b48cf0', 'tim'],                   // lệch 69 · 2 chỗ (choi.css): .bk { background }
    timV4: ['#e8dafc', 'tim'],                   // lệch 27 · 1 chỗ (choi.css): .strip.for { background }
    timV5: ['#c7afeb', 'tim'],                   // lệch 34 · 1 chỗ (choi.css): .strip.for { box-shadow }
    timV6: ['#d8c8dc', 'tim'],                   // lệch 35 · 1 chỗ (choi.css): .go-man.khoa { color }
    timV7: ['#b07cff', 'tim'],                   // lệch 83 · 1 chỗ (phim-mua-1.js): vy.appendChild(c.ico('denXoay', 3, '#b07cff')); vx.appendCh…
    // ~ timToi
    timToiV1: ['#a070e6', 'timToi'],             // lệch 88 · 3 chỗ (choi.css, ve.js): .g-pu { --c }
    timToiV2: ['#8a4fd8', 'timToi'],             // lệch 51 · 3 chỗ (choi.css): .num { background }
    timToiV3: ['#5a2fb4', 'timToi'],             // lệch 23 · 2 chỗ (choi.css): .bong.goi .bg-td { color }
    timToiV4: ['#9a2fb0', 'timToi'],             // lệch 51 · 2 chỗ (choi.css): .strip .ar { color }
    timToiV5: ['#7a3fc4', 'timToi'],             // lệch 23 · 2 chỗ (choi.css): .strip .kw { color }
    timToiV6: ['#9b5fe6', 'timToi'],             // lệch 77 · 1 chỗ (choi.css): .brick.vong { --c }
    timToiV7: ['#5e2fa8', 'timToi'],             // lệch 23 · 1 chỗ (choi.css): .brick.vong { --lo }
    // ~ timToi2
    timToi2V1: ['#3a1c80', 'timToi2'],           // lệch 25 · 4 chỗ (choi.css): .bk { box-shadow }
    timToi2V2: ['#3c2f44', 'timToi2'],           // lệch 45 · 2 chỗ (choi.css): .c-man.trum.lock { --lo }
    // ~ trang
    trangV1: ['#eaffe6', 'trang'],               // lệch 33 · 17 chỗ (choi.css): .hop-chu { color }
    trangV2: ['#ffffff', 'trang'],               // lệch 0 · 7 chỗ (cai-dat.js, den-bo-phan.js, man-goi.js, thanh-phan.js, ve.js): { ma: 'trang', saoCan: 300, mau: ['#dce5f2', '#ffffff', '#7…
    trangV3: ['#e8ffe0', 'trang'],               // lệch 39 · 6 chỗ (choi.css, thanh-phan.js): .bh .tt { color }
    trangV4: ['#fffbe8', 'trang'],               // lệch 23 · 3 chỗ (choi.css): .strip { box-shadow }
    trangV5: ['#fffdf0', 'trang'],               // lệch 15 · 3 chỗ (choi.css): .hop-in { box-shadow }
    trangV6: ['#dce8ff', 'trang'],               // lệch 42 · 2 chỗ (choi.css): .strip.wh:not(.on):not(.err) { background }
    trangV7: ['#efe3ff', 'trang'],               // lệch 32 · 1 chỗ (choi.css): .bong.goi { background }
    trangV8: ['#dff2ff', 'trang'],               // lệch 35 · 1 chỗ (choi.css): .bong.tin { background }
    trangV9: ['#f7f0ff', 'trang'],               // lệch 17 · 1 chỗ (choi.css): .strip.for { box-shadow }
    trangV10: ['#eadcff', 'trang'],              // lệch 41 · 1 chỗ (choi.css): .keo-dong.for { background }
    trangV11: ['#e8dcff', 'trang'],              // lệch 42 · 1 chỗ (choi.css): .dso-o .k { color }
    trangV12: ['#ecfffb', 'trang'],              // lệch 19 · 1 chỗ (choi.css): .strip.if:not(.on):not(.err) { box-shadow }
    trangV13: ['#f1f6ff', 'trang'],              // lệch 17 · 1 chỗ (choi.css): .strip.wh:not(.on):not(.err) { box-shadow }
    // ~ trangToi
    trangToiV1: ['#fff8e0', 'trangToi'],         // lệch 24 · 3 chỗ (choi.css): .hop-in { background }
    trangToiV2: ['#fffbe0', 'trangToi'],         // lệch 27 · 2 chỗ (choi.css, huong-dan.js): .screen>.hd-bong { box-shadow }
    trangToiV4: ['#ffe2dd', 'trangToi'],         // lệch 2 · 1 chỗ (choi.css): .bong.loi { background }
    trangToiV5: ['#fff6e0', 'trangToi'],         // lệch 22 · 1 chỗ (choi.css): .th-luu { color }
    trangToiV6: ['#fff6e3', 'trangToi'],         // lệch 23 · 1 chỗ (choi.css): .so-than { color }
    trangToiV7: ['#fff0ec', 'trangToi'],         // lệch 23 · 1 chỗ (thanh-phan.js): var ic = h('div', 'thung-ic'); ic.appendChild(Ve.ico('trash…
    // ~ tuong
    // ~ tuongSang
    // ~ tuongToi
    // ~ vang
    vangV1: ['#ffc933', 'vang'],                 // lệch 42 · 9 chỗ (choi.css, ve.js): .g-yl { --c }
    vangV2: ['#ffe27a', 'vang'],                 // lệch 33 · 9 chỗ (choi.css, ve.js): .so-ten { color }
    vangV3: ['#ffcf30', 'vang'],                 // lệch 43 · 7 chỗ (choi.css, part/xem-part.html, cai-dat.js, man-choi.js, man-lap.js, ve.js): .cd-son-mau { background }
    vangV4: ['#ffd23f', 'vang'],                 // lệch 28 · 4 chỗ (choi.css, ve.js): .th-s.on { filter }
    vangV5: ['#ffe888', 'vang'],                 // lệch 48 · 3 chỗ (choi.css, cai-dat.js): .tc-ray.dang-keo .tc-cuc { background-color }
    vangV6: ['#ffd879', 'vang'],                 // lệch 31 · 2 chỗ (choi.css): .g-am { --hi }
    vangV7: ['#e8c860', 'vang'],                 // lệch 29 · 2 chỗ (choi.css, huong-dan.js): .screen>.hd-bong { box-shadow }
    vangV8: ['#ffe784', 'vang'],                 // lệch 44 · 2 chỗ (choi.css): .num.mc-yellow { box-shadow }
    vangV10: ['#ffd23a', 'vang'],                // lệch 33 · 1 chỗ (xuong-ham.js): sac: { bieu: 'sac', mau: '#ffd23a', chu: 'xuong.loai.sac', …
    // ~ vangSang
    vangSangV1: ['#e6cf9c', 'vangSang'],         // lệch 22 · 1 chỗ (choi.css): .bong { box-shadow }
    vangSangV2: ['#ffe08a', 'vangSang'],         // lệch 47 · 1 chỗ (choi.css): .strip.on { box-shadow }
    vangSangV3: ['#e0b868', 'vangSang'],         // lệch 41 · 1 chỗ (xuong-ham.js): rao: { bieu: 'rao', mau: '#e0b868', chu: 'xuong.loai.rao', …
    vangSangV4: ['#d8c898', 'vangSang'],         // lệch 10 · 1 chỗ (xuong-ham.js): bac: { bieu: 'bac', mau: '#d8c898', chu: 'xuong.loai.bac', …
    // ~ vangToi
    vangToiV1: ['#efc531', 'vangToi'],           // lệch 33 · 2 chỗ (choi.css): .num.mc-yellow { background }
    // ~ vatCam
    // ~ vatLam
    // ~ vatNau
    // ~ vatTrang
    // ~ vatXam
    // ~ xam
    xamV1: ['#8e7e92', 'xam'],                   // lệch 30 · 3 chỗ (choi.css): .g-the.khoa,.g-the.sap { --hi }
    xamV2: ['#8b93a6', 'xam'],                   // lệch 3 · 2 chỗ (choi.css): .num.mc-none { background }
    xamV4: ['#a9aab4', 'xam'],                   // lệch 38 · 1 chỗ (choi.css): .strip.lock { background }
    xamV5: ['#d2d3dc', 'xam'],                   // lệch 107 · 1 chỗ (choi.css): .strip.lock { box-shadow }
    xamV6: ['#7c7d88', 'xam'],                   // lệch 42 · 1 chỗ (choi.css): .strip.lock { box-shadow }
    xamV7: ['#b9a9bd', 'xam'],                   // lệch 54 · 1 chỗ (choi.css): .c-man.lock .num { color }
    xamV8: ['#9fb8a8', 'xam'],                   // lệch 39 · 1 chỗ (choi.css): .cd-dong.tat .cd-ten { color }
    xamV9: ['#9fb3a8', 'xam'],                   // lệch 35 · 1 chỗ (man-lap.js): ic.appendChild(Ve.ico(d ? d.icon : 'cross', 2, d ? DenBoPha…
    // ~ xamToi
    xamToiV1: ['#8a7f66', 'xamToi'],             // lệch 50 · 2 chỗ (choi.css): .strip .cm { color }
    xamToiV2: ['#565e70', 'xamToi'],             // lệch 20 · 2 chỗ (choi.css): .g-gy { --lo }
    xamToiV3: ['#5a4a62', 'xamToi'],             // lệch 26 · 2 chỗ (choi.css): .c-man.trum.lock { --c }
    xamToiV4: ['#7e6e86', 'xamToi'],             // lệch 37 · 2 chỗ (choi.css): .c-man.trum.lock { --hi }
    xamToiV5: ['#5d6478', 'xamToi'],             // lệch 19 · 2 chỗ (choi.css): .num.mc-none { box-shadow }
    xamToiV7: ['#5a6478', 'xamToi'],             // lệch 21 · 1 chỗ (choi.css): .strip .num.dkm.op,.strip .num.dkm.noi { background }
    xamToiV8: ['#6b7488', 'xamToi'],             // lệch 37 · 1 chỗ (choi.css): .pg-cua-lon { background }
    xamToiV9: ['#59675f', 'xamToi'],             // lệch 26 · 1 chỗ (man-lap.js): return Ve.ico('xu', s || 1, sang ? { fill: '#ffcf30', toi: …
    // ~ xamToi2
    xamToi2V1: ['#4a4b58', 'xamToi2'],           // lệch 21 · 1 chỗ (choi.css): .strip.lock { color }
    xamToi2V2: ['#5a4a50', 'xamToi2'],           // lệch 25 · 1 chỗ (choi.css): .g-ch.khoa,.g-ch.sap { background }
    xamToi2V3: ['#3a3f4a', 'xamToi2'],           // lệch 14 · 1 chỗ (choi.css): .md-duong { background }
    xamToi2V4: ['#3d4a44', 'xamToi2'],           // lệch 20 · 1 chỗ (man-lap.js): return Ve.ico('xu', s || 1, sang ? { fill: '#ffcf30', toi: …
    xamToi2V5: ['#26302b', 'xamToi2'],           // lệch 48 · 1 chỗ (man-lap.js): return Ve.ico('xu', s || 1, sang ? { fill: '#ffcf30', toi: …
    // ~ xanhLa
    xanhLaV1: ['#7fc4a6', 'xanhLa'],             // lệch 40 · 6 chỗ (choi.css): .gl .nb { border }
    xanhLaV2: ['#8fc9ac', 'xanhLa'],             // lệch 22 · 5 chỗ (choi.css): .tab { color }
    xanhLaV3: ['#cfe9db', 'xanhLa'],             // lệch 63 · 3 chỗ (choi.css): .th-theo { color }
    xanhLaV4: ['#bfe8d2', 'xanhLa'],             // lệch 46 · 3 chỗ (choi.css): .lr-the-vuot { color }
    xanhLaV5: ['#6fd08a', 'xanhLa'],             // lệch 67 · 2 chỗ (choi.css): .c-man.trum.done { --hi }
    xanhLaV6: ['#eefad0', 'xanhLa'],             // lệch 91 · 2 chỗ (choi.css): .num.ptu.them { box-shadow }
    xanhLaV7: ['#6fae93', 'xanhLa'],             // lệch 71 · 1 chỗ (choi.css): .strip.empty { border }
    xanhLaV8: ['#a8dcc0', 'xanhLa'],             // lệch 15 · 1 chỗ (choi.css): .gl { color }
    xanhLaV9: ['#cfeec4', 'xanhLa'],             // lệch 56 · 1 chỗ (choi.css): .pal .nk { color }
    xanhLaV10: ['#7fb59c', 'xanhLa'],            // lệch 52 · 1 chỗ (choi.css): .cc-hien.trong { color }
    xanhLaV11: ['#d8f5e6', 'xanhLa'],            // lệch 81 · 1 chỗ (choi.css): .lr-loi.de { color }
    xanhLaV12: ['#b8d4c5', 'xanhLa'],            // lệch 28 · 1 chỗ (choi.css): .cd-son-o.khoa .cd-son-sao { color }
    xanhLaV14: ['#8fc4ad', 'xanhLa'],            // lệch 25 · 1 chỗ (den-bo-phan.js): function mauIcon(mau, sang) { return sang ? { fill: mau, li…
    // ~ xanhLaSang
    xanhLaSangV1: ['#7cff86', 'xanhLaSang'],     // lệch 45 · 4 chỗ (choi.css, man-choi.js, man-lap.js, man-so-lenh.js): .so-the.co { box-shadow }
    xanhLaSangV2: ['#a6f2a0', 'xanhLaSang'],     // lệch 16 · 3 chỗ (choi.css): .g-gr { --hi }
    xanhLaSangV3: ['#9ff08f', 'xanhLaSang'],     // lệch 26 · 3 chỗ (choi.css): .gl.g-em { color }
    xanhLaSangV4: ['#a6f5a0', 'xanhLaSang'],     // lệch 14 · 2 chỗ (choi.css): .c-man { --hi }
    xanhLaSangV5: ['#c4ee9c', 'xanhLaSang'],     // lệch 43 · 2 chỗ (choi.css): .gl.g-truot { color }
    xanhLaSangV6: ['#b6e04c', 'xanhLaSang'],     // lệch 97 · 2 chỗ (choi.css, den-bo-phan.js): .brick.truot { --c }
    xanhLaSangV7: ['#7cf0aa', 'xanhLaSang'],     // lệch 37 · 2 chỗ (choi.css): .num.mc-green { box-shadow }
    xanhLaSangV8: ['#cfeaa0', 'xanhLaSang'],     // lệch 54 · 2 chỗ (choi.css): .num.ptu.them { background }
    xanhLaSangV9: ['#a8dc72', 'xanhLaSang'],     // lệch 62 · 2 chỗ (mo-dau.js): { ten: 'denCanh', mau: '#a8dc72', x: 80, y: -90, r: '540deg…
    xanhLaSangV10: ['#c8ffc2', 'xanhLaSang'],    // lệch 52 · 1 chỗ (choi.css): .toast.win { box-shadow }
    xanhLaSangV11: ['#8fdc8a', 'xanhLaSang'],    // lệch 46 · 1 chỗ (choi.css): .g-the.xong { --hi }
    xanhLaSangV12: ['#b8ffb0', 'xanhLaSang'],    // lệch 30 · 1 chỗ (choi.css): .c-bar .seg.on { box-shadow }
    xanhLaSangV13: ['#e8f9aa', 'xanhLaSang'],    // lệch 75 · 1 chỗ (choi.css): .brick.truot { --hi }
    xanhLaSangV14: ['#d3f08e', 'xanhLaSang'],    // lệch 60 · 1 chỗ (choi.css): .brick.ls { --hi }
    xanhLaSangV15: ['#a6dc5a', 'xanhLaSang'],    // lệch 82 · 1 chỗ (choi.css): .num.lsten { box-shadow }
    xanhLaSangV16: ['#8fdc72', 'xanhLaSang'],    // lệch 63 · 1 chỗ (choi.css): .pg-doi { box-shadow }
    // ~ xanhLaToi
    xanhLaToiV1: ['#3cc24a', 'xanhLaToi'],       // lệch 17 · 3 chỗ (choi.css, man-choi.js, man-lap.js): .sanbt .dau.ok { background }
    xanhLaToiV2: ['#47c95f', 'xanhLaToi'],       // lệch 18 · 2 chỗ (choi.css): .c-man { --c }
    xanhLaToiV3: ['#2a8f44', 'xanhLaToi'],       // lệch 62 · 2 chỗ (choi.css): .c-man { --lo }
    xanhLaToiV4: ['#4f8a73', 'xanhLaToi'],       // lệch 67 · 2 chỗ (choi.css, den-bo-phan.js): .the-cham i { background }
    xanhLaToiV5: ['#7cc23a', 'xanhLaToi'],       // lệch 52 · 2 chỗ (choi.css): .gl.g-truot::after { background }
    xanhLaToiV6: ['#2ea565', 'xanhLaToi'],       // lệch 47 · 2 chỗ (choi.css): .num.mc-green { background }
    xanhLaToiV7: ['#9cc85a', 'xanhLaToi'],       // lệch 81 · 2 chỗ (choi.css): .num.ptu.them { box-shadow }
    xanhLaToiV9: ['#6fe06a', 'xanhLaToi'],       // lệch 53 · 1 chỗ (choi.css): .toast.win { background }
    xanhLaToiV10: ['#3f9a3a', 'xanhLaToi'],      // lệch 47 · 1 chỗ (choi.css): .gl.g-em::after { background }
    xanhLaToiV11: ['#5f9a7c', 'xanhLaToi'],      // lệch 63 · 1 chỗ (choi.css): .pal .nk { border }
    xanhLaToiV12: ['#3f9a4f', 'xanhLaToi'],      // lệch 42 · 1 chỗ (choi.css): .g-the.xong { --c }
    xanhLaToiV13: ['#5fe06a', 'xanhLaToi'],      // lệch 45 · 1 chỗ (choi.css): .c-bar .seg.on { background }
    xanhLaToiV14: ['#2a9a45', 'xanhLaToi'],      // lệch 53 · 1 chỗ (choi.css): .c-bar .seg.on { box-shadow }
    xanhLaToiV15: ['#7aa522', 'xanhLaToi'],      // lệch 71 · 1 chỗ (choi.css): .brick.truot { --lo }
    xanhLaToiV16: ['#5f8f7c', 'xanhLaToi'],      // lệch 71 · 1 chỗ (choi.css): .so-the.chua { box-shadow }
    xanhLaToiV17: ['#8fc83a', 'xanhLaToi'],      // lệch 70 · 1 chỗ (choi.css): .brick.ls { --c }
    xanhLaToiV18: ['#5cb04a', 'xanhLaToi'],      // lệch 25 · 1 chỗ (choi.css): .pg-doi { background }
    xanhLaToiV19: ['#4a8a3a', 'xanhLaToi'],      // lệch 60 · 1 chỗ (choi.css): .pg-dat { background }
    // ~ xanhLo
    xanhLoV1: ['#0b6f86', 'xanhLo'],             // lệch 99 · 2 chỗ (choi.css): .strip .mv { color }
    xanhLoV2: ['#06323a', 'xanhLo'],             // lệch 2 · 2 chỗ (den-bo-phan.js): function mauIcon(mau, sang) { return sang ? { fill: mau, li…
    xanhLoV3: ['#0c6474', 'xanhLo'],             // lệch 78 · 1 chỗ (choi.css): .g-te { --lo }
    xanhLoV4: ['#0f4a56', 'xanhLo'],             // lệch 39 · 1 chỗ (choi.css): .den.sang { background }
    xanhLoV5: ['#215a68', 'xanhLo'],             // lệch 67 · 1 chỗ (choi.css): .g-the.dot2 { --lo }
    xanhLoV6: ['#07323f', 'xanhLo'],             // lệch 5 · 1 chỗ (choi.css): .num.dkc { box-shadow }
    xanhLoV7: ['#0e6e88', 'xanhLo'],             // lệch 100 · 1 chỗ (choi.css): .num.dkc { box-shadow }
    // ~ xanhLoSang
    xanhLoSangV1: ['#1b8aa4', 'xanhLoSang'],     // lệch 88 · 3 chỗ (choi.css, ve.js): .g-cy { --lo }
    xanhLoSangV2: ['#3b9ee0', 'xanhLoSang'],     // lệch 40 · 2 chỗ (choi.css): .c-man.open { --c }
    xanhLoSangV3: ['#1e9fb4', 'xanhLoSang'],     // lệch 63 · 1 chỗ (choi.css): .g-te { --c }
    xanhLoSangV4: ['#3f8fa0', 'xanhLoSang'],     // lệch 83 · 1 chỗ (choi.css): .g-the.dot2 { --c }
    xanhLoSangV5: ['#1593b3', 'xanhLoSang'],     // lệch 75 · 1 chỗ (choi.css): .num.dkc { background }
    // ~ xanhLoSang2
    xanhLoSang2V1: ['#9aeefa', 'xanhLoSang2'],   // lệch 28 · 4 chỗ (choi.css, thanh-phan.js): .g-cy { --hi }
    xanhLoSang2V2: ['#7be7f5', 'xanhLoSang2'],   // lệch 14 · 4 chỗ (choi.css): .c-td .d { color }
    xanhLoSang2V3: ['#5fd8ff', 'xanhLoSang2'],   // lệch 40 · 2 chỗ (choi.css): .xe-tab { background }
    xanhLoSang2V4: ['#7fe0ee', 'xanhLoSang2'],   // lệch 23 · 1 chỗ (choi.css): .g-te { --hi }
    xanhLoSang2V5: ['#86d2de', 'xanhLoSang2'],   // lệch 45 · 1 chỗ (choi.css): .g-the.dot2 { --hi }
    xanhLoSang2V6: ['#62d6ee', 'xanhLoSang2'],   // lệch 42 · 1 chỗ (choi.css): .num.dkc { box-shadow }
    xanhLoSang2V7: ['#7fc8ff', 'xanhLoSang2'],   // lệch 40 · 1 chỗ (choi.css): .pg-troi { background }
    xanhLoSang2V8: ['#c9ecff', 'xanhLoSang2'],   // lệch 74 · 1 chỗ (choi.css): .pg-troi { background }
    xanhLoSang2V10: ['#6fd8e8', 'xanhLoSang2']  // lệch 37 · 1 chỗ (xuong-ham.js): cua: { bieu: 'cua', mau: '#6fd8e8', chu: 'xuong.loai.cua', …
  };

  var M = {}, GOC_CUA = {}, k;
  for (k in G) M[k] = G[k];
  for (k in DOI) M[k] = DOI[k];
  for (k in LUAT) M[k] = LUAT[k];
  for (k in BT) { M[k] = GOP_HET ? G[BT[k][1]] : BT[k][0]; GOC_CUA[k] = BT[k][1]; }
  Object.defineProperty(M, '_gocCua', { value: GOC_CUA });   // biến thể → gốc (không liệt kê, không thành biến CSS)
  Object.defineProperty(M, '_tang', { value: { G: Object.keys(G), DOI: Object.keys(DOI), LUAT: Object.keys(LUAT), BT: Object.keys(BT) } });

  if (typeof module === 'object' && module.exports) module.exports = M;
  if (root) {
    root.BangMau = M;
    var d = root.document;
    if (d && d.documentElement && d.documentElement.style && d.documentElement.style.setProperty) {
      for (k in M) if (Object.prototype.hasOwnProperty.call(M, k)) d.documentElement.style.setProperty('--g-' + k, M[k]);
    }
  }
})(typeof window !== 'undefined' ? window : null);
