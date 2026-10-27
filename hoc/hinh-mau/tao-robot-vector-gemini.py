# -*- coding: utf-8 -*-
import os
import math
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = r"D:\Users\tuanla2\.gemini\antigravity\brain\53d291e4-091d-49c3-8f73-d844004089ba"
SCRATCH_DIR = os.path.join(OUT_DIR, "scratch")
os.makedirs(SCRATCH_DIR, exist_ok=True)

# ============================================================================
# 1. TRÌNH SINH MÃ SVG THUẦN (MODULAR SVG GENERATOR CHO 5 THÂN, 6 TAY, 4 GÓC, 3 BIỂU CẢM)
# Thiết kế chuẩn theo 2 tấm ảnh mẫu mới:
# - Vòm đầu cầu trắng phúng phính (gradient trắng -> lavender), kính visor nằm sát mép dưới/trước
# - 2 đường gân lavender cong ôm 2 bên trán
# - Ăng-ten cầu hồng trên đỉnh đầu
# - 6 cánh tay dáng cong mềm mại (càng cua cong, nam châm U tròn, muỗng cầu hồng, pháo 3D, tay khớp Z, phễu sơn)
# ============================================================================

SVG_DEFS = """
  <defs>
    <!-- Gradient vòm đầu cầu 3D trắng ngọc -> lavender -->
    <radialGradient id="domeGrad" cx="45%" cy="32%" r="62%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="48%" stop-color="#f4f6fc"/>
      <stop offset="82%" stop-color="#dce2f5"/>
      <stop offset="100%" stop-color="#9ca9d6"/>
    </radialGradient>
    <!-- Gradient kính visor xanh cyan -->
    <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <!-- Gradient mắt phát sáng -->
    <radialGradient id="eyeGrad" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#a5f3fc"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </radialGradient>
    <!-- Gradient cầu hồng (ăng-ten, bóng ném, sơn) -->
    <radialGradient id="pinkBall" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fbcfe8"/>
      <stop offset="75%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#be185d"/>
    </radialGradient>
    <!-- Gradient bánh xe / xích tím than -->
    <linearGradient id="tireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#353b5c"/>
      <stop offset="45%" stop-color="#6470a0"/>
      <stop offset="100%" stop-color="#282c47"/>
    </linearGradient>
    <!-- Ô nền gạch Lab Trắng -->
    <linearGradient id="tileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
  </defs>
"""

INK = "#181a30"
LAV_SEAM = "#a5b4fc"
CYAN_HI = "#67e8f9"
CYAN_MID = "#06b6d4"
PINK_MAIN = "#f472b6"


