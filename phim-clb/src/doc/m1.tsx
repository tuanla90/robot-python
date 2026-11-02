// 10 phim gói mùa 1 "Kho hàng", khổ dọc, viết lại 2/11 theo hoc/KE-HOACH-SUA-PHIM-GOI.md (luật hoc/LUAT-SUA-PHIM-CLB.md mục 1–8):
// mỗi gói: [kết gói trước 1 cảnh] → hiện trường thử không được (lỗi đúng vật lý game) → [trong xe Luna chế part] → sa bàn Lab giải thích cơ chế
// trên SÂN THẬT của màn đầu gói (hoc/lo-trinh-hoc.js), lệnh đúng tên game → câu treo. Mọi hoạt cảnh chạy bằng bộ mô phỏng sa-ban.tsx (ô nguyên).
// Thứ tự gói theo game: 1 xe · 2 tay-gap · 3 cam-bien · 4 kho-hang · 5 banh-lui · 6 tay-xoay · 7 me-cung · 8 combo (tổng duyệt) · 9 hai-robot · 10 robot.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, DongHo, LoaiNangCap, NenHienTruong, NhanGoi, Nguoi, TrongXe, chonDangNguoi} from './kit-doc';
import {KhungSaBan, N, Nhip, SaBan, nhipTai, tamKhung} from './sa-ban';
import {R1Ngang, SanNgang, ThungNgang} from '../PhimTayKep';

const NEN = 'nen-doc/mua-1.png';
const DON = ['Dạy xe chạy', 'Dọn lối', 'Thùng chạy chỗ', 'Kho lạnh', 'Ngõ cụt', 'Lối hẹp hai bên', 'Mê cung kệ', 'Tổng duyệt bến', 'Đơn kho lạnh cuối', 'Xe tải lên đường'];
const GIO = (h: number, m = 0) => h * 60 + m;
const TU = 30, NHIP = 22;                      // khung bắt đầu chạy lệnh, khung mỗi nhịp
const DUR = 240;                               // cảnh có thoại 8s (luật mục 2)
const S1 = (text: string): Say[] => [{at: 14, out: 120, text}];
const S2 = (text: string, out = DUR): Say[] => [{at: 126, out, text}];

/* ------------------------------------------------------------------ nhân vật (bóng thoại ≤ 10 chữ, bubbleTop 1180, luật mục 3) */
const Tung: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string; doiAnh?: [number, string][]}> = ({says, at = 0, x = 820, side = 'left', dang = 'tu-nghi', doiAnh}) => (
  <Nguoi anh={dang} doiAnh={doiAnh} ten="CHÚ TÙNG" mau="#EA580C" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1180} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={560} bubbleTop={1180} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={560} bubbleTop={1180} lat />
);

/* ------------------------------------------------------------------ khung cảnh */
/** Hiện trường kho: nền ảnh, sa bàn kho (kệ = ô kệ hàng game, không vẽ ô sàn). */
const Kho: React.FC<{children?: React.ReactNode}> = ({children}) => <NenHienTruong anh={NEN} luoi={false}>{children}</NenHienTruong>;

/** Sa bàn Lab của CLB: nền sáng, lưới mờ; ô sàn Lab của game. */
const Lab: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #D9D6F7 0%, #C3CDEF 100%)', fontFamily: FONT, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(76,29,149,.09) 2px, transparent 2px), linear-gradient(90deg, rgba(76,29,149,.09) 2px, transparent 2px)',
      backgroundSize: '150px 150px', backgroundPosition: '165px 330px'}} />
    <div style={{position: 'absolute', right: 36, top: 46, padding: '10px 22px', borderRadius: 18, background: '#fff', border: `5px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`,
      fontWeight: 900, fontSize: 30, color: C.ink, display: 'inline-flex', alignItems: 'center', gap: 10}}>
      <Icon name="FlaskConical" size={30} color={C.violet} stroke={2.8} />Sa bàn Lab</div>
    {children}
  </AbsoluteFill>
);

/** Bảng mật lệnh + nút Chạy; dòng sáng theo nhịp đang chạy. */
const BangLenh: React.FC<{lines: string[]; nhip: Nhip[]; tu?: number; moiNhip?: number; y?: number; w?: number; size?: number}> = ({lines, nhip, tu = TU, moiNhip = NHIP, y = 60, w = 620, size = 34}) => {
  const f = useCurrentFrame();
  const {i, dong} = nhipTai(f, nhip, tu, moiNhip);
  const lun = f >= tu - 8 && f < tu - 2;
  return (
    <>
      <CodeBox lines={lines} x={70} y={y} w={w} size={size} title="mat_lenh.py" hl={i > 0 ? dong : undefined} />
      <div style={{position: 'absolute', left: 730, top: y + 55, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 20, fontSize: 36, fontWeight: 800,
        fontFamily: FONT, color: '#fff', background: lun ? C.solaDeep : C.sola, transform: `scale(${lun ? 0.9 : 1})`, boxShadow: '0 10px 24px rgba(2,132,199,.35)'}}>
        <Icon name="Play" size={32} color="#fff" />Chạy
      </div>
    </>
  );
};

/** Chữ hiệu ứng tại ô (x, y) của khung sa bàn, lệch lên trên. */
const ChuO: React.FC<{k: KhungSaBan; x: number; y: number; chu: string; at: number; den?: number; mau?: string; co?: number}> = ({k, x, y, chu, at, den, mau, co = 72}) => {
  const p = tamKhung(k, x, y);
  return <ChuNay chu={chu} at={at} den={den ?? at + 50} x={p.x} y={p.y - k.o * 0.9} mau={mau} co={co} />;
};
const khungNhip = (i: number, tu = TU, moiNhip = NHIP) => tu + (i - 1) * moiNhip;   // khung bắt đầu nhịp i (1..n)

/* ------------------------------------------------------------------ đoạn kết gói: bảng đơn hàng gạch một dòng, chú Tùng một câu (6s) */
const ThanhTuu: React.FC<{so: number; loi: string; gio: number; xoa?: number}> = ({so, loi, gio, xoa}) => (
  <NenHienTruong anh={NEN} mua="m1" luoi={false} toi={0.52}>
    <BangViec tieuDe="Đơn hàng chiều nay" dong={DON} xong={so - 1} moi={so - 1} xoa={xoa} at={22} y={200} />
    <DongHo tu={gio} />
    <NhanGoi so={so} ten={DON[so - 1]} />
    <Tung dang={chonDangNguoi('tu', so, xoa)} says={[{at: 40, out: 999, text: loi}]} at={30} />
  </NenHienTruong>
);

