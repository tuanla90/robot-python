#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Ghép ảnh khung soát (tools/chup-khung.mjs) thành một bảng: 4 cột, mỗi ô 300×533 + nhãn tên tệp.
Chạy: python tools/ghep-soat.py out/soat/<mã gói> [out/soat/<mã gói>.png]"""
import os, sys
from PIL import Image, ImageDraw

thu = sys.argv[1]
ra = sys.argv[2] if len(sys.argv) > 2 else thu.rstrip('/\\') + '.png'
ten = sorted(f for f in os.listdir(thu) if f.endswith('.png'))
if not ten:
    sys.exit('không có ảnh trong ' + thu)
W, H, NHAN, COT = 300, 533, 26, 4
hang = (len(ten) + COT - 1) // COT
bang = Image.new('RGB', (COT * W, hang * (H + NHAN)), (30, 27, 58))
ve = ImageDraw.Draw(bang)
for i, f in enumerate(ten):
    anh = Image.open(os.path.join(thu, f)).convert('RGB').resize((W, H), Image.LANCZOS)
    x, y = (i % COT) * W, (i // COT) * (H + NHAN)
    bang.paste(anh, (x, y + NHAN))
    ve.text((x + 6, y + 5), f[:-4], fill=(255, 255, 255))
bang.save(ra)
print(ra, len(ten), 'anh')