def svg_base_chassis(loai_than="hai-banh", huong=2):
    """Vẽ phần đế (bánh xe, bánh xích, chân nhện, bánh omni, cánh drone) trong hệ tọa độ tâm (0,0), bán kính thân ~ 28."""
    # Góc xoay của hệ đế: huong=2 (Xuống) là 0 độ, huong=1 (Phải) là -90 độ, huong=0 (Lên) là 180 độ, huong=3 (Trái) là 90 độ
    rot_deg = {2: 0, 1: -90, 0: 180, 3: 90}[huong % 4]
    parts = [f'<g transform="rotate({rot_deg})">']

    if loai_than == "hai-banh":
        for sx in [-1, 1]:
            x0 = sx * 29 - 7
            parts.append(f'<rect x="{x0}" y="-14" width="14" height="34" rx="6" fill="url(#tireGrad)" stroke="{INK}" stroke-width="3.2"/>')
            for ty in [-8, -1, 6, 13]:
                parts.append(f'<rect x="{x0+2.5}" y="{ty}" width="9" height="3.2" rx="1.5" fill="#8592c2" opacity="0.85"/>')
            parts.append(f'<rect x="{x0+1.5}" y="-10" width="2.5" height="24" rx="1" fill="{CYAN_HI}" opacity="0.7"/>')

    elif loai_than == "xich":
        for sx in [-1, 1]:
            x0 = sx * 31 - 10
            parts.append(f'<rect x="{x0}" y="-20" width="20" height="44" rx="7" fill="url(#tireGrad)" stroke="{INK}" stroke-width="3.2"/>')
            for ty in range(-15, 22, 7):
                parts.append(f'<rect x="{x0+2.5}" y="{ty}" width="15" height="4" rx="1.8" fill="#8592c2"/>')
                parts.append(f'<rect x="{x0+5}" y="{ty+0.8}" width="10" height="2.2" rx="1" fill="{CYAN_HI}"/>')

    elif loai_than == "nhen":
        # 4 chân nhện cơ khí trắng, khớp xám-tím, mũi xanh cyan phát sáng
        for sx in [-1, 1]:
            # Cặp chân sau & cặp chân trước
            parts.append(
                f'<path d="M {sx*18},-4 Q {sx*36},-10 {sx*38},10 Q {sx*38},18 {sx*33},18 Q {sx*30},10 {sx*20},4 Z" '
                f'fill="url(#domeGrad)" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
            )
            parts.append(f'<circle cx="{sx*35.5}" cy="15" r="3.5" fill="{CYAN_HI}" stroke="{INK}" stroke-width="2.2"/>')
            parts.append(
                f'<path d="M {sx*16},8 Q {sx*31},12 {sx*29},31 Q {sx*27},36 {sx*22},33 Q {sx*22},20 {sx*14},14 Z" '
                f'fill="url(#domeGrad)" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
            )
            parts.append(f'<circle cx="{sx*25.5}" cy="32" r="3.8" fill="{CYAN_HI}" stroke="{INK}" stroke-width="2.2"/>')

    elif loai_than == "omni":
        for sx in [-1, 1]:
            for sy in [-1, 1]:
                wx, wy = sx * 25, sy * 21
                ang = -40 if sx * sy > 0 else 40
                parts.append(f'<g transform="translate({wx},{wy}) rotate({ang})">')
                parts.append(f'<ellipse cx="0" cy="0" rx="12" ry="9.5" fill="url(#tireGrad)" stroke="{INK}" stroke-width="3"/>')
                parts.append(f'<ellipse cx="0" cy="0" rx="6" ry="4.5" fill="{CYAN_HI}" stroke="#0284c7" stroke-width="2"/>')
                parts.append(f'<line x1="-8" y1="-5" x2="8" y2="5" stroke="{INK}" stroke-width="2"/>')
                parts.append(f'<line x1="-8" y1="5" x2="8" y2="-5" stroke="{INK}" stroke-width="2"/>')
                parts.append('</g>')

    elif loai_than == "drone":
        for sx in [-1, 1]:
            for sy in [-1, 1]:
                rx, ry = sx * 29, sy * 26
                parts.append(f'<line x1="{sx*12}" y1="{sy*10}" x2="{rx}" y2="{ry}" stroke="{INK}" stroke-width="8" stroke-linecap="round"/>')
                parts.append(f'<line x1="{sx*12}" y1="{sy*10}" x2="{rx}" y2="{ry}" stroke="#c4b5fd" stroke-width="3.6" stroke-linecap="round"/>')
                parts.append(f'<circle cx="{rx}" cy="{ry}" r="14" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3"/>')
                parts.append(f'<circle cx="{rx}" cy="{ry}" r="9.5" fill="#1e293b" stroke="{INK}" stroke-width="2"/>')
                # 4 cánh quạt cyan chữ X
                parts.append(f'<path d="M {rx-6},{ry-6} L {rx+6},{ry+6} M {rx-6},{ry+6} L {rx+6},{ry-6}" stroke="{CYAN_HI}" stroke-width="4.2" stroke-linecap="round"/>')
                parts.append(f'<circle cx="{rx}" cy="{ry}" r="3" fill="#ffffff" stroke="{INK}" stroke-width="1.8"/>')

    parts.append('</g>')
    return "\n".join(parts)


