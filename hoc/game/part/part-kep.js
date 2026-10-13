(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'kep',ten:'Tay kẹp hai bên hông',hamGoc:['arm_down','arm_up','grab','release'],gan:['tayTrai','tayPhai'],diemNeo:{x:12,y:12},ve:function(p,s){
    s=s||{};var left=s.ben==='trai',open=s.kep!=='dong';
    p.rect(left?9:12,11,3,3,C.ink);p.rect(left?9:13,12,2,1,C.do);
    p.rect(left?6:15,10,4,5,C.ink);p.rect(left?7:15,11,3,3,'#ff8a35');
    p.rect(left?3:18,open?7:9,4,open?4:6,C.ink);p.rect(left?3:18,open?15:13,4,open?4:6,C.ink);
    p.rect(left?4:18,open?8:10,2,open?2:4,C.vang);p.rect(left?4:18,open?16:14,2,open?2:4,C.vangToi);
    if(s.cam){p.rect(left?5:17,11,2,3,C.ink);p.px(left?6:17,12,C.goSang);}
  }});
})(typeof window!=='undefined'?window:globalThis);
