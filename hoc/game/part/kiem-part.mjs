import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url),Part=require('./part.js');
['hai-banh','xich','nhen','omni','drone'].forEach(x=>require('./part-'+x+'.js'));
['kep','nam-cham','nem','hoi','tay-xoay','son'].forEach(x=>require('./part-'+x+'.js'));
['khoang-cach','mau','cham','camera','camera-bay'].forEach(x=>require('./part-'+x+'.js'));

for(const loai of ['than','tay','cam-bien'])for(const d of Part.ds(loai)){
  assert.ok(d.ma&&d.ten&&Array.isArray(d.hamGoc)&&d.hamGoc.length&&typeof d.ve==='function',`${loai}/${d.ma} thiếu trường`);
  if(loai==='than'){
    const names=d.ma==='drone'?['hongTrai','hongPhai','duoi','tren','bung']:['tay','hongTrai','hongPhai','tren'];
    const ports=names.map(o=>{assert.ok(d.oGan[o]&&Number.isInteger(d.oGan[o].x)&&Number.isInteger(d.oGan[o].y),`${d.ma} thiếu ổ ${o}`);return`${d.oGan[o].x},${d.oGan[o].y}`});
    assert.equal(new Set(ports).size,ports.length,`${d.ma}: ổ gắn chồng nhau`);
    assert.ok(d.oGan.hongTrai.x<=6&&d.oGan.hongPhai.x>=17,`${d.ma}: cảm biến phải ở hai mép hông`);
    if(d.ma!=='drone')assert.ok(d.oGan.tay.y<=8&&d.oGan.tay.x>=8&&d.oGan.tay.x<=16,`${d.ma}: ổ tay phải ở 1/3 phía trước lưới`);
  }else assert.ok(d.diemNeo&&d.gan,`${d.ma} thiếu điểm neo hoặc ổ gắn`);
}
for(const tay of Part.ds('tay'))assert.ok((Array.isArray(tay.gan)?tay.gan:[tay.gan]).includes('tay')||tay.ma==='nam-cham',`${tay.ma}: tay phải gắn ở mũi`);
for(const cb of Part.ds('cam-bien'))assert.ok(cb.ma==='camera'?cb.gan==='tren':cb.ma==='camera-bay'?cb.gan==='bung':(Array.isArray(cb.gan)?cb.gan:[cb.gan]).includes('hong'),`${cb.ma}: cảm biến phải ở hông, trên thân (camera) hoặc ở ổ bụng drone (camera-bay)`);

