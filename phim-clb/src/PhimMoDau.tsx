// Phim mở đầu (bối cảnh), viết lại theo hội đồng 20261030-2055 + user 30/10: thầy hiệu trưởng giao nhiệm vụ "đem điều đã học ra giúp
// thị trấn"; Sola hấp tấp đòi nhận hết sáu nơi; Luna định hướng đi đâu trước (kho hàng, vừa sức thân hai bánh); tới kho, Sola chưa dạy R1 lái
// (móc sang phim gói 1). Giới thiệu bằng hành động, không tự giới thiệu tên. Bộ dựng: d10.tsx (video diem10code).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, Icon, Mascot, PopIn, Shake, ease, pop} from './d10';
import {Robot} from './kit';
import {AnhNen} from './nen';
import {BanDo} from './ban-do';
import {Phim, W_IN, pops} from './may-phim';

/** Bản đồ vẽ theo khung 1280×720, phóng 1,5 cho vừa 1920×1080. */
const BanDo15: React.FC<React.ComponentProps<typeof BanDo>> = (p) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transform: 'scale(1.5)', transformOrigin: '0 0'}}><BanDo {...p} /></div>
);

/* 1 · Thư của thầy hiệu trưởng rơi xuống bàn CLB */
const CanhThu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[12]} amp={10}>
      <AnhNen ma="mua-7" mo={4} phong={[1.04, 1.04]} />
      <AbsoluteFill style={{background: 'rgba(247,246,254,.55)'}} />
      <PopIn at={10} from={1.4} style={{position: 'absolute', left: 790, top: 150, width: 620, transform: 'rotate(-2deg)'}}>
        <div style={{background: '#FFFDF5', border: `4px solid ${C.ink}`, borderRadius: 22, padding: '34px 44px', boxShadow: '0 30px 70px rgba(34,26,102,.22)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, fontWeight: 800, color: C.warn, letterSpacing: '.06em'}}>
            <Icon name="Mail" size={34} color={C.warn} />THƯ CỦA THẦY HIỆU TRƯỞNG
          </div>
          <div style={{fontSize: 34, fontWeight: 700, color: C.soft, marginTop: 22}}>Gửi CLB Mật Lệnh Robot,</div>
          <div style={{fontSize: 46, fontWeight: 800, color: C.ink, lineHeight: 1.25, marginTop: 10}}>Hãy đem điều các em đã học ra giúp thị trấn</div>
          <div style={{fontSize: 30, fontWeight: 700, color: C.soft, textAlign: 'right', marginTop: 24, fontStyle: 'italic'}}>Thầy Hiệu trưởng</div>
        </div>
      </PopIn>
      <Burst at={12} x={1100} y={420} color={C.yellow} />
      <Mascot who="sola" x={330} h={620} at={40} faces={[[40, 'shocked'], [100, 'confident']]}
        says={[{at: 100, out: 200, text: 'Giúp cả thị trấn á? Chuyện nhỏ!'}]} bubbleTop={330} bubbleW={380} />
      <Mascot who="luna" x={1690} h={560} at={55} faces={[[55, 'reading']]} lat />
    </Shake>
  );
};

/* 2 · Bản đồ: sáu nơi cần giúp; Sola đòi nhận hết, Luna chặn lại */
const CanhBanDo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <BanDo15 f={f} hien={ease(f, [15, 105], [0, 6])} can={ease(f, [90, 110], [0, 1])} phong={[1.06, 1]} khung={[0, 240]} />
      <Mascot who="sola" x={960} h={400} at={110} faces={[[110, 'cheer']]} says={[{at: 120, out: 190, text: 'Sáu nơi cần giúp? Nhận hết luôn!'}]} bubbleTop={800} bubbleW={400} />
      <Mascot who="luna" x={1760} h={400} at={180} faces={[[180, 'serious']]} lat bubbleTop={880}
        says={[{at: 195, out: 265, text: 'Khoan! CLB mình chỉ có một bộ não R1'}]} bubbleW={420} />
    </>
  );
};