/* ================================================================== GÓI 1 · Hai bánh xe (hai-banh.1 "Bước đầu tiên") */
const SAN_KHO_1 = ['.o.o.', '.....', 'o.o.o', '.....', '.o.o.', '.....', '.....'];
const G1Kho: React.FC = () => (
  <Kho>
    <SaBan san={SAN_KHO_1} batDau={{x: 2, y: 6, huong: 0}} nhip={[]} vo="kho" khongSan anXe />
    <DongHo tu={GIO(13)} />
    <NhanGoi so={1} ten="Hai bánh xe" />
    <Tung dang="tu-sot-ruot" says={S1('Năm giờ xe tải tới, hàng còn đầy lối!')} />
    <Sola says={S2('R1 chưa có bánh, lăn sao nổi!')} mat={[[0, 'surprised-sach'], [120, 'worried']]} />
  </Kho>
);
// Lab 1: bẫy chữ LEFT. Thùng bên trái, Sola gọi bánh trái → bánh trái lăn → xe quay PHẢI (game quay tại chỗ).
const SAN_LAB_1 = ['.....', '.....', '.....', '.o...', '.....'];
const BD_1 = {x: 2, y: 3, huong: 0 as const};
const NHIP_BAY = [N.leftMove(0)];
const G1Bay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Lab>
      <SaBan san={SAN_LAB_1} batDau={BD_1} nhip={NHIP_BAY} tu={130} anhXe="r1" anhNgac="r1-ngac" banhSang={() => 'trai'} vet={false}>
        {(k) => f >= 150 ? <ChuO k={k} x={2} y={3} chu="?!" at={150} den={240} mau={C.bad} co={96} /> : null}
      </SaBan>
      <BangLenh lines={['left_move()', 'wait()']} nhip={NHIP_BAY} tu={130} />
      <Sola says={[{at: 14, out: 118, text: 'Thùng bên trái, gọi bánh trái!'}, {at: 160, out: DUR, text: 'Ơ, sao lại quay sang PHẢI?'}]} mat={[[0, 'confident'], [150, 'shocked']]} />
    </Lab>
  );
};
// Lab 2: Luna hỏi bánh nào lăn; Sola nói ra quy luật.
const G1Vet: React.FC = () => (
  <Lab>
    <SaBan san={SAN_LAB_1} batDau={BD_1} nhip={[N.leftMove(0)]} tu={60} anhXe="r1" banhSang={() => 'trai'} vet={false} />
    <BangLenh lines={['left_move()', 'wait()']} nhip={[N.leftMove(0)]} tu={60} />
    <Luna says={S1('Bánh nào đang lăn?')} mat={[[0, 'thinking'], [120, 'explaining']]} />
    <Sola says={S2('Bánh trái lăn thì xe quay phải!')} mat={[[0, 'thinking'], [126, 'happy']]} />
  </Lab>
);
// Lab 3: muốn quay TRÁI về phía thùng thì gọi bánh PHẢI.
const NHIP_DOAN = [N.rightMove(0)];
const G1Doan: React.FC = () => (
  <Lab>
    <SaBan san={SAN_LAB_1} batDau={BD_1} nhip={NHIP_DOAN} tu={150} anhXe="r1" anhVui="r1-vui" banhSang={() => 'phai'} vet={false}>
      {(k) => <Burst at={176} x={tamKhung(k, 1, 3).x} y={tamKhung(k, 1, 3).y} color={C.yellow} />}
    </SaBan>
    <BangLenh lines={['right_move()', 'wait()']} nhip={NHIP_DOAN} tu={150} />
    <Luna says={S1('Muốn quay TRÁI thì bánh nào?')} mat={[[0, 'wink'], [176, 'cheer']]} />
    <Sola says={S2('Bánh phải! Nhìn thẳng thùng rồi!')} mat={[[0, 'thinking'], [126, 'confident'], [176, 'cheer']]} />
  </Lab>
);
// Lab 4: màn 1 thật "Bước đầu tiên": hai bánh cùng lăn = đi thẳng một ô tới cờ.
const MAN_1_1 = {san: ['.....', '.....', '.....', '..F..', '.....'], bd: {x: 2, y: 4, huong: 0 as const}};
const NHIP_1_1 = [N.haiBanh(0)];
const G1Thang: React.FC = () => (
  <Lab>
    <SaBan san={MAN_1_1.san} batDau={MAN_1_1.bd} nhip={NHIP_1_1} tu={130} anhXe="r1" anhVui="r1-vui" banhSang={() => 'ca'}>
      {(k) => <Burst at={150} x={tamKhung(k, 2, 3).x} y={tamKhung(k, 2, 3).y} color={C.yellow} />}
    </SaBan>
    <BangLenh lines={['left_move()', 'right_move()', 'wait()']} nhip={NHIP_1_1} tu={130} />
    <Luna says={S1('Hai bánh cùng lăn thì sao?')} mat={[[0, 'thinking'], [150, 'great-job']]} />
    <Sola says={S2('Đi thẳng! Tới cờ rồi!')} mat={[[0, 'confident'], [150, 'cheer']]} />
  </Lab>
);

/* ================================================================== GÓI 2 · Tay gắp (tay-gap.1 "Nhặt và đặt") */
const SAN_KHO_2 = ['.....', '.o.o.', '..o..', '.....', '.....', '.....', '.....'];
const NHIP_HUC = [N.move(), N.move(), N.move()];           // ô thứ ba có thùng: đâm, khựng, choáng
const G2Thu: React.FC = () => {
  const f = useCurrentFrame();
  const tDam = khungNhip(3) + 8;
  return (
    <Shake hits={[tDam]} amp={12}>
      <Kho>
        <SaBan san={SAN_KHO_2} batDau={{x: 2, y: 5, huong: 0}} nhip={NHIP_HUC} vo="kho" khongSan anhXe="r1" anhNgac="r1-ngac">
          {(k) => f >= tDam ? <ChuO k={k} x={2} y={2} chu="CỘP!" at={tDam} den={tDam + 60} /> : null}
        </SaBan>
        <DongHo tu={GIO(13, 20)} />
        <NhanGoi so={2} ten="Tay gắp" />
        <Sola says={S1('R1 húc thùng ra là xong!')} mat={[[0, 'confident'], [tDam, 'shocked']]} />
        <Luna says={S2('Húc không nổi. Thùng có quai kìa?')} mat={[[0, 'calm'], [126, 'magnifier']]} at={100} />
      </Kho>
    </Shake>
  );
};
// Cơ chế tay kẹp đổi độ cao (hạ / nâng) → GÓC MÁY NGANG (user 2/11): robot vẽ bằng mã SVG `R1Ngang` của PhimTayKep.tsx (bản Remotion cũ user đã duyệt:
// vỏ bo góc, kính một mắt, 4 bánh tròn lăn theo `lan`, rãnh trượt nâng hạ `uHa`, gọng kẹp `dong`); thùng `ThungNgang`; sàn `SanNgang` (sàn y = 880).
// Cảnh 1: tay đang giơ cao mà grab() → khép gọng giữa không, kẹp hụt. Cảnh 2: lời giải màn tay-gap.1: hạ, kẹp, nâng, đi một ô, hạ, thả vào ô đích.
const G2Hut: React.FC = () => {
  const f = useCurrentFrame();
  const khep = f >= 48 && f < 150;
  return (
    <Shake hits={[48]} amp={8}>
      <SanNgang dangCao>
        <ThungNgang x={320 + 178} y={880 - 136} />
        <R1Ngang x={320} uHa={0} dong={khep} mat={khep ? 'ngac' : 'thuong'} />
        {khep ? <ChuNay chu="HỤT!" at={48} den={150} x={700} y={560} mau={C.warn} co={80} /> : null}
        <BangLenh lines={['grab()', 'wait()']} nhip={[N.grab(0), N.wait(1)]} tu={40} moiNhip={40} y={40} />
        <Luna says={S1('Tay đang giơ cao kìa?')} mat={[[0, 'thinking']]} />
        <Sola says={S2('Phải hạ tay xuống sàn trước!')} mat={[[0, 'confident'], [48, 'shocked'], [126, 'thinking']]} />
      </SanNgang>
    </Shake>
  );
};
const G2Dung: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = 270, O_NGANG = 250;
  const uHa1 = ease(f, [36, 58], [0, 1]), kep = f >= 62, uNang = ease(f, [72, 96], [0, 1]);
  const uDi = ease(f, [104, 160], [0, 1]), uHa2 = ease(f, [168, 190], [0, 1]), tha = f >= 196;
  const uHa = f < 72 ? uHa1 : f < 168 ? 1 - uNang : uHa2;
  const xR1 = x0 + uDi * O_NGANG;
  const yThung = !kep || tha ? 880 - 136 : 880 - 136 - (1 - uHa) * 200;      // thùng theo tay khi đang kẹp
  const xThung = !kep ? x0 + 178 : tha ? x0 + O_NGANG + 178 : xR1 + 178;
  const hl = f < 36 ? undefined : f < 72 ? 0 : f < 104 ? 1 : f < 168 ? 2 : 3;
  return (
    <SanNgang dangCao={uHa < 0.5}>
      <div style={{position: 'absolute', left: x0 + O_NGANG + 178 - 42, top: 862, width: 220, height: 22, borderRadius: 8, background: '#FACC15', border: '4px solid #2E2A5A', zIndex: 7}} />
      <ThungNgang x={xThung} y={yThung} />
      <R1Ngang x={xR1} uHa={uHa} dong={kep && !tha} lan={uDi * 4} mat={tha ? 'vui' : 'thuong'} />
      <Burst at={198} x={x0 + O_NGANG + 178 + 68} y={800} color={C.yellow} />
      <CodeBox lines={['arm_down(); grab(); wait()', 'arm_up(); wait()', 'move()', 'arm_down(); release(); wait()']} x={70} y={40} w={620} size={30} title="mat_lenh.py" hl={hl} />
      <Sola says={S1('Hạ, kẹp, nâng, đi, thả!')} mat={[[0, 'confident'], [198, 'cheer']]} />
      <Luna says={S2('Nâng lên rồi mới chạy nhé!')} mat={[[0, 'calm'], [198, 'great-job']]} />
    </SanNgang>
  );
};

