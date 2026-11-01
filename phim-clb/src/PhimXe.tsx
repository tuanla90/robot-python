// Phim gói 1 mùa 1 "Xe hai bánh" khổ dọc 1080×1920 (doc: true):
// Bố cục: Vấn đề ở kho chú Tư (R1 chưa có bánh xe) -> Luna lắp hai bánh vào cái đầu R1 -> 6 cảnh "Show, Don't Tell":
// Thùng nằm bên TRÁI; Sola nghĩ "qua trái thì gọi bánh trái" -> R1 rẽ PHẢI, Sola bấm Chạy lại vẫn rẽ phải, R1 chóng mặt.
// Luna chỉ HỎI DẪN (vết bánh vòng quanh đâu? bánh nào lăn?), Sola tự nhận ra quy luật ("như chân compa").
// Tua lại vị trí đầu, Luna hỏi muốn rẽ trái về phía thùng thì gọi bánh nào -> Sola gọi right_move() -> R1 rẽ trái nhìn thẳng vào thùng;
// Cuối cùng hai bánh cùng lăn đi thẳng tới thùng và tổng kết đúng 3 lệnh của Gói 1: left_move(), right_move(), wait().
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Headline, Icon, Mascot, PopIn, Shake, Stage, ease, pop} from './d10';
import {ChuChot, Robot, TuThe, VetBanh, raNgoai, tamBanh, tien, xoayQuanh} from './kit';
import {Phim, W_IN, pops} from './may-phim';
import {DongHo, NenHienTruong, NhanGoi, Nguoi, TrongXe, Vat} from './doc/kit-doc';

/* ------------------------------------------------------------------ sân kho dọc 1080×1920 và đường đi của R1 */
const S = 240;                                    // cạnh hình robot (px)
const T0: TuThe = {x: 615, y: 690, goc: -90};     // R1 nhìn lên, thùng ở bên TRÁI
const QUANG = 195;                                // quãng đi thẳng tới thùng
const phai = (u: number) => xoayQuanh(T0, 90 * u, 'phai', S);          // u lượt rẽ phải (bánh trái lăn), quanh bánh phải
const T_TRAI = xoayQuanh(T0, -90, 'trai', S);                           // sau right_move(): rẽ trái, nhìn thẳng về thùng
const T_CUOI = tien(T_TRAI, QUANG);
const THUNG = raNgoai(T_CUOI, {x: S * 0.5 + 75, y: 0});
const TRUC_PHAI = raNgoai(T0, tamBanh('phai', S));                      // chân compa: bánh phải đứng yên lúc rẽ phải

type Vet = {tuThe: (u: number) => TuThe; banh: 'trai' | 'phai'; tienDo: number};

