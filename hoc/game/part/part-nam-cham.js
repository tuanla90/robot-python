var BM =(typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('../bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  P.dangKy({loai:'tay',ma:'nam-cham',ten:'Nam châm chữ U trước mũi',hamGoc:['magnet_n','magnet_s','magnet_off'],gan:['tay','duoi'],diemNeo:{x:12,y:23},diemNeoDuoi:{x:12,y:16},ve:function(p,s){
    s=s||{};var under=s.duoi;
    if(under){                                             /* treo dưới bụng drone: dây cáp + nam châm chữ U (cực xanh trái, cực đỏ phải), mở xuống phía dưới */
      p.rect(11,16,2,3,C.ink);p.px(12,16,C.thepSang);p.px(12,17,C.thep);p.px(12,18,C.thepToi);
      p.rect(7,19,10,5,C.ink);p.rect(11,22,2,2,null);p.rect(8,20,8,1,C.thepSang);p.rect(8,21,2,2,s.cuc==='N'?C.do:C.xanhDuong);p.rect(14,21,2,2,s.cuc==='S'?C.xanhDuong:C.do);p.px(8,21,BM.robotLamV2);p.px(14,21,BM.robotDoV6);
      if(s.bat){var cd=s.cuc==='N'?C.do:s.cuc==='S'?C.xanhDuong:C.xanh;[[5,23],[18,23]].forEach(function(a){p.px(a[0],a[1],cd);p.px(a[0]+(a[0]<10?-1:1),a[1]-2,cd);});p.px(12,23,cd);}
      return;}
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);p.rect(9,18,6,4,C.ink);p.rect(10,18,4,3,C.thep);
    var cT=s.cuc==='N'?C.do:s.cuc==='S'?C.xanhDuong:C.xanhDuong,cP=s.cuc==='N'?C.do:s.cuc==='S'?C.xanhDuong:C.do;   /* nam châm điện có cực: cực N hai nhánh đỏ, cực S hai nhánh xanh dương; chưa khai cực thì như cũ (trái xanh, phải đỏ) */
    p.rect(6,9,4,10,C.ink);p.rect(14,9,4,10,C.ink);p.rect(7,10,2,7,cT);p.rect(15,10,2,7,cP);
    p.rect(8,16,8,4,C.ink);p.rect(9,16,6,2,C.vangSang);p.rect(10,16,4,2,C.kinh);
    if(s.bat){var cs=s.cuc==='N'?C.do:s.cuc==='S'?C.xanhDuong:C.xanh;[4,20].forEach(function(x){p.px(x,11,cs);p.px(x-1,9,cs);p.px(x+1,7,cs);});p.px(12,5,cs);p.px(12,3,cs);}
  }});
})(typeof window!=='undefined'?window:globalThis);
