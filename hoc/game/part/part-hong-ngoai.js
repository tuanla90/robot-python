var BM =(typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('../bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
(function(root){var P=root.Part||(typeof module==='object'&&require('./part')),C=P.K;
  /* CẢM BIẾN HỒNG NGOẠI (mùa 2, 27/10): mắt đo nhỏ gắn ở MŨI xe, lệch sang góc trái mũi (ổ 'tren', toạ độ tấm part = toạ độ thân vì diemNeo = ổ) để không chạm đế tay (cột 7..16).
     distance() đo số ô trống phía trước; bản nâng cấp đo nhiệt warm() biết vật cản phía trước có nóng không (robot khác, nút bắn đang bật) — cùng một part, hình không đổi.
     Vỏ mực 4×4 ở (4..7, 6..9), THẤU KÍNH ĐỎ 2×2: tắt = đỏ sẫm, đang đọc (s.bat) = đỏ rực + lõi sáng + hai chấm hồng nhô lên mép trên vỏ (không lấn hàng 2..5 là chỗ càng kẹp mở / đế tay).
     Không phải lớp sơn đội (LOP_SON): cảm biến giữ màu riêng như các cảm biến khác. Không gắn lên nhện / drone (không có hướng mặt): Part.ghep chặn drone, lõi SanHoc chặn cả hai. */
  P.dangKy({loai:'cam-bien',ma:'hong-ngoai',ten:'Cảm biến hồng ngoại (mắt đỏ ở mũi)',hamGoc:['distance','warm'],gan:'tren',diemNeo:{x:12,y:7},ve:function(p,s){
    s=s||{};var bat=!!s.bat,lens=bat?BM.partHongNgoaiVe1:BM.partHongNgoaiVe2,loi=bat?BM.partHongNgoaiVe3:BM.partHongNgoaiVe4;
    p.rect(4,6,4,4,C.ink);p.px(5,6,C.thepSang);                                                     /* vỏ mực 4×4 ở góc trái mũi (cột 4..7, hàng 6..9: dưới đế tay ở hàng 3..5), mép sáng */
    p.rect(5,7,2,2,lens);p.px(5,7,loi);                                                             /* thấu kính đỏ 2×2, lõi sáng */
    if(bat){p.px(4,5,BM.partHongNgoaiVe5);p.px(6,5,BM.partHongNgoaiVe6);}                                                /* đang đọc: hai chấm sáng hồng nhô lên mép trên vỏ (tia dài do san-ve vẽ trên sân) */
  }});
})(typeof window!=='undefined'?window:globalThis);
