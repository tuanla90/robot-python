# Dò đường giữa con đường trên ảnh dài 9 nơi chốn (hoc/game/phim-clb/a/ban-do/dai-9.webp) cho bản đồ chọn màn (hoc/game/man-chon.js, DUONG).
# Điểm ảnh "nhựa đường" (xám ngả lam, ít bão hoà) → điểm mỗi hàng → Viterbi tìm đường liền, mỗi bước 16px lệch ngang tối đa 14px.
# Chạy: python tools/do-duong-ban-do.py hoc/game/phim-clb/a/ban-do/dai-9.webp kiem-duong.png  (in số điểm rồi dãy x; ảnh kiểm vẽ đường đỏ, thu 1/4)
import sys
import numpy as np
from PIL import Image, ImageDraw

im = Image.open(sys.argv[1]).convert('RGB')
a = np.asarray(im).astype(np.int32)
H, W, _ = a.shape
BUOC = int(sys.argv[3]) if len(sys.argv) > 3 else 16
mx = a.max(2); mn = a.min(2)
sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 1)
road = (sat < 0.40) & (mx > 40) & (mx < 180) & (a[:, :, 2] >= a[:, :, 0] - 8)
road = road.astype(np.float32)

rows = list(range(0, H, BUOC))
R = 30  # nửa bề rộng cửa sổ (đường ~80px trên ảnh 720)
score = []
for y in rows:
    band = road[max(0, y - BUOC // 2):y + BUOC // 2 + 1].mean(0)
    c = np.convolve(band, np.ones(2 * R + 1) / (2 * R + 1), mode='same')
    score.append(c)
score = np.array(score)
xs_all = np.arange(W)
MAXD = 14
PHAT = 0.02
# Viterbi: tối đa tổng điểm, phạt bước ngang
n = len(rows)
dp = score[0].copy()
dp -= np.abs(xs_all - W / 2) * 0.004
back = np.zeros((n, W), np.int32)
for i in range(1, n):
    best = np.full(W, -1e9); arg = np.zeros(W, np.int32)
    for d in range(-MAXD, MAXD + 1):
        sh = np.roll(dp, d)
        if d > 0: sh[:d] = -1e9
        if d < 0: sh[d:] = -1e9
        v = sh - PHAT * abs(d)
        m = v > best
        best[m] = v[m]; arg[m] = (xs_all - d)[m]
    dp = best + score[i]
    back[i] = arg
x = int(dp.argmax()); path = [x]
for i in range(n - 1, 0, -1):
    x = back[i][x]; path.append(int(x))
path = path[::-1]
print(len(path))
print(','.join(map(str, path)))
d = ImageDraw.Draw(im)
for i in range(1, n):
    d.line([(path[i - 1], rows[i - 1]), (path[i], rows[i])], fill=(255, 0, 0), width=6)
im.resize((W // 4, H // 4)).save(sys.argv[2])
