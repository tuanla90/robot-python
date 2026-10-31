# Vá chỗ nối giữa hai mùa trên ảnh dài: TopView vẽ lại dải chuyển cảnh (ảnh sinh từ một khung cắt quanh vết nối),
# đặt dải mới vào lại ảnh dài. Hai mép dải không hoà mờ cả vùng mà cắt theo ĐƯỜNG CẮT TỐI ƯU (như noi-mua.py) ở chỗ
# ảnh mới giống ảnh cũ nhất, viền mềm vài px; trước đó chỉnh màu ảnh mới cho khớp ảnh cũ (trung bình / độ lệch từng kênh
# đo ở hai mép giữ nguyên) và dịch / co ngang ảnh mới cho đường trùng ảnh cũ (không co giãn dọc, xem dưới).
# python tools/va-cho-noi.py <dài vào.jpg> <dài ra.jpg> <tâm y> <cao khung> <ảnh sinh.png> [tren]
import sys
import numpy as np
from PIL import Image, ImageFilter

vao, ra, TAM, CAO, sinh = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
CHI_TREN = 'tren' in sys.argv[6:]                           # chỉ giữ mép trên (đoạn cuối bản đồ: phần dưới lấy hết ảnh sinh)
dai = np.asarray(Image.open(vao).convert('RGB')).astype(np.float32)
W = dai.shape[1]
y0 = TAM - CAO // 2
cu = dai[y0:y0 + CAO].copy()
moi = np.asarray(Image.open(sinh).convert('RGB').resize((W, CAO), Image.LANCZOS)).astype(np.float32)
MEP = CAO * 22 // 100                                         # dải cắt tìm trong 0..MEP (trên) và CAO-MEP..CAO (dưới)

# TopView vẽ lại thường thu nhỏ hình theo chiều dọc 15–25% (vật ở hai mép nhỏ hơn bản gốc) và lệch ngang vài chục px.
# KHÔNG co giãn dọc để bù (bản 31/10 làm vậy nên nhà, container ở dải chuyển bị kéo méo): mỗi mép chỉ khớp
#   ngang x' = a·x + b (để đường liền) và dịch dọc d (đo ở nửa trong của mép, sát chỗ cắt), từ điểm SIFT khớp (RANSAC);
# a, b, d nội suy trơn theo hàng giữa hai mép. Hình trong ảnh sinh giữ nguyên tỉ lệ TopView vẽ.
import cv2
xam = lambda a: cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(CAO, dtype=np.float32))
sift = cv2.SIFT_create(4000)
kb, db = sift.detectAndCompute(xam(moi), None)
def khop(y0, y1, trong):
    m = np.zeros((CAO, W), np.uint8); m[y0:y1] = 255
    ka, da = sift.detectAndCompute(xam(cu), m)
    cap = [p for p, q in cv2.BFMatcher().knnMatch(da, db, k=2) if p.distance < 0.75 * q.distance]
    A = np.float32([ka[p.queryIdx].pt for p in cap]); B = np.float32([kb[p.trainIdx].pt for p in cap])
    M, ok = cv2.estimateAffine2D(A, B, ransacReprojThreshold=5, maxIters=5000)
    ok = ok.ravel().astype(bool)
    a, b = np.polyfit(A[ok, 0], B[ok, 0], 1)                     # ngang: x' = a·x + b
    sat = ok & (A[:, 1] >= trong[0]) & (A[:, 1] < trong[1])
    d = float(np.median((B[sat] if sat.sum() >= 5 else B[ok])[:, 1] - (A[sat] if sat.sum() >= 5 else A[ok])[:, 1]))
    print('khớp', y0, y1, 'điểm', int(ok.sum()), 'a b d', round(a, 3), round(b, 1), round(d, 1), file=sys.stderr)
    return a, b, d
