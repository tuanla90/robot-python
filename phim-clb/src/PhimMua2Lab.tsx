// Các cảnh Lab dạy cơ chế riêng cho 3 gói đầu Mùa 2 (Nhà máy), khổ dọc 1080×1920 (doc: true).
// Phim thật của cả 3 gói (G<n>Mo/Thu + G<n>Lam) nằm trong doc/m2.tsx; mảng CANH_LAB_* ở đây
// chỉ là phần cảnh cơ chế + so sánh được spread vào giữa mo()/ket() của từng gói.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Shake} from './d10';
import {ChuChot, San, mo} from './kit';
import {Phim, W_IN, pops} from './may-phim';
import {ChuNay, NenHienTruong, O as OHienTruong, ODat, TrongXe, Xe, tamO} from './doc/kit-doc';
import {CongThucLab, HangSoTayLab, KhungLabLuna} from './PhimTayKep';

const O = 155;

const NutChayM2: React.FC<{bam: number[]; y?: number}> = ({bam, y = 125}) => {
  const f = useCurrentFrame();
  const lun = bam.some((b) => f >= b && f < b + 6);
  return (
    <div style={{position: 'absolute', left: 730, top: y, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 20, fontSize: 36, fontWeight: 800,
      fontFamily: FONT, color: '#fff', background: lun ? C.solaDeep : C.sola, transform: `scale(${lun ? 0.9 : 1})`, boxShadow: '0 10px 24px rgba(2,132,199,.35)'}}>
      <Icon name="Play" size={32} color="#fff" />Chạy
    </div>
  );
};

const dongSangM2 = (f: number, moc: [number, number][]) => moc.filter(([t]) => f >= t).pop()?.[1] ?? -1;

/* ============================================================================
   1. CANH_LAB_BANH_XICH — Bộ phận: Thân Bánh Xích (xich)
   Phim thật của gói 1 mùa 2 là G1Mo/G1Lam trong doc/m2.tsx; mảng này chỉ là
   các cảnh dạy cơ chế xoay 2 nhịp chen vào giữa, xem mục 9 LUAT-SUA-PHIM-CLB.md.
   ========================================================================== */

