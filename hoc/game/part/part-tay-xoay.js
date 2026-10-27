var BM =(typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('../bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* TAY XOAY (chương tay-xoay, 15/10): tay kẹp đời 2 có KHỚP TRÒN ở mũi xe. Nhìn từ trên xuống: một trụ ngắn nối mũi xe với khớp tròn (bệ thép, nắp xanh lá = tay nâng / cam = tay hạ),
     cổ tay màu tím, thanh ngang rồi hai ngón thép. Khớp có ba nấc: tay chỉ phía trước, bên trái hay bên phải xe (cánh tay xoay quanh khớp, không quay cả xe).
     Trạng thái s: tuThe 'duoi' (hạ) | 'tren'; kep 'dong' | 'mo'; cam: có vật trong kẹp (chừa khe 8 pixel); xoay 'trai' | 'truoc' | 'phai' (nấc khớp) hoặc goc (độ, 0 = phía trước,
     âm = sang trái; cho hoạt cảnh xoay giữa hai nấc, thắng xoay); vat 'go' | 'sat' | { chat, mau } (chỉ cho trang xem part).
     Tay vẽ trong tấm 40×26 (rộng hơn tay thường để cánh tay vươn sang hai bên): khớp ở (19,5; 16,5), trục thân ở cột 19,5; điểm neo (20, 23) khớp ổ tay ở mũi xe.
     Mọi hình là phép thử điểm trong khung (u, v) của cánh tay (u = tiến theo cánh tay, v = ngang cánh tay), nên xoay tới góc bất kỳ vẫn ra hình pixel đều và hai nấc trái / phải là ảnh gương nhau.
     Vật trong kẹp KHÔNG vẽ ở đây (san-ve.js vẽ ngay dưới ảnh part): tâm vật cách khớp U_VAT = 10 pixel theo hướng cánh tay (tay hạ: +1,5, càng dài ra chạm đất). */
  var CX=19.5,CY=16.5,U_VAT=10;
  function inkQuanh(u,v,r){return r.u0-1<=u&&u<=r.u1+1&&v>=r.v0-1&&v<=r.v1+1;}
  function trong(u,v,r){return r.u0<=u&&u<=r.u1&&v>=r.v0&&v<=r.v1;}
  P.dangKy({loai:'tay',ma:'xoay',ten:'Tay xoay có khớp tròn',hamGoc:['arm_down','arm_up','grab','release','arm_left','arm_right'],gan:'tay',kich:{w:40,h:26},diemNeo:{x:20,y:23},U_VAT:U_VAT,ve:function(p,s){
    s=s||{};
    var goc=s.goc!==undefined?s.goc:({trai:-90,phai:90}[s.xoay]||0),th=goc*Math.PI/180,sn=Math.sin(th),cs=Math.cos(th);
    var low=s.tuThe==='duoi',open=s.kep!=='dong',hold=!open&&!!s.cam;
    var inner=open?5:hold?4:1,outer=inner+2,len=(hold?12:11.5)+(low?1.5:0);
    var tim=low?BM.robotTimV1:C.timSang,timSang=low?BM.robotTimSangV1:BM.robotTimSangV2,timToi=low?BM.robotTimV2:C.tim,ngon=low?BM.robotNauSangV2:C.thepSang,ngonToi=low?BM.robotNauV2:C.thep,mui=low?BM.robotTrangV1:BM.robotTrang;
    var co=[
      {u0:2,u1:5.5,v0:-2,v1:2,c:tim,hl:timSang,sh:timToi},                    /* cổ tay */
      {u0:5,u1:7,v0:-outer,v1:outer,c:C.thepToi,hl:C.thep,sh:C.den},          /* thanh ngang */
      {u0:7,u1:len,v0:-outer,v1:-inner,c:ngon,hl:mui,sh:ngonToi},             /* ngón trái (theo hướng cánh tay) */
      {u0:7,u1:len,v0:inner,v1:outer,c:ngon,hl:mui,sh:ngonToi}                /* ngón phải */
    ],x,y,i,dx,dy,u,v,r,d2;
    /* trụ nối mũi xe với khớp: hai bên sáng / tối, viền mực */
    for(y=19;y<=24;y++)for(x=17;x<=22;x++){
      var bien=x===17||x===22;if(y===24&&bien)continue;
      p.px(x,y,bien?C.ink:(x===18?C.thep:x===21?C.thepToi:C.thepSang));
    }
    p.rect(18,24,4,1,C.thepToi);
    for(y=0;y<26;y++)for(x=0;x<40;x++){
      dx=x-CX;dy=y-CY;u=dx*sn-dy*cs;v=dx*cs+dy*sn;d2=dx*dx+dy*dy;
      var ink=d2<=4.9*4.9;
      for(i=0;i<co.length&&!ink;i++)if(inkQuanh(u,v,co[i]))ink=true;
      if(!ink)continue;
      var col=C.ink;
      for(i=0;i<co.length;i++){r=co[i];if(trong(u,v,r)){
        col=r.c;
        if(v<=r.v0+1)col=r.hl;else if(v>=r.v1-1)col=r.sh;              /* cạnh sáng bên này, cạnh tối bên kia */
        if(i>=2&&u>=r.u1-1)col=mui;                                     /* đầu ngón sáng như vừa chạm */
      }}
      if(d2<=3.9*3.9){                                                   /* khớp tròn: bệ thép, vòng tối, nắp báo tay nâng / hạ */
        col=d2>2.7*2.7?C.thep:C.thepSang;
        if(d2>3.2*3.2)col=C.thepToi;else if(d2<=2.1*2.1)col=low?BM.robotCam:C.la;
        if(d2<=0.9*0.9)col=low?BM.robotKem:BM.robotXanhLa;
      }
      p.px(x,y,col);
    }
    /* vật trong kẹp (chỉ trang xem part): tâm cách khớp U_VAT theo hướng cánh tay */
    if(s.vat){var vo=typeof s.vat==='object'?s.vat:{chat:s.vat},cxv=CX+sn*(U_VAT+(low?1.5:0)),cyv=CY-cs*(U_VAT+(low?1.5:0));
      var pv=new P.Painter(40,26);P.veVatNho(pv,Math.round(cxv-4.5),Math.round(cyv-4.5),10,vo.chat,vo.mau);
      for(y=0;y<26;y++)for(x=0;x<40;x++)if(pv.get(x,y)&&!p.get(x,y))p.px(x,y,pv.get(x,y));}
  }});
})(typeof window!=='undefined'?window:globalThis);
