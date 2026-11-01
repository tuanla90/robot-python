// Cảnh Lab mùa 2 "Nhà máy" theo khuôn mùa 1 (bấm Chạy → thấy luật → Luna hỏi, Sola tự rút ra), đúng luật lõi game (hoc/gioi-thieu-part.js):
// gói 1 xích: một nhịp nhích nửa góc, hai nhịp liền mới đủ 90°, nhịp sau làm việc khác thì phần quay dở mất · gói 2 vòi phun: tia nhẹ bay tới ô thứ hai,
// spray() trước, spray_back() sau · gói 3 hồng ngoại: distance() đếm ô trống · gói 5 xích tiến vào thùng nặng thì thùng trượt một ô, sau thùng là tường thì kẹt ·
// gói 6 spray("high") bay ba ô, xe giật lùi một ô · gói 7 warm(): van đang mở thì nóng, nóng mới phun cho đóng.
// Mỗi gói chỉ lộ lệnh của chính nó (gói 2 không có "high", gói 3 không có warm()).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Burst, C, Shake, ease} from '../d10';
import {Phim, W_IN, pops} from '../may-phim';
import {ChuNay, Moc, O, ODat, Vat, Xe, tamO, theoMoc} from './kit-doc';
import {BangLenh, Chot, DY, LenhMoi, LunaL, Nhan, SanLab, SolaL, Tia, tamLab} from './lab-doc';

const NEN = 'nen-doc/mua-2.png';
const San: React.FC<{san: React.ReactNode; children?: React.ReactNode}> = ({san, children}) => <SanLab nen={NEN} mua="m2" san={san}>{children}</SanLab>;

/** Tia nước nhẹ / mạnh từ ô (c, r0) theo cột tới ô (c, r1); bọt nước ở đầu tia (toạ độ lưới, nằm trong lớp sân). */
const Nuoc: React.FC<{c: number; r0: number; r1: number; manh?: boolean; roi?: boolean}> = ({c, r0, r1, manh, roi}) => {
  const a = tamO(c, r0), b = tamO(c, r1);
  return (
    <>
      <Tia tu={a} den={b} mau={manh ? '#0284C7' : '#38BDF8'} day={manh ? 30 : 18} />
      <div style={{position: 'absolute', left: b.x - 60, top: b.y - 60, width: 120, height: 120, borderRadius: '50%', opacity: roi ? 0.7 : 1,
        background: 'radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(125,211,252,.8) 40%, rgba(56,189,248,0) 72%)'}} />
    </>
  );
};
/** Số thứ tự ô tia nước / tia đỏ đi qua. */
const SoO: React.FC<{c: number; rs: number[]; at: number; den?: number; mau?: string}> = ({c, rs, at, den = 1e9, mau = C.sola}) => {
  const f = useCurrentFrame();
  if (f < at || f > den) return null;
  return <>{rs.map((r, i) => {
    const p = tamO(c, r);
    return <div key={r} style={{position: 'absolute', left: p.x + 40, top: p.y - 30, width: 60, height: 60, borderRadius: 30, background: mau, color: '#fff',
      fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `4px solid ${C.ink}`, opacity: ease(f, [at + i * 8, at + i * 8 + 6], [0, 1])}}>{i + 1}</div>;
  })}</>;
};
/** Quầng nóng của van đang mở (hơi chạy qua). */
const Nong: React.FC<{c: number; r: number}> = ({c, r}) => {
  const f = useCurrentFrame(), p = tamO(c, r), k = 1 + 0.08 * Math.sin(f / 5);
  return <div style={{position: 'absolute', left: p.x - O * 0.7, top: p.y - O * 0.7, width: O * 1.4, height: O * 1.4, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,.6) 0%, rgba(249,115,22,.3) 55%, transparent 75%)', transform: `scale(${k})`}} />;
};