function lienMotKhoi(cauHinh,trangThai={}){
  const image=Part.ghep(cauHinh,trangThai),mask=image.buf.map(Boolean),first=mask.findIndex(Boolean),seen=new Set([first]),queue=[first];
  while(queue.length){const n=queue.pop(),x=n%40,y=(n-x)/40;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,next=yy*40+xx;if((dx||dy)&&xx>=0&&yy>=0&&xx<40&&yy<40&&mask[next]&&!seen.has(next)){seen.add(next);queue.push(next)}}}
  assert.equal(seen.size,mask.filter(Boolean).length,`${cauHinh.than}/${cauHinh.tay}: part phải nối liền thân`);
}
function tayKhongAnSau(than,tay,trangThai={}){
  const body=Part._veMot(than,{}),arm=Part._veMot(tay,Object.assign({than:than.ma},trangThai)),port=than.oGan.tay;
  for(let y=0;y<arm.h;y++)for(let x=0;x<arm.w;x++)if(arm.get(x,y)){
    const bx=x+port.x-tay.diemNeo.x,by=y+port.y-tay.diemNeo.y;
    if(!body.get(bx,by))continue;
    if(tay.duoiTuHang!==undefined&&by>=tay.duoiTuHang)continue;   /* súng hơi: nòng sau gắn vào đuôi thân, chỉ phần nòng trước (mũi xe) phải nằm sát mũi */
    let front=24;for(let yy=0;yy<24;yy++)if(body.get(bx,yy)){front=yy;break;}
    assert.ok(by<=front+2,`${than.ma}/${tay.ma}: tay lấn sâu quá 2px vào thân tại ${bx},${by}`);
  }
}
for(const than of Part.ds('than').filter(x=>x.ma!=='drone'))for(const tay of Part.ds('tay')){
  lienMotKhoi({than:than.ma,tay:tay.ma});
  lienMotKhoi({than:than.ma,tay:tay.ma},{tay:{kep:'dong',cam:true,tuThe:'duoi',dangNem:true,dangBanTruoc:true,dangBanSau:true,ngam:3}});
  tayKhongAnSau(than,tay);tayKhongAnSau(than,tay,{kep:'dong',cam:true,tuThe:'duoi',dangNem:true,dangBanTruoc:true,dangBanSau:true,ngam:3});
}
for(const than of Part.ds('than').filter(x=>x.ma!=='drone'))for(const tay of Part.ds('tay'))for(const cb of Part.ds('cam-bien').filter(x=>x.ma!=='camera-bay')){
  const cams=cb.ma==='camera'?[{ma:cb.ma,o:'tren'}]:[{ma:cb.ma,o:'hong'}];
  assert.doesNotThrow(()=>Part.ghep({than:than.ma,tay:tay.ma,camBien:cams},{camBien:{bat:true}}));
}
assert.doesNotThrow(()=>Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'khoang-cach',o:'hong'},{ma:'mau',o:'hong'}]}));
/* Luật color() 14/10: camera nhìn ô trước mặt, cảm biến màu đọc ô dưới xe — không ghép cùng nhau; drone không có camera. */
assert.throws(()=>Part.ghep({than:'hai-banh',tay:null,camBien:[{ma:'camera',o:'tren'},{ma:'mau',o:'hong'}]}),/cả cảm biến màu lẫn camera/);
assert.throws(()=>Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'camera',o:'tren'}]}),/Drone không gắn được camera/);
assert.deepEqual(Part.hamGoc({than:'hai-banh',camBien:[{ma:'camera',o:'tren'}]}).filter(h=>h==='color'),['color'],'camera mở hàm gốc color');
for(const than of ['hai-banh','xich','nhen','omni']){
  const tat=Part.ghep({than,tay:null,camBien:[{ma:'camera',o:'tren'}]},{}),sang=Part.ghep({than,tay:null,camBien:[{ma:'camera',o:'tren'}]},{camBien:{mat:true}}),khong=Part.ghep({than,tay:null,camBien:[]},{});
  assert.notDeepEqual(tat.buf,khong.buf,`${than}: gắn camera phải hiện đôi mắt`);assert.notDeepEqual(tat.buf,sang.buf,`${than}: mắt phải sáng lên khi đọc`);
  assert.equal(tat.buf.filter(Boolean).length,khong.buf.filter(Boolean).length,`${than}: đôi mắt nằm trong thân, không thêm cột camera`);
}

