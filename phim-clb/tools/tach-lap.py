# Tách LỚP PART cho cảnh lắp part trong xe trạm (TrongXe, src/doc/kit-doc.tsx), mùa 2 trở đi (3/11, user "animation ghép part vẫn ko ổn, nhất là
# mùa sau đổi cỡ thân R1 như drone, xuồng"). Trước đây cảnh lắp cắt cứng 42% "phía mũi" của ảnh sau rồi trượt xuống, thân mới (gói 1) thì bộ não
# lab/dau-r1.png giữ cỡ R1 cũ rồi nhảy cỡ lúc CẠCH, drone / nhện (ảnh vốn đứng thẳng) bị xoay -90° nằm ngang.
# Công cụ này đọc danh sách cảnh lắp (xe('<ảnh>' …) trong src/doc/<mùa>.tsx, ảnh trước theo TRUOC_THEO_ANH / TRUOC_THEO_MUA của kit-doc.tsx) và với mỗi cảnh:
#   · kieu 'than' (ảnh trước là bộ não dau-r1): tìm bộ não trong ảnh thân mới (kính mắt xanh → vỏ trắng quanh kính: khung vỏ, phía kính) → dau { x, y, s, goc };
#     lớp = ảnh sau trừ vùng vỏ đầu;
#   · kieu 'part': lớp = các điểm ảnh sau khác ảnh trước (bỏ vùng kính mắt để biểu cảm không bay theo);
#   · kieu 'doi': lớp phủ quá nửa robot (đổi hẳn robot, như robot lai mùa 9) → cảnh đổi robot thay vì ghép part.
# Ra: public/robot/<mùa>/lap/<ảnh>.png + src/doc/lap-part.json ({ lap: { '<mùa>/<ảnh>': {...} }, dung: ['<mùa>/<ảnh>' ảnh vốn đứng thẳng: nhện, drone] }).
#   python tools/tach-lap.py [m4 m5 …]   (chạy từ phim-clb/ sau khi xuất lại ảnh robot; ghi mùa thì chỉ làm lại các mùa đó; vài phút)
import json, os, re, sys
import numpy as np
import cv2
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB, SRC = os.path.join(GOC, 'public'), os.path.join(GOC, 'src')
MUA = ['m2', 'm3', 'cang', 'm4', 'm5', 'm6', 'm7', 'm8']
BO_QUA = {'r2', 'luna-bot'}                                         # cảnh đưa R2 lên bàn (laLapR2): không ghép part
DAU = 'robot/lab/dau-r1.png'

def dung_thang(mua, ten):
    """Ảnh vốn vẽ đứng thẳng theo màn hình (nhện thanDung, drone khongHuong): TrongXe không xoay -90°."""
    if re.match(r'^(nhen|drone|lai-nhen|lai-drone|luna-bot)', ten): return True
    return ten.startswith('r2') and mua in ('cang', 'm4', 'm5', 'm6')

def doc_truoc():
    t = open(os.path.join(SRC, 'doc', 'kit-doc.tsx'), encoding='utf-8').read()
    khoi = re.search(r'const TRUOC_THEO_ANH[^{]*\{(.*?)\n\};', t, re.S).group(1)
    theo_anh = {a or b: c for a, b, c in re.findall(r"^\s*(?:'([^']+)'|([\w-]+)):\s*'([^']+)'", khoi, re.M)}
    theo_mua = {}
    for m, ds in re.findall(r"(\w+):\s*\{([^}]*)\}", re.search(r'const TRUOC_THEO_MUA[^=]*=\s*\{(.*?)\};', t, re.S).group(1)):
        theo_mua[m] = {a or b: c for a, b, c in re.findall(r"(?:'([^']+)'|([\w-]+)):\s*'([^']+)'", ds)}
    return theo_anh, theo_mua

def nap(p):
    return np.asarray(Image.open(os.path.join(PUB, p)).convert('RGBA')).astype(np.float32) / 255

def dem_vuong(a, w):
    """Đặt ảnh a (vuông) vào giữa khung w × w (ảnh tay xoay 922 px rộng hơn 576: cùng tâm, cùng tỉ lệ thân)."""
    if a.shape[0] == w: return a
    o = np.zeros((w, w, 4), np.float32); d = (w - a.shape[0]) // 2
    if d >= 0: o[d:d + a.shape[0], d:d + a.shape[0]] = a; return o
    return a[-d:-d + w, -d:-d + w]