/** Sàn kho nhìn từ trên khổ dọc 1080×1920 + thùng bên trái + vệt bánh + R1. zoom quanh điểm tam. */
const SanKho: React.FC<{t: TuThe; anh?: string; chay?: {trai?: boolean; phai?: boolean}; dungYen?: {trai?: boolean; phai?: boolean}; nhan?: number;
  vet?: Vet[]; zoom?: number; tam?: {x: number; y: number}; sangVet?: number; anThung?: boolean}> = ({t, anh, chay, dungYen, nhan, vet = [], zoom = 1, tam = TRUC_PHAI, sangVet = 0, anThung = false}) => (
  <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${tam.x}px ${tam.y}px`, fontFamily: FONT}}>
    <Img src={staticFile('nen-doc/mua-1.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', left: 65, top: 340, width: 950, height: 760, borderRadius: 28,
      background: 'rgba(255,255,255,0.42)',
      backgroundImage: 'linear-gradient(rgba(30,27,75,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(30,27,75,.08) 2px, transparent 2px)',
      backgroundSize: '155px 155px'}} />
    {!anThung && <Img src={staticFile('robot/thung-go.png')} style={{position: 'absolute', left: THUNG.x - 85, top: THUNG.y - 85, width: 170, height: 170}} />}
    <div style={{filter: sangVet ? `drop-shadow(0 0 ${10 * sangVet}px ${C.yellow})` : undefined, position: 'absolute', inset: 0}}>
      {vet.map((v, i) => <VetBanh key={i} tuThe={v.tuThe} banh={v.banh} S={S} tienDo={v.tienDo} />)}
    </div>
    <Robot t={t} S={S} anh={anh} chay={chay} dungYen={dungYen} nhan={nhan} />
  </AbsoluteFill>
);

/** Nút Chạy cạnh bảng code; lún xuống ở các khung `bam`. */
const NutChay: React.FC<{bam: number[]; y?: number}> = ({bam, y = 115}) => {
  const f = useCurrentFrame();
  const lun = bam.some((b) => f >= b && f < b + 6);
  return (
    <div style={{position: 'absolute', left: 730, top: y, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 20, fontSize: 36, fontWeight: 800,
      fontFamily: FONT, color: '#fff', background: lun ? C.solaDeep : C.sola, transform: `scale(${lun ? 0.9 : 1})`, boxShadow: '0 10px 24px rgba(2,132,199,.35)'}}>
      <Icon name="Play" size={32} color="#fff" />Chạy
    </div>
  );
};

/** Dấu "?!" nảy trên đầu R1. */
const Hoi: React.FC<{at: number; t: TuThe; chu?: string}> = ({at, t, chu = '?!'}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  if (f < at) return null;
  const p = pop(f, at, fps, 9);
  return <div style={{position: 'absolute', left: t.x + 50, top: t.y - 210, transform: `scale(${p})`, fontSize: 88, fontWeight: 900, fontFamily: FONT, color: C.bad,
    textShadow: '0 6px 0 #fff'}}>{chu}</div>;
};

/** Mốc dòng sáng: [khung bắt đầu, chỉ số dòng]; trước mốc đầu không sáng. */
const dongSang = (f: number, moc: [number, number][]) => moc.filter(([t]) => f >= t).pop()?.[1] ?? -1;

/* ------------------------------------------------------------------ Mở đầu: Vấn đề của chú Tư & Luna lắp Hai bánh xe */
export const CanhXeVanDe: React.FC = () => (
  <NenHienTruong anh="nen-doc/mua-1.png">
    {[[1, 1], [3, 2], [2, 3], [0, 4], [4, 4], [1, 5]].map(([c, r], i) => <Vat key={i} moc={[[0, c, r]]} />)}
    <DongHo tu={13 * 60} />
    <NhanGoi so={1} ten="Hai bánh xe" />
    <Nguoi anh="tu-sot-ruot" ten="CHÚ TƯ" mau="#EA580C" x={820} h={600} at={0} side="left" bubbleW={560} bubbleTop={1230}
      says={[{at: 10, out: 135, text: 'Năm giờ xe tải tới mà hàng còn chất đầy lối!'}]} />
    <Mascot who="sola" x={240} h={540} at={0} bubbleW={520} bubbleTop={1240}
      faces={[[0, 'surprised-sach'], [140, 'worried']]}
      says={[{at: 140, out: 255, text: 'Chú Tư cần dọn kho gấp mà R1 chưa có bánh xe để đi luôn!'}]} />
  </NenHienTruong>
);

export const CanhXeLunaChePart: React.FC = () => (
  <TrongXe anh="r1" cach={125} tenPart="Hai bánh xe"
    sola={[{at: 10, out: 76, text: 'R1 chưa có bánh xe để chạy!'}]}
    luna={[{at: 82, out: 205, text: 'Để tớ lắp Hai bánh xe vào cho R1 chạy nhé!'}]}
    solaMat={[[0, 'thinking'], [125, 'excited']]}
    lunaMat={[[0, 'confident'], [125, 'happy']]} />
);

/* ------------------------------------------------------------------ 6 cảnh Show, Don't Tell của PhimXe */

/* 1 · Cái bẫy: thùng bên trái, Sola gọi bánh trái (180f) */
const CanhBay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <SanKho t={T0} />
      <div style={{position: 'absolute', left: THUNG.x - 80, top: THUNG.y - 140, fontSize: 30, fontWeight: 800, fontFamily: FONT,
        color: C.ink, background: C.yellow, border: `3px solid ${C.ink}`, borderRadius: 14, padding: '4px 16px', whiteSpace: 'nowrap',
        opacity: ease(f, [10, 25], [0, 1])}}>Thùng ở đây</div>
      <CodeBox lines={['left_move()', 'wait()']} x={70} y={60} w={620} size={38} typeAt={70} cps={0.6} title="mat_lenh.py" />
      <Mascot who="sola" x={250} h={540} at={0} faces={[[0, 'confident']]}
        says={[{at: 12, out: 170, text: 'Thùng bên trái à? Gọi bánh trái là qua!'}]} bubbleTop={1230} bubbleW={520} />
    </>
  );
};

/* 2 · Sập bẫy: R1 rẽ PHẢI; Sola chạy lại, vẫn rẽ phải, R1 chóng mặt (240f) */
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
      <CodeBox lines={['left_move()', 'wait()']} x={70} y={60} w={620} size={38} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[6, 124]} />
      <Mascot who="sola" x={250} h={540} at={0} faces={[[0, 'confident'], [60, 'shocked'], [122, 'confident'], [184, 'facepalm']]} bubbleTop={1230} bubbleW={520}
        says={[
          {at: 64, out: 118, text: 'Ơ! Sao lại quay sang PHẢI?'},
          {at: 124, out: 176, text: 'Chạy lại!'},
          {at: 188, out: 236, text: 'R1 chóng mặt luôn rồi…'},
        ]} />
    </Shake>
  );
};

/* 3 · Vết bánh: Luna hỏi dẫn, Sola tự nói ra quy luật (360f) */
const CanhVetBanh: React.FC = () => {
  const f = useCurrentFrame();
  const z = ease(f, [0, 40], [1, 1.25]);
  return (
    <>
      <SanKho t={phai(2)} anh={f >= 300 ? 'r1' : 'r1-xoay'} zoom={z} sangVet={0.6 + 0.4 * Math.sin(f / 6)}
        vet={[{tuThe: phai, banh: 'trai', tienDo: 2}]} dungYen={f >= 125 ? {phai: true} : {}} chay={f >= 220 ? {trai: true} : {}} nhan={ease(f, [125, 145], [0, 1])} />
      <Burst at={125} x={TRUC_PHAI.x} y={TRUC_PHAI.y} color={C.bad} r={120} />
      <Mascot who="sola" x={230} h={520} at={0} faces={[[0, 'facepalm'], [128, 'thinking'], [292, 'happy']]} bubbleTop={1240} bubbleW={520}
        says={[
          {at: 130, out: 214, text: 'Quanh bánh phải… như chân compa!'},
          {at: 292, out: 356, text: 'Bánh trái! Trái lăn thì xe rẽ PHẢI!'},
        ]} />
      <Mascot who="luna" x={850} h={520} at={10} faces={[[10, 'thinking'], [218, 'explaining']]} side="left" bubbleTop={1240} bubbleW={520} lat
        says={[
          {at: 24, out: 120, text: 'Nhìn vết bánh nè. Nó vòng quanh chỗ nào?'},
          {at: 220, out: 288, text: 'Còn bánh nào đang lăn?'},
        ]} />
      <ChuChot tu={300} y={80}>Chỉ bánh TRÁI lăn → xe rẽ PHẢI</ChuChot>
    </>
  );
};

/* 4 · Rẽ trái về phía thùng: Tua lại -> Luna hỏi Sola muốn rẽ trái thì gọi bánh nào -> Sola gọi right_move() (240f, bỏ đếm 3-2-1) */
const R4 = [115, 152];
const CanhDoan: React.FC = () => {
  const f = useCurrentFrame();
  const tua = ease(f, [0, 28], [2, 0]);                     // tua lại: R1 về chỗ cũ
  const uT = ease(f, R4 as [number, number], [0, 1]);
  const t = f < 105 ? phai(tua) : xoayQuanh(T0, -90 * uT, 'trai', S);
  const sang = dongSang(f, [[98, 0], [112, 1], [156, -1]]);
  return (
    <>
      <SanKho t={t} anh={f >= 156 ? 'r1-vui' : 'r1'} chay={f >= 98 && f < 154 ? {phai: true} : {}} dungYen={f >= 98 ? {trai: true} : {}}
        vet={f >= R4[0] ? [{tuThe: (u) => xoayQuanh(T0, -90 * u, 'trai', S), banh: 'phai', tienDo: uT}] : []} />
      {f < 30 ? (
        <div style={{position: 'absolute', left: 420, top: 380, display: 'flex', alignItems: 'center', gap: 10, fontSize: 36, fontWeight: 800, fontFamily: FONT,
          color: C.ink, background: '#fff', padding: '8px 22px', borderRadius: 16, border: `3px solid ${C.ink}`}}>
          <Icon name="Rewind" size={38} color={C.ink} />Tua lại
        </div>
      ) : null}
      {f >= 85 ? <CodeBox lines={['right_move()', 'wait()']} x={70} y={60} w={620} size={38} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} /> : null}
      {f >= 85 ? <NutChay bam={[94]} /> : null}
      <Mascot who="luna" x={850} h={520} at={0} faces={[[0, 'wink'], [156, 'cheer']]} side="left" bubbleTop={1240} bubbleW={520} lat
        says={[
          {at: 28, out: 86, text: 'Thế muốn rẽ TRÁI về phía thùng thì gọi bánh nào?'},
          {at: 160, out: 234, text: 'Trúng rồi! R1 nhìn thẳng vào thùng!'},
        ]} />
      <Mascot who="sola" x={230} h={520} at={82} faces={[[82, 'confident']]} bubbleTop={1240} bubbleW={500}
        says={[{at: 86, out: 154, text: 'Ngược lại… cho bánh PHẢI lăn!'}]} />
    </>
  );
};

/* 5 · Hai bánh cùng lăn một nhịp: đi thẳng tới đúng cái thùng bên trái (260f) */
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
      <CodeBox lines={['left_move()', 'right_move()', 'wait()']} x={70} y={50} w={620} size={36} typeAt={20} cps={0.7} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[98]} y={135} />
      <Mascot who="sola" x={230} h={520} at={0} faces={[[0, 'confident'], [192, 'cheer']]} bubbleTop={1240} bubbleW={520}
        says={[{at: 12, out: 96, text: 'Đi thẳng thì cho hai bánh cùng lăn!'}]} />
      <Mascot who="luna" x={850} h={520} at={185} faces={[[185, 'great-job']]} side="left" bubbleTop={1240} bubbleW={520} lat
        says={[{at: 196, out: 256, text: 'Chuẩn! Cùng một nhịp là đi thẳng!'}]} />
    </>
  );
};

/* 6 · Lệnh mới của Gói 1: 2 lệnh của Part Hai bánh xe + lệnh nhịp chung wait() của Bộ não R1 (240f) */
const LENH_BANH = [
  {ma: 'left_move()', viec: 'bánh TRÁI lăn → rẽ phải'},
  {ma: 'right_move()', viec: 'bánh PHẢI lăn → rẽ trái'},
];
const CanhLenhMoi: React.FC = () => (
  <Stage>
    <Headline text="Hai lệnh của bánh xe" at={4} accent={['bánh xe']} size={68} top={95} />

    {/* Nhóm 1: 2 lệnh của Part Hai bánh xe */}
    <PopIn at={16} style={{position: 'absolute', left: 65, top: 245, width: 950}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 22px', borderRadius: 999,
        background: C.solaDeep, color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '0.04em', marginBottom: 14}}>
        <Icon name="Disc" size={26} color="#FDE047" stroke={2.6} />
        <span>PART HAI BÁNH XE · 2 LỆNH</span>
      </div>
    </PopIn>
    {LENH_BANH.map((l, i) => (
      <PopIn key={l.ma} at={24 + i * 14} style={{position: 'absolute', left: 65, top: 310 + i * 155, width: 950}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, background: '#fff', borderRadius: 24, padding: '22px 32px',
          border: `3px solid ${C.rule}`, boxShadow: '0 16px 40px rgba(34,26,102,.12)'}}>
          <span style={{fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 36, fontWeight: 700, color: '#F4F3FF', background: C.codeBg, borderRadius: 14,
            padding: '10px 22px', whiteSpace: 'nowrap'}}>{l.ma}</span>
          <span style={{fontSize: 34, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap'}}>{l.viec}</span>
        </div>
      </PopIn>
    ))}

    {/* Nhóm 2: Lệnh chung của Bộ não R1 */}
    <PopIn at={52} style={{position: 'absolute', left: 65, top: 645, width: 950}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 22px', borderRadius: 999,
        background: '#4C1D95', color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '0.04em', marginBottom: 14}}>
        <Icon name="Cpu" size={26} color="#A78BFA" stroke={2.6} />
        <span>BỘ NÃO R1 · LỆNH NHỊP CHUNG</span>
      </div>
    </PopIn>
    <PopIn at={60} style={{position: 'absolute', left: 65, top: 710, width: 950}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, background: '#F5F3FF', borderRadius: 24, padding: '22px 32px',
        border: '3px solid #8B5CF6', boxShadow: '0 16px 40px rgba(76,29,149,.12)'}}>
        <span style={{fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 36, fontWeight: 700, color: '#F4F3FF', background: C.codeBg, borderRadius: 14,
          padding: '10px 22px', whiteSpace: 'nowrap'}}>wait()</span>
        <span style={{fontSize: 34, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap'}}>chạy hết một nhịp</span>
      </div>
    </PopIn>

    <Mascot who="sola" x={260} h={550} at={74} faces={[[74, 'thumbs-up']]}
      says={[{at: 90, out: 230, text: 'Bạn ơi, giúp mình xếp hết đống thùng nhé!'}]} bubbleTop={1230} bubbleW={520} />
  </Stage>
);

/* ------------------------------------------------------------------ Cảnh thử bánh lùi riêng cho Gói 5 (M1G5-Mo) */
const LUI_D = [95, 165];
export const CanhBanhLuiLab: React.FC = () => {
  const f = useCurrentFrame();
  const t0: TuThe = {x: 540, y: 520, goc: -90};
  const u = ease(f, LUI_D as [number, number], [0, 1]);
  const tCur = tien(t0, -230 * u);
  const sang = dongSang(f, [[65, 0], [78, 1], [90, 2], [170, -1]]);
  const chay = f >= 65 && f < 168 ? {trai: true, phai: f >= 78} : {};
  return (
    <>
      <SanKho t={tCur} anh={f >= 168 ? 'm1/kep-cam-vui' : 'm1/kep-cam'} chay={chay} anThung
        vet={f >= LUI_D[0] ? [{tuThe: (v) => tien(t0, -230 * v), banh: 'trai', tienDo: u}, {tuThe: (v) => tien(t0, -230 * v), banh: 'phai', tienDo: u}] : []} />
      {/* Thùng hàng R1 đang ôm cùng lùi ra khỏi hẻm hẹp */}
      <Img src={staticFile('robot/thung-go.png')} style={{position: 'absolute', left: tCur.x - 60, top: tCur.y - 205, width: 120, height: 120}} />
      {[340, 740].map((kx) =>
        [345, 490, 635].map((ky) => (
          <Img key={`${kx}-${ky}`} src={staticFile('robot/m1/o-tuong.png')}
            style={{position: 'absolute', left: kx - 68, top: ky, width: 136, height: 136, borderRadius: 16, boxShadow: '0 8px 18px rgba(15,23,42,0.18)'}} />
        ))
      )}
      {f >= 65 && f < 170 && (
        <>
          <div style={{position: 'absolute', left: tCur.x - 360, top: tCur.y - 28, padding: '8px 18px', borderRadius: 14,
            background: C.codeBg, border: '3px solid #FDE047', color: '#FDE047', fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontSize: 24, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>
            <span>left_back()</span>
            <Icon name="ArrowDown" size={22} color="#FDE047" stroke={3} />
          </div>
          {f >= 78 && (
            <div style={{position: 'absolute', left: tCur.x + 135, top: tCur.y - 28, padding: '8px 18px', borderRadius: 14,
              background: C.codeBg, border: '3px solid #FDE047', color: '#FDE047', fontFamily: 'JetBrains Mono, Consolas, monospace',
              fontSize: 24, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>
              <Icon name="ArrowDown" size={22} color="#FDE047" stroke={3} />
              <span>right_back()</span>
            </div>
          )}
        </>
      )}
      <Burst at={168} x={540} y={750} color={C.yellow} />
      <CodeBox lines={['left_back()', 'right_back()', 'wait()']} x={70} y={50} w={620} size={36} typeAt={15} cps={0.7} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[62]} y={135} />
      <Mascot who="sola" x={230} h={520} at={0} faces={[[0, 'confident'], [168, 'cheer']]} bubbleTop={1240} bubbleW={520}
        says={[{at: 10, out: 60, text: 'Hai bánh cùng quay ngược một nhịp xem sao!'}]} />
      <Mascot who="luna" x={850} h={520} at={160} faces={[[160, 'great-job']]} side="left" bubbleTop={1240} bubbleW={520} lat
        says={[{at: 170, out: 235, text: 'Hai bánh lùi đều nên R1 mang thùng rút thẳng ra khỏi hẻm cụt!'}]} />
    </>
  );
};

export const CANH_LAB_XE: Phim['canh'] = [
  {id: 'bay', dur: 180, el: <CanhBay />, sfx: [[12, 'pop.wav', 0.3], [70, 'type.wav', 0.5, 34]]},
  {id: 'sai', dur: 240, el: <CanhSai />, sfx: [[6, 'click.wav', 0.8], [60, 'wrong.wav', 0.5], [124, 'click.wav', 0.8], [180, 'impact.wav', 0.4]]},
  {id: 'vet-banh', dur: 360, el: <CanhVetBanh />, sfx: [[0, 'whoosh-soft.wav', 0.3], [125, 'pop.wav', 0.4], [292, 'ding.wav', 0.4]]},
  {id: 'doan', dur: 240, el: <CanhDoan />, sfx: [[0, 'swish.wav', 0.35], [94, 'click.wav', 0.8], [156, 'ding.wav', 0.45]]},
  {id: 'di-thang', dur: 260, el: <CanhDiThang />, sfx: [[20, 'type.wav', 0.5, 40], [98, 'click.wav', 0.8], [190, 'ding.wav', 0.5]]},
  {id: 'lenh-moi', dur: 240, el: <CanhLenhMoi />, sfx: [W_IN, ...pops([24, 38, 60], 0.3), [90, 'pop.wav', 0.3]]},
];

export const PHIM_XE: Phim = {
  id: 'PhimXe',
  doc: true,
  canh: [
    {id: 'van-de-kho', dur: 270, el: <CanhXeVanDe />, sfx: [W_IN]},
    {id: 'luna-che-hai-banh', dur: 215, el: <CanhXeLunaChePart />, sfx: [[125, 'impact.wav', 0.5], [125, 'ding.wav', 0.4]]},
    ...CANH_LAB_XE,
  ],
};
