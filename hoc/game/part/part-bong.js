(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'bong',ten:'Ống bắn bóng đồ chơi',hamGoc:['shoot'],gan:['tayTrai','tayPhai'],diemNeo:{x:12,y:12},ve:function(p,s){
    s=s||{};var left=s.ben==='trai',tube=left?4:16,inside=left?8:11,blue=left?5:17,ball=left?5:18;
    p.rect(inside,11,5,3,C.ink);p.rect(left?8:13,12,3,1,C.thep);p.rect(tube,8,4,7,C.ink);p.rect(blue,8,2,6,C.xanhDuong);p.rect(blue,9,2,1,'#9bd8ff');p.rect(tube,6,4,3,C.ink);p.rect(blue,6,2,2,C.xanhDuong);
    p.rect(left?4:17,15,3,2,C.ink);p.rect(left?5:18,15,1,1,C.vangToi);if(s.dangBan){p.rect(left?5:17,4,2,2,C.ink);p.rect(ball,4,1,1,C.vangSang);}else p.px(ball,7,C.vang);
  }});
})(typeof window!=='undefined'?window:globalThis);