def dau_cua(a):
    """Bộ não R1 trong ảnh a: kính mắt (khối xanh sáng lớn nhất gần tâm) rồi vỏ trắng quanh kính (vùng sáng chạm vòng quanh kính, lấp lỗ, mở 9 px bỏ cần ăng-ten).
       Trả (vỏ, tâm vỏ, (rộng, cao) vỏ, kính, tâm kính) theo điểm ảnh của a. Đầu R1 các thân không cùng tỉ lệ ảnh dau-r1 (drone vỏ vuông hơn, kính dày hơn)
       nên không so khớp cả hình mà khớp KHUNG VỎ và phía của kính."""
    R, G, B, A = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    W = a.shape[0]
    xanh = ((B > 0.7) & (R < 0.45) & (A > 0.5)).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(xanh)
    i = max(range(1, n), key=lambda j: st[j, 4] - 3 * np.hypot(cen[j][0] - W / 2, cen[j][1] - W / 2))
    kinh = cv2.morphologyEx((lab == i).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    sang = ((np.minimum(np.minimum(R, G), B) > 0.55) & (A > 0.6)).astype(np.uint8)
    _, lab2 = cv2.connectedComponents(sang)
    vong = cv2.dilate(kinh, np.ones((31, 31), np.uint8)) & (1 - kinh)
    vo = np.isin(lab2, list(set(np.unique(lab2[vong > 0])) - {0})).astype(np.uint8) | kinh
    vo = cv2.morphologyEx(vo, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    cnt, _ = cv2.findContours(vo, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cnt, key=cv2.contourArea); vo = np.zeros_like(vo); cv2.drawContours(vo, [c], -1, 1, -1)
    x, y, w, h = cv2.boundingRect(c)
    ky, kx = np.nonzero(kinh)
    return vo, (x + w / 2, y + h / 2), (w, h), kinh, (kx.mean(), ky.mean())

def phia(tam, kinh):
    """Phía của kính so với tâm vỏ, đếm theo bước quay ngược kim (np.rot90): 0 = phải, 1 = trên, 2 = trái, 3 = dưới."""
    dx, dy = kinh[0] - tam[0], kinh[1] - tam[1]
    return (0 if dx > 0 else 2) if abs(dx) >= abs(dy) else (1 if dy < 0 else 3)

def khop_dau(anh, dau0):
    """Chỗ đặt ảnh dau-r1 (576 px; dau0 = dau_cua của nó) để bộ não của nó trùng bộ não trong ảnh anh: { x, y (tâm khung dau lệch khỏi tâm ảnh, theo phần
       bề ngang ảnh), s (tỉ lệ co), goc (độ, ngược kim, bội 90) }, kèm vùng vỏ đầu trong anh (xoá khỏi lớp thân)."""
    _, tam0, kt0, _, kinh0 = dau0
    vo, tam1, kt1, _, kinh1 = dau_cua(anh)
    p0, p1 = phia(tam0, kinh0), phia(tam1, kinh1)
    k = (p1 - p0) % 4
    s = (kt1[1] if p1 % 2 == 0 else kt1[0]) / (kt0[1] if p0 % 2 == 0 else kt0[0])    # cỡ theo bề vỏ VUÔNG GÓC hướng mặt (kính sát mép vỏ làm bề dọc đo hụt: drone, nhện)
    dx, dy = kinh0[0] - 288, kinh0[1] - 288                                         # đặt theo TÂM KÍNH (mắt trùng khít): tâm kính so với tâm khung dau 576, quay k bước rồi co s
    for _ in range(k): dx, dy = dy, -dx                                              # np.rot90 ngược kim (trục y xuống): (x, y) → (y, −x)
    W = anh.shape[0]
    cx, cy = kinh1[0] - dx * s, kinh1[1] - dy * s
    return {'x': round(float(cx - W / 2) / W, 4), 'y': round(float(cy - W / 2) / W, 4), 's': round(float(s), 4), 'goc': 90 * k}, vo

def luu(a, p):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), 'RGBA').save(p, optimize=True)

