/* ============================================================================
   san-hoc.js — "Đường học": MÔ PHỎNG SÂN theo NHỊP cho game dạy Python qua robot.

   Chạy được trong Node (module.exports) và trình duyệt (window.SanHoc).
   Dựa trên nhân chạy code của docs/mockups/san-robot-core.js (window.RobotCore):
   nhân nhường ra ngoài từng lời gọi hàm của game, ở đây ta thực hiện chúng.

   Sân: mảng chuỗi, (x, y) với y = 0 ở hàng trên.
     .  sàn      #  tường     F  cờ đích     S  bậc thang (chỉ nhện leo được)
     >  <  ^  v  băng chuyền, chiều đẩy
     o  vật nằm trên sàn     D  ô đích (khung vàng)     X  ô đích đã có vật sẵn
     H  thùng nặng trên sàn  h  thùng nặng nằm sẵn trên ô đích
   VẬT NẰM ĐẤT CHIẾM Ô (luật mới 14/10): o / X là sàn có một VẬT đứng trên đó; xe KHÔNG đi vào được ô có vật nằm (xem phần TAY GẮP).
   D chỉ là sàn có khung đích. H / h là sàn có THÙNG NẶNG chiếm ô, xem phần TẤM ĐẨY.
     r  g  b  y  sàn MÀU (đỏ, xanh lá, xanh dương, vàng): đi lại như sàn thường, xem phần CẢM BIẾN MÀU.
     N  nút bắn (như tường, bóng trúng thì đổi)   C  cửa đóng   c  cửa mở: xem phần SÚNG BÓNG.
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

   THÙNG NẶNG + TẤM ĐẨY (chương `tam-day`; xe bánh, xích, omni; nhện thì không). Ký hiệu sân: H thùng nặng trên sàn, h thùng nặng
        nằm sẵn trên ô đích (D, X, h đều là ô đích). Thùng nặng chiếm ô: xe KHÔNG đi xuyên được và tay kẹp KHÔNG gắp được
        (grab ngay ô có thùng → 'kep-hut', lyDo 'qua-nang'; chỉ xảy ra khi xe xuất phát trên ô thùng, vì xe không vào được ô thùng).
        Robot gắn tấm đẩy khi hamGoc có 'push' (không đi chung với 4 lệnh tay kẹp):
        - TIẾN vào ô có thùng: thùng bị đẩy 1 ô cùng hướng nếu ô sau thùng trống (không tường, không mép sân, không bậc thang S,
          không thùng khác); xe vào ô cũ của thùng ('thung-di' nguon 'xe'). Ô sau thùng bị chặn thì xe và thùng đứng im,
          mất 1 nhịp ('thung-chan' {o, den, vat, kieu:'tien'}).
        - KHÔNG có tấm đẩy thì xe đâm thùng như đâm tường ('dam-tuong', vat 'thung-nang', coDay false). Có tấm đẩy mà LÙI hay
          TRƯỢT (omni) vào thùng cũng đâm (coDay true, kieu 'lui' | 'truot'): tấm đẩy chỉ đẩy khi xe TIẾN thẳng.
        - Lệnh gốc push() (chỉ ra lệnh, wait() cho nhịp trôi): đẩy mạnh. Ô ngay trước mặt xe có thùng thì thùng TRƯỢT thẳng
          cho tới khi gặp tường / mép / bậc thang / thùng khác (không dừng ở ô đích); xe đứng yên; tốn 1 nhịp
          ('thung-di' nguon 'truot' {soO}). Thùng bị chặn ngay thì 'thung-chan' kieu 'push'. Không có thùng ngay trước mặt thì
          không làm gì ('day-hut', thông tin). Nhịp có push() thì lệnh bánh / trượt cùng nhịp bị bỏ ('day-dung-yen', thông tin);
          hai push() cùng nhịp thì lệnh sau bị bỏ ('push-goi-lai').
        - Băng chuyền đẩy thùng như đẩy xe bánh: thùng nằm trên băng đủ 2 nhịp LIÊN TIẾP thì bị đẩy 1 ô theo mũi tên nếu ô kế trống
          (không tường, bậc thang, thùng, xe); bị chặn thì đứng yên. Băng chuyền KHÔNG đẩy xe vào thùng (xe bị chặn: 'bang-chan').
        Mục tiêu 'day-thung': thắng NGAY khi MỌI thùng nặng nằm trên ô đích. Thùng nằm ở GÓC chết mà không phải ô đích (hai cạnh
        vuông góc là tường hoặc mép sân; ô băng dẫn ra khỏi góc thì không chết) thì dừng ngay cuối nhịp đó (dungSom = 'thung-ket').
        Thùng nặng chỉ thiết kế để đi với mục tiêu 'day-thung' hoặc 'toi-co' (làm vật chắn); không đi chung vật nhẹ 'o'.

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

   CẢM BIẾN MÀU (chương `mau`; mọi loại robot trừ khi cấu hình khác — chương 12 dùng xe hai bánh). Robot gắn cảm biến màu khi hamGoc có
        hàm gốc color(). color() TRẢ VỀ MỘT CHUỖI chữ thường: "red", "green", "blue", "yellow" hoặc "none" (ô không có màu).
        - Màu ô: ký hiệu r / g / b / y trong sân (sàn màu, đi lại như sàn thường), HOẶC lớp `mau` riêng (cfg.mau: mảng chuỗi cùng cỡ sân,
          mỗi ký tự r g b y hay '.'), dùng khi ô vừa có màu vừa có thứ khác (cờ F, ô đích D, ô X…). Hai cách cộng lại; một ô mà hai nơi ghi
          hai màu khác nhau, hay màu trên ô tường, là lỗi cấu hình.
        - Vật có màu: cfg.vatMau (mảng chuỗi cùng cỡ sân, ký tự r g b y đặt đúng ô có vật o / X). Vật không khai màu là vật không màu.
        - ĐÍCH CÓ MÀU: ô đích (D / X / h) mà ô đó có màu thì chỉ nhận vật CÙNG MÀU. Mục tiêu 'dua-vat' thắng khi mọi vật nằm trên đích và,
          nếu đích có màu, vật đúng màu đích (đích không màu nhận mọi vật như cũ). Thả vật xuống đích khác màu thì ghi 'dat-sai-mau'
          (lỗi) — vật vẫn nằm đó, nhặt lên lại được; không dừng sớm.
        - color(): đang MANG một vật (cầm bằng kẹp, dính nam châm, hay nằm trong rổ máy ném) thì trả màu CỦA VẬT ĐANG MANG ("none" nếu vật không màu);
          không mang gì thì trả màu SÀN ô ngay dưới xe. Vật nằm đất chiếm ô nên không bao giờ nằm dưới xe: đọc màu vật = gắp nó lên rồi color().
        - ĐỌC KHÔNG TỐN NHỊP, như cảm biến khoảng cách (đọc ở trạng thái hiện tại), ghi mục lệnh có `docCamBien` và sự kiện 'doc-cam-bien' ở nhịp
          kế tiếp: { ma, cam:'mau', ham:'color', tu:{x,y}, o:{x,y} (cùng ô), mau:'red'|…|'none', nguon:'san'|'vat' (vật đang mang), idVat: số|null, nhip }.
        - Gọi color() khi hamGoc không có: nhân báo "chưa có hàm" (cham.js đổi thành chẩn đoán chua-gan-cam-bien).
        - Đọc màu cũng tính vào giới hạn 1000 lần đọc liên tiếp không có nhịp ('infinite-loop').
        Kết quả chạy có `mauO` (null nếu sân không màu; không thì mảng hàng, mỗi hàng mảng màu hay null), và `vat[i].mau`, `dich[i].mau` chỉ khi có màu.

   NAM CHÂM (chương `nam-cham`; xe bánh, xích, omni; nhện thì không vì không có hướng mặt). Robot gắn tay nam châm khi hamGoc có
        magnet_on / magnet_off (cũng chỉ RA LỆNH, wait() cho nhịp trôi; một robot một tay: không đi chung với tay kẹp hay tấm đẩy).
        - CHẤT VẬT: mỗi vật là 'go' (gỗ, mặc định, mọi vật cũ) hoặc 'sat' (sắt). Khai bằng lớp `vatChat` (cfg.vatChat: mảng chuỗi cùng cỡ sân,
          ký tự s = sắt, g hay '.' = gỗ, đặt đúng ô có vật o / X; màn nhiều sân thì mảng song song với san, như vatMau), hay cfg.vat: [{x,y,chat}].
          Chọn lớp riêng thay vì ký hiệu mới trong sân để vật sắt dùng chung ô đích X, màu vật (vatMau) và mọi bộ dò cũ.
        - Trạng thái nam châm: { bat: true|false, cam: id vật đang dính | null }. Trong MỘT nhịp: (a) lệnh nam châm: magnet_on() bật;
          magnet_off() tắt và THẢ vật đang dính xuống ô SÁT MŨI xe (ô ngay trước mặt) nếu ô đó trống (không tường, mép sân, bậc thang S,
          thùng nặng, vật nằm); bị chặn thì vật VẪN DÍNH và nam châm vẫn bật ('tha-bi-chan', lỗi); ô đích khác màu → 'dat-sai-mau' như thả bằng tay
          → (b) bánh chạy → (c) băng chuyền → (d) HÚT, ở CUỐI nhịp.
        - HÚT (nam châm đang bật và chưa dính vật): tìm theo hướng mặt, ô 1 rồi ô 2 (thẳng hàng). Tường, mép sân, thùng nặng chắn; vật đầu tiên
          gặp là SẮT thì bị hút về ô sát mũi xe rồi DÍNH ('hut-vat' {id, tu, den, soO}, 'dinh-vat'); là GỖ thì không hút được, và vật gỗ
          chắn luôn vật sắt đứng sau nó ('hut-go', thông tin, khi nam châm bật mà thứ đầu tiên trước mặt là vật gỗ). Ô 1 có vật sắt thì dính luôn
          (soO 0). Mỗi lần chỉ dính một vật; đang dính thì không hút thêm.
        - Vật dính LƠ LỬNG ở mũi xe, không chiếm ô nào, đi theo xe, theo cả khi xe quay hay bị băng chuyền đẩy
          (trangThai 'cam', x y = ô xe). Vật nằm trên băng chuyền vẫn hút được; vật nằm dưới đất không bị băng kéo (như mọi vật).
        - Quên wait() sau magnet_on() → 'quen-wait'; hai lệnh nam châm cùng nhịp → lệnh sau bị bỏ ('magnet-goi-lai', lỗi).
        - front_metal() (cảm biến TỪ, gắn vào cảm biến khoảng cách ở hông; khai trong hamGoc): True nếu vật đầu tiên trong 2 ô trước mặt (cùng phép
          tìm với HÚT) là SẮT, tức là bật nam châm lúc này sẽ hút được; False nếu là gỗ, tường chắn hay không có vật. KHÔNG tốn nhịp. Ghi mục lệnh
          có `docCamBien` { cam:'tu', ham:'front_metal', tu, huong, o: ô vật tìm thấy | null, khoang: 0|1|2, chat: 'sat'|'go'|null, idVat, trong... }
          và sự kiện 'doc-cam-bien' (cùng bộ đếm 1000 lần đọc liên tiếp).
        - Mục tiêu 'dua-vat' + cfg.vatCan = 'sat': chỉ vật SẮT phải nằm trên ô đích, vật gỗ để yên ở đâu cũng được.
        Kết quả chạy có `namCham` { bat, cam } (null nếu robot không có tay nam châm); vết nhịp có robot.namCham và vat (có `chat`).

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
        - Cảm biến (front_clear, color…) dùng chung được với máy ném.

   SÚNG BÓNG (chương `sung-bong`; xe bánh, xích, omni; nhện thì không vì không có hướng mặt). Robot gắn tay súng bóng khi hamGoc có shoot
        (một robot một tay: không đi chung tay kẹp, tấm đẩy, nam châm, máy ném).
        Ký hiệu sân MỚI:  N  NÚT BẮN: nằm trên tường, chiếm ô như tường (xe không đi vào, lyDoChan 'nut'); trạng thái bat true/false (lúc đầu false).
                          C  CỬA ĐÓNG lúc đầu;  c  CỬA MỞ lúc đầu (cửa mở là sàn). Cửa đóng chặn xe (dam-tuong vat 'cua', front_clear() = False) và chặn bóng.
                          Vật và thùng không đặt lên ô N / C / c được. Lớp màu không được tô ô N / C / c.
        - shoot() chỉ RA LỆNH, wait() cho nhịp trôi. Nhịp có shoot thì xe ĐỨNG YÊN: lệnh bánh / trượt cùng nhịp bị bỏ ('ban-dung-yen', thông tin). Hai shoot cùng nhịp:
          lệnh sau bị bỏ ('ban-goi-lai', lỗi). Quên wait() sau shoot() → 'quen-wait'. Đạn vô hạn, trừ khi màn khai cfg.danToiDa = n: mỗi phát tốn 1 viên,
          hết đạn thì shoot() không bắn ('het-dan', lỗi) nhưng vẫn mất nhịp.
        - BÓNG bay THẲNG theo hướng mặt, từ ô trước mặt, đi ô tới ô TRONG CÙNG NHỊP, dừng ở vật cản đầu tiên: tường cao '#', nút 'N' (trung 'nut'), cửa đóng
          (trung 'cua'), thùng nặng (trung 'thung'), vật nằm đất (trung 'vat'), bậc thang S (trung 'bac-thang'). Bóng bay QUA hàng rào '=', băng chuyền, cửa mở, ô màu, ô đích, cờ.
          Ra khỏi sân không trúng gì: 'ban-hut' (thông tin), trung null. Sự kiện của nhịp 'ban' { nhip, tu: ô xe, huong, den: ô bóng tới (ô vật cản; ô cuối cùng trong sân nếu hụt),
          cuoi: ô trống cuối cùng bóng bay qua, o: ô vật cản | null, trung, soO: số ô bóng bay qua trước khi dừng }.
        - NÚT: bóng trúng N thì nút ĐỔI trạng thái (bat true ↔ false, sự kiện 'nut-doi' { o, bat }). Bắn hai lần là về như cũ. Mỗi nút điều khiển một nhóm: mặc định
          MỌI cửa thường (không phải cửa nhịp) và MỌI băng chuyền của sân; cfg.noi = [{ nut: {x,y}, cua: [{x,y}], bang: [{x,y}] }] khai nhóm riêng (nút không có trong noi
          thì không điều khiển gì; cửa nhịp không điều khiển bằng nút).
          · BĂNG CHUYỀN đổi NGAY khi nút đổi ('bang-doi' { o, bat: true = băng đang chạy }): băng tắt thì không đẩy xe / thùng (như sàn thường), đếm demBang về 0. Thứ tự trong nhịp:
            lệnh tay (bắn) → bánh → băng chuyền (theo trạng thái MỚI) → cửa đổi.
          · CỬA đổi ở CUỐI nhịp ('cua-doi' { o, mo }): nút đổi thì cửa đổi (đóng ↔ mở). Cửa không đóng xuống ô đang có xe, vật hay thùng: giữ mở và ghi 'cua-ket' (thông tin).
        - CỬA NHỊP (cfg.cuaNhip = [{ x, y, mo, dong, pha }], ô đó phải là C hay c): tự đóng mở theo chu kỳ mo + dong nhịp. Sau t nhịp đã trôi, p = (t + pha) mod (mo + dong);
          p < mo thì cửa mở. Đổi ở cuối nhịp như mọi cửa. Nút không điều khiển cửa nhịp. front_clear() là False khi cửa trước mặt đang đóng, nên `while not front_clear(): wait()` chờ được.
        - Tiến vào cửa đóng: dam-tuong vat 'cua'. Cảm biến khoảng cách coi cửa đóng là KHÔNG trống (vat 'cua') và nút N là không trống (vat 'nut').
        Kết quả chạy có `cua` [{x,y,mo}], `nut` [{x,y,bat}], `bangTat` [{x,y}] (ô băng đang tắt) — trạng thái CUỐI; cuaBanDau / nutBanDau lúc xuất phát; sung { dan } (null nếu robot
        không có súng; dan = số viên còn lại hay null nếu vô hạn). Vết nhịp có `cua`, `nut`, `bangTat` (cuối nhịp, chỉ khi sân có cửa / nút) và robot.sung.

   Băng chuyền: mỗi nhịp, SAU khi robot làm xong hành động, nếu robot đang đứng trên
   ô băng thì demBang++; đủ 2 thì đẩy 1 ô theo mũi tên (bị chặn thì đứng yên) và
   demBang = 0. Không đứng trên băng thì demBang = 0.

   Thắng NGAY khi robot chạm ô cờ (tự đi tới hoặc bị băng đẩy tới).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var Core = laNode ? require('../../docs/mockups/san-robot-core.js') : window.RobotCore;

  /* ------------------------------------------------------------------ hằng */

  // 0 lên, 1 phải, 2 xuống, 3 trái → vectơ (dx, dy), y = 0 ở hàng trên
  var VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  var TEN_HUONG = ['lên', 'phải', 'xuống', 'trái'];
  var BANG = { '>': 1, 'v': 2, '<': 3, '^': 0 };      // ký hiệu băng → hướng đẩy

  var HAM_GOC = {
    banh: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'],
    nhen: ['go_up', 'go_down', 'go_left', 'go_right', 'wait'],
    xich: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'],      // cùng bộ lệnh với xe bánh
    omni: ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait']   // bộ lệnh xe bánh + hai lệnh trượt ngang
  };
  // omni: lệnh trượt → bên trượt so với hướng mặt (-1 trái, +1 phải)
  var OMNI_TRUOT = { slide_left: -1, slide_right: 1 };
  // xích quay chậm: tổ hợp (bánh trái, bánh phải) → chiều quay (+1 phải, -1 trái); cần 2 nhịp liên tiếp cùng tổ hợp mới đủ 90°
  var XICH_QUAY = { '1,0': 1, '0,-1': 1, '1,-1': 1, '0,1': -1, '-1,0': -1, '-1,1': -1 };
  var NHEN_HUONG = { go_up: 0, go_right: 1, go_down: 2, go_left: 3 };
  // lệnh tay gắp của xe bánh. Hai nhóm: tư thế (arm_down / arm_up) và kẹp (grab / release);
  // mỗi nhịp mỗi nhóm nhận MỘT lệnh, lệnh sau bị bỏ ('tay-goi-lai').
  var TAY_LENH = ['arm_down', 'arm_up', 'grab', 'release'];
  var TAY_NHOM = { arm_down: 'tu-the', arm_up: 'tu-the', grab: 'kep', release: 'kep' };
  var TAY_DAY = ['push'];                       // tay tấm đẩy (chương tam-day): một lệnh gốc push()
  // cảm biến khoảng cách (chương khoang-cach): hàm gốc trả True / False. Giá trị = lệch hướng so với hướng mặt (0 trước, 1 phải, 3 trái)
  var CAM_BIEN_HAM = { front_clear: 0, right_clear: 1, left_clear: 3 };
  // cảm biến màu (chương mau): hàm gốc color() trả chuỗi. Ký hiệu r g b y ↔ tên màu
  var CAM_MAU_HAM = ['color'];
  var MAU_KY = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
  var MAU_TEN = ['red', 'green', 'blue', 'yellow'];
  // tay nam châm (chương nam-cham): hai lệnh gốc magnet_on / magnet_off; cảm biến từ front_metal() trả True / False. Chất vật: s sắt, g gỗ
  var TAY_NAM_CHAM = ['magnet_on', 'magnet_off'];
  var CAM_TU_HAM = ['front_metal'];
  // tay máy ném (chương may-nem): aim(n) đặt tầm (đổi ngay, không tốn nhịp), load() nạp vật ở ô TRƯỚC MẶT vào rổ, throw() ném vật trong rổ; ký hiệu '=' là tường thấp (hàng rào)
  var TAY_NEM = ['aim', 'throw', 'load'];
  var TAM_NEM_TOI_DA = 3;                       // aim(n): n = 1, 2 hoặc 3 ô
  // tay súng bóng (chương sung-bong): một lệnh gốc shoot(); ký hiệu N nút bắn, C cửa đóng, c cửa mở
  var TAY_BONG = ['shoot'];
  var CHAT_KY = { s: 'sat', g: 'go' };
  var TAM_HUT = 2;                              // nam châm hút vật sắt trong 2 ô trước mặt
  var DOC_LIEN_TIEP_TOI_DA = 1000;             // đọc cảm biến liên tiếp không có nhịp: quá số này coi là vòng lặp vô hạn
  var DOC_TOI_DA_MOI_NHIP = 50;                 // số sự kiện 'doc-cam-bien' tối đa gắn vào một nhịp (vết lệnh vẫn đủ)
  var BANH_LENH = {
    left_move: ['trai', 1], left_back: ['trai', -1],
    right_move: ['phai', 1], right_back: ['phai', -1]
  };

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
        else if (CHAT_KY[c]) kq.push(CHAT_KY[c]);
        else throw new Error('Ký hiệu lạ trong lớp chất vật: "' + c + '" (' + x + ', ' + y + ').');
      }
      return kq;
    });
  }

  /** lopMau: lớp màu sàn (tuỳ chọn, xem phần CẢM BIẾN MÀU); lopVatMau: lớp màu vật (tuỳ chọn); lopVatChat: lớp chất vật sắt / gỗ (tuỳ chọn, xem phần NAM CHÂM). */
  function docSan(rows, lopMau, lopVatMau, lopVatChat) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Sân phải là mảng chuỗi, không rỗng.');
    var rong = rows[0].length, co = null, vat = [], dich = [], thung = [], mau = null, nut = [], cua = [];
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
        else if (c === 'C') cua.push({ x: x, y: y, mo: false });
        else if (c === 'c') cua.push({ x: x, y: y, mo: true });
        else if (c === 'h') { thung.push({ x: x, y: y }); dich.push({ x: x, y: y }); }
        else if (MAU_KY[c]) {                                          // sàn màu (r g b y)
          if (!mau) mau = newMau(rong, rows.length);
          mau[y][x] = MAU_KY[c];
        }
        else if ('.#=S'.indexOf(c) < 0 && BANG[c] === undefined) {
          throw new Error('Ký hiệu lạ trong sân: "' + c + '" (' + x + ', ' + y + ').');
        }
      }
    }
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
        vat[ci].chat = lopC[cy][cx];
      }
    }
    dich.forEach(function (d) { if (mau && mau[d.y][d.x]) d.mau = mau[d.y][d.x]; });      // ô đích có màu → chỉ nhận vật cùng màu
    // vat: các vật nằm sẵn (ký hiệu o, X) theo thứ tự đọc từng hàng (có thêm mau nếu vật có màu); dich: các ô đích (D, X, h; có thêm mau nếu ô đó có màu);
    // thung: thùng nặng (H, h); nut: các nút bắn (N); cua: các cửa (C đóng, c mở: { x, y, mo }); mau: null (sân không màu) hay mảng hàng tên màu / null
    return { o: rows.slice(), rong: rong, cao: rows.length, co: co, vat: vat, dich: dich, thung: thung, mau: mau, nut: nut, cua: cua };
  }
  function newMau(rong, cao) {
    var m = [];
    for (var y = 0; y < cao; y++) { var h = []; for (var x = 0; x < rong; x++) h.push(null); m.push(h); }
    return m;
  }

  /** Lớp màu sàn / màu vật của sân thứ i của màn m (màn một sân hay nhiều sân: m.mau, m.vatMau song song với m.san). */
  function lopMauCuaSan(m, i) {
    var nhieu = Array.isArray(m.san[0]);
    function lay(l) { return l ? (nhieu ? (l[i] || null) : l) : null; }
    return { mau: lay(m.mau), vatMau: lay(m.vatMau), vatChat: lay(m.vatChat), vatThem: lay(m.vatThem), cuaNhip: lay(m.cuaNhip), noi: lay(m.noi) };
  }
  function laHamCamBien(t) { return CAM_BIEN_HAM[t] !== undefined || CAM_MAU_HAM.indexOf(t) >= 0 || CAM_TU_HAM.indexOf(t) >= 0; }

  function oTai(san, x, y) {
    if (x < 0 || y < 0 || x >= san.rong || y >= san.cao) return null;   // ngoài sân
    return san.o[y][x];
  }

  /** Robot loại `loai` có vào được ô (x, y) không? Trả về null nếu được,
   *  hoặc lý do bị chặn: 'ngoai-san' | 'tuong' | 'rao' | 'nut' | 'bac-thang'. (Cửa đóng là trạng thái động: chay() tự xét thêm, xem SÚNG BÓNG.) */
  function lyDoChan(san, loai, x, y) {
    var c = oTai(san, x, y);
    if (c === null) return 'ngoai-san';
    if (c === '#') return 'tuong';
    if (c === '=') return 'rao';
    if (c === 'N') return 'nut';
    if (c === 'S' && (loai === 'banh' || loai === 'omni')) return 'bac-thang';
    return null;
  }

  /* ----------------------------------------------------------------- chạy */

  /**
   * Chạy một chương trình Python trên một sân.
   * cfg: { san: [chuỗi], batDau: {x,y,huong}, loaiRobot: 'banh'|'nhen'|'xich'|'omni',
   *        hamGoc: [tên hàm gốc được phép] (mặc định: đủ bộ của loại robot, chưa có lệnh tay),
   *        nhipToiDa: 200,
   *        mucTieu: 'toi-co' (mặc định) | 'dua-vat',
   *        vat: [{x,y,mau?}] (vật thêm vào ngoài các ô 'o' / 'X' của sân), dich: [{x,y,mau?}] (ô đích thêm),
   *        mau: [chuỗi] (lớp màu sàn), vatMau: [chuỗi] (lớp màu vật): xem phần CẢM BIẾN MÀU,
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
   *     dich: các ô đích [{x,y}]; dungSom: null | 'vat-vo' (dừng sớm vì vật vỡ, chỉ ở mục tiêu dua-vat)
   *   - soLanDoc: số lần đọc cảm biến; docConLai: các sự kiện 'doc-cam-bien' chưa gắn vào nhịp nào (đọc sau nhịp cuối).
   */
  function chay(cfg, code, opt) {
    opt = opt || {};
    var loai = cfg.loaiRobot || 'banh';
    if (loai !== 'banh' && loai !== 'nhen' && loai !== 'xich' && loai !== 'omni') throw new Error('Loại robot lạ: ' + loai);
    var laBanh = loai === 'banh' || loai === 'xich' || loai === 'omni';      // dùng chung bộ lệnh bánh
    var mucTieu = cfg.mucTieu || 'toi-co';
    if (mucTieu !== 'toi-co' && mucTieu !== 'dua-vat' && mucTieu !== 'day-thung') throw new Error('Mục tiêu lạ: ' + mucTieu);
    var vatCan = cfg.vatCan || null;                                          // 'sat': chỉ vật sắt phải về đích (chương nam-cham)
    if (vatCan !== null && vatCan !== 'sat') throw new Error('vatCan lạ: ' + vatCan);
    var san = docSan(cfg.san, cfg.mau, cfg.vatMau, cfg.vatChat);
    var bd = cfg.batDau;
    if (!bd) throw new Error('Thiếu vị trí xuất phát (batDau).');
    if (lyDoChan(san, loai, bd.x, bd.y)) throw new Error('Robot xuất phát trong chỗ không đứng được.');
    var nhipToiDa = cfg.nhipToiDa || 200;

    var hamGoc = cfg.hamGoc || HAM_GOC[loai];
    hamGoc.forEach(function (t) {
      if (HAM_GOC[loai].indexOf(t) < 0 && TAY_LENH.indexOf(t) < 0 && TAY_DAY.indexOf(t) < 0 && CAM_BIEN_HAM[t] === undefined && CAM_MAU_HAM.indexOf(t) < 0 && TAY_NAM_CHAM.indexOf(t) < 0 && CAM_TU_HAM.indexOf(t) < 0 && TAY_NEM.indexOf(t) < 0 && TAY_BONG.indexOf(t) < 0) {
        throw new Error('Hàm gốc "' + t + '" không thuộc loại robot ' + loai + '.');
      }
    });
    var api = {};
    hamGoc.forEach(function (t) { api[t] = function () { return 0; }; });   // chỉ để nhân biết tên
    var coTay = hamGoc.some(function (t) { return TAY_LENH.indexOf(t) >= 0; });
    var coDay = hamGoc.some(function (t) { return TAY_DAY.indexOf(t) >= 0; });     // tay tấm đẩy (push)
    if (coDay && loai === 'nhen') throw new Error('Nhện không gắn tấm đẩy (push).');
    if (coDay && coTay) throw new Error('Một robot chỉ có một tay: push không đi chung với arm_down, arm_up, grab, release.');
    var coNamCham = hamGoc.some(function (t) { return TAY_NAM_CHAM.indexOf(t) >= 0; });     // tay nam châm (magnet_on / magnet_off)
    if (coNamCham && loai === 'nhen') throw new Error('Nhện không gắn nam châm (nhện không có hướng mặt).');
    if (coNamCham && (coTay || coDay)) throw new Error('Một robot chỉ có một tay: nam châm không đi chung với tay kẹp hay tấm đẩy.');
    var coNem = hamGoc.some(function (t) { return TAY_NEM.indexOf(t) >= 0; });                  // tay máy ném (aim / throw / load)
    if (coNem && loai === 'nhen') throw new Error('Nhện không gắn máy ném (nhện không có hướng mặt).');
    if (coNem && (coTay || coDay || coNamCham)) throw new Error('Một robot chỉ có một tay: máy ném không đi chung với tay kẹp, tấm đẩy hay nam châm.');
    var coBong = hamGoc.some(function (t) { return TAY_BONG.indexOf(t) >= 0; });                  // tay súng bóng (shoot)
    if (coBong && loai === 'nhen') throw new Error('Nhện không gắn súng bóng (nhện không có hướng mặt).');
    if (coBong && (coTay || coDay || coNamCham || coNem)) throw new Error('Một robot chỉ có một tay: súng bóng không đi chung với tay kẹp, tấm đẩy, nam châm hay máy ném.');
    var coCamBien = hamGoc.some(function (t) { return CAM_BIEN_HAM[t] !== undefined; });     // cảm biến khoảng cách (front_clear…)
    var coCamTu = hamGoc.some(function (t) { return CAM_TU_HAM.indexOf(t) >= 0; });         // cảm biến từ front_metal (gắn vào cảm biến khoảng cách)
    if ((coCamBien || coCamTu) && loai === 'nhen') throw new Error('Nhện không gắn cảm biến khoảng cách (nhện không có hướng mặt).');

    var rb = { x: bd.x, y: bd.y, huong: bd.huong || 0 };
    var nhip = 0, demBang = 0;
    var quayDo = null;                          // xích: phần quay dở { khoa:'t,p', huong:+1|-1, nhip, lenh:{ten,dongPy}|null }
    var lenh = { trai: 0, phai: 0 };            // lệnh bánh đang chờ wait()
    var lenhTon = [];                           // các lệnh (bánh và tay) chưa wait(): {ten, dongPy}
    var tayCho = { 'tu-the': null, 'kep': null };   // lệnh tay đang chờ wait(), theo nhóm: {ten, dongPy}
    var truotCho = null;                        // omni: lệnh trượt đang chờ wait(): {ten, dongPy, bien:-1|+1}
    var pushCho = null;                         // tấm đẩy: lệnh push() đang chờ wait(): {ten, dongPy}
    var ncCho = null;                           // nam châm: lệnh magnet_on() / magnet_off() đang chờ wait(): {ten, dongPy, bat}
    var nc = { bat: false, cam: null };         // nam châm: đang bật không, id vật đang dính
    var nem = { tam: 1, ro: null };             // máy ném: tầm đang đặt (1–3), id vật trong rổ
    var nemCho = null;                          // máy ném: lệnh load() / throw() đang chờ wait(): {ten, dongPy, tam}
    var bongCho = null;                         // súng bóng: lệnh shoot() đang chờ wait(): {ten, dongPy}
    var dan = null;                             // súng bóng: số viên còn lại (null = vô hạn)
    if (cfg.danToiDa !== undefined && cfg.danToiDa !== null) {
      if (!coBong) throw new Error('danToiDa chỉ dùng cho robot có súng bóng (hamGoc có shoot).');
      if (typeof cfg.danToiDa !== 'number' || Math.floor(cfg.danToiDa) !== cfg.danToiDa || cfg.danToiDa < 0) throw new Error('danToiDa phải là số nguyên không âm.');
      dan = cfg.danToiDa;
    }
    var vet = [], suKienChan = [];
    var thang = false, loi = null, dungSom = null;
    var docCho = [], docLienTiep = 0, soLanDoc = 0, traVe = 0;       // cảm biến: sự kiện chờ gắn vào nhịp kế, số lần đọc liên tiếp chưa có nhịp, tổng số lần đọc, giá trị trả về cho nhân

    // ---- tay gắp, vật, ô đích
    var tay = { tuThe: 'tren', kep: false, cam: null };
    var vats = [], dichSet = {}, dsDich = [];
    function themVat(o) {
      var x = Math.floor(o.x), y = Math.floor(o.y);
      if (!(x >= 0 && y >= 0 && x < san.rong && y < san.cao) || '#=NCc'.indexOf(san.o[y][x]) >= 0) return;
      for (var i = 0; i < vats.length; i++) if (vats[i].x === x && vats[i].y === y) return;     // mỗi ô một vật
      vats.push({ id: vats.length + 1, x: x, y: y, trangThai: 'dat', mau: o.mau || null, chat: o.chat === 'sat' ? 'sat' : 'go' });
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
    function chupTay() { return { tuThe: tay.tuThe, kep: tay.kep, cam: tay.cam }; }
    function chupNamCham() { return { bat: nc.bat, cam: nc.cam }; }
    function chupNem() { return { tam: nem.tam, ro: nem.ro }; }
    function chupVat() { return vats.map(function (v) { var o = { id: v.id, x: v.x, y: v.y, trangThai: v.trangThai }; if (v.mau) o.mau = v.mau; if (coNamCham || v.chat === 'sat') o.chat = v.chat; return o; }); }
    /** Màu sàn của ô (x, y): tên màu hay null. */
    function mauNen(x, y) { return (san.mau && san.mau[y] && san.mau[y][x]) || null; }
    /** Vật v nằm trên ô đích (x, y) có hợp màu không: đích không màu nhận mọi vật; đích có màu chỉ nhận vật cùng màu. */
    function hopMauDich(v, x, y) {
      var md = dichMau[x + ',' + y];
      return !md || v.mau === md;
    }
    // ---- thùng nặng (H, h; cfg.thung thêm ngoài sân, dùng cho thử nghiệm). dem: số nhịp liên tiếp nằm trên băng chuyền
    var thungs = [];
    function themThung(o) {
      var x = Math.floor(o.x), y = Math.floor(o.y);
      if (!(x >= 0 && y >= 0 && x < san.rong && y < san.cao) || '#=NCc'.indexOf(san.o[y][x]) >= 0) return;
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
      if (thungTai(x, y)) return 'thung-nang';
      if (rb.x === x && rb.y === y) return 'xe';
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
    if (cfg.roBanDau) {                                   // máy ném: rổ có sẵn một vật lúc xuất phát (cfg.roBanDau: true | { mau })
      if (!coNem) throw new Error('roBanDau chỉ dùng cho robot có máy ném (hamGoc có aim, throw hay load).');
      var rbd = typeof cfg.roBanDau === 'object' ? cfg.roBanDau : {};
      vats.push({ id: vats.length + 1, x: bd.x, y: bd.y, trangThai: 'ro', mau: rbd.mau || null, chat: rbd.chat === 'sat' ? 'sat' : 'go' });
      nem.ro = vats.length;
    }
    var vatBanDau = chupVat();

    // ---- súng bóng: nút (N), cửa (C đóng / c mở; cửa nhịp), băng chuyền tắt khi nút đổi (xem phần SÚNG BÓNG)
    var nuts = san.nut.map(function (n) { return { x: n.x, y: n.y, bat: false, cua: [], bang: [] }; });
    var cuas = san.cua.map(function (d) { return { x: d.x, y: d.y, mo: d.mo, nhip: null, doi: false }; });
    var cuaTai = {}, nutTai = {}, bangTat = {}, bangO = [];
    nuts.forEach(function (n) { nutTai[n.x + ',' + n.y] = n; });
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
        if (!n) throw new Error('Nhóm nối: ô nút (' + (g.nut ? g.nut.x + ', ' + g.nut.y : '?') + ') không phải nút N.');
        (g.cua || []).forEach(function (c) {
          var d = cuaTai[c.x + ',' + c.y];
          if (!d) throw new Error('Nhóm nối: ô (' + c.x + ', ' + c.y + ') không phải cửa.');
          if (d.nhip) throw new Error('Nhóm nối: cửa nhịp (' + c.x + ', ' + c.y + ') không điều khiển bằng nút.');
          if (n.cua.indexOf(d) < 0) n.cua.push(d);
        });
        (g.bang || []).forEach(function (b) {
          if (!bangO.some(function (q) { return q.x === b.x && q.y === b.y; })) throw new Error('Nhóm nối: ô (' + b.x + ', ' + b.y + ') không phải băng chuyền.');
          if (n.bang.indexOf(b.x + ',' + b.y) < 0) n.bang.push(b.x + ',' + b.y);
        });
      });
    } else {
      nuts.forEach(function (n) {
        n.cua = cuas.filter(function (d) { return !d.nhip; });
        n.bang = bangO.map(function (q) { return q.x + ',' + q.y; });
      });
    }
    if (cuaTai[bd.x + ',' + bd.y] && !cuaTai[bd.x + ',' + bd.y].mo) throw new Error('Robot xuất phát trong ô cửa đang đóng.');
    function cuaDong(x, y) { var d = cuaTai[x + ',' + y]; return !!d && !d.mo; }
    function chupCua() { return cuas.map(function (d) { return { x: d.x, y: d.y, mo: d.mo }; }); }
    function chupNut() { return nuts.map(function (n) { return { x: n.x, y: n.y, bat: n.bat }; }); }
    function chupBangTat() { return bangO.filter(function (q) { return bangTat[q.x + ',' + q.y]; }).map(function (q) { return { x: q.x, y: q.y }; }); }
    var cuaBanDau = chupCua(), nutBanDau = chupNut();

    function vatNamTai(x, y) {
      for (var i = 0; i < vats.length; i++) if (vats[i].trangThai === 'dat' && vats[i].x === x && vats[i].y === y) return vats[i];
      return null;
    }
    function vatTheoId(id) { return vats[id - 1]; }

    /** Ô ngay trước mũi xe theo hướng mặt (nhện: hướng cố định lúc xuất phát). */
    function oTruoc() { var v = VEC[rb.huong]; return { x: rb.x + v[0], y: rb.y + v[1] }; }

    /** (b) kẹp / thả Ở Ô TRƯỚC MẶT, ở tư thế hiện tại. Trả về true nếu có vật vỡ. */
    function kepHoacTha(kieu, sk, lenhTay) {
      var o = oTruoc(), v;
      var lk = lenhTay ? { ten: lenhTay.ten, dongPy: lenhTay.dongPy } : null;          // lệnh tay gây ra (cho chẩn đoán trỏ đúng dòng)
      if (kieu === 'kep') {
        if (tay.cam !== null) return false;                     // đang cầm: không đổi gì
        if (thungTai(o.x, o.y)) {                               // thùng nặng: tay kẹp không nhấc nổi
          tay.kep = true;
          var kn = { ma: 'kep-hut', nhip: nhip, o: o, lyDo: 'qua-nang', lenh: lk };
          sk.push(kn); suKienChan.push(kn);
          return false;
        }
        v = vatNamTai(o.x, o.y);
        tay.kep = true;
        if (v && tay.tuThe === 'duoi') {
          v.trangThai = 'cam'; v.x = rb.x; v.y = rb.y; tay.cam = v.id;
          sk.push({ ma: 'nhat-vat', id: v.id, o: o });
        } else if (v || tay.tuThe === 'duoi') {
          var kh = { ma: 'kep-hut', nhip: nhip, o: o, lyDo: v ? 'tay-nang' : 'khong-co-vat', lenh: lk };
          sk.push(kh); suKienChan.push(kh);
        }
        return false;
      }
      // thả
      if (tay.cam === null) { tay.kep = false; return false; }
      v = vatTheoId(tay.cam);
      if (tay.tuThe === 'tren') {                               // thả từ trên cao: vật rơi xuống ô trước mặt và vỡ
        var ov = oTai(san, o.x, o.y) === null ? { x: rb.x, y: rb.y } : o;
        v.trangThai = 'vo'; v.x = ov.x; v.y = ov.y; tay.cam = null; tay.kep = false;
        var e = { ma: 'vat-vo', nhip: nhip, id: v.id, o: ov, lenh: lk };
        sk.push(e); suKienChan.push(e);
        return true;
      }
      var ly = oThaChan(o.x, o.y);
      if (ly) {                                                 // ô trước không phải sàn trống: vật vẫn ở tay, kẹp vẫn đóng
        var e2 = { ma: 'tha-bi-chan', nhip: nhip, id: v.id, o: o, vat: ly, kieu: 'kep', lenh: lk };
        sk.push(e2); suKienChan.push(e2);
        return false;
      }
      v.trangThai = 'dat'; v.x = o.x; v.y = o.y; tay.cam = null; tay.kep = false;
      sk.push({ ma: 'dat-vat', id: v.id, o: o });
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
      var can = vatCan === 'sat' ? vats.filter(function (v) { return v.chat === 'sat'; }) : vats;       // vatCan 'sat': vật gỗ không cần về đích
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
      if (thungTai(x, y)) return 'thung-nang';
      if (vatNamTai(x, y)) return 'vat';
      return null;
    }
    /** Nhìn theo hướng mặt ô 1 rồi ô 2: vật đầu tiên gặp (tường, mép sân, thùng nặng chắn). Trả { vat, khoang, o } (vat null nếu không có gì). */
    function nhinTruoc() {
      var v = VEC[rb.huong];
      for (var d = 1; d <= TAM_HUT; d++) {
        var x = rb.x + v[0] * d, y = rb.y + v[1] * d, c = oTai(san, x, y);
        if (c === null || c === '#' || thungTai(x, y)) return { vat: null, khoang: 0, o: null };
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
      if (nhip >= nhipToiDa) {
        loi = { loai: 'qua-nhieu-nhip', dong: 0, thongDiep: 'Quá ' + nhipToiDa + ' nhịp.' };
        return true;
      }
      nhip++;
      var sk = docCho; docCho = []; docLienTiep = 0;          // các lần đọc cảm biến từ nhịp trước tới giờ gắn vào nhịp này
      var banhGhi = { trai: 0, phai: 0 };
      var truotGhi = 0;
      // lệnh đi / bánh gây ra chuyện của nhịp này (cho chẩn đoán trỏ đúng dòng): lệnh trượt, lệnh bánh đầu tiên, hay lệnh go_* của nhện
      var lenhNhip = (hanhDong.kieu === 'banh' ? (hanhDong.truot ? { ten: hanhDong.truot.ten, dongPy: hanhDong.truot.dongPy } : hanhDong.lenhBanh) : hanhDong.lenhDi) || (hanhDong.bong ? { ten: hanhDong.bong.ten, dongPy: hanhDong.bong.dongPy } : null) || null;
      var coVo = false;

      function thuDi(huongDi, soBuoc, ma) {
        var v = VEC[huongDi], nx = rb.x + v[0] * soBuoc, ny = rb.y + v[1] * soBuoc;
        var ly = lyDoChan(san, loai, nx, ny);
        if (!ly && cuaDong(nx, ny)) ly = 'cua';                           // cửa đang đóng chặn như tường
        var tn = ly ? null : thungTai(nx, ny);
        if (tn) {                                                         // ô có thùng nặng
          if (coDay && ma === 'tien') {                                   // tấm đẩy: tiến thì đẩy thùng 1 ô nếu ô sau thùng trống
            var bx = nx + v[0], by = ny + v[1], lyT = oThungChan(bx, by);
            if (lyT) {
              var ec = { ma: 'thung-chan', nhip: nhip, id: tn.id, o: { x: nx, y: ny }, den: { x: bx, y: by }, vat: lyT, kieu: 'tien', lenh: lenhNhip };
              sk.push(ec); suKienChan.push(ec);
              return;
            }
            tn.x = bx; tn.y = by; tn.dem = 0;
            sk.push({ ma: 'thung-di', id: tn.id, tu: { x: nx, y: ny }, den: { x: bx, y: by }, nguon: 'xe' });
            rb.x = nx; rb.y = ny; sk.push({ ma: ma, den: { x: nx, y: ny } });
            return;
          }
          var et = { ma: 'dam-tuong', nhip: nhip, den: { x: nx, y: ny }, tu: { x: rb.x, y: rb.y }, vat: 'thung-nang', coDay: coDay, kieu: ma, lenh: lenhNhip };
          sk.push(et); suKienChan.push(et);
          return;
        }
        var vn = ly ? null : vatNamTai(nx, ny);
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

      /** push(): thùng ngay trước mặt xe trượt thẳng tới khi gặp vật cản. */
      function pushManh(lenhPush) {
        var v = VEC[rb.huong], fx = rb.x + v[0], fy = rb.y + v[1], tn = thungTai(fx, fy);
        if (!tn) {
          var eh = { ma: 'day-hut', nhip: nhip, o: { x: fx, y: fy }, lenh: lenhPush || null };
          sk.push(eh); suKienChan.push(eh);
          return;
        }
        var cx = fx, cy = fy, soO = 0;
        while (!oThungChan(cx + v[0], cy + v[1])) { cx += v[0]; cy += v[1]; soO++; }
        if (!soO) {
          var ec2 = { ma: 'thung-chan', nhip: nhip, id: tn.id, o: { x: fx, y: fy }, den: { x: fx + v[0], y: fy + v[1] }, vat: oThungChan(fx + v[0], fy + v[1]), kieu: 'push', lenh: lenhPush || null };
          sk.push(ec2); suKienChan.push(ec2);
          return;
        }
        tn.x = cx; tn.y = cy; tn.dem = 0;
        sk.push({ ma: 'thung-di', id: tn.id, tu: { x: fx, y: fy }, den: { x: cx, y: cy }, nguon: 'truot', soO: soO });
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

      function apTay() {
        if (!coTay) return;
        var lt = hanhDong.tay || {};
        if (lt.tuThe) tay.tuThe = lt.tuThe;                                 // (a) tay đổi tư thế
        if (lt.kep) coVo = kepHoacTha(lt.kep, sk, lt.lenhKep);                          // (b) kẹp / thả ở tư thế mới
      }

      /** (a) nam châm: magnet_on bật; magnet_off tắt và thả vật dính xuống ô sát mũi xe (bị chặn thì vẫn dính, vẫn bật). */
      function apNamCham() {
        var l = hanhDong.nc;
        if (!coNamCham || !l) return;
        if (l.bat) { nc.bat = true; return; }
        if (nc.cam === null) { nc.bat = false; return; }
        var v = VEC[rb.huong], fx = rb.x + v[0], fy = rb.y + v[1], ly = oThaChan(fx, fy), vt = vatTheoId(nc.cam);
        if (ly) {
          var eb = { ma: 'tha-bi-chan', nhip: nhip, id: vt.id, o: { x: fx, y: fy }, vat: ly, lenh: l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null };
          sk.push(eb); suKienChan.push(eb);
          return;
        }
        vt.trangThai = 'dat'; vt.x = fx; vt.y = fy; nc.cam = null; nc.bat = false;
        sk.push({ ma: 'tha-vat', id: vt.id, den: { x: fx, y: fy } });
        if (dichSet[fx + ',' + fy] && !hopMauDich(vt, fx, fy)) {
          var esm = { ma: 'dat-sai-mau', nhip: nhip, id: vt.id, o: { x: fx, y: fy }, mauVat: vt.mau || 'none', mauDich: dichMau[fx + ',' + fy] };
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

      /** SÚNG BÓNG: shoot() bắn một quả bóng thẳng theo hướng mặt, bay ô tới ô trong cùng nhịp, dừng ở vật cản đầu tiên; trúng nút N thì nút đổi (băng đổi ngay, cửa đổi cuối nhịp). */
      function banBong(l) {
        var lenhGhi = l.dongPy ? { ten: l.ten, dongPy: l.dongPy } : null;
        if (dan !== null) {
          if (dan <= 0) {
            var eh = { ma: 'het-dan', nhip: nhip, lenh: lenhGhi };
            sk.push(eh); suKienChan.push(eh);
            return;
          }
          dan--;
        }
        var v = VEC[rb.huong], x = rb.x, y = rb.y, d = 0, cuoi = { x: rb.x, y: rb.y }, trung = null, oVC = null;
        for (;;) {
          x += v[0]; y += v[1]; d++;
          var c = oTai(san, x, y);
          if (c === null) break;                                                // ra khỏi sân
          var ly = null;
          if (c === '#') ly = 'tuong';
          else if (c === 'N') ly = 'nut';
          else if (c === 'S') ly = 'bac-thang';
          else if (cuaDong(x, y)) ly = 'cua';
          else if (thungTai(x, y)) ly = 'thung';
          else if (vatNamTai(x, y)) ly = 'vat';
          if (ly) { trung = ly; oVC = { x: x, y: y }; break; }
          cuoi = { x: x, y: y };
        }
        sk.push({ ma: 'ban', nhip: nhip, tu: { x: rb.x, y: rb.y }, huong: rb.huong, den: oVC || cuoi, cuoi: cuoi, o: oVC, trung: trung, soO: d - 1 });
        if (trung === null) {
          var ek = { ma: 'ban-hut', nhip: nhip, tu: { x: rb.x, y: rb.y }, huong: rb.huong, cuoi: cuoi, soO: d - 1, lenh: lenhGhi };
          sk.push(ek); suKienChan.push(ek);
          return;
        }
        if (trung !== 'nut') {
          if (nuts.length) {                                                    // sân có nút mà bóng bị chặn ở thứ khác: thông tin
            var eb = { ma: 'ban-bi-chan', nhip: nhip, o: oVC, vat: trung, lenh: lenhGhi };
            sk.push(eb); suKienChan.push(eb);
          }
          return;
        }
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
      }

      /** Cuối nhịp: cửa đổi theo nút (đã bị bắn trong nhịp) hay theo chu kỳ (cửa nhịp). Cửa không đóng xuống ô đang có xe / vật / thùng: giữ mở ('cua-ket'). */
      function capNhatCua() {
        cuas.forEach(function (dc) {
          var muon = dc.mo, nguon = null;
          if (dc.nhip) { muon = cuaNhipMo(dc.nhip, nhip); nguon = 'nhip'; }
          else if (dc.doi) { muon = !dc.mo; nguon = 'nut'; }
          dc.doi = false;
          if (muon === dc.mo) return;
          if (!muon && ((rb.x === dc.x && rb.y === dc.y) || vatNamTai(dc.x, dc.y) || thungTai(dc.x, dc.y))) {
            var ek = { ma: 'cua-ket', nhip: nhip, o: { x: dc.x, y: dc.y }, nguon: nguon, voi: rb.x === dc.x && rb.y === dc.y ? 'xe' : 'vat', lenh: lenhNhip };
            sk.push(ek); suKienChan.push(ek);
            return;
          }
          dc.mo = muon;
          sk.push({ ma: 'cua-doi', nhip: nhip, o: { x: dc.x, y: dc.y }, mo: muon, nguon: nguon });
        });
      }

      /** (d) hút, ở cuối nhịp: nam châm bật mà chưa dính gì → vật đầu tiên trong 2 ô trước mặt là sắt thì bị hút về mũi xe và dính. */
      function hutVat() {
        if (!coNamCham || !nc.bat || nc.cam !== null) return;
        var nt = nhinTruoc();
        if (!nt.vat) return;
        if (nt.vat.chat === 'sat') {
          var v = VEC[rb.huong], mx = rb.x + v[0], my = rb.y + v[1];
          sk.push({ ma: 'hut-vat', id: nt.vat.id, tu: { x: nt.o.x, y: nt.o.y }, den: { x: mx, y: my }, soO: nt.khoang - 1 });
          nt.vat.trangThai = 'cam'; nt.vat.x = rb.x; nt.vat.y = rb.y; nc.cam = nt.vat.id;
          sk.push({ ma: 'dinh-vat', id: nt.vat.id });
        } else {
          var eg = { ma: 'hut-go', nhip: nhip, id: nt.vat.id, o: nt.o, khoang: nt.khoang };
          sk.push(eg); suKienChan.push(eg);
        }
      }

      if (hanhDong.kieu === 'banh') {
        var t = hanhDong.trai, p = hanhDong.phai, tr = hanhDong.truot || null;
        if (tr) banhGhi = { trai: 0, phai: 0 };                               // omni trượt: bánh chạy dọc đứng yên, chỉ trượt ngang
        else banhGhi = { trai: t, phai: p };
        apTay();
        apNamCham();
        if (coNem && hanhDong.nem) {                                          // nhịp có load() / throw(): xe đứng yên, lệnh bánh / trượt bị bỏ
          banhGhi = { trai: 0, phai: 0 };
          if (t !== 0 || p !== 0 || tr) {
            var en = { ma: 'nem-dung-yen', nhip: nhip, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : hanhDong.lenhBanh) || null, nem: { ten: hanhDong.nem.ten, dongPy: hanhDong.nem.dongPy } };
            sk.push(en); suKienChan.push(en);
          }
          if (loai === 'xich') xichThoi(sk);
          apNem(hanhDong.nem);
        }
        else if (coBong && hanhDong.bong) {                                        // nhịp có shoot(): xe đứng yên, lệnh bánh / trượt bị bỏ
          banhGhi = { trai: 0, phai: 0 };
          if (t !== 0 || p !== 0 || tr) {
            var eby = { ma: 'ban-dung-yen', nhip: nhip, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : hanhDong.lenhBanh) || null, ban: { ten: 'shoot', dongPy: hanhDong.bong.dongPy } };
            sk.push(eby); suKienChan.push(eby);
          }
          if (loai === 'xich') xichThoi(sk);
          banBong(hanhDong.bong);
        }
        else if (coDay && hanhDong.push) {                                         // nhịp có push(): xe đứng yên, lệnh bánh / trượt bị bỏ
          banhGhi = { trai: 0, phai: 0 };
          if (t !== 0 || p !== 0 || tr) {
            var ey = { ma: 'day-dung-yen', nhip: nhip, lenh: (tr ? { ten: tr.ten, dongPy: tr.dongPy } : hanhDong.lenhBanh) || null, push: { ten: 'push', dongPy: hanhDong.push.dongPy } };
            sk.push(ey); suKienChan.push(ey);
          }
          if (loai === 'xich') xichThoi(sk);
          pushManh(hanhDong.push);
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
      } else {
        if (hanhDong.huong === null || hanhDong.huong === undefined) { apTay(); sk.push({ ma: 'dung-yen' }); }
        else if (hanhDong.buoc === 2) {
          if (coTay && tay.tuThe === 'duoi') {                              // tay hạ sát đất: chân vướng, bước bị bỏ
            var evn = { ma: 'tay-vuong', nhip: nhip, tu: { x: rb.x, y: rb.y }, lenh: hanhDong.lenhDi || null };
            sk.push(evn); suKienChan.push(evn);
          } else thuDi(hanhDong.huong, 1, 'di');
        } else { apTay(); sk.push({ ma: 'chuan-bi' }); }   // nhịp thứ nhất của lệnh go_*: chưa rời ô (tay làm việc ở nhịp này)
      }

      // băng chuyền — sau hành động của nhịp
      var c = oTai(san, rb.x, rb.y);
      if (c !== null && BANG[c] !== undefined && !bangTat[rb.x + ',' + rb.y]) {          // băng tắt (nút đã đổi) thì không đẩy
        demBang++;
        if (demBang >= 2 && loai === 'xich') { sk.push({ ma: 'bang-khong-day' }); demBang = 0; }     // xích bám chắc, băng không đẩy được
        else if (demBang >= (loai === 'omni' ? 1 : 2)) {                    // omni: bánh nhỏ trơn, 1 nhịp trên băng đã bị đẩy
          var hd = BANG[c], vb = VEC[hd], bx = rb.x + vb[0], by = rb.y + vb[1];
          var lyB = lyDoChan(san, loai, bx, by) || (cuaDong(bx, by) ? 'cua' : null) || (thungTai(bx, by) ? 'thung-nang' : null) || (vatNamTai(bx, by) ? 'vat' : null);
          if (lyB) sk.push({ ma: 'bang-chan', den: { x: bx, y: by }, vat: lyB });
          else { rb.x = bx; rb.y = by; sk.push({ ma: 'bang-day', den: { x: bx, y: by } }); }
          demBang = 0;
        }
      } else demBang = 0;
      vatTheoXe();                                                           // vật đang cầm đi theo xe
      if (thungs.length) bangThung();                                        // băng chuyền đẩy thùng nặng
      hutVat();                                                              // nam châm hút vật sắt trước mặt (cuối nhịp)
      capNhatCua();                                                          // cửa đổi ở cuối nhịp (theo nút hay theo chu kỳ)

      if (mucTieu === 'toi-co') {
        if (san.co && rb.x === san.co.x && rb.y === san.co.y) { thang = true; sk.push({ ma: 'toi-co' }); }
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
      } else if (duaVatXong()) { thang = true; sk.push({ ma: 'xong-dua-vat' }); }
      if (!thang && coVo && mucTieu === 'dua-vat') dungSom = 'vat-vo';       // vật vỡ: không thể thắng nữa
      var r = chup(); r.banh = banhGhi;
      if (loai === 'xich') r.quayDo = quayDo ? quayDo.huong : 0;
      if (loai === 'omni') r.truot = truotGhi;
      var mucVet = { loai: 'nhip', nhip: nhip, robot: r, suKien: sk };
      if (coTay) { r.tay = chupTay(); mucVet.vat = chupVat(); }
      if (coNamCham) { r.namCham = chupNamCham(); mucVet.vat = chupVat(); }
      if (coNem) { r.nem = chupNem(); mucVet.vat = chupVat(); }
      if (thungs.length) mucVet.thung = chupThung();
      if (coBong) r.sung = { dan: dan };
      if (cuas.length) mucVet.cua = chupCua();
      if (nuts.length) { mucVet.nut = chupNut(); mucVet.bangTat = chupBangTat(); }
      vet.push(mucVet);
      return thang || !!dungSom;
    }

    /** Lấy các lệnh tay đang chờ thành {tuThe, kep} cho nhịp này, và xóa chúng khỏi hàng chờ. */
    function rutTay() {
      var tt = tayCho['tu-the'], kk = tayCho['kep'];
      tayCho = { 'tu-the': null, 'kep': null };
      return { tuThe: tt ? (tt.ten === 'arm_down' ? 'duoi' : 'tren') : null, kep: kk ? (kk.ten === 'grab' ? 'kep' : 'tha') : null,
        lenhTuThe: tt ? { ten: tt.ten, dongPy: tt.dongPy } : null, lenhKep: kk ? { ten: kk.ten, dongPy: kk.dongPy } : null };
    }

    /** Đọc cảm biến khoảng cách: ô ngay trước / bên phải / bên trái xe có đi vào được không. Không tốn nhịp, không đổi sân. */
    function docCamBien(yc) {
      var h = (rb.huong + CAM_BIEN_HAM[yc.ten]) % 4, v = VEC[h], x = rb.x + v[0], y = rb.y + v[1];
      var ly = lyDoChan(san, loai, x, y);
      if (!ly && cuaDong(x, y)) ly = 'cua';
      if (!ly && thungTai(x, y)) ly = 'thung-nang';
      if (!ly && vatNamTai(x, y)) ly = 'vat';
      return { ma: 'doc-cam-bien', cam: 'khoang-cach', ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: h, o: { x: x, y: y }, trong: !ly, vat: ly || null, nhip: nhip };
    }

    /** Đọc cảm biến màu: màu vật nằm trên sàn dưới gầm xe (nếu có màu), không thì màu sàn; "none" nếu không có màu. Không tốn nhịp, không đổi sân. */
    function docMau(yc) {
      var idMang = tay.cam !== null ? tay.cam : nc.cam !== null ? nc.cam : nem.ro, v = idMang !== null ? vatTheoId(idMang) : null, m, nguon = 'san';
      if (v) { m = v.mau || 'none'; nguon = 'vat'; } else m = mauNen(rb.x, rb.y) || 'none';
      return { ma: 'doc-cam-bien', cam: 'mau', ham: yc.ten, tu: { x: rb.x, y: rb.y }, o: { x: rb.x, y: rb.y }, mau: m, nguon: nguon, idVat: nguon === 'vat' ? v.id : null, nhip: nhip };
    }

    /** Đọc cảm biến từ front_metal(): True nếu vật đầu tiên trong 2 ô trước mặt là sắt. Không tốn nhịp, không đổi sân. */
    function docTu(yc) {
      var nt = nhinTruoc();
      return { ma: 'doc-cam-bien', cam: 'tu', ham: yc.ten, tu: { x: rb.x, y: rb.y }, huong: rb.huong, o: nt.o, khoang: nt.khoang,
        chat: nt.vat ? nt.vat.chat : null, idVat: nt.vat ? nt.vat.id : null, trong: !!(nt.vat && nt.vat.chat === 'sat'), nhip: nhip };
    }

    /** Xử lý một lời gọi hàm gốc nhân nhường ra. Trả về true nếu phải dừng. */
    function xuLy(yc) {
      vet.push({ loai: 'lenh', ten: yc.ten, dongPy: yc.dong, nganPy: yc.ngan });
      if (CAM_BIEN_HAM[yc.ten] !== undefined || CAM_MAU_HAM.indexOf(yc.ten) >= 0 || CAM_TU_HAM.indexOf(yc.ten) >= 0) {     // cảm biến: đọc xong trả về cho chương trình (khoảng cách / từ: True / False; màu: chuỗi), không tốn nhịp
        var laMau = CAM_MAU_HAM.indexOf(yc.ten) >= 0;
        var ed = laMau ? docMau(yc) : CAM_TU_HAM.indexOf(yc.ten) >= 0 ? docTu(yc) : docCamBien(yc);
        vet[vet.length - 1].docCamBien = Object.assign({}, ed);
        soLanDoc++;
        if (docCho.length < DOC_TOI_DA_MOI_NHIP) docCho.push(ed);
        traVe = laMau ? ed.mau : ed.trong;
        docLienTiep++;
        if (docLienTiep > DOC_LIEN_TIEP_TOI_DA) {
          loi = { loai: 'infinite-loop', dong: yc.dong, thongDiep: 'Đọc cảm biến ' + DOC_LIEN_TIEP_TOI_DA + ' lần liên tiếp mà robot chưa chạy nhịp nào — có vòng lặp không có đường ra.' };
          return true;
        }
        return false;
      }
      if (yc.ten === 'wait') {
        if (laBanh) {
          var lenhBanh = null;                                   // lệnh bánh đầu tiên của nhịp (để chỉ ra khi tay vướng sàn)
          lenhTon.forEach(function (x) { if (!lenhBanh && BANH_LENH[x.ten]) lenhBanh = { ten: x.ten, dongPy: x.dongPy }; });
          var h = { kieu: 'banh', trai: lenh.trai, phai: lenh.phai, lenhBanh: lenhBanh, tay: rutTay(), truot: truotCho, push: pushCho, nc: ncCho, nem: nemCho, bong: bongCho };
          lenh.trai = 0; lenh.phai = 0; lenhTon = []; truotCho = null; pushCho = null; ncCho = null; nemCho = null; bongCho = null;
          return motNhip(h);
        }
        var hw = { kieu: 'nhen', huong: null, tay: rutTay() };
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
      if (TAY_NAM_CHAM.indexOf(yc.ten) >= 0) {                   // nam châm: magnet_on() / magnet_off() chỉ ra lệnh, chờ nhịp
        if (ncCho) {
          suKienChan.push({ ma: 'magnet-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: ncCho.ten, dongPy: ncCho.dongPy } });
          return false;
        }
        ncCho = { ten: yc.ten, dongPy: yc.dong, bat: yc.ten === 'magnet_on' };
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
      if (yc.ten === 'shoot') {                                  // súng bóng: shoot() chỉ ra lệnh, chờ nhịp
        if (bongCho) {
          suKienChan.push({ ma: 'ban-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: bongCho.ten, dongPy: bongCho.dongPy } });
          return false;
        }
        bongCho = { ten: yc.ten, dongPy: yc.dong };
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      if (yc.ten === 'push') {                                   // tấm đẩy: push() chỉ ra lệnh, chờ nhịp
        if (pushCho) {
          suKienChan.push({ ma: 'push-goi-lai', nhip: nhip + 1, ten: yc.ten, dongPy: yc.dong, truoc: { ten: pushCho.ten, dongPy: pushCho.dongPy } });
          return false;
        }
        pushCho = { ten: yc.ten, dongPy: yc.dong };
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
        lenh[bl[0]] = bl[1];
        lenhTon.push({ ten: yc.ten, dongPy: yc.dong });
        return false;
      }
      var hh = NHEN_HUONG[yc.ten];
      var tayBuoc = rutTay();                                    // lệnh tay đang chờ làm ở nhịp ĐẦU của bước
      lenhTon = [];
      return motNhip({ kieu: 'nhen', huong: hh, buoc: 1, tay: tayBuoc }) ||
        motNhip({ kieu: 'nhen', huong: hh, buoc: 2, lenhDi: { ten: yc.ten, dongPy: yc.dong } });
    }

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

    // chương trình hết mà còn lệnh chưa wait() → lệnh đó không chạy
    if (!thang && !loi && !dungSom && lenhTon.length) {
      suKienChan.push({ ma: 'quen-wait', nhip: nhip, lenh: lenhTon.slice() });
    }

    return {
      thang: thang, nhip: nhip, robot: chup(), loi: loi, vet: vet,
      suKien: suKienChan, lenhTon: lenhTon, batDau: { x: bd.x, y: bd.y, huong: bd.huong || 0 },
      tay: coTay ? chupTay() : null, namCham: coNamCham ? chupNamCham() : null, nem: coNem ? chupNem() : null, sung: coBong ? { dan: dan } : null, vat: chupVat(), vatBanDau: vatBanDau, dich: dsDich, dungSom: dungSom,
      cua: chupCua(), nut: chupNut(), bangTat: chupBangTat(), cuaBanDau: cuaBanDau, nutBanDau: nutBanDau,
      thung: chupThung(), thungBanDau: thungBanDau,
      soLanDoc: soLanDoc, docConLai: docCho, mauO: san.mau,
      quayDo: loai === 'xich' ? (quayDo ? quayDo.huong : 0) : undefined
    };
  }

  var API = {
    VEC: VEC, TEN_HUONG: TEN_HUONG, HAM_GOC: HAM_GOC, TAY_LENH: TAY_LENH, TAY_NHOM: TAY_NHOM, TAY_DAY: TAY_DAY, BANG: BANG, XICH_QUAY: XICH_QUAY, OMNI_TRUOT: OMNI_TRUOT, CAM_BIEN_HAM: CAM_BIEN_HAM,
    TAY_NAM_CHAM: TAY_NAM_CHAM, TAY_NEM: TAY_NEM, TAY_BONG: TAY_BONG, TAM_NEM_TOI_DA: TAM_NEM_TOI_DA, CAM_TU_HAM: CAM_TU_HAM, CHAT_KY: CHAT_KY, TAM_HUT: TAM_HUT, CAM_MAU_HAM: CAM_MAU_HAM, MAU_KY: MAU_KY, MAU_TEN: MAU_TEN, laHamCamBien: laHamCamBien, lopMauCuaSan: lopMauCuaSan,
    docSan: docSan, lyDoChan: lyDoChan, chay: chay
  };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.SanHoc = API;
})();
