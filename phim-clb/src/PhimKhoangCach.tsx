// Phim gói 3 mùa 1 "Cảm biến khoảng cách" & gói 7 "Cảm biến bên" khổ dọc 1080×1920 (doc: true), theo đúng tinh thần Show, Don't Tell:
// 1. Gói 3 (Mắt khoảng cách trước mũi): Tia sáng chỉ dò đúng 1 ô sát mũi xe. Ô trống -> front_clear() là True -> tiến 1 bước;
//    Khi thùng ở ngay ô sát mũi -> front_clear() đổi sang False -> R1 dừng ngay trước thùng, không bao giờ đụng!
//    (Tuyệt đối không lộ left_clear/right_clear của Gói 7 ở Gói 3).
// 2. Gói 7 (Mắt hai bên): Ở ngã ba kệ hàng, dò hai ô sát hông bằng left_clear() và right_clear() để biết bên nào trống trước khi rẽ.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Burst, C, CodeBox, FONT, Headline, Icon, Mascot, MONO, PopIn, Shake, Stage} from './d10';
import {ChuChot, mo} from './kit';
import {Phim, W_IN, pops} from './may-phim';
import {ChuNay, DongHo, Moc, NenHienTruong, NhanGoi, Nguoi, O as OKho, TrongXe, Vat, Xe, tamO} from './doc/kit-doc';

const O = 155;

const SanThu: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Img src={staticFile('nen-doc/mua-1.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', left: 65, top: 340, width: 950, height: 760, borderRadius: 28,
      background: 'rgba(255,255,255,0.42)',
      backgroundImage: 'linear-gradient(rgba(30,27,75,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(30,27,75,.08) 2px, transparent 2px)',
      backgroundSize: '155px 155px'}} />
    {children}
  </AbsoluteFill>
);

const NutChay: React.FC<{bam: number[]; y?: number}> = ({bam, y = 125}) => {
  const f = useCurrentFrame();
  const lun = bam.some((b) => f >= b && f < b + 6);
  return (
    <div style={{position: 'absolute', left: 730, top: y, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 20, fontSize: 36, fontWeight: 800,
      fontFamily: FONT, color: '#fff', background: lun ? C.solaDeep : C.sola, transform: `scale(${lun ? 0.9 : 1})`, boxShadow: '0 10px 24px rgba(2,132,199,.35)'}}>
      <Icon name="Play" size={32} color="#fff" />Chạy
    </div>
  );
};

const dongSang = (f: number, moc: [number, number][]) => moc.filter(([t]) => f >= t).pop()?.[1] ?? -1;

/* Mở đầu Gói 3: Thùng dời chỗ liên tục, đếm bước cứng bị sai -> Luna gắn Mắt khoảng cách */
const R_KC_VAN_DE: Moc[] = [[0, 2, 5, -90], [30, 2, 5, -90], [80, 2, 2, -90], [120, 2, 2, -90], [124, 2, 5, -90], [190, 2, 5, -90], [222, 2, 3.62, -90], [240, 2, 3.7, -90]];

export const CanhKhoangCachVanDe: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[223]} amp={8}>
      <NenHienTruong anh="nen-doc/mua-1.png">
        <Vat moc={[[0, 2, 0], [150, 2, 0], [178, 2, 3]]} />
        <Xe anh="kep" moc={R_KC_VAN_DE} mo={(g) => (g >= 120 && g < 140 ? 0.25 : 1)} doi={[[84, 'kep-ngac'], [124, 'kep'], [224, 'kep-ngac']]} />
        {f >= 82 && f < 120 ? (
          <div style={{position: 'absolute', left: tamO(2, 1).x - 6, top: tamO(2, 0).y + OKho * 0.45, width: 12, height: OKho * 0.95,
            background: `repeating-linear-gradient(${C.bad} 0 14px, transparent 14px 26px)`}} />
        ) : null}
        <ChuNay chu="HỤT!" at={84} den={120} x={790} y={tamO(2, 1).y} mau={C.warn} />
        <ChuNay chu="CỘP!" at={223} den={270} x={790} y={tamO(2, 3).y} />
        <CodeBox lines={['for i in range(3):', '    move()']} x={300} y={150} w={480} size={30} title="Sola viết vội" />
        <DongHo tu={13 * 60 + 40} />
        <NhanGoi so={3} ten="Cảm biến khoảng cách" />
        <Mascot who="sola" x={240} h={540} at={0}
          faces={[[0, 'confident'], [84, 'confused'], [224, 'facepalm']]}
          says={[
            {at: 4, out: 64, text: 'Đếm ba bước là tới!'},
            {at: 230, out: 295, text: 'Ơ… lại không đúng!'},
          ]}
          bubbleW={520} bubbleTop={1240} />
        {f >= 135 ? (
          <Nguoi anh="tu-nghi" ten="CHÚ TƯ" mau="#EA580C" x={820} h={600} at={135} side="left" bubbleW={560} bubbleTop={1230}
            says={[{at: 140, out: 210, text: 'Để thùng đây cho gần nè.'}]} />
        ) : null}
      </NenHienTruong>
    </Shake>
  );
};