/* ================================================================== GÓI 3 · Cảm biến khoảng cách (khoang-cach.1 "Hỏi trước khi đi") */
const SAN_KHO_3 = ['.....', '.....', '.....', '..o..', '.....', '.....', '.....'];
const NHIP_DEM = [N.move(1), N.move(1), N.move(1)];        // đếm cứng ba bước: thùng vừa bị dời lại gần → cộp
const G3Thu: React.FC = () => {
  const f = useCurrentFrame();
  const tDam = khungNhip(2) + 8;
  return (
    <Shake hits={[tDam]} amp={8}>
      <Kho>
        <SaBan san={SAN_KHO_3} batDau={{x: 2, y: 5, huong: 0}} nhip={NHIP_DEM} vo="kho" khongSan anhXe="kep" anhNgac="kep-ngac">
          {(k) => f >= tDam ? <ChuO k={k} x={2} y={3} chu="CỘP!" at={tDam} den={tDam + 60} /> : null}
        </SaBan>
        <BangLenh lines={['for i in range(3):', '    move()']} nhip={NHIP_DEM} size={30} y={130} />
        <DongHo tu={GIO(13, 40)} />
        <NhanGoi so={3} ten="Cảm biến khoảng cách" />
        <Sola says={S1('Đếm ba bước là tới!')} mat={[[0, 'confident'], [tDam, 'facepalm']]} />
        <Tung says={S2('Chú vừa dời thùng lại gần.')} at={100} />
      </Kho>
    </Shake>
  );
};
const MAN_3_1 = {san: ['###', '#.#', '#.#', '#.#', '#.#'], bd: {x: 1, y: 4, huong: 0 as const}};
const NHIP_3_1 = [N.hoi('truoc', 'front_clear()', 1, true), N.hoi('truoc', 'front_clear()', 1, true), N.hoi('truoc', 'front_clear()', 1, true), N.hoi('truoc', 'front_clear()', 1), N.hoi('truoc', 'front_clear()', 1)];
const G3Hoi: React.FC = () => (
  <Lab>
    <SaBan san={MAN_3_1.san} batDau={MAN_3_1.bd} nhip={NHIP_3_1} anhXe="kep-cam" anhVui="kep-cam-vui" />
    <BangLenh lines={['for i in range(5):', '    if front_clear():', '        move()']} nhip={NHIP_3_1} size={30} />
    <Luna says={S1('Mắt soi ô nào?')} mat={[[0, 'thinking'], [126, 'great-job']]} />
    <Sola says={S2('Ô sát mũi. Trống thì đi!')} mat={[[0, 'thinking'], [126, 'confident']]} />
  </Lab>
);
const SAN_LAB_3B = ['#.#', '#.#', '#o#', '#.#', '#.#'];
const NHIP_3B = [N.hoi('truoc', 'front_clear()', 0, true), N.hoi('truoc', 'front_clear()', 0)];
const G3Dung: React.FC = () => (
  <Lab>
    <SaBan san={SAN_LAB_3B} batDau={{x: 1, y: 4, huong: 0}} nhip={NHIP_3B} tu={60} anhXe="kep-cam" anhVui="kep-cam-vui">
      {(k) => <Burst at={60 + NHIP + 12} x={tamKhung(k, 1, 3).x} y={tamKhung(k, 1, 3).y} color={C.good} />}
    </SaBan>
    <BangLenh lines={['while front_clear():', '    move()']} nhip={NHIP_3B} tu={60} size={30} />
    <Sola says={S1('Gặp thùng là tự dừng!')} mat={[[0, 'confident'], [110, 'cheer']]} />
    <Luna says={S2('Dời đâu cũng dừng sát.')} mat={[[0, 'calm'], [126, 'happy']]} />
  </Lab>
);

