// Cảnh Lab mùa 5 phim (mùa 4 game) "Nông trại hoa" theo khuôn mùa 1 (bấm Chạy → thấy luật → Luna hỏi, Sola tự rút ra), đúng luật lõi game
// (hoc/gioi-thieu-part.js, man-tram-sac.js, man-net-lien.js, man-nhin-duoi-chan.js):
// gói 1 drone: go_up / go_down / go_left / go_right theo bản đồ, 1 nhịp 1 ô, MỖI nhịp tốn 1 pin kể cả wait(), hết pin là rơi ·
// gói 2 bộ gieo hạt: ink("red") chọn hạt không tốn nhịp, dot() chỉ ra lệnh, wait() mới gieo ô đang đứng ·
// gói 3 camera bốn hướng: color("left") đọc màu ô bên trái trên bản đồ, không tốn nhịp · gói 5 land() xuống ô sạc P thì pin đầy, take_off() cất cánh ·
// gói 6 pen_down() hạ miệng gieo, bay tới đâu gieo tới đó, pen_up() nhấc lên · gói 7 color("here") đọc ô ngay dưới bụng ("down" là ô phía dưới bản đồ).
// Ảnh drone vẽ đứng thẳng: góc luôn 0. Một nhịp drone = 12 khung.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Burst, C, Shake} from '../d10';
import {Phim, W_IN, pops} from '../may-phim';
import {ChuNay, Moc, ODat, Xe, tamO} from './kit-doc';
import {BangLenh, Chot, LenhMoi, LunaL, Nhan, SanLab, SolaL, tamLab} from './lab-doc';

const NEN = 'nen-doc/mua-4.png';
const San: React.FC<{san: React.ReactNode; children?: React.ReactNode}> = ({san, children}) => <SanLab nen={NEN} mua="m5" san={san}>{children}</SanLab>;
const N = 12;
const TuaLai: React.FC<{at: number; chu: string}> = ({at, chu}) => <Nhan x={540} y={tamLab(2, 4).y + 40} chu={chu} at={at} den={at + 22} nen="#fff" mau={C.ink} />;
/** Đồng hồ pin góc phải sa bàn: [khung, số pin]. */
const Pin: React.FC<{moc: [number, number][]}> = ({moc}) => {
  const f = useCurrentFrame();
  const n = moc.filter(([t]) => f >= t).pop()?.[1] ?? moc[0][1];
  return <Nhan x={tamLab(4, 0).x - 10} y={tamLab(4, 0).y - 115} chu={`pin: ${n}`} at={0} mau={n <= 1 ? '#FCA5A5' : '#F4F3FF'} />;
};
/** Ô hoa mọc ở khung `tu`. */
const Hoa: React.FC<{mau: string; c: number; r: number; tu: number; den?: number}> = ({mau, c, r, tu, den = 1e9}) => {
  const f = useCurrentFrame();
  return f >= tu && f < den ? <ODat ten={`o-hoa-${mau}`} c={c} r={r} /> : null;
};

