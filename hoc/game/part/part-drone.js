(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* Drone nhìn từ trên xuống, không có mặt trước (bay bốn hướng): khung chữ X, bốn cánh quạt (đĩa mờ + hai cánh, đổi cặp cánh theo s.buoc để thấy quay),
     thân tối ở giữa với mắt xanh. s.doc: đèn thân sáng (đang đo pin). Chỉ dùng hàng 1..22 của lưới 24 để vừa ảnh part 40×40. */
  function dia(p,cx,cy,r,mau){for(var y=-r;y<=r;y++)for(var x=-r;x<=r;x++)if(x*x+y*y<=r*r+r)p.px(cx+x,cy+y,mau);}
  function thanh(p,x0,y0,x1,y1,w,mau){var n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)),i,o=(w-1)>>1;for(i=0;i<=n;i++)p.rect(Math.round(x0+(x1-x0)*i/n)-o,Math.round(y0+(y1-y0)*i/n)-o,w,w,mau);}
  function quat(p,cx,cy,ph,quay){
    dia(p,cx,cy,3,C.ink);dia(p,cx,cy,2,quay?'#9fe6fa':C.thepSang);
    if(!ph){p.rect(cx-2,cy,5,1,C.thepToi);p.rect(cx,cy-2,1,5,C.thepToi);}
    else{[[-2,-2],[-1,-1],[1,1],[2,2],[2,-2],[1,-1],[-1,1],[-2,2]].forEach(function(a){p.px(cx+a[0],cy+a[1],C.thepToi);});}
    p.rect(cx,cy,1,1,C.vang);
  }
  P.dangKy({loai:'than',ma:'drone',ten:'Thân drone',hamGoc:['go_up','go_down','go_left','go_right','wait','battery'],oGan:{hongTrai:{x:5,y:12},hongPhai:{x:19,y:12},duoi:{x:12,y:15},tren:{x:12,y:8},bung:{x:12,y:3}},ghiChu:'Drone gắn cảm biến ở hai bên khung; nam châm treo dưới bụng; camera nhìn xuống (ổ bung, mép trên khung); đo pin battery().',ve:function(p,s){
    var ph=s.buoc?1:0,quay=s.quat!==false,cs=[[3,4],[20,4],[3,19],[20,19]];
    cs.forEach(function(c){thanh(p,c[0]<10?8:15,c[1]<10?8:15,c[0],c[1],3,C.ink);});
    cs.forEach(function(c){thanh(p,c[0]<10?8:15,c[1]<10?8:15,c[0],c[1],1,C.thepSang);});
    cs.forEach(function(c){quat(p,c[0],c[1],ph,quay);});
    p.rect(6,6,12,12,C.ink);p.rect(7,7,10,10,C.den);p.rect(7,7,10,1,C.denSang);p.rect(7,7,1,10,C.denSang);p.rect(16,8,1,9,C.ink);p.rect(8,16,9,1,C.ink);
    p.rect(8,9,8,5,C.kinh);p.rect(9,10,6,3,s.doc?'#ffffff':C.xanh);p.px(8,9,C.thepSang);p.px(9,10,s.doc?'#ffffff':'#d8ffff');
    p.px(8,15,C.do);p.px(15,15,C.la);p.rect(10,15,4,1,C.vangToi);
  }});
})(typeof window!=='undefined'?window:globalThis);
