(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'bong',ten:'Ống phóng bóng đồ chơi trước mũi',hamGoc:['shoot'],gan:'tay',diemNeo:{x:12,y:23},ve:function(p,s){
    s=s||{};p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);p.rect(9,18,6,4,C.ink);p.rect(10,19,4,2,C.thep);
    p.rect(9,7,6,12,C.ink);p.rect(10,8,4,10,C.xanhDuong);p.rect(11,8,2,9,'#9bd8ff');p.rect(8,5,8,4,C.ink);p.rect(9,5,6,2,C.vang);
    if(s.dangBan){p.rect(11,2,2,3,C.ink);p.px(12,1,C.vangSang);}else p.px(12,6,C.vangSang);
  }});
})(typeof window!=='undefined'?window:globalThis);
