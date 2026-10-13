(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'nem',ten:'Máy ném bên hông',hamGoc:['aim','throw'],gan:'tayPhai',diemNeo:{x:12,y:12},ve:function(p,s){
    s=s||{};var ngam=Math.max(1,Math.min(3,+s.ngam||1)),throwing=!!s.dangNem;
    p.rect(11,11,5,3,C.ink);p.rect(13,12,3,1,C.thep);p.rect(15,13,5,5,C.ink);p.rect(16,14,3,3,C.go);p.rect(17,14,1,2,C.goSang);
    p.rect(17,throwing?5:8,2,throwing?9:6,C.ink);p.rect(18,throwing?5:9,3,2,C.goSang);p.rect(20,throwing?4:8,2,3,C.ink);p.rect(20,throwing?5:9,1,1,C.vang);
    for(var i=0;i<ngam;i++)p.px(20+i,7-i,C.xanh);
    if(s.cam){p.rect(16,15,3,2,C.ink);p.rect(17,15,1,1,C.vangSang);}
  }});
})(typeof window!=='undefined'?window:globalThis);
