(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'day',ten:'Lưỡi gạt trước mũi',hamGoc:['push'],gan:'tay',diemNeo:{x:12,y:23},ve:function(p,s){var r=(s&&s.ra)?-3:0;/* ra: tấm đẩy giật ra trước một khung (lúc push() chạy) */
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);
    p.rect(8,17+r,2,5-r,C.ink);p.rect(14,17+r,2,5-r,C.ink);p.rect(9,18+r,1,3-r,C.thep);p.rect(14,18+r,1,3-r,C.thep);
    p.rect(2,12+r,20,6,C.ink);p.rect(3,13+r,18,4,C.vang);
    for(var x=4;x<20;x+=4){p.rect(x,13+r,2,4,C.ink);p.rect(x+1,14+r,1,2,C.den);}
    p.rect(4,17+r,16,1,C.vangToi);p.px(2,12+r,C.thepSang);p.px(21,12+r,C.thepSang);
  }});
})(typeof window!=='undefined'?window:globalThis);
