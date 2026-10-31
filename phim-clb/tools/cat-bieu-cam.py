# Cắt tấm biểu cảm (6 dáng một hàng, nền trắng, TopView 2736×1536) thành 6 ảnh người nhờ đã tách nền, cao 1100 px như public/nguoi/*.
# python tools/cat-bieu-cam.py <tấm.png> <thư mục ra> <tên> [tên dáng 1..6]   → <ra>/<tên>-<dáng>.png
# Tách nền: loang từ mép ảnh qua các điểm gần trắng (giữ trắng bên trong người như áo, mũ), viền mềm 1 px.
# Chia người: cột nào không còn điểm người là khe; lấy 6 cụm rộng nhất, xếp trái sang phải.
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

vao, ra, ten = sys.argv[1], sys.argv[2], sys.argv[3]
DANG = sys.argv[4:] or ['nghi', 'ngac-nhien', 'hoang', 'tin', 'sot-ruot', 'mung']
CAO = 1100

a = np.asarray(Image.open(vao).convert('RGB')).astype(np.int16)
gan_trang = (a.min(-1) > 232) & ((a.max(-1) - a.min(-1)) < 18)
nhan, _ = ndimage.label(gan_trang)
mep = np.unique(np.r_[nhan[0], nhan[-1], nhan[:, 0], nhan[:, -1]])
nen = np.isin(nhan, mep[mep > 0])
nguoi = ~nen
nguoi = ndimage.binary_opening(nguoi, iterations=2)          # bỏ hạt bụi lẻ

# mỗi người là một vùng liền lớn; vùng nhỏ (giọt mồ hôi, lấp lánh, mây) gán cho người có tâm gần nhất theo chiều ngang
vung, n = ndimage.label(nguoi)
dt = ndimage.sum(nguoi, vung, range(1, n + 1))
lon = np.argsort(dt)[::-1][:len(DANG)] + 1
H, W = nguoi.shape
if len(lon) == len(DANG) and dt[lon[-1] - 1] >= 0.3 * dt[lon[0] - 1]:
    tam = {v: ndimage.center_of_mass(nguoi, vung, v)[1] for v in lon}
    lon = sorted(lon, key=lambda v: tam[v])
    cua = np.zeros(n + 1, int)                               # vùng → thứ tự người (0 = bỏ)
    for v in range(1, n + 1):
        if dt[v - 1] < 40: continue
        cx = ndimage.center_of_mass(nguoi, vung, v)[1]
        cua[v] = 1 + int(np.argmin([abs(cx - tam[k]) for k in lon]))
    thuoc = cua[vung]
else:
    # dự phòng khi hai dáng chạm nhau (bó hoa, thước…): cắt dọc ở cột ít điểm người nhất quanh mỗi ranh giới chia đều
    xs = np.flatnonzero(nguoi.any(0)); x0, x1 = xs[0], xs[-1]
    buoc = (x1 - x0) / len(DANG); tong = nguoi.sum(0)
    cat = [x0]
    for k in range(1, len(DANG)):
        g = int(x0 + k * buoc); r = int(buoc * 0.25)
        cat.append(g - r + int(np.argmin(tong[g - r:g + r])))
    cat.append(x1 + 1)
    thuoc = np.zeros((H, W), int)
    for k in range(len(DANG)):
        thuoc[:, cat[k]:cat[k + 1]] = k + 1
    thuoc[~nguoi] = 0
    print('cắt dọc ở', cat[1:-1])

anh = Image.open(vao).convert('RGB')
for i, d in enumerate(DANG):
    mat = thuoc == i + 1
    ys, xs = np.nonzero(mat)
    x0, x1, y0, y1 = max(0, xs.min() - 8), xs.max() + 9, max(0, ys.min() - 8), ys.max() + 9
    al = Image.fromarray((mat * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    m = anh.copy(); m.putalpha(al)
    m = m.crop((x0, y0, x1, y1))
    m = m.resize((round(m.width * CAO / m.height), CAO), Image.LANCZOS)
    m.save(f'{ra}/{ten}-{d}.png')
    print(f'{ten}-{d}.png', m.size)
