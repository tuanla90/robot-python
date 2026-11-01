// Cảnh Lab mùa 3 "Bãi tái chế" theo khuôn mùa 1 (bấm Chạy → thấy luật → Luna hỏi, Sola tự rút ra), đúng luật lõi game (hoc/gioi-thieu-part.js, man-nhen.js…):
// gói 1 thân nhện: bốn chân, go_up / go_down / go_left / go_right theo màn hình, không có mũi nên không quay, mỗi bước 2 nhịp, leo được bậc ·
// gói 2 nam châm treo dưới bụng: magnet_n() hút vật SẮT ở ô ngay dưới, mang theo khi đi, magnet_off() thả xuống; gỗ không hút ·
// gói 3 cảm biến từ ở hông nhìn sang phải: front_metal() True khi mẩu đầu tiên bên phải là sắt, cách tới 2 ô · gói 5 crouch() co chân,
// đang co mà stand() ngay trước một bước là nhảy qua một ô · gói 6 magnet_s(): vật nam châm đỏ (N) cần cực S mới hút, cùng cực thì nằm im ·
// gói 7 front_pole() trả "N" / "S" / "none" (mẩu nam châm đầu tiên trong 3 ô bên phải). Mỗi gói chỉ lộ lệnh của chính nó.
// Ảnh nhện vẽ đứng thẳng: góc luôn 0, không xoay.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Burst, C, Shake} from '../d10';
import {Phim, W_IN, pops} from '../may-phim';
import {ChuNay, Moc, ODat, Vat, Xe, tamO} from './kit-doc';
import {BangLenh, Chot, LenhMoi, LunaL, Nhan, SanLab, SolaL, Tia, tamLab} from './lab-doc';

const NEN = 'nen-doc/mua-3.png';
const San: React.FC<{san: React.ReactNode; children?: React.ReactNode}> = ({san, children}) => <SanLab nen={NEN} mua="m3" san={san}>{children}</SanLab>;
/** Bước nhện 2 nhịp = 24 khung. */
const B = 24;
/** Nhãn "Tua lại" giữa hai lần chạy. */
const TuaLai: React.FC<{at: number; chu: string}> = ({at, chu}) => <Nhan x={540} y={tamLab(2, 4).y + 40} chu={chu} at={at} den={at + 22} nen="#fff" mau={C.ink} />;
/** Tia dò của cảm biến từ, nhìn sang phải từ ô (c, r). */
const TiaTu: React.FC<{c: number; r: number; o: number}> = ({c, r, o}) => <Tia tu={tamO(c + 0.4, r)} den={tamO(c + o - 0.4, r)} mau={C.lunaDeep} day={10} />;