kt = khop(0, MEP, (MEP // 2, MEP))
kd = khop(CAO - MEP, CAO, (CAO - MEP, CAO - MEP // 2)) if not CHI_TREN else kt
s = np.clip((gy - MEP) / max(CAO - 2 * MEP, 1), 0, 1); s = s * s * (3 - 2 * s)
a, b, d = [kt[i] * (1 - s) + kd[i] * s for i in range(3)]
moi = cv2.remap(moi, (a * gx + b).astype(np.float32), (gy + d).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

# khớp riêng MẶT ĐƯỜNG: điểm SIFT nằm chủ yếu trên nhà cửa nên đường vẫn có thể lệch ngang vài chục px ở chỗ cắt.
def tam_duong(a, y):
    mx, mn = a[y].max(-1), a[y].min(-1)
    r, b = a[y, :, 0], a[y, :, 2]
    xs = np.flatnonzero((mx - mn < 38) & (mx > 95) & (mx < 165) & (b >= r - 4))     # nhựa đường xám ngả xanh
    if xs.size < 40: return None
    runs = [r for r in np.split(xs, np.flatnonzero(np.diff(xs) > 14) + 1) if 60 <= r[-1] - r[0] <= 230 and r.size > 0.6 * (r[-1] - r[0])]
    return min(((r[0] + r[-1]) / 2 for r in runs), key=lambda c: abs(c - W / 2)) if runs else None
TIM0 = CAO * 38 // 100
# lệch đường theo TỪNG HÀNG (đường cong nên lệch dọc thành lệch ngang khác nhau mỗi hàng): đo ở vùng tìm cắt hai mép,
# lọc trung vị, hàng không thấy đường thì nội suy; ngoài hai vùng giảm mượt về 0 trong 160 hàng
ys = np.arange(CAO); dx = np.full(CAO, np.nan)
for y in np.r_[np.arange(0, TIM0), np.arange(CAO - TIM0, CAO)] if not CHI_TREN else np.arange(0, TIM0):
    c, m = tam_duong(cu, y), tam_duong(moi, y)
    if c is not None and m is not None and abs(c - m) < 80: dx[y] = c - m
for v0, v1, mep in ((0, TIM0, TIM0), (CAO - TIM0, CAO, CAO - TIM0)):
    k = ~np.isnan(dx[v0:v1])
    if k.sum() < 10: dx[v0:v1] = 0; continue
    seg = np.interp(ys[v0:v1], ys[v0:v1][k], dx[v0:v1][k])
    from scipy.ndimage import median_filter, gaussian_filter1d
    dx[v0:v1] = gaussian_filter1d(median_filter(seg, 31), 8)
giua = np.isnan(dx)
dx[giua] = 0
xa_t = np.clip((ys - TIM0) / 160, 0, 1); xa_d = np.clip((CAO - TIM0 - ys) / 160, 0, 1)
for y in ys[giua]:
    dx[y] = dx[TIM0 - 1] * (1 - xa_t[y]) ** 2 * (y >= TIM0) + (0 if CHI_TREN else dx[CAO - TIM0] * (1 - xa_d[y]) ** 2 * (y < CAO - TIM0))
print('lệch đường theo hàng: trên', round(float(np.abs(dx[:TIM0]).max()), 1), 'dưới', round(float(np.abs(dx[CAO - TIM0:]).max()), 1), file=sys.stderr)
# chỉ nắn mặt đường và lề, chặn 40 px: nhà, luống hoa ở xa giữ nguyên hình
dx = np.clip(dx, -40, 40)
tam_m = np.full(CAO, np.nan)
for y in range(0, CAO, 4):
    c = tam_duong(moi, y)
    if c is not None: tam_m[y] = c
k = ~np.isnan(tam_m)
tam_m = np.interp(ys, ys[k], tam_m[k]) if k.sum() > 10 else np.full(CAO, W / 2)
from scipy.ndimage import gaussian_filter1d as _g
tam_m = _g(tam_m, 12)
w = np.clip(1.25 - np.abs(gx - tam_m[:, None]) / 110, 0, 1)            # mặt đường + lề (~90 px mỗi bên) dịch đủ, ra 140 px thì 0
moi = cv2.remap(moi, (gx - dx[:, None] * w).astype(np.float32), gy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

giu = np.arange(MEP) if CHI_TREN else np.r_[np.arange(MEP), np.arange(CAO - MEP, CAO)]
for c in range(3):                                            # khớp màu từng kênh theo hai mép giữ nguyên
    a, b = cu[giu, :, c], moi[giu, :, c]
    moi[..., c] = (moi[..., c] - b.mean()) * (a.std() / max(b.std(), 1)) + a.mean()

def duong_cat(sai):
    """Đường cắt ngang ít khác nhất (mỗi cột một hàng, lệch tối đa 1 hàng giữa hai cột kề)."""
    sai = np.asarray(Image.fromarray(np.clip(sai / 3, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float32)
    sai[:10] += 1e4; sai[-10:] += 1e4
    tong = sai.copy(); n = sai.shape[0]
    for x in range(1, W):
        t = tong[:, x - 1]
        tong[:, x] += np.minimum(np.minimum(t, np.r_[np.inf, t[:-1]]), np.r_[t[1:], np.inf])
    hang = np.zeros(W, int); hang[-1] = int(np.argmin(tong[:, -1]))
    for x in range(W - 2, -1, -1):
        y = hang[x + 1]; lo, hi = max(0, y - 1), min(n, y + 2)
        hang[x] = lo + int(np.argmin(tong[lo:hi, x]))
    return hang

sai = np.abs(cu - moi).sum(-1)
# tìm đường cắt trong vùng rộng hơn mép khớp (tới 38% khung) để đường cắt lách qua đất trống, không cắt ngang nhà
# (ảnh sinh không co giãn dọc nên nhà ở mép có thể lệch vài chục px so với bản gốc)
TIM = CAO * 38 // 100
tren = duong_cat(sai[:TIM])                                   # trên đường này giữ ảnh cũ
duoi = np.full(W, CAO + 2 * 8) if CHI_TREN else CAO - TIM + duong_cat(sai[-TIM:])   # dưới đường này giữ ảnh cũ
MEM = 8
yy = np.arange(CAO)[:, None]
t = np.clip((yy - tren[None] + MEM) / (2 * MEM), 0, 1) * np.clip((duoi[None] - yy + MEM) / (2 * MEM), 0, 1)
dai[y0:y0 + CAO] = cu * (1 - t[..., None]) + moi * t[..., None]
print('cắt trên', int(tren.min()), '..', int(tren.max()), 'dưới', int(duoi.min()), '..', int(duoi.max()),
      'sai trung bình', round(float(sai[tren, np.arange(W)].mean()), 1), round(float(sai[np.clip(duoi, 0, CAO - 1), np.arange(W)].mean()), 1), file=sys.stderr)
Image.fromarray(np.clip(dai, 0, 255).astype(np.uint8)).save(ra, quality=90)
