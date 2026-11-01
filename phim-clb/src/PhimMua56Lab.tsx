// Bộ 3 Phim Phòng Lab riêng cho từng Bộ phận Mùa 5 (Mỏ đá) & Mùa 6 (Núi tuyết) khổ dọc 1080×1920 (doc: true):
// 1. PHIM_THAN_NHEN (id: 'PhimThanNhen') — Bộ phận: Thân Nhện 4 Chân (nhen)
// 2. PHIM_MAY_NEM   (id: 'PhimMayNem')   — Bộ phận: Máy Ném (nem)
// 3. PHIM_DRONE     (id: 'PhimDrone')    — Bộ phận: Thân Drone Bay (drone) & Camera Bụng (camera-bay)
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Burst, C, CodeBox, Icon, Mascot, MONO, PopIn} from './d10';
import {San, mo} from './kit';
import {Phim, W_IN, pops} from './may-phim';
import {ChuNay, NenHienTruong, NhanGoi, Nguoi, ODat, TrongXe, Vat, Xe, tamO} from './doc/kit-doc';
import {CongThucLab, HangSoTayLab, KhungLabLuna} from './PhimTayKep';

const O = 155;

/* ============================================================================
   1. PHIM_THAN_NHEN — Bộ phận: Thân Nhện 4 Chân (nhen)
   Bố cục: Vấn đề (Mỏ đá có gầm đá thấp và hố sâu, xe bánh không qua được) -> Luna chế Thân Nhện -> Giải thích cơ chế cho Sola
   ========================================================================== */

