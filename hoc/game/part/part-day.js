(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'day',ten:'Lưỡi gạt trước mũi',hamGoc:['push'],gan:'tay',diemNeo:{x:12,y:23},ve:function(p){
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);
    p.rect(8,17,2,5,C.ink);p.rect(14,17,2,5,C.ink);p.rect(9,18,1,3,C.thep);p.rect(14,18,1,3,C.thep);
    p.rect(2,12,20,6,C.ink);p.rect(3,13,18,4,C.vang);
    for(var x=4;x<20;x+=4){p.rect(x,13,2,4,C.ink);p.rect(x+1,14,1,2,C.den);}
    p.rect(4,17,16,1,C.vangToi);p.px(2,12,C.thepSang);p.px(21,12,C.thepSang);
  }});
})(typeof window!=='undefined'?window:globalThis);