/* CAMERA NHÌN XUỐNG của drone (16/10, mã camera-bay, ổ bung, mở look()): chỉ drone gắn được; ló ra mép trên khung; sáng lên khi đọc; nối liền thân; không chồng nam châm treo ở ổ duoi. */
{
  const bay=Part.lay('cam-bien','camera-bay');
  assert.ok(bay&&bay.gan==='bung'&&bay.hamGoc.length===1&&bay.hamGoc[0]==='look','camera-bay: gắn ổ bung, mở đúng hàm look');
  assert.deepEqual(Part.hamGoc({than:'drone',tay:null,camBien:[{ma:'camera-bay',o:'bung'}]}).filter(h=>h==='look'),['look'],'camera-bay mở hàm gốc look');
  assert.ok(!Part.hamGoc({than:'drone',tay:'nam-cham',camBien:[]}).includes('look'),'drone không camera thì không có look');
  for(const tay of [null,'nam-cham']){
    const cfg={than:'drone',tay,camBien:[{ma:'camera-bay',o:'bung'}]},khong=Part.ghep({than:'drone',tay,camBien:[]},{}),tat=Part.ghep(cfg,{}),sang=Part.ghep(cfg,{camBien:{mat:true}}),nhe=Part.ghep(cfg,{camBien:{bat:true}});
    assert.notDeepEqual(tat.buf,khong.buf,`drone/${tay}: gắn camera nhìn xuống phải hiện cụm ống kính`);
    assert.notDeepEqual(tat.buf,sang.buf,`drone/${tay}: kính phải sáng lên khi đang đọc look()`);assert.notDeepEqual(tat.buf,nhe.buf,`drone/${tay}: kính sáng nhẹ khi cảm biến bật`);assert.notDeepEqual(sang.buf,nhe.buf);
    lienMotKhoi(cfg);lienMotKhoi(cfg,{camBien:{mat:true}});lienMotKhoi(cfg,{camBien:{bat:true}});
    assert.ok(tat.buf.filter(Boolean).length-khong.buf.filter(Boolean).length>=30,`drone/${tay}: cụm ống kính tối thiểu 30 pixel`);
    for(let i=0;i<40;i++){assert.ok(!sang.buf[i],`drone/${tay}: quầng sáng chạm mép trên ảnh`);assert.ok(!sang.buf[i*40],'quầng sáng chạm mép trái');assert.ok(!sang.buf[i*40+39],'quầng sáng chạm mép phải');}
  }
  /* ống kính nằm ở nửa trên của khung, giữa hai cánh quạt trên; nam châm treo ở nửa dưới: hai thứ không đè nhau */
  {const a=Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'camera-bay',o:'bung'}]},{}),b=Part.ghep({than:'drone',tay:'nam-cham',camBien:[]},{});
   const them=[];for(let i=0;i<a.buf.length;i++)if(a.buf[i]&&!b.buf[i])them.push(i);
   assert.ok(them.length&&them.every(i=>{const x=i%40,y=(i-x)/40;return y<=24&&x>=14&&x<=27;}),'camera-bay: pixel thêm nằm ở mép trên khung, giữa hai cánh quạt trên');
   for(let i=0;i<a.buf.length;i++)if(b.buf[i])assert.equal(a.buf[i],b.buf[i],'camera-bay chỉ thêm pixel, không đổi màu pixel nào của drone');}
  assert.throws(()=>Part.ghep({than:'hai-banh',tay:null,camBien:[{ma:'camera-bay',o:'bung'}]}),/chỉ gắn được lên drone|không có ổ/,'xe không gắn camera nhìn xuống');
  for(const t of ['xich','nhen','omni'])assert.throws(()=>Part.ghep({than:t,tay:null,camBien:[{ma:'camera-bay',o:'bung'}]}),/chỉ gắn được lên drone|không có ổ/,`${t}: không gắn camera nhìn xuống`);
  assert.throws(()=>Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'camera-bay',o:'hong'}]}),/không gắn được vào ổ/,'camera-bay không gắn ổ hông');
  assert.doesNotThrow(()=>Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'camera-bay',o:'bung'},{ma:'mau',o:'hong'}]}),'drone gắn được cả cảm biến màu ở hông lẫn camera nhìn xuống');
}

for(const bad of ['kep','nem','hoi','son'])assert.throws(()=>Part.ghep({than:'drone',tay:bad}),/Drone không gắn được/);
assert.throws(()=>Part.ghep({than:'drone',tay:'nam-cham',camBien:[{ma:'cham',o:'hong'}]}),/Drone không gắn được/);

