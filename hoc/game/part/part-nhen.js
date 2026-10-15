(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* Thân nhện bốn chân nhìn từ trên xuống. s.buoc: khung bước (chân sau đổi chỗ). s.co (15/10, chương nhện co chân): nhện CO CHÂN, thấp sát đất:
     bốn chân dang rộng sát thân (đoạn chân ngắn, nằm ngang), thân dẹt lại (12 hàng thay vì 14) và dịch xuống, thêm vạch bóng tối ở bụng. Ổ gắn (oGan) không đổi nên tay kẹp vẫn nằm đúng chỗ. */
  P.dangKy({loai:'than',ma:'nhen',ten:'Thân nhện bốn chân',hamGoc:['go_up','go_down','go_left','go_right','wait','crouch','stand'],oGan:{tay:{x:12,y:5},hongTrai:{x:5,y:14},hongPhai:{x:18,y:14},tren:{x:12,y:8}},ve:function(p,s){
    var d=s.buoc?1:0;
    function leg(points){points.forEach(function(a){p.rect(a[0],a[1],2,2,C.ink);p.px(a[0]+1,a[1],C.timSang);});}
    if(s.co){
      leg([[0,8],[2,9],[4,10]]);leg([[22,8],[20,9],[18,10]]);
      leg([[0,17+d],[2,16+d],[4,15]]);leg([[22,17+d],[20,16+d],[18,15]]);
      p.rect(5,7,14,12,C.ink);p.rect(6,8,12,10,C.tim);p.rect(7,8,10,2,C.timSang);
      p.rect(8,11,8,4,C.kinh);
      if(s.camera){P.veMat(p,9,12,3,2,s.camSang);P.veMat(p,13,12,3,2,s.camSang);p.px(9,11,C.xanh);p.px(15,11,C.xanh);}
      p.rect(9,16,6,1,C.timSang);p.rect(6,17,12,1,C.ink);
      return;
    }
    leg([[2,3],[4,5],[6,7]]);leg([[20,3],[18,5],[16,7]]);leg([[2,19+d],[4,17+d],[6,15]]);leg([[20,19+d],[18,17+d],[16,15]]);
    p.rect(5,5,14,14,C.ink);p.rect(6,6,12,12,C.tim);p.rect(7,7,10,2,C.timSang);p.rect(8,10,8,5,C.kinh);
    if(s.camera){P.veMat(p,9,11,3,2,s.camSang);P.veMat(p,13,11,3,2,s.camSang);p.px(9,10,C.xanh);p.px(15,10,C.xanh);}
    p.rect(9,16,6,1,C.timSang);
  }});})(typeof window!=='undefined'?window:globalThis);
