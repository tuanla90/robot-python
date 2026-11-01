# Ảnh cho phim CLB chiếu trên web: chép ảnh phim mùa 1–3 dùng từ public/ sang hoc/game/phim-clb/a/, đổi PNG / JPG sang WebP và thu nhỏ
# (khung phim 1080×1920 hiện trên #stage 360×640, máy điện thoại nét gấp 2–3 lần: 2/3 cỡ gốc là đủ). Tiếng (sfx) chép nguyên.
#   python tools/web/nen-anh.py          (chạy từ phim-clb/; dong-goi.mjs gọi sẵn)
# Đường dẫn giữ như public/, chỉ đổi đuôi ảnh thành .webp (shim staticFile trong dong-goi.mjs đổi theo). Ảnh đích mới hơn ảnh nguồn thì bỏ qua.
import os, shutil, sys
from PIL import Image

NGUON, DICH = 'public', os.path.join('..', 'hoc', 'game', 'phim-clb', 'a')
TI_LE, CHAT = 2 / 3, 80
CHON = ['robot/m1', 'robot/m2', 'robot/m3', 'robot/cang', 'robot/m4', 'robot/m5', 'robot/m6', 'robot/m7', 'robot/m8',
        'robot/lab', 'robot/*', 'nguoi', 'mascot', 'sfx',
        'nen-doc/mua-1.png', 'nen-doc/mua-2.png', 'nen-doc/mua-3.png', 'nen-doc/mua-4.png', 'nen-doc/mua-5.png',
        'nen-doc/mua-6.png', 'nen-doc/mua-7.png', 'nen-doc/mua-8.png', 'nen-doc/mua-cang.png', 'nen-doc/mua-hang.png',
        'nen-doc/mua-song.png', 'nen-doc/the-gioi.png', 'nen-doc/trong-xe.jpg',
        'ban-do/mua-3b.jpg', 'ban-do/dai-9.jpg']

def tep_cua(muc):
    p = os.path.join(NGUON, muc)
    if muc.endswith('/*'):
        d = p[:-2]
        return [os.path.join(d, f) for f in os.listdir(d) if os.path.isfile(os.path.join(d, f))]
    if os.path.isfile(p):
        return [p]
    return [os.path.join(g, f) for g, _, fs in os.walk(p) for f in fs]

tong, so = 0, 0
for muc in CHON:
    for tep in tep_cua(muc):
        tuong_doi = os.path.relpath(tep, NGUON)
        goc, duoi = os.path.splitext(tuong_doi)
        anh = duoi.lower() in ('.png', '.jpg', '.jpeg')
        if not anh and duoi.lower() not in ('.wav', '.mp3', '.ogg'):
            continue
        ra = os.path.join(DICH, goc + '.webp' if anh else tuong_doi)
        os.makedirs(os.path.dirname(ra), exist_ok=True)
        if not (os.path.exists(ra) and os.path.getmtime(ra) >= os.path.getmtime(tep)):
            if anh:
                im = Image.open(tep)
                im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
                w, h = im.size
                im = im.resize((max(1, round(w * TI_LE)), max(1, round(h * TI_LE))), Image.LANCZOS)
                im.save(ra, 'WEBP', quality=CHAT, method=6)
            else:
                shutil.copyfile(tep, ra)
        tong += os.path.getsize(ra); so += 1
print(f'{so} tệp, {tong / 1e6:.1f} MB ở {DICH}', file=sys.stderr)