/* ================================================================== GÓI 1 · Drone */
// Sai: thói quen xe bánh go_up(); wait() → mỗi ô 2 nhịp, pin 5 cạn giữa đường, rơi.
const DroneSai: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = 24;
  const R: Moc[] = [[0, 2, 4, 0], [t0, 2, 4, 0], [t0 + N, 2, 3, 0], [t0 + 2 * N, 2, 3, 0], [t0 + 3 * N, 2, 2, 0], [t0 + 4 * N, 2, 2, 0], [t0 + 5 * N, 2, 1, 0]];
  return (
    <Shake hits={[t0 + 5 * N + 4]} amp={10}>
      <San san={<>
        {[1, 2, 3].map((c) => <ODat key={c} ten="o-co-non" c={c} r={2} />)}
        <ODat ten="o-co" c={2} r={0} />
        <Xe anh={f >= 84 ? 'drone-ngac' : 'drone'} moc={R} vet={false} mo={(g) => (g < 86 ? 1 : Math.max(0.25, 1 - (g - 86) / 12))} />
      </>}>
        <BangLenh lines={['for i in range(4):', '    go_up()', '    wait()']} sang={[[t0, 1], [t0 + N, 2], [t0 + 2 * N, 1], [t0 + 3 * N, 2], [t0 + 4 * N, 1], [t0 + 5 * N, -1]]} bam={[18]} />
        <Pin moc={[[0, 5], [t0 + N, 4], [t0 + 2 * N, 3], [t0 + 3 * N, 2], [t0 + 4 * N, 1], [t0 + 5 * N, 0]]} />
        <ChuNay chu="HẾT PIN!" at={86} den={150} x={tamLab(2, 1).x + 190} y={tamLab(2, 1).y} />
        <SolaL mat={[[0, 'confident'], [86, 'shocked'], [220, 'happy']]} says={[
          {at: 90, out: 150, text: 'Ơ, còn một ô nữa mà rơi mất rồi!'},
          {at: 226, out: 296, text: 'Drone một nhịp một ô rồi, thêm wait() chỉ phí pin!'},
        ]} />
        <LunaL at={146} mat={[[146, 'thinking']]} says={[{at: 152, out: 222, text: 'Đếm xem mỗi nhịp tụt mấy vạch pin? Cả nhịp wait() nữa?'}]} />
      </San>
    </Shake>
  );
};
// Đúng: bỏ wait(): 4 nhịp 4 ô, bay qua luống mầm, còn 1 pin.
const DroneDung: React.FC = () => {
  const f = useCurrentFrame();
  const t0 = 24;
  const R: Moc[] = [[0, 2, 4, 0], [t0, 2, 4, 0], [t0 + N, 2, 3, 0], [t0 + 2 * N, 2, 2, 0], [t0 + 3 * N, 2, 1, 0], [t0 + 4 * N, 2, 0, 0]];
  return (
    <San san={<>
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-co-non" c={c} r={2} />)}
      <ODat ten="o-co" c={2} r={0} />
      <Xe anh={f >= 74 ? 'drone-vui' : 'drone'} moc={R} />
      <Burst at={74} x={tamO(2, 0).x} y={tamO(2, 0).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['for i in range(4):', '    go_up()']} typeAt={2} sang={[[t0, 1], [t0 + 4 * N, -1]]} bam={[18]} />
      <Pin moc={[[0, 5], [t0 + N, 4], [t0 + 2 * N, 3], [t0 + 3 * N, 2], [t0 + 4 * N, 1]]} />
      <Nhan x={tamLab(2, 2).x + 210} y={tamLab(2, 2).y} chu="bay qua luống" at={44} den={70} />
      <Chot tu={96} y={1090}>Drone: 1 nhịp 1 ô · mỗi nhịp tốn 1 pin, kể cả wait()</Chot>
      <LunaL at={80} mat={[[80, 'great-job']]} says={[{at: 88, out: 160, text: 'Bay vèo qua luống, không dập mầm nào!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 2 · Bộ gieo hạt */
// Sai: ink("red"); dot(); go_right() → chưa có nhịp nào cho bộ gieo làm, luống trống.
const GieoSai: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      {[1, 2].map((c) => <ODat key={c} ten="o-co-non" c={c} r={2} />)}
      <Xe anh={f >= 50 ? 'drone-son-ngac' : f >= 24 ? 'drone-son-red' : 'drone-son'} moc={[[0, 1, 2, 0], [36, 1, 2, 0], [36 + N, 2, 2, 0]]} vet={false} />
    </>}>
      <BangLenh lines={['ink("red")', 'dot()', 'go_right()']} sang={[[24, 0], [30, 1], [36, 2], [50, -1]]} bam={[18]} />
      <ChuNay chu="CHƯA GIEO!" at={50} den={120} x={tamLab(1, 2).x} y={tamLab(1, 2).y - 120} mau={C.warn} />
      <SolaL mat={[[0, 'confident'], [52, 'confused'], [200, 'happy']]} says={[
        {at: 56, out: 120, text: 'Chọn hạt đỏ, gieo rồi mà luống vẫn trống?'},
        {at: 206, out: 270, text: 'Thiếu wait()! dot() mới là ra lệnh thôi.'},
      ]} />
      <LunaL at={118} mat={[[118, 'thinking']]} says={[{at: 124, out: 200, text: 'Ra lệnh xong, R1 có nhịp nào để gieo không?'}]} />
    </San>
  );
};
// Đúng: ink + dot + wait gieo hoa hồng; sang phải, hạt vàng gieo hoa cúc.
const GieoDung: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      {[1, 2].map((c) => <ODat key={c} ten="o-co-non" c={c} r={2} />)}
      <Hoa mau="red" c={1} r={2} tu={48} />
      <Hoa mau="yellow" c={2} r={2} tu={100} />
      <Xe anh={f >= 112 ? 'drone-son-vui' : f >= 72 ? 'drone-son-yellow' : f >= 24 ? 'drone-son-red' : 'drone-son'} moc={[[0, 1, 2, 0], [60, 1, 2, 0], [60 + N, 2, 2, 0]]} vet={false} />
      <Burst at={48} x={tamO(1, 2).x} y={tamO(1, 2).y} color={C.yellow} />
      <Burst at={100} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['ink("red")', 'dot()', 'wait()', 'go_right()', 'ink("yellow")', 'dot()', 'wait()']} typeAt={2}
        sang={[[24, 0], [30, 1], [36, 2], [60, 3], [74, 4], [80, 5], [88, 6], [112, -1]]} bam={[18]} />
      <Nhan x={tamLab(3, 3).x} y={tamLab(3, 3).y} chu="ink() không tốn nhịp" at={26} den={60} />
      <Chot tu={124} y={1090}>ink() chọn hạt · dot() ra lệnh · wait() mới gieo</Chot>
      <LunaL at={110} mat={[[110, 'great-job']]} says={[{at: 130, out: 200, text: 'Hồng một ô, cúc một ô, đẹp ghê!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 3 · Camera bốn hướng */
// Sai: đoán ink("red") trong khi luống mẫu bên trái màu xanh → gieo sai màu.
const CamSai: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      <ODat ten="o-hoa-blue" c={1} r={2} />
      <ODat ten="o-co-non" c={2} r={2} />
      <Hoa mau="red" c={2} r={2} tu={48} />
      <Xe anh={f >= 52 ? 'drone-cam-ngac' : f >= 24 ? 'drone-cam-red' : 'drone-cam'} moc={[[0, 2, 2, 0]]} vet={false} />
    </>}>
      <BangLenh lines={['ink("red")', 'dot()', 'wait()']} sang={[[24, 0], [30, 1], [36, 2], [52, -1]]} bam={[18]} />
      <Nhan x={tamLab(1, 2).x} y={tamLab(1, 2).y - 110} chu="luống mẫu" at={0} />
      <ChuNay chu="KHÁC MẪU!" at={52} den={120} x={tamLab(2, 2).x + 170} y={tamLab(2, 2).y + 30} mau={C.warn} />
      <SolaL mat={[[0, 'confident'], [54, 'facepalm'], [200, 'happy']]} says={[
        {at: 58, out: 118, text: 'Đoán màu đỏ, trật mất rồi!'},
        {at: 206, out: 270, text: 'Hỏi camera màu ô bên trái trước!'},
      ]} />
      <LunaL at={116} mat={[[116, 'thinking']]} says={[{at: 122, out: 200, text: 'R1 có nhìn được luống mẫu bên trái không?'}]} />
    </San>
  );
};
// Đúng: c = color("left") rồi ink(c). Lần 1 mẫu xanh, tua lại mẫu vàng: vẫn đúng.
const CamDung: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 100;
  const t0 = lan2 ? 110 : 0;
  const mau = lan2 ? 'yellow' : 'blue';
  return (
    <San san={<>
      <ODat ten={`o-hoa-${mau}`} c={1} r={2} />
      <ODat ten="o-co-non" c={2} r={2} />
      <Hoa mau={mau} c={2} r={2} tu={t0 + 54} />
      <Xe anh={f >= t0 + 58 ? 'drone-cam-vui' : f >= t0 + 30 ? `drone-cam-${mau}` : f >= t0 + 24 ? 'drone-cam-do' : 'drone-cam'} moc={[[0, 2, 2, 0]]} vet={false} />
      <Burst at={t0 + 54} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['c = color("left")', 'ink(c)', 'dot()', 'wait()']} typeAt={lan2 ? undefined : 2} sang={[[t0 + 24, 0], [t0 + 30, 1], [t0 + 36, 2], [t0 + 42, 3], [t0 + 58, -1]]} bam={[18, 128]} />
      <Nhan x={tamLab(1, 2).x} y={tamLab(1, 2).y - 110} chu={`c = "${mau}"`} at={t0 + 26} den={t0 + 96} />
      {lan2 ? <TuaLai at={100} chu="Tua lại · đổi luống mẫu" /> : null}
      <Chot tu={176} y={1090}>color("left") đọc màu ô bên trái bản đồ · không tốn nhịp</Chot>
      <LunaL mat={[[0, 'thinking'], [170, 'great-job']]} says={[{at: 66, out: 108, text: 'Đổi mẫu khác thì sao?'}]} />
      <SolaL at={40} mat={[[40, 'confident'], [168, 'cheer']]} says={[{at: 180, out: 250, text: 'Mẫu màu gì, R1 gieo màu nấy!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 5 · Trạm sạc */
// Lần 1: bay ngang qua ô sạc P, pin 3 cạn, rơi. Tua lại: land() xuống P (pin đầy 5), take_off(), bay tiếp tới cờ.
const TramSac: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 130;
  const R1: Moc[] = [[0, 2, 4, 0], [24, 2, 4, 0], [24 + N, 2, 3, 0], [24 + 2 * N, 2, 2, 0], [24 + 3 * N, 2, 1, 0]];
  const t = 160;
  const R2: Moc[] = [[0, 2, 4, 0], [t, 2, 4, 0], [t + N, 2, 3, 0], [t + 2 * N, 2, 2, 0], [t + 4 * N, 2, 2, 0], [t + 5 * N, 2, 1, 0], [t + 6 * N, 2, 0, 0]];
  const dau = lan2 && f >= t + 2 * N + 4 && f < t + 4 * N;
  return (
    <Shake hits={[64]} amp={10}>
      <San san={<>
        <ODat ten="o-sac" c={2} r={2} />
        <ODat ten="o-co" c={2} r={0} />
        {lan2
          ? <Xe anh={f >= t + 6 * N ? 'drone-vui' : dau ? 'drone-dau' : 'drone'} moc={R2} vet={false} />
          : <Xe anh={f >= 60 ? 'drone-ngac' : 'drone'} moc={R1} vet={false} mo={(g) => (g < 62 ? 1 : Math.max(0.25, 1 - (g - 62) / 12))} />}
        <Burst at={t + 3 * N} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.good} />
        <Burst at={t + 6 * N} x={tamO(2, 0).x} y={tamO(2, 0).y} color={C.yellow} />
      </>}>
        <BangLenh lines={lan2 ? ['go_up()', 'go_up()', 'land()', 'take_off()', 'go_up()', 'go_up()'] : ['for i in range(4):', '    go_up()']}
          sang={lan2 ? [[t, 0], [t + N, 1], [t + 2 * N, 2], [t + 3 * N, 3], [t + 4 * N, 4], [t + 5 * N, 5], [t + 6 * N, -1]] : [[24, 1], [60, -1]]} bam={[18, 154]} />
        <Pin moc={lan2 ? [[0, 3], [t + N, 2], [t + 2 * N, 1], [t + 3 * N, 5], [t + 4 * N, 4], [t + 5 * N, 3], [t + 6 * N, 2]] : [[0, 3], [24 + N, 2], [24 + 2 * N, 1], [24 + 3 * N, 0]]} />
        <ChuNay chu="HẾT PIN!" at={62} den={124} x={tamLab(2, 1).x + 190} y={tamLab(2, 1).y} />
        <ChuNay chu="SẠC ĐẦY!" at={t + 3 * N} den={t + 3 * N + 40} x={tamLab(2, 2).x + 190} y={tamLab(2, 2).y} mau={C.good} co={42} />
        {lan2 ? <TuaLai at={130} chu="Tua lại" /> : null}
        <Chot tu={250} y={1090}>land() xuống ô sạc P thì pin đầy · bay ngang qua không sạc</Chot>
        <SolaL mat={[[0, 'confident'], [64, 'shocked'], [112, 'thinking'], [t + 6 * N, 'cheer']]} says={[{at: 66, out: 100, text: 'Bay ngang qua P rồi mà sao vẫn hết pin?'}, {at: 114, out: 140, text: 'Phải đáp xuống mới sạc!'}]} />
        <LunaL at={92} mat={[[92, 'thinking'], [240, 'great-job']]} says={[{at: 96, out: 116, text: 'Lướt qua trạm, pin có lên không?'}, {at: 256, out: 300, text: 'Đáp xuống, đầy pin, bay tiếp!'}]} />
      </San>
    </Shake>
  );
};

/* ================================================================== GÓI 6 · Gieo liền */
// Lần 1: pen_down() rồi bay ba ô, quên pen_up() → hạt rơi cả ra lối đi. Tua lại: pen_up() trước ô cuối.
const NetLien: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 130;
  const t0 = lan2 ? 150 : 24;
  const R: Moc[] = [[0, 0, 2, 0], [t0 + 12, 0, 2, 0], [t0 + 12 + N, 1, 2, 0], [t0 + 12 + 2 * N, 2, 2, 0], [t0 + 12 + (lan2 ? 4 : 3) * N, 3, 2, 0]];
  return (
    <San san={<>
      {[0, 1, 2].map((c) => <ODat key={c} ten="o-co-non" c={c} r={2} />)}
      <ODat ten="o-co" c={4} r={2} />
      <Hoa mau="yellow" c={0} r={2} tu={t0 + 12} />
      <Hoa mau="yellow" c={1} r={2} tu={t0 + 12 + N} />
      <Hoa mau="yellow" c={2} r={2} tu={t0 + 12 + 2 * N} />
      {!lan2 ? <Hoa mau="yellow" c={3} r={2} tu={t0 + 12 + 3 * N} /> : null}
      <Xe anh={!lan2 && f >= 64 ? 'drone-son-ngac' : lan2 && f >= 210 ? 'drone-son-vui' : 'drone-son-yellow'} moc={R} vet={false} />
      <Burst at={210} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.yellow} />
    </>}>
      <BangLenh lines={lan2 ? ['ink("yellow")', 'pen_down()', 'wait()', 'go_right()', 'go_right()', 'pen_up()', 'wait()', 'go_right()'] : ['ink("yellow")', 'pen_down()', 'wait()', 'go_right()', 'go_right()', 'go_right()']}
        sang={lan2 ? [[t0, 0], [t0 + 4, 1], [t0 + 8, 2], [t0 + 12, 3], [t0 + 12 + N, 4], [t0 + 12 + 2 * N, 5], [t0 + 12 + 2 * N + 4, 6], [t0 + 12 + 3 * N, 7], [t0 + 12 + 4 * N, -1]]
          : [[t0, 0], [t0 + 4, 1], [t0 + 8, 2], [t0 + 12, 3], [t0 + 12 + N, 4], [t0 + 12 + 2 * N, 5], [t0 + 12 + 3 * N, -1]]} bam={[18, 144]} />
      <ChuNay chu="GIEO RA LỐI ĐI!" at={64} den={126} x={tamLab(3, 2).x} y={tamLab(3, 2).y - 120} co={40} />
      {lan2 ? <TuaLai at={130} chu="Tua lại" /> : null}
      <Chot tu={222} y={1090}>pen_down() bay tới đâu gieo tới đó · pen_up() nhấc lên</Chot>
      <SolaL mat={[[0, 'confident'], [66, 'shocked'], [110, 'thinking'], [210, 'cheer']]} says={[{at: 68, out: 100, text: 'Hạt vãi cả ra lối đi rồi!'}, {at: 112, out: 132, text: 'Nhấc miệng gieo lên!'}]} />
      <LunaL at={92} mat={[[92, 'thinking'], [216, 'great-job']]} says={[{at: 96, out: 114, text: 'Miệng gieo hạ tới bao giờ?'}, {at: 228, out: 290, text: 'Một vệt liền, vừa khít luống!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 7 · Nhìn dưới chân */
// Lần 1: color("down") đọc ô phía DƯỚI trên bản đồ (đất trống) → "none". Tua lại: color("here") đọc thẻ đỏ ngay dưới bụng → gieo đỏ.
const NhinDuoi: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 120;
  const t0 = lan2 ? 140 : 0;
  return (
    <San san={<>
      <ODat ten="o-san-mau-red" c={2} r={2} />
      {lan2 ? <Hoa mau="red" c={2} r={2} tu={t0 + 54} /> : null}
      {!lan2 && f >= 24 && f < 60 ? <Nhan x={tamLab(2, 3).x} y={tamLab(2, 3).y} chu="?" at={24} /> : null}
      <Xe anh={lan2 ? (f >= t0 + 58 ? 'drone-duoi-vui' : f >= t0 + 30 ? 'drone-duoi-red' : f >= t0 + 24 ? 'drone-duoi-do' : 'drone-duoi') : (f >= 40 ? 'drone-duoi-ngac' : f >= 24 ? 'drone-duoi-do' : 'drone-duoi')} moc={[[0, 2, 2, 0]]} vet={false} />
      <Burst at={t0 + 54} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.yellow} />
    </>}>
      <BangLenh lines={[lan2 ? 'c = color("here")' : 'c = color("down")', 'ink(c)', 'dot()', 'wait()']}
        sang={lan2 ? [[t0 + 24, 0], [t0 + 30, 1], [t0 + 36, 2], [t0 + 42, 3], [t0 + 58, -1]] : [[24, 0], [40, -1]]} bam={[18, 158]} />
      <Nhan x={tamLab(2, 2).x + 230} y={tamLab(2, 2).y - 110} chu={lan2 ? 'c = "red"' : 'c = "none"'} at={lan2 ? t0 + 26 : 28} den={lan2 ? t0 + 100 : 120} />
      {lan2 ? <TuaLai at={120} chu="Tua lại" /> : null}
      <Chot tu={204} y={1090}>color("here") đọc ô ngay dưới bụng · "down" là ô phía dưới bản đồ</Chot>
      <SolaL mat={[[0, 'confident'], [42, 'confused'], [104, 'happy'], [t0 + 58, 'cheer']]} says={[{at: 46, out: 70, text: 'Thẻ đỏ ngay dưới mà đọc ra "none"?'}, {at: 104, out: 124, text: 'Phải là "here"!'}]} />
      <LunaL at={66} mat={[[66, 'thinking'], [204, 'great-job']]} says={[{at: 72, out: 102, text: '"down" là ô dưới bản đồ, hay ngay dưới bụng?'}, {at: 220, out: 280, text: 'Đọc thẻ dưới chân rồi gieo đúng màu!'}]} />
    </San>
  );
};

/* ================================================================== thẻ lệnh mới */
const LenhDrone: React.FC = () => (
  <LenhMoi tieuDe="Thân drone" accent={['drone']} loi="Nhanh mà tốn pin: đừng phí nhịp nào nhé!" nhom={[
    {nhan: 'BAY THEO BẢN ĐỒ · 1 NHỊP', icon: 'Plane', mau: '#BE185D', lenh: [
      {ma: 'go_up() · go_down()', viec: 'bay lên / xuống 1 ô'},
      {ma: 'go_left() · go_right()', viec: 'bay trái / phải 1 ô'},
      {ma: 'battery()', viec: 'hỏi pin còn bao nhiêu'},
    ]},
  ]} />
);
const LenhGieo: React.FC = () => (
  <LenhMoi tieuDe="Bộ gieo hạt" accent={['gieo hạt']} loi="Đỏ hồng, vàng cúc, xanh cẩm tú cầu, xanh lá cỏ ba lá!" nhom={[
    {nhan: 'BỘ GIEO HẠT · 2 LỆNH', icon: 'Sprout', mau: '#15803D', lenh: [
      {ma: 'ink("red")', viec: 'chọn hạt, không tốn nhịp'},
      {ma: 'dot() · wait()', viec: 'gieo ô đang đứng'},
    ]},
  ]} />
);
const LenhCam: React.FC = () => (
  <LenhMoi tieuDe="Camera bốn hướng" accent={['camera']} loi="Nhìn mẫu rồi mới gieo, khỏi đoán mò!" nhom={[
    {nhan: 'CAMERA · 1 LỆNH', icon: 'Camera', mau: C.lunaDeep, lenh: [
      {ma: 'color("left")', viec: 'màu ô bên trái'},
      {ma: '"up" "down" "right"', viec: 'ba hướng còn lại'},
    ]},
  ]} />
);

export const LAB_DRONE: Phim['canh'] = [
  {id: 'lab-drone-sai', dur: 300, el: <DroneSai />, sfx: [[18, 'click.wav', 0.8], [86, 'wrong.wav', 0.5], [226, 'ding.wav', 0.4]]},
  {id: 'lab-drone-dung', dur: 175, el: <DroneDung />, sfx: [[18, 'click.wav', 0.8], [74, 'ding.wav', 0.5]]},
  {id: 'lenh-drone', dur: 200, el: <LenhDrone />, sfx: [W_IN, ...pops([24, 34, 44, 54], 0.3)]},
];
export const LAB_GIEO: Phim['canh'] = [
  {id: 'lab-gieo-sai', dur: 280, el: <GieoSai />, sfx: [[18, 'click.wav', 0.8], [50, 'wrong.wav', 0.5], [206, 'ding.wav', 0.4]]},
  {id: 'lab-gieo-dung', dur: 215, el: <GieoDung />, sfx: [[18, 'click.wav', 0.8], [48, 'pop.wav', 0.4], [100, 'ding.wav', 0.5]]},
  {id: 'lenh-gieo', dur: 190, el: <LenhGieo />, sfx: [W_IN, ...pops([24, 34, 44], 0.3)]},
];
export const LAB_CAMERA: Phim['canh'] = [
  {id: 'lab-cam-sai', dur: 280, el: <CamSai />, sfx: [[18, 'click.wav', 0.8], [52, 'wrong.wav', 0.5], [206, 'ding.wav', 0.4]]},
  {id: 'lab-cam-dung', dur: 260, el: <CamDung />, sfx: [[18, 'click.wav', 0.8], [54, 'ding.wav', 0.4], [128, 'click.wav', 0.8], [164, 'ding.wav', 0.5]]},
  {id: 'lenh-cam', dur: 190, el: <LenhCam />, sfx: [W_IN, ...pops([24, 34, 44], 0.3)]},
];
export const LAB_TRAM_SAC: Phim['canh'] = [
  {id: 'lab-tram-sac', dur: 305, el: <TramSac />, sfx: [[18, 'click.wav', 0.8], [62, 'wrong.wav', 0.5], [154, 'click.wav', 0.8], [196, 'ding.wav', 0.5], [232, 'ding.wav', 0.4]]},
];
export const LAB_NET_LIEN: Phim['canh'] = [
  {id: 'lab-net-lien', dur: 295, el: <NetLien />, sfx: [[18, 'click.wav', 0.8], [64, 'wrong.wav', 0.5], [144, 'click.wav', 0.8], [210, 'ding.wav', 0.5]]},
];
export const LAB_NHIN_DUOI: Phim['canh'] = [
  {id: 'lab-nhin-duoi', dur: 285, el: <NhinDuoi />, sfx: [[18, 'click.wav', 0.8], [40, 'wrong.wav', 0.5], [158, 'click.wav', 0.8], [194, 'ding.wav', 0.5]]},
];