def svg_arm(loai_tay=None, huong=2):
    """Vẽ 6 biến thể tay dáng cong theo đúng mẫu mới (xoay theo hướng huong: 2=Xuống, 1=Phải, 0=Lên, 3=Trái)."""
    if not loai_tay:
        return ""
    rot_deg = {2: 0, 1: -90, 0: 180, 3: 90}[huong % 4]
    p = [f'<g transform="rotate({rot_deg})">']

    if loai_tay == "kep":
        # Khớp cổ trắng có chấm đèn cyan + 2 càng cua cong khum ( )
        p.append(f'<ellipse cx="0" cy="24" rx="11" ry="7.5" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3"/>')
        p.append(f'<circle cx="0" cy="24" r="3" fill="{CYAN_HI}"/>')
        for sx in [-1, 1]:
            p.append(
                f'<path d="M {sx*6},28 C {sx*21},32 {sx*22},48 {sx*8},56 L {sx*4},52 C {sx*13},46 {sx*12},35 {sx*3},31 Z" '
                f'fill="url(#domeGrad)" stroke="{INK}" stroke-width="2.8" stroke-linejoin="round"/>'
            )
            p.append(f'<circle cx="{sx*6.5}" cy="53" r="3.2" fill="{CYAN_HI}" stroke="#0284c7" stroke-width="1.5"/>')

    elif loai_tay == "nam-cham":
        p.append(f'<ellipse cx="0" cy="23" rx="11" ry="7" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3"/>')
        # Thân chữ U hồng + 2 đầu cực xanh cyan
        p.append(
            f'<path d="M -14,28 Q 0,24 14,28 L 14,52 Q 14,56 9,56 L 7,56 Q 5,56 5,52 L 5,36 Q 0,34 -5,36 L -5,52 Q -5,56 -7,56 L -9,56 Q -14,56 -14,52 Z" '
            f'fill="#f472b6" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
        )
        for sx in [-1, 1]:
            x_pole = -14 if sx < 0 else 5
            p.append(f'<rect x="{x_pole}" y="44" width="9" height="12" rx="2.5" fill="{CYAN_HI}" stroke="{INK}" stroke-width="2.8"/>')

    elif loai_tay == "nem":
        p.append(f'<ellipse cx="0" cy="23" rx="9" ry="6" fill="url(#domeGrad)" stroke="{INK}" stroke-width="2.8"/>')
        p.append(f'<rect x="-4.5" y="24" width="9" height="22" rx="4" fill="url(#domeGrad)" stroke="{INK}" stroke-width="2.8"/>')
        p.append(f'<circle cx="0" cy="49" r="12.5" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3"/>')
        p.append(f'<circle cx="0" cy="48" r="8" fill="url(#pinkBall)" stroke="#831843" stroke-width="2"/>')

    elif loai_tay == "hoi":
        # Thân pháo trụ 3D + Miệng tròn viền cyan sáng, lòng tối sâu
        p.append(f'<path d="M -12,20 L 12,20 L 14,38 L -14,38 Z" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
        p.append(f'<circle cx="0" cy="25" r="3" fill="{CYAN_HI}"/>')
        p.append(f'<circle cx="0" cy="40" r="13.5" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3.2"/>')
        p.append(f'<circle cx="0" cy="41" r="9.5" fill="{CYAN_HI}" stroke="#0284c7" stroke-width="2.2"/>')
        p.append(f'<circle cx="0" cy="41" r="6" fill="#0f172a"/>')
        # Nòng sau nhỏ ở đuôi
        p.append(f'<rect x="-6" y="-31" width="12" height="8" rx="3" fill="{CYAN_HI}" stroke="{INK}" stroke-width="2.5"/>')

    elif loai_tay == "xoay":
        # Cánh tay 3 khớp tròn đèn cyan uốn chữ Z + 2 ngón kẹp nhỏ
        p.append(f'<path d="M 0,23 L -10,35 L 0,46" fill="none" stroke="{INK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>')
        p.append(f'<path d="M 0,23 L -10,35 L 0,46" fill="none" stroke="#dce2f5" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>')
        for jx, jy, jr in [(0, 23, 7.5), (-10, 35, 6.5), (0, 46, 6.5)]:
            p.append(f'<circle cx="{jx}" cy="{jy}" r="{jr}" fill="url(#domeGrad)" stroke="{INK}" stroke-width="2.8"/>')
            p.append(f'<circle cx="{jx}" cy="{jy}" r="{jr*0.42}" fill="{CYAN_HI}"/>')
        # 2 ngón kẹp ở đầu khớp 3
        p.append(f'<path d="M -4,49 Q -9,56 -2,60 M 4,49 Q 9,56 2,60" fill="none" stroke="{INK}" stroke-width="6.5" stroke-linecap="round"/>')
        p.append(f'<path d="M -4,49 Q -9,56 -2,60 M 4,49 Q 9,56 2,60" fill="none" stroke="{CYAN_HI}" stroke-width="3" stroke-linecap="round"/>')

    elif loai_tay == "son":
        # Phễu nón thuôn nhọn có vòng cyan + giọt sơn hồng bắn tung tóe
        p.append(f'<path d="M -11,21 L 11,21 L 6,41 L -6,41 Z" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>')
        p.append(f'<ellipse cx="0" cy="32" rx="8.5" ry="4" fill="{CYAN_HI}" stroke="#0284c7" stroke-width="1.8"/>')
        p.append(f'<circle cx="0" cy="42" r="5.5" fill="url(#pinkBall)" stroke="{INK}" stroke-width="2.5"/>')
        # Giọt sơn hồng bắn ra
        for dx, dy, r_drop in [(-8, 52, 2.8), (0, 56, 3.4), (8, 51, 2.6), (-4, 61, 2.0), (5, 59, 2.2)]:
            p.append(f'<circle cx="{dx}" cy="{dy}" r="{r_drop}" fill="{PINK_MAIN}"/>')

    p.append('</g>')
    return "\n".join(p)


def svg_dome_head(loai_than="hai-banh", huong=2, bieu_cam="binh-thuong"):
    """Vẽ Vòm Đầu Cầu Tròn 3D + Đường gân Lavender + Kính Visor sát mép + Ăng-ten Hồng theo đúng 4 góc mẫu!"""
    r = 21.5 if loai_than == "drone" else 24.5
    p = []

    # 1. Cây ăng-ten hồng dựng trên đỉnh Bắc của vòm đầu (và thêm chốt nhỏ phía Nam khi nhìn Lên như mẫu số 4 hàng 1)
    ay = -r - 7
    p.append(f'<rect x="-2.2" y="{-r-4}" width="4.4" height="7" rx="2" fill="#cbd5e1" stroke="{INK}" stroke-width="2.4"/>')
    p.append(f'<circle cx="0" cy="{ay}" r="5.2" fill="url(#pinkBall)" stroke="{INK}" stroke-width="2.6"/>')

    # 2. Quả cầu thân chính
    p.append(f'<ellipse cx="0" cy="0" rx="{r}" ry="{r*0.93}" fill="url(#domeGrad)" stroke="{INK}" stroke-width="3.2"/>')
    # Ánh sáng phản chiếu mềm trên đỉnh trán
    p.append(f'<ellipse cx="{-r*0.18}" cy="{-r*0.38}" rx="{r*0.42}" ry="{r*0.22}" fill="#ffffff" opacity="0.65"/>')

    # 3. Đường gân Lavender & Kính Visor theo từng góc nhìn (2: Xuống, 1: Phải, 3: Trái, 0: Lên)
    if huong == 2:
        # Góc 2 (XUỐNG - Mặt trước): Trán trắng rộng ở trên, 2 đường gân cong hai bên, kính visor nằm SÁT MÉP DƯỚI!
        p.append(f'<path d="M {-r*0.48},{-r*0.58} Q {-r*0.65},0 {-r*0.38},{r*0.42}" fill="none" stroke="{LAV_SEAM}" stroke-width="2.6" stroke-linecap="round"/>')
        p.append(f'<path d="M {r*0.48},{-r*0.58} Q {r*0.65},0 {r*0.38},{r*0.42}" fill="none" stroke="{LAV_SEAM}" stroke-width="2.6" stroke-linecap="round"/>')

        vw, vh = r * 1.18, r * 0.56
        vy = r * 0.14
        p.append(f'<rect x="{-vw/2}" y="{vy}" width="{vw}" height="{vh}" rx="{vh/2}" fill="url(#visorGrad)" stroke="#1b4978" stroke-width="2.6"/>')
        ey = vy + vh * 0.52
        ex = vw * 0.25
        if bieu_cam == "binh-thuong":
            p.append(f'<ellipse cx="{-ex}" cy="{ey}" rx="4.2" ry="4.8" fill="url(#eyeGrad)"/>')
            p.append(f'<ellipse cx="{ex}" cy="{ey}" rx="4.2" ry="4.8" fill="url(#eyeGrad)"/>')
        elif bieu_cam == "lo-lang":
            p.append(f'<ellipse cx="{-ex}" cy="{ey+1}" rx="4.2" ry="3.8" fill="url(#eyeGrad)"/>')
            p.append(f'<ellipse cx="{ex}" cy="{ey+1}" rx="4.2" ry="3.8" fill="url(#eyeGrad)"/>')
            p.append(f'<line x1="{-ex-5}" y1="{ey-4}" x2="{-ex+4}" y2="{ey-1}" stroke="#0284c7" stroke-width="2.8" stroke-linecap="round"/>')
            p.append(f'<line x1="{ex+5}" y1="{ey-4}" x2="{ex-4}" y2="{ey-1}" stroke="#0284c7" stroke-width="2.8" stroke-linecap="round"/>')
        elif bieu_cam == "chong-mat":
            for sx in [-1, 1]:
                p.append(f'<circle cx="{sx*ex}" cy="{ey}" r="4.8" fill="none" stroke="#ffffff" stroke-width="2"/>')
                p.append(f'<circle cx="{sx*ex}" cy="{ey}" r="2.0" fill="{PINK_MAIN}"/>')

    elif huong in (1, 3):
        # Góc 1 (PHẢI) hoặc Góc 3 (TRÁI): Kính visor nép sát mép Phải / Trái của khối cầu!
        s = 1 if huong == 1 else -1
        p.append(f'<path d="M {s*2},{-r*0.68} Q {s*r*0.35},0 {s*2},{r*0.68}" fill="none" stroke="{LAV_SEAM}" stroke-width="2.6" stroke-linecap="round"/>')
        vx = s * (r * 0.62) - (7 if s > 0 else 5)
        p.append(f'<rect x="{vx}" y="-8" width="12" height="19" rx="6" fill="url(#visorGrad)" stroke="#1b4978" stroke-width="2.4"/>')
        p.append(f'<ellipse cx="{vx + (7 if s>0 else 5)}" cy="1.5" rx="3.2" ry="4.2" fill="url(#eyeGrad)"/>')

    elif huong == 0:
        # Góc 0 (LÊN - giống hệt mẫu số 4 hàng 1): Kính visor nằm SÁT MÉP TRÊN của khối cầu, lưng trắng tròn ở dưới!
        p.append(f'<path d="M {-r*0.48},{r*0.58} Q {-r*0.65},0 {-r*0.38},{-r*0.42}" fill="none" stroke="{LAV_SEAM}" stroke-width="2.6" stroke-linecap="round"/>')
        p.append(f'<path d="M {r*0.48},{r*0.58} Q {r*0.65},0 {r*0.38},{-r*0.42}" fill="none" stroke="{LAV_SEAM}" stroke-width="2.6" stroke-linecap="round"/>')
        vw, vh = r * 1.12, r * 0.50
        vy = -r * 0.72
        p.append(f'<rect x="{-vw/2}" y="{vy}" width="{vw}" height="{vh}" rx="{vh/2}" fill="url(#visorGrad)" stroke="#1b4978" stroke-width="2.4"/>')
        ey = vy + vh * 0.48
        ex = vw * 0.24
        p.append(f'<ellipse cx="{-ex}" cy="{ey}" rx="3.8" ry="3.8" fill="url(#eyeGrad)"/>')
        p.append(f'<ellipse cx="{ex}" cy="{ey}" rx="3.8" ry="3.8" fill="url(#eyeGrad)"/>')

    return "\n".join(p)


def svg_robot_group(cx, cy, scale=1.0, loai_than="hai-banh", loai_tay=None, huong=2, bieu_cam="binh-thuong"):
    """Ghép hoàn chỉnh 1 robot SVG tại tọa độ (cx, cy) với tỷ lệ scale."""
    out = [f'<g transform="translate({cx},{cy}) scale({scale})">']
    if huong == 0 and loai_tay:
        out.append(svg_arm(loai_tay, huong))
    out.append(svg_base_chassis(loai_than, huong))
    out.append(svg_dome_head(loai_than, huong, bieu_cam))
    if huong != 0 and loai_tay:
        out.append(svg_arm(loai_tay, huong))
    out.append('</g>')
    return "\n".join(out)


def build_full_svg_document():
    W, H = 1420, 1180
    s = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Segoe UI, Arial, sans-serif">',
        SVG_DEFS,
        f'<rect width="{W}" height="{H}" fill="#e2e8f0"/>',
        f'<rect width="{W}" height="82" fill="#181a30"/>',
        '<text x="28" y="36" fill="#ffffff" font-size="22" font-weight="bold">BẢN SVG VECTOR THEO MẪU MỚI: 4 GÓC VÒM ĐẦU + 5 THÂN + 6 TAY CONG + 3 BIỂU CẢM</text>',
        '<text x="28" y="64" fill="#a5f3fc" font-size="14">Định dạng SVG thuần (Vector 100%, phóng to không vỡ nét) — Khớp cùng bố cục và tỷ lệ với bản Pixel mẫu mới</text>',
    ]

    def tile_svg(x, y, sz):
        return (
            f'<rect x="{x}" y="{y}" width="{sz}" height="{sz}" rx="10" fill="url(#tileGrad)" stroke="#cbd5e1" stroke-width="2"/>'
            f'<line x1="{x+12}" y1="{y+sz-12}" x2="{x+sz-12}" y2="{y+12}" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>'
        )

    # --- HÀNG 1: 4 GÓC VÒM ĐẦU + 3 BIỂU CẢM ---
    s.append('<text x="28" y="112" fill="#181a30" font-size="16" font-weight="bold">1. BỐN GÓC VÒM ĐẦU (Phải / Xuống / Trái / Lên) &amp; 3 BIỂU CẢM MẮT (Vui / Lo lắng / Báo lỗi):</text>')
    head_items = [
        ("Góc 1: PHẢI (Đông)", 1, "binh-thuong"),
        ("Góc 2: XUỐNG (Nam)", 2, "binh-thuong"),
        ("Góc 3: TRÁI (Tây)", 3, "binh-thuong"),
        ("Góc 0: LÊN (Bắc)", 0, "binh-thuong"),
        ("Biểu cảm: Vui/Tỉnh", 2, "binh-thuong"),
        ("Biểu cảm: Lo lắng", 2, "lo-lang"),
        ("Biểu cảm: Lỗi/Xoáy", 2, "chong-mat"),
    ]
    for i, (lbl, h_val, bc) in enumerate(head_items):
        bx = 28 + i * 194
        by = 126
        s.append(f'<rect x="{bx}" y="{by}" width="180" height="168" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>')
        s.append(tile_svg(bx + 26, by + 10, 128))
        s.append(svg_robot_group(bx + 90, by + 76, 1.35, "hai-banh", None, h_val, bc))
        s.append(f'<text x="{bx+90}" y="{by+156}" fill="#181a30" font-size="13" font-weight="bold" text-anchor="middle">{lbl}</text>')

    # --- HÀNG 2: 5 BIẾN THỂ THÂN SVG Ở CẢ 4 GÓC NHÌN ---
    s.append('<text x="28" y="326" fill="#181a30" font-size="16" font-weight="bold">2. NĂM BIẾN THỂ THÂN SVG VECTOR (Mỗi thân hiển thị góc chính diện lớn + 4 góc Xuống / Phải / Lên / Trái):</text>')
    than_list = [
        ("hai-banh", "Thân hai bánh"),
        ("xich", "Thân bánh xích"),
        ("nhen", "Thân nhện"),
        ("omni", "Thân omni"),
        ("drone", "Thân drone"),
    ]
    for i, (t_ma, t_ten) in enumerate(than_list):
        bx = 28 + i * 274
        by = 342
        s.append(f'<rect x="{bx}" y="{by}" width="260" height="264" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>')
        s.append(f'<text x="{bx+14}" y="{by+24}" fill="#181a30" font-size="14" font-weight="bold">{t_ten} ({t_ma})</text>')
        # Ô lớn ở trên
        s.append(tile_svg(bx + 14, by + 36, 126))
        s.append(svg_robot_group(bx + 77, by + 100, 1.35, t_ma, None, 2))
        # Ô gắn tay mẫu bên cạnh
        sample_arm = "nam-cham" if t_ma == "drone" else "kep"
        s.append(tile_svg(bx + 148, by + 36, 98))
        s.append(svg_robot_group(bx + 197, by + 78, 0.92, t_ma, sample_arm, 2))
        s.append(f'<text x="{bx+197}" y="{by+150}" fill="#0284c7" font-size="12" text-anchor="middle">+ Tay {sample_arm}</text>')

        # 4 góc ở hàng dưới
        for h_idx, (h_v, h_lbl) in enumerate([(2, "Xuống"), (1, "Phải"), (0, "Lên"), (3, "Trái")]):
            gx = bx + 14 + h_idx * 59
            gy = by + 172
            s.append(tile_svg(gx, gy, 54))
            s.append(svg_robot_group(gx + 27, gy + 28, 0.58, t_ma, None, h_v))
            s.append(f'<text x="{gx+27}" y="{gy+68}" fill="#475569" font-size="11" text-anchor="middle">{h_lbl}</text>')

    # --- HÀNG 3: 6 BIẾN THỂ TAY CONG SVG Ở CẢ 4 GÓC NHÌN ---
    s.append('<text x="28" y="640" fill="#181a30" font-size="16" font-weight="bold">3. SÁU BIẾN THỂ TAY DÁNG CONG SVG VECTOR (4 Góc nhìn: Xuống / Phải / Lên / Trái + Ghép lên thân khác):</text>')
    tay_list = [
        ("kep", "Tay kẹp (gọng cong)"),
        ("nam-cham", "Nam châm chữ U"),
        ("nem", "Máy ném (chén cầu hồng)"),
        ("hoi", "Súng hơi (pháo tròn 3D)"),
        ("xoay", "Tay xoay (khớp chữ Z)"),
        ("son", "Máy sơn (phễu phun hồng)"),
    ]
    for a_idx, (a_ma, a_ten) in enumerate(tay_list):
        col = a_idx % 3
        row = a_idx // 3
        bx = 28 + col * 458
        by = 656 + row * 248
        s.append(f'<rect x="{bx}" y="{by}" width="444" height="234" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>')
        s.append(f'<text x="{bx+14}" y="{by+24}" fill="#181a30" font-size="14" font-weight="bold">{a_ten} — 4 Góc nhìn:</text>')

        offsets_center = {
            2: (0, -8),
            1: (-8, 0),
            0: (0, 8),
            3: (8, 0),
        }
        for h_idx, (h_v, h_lbl) in enumerate([(2, "2: Xuống"), (1, "1: Phải"), (0, "0: Lên"), (3, "3: Trái")]):
            gx = bx + 12 + h_idx * 106
            gy = by + 38
            s.append(tile_svg(gx, gy, 98))
            ox_c, oy_c = offsets_center[h_v]
            s.append(svg_robot_group(gx + 49 + ox_c, gy + 50 + oy_c, 0.90, "hai-banh", a_ma, h_v))
            s.append(f'<text x="{gx+49}" y="{gy+114}" fill="#181a30" font-size="12" text-anchor="middle">{h_lbl}</text>')

        extra = [("xich", "+ Xích"), ("nhen", "+ Nhện"), ("omni", "+ Omni"), ("drone", "+ Drone")]
        for e_idx, (et, elbl) in enumerate(extra):
            gx = bx + 12 + e_idx * 106
            gy = by + 162
            s.append(f'<rect x="{gx}" y="{gy}" width="98" height="62" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>')
            s.append(svg_robot_group(gx + 30, gy + 26, 0.52, et, a_ma, 2))
            s.append(f'<text x="{gx+58}" y="{gy+36}" fill="#475569" font-size="12">{elbl}</text>')

    s.append('</svg>')
    svg_path = os.path.join(OUT_DIR, "robot-concept-mau-moi.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write("\n".join(s))
    return svg_path


if __name__ == "__main__":
    svg_p = build_full_svg_document()
    print("Saved SVG:", svg_p)
