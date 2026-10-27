var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('../bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* CAMERA NHÌN XUỐNG của drone (mã 'camera-bay', mở look()): cụm ống kính tròn đặt ở ổ 'bung' của thân drone — mép trên khung, giữa hai cánh quạt trên.
     Nhìn từ trên xuống, drone không có "mặt trước", nên ống kính ló ra khỏi mép khung như một chiếc gimbal treo dưới bụng: vỏ thép có viền mực, vành tối, kính xanh với chấm sáng.
     Trạng thái: s.mat = đang đọc look() (kính xanh lơ rực với lõi trắng, viền sáng bao quanh cụm kính, hai tia nhỏ nhô lên); s.bat = có cảm biến nào đó đang đọc (kính sáng nhẹ).
     Ảnh 8 cột × 7 hàng, cột 8..15, hàng 9..15 của tấm 24×24 khi diemNeo là (12, 12); hàng cuối chìm vào viền trên của thân. */
  var HINH=[                       /* K viền mực · S thép sáng · T vành thép tối · L kính · H chấm sáng */
    '..KKKK..',
    '.KSSSSK.',
    'KSTLLTSK',
    'KSLHLLSK',
    'KSLLLLSK',
    'KSTLLTSK',
    'KKKKKKKK'];
  var X0=8,Y0=9;
  function co(x,y){return x>=0&&y>=0&&x<8&&y<HINH.length&&HINH[y].charAt(x)!=='.';}
  P.dangKy({loai:'cam-bien',ma:'camera-bay',ten:'Camera nhìn xuống (dưới bụng drone)',hamGoc:['look'],gan:'bung',diemNeo:{x:12,y:12},ve:function(p,s){
    s=s||{};var sang=!!s.mat,nhe=!!s.bat,x,y,mau={K:C.ink,S:C.thepSang,T:C.thepToi,L:sang?C.xanh:nhe?BM.robotLamV1:C.kinh,H:sang?BM.robotTrang:nhe?BM.robotNgoc:BM.robotXanhLoV1};
    if(sang){                                                    /* quầng sáng một pixel bao quanh cụm kính + hai tia nhỏ nhô lên */
      for(y=-1;y<=HINH.length;y++)for(x=-1;x<=8;x++)if(!co(x,y)&&(co(x-1,y)||co(x+1,y)||co(x,y-1)||co(x,y+1)))p.px(X0+x,Y0+y,BM.robotXanhLoToi);
      p.px(X0+2,Y0-2,C.xanh);p.px(X0+5,Y0-2,C.xanh);
    }
    for(y=0;y<HINH.length;y++)for(x=0;x<8;x++){var c=HINH.length>y?HINH[y].charAt(x):'.';if(c!=='.')p.px(X0+x,Y0+y,mau[c]);}
    if(sang){p.px(X0+3,Y0+3,BM.robotTrang);p.px(X0+4,Y0+3,BM.robotTrang);p.px(X0+3,Y0+4,BM.robotTrang);}
  }});
})(typeof window!=='undefined'?window:globalThis);
