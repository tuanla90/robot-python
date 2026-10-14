(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'nem',ten:'Máy ném trước mũi',hamGoc:['aim','throw','load'],gan:'tay',diemNeo:{x:12,y:23},ve:function(p,s){
    s=s||{};var n=Math.max(1,Math.min(3,+s.ngam||1)),up=!!s.dangNem,top=up?4:8;
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);p.rect(8,18,8,4,C.ink);p.rect(9,19,6,2,C.go);
    p.rect(11,top,2,15,C.ink);p.rect(12,top+1,1,13,C.goSang);p.rect(8,top-3,7,5,C.ink);p.rect(9,top-2,5,2,C.vang);
    for(var i=0;i<n;i++)p.px(12+i,top-3-i,C.xanh);
    if(s.cam){p.rect(10,top,3,2,C.ink);p.px(11,top,C.goSang);}
  }});
})(typeof window!=='undefined'?window:globalThis);
