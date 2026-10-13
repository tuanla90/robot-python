import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url),Part=require('./part.js');
['hai-banh','xich','nhen','omni','drone'].forEach(x=>require('./part-'+x+'.js'));
['kep','day','nam-cham','nem','bong'].forEach(x=>require('./part-'+x+'.js'));
['khoang-cach','mau','cham','camera'].forEach(x=>require('./part-'+x+'.js'));

for(const loai of ['than','tay','cam-bien'])for(const d of Part.ds(loai)){
  assert.ok(d.ma&&d.ten&&Array.isArray(d.hamGoc)&&d.hamGoc.length&&typeof d.ve==='function',`${loai}/${d.ma} thiếu trường`);
  if(loai==='than'){
    const names=d.ma==='drone'?['truoc','duoi','tren']:['tayTrai','tayPhai','truoc','tren'];
    const ports=names.map(o=>{assert.ok(d.oGan[o]&&Number.isInteger(d.oGan[o].x)&&Number.isInteger(d.oGan[o].y),`${d.ma} thiếu ổ ${o}`);return`${d.oGan[o].x},${d.oGan[o].y}`});
    assert.equal(new Set(ports).size,ports.length,`${d.ma}: ổ gắn chồng nhau`);
    if(d.ma!=='drone'){
      assert.ok(d.oGan.tayTrai.x<=7&&d.oGan.tayTrai.y>=7&&d.oGan.tayTrai.y<=17,`${d.ma}: ổ tay trái phải ở hông ngoài`);
      assert.ok(d.oGan.tayPhai.x>=16&&d.oGan.tayPhai.y>=7&&d.oGan.tayPhai.y<=17,`${d.ma}: ổ tay phải phải ở hông ngoài`);
    }
    assert.ok(d.oGan.truoc.y<=7,`${d.ma}: ổ cảm biến trước phải ở 1/3 mũi xe`);
  }else assert.ok(d.diemNeo&&d.gan,`${d.ma} thiếu điểm neo hoặc ổ gắn`);
}
for(const cb of Part.ds('cam-bien'))assert.equal(cb.ma==='camera'?cb.gan:'truoc',cb.ma==='camera'?'tren':'truoc',`${cb.ma}: cảm biến phải ở mũi hoặc trên thân`);

function lienMotKhoi(cauHinh,trangThai={}){
  const image=Part.ghep(cauHinh,trangThai),mask=image.buf.map(Boolean),first=mask.findIndex(Boolean),seen=new Set([first]),queue=[first];
  while(queue.length){const n=queue.pop(),x=n%40,y=(n-x)/40;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,next=yy*40+xx;if((dx||dy)&&xx>=0&&yy>=0&&xx<40&&yy<40&&mask[next]&&!seen.has(next)){seen.add(next);queue.push(next)}}}
  assert.equal(seen.size,mask.filter(Boolean).length,`${cauHinh.than}/${cauHinh.tay}: part phải nối liền thân`);
}
for(const than of Part.ds('than').filter(x=>x.ma!=='drone'))for(const tay of Part.ds('tay')){
  lienMotKhoi({than:than.ma,tay:tay.ma});
  lienMotKhoi({than:than.ma,tay:tay.ma},{tay:{kep:'dong',cam:true,dangNem:true,dangBan:true,ngam:3}});
}
for(const than of Part.ds('than').filter(x=>x.ma!=='drone'))for(const tay of Part.ds('tay'))for(const cb of Part.ds('cam-bien')){
  assert.doesNotThrow(()=>Part.ghep({than:than.ma,tay:tay.ma,camBien:[{ma:cb.ma,o:cb.gan}]},{camBien:{bat:true}}));
}
assert.doesNotThrow(()=>Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'camera',o:'tren'},{ma:'khoang-cach',o:'truoc'},{ma:'mau',o:'truoc'}]}));
for(const bad of ['kep','day','nem','bong'])assert.throws(()=>Part.ghep({than:'drone',tay:bad}),/Drone không gắn được/);
assert.throws(()=>Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'cham',o:'truoc'}]}),/Drone không gắn được/);

function silhouette(d){return Part._veMot(d,{}).buf.map(Boolean)}
function khacDang(a,b){let diff=0,union=0;for(let i=0;i<a.length;i++){if(a[i]||b[i])union++;if(a[i]!==b[i])diff++}return diff/union}
function checkKhac(loai){const a=Part.ds(loai);for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)assert.ok(khacDang(silhouette(a[i]),silhouette(a[j]))>=.25,`${loai} ${a[i].ma}/${a[j].ma} chưa khác dáng 25%`)}
checkKhac('than');checkKhac('tay');
const c={than:'hai-banh',tay:'nem',camBien:[{ma:'camera',o:'tren'}]},a=Part._veMot(Part.lay('than','hai-banh'),{});let q=a;for(let i=0;i<4;i++)q=Part.rot90(q);assert.deepEqual(q.buf,a.buf,'quay 4 lần phải trở về ảnh gốc');
const hs=Part.hamGoc(c);assert.equal(hs.length,new Set(hs).size,'hàm gốc gộp bộ trùng');assert.ok(hs.includes('aim')&&hs.includes('throw'),'máy ném phải có aim, throw');assert.ok(Part.hamGoc({than:'omni',tay:'bong'}).includes('shoot'),'ống bóng phải có shoot');
console.log(`OK: ${Part.ds('than').length+Part.ds('tay').length+Part.ds('cam-bien').length} PART, hông/mũi, nối liền, drone và silhouette đã kiểm.`);
