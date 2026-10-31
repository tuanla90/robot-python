# Vá chỗ nối giữa hai mùa trên ảnh dài: TopView vẽ lại dải chuyển cảnh (ảnh sinh từ một khung cắt quanh vết nối),
# đặt dải mới vào lại ảnh dài. Hai mép dải không hoà mờ cả vùng mà cắt theo ĐƯỜNG CẮT TỐI ƯU (như noi-mua.py) ở chỗ
# ảnh mới giống ảnh cũ nhất, viền mềm vài px; trước đó chỉnh màu ảnh mới cho khớp ảnh cũ (trung bình / độ lệch từng kênh
# đo ở hai mép giữ nguyên) và kéo ảnh mới cho trùng hình ảnh cũ ở hai mép (SIFT + affine, rồi luồng quang học trơn).
# python tools/va-cho-noi.py <dài vào.jpg> <dài ra.jpg> <tâm y> <cao khung> <ảnh sinh.png>
import sys
import numpy as np
from PIL import Image, ImageFilter

vao, ra, TAM, CAO, sinh = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
dai = np.asarray(Image.open(vao).convert('RGB')).astype(np.float32)
W = dai.shape[1]
y0 = TAM - CAO // 2
cu = dai[y0:y0 + CAO].copy()
moi = np.asarray(Image.open(sinh).convert('RGB').resize((W, CAO), Image.LANCZOS)).astype(np.float32)
MEP = CAO * 22 // 100                                         # dải cắt tìm trong 0..MEP (trên) và CAO-MEP..CAO (dưới)

# ảnh sinh thường lệch tỉ lệ vài phần trăm (đường lệch 10–100 px ở mép). Bước 2 đo luồng quang học từ ảnh cũ sang ảnh sinh CHỈ ở hai mép
# giữ nguyên, khớp mỗi mép bằng một mặt bậc hai trơn (bỏ điểm lệch lạ), rồi kéo ảnh sinh theo mặt đó: trọng số 1 ở mép,
# giảm dần về 0 giữa dải. Mặt trơn nên không kéo nhòe chi tiết (lau sậy, cây) như khi dùng luồng từng điểm.
import cv2
xam = lambda a: cv2.cvtColor(np.clip(a, 0, 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(CAO, dtype=np.float32))

# bước 1 (lệch lớn, tới 100 px): mỗi mép một phép affine từ điểm SIFT khớp (RANSAC), nội suy affine theo hàng giữa hai mép
sift = cv2.SIFT_create(4000)
kb, db = sift.detectAndCompute(xam(moi), None)
def affine(y0, y1):
    m = np.zeros((CAO, W), np.uint8); m[y0:y1] = 255
    ka, da = sift.detectAndCompute(xam(cu), m)
    cap = [p for p, q in cv2.BFMatcher().knnMatch(da, db, k=2) if p.distance < 0.75 * q.distance]
    A = np.float32([ka[p.queryIdx].pt for p in cap]); B = np.float32([kb[p.trainIdx].pt for p in cap])
    M, ok = cv2.estimateAffine2D(A, B, ransacReprojThreshold=4, maxIters=5000)
    print('affine', y0, y1, 'khớp', int(ok.sum()), '/', len(cap), np.round(M, 3).tolist(), file=sys.stderr)
    return M
Mt, Md = affine(0, MEP), affine(CAO - MEP, CAO)
s = np.clip((gy - MEP / 2) / (CAO - MEP), 0, 1); s = s * s * (3 - 2 * s)
M = Mt[None, None] * (1 - s)[..., None, None] + Md[None, None] * s[..., None, None]
mx = M[..., 0, 0] * gx + M[..., 0, 1] * gy + M[..., 0, 2]; my = M[..., 1, 0] * gx + M[..., 1, 1] * gy + M[..., 1, 2]
moi = cv2.remap(moi, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

# bước 2 (lệch nhỏ còn lại)
luong = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM).calc(xam(cu), xam(moi), None)
bac2 = lambda x, y: np.stack([np.ones_like(x), x, y, x * x, x * y, y * y], -1)
def mat_tron(y0, y1):
    ys, xs = np.mgrid[y0:y1:8, 0:W:8]
    f = luong[ys, xs].reshape(-1, 2); A = bac2(xs.ravel() / W, ys.ravel() / CAO)
    ok = np.ones(len(f), bool)
    for _ in range(3):                                         # bỏ điểm lệch xa mặt (luồng sai ở chỗ phẳng / khác hình)
        hs = np.linalg.lstsq(A[ok], f[ok], rcond=None)[0]
        r = np.abs(A @ hs - f).sum(1); ok = r < max(2.0, 2.5 * np.median(r[ok]))
    return bac2(gx / W, gy / CAO) @ hs
yy = np.arange(CAO, dtype=np.float32)[:, None]
tt = lambda d: 1 - np.clip(d / (CAO * 0.18), 0, 1) ** 2 * (3 - 2 * np.clip(d / (CAO * 0.18), 0, 1))
wt, wd = tt(np.clip(yy - MEP, 0, None)), tt(np.clip(CAO - MEP - yy, 0, None))   # 1 ở mép trên / dưới → 0 giữa
keo = mat_tron(0, MEP) * wt[..., None] + mat_tron(CAO - MEP, CAO) * wd[..., None]
print('kéo mép trên', np.round(keo[MEP // 2, ::W // 4].tolist(), 1).tolist(), 'mép dưới', np.round(keo[CAO - MEP // 2, ::W // 4].tolist(), 1).tolist(), file=sys.stderr)
moi = cv2.remap(moi, gx + keo[..., 0].astype(np.float32), gy + keo[..., 1].astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

giu = np.r_[np.arange(MEP), np.arange(CAO - MEP, CAO)]
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
tren = duong_cat(sai[:MEP])                                   # trên đường này giữ ảnh cũ
duoi = CAO - MEP + duong_cat(sai[-MEP:])                      # dưới đường này giữ ảnh cũ
MEM = 8
yy = np.arange(CAO)[:, None]
t = np.clip((yy - tren[None] + MEM) / (2 * MEM), 0, 1) * np.clip((duoi[None] - yy + MEM) / (2 * MEM), 0, 1)
dai[y0:y0 + CAO] = cu * (1 - t[..., None]) + moi * t[..., None]
print('cắt trên', int(tren.min()), '..', int(tren.max()), 'dưới', int(duoi.min()), '..', int(duoi.max()),
      'sai trung bình', round(float(sai[tren, np.arange(W)].mean()), 1), round(float(sai[duoi, np.arange(W)].mean()), 1), file=sys.stderr)
Image.fromarray(np.clip(dai, 0, 255).astype(np.uint8)).save(ra, quality=90)
