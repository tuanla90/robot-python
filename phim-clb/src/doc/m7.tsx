// 10 phim gói mùa 7 "Hang động đá vôi · Xe thám hiểm & cứu hộ hang động R1", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 3 mục 8:
// mỗi gói hai phim: M7G<n>-Mo (phim mở) và M7G<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO} from './kit-doc';

const NEN = 'nen-doc/mua-hang.png';
const DON = [
  'Bám sàn đá vôi ướt vào cửa hang', 'Phát xung còi tìm ánh đèn khảo sát', 'Định vị tiếng vang bằng tai Sonar', 'Xuyên vách núi qua ngách hang ngầm', 'Thu gai trượt nhanh xuống máng đá',
  'Phát đúng nốt cộng hưởng đá chuông', 'Nghe giọng ngân đàn đá tự nhiên', 'Lăn ngọc động tròn lấp khe vực ngầm', 'Phối hợp R2 qua mật mã tiếng vang', 'Thắp sáng toàn bộ 4 vòm hang đá vôi',
];

/** Chú Phong đội trưởng cứu hộ & khảo sát hang động (ảnh TopView tách nền). */
const Phong: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'phong-nghi'}) => (
  <Nguoi anh={dang} ten="CHÚ PHONG" mau="#0D9488" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ báo mức pin bộ đàm của đoàn khảo sát góc trên trái. */
const PinBoDamBar: React.FC<{con: string; gap?: boolean}> = ({con, gap}) => {
  const f = useCurrentFrame();
  const nhay = gap && Math.floor(f / 10) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 36}}>
      <Icon name="Radio" size={40} color={nhay ? '#fff' : '#0D9488'} stroke={2.6} />
      <span>{con}</span>
    </div>
  );
};

