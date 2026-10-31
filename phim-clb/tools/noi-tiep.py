# Bản đồ dọc vẽ NỐI ĐUÔI bằng TopView: mỗi mùa là một khung 9:16 mà 200 hàng trên cùng chính là 200 hàng đáy của mùa
# trước (TopView vẽ tiếp từ đó), nên chỗ chuyển cảnh do TopView vẽ, code KHÔNG nắn / co giãn gì — chỉ dịch nguyên ảnh
# (dx, dy) cho dải chồng khớp nhất rồi cắt theo đường cắt tối ưu trong dải chồng, viền mềm vài px.
#   python tools/noi-tiep.py khung <dài.jpg> <khung ra.jpg>           khung 1080×1924: 200 hàng đáy của dài + nền xám để TopView vẽ tiếp
#   python tools/noi-tiep.py noi <dài vào.jpg|-> <ảnh sinh.png> <dài ra.jpg>   đặt ảnh sinh vào đáy (dài vào '-' = mùa đầu)
import sys
import numpy as np
import cv2
from PIL import Image

W, H_ANH, CHONG = 1080, 1924, 200
doc = lambda p: np.asarray(Image.open(p).convert('RGB'))
ghi = lambda a, p: Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(p, quality=92)

if sys.argv[1] == 'khung':
    dai = doc(sys.argv[2])
    k = np.full((H_ANH, W, 3), 128, np.uint8)
    k[:CHONG] = dai[-CHONG:]
    ghi(k, sys.argv[3]); sys.exit()

vao, sinh, ra = sys.argv[2:5]
g = np.asarray(Image.open(sinh).convert('RGB').resize((W, H_ANH), Image.LANCZOS)).astype(np.float32)
if vao == '-':
    ghi(g, ra); sys.exit()
dai = doc(vao).astype(np.float32)
H = dai.shape[0]

# dải mẫu: 140 hàng giữa dải chồng của ảnh dài, bỏ 60 cột mỗi mép; tìm trong 400 hàng đầu ảnh sinh
xam = lambda a: cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2GRAY)
mau = xam(dai[H - 170:H - 30, 60:W - 60])
kq = cv2.matchTemplate(xam(g[:400]), mau, cv2.TM_CCOEFF_NORMED)
_, diem, _, (mx, my) = cv2.minMaxLoc(kq)
y0, dx = H - 170 - my, 60 - mx                                    # ảnh sinh đặt ở hàng y0, dịch ngang dx
print('khớp', round(diem, 3), 'y0', y0, '(chuẩn', H - CHONG, ') dx', dx, file=sys.stderr)
if dx:
    g = cv2.warpAffine(g, np.float32([[1, 0, dx], [0, 1, 0]]), (W, H_ANH), borderMode=cv2.BORDER_REFLECT_101)   # mép hở lấp bằng soi gương, không kéo dải điểm ảnh

# khớp màu nhẹ: dịch trung bình từng kênh của ảnh sinh theo dải chồng (không đổi độ tương phản)
chong = H - y0
for c in range(3):
    g[..., c] += dai[y0:H, :, c].mean() - g[:chong, :, c].mean()

# đường cắt tối ưu trong dải chồng (bỏ 12 hàng mỗi mép), mỗi cột một hàng, lệch ≤ 1 hàng giữa hai cột kề
sai = cv2.GaussianBlur(np.abs(dai[y0:H] - g[:chong]).sum(-1), (0, 0), 2)
sai[:12] += 1e4; sai[-12:] += 1e4
tong = sai.copy()
for x in range(1, W):
    t = tong[:, x - 1]
    tong[:, x] += np.minimum(np.minimum(t, np.r_[np.inf, t[:-1]]), np.r_[t[1:], np.inf])
hang = np.zeros(W, int); hang[-1] = int(np.argmin(tong[:, -1]))
for x in range(W - 2, -1, -1):
    y = hang[x + 1]; lo, hi = max(0, y - 1), min(chong, y + 2)
    hang[x] = lo + int(np.argmin(tong[lo:hi, x]))
MEM = 8
t = np.clip((np.arange(chong)[:, None] - hang[None] + MEM) / (2 * MEM), 0, 1)[..., None]
moi = np.zeros((y0 + H_ANH, W, 3), np.float32)
moi[:y0] = dai[:y0]
moi[y0:H] = dai[y0:H] * (1 - t) + g[:chong] * t
moi[H:] = g[chong:]
print('cắt', int(hang.min()), '..', int(hang.max()), 'sai', round(float(sai[hang, np.arange(W)].mean()), 1), 'cao', moi.shape[0], file=sys.stderr)
ghi(moi, ra)
