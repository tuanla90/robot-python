(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'nam-cham',ten:'Nam châm chữ U trước mũi',hamGoc:['magnet_on','magnet_off'],gan:['tay','duoi'],diemNeo:{x:12,y:23},diemNeoDuoi:{x:12,y:16},ve:function(p,s){
    s=s||{};var under=s.duoi;
    if(under){p.rect(11,16,2,7,C.ink);p.rect(12,17,1,5,C.thep);p.rect(8,21,8,3,C.ink);p.rect(9,21,3,2,C.xanhDuong);p.rect(12,21,3,2,C.do);return;}
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);p.rect(9,18,6,4,C.ink);p.rect(10,18,4,3,C.thep);
    p.rect(6,9,4,10,C.ink);p.rect(14,9,4,10,C.ink);p.rect(7,10,2,7,C.xanhDuong);p.rect(15,10,2,7,C.do);
    p.rect(8,16,8,4,C.ink);p.rect(9,16,6,2,C.vangSang);p.rect(10,16,4,2,C.kinh);
    if(s.bat){[4,20].forEach(function(x){p.px(x,11,C.xanh);p.px(x-1,9,C.xanh);p.px(x+1,7,C.xanh);});p.px(12,5,C.xanh);p.px(12,3,C.xanh);}
  }});
})(typeof window!=='undefined'?window:globalThis);
