# Ghép các ảnh mùa (đi từ trên xuống) thành MỘT ảnh dài, chỗ nối dùng ĐƯỜNG CẮT TỐI ƯU thay cho hoà mờ cả dải:
# trong vùng chồng nhau, quy hoạch động tìm đường cắt ngang (mỗi cột một hàng, lệch tối đa 1 hàng giữa hai cột kề) đi qua
# chỗ hai ảnh giống nhau nhất (thường là cỏ trống), trên đường cắt lấy ảnh trên, dưới lấy ảnh dưới, viền mềm vài px.
# Nhờ vậy không còn cây / nhà "ma" chồng mờ lên nhau như khi hoà mờ.
# python tools/noi-mua.py <ra.jpg> <chồng px> <ảnh mùa 1> <ảnh mùa 2> ...   → in JSON {cao, y_mua: [đỉnh mỗi mùa trong ảnh dài]}
import json, sys
import numpy as np
from PIL import Image, ImageFilter

ra, CHONG, ds = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
anh = [np.asarray(Image.open(p).convert('RGB')).astype(np.float32) for p in ds]
H, W = anh[0].shape[:2]
MEM = 6                                                     # viền mềm (px) hai bên đường cắt

def duong_cat(tren, duoi, tran=None):
    """tren, duoi: vùng chồng (CHONG × W × 3). Trả về mảng hàng cắt cho từng cột; tran: không cắt dưới hàng này."""
    sai = np.abs(tren - duoi).sum(-1)
    sai = np.asarray(Image.fromarray(np.clip(sai / 3, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float32)
    sai[:12] += 1e4; sai[-12:] += 1e4                         # đừng cắt sát mép vùng chồng
    if tran is not None: sai[tran:] += 1e4
    tong = sai.copy()
    for x in range(1, W):
        trai = tong[:, x - 1]
        tot = np.minimum(np.minimum(trai, np.r_[np.inf, trai[:-1]]), np.r_[trai[1:], np.inf])
        tong[:, x] += tot
    hang = np.zeros(W, int)
    hang[-1] = int(np.argmin(tong[:, -1]))
    for x in range(W - 2, -1, -1):
        y = hang[x + 1]
        lo, hi = max(0, y - 1), min(CHONG, y + 2)
        hang[x] = lo + int(np.argmin(tong[lo:hi, x]))
    return hang

def mat_duong(a):
    mx, mn = a.max(-1), a.min(-1)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return ((mx - mn < 42) & (mx > 95) & (mx < 190) & (b >= g - 4) & (g >= r - 4)) | ((mn > 215) & (mx - mn < 25))

def tam_duong(a, y):
    """Tâm mặt đường ở hàng y (dải mặt đường rộng 30..260 px gần giữa ảnh nhất), None nếu không thấy."""
    xs = np.flatnonzero(mat_duong(a[y:y + 1])[0])
    if xs.size == 0: return None
    dai = [d for d in np.split(xs, np.flatnonzero(np.diff(xs) > 4) + 1) if 30 <= d.size <= 260]
    if not dai: return None
    return min((d.mean() for d in dai), key=lambda c: abs(c - W / 2))

def tam_tb(a, y0, y1):
    ds = [c for c in (tam_duong(a, y) for y in range(y0, y1, 4)) if c is not None]
    return float(np.median(ds)) if ds else None

def nan_ngang(a, lech, dai_nan=420, giu=0, vong=False):
    """Uốn ảnh dưới: các hàng trên cùng dịch ngang `lech` px (giữ nguyên tới hàng `giu`), giảm mượt về 0 ở hàng `dai_nan`
    (để đường hai ảnh khớp nhau). vong: hàng dịch quấn vòng (dải đất cày sọc ngang, quấn không lộ), không kéo mép."""
    out = a.copy()
    xs = np.arange(W)
    for y in range(min(dai_nan, a.shape[0])):
        t = max(0, y - giu) / (dai_nan - giu); k = lech * (1 - (3 * t * t - 2 * t * t * t))
        if abs(k) < 0.3: continue
        src = np.mod(xs - k, W - 1) if vong else np.clip(xs - k, 0, W - 1)
        x0 = np.floor(src).astype(int); x1 = np.minimum(x0 + 1, W - 1); f = (src - x0)[:, None]
        out[y] = a[y, x0] * (1 - f) + a[y, x1] * f
    return out

cao = H * len(anh) - CHONG * (len(anh) - 1)
dai = np.zeros((cao, W, 3), np.float32)
y_mua = []
for k, a in enumerate(anh):
    y0 = k * (H - CHONG)
    y_mua.append(y0)
    if k == 0:
        dai[y0:y0 + H] = a
        continue
    tren = dai[y0:y0 + CHONG].copy()
    # khớp đường: đo tâm mặt đường ở giữa vùng chồng của hai ảnh, uốn ảnh dưới cho trùng (đường không bị "gãy" ở vết cắt)
    ca, cb = tam_tb(tren, CHONG // 3, 2 * CHONG // 3), tam_tb(a, CHONG // 3, 2 * CHONG // 3)
    tran = None
    if ca is not None and cb is not None and abs(ca - cb) < 160:
        if abs(ca - cb) < 50: a = nan_ngang(a, ca - cb)
        else:
            # lệch nhiều (vd đường bãi tái chế ra lệch phải): chỉ uốn trong vùng chồng (dải đất cày sọc ngang ở đỉnh ảnh dưới,
            # dịch ngang không lộ), đường thành một khúc cua; đường cắt phải nằm ở phần đã dịch đủ
            GIU = CHONG * 2 // 5; tran = GIU - 8
            a = nan_ngang(a, ca - cb, dai_nan=CHONG + 20, giu=GIU, vong=True)
        print('khớp đường mùa', k + 1, 'lệch', round(ca - cb, 1), 'px', file=sys.stderr)
    hang = duong_cat(tren, a[:CHONG], tran)
    # trong lòng đường (đã khớp tâm): đường cắt giữ nguyên, chỉ chuyển mềm rộng hơn để mép đường đổi dần, không gãy
    lo = int(max(0, (ca or W / 2) - 90)); hi = int(min(W, (ca or W / 2) + 90))
    yy = np.arange(CHONG)[:, None]
    mem = np.full(W, MEM, np.float32); mem[lo:hi] = 24                     # lòng đường chuyển mềm hơn
    t = np.clip((yy - hang[None, :] + mem[None, :]) / (2 * mem[None, :]), 0, 1)[..., None]   # 0 = ảnh trên, 1 = ảnh dưới
    dai[y0:y0 + CHONG] = tren * (1 - t) + a[:CHONG] * t
    dai[y0 + CHONG:y0 + H] = a[CHONG:]
Image.fromarray(np.clip(dai, 0, 255).astype(np.uint8)).save(ra, quality=88)
print(json.dumps({'cao': cao, 'y_mua': y_mua}))
