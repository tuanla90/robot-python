# Dò đường nhựa uốn lượn trên ảnh bản đồ dọc bằng KHUNG XƯƠNG (khác do-duong.py quét từng hàng: hàng đi được cả khúc ngang, khúc vòng chữ S).
# Dùng cho cảnh xe chạy bám đường trong phim (2/11: phim mở đầu, src/duong-ban-do.ts).
#   python tools/do-duong-xuong.py <ảnh.png> <ra.ts> <x1,y1:x2,y2> [<x1,y1:x2,y2> ...]
#   mỗi đối số là một khúc đường liền (điểm đầu : điểm cuối, toạ độ px ảnh); các khúc nối nhau bằng đoạn thẳng (qua sông, qua cầu không vẽ).
#   → ghi <ra.ts> (DUONG, diemTren, CAU_S = khúc nối đầu tiên) và <ra.ts>-soat.png (đường đỏ đè ảnh) để soát bằng mắt.
# Màu nhựa lọc theo ảnh the-gioi.png (xám ngả lam ~ 70, 96, 110); ảnh khác lệch màu thì chỉnh NGUONG.
import json, sys
from collections import deque
import numpy as np
from PIL import Image, ImageDraw
from skimage.measure import label
from skimage.morphology import closing, disk, opening, skeletonize

sys.stdout.reconfigure(encoding='utf-8')
anh, ra, khuc = sys.argv[1], sys.argv[2], sys.argv[3:]
a = np.asarray(Image.open(anh).convert('RGB')).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
NGUONG = (r > 45) & (r < 100) & (g > 70) & (g < 125) & (b > 85) & (b < 140) & (b - r > 18) & (g - r > 10) & (b - g < 30)
m = opening(closing(NGUONG, disk(6)), disk(3))           # lấp vạch trắng giữa đường, bỏ chấm lẻ
lab = label(m)
co = np.bincount(lab.ravel()); co[0] = 0
m = np.isin(lab, [k for k in range(len(co)) if co[k] > 20000])   # chỉ giữ mảng lớn (thân đường)
S = set(map(tuple, np.stack(np.nonzero(skeletonize(m))[::-1], 1).tolist()))


def gan(q):
    return min(S, key=lambda p: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)


def di(a, b):                                             # BFS trên khung xương, 8 hướng
    a, b = gan(a), gan(b)
    truoc, hang = {a: None}, deque([a])
    while hang:
        x, y = p = hang.popleft()
        if p == b:
            break
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                n = (x + dx, y + dy)
                if n in S and n not in truoc:
                    truoc[n] = p
                    hang.append(n)
    if b not in truoc:
        sys.exit(f'khúc {a} → {b} không liền trên khung xương: chỉnh điểm hay NGUONG')
    ds, p = [], b
    while p:
        ds.append(p)
        p = truoc[p]
    return ds[::-1]


cac_khuc = [di(*[tuple(map(int, d.split(','))) for d in k.split(':')]) for k in khuc]
P = np.array(sum(cac_khuc, []), float)
P = np.array([P[max(0, i - 9):i + 10].mean(0) for i in range(len(P))])     # làm mượt răng cưa khung xương
d = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
s = np.linspace(0, d[-1], int(d[-1] // 10))                                  # lấy mẫu đều ~10px
X, Y = np.interp(s, d, P[:, 0]), np.interp(s, d, P[:, 1])
# khúc nối đầu tiên (giữa khúc 1 và 2) theo phần chiều dài; làm mượt trải bước nhảy ra ±9 điểm nên lấy cả dải đó
cau = [0, 0]
if len(cac_khuc) > 1:
    n1 = len(cac_khuc[0])
    cau = [round(d[max(0, n1 - 10)] / d[-1], 4), round(d[min(len(d) - 1, n1 + 9)] / d[-1], 4)]

pts = ','.join(f'{int(x)},{int(y)}' for x, y in zip(X, Y))
open(ra, 'w', encoding='utf-8', newline='\n').write(f'''// Đường nhựa trên ảnh {anh.split("/")[-1]} — sinh bởi tools/do-duong-xuong.py (khung xương, làm mượt, lấy mẫu ~10px). Đừng sửa tay: chạy lại công cụ.
// CAU_S: khúc nối thẳng đầu tiên (giữa khúc đường 1 và 2) theo phần chiều dài 0..1.
const P = [{pts}];
export const DUONG: [number, number][] = [];
for (let i = 0; i < P.length; i += 2) DUONG.push([P[i], P[i + 1]]);
const DAI = [0];
for (let i = 1; i < DUONG.length; i++) DAI.push(DAI[i - 1] + Math.hypot(DUONG[i][0] - DUONG[i - 1][0], DUONG[i][1] - DUONG[i - 1][1]));
const Y_MAX: number[] = [];
DUONG.forEach(([, y], i) => Y_MAX.push(Math.max(y, i ? Y_MAX[i - 1] : y)));
/** Vị trí theo phần chiều dài s (0..1): toạ độ, hướng (dx), và độ sâu y lớn nhất đã đi qua (để biết đã ngang trạm nào). */
export const diemTren = (s: number) => {{
  const L = DAI[DAI.length - 1] * Math.max(0, Math.min(1, s));
  let i = 1;
  while (i < DAI.length - 1 && DAI[i] < L) i++;
  const k = (L - DAI[i - 1]) / Math.max(1e-6, DAI[i] - DAI[i - 1]);
  const [x0, y0] = DUONG[i - 1], [x1, y1] = DUONG[i];
  const y = y0 + (y1 - y0) * k;
  return {{x: x0 + (x1 - x0) * k, y, dx: x1 - x0, yMax: Math.max(Y_MAX[i - 1], y)}};
}};
export const CAU_S: [number, number] = {json.dumps(cau)};
''')
im = Image.open(anh).convert('RGB')
ImageDraw.Draw(im).line(list(zip(X, Y)), fill=(255, 0, 0), width=6)
im.save(ra + '-soat.png')
print(f'{len(X)} điểm, dài {round(d[-1])}px, CAU_S {cau} → {ra}')
