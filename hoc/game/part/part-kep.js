(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'kep',ten:'Tay kẹp trước mũi',hamGoc:['arm_down','arm_up','grab','release'],gan:'tay',diemNeo:{x:12,y:23},ve:function(p,s){
    s=s||{};var open=s.kep!=='dong',low=s.tuThe==='duoi',a=low?1:0,l=open?5-a:9-a,r=open?18+a:14+a;
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);
    p.rect(9,18,2,4,C.ink);p.rect(13,18,2,4,C.ink);p.rect(10,19,4,2,'#ff8a35');
    p.rect(l,9-a,4,12+a,C.ink);p.rect(r-3,9-a,4,12+a,C.ink);
    p.rect(l+1,10-a,2,9+a,C.vang);p.rect(r-2,10-a,2,9+a,C.vangToi);
    p.rect(l,8-a,5,3,C.ink);p.rect(r-4,8-a,5,3,C.ink);
    p.rect(l+1,8-a,3,1,C.vangSang);p.rect(r-3,8-a,3,1,C.vangSang);
    if(s.cam){p.rect(10,13,4,4,C.ink);p.rect(11,14,2,2,C.go);p.px(11,14,C.goSang);}
    if(low){p.rect(l-1,21,5,1,C.ink);p.rect(r-4,21,5,1,C.ink);p.rect(8,23,8,1,C.den);}
  }});
})(typeof window!=='undefined'?window:globalThis);
