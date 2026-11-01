# Cắt tấm biểu cảm (6 dáng một hàng, nền trắng, TopView 2736×1536) thành 6 ảnh người nhờ đã tách nền, cao 1100 px như public/nguoi/*.
# python tools/cat-bieu-cam.py <tấm.png> <thư mục ra> <tên> [tên dáng 1..6]   → <ra>/<tên>-<dáng>.png
# Tách nền: loang từ mép ảnh qua các điểm TRẮNG TINH (nền TopView 253–254; giữ trắng bên trong người như áo, mũ, găng
# trắng có bóng — loang qua ngưỡng lỏng thì găng hở viền bị ăn thành trong suốt), rồi gọt quầng gần trắng ≤ 2 px quanh nền.
# Chia người: 6 vùng liền lớn nhất xếp trái sang phải; mảnh nhỏ (giọt mồ hôi, lấp lánh, phao rời) theo người có điểm ảnh GẦN NHẤT.
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

vao, ra, ten = sys.argv[1], sys.argv[2], sys.argv[3]
DANG = sys.argv[4:] or ['nghi', 'ngac-nhien', 'hoang', 'tin', 'sot-ruot', 'mung']
CAO = 1100

a = np.asarray(Image.open(vao).convert('RGB')).astype(np.int16)
def loang(qua):
    nhan, _ = ndimage.label(qua)
    mep = np.unique(np.r_[nhan[0], nhan[-1], nhan[:, 0], nhan[:, -1]])
    return np.isin(nhan, mep[mep > 0])
gan_trang = (a.min(-1) > 232) & ((a.max(-1) - a.min(-1)) < 18)
nen_long = loang(gan_trang)
trang_tinh = (a.min(-1) >= 249) & ((a.max(-1) - a.min(-1)) <= 6)
nen = loang(trang_tinh)
nen |= nen_long & (ndimage.distance_transform_edt(~nen) <= 6)   # quầng / chấm gần trắng sát nền: bỏ; lòng găng xa nền: giữ
# mảng gần trắng còn giữ mà phần lớn chu vi giáp nền (bóng ngà quanh nón…) cũng là nền; lòng găng có viền bao, chỉ hở một khe
manh, m = ndimage.label(nen_long & ~nen)
for j in range(1, m + 1):
    o = manh == j
    vien = ndimage.binary_dilation(o) & ~o
    if (nen[vien].mean() if vien.any() else 1) > 0.3: nen |= o
hien = ndimage.binary_opening(~nen, iterations=2)            # điểm giữ lại (đục), bỏ hạt bụi lẻ
# chia người theo mặt nạ LỎNG (loang qua gần trắng): bóng mờ dưới chân không nối các dáng lại với nhau
nguoi = ndimage.binary_opening(~nen_long, iterations=2)

# mỗi người là một vùng liền lớn; vùng nhỏ (giọt mồ hôi, lấp lánh, mây) gán cho người có điểm ảnh gần nhất
vung, n = ndimage.label(nguoi)
dt = ndimage.sum(nguoi, vung, range(1, n + 1))
lon = np.argsort(dt)[::-1][:len(DANG)] + 1
H, W = nguoi.shape
if len(lon) == len(DANG) and dt[lon[-1] - 1] >= 0.3 * dt[lon[0] - 1]:
    tam = {v: ndimage.center_of_mass(nguoi, vung, v)[1] for v in lon}
    lon = sorted(lon, key=lambda v: tam[v])
    thu = np.zeros(n + 1, int)                               # vùng lớn → thứ tự người
    for k, v in enumerate(lon): thu[v] = k + 1
    loi = thu[vung]                                          # điểm của 6 vùng lớn
    _, (iy, ix) = ndimage.distance_transform_edt(loi == 0, return_indices=True)
    gan = loi[iy, ix]                                        # mỗi điểm → người có điểm gần nhất
    cua = np.zeros(n + 1, int)                               # vùng → thứ tự người (0 = bỏ)
    for v in range(1, n + 1):
        if dt[v - 1] < 40: continue
        cua[v] = np.bincount(gan[vung == v]).argmax()
    thuoc = cua[vung]
