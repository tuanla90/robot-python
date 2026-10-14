# Đóng gói robotics/hoc/game/choi.html thành trang Artifact nhiều tệp.
# Mỗi tệp gói < 40KB (máy này lỗi EBADF với tệp chữ lớn), chữ mã hóa ASCII bằng json.
# Dùng: python -I dong-goi-artifact.py <thu-muc-game> <thu-muc-ra>
import json, os, re, sys, shutil

GAME, RA = sys.argv[1], sys.argv[2]
MAX = 38000

html = open(os.path.join(GAME, 'choi.html'), encoding='utf-8').read()
srcs = re.findall(r'<script src="([^"]+)"></script>', html)
stage = re.search(r'(<div id="stage">.*?</div>\s*</div>)', html, re.S)
stage = re.search(r'<body>\s*(.*?)\s*<!--', html, re.S).group(1)

if os.path.isdir(RA):
    shutil.rmtree(RA)
os.makedirs(os.path.join(RA, 'g'))

def cat_manh(chu, kich):
    # cắt chuỗi thành các mảnh sao cho json.dumps của mỗi mảnh <= kich byte
    out, i = [], 0
    while i < len(chu):
        n = min(len(chu) - i, kich)
        while len(json.dumps(chu[i:i + n])) > kich:
            n = int(n * 0.8)
        out.append(chu[i:i + n]); i += n
    return out

tep = []  # (ten tep, noi dung)
def goi(nhom, idx, chu):
    for m in cat_manh(chu, MAX - 100):
        ten = 'g/%s%03d.js' % (nhom, len(tep))
        tep.append((ten, 'window.__DH=window.__DH||{c:[],j:[]};__DH.%s.push([%d,%s]);\n' % (nhom, idx, json.dumps(m))))

css = open(os.path.join(GAME, 'choi.css'), encoding='utf-8').read()
goi('c', 0, css)
so_css = len(tep)
for i, s in enumerate(srcs):
    chu = open(os.path.normpath(os.path.join(GAME, s)), encoding='utf-8').read()
    goi('j', i, chu + '\n//# sourceURL=' + s.replace('../', '') + '\n')

for ten, nd in tep:
    open(os.path.join(RA, ten), 'w', encoding='ascii', newline='\n').write(nd)

def the(ds):
    return '\n'.join('<script src="%s"></script>' % t for t, _ in ds)

nap_css = """<script>(function(){var c=(window.__DH||{c:[]}).c.map(function(p){return p[1]}).join('');
var s=document.createElement('style');s.textContent=c;document.head.appendChild(s);})();</script>"""
nap_js = """<script>(function(){var d=window.__DH||{j:[]},g={};d.j.forEach(function(p){(g[p[0]]=g[p[0]]||[]).push(p[1])});
Object.keys(g).map(Number).sort(function(a,b){return a-b}).forEach(function(k){try{(0,eval)(g[k].join(''))}catch(e){console.error('Lỗi nạp tệp '+k,e)}});})();</script>"""

trang = '''<title>Đường học</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Handjet:wght@400..800&family=VT323&display=swap" rel="stylesheet">
<style>html,body{height:100%%;background:#2a1d14}</style>
%s
%s
%s
%s
%s
''' % (the(tep[:so_css]), nap_css, stage, the(tep[so_css:]), nap_js)
open(os.path.join(RA, 'index.html'), 'w', encoding='utf-8', newline='\n').write(trang)
print('tệp gói:', len(tep), '· lớn nhất:', max(len(n) for _, n in tep), '· index:', len(trang.encode('utf-8')))
