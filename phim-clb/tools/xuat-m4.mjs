// Xuất hình robot, ô sân, vật mùa 4 (Bến sông · Tàu thủy lợi R1) ra public/robot/m4/,
// đồng thời xuất nền dọc public/nen-doc/mua-song.png và nhân vật public/nguoi/ba-a.png.
// Chạy: node tools/xuat-m4.mjs
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const goc = dirname(fileURLToPath(import.meta.url));
const repo = resolve(goc, '../..');
const ra = resolve(goc, '../public/robot/m4');
const PORT = 4214, CANH = 480, CANH_O = 320;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const may = spawn(process.execPath, ['server.mjs'], { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
try {
  await new Promise((r) => setTimeout(r, 800));
  const tr = await chromium.launch({ executablePath: CHROME });
  const trang = await tr.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await trang.goto(`http://localhost:${PORT}/hoc/game/choi.html`);
  await trang.waitForFunction(() => window.VeRobot && window.VeVector);
  await mkdir(ra, { recursive: true });

  const luu = async (duongDan, kq) => {
    if (kq && kq.url) {
      await writeFile(duongDan, Buffer.from(kq.url.split(',')[1], 'base64'));
      console.log('xong', duongDan.split(/[\\/]/).pop(), kq.w + 'x' + kq.h);
    } else console.log('KHÔNG', duongDan);
  };

  // Đăng ký thân xuồng, tay dây phao kéo, cảm biến chong chóng nước, ô & vật mùa 4 trong trang
  await trang.evaluate(() => {
    const V = window.VeVector, BM = window.BangMau;

    // 1. THÂN XUỒNG CHÂN VỊT ('xuong'): phao đệm khí xanh dương bao quanh, mũi xuồng hướng +y, chân vịt kép ở đuôi (-y), vỏ trắng gia đình thân A, kính + mắt Sola
    V.dangKy({
      loai: 'than', ma: 'xuong', hamGoc: ['left_move', 'right_move', 'wait', 'anchor'], ten: 'Thân xuồng chân vịt',
      oGan: { tay: { x: 50, y: 84 }, hongTrai: { x: 78, y: 50 }, hongPhai: { x: 22, y: 50 }, tren: { x: 72, y: 78 }, sau: { x: 50, y: 20 } },
      oCam: { x: 50, y: 28 }, vo: { x: 20, y: 20, w: 60, h: 66 },
      ve: function (g, s, M, H) {
        s = s || {};
        // Gợn nước trắng-cyan quanh mạn xuồng
        g.save();
        g.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        g.lineWidth = 2.6;
        g.beginPath(); g.arc(50, 54, 41, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
        g.beginPath(); g.arc(50, 54, 44, -0.8 * Math.PI, -0.2 * Math.PI); g.stroke();
        g.restore();

        // Hai chân vịt ở đuôi (-y: y=14..24)
        for (const cx of [35, 65]) {
          H.bo(g, cx - 5, 13, 10, 9, 3); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);
          H.elip(g, cx - 4, 12, 4.5, 2.2); H.to(g, '#38BDF8'); H.vien(g, BM.vecVien, 1.5);
          H.elip(g, cx + 4, 12, 4.5, 2.2); H.to(g, '#38BDF8'); H.vien(g, BM.vecVien, 1.5);
        }

        // Móc kéo đuôi (khi nâng cấp buộc dắt sà lan s.dat)
        if (s.dat) {
          H.bo(g, 45, 9, 10, 11, 4); H.to(g, '#F59E0B'); H.vien(g, BM.vecVien, 2.2);
          H.tron(g, 50, 11, 3.2); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.5);
          if (s.dangDat) {
            H.duong(g, 'M50 8 V1'); H.vien(g, '#F97316', 4.5);
          }
        }

        // Phao đệm khí xung quanh thân xuồng (màu xanh biển đậm & sọc cam cứu hộ)
        g.beginPath();
        g.moveTo(22, 26);
        g.lineTo(78, 26);
        g.quadraticCurveTo(84, 54, 74, 80);
        g.quadraticCurveTo(50, 92, 26, 80);
        g.quadraticCurveTo(16, 54, 22, 26);
        g.closePath();
        g.fillStyle = H.gradDoc(g, 0, 22, 0, 90, [[0, '#0284C7'], [1, '#0369A1']]);
        g.fill();
        H.vien(g, BM.vecVien, 3.8);

        // Dải phản quang cam trên phao hai bên mạn
        H.bo(g, 18, 44, 6, 18, 3); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 1.8);
        H.bo(g, 76, 44, 6, 18, 3); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 1.8);

        // Mỏ neo hai bên hông (khi thả neo s.neo)
        if (s.neo) {
          for (const [ax, dir] of [[12, -1], [88, 1]]) {
            H.duong(g, `M${ax - dir * 5} 52 H${ax} V64`); H.vien(g, BM.vecVien, 5);
            H.duong(g, `M${ax - dir * 5} 52 H${ax} V64`); H.vien(g, '#FACC15', 2.6);
            H.duong(g, `M${ax - 5} 60 Q${ax} 68 ${ax + 5} 60`); H.vien(g, BM.vecVien, 5);
            H.duong(g, `M${ax - 5} 60 Q${ax} 68 ${ax + 5} 60`); H.vien(g, '#FACC15', 2.6);
          }
        }

        // Vỏ trắng bo tròn gia đình thân A ở khoang giữa
        H.bo(g, 26, 26, 48, 54, 16);
        g.fillStyle = H.gradVo(g, 26, 26, 48, 54);
        g.fill();
        H.vien(g, BM.vecVien, 3.4);
        H.duong(g, 'M36 33 C34 43 34 51 36 59 M64 33 C66 43 66 51 64 59 M50 26 v10');
        H.vien(g, BM.vecVoGhep, 2.2);
        H.kinh(g, M, 30, 56, 40, 15, s);
        H.angTen(g, M, 50, 27, 12, 4.8);
      }
    });

    // 2. TAY DÂY PHAO KÉO ('day-keo'): tời dây ở mũi + phao tròn cam-trắng; s.day = đang phóng dây kéo về phía trước
    V.dangKy({
      loai: 'tay', ma: 'day-keo', hamGoc: ['tow', 'tether'], ten: 'Dây phao kéo', gan: 'tay', diemNeo: { x: 50, y: 82 },
      ve: function (g, s, M, H) {
        s = s || {};
        // Khung tời dây ở mũi xuồng
        H.bo(g, 38, 77, 24, 11, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
        H.bo(g, 42, 80, 16, 6, 2.5); H.to(g, '#F59E0B'); H.vien(g, BM.vecVien, 1.6);
        const yPhao = s.day ? 103 : 93;
        // Dây cáp cam nối từ tời tới phao
        H.duong(g, `M50 86 V${yPhao}`); H.vien(g, BM.vecVien, 5.5);
        H.duong(g, `M50 86 V${yPhao}`); H.vien(g, '#F97316', 3);
        // Phao tròn cứu sinh cam - trắng ở đầu dây
        H.tron(g, 50, yPhao, 7.5); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 2.4);
        H.tron(g, 50, yPhao, 3.2); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.5);
      }
    });

    // 3. CẢM BIẾN CHONG CHÓNG ĐO DÒNG CHẢY ('dong-chay', ổ 'tren' góc mũi)
    V.dangKy({
      loai: 'cam-bien', ma: 'dong-chay', hamGoc: ['flow_dir', 'flow'], ten: 'Chong chóng đo dòng chảy', gan: 'tren', diemNeo: { x: 50, y: 50 },
      ve: function (g, s, M, H) {
        s = s || {};
        if (s.bat) {
          H.tron(g, 50, 50, 11); H.to(g, 'rgba(56, 189, 248, 0.35)');
        }
        H.tron(g, 50, 50, 6.5); g.fillStyle = H.gradVo(g, 43.5, 43.5, 13, 13); g.fill(); H.vien(g, BM.vecVien, 2.2);
        // 4 cánh chong chóng thủy văn
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + (s.bat ? 0.4 : 0);
          const x2 = 50 + Math.cos(a) * 8.5, y2 = 50 + Math.sin(a) * 8.5;
          H.duong(g, `M50 50 L${x2.toFixed(1)} ${y2.toFixed(1)}`);
          H.vien(g, BM.vecVien, 4.2);
          H.vien(g, s.bat ? '#38BDF8' : '#0284C7', 2.2);
        }
        H.tron(g, 50, 50, 2.5); H.to(g, s.bat ? '#FACC15' : BM.vecVo); H.vien(g, BM.vecVien, 1.2);
      }
    });

    // 4. CÁC Ô SÂN MÙA 4 (BẾN SÔNG)
    // Ô mặt nước êm
    V.dangKy({
      loai: 'o', ma: 'nuoc', ten: 'Mặt nước sông',
      ve: function (g, s, H) {
        g.fillStyle = '#0369A1'; g.fillRect(0, 0, 100, 100);
        H.bo(g, 2, 2, 96, 96, 8);
        g.fillStyle = H.gradDoc(g, 0, 2, 0, 98, [[0, '#0EA5E9'], [1, '#0284C7']]);
        g.fill();
        H.vien(g, '#075985', 2.5);
        // Gợn sóng nhẹ
        H.duong(g, 'M20 34 Q35 28 50 34 T80 34 M22 68 Q37 62 52 68 T82 68');
        H.vien(g, 'rgba(224, 242, 254, 0.55)', 3);
      }
    });

    // Ô dòng nước chảy (s.huong: 0 lên, 1 phải, 2 xuống, 3 trái; s.xiet: true = sức nước 2 ô)
    V.dangKy({
      loai: 'o', ma: 'dong-nuoc', ten: 'Dòng nước chảy',
      ve: function (g, s, H) {
        s = s || {};
        const h = ((s.huong | 0) % 4 + 4) % 4, xiet = !!s.xiet;
        g.save();
        g.translate(50, 50); g.rotate((h * Math.PI) / 2); g.translate(-50, -50);
        g.fillStyle = '#0369A1'; g.fillRect(0, 0, 100, 100);
        H.bo(g, 2, 2, 96, 96, 8);
        g.fillStyle = H.gradDoc(g, 0, 2, 0, 98, xiet ? [[0, '#0284C7'], [1, '#1E3A8A']] : [[0, '#38BDF8'], [1, '#0284C7']]);
        g.fill();
        H.vien(g, '#075985', 2.5);
        // Vệt bọt nước dọc
        H.duong(g, 'M22 14 V86 M78 14 V86');
        H.vien(g, 'rgba(186, 230, 253, 0.5)', 2.5);
        // Mũi tên chỉ chiều dòng chảy (mặc định hướng LÊN -y)
        const ys = xiet ? [26, 62] : [44];
        for (const y of ys) {
          H.duong(g, `M30 ${y + 16} L50 ${y - 4} L70 ${y + 16}`);
          H.vien(g, '#0C4A6E', 9);
          H.duong(g, `M30 ${y + 16} L50 ${y - 4} L70 ${y + 16}`);
          H.vien(g, xiet ? '#FACC15' : '#E0F2FE', 5);
        }
        g.restore();
      }
    });

    // Ô cống thủy lợi (s.mo: true = mở, false = đóng chặn dòng)
    V.dangKy({
      loai: 'o', ma: 'cong-thuy-loi', ten: 'Cống thủy lợi',
      ve: function (g, s, H) {
        s = s || {};
        V.lay('o', 'nuoc').ve(g, {}, H);
        // Hai trụ bê tông hai bên thành cống
        for (const x of [3, 81]) {
          H.bo(g, x, 4, 16, 92, 4); H.to(g, '#64748B'); H.vien(g, BM.vecVien, 2.5);
          H.tron(g, x + 8, 50, 4); H.to(g, s.mo ? '#22C55E' : '#EF4444'); H.vien(g, BM.vecVien, 1.5);
        }
        if (!s.mo) {
          // Cánh cống thép đóng ngang chặn nước
          H.bo(g, 19, 32, 62, 36, 4);
          g.fillStyle = H.gradDoc(g, 0, 32, 0, 68, [[0, '#94A3B8'], [1, '#475569']]);
          g.fill();
          H.vien(g, BM.vecVien, 3);
          H.duong(g, 'M25 42 H75 M25 58 H75'); H.vien(g, '#F59E0B', 3.5);
        } else {
          // Cánh cống đã kéo lên, lộ luồng nước xanh thông thoáng
          H.bo(g, 19, 6, 62, 12, 3); H.to(g, '#94A3B8'); H.vien(g, BM.vecVien, 2);
          H.duong(g, 'M36 62 L50 44 L64 62'); H.vien(g, '#BAE6FD', 4.5);
        }
      }
    });

    // Ô bờ kè đá / cầu dầm cho R2 nhện đi
    V.dangKy({
      loai: 'o', ma: 'bo-da', ten: 'Bờ kè đá',
      ve: function (g, s, H) {
        g.fillStyle = '#475569'; g.fillRect(0, 0, 100, 100);
        H.bo(g, 3, 3, 94, 94, 8);
        g.fillStyle = H.gradDoc(g, 0, 3, 0, 97, [[0, '#CBD5E1'], [1, '#94A3B8']]);
        g.fill();
        H.vien(g, BM.vecVien, 3);
        H.bo(g, 12, 12, 36, 34, 5); H.to(g, '#E2E8F0'); H.vien(g, '#64748B', 2);
        H.bo(g, 52, 12, 36, 34, 5); H.to(g, '#CBD5E1'); H.vien(g, '#64748B', 2);
        H.bo(g, 12, 52, 50, 36, 5); H.to(g, '#CBD5E1'); H.vien(g, '#64748B', 2);
        H.bo(g, 66, 52, 22, 36, 5); H.to(g, '#E2E8F0'); H.vien(g, '#64748B', 2);
      }
    });

    // Ô phao tiêu đích trên sông
    V.dangKy({
      loai: 'o', ma: 'phao-dich', ten: 'Phao tiêu đích',
      ve: function (g, s, H) {
        V.lay('o', 'nuoc').ve(g, {}, H);
        H.tron(g, 50, 50, 34); H.vien(g, '#BAE6FD', 2.5);
        H.tron(g, 50, 50, 24); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 3);
        H.tron(g, 50, 50, 14); H.to(g, '#FFF'); H.vien(g, BM.vecVien, 2);
        H.tron(g, 50, 50, 6); H.to(g, '#22C55E'); H.vien(g, BM.vecVien, 1.5);
      }
    });

    // 5. CÁC VẬT MÙA 4 (BÈ GỖ, LỤC BÌNH, PHAO SẮT)
    // Bè hàng gỗ nổi
    V.dangKy({
      loai: 'vat', ma: 'be-go', ten: 'Bè hàng nổi',
      ve: function (g, s, H) {
        // 4 thân gỗ ghép thành bè + kiện hàng ở giữa
        for (const x of [16, 34, 52, 70]) {
          H.bo(g, x, 10, 14, 80, 6);
          g.fillStyle = H.gradDoc(g, x, 10, x, 90, [[0, '#D97706'], [1, '#92400E']]);
          g.fill();
          H.vien(g, BM.vecVien, 2.5);
        }
        // Hai thanh ngang buộc dây thừng vàng
        H.bo(g, 12, 22, 76, 8, 3); H.to(g, '#FBBF24'); H.vien(g, BM.vecVien, 2);
        H.bo(g, 12, 70, 76, 8, 3); H.to(g, '#FBBF24'); H.vien(g, BM.vecVien, 2);
        // Thùng hàng nông sản đặt giữa bè
        H.bo(g, 24, 28, 52, 44, 9);
        g.fillStyle = H.gradVo(g, 24, 28, 52, 44);
        g.fill();
        H.vien(g, BM.vecVien, 2.8);
        H.bo(g, 24, 46, 52, 10, 2); H.to(g, '#0284C7'); H.vien(g, BM.vecVien, 1.8);
      }
    });

    // Đám lục bình trôi
    V.dangKy({
      loai: 'vat', ma: 'luc-binh', ten: 'Đám lục bình',
      ve: function (g, s, H) {
        for (const [cx, cy, r] of [[34, 38, 18], [64, 36, 17], [32, 64, 17], [64, 62, 19], [50, 50, 20]]) {
          H.tron(g, cx, cy, r); H.to(g, '#16A34A'); H.vien(g, BM.vecVien, 2.6);
          H.tron(g, cx - 3, cy - 3, r * 0.55); H.to(g, '#22C55E');
        }
        // Bông hoa lục bình tím nhạt ở tâm
        for (const [fx, fy] of [[44, 42], [56, 46], [50, 55]]) {
          H.tron(g, fx, fy, 5.5); H.to(g, '#C084FC'); H.vien(g, BM.vecVien, 1.6);
          H.tron(g, fx, fy, 2); H.to(g, '#FACC15');
        }
      }
    });

    // Thùng phao sắt tái chế của bác Sáu (ghép cầu phao)
    V.dangKy({
      loai: 'vat', ma: 'phao-sat', ten: 'Thùng phao sắt',
      ve: function (g, s, H) {
        H.bo(g, 12, 12, 76, 76, 14);
        g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, '#E2E8F0'], [1, '#94A3B8']]);
        g.fill();
        H.vien(g, BM.vecVien, 3.2);
        // Phao cam hai bên
        H.bo(g, 8, 22, 10, 56, 5); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 2.2);
        H.bo(g, 82, 22, 10, 56, 5); H.to(g, '#F97316'); H.vien(g, BM.vecVien, 2.2);
        H.duong(g, 'M26 36 H74 M26 64 H74'); H.vien(g, '#475569', 3);
      }
    });
  });

  const CAM = [{ ma: 'dong-chay', o: 'tren' }];
  const cfg = (tay = null, cam = []) => ({ than: 'xuong', tay, camBien: cam });

  const HINH = {
    'nhen': [{ than: 'nhen', tay: null, camBien: [] }, {}],
    'nhen-ngac': [{ than: 'nhen', tay: null, camBien: [] }, { mat: 'ngac' }],
    'xuong': [cfg(), {}],
    'xuong-vui': [cfg(), { mat: 'vui' }],
    'xuong-ngac': [cfg(), { mat: 'ngac' }],
    'xuong-keo': [cfg('day-keo'), {}],
    'xuong-keo-vui': [cfg('day-keo'), { mat: 'vui' }],
    'xuong-keo-ngac': [cfg('day-keo'), { mat: 'ngac' }],
    'xuong-keo-day': [cfg('day-keo'), { tay: { day: true } }],
    'xuong-do': [cfg('day-keo', CAM), {}],
    'xuong-do-vui': [cfg('day-keo', CAM), { mat: 'vui' }],
    'xuong-do-ngac': [cfg('day-keo', CAM), { mat: 'ngac' }],
    'xuong-do-bat': [cfg('day-keo', CAM), { camBien: { bat: true } }],
    'xuong-neo': [cfg('day-keo', CAM), { neo: true, camBien: { bat: true } }],
    'xuong-neo-vui': [cfg('day-keo', CAM), { neo: true, mat: 'vui', tay: { day: true } }],
    'xuong-dat': [cfg('day-keo', CAM), { dat: true, dangDat: true }],
    'xuong-dat-vui': [cfg('day-keo', CAM), { dat: true, dangDat: true, mat: 'vui' }],
    'xuong-du': [cfg('day-keo', CAM), { dat: true, neo: false, camBien: { bat: true } }],
    'xuong-du-vui': [cfg('day-keo', CAM), { dat: true, mat: 'vui', camBien: { bat: true } }],
    'r2': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { tay: { bat: false } }],
    'r2-hut': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { tay: { bat: true, cuc: 'N' } }],
    'r2-vui': [{ than: 'nhen', tay: 'nam-cham', camBien: [], son: 'lam' }, { mat: 'vui', tay: { bat: true, cuc: 'N' } }],
  };

  const O_SAN = {
    'o-nuoc': ['nuoc', {}],
    'o-dong-len': ['dong-nuoc', { huong: 0 }],
    'o-dong-phai': ['dong-nuoc', { huong: 1 }],
    'o-dong-xuong': ['dong-nuoc', { huong: 2 }],
    'o-dong-trai': ['dong-nuoc', { huong: 3 }],
    'o-xiet-len': ['dong-nuoc', { huong: 0, xiet: true }],
    'o-xiet-phai': ['dong-nuoc', { huong: 1, xiet: true }],
    'o-xiet-xuong': ['dong-nuoc', { huong: 2, xiet: true }],
    'o-xiet-trai': ['dong-nuoc', { huong: 3, xiet: true }],
    'o-cong-dong': ['cong-thuy-loi', { mo: false }],
    'o-cong-mo': ['cong-thuy-loi', { mo: true }],
    'o-van-cong': ['nut-ban', { bat: false }],
    'o-van-cong-bat': ['nut-ban', { bat: true }],
    'o-bo-da': ['bo-da', {}],
    'o-phao-dich': ['phao-dich', {}],
    'o-bang-phai': ['bang', { huong: 1, pha: 0 }],
  };

  const VAT = {
    'vat-be-go': ['be-go', {}],
    'vat-luc-binh': ['luc-binh', {}],
    'vat-phao-sat': ['phao-sat', {}],
    'vat-khoi-sat': ['khoi-sat', {}],
  };

  for (const [ten, [c, tt]] of Object.entries(HINH)) {
    await luu(resolve(ra, ten + '.png'), await trang.evaluate(([c, tt, canh]) => {
      try {
        const cv = VeRobot.veCo(c, tt, 1, canh);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [c, tt, CANH]));
  }

  for (const [ten, [ma, st]] of Object.entries(O_SAN)) {
    await luu(resolve(ra, ten + '.png'), await trang.evaluate(([ma, st, canh]) => {
      try {
        const cv = VeVector.o(ma, canh, st);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [ma, st, CANH_O]));
  }

  for (const [ten, [ma, st]] of Object.entries(VAT)) {
    await luu(resolve(ra, ten + '.png'), await trang.evaluate(([ma, st, canh]) => {
      try {
        const cv = VeVector.vat(ma, canh, st);
        return cv ? { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height } : null;
      } catch (e) { return null; }
    }, [ma, st, CANH_O]));
  }

  // Xuất nền dọc Bến sông & Trạm thủy lợi (public/nen-doc/mua-song.png, 1080x1920)
  await luu(resolve(goc, '../public/nen-doc/mua-song.png'), await trang.evaluate(() => {
    const cv = document.createElement('canvas');
    cv.width = 1080; cv.height = 1920;
    const g = cv.getContext('2d');
    // Nền sông xanh biếc từ trên xuống
    const gr = g.createLinearGradient(0, 0, 0, 1920);
    gr.addColorStop(0, '#0284C7');
    gr.addColorStop(0.5, '#0369A1');
    gr.addColorStop(1, '#075985');
    g.fillStyle = gr;
    g.fillRect(0, 0, 1080, 1920);

    // Gợn sóng mặt sông ở vùng trung tâm
    g.strokeStyle = 'rgba(186, 230, 253, 0.18)';
    g.lineWidth = 6;
    for (let y = 180; y < 1800; y += 140) {
      g.beginPath();
      for (let x = 140; x <= 940; x += 80) {
        g.quadraticCurveTo(x + 20, y - 12, x + 40, y);
        g.quadraticCurveTo(x + 60, y + 12, x + 80, y);
      }
      g.stroke();
    }

    // Hai bờ kè đá + cầu gỗ bến sông ở rìa trái (x: 0..145) và rìa phải (x: 935..1080)
    const veBo = (x0, w, isLeft) => {
      g.fillStyle = '#CBD5E1';
      g.fillRect(x0, 0, w, 1920);
      g.strokeStyle = '#1E1B4B';
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(isLeft ? x0 + w : x0, 0);
      g.lineTo(isLeft ? x0 + w : x0, 1920);
      g.stroke();
      for (let y = 40; y < 1900; y += 120) {
        g.fillStyle = y % 240 === 40 ? '#E2E8F0' : '#94A3B8';
        g.fillRect(x0 + 14, y, w - 28, 96);
        g.strokeRect(x0 + 14, y, w - 28, 96);
      }
    };
    veBo(0, 135, true);
    veBo(945, 135, false);

    // Cầu tàu gỗ bên trái (y: 480..760) và bên phải (y: 1020..1300)
    const veCau = (x, y, w, h) => {
      g.fillStyle = '#D97706';
      g.strokeStyle = '#1E1B4B';
      g.lineWidth = 6;
      for (let py = y; py < y + h; py += 36) {
        g.fillRect(x, py, w, 28);
        g.strokeRect(x, py, w, 28);
      }
    };
    veCau(90, 520, 75, 240);
    veCau(915, 1080, 75, 240);

    // Trạm thủy lợi mái xanh ở góc trên và bụi cây/lục bình ven bờ
    for (const [cx, cy, r] of [[80, 220, 55], [1000, 260, 60], [75, 1650, 65], [1010, 1620, 60]]) {
      g.fillStyle = '#22C55E';
      g.strokeStyle = '#1E1B4B';
      g.lineWidth = 7;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    return { url: cv.toDataURL('image/png'), w: cv.width, h: cv.height };
  }));

  await tr.close();
} finally {
  may.kill();
}
