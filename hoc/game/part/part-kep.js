(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* Tay kẹp trước mũi. Ba thế của hai càng (đối xứng quanh cột 12, tính theo toạ độ liên tục):
       mở      càng ở sát mép thân (2..5 và 18..21), khe giữa 12 pixel, đủ rộng để ôm vật;
       đóng    hai càng chạm nhau giữa (9..14), kẹp vào không khí;
       ôm vật  (s.cam) càng khép vào 4..7 và 16..19, khe giữa 8 pixel đúng bằng vật n=10 (cột 7..16) trừ viền: càng đè lên viền vật như đang ghì.
     Vật trong kẹp KHÔNG vẽ ở đây (san-ve.js vẽ ngay dưới ảnh part để có bóng đổ, rung đỏ, trượt vào / ra); khe giữa hai càng để trống, trừ khi s.vat
     ('go'|'sat') cho trang xem part: khi đó vẽ vật 10×10 ở cột 7..16, hàng 8..17 (tay hạ: lùi 1 pixel về phía trước).
     Thanh ngang nối hai càng vào cụm giữa nên càng mở rộng vẫn dính liền thân. */
  P.dangKy({loai:'tay',ma:'kep',ten:'Tay kẹp trước mũi',hamGoc:['arm_down','arm_up','grab','release'],gan:'tay',diemNeo:{x:12,y:23},ve:function(p,s){
    s=s||{};var open=s.kep!=='dong',low=s.tuThe==='duoi',a=low?1:0,hold=!open&&!!s.cam,
      l=open?2-a:hold?4:9-a,r=open?21+a:hold?19:14+a;
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);
    p.rect(l,19,r-l+1,3,C.ink);p.rect(l+1,20,r-l-1,1,C.thep);
    p.rect(9,18,2,4,C.ink);p.rect(13,18,2,4,C.ink);p.rect(10,19,4,2,'#ff8a35');
    if(s.vat){var v=typeof s.vat==='object'?s.vat:{chat:s.vat};P.veVatNho(p,7,8-a,10,v.chat,v.mau);}
    p.rect(l,9-a,4,12+a,C.ink);p.rect(r-3,9-a,4,12+a,C.ink);
    p.rect(l+1,10-a,2,9+a,C.vang);p.rect(r-2,10-a,2,9+a,C.vangToi);
    p.rect(l,8-a,5,3,C.ink);p.rect(r-4,8-a,5,3,C.ink);
    p.rect(l+1,8-a,3,1,C.vangSang);p.rect(r-3,8-a,3,1,C.vangSang);
    if(low){p.rect(l-1,21,5,1,C.ink);p.rect(r-4,21,5,1,C.ink);p.rect(8,23,8,1,C.den);}
  }});
})(typeof window!=='undefined'?window:globalThis);