/* ================================================================== GÓI 4 · Kho hàng, nút đè (nut-de.1 "Thùng giữ cửa") */
const SAN_KHO_4 = ['#####', '##F##', '##.##', '##C##', '##.##', '#oM##', '##.##'];
const NHIP_SAP = [N.move(), N.move(), N.move(), N.move()];     // lên nút: cửa mở; rời nút: sập ngay trước mũi; đâm cửa
const G4Thu: React.FC = () => {
  const f = useCurrentFrame();
  const tMo = khungNhip(1) + 16, tSap = khungNhip(2) + 16, tDam = khungNhip(3) + 8;
  return (
    <Shake hits={[tSap, tDam]} amp={12}>
      <Kho>
        <SaBan san={SAN_KHO_4} batDau={{x: 2, y: 6, huong: 0}} nhip={NHIP_SAP} vo="kho" khongSan anhXe="kep-cam" anhNgac="kep-cam-ngac">
          {(k) => <>
            {f >= tMo && f < tSap ? <ChuO k={k} x={2} y={3} chu="MỞ!" at={tMo} den={tSap} mau={C.good} /> : null}
            {f >= tSap ? <ChuO k={k} x={2} y={3} chu="SẬP!" at={tSap} den={tSap + 60} co={96} /> : null}
          </>}
        </SaBan>
        <DongHo tu={GIO(14, 20)} />
        <NhanGoi so={4} ten="Kho hàng" />
        <Sola says={S1('Cửa mở rồi, chạy!')} mat={[[0, 'confident'], [tSap, 'shocked']]} />
        <Tung dang="tu-tin" doiAnh={[[tSap, 'tu-hoang']]} says={S2('Ấy chết! Rời nút là sập!')} />
      </Kho>
    </Shake>
  );
};
const MAN_4_1 = {san: ['#####', '##F##', '##.##', '##C##', '#Mo##', '##.##', '#####'], bd: {x: 2, y: 5, huong: 0 as const}};
// lời giải màn thật (carry() của em = nhặt thùng, tiến một ô, quay trái đặt lên nút M, quay lại), rồi ba bước qua cửa tới cờ
const NHIP_4_1 = [...N.pick(0), N.move(0), N.turnLeft(1), ...N.drop(1), N.turnRight(2), N.move(3), N.move(3), N.move(3)];
const G4Nut: React.FC = () => {
  const f = useCurrentFrame();
  const tMo = khungNhip(5, TU, 20) + 12;
  return (
    <Lab>
      <SaBan san={MAN_4_1.san} batDau={MAN_4_1.bd} nhip={NHIP_4_1} anhXe="kep-cam" anhVui="kep-cam-vui" moiNhip={20} top={330} cao={810}>
        {(k) => f >= tMo ? <ChuO k={k} x={2} y={3} chu="MỞ!" at={tMo} den={tMo + 50} mau={C.good} /> : null}
      </SaBan>
      <BangLenh lines={['pick(); move()', 'turn_left(); drop()', 'turn_right()', 'move(); move(); move()']} nhip={NHIP_4_1} moiNhip={20} size={30} />
      <Luna says={S1('Cửa mở lúc nào nhỉ?')} mat={[[0, 'thinking'], [tMo, 'great-job']]} />
      <Sola says={S2('Có gì đè nút! Thùng đè!', 999)} mat={[[0, 'thinking'], [100, 'excited']]} />
    </Lab>
  );
};

/* ================================================================== GÓI 5 · Bánh lùi (banh-lui.5 "Xe lùi") */
const SAN_KHO_5 = ['.#o#.', '.#.#.', '.#.#.', '.#.#.', '.....', '.....', '.....'];
// vào sâu ngõ cụt kẹp thùng, quay đầu mất hai nhịp (game xoay tại chỗ được, nhưng tốn nhịp: lý do gói 5 = chậm so với đồng hồ)
const NHIP_KET = [N.move(), N.move(), N.move(), N.move(), N.move(), ...N.pick(), N.turnLeft(), N.turnLeft()];
const G5Thu: React.FC = () => {
  const f = useCurrentFrame();
  const tQuay = khungNhip(8);
  return (
    <Kho>
      <SaBan san={SAN_KHO_5} batDau={{x: 2, y: 6, huong: 0}} nhip={NHIP_KET} vo="kho" khongSan anhXe="kep-cam">
        {(k) => f >= tQuay ? <ChuO k={k} x={2} y={1} chu="+2 nhịp…" at={tQuay} den={DUR} mau={C.warn} co={64} /> : null}
      </SaBan>
      <DongHo tu={GIO(15)} den={GIO(15, 4)} dai={DUR} />
      <NhanGoi so={5} ten="Bánh lùi" />
      <Sola says={S1('Kẹp xong, quay đầu về!')} mat={[[0, 'confident'], [tQuay, 'worried']]} />
      <Luna says={[{at: 150, out: DUR, text: 'Quay đầu tốn nhịp. Bánh chỉ tiến được à?'}]} mat={[[0, 'calm'], [150, 'thinking']]} at={100} />
    </Kho>
  );
};
const MAN_5_1 = {san: ['..o..', '.....', '.....', '.....', '#####'], bd: {x: 2, y: 1, huong: 0 as const}};
const NHIP_5_1 = [N.haiBanhLui(0), N.haiBanhLui(0)];
const G5Lui: React.FC = () => (
  <Lab>
    <SaBan san={MAN_5_1.san} batDau={MAN_5_1.bd} nhip={NHIP_5_1} anhXe="kep-cam" anhVui="kep-cam-vui" banhSang={() => 'ca'} />
    <BangLenh lines={['left_back()', 'right_back()', 'wait()']} nhip={NHIP_5_1} />
    <Sola says={S1('Hai bánh quay ngược!')} mat={[[0, 'confident'], [100, 'cheer']]} />
    <Luna says={S2('Lùi thẳng, mắt vẫn nhìn thùng!')} mat={[[0, 'calm'], [126, 'great-job']]} />
  </Lab>
);

/* ================================================================== GÓI 6 · Tay xoay, bước lùi (tay-xoay.1 "Xoay sang trái") */
const SAN_KHO_6 = ['#...#', '#o.o#', '#...#', '#o.o#', '#...#', '#...#', '#...#'];
const NHIP_QUAY = [N.move(), N.move(), N.move(), N.turnLeft(), ...N.pick(), N.turnRight()];   // kẹp thùng bên hông: phải quay cả xe, mất thêm hai nhịp
const G6Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[8, 20]} amp={16}>
      <Kho>
        <SaBan san={SAN_KHO_6} batDau={{x: 2, y: 6, huong: 0}} nhip={NHIP_QUAY} vo="kho" khongSan anhXe="kep-cam" tu={60}>
          {(k) => f >= khungNhip(7, 60) ? <ChuO k={k} x={2} y={3} chu="+2 nhịp…" at={khungNhip(7, 60)} den={DUR} mau={C.warn} co={64} /> : null}
        </SaBan>
        <ChuNay chu="RẦM!" at={8} den={60} x={540} y={300} co={110} />
        <DongHo tu={GIO(15, 20)} den={GIO(15, 50)} dai={DUR} />
        <NhanGoi so={6} ten="Tay xoay" />
        <Tung dang="tu-hoang" says={S1('Kệ sập! Thùng tràn ra lối!')} />
        <Sola says={S2('Quay cả xe mỗi thùng, lâu quá!')} mat={[[0, 'worried']]} />
      </Kho>
    </Shake>
  );
};
const MAN_6_1 = {san: ['.....', '.....', '..D..', '.o...', '.....'], bd: {x: 2, y: 3, huong: 0 as const}};
const NHIP_6_1: Nhip[] = [
  {lenh: 'arm_left() arm_down() grab()', dong: 0, xoay: 'trai', tayHa: true, kep: true},
  {lenh: 'arm_up() arm_right()', dong: 1, tayNang: true, xoay: 'phai'},
  {lenh: 'arm_down() release()', dong: 2, tayHa: true, tha: true},
];
const G6Xoay: React.FC = () => (
  <Lab>
    <SaBan san={MAN_6_1.san} batDau={MAN_6_1.bd} nhip={NHIP_6_1} anhXe="xoay" anhVui="xoay-vui" moiNhip={30}>
      {(k) => <Burst at={TU + 30 * 3} x={tamKhung(k, 2, 2).x} y={tamKhung(k, 2, 2).y} color={C.yellow} />}
    </SaBan>
    <BangLenh lines={['arm_left(); arm_down(); grab(); wait()', 'arm_up(); arm_right(); wait()', 'arm_down(); release(); wait()']} nhip={NHIP_6_1} moiNhip={30} size={28} />
    <Sola says={S1('Xe đứng yên, tay quay!')} mat={[[0, 'confident'], [120, 'cheer']]} />
    <Luna says={S2('Ba nhịp xong một thùng!')} mat={[[0, 'calm'], [126, 'great-job']]} />
  </Lab>
);