else:
    # dự phòng khi hai dáng chạm nhau (bó hoa, thước…): cột ít điểm người nhất quanh mỗi ranh giới chia đều
    xs = np.flatnonzero(nguoi.any(0)); x0, x1 = xs[0], xs[-1]
    buoc = (x1 - x0) / len(DANG); tong = nguoi.sum(0)
    cat = [x0]
    for k in range(1, len(DANG)):
        g = int(x0 + k * buoc); r = int(buoc * 0.25)
        cat.append(g - r + int(np.argmin(tong[g - r:g + r])))
    cat.append(x1 + 1)
    # dải cắt chỉ làm hạt giống (lõi mỗi dải, cách đường cắt ≥ 20% bề rộng); ranh giới thật do watershed tìm ở cổ thắt,
    # nên phao, bó hoa chạm sang dáng bên cạnh vẫn về đúng người
    from skimage.segmentation import watershed
    hat = np.zeros((H, W), int); le = int(buoc * 0.2)
    for k in range(len(DANG)):
        hat[:, cat[k] + le:cat[k + 1] - le] = k + 1
    hat[~nguoi] = 0
    cao = -ndimage.distance_transform_edt(nguoi)             # tách ở cổ thắt (chỗ hai dáng chạm nhau hẹp nhất)
    thuoc = watershed(cao, hat, mask=nguoi)
    # mảnh watershed cắt rời khỏi thân (nét viền lẻ của dáng bên cạnh): mỗi mảnh không phải thân chính của dáng mình
    # theo thân chính GẦN NHẤT (lấp lánh, giọt mồ hôi gần thân mình nên vẫn ở lại)
    than = np.zeros((H, W), int)
    for k in range(1, len(DANG) + 1):
        manh, m = ndimage.label(thuoc == k)
        if m: than[manh == 1 + int(np.argmax(ndimage.sum(np.ones_like(manh), manh, range(1, m + 1))))] = k
    _, (iy, ix) = ndimage.distance_transform_edt(than == 0, return_indices=True)
    gan = than[iy, ix]
    le, m = ndimage.label((thuoc > 0) & (than == 0))
    for j in range(1, m + 1):
        o = le == j
        thuoc[o] = np.bincount(gan[o]).argmax()
    print('cắt dọc ở', cat[1:-1], '(watershed ở cổ thắt)')
    # mảnh rời nhỏ (phao, góc bó hoa) không theo dải cắt mà theo người có điểm gần nhất trong các vùng lớn
    nho = 0.15 * nguoi.sum() / len(DANG)                     # mảnh < 15% cỡ trung bình một người
    lon_mat = np.isin(vung, np.flatnonzero(dt >= nho) + 1)
    _, (iy, ix) = ndimage.distance_transform_edt(~lon_mat, return_indices=True)
    gan = np.where(lon_mat, thuoc, 0)[iy, ix]
    for v in np.flatnonzero((dt < nho) & (dt >= 40)) + 1:
        o = vung == v
        thuoc[o] = np.bincount(gan[o]).argmax()

# điểm đục mà mặt nạ lỏng bỏ sót (găng trắng hở viền…) theo người có điểm gần nhất
_, (iy, ix) = ndimage.distance_transform_edt(thuoc == 0, return_indices=True)
thuoc = np.where(hien, thuoc[iy, ix], 0)
# túi trắng tinh bị các dáng kề nhau bao kín (loang từ mép không tới): viền giáp người khác / nền → nền.
# Áo trắng, túi giữa tay và thân của chính một người chỉ giáp người đó nên giữ.
tui, m = ndimage.label(trang_tinh & (thuoc > 0))
for j in range(1, m + 1):
    o = tui == j
    if o.sum() < 30: continue
    vien = thuoc[ndimage.binary_dilation(o, iterations=2) & ~o]
    if (vien != np.bincount(thuoc[o]).argmax()).mean() > 0.25: thuoc[o] = 0

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
