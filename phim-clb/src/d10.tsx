// Bộ dựng chép NGUYÊN từ diem10code-video/src/promo/kit.tsx (30/10, user: "tham khảo cách video của diem10code"), để phim CLB cùng nét
// với video Sola / Luna: Stage, Headline, Mascot + bóng thoại, CodeBox, Shake, Burst, Whip, pop / ease. Sửa bên kia thì chép lại sang đây.
// Luật nhịp và chữ: blog2video/promo/PLAYBOOK.md (mục 5c, 7), video-shotcraft R1 / R3 / Q4.
import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont} from "@remotion/google-fonts/BeVietnamPro";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";
import {icons} from "lucide-react";

export const FONT = `${loadFont("normal", {weights: ["500", "600", "700", "800", "900"], subsets: ["latin", "vietnamese"]}).fontFamily}, sans-serif`;
export const MONO = `${loadMono("normal", {weights: ["500", "700"], subsets: ["latin"]}).fontFamily}, monospace`;

export const C = {
  ink: "#1B1838", soft: "#66628C", faint: "#9A96BD",
  violet: "#6D5DF6", pink: "#E86FC6", mag: "#D857B0", indigo: "#4F46E5", yellow: "#FACC15",
  good: "#0E9F6E", goodBg: "#E7F8F1", bad: "#E5484D", badBg: "#FDECEC", warn: "#E8870E",
  bg: "#F7F6FE", card: "#FFFFFF", rule: "#E4E1F7", tint: "#F2F1FC", codeBg: "#1E1B3A",
  sola: "#38BDF8", solaDeep: "#0284C7", luna: "#F472B6", lunaDeep: "#DB2777",
};
export const GRAD = "linear-gradient(135deg, #6D5DF6 0%, #E86FC6 100%)";
export const CLAMP = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
export const ease = (f: number, [a, b]: [number, number], [x, y]: [number, number], e = Easing.out(Easing.cubic)) =>
  interpolate(f, [a, b], [x, y], {...CLAMP, easing: e});
/** 0 → 1 có nảy, bắt đầu ở khung `at` */
export const pop = (f: number, at: number, fps: number, damping = 12) =>
  spring({frame: f - at, fps, config: {damping, stiffness: 180, mass: 0.6}});
/** mốc vào nhanh dần: n phần tử, khoảng đầu `first`, ngắn dần tới `min` */
export const accel = (n: number, first: number, min: number) => {
  const out: number[] = [];
  let t = 0;
  for (let i = 0; i < n; i++) { out.push(Math.round(t)); t += Math.max(min, first * Math.pow(0.8, i)); }
  return out;
};

export const ACCENT_TEXT: React.CSSProperties = {
  color: "#FDE047",
};

/** Khổ hình: V = dọc 9:16. Mọi cảnh đọc từ đây để tự xếp theo khổ. */
export const useFmt = () => {
  const {width: W, height: H, fps} = useVideoConfig();
  const V = H > W;
  return {W, H, V, fps,
    /** vùng tiêu đề */ headTop: V ? 190 : 84,
    /** tâm vùng minh hoạ */ cx: W / 2, cy: V ? 1020 : 640,
    /** vùng minh hoạ tối đa */ areaW: V ? 1000 : 1400, areaH: V ? 1000 : 700,
  };
};

// ---------------------------------------------------------------- nền

