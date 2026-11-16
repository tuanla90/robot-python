// Máy chiếu phim CLB: một phim = danh sách cảnh; tự xếp mốc (hai cảnh chồng XF khung để chuyển cảnh mượt), tiếng nhấn.
// Chép cách làm của engine video giới thiệu diem10code (diem10code-video/src/promo/Promo.tsx), bỏ nhạc / giọng (chưa có).
import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import {C, FONT, Stage, Whip} from './d10';

export const FPS = 30;
const XF = 16;          // khung chồng giữa hai cảnh (crossfade mượt 0.53s)
const LEAD = 8;         // màn chờ ngắn trước cảnh đầu
const SFX_GAIN = 0.55;
const SFX_TRIM: Record<string, number> = {'wrong.wav': 0.12, 'type.wav': 0.55, 'riser.wav': 0.6, 'ding.wav': 0.8};

/** [khung trong cảnh, tệp trong public/sfx, âm lượng, độ dài khung] */
export type Sfx = [number, string, number, number?];
export type Canh = {id: string; dur: number; el: React.ReactNode; sfx?: Sfx[]};
/** doc: khổ dọc 1080×1920 (phim gói theo KICH-BAN-PHIM-GOI-CLB.md); mặc định ngang 1920×1080 */
export type Phim = {id: string; canh: Canh[]; doc?: boolean};

export const W_IN: Sfx = [0, 'whoosh.wav', 0.4];
export const pops = (at: number[], vol = 0.3): Sfx[] => at.map((t) => [t, 'pop.wav', vol] as Sfx);

const xep = (p: Phim) => {
  const starts: number[] = [];
  const end = p.canh.reduce((at, s) => { starts.push(at); return at + s.dur - XF; }, LEAD) + XF;
  return {starts, total: end};
};

const ChieuPhim: React.FC<{phim: Phim}> = ({phim}) => {
  const {starts} = xep(phim);
  const S = phim.canh;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, fontVariantLigatures: 'none'}}>
      <Sequence name="lead" durationInFrames={LEAD + XF}><Stage /></Sequence>
      {S.map((s, i) => (
        <Sequence key={s.id} name={s.id} from={starts[i]} durationInFrames={s.dur}>
          <Whip dur={s.dur} len={XF} first={i === 0} last={i === S.length - 1}>{s.el}</Whip>
        </Sequence>
      ))}
      {S.flatMap((s, i) => (s.sfx || []).map(([at, src, vol, len], k) => (
        <Sequence key={`${s.id}-${k}`} from={starts[i] + at} durationInFrames={len ?? 90} layout="none">
          <Audio src={staticFile(`sfx/${src}`)} volume={vol * SFX_GAIN * (SFX_TRIM[src] ?? 1)} />
        </Sequence>
      )))}
    </AbsoluteFill>
  );
};

/** Một Composition cho mỗi phim (ngang 1920×1080 cùng khổ video diem10code, hay dọc 1080×1920 khi p.doc). Cảnh chứa phần tử React nên không đưa qua defaultProps
 *  (props phải tuần tự hoá được): mỗi phim một component bọc sẵn. */
const BOC = new Map<string, React.FC>();
const boc = (p: Phim) => {
  if (!BOC.has(p.id)) BOC.set(p.id, () => <ChieuPhim phim={p} />);
  return BOC.get(p.id)!;
};
export const CacPhim: React.FC<{ds: Phim[]}> = ({ds}) => (
  <>
    {ds.map((p) => (
      <Composition key={p.id} id={p.id} component={boc(p)} durationInFrames={xep(p).total} fps={FPS} width={p.doc ? 1080 : 1920} height={p.doc ? 1920 : 1080} />
    ))}
  </>
);
