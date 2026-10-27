var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('../bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* MÁY SƠN (chương may-son / che-may-son, 25/10, hoc/KE-HOACH-MAY-SON.md): đầu sơn gắn ở mũi xe, nhìn từ trên xuống. Đế thép ở mũi, BÌNH SƠN (lon tròn, ruột mang màu đang chọn bằng ink(c)),
     cổ ống và CHỔI ở đầu. Trạng thái s: mauSon ('red'|'green'|'blue'|'yellow', mặc định đỏ), tuThe 'duoi' = đầu sơn đang HẠ (pen_down: chổi duỗi dài chạm sàn, giọt sơn loang ở đầu chổi),
     không thì đang nhấc (chổi ngắn, có bóng đổ). Tô ô XE ĐANG ĐỨNG (không phải ô trước mặt): chổi chỉ là hình, luật ở san-hoc.js (phần MÁY SƠN). */
  var MAU={red:[BM.luatSonDo,BM.luatSonDoSang,BM.luatSonDoToi],green:[BM.luatSonXanhLa,BM.luatSonXanhLaSang,BM.luatSonXanhLaToi],blue:[BM.luatSonXanhDuong,BM.luatSonXanhDuongSang,BM.luatSonXanhDuongToi],yellow:[BM.luatSonVang,BM.luatSonVangSang,BM.luatSonVangToi]};
  P.dangKy({loai:'tay',ma:'son',ten:'Đầu sơn có chổi',hamGoc:['ink','dot','pen_down','pen_up'],gan:'tay',diemNeo:{x:12,y:23},MAU_SON:MAU,ve:function(p,s){
    s=s||{};var m=MAU[s.mauSon]||MAU.red,ha=s.tuThe==='duoi',dau=ha?4:8;
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);                                                     /* đế thép ở mũi xe */
    p.rect(8,14,8,8,C.ink);p.rect(9,15,6,6,C.thep);p.rect(9,15,6,1,C.thepSang);p.rect(9,20,6,1,C.thepToi);   /* lon sơn */
    p.rect(10,16,4,4,m[0]);p.px(10,16,m[1]);p.px(11,16,m[1]);p.px(13,19,m[2]);                                 /* ruột lon = màu đang chọn */
    p.px(8,14,null);p.px(15,14,null);p.px(8,21,null);p.px(15,21,null);
    p.rect(11,dau+3,2,11-dau,C.ink);p.rect(11,dau+4,1,10-dau,C.go);p.rect(12,dau+4,1,10-dau,C.goSang);       /* cổ ống / cán chổi */
    p.rect(9,dau,6,4,C.ink);p.rect(10,dau+1,4,2,m[0]);p.rect(10,dau+1,4,1,m[1]);                               /* đầu chổi thấm sơn */
    if(ha){p.rect(8,dau-2,8,2,C.ink);p.rect(9,dau-1,6,1,m[0]);p.px(10,dau-1,m[1]);}                           /* chổi chạm sàn: giọt sơn loang */
  }});
})(typeof window!=='undefined'?window:globalThis);