/* ================================================================== GÓI 1 · Thân nhện */
// Sai: thói quen xe bánh left_move() / move() → nhện không có lệnh đó, đứng im.
const NhenSai: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      <ODat ten="o-bac-thang" c={2} r={2} />
      <ODat ten="o-co" c={2} r={1} />
      <Xe anh={f >= 40 ? 'nhen-ngac' : 'nhen'} moc={[[0, 0, 3, 0]]} vet={false} />
    </>}>
      <BangLenh lines={['left_move()', 'wait()', 'move()']} sang={[[24, 0], [40, -1]]} bam={[18]} />
      <ChuNay chu="LỆNH LẠ!" at={36} den={110} x={tamLab(0, 3).x + 210} y={tamLab(0, 3).y - 40} mau={C.warn} />
      <SolaL mat={[[0, 'confident'], [40, 'confused'], [200, 'happy']]} says={[
        {at: 4, out: 18, text: 'Quay rồi tiến như xe bánh!'},
        {at: 46, out: 110, text: 'Ơ, R1 đứng im luôn?'},
        {at: 206, out: 276, text: 'Không có mũi! Bảo hướng nào là bước hướng đó!'},
      ]} />
      <LunaL at={110} mat={[[110, 'thinking']]} says={[{at: 118, out: 196, text: 'Con nhện này có mặt trước để mà quay không?'}]} />
    </San>
  );
};
// Đúng: go_right() hai lần, go_up() leo bậc, go_up() tới cờ; mỗi bước 2 nhịp.
const R_ND: Moc[] = [[0, 0, 3, 0], [30, 0, 3, 0], [30 + B, 1, 3, 0], [30 + 2 * B, 2, 3, 0], [30 + 3 * B, 2, 2, 0], [30 + 4 * B, 2, 1, 0]];
const NhenDung: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      <ODat ten="o-bac-thang" c={2} r={2} />
      <ODat ten="o-co" c={2} r={1} />
      <Xe anh={f >= 128 ? 'nhen-vui' : 'nhen'} moc={R_ND} />
      <Burst at={128} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['go_right()', 'go_right()', 'go_up()', 'go_up()']} typeAt={2} sang={[[30, 0], [54, 1], [78, 2], [102, 3], [128, -1]]} bam={[24]} />
      <Nhan x={tamLab(1, 3).x} y={tamLab(1, 3).y + 100} chu="nhịp 1 · nhịp 2" at={30} den={56} />
      <Nhan x={tamLab(2, 2).x + 200} y={tamLab(2, 2).y} chu="leo bậc" at={80} den={104} />
      <Chot tu={140} y={1090}>Nhện bước 4 hướng, không quay · mỗi bước 2 nhịp</Chot>
      <LunaL at={130} mat={[[130, 'great-job']]} says={[{at: 136, out: 210, text: 'Leo cả bậc thang, xe bánh chịu thua!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 2 · Nam châm bụng */
// Sai: đứng lên mẩu GỖ, bật nam châm, bước đi → mẩu gỗ nằm lại.
const NamChamGo: React.FC = () => {
  const f = useCurrentFrame();
  const R: Moc[] = [[0, 0, 2, 0], [24, 0, 2, 0], [24 + B, 1, 2, 0], [80, 1, 2, 0], [80 + B, 1, 3, 0]];
  return (
    <San san={<>
      <ODat ten="o-dich" c={1} r={3} />
      <Vat ten="vat-be-go" moc={[[0, 1, 2]]} />
      <Xe anh={f >= 106 ? 'nhen-nc-ngac' : f >= 58 ? 'nhen-nc-n' : 'nhen-nc'} moc={R} vet={false} />
    </>}>
      <BangLenh lines={['go_right()', 'magnet_n()', 'wait()', 'go_down()']} sang={[[24, 0], [48, 1], [58, 2], [80, 3], [106, -1]]} bam={[18]} />
      <ChuNay chu="KHÔNG DÍNH!" at={104} den={170} x={tamLab(1, 2).x + 230} y={tamLab(1, 2).y} mau={C.warn} />
      <SolaL mat={[[0, 'confident'], [106, 'confused'], [220, 'happy']]} says={[
        {at: 110, out: 160, text: 'Bật nam châm rồi mà sao không dính?'},
        {at: 226, out: 290, text: 'Gỗ! Nam châm chỉ hút sắt thôi.'},
      ]} />
      <LunaL at={156} mat={[[156, 'thinking']]} says={[{at: 162, out: 222, text: 'Mẩu đó làm bằng gì nhỉ?'}]} />
    </San>
  );
};
// Đúng: mẩu sắt → hút, mang xuống hai ô, magnet_off() thả vào thùng.
const R_NS: Moc[] = [[0, 0, 2, 0], [24, 0, 2, 0], [24 + B, 1, 2, 0], [70, 1, 2, 0], [70 + B, 1, 3, 0], [70 + 2 * B, 1, 4, 0]];
const NamChamSat: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <San san={<>
      <ODat ten="o-dich" c={1} r={4} />
      <Vat ten="vat-khoi-sat" moc={[[0, 1, 2], [70, 1, 2], [70 + B, 1, 3], [70 + 2 * B, 1, 4]]} />
      <Xe anh={f >= 146 ? 'nhen-nc-vui' : f >= 58 && f < 130 ? 'nhen-nc-n' : 'nhen-nc'} moc={R_NS} vet={false} />
      <Burst at={140} x={tamO(1, 4).x} y={tamO(1, 4).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['go_right()', 'magnet_n()', 'wait()', 'go_down()', 'go_down()', 'magnet_off()', 'wait()']} typeAt={2}
        sang={[[24, 0], [48, 1], [58, 2], [70, 3], [94, 4], [118, 5], [128, 6], [146, -1]]} bam={[18]} />
      <Nhan x={tamLab(1, 3).x + 210} y={tamLab(1, 3).y} chu="dính dưới bụng" at={74} den={118} />
      <Chot tu={160} y={1090}>Nam châm bụng hút sắt ngay dưới · magnet_off() thả xuống</Chot>
      <SolaL mat={[[0, 'confident'], [140, 'cheer']]} says={[{at: 76, out: 116, text: 'Dính rồi! Đi đâu mang theo đó!'}]} />
      <LunaL at={150} mat={[[150, 'great-job']]} says={[{at: 166, out: 236, text: 'Hút, mang, thả: gọn gàng ghê!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 3 · Cảm biến từ */
// Sai: không dò, đi tới mẩu gỗ rồi mới biết → phí nhịp.
const DoSatSai: React.FC = () => {
  const f = useCurrentFrame();
  const R: Moc[] = [[0, 0, 2, 0], [24, 0, 2, 0], [24 + B, 1, 2, 0], [24 + 2 * B, 2, 2, 0]];
  return (
    <San san={<>
      <Vat ten="vat-be-go" moc={[[0, 2, 2]]} />
      <Xe anh={f >= 96 ? 'nhen-tu-ngac' : f >= 82 ? 'nhen-tu-n' : 'nhen-tu'} moc={R} vet={false} />
    </>}>
      <BangLenh lines={['go_right()', 'go_right()', 'magnet_n()', 'wait()']} sang={[[24, 0], [48, 1], [72, 2], [82, 3], [96, -1]]} bam={[18]} />
      <ChuNay chu="GỖ! PHÍ 6 NHỊP" at={96} den={170} x={tamLab(2, 2).x + 150} y={tamLab(2, 2).y - 110} mau={C.warn} co={40} />
      <SolaL mat={[[0, 'confident'], [96, 'facepalm'], [222, 'happy']]} says={[
        {at: 100, out: 160, text: 'Đi cả đoạn tới nơi mới biết là gỗ!'},
        {at: 228, out: 292, text: 'Hỏi cảm biến trước: có sắt mới đi!'},
      ]} />
      <LunaL at={156} mat={[[156, 'thinking']]} says={[{at: 162, out: 224, text: 'Đứng chỗ cũ có biết trước mẩu kia là gì không?'}]} />
    </San>
  );
};
// Đúng: if front_metal(): đi lấy. Lần 1 mẩu gỗ → False, đứng yên. Tua lại với mẩu sắt → True, đi hút.
const DoSatDung: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 110;
  const R: Moc[] = [[0, 0, 2, 0], [150, 0, 2, 0], [150 + B, 1, 2, 0], [150 + 2 * B, 2, 2, 0]];
  return (
    <San san={<>
      <Vat ten={lan2 ? 'vat-khoi-sat' : 'vat-be-go'} moc={[[0, 2, 2]]} />
      {(f >= 30 && f < 80) || (f >= 130 && f < 150) ? <TiaTu c={0} r={2} o={2} /> : null}
      <Xe anh={f >= 222 ? 'nhen-tu-vui' : f >= 208 ? 'nhen-tu-n' : (f >= 30 && f < 80) || (f >= 130 && f < 150) ? 'nhen-tu-do' : 'nhen-tu'} moc={R} vet={false} />
      <Burst at={216} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['if front_metal():', '    go_right()', '    go_right()', '    magnet_n()', '    wait()']} typeAt={2}
        sang={lan2 ? [[130, 0], [150, 1], [174, 2], [198, 3], [208, 4], [222, -1]] : [[30, 0], [80, -1]]} bam={[24, 124]} />
      <Nhan x={tamLab(1, 2).x} y={tamLab(1, 2).y - 110} chu={lan2 ? 'front_metal() = True' : 'front_metal() = False'} at={lan2 ? 134 : 34} den={lan2 ? 200 : 100} />
      {lan2 ? <TuaLai at={110} chu="Tua lại · đổi mẩu sắt" /> : null}
      <Chot tu={232} y={1090}>front_metal(): sắt cách tới 2 ô bên phải? · hỏi không tốn nhịp</Chot>
      <LunaL mat={[[0, 'thinking'], [226, 'great-job']]} says={[{at: 84, out: 118, text: 'Gỗ thì R1 làm gì?'}]} />
      <SolaL at={60} mat={[[60, 'happy'], [216, 'cheer']]} says={[{at: 86, out: 112, text: 'Đứng yên, khỏi phí nhịp!'}, {at: 226, out: 290, text: 'Sắt thật thì mới đi hút!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 5 · Nhảy */
// Lần 1: go_right() vào hố → rơi. Tua lại: crouch(), wait(), stand(), go_right() → bật qua một ô.
const Nhay: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 150;
  const R1: Moc[] = [[0, 1, 2, 0], [24, 1, 2, 0], [24 + B, 2, 2, 0]];
  // nhảy: vồng lên nửa ô giữa đường rồi đáp ở ô sau hố (mỗi đoạn dưới 12 khung để theoMoc không bẻ thành đường vuông góc)
  const R2: Moc[] = [[0, 1, 2, 0], [196, 1, 2, 0], [207, 2, 1.5, 0], [218, 3, 2, 0]];
  return (
    <Shake hits={[50]} amp={10}>
      <San san={<>
        <ODat ten="o-ho" c={2} r={2} />
        <ODat ten="o-co" c={3} r={2} />
        {lan2
          ? <Xe anh={f >= 222 ? 'nhen-vui' : f >= 172 && f < 196 ? 'nhen-co' : 'nhen'} moc={R2} vet={false} />
          : <Xe anh={f >= 50 ? 'nhen-ngac' : 'nhen'} moc={R1} vet={false} mo={(g) => (g < 48 ? 1 : Math.max(0, 1 - (g - 48) / 14))} />}
        <Burst at={222} x={tamO(3, 2).x} y={tamO(3, 2).y} color={C.yellow} />
      </>}>
        <BangLenh lines={lan2 ? ['crouch()', 'wait()', 'stand()', 'go_right()'] : ['go_right()']}
          sang={lan2 ? [[166, 0], [172, 1], [190, 2], [196, 3], [222, -1]] : [[24, 0], [60, -1]]} bam={[18, 160]} />
        <ChuNay chu="RƠI!" at={50} den={110} x={tamLab(2, 2).x + 160} y={tamLab(2, 2).y} />
        <ChuNay chu="BẬT!" at={198} den={236} x={tamLab(2, 2).x} y={tamLab(2, 2).y - 130} mau={C.good} co={44} />
        {lan2 ? <TuaLai at={150} chu="Tua lại" /> : null}
        <Chot tu={240} y={1090}>Đang co chân mà stand() rồi bước → nhảy qua 1 ô</Chot>
        <SolaL mat={[[0, 'confident'], [52, 'shocked'], [130, 'thinking'], [222, 'cheer']]} says={[{at: 56, out: 96, text: 'Á, rơi xuống hố rồi!'}, {at: 132, out: 150, text: 'Co trước, duỗi sau!'}]} />
        <LunaL at={90} mat={[[90, 'thinking'], [226, 'great-job']]} says={[{at: 98, out: 130, text: 'Chân nhện co lại rồi duỗi mạnh thì sao?'}, {at: 244, out: 300, text: 'Nhẹ như cào cào!'}]} />
      </San>
    </Shake>
  );
};

/* ================================================================== GÓI 6 · Đảo cực */
// Lần 1: đứng trên mẩu nam châm đỏ (N), bật magnet_n() → cùng cực, mẩu nằm im. Tua lại: magnet_s() → khác cực, dính, mang đi.
const DaoCuc: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 140;
  const R1: Moc[] = [[0, 1, 2, 0], [44, 1, 2, 0], [44 + B, 1, 3, 0]];
  const R2: Moc[] = [[0, 1, 2, 0], [184, 1, 2, 0], [184 + B, 1, 3, 0]];
  return (
    <San san={<>
      <ODat ten="o-dich" c={1} r={3} />
      <Vat ten="vat-nam-cham-n" moc={lan2 ? [[0, 1, 2], [184, 1, 2], [184 + B, 1, 3]] : [[0, 1, 2]]} />
      <Xe anh={lan2 ? (f >= 214 ? 'nhen-tu-vui' : f >= 172 ? 'nhen-tu-s' : 'nhen-tu') : (f >= 70 ? 'nhen-tu-ngac' : f >= 34 ? 'nhen-tu-n' : 'nhen-tu')} moc={lan2 ? R2 : R1} vet={false} />
      <Burst at={210} x={tamO(1, 3).x} y={tamO(1, 3).y} color={C.yellow} />
    </>}>
      <BangLenh lines={[lan2 ? 'magnet_s()' : 'magnet_n()', 'wait()', 'go_down()']} sang={lan2 ? [[164, 0], [172, 1], [184, 2], [214, -1]] : [[24, 0], [34, 1], [44, 2], [70, -1]]} bam={[18, 158]} />
      <ChuNay chu="NẰM IM!" at={68} den={130} x={tamLab(1, 2).x + 220} y={tamLab(1, 2).y} mau={C.warn} />
      <Nhan x={tamLab(1, 2).x + 230} y={tamLab(1, 2).y - 100} chu="đỏ = N" at={78} den={140} />
      {lan2 ? <TuaLai at={140} chu="Tua lại" /> : null}
      <Chot tu={226} y={1090}>Khác cực thì hút · mẩu đỏ (N) cần magnet_s()</Chot>
      <SolaL mat={[[0, 'confident'], [70, 'confused'], [126, 'happy'], [214, 'cheer']]} says={[{at: 74, out: 100, text: 'Sao mẩu đỏ không chịu dính?'}, {at: 128, out: 150, text: 'Đổi sang cực S!'}]} />
      <LunaL at={96} mat={[[96, 'thinking'], [220, 'great-job']]} says={[{at: 100, out: 128, text: 'Mẩu đỏ cực gì? Tay đang bật cực gì?'}, {at: 236, out: 296, text: 'Khác cực là dính liền!'}]} />
    </San>
  );
};

/* ================================================================== GÓI 7 · Đọc cực */
// p = front_pole() đọc cực TRƯỚC khi bước lên (đứng lên rồi cảm biến không thấy nữa), rồi chọn cực ngược lại.
const DocCuc: React.FC = () => {
  const f = useCurrentFrame();
  const lan2 = f >= 170;
  const t0 = lan2 ? 170 : 0;
  const R: Moc[] = [[0, 0, 2, 0], [t0 + 40, 0, 2, 0], [t0 + 40 + B, 1, 2, 0], [t0 + 40 + 2 * B, 2, 2, 0]];
  const cuc = lan2 ? 'S' : 'N';
  const doc = f >= t0 + 30;
  const dinh = f >= t0 + 106;
  return (
    <San san={<>
      <Vat ten={cuc === 'N' ? 'vat-nam-cham-n' : 'vat-nam-cham-s'} moc={[[0, 2, 2]]} mo={() => (doc ? 1 : 0.35)} />
      {f >= t0 + 26 && f < t0 + 40 ? <TiaTu c={0} r={2} o={2} /> : null}
      <Xe anh={dinh ? 'nhen-tu-vui' : f >= t0 + 96 ? (cuc === 'N' ? 'nhen-tu-s' : 'nhen-tu-n') : f >= t0 + 26 && f < t0 + 40 ? 'nhen-tu-do' : 'nhen-tu'} moc={R} vet={false} />
      <Burst at={t0 + 106} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.yellow} />
    </>}>
      <BangLenh lines={['p = front_pole()', 'go_right()', 'go_right()', 'if p == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()']} typeAt={lan2 ? undefined : 2}
        sang={[[t0 + 26, 0], [t0 + 40, 1], [t0 + 64, 2], [t0 + 88, 3], [t0 + 92, cuc === 'N' ? 4 : 6], [t0 + 100, 7], [t0 + 112, -1]]} bam={[20, 190]} />
      <Nhan x={tamLab(1, 2).x} y={tamLab(1, 2).y - 110} chu={`p = "${cuc}"`} at={t0 + 30} den={t0 + 150} />
      {lan2 ? <TuaLai at={170} chu="Tua lại · mẩu xanh" /> : null}
      <Chot tu={292} y={1090}>front_pole() đọc cực trước khi bước lên · "N" / "S" / "none"</Chot>
      <LunaL mat={[[0, 'thinking'], [292, 'great-job']]} says={[{at: 4, out: 22, text: 'Mẩu mờ kia cực gì đây?'}, {at: 130, out: 168, text: 'Sao phải đọc trước khi bước lên?'}]} />
      <SolaL at={40} mat={[[40, 'confident'], [276, 'cheer']]} says={[{at: 116, out: 128, text: 'N thì bật S!'}, {at: 172, out: 186, text: 'Đứng lên rồi là cảm biến hết thấy!'}, {at: 298, out: 340, text: 'Đỏ hay xanh đều hút trúng!'}]} />
    </San>
  );
};

/* ================================================================== thẻ lệnh mới */
const LenhNhen: React.FC = () => (
  <LenhMoi tieuDe="Thân nhện bốn chân" accent={['nhện']} loi="Nhện không có mũi: muốn đi đâu cứ gọi đúng hướng đó!" nhom={[
    {nhan: 'BƯỚC THEO MÀN HÌNH · 2 NHỊP', icon: 'Move', mau: '#15803D', lenh: [
      {ma: 'go_up() · go_down()', viec: 'bước lên / xuống 1 ô'},
      {ma: 'go_left() · go_right()', viec: 'bước trái / phải 1 ô'},
    ]},
  ]} />
);
const LenhNamCham: React.FC = () => (
  <LenhMoi tieuDe="Nam châm dưới bụng" accent={['nam châm']} loi="Ra lệnh nam châm xong nhớ wait() cho nó làm nhé!" nhom={[
    {nhan: 'NAM CHÂM · 2 LỆNH', icon: 'Magnet', mau: '#B91C1C', lenh: [
      {ma: 'magnet_n()', viec: 'bật, hút sắt ô ngay dưới'},
      {ma: 'magnet_off()', viec: 'ngắt, thả vật xuống'},
    ]},
  ]} />
);
const LenhTu: React.FC = () => (
  <LenhMoi tieuDe="Cảm biến từ" accent={['cảm biến từ']} loi="Hỏi trước rồi mới đi: không phí nhịp nào!" nhom={[
    {nhan: 'CẢM BIẾN TỪ · 1 LỆNH', icon: 'Radar', mau: C.lunaDeep, lenh: [
      {ma: 'front_metal()', viec: 'sắt cách tới 2 ô bên phải?'},
    ]},
  ]} />
);

export const LAB_NHEN: Phim['canh'] = [
  {id: 'lab-nhen-sai', dur: 290, el: <NhenSai />, sfx: [[18, 'click.wav', 0.8], [36, 'wrong.wav', 0.5], [206, 'ding.wav', 0.4]]},
  {id: 'lab-nhen-dung', dur: 225, el: <NhenDung />, sfx: [[24, 'click.wav', 0.8], [128, 'ding.wav', 0.5]]},
  {id: 'lenh-nhen', dur: 190, el: <LenhNhen />, sfx: [W_IN, ...pops([24, 34, 44], 0.3)]},
];
export const LAB_NAM_CHAM: Phim['canh'] = [
  {id: 'lab-nam-cham-go', dur: 300, el: <NamChamGo />, sfx: [[18, 'click.wav', 0.8], [58, 'pop.wav', 0.3], [104, 'wrong.wav', 0.5], [226, 'ding.wav', 0.4]]},
  {id: 'lab-nam-cham-sat', dur: 250, el: <NamChamSat />, sfx: [[18, 'click.wav', 0.8], [58, 'click.wav', 0.5], [140, 'ding.wav', 0.5]]},
  {id: 'lenh-nam-cham', dur: 190, el: <LenhNamCham />, sfx: [W_IN, ...pops([24, 34, 44], 0.3)]},
];
export const LAB_TU: Phim['canh'] = [
  {id: 'lab-do-sat-sai', dur: 300, el: <DoSatSai />, sfx: [[18, 'click.wav', 0.8], [96, 'wrong.wav', 0.5], [228, 'ding.wav', 0.4]]},
  {id: 'lab-do-sat-dung', dur: 300, el: <DoSatDung />, sfx: [[24, 'click.wav', 0.8], [34, 'pop.wav', 0.3], [124, 'click.wav', 0.8], [134, 'pop.wav', 0.3], [216, 'ding.wav', 0.5]]},
  {id: 'lenh-tu', dur: 170, el: <LenhTu />, sfx: [W_IN, ...pops([24, 34], 0.3)]},
];
export const LAB_NHAY: Phim['canh'] = [
  {id: 'lab-nhay', dur: 305, el: <Nhay />, sfx: [[18, 'click.wav', 0.8], [50, 'wrong.wav', 0.5], [160, 'click.wav', 0.8], [198, 'swish.wav', 0.5], [222, 'ding.wav', 0.5]]},
];
export const LAB_DAO_CUC: Phim['canh'] = [
  {id: 'lab-dao-cuc', dur: 300, el: <DaoCuc />, sfx: [[18, 'click.wav', 0.8], [68, 'wrong.wav', 0.5], [158, 'click.wav', 0.8], [172, 'pop.wav', 0.4], [210, 'ding.wav', 0.5]]},
];
export const LAB_DOC_CUC: Phim['canh'] = [
  {id: 'lab-doc-cuc', dur: 345, el: <DocCuc />, sfx: [[20, 'click.wav', 0.8], [30, 'pop.wav', 0.3], [106, 'ding.wav', 0.5], [190, 'click.wav', 0.8], [200, 'pop.wav', 0.3], [276, 'ding.wav', 0.5]]},
];