/* ================================================================== GÓI 1 · Thân bánh xích */
// Sai: left_move() + wait() nhích nửa góc (-45°), nhịp sau move() làm việc khác nên phần quay dở mất: xe về hướng cũ rồi đi lên.
const R_XS: Moc[] = [[0, 1, 3, -90], [36, 1, 3, -90], [60, 1, 3, -45], [84, 1, 3, -45], [94, 1, 3, -90], [120, 1, 2, -90]];
const XichSai: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      <ODat ten="o-co" c={3} r={3} />
      <Xe anh={f >= 96 ? 'xich-ngac' : 'xich'} moc={R_XS} vet={false} />
    </>}>
      <BangLenh lines={['left_move()', 'wait()', 'move()']} sang={[[24, 0], [36, 1], [84, 2], [124, -1]]} bam={[18]} />
      <Nhan x={tamLab(1, 3).x + 150} y={tamLab(1, 3).y - 90} chu="nửa vòng…" at={60} den={92} />
      <ChuNay chu="QUAY DỞ!" at={94} den={150} x={600} y={tamLab(1, 2).y} mau={C.warn} />
      <SolaL mat={[[0, 'confident'], [96, 'shocked'], [205, 'thinking'], [250, 'happy']]} says={[
        {at: 4, out: 18, text: 'Rẽ phải một nhịp rồi đi tới cờ!'},
        {at: 100, out: 160, text: 'Ơ! Mới nhích nửa vòng lại quay về hướng cũ?'},
        {at: 232, out: 296, text: 'Nửa góc thôi! Phải hai nhịp liền mới đủ!'},
      ]} />
      <LunaL at={150} mat={[[150, 'thinking']]} says={[{at: 162, out: 228, text: 'Một nhịp, dải xích quay được bao nhiêu nhỉ?'}]} />
    </San>
  );
};
// Đúng: hai nhịp liền left_move() → 90°, rồi move() tới cờ.
const R_XD: Moc[] = [[0, 1, 3, -90], [40, 1, 3, -90], [64, 1, 3, -45], [84, 1, 3, -45], [108, 1, 3, 0], [124, 1, 3, 0], [156, 2, 3, 0]];
const XichDung: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      <ODat ten="o-co" c={2} r={3} />
      <Xe anh={f >= 158 ? 'xich-vui' : 'xich'} moc={R_XD} />
      <Burst at={158} x={tamO(2, 3).x} y={tamO(2, 3).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['for i in range(2):', '    left_move()', '    wait()', 'move()']} typeAt={2} sang={[[26, 1], [40, 2], [72, 1], [84, 2], [124, 3], [160, -1]]} bam={[22]} />
      <Nhan x={tamLab(1, 3).x + 150} y={tamLab(1, 3).y - 90} chu="nhịp 1" at={40} den={80} />
      <Nhan x={tamLab(1, 3).x + 150} y={tamLab(1, 3).y - 90} chu="nhịp 2 · đủ 90°" at={84} den={150} />
      <Chot tu={170} y={1090}>Xích: 2 nhịp liền mới rẽ xong một góc vuông</Chot>
      <LunaL at={160} mat={[[160, 'great-job']]} says={[{at: 172, out: 236, text: 'Hai nhịp liền, góc vuông tròn trịa!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 2 · Vòi phun */
// Sai: van ở ô thứ ba trước mũi, tia nhẹ rơi ở ô thứ hai.
const VoiTam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      <ODat ten="o-nut-ban" c={2} r={0} />
      <Xe anh={f >= 34 && f < 70 ? 'xich-voi-phun' : f >= 70 ? 'xich-voi-ngac' : 'xich-voi'} moc={[[0, 2, 3, -90]]} vet={false} />
      {f >= 36 && f < 72 ? <Nuoc c={2} r0={2.55} r1={1} roi /> : null}
      <SoO c={2} rs={[2, 1, 0]} at={130} den={240} />
    </>}>
      <BangLenh lines={['spray()', 'wait()']} sang={[[24, 0], [34, 1], [74, -1]]} bam={[18]} />
      <ChuNay chu="HỤT!" at={66} den={120} x={tamLab(2, 1).x + 190} y={tamLab(2, 1).y} mau={C.warn} />
      <SolaL mat={[[0, 'confident'], [70, 'confused'], [190, 'happy']]} says={[
        {at: 72, out: 120, text: 'Sao nước rơi giữa đường vậy?'},
        {at: 196, out: 266, text: 'Hai ô thôi! Tiến lại gần thêm một ô.'},
      ]} />
      <LunaL at={118} mat={[[118, 'thinking']]} says={[{at: 124, out: 190, text: 'Đếm thử xem tia nước bay được mấy ô?'}]} />
    </San>
  );
};
// Đúng: tiến một ô → van trước là ô thứ hai, trúng; spray_back() trúng van sau lưng.
const R_VD: Moc[] = [[0, 2, 3, -90], [28, 2, 3, -90], [56, 2, 2, -90]];
const VoiDung: React.FC = () => {
  const f = useCurrentFrame();
  const anh = f >= 78 && f < 110 ? 'xich-voi-phun' : f >= 150 && f < 182 ? 'xich-voi-phun-sau' : f >= 190 ? 'xich-voi-vui' : 'xich-voi';
  return (
    <San san={<>
      <ODat ten={f >= 98 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={0} />
      <ODat ten={f >= 170 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={4} />
      <Xe anh={anh} moc={R_VD} />
      {f >= 80 && f < 108 ? <Nuoc c={2} r0={1.55} r1={0} /> : null}
      {f >= 152 && f < 180 ? <Nuoc c={2} r0={2.45} r1={4} /> : null}
      <Burst at={98} x={tamO(2, 0).x} y={tamO(2, 0).y} color={C.yellow} />
      <Burst at={170} x={tamO(2, 4).x} y={tamO(2, 4).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['move()', 'spray()', 'wait()', 'spray_back()', 'wait()']} typeAt={2} sang={[[24, 0], [66, 1], [78, 2], [140, 3], [150, 4], [190, -1]]} bam={[20]} />
      <Chot tu={196} y={1090}>Tia nhẹ bay tới ô thứ hai · nhịp phun xe đứng yên</Chot>
      <SolaL mat={[[0, 'confident'], [100, 'celebrate'], [190, 'cheer']]} says={[{at: 108, out: 146, text: 'Trúng! Giờ tới van sau lưng.'}]} />
      <LunaL at={186} mat={[[186, 'great-job']]} says={[{at: 236, out: 296, text: 'Một vòi hai đầu, trước sau đều tới!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 3 · Mắt hồng ngoại */
// while distance() > 1: move()  → dừng khi van là ô thứ hai, rồi phun trúng. Nhãn distance() đổi theo từng ô.
const R_HN: Moc[] = [[0, 2, 4, -90], [40, 2, 4, -90], [66, 2, 3, -90], [92, 2, 3, -90], [118, 2, 2, -90]];
const DIST: [number, number, string][] = [[30, 66, '3'], [70, 118, '2'], [122, 200, '1']];
const HnDo: React.FC = () => {
  const f = useCurrentFrame();
  const p = theoMoc(R_HN, f);
  const d = DIST.find(([a, b]) => f >= a && f < b);
  return (
    <San san={<>
      <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: 2.5 * O,
        background: 'linear-gradient(180deg, rgba(100,116,139,.82), rgba(148,163,184,.35))', borderRadius: 20}} />
      <ODat ten={f >= 150 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={0} />
      {d ? <Tia tu={{x: p.x, y: p.y - O * 0.45}} den={{x: tamO(2, 0).x, y: tamO(2, 0).y + O * 0.45}} mau={C.bad} day={10} /> : null}
      <Xe anh={f >= 132 && f < 158 ? 'xich-hn-phun' : f >= 160 ? 'xich-hn-vui' : d ? 'xich-hn-do' : 'xich-hn'} moc={R_HN} />
      {f >= 134 && f < 158 ? <Nuoc c={2} r0={1.55} r1={0} /> : null}
      <Burst at={150} x={tamO(2, 0).x} y={tamO(2, 0).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['while distance() > 1:', '    move()', 'spray()', 'wait()']} typeAt={2} sang={[[30, 0], [40, 1], [70, 0], [92, 1], [122, 0], [126, 2], [132, 3], [160, -1]]} bam={[24]} />
      {d ? <Nhan x={p.x + 210} y={p.y + DY} chu={`distance() = ${d[2]}`} at={0} /> : null}
      <Chot tu={172} y={1090}>distance() đếm số ô trống tới vật cản · hỏi không tốn nhịp</Chot>
      <LunaL mat={[[0, 'thinking'], [160, 'great-job']]} says={[{at: 4, out: 26, text: 'Tia đỏ báo mấy ô trống?'}, {at: 236, out: 296, text: 'Còn một ô trống là vừa tầm phun!'}]} />
      <SolaL at={60} mat={[[60, 'confident'], [160, 'cheer']]} says={[{at: 166, out: 230, text: 'Ba, hai, một… dừng, phun trúng luôn!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 5 · Đẩy thùng nặng */
// Mỗi move() xích tiến vào thùng nặng → thùng trượt một ô; thùng lên nút đè thì cửa mở; move() thứ tư: sau thùng là mép sân, kẹt.
const R_DT: Moc[] = [[0, 2, 4, -90], [26, 2, 4, -90], [50, 2, 3, -90], [70, 2, 3, -90], [94, 2, 2, -90], [114, 2, 2, -90], [138, 2, 1, -90], [158, 2, 1, -90], [166, 2, 0.9, -90], [174, 2, 1, -90]];
const DayThung: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[166]} amp={12}>
      <San san={<>
        <ODat ten={f >= 138 ? 'o-nut-de-sang' : 'o-nut-de'} c={2} r={0} />
        <ODat ten={f >= 138 ? 'o-cua-mo' : 'o-cua'} c={4} r={2} />
        <Vat ten="vat-thung-nang" moc={[[0, 2, 2], [70, 2, 2], [94, 2, 1], [114, 2, 1], [138, 2, 0]]} />
        <Xe anh={f >= 166 ? 'du-ngac' : 'du'} moc={R_DT} />
      </>}>
        <BangLenh lines={['move()', 'move()', 'move()', 'move()']} sang={[[26, 0], [70, 1], [114, 2], [158, 3], [184, -1]]} bam={[20]} />
        <ChuNay chu="TRƯỢT 1 Ô" at={94} den={124} x={tamLab(2, 1).x + 200} y={tamLab(2, 1).y} mau={C.good} co={44} />
        <ChuNay chu="TRƯỢT 1 Ô" at={138} den={160} x={tamLab(2, 0).x + 200} y={tamLab(2, 0).y} mau={C.good} co={44} />
        <ChuNay chu="KẸT!" at={166} den={220} x={tamLab(2, 1).x + 200} y={tamLab(2, 1).y} />
        <Chot tu={250} y={1090}>Xích tiến vào thùng nặng → thùng trượt 1 ô</Chot>
        <SolaL mat={[[0, 'confident'], [140, 'celebrate'], [168, 'shocked'], [236, 'happy']]} says={[
          {at: 120, out: 160, text: 'Thùng lên nút, cửa mở rồi!'},
          {at: 236, out: 300, text: 'Kẹt cứng! Đẩy vừa đủ thôi.'},
        ]} />
        <LunaL at={170} mat={[[170, 'thinking']]} says={[{at: 176, out: 232, text: 'Sau thùng là tường thì thùng đi đâu?'}]} />
      </San>
    </Shake>
  );
};

/* ================================================================== GÓI 6 · Lực phun */
// Lửa ở ô thứ ba sau hàng rào thấp: spray() rơi ở ô thứ hai; spray("high") bay ba ô dập lửa, xe giật lùi một ô.
const R_PM: Moc[] = [[0, 2, 3, -90], [118, 2, 3, -90], [132, 2, 3.9, -90], [140, 2, 4, -90]];
const PhunManh: React.FC = () => {
  const f = useCurrentFrame();
  const anh = (f >= 34 && f < 64) || (f >= 112 && f < 140) ? 'du-phun' : f >= 160 ? 'du-vui' : f >= 66 ? 'du-ngac' : 'du';
  return (
    <Shake hits={[118]} amp={12}>
      <San san={<>
        <ODat ten="o-rao" c={2} r={2} />
        <ODat ten={f >= 126 ? 'o-lua-tat' : 'o-lua'} c={2} r={0} />
        <Xe anh={anh} moc={R_PM} vet={false} />
        {f >= 36 && f < 64 ? <Nuoc c={2} r0={2.55} r1={1} roi /> : null}
        {f >= 114 && f < 132 ? <Nuoc c={2} r0={2.55} r1={0} manh /> : null}
      </>}>
        <BangLenh lines={['spray()', 'wait()', 'spray("high")', 'wait()']} sang={[[24, 0], [34, 1], [100, 2], [112, 3], [150, -1]]} bam={[18, 94]} />
        <ChuNay chu="KHÔNG TỚI!" at={62} den={100} x={tamLab(2, 1).x + 200} y={tamLab(2, 1).y} mau={C.warn} co={44} />
        <ChuNay chu="GIẬT!" at={120} den={170} x={tamLab(2, 4).x + 180} y={tamLab(2, 4).y} co={60} />
        <Chot tu={190} y={1090}>spray("high") bay xa 3 ô · xe giật lùi 1 ô</Chot>
        <LunaL mat={[[0, 'thinking']]} says={[{at: 66, out: 96, text: 'Nhẹ không tới… thì sao?'}]} />
        <SolaL at={0} mat={[[0, 'worried'], [96, 'confident'], [122, 'shocked'], [160, 'happy']]} says={[
          {at: 98, out: 112, text: 'Phun mạnh!'},
          {at: 140, out: 186, text: 'Tắt rồi! Mà xe bị giật lùi một ô!'},
        ]} />
      </San>
    </Shake>
  );
};

/* ================================================================== GÓI 7 · Đo nhiệt */
// if warm(): spray(). Lần 1: van đang mở (nóng) → warm() = True → phun cho đóng. Tua lại với van đã nguội → warm() = False → để yên.
const DoNhiet: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 150;
  const nong = !lan2 && f < 94;
  const do_ = (f >= 34 && f < 66) || (f >= 176 && f < 236);
  return (
    <San san={<>
      {nong ? <Nong c={2} r={1} /> : null}
      <ODat ten="o-nut-ban" c={2} r={1} />
      {do_ ? <Tia tu={tamO(2, 2.55)} den={tamO(2, 1.45)} mau={C.bad} day={10} /> : null}
      <Xe anh={f >= 66 && f < 94 ? 'du-phun' : f >= 96 && f < 150 ? 'du-vui' : do_ ? 'du-do' : 'du'} moc={[[0, 2, 3, -90]]} vet={false} />
      {f >= 68 && f < 94 ? <Nuoc c={2} r0={2.55} r1={1} /> : null}
      <Burst at={92} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['if warm():', '    spray()', '    wait()']} sang={lan2 ? [[176, 0], [236, -1]] : [[34, 0], [58, 1], [66, 2], [100, -1]]} bam={[28, 170]} />
      <Nhan x={tamLab(2, 2).x + 230} y={tamLab(2, 2).y} chu={lan2 ? 'warm() = False' : 'warm() = True'} at={lan2 ? 180 : 40} den={lan2 ? 1e9 : 140} />
      {f >= 150 && f < 172 ? <Nhan x={540} y={tamLab(2, 3).y + 40} chu="Tua lại · van đã nguội" at={150} nen="#fff" mau={C.ink} /> : null}
      <Chot tu={246} y={1090}>warm(): van đang mở thì nóng · nóng mới phun cho đóng</Chot>
      <LunaL mat={[[0, 'thinking'], [240, 'great-job']]} says={[{at: 4, out: 30, text: 'warm() trả lời gì với van đang mở?'}, {at: 184, out: 222, text: 'Còn lần này thì sao?'}]} />
      <SolaL at={60} mat={[[60, 'thinking'], [96, 'happy'], [226, 'cheer']]} says={[
        {at: 98, out: 146, text: 'True: còn hơi nóng, R1 phun cho đóng lại!'},
        {at: 228, out: 292, text: 'Nguội thì để yên, phun nữa là mở lại mất!'},
      ]} />
    </San>
  );
};

/* ================================================================== thẻ lệnh mới */
const LenhXich: React.FC = () => (
  <LenhMoi tieuDe="Thân bánh xích" accent={['bánh xích']} loi="Xích chậm mà chắc: rẽ vuông nhớ đủ hai nhịp liền nhé!" nhom={[
    {nhan: 'CÙNG LỆNH BÁNH · QUAY CHẬM', icon: 'Cog', mau: C.solaDeep, lenh: [
      {ma: 'left_move() · wait() ×2', viec: 'quay phải 90°'},
      {ma: 'right_move() · wait() ×2', viec: 'quay trái 90°'},
      {ma: 'move()', viec: 'tiến 1 ô, leo được bậc'},
    ]},
  ]} />
);
const LenhVoi: React.FC = () => (
  <LenhMoi tieuDe="Hai lệnh của vòi phun" accent={['vòi phun']} loi="Mỗi lệnh phun cần một wait() mới phun nhé!" nhom={[
    {nhan: 'VÒI PHUN · 2 LỆNH', icon: 'Droplets', mau: C.solaDeep, lenh: [
      {ma: 'spray()', viec: 'phun ra trước, tới ô thứ hai'},
      {ma: 'spray_back()', viec: 'phun ra sau, tới ô thứ hai'},
    ]},
  ]} />
);
const LenhHn: React.FC = () => (
  <LenhMoi tieuDe="Mắt hồng ngoại" accent={['hồng ngoại']} loi="Biết van cách mấy ô thì không phí nước nữa!" nhom={[
    {nhan: 'MẮT HỒNG NGOẠI · 1 LỆNH', icon: 'Ruler', mau: '#BE123C', lenh: [
      {ma: 'distance()', viec: 'số ô trống tới vật cản'},
      {ma: 'distance() > 1', viec: 'còn hơn một ô trống?'},
    ]},
  ]} />
);

export const LAB_XICH: Phim['canh'] = [
  {id: 'lab-xich-sai', dur: 300, el: <XichSai />, sfx: [[18, 'click.wav', 0.8], [94, 'wrong.wav', 0.5], [232, 'ding.wav', 0.4]]},
  {id: 'lab-xich-dung', dur: 240, el: <XichDung />, sfx: [[22, 'click.wav', 0.8], [158, 'ding.wav', 0.5]]},
  {id: 'lenh-xich', dur: 200, el: <LenhXich />, sfx: [W_IN, ...pops([24, 34, 44, 54], 0.3)]},
];
export const LAB_VOI: Phim['canh'] = [
  {id: 'lab-voi-tam', dur: 270, el: <VoiTam />, sfx: [[18, 'click.wav', 0.8], [36, 'swish.wav', 0.4], [66, 'wrong.wav', 0.5], [196, 'ding.wav', 0.4]]},
  {id: 'lab-voi-dung', dur: 300, el: <VoiDung />, sfx: [[20, 'click.wav', 0.8], [80, 'swish.wav', 0.4], [98, 'ding.wav', 0.5], [152, 'swish.wav', 0.4], [170, 'ding.wav', 0.5]]},
  {id: 'lenh-voi', dur: 190, el: <LenhVoi />, sfx: [W_IN, ...pops([24, 34, 44], 0.3)]},
];
export const LAB_HONG_NGOAI: Phim['canh'] = [
  {id: 'lab-hong-ngoai', dur: 300, el: <HnDo />, sfx: [[24, 'click.wav', 0.8], [30, 'pop.wav', 0.3], [70, 'pop.wav', 0.3], [122, 'pop.wav', 0.3], [134, 'swish.wav', 0.4], [150, 'ding.wav', 0.5]]},
  {id: 'lenh-hong-ngoai', dur: 190, el: <LenhHn />, sfx: [W_IN, ...pops([24, 34, 44], 0.3)]},
];
export const LAB_DAY_THUNG: Phim['canh'] = [
  {id: 'lab-day-thung', dur: 310, el: <DayThung />, sfx: [[20, 'click.wav', 0.8], [94, 'pop.wav', 0.4], [138, 'ding.wav', 0.5], [166, 'impact.wav', 0.5]]},
];
export const LAB_LUC_PHUN: Phim['canh'] = [
  {id: 'lab-luc-phun', dur: 260, el: <PhunManh />, sfx: [[18, 'click.wav', 0.8], [62, 'wrong.wav', 0.4], [94, 'click.wav', 0.8], [114, 'swish.wav', 0.5], [118, 'impact.wav', 0.5], [126, 'ding.wav', 0.4]]},
];
export const LAB_DO_NHIET: Phim['canh'] = [
  {id: 'lab-do-nhiet', dur: 300, el: <DoNhiet />, sfx: [[28, 'click.wav', 0.8], [40, 'pop.wav', 0.3], [68, 'swish.wav', 0.4], [92, 'ding.wav', 0.5], [170, 'click.wav', 0.8], [180, 'pop.wav', 0.3]]},
];