export const CanhKhoangCachLunaChePart: React.FC = () => (
  <TrongXe anh="kep-cam" cach={125} tenPart="Mắt khoảng cách"
    luna={[{at: 8, out: 68, text: 'Thùng mỗi lúc một chỗ, đếm sao kịp?'}]}
    sola={[{at: 74, out: 148, text: 'Cho R1 tự nhìn phía trước!'}]}
    lunaMat={[[0, 'thinking'], [125, 'happy']]}
    solaMat={[[0, 'worried'], [74, 'excited']]} />
);

/* 1 · Thử mắt khoảng cách trước mũi: Dò đúng 1 ô sát mũi (True -> đi tiếp, gặp thùng sát mũi -> False -> dừng chuẩn!) (280f) */
const CanhFrontClear: React.FC = () => {
  const f = useCurrentFrame();
  // Nhịp 1 (f=30..70): R1 ở y=760, ô sát mũi (y=605) trống -> front_clear() là True!
  // f=70..115: R1 tiến 1 ô lên y=605.
  // Nhịp 2 (f>=115): Ô sát mũi lúc này là y=450 (có thùng gỗ!) -> front_clear() báo False -> dừng lại vừa khít!
  const u = mo(f, 70, 115);
  const yRobot = 760 - u * O;
  const dangTrong = f < 112;
  const yO = dangTrong ? 605 : 450;
  const sang = dongSang(f, [[30, 0], [68, 1], [115, 0], [155, -1]]);

  return (
    <SanThu>
      {/* Thùng gỗ đặt ở (540, 450) */}
      <Img src={staticFile('robot/thung-go.png')} style={{position: 'absolute', left: 540 - 75, top: 450 - 75, width: 150, height: 150, zIndex: 8}} />

      {/* Ô ngay sát trước mũi R1 được tia cảm biến soi */}
      {f >= 28 && (f < 72 || f >= 112) ? (
        <div style={{position: 'absolute', left: 540 - 76, top: yO - 76, width: 152, height: 152, borderRadius: 22,
          background: dangTrong ? 'rgba(14,159,110,0.22)' : 'rgba(239,68,68,0.22)',
          border: `5px dashed ${dangTrong ? C.good : C.bad}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9}}>
          <div style={{position: 'absolute', left: 165, padding: '8px 18px', borderRadius: 14,
            background: dangTrong ? C.good : C.bad, color: '#fff', fontFamily: MONO, fontSize: 28, fontWeight: 800,
            border: '3px solid #fff', whiteSpace: 'nowrap'}}>
            {dangTrong ? 'True (Trống)' : 'False (Có thùng!)'}
          </div>
        </div>
      ) : null}

      <Img src={staticFile('robot/lab/cb-kc-truoc.png')}
        style={{position: 'absolute', left: 540 - 130, top: yRobot - 130, width: 260, height: 260, transform: 'rotate(-90deg)', zIndex: 12}} />
      <Burst at={125} x={540} y={450} color={C.yellow} />

      <CodeBox
        lines={['while front_clear():', '    move()']}
        x={70} y={55} w={620} size={36} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[24]} y={120} />

      <Mascot who="luna" x={850} h={520} at={0} side="left" bubbleTop={1240} bubbleW={520} lat
        faces={[[0, 'thinking'], [125, 'great-job']]}
        says={[
          {at: 10, out: 112, text: 'Nhìn ô sáng trước mũi kìa. Nó soi xa mấy ô?'},
          {at: 125, out: 205, text: 'Đúng rồi! Thấy thùng sát mũi là tự dừng ngay!'},
        ]} />
      <Mascot who="sola" x={230} h={520} at={115} faces={[[115, 'happy'], [205, 'cheer']]} bubbleTop={1240} bubbleW={520}
        says={[{at: 195, out: 274, text: 'Đúng một ô sát mũi! Còn trống thì đi, gặp thùng là dừng!'}]} />
      <ChuChot tu={200} y={960}>front_clear() → ô sát mũi trống hay vướng</ChuChot>
    </SanThu>
  );
};

/* 2 · Tổng kết lệnh mới của Gói 3 (chỉ front_clear, không lộ left_clear/right_clear của Gói 7) (210f) */
const LENH_KC = [
  {ma: 'front_clear()', viec: 'ô sát mũi trống → True'},
  {ma: 'while front_clear():', viec: 'lặp đi tới sát vật cản'},
];

const CanhLenhKhoangCach: React.FC = () => (
  <Stage>
    <Headline text="Mắt nhìn phía trước" at={4} accent={['phía trước']} size={68} top={140} />
    {LENH_KC.map((l, i) => (
      <PopIn key={l.ma} at={22 + i * 16} style={{position: 'absolute', left: 65, top: 340 + i * 200, width: 950}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, background: '#fff', borderRadius: 26, padding: '26px 34px',
          border: `3px solid ${C.rule}`, boxShadow: '0 20px 50px rgba(34,26,102,.12)'}}>
          <span style={{fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 34, fontWeight: 700, color: '#F4F3FF', background: C.codeBg, borderRadius: 14,
            padding: '10px 20px', whiteSpace: 'nowrap'}}>{l.ma}</span>
          <span style={{fontSize: 34, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap'}}>{l.viec}</span>
        </div>
      </PopIn>
    ))}
    <Mascot who="sola" x={260} h={550} at={60} faces={[[60, 'thumbs-up']]}
      says={[{at: 78, out: 202, text: 'Giờ chú Tư để thùng ở đâu R1 cũng tự tìm tới được!'}]} bubbleTop={1220} bubbleW={520} />
  </Stage>
);

/* ------------------------------------------------------------------ Cảnh thử Cảm biến bên riêng cho Gói 7 (M1G7-Mo) */
const CanhLeftRightClear: React.FC = () => {
  const f = useCurrentFrame();
  const sang = dongSang(f, [[45, 0], [120, 1], [140, 2], [190, -1]]);

  return (
    <SanThu>
      {/* Kệ chặn trước mặt (540, 445) và thùng chặn bên phải (695, 600); bên trái (385, 600) trống */}
      <Img src={staticFile('robot/m1/o-tuong.png')} style={{position: 'absolute', left: 540 - 72, top: 445 - 72, width: 144, height: 144, borderRadius: 16}} />
      <Img src={staticFile('robot/thung-go.png')} style={{position: 'absolute', left: 695 - 72, top: 600 - 72, width: 144, height: 144}} />

      {f >= 40 ? (
        <>
          <div style={{position: 'absolute', left: 385 - 72, top: 600 - 72, width: 144, height: 144, borderRadius: 22,
            background: 'rgba(14,159,110,0.22)', border: `5px dashed ${C.good}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{position: 'absolute', top: -54, padding: '6px 14px', borderRadius: 12, background: C.good, color: '#fff',
              fontFamily: MONO, fontSize: 22, fontWeight: 800, whiteSpace: 'nowrap'}}>left_clear() → True</span>
          </div>
          <div style={{position: 'absolute', left: 695 - 72, top: 600 - 72, width: 144, height: 144, borderRadius: 22,
            background: 'rgba(239,68,68,0.22)', border: `5px dashed ${C.bad}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{position: 'absolute', top: -54, padding: '6px 14px', borderRadius: 12, background: C.bad, color: '#fff',
              fontFamily: MONO, fontSize: 22, fontWeight: 800, whiteSpace: 'nowrap'}}>right_clear() → False</span>
          </div>
        </>
      ) : null}

      <Img src={staticFile('robot/lab/cb-kc-du.png')}
        style={{position: 'absolute', left: 540 - 130, top: 600 - 130, width: 260, height: 260,
          transform: `rotate(${f >= 135 ? -180 : -90}deg)`, transition: 'transform 0.35s'}} />
      <Burst at={145} x={385} y={600} color={C.yellow} />

      <CodeBox
        lines={['if left_clear():', '    right_move()', '    wait()']}
        x={70} y={50} w={620} size={34} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[38]} y={130} />

      <Mascot who="luna" x={850} h={520} at={0} side="left" bubbleTop={1240} bubbleW={520} lat
        faces={[[0, 'thinking'], [140, 'great-job']]}
        says={[{at: 10, out: 110, text: 'Trước mặt bị kệ chắn rồi. Hai mắt bên hông báo bên nào trống?'}]} />
      <Mascot who="sola" x={230} h={520} at={105} faces={[[105, 'happy'], [145, 'cheer']]} bubbleTop={1240} bubbleW={520}
        says={[{at: 112, out: 230, text: 'Bên trái báo True! Gọi right_move() rẽ trái thôi!'}]} />
      <ChuChot tu={155} y={960}>left_clear() · right_clear() → dò hai bên hông</ChuChot>
    </SanThu>
  );
};

export const CANH_LAB_KC_TRUOC: Phim['canh'] = [
  {id: 'front-clear', dur: 280, el: <CanhFrontClear />, sfx: [[28, 'click.wav', 0.8], [55, 'swish.wav', 0.45], [135, 'ding.wav', 0.7]]},
  {id: 'lenh-kc-truoc', dur: 210, el: <CanhLenhKhoangCach />, sfx: [W_IN, ...pops([22, 38], 0.3)]},
];

export const CANH_LAB_KC_BEN: Phim['canh'] = [
  {id: 'left-right-clear', dur: 240, el: <CanhLeftRightClear />, sfx: [[38, 'click.wav', 0.8], [145, 'ding.wav', 0.6]]},
];

export const PHIM_KHOANG_CACH: Phim = {
  id: 'PhimKhoangCach',
  doc: true,
  canh: [
    {id: 'van-de-khoang-cach', dur: 300, el: <CanhKhoangCachVanDe />, sfx: [[84, 'wrong.wav', 0.5], [223, 'impact.wav', 0.5]]},
    {id: 'luna-che-khoang-cach', dur: 160, el: <CanhKhoangCachLunaChePart />, sfx: [[125, 'impact.wav', 0.5], [125, 'ding.wav', 0.4]]},
    ...CANH_LAB_KC_TRUOC,
  ],
};