/* ================================================================== GÓI 7 · Cảm biến bên (cam-bien-ben.1 "Lối bên trái") */
const SAN_KHO_7 = ['#.#D#', '#.#.#', '#...#', '##.##', '##.##', '##.##', '##.##'];
const NHIP_BUA = [N.move(), N.move(), N.move(), N.move(), N.turnLeft(), N.move(), N.turnRight(), N.move(), N.move()];   // rẽ bừa sang trái: ngõ cụt
const G7Thu: React.FC = () => {
  const f = useCurrentFrame();
  const tRe = khungNhip(5, TU, 18), tCut = khungNhip(9, TU, 18) + 10;
  return (
    <Kho>
      <SaBan san={SAN_KHO_7} batDau={{x: 2, y: 6, huong: 0}} nhip={NHIP_BUA} vo="kho" khongSan anhXe="kep-cam" anhNgac="kep-cam-ngac" moiNhip={18}>
        {(k) => <>
          {f >= tRe - 20 && f < tRe + 10 ? <ChuO k={k} x={2} y={2} chu="?" at={tRe - 20} den={tRe + 10} mau={C.violet} co={90} /> : null}
          {f >= tCut ? <ChuO k={k} x={1} y={0} chu="NGÕ CỤT!" at={tCut} den={DUR} /> : null}
        </>}
      </SaBan>
      <DongHo tu={GIO(16)} den={GIO(16, 5)} dai={DUR} />
      <NhanGoi so={7} ten="Cảm biến bên" />
      <Sola says={[{at: 14, out: 118, text: 'Hai lối y hệt… rẽ trái!'}, {at: 126, out: DUR, text: 'Toang, ngõ cụt rồi!'}]} mat={[[0, 'thinking'], [tRe, 'confident'], [tCut, 'shocked']]} />
    </Kho>
  );
};
const MAN_7_1 = {san: ['#####', '#F..#', '###.#', '###.#', '#####'], bd: {x: 3, y: 3, huong: 0 as const}};
const NHIP_7_1 = [N.hoi('truoc', 'go_wall()', 0, true), N.hoi('truoc', 'go_wall()', 0, true), N.hoi('truoc', 'go_wall()', 0), N.hoi('trai', 'left_clear()', 1), N.turnLeft(2), N.hoi('truoc', 'go_wall()', 3, true), N.hoi('truoc', 'go_wall()', 3, true)];
const G7Hoi: React.FC = () => (
  <Lab>
    <SaBan san={MAN_7_1.san} batDau={MAN_7_1.bd} nhip={NHIP_7_1} anhXe="du" anhVui="du-vui">
      {(k) => <Burst at={khungNhip(7) + 16} x={tamKhung(k, 1, 1).x} y={tamKhung(k, 1, 1).y} color={C.yellow} />}
    </SaBan>
    <BangLenh lines={['go_wall()', 'if left_clear():', '    turn_left()', '    go_wall()']} nhip={NHIP_7_1} size={30} />
    <Luna says={S1('Trước mặt kệ. Bên nào trống?')} mat={[[0, 'thinking'], [khungNhip(4), 'magnifier']]} />
    <Sola says={S2('Trái trống! Rẽ trái!')} mat={[[0, 'thinking'], [126, 'confident'], [khungNhip(7) + 16, 'cheer']]} />
  </Lab>
);

/* ================================================================== GÓI 8 · Tổng duyệt (combo.1 "Thùng nằm bên nào"): mọi yếu tố của kho trên một sân */
// Chuẩn 2/11: gói 8 thử mọi tình huống / yếu tố map của mùa với xe mới. Mùa 1 chưa có nơi trước nên là yếu tố của chính kho; phim lý giải: chạy thử hết một lượt trước khi giao.
const SAN_BEN_8 = ['##D##', '##C##', '#M.##', '##.o#', '##.##', '##.##', '##.##'];
const NHIP_NHIN = [N.move(), N.move(), N.move(), N.hoi('phai', 'right_clear()')];
const G8Thu: React.FC = () => (
  <Kho>
    <SaBan san={SAN_BEN_8} batDau={{x: 2, y: 6, huong: 0}} nhip={NHIP_NHIN} vo="kho" khongSan anhXe="du" />
    <DongHo tu={GIO(16)} />
    <NhanGoi so={8} ten="Tổng duyệt" />
    <Tung dang="tu-tin" says={S1('Trước khi giao, chạy thử hết một lượt!')} />
    <Luna says={S2('Xe xong rồi, sao còn thử?')} mat={[[0, 'thinking']]} />
  </Kho>
);
const NHIP_8 = [N.move(0), N.move(0), N.move(0), ...N.pickRight(1), N.move(2), ...N.dropLeft(2), N.move(3), N.move(3)];
const G8Ghep: React.FC = () => {
  const f = useCurrentFrame();
  const tMo = khungNhip(7, TU, 20) + 12;
  return (
    <Lab>
      <SaBan san={SAN_BEN_8} batDau={{x: 2, y: 6, huong: 0}} nhip={NHIP_8} anhXe="du" anhVui="du-vui" moiNhip={20} top={330} cao={810}>
        {(k) => <>
          {f >= tMo ? <ChuO k={k} x={2} y={1} chu="MỞ!" at={tMo} den={tMo + 40} mau={C.good} /> : null}
          <Burst at={khungNhip(10, TU, 20) + 16} x={tamKhung(k, 2, 0).x} y={tamKhung(k, 2, 0).y} color={C.yellow} />
        </>}
      </SaBan>
      <BangLenh lines={['move(); move(); move()', 'pick_right()', 'move(); drop_left()', 'move(); move()']} nhip={NHIP_8} moiNhip={20} size={30} />
      <Sola says={S1('Thử hết mới dám giao!')} mat={[[0, 'confident'], [200, 'cheer']]} />
      <Luna says={S2('Thùng, nút, cửa, đích: một lượt!')} mat={[[0, 'calm'], [126, 'great-job']]} />
    </Lab>
  );
};

