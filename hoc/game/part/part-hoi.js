(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* SÚNG HƠI (chương sung-hoi / che-sung-hoi, 15/10): thay ống bóng và lưỡi gạt cũ. Hai nòng: NÒNG TRƯỚC ở mũi xe (ống thép loe miệng, bình khí nén xanh dương sát mũi)
     và NÒNG SAU ở đuôi xe (ống ngắn, miệng loe nhô khỏi đuôi). shoot() bắn ra trước, shoot_back() bắn ra sau.
     Trạng thái s: dangBanTruoc (nòng trước vừa bắn: miệng sáng, đám hơi trắng ở đầu nòng), dangBanSau (nòng sau vừa bắn: miệng sáng), than (mã thân: 'hai-banh' | 'xich' | 'omni' | 'nhen'),
     chiTruoc (chỉ vẽ nòng trước, không có nòng sau: dùng cho huy hiệu và hình rời).
     Nòng sau gắn vào ĐUÔI thân nên đặt theo đuôi của từng thân: Part.ghep chuyển s.than; hàng cuối cùng của thân (tính trong tấm vẽ của tay, mũi xe ở hàng 23) là DUOI[than];
     ống chồng lên đuôi 4 hàng, miệng loe nhô ra ngoài đuôi (2 hàng với xe hai bánh vì ảnh part chỉ rộng 40 pixel, 3 hàng với thân khác). Tấm vẽ cao 42 hàng để chứa nòng sau.
     Không gắn được lên drone (drone không có hướng mặt) — Part.ghep đã chặn. */
  var DUOI={'hai-banh':39,xich:37,omni:36,nhen:36},HANG_CUOI={'hai-banh':41};   /* hàng cuối cùng còn nằm trong ảnh 40×40 của Part.ghep (thân hai bánh gắn tay ở hàng 4, các thân khác ở hàng 5) */
  function veOng(p,x,y,h){   /* ống thép 4 pixel ruột (cột 10..13), viền mực: hàng y..y+h-1 */
    p.rect(9,y,6,h,C.ink);p.rect(10,y,4,h,C.thep);p.rect(10,y,1,h,C.thepSang);p.rect(13,y,1,h,C.thepToi);
  }
  P.dangKy({loai:'tay',ma:'hoi',ten:'Súng hơi hai nòng',hamGoc:['shoot','shoot_back'],gan:'tay',diemNeo:{x:12,y:23},kich:{w:24,h:42},duoiTuHang:14,ve:function(p,s){
    s=s||{};var t=DUOI[s.than]||DUOI['hai-banh'],cuoi=HANG_CUOI[s.than]||40,tr=!!s.dangBanTruoc,sa=!!s.dangBanSau;
    /* ---- nòng trước: đế ở mũi xe, bình khí nén, ống thép, miệng loe */
    p.rect(7,22,10,2,C.ink);p.rect(8,22,8,1,C.thepSang);
    p.rect(7,14,10,8,C.ink);p.rect(8,15,8,6,C.xanhDuong);p.px(7,14,null);p.px(16,14,null);p.px(7,21,null);p.px(16,21,null);          /* bình khí: bo bốn góc */
    p.rect(8,15,2,6,'#9bd8ff');p.rect(8,15,8,1,'#9bd8ff');p.rect(15,16,1,5,'#2a54b0');p.rect(9,20,6,1,'#2a54b0');
    p.rect(11,17,2,2,C.ink);p.px(11,17,C.laSang);p.px(12,18,C.vang);                                                                        /* đồng hồ áp suất */
    veOng(p,10,9,5);p.rect(10,13,4,1,C.vang);                                                                                               /* ống + vòng vàng ở chân ống */
    p.rect(9,6,6,1,C.ink);p.rect(8,7,8,3,C.ink);                                                                                            /* miệng loe */
    p.rect(9,7,6,1,tr?'#ffffff':C.vangSang);p.rect(9,8,6,1,tr?C.xanh:C.vang);p.rect(9,9,6,1,tr?C.xanh:C.vangToi);
    if(!tr){p.rect(11,7,2,1,C.den);}
    if(tr){                                                                                                                                  /* bắn: đám hơi trắng nối liền miệng nòng */
      p.rect(10,5,4,1,'#ffffff');p.rect(9,4,6,1,C.xanh);p.rect(11,4,2,1,'#ffffff');
      p.px(8,3,C.xanh);p.px(11,3,'#ffffff');p.px(12,3,'#ffffff');p.px(15,3,C.xanh);p.px(10,2,C.xanh);p.px(13,2,'#ffffff');
    }
    if(s.chiTruoc)return;
    /* ---- nòng sau: ống chồng lên đuôi thân, miệng loe nhô khỏi đuôi (hàng 1: môi miệng; có 3 hàng thì hàng 2 là lòng nòng tối; hàng cuối là viền mực) */
    veOng(p,10,t-3,4);p.rect(10,t-2,4,1,C.vang);
    var n=Math.min(3,cuoi-t),y0=t+1;
    p.rect(8,y0,8,1,C.ink);p.rect(9,y0,6,1,sa?'#ffffff':C.vangSang);
    if(n>=3){p.rect(8,y0+1,8,1,C.ink);p.rect(9,y0+1,6,1,sa?C.xanh:C.den);}
    p.rect(9,y0+n-1,6,1,C.ink);
    if(sa){p.px(7,y0,C.xanh);p.px(16,y0,C.xanh);}                                                                                            /* bắn: hai tia hơi hai bên miệng sau */
  }});
})(typeof window!=='undefined'?window:globalThis);