def main():
    theo_anh, theo_mua = doc_truoc()
    dau = nap(DAU)
    dau0 = dau_cua(dau)
    LAP, DUNG, bao = {}, set(), []
    chon = sys.argv[1:] or MUA                                             # python tools/tach-lap.py m4 m5: chỉ làm lại vài mùa, giữ phần còn lại của lap-part.json
    jp = os.path.join(SRC, 'doc', 'lap-part.json')
    if sys.argv[1:] and os.path.exists(jp):
        cu = json.load(open(jp, encoding='utf-8'))
        LAP = {k: v for k, v in cu['lap'].items() if k.split('/')[0] not in chon}; DUNG = {k for k in cu['dung'] if k.split('/')[0] not in chon}
    for mua in chon:
        t = open(os.path.join(SRC, 'doc', mua + '.tsx'), encoding='utf-8').read()
        ds = list(dict.fromkeys(re.findall(r"\bxe\(\s*'([^']+)'", t)))
        thu = os.path.join(PUB, 'robot', mua)
        for ten in os.listdir(thu):
            if ten.endswith('.png') and dung_thang(mua, ten[:-4]): DUNG.add(mua + '/' + ten[:-4])
        for i, anh in enumerate(ds):
            if anh in BO_QUA: continue
            p_sau = f'robot/{mua}/{anh}.png'
            if not os.path.exists(os.path.join(PUB, p_sau)): bao.append(f'THIẾU ảnh sau {p_sau}'); continue
            truoc = theo_mua.get(mua, {}).get(anh) or theo_anh.get(anh) or (ds[i - 1] if i else None)     # bảng thiếu: lấy robot của cảnh lắp ngay trước trong mùa
            p_truoc = f'robot/{mua}/{truoc}.png' if truoc else DAU
            if not os.path.exists(os.path.join(PUB, p_truoc)): bao.append(f'THIẾU ảnh trước {p_truoc} (cho {p_sau})'); continue
            sau = nap(p_sau); W = sau.shape[0]
            muc = {'truoc': p_truoc[len('robot/'):-4], 'rong': W, 'rongTruoc': Image.open(os.path.join(PUB, p_truoc)).width}
            if not truoc:                                                          # thân mới: bộ não dau-r1 → bộ não trong thân
                d, vo = khop_dau(sau, dau0)
                lop = sau.copy()
                lop[cv2.dilate(vo, np.ones((15, 15), np.uint8)) > 0, 3] = 0            # bỏ vỏ đầu và viền đậm của nó: bộ não dau-r1 bay vào chỗ này
                muc.update(kieu='than', dau=d); bao.append(f'{mua}/{anh}: thân mới, bộ não {d}')
            else:
                tr = dem_vuong(nap(p_truoc), W)
                khac = np.abs(sau[..., :3] * sau[..., 3:] - tr[..., :3] * tr[..., 3:]).max(-1) + np.abs(sau[..., 3] - tr[..., 3])
                m = (khac > 0.12).astype(np.uint8)
                m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
                m[cv2.dilate(dau_cua(tr)[3], np.ones((9, 9), np.uint8)) > 0] = 0         # bỏ vùng kính mắt: biểu cảm đổi không tính là part
                m = cv2.dilate(m, np.ones((5, 5), np.uint8))
                phu = m.sum() / max(1, (sau[..., 3] > 0.1).sum())
                lop = sau.copy(); lop[..., 3] *= m
                muc['kieu'] = 'doi' if phu > 0.45 else 'part'
                bao.append(f'{mua}/{anh}: {muc["kieu"]} (lớp phủ {phu:.0%} robot) trước {truoc}')
            if muc['kieu'] != 'doi': luu(lop, os.path.join(PUB, 'robot', mua, 'lap', anh + '.png'))
            LAP[f'{mua}/{anh}'] = muc
    out = {'lap': LAP, 'dung': sorted(DUNG)}
    open(jp, 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    print('\n'.join(bao)); print(len(LAP), 'cảnh lắp,', len(DUNG), 'ảnh đứng thẳng', file=sys.stderr)

sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
main()
