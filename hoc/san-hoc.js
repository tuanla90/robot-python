/* ============================================================================
   san-hoc.js — "Robot Chấn Hưng": MÔ PHỎNG SÂN theo NHỊP cho game dạy Python qua robot.

   Chạy được trong Node (module.exports) và trình duyệt (window.SanHoc).
   Dựa trên nhân chạy code của nhan/san-robot-core.js (window.RobotCore):
   nhân nhường ra ngoài từng lời gọi hàm của game, ở đây ta thực hiện chúng.

   Sân: mảng chuỗi, (x, y) với y = 0 ở hàng trên.
     .  sàn      #  tường     F  cờ đích     S  bậc thang (chỉ nhện leo được)
     >  <  ^  v  băng chuyền, chiều đẩy
     o  vật nằm trên sàn     D  ô đích (khung vàng)     X  ô đích đã có vật sẵn
     H  thùng nặng trên sàn  h  thùng nặng nằm sẵn trên ô đích
   VẬT NẰM ĐẤT CHIẾM Ô (luật mới 14/10): o / X là sàn có một VẬT đứng trên đó; xe KHÔNG đi vào được ô có vật nằm (xem phần TAY GẮP).
   D chỉ là sàn có khung đích. H / h là sàn có THÙNG NẶNG chiếm ô, xem phần THÙNG NẶNG + SÚNG HƠI.
     r  g  b  y  sàn MÀU (đỏ, xanh lá, xanh dương, vàng): đi lại như sàn thường, xem phần CẢM BIẾN MÀU.
     N  nút bắn (như tường, bóng trúng thì đổi)   C  cửa đóng   c  cửa mở: xem phần SÚNG HƠI.
     n  GẦM THẤP (chương nhện: chỉ nhện đang CO CHÂN chui qua được; đứng thì đâm)   u  HỐ (đi vào là rơi: thua; nhện bật qua được): xem phần CHÂN NHỆN.
   Hướng robot: 0 lên, 1 phải, 2 xuống, 3 trái.

   Bốn loại robot (banh, nhen, xich, omni; xich và omni xem bên dưới):
     'banh' (xe bánh): left_move / right_move / left_back / right_back chỉ RA LỆNH
        cho bánh trong nhịp hiện tại; wait() kết thúc nhịp và robot làm theo tổ hợp.
     'nhen' (nhện): go_up / go_down / go_left / go_right, mỗi lệnh 2 nhịp, sang ô mới
        ở CUỐI nhịp thứ hai; wait() = 1 nhịp đứng yên. Không có hướng mặt (đi 4 hướng TUYỆT ĐỐI
        theo màn hình). Qua được bậc thang S. Nhện bị băng chuyền đẩy như xe: đứng trên băng
        đủ 2 nhịp thì bị đẩy (kể cả giữa hai nhịp của một bước). Đi NGƯỢC băng: nhịp 2 bước sang
        ô băng, nhịp kế bị đẩy lùi về → đứng im (kẹt).

   TAY GẮP (hamGoc có lệnh tay; xe bánh VÀ nhện): arm_down / arm_up / grab / release cũng
   chỉ RA LỆNH; wait() cho nhịp trôi. Trong MỘT nhịp:
     (a) tay đổi tư thế  →  (b) kẹp / thả, ở tư thế MỚI  →  (c) bánh chạy  →  (d) băng chuyền.
   Tay: { tuThe: 'tren'|'duoi' (mặc định 'tren'), kep: true|false, cam: id vật đang cầm | null }.

   LUẬT VẬT (14/10): vật là thứ có thật trên sân, CHIẾM Ô. Gắp / thả / nạp đều làm ở Ô TRƯỚC MẶT (ô ngay trước mũi xe theo hướng mặt), không phải ô xe đứng.
   - Vật NẰM ĐẤT (trangThai 'dat') chiếm ô: MỌI thân (hai bánh, xích, omni, nhện) không vào được ô đó — tiến / lùi / trượt / bước đều đứng im,
     sự kiện 'dam-tuong' với vat = 'vat' ("vướng vật", kèm idVat). Băng chuyền đẩy xe vào ô vật thì xe đứng im như gặp tường ('bang-chan', vat 'vat').
     Cảm biến khoảng cách coi ô có vật là KHÔNG trống (front_clear() = False, vat 'vat'). Thùng nặng không bị đẩy / trượt vào ô có vật.
     Vật đang CẦM / dính / trong rổ KHÔNG chiếm ô: vẽ lơ lửng ở mũi xe, đi theo xe (trangThai 'cam' / 'ro', x y = ô xe).
   - Xe không nên xuất phát trên ô có vật (o / X đúng chỗ xe đứng): sân vẫn chạy được nhưng vật đó không còn gắp được (nó nằm dưới xe, ở ô xe đứng).
   - grab: chỉ gắp được vật ở ô TRƯỚC MẶT khi tay 'duoi'. Tay 'tren' mà grab → kẹp vào không khí (kep = true, không cầm gì); nếu ô trước có vật thì
     ghi 'kep-hut' lyDo 'tay-nang'. Tay 'duoi' mà ô trước không có vật → 'kep-hut' lyDo 'khong-co-vat'; ô trước là thùng nặng → 'kep-hut' lyDo 'qua-nang'.
     Đang cầm vật thì grab không đổi gì. Gắp xong ô đó trống (xe đi vào được).
   - NHỆN KHÔNG QUAY nên "mặt trước" của nhện là cạnh gắn tay, CỐ ĐỊNH theo hướng ban đầu của màn (cfg.batDau.huong, mặc định 0 = lên). go_left / go_right /
     go_down chỉ đổi ô đứng, tay vẫn hướng về cạnh cũ. Muốn gắp vật ở hướng khác phải dựng màn hợp lý (vật nằm ở cạnh trước của nhện lúc dừng).
   - Tay 'duoi' thì xe KHÔNG đi, KHÔNG quay được: lệnh bánh của nhịp đó bị bỏ ('tay-vuong', kèm
     `lenh` = lệnh bánh bị chặn {ten, dongPy}).
   - Xe đi thì vật đang cầm đi theo.
   - NHỆN CÓ TAY: lệnh tay đang chờ xảy ra ở NHỊP ĐẦU của bước go_* kế tiếp (hoặc ở nhịp của wait()
     kế tiếp), theo đúng thứ tự (a)(b) ở trên; nhịp thứ hai của bước chỉ là bước chân. Tay 'duoi' ở
     nhịp thứ hai thì chân bị vướng: bước bị bỏ, nhện đứng im ('tay-vuong', `lenh` = lệnh go_* bị bỏ)
     — nhịp đã mất. Nên "arm_up(); go_up()" nâng tay ở nhịp đầu rồi bước ngay trong cùng bước 2 nhịp
     (không cần wait() riêng); còn "arm_down(); grab(); go_up()" thì bước bị vướng.
   - release: tay 'duoi' → vật nằm xuống Ô TRƯỚC MẶT ('dat-vat'); ô đó phải là SÀN trống (kể cả ô đích D / X, ô màu, ô băng chuyền). Là tường, hàng rào,
     thùng nặng, vật khác, bậc thang S, hay ngoài sân thì không thả được: 'tha-bi-chan' {vat: 'tuong'|'rao'|'thung-nang'|'vat'|'bac-thang'|'ngoai-san', kieu:'kep'},
     vật VẪN Ở TAY, kẹp vẫn đóng (cùng mã với nam châm; lỗi). Tay 'tren' → vật rơi xuống ô trước mặt và VỠ, biến mất ('vat-vo'; ô vỡ = ô trước mặt, hay ô xe
     nếu ô trước nằm ngoài sân). Không cầm gì thì không sao. Mỗi ô tối đa một vật đang nằm.
   Mục tiêu 'dua-vat' (cfg.mucTieu): thắng NGAY khi MỌI vật trên sân đều đang nằm trên ô đích.
   Có vật vỡ thì không thể thắng nữa: dừng ngay cuối nhịp đó (dungSom = 'vat-vo').

   TAY XOAY (chương `tay-xoay` + `che-tay-xoay`, 15/10; xe bánh, xích, omni; nhện / drone không). Tay kẹp đời 2: bốn lệnh tay cũ (arm_down / arm_up / grab / release) GIỮ NGUYÊN,
        thêm HAI lệnh gốc arm_left() / arm_right() (chỉ ra lệnh, wait() cho nhịp trôi; cặp lệnh ngược). Robot gắn tay xoay khi hamGoc có arm_left hay arm_right
        (man.robot.tay = 'xoay'). Khớp có BA NẤC, từ trái sang phải: 'trai' · 'truoc' · 'phai', lúc đầu 'truoc'.
        - arm_left() xoay khớp MỘT nấc sang trái (truoc → trai, phai → truoc); arm_right() xoay một nấc sang phải (truoc → phai, trai → truoc). Muốn đi từ trái sang phải phải xoay hai nấc = hai nhịp.
          Khớp đã ở nấc cuối phía đó (đang 'trai' mà arm_left(), đang 'phai' mà arm_right()) thì không xoay thêm: sự kiện 'xoay-het-nac' {nhip, huong, nac, lenh} (thông tin), vẫn mất cả nhịp như mọi lệnh.
        - grab() / release() làm ở Ô MÀ TAY ĐANG CHỈ: nấc 'truoc' = ô trước mặt xe, 'trai' = ô bên TRÁI xe, 'phai' = ô bên PHẢI xe (theo hướng mặt xe, xe quay thì tay quay theo). Mọi luật vật như tay kẹp
          (tay hạ mới gắp được, nhả khi tay nâng thì vật vỡ, ô tay chỉ phải là sàn trống mới đặt được…); các sự kiện nhat-vat, dat-vat, kep-hut, tha-bi-chan, vat-vo ghi thêm `huongTay` (nấc khớp lúc đó).
        - THỨ TỰ TRONG MỘT NHỊP: (a1) tay NÂNG (nếu có arm_up) → (a2) khớp XOAY → (a3) tay HẠ (nếu có arm_down) → (b) KẸP / THẢ (ở ô tay chỉ SAU khi xoay, tư thế SAU khi nâng / hạ) → (c) bánh chạy → (d) băng chuyền…
          Máy luôn làm theo thứ tự này, thứ tự viết lệnh không quan trọng. Nên "arm_left(); arm_down(); grab(); wait()" là MỘT nhịp: xoay sang trái, hạ tay, kẹp vật ở ô bên trái; còn thu về
          "arm_up(); arm_right(); wait()" cũng MỘT nhịp: nâng tay rồi mới xoay lại (một chu trình nhặt rồi đặt sang ô bên cạnh chỉ cần 4 nhịp).
        - TAY HẠ THÌ KHỚP XOAY KẸT: khớp chỉ xoay được khi tay đang nâng. Tay đang hạ sát đất (tuThe 'duoi' từ nhịp TRƯỚC) mà nhịp này không có arm_up() thì lệnh arm_left / arm_right bị bỏ
          ('tay-xoay-ket', lỗi, kèm lenh). "arm_down(); arm_left()" cùng nhịp thì xoay được (xoay làm trước khi hạ) nhưng nhịp SAU tay đang hạ nên phải nâng tay trước rồi mới xoay tiếp.
          Tay hạ còn làm xe không đi, không quay (như tay kẹp).
        - Mỗi nhịp khớp nhận MỘT lệnh xoay (hai lệnh: lệnh sau bị bỏ, 'tay-goi-lai' với nhom 'xoay'); nhóm này độc lập với nhóm nâng / hạ và nhóm kẹp / thả (một nhịp có thể có đủ ba).
        - Khay: man.hamGoc có arm_left / arm_right; phần cứng hỏng (màn "khớp kẹt một phía"): man.phanCung thiếu arm_right (hay arm_left) → gọi lệnh đó báo 'lenh-goc-hong'.
        - daoChieu 'xoay' (lắp ngược): arm_left() làm khớp xoay SANG PHẢI và arm_right() sang trái (vết lệnh vẫn ghi tên lệnh người chơi gọi). Ghép được với 'tay', 'kep' và bánh.
        - bongMo.xoay ('trai' | 'truoc' | 'phai'): lúc xong khớp phải ở đúng nấc; robot có tay xoay mà bongMo không khai thì mặc định 'truoc' (tay chỉ phía trước như xe mờ). Kết quả `bongMo.xoay`.
        Trạng thái tay: { tuThe, kep, cam, xoay } (xoay chỉ có khi robot có tay xoay); vết nhịp robot.tay.xoay; sự kiện 'xoay-tay' {tu, den} (cho hoạt cảnh).

   'xich' (xe BÁNH XÍCH): CÙNG bộ lệnh với xe bánh (left_move / right_move / left_back / right_back / wait và tay gắp
        nếu có), cũng chỉ RA LỆNH, wait() cho nhịp trôi. Khác xe bánh ở ba chỗ:
        - Tiến / lùi (hai bên cùng chiều): 1 ô mỗi nhịp, như xe bánh.
        - QUAY CHẬM: một nhịp chỉ một bên xích chạy ((1,0) (0,-1) quay phải; (0,1) (-1,0) quay trái), hay hai bên ngược
          chiều ((1,-1) quay phải tại chỗ; (-1,1) quay trái tại chỗ), thì xe mới "nhích nửa vòng" (quayDo = +1 phải / -1 trái,
          sự kiện 'quay-nua'). Phải có 2 nhịp LIÊN TIẾP CÙNG tổ hợp (cùng cặp trai, phai) mới quay đủ 90° ('quay-phai' /
          'quay-trai'). Nhịp kế KHÔNG cùng tổ hợp (tiến, lùi, đứng yên, tay vướng, hay một tổ hợp quay khác) thì phần quay dở
          MẤT, hướng xe không đổi: sự kiện 'xich-quay-do' {nhip, nhipNua, huong, lenh}. Chương trình dừng khi còn quay dở
          (chưa thắng) cũng ghi 'xich-quay-do' với cuoi: true. Không có "quay đầu" 180° trong một nhịp.
        - Leo được bậc thang S như đi trên sàn; băng chuyền KHÔNG đẩy được xích (bám chắc): xích đứng đủ 2 nhịp trên băng
          chỉ ghi 'bang-khong-day' (thông tin cho hoạt cảnh), vị trí không đổi.
        Vết nhịp của xích có thêm robot.quayDo (0, +1, -1) cho hoạt cảnh xoay dở.
        - XÍCH ĐẨY THÙNG NẶNG (mùa 2, 27/10; nâng cấp xích, màn khai cfg.xichDay = true; thân khác bỏ qua cờ): xích TIẾN vào ô có thùng nặng thì thùng bị đẩy 1 ô theo hướng tiến
          nếu ô sau thùng nhận được thùng (sàn, ô đích, băng chuyền, ô màu; không phải tường, rào, nút, bậc thang, cửa đóng, thùng khác, vật nằm đất, robot khác: oThungChan), xe vào ô
          thùng vừa rời: sự kiện 'thung-di' nguon 'xich' { id, tu, den, soO: 1 } + 'tien' có thêm dayThung = id. Ô sau bị chặn → xích đứng yên như đâm tường: 'dam-tuong' vat 'thung-nang'
          có thêm xichDay: true, chan = lý do, sau = ô sau thùng (cham.js nói "ô sau thùng bị chặn"). LÙI không kéo thùng (đâm như cũ). Làm ở pha (a) cùng chỗ bánh chạy (trước băng chuyền),
          nên thùng vừa bị đẩy lên băng thì nhịp đó băng đếm từ 0 như mọi thùng. Hai bánh / omni / nhện / màn không khai cờ: húc thùng vẫn đâm như tường.
        - BỆ SÚNG XÍCH (mùa 2; màn khai cfg.beSung = true; robot không súng bỏ qua cờ): XÍCH gắn vòi phun phun MẠNH ("high") thì tia bay như cũ nhưng xe KHÔNG GIẬT:
          không có sự kiện 'giat', thùng sau xe không bị hất; thay bằng sự kiện 'be-sung' { nhip, huong } (thông tin cho hoạt cảnh: xe rung nhẹ, bệ giữ). Phun nhẹ ("low", không đối số) như cũ.
          Thân khác (hai bánh, omni) có beSung vẫn giật như thường; không khai cờ thì xích cũng giật như hiện nay.
        - ĐÂM LÀ THUA (HD2, 29/10; màn ÉP khối mới của mùa 1 khai cfg.damLaThua = true; mặc định tắt, không khai thì luật cũ y nguyên): nhịp nào có sự kiện
          'dam-tuong' (tường, mép sân, cửa đóng, thùng nặng, vật nằm đất... mọi loại) mà chưa thắng thì chương trình DỪNG NGAY cuối nhịp đó (dungSom = 'dam-tuong'),
          robot đứng lại ở cú đâm, không chạy tiếp các nhịp sau; sân đó không thắng. Lời chẩn đoán dam-tuong của cham.js nói rõ luật. Chỉ màn một robot.

   'omni' (xe BÁNH OMNI): có MỌI lệnh bánh của xe hai bánh (left_move / right_move / left_back / right_back, wait và tay gắp
        nếu có) với đúng luật cũ (tiến / lùi 1 ô, quay 90° trong 1 nhịp), nên move(), turn_right(), turn_left() cũ chạy ĐÚNG. Thêm HAI
        lệnh gốc: slide_left() / slide_right(): trượt ngang 1 ô sang trái / phải SO VỚI HƯỚNG MẶT, không đổi hướng (cũng chỉ RA LỆNH,
        wait() cho nhịp trôi). Luật riêng:
        - KHÔNG ĐI CHÉO: nhịp có slide mà còn lệnh bánh thì chỉ làm slide, lệnh bánh bị bỏ (sự kiện 'omni-khong-cheo' {nhip, lenh, truot}).
        - slide_left() và slide_right() cùng một nhịp: lệnh gọi sau bị bỏ (sự kiện 'slide-goi-lai', kiểu 'banh-goi-lai').
        - Tay hạ sát đất thì slide cũng bị chặn ('tay-vuong'), như lệnh bánh.
        - Không leo được bậc thang S (như xe bánh).
        - Băng chuyền đẩy omni MẠNH HƠN: bánh nhỏ trơn, đứng trên băng chỉ 1 nhịp đã bị đẩy 1 ô (không phải 2). Đi xuôi băng = 2 ô / nhịp
          (1 ô tự đi + 1 ô băng đẩy); đi ngược băng thì đứng im (bước lên ô băng rồi bị đẩy lùi về chỗ cũ).
        Vết nhịp của omni có thêm robot.truot (0, -1 trái, +1 phải) cho hoạt cảnh trượt.

   THÙNG NẶNG + SÚNG HƠI (chương `sung-hoi` và `che-sung-hoi`, 15/10; xe bánh, xích, omni; nhện và drone thì không vì không có hướng mặt). Ký hiệu sân: H thùng nặng trên sàn,
        h thùng nặng nằm sẵn trên ô đích (D, X, h đều là ô đích). Thùng nặng chiếm ô: xe KHÔNG đi xuyên được (xe húc thùng bằng bánh = đâm như tường, 'dam-tuong' vat 'thung-nang')
        và tay kẹp KHÔNG gắp được (grab ngay ô có thùng → 'kep-hut', lyDo 'qua-nang'). CHỈ CÚ GIẬT của súng hơi mới dời được thùng (băng chuyền cũng đẩy được). Thay tấm đẩy push() và súng bóng cũ.
        Robot gắn SÚNG HƠI khi hamGoc có spray hay spray_back (man.robot.tay = 'hoi'; một robot một tay: không đi chung tay kẹp, tay xoay, nam châm, máy ném). Hai lệnh gốc, đều chỉ RA LỆNH
        (wait() cho nhịp trôi), mỗi nhịp một phát, cặp lệnh ngược (LENH_NGUOC): spray ↔ spray_back.
            spray()       phun tia nước ra TRƯỚC mũi xe
            spray_back()  phun tia nước ra SAU đuôi xe
          TÊN (29/10, user chốt): trước 29/10 là shoot() / shoot_back(), lực "fast" / "charge"; tên cũ gọi ra thì cham.js báo tên mới (TEN_CU_VOI_PHUN, cũng dùng để
          di trú kho hàm / bản nháp đã lưu ở game/luu.js).
        - LỰC PHUN (29/10: PHUN NHẸ LÀ MẶC ĐỊNH, lực mạnh mở khoá ở gói 6 Lực phun, chương `luc-ban`; màn khai cfg.lucBan = true): spray(p) / spray_back(p) nhận MỘT đối số
          chuỗi p = "low" | "high". KHÔNG ĐỐI SỐ = "low".
            "low"   PHUN NHẸ: tia bay TỐI ĐA TAM_BAN_NHANH = 2 ô rồi rơi (không trúng gì: 'ban-ngan', thông tin), xe KHÔNG GIẬT (không có sự kiện 'giat'). Bánh vẫn nghỉ.
            "high"  PHUN MẠNH: tia bay tới vật cản đầu tiên, xe GIẬT một ô: spray("high") giật LÙI (về phía đuôi), spray_back("high") giật TỚI (về phía mũi).
          p lạ (chữ khác, số, nhiều đối số) → lỗi chạy 'luc-ban-sai'. Màn không khai lucBan mà gọi có đối số → lỗi chạy 'luc-chua-mo'. Robot không vòi phun bỏ qua cờ lucBan. Sự kiện 'ban' có thêm luc và hetTam (bóng nhanh rơi vì hết tầm).
        - Nhịp có bắn thì xe không tự đi: lệnh bánh / trượt cùng nhịp bị bỏ ('ban-dung-yen', thông tin). Hai phát cùng nhịp: phát sau bị bỏ ('ban-goi-lai', lỗi). Quên wait() sau lệnh bắn →
          'quen-wait'. Đạn vô hạn, trừ khi màn khai cfg.danToiDa = n: mỗi phát tốn 1 viên, hết đạn thì không bắn VÀ không giật ('het-dan', lỗi) nhưng vẫn mất nhịp.
        - THỨ TỰ TRONG NHỊP: (a) bắn: bóng bay (nút đổi, băng chuyền nối nút đổi NGAY) → (b) GIẬT: xe (hay thùng) → (c) băng chuyền (theo trạng thái MỚI) → (d) cửa đổi ở CUỐI nhịp.
        - BÓNG bay THẲNG theo hướng bắn (spray: hướng mặt; spray_back: hướng ngược mặt, bay từ ô sát đuôi xe), ô tới ô TRONG CÙNG NHỊP, dừng ở vật cản đầu tiên: tường cao '#', nút 'N' (trung 'nut'),
          cửa đóng (trung 'cua'), thùng nặng (trung 'thung'), vật nằm đất (trung 'vat'), bậc thang S (trung 'bac-thang'). Bóng bay QUA hàng rào '=', băng chuyền, cửa mở, ô màu, ô đích, cờ.
          Ra khỏi sân không trúng gì: 'ban-hut' (thông tin), trung null. Sự kiện của nhịp 'ban' { nhip, tu: ô xe, huong: hướng BAY (tuyệt đối), sau: true nếu bắn ra sau, den: ô bóng tới (ô vật cản; ô cuối cùng trong
          sân nếu hụt), cuoi: ô trống cuối cùng bóng bay qua, o: ô vật cản | null, trung, soO: số ô bóng bay qua trước khi dừng }.
        - GIẬT: ô xe giật vào là ô sát đuôi (bắn ra trước) hay sát mũi (bắn ra sau). Sự kiện 'giat' { nhip, tu, den, huong: hướng giật, di: true nếu xe THẬT SỰ dời, vat: null | lý do không dời, thung: id thùng bị đẩy | null }.
            · ô đó đi vào được → xe dời sang đó (di true).
            · ô đó bị chặn (tường, mép sân 'ngoai-san', cửa đóng 'cua', nút 'nut', hàng rào 'rao', bậc thang 'bac-thang', vật nằm đất 'vat') → xe ĐỨNG YÊN ('giat-chan' {nhip, tu, den, vat, huong, lenh}, thông tin).
            · ô đó có THÙNG NẶNG (luật 29/10, "giật một ô"): thùng nhận lực NHÍCH ĐÚNG 1 Ô theo hướng giật VÀ xe dời 1 ô vào ô thùng vừa rời (y như xích đẩy thùng khi tiến), nếu ô sau thùng
              đi vào được: 'thung-di' nguon 'giat' {id, tu, den, soO: 1} rồi 'giat' { di: true, den: ô thùng vừa rời, thung: id }. Ô sau thùng là băng chuyền / ô đích / sàn thường thì thùng vào bình thường
              (ô đích: tính như thùng tới đích; băng: đếm nhịp từ 0 như thùng mới lên băng). Ô sau thùng bị chặn (tường, mép sân, bậc thang, hàng rào, nút, cửa đóng, thùng khác, xe khác, vật nằm đất)
              thì CẢ HAI ĐỨNG YÊN ('thung-chan' kieu 'giat' {id, o, den, vat}; 'giat' di false, vat 'thung-nang'). Thùng KHÔNG trượt xa tới vật cản như luật cũ (trước 29/10).
            · Chỉ CÚ GIẬT mới đẩy thùng: TIA / bóng bắn trúng thùng không đẩy thùng (bóng dừng ở thùng, trung 'thung'); bắn nhanh "low" không giật nên không đẩy; bệ súng xích (cfg.beSung) không giật nên không đẩy.
          Giật cũng tốn đúng nhịp của lệnh bắn: không có "bắn mà không giật".
        - Băng chuyền đẩy thùng như đẩy xe bánh: thùng nằm trên băng đủ 2 nhịp LIÊN TIẾP thì bị đẩy 1 ô theo mũi tên nếu ô kế trống (không tường, bậc thang, thùng, xe, cửa đóng); bị chặn thì đứng yên.
          Băng chuyền KHÔNG đẩy xe vào thùng (xe bị chặn: 'bang-chan').
        - NÚT: bóng trúng N thì nút ĐỔI trạng thái (bat true ↔ false, sự kiện 'nut-doi' { o, bat }). Bắn hai lần là về như cũ. Mỗi nút điều khiển một nhóm: mặc định MỌI cửa thường (không phải cửa nhịp)
          và MỌI băng chuyền của sân; cfg.noi = [{ nut: {x,y}, cua: [{x,y}], bang: [{x,y}] }] khai nhóm riêng (nút không có trong noi thì không điều khiển gì; cửa nhịp không điều khiển bằng nút).
          · BĂNG CHUYỀN đổi NGAY khi nút đổi ('bang-doi' { o, bat: true = băng đang chạy }): băng tắt thì không đẩy xe / thùng (như sàn thường), đếm demBang về 0.
          · CỬA đổi ở CUỐI nhịp ('cua-doi' { o, mo }): nút đổi thì cửa đổi (đóng ↔ mở). Cửa không đóng xuống ô đang có xe, vật hay thùng: giữ mở và ghi 'cua-ket' (thông tin).
          · CỬA NHỊP (cfg.cuaNhip = [{ x, y, mo, dong, pha }], ô đó phải là C hay c): tự đóng mở theo chu kỳ mo + dong nhịp. Sau t nhịp đã trôi, p = (t + pha) mod (mo + dong); p < mo thì cửa mở. Đổi ở cuối nhịp như mọi cửa.
            Nút không điều khiển cửa nhịp. front_clear() là False khi cửa trước mặt đang đóng, nên `while not front_clear(): wait()` chờ được.
        - NÚT BẬT SẴN (cfg.nutBat = [{ x, y }], mùa 2 gói Đo nhiệt; màn nhiều sân thì mảng song song với san như noi): các ô đó phải là nút N; nút đó ĐANG BẬT từ đầu màn (bat true trong nutBanDau
          và vết, warm() trả True ngay trước phát bắn nào), bắn trúng thì tắt, bắn lần nữa lại bật (luật đổi như mọi nút). Sân giữ ký hiệu N (không có ký hiệu mới), nên mọi chỗ đọc sân
          (bộ dò, ảnh nhỏ, giao diện) vẫn thấy một nút trên tường; chỉ trạng thái đầu khác. NÚT BẬT SẴN KHÔNG ĐƯỢC NỐI GÌ: sau khi nối (mặc định hay cfg.noi) mà nút đó còn điều khiển cửa
          hay băng chuyền thì ném lỗi cấu hình. Lý do: ký hiệu C / c và băng chuyền trên sân luôn là trạng thái THẬT lúc đầu; nút bật sẵn có nối thì phải chọn giữa "sân nói dối"
          (cửa / băng đã đổi như bị bắn một lần) và "nút xanh mà băng vẫn chạy" — cả hai đều dễ hiểu sai. Sân có cửa / băng mà không khai noi thì mọi nút điều khiển mọi thứ, nên phải khai
          noi cho các nút khác (nút không có trong noi thì không điều khiển gì). Nút đè M không bật sẵn được (M bật theo vật đè lên).
        - Ký hiệu sân: N NÚT BẮN nằm trên tường, chiếm ô như tường (xe không đi vào, lyDoChan 'nut'); C CỬA ĐÓNG lúc đầu, c CỬA MỞ lúc đầu (cửa mở là sàn). Cửa đóng chặn xe (dam-tuong vat 'cua',
          front_clear() = False), chặn bóng và chặn thùng. Vật và thùng không đặt lên ô N / C / c được. Lớp màu không được tô ô N / C / c. Tiến vào cửa đóng: dam-tuong vat 'cua'.
        - Cảm biến khoảng cách coi cửa đóng là KHÔNG trống (vat 'cua') và nút N là không trống (vat 'nut'), thùng nặng là không trống (vat 'thung-nang').
        - daoChieu 'sung' (chương che-sung-hoi): SÚNG LẮP NGƯỢC, spray() bắn ra SAU (xe giật TỚI) và spray_back() bắn ra TRƯỚC (xe giật LÙI). Vết lệnh vẫn ghi tên lệnh người chơi gọi.
          Màn hỏng khai phanCung thiếu spray_back (nòng sau hỏng) hay thiếu spray (nòng trước hỏng): gọi lệnh đó → 'lenh-goc-hong'.
        - Mục tiêu 'day-thung': thắng NGAY khi MỌI thùng nặng nằm trên ô đích. Thùng nằm ở GÓC chết mà không phải ô đích (hai cạnh vuông góc là tường hoặc mép sân; ô băng dẫn ra khỏi góc thì không chết)
          thì dừng ngay cuối nhịp đó (dungSom = 'thung-ket'). Thùng nặng chỉ thiết kế để đi với mục tiêu 'day-thung', 'toi-co' hoặc 'bong-mo' (làm vật chắn); không đi chung vật nhẹ 'o' trong mục tiêu day-thung.
        Kết quả chạy có `cua` [{x,y,mo}], `nut` [{x,y,bat}], `bangTat` [{x,y}] (ô băng đang tắt) — trạng thái CUỐI; cuaBanDau / nutBanDau lúc xuất phát; sung { dan } (null nếu robot không có súng; dan = số viên
        còn lại hay null nếu vô hạn). Vết nhịp có `thung` (vị trí thùng cuối nhịp), `cua`, `nut`, `bangTat` (cuối nhịp, chỉ khi sân có cửa / nút) và robot.sung.

   CẢM BIẾN KHOẢNG CÁCH (chương `khoang-cach`; xe bánh, xích, omni; nhện thì không vì không có hướng mặt). Robot gắn cảm biến
        khi hamGoc có front_clear / left_clear / right_clear. Ba hàm gốc này TRẢ VỀ True / False (1 / 0 trong nhân):
        - front_clear(): ô NGAY TRƯỚC MẶT xe đi vào được → True; là tường, mép sân, thùng nặng, hay (với xe bánh / omni) bậc thang S
          → False. Xích leo được bậc thang nên S là ô trống với xích.
        - left_clear() / right_clear(): cùng phép đo cho ô bên TRÁI / bên PHẢI so với hướng mặt (cùng một cảm biến, hai bên hông).
        - ĐỌC CẢM BIẾN KHÔNG TỐN NHỊP và không đổi gì trên sân; đọc ở trạng thái HIỆN TẠI (lệnh bánh chưa wait() thì chưa chạy).
        - Mỗi lần đọc ghi một mục lệnh trong vết (loai 'lenh') có trường `docCamBien` và một sự kiện 'doc-cam-bien' ở nhịp KẾ TIẾP
          (hoặc ở kết quả cuối nếu hết nhịp): { ma, cam:'khoang-cach', ham, tu:{x,y}, huong (hướng tuyệt đối đo), o:{x,y} ô được đo,
          trong: true|false, vat: null | 'tuong' | 'ngoai-san' | 'bac-thang' | 'thung-nang' }. Giao diện dùng để nháy cảm biến.
        - Gọi hàm cảm biến khi hamGoc không có: nhân báo "chưa có hàm" (cham.js đổi thành chẩn đoán chua-gan-cam-bien).
        - Chống vòng lặp vô hạn không có nhịp: quá 1000 lần đọc cảm biến liên tiếp mà chưa có nhịp nào thì dừng, loi.loai 'infinite-loop'
          (cham.js: vong-vo-han). Vòng lặp có nhịp thì bị chặn bởi nhipToiDa ('qua-nhieu-nhip'); vòng không có lời gọi nào bị chặn bởi
          ngân sách lệnh của nhân ('infinite-loop').

   CẢM BIẾN HỒNG NGOẠI (mùa 2, 27/10; part 'hong-ngoai' gắn mũi xe; xe bánh, xích, omni — nhện và drone không có hướng mặt nên ghép là lỗi cấu hình). Robot có nó khi hamGoc có
        distance hay warm. Cùng một TIA đi thẳng từ mũi xe theo hướng mặt, ô tới ô, dừng ở VẬT CẢN ĐẦU TIÊN: tường '#', hàng rào '=', nút N, gầm thấp, bậc thang S (xe bánh / omni; xích leo được
        nên S là ô trống với xích, như front_clear), cửa đang đóng, thùng nặng, vật nằm đất, robot khác dưới đất (drone bay trên không chắn), mép sân (= tường). Hố u, băng chuyền, ô đích, cờ,
        cửa mở, ô màu là ô trống (tia đi qua).
        - distance() TRẢ SỐ NGUYÊN = số ô TRỐNG giữa xe và vật cản (sát vật cản → 0). Dùng được trong biểu thức: d = distance(); if distance() > 2:.
        - warm() (NÂNG CẤP ĐO NHIỆT, chỉ khi hamGoc có warm) TRẢ True khi vật cản đầu tiên ấy NÓNG: là ROBOT khác hay NÚT BẮN ĐANG BẬT (nut.bat); mọi thứ khác (nút đang tắt, cửa, thùng,
          tường, vật…) → False. Cùng tia với distance(). Nút bật sẵn (cfg.nutBat, xem SÚNG BÓNG) nóng ngay từ đầu màn, nên warm() có ích:
          người chơi không biết trước nút nào nóng.
        - ĐỌC KHÔNG TỐN NHỊP, không đổi sân, đọc ở trạng thái hiện tại (như mọi cảm biến); mỗi lần đọc ghi mục lệnh có `docCamBien` { ma:'doc-cam-bien', cam:'hong-ngoai', ham:'distance'|'warm',
          tu, huong, o: ô vật cản (ngoài sân thì toạ độ ngoài sân), khoang: số ô trống, vat: 'tuong'|'ngoai-san'|'rao'|'nut'|'bac-thang'|'gam-thap'|'cua'|'thung-nang'|'vat'|'dong-doi', nong: true|false,
          trong: false, nhip } và sự kiện 'doc-cam-bien' ở nhịp kế; chung bộ đếm 1000 lần đọc liên tiếp ('infinite-loop'). Gọi khi hamGoc không có → "chưa có hàm" (cham.js: chua-gan-cam-bien).

   CẢM BIẾN MÀU / CAMERA (chương `mau`; xe bánh, xích, omni, nhện — chương 12 dùng xe hai bánh). Robot đọc màu khi hamGoc có hàm gốc color().
        color() TRẢ VỀ MỘT CHUỖI chữ thường: "red", "green", "blue", "yellow" hoặc "none" (không có màu). CÙNG TÊN HÀM, KẾT QUẢ PHỤ THUỘC PHẦN CỨNG
        (luật 14/10): cfg.camBien (copy của man.robot.camBien, mảng { ma, o }) cho biết robot gắn gì —
        · CẢM BIẾN MÀU Ở BỤNG ({ ma:'mau' }; cũng là mặc định khi cfg.camBien không khai gì về màu): color() = màu SÀN của ô NGAY DƯỚI XE. LUÔN LUÔN, kể cả
          khi đang cầm / dính / nhận vật vào rổ (vật đang mang KHÔNG tính). Vật nằm đất chiếm ô nên không bao giờ nằm dưới xe.
        · CAMERA ({ ma:'camera' }): color() = màu của thứ ở Ô TRƯỚC MẶT (cùng ô với gắp / thả / nạp; nhện: mặt trước cố định như luật tay):
            - có VẬT nằm đất ở đó → màu vật ("none" nếu vật không màu);
            - không có vật → màu SÀN ô đó ("none" nếu sàn không màu, cả ô băng chuyền, bậc thang, ô đích, ô cờ);
            - tường, hàng rào, thùng nặng, nút bắn, cửa đóng, mép sân / ngoài sân → "none". Cửa mở là sàn thường.
            Vật đang cầm / dính / trong rổ KHÔNG tính (nó đi theo xe, không nằm ở ô trước).
        · Một robot KHÔNG gắn cả hai (cfg.camBien có cả 'mau' lẫn 'camera' và hamGoc có color → chay() ném lỗi cấu hình tiếng Việt), để color() không mơ hồ.
          Drone không gắn camera 'camera' (không có hướng mặt để nhìn "phía trước"): cfg.camBien có 'camera' trên drone → lỗi cấu hình. Drone có camera RIÊNG nhìn xuống (xem CAMERA NHÌN XUỐNG của drone, hàm look()).
        · CAMERA BỐN HƯỚNG ({ ma:'camera-4' }, mùa 4 gói 3; user chốt 29/10 "camera gom về một lệnh color"): color(huong) đọc ô KỀ theo hướng, cùng luật thấy như CAMERA
          (vật → màu vật, sàn → màu sàn hay sơn, tường / rào / thùng / nút / cửa đóng / ngoài sân → "none"). Robot có mũi (xe bánh, xích, omni): "front" / "left" / "right" / "back"
          theo mũi xe; robot không có mũi (drone, nhện): "up" / "down" / "left" / "right" theo bản đồ (khớp go_up…). NÂNG CẤP { ma:'camera-4', taiCho: true } (gói 7) thêm
          "here": ô robot đang ở (drone nhìn xuống: vật nằm dưới hay sàn; rào / thùng / cửa đóng → "none"). color() thiếu hướng, hướng lạ, "here" khi chưa nâng cấp → lỗi chạy
          ('huong-cam-sai', dừng). Robot không gắn camera-4 mà gọi color("…") có đối số → cũng lỗi đó (color() của cảm biến bụng / camera trước không nhận hướng).
          Không gắn chung với 'mau' hay 'camera' (lỗi cấu hình). Đọc ghi docCamBien { cam:'camera-4', ham:'color', huong, huongDoc (0–3 hướng tuyệt đối, null với "here"), tu, o, mau, nguon, idVat, nhip }.
        - Màu ô: ký hiệu r / g / b / y trong sân (sàn màu, đi lại như sàn thường), HOẶC lớp `mau` riêng (cfg.mau: mảng chuỗi cùng cỡ sân,
          mỗi ký tự r g b y hay '.'), dùng khi ô vừa có màu vừa có thứ khác (cờ F, ô đích D, ô X…). Hai cách cộng lại; một ô mà hai nơi ghi
          hai màu khác nhau, hay màu trên ô tường, là lỗi cấu hình.
        - Vật có màu: cfg.vatMau (mảng chuỗi cùng cỡ sân, ký tự r g b y đặt đúng ô có vật o / X). Vật không khai màu là vật không màu.
        - ĐÍCH CÓ MÀU: ô đích (D / X / h) mà ô đó có màu thì chỉ nhận vật CÙNG MÀU. Mục tiêu 'dua-vat' thắng khi mọi vật nằm trên đích và,
          nếu đích có màu, vật đúng màu đích (đích không màu nhận mọi vật như cũ). Thả vật xuống đích khác màu thì ghi 'dat-sai-mau'
          (lỗi) — vật vẫn nằm đó, nhặt lên lại được; không dừng sớm.
        - ĐỌC KHÔNG TỐN NHỊP, như cảm biến khoảng cách (đọc ở trạng thái hiện tại), ghi mục lệnh có `docCamBien` và sự kiện 'doc-cam-bien' ở nhịp
          kế tiếp: { ma, cam:'mau'|'camera', ham:'color', tu:{x,y}, o:{x,y} (ô được đọc: cùng ô xe với 'mau', ô trước mặt với 'camera'; ngoài sân thì toạ độ ngoài sân),
          mau:'red'|…|'none', nguon:'san'|'vat'|'chan', idVat: số|null, nhip }. nguon 'vat' chỉ có ở camera (đọc màu một vật nằm đất ở ô trước), 'chan' chỉ có ở camera (ô trước là tường,
          rào, thùng, nút, cửa đóng, ngoài sân: không đọc được gì → "none"); 'mau' luôn là nguon 'san'. Camera còn ghi `huong` (hướng nhìn).
        - Gọi color() khi hamGoc không có: nhân báo "chưa có hàm" (cham.js đổi thành chẩn đoán chua-gan-cam-bien).
        - Đọc màu cũng tính vào giới hạn 1000 lần đọc liên tiếp không có nhịp ('infinite-loop').
        Kết quả chạy có `mauO` (null nếu sân không màu; không thì mảng hàng, mỗi hàng mảng màu hay null), và `vat[i].mau`, `dich[i].mau` chỉ khi có màu.

   NAM CHÂM (chương `nam-cham` và `che-nam-cham`; xe bánh, xích, omni; nhện: chỉ NAM CHÂM BỤNG, xem cuối phần này). Robot gắn tay nam châm khi hamGoc có magnet_n / magnet_s /
        magnet_off (một robot một tay: không đi chung với tay kẹp, tấm đẩy, máy ném, súng bóng). Nam châm có CỰC (15/10, đúng vật lý), ba lệnh gốc, đều chỉ RA LỆNH (wait() cho nhịp trôi):
            magnet_n()    bật cực N (màu đỏ)
            magnet_s()    bật cực S (màu xanh dương)
            magnet_off()  ngắt điện, thả vật đang dính xuống ô sát mũi xe
        Mỗi nhịp nam châm nhận MỘT lệnh (lệnh sau bị bỏ: 'magnet-goi-lai', lỗi). BỎ magnet_on cũ. Cặp lệnh ngược (LENH_NGUOC): magnet_n ↔ magnet_s.
        - VẬT có CHẤT (cfg.vatChat: mảng chuỗi cùng cỡ sân, đặt đúng ô có vật o / X; màn nhiều sân thì mảng song song với san, như vatMau; hay cfg.vat: [{x, y, chat, cuc?}]):
            s = SẮT · g (hay '.') = GỖ, mặc định · N / S = VẬT NAM CHÂM: chữ ghi trên vật là CỰC QUAY VỀ PHÍA XE (luôn quay về phía xe, xe tới từ hướng nào cũng vậy).
          Vật nam châm tự mang MÀU THEO CỰC (N đỏ, S xanh dương) nếu màn không khai màu riêng: ô đích đỏ / xanh dương dùng để PHÂN LOẠI theo cực (đích có màu chỉ nhận vật cùng màu).
        - Trạng thái: nc = { cuc: null | 'N' | 'S', bat: cuc !== null, cam: id vật đang dính | null }. Trong MỘT nhịp: (a) lệnh nam châm: magnet_n / magnet_s đặt cực; magnet_off ngắt và THẢ vật đang dính
          xuống ô SÁT MŨI xe (ô ngay trước mặt) nếu ô đó trống (không tường, mép sân, bậc thang S, thùng nặng, vật nằm); bị chặn thì vật VẪN DÍNH và nam châm vẫn bật ('tha-bi-chan', lỗi);
          ô đích khác màu → 'dat-sai-mau' như thả bằng tay → (b) bánh chạy → (c) băng chuyền → (d) HÚT / ĐẨY, ở CUỐI nhịp.
        - HÚT / ĐẨY (nam châm có cực, chưa dính vật): nhìn thẳng theo hướng mặt, ô 1, 2 rồi 3 (tường, mép sân, thùng nặng chắn). VẬT ĐẦU TIÊN gặp quyết định:
            · GỖ: không tương tác ('hut-go', thông tin) và còn CHẮN các vật đứng sau nó.
            · SẮT: bị hút bởi CẢ N LẪN S, nếu cách xe ≤ 2 ô (TAM_HUT): bay về ô sát mũi xe rồi DÍNH ('hut-vat', 'dinh-vat'); cách 3 ô thì ngoài tầm ('ngoai-tam', thông tin). SẮT KHÔNG BAO GIỜ BỊ ĐẨY.
            · VẬT NAM CHÂM, cách xe ≤ 3 ô (TAM_CUC, xa hơn sắt): KHÁC cực với tay → bị hút như sắt ('hut-vat' có chat 'nam-cham' và cuc). CÙNG cực → bị ĐẨY: trượt thẳng RA XA xe theo hướng mặt, tối đa 3 ô (TAM_DAY),
              dừng ngay trước vật cản đầu tiên (tường, mép sân, bậc thang, hàng rào, thùng nặng, cửa đóng, vật khác); sự kiện 'day-vat' { id, cuc, tu, den, soO, chan: lý do dừng | null, tuMui }; sát vật cản đến mức
              không nhúc nhích được thì 'day-bi-chan' (thông tin). Trượt qua ô đích không dừng ở đó; dừng ở đích khác màu thì 'dat-sai-mau'.
            Nam châm vẫn bật thì MỖI NHỊP lại hút / đẩy tiếp theo đúng luật đó (vật còn trong tầm và cùng cực bị đá thêm một lần nữa); magnet_off() cho nó yên.
        - Mỗi lần chỉ dính một vật; đang dính thì không hút thêm. Vật dính LƠ LỬNG ở mũi xe, không chiếm ô, đi theo xe (kể cả khi xe quay hay bị băng chuyền đẩy; trangThai 'cam', x y = ô xe).
        - VẬT ĐANG DÍNH khi đổi cực: SẮT vẫn dính (cực nào cũng hút sắt; 'sat-khong-day', thông tin, khi đổi cực lúc đang dính sắt). VẬT NAM CHÂM: đổi sang CÙNG cực với chữ ghi trên vật thì bị BẮN RA: vật rời mũi xe,
          rơi xuống ô sát mũi rồi trượt như bị đẩy ('day-vat' có tuMui: true); ô sát mũi bị chặn thì bắn không ra, vật vẫn dính ('day-bi-chan', tuMui: true). magnet_off thả vật xuống ô sát mũi, không trượt.
        - Vật nằm trên băng chuyền vẫn hút được; vật nằm dưới đất (kể cả đang trượt) không bị băng kéo (như mọi vật). Quên wait() sau lệnh nam châm → 'quen-wait'.
        - CẢM BIẾN TỪ (part riêng 'tu' từ P1 mùa 3 29/10: màn mùa 3 khai robot.camBien [{ ma:'tu', o:'hong' }] + hamGoc front_metal / front_pole; màn cũ khai khoang-cach + hai hàm
          vẫn chạy y nguyên vì lõi chỉ nhìn hamGoc, không đòi part; drone / nhện không gắn vì không có hướng mặt). Đọc KHÔNG tốn nhịp, ghi mục lệnh có `docCamBien` { cam:'tu', ham, tu, huong, o, khoang, chat, cuc, idVat, trong, nhip } và sự kiện
          'doc-cam-bien' (cùng bộ đếm 1000 lần đọc liên tiếp). Cùng phép tìm với HÚT / ĐẨY (3 ô, vật đầu tiên):
            front_metal() → True nếu vật đầu tiên là SẮT và cách xe ≤ 2 ô (bật nam châm lúc này hút được sắt); gỗ, vật nam châm, tường hay không có vật → False.
            front_pole()  → "N" hay "S" nếu vật đầu tiên trong 3 ô là VẬT NAM CHÂM (chữ ghi trên vật); còn lại (sắt, gỗ, không có gì) → "none". Trả CHUỖI, như color().
        - Mục tiêu 'dua-vat' + cfg.vatCan = 'sat' | 'nam-cham' | 'tu': chỉ vật sắt / chỉ vật nam châm / vật có từ (sắt + nam châm) phải nằm trên ô đích; vật gỗ để yên ở đâu cũng được.
        - daoChieu 'cuc' (chương che-nam-cham): DÂY CỰC ĐẤU NGƯỢC: magnet_n() bật cực S thật, magnet_s() bật cực N thật (vết lệnh vẫn ghi tên lệnh người chơi gọi; robot.namCham.cuc ghi cực THẬT).
        - Màn hỏng khai phanCung thiếu magnet_n hay magnet_s: gọi lệnh đó → 'lenh-goc-hong' ("Cực S hỏng…"). bongMo.cam (xe mờ đang DÍNH vật) dùng được với tay nam châm.
        - NAM CHÂM BỤNG NHỆN (mùa 3 gói 9, P1 29/10; user: "nam châm bụng nhện"): nhện (loaiRobot 'nhen') gắn tay nam châm khi hamGoc có magnet_n / magnet_s / magnet_off,
          treo DƯỚI BỤNG như drone (ổ 'duoi'), KHÔNG ở mũi (nhện không có hướng mặt). Cùng luật nam châm treo của drone (ncBung()): hút / thả ở Ô NGAY DƯỚI nhện (khoảng 0), cực nào
          cũng hút sắt, vật nam châm khác cực hút, cùng cực nằm yên ('cung-cuc'), gỗ 'hut-go'. Lệnh nam châm chỉ RA LỆNH, làm việc ở nhịp kế tiếp như lệnh tay của nhện: nhịp
          wait() hay nhịp ĐẦU (chuẩn bị) của bước go_*; hút ở CUỐI nhịp (sau khi bước / nhảy / bị đệm dời). Nhện gắn nam châm bụng ĐỨNG TRÙM LÊN vật nằm đất được (chân cao
          choãi qua vật, vật không chiếm ô với nó: đi vào, nhảy đáp lên ô có vật đều được; nhện không nam châm vẫn bị vật chắn như cũ). Vật dính đi theo nhện khi đi bộ, khi
          nhảy (kể cả nhảy qua hố), khi bị băng chuyền / đệm từ dời. magnet_off() thả vật xuống ô ngay dưới nhện (oThaChan: hố / gầm / đệm / thùng / vật khác thì 'tha-bi-chan');
          nhện không bao giờ đứng trên hố nên không có "thả trên hố"; nhện rơi hố khi đang mang vật thì chương trình dừng, vật coi như rơi theo (vết nhịp cuối vẫn ghi 'cam').
          Với ĐỆM TỪ: nhện có nam châm bụng bật thì bị hút / đẩy theo cực như xe; đang nhảy thì miễn. Không có cảm biến từ cho nhện (không hướng mặt).
        Kết quả chạy có `namCham` { bat, cuc, cam } (null nếu robot không có tay nam châm); vết nhịp có robot.namCham và vat (có `chat`; vật nam châm có thêm `cuc`).

   MÁY NÉM (chương `may-nem`; xe bánh, xích, omni; nhện thì không vì không có hướng mặt). Robot gắn tay máy ném khi hamGoc có aim / throw / load
        (một robot một tay: không đi chung tay kẹp, tấm đẩy, nam châm). Tay có một RỔ chứa tối đa MỘT vật và một TẦM ném (mặc định 1).
        - Ký hiệu sân MỚI '=': TƯỜNG THẤP (hàng rào). Xe KHÔNG đi qua (lyDoChan 'rao': đâm hàng rào như đâm tường; front_clear() = False); thùng nặng
          không đẩy vào được; không đặt vật lên được. Vật ném BAY QUA hàng rào. Tường '#' (tường cao) cũng không chắn vật bay, nhưng vật không được rơi vào ô tường.
        - aim(n): đặt tầm n = 1, 2 hay 3 ô, CÓ HIỆU LỰC NGAY, KHÔNG tốn nhịp và không cần wait() (tầm giữ nguyên tới lần aim kế). n không phải số nguyên
          1–3 (0, 4, 2.5, chuỗi, thiếu hay thừa đối số) là LỖI CHẠY dừng chương trình: loi { loai:'runtime-error', ma:'tam-sai', dong, thongDiep, tamDat }.
        - load() và throw() chỉ RA LỆNH (wait() cho nhịp trôi). Mỗi nhịp tay nhận MỘT lệnh (hai lệnh: lệnh sau bị bỏ, 'nem-goi-lai', lỗi). Nhịp có load() hay
          throw() thì xe ĐỨNG YÊN, lệnh bánh / trượt cùng nhịp bị bỏ ('nem-dung-yen', thông tin). throw() nhớ tầm đang đặt LÚC GỌI (throw(); aim(3); wait()
          ném bằng tầm cũ).
        - load(): vật nằm ở Ô TRƯỚC MẶT xe (trangThai 'dat') vào rổ ('nap-vat'), vật đi theo xe (trangThai 'ro', x y = ô xe); ô đó trống ra. Ô trước không có vật:
          'nap-hut' (thông tin). Rổ đã có vật: 'ro-day' (lỗi), vật ở yên dưới đất.
        - throw(): vật trong rổ bay thẳng theo hướng mặt, rơi xuống ô cách xe đúng `tam` ô ('nem-vat' {id, tu, den, tam}); bay qua mọi thứ ở giữa (rào, tường,
          băng, vật, thùng) và KHÔNG cần ô giữa trống. Ô rơi là sàn trống (kể cả ô băng, ô đích, ô màu; băng KHÔNG kéo vật nằm dưới đất) thì vật nằm đó ('nem-roi');
          đích có màu mà vật khác màu thì 'dat-sai-mau' như thả vật. Ô rơi là tường cao, hàng rào, bậc thang S, thùng nặng, ngoài sân, hay đã có vật nằm
          thì vật VỠ ('nem-vo' {nhip, id, o, lyDo:'tuong'|'rao'|'bac-thang'|'thung-nang'|'ngoai-san'|'vat', tam}, lỗi; trangThai 'vo', x y = ô rơi). Chọn
          luật đơn giản: ô rơi có vật khác thì vật ném vỡ (không bật ra). Mục tiêu 'dua-vat': có vật vỡ thì dừng ngay cuối nhịp đó (dungSom 'vat-vo').
          Rổ trống mà throw(): 'nem-hut' (thông tin), vẫn mất một nhịp.
        - cfg.roBanDau: true | { mau } — rổ CÓ SẴN một vật lúc xuất phát (vật thêm, id cuối cùng, trangThai 'ro'); dùng ở các màn đầu chưa dạy load().
        - Kết quả có `nem` { tam, ro } (null nếu robot không có máy ném); vết nhịp có robot.nem; mục lệnh aim có `aimTam`. Tay nhận vật nào cũng được: vật sắt hay
          gỗ, có màu hay không đều ném như nhau. Mục tiêu dua-vat như cũ (mọi vật nằm trên đích, đúng màu nếu đích có màu); vật còn trong rổ chưa tính.
        - Cảm biến (front_clear, color…) dùng chung được với máy ném. color() của cảm biến bụng đọc sàn dưới xe kể cả khi vật nằm trong rổ; color() của camera đọc ô trước (nơi load() lấy vật).

   MÁY SƠN (chương `may-son` và `che-may-son`, 25/10, hoc/KE-HOACH-MAY-SON.md; xe bánh, xích, omni). Robot gắn ĐẦU SƠN dưới mũi xe khi hamGoc có ink / dot / pen_down / pen_up
        (man.robot.tay = 'son'; một robot một tay: không đi chung tay kẹp, tay xoay, nam châm, máy ném, súng hơi). Đầu sơn tô Ô XE ĐANG ĐỨNG (không phải ô trước mặt). Bốn lệnh gốc:
            ink(c)       chọn màu sơn c = "red" | "green" | "blue" | "yellow". CÓ HIỆU LỰC NGAY, KHÔNG tốn nhịp, không cần wait() (như aim(n)). Màu khác (chữ hoa, "none", số, thiếu đối số)
                         là LỖI CHẠY dừng chương trình: loi { loai:'runtime-error', ma:'mau-son-sai', dong, thongDiep, mauDat }. Lúc đầu màu = cfg.mucBanDau (mặc định "red").
            dot()        chấm một chấm sơn vào ô xe đang đứng.                                 ┐ chỉ RA LỆNH, wait() cho nhịp trôi; mỗi nhịp đầu sơn nhận MỘT lệnh
            pen_down()   hạ đầu sơn xuống sàn (tô luôn ô đang đứng) và GIỮ sơn.                │ (lệnh sau bị bỏ: 'son-goi-lai', lỗi). Cặp lệnh ngược pen_down ↔ pen_up.
            pen_up()     nhấc đầu sơn lên, thôi tô.                                            ┘ Quên wait() → 'quen-wait'.
        - THỨ TỰ TRONG NHỊP: (a) lệnh đầu sơn (dot tô ô đứng; pen_down hạ + tô ô đứng; pen_up nhấc) → (b) bánh / trượt chạy → (c) băng chuyền → (d) đầu sơn đang HẠ thì tô ô xe đứng CUỐI nhịp.
          Nên "pen_down(); left_move(); right_move(); wait()" tô ô cũ VÀ ô mới; "pen_up(); left_move(); right_move(); wait()" nhấc trước khi đi (ô mới không tô). Đầu sơn hạ thì xe vẫn đi và quay bình thường:
          mọi ô xe đi qua, kể cả ô góc lúc xe quay tại chỗ để rẽ, đều được tô, thành một NÉT LIỀN (nét cong qua góc). dot() / pen_down() tô bằng màu LÚC GỌI; nét đang giữ tô bằng màu hiện tại.
        - Lớp ô đã tô (daSon): 'x,y' → màu; tô lại một ô thì màu mới đè màu cũ. Sơn không chiếm ô, không đổi màu sàn (color() vẫn đọc màu sàn), không cản xe / vật.
          Mỗi lần một ô đổi màu: sự kiện của nhịp { ma:'to-o', o, mau, tu (màu cũ | null), kieu:'cham'|'ha'|'net' }; 'ha-but' / 'nhac-but' khi đầu sơn hạ / nhấc.
        - Mục tiêu 'to-hinh' (cfg.mucTieu) + cfg.hinh = HÌNH MỜ (mảng chuỗi cùng cỡ sân, ký tự r g b y hay '.'; màn nhiều sân: mảng song song với san, như bongMo): thắng NGAY cuối nhịp
          mà mọi ô của hình đã tô đúng màu và KHÔNG có ô nào ngoài hình bị tô ('xong-to-hinh'). Tô sai màu một ô trong hình thì tô lại được ('to-sai-mau', thông tin). Tô một ô NGOÀI hình
          thì không xóa được nữa: 'to-thua' { nhip, o, mau, lenh } (lỗi), dừng ngay cuối nhịp đó (dungSom = 'to-thua'). Ô hình không được là tường / rào / nút / cửa.
        - SƠN VÀ CẢM BIẾN MÀU (26/10): sơn PHỦ lên màu sàn. color() (cảm biến bụng, camera) và look() đọc màu ô đã sơn nếu ô đó có sơn (nguon 'son'), không thì màu sàn như cũ.
          Nhờ vậy robot vừa sơn vừa đọc được vạch mình (hay màn) đã sơn. Ô đích có màu vẫn theo màu SÀN (sơn không đổi đích).
        - Lớp SƠN SẴN cfg.sonBanDau (mảng chuỗi r g b y '.', cùng cỡ sân; màn nhiều sân: song song với san): ô đã sơn từ lúc xuất phát (không trên tường, rào, nút, cửa, gầm, hố).
          Với mục tiêu 'to-hinh', ô sơn sẵn phải nằm trong hình (có thể sai màu: robot đọc màu rồi sơn lại cho đúng). Kết quả có `sonBanDau` [{x,y,mau}].
        Kết quả chạy có `son` { ha, mau } (null nếu robot không có đầu sơn), `daSon` [{x,y,mau}] (lớp đã tô CUỐI, mọi màn), `hinh` (mảng hàng tên màu / null, hay null nếu không có hình);
        vết nhịp có robot.son và `daSon` (khi robot có đầu sơn); mục lệnh ink có `inkMau`.

   DRONE (chương `drone`; loaiRobot 'drone'). Thân drone nhìn từ trên xuống, BAY nên không có hướng mặt (như nhện): cùng bốn lệnh gốc go_up / go_down / go_left / go_right
        và wait() của nhện, nên go(d) / walk(path) của chương nhện chạy được trên drone mà không sửa. Ký hiệu sân MỚI:  P  Ô SẠC (sàn bình thường; xem PIN).
        - Mỗi lệnh go_*() bay 1 ô và tự tốn đúng 1 NHỊP (nhện: 2 nhịp), không cần wait() sau nó. LƯU Ý so với đề xuất ban đầu ("go_* chỉ ra lệnh, wait() cho nhịp trôi"):
          go_* tự trôi nhịp, vì nếu không hàm go(d) viết cho nhện (go_up() không kèm wait()) sẽ không chạy được trên drone. wait() = 1 nhịp lơ lửng đứng yên.
        - BAY QUA: hàng rào thấp '=', băng chuyền (băng KHÔNG đẩy drone), vật nằm đất, thùng nặng, bậc thang S. KHÔNG qua: tường cao '#', nút 'N' (nút nằm trong tường),
          cửa đóng 'C', mép sân: đâm thì đứng yên, vẫn mất 1 nhịp ('dam-tuong'). Vật nằm đất KHÔNG chiếm ô với drone (drone ở trên vật). Cuối mỗi nhịp, nếu drone đang ở trên
          ô băng / rào / bậc thang / thùng / vật thì ghi sự kiện 'bay-qua' { nhip, o, tren: ['bang'|'rao'|'bac-thang'|'thung-nang'|'vat'] } cho giao diện vẽ bóng drone.
        - Chỉ đi với: nam châm treo (magnet_n / magnet_s / magnet_off), cảm biến màu ở bụng color(), camera nhìn xuống look(), đo pin battery(). KHÔNG gắn: tay kẹp, tấm đẩy, máy ném, súng bóng, cảm biến khoảng cách,
          cảm biến từ front_metal (drone không có hướng mặt để đo "trước"): ghép sai thì chay() báo lỗi cấu hình tiếng Việt.
        - PIN (cfg.pin = số nguyên 1–999, tuỳ chọn): pin lúc đầu cũng là pin ĐẦY. Mỗi nhịp drone đã bay (kể cả wait() lơ lửng, kể cả nhịp đâm tường) tốn 1 pin. Cuối nhịp, drone đang
          ở trên ô sạc P thì pin đầy lại (sự kiện 'sac-pin' { nhip, o, tu, den } trong vết nhịp, KHÔNG phải chẩn đoán). Thứ tự cuối nhịp: tốn pin → sạc (nếu ở P) → xét thắng → xét hết pin. Pin về 0 mà chưa thắng
          thì drone hạ cánh khẩn, chương trình dừng ('het-pin' { nhip, o, lenh }, dungSom = 'het-pin'). Đến cờ đúng nhịp pin về 0 thì vẫn thắng. Không khai cfg.pin: pin vô hạn và
          KHÔNG có battery(). Hàm gốc battery() (hamGoc có 'battery', cần cfg.pin) trả số pin còn lại (số nguyên), KHÔNG tốn nhịp (như cảm biến), ghi mục lệnh có `docCamBien`
          { cam:'pin', ham:'battery', pin, pinToiDa } và sự kiện 'doc-cam-bien'; chung bộ đếm 1000 lần đọc liên tiếp.
        - ĐÁP ĐẤT ĐỂ SẠC (mùa 4 gói 5, nâng cấp drone; user chốt 29/10): phần cứng có land() thì có cả take_off() (DRONE_DAP). Drone NÂNG CẤP thì ô sạc P KHÔNG sạc tự động nữa:
          · land() hạ drone xuống ô đang ở (một nhịp). Ô không đáp được (hàng rào, hố, băng chuyền, bậc thang, thùng nặng, vật nằm đất) thì drone vẫn bay ('dap-bi-chan', lỗi).
            Đáp trên ô sạc P thì cuối nhịp đó pin ĐẦY NGAY ('sac-pin'); đáp ô thường thì chỉ đậu. land() lúc đang đậu: không đổi gì ('da-dau', thông tin).
          · Đang đậu: go_*() không bay được, drone đứng yên, mất nhịp ('dang-dau', lỗi: cần take_off() trước). wait() lúc đậu là nhịp nghỉ.
          · take_off() cất cánh (một nhịp); lúc đang bay thì không đổi gì ('dang-bay', thông tin).
          · Pin: nhịp nào drone ĐẬU CẢ ĐẦU LẪN CUỐI nhịp thì không tốn pin; các nhịp khác (kể cả nhịp land(), take_off()) tốn 1 pin như cũ. Thứ tự cuối nhịp giữ: tốn pin → sạc → thắng → hết pin.
          Drone gốc (không có land) giữ luật cũ: dừng cuối nhịp trên P là sạc đầy (màn cũ không đổi). Vết nhịp của drone nâng cấp có robot.dau (true khi đang đậu).
        - DRONE GẮN MÁY SƠN (mùa 4 gói 9, combo): khay có ink / dot / pen_down / pen_up thì đầu sơn treo DƯỚI BỤNG drone, tô ô NGAY DƯỚI drone, cùng luật máy sơn của xe
          (dot / pen_down / pen_up chỉ ra lệnh, làm ở nhịp go_*() / wait() / land() / take_off() kế tiếp, TRƯỚC khi bay; bút hạ thì cuối nhịp tô ô drone đang ở). Drone bay qua
          được nên tô được ô xe không tới (trên băng chuyền, ô sau hàng rào); bút còn hạ khi bay ngang rào / hố thì tô lên đó (ô hình không nằm trên rào / hố nên là tô ngoài hình).
          Một bụng một món: máy sơn không đi chung nam châm treo (luật một tay).
          PIN: nhịp nào có tô ô (sự kiện 'to-o') thì tốn THÊM 1 pin (bơm sơn), kể cả lúc đang đậu.
        - NAM CHÂM TREO dưới bụng (khác nam châm gắn mũi xe): hút vật SẮT nằm ở Ô NGAY DƯỚI drone (khoảng 0), không phải 2 ô phía trước. Thứ tự trong nhịp: (a) lệnh nam châm
          (magnet_off thả TRƯỚC khi bay) → (b) bay → (c) HÚT ở cuối nhịp (ô dưới drone sau khi bay). Lệnh nam châm chỉ RA LỆNH và làm việc ở nhịp kế tiếp (go_*() hay wait()), nên
          "magnet_n(); go_right()" là một nhịp (bật, bay, hút vật sắt ở ô vừa tới). Vật sắt bị hút thì DÍNH lơ lửng dưới drone (trangThai 'cam', x y = ô drone), đi theo drone
          ('hut-vat' { id, tu, den (cùng ô), soO: 0 }, 'dinh-vat'). Vật GỖ không hút được ('hut-go', thông tin). magnet_off() thả vật xuống ô dưới drone nếu ô đó nhận được (sàn, ô đích,
          ô màu, ô băng; KHÔNG phải hàng rào, thùng nặng, vật khác, bậc thang): bị chặn thì vật vẫn dính và nam châm vẫn bật ('tha-bi-chan', lỗi). Quên wait()/go_* sau lệnh nam châm
          → 'quen-wait'; hai lệnh nam châm chưa trôi nhịp → lệnh sau bị bỏ ('magnet-goi-lai').
        - color() của drone (cảm biến màu ở bụng) luôn trả màu ô sàn dưới drone, kể cả khi đang dính vật; vật đang dính không tính. Drone không gắn camera 'camera' (nhìn "phía trước");
          camera của drone là camera NHÌN XUỐNG, hàm look() (phần dưới).
        - CAMERA NHÌN XUỐNG (16/10, chương flycam; camBien { ma:'camera-bay', o:'bung' }; hamGoc có `look`): look() TRẢ CHUỖI "red" | "green" | "blue" | "yellow" | "none" như color(), nhưng nhìn thấy cả VẬT:
            · có VẬT nằm đất ở ô NGAY DƯỚI drone → màu vật ("none" nếu vật không màu); không có vật → màu SÀN ô đó ("none" nếu sàn không màu);
            · hàng rào '=', thùng nặng, cửa đóng (drone đang bay ngang qua) → "none" (nguon 'chan'). Vật đang DÍNH dưới nam châm không tính (nó treo dưới drone, camera nhìn xuống ô).
          KHÔNG tốn nhịp, ghi mục lệnh có `docCamBien` { ma:'doc-cam-bien', cam:'camera-bay', ham:'look', tu:{x,y}, o:{x,y} (= ô của drone), mau, nguon:'san'|'vat'|'chan', idVat, nhip } và sự kiện 'doc-cam-bien'
          ở nhịp kế tiếp; chung bộ đếm 1000 lần đọc liên tiếp ('infinite-loop'). Chỉ drone (loaiRobot 'drone'): look() cho robot khác, hay camera-bay trên robot khác → lỗi cấu hình; hamGoc có look mà
          cfg.camBien không có camera-bay → lỗi cấu hình ("cần camera nhìn xuống"). Drone chưa gắn camera mà gọi look(): nhân báo "chưa có hàm", cham.js đổi thành chẩn đoán chua-gan-cam-bien.
          Cùng drone được gắn đủ: cảm biến màu ở bụng ('mau', color() = sàn) và camera nhìn xuống (look() = vật hay sàn): hai hàm khác tên, không mơ hồ.
        Vết nhịp của drone có robot.pin (null nếu không khai pin), robot.dangMang (id vật đang dính hoặc null) và robot.namCham nếu có nam châm. Kết quả có `pin` (còn lại), `pinToiDa`, `sac` [{x,y}].

   CHÂN NHỆN: CO / DUỖI, GẦM THẤP, HỐ, NHẢY (chương `nhen` và `che-nhen`, 15/10; chỉ loaiRobot 'nhen'). Hai lệnh gốc MỚI crouch() (co chân) và stand() (duỗi chân) chỉ RA LỆNH, như lệnh tay:
        chúng làm việc ở NHỊP ĐẦU của bước go_*() kế tiếp (nhịp "chuẩn bị", nhện chưa rời ô) hoặc ở nhịp wait() kế tiếp. Trạng thái chân: 'dung' (lúc đầu, cfg.batDau.chan = 'co' thì xuất phát
        đang co) hoặc 'co'. Nhịp đó chỉ nhận MỘT lệnh chân: lệnh thứ hai chưa kịp trôi nhịp bị bỏ ('chan-goi-lai', lỗi); crouch() lúc đang co hay stand() lúc đang đứng thì không đổi gì.
        Chương trình hết mà còn lệnh chân chưa trôi nhịp: 'quen-wait'. Cặp ngược crouch ↔ stand (LENH_NGUOC). Việc đổi chân ghi sự kiện { ma:'doi-chan', nhip, tu, den:'co'|'dung', lenh }.
        - Ô n GẦM THẤP: nhện chui qua (và đứng trong đó) được khi chân đang CO; chân đứng mà bước vào thì đâm ('dam-tuong', vat 'gam-thap', đứng yên, vẫn mất 2 nhịp). Đang đứng trong ô gầm mà
          stand() thì đầu đụng trần: chân vẫn co, sự kiện 'dau-dung-tran' { nhip, o, lenh } (lỗi). Băng chuyền đẩy nhện đang đứng vào gầm cũng đâm ('bang-chan'). Mọi thân khác (xe bánh, xích, omni) không vào gầm
          (lyDoChan 'gam-thap'); drone bay qua.
        - Ô u HỐ: bước vào (đi, bị băng đẩy, bị đệm từ kéo / đẩy, hay nhảy rơi xuống) là RƠI: cuối nhịp đó sự kiện { ma:'roi-ho', nhip, o, lenh } (lỗi), dungSom = 'roi-ho', chương trình dừng, không thắng.
          Mọi thân trừ drone (bay qua): XE hai bánh / xích / omni cũng rơi (lyDoChan không chặn ô u, xe lăn vào là rơi; P1 mùa 3 29/10 xác nhận, kiem-xe-roi-ho.mjs), cham.js nói "xe rơi xuống hố".
          Vật không đặt lên ô n / u được.
        - NHẢY: nhện đang CO mà ra stand() cùng nhịp đầu với một bước go_*() thì chân bật duỗi rồi nhện BẬT QUA MỘT Ô: nhịp thứ hai của bước đưa nhện sang ô cách 2 ô theo hướng bước (bay qua ô giữa), tự duỗi chân.
          Ô giữa phải bay qua được: sàn (kể cả bậc thang, băng chuyền, vật nằm đất), hố u, hàng rào thấp =. Tường #, nút N, cửa đóng, gầm n (trần thấp) và mép sân chắn. Ô đáp phải đứng được
          (chân đã duỗi): tường, nút, cửa đóng, gầm n, hàng rào, mép sân, vật nằm đất thì nhện bật lên rồi rơi lại đúng ô cũ ('nhay-hut' { nhip, tu, qua, den, vat, lenh }, lỗi, vẫn mất 2 nhịp).
          Ô đáp là hố thì rơi ('roi-ho'). Nhảy được ghi { ma:'nhay', tu, qua, den }. "crouch(); wait(); stand(); go_right()" là một cú nhảy (3 nhịp); "crouch(); stand(); go_right()" KHÔNG phải (hai lệnh chân cùng nhịp).
        - cfg.daoChieu = ['chan'] (chương che-nhen): CHÂN LẮP NGƯỢC, crouch() làm chân DUỖI và stand() làm chân CO (vết lệnh vẫn ghi tên lệnh người chơi gọi).
        - bongMo.chan = 'co' | 'dung' (tuỳ chọn, chỉ nhện): lúc chương trình xong chân phải ở tư thế đó. Kết quả có `chan` (tư thế chân CUỐI) và vết nhịp có robot.chan. Giữ nguyên mọi luật nhện khác (băng chuyền, tay kẹp, bậc thang).

   BÓNG MỜ (chương `che-xe`, kế hoạch "Chế lệnh" 14/10; mọi loại robot): cfg.mucTieu = 'bong-mo' + cfg.bongMo = { x, y, huong, diQua?: [{x,y}], vat?: [{x,y}] }.
        "Xe mờ" là tư thế ĐÍCH. KHÁC 'toi-co' ở chỗ thắng chỉ xét KHI CHƯƠNG TRÌNH CHẠY XONG (không thắng giữa đường; đi ngang qua bóng mờ rồi đi tiếp thì chưa thắng):
        robot đúng ô (x, y) và đúng hướng `huong` (nhện và drone không có hướng mặt nên bỏ qua huong), đã đi qua mọi ô `diQua`, và (nếu khai `vat`) mọi vật đang nằm đất
        đúng các ô đó, không thừa không thiếu. Chương trình dừng vì lỗi (loi) hoặc quá nhịp thì không thắng.
        - "Đã đi qua" ô diQua: cuối một nhịp robot đứng ở ô đó (kể cả bị băng đẩy tới). Lần đầu ghi sự kiện của nhịp { ma:'qua-diem', nhip, o:{x,y} }; vết nhịp có `diQua`
          [{x,y,da}] khi sân có ô diQua. Chương trình chạy xong mà đạt tư thế thì nhịp cuối ghi { ma:'toi-bong-mo' }.
        - Kết quả chạy có `bongMo` { x, y, huong, diQua, vat } (null nếu không phải mục tiêu bong-mo) và `diQua` [{x,y,da}] (trạng thái CUỐI; mảng rỗng nếu không có ô diQua).
          cham.js nói bằng lời chỗ lệch (lech-bong-mo, chua-qua-diem).
        - Màn nhiều sân: bongMo là mảng song song với san (SanHoc.lopMauCuaSan(m, i).bongMo).
        - THÙNG MỜ (chương che-sung-hoi, 15/10): bongMo.thung = [{ x, y }]: lúc xong mọi THÙNG NẶNG phải nằm đúng các ô đó, không thừa không thiếu (chấm theo ô, như bongMo.vat; không khai thì không xét thùng).
          Kết quả `bongMo` có thêm `thung`. Thùng mờ chỉ có nghĩa khi sân có thùng nặng (H, h).
        - VẬT MỜ CÓ MÀU và XE MỜ CẦM VẬT (chương che-tay, cần robot có tay kẹp): bongMo.vat = [{ x, y, mau? }]: mau (red, green, blue, yellow) khai thì vật nằm ô đó phải CÙNG MÀU (chấm theo màu,
          nên hai vật khác màu đổi chỗ mới thắng; màu vật khai bằng lớp vatMau như mọi vật). bongMo.cam = true (hay { mau }): lúc xong tay phải ĐANG CẦM một vật (đúng màu nếu khai); vật đang cầm
          không tính vào bongMo.vat, còn mọi vật khác phải nằm đất đúng các ô trong bongMo.vat (vật vỡ thì không thắng). Kết quả `bongMo` có thêm `cam` (true/false) và `camMau` (màu hay null).

   ĐẤU DÂY NGƯỢC (cfg.daoChieu = ['trai'] hay ['phai'], chỉ xe bánh / xích / omni): lệnh gốc của bánh bị đảo chạy thành LỆNH NGƯỢC của nó (left_move() làm bánh trái quay lùi,
        left_back() làm bánh trái quay tới). Vết lệnh vẫn ghi tên lệnh người chơi gọi; tổ hợp bánh thật nằm ở vết nhịp (robot.banh). Bảng LENH_NGUOC liệt kê các cặp lệnh ngược.
        - 'cam' (chương che-cam-bien, cần hamGoc có front_clear / left_clear / right_clear): CẢM BIẾN KHOẢNG CÁCH LẮP NGƯỢC. Cả ba hàm cảm biến trả NGƯỢC: front_clear() là False
          khi ô trước mặt trống và True khi là tường / vật / mép sân (tương tự left_clear / right_clear). Đọc vẫn không tốn nhịp. Mục lệnh `docCamBien` của lần đọc có `trong` = giá trị
          TRẢ VỀ cho chương trình (đã đảo), `thuc` = ô đó thật sự trống hay không, `daoNguoc: true`. Ghép được với ['trai'] / ['phai'] (['cam', 'trai']).
        - 'tay' / 'kep' (chương che-tay, cần robot có tay kẹp): TAY LẮP NGƯỢC. 'tay': arm_up() làm tay HẠ và arm_down() làm tay NÂNG. 'kep': grab() làm kẹp MỞ / thả và release() làm kẹp ĐÓNG / kẹp.
          Vết lệnh vẫn ghi tên lệnh người chơi gọi. Mọi luật tay khác (một nhịp một lệnh mỗi nhóm, tay hạ thì xe không đi, thả khi tay nâng thì vật vỡ…) áp dụng cho tư thế THẬT. Ghép được với bánh (['tay', 'trai']).

   KHAY VÀ PHẦN CỨNG (luật chế lệnh, 14/10): hai tập lệnh gốc khác nhau.
        - cfg.hamGoc = KHAY: lệnh hiện trên khay, dùng được trong CHƯƠNG TRÌNH CHÍNH và HÀM CỦA MÀN.
        - cfg.phanCung = PHẦN CỨNG: lệnh robot thật sự làm được; mặc định (cham.js, phanCungMacDinh) = trọn bộ lệnh của loại robot (xe bánh có cả left_back / right_back) + lệnh khay.
          Thân HÀM CỦA EM được gọi mọi lệnh thuộc phần cứng, kể cả lệnh chưa mở trên khay (nên hàm của em dùng được ở mọi màn sau).
        - Chương trình chính / hàm của màn gọi lệnh thuộc phần cứng mà KHÔNG có trên khay: dừng với loi { loai:'runtime-error', ma:'lenh-chua-mo', dong, ten, thongDiep }.
          Cần cfg.nguonDong(dongPy) → 'chinh' | 'hamMan' | 'hamEm' | null (cham.js đưa xuống từ bảng ánh xạ dòng; không đưa thì không kiểm).
        - Gọi lệnh KHÔNG thuộc phần cứng (màn hỏng khai phanCung hẹp hơn) thì nhân báo "chưa có hàm", cham.js đổi thành chẩn đoán lenh-goc-hong.
        - Không khai cfg.phanCung thì phần cứng = khay (SanHoc.chay gọi thẳng giữ hành vi cũ).

   Băng chuyền: mỗi nhịp, SAU khi robot làm xong hành động, nếu robot đang đứng trên
   ô băng thì demBang++; đủ 2 thì đẩy 1 ô theo mũi tên (bị chặn thì đứng yên) và
   demBang = 0. Không đứng trên băng thì demBang = 0.

   Thắng NGAY khi robot chạm ô cờ (tự đi tới hoặc bị băng đẩy tới).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var Core = laNode ? require('../nhan/san-robot-core.js') : window.RobotCore;

  /* ------------------------------------------------------------------ hằng */

  // 0 lên, 1 phải, 2 xuống, 3 trái → vectơ (dx, dy), y = 0 ở hàng trên
  var VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  var TEN_HUONG = ['lên', 'phải', 'xuống', 'trái'];
  var BANG = { '>': 1, 'v': 2, '<': 3, '^': 0 };      // ký hiệu băng → hướng đẩy
  var BAN_XOAY = { '@': 1, '%': -1 };                 // ký hiệu bàn xoay → chiều xoay (+1 phải 90°, -1 trái 90°)
  var CONG_KY = { '1': '1', '2': '2' };               // ký hiệu cổng dịch chuyển đôi (mỗi số trên sân phải có đúng 2 ô)

  var HAM_GOC = {
    banh: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'],
    nhen: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'],     // crouch / stand: co / duỗi chân (xem phần CHÂN NHỆN)
    xich: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'],      // cùng bộ lệnh với xe bánh
    omni: ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait'],   // bộ lệnh xe bánh + hai lệnh trượt ngang
    drone: ['go_up', 'go_down', 'go_left', 'go_right', 'wait']        // cùng bộ lệnh với nhện (mỗi lệnh bay 1 ô = 1 nhịp)
  };
  // omni: lệnh trượt → bên trượt so với hướng mặt (-1 trái, +1 phải)
  var OMNI_TRUOT = { slide_left: -1, slide_right: 1 };
  // xích quay chậm: tổ hợp (bánh trái, bánh phải) → chiều quay (+1 phải, -1 trái); cần 2 nhịp liên tiếp cùng tổ hợp mới đủ 90°
  var XICH_QUAY = { '1,0': 1, '0,-1': 1, '1,-1': 1, '0,1': -1, '-1,0': -1, '-1,1': -1 };
  var NHEN_HUONG = { go_up: 0, go_right: 1, go_down: 2, go_left: 3 };
  var CHAN_LENH = ['crouch', 'stand'];           // lệnh chân của nhện (chỉ ra lệnh; làm ở nhịp đầu của bước go_* kế tiếp hay nhịp wait() kế tiếp)
  var DAO_CHIEU_CHAN = 'chan';                   // chân nhện lắp ngược (chương che-nhen): crouch() làm chân duỗi, stand() làm chân co
  // lệnh tay gắp của xe bánh. Hai nhóm: tư thế (arm_down / arm_up) và kẹp (grab / release);
  // mỗi nhịp mỗi nhóm nhận MỘT lệnh, lệnh sau bị bỏ ('tay-goi-lai').
  var TAY_XOAY = ['arm_left', 'arm_right'];     // TAY XOAY (chương tay-xoay): xoay khớp tay một nấc sang trái / phải; nhóm thứ ba 'xoay', mỗi nhịp một lệnh
  var XOAY_NAC = ['trai', 'truoc', 'phai'];     // ba nấc của khớp, từ trái sang phải; lúc đầu 'truoc'
  var TAY_LENH = ['arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right'];
  var TAY_NHOM = { arm_down: 'tu-the', arm_up: 'tu-the', grab: 'kep', release: 'kep', arm_left: 'xoay', arm_right: 'xoay' };
  // cảm biến khoảng cách (chương khoang-cach): hàm gốc trả True / False. Giá trị = lệch hướng so với hướng mặt (0 trước, 1 phải, 3 trái)
  var CAM_BIEN_HAM = { front_clear: 0, right_clear: 1, left_clear: 3 };
  // cảm biến màu (chương mau): hàm gốc color() trả chuỗi. Ký hiệu r g b y ↔ tên màu
  var CAM_MAU_HAM = ['color'];
  // CAMERA BỐN HƯỚNG (mùa 4): color(huong); lệch hướng so với mũi xe (robot có mũi) hay hướng tuyệt đối (drone, nhện)
  var MA_CAM_4 = 'camera-4';
  var CAM4_MUI = { front: 0, right: 1, back: 2, left: 3 };
  var CAM4_BAN_DO = { up: 0, right: 1, down: 2, left: 3 };
  // camera NHÌN XUỐNG của drone (chương flycam): hàm gốc look() trả chuỗi màu của VẬT hay SÀN ngay dưới drone; mã part / mã cảm biến 'camera-bay'
  var CAM_NHIN_HAM = ['look'];
  var MA_CAM_BAY = 'camera-bay';
  var MAU_KY = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
  var MAU_TEN = ['red', 'green', 'blue', 'yellow'];
  // tay nam châm (chương nam-cham, che-nam-cham): ba lệnh gốc magnet_n (bật cực N) / magnet_s (bật cực S) / magnet_off (ngắt điện); cảm biến từ: front_metal() trả True / False, front_pole() trả "N" / "S" / "none".
  // Chất vật: s sắt, g gỗ, N / S vật nam châm (chữ ghi là cực quay về phía xe)
  var TAY_NAM_CHAM = ['magnet_n', 'magnet_s', 'magnet_off'];
  var CAM_TU_HAM = ['front_metal', 'front_pole'];
  // cảm biến HỒNG NGOẠI (mùa 2, part 'hong-ngoai' ở mũi xe): distance() trả SỐ ô trống tới vật cản đầu tiên phía trước; warm() (nâng cấp đo nhiệt) trả True khi vật cản đó NÓNG (robot khác, nút bắn đang bật)
  var CAM_HONG_NGOAI_HAM = ['distance', 'warm'];
  var MA_CAM_HONG_NGOAI = 'hong-ngoai';
  var CUC_LENH = { magnet_n: 'N', magnet_s: 'S' };           // lệnh bật cực → cực
  var CUC_DOI = { N: 'S', S: 'N' };
  var CUC_MAU = { N: 'red', S: 'blue' };                   // vật nam châm mang màu theo cực (ô đích đỏ / xanh dương phân loại theo cực): N đỏ, S xanh dương
  // drone (chương drone): đo pin battery() trả số nguyên (cần cfg.pin); ký hiệu P là ô sạc
  var CAM_PIN_HAM = ['battery'];
  var DRONE_DAP = ['land', 'take_off'];         // nâng cấp drone đáp đất để sạc (mùa 4 gói 5, xem phần DRONE)
  var PIN_TOI_DA = 999;
  // tay máy ném (chương may-nem): aim(n) đặt tầm (đổi ngay, không tốn nhịp), load() nạp vật ở ô TRƯỚC MẶT vào rổ, throw() ném vật trong rổ; ký hiệu '=' là tường thấp (hàng rào)
  var TAY_NEM = ['aim', 'throw', 'load'];
  var TAM_NEM_TOI_DA = 3;                       // aim(n): n = 1, 2 hoặc 3 ô
  // tay SÚNG HƠI (chương sung-hoi, che-sung-hoi): hai lệnh gốc spray() (bắn ra trước, xe giật lùi) và spray_back() (bắn ra sau, xe giật tới); ký hiệu N nút bắn, C cửa đóng, c cửa mở
  var TAY_HOI = ['spray', 'spray_back'];
  var LUC_BAN = ['low', 'high'];             // spray(p) / spray_back(p) ở màn có cfg.lucBan: "low" phun nhẹ (bay ≤ 2 ô, không giật; cũng là không đối số), "high" phun mạnh (bay xa, giật)
  var TEN_CU_VOI_PHUN = { shoot: 'spray', shoot_back: 'spray_back' };   // tên cũ (trước 29/10) → tên mới; luu.js dùng bảng đầy đủ (kể cả hàm em tự chế) để di trú
  var TAM_BAN_NHANH = 2;
  // tay MÁY SƠN (chương may-son, che-may-son): ink(c) chọn màu (đổi ngay, không tốn nhịp); dot() / pen_down() / pen_up() chỉ ra lệnh, tô ô xe đang đứng (xem phần MÁY SƠN)
  var TAY_SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  var SON_LENH = ['dot', 'pen_down', 'pen_up'];
  var CHAT_KY = { s: 'sat', g: 'go', N: 'N', S: 'S' };   // ký tự lớp vatChat → chất: s sắt, g gỗ; N / S = vật NAM CHÂM có cực N / S (docSan đổi thành chat 'nam-cham' + cuc)
  var TAM_HUT = 2;                              // nam châm hút vật SẮT trong 2 ô trước mặt (cực nào cũng hút sắt)
  var TAM_CUC = 3;                              // tầm tác dụng với VẬT NAM CHÂM (hút khác cực, đẩy cùng cực): 3 ô, xa hơn sắt
  var TAM_DEM = 2;                              // ĐỆM TỪ (mùa 3): đệm kéo / đẩy thân robot đứng cùng hàng / cột trong 2 ô (xem chay(), phần ĐỆM TỪ)
  var TAM_DAY = 3;                              // vật nam châm bị đẩy trượt tối đa 3 ô
  var DOC_LIEN_TIEP_TOI_DA = 1000;             // đọc cảm biến liên tiếp không có nhịp: quá số này coi là vòng lặp vô hạn
  var DOC_TOI_DA_MOI_NHIP = 50;                 // số sự kiện 'doc-cam-bien' tối đa gắn vào một nhịp (vết lệnh vẫn đủ)
  var BANH_LENH = {
    left_move: ['trai', 1], left_back: ['trai', -1],
    right_move: ['phai', 1], right_back: ['phai', -1]
  };
  // LỆNH NGƯỢC (kế hoạch "Chế lệnh" 14/10): mỗi lệnh gốc CHUYỂN ĐỘNG có một lệnh ngược. wait() và lệnh cảm biến không có; bắn / ném không hoàn tác được.
  // Dùng cho màn "Đường về" (chế hàm đi ngược), màn đấu dây ngược (daoChieu) và Sổ lệnh.
  var LENH_NGUOC = {
    left_move: 'left_back', left_back: 'left_move',
    right_move: 'right_back', right_back: 'right_move',
    arm_up: 'arm_down', arm_down: 'arm_up',
    grab: 'release', release: 'grab',
    go_up: 'go_down', go_down: 'go_up',
    go_left: 'go_right', go_right: 'go_left',
    land: 'take_off', take_off: 'land',                    // drone nâng cấp đáp đất (mùa 4)
    magnet_n: 'magnet_s', magnet_s: 'magnet_n',
    slide_left: 'slide_right', slide_right: 'slide_left',
    crouch: 'stand', stand: 'crouch',
    arm_left: 'arm_right', arm_right: 'arm_left',
    spray: 'spray_back', spray_back: 'spray',
    pen_down: 'pen_up', pen_up: 'pen_down'
  };
  // đấu dây ngược / hỏng (cfg.daoChieu): bánh nào bị đảo thì lệnh của bánh đó chạy thành lệnh ngược
  var DAO_CHIEU_BANH = ['trai', 'phai'];
  var DAO_CHIEU_CUC = 'cuc';                    // dây cực nam châm đấu ngược (chương che-nam-cham): magnet_n() bật cực S thật, magnet_s() bật cực N thật (xem phần NAM CHÂM)
  var DAO_CHIEU_CAM = 'cam';                    // cảm biến khoảng cách lắp ngược: front_clear() / left_clear() / right_clear() trả NGƯỢC (xem phần ĐẤU DÂY NGƯỢC)
  // mục tiêu: 'toi-co' | 'dua-vat' | 'day-thung' | 'bong-mo' (đến đúng tư thế của "xe mờ" khi chạy xong, xem phần BÓNG MỜ)
  var DAO_CHIEU_SUNG = 'sung';                  // súng hơi lắp ngược (chương che-sung-hoi): spray() bắn ra sau (xe giật tới), spray_back() bắn ra trước (xe giật lùi)
  var DAO_CHIEU_TAY = ['tay', 'kep', 'xoay'];   // tay kẹp lắp ngược (chương che-tay): 'tay' đổi chỗ arm_up ↔ arm_down, 'kep' đổi chỗ grab ↔ release; 'xoay' (chương che-tay-xoay) đổi chỗ arm_left ↔ arm_right (xem phần ĐẤU DÂY NGƯỢC)
  var MUC_TIEU = ['toi-co', 'dua-vat', 'day-thung', 'bong-mo', 'to-hinh'];       // 'to-hinh': tô đúng hình mờ (xem phần MÁY SƠN)

  /** Phần cứng mặc định của loại robot: trọn bộ lệnh của loại đó (xe bánh có cả bánh lùi) cộng các lệnh khay đã gắn thêm (tay, cảm biến…). */
  function phanCungMacDinh(loai, hamGoc) {
    var kq = (HAM_GOC[loai] || []).slice();
    (hamGoc || []).forEach(function (t) { if (kq.indexOf(t) < 0) kq.push(t); });
    return kq;
  }
  /** Phần cứng của một màn: man.phanCung nếu màn khai (màn hỏng), không thì mặc định của loại robot + khay (man.hamGoc). */
  function phanCungCua(man) {
    return man.phanCung ? man.phanCung.slice() : phanCungMacDinh(man.loaiRobot || 'banh', man.hamGoc);
  }

  /* ------------------------------------------------------------------- sân */

  /** Lớp màu (mảng chuỗi cùng cỡ sân, ký tự r g b y; '.' hay khoảng trắng = không màu) → mảng hàng tên màu / null. null nếu không có lớp. */
  function docLopMau(lop, rong, cao, ten) {
    if (lop === undefined || lop === null) return null;
    if (!Array.isArray(lop) || lop.length !== cao) throw new Error('Lớp ' + ten + ' phải là mảng ' + cao + ' chuỗi, cùng cỡ với sân.');
    return lop.map(function (hang, y) {
      if (typeof hang !== 'string' || hang.length !== rong) throw new Error('Lớp ' + ten + ' dòng ' + (y + 1) + ' không cùng cỡ với sân.');
      var kq = [];
      for (var x = 0; x < rong; x++) {
        var c = hang[x];
        if (c === '.' || c === ' ') kq.push(null);
        else if (MAU_KY[c]) kq.push(MAU_KY[c]);
        else throw new Error('Ký hiệu lạ trong lớp ' + ten + ': "' + c + '" (' + x + ', ' + y + ').');
      }
      return kq;
    });
  }

  /** Lớp chất vật (mảng chuỗi cùng cỡ sân; s = sắt, g hay '.' hay khoảng trắng = gỗ) → mảng hàng 'sat' | 'go' | null. null nếu không có lớp. */
  function docLopChat(lop, rong, cao) {
    if (lop === undefined || lop === null) return null;
    if (!Array.isArray(lop) || lop.length !== cao) throw new Error('Lớp chất vật phải là mảng ' + cao + ' chuỗi, cùng cỡ với sân.');
    return lop.map(function (hang, y) {
      if (typeof hang !== 'string' || hang.length !== rong) throw new Error('Lớp chất vật dòng ' + (y + 1) + ' không cùng cỡ với sân.');
      var kq = [];
      for (var x = 0; x < rong; x++) {
        var c = hang[x];
        if (c === '.' || c === ' ') kq.push(null);
        else if (CHAT_KY[c]) kq.push(CHAT_KY[c]);      // 'sat' | 'go' | 'N' | 'S'
        else throw new Error('Ký hiệu lạ trong lớp chất vật: "' + c + '" (' + x + ', ' + y + ').');
      }
      return kq;
    });
  }

  /** lopMau: lớp màu sàn (tuỳ chọn, xem phần CẢM BIẾN MÀU); lopVatMau: lớp màu vật (tuỳ chọn); lopVatChat: lớp chất vật sắt / gỗ (tuỳ chọn, xem phần NAM CHÂM). */
  function docSan(rows, lopMau, lopVatMau, lopVatChat) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Sân phải là mảng chuỗi, không rỗng.');
    var rong = rows[0].length, co = null, vat = [], dich = [], thung = [], mau = null, nut = [], nutDe = [], banXoay = [], cong = [], congCap = {}, demCong = {}, cua = [], sac = [], gam = [], ho = [];
    for (var y = 0; y < rows.length; y++) {
      if (rows[y].length !== rong) throw new Error('Sân không phải hình chữ nhật (dòng ' + (y + 1) + ').');
      for (var x = 0; x < rong; x++) {
        var c = rows[y][x];
        if (c === 'F') { if (!co) co = { x: x, y: y }; }
        else if (c === 'o') vat.push({ x: x, y: y });
        else if (c === 'D') dich.push({ x: x, y: y });
        else if (c === 'X') { vat.push({ x: x, y: y }); dich.push({ x: x, y: y }); }
        else if (c === 'H') thung.push({ x: x, y: y });
        else if (c === 'N') nut.push({ x: x, y: y });
        else if (c === 'M') nutDe.push({ x: x, y: y });
        else if (BAN_XOAY[c] !== undefined) banXoay.push({ x: x, y: y, chieu: BAN_XOAY[c], ky: c });
        else if (CONG_KY[c]) {
          var oc = { x: x, y: y, ma: c };
          cong.push(oc);
          if (!demCong[c]) demCong[c] = [];
          demCong[c].push(oc);
        }
        else if (c === 'C') cua.push({ x: x, y: y, mo: false });
        else if (c === 'c') cua.push({ x: x, y: y, mo: true });
        else if (c === 'h') { thung.push({ x: x, y: y }); dich.push({ x: x, y: y }); }
        else if (c === 'P') sac.push({ x: x, y: y });
        else if (c === 'n') gam.push({ x: x, y: y });                  // gầm thấp (chỉ nhện đang co chân chui qua được)
        else if (c === 'u') ho.push({ x: x, y: y });                   // hố (đi vào là rơi)
        else if (MAU_KY[c]) {                                          // sàn màu (r g b y)
          if (!mau) mau = newMau(rong, rows.length);
          mau[y][x] = MAU_KY[c];
        }
        else if ('.#=SPnu'.indexOf(c) < 0 && BANG[c] === undefined) {
          throw new Error('Ký hiệu lạ trong sân: "' + c + '" (' + x + ', ' + y + ').');
        }
      }
    }
    Object.keys(demCong).forEach(function (ma) {
      var cap = demCong[ma];
      if (cap.length !== 2) throw new Error('Cổng dịch chuyển "' + ma + '" phải có đúng 2 ô trên sân (hiện có ' + cap.length + ').');
      congCap[cap[0].x + ',' + cap[0].y] = { x: cap[1].x, y: cap[1].y, ma: ma };
      congCap[cap[1].x + ',' + cap[1].y] = { x: cap[0].x, y: cap[0].y, ma: ma };
    });
    // lớp màu riêng (cfg.mau) cộng vào màu ký hiệu; hai nơi ghi hai màu khác nhau, hay màu trên tường, là lỗi cấu hình
    var lop = docLopMau(lopMau, rong, rows.length, 'màu');
    if (lop) {
      for (var ly = 0; ly < rows.length; ly++) for (var lx = 0; lx < rong; lx++) {
        if (!lop[ly][lx]) continue;
        if ('#=NCc'.indexOf(rows[ly][lx]) >= 0) throw new Error('Ô tường, nút hay cửa (' + lx + ', ' + ly + ') không có màu.');
        if (!mau) mau = newMau(rong, rows.length);
        if (mau[ly][lx] && mau[ly][lx] !== lop[ly][lx]) throw new Error('Ô (' + lx + ', ' + ly + ') có hai màu khác nhau (ký hiệu và lớp màu).');
        mau[ly][lx] = lop[ly][lx];
      }
    }
    // màu của từng vật nằm sẵn (o / X): lớp vatMau, đặt đúng ô có vật
    var lopV = docLopMau(lopVatMau, rong, rows.length, 'màu vật');
    if (lopV) {
      for (var vy = 0; vy < rows.length; vy++) for (var vx = 0; vx < rong; vx++) {
        if (!lopV[vy][vx]) continue;
        var vi = -1;
        for (var q = 0; q < vat.length; q++) if (vat[q].x === vx && vat[q].y === vy) vi = q;
        if (vi < 0) throw new Error('Màu vật đặt ở ô (' + vx + ', ' + vy + ') nhưng ô đó không có vật (o / X).');
        vat[vi].mau = lopV[vy][vx];
      }
    }
    var lopC = docLopChat(lopVatChat, rong, rows.length);                      // chất từng vật: sắt hay gỗ (mặc định gỗ)
    if (lopC) {
      for (var cy = 0; cy < rows.length; cy++) for (var cx = 0; cx < rong; cx++) {
        if (!lopC[cy][cx]) continue;
        var ci = -1;
        for (var cq = 0; cq < vat.length; cq++) if (vat[cq].x === cx && vat[cq].y === cy) ci = cq;
        if (ci < 0) throw new Error('Chất vật đặt ở ô (' + cx + ', ' + cy + ') nhưng ô đó không có vật (o / X).');
        if (lopC[cy][cx] === 'N' || lopC[cy][cx] === 'S') { vat[ci].chat = 'nam-cham'; vat[ci].cuc = lopC[cy][cx]; } else vat[ci].chat = lopC[cy][cx];
      }
    }
    dich.forEach(function (d) { if (mau && mau[d.y][d.x]) d.mau = mau[d.y][d.x]; });      // ô đích có màu → chỉ nhận vật cùng màu
    // vat: các vật nằm sẵn (ký hiệu o, X) theo thứ tự đọc từng hàng (có thêm mau nếu vật có màu); dich: các ô đích (D, X, h; có thêm mau nếu ô đó có màu);
    // thung: thùng nặng (H, h); nut: các nút bắn (N); nutDe: các nút đè giữ trên sàn (M); banXoay: bàn xoay (@ phải, % trái); cong: cổng dịch chuyển (1, 2); cua: các cửa (C đóng, c mở: { x, y, mo }); sac: các ô sạc pin của drone (P); mau: null (sân không màu) hay mảng hàng tên màu / null
    return { o: rows.slice(), rong: rong, cao: rows.length, co: co, vat: vat, dich: dich, thung: thung, mau: mau, nut: nut, nutDe: nutDe, banXoay: banXoay, cong: cong, congCap: congCap, cua: cua, sac: sac, gam: gam, ho: ho };
  }
  function newMau(rong, cao) {
    var m = [];
    for (var y = 0; y < cao; y++) { var h = []; for (var x = 0; x < rong; x++) h.push(null); m.push(h); }
    return m;
  }

  /** Lớp màu sàn / màu vật của sân thứ i của màn m (màn một sân hay nhiều sân: m.mau, m.vatMau song song với m.san). */
  /** Cờ riêng của một robot ở sân si: co = [{x,y}] (một sân, hay mọi sân giống nhau) hoặc [[{x,y}], …] song song với mảng sân. */
  function coCuaSan(co, si, nhieu) {
    if (!Array.isArray(co)) return undefined;
    return nhieu && Array.isArray(co[0]) ? co[si] : co;
  }
  function lopMauCuaSan(m, i) {
    var nhieu = Array.isArray(m.san[0]);
    function lay(l) { return l ? (nhieu ? (l[i] || null) : l) : null; }
    return { mau: lay(m.mau), vatMau: lay(m.vatMau), vatChat: lay(m.vatChat), vatThem: lay(m.vatThem), cuaNhip: lay(m.cuaNhip), noi: lay(m.noi), nutBat: lay(m.nutBat), demTu: lay(m.demTu), bongMo: lay(m.bongMo), hinh: lay(m.hinh), sonBanDau: lay(m.sonBanDau) };
  }
  function laLenhSon(t) { return TAY_SON.indexOf(t) >= 0; }
  function laHamCamBien(t) { return CAM_BIEN_HAM[t] !== undefined || CAM_MAU_HAM.indexOf(t) >= 0 || CAM_NHIN_HAM.indexOf(t) >= 0 || CAM_TU_HAM.indexOf(t) >= 0 || CAM_PIN_HAM.indexOf(t) >= 0 || CAM_HONG_NGOAI_HAM.indexOf(t) >= 0; }

  function oTai(san, x, y) {
    if (x < 0 || y < 0 || x >= san.rong || y >= san.cao) return null;   // ngoài sân
    return san.o[y][x];
  }

  /** Robot loại `loai` có vào được ô (x, y) không? Trả về null nếu được,
   *  hoặc lý do bị chặn: 'ngoai-san' | 'tuong' | 'rao' | 'nut' | 'bac-thang'. Drone bay qua '=' và 'S'. (Cửa đóng là trạng thái động: chay() tự xét thêm, xem SÚNG HƠI.) */
  function lyDoChan(san, loai, x, y) {
    var c = oTai(san, x, y);
    if (c === null) return 'ngoai-san';
    if (c === '#') return 'tuong';
    if (c === '=' && loai !== 'drone') return 'rao';          // drone bay qua hàng rào thấp
    if (c === 'N') return 'nut';
    if (c === 'S' && (loai === 'banh' || loai === 'omni')) return 'bac-thang';
    if (c === 'n' && loai !== 'nhen' && loai !== 'drone') return 'gam-thap';       // gầm thấp: nhện chui được khi co chân (chay() xét thêm theo chân), drone bay qua, thân khác không vào
    if (san.demTu && san.demTu[x + ',' + y] && loai !== 'drone') return 'dem-tu';  // ĐỆM TỪ (mùa 3, cfg.demTu): ô đệm là KHỐI, mọi thân dưới đất đâm như tường; drone bay qua
    return null;
  }

  /* ----------------------------------------------------------------- chạy */

  /**
   * Chạy một chương trình Python trên một sân.
   * cfg: { san: [chuỗi], batDau: {x,y,huong}, loaiRobot: 'banh'|'nhen'|'xich'|'omni'|'drone',
   *        pin: số nguyên (chỉ drone; pin đầy lúc đầu, xem phần DRONE),
   *        hamGoc: [tên hàm gốc được phép] (mặc định: đủ bộ của loại robot, chưa có lệnh tay),
   *        nhipToiDa: 200,
   *        mucTieu: 'toi-co' (mặc định) | 'dua-vat',
   *        doi: [{ batDau, loaiRobot, hamGoc, co?: [{x,y}] … }] (nhiều robot; co = CỜ RIÊNG của robot đó: toi-co chỉ tính khi robot tới một ô trong co, không khai = cờ nào cũng được),
   *        vat: [{x,y,mau?}] (vật thêm vào ngoài các ô 'o' / 'X' của sân), dich: [{x,y,mau?}] (ô đích thêm),
   *        mau: [chuỗi] (lớp màu sàn), vatMau: [chuỗi] (lớp màu vật): xem phần CẢM BIẾN MÀU,
   *        camBien: [{ ma:'mau'|'camera'|'camera-bay'|'khoang-cach'|'pin', o }] (cảm biến robot gắn; chỉ 'mau' / 'camera' đổi nghĩa của color(), xem CẢM BIẾN MÀU / CAMERA; 'camera-bay' = camera nhìn xuống của drone, mở look()),
   *        vatChat: [chuỗi] (lớp chất vật sắt / gỗ), vatCan: 'sat' (chỉ vật sắt phải về đích): xem phần NAM CHÂM }
   * opt: { nganSachLenh: 20000 }
   * Trả về:
   *   { thang, nhip, robot: {x,y,huong}, loi, vet, suKien, lenhTon, batDau,
   *     tay, vat, vatBanDau, dich, dungSom }
   *   - loi: null | { loai, dong, thongDiep } — loại của core ('syntax-error',
   *     'indent-error', 'runtime-error', 'infinite-loop') hoặc 'qua-nhieu-nhip'.
   *     `dong` là số dòng của mã Python (đổi sang cột/dòng là việc của ChamHoc).
   *   - vet: dãy { loai:'lenh', ten, dongPy, nganPy } và
   *          { loai:'nhip', nhip, robot:{x,y,huong,banh:{trai,phai}, tay}, vat, suKien:[…] }
   *          `tay` = { tuThe, kep, cam } và `vat` = [{ id, x, y, trangThai:'dat'|'cam'|'vo' }]
   *          chỉ có khi hamGoc có lệnh tay (xe bánh có tay gắp). Vật đang cầm có (x, y) của xe.
   *   - suKien: các mốc chẩn đoán { ma:'dam-tuong'|'banh-goi-lai'|'quen-wait'|'tay-goi-lai'|'xich-quay-do'|
   *     'tay-vuong'|'kep-hut'|'vat-vo'|'tha-bi-chan', … };
   *     'banh-goi-lai' / 'tay-goi-lai' có thêm `truoc` = lệnh đã giữ bánh / nhóm đó trong nhịp {ten, dongPy}
   *     Trong vet.suKien của nhịp còn có 'nhat-vat', 'dat-vat' (thông tin cho hoạt cảnh) và 'xong-dua-vat'.
   *   - tay, vat: trạng thái CUỐI (tay null nếu không có tay gắp); vatBanDau: vật lúc xuất phát;
   *     dich: các ô đích [{x,y}]; dungSom: null | 'vat-vo' (dừng sớm vì vật vỡ, chỉ ở mục tiêu dua-vat) | 'dam-tuong' (cfg.damLaThua) | ...
   *   - soLanDoc: số lần đọc cảm biến; docConLai: các sự kiện 'doc-cam-bien' chưa gắn vào nhịp nào (đọc sau nhịp cuối).
   */
  function chay(cfg, codeVao, opt) {
    opt = opt || {};
    // NHIỀU ROBOT (KE-HOACH-HAI-ROBOT.md): cfg.doi = [phần riêng của R1, phần riêng của R2…], codeVao = [code R1, code R2…]; sân dùng chung trong cfg.
    var laDoi = Array.isArray(cfg.doi);
    var doiKhang = laDoi && !!cfg.doiKhang;
    var dsRc = [cfg];
    if (laDoi) {
      if (cfg.doi.length < 1 || cfg.doi.length > 4) throw new Error('cfg.doi phải có từ 1 đến 4 robot.');
      if (!Array.isArray(codeVao) || codeVao.length !== cfg.doi.length) throw new Error('Nhiều robot: code phải là mảng, mỗi robot một chương trình.');
      dsRc = cfg.doi.map(function (r) { var o = Object.assign({}, cfg, r); delete o.doi; return o; });
    }
    var code = laDoi ? null : codeVao;
    var mucTieu = cfg.mucTieu || 'toi-co';
    if (MUC_TIEU.indexOf(mucTieu) < 0) throw new Error('Mục tiêu lạ: ' + mucTieu);
    var vatCan = cfg.vatCan || null;                                          // 'sat': chỉ vật sắt phải về đích (chương nam-cham)
    if (vatCan !== null && vatCan !== 'sat' && vatCan !== 'nam-cham' && vatCan !== 'tu') throw new Error('vatCan lạ: ' + vatCan);
    var san = docSan(cfg.san, cfg.mau, cfg.vatMau, cfg.vatChat);
    var nhipToiDa = cfg.nhipToiDa || 200;
    var sacSet = {};
    san.sac.forEach(function (q) { sacSet[q.x + ',' + q.y] = true; });
    if (laDoi && mucTieu === 'bong-mo') throw new Error('Mục tiêu bong-mo chưa dùng cho nhiều robot.');

    // biến RIÊNG của từng robot: nhiều robot thì đổi theo robot đang xét (catRobot / napRobot); biến của sân (vật, thùng, cửa, nút, nhịp…) dùng chung
    var
      loai, laBanh, laDrone, bd, chan, hamGoc, phanCung, khayThieu, nguonDong, api, coTay, coXoay,
      coNamCham, coNem, coHoi, coCamBien, coCamTu, coColor, dsCamBien, coCamMauBung, coCamera, camNhin, coPinCamBien, coLook,
      coCamBay, pinToiDa, pin, dao, rb, demBang, quayDo, lenh, lenhTon, tayCho, chanCho, nhayBuoc,
      truotCho, ncCho, nc, nem, nemCho, hoiCho, dan, vet, suKienChan, loi, docCho, docLienTiep,
      soLanDoc, traVe, tay, hangNhip, xeToiCo, coRieng, coSon, son, sonCho, lucBan, laR1, coHongNgoai, xichDay, beSung, coDap, dau, coCam4, cam4TaiCho;
    var nhip = 0, thang = false, dungSom = null;
    var damLaThua = !!cfg.damLaThua;                                       // HD2: màn ép, đâm tường (mọi loại vật cản) là thua, dừng ngay cuối nhịp đó
    /** Dựng phần riêng của một robot từ cấu hình rc (một robot: chính cfg; nhiều robot: cfg gộp với cfg.doi[i]). */
    function khoiRobot(rc) {
      laR1 = rc === dsRc[0];                                               // robot của người chơi (đối kháng: R1)
      loai = rc.loaiRobot || 'banh';
      if (loai !== 'banh' && loai !== 'nhen' && loai !== 'xich' && loai !== 'omni' && loai !== 'drone') throw new Error('Loại robot lạ: ' + loai);
      laBanh = loai === 'banh' || loai === 'xich' || loai === 'omni';      // dùng chung bộ lệnh bánh
      laDrone = loai === 'drone';                                          // drone: bay 4 hướng tuyệt đối, 1 nhịp / ô, có pin tuỳ chọn
      bd = rc.batDau;
      if (!bd) throw new Error('Thiếu vị trí xuất phát (batDau).');
      if (lyDoChan(san, loai, bd.x, bd.y)) throw new Error('Robot xuất phát trong chỗ không đứng được.');
      if (oTai(san, bd.x, bd.y) === 'u' && loai !== 'drone') throw new Error('Robot xuất phát ngay trên cái hố.');
      if (bd.chan !== undefined && bd.chan !== null && bd.chan !== 'co' && bd.chan !== 'dung') throw new Error('batDau.chan phải là "dung" hoặc "co".');
      if (bd.chan === 'co' && loai !== 'nhen') throw new Error('batDau.chan chỉ dùng cho nhện (chân co / duỗi).');
      chan = bd.chan === 'co' ? 'co' : 'dung';                              // nhện: tư thế chân hiện tại 'dung' | 'co' (xem phần CHÂN NHỆN)
      if (loai === 'nhen' && oTai(san, bd.x, bd.y) === 'n' && chan !== 'co') throw new Error('Nhện xuất phát trong ô gầm thấp thì chân phải đang co (batDau.chan "co").');

      hamGoc = rc.hamGoc || HAM_GOC[loai];                                  // KHAY (xem phần KHAY VÀ PHẦN CỨNG)
      function kiemTenGoc(t) {
        if (HAM_GOC[loai].indexOf(t) < 0 && TAY_LENH.indexOf(t) < 0 && CAM_BIEN_HAM[t] === undefined && CAM_MAU_HAM.indexOf(t) < 0 && CAM_NHIN_HAM.indexOf(t) < 0 && TAY_NAM_CHAM.indexOf(t) < 0 && CAM_TU_HAM.indexOf(t) < 0 && TAY_NEM.indexOf(t) < 0 && TAY_HOI.indexOf(t) < 0 && TAY_SON.indexOf(t) < 0 && CAM_PIN_HAM.indexOf(t) < 0 && CAM_HONG_NGOAI_HAM.indexOf(t) < 0 && !(loai === 'drone' && DRONE_DAP.indexOf(t) >= 0)) {
          throw new Error('Hàm gốc "' + t + '" không thuộc loại robot ' + loai + '.');
        }
      }
      hamGoc.forEach(kiemTenGoc);
      phanCung = rc.phanCung ? rc.phanCung.slice() : hamGoc.slice();       // PHẦN CỨNG: không khai thì bằng khay
      phanCung.forEach(kiemTenGoc);
      hamGoc.forEach(function (t) { if (phanCung.indexOf(t) < 0) throw new Error('Khay có lệnh "' + t + '" mà phần cứng của robot không có.'); });
      khayThieu = {};                                                        // lệnh có trong phần cứng nhưng chưa mở trên khay: chỉ hàm của em được gọi
      phanCung.forEach(function (t) { if (hamGoc.indexOf(t) < 0) khayThieu[t] = true; });
      nguonDong = typeof rc.nguonDong === 'function' ? rc.nguonDong : null;
      api = {};
      phanCung.forEach(function (t) { api[t] = function () { return 0; }; });    // chỉ để nhân biết tên
      coTay = hamGoc.some(function (t) { return TAY_LENH.indexOf(t) >= 0; });
      coXoay = hamGoc.some(function (t) { return TAY_XOAY.indexOf(t) >= 0; });           // tay XOAY: khớp xoay giữa trái / trước / phải (xem phần TAY XOAY)
      if (coXoay && !laBanh) throw new Error('Tay xoay chỉ gắn lên xe có bánh (xe bánh, xích, omni): nhện và drone không có.');
      coNamCham = hamGoc.some(function (t) { return TAY_NAM_CHAM.indexOf(t) >= 0; });     // tay nam châm (magnet_n / magnet_s / magnet_off)
      if (coNamCham && coTay) throw new Error('Một robot chỉ có một tay: nam châm không đi chung với tay kẹp.');
      // Nhện + nam châm = NAM CHÂM BỤNG (mùa 3; xem phần NAM CHÂM): luật treo như drone qua ncBung(); không còn cấm "Nhện không gắn nam châm" (trước P1 mùa 3).
      coNem = hamGoc.some(function (t) { return TAY_NEM.indexOf(t) >= 0; });                  // tay máy ném (aim / throw / load)
      if (coNem && loai === 'nhen') throw new Error('Nhện không gắn máy ném (nhện không có hướng mặt).');
      if (coNem && (coTay || coNamCham)) throw new Error('Một robot chỉ có một tay: máy ném không đi chung với tay kẹp hay nam châm.');
      coHoi = hamGoc.some(function (t) { return TAY_HOI.indexOf(t) >= 0; });                  // tay súng hơi (spray / spray_back)
      if (coHoi && loai === 'nhen') throw new Error('Nhện không gắn vòi phun (nhện không có hướng mặt).');
      if (coHoi && (coTay || coNamCham || coNem)) throw new Error('Một robot chỉ có một tay: vòi phun không đi chung với tay kẹp, nam châm hay máy ném.');
      coSon = hamGoc.some(laLenhSon);                                                         // đầu MÁY SƠN (ink / dot / pen_down / pen_up)
      if (coSon && !laBanh && !laDrone) throw new Error('Máy sơn chỉ gắn lên xe có bánh (xe bánh, xích, omni) hay drone (treo dưới bụng).');
      if (coSon && (coTay || coNamCham || coNem || coHoi)) throw new Error('Một robot chỉ có một tay: máy sơn không đi chung với tay kẹp, nam châm, máy ném hay vòi phun.');
      coCamBien = hamGoc.some(function (t) { return CAM_BIEN_HAM[t] !== undefined; });     // cảm biến khoảng cách (front_clear…)
      coCamTu = hamGoc.some(function (t) { return CAM_TU_HAM.indexOf(t) >= 0; });         // cảm biến từ front_metal (gắn vào cảm biến khoảng cách)
      if ((coCamBien || coCamTu) && loai === 'nhen') throw new Error('Nhện không gắn cảm biến khoảng cách (nhện không có hướng mặt).');
      coHongNgoai = hamGoc.some(function (t) { return CAM_HONG_NGOAI_HAM.indexOf(t) >= 0; });      // cảm biến HỒNG NGOẠI ở mũi xe: distance() / warm() (mùa 2)
      if (coHongNgoai && loai === 'nhen') throw new Error('Nhện không gắn cảm biến hồng ngoại (nhện không có hướng mặt để đo phía trước).');
      coColor = hamGoc.some(function (t) { return CAM_MAU_HAM.indexOf(t) >= 0; });            // đọc màu color()
      dsCamBien = Array.isArray(rc.camBien) ? rc.camBien : [];
      coCamMauBung = dsCamBien.some(function (c) { return c && c.ma === 'mau'; });
      coCamera = dsCamBien.some(function (c) { return c && c.ma === 'camera'; });
      if (coCamera && loai === 'drone') throw new Error('Drone không gắn camera: drone không có hướng mặt để nhìn "phía trước".');
      if (coColor && coCamMauBung && coCamera) throw new Error('Robot gắn cả cảm biến màu ở bụng lẫn camera: color() sẽ không biết đọc ô nào. Chỉ giữ một trong hai.');
      camNhin = coColor && coCamera;                                       // color() đọc Ô TRƯỚC MẶT (camera); không thì đọc sàn dưới xe (cảm biến bụng)
      var c4 = dsCamBien.filter(function (c) { return c && c.ma === MA_CAM_4; })[0];
      coCam4 = !!c4; cam4TaiCho = !!(c4 && c4.taiCho);                     // camera bốn hướng color(huong) (mùa 4); taiCho: nâng cấp thêm "here"
      if (coCam4 && (coCamMauBung || coCamera)) throw new Error('Camera bốn hướng không gắn chung với cảm biến màu ở bụng hay camera trước: color() sẽ không biết đọc kiểu nào.');
      if (coCam4 && !coColor) throw new Error('Camera bốn hướng cần color() trên khay.');
      coPinCamBien = hamGoc.some(function (t) { return CAM_PIN_HAM.indexOf(t) >= 0; });                  // đo pin battery()
      coLook = hamGoc.some(function (t) { return CAM_NHIN_HAM.indexOf(t) >= 0; });                        // camera nhìn xuống look() (chỉ drone)
      coCamBay = dsCamBien.some(function (c) { return c && c.ma === MA_CAM_BAY; });
      if (coLook && !laDrone) throw new Error('look() chỉ dành cho drone (camera nhìn xuống dưới bụng drone).');
      if (coCamBay && !laDrone) throw new Error('Camera nhìn xuống (camera-bay) chỉ gắn lên drone.');
      if (coLook && !coCamBay) throw new Error('look() cần drone gắn camera nhìn xuống dưới bụng (rc.camBien có { ma: "camera-bay" }).');
      if (laDrone) {
        if (coTay) throw new Error('Drone không gắn tay kẹp (arm_down, arm_up, grab, release): thân drone chỉ gắn được nam châm treo.');
        if (coNem) throw new Error('Drone không gắn máy ném (aim, throw, load): thân drone chỉ gắn được nam châm treo.');
        if (coHoi) throw new Error('Drone không gắn vòi phun (spray, spray_back): thân drone chỉ gắn được nam châm treo.');
        if (coCamBien || coCamTu) throw new Error('Drone không gắn cảm biến khoảng cách hay cảm biến từ (drone không có hướng mặt để đo "phía trước").');
        if (coHongNgoai) throw new Error('Drone không gắn cảm biến hồng ngoại (drone không có hướng mặt để đo "phía trước").');
      } else if (coPinCamBien) throw new Error('battery() chỉ dành cho drone (robot có pin).');
      pinToiDa = null, pin = null;                                         // drone: pin đầy = pin lúc đầu; null = pin vô hạn
      if (rc.pin !== undefined && rc.pin !== null) {
        if (!laDrone) throw new Error('pin chỉ dùng cho drone (loaiRobot "drone").');
        if (typeof rc.pin !== 'number' || !isFinite(rc.pin) || Math.floor(rc.pin) !== rc.pin || rc.pin < 1 || rc.pin > PIN_TOI_DA) throw new Error('pin phải là số nguyên từ 1 đến ' + PIN_TOI_DA + '.');
        pinToiDa = rc.pin; pin = rc.pin;
      }
      if (coPinCamBien && pinToiDa === null) throw new Error('battery() cần màn khai pin (rc.pin): drone không khai pin thì pin vô hạn.');
      coDap = laDrone && phanCung.indexOf('land') >= 0;                     // drone nâng cấp đáp đất (land / take_off): chỉ sạc khi đáp trên P
      if (laDrone && (phanCung.indexOf('land') >= 0) !== (phanCung.indexOf('take_off') >= 0)) throw new Error('land() và take_off() đi cùng nhau: drone đáp được thì cũng cất cánh được.');
      dau = false;                                                           // drone luôn xuất phát lúc đang bay

      // đấu dây ngược (xem phần ĐẤU DÂY NGƯỢC): rc.daoChieu = ['trai'] | ['phai'] | cả hai
      dao = { trai: false, phai: false, cam: false, tay: false, kep: false, xoay: false, chan: false, sung: false };
      if (rc.daoChieu !== undefined && rc.daoChieu !== null) {
        if (!Array.isArray(rc.daoChieu)) throw new Error('daoChieu phải là mảng, vd ["trai"].');
        if (rc.daoChieu.length && !laBanh && !(loai === 'nhen' && rc.daoChieu.every(function (b) { return b === DAO_CHIEU_CHAN; }))) throw new Error('daoChieu chỉ dùng cho robot có hai bánh (xe bánh, xích, omni); nhện chỉ có daoChieu "chan".');
        rc.daoChieu.forEach(function (b) {
          if (DAO_CHIEU_BANH.indexOf(b) < 0 && b !== DAO_CHIEU_CAM && b !== DAO_CHIEU_CUC && b !== DAO_CHIEU_CHAN && b !== DAO_CHIEU_SUNG && DAO_CHIEU_TAY.indexOf(b) < 0) throw new Error('daoChieu lạ: "' + b + '" (chỉ có "trai", "phai", "cam", "tay", "kep", "xoay", "cuc", "sung" hoặc "chan").');
          if (b === DAO_CHIEU_CHAN && loai !== 'nhen') throw new Error('daoChieu "chan" chỉ dùng cho nhện (chân co / duỗi).');
          if (DAO_CHIEU_TAY.indexOf(b) >= 0 && !coTay) throw new Error('daoChieu "' + b + '" cần robot có tay kẹp (hamGoc có arm_down, arm_up, grab, release).');
          if (b === 'xoay' && !coXoay) throw new Error('daoChieu "xoay" cần robot có tay xoay (hamGoc có arm_left, arm_right).');
          if (b === DAO_CHIEU_SUNG && !coHoi) throw new Error('daoChieu "sung" cần robot có vòi phun (hamGoc có spray, spray_back).');
          if (b === DAO_CHIEU_CUC && !coNamCham) throw new Error('daoChieu "cuc" cần robot có tay nam châm (hamGoc có magnet_n, magnet_s, magnet_off).');
          if (b === DAO_CHIEU_CAM && !coCamBien) throw new Error('daoChieu "cam" cần robot có cảm biến khoảng cách (hamGoc có front_clear / left_clear / right_clear).');
          dao[b] = true;
        });
      }

      rb = { x: bd.x, y: bd.y, huong: bd.huong || 0 };
      demBang = 0;
      quayDo = null;                          // xích: phần quay dở { khoa:'t,p', huong:+1|-1, nhip, lenh:{ten,dongPy}|null }
      lenh = { trai: 0, phai: 0 };            // lệnh bánh đang chờ wait()
      lenhTon = [];                           // các lệnh (bánh và tay) chưa wait(): {ten, dongPy}
      tayCho = { 'tu-the': null, 'kep': null, 'xoay': null };   // lệnh tay đang chờ wait(), theo nhóm: {ten, dongPy}
      chanCho = null;                         // nhện: lệnh crouch() / stand() đang chờ nhịp: {ten, dongPy}
      nhayBuoc = false;                       // nhện: nhịp đầu của bước vừa duỗi chân từ lúc đang co → nhịp thứ hai của bước là cú NHẢY (bật qua một ô)
      truotCho = null;                        // omni: lệnh trượt đang chờ wait(): {ten, dongPy, bien:-1|+1}
      ncCho = null;                           // nam châm: lệnh magnet_n() / magnet_s() / magnet_off() đang chờ wait(): {ten, dongPy, cuc} (cuc null = ngắt; đã tính daoChieu 'cuc')
      nc = { cuc: null, bat: false, cam: null, lenhCuc: null };   // nam châm: cực đang bật (null = tắt), bat = có cực, id vật đang dính, lenhCuc = lệnh magnet_n / magnet_s đã đặt cực đó {ten, dongPy} (để chẩn đoán chỉ đúng dòng)
      nem = { tam: 1, ro: null };             // máy ném: tầm đang đặt (1–3), id vật trong rổ
      nemCho = null;                          // máy ném: lệnh load() / throw() đang chờ wait(): {ten, dongPy, tam}
      hoiCho = null;                          // súng hơi: lệnh spray() / spray_back() đang chờ wait(): {ten, dongPy, sau} (sau = bắn ra SAU thật, đã tính daoChieu 'sung')
      dan = null;                             // súng hơi: số viên còn lại (null = vô hạn)
      sonCho = null;                          // máy sơn: lệnh dot() / pen_down() / pen_up() đang chờ wait(): {ten, dongPy, mau} (mau = màu LÚC GỌI)
      var mbd = rc.mucBanDau === undefined || rc.mucBanDau === null ? 'red' : rc.mucBanDau;
      if (MAU_TEN.indexOf(mbd) < 0) throw new Error('mucBanDau phải là "red", "green", "blue" hoặc "yellow".');
      son = { ha: false, mau: mbd };          // máy sơn: đầu sơn đang hạ (giữ sơn) không, màu đang chọn
      if (rc.danToiDa !== undefined && rc.danToiDa !== null) {
        if (!coHoi) throw new Error('danToiDa chỉ dùng cho robot có vòi phun (hamGoc có spray, spray_back).');
        if (typeof rc.danToiDa !== 'number' || Math.floor(rc.danToiDa) !== rc.danToiDa || rc.danToiDa < 0) throw new Error('danToiDa phải là số nguyên không âm.');
        dan = rc.danToiDa;
      }
      lucBan = !!rc.lucBan && coHoi;          // vòi phun: spray(p) / spray_back(p) chọn được lực "low" / "high"; robot không vòi phun bỏ qua cờ
                                              // (29/10: lộ trình bật lucBan cho mọi màn từ gói 6 Lực phun, kể cả robot không vòi phun)
      xichDay = !!rc.xichDay;                 // mùa 2: xích TIẾN vào thùng nặng thì đẩy thùng 1 ô (chỉ có nghĩa với loai 'xich'; thân khác bỏ qua)
      beSung = !!rc.beSung;                   // mùa 2: bệ súng xích — xích gắn súng hơi bắn tụ thì không giật (thân khác vẫn giật; robot không súng bỏ qua cờ, để màn nhiều robot khai một chỗ)
      vet = [], suKienChan = [];
      loi = null;
      docCho = [], docLienTiep = 0, soLanDoc = 0, traVe = 0;       // cảm biến: sự kiện chờ gắn vào nhịp kế, số lần đọc liên tiếp chưa có nhịp, tổng số lần đọc, giá trị trả về cho nhân

      // ---- tay gắp, vật, ô đích
      tay = { tuThe: 'tren', kep: false, cam: null };
      if (coXoay) tay.xoay = 'truoc';                 // tay xoay: nấc khớp hiện tại 'trai' | 'truoc' | 'phai'
      hangNhip = [];                              // nhiều robot: các nhịp chương trình đã ra, chờ bộ xếp lịch chạy chung (motNhip)
      xeToiCo = false;                            // nhiều robot, mục tiêu toi-co: robot này đã tới một cờ (dừng chương trình, đứng yên)
      coRieng = null;                             // nhiều robot: cờ riêng của robot này (rc.co); null = cờ nào cũng được
      if (laDoi && rc.co !== undefined && rc.co !== null) {
        if (!Array.isArray(rc.co) || !rc.co.length) throw new Error('co của robot phải là mảng ô cờ [{x,y}].');
        rc.co.forEach(function (q) { if (oTai(san, q.x, q.y) !== 'F') throw new Error('Cờ riêng (' + q.x + ', ' + q.y + ') không phải ô cờ F.'); });
        coRieng = rc.co;
      }
    }
    function catRobot() {
      return {
        loai: loai, laBanh: laBanh, laDrone: laDrone, bd: bd, chan: chan, hamGoc: hamGoc,
        phanCung: phanCung, khayThieu: khayThieu, nguonDong: nguonDong, api: api, coTay: coTay, coXoay: coXoay,
        coNamCham: coNamCham, coNem: coNem, coHoi: coHoi, coCamBien: coCamBien, coCamTu: coCamTu, coColor: coColor,
        dsCamBien: dsCamBien, coCamMauBung: coCamMauBung, coCamera: coCamera, camNhin: camNhin, coPinCamBien: coPinCamBien, coLook: coLook,
        coCamBay: coCamBay, pinToiDa: pinToiDa, pin: pin, dao: dao, rb: rb, demBang: demBang,
        quayDo: quayDo, lenh: lenh, lenhTon: lenhTon, tayCho: tayCho, chanCho: chanCho, nhayBuoc: nhayBuoc,
        truotCho: truotCho, ncCho: ncCho, nc: nc, nem: nem, nemCho: nemCho, hoiCho: hoiCho,
        dan: dan, vet: vet, suKienChan: suKienChan, loi: loi, docCho: docCho, docLienTiep: docLienTiep,
        soLanDoc: soLanDoc, traVe: traVe, tay: tay, hangNhip: hangNhip, xeToiCo: xeToiCo, coRieng: coRieng, coSon: coSon, son: son, sonCho: sonCho, lucBan: lucBan, laR1: laR1,
        coHongNgoai: coHongNgoai, xichDay: xichDay, beSung: beSung, coDap: coDap, dau: dau, coCam4: coCam4, cam4TaiCho: cam4TaiCho
      };
    }
    function napRobot(o) {
      loai = o.loai; laBanh = o.laBanh; laDrone = o.laDrone; bd = o.bd; chan = o.chan; hamGoc = o.hamGoc;
      phanCung = o.phanCung; khayThieu = o.khayThieu; nguonDong = o.nguonDong; api = o.api; coTay = o.coTay; coXoay = o.coXoay;
      coNamCham = o.coNamCham; coNem = o.coNem; coHoi = o.coHoi; coCamBien = o.coCamBien; coCamTu = o.coCamTu; coColor = o.coColor;
      dsCamBien = o.dsCamBien; coCamMauBung = o.coCamMauBung; coCamera = o.coCamera; camNhin = o.camNhin; coPinCamBien = o.coPinCamBien; coLook = o.coLook;
      coCamBay = o.coCamBay; pinToiDa = o.pinToiDa; pin = o.pin; dao = o.dao; rb = o.rb; demBang = o.demBang;
      quayDo = o.quayDo; lenh = o.lenh; lenhTon = o.lenhTon; tayCho = o.tayCho; chanCho = o.chanCho; nhayBuoc = o.nhayBuoc;
      truotCho = o.truotCho; ncCho = o.ncCho; nc = o.nc; nem = o.nem; nemCho = o.nemCho; hoiCho = o.hoiCho;
      dan = o.dan; vet = o.vet; suKienChan = o.suKienChan; loi = o.loi; docCho = o.docCho; docLienTiep = o.docLienTiep;
      soLanDoc = o.soLanDoc; traVe = o.traVe; tay = o.tay; hangNhip = o.hangNhip; xeToiCo = o.xeToiCo; coRieng = o.coRieng; coSon = o.coSon; son = o.son; sonCho = o.sonCho; lucBan = o.lucBan; laR1 = o.laR1;
      coHongNgoai = o.coHongNgoai; xichDay = o.xichDay; beSung = o.beSung; coDap = o.coDap; dau = o.dau; coCam4 = o.coCam4; cam4TaiCho = o.cam4TaiCho;
    }
    khoiRobot(dsRc[0]);

    // bóng mờ (xem phần BÓNG MỜ): tư thế đích, các ô phải đi qua, vị trí vật
    var bongMo = null, diQua = [], diQuaTai = {}, sonBanDau = null;
    if (mucTieu === 'bong-mo') {
      var bm = cfg.bongMo;
      if (!bm || typeof bm !== 'object' || !laSoNguyen(bm.x) || !laSoNguyen(bm.y)) throw new Error('Mục tiêu bong-mo cần cfg.bongMo { x, y, huong }.');
      if (lyDoChan(san, loai, bm.x, bm.y)) throw new Error('Bóng mờ nằm trong chỗ không đứng được: (' + bm.x + ', ' + bm.y + ').');
      var coHuong = loai !== 'nhen' && loai !== 'drone';
      if (coHuong && !(laSoNguyen(bm.huong) && bm.huong >= 0 && bm.huong <= 3)) throw new Error('bongMo.huong phải là 0, 1, 2 hoặc 3.');
      bongMo = { x: bm.x, y: bm.y, huong: coHuong ? bm.huong : null, diQua: [], vat: [] };
      (bm.diQua || []).forEach(function (q) {
        if (!q || !laSoNguyen(q.x) || !laSoNguyen(q.y)) throw new Error('bongMo.diQua phải là mảng ô { x, y }.');
        if (lyDoChan(san, loai, q.x, q.y)) throw new Error('Ô diQua nằm trong chỗ không đứng được: (' + q.x + ', ' + q.y + ').');
        bongMo.diQua.push({ x: q.x, y: q.y });
        diQua.push({ x: q.x, y: q.y, da: false });
        diQuaTai[q.x + ',' + q.y] = diQua[diQua.length - 1];
      });
      (bm.vat || []).forEach(function (q) {
        if (!q || !laSoNguyen(q.x) || !laSoNguyen(q.y)) throw new Error('bongMo.vat phải là mảng ô { x, y, mau? }.');
        if (q.mau !== undefined && q.mau !== null && MAU_TEN.indexOf(q.mau) < 0) throw new Error('bongMo.vat: màu lạ "' + q.mau + '" (chỉ có red, green, blue, yellow).');
        var qv = { x: q.x, y: q.y }; if (q.mau) qv.mau = q.mau;                                // vật mờ có màu: chấm cả màu, không chỉ ô
        bongMo.vat.push(qv);
      });
      bongMo.thung = null;                                                                   // thùng mờ (chương che-sung-hoi): lúc xong mọi thùng nặng nằm đúng các ô này; null = không xét
      if (bm.thung !== undefined && bm.thung !== null) {
        if (!Array.isArray(bm.thung)) throw new Error('bongMo.thung phải là mảng ô { x, y }.');
        bongMo.thung = [];
        bm.thung.forEach(function (q) {
          if (!q || !laSoNguyen(q.x) || !laSoNguyen(q.y)) throw new Error('bongMo.thung phải là mảng ô { x, y }.');
          if (lyDoChan(san, loai, q.x, q.y) || oTai(san, q.x, q.y) === 'S') throw new Error('Thùng mờ nằm trong chỗ thùng không đứng được: (' + q.x + ', ' + q.y + ').');
          bongMo.thung.push({ x: q.x, y: q.y });
        });
      }
      bongMo.cam = false; bongMo.camMau = null;                                              // cam: lúc xong xe phải ĐANG CẦM một vật (không tính vào bongMo.vat); camMau: màu vật phải cầm (tuỳ chọn)
      if (bm.cam) {
        if (!coTay && !coNamCham) throw new Error('bongMo.cam cần robot có tay kẹp hay nam châm (hamGoc có arm_down, arm_up, grab, release hoặc magnet_n, magnet_s, magnet_off).');
        var camMau = typeof bm.cam === 'object' ? bm.cam.mau : null;
        if (camMau && MAU_TEN.indexOf(camMau) < 0) throw new Error('bongMo.cam: màu lạ "' + camMau + '" (chỉ có red, green, blue, yellow).');
        bongMo.cam = true; bongMo.camMau = camMau || null;
      }
      bongMo.xoay = null;                                                                    // tay xoay: nấc khớp lúc xong ('trai' | 'truoc' | 'phai'); robot có tay xoay mà bongMo không khai thì mặc định 'truoc' (tay chỉ phía trước như xe mờ)
      if (bm.xoay !== undefined && bm.xoay !== null) {
        if (!coXoay) throw new Error('bongMo.xoay cần robot có tay xoay (hamGoc có arm_left, arm_right).');
        if (XOAY_NAC.indexOf(bm.xoay) < 0) throw new Error('bongMo.xoay phải là "trai", "truoc" hoặc "phai".');
        bongMo.xoay = bm.xoay;
      } else if (coXoay) bongMo.xoay = 'truoc';
      bongMo.chan = null;                                                                    // nhện: tư thế chân lúc xong ('co' | 'dung'); không khai thì không xét
      if (bm.chan !== undefined && bm.chan !== null) {
        if (loai !== 'nhen') throw new Error('bongMo.chan chỉ dùng cho nhện (chân co / duỗi).');
        if (bm.chan !== 'co' && bm.chan !== 'dung') throw new Error('bongMo.chan phải là "co" hoặc "dung".');
        bongMo.chan = bm.chan;
      }
      if (oTai(san, bm.x, bm.y) === 'u' && loai !== 'drone') throw new Error('Bóng mờ nằm trên cái hố: (' + bm.x + ', ' + bm.y + ').');
    } else if (cfg.bongMo) throw new Error('bongMo chỉ dùng với mục tiêu "bong-mo".');

    // máy sơn (xem phần MÁY SƠN): lớp ô đã tô (dùng chung mọi robot) và hình mờ của mục tiêu 'to-hinh'
    var daSon = {}, hinh = null, soOHinh = 0, toThua = false;
    if (mucTieu === 'to-hinh') {
      hinh = docLopMau(cfg.hinh, san.rong, san.cao, 'hình');
      if (!hinh) throw new Error('Mục tiêu to-hinh cần cfg.hinh (mảng chuỗi r g b y . cùng cỡ sân).');
      for (var hy = 0; hy < san.cao; hy++) for (var hx = 0; hx < san.rong; hx++) {
        if (!hinh[hy][hx]) continue;
        if ('#=NCcnu'.indexOf(san.o[hy][hx]) >= 0) throw new Error('Ô hình (' + hx + ', ' + hy + ') nằm trên tường, rào, nút, cửa, gầm hay hố.');
        soOHinh++;
      }
      if (!soOHinh) throw new Error('Hình mờ phải có ít nhất một ô.');
    } else if (cfg.hinh) throw new Error('hinh chỉ dùng với mục tiêu "to-hinh".');
    var lopSon = docLopMau(cfg.sonBanDau, san.rong, san.cao, 'sơn sẵn');
    if (lopSon) for (var sy = 0; sy < san.cao; sy++) for (var sx = 0; sx < san.rong; sx++) {
      if (!lopSon[sy][sx]) continue;
      if ('#=NCcnu'.indexOf(san.o[sy][sx]) >= 0) throw new Error('Ô sơn sẵn (' + sx + ', ' + sy + ') nằm trên tường, rào, nút, cửa, gầm hay hố.');
      if (hinh && !hinh[sy][sx]) throw new Error('Ô sơn sẵn (' + sx + ', ' + sy + ') nằm ngoài hình mờ.');
      daSon[sx + ',' + sy] = lopSon[sy][sx];
    }
    sonBanDau = chupSonDau();
    function chupSonDau() { return Object.keys(daSon).map(function (k) { var q = k.split(','); return { x: +q[0], y: +q[1], mau: daSon[k] }; }); }
    function chupSon() { return Object.keys(daSon).map(function (k) { var a = k.split(','); return { x: +a[0], y: +a[1], mau: daSon[k] }; }); }
    /** Hình mờ đã tô xong: mọi ô hình đúng màu, không ô nào ngoài hình bị tô. */
    function hinhDat() {
      if (!hinh || toThua) return false;
      var dung = 0;
      for (var k in daSon) {
        var a = k.split(','), m = hinh[+a[1]][+a[0]];
        if (!m) return false;
        if (m === daSon[k]) dung++;
      }
      return dung === soOHinh;
    }

    var vats = [], dichSet = {}, dsDich = [];
    function themVat(o) {
      var x = Math.floor(o.x), y = Math.floor(o.y);
      if (!(x >= 0 && y >= 0 && x < san.rong && y < san.cao) || '#=NCcnu'.indexOf(san.o[y][x]) >= 0) return;
      for (var i = 0; i < vats.length; i++) if (vats[i].x === x && vats[i].y === y) return;     // mỗi ô một vật
      var chatV = o.chat === 'sat' ? 'sat' : o.chat === 'nam-cham' ? 'nam-cham' : 'go', cucV = null;
      if (chatV === 'nam-cham') {
        if (o.cuc !== 'N' && o.cuc !== 'S') throw new Error('Vật nam châm ở (' + x + ', ' + y + ') phải có cực "N" hoặc "S".');
        cucV = o.cuc;
      }
      vats.push({ id: vats.length + 1, x: x, y: y, trangThai: 'dat', mau: o.mau || (cucV ? CUC_MAU[cucV] : null), chat: chatV, cuc: cucV });
    }
    var dichMau = {};                               // 'x,y' → màu của ô đích (chỉ ô đích có màu)
    function themDich(o) {
      var k = o.x + ',' + o.y;
      if (!dichSet[k]) {
        dichSet[k] = true;
        var md = o.mau || (san.mau && san.mau[o.y] && san.mau[o.y][o.x]) || null;
        if (md) dichMau[k] = md;
        var d = { x: o.x, y: o.y }; if (md) d.mau = md;
        dsDich.push(d);
      }
    }
    function chup() { return { x: rb.x, y: rb.y, huong: rb.huong }; }
    function chupTay() { var o = { tuThe: tay.tuThe, kep: tay.kep, cam: tay.cam }; if (coXoay) o.xoay = tay.xoay; return o; }
    function chupNamCham() { return { bat: nc.bat, cuc: nc.cuc, cam: nc.cam }; }
    function chupNem() { return { tam: nem.tam, ro: nem.ro }; }
    function chupVat() { return vats.map(function (v) { var o = { id: v.id, x: v.x, y: v.y, trangThai: v.trangThai }; if (v.mau) o.mau = v.mau; if (coNamCham || v.chat === 'sat' || v.chat === 'nam-cham') o.chat = v.chat; if (v.cuc) o.cuc = v.cuc; return o; }); }
    /** Màu sàn của ô (x, y): tên màu hay null. */
    function mauNen(x, y) { return (san.mau && san.mau[y] && san.mau[y][x]) || null; }
    /** Màu cảm biến thấy ở ô (x, y) khi không có vật: sơn phủ lên sàn (xem SƠN VÀ CẢM BIẾN MÀU). { mau, son: true nếu là màu sơn }. */
    function mauThay(x, y) { var s = daSon[x + ',' + y]; return s ? { mau: s, son: true } : { mau: mauNen(x, y), son: false }; }
    /** Vật v nằm trên ô đích (x, y) có hợp màu không: đích không màu nhận mọi vật; đích có màu chỉ nhận vật cùng màu. */
    function hopMauDich(v, x, y) {
      var md = dichMau[x + ',' + y];
      return !md || v.mau === md;
    }
    // ---- thùng nặng (H, h; cfg.thung thêm ngoài sân, dùng cho thử nghiệm). dem: số nhịp liên tiếp nằm trên băng chuyền
    var thungs = [];
    function themThung(o) {
      var x = Math.floor(o.x), y = Math.floor(o.y);
      if (!(x >= 0 && y >= 0 && x < san.rong && y < san.cao) || '#=NCcnu'.indexOf(san.o[y][x]) >= 0) return;
      for (var i = 0; i < thungs.length; i++) if (thungs[i].x === x && thungs[i].y === y) return;     // mỗi ô một thùng
      thungs.push({ id: thungs.length + 1, x: x, y: y, dem: 0 });
    }
    function thungTai(x, y) {
      for (var i = 0; i < thungs.length; i++) if (thungs[i].x === x && thungs[i].y === y) return thungs[i];
      return null;
    }
    function chupThung() { return thungs.map(function (t) { return { id: t.id, x: t.x, y: t.y }; }); }
    /** Lý do ô (x, y) không nhận thêm được một thùng, null nếu nhận được. */
    function oThungChan(x, y) {
      var c = oTai(san, x, y);
      if (c === null) return 'ngoai-san';
      if (c === '#' || c === 'N') return 'tuong';
      if (c === '=') return 'rao';
      if (c === 'S') return 'bac-thang';
      if (san.demTu && san.demTu[x + ',' + y]) return 'dem-tu';           // ô đệm từ là khối
      if (cuaDong(x, y)) return 'cua';                                    // cửa đang đóng chặn thùng như chặn xe
      if (thungTai(x, y)) return 'thung-nang';
      if (rb.x === x && rb.y === y && !laDrone) return 'xe';              // drone lơ lửng trên thùng, không chiếm ô
      if (xeDatTai(x, y)) return 'dong-doi';
      if (vatNamTai(x, y)) return 'vat';
      return null;
    }
    san.thung.forEach(themThung); (cfg.thung || []).forEach(themThung);
    var thungBanDau = chupThung();
    function dayThungXong() {
      if (!thungs.length) return false;
      return thungs.every(function (t) { return dichSet[t.x + ',' + t.y]; });
    }
    function tuongHoacMep(x, y) { var c = oTai(san, x, y); return c === null || c === '#' || c === '='; }
    /** Thùng nằm ở góc chết (không phải ô đích), hoặc null. */
    function thungKet() {
      for (var i = 0; i < thungs.length; i++) {
        var t = thungs[i];
        if (dichSet[t.x + ',' + t.y]) continue;
        if (!(tuongHoacMep(t.x - 1, t.y) || tuongHoacMep(t.x + 1, t.y))) continue;
        if (!(tuongHoacMep(t.x, t.y - 1) || tuongHoacMep(t.x, t.y + 1))) continue;
        var c = oTai(san, t.x, t.y);
        if (BANG[c] !== undefined) {                                  // băng chuyền đưa thùng ra khỏi góc thì chưa chết
          var vb = VEC[BANG[c]], cc = oTai(san, t.x + vb[0], t.y + vb[1]);
          if (cc !== null && cc !== '#' && cc !== 'S') continue;
        }
        return t;
      }
      return null;
    }

    san.vat.forEach(themVat); (cfg.vat || []).forEach(themVat);
    san.dich.forEach(themDich); (cfg.dich || []).forEach(themDich);
    function apRoBanDau(rc) {
      if (rc.roBanDau) {                                    // máy ném: rổ có sẵn một vật lúc xuất phát (roBanDau: true | { mau })
        if (!coNem) throw new Error('roBanDau chỉ dùng cho robot có máy ném (hamGoc có aim, throw hay load).');
        var rbd = typeof rc.roBanDau === 'object' ? rc.roBanDau : {};
        vats.push({ id: vats.length + 1, x: bd.x, y: bd.y, trangThai: 'ro', mau: rbd.mau || null, chat: rbd.chat === 'sat' ? 'sat' : 'go' });
        nem.ro = vats.length;
      }
    }
    apRoBanDau(dsRc[0]);
    var vatBanDau = chupVat();

    // ---- súng bóng: nút (N), nút đè giữ (M), cửa (C đóng / c mở; cửa nhịp), băng chuyền tắt khi nút đổi (xem phần SÚNG BÓNG)
    var nuts = san.nut.map(function (n) { return { x: n.x, y: n.y, bat: false, cua: [], bang: [] }; });
    var nutDes = (san.nutDe || []).map(function (m) { return { x: m.x, y: m.y, bat: false, cua: [] }; });
    var cuas = san.cua.map(function (d) { return { x: d.x, y: d.y, mo: d.mo, mo0: d.mo, nhip: null, doi: false, nutDe: [] }; });
    var cuaTai = {}, nutTai = {}, nutDeTai = {}, bangTat = {}, bangO = [];
    nuts.forEach(function (n) { nutTai[n.x + ',' + n.y] = n; });
    nutDes.forEach(function (m) { nutDeTai[m.x + ',' + m.y] = m; });
    cuas.forEach(function (d) { cuaTai[d.x + ',' + d.y] = d; });
    for (var by0 = 0; by0 < san.cao; by0++) for (var bx0 = 0; bx0 < san.rong; bx0++) if (BANG[san.o[by0][bx0]] !== undefined) bangO.push({ x: bx0, y: by0 });
    function cuaNhipMo(nh, t) { return ((t + nh.pha) % (nh.mo + nh.dong)) < nh.mo; }
    function laSoNguyen(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }
    (cfg.cuaNhip || []).forEach(function (cn) {
      var d = cuaTai[cn.x + ',' + cn.y];
      if (!d) throw new Error('Cửa nhịp ở (' + cn.x + ', ' + cn.y + ') nhưng ô đó không phải cửa (C hay c).');
      var ph = cn.pha === undefined ? 0 : cn.pha;
      if (!laSoNguyen(cn.mo) || cn.mo < 1 || !laSoNguyen(cn.dong) || cn.dong < 1 || !laSoNguyen(ph) || ph < 0) throw new Error('Cửa nhịp (' + cn.x + ', ' + cn.y + '): mo, dong phải là số nguyên từ 1, pha là số nguyên từ 0.');
      d.nhip = { mo: cn.mo, dong: cn.dong, pha: ph };
      d.mo = cuaNhipMo(d.nhip, 0);
    });
    if (cfg.noi) {
      cfg.noi.forEach(function (g) {
        var n = g.nut ? nutTai[g.nut.x + ',' + g.nut.y] : null;
        var m = g.nut ? nutDeTai[g.nut.x + ',' + g.nut.y] : null;
        if (!n && !m) throw new Error('Nhóm nối: ô nút (' + (g.nut ? g.nut.x + ', ' + g.nut.y : '?') + ') không phải nút N.');
        (g.cua || []).forEach(function (c) {
          var d = cuaTai[c.x + ',' + c.y];
          if (!d) throw new Error('Nhóm nối: ô (' + c.x + ', ' + c.y + ') không phải cửa.');
          if (d.nhip) throw new Error('Nhóm nối: cửa nhịp (' + c.x + ', ' + c.y + ') không điều khiển bằng nút.');
          if (n && n.cua.indexOf(d) < 0) n.cua.push(d);
          if (m) {
            if (m.cua.indexOf(d) < 0) m.cua.push(d);
            if (d.nutDe.indexOf(m) < 0) d.nutDe.push(m);
          }
        });
        (g.bang || []).forEach(function (b) {
          if (!n) throw new Error('Nhóm nối: nút đè M không điều khiển băng chuyền.');
          if (!bangO.some(function (q) { return q.x === b.x && q.y === b.y; })) throw new Error('Nhóm nối: ô (' + b.x + ', ' + b.y + ') không phải băng chuyền.');
          if (n.bang.indexOf(b.x + ',' + b.y) < 0) n.bang.push(b.x + ',' + b.y);
        });
      });
    } else {
      nuts.forEach(function (n) {
        n.cua = cuas.filter(function (d) { return !d.nhip; });
        n.bang = bangO.map(function (q) { return q.x + ',' + q.y; });
      });
      nutDes.forEach(function (m) {
        m.cua = cuas.filter(function (d) { return !d.nhip; });
        m.cua.forEach(function (d) { if (d.nutDe.indexOf(m) < 0) d.nutDe.push(m); });
      });
    }
    if (cfg.nutBat !== undefined && cfg.nutBat !== null) {                    // NÚT BẬT SẴN (xem SÚNG BÓNG): nút N đang bật (nóng) từ đầu màn; không được nối cửa / băng chuyền
      if (!Array.isArray(cfg.nutBat)) throw new Error('nutBat phải là mảng ô [{ x, y }] (nút bắn N đang bật lúc đầu màn).');
      cfg.nutBat.forEach(function (o) {
        var k = o ? o.x + ',' + o.y : '?', n = nutTai[k];
        if (!n) throw new Error('Nút bật sẵn: ô (' + (o ? o.x + ', ' + o.y : '?') + ') không phải nút bắn N' + (nutDeTai[k] ? ' (nút đè M không bật sẵn được)' : '') + '.');
        if (n.cua.length || n.bang.length) throw new Error('Nút bật sẵn (' + n.x + ', ' + n.y + ') đang điều khiển ' + (n.cua.length ? n.cua.length + ' cửa' : '') + (n.cua.length && n.bang.length ? ' và ' : '') + (n.bang.length ? n.bang.length + ' ô băng chuyền' : '') +
          ': nút bật sẵn không được nối gì. Khai noi cho các nút khác (nút không có trong noi thì không điều khiển gì), hay ghi nút này với cua: [] và bang: [].');
        n.bat = true;
      });
    }
    // ---- ĐỆM TỪ (mùa 3, bản thử; cfg.demTu = [{ x, y, cuc: 'N' | 'S' }], màn nhiều sân: mảng song song với san như noi / nutBat). Ô đệm ghi '.' trên sân, là KHỐI
    //      (lyDoChan trả 'dem-tu'). Sau hành động của robot trong nhịp (cùng chỗ băng chuyền), đệm trong TẦM (cùng hàng / cột, cách <= TAM_DEM ô, ô giữa không có khối chặn)
    //      dời robot 1 ô: robot KHÔNG bật nam châm hay bật KHÁC cực đệm → HÚT về phía đệm (dừng ở ô sát đệm); bật CÙNG cực → ĐẨY ra xa.
    //      MIỄN (user 29/10 "cho tôi nhảy và bay không bị hút, chiều không cao hơn"): robot ĐANG TRÊN KHÔNG thì đệm không với tới:
    //        - DRONE: mọi lúc (bay), kể cả đứng lơ lửng wait(); drone bay qua ô đệm được (lyDoChan không coi đệm là khối với drone).
    //        - NHỆN trong NHỊP NHẢY: nhịp thứ hai của bước có chân vừa duỗi từ lúc đang co, tức nhịp ghi 'nhay' (bật qua một ô, kể cả bay qua hố rồi đáp) hay
    //          'nhay-hut' (bật lên rồi rơi lại ô cũ): nhịp đó đệm KHÔNG hút / đẩy. Nhịp chuẩn bị (nhịp thứ nhất, chân bật duỗi, nhện còn ở ô cũ) và mọi nhịp đi bộ
    //          thường thì nhện bị đệm như xe (nhện không nam châm bị hút như sắt; nhện có nam châm bụng bật thì theo cực như xe).
    //      Mọi thân dưới đất khác (hai bánh, xích, omni) luôn bị.
    //      Hai đệm cùng tác động: đệm gần hơn thắng; bằng khoảng thì chỉ dời khi mọi đệm đó cùng đẩy về một phía, ngược nhau thì đứng im ('dem-can'). Ô tới là hố thì rơi (phaE).
    //      Bị chặn (tường, cửa đóng, thùng, vật, rào, bậc thang, đồng đội…) thì đứng im ('dem-chan', thông tin). Thùng / vật nằm đất không bị đệm tác động ở bản thử.
    var demTus = [];
    san.demTu = {};
    if (cfg.demTu !== undefined && cfg.demTu !== null) {
      if (!Array.isArray(cfg.demTu)) throw new Error('demTu phải là mảng ô [{ x, y, cuc }] (cuc là "N" hay "S").');
      cfg.demTu.forEach(function (o) {
        if (!o || typeof o.x !== 'number' || typeof o.y !== 'number' || (o.cuc !== 'N' && o.cuc !== 'S')) throw new Error('Đệm từ: mỗi ô phải có x, y và cuc là "N" hay "S".');
        var k = o.x + ',' + o.y, c = oTai(san, o.x, o.y);
        if (c !== '.') throw new Error('Đệm từ: ô (' + o.x + ', ' + o.y + ') phải là sàn trống "." trên sân (đang là ' + (c === null ? 'ngoài sân' : '"' + c + '"') + ').');
        if (san.demTu[k]) throw new Error('Đệm từ: ô (' + o.x + ', ' + o.y + ') khai hai lần.');
        if (vatNamTai(o.x, o.y) || thungTai(o.x, o.y)) throw new Error('Đệm từ: ô (' + o.x + ', ' + o.y + ') đang có vật / thùng.');
        var d = { x: o.x, y: o.y, cuc: o.cuc };
        san.demTu[k] = d; demTus.push(d);
      });
      dsRc.forEach(function (rc) { if (rc.batDau && san.demTu[rc.batDau.x + ',' + rc.batDau.y]) throw new Error('Robot xuất phát trên ô đệm từ (' + rc.batDau.x + ', ' + rc.batDau.y + ').'); });
    }
    if (cuaTai[bd.x + ',' + bd.y] && !cuaTai[bd.x + ',' + bd.y].mo) throw new Error('Robot xuất phát trong ô cửa đang đóng.');
    function cuaDong(x, y) { var d = cuaTai[x + ',' + y]; return !!d && !d.mo; }
    function chupCua() { return cuas.map(function (d) { return { x: d.x, y: d.y, mo: d.mo }; }); }
    function chupDiQua() { return diQua.map(function (q) { return { x: q.x, y: q.y, da: q.da }; }); }
    /** Bóng mờ: robot đang ở đúng tư thế đích, đã qua mọi ô diQua, vật (nếu khai) nằm đúng các ô đó (không thừa không thiếu). */
    function bongMoDat() {
      if (!bongMo || rb.x !== bongMo.x || rb.y !== bongMo.y) return false;
      if (bongMo.huong !== null && rb.huong !== bongMo.huong) return false;
      if (!diQua.every(function (q) { return q.da; })) return false;
      if (bongMo.thung) {                                                  // thùng mờ: thùng thật nằm đúng các ô đó, không thừa không thiếu
        if (thungs.length !== bongMo.thung.length) return false;
        if (!bongMo.thung.every(function (q) { return !!thungTai(q.x, q.y); })) return false;
      }
      if (bongMo.xoay && tay.xoay !== bongMo.xoay) return false;           // tay xoay: lúc xong khớp phải ở đúng nấc của xe mờ
      if (bongMo.chan && chan !== bongMo.chan) return false;               // nhện: lúc xong chân phải ở đúng tư thế (co / duỗi) của bóng mờ
      if (bongMo.cam) {                                                    // xe mờ đang cầm vật: lúc xong tay phải đang giữ một vật (đúng màu nếu khai)
        var dcId = tay.cam !== null ? tay.cam : nc.cam;                    // đang cầm bằng tay kẹp hay đang dính bằng nam châm
        if (dcId === null) return false;
        if (bongMo.camMau && vatTheoId(dcId).mau !== bongMo.camMau) return false;
      }
      if (bongMo.vat.length || bongMo.cam) {                               // vật mờ: mọi vật còn lại nằm đất đúng ô (và đúng màu nếu khai), không thừa không thiếu, không vỡ
        var dat = vats.filter(function (v) { return v.trangThai === 'dat'; });
        if (dat.length + (bongMo.cam ? 1 : 0) !== vats.length || dat.length !== bongMo.vat.length) return false;
        if (!bongMo.vat.every(function (q) { return dat.some(function (v) { return v.x === q.x && v.y === q.y && (!q.mau || v.mau === q.mau); }); })) return false;
      }
      return true;
    }
    function chupNut() { return nuts.map(function (n) { return { x: n.x, y: n.y, bat: n.bat }; }); }
    function chupNutDe() { return nutDes.map(function (m) { return { x: m.x, y: m.y, bat: m.bat }; }); }
    function chupBangTat() { return bangO.filter(function (q) { return bangTat[q.x + ',' + q.y]; }).map(function (q) { return { x: q.x, y: q.y }; }); }
    var cuaBanDau = chupCua(), nutBanDau = chupNut(), nutDeBanDau = chupNutDe();

    function vatNamTai(x, y) {
      for (var i = 0; i < vats.length; i++) if (vats[i].trangThai === 'dat' && vats[i].x === x && vats[i].y === y) return vats[i];
      return null;
    }
    function vatTheoId(id) { return vats[id - 1]; }

    // ---- NHIỀU ROBOT: đồng đội là vật cản. xeKhac = [{ rb, drone }] của các đồng đội (vị trí sống), oDinhToi = ô họ ĐỊNH tới trong nhịp này,
    // oTranhKep = ô mà hai robot cùng kẹp trong nhịp này. Một robot: cả ba rỗng, không đổi gì. Drone và xe dưới đất không chặn nhau (khác độ cao).
    var xeKhac = [], oDinhToi = [], oTranhKep = {};
    /** Đồng đội CÙNG TẦNG (drone với drone, xe với xe) đang đứng ở ô (x, y). */
    function dongDoiTai(x, y) {
      for (var i = 0; i < xeKhac.length; i++) if (xeKhac[i].rb.x === x && xeKhac[i].rb.y === y && xeKhac[i].drone === laDrone) return true;
      return false;
    }
    /** Robot đang xét KHÔNG được đi vào ô (x, y): đồng đội cùng tầng đang đứng đó hay định tới đó trong nhịp này. */
    function dongDoiChanDi(x, y) {
      if (dongDoiTai(x, y)) return true;
      for (var i = 0; i < oDinhToi.length; i++) if (oDinhToi[i].x === x && oDinhToi[i].y === y && oDinhToi[i].drone === laDrone) return true;
      return false;
    }
    /** Một xe dưới đất của đồng đội đang đứng ở ô (x, y): chặn vật, thùng, bóng. */
    function xeDatTai(x, y) {
      for (var i = 0; i < xeKhac.length; i++) if (xeKhac[i].rb.x === x && xeKhac[i].rb.y === y && !xeKhac[i].drone) return true;
      return false;
    }
    /** Đồng đội bất kỳ (kể cả drone) ở ô (x, y): cửa không đóng xuống. */
    function dongDoiBatKy(x, y) {
      for (var i = 0; i < xeKhac.length; i++) if (xeKhac[i].rb.x === x && xeKhac[i].rb.y === y) return true;
      return false;
    }

    /** Ô ngay trước mũi xe theo hướng mặt (nhện: hướng cố định lúc xuất phát). */
    function oTruoc() { var v = VEC[rb.huong]; return { x: rb.x + v[0], y: rb.y + v[1] }; }

    /** Ô mà tay chỉ vào: ô trước mặt xe, hay (tay xoay) ô bên trái / bên phải xe theo nấc khớp (xem phần TAY XOAY). Gắp / thả làm ở ô này. */
    function oTay() {
      if (!coXoay || tay.xoay === 'truoc') return oTruoc();
      var v = VEC[(rb.huong + (tay.xoay === 'trai' ? 3 : 1)) % 4];
      return { x: rb.x + v[0], y: rb.y + v[1] };
    }
    function ghiHuongTay(e) { if (coXoay) e.huongTay = tay.xoay; return e; }          // tay xoay: sự kiện kẹp / thả ghi cả nấc khớp (cho lời chẩn đoán và hoạt cảnh)

    /** (b) kẹp / thả Ở Ô MÀ TAY CHỈ (trước mặt; tay xoay: theo nấc khớp), ở tư thế hiện tại. Trả về true nếu có vật vỡ. */
    function kepHoacTha(kieu, sk, lenhTay) {
      var o = oTay(), v;
      var lk = lenhTay ? { ten: lenhTay.ten, dongPy: lenhTay.dongPy } : null;          // lệnh tay gây ra (cho chẩn đoán trỏ đúng dòng)
      if (kieu === 'kep') {
        if (tay.cam !== null) return false;                     // đang cầm: không đổi gì
        if (oTranhKep[o.x + ',' + o.y]) {                       // nhiều robot: hai robot cùng kẹp một ô trong một nhịp thì không ai kẹp được
          tay.kep = true;
          var kt = ghiHuongTay({ ma: 'kep-hut', nhip: nhip, o: o, lyDo: 'tranh-vat', lenh: lk });
          sk.push(kt); suKienChan.push(kt);
          return false;
        }
        if (thungTai(o.x, o.y)) {                               // thùng nặng: tay kẹp không nhấc nổi
          tay.kep = true;
          var kn = ghiHuongTay({ ma: 'kep-hut', nhip: nhip, o: o, lyDo: 'qua-nang', lenh: lk });
          sk.push(kn); suKienChan.push(kn);
          return false;
        }
        v = vatNamTai(o.x, o.y);
        tay.kep = true;
        if (v && tay.tuThe === 'duoi') {
          v.trangThai = 'cam'; v.x = rb.x; v.y = rb.y; tay.cam = v.id;
          sk.push(ghiHuongTay({ ma: 'nhat-vat', id: v.id, o: o }));
        } else if (v || tay.tuThe === 'duoi') {
          var kh = ghiHuongTay({ ma: 'kep-hut', nhip: nhip, o: o, lyDo: v ? 'tay-nang' : 'khong-co-vat', lenh: lk });
          sk.push(kh); suKienChan.push(kh);
        }
        return false;
      }
      // thả
      if (tay.cam === null) { tay.kep = false; return false; }
      v = vatTheoId(tay.cam);
      if (tay.tuThe === 'tren') {                               // thả từ trên cao: vật rơi xuống ô tay chỉ và vỡ
        var ov = oTai(san, o.x, o.y) === null ? { x: rb.x, y: rb.y } : o;
        v.trangThai = 'vo'; v.x = ov.x; v.y = ov.y; tay.cam = null; tay.kep = false;
        var e = ghiHuongTay({ ma: 'vat-vo', nhip: nhip, id: v.id, o: ov, lenh: lk });
        sk.push(e); suKienChan.push(e);
        return true;
      }
      var ly = oThaChan(o.x, o.y);
      if (ly) {                                                 // ô tay chỉ không phải sàn trống: vật vẫn ở tay, kẹp vẫn đóng
        var e2 = ghiHuongTay({ ma: 'tha-bi-chan', nhip: nhip, id: v.id, o: o, vat: ly, kieu: 'kep', lenh: lk });
        sk.push(e2); suKienChan.push(e2);
        return false;
      }
      v.trangThai = 'dat'; v.x = o.x; v.y = o.y; tay.cam = null; tay.kep = false;
      sk.push(ghiHuongTay({ ma: 'dat-vat', id: v.id, o: o }));
      if (dichSet[o.x + ',' + o.y] && !hopMauDich(v, o.x, o.y)) {                  // thả xuống ô đích khác màu: vật vẫn nằm đó nhưng chưa tính
        var esm = { ma: 'dat-sai-mau', nhip: nhip, id: v.id, o: o, mauVat: v.mau || 'none', mauDich: dichMau[o.x + ',' + o.y] };
        sk.push(esm); suKienChan.push(esm);
      }
      return false;
    }
    function vatTheoXe() {
      if (tay.cam !== null) { var v = vatTheoId(tay.cam); v.x = rb.x; v.y = rb.y; }
      if (nc.cam !== null) { var vn = vatTheoId(nc.cam); vn.x = rb.x; vn.y = rb.y; }       // vật dính nam châm đi theo xe
      if (nem.ro !== null) { var vr = vatTheoId(nem.ro); vr.x = rb.x; vr.y = rb.y; }       // vật trong rổ máy ném đi theo xe
    }
    function duaVatXong() {
      var can = vatCan === null ? vats : vats.filter(function (v) { return vatCan === 'sat' ? v.chat === 'sat' : vatCan === 'nam-cham' ? v.chat === 'nam-cham' : v.chat !== 'go'; });       // vatCan: 'sat' chỉ vật sắt · 'nam-cham' chỉ vật nam châm · 'tu' sắt + nam châm (vật gỗ không cần về đích)
      if (!can.length) return false;
      return can.every(function (v) { return v.trangThai === 'dat' && dichSet[v.x + ',' + v.y] && hopMauDich(v, v.x, v.y); });
    }

    /** NAM CHÂM. Ô (x, y) có nhận thêm một vật thả xuống không: null nếu được, hay lý do. */
    function oThaChan(x, y) {
      var c = oTai(san, x, y);
      if (c === null) return 'ngoai-san';
      if (c === '#' || c === 'N') return 'tuong';
      if (c === '=') return 'rao';
      if (c === 'S') return 'bac-thang';
      if (c === 'n') return 'gam-thap';
      if (c === 'u') return 'ho';
      if (san.demTu && san.demTu[x + ',' + y]) return 'dem-tu';           // ô đệm từ là khối
      if (thungTai(x, y)) return 'thung-nang';
      if (vatNamTai(x, y)) return 'vat';
      if (xeDatTai(x, y)) return 'dong-doi';
      return null;
    }
    /** Ô (x, y) có cho một vật nam châm TRƯỢT vào được không: null nếu được, hay lý do (như oThaChan, thêm cửa đang đóng). */
    function oTruotChan(x, y) { return oThaChan(x, y) || (cuaDong(x, y) ? 'cua' : null); }
    /** Nhìn theo hướng mặt ô 1, 2 rồi 3: vật đầu tiên gặp (tường, mép sân, thùng nặng chắn). Trả { vat, khoang, o } (vat null nếu không có gì).
     *  Sắt chỉ hút tới TAM_HUT (2) ô, vật nam châm tác dụng tới TAM_CUC (3) ô: bên gọi tự xét theo `khoang`. */
    function nhinTruoc() {
      var v = VEC[rb.huong];
      for (var d = 1; d <= TAM_CUC; d++) {
        var x = rb.x + v[0] * d, y = rb.y + v[1] * d, c = oTai(san, x, y);
        if (c === null || c === '#' || thungTai(x, y) || xeDatTai(x, y)) return { vat: null, khoang: 0, o: null };
        var vt = vatNamTai(x, y);
        if (vt) return { vat: vt, khoang: d, o: { x: x, y: y } };
      }
      return { vat: null, khoang: 0, o: null };
    }

    /** Xích: bỏ phần quay dở (nhịp này không cùng tổ hợp), ghi sự kiện. */
    function xichThoi(sk) {
      if (!quayDo) return;
      var e = { ma: 'xich-quay-do', nhip: nhip, nhipNua: quayDo.nhip, huong: quayDo.huong, lenh: quayDo.lenh };
      sk.push(e); suKienChan.push(e);
      quayDo = null;
    }

    /** Xích: một nhịp với tổ hợp bánh (t, p). thuDi: hàm đi 1 ô của nhịp. */
    function xichBanh(t, p, lenhBanh, sk, thuDi) {
      var khoa = t + ',' + p, q = XICH_QUAY[khoa];
      if (q === undefined) {                                                // tiến, lùi hoặc đứng yên: không quay
        xichThoi(sk);
        if (t === 1 && p === 1) thuDi(rb.huong, 1, 'tien');
        else if (t === -1 && p === -1) thuDi(rb.huong, -1, 'lui');
        else sk.push({ ma: 'dung-yen' });
        return;
      }
      if (quayDo && quayDo.khoa === khoa) {                                 // nhịp thứ hai cùng tổ hợp: quay đủ 90°
        rb.huong = (rb.huong + (q > 0 ? 1 : 3)) % 4; quayDo = null;
        sk.push({ ma: q > 0 ? 'quay-phai' : 'quay-trai' });
        return;
      }
      xichThoi(sk);                                                         // tổ hợp khác: quay dở cũ mất, bắt đầu quay dở mới
      quayDo = { khoa: khoa, huong: q, nhip: nhip, lenh: lenhBanh || null };
      sk.push({ ma: 'quay-nua', huong: q });
    }

    /** Một nhịp trôi qua. hanhDong: {kieu:'banh', trai, phai, tay:{tuThe,kep}} | {kieu:'nhen', huong|null, buoc:1|2, tay, lenhDi}.
     *  Trả về true nếu phải dừng (thắng, vật vỡ hoặc hết nhịp). */
    function motNhip(hanhDong) {
      if (laDoi) { hangNhip.push(hanhDong); return false; }           // nhiều robot: nhịp chờ bộ xếp lịch (chayDoi) chạy chung với đồng đội
      if (nhip >= nhipToiDa) {
        loi = { loai: 'qua-nhieu-nhip', dong: 0, thongDiep: 'Quá ' + nhipToiDa + ' nhịp.' };
        return true;
      }
      nhip++;
      var n = taoNhip(hanhDong);
      n.a(); n.b(); n.c(); n.d();
      return n.e();
    }
    /**
     * MỘT NHỊP chia năm pha (nhiều robot: pha a, c, e chạy cho TỪNG robot, pha b, d chạy MỘT lần cho sân; một robot gọi đủ năm pha liền nhau nên y như cũ):
     *   a: hành động của robot, băng chuyền đẩy xe, vật đang cầm theo xe · b: băng đẩy thùng nặng · c: nam châm hút · d: cửa đổi ·
     *   e: pin / bay qua, ô đi qua, đích, rơi hố, ghi vết. Trả { a, b, c, d, e } (e trả về true nếu phải dừng). nhip đã được tăng trước khi gọi.
     */
    function taoNhip(hanhDong) {
      var sk = docCho; docCho = []; docLienTiep = 0;          // các lần đọc cảm biến từ nhịp trước tới giờ gắn vào nhịp này
      var banhGhi = { trai: 0, phai: 0 };
      var truotGhi = 0;
      // lệnh đi / bánh gây ra chuyện của nhịp này (cho chẩn đoán trỏ đúng dòng): lệnh trượt, lệnh bánh đầu tiên, hay lệnh go_* của nhện
      var lenhNhip = (hanhDong.kieu === 'banh' ? (hanhDong.truot ? { ten: hanhDong.truot.ten, dongPy: hanhDong.truot.dongPy } : hanhDong.lenhBanh) : hanhDong.lenhDi) || (hanhDong.hoi ? { ten: hanhDong.hoi.ten, dongPy: hanhDong.hoi.dongPy } : null) || null;
      var coVo = false;
      var dauDauNhip = false;                                                  // drone nâng cấp: đang đậu ở đầu nhịp (nhịp đậu trọn không tốn pin)

      /** Drone nâng cấp: land() hạ xuống ô đang ở nếu ô đó đáp được. */
      function apDap() {
        var o = { x: rb.x, y: rb.y };
        if (dau) { sk.push({ ma: 'da-dau', nhip: nhip, o: o, lenh: lenhNhip }); return; }
        var c = oTai(san, rb.x, rb.y), ly = null;
        if (c === '=') ly = 'rao';
        else if (c === 'u') ly = 'ho';
        else if (c === 'S') ly = 'bac-thang';
        else if (c !== null && BANG[c] !== undefined) ly = 'bang';
        else if (thungTai(rb.x, rb.y)) ly = 'thung-nang';
        else if (vatNamTai(rb.x, rb.y)) ly = 'vat';
        if (ly) { var eb = { ma: 'dap-bi-chan', nhip: nhip, o: o, vat: ly, lenh: lenhNhip }; sk.push(eb); suKienChan.push(eb); return; }
        dau = true;
        sk.push({ ma: 'dap', o: o, sac: !!sacSet[rb.x + ',' + rb.y] });
      }

      function thuDi(huongDi, soBuoc, ma) {
        var v = VEC[huongDi], nx = rb.x + v[0] * soBuoc, ny = rb.y + v[1] * soBuoc;
        var ly = lyDoChan(san, loai, nx, ny);
        if (!ly && cuaDong(nx, ny)) ly = 'cua';                           // cửa đang đóng chặn như tường
        if (!ly && dongDoiChanDi(nx, ny)) ly = 'dong-doi';                 // nhiều robot: đồng đội đứng đó hay định tới đó
        if (!ly && loai === 'nhen' && chan !== 'co' && oTai(san, nx, ny) === 'n') ly = 'gam-thap';       // gầm thấp: nhện phải đang co chân mới chui vào được
        var tn = (ly || laDrone) ? null : thungTai(nx, ny);               // drone bay qua thùng nặng
        if (tn) {                                                         // ô có thùng nặng: xe húc bằng bánh = đâm như tường (chỉ cú giật của súng hơi mới dời được thùng)
          var et = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: { x: rb.x, y: rb.y }, vat: 'thung-nang', kieu: ma, lenh: lenhNhip };
          if (xichDay && loai === 'xich' && ma === 'tien' && soBuoc === 1) {           // XÍCH ĐẨY THÙNG (mùa 2, cfg.xichDay): xích tiến thì thùng dời 1 ô theo hướng tiến nếu ô sau trống
            var sx = nx + v[0], sy = ny + v[1], lyS = oThungChan(sx, sy);
            if (!lyS) {
              tn.x = sx; tn.y = sy; tn.dem = 0;
              sk.push({ ma: 'thung-di', id: tn.id, tu: { x: nx, y: ny }, den: { x: sx, y: sy }, nguon: 'xich', soO: 1 });
              rb.x = nx; rb.y = ny; sk.push({ ma: ma, den: { x: nx, y: ny }, dayThung: tn.id });
              return;
            }
            et.xichDay = true; et.chan = lyS; et.sau = { x: sx, y: sy };                 // ô sau thùng bị chặn: xích đứng yên như đâm tường (cham.js nói rõ vì sao)
          }
          sk.push(et); suKienChan.push(et);
          return;
        }
        var vn = (ly || ncBung()) ? null : vatNamTai(nx, ny);             // drone bay qua vật nằm đất; nhện nam châm bụng đứng trùm lên vật (mùa 3)
        if (vn) {                                                         // vật nằm đất chiếm ô: vướng vật
          var ev0 = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: { x: rb.x, y: rb.y }, vat: 'vat', idVat: vn.id, kieu: ma, lenh: lenhNhip };
          sk.push(ev0); suKienChan.push(ev0);
          return;
        }
        if (ly) {
          var e = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: { x: rb.x, y: rb.y }, vat: ly, kieu: ma, lenh: lenhNhip };
          sk.push(e); suKienChan.push(e);
        } else {
          rb.x = nx; rb.y = ny; sk.push({ ma: ma, den: { x: nx, y: ny } });
        }
      }

      /** NHỆN: lệnh chân đang chờ (crouch / stand) làm việc ở nhịp này (nhịp đầu của bước go_* hay nhịp wait()). Trả về true nếu vừa DUỖI chân từ lúc đang CO (cú nhảy của bước này). */
      function apChan(l) {
        if (!l) return false;
        var muon = (l.ten === 'crouch') !== dao.chan ? 'co' : 'dung';                 // daoChieu 'chan': crouch() làm chân duỗi, stand() làm chân co
        var lg = { ten: l.ten, dongPy: l.dongPy };
        if (muon === chan) return false;                                               // đã ở tư thế đó rồi: không đổi gì
        if (muon === 'dung' && oTai(san, rb.x, rb.y) === 'n') {                       // đang đứng trong ô gầm: đầu đụng trần, chân vẫn co
          var ed = { ma: 'dau-dung-tran', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: lg };
          sk.push(ed); suKienChan.push(ed);
          return false;
        }
        var cu = chan; chan = muon;
        sk.push({ ma: 'doi-chan', nhip: nhip, tu: cu, den: muon, lenh: lg });
        return cu === 'co' && muon === 'dung';
      }

      /** NHỆN BẬT QUA MỘT Ô (nhịp thứ hai của bước sau khi chân vừa duỗi từ lúc đang co): sang ô cách 2 ô theo hướng bước, bay qua ô giữa. Ô giữa chắn (tường, nút, cửa đóng, gầm, thùng nặng, mép sân)
       *  hay ô đáp không đứng được (như vậy, thêm hàng rào, vật nằm đất): nhện rơi lại đúng ô cũ ('nhay-hut'). Ô đáp là hố thì cuối nhịp nhện rơi. */
      function thuNhay(huongDi, lenhDi) {
        var v = VEC[huongDi], mx = rb.x + v[0], my = rb.y + v[1], dx = rb.x + 2 * v[0], dy = rb.y + 2 * v[1];
        var lyG = lyDoChan(san, loai, mx, my);
        if (lyG === 'rao') lyG = null;                                                 // bay qua hàng rào thấp được
        if (!lyG && cuaDong(mx, my)) lyG = 'cua';
        if (!lyG && oTai(san, mx, my) === 'n') lyG = 'gam-thap';
        if (!lyG && thungTai(mx, my)) lyG = 'thung-nang';
        if (!lyG && dongDoiTai(mx, my)) lyG = 'dong-doi';
        var lyD = lyDoChan(san, loai, dx, dy);
        if (!lyD && cuaDong(dx, dy)) lyD = 'cua';
        if (!lyD && oTai(san, dx, dy) === 'n') lyD = 'gam-thap';
        if (!lyD && thungTai(dx, dy)) lyD = 'thung-nang';
        if (!lyD && !ncBung() && vatNamTai(dx, dy)) lyD = 'vat';                        // nhện nam châm bụng đáp lên ô có vật được (mùa 3)
        if (!lyD && dongDoiChanDi(dx, dy)) lyD = 'dong-doi';
        var ly = lyG || lyD;
        if (ly) {
          var eh = { ma: 'nhay-hut', nhip: nhip, tu: { x: rb.x, y: rb.y }, qua: { x: mx, y: my }, den: { x: dx, y: dy }, vat: ly, giua: !!lyG, lenh: lenhDi || lenhNhip };
          sk.push(eh); suKienChan.push(eh);
          return;
        }
        var tu = { x: rb.x, y: rb.y };
        rb.x = dx; rb.y = dy;
        sk.push({ ma: 'nhay', tu: tu, qua: { x: mx, y: my }, den: { x: dx, y: dy } });
      }

      /** Băng chuyền đẩy thùng nặng: nằm trên băng đủ 2 nhịp liên tiếp thì bị đẩy 1 ô theo mũi tên nếu ô kế trống. */
      function bangThung() {
        var dung = [];
        thungs.forEach(function (t) {
          var c = oTai(san, t.x, t.y);
          if (c !== null && BANG[c] !== undefined && !bangTat[t.x + ',' + t.y]) { t.dem++; if (t.dem >= 2) dung.push(t); } else t.dem = 0;
        });
        var doi = true;
        while (doi && dung.length) {                                          // thùng đứng sau thùng khác: thùng phía trước đi trước
          doi = false;
          dung = dung.filter(function (t) {
            var vb = VEC[BANG[oTai(san, t.x, t.y)]], nx = t.x + vb[0], ny = t.y + vb[1];
            if (oThungChan(nx, ny)) return true;
            sk.push({ ma: 'thung-di', id: t.id, tu: { x: t.x, y: t.y }, den: { x: nx, y: ny }, nguon: 'bang' });
            t.x = nx; t.y = ny; t.dem = 0; doi = true;
            return false;
          });
        }
        dung.forEach(function (t) {
          var vb = VEC[BANG[oTai(san, t.x, t.y)]];
          sk.push({ ma: 'thung-bang-chan', id: t.id, o: { x: t.x, y: t.y }, den: { x: t.x + vb[0], y: t.y + vb[1] } });
          t.dem = 0;
        });
      }

      /** (a2) tay xoay: xoay khớp MỘT nấc, sau khi tay NÂNG (nếu nhịp có arm_up) và trước khi tay HẠ (nếu nhịp có arm_down). Tay đang hạ sát đất (từ nhịp trước, nhịp này không nâng)
       *  thì khớp kẹt ('tay-xoay-ket', lỗi, lệnh bị bỏ); khớp đã ở nấc cuối phía đó thì không xoay thêm được ('xoay-het-nac', thông tin). */
      function xoayTay(huong, lenhX) {
        var lg = lenhX ? { ten: lenhX.ten, dongPy: lenhX.dongPy } : null;
        if (tay.tuThe === 'duoi') {
          var ek = { ma: 'tay-xoay-ket', nhip: nhip, huong: huong, nac: tay.xoay, lenh: lg };
          sk.push(ek); suKienChan.push(ek);
          return;
        }
        var i = XOAY_NAC.indexOf(tay.xoay) + (huong === 'phai' ? 1 : -1);
        if (i < 0 || i >= XOAY_NAC.length) {
          var eh = { ma: 'xoay-het-nac', nhip: nhip, huong: huong, nac: tay.xoay, lenh: lg };
          sk.push(eh); suKienChan.push(eh);
          return;
        }
        sk.push({ ma: 'xoay-tay', tu: tay.xoay, den: XOAY_NAC[i] });
        tay.xoay = XOAY_NAC[i];
      }
      function apTay() {
        if (!coTay) return;
        var lt = hanhDong.tay || {};
        if (lt.tuThe === 'tren') tay.tuThe = 'tren';                        // (a1) tay NÂNG (nâng rồi mới xoay được)
        if (lt.xoay) xoayTay(lt.xoay, lt.lenhXoay);                         // (a2) tay xoay: khớp xoay một nấc
        if (lt.tuThe === 'duoi') tay.tuThe = 'duoi';                        // (a3) tay HẠ (xoay xong mới hạ)
        if (lt.kep) coVo = kepHoacTha(lt.kep, sk, lt.lenhKep);                          // (b) kẹp / thả ở tư thế mới
      }

      /** (a) nam châm: magnet_n / magnet_s đặt cực; magnet_off ngắt và thả vật dính xuống ô sát mũi xe (bị chặn thì vẫn dính, vẫn bật). */
      function apNamCham() {
        var l = hanhDong.nc;
        if (!coNamCham || !l) return;
        if (l.cuc) {                                                        // magnet_n() / magnet_s(): đặt cực (đã tính daoChieu 'cuc'); vật đang dính xử lý ở (d)
          if (nc.cam !== null && vatTheoId(nc.cam).chat === 'sat' && nc.cuc !== null && nc.cuc !== l.cuc) {        // đổi cực khi đang dính sắt: sắt vẫn dính
            var esd = { ma: 'sat-khong-day', nhip: nhip, id: nc.cam, cuc: l.cuc, lenh: l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null };
            sk.push(esd); suKienChan.push(esd);
          }
          nc.cuc = l.cuc; nc.bat = true; nc.lenhCuc = l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null;
          return;
        }
        if (nc.cam === null) { nc.cuc = null; nc.bat = false; nc.lenhCuc = null; return; }
        var v = VEC[rb.huong], fx = ncBung() ? rb.x : rb.x + v[0], fy = ncBung() ? rb.y : rb.y + v[1], ly = oThaChan(fx, fy), vt = vatTheoId(nc.cam);     // drone / nhện: nam châm treo DƯỚI bụng, thả xuống ô dưới nó
        if (ly) {
          var eb = { ma: 'tha-bi-chan', nhip: nhip, id: vt.id, o: { x: fx, y: fy }, vat: ly, lenh: l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null };
          sk.push(eb); suKienChan.push(eb);
          return;
        }
        vt.trangThai = 'dat'; vt.x = fx; vt.y = fy; nc.cam = null; nc.cuc = null; nc.bat = false; nc.lenhCuc = null;
        sk.push({ ma: 'tha-vat', id: vt.id, den: { x: fx, y: fy } });
        if (dichSet[fx + ',' + fy] && !hopMauDich(vt, fx, fy)) {
          var esm = { ma: 'dat-sai-mau', nhip: nhip, id: vt.id, o: { x: fx, y: fy }, mauVat: vt.mau || 'none', mauDich: dichMau[fx + ',' + fy], chat: vt.chat, cuc: vt.cuc };
          sk.push(esm); suKienChan.push(esm);
        }
      }

      /** MÁY NÉM: load() nạp vật nằm ở ô trước mặt vào rổ; throw() ném vật trong rổ bay thẳng theo hướng mặt đúng `tam` ô, rơi xuống ô đó. */
      function apNem(l) {
        var lenhGhi = l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null;
        if (l.ten === 'load') {
          if (nem.ro !== null) {
            var er = { ma: 'ro-day', nhip: nhip, id: nem.ro, o: { x: rb.x, y: rb.y }, lenh: lenhGhi };
            sk.push(er); suKienChan.push(er);
            return;
          }
          var ot = oTruoc(), vn = vatNamTai(ot.x, ot.y);
          if (!vn) {
            var eh = { ma: 'nap-hut', nhip: nhip, o: ot, lenh: lenhGhi };
            sk.push(eh); suKienChan.push(eh);
            return;
          }
          vn.trangThai = 'ro'; vn.x = rb.x; vn.y = rb.y; nem.ro = vn.id;
          sk.push({ ma: 'nap-vat', id: vn.id, o: ot });
          return;
        }
        // throw
        if (nem.ro === null) {
          var ek = { ma: 'nem-hut', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: lenhGhi };
          sk.push(ek); suKienChan.push(ek);
          return;
        }
        var v = VEC[rb.huong], vt = vatTheoId(nem.ro), dx = rb.x + v[0] * l.tam, dy = rb.y + v[1] * l.tam, c = oTai(san, dx, dy), ly = null;
        if (c === null) ly = 'ngoai-san';
        else if (c === '#') ly = 'tuong';
        else if (c === '=') ly = 'rao';
        else if (c === 'S') ly = 'bac-thang';
        else if (thungTai(dx, dy)) ly = 'thung-nang';
        else if (vatNamTai(dx, dy)) ly = 'vat';
        else if (xeDatTai(dx, dy)) ly = 'dong-doi';
        nem.ro = null;
        sk.push({ ma: 'nem-vat', id: vt.id, tu: { x: rb.x, y: rb.y }, den: { x: dx, y: dy }, tam: l.tam });
        if (ly) {                                                   // ô rơi không nhận được vật: vật vỡ tại đó
          vt.trangThai = 'vo'; vt.x = dx; vt.y = dy;
          var ev = { ma: 'nem-vo', nhip: nhip, id: vt.id, o: { x: dx, y: dy }, lyDo: ly, tam: l.tam, lenh: lenhGhi };
          sk.push(ev); suKienChan.push(ev);
          coVo = true;
          return;
        }
        vt.trangThai = 'dat'; vt.x = dx; vt.y = dy;
        sk.push({ ma: 'nem-roi', id: vt.id, o: { x: dx, y: dy } });
        if (dichSet[dx + ',' + dy] && !hopMauDich(vt, dx, dy)) {
          var esm = { ma: 'dat-sai-mau', nhip: nhip, id: vt.id, o: { x: dx, y: dy }, mauVat: vt.mau || 'none', mauDich: dichMau[dx + ',' + dy] };
          sk.push(esm); suKienChan.push(esm);
        }
      }

      /** MÁY SƠN: tô ô (x, y) màu mau (kieu 'cham' | 'ha' | 'net'). Ô ngoài hình mờ (mục tiêu to-hinh) → 'to-thua'; trong hình mà sai màu → 'to-sai-mau' (thông tin, tô lại được). */
      function toO(x, y, mau, kieu, lenhGhi) {
        var k = x + ',' + y, cu = daSon[k] || null;
        if (cu === mau) return;
        daSon[k] = mau;
        sk.push({ ma: 'to-o', o: { x: x, y: y }, mau: mau, tu: cu, kieu: kieu });
        if (!hinh) return;
        var can = hinh[y][x];
        if (!can) {
          if (!toThua) { toThua = true; var et = { ma: 'to-thua', nhip: nhip, o: { x: x, y: y }, mau: mau, kieu: kieu, lenh: lenhGhi }; sk.push(et); suKienChan.push(et); }
        } else if (can !== mau) {
          var es = { ma: 'to-sai-mau', nhip: nhip, o: { x: x, y: y }, mau: mau, can: can, lenh: lenhGhi };
          sk.push(es); suKienChan.push(es);
        }
      }
      /** MÁY SƠN (a): lệnh đầu sơn của nhịp, làm TRƯỚC khi bánh chạy. */
      function apSon(l) {
        if (!l) return;
        var lg = { ten: l.ten, dongPy: l.dongPy };
        if (l.ten === 'pen_up') { if (son.ha) { son.ha = false; sk.push({ ma: 'nhac-but', o: { x: rb.x, y: rb.y } }); } return; }
        if (l.ten === 'pen_down' && !son.ha) { son.ha = true; sk.push({ ma: 'ha-but', o: { x: rb.x, y: rb.y } }); }
        toO(rb.x, rb.y, l.mau, l.ten === 'dot' ? 'cham' : 'ha', lg);
      }

      /** SÚNG HƠI (a): bắn một quả bóng thẳng theo hướng `hb` (spray: hướng mặt; spray_back: ngược mặt, bay từ ô sát đuôi), bay ô tới ô trong cùng nhịp, dừng ở vật cản đầu tiên; trúng nút N thì nút đổi
       *  (băng đổi ngay, cửa đổi cuối nhịp). Trả về false nếu hết đạn (không bắn, không giật), không thì { trung, o, cuoi, soO } (thông tin 'ban-hut' / 'ban-bi-chan' do thongTinBan ghi SAU cú giật). */
      function banBong(l, hb) {
        var lenhGhi = l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null;
        if (dan !== null) {
          if (dan <= 0) {
            var eh = { ma: 'het-dan', nhip: nhip, lenh: lenhGhi };
            sk.push(eh); suKienChan.push(eh);
            return false;
          }
          dan--;
        }
        var v = VEC[hb], x = rb.x, y = rb.y, d = 0, cuoi = { x: rb.x, y: rb.y }, trung = null, oVC = null;
        var nhanh = l.luc === 'low', hetTam = false;                             // bắn nhanh: bóng bay tối đa TAM_BAN_NHANH ô rồi rơi
        for (;;) {
          x += v[0]; y += v[1]; d++;
          if (nhanh && d > TAM_BAN_NHANH) { hetTam = true; break; }
          var c = oTai(san, x, y);
          if (c === null) break;                                                // ra khỏi sân
          var ly = null;
          if (c === '#') ly = 'tuong';
          else if (c === 'N') ly = 'nut';
          else if (c === 'S') ly = 'bac-thang';
          else if (cuaDong(x, y)) ly = 'cua';
          else if (thungTai(x, y)) ly = 'thung';
          else if (vatNamTai(x, y)) ly = 'vat';
          else if (xeDatTai(x, y)) ly = 'dong-doi';
          if (ly) { trung = ly; oVC = { x: x, y: y }; break; }
          cuoi = { x: x, y: y };
        }
        sk.push({ ma: 'ban', nhip: nhip, tu: { x: rb.x, y: rb.y }, huong: hb, sau: !!l.sau, den: oVC || cuoi, cuoi: cuoi, o: oVC, trung: trung, soO: d - 1, luc: l.luc || 'high', hetTam: hetTam });
        var kqBan = { trung: trung, o: oVC, cuoi: cuoi, soO: d - 1, hetTam: hetTam };
        if (trung !== 'nut') return kqBan;
        var n = nutTai[oVC.x + ',' + oVC.y];
        n.bat = !n.bat;
        sk.push({ ma: 'nut-doi', nhip: nhip, o: { x: n.x, y: n.y }, bat: n.bat });
        suKienChan.push({ ma: 'nut-doi', nhip: nhip, o: { x: n.x, y: n.y }, bat: n.bat, lenh: lenhGhi });
        n.bang.forEach(function (k) {
          bangTat[k] = !bangTat[k];
          var kp = k.split(',');
          sk.push({ ma: 'bang-doi', nhip: nhip, o: { x: +kp[0], y: +kp[1] }, bat: !bangTat[k] });
        });
        n.cua.forEach(function (dc) { dc.doi = !dc.doi; });                     // cửa đổi ở CUỐI nhịp
        return kqBan;
      }

      /** Thông tin về quả bóng KHÔNG tới nút: bay ra khỏi sân ('ban-hut'), bắn nhanh rơi vì hết tầm ('ban-ngan'), hay (sân có nút) bị vật cản chặn ('ban-bi-chan'). Chỉ ghi khi cú giật
       *  của phát bắn đó chẳng dời được gì (xe và thùng đứng yên): phát bắn mà xe / thùng đi được một đoạn là phát bắn có ích, bóng đập vào tường là chuyện thường. */
      function thongTinBan(kb, l, hb, giatCoDoi) {
        if (kb.trung === 'nut' || giatCoDoi) return;
        var lenhGhi = l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null;
        if (kb.hetTam) {
          var en = { ma: 'ban-ngan', nhip: nhip, tu: { x: rb.x, y: rb.y }, huong: hb, sau: !!l.sau, cuoi: kb.cuoi, lenh: lenhGhi };
          sk.push(en); suKienChan.push(en);
        } else if (kb.trung === null) {
          var ek = { ma: 'ban-hut', nhip: nhip, tu: { x: rb.x, y: rb.y }, huong: hb, sau: !!l.sau, cuoi: kb.cuoi, soO: kb.soO, lenh: lenhGhi };
          sk.push(ek); suKienChan.push(ek);
        } else if (nuts.length) {                                              // sân có nút mà bóng bị chặn ở thứ khác
          var eb = { ma: 'ban-bi-chan', nhip: nhip, o: kb.o, vat: kb.trung, sau: !!l.sau, lenh: lenhGhi };
          sk.push(eb); suKienChan.push(eb);
        }
      }

      /** SÚNG HƠI (b): GIẬT. Bóng bay theo hướng `hb` thì xe giật ngược lại 1 ô. Ô giật vào bị chặn (tường, mép sân, cửa đóng, nút, hàng rào, bậc thang, vật nằm đất) thì xe đứng yên;
       *  có THÙNG NẶNG thì thùng nhích ĐÚNG 1 Ô theo hướng giật và xe cũng dời 1 ô vào ô thùng vừa rời (như xích đẩy thùng); ô sau thùng bị chặn thì cả hai đứng yên.
       *  Trả về true nếu xe (và thùng) dời được. */
      function giatXe(hb, lenhGhi) {
        var hg = (hb + 2) % 4, v = VEC[hg], tu = { x: rb.x, y: rb.y }, nx = rb.x + v[0], ny = rb.y + v[1];
        var ly = lyDoChan(san, loai, nx, ny);
        if (!ly && cuaDong(nx, ny)) ly = 'cua';
        if (!ly && dongDoiChanDi(nx, ny)) ly = 'dong-doi';
        var tn = ly ? null : thungTai(nx, ny);
        if (tn) {                                                              // thùng nặng ngay sau xe: nhận lực, nhích 1 ô; xe theo vào ô thùng vừa rời
          var sx = nx + v[0], sy = ny + v[1], lyS = oThungChan(sx, sy);
          if (lyS) {
            var ec = { ma: 'thung-chan', nhip: nhip, id: tn.id, o: { x: nx, y: ny }, den: { x: sx, y: sy }, vat: lyS, kieu: 'giat', lenh: lenhGhi };
            sk.push(ec); suKienChan.push(ec);
            sk.push({ ma: 'giat', nhip: nhip, tu: tu, den: tu, huong: hg, di: false, vat: 'thung-nang', thung: tn.id });
            return false;
          }
          tn.x = sx; tn.y = sy; tn.dem = 0;
          sk.push({ ma: 'thung-di', id: tn.id, tu: { x: nx, y: ny }, den: { x: sx, y: sy }, nguon: 'giat', soO: 1 });
          rb.x = nx; rb.y = ny;
          sk.push({ ma: 'giat', nhip: nhip, tu: tu, den: { x: nx, y: ny }, huong: hg, di: true, vat: null, thung: tn.id });
          return true;
        }
        if (!ly) {
          var vn = vatNamTai(nx, ny);
          if (vn) ly = 'vat';
        }
        if (ly) {                                                              // bị chặn: xe đứng yên (rung tại chỗ)
          sk.push({ ma: 'giat', nhip: nhip, tu: tu, den: tu, huong: hg, di: false, vat: ly, thung: null });
          var eg = { ma: 'giat-chan', nhip: nhip, tu: tu, den: { x: nx, y: ny }, vat: ly, huong: hg, lenh: lenhGhi };
          sk.push(eg); suKienChan.push(eg);
          return false;
        }
        rb.x = nx; rb.y = ny;
        sk.push({ ma: 'giat', nhip: nhip, tu: tu, den: { x: nx, y: ny }, huong: hg, di: true, vat: null, thung: null });
        return true;
      }

      /** Cuối nhịp: cửa đổi theo nút (đã bị bắn trong nhịp), nút đè giữ (M trên sàn) hay theo chu kỳ (cửa nhịp). Cửa không đóng xuống ô đang có xe / vật / thùng: giữ mở ('cua-ket'). */
      function capNhatCua() {
        nutDes.forEach(function (m) {
          var de = (!laDrone && rb.x === m.x && rb.y === m.y) || xeDatTai(m.x, m.y) || !!vatNamTai(m.x, m.y) || !!thungTai(m.x, m.y);
          if (de !== m.bat) {
            m.bat = de;
            sk.push({ ma: 'nut-de', nhip: nhip, o: { x: m.x, y: m.y }, bat: de });
          }
        });
        cuas.forEach(function (dc) {
          var muon = dc.mo, nguon = null;
          if (dc.nhip) { muon = cuaNhipMo(dc.nhip, nhip); nguon = 'nhip'; }
          else if (dc.nutDe.length) {
            if (dc.doi) { dc.mo0 = !dc.mo0; dc.doi = false; }
            var coDe = dc.nutDe.some(function (m) { return m.bat; });
            muon = coDe ? !dc.mo0 : dc.mo0;
            nguon = 'nut-de';
          }
          else if (dc.doi) { muon = !dc.mo; nguon = 'nut'; }
          dc.doi = false;
          if (muon === dc.mo) return;
          if (!muon && ((rb.x === dc.x && rb.y === dc.y) || dongDoiBatKy(dc.x, dc.y) || vatNamTai(dc.x, dc.y) || thungTai(dc.x, dc.y))) {
            var ek = { ma: 'cua-ket', nhip: nhip, o: { x: dc.x, y: dc.y }, nguon: nguon, voi: (rb.x === dc.x && rb.y === dc.y) || dongDoiBatKy(dc.x, dc.y) ? 'xe' : 'vat', lenh: lenhNhip };
            sk.push(ek); suKienChan.push(ek);
            return;
          }
          dc.mo = muon;
          sk.push({ ma: 'cua-doi', nhip: nhip, o: { x: dc.x, y: dc.y }, mo: muon, nguon: nguon });
        });
      }

      /** Vật nam châm `vt` bị ĐẨY ra xa xe theo hướng mặt (cùng cực với tay): trượt tối đa TAM_DAY ô, dừng ngay trước vật cản đầu tiên.
       *  tuMui = true: vật đang DÍNH ở mũi xe bị bắn ra: nó rơi xuống ô sát mũi rồi trượt từ đó (ô sát mũi bị chặn thì bắn không ra, vẫn dính). */
      function dayVat(vt, tuMui) {
        var v = VEC[rb.huong], cx, cy, k = 0, lyDo = null;
        if (tuMui) { cx = rb.x + v[0]; cy = rb.y + v[1]; lyDo = oTruotChan(cx, cy); }
        else { cx = vt.x; cy = vt.y; }
        if (tuMui && lyDo) {                                                // ô sát mũi bị chặn: vật vẫn dính
          var ebd = { ma: 'day-bi-chan', nhip: nhip, id: vt.id, cuc: vt.cuc, o: { x: cx, y: cy }, lyDo: lyDo, tuMui: true, lenh: nc.lenhCuc || lenhNhip };
          sk.push(ebd); suKienChan.push(ebd);
          return;
        }
        var tu = { x: cx, y: cy };
        while (!lyDo && k < TAM_DAY) {
          var nx = cx + v[0], ny = cy + v[1], ly = oTruotChan(nx, ny);
          if (ly) lyDo = ly; else { cx = nx; cy = ny; k++; }
        }
        if (!tuMui && k === 0) {                                            // sát vật cản: không nhúc nhích được
          var ebc = { ma: 'day-bi-chan', nhip: nhip, id: vt.id, cuc: vt.cuc, o: tu, lyDo: lyDo, tuMui: false, lenh: nc.lenhCuc || lenhNhip };
          sk.push(ebc); suKienChan.push(ebc);
          return;
        }
        if (tuMui) nc.cam = null;
        vt.trangThai = 'dat'; vt.x = cx; vt.y = cy;
        var evd = { ma: 'day-vat', nhip: nhip, id: vt.id, cuc: vt.cuc, tu: tu, den: { x: cx, y: cy }, soO: k, chan: lyDo, tuMui: !!tuMui, lenh: nc.lenhCuc };
        sk.push(evd); suKienChan.push(evd);                                 // cũng là mốc chẩn đoán (thông tin, chỉ nói khi chưa thắng): cham.js 'day-vat'
        if (dichSet[cx + ',' + cy] && !hopMauDich(vt, cx, cy)) {
          var esm = { ma: 'dat-sai-mau', nhip: nhip, id: vt.id, o: { x: cx, y: cy }, mauVat: vt.mau || 'none', mauDich: dichMau[cx + ',' + cy], chat: vt.chat, cuc: vt.cuc };
          sk.push(esm); suKienChan.push(esm);
        }
      }

      /** NAM CHÂM TREO DƯỚI BỤNG (hút / thả ở ô ngay dưới robot): drone, và nhện gắn nam châm (mùa 3, xem phần NAM CHÂM "NAM CHÂM BỤNG NHỆN"). */
      function ncBung() { return laDrone || (loai === 'nhen' && coNamCham); }
      /** Vật `vt` bị HÚT về ô sát mũi xe rồi dính (hut-vat, dinh-vat). tu = ô vật đang nằm, soO = số ô nó bay. */
      function hutVe(vt, tu, soO) {
        var v = VEC[rb.huong], mx = ncBung() ? rb.x : rb.x + v[0], my = ncBung() ? rb.y : rb.y + v[1];
        var e = { ma: 'hut-vat', id: vt.id, tu: { x: tu.x, y: tu.y }, den: { x: mx, y: my }, soO: soO };
        if (vt.chat === 'nam-cham') { e.chat = 'nam-cham'; e.cuc = vt.cuc; }
        sk.push(e);
        vt.trangThai = 'cam'; vt.x = rb.x; vt.y = rb.y; nc.cam = vt.id;
        sk.push({ ma: 'dinh-vat', id: vt.id });
      }

      /** (d) hút / đẩy, ở cuối nhịp: nam châm có cực → vật đầu tiên trong tầm (sắt 2 ô, vật nam châm 3 ô): sắt → hút (cực nào cũng hút); vật nam châm khác cực → hút, cùng cực → đẩy;
       *  gỗ → không gì. Đang dính vật nam châm mà tay đổi sang cùng cực → bắn vật ra. */
      function hutVat() {
        if (!coNamCham || nc.cuc === null) return;
        if (ncBung()) {                                                       // nam châm treo (drone, nhện bụng): chỉ tác dụng vật nằm ở ô NGAY DƯỚI robot
          if (nc.cam !== null) return;
          var vd = vatNamTai(rb.x, rb.y);
          if (!vd) return;
          if (vd.chat === 'sat' || (vd.chat === 'nam-cham' && vd.cuc !== nc.cuc)) hutVe(vd, { x: rb.x, y: rb.y }, 0);
          else if (vd.chat === 'nam-cham') {                                  // cùng cực: drone không có hướng mặt để đẩy ra, vật nằm yên
            var ecc = { ma: 'cung-cuc', nhip: nhip, id: vd.id, o: { x: rb.x, y: rb.y }, cuc: vd.cuc };
            sk.push(ecc); suKienChan.push(ecc);
          } else {
            var egd = { ma: 'hut-go', nhip: nhip, id: vd.id, o: { x: rb.x, y: rb.y }, khoang: 0 };
            sk.push(egd); suKienChan.push(egd);
          }
          return;
        }
        if (nc.cam !== null) {                                                // đang dính: vật nam châm cùng cực với tay thì bị bắn ra; sắt vẫn dính
          var vdn = vatTheoId(nc.cam);
          if (vdn.chat === 'nam-cham' && vdn.cuc === nc.cuc) dayVat(vdn, true);
          return;
        }
        var nt = nhinTruoc();
        if (!nt.vat) return;
        var vt = nt.vat;
        if (vt.chat === 'nam-cham') {
          if (vt.cuc === nc.cuc) dayVat(vt, false);                           // cùng cực: đẩy ra xa
          else hutVe(vt, nt.o, nt.khoang - 1);                                // khác cực: hút
        } else if (vt.chat === 'sat') {
          if (nt.khoang <= TAM_HUT) hutVe(vt, nt.o, nt.khoang - 1);           // sắt: cực nào cũng hút, trong 2 ô
          else {                                                              // sắt cách 3 ô: ngoài tầm
            var eng = { ma: 'ngoai-tam', nhip: nhip, id: vt.id, o: nt.o, khoang: nt.khoang };
            sk.push(eng); suKienChan.push(eng);
          }
        } else {
          var eg = { ma: 'hut-go', nhip: nhip, id: vt.id, o: nt.o, khoang: nt.khoang };
          sk.push(eg); suKienChan.push(eg);
        }
      }

      /** ĐỆM TỪ (xem phần ĐỆM TỪ ở đầu chay()): ô (x, y) giữa robot và đệm có chắn từ trường không (tường, nút, cửa đóng, thùng, vật nằm đất, robot khác, đệm khác).
       *  Rào thấp, bậc thang, gầm, hố, băng chuyền KHÔNG chắn (nhưng robot bị kéo vào đó vẫn bị chặn theo luật đi thường). */
      function khoiChanTu(x, y) {
        var c = oTai(san, x, y);
        return c === null || c === '#' || c === 'N' || !!san.demTu[x + ',' + y] || cuaDong(x, y) || !!thungTai(x, y) || !!vatNamTai(x, y) || dongDoiTai(x, y);
      }
      /** ĐỆM TỪ: sau hành động của nhịp (sau băng chuyền). Mỗi đệm cùng hàng / cột trong TAM_DEM ô, không bị chắn, cho một "lực": hút (không bật nam châm hay khác cực) hay đẩy (cùng cực).
       *  Đệm gần nhất thắng; bằng khoảng mà ngược chiều thì đứng im ('dem-can'). Hút khi đã sát đệm: không dời. Dời 1 ô: 'dem-hut' / 'dem-day' { nhip, tu, den, dem }; ô tới bị chặn: 'dem-chan'. */
      function demTuKeo() {
        if (!demTus.length || laDrone) return;
        if (sk.some(function (e) { return e.ma === 'nhay' || e.ma === 'nhay-hut'; })) return;       // nhện đang trên không (nhịp nhảy): đệm không với tới (user 29/10)
        var ung = [];
        demTus.forEach(function (d) {
          var dx = d.x - rb.x, dy = d.y - rb.y;
          if (dx !== 0 && dy !== 0) return;
          var kc = Math.abs(dx) + Math.abs(dy);
          if (kc === 0 || kc > TAM_DEM) return;
          var ux = dx > 0 ? 1 : dx < 0 ? -1 : 0, uy = dy > 0 ? 1 : dy < 0 ? -1 : 0;        // hướng từ robot về đệm
          for (var i = 1; i < kc; i++) if (khoiChanTu(rb.x + ux * i, rb.y + uy * i)) return;
          var cungCuc = coNamCham && nc.cuc === d.cuc;
          var kieu = cungCuc ? 'day' : 'hut';
          var vx = cungCuc ? -ux : ux, vy = cungCuc ? -uy : uy;
          if (kieu === 'hut' && kc === 1) { vx = 0; vy = 0; }                               // đã sát đệm: hút giữ tại chỗ
          ung.push({ dem: d, kc: kc, kieu: kieu, vx: vx, vy: vy });
        });
        if (!ung.length) return;
        var min = Math.min.apply(null, ung.map(function (u) { return u.kc; }));
        var gan = ung.filter(function (u) { return u.kc === min; }), u0 = gan[0];
        var o = { x: rb.x, y: rb.y };
        if (gan.some(function (u) { return u.vx !== u0.vx || u.vy !== u0.vy; })) {
          var ecn = { ma: 'dem-can', nhip: nhip, o: o, dem: gan.map(function (u) { return u.dem; }) };
          sk.push(ecn); suKienChan.push(ecn);
          return;
        }
        if (u0.vx === 0 && u0.vy === 0) { sk.push({ ma: 'dem-giu', nhip: nhip, o: o, dem: u0.dem }); return; }
        var nx = rb.x + u0.vx, ny = rb.y + u0.vy;
        var lyB = lyDoChan(san, loai, nx, ny) || (cuaDong(nx, ny) ? 'cua' : null) || (thungTai(nx, ny) ? 'thung-nang' : null) || (vatNamTai(nx, ny) ? 'vat' : null) || (dongDoiChanDi(nx, ny) ? 'dong-doi' : null) || (loai === 'nhen' && chan !== 'co' && oTai(san, nx, ny) === 'n' ? 'gam-thap' : null);
        if (lyB) {
          var ecb = { ma: 'dem-chan', nhip: nhip, o: o, den: { x: nx, y: ny }, dem: u0.dem, kieu: u0.kieu, vat: lyB };
          sk.push(ecb); suKienChan.push(ecb);
          return;
        }
        rb.x = nx; rb.y = ny; demBang = 0;
        var ed = { ma: 'dem-' + u0.kieu, nhip: nhip, tu: o, den: { x: nx, y: ny }, dem: u0.dem, lenh: lenhNhip };
        sk.push(ed); suKienChan.push(ed);
      }

      function phaA() {
        var dauX = rb.x, dauY = rb.y;
        if (hanhDong.kieu === 'banh') {
          var t = hanhDong.trai, p = hanhDong.phai, tr = hanhDong.truot || null;
          if (tr) banhGhi = { trai: 0, phai: 0 };                               // omni trượt: bánh chạy dọc đứng yên, chỉ trượt ngang
          else banhGhi = { trai: t, phai: p };
          apTay();
          apNamCham();
          if (coSon) apSon(hanhDong.son);                                     // (a) đầu sơn: chấm / hạ / nhấc, ở ô đang đứng, TRƯỚC khi bánh chạy
          if (coNem && hanhDong.nem) {                                          // nhịp có load() / throw(): xe đứng yên, lệnh bánh / trượt bị bỏ
            banhGhi = { trai: 0, phai: 0 };
            if (t !== 0 || p !== 0 || tr) {
              var en = { ma: 'nem-dung-yen', nhip: nhip, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : hanhDong.lenhBanh) || null, nem: { ten: hanhDong.nem.ten, dongPy: hanhDong.nem.dongPy } };
              sk.push(en); suKienChan.push(en);
            }
            if (loai === 'xich') xichThoi(sk);
            apNem(hanhDong.nem);
          }
          else if (coHoi && hanhDong.hoi) {                                          // nhịp có spray() / spray_back(): bắn rồi giật; lệnh bánh / trượt cùng nhịp bị bỏ
            banhGhi = { trai: 0, phai: 0 };
            var lh = hanhDong.hoi;
            if (t !== 0 || p !== 0 || tr) {
              var eby = { ma: 'ban-dung-yen', nhip: nhip, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : hanhDong.lenhBanh) || null, ban: { ten: lh.ten, dongPy: lh.dongPy } };
              sk.push(eby); suKienChan.push(eby);
            }
            if (loai === 'xich') xichThoi(sk);
            var hb = lh.sau ? (rb.huong + 2) % 4 : rb.huong;
            var kb = banBong(lh, hb);
            if (kb) {
              var giatCoDoi = false;
              if (lh.luc === 'low') giatCoDoi = false;                                                                 // bắn nhanh: không giật
              else if (beSung && loai === 'xich') sk.push({ ma: 'be-sung', nhip: nhip, huong: (hb + 2) % 4 });          // BỆ SÚNG XÍCH (mùa 2, cfg.beSung): xích bắn tụ không giật, bệ giữ (thông tin cho hoạt cảnh)
              else giatCoDoi = giatXe(hb, lh.dongPy ? { ten: lh.ten, dongPy: lh.dongPy } : null);
              thongTinBan(kb, lh, hb, giatCoDoi);
            }
          }
          else if (coTay && tay.tuThe === 'duoi' && (tr || t !== 0 || p !== 0)) {   // (c) bánh chạy — nhưng tay vướng sàn
            var ev = { ma: 'tay-vuong', nhip: nhip, tu: { x: rb.x, y: rb.y }, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : hanhDong.lenhBanh) || null };
            sk.push(ev); suKienChan.push(ev);
            if (loai === 'xich') xichThoi(sk);                                // bánh không chạy: quay dở (nếu có) mất
          }
          else if (tr) {                                                      // omni: trượt ngang; lệnh bánh cùng nhịp (nếu có) bị bỏ
            if (t !== 0 || p !== 0) {
              var ec = { ma: 'omni-khong-cheo', nhip: nhip, lenh: hanhDong.lenhBanh || null, truot: { ten: tr.ten, dongPy: tr.dongPy } };
              sk.push(ec); suKienChan.push(ec);
            }
            truotGhi = tr.bien;
            thuDi((rb.huong + (tr.bien > 0 ? 1 : 3)) % 4, 1, 'truot');
          }
          else if (loai === 'xich') xichBanh(t, p, hanhDong.lenhBanh, sk, thuDi);
          else if (t === 1 && p === 1) thuDi(rb.huong, 1, 'tien');
          else if (t === -1 && p === -1) thuDi(rb.huong, -1, 'lui');
          else if ((t === 1 && p === -1) || (t === -1 && p === 1)) { rb.huong = (rb.huong + 2) % 4; sk.push({ ma: 'quay-dau' }); }
          else if ((t === 1 && p === 0) || (t === 0 && p === -1)) { rb.huong = (rb.huong + 1) % 4; sk.push({ ma: 'quay-phai' }); }
          else if ((t === 0 && p === 1) || (t === -1 && p === 0)) { rb.huong = (rb.huong + 3) % 4; sk.push({ ma: 'quay-trai' }); }
          else sk.push({ ma: 'dung-yen' });
        } else if (hanhDong.kieu === 'drone') {
          dauDauNhip = dau;
          apNamCham();                                                        // (a) lệnh nam châm (thả trước khi bay)
          if (coSon) apSon(hanhDong.son);                                     // (a) đầu sơn treo dưới bụng: chấm / hạ / nhấc ở ô đang ở, TRƯỚC khi bay
          if (hanhDong.dap === 'land') apDap();                               // nâng cấp đáp đất: land() / take_off() (xem phần DRONE)
          else if (hanhDong.dap === 'take_off') {
            if (dau) { dau = false; sk.push({ ma: 'cat-canh', o: { x: rb.x, y: rb.y } }); }
            else sk.push({ ma: 'dang-bay', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: lenhNhip });
          }
          else if (hanhDong.huong === null || hanhDong.huong === undefined) sk.push({ ma: 'dung-yen' });      // wait(): lơ lửng (hay nghỉ lúc đậu)
          else if (dau) {                                                     // đang đậu: lệnh bay không làm gì, mất nhịp
            var edd = { ma: 'dang-dau', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: lenhNhip };
            sk.push(edd); suKienChan.push(edd);
          }
          else thuDi(hanhDong.huong, 1, 'di');                                // (b) bay 1 ô (tường cao / mép sân / cửa đóng thì đứng yên)
        } else {
          if (hanhDong.huong === null || hanhDong.huong === undefined) { apTay(); apChan(hanhDong.chan); apNamCham(); sk.push({ ma: 'dung-yen' }); }     // nhện: lệnh nam châm bụng (mùa 3) làm ở nhịp wait()
          else if (hanhDong.buoc === 2) {
            var nhayNay = nhayBuoc; nhayBuoc = false;
            if (coTay && tay.tuThe === 'duoi') {                              // tay hạ sát đất: chân vướng, bước bị bỏ
              var evn = { ma: 'tay-vuong', nhip: nhip, tu: { x: rb.x, y: rb.y }, lenh: hanhDong.lenhDi || null };
              sk.push(evn); suKienChan.push(evn);
            } else if (nhayNay) thuNhay(hanhDong.huong, hanhDong.lenhDi);     // chân vừa duỗi từ lúc đang co: bật qua một ô
            else thuDi(hanhDong.huong, 1, 'di');
          } else { apTay(); nhayBuoc = apChan(hanhDong.chan); apNamCham(); sk.push({ ma: 'chuan-bi', nhay: nhayBuoc }); }   // nhịp thứ nhất của lệnh go_*: chưa rời ô (tay, chân và nam châm bụng làm việc ở nhịp này)
        }

        // băng chuyền — sau hành động của nhịp
        var c = oTai(san, rb.x, rb.y);
        if (c !== null && BANG[c] !== undefined && !bangTat[rb.x + ',' + rb.y] && !laDrone) {          // băng tắt (nút đã đổi) thì không đẩy; drone bay trên băng nên băng không đẩy
          demBang++;
          if (demBang >= 2 && loai === 'xich') { sk.push({ ma: 'bang-khong-day' }); demBang = 0; }     // xích bám chắc, băng không đẩy được
          else if (demBang >= (loai === 'omni' ? 1 : 2)) {                    // omni: bánh nhỏ trơn, 1 nhịp trên băng đã bị đẩy
            var hd = BANG[c], vb = VEC[hd], bx = rb.x + vb[0], by = rb.y + vb[1];
            var lyB = lyDoChan(san, loai, bx, by) || (cuaDong(bx, by) ? 'cua' : null) || (thungTai(bx, by) ? 'thung-nang' : null) || (vatNamTai(bx, by) ? 'vat' : null) || (dongDoiChanDi(bx, by) ? 'dong-doi' : null) || (loai === 'nhen' && chan !== 'co' && oTai(san, bx, by) === 'n' ? 'gam-thap' : null);
            if (lyB) sk.push({ ma: 'bang-chan', den: { x: bx, y: by }, vat: lyB });
            else { rb.x = bx; rb.y = by; sk.push({ ma: 'bang-day', den: { x: bx, y: by } }); }
            demBang = 0;
          }
        } else demBang = 0;

        demTuKeo();                                                            // ĐỆM TỪ — ngay sau băng chuyền: đệm trong tầm kéo / đẩy robot 1 ô

        // bàn xoay (@ xoay phải 90°, % xoay trái 90°) — xoay khi robot vừa đi vào ô bàn xoay, hoặc đứng chờ (wait) trên bàn xoay
        var cbx = oTai(san, rb.x, rb.y);
        var doiTayBX = !!(hanhDong.tay && (hanhDong.tay.tuThe !== null || hanhDong.tay.kep !== null || hanhDong.tay.xoay !== null));
        var doiKhacBX = !!(hanhDong.nc || hanhDong.nem || hanhDong.hoi || hanhDong.son);
        var vuaVaoBX = (rb.x !== dauX || rb.y !== dauY);
        var choXoayBX = !vuaVaoBX && !doiTayBX && !doiKhacBX && sk.some(function (e) { return e.ma === 'dung-yen'; });
        if (cbx !== null && BAN_XOAY[cbx] !== undefined && laBanh && (vuaVaoBX || choXoayBX)) {
          var chieuBX = BAN_XOAY[cbx], hCuBX = rb.huong;
          if (loai === 'xich') xichThoi(sk);
          rb.huong = (rb.huong + (chieuBX > 0 ? 1 : 3)) % 4;
          sk.push({ ma: 'ban-xoay', huong: chieuBX, tu: hCuBX, den: rb.huong, o: { x: rb.x, y: rb.y } });
        }

        // cổng dịch chuyển đôi (1, 2) — khi robot vừa di chuyển vào ô cổng trong nhịp này thì nhảy sang cổng cặp
        var capCong = (rb.x !== dauX || rb.y !== dauY) && san.congCap ? san.congCap[rb.x + ',' + rb.y] : null;
        if (capCong) {
          var lyC = (!laDrone && thungTai(capCong.x, capCong.y) ? 'thung-nang' : null) ||
                    (!laDrone && vatNamTai(capCong.x, capCong.y) ? 'vat' : null) ||
                    (dongDoiChanDi(capCong.x, capCong.y) ? 'dong-doi' : null);
          if (lyC) {
            var eccg = { ma: 'cong-chan', nhip: nhip, cong: capCong.ma, tu: { x: rb.x, y: rb.y }, den: { x: capCong.x, y: capCong.y }, vat: lyC };
            sk.push(eccg); suKienChan.push(eccg);
          } else {
            var tuC = { x: rb.x, y: rb.y };
            rb.x = capCong.x; rb.y = capCong.y; demBang = 0;
            sk.push({ ma: 'dich-chuyen', cong: capCong.ma, tu: tuC, den: { x: capCong.x, y: capCong.y } });
          }
        }

        vatTheoXe();                                                           // vật đang cầm đi theo xe
        if (coSon && son.ha) toO(rb.x, rb.y, son.mau, 'net', lenhNhip);        // (d) đầu sơn đang hạ: tô ô xe đứng cuối nhịp (nét liền, kể cả ô góc khi quay)
      }
      function phaB() { if (thungs.length) bangThung(); }                    // băng chuyền đẩy thùng nặng
      function phaC() { hutVat(); }                                          // nam châm hút vật sắt trước mặt (cuối nhịp)
      function phaD() { capNhatCua(); }                                      // cửa đổi ở cuối nhịp (theo nút hay theo chu kỳ)
      function phaE() {
        if (laDrone) {
          var tren = [], cb = oTai(san, rb.x, rb.y);                           // drone đang lơ lửng trên thứ gì (cho giao diện vẽ bóng)
          if (cb === '=') tren.push('rao');
          if (cb !== null && BANG[cb] !== undefined) tren.push('bang');
          if (cb === 'S') tren.push('bac-thang');
          if (thungTai(rb.x, rb.y)) tren.push('thung-nang');
          if (vatNamTai(rb.x, rb.y)) tren.push('vat');
          if (tren.length && !dau) sk.push({ ma: 'bay-qua', nhip: nhip, o: { x: rb.x, y: rb.y }, tren: tren });
          if (pin !== null && coSon && sk.some(function (e) { return e.ma === 'to-o'; })) pin = Math.max(0, pin - 1);     // drone gắn máy sơn: nhịp có tô ô tốn thêm 1 pin (trước khi sạc)
          if (pin !== null && coDap) {                                          // drone nâng cấp: nhịp đậu trọn không tốn pin; đậu trên ô sạc thì pin đầy ngay
            if (!(dauDauNhip && dau)) pin = Math.max(0, pin - 1);
            if (dau && sacSet[rb.x + ',' + rb.y] && pin < pinToiDa) { sk.push({ ma: 'sac-pin', nhip: nhip, o: { x: rb.x, y: rb.y }, tu: pin, den: pinToiDa }); pin = pinToiDa; }
          } else if (pin !== null) {                                            // drone gốc: mỗi nhịp bay tốn 1 pin; cuối nhịp ở ô sạc thì pin đầy lại
            pin = Math.max(0, pin - 1);
            if (sacSet[rb.x + ',' + rb.y]) { sk.push({ ma: 'sac-pin', nhip: nhip, o: { x: rb.x, y: rb.y }, tu: pin, den: pinToiDa }); pin = pinToiDa; }       // chỉ là sự kiện của vết (cho hoạt cảnh), không phải chẩn đoán
          }
        }

        if (diQua.length) {                                                    // bóng mờ: cuối nhịp robot đứng ở ô diQua nào thì ô đó "đã đi qua"
          var dq = diQuaTai[rb.x + ',' + rb.y];
          if (dq && !dq.da) { dq.da = true; sk.push({ ma: 'qua-diem', nhip: nhip, o: { x: rb.x, y: rb.y } }); }
        }
        if (laDoi && (mucTieu === 'toi-co' || (doiKhang && !laR1))) {       // nhiều robot: mỗi robot tới một cờ; tới rồi thì dừng chương trình, đứng yên (thắng: chayDoi). Đối kháng giao hàng: cờ F là đích của R2, R1 đi qua F không dừng
          if (!xeToiCo && oTai(san, rb.x, rb.y) === 'F' && (!coRieng || coRieng.some(function (q) { return q.x === rb.x && q.y === rb.y; }))) { xeToiCo = true; sk.push({ ma: 'toi-co' }); }
        }
        if (mucTieu === 'toi-co') {
          if (!laDoi && san.co && rb.x === san.co.x && rb.y === san.co.y) { thang = true; sk.push({ ma: 'toi-co' }); }
        } else if (mucTieu === 'bong-mo') {
          // thắng xét KHI CHƯƠNG TRÌNH CHẠY XONG (xem sau vòng chạy), không thắng giữa đường
        } else if (mucTieu === 'day-thung') {
          if (dayThungXong()) { thang = true; sk.push({ ma: 'xong-day-thung' }); }
          else {
            var tk = thungKet();                                                 // thùng kẹt góc: không thể thắng nữa
            if (tk) {
              dungSom = 'thung-ket';
              var ek = { ma: 'thung-ket', nhip: nhip, id: tk.id, o: { x: tk.x, y: tk.y } };
              sk.push(ek); suKienChan.push(ek);
            }
          }
        } else if (mucTieu === 'to-hinh') {
          if (hinhDat()) { thang = true; sk.push({ ma: 'xong-to-hinh' }); }
          else if (toThua) dungSom = 'to-thua';                                // tô ra ngoài hình: không xóa được, không thể thắng nữa
        } else if (duaVatXong()) { thang = true; sk.push({ ma: 'xong-dua-vat' }); }
        var daThang = thang || (laDoi && xeToiCo);                           // nhiều robot: robot đã tới cờ thì như đã thắng phần của nó
        if (!daThang && coVo && mucTieu === 'dua-vat') dungSom = 'vat-vo';       // vật vỡ: không thể thắng nữa
        if (!daThang && !dungSom && pin !== null && pin <= 0) {                   // hết pin giữa chừng: hạ cánh khẩn, dừng
          dungSom = 'het-pin';
          var ehp = { ma: 'het-pin', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: lenhNhip };
          sk.push(ehp); suKienChan.push(ehp);
        }
        if (!daThang && !dungSom && !laDrone && oTai(san, rb.x, rb.y) === 'u') {   // đứng trên hố (bước vào, bị băng đẩy hay nhảy rơi xuống): RƠI, thua, chương trình dừng
          dungSom = 'roi-ho';
          var erh = { ma: 'roi-ho', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: lenhNhip };
          sk.push(erh); suKienChan.push(erh);
        }
        if (!daThang && !dungSom && damLaThua && sk.some(function (e) { return e.ma === 'dam-tuong'; })) dungSom = 'dam-tuong';   // HD2: đâm là thua, robot đứng lại ở cú đâm
        var r = chup(); r.banh = banhGhi;
        if (loai === 'nhen') r.chan = chan;                                    // nhện: tư thế chân cuối nhịp ('dung' | 'co')
        if (loai === 'xich') r.quayDo = quayDo ? quayDo.huong : 0;
        if (loai === 'omni') r.truot = truotGhi;
        if (laDrone) { r.pin = pin; r.dangMang = nc.cam; if (coDap) r.dau = dau; }
        else if (ncBung()) r.dangMang = nc.cam;                                 // nhện nam châm bụng: vật đang treo dưới bụng
        var mucVet = { loai: 'nhip', nhip: nhip, robot: r, suKien: sk };
        if (coTay) { r.tay = chupTay(); mucVet.vat = chupVat(); }
        if (coNamCham) { r.namCham = chupNamCham(); mucVet.vat = chupVat(); }
        if (coNem) { r.nem = chupNem(); mucVet.vat = chupVat(); }
        if (thungs.length) mucVet.thung = chupThung();
        if (coHoi) r.sung = { dan: dan };
        if (coSon) { r.son = { ha: son.ha, mau: son.mau }; mucVet.daSon = chupSon(); }
        if (diQua.length) mucVet.diQua = chupDiQua();
        if (cuas.length) mucVet.cua = chupCua();
        if (nuts.length) { mucVet.nut = chupNut(); mucVet.bangTat = chupBangTat(); }
        if (nutDes.length) mucVet.nutDe = chupNutDe();
        vet.push(mucVet);
        return thang || !!dungSom;
      }
      return { a: phaA, b: phaB, c: phaC, d: phaD, e: phaE };
    }

    /** Lấy các lệnh tay đang chờ thành {tuThe, kep} cho nhịp này, và xóa chúng khỏi hàng chờ. */
    function rutTay() {
      var tt = tayCho['tu-the'], kk = tayCho['kep'], xx = tayCho['xoay'];
      tayCho = { 'tu-the': null, 'kep': null, 'xoay': null };
      return { tuThe: tt ? ((tt.ten === 'arm_down') !== dao.tay ? 'duoi' : 'tren') : null, kep: kk ? ((kk.ten === 'grab') !== dao.kep ? 'kep' : 'tha') : null,       // daoChieu 'tay' / 'kep': arm_up ↔ arm_down, grab ↔ release đổi chỗ
        xoay: xx ? ((xx.ten === 'arm_right') !== dao.xoay ? 'phai' : 'trai') : null,                                   // daoChieu 'xoay': arm_left ↔ arm_right đổi chỗ
        lenhTuThe: tt ? { ten: tt.ten, dongPy: tt.dongPy } : null, lenhKep: kk ? { ten: kk.ten, dongPy: kk.dongPy } : null, lenhXoay: xx ? { ten: xx.ten, dongPy: xx.dongPy } : null };
    }

    /** Đọc cảm biến khoảng cách: ô ngay trước / bên phải / bên trái xe có đi vào được không. Không tốn nhịp, không đổi sân. */
    function docCamBien(yc) {
      var h = (rb.huong + CAM_BIEN_HAM[yc.ten]) % 4, v = VEC[h], x = rb.x + v[0], y = rb.y + v[1];
      var ly = lyDoChan(san, loai, x, y);
      if (!ly && cuaDong(x, y)) ly = 'cua';
      if (!ly && thungTai(x, y)) ly = 'thung-nang';
      if (!ly && vatNamTai(x, y)) ly = 'vat';
      if (!ly && dongDoiTai(x, y)) ly = 'dong-doi';                   // nhiều robot: đồng đội đứng trước / bên cạnh
      var kq = { ma: 'doc-cam-bien', cam: 'khoang-cach', ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: h, o: { x: x, y: y }, trong: !ly, vat: ly || null, nhip: nhip };
      if (dao.cam) { kq.thuc = kq.trong; kq.trong = !kq.trong; kq.daoNguoc = true; }          // cảm biến lắp ngược (daoChieu 'cam'): `trong` là giá trị TRẢ VỀ cho chương trình (ngược); `thuc` là ô thật sự trống hay không
      return kq;
    }

    /** Đọc cảm biến màu ở bụng: màu SÀN ô ngay dưới xe ("none" nếu sàn không màu). Vật đang mang không tính. Không tốn nhịp, không đổi sân. */
    /** color(huong): lỗi chạy nếu hướng thiếu / lạ / chưa nâng cấp "here", hay robot không có camera bốn hướng mà gọi có đối số. null nếu được. */
    function loiHuongCam(yc) {
      var ts = yc.thamSo || [];
      function l(td) { return { loai: 'runtime-error', ma: 'huong-cam-sai', dong: yc.dong, thongDiep: td }; }
      if (!coCam4) return ts.length ? l('color() của cảm biến này không nhận hướng: gọi color() không có gì trong ngoặc.') : null;
      var bang = laBanh ? CAM4_MUI : CAM4_BAN_DO, ds = Object.keys(bang).concat(cam4TaiCho ? ['here'] : []);
      var goi = ds.map(function (x) { return '"' + x + '"'; }).join(', ');
      if (ts.length !== 1) return l('color() cần đúng 1 hướng để camera nhìn: ' + goi + '.');
      var h = ts[0];
      if (h === 'here' && !cam4TaiCho) return l('Camera chưa nâng cấp nên chưa nhìn được ô dưới chân ("here"). Hướng nhìn được: ' + goi + '.');
      if (typeof h !== 'string' || ds.indexOf(h) < 0) return l('color(' + (typeof h === 'string' ? '"' + h + '"' : String(h)) + '): hướng lạ. Hướng camera nhìn được: ' + goi + '.');
      return null;
    }
    /** Đọc camera bốn hướng color(huong) (đã kiểm hướng): ô kề theo hướng (hay ô đang ở với "here"), cùng luật thấy như camera trước. */
    function docCam4(yc) {
      var h = yc.thamSo[0], o, m = 'none', nguon = 'san', idVat = null, huongDoc = null;
      if (h === 'here') {
        o = { x: rb.x, y: rb.y };
        if (oTai(san, o.x, o.y) === '=' || thungTai(o.x, o.y) || cuaDong(o.x, o.y)) nguon = 'chan';
        else { var vd = laDrone || (loai === 'nhen' && coNamCham) ? vatNamTai(o.x, o.y) : null; if (vd) { m = vd.mau || 'none'; nguon = 'vat'; idVat = vd.id; } else { var md = mauThay(o.x, o.y); m = md.mau || 'none'; if (md.son) nguon = 'son'; } }
      } else {
        huongDoc = laBanh ? (rb.huong + CAM4_MUI[h]) % 4 : CAM4_BAN_DO[h];
        var v = VEC[huongDoc];
        o = { x: rb.x + v[0], y: rb.y + v[1] };
        var c = oTai(san, o.x, o.y);
        if (c === null || c === '#' || c === '=' || c === 'N' || cuaDong(o.x, o.y) || thungTai(o.x, o.y) || xeDatTai(o.x, o.y)) nguon = 'chan';
        else {
          var vt = vatNamTai(o.x, o.y);
          if (vt) { m = vt.mau || 'none'; nguon = 'vat'; idVat = vt.id; } else { var mo = mauThay(o.x, o.y); m = mo.mau || 'none'; if (mo.son) nguon = 'son'; }
        }
      }
      return { ma: 'doc-cam-bien', cam: MA_CAM_4, ham: yc.ten, huong: h, huongDoc: h === 'here' ? null : huongDoc, tu: { x: rb.x, y: rb.y }, o: o, mau: m, nguon: nguon, idVat: idVat, nhip: nhip };
    }
    function docMau(yc) {
      if (coCam4) return docCam4(yc);
      if (camNhin) return docCamera(yc);
      var mt = mauThay(rb.x, rb.y);
      return { ma: 'doc-cam-bien', cam: 'mau', ham: yc.ten, tu: { x: rb.x, y: rb.y }, o: { x: rb.x, y: rb.y }, mau: mt.mau || 'none', nguon: mt.son ? 'son' : 'san', idVat: null, nhip: nhip };
    }

    /** Đọc camera: màu thứ ở Ô TRƯỚC MẶT: vật nằm đất → màu vật; không có vật → màu sàn; tường / rào / thùng / nút / cửa đóng / ngoài sân → "none". Không tốn nhịp. */
    function docCamera(yc) {
      var o = oTruoc(), m = 'none', nguon = 'san', idVat = null;
      var c = oTai(san, o.x, o.y);
      if (c === null || c === '#' || c === '=' || c === 'N' || cuaDong(o.x, o.y) || thungTai(o.x, o.y) || xeDatTai(o.x, o.y)) nguon = 'chan';
      else {
        var v = vatNamTai(o.x, o.y);
        if (v) { m = v.mau || 'none'; nguon = 'vat'; idVat = v.id; } else { var mo = mauThay(o.x, o.y); m = mo.mau || 'none'; if (mo.son) nguon = 'son'; }
      }
      return { ma: 'doc-cam-bien', cam: 'camera', ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: rb.huong, o: o, mau: m, nguon: nguon, idVat: idVat, nhip: nhip };
    }

    /** Đọc camera nhìn xuống look() của drone: màu thứ nằm ở ô NGAY DƯỚI drone — vật nằm đất → màu vật ("none" nếu vật không màu); không có vật → màu sàn; rào / thùng nặng / cửa đóng → "none"
     *  (nguon 'chan'). Vật đang dính dưới nam châm không tính. Không tốn nhịp, không đổi sân. */
    function docNhin(yc) {
      var m = 'none', nguon = 'san', idVat = null, x = rb.x, y = rb.y;
      if (oTai(san, x, y) === '=' || thungTai(x, y) || cuaDong(x, y)) nguon = 'chan';
      else {
        var v = vatNamTai(x, y);
        if (v) { m = v.mau || 'none'; nguon = 'vat'; idVat = v.id; } else { var mn = mauThay(x, y); m = mn.mau || 'none'; if (mn.son) nguon = 'son'; }
      }
      return { ma: 'doc-cam-bien', cam: MA_CAM_BAY, ham: yc.ten, tu: { x: x, y: y }, o: { x: x, y: y }, mau: m, nguon: nguon, idVat: idVat, nhip: nhip };
    }

    /** Đọc pin battery() của drone: số pin còn lại. Không tốn nhịp, không đổi sân. */
    function docPin(yc) {
      return { ma: 'doc-cam-bien', cam: 'pin', ham: yc.ten, tu: { x: rb.x, y: rb.y }, o: { x: rb.x, y: rb.y }, pin: pin, pinToiDa: pinToiDa, nhip: nhip };
    }

    /** Đọc cảm biến từ: front_metal() True nếu vật đầu tiên trong 3 ô là SẮT cách ≤ 2 ô; front_pole() là cực ("N" / "S") của vật NAM CHÂM đầu tiên trong 3 ô, không thì "none". Không tốn nhịp, không đổi sân. */
    function docTu(yc) {
      var nt = nhinTruoc(), vt = nt.vat, cuc = vt && vt.chat === 'nam-cham' ? vt.cuc : null;
      var trong = yc.ten === 'front_pole' ? cuc !== null : !!(vt && vt.chat === 'sat' && nt.khoang <= TAM_HUT);
      return { ma: 'doc-cam-bien', cam: 'tu', ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: rb.huong, o: nt.o, khoang: nt.khoang,
        chat: vt ? vt.chat : null, cuc: cuc, idVat: vt ? vt.id : null, trong: trong, nhip: nhip };
    }

    /** Đọc cảm biến HỒNG NGOẠI (mùa 2): tia đi thẳng từ mũi xe theo hướng mặt tới VẬT CẢN ĐẦU TIÊN (tường, rào, nút, bậc thang với xe bánh / omni, gầm, cửa đóng, thùng nặng, vật nằm đất,
     *  robot khác dưới đất, mép sân). distance() = số ô TRỐNG đi qua (sát vật cản → 0); warm() = True khi vật cản đó NÓNG: robot khác hay nút bắn đang bật. Không tốn nhịp, không đổi sân. */
    function docHongNgoai(yc) {
      var v = VEC[rb.huong], x = rb.x, y = rb.y, d = 0, ly = null;
      for (;;) {
        x += v[0]; y += v[1];
        ly = lyDoChan(san, loai, x, y);
        if (!ly && cuaDong(x, y)) ly = 'cua';
        if (!ly && thungTai(x, y)) ly = 'thung-nang';
        if (!ly && vatNamTai(x, y)) ly = 'vat';
        if (!ly && xeDatTai(x, y)) ly = 'dong-doi';
        if (ly) break;
        d++;
      }
      var nt = ly === 'nut' ? nutTai[x + ',' + y] : null;
      var nong = ly === 'dong-doi' || !!(nt && nt.bat);
      return { ma: 'doc-cam-bien', cam: MA_CAM_HONG_NGOAI, ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: rb.huong, o: { x: x, y: y }, khoang: d, vat: ly, nong: nong, trong: false, nhip: nhip };
    }

    /** Xử lý một lời gọi hàm gốc nhân nhường ra. Trả về true nếu phải dừng. */
    function xuLy(yc) {
      if (nguonDong && khayThieu[yc.ten]) {                      // lệnh có trong phần cứng nhưng chưa mở trên khay: chương trình chính và hàm của màn không dùng được
        var ngLenh = nguonDong(yc.dong);
        if (ngLenh === 'chinh' || ngLenh === 'hamMan') {
          loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: yc.ten, thongDiep: 'Lệnh ' + yc.ten + '() chưa có trên khay ở màn này.' };
          return true;
        }
      }
      vet.push({ loai: 'lenh', ten: yc.ten, dongPy: yc.dong, nganPy: yc.ngan });
      if (CAM_BIEN_HAM[yc.ten] !== undefined || CAM_MAU_HAM.indexOf(yc.ten) >= 0 || CAM_NHIN_HAM.indexOf(yc.ten) >= 0 || CAM_TU_HAM.indexOf(yc.ten) >= 0 || CAM_PIN_HAM.indexOf(yc.ten) >= 0 || CAM_HONG_NGOAI_HAM.indexOf(yc.ten) >= 0) {     // cảm biến: đọc xong trả về cho chương trình (khoảng cách / từ / nhiệt: True / False; màu: chuỗi; pin / hồng ngoại distance: số), không tốn nhịp
        var laMau = CAM_MAU_HAM.indexOf(yc.ten) >= 0, laPin = CAM_PIN_HAM.indexOf(yc.ten) >= 0, laNhin = CAM_NHIN_HAM.indexOf(yc.ten) >= 0, laHN = CAM_HONG_NGOAI_HAM.indexOf(yc.ten) >= 0;
        if (laMau) { var lh4 = loiHuongCam(yc); if (lh4) { loi = lh4; return true; } }      // camera bốn hướng: color(huong) phải có hướng đúng; cảm biến khác: color() không nhận đối số
        var ed = laNhin ? docNhin(yc) : laMau ? docMau(yc) : laPin ? docPin(yc) : laHN ? docHongNgoai(yc) : CAM_TU_HAM.indexOf(yc.ten) >= 0 ? docTu(yc) : docCamBien(yc);
        vet[vet.length - 1].docCamBien = Object.assign({}, ed);
        soLanDoc++;
        if (docCho.length < DOC_TOI_DA_MOI_NHIP) docCho.push(ed);
        traVe = laMau || laNhin ? ed.mau : laPin ? ed.pin : laHN ? (yc.ten === 'warm' ? ed.nong : ed.khoang) : yc.ten === 'front_pole' ? (ed.cuc || 'none') : ed.trong;
        docLienTiep++;
        if (docLienTiep > DOC_LIEN_TIEP_TOI_DA) {
          loi = { loai: 'infinite-loop', dong: yc.dong, thongDiep: 'Đọc cảm biến ' + DOC_LIEN_TIEP_TOI_DA + ' lần liên tiếp mà robot chưa chạy nhịp nào — có vòng lặp không có đường ra.' };
          return true;
        }
        return false;
      }
      if (yc.ten === 'wait') {
        if (laDrone) {                                           // drone: wait() = một nhịp lơ lửng, cũng tốn pin; lệnh nam châm đang chờ làm ở nhịp này
          var hdw = { kieu: 'drone', huong: null, nc: ncCho, son: sonCho };
          ncCho = null; sonCho = null; lenhTon = [];
          return motNhip(hdw);
        }
        if (laBanh) {
          var lenhBanh = null;                                   // lệnh bánh đầu tiên của nhịp (để chỉ ra khi tay vướng sàn)
          lenhTon.forEach(function (x) { if (!lenhBanh && BANH_LENH[x.ten]) lenhBanh = { ten: x.ten, dongPy: x.dongPy }; });
          var h = { kieu: 'banh', trai: lenh.trai, phai: lenh.phai, lenhBanh: lenhBanh, tay: rutTay(), truot: truotCho, nc: ncCho, nem: nemCho, hoi: hoiCho, son: sonCho };
          lenh.trai = 0; lenh.phai = 0; lenhTon = []; truotCho = null; ncCho = null; nemCho = null; hoiCho = null; sonCho = null;
          return motNhip(h);
        }
        var hw = { kieu: 'nhen', huong: null, tay: rutTay(), chan: chanCho, nc: ncCho };      // nc: nam châm bụng nhện (mùa 3)
        chanCho = null; ncCho = null;
        lenhTon = [];
        return motNhip(hw);
      }
      if (TAY_NHOM[yc.ten]) {                                    // lệnh tay (xe bánh và nhện): chỉ ra lệnh, chờ nhịp
        var nhom = TAY_NHOM[yc.ten];
        if (tayCho[nhom]) {
          suKienChan.push({ ma: 'tay-goi-lai', nhip: nhip + 1, nhom: nhom, ten: yc.ten, dongPy: yc.dong,
            truoc: { ten: tayCho[nhom].ten, dongPy: tayCho[nhom].dongPy } });
          return false;
        }
        tayCho[nhom] = { ten: yc.ten, dongPy: yc.dong };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (OMNI_TRUOT[yc.ten] !== undefined) {                    // omni: slide_left / slide_right chỉ ra lệnh, chờ nhịp
        if (truotCho) {
          suKienChan.push({ ma: 'slide-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: truotCho.ten, dongPy: truotCho.dongPy } });
          return false;
        }
        truotCho = { ten: yc.ten, dongPy: yc.dong, bien: OMNI_TRUOT[yc.ten] };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (TAY_NAM_CHAM.indexOf(yc.ten) >= 0) {                   // nam châm: magnet_n() / magnet_s() / magnet_off() chỉ ra lệnh, chờ nhịp
        if (ncCho) {
          suKienChan.push({ ma: 'magnet-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: ncCho.ten, dongPy: ncCho.dongPy } });
          return false;
        }
        ncCho = { ten: yc.ten, dongPy: yc.dong, cuc: yc.ten === 'magnet_off' ? null : (dao.cuc ? CUC_DOI[CUC_LENH[yc.ten]] : CUC_LENH[yc.ten]) };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (yc.ten === 'aim') {                                    // máy ném: đặt tầm NGAY (không tốn nhịp, không cần wait()); n phải là 1, 2 hoặc 3
        var an = yc.thamSo && yc.thamSo.length === 1 ? yc.thamSo[0] : undefined;
        if (yc.thamSo && yc.thamSo.length !== 1) {
          loi = { loai: 'runtime-error', ma: 'tam-sai', dong: yc.dong, thongDiep: 'aim() cần đúng 1 đối số (số ô ném xa: 1, 2 hoặc 3), đang có ' + yc.thamSo.length + '.', tamDat: null };
          return true;
        }
        if (typeof an !== 'number' || !isFinite(an) || Math.floor(an) !== an || an < 1 || an > TAM_NEM_TOI_DA) {
          loi = { loai: 'runtime-error', ma: 'tam-sai', dong: yc.dong, thongDiep: 'aim(n) chỉ nhận n = 1, 2 hoặc 3 (số ô ném xa), mà em đưa vào ' + (typeof an === 'string' ? '"' + an + '"' : String(an)) + '.', tamDat: an === undefined ? null : an };
          return true;
        }
        nem.tam = an;
        vet[vet.length - 1].aimTam = an;
        return false;
      }
      if (yc.ten === 'load' || yc.ten === 'throw') {             // máy ném: chỉ ra lệnh, chờ nhịp (throw nhớ tầm đang đặt LÚC GỌI)
        if (nemCho) {
          suKienChan.push({ ma: 'nem-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: nemCho.ten, dongPy: nemCho.dongPy } });
          return false;
        }
        nemCho = { ten: yc.ten, dongPy: yc.dong, tam: nem.tam };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (yc.ten === 'ink') {                                    // máy sơn: chọn màu NGAY (không tốn nhịp, không cần wait()); chỉ "red", "green", "blue", "yellow"
        var mk = yc.thamSo && yc.thamSo.length === 1 ? yc.thamSo[0] : undefined;
        if (!yc.thamSo || yc.thamSo.length !== 1 || MAU_TEN.indexOf(mk) < 0) {
          var moTa = !yc.thamSo || yc.thamSo.length !== 1 ? 'ink() cần đúng 1 đối số là tên màu, đang có ' + (yc.thamSo ? yc.thamSo.length : 0) + '.'
            : 'ink(c) chỉ nhận "red", "green", "blue" hoặc "yellow", mà em đưa vào ' + (typeof mk === 'string' ? '"' + mk + '"' : String(mk)) + '.';
          loi = { loai: 'runtime-error', ma: 'mau-son-sai', dong: yc.dong, thongDiep: moTa, mauDat: mk === undefined ? null : mk };
          return true;
        }
        son.mau = mk;
        vet[vet.length - 1].inkMau = mk;
        return false;
      }
      if (SON_LENH.indexOf(yc.ten) >= 0) {                       // máy sơn: dot() / pen_down() / pen_up() chỉ ra lệnh, chờ nhịp (dot / pen_down nhớ màu LÚC GỌI)
        if (sonCho) {
          suKienChan.push({ ma: 'son-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: sonCho.ten, dongPy: sonCho.dongPy } });
          return false;
        }
        sonCho = { ten: yc.ten, dongPy: yc.dong, mau: son.mau };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (TAY_HOI.indexOf(yc.ten) >= 0) {                        // súng hơi: spray() / spray_back() chỉ ra lệnh, chờ nhịp (bắn rồi giật)
        if (hoiCho) {
          suKienChan.push({ ma: 'ban-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: hoiCho.ten, dongPy: hoiCho.dongPy } });
          return false;
        }
        var luc = 'low';                                       // lực phun: không đối số = phun nhẹ (29/10); màn có cfg.lucBan nhận spray("low") / spray("high")
        if (yc.thamSo && yc.thamSo.length) {
          var lb = yc.thamSo.length === 1 ? yc.thamSo[0] : undefined;
          if (!lucBan) {
            loi = { loai: 'runtime-error', ma: 'luc-chua-mo', dong: yc.dong, ten: yc.ten, thongDiep: 'Vòi phun ở màn này chưa chọn được lực phun: viết ' + yc.ten + '() không có đối số (phun nhẹ).' };
            return true;
          }
          if (LUC_BAN.indexOf(lb) < 0) {
            loi = { loai: 'runtime-error', ma: 'luc-ban-sai', dong: yc.dong, ten: yc.ten, lucDat: lb === undefined ? null : lb,
              thongDiep: yc.thamSo.length !== 1 ? yc.ten + '() nhận nhiều nhất 1 đối số (lực bắn), đang có ' + yc.thamSo.length + '.'
                : yc.ten + '(p) chỉ nhận p = "low" hoặc "high", mà em đưa vào ' + (typeof lb === 'string' ? '"' + lb + '"' : String(lb)) + '.' };
            return true;
          }
          luc = lb;
        }
        hoiCho = { ten: yc.ten, dongPy: yc.dong, sau: (yc.ten === 'spray_back') !== dao.sung, luc: luc };        // daoChieu 'sung': spray() bắn ra sau, spray_back() bắn ra trước
        vet[vet.length - 1].lucBan = luc;
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (laBanh) {
        var bl = BANH_LENH[yc.ten];
        if (lenh[bl[0]] !== 0) {
          // lệnh nào đã giữ bánh này trong nhịp (để chẩn đoán chỉ ra cả nơi gây ra)
          var truoc = null;
          lenhTon.forEach(function (x) { if (!truoc && BANH_LENH[x.ten] && BANH_LENH[x.ten][0] === bl[0]) truoc = { ten: x.ten, dongPy: x.dongPy }; });
          suKienChan.push({ ma: 'banh-goi-lai', nhip: nhip + 1, banh: bl[0], ten: yc.ten, dongPy: yc.dong, truoc: truoc });
          return false;
        }
        lenh[bl[0]] = dao[bl[0]] ? -bl[1] : bl[1];                 // đấu dây ngược: bánh bị đảo quay theo chiều ngược lại
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (CHAN_LENH.indexOf(yc.ten) >= 0) {                      // nhện: crouch() / stand() chỉ ra lệnh, chờ nhịp (nhịp đầu của bước go_* kế tiếp hay nhịp wait() kế tiếp)
        if (chanCho) {
          suKienChan.push({ ma: 'chan-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: chanCho.ten, dongPy: chanCho.dongPy } });
          return false;
        }
        chanCho = { ten: yc.ten, dongPy: yc.dong };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (DRONE_DAP.indexOf(yc.ten) >= 0) {                     // drone nâng cấp: land() / take_off() mỗi lệnh một nhịp; lệnh nam châm đang chờ làm ở nhịp này
        var hdp = { kieu: 'drone', huong: null, nc: ncCho, son: sonCho, dap: yc.ten, lenhDi: { ten: yc.ten, dongPy: yc.dong } };
        ncCho = null; sonCho = null; lenhTon = [];
        return motNhip(hdp);
      }
      var hh = NHEN_HUONG[yc.ten];
      if (laDrone) {                                             // drone: go_*() bay 1 ô = đúng 1 nhịp; lệnh nam châm đang chờ làm ở nhịp này
        var hdd = { kieu: 'drone', huong: hh, nc: ncCho, son: sonCho, lenhDi: { ten: yc.ten, dongPy: yc.dong } };
        ncCho = null; sonCho = null; lenhTon = [];
        return motNhip(hdd);
      }
      var tayBuoc = rutTay();                                    // lệnh tay đang chờ làm ở nhịp ĐẦU của bước
      var chanBuoc = chanCho; chanCho = null;                    // lệnh chân (crouch / stand) đang chờ cũng làm ở nhịp ĐẦU của bước
      var ncBuoc = ncCho; ncCho = null;                          // lệnh nam châm bụng (mùa 3) cũng làm ở nhịp ĐẦU của bước
      lenhTon = [];
      return motNhip({ kieu: 'nhen', huong: hh, buoc: 1, tay: tayBuoc, chan: chanBuoc, nc: ncBuoc }) ||
        motNhip({ kieu: 'nhen', huong: hh, buoc: 2, lenhDi: { ten: yc.ten, dongPy: yc.dong } });
    }


    /* ------------------------------------------------------------------ NHIỀU ROBOT: bộ xếp lịch nhịp chung (KE-HOACH-HAI-ROBOT.md)
       Mỗi robot chạy chương trình của mình tới ranh nhịp (wait(), bước go_*) rồi dừng chờ (motNhip đẩy nhịp vào hangNhip). Đủ mọi robot thì sân chạy một nhịp:
       pha a (từng robot) → b (sân) → c (từng robot) → d (sân) → e (từng robot). Robot hết chương trình / đã tới cờ thì đứng yên (nghi()). */
    /** Một nhịp đứng yên của robot đang xét (đã hết chương trình hay đã tới cờ). */
    function nghi() {
      var tayRong = { tuThe: null, kep: null, xoay: null, lenhTuThe: null, lenhKep: null, lenhXoay: null };
      if (laDrone) return { kieu: 'drone', huong: null, nc: null };
      if (laBanh) return { kieu: 'banh', trai: 0, phai: 0, lenhBanh: null, tay: tayRong, truot: null, nc: null, nem: null, hoi: null, son: null };
      return { kieu: 'nhen', huong: null, tay: tayRong, chan: null };
    }
    /** Ô robot đang xét ĐỊNH tới ở nhịp có hành động h (tiến / lùi / trượt / bước / bay / giật súng), null nếu không định rời ô. Dùng để chặn đồng đội trước khi ai đi. */
    function duKienDi(h) {
      var d = null, v;
      if (h.kieu === 'drone') d = h.huong === null || h.huong === undefined || dau ? null : h.huong;
      else if (h.kieu === 'nhen') {
        if (h.buoc !== 2) return null;
        var buoc = nhayBuoc ? 2 : 1;
        v = VEC[h.huong];
        return { x: rb.x + v[0] * buoc, y: rb.y + v[1] * buoc, drone: false };
      } else if (h.nem) return null;
      else if (h.hoi) {
        if (beSung && loai === 'xich' && h.hoi.luc !== 'low') return null;                                           // bệ súng xích: bắn tụ không giật nên không định tới ô nào
        d = ((h.hoi.sau ? (rb.huong + 2) % 4 : rb.huong) + 2) % 4;
      }
      else if (h.truot) d = (rb.huong + (h.truot.bien > 0 ? 1 : 3)) % 4;
      else if (h.trai === 1 && h.phai === 1) d = rb.huong;
      else if (h.trai === -1 && h.phai === -1) d = (rb.huong + 2) % 4;
      if (d === null) return null;
      v = VEC[d];
      return { x: rb.x + v[0], y: rb.y + v[1], drone: laDrone };
    }
    function chayDoi() {
      var X = [{ ctx: catRobot() }];
      for (var i = 1; i < dsRc.length; i++) {
        khoiRobot(dsRc[i]);
        apRoBanDau(dsRc[i]);
        X.push({ ctx: catRobot() });
      }
      vatBanDau = chupVat();                                                  // rổ có sẵn vật của R2… cũng là vật lúc xuất phát
      X.forEach(function (a, i) {
        X.forEach(function (b, j) {
          if (j > i && a.ctx.rb.x === b.ctx.rb.x && a.ctx.rb.y === b.ctx.rb.y && a.ctx.laDrone === b.ctx.laDrone) throw new Error('Robot ' + (i + 1) + ' và robot ' + (j + 1) + ' xuất phát cùng một ô.');
        });
      });
      X.forEach(function (x, i) {
        x.tiep = true; x.traVe = undefined; x.xong = false;
        napRobot(x.ctx);
        x.g = Core.chayCodeGen(codeVao[i], api, { nganSachLenh: opt.nganSachLenh || 20000 });
        x.ctx = catRobot();
      });
      function datKhac(i, kemDinh) {                                      // đồng đội của robot i (vị trí sống) và ô họ định tới (chỉ ở pha a)
        xeKhac = []; oDinhToi = [];
        X.forEach(function (y, j) {
          if (j === i) return;
          xeKhac.push({ rb: y.ctx.rb, drone: y.ctx.laDrone });
          if (kemDinh && y.du) oDinhToi.push(y.du);
        });
      }
      function keo(x, i) {                                                // chạy chương trình của robot x tới nhịp kế (hay tới hết / lỗi)
        datKhac(i, false);                                                // cảm biến đọc trong lúc chạy thấy đồng đội ở chỗ hiện tại
        napRobot(x.ctx);
        try {
          while (!x.xong && !hangNhip.length) {
            if (x.tiep) { x.r = x.g.next(x.traVe); x.tiep = false; }
            if (x.r.done) { x.xong = true; break; }
            traVe = 0;
            var dung = xuLy(x.r.value);
            x.traVe = traVe; x.tiep = true;
            if (dung) { x.g.return(); x.xong = true; }
          }
        } catch (e) {
          if (e && e.cuaGame) loi = { loai: e.loai, dong: e.dong, thongDiep: e.thongDiep };
          else throw e;
          x.xong = true;
        }
        x.ctx = catRobot();
      }
      var loiDoi = null;
      for (;;) {
        X.forEach(function (x, i) { if (!x.xong && !x.ctx.hangNhip.length) keo(x, i); });
        X.forEach(function (x, i) { if (!loiDoi && x.ctx.loi) loiDoi = Object.assign({ robot: i }, x.ctx.loi); });
        if (loiDoi) break;
        if (X.every(function (x) { return x.xong && !x.ctx.hangNhip.length; })) break;
        if (nhip >= nhipToiDa) { loiDoi = { loai: 'qua-nhieu-nhip', dong: 0, thongDiep: 'Quá ' + nhipToiDa + ' nhịp.' }; break; }
        nhip++;
        var demKep = {};
        X.forEach(function (x) {                                           // hành động của nhịp, ô định tới, ô định kẹp
          napRobot(x.ctx);
          x.h = hangNhip.length ? hangNhip.shift() : nghi();
          x.du = duKienDi(x.h);
          if (x.h.tay && x.h.tay.kep === 'kep') { var ok = oTay(), k = ok.x + ',' + ok.y; demKep[k] = (demKep[k] || 0) + 1; }
          x.ctx = catRobot();
        });
        oTranhKep = {};
        Object.keys(demKep).forEach(function (k) { if (demKep[k] > 1) oTranhKep[k] = true; });
        X.forEach(function (x, i) { datKhac(i, true); napRobot(x.ctx); x.n = taoNhip(x.h); x.n.a(); x.ctx = catRobot(); });
        datKhac(0, false); napRobot(X[0].ctx); X[0].n.b(); X[0].ctx = catRobot();
        X.forEach(function (x, i) { datKhac(i, false); napRobot(x.ctx); x.n.c(); x.ctx = catRobot(); });
        datKhac(0, false); napRobot(X[0].ctx); X[0].n.d(); X[0].ctx = catRobot();
        X.forEach(function (x, i) { datKhac(i, false); napRobot(x.ctx); x.n.e(); x.ctx = catRobot(); });
        xeKhac = []; oDinhToi = []; oTranhKep = {};
        X.forEach(function (x) {                                           // tới cờ: dừng chương trình, các nhịp sau đứng yên
          if (x.ctx.xeToiCo && !x.xong) { try { x.g.return(); } catch (e) { /* bỏ qua */ } x.xong = true; x.ctx.hangNhip.length = 0; }
        });
        if (doiKhang) {
          var x0 = X[0], x1 = X[1];
          if (!dungSom && x1 && x1.ctx.xeToiCo) {
            var cungNhip = !!(x0 && (x0.ctx.xeToiCo || thang));
            thang = false;
            dungSom = 'doi-thu-thang';
            var edt = { ma: 'doi-thu-thang', nhip: nhip, cungNhip: cungNhip, o: { x: x1.ctx.rb.x, y: x1.ctx.rb.y } };
            if (x0) {
              x0.ctx.suKienChan.push(edt);
              var v0 = x0.ctx.vet;
              for (var iv0 = v0.length - 1; iv0 >= 0; iv0--) if (v0[iv0].loai === 'nhip') { v0[iv0].suKien.push(edt); break; }
            }
          } else if (!dungSom && mucTieu === 'toi-co' && x0 && x0.ctx.xeToiCo) {
            thang = true;
          }
        } else if (mucTieu === 'toi-co' && X.every(function (x) { return x.ctx.xeToiCo; })) {
          thang = true;
        }
        if (thang || dungSom) break;
      }
      xeKhac = []; oDinhToi = [];
      var dsKq = X.map(function (x, i) {
        napRobot(x.ctx);
        var hetBinhThuong = !thang && !loi && !loiDoi && (!dungSom || (dungSom === 'doi-thu-thang' && i === 0 && x.xong)) && !xeToiCo;
        if (hetBinhThuong && loai === 'xich' && quayDo) suKienChan.push({ ma: 'xich-quay-do', nhip: nhip, nhipNua: quayDo.nhip, huong: quayDo.huong, lenh: quayDo.lenh, cuoi: true });
        if (hetBinhThuong && lenhTon.length) suKienChan.push({ ma: 'quen-wait', nhip: nhip, lenh: lenhTon.slice() });
        var o = {
          ten: 'R' + (i + 1), loaiRobot: loai, robot: chup(), loi: loi, vet: vet, suKien: suKienChan, lenhTon: lenhTon, batDau: { x: bd.x, y: bd.y, huong: bd.huong || 0 },
          tay: coTay ? chupTay() : null, namCham: coNamCham ? chupNamCham() : null, nem: coNem ? chupNem() : null, sung: coHoi ? { dan: dan } : null, son: coSon ? { ha: son.ha, mau: son.mau } : null,
          soLanDoc: soLanDoc, docConLai: docCho, pin: pin, pinToiDa: pinToiDa,
          chan: loai === 'nhen' ? chan : undefined, quayDo: loai === 'xich' ? (quayDo ? quayDo.huong : 0) : undefined,
          toiCo: xeToiCo, xong: x.xong
        };
        x.ctx = catRobot();
        return o;
      });
      napRobot(X[0].ctx);
      return Object.assign({}, dsKq[0], {
        thang: thang, nhip: nhip, loi: loiDoi, doi: dsKq,
        vat: chupVat(), vatBanDau: vatBanDau, dich: dsDich, dungSom: dungSom,
        cua: chupCua(), nut: chupNut(), nutDe: chupNutDe(), bangTat: chupBangTat(), cuaBanDau: cuaBanDau, nutBanDau: nutBanDau, nutDeBanDau: nutDeBanDau,
        thung: chupThung(), thungBanDau: thungBanDau, bongMo: null, diQua: [], mauO: san.mau, sac: san.sac.slice(), daSon: chupSon(), hinh: hinh, sonBanDau: sonBanDau
      });
    }

    if (laDoi) return chayDoi();
    var g = Core.chayCodeGen(code, api, { nganSachLenh: opt.nganSachLenh || 20000 });
    try {
      var r = g.next();
      while (!r.done) {
        traVe = 0;
        if (xuLy(r.value)) { g.return(); break; }
        r = g.next(traVe);
      }
    } catch (e) {
      if (e && e.cuaGame) loi = { loai: e.loai, dong: e.dong, thongDiep: e.thongDiep };
      else throw e;
    }

    // xích: chương trình hết khi còn quay dở (chưa thắng) → ghi lại, để chẩn đoán nói rõ
    if (loai === 'xich' && quayDo && !thang && !loi && !dungSom) {
      suKienChan.push({ ma: 'xich-quay-do', nhip: nhip, nhipNua: quayDo.nhip, huong: quayDo.huong, lenh: quayDo.lenh, cuoi: true });
    }

    // bóng mờ: chương trình chạy xong (không lỗi, không dừng sớm) mà xe đúng tư thế đích thì thắng
    if (mucTieu === 'bong-mo' && !thang && !loi && !dungSom && bongMoDat()) {
      thang = true;
      for (var iv = vet.length - 1; iv >= 0; iv--) if (vet[iv].loai === 'nhip') { vet[iv].suKien.push({ ma: 'toi-bong-mo' }); break; }
    }

    // chương trình hết mà còn lệnh chưa wait() → lệnh đó không chạy
    if (!thang && !loi && !dungSom && lenhTon.length) {
      suKienChan.push({ ma: 'quen-wait', nhip: nhip, lenh: lenhTon.slice() });
    }

    return {
      thang: thang, nhip: nhip, robot: chup(), loi: loi, vet: vet,
      suKien: suKienChan, lenhTon: lenhTon, batDau: { x: bd.x, y: bd.y, huong: bd.huong || 0 },
      tay: coTay ? chupTay() : null, namCham: coNamCham ? chupNamCham() : null, nem: coNem ? chupNem() : null, sung: coHoi ? { dan: dan } : null, vat: chupVat(), vatBanDau: vatBanDau, dich: dsDich, dungSom: dungSom,
      son: coSon ? { ha: son.ha, mau: son.mau } : null, daSon: chupSon(), hinh: hinh, sonBanDau: sonBanDau,
      cua: chupCua(), nut: chupNut(), nutDe: chupNutDe(), bangTat: chupBangTat(), cuaBanDau: cuaBanDau, nutBanDau: nutBanDau, nutDeBanDau: nutDeBanDau,
      thung: chupThung(), thungBanDau: thungBanDau,
      bongMo: bongMo, diQua: chupDiQua(),
      soLanDoc: soLanDoc, docConLai: docCho, mauO: san.mau,
      pin: pin, pinToiDa: pinToiDa, sac: san.sac.slice(),
      chan: loai === 'nhen' ? chan : undefined,
      quayDo: loai === 'xich' ? (quayDo ? quayDo.huong : 0) : undefined
    };
  }

  var API = {
    VEC: VEC, TEN_HUONG: TEN_HUONG, HAM_GOC: HAM_GOC, LENH_NGUOC: LENH_NGUOC, BANH_LENH: BANH_LENH, MUC_TIEU: MUC_TIEU, phanCungMacDinh: phanCungMacDinh, phanCungCua: phanCungCua, TAY_LENH: TAY_LENH, TAY_XOAY: TAY_XOAY, XOAY_NAC: XOAY_NAC, TAY_NHOM: TAY_NHOM, BANG: BANG, BAN_XOAY: BAN_XOAY, CONG_KY: CONG_KY, XICH_QUAY: XICH_QUAY, OMNI_TRUOT: OMNI_TRUOT, CAM_BIEN_HAM: CAM_BIEN_HAM,
    TAY_NAM_CHAM: TAY_NAM_CHAM, TAY_NEM: TAY_NEM, TAY_HOI: TAY_HOI, LUC_BAN: LUC_BAN, TEN_CU_VOI_PHUN: TEN_CU_VOI_PHUN, TAM_BAN_NHANH: TAM_BAN_NHANH, TAY_SON: TAY_SON, SON_LENH: SON_LENH, laLenhSon: laLenhSon, TAM_NEM_TOI_DA: TAM_NEM_TOI_DA, CAM_TU_HAM: CAM_TU_HAM, CAM_HONG_NGOAI_HAM: CAM_HONG_NGOAI_HAM, MA_CAM_HONG_NGOAI: MA_CAM_HONG_NGOAI, CAM_PIN_HAM: CAM_PIN_HAM, PIN_TOI_DA: PIN_TOI_DA, CHAT_KY: CHAT_KY, TAM_HUT: TAM_HUT, TAM_CUC: TAM_CUC, TAM_DAY: TAM_DAY, CUC_MAU: CUC_MAU, CAM_MAU_HAM: CAM_MAU_HAM, CAM_NHIN_HAM: CAM_NHIN_HAM, MA_CAM_BAY: MA_CAM_BAY, MAU_KY: MAU_KY, MAU_TEN: MAU_TEN, laHamCamBien: laHamCamBien, lopMauCuaSan: lopMauCuaSan, coCuaSan: coCuaSan,
    CHAN_LENH: CHAN_LENH,
    docSan: docSan, lyDoChan: lyDoChan, chay: chay
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.SanHoc = API;
})();
