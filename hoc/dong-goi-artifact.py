# Đóng gói hoc/game/choi.html thành trang Artifact nhiều tệp.
# Mỗi tệp gói < 40KB (máy này lỗi EBADF với tệp chữ lớn), chữ mã hóa ASCII bằng json.
# Dùng: python -X utf8 -I dong-goi-artifact.py <thu-muc-game> <thu-muc-ra>
# Máy kiểm: hoc/kiem-dong-goi-artifact.mjs (chạy tệp này ra thư mục tạm rồi soát CSS / script / phông vector có đủ).
import base64, json, os, re, sys, shutil

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

# CSS theo đúng thứ tự choi.html nạp (V7b 28/10): phông tự chứa, nền bố cục choi.css, rồi giao diện vector choi-vector.css
# (mặc định vector nên bản Artifact PHẢI có chúng; thiếu thì body.ve-vector mà không có luật phủ → giao diện vỡ).
# Phông: nhúng woff2 Google Sans Flex / Code (chế độ vector) dạng data: ngay trong font.css, KHÔNG gọi Google Fonts.
# Handjet / VT323 (chỉ pixel) không nhúng: bỏ khối @font-face (bản Artifact chạy vector).
CSS = ['font/font.css', 'choi.css', 'choi-vector.css']   # V7b việc 10: giao-dien-vector-b.css đã nối vào cuối choi-vector.css
PHONG_NHUNG = re.compile(r'url\((gs(?:flex|code)-[a-z-]+\.woff2)\)')
PHONG_PIXEL = re.compile(r'@font-face\s*\{[^}]*(?:handjet|vt323)-[a-z-]+\.woff2[^}]*\}\s*')

def nhung_phong(css):
    def thay(m):
        du_lieu = open(os.path.join(GAME, 'font', m.group(1)), 'rb').read()
        return 'url(data:font/woff2;base64,' + base64.b64encode(du_lieu).decode('ascii') + ')'
    css = PHONG_PIXEL.sub('', css)
    return PHONG_NHUNG.sub(thay, css)

for i, ten_css in enumerate(CSS):
    css = open(os.path.join(GAME, ten_css), encoding='utf-8').read()
    if ten_css == 'font/font.css':
        css = nhung_phong(css)
    goi('c', i, '/* ' + ten_css + ' */\n' + css + '\n')
so_css = len(tep)
for i, s in enumerate(srcs):
    chu = open(os.path.normpath(os.path.join(GAME, s)), encoding='utf-8').read()
    goi('j', i, chu + '\n//# sourceURL=' + s.replace('../', '') + '\n')

for ten, nd in tep:
    open(os.path.join(RA, ten), 'w', encoding='ascii', newline='\n').write(nd)

def the(ds):
    return '\n'.join('<script src="%s"></script>' % t for t, _ in ds)

# CSS: ghép mảnh theo chỉ số tệp (nhiều mảnh một tệp), đúng thứ tự CSS; JS: ghép mảnh theo chỉ số script rồi eval từng tệp
nap_css = """<script>(function(){var d=window.__DH||{c:[]},g={};d.c.forEach(function(p){(g[p[0]]=g[p[0]]||[]).push(p[1])});
var c=Object.keys(g).map(Number).sort(function(a,b){return a-b}).map(function(k){return g[k].join('')}).join('\\n');
var s=document.createElement('style');s.textContent=c;document.head.appendChild(s);})();</script>"""
nap_js = """<script>(function(){var d=window.__DH||{j:[]},g={};d.j.forEach(function(p){(g[p[0]]=g[p[0]]||[]).push(p[1])});
Object.keys(g).map(Number).sort(function(a,b){return a-b}).forEach(function(k){try{(0,eval)(g[k].join(''))}catch(e){console.error('Lỗi nạp tệp '+k,e)}});})();</script>"""

# nền tĩnh = vecNenSau (bang-mau.js), cùng theme-color / manifest (kiem-bang-mau.mjs NGOAI_LE ghim giá trị này)
trang = '''<title>Robot Chấn Hưng</title>
<meta name="theme-color" content="#e8e6f6">
<style>html,body{height:100%%;background:#e8e6f6}</style>
%s
%s
%s
%s
%s
''' % (the(tep[:so_css]), nap_css, stage, the(tep[so_css:]), nap_js)
open(os.path.join(RA, 'index.html'), 'w', encoding='utf-8', newline='\n').write(trang)
print('tệp gói:', len(tep), '· CSS:', so_css, '· lớn nhất:', max(len(n) for _, n in tep), '· index:', len(trang.encode('utf-8')))