/** Bốn vòm hang đá vôi trên bảng thành tựu thắp sáng đèn tiêu từ 0% đến 100%. */
const VomHangBar: React.FC<{sang: [number, number, number, number]; sap?: boolean}> = ({sang, sap}) => {
  const VOM = [
    {ten: 'Vòm Cửa', mau: '#0D9488', nen: '#CCFBF1'},
    {ten: 'Vòm Nhũ', mau: '#F59E0B', nen: '#FEF3C7'},
    {ten: 'Vòm Đàn Đá', mau: '#0284C7', nen: '#E0F2FE'},
    {ten: 'Suối Ngầm', mau: '#16A34A', nen: '#DCFCE7'},
  ];
  return (
    <div style={{position: 'absolute', left: 90, top: 150, width: 900, display: 'flex', gap: 14}}>
      {VOM.map((v, i) => (
        <div key={v.ten} style={{flex: 1, padding: '12px 14px', borderRadius: 20, background: sap && i === 1 ? '#FEE2E2' : v.nen,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.ink, whiteSpace: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>{v.ten}</span><span>{sang[i]}%</span>
          </div>
          <div style={{height: 14, borderRadius: 99, background: '#fff', border: `3px solid ${C.ink}`, overflow: 'hidden'}}>
            <div style={{width: `${sang[i]}%`, height: '100%', background: v.mau}} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Đoạn kết chung mùa 7: 4 vòm hang + bảng tiến độ + pin bộ đàm + chú Phong. */
const ThanhTuu: React.FC<{moi: number; loi: string; con: string; so: number; ten: string; sang: [number, number, number, number]; xoa?: number}> =
  ({moi, loi, con, so, ten, sang, xoa}) => (
    <NenHienTruong anh={NEN} mua="m7" luoi={false} toi={0.52}>
      <VomHangBar sang={sang} sap={xoa !== undefined} />
      <BangViec tieuDe="Bản đồ cứu hộ & mở luồng hang động của chú Phong" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={270} />
      <PinBoDamBar con={con} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Phong dang={chonDangNguoi('phong', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Khối thạch nhũ đá chuông treo góc trên phải (4, 0) rung nhẹ từ gói 1; đến gói 6 dư chấn làm sập chắn ngách hang. */
const DaChuongGoc: React.FC<{sap?: boolean}> = ({sap}) => {
  const f = useCurrentFrame(), p = tamO(4, 0);
  const g = sap ? -24 : 4 * Math.sin(f / 6);
  return (
    <div style={{position: 'absolute', left: p.x - O * 0.44, top: p.y - O * 0.42, width: O * 0.88, height: O * 0.84, borderRadius: 16,
      background: sap ? 'linear-gradient(135deg, #EF4444, #991B1B)' : 'linear-gradient(135deg, #F59E0B, #92400E)',
      border: `4px solid ${C.ink}`, transform: `rotate(${g}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon name="Volume2" size={46} color="#fff" />
    </div>
  );
};

/** Vòng sóng âm lan tỏa từ loa robot tới khối đá chuông hoặc ba lô khảo sát. */
const SongAm: React.FC<{c: number; r: number; at: number; out: number; mau?: string}> = ({c, r, at, out, mau = '#38BDF8'}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const p = tamO(c, r), t = ((f - at) % 24) / 24, bk = 40 + t * 180;
  return (
    <div style={{position: 'absolute', left: p.x - bk, top: p.y - bk, width: bk * 2, height: bk * 2, borderRadius: '50%',
      border: `6px solid ${mau}`, opacity: 1 - t, pointerEvents: 'none'}} />
  );
};

/* ================================================================== GÓI 1 · Bánh gai bám đá vôi ướt */
const R_G1M: Moc[] = [[0, 0, 3, 0], [18, 0, 3, 0], [65, 2, 3, 180], [95, 1.4, 3.6, 320]];
const G1Mo: React.FC = () => (
  <Shake hits={[66]} amp={10}>
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-da-uot" c={c} r={3} />)}
      <ODat ten="o-den-tat" c={4} r={3} />
      <Xe anh="omni" moc={R_G1M} doi={[[66, 'omni-ngac']]} />
      <ChuNay chu="TRƯỢT ĐÁ ƯỚT!" at={66} den={138} x={tamO(2, 3).x + 90} y={tamO(2, 3).y - 40} />
      <PinBoDamBar con="Pin đàm: 80%" />
      <NhanGoi so={1} ten="Thân bánh gai bám đá" />
      <Phong says={[{at: 72, out: 175, text: 'Nền đá ướt trơn bóng, bánh thường vào là trượt!'}]} at={58} />
    </NenHienTruong>
  </Shake>
);
const R_G1K: Moc[] = [[0, 0, 3, 0], [18, 0, 3, 0], [60, 1, 3, 0], [105, 2, 3, 0], [150, 4, 3, 0]];
const G1Lam: React.FC = () => {
  const f = useCurrentFrame(), bat = f >= 148;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-da-uot" c={c} r={3} />)}
      <ODat ten={bat ? 'o-den-bat' : 'o-den-tat'} c={4} r={3} />
      <Xe anh="gai" moc={R_G1K} doi={[[148, 'gai-vui']]} />
      <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={150} />
      <CodeBox lines={['# Lưu từ điển dict tọa độ đèn tiêu', 'tram = {"cua_hang": 4}', 'move(tram["cua_hang"])']}
        typeAt={25} x={44} y={270} w={570} title="banh_gai_dict.py" />
      <NhanGoi so={1} ten="Thân bánh gai bám đá" />
      <Sola mat={[[0, 'proud'], [145, 'happy']]} says={[{at: 18, out: 118, text: 'Đinh gai thép bấm chặt vào nền đá vôi ướt, tiến từng bước vững chắc không trượt một ly!'}, {at: 142, out: 205, text: 'Đèn tiêu số 1 bật sáng!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 2 · Loa phát xung còi (beat) */
const R_G2M: Moc[] = [[0, 1, 3, 0], [30, 2, 3, -45], [65, 2, 3, 45], [95, 2, 3, 0]];
const G2Mo: React.FC = () => (
  <Shake hits={[65]} amp={9}>
    <NenHienTruong anh={NEN} mua="m7" toi={0.35}>
      <DaChuongGoc />
      <Vat ten="vat-balo-do" moc={[[0, 4, 3, 0]]} />
      <Xe anh="gai" moc={R_G2M} doi={[[65, 'gai-ngac']]} />
      <ChuNay chu="SƯƠNG TỐI ĐẶC!" at={65} den={140} x={tamO(2, 3).x + 90} y={tamO(2, 3).y - 40} />
      <PinBoDamBar con="Pin đàm: 75%" />
      <NhanGoi so={2} ten="Loa phát xung còi" />
      <Phong dang="phong-sot-ruot" says={[{at: 68, out: 175, text: 'Vách khuất, bật đèn thôi đoàn khảo sát không thấy!'}]} at={54} />
    </NenHienTruong>
  </Shake>
);
const R_G2K: Moc[] = [[0, 1, 3, 0], [45, 2, 3, 0], [110, 3, 3, 0], [160, 3, 3, 0]];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m7">
    <DaChuongGoc />
    <SongAm c={2} r={3} at={45} out={105} />
    <Vat ten="vat-balo-do" moc={[[0, 4, 3, 0]]} />
    <Xe anh="gai-loa" moc={R_G2K} doi={[[45, 'gai-loa-phat'], [115, 'gai-loa-vui']]} />
    <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={95} />
    <CodeBox lines={['# Tập hợp set các vòm đã phát xung', 'da_goi = set()', 'da_goi.add("vom_2")', 'beat()  # phát xung âm báo hiệu']}
      typeAt={45} x={44} y={260} w={570} title="loa_phat_xung.py" />
    <NhanGoi so={2} ten="Loa phát xung còi" />
    <Luna mat={[[0, 'normal'], [110, 'happy']]} says={[{at: 18, out: 112, text: 'Gọi beat() phát xung còi vang khắp vòm hang, đèn báo trên ba lô đoàn khảo sát nhấp nháy đáp lại kìa!'}, {at: 118, out: 205, text: 'Liên lạc thành công!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 3 · Cảm biến âm thanh Sonar (Đôi tai dơi) */
const R_G3M: Moc[] = [[0, 2, 3, 0], [45, 2, 3, 90], [95, 2, 5, 90]];
const G3Mo: React.FC = () => (
  <Shake hits={[88]} amp={9}>
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc />
      <Vat ten="vat-balo-do" moc={[[0, 2, 1, 0]]} />
      <Xe anh="gai-loa" moc={R_G3M} doi={[[88, 'gai-loa-ngac']]} />
      <ChuNay chu="NHẦM NGÁCH VỌNG!" at={88} den={145} x={tamO(2, 4).x + 90} y={tamO(2, 4).y - 40} />
      <PinBoDamBar con="Pin đàm: 68%" />
      <NhanGoi so={3} ten="Cảm biến âm thanh Sonar" />
      <Sola mat={[[0, 'normal'], [86, 'surprised']]} says={[{at: 16, out: 82, text: 'Tiếng gõ cầu cứu, chắc ở ngách nam này!'}, {at: 88, out: 175, text: 'Ái, tiếng vang dội vách, nhầm ngách cụt rồi!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G3K: Moc[] = [[0, 2, 4, -90], [45, 2, 4, -90], [105, 2, 2, -90], [155, 2, 2, -90]];
const G3Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m7">
    <DaChuongGoc />
    <SongAm c={2} r={1} at={20} out={85} mau="#2DD4BF" />
    <Vat ten="vat-balo-do" moc={[[0, 2, 1, 0]]} />
    <Xe anh="gai-am-nghe" moc={R_G3K} doi={[[110, 'gai-am-vui']]} />
    <Burst x={tamO(2, 1).x} y={tamO(2, 1).y} at={112} />
    <CodeBox lines={['# Định vị tiếng vang như loài dơi', 'h = echo_dir()  # "up"', 'if h == "up":', '    up_move(2)']}
      typeAt={25} x={44} y={260} w={560} title="sonar_doi.py" />
    <NhanGoi so={3} ten="Cảm biến âm thanh Sonar" />
    <Luna mat={[[0, 'wink'], [112, 'happy']]} says={[{at: 18, out: 112, text: 'Đôi tai Sonar thu sóng âm phản xạ giống loài dơi, chỉ chính xác tiếng gõ phát ra từ hướng Bắc!'}, {at: 118, out: 205, text: 'Tìm thấy ba lô đoàn khảo sát!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 4 · Ngách hang ngầm xuyên vách núi (Cơ chế ngôi sao) */
const R_G4M: Moc[] = [[0, 1, 3, 0], [55, 2, 3, 0], [95, 2, 3, 18]];
const G4Mo: React.FC = () => (
  <Shake hits={[58]} amp={10}>
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc />
      {[1, 2, 3, 4, 5].map((r) => <ODat key={r} ten="o-ho" c={2} r={r} />)}
      <ODat ten="o-den-tat" c={4} r={3} />
      <Xe anh="gai-am" moc={R_G4M} doi={[[58, 'gai-am-ngac']]} />
      <ChuNay chu="KHE VỰC CHẮN NGANG!" at={58} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 45} />
      <PinBoDamBar con="Pin đàm: 60%" />
      <NhanGoi so={4} ten="Ngách hang xuyên núi" />
      <Phong dang="phong-tin" says={[{at: 64, out: 175, text: 'Vách bên có cặp cửa ngách thông nhau đấy!'}]} at={50} />
    </NenHienTruong>
  </Shake>
);
const R_G4K: Moc[] = [[0, 0, 2, 0], [45, 1, 2, 0], [50, 3, 4, 0], [115, 4, 4, 0], [155, 4, 4, 0]];
const G4Lam: React.FC = () => {
  const f = useCurrentFrame(), bat = f >= 116;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc />
      {[1, 2, 3, 4, 5].map((r) => <ODat key={r} ten="o-ho" c={2} r={r} />)}
      <ODat ten="o-ngach-1" c={1} r={2} />
      <ODat ten="o-ngach-1" c={3} r={4} />
      <ODat ten={bat ? 'o-den-bat' : 'o-den-tat'} c={4} r={4} />
      <Xe anh="gai-am" moc={R_G4K} doi={[[116, 'gai-am-vui']]} />
      <Burst x={tamO(1, 2).x} y={tamO(1, 2).y} at={46} />
      <Burst x={tamO(3, 4).x} y={tamO(3, 4).y} at={52} />
      <Burst x={tamO(4, 4).x} y={tamO(4, 4).y} at={118} />
      <CodeBox lines={['# Đi vào ngách hang 1 -> sang bờ kia', 'move()  # vào cửa ngách (1, 2)', '# Ló ra ở cửa ngách (3, 4)!', 'move()']}
        typeAt={40} x={44} y={260} w={570} title="ngach_hang_ngam.py" />
      <NhanGoi so={4} ten="Ngách hang xuyên núi" />
      <Sola mat={[[0, 'proud'], [116, 'happy']]} says={[{at: 18, out: 112, text: 'Chui vào cửa ngách hang số 1 bên này, lập tức xuyên vách núi sang cửa số 1 bên kia khe vực!'}, {at: 118, out: 205, text: 'Đường tắt kỳ diệu!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 5 · Thu gai trượt dốc đá ướt (retract_spikes) */
const R_G5M: Moc[] = [[0, 2, 1, 90], [45, 2, 2, 90], [95, 2, 2.5, 90]];
const G5Mo: React.FC = () => (
  <Shake hits={[85]} amp={9}>
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc />
      {[1, 2, 3, 4].map((r) => <ODat key={r} ten="o-doc-da" c={2} r={r} />)}
      <ODat ten="o-den-tat" c={2} r={5} />
      <Xe anh="gai-am" moc={R_G5M} doi={[[85, 'gai-am-ngac']]} />
      <ChuNay chu="BÒ QUÁ CHẬM!" at={85} den={142} x={tamO(2, 3).x + 110} y={tamO(2, 3).y - 30} />
      <PinBoDamBar con="Pin đàm: 50%" />
      <NhanGoi so={5} ten="Thu gai trượt dốc" />
      <Luna mat={[[0, 'normal'], [82, 'surprised']]} says={[{at: 16, out: 78, text: 'Gai thép bám từng bước, xuống dốc chậm rì...'}, {at: 85, out: 175, text: 'Pin bộ đàm còn 50%, phải trượt nhanh xuống!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G5K: Moc[] = [[0, 2, 1, 90], [25, 2, 1, 90], [70, 2, 5, 90], [155, 2, 5, 90]];
const G5Lam: React.FC = () => {
  const f = useCurrentFrame(), bat = f >= 72;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc />
      {[1, 2, 3, 4].map((r) => <ODat key={r} ten="o-doc-da" c={2} r={r} />)}
      <ODat ten={bat ? 'o-den-bat' : 'o-den-tat'} c={2} r={5} />
      <Xe anh="gai-am" moc={R_G5K} doi={[[22, 'gai-du-thu'], [72, 'gai-am-vui']]} />
      <Burst x={tamO(2, 5).x} y={tamO(2, 5).y} at={72} />
      <CodeBox lines={['# Thu gai trượt vèo hết dốc rồi bung gai', 'retract_spikes()', 'slide_chute()', 'extend_spikes()']}
        typeAt={25} x={44} y={260} w={580} title="thu_gai_truot_doc.py" />
      <NhanGoi so={5} ten="Thu gai trượt dốc" />
      <Sola mat={[[0, 'proud'], [72, 'happy']]} says={[{at: 18, out: 108, text: 'Thu gọn gai thép vào lốp để trượt vèo một mạch xuống máng đá ướt, tới đáy bung gai phanh két!'}, {at: 112, out: 205, text: 'Tiết kiệm bao nhiêu giờ!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 6 · Phát nốt cộng hưởng note(n) (Biến cố giữa mùa) */
const R_G6M: Moc[] = [[0, 1, 3, 0], [100, 1, 3, 0]];
const G6Mo: React.FC = () => (
  <Shake hits={[20, 68]} amp={12}>
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc sap />
      <SongAm c={1} r={3} at={35} out={75} />
      <Vat ten="vat-da-chuong" moc={[[0, 2, 3, 0]]} />
      <ODat ten="o-ngach-1" c={3} r={3} />
      <Xe anh="gai-am-phat" moc={R_G6M} doi={[[70, 'gai-am-ngac']]} />
      <ChuNay chu="SẬP ĐÁ CHUÔNG!" at={18} den={85} x={tamO(3, 1).x} y={tamO(3, 1).y} />
      <ChuNay chu="CÒI THƯỜNG VÔ HIỆU!" at={68} den={145} x={tamO(2, 3).x + 60} y={tamO(2, 3).y - 45} />
      <PinBoDamBar con="DƯ CHẤN SẬP NGÁCH!" gap />
      <NhanGoi so={6} ten="Phát nốt cộng hưởng" />
      <Phong dang="phong-hoang" says={[{at: 52, out: 175, text: 'Đá chuông chỉ cộng hưởng với đúng nốt trong sổ!'}]} at={40} />
    </NenHienTruong>
  </Shake>
);
const R_G6K: Moc[] = [[0, 1, 3, 0], [85, 1, 3, 0], [140, 3, 3, 0], [160, 3, 3, 0]];
const G6Lam: React.FC = () => {
  const f = useCurrentFrame(), vo = f >= 82;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <DaChuongGoc sap />
      <ODat ten="o-ngach-1" c={3} r={3} />
      <SongAm c={1} r={3} at={30} out={80} mau="#FACC15" />
      {!vo && <Vat ten="vat-da-chuong" moc={[[0, 2, 3, 0]]} />}
      <Xe anh="gai-du-vui" moc={R_G6K} />
      <Burst x={tamO(2, 3).x} y={tamO(2, 3).y} at={82} />
      <CodeBox lines={['# Tra từ điển nốt cộng hưởng', 'not_da = {"vang": 3, "ngoc": 5}', 'note(not_da["vang"])']}
        typeAt={30} x={44} y={260} w={660} title="cong_huong_da_chuong.py" />
      <NhanGoi so={6} ten="Phát nốt cộng hưởng" />
      <Luna mat={[[0, 'wink'], [85, 'happy']]} says={[{at: 18, out: 112, text: 'Tra từ điển not_da["vang"] ra nốt số 3, phát sóng âm cộng hưởng làm khối thạch nhũ rỗng tự nứt tan!'}, {at: 118, out: 205, text: 'Ngách hang thông lại rồi!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 7 · Nghe giọng ngân đàn đá listen() */
const R_G7M: Moc[] = [[0, 1, 3, 0], [100, 1, 3, 0]];
const G7Mo: React.FC = () => (
  <Shake hits={[68]} amp={10}>
    <NenHienTruong anh={NEN} mua="m7">
      <SongAm c={1} r={3} at={30} out={68} />
      <Vat ten="vat-da-chuong" moc={[[0, 2, 3, 0]]} />
      <Vat ten="vat-balo-do" moc={[[0, 3, 3, 0]]} />
      <Xe anh="gai-du-vui" moc={R_G7M} doi={[[68, 'gai-am-ngac']]} />
      <ChuNay chu="LỆCH TẦN SỐ!" at={68} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 45} />
      <PinBoDamBar con="Pin đàm: 35%" />
      <NhanGoi so={7} ten="Nghe giọng đàn đá" />
      <Sola mat={[[0, 'normal'], [68, 'surprised']]} says={[{at: 16, out: 64, text: 'Thử phát nốt số 3 như cột trước xem sao...'}, {at: 70, out: 175, text: 'Không nhúc nhích! Cột này có tần số chưa ghi!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G7K: Moc[] = [[0, 1, 3, 0], [95, 1, 3, 0], [145, 3, 3, 0], [160, 3, 3, 0]];
const G7Lam: React.FC = () => {
  const f = useCurrentFrame(), vo = f >= 90;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <SongAm c={2} r={3} at={15} out={48} mau="#2DD4BF" />
      <SongAm c={1} r={3} at={52} out={88} mau="#FACC15" />
      {!vo && <Vat ten="vat-da-chuong" moc={[[0, 2, 3, 0]]} />}
      <Vat ten="vat-balo-do" moc={[[0, 3, 3, 0]]} />
      <Xe anh="gai-am-nghe" moc={R_G7K} doi={[[50, 'gai-du-vui']]} />
      <Burst x={tamO(2, 3).x} y={tamO(2, 3).y} at={90} />
      <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={145} />
      <CodeBox lines={['# Nghe giọng ngân của đá rồi phát lại', 'giong = listen()   # thu được nốt 5', 'so_da["co"] = giong', 'note(giong)        # cộng hưởng chuẩn!']}
        typeAt={25} x={44} y={250} w={580} title="nghe_dan_da.py" />
      <NhanGoi so={7} ten="Nghe giọng đàn đá" />
      <Sola mat={[[0, 'proud'], [90, 'happy']]} says={[{at: 18, out: 112, text: 'Dùng listen() lắng nghe âm ngân tự nhiên của phiến đàn đá, lưu vào dict rồi phát lại đúng nốt 5!'}, {at: 118, out: 205, text: 'Mở cửa Vòm Đàn Đá!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 8 · Yếu tố cũ: Tảng ngọc động tròn & Dốc đá */
const R_G8M: Moc[] = [[0, 1, 3, 0], [55, 2, 3, 0], [95, 2, 3, 15]];
const G8Mo: React.FC = () => (
  <Shake hits={[60]} amp={9}>
    <NenHienTruong anh={NEN} mua="m7">
      <ODat ten="o-doc-da" c={3} r={2} />
      <ODat ten="o-ho" c={3} r={3} />
      <ODat ten="o-den-tat" c={4} r={3} />
      <Vat ten="vat-da-tron" moc={[[0, 3, 1, 0]]} />
      <Xe anh="gai-du" moc={R_G8M} doi={[[60, 'gai-am-ngac']]} />
      <ChuNay chu="KHE VỰC SÂU!" at={60} den={140} x={tamO(3, 3).x + 60} y={tamO(3, 3).y - 40} />
      <PinBoDamBar con="Pin đàm: 28%" />
      <NhanGoi so={8} ten="Lăn ngọc động lấp vực" />
      <Phong dang="phong-tin" says={[{at: 64, out: 175, text: 'Anh Dũng nhắn: đẩy nhẹ ngọc động lăn lấp vực!'}]} at={50} />
    </NenHienTruong>
  </Shake>
);
const R_G8K: Moc[] = [[0, 3, 0, 90], [35, 3, 1, 90], [95, 1, 3, 0], [150, 4, 3, 0]];
const D_G8K: Moc[] = [[0, 3, 1, 0], [35, 3, 1, 0], [75, 3, 3, 180], [160, 3, 3, 180]];
const G8Lam: React.FC = () => {
  const f = useCurrentFrame(), lap = f >= 76, bat = f >= 148;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <ODat ten="o-doc-da" c={3} r={2} />
      {!lap ? <ODat ten="o-ho" c={3} r={3} /> : <ODat ten="o-da-uot" c={3} r={3} />}
      <ODat ten={bat ? 'o-den-bat' : 'o-den-tat'} c={4} r={3} />
      {!lap && <Vat ten="vat-da-tron" moc={D_G8K} />}
      <Xe anh="gai-du" moc={R_G8K} doi={[[148, 'gai-du-vui']]} />
      <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={76} />
      <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={150} />
      <CodeBox lines={['# Lăn ngọc động tròn qua máng dốc lấp hố', 'push_boulder()  # lăn xuống (3, 3)', 'move_across()']}
        typeAt={35} x={44} y={260} w={580} title="lan_ngoc_dong.py" />
      <NhanGoi so={8} ten="Lăn ngọc động lấp vực" />
      <Luna mat={[[0, 'wink'], [145, 'happy']]} says={[{at: 18, out: 118, text: 'Áp dụng bài học ở mỏ đá anh Dũng: đẩy tảng ngọc động tròn lăn theo máng dốc lấp phẳng khe vực!'}, {at: 140, out: 205, text: 'Nối thông đường cứu hộ!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 9 · R2 xuất hiện (Omni tầng đá khô + Bánh gai tầng đá ướt) */
const R_G9M: Moc[] = [[0, 1, 4, 0], [60, 2, 4, 0], [95, 2, 4, 0]];
const G9Mo: React.FC = () => (
  <Shake hits={[60]} amp={9}>
    <NenHienTruong anh={NEN} mua="m7">
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-da-uot" c={c} r={4} />)}
      <Vat ten="vat-balo-do" moc={[[0, 3, 1, 0]]} />
      <Xe anh="gai-du" moc={R_G9M} doi={[[60, 'gai-am-ngac']]} />
      <ChuNay chu="CHẶN SÓNG ĐÀM!" at={60} den={140} x={tamO(2, 3).x + 80} y={tamO(2, 3).y - 40} />
      <PinBoDamBar con="Pin đàm: 15%!" gap />
      <NhanGoi so={9} ten="Phối hợp R2 mật mã âm" />
      <Sola mat={[[0, 'normal'], [60, 'surprised']]} says={[{at: 16, out: 56, text: 'Vách đá vôi dày chặn sóng radio hai tầng rồi!'}, {at: 62, out: 175, text: 'Radio không qua, nhưng tiếng gõ vách thì qua được!'}]} />
    </NenHienTruong>
  </Shake>
);
const R2_G9K: Moc[] = [[0, 1, 1, 0], [45, 3, 1, 0], [160, 3, 1, 0]];
const R1_G9K: Moc[] = [[0, 1, 4, 0], [60, 1, 4, 0], [125, 3, 4, 0], [160, 3, 4, 0]];
const G9Lam: React.FC = () => {
  const f = useCurrentFrame(), bat = f >= 126;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-da-uot" c={c} r={4} />)}
      <ODat ten={bat ? 'o-den-bat' : 'o-den-tat'} c={3} r={4} />
      <SongAm c={3} r={1} at={45} out={90} mau="#2DD4BF" />
      <Vat ten="vat-balo-do" moc={[[0, 3, 1, 0]]} />
      <Xe anh="r2" moc={R2_G9K} doi={[[48, 'r2-vui']]} />
      <Xe anh="gai-du" moc={R1_G9K} doi={[[126, 'gai-du-vui']]} />
      <Burst x={tamO(3, 1).x} y={tamO(3, 1).y} at={48} />
      <Burst x={tamO(3, 4).x} y={tamO(3, 4).y} at={126} />
      <CodeBox lines={['# Từ điển giải mã tiếng vang từ R2', 'ma = {3: "left", 5: "right"}', 'huong = ma[r1.listen()]  # nốt 5 -> right', 'r1.move_to_beacon(huong)']}
        typeAt={48} x={44} y={250} w={590} title="mat_ma_am_thanh.py" />
      <NhanGoi so={9} ten="Phối hợp R2 mật mã âm" />
      <Luna mat={[[0, 'wink'], [125, 'happy']]} says={[{at: 18, out: 118, text: 'R2 ở tầng trên phát nốt 5 xuyên vách đá, R1 ở tầng dưới tra từ điển ma[5] biết ngay phải tiến sang phải!'}, {at: 122, out: 205, text: 'Giải cứu cả hai tầng!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 10 · Xuất xưởng Xe thám hiểm & cứu hộ hang động R1 */
const ThaTayM7: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return (
    <NenHienTruong anh={NEN} mua="m7" luoi={false} toi={0.45}>
      <div style={{position: 'absolute', left: 50, top: 200, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 50, color: '#fff', textShadow: `0 6px 0 ${C.ink}`}}>
        NÂNG CẤP HOÀN CHỈNH XE THÁM HIỂM HANG ĐỘNG R1
      </div>
      <div style={{position: 'absolute', left: 540 - 260, top: 430, width: 520, height: 520}}>
        <Img src={staticFile('robot/m7/gai-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {[
        {nhan: 'Bánh gai bám đá & thu gai', x: 50, y: 420, at: 8},
        {nhan: 'Loa phát xung & nốt nhạc', x: 590, y: 420, at: 18},
        {nhan: 'Tai dơi Sonar định vị vang', x: 50, y: 820, at: 28},
        {nhan: 'Từ điển cộng hưởng đàn đá', x: 580, y: 820, at: 38},
      ].map((m) => (
        <div key={m.nhan} style={{position: 'absolute', left: m.x, top: m.y, padding: '14px 24px', borderRadius: 20, background: '#5EEAD4',
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.ink, transform: `scale(${pop(f, m.at, fps)})`}}>
          {m.nhan}
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 12, out: 110, text: 'Xe thám hiểm hang động R1 hội tụ đủ 4 công nghệ âm học & địa hình, sẵn sàng xuất phát!'}]} />
    </NenHienTruong>
  );
};

const R1_C1: Moc[] = [[0, 1, 1, 90], [35, 1, 3, 0], [85, 1, 3, 0], [115, 3, 3, 0]];
const Canh1: React.FC = () => {
  const f = useCurrentFrame(), vo = f >= 78;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <ODat ten="o-doc-da" c={1} r={1} />
      <ODat ten="o-doc-da" c={1} r={2} />
      <ODat ten="o-ngach-1" c={3} r={3} />
      <SongAm c={1} r={3} at={40} out={76} mau="#FACC15" />
      {!vo && <Vat ten="vat-da-chuong" moc={[[0, 2, 3, 0]]} />}
      <Xe anh="gai-du-thu" moc={R1_C1} doi={[[36, 'gai-du-vui']]} />
      <Burst x={tamO(2, 3).x} y={tamO(2, 3).y} at={78} />
      <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={112} />
      <PinBoDamBar con="Chặng 1/2 · Phá đá chuông mở ngách" />
      <Phong dang="phong-tin" says={[{at: 12, out: 112, text: 'Thu gai trượt xuống dốc đá, nghe giọng ngân rồi phát đúng nốt mở thông cửa ngách hang!'}]} at={6} />
    </NenHienTruong>
  );
};

const R2_C2: Moc[] = [[0, 1, 1, 0], [45, 2, 1, 0], [120, 2, 1, 0]];
const R1_C2: Moc[] = [[0, 1, 4, 0], [45, 2, 4, 0], [95, 4, 4, 0], [120, 4, 4, 0]];
const Canh2: React.FC = () => {
  const f = useCurrentFrame(), bat = f >= 94;
  return (
    <NenHienTruong anh={NEN} mua="m7">
      <ODat ten="o-ngach-1" c={1} r={4} />
      {[2, 3].map((c) => <ODat key={c} ten="o-da-uot" c={c} r={4} />)}
      <ODat ten={bat ? 'o-den-bat' : 'o-den-tat'} c={4} r={4} />
      <SongAm c={2} r={1} at={25} out={70} mau="#2DD4BF" />
      <Vat ten="vat-balo-do" moc={[[0, 4, 3, 0]]} />
      <Xe anh="r2" moc={R2_C2} doi={[[48, 'r2-vui']]} />
      <Xe anh="gai-du" moc={R1_C2} doi={[[95, 'gai-du-vui']]} />
      <Burst x={tamO(4, 4).x} y={tamO(4, 4).y} at={95} />
      <PinBoDamBar con="Chặng 2/2 · Dẫn đoàn khảo sát ra cửa" />
      <Luna mat={[[0, 'wink'], [88, 'happy']]} says={[{at: 12, out: 112, text: 'R2 truyền mật mã âm thanh, R1 bật sáng đèn tiêu cuối cùng đưa cả đoàn khảo sát về trạm an toàn!'}]} />
    </NenHienTruong>
  );
};

const XuatXuongM7: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const PART = ['Bánh gai bám đá · Thu gai trượt dốc', 'Loa phát xung còi · Cộng hưởng nốt nhạc', 'Tai dơi Sonar · Giải mã từ điển dict'];
  return (
    <NenHienTruong anh={NEN} mua="m7" luoi={false} toi={0.42}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 50, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        XUẤT XƯỞNG: XE THÁM HIỂM HANG ĐỘNG R1
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 210, width: 600, height: 600, transform: `scale(${pop(f, 8, fps)})`}}>
        <Img src={staticFile('robot/m7/gai-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {PART.map((p, i) => (
        <div key={p} style={{position: 'absolute', left: 80, right: 80, top: 830 + i * 105, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]),
          padding: '16px 26px', borderRadius: 22, background: 'rgba(15,23,42,0.85)', border: `4px solid ${C.yellow}`,
          color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 34, display: 'flex', gap: 16, alignItems: 'center'}}>
          <Icon name="CircleCheck" size={40} color={C.yellow} />{p}
        </div>
      ))}
      <Burst x={540} y={520} at={18} />
      <Phong dang="phong-mung" x={820} says={[{at: 12, out: 76, text: 'Cảm ơn Sola và Luna! Cả 4 vòm hang đá vôi đã có đèn tiêu dẫn đường và bản đồ âm học chi tiết!'}]} at={6} />
      <Sola x={230} mat={[[0, 'happy']]} says={[{at: 82, out: 145, text: 'Xe thám hiểm R1 xin ở lại đồng hành cùng trạm cứu hộ hang động của chú Phong ạ!'}]} />
    </NenHienTruong>
  );
};

const NgoaiDoiM7: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Radar' as const, ten: 'Sonar Định Vị Tiếng Vang Lòng Đất', mo: 'Robot thám hiểm hang sâu & tàu ngầm dùng sóng âm Sonar lập bản đồ trong không gian tối đặc.'},
    {icon: 'Volume2' as const, ten: 'Cộng Hưởng Địa Chất & Đàn Đá Tự Nhiên', mo: 'Đo tần số ngân của đá vôi giúp phát hiện hốc rỗng ngầm và bảo tồn di sản đàn đá Việt Nam.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m7" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M7
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m7/gai-du-vui.png')} style={{width: 205, height: 205, objectFit: 'contain', transform: 'rotate(-90deg)'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#0D9488',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Xe Thám Hiểm Sóng Âm R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Định vị tiếng vang Sonar trong bóng tối và kích hoạt tần số cộng hưởng.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#0D9488', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Luna mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Kiểu từ điển dict và tập hợp set giúp robot tra cứu tức thì hàng nghìn tín hiệu cảm biến ngoài đời!'}]} />
    </NenHienTruong>
  );
};

const NhaMua8: React.FC = () => {
  const f = useCurrentFrame();
  const s = 1 + 0.04 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-7.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, padding: '28px 36px', borderRadius: 28, background: '#DC2626',
        border: `5px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#fff'}}>
        MÙA 8 CUỐI CÙNG · VỀ CLB GIẢI CỨU THỊ TRẤN
      </div>
      <Nguoi anh="thay-hoang" ten="THẦY HIỆU TRƯỞNG" mau="#2563EB" x={820} h={600} at={8} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 12, out: 76, text: 'Sola, Luna ơi! Cơn bão lớn vừa quét qua làm kẹt cả 7 cửa ngõ thị trấn ngay trước giờ khai mạc Ngày hội Robot!'}]} />
      <Sola x={230} mat={[[0, 'surprised'], [78, 'proud']]} says={[{at: 82, out: 145, text: 'Về CLB thôi! Mùa 8 mình sẽ lắp ráp Robot Lai từ toàn bộ kho linh kiện 7 mùa để giải cứu thị trấn!'}]} />
    </AbsoluteFill>
  );
};

/* ================================================================== ĐĂNG KÝ 20 PHIM MÙA 7 */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M7G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M7G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, con: string, loi: string, sang: [number, number, number, number], xoa?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} con={con} so={so} ten={ten} sang={sang} xoa={xoa} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 70,
  el: <TrongXe mua="m7" anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="m7" xoay={-90} anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M7: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 185, el: <G1Mo />, sfx: [W_IN, [66, 'wrong.wav', 0.5]]},
    xe('gai', 'Nền đá vôi trong hang phủ nhũ ướt trơn quá, làm sao bám chắc mặt đá?', 'Lắp 4 bánh lốp gai thép bám đá — bấm chặt từng bước không trượt một ly!', 'Thân bánh gai bám đá', 120),
    treo('gai', 'Tiến vào cửa hang và tra cứu tọa độ bằng từ điển dict nhé!', 1, 'Thân bánh gai bám đá'),
  ]),
  ket(1, [{id: 'lam', dur: 210, el: <G1Lam />, sfx: [[150, 'ding.wav', 0.5]]}, tt(1, 'Thân bánh gai bám đá', 'Pin đàm: 75%', 'Bám đá ướt chắc lắm! Nhưng vào sâu trong vòm hang sương ẩm tối đặc, đoàn khảo sát không thấy ánh đèn đâu!', [25, 0, 0, 0])]),
  mo(2, [
    {id: 'thu', dur: 185, el: <G2Mo />, sfx: [[65, 'wrong.wav', 0.5]]},
    xe('gai-loa-phat', 'Sương hang dày che khuất đèn pha, gọi đoàn khảo sát bằng cách nào?', 'Gắn loa phóng thanh trước mũi — gọi beat() phát xung còi vang khắp vòm hang!', 'Loa phát xung còi', 125),
    treo('gai-loa-phat', 'Gọi beat() phát âm hiệu xuyên qua màn sương tối!', 2, 'Loa phát xung còi'),
  ]),
  ket(2, [{id: 'lam', dur: 210, el: <G2Lam />, sfx: [[95, 'ding.wav', 0.5]]}, tt(2, 'Loa phát xung còi', 'Pin đàm: 68%', 'Có tiếng còi báo hiệu rồi! Nhưng hang có nhiều ngách vọng quá, phải nghe xem tiếng gõ đá đáp lại từ hướng nào!', [50, 20, 0, 0])]),
  mo(3, [
    {id: 'thu', dur: 185, el: <G3Mo />, sfx: [[88, 'wrong.wav', 0.5]]},
    xe('gai-am-nghe', 'Tiếng vang dội vách đá dễ nhầm hướng lắm, làm sao nghe chuẩn như loài dơi?', 'Lắp đôi tai thu sóng âm Sonar trên nóc — định vị chuẩn hướng tiếng gõ cầu cứu!', 'Cảm biến âm thanh Sonar', 125),
    treo('gai-am-nghe', 'Định vị chuẩn hướng tiếng gõ cầu cứu trong bóng tối!', 3, 'Cảm biến âm thanh Sonar'),
  ]),
  ket(3, [{id: 'lam', dur: 210, el: <G3Lam />, sfx: [[112, 'ding.wav', 0.5]]}, tt(3, 'Cảm biến âm thanh Sonar', 'Pin đàm: 60%', 'Tìm thấy nhóm khảo sát đầu tiên rồi! Phía trước vách đá chắn ngang có cửa ngách hang ngầm xuyên núi đấy!', [75, 45, 15, 0])]),
  mo(4, [
    {id: 'thu', dur: 185, el: <G4Mo />, sfx: [[58, 'wrong.wav', 0.5]]},
    treo('gai-am', 'Chui vào cửa ngách hang số 1 để xuyên vách núi sang bờ bên kia nhé!', 4, 'Ngách hang xuyên núi'),
  ]),
  ket(4, [{id: 'lam', dur: 210, el: <G4Lam />, sfx: [[46, 'pop.wav', 0.4], [118, 'ding.wav', 0.5]]}, tt(4, 'Ngách hang xuyên núi', 'Pin đàm: 52%', 'Đi ngách hang ngầm nhanh quá! Nhưng xuống tầng dưới là máng dốc đá vôi ướt dài, bò bằng gai thì lâu lắm!', [85, 65, 35, 15])]),
  mo(5, [
    {id: 'thu', dur: 185, el: <G5Mo />, sfx: [[85, 'wrong.wav', 0.5]]},
    xe('gai-du-thu', 'Xuống máng dốc đá vôi ướt dài mà bò từng bước bằng gai thì chậm quá!', 'Lắp cơ cấu thu gọn gai retract_spikes() — trượt vèo hết dốc rồi bung gai phanh lại!', 'Cơ cấu thu & bung gai lốp', 125),
    treo('gai-du-thu', 'Thu gai trượt máng đá vôi cực nhanh và bung gai phanh an toàn!', 5, 'Thu gai trượt dốc'),
  ]),
  ket(5, [{id: 'lam', dur: 210, el: <G5Lam />, sfx: [[72, 'ding.wav', 0.5]]}, tt(5, 'Thu gai trượt dốc', 'Pin đàm: 45%', 'Trượt dốc điệu nghệ lắm! Nhưng coi chừng dư chấn làm khối thạch nhũ rỗng trên trần hang rung lắc kìa!', [90, 80, 55, 30])]),
  mo(6, [
    {id: 'thu', dur: 185, el: <G6Mo />, sfx: [[20, 'impact.wav', 0.6], [68, 'wrong.wav', 0.5]]},
    xe('gai-du-vui', 'Khối thạch nhũ đá chuông sập chắn ngách hang, còi thường phát không xi nhê!', 'Nâng cấp bộ phát tần số cộng hưởng note(1..5) — tra từ điển địa chất phát đúng nốt nhạc!', 'Bộ phát tần số cộng hưởng note(n)', 125),
    treo('gai-du-vui', 'Tra từ điển địa chất rồi phát đúng nốt nhạc mở đá chuông!', 6, 'Phát nốt cộng hưởng'),
  ]),
  ket(6, [{id: 'lam', dur: 210, el: <G6Lam />, sfx: [[82, 'ding.wav', 0.5]]}, tt(6, 'Phát nốt cộng hưởng', 'Pin đàm: 35%', 'Mở thông lại ngách hang rồi! Nhưng sang Vòm Đàn Đá cổ có những cột đá chuông chưa ghi trong sổ đâu!', [90, 75, 55, 35], 3)]),
  mo(7, [
    {id: 'thu', dur: 185, el: <G7Mo />, sfx: [[68, 'wrong.wav', 0.5]]},
    xe('gai-am-nghe', 'Phiến đàn đá cổ có tần số riêng chưa ghi trong sổ, làm sao biết nốt nào?', 'Nâng cấp tai Sonar đo tần số listen() — lắng nghe giọng ngân tự nhiên của đá rồi phát lại!', 'Cảm biến đo tần số listen()', 125),
    treo('gai-am-nghe', 'Nghe giọng ngân đàn đá bằng listen() rồi phát lại chuẩn xác!', 7, 'Nghe giọng đàn đá'),
  ]),
  ket(7, [{id: 'lam', dur: 210, el: <G7Lam />, sfx: [[90, 'ding.wav', 0.4], [145, 'ding.wav', 0.5]]}, tt(7, 'Nghe giọng đàn đá', 'Pin đàm: 28%', 'Cộng hưởng đàn đá tuyệt diệu! Phía trước có khe vực ngầm và tảng ngọc động tròn giống đá lăn ở mỏ anh Dũng đấy!', [95, 85, 80, 50])]),
  mo(8, [
    {id: 'thu', dur: 185, el: <G8Mo />, sfx: [[60, 'wrong.wav', 0.5]]},
    treo('gai-du', 'Đẩy tảng ngọc động tròn lăn theo máng dốc lấp khe vực ngầm nhé!', 8, 'Lăn ngọc động lấp vực'),
  ]),
  ket(8, [{id: 'lam', dur: 210, el: <G8Lam />, sfx: [[76, 'impact.wav', 0.5], [150, 'ding.wav', 0.5]]}, tt(8, 'Lăn ngọc động lấp vực', 'Pin đàm: 20%', 'Lăn ngọc động khéo quá! Tầng hang cuối chia làm hai tầng khô và ướt, vách đá dày chặn hết sóng bộ đàm rồi!', [100, 90, 85, 70])]),
  mo(9, [
    {id: 'thu', dur: 185, el: <G9Mo />, sfx: [[60, 'wrong.wav', 0.5]]},
    xe('r2', 'Vách đá vôi dày chặn kín sóng radio giữa hai tầng hang, liên lạc sao đây?', 'Gọi R2 ở tầng trên gõ nốt nhạc xuyên vách đá, R1 ở tầng dưới nghe và giải mã bằng dict!', 'R2 truyền mật mã âm thanh', 120),
    treo('gai-du', 'R2 phát mật mã nốt nhạc từ tầng trên, R1 giải mã ở tầng dưới nhé!', 9, 'Phối hợp R2 mật mã âm'),
  ]),
  ket(9, [{id: 'lam', dur: 210, el: <G9Lam />, sfx: [[48, 'pop.wav', 0.4], [126, 'ding.wav', 0.5]]}, tt(9, 'Phối hợp R2 mật mã âm', 'Pin đàm: 15%', 'Truyền mật mã bằng nốt nhạc qua vách đá sáng tạo quá! Giờ mở đợt dẫn đường tổng lực đưa cả đoàn ra cửa hang nhé!', [100, 100, 95, 85])]),
  mo(10, [
    {id: 'tha-tay', dur: 120, el: <ThaTayM7 />, sfx: [W_IN, [50, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'canh-1', dur: 120, el: <Canh1 />, sfx: [[78, 'impact.wav', 0.5], [112, 'ding.wav', 0.4]]},
    {id: 'canh-2', dur: 120, el: <Canh2 />, sfx: [[95, 'ding.wav', 0.5]]},
    tt(10, 'Xuất xưởng Xe thám hiểm', 'Đoàn về trạm 100%!', 'Cả 4 vòm hang đá vôi đã sáng rực đèn tiêu, đoàn khảo sát về trạm an toàn tuyệt đối!', [100, 100, 100, 100]),
    {id: 'xuat-xuong', dur: 150, el: <XuatXuongM7 />, sfx: [[18, 'impact.wav', 0.8], [20, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiM7 />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua8 />, sfx: [[25, 'whoosh-soft.wav', 0.4]]},
  ]),
];
