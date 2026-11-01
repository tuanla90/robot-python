# Dò con đường (xám nhựa, vạch trắng) trên ảnh bản đồ mùa dọc, rải 10 nút gói đều theo chiều dài đường.
# python tools/do-duong.py <ảnh.png> [số nút=10] [x,y điểm xuất phát] [y dừng dò] [xuong]  → in JSON {w, h, duong: [[x,y]...], nut: [[x,y]...]} (toạ độ theo tỉ lệ 0..1)
#                                                    và lưu <ảnh>-do.png để soát (đường đỏ, nút vàng).
import json, sys
import numpy as np
from PIL import Image, ImageDraw

duong_anh = sys.argv[1]
SO_NUT = int(sys.argv[2]) if len(sys.argv) > 2 else 10
im = Image.open(duong_anh).convert('RGB')
W, H = 540, int(540 * im.height / im.width)
a = np.asarray(im.resize((W, H))).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx, mn = a.max(-1), a.min(-1)
# mặt đường: xám trung tính tối vừa (độ bão hoà thấp), cộng vạch trắng nằm giữa đường
xam = (mx - mn < 42) & (mx > 95) & (mx < 190) & (b >= g - 4) & (g >= r - 4)   # xám ngả xanh lam như ảnh TopView
trang = (mn > 215) & (mx - mn < 25)
mat = xam | trang

# đi từ ĐỈNH xuống (đường ra ở giữa mép trên là chắc chắn), mỗi hàng chọn dải mặt đường gần tâm hàng trước nhất;
# hụt quá 25 hàng liền thì coi như hết đường (vd đường dừng trước sân trường ở đáy ảnh)
Y_HET = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0   # dò tới hàng này (tỉ lệ) thì dừng
XUONG = len(sys.argv) > 5 and sys.argv[5] == 'xuong'          # bản đồ đi từ trên xuống: điểm xuất phát ở trên, dò bắt đầu từ đó
y0, x0 = 0, W / 2
if XUONG and len(sys.argv) > 3:
    bx, by = map(float, sys.argv[3].split(',')); y0, x0 = int(by * H), bx * W
diem, x_truoc, hut = [], x0, 0
for y in range(y0, int(H * Y_HET)):
    xs = np.flatnonzero(mat[y])
    ung = []
    if xs.size:
        cat = np.flatnonzero(np.diff(xs) > 3)
        ung = [d for d in np.split(xs, cat + 1) if 12 <= d.size <= 90]
    tam = [d.mean() for d in ung]
    k = int(np.argmin([abs(t - x_truoc) for t in tam])) if tam else -1
    if k < 0 or (abs(tam[k] - x_truoc) > 40 and (diem or XUONG)):
        hut += 1
        if hut > 25 and len(diem) > 50: break
        continue
    hut = 0
    x_truoc = tam[k]
    diem.append((x_truoc, y))
if not XUONG: diem = diem[::-1]          # bản đồ đi lên: đảo lại thành từ đầu đường (dưới) lên đỉnh
# điểm xuất phát (vd cổng trường có CLB) truyền thêm: tools/do-duong.py ảnh 10 x,y (tỉ lệ 0..1)
if len(sys.argv) > 3:
    bx, by = map(float, sys.argv[3].split(','))
    diem = [(bx * W, by * H)] + diem

# làm mượt, lấy mẫu mỗi 6 px theo y
diem = np.array(diem)
mau = [diem[0].tolist()]
for p in diem[1:]:
    if np.hypot(p[0] - mau[-1][0], p[1] - mau[-1][1]) >= 6: mau.append(p.tolist())
mau = np.array(mau)
doan = np.r_[0, np.cumsum(np.hypot(*np.diff(mau, axis=0).T))]
L = doan[-1]
nut = []
for i in range(SO_NUT):
    s = L * (0.0 + 0.93 * i / (SO_NUT - 1))   # nút 1 ở điểm xuất phát, nút cuối trước mép trên một đoạn
    j = min(np.searchsorted(doan, s), len(mau) - 1)
    nut.append(mau[j].tolist())

do = im.resize((W, H)).copy()
d = ImageDraw.Draw(do)
d.line([tuple(p) for p in mau], fill=(230, 40, 40), width=3)
for i, (x, y) in enumerate(nut):
    d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(250, 204, 21), outline=(30, 27, 75), width=3)
do.save(duong_anh.rsplit('.', 1)[0] + '-do.png')
print(json.dumps({'w': W, 'h': H, 'duong': [[round(x / W, 4), round(y / H, 4)] for x, y in mau[::3]],
                  'nut': [[round(x / W, 4), round(y / H, 4)] for x, y in nut]}))
