(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;P.dangKy({loai:'than',ma:'hai-banh',ten:'Thân hai bánh',hamGoc:['left_move','right_move','left_back','right_back','wait'],oGan:{tay:{x:12,y:4},hongTrai:{x:3,y:13},hongPhai:{x:20,y:13},tren:{x:12,y:7}},ve:function(p,s){var run=s.banh&&(s.banh.trai||s.banh.phai);
/* 22/10 (user chốt): nhìn ra đầu xe — mũi thuôn nhẹ (không nhọn), kính sát đầu, đèn hậu đỏ ở đuôi, hai bánh lùi về nửa sau */
[2,19].forEach(function(x){p.rect(x,9,3,12,C.ink);p.rect(x+1,10,1,10,run?C.denSang:C.den);for(var y=11;y<20;y+=4)p.px(x+1,y,run?C.vangToi:C.thepToi);});
var mep={3:[8,15],4:[7,16],5:[6,17]};for(var y=3;y<=20;y++){var m=mep[y]||[5,18];if(y===3||y===20)p.rect(m[0],y,m[1]-m[0]+1,1,C.ink);else{p.px(m[0],y,C.ink);p.px(m[1],y,C.ink);p.rect(m[0]+1,y,m[1]-m[0]-1,1,C.vang);}}
p.rect(8,4,8,1,C.vangSang);p.rect(7,6,10,5,C.kinh);
if(s.camera){P.veMat(p,8,7,3,2,s.camSang);P.veMat(p,13,7,3,2,s.camSang);p.px(8,6,C.xanh);p.px(15,6,C.xanh);}
p.rect(9,13,6,1,C.vangToi);p.rect(9,15,6,1,C.vangToi);p.rect(7,17,10,2,C.vangToi);p.rect(6,18,2,2,C.do);p.rect(16,18,2,2,C.do);
}});
})(typeof window!=='undefined'?window:globalThis);