export const CanhNhenVanDe: React.FC = () => (
  <NenHienTruong anh="nen-doc/mua-5.png" mua="m6">
    {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-rao" c={c} r={2} />)}
    <Xe anh="xich" moc={[[0, 2, 4.5, -90], [45, 2, 3.2, -90]]} />
    <ChuNay chu="HỐ SÂU & GẦM THẤP · XE BÁNH KẸT!" at={50} den={155} x={540} y={tamO(2, 2).y - 45} mau={C.bad} co={34} />
    <NhanGoi so={1} ten="Thân nhện 4 chân" />
    <Mascot who="sola" x={230} h={520} at={0}
      faces={[[0, 'worried'], [50, 'shocked']]}
      says={[{at: 8, out: 92, text: 'Mỏ đá toàn hố sụt với gầm đá thấp lè tè, bánh xe hay bánh xích đều không nhảy qua hố được!'}]}
      bubbleW={550} bubbleTop={1230} />
    <Nguoi anh="dung-nghi" ten="ANH DŨNG" mau="#475569" x={820} h={600} at={90} side="left" bubbleW={560} bubbleTop={1230}
      says={[{at: 96, out: 185, text: 'Địa hình mỏ đá phải có chân co thấp để chui gầm và bật nhảy vọt qua miệng hố mới vào được!'}]} />
  </NenHienTruong>
);

export const CanhNhenLunaChePart: React.FC = () => (
  <TrongXe mua="m6" anh="nhen" cach={120} tenPart="Thân nhện 4 chân"
    sola={[{at: 8, out: 72, text: 'Làm sao để R1 vừa chui qua gầm đá thấp vừa nhảy qua miệng hố sâu đây Luna?'}]}
    luna={[{at: 78, out: 185, text: 'Tớ chế Thân nhện 4 chân cơ khí rồi đây! Co chân chui gầm thấp rồi bật duỗi nhảy vọt qua hố cực đỉnh!'}]}
    solaMat={[[0, 'thinking'], [78, 'excited']]}
    lunaMat={[[0, 'confident'], [78, 'happy']]} />
);

/** Cảnh 1 (7s = 210f): Nhện đi 4 hướng (tự bước 2 nhịp), crouch() chui gầm thấp & stand() + go_...() nhảy qua hố. */
const CanhNhenChiTiet: React.FC = () => {
  const f = useCurrentFrame();
  const dangCo = f >= 25 && f < 95;
  const uNhay = mo(f, 95, 155);
  const xNhen = 230 + (f < 95 ? mo(f, 35, 80) * O : O + uNhay * 2 * O);
  const doCaoNhay = f >= 95 && f <= 155 ? Math.sin(uNhay * Math.PI) * 95 : 0;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: THÂN NHỆN 4 CHÂN"
      tieuDe="Thân Nhện: Đi 4 hướng · Co chân & Nhảy qua hố!" accent={['Đi 4 hướng', 'Nhảy qua hố!']}
      phuDe="Mỗi lệnh go_up/down/left/right() tự bước 2 nhịp (không cần wait) — crouch() + stand() để nhảy!">
      <San x={140} y={245} w={800} h={570} o={O} />

      <div style={{position: 'absolute', left: 385 - 70, top: 530 - 70, width: 140, height: 140, borderRadius: 20,
        background: 'rgba(124,58,237,0.16)', border: '4px dashed #7C3AED', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10, zIndex: 13}}>
        <span style={{fontSize: 18, fontWeight: 900, color: '#6D28D9', background: '#EDE9FE', padding: '2px 10px', borderRadius: 8, whiteSpace: 'nowrap'}}>
          GẦM ĐÁ THẤP
        </span>
      </div>

      <div style={{position: 'absolute', left: 540 - 66, top: 530 - 66, width: 132, height: 132, borderRadius: '50%',
        background: 'radial-gradient(circle, #020617 55%, #334155 100%)', border: '4px solid #475569',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6}}>
        <span style={{fontSize: 20, fontWeight: 900, color: '#94A3B8', whiteSpace: 'nowrap'}}>HỐ SÂU</span>
      </div>

      <div style={{position: 'absolute', left: 695 - 64, top: 530 - 64, width: 128, height: 128, borderRadius: 22,
        border: `4px dashed ${C.good}`, background: 'rgba(14,159,110,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6}}>
        <Icon name="CheckCircle2" size={48} color={C.good} stroke={2.8} />
      </div>

      <div style={{position: 'absolute', left: xNhen - 125, top: 530 - 125 - doCaoNhay, width: 250, height: 250, zIndex: 14,
        transform: `scale(${1 + doCaoNhay / 350})`, filter: doCaoNhay > 5 ? 'drop-shadow(0 28px 18px rgba(15,23,42,0.45))' : 'none'}}>
        <Img src={staticFile(dangCo ? 'robot/lab/nhen-co.png' : 'robot/lab/nhen-dung.png')} style={{width: '100%', height: '100%'}} />
      </div>

      <Burst at={155} x={695} y={530} color={C.good} r={170} />

      <CodeBox x={110} y={840} w={860} size={25} title="nhen_co_va_nhay.py"
        lines={[
          'crouch(); wait()    # 1. Co chân thấp xuống',
          'go_right()          # 2. Chui qua gầm (tự đi 2 nhịp)',
          'stand(); go_right() # 3. Duỗi + bước -> NHẢY QUA HỐ!',
        ]}
        hl={f < 40 ? 0 : f < 95 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="crouch() -> stand() + go_..." coChe="Co lấy đà rồi bật duỗi" ketQua="Nhảy vọt qua 1 ô!" mau="#7C3AED" at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [155, 'thumbs-up']]}
        says={[
          {at: 10, out: 102, text: 'Thân Nhện 4 chân không có mặt trước: gọi go_up(), go_down(), go_left(), go_right() là tự bước đủ 2 nhịp theo màn hình mà không cần wait()!'},
          {at: 108, out: 204, text: 'Muốn chui gầm thấp thì gọi crouch() + wait(). Còn đang co mà gọi stand() ngay trước lệnh bước là Nhện bật nhảy vọt qua 1 ô hố sâu!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [100, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

const BANG_THAN_NHEN = [
  {ma: 'NHEN-01', code: 'go_up / down / left / right()', moTa: 'Đi 4 hướng màn hình không cần quay · Tự chạy 2 nhịp', kq: '2 nhịp / bước', icon: 'Move', mau: '#7C3AED'},
  {ma: 'NHEN-02', code: 'crouch() + wait()', moTa: 'Co 4 chân thấp sát đất · Chui qua được gầm đá thấp', kq: 'Chui gầm thấp', icon: 'Minimize2', mau: C.solaDeep},
  {ma: 'NHEN-03', code: 'stand() + go_...() (khi đang co)', moTa: 'Duỗi chân ngay lúc bước tạo lực bật nhảy qua 1 ô hố', kq: 'Nhảy qua 1 ô', icon: 'Zap', mau: C.good},
  {ma: 'NHEN-04', code: 'Leo bậc thang', moTa: 'Chân nhện leo qua bậc thang; đi ngược băng chuyền bị đẩy về', kq: 'Leo bậc thang', icon: 'TrendingUp', mau: '#D97706'},
  {ma: 'NHEN-05', code: 'Bước thẳng vào hố / Đứng chui gầm', moTa: 'Chưa co mà chui gầm sẽ vướng; bước thường vào hố sẽ rơi', kq: 'Cẩn thận hố!', icon: 'AlertTriangle', mau: C.bad},
];

const CanhSoTayThanNhen: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY THÂN NHỆN 4 CHÂN"
    tieuDe="Sổ tay 5 Quy tắc Thân Nhện (Mùa 5)" accent={['Thân Nhện (Mùa 5)']}
    phuDe="Bò 4 hướng không cần quay, co chân chui gầm đá và bật nhảy qua hố trên Mỏ đá">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_THAN_NHEN.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Nhớ nha: lệnh go_...() của Nhện tự chạy 2 nhịp không cần wait(), nhưng lệnh crouch() thì vẫn cần wait() để co chân!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const PHIM_THAN_NHEN: Phim = {
  id: 'PhimThanNhen',
  doc: true,
  canh: [
    {id: 'van-de-than-nhen', dur: 195, el: <CanhNhenVanDe />, sfx: [W_IN, [50, 'wrong.wav', 0.5]]},
    {id: 'luna-che-than-nhen', dur: 195, el: <CanhNhenLunaChePart />, sfx: [[120, 'impact.wav', 0.5], [120, 'ding.wav', 0.4]]},
    {id: 'nhen-chi-tiet', dur: 210, el: <CanhNhenChiTiet />, sfx: [W_IN, [25, 'click.wav', 0.45], [95, 'swish.wav', 0.6], [155, 'ding.wav', 0.7]]},
    {id: 'so-tay-than-nhen', dur: 180, el: <CanhSoTayThanNhen />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
  ],
};

/* ============================================================================
   2. PHIM_MAY_NEM — Bộ phận: Máy Ném (nem)
   Bố cục: Vấn đề (Vách đá cao chắn ngang, cần chuyển kiện đá qua bên kia tường) -> Luna chế Máy ném -> Giải thích cơ chế cho Sola
   ========================================================================== */

export const CanhMayNemVanDe: React.FC = () => (
  <NenHienTruong anh="nen-doc/mua-5.png" mua="m6">
    {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-cua" c={c} r={2} />)}
    <Vat moc={[[0, 2, 3]]} />
    <ODat ten="o-dich" c={2} r={1} />
    <Xe anh="nhen" moc={[[0, 2, 4.5, -90], [45, 2, 3.6, -90]]} />
    <ChuNay chu="VÁCH ĐÁ CHẮN KÍN · KHÔNG MANG QUA ĐƯỢC!" at={50} den={155} x={540} y={tamO(2, 2).y - 45} mau={C.bad} co={30} />
    <NhanGoi so={2} ten="Máy ném" />
    <Mascot who="sola" x={230} h={520} at={0}
      faces={[[0, 'thinking'], [50, 'shocked']]}
      says={[{at: 8, out: 92, text: 'Bức tường đá chắn kín lối sang bệ nhận hàng rồi, R1 kẹp kiện hàng không sao đi xuyên qua tường được!'}]}
      bubbleW={550} bubbleTop={1230} />
    <Nguoi anh="dung-tin" ten="ANH DŨNG" mau="#475569" x={820} h={600} at={90} side="left" bubbleW={560} bubbleTop={1230}
      says={[{at: 96, out: 185, text: 'Phải phóng kiện hàng bay vọt qua đầu vách đá rơi đúng vào ô bệ bên kia mới được!'}]} />
  </NenHienTruong>
);

export const CanhMayNemLunaChePart: React.FC = () => (
  <TrongXe mua="m6" anh="nhen-nem" cach={120} tenPart="Máy ném"
    sola={[{at: 8, out: 72, text: 'Làm sao phóng kiện hàng bay vọt qua tường rơi trúng ô đích cách mấy bước đây Luna?'}]}
    luna={[{at: 78, out: 185, text: 'Tớ chế Máy ném lò xo chọn được tầm xa 1, 2 hoặc 3 ô rồi đây! Để tớ chỉ cậu cách nạp và ngắm bắn nhé!'}]}
    solaMat={[[0, 'thinking'], [78, 'excited']]}
    lunaMat={[[0, 'confident'], [78, 'happy']]} />
);

/** Cảnh 1 (7s = 210f): Cơ chế Máy ném aim(1..3), load() + wait(), throw() + wait() ném vọt qua tường! */
const CanhMayNemChiTiet: React.FC = () => {
  const f = useCurrentFrame();
  // f=20..65: load() + wait() nạp thùng ở ô trước mặt (385, 530) vào rổ ném của xe ở (230, 530)
  // f=75..95: aim(3) chọn tầm xa 3 ô (đích ở 230 + 3*155 = 695)
  // f=95..155: throw() + wait() phóng kiện hàng bay vọt qua tường cao ở (540, 530) rơi trúng ô đích (695, 530)!
  const daNap = f >= 45 && f < 95;
  const uNem = mo(f, 95, 155);
  const xVat = f < 45 ? 385 : daNap ? 275 : 275 + uNem * (695 - 275);
  const doCaoVat = f >= 95 && f <= 155 ? Math.sin(uNem * Math.PI) * 140 : 0;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: MÁY NÉM"
      tieuDe="Máy Ném: aim(n) · load() · throw() vượt tường!" accent={['aim(n)', 'load()', 'throw()']}
      phuDe="aim(1..3) chọn tầm xa 0 tốn nhịp — Phóng vật bay qua tường, rào, băng chuyền rơi đúng n ô">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* Tường chắn ở giữa (540, 530) mà vật ném bay vọt qua đầu */}
      <div style={{position: 'absolute', left: 540 - 65, top: 530 - 65, width: 130, height: 130, borderRadius: 18,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 8}}>
        <Img src={staticFile('robot/m1/o-tuong.png')} style={{width: 118, height: 118, borderRadius: 16}} />
      </div>

      {/* Ô đích cách 3 ô phía trước (695, 530) */}
      <div style={{position: 'absolute', left: 695 - 66, top: 530 - 66, width: 132, height: 132, borderRadius: 22,
        border: `4px dashed ${C.good}`, background: 'rgba(14,159,110,0.16)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 7}}>
        <span style={{fontFamily: MONO, fontSize: 22, fontWeight: 900, color: C.good, whiteSpace: 'nowrap'}}>aim(3)</span>
        <span style={{fontSize: 16, fontWeight: 800, color: C.good, whiteSpace: 'nowrap'}}>ĐIỂM RƠI</span>
      </div>

      {/* Robot gắn Máy Ném ở (230, 530) */}
      <div style={{position: 'absolute', left: 230 - 125, top: 530 - 125, width: 250, height: 250, zIndex: 12}}>
        <Img src={staticFile('robot/lab/nhen-may-nem.png')} style={{width: '100%', height: '100%'}} />
      </div>

      {/* Kiện hàng được nạp rồi phóng vọt qua tường */}
      <div style={{position: 'absolute', left: xVat - 42, top: 530 - 42 - doCaoVat, width: 84, height: 84, zIndex: 15,
        transform: `scale(${1 + doCaoVat / 260}) rotate(${uNem * 360}deg)`,
        filter: doCaoVat > 5 ? 'drop-shadow(0 30px 18px rgba(15,23,42,0.42))' : 'none'}}>
        <Img src={staticFile('robot/thung-go.png')} style={{width: '100%', height: '100%'}} />
      </div>

      <div style={{position: 'absolute', left: 540, top: 272, transform: 'translateX(-50%)', padding: '10px 22px',
        borderRadius: 999, background: '#0F172A', color: '#fff', fontSize: 20, fontWeight: 800,
        border: `3px solid ${C.warn}`, whiteSpace: 'nowrap', zIndex: 15}}>
        Cảnh báo: Ô rơi có tường, rào, bậc thang hoặc đã có vật thì vật sẽ VỠ!
      </div>

      <Burst at={156} x={695} y={530} color={C.good} r={175} />

      <CodeBox x={110} y={840} w={860} size={23} title="may_nem_vuot_tuong.py"
        lines={[
          'load(); wait()    # 1. Nạp vật ở ô trước mặt vào rổ',
          'aim(3)            # 2. Chọn tầm xa 3 ô (0 tốn nhịp)',
          'throw(); wait()   # 3. Ném vọt qua tường rơi đúng ô 3!',
        ]}
        hl={f < 65 ? 0 : f < 95 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="load() + wait() -> aim(n) -> throw()" coChe="Bay qua tường / rào" ketQua="Rơi đúng n ô!" mau="#D97706" at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [156, 'thumbs-up']]}
        says={[
          {at: 10, out: 102, text: 'Máy ném giúp chuyển vật qua bên kia bức tường: gọi load() + wait() để nạp vật trước mặt vào rổ, rồi aim(1), aim(2) hoặc aim(3) để chọn tầm!'},
          {at: 108, out: 204, text: 'Lệnh aim(n) đổi tầm ngay không tốn nhịp! Khi gọi throw() + wait(), nhớ đảm bảo ô rơi cách n bước đang trống nhé, rơi trúng tường hay vật khác là vỡ ngay!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [150, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

const BANG_MAY_NEM = [
  {ma: 'NEM-01', code: 'load() + wait()', moTa: 'Nạp vật ở ô ngay trước mặt vào rổ (tối đa 1 vật)', kq: 'Nạp vào rổ', icon: 'Download', mau: C.solaDeep},
  {ma: 'NEM-02', code: 'aim(1 | 2 | 3)', moTa: 'Chọn tầm ném 1, 2 hoặc 3 ô phía trước · 0 tốn nhịp', kq: '0 tốn nhịp', icon: 'Crosshair', mau: '#D97706'},
  {ma: 'NEM-03', code: 'throw() + wait()', moTa: 'Phóng vật bay qua tường, rào, băng chuyền rơi cách n ô', kq: 'Ném xa n ô', icon: 'Send', mau: C.good},
  {ma: 'NEM-04', code: 'Nhịp nạp / ném', moTa: 'Trong nhịp đang load() hoặc throw() thì xe đứng yên', kq: 'Xe đứng yên', icon: 'PauseCircle', mau: C.indigo},
  {ma: 'NEM-05', code: 'Ô rơi không trống', moTa: 'Ô rơi là tường, rào, bậc thang, mép sân hay có vật -> Vỡ!', kq: 'Vật bị vỡ!', icon: 'AlertOctagon', mau: C.bad},
];

const CanhSoTayMayNem: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY BỘ PHẬN MÁY NÉM"
    tieuDe="Sổ tay 5 Quy tắc Máy Ném (Mùa 5)" accent={['Máy Ném (Mùa 5)']}
    phuDe="Nạp vật vào rổ và phóng vượt qua chướng ngại vật tới đúng tầm ngắm">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_MAY_NEM.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Rổ ném chỉ chứa được 1 vật mỗi lần thôi, nên nạp xong nhớ ngắm chuẩn ô trống rồi ném đi trước khi nạp vật tiếp theo nhé!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const PHIM_MAY_NEM: Phim = {
  id: 'PhimMayNem',
  doc: true,
  canh: [
    {id: 'van-de-may-nem', dur: 195, el: <CanhMayNemVanDe />, sfx: [W_IN, [50, 'wrong.wav', 0.5]]},
    {id: 'luna-che-may-nem', dur: 195, el: <CanhMayNemLunaChePart />, sfx: [[120, 'impact.wav', 0.5], [120, 'ding.wav', 0.4]]},
    {id: 'may-nem-chi-tiet', dur: 210, el: <CanhMayNemChiTiet />, sfx: [W_IN, [45, 'click.wav', 0.5], [95, 'swish.wav', 0.6], [156, 'ding.wav', 0.7]]},
    {id: 'so-tay-may-nem', dur: 180, el: <CanhSoTayMayNem />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
  ],
};

/* ============================================================================
   3. PHIM_DRONE — Bộ phận: Thân Drone Bay (drone) & Camera Bụng (camera-bay)
   Bố cục: Vấn đề (Vực băng và chướng ngại liên hoàn trên Núi tuyết) -> Luna chế Thân Drone & Camera bụng -> Giải thích cơ chế cho Sola
   ========================================================================== */

export const CanhDroneVanDe: React.FC = () => (
  <NenHienTruong anh="nen-doc/mua-hang.png" mua="m7">
    {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-rao" c={c} r={2} />)}
    {[0, 1, 2, 3, 4].map((c) => <ODat key={`r3-${c}`} ten="o-rao" c={c} r={3} />)}
    <Xe anh="nhen" moc={[[0, 2, 4.5, -90], [45, 2, 4, -90]]} />
    <ChuNay chu="VỰC BĂNG RỘNG · CHÂN NHỆN KHÔNG TỚI!" at={50} den={155} x={540} y={tamO(2, 2.5).y} mau={C.bad} co={32} />
    <NhanGoi so={1} ten="Thân Drone & Camera bụng" />
    <Mascot who="sola" x={230} h={520} at={0}
      faces={[[0, 'worried'], [50, 'shocked']]}
      says={[{at: 8, out: 92, text: 'Núi tuyết có khe vực rộng quá, chân nhện chỉ nhảy được 1 ô nên không tài nào vượt qua nổi!'}]}
      bubbleW={550} bubbleTop={1230} />
    <Nguoi anh="phong-tin" ten="CHÚ PHONG" mau="#0284C7" x={820} h={600} at={90} side="left" bubbleW={560} bubbleTop={1230}
      says={[{at: 96, out: 185, text: 'Trên đỉnh núi chỉ có phương tiện bay trên không mới vượt qua các dải rào băng liên tiếp được!'}]} />
  </NenHienTruong>
);

export const CanhDroneLunaChePart: React.FC = () => (
  <TrongXe mua="m5" anh="du" cach={120} tenPart="Thân Drone & Camera bụng"
    sola={[{at: 8, out: 72, text: 'Làm sao để R1 bay vọt qua mọi chướng ngại dưới mặt đất đây Luna?'}]}
    luna={[{at: 78, out: 185, text: 'Tớ chế Thân Drone 4 cánh quạt kèm Camera bụng nhìn xuống rồi đây! Cùng xem cơ chế bay và sạc pin nhé!'}]}
    solaMat={[[0, 'thinking'], [78, 'excited']]}
    lunaMat={[[0, 'confident'], [78, 'happy']]} />
);

/** Cảnh 1 (7s = 210f): Drone bay 1 nhịp/ô vượt rào, battery(), land() xuống ô P sạc pin, take_off() & look(). */
const CanhDroneChiTiet: React.FC = () => {
  const f = useCurrentFrame();
  const uBay = mo(f, 20, 110);
  const daDau = f >= 130;
  const xDrone = 230 + uBay * 3 * O;
  const pin = daDau ? 5 : Math.max(1, 5 - Math.floor(uBay * 3.5));

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: THÂN DRONE & CAMERA BỤNG"
      tieuDe="Thân Drone: Bay 1 nhịp · land() & look()!" accent={['Bay 1 nhịp', 'land()', 'look()!']}
      phuDe="Mỗi nhịp bay tốn 1 pin — Đáp xuống ô P bằng land() để sạc đầy, camera bụng look() nhìn ô dưới">
      <San x={140} y={245} w={800} h={570} o={O} />

      {[385, 540].map((ox) => (
        <div key={ox} style={{position: 'absolute', left: ox - 64, top: 530 - 64, width: 128, height: 128, borderRadius: 18,
          background: 'rgba(100,116,139,0.22)', border: '4px solid #64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6}}>
          <span style={{fontSize: 19, fontWeight: 900, color: '#334155', whiteSpace: 'nowrap'}}>RÀO THẤP</span>
        </div>
      ))}

      <div style={{position: 'absolute', left: 695 - 68, top: 530 - 68, width: 136, height: 136, borderRadius: 24,
        background: daDau ? '#DCFCE7' : '#E0F2FE', border: `5px solid ${daDau ? C.good : '#0284C7'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 7}}>
        <span style={{fontFamily: MONO, fontSize: 42, fontWeight: 900, color: daDau ? C.good : '#0369A1', lineHeight: 1}}>P</span>
        <span style={{fontSize: 16, fontWeight: 900, color: daDau ? C.good : '#0369A1', whiteSpace: 'nowrap'}}>TRẠM SẠC</span>
      </div>

      <div style={{position: 'absolute', left: xDrone - 125, top: 530 - 125 - (daDau ? 0 : 18 + Math.sin(f * 0.4) * 6),
        width: 250, height: 250, zIndex: 14, transform: `scale(${daDau ? 0.92 : 1.06})`,
        filter: daDau ? 'none' : 'drop-shadow(0 24px 16px rgba(15,23,42,0.38))'}}>
        <Img src={staticFile(daDau ? 'robot/lab/drone-dau.png' : 'robot/lab/drone-bay.png')} style={{width: '100%', height: '100%'}} />
      </div>

      <div style={{position: 'absolute', left: 165, right: 165, top: 272, padding: '12px 22px', borderRadius: 20,
        background: '#0F172A', border: `3px solid ${daDau ? C.good : '#0284C7'}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 15}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Icon name="BatteryCharging" size={28} color={daDau ? '#4ADE80' : '#38BDF8'} stroke={2.8} />
          <span style={{fontFamily: MONO, fontSize: 23, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
            battery() == <span style={{color: daDau ? '#4ADE80' : '#FDE047'}}>{pin}/5</span>
          </span>
        </div>
        <span style={{padding: '6px 16px', borderRadius: 999, background: daDau ? C.good : '#0284C7', color: '#fff',
          fontSize: 19, fontWeight: 900, whiteSpace: 'nowrap'}}>
          {daDau ? 'Đã land() xuống P -> Pin ĐẦY!' : 'look() đọc màu dưới bụng'}
        </span>
      </div>

      <Burst at={132} x={695} y={530} color={C.good} r={180} />

      <CodeBox x={110} y={840} w={860} size={21.5} title="drone_bay_sac_va_look.py"
        lines={[
          'go_right(); go_right(); go_right() # Bay 3 ô (mỗi ô 1 nhịp)',
          'if battery() < 3:                  # Hỏi pin còn bao nhiêu',
          '    land()                         # Đáp xuống ô P sạc đầy!',
          '    take_off()                     # Cất cánh rồi bay tiếp!',
        ]}
        hl={f < 110 ? 0 : f < 130 ? 1 : f < 165 ? 2 : 3} hlAt={10} />

      <CongThucLab lenh="battery() -> land() -> take_off()" coChe="Đáp ô P sạc · look() nhìn dưới" ketQua="Bay 1 nhịp / ô!" mau="#0284C7" at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [145, 'thumbs-up']]}
        says={[
          {at: 10, out: 98, text: 'Drone bay siêu nhanh: mỗi lệnh go_up(), go_right()... chỉ mất 1 nhịp và bay vọt qua cả rào thấp, băng chuyền, vật cản hay bậc thang!'},
          {at: 104, out: 204, text: 'Nhưng mỗi nhịp bay đều tốn 1 pin! Phải gọi land() đáp xuống ô P để sạc đầy rồi take_off() bay tiếp, còn camera bụng dùng lệnh look() để đọc màu bên dưới!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [130, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

const BANG_DRONE = [
  {ma: 'DRN-01', code: 'go_up / down / left / right()', moTa: 'Bay 4 hướng màn hình · 1 nhịp mỗi ô · Vượt rào/bậc thang', kq: '1 nhịp / ô', icon: 'Plane', mau: '#0284C7'},
  {ma: 'DRN-02', code: 'battery()', moTa: 'Hỏi pin còn bao nhiêu (0 nhịp) · Mỗi nhịp bay tốn 1 pin', kq: 'Hết pin = Rơi!', icon: 'BatteryWarning', mau: '#D97706'},
  {ma: 'DRN-03', code: 'land() -> Sạc tại ô P', moTa: 'Hạ cánh xuống ô P thì cuối nhịp pin đầy · Đậu không tốn pin', kq: 'Sạc đầy pin', icon: 'ArrowDownCircle', mau: C.good},
  {ma: 'DRN-04', code: 'take_off()', moTa: 'Đang đậu dưới đất thì không bay được, phải cất cánh trước', kq: 'Cất cánh (1 nhịp)', icon: 'ArrowUpCircle', mau: C.indigo},
  {ma: 'DRN-05', code: 'look() (Camera bụng drone)', moTa: 'Đọc màu vật hoặc màu sàn ở ô ngay bên dưới bụng Drone', kq: 'Đọc màu 0 nhịp', icon: 'Eye', mau: C.lunaDeep},
];

const CanhSoTayDrone: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY THÂN DRONE & CAMERA BỤNG"
    tieuDe="Sổ tay 5 Quy tắc Thân Drone (Mùa 6)" accent={['Thân Drone (Mùa 6)']}
    phuDe="Làm chủ tốc độ bay, quản lý dung lượng pin và camera nhìn xuống trên Núi tuyết">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_DRONE.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Lưu ý: Drone không gắn được tay kẹp, máy ném hay vòi phun, chỉ treo được nam châm dưới bụng và gắn camera nhìn xuống look() thôi nhé!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const PHIM_DRONE: Phim = {
  id: 'PhimDrone',
  doc: true,
  canh: [
    {id: 'van-de-drone', dur: 195, el: <CanhDroneVanDe />, sfx: [W_IN, [50, 'wrong.wav', 0.5]]},
    {id: 'luna-che-drone', dur: 195, el: <CanhDroneLunaChePart />, sfx: [[120, 'impact.wav', 0.5], [120, 'ding.wav', 0.4]]},
    {id: 'drone-chi-tiet', dur: 210, el: <CanhDroneChiTiet />, sfx: [W_IN, [20, 'swish.wav', 0.5], [132, 'ding.wav', 0.7]]},
    {id: 'so-tay-drone', dur: 180, el: <CanhSoTayDrone />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
  ],
};
