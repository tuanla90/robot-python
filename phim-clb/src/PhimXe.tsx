// Phim gói 1 mùa 1 "Xe hai bánh" (mã gói 'xe'), viết lại theo hội đồng 20261030-2055: BẪY CHỮ LEFT.
// Thùng nằm bên TRÁI; Sola nghĩ "qua trái thì gọi bánh trái" → R1 rẽ PHẢI, Sola chạy lại vẫn rẽ phải, R1 chóng mặt.
// Luna chỉ HỎI DẪN (vết bánh vòng quanh đâu? bánh nào lăn?), Sola tự nói quy luật ("như chân compa").
// Người xem được ĐOÁN right_move() (đếm 3 2 1) rồi mới xem; cuối cùng hai bánh cùng lăn, đi thẳng tới thùng. Bộ dựng: d10.tsx.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, Headline, Icon, Mascot, PopIn, Shake, Stage, ease, pop} from './d10';
import {ChuChot, Robot, TuThe, VetBanh, raNgoai, tamBanh, tien, xoayQuanh} from './kit';
import {AnhNen} from './nen';
import {Phim, W_IN, pops} from './may-phim';

/* ------------------------------------------------------------------ sân kho và đường đi của R1 */
const S = 260;                                    // cạnh hình robot (px)
const T0: TuThe = {x: 1440, y: 700, goc: -90};    // R1 nhìn lên, thùng ở bên TRÁI
const QUANG = 240;                                // quãng đi thẳng tới thùng
const phai = (u: number) => xoayQuanh(T0, 90 * u, 'phai', S);          // u lượt rẽ phải (bánh trái lăn), quanh bánh phải
const T_TRAI = xoayQuanh(T0, -90, 'trai', S);                           // sau right_move(): rẽ trái, nhìn về thùng
const T_CUOI = tien(T_TRAI, QUANG);
const THUNG = raNgoai(T_CUOI, {x: S * 0.5 + 85, y: 0});
const TRUC_PHAI = raNgoai(T0, tamBanh('phai', S));                      // chân compa: bánh phải đứng yên lúc rẽ phải

