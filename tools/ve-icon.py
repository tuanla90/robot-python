# V7b (28/10): icon app hoc/game/icon/*.png đã VẼ LẠI theo bộ vẽ vector (VeVector.robot thân hai bánh + tay kẹp + cảm biến khoảng cách trên nền tím chàm vecBrand,
#   bo góc 22% cho icon thường, tràn cạnh cho maskable; xuất từ trình duyệt bằng canvas.toDataURL). Tệp này là bản PIXEL cũ, giữ để tham khảo tới V7c; chạy lại sẽ ghi đè icon vector.
# Vẽ icon app (hoc/game/icon/*.png) từ hình robot pixel của màn khởi đầu (thân hai bánh + tay kẹp + cảm biến khoảng cách; thân xe bản 22/10: mũi thuôn, đèn hậu đỏ).
# Hình robot chép từ VeRobot.ve(..., tỉ lệ 1) trong trình duyệt, cắt sát mép; đổi robot thì chép lại ROBOT / BANG_MAU.
# Dùng: python -I tools/ve-icon.py   (cần Pillow)
import os
from PIL import Image, ImageDraw

BANG_MAU = ['1b120a', '9aa3b5', '7ff0ff', '596274', '292a35', 'ffe888', 'df4b4b', 'ffcf30', 'd99418', '26324e', 'dbe3ed', 'a8dc72']
ROBOT = [
    '...aaaaaaaa.....................',
    '...abbbccac.....................',
    'aaaabbbccaaa......aaaaaaaaaaaaaa',
    'adeeedeeedea......aaaffffffffaaf',
    'aaaaaaaaaaaa......aaaffffffffaaf',
    'aaaaaaaaaaaaaaa...aaaaaaaaaaaaaf',
    'agghhhhhhhhhhhha..aba........aaa',
    'aggihhhhhhjjjjjhaaaba...........',
    'ahiihhhhhhjjjjjhakaba...........',
    'ahiihihihhjjjjjhakaaaa..........',
    'ahiihihihhjjjjjhlkaaaa..........',
    'ahiihihihhjjjjjhllaba...........',
    'ahiihihihhjjjjjhllaba...........',
    'ahiihihihhjjjjjhlkaaaa..........',
    'ahiihihihhjjjjjhakaaaa..........',
    'ahiihhhhhhjjjjjhakaba...........',
    'aggihhhhhhjjjjjhaaaba...........',
    'agghhhhhhhhhhhha..aba........aaa',
    'aaaaaaaaaaaaaaa...aaaaaaaaaaaaaf',
    'aaaaaaaaaaaa......aaahhhhhhhhaaf',
    'adeabbbccaaa......aaahhhhhhhhaaf',
    'aaaabbbccaca......aaaaaaaaaaaaaa',
    '...aaaaaaaa.....................',
]
GO, VIEN, BANG, VANG = '#2a1d14', '#1b120a', '#1d5a44', '#ffd95a'
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hoc', 'game', 'icon')


def ve(co, phan, ten, tran=False):
    im = Image.new('RGB', (co, co), BANG if tran else GO)
    d = ImageDraw.Draw(im)
    if not tran:                                   # icon thường: khung gỗ, tấm bảng xanh, dải vàng dưới đáy
        le, b = round(co * 0.06), max(2, co // 64)
        d.rectangle([le - b, le - b, co - le + b - 1, co - le + b - 1], fill=VIEN)
        d.rectangle([le, le, co - le - 1, co - le - 1], fill=BANG)
        d.rectangle([le, co - le - round(co * 0.08), co - le - 1, co - le - 1], fill=VANG)
    rong, cao = len(ROBOT[0]), len(ROBOT)
    s = int(co * phan // max(rong, cao))            # phóng nguyên lần, giữ pixel vuông
    x0, y0 = (co - rong * s) // 2, (co - cao * s) // 2 - (0 if tran else round(co * 0.03))
    for y, hang in enumerate(ROBOT):
        for x, c in enumerate(hang):
            if c != '.':
                d.rectangle([x0 + x * s, y0 + y * s, x0 + (x + 1) * s - 1, y0 + (y + 1) * s - 1], fill='#' + BANG_MAU[ord(c) - 97])
    im.save(os.path.join(RA, ten), optimize=True)


os.makedirs(RA, exist_ok=True)
ve(192, 0.66, 'icon-192.png')
ve(512, 0.66, 'icon-512.png')
ve(512, 0.5, 'icon-maskable-512.png', tran=True)    # maskable: nền phủ kín, robot nằm trong vòng an toàn 80%
print('xong:', sorted(os.listdir(RA)))
