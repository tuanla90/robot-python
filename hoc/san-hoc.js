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
          'quen-wait'. Đạn vô hạn, trừ khi màn khai cfg.danToiDa = n: mỗi phát tốn 1 viên, hết đạn thì không phun VÀ không giật ('het-dan', lỗi) nhưng vẫn mất nhịp.
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
        - LỬA (30/10, gói 10 mùa 2 "Xe cứu hỏa R1"; cfg.lua = [{ x, y, suc }], màn nhiều sân: mảng song song với san như nutBat): ô ghi '.' trên sân, suc là 1, 2 hay 3
          (số lần tia nước trúng mới tắt). ĐANG CHÁY thì như cửa đóng: chặn xe (tiến vào: dam-tuong vat 'lua'), chặn thùng, chặn tia nước (trung 'lua'), front_clear() = False;
          distance() đếm tới lửa (vat 'lua'), warm() thấy lửa là NÓNG. Mỗi lần tia trúng (phun nhẹ hay mạnh như nhau) suc giảm 1 ('lua-nho' { nhip, o, suc }); về 0 thì TẮT HẲN
          ('lua-tat' { nhip, o }): ô thành sàn, đi qua được, không bao giờ cháy lại (khác van: van trúng là đổi qua lại). Lửa không lan, không hại xe.
          CỬA CHỐNG CHÁY: cfg.noi với nut là ô lửa: lửa tắt thì các cửa của nhóm đổi MỘT LẦN ở cuối nhịp (C đóng → mở). Lửa không có trong noi thì không điều khiển gì
          (kể cả khi sân không khai noi). Lửa không đặt trên ô robot xuất phát và chỉ đặt trên sàn '.'.
          Mục tiêu 'dap-lua' (một robot): thắng khi MỌI đám cháy đã tắt và robot đứng ở cờ (sân không có cờ F thì chỉ cần dập hết). Tới cờ mà còn lửa thì chưa thắng, chạy tiếp.
        Kết quả chạy có `cua` [{x,y,mo}], `nut` [{x,y,bat}], `bangTat` [{x,y}] (ô băng đang tắt), `lua` [{x,y,suc}] (suc 0 = đã tắt) — trạng thái CUỐI; luaBanDau lúc xuất phát; cuaBanDau / nutBanDau lúc xuất phát; sung { dan } (null nếu robot không có súng; dan = số viên
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
          rơi xuống ô sát mũi rồi trượt như bị đẩy ('day-vat' có tuMui: true); ô sát mũi bị chặn thì hất không ra, vật vẫn dính ('day-bi-chan', tuMui: true). magnet_off thả vật xuống ô sát mũi, không trượt.
        - Vật nằm trên băng chuyền vẫn hút được; vật nằm dưới đất (kể cả đang trượt) không bị băng kéo (như mọi vật). Quên wait() sau lệnh nam châm → 'quen-wait'.
        - CẢM BIẾN TỪ (part riêng 'tu' từ P1 mùa 3 29/10: màn mùa 3 khai robot.camBien [{ ma:'tu', o:'hong' }] + hamGoc front_metal / front_pole; màn cũ khai khoang-cach + hai hàm
          vẫn chạy y nguyên vì lõi chỉ nhìn hamGoc, không đòi part; drone không gắn vì không có hướng mặt; NHỆN gắn được từ 31/10 (KE-HOACH-PART-DUNG-MUA.md): đo theo CẠNH TRƯỚC CỐ ĐỊNH = hướng xuất phát cfg.batDau.huong, như tay kẹp nhện). Đọc KHÔNG tốn nhịp, ghi mục lệnh có `docCamBien` { cam:'tu', ham, tu, huong, o, khoang, chat, cuc, idVat, trong, nhip } và sự kiện
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
          Với ĐỆM TỪ: nhện có nam châm bụng bật thì bị hút / đẩy theo cực như xe; đang nhảy thì miễn. Cảm biến từ của nhện (31/10) đo theo cạnh trước cố định (hướng xuất phát).
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

   BẾN SÔNG (mùa 5, 31/10, hoc/KE-HOACH-MUA-CANG-SONG.md mục 2; loaiRobot 'xuong' "Tàu thủy lợi R1"). Mọi luật dưới đây chỉ bật khi màn có ký hiệu nước / lớp cfg.dong / xuồng, nên màn cũ không đổi.
        Ký hiệu sân: ~ MẶT NƯỚC · Q PHAO ĐÍCH (cờ trên nước: san.co, xuồng tới là 'toi-co') · q BẾN NHẬN BÈ (ô đích trên nước, vào dich / dichSet) · B BÈ, L LỤC BÌNH (vật nổi, ô dưới là nước)
        · K CỐNG ĐÓNG, k CỐNG MỞ (ô nước có cửa cống) · V VAN CỐNG (cần gạt trên bờ, chiếm ô như nút N: lyDoChan 'van'). docSan trả thêm vatNoi, congNuoc, van, nuoc ('x,y' → true cho ~ Q q K k B L).
        Lớp cfg.dong = [{ x, y, huong, suc }] (màn nhiều sân: mảng song song với san như lua / noi): ô phải là mặt nước; huong 0–3 là chiều nước chảy; suc 1 (dòng thường) hay 2 (dòng xiết). Lỗi cấu hình tiếng Việt.
        - XUỒNG: hamGoc gốc = xe hai bánh (left_move / right_move / left_back / right_back / wait: hai chân vịt = hai bánh), laBanh = true nên MỌI luật bánh (tổ hợp quay, đấu dây ngược, xe mờ, xích…) dùng lại.
          Xuồng chỉ vào được ô mặt nước; mọi ô khác (sàn, tường, cờ cạn F, van V, mép sân…) là BỜ: 'dam-tuong' vat 'bo' (mép sân vẫn 'ngoai-san'). Cống đóng chặn như cửa ('cong'), vật nổi chặn ('vat', idVat), robot khác ('dong-doi').
          Xuồng không gắn tay kẹp / nam châm / máy ném / vòi phun (lỗi cấu hình); xuất phát phải trên nước, không trong cống đóng, không trên vật nổi.
          XE CẠN (bánh, xích, omni) và NHỆN đâm nước như tường: 'dam-tuong' vat 'nuoc', không chìm; front_clear() / distance() thấy nước là không trống (vat 'nuoc'). DRONE bay qua nước, nhưng land() không đáp xuống nước ('dap-bi-chan' vat 'nuoc', trừ cầu phao).
        - THỨ TỰ TRONG NHỊP của xuồng (pha a, so với xe bánh): (a) NEO: anchor / unanchor → (b) DÂY PHAO: tow / drop_tow / tether / untether → (c) chân vịt (tiến / lùi / quay; đang neo thì bỏ) → (d) DÒNG CHẢY (chỗ băng chuyền:
          vật nổi tự do trôi trước, rồi xuồng) → đệm từ, bàn xoay, cổng như cũ. Cuối nhịp (pha d) cống đổi theo van (sau cửa).
        - DÒNG CHẢY: mỗi nhịp (nước chảy liên tục, KHÁC băng chuyền đếm 2 nhịp), xuồng KHÔNG neo đứng trên ô dòng ĐANG CHẠY (bat) sau hành động của nhịp bị đẩy `suc` ô theo `huong`, TỪNG Ô; ô kế không vào được
          (bờ, cống đóng, vật nổi, robot) thì dừng ở ô cuối đi được. Chỉ xét ô xuồng đứng SAU khi chạy: trôi sang ô dòng khác trong cùng nhịp thì không xét tiếp. Hệ quả: xuôi dòng 1 + suc; ngược dòng sức 1 đứng im,
          sức 2 lùi 1; đi ngang dòng thì trôi chéo. Muốn đứng vững: thả neo; muốn qua: vòng nhánh khác hay tắt dòng bằng van cống (không có "động cơ vượt dòng").
          Vật nổi TỰ DO (không bị kéo, không có xe cạn đứng trên) trên ô dòng đang chạy cũng trôi cùng luật, TRƯỚC xuồng, theo thứ tự id, MỘT lần mỗi nhịp (nhiều robot: vatTroiNhip). Vật trôi bị chặn bởi bờ, cống đóng, vật khác, robot.
          Sự kiện: 'troi' { nhip, ai: 'robot' | 'vat', id?, tu, den, huong, soO, chan: lý do dừng sớm | null }, 'troi-chan' { nhip, ai, id?, o, huong, vat } (đẩy 0 ô vì bị chặn; của xuồng là thông tin trong suKien), 'neo-giu' { o, huong, suc } (đang neo trên dòng).
          Dòng chảy không đẩy drone; demBang về 0 sau khi trôi.
        - NEO (nâng cấp thân, phần cứng có anchor + unanchor, đi cặp; LENH_NGUOC anchor ↔ unanchor): anchor() / unanchor() chỉ RA LỆNH, làm ở pha (a) của nhịp wait() kế (một lệnh neo mỗi nhịp: 'neo-goi-lai').
          Đang neo: dòng không đẩy ('neo-giu'); lệnh bánh của nhịp bị bỏ, xuồng đứng yên, mất nhịp ('dang-neo' { o, lenh: lệnh bánh đầu tiên }, lỗi, như 'dang-dau' của drone); dây phao vẫn dùng được.
          anchor() khi đã neo: 'da-neo' (thông tin); unanchor() khi chưa neo: 'chua-neo' (thông tin). Sự kiện 'tha-neo' / 'nho-neo' { o }. Vết nhịp robot.neo true / false.
        - DÂY PHAO (tay gốc của xuồng; phần cứng có tow + drop_tow, đi cặp; LENH_NGUOC tow ↔ drop_tow): tow() / drop_tow() chỉ RA LỆNH, làm ở pha (b) của nhịp wait() kế, TRƯỚC chân vịt; mỗi nhịp một lệnh dây (tow / drop_tow / tether / untether
          chung một hàng chờ: 'phao-goi-lai'). tow(): dây bay THẲNG theo mũi tối đa TAM_KEO = 3 ô, dừng ở thứ đầu tiên:
            · vật nổi → kéo về Ô TRƯỚC MŨI (vật ngay trước mũi thì chỉ móc): 'keo-vat' { id, tu, den, soO }; keo = { id, cho: 'mui' }. Vật nổi đang có xe cạn đứng trên: 'keo-hut' vat 'co-xe'.
            · van cống V → van ĐỔI (doiVan, xem CỐNG): 'keo-van' { tu, o, bat, soO }.
            · bờ 'bo', cống đóng 'cong', vật thường 'vat', robot 'dong-doi', mép sân 'ngoai-san', hết tầm 'het-tam' → 'keo-hut' { tu, huong, o, vat, lenh } (thông tin).
          tow() khi đang kéo: 'dang-keo' { id, cho } (lỗi). drop_tow() thả vật tại ô nó đang nằm ('tha-keo' { id, o, cho }); không kéo gì: 'khong-keo' (lỗi).
          VẬT KÉO Ở MŨI CHIẾM Ô (user chốt 31/10): nó là vật nằm đất ở ô trước mũi (vatNamTai thấy, xuồng khác / dòng / dây coi như vật). Tiến: VẬT ĐI TRƯỚC, ô trước vật phải vào được (nước, không cống đóng, không vật, không robot),
          không thì CẢ HAI ĐỨNG IM ('mui-vuong' { tu, o: ô trước vật, vat, id, kieu: 'tien', lenh }, lỗi). Lùi: xuồng lùi, vật theo vào ô xuồng vừa rời. Quay (quay-trai / quay-phai / quay-dau): vật chuyển sang ô trước mũi MỚI,
          ô đó phải là nước trống, không thì LỆNH QUAY BỊ BỎ, hướng không đổi ('mui-vuong' kieu 'quay-…'). Dòng đẩy xuồng thì CẢ CỤM cùng đi từng ô (vật ở mũi đi trước theo chiều trôi; trôi ngược thì vật theo sau);
          ô kế của xuồng hay của vật bị chặn thì cụm dừng. Vật đang kéo KHÔNG tự trôi. Sự kiện vật dời theo xuồng: 'keo-theo' { id, tu, den }; sự kiện tien / lui có thêm keo: id.
        - BUỘC DẮT THEO ĐUÔI (nâng cấp tay: tether + untether; LENH_NGUOC tether ↔ untether): tether(): vật đang kéo ở mũi chuyển ra Ô SAU ĐUÔI ('buoc-duoi' { id, tu, den }; keo.cho = 'duoi'); ô đó không phải nước trống
          → 'duoi-vuong' { tu, o, vat, id, kieu: 'tether' } (lỗi), vật vẫn ở mũi. Không kéo gì mà ô sau đuôi có vật nổi (không có xe trên) → móc luôn ('buoc-duoi' tu = den); không có → 'buoc-hut' { o, vat: 'khong-co-vat' | 'co-xe' } (lỗi).
          Đã buộc đuôi rồi: 'da-buoc' (thông tin). untether() thả vật tại ô nó nằm ('coi-duoi'); không kéo gì: 'khong-keo'.
          Luật nối đuôi (như toa tàu): xuồng dời 1 ô (tiến, lùi, trôi) thì vật vào ĐÚNG Ô XUỒNG VỪA RỜI, nên quay xong tiến qua khúc cua không bao giờ vướng. Xuồng dời VÀO CHÍNH Ô VẬT (lùi thẳng vào bè, trôi ngược vào bè)
          → bị chặn ('duoi-vuong' kieu 'lui' / trôi: chan 'vat'). Quay tại chỗ thì vật đứng yên. Vết nhịp robot.keo = { id, cho: 'mui' | 'duoi' } | null.
        - CHONG CHÓNG DÒNG CHẢY (cảm biến gốc: flow_dir; nâng cấp: flow; rc.camBien có { ma: 'dong-chay' }, thiếu thì lỗi cấu hình): đọc Ô TRƯỚC MŨI, không tốn nhịp, chung bộ đếm DOC_LIEN_TIEP_TOI_DA với mọi cảm biến.
          flow_dir() trả chuỗi THEO MŨI XUỒNG (user chốt 31/10; HUONG_TUONG_DOI[(huongDong − huongMui) mod 4]): "front" (chảy cùng chiều mũi, ra xa xuồng), "back" (chảy về phía xuồng), "left", "right";
          "none" khi nước êm, dòng tắt, bờ, ngoài sân. flow() trả TUPLE (huong, suc): san-hoc trả mảng JS [huong, suc], nhân san-robot-core đưa cho trẻ thành tuple ("back", 2) / ("none", 0).
          Sự kiện 'doc-cam-bien' { cam: 'dong-chay', ham, tu, huong: hướng mũi, o: ô trước mũi, huongDong: 0–3 | null, suc: 0–2, tuongDoi }.
        - CỐNG THỦY LỢI + VAN: van V nối nhóm như nút N với cửa và băng: cfg.noi = [{ nut: {x,y} (ô V), cong: [{x,y}] (hay cua: [...], ô K / k), dong: [{x,y}] (ô có dòng) }]; không khai noi thì MỖI van điều khiển MỌI cống và MỌI ô dòng.
          Van không điều khiển băng chuyền (lỗi cấu hình); nhóm van rỗng (cong: [], dong: []) thì van đổi mà không điều khiển gì. Van đổi (dây phao trúng): 'van-doi' { o, bat }; ô dòng của nhóm bật ↔ tắt NGAY ('dong-doi' { o, bat },
          dòng tắt thì không đẩy, chong chóng đọc "none"); cống của nhóm đổi đóng ↔ mở ở CUỐI nhịp ('cong-doi' { o, mo }), không đóng xuống ô có xuồng / robot / vật: giữ mở, 'cong-ket' { o, voi: 'xe' | 'vat' } (thông tin).
          Gạt lần nữa thì về như cũ. Cống đóng chặn xuồng, vật nổi trôi, dây phao (như cửa C); cống mở như nước. Kết quả chạy: cong [{x,y,mo}], van [{x,y,bat}], dongTat [{x,y}] (ô dòng đang tắt), congBanDau, vanBanDau;
          vết nhịp có cong / van / dongTat (chỉ khi sân có cống / van / dòng) và vat (khi sân có vật nổi).
        - VẬT NỔI, CẦU PHAO, MỤC TIÊU: vật nổi là VẬT (vats, trangThai 'dat', chat 'go') có thêm noi: 'be' | 'luc-binh'; chiếm ô (xuồng không vào), chỉ nằm trên nước; chupVat ghi noi.
          CẦU PHAO: xe cạn (bánh, xích, omni, nhện) đi vào ô nước có vật nổi KHI ô đó không có dòng đang chạy thì đi được như sàn (lyDoChan 'nuoc' được bỏ, vật không chặn); đang có xe đứng trên thì tow() không kéo vật đó ('keo-hut' vat 'co-xe')
          và vật không trôi. (Ca biên tự chọn: tay kẹp của xe cạn vẫn gắp được vật nổi trước mặt như vật thường — màn không nên dựng như vậy.)
          Mục tiêu 'dua-vat': thắng khi MỌI vật nổi (vật) nằm trên ô q (dichSet). 'toi-co': xuồng tới Q (F với xe cạn; sân có cả F và Q thì cờ là ký hiệu gặp trước khi đọc sân).

   CẢNG SÔNG (mùa 4, 31/10, hoc/KE-HOACH-MUA-CANG-SONG.md mục 3; loaiRobot 'cau' "Cần cẩu container R1"). Mọi luật dưới đây chỉ bật khi màn có cần cẩu / ký hiệu T R / lớp cfg.chong, nên màn cũ không đổi.
        - KÝ HIỆU: T ô BOONG TÀU (trên nước: laNuoc true; tàu có mặt thì hạ container được, tàu vắng là mặt nước), R ô RAY cẩu (sàn với xe khác; bệ cẩu chạy dọc ray). Bãi container là sàn '.' thường.
          Lớp cfg.chong = [{ x, y, cont: [{ so, tan? }] }] (đáy → đỉnh; so 1–99, tan 1–4 mặc định 1; ô phải là '.' hay D — KHÔNG khai trên T / ray / nước / ô robot xuất phát; cao tối đa CHONG_TOI_DA = 4).
          Lớp cfg.tau = [{ o: [{x,y}], co, vang, pha? }]: mọi ô T phải thuộc đúng một tàu; tàu có mặt sau t nhịp khi (t + pha) mod (co + vang) < co (như cửa nhịp; vang 0 = tàu luôn ở bến).
          Màn nhiều sân: chong / tau / giao là mảng song song với san (lopMauCuaSan). cfg.taiToiDa (luật tải) và cfg.luatThap (luật tháp) là của màn; khai mà không có cẩu là lỗi cấu hình.
        - CẦN CẨU: bệ đứng ở batDau (phải là '.', D, sàn màu hay R; không băng chuyền / bàn xoay / cổng / cửa nên bệ không bao giờ bị đẩy), chiếm ô như tường với robot khác (dongDoiTai). Không có hướng mặt (huong bỏ qua),
          không có bánh, không gắn tay kẹp / nam châm / cảm biến khác (lỗi cấu hình). Cần có NẤC nac 0–7 (NAC_VEC: 0 lên, 1 lên-phải, 2 phải, 3 xuống-phải, 4 xuống, 5 xuống-trái, 6 trái, 7 lên-trái) và TẦM tam 1–3;
          batDau.nac / batDau.tam (mặc định 0, 1); ĐẦU CẦN = bệ + tam × NAC_VEC[nac] (nấc chéo: (±tam, ±tam)), lúc xuất phát phải nằm trong sân.
          MỌI LỆNH CẨU LÀ MỘT NHỊP NGAY (như go_* của drone): không có hàng chờ, không có quen-wait; wait() = một nhịp đứng yên ('dung-yen').
          swing_left() / swing_right(): nấc −1 / +1 mod 8 ('quay-can' { tu, den, chieu, dau }); extend() / retract(): tầm ±1 ('vuon-can' / 'thu-can' { tu, den, dau }). Cặp ngược: swing_left ↔ swing_right, extend ↔ retract, pick_up ↔ set_down.
          Cần CAO HƠN MỌI THỨ: quay / vươn qua tường, chồng, robot, nước không bị chặn. Vươn quá 3, thu dưới 1, hay đầu cần MỚI nằm ngoài sân (kể cả khi quay): không làm, mất nhịp, 'can-het-tam' { lenh, vat: 'tam' | 'ngoai-san', nac, tam, o } (lỗi).
          Container đang treo đi theo đầu cần (treoTheo). Vết nhịp robot: nac, tam, dau {x,y}, treo [{so,tan}] (đáy → đỉnh), doi (đang móc đôi); kết quả cũng có nac / tam / dau / treo.
        - MÓC CẨU (tay, TAY_MOC; pick_up đi cùng set_down; pick_up2 là nâng cấp, cần có pick_up). TÊN: đặc tả ghi hook / unhook / hook2 nhưng mùa 3 đã dạy trẻ TỰ TẠO hàm hook() / unhook() (man-bung-nhen, man-trum-mua-3)
          nên tên gốc đổi thành pick_up / set_down / pick_up2 (31/10) để kho hàm của trẻ không vỡ.
          pick_up(): nhấc container TRÊN CÙNG ở ô đầu cần ('moc-cont' { o, cont, doi, tau }); ô không có container: 'moc-hut' { o, vat: 'trong' | 'tau-vang' | 'ngoai-san' } (lỗi); đang treo: 'dang-treo' { o, cont } (lỗi).
          pick_up2(): nhấc HAI container trên cùng một lần, giữ thứ tự (treo = [dưới, trên]); chồng chỉ có 1: 'moc-thieu' { o, co } (lỗi, không nhấc); chồng trống: moc-hut.
          set_down(): hạ MỌI container đang treo lên ĐỈNH chồng ở ô đầu cần ('ha-cont' { o, cont, doi, tau }); không treo gì: 'khong-treo' (lỗi). Không hạ được → 'ha-bi-chan' { o, vat, cont } (lỗi), container vẫn treo; vat:
            'ngoai-san' | 'tau-vang' (ô T lúc tàu vắng) | 'nuoc' | 'tuong' | 'rao' | 'ray' (không đặt lên ray) | 'bac-thang' | 'nut' | 'ho' | 'gam-thap' | 'cua' | 'bang' | 'vat-can' | 'robot' (ô bệ / robot khác dưới đất) | 'thung-nang' | 'vat' | 'chong-day' (chồng + số hạ > 4).
            Hạ được xuống '.', D, F, sàn màu, hay T khi tàu có mặt. Móc container đang nằm trên boong T khi tàu có mặt: được.
          LUẬT THÁP (cfg.luatThap = true, Tháp Hà Nội): hạ container số LỚN lên container số NHỎ hơn bị từ chối: 'thap-sai' { o, so, tren } (lỗi), vẫn treo.
        - MÁY QUÉT MÃ (cảm biến, CAM_QUET_HAM; cần rc.camBien có { ma: 'quet-ma' }; weight là nâng cấp, cần read_code trên khay). Đọc ô ĐẦU CẦN, không tốn nhịp (chung bộ đếm 1000 lần đọc liên tiếp):
          read_code() trả SỐ của container trên cùng, không có (hay ngoài sân) thì −1 (số âm dạy ở gói 3). weight() trả tổng tấn đang treo (cả hai nếu treo đôi); không treo thì tấn của container trên cùng ở đầu cần; không có gì thì 0.
          Sự kiện 'doc-cam-bien' { cam: 'quet-ma', ham, tu: ô bệ, nac, tam, o: đầu cần, so, tan, treo: số container đang treo, trong }.
          LUẬT TẢI (cfg.taiToiDa = M): tổng tấn đang treo × tầm phải ≤ M. pick_up / pick_up2 ở tầm làm vượt M: không nhấc; extend() khi đang treo mà làm vượt M: không vươn; cả hai 'qua-tai' { lenh, tan, tam, tai, taiToiDa, o, cont } (lỗi), mất nhịp.
        - RAY (nâng cấp thân, THAN_RAY; khay / phần cứng có rail thì bệ phải xuất phát trên R). Mọi ô R của sân phải là MỘT dải thẳng liền nhau từ 2 ô (ngang hay dọc; kết quả `ray` { doc, o }); khác là lỗi cấu hình.
          rail(n): n nguyên khác 0, abs(n) ≤ RAY_TOI_DA = 9, sai thì lỗi chạy 'ray-sai' (lời Việt; 'khong-ray' khi gọi mà không có bánh ray). Tốn ĐÚNG abs(n) nhịp: mỗi nhịp bệ chạy 1 ô ('chay-ray' { tu, den, huong, doc, dau }),
          n > 0 sang phải (ray ngang) / xuống (ray dọc), n < 0 ngược lại. Ô kế không phải ray / ngoài sân / có robot / vật / thùng, hay chạy tới thì ĐẦU CẦN lòi ra ngoài sân ('can-ngoai-san'): dừng, 'het-ray' { o, den, vat, n, daDi, lenh } (lỗi),
          CÁC NHỊP CÒN LẠI của lệnh vẫn trôi mà bệ đứng yên ('dung-yen'; quyết định 31/10: "phần còn lại bỏ" = bỏ quãng đường, không trả lại nhịp). Container treo đi theo bệ. Nhiều robot: duKienDi báo ô bệ định tới.
        - TÀU (cfg.tau): cuối nhịp (pha d, capNhatTau) tàu đổi trạng thái theo chu kỳ: vắng → có mặt 'tau-cap' { tau, o }; có mặt → vắng 'tau-roi' { tau, o, cont: [so] }: MỌI container đang nằm trên boong của tàu đó được GIAO
          (trangThai 'giao', rời sân, ghi vào daGiao[tau]), boong trống, lượt sau tàu về boong trống. Container đang TREO trên ô T không rơi (ở móc, không thuộc boong). Vết nhịp có mucVet.tau [{ coMat }] (cuối nhịp) và mucVet.chong khi sân có container.
          MỤC TIÊU 'giao-tau' (MUC_TIEU): cfg.giao = [{ tau: i, so: [..] }] (mỗi tàu một mục; so phải có trên sân); thắng cuối nhịp mà mọi số yêu cầu đã theo đúng tàu ('xong-giao-tau'; trùng số thì đếm đủ số lần).
          Tàu rời mang container KHÔNG có trong danh sách của tàu đó (hay tàu không có danh sách): thua ngay, dungSom = 'giao-nham', sự kiện 'giao-nham' { tau, so, o, can }. Kết quả: chong, chongBanDau, tau [{ o, co, vang, pha, coMat }], tauBanDau, daGiao [[so]], ray, taiToiDa, luatThap.
        - BÓNG MỜ CHỒNG (mục tiêu bong-mo): cần cẩu không cần bongMo.huong; không khai x, y thì bệ ở nguyên chỗ xuất phát. bongMo.chong = [{ x, y, so: [đáy → đỉnh] }]: lúc chạy xong MỌI chồng trên sân phải đúng — ô khai phải đúng dãy số
          (so: [] = trống), ô không khai phải trống, móc không còn treo gì; sai thì không thắng (cham.js: chua-xep-chong). Dùng cho bài sắp xếp / Tháp Hà Nội (cùng luatThap).
        - NHIỀU ROBOT: bệ chiếm ô như tường với xe dưới đất (xe đâm 'dong-doi'); xe đi qua ô R như sàn; đầu cần KHÔNG chặn ai (xe đứng dưới đầu cần được, nhưng set_down xuống ô có xe → ha-bi-chan 'robot'); rail bị xe chặn ('robot').
        - NHÂN (nhan/san-robot-core.js, 31/10): phép % đổi theo Python (kết quả cùng dấu số chia: -5 % 8 = 3) để bài "(b - a) % 8 lần swing_right()" chạy đúng; // vẫn Math.floor; abs / min / max có sẵn.

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
  // omni nâng cấp đi chéo (mùa 6 gói 5): tiến-trái / tiến-phải 1 ô trong 1 nhịp, giữ nguyên hướng mặt
  var OMNI_CHEO = ['diag_left', 'diag_right'];
  var OMNI_CHEO_BIEN = { diag_left: -1, diag_right: 1 };
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
  // cảm biến RADAR TRÒN (mùa 6, part 'radar' gắn trên nóc): radar() trả lưới 3x3 quanh robot; shape(huong) (nâng cấp nhận dạng hình khối) trả "round" | "square" | "ore" | "none"
  var CAM_RADAR_HAM = ['radar', 'shape'];
  var MA_CAM_RADAR = 'radar';
  var RADAR_HUONG = {
    front: { loai: 'mui', d: 0 }, right: { loai: 'mui', d: 1 }, back: { loai: 'mui', d: 2 }, left: { loai: 'mui', d: 3 },
    up: { loai: 'ban-do', d: 0 }, down: { loai: 'ban-do', d: 2 }, here: { loai: 'here', d: 0 }
  };
  var DANG_KY = { r: 'round', s: 'square', q: 'ore', o: 'ore', b: 'square' };
  var DANG_TEN = ['round', 'square', 'ore'];
  var SAN_DOC_HUONG = { '^': 0, '>': 1, 'v': 2, '<': 3, up: 0, right: 1, down: 2, left: 3 };
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
  // tay LOA (mùa 8 Hang động): note(n) chỉ ra lệnh phát nốt 1..8 ở nhịp kế; beat(n) ngân âm đang phát thêm n nhịp (1..8)
  var TAY_LOA = ['note', 'beat'];
  var NOT_TOI_DA = 8;                           // note(n): n = 1..8 (Đồ Rê Mi Pha Sol La Si Đố)
  var SO_NHIP_TOI_DA = 8;                       // beat(n): n = 1..8 nhịp
  // HANG ĐỘNG ĐÁ VÔI (mùa 8): thân Bánh gai ('gai'), thu/bung gai ('retract_spikes', 'extend_spikes'), cảm biến âm thanh ('am-thanh': 'hear', 'listen'), sàn đá ướt 'I', ngách hang ngầm, chuông đá, đá chuông
  var THAN_GAI = ['retract_spikes', 'extend_spikes'];
  var CAM_AM_THANH_HAM = ['hear', 'listen'];
  var MA_CAM_AM_THANH = 'am-thanh';
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
    diag_left: 'diag_right', diag_right: 'diag_left',
    crouch: 'stand', stand: 'crouch',
    arm_left: 'arm_right', arm_right: 'arm_left',
    spray: 'spray_back', spray_back: 'spray',
    pen_down: 'pen_up', pen_up: 'pen_down',
    retract_spikes: 'extend_spikes', extend_spikes: 'retract_spikes'
  };
  // đấu dây ngược / hỏng (cfg.daoChieu): bánh nào bị đảo thì lệnh của bánh đó chạy thành lệnh ngược
  var DAO_CHIEU_BANH = ['trai', 'phai'];
  var DAO_CHIEU_CUC = 'cuc';                    // dây cực nam châm đấu ngược (chương che-nam-cham): magnet_n() bật cực S thật, magnet_s() bật cực N thật (xem phần NAM CHÂM)
  var DAO_CHIEU_CAM = 'cam';                    // cảm biến khoảng cách lắp ngược: front_clear() / left_clear() / right_clear() trả NGƯỢC (xem phần ĐẤU DÂY NGƯỢC)
  // mục tiêu: 'toi-co' | 'dua-vat' | 'day-thung' | 'bong-mo' (đến đúng tư thế của "xe mờ" khi chạy xong, xem phần BÓNG MỜ)
  var DAO_CHIEU_SUNG = 'sung';                  // súng hơi lắp ngược (chương che-sung-hoi): spray() bắn ra sau (xe giật tới), spray_back() bắn ra trước (xe giật lùi)
  var DAO_CHIEU_LOA = 'loa';                    // loa đấu ngược dây (chương che-loa): note(n) phát nốt 9 - n (trầm ↔ bổng)
  var DAO_CHIEU_TAY = ['tay', 'kep', 'xoay'];   // tay kẹp lắp ngược (chương che-tay): 'tay' đổi chỗ arm_up ↔ arm_down, 'kep' đổi chỗ grab ↔ release; 'xoay' (chương che-tay-xoay) đổi chỗ arm_left ↔ arm_right (xem phần ĐẤU DÂY NGƯỢC)
  var MUC_TIEU = ['toi-co', 'dua-vat', 'day-thung', 'bong-mo', 'to-hinh', 'dap-lua', 'giao-tau', 'choi-dieu'];       // 'to-hinh': tô đúng hình mờ (xem phần MÁY SƠN); 'giao-tau': container lên đúng tàu (xem phần CẢNG SÔNG); 'choi-dieu': chơi đúng điệu nhạc (xem phần LOA)
  HAM_GOC.gai = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];   // BÁNH GAI (mùa 8 Hang động): đi như xe hai bánh, bám đá vôi ướt 'I' khi đang bung gai
  // BẾN SÔNG (mùa 5, 31/10; xem phần BẾN SÔNG): ô nước ~ Q q, cống K (đóng) / k (mở), van cống V, vật nổi B (bè) / L (lục bình); lớp cfg.dong (dòng chảy)
  var NUOC_KY = { '~': 'nuoc', 'Q': 'co', 'q': 'dich', 'K': 'cong', 'k': 'cong' };   // ký hiệu là MẶT NƯỚC (xuồng đi được; xe cạn đâm 'nuoc'; drone bay qua)
  var VAT_NOI_KY = { 'B': 'be', 'L': 'luc-binh' };                                   // vật nổi trên nước (ô dưới là nước), cùng luật, khác hình
  var THAN_NEO = ['anchor', 'unanchor'];          // xuồng nâng cấp thân: thả / nhổ neo (chỉ ra lệnh, làm ở nhịp wait() kế)
  var TAY_PHAO = ['cast_net', 'drop_net', 'set_length'];   // tay lưới thủy lợi của xuồng: tung lưới bắt vật nổi / thả lưới; nâng cấp set_length(n) thu / thả dây lưới (0 = kéo về khoang, 1..3 = độ dài dây)
  var HUONG_LUOI = { front: 0, right: 1, back: 2, left: 3 };   // hướng tung lưới tương đối theo mũi xuồng (mặc định "front")
  var DAI_LUOI_MAC_DINH = 2;                      // độ dài dây lưới mặc định khi chưa nâng cấp set_length (2 ô)
  var CAM_DONG_HAM = ['flow_dir', 'flow'];        // chong chóng dòng chảy: hướng dòng ở ô trước mũi theo mũi xuồng; flow() (nâng cấp) trả tuple (huong, suc)
  var MA_CAM_DONG = 'dong-chay';
  var TAM_KEO = 3;                                // độ dài dây lưới tối đa (set_length 1..3; gạt van V tối đa 3 ô)
  var HUONG_TUONG_DOI = ['front', 'right', 'back', 'left'];   // (hướng dòng − hướng mũi) mod 4 → lời chong chóng
  HAM_GOC.xuong = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];   // XUỒNG: hai chân vịt = hai bánh, dùng lại trọn luật xe bánh
  LENH_NGUOC.anchor = 'unanchor'; LENH_NGUOC.unanchor = 'anchor';
  LENH_NGUOC.cast_net = 'drop_net'; LENH_NGUOC.drop_net = 'cast_net';
  // CẢNG SÔNG (mùa 4, 31/10; xem phần CẢNG SÔNG): cần cẩu container. Ký hiệu T (boong tàu, trên nước), R (ray cẩu, sàn); lớp cfg.chong, cfg.tau, cfg.giao, cfg.taiToiDa, cfg.luatThap, bongMo.chong
  var CANG_KY = { 'T': 'boong', 'R': 'ray' };
  var NAC_VEC = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];   // 8 nấc cần: 0 lên, 1 lên-phải, 2 phải, 3 xuống-phải, 4 xuống, 5 xuống-trái, 6 trái, 7 lên-trái
  var SO_NAC = 8;
  var TAM_CAU_TOI_DA = 3;                         // tầm cần 1–3 ô
  var CHONG_TOI_DA = 4;                           // một chồng tối đa 4 container
  var RAY_TOI_DA = 9;                             // rail(n): abs(n) ≤ 9
  var CONT_SO_TOI_DA = 99, CONT_TAN_TOI_DA = 4;   // số in trên container 1–99, tấn 1–4
  var CAU_LENH = { swing_left: 'quay', swing_right: 'quay', extend: 'vuon', retract: 'vuon' };   // lệnh thân cần cẩu, mỗi lệnh một nhịp (tự trôi)
  var TAY_MOC = ['pick_up', 'set_down', 'pick_up2'];      // móc cẩu: nhấc / hạ; pick_up2 (nâng cấp) nhấc đôi
  var CAM_QUET_HAM = ['read_code', 'weight'];     // máy quét mã: read_code() số container trên cùng ở đầu cần (−1 nếu trống); weight() (nâng cấp cân tải) số tấn
  var MA_CAM_QUET = 'quet-ma';
  var THAN_RAY = ['rail'];                        // nâng cấp thân: rail(n) chạy bệ dọc ray abs(n) ô, tốn abs(n) nhịp
  HAM_GOC.cau = ['swing_left', 'swing_right', 'extend', 'retract', 'wait'];
  // M9B2 (4/11, lai mùa 9): part gắn lên cần cẩu, làm việc ở Ô ĐẦU CẦN — L1 nam châm (magnet_*), L8 gầu ngoạm (grab / release; không arm_*), L13 cảm biến từ (front_metal / front_pole) và camera bụng (look)
  var CAU_LAI_HAM = ['magnet_n', 'magnet_s', 'magnet_off', 'grab', 'release', 'front_metal', 'front_pole', 'look'];
  LENH_NGUOC.swing_left = 'swing_right'; LENH_NGUOC.swing_right = 'swing_left';
  LENH_NGUOC.extend = 'retract'; LENH_NGUOC.retract = 'extend';
  LENH_NGUOC.pick_up = 'set_down'; LENH_NGUOC.set_down = 'pick_up';

  /** Phần cứng mặc định của loại robot: trọn bộ lệnh của loại đó (xe bánh có cả bánh lùi) cộng các lệnh khay đã gắn thêm (tay, cảm biến…). */
  function phanCungMacDinh(loai, hamGoc) {
    var kq = (HAM_GOC[loai] || []).slice();
    (hamGoc || []).forEach(function (t) { if (kq.indexOf(t) < 0) kq.push(t); });
    return kq;
  }
  /** Phần cứng của một màn: man.phanCung nếu màn khai (màn hỏng), không thì mặc định của loại robot + khay (man.hamGoc). */
  function phanCungCua(man) {
    if (man.phanCung) return man.phanCung.slice();
    var kq = phanCungMacDinh(man.loaiRobot || 'banh', man.hamGoc);
    if ((man.loaiRobot === 'omni') && (man.omniCheo || (man.robot && man.robot.omniCheo))) {
      OMNI_CHEO.forEach(function (t) { if (kq.indexOf(t) < 0) kq.push(t); });
    }
    if ((man.loaiRobot === 'gai') && (man.thuGai || (man.robot && man.robot.thuGai))) {
      THAN_GAI.forEach(function (t) { if (kq.indexOf(t) < 0) kq.push(t); });
    }
    if (man.chinhLuc || (man.robot && man.robot.chinhLuc)) {
      if (kq.indexOf('aim') < 0) kq.push('aim');
    }
    if ((man.loaiRobot === 'xuong') && (man.chinhLuoi || (man.robot && man.robot.chinhLuoi))) {
      if (kq.indexOf('set_length') < 0) kq.push('set_length');
    }
    var cb = (man.robot && man.robot.camBien) || man.camBien || [];
    var cr = Array.isArray(cb) ? cb.filter(function (c) { return c && c.ma === MA_CAM_RADAR; })[0] : null;
    if (cr) {
      if (kq.indexOf('radar') < 0) kq.push('radar');
      if ((man.nhanDang || (man.robot && man.robot.nhanDang) || cr.nhanDang) && kq.indexOf('shape') < 0) kq.push('shape');
    } else if ((man.nhanDang || (man.robot && man.robot.nhanDang)) && kq.indexOf('radar') >= 0 && kq.indexOf('shape') < 0) {
      kq.push('shape');
    }
    var ca = Array.isArray(cb) ? cb.filter(function (c) { return c && c.ma === MA_CAM_AM_THANH; })[0] : null;
    if (ca) {
      if (kq.indexOf('hear') < 0) kq.push('hear');
      if ((man.phanAm || (man.robot && man.robot.phanAm) || ca.phanAm) && kq.indexOf('listen') < 0) kq.push('listen');
    } else if ((man.phanAm || (man.robot && man.robot.phanAm)) && kq.indexOf('hear') >= 0 && kq.indexOf('listen') < 0) {
      kq.push('listen');
    }
    return kq;
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

  /** Lớp hình dạng vật (mảng chuỗi cùng cỡ sân; r = round, s = square, q = ore, '.' hay khoảng trắng = không khai) → mảng hàng 'round' | 'square' | 'ore' | null. */
  function docLopDang(lop, rong, cao) {
    if (lop === undefined || lop === null) return null;
    if (!Array.isArray(lop) || lop.length !== cao) throw new Error('Lớp hình dạng vật phải là mảng ' + cao + ' chuỗi, cùng cỡ với sân.');
    return lop.map(function (hang, y) {
      if (typeof hang !== 'string' || hang.length !== rong) throw new Error('Lớp hình dạng vật dòng ' + (y + 1) + ' không cùng cỡ với sân.');
      var kq = [];
      for (var x = 0; x < rong; x++) {
        var c = hang[x];
        if (c === '.' || c === ' ') kq.push(null);
        else if (DANG_KY[c]) kq.push(DANG_KY[c]);
        else throw new Error('Ký hiệu lạ trong lớp hình dạng vật: "' + c + '" (' + x + ', ' + y + ').');
      }
      return kq;
    });
  }

  /** lopMau: lớp màu sàn (tuỳ chọn, xem phần CẢM BIẾN MÀU); lopVatMau: lớp màu vật (tuỳ chọn); lopVatChat: lớp chất vật sắt / gỗ (tuỳ chọn, xem phần NAM CHÂM); lopVatDang: lớp hình dạng vật (mùa 6). */
  function docSan(rows, lopMau, lopVatMau, lopVatChat, lopVatDang) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Sân phải là mảng chuỗi, không rỗng.');
    var rong = rows[0].length, co = null, vat = [], dich = [], thung = [], mau = null, nut = [], nutDe = [], banXoay = [], cong = [], congCap = {}, demCong = {}, cua = [], sac = [], gam = [], ho = [], daUot = [];
    var vatNoi = [], congNuoc = [], van = [], nuoc = {};               // BẾN SÔNG: vật nổi B / L, cống K / k, van V; nuoc['x,y'] = true cho mọi ô mặt nước
    var boong = [], ray = [];                                            // CẢNG SÔNG: ô boong tàu T (trên nước: tàu vắng là nước), ô ray cẩu R (sàn)
    for (var y = 0; y < rows.length; y++) {
      if (rows[y].length !== rong) throw new Error('Sân không phải hình chữ nhật (dòng ' + (y + 1) + ').');
      for (var x = 0; x < rong; x++) {
        var c = rows[y][x];
        if (NUOC_KY[c] || VAT_NOI_KY[c] || c === 'T') nuoc[x + ',' + y] = true;    // vật nổi nằm trên nước: ô dưới nó cũng là mặt nước; boong tàu T cũng trên nước
        if (c === 'F' || c === 'Q') { if (!co) co = { x: x, y: y }; }            // Q: phao đích trên nước (cờ của xuồng)
        else if (c === '~') { }
        else if (c === 'T') boong.push({ x: x, y: y });                              // CẢNG SÔNG: ô boong tàu (cfg.tau nói tàu nào, cập / rời lúc nào)
        else if (c === 'R') ray.push({ x: x, y: y });                                // CẢNG SÔNG: ray cẩu (sàn với xe khác)
        else if (c === 'q') dich.push({ x: x, y: y });                              // bến nhận bè: ô đích trên nước
        else if (VAT_NOI_KY[c]) vatNoi.push({ x: x, y: y, noi: VAT_NOI_KY[c] });
        else if (c === 'K') congNuoc.push({ x: x, y: y, mo: false });
        else if (c === 'k') congNuoc.push({ x: x, y: y, mo: true });
        else if (c === 'V') van.push({ x: x, y: y });
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
        else if (c === 'I') daUot.push({ x: x, y: y });                // đá vôi ướt (mùa 8 Hang động): bánh gai bung gai bám chắc, xe khác / thu gai trượt thẳng
        else if (MAU_KY[c]) {                                          // sàn màu (r g b y)
          if (!mau) mau = newMau(rong, rows.length);
          mau[y][x] = MAU_KY[c];
        }
        else if ('.#=SPnuI'.indexOf(c) < 0 && BANG[c] === undefined) {
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
    var lopD = docLopDang(lopVatDang, rong, rows.length);                      // hình dạng từng vật (mùa 6): round | square | ore
    if (lopD) {
      for (var dy = 0; dy < rows.length; dy++) for (var dx = 0; dx < rong; dx++) {
        if (!lopD[dy][dx]) continue;
        var di = -1;
        for (var dq = 0; dq < vat.length; dq++) if (vat[dq].x === dx && vat[dq].y === dy) di = dq;
        if (di < 0) throw new Error('Hình dạng vật đặt ở ô (' + dx + ', ' + dy + ') nhưng ô đó không có vật (o / X).');
        vat[di].dang = lopD[dy][dx];
      }
    }
    dich.forEach(function (d) { if (mau && mau[d.y][d.x]) d.mau = mau[d.y][d.x]; });      // ô đích có màu → chỉ nhận vật cùng màu
    // vat: các vật nằm sẵn (ký hiệu o, X) theo thứ tự đọc từng hàng (có thêm mau nếu vật có màu); dich: các ô đích (D, X, h; có thêm mau nếu ô đó có màu);
    // thung: thùng nặng (H, h); nut: các nút bắn (N); nutDe: các nút đè giữ trên sàn (M); banXoay: bàn xoay (@ phải, % trái); cong: cổng dịch chuyển (1, 2); cua: các cửa (C đóng, c mở: { x, y, mo }); sac: các ô sạc pin của drone (P); mau: null (sân không màu) hay mảng hàng tên màu / null
    // BẾN SÔNG: vatNoi [{x,y,noi:'be'|'luc-binh'}] vật nổi (B / L); congNuoc [{x,y,mo}] cống (K đóng / k mở); van [{x,y}] van cống (V); nuoc: 'x,y' → true cho ô mặt nước (~ Q q K k)
    // CẢNG SÔNG: boong [{x,y}] ô boong tàu (T, cũng là nước); ray [{x,y}] ô ray cẩu (R)
    return { o: rows.slice(), rong: rong, cao: rows.length, co: co, vat: vat, dich: dich, thung: thung, mau: mau, nut: nut, nutDe: nutDe, banXoay: banXoay, cong: cong, congCap: congCap, cua: cua, sac: sac, gam: gam, ho: ho, daUot: daUot, vatNoi: vatNoi, congNuoc: congNuoc, van: van, nuoc: nuoc, boong: boong, ray: ray };
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
    function layMang(l) { return l ? (nhieu && Array.isArray(l) && Array.isArray(l[0]) ? (l[i] || null) : l) : null; }
    var dieuSan = !m.dieu ? null : (nhieu && Array.isArray(m.dieu) && (Array.isArray(m.dieu[0]) || (typeof m.dieu[0] === 'string' && m.dieu[0].length > 1)) ? (m.dieu[i] || null) : m.dieu);
    return { mau: lay(m.mau), vatMau: lay(m.vatMau), vatChat: lay(m.vatChat), vatDang: lay(m.vatDang), vatThem: lay(m.vatThem), thungThem: lay(m.thungThem), cuaNhip: lay(m.cuaNhip), noi: lay(m.noi), nutBat: lay(m.nutBat), lua: lay(m.lua), demTu: lay(m.demTu), sanDoc: lay(m.sanDoc), bongMo: lay(m.bongMo), hinh: lay(m.hinh), sonBanDau: lay(m.sonBanDau), dong: lay(m.dong),
      chong: lay(m.chong), tau: lay(m.tau), giao: lay(m.giao),
      dieu: dieuSan, ngachHang: layMang(m.ngachHang), chuongDa: layMang(m.chuongDa || m.danDoi), daChuong: layMang(m.daChuong) };
  }
  function laLenhSon(t) { return TAY_SON.indexOf(t) >= 0; }
  function laLenhLoa(t) { return TAY_LOA.indexOf(t) >= 0; }
  function laSoNguyen(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }
  /** Chuỗi giai điệu (vd '1155.x3' hay mảng [1, 1, 5, 5, null, 'x', 3]) → mảng mục: 1…8 = nốt, 'x' = trống, null = nhịp lặng / ngân. */
  function docDieu(chuoi, choPhepLang) {
    if (chuoi === undefined || chuoi === null) return null;
    var kq = [];
    if (typeof chuoi === 'string') {
      for (var i = 0; i < chuoi.length; i++) {
        var c = chuoi[i];
        if (c === ' ') continue;
        if (c === '.' || c === '0' || c === '-') kq.push(null);
        else if (c === 'x' || c === 'X') kq.push('x');
        else if (c >= '1' && c <= '8') kq.push(+c);
        else throw new Error('Ký hiệu lạ trong giai điệu: "' + c + '" (chỉ dùng 1…8, x hoặc .).');
      }
    } else if (Array.isArray(chuoi)) {
      chuoi.forEach(function (x) {
        if (x === null || x === 0 || x === '.' || x === '-') kq.push(null);
        else if (x === 'x' || x === 'X') kq.push('x');
        else if (laSoNguyen(x) && x >= 1 && x <= NOT_TOI_DA) kq.push(x);
        else throw new Error('Mục lạ trong giai điệu: "' + x + '".');
      });
    } else throw new Error('dieu phải là chuỗi hoặc mảng.');
    if (!kq.some(function (x) { return x !== null; })) throw new Error('Giai điệu phải có ít nhất một tiếng (nốt hoặc trống).');
    if (kq[0] === null && !choPhepLang) throw new Error('Giai điệu bắt đầu từ tiếng đầu tiên nên mục đầu không phải dấu lặng.');
    if (kq[kq.length - 1] === null && !choPhepLang) throw new Error('Giai điệu không kết thúc bằng dấu lặng (dùng dieuToiCo nếu cần đi tiếp tới cờ sau khi hát xong).');
    return kq;
  }
  /** Giai điệu hai bè cho đội 2 robot: { r1: chuỗi/mảng, r2: chuỗi/mảng } cùng số nhịp (ít nhất một bè có tiếng đầu). */
  function docDieuDoi(d) {
    if (!d || typeof d !== 'object' || Array.isArray(d) || d.r1 === undefined || d.r2 === undefined) {
      throw new Error('Giai điệu đội (choi-dieu với doi) cần dieu = { r1, r2 }.');
    }
    var r1 = docDieu(d.r1, true), r2 = docDieu(d.r2, true);
    if (r1.length !== r2.length) throw new Error('Hai bè r1 (' + r1.length + ') và r2 (' + r2.length + ') phải cùng số nhịp.');
    if (r1[0] === null && r2[0] === null) throw new Error('Giai điệu đội phải có ít nhất một robot phát âm ở nhịp đầu.');
    return { r1: r1, r2: r2 };
  }
  function laHamCamBien(t) { return CAM_BIEN_HAM[t] !== undefined || CAM_MAU_HAM.indexOf(t) >= 0 || CAM_NHIN_HAM.indexOf(t) >= 0 || CAM_TU_HAM.indexOf(t) >= 0 || CAM_PIN_HAM.indexOf(t) >= 0 || CAM_HONG_NGOAI_HAM.indexOf(t) >= 0 || CAM_RADAR_HAM.indexOf(t) >= 0 || CAM_DONG_HAM.indexOf(t) >= 0 || CAM_QUET_HAM.indexOf(t) >= 0 || CAM_AM_THANH_HAM.indexOf(t) >= 0; }
  /** Ô (x, y) là MẶT NƯỚC (~ Q q K k; cống đóng vẫn là nước nhưng chặn như cửa: chay() xét thêm). */
  function laNuoc(san, x, y) { return !!(san.nuoc && san.nuoc[x + ',' + y]); }   // sân dựng tay (máy kiểm gọi lyDoChan) có thể không có bảng nuoc

  function oTai(san, x, y) {
    if (x < 0 || y < 0 || x >= san.rong || y >= san.cao) return null;   // ngoài sân
    return san.o[y][x];
  }

  /** Robot loại `loai` có vào được ô (x, y) không? Trả về null nếu được,
   *  hoặc lý do bị chặn: 'ngoai-san' | 'tuong' | 'rao' | 'nut' | 'bac-thang'. Drone bay qua '=' và 'S'. (Cửa đóng là trạng thái động: chay() tự xét thêm, xem SÚNG HƠI.) */
  function lyDoChan(san, loai, x, y) {
    var c = oTai(san, x, y);
    if (c === null) return 'ngoai-san';
    if (loai === 'xuong') return laNuoc(san, x, y) ? null : 'bo';                  // XUỒNG: chỉ ô mặt nước; mọi ô khác là BỜ (cống đóng, vật nổi, robot: chay() xét thêm)
    if (laNuoc(san, x, y) && loai !== 'drone') return 'nuoc';                        // xe cạn / nhện: nước là tường (không chìm); cầu phao (vật nổi trên nước êm) chay() xét thêm
    if (c === 'V') return 'van';                                                     // van cống trên bờ: chiếm ô như nút N
    if (c === '#') return 'tuong';
    if (c === '=' && loai !== 'drone') return 'rao';          // drone bay qua hàng rào thấp
    if (c === 'N') return 'nut';
    if (c === 'S' && (loai === 'banh' || loai === 'omni' || loai === 'gai')) return 'bac-thang';
    if (c === 'n' && loai !== 'nhen' && loai !== 'drone') return 'gam-thap';       // gầm thấp: nhện chui được khi co chân (chay() xét thêm theo chân), drone bay qua, thân khác không vào
    if (san.demTu && san.demTu[x + ',' + y] && loai !== 'drone') return 'dem-tu';  // ĐỆM TỪ (mùa 3, cfg.demTu): ô đệm là KHỐI, mọi thân dưới đất đâm như tường; drone bay qua
    return null;
  }

  /* ----------------------------------------------------------------- chạy */

  /**
   * Chạy một chương trình Python trên một sân.
   * cfg: { san: [chuỗi], batDau: {x,y,huong}, loaiRobot: 'banh'|'nhen'|'xich'|'omni'|'drone'|'xuong'|'cau' (xuồng: phần BẾN SÔNG; cần cẩu: phần CẢNG SÔNG, có batDau.nac / tam, cfg.chong / tau / giao / taiToiDa / luatThap),
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
    var san = docSan(cfg.san, cfg.mau, cfg.vatMau, cfg.vatChat, cfg.vatDang);
    var daLapHo = !!cfg.daLapHo;
    var sanDocMap = {}, sanDocList = [];
    if (cfg.sanDoc) {
      if (Array.isArray(cfg.sanDoc) && typeof cfg.sanDoc[0] === 'string') {
        if (cfg.sanDoc.length !== san.cao) throw new Error('sanDoc dạng chuỗi phải cùng chiều cao với sân.');
        for (var sdy = 0; sdy < san.cao; sdy++) {
          var hsd = cfg.sanDoc[sdy];
          if (typeof hsd !== 'string' || hsd.length !== san.rong) throw new Error('sanDoc dòng ' + (sdy + 1) + ' không cùng chiều rộng với sân.');
          for (var sdx = 0; sdx < san.rong; sdx++) {
            var csd = hsd[sdx];
            if (csd === '.' || csd === ' ') continue;
            if (SAN_DOC_HUONG[csd] === undefined) throw new Error('Ký hiệu sanDoc lạ: "' + csd + '".');
            sanDocMap[sdx + ',' + sdy] = SAN_DOC_HUONG[csd];
            sanDocList.push({ x: sdx, y: sdy, huong: SAN_DOC_HUONG[csd] });
          }
        }
      } else if (Array.isArray(cfg.sanDoc)) {
        cfg.sanDoc.forEach(function (o) {
          if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') return;
          var h = typeof o.huong === 'number' ? o.huong : SAN_DOC_HUONG[o.huong];
          if (h === undefined || h < 0 || h > 3) throw new Error('Hướng sanDoc lạ: ' + o.huong);
          var x = Math.floor(o.x), y = Math.floor(o.y);
          sanDocMap[x + ',' + y] = h;
          sanDocList.push({ x: x, y: y, huong: h });
        });
      }
    }
    var nhipToiDa = cfg.nhipToiDa || 200;
    var sacSet = {};
    san.sac.forEach(function (q) { sacSet[q.x + ',' + q.y] = true; });
    if (laDoi && mucTieu === 'bong-mo') throw new Error('Mục tiêu bong-mo chưa dùng cho nhiều robot.');
    if (laDoi && mucTieu === 'dap-lua') throw new Error('Mục tiêu dap-lua chưa dùng cho nhiều robot (màn đội có lửa dùng toi-co: lửa chắn lối).');

    // biến RIÊNG của từng robot: nhiều robot thì đổi theo robot đang xét (catRobot / napRobot); biến của sân (vật, thùng, cửa, nút, nhịp…) dùng chung
    var
      loai, laBanh, laDrone, bd, chan, hamGoc, phanCung, khayThieu, nguonDong, api, coTay, coXoay,
      coNamCham, coNem, coHoi, coCamBien, coCamTu, coColor, dsCamBien, coCamMauBung, coCamera, camNhin, coPinCamBien, coLook,
      coCamBay, pinToiDa, pin, dao, rb, demBang, quayDo, lenh, lenhTon, tayCho, chanCho, nhayBuoc,
      truotCho, ncCho, nc, nem, nemCho, hoiCho, dan, vet, suKienChan, loi, docCho, docLienTiep,
      soLanDoc, traVe, tay, hangNhip, xeToiCo, coRieng, coSon, son, sonCho, lucBan, laR1, coHongNgoai, xichDay, beSung, coDap, dau, coCam4, cam4TaiCho,
      coOmniCheo, coChinhLuc, coRadar, coRadarNhanDang, vuaCheo,
      laXuong, coNeo, coPhao, coSetLength, daiLuoi, coDongChay, neo, keo, neoCho, phaoCho,   // BẾN SÔNG: xuồng, neo, tay lưới, chong chóng
      laCau, coMoc, coMoc2, coQuetMa, coCan, coRay, nac, tam, treo,         // CẢNG SÔNG: cần cẩu (nấc 0–7, tầm 1–3, container đang treo đáy → đỉnh), móc, móc đôi, máy quét mã, cân tải, ray
      coLoa, loa, loaCho, loaNgan, laGai, coThuGai, gai, gaiCho, coAmThanh, coPhanAm;   // HANG ĐỘNG (mùa 8): loa, bánh gai, thu/bung gai, cảm biến âm thanh
    var nhip = 0, thang = false, dungSom = null;
    function dsCamBienCo(rc, ma) { return Array.isArray(rc.camBien) && rc.camBien.some(function (c) { return c && c.ma === ma; }); }
    var damLaThua = !!cfg.damLaThua;                                       // HD2: màn ép, đâm tường (mọi loại vật cản) là thua, dừng ngay cuối nhịp đó
    /** Dựng phần riêng của một robot từ cấu hình rc (một robot: chính cfg; nhiều robot: cfg gộp với cfg.doi[i]). */
    function khoiRobot(rc) {
      laR1 = rc === dsRc[0];                                               // robot của người chơi (đối kháng: R1)
      loai = rc.loaiRobot || 'banh';
      if (loai !== 'banh' && loai !== 'nhen' && loai !== 'xich' && loai !== 'omni' && loai !== 'drone' && loai !== 'xuong' && loai !== 'cau' && loai !== 'gai') throw new Error('Loại robot lạ: ' + loai);
      laBanh = loai === 'banh' || loai === 'xich' || loai === 'omni' || loai === 'xuong' || loai === 'gai';      // dùng chung bộ lệnh bánh (xuồng: hai chân vịt; bánh gai: mùa 8 Hang động)
      laGai = loai === 'gai';
      laXuong = loai === 'xuong';
      laCau = loai === 'cau';                                               // CẦN CẨU (Cảng sông): bệ đứng yên (trừ ray), cần quay 8 nấc / vươn 3 tầm, mỗi lệnh một nhịp
      laDrone = loai === 'drone';                                          // drone: bay 4 hướng tuyệt đối, 1 nhịp / ô, có pin tuỳ chọn
      bd = rc.batDau;
      if (!bd) throw new Error('Thiếu vị trí xuất phát (batDau).');
      if (lyDoChan(san, loai, bd.x, bd.y)) throw new Error(laXuong ? 'Xuồng phải xuất phát trên ô mặt nước (~).' : lyDoChan(san, loai, bd.x, bd.y) === 'nuoc' ? 'Robot cạn không xuất phát trên mặt nước.' : 'Robot xuất phát trong chỗ không đứng được.');
      if (laCau) {                                                          // bệ cẩu đứng trên sàn thường, ô đích, sàn màu hay ray (không băng chuyền, bàn xoay, cổng, cửa: bệ không bị đẩy)
        var cBe = oTai(san, bd.x, bd.y);
        if (!(cBe === '.' || cBe === 'D' || cBe === 'R' || MAU_KY[cBe])) throw new Error('Bệ cẩu phải đứng trên sàn ".", ô đích D, sàn màu hay ray R (không đứng trên băng chuyền, bàn xoay, cổng, cửa).');
        if (bd.nac !== undefined && bd.nac !== null && !(laSoNguyen(bd.nac) && bd.nac >= 0 && bd.nac < SO_NAC)) throw new Error('batDau.nac (nấc cần lúc đầu) phải là số nguyên 0–7.');
        if (bd.tam !== undefined && bd.tam !== null && !(laSoNguyen(bd.tam) && bd.tam >= 1 && bd.tam <= TAM_CAU_TOI_DA)) throw new Error('batDau.tam (tầm cần lúc đầu) phải là 1, 2 hoặc 3.');
        if (bd.huong !== undefined && bd.huong !== null && bd.huong !== 0) throw new Error('Cần cẩu không có hướng mặt: dùng batDau.nac (0–7) thay cho huong.');
      } else if (bd.nac !== undefined || bd.tam !== undefined) throw new Error('batDau.nac / batDau.tam chỉ dùng cho cần cẩu (loaiRobot "cau").');
      if (laXuong && oTai(san, bd.x, bd.y) === 'K') throw new Error('Xuồng không xuất phát trong cống đang đóng.');
      if (laXuong && san.vatNoi.some(function (q) { return q.x === bd.x && q.y === bd.y; })) throw new Error('Xuồng không xuất phát trên ô có vật nổi.');
      if (oTai(san, bd.x, bd.y) === 'u' && loai !== 'drone') throw new Error('Robot xuất phát ngay trên cái hố.');
      if (bd.chan !== undefined && bd.chan !== null && bd.chan !== 'co' && bd.chan !== 'dung') throw new Error('batDau.chan phải là "dung" hoặc "co".');
      if (bd.chan === 'co' && loai !== 'nhen') throw new Error('batDau.chan chỉ dùng cho nhện (chân co / duỗi).');
      chan = bd.chan === 'co' ? 'co' : 'dung';                              // nhện: tư thế chân hiện tại 'dung' | 'co' (xem phần CHÂN NHỆN)
      if (loai === 'nhen' && oTai(san, bd.x, bd.y) === 'n' && chan !== 'co') throw new Error('Nhện xuất phát trong ô gầm thấp thì chân phải đang co (batDau.chan "co").');

      hamGoc = (rc.hamGoc || HAM_GOC[loai]).slice();                        // KHAY (xem phần KHAY VÀ PHẦN CỨNG)
      dsCamBien = Array.isArray(rc.camBien) ? rc.camBien : (rc.robot && Array.isArray(rc.robot.camBien) ? rc.robot.camBien : []);
      var cRadar = dsCamBien.filter(function (c) { return c && c.ma === MA_CAM_RADAR; })[0];
      if (loai === 'omni' && (rc.omniCheo || (rc.robot && rc.robot.omniCheo))) {
        OMNI_CHEO.forEach(function (t) { if (hamGoc.indexOf(t) < 0 && (!rc.phanCung || rc.phanCung.indexOf(t) >= 0)) hamGoc.push(t); });
      }
      if (loai === 'gai' && (rc.thuGai || (rc.robot && rc.robot.thuGai))) {
        THAN_GAI.forEach(function (t) { if (hamGoc.indexOf(t) < 0 && (!rc.phanCung || rc.phanCung.indexOf(t) >= 0)) hamGoc.push(t); });
      }
      if ((rc.tay === 'loa' || (rc.robot && rc.robot.tay === 'loa')) && !rc.hamGoc) {
        TAY_LOA.forEach(function (t) { if (hamGoc.indexOf(t) < 0 && (!rc.phanCung || rc.phanCung.indexOf(t) >= 0)) hamGoc.push(t); });
      }
      if ((rc.tay === 'nem' || (rc.robot && rc.robot.tay === 'nem')) && !rc.hamGoc) {
        ['load', 'throw'].forEach(function (t) { if (hamGoc.indexOf(t) < 0 && (!rc.phanCung || rc.phanCung.indexOf(t) >= 0)) hamGoc.push(t); });
      }
      if ((rc.chinhLuc || (rc.robot && rc.robot.chinhLuc)) && (hamGoc.indexOf('load') >= 0 || hamGoc.indexOf('throw') >= 0 || rc.tay === 'nem' || (rc.robot && rc.robot.tay === 'nem'))) {
        if (hamGoc.indexOf('aim') < 0 && (!rc.phanCung || rc.phanCung.indexOf('aim') >= 0)) hamGoc.push('aim');
      }
      if (cRadar) {
        if (hamGoc.indexOf('radar') < 0 && (!rc.phanCung || rc.phanCung.indexOf('radar') >= 0)) hamGoc.push('radar');
        if ((rc.nhanDang || (rc.robot && rc.robot.nhanDang) || cRadar.nhanDang) && hamGoc.indexOf('shape') < 0 && (!rc.phanCung || rc.phanCung.indexOf('shape') >= 0)) hamGoc.push('shape');
      } else if ((rc.nhanDang || (rc.robot && rc.robot.nhanDang)) && hamGoc.indexOf('radar') >= 0 && hamGoc.indexOf('shape') < 0 && (!rc.phanCung || rc.phanCung.indexOf('shape') >= 0)) {
        hamGoc.push('shape');
      }
      var cAmThanh = dsCamBien.filter(function (c) { return c && c.ma === MA_CAM_AM_THANH; })[0];
      if (cAmThanh) {
        if (hamGoc.indexOf('hear') < 0 && (!rc.phanCung || rc.phanCung.indexOf('hear') >= 0)) hamGoc.push('hear');
        if ((rc.phanAm || (rc.robot && rc.robot.phanAm) || cAmThanh.phanAm) && hamGoc.indexOf('listen') < 0 && (!rc.phanCung || rc.phanCung.indexOf('listen') >= 0)) hamGoc.push('listen');
      } else if ((rc.phanAm || (rc.robot && rc.robot.phanAm)) && hamGoc.indexOf('hear') >= 0 && hamGoc.indexOf('listen') < 0 && (!rc.phanCung || rc.phanCung.indexOf('listen') >= 0)) {
        hamGoc.push('listen');
      }
      function kiemTenGoc(t) {
        if (loai !== 'cau' && (TAY_MOC.indexOf(t) >= 0 || (CAM_QUET_HAM.indexOf(t) >= 0 && loai !== 'xuong') || THAN_RAY.indexOf(t) >= 0)) throw new Error('Hàm gốc "' + t + '" chỉ dành cho cần cẩu (loaiRobot "cau").');   // M9B2 (L2): xuồng gắn đầu đọc mã
        if (loai === 'cau' && TAY_LENH.indexOf(t) >= 0 && t !== 'grab' && t !== 'release') throw new Error('Gầu ngoạm của cần cẩu chỉ có grab() / release(): gầu thả từ đầu cần xuống, không có "' + t + '()" (nâng, hạ, xoay tay).');
        if (loai === 'cau' && HAM_GOC.cau.indexOf(t) < 0 && TAY_MOC.indexOf(t) < 0 && CAM_QUET_HAM.indexOf(t) < 0 && THAN_RAY.indexOf(t) < 0 && CAU_LAI_HAM.indexOf(t) < 0) throw new Error('Hàm gốc "' + t + '" không thuộc loại robot cau: cần cẩu không có bánh, tay kẹp hay cảm biến khác (chỉ quay / vươn cần, móc cẩu, máy quét mã, ray).');
        if (HAM_GOC[loai].indexOf(t) < 0 && TAY_LENH.indexOf(t) < 0 && CAM_BIEN_HAM[t] === undefined && CAM_MAU_HAM.indexOf(t) < 0 && CAM_NHIN_HAM.indexOf(t) < 0 && TAY_NAM_CHAM.indexOf(t) < 0 && CAM_TU_HAM.indexOf(t) < 0 && TAY_NEM.indexOf(t) < 0 && TAY_HOI.indexOf(t) < 0 && TAY_SON.indexOf(t) < 0 && TAY_LOA.indexOf(t) < 0 && CAM_PIN_HAM.indexOf(t) < 0 && CAM_HONG_NGOAI_HAM.indexOf(t) < 0 && CAM_RADAR_HAM.indexOf(t) < 0 && CAM_AM_THANH_HAM.indexOf(t) < 0 && !(loai === 'drone' && DRONE_DAP.indexOf(t) >= 0) && !(loai === 'omni' && OMNI_CHEO.indexOf(t) >= 0) && !(loai === 'gai' && THAN_GAI.indexOf(t) >= 0) &&
          !(loai === 'xuong' && (THAN_NEO.indexOf(t) >= 0 || TAY_PHAO.indexOf(t) >= 0 || CAM_DONG_HAM.indexOf(t) >= 0 || CAM_QUET_HAM.indexOf(t) >= 0)) &&
          !(loai === 'cau' && (TAY_MOC.indexOf(t) >= 0 || CAM_QUET_HAM.indexOf(t) >= 0 || THAN_RAY.indexOf(t) >= 0))) {
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
      coOmniCheo = loai === 'omni' && !!(rc.omniCheo || (rc.robot && rc.robot.omniCheo) || hamGoc.indexOf('diag_left') >= 0 || hamGoc.indexOf('diag_right') >= 0);
      if (loai === 'omni') OMNI_CHEO.forEach(function (t) { api[t] = function () { return 0; }; });
      coThuGai = loai === 'gai' && !!(rc.thuGai || (rc.robot && rc.robot.thuGai) || hamGoc.indexOf('retract_spikes') >= 0 || hamGoc.indexOf('extend_spikes') >= 0 || phanCung.indexOf('retract_spikes') >= 0 || phanCung.indexOf('extend_spikes') >= 0);
      if (loai === 'gai') THAN_GAI.forEach(function (t) { api[t] = function () { return 0; }; });
      if (coThuGai && (phanCung.indexOf('retract_spikes') >= 0) !== (phanCung.indexOf('extend_spikes') >= 0) && rc.phanCung) throw new Error('retract_spikes() và extend_spikes() đi cùng nhau trên phần cứng của bánh gai.');
      coTay = hamGoc.some(function (t) { return TAY_LENH.indexOf(t) >= 0; });
      coXoay = hamGoc.some(function (t) { return TAY_XOAY.indexOf(t) >= 0; });           // tay XOAY: khớp xoay giữa trái / trước / phải (xem phần TAY XOAY)
      if (coXoay && !laBanh) throw new Error('Tay xoay chỉ gắn lên xe có bánh (xe bánh, xích, omni): nhện và drone không có.');
      coNamCham = hamGoc.some(function (t) { return TAY_NAM_CHAM.indexOf(t) >= 0; });     // tay nam châm (magnet_n / magnet_s / magnet_off)
      if (coNamCham && coTay) throw new Error('Một robot chỉ có một tay: nam châm không đi chung với tay kẹp.');
      // Nhện + nam châm = NAM CHÂM BỤNG (mùa 3; xem phần NAM CHÂM): luật treo như drone qua ncBung(); không còn cấm "Nhện không gắn nam châm" (trước P1 mùa 3).
      coNem = hamGoc.some(function (t) { return TAY_NEM.indexOf(t) >= 0; });                  // tay máy ném (aim / throw / load)
      coChinhLuc = coNem && !!(rc.chinhLuc || (rc.robot && rc.robot.chinhLuc) || (hamGoc.indexOf('aim') >= 0 && rc.chinhLuc !== false));
      if (coNem && !rc.phanCung) api.aim = function () { return 0; };
      if (coNem && loai === 'nhen') throw new Error('Nhện không gắn máy ném (nhện không có hướng mặt).');
      if (coNem && (coTay || coNamCham)) throw new Error('Một robot chỉ có một tay: máy ném không đi chung với tay kẹp hay nam châm.');
      coHoi = hamGoc.some(function (t) { return TAY_HOI.indexOf(t) >= 0; });                  // tay súng hơi (spray / spray_back)
      if (coHoi && loai === 'nhen') throw new Error('Nhện không gắn vòi phun (nhện không có hướng mặt).');
      if (coHoi && (coTay || coNamCham || coNem)) throw new Error('Một robot chỉ có một tay: vòi phun không đi chung với tay kẹp, nam châm hay máy ném.');
      coNeo = phanCung.some(function (t) { return THAN_NEO.indexOf(t) >= 0; });                // XUỒNG nâng cấp thân: neo (anchor / unanchor)
      coPhao = phanCung.some(function (t) { return TAY_PHAO.indexOf(t) >= 0; });               // XUỒNG tay lưới thủy lợi (cast_net / drop_net; nâng cấp set_length)
      coSetLength = coPhao && !!(rc.chinhLuoi || (rc.robot && rc.robot.chinhLuoi) || (phanCung.indexOf('set_length') >= 0 && rc.chinhLuoi !== false));
      if (coPhao && !rc.phanCung) api.set_length = function () { return 0; };
      coDongChay = hamGoc.some(function (t) { return CAM_DONG_HAM.indexOf(t) >= 0; });          // XUỒNG chong chóng dòng chảy (flow_dir / flow)
      if (laXuong && (coTay || coNamCham || coNem || coHoi)) throw new Error('Xuồng chỉ gắn tay lưới thủy lợi (cast_net / drop_net / set_length), không gắn tay kẹp, nam châm, máy ném hay vòi phun.');
      if (coPhao && (phanCung.indexOf('cast_net') >= 0) !== (phanCung.indexOf('drop_net') >= 0)) throw new Error('cast_net() và drop_net() đi cùng nhau trên phần cứng của xuồng.');
      if (coSetLength && phanCung.indexOf('cast_net') < 0) throw new Error('set_length() là nâng cấp của tay lưới: phần cứng phải có cả cast_net() / drop_net().');
      if (coNeo && (phanCung.indexOf('anchor') >= 0) !== (phanCung.indexOf('unanchor') >= 0)) throw new Error('anchor() và unanchor() đi cùng nhau trên phần cứng của xuồng.');
      if (coDongChay && !dsCamBienCo(rc, MA_CAM_DONG)) throw new Error('flow_dir() / flow() cần xuồng gắn chong chóng dòng chảy (rc.camBien có { ma: "dong-chay" }).');
      coMoc = phanCung.some(function (t) { return TAY_MOC.indexOf(t) >= 0; });                  // CẦN CẨU tay móc cẩu (pick_up / set_down; nâng cấp pick_up2)
      coMoc2 = phanCung.indexOf('pick_up2') >= 0;
      coQuetMa = hamGoc.some(function (t) { return CAM_QUET_HAM.indexOf(t) >= 0; });            // CẦN CẨU máy quét mã (read_code; nâng cấp weight)
      coCan = hamGoc.indexOf('weight') >= 0;
      coRay = phanCung.indexOf('rail') >= 0;                                                     // CẦN CẨU nâng cấp thân: chạy trên ray
      if (coMoc && (phanCung.indexOf('pick_up') >= 0) !== (phanCung.indexOf('set_down') >= 0)) throw new Error('pick_up() và set_down() đi cùng nhau trên phần cứng của cần cẩu.');
      if (coMoc2 && phanCung.indexOf('pick_up') < 0) throw new Error('pick_up2() (nhấc đôi) là nâng cấp của móc cẩu: phần cứng phải có cả pick_up() / set_down().');
      if (coQuetMa && !dsCamBienCo(rc, MA_CAM_QUET)) throw new Error('read_code() / weight() cần cần cẩu gắn máy quét mã (rc.camBien có { ma: "quet-ma" }).');
      if (coCan && hamGoc.indexOf('read_code') < 0) throw new Error('weight() (cân tải) là nâng cấp của máy quét mã: khay phải có cả read_code().');
      if (coRay && laCau && oTai(san, bd.x, bd.y) !== 'R') throw new Error('Cần cẩu có rail() phải xuất phát trên ô ray R.');
      if (laCau && coMoc && (coTay || coNamCham)) throw new Error('Một robot chỉ có một tay: móc cẩu không đi chung với gầu ngoạm hay nam châm trên đầu cần.');   // M9B2
      coSon = hamGoc.some(laLenhSon);                                                         // đầu MÁY SƠN (ink / dot / pen_down / pen_up)
      // M9B1 (4/11, lai L6): NHỆN + BỘ GIEO HẠT — đầu sơn treo dưới bụng nhện như drone: dot() / ink() / pen_down() / pen_up() tô (hay rắc cát) Ô DƯỚI BỤNG, lệnh làm ở nhịp đầu của bước go_* hay ở nhịp wait()
      if (coSon && !laBanh && !laDrone && loai !== 'nhen') throw new Error('Máy sơn chỉ gắn lên xe có bánh (xe bánh, xích, omni), drone hay nhện (treo dưới bụng).');
      if (coSon && (coTay || coNamCham || coNem || coHoi)) throw new Error('Một robot chỉ có một tay: máy sơn không đi chung với tay kẹp, nam châm, máy ném hay vòi phun.');
      coLoa = hamGoc.some(laLenhLoa) || !!(rc.tay === 'loa' || (rc.robot && rc.robot.tay === 'loa'));   // LOA (note / beat)
      // M9B1 (lai L7): NHỆN + LOA — nốt vang quanh nhện (xem rungDaChuong: tầm Manhattan ≤ 3, KHÔNG có tia từ mũi vì nhện không mũi). Lai L5: xuồng là laBanh nên đã gắn được (tia từ mũi xuồng như xe)
      if (coLoa && !laBanh && loai !== 'nhen') throw new Error('Loa chỉ gắn lên xe có bánh (xe bánh, xích, omni), xuồng hay nhện.');
      if (coLoa && (coTay || coNamCham || coNem || coHoi || coSon)) throw new Error('Một robot chỉ có một tay: loa không đi chung với tay kẹp, nam châm, máy ném, vòi phun hay đầu sơn.');
      if (coLoa && coPhao) throw new Error('Một robot chỉ có một tay: loa không đi chung với tay lưới của xuồng.');
      if (coLoa && !rc.phanCung) TAY_LOA.forEach(function (t) { api[t] = function () { return 0; }; });
      coAmThanh = !!cAmThanh || hamGoc.some(function (t) { return CAM_AM_THANH_HAM.indexOf(t) >= 0; });
      coPhanAm = coAmThanh && !!(rc.phanAm || (rc.robot && rc.robot.phanAm) || (cAmThanh && cAmThanh.phanAm) || (hamGoc.indexOf('listen') >= 0 && rc.phanAm !== false));
      if (coAmThanh && !rc.phanCung) { api.hear = function () { return 0; }; api.listen = function () { return 0; }; }
      coCamBien = hamGoc.some(function (t) { return CAM_BIEN_HAM[t] !== undefined; });     // cảm biến khoảng cách (front_clear…)
      coCamTu = hamGoc.some(function (t) { return CAM_TU_HAM.indexOf(t) >= 0; });         // cảm biến từ front_metal (gắn vào cảm biến khoảng cách)
      if (coCamBien && loai === 'nhen') throw new Error('Nhện không gắn cảm biến khoảng cách (nhện không có hướng mặt).');      // 31/10: cảm biến từ gắn được lên nhện, đo theo cạnh trước cố định (hướng xuất phát), xem phần NAM CHÂM
      coHongNgoai = hamGoc.some(function (t) { return CAM_HONG_NGOAI_HAM.indexOf(t) >= 0; });      // cảm biến HỒNG NGOẠI ở mũi xe: distance() / warm() (mùa 2)
      if (coHongNgoai && loai === 'nhen') throw new Error('Nhện không gắn cảm biến hồng ngoại (nhện không có hướng mặt để đo phía trước).');
      coRadar = !!cRadar || hamGoc.some(function (t) { return CAM_RADAR_HAM.indexOf(t) >= 0; });
      coRadarNhanDang = coRadar && !!(rc.nhanDang || (rc.robot && rc.robot.nhanDang) || (cRadar && cRadar.nhanDang) || (hamGoc.indexOf('shape') >= 0 && rc.nhanDang !== false));
      if (coRadar && !rc.phanCung) { api.radar = function () { return 0; }; api.shape = function () { return 0; }; }
      coColor = hamGoc.some(function (t) { return CAM_MAU_HAM.indexOf(t) >= 0; });            // đọc màu color()
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
      if (coLook && !laDrone && !laCau) throw new Error('look() chỉ dành cho drone (camera nhìn xuống dưới bụng drone).');            // M9B2 (L13): cần cẩu gắn camera bụng ở đầu cần, look() đọc ô đầu cần
      if (coCamBay && !laDrone && !laCau) throw new Error('Camera nhìn xuống (camera-bay) chỉ gắn lên drone.');
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
      dao = { trai: false, phai: false, cam: false, tay: false, kep: false, xoay: false, chan: false, sung: false, loa: false };
      if (rc.daoChieu !== undefined && rc.daoChieu !== null) {
        if (!Array.isArray(rc.daoChieu)) throw new Error('daoChieu phải là mảng, vd ["trai"].');
        if (rc.daoChieu.length && !laBanh && !(loai === 'nhen' && rc.daoChieu.every(function (b) { return b === DAO_CHIEU_CHAN; }))) throw new Error('daoChieu chỉ dùng cho robot có hai bánh (xe bánh, xích, omni); nhện chỉ có daoChieu "chan".');
        rc.daoChieu.forEach(function (b) {
          if (DAO_CHIEU_BANH.indexOf(b) < 0 && b !== DAO_CHIEU_CAM && b !== DAO_CHIEU_CUC && b !== DAO_CHIEU_CHAN && b !== DAO_CHIEU_SUNG && b !== DAO_CHIEU_LOA && DAO_CHIEU_TAY.indexOf(b) < 0) throw new Error('daoChieu lạ: "' + b + '" (chỉ có "trai", "phai", "cam", "tay", "kep", "xoay", "cuc", "sung", "loa" hoặc "chan").');
          if (b === DAO_CHIEU_LOA && !coLoa) throw new Error('daoChieu "loa" cần robot có loa (hamGoc có note, beat).');
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
      vuaCheo = false;                        // omni đi chéo: vừa thực thi 1 nhịp chéo, hấp thụ wait() rỗng ngay sau đó
      ncCho = null;                           // nam châm: lệnh magnet_n() / magnet_s() / magnet_off() đang chờ wait(): {ten, dongPy, cuc} (cuc null = ngắt; đã tính daoChieu 'cuc')
      nc = { cuc: null, bat: false, cam: null, lenhCuc: null };   // nam châm: cực đang bật (null = tắt), bat = có cực, id vật đang dính, lenhCuc = lệnh magnet_n / magnet_s đã đặt cực đó {ten, dongPy} (để chẩn đoán chỉ đúng dòng)
      nem = { tam: rc.tamNemMacDinh || 1, ro: null };             // máy ném: tầm đang đặt (1–3), id vật trong rổ
      nemCho = null;                          // máy ném: lệnh load() / throw() đang chờ wait(): {ten, dongPy, tam}
      hoiCho = null;                          // súng hơi: lệnh spray() / spray_back() đang chờ wait(): {ten, dongPy, sau} (sau = bắn ra SAU thật, đã tính daoChieu 'sung')
      neo = false;                            // xuồng: đang thả neo (dòng không đẩy, bánh bị bỏ)
      daiLuoi = rc.daiLuoiMacDinh || DAI_LUOI_MAC_DINH;   // xuồng: độ dài dây lưới đang đặt (mặc định 2 ô)
      keo = null;                             // xuồng: vật nổi đang giữ { id, cho: 'luoi' | 'khoang', doDai: 0..3, day: [{x,y}...] } | null
      neoCho = null;                          // xuồng: lệnh anchor() / unanchor() đang chờ wait(): {ten, dongPy}
      phaoCho = null;                         // xuồng: lệnh cast_net() / drop_net() / set_length() đang chờ wait(): {ten, dongPy, ...}
      nac = laCau ? (bd.nac || 0) : null;     // cần cẩu: nấc cần 0–7 (xem NAC_VEC)
      tam = laCau ? (bd.tam || 1) : null;     // cần cẩu: tầm cần 1–3
      treo = [];                              // cần cẩu: container đang treo ở móc, đáy → đỉnh (mỗi phần tử là bản ghi container của conts)
      if (laCau) { var d0 = NAC_VEC[nac]; if (oTai(san, bd.x + d0[0] * tam, bd.y + d0[1] * tam) === null) throw new Error('Đầu cần lúc xuất phát nằm ngoài sân (bệ (' + bd.x + ', ' + bd.y + '), nấc ' + nac + ', tầm ' + tam + ').'); }
      dan = null;                             // súng hơi: số viên còn lại (null = vô hạn)
      sonCho = null;                          // máy sơn: lệnh dot() / pen_down() / pen_up() đang chờ wait(): {ten, dongPy, mau} (mau = màu LÚC GỌI)
      var mbd = rc.mucBanDau === undefined || rc.mucBanDau === null ? 'red' : rc.mucBanDau;
      if (MAU_TEN.indexOf(mbd) < 0) throw new Error('mucBanDau phải là "red", "green", "blue" hoặc "yellow".');
      son = { ha: false, mau: mbd };          // máy sơn: đầu sơn đang hạ (giữ sơn) không, màu đang chọn
      loaCho = null;                          // loa: lệnh note(n) đang chờ nhịp kế: {ten, dongPy, not, notGoc}
      loaNgan = null;                         // loa: lệnh beat(n) đang ngân trong nhịp tự chạy: {ten, dongPy, not}
      loa = { am: null };                     // loa: nốt vừa phát (cho beat(n) ngân tiếp; null = chưa phát nốt nào)
      gai = bd.gai !== undefined ? !!bd.gai : true;  // bánh gai: mặc định đang bung gai (true = bám đá ướt 'I', false = thu gai trượt trên 'I')
      gaiCho = null;                          // bánh gai: lệnh retract_spikes() / extend_spikes() đang chờ nhịp kế: {ten, dongPy}
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
        coHongNgoai: coHongNgoai, xichDay: xichDay, beSung: beSung, coDap: coDap, dau: dau, coCam4: coCam4, cam4TaiCho: cam4TaiCho,
        coOmniCheo: coOmniCheo, coChinhLuc: coChinhLuc, coRadar: coRadar, coRadarNhanDang: coRadarNhanDang, vuaCheo: vuaCheo,
        laXuong: laXuong, coNeo: coNeo, coPhao: coPhao, coSetLength: coSetLength, daiLuoi: daiLuoi, coDongChay: coDongChay, neo: neo, keo: keo, neoCho: neoCho, phaoCho: phaoCho,
        laCau: laCau, coMoc: coMoc, coMoc2: coMoc2, coQuetMa: coQuetMa, coCan: coCan, coRay: coRay, nac: nac, tam: tam, treo: treo,
        coLoa: coLoa, loa: loa, loaCho: loaCho, loaNgan: loaNgan, laGai: laGai, coThuGai: coThuGai, gai: gai, gaiCho: gaiCho, coAmThanh: coAmThanh, coPhanAm: coPhanAm
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
      coOmniCheo = o.coOmniCheo; coChinhLuc = o.coChinhLuc; coRadar = o.coRadar; coRadarNhanDang = o.coRadarNhanDang; vuaCheo = o.vuaCheo;
      laXuong = o.laXuong; coNeo = o.coNeo; coPhao = o.coPhao; coSetLength = o.coSetLength; daiLuoi = o.daiLuoi; coDongChay = o.coDongChay; neo = o.neo; keo = o.keo; neoCho = o.neoCho; phaoCho = o.phaoCho;
      laCau = o.laCau; coMoc = o.coMoc; coMoc2 = o.coMoc2; coQuetMa = o.coQuetMa; coCan = o.coCan; coRay = o.coRay; nac = o.nac; tam = o.tam; treo = o.treo;
      coLoa = o.coLoa; loa = o.loa; loaCho = o.loaCho; loaNgan = o.loaNgan; laGai = o.laGai; coThuGai = o.coThuGai; gai = o.gai; gaiCho = o.gaiCho; coAmThanh = o.coAmThanh; coPhanAm = o.coPhanAm;
    }
    khoiRobot(dsRc[0]);

    // bóng mờ (xem phần BÓNG MỜ): tư thế đích, các ô phải đi qua, vị trí vật
    var bongMo = null, diQua = [], diQuaTai = {}, sonBanDau = null;
    if (mucTieu === 'bong-mo') {
      var bm = cfg.bongMo;
      if (laCau && bm && typeof bm === 'object' && bm.x === undefined && bm.y === undefined) bm = Object.assign({ x: bd.x, y: bd.y }, bm);   // cần cẩu: không khai x, y thì bệ ở nguyên chỗ xuất phát
      if (!bm || typeof bm !== 'object' || !laSoNguyen(bm.x) || !laSoNguyen(bm.y)) throw new Error('Mục tiêu bong-mo cần cfg.bongMo { x, y, huong }.');
      if (lyDoChan(san, loai, bm.x, bm.y)) throw new Error('Bóng mờ nằm trong chỗ không đứng được: (' + bm.x + ', ' + bm.y + ').');
      var coHuong = loai !== 'nhen' && loai !== 'drone' && loai !== 'cau';
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
      bongMo.nac = null; bongMo.tam = null;                                                  // CẢNG SÔNG: nấc (0..7) và tầm (1..3) đích của cần cẩu lúc xong (tuỳ chọn, cho Gói 1 chưa có móc cẩu)
      if (bm.nac !== undefined && bm.nac !== null) {
        if (!laCau) throw new Error('bongMo.nac chỉ dùng cho cần cẩu (loaiRobot "cau").');
        if (!laSoNguyen(bm.nac) || bm.nac < 0 || bm.nac >= SO_NAC) throw new Error('bongMo.nac phải là số nguyên 0..7.');
        bongMo.nac = bm.nac;
      }
      if (bm.tam !== undefined && bm.tam !== null) {
        if (!laCau) throw new Error('bongMo.tam chỉ dùng cho cần cẩu (loaiRobot "cau").');
        if (!laSoNguyen(bm.tam) || bm.tam < 1 || bm.tam > TAM_CAU_TOI_DA) throw new Error('bongMo.tam phải là số nguyên 1..3.');
        bongMo.tam = bm.tam;
      }
      bongMo.chong = null;                                                                   // CẢNG SÔNG: chồng container lúc xong [{x,y,so:[đáy → đỉnh]}]; mọi chồng trên sân phải đúng (ô không khai phải trống), không còn treo
      if (bm.chong !== undefined && bm.chong !== null) {
        if (!laCau) throw new Error('bongMo.chong chỉ dùng cho cần cẩu (loaiRobot "cau").');
        if (!Array.isArray(bm.chong)) throw new Error('bongMo.chong phải là mảng [{ x, y, so: [..] }].');
        bongMo.chong = bm.chong.map(function (q) {
          if (!q || !laSoNguyen(q.x) || !laSoNguyen(q.y) || !Array.isArray(q.so) || !q.so.every(function (n) { return laSoNguyen(n) && n >= 1 && n <= CONT_SO_TOI_DA; })) throw new Error('bongMo.chong: mỗi mục là { x, y, so: [số container đáy → đỉnh] }.');
          if (!laOChong(q.x, q.y)) throw new Error('bongMo.chong (' + q.x + ', ' + q.y + ') phải là ô bãi "." hay ô đích D.');
          if (q.so.length > CHONG_TOI_DA) throw new Error('bongMo.chong (' + q.x + ', ' + q.y + ') cao quá ' + CHONG_TOI_DA + '.');
          return { x: q.x, y: q.y, so: q.so.slice() };
        });
      }
    } else if (cfg.bongMo) throw new Error('bongMo chỉ dùng với mục tiêu "bong-mo".');

    // máy sơn (xem phần MÁY SƠN): lớp ô đã tô (dùng chung mọi robot) và hình mờ của mục tiêu 'to-hinh'
    var daSon = {}, hinh = null, soOHinh = 0, toThua = false;
    // RẮC CÁT (M9B1 4/11, tương tác R mùa 9): dot() của bộ gieo hạt (xe có bánh, drone, nhện L6) lên ô đá ướt / bùn trơn 'I' biến ô đó thành SÀN THƯỜNG VĨNH VIỄN trong lượt chạy
    // (truotDaUot không trượt nữa). Lớp dùng chung mọi robot; sự kiện { ma: 'rac-cat', o, nhip, lenh }; vết mỗi nhịp có mucVet.racCat, kết quả có racCat (bộ vẽ / chấm đọc). Sân không có 'I' thì không đổi gì.
    var racCat = {};
    function laDaUot(x, y) { return oTai(san, x, y) === 'I' && !racCat[x + ',' + y]; }
    function chupRacCat() { return Object.keys(racCat).map(function (k) { var q = k.split(','); return { x: +q[0], y: +q[1] }; }); }
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

    // LOA (xem phần LOA): tiếng đã phát (dùng chung mọi robot) và giai điệu của mục tiêu 'choi-dieu'
    var daChoi = [], dieu = null, dieuDoi = null, dieuDung = 0, dieuBatDau = null, dieuHong = null, dieuToiCo = false;
    if (mucTieu === 'choi-dieu') {
      if (laDoi) {
        if (dsRc.length !== 2) throw new Error('Mục tiêu choi-dieu cho đội cần đúng 2 robot (R1, R2).');
        dieuDoi = docDieuDoi(cfg.dieu);
      } else {
        dieu = docDieu(cfg.dieu, !!cfg.dieuToiCo);
      }
      dieuToiCo = !!cfg.dieuToiCo || (laDoi && !!san.co);
      if (dieuToiCo && !san.co) throw new Error('Màn choi-dieu có dieuToiCo cần ô cờ F trên sân.');
    } else if (cfg.dieu) throw new Error('dieu chỉ dùng với mục tiêu "choi-dieu".');

    // HANG ĐỘNG ĐÁ VÔI (mùa 8): ngách hang ngầm (cfg.ngachHang), chuông đá phát âm (cfg.chuongDa), khối đá chuông cộng hưởng (cfg.daChuong)
    var ngachs = [], ngachCap = {};
    if (cfg.ngachHang !== undefined && cfg.ngachHang !== null) {
      if (!Array.isArray(cfg.ngachHang)) throw new Error('ngachHang phải là mảng [{ a: { x, y }, b: { x, y } }].');
      cfg.ngachHang.forEach(function (nh, i) {
        if (!nh || !nh.a || !nh.b || !laSoNguyen(nh.a.x) || !laSoNguyen(nh.a.y) || !laSoNguyen(nh.b.x) || !laSoNguyen(nh.b.y)) {
          throw new Error('Ngách hang ' + (i + 1) + ' phải có dạng { a: { x, y }, b: { x, y } }.');
        }
        if (oTai(san, nh.a.x, nh.a.y) === null || oTai(san, nh.b.x, nh.b.y) === null) throw new Error('Ngách hang ' + (i + 1) + ' có đầu nằm ngoài sân.');
        var ka = nh.a.x + ',' + nh.a.y, kb = nh.b.x + ',' + nh.b.y;
        if (ka === kb || ngachCap[ka] || ngachCap[kb]) throw new Error('Ngách hang ' + (i + 1) + ' trùng ô với ngách khác.');
        var rec = { id: i + 1, a: { x: nh.a.x, y: nh.a.y }, b: { x: nh.b.x, y: nh.b.y } };
        ngachs.push(rec);
        ngachCap[ka] = { x: nh.b.x, y: nh.b.y, id: i + 1 };
        ngachCap[kb] = { x: nh.a.x, y: nh.a.y, id: i + 1 };
      });
    }
    var chuongDas = [];
    var nguonChuongDa = cfg.chuongDa !== undefined && cfg.chuongDa !== null ? cfg.chuongDa : cfg.danDoi;
    if (nguonChuongDa !== undefined && nguonChuongDa !== null) {
      if (!Array.isArray(nguonChuongDa)) throw new Error('chuongDa / danDoi phải là mảng [{ x, y, not, phamVi? }].');
      nguonChuongDa.forEach(function (cd, i) {
        if (!cd || !laSoNguyen(cd.x) || !laSoNguyen(cd.y) || !laSoNguyen(cd.not) || cd.not < 1 || cd.not > NOT_TOI_DA) {
          throw new Error('Chuông đá / Đàn dơi ' + (i + 1) + ' phải có x, y và not (1..' + NOT_TOI_DA + ').');
        }
        if (oTai(san, cd.x, cd.y) === null) throw new Error('Chuông đá / Đàn dơi (' + cd.x + ', ' + cd.y + ') nằm ngoài sân.');
        var pv = cd.phamVi !== undefined && cd.phamVi !== null ? cd.phamVi : 9;
        if (!laSoNguyen(pv) || pv < 1 || pv > 9) throw new Error('Chuông đá / Đàn dơi (' + cd.x + ', ' + cd.y + '): phamVi phải là 1..9.');
        chuongDas.push({ id: i + 1, x: cd.x, y: cd.y, not: cd.not, phamVi: pv });
      });
    }
    var daChuongs = [], daChuongTai = {};
    if (cfg.daChuong !== undefined && cfg.daChuong !== null) {
      if (!Array.isArray(cfg.daChuong)) throw new Error('daChuong phải là mảng [{ x, y, not, ben? }].');
      cfg.daChuong.forEach(function (dc, i) {
        if (!dc || !laSoNguyen(dc.x) || !laSoNguyen(dc.y) || !laSoNguyen(dc.not) || dc.not < 1 || dc.not > NOT_TOI_DA) {
          throw new Error('Đá chuông ' + (i + 1) + ' phải có x, y và not (1..' + NOT_TOI_DA + ').');
        }
        var k = dc.x + ',' + dc.y, c = oTai(san, dc.x, dc.y);
        if (c === null) throw new Error('Đá chuông (' + dc.x + ', ' + dc.y + ') nằm ngoài sân.');
        if (daChuongTai[k]) throw new Error('Đá chuông (' + dc.x + ', ' + dc.y + ') khai hai lần.');
        var ben = dc.ben !== undefined && dc.ben !== null ? dc.ben : 1;
        if (!laSoNguyen(ben) || ben < 1 || ben > SO_NHIP_TOI_DA) throw new Error('Đá chuông (' + dc.x + ', ' + dc.y + '): ben phải là 1..' + SO_NHIP_TOI_DA + '.');
        var phamVi = dc.phamVi !== undefined && dc.phamVi !== null ? dc.phamVi : 9;
        var rec = { id: i + 1, x: dc.x, y: dc.y, not: dc.not, ben: ben, daNgan: 0, daVo: false, phamVi: phamVi };
        daChuongs.push(rec);
        daChuongTai[k] = rec;
      });
    }
    function daChuongChuaVo(x, y) { var d = daChuongTai[x + ',' + y]; return !!d && !d.daVo; }
    function chupDaChuong() { return daChuongs.map(function (d) { return { id: d.id, x: d.x, y: d.y, not: d.not, ben: d.ben, daNgan: d.daNgan, daVo: d.daVo }; }); }
    var daChuongBanDau = chupDaChuong();

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
      var dangV = o.dang ? (DANG_KY[o.dang] || o.dang) : null;
      if (dangV && DANG_TEN.indexOf(dangV) < 0) throw new Error('Hình dạng vật lạ: "' + o.dang + '".');
      vats.push({ id: vats.length + 1, x: x, y: y, trangThai: 'dat', mau: o.mau || (cucV ? CUC_MAU[cucV] : null), chat: chatV, cuc: cucV, dang: dangV });
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
    function chupVat() { return vats.map(function (v) { var o = { id: v.id, x: v.x, y: v.y, trangThai: v.trangThai }; if (v.mau) o.mau = v.mau; if (coNamCham || v.chat === 'sat' || v.chat === 'nam-cham') o.chat = v.chat; if (v.cuc) o.cuc = v.cuc; if (v.dang) o.dang = v.dang; if (v.noi) o.noi = v.noi; return o; }); }
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
      if (cuaDong(x, y)) return lyCua(x, y);                              // cửa đang đóng (hay lửa đang cháy) chặn thùng như chặn xe
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
    // BẾN SÔNG: vật nổi (B bè / L lục bình) cũng là VẬT chiếm ô (trangThai 'dat', chat 'go'), thêm noi; kéo bằng dây phao, trôi theo dòng, làm cầu phao cho xe cạn
    san.vatNoi.forEach(function (o) { vats.push({ id: vats.length + 1, x: o.x, y: o.y, trangThai: 'dat', mau: null, chat: 'go', cuc: null, noi: o.noi }); });
    var coVatNoi = san.vatNoi.length > 0;
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
    // ---- LỬA (xem SÚNG BÓNG): cfg.lua = [{ x, y, suc }]; khai trước noi vì cửa chống cháy nối vào ô lửa.
    var luas = [], luaTai = {};
    if (cfg.lua !== undefined && cfg.lua !== null) {
      if (!Array.isArray(cfg.lua)) throw new Error('lua phải là mảng ô [{ x, y, suc }] (đám cháy lúc đầu màn).');
      cfg.lua.forEach(function (o) {
        var k = o ? o.x + ',' + o.y : '?', c = o ? oTai(san, o.x, o.y) : null;
        if (!o || c === null) throw new Error('Lửa: ô (' + (o ? o.x + ', ' + o.y : '?') + ') nằm ngoài sân.');
        if (c !== '.') throw new Error('Lửa (' + o.x + ', ' + o.y + ') phải nằm trên ô sàn "." (không trên tường, nút, cửa, cờ, băng chuyền, ô đích).');
        if (!laSoNguyen(o.suc) || o.suc < 1 || o.suc > 3) throw new Error('Lửa (' + o.x + ', ' + o.y + '): suc là số lần trúng mới tắt, từ 1 tới 3.');
        if (luaTai[k]) throw new Error('Lửa (' + o.x + ', ' + o.y + ') khai hai lần.');
        var l = { x: o.x, y: o.y, suc: o.suc, suc0: o.suc, cua: [] };
        luaTai[k] = l; luas.push(l);
      });
    }
    function luaChay(x, y) { var l = luaTai[x + ',' + y]; return !!l && l.suc > 0; }
    function chupLua() { return luas.map(function (l) { return { x: l.x, y: l.y, suc: l.suc }; }); }
    function luaXong() { return luas.every(function (l) { return l.suc === 0; }); }
    // ---- BẾN SÔNG: dòng chảy (cfg.dong), cống K / k, van V (xem phần BẾN SÔNG đầu tệp). Khai trước noi vì van nối vào cống và ô dòng.
    var dongs = [], dongTai = {}, congTai = {}, vanTai = {};
    var congs = san.congNuoc.map(function (c) { return { x: c.x, y: c.y, mo: c.mo, doi: false }; });
    var vans = san.van.map(function (v) { return { x: v.x, y: v.y, bat: false, cong: [], dong: [] }; });
    congs.forEach(function (c) { congTai[c.x + ',' + c.y] = c; });
    vans.forEach(function (v) { vanTai[v.x + ',' + v.y] = v; });
    if (cfg.dong !== undefined && cfg.dong !== null) {
      if (!Array.isArray(cfg.dong)) throw new Error('dong phải là mảng ô [{ x, y, huong, suc }] (dòng chảy trên mặt nước).');
      cfg.dong.forEach(function (o) {
        var k = o ? o.x + ',' + o.y : '?';
        if (!o || oTai(san, o.x, o.y) === null) throw new Error('Dòng chảy: ô (' + (o ? o.x + ', ' + o.y : '?') + ') nằm ngoài sân.');
        if (!laNuoc(san, o.x, o.y)) throw new Error('Dòng chảy (' + o.x + ', ' + o.y + ') phải nằm trên ô mặt nước (~ Q q K k).');
        if (!laSoNguyen(o.huong) || o.huong < 0 || o.huong > 3) throw new Error('Dòng chảy (' + o.x + ', ' + o.y + '): huong là 0 lên, 1 phải, 2 xuống, 3 trái.');
        if (o.suc !== 1 && o.suc !== 2) throw new Error('Dòng chảy (' + o.x + ', ' + o.y + '): suc là 1 (dòng thường) hay 2 (dòng xiết).');
        if (dongTai[k]) throw new Error('Dòng chảy (' + o.x + ', ' + o.y + ') khai hai lần.');
        var d = { x: o.x, y: o.y, huong: o.huong, suc: o.suc, bat: true };
        dongTai[k] = d; dongs.push(d);
      });
    }
    if (!cfg.noi) vans.forEach(function (v) { v.cong = congs.slice(); v.dong = dongs.slice(); });   // không khai noi: mỗi van điều khiển mọi cống và mọi ô dòng (như nút với cửa và băng)
    /** Ô (x, y) có dòng ĐANG CHẠY: trả dòng đó, hay null (nước êm, dòng tắt, bờ). */
    function dongChay(x, y) { var d = dongTai[x + ',' + y]; return d && d.bat ? d : null; }
    /** Cống ở (x, y) đang đóng (chặn xuồng, vật nổi trôi, dây phao — như cửa đóng). */
    function congDong(x, y) { var c = congTai[x + ',' + y]; return !!c && !c.mo; }
    /** Vật nổi đang nằm trên ô (x, y), hay null. */
    function vatNoiTai(x, y) { var v = vatNamTai(x, y); return v && v.noi ? v : null; }
    /** Ô (x, y) là CẦU PHAO cho xe cạn: ô nước có vật nổi và không có dòng đang chạy. */
    function cauPhaoTai(x, y) { return laNuoc(san, x, y) && !!vatNoiTai(x, y) && !dongChay(x, y); }
    /** Lý do một VẬT NỔI không vào được ô (x, y) (kéo, trôi, buộc): 'ngoai-san' | 'bo' | 'cong' | 'vat' | 'robot' | null. Robot đang xét (không phải drone) và đồng đội dưới đất đều chặn. */
    function oNoiChan(x, y) {
      var ly = lyDoChan(san, 'xuong', x, y);
      if (!ly && congDong(x, y)) ly = 'cong';
      if (!ly && vatNamTai(x, y)) ly = 'vat';
      if (!ly && ((!laDrone && rb.x === x && rb.y === y) || xeDatTai(x, y))) ly = 'robot';
      return ly;
    }
    function chupKeo() {
      if (!keo) return null;
      return {
        id: keo.id,
        cho: keo.cho,
        doDai: keo.doDai,
        day: keo.day ? keo.day.map(function (q) { return { x: q.x, y: q.y }; }) : []
      };
    }
    function chupCong() { return congs.map(function (c) { return { x: c.x, y: c.y, mo: c.mo }; }); }
    function chupVan() { return vans.map(function (v) { return { x: v.x, y: v.y, bat: v.bat }; }); }
    function chupDongTat() { return dongs.filter(function (d) { return !d.bat; }).map(function (d) { return { x: d.x, y: d.y }; }); }
    var congBanDau = chupCong(), vanBanDau = chupVan();
    var vatTroiNhip = 0;                                                       // nhịp đã cho vật nổi trôi (nhiều robot: chỉ một lần mỗi nhịp)

    // ---- CẢNG SÔNG: container (cfg.chong), tàu cập / rời (cfg.tau), giao tàu (cfg.giao), ray, luật tải / luật tháp (xem phần CẢNG SÔNG đầu tệp)
    var conts = [], chongTai = {}, taus = [], tauTai = {}, giaoDs = null, daGiao = [], rayO = null;
    var taiToiDa = cfg.taiToiDa === undefined || cfg.taiToiDa === null ? null : cfg.taiToiDa;
    var luatThap = !!cfg.luatThap;
    var coCau = dsRc.some(function (rc) { return (rc.loaiRobot || 'banh') === 'cau'; });
    if (taiToiDa !== null && !(laSoNguyen(taiToiDa) && taiToiDa >= 1)) throw new Error('taiToiDa (luật tải của cẩu) phải là số nguyên dương: tổng tấn đang treo × tầm phải ≤ taiToiDa.');
    if ((taiToiDa !== null || luatThap) && !coCau) throw new Error('taiToiDa / luatThap chỉ dùng cho màn có cần cẩu (loaiRobot "cau").');
    function laOChong(x, y) { var c = oTai(san, x, y); return c === '.' || c === 'D'; }
    if (cfg.chong !== undefined && cfg.chong !== null) {
      if (!Array.isArray(cfg.chong)) throw new Error('chong phải là mảng [{ x, y, cont: [{ so, tan? }] }] (chồng container, đáy → đỉnh).');
      cfg.chong.forEach(function (ch) {
        if (!ch || !laSoNguyen(ch.x) || !laSoNguyen(ch.y) || !Array.isArray(ch.cont)) throw new Error('Chồng container: mỗi mục là { x, y, cont: [{ so, tan? }] }.');
        var k = ch.x + ',' + ch.y;
        if (oTai(san, ch.x, ch.y) === null) throw new Error('Chồng container (' + ch.x + ', ' + ch.y + ') nằm ngoài sân.');
        if (dsRc.some(function (rc) { return rc.batDau && rc.batDau.x === ch.x && rc.batDau.y === ch.y; })) throw new Error('Chồng container (' + ch.x + ', ' + ch.y + ') nằm ngay ô robot xuất phát.');
        if (!laOChong(ch.x, ch.y)) throw new Error('Chồng container (' + ch.x + ', ' + ch.y + ') phải nằm trên bãi "." hay ô đích D (không trên tàu T, ray, nước, tường).');
        if (chongTai[k]) throw new Error('Chồng container (' + ch.x + ', ' + ch.y + ') khai hai lần.');
        if (ch.cont.length > CHONG_TOI_DA) throw new Error('Chồng container (' + ch.x + ', ' + ch.y + ') cao ' + ch.cont.length + ': tối đa ' + CHONG_TOI_DA + '.');
        if (san.vat.some(function (v) { return v.x === ch.x && v.y === ch.y; }) || san.thung.some(function (v) { return v.x === ch.x && v.y === ch.y; })) throw new Error('Chồng container (' + ch.x + ', ' + ch.y + ') trùng ô có vật / thùng nặng.');
        var ds = [];
        ch.cont.forEach(function (c) {
          if (!c || !laSoNguyen(c.so) || c.so < 1 || c.so > CONT_SO_TOI_DA) throw new Error('Container ở (' + ch.x + ', ' + ch.y + '): so phải là số nguyên 1–' + CONT_SO_TOI_DA + '.');
          var tn = c.tan === undefined || c.tan === null ? 1 : c.tan;
          if (!laSoNguyen(tn) || tn < 1 || tn > CONT_TAN_TOI_DA) throw new Error('Container ' + c.so + ' ở (' + ch.x + ', ' + ch.y + '): tan phải là số nguyên 1–' + CONT_TAN_TOI_DA + '.');
          var ct = { id: conts.length + 1, so: c.so, tan: tn, x: ch.x, y: ch.y, trangThai: 'chong' };
          conts.push(ct); ds.push(ct);
        });
        chongTai[k] = ds;
      });
    }
    var coChong = conts.length > 0;
    if (cfg.tau !== undefined && cfg.tau !== null) {
      if (!Array.isArray(cfg.tau)) throw new Error('tau phải là mảng [{ o: [{x,y}], co, vang, pha? }] (tàu cập / rời bến).');
      cfg.tau.forEach(function (t, i) {
        if (!t || !Array.isArray(t.o) || !t.o.length) throw new Error('Tàu ' + i + ': o phải là mảng ô boong [{x,y}] không rỗng.');
        if (!laSoNguyen(t.co) || t.co < 1) throw new Error('Tàu ' + i + ': co (số nhịp có mặt) phải là số nguyên dương.');
        if (!laSoNguyen(t.vang) || t.vang < 0) throw new Error('Tàu ' + i + ': vang (số nhịp vắng) phải là số nguyên không âm.');
        var pha = t.pha === undefined || t.pha === null ? 0 : t.pha;
        if (!laSoNguyen(pha) || pha < 0) throw new Error('Tàu ' + i + ': pha phải là số nguyên không âm.');
        var tau = { i: i, o: [], co: t.co, vang: t.vang, pha: pha, coMat: false };
        t.o.forEach(function (q) {
          if (!q || oTai(san, q.x, q.y) !== 'T') throw new Error('Tàu ' + i + ': ô (' + (q ? q.x + ', ' + q.y : '?') + ') không phải ô boong T.');
          var k = q.x + ',' + q.y;
          if (tauTai[k]) throw new Error('Ô boong (' + q.x + ', ' + q.y + ') thuộc hai tàu.');
          tauTai[k] = tau; tau.o.push({ x: q.x, y: q.y });
        });
        tau.coMat = tauCoMat(tau, 0);
        taus.push(tau);
      });
    }
    san.boong.forEach(function (q) { if (!tauTai[q.x + ',' + q.y]) throw new Error('Ô boong T (' + q.x + ', ' + q.y + ') không thuộc tàu nào: khai cfg.tau = [{ o: [{x,y}], co, vang }].'); });
    /** Tàu có mặt sau t nhịp đã trôi: (t + pha) mod (co + vang) < co (như cửa nhịp); vang 0 = tàu luôn ở bến. */
    function tauCoMat(t, nh) { return t.vang === 0 || ((nh + t.pha) % (t.co + t.vang)) < t.co; }
    /** Tàu đang ĐẬU ở ô (x, y) (ô T có tàu có mặt), hay null. */
    function tauDauTai(x, y) { var t = tauTai[x + ',' + y]; return t && t.coMat ? t : null; }
    if (mucTieu === 'giao-tau') {
      if (!taus.length) throw new Error('Mục tiêu giao-tau cần cfg.tau (tàu cập / rời bến) và cfg.giao.');
      if (!Array.isArray(cfg.giao) || !cfg.giao.length) throw new Error('Mục tiêu giao-tau cần cfg.giao = [{ tau: i, so: [..] }] (container nào lên tàu nào).');
      giaoDs = [];
      cfg.giao.forEach(function (g) {
        if (!g || !laSoNguyen(g.tau) || !taus[g.tau]) throw new Error('giao: tau phải là chỉ số tàu trong cfg.tau (0–' + (taus.length - 1) + ').');
        if (!Array.isArray(g.so) || !g.so.length || !g.so.every(function (n) { return laSoNguyen(n) && n >= 1 && n <= CONT_SO_TOI_DA; })) throw new Error('giao: so phải là mảng số container (1–' + CONT_SO_TOI_DA + ') không rỗng.');
        if (giaoDs.some(function (h) { return h.tau === g.tau; })) throw new Error('giao: tàu ' + g.tau + ' khai hai lần.');
        g.so.forEach(function (n) { if (!conts.some(function (c) { return c.so === n; })) throw new Error('giao: không có container số ' + n + ' nào trên sân (cfg.chong).'); });
        giaoDs.push({ tau: g.tau, so: g.so.slice() });
      });
    } else if (cfg.giao !== undefined && cfg.giao !== null) throw new Error('giao chỉ dùng với mục tiêu "giao-tau".');
    taus.forEach(function () { daGiao.push([]); });
    // ray: mọi ô R phải là MỘT dải thẳng liền nhau (ngang hay dọc), từ 2 ô trở lên; rail(n) n > 0 chạy về phải (ngang) / xuống (dọc)
    if (san.ray.length) {
      var rs = san.ray, cungY = rs.every(function (q) { return q.y === rs[0].y; }), cungX = rs.every(function (q) { return q.x === rs[0].x; });
      if (rs.length < 2) throw new Error('Ray R phải là một dải thẳng từ 2 ô trở lên.');
      if (!cungY && !cungX) throw new Error('Ray R phải là MỘT dải thẳng (cùng hàng hay cùng cột).');
      var doc = !cungY, ds2 = rs.map(function (q) { return doc ? q.y : q.x; }).sort(function (a, b) { return a - b; });
      for (var ir = 1; ir < ds2.length; ir++) if (ds2[ir] !== ds2[ir - 1] + 1) throw new Error('Ray R phải liền nhau, không đứt quãng.');
      rayO = { doc: doc, o: rs.map(function (q) { return { x: q.x, y: q.y }; }) };
    }
    function laRay(x, y) { return oTai(san, x, y) === 'R'; }
    /** Ô đầu cần của cần cẩu đang xét: bệ + tam × véc-tơ nấc. */
    function oDauCan() { var d = NAC_VEC[nac]; return { x: rb.x + d[0] * tam, y: rb.y + d[1] * tam }; }
    /** Chồng container ở ô (x, y) (mảng đáy → đỉnh, có thể rỗng). */
    function chongO(x, y) { return chongTai[x + ',' + y] || []; }
    function tongTan(ds) { return ds.reduce(function (a, c) { return a + c.tan; }, 0); }
    /** Lý do không hạ container xuống ô (x, y) (ô đầu cần), null nếu được. Chưa xét luật tháp. soThem = số container định hạ. */
    function oHaChan(x, y, soThem) {
      var c = oTai(san, x, y);
      if (c === null) return 'ngoai-san';
      if (c === 'T') { if (!tauDauTai(x, y)) return 'tau-vang'; }
      else if (laNuoc(san, x, y)) return 'nuoc';
      else if (!(c === '.' || c === 'D' || c === 'F' || MAU_KY[c])) return c === '#' ? 'tuong' : c === '=' ? 'rao' : c === 'R' ? 'ray' : c === 'S' ? 'bac-thang' : c === 'N' ? 'nut' : c === 'u' ? 'ho' : c === 'n' ? 'gam-thap' : (c === 'C' || c === 'c') ? 'cua' : BANG[c] !== undefined ? 'bang' : 'vat-can';
      if ((rb.x === x && rb.y === y) || xeDatTai(x, y)) return 'robot';
      if (thungTai(x, y)) return 'thung-nang';
      if (vatNamTai(x, y)) return 'vat';
      if (chongO(x, y).length + soThem > CHONG_TOI_DA) return 'chong-day';
      return null;
    }
    function chupCont(c) { return { so: c.so, tan: c.tan }; }
    function chupTreo() { return treo.map(chupCont); }
    function chupChong() {
      return Object.keys(chongTai).filter(function (k) { return chongTai[k].length; }).map(function (k) { var a = k.split(','); return { x: +a[0], y: +a[1], cont: chongTai[k].map(chupCont) }; });
    }
    function chupTau() { return taus.map(function (t) { return { o: t.o.slice(), co: t.co, vang: t.vang, pha: t.pha, coMat: t.coMat }; }); }
    function chupDaGiao() { return daGiao.map(function (d) { return d.slice(); }); }
    /** Mục tiêu giao-tau: mọi container yêu cầu đã giao đúng tàu (đếm theo số, trùng số thì đếm đủ số lần). */
    function giaoTauXong() {
      if (!giaoDs) return false;
      return giaoDs.every(function (g) {
        var con = daGiao[g.tau].slice();
        return g.so.every(function (n) { var i = con.indexOf(n); if (i < 0) return false; con.splice(i, 1); return true; });
      });
    }
    var chongBanDau = chupChong(), tauBanDau = chupTau();
    if (cfg.noi) {
      cfg.noi.forEach(function (g) {
        var vN = g.nut ? vanTai[g.nut.x + ',' + g.nut.y] : null;
        if (vN) {                                                            // VAN CỐNG (Bến sông): nối cống (cua hay cong) và ô dòng (dong), như nút với cửa và băng
          if (g.bang && g.bang.length) throw new Error('Nhóm nối: van cống (' + vN.x + ', ' + vN.y + ') không điều khiển băng chuyền.');
          (g.cong || g.cua || []).forEach(function (c) {
            var cg = congTai[c.x + ',' + c.y];
            if (!cg) throw new Error('Nhóm nối: ô (' + c.x + ', ' + c.y + ') không phải cống (K / k).');
            if (vN.cong.indexOf(cg) < 0) vN.cong.push(cg);
          });
          (g.dong || []).forEach(function (o) {
            var dg = dongTai[o.x + ',' + o.y];
            if (!dg) throw new Error('Nhóm nối: ô (' + o.x + ', ' + o.y + ') không có dòng chảy (cfg.dong).');
            if (vN.dong.indexOf(dg) < 0) vN.dong.push(dg);
          });
          return;
        }
        var lN = g.nut ? luaTai[g.nut.x + ',' + g.nut.y] : null;
        if (lN) {                                                            // cửa chống cháy: lửa tắt thì cửa đổi một lần
          if (g.bang && g.bang.length) throw new Error('Nhóm nối: lửa (' + lN.x + ', ' + lN.y + ') không điều khiển băng chuyền.');
          (g.cua || []).forEach(function (c) {
            var d = cuaTai[c.x + ',' + c.y];
            if (!d) throw new Error('Nhóm nối: ô (' + c.x + ', ' + c.y + ') không phải cửa.');
            if (d.nhip) throw new Error('Nhóm nối: cửa nhịp (' + c.x + ', ' + c.y + ') không điều khiển bằng lửa.');
            if (lN.cua.indexOf(d) < 0) lN.cua.push(d);
          });
          return;
        }
        var n = g.nut ? nutTai[g.nut.x + ',' + g.nut.y] : null;
        var m = g.nut ? nutDeTai[g.nut.x + ',' + g.nut.y] : null;
        if (!n && !m) throw new Error('Nhóm nối: ô nút (' + (g.nut ? g.nut.x + ', ' + g.nut.y : '?') + ') không phải nút N hay ô lửa.');
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
      if (!Array.isArray(cfg.nutBat)) throw new Error('nutBat phải là mảng ô [{ x, y }] (van N đang bật lúc đầu màn).');
      cfg.nutBat.forEach(function (o) {
        var k = o ? o.x + ',' + o.y : '?', n = nutTai[k];
        if (!n) throw new Error('Nút bật sẵn: ô (' + (o ? o.x + ', ' + o.y : '?') + ') không phải van N' + (nutDeTai[k] ? ' (nút đè M không bật sẵn được)' : '') + '.');
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
    //      Bị chặn (tường, cửa đóng, thùng, vật, rào, bậc thang, đồng đội…) thì đứng im ('dem-chan', thông tin). Thùng không bị đệm tác động.
    //      P1b (user 30/10): CÔNG TẮC — { nut: { x, y } } trỏ vào một nút đè M: đệm chỉ CHẠY khi nút đang bị đè (khiDe 'bat', mặc định) hay chỉ khi nút KHÔNG bị đè
    //        (khiDe 'tat'). Trạng thái nút là trạng thái cuối nhịp trước (nút đè cập nhật ở capNhatCua cuối nhịp): đè nút ở nhịp t thì đệm đổi từ nhịp t + 1.
    //        Đệm tắt vẫn là khối, không kéo / đẩy gì. Đệm không có nut thì luôn chạy (như bản thử).
    //      VẬT NẰM ĐẤT (user 30/10 "đệm từ nên thêm cơ chế tương tác với vật kim loại"): sau robot, đệm đang chạy dời mỗi vật sắt / vật nam châm nằm đất cùng hàng / cột
    //        trong TAM_DEM ô (ô giữa không chắn, kể cả robot) 1 ô: sắt và vật nam châm khác cực bị hút (dừng ở ô sát đệm), vật nam châm cùng cực bị đẩy ra xa. Gỗ thì không.
    //        Đệm gần nhất thắng, bằng khoảng mà ngược chiều thì nằm im; ô tới bị chặn (oTruotChan, hay robot đứng đó) thì nằm im. 'dem-vat' { id, tu, den, dem, kieu }.
    //      VẬT BỊ ĐỆM GIỮ (user 30/10 "đệm từ hút khối sắt thì không nâng, không hút được, phải tắt đi thì vật mới nâng lên được"): vật đang bị một đệm đang chạy HÚT
    //        (trong tầm, đường thông) thì robot không nhấc được: tay kẹp gắp → 'kep-hut' lyDo 'dem-giu'; nam châm hút / đẩy → 'dem-giu-vat'. Tắt đệm (nhả nút) rồi mới lấy.
    var demTus = [], congTacDem = {};
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
        if (o.nut !== undefined && o.nut !== null) {                       // P1b (user 30/10 "ý A"): đệm có CÔNG TẮC là một nút đè M
          var mN = o.nut && nutDeTai[o.nut.x + ',' + o.nut.y];
          if (!mN) throw new Error('Đệm từ (' + o.x + ', ' + o.y + '): nut phải trỏ vào một nút đè M trên sân.');
          if (o.khiDe !== undefined && o.khiDe !== 'bat' && o.khiDe !== 'tat') throw new Error('Đệm từ (' + o.x + ', ' + o.y + '): khiDe là "bat" (đè thì đệm chạy) hay "tat" (đè thì đệm tắt).');
          congTacDem[k] = { nut: mN, khiDe: o.khiDe || 'bat' };            // để riêng: sự kiện đệm vẫn chỉ mang { x, y, cuc }
        } else if (o.khiDe !== undefined) throw new Error('Đệm từ (' + o.x + ', ' + o.y + '): khiDe chỉ dùng khi có nut.');
        san.demTu[k] = d; demTus.push(d);
      });
      dsRc.forEach(function (rc) { if (rc.batDau && san.demTu[rc.batDau.x + ',' + rc.batDau.y]) throw new Error('Robot xuất phát trên ô đệm từ (' + rc.batDau.x + ', ' + rc.batDau.y + ').'); });
    }
    if (cuaTai[bd.x + ',' + bd.y] && !cuaTai[bd.x + ',' + bd.y].mo) throw new Error('Robot xuất phát trong ô cửa đang đóng.');
    if (luaTai[bd.x + ',' + bd.y]) throw new Error('Robot xuất phát trong ô lửa (' + bd.x + ', ' + bd.y + ').');
    if (daChuongChuaVo(bd.x, bd.y)) throw new Error('Robot xuất phát trong ô đá chuông chưa vỡ (' + bd.x + ', ' + bd.y + ').');
    /** Ô (x, y) chặn như cửa đóng: cửa đang đóng, lửa đang cháy (xem LỬA), hay khối đá chuông chưa vỡ (mùa 8 Hang động). */
    function cuaDong(x, y) { var d = cuaTai[x + ',' + y]; return (!!d && !d.mo) || luaChay(x, y) || daChuongChuaVo(x, y); }
    /** Lý do chặn của ô cuaDong: 'lua' | 'da-chuong' | 'cua' | null. */
    function lyCua(x, y) { return luaChay(x, y) ? 'lua' : daChuongChuaVo(x, y) ? 'da-chuong' : cuaDong(x, y) ? 'cua' : null; }
    function chupCua() { return cuas.map(function (d) { return { x: d.x, y: d.y, mo: d.mo }; }); }
    function chupDiQua() { return diQua.map(function (q) { return { x: q.x, y: q.y, da: q.da }; }); }
    /** Bóng mờ: robot đang ở đúng tư thế đích, đã qua mọi ô diQua, vật (nếu khai) nằm đúng các ô đó (không thừa không thiếu). */
    function bongMoDat() {
      if (!bongMo || rb.x !== bongMo.x || rb.y !== bongMo.y) return false;
      if (bongMo.huong !== null && rb.huong !== bongMo.huong) return false;
      if (bongMo.nac !== null && bongMo.nac !== undefined && nac !== bongMo.nac) return false;
      if (bongMo.tam !== null && bongMo.tam !== undefined && tam !== bongMo.tam) return false;
      if (!diQua.every(function (q) { return q.da; })) return false;
      if (bongMo.thung) {                                                  // thùng mờ: thùng thật nằm đúng các ô đó, không thừa không thiếu
        if (thungs.length !== bongMo.thung.length) return false;
        if (!bongMo.thung.every(function (q) { return !!thungTai(q.x, q.y); })) return false;
      }
      if (bongMo.xoay && tay.xoay !== bongMo.xoay) return false;           // tay xoay: lúc xong khớp phải ở đúng nấc của xe mờ
      if (bongMo.chan && chan !== bongMo.chan) return false;               // nhện: lúc xong chân phải ở đúng tư thế (co / duỗi) của bóng mờ
      if (bongMo.chong) {                                                  // CẢNG SÔNG: mọi chồng đúng số (đáy → đỉnh), ô không khai trống, móc không còn treo gì
        if (treo.length) return false;
        var bmC = {}; bongMo.chong.forEach(function (q) { bmC[q.x + ',' + q.y] = q.so.join(','); });
        for (var kc in chongTai) if (chongTai[kc].length && bmC[kc] === undefined) return false;
        if (!bongMo.chong.every(function (q) { return chongO(q.x, q.y).map(function (c) { return c.so; }).join(',') === bmC[q.x + ',' + q.y]; })) return false;
      }
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
    var cuaBanDau = chupCua(), nutBanDau = chupNut(), nutDeBanDau = chupNutDe(), luaBanDau = chupLua();

    function vatNamTai(x, y) {
      for (var i = 0; i < vats.length; i++) if (vats[i].trangThai === 'dat' && vats[i].x === x && vats[i].y === y) return vats[i];
      return null;
    }
    function vatTheoId(id) { return vats[id - 1]; }

    /** ĐỆM TỪ P1b: đệm `d` đang chạy không (theo công tắc nút đè nếu có; trạng thái nút là của cuối nhịp trước). */
    function demBat(d) { var ct = congTacDem[d.x + ',' + d.y]; return !ct || (ct.khiDe === 'tat' ? !ct.nut.bat : ct.nut.bat); }
    /** ĐỆM TỪ P1b: các "lực" của đệm đang chạy lên vật `v` nằm đất: [{ dem, kc, kieu: 'hut' | 'day', vx, vy }] (vx, vy = chiều vật sẽ dời; hút sát đệm thì 0, 0).
     *  Chỉ vật sắt / vật nam châm; đệm cùng hàng / cột trong TAM_DEM ô; ô giữa không có khối chắn từ (như khoiChanTu, thêm robot dưới đất đang xét). */
    function lucDemLenVat(v) {
      var kq = [];
      if (v.trangThai !== 'dat' || (v.chat !== 'sat' && v.chat !== 'nam-cham')) return kq;
      demTus.forEach(function (d) {
        if (!demBat(d)) return;
        var dx = d.x - v.x, dy = d.y - v.y;
        if (dx !== 0 && dy !== 0) return;
        var kc = Math.abs(dx) + Math.abs(dy);
        if (kc === 0 || kc > TAM_DEM) return;
        var ux = dx > 0 ? 1 : dx < 0 ? -1 : 0, uy = dy > 0 ? 1 : dy < 0 ? -1 : 0;
        for (var i = 1; i < kc; i++) {
          var x = v.x + ux * i, y = v.y + uy * i, c = oTai(san, x, y);
          if (c === null || c === '#' || c === 'N' || san.demTu[x + ',' + y] || cuaDong(x, y) || thungTai(x, y) || vatNamTai(x, y) || xeDatTai(x, y) || (!laDrone && rb.x === x && rb.y === y)) return;
        }
        var day = v.chat === 'nam-cham' && v.cuc === d.cuc;
        var vx = day ? -ux : ux, vy = day ? -uy : uy;
        if (!day && kc === 1) { vx = 0; vy = 0; }
        kq.push({ dem: d, kc: kc, kieu: day ? 'day' : 'hut', vx: vx, vy: vy });
      });
      return kq;
    }
    /** ĐỆM TỪ P1b: vật `v` đang bị một đệm đang chạy HÚT (robot không nhấc / hút / đẩy được nó). Trả đệm đó, hay null. */
    function demGiuVat(v) {
      var l = lucDemLenVat(v).filter(function (u) { return u.kieu === 'hut'; });
      if (!l.length) return null;
      l.sort(function (a, b) { return a.kc - b.kc; });
      return l[0].dem;
    }

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
        var dgK = v && tay.tuThe === 'duoi' ? demGiuVat(v) : null;
        if (dgK) {                                                // đệm từ đang hút vật này: tay không nhấc nổi (P1b)
          var kdg = ghiHuongTay({ ma: 'kep-hut', nhip: nhip, o: o, lyDo: 'dem-giu', dem: dgK, lenh: lk });
          sk.push(kdg); suKienChan.push(kdg);
          return false;
        }
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
      if (keo && keo.cho === 'khoang') { var vk = vatTheoId(keo.id); vk.x = rb.x; vk.y = rb.y; } // vật thu vào khoang xuồng đi theo xuồng
    }
    function duaVatXong() {
      var vatsCon = vats.filter(function (v) { return v.trangThai !== 'lap-ho'; });
      var can = vatCan === null ? vatsCon : vatsCon.filter(function (v) { return vatCan === 'sat' ? v.chat === 'sat' : vatCan === 'nam-cham' ? v.chat === 'nam-cham' : v.chat !== 'go'; });       // vatCan: 'sat' chỉ vật sắt · 'nam-cham' chỉ vật nam châm · 'tu' sắt + nam châm (vật gỗ không cần về đích)
      if (!can.length) return vats.length > 0 && dsDich.length === 0 && vats.every(function (v) { return v.trangThai === 'lap-ho'; });
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
    function oTruotChan(x, y) { return oThaChan(x, y) || (lyCua(x, y)); }
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
      var truotGhi = 0, cheoGhi = 0;
      // lệnh đi / bánh gây ra chuyện của nhịp này (cho chẩn đoán trỏ đúng dòng): lệnh trượt, chéo, lệnh bánh đầu tiên, hay lệnh go_* của nhện
      var lenhNhip = (hanhDong.kieu === 'banh' ? (hanhDong.truot ? { ten: hanhDong.truot.ten, dongPy: hanhDong.truot.dongPy } : hanhDong.cheo ? { ten: hanhDong.cheo.ten, dongPy: hanhDong.cheo.dongPy } : hanhDong.lenhBanh) : hanhDong.lenhDi) || (hanhDong.hoi ? { ten: hanhDong.hoi.ten, dongPy: hanhDong.hoi.dongPy } : null) || null;
      var coVo = false;
      var dauDauNhip = false;                                                  // drone nâng cấp: đang đậu ở đầu nhịp (nhịp đậu trọn không tốn pin)
      var coTieng = false;                                                     // loa: nhịp này có phát âm (note hoặc beat)

      /** ĐÁ VÔI ƯỚT 'I' (mùa 8 Hang động): khi robot dưới đất bước vào ô 'I' và KHÔNG phải bánh gai đang bung gai (loai === 'gai' && gai === true),
       *  robot trượt thẳng tiếp theo véc-tơ (dx, dy) cho tới khi ra khỏi 'I', gặp hố 'u' / nước '~', hoặc đụng vật cản trước mặt. */
      function truotDaUot(dx, dy) {
        if (laDrone || laCau || (laGai && gai)) return;
        if (dx === 0 && dy === 0) return;
        if (!laDaUot(rb.x, rb.y)) return;                                         // ô 'I' đã rắc cát (M9B1, R) là sàn thường
        var tu = { x: rb.x, y: rb.y }, soO = 0, chan = null;
        while (laDaUot(rb.x, rb.y)) {
          var nx = rb.x + dx, ny = rb.y + dy;
          var ly = lyDoChan(san, loai, nx, ny);
          if (!ly) ly = lyCua(nx, ny);
          if (!ly && dongDoiChanDi(nx, ny)) ly = 'dong-doi';
          if (!ly && thungTai(nx, ny)) ly = 'thung-nang';
          if (!ly && vatNamTai(nx, ny)) ly = 'vat';
          if (!ly && loai === 'nhen' && chan !== 'co' && oTai(san, nx, ny) === 'n') ly = 'gam-thap';
          if (ly) { chan = ly; break; }
          rb.x = nx; rb.y = ny; soO++;
          if (oTai(san, rb.x, rb.y) === 'u') break;
        }
        if (soO > 0) {
          sk.push({ ma: 'truot-da-uot', nhip: nhip, tu: tu, den: { x: rb.x, y: rb.y }, dx: dx, dy: dy, soO: soO, chan: chan });
        } else if (chan) {
          sk.push({ ma: 'truot-da-uot-chan', nhip: nhip, o: tu, dx: dx, dy: dy, vat: chan });
        }
      }

      /** BÁNH GAI (mùa 8 Hang động): retract_spikes() / extend_spikes() thu hoặc bung gai ở đầu nhịp. */
      function apGai(l) {
        if (!l) return;
        var muon = l.ten === 'extend_spikes';
        var lg = { ten: l.ten, dongPy: l.dongPy };
        if (muon === gai) return;
        var cu = gai; gai = muon;
        sk.push({ ma: 'doi-gai', nhip: nhip, tu: cu, den: muon, lenh: lg });
      }

      /** ĐÁ CHUÔNG CỘNG HƯỞNG (mùa 8 Hang động): khi robot phát nốt `am` (1..8) trong nhịp này, mọi khối đá chuông chưa vỡ có `not === am`
       *  và nằm trong khoảng cách Manhattan <= 3 từ robot (hoặc trên tia nhìn thẳng từ mũi robot không bị tường '#' chặn) sẽ cộng hưởng (+1 daNgan).
       *  M9B1 (4/11): NHỆN + LOA (lai L7) không có mũi nên CHỈ có tầm quanh: Manhattan |dx| + |dy| <= 3, tường KHÔNG chặn (âm vang qua đá, như luật tầm sẵn có của xe);
       *  XUỒNG + LOA (lai L5) là laBanh: tầm quanh + tia từ mũi xuồng như xe; đá chuông nằm trên ô nước chặn xuồng (cuaDong), vỡ rồi là nước đi được.
       *  Đủ `ben` nhịp liên tiếp đúng nốt thì đá chuông nứt vỡ (`daVo = true`, mở đường). Phát nốt khác thì `daNgan` về 0. */
      function rungDaChuong(am, lg) {
        if (!daChuongs.length) return;
        daChuongs.forEach(function (dc) {
          if (dc.daVo) return;
          var kc = Math.abs(dc.x - rb.x) + Math.abs(dc.y - rb.y);
          var trongTam = kc <= 3;
          if (!trongTam && laBanh) {
            var v = VEC[rb.huong], tx = rb.x, ty = rb.y;
            for (var step = 1; step <= Math.max(san.rong, san.cao); step++) {
              tx += v[0]; ty += v[1];
              if (tx === dc.x && ty === dc.y) { trongTam = true; break; }
              var ct = oTai(san, tx, ty);
              if (ct === null || ct === '#') break;
            }
          }
          if (!trongTam || dc.not !== am) {
            dc.daNgan = 0;
            return;
          }
          dc.daNgan++;
          sk.push({ ma: 'rung-da-chuong', nhip: nhip, id: dc.id, o: { x: dc.x, y: dc.y }, not: dc.not, daNgan: dc.daNgan, ben: dc.ben });
          if (dc.daNgan >= dc.ben) {
            dc.daVo = true;
            var ev = { ma: 'vo-da-chuong', nhip: nhip, id: dc.id, o: { x: dc.x, y: dc.y }, not: dc.not, lenh: lg };
            sk.push(ev); suKienChan.push(ev);
          }
        });
      }

      /** LOA (a): lệnh loa của nhịp, phát ở đầu nhịp (vừa đi vừa phát được). Đối chiếu với giai điệu nếu mục tiêu là choi-dieu. */
      function apLoa(l) {
        if (!l) {
          if (daChuongs.length) daChuongs.forEach(function (dc) { if (!dc.daVo) dc.daNgan = 0; });
          return;
        }
        var lg = { ten: l.ten, dongPy: l.dongPy };
        loa.am = l.am; coTieng = true;
        var dung = null;
        if (dieu && !dieuHong) {
          if (dieuBatDau === null) dieuBatDau = nhip;
          var viTri = dieuDung;
          var can = viTri < dieu.length ? dieu[viTri] : null;
          if (l.ngan && viTri < dieu.length && (can === null || can === l.am)) {
            dung = true; dieuDung++;
          } else if (viTri < dieu.length && can === l.am) {
            dung = true; dieuDung++;
          } else {
            dung = false;
            dieuHong = { ma: can === null ? 'lech-nhip' : 'sai-not', nhip: nhip, viTri: viTri, can: can, choi: l.am, lenh: lg };
            if (viTri >= dieu.length) dieuHong.thua = true;
            sk.push(dieuHong); suKienChan.push(dieuHong);
          }
        }
        daChoi.push({ nhip: nhip, x: rb.x, y: rb.y, am: l.am, dung: dung, ngan: !!l.ngan });
        sk.push({ ma: l.ngan ? 'ngan-am' : 'phat-am', am: l.am, o: { x: rb.x, y: rb.y }, dung: dung });
        rungDaChuong(l.am, lg);
      }

      /** OMNI CHÉO (mùa 6 Mỏ đá): diag_left() / diag_right() đi chéo trước-trái hay trước-phải trong 1 nhịp, giữ nguyên hướng mặt. */
      function thuCheo(bien) {
        var vf = VEC[rb.huong], vs = VEC[(rb.huong + (bien > 0 ? 1 : 3)) % 4];
        var nx = rb.x + vf[0] + vs[0], ny = rb.y + vf[1] + vs[1];
        var ly = lyDoChan(san, loai, nx, ny);
        if (!ly) ly = lyCua(nx, ny);
        if (!ly && dongDoiChanDi(nx, ny)) ly = 'dong-doi';
        if (!ly && thungTai(nx, ny)) ly = 'thung-nang';
        if (!ly && vatNamTai(nx, ny)) ly = 'vat';
        // Nếu cả 2 ô kề góc (ô trước mặt và ô bên cạnh) đều là tường cứng hay ngoài sân thì không lách qua khe góc tường được
        var c1 = oTai(san, rb.x + vf[0], rb.y + vf[1]), c2 = oTai(san, rb.x + vs[0], rb.y + vs[1]);
        if (!ly && (c1 === null || c1 === '#') && (c2 === null || c2 === '#')) ly = 'tuong';
        if (ly) {
          var ec = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: { x: rb.x, y: rb.y }, vat: ly, kieu: 'cheo', lenh: lenhNhip };
          sk.push(ec); suKienChan.push(ec);
        } else {
          rb.x = nx; rb.y = ny; sk.push({ ma: 'cheo', huong: bien, den: { x: nx, y: ny } });
          truotDaUot(vf[0] + vs[0], vf[1] + vs[1]);
        }
      }

      /** Drone nâng cấp: land() hạ xuống ô đang ở nếu ô đó đáp được. */
      function apDap() {
        var o = { x: rb.x, y: rb.y };
        if (dau) { sk.push({ ma: 'da-dau', nhip: nhip, o: o, lenh: lenhNhip }); return; }
        var c = oTai(san, rb.x, rb.y), ly = null;
        if (c === '=') ly = 'rao';
        else if (c === 'u') ly = 'ho';
        else if (c === 'S') ly = 'bac-thang';
        else if (c !== null && BANG[c] !== undefined) ly = 'bang';
        else if (laNuoc(san, rb.x, rb.y) && !cauPhaoTai(rb.x, rb.y)) ly = 'nuoc';                // Bến sông: không đáp xuống mặt nước (trừ cầu phao)
        else if (thungTai(rb.x, rb.y)) ly = 'thung-nang';
        else if (vatNamTai(rb.x, rb.y)) ly = 'vat';
        if (ly) { var eb = { ma: 'dap-bi-chan', nhip: nhip, o: o, vat: ly, lenh: lenhNhip }; sk.push(eb); suKienChan.push(eb); return; }
        dau = true;
        sk.push({ ma: 'dap', o: o, sac: !!sacSet[rb.x + ',' + rb.y] });
      }

      function thuDi(huongDi, soBuoc, ma) {
        var v = VEC[huongDi], nx = rb.x + v[0] * soBuoc, ny = rb.y + v[1] * soBuoc;
        var ly = lyDoChan(san, loai, nx, ny);
        if (ly === 'nuoc' && cauPhaoTai(nx, ny)) ly = null;                 // CẦU PHAO (Bến sông): xe cạn đi lên vật nổi trên nước êm như sàn
        if (!ly) ly = lyCua(nx, ny);                           // cửa đang đóng chặn như tường
        if (!ly && laXuong && congDong(nx, ny)) ly = 'cong';               // xuồng: cống đóng chặn như cửa
        if (!ly && dongDoiChanDi(nx, ny)) ly = 'dong-doi';                 // nhiều robot: đồng đội đứng đó hay định tới đó
        if (!ly && loai === 'nhen' && chan !== 'co' && oTai(san, nx, ny) === 'n') ly = 'gam-thap';       // gầm thấp: nhện phải đang co chân mới chui vào được
        if (!ly && laXuong && keo) return diXuongKeo(ma, v, nx, ny);       // xuồng đang kéo vật nổi: cả cụm đi (xem phần BẾN SÔNG)
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
        var vn = (ly || ncBung() || (!laXuong && cauPhaoTai(nx, ny))) ? null : vatNamTai(nx, ny);   // drone bay qua vật nằm đất; nhện nam châm bụng đứng trùm lên vật (mùa 3); xe cạn lên cầu phao
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
          truotDaUot(v[0] * soBuoc, v[1] * soBuoc);
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
        if (!lyG) lyG = lyCua(mx, my);
        if (!lyG && oTai(san, mx, my) === 'n') lyG = 'gam-thap';
        if (!lyG && thungTai(mx, my)) lyG = 'thung-nang';
        if (!lyG && dongDoiTai(mx, my)) lyG = 'dong-doi';
        var lyD = lyDoChan(san, loai, dx, dy);
        if (!lyD) lyD = lyCua(dx, dy);
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
        truotDaUot(v[0], v[1]);
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
        // ĐÁ TRÒN LẤP HỐ (mùa 6 Mỏ đá): ném đá tròn (hoặc vật trên màn bật daLapHo, trừ đá vuông 'square') rơi trúng ô hố 'u' thì lấp hố thành sàn '.'
        if (c === 'u' && (daLapHo || vt.dang === 'round') && vt.dang !== 'square') {
          san.o[dy] = san.o[dy].slice(0, dx) + '.' + san.o[dy].slice(dx + 1);
          san.ho = san.ho.filter(function (h) { return !(h.x === dx && h.y === dy); });
          vt.trangThai = 'lap-ho'; vt.x = dx; vt.y = dy;
          sk.push({ ma: 'lap-ho', nhip: nhip, id: vt.id, o: { x: dx, y: dy }, tam: l.tam });
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
        if (l.ten === 'dot' && laDaUot(rb.x, rb.y) && !laCau) {                   // RẮC CÁT (M9B1, R): chấm lên ô đá ướt / bùn trơn 'I' dưới đầu gieo → ô thành sàn thường cho cả lượt
          racCat[rb.x + ',' + rb.y] = true;
          sk.push({ ma: 'rac-cat', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: lg });
        }
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
          else if (cuaDong(x, y)) ly = lyCua(x, y);                         // 'lua': tia nước trúng lửa (dập)
          else if (thungTai(x, y)) ly = 'thung';
          else if (vatNamTai(x, y)) ly = 'vat';
          else if (xeDatTai(x, y)) ly = 'dong-doi';
          if (ly) { trung = ly; oVC = { x: x, y: y }; break; }
          cuoi = { x: x, y: y };
        }
        sk.push({ ma: 'ban', nhip: nhip, tu: { x: rb.x, y: rb.y }, huong: hb, sau: !!l.sau, den: oVC || cuoi, cuoi: cuoi, o: oVC, trung: trung, soO: d - 1, luc: l.luc || 'high', hetTam: hetTam });
        var kqBan = { trung: trung, o: oVC, cuoi: cuoi, soO: d - 1, hetTam: hetTam };
        if (trung === 'lua') {                                                  // LỬA: mỗi lần trúng nhỏ đi một cỡ, về 0 thì tắt hẳn (cửa chống cháy đổi ở CUỐI nhịp)
          var lb = luaTai[oVC.x + ',' + oVC.y];
          lb.suc--;
          sk.push({ ma: 'lua-nho', nhip: nhip, o: { x: lb.x, y: lb.y }, suc: lb.suc });
          if (lb.suc === 0) {
            sk.push({ ma: 'lua-tat', nhip: nhip, o: { x: lb.x, y: lb.y } });
            lb.cua.forEach(function (dc) { dc.doi = !dc.doi; });
          }
          return kqBan;
        }
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

      /** Thông tin về quả bóng KHÔNG tới nút: bay ra khỏi sân ('ban-hut'), phun nhẹ rơi vì hết tầm ('ban-ngan'), hay (sân có nút) bị vật cản chặn ('ban-bi-chan'). Chỉ ghi khi cú giật
       *  của phát bắn đó chẳng dời được gì (xe và thùng đứng yên): phát bắn mà xe / thùng đi được một đoạn là phát bắn có ích, bóng đập vào tường là chuyện thường. */
      function thongTinBan(kb, l, hb, giatCoDoi) {
        if (kb.trung === 'nut' || kb.trung === 'lua' || giatCoDoi) return;
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
        if (!ly) ly = lyCua(nx, ny);
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
        truotDaUot(v[0], v[1]);
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

      /** ĐỆM TỪ P1b: vật `vt` (ở ô o) đang bị đệm giữ thì nam châm của robot không hút / đẩy được: ghi 'dem-giu-vat' và trả true. */
      function demBiGiu(vt, o) {
        var dg = demGiuVat(vt);
        if (!dg) return false;
        var e = { ma: 'dem-giu-vat', nhip: nhip, id: vt.id, o: { x: o.x, y: o.y }, dem: dg, lenh: nc.lenhCuc || lenhNhip };
        sk.push(e); suKienChan.push(e);
        return true;
      }
      /** (d) hút / đẩy, ở cuối nhịp: nam châm có cực → vật đầu tiên trong tầm (sắt 2 ô, vật nam châm 3 ô): sắt → hút (cực nào cũng hút); vật nam châm khác cực → hút, cùng cực → đẩy;
       *  gỗ → không gì. Đang dính vật nam châm mà tay đổi sang cùng cực → bắn vật ra. */
      function hutVat() {
        if (!coNamCham || nc.cuc === null) return;
        if (ncBung()) {                                                       // nam châm treo (drone, nhện bụng): chỉ tác dụng vật nằm ở ô NGAY DƯỚI robot
          if (nc.cam !== null) return;
          var vd = vatNamTai(rb.x, rb.y);
          if (!vd) return;
          if (demBiGiu(vd, { x: rb.x, y: rb.y })) return;
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
        if ((vt.chat === 'nam-cham' || (vt.chat === 'sat' && nt.khoang <= TAM_HUT)) && demBiGiu(vt, nt.o)) return;
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
          if (!demBat(d)) return;                                                           // P1b: đệm đang tắt (công tắc nút đè)
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
        var lyB = lyDoChan(san, loai, nx, ny) || (lyCua(nx, ny)) || (thungTai(nx, ny) ? 'thung-nang' : null) || (vatNamTai(nx, ny) ? 'vat' : null) || (dongDoiChanDi(nx, ny) ? 'dong-doi' : null) || (loai === 'nhen' && chan !== 'co' && oTai(san, nx, ny) === 'n' ? 'gam-thap' : null);
        if (lyB) {
          var ecb = { ma: 'dem-chan', nhip: nhip, o: o, den: { x: nx, y: ny }, dem: u0.dem, kieu: u0.kieu, vat: lyB };
          sk.push(ecb); suKienChan.push(ecb);
          return;
        }
        rb.x = nx; rb.y = ny; demBang = 0;
        var ed = { ma: 'dem-' + u0.kieu, nhip: nhip, tu: o, den: { x: nx, y: ny }, dem: u0.dem, lenh: lenhNhip };
        sk.push(ed); suKienChan.push(ed);
      }

      /** ĐỆM TỪ P1b: sau demTuKeo, mỗi vật sắt / nam châm nằm đất (theo id) bị đệm đang chạy dời 1 ô (xem phần ĐỆM TỪ ở đầu chay()). */
      function demTuVat() {
        if (!demTus.length) return;
        vats.forEach(function (v) {
          var l = lucDemLenVat(v);
          if (!l.length) return;
          var min = Math.min.apply(null, l.map(function (u) { return u.kc; }));
          var gan = l.filter(function (u) { return u.kc === min; }), u0 = gan[0];
          if (gan.some(function (u) { return u.vx !== u0.vx || u.vy !== u0.vy; })) return;    // hai đệm kéo ngược nhau: nằm im
          if (u0.vx === 0 && u0.vy === 0) return;                                           // đã sát đệm: bị giữ tại chỗ
          var nx = v.x + u0.vx, ny = v.y + u0.vy;
          if (oTruotChan(nx, ny) || (!laDrone && rb.x === nx && rb.y === ny)) return;
          var tu = { x: v.x, y: v.y };
          v.x = nx; v.y = ny;
          sk.push({ ma: 'dem-vat', nhip: nhip, id: v.id, tu: tu, den: { x: nx, y: ny }, dem: u0.dem, kieu: u0.kieu });
          if (dichSet[nx + ',' + ny] && !hopMauDich(v, nx, ny)) {
            var esm = { ma: 'dat-sai-mau', nhip: nhip, id: v.id, o: { x: nx, y: ny }, mauVat: v.mau || 'none', mauDich: dichMau[nx + ',' + ny], chat: v.chat, cuc: v.cuc };
            sk.push(esm); suKienChan.push(esm);
          }
        });
      }

      /* ---------------- BẾN SÔNG (xem phần BẾN SÔNG đầu tệp) ---------------- */
      /** XUỒNG đang giữ vật nổi trong lưới / khoang: một bước tiến / lùi của cả cụm. Ô xuồng tới (nx, ny) đã qua kiểm bờ / cống / đồng đội.
       *  - Nếu vật đang trong khoang (cho === 'khoang', doDai === 0): xuồng đi bình thường như không vướng dây dưới nước.
       *  - Nếu vật đang trong lưới dưới nước (cho === 'luoi', doDai === L >= 1, day = [M_1..M_L]):
       *    + Nếu (nx, ny) dẫm lên bất kỳ mắt dây nào trong day (M_1..M_L): xuồng vướng chính dây/lưới đang căng dưới nước ('luoi-vuong'), đứng yên.
       *    + Ngược lại: xuồng tiến/lùi sang (nx, ny), chuỗi dây trượt 1 nấc theo vệt nước xuồng vừa rời: dayMoi = [tu, M_1, ..., M_{L-1}], vật từ M_L về M_{L-1}. */
      function diXuongKeo(ma, v, nx, ny) {
        var vt = vatTheoId(keo.id), tu = { x: rb.x, y: rb.y };
        if (keo.cho === 'khoang') {
          var vnK = vatNamTai(nx, ny);
          if (vnK) {
            var evK = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: tu, vat: 'vat', idVat: vnK.id, kieu: ma, lenh: lenhNhip };
            sk.push(evK); suKienChan.push(evK);
            return;
          }
          rb.x = nx; rb.y = ny; vt.x = nx; vt.y = ny;
          sk.push({ ma: ma, den: { x: nx, y: ny }, keo: vt.id, cho: 'khoang' });
          return;
        }
        var dayCu = keo.day || [], L = keo.doDai || dayCu.length || 1;
        if (xeDatTai(vt.x, vt.y)) {
          var elx = { ma: 'luoi-vuong', nhip: nhip, tu: tu, o: { x: vt.x, y: vt.y }, vat: 'co-xe', id: vt.id, doDai: L, kieu: ma, lenh: lenhNhip };
          sk.push(elx); suKienChan.push(elx);
          return;
        }
        if (dayCu.some(function (q) { return q.x === nx && q.y === ny; })) {
          var elv = { ma: 'luoi-vuong', nhip: nhip, tu: tu, o: { x: nx, y: ny }, vat: (vt.x === nx && vt.y === ny) ? 'vat' : 'day-luoi', id: vt.id, doDai: L, kieu: ma, lenh: lenhNhip };
          sk.push(elv); suKienChan.push(elv);
          return;
        }
        var vn = vatNamTai(nx, ny);
        if (vn) {
          var ev = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: tu, vat: 'vat', idVat: vn.id, kieu: ma, lenh: lenhNhip };
          sk.push(ev); suKienChan.push(ev);
          return;
        }
        var dayMoi = [{ x: tu.x, y: tu.y }].concat(dayCu.slice(0, L - 1));
        var denVat = dayMoi[L - 1], tuVat = { x: vt.x, y: vt.y };
        rb.x = nx; rb.y = ny;
        keo.day = dayMoi;
        vt.x = denVat.x; vt.y = denVat.y;
        sk.push({ ma: ma, den: { x: nx, y: ny }, keo: vt.id });
        sk.push({ ma: 'keo-theo', id: vt.id, tu: tuVat, den: { x: denVat.x, y: denVat.y }, doDai: L, day: dayMoi.map(function (q) { return { x: q.x, y: q.y }; }) });
      }
      /** Quay tại chỗ một góc (delta nấc 90°). Dây lưới mềm dưới nước (hoặc vật trong khoang) đứng yên tại chỗ khi xuồng xoay mũi. */
      function quayXe(delta, ma) {
        rb.huong = (rb.huong + delta) % 4;
        sk.push({ ma: ma });
      }
      /** NEO (a): anchor() / unanchor() đang chờ làm ở nhịp này. */
      function apNeo(l) {
        if (!l) return;
        var lg = { ten: l.ten, dongPy: l.dongPy }, o = { x: rb.x, y: rb.y };
        if (l.ten === 'anchor') {
          if (neo) { sk.push({ ma: 'da-neo', nhip: nhip, o: o, lenh: lg }); return; }
          neo = true; sk.push({ ma: 'tha-neo', nhip: nhip, o: o });
        } else {
          if (!neo) { sk.push({ ma: 'chua-neo', nhip: nhip, o: o, lenh: lg }); return; }
          neo = false; sk.push({ ma: 'nho-neo', nhip: nhip, o: o });
        }
      }
      /** VAN CỐNG đổi (lưới trúng V): ô dòng của nhóm bật ↔ tắt NGAY ('dong-doi'); cống của nhóm đổi ở CUỐI nhịp (capNhatCong). */
      function doiVan(vn) {
        vn.bat = !vn.bat;
        sk.push({ ma: 'van-doi', nhip: nhip, o: { x: vn.x, y: vn.y }, bat: vn.bat });
        vn.dong.forEach(function (d) { d.bat = !d.bat; sk.push({ ma: 'dong-doi', nhip: nhip, o: { x: d.x, y: d.y }, bat: d.bat }); });
        vn.cong.forEach(function (c) { c.doi = !c.doi; });
      }
      /** TAY LƯỚI THỦY LỢI (b): cast_net(d) / drop_net() / set_length(n, d) đang chờ làm ở nhịp này, trước bánh. */
      function apPhao(l) {
        if (!l) return;
        var lg = { ten: l.ten, dongPy: l.dongPy }, tu = { x: rb.x, y: rb.y };
        function hut(o, vat, h, ht, doDai) {
          var eh = { ma: 'keo-hut', nhip: nhip, tu: tu, huong: h, huongTuongDoi: ht, doDai: doDai, o: o, vat: vat, lenh: lg };
          sk.push(eh); suKienChan.push(eh);
        }
        if (l.ten === 'cast_net') {
          var ht = l.huongTuongDoi || 'front';
          var h = (rb.huong + HUONG_LUOI[ht]) % 4, v = VEC[h];
          var L = coSetLength ? daiLuoi : DAI_LUOI_MAC_DINH;
          if (keo) {
            var ek = { ma: 'dang-keo', nhip: nhip, id: keo.id, cho: keo.cho, doDai: keo.doDai, lenh: lg };
            sk.push(ek); suKienChan.push(ek); return;
          }
          var day = [];
          for (var i = 1; i <= L; i++) {
            var x = rb.x + v[0] * i, y = rb.y + v[1] * i, c = oTai(san, x, y), o = { x: x, y: y };
            if (c === null) return hut(o, 'ngoai-san', h, ht, L);
            if (c === 'V') { doiVan(vanTai[x + ',' + y]); sk.push({ ma: 'keo-van', nhip: nhip, tu: tu, o: o, huong: h, huongTuongDoi: ht, bat: vanTai[x + ',' + y].bat, soO: i - 1 }); return; }
            if (!laNuoc(san, x, y)) return hut(o, 'bo', h, ht, L);
            if (congDong(x, y)) return hut(o, 'cong', h, ht, L);
            var vn = vatNamTai(x, y);
            if (dongDoiTai(x, y) || xeDatTai(x, y)) return hut(o, (vn && vn.noi) ? 'co-xe' : 'dong-doi', h, ht, L);
            day.push({ x: x, y: y });
            if (i < L) {
              if (vn) return hut(o, 'vat-can', h, ht, L);
            } else {
              if (vn) {
                if (!vn.noi) return hut(o, 'vat', h, ht, L);
                keo = { id: vn.id, cho: 'luoi', doDai: L, day: day, huongTuongDoi: ht };
                sk.push({ ma: 'keo-vat', nhip: nhip, id: vn.id, tu: { x: vn.x, y: vn.y }, den: { x: vn.x, y: vn.y }, doDai: L, day: day.map(function (q) { return { x: q.x, y: q.y }; }), huong: h, huongTuongDoi: ht, soO: 0 });
                return;
              }
            }
          }
          // nếu ô thứ L là nước trống và ngay sau đó (trong tầm TAM_KEO = 3) là van V trên bờ thì vẫn gạt được van
          for (var iv = L + 1; iv <= TAM_KEO; iv++) {
            var xv = rb.x + v[0] * iv, yv = rb.y + v[1] * iv, cv = oTai(san, xv, yv);
            if (cv === 'V') { doiVan(vanTai[xv + ',' + yv]); sk.push({ ma: 'keo-van', nhip: nhip, tu: tu, o: { x: xv, y: yv }, huong: h, huongTuongDoi: ht, bat: vanTai[xv + ',' + yv].bat, soO: iv - 1 }); return; }
            if (!laNuoc(san, xv, yv) || congDong(xv, yv) || vatNamTai(xv, yv) || dongDoiTai(xv, yv) || xeDatTai(xv, yv)) break;
          }
          return hut({ x: rb.x + v[0] * L, y: rb.y + v[1] * L }, 'het-tam', h, ht, L);
        }
        if (l.ten === 'drop_net') {
          if (!keo) { var ekk = { ma: 'khong-keo', nhip: nhip, o: tu, lenh: lg }; sk.push(ekk); suKienChan.push(ekk); return; }
          if (keo.cho === 'khoang' || keo.doDai === 0) {
            var etk = { ma: 'trong-khoang', nhip: nhip, id: keo.id, o: tu, lenh: lg };
            sk.push(etk); suKienChan.push(etk); return;
          }
          var vd = vatTheoId(keo.id);
          vd.trangThai = 'dat';
          sk.push({ ma: 'tha-keo', nhip: nhip, id: vd.id, o: { x: vd.x, y: vd.y }, cho: 'luoi', doDai: keo.doDai });
          keo = null; daiLuoi = DAI_LUOI_MAC_DINH;
          return;
        }
        // set_length(n, d): chỉnh độ dài dây lưới (0 = kéo vật vào khoang; 1..3 = thu / thả dây lưới tới độ dài n)
        var n = l.doDai, htSet = l.huongTuongDoi || 'front', hSet = (rb.huong + HUONG_LUOI[htSet]) % 4, vSet = VEC[hSet];
        if (!keo) {
          if (n === 0) {
            var ek0 = { ma: 'khong-keo', nhip: nhip, o: tu, kieu: 'set_length', lenh: lg };
            sk.push(ek0); suKienChan.push(ek0); return;
          }
          daiLuoi = n;
          sk.push({ ma: 'dat-dai-luoi', nhip: nhip, doDai: n });
          return;
        }
        var vt = vatTheoId(keo.id), LCu = keo.doDai, tuVat = { x: vt.x, y: vt.y };
        if (n === LCu) {
          sk.push({ ma: 'da-o-dai-luoi', nhip: nhip, id: vt.id, doDai: n, lenh: lg });
          return;
        }
        if (keo.cho === 'luoi' && xeDatTai(vt.x, vt.y)) {
          var elxS = { ma: 'luoi-vuong', nhip: nhip, tu: tuVat, o: { x: vt.x, y: vt.y }, vat: 'co-xe', id: vt.id, doDai: n, kieu: 'set_length', lenh: lg };
          sk.push(elxS); suKienChan.push(elxS);
          return;
        }
        if (n === 0) {
          vt.trangThai = 'khoang'; vt.x = rb.x; vt.y = rb.y;
          keo = { id: vt.id, cho: 'khoang', doDai: 0, day: [] };
          sk.push({ ma: 'doi-dai-luoi', nhip: nhip, id: vt.id, tu: tuVat, den: { x: rb.x, y: rb.y }, tuDai: LCu, doDai: 0, cho: 'khoang', day: [] });
          return;
        }
        daiLuoi = n;
        if (n < LCu) {
          var dayNg = keo.day.slice(0, n), denNg = dayNg[n - 1], lyNg = oNoiChan(denNg.x, denNg.y);
          if (lyNg) {
            var eln = { ma: 'luoi-vuong', nhip: nhip, tu: tuVat, o: { x: denNg.x, y: denNg.y }, vat: lyNg, id: vt.id, doDai: n, kieu: 'set_length', lenh: lg };
            sk.push(eln); suKienChan.push(eln); return;
          }
          vt.trangThai = 'dat'; vt.x = denNg.x; vt.y = denNg.y;
          keo.cho = 'luoi'; keo.doDai = n; keo.day = dayNg;
          sk.push({ ma: 'doi-dai-luoi', nhip: nhip, id: vt.id, tu: tuVat, den: { x: denNg.x, y: denNg.y }, tuDai: LCu, doDai: n, cho: 'luoi', day: dayNg.map(function (q) { return { x: q.x, y: q.y }; }) });
          return;
        }
        // n > LCu: đẩy từ khoang (LCu === 0) hoặc nới thêm dây khi đang dưới nước (LCu > 0)
        if (LCu === 0) {
          var dayOut = [];
          for (var io = 1; io <= n; io++) {
            var xo = rb.x + vSet[0] * io, yo = rb.y + vSet[1] * io, lyo = oNoiChan(xo, yo);
            if (lyo) {
              var elo = { ma: 'luoi-vuong', nhip: nhip, tu: tu, o: { x: xo, y: yo }, vat: lyo, id: vt.id, doDai: n, kieu: 'set_length', lenh: lg };
              sk.push(elo); suKienChan.push(elo); return;
            }
            dayOut.push({ x: xo, y: yo });
          }
          var denOut = dayOut[n - 1];
          vt.trangThai = 'dat'; vt.x = denOut.x; vt.y = denOut.y;
          keo = { id: vt.id, cho: 'luoi', doDai: n, day: dayOut, huongTuongDoi: htSet };
          sk.push({ ma: 'doi-dai-luoi', nhip: nhip, id: vt.id, tu: tu, den: { x: denOut.x, y: denOut.y }, tuDai: 0, doDai: n, cho: 'luoi', day: dayOut.map(function (q) { return { x: q.x, y: q.y }; }), huong: hSet, huongTuongDoi: htSet });
          return;
        }
        var gocTruoc = LCu >= 2 ? keo.day[LCu - 2] : tu, cuoiCu = keo.day[LCu - 1];
        var vExt = l.huongTuongDoi ? vSet : [cuoiCu.x - gocTruoc.x, cuoiCu.y - gocTruoc.y];
        var dayExt = keo.day.map(function (q) { return { x: q.x, y: q.y }; });
        for (var ie = 1; ie <= n - LCu; ie++) {
          var xe = cuoiCu.x + vExt[0] * ie, ye = cuoiCu.y + vExt[1] * ie;
          var lye = oNoiChan(xe, ye) || (dayExt.some(function (q) { return q.x === xe && q.y === ye; }) ? 'day-luoi' : null);
          if (lye) {
            var ele = { ma: 'luoi-vuong', nhip: nhip, tu: tuVat, o: { x: xe, y: ye }, vat: lye, id: vt.id, doDai: n, kieu: 'set_length', lenh: lg };
            sk.push(ele); suKienChan.push(ele); return;
          }
          dayExt.push({ x: xe, y: ye });
        }
        var denExt = dayExt[n - 1];
        vt.trangThai = 'dat'; vt.x = denExt.x; vt.y = denExt.y;
        keo.cho = 'luoi'; keo.doDai = n; keo.day = dayExt;
        sk.push({ ma: 'doi-dai-luoi', nhip: nhip, id: vt.id, tu: tuVat, den: { x: denExt.x, y: denExt.y }, tuDai: LCu, doDai: n, cho: 'luoi', day: dayExt.map(function (q) { return { x: q.x, y: q.y }; }) });
      }
      /** DÒNG CHẢY (chỗ băng chuyền): vật nổi tự do trôi trước (một lần mỗi nhịp, theo id), rồi xuồng không neo đứng trên ô dòng đang chạy bị đẩy `suc` ô, từng ô một. */
      function troiDong() {
        if (!dongs.length) return;
        if (vatTroiNhip !== nhip) { vatTroiNhip = nhip; troiVatNoi(); }
        if (!laXuong) return;
        var d = dongChay(rb.x, rb.y);
        if (!d) return;
        var tu = { x: rb.x, y: rb.y };
        if (neo) { sk.push({ ma: 'neo-giu', nhip: nhip, o: tu, huong: d.huong, suc: d.suc }); return; }
        var v = VEC[d.huong], so = 0, chan = null;
        for (var i = 0; i < d.suc; i++) {
          chan = buocTroi(v);
          if (chan) break;
          so++;
        }
        if (so) sk.push({ ma: 'troi', nhip: nhip, ai: 'robot', tu: tu, den: { x: rb.x, y: rb.y }, huong: d.huong, suc: d.suc, soO: so, chan: chan });
        else { var etc = { ma: 'troi-chan', nhip: nhip, ai: 'robot', o: tu, huong: d.huong, vat: chan }; sk.push(etc); suKienChan.push(etc); }
        demBang = 0;
      }
      /** Một ô trôi của xuồng (cả cụm nếu đang kéo) theo véc-tơ v. Trả null nếu đi được, hay lý do chặn. */
      function buocTroi(v) {
        var nx = rb.x + v[0], ny = rb.y + v[1], tu = { x: rb.x, y: rb.y };
        var vt = keo ? vatTheoId(keo.id) : null;
        var ly = lyDoChan(san, loai, nx, ny);
        if (!ly && congDong(nx, ny)) ly = 'cong';
        if (!ly && dongDoiChanDi(nx, ny)) ly = 'dong-doi';
        if (!ly && vt && keo.cho === 'luoi' && keo.day && keo.day.some(function (q) { return q.x === nx && q.y === ny; })) ly = 'vat';
        if (!ly && vatNamTai(nx, ny)) ly = 'vat';
        if (ly) return ly;
        rb.x = nx; rb.y = ny;
        if (vt && keo.cho === 'khoang') {
          vt.x = nx; vt.y = ny;
          return null;
        }
        if (vt && keo.cho === 'luoi') {
          var L = keo.doDai || keo.day.length || 1;
          var dayMoi = [{ x: tu.x, y: tu.y }].concat(keo.day.slice(0, L - 1)), denVat = dayMoi[L - 1];
          keo.day = dayMoi;
          sk.push({ ma: 'keo-theo', id: vt.id, tu: { x: vt.x, y: vt.y }, den: { x: denVat.x, y: denVat.y }, doDai: L, day: dayMoi.map(function (q) { return { x: q.x, y: q.y }; }) });
          vt.x = denVat.x; vt.y = denVat.y;
        }
        return null;
      }
      /** Vật nổi TỰ DO (không bị kéo, không có xe cạn đứng trên) nằm trên ô dòng đang chạy: trôi `suc` ô, từng ô, dừng trước vật cản. */
      function troiVatNoi() {
        vats.forEach(function (vn) {
          if (!vn.noi || vn.trangThai !== 'dat') return;
          if ((keo && keo.id === vn.id) || xeKhac.some(function (xk) { return xk.keoId === vn.id; })) return;
          if ((!laDrone && !laXuong && rb.x === vn.x && rb.y === vn.y) || xeDatTai(vn.x, vn.y)) return;
          var d = dongChay(vn.x, vn.y);
          if (!d) return;
          var v = VEC[d.huong], tu = { x: vn.x, y: vn.y }, so = 0, chan = null;
          for (var i = 0; i < d.suc; i++) {
            var nx = vn.x + v[0], ny = vn.y + v[1];
            chan = oNoiChan(nx, ny);
            if (chan) break;
            vn.x = nx; vn.y = ny; so++;
          }
          if (so) sk.push({ ma: 'troi', nhip: nhip, ai: 'vat', id: vn.id, tu: tu, den: { x: vn.x, y: vn.y }, huong: d.huong, soO: so, chan: chan });
          else sk.push({ ma: 'troi-chan', nhip: nhip, ai: 'vat', id: vn.id, o: tu, huong: d.huong, vat: chan });
        });
      }
      /** Cuối nhịp: cống đổi theo van (đã bị dây phao gạt trong nhịp). Không đóng xuống ô đang có xuồng / vật: giữ mở ('cong-ket'). */
      function capNhatCong() {
        congs.forEach(function (c) {
          if (!c.doi) return;
          c.doi = false;
          var muon = !c.mo;
          if (!muon && ((rb.x === c.x && rb.y === c.y) || dongDoiBatKy(c.x, c.y) || vatNamTai(c.x, c.y))) {
            var ek = { ma: 'cong-ket', nhip: nhip, o: { x: c.x, y: c.y }, voi: vatNamTai(c.x, c.y) ? 'vat' : 'xe', lenh: lenhNhip };
            sk.push(ek); suKienChan.push(ek);
            return;
          }
          c.mo = muon;
          sk.push({ ma: 'cong-doi', nhip: nhip, o: { x: c.x, y: c.y }, mo: muon });
        });
      }

      /* ---------------- CẢNG SÔNG (xem phần CẢNG SÔNG đầu tệp): cần cẩu, mỗi lệnh một nhịp ---------------- */
      /** Container đang treo đi theo đầu cần. */
      function treoTheo() {
        var o = oDauCan(); treo.forEach(function (c) { c.x = o.x; c.y = o.y; });
        var idCam = coNamCham ? nc.cam : coTay ? tay.cam : null;                 // M9B2 (L1, L8): vật dính nam châm / trong gầu ngoạm treo ở ô đầu cần
        if (idCam !== null) { var vc = vatTheoId(idCam); vc.x = o.x; vc.y = o.y; }
      }
      /** M9B2: lý do ô đầu cần (x, y) không nhận vật thả từ nam châm / gầu ngoạm (null = thả được): như oThaChan, thêm mặt nước (trừ boong tàu đang cập) và ô có chồng container. */
      function cauThaChan(x, y) {
        var ly = oThaChan(x, y);
        if (ly) return ly;
        if (laNuoc(san, x, y) && !(oTai(san, x, y) === 'T' && tauDauTai(x, y))) return 'nuoc';
        if (chongO(x, y).length) return 'chong';
        return null;
      }
      /** M9B2 thả vật `vt` của nam châm / gầu ngoạm xuống ô đầu cần o; bị chặn: 'tha-bi-chan' { id, o, vat, kieu } (lỗi), vật vẫn treo. Trả true nếu thả được. */
      function cauTha(vt, o, kieu, lg) {
        var ly = cauThaChan(o.x, o.y);
        if (ly) { var eb = { ma: 'tha-bi-chan', nhip: nhip, id: vt.id, o: o, vat: ly, kieu: kieu, lenh: lg }; sk.push(eb); suKienChan.push(eb); return false; }
        vt.trangThai = 'dat'; vt.x = o.x; vt.y = o.y;
        sk.push({ ma: kieu === 'gau' ? 'gau-tha' : 'cau-tha', nhip: nhip, o: o, vat: vt.id });
        if (dichSet[o.x + ',' + o.y] && !hopMauDich(vt, o.x, o.y)) {
          var esm = { ma: 'dat-sai-mau', nhip: nhip, id: vt.id, o: o, mauVat: vt.mau || 'none', mauDich: dichMau[o.x + ',' + o.y], chat: vt.chat, cuc: vt.cuc };
          sk.push(esm); suKienChan.push(esm);
        }
        return true;
      }
      /** M9B2 (L1) CẦN CẨU + NAM CHÂM, cuối nhịp (phaC): nam châm có cực, chưa dính gì → vật ở Ô ĐẦU CẦN (qua tường được: cần cao hơn mọi thứ) bị hút như nam châm bụng drone:
       *  sắt (cực nào cũng hút) hay vật nam châm khác cực → 'cau-hut' { o, vat }; cùng cực → 'cung-cuc'; gỗ / vật nổi → 'hut-go' (lỗi, như drone). Không áp luật tải (vật không có tấn). */
      function cauHut() {
        if (!coNamCham || nc.cuc === null || nc.cam !== null) return;
        var o = oDauCan(), vd = vatNamTai(o.x, o.y);
        if (!vd) return;
        if (demBiGiu(vd, o)) return;
        if (vd.chat === 'sat' || (vd.chat === 'nam-cham' && vd.cuc !== nc.cuc)) {
          vd.trangThai = 'cam'; vd.x = o.x; vd.y = o.y; nc.cam = vd.id;
          sk.push({ ma: 'cau-hut', nhip: nhip, o: o, vat: vd.id });
          return;
        }
        var e = vd.chat === 'nam-cham' ? { ma: 'cung-cuc', nhip: nhip, id: vd.id, o: o, cuc: vd.cuc } : { ma: 'hut-go', nhip: nhip, id: vd.id, o: o, khoang: 0 };
        sk.push(e); suKienChan.push(e);
      }
      function hetTam(vat, o, lg) { var e = { ma: 'can-het-tam', nhip: nhip, lenh: lg, vat: vat, nac: nac, tam: tam, o: o || oDauCan() }; sk.push(e); suKienChan.push(e); }
      function quaTai(tan, tamXet, lg, cont) { var e = { ma: 'qua-tai', nhip: nhip, lenh: lg, tan: tan, tam: tamXet, tai: tan * tamXet, taiToiDa: taiToiDa, o: oDauCan(), cont: cont.map(chupCont) }; sk.push(e); suKienChan.push(e); }
      /** (a) hành động của cần cẩu trong nhịp: h.ten = null (wait) | swing_left | swing_right | extend | retract | pick_up | pick_up2 | set_down | rail (h.ray = { n, huong, chan } dùng chung cho abs(n) nhịp). */
      function apCau(h) {
        var ten = h.ten, lg = h.lenhDi || null, o = oDauCan(), k = o.x + ',' + o.y;
        if (!ten) { sk.push({ ma: 'dung-yen' }); return; }
        if (CAU_LENH[ten] === 'quay') {
          var nacMoi = (nac + (ten === 'swing_right' ? 1 : SO_NAC - 1)) % SO_NAC, dM = NAC_VEC[nacMoi], dauM = { x: rb.x + dM[0] * tam, y: rb.y + dM[1] * tam };
          if (oTai(san, dauM.x, dauM.y) === null) return hetTam('ngoai-san', dauM, lg);
          sk.push({ ma: 'quay-can', nhip: nhip, tu: nac, den: nacMoi, chieu: ten === 'swing_right' ? 1 : -1, dau: dauM });
          nac = nacMoi; treoTheo(); return;
        }
        if (CAU_LENH[ten] === 'vuon') {
          var tamMoi = tam + (ten === 'extend' ? 1 : -1);
          if (tamMoi < 1 || tamMoi > TAM_CAU_TOI_DA) return hetTam('tam', null, lg);
          var dT = NAC_VEC[nac], dauT = { x: rb.x + dT[0] * tamMoi, y: rb.y + dT[1] * tamMoi };
          if (oTai(san, dauT.x, dauT.y) === null) return hetTam('ngoai-san', dauT, lg);
          if (ten === 'extend' && taiToiDa !== null && treo.length && tongTan(treo) * tamMoi > taiToiDa) return quaTai(tongTan(treo), tamMoi, lg, treo);
          sk.push({ ma: ten === 'extend' ? 'vuon-can' : 'thu-can', nhip: nhip, tu: tam, den: tamMoi, dau: dauT });
          tam = tamMoi; treoTheo(); return;
        }
        if (ten === 'pick_up' || ten === 'pick_up2') {
          var ch = oTai(san, o.x, o.y) === null ? [] : chongO(o.x, o.y), tauM = tauDauTai(o.x, o.y);
          if (treo.length) { var edt = { ma: 'dang-treo', nhip: nhip, o: o, cont: chupTreo(), lenh: lg }; sk.push(edt); suKienChan.push(edt); return; }
          if (!ch.length) { var emh = { ma: 'moc-hut', nhip: nhip, o: o, vat: oTai(san, o.x, o.y) === null ? 'ngoai-san' : (oTai(san, o.x, o.y) === 'T' && !tauM) ? 'tau-vang' : 'trong', lenh: lg }; sk.push(emh); suKienChan.push(emh); return; }
          var soLay = ten === 'pick_up2' ? 2 : 1;
          if (soLay === 2 && ch.length < 2) { var emt = { ma: 'moc-thieu', nhip: nhip, o: o, co: ch.length, lenh: lg }; sk.push(emt); suKienChan.push(emt); return; }
          var lay = ch.slice(ch.length - soLay);
          if (taiToiDa !== null && tongTan(lay) * tam > taiToiDa) return quaTai(tongTan(lay), tam, lg, lay);
          ch.splice(ch.length - soLay, soLay);
          lay.forEach(function (c) { c.trangThai = 'treo'; c.x = o.x; c.y = o.y; });
          treo = lay;
          sk.push({ ma: 'moc-cont', nhip: nhip, o: o, cont: lay.map(chupCont), doi: soLay === 2, tau: tauM ? tauM.i : null });
          return;
        }
        if (ten === 'set_down') {
          if (!treo.length) { var ekt = { ma: 'khong-treo', nhip: nhip, o: o, lenh: lg }; sk.push(ekt); suKienChan.push(ekt); return; }
          var lyH = oHaChan(o.x, o.y, treo.length);
          if (lyH) { var ehb = { ma: 'ha-bi-chan', nhip: nhip, o: o, vat: lyH, cont: chupTreo(), lenh: lg }; sk.push(ehb); suKienChan.push(ehb); return; }
          var chH = chongO(o.x, o.y);
          if (luatThap && chH.length && treo[0].so > chH[chH.length - 1].so) {
            var ets = { ma: 'thap-sai', nhip: nhip, o: o, so: treo[0].so, tren: chH[chH.length - 1].so, lenh: lg }; sk.push(ets); suKienChan.push(ets); return;
          }
          if (!chongTai[k]) chongTai[k] = [];
          treo.forEach(function (c) { c.trangThai = 'chong'; c.x = o.x; c.y = o.y; chongTai[k].push(c); });
          var tauH = tauDauTai(o.x, o.y);
          sk.push({ ma: 'ha-cont', nhip: nhip, o: o, cont: chupTreo(), doi: treo.length === 2, tau: tauH ? tauH.i : null });
          treo = [];
          return;
        }
        if (TAY_NAM_CHAM.indexOf(ten) >= 0) {                                   // M9B2 (L1): nam châm ở đầu cần (thay chỗ móc); hút làm ở cuối nhịp (cauHut)
          if (ten !== 'magnet_off') {
            if (nc.cam !== null && vatTheoId(nc.cam).chat === 'sat' && nc.cuc !== null && nc.cuc !== h.cuc) { var esd = { ma: 'sat-khong-day', nhip: nhip, id: nc.cam, cuc: h.cuc, lenh: lg }; sk.push(esd); suKienChan.push(esd); }
            nc.cuc = h.cuc; nc.bat = true; nc.lenhCuc = lg; return;
          }
          if (nc.cam !== null && !cauTha(vatTheoId(nc.cam), o, 'nam-cham', lg)) return;     // thả bị chặn: vật vẫn dính, nam châm vẫn bật
          nc.cam = null; nc.cuc = null; nc.bat = false; nc.lenhCuc = null; return;
        }
        if (ten === 'grab') {                                                    // M9B2 (L8): GẦU NGOẠM thả từ đầu cần xuống ô đầu cần (qua tường), ngoạm vật thường
          var lyG = null, vg = null;
          if (tay.cam !== null) lyG = 'dang-cam';
          else if (oTai(san, o.x, o.y) === null) lyG = 'ngoai-san';
          else if (thungTai(o.x, o.y)) lyG = 'qua-nang';                       // thùng nặng: gầu không nhấc nổi
          else if (chongO(o.x, o.y).length) lyG = 'container';                 // container: phải dùng móc cẩu
          else {
            vg = vatNamTai(o.x, o.y);
            if (!vg) lyG = 'khong-co-vat';
            else if (vg.noi) lyG = 'vat-noi';                                    // vật nổi trên nước: gầu không vớt (giỏ cứu hộ L9 là gói sau)
            else if (demGiuVat(vg)) lyG = 'dem-giu';
          }
          if (lyG) { var egh = { ma: 'gau-hut', nhip: nhip, o: o, lyDo: lyG, lenh: lg }; sk.push(egh); suKienChan.push(egh); return; }
          vg.trangThai = 'cam'; vg.x = o.x; vg.y = o.y; tay.cam = vg.id; tay.kep = true;
          sk.push({ ma: 'gau-ngoam', nhip: nhip, o: o, vat: vg.id });
          return;
        }
        if (ten === 'release') {
          if (tay.cam === null) { var egt = { ma: 'gau-hut', nhip: nhip, o: o, lyDo: 'gau-trong', lenh: lg }; sk.push(egt); suKienChan.push(egt); return; }
          if (!cauTha(vatTheoId(tay.cam), o, 'gau', lg)) return;
          tay.cam = null; tay.kep = false; return;
        }
        if (ten === 'rail') {
          var r = h.ray;
          if (r.chan) { sk.push({ ma: 'dung-yen' }); return; }                        // phần còn lại của rail(n) sau khi bị chặn: bệ đứng yên, nhịp vẫn trôi
          var vR = rayO && rayO.doc ? [0, r.huong] : [r.huong, 0], nx = rb.x + vR[0], ny = rb.y + vR[1];
          var lyR = !laRay(nx, ny) ? (oTai(san, nx, ny) === null ? 'ngoai-san' : 'het-ray') : dongDoiChanDi(nx, ny) ? 'robot' : thungTai(nx, ny) ? 'thung-nang' : vatNamTai(nx, ny) ? 'vat' : null;
          var dN = NAC_VEC[nac];
          if (!lyR && oTai(san, nx + dN[0] * tam, ny + dN[1] * tam) === null) lyR = 'can-ngoai-san';     // bệ chạy tới thì đầu cần lòi ra ngoài sân: không chạy (đầu cần luôn trong sân)
          if (lyR) {
            r.chan = true;
            var ehr = { ma: 'het-ray', nhip: nhip, o: { x: rb.x, y: rb.y }, den: { x: nx, y: ny }, vat: lyR, n: r.n, daDi: r.daDi, lenh: lg }; sk.push(ehr); suKienChan.push(ehr); return;
          }
          var tuR = { x: rb.x, y: rb.y };
          rb.x = nx; rb.y = ny; r.daDi++;
          sk.push({ ma: 'chay-ray', nhip: nhip, tu: tuR, den: { x: nx, y: ny }, huong: r.huong, doc: !!(rayO && rayO.doc), dau: oDauCan() });
          treoTheo(); return;
        }
        sk.push({ ma: 'dung-yen' });
      }
      /** Cuối nhịp: tàu cập / rời theo chu kỳ. Tàu rời: mọi container trên boong được GIAO theo tàu ('tau-roi'); giao sai danh sách (mục tiêu giao-tau) thì thua ngay ('giao-nham'). */
      function capNhatTau() {
        taus.forEach(function (t) {
          var muon = tauCoMat(t, nhip);
          if (muon === t.coMat) return;
          t.coMat = muon;
          if (muon) { sk.push({ ma: 'tau-cap', nhip: nhip, tau: t.i, o: t.o.slice() }); return; }
          var giao = [];
          t.o.forEach(function (q) {
            var kq = q.x + ',' + q.y, ch = chongTai[kq];
            if (ch && ch.length) { ch.forEach(function (c) { c.trangThai = 'giao'; c.tau = t.i; giao.push(c); }); chongTai[kq] = []; }
          });
          sk.push({ ma: 'tau-roi', nhip: nhip, tau: t.i, o: t.o.slice(), cont: giao.map(function (c) { return c.so; }) });
          giao.forEach(function (c) {
            daGiao[t.i].push(c.so);
            if (giaoDs && !dungSom) {
              var g = giaoDs.filter(function (h) { return h.tau === t.i; })[0];
              if (!g || g.so.indexOf(c.so) < 0) {
                dungSom = 'giao-nham';
                var egn = { ma: 'giao-nham', nhip: nhip, tau: t.i, so: c.so, o: { x: c.x, y: c.y }, can: g ? g.so.slice() : [] }; sk.push(egn); suKienChan.push(egn);
              }
            }
          });
        });
      }

      function phaA() {
        var dauX = rb.x, dauY = rb.y;
        if (hanhDong.kieu === 'cau') apCau(hanhDong);                        // CẢNG SÔNG: cần cẩu (bệ không bị băng / bàn xoay / cổng tác động: xem khoiRobot)
        else if (hanhDong.kieu === 'banh') {
          var t = hanhDong.trai, p = hanhDong.phai, tr = hanhDong.truot || null, ch = hanhDong.cheo || null;
          if (tr || ch) banhGhi = { trai: 0, phai: 0 };                         // omni trượt / chéo: bánh chạy dọc đứng yên
          else banhGhi = { trai: t, phai: p };
          apTay();
          apNamCham();
          if (laGai) apGai(hanhDong.gai);                                     // BÁNH GAI (mùa 8 Hang động): thu / bung gai ở đầu nhịp, trước khi bánh chạy
          if (coSon) apSon(hanhDong.son);                                     // (a) đầu sơn: chấm / hạ / nhấc, ở ô đang đứng, TRƯỚC khi bánh chạy
          if (coLoa) { loa.am = null; apLoa(hanhDong.loa); }                  // (a) loa: phát nốt / ngân nhịp trong nhịp này (vừa đi vừa phát được)
          if (laXuong) { apNeo(hanhDong.neo); apPhao(hanhDong.phao); }        // BẾN SÔNG: (a) neo, (b) dây phao, rồi mới tới chân vịt
          if (laXuong && neo && (t !== 0 || p !== 0)) {                        // đang neo: lệnh bánh bị bỏ, xuồng đứng yên, mất nhịp (như 'dang-dau' của drone)
            banhGhi = { trai: 0, phai: 0 };
            var edn = { ma: 'dang-neo', nhip: nhip, o: { x: rb.x, y: rb.y }, lenh: hanhDong.lenhBanh || null };
            sk.push(edn); suKienChan.push(edn);
          }
          else if (coNem && hanhDong.nem) {                                          // nhịp có load() / throw(): xe đứng yên, lệnh bánh / trượt bị bỏ
            banhGhi = { trai: 0, phai: 0 };
            if (t !== 0 || p !== 0 || tr || ch) {
              var en = { ma: 'nem-dung-yen', nhip: nhip, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : ch ? { ten: ch.ten, dongPy: ch.dongPy } : hanhDong.lenhBanh) || null, nem: { ten: hanhDong.nem.ten, dongPy: hanhDong.nem.dongPy } };
              sk.push(en); suKienChan.push(en);
            }
            if (loai === 'xich') xichThoi(sk);
            apNem(hanhDong.nem);
          }
          else if (coHoi && hanhDong.hoi) {                                          // nhịp có spray() / spray_back(): bắn rồi giật; lệnh bánh / trượt cùng nhịp bị bỏ
            banhGhi = { trai: 0, phai: 0 };
            var lh = hanhDong.hoi;
            if (t !== 0 || p !== 0 || tr || ch) {
              var eby = { ma: 'ban-dung-yen', nhip: nhip, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : ch ? { ten: ch.ten, dongPy: ch.dongPy } : hanhDong.lenhBanh) || null, ban: { ten: lh.ten, dongPy: lh.dongPy } };
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
          else if (coTay && tay.tuThe === 'duoi' && (tr || ch || t !== 0 || p !== 0)) {   // (c) bánh chạy — nhưng tay vướng sàn
            var ev = { ma: 'tay-vuong', nhip: nhip, tu: { x: rb.x, y: rb.y }, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : ch ? { ten: ch.ten, dongPy: ch.dongPy } : hanhDong.lenhBanh) || null };
            sk.push(ev); suKienChan.push(ev);
            if (loai === 'xich') xichThoi(sk);                                // bánh không chạy: quay dở (nếu có) mất
          }
          else if (ch) {                                                      // omni nâng cấp chéo: đi chéo 1 ô trong 1 nhịp
            cheoGhi = ch.bien;
            thuCheo(ch.bien);
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
          else if ((t === 1 && p === -1) || (t === -1 && p === 1)) quayXe(2, 'quay-dau');
          else if ((t === 1 && p === 0) || (t === 0 && p === -1)) quayXe(1, 'quay-phai');
          else if ((t === 0 && p === 1) || (t === -1 && p === 0)) quayXe(3, 'quay-trai');
          else sk.push({ ma: 'dung-yen' });
        } else if (hanhDong.kieu === 'drone') {
          dauDauNhip = dau;
          apNamCham();                                                        // (a) lệnh nam châm (thả trước khi bay)
          if (coSon) apSon(hanhDong.son);                                     // (a) đầu sơn treo dưới bụng: chấm / hạ / nhấc ở ô đang ở, TRƯỚC khi bay
          if (coLoa) { loa.am = null; apLoa(hanhDong.loa); }
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
          if (coSon) apSon(hanhDong.son);                                     // NHỆN + BỘ GIEO HẠT (M9B1, L6): chấm / hạ / nhấc ở ô dưới bụng, TRƯỚC khi bước (nhịp đầu của go_* hay nhịp wait())
          if (coLoa) { loa.am = null; apLoa(hanhDong.loa); }
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
            var lyB = lyDoChan(san, loai, bx, by) || (lyCua(bx, by)) || (thungTai(bx, by) ? 'thung-nang' : null) || (vatNamTai(bx, by) ? 'vat' : null) || (dongDoiChanDi(bx, by) ? 'dong-doi' : null) || (loai === 'nhen' && chan !== 'co' && oTai(san, bx, by) === 'n' ? 'gam-thap' : null);
            if (lyB) sk.push({ ma: 'bang-chan', den: { x: bx, y: by }, vat: lyB });
            else { rb.x = bx; rb.y = by; sk.push({ ma: 'bang-day', den: { x: bx, y: by } }); truotDaUot(vb[0], vb[1]); }
            demBang = 0;
          }
        } else demBang = 0;

        troiDong();                                                            // DÒNG CHẢY (Bến sông) — chỗ băng chuyền: vật nổi trôi, rồi xuồng không neo trôi `suc` ô mỗi nhịp
        demTuKeo();                                                            // ĐỆM TỪ — ngay sau băng chuyền: đệm trong tầm kéo / đẩy robot 1 ô
        demTuVat();                                                            // rồi kéo / đẩy vật sắt, vật nam châm nằm đất 1 ô (P1b)

        // sàn dốc (mùa 6 Mỏ đá: m.sanDoc) — cuối bước của nhịp, nếu đứng trên ô sàn dốc thì bị trôi 1 ô theo hướng dốc
        var hdSD = sanDocMap[rb.x + ',' + rb.y];
        if (hdSD !== undefined && !laDrone && !laCau) {
          var vbSD = VEC[hdSD], sxSD = rb.x + vbSD[0], sySD = rb.y + vbSD[1];
          var lySD = lyDoChan(san, loai, sxSD, sySD) || (lyCua(sxSD, sySD)) || (thungTai(sxSD, sySD) ? 'thung-nang' : null) || (vatNamTai(sxSD, sySD) ? 'vat' : null) || (dongDoiChanDi(sxSD, sySD) ? 'dong-doi' : null) || (loai === 'nhen' && chan !== 'co' && oTai(san, sxSD, sySD) === 'n' ? 'gam-thap' : null);
          if (lySD) sk.push({ ma: 'san-doc-chan', nhip: nhip, o: { x: rb.x, y: rb.y }, den: { x: sxSD, y: sySD }, huong: hdSD, vat: lySD });
          else { var tuSD = { x: rb.x, y: rb.y }; rb.x = sxSD; rb.y = sySD; sk.push({ ma: 'san-doc', nhip: nhip, tu: tuSD, den: { x: sxSD, y: sySD }, huong: hdSD }); }
        }

        // bàn xoay (@ xoay phải 90°, % xoay trái 90°) — xoay khi robot vừa đi vào ô bàn xoay, hoặc đứng chờ (wait) trên bàn xoay
        var cbx = oTai(san, rb.x, rb.y);
        var doiTayBX = !!(hanhDong.tay && (hanhDong.tay.tuThe !== null || hanhDong.tay.kep !== null || hanhDong.tay.xoay !== null));
        var doiKhacBX = !!(hanhDong.nc || hanhDong.nem || hanhDong.hoi || hanhDong.son || hanhDong.loa || hanhDong.gai);
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

        // NGÁCH HANG NGẦM (mùa 8 Hang động: cfg.ngachHang) — sau bước di chuyển (kể cả trượt trên 'I'), nếu đáp đúng đầu ngách a thì chui sang b (và ngược lại) 1 lần trong nhịp
        var capNgach = (rb.x !== dauX || rb.y !== dauY) ? ngachCap[rb.x + ',' + rb.y] : null;
        if (capNgach) {
          var lyN = (!laDrone && thungTai(capNgach.x, capNgach.y) ? 'thung-nang' : null) ||
                    (!laDrone && vatNamTai(capNgach.x, capNgach.y) ? 'vat' : null) ||
                    (cuaDong(capNgach.x, capNgach.y) ? lyCua(capNgach.x, capNgach.y) : null) ||
                    (dongDoiChanDi(capNgach.x, capNgach.y) ? 'dong-doi' : null);
          if (lyN) {
            var ecn = { ma: 'ngach-chan', nhip: nhip, id: capNgach.id, tu: { x: rb.x, y: rb.y }, den: { x: capNgach.x, y: capNgach.y }, vat: lyN };
            sk.push(ecn); suKienChan.push(ecn);
          } else {
            var tuN = { x: rb.x, y: rb.y };
            rb.x = capNgach.x; rb.y = capNgach.y; demBang = 0;
            sk.push({ ma: 'qua-ngach', nhip: nhip, id: capNgach.id, tu: tuN, den: { x: capNgach.x, y: capNgach.y } });
          }
        }

        vatTheoXe();                                                           // vật đang cầm đi theo xe
        if (coSon && son.ha) toO(rb.x, rb.y, son.mau, 'net', lenhNhip);        // (d) đầu sơn đang hạ: tô ô xe đứng cuối nhịp (nét liền, kể cả ô góc khi quay)
      }
      function phaB() { if (thungs.length) bangThung(); }                    // băng chuyền đẩy thùng nặng
      function phaC() { if (laCau) cauHut(); else hutVat(); }      // M9B2: cần cẩu + nam châm hút ở ô đầu cần                                          // nam châm hút vật sắt trước mặt (cuối nhịp)
      function phaD() { capNhatCua(); capNhatCong(); capNhatTau(); }        // cửa đổi ở cuối nhịp (theo nút hay theo chu kỳ); cống đổi theo van (Bến sông); tàu cập / rời (Cảng sông)
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

        if (diQua.length) {                                                    // bóng mờ: cuối nhịp robot (hoặc đầu cần cẩu) đứng ở ô diQua nào thì ô đó "đã đi qua"
          var oDq = laCau ? oDauCan() : rb;
          var dq = diQuaTai[oDq.x + ',' + oDq.y] || (laCau ? diQuaTai[rb.x + ',' + rb.y] : null);
          if (dq && !dq.da) { dq.da = true; sk.push({ ma: 'qua-diem', nhip: nhip, o: { x: dq.x, y: dq.y } }); }
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
        } else if (mucTieu === 'dap-lua') {
          if (luaXong() && (!san.co || (rb.x === san.co.x && rb.y === san.co.y))) { thang = true; sk.push({ ma: 'xong-dap-lua' }); }
        } else if (mucTieu === 'to-hinh') {
          if (hinhDat()) { thang = true; sk.push({ ma: 'xong-to-hinh' }); }
          else if (toThua) dungSom = 'to-thua';                                // tô ra ngoài hình: không xóa được, không thể thắng nữa
        } else if (mucTieu === 'choi-dieu' && !laDoi) {
          if (!dieuHong && dieuBatDau !== null && !coTieng && dieuDung < dieu.length) {     // nhịp im / ngân sau tiếng đầu: đúng nếu điệu cần lặng/ngân, không thì vào trễ
            if (dieu[dieuDung] === null) dieuDung++;
            else {
              dieuHong = { ma: 'lo-nhip', nhip: nhip, viTri: dieuDung, can: dieu[dieuDung], choi: null, lenh: hanhDong.lenhWait || lenhNhip || null };
              sk.push(dieuHong); suKienChan.push(dieuHong);
            }
          }
          if (dieuHong) dungSom = dieuHong.ma;                                 // tiếng đã phát không rút lại được: không thể thắng nữa
          else if (dieuDung === dieu.length && (!dieuToiCo || (rb.x === san.co.x && rb.y === san.co.y))) { thang = true; sk.push({ ma: 'xong-dieu' }); }
        } else if (mucTieu === 'giao-tau') {
          if (!dungSom && giaoTauXong()) { thang = true; sk.push({ ma: 'xong-giao-tau' }); }   // CẢNG SÔNG: mọi container yêu cầu đã theo tàu (tàu rời ở pha d cùng nhịp)
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
        if (loai === 'omni') { r.truot = truotGhi; if (cheoGhi) r.cheo = cheoGhi; }
        if (laGai) r.gai = gai;                                                // bánh gai (mùa 8): trạng thái bung gai cuối nhịp
        if (laDrone) { r.pin = pin; r.dangMang = nc.cam; if (coDap) r.dau = dau; }
        else if (ncBung()) r.dangMang = nc.cam;                                 // nhện nam châm bụng: vật đang treo dưới bụng
        else if (laCau && (coNamCham || coTay)) r.dangMang = coNamCham ? nc.cam : tay.cam;   // M9B2 (L1, L8): vật treo ở đầu cần
        var mucVet = { loai: 'nhip', nhip: nhip, robot: r, suKien: sk };
        if (coTay) { r.tay = chupTay(); mucVet.vat = chupVat(); }
        if (coNamCham) { r.namCham = chupNamCham(); mucVet.vat = chupVat(); }
        if (coNem) { r.nem = chupNem(); mucVet.vat = chupVat(); }
        if (thungs.length) mucVet.thung = chupThung();
        if (coHoi) r.sung = { dan: dan };
        if (laXuong) { r.neo = neo; r.keo = chupKeo(); }                       // BẾN SÔNG: neo và vật đang giữ trong lưới/khoang
        if (laCau) { r.nac = nac; r.tam = tam; r.dau = oDauCan(); r.treo = chupTreo(); r.doi = treo.length === 2; }   // CẢNG SÔNG: nấc, tầm, ô đầu cần, container đang treo (đáy → đỉnh), đang móc đôi
        if (coChong) mucVet.chong = chupChong();                                 // CẢNG SÔNG: mọi chồng container cuối nhịp [{x,y,cont:[{so,tan}]}]
        if (taus.length) mucVet.tau = taus.map(function (t) { return { coMat: t.coMat }; });
        if (coVatNoi) mucVet.vat = chupVat();
        if (congs.length) mucVet.cong = chupCong();
        if (vans.length) mucVet.van = chupVan();
        if (dongs.length) mucVet.dongTat = chupDongTat();
        if (coSon) { r.son = { ha: son.ha, mau: son.mau }; mucVet.daSon = chupSon(); }
        if (Object.keys(racCat).length) mucVet.racCat = chupRacCat();
        if (coLoa) { r.loa = { am: coTieng ? loa.am : null }; }
        if (dieu) mucVet.dieuDung = dieuDung;
        if (daChuongs.length) mucVet.daChuong = chupDaChuong();
        if (diQua.length) mucVet.diQua = chupDiQua();
        if (cuas.length) mucVet.cua = chupCua();
        if (nuts.length) { mucVet.nut = chupNut(); mucVet.bangTat = chupBangTat(); }
        if (nutDes.length) mucVet.nutDe = chupNutDe();
        if (luas.length) mucVet.lua = chupLua();
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
      if (!ly) ly = lyCua(x, y);
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
      if (laCau) { var od = oDauCan(); x = od.x; y = od.y; }                     // M9B2 (L13): camera bụng treo ở đầu cần, nhìn xuống Ô ĐẦU CẦN
      if (laCau && chongO(x, y).length) nguon = 'chong';                           // container (không màu) dưới đầu cần: "none"
      else if (oTai(san, x, y) === '=' || thungTai(x, y) || cuaDong(x, y) || (laCau && (oTai(san, x, y) === '#' || oTai(san, x, y) === 'N'))) nguon = 'chan';   // cẩu: đầu cần trên tường / nút cũng "none" (chặn)
      else {
        var v = vatNamTai(x, y);
        if (v) { m = v.mau || 'none'; nguon = 'vat'; idVat = v.id; } else { var mn = mauThay(x, y); m = mn.mau || 'none'; if (mn.son) nguon = 'son'; }
      }
      var ed = { ma: 'doc-cam-bien', cam: MA_CAM_BAY, ham: yc.ten, tu: { x: rb.x, y: rb.y }, o: { x: x, y: y }, mau: m, nguon: nguon, idVat: idVat, nhip: nhip };
      if (laCau) { ed.nac = nac; ed.tam = tam; }
      return ed;
    }

    /** Đọc pin battery() của drone: số pin còn lại. Không tốn nhịp, không đổi sân. */
    function docPin(yc) {
      return { ma: 'doc-cam-bien', cam: 'pin', ham: yc.ten, tu: { x: rb.x, y: rb.y }, o: { x: rb.x, y: rb.y }, pin: pin, pinToiDa: pinToiDa, nhip: nhip };
    }

    /** Đọc cảm biến từ: front_metal() True nếu vật đầu tiên trong 3 ô là SẮT cách ≤ 2 ô; front_pole() là cực ("N" / "S") của vật NAM CHÂM đầu tiên trong 3 ô, không thì "none". Không tốn nhịp, không đổi sân. */
    function docTu(yc) {
      if (laCau) {                                                                 // M9B2 (L13): cảm biến từ ở đầu cần đọc vật nằm ở Ô ĐẦU CẦN (qua tường); front_metal() = sắt, front_pole() = cực vật nam châm
        var od = oDauCan(), vc = vatNamTai(od.x, od.y), cc = vc && vc.chat === 'nam-cham' ? vc.cuc : null;
        return { ma: 'doc-cam-bien', cam: 'tu', ham: yc.ten, tu: { x: rb.x, y: rb.y }, nac: nac, tam: tam, o: od, khoang: 0, chat: vc ? vc.chat : null, cuc: cc, idVat: vc ? vc.id : null,
          trong: yc.ten === 'front_pole' ? cc !== null : !!(vc && vc.chat === 'sat'), nhip: nhip };
      }
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
        if (!ly) ly = lyCua(x, y);
        if (!ly && thungTai(x, y)) ly = 'thung-nang';
        if (!ly && vatNamTai(x, y)) ly = 'vat';
        if (!ly && xeDatTai(x, y)) ly = 'dong-doi';
        if (ly) break;
        d++;
      }
      var nt = ly === 'nut' ? nutTai[x + ',' + y] : null;
      var nong = ly === 'dong-doi' || ly === 'lua' || !!(nt && nt.bat);
      return { ma: 'doc-cam-bien', cam: MA_CAM_HONG_NGOAI, ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: rb.huong, o: { x: x, y: y }, khoang: d, vat: ly, nong: nong, trong: false, nhip: nhip };
    }

    /** Đọc CHONG CHÓNG DÒNG CHẢY (Bến sông): ô TRƯỚC MŨI xuồng; hướng dòng kể theo mũi: "front" (chảy xa khỏi xuồng, cùng chiều mũi), "back" (chảy về phía xuồng), "left", "right";
     *  "none" khi nước êm, dòng tắt, bờ hay ngoài sân (suc 0). flow_dir() trả chuỗi; flow() trả tuple (huong, suc). Không tốn nhịp, không đổi sân. */
    function docDong(yc) {
      var ot = oTruoc(), d = laNuoc(san, ot.x, ot.y) ? dongChay(ot.x, ot.y) : null;
      var td = d ? HUONG_TUONG_DOI[(d.huong - rb.huong + 4) % 4] : 'none';
      return { ma: 'doc-cam-bien', cam: MA_CAM_DONG, ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: rb.huong, o: ot, huongDong: d ? d.huong : null, suc: d ? d.suc : 0, tuongDoi: td, trong: false, nhip: nhip };
    }

    /** Đọc MÁY QUÉT MÃ (Cảng sông): ô ĐẦU CẦN. read_code() = số của container trên cùng ở đó, −1 nếu không có (hay ngoài sân); weight() = tổng tấn đang treo, không treo thì tấn của container
     *  trên cùng ở đầu cần, không có gì thì 0. Không tốn nhịp, không đổi sân. */
    function docQuetMa(yc) {
      var o = oDauCan(), ch = oTai(san, o.x, o.y) === null ? [] : chongO(o.x, o.y), top = ch.length ? ch[ch.length - 1] : null;
      return { ma: 'doc-cam-bien', cam: MA_CAM_QUET, ham: yc.ten, tu: { x: rb.x, y: rb.y }, nac: nac, tam: tam, o: o, so: top ? top.so : -1, tan: treo.length ? tongTan(treo) : top ? top.tan : 0, treo: treo.length, trong: !top, nhip: nhip };
    }

    /** Ký hiệu 1 ký tự của ô (x, y) trong ma trận 3×3 của radar() (mùa 6 Mỏ đá):
     *  '#' tường / ngoài sân / rào / nút / cửa đóng / thùng nặng / robot đồng đội; 'u' hố; 'V' vật nằm đất; 'F' cờ; 'D' ô đích; '.' sàn trống (kể cả băng chuyền, bàn xoay). */
    function kyHieuRadarTai(x, y) {
      var c = oTai(san, x, y);
      if (c === null || c === '#' || c === '=' || c === 'N' || cuaDong(x, y) || thungTai(x, y) || xeDatTai(x, y)) return '#';
      if (laXuong && (!laNuoc(san, x, y) || congDong(x, y))) return '#';        // M9B1 (L14 xuồng + radar): bờ / cống đóng chặn xuồng như tường (không thì radar của xuồng thấy bờ là sàn trống)
      if (c === 'u') return 'u';
      if (vatNamTai(x, y)) return 'V';
      if (c === 'F' || (san.co && san.co.x === x && san.co.y === y)) return 'F';
      if (dichSet[x + ',' + y]) return 'D';
      return '.';
    }
    /** Đọc cảm biến radar tròn radar() (mùa 6 Mỏ đá): trả list 2D 3×3 quanh vị trí (rb.x, rb.y) hiện tại theo trục bản đồ (hàng 0 = y-1, hàng 1 = y, hàng 2 = y+1; cột 0 = x-1, cột 1 = x, cột 2 = x+1). Không tốn nhịp. */
    function docRadar(yc) {
      var luoi = [];
      for (var dr = -1; dr <= 1; dr++) {
        var hang = [];
        for (var dc = -1; dc <= 1; dc++) hang.push(kyHieuRadarTai(rb.x + dc, rb.y + dr));
        luoi.push(hang);
      }
      return { ma: 'doc-cam-bien', cam: MA_CAM_RADAR, ham: yc.ten, tu: { x: rb.x, y: rb.y }, o: { x: rb.x, y: rb.y }, luoi: luoi, nhip: nhip };
    }
    /** Kiểm tra đối số của shape(huong): hướng phải là 1 trong "front", "back", "left", "right", "up", "down", "here". */
    function loiHuongRadar(yc) {
      var ts = yc.thamSo || [];
      var ds = laBanh ? ['front', 'back', 'left', 'right', 'up', 'down', 'here'] : ['up', 'right', 'down', 'left', 'here'];   // M9B1 (L11 drone, L12 nhện): thân không mũi chỉ có hướng bản đồ
      if (!laBanh && ts.length === 1 && (ts[0] === 'front' || ts[0] === 'back')) {
        return { loai: 'runtime-error', ma: 'huong-radar-sai', dong: yc.dong, thongDiep: 'shape("' + ts[0] + '"): ' + (laDrone ? 'drone' : 'nhện') + ' không có mũi nên không có "trước" / "sau". Hướng dùng được: ' + ds.map(function (x) { return '"' + x + '"'; }).join(', ') + '.' };
      }
      var goi = ds.map(function (x) { return '"' + x + '"'; }).join(', ');
      if (ts.length !== 1) return { loai: 'runtime-error', ma: 'huong-radar-sai', dong: yc.dong, thongDiep: 'shape() cần đúng 1 hướng: ' + goi + '.' };
      var h = ts[0];
      if (typeof h !== 'string' || RADAR_HUONG[h] === undefined || ds.indexOf(h) < 0) {
        return { loai: 'runtime-error', ma: 'huong-radar-sai', dong: yc.dong, thongDiep: 'shape(' + (typeof h === 'string' ? '"' + h + '"' : String(h)) + '): hướng lạ. Hướng dùng được: ' + goi + '.' };
      }
      return null;
    }
    /** Đọc hình dạng vật ở ô kề theo hướng shape(huong) (mùa 6 Mỏ đá, nâng cấp nhận dạng): trả "round", "square", "ore" hoặc "none". Không tốn nhịp. */
    function docShape(yc) {
      var h = yc.thamSo[0], rh = laBanh ? RADAR_HUONG[h] : (h === 'here' ? RADAR_HUONG.here : { loai: 'ban-do', d: CAM4_BAN_DO[h] }), o, huongDoc = null;   // M9B1: không mũi → left / right theo bản đồ
      if (rh.loai === 'here') {
        o = { x: rb.x, y: rb.y };
      } else {
        huongDoc = rh.loai === 'mui' ? (rb.huong + rh.d) % 4 : rh.d;
        var v = VEC[huongDoc];
        o = { x: rb.x + v[0], y: rb.y + v[1] };
      }
      var vt = vatNamTai(o.x, o.y);
      var dang = vt ? (vt.dang || 'round') : 'none';
      return { ma: 'doc-cam-bien', cam: MA_CAM_RADAR, ham: yc.ten, huong: h, huongDoc: huongDoc, tu: { x: rb.x, y: rb.y }, o: o, dang: dang, idVat: vt ? vt.id : null, nhip: nhip };
    }

    /** Đọc CẢM BIẾN ÂM THANH (mùa 8 Hang động): tìm nguồn âm đang hoạt động gần nhất theo khoảng cách Manhattan |x - rb.x| + |y - rb.y| trong phamVi (mặc định 9).
     *  Nguồn âm gồm các chuông đá (`chuongDa`) và các khối đá chuông chưa vỡ (`daChuong` có `!daVo`).
     *  hear() trả về khoảng cách Manhattan `1..9` tới nguồn gần nhất (nếu đứng trùng ô kc === 0 hoặc không có nguồn trong tầm thì trả `0`).
     *  listen() (nâng cấp phân âm) trả về nốt `1..8` của nguồn gần nhất (kể cả khi đứng ngay tại ô nguồn hoặc cách 1..phamVi ô; không có nguồn trong tầm thì trả `0`).
     *  Không tốn nhịp, không đổi sân. */
    function docAmThanh(yc) {
      var gan = null, kcMin = 999;
      function xetNguon(s, loaiNguon) {
        var kc = Math.abs(s.x - rb.x) + Math.abs(s.y - rb.y);
        var pv = s.phamVi || 9;
        if (kc > pv) return;
        if (yc.ten === 'hear' && kc === 0) return;
        if (kc < kcMin) { kcMin = kc; gan = { x: s.x, y: s.y, not: s.not, kc: kc, loaiNguon: loaiNguon }; }
      }
      chuongDas.forEach(function (cd) { xetNguon(cd, 'chuong-da'); });
      daChuongs.forEach(function (dc) { if (!dc.daVo) xetNguon(dc, 'da-chuong'); });
      var khoang = gan ? gan.kc : 0;
      var not = gan ? gan.not : 0;
      return { ma: 'doc-cam-bien', cam: MA_CAM_AM_THANH, ham: yc.ten, tu: { x: rb.x, y: rb.y }, o: gan ? { x: gan.x, y: gan.y } : { x: rb.x, y: rb.y }, khoang: khoang, not: not, nguon: gan ? gan.loaiNguon : null, nhip: nhip };
    }

    /** Xử lý một lời gọi hàm gốc nhân nhường ra. Trả về true nếu phải dừng. */
    function xuLy(yc) {
      if (yc.ten !== 'wait' && OMNI_CHEO_BIEN[yc.ten] === undefined && yc.ten !== 'beat') vuaCheo = false;
      if (nguonDong && khayThieu[yc.ten]) {                      // lệnh có trong phần cứng nhưng chưa mở trên khay: chương trình chính và hàm của màn không dùng được
        var ngLenh = nguonDong(yc.dong);
        if (ngLenh === 'chinh' || ngLenh === 'hamMan') {
          loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: yc.ten, thongDiep: 'Lệnh ' + yc.ten + '() chưa có trên khay ở màn này.' };
          return true;
        }
      }
      vet.push({ loai: 'lenh', ten: yc.ten, dongPy: yc.dong, nganPy: yc.ngan });
      if (CAM_BIEN_HAM[yc.ten] !== undefined || CAM_MAU_HAM.indexOf(yc.ten) >= 0 || CAM_NHIN_HAM.indexOf(yc.ten) >= 0 || CAM_TU_HAM.indexOf(yc.ten) >= 0 || CAM_PIN_HAM.indexOf(yc.ten) >= 0 || CAM_HONG_NGOAI_HAM.indexOf(yc.ten) >= 0 || CAM_RADAR_HAM.indexOf(yc.ten) >= 0 || CAM_DONG_HAM.indexOf(yc.ten) >= 0 || CAM_QUET_HAM.indexOf(yc.ten) >= 0 || CAM_AM_THANH_HAM.indexOf(yc.ten) >= 0) {     // cảm biến: đọc xong trả về cho chương trình (khoảng cách / từ / nhiệt: True / False; màu / hình dạng: chuỗi; pin / hồng ngoại distance / âm thanh: số; radar: list 2D 3×3; chong chóng: chuỗi hay tuple), không tốn nhịp
        var laMau = CAM_MAU_HAM.indexOf(yc.ten) >= 0, laPin = CAM_PIN_HAM.indexOf(yc.ten) >= 0, laNhin = CAM_NHIN_HAM.indexOf(yc.ten) >= 0, laHN = CAM_HONG_NGOAI_HAM.indexOf(yc.ten) >= 0, laRadar = CAM_RADAR_HAM.indexOf(yc.ten) >= 0, laDong = CAM_DONG_HAM.indexOf(yc.ten) >= 0, laQuet = CAM_QUET_HAM.indexOf(yc.ten) >= 0, laAm = CAM_AM_THANH_HAM.indexOf(yc.ten) >= 0;
        if (laMau) { var lh4 = loiHuongCam(yc); if (lh4) { loi = lh4; return true; } }      // camera bốn hướng: color(huong) phải có hướng đúng; cảm biến khác: color() không nhận đối số
        if (laRadar && yc.ten === 'shape') {
          if (!coRadarNhanDang) {
            loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: yc.ten, thongDiep: 'Radar chưa nâng cấp nhận dạng hình dạng nên chưa dùng được shape().' };
            return true;
          }
          var lhr = loiHuongRadar(yc); if (lhr) { loi = lhr; return true; }
        }
        if (laAm && yc.ten === 'listen') {
          if (!coPhanAm) {
            loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: yc.ten, thongDiep: 'Cảm biến âm thanh chưa nâng cấp phân âm nên chưa dùng được listen().' };
            return true;
          }
        }
        var ed = laAm ? docAmThanh(yc) : laRadar ? (yc.ten === 'shape' ? docShape(yc) : docRadar(yc)) : laNhin ? docNhin(yc) : laMau ? docMau(yc) : laPin ? docPin(yc) : laHN ? docHongNgoai(yc) : laDong ? docDong(yc) : laQuet ? docQuetMa(yc) : CAM_TU_HAM.indexOf(yc.ten) >= 0 ? docTu(yc) : docCamBien(yc);
        vet[vet.length - 1].docCamBien = Object.assign({}, ed);
        soLanDoc++;
        if (docCho.length < DOC_TOI_DA_MOI_NHIP) docCho.push(ed);
        traVe = laAm ? (yc.ten === 'listen' ? ed.not : ed.khoang) : laRadar ? (yc.ten === 'shape' ? ed.dang : ed.luoi.map(function (r) { return r.slice(); })) : laMau || laNhin ? ed.mau : laPin ? ed.pin : laHN ? (yc.ten === 'warm' ? ed.nong : ed.khoang) : laDong ? (yc.ten === 'flow' ? [ed.tuongDoi, ed.suc] : ed.tuongDoi) : laQuet ? (yc.ten === 'weight' ? ed.tan : ed.so) : yc.ten === 'front_pole' ? (ed.cuc || 'none') : ed.trong;   // flow(): mảng JS → nhân đưa cho trẻ thành tuple ("back", 2); read_code(): số hay −1; weight(): số tấn; hear(): khoảng cách 0..9; listen(): nốt 0..8
        docLienTiep++;
        if (docLienTiep > DOC_LIEN_TIEP_TOI_DA) {
          loi = { loai: 'infinite-loop', dong: yc.dong, thongDiep: 'Đọc cảm biến ' + DOC_LIEN_TIEP_TOI_DA + ' lần liên tiếp mà robot chưa chạy nhịp nào — có vòng lặp không có đường ra.' };
          return true;
        }
        return false;
      }
      if (laCau) {                                               // CẢNG SÔNG: mọi lệnh cần cẩu là MỘT nhịp ngay (như go_* của drone); không có hàng chờ nên không có quen-wait
        if (yc.ten === 'wait') return motNhip({ kieu: 'cau', ten: null, lenhDi: null });
        if (CAU_LENH[yc.ten] || TAY_MOC.indexOf(yc.ten) >= 0) return motNhip({ kieu: 'cau', ten: yc.ten, lenhDi: { ten: yc.ten, dongPy: yc.dong } });
        if (TAY_NAM_CHAM.indexOf(yc.ten) >= 0 || yc.ten === 'grab' || yc.ten === 'release')      // M9B2 (L1, L8): nam châm / gầu ngoạm ở đầu cần, mỗi lệnh một nhịp như móc
          return motNhip({ kieu: 'cau', ten: yc.ten, lenhDi: { ten: yc.ten, dongPy: yc.dong }, cuc: yc.ten === 'magnet_off' || TAY_NAM_CHAM.indexOf(yc.ten) < 0 ? null : (dao.cuc ? CUC_DOI[CUC_LENH[yc.ten]] : CUC_LENH[yc.ten]) });
        if (yc.ten === 'rail') {                                 // rail(n): n nguyên khác 0, abs(n) ≤ 9; abs(n) nhịp, mỗi nhịp bệ chạy 1 ô dọc ray
          var rn = yc.thamSo && yc.thamSo.length === 1 ? yc.thamSo[0] : undefined;
          if (!yc.thamSo || yc.thamSo.length !== 1 || !laSoNguyen(rn) || rn === 0 || Math.abs(rn) > RAY_TOI_DA) {
            loi = { loai: 'runtime-error', ma: 'ray-sai', dong: yc.dong, ten: 'rail', nDat: rn === undefined ? null : rn,
              thongDiep: !yc.thamSo || yc.thamSo.length !== 1 ? 'rail() cần đúng 1 đối số (số ô chạy, âm là chạy ngược), đang có ' + (yc.thamSo ? yc.thamSo.length : 0) + '.'
                : rn === 0 ? 'rail(0) không chạy đi đâu: n phải khác 0 (dương chạy xuôi, âm chạy ngược).'
                : 'rail(n) chỉ nhận số nguyên từ -' + RAY_TOI_DA + ' đến ' + RAY_TOI_DA + ' (khác 0), mà em đưa vào ' + (typeof rn === 'string' ? '"' + rn + '"' : String(rn)) + '.' };
            return true;
          }
          if (!coRay) { loi = { loai: 'runtime-error', ma: 'khong-ray', dong: yc.dong, ten: 'rail', thongDiep: 'Cần cẩu này không có bánh ray.' }; return true; }
          var rr = { n: rn, huong: rn > 0 ? 1 : -1, chan: false, daDi: 0 }, lr = { ten: 'rail', dongPy: yc.dong };
          vet[vet.length - 1].railN = rn;
          for (var ir = 0; ir < Math.abs(rn); ir++) if (motNhip({ kieu: 'cau', ten: 'rail', ray: rr, lenhDi: lr })) return true;
          return false;
        }
      }
      if (yc.ten === 'wait') {
        if (laDrone) {                                           // drone: wait() = một nhịp lơ lửng, cũng tốn pin; lệnh nam châm đang chờ làm ở nhịp này
          var hdw = { kieu: 'drone', huong: null, nc: ncCho, son: sonCho };
          ncCho = null; sonCho = null; lenhTon = [];
          return motNhip(hdw);
        }
        if (laBanh) {
          if (vuaCheo && lenh.trai === 0 && lenh.phai === 0 && !truotCho && !ncCho && !nemCho && !hoiCho && !sonCho && !loaCho && !loaNgan && !gaiCho && !neoCho && !phaoCho && !tayCho['tu-the'] && !tayCho['kep'] && !tayCho['xoay']) {
            vuaCheo = false;
            return false;                                        // diag_left() / diag_right() đã tự chạy 1 nhịp; nếu theo thói quen gọi thêm wait() ngay sau thì không tốn thêm nhịp
          }
          vuaCheo = false;
          var lenhBanh = null;                                   // lệnh bánh đầu tiên của nhịp (để chỉ ra khi tay vướng sàn)
          lenhTon.forEach(function (x) { if (!lenhBanh && BANH_LENH[x.ten]) lenhBanh = { ten: x.ten, dongPy: x.dongPy }; });
          var coLenhKhac = lenh.trai !== 0 || lenh.phai !== 0 || !!truotCho || !!tayCho['tu-the'] || !!tayCho['kep'] || !!tayCho['xoay'] || !!ncCho || !!nemCho || !!hoiCho || !!sonCho || !!gaiCho || !!neoCho || !!phaoCho;
          var lc = loaCho;
          if (!lc && loaNgan && loaNgan.con > 0) {
            lc = { ten: loaNgan.ten, dongPy: loaNgan.dongPy, am: loaNgan.am, ngan: true };
            loaNgan.con--;
            if (loaNgan.con <= 0) loaNgan = null;
          } else if (lc) {
            loaNgan = null;
          }
          var h = { kieu: 'banh', trai: lenh.trai, phai: lenh.phai, lenhBanh: lenhBanh, tay: rutTay(), truot: truotCho, nc: ncCho, nem: nemCho, hoi: hoiCho, son: sonCho, loa: lc, gai: gaiCho, neo: neoCho, phao: phaoCho, lenhWait: { ten: 'wait', dongPy: yc.dong } };
          lenh.trai = 0; lenh.phai = 0; lenhTon = []; truotCho = null; ncCho = null; nemCho = null; hoiCho = null; sonCho = null; loaCho = null; gaiCho = null; neoCho = null; phaoCho = null;
          if (lc && lc.soNhip && lc.soNhip > 1) {
            if (!coLenhKhac) {
              if (motNhip(h)) return true;
              for (var kn = 1; kn < lc.soNhip; kn++) {
                var hNgan = {
                  kieu: 'banh', trai: 0, phai: 0, lenhBanh: null,
                  tay: { tuThe: null, kep: null, xoay: null, lenhTuThe: null, lenhKep: null, lenhXoay: null },
                  truot: null, nc: null, nem: null, hoi: null, son: null, gai: null, neo: null, phao: null,
                  loa: { ten: lc.ten, dongPy: lc.dongPy, am: lc.am, ngan: true },
                  lenhWait: { ten: 'wait', dongPy: yc.dong }
                };
                if (motNhip(hNgan)) return true;
              }
              return false;
            }
            loaNgan = { ten: lc.ten, dongPy: lc.dongPy, am: lc.am, con: lc.soNhip - 1 };
          }
          return motNhip(h);
        }
        var lcN = loaCho;                                                                     // M9B1 (L7 nhện + loa): nốt đang chờ phát ở nhịp wait() này (note(n, so_nhip): ngân thêm so_nhip - 1 nhịp)
        var hw = { kieu: 'nhen', huong: null, tay: rutTay(), chan: chanCho, nc: ncCho, son: sonCho, loa: lcN };      // nc: nam châm bụng nhện (mùa 3); son: bộ gieo hạt dưới bụng (L6)
        var coKhacN = !!chanCho || !!ncCho || !!sonCho || !!hw.tay.tuThe || !!hw.tay.kep;
        chanCho = null; ncCho = null; sonCho = null; loaCho = null;
        lenhTon = [];
        if (lcN && lcN.soNhip && lcN.soNhip > 1 && !coKhacN) {
          if (motNhip(hw)) return true;
          for (var knN = 1; knN < lcN.soNhip; knN++) {
            if (motNhip({ kieu: 'nhen', huong: null, tay: { tuThe: null, kep: null, xoay: null, lenhTuThe: null, lenhKep: null, lenhXoay: null }, chan: null, nc: null, son: null, loa: { ten: lcN.ten, dongPy: lcN.dongPy, am: lcN.am, ngan: true } })) return true;
          }
          return false;
        }
        return motNhip(hw);
      }
      if (OMNI_CHEO_BIEN[yc.ten] !== undefined) {                // omni nâng cấp chéo (mùa 6 Mỏ đá): diag_left() / diag_right() đi chéo 1 ô trong đúng 1 nhịp, giữ nguyên hướng mặt
        if (!coOmniCheo) {
          loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: yc.ten, thongDiep: 'Lệnh ' + yc.ten + '() chưa mở ở màn này (cần nâng cấp bánh omni đi chéo).' };
          return true;
        }
        var loaCheo = loaCho; loaCho = null;
        var hCheo = { kieu: 'banh', trai: 0, phai: 0, lenhBanh: null, tay: rutTay(), truot: null, cheo: { ten: yc.ten, dongPy: yc.dong, bien: OMNI_CHEO_BIEN[yc.ten] }, nc: ncCho, nem: nemCho, hoi: hoiCho, son: sonCho, loa: loaCheo };
        lenh.trai = 0; lenh.phai = 0; lenhTon = []; truotCho = null; ncCho = null; nemCho = null; hoiCho = null; sonCho = null;
        vuaCheo = true;
        return motNhip(hCheo);
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
        if (!coChinhLuc) {
          loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: 'aim', thongDiep: 'Lệnh aim() chưa mở ở màn này (cần nâng cấp chỉnh lực ném).' };
          return true;
        }
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
      if (THAN_GAI.indexOf(yc.ten) >= 0) {                       // bánh gai (mùa 8 Hang động): retract_spikes() / extend_spikes() chỉ ra lệnh, chờ nhịp kế
        if (!coThuGai) {
          loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: yc.ten, thongDiep: 'Lệnh ' + yc.ten + '() chưa mở ở màn này (cần nâng cấp thu/bung gai).' };
          return true;
        }
        if (gaiCho) {
          suKienChan.push({ ma: 'gai-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: gaiCho.ten, dongPy: gaiCho.dongPy } });
          return false;
        }
        gaiCho = { ten: yc.ten, dongPy: yc.dong };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (TAY_LOA.indexOf(yc.ten) >= 0) {                        // loa: note(n, so_nhip?) / beat() chỉ ra lệnh, phát ở đầu nhịp kế; n = 1…8, so_nhip = 1…8 (mặc định 1)
        var am = 'x', sn = 1;
        if (yc.ten === 'beat' && yc.thamSo && yc.thamSo.length > 0) {
          loi = { loai: 'runtime-error', ma: 'not-sai', dong: yc.dong, thongDiep: 'beat() không nhận đối số, đang có ' + yc.thamSo.length + '.' };
          return true;
        }
        if (yc.ten === 'note') {
          var soTs = yc.thamSo ? yc.thamSo.length : 0;
          var nn = soTs >= 1 ? yc.thamSo[0] : undefined;
          if (soTs < 1 || soTs > 2 || typeof nn !== 'number' || !isFinite(nn) || Math.floor(nn) !== nn || nn < 1 || nn > NOT_TOI_DA) {
            var moTaN = (soTs < 1 || soTs > 2) ? 'note() nhận 1 hoặc 2 đối số: note(n) hoặc note(n, so_nhip), đang có ' + soTs + '.'
              : 'note(n) chỉ nhận số nguyên n = 1 … ' + NOT_TOI_DA + ', mà em đưa vào ' + (typeof nn === 'string' ? '"' + nn + '"' : String(nn)) + '.';
            loi = { loai: 'runtime-error', ma: 'not-sai', dong: yc.dong, thongDiep: moTaN, notDat: nn === undefined ? null : nn };
            return true;
          }
          if (soTs === 2) {
            sn = yc.thamSo[1];
            if (typeof sn !== 'number' || !isFinite(sn) || Math.floor(sn) !== sn || sn < 1 || sn > SO_NHIP_TOI_DA) {
              var moTaS = 'note(n, so_nhip) chỉ nhận so_nhip là số nguyên từ 1 đến ' + SO_NHIP_TOI_DA + ' (số nhịp ngân), mà em đưa vào ' + (typeof sn === 'string' ? '"' + sn + '"' : String(sn)) + '.';
              loi = { loai: 'runtime-error', ma: 'not-sai', dong: yc.dong, thongDiep: moTaS, notDat: nn, soNhipDat: sn };
              return true;
            }
          }
          vet[vet.length - 1].notSo = nn;
          if (sn > 1) vet[vet.length - 1].soNhipLoa = sn;
          am = dao.loa ? NOT_TOI_DA + 1 - nn : nn;                 // daoChieu 'loa': nốt n phát thành 9 - n
        }
        if (loaCho) {
          suKienChan.push({ ma: 'loa-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: loaCho.ten, dongPy: loaCho.dongPy } });
          return false;
        }
        loaCho = { ten: yc.ten, dongPy: yc.dong, am: am, soNhip: sn };
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
              thongDiep: yc.thamSo.length !== 1 ? yc.ten + '() nhận nhiều nhất 1 đối số (lực phun), đang có ' + yc.thamSo.length + '.'
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
      if (THAN_NEO.indexOf(yc.ten) >= 0) {                      // xuồng: anchor() / unanchor() chỉ ra lệnh, chờ nhịp
        if (neoCho) {
          suKienChan.push({ ma: 'neo-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: neoCho.ten, dongPy: neoCho.dongPy } });
          return false;
        }
        neoCho = { ten: yc.ten, dongPy: yc.dong };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (TAY_PHAO.indexOf(yc.ten) >= 0) {                      // xuồng: cast_net(d?) / drop_net() / set_length(n, d?)
        var soTsP = yc.thamSo ? yc.thamSo.length : 0;
        if (yc.ten === 'drop_net') {
          if (soTsP > 0) {
            loi = { loai: 'runtime-error', ma: 'tham-so-luoi-sai', dong: yc.dong, ten: 'drop_net', thongDiep: 'drop_net() không nhận đối số, đang có ' + soTsP + '.' };
            return true;
          }
          if (phaoCho) {
            suKienChan.push({ ma: 'phao-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: phaoCho.ten, dongPy: phaoCho.dongPy } });
            return false;
          }
          phaoCho = { ten: 'drop_net', dongPy: yc.dong };
          lenhTon.push({ ten: 'drop_net', dongPy: yc.dong });
          return false;
        }
        if (yc.ten === 'cast_net') {
          var htCast = 'front';
          if (soTsP > 1) {
            loi = { loai: 'runtime-error', ma: 'huong-luoi-sai', dong: yc.dong, ten: 'cast_net', huongDat: null, thongDiep: 'cast_net() nhận nhiều nhất 1 đối số (hướng tương đối: "front", "back", "left" hoặc "right"), đang có ' + soTsP + '.' };
            return true;
          }
          if (soTsP === 1) {
            htCast = yc.thamSo[0];
            if (typeof htCast !== 'string' || HUONG_LUOI[htCast] === undefined) {
              loi = { loai: 'runtime-error', ma: 'huong-luoi-sai', dong: yc.dong, ten: 'cast_net', huongDat: htCast === undefined ? null : htCast,
                thongDiep: 'cast_net(d) chỉ nhận d = "front", "back", "left" hoặc "right", mà em đưa vào ' + (typeof htCast === 'string' ? '"' + htCast + '"' : String(htCast)) + '.' };
              return true;
            }
          }
          if (phaoCho) {
            suKienChan.push({ ma: 'phao-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: phaoCho.ten, dongPy: phaoCho.dongPy } });
            return false;
          }
          vet[vet.length - 1].huongLuoi = htCast;
          phaoCho = { ten: 'cast_net', dongPy: yc.dong, huongTuongDoi: htCast };
          lenhTon.push({ ten: 'cast_net', dongPy: yc.dong });
          return false;
        }
        // set_length(n, d?)
        if (!coSetLength) {
          loi = { loai: 'runtime-error', ma: 'lenh-chua-mo', dong: yc.dong, ten: 'set_length', thongDiep: 'Lệnh set_length() chưa mở ở màn này (cần nâng cấp chỉnh dây lưới).' };
          return true;
        }
        var nl = soTsP >= 1 ? yc.thamSo[0] : undefined, htLen = null;
        if (soTsP < 1 || soTsP > 2 || typeof nl !== 'number' || !isFinite(nl) || Math.floor(nl) !== nl || nl < 0 || nl > TAM_KEO) {
          var moTaL = (soTsP < 1 || soTsP > 2) ? 'set_length() cần 1 đối số (hoặc 2 đối số khi đẩy từ khoang: độ dài n và hướng d), đang có ' + soTsP + '.'
            : 'set_length(n) chỉ nhận số nguyên n = 0, 1, 2 hoặc 3 (0 = kéo về khoang, 1..3 = số ô dây lưới), mà em đưa vào ' + (typeof nl === 'string' ? '"' + nl + '"' : String(nl)) + '.';
          loi = { loai: 'runtime-error', ma: 'dai-luoi-sai', dong: yc.dong, ten: 'set_length', daiDat: nl === undefined ? null : nl, thongDiep: moTaL };
          return true;
        }
        if (soTsP === 2) {
          htLen = yc.thamSo[1];
          if (typeof htLen !== 'string' || HUONG_LUOI[htLen] === undefined) {
            loi = { loai: 'runtime-error', ma: 'huong-luoi-sai', dong: yc.dong, ten: 'set_length', huongDat: htLen === undefined ? null : htLen,
              thongDiep: 'set_length(n, d) chỉ nhận hướng d = "front", "back", "left" hoặc "right", mà em đưa vào ' + (typeof htLen === 'string' ? '"' + htLen + '"' : String(htLen)) + '.' };
            return true;
          }
        }
        vet[vet.length - 1].daiLuoi = nl;
        if (htLen) vet[vet.length - 1].huongLuoi = htLen;
        if (!keo && nl >= 1) {
          daiLuoi = nl;
          return false;
        }
        if (phaoCho) {
          suKienChan.push({ ma: 'phao-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: phaoCho.ten, dongPy: phaoCho.dongPy } });
          return false;
        }
        if (nl >= 1) daiLuoi = nl;
        phaoCho = { ten: 'set_length', dongPy: yc.dong, doDai: nl, huongTuongDoi: htLen };
        lenhTon.push({ ten: 'set_length', dongPy: yc.dong });
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
        var loaDap = loaCho; loaCho = null;
        var hdp = { kieu: 'drone', huong: null, nc: ncCho, son: sonCho, loa: loaDap, dap: yc.ten, lenhDi: { ten: yc.ten, dongPy: yc.dong } };
        ncCho = null; sonCho = null; lenhTon = [];
        return motNhip(hdp);
      }
      var hh = NHEN_HUONG[yc.ten];
      if (laDrone) {                                             // drone: go_*() bay 1 ô = đúng 1 nhịp; lệnh nam châm đang chờ làm ở nhịp này
        var loaDrone = loaCho; loaCho = null;
        var hdd = { kieu: 'drone', huong: hh, nc: ncCho, son: sonCho, loa: loaDrone, lenhDi: { ten: yc.ten, dongPy: yc.dong } };
        ncCho = null; sonCho = null; lenhTon = [];
        return motNhip(hdd);
      }
      var tayBuoc = rutTay();                                    // lệnh tay đang chờ làm ở nhịp ĐẦU của bước
      var chanBuoc = chanCho; chanCho = null;                    // lệnh chân (crouch / stand) đang chờ cũng làm ở nhịp ĐẦU của bước
      var ncBuoc = ncCho; ncCho = null;                          // lệnh nam châm bụng (mùa 3) cũng làm ở nhịp ĐẦU của bước
      var loaBuoc = loaCho; loaCho = null;
      var sonBuoc = sonCho; sonCho = null;                       // M9B1 (L6): lệnh bộ gieo hạt dưới bụng cũng làm ở nhịp ĐẦU của bước (chấm ô đang đứng, trước khi rời)
      lenhTon = [];
      return motNhip({ kieu: 'nhen', huong: hh, buoc: 1, tay: tayBuoc, chan: chanBuoc, nc: ncBuoc, loa: loaBuoc, son: sonBuoc }) ||
        motNhip({ kieu: 'nhen', huong: hh, buoc: 2, lenhDi: { ten: yc.ten, dongPy: yc.dong } });
    }


    /* ------------------------------------------------------------------ NHIỀU ROBOT: bộ xếp lịch nhịp chung (KE-HOACH-HAI-ROBOT.md)
       Mỗi robot chạy chương trình của mình tới ranh nhịp (wait(), bước go_*) rồi dừng chờ (motNhip đẩy nhịp vào hangNhip). Đủ mọi robot thì sân chạy một nhịp:
       pha a (từng robot) → b (sân) → c (từng robot) → d (sân) → e (từng robot). Robot hết chương trình / đã tới cờ thì đứng yên (nghi()). */
    /** Một nhịp đứng yên của robot đang xét (đã hết chương trình hay đã tới cờ). */
    function nghi() {
      var tayRong = { tuThe: null, kep: null, xoay: null, lenhTuThe: null, lenhKep: null, lenhXoay: null };
      if (laDrone) return { kieu: 'drone', huong: null, nc: null };
      if (laCau) return { kieu: 'cau', ten: null, lenhDi: null };
      if (laBanh) return { kieu: 'banh', trai: 0, phai: 0, lenhBanh: null, tay: tayRong, truot: null, nc: null, nem: null, hoi: null, son: null, loa: null, gai: null, neo: null, phao: null };
      return { kieu: 'nhen', huong: null, tay: tayRong, chan: null };
    }
    /** Ô robot đang xét ĐỊNH tới ở nhịp có hành động h (tiến / lùi / trượt / bước / bay / giật súng), null nếu không định rời ô. Dùng để chặn đồng đội trước khi ai đi. */
    function duKienDi(h) {
      var d = null, v;
      if (h.kieu === 'cau') {                                                  // cần cẩu: chỉ rail(n) mới dời bệ (1 ô dọc ray mỗi nhịp)
        if (h.ten !== 'rail' || h.ray.chan || !rayO) return null;
        var vR = rayO.doc ? [0, h.ray.huong] : [h.ray.huong, 0];
        return { x: rb.x + vR[0], y: rb.y + vR[1], drone: false };
      }
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
      else if (h.cheo) {
        var vfC = VEC[rb.huong], vsC = VEC[(rb.huong + (h.cheo.bien > 0 ? 1 : 3)) % 4];
        return { x: rb.x + vfC[0] + vsC[0], y: rb.y + vfC[1] + vsC[1], drone: laDrone };
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
        x.g = Core.chayCodeGen(codeVao[i], api, { nganSachLenh: opt.nganSachLenh || 20000, choPhep2D: true });
        x.ctx = catRobot();
      });
      function datKhac(i, kemDinh) {                                      // đồng đội của robot i (vị trí sống) và ô họ định tới (chỉ ở pha a)
        xeKhac = []; oDinhToi = [];
        X.forEach(function (y, j) {
          if (j === i) return;
          xeKhac.push({ rb: y.ctx.rb, drone: y.ctx.laDrone, keoId: y.ctx.keo ? y.ctx.keo.id : null });
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
        if (mucTieu === 'choi-dieu' && dieuDoi) {
          var beDoi = [dieuDoi.r1, dieuDoi.r2], tongDoi = beDoi[0].length;
          var coTiengDoi = X.slice(0, 2).some(function (x) { return x.ctx.loa && x.ctx.loa.am !== null; });
          if (dieuBatDau === null && coTiengDoi) dieuBatDau = nhip;
          if (dieuBatDau !== null && !dieuHong) {
            var vtDoi = dieuDung;
            for (var ir = 0; ir < 2 && ir < X.length; ir++) {
              var xr = X[ir], amR = xr.ctx.loa ? xr.ctx.loa.am : null;
              var laNganR = !!(xr.h && xr.h.loa && xr.h.loa.ngan);
              var canR = vtDoi < tongDoi ? beDoi[ir][vtDoi] : null;
              var dungR = vtDoi < tongDoi ? (laNganR ? (canR === null || canR === amR) : (amR === canR)) : (amR === null);
              var vr = xr.ctx.vet, mvR = null;
              for (var ivr = vr.length - 1; ivr >= 0; ivr--) if (vr[ivr].loai === 'nhip') { mvR = vr[ivr]; break; }
              if (mvR) {
                var epR = mvR.suKien.filter(function (e) { return e.ma === 'phat-am' || e.ma === 'ngan-am'; })[0];
                if (epR) epR.dung = dungR;
              }
              if (!dungR && !dieuHong) {
                var lgR = (xr.h && xr.h.loa) ? { ten: xr.h.loa.ten, dongPy: xr.h.loa.dongPy } : (xr.h && xr.h.lenhWait ? xr.h.lenhWait : null);
                dieuHong = {
                  ma: amR === null ? 'lo-nhip' : (canR === null ? 'lech-nhip' : 'sai-not'),
                  robot: ir, tenRobot: 'R' + (ir + 1), nhip: nhip, viTri: vtDoi,
                  can: canR === null ? '.' : canR, choi: amR, lenh: lgR
                };
                if (vtDoi >= tongDoi && amR !== null) dieuHong.thua = true;
                if (mvR) mvR.suKien.push(dieuHong);
                xr.ctx.suKienChan.push(dieuHong);
              }
            }
            if (!dieuHong) {
              dieuDung++;
              X.forEach(function (xr) {
                var vr = xr.ctx.vet;
                for (var ivr = vr.length - 1; ivr >= 0; ivr--) if (vr[ivr].loai === 'nhip') { vr[ivr].dieuDung = dieuDung; break; }
              });
              if (dieuDung === tongDoi && (!dieuToiCo || X.every(function (xr) { return xr.ctx.xeToiCo; }))) {
                thang = true;
                var v0d = X[0].ctx.vet;
                for (var iv0d = v0d.length - 1; iv0d >= 0; iv0d--) if (v0d[iv0d].loai === 'nhip') { v0d[iv0d].suKien.push({ ma: 'xong-dieu' }); break; }
              }
            } else {
              dungSom = dieuHong.ma;
            }
          }
        }
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
          tay: coTay ? chupTay() : null, namCham: coNamCham ? chupNamCham() : null, nem: coNem ? chupNem() : null, sung: coHoi ? { dan: dan } : null, son: coSon ? { ha: son.ha, mau: son.mau } : null, loa: coLoa ? { am: loa.am } : null,
          soLanDoc: soLanDoc, docConLai: docCho, pin: pin, pinToiDa: pinToiDa,
          chan: loai === 'nhen' ? chan : undefined, quayDo: loai === 'xich' ? (quayDo ? quayDo.huong : 0) : undefined, gai: laGai ? gai : undefined,
          neo: laXuong ? neo : undefined, keo: laXuong ? chupKeo() : undefined,     // (chayDoi có hàm nội bộ tên keo nên đọc qua chupKeo)
          nac: laCau ? nac : undefined, tam: laCau ? tam : undefined, dau: laCau ? oDauCan() : undefined, treo: laCau ? chupTreo() : undefined,   // CẢNG SÔNG
          toiCo: xeToiCo, xong: x.xong
        };
        x.ctx = catRobot();
        return o;
      });
      napRobot(X[0].ctx);
      return Object.assign({}, dsKq[0], {
        thang: thang, nhip: nhip, loi: loiDoi, doi: dsKq,
        vat: chupVat(), vatBanDau: vatBanDau, dich: dsDich, dungSom: dungSom,
        cua: chupCua(), nut: chupNut(), nutDe: chupNutDe(), bangTat: chupBangTat(), cuaBanDau: cuaBanDau, nutBanDau: nutBanDau, nutDeBanDau: nutDeBanDau, lua: chupLua(), luaBanDau: luaBanDau,
        thung: chupThung(), thungBanDau: thungBanDau, bongMo: null, diQua: [], mauO: san.mau, sac: san.sac.slice(), daSon: chupSon(), racCat: chupRacCat(), hinh: hinh, sonBanDau: sonBanDau,
        daChoi: daChoi.slice(), dieu: dieuDoi, dieuDung: dieuDung, dieuBatDau: dieuBatDau,
        ngachHang: ngachs.slice(), chuongDa: chuongDas.slice(), daChuong: chupDaChuong(), daChuongBanDau: daChuongBanDau,
        cong: chupCong(), van: chupVan(), dongTat: chupDongTat(), congBanDau: congBanDau, vanBanDau: vanBanDau,
        chong: chupChong(), chongBanDau: chongBanDau, tau: chupTau(), tauBanDau: tauBanDau, daGiao: chupDaGiao(), ray: rayO, taiToiDa: taiToiDa, luatThap: luatThap
      });
    }

    if (laDoi) return chayDoi();
    var g = Core.chayCodeGen(code, api, { nganSachLenh: opt.nganSachLenh || 20000, choPhep2D: true });
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
      son: coSon ? { ha: son.ha, mau: son.mau } : null, daSon: chupSon(), racCat: chupRacCat(), hinh: hinh, sonBanDau: sonBanDau,
      loa: coLoa ? { am: loa.am } : null, daChoi: daChoi.slice(), dieu: dieu, dieuDung: dieuDung, dieuBatDau: dieuBatDau,
      ngachHang: ngachs.slice(), chuongDa: chuongDas.slice(), daChuong: chupDaChuong(), daChuongBanDau: daChuongBanDau,
      cua: chupCua(), nut: chupNut(), nutDe: chupNutDe(), bangTat: chupBangTat(), cuaBanDau: cuaBanDau, nutBanDau: nutBanDau, nutDeBanDau: nutDeBanDau, lua: chupLua(), luaBanDau: luaBanDau,
      thung: chupThung(), thungBanDau: thungBanDau,
      bongMo: bongMo, diQua: chupDiQua(),
      soLanDoc: soLanDoc, docConLai: docCho, mauO: san.mau,
      pin: pin, pinToiDa: pinToiDa, sac: san.sac.slice(),
      chan: loai === 'nhen' ? chan : undefined,
      quayDo: loai === 'xich' ? (quayDo ? quayDo.huong : 0) : undefined,
      gai: laGai ? gai : undefined,
      // BẾN SÔNG: trạng thái cuối của cống / van / dòng tắt (và lúc xuất phát); xuồng: neo, keo
      cong: chupCong(), van: chupVan(), dongTat: chupDongTat(), congBanDau: congBanDau, vanBanDau: vanBanDau,
      neo: laXuong ? neo : undefined, keo: laXuong ? chupKeo() : undefined,
      // CẢNG SÔNG: chồng container cuối / đầu, tàu (coMat cuối), container đã giao theo từng tàu, ray { doc, o }, luật tải / tháp; cần cẩu: nac, tam, dau, treo
      chong: chupChong(), chongBanDau: chongBanDau, tau: chupTau(), tauBanDau: tauBanDau, daGiao: chupDaGiao(), ray: rayO, taiToiDa: taiToiDa, luatThap: luatThap,
      nac: laCau ? nac : undefined, tam: laCau ? tam : undefined, dau: laCau ? oDauCan() : undefined, treo: laCau ? chupTreo() : undefined
    };
  }

  var API = {
    VEC: VEC, TEN_HUONG: TEN_HUONG, HAM_GOC: HAM_GOC, LENH_NGUOC: LENH_NGUOC, BANH_LENH: BANH_LENH, MUC_TIEU: MUC_TIEU, phanCungMacDinh: phanCungMacDinh, phanCungCua: phanCungCua, TAY_LENH: TAY_LENH, TAY_XOAY: TAY_XOAY, XOAY_NAC: XOAY_NAC, TAY_NHOM: TAY_NHOM, BANG: BANG, BAN_XOAY: BAN_XOAY, CONG_KY: CONG_KY, XICH_QUAY: XICH_QUAY, OMNI_TRUOT: OMNI_TRUOT, OMNI_CHEO: OMNI_CHEO, OMNI_CHEO_BIEN: OMNI_CHEO_BIEN, CAM_BIEN_HAM: CAM_BIEN_HAM,
    TAY_NAM_CHAM: TAY_NAM_CHAM, TAY_NEM: TAY_NEM, TAY_HOI: TAY_HOI, LUC_BAN: LUC_BAN, TEN_CU_VOI_PHUN: TEN_CU_VOI_PHUN, TAM_BAN_NHANH: TAM_BAN_NHANH, TAY_SON: TAY_SON, SON_LENH: SON_LENH, laLenhSon: laLenhSon, TAY_LOA: TAY_LOA, NOT_TOI_DA: NOT_TOI_DA, SO_NHIP_TOI_DA: SO_NHIP_TOI_DA, laLenhLoa: laLenhLoa, docDieu: docDieu, docDieuDoi: docDieuDoi, THAN_GAI: THAN_GAI, CAM_AM_THANH_HAM: CAM_AM_THANH_HAM, MA_CAM_AM_THANH: MA_CAM_AM_THANH, TAM_NEM_TOI_DA: TAM_NEM_TOI_DA, CAM_TU_HAM: CAM_TU_HAM, CAM_HONG_NGOAI_HAM: CAM_HONG_NGOAI_HAM, MA_CAM_HONG_NGOAI: MA_CAM_HONG_NGOAI, CAM_RADAR_HAM: CAM_RADAR_HAM, MA_CAM_RADAR: MA_CAM_RADAR, RADAR_HUONG: RADAR_HUONG, DANG_KY: DANG_KY, DANG_TEN: DANG_TEN, CAM_PIN_HAM: CAM_PIN_HAM, PIN_TOI_DA: PIN_TOI_DA, CHAT_KY: CHAT_KY, TAM_HUT: TAM_HUT, TAM_CUC: TAM_CUC, TAM_DAY: TAM_DAY, CUC_MAU: CUC_MAU, CAM_MAU_HAM: CAM_MAU_HAM, CAM_NHIN_HAM: CAM_NHIN_HAM, MA_CAM_BAY: MA_CAM_BAY, MAU_KY: MAU_KY, MAU_TEN: MAU_TEN, laHamCamBien: laHamCamBien, lopMauCuaSan: lopMauCuaSan, coCuaSan: coCuaSan,
    CHAN_LENH: CHAN_LENH,
    NUOC_KY: NUOC_KY, VAT_NOI_KY: VAT_NOI_KY, THAN_NEO: THAN_NEO, TAY_PHAO: TAY_PHAO, HUONG_LUOI: HUONG_LUOI, DAI_LUOI_MAC_DINH: DAI_LUOI_MAC_DINH, CAM_DONG_HAM: CAM_DONG_HAM, MA_CAM_DONG: MA_CAM_DONG, TAM_KEO: TAM_KEO, HUONG_TUONG_DOI: HUONG_TUONG_DOI, laNuoc: laNuoc,   // BẾN SÔNG
    CANG_KY: CANG_KY, NAC_VEC: NAC_VEC, SO_NAC: SO_NAC, TAM_CAU_TOI_DA: TAM_CAU_TOI_DA, CHONG_TOI_DA: CHONG_TOI_DA, RAY_TOI_DA: RAY_TOI_DA, CONT_SO_TOI_DA: CONT_SO_TOI_DA, CONT_TAN_TOI_DA: CONT_TAN_TOI_DA,
    CAU_LENH: CAU_LENH, TAY_MOC: TAY_MOC, CAM_QUET_HAM: CAM_QUET_HAM, MA_CAM_QUET: MA_CAM_QUET, THAN_RAY: THAN_RAY,   // CẢNG SÔNG
    docSan: docSan, lyDoChan: lyDoChan, chay: chay
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.SanHoc = API;
})();
