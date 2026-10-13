/* Sổ PART robot: chạy được cả trên trang xem lẫn Node. */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.Part = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  var K = { ink: '#1b120a', vang: '#ffcf30', vangSang: '#ffe888', vangToi: '#d99418',
    thep: '#9aa3b5', thepSang: '#dbe3ed', thepToi: '#596274', kinh: '#26324e',
    xanh: '#7ff0ff', den: '#292a35', denSang: '#565968', go: '#c9853d', goSang: '#e5ad62' };

  function Painter(w, h) { this.w = w; this.h = h; this.buf = new Array(w * h).fill(null); }
  Painter.prototype.px = function (x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.buf[y * this.w + x] = c; return this; };
  Painter.prototype.get = function (x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.buf[y * this.w + x] : null; };
  Painter.prototype.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.px(x + i, y + j, c); return this; };
  Painter.prototype.map = function (rows, pal, ox, oy) { ox = ox || 0; oy = oy || 0; for (var y = 0; y < rows.length; y++) for (var x = 0; x < rows[y].length; x++) if (pal[rows[y].charAt(x)]) this.px(x + ox, y + oy, pal[rows[y].charAt(x)]); return this; };
  Painter.prototype.blit = function (q, ox, oy) { for (var y = 0; y < q.h; y++) for (var x = 0; x < q.w; x++) { var c = q.get(x, y); if (c) this.px(x + ox, y + oy, c); } return this; };
  Painter.prototype.outline = function (c) { var a = [], x, y; for (y = 0; y < this.h; y++) for (x = 0; x < this.w; x++) if (!this.get(x, y) && (this.get(x-1,y)||this.get(x+1,y)||this.get(x,y-1)||this.get(x,y+1))) a.push([x,y]); for (var i=0;i<a.length;i++) this.px(a[i][0],a[i][1],c || K.ink); return this; };
  Painter.prototype.canvas = function () { if (!root.document) return { w: this.w, h: this.h, buf: this.buf.slice() }; var cv = root.document.createElement('canvas'), g, id; cv.width=this.w; cv.height=this.h; g=cv.getContext('2d'); id=g.createImageData(this.w,this.h); for(var i=0;i<this.buf.length;i++){var c=this.buf[i];if(!c)continue;var n=parseInt(c.slice(1),16);id.data[i*4]=n>>16;id.data[i*4+1]=(n>>8)&255;id.data[i*4+2]=n&255;id.data[i*4+3]=255;} g.putImageData(id,0,0); return cv; };
  function rot90(p) { var q = new Painter(p.h, p.w); for (var y=0;y<p.h;y++) for(var x=0;x<p.w;x++) if(p.get(x,y)) q.px(p.h-1-y,x,p.get(x,y)); return q; }
  function state(s, key) { return (s && s[key]) || s || {}; }
  function copy(p) { var q = new Painter(p.w,p.h); q.buf=p.buf.slice(); return q; }
  var all = { than: [], tay: [], 'cam-bien': [] };
  function dangKy(def) { if (!def || !all[def.loai] || !def.ma) throw new Error('PART không hợp lệ: cần loai và ma.'); if (lay(def.loai, def.ma)) throw new Error('PART đã tồn tại: '+def.loai+'/'+def.ma); all[def.loai].push(def); return def; }
  function ds(loai) { if (!all[loai]) throw new Error('Loại PART không hợp lệ: '+loai); return all[loai].slice(); }
  function lay(loai, ma) { for(var i=0;i<(all[loai]||[]).length;i++) if(all[loai][i].ma===ma) return all[loai][i]; return null; }
  function chon(loai, x) { var ma = typeof x === 'string' ? x : x && x.ma; var d = lay(loai, ma); if (!d) throw new Error('Không có '+loai+' "'+ma+'".'); return d; }
  function veMot(def, st) { var p = new Painter(24,24); def.ve(p, st || {}); return p; }
  function dat(p, def, o, neo, st) { var q=veMot(def,st); p.blit(q, o.x-neo.x, o.y-neo.y); }
  function ghep(cauHinh, trangThai, huong) {
    cauHinh=cauHinh||{}; var than=chon('than',cauHinh.than); var tay=chon('tay',cauHinh.tay); var cams=cauHinh.camBien||[];
    if (!than.oGan || !than.oGan.tay) throw new Error('Thân '+than.ma+' thiếu ổ tay.');
    if ((Array.isArray(tay.gan)?tay.gan:[tay.gan]).indexOf('tay')<0) throw new Error('Tay '+tay.ma+' không gắn được vào ổ tay.');
    var p=new Painter(40,40), goc={x:8,y:8}, st=trangThai||{};
    cams.forEach(function(c){ var d=chon('cam-bien',c.ma); var o=than.oGan[c.o]; if(!o) throw new Error('Thân '+than.ma+' không có ổ "'+c.o+'".'); if((Array.isArray(d.gan)?d.gan:[d.gan]).indexOf(c.o)<0) throw new Error('Cảm biến '+d.ma+' chỉ gắn được vào ổ '+(Array.isArray(d.gan)?d.gan.join(', '):d.gan)+', không phải '+c.o+'.'); if(c.o==='duoi') dat(p,d,{x:goc.x+o.x,y:goc.y+o.y},d.diemNeo, state(st,'camBien')); });
    p.blit(veMot(than,state(st,'than')),goc.x,goc.y);
    dat(p,tay,{x:goc.x+than.oGan.tay.x,y:goc.y+than.oGan.tay.y},tay.diemNeo,state(st,'tay'));
    cams.forEach(function(c){if(c.o==='duoi')return;var d=chon('cam-bien',c.ma),o=than.oGan[c.o];dat(p,d,{x:goc.x+o.x,y:goc.y+o.y},d.diemNeo,state(st,'camBien'));});
    huong=((huong||0)%4+4)%4; while(huong--) p=rot90(p); return p.canvas();
  }
  function hamGoc(cauHinh) { var a=[], them=function(d){d.hamGoc.forEach(function(h){if(a.indexOf(h)<0)a.push(h);});}; them(chon('than',cauHinh.than)); them(chon('tay',cauHinh.tay)); (cauHinh.camBien||[]).forEach(function(c){them(chon('cam-bien',c.ma));}); return a; }
  return { K:K, Painter:Painter, rot90:rot90, dangKy:dangKy, ds:ds, lay:lay, ghep:ghep, hamGoc:hamGoc, _veMot:veMot, _copy:copy };
});