/* 3 · Luna định hướng: thân hai bánh thì đi kho hàng trước; bản vẽ cỗ máy đầu tiên */
const O_BAN_VE = [{ten: 'Thân hai bánh', co: true}, {ten: 'Tay', co: false}, {ten: 'Cảm biến', co: false}];
const CanhChonNoi: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const chon = f >= 130;
  const veVao = pop(f, 175, fps, 14);
  return (
    <>
      <BanDo15 f={f} can={1} sang={chon ? 'mua-1' : undefined} mo={ease(f, [130, 150], [0, 1])} />
      <Mascot who="luna" x={1760} h={420} at={0} faces={[[0, 'thinking'], [130, 'explaining']]} lat bubbleTop={880} bubbleW={460}
        says={[{at: 10, out: 120, text: 'R1 mới có thân hai bánh. Việc nào vừa sức?'}, {at: 135, out: 290, text: 'Kho hàng cần chở thùng. Đi kho trước!'}]} />
      {/* bản vẽ cỗ máy: ô thân sáng, tay và cảm biến chờ */}
      <div style={{position: 'absolute', left: 60, top: 40, width: 520, opacity: Math.min(1, veVao * 2), transform: `translateY(${(1 - veVao) * 60}px)`,
        background: '#EFF6FF', border: `4px solid ${C.solaDeep}`, borderRadius: 26, padding: '22px 28px', boxShadow: '0 24px 60px rgba(34,26,102,.18)',
        backgroundImage: 'linear-gradient(#DBEAFE 1px, transparent 1px), linear-gradient(90deg, #DBEAFE 1px, transparent 1px)', backgroundSize: '28px 28px'}}>
        <div style={{fontSize: 22, fontWeight: 800, color: C.solaDeep, letterSpacing: '.06em'}}>BẢN VẼ CỖ MÁY</div>
        <div style={{fontSize: 40, fontWeight: 800, color: C.ink, marginBottom: 12}}>Xe chở hàng R1</div>
        {O_BAN_VE.map((o, i) => {
          const s = pop(f, 195 + i * 12, fps);
          return (
            <div key={o.ten} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 12, opacity: Math.min(1, s * 2), transform: `scale(${0.8 + 0.2 * s})`, transformOrigin: 'left center'}}>
              <div style={{width: 76, height: 76, borderRadius: 16, border: `3px ${o.co ? 'solid' : 'dashed'} ${o.co ? C.ink : C.faint}`, background: o.co ? C.yellow : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, color: C.faint, overflow: 'hidden'}}>
                {o.co ? <Img src={staticFile('robot/r1.png')} style={{width: 92, height: 92}} /> : '?'}
              </div>
              <div style={{fontSize: 32, fontWeight: 700, color: o.co ? C.ink : C.faint}}>{o.ten}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* 4 · Lên đường: đường CLB → kho sáng dần, R1 chạy trên bản đồ */
const CanhLenDuong: React.FC = () => {
  const f = useCurrentFrame();
  return <BanDo15 f={f} sang="mua-1" duong={ease(f, [5, 70], [0, 1])} r1={ease(f, [15, 110], [0, 1])} mo={1} phong={[1, 1.15]} khung={[0, 140]} tam={[0.22, 0.82]} />;
};

/* 5 · Tới kho: Sola tự tin "viết mấy dòng là chạy", Luna hỏi dạy R1 lái chưa (móc sang phim gói 1) */
const CanhToiKho: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AnhNen ma="mua-1" phong={[1.1, 1]} khung={[0, 200]} />
      <Robot t={{x: 1080, y: 640, goc: -90}} S={280} anh={f > 120 ? 'r1-ngac' : 'r1-vui'} />
      <Mascot who="sola" x={360} h={600} at={5} faces={[[5, 'confident']]} says={[{at: 15, out: 110, text: 'Tới rồi! Viết mấy dòng là R1 chạy vèo!'}]} bubbleTop={300} bubbleW={460} />
      <Mascot who="luna" x={1620} h={560} at={95} faces={[[95, 'wink']]} lat says={[{at: 110, out: 200, text: 'Thế cậu dạy R1 lái chưa đấy?'}]} bubbleTop={330} bubbleW={420} />
    </>
  );
};

export const PHIM_MO_DAU: Phim = {id: 'PhimMoDau', canh: [
  {id: 'thu', dur: 215, el: <CanhThu />, sfx: [[12, 'impact.wav', 0.55], [40, 'pop.wav', 0.35], [100, 'pop.wav', 0.3]]},
  {id: 'ban-do', dur: 275, el: <CanhBanDo />, sfx: [W_IN, ...pops([15, 33, 51, 69, 87, 105], 0.2), [120, 'pop.wav', 0.3], [195, 'wrong.wav', 0.4]]},
  {id: 'chon-noi', dur: 300, el: <CanhChonNoi />, sfx: [W_IN, [130, 'ding.wav', 0.45], ...pops([195, 207, 219], 0.25)]},
  {id: 'len-duong', dur: 140, el: <CanhLenDuong />, sfx: [[10, 'swish.wav', 0.4]]},
  {id: 'toi-kho', dur: 210, el: <CanhToiKho />, sfx: [W_IN, [15, 'pop.wav', 0.3], [110, 'pop.wav', 0.3]]},
]};
