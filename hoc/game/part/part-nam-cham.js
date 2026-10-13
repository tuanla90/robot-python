(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'nam-cham',ten:'Đĩa nam châm bên hông',hamGoc:['magnet_on','magnet_off'],gan:['tayTrai','tayPhai','duoi'],diemNeo:{x:12,y:12},ve:function(p,s){
    s=s||{};var under=s.ben!=='trai'&&s.ben!=='phai',left=s.ben==='trai',cx=under?12:(left?5:18),cy=under?17:12;
    if(under){p.rect(11,8,2,6,C.ink);p.rect(12,9,1,4,C.thep);}else{p.rect(left?8:13,11,5,3,C.ink);p.rect(left?8:14,12,4,1,C.thep);}
    p.rect(cx-3,cy-3,6,6,C.ink);p.rect(cx-2,cy-2,4,4,C.do);p.rect(cx-2,cy-2,2,4,C.xanhDuong);p.rect(cx,cy-2,2,4,C.do);p.px(cx-1,cy-1,C.vangSang);
    if(s.bat){p.px(cx-4,cy,C.xanh);p.px(cx+3,cy,C.xanh);p.px(cx,cy-4,C.xanh);p.px(cx,cy+3,C.xanh);}
  }});
})(typeof window!=='undefined'?window:globalThis);
