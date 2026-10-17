/* Hệ thống PART pixel: chạy cả trên trang xem lẫn Node. */
(function(root,factory){var api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.Part=api;})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';
  var K={ink:'#1b120a',vang:'#ffcf30',vangSang:'#ffe888',vangToi:'#d99418',thep:'#9aa3b5',thepSang:'#dbe3ed',thepToi:'#596274',kinh:'#26324e',xanh:'#7ff0ff',den:'#292a35',denSang:'#565968',go:'#c9853d',goSang:'#e5ad62',tim:'#56406f',timSang:'#9070b5',la:'#a8dc72',laSang:'#dcffad',do:'#df4b4b',xanhDuong:'#4f8dff'};
  /* VẬT NHỎ (luật vật 14/10): vẽ một vật n×n (n=8: vật nằm đất ≈ 57% ô; n=10: vật trong kẹp ≈ 45% ô tính theo pixel part) vào bất kỳ Painter có px/rect.
     chat 'sat' (khối sắt) hay gỗ (thùng nan chéo); mau: 'red'|'green'|'blue'|'yellow'|null (dải màu quanh thân). Dùng chung cho ve.js (vật trên sân) và tay kẹp (xem trang). */
  var MAU_VAT={red:['#d6493e','#f0847a','#8f2822'],green:['#35c47a','#7cf0aa','#16703f'],blue:['#3f7fe0','#7db0f7','#22489c'],yellow:['#efc531','#ffe784','#a07c10']};
  /* VẬT NAM CHÂM (chat 'nam-cham', cuc 'N' hay 'S'): khối đỏ ghi chữ N hoặc xanh dương ghi chữ S (chữ trắng 4×5 pixel). Cực ghi trên vật là cực quay về phía xe khi xe tới gần. */
  var CHU_CUC={N:['X..X','XX.X','X.XX','X..X','X..X'],S:['.XXX','X...','.XX.','...X','XXX.']};
  function veVatCuc(p,ox,oy,n,cuc){
    var c=MAU_VAT[cuc==='N'?'red':'blue'],m=n-2,i,j,g=CHU_CUC[cuc],cx=ox+((n-4)>>1),cy=oy+((n-5)>>1);
    for(i=1;i<n-1;i++){p.px(ox+i,oy,K.ink);p.px(ox+i,oy+n-1,K.ink);p.px(ox,oy+i,K.ink);p.px(ox+n-1,oy+i,K.ink);}
    p.rect(ox+1,oy+1,m,m,c[0]);p.rect(ox+1,oy+1,m,1,c[1]);p.rect(ox+1,oy+1,1,m,c[1]);p.rect(ox+1,oy+n-2,m,1,c[2]);p.rect(ox+n-2,oy+1,1,m,c[2]);
    for(j=0;j<5;j++)for(i=0;i<4;i++)if(g[j].charAt(i)==='X')p.px(cx+i,cy+j,'#ffffff');
    return p;
  }
  function veVatNho(p,ox,oy,n,chat,mau,cuc){
    if(chat==='nam-cham'&&(cuc==='N'||cuc==='S'))return veVatCuc(p,ox,oy,n||8,cuc);
    n=n||8;var m=n-2,sat=chat==='sat',base=sat?'#7f97b2':'#c98a45',lit=sat?'#dcecfa':'#e8b574',dk=sat?'#3f536c':'#8a5a24',mid=sat?'#a9c0d8':'#a8692a',i,c=MAU_VAT[mau];
    for(i=1;i<n-1;i++){p.px(ox+i,oy,K.ink);p.px(ox+i,oy+n-1,K.ink);p.px(ox,oy+i,K.ink);p.px(ox+n-1,oy+i,K.ink);}
    p.rect(ox+1,oy+1,m,m,base);p.rect(ox+1,oy+1,m,1,lit);p.rect(ox+1,oy+1,1,m,lit);p.rect(ox+1,oy+n-2,m,1,dk);p.rect(ox+n-2,oy+1,1,m,dk);
    if(sat){var q=(n>>1)-1;p.rect(ox+q,oy+q,2,2,mid);p.px(ox+q,oy+q,'#ffffff');p.px(ox+q+1,oy+q+1,'#4a5f7a');p.px(ox+2,oy+2,'#ffffff');p.px(ox+n-3,oy+n-3,'#6f87a3');}
    else for(i=2;i<n-2;i++){p.px(ox+i,oy+i,mid);p.px(ox+n-1-i,oy+i,mid);}
    if(c){var h=n>=10?3:2,y0=oy+((n-h)>>1),cs=h===3?[c[1],c[0],c[2]]:[c[0],c[0]];for(i=0;i<h;i++)p.rect(ox+1,y0+i,m,1,cs[i]);}
    return p;
  }
  /* Con mắt của camera (vẽ lên thân): tắt = xanh dịu, sáng (đang đọc) = lõi trắng + viền xanh bao quanh. Mỗi thân gọi hai lần, một mắt trái một mắt phải. */
  function veMat(p,x,y,w,h,sang){
    if(sang){p.rect(x-1,y-1,w+2,h+2,'#2c8fa4');p.rect(x,y,w,h,K.xanh);p.rect(x,y,w,1,'#ffffff');if(w>2)p.px(x+1,y+1,'#ffffff');}
    else p.rect(x,y,w,h,'#3fa9bb');
    return p;
  }
  function Painter(w,h){this.w=w;this.h=h;this.buf=new Array(w*h).fill(null);}
  Painter.prototype.px=function(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<this.w&&y<this.h)this.buf[y*this.w+x]=c;return this;};
  Painter.prototype.get=function(x,y){return x>=0&&y>=0&&x<this.w&&y<this.h?this.buf[y*this.w+x]:null;};
  Painter.prototype.rect=function(x,y,w,h,c){for(var j=0;j<h;j++)for(var i=0;i<w;i++)this.px(x+i,y+j,c);return this;};
  Painter.prototype.blit=function(q,ox,oy){for(var y=0;y<q.h;y++)for(var x=0;x<q.w;x++){var c=q.get(x,y);if(c)this.px(x+ox,y+oy,c);}return this;};
  Painter.prototype.canvas=function(){if(!root.document)return{w:this.w,h:this.h,buf:this.buf.slice()};var cv=root.document.createElement('canvas'),g=cv.getContext('2d'),id;cv.width=this.w;cv.height=this.h;id=g.createImageData(this.w,this.h);for(var i=0;i<this.buf.length;i++){var c=this.buf[i];if(!c)continue;var n=parseInt(c.slice(1),16);id.data[i*4]=n>>16;id.data[i*4+1]=(n>>8)&255;id.data[i*4+2]=n&255;id.data[i*4+3]=255;}g.putImageData(id,0,0);return cv;};
  function rot90(p){var q=new Painter(p.h,p.w);for(var y=0;y<p.h;y++)for(var x=0;x<p.w;x++)if(p.get(x,y))q.px(p.h-1-y,x,p.get(x,y));return q;}
  function state(s,k){return(s&&s[k])||s||{};}function copy(p){var q=new Painter(p.w,p.h);q.buf=p.buf.slice();return q;}
  var all={than:[],tay:[],'cam-bien':[]};
  function dangKy(d){if(!d||!all[d.loai]||!d.ma)throw new Error('PART không hợp lệ: cần loại và mã.');if(lay(d.loai,d.ma))throw new Error('PART đã tồn tại: '+d.loai+'/'+d.ma);all[d.loai].push(d);return d;}
  function ds(l){if(!all[l])throw new Error('Loại PART không hợp lệ: '+l);return all[l].slice();}
  function lay(l,m){for(var i=0;i<(all[l]||[]).length;i++)if(all[l][i].ma===m)return all[l][i];return null;}
  function chon(l,x){var m=typeof x==='string'?x:x&&x.ma,d=lay(l,m);if(!d)throw new Error('Không có '+l+' "'+m+'".');return d;}
  function veMot(d,s){var k=d.kich||{w:24,h:24},p=new Painter(k.w,k.h);d.ve(p,s||{});return p;}   /* d.kich: part có tấm vẽ rộng hơn 24×24 (tay xoay vươn sang hai bên); diemNeo tính trong tấm đó */
  function dat(p,d,o,n,s){var q=veMot(d,s);p.blit(q,o.x-n.x,o.y-n.y);}
  function gan(d){return Array.isArray(d.gan)?d.gan:[d.gan];}
  function oTay(than,tay){return than.ma==='drone'?['duoi']:gan(tay).filter(function(o){return o==='tay'&&than.oGan[o];});}
  function doiCam(cams){var out=[];cams.forEach(function(c){var o=c.o==='truoc'?'hong':c.o;if(o==='hong'){out.push({ma:c.ma,o:'hongTrai'});out.push({ma:c.ma,o:'hongPhai'});}else out.push({ma:c.ma,o:o});});return out;}
  function ghep(cauHinh,trangThai,huong){
    cauHinh=cauHinh||{};var than=chon('than',cauHinh.than),tay=cauHinh.tay?chon('tay',cauHinh.tay):null,cams=doiCam(cauHinh.camBien||[]),st=trangThai||{},i;
    if(than.ma==='drone'&&cams.some(function(c){return c.ma==='camera';}))throw new Error('Drone không gắn được camera: drone không có hướng mặt để nhìn "phía trước".');
    if(than.ma==='drone'){if(tay&&tay.ma!=='nam-cham')throw new Error('Drone không gắn được '+tay.ten+'.');for(i=0;i<cams.length;i++)if(['khoang-cach','mau'].indexOf(cams[i].ma)<0)throw new Error('Drone không gắn được '+chon('cam-bien',cams[i].ma).ten+'.');}  /* robot không tay (chương đầu): chỉ có thân */
    var coMau=cams.some(function(c){return c.ma==='mau';}),coCam=cams.some(function(c){return c.ma==='camera';});
    if(coCam&&coMau)throw new Error('Robot không gắn được cả cảm biến màu lẫn camera: color() sẽ không biết đọc ô nào. Chỉ giữ một trong hai.');
    if(tay&&!oTay(than,tay).length)throw new Error((than.ma==='drone'?'Drone':'Tay '+tay.ma)+' không gắn được vào ổ này.');
    var p=new Painter(40,40),goc={x:8,y:17},camera=false;
    for(i=0;i<cams.length;i++){var d=chon('cam-bien',cams[i].ma),o=than.oGan[cams[i].o];if(!o)throw new Error('Thân '+than.ma+' không có ổ "'+cams[i].o+'".');if(gan(d).indexOf(cams[i].o)<0)throw new Error('Cảm biến '+d.ma+' không gắn được vào ổ '+cams[i].o+'.');if(d.ma==='camera'){camera=true;continue;}}
    var ts=Object.assign({},state(st,'than'),{camera:camera,camSang:camera&&!!state(st,'camBien').mat});p.blit(veMot(than,ts),goc.x,goc.y);
    if(tay){var os=oTay(than,tay);for(i=0;i<os.length;i++){var oT=os[i],port=than.oGan[oT],tayState=Object.assign({},state(st,'tay'),{duoi:oT==='duoi',than:than.ma});dat(p,tay,{x:goc.x+port.x,y:goc.y+port.y},oT==='duoi'&&tay.diemNeoDuoi?tay.diemNeoDuoi:tay.diemNeo,tayState);}}
    for(i=0;i<cams.length;i++){var cb=chon('cam-bien',cams[i].ma);if(cb.ma==='camera')continue;var pc=than.oGan[cams[i].o];dat(p,cb,{x:goc.x+pc.x,y:goc.y+pc.y},cb.diemNeo,Object.assign({},state(st,'camBien'),{ben:cams[i].o==='hongTrai'?'trai':'phai'}));}
    huong=((huong||0)%4+4)%4;while(huong--)p=rot90(p);return p.canvas();
  }
  function hamGoc(c){var a=[],them=function(d){d.hamGoc.forEach(function(h){if(a.indexOf(h)<0)a.push(h);});};them(chon('than',c.than));if(c.tay)them(chon('tay',c.tay));(c.camBien||[]).forEach(function(x){them(chon('cam-bien',x.ma));});return a;}
  return{K:K,veVatNho:veVatNho,veMat:veMat,Painter:Painter,rot90:rot90,dangKy:dangKy,ds:ds,lay:lay,ghep:ghep,hamGoc:hamGoc,_veMot:veMot,_copy:copy};
});