/* ================================================================== GÓI 9 · Hai thiết bị: R2 (hai-robot.1 "Hai lá cờ") */
const SAN_KHO_9 = ['##F##', '##.##', '##C##', '##.##', '##M##', '##.##', '##.##'];
const NHIP_SAP_9 = [N.move(), N.move(), N.move(), N.move()];
const G9Thu: React.FC = () => {
  const f = useCurrentFrame();
  const tSap = khungNhip(3) + 16, tDam = khungNhip(4) + 8;
  return (
    <Shake hits={[tSap, tDam]} amp={12}>
      <Kho>
        <SaBan san={SAN_KHO_9} batDau={{x: 2, y: 6, huong: 0}} nhip={NHIP_SAP_9} vo="kho" khongSan anhXe="du" anhNgac="du-ngac">
          {(k) => f >= tSap ? <ChuO k={k} x={2} y={2} chu="SẬP!" at={tSap} den={tSap + 60} co={96} /> : null}
        </SaBan>
        <DongHo tu={GIO(16, 30)} gap />
        <NhanGoi so={9} ten="Gặp R2" />
        <Sola says={S1('Hết thùng rồi! Rời nút là sập!')} mat={[[0, 'worried'], [tSap, 'upset']]} />
        <Luna says={S2('Giá có ai đứng giữ nút nhỉ?')} mat={[[0, 'thinking'], [126, 'magnifier']]} at={100} />
      </Kho>
    </Shake>
  );
};
const MAN_9_1 = {san: ['F#F', '.#.', '.#.', '.#.', '.#.'], bd1: {x: 0, y: 4, huong: 0 as const}, bd2: {x: 2, y: 4, huong: 0 as const}};
const NHIP_9_1 = [N.move(0), N.move(0), N.move(0), N.move(0)];
const G9Hai: React.FC = () => {
  const f = useCurrentFrame();
  const {i} = nhipTai(f, NHIP_9_1, TU, 26);
  const code = (title: string, x: number, mau: string) => (
    <div style={{position: 'absolute', left: x, top: 60, width: 440}}>
      <CodeBox lines={['move()', 'move()', 'move()', 'move()']} x={0} y={0} w={440} size={30} title={title} hl={i > 0 ? i - 1 : undefined} />
      <div style={{position: 'absolute', right: 16, top: 8, width: 18, height: 18, borderRadius: 9, background: mau, boxShadow: `0 0 12px ${mau}`}} />
    </div>
  );
  return (
    <Lab>
      <SaBan san={MAN_9_1.san} batDau={MAN_9_1.bd1} nhip={NHIP_9_1} anhXe="du" anhVui="du-vui" moiNhip={26} top={380} cao={780} />
      <SaBan san={MAN_9_1.san} batDau={MAN_9_1.bd2} nhip={NHIP_9_1} anhXe="r2" anhVui="r2-vui" moiNhip={26} top={380} cao={780} anSan />
      {code('R1 · Sola', 70, C.sola)}
      {code('R2 · Luna', 570, C.luna)}
      <Sola says={S1('Hai bảng, chạy cùng nhịp!')} mat={[[0, 'confident'], [TU + 26 * 4, 'cheer']]} />
      <Luna says={S2('R2 giữ nút, R1 vào lấy hàng!')} mat={[[0, 'calm'], [126, 'great-job']]} />
    </Lab>
  );
};

/* ================================================================== GÓI 10 · Tự động nhiều map (robot-hoan-thien.1 "Giao hàng", ba sân thật) */
const MAN_10_1 = {
  san: [['###', '#.#', '#.#', '#.#', '#o#', '#.#', '#.#'], ['#.#', '#.#', '#o#', '#.#', '#.#', '#.#', '#.#'], ['###', '###', '#.#', '#.#', '#.#', '#o#', '#.#']],
  bd: {x: 1, y: 6, huong: 0 as const},
};
const KHUNG_3 = (j: number, top: number): KhungSaBan => ({x0: 90 + j * 300, y0: top, o: 100, cot: 3, hang: 7});
// mật lệnh đếm bước cứng viết theo sân 1: sân 2 kẹp hụt rồi đâm thùng, sân 3 đâm ngay (game dừng chương trình ở cú đâm)
const CUNG_1 = [N.move(0), ...N.pick(1), N.move(2), N.move(2), N.move(2), ...N.drop(3)];
const CUNG_2 = [N.move(0), ...N.pick(1), N.move(2), N.move(2), N.move(2)];
const CUNG_3 = [N.move(0)];
// một mật lệnh cảm biến cho cả ba sân: go_wall(); pick(); go_wall(); back(); drop()
const goWall = (n: number, dong: number) => [...Array(n).fill(0).map(() => N.hoi('truoc', 'go_wall()', dong, true)), N.hoi('truoc', 'go_wall()', dong)];
const TU_1 = [...goWall(1, 0), ...N.pick(1), ...goWall(4, 2), N.back(3), ...N.drop(4)];
const TU_2 = [...goWall(3, 0), ...N.pick(1), ...goWall(3, 2), N.back(3), ...N.drop(4)];
const TU_3 = [...goWall(0, 0), ...N.pick(1), ...goWall(4, 2), N.back(3), ...N.drop(4)];
type TT = 'cho' | 'chay' | 'dat' | 'hong';
const TheSan: React.FC<{so: number; tt: TT; x: number; y: number}> = ({so, tt, x, y}) => {
  const bg = tt === 'dat' ? '#16A34A' : tt === 'hong' ? '#DC2626' : tt === 'chay' ? '#0284C7' : '#fff';
  const mau = tt === 'cho' ? C.ink : '#fff';
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 280, padding: '10px 0', borderRadius: 18, background: bg, color: mau, border: `5px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`,
      fontFamily: FONT, fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
      {tt === 'dat' ? <Icon name="Check" size={30} color="#fff" stroke={3.5} /> : tt === 'hong' ? <Icon name="X" size={30} color="#fff" stroke={3.5} /> : null}
      Sân {so}
    </div>
  );
};
const ttTai = (f: number, nhip: Nhip[], hong: boolean, tu = TU, moiNhip = NHIP): TT => {
  const {i, xong} = nhipTai(f, nhip, tu, moiNhip);
  if (i === 0) return 'cho';
  if (!xong) return 'chay';
  return hong ? 'hong' : 'dat';
};
const BaSan: React.FC<{nhip: Nhip[][]; hong: boolean[]; anhNgac?: string; moiNhip?: number; top?: number}> = ({nhip, hong, anhNgac, moiNhip = NHIP, top = 340}) => {
  const f = useCurrentFrame();
  return (
    <>
      {nhip.map((ds, j) => (
        <React.Fragment key={j}>
          <SaBan san={MAN_10_1.san[j]} batDau={MAN_10_1.bd} nhip={ds} anhXe="du" anhVui={hong[j] ? undefined : 'du-vui'} anhNgac={anhNgac} khung={KHUNG_3(j, top)} moiNhip={moiNhip} vet={false} />
          <TheSan so={j + 1} tt={ttTai(f, ds, hong[j], TU, moiNhip)} x={100 + j * 300} y={top + 710} />
        </React.Fragment>
      ))}
    </>
  );
};
const G10Cung: React.FC = () => {
  const f = useCurrentFrame();
  const tDam3 = khungNhip(1) + 8;
  return (
    <Shake hits={[tDam3, khungNhip(6) + 8]} amp={10}>
      <Kho>
        <BaSan nhip={[CUNG_1, CUNG_2, CUNG_3]} hong={[false, true, true]} anhNgac="du-ngac" />
        <BangLenh lines={['move(); pick()', 'move(); move(); move()', 'drop()']} nhip={CUNG_1} size={30} y={130} />
        <DongHo tu={GIO(16, 50)} gap />
        <NhanGoi so={10} ten="Xuất xưởng" />
        <Tung dang="tu-sot-ruot" says={S1('Ba ca, ba kiểu xếp hàng!')} />
        <Sola says={S2('Đếm bước cứng, hỏng hai sân!')} mat={[[0, 'confident'], [khungNhip(6) + 8, 'upset']]} />
      </Kho>
    </Shake>
  );
};
const G10TuDong: React.FC = () => (
  <Lab>
    <BaSan nhip={[TU_1, TU_2, TU_3]} hong={[false, false, false]} moiNhip={20} />
    <BangLenh lines={['go_wall()', 'pick()', 'go_wall()', 'back()', 'drop()']} nhip={TU_2} moiNhip={20} size={30} />
    <Sola says={S1('Một mật lệnh, mọi sân!')} mat={[[0, 'confident'], [TU + 20 * 13, 'cheer']]} />
    <Luna says={S2('Giờ cậu thả tay được rồi!', 330)} mat={[[0, 'calm'], [126, 'great-job']]} />
  </Lab>
);