/** Cảnh 1 Show, Don't Tell (260f): Sola gọi 1 nhịp left_move() + wait() tưởng rẽ đủ như xe 2 bánh, nhưng xích chỉ nhích 45°! */
const CanhXich1NhipSai: React.FC = () => {
  const f = useCurrentFrame();
  const sang = dongSangM2(f, [[28, 0], [42, 1], [118, 2], [132, 3], [190, -1]]);

  return (
    <Shake hits={[132]} amp={10}>
      <NenHienTruong anh="nen-doc/mua-2.png" mua="m2">
        {[1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
        <ODat ten="o-nut-ban" c={3} r={2} />

        <Xe anh="xich" vet={false} moc={[[0, 2, 2, -90], [40, 2, 2, -90], [85, 2, 2, -45], [130, 2, 2, -45], [131, 2, 2, -90], [185, 2, 1, -90]]} />

        {f >= 82 && f < 130 ? <ChuNay chu="Mới nhích 45°?!" at={82} den={128} x={540} y={400} mau={C.warn} co={64} /> : null}
        {f >= 132 ? <ChuNay chu="Trả về hướng cũ!" at={132} den={200} x={540} y={390} mau={C.bad} co={60} /> : null}

        <CodeBox
          lines={['left_move()', 'wait()', 'left_move(); right_move()', 'wait()']}
          x={70} y={45} w={620} size={32} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
        <NutChayM2 bam={[24]} y={135} />

        <Mascot who="sola" x={230} h={520} at={0}
          faces={[[0, 'confident'], [85, 'shocked'], [135, 'facepalm']]} bubbleTop={1240} bubbleW={520}
          says={[
            {at: 10, out: 80, text: 'Van ở bên phải! Gọi một nhịp rẽ phải rồi đi thẳng như cũ nhé!'},
            {at: 86, out: 170, text: 'Ủa?! Sao một nhịp nó mới nhích có nửa góc 45 độ vậy?'},
          ]} />
        <Mascot who="luna" x={850} h={520} at={165} side="left" bubbleTop={1240} bubbleW={520} lat
          faces={[[165, 'thinking']]}
          says={[{at: 172, out: 254, text: 'Dải xích bám sàn nặng lắm! Một nhịp mới nhích nửa góc thì làm sao cho đủ 90 độ?'}]} />
      </NenHienTruong>
    </Shake>
  );
};

/** Cảnh 2 Show, Don't Tell (280f): Sola gọi 2 nhịp liên tiếp để rẽ đủ 90° rồi băng thẳng qua băng chuyền không bị trôi! */
const CanhXich2NhipDung: React.FC = () => {
  const f = useCurrentFrame();
  const sang = dongSangM2(f, [[32, 0], [42, 1], [90, 2], [100, 3], [145, 4], [155, 5], [215, -1]]);

  return (
    <NenHienTruong anh="nen-doc/mua-2.png" mua="m2">
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
      <ODat ten="o-nut-ban" c={3} r={2} />

      <Xe anh="xich" vet={false}
        moc={[[0, 1, 2, -90], [40, 1, 2, -90], [80, 1, 2, -45], [95, 1, 2, -45], [135, 1, 2, 0], [150, 1, 2, 0], [210, 3, 2, 0]]} />

      {f >= 75 && f < 130 ? <ChuNay chu="Nấc 1 · 45°" at={75} den={128} x={385} y={420} mau={C.warn} co={60} /> : null}
      {f >= 132 && f < 190 ? <ChuNay chu="Nấc 2 · Đủ 90°!" at={132} den={188} x={385} y={420} mau={C.good} co={64} /> : null}
      <Burst at={212} x={tamO(3, 2).x} y={tamO(3, 2).y} color={C.yellow} />

      <CodeBox
        lines={[
          'left_move()', 'wait()  # Nấc 1 (45°)',
          'left_move()', 'wait()  # Nấc 2 (90°)',
          'left_move(); right_move()', 'wait()  # Băng qua băng chuyền!',
        ]}
        x={70} y={35} w={620} size={28} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChayM2 bam={[26]} y={140} />

      <Mascot who="sola" x={230} h={520} at={0}
        faces={[[0, 'confident'], [135, 'happy'], [212, 'cheer']]} bubbleTop={1240} bubbleW={520}
        says={[
          {at: 8, out: 120, text: 'Một nhịp được nửa góc thì tớ gọi hai nhịp liên tiếp là tròn 90 độ!'},
          {at: 205, out: 274, text: 'Đi trên băng chuyền vững ru, không bị đẩy trôi tí nào luôn!'},
        ]} />
      <Mascot who="luna" x={850} h={520} at={130} side="left" bubbleTop={1240} bubbleW={520} lat
        faces={[[130, 'great-job']]}
        says={[{at: 135, out: 202, text: 'Chuẩn luôn! Hai nấc liên tiếp là rẽ vuông góc!'}]} />
      <ChuChot tu={212} y={960}>Hai nhịp liên tiếp → xích rẽ đủ 90°</ChuChot>
    </NenHienTruong>
  );
};

/** Nhãn thân (trung tính, không dùng ChuNay vì ChuNay có icon Zap dành cho câu reo/báo động). */
const NhanThan: React.FC<{chu: string; at: number; den: number}> = ({chu, at, den}) => {
  const f = useCurrentFrame();
  if (f < at || f > den) return null;
  return (
    <div style={{position: 'absolute', left: 540, top: 300, transform: 'translate(-50%, -50%)',
      padding: '10px 24px', borderRadius: 16, background: '#fff', color: C.ink, border: `4px solid ${C.ink}`,
      boxShadow: `0 6px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 32, whiteSpace: 'nowrap', zIndex: 20}}>
      {chu}
    </div>
  );
};

/** Cảnh 0 So sánh (LUAT-SUA-PHIM-CLB.md mục 9): bánh và xích LẦN LƯỢT qua CÙNG một ô băng chuyền —
    thấy trước khi nghe, thay cho chỉ nghe Sola / cô Hạnh kể lý do. */
const CanhXichSoSanh: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Shake hits={[98]} amp={10}>
      <NenHienTruong anh="nen-doc/mua-2.png" mua="m2">
        {[1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
        <ODat ten="o-nut-ban" c={3} r={2} />

        {f < 130 ? (
          <Xe anh="r1-banh" vet={false} moc={[[0, 1, 2, 0], [40, 1, 2, 0], [95, 2, 2, 0], [125, 2, 3, 0]]} />
        ) : (
          <Xe anh="xich" vet={false} moc={[[130, 1, 2, 0], [190, 1, 2, 0], [250, 3, 2, 0]]} />
        )}

        <NhanThan chu="Thân cũ: xe hai bánh" at={10} den={95} />
        <NhanThan chu="Thân mới: xích" at={135} den={190} />
        {f >= 98 && f < 132 ? <ChuNay chu="BỊ BĂNG ĐẨY TRÔI!" at={98} den={130} x={385 + O} y={tamO(1, 2).y - 170} mau={C.bad} co={46} /> : null}
        {f >= 258 ? <ChuNay chu="ĐI VỮNG, KHÔNG TRÔI!" at={258} den={305} x={tamO(3, 2).x} y={tamO(1, 2).y - 170} mau={C.good} co={44} /> : null}

        <Mascot who="sola" x={230} h={480} at={0}
          faces={[[0, 'confident'], [98, 'shocked'], [262, 'happy']]} bubbleTop={1250} bubbleW={540}
          says={[{at: 270, out: 305, text: 'Cùng ô băng chuyền mà khác hẳn nhau!'}]} />
        <ChuChot tu={262} y={960}>Bánh bị đẩy trôi, xích đi vững — cùng một ô</ChuChot>
      </NenHienTruong>
    </Shake>
  );
};

export const CANH_LAB_BANH_XICH: Phim['canh'] = [
  {id: 'xich-0-so-sanh', dur: 315, el: <CanhXichSoSanh />, sfx: [W_IN, [98, 'wrong.wav', 0.55], [258, 'ding.wav', 0.6]]},
  {id: 'xich-1-nhip-sai', dur: 260, el: <CanhXich1NhipSai />, sfx: [[24, 'click.wav', 0.8], [40, 'swish.wav', 0.45], [132, 'wrong.wav', 0.6]]},
  {id: 'xich-2-nhip-dung', dur: 280, el: <CanhXich2NhipDung />, sfx: [[26, 'click.wav', 0.8], [40, 'swish.wav', 0.45], [95, 'swish.wav', 0.45], [212, 'ding.wav', 0.7]]},
];

/* ============================================================================
   2. CANH_LAB_VOI_PHUN — Bộ phận: Vòi Phun Nước (hoi)
   Phim thật của gói 2 mùa 2 là G2Thu/G2Lam trong doc/m2.tsx; mảng này chỉ là
   các cảnh dạy cơ chế spray()/spray_back() chen vào giữa.
   ========================================================================== */

/** Rãnh nước nóng bốc hơi (bản dùng lại trong cảnh so sánh, giống RanhNong ở doc/m2.tsx). */
const RanhNongSS: React.FC<{r: number}> = ({r}) => {
  const p = tamO(0, r);
  return (
    <div style={{position: 'absolute', left: p.x - OHienTruong / 2, top: p.y - OHienTruong * 0.38, width: 5 * OHienTruong, height: OHienTruong * 0.76,
      background: 'linear-gradient(180deg, #7C2D12 0%, #EA580C 50%, #7C2D12 100%)', borderTop: '5px solid #FDBA74', borderBottom: '5px solid #FDBA74',
      boxShadow: '0 0 24px rgba(249,115,22,.65)'}} />
  );
};

/** Quầng nóng đỏ trên van đang quá nhiệt (bản tĩnh dùng trong cảnh so sánh). */
const QuangNongSS: React.FC<{c: number; r: number}> = ({c, r}) => {
  const p = tamO(c, r);
  return (
    <div style={{position: 'absolute', left: p.x - OHienTruong * 0.65, top: p.y - OHienTruong * 0.65, width: OHienTruong * 1.3, height: OHienTruong * 1.3, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(239,68,68,.65) 0%, rgba(249,115,22,.35) 55%, transparent 75%)'}} />
  );
};

/** Tia nước phun từ mũi robot tới ô đích (bản dùng trong cảnh so sánh). */
const TiaNuocSS: React.FC<{tu: {x: number; y: number}; den: {x: number; y: number}}> = ({tu, den}) => {
  const dx = den.x - tu.x, dy = den.y - tu.y, dai = Math.hypot(dx, dy), g = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <div style={{position: 'absolute', left: tu.x, top: tu.y - 9, width: dai, height: 18, borderRadius: 99,
      background: 'linear-gradient(90deg, #7DD3FC, #38BDF8)', transform: `rotate(${g}deg)`, transformOrigin: '0 50%', boxShadow: '0 0 22px #38BDF8', zIndex: 9}} />
  );
};

/** Cảnh 0 So sánh (LUAT-SUA-PHIM-CLB.md mục 9): thân cũ (không vòi phun) đứng bó tay trước rãnh nóng,
    thân mới (vòi phun) phun xa qua rãnh mở van — CÙNG vị trí, cùng rãnh, thấy trước khi nghe. */
const CanhVoiPhunSoSanh: React.FC = () => {
  const f = useCurrentFrame();
  const diemXe = tamO(2, 3);
  const diemVan = tamO(2, 1);
  const phun = f >= 150 && f < 190;

  return (
    <Shake hits={[42]} amp={8}>
      <NenHienTruong anh="nen-doc/mua-2.png" mua="m2">
        <RanhNongSS r={2} />
        {f < 182 ? <QuangNongSS c={2} r={1} /> : null}
        <ODat ten={f >= 182 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={1} />

        {phun ? <TiaNuocSS tu={{x: diemXe.x, y: diemXe.y - 60}} den={{x: diemVan.x, y: diemVan.y}} /> : null}

        {f < 130 ? (
          <Xe anh="xich" vet={false} moc={[[0, 2, 3, -90]]} />
        ) : (
          <Xe anh="xich-voi" vet={false} moc={[[130, 2, 3, -90]]} doi={[[150, 'xich-voi-phun'], [190, 'xich-voi-vui']]} />
        )}

        <NhanThan chu="Thân cũ: không vòi phun" at={10} den={95} />
        <NhanThan chu="Thân mới: vòi phun nước" at={135} den={188} />
        {f >= 42 && f < 95 ? <ChuNay chu="RÃNH NÓNG CHẶN, BÓ TAY!" at={42} den={92} x={diemXe.x} y={diemXe.y - 190} mau={C.bad} co={36} /> : null}
        {f >= 182 ? <ChuNay chu="ĐÓNG VAN TỪ XA!" at={182} den={228} x={diemVan.x} y={diemXe.y - 190} mau={C.good} co={38} /> : null}

        <Burst at={182} x={diemVan.x} y={diemVan.y} color={C.yellow} />

        <Mascot who="sola" x={230} h={480} at={0}
          faces={[[0, 'worried'], [42, 'shocked'], [185, 'happy']]} bubbleTop={1250} bubbleW={540}
          says={[{at: 192, out: 226, text: 'Không cần bước qua rãnh nóng mà vẫn đóng được van!'}]} />
        <ChuChot tu={185} y={960}>Không vòi phun thì bó tay, có vòi phun thì đóng van từ xa</ChuChot>
      </NenHienTruong>
    </Shake>
  );
};

/** Cảnh 1 (6.5s = 195f): Phun nhẹ spray() / spray_back() tầm 2 ô, đổi van, xe đứng yên. */
const CanhVoiPhunNhe: React.FC = () => {
  const f = useCurrentFrame();
  const phunTruoc = f >= 30 && f < 95;
  const phunSau = f >= 115 && f < 175;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: VÒI PHUN NƯỚC"
      tieuDe="spray() & spray_back(): Phun nhẹ tầm 2 ô!" accent={['spray()', 'spray_back():', 'tầm 2 ô!']}
      phuDe="Tia nước bay qua rào thấp & băng chuyền để đóng/mở van — Nhịp phun thì bánh nghỉ">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* Tia nước trước / sau */}
      {phunTruoc ? (
        <div style={{position: 'absolute', left: 560, top: 530 - 12, width: 280, height: 24, borderRadius: 999,
          background: 'linear-gradient(90deg, #38BDF8, #0284C7)', boxShadow: '0 0 20px #38BDF8', zIndex: 9}} />
      ) : null}
      {phunSau ? (
        <div style={{position: 'absolute', left: 240, top: 530 - 12, width: 280, height: 24, borderRadius: 999,
          background: 'linear-gradient(270deg, #38BDF8, #0284C7)', boxShadow: '0 0 20px #38BDF8', zIndex: 9}} />
      ) : null}

      {/* Van bên phải (845, 530) và Van bên trái (235, 530) */}
      <div style={{position: 'absolute', left: 845 - 55, top: 530 - 55, width: 110, height: 110, borderRadius: 20,
        background: f >= 50 ? '#DCFCE7' : '#FEF2F2', border: `4px solid ${f >= 50 ? C.good : C.bad}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
        <Icon name="Disc" size={42} color={f >= 50 ? C.good : C.bad} stroke={2.8} />
        <span style={{fontSize: 16, fontWeight: 900, color: C.ink, whiteSpace: 'nowrap'}}>{f >= 50 ? 'VAN MỞ' : 'VAN ĐÓNG'}</span>
      </div>
      <div style={{position: 'absolute', left: 235 - 55, top: 530 - 55, width: 110, height: 110, borderRadius: 20,
        background: f >= 135 ? '#DCFCE7' : '#FEF2F2', border: `4px solid ${f >= 135 ? C.good : C.bad}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10}}>
        <Icon name="Disc" size={42} color={f >= 135 ? C.good : C.bad} stroke={2.8} />
        <span style={{fontSize: 16, fontWeight: 900, color: C.ink, whiteSpace: 'nowrap'}}>{f >= 135 ? 'VAN MỞ' : 'VAN ĐÓNG'}</span>
      </div>

      <div style={{position: 'absolute', left: 540 - 130, top: 530 - 130, width: 260, height: 260, zIndex: 12}}>
        <Img src={staticFile(phunSau ? 'robot/lab/voi-phun-sau.png' : 'robot/lab/voi-phun-truoc.png')} style={{width: '100%', height: '100%'}} />
      </div>

      <Burst at={55} x={845} y={530} color={C.good} r={140} />
      <Burst at={140} x={235} y={530} color={C.good} r={140} />

      <CodeBox x={110} y={840} w={860} size={23} title="phun_nhe_doi_van.py"
        lines={[
          'spray(); wait()        # Phun nhẹ ra trước (xa 2 ô, đứng yên)',
          'spray_back(); wait()   # Phun nhẹ ra sau lưng (xa 2 ô)',
        ]}
        hl={f < 105 ? 0 : 1} hlAt={10} />

      <CongThucLab lenh='spray() / spray("low") + wait()' coChe="Phun nhẹ 2 ô · Xe đứng yên" ketQua="Đảo trạng thái Van!" mau="#0284C7" at={20} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [150, 'thumbs-up']]}
        says={[{at: 10, out: 185, text: 'Vòi phun có 2 đầu: spray() bắn ra mũi, spray_back() bắn ra đuôi! Phun nhẹ bay xa 2 ô qua cả rào thấp để bật/tắt van mà xe vẫn đứng yên!'}]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [135, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

/** Cảnh 2 (6.5s = 195f): Phun mạnh spray("high") -> Phản lực giật lùi xe 1 ô húc nhích thùng sắt nặng! */
const CanhPhunManhDayThung: React.FC = () => {
  const f = useCurrentFrame();
  // Xe đứng ở (540, 530) hướng sang phải, lưng quay về thùng sắt nặng ở (385, 530).
  // Khi gọi spray("high") + wait() ở f=45..110: tia nước bắn mạnh sang phải -> phản lực đẩy xe giật lùi sang trái (385, 530) và húc thùng nặng lùi sang (230, 530)!
  const uGiat = mo(f, 45, 110);
  const xRobot = 540 - uGiat * O;
  const xThung = 385 - uGiat * O;
  const dangBan = f >= 42 && f <= 115;

  return (
    <Shake hits={[55]} amp={12}>
      <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · CƠ CHẾ PHẢN LỰC LỰC PHUN CAO"
        tieuDe='spray("high"): Phun mạnh giật lùi húc thùng!' accent={['spray("high"):', 'giật lùi húc thùng!']}
        phuDe="Tia nước không đẩy nổi thùng nặng — Nhưng phản lực xe giật lùi sẽ húc thùng nặng nhích 1 ô!">
        <San x={140} y={245} w={800} h={570} o={O} />

        {/* Tia nước áp lực cao bắn sang phải */}
        {dangBan ? (
          <div style={{position: 'absolute', left: xRobot + 60, top: 530 - 18, width: 360, height: 36, borderRadius: 999,
            background: 'linear-gradient(90deg, #E0F2FE, #38BDF8, #0284C7)', boxShadow: '0 0 28px #38BDF8', zIndex: 9}} />
        ) : null}

        {/* Thùng sắt nặng ở phía sau lưng xe */}
        <div style={{position: 'absolute', left: xThung - 62, top: 530 - 62, width: 124, height: 124, zIndex: 11}}>
          <Img src={staticFile('robot/thung-nang.png')} style={{width: '100%', height: '100%'}} />
        </div>

        {/* Robot phun mạnh bị phản lực giật lùi */}
        <div style={{position: 'absolute', left: xRobot - 130, top: 530 - 130, width: 260, height: 260, zIndex: 12}}>
          <Img src={staticFile('robot/lab/voi-phun-truoc.png')} style={{width: '100%', height: '100%'}} />
        </div>

        <div style={{position: 'absolute', left: 540, top: 272, transform: 'translateX(-50%)', padding: '10px 22px',
          borderRadius: 999, background: '#0F172A', color: '#fff', fontSize: 21, fontWeight: 800,
          border: '3px solid #38BDF8', whiteSpace: 'nowrap', zIndex: 15}}>
          Phun mạnh ra trước → Xe giật lùi 1 ô → Húc thùng nặng nhích 1 ô!
        </div>

        <Burst at={112} x={230} y={530} color={C.good} r={175} />

        <CodeBox x={110} y={840} w={860} size={25} title="phan_luc_voi_phun.py"
          lines={[
            'spray("high")      # Phun áp lực cao ra phía trước',
            'wait()             # Phản lực đẩy xe giật lùi 1 ô',
            '# Xe giật vào thùng sắt nặng -> Thùng nhích 1 ô!',
          ]}
          hl={f < 45 ? 0 : 1} hlAt={10} />

        <CongThucLab lenh='spray("high") + wait()' coChe="Phản lực giật ngược 1 ô" ketQua="Húc nhích thùng nặng!" mau={C.indigo} at={22} y={1115} />

        <Mascot who="luna" x={855} h={490} at={6} side="left" lat
          faces={[[6, 'explaining'], [95, 'happy'], [150, 'thumbs-up']]}
          says={[
            {at: 10, out: 98, text: 'Tia nước bắn vào thùng sắt nặng không làm thùng nhích đâu nha! Nhưng khi gọi spray("high"), phản lực nước sẽ đẩy xe giật ngược 1 ô!'},
            {at: 104, out: 188, text: 'Lợi dụng cú giật lùi đó để thân xe húc vào thùng sắt nặng, thùng sẽ dịch chuyển đúng 1 ô luôn!'},
          ]}
          bubbleW={590} bubbleTop={1295} />
        <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'thinking-sach'], [60, 'surprised-sach'], [120, 'celebrate-jump']]} />
      </KhungLabLuna>
    </Shake>
  );
};

const BANG_VOI_PHUN = [
  {ma: 'HOI-01', code: 'spray() + wait()', moTa: 'Phun nhẹ ra trước tối đa 2 ô · Xe đứng yên', kq: 'Đổi van trước', icon: 'Droplets', mau: '#0284C7'},
  {ma: 'HOI-02', code: 'spray_back() + wait()', moTa: 'Phun nhẹ ra sau lưng tối đa 2 ô · Xe đứng yên', kq: 'Đổi van sau', icon: 'RotateCcw', mau: C.solaDeep},
  {ma: 'HOI-03', code: 'spray("high") + wait()', moTa: 'Phun mạnh ra trước · Phản lực đẩy xe LÙI 1 ô', kq: 'Giật lùi 1 ô', icon: 'FastForward', mau: C.indigo},
  {ma: 'HOI-04', code: 'spray_back("high") + wait()', moTa: 'Phun mạnh ra sau · Phản lực đẩy xe TIẾN 1 ô', kq: 'Giật tiến 1 ô', icon: 'Zap', mau: C.lunaDeep},
  {ma: 'HOI-05', code: 'Giật trúng thùng sắt nặng', moTa: 'Tia nước không đẩy được thùng, xe giật vào mới đẩy được', kq: 'Thùng nhích 1 ô', icon: 'Package', mau: C.good},
];

const CanhSoTayVoiPhun: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY VÒI PHUN NƯỚC"
    tieuDe="Sổ tay 5 Quy tắc Vòi Phun Nước (Mùa 2)" accent={['Vòi Phun Nước']}
    phuDe="Điều khiển van từ xa và dùng phản lực nước để dịch chuyển thùng sắt nặng">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_VOI_PHUN.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Nhớ nha: một nhịp chỉ phun 1 lần và bánh nghỉ; muốn đẩy thùng nặng thì dùng phản lực giật của lệnh "high"!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const CANH_LAB_VOI_PHUN: Phim['canh'] = [
  {id: 'voi-phun-0-so-sanh', dur: 240, el: <CanhVoiPhunSoSanh />, sfx: [W_IN, [42, 'wrong.wav', 0.5], [182, 'ding.wav', 0.6]]},
  {id: 'voi-phun-nhe', dur: 195, el: <CanhVoiPhunNhe />, sfx: [W_IN, [30, 'swish.wav', 0.45], [55, 'ding.wav', 0.6], [115, 'swish.wav', 0.45], [140, 'ding.wav', 0.6]]},
  {id: 'phun-manh-day-thung', dur: 195, el: <CanhPhunManhDayThung />, sfx: [W_IN, [45, 'swish.wav', 0.6], [112, 'ding.wav', 0.7]]},
  {id: 'so-tay-voi-phun', dur: 180, el: <CanhSoTayVoiPhun />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
];

/* ============================================================================
   3. CANH_LAB_HONG_NGOAI — Bộ phận: Cảm Biến Hồng Ngoại (hong-ngoai)
   Phim thật của gói 3 mùa 2 là G3Thu/G3Lam trong doc/m2.tsx; mảng này chỉ là
   các cảnh dạy cơ chế distance()/warm() chen vào giữa.
   ========================================================================== */

/** Cảnh 0 So sánh (LUAT-SUA-PHIM-CLB.md mục 9): thân cũ (không cảm biến) không biết ống trước mặt
    nóng hay nguội, thân mới (cảm biến hồng ngoại) biết ngay và phun đúng — CÙNG một ống. */
const CanhHongNgoaiSoSanh: React.FC = () => {
  const f = useCurrentFrame();
  const diemXe = tamO(4, 2);
  const diemVan = tamO(4, 1);
  const phun = f >= 150 && f < 190;

  return (
    <Shake hits={[42]} amp={8}>
      <NenHienTruong anh="nen-doc/mua-2.png" mua="m2">
        {f < 182 ? <QuangNongSS c={4} r={1} /> : null}
        <ODat ten={f >= 182 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={4} r={1} />

        {phun ? <TiaNuocSS tu={{x: diemXe.x, y: diemXe.y - 60}} den={{x: diemVan.x, y: diemVan.y}} /> : null}

        {f < 130 ? (
          <Xe anh="xich-voi" vet={false} moc={[[0, 4, 2, -90]]} />
        ) : (
          <Xe anh="xich-hn" vet={false} moc={[[130, 4, 2, -90]]} doi={[[150, 'xich-hn-do'], [165, 'xich-hn-phun'], [190, 'xich-hn-vui']]} />
        )}

        <NhanThan chu="Thân cũ: không cảm biến" at={10} den={95} />
        <NhanThan chu="Thân mới: cảm biến hồng ngoại" at={135} den={188} />
        {f >= 42 && f < 95 ? <ChuNay chu="NÓNG HAY NGUỘI? KHÔNG BIẾT!" at={42} den={92} x={diemXe.x} y={diemXe.y - 190} mau={C.warn} co={32} /> : null}
        {f >= 182 ? <ChuNay chu="warm() == True! ĐÚNG ỐNG NÓNG!" at={182} den={228} x={diemVan.x} y={diemXe.y - 190} mau={C.good} co={30} /> : null}

        <Burst at={182} x={diemVan.x} y={diemVan.y} color={C.yellow} />

        <Mascot who="sola" x={230} h={480} at={0}
          faces={[[0, 'thinking'], [42, 'confused'], [185, 'happy']]} bubbleTop={1250} bubbleW={540}
          says={[{at: 192, out: 226, text: 'Có cảm biến là biết chắc ống nào đang nóng!'}]} />
        <ChuChot tu={185} y={960}>Không cảm biến thì đoán mò, có cảm biến thì biết chắc ống nóng</ChuChot>
      </NenHienTruong>
    </Shake>
  );
};

/** Cảnh 1 (7s = 210f): Cơ chế distance() trả về SỐ ô trống tới vật cản & warm() kiểm tra nhiệt. */
const CanhHongNgoaiChiTiet: React.FC = () => {
  const f = useCurrentFrame();
  const buoc = f < 95 ? 0 : f < 150 ? mo(f, 95, 135) * 2 : 2 + mo(f, 150, 180);
  const xRobot = 240 + buoc * O;
  const xVat = 240 + 4 * O;
  const soOTrong = Math.max(0, Math.round(3 - buoc));

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: CẢM BIẾN HỒNG NGOẠI"
      tieuDe="distance(): Đếm ô trống · warm(): Đo nhiệt!" accent={['distance():', 'warm():']}
      phuDe="Mắt đỏ ở mũi xe bắn tia thẳng phía trước: đếm số ô trống tới vật cản đầu tiên (0 nhịp)">
      <San x={140} y={245} w={800} h={570} o={O} />

      {[1, 2, 3].map((k) => {
        const ox = 240 + k * O;
        if (ox <= xRobot + 40) return null;
        const thuTu = Math.round((ox - xRobot) / O);
        return (
          <div key={k} style={{position: 'absolute', left: ox - 58, top: 520 - 58, width: 116, height: 116, borderRadius: 18,
            background: 'rgba(244,63,94,0.14)', border: '3px dashed #F43F5E', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 7}}>
            <span style={{fontFamily: MONO, fontSize: 28, fontWeight: 900, color: '#E11D48', whiteSpace: 'nowrap'}}>Ô #{thuTu}</span>
            <span style={{fontSize: 17, fontWeight: 800, color: '#9F1239', whiteSpace: 'nowrap'}}>TRỐNG</span>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: xRobot + 75, top: 520 - 5, width: Math.max(0, xVat - 65 - (xRobot + 75)), height: 10,
        background: 'linear-gradient(90deg, #FB7185, #E11D48)', boxShadow: '0 0 18px #F43F5E', borderRadius: 999, zIndex: 9}} />

      <div style={{position: 'absolute', left: xVat - 62, top: 520 - 62, width: 124, height: 124, borderRadius: 22,
        background: '#FEF2F2', border: '4px solid #DC2626', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(220,38,38,0.45)', zIndex: 10}}>
        <Icon name="Flame" size={50} color="#DC2626" stroke={2.8} />
        <span style={{fontSize: 17, fontWeight: 900, color: '#B91C1C', whiteSpace: 'nowrap'}}>VAN NÓNG</span>
      </div>

      <div style={{position: 'absolute', left: xRobot - 115, top: 520 - 115, width: 230, height: 230, zIndex: 12}}>
        <Img src={staticFile('robot/lab/cb-hong-ngoai.png')} style={{width: '100%', height: '100%'}} />
      </div>

      <div style={{position: 'absolute', left: 165, top: 272, right: 165, padding: '12px 22px', borderRadius: 20,
        background: '#0F172A', border: '3px solid #F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 15}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Icon name="Ruler" size={26} color="#FB7185" stroke={2.8} />
          <span style={{fontFamily: MONO, fontSize: 23, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
            distance() == <span style={{color: '#FDE047', fontSize: 28}}>{soOTrong}</span> ô trống
          </span>
        </div>
        <div style={{width: 2, height: 32, background: '#334155'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Icon name="ThermometerSun" size={26} color="#F97316" stroke={2.8} />
          <span style={{fontFamily: MONO, fontSize: 23, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
            warm() == <span style={{color: '#4ADE80'}}>True</span>
          </span>
        </div>
      </div>

      <Burst at={180} x={xVat} y={520} color={C.good} r={160} />

      <CodeBox x={110} y={840} w={860} size={25} title="hong_ngoai_distance_warm.py"
        lines={[
          'while distance() > 2: # Dừng cách van 2 ô (tầm phun)',
          '    move()            # Tiến lên',
          'if warm():            # Van phía trước đang NÓNG?',
          '    spray(); wait()   # Phun nước khóa van ngay!',
        ]}
        hl={soOTrong > 0 ? 0 : 2} hlAt={10} />

      <CongThucLab lenh="distance() -> Số 0..N · warm()" coChe="Bắn 1 tia thẳng phía trước" ketQua="Đo xa & Đo nhiệt!" mau="#E11D48" at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [100, 'happy'], [170, 'thumbs-up']]}
        says={[
          {at: 10, out: 102, text: 'Cảm biến hồng ngoại bắn tia đỏ thẳng phía trước: distance() trả về SỐ ô trống tới vật cản đầu tiên, sát vật cản thì bằng 0!'},
          {at: 108, out: 204, text: 'Cùng tia đó, lệnh warm() báo True nếu vật cản đầu tiên đang NÓNG như van hơi mở hay robot khác, còn tường hay thùng nguội thì trả False!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'thinking-sach'], [100, 'surprised-sach'], [170, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

const BANG_HONG_NGOAI = [
  {ma: 'IR-01', code: 'distance()', moTa: 'Trả về SỐ ô trống tới vật cản đầu tiên phía trước', kq: 'Số 0, 1, 2...', icon: 'Ruler', mau: '#E11D48'},
  {ma: 'IR-02', code: 'distance() == 0', moTa: 'Khi xe đứng ngay sát trước mặt vật cản', kq: 'Bằng 0', icon: 'Minimize2', mau: '#D97706'},
  {ma: 'IR-03', code: 'warm() -> True', moTa: 'Vật cản đầu tiên phía trước NÓNG (van mở, robot khác)', kq: 'True (Nóng)', icon: 'Flame', mau: '#EA580C'},
  {ma: 'IR-04', code: 'warm() -> False', moTa: 'Vật cản là van đóng, cửa, thùng, tường nguội', kq: 'False (Nguội)', icon: 'Snowflake', mau: C.solaDeep},
  {ma: 'IR-05', code: 'Giới hạn 1 tia thẳng', moTa: 'Chỉ nhìn thẳng phía trước (không nhìn 2 bên), 0 tốn nhịp', kq: '0 tốn nhịp', icon: 'Eye', mau: C.indigo},
];

const CanhSoTayHongNgoai: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY CẢM BIẾN HỒNG NGOẠI"
    tieuDe="Sổ tay Cảm Biến Hồng Ngoại (Mùa 2)" accent={['Cảm Biến Hồng Ngoại']}
    phuDe="Mắt đỏ đo khoảng cách xa bằng con số và phát hiện nguồn nhiệt trong Nhà máy">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_HONG_NGOAI.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Nhờ distance() trả về con số, bạn có thể dừng xe cách van đúng 2 ô để phun nước mà không cần đi tới sát van!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const CANH_LAB_HONG_NGOAI: Phim['canh'] = [
  {id: 'hong-ngoai-0-so-sanh', dur: 240, el: <CanhHongNgoaiSoSanh />, sfx: [W_IN, [42, 'wrong.wav', 0.5], [182, 'ding.wav', 0.6]]},
  {id: 'hong-ngoai-chi-tiet', dur: 210, el: <CanhHongNgoaiChiTiet />, sfx: [W_IN, [95, 'swish.wav', 0.45], [150, 'swish.wav', 0.45], [180, 'ding.wav', 0.7]]},
  {id: 'so-tay-hong-ngoai', dur: 180, el: <CanhSoTayHongNgoai />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
];