export const Stage: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const {W, H} = useFmt();
  const d = Math.sin(f / 45) * 70;
  const sweep = ((f % 150) / 150) * (W + 1300) - 900;
  const R = Math.max(W, H) * 0.7;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: "hidden"}}>
      <div style={{position: "absolute", width: R, height: R, left: -R * 0.32 + d, top: -R * 0.48 + d * 0.4, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(109,93,246,0.30) 0%, rgba(109,93,246,0) 65%)"}} />
      <div style={{position: "absolute", width: R * 1.08, height: R * 1.08, right: -R * 0.4 - d, bottom: -R * 0.58 - d * 0.3, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,111,198,0.26) 0%, rgba(232,111,198,0) 65%)"}} />
      <div style={{position: "absolute", inset: -200,
        backgroundImage: "linear-gradient(rgba(75,59,211,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(75,59,211,0.06) 1px, transparent 1px)",
        backgroundSize: "80px 80px", transform: `translate(${(f * 1.2) % 80}px, ${(f * 0.6) % 80}px)`,
        maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)"}} />
      <div style={{position: "absolute", top: -300, left: sweep, width: 260, height: H + 700, transform: "rotate(18deg)",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)"}} />
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- chữ

/** Cỡ chữ tự co: 16:9 vừa MỘT dòng, 9:16 vừa tối đa hai dòng. */
export const fitSize = (text: string, W: number, V: boolean, max = V ? 96 : 104) => {
  const n = text.replace(/`/g, "").length;
  return Math.min(max, Math.floor(((W - (V ? 110 : 220)) * (V ? 1.85 : 1)) / (n * 0.56)));
};

/**
 * Tiêu đề chữ to: từng từ ĐẬP vào có nảy. `accent` = từ tô gradient. `out` = khung bắt đầu rút.
 * Từ bọc trong `backtick` hiện kiểu code.
 */
export const Headline: React.FC<{text: string; at: number; out?: number; accent?: string[]; size?: number; top?: number;
  color?: string; weight?: number}> = ({text, at, out, accent = [], size: sizeProp, top: topProp, color = C.ink, weight = 900}) => {
  const f = useCurrentFrame();
  const {W, V, fps, headTop} = useFmt();
  if (f < at - 1 || (out !== undefined && f > out + 10)) return null;
  const size = sizeProp ?? fitSize(text, W, V);
  const top = topProp ?? headTop;
  const words = text.split(" ");
  const leave = out === undefined ? 0 : ease(f, [out, out + 8], [0, 1], Easing.in(Easing.cubic));
  const bare = (s: string) => s.replace(/[.,?!:`]/g, "");
  const isLightText = color.toUpperCase() === "#FFFFFF" || color.toUpperCase() === "#FFF" || color.toUpperCase() === "#F8FAFC";
  const accentColor = isLightText ? "#FDE047" : "#2563EB";
  return (
    <div style={{position: "absolute", top, left: 0, width: W, zIndex: 16, textAlign: "center", textWrap: "balance" as any,
      wordSpacing: size * 0.02, padding: `0 ${V ? 46 : 110}px`, boxSizing: "border-box",
      fontFamily: FONT, fontSize: size, fontWeight: weight, lineHeight: 1.15, letterSpacing: "-0.02em", color,
      textShadow: isLightText ? "0 6px 0 #0F172A, 0 10px 22px rgba(0,0,0,0.45)" : "0 4px 0 rgba(30,27,75,0.16)",
      opacity: 1 - leave, transform: `translateY(${-leave * 50}px)`}}>
      {words.map((w, i) => {
        const p = pop(f, at + i * 2, fps, 11);
        const isCode = w.startsWith("`");
        const isAccent = accent.some((a) => a.split(" ").map(bare).includes(bare(w)));
        return (
          <React.Fragment key={i}>{i > 0 ? " " : null}<span style={{display: "inline-block", opacity: Math.min(1, p * 2.5),
            transform: `translateY(${(1 - p) * size * 0.25}px) scale(${0.85 + 0.15 * p})`, paddingBottom: size * 0.06,
            ...(isAccent ? {color: accentColor} : {}),
            ...(isCode ? {fontFamily: MONO, color: accentColor, background: isLightText ? "#1E293B" : "#E2E8F0", borderRadius: size * 0.18,
              border: `3px solid ${C.ink}`, boxShadow: `0 4px 0 ${C.ink}`,
              padding: `0 ${size * 0.16}px`, fontSize: size * 0.84, lineHeight: 1.3} : {})}}>
            {w.replace(/`/g, "")}
          </span></React.Fragment>
        );
      })}
    </div>
  );
};

/** Dòng phụ dưới tiêu đề: trượt nhẹ lên, không đập từng từ. */
export const Sub: React.FC<{text: string; at: number; out?: number; top?: number; size?: number; color?: string}> =
  ({text, at, out, top: topProp, size: sizeProp, color = "#E2E8F0"}) => {
    const f = useCurrentFrame();
    const {W, V, headTop} = useFmt();
    if (f < at || (out !== undefined && f > out + 10)) return null;
    const size = sizeProp ?? Math.min(V ? 50 : 46, fitSize(text, W, V, 999) * 0.9);
    const top = topProp ?? headTop + (V ? 250 : 134);
    const inP = ease(f - at, [0, 12], [0, 1]);
    const leave = out === undefined ? 0 : ease(f, [out, out + 8], [0, 1], Easing.in(Easing.cubic));
    return (
      <div style={{position: "absolute", top, left: 0, width: W, zIndex: 16, textAlign: "center", textWrap: "balance" as any, padding: `0 ${V ? 60 : 120}px`, boxSizing: "border-box",
        fontFamily: FONT, fontSize: size, fontWeight: 600, color, lineHeight: 1.34, whiteSpace: "pre-line",
        opacity: inP * (1 - leave), transform: `translateY(${(1 - inP) * 20 - leave * 24}px)`}}>
        {text}
      </div>
    );
  };

// ---------------------------------------------------------------- hiệu ứng

export const Shake: React.FC<{hits: number[]; amp?: number; len?: number; children: React.ReactNode}> = ({hits, amp = 14, len = 12, children}) => {
  const f = useCurrentFrame();
  const h = hits.filter((t) => f >= t && f < t + len).pop();
  let x = 0, y = 0;
  if (h !== undefined) {
    const k = 1 - (f - h) / len;
    x = (random(`sx${f}`) - 0.5) * 2 * amp * k;
    y = (random(`sy${f}`) - 0.5) * 2 * amp * k;
  }
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px)`}}>{children}</AbsoluteFill>;
};

export const Burst: React.FC<{at: number; x: number; y: number; color?: string; rays?: number; r?: number; n?: number}> =
  ({at, x, y, color = "#B45FD8", rays, r = 170, n}) => {
    const f = useCurrentFrame();
    const p = ease(f, [at, at + 16], [0, 1]);
    if (f < at || f > at + 18) return null;
    const count = rays ?? n ?? 12;
    return (
      <svg style={{position: "absolute", left: x - r * 1.4, top: y - r * 1.4, width: r * 2.8, height: r * 2.8, overflow: "visible", pointerEvents: "none", zIndex: 25}}>
        {Array.from({length: count}, (_, i) => {
          const a = (i / count) * Math.PI * 2 + 0.2;
          const r0 = r * (0.35 + 0.65 * p), r1 = r * (0.55 + 0.85 * p), c = r * 1.4;
          return <line key={i} x1={c + Math.cos(a) * r0} y1={c + Math.sin(a) * r0} x2={c + Math.cos(a) * r1} y2={c + Math.sin(a) * r1}
            stroke={color} strokeWidth={10 * (1 - p) + 1} strokeLinecap="round" opacity={1 - p} />;
        })}
        <circle cx={r * 1.4} cy={r * 1.4} r={r * 1.2 * p} fill="none" stroke={color} strokeWidth={6 * (1 - p)} opacity={1 - p} />
      </svg>
    );
  };

/** Chuyển cảnh mượt (cross-dissolve): cảnh sau hiện dần êm lên trên cảnh trước, giữ nguyên nền khi hai cảnh cùng sân. */
export const Whip: React.FC<{dur: number; len: number; first?: boolean; last?: boolean; children: React.ReactNode}> =
  ({dur, len, first, last, children}) => {
    const f = useCurrentFrame();
    // 2/11 (user: chuyển cảnh thấy hai xe đè nhau): cảnh cũ TẮT ngay khi đoạn chồng bắt đầu, cảnh mới hiện dần nhanh (10 khung) trên nền
    const inP = first ? 1 : ease(f, [0, Math.min(10, len)], [0, 1], Easing.out(Easing.cubic));
    const outP = last || f < dur - len ? 1 : 0;
    return (
      <AbsoluteFill style={{opacity: inP * outP}}>
        {children}
      </AbsoluteFill>
    );
  };

// ---------------------------------------------------------------- khung minh hoạ

/**
 * Vùng minh hoạ: con bên trong vẽ theo toạ độ riêng w×h (px), Area tự đặt giữa vùng minh hoạ
 * và thu nhỏ cho vừa khổ. Nhờ vậy một cảnh chỉ vẽ một lần cho cả 16:9 và 9:16.
 */
export const Area: React.FC<{w: number; h: number; dy?: number; children: React.ReactNode}> = ({w, h, dy = 0, children}) => {
  const {cx, cy, areaW, areaH, V} = useFmt();
  const s = Math.min(V ? 1.15 : 1.2, areaW / w, areaH / h);
  return (
    <div style={{position: "absolute", left: cx - w / 2, top: cy + dy - h / 2, width: w, height: h, transform: `scale(${s})`,
      transformOrigin: "50% 50%", fontFamily: FONT}}>
      {children}
    </div>
  );
};

export const panel: React.CSSProperties = {
  position: "absolute", background: C.card, borderRadius: 24, boxSizing: "border-box",
  boxShadow: "0 30px 80px rgba(34,26,102,0.16), 0 2px 6px rgba(34,26,102,0.06)", border: `1px solid ${C.rule}`,
};

/** Icon Lucide theo tên ("BookOpen", "Code"…), không dùng emoji. */
const ICON_ALIAS: Record<string, string> = {
  Home: "School",
  Waves: "Ship",
  AlertTriangle: "TriangleAlert",
  CheckCircle: "CircleCheck",
};

export const Icon: React.FC<{name: string; size?: number; color?: string; stroke?: number}> = ({name, size = 32, color = C.violet, stroke = 2.2}) => {
  const key = ICON_ALIAS[name] ?? name;
  const Ico = (icons as Record<string, React.FC<any>>)[key] ?? icons.Circle;
  return <Ico size={size} color={color} strokeWidth={stroke} />;
};

/** Hiện dần bằng nảy (scale + mờ → rõ). */
export const PopIn: React.FC<{at: number; from?: number; style?: React.CSSProperties; children: React.ReactNode; dy?: number}> =
  ({at, from = 0.6, style, children, dy = 30}) => {
    const f = useCurrentFrame();
    const {fps} = useVideoConfig();
    const p = pop(f, at, fps);
    if (f < at) return null;
    return <div style={{...style, opacity: Math.min(1, p * 2), transform: `${style?.transform ?? ""} translateY(${(1 - p) * dy}px) scale(${from + (1 - from) * p})`}}>{children}</div>;
  };

// ---------------------------------------------------------------- code

const KW = /^(for|in|if|elif|else|while|def|return|print|range|and|or|not|True|False|None|import|from|len|SELECT|FROM|WHERE|COUNT)$/;
/**
 * Tô màu một dòng code. `lang` (22/10, lớp 12): "html" tô thẻ, thuộc tính, chuỗi, chú thích <!-- -->; "css" tô bộ chọn, thuộc tính,
 * giá trị, dấu ngoặc; mặc định kiểu Python / SQL như cũ.
 */
export const codeLine = (line: string, lang = "python"): React.ReactNode[] => {
  if (lang === "html") return dongHtml(line);
  if (lang === "css") return dongCss(line);
  const out: React.ReactNode[] = [];
  const re = /(#.*$)|("[^"]*"|'[^']*')|(\b\d+\b)|(\b[A-Za-z_]+\b)|(<=|>=|==|!=)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [t, cm, str, num, word, op] = m;
    const color = cm ? "#94A3B8" : str ? "#7DD3FC" : num ? "#38BDF8" : op ? "#E2E8F0" : word && KW.test(word) ? "#38BDF8" : "#FFFFFF";
    out.push(<span key={k++} style={{color}}>{t}</span>);
    last = re.lastIndex;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
};

const MAU_CODE = {the: "#F9A8D4", thuocTinh: "#FDBA74", chuoi: "#86EFAC", chu: "#F4F3FF", ngoac: "#8B87B3", chon: "#C4B5FD", gt: "#67E8F9", chuThich: "#8B87B3"};
const manh = (out: React.ReactNode[], t: string, color: string) => out.push(<span key={out.length} style={{color}}>{t}</span>);

/** HTML: <!-- chú thích -->, dấu < </ > và tên thẻ, tên thuộc tính, "giá trị", phần chữ giữa thẻ. */
function dongHtml(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(<!--.*?-->|<!--.*$)|(<\/?)([a-zA-Z][\w-]*)|(\/?>)|("[^"]*"|'[^']*')|(\b[a-zA-Z-]+)(?==)/g;
  let last = 0, trongThe = false, m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) manh(out, line.slice(last, m.index), trongThe ? MAU_CODE.ngoac : MAU_CODE.chu);
    const [t, cm, mo, ten, dong, str, attr] = m;
    if (cm) manh(out, t, MAU_CODE.chuThich);
    else if (mo) { manh(out, mo, MAU_CODE.ngoac); manh(out, ten, MAU_CODE.the); trongThe = true; }
    else if (dong) { manh(out, t, MAU_CODE.ngoac); trongThe = false; }
    else if (str) manh(out, t, trongThe ? MAU_CODE.chuoi : MAU_CODE.chu);
    else if (attr) manh(out, t, trongThe ? MAU_CODE.thuocTinh : MAU_CODE.chu);
    last = re.lastIndex;
  }
  if (last < line.length) manh(out, line.slice(last), trongThe ? MAU_CODE.ngoac : MAU_CODE.chu);
  return out;
}

/** CSS: bộ chọn (trước {), tên thuộc tính (trước :), giá trị (sau :), dấu { } ; và chú thích. */
function dongCss(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const cm = line.indexOf("/*");
  const chinh = cm >= 0 ? line.slice(0, cm) : line, chuThich = cm >= 0 ? line.slice(cm) : "";
  const mTt = /^(\s*)([a-zA-Z-]+)(\s*:\s*)([^;{}]*)(;?)(.*)$/.exec(chinh);
  if (mTt && !chinh.includes("{")) {
    const [, le, tt, hai, gt, cham, con] = mTt;
    if (le) out.push(le);
    manh(out, tt, MAU_CODE.thuocTinh); manh(out, hai, MAU_CODE.ngoac); manh(out, gt, MAU_CODE.gt); manh(out, cham, MAU_CODE.ngoac);
    if (con) manh(out, con, MAU_CODE.ngoac);
  } else {
    for (const p of chinh.split(/([{}])/)) if (p) manh(out, p, p === "{" || p === "}" ? MAU_CODE.ngoac : MAU_CODE.chon);
  }
  if (chuThich) manh(out, chuThich, MAU_CODE.chuThich);
  return out;
}

/** Khung soạn code nền tối, gõ dần từ khung `typeAt` (`cps` ký tự/khung). `mark` = chuỗi cần khoanh đỏ từ khung `markAt`. */
export const CodeBox: React.FC<{lines: string[]; x: number; y: number; w: number; size?: number; typeAt?: number; cps?: number;
  title?: string; mark?: string; markAt?: number; hl?: number; hlAt?: number}> =
  ({lines, x, y, w, size: sizeProp = 34, typeAt, cps = 1.2, title = "main.py", mark, markAt = 0, hl, hlAt = 0}) => {
    const f = useCurrentFrame();
    const {V} = useFmt();
    const boxX = V && x === 110 && w === 860 ? 54 : x;
    const boxW = V && x === 110 && w === 860 ? 972 : w;
    const maxLen = Math.max(1, ...lines.map((l) => l.length));
    const size = Math.min(sizeProp, Math.floor((boxW - 90) / (maxLen * 0.61)));
    let budget = typeAt === undefined ? Infinity : Math.max(0, (f - typeAt) * cps);
    const shown = lines.map((l) => { const s = l.slice(0, Math.max(0, budget)); budget -= l.length + 1; return s; });
    const typing = typeAt !== undefined && budget < 0;
    const lh = size * 1.55;
    return (
      <div style={{...panel, left: boxX, top: y, width: boxW, background: "#0F172A", borderRadius: 24,
        border: `5px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}, 0 18px 34px rgba(0,0,0,0.42)`,
        padding: `${size * 1.95}px ${size * 0.8}px ${size * 0.8}px`, zIndex: 12}}>
        <div style={{position: "absolute", top: size * 0.5, left: size * 0.75, right: size * 0.75, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <div style={{display: "flex", gap: 10, alignItems: "center"}}>
            {["#EF4444", "#FACC15", "#22C55E"].map((c) => <div key={c} style={{width: 15, height: 15, borderRadius: 8, background: c, border: "2px solid #0F172A"}} />)}
            <span style={{marginLeft: 8, fontFamily: MONO, fontSize: size * 0.62, fontWeight: 800, color: "#38BDF8", whiteSpace: "nowrap"}}>{title}</span>
          </div>
          <span style={{padding: "2px 10px", borderRadius: 8, background: "#1E293B", border: "1.5px solid #38BDF8", fontFamily: MONO, fontSize: size * 0.46, fontWeight: 800, color: "#FDE047"}}>PYTHON</span>
        </div>
        {shown.map((l, i) => {
          const full = lines[i];
          const mi = mark ? full.indexOf(mark) : -1;
          const markP = mi >= 0 && f >= markAt ? ease(f, [markAt, markAt + 8], [0, 1]) : 0;
          const hlOn = hl === i && f >= hlAt;
          return (
            <div key={i} style={{fontFamily: MONO, fontSize: size, fontWeight: 700, lineHeight: `${lh}px`, height: lh, color: "#FFFFFF", whiteSpace: "pre", position: "relative",
              background: hlOn ? "rgba(56,189,248,0.22)" : undefined, borderLeft: hlOn ? "4px solid #38BDF8" : "4px solid transparent",
              margin: `0 -${size * 0.3}px`, padding: `0 ${size * 0.3}px`, borderRadius: 8}}>
              <span style={{color: "#94A3B8", marginRight: size * 0.8}}>{i + 1}</span>
              {codeLine(l)}
              {typing && l.length < full.length && shown[i + 1] === "" ? <span style={{background: "#38BDF8", marginLeft: 2}}>&nbsp;</span> : null}
              {markP > 0 && (
                <span style={{position: "absolute", top: 2, height: lh - 4, borderRadius: 8, border: `3px solid #F87171`,
                  left: size * 0.3 + size * 0.6 * (String(i + 1).length + 0) + size * 0.8 + mi * size * 0.6 - 6,
                  width: mark!.length * size * 0.6 + 12, opacity: markP, transform: `scale(${1.2 - 0.2 * markP})`,
                  background: "rgba(239,68,68,0.18)"}} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

// ---------------------------------------------------------------- logo

/** Dấu </> của Điểm 10 Code (lấy từ favicon của app), vẽ nét từ khung `at`. */
export const LogoMark: React.FC<{size: number; at?: number}> = ({size, at = 0}) => {
  const f = useCurrentFrame();
  const d = (a: number) => ease(f, [at + a, at + a + 14], [60, 0]);
  const box = ease(f, [at, at + 10], [0.4, 1], Easing.out(Easing.back(2)));
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={{overflow: "visible"}}>
      <rect width="64" height="64" rx="14" fill={C.indigo} transform={`translate(32 32) scale(${box}) translate(-32 -32)`} />
      <path d="M23 22 14 32l9 10" fill="none" stroke="#fff" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={d(6)} />
      <path d="M41 22l9 10-9 10" fill="none" stroke="#fff" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={d(10)} />
      <path d="M35 18 29 46" fill="none" stroke={C.yellow} strokeWidth={5.5} strokeLinecap="round" strokeDasharray={60} strokeDashoffset={d(16)} />
    </svg>
  );
};

export const Wordmark: React.FC<{size: number}> = ({size}) => (
  <span style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color: C.ink, letterSpacing: "-0.03em", whiteSpace: "nowrap"}}>
    Điểm <span style={ACCENT_TEXT}>10</span> Code
  </span>
);

// ---------------------------------------------------------------- Sola / Luna

export type Who = "sola" | "luna";
const FACES: Record<Who, string[]> = {
  sola: ["adore", "angry", "calm", "celebrate-jump", "celebrate", "cheer", "confident", "confused", "crying", "facepalm", "grateful", "great-job",
    "happy", "hope", "love-heart", "love", "neutral", "sad", "serious", "shocked", "shy", "sleeping", "standing", "thinking", "thumbs-up", "tired", "upset", "wave", "worried",
    "explaining", "wink", "reading", "thinking-sach", "confused-sach"],
  luna: ["adore", "angry", "calm", "celebrate", "cheer", "confident", "confused", "crying", "explaining", "facepalm", "grateful", "great-job", "happy",
    "love-heart", "love", "magnifier", "reading", "sad", "shocked", "shy", "sleeping", "surprised", "thinking", "thumbs-up", "upset", "wave", "wink", "worried",
    "serious", "surprised-sach", "confused-sach", "confident-sach"],
};
const ALIAS: Record<string, string> = {wink: "confident", explaining: "wave", reading: "thinking", magnifier: "thinking", surprised: "shocked",
  "celebrate-jump": "celebrate", standing: "calm", neutral: "calm", hope: "grateful"};
export const faceSrc = (who: Who, face: string) => {
  const name = FACES[who].includes(face) ? face : FACES[who].includes(ALIAS[face]) ? ALIAS[face] : "happy";
  return staticFile(`mascot/${who}/${name}.png`);
};

/** Huy hiệu cảm xúc SVG nảy bên đầu nhân vật theo biểu cảm mặt hiện tại. */
const BieuCamSvg: React.FC<{face: string; since: number; ben: "trai" | "phai"}> = ({face, since, ben}) => {
  const s = Math.min(1, since / 6) * (1 + Math.sin(since / 5) * 0.08);
  const pos: React.CSSProperties = {position: "absolute", top: 18, [ben === "trai" ? "left" : "right"]: 6, width: 64, height: 64,
    transform: `scale(${s}) rotate(${(ben === "trai" ? -12 : 12) + Math.sin(since / 4) * 6}deg)`, pointerEvents: "none"};
  if (["shocked", "surprised", "surprised-sach", "angry"].includes(face)) {
    return (
      <svg viewBox="0 0 64 64" style={pos}>
        <circle cx="32" cy="32" r="26" fill={C.bad} stroke="#fff" strokeWidth="4" />
        <path d="M32 16v18M32 44v2" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }
  if (["worried", "sad", "crying", "facepalm", "tired", "upset"].includes(face)) {
    return (
      <svg viewBox="0 0 64 64" style={{...pos, transform: `translateY(${(since % 24) * 0.6}px) scale(${s})`}}>
        <path d="M32 10 C42 26 48 34 48 42 A16 16 0 1 1 16 42 C16 34 22 26 32 10 Z" fill="#38BDF8" stroke="#fff" strokeWidth="4" />
        <path d="M26 38 A6 6 0 0 0 30 46" fill="none" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (["thinking", "thinking-sach", "confused", "confused-sach", "magnifier", "reading"].includes(face)) {
    return (
      <svg viewBox="0 0 64 64" style={pos}>
        <circle cx="32" cy="32" r="26" fill={C.yellow} stroke="#fff" strokeWidth="4" />
        <path d="M25 24a7 7 0 1 1 10 6.3c-2 1-3 2.2-3 4.7M32 44v1" fill="none" stroke={C.ink} strokeWidth="5.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (["celebrate", "celebrate-jump", "cheer", "great-job", "thumbs-up", "love", "love-heart", "adore", "grateful", "hope"].includes(face)) {
    return (
      <svg viewBox="0 0 64 64" style={pos}>
        <path d="M32 6 L39 23 L57 25 L43 37 L47 55 L32 45 L17 55 L21 37 L7 25 L25 23 Z" fill={C.yellow} stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (["explaining", "confident", "confident-sach", "wink"].includes(face)) {
    return (
      <svg viewBox="0 0 64 64" style={pos}>
        <circle cx="32" cy="32" r="24" fill={C.good} stroke="#fff" strokeWidth="4" />
        <path d="M22 33l7 7 14-15" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
};

export type Say = {at: number; out: number; text: string};
/**
 * Sola / Luna: nảy lên từ đáy ở khung `at`, nhún nhẹ, đổi mặt theo `faces` ([khung, mặt]),
 * nói bằng bóng thoại chữ (`says`). `x` = tâm ngang, `bottom` = đáy nhân vật tính từ đáy khung.
 */
export const Mascot: React.FC<{who: Who; x: number; h: number; at: number; faces: [number, string][]; says?: Say[]; bottom?: number;
  out?: number; bubbleW?: number; side?: "left" | "right"; /** đặt bóng thoại ở toạ độ y này (khi vùng trên đầu nhân vật bị panel chiếm) */ bubbleTop?: number;
  /** số vòng của nhịp nhún (mặc định theo khung hiện tại); bài giảng truyền đồng hồ theo đoạn để render theo đoạn */ bobPha?: number;
  /** lật ngang ảnh (Luna đứng góc phải nhìn vào giữa khung) */ lat?: boolean}> =
  ({who, x, h, at, faces, says = [], bottom = -h * 0.04, out, bubbleW, side, bubbleTop, bobPha, lat}) => {
    const f = useCurrentFrame();
    const {H, fps, V} = useFmt();
    if (f < at) return null;
    const p = pop(f, at, fps, 10);
    const cur = [...faces].filter(([t]) => f >= t).pop() ?? faces[0];
    const since = f - cur[0];
    const squash = since < 10 ? 1 + Math.sin((since / 10) * Math.PI) * 0.09 : 1;
    const bob = (bobPha === undefined ? Math.sin((f + (who === "luna" ? 20 : 0)) / 8) : Math.sin(2 * Math.PI * bobPha + (who === "luna" ? 20 : 0) / 8)) * 7;
    const leave = out === undefined ? 0 : ease(f, [out, out + 10], [0, 1], Easing.in(Easing.cubic));
    const deep = who === "sola" ? C.solaDeep : C.lunaDeep;
    const say = says.find((s) => f >= s.at && f < s.out + 6);
    const sp = say ? ease(f, [say.at, say.at + 8], [0, 1], Easing.out(Easing.back(1.6))) * (1 - ease(f, [say.out, say.out + 6], [0, 1])) : 0;
    const bw = bubbleW ?? (V ? 590 : 470);
    const sd = side ?? (who === "sola" ? "right" : "left");
    const top = H - bottom - h;
    const badgeBg = who === "sola" ? "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)" : "linear-gradient(135deg, #F472B6 0%, #9333EA 100%)";
    const borderCol = "#1B1838";
    return (
      <>
        <div style={{position: "absolute", left: x - h * 0.45, top: top + (1 - p) * h * 0.7 + leave * h + bob, width: h * 0.9, height: h,
          transform: `scale(${(2 - squash) * (0.7 + 0.3 * p)}, ${squash * (0.7 + 0.3 * p)})`, transformOrigin: "50% 100%", opacity: Math.min(1, p * 2)}}>
          <Img src={faceSrc(who, cur[1])} style={{width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%",
            filter: "drop-shadow(0 14px 18px rgba(27,24,56,0.36))", transform: lat ? "scaleX(-1)" : undefined}} />
          <BieuCamSvg face={cur[1]} since={since} ben={lat ? "trai" : "phai"} />
        </div>
        {say && sp > 0.01 && (
          <div style={{position: "absolute", top: (bubbleTop ?? top - (V ? 44 : 22)) - 30 * (1 - sp), width: bw,
            left: sd === "right" ? x + h * 0.06 : x - h * 0.06 - bw, opacity: sp, transform: `scale(${0.82 + 0.18 * sp})`,
            transformOrigin: sd === "right" ? "0% 100%" : "100% 100%", zIndex: 15}}>
            {/* Nhãn tên nhân vật phong cách Game / Comic */}
            <div style={{position: "absolute", bottom: "100%", [sd === "right" ? "left" : "right"]: 22,
              transform: `translateY(48%) rotate(${sd === "right" ? -2 : 2}deg)`,
              background: badgeBg, color: "#FFFFFF", border: `4px solid ${borderCol}`, fontWeight: 900, fontSize: V ? 23 : 20,
              padding: "5px 18px", borderRadius: 14, zIndex: 3, fontFamily: FONT, letterSpacing: "0.04em", whiteSpace: "nowrap",
              boxShadow: `0 5px 0 ${borderCol}`, display: "inline-flex", alignItems: "center", gap: 8}}>
              <span style={{width: 10, height: 10, borderRadius: "50%", background: "#FDE047", border: `2px solid ${borderCol}`}} />
              <span>{who === "sola" ? "SOLA · TEAM CODE" : "LUNA · TEAM ĐỘ BOT"}</span>
            </div>
            {/* Hộp thoại hoạt hình 3D viền đậm + bóng cứng */}
            <div style={{position: "relative", background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
              border: `5px solid ${borderCol}`, borderRadius: 28, padding: V ? "28px 26px 20px" : "22px 24px 16px",
              fontFamily: FONT, fontWeight: 800, fontSize: V ? 34 : 30, color: borderCol, lineHeight: 1.32, textWrap: "balance" as any,
              boxShadow: `0 10px 0 ${borderCol}, 0 18px 32px rgba(15,23,42,0.32), inset 0 4px 0 ${who === "sola" ? "#E0F2FE" : "#FCE7F3"}`}}>
              {say.text}
              {/* Đuôi bóng thoại comic trỏ về phía nhân vật */}
              {/* 2/11: đuôi to hơn, vượt qua dải bóng cứng 10px; lớp bóng lệch 10px như hộp, phần nền trắng phủ viền hộp chỗ nối */}
              <svg width="48" height="50" viewBox="0 0 48 50" style={{position: "absolute", bottom: -48,
                [sd === "right" ? "left" : "right"]: 34, transform: sd === "right" ? undefined : "scaleX(-1)", overflow: "visible"}}>
                <path d="M 6 0 L 10 48 L 44 0 Z" transform="translate(0 10)" fill={borderCol} />
                <path d="M 6 0 L 10 48 L 44 0 Z" fill="#F8FAFC" />
                <path d="M 6 4 L 10 48 L 44 4" fill="none" stroke={borderCol} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}
      </>
    );
  };

/** Nhãn nhỏ ở đáy: "Minh hoạ dựng từ giao diện thật…" (luật trung thực của PLAYBOOK). */
export const Note: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  const {W, H, V} = useFmt();
  return (
    <div style={{position: "absolute", left: 0, width: W, top: H - (V ? 64 : 46), textAlign: "center", fontFamily: FONT, fontSize: V ? 22 : 18,
      fontWeight: 600, color: C.faint, opacity: ease(f, [10, 30], [0, 0.9])}}>
      {text}
    </div>
  );
};