type Vet = {tuThe: (u: number) => TuThe; banh: 'trai' | 'phai'; tienDo: number};
/** Sàn kho nhìn từ trên + thùng + vệt bánh + R1. zoom quanh điểm tam. */
const SanKho: React.FC<{t: TuThe; anh?: string; chay?: {trai?: boolean; phai?: boolean}; dungYen?: {trai?: boolean; phai?: boolean}; nhan?: number;
  vet?: Vet[]; zoom?: number; tam?: {x: number; y: number}; sangVet?: number}> = ({t, anh, chay, dungYen, nhan, vet = [], zoom = 1, tam = TRUC_PHAI, sangVet = 0}) => (
  <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${tam.x}px ${tam.y}px`}}>
    {/* sàn kho thật (ảnh nền mua-1, giữa ảnh là sàn trống), lưới ô mờ để thấy xe đi từng ô */}
    <AnhNen ma="mua-1" />
    <div style={{position: 'absolute', left: 700, top: 150, width: 1120, height: 800,
      backgroundImage: 'linear-gradient(rgba(30,27,75,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(30,27,75,.07) 2px, transparent 2px)', backgroundSize: '160px 160px'}} />
    <Img src={staticFile('robot/thung-go.png')} style={{position: 'absolute', left: THUNG.x - 95, top: THUNG.y - 95, width: 190, height: 190}} />
    <div style={{filter: sangVet ? `drop-shadow(0 0 ${10 * sangVet}px ${C.yellow})` : undefined, position: 'absolute', inset: 0}}>
      {vet.map((v, i) => <VetBanh key={i} tuThe={v.tuThe} banh={v.banh} S={S} tienDo={v.tienDo} />)}
    </div>
    <Robot t={t} S={S} anh={anh} chay={chay} dungYen={dungYen} nhan={nhan} />
  </AbsoluteFill>
);

/** Nút Chạy dưới bảng code; lún xuống ở các khung `bam`. */
const NutChay: React.FC<{bam: number[]}> = ({bam}) => {
  const f = useCurrentFrame();
  const lun = bam.some((b) => f >= b && f < b + 6);
  return (
    <div style={{position: 'absolute', left: 60, top: 360, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 30px', borderRadius: 18, fontSize: 34, fontWeight: 800,
      color: '#fff', background: lun ? C.solaDeep : C.sola, transform: `scale(${lun ? 0.9 : 1})`, boxShadow: '0 10px 24px rgba(2,132,199,.35)'}}>
      <Icon name="Play" size={30} color="#fff" />Chạy
    </div>
  );
};

/** Dấu "?!" nảy trên đầu R1. */
const Hoi: React.FC<{at: number; t: TuThe; chu?: string}> = ({at, t, chu = '?!'}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  if (f < at) return null;
  const p = pop(f, at, fps, 9);
  return <div style={{position: 'absolute', left: t.x + 60, top: t.y - 230, transform: `scale(${p})`, fontSize: 90, fontWeight: 900, color: C.bad,
    textShadow: '0 6px 0 #fff'}}>{chu}</div>;
};

/** Mốc dòng sáng: [khung bắt đầu, chỉ số dòng]; trước mốc đầu không sáng. */
const dongSang = (f: number, moc: [number, number][]) => moc.filter(([t]) => f >= t).pop()?.[1] ?? -1;

/* 1 · Cái bẫy: thùng bên trái, Sola gọi bánh trái */
const CanhBay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <SanKho t={T0} />
      <div style={{position: 'absolute', left: THUNG.x - 80, top: THUNG.y - 150, fontSize: 28, fontWeight: 800, color: C.warn, opacity: ease(f, [10, 25], [0, 1])}}>Thùng ở đây</div>
      <CodeBox lines={['left_move()', 'wait()']} x={60} y={70} w={560} size={40} typeAt={70} cps={0.6} title="mat_lenh.py" />
      <Mascot who="sola" x={330} h={560} at={0} faces={[[0, 'confident']]} says={[{at: 12, out: 170, text: 'Thùng bên trái à? Gọi bánh trái là qua!'}]} bubbleTop={470} bubbleW={400} />
    </>
  );
};

/* 2 · Sập bẫy: R1 rẽ PHẢI; Sola chạy lại, vẫn rẽ phải, R1 chóng mặt */
const L1 = [28, 58], L2 = [148, 178];
const CanhSai: React.FC = () => {
  const f = useCurrentFrame();
  const u = ease(f, L1 as [number, number], [0, 1]) + ease(f, L2 as [number, number], [0, 1]);
  const lan = (f >= 10 && f < 60) || (f >= 130 && f < 180);
  const sang = dongSang(f, [[10, 0], [25, 1], [62, -1], [130, 0], [145, 1], [182, -1]]);
  return (
    <Shake hits={[60, 180]} amp={12}>
      <SanKho t={phai(u)} anh={f >= 182 ? 'r1-xoay' : f >= 60 ? 'r1-ngac' : 'r1'} chay={lan ? {trai: true} : {}}
        vet={[{tuThe: phai, banh: 'trai', tienDo: u}]} />
      <Hoi at={60} t={phai(1)} />
      <CodeBox lines={['left_move()', 'wait()']} x={60} y={70} w={560} size={40} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[6, 124]} />
      <Mascot who="sola" x={330} h={560} at={0} faces={[[0, 'confident'], [60, 'shocked'], [122, 'confident'], [184, 'facepalm']]} bubbleTop={470} bubbleW={400}
        says={[{at: 64, out: 118, text: 'Ơ! Sao lại quay sang PHẢI?'}, {at: 124, out: 176, text: 'Chạy lại!'}, {at: 188, out: 236, text: 'R1 chóng mặt luôn rồi…'}]} />
    </Shake>
  );
};

/* 3 · Vết bánh: Luna hỏi dẫn, Sola tự nói ra quy luật */
const CanhVetBanh: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const z = ease(f, [0, 40], [1, 1.45]);
  return (
    <>
      <SanKho t={phai(2)} anh={f >= 300 ? 'r1' : 'r1-xoay'} zoom={z} sangVet={0.6 + 0.4 * Math.sin(f / 6)}
        vet={[{tuThe: phai, banh: 'trai', tienDo: 2}]} dungYen={f >= 125 ? {phai: true} : {}} chay={f >= 220 ? {trai: true} : {}} nhan={ease(f, [125, 145], [0, 1])} />
      <Burst at={125} x={TRUC_PHAI.x} y={TRUC_PHAI.y} color={C.bad} r={120} />
      <Mascot who="sola" x={200} h={420} at={0} faces={[[0, 'facepalm'], [128, 'thinking'], [292, 'happy']]} side="right" bubbleW={400}
        says={[{at: 130, out: 214, text: 'Quanh bánh phải… như chân compa!'}, {at: 292, out: 356, text: 'Bánh trái! Trái lăn thì xe rẽ PHẢI!'}]} />
      <Mascot who="luna" x={690} h={420} at={10} faces={[[10, 'thinking'], [218, 'explaining']]} side="right" bubbleW={400} lat
        says={[{at: 24, out: 120, text: 'Nhìn vết bánh nè. Nó vòng quanh chỗ nào?'}, {at: 220, out: 288, text: 'Còn bánh nào đang lăn?'}]} />
      <ChuChot tu={300} y={30}>Chỉ bánh TRÁI lăn → xe rẽ PHẢI</ChuChot>
    </>
  );
};

/* 4 · Đoán: chỉ bánh PHẢI lăn thì sao? đếm 3 2 1 rồi mới chạy */
const R4 = [168, 200];
const CanhDoan: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const tua = ease(f, [0, 28], [2, 0]);                     // tua lại: R1 về chỗ cũ
  const uT = ease(f, R4 as [number, number], [0, 1]);
  const t = f < 160 ? phai(tua) : xoayQuanh(T0, -90 * uT, 'trai', S);
  const sang = dongSang(f, [[150, 0], [165, 1], [204, -1]]);
  const dem = [60, 90, 120].findIndex((a, i) => f >= a && f < a + 30);
  return (
    <>
      <SanKho t={t} anh={f >= 204 ? 'r1-vui' : 'r1'} chay={f >= 150 && f < 202 ? {phai: true} : {}} dungYen={f >= 150 ? {trai: true} : {}}
        vet={f >= R4[0] ? [{tuThe: (u) => xoayQuanh(T0, -90 * u, 'trai', S), banh: 'phai', tienDo: uT}] : []} />
      {f < 30 ? <div style={{position: 'absolute', left: 1240, top: 200, display: 'flex', alignItems: 'center', gap: 10, fontSize: 34, fontWeight: 800, color: C.soft}}>
        <Icon name="Rewind" size={40} color={C.soft} />Tua lại</div> : null}
      {f >= 50 && f < 150 ? (
        <>
          {[-1, 1].map((h) => (
            <div key={h} style={{position: 'absolute', left: T0.x + h * 230 - 50, top: T0.y - 60, opacity: 0.55 + 0.45 * Math.sin(f / 4 + (h > 0 ? 0 : Math.PI))}}>
              <Icon name={h < 0 ? 'ArrowBigLeft' : 'ArrowBigRight'} size={110} color={C.violet} />
            </div>
          ))}
          {dem >= 0 ? <div style={{position: 'absolute', left: T0.x - 40, top: T0.y - 330, fontSize: 130, fontWeight: 900, color: C.violet,
            transform: `scale(${pop(f, [60, 90, 120][dem], fps, 10)})`}}>{3 - dem}</div> : null}
        </>
      ) : null}
      {f >= 145 ? <CodeBox lines={['right_move()', 'wait()']} x={60} y={70} w={560} size={40} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} /> : null}
      {f >= 145 ? <NutChay bam={[148]} /> : null}
      <Mascot who="luna" x={250} h={480} at={0} faces={[[0, 'wink'], [205, 'cheer']]} side="right" bubbleTop={470} bubbleW={420}
        says={[{at: 32, out: 140, text: 'Đố bạn: chỉ bánh PHẢI lăn thì sao?'}, {at: 210, out: 286, text: 'Trúng rồi! R1 nhìn thẳng vào thùng'}]} />
      <Mascot who="sola" x={660} h={400} at={140} faces={[[140, 'confident']]} side="left" bubbleTop={520} bubbleW={360}
        says={[{at: 142, out: 205, text: 'Ngược lại… rẽ TRÁI!'}]} />
    </>
  );
};

/* 5 · Hai bánh cùng lăn một nhịp: đi thẳng tới thùng */
const D5 = [132, 188];
const CanhDiThang: React.FC = () => {
  const f = useCurrentFrame();
  const u = ease(f, D5 as [number, number], [0, 1]);
  const sang = dongSang(f, [[102, 0], [115, 1], [128, 2], [192, -1]]);
  const chay = f >= 102 && f < 190 ? {trai: true, phai: f >= 115} : {};
  return (
    <>
      <SanKho t={tien(T_TRAI, QUANG * u)} anh={f >= 190 ? 'r1-vui' : 'r1'} chay={chay}
        vet={f >= D5[0] ? [{tuThe: (v) => tien(T_TRAI, QUANG * v), banh: 'trai', tienDo: u}, {tuThe: (v) => tien(T_TRAI, QUANG * v), banh: 'phai', tienDo: u}] : []} />
      <Burst at={190} x={THUNG.x} y={THUNG.y} color={C.yellow} />
      <CodeBox lines={['left_move()', 'right_move()', 'wait()']} x={60} y={70} w={560} size={40} typeAt={20} cps={0.7} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[98]} />
      <Mascot who="sola" x={250} h={480} at={0} faces={[[0, 'confident'], [192, 'cheer']]} bubbleTop={470} bubbleW={420}
        says={[{at: 12, out: 96, text: 'Đi thẳng thì cho hai bánh cùng lăn!'}]} />
      <Mascot who="luna" x={660} h={400} at={185} faces={[[185, 'great-job']]} side="left" bubbleTop={520} bubbleW={360}
        says={[{at: 196, out: 256, text: 'Chuẩn! Cùng một nhịp là đi thẳng'}]} />
    </>
  );
};

/* 6 · Lệnh mới, mời người chơi */
const LENH = [
  {ma: 'left_move()', viec: 'bánh TRÁI lăn → rẽ phải'},
  {ma: 'right_move()', viec: 'bánh PHẢI lăn → rẽ trái'},
  {ma: 'wait()', viec: 'chạy hết một nhịp'},
];
const CanhLenhMoi: React.FC = () => (
  <Stage>
    <Headline text="Ba lệnh lái R1" at={4} accent={['R1']} size={84} top={90} />
    {LENH.map((l, i) => (
      <PopIn key={l.ma} at={22 + i * 14} style={{position: 'absolute', left: 860, top: 260 + i * 170, width: 980}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 36, background: '#fff', borderRadius: 26, padding: '26px 36px', border: `2px solid ${C.rule}`,
          boxShadow: '0 20px 50px rgba(34,26,102,.12)'}}>
          <span style={{fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 44, fontWeight: 700, color: '#F4F3FF', background: C.codeBg, borderRadius: 14,
            padding: '8px 22px', whiteSpace: 'nowrap'}}>{l.ma}</span>
          <span style={{fontSize: 40, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap'}}>{l.viec}</span>
        </div>
      </PopIn>
    ))}
    <Mascot who="sola" x={360} h={560} at={70} faces={[[70, 'thumbs-up']]} says={[{at: 90, out: 215, text: 'Bạn ơi, giúp mình xếp hết đống thùng nhé!'}]} bubbleTop={300} bubbleW={420} />
  </Stage>
);

export const PHIM_XE: Phim = {id: 'PhimXe', canh: [
  {id: 'bay', dur: 180, el: <CanhBay />, sfx: [[12, 'pop.wav', 0.3], [70, 'type.wav', 0.5, 34]]},
  {id: 'sai', dur: 240, el: <CanhSai />, sfx: [[6, 'click.wav', 0.8], [60, 'wrong.wav', 0.5], [124, 'click.wav', 0.8], [180, 'impact.wav', 0.4]]},
  {id: 'vet-banh', dur: 360, el: <CanhVetBanh />, sfx: [[0, 'whoosh-soft.wav', 0.3], [125, 'pop.wav', 0.4], [292, 'ding.wav', 0.4]]},
  {id: 'doan', dur: 290, el: <CanhDoan />, sfx: [[0, 'swish.wav', 0.35], ...pops([60, 90, 120], 0.35), [148, 'click.wav', 0.8], [202, 'ding.wav', 0.45]]},
  {id: 'di-thang', dur: 260, el: <CanhDiThang />, sfx: [[20, 'type.wav', 0.5, 40], [98, 'click.wav', 0.8], [190, 'ding.wav', 0.5]]},
  {id: 'lenh-moi', dur: 225, el: <CanhLenhMoi />, sfx: [W_IN, ...pops([22, 36, 50], 0.3), [90, 'pop.wav', 0.3]]},
]};