/* ------------------------------------------------------------------ kết gói 10: tem xuất xưởng, ngoài đời, nhá mùa 2 */
const XuatXuong: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const tem = pop(f, 60, fps, 8);
  const PART = ['Hai bánh xe · lùi', 'Tay kẹp · xoay', 'Mắt khoảng cách · hai bên'];
  return (
    <Shake hits={[62]} amp={14}>
      <AbsoluteFill style={{background: '#1E3A8A', fontFamily: FONT, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}}>
        <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 76}}>Xe chở hàng R1</div>
        <div style={{position: 'absolute', left: 540 - 450, top: 290, width: 900, height: 900, borderRadius: 60, background: 'radial-gradient(circle, #FFFFFF 0%, #E0F2FE 75%)', border: `8px solid ${C.ink}`, overflow: 'hidden'}}>
          <Img src={staticFile('robot/m1/du-vui.png')} style={{position: 'absolute', left: 450 - 540, top: 450 - 540, width: 1080, height: 1080, transform: `rotate(-90deg) scale(${1 + 0.02 * Math.sin(f / 10)})`}} />
        </div>
        {PART.map((p, i) => (
          <div key={p} style={{position: 'absolute', left: 140, right: 140, top: 1240 + i * 100, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]), padding: '14px 28px', borderRadius: 20,
            background: 'rgba(255,255,255,.12)', border: '3px solid rgba(255,255,255,.5)', color: '#fff', fontWeight: 800, fontSize: 38, display: 'flex', gap: 18, alignItems: 'center'}}>
            <Icon name="CircleCheck" size={44} color={C.yellow} />{p}</div>
        ))}
        {f >= 54 ? (
          <div style={{position: 'absolute', left: 540, top: 740, transform: `translate(-50%, -50%) rotate(-14deg) scale(${2.4 - 1.4 * tem})`, opacity: Math.min(1, tem * 2),
            padding: '18px 44px', border: `12px solid ${C.bad}`, borderRadius: 24, color: C.bad, fontWeight: 900, fontSize: 110, letterSpacing: '0.06em', background: 'rgba(255,255,255,.9)', whiteSpace: 'nowrap'}}>XUẤT XƯỞNG</div>
        ) : null}
        <div style={{position: 'absolute', left: 80, right: 80, top: 1580, textAlign: 'center', color: '#E0E7FF', fontWeight: 700, fontSize: 38, opacity: ease(f, [100, 120], [0, 1])}}>
          Thân xe ở lại kho. Bộ não R1 về xe trạm.</div>
      </AbsoluteFill>
    </Shake>
  );
};
const NgoaiDoi: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return (
    <NenHienTruong anh={NEN} mua="m1" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>Ngoài đời</div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 230, height: 760, borderRadius: 40, background: '#fff', border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, transform: `scale(${pop(f, 6, fps)})`}}>
        <div style={{width: 360, height: 360, borderRadius: 48, background: '#2563EB', border: `6px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name="Warehouse" size={220} color="#fff" />
        </div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.ink, textAlign: 'center'}}>Robot kho tự hành</div>
      </div>
      <Luna mat={[[0, 'happy']]} says={[{at: 14, out: 999, text: 'Kho thật cũng có robot tự chạy!'}]} />
    </NenHienTruong>
  );
};
const NhaMua2: React.FC = () => {
  const f = useCurrentFrame();
  const y = ease(f, [0, 120], [-1724, -3200]);
  return (
    <AbsoluteFill style={{background: '#9BD27A', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('ban-do/dai-9.jpg')} style={{position: 'absolute', left: 0, top: y, width: 1080}} />
      <AbsoluteFill style={{background: 'rgba(15,23,42,0.28)'}} />
      <div style={{position: 'absolute', left: 540 - 170, top: 260, width: 340, height: 340, borderRadius: 40, background: '#FEE2E2', border: `6px solid #EF4444`, boxShadow: `0 10px 0 ${C.ink}`, overflow: 'hidden',
        transform: `translateX(${f > 25 && f < 75 ? (Math.floor(f / 3) % 2 ? 5 : -5) : 0}px)`}}>
        <Img src={staticFile('nguoi/hanh-hoang.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 650, opacity: ease(f, [15, 35], [0, 1]), background: '#FEF2F2', borderRadius: 34, border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`,
        padding: '30px 36px', display: 'flex', gap: 26, alignItems: 'center'}}>
        <Icon name="Radio" size={72} color="#DC2626" />
        <div style={{fontSize: 40, fontWeight: 900, color: C.ink, lineHeight: 1.3}}>"Rè… Nhà máy hơi nước cần giúp!"</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontWeight: 900, fontSize: 44, color: '#fff', textShadow: `0 6px 0 ${C.ink}`, opacity: ease(f, [60, 80], [0, 1])}}>Mùa 2 · Nhà máy</div>
    </AbsoluteFill>
  );
};

