(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'day',ten:'Cần gạt hai bên hông',hamGoc:['push'],gan:['tayTrai','tayPhai'],diemNeo:{x:12,y:12},ve:function(p,s){
    var left=s&&s.ben==='trai';p.rect(left?9:12,11,3,3,C.ink);p.rect(left?6:15,11,4,3,C.ink);p.rect(left?7:15,12,3,1,C.thepSang);
    p.rect(left?2:19,6,4,13,C.ink);p.rect(left?3:19,7,2,11,C.thep);p.rect(left?3:19,8,2,2,C.vang);p.rect(left?3:19,13,2,2,C.vangToi);p.px(left?4:19,16,C.thepSang);
  }});
})(typeof window!=='undefined'?window:globalThis);