function silhouette(d){const q=Part._veMot(d,{}),n=d.diemNeo||{x:12,y:12},W=64,out=new Array(W*W).fill(false);for(let y=0;y<q.h;y++)for(let x=0;x<q.w;x++)if(q.get(x,y)){const X=x-n.x+32,Y=y-n.y+32;if(X>=0&&Y>=0&&X<W&&Y<W)out[Y*W+X]=true}return out}   /* neo theo điểm gắn: tay xoay có tấm vẽ rộng hơn 24×24 */
function khacDang(a,b){let diff=0,union=0;for(let i=0;i<a.length;i++){if(a[i]||b[i])union++;if(a[i]!==b[i])diff++}return diff/union}
function checkKhac(loai){const a=Part.ds(loai);for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)assert.ok(khacDang(silhouette(a[i]),silhouette(a[j]))>=.25,`${loai} ${a[i].ma}/${a[j].ma} chưa khác dáng 25%`)}
checkKhac('than');checkKhac('tay');checkKhac('cam-bien');
const c={than:'hai-banh',tay:'nem',camBien:[{ma:'camera',o:'tren'}]},a=Part._veMot(Part.lay('than','hai-banh'),{});let q=a;for(let i=0;i<4;i++)q=Part.rot90(q);assert.deepEqual(q.buf,a.buf,'quay 4 lần phải trở về ảnh gốc');
const hs=Part.hamGoc(c);assert.equal(hs.length,new Set(hs).size,'hàm gốc gộp bộ trùng');assert.ok(hs.includes('aim')&&hs.includes('throw'),'máy ném phải có aim, throw');assert.ok(Part.hamGoc({than:'omni',tay:'hoi'}).includes('shoot')&&Part.hamGoc({than:'omni',tay:'hoi'}).includes('shoot_back'),'súng hơi phải có shoot và shoot_back');
/* SÚNG HƠI (15/10): hai nòng — nòng trước ở mũi xe, nòng sau ở đuôi xe; mỗi nòng có hình lúc bắn riêng. Mọi thân có hướng mặt (hai bánh, xích, omni, nhện) đều gắn được. */
{
  assert.deepEqual(Part.hamGoc({than:'hai-banh',tay:'son'}).filter(h=>['ink','dot','pen_down','pen_up'].includes(h)).sort(),['dot','ink','pen_down','pen_up'],'máy sơn mở ink, dot, pen_down, pen_up');
  {const a=Part.ghep({than:'hai-banh',tay:'son'},{tay:{mauSon:'red'}}),b=Part.ghep({than:'hai-banh',tay:'son'},{tay:{mauSon:'blue'}}),c=Part.ghep({than:'hai-banh',tay:'son'},{tay:{mauSon:'blue',tuThe:'duoi'}});
   assert.ok(a.buf.some((x,i)=>x!==b.buf[i]),'đổi màu sơn thì lon sơn đổi màu');assert.ok(c.buf.filter(Boolean).length>b.buf.filter(Boolean).length,'đầu sơn hạ: chổi dài hơn');}
  const hoi=Part.lay('tay','hoi');
  assert.ok(hoi&&hoi.kich&&hoi.kich.h>24,'súng hơi có tấm vẽ cao hơn 24 hàng để chứa nòng sau');
  assert.deepEqual(Part.hamGoc({than:'hai-banh',tay:'hoi'}).filter(h=>h.startsWith('shoot')).sort(),['shoot','shoot_back'],'súng hơi mở shoot và shoot_back');
  for(const t of ['hai-banh','xich','omni','nhen']){
    const an=(st)=>Part.ghep({than:t,tay:'hoi'},{tay:st}),khong=Part.ghep({than:t,tay:null},{}),yen=an({}),truoc=an({dangBanTruoc:true}),sau=an({dangBanSau:true});
    assert.notDeepEqual(truoc.buf,yen.buf,`${t}: nòng trước bắn phải khác lúc yên`);assert.notDeepEqual(sau.buf,yen.buf,`${t}: nòng sau bắn phải khác lúc yên`);assert.notDeepEqual(truoc.buf,sau.buf,`${t}: hai nòng bắn phải khác nhau`);
    const dem=(a,y0,y1)=>{let n=0;for(let y=y0;y<=y1;y++)for(let x=0;x<40;x++)if(a.buf[y*40+x])n++;return n};
    /* nòng sau nhô ra ngoài đuôi thân: có pixel ở những hàng mà thân không có (hàng cuối ảnh, 38..39) */
    assert.ok(dem(yen,38,39)>dem(khong,38,39),`${t}: nòng sau phải nhô khỏi đuôi thân`);
    /* nòng trước nhô ra trước mũi: có pixel ở những hàng phía trên thân */
    assert.ok(dem(yen,0,19)>0,`${t}: nòng trước phải nhô phía trước mũi`);
    /* đối xứng trái-phải quanh trục thân: không có thành phần lệch */
    const g=(a)=>{let l=0,r=0;for(let y=0;y<40;y++)for(let x=0;x<40;x++)if(a.buf[y*40+x]){if(x<20)l++;else r++}return[l,r]};
    if(t!=='nhen'){const [l,r]=g(yen),[l0,r0]=g(khong);assert.ok(Math.abs((l-l0)-(r-r0))<=6,`${t}: súng hơi phải cân hai bên thân`);}
  }
  /* xoay bốn hướng không mất pixel nào của tay */
  for(let h=0;h<4;h++)assert.equal(Part.ghep({than:'hai-banh',tay:'hoi'},{tay:{}},h).buf.filter(Boolean).length,Part.ghep({than:'hai-banh',tay:'hoi'},{tay:{}},0).buf.filter(Boolean).length,'xoay không được làm mất pixel');
}
/* TAY XOAY (15/10): khớp ba nấc trái / trước / phải + góc giữa chừng; mọi tư thế nối liền thân, không lấn sâu vào thân, hai nấc trái / phải đối xứng gương, và thật sự khác nhau. */
{
  const xoay=Part.lay('tay','xoay');
  assert.ok(xoay&&xoay.kich&&xoay.kich.w>24,'tay xoay có tấm vẽ rộng hơn 24×24 để vươn sang hai bên');
  assert.deepEqual(Part.hamGoc({than:'hai-banh',tay:'xoay'}).filter(h=>h.startsWith('arm_')).sort(),['arm_down','arm_left','arm_right','arm_up'],'tay xoay mở arm_left / arm_right (cùng bốn lệnh tay)');
  assert.ok(Part.hamGoc({than:'hai-banh',tay:'xoay'}).includes('grab')&&Part.hamGoc({than:'hai-banh',tay:'xoay'}).includes('release'),'tay xoay vẫn kẹp / thả');
  const tuThes=['tren','duoi'],kieps=[{kep:'mo'},{kep:'dong'},{kep:'dong',cam:true}],gocs=[{xoay:'trai'},{xoay:'truoc'},{xoay:'phai'},{goc:-45},{goc:45},{goc:-20},{goc:70}];
  for(const t of ['hai-banh','xich','omni'])for(const tuThe of tuThes)for(const k of kieps)for(const g of gocs){
    const st={tay:Object.assign({tuThe},k,g)};
    lienMotKhoi({than:t,tay:'xoay'},st);
    if(t!=='xich'||(!g.xoay&&!g.goc)||g.xoay==='truoc')tayKhongAnSau(Part.lay('than',t),xoay,st.tay);   /* xích: hai dải xích dài hơn mũi xe 4 hàng, tay vươn sang bên thì nằm trên dải xích (tay đặt cao hơn) — không tính lấn thân */
  }
  const anh=(st)=>Part.ghep({than:'hai-banh',tay:'xoay'},{tay:st});
  const L=anh({xoay:'trai'}),F=anh({xoay:'truoc'}),R=anh({xoay:'phai'});
  assert.notDeepEqual(L.buf,F.buf,'nấc trái khác nấc trước');assert.notDeepEqual(R.buf,F.buf,'nấc phải khác nấc trước');assert.notDeepEqual(L.buf,R.buf,'nấc trái khác nấc phải');
  const guong=(a)=>{const b=new Array(a.buf.length);for(let y=0;y<40;y++)for(let x=0;x<40;x++)b[y*40+39-x]=a.buf[y*40+x];return b};
  const gt=guong(L).map(Boolean),rr=R.buf.map(Boolean);let lech=0;for(let i=0;i<rr.length;i++)if(gt[i]!==rr[i])lech++;
  assert.ok(lech===0,`tay xoay: nấc phải phải là ảnh gương của nấc trái (lệch ${lech} pixel)`);
  assert.deepEqual(anh({xoay:'trai'}).buf,anh({goc:-90}).buf,'goc -90 = nấc trái');assert.deepEqual(anh({xoay:'phai'}).buf,anh({goc:90}).buf,'goc 90 = nấc phải');
  const giua=anh({goc:-45}),dem=(a)=>a.buf.filter(Boolean).length;assert.ok(dem(giua)>dem(F)*0.8,'góc giữa chừng không mất hình');
  /* cánh tay nằm trong tấm 40×40 ở mọi nấc (không bị cắt cụt): hàng 0 và cột 0 / 39 không có pixel của tay */
  for(const st of [{xoay:'trai',tuThe:'duoi'},{xoay:'phai',tuThe:'duoi'},{xoay:'truoc',tuThe:'duoi'},{xoay:'trai',kep:'dong',cam:true}]){
    const a=anh(st);for(let i=0;i<40;i++){assert.ok(!a.buf[i],`tay xoay chạm mép trên (${JSON.stringify(st)})`);assert.ok(!a.buf[i*40],`tay xoay chạm mép trái`);assert.ok(!a.buf[i*40+39],`tay xoay chạm mép phải`);}
  }
  /* tay hạ khác tay nâng, kẹp đóng khác kẹp mở, có vật thì chừa khe */
  assert.notDeepEqual(anh({tuThe:'duoi'}).buf,anh({tuThe:'tren'}).buf,'tay hạ khác tay nâng');assert.notDeepEqual(anh({kep:'dong'}).buf,anh({kep:'mo'}).buf,'kẹp đóng khác kẹp mở');
  assert.notDeepEqual(anh({kep:'dong',cam:true}).buf,anh({kep:'dong'}).buf,'kẹp ôm vật chừa khe');
}
console.log(`OK: ${Part.ds('than').length+Part.ds('tay').length+Part.ds('cam-bien').length} PART, tay trước mũi, cảm biến hông, nối liền, drone và silhouette đã kiểm.`);