/* ================================================================== danh sách phim */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M1G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M1G${so}-Ket`, doc: true, canh});
const tt = (so: number, gio: number, loi: string, xoa?: number): Phim['canh'][number] => ({
  id: `thanh-tuu-${so}`, dur: 180, el: <ThanhTuu so={so} loi={loi} gio={gio} xoa={xoa} />, sfx: [[22, 'ding.wav', 0.5]],
});
/** Trong xe: Luna hỏi, Sola đưa giải pháp (luật kể), CẠCH ở khung 90. */
const xe = (anh: string, luna: string, sola: string, tenPart: string, nangCap?: LoaiNangCap): Phim['canh'][number] => ({
  id: 'trong-xe', dur: 160,
  el: <TrongXe anh={anh} cach={90} tenPart={tenPart} nangCap={nangCap}
    luna={[{at: 8, out: 80, text: luna}]} sola={[{at: 86, out: 160, text: sola}]}
    lunaMat={[[0, 'thinking'], [90, 'happy']]} solaMat={[[0, 'thinking'], [86, 'excited']]} />,
  sfx: [[90, 'impact.wav', 0.5], [90, 'ding.wav', 0.4]],
});
const treo = (anh: string, cau: string, so: number, ten: string): Phim['canh'][number] => ({
  id: 'cau-treo', dur: 100, el: <CauTreo anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]],
});
const canh = (id: string, dur: number, el: React.ReactNode, sfx?: Phim['canh'][number]['sfx']): Phim['canh'][number] => ({id, dur, el, sfx});
const DAM = (t: number): Phim['canh'][number]['sfx'] => [[t, 'impact.wav', 0.6], [t + 2, 'wrong.wav', 0.4]];

export const PHIM_M1: Phim[] = [
  mo(1, [
    canh('kho', DUR, <G1Kho />, [W_IN]),
    xe('r1', 'Bộ não không chân thì đi sao?', 'Lắp hai bánh xe!', 'Hai bánh xe'),
    canh('bay', DUR, <G1Bay />, [[122, 'click.wav', 0.8], [150, 'wrong.wav', 0.5]]),
    canh('vet', DUR, <G1Vet />, [[52, 'click.wav', 0.8], [100, 'pop.wav', 0.4]]),
    canh('doan', DUR, <G1Doan />, [[142, 'click.wav', 0.8], [176, 'ding.wav', 0.5]]),
    canh('thang', DUR, <G1Thang />, [[122, 'click.wav', 0.8], [150, 'ding.wav', 0.5]]),
    treo('r1', 'Thử lái trên sa bàn!', 1, 'Hai bánh xe'),
  ]),
  mo(2, [
    tt(1, GIO(13, 10), 'Ờ, biết chạy rồi đấy. Dọn thùng kia xem!'),
    canh('thu', DUR, <G2Thu />, DAM(khungNhip(3) + 8)),
    xe('kep', 'Có quai thì làm gì?', 'Nhấc lên! Lắp tay kẹp!', 'Tay kẹp'),
    canh('hut', DUR, <G2Hut />, [[34, 'click.wav', 0.8], [48, 'wrong.wav', 0.5]]),
    canh('dung', DUR, <G2Dung />, [[30, 'click.wav', 0.8], [62, 'click.wav', 0.5], [198, 'ding.wav', 0.5]]),
    treo('kep', 'Hạ tay, kẹp, nhấc!', 2, 'Tay gắp'),
  ]),
  mo(3, [
    tt(2, GIO(13, 30), 'Nhấc đặt gọn ghê! Dọn tiếp giữa kho nhé!'),
    canh('thu', DUR, <G3Thu />, [[22, 'click.wav', 0.8], ...DAM(khungNhip(2) + 8)!]),
    xe('kep-cam', 'Thùng dời hoài, đếm sao kịp?', 'Cho R1 tự nhìn phía trước!', 'Mắt khoảng cách'),
    canh('hoi', DUR, <G3Hoi />, [[22, 'click.wav', 0.8], [khungNhip(4), 'pop.wav', 0.4]]),
    canh('dung', DUR, <G3Dung />, [[52, 'click.wav', 0.8], [60 + NHIP + 12, 'ding.wav', 0.5]]),
    treo('kep-cam', 'R1 tự nhìn, mình chờ.', 3, 'Cảm biến khoảng cách'),
  ]),
  mo(4, [
    tt(3, GIO(14), 'Dời đâu cũng tìm ra! Vào kho lạnh nhé!'),
    canh('thu', DUR, <G4Thu />, [[khungNhip(1) + 16, 'click.wav', 0.6], [khungNhip(2) + 16, 'impact.wav', 0.7], ...DAM(khungNhip(3) + 8)!]),
    canh('nut', 280, <G4Nut />, [[22, 'click.wav', 0.8], [khungNhip(5, TU, 20) + 12, 'click.wav', 0.6], [khungNhip(10, TU, 20) + 16, 'ding.wav', 0.5]]),
    treo('kep-cam', 'Thùng đè nút, cửa mở!', 4, 'Kho hàng'),
  ]),
  mo(5, [
    tt(4, GIO(14, 40), 'Giữ cửa được rồi! Còn ngõ cụt kia!'),
    canh('thu', DUR, <G5Thu />, [[khungNhip(6) + 8, 'click.wav', 0.5], [khungNhip(8), 'wrong.wav', 0.35]]),
    xe('kep-cam', 'Bánh chỉ lăn tới thôi à?', 'Cho bánh quay ngược!', 'Bánh lùi', 'banh-lui'),
    canh('lui', DUR, <G5Lui />, [[22, 'click.wav', 0.8], [TU + NHIP * 2, 'ding.wav', 0.5]]),
    treo('kep-cam', 'Lùi thử trên sa bàn!', 5, 'Bánh lùi'),
  ]),
  mo(6, [
    tt(5, GIO(15, 10), 'Lùi ra gọn gàng! Giỏi!'),
    canh('thu', DUR, <G6Thu />, [[8, 'impact.wav', 0.8], [khungNhip(7, 60), 'wrong.wav', 0.4]]),
    xe('xoay', 'Quay cả xe, hay chỉ quay tay?', 'Cổ tay xoay!', 'Tay xoay', 'tay-xoay'),
    canh('xoay', DUR, <G6Xoay />, [[22, 'click.wav', 0.8], [TU + 90, 'ding.wav', 0.5]]),
    treo('xoay', 'Xe đứng yên, tay quay!', 6, 'Tay xoay'),
  ]),
  mo(7, [
    tt(6, GIO(15, 40), 'Thông lối rồi! Đường ra bến thành mê cung!'),
    canh('thu', DUR, <G7Thu />, [[khungNhip(9, TU, 18) + 10, 'wrong.wav', 0.5]]),
    xe('du', 'Bên hông có lối không, R1 biết không?', 'Gắn mắt hai bên!', 'Dò hai bên', 'cam-ben'),
    canh('hoi', DUR, <G7Hoi />, [[22, 'click.wav', 0.8], [khungNhip(4), 'pop.wav', 0.4], [khungNhip(7) + 16, 'ding.wav', 0.5]]),
    treo('du', 'Hỏi trước rồi mới rẽ.', 7, 'Cảm biến bên'),
  ]),
  mo(8, [
    tt(7, GIO(16, 5), 'Qua mê cung ngon lành! Sắp xuất bến!'),
    canh('thu', DUR, <G8Thu />, [[khungNhip(4), 'pop.wav', 0.4]]),
    canh('ghep', 280, <G8Ghep />, [[22, 'click.wav', 0.8], [khungNhip(7, TU, 20) + 12, 'click.wav', 0.6], [khungNhip(10, TU, 20) + 16, 'ding.wav', 0.5]]),
    treo('du', 'Ghép hết lại một lượt!', 8, 'Tổng duyệt'),
  ]),
  mo(9, [
    tt(8, GIO(16, 20), 'Thử hết một lượt, đạt! Còn đơn kho lạnh.'),
    canh('thu', DUR, <G9Thu />, [[khungNhip(2) + 16, 'click.wav', 0.6], [khungNhip(3) + 16, 'impact.wav', 0.7], ...DAM(khungNhip(4) + 8)!]),
    xe('r2', 'Bộ part dư trên kệ kìa?', 'Lắp R2! Hai bảng mật lệnh!', 'R2 của Luna'),
    canh('hai', DUR, <G9Hai />, [[22, 'click.wav', 0.8], [TU + 26 * 4, 'ding.wav', 0.5]]),
    treo('r2', 'Hai bảng mật lệnh nhé!', 9, 'Gặp R2'),
  ]),
  mo(10, [
    tt(9, GIO(16, 40), 'Hai đứa ăn ý quá! Mười phút cuối!'),
    canh('cung', DUR, <G10Cung />, [[22, 'click.wav', 0.8], [khungNhip(1) + 8, 'impact.wav', 0.5], ...DAM(khungNhip(6) + 8)!]),
    canh('tu-dong', 330, <G10TuDong />, [[22, 'click.wav', 0.8], [TU + 20 * 13, 'ding.wav', 0.5]]),
    treo('du', 'Lần này R1 tự làm!', 10, 'Xuất xưởng'),
  ]),
  ket(10, [
    tt(10, GIO(16, 59), 'Kịp giờ! Cảm ơn hai cháu!'),
    canh('xuat-xuong', 180, <XuatXuong />, [[60, 'impact.wav', 0.8], [62, 'ding.wav', 0.5]]),
    canh('ngoai-doi', 150, <NgoaiDoi />, [W_IN]),
    canh('nha', 150, <NhaMua2 />, [[30, 'glitch.wav', 0.4]]),
  ]),
];
