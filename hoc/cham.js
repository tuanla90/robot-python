/* ============================================================================
   cham.js — "Học lập trình": MÁY CHẤM (window.ChamHoc).

   cham(man, baiLam, hamCuaEm) → {
     thang, sao (0–3), soO, soNhip,
     hamDaDung: [tên…],                // hàm (của em + của màn) THỰC SỰ được gọi tới
     chiTietO: { chinh, ham: [{ ten, cot:'hamEm'|'hamMan', o }] },
     chanDoan: [{ ma, muc, loi, … }],  // lời tiếng Việt cho học sinh, KHÔNG nói đáp án
                                       // muc: 'loi' | 'thong-tin' (thông tin, không phải lỗi)
     vet: [ { loai:'lenh', ten, cho:{cot,ten?,dong}, ngan:[{cot,ten?,dong}…] },
            { loai:'nhip', nhip, robot:{x,y,huong,banh:{trai,phai}}, suKien:[…] } ],
     theoSan: [ { thang, soNhip, chanDoan, vet } ],     // mỗi sân một mục
     py, anhXa, batDau
   }
   baiLam = { chinh: [dòng], hamCuaMan: [ { ten, thamSo, than: [dòng] } ] } — hàm CỦA MÀN
     (tạm, bản học sinh đang sửa); xem khung-code.js.
   hamCuaEm = [ { ten, thamSo, than } ] — KHO hàm của em (bền), xem kho-ham.js.
   - Hàm của màn che hàm của em cùng tên (chẩn đoán 'ham-man-che-ham-em', muc 'thong-tin').
   - man.camHamCuaEm: màn cấm hàm của em → kho bị bỏ qua. man.moXuong === false: chưa mở Xưởng.
   - Hàm của em chỉ được ghép vào mã Python nếu bài làm gọi tới nó (kể cả gián tiếp).
   - soO = ô chương trình + thân các hàm THỰC SỰ được gọi khi chạy (dò từ vết, kể cả gọi
     gián tiếp, mỗi hàm tính một lần; nhiều sân lấy HỢP). Hàm không được gọi thì không
     tính; dòng def không tốn ô. Chưa chạy được (lỗi khung, cú pháp…) thì dò tĩnh.
   - sao: 1 nếu thắng; +1 nếu soO ≤ man.sao.o; +1 nếu soNhip ≤ man.sao.nhip.
     Màn lắp ráp (22/10, "nhanh HOẶC rẻ"): man.sao.re = { gia, o }; robot lắp có giá man.giaLap (LapRap.apDung ghi) ≤ re.gia thì là lắp RẺ:
     sao thứ ba có luôn (rẻ thay cho nhanh), ngưỡng ô thành max(sao.o, re.o) (lời giải của robot rẻ thường dài hơn). ketQua.re, ketQua.nguongO cho bảng thắng.
     Thua mà cách lắp nằm trong man.manGoc.lapRap.khongQua (robot này không bao giờ tới đích): chẩn đoán 'lap-khong-qua' đứng đầu, nói lý do.
   - man.san có thể là MỘT sân (mảng chuỗi) hoặc MỘT MẢNG sân (cùng khung); thắng khi
     thắng TẤT CẢ sân. man.batDau cũng có thể là mảng song song với man.san.
   - man.hamGoc: hàm gốc cho phép.

   thuHam(man, baiLam, tenHam, hamCuaEm, tuyChon) — "sân thử" của Xưởng hàm: chạy riêng
   một hàm (của em hoặc của màn) trên một sân thử CỐ ĐỊNH do người chơi sắp (mặc định 5×5 trống,
   xe ở giữa (2, 2) quay lên). Để thử bản đang soạn của một hàm của em, đưa bản đó vào mảng hamCuaEm.
   tuyChon.sanThu = { rong: 5, cao: 5, batDau: { x, y, huong }, vat: [{ x, y }], tuong: [{ x, y }] }
   (không truyền thì dùng SAN_THU_MAC_DINH; chuanSanThu() sửa số liệu bậy: ô ngoài sân, ô trùng,
   tường đè lên xe, vật đè lên tường hay lên xe đều bị bỏ). Vật CHIẾM Ô như ở sân thật (14/10): không nằm dưới xe được; thử pick() thì đặt vật ở ô TRƯỚC MẶT xe.
   Tọa độ là tọa độ THẬT của sân thử: x sang phải,
   y xuống dưới, (0, 0) là góc trên trái; không còn phép dịch tọa độ.
   - Tường chặn như sân thường (san-hoc 'dam-tuong', vat = 'tuong'); ra khỏi sân là 'dam-tuong'
     với vat = 'ngoai-san', lời "ra ngoài sân thử".
   - VẬT (khối hàng): chuẩn hóa rồi trả lại ở `kq.sanThu.vat`, và được đưa xuống SanHoc.chay như một
     lớp riêng cạnh `san`. Màn có tay gắp (man.hamGoc có arm_down / arm_up / grab / release) thì vật
     là vật thật: học sinh thử pick() / drop() trong Xưởng được; vết có `vat` và `robot.tay` từng nhịp,
     `kq.vat` là trạng thái cuối. Vật nằm đất chiếm ô: xe đâm vào vật thì đứng im ('dam-tuong', vat 'vat').
     Sân thử chưa có ô đích nên không có điều kiện thắng.
   tuyChon.sanThu.mau = [{ x, y, mau: 'red'|'green'|'blue'|'yellow' (hay 'r' 'g' 'b' 'y') }] (tuỳ chọn): ô sàn màu cho color() trong Xưởng (bỏ ô tường, ô ngoài sân, ô trùng);
   vật trong sân thử cũng có thể mang `mau`. Chuẩn hóa trả lại ở `kq.sanThu.mau`.
   tuyChon.sanThu.thung = [{ x, y }] (tuỳ chọn): thùng nặng trong sân thử, chuẩn hóa như vật (ô ngoài sân, ô trùng, ô tường, ô xe bị bỏ);
   chỉ có nghĩa với màn có súng hơi (hamGoc có shoot / shoot_back) hay băng chuyền đẩy thùng. Kết quả có thêm `thung` (trạng thái cuối).
   Trả về { vet, robot: {x,y,huong}, batDau, sanThu, soNhip, chanDoan, py, anhXa, tay, vat, thung }.
   Chỉ chặn bởi lỗi khung thuộc về chính hàm này (tràn ô của nó) hoặc lỗi chung
   (trùng tên); lỗi của chương trình chính hay của hàm khác không cản.

   TAY GẮP / MỤC TIÊU dua-vat (man.mucTieu === 'dua-vat'; luật đầy đủ ở san-hoc.js):
   - thắng khi MỌI vật nằm trên ô đích; ô đích và vật nằm trong sân (ký hiệu D, o, X).
   - kết quả có thêm `vatBanDau` [{id,x,y,trangThai}], `dich` [{x,y}] (của sân đang xem) và, ở mỗi mục
     theoSan, `tay` / `vat` cuối cùng; vết nhịp có `robot.tay` và `vat` (xem san-hoc.js).
   - vật vỡ thì chương trình dừng ngay cuối nhịp đó.

   CẢM BIẾN KHOẢNG CÁCH (chương khoang-cach; luật đầy đủ ở san-hoc.js): hamGoc có front_clear / left_clear / right_clear thì robot có cảm biến
   (man.robot.camBien = [{ ma:'khoang-cach', o:'hong' }]). Mỗi lần đọc là một mục lệnh trong vết có `docCamBien` { ma:'doc-cam-bien', ham, tu, huong, o,
   trong, vat, nhip } (cũng nằm trong suKien của nhịp kế tiếp), để giao diện nháy cảm biến. Mã chẩn đoán mới:
   - vong-vo-han (lỗi): vòng while chạy mãi — hoặc nhân bắt vòng không có nhịp (loaiCore 'infinite-loop'), hoặc robot chạy quá nhipToiDa mà chương
     trình có `while` (loaiCore 'qua-nhieu-nhip'); `cho` trỏ tới dòng while. Chương trình KHÔNG có while mà quá nhịp thì vẫn là qua-nhieu-nhip.
   - chua-gan-cam-bien (lỗi): gọi front_clear / left_clear / right_clear mà màn không cho (robot chưa gắn cảm biến, hay màn này chưa mở hàm đó).
   NHIỀU SÂN: mặc định soNhip = số nhịp của sân DÀI NHẤT. man.nhipTheo === 'tong' thì soNhip = TỔNG nhịp mọi sân (dùng cho sao.nhip), để chương trình
   viết cứng số bước (bước thừa chỉ húc tường ở sân ngắn) mất sao nhịp. Kết quả luôn có thêm nhipMax, nhipTong.

   CẢM BIẾN MÀU (chương mau; luật đầy đủ ở san-hoc.js, phần CẢM BIẾN MÀU): hamGoc có color thì robot đọc được màu; PHẦN CỨNG quyết định đọc ô nào (man.robot.camBien, đưa xuống SanHoc.chay):
   [{ ma:'mau', o:'hong' }] = cảm biến màu ở bụng, color() = màu SÀN ô dưới xe (luôn, kể cả khi đang mang vật); [{ ma:'camera', o:... }] = camera, color() = màu thứ ở Ô TRƯỚC MẶT (vật nằm đó → màu vật,
   không thì màu sàn; tường / rào / thùng / cửa đóng / mép sân → "none"). Không gắn cả hai; drone không gắn camera (SanHoc.chay ném lỗi cấu hình). Có thể kèm khoang-cach ở màn phối hợp.
   color() trả chuỗi "red" | "green" | "blue" | "yellow" | "none". Màn khai lớp màu bằng man.mau (mảng chuỗi cùng cỡ sân, ký tự r g b y) và man.vatMau (màu từng vật); màn nhiều sân thì hai trường này là mảng song song
   với man.san (như batDau). Ô đích có màu chỉ nhận vật cùng màu. Mỗi lần đọc là một mục lệnh trong vết có `docCamBien` { cam:'mau'|'camera', ham:'color', tu, o (ô được đọc), mau, nguon:'san'|'vat'|'chan', idVat, nhip } (camera có thêm huong).
   Kết quả có `mauO` (lớp màu sàn của sân đang xem, null nếu không màu), mỗi mục theoSan cũng vậy; vật / đích có `mau` khi có màu. Mã chẩn đoán mới:
   - chua-gan-cam-bien (lỗi): gọi color() khi màn không cho (như cảm biến khoảng cách; lời nói rõ "cảm biến màu ở bụng hay camera").
   - ten-mau-sai (lỗi): một chuỗi trong phép so sánh gần giống tên màu nhưng không đúng (chữ hoa chữ thường, gõ nhầm một chữ): color() chỉ trả chữ thường
     "red", "green", "blue", "yellow", "none". Chỉ báo khi chưa thắng.
   - mau-thieu-nhay (lỗi): viết red / green / blue / yellow / none không có dấu nháy (Python tưởng là tên biến).
   - dat-sai-mau (lỗi): thả vật xuống ô đích khác màu (vật vẫn nằm đó, nhặt lên lại được).
   NAM CHÂM (chương nam-cham và che-nam-cham; luật đầy đủ ở san-hoc.js, phần NAM CHÂM): hamGoc có magnet_n / magnet_s / magnet_off thì robot có tay nam châm CÓ CỰC (man.robot.tay = 'nam-cham');
   có front_metal / front_pole thì cảm biến khoảng cách ở hông còn đo được chất vật (cảm biến từ: front_metal() True nếu vật đầu tiên là sắt trong 2 ô, front_pole() là "N" / "S" / "none" cực của vật nam châm trong 3 ô).
   Màn khai chất vật bằng man.vatChat (mảng chuỗi cùng cỡ sân, s = sắt, g hay '.' = gỗ, N / S = vật nam châm có chữ cực quay về phía xe; đặt đúng ô có vật; màn nhiều sân thì mảng song song với man.san) và
   man.vatCan = 'sat' | 'nam-cham' | 'tu' nếu chỉ vật sắt / vật nam châm / vật có từ phải về đích (vật gỗ ở đâu cũng được). Vật nam châm mang màu theo cực (N đỏ, S xanh dương): ô đích đỏ / xanh dương phân loại theo cực.
   Kết quả có thêm `namCham` { bat, cuc, cam } (trạng thái cuối, null nếu robot không có tay nam châm); vết nhịp có robot.namCham; vật có `chat` (và `cuc`). Sân thử của Xưởng: vật có thể mang chat: 'sat' hay chat: 'nam-cham' + cuc.
   man.vatThem = [{ x, y, chat?, cuc?, mau? }] (màn nhiều sân: mảng song song với man.san) đặt thêm vật ở ô không viết được bằng ký hiệu o, vd ô băng chuyền hay bậc thang (cfg.vat của SanHoc).
   man.daoChieu có 'cuc' (chương che-nam-cham): dây cực đấu ngược, magnet_n() bật cực S thật và magnet_s() bật cực N thật; man.phanCung thiếu magnet_n hay magnet_s = một cực hỏng (lenh-goc-hong).
   Mã chẩn đoán: tha-bi-chan (lỗi: magnet_off() không thả được vì ô trước mũi xe bị chặn), magnet-goi-lai (lỗi: hai lệnh nam châm cùng nhịp), hut-go (thông tin: nam châm bật mà vật đầu tiên trước mặt là gỗ),
   ngoai-tam (thông tin: vật sắt cách 3 ô, ngoài tầm), day-bi-chan (thông tin: vật nam châm bị đẩy mà sát vật cản), sat-khong-day (thông tin: đổi cực khi đang dính sắt), cung-cuc (thông tin, drone);
   chua-gan-cam-bien nói thêm "cảm biến từ" cho front_metal / front_pole; chua-dua-vat nói "vật sắt" / "vật nam châm" / "vật có từ" theo man.vatCan; quen-wait tính lệnh nam châm là lệnh tay.
   Bóng mờ + tay nam châm: bongMo.cam = xe mờ đang DÍNH vật (lech-bong-mo nói "dính").
   DRONE (chương drone; luật đầy đủ ở san-hoc.js, phần DRONE): man.loaiRobot = 'drone', hamGoc go_up / go_down / go_left / go_right / wait (cùng tên lệnh với nhện, mỗi lệnh 1 nhịp),
   thêm magnet_n / magnet_s / magnet_off (nam châm TREO dưới bụng: hút / thả ở ô DƯỚI drone; cực nào cũng hút sắt), color, battery. man.pin = số nguyên (pin đầy lúc đầu; màn nhiều sân thì có thể là mảng song song với man.san;
   không khai = pin vô hạn, không có battery()). Ký hiệu sân P là ô sạc. Kết quả có thêm `pin` (còn lại cuối), `pinToiDa`, `sac` (ô sạc), ở mỗi mục theoSan cũng vậy; vết nhịp có robot.pin,
   robot.dangMang (id vật đang dính hoặc null) và sự kiện 'sac-pin', 'het-pin', 'bay-qua' { o, tren: ['bang'|'rao'|'bac-thang'|'thung-nang'|'vat'] }. Mã chẩn đoán mới:
   - het-pin (lỗi): pin về 0 giữa chừng, drone hạ cánh khẩn, dừng; `cho` trỏ lệnh bay ở nhịp cuối cùng (null nếu là wait()).
   (sac-pin chỉ là sự kiện của vết nhịp, không phải chẩn đoán: lời giải đúng không được có chẩn đoán nào.)
   - drone-khong-bay (lỗi): chạy xong mà chưa có lệnh go_* nào chạy (thường do hàm đi nhận chữ không khớp nhánh nào).
   CAMERA NHÌN XUỐNG của drone (16/10, chương flycam; luật đầy đủ ở san-hoc.js, phần DRONE): robot.camBien có { ma:'camera-bay', o:'bung' } và hamGoc có `look` thì look() trả chuỗi màu "red" | "green" | "blue" | "yellow" | "none"
   của VẬT (nếu có vật nằm đất) hay SÀN ở ô NGAY DƯỚI drone; không tốn nhịp. Mục lệnh trong vết có `docCamBien` { cam:'camera-bay', ham:'look', tu, o (= ô drone), mau, nguon:'san'|'vat'|'chan', idVat, nhip }.
   chua-gan-cam-bien nói rõ "drone này chưa gắn camera nhìn xuống dưới bụng" khi gọi look() mà màn không cho; màn khai phanCung thiếu look (camera hỏng) → lenh-goc-hong;
   ten-mau-sai và mau-thieu-nhay áp dụng cho cả look().
   dam-tuong, tha-bi-chan, hut-go, quen-wait, chua-toi-co đổi lời cho drone (tường cao / mép sân / cửa đóng mới chặn; thả và hút ở ô dưới bụng). chua-gan-cam-bien biết battery.
   Sân thử Xưởng nhận thêm sanThu.pin (số nguyên 1–999; không có thì lấy man.pin) và sanThu.sac = [{ x, y }] (ô sạc).
   BÓNG MỜ / CHẾ LỆNH (chương che-xe, kế hoạch "Chế lệnh" 14/10; luật đầy đủ ở san-hoc.js, phần BÓNG MỜ, ĐẤU DÂY NGƯỢC, KHAY VÀ PHẦN CỨNG):
   - man.mucTieu = 'bong-mo' + man.bongMo = { x, y, huong, diQua?: [{x,y}], vat?: [{x,y}] } (màn nhiều sân: mảng song song với man.san): thắng khi chương trình chạy XONG mà xe đúng tư thế
     của "xe mờ", đã đi qua mọi ô diQua (◆) và vật đúng ô. Kết quả có thêm `bongMo` và `diQua` [{x,y,da}] (của sân đang xem; mỗi mục theoSan cũng vậy); sự kiện vết 'qua-diem' { nhip, o }.
     Mã chẩn đoán: lech-bong-mo (lỗi; nói bằng lời xe lệch bóng mờ ở đâu, hay đúng ô mà sai hướng; chương che-tay còn nói vật nào chưa nằm đúng ô / đúng màu và xe cầm thiếu hay thừa vật:
     kèm soVatLech, camLech), chua-qua-diem (lỗi; chưa ghé hết các điểm ◆).
   - bongMo.vat = [{ x, y, mau? }] (mau: vật nằm ô đó phải cùng màu) và bongMo.cam = true | { mau } (xong chương trình tay phải đang cầm vật): xem san-hoc.js, phần BÓNG MỜ.
   - man.chinhCoDinh === true: máy chấm LUÔN dùng man.maMau.chinh làm chương trình chính (bỏ qua chương trình chính gửi lên); người chơi chỉ sửa hàm.
     man.khoaHamMan = [tên hàm của màn]: các hàm của màn này cũng khóa (máy chấm lấy bản trong man.maMau.hamCuaMan, giao diện chỉ cho xem).
   - man.daoChieu = ['trai'] | ['phai'] (đấu dây ngược; chương che-tay thêm 'tay' = arm_up ↔ arm_down đổi chỗ, 'kep' = grab ↔ release đổi chỗ) đưa xuống lõi; man.canhBao (chuỗi ngắn) là nhãn ⚠ của giao diện, cũng được trích vào lời lenh-goc-hong.
     man.daoChieu có 'cam' (chương che-cam-bien): cảm biến khoảng cách lắp ngược, front_clear() / left_clear() / right_clear() trả NGƯỢC. Mã chẩn đoán cam-bien-nguoc (mức thông tin, một lần):
     kể lại lần hỏi cảm biến đầu tiên ("ô trước mặt đang trống mà front_clear() lại trả về False"), chỉ khi chưa thắng hay trong sân thử của Xưởng.
   - man.bienDem (chương che-cam-bien): màn cho dùng BIẾN ĐẾM (n = 0, n = n + 1, for i in range(n)): khay hiện nhóm ĐẾM. Màn khai khung.chanBien = true (chưa dạy biến) thì
     khung-code.js báo cau-truc-chua-hoc (cauTruc 'bien') cho dòng gán biến trong chương trình / hàm của màn.
   - man.phanCung (mặc định: trọn bộ lệnh loại robot + khay) đưa xuống lõi: hàm của em gọi được mọi lệnh phần cứng, chương trình chính và hàm của màn chỉ dùng lệnh trên khay (man.hamGoc).
     Mã chẩn đoán: lenh-chua-mo (lỗi; lệnh có trong phần cứng nhưng chưa có trên khay mà chương trình chính / hàm của màn gõ thẳng), lenh-goc-hong (lỗi; gọi lệnh không thuộc phần cứng vì màn hỏng).
   CHẨN ĐOÁN CÓ `cho` (dòng lệnh gây ra, { cot, dong, ten? } hoặc null): mọi mã gắn với một lệnh đều ghi `cho` — dam-tuong (lệnh bánh / trượt / go_* của nhịp), kep-hut và tha-bi-chan kieu 'kep' và vat-vo (lệnh grab / release),
   tha-bi-chan của nam châm, các mã của tay (tay-goi-lai…), máy ném, súng hơi (ban-*, giat-chan, het-dan, cua-ket). Giao diện không cần tự tra từ vết.
   SÚNG HƠI (chương sung-hoi và che-sung-hoi; luật đầy đủ ở san-hoc.js, phần THÙNG NẶNG + SÚNG HƠI): hamGoc có shoot / shoot_back thì robot có tay súng hơi (man.robot.tay = 'hoi'). shoot() bắn ra trước + xe giật lùi
   một ô, shoot_back() bắn ra sau + xe giật tới một ô; ô giật vào có thùng nặng thì thùng trượt ra xa, ô bị chặn thì xe đứng yên. Ký hiệu sân N nút bắn, C cửa đóng, c cửa mở;
   man.cuaNhip = [{ x, y, mo, dong, pha }] (cửa tự đóng mở theo chu kỳ), man.noi = [{ nut, cua, bang }] (nút nào điều khiển cửa / băng nào; mặc định mọi nút điều khiển mọi cửa thường và mọi băng),
   man.danToiDa (số viên; không khai = vô hạn); màn nhiều sân thì cuaNhip và noi là mảng song song với man.san. man.daoChieu có 'sung': súng lắp ngược (shoot() bắn ra sau, shoot_back() bắn ra trước);
   man.phanCung thiếu shoot_back (nòng sau hỏng) hay shoot (nòng trước hỏng) = lenh-goc-hong. Kết quả có thêm `cua` [{x,y,mo}], `nut` [{x,y,bat}], `bangTat` [{x,y}],
   `cuaBanDau`, `nutBanDau`, `sung` { dan } (trạng thái cuối, như vet nhịp có cua / nut / bangTat / robot.sung). Mã chẩn đoán mới: ban-goi-lai (lỗi: hai lệnh bắn cùng nhịp), het-dan (lỗi),
   ban-hut (thông tin: bóng bay ra khỏi sân không trúng gì), ban-bi-chan (thông tin: bóng bị tường / cửa đóng / thùng / vật chặn trước khi tới nút), ban-dung-yen (thông tin: lệnh bánh cùng nhịp với lệnh bắn bị bỏ),
   giat-chan (thông tin: xe không giật được vì ô giật vào bị chặn), ban-nut-lai (thông tin: cùng một nút bị bắn nhiều lần), cua-ket (thông tin: cửa không đóng được vì xe đang đứng ở ô cửa);
   dam-tuong với vat 'cua' (cửa đang đóng) hay 'nut'.
   Sân thử Xưởng nhận thêm sanThu.nut = [{ x, y }] (nút bắn) và sanThu.cua = [{ x, y, mo }] (cửa; mo true là cửa mở lúc đầu).
   THÙNG NẶNG / MỤC TIÊU day-thung (man.mucTieu === 'day-thung'; luật đầy đủ ở san-hoc.js):
   - thắng khi MỌI thùng nặng (ký hiệu H, h) nằm trên ô đích (D, X, h). Kết quả có thêm `thung`, `thungBanDau` [{id,x,y}] (cuối / đầu), ở
     mỗi mục theoSan cũng vậy; vết nhịp có `thung` (vị trí thùng cuối nhịp) và sự kiện 'thung-di' {id, tu, den, nguon:'giat'|'bang'}.
   - thùng kẹt góc → dừng ngay cuối nhịp đó (chẩn đoán thung-ket).
   Mã chẩn đoán: thung-chan (kieu 'giat': thùng bị cú giật mà ô sau nó bị chặn), thung-ket (lỗi), chua-day-thung, và dam-tuong với
   vat 'thung-nang' (xe húc thùng bằng bánh: thùng cản như tường, chỉ cú giật của súng hơi mới dời được thùng). Các mã khác:
   quen-wait, banh-goi-lai, tay-goi-lai, dam-tuong (vat 'vat' = vướng vật nằm đất), tay-vuong, vat-vo, tha-bi-chan (tay kẹp, kieu 'kep': ô trước mặt không phải sàn trống),
   kep-hut (thông tin), xich-quay-do (thông tin: xe xích quay dở bị mất), omni-khong-cheo (thông tin: xe omni không đi chéo, lệnh bánh cùng nhịp với slide bị bỏ), slide-goi-lai (hai lệnh slide cùng nhịp), chua-toi-co, chua-dua-vat, nhen-khong-buoc (nhện chạy xong chưa bước lần nào), tran-khung,
   def-trong-chuong-trinh, ham-trung-ten, ham-chua-co, chua-tao-ham (màn có taoHam: chưa gọi hàm phải tạo, robot tới đích cũng chưa thắng; màn khai batBuocTaoHam: false thì bỏ), loi-cu-phap, loi-thut-le, qua-gioi-han-ham (lỗi khung; man.gioiHanHam = n: chương trình chính gọi trực tiếp tối đa n hàm của em khác nhau, không khai thì không kiểm),
   loi-chay, qua-nhieu-nhip, ham-man-che-ham-em (thông tin).
   CHÂN NHỆN (chương nhen, che-nhen; luật ở san-hoc.js, phần CHÂN NHỆN): roi-ho (lỗi: nhện rơi hố, chương trình dừng), nhay-hut (lỗi: ô giữa hay ô đáp của cú nhảy không hợp lệ, nhện rơi lại ô cũ),
   dau-dung-tran (lỗi: stand() khi đang đứng trong ô gầm), chan-goi-lai (lỗi: hai lệnh chân cùng nhịp); dam-tuong với vat 'gam-thap' (đi vào gầm mà chân đang duỗi); lech-bong-mo nói cả chân co / duỗi lệch bóng mờ
   (bongMo.chan); quen-wait nói "lệnh chân" khi crouch() / stand() chưa kịp trôi nhịp.
   MÁY SƠN / MỤC TIÊU to-hinh (chương may-son, che-may-son; luật ở san-hoc.js, phần MÁY SƠN): man.hinh = hình mờ (màn nhiều sân: mảng song song với man.san), man.mucBanDau = màu sơn lúc đầu.
   man.sonBanDau = lớp ô sơn sẵn (cảm biến màu đọc được sơn). Kết quả (và mỗi mục theoSan) có thêm `son` { ha, mau }, `daSon` [{x,y,mau}], `hinh`, `sonBanDau`. Mã chẩn đoán: mau-son-sai (lỗi chạy: ink() nhận màu lạ), son-goi-lai (lỗi: hai lệnh đầu sơn cùng nhịp),
   to-thua (lỗi: tô ra ngoài hình, chương trình dừng), chua-to-hinh (lỗi: chạy xong mà hình còn ô chưa tô hay tô sai màu; kèm thieu, saiMau), quen-wait nói "lệnh sơn".
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var SanHoc = laNode ? require('./san-hoc.js') : window.SanHoc;
  var KhungCode = laNode ? require('./khung-code.js') : window.KhungCode;

  /** Màn lắp ráp: lý do nếu cách lắp đang gắn (man.cachLapDaChon) nằm trong lapRap.khongQua của màn gốc: [{ than, tay?, camBien?, lyDo }],
   *  khe không khai thì khe nào cũng khớp, khai null = không gắn gì. Không có thì null. */
  function lyDoKhongQua(man) {
    var goc = man && man.manGoc, c = man && man.cachLapDaChon, ds = goc && goc.lapRap && goc.lapRap.khongQua;
    if (!ds || !c) return null;
    for (var i = 0; i < ds.length; i++) {
      var k = ds[i];
      if (['than', 'tay', 'camBien'].every(function (kh) { return !(kh in k) || (k[kh] || null) === (c[kh] || null); })) return k.lyDo;
    }
    return null;
  }

  var LOAI_VAT = { 'dong-doi': 'robot đồng đội (đang đứng ở ô đó, hoặc cũng định đi vào ô đó cùng nhịp)', 'rao': 'hàng rào thấp (xe không đi qua được, chỉ vật ném mới bay qua)', 'tuong': 'tường', 'ngoai-san': 'ngoài sân', 'bac-thang': 'bậc thang (xe bánh không leo được)', 'thung-nang': 'thùng nặng', 'vat': 'vật nằm đất (vật chiếm ô, xe không đi vào được)', 'cua': 'cửa đang đóng', 'nut': 'nút bắn (gắn trên tường: xe không đi vào được, chỉ quả bóng bắn trúng mới đổi nút)', 'gam-thap': 'gầm thấp (nhện phải co chân mới chui vào được)' };
  // nhện nhảy hụt (san-hoc.js 'nhay-hut'): ô giữa hay ô đáp là gì
  var LY_NHAY = { 'dong-doi': 'robot đồng đội (đang đứng ở ô đó, hoặc cũng định đi vào ô đó cùng nhịp)', 'tuong': 'tường', 'ngoai-san': 'ngoài sân', 'rao': 'hàng rào thấp (nhảy qua được nhưng không đáp lên được)', 'cua': 'cửa đang đóng', 'gam-thap': 'gầm thấp (trần thấp, nhện đứng thẳng không lọt)', 'thung-nang': 'thùng nặng', 'vat': 'vật nằm đất (vật chiếm ô, không đáp lên được)', 'nut': 'nút bắn' };
  // lý do một thùng nặng không đẩy được (san-hoc.js 'thung-chan')
  // lý do magnet_off() không thả được vật (san-hoc.js 'tha-bi-chan')
  var LY_THA = { 'dong-doi': 'chỗ robot đồng đội đang đứng', 'tuong': 'tường', 'ngoai-san': 'mép sân', 'bac-thang': 'bậc thang', 'thung-nang': 'thùng nặng', 'vat': 'ô đã có một vật nằm sẵn', 'rao': 'hàng rào thấp', 'cua': 'cửa đang đóng' };
  // lý do vật ném vỡ (san-hoc.js 'nem-vo')
  var LY_BAN = { 'dong-doi': 'chỗ robot đồng đội đang đứng', 'tuong': 'tường cao', 'cua': 'cửa đang đóng', 'thung': 'thùng nặng', 'vat': 'vật nằm đất', 'bac-thang': 'bậc thang' };
  // lý do xe không giật được (san-hoc.js 'giat-chan'): ô xe giật vào
  var LY_GIAT = { 'dong-doi': 'robot đồng đội (đang đứng ở ô đó, hoặc cũng định đi vào ô đó cùng nhịp)', 'tuong': 'tường', 'ngoai-san': 'mép sân', 'cua': 'cửa đang đóng', 'nut': 'nút bắn', 'rao': 'hàng rào thấp', 'bac-thang': 'bậc thang', 'vat': 'một vật nằm đất' };
  var LY_NEM = { 'dong-doi': 'chỗ robot đồng đội đang đứng', 'ngoai-san': 'ngoài sân', 'tuong': 'tường cao', 'rao': 'hàng rào thấp', 'bac-thang': 'bậc thang', 'thung-nang': 'thùng nặng', 'vat': 'ô đã có một vật nằm sẵn' };
  var LY_DO_THUNG = { 'dong-doi': 'robot đồng đội (đang đứng ở ô đó, hoặc cũng định đi vào ô đó cùng nhịp)', 'tuong': 'tường', 'ngoai-san': 'mép sân', 'bac-thang': 'bậc thang', 'thung-nang': 'một thùng nặng khác', 'xe': 'chính chiếc xe', 'cua': 'cửa đang đóng', 'rao': 'hàng rào thấp', 'vat': 'một vật nằm đất' };
  // Sân thử mặc định của Xưởng hàm: 5×5 trống, xe ở giữa quay lên (hướng 0).
  var SAN_THU_MAC_DINH = { rong: 5, cao: 5, batDau: { x: 2, y: 2, huong: 0 }, vat: [], tuong: [], thung: [] };
  var MAU_CHU = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };       // tên màu → ký tự trong lớp màu của SanHoc
  function chuanMau(m) {                                                // 'red' | 'r' … → tên màu, hoặc null
    if (typeof m !== 'string') return null;
    if (MAU_CHU[m]) return m;
    for (var k in MAU_CHU) if (MAU_CHU[k] === m) return k;
    return null;
  }
  var CO_TOI_DA = 12;

  /** Chuẩn hóa cấu hình sân thử (xem đầu tệp). Luôn trả về bản mới, hợp lệ. */
  function chuanSanThu(c) {
    c = c || {};
    function so(v, mac, lo, hi) { v = Math.floor(Number(v)); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : mac; }
    var rong = so(c.rong, 5, 1, CO_TOI_DA), cao = so(c.cao, 5, 1, CO_TOI_DA);
    var b = c.batDau || {};
    var bd = { x: so(b.x, Math.floor((rong - 1) / 2), 0, rong - 1), y: so(b.y, Math.floor((cao - 1) / 2), 0, cao - 1), huong: ((so(b.huong, 0, 0, 1e6) % 4) + 4) % 4 };
    var thay = {};
    thay[bd.x + ',' + bd.y] = true;                              // ô có xe: không đặt tường (vật thì được)
    function loc(ds) {
      var kq = [];
      (Array.isArray(ds) ? ds : []).forEach(function (o) {
        if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') return;
        var x = Math.floor(o.x), y = Math.floor(o.y), k = x + ',' + y;
        if (x < 0 || y < 0 || x >= rong || y >= cao || thay[k]) return;
        thay[k] = true; kq.push({ x: x, y: y });
      });
      return kq;
    }
    var tuong = loc(c.tuong);
    var nutBan = loc(c.nut);                                     // nút bắn (chương sung-bong): chiếm ô như tường
    var cuaBan = loc(c.cua).map(function (o) { return { x: o.x, y: o.y }; });
    (Array.isArray(c.cua) ? c.cua : []).forEach(function (src) {
      if (src && src.mo === true) cuaBan.forEach(function (o) { if (o.x === Math.floor(src.x) && o.y === Math.floor(src.y)) o.mo = true; });
    });
    var thung = loc(c.thung);                                    // thùng nặng: không đè tường, không đè xe
    var kyO = [];                                                // ký hiệu sân (Xưởng: Đặt vật bậc thang S / gầm n, Đặt sàn hố u / băng chuyền < > ^ v): mỗi ô một ký hiệu, không đè xe / tường / nút / cửa / thùng
    (Array.isArray(c.ky) ? c.ky : []).forEach(function (o) {
      if (!o || typeof o.x !== 'number' || typeof o.y !== 'number' || typeof o.ky !== 'string' || o.ky.length !== 1 || 'Snu<>^v'.indexOf(o.ky) < 0) return;
      var x = Math.floor(o.x), y = Math.floor(o.y), k = x + ',' + y;
      if (x < 0 || y < 0 || x >= rong || y >= cao || thay[k]) return;
      thay[k] = true; kyO.push({ x: x, y: y, ky: o.ky });
    });
    var sacO = [];                                               // ô sạc pin (drone): sàn thường, đè được lên ô xe; không đè tường, hàng rào, nút, cửa
    var khoaSac = {};
    tuong.concat(kyO).forEach(function (o) { khoaSac[o.x + ',' + o.y] = true; });
    (Array.isArray(c.rao) ? c.rao : []).forEach(function (o) { if (o && typeof o.x === 'number' && typeof o.y === 'number') khoaSac[Math.floor(o.x) + ',' + Math.floor(o.y)] = true; });
    nutBan.concat(cuaBan).forEach(function (o) { khoaSac[o.x + ',' + o.y] = true; });
    (Array.isArray(c.sac) ? c.sac : []).forEach(function (o) {
      if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') return;
      var x = Math.floor(o.x), y = Math.floor(o.y), k = x + ',' + y;
      if (x < 0 || y < 0 || x >= rong || y >= cao || khoaSac[k]) return;
      khoaSac[k] = true; sacO.push({ x: x, y: y });
    });
    var vat = loc(c.vat);                                        // tường được ưu tiên hơn vật
    // màu: vật có thể mang màu (mau: 'red' | 'r' …); ô sàn màu { x, y, mau } (không đè tường; mỗi ô một màu, ô sau không đè ô trước)
    var tuongKhoa = {};
    tuong.forEach(function (o) { tuongKhoa[o.x + ',' + o.y] = true; });
    (Array.isArray(c.vat) ? c.vat : []).forEach(function (src) {
      if (!src || typeof src.x !== 'number' || typeof src.y !== 'number') return;
      var mv = chuanMau(src.mau);
      if (!mv) return;
      vat.forEach(function (v) { if (v.x === Math.floor(src.x) && v.y === Math.floor(src.y) && !v.mau) v.mau = mv; });
    });
    var mauSan = [], daMau = {};
    (Array.isArray(c.mau) ? c.mau : []).forEach(function (o) {
      if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') return;
      var x = Math.floor(o.x), y = Math.floor(o.y), k = x + ',' + y, mo = chuanMau(o.mau);
      if (!mo || x < 0 || y < 0 || x >= rong || y >= cao || tuongKhoa[k] || daMau[k]) return;
      daMau[k] = true; mauSan.push({ x: x, y: y, mau: mo });
    });
    (Array.isArray(c.vat) ? c.vat : []).forEach(function (src) {            // chất vật (chương nam-cham): chat 'sat' | 'go' | 'nam-cham' (kèm cuc 'N' | 'S'); mặc định gỗ, chỉ ghi lại khi là sắt hay vật nam châm
      if (!src || typeof src.x !== 'number' || typeof src.y !== 'number') return;
      var laNC = src.chat === 'nam-cham' && (src.cuc === 'N' || src.cuc === 'S');
      if (src.chat !== 'sat' && !laNC) return;
      vat.forEach(function (v) { if (v.x === Math.floor(src.x) && v.y === Math.floor(src.y)) { v.chat = src.chat; if (laNC) v.cuc = src.cuc; } });
    });
    var kq = { rong: rong, cao: cao, batDau: bd, vat: vat, tuong: tuong, thung: thung };
    var rao = loc(c.rao);                                        // hàng rào thấp (máy ném): không đè tường, thùng, xe; vật có thể nằm dưới
    if (rao.length) kq.rao = rao.filter(function (o) { return !(o.x === bd.x && o.y === bd.y); });
    if (c.ro === true) kq.ro = true;                             // rổ máy ném có sẵn một vật
    if (sacO.length) kq.sac = sacO;                              // ô sạc của drone (chỉ có khi sân thử có)
    if (typeof c.pin === 'number' && isFinite(c.pin) && Math.floor(c.pin) === c.pin && c.pin >= 1 && c.pin <= SanHoc.PIN_TOI_DA) kq.pin = c.pin;     // pin của drone trong sân thử (không có thì lấy man.pin)
    if (nutBan.length) kq.nut = nutBan;                          // nút bắn, cửa của sân thử (chỉ có khi sân thử có)
    if (cuaBan.length) kq.cua = cuaBan.map(function (o) { return { x: o.x, y: o.y, mo: o.mo === true }; });
    if (mauSan.length) kq.mau = mauSan;                          // chỉ có khi sân thử có ô màu (các sân thử cũ giữ nguyên dạng)
    if (kyO.length) kq.ky = kyO;                                 // ký hiệu sân (chỉ có khi sân thử có)
    return kq;
  }
  /** Lớp màu sàn của sân thử (mảng chuỗi r g b y / '.'), hoặc null nếu sân thử không có ô màu. */
  function lopMauSanThu(st) {
    if (!st.mau || !st.mau.length) return null;
    var rows = [];
    for (var y = 0; y < st.cao; y++) { var d = ''; for (var x = 0; x < st.rong; x++) d += '.'; rows.push(d); }
    st.mau.forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + MAU_CHU[o.mau] + rows[o.y].slice(o.x + 1); });
    return rows;
  }
  /** Sân thử dạng mảng chuỗi cho SanHoc ('.' sàn, '#' tường). */
  function hangSanThu(st) {
    var rows = [];
    for (var y = 0; y < st.cao; y++) {
      var d = '';
      for (var x = 0; x < st.rong; x++) d += '.';
      rows.push(d);
    }
    st.tuong.forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + '#' + rows[o.y].slice(o.x + 1); });
    (st.rao || []).forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + '=' + rows[o.y].slice(o.x + 1); });
    (st.nut || []).forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + 'N' + rows[o.y].slice(o.x + 1); });
    (st.cua || []).forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + (o.mo ? 'c' : 'C') + rows[o.y].slice(o.x + 1); });
    (st.sac || []).forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + 'P' + rows[o.y].slice(o.x + 1); });
    (st.ky || []).forEach(function (o) { rows[o.y] = rows[o.y].slice(0, o.x) + o.ky + rows[o.y].slice(o.x + 1); });
    return rows;
  }

  function viTri(m) {
    if (!m) return 'một dòng không xác định';
    if (m.cot === 'hamEm') return m.dong === 0 ? 'hàm ' + m.ten + ' (phần tên hàm)' : 'hàm ' + m.ten + ', dòng ' + m.dong;
    if (m.cot === 'hamMan') return m.dong === 0 ? 'hàm ' + m.ten + ' của màn (phần tên hàm)' : 'hàm ' + m.ten + ' của màn, dòng ' + m.dong;
    if (m.cot === 'thu') return 'lời gọi thử hàm';
    return 'chương trình, dòng ' + m.dong;
  }
  function cho(m) {
    if (!m) return null;
    var o = { cot: m.cot, dong: m.dong };
    if (m.ten) o.ten = m.ten;
    return o;
  }

  /** Dòng nào của mã Python "đáng đổ lỗi" khi core báo thiếu thân khối. */
  function dongDefThieuThan(dong, dongPy) {
    function sach(s) { var k = String(s).indexOf('#'); return (k >= 0 ? s.slice(0, k) : s).trim(); }
    var j = Math.min(dongPy, dong.length);
    if (j >= 1 && /:$/.test(sach(dong[j - 1]))) return j;
    for (j = j - 1; j >= 1; j--) if (sach(dong[j - 1]) !== '') return j;
    return dongPy;
  }

  function tenCua(ds) { return ds.map(function (h) { return h.ten; }); }

  // ô mà tay chỉ vào (tay xoay: theo nấc khớp). Không có huongTay (tay kẹp thường) thì là ô trước mặt như luật cũ.
  var O_TAY_NGAN = { truoc: 'trước mặt', trai: 'bên trái xe', phai: 'bên phải xe' };
  function oTayNgan(ht) { return O_TAY_NGAN[ht] || O_TAY_NGAN.truoc; }
  var TEN_MAU_VI = { red: 'đỏ (red)', green: 'xanh lá (green)', blue: 'xanh dương (blue)', yellow: 'vàng (yellow)', none: 'không màu (none)' };
  var TEN_MAU_HOP_LE = ['red', 'green', 'blue', 'yellow', 'none'];
  /** Khoảng cách sửa giữa a và b, tính cả đổi chỗ hai chữ liền nhau (bản OSA). */
  function khoangSua(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d.push([i]); }
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) {
      var cp = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cp);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  /** Các chuỗi trong phép so sánh (dòng có ==, != hay in) gần giống một tên màu nhưng không đúng tên nào. */
  function chuoiMauSai(dong) {
    var kq = [];
    dong.forEach(function (d, i) {
      var s = String(d).replace(/#.*$/, '');
      if (!/==|!=|\bin\b/.test(s)) return;
      var re = /(["'])((?:(?!\1).)*)\1/g, m;
      while ((m = re.exec(s))) {
        var t = m[2];
        if (TEN_MAU_HOP_LE.indexOf(t) >= 0) continue;
        var l = t.trim().toLowerCase();
        if (TEN_MAU_HOP_LE.some(function (n) { return l === n || (l.length > 2 && khoangSua(l, n) <= 1); })) kq.push({ dongPy: i + 1, chuoi: t });
      }
    });
    return kq;
  }

  /** Dòng Python (không tính chú thích) có phải câu lệnh while không. */
  function laDongWhile(s) { return /^\s*while\b/.test(String(s).replace(/#.*$/, '')); }
  function coWhile(g) { return g.dong.some(laDongWhile); }
  /** Dòng Python cuối cùng mà chương trình gọi một hàm gốc (để biết vòng nào đang chạy mãi). */
  function ultLenhPy(res) {
    for (var i = res.vet.length - 1; i >= 0; i--) if (res.vet[i].loai === 'lenh') return res.vet[i].dongPy;
    return 0;
  }
  /** Ánh xạ tới dòng while đang bao quanh dòng Python `dong` (hoặc chính nó); không thấy thì lấy while đầu tiên. */
  function viTriWhile(g, dong) {
    var ds = g.dong, j = Math.min(dong || 0, ds.length);
    function thut(s) { return /^\s*/.exec(s)[0].length; }
    if (j >= 1 && laDongWhile(ds[j - 1])) return g.anhXa[j] || null;
    if (j >= 1) {
      var t = thut(ds[j - 1]);
      for (var k = j - 1; k >= 1; k--) if (laDongWhile(ds[k - 1]) && thut(ds[k - 1]) < t) return g.anhXa[k] || null;
    }
    for (var q = 1; q <= ds.length; q++) if (laDongWhile(ds[q - 1])) return g.anhXa[q] || null;
    return g.anhXa[j] || null;
  }
  /**
   * Vòng while "chạy mãi" theo CHUỖI LỜI GỌI của lệnh cuối cùng: từ dòng lệnh đó rồi tới từng nơi gọi (trong ra ngoài), tìm khối while bao quanh gần nhất TRONG CÙNG MỘT HÀM
   * (leo lên các khối cha theo thụt lề, dừng ở dòng def). Nhờ vậy `while …: move()` mà move() chạy mãi thì chỉ vào while của hàm gọi move(), không phải while đầu tiên của cả chương trình.
   * Trả về vị trí (như g.anhXa[..]) hoặc null nếu không tầng nào có while bao quanh.
   */
  function viTriWhileTheoNgan(g, res) {
    var ds = g.dong;
    function thut(s) { return /^\s*/.exec(s)[0].length; }
    function whileBaoQuanh(dong) {
      if (!dong || dong > ds.length) return 0;
      if (laDongWhile(ds[dong - 1])) return dong;
      var t = thut(ds[dong - 1]);
      for (var k = dong - 1; k >= 1 && t > 0; k--) {
        if (!String(ds[k - 1]).trim()) continue;
        var tk = thut(ds[k - 1]);
        if (tk >= t) continue;
        if (laDongWhile(ds[k - 1])) return k;
        if (/^\s*def\b/.test(ds[k - 1])) return 0;
        t = tk;
      }
      return 0;
    }
    for (var i = res.vet.length - 1; i >= 0; i--) {
      var e = res.vet[i];
      if (e.loai !== 'lenh') continue;
      var dongs = [e.dongPy].concat((e.nganPy || []).slice().reverse());
      for (var q = 0; q < dongs.length; q++) { var w = whileBaoQuanh(dongs[q]); if (w) return g.anhXa[w] || null; }
      return null;
    }
    return null;
  }

  // tên bộ phận cho lời lenh-goc-hong khi màn không khai canhBao
  var TEN_BANH_HONG = { left_move: 'Bánh trái', left_back: 'Bánh trái', right_move: 'Bánh phải', right_back: 'Bánh phải', arm_left: 'Khớp xoay', arm_right: 'Khớp xoay', magnet_n: 'Cực N của nam châm', magnet_s: 'Cực S của nam châm', shoot: 'Nòng trước của súng hơi', shoot_back: 'Nòng sau của súng hơi', look: 'Camera dưới bụng drone' };
  /** Lệnh `ten` là lệnh gốc của loại robot nhưng phần cứng màn (man.phanCung) không có: bộ phận đó hỏng. */
  function lenhHong(man, ten) {
    var camMau = SanHoc.CAM_MAU_HAM.indexOf(ten) >= 0 && ((man.robot && man.robot.camBien) || []).some(function (c) { return c && (c.ma === 'mau' || c.ma === 'camera'); });     // cảm biến màu có gắn mà phần cứng thiếu color(): cảm biến hỏng (che-mau.9)
    var camNhin = SanHoc.CAM_NHIN_HAM.indexOf(ten) >= 0 && ((man.robot && man.robot.camBien) || []).some(function (c) { return c && c.ma === SanHoc.MA_CAM_BAY; });     // camera nhìn xuống của drone có gắn mà phần cứng thiếu look(): camera hỏng
    return !!man.phanCung && man.phanCung.indexOf(ten) < 0 && (camMau || camNhin || (SanHoc.HAM_GOC[man.loaiRobot || 'banh'] || []).indexOf(ten) >= 0 || SanHoc.TAY_XOAY.indexOf(ten) >= 0 || SanHoc.TAY_NAM_CHAM.indexOf(ten) >= 0 || SanHoc.TAY_HOI.indexOf(ten) >= 0);       // tay xoay: khớp kẹt một phía (thiếu arm_left / arm_right trong phần cứng) cũng là bộ phận hỏng
  }
  var SO_CHU = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy'];
  function soO(n) { return (n < SO_CHU.length ? SO_CHU[n] : String(n)) + ' ô'; }
  var MAT_QUAY = ['lên', 'sang phải', 'xuống', 'sang trái'];       // "quay mặt ..." theo hướng màn hình
  /** Nói bằng lời xe đang lệch bóng mờ ở đâu (theo hướng màn hình: trái / phải / trên / dưới). */
  var MAU_NGAN = { red: 'đỏ', green: 'xanh lá', blue: 'xanh dương', yellow: 'vàng' };
  /** Vật mờ / xe mờ cầm vật (chương che-tay): nói bằng lời vật nào chưa nằm đúng ô, xe cầm thiếu / thừa vật. res = kết quả chạy (res.vat, res.tay). Trả { cau: [câu], soVatLech, camLech }. */
  function lechVatBongMo(bm, res) {
    var cau = [], soVatLech = 0, camLech = false, vat = res.vat || [];
    var giu = res.tay || res.namCham || null, dongTu = res.tay ? 'cầm' : 'dính';          // tay kẹp CẦM vật, nam châm giữ vật bằng cách hút nên nói DÍNH
    var dangCam = giu && giu.cam !== null && giu.cam !== undefined ? vat.filter(function (v) { return v.id === giu.cam; })[0] : null;
    if (bm.cam) {
      if (!dangCam) { camLech = true; cau.push('Xe chưa ' + dongTu + ' vật nào, còn xe mờ thì đang ' + dongTu + ' một vật.'); }
      else if (bm.camMau && dangCam.mau !== bm.camMau) { camLech = true; cau.push('Xe đang ' + dongTu + ' vật ' + (dangCam.mau ? 'màu ' + MAU_NGAN[dangCam.mau] : 'không màu') + ', còn xe mờ ' + dongTu + ' vật màu ' + MAU_NGAN[bm.camMau] + '.'); }
    } else if (dangCam && bm.vat && bm.vat.length) { camLech = true; cau.push('Xe còn đang ' + dongTu + ' một vật, còn bóng mờ thì không ' + dongTu + ' gì.'); }
    var dat = vat.filter(function (v) { return v.trangThai === 'dat'; });
    var chua = (bm.vat || []).filter(function (q) { return !dat.some(function (v) { return v.x === q.x && v.y === q.y && (!q.mau || v.mau === q.mau); }); });
    soVatLech = chua.length;
    if (chua.length === 1) cau.push((chua[0].mau ? 'Vật màu ' + MAU_NGAN[chua[0].mau] : 'Một vật') + ' chưa nằm đúng ô như bóng mờ.');
    else if (chua.length > 1) cau.push('Còn ' + soO(chua.length).replace(' ô', ' vật') + ' chưa nằm đúng ô như bóng mờ.');
    return { cau: cau, soVatLech: soVatLech, camLech: camLech };
  }
  function lechBongMo(bm, r, res) {
    var dx = r.x - bm.x, dy = r.y - bm.y;
    var saiHuong = bm.huong !== null && bm.huong !== undefined && r.huong !== bm.huong;
    var lech = dx !== 0 || dy !== 0 || saiHuong, loi = '';
    if (dx === 0 && dy === 0) {
      if (saiHuong) loi = 'Xe đứng đúng chỗ của bóng mờ nhưng quay mặt ' + MAT_QUAY[r.huong] + ', còn bóng mờ quay mặt ' + MAT_QUAY[bm.huong] + '.';
    } else {
      var phan = [];
      if (dx !== 0) phan.push(soO(Math.abs(dx)) + (dx < 0 ? ' về bên trái' : ' về bên phải'));
      if (dy !== 0) phan.push(soO(Math.abs(dy)) + (dy < 0 ? ' về phía trên' : ' về phía dưới'));
      loi = 'Xe dừng lệch ' + phan.join(' và ') + ' so với bóng mờ' + (saiHuong ? ', lại còn quay mặt ' + MAT_QUAY[r.huong] + ' trong khi bóng mờ quay mặt ' + MAT_QUAY[bm.huong] : '') + '.';
    }
    var lv = res ? lechVatBongMo(bm, res) : { cau: [], soVatLech: 0, camLech: false };         // vật mờ / xe mờ cầm vật (chương che-tay)
    if (res && bm.xoay && res.tay && res.tay.xoay !== undefined && res.tay.xoay !== bm.xoay) {      // tay xoay: khớp không ở nấc của xe mờ
      var NAC_LOI = { trai: 'bên trái', truoc: 'phía trước', phai: 'bên phải' };
      lv.cau.push('Tay xoay đang chỉ ' + NAC_LOI[res.tay.xoay] + ', còn tay của xe mờ chỉ ' + NAC_LOI[bm.xoay] + '.');
    }
    if (res && bm.thung && res.thung) {                                                                 // thùng mờ (chương che-sung-hoi): thùng thật chưa nằm đúng các ô thùng mờ
      var chuaTh = bm.thung.filter(function (q) { return !res.thung.some(function (t) { return t.x === q.x && t.y === q.y; }); }).length;
      if (chuaTh === 1) lv.cau.push(res.thung.length === 1 ? 'Thùng nặng chưa nằm đúng ô như thùng mờ.' : 'Một thùng nặng chưa nằm đúng ô như thùng mờ.');
      else if (chuaTh > 1) lv.cau.push('Còn ' + soO(chuaTh).replace(' ô', ' thùng') + ' nặng chưa nằm đúng ô như thùng mờ.');
    }
    var laNhenBm = !!res && res.chan !== undefined;                                                    // nhện: kết quả có tư thế chân
    if (laNhenBm && bm.chan && res.chan !== bm.chan) lv.cau.push('Chân nhện đang ' + (res.chan === 'co' ? 'co' : 'duỗi') + ', còn bóng mờ có chân ' + (bm.chan === 'co' ? 'co' : 'duỗi') + '.');
    if (lv.cau.length) { loi = (loi ? loi + ' ' : (lech ? '' : 'Xe đúng chỗ rồi. ')) + lv.cau.join(' '); lech = true; }
    if (laNhenBm) loi = loi.replace(/\bXe\b/g, 'Nhện');
    else if (!res && bm.vat && bm.vat.length && !lech) { lech = true; loi = 'Xe đúng chỗ rồi nhưng vật chưa nằm đúng ô như trên màn.'; }
    return { lech: lech, loi: loi, dx: dx, dy: dy, saiHuong: saiHuong, soVatLech: lv.soVatLech, camLech: lv.camLech };
  }

  /**
   * Chẩn đoán từ kết quả chạy MỘT sân. sanThu = true: sân thử, không có cờ để "chưa tới".
   * bc (bối cảnh): { hamMan: [tên], hamEm: [tên], biCam: [tên hàm của em bị cấm mà bài đang gọi] }.
   */
  function chanDoanSan(man, res, g, sanThu, bc) {
    var cd = [], hamGoc = man.hamGoc || [];
    var mo = man.moXuong !== false;
    function them(ma, loi, extra) { var o = { ma: ma, muc: 'loi', loi: loi }; for (var k in extra) o[k] = extra[k]; cd.push(o); }

    // --- lỗi của nhân chạy code
    var l = res.loi;
    if (l && l.loai !== 'qua-nhieu-nhip' && l.loai !== 'infinite-loop') {
      var m = g.anhXa[l.dong] || null;
      var tn = /tên "([^"]+)"/.exec(l.thongDiep || '');
      if (l.ma === 'mau-son-sai') {
        them('mau-son-sai', 'Ở ' + viTri(m) + ': ' + l.thongDiep + ' Tên màu viết chữ thường, đặt trong dấu nháy, ví dụ ink("red").', { cho: cho(m), mau: l.mauDat });
      } else if (l.ma === 'tam-sai') {
        them('tam-sai', 'Ở ' + viTri(m) + ': ' + l.thongDiep + ' Máy ném chỉ ném được 1, 2 hoặc 3 ô: đếm số ô từ xe tới ô muốn rơi rồi chọn n.', { cho: cho(m), tam: l.tamDat });
      } else if (l.loai === 'runtime-error' && tn && /^Chưa có biến hay hàm/.test(l.thongDiep) && SanHoc.laHamCamBien(tn[1]) && hamGoc.indexOf(tn[1]) < 0 && !lenhHong(man, tn[1])) {
        var dsCam = hamGoc.filter(function (t) { return SanHoc.laHamCamBien(t); });
        var laNhin = SanHoc.CAM_NHIN_HAM.indexOf(tn[1]) >= 0, camBayGan = ((man.robot && man.robot.camBien) || []).some(function (c) { return c && c.ma === SanHoc.MA_CAM_BAY; });
        them('chua-gan-cam-bien', 'Ở ' + viTri(m) + ': ' + (laNhin && !camBayGan
          ? 'drone này chưa gắn camera nhìn xuống dưới bụng nên chưa có hàm ' + tn[1] + '().'                                  // look(): camera nhìn xuống của drone (camera-bay)
          : laNhin ? 'màn này chưa mở lệnh ' + tn[1] + '() trên khay (camera dưới bụng drone chưa dùng được ở đây).'          // camera có gắn mà khay chưa mở lệnh
          : dsCam.length
          ? 'màn này mới dùng được ' + dsCam.map(function (t) { return t + '()'; }).join(', ') + ', chưa có ' + tn[1] + '().'
          : 'robot này chưa gắn cảm biến ' + (SanHoc.CAM_MAU_HAM.indexOf(tn[1]) >= 0 ? 'màu ở bụng hay camera (để đọc màu)' : SanHoc.CAM_TU_HAM.indexOf(tn[1]) >= 0 ? 'từ (kim loại)' : SanHoc.CAM_PIN_HAM.indexOf(tn[1]) >= 0 ? 'đo pin (màn này drone chưa có pin để đo)' : 'khoảng cách') + ' nên chưa có hàm ' + tn[1] + '().') +
          ' Hàm gốc dùng được ở màn này: ' + (hamGoc.length ? hamGoc.join(', ') : '(không có)') + '.', { ten: tn[1], cho: cho(m) });
      } else if (l.loai === 'runtime-error' && tn && /^Chưa có biến( hay hàm)? tên/.test(l.thongDiep) && SanHoc.MAU_TEN.concat(['none']).indexOf(tn[1]) >= 0 && (hamGoc.indexOf('color') >= 0 || hamGoc.indexOf('look') >= 0)) {
        them('mau-thieu-nhay', 'Ở ' + viTri(m) + ': ' + tn[1] + ' đang viết không có dấu nháy nên Python tưởng đó là tên một biến hay một hàm và không tìm thấy. ' +
          'Tên màu là một chuỗi chữ, phải đặt trong dấu nháy: "' + tn[1] + '".', { ten: tn[1], cho: cho(m) });
      } else if (l.ma === 'lenh-chua-mo') {
        them('lenh-chua-mo', 'Ở ' + viTri(m) + ': lệnh ' + l.ten + '() chưa có trên khay ở màn này. Lệnh dùng được ở màn này: ' + (hamGoc.length ? hamGoc.join(', ') : '(không có)') + '.', { ten: l.ten, cho: cho(m) });
      } else if (l.loai === 'runtime-error' && tn && /^Chưa có biến hay hàm/.test(l.thongDiep) && lenhHong(man, tn[1])) {
        var ph = SanHoc.phanCungCua(man);
        them('lenh-goc-hong', 'Ở ' + viTri(m) + ': ' + (man.canhBao ? man.canhBao : (TEN_BANH_HONG[tn[1]] ? TEN_BANH_HONG[tn[1]] + ' hỏng' : 'Bộ phận này hỏng')) + ': ' + tn[1] + '() không chạy được ở màn này. Lệnh còn chạy được: ' + ph.join(', ') + '.', { ten: tn[1], cho: cho(m) });
      } else if (l.loai === 'runtime-error' && tn && /^Chưa có biến hay hàm/.test(l.thongDiep)) {
        var ten = tn[1], s;
        if (bc.biCam.indexOf(ten) >= 0) {
          s = 'Ở ' + viTri(m) + ': màn này không cho dùng hàm của em, nên "' + ten + '" chưa có. Hàm gốc dùng được ở màn này: ' +
            (hamGoc.length ? hamGoc.join(', ') : '(không có)') + '.';
        } else {
          s = 'Ở ' + viTri(m) + ': không có hàm tên "' + ten + '". Hàm gốc dùng được ở màn này: ' +
            (hamGoc.length ? hamGoc.join(', ') : '(không có)') + '.';
          if (bc.hamMan.length) s += ' Hàm của màn: ' + bc.hamMan.join(', ') + '.';
          if (bc.hamEm.length) s += ' Hàm của em: ' + bc.hamEm.slice(0, 6).join(", ") + (bc.hamEm.length > 6 ? ', …' : '') + '.';
          s += mo ? ' Nếu đó là hàm của bạn thì cần tạo nó trong Xưởng hàm, và kiểm tra lại chính tả.' : ' Kiểm tra lại chính tả.';
        }
        them('ham-chua-co', s, { ten: ten, cho: cho(m) });
      } else if (l.loai === 'syntax-error' || l.loai === 'indent-error') {
        var mm = m, td = l.thongDiep;
        if (/^Thiếu dòng thụt lề/.test(td)) {
          mm = g.anhXa[dongDefThieuThan(g.dong, l.dong)] || m;
          td = mm && (mm.cot === 'hamEm' || mm.cot === 'hamMan') && mm.dong === 0
            ? 'hàm này chưa có dòng nào trong thân.'
            : 'dòng này kết thúc bằng dấu ":" nên phải có ít nhất một dòng thụt vào ngay bên dưới làm thân.';
        }
        them(l.loai === 'syntax-error' ? 'loi-cu-phap' : 'loi-thut-le', 'Ở ' + viTri(mm) + ': ' + td, { cho: cho(mm) });
      } else {
        them('loi-chay', 'Ở ' + viTri(m) + ': ' + l.thongDiep, { cho: cho(m), loaiCore: l.loai });
      }
    }
    if (l && l.loai === 'infinite-loop') {
      var mw = viTriWhile(g, l.dong);
      them('vong-vo-han', 'Ở ' + viTri(mw) + ': vòng while chạy mãi không dừng: điều kiện không bao giờ sai và bên trong không có lệnh nào cho robot chạy tiếp, nên chương trình bị ngắt. ' +
        'Xem lại điều kiện của vòng while và những gì nằm trong thân vòng.', { cho: cho(mw), loaiCore: 'infinite-loop' });
    } else if (l && l.loai === 'qua-nhieu-nhip' && coWhile(g)) {
      var mw2 = viTriWhileTheoNgan(g, res) || viTriWhile(g, ultLenhPy(res));
      them('vong-vo-han', 'Robot đã chạy quá ' + (res.nhipToiDa || man.nhipToiDa || 200) + ' nhịp mà vòng while vẫn chưa dừng (ở ' + viTri(mw2) + '): điều kiện không bao giờ sai.' +
        ' Xem lại điều kiện của vòng while, và xem trong thân vòng có lệnh nào làm điều kiện đổi không.', { cho: cho(mw2), loaiCore: 'qua-nhieu-nhip', nhip: res.nhip });
    } else if (l && l.loai === 'qua-nhieu-nhip') {
      them('qua-nhieu-nhip', 'Robot đã chạy quá ' + (res.nhipToiDa || man.nhipToiDa || 200) + ' nhịp' +
        (sanThu ? '. ' : ' mà chưa tới cờ. ') +
        'Xem chương trình có đoạn nào lặp mãi hoặc đi vòng không cần thiết không.', { nhip: res.nhip });
    }

    // --- các mốc trong lúc chạy
    var tuong = res.suKien.filter(function (e) { return e.ma === 'dam-tuong'; });
    if (tuong.length) {
      var e0 = tuong[0];
      var s2;
      if (sanThu) {
        s2 = e0.vat === 'cua'
          ? 'Xe đâm vào cửa đang đóng ở ô (' + e0.den.x + ', ' + e0.den.y + ') ở nhịp ' + e0.nhip + ' nên đứng yên (vẫn mất một nhịp).' + (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') + ' Cửa đóng chặn như tường: đặt cửa ở trạng thái mở rồi thử lại.'
          : e0.vat === 'vat'
          ? 'Xe vướng vật ở nhịp ' + e0.nhip + ': ô (' + e0.den.x + ', ' + e0.den.y + ') có một vật nằm đất nên xe đứng yên (vẫn mất một nhịp).' +
            (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') + ' Vật chiếm ô: gắp nó lên hoặc đặt vật chỗ khác.'
          : e0.vat === 'thung-nang'
          ? 'Xe đâm vào thùng nặng ở nhịp ' + e0.nhip + ' nên đứng yên (vẫn mất một nhịp).' +
            (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
            ' Thùng nặng cản đường xe như tường: xe húc bằng bánh thì không đẩy được, chỉ cú giật của súng hơi mới dời được thùng.'
          : e0.vat === 'ngoai-san'
          ? 'Xe đi ra ngoài sân thử (ở nhịp ' + e0.nhip + '). Đặt xe chỗ khác rồi thử lại.'
          : 'Xe đâm vào tường ở nhịp ' + e0.nhip + ' nên đứng yên (vẫn mất một nhịp).' +
            (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
            ' Đặt xe hoặc tường chỗ khác, rồi thử lại.';
      } else if (e0.vat === 'cua') {
        s2 = 'Ở nhịp ' + e0.nhip + ', robot định đi vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng cửa ở đó đang đóng nên nó đứng yên (vẫn mất một nhịp).' +
          (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
          ' Cửa đóng chặn xe như tường: cửa mở khi bóng bắn trúng nút điều khiển nó, hoặc khi tới nhịp tự mở. front_clear() (nếu có) cho biết ô trước mặt đã trống chưa.';
      } else if (e0.vat === 'gam-thap') {
        s2 = 'Ở nhịp ' + e0.nhip + ', ' + (man.loaiRobot === 'nhen' ? 'nhện' : 'robot') + ' định đi vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng đó là gầm thấp' +
          (man.loaiRobot === 'nhen' ? ': chân đang duỗi nên đầu nhện đụng trần, nhện đứng yên (vẫn mất hai nhịp).' : ' (chỉ nhện đang co chân mới chui qua được) nên nó đứng yên (vẫn mất một nhịp).') +
          (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
          (man.loaiRobot === 'nhen' ? ' Co chân bằng crouch() trước khi bước vào gầm; qua gầm rồi mới duỗi chân bằng stand().' : '');
      } else if (e0.vat === 'vat') {
        s2 = 'Ở nhịp ' + e0.nhip + ', robot định ' + (e0.kieu === 'lui' ? 'lùi' : e0.kieu === 'truot' ? 'trượt' : 'đi') + ' vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng ô đó có một vật nằm đất: vật chiếm ô nên xe vướng vật và đứng yên (vẫn mất một nhịp).' +
          (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
          ' Muốn đi qua ô đó phải gắp vật lên trước (hạ tay, grab()), hoặc đi đường vòng.';
      } else if (e0.vat === 'thung-nang') {
        s2 = 'Ở nhịp ' + e0.nhip + ', robot định ' + (e0.kieu === 'lui' ? 'lùi' : e0.kieu === 'truot' ? 'trượt' : 'đi') + ' vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng đó là thùng nặng nên nó đứng yên (vẫn mất một nhịp).' +
          (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
          ' Thùng nặng cản đường xe như tường: xe húc bằng bánh thì không đẩy được, chỉ cú giật của súng hơi mới dời được thùng.';
      } else {
        s2 = 'Ở nhịp ' + e0.nhip + ', robot định đi vào ô (' + e0.den.x + ', ' + e0.den.y + ') nhưng đó là ' +
          (LOAI_VAT[e0.vat] || e0.vat) + ' nên nó đứng yên (vẫn mất một nhịp).' +
          (tuong.length > 1 ? ' Chuyện này xảy ra ' + tuong.length + ' lần.' : '') +
          (man.loaiRobot === 'drone' ? ' Kiểm tra lại hướng của lệnh go_* (drone không quay, bay thẳng theo hướng em chọn). Drone bay qua được hàng rào thấp, băng chuyền, vật và bậc thang, nhưng không qua được tường cao hay mép sân.' : man.loaiRobot === 'nhen' ? ' Kiểm tra lại hướng của lệnh go_* (nhện không quay, đi thẳng theo hướng em chọn).' : man.loaiRobot === 'omni' ? ' Kiểm tra lại robot đang quay mặt hướng nào: slide_left() và slide_right() tính theo hướng mặt của xe.' : ' Kiểm tra lại robot đang quay mặt hướng nào trước lệnh đi.');
      }
      them('dam-tuong', s2, { nhip: e0.nhip, den: e0.den, soLan: tuong.length, cho: cho(e0.lenh ? (g.anhXa[e0.lenh.dongPy] || null) : null) });
    }
    var thungChan = res.suKien.filter(function (e) { return e.ma === 'thung-chan'; });
    if (thungChan.length) {
      var tc0 = thungChan[0], mtc = tc0.lenh ? (g.anhXa[tc0.lenh.dongPy] || null) : null;
      them('thung-chan', 'Ở nhịp ' + tc0.nhip + ', thùng ở ô (' + tc0.o.x + ', ' + tc0.o.y + ') nhận cú giật nhưng không trượt được vì ô sau nó, (' + tc0.den.x + ', ' + tc0.den.y + '), là ' +
        (LY_DO_THUNG[tc0.vat] || tc0.vat) + ': xe và thùng đứng yên (vẫn mất một nhịp).' +
        (thungChan.length > 1 ? ' Chuyện này xảy ra ' + thungChan.length + ' lần.' : '') +
        ' Thùng chỉ trượt được vào ô trống: xem lại hướng giật.', { nhip: tc0.nhip, soLan: thungChan.length, cho: cho(mtc), kieu: tc0.kieu });
    }
    var thungKetSk = res.suKien.filter(function (e) { return e.ma === 'thung-ket'; });
    if (thungKetSk.length) {
      var tk0 = thungKetSk[0];
      them('thung-ket', 'Thùng kẹt vào góc ở ô (' + tk0.o.x + ', ' + tk0.o.y + ') từ nhịp ' + tk0.nhip + ', không đẩy ra được nữa nên chương trình dừng ở đó. ' +
        'Hai cạnh vuông góc của góc đó là tường hay mép sân; muốn thùng khỏi kẹt, đẩy nó theo hướng khác trước khi nó chạm góc.', { nhip: tk0.nhip, id: tk0.id, o: tk0.o });
    }
    var nemVo = res.suKien.filter(function (e) { return e.ma === 'nem-vo'; });
    if (nemVo.length) {
      var nv0 = nemVo[0], mnv = nv0.lenh ? (g.anhXa[nv0.lenh.dongPy] || null) : null;
      them('nem-vo', 'Ở nhịp ' + nv0.nhip + ', vật ném (tầm ' + nv0.tam + ') rơi xuống ô (' + nv0.o.x + ', ' + nv0.o.y + '), là ' + (LY_NEM[nv0.lyDo] || nv0.lyDo) + ' nên vỡ' +
        (sanThu ? '.' : '; vật vỡ rồi thì không đưa tới đích được nữa, chương trình dừng ở đó.') + (nemVo.length > 1 ? ' Chuyện này xảy ra ' + nemVo.length + ' lần.' : '') +
        ' Ô rơi phải là sàn trống: xem lại tầm n trong aim(n).', { nhip: nv0.nhip, soLan: nemVo.length, o: nv0.o, lyDo: nv0.lyDo, tam: nv0.tam, cho: cho(mnv) });
    }
    var roDay = res.suKien.filter(function (e) { return e.ma === 'ro-day'; });
    if (roDay.length) {
      var rd0 = roDay[0], mrd = rd0.lenh ? (g.anhXa[rd0.lenh.dongPy] || null) : null;
      them('ro-day', 'Ở nhịp ' + rd0.nhip + ', load() không nạp thêm được vì rổ đã có một vật.' + (roDay.length > 1 ? ' Chuyện này xảy ra ' + roDay.length + ' lần.' : '') +
        ' Rổ chỉ chứa một vật: ném nó đi (throw()) rồi mới nạp vật khác.', { nhip: rd0.nhip, soLan: roDay.length, cho: cho(mrd) });
    }
    var nemGoiLai = res.suKien.filter(function (e) { return e.ma === 'nem-goi-lai'; });
    if (nemGoiLai.length) {
      var nl0 = nemGoiLai[0], mnl = g.anhXa[nl0.dongPy] || null, mnlt = nl0.truoc ? (g.anhXa[nl0.truoc.dongPy] || null) : null;
      them('nem-goi-lai', 'Ở ' + viTri(mnl) + ': máy ném đã nhận lệnh ' + nl0.truoc.ten + '() (ở ' + viTri(mnlt) + ') trong nhịp này rồi, nên lệnh ' + nl0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp máy ném chỉ nạp hoặc ném một lần; wait() mới sang nhịp kế.', { cho: cho(mnl), choTruoc: cho(mnlt), nhip: nl0.nhip });
    }
    var sonLai = res.suKien.filter(function (e) { return e.ma === 'son-goi-lai'; });
    if (sonLai.length) {
      var sl0 = sonLai[0], msl = g.anhXa[sl0.dongPy] || null, mslt = sl0.truoc ? (g.anhXa[sl0.truoc.dongPy] || null) : null;
      them('son-goi-lai', 'Ở ' + viTri(msl) + ': đầu sơn đã nhận lệnh ' + sl0.truoc.ten + '() (ở ' + viTri(mslt) + ') trong nhịp này rồi, nên lệnh ' + sl0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp đầu sơn chỉ làm một việc (chấm, hạ hay nhấc); wait() mới sang nhịp kế.', { cho: cho(msl), choTruoc: cho(mslt), nhip: sl0.nhip });
    }
    var toThua = res.suKien.filter(function (e) { return e.ma === 'to-thua'; });
    if (toThua.length) {
      var tt0 = toThua[0], mtt = tt0.lenh ? (g.anhXa[tt0.lenh.dongPy] || null) : null;
      them('to-thua', 'Ở nhịp ' + tt0.nhip + ', ô (' + tt0.o.x + ', ' + tt0.o.y + ') bị tô màu ' + TEN_MAU_VI[tt0.mau] + ' mà ô đó nằm ngoài hình mờ. Sơn rồi thì không xóa được, nên chương trình dừng ở đó. ' +
        (tt0.kieu === 'net' ? 'Đầu sơn vẫn đang hạ khi xe đi tới ô này: nhấc lên bằng pen_up() trước khi đi ra khỏi hình.' : 'Xem lại xe đang đứng ở ô nào trước khi chấm.'),
        { nhip: tt0.nhip, o: tt0.o, mau: tt0.mau, cho: cho(mtt) });
    }
    var nemHut = res.suKien.filter(function (e) { return e.ma === 'nem-hut'; });
    if (nemHut.length) {
      var nh0 = nemHut[0];
      cd.push({ ma: 'nem-hut', muc: 'thong-tin', nhip: nh0.nhip, soLan: nemHut.length, cho: cho(nh0.lenh ? (g.anhXa[nh0.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + nh0.nhip + ', throw() không ném được gì: rổ đang trống.' + (nemHut.length > 1 ? ' Chuyện này xảy ra ' + nemHut.length + ' lần.' : '') + ' Rổ phải có vật (nạp bằng load() khi vật nằm ngay trước mặt xe) thì mới ném được.' });
    }
    var napHut = res.suKien.filter(function (e) { return e.ma === 'nap-hut'; });
    if (napHut.length) {
      var np0 = napHut[0];
      cd.push({ ma: 'nap-hut', muc: 'thong-tin', nhip: np0.nhip, soLan: napHut.length, o: np0.o, cho: cho(np0.lenh ? (g.anhXa[np0.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + np0.nhip + ', load() không nạp được gì: ô (' + np0.o.x + ', ' + np0.o.y + ') ngay trước mặt xe không có vật nằm.' + (napHut.length > 1 ? ' Chuyện này xảy ra ' + napHut.length + ' lần.' : '') + ' load() chỉ nạp vật nằm ở ô ngay trước mặt xe.' });
    }
    var nemDung = res.suKien.filter(function (e) { return e.ma === 'nem-dung-yen'; });
    if (nemDung.length) {
      var nd0 = nemDung[0], mnd = nd0.lenh ? (g.anhXa[nd0.lenh.dongPy] || null) : null, mndn = nd0.nem ? (g.anhXa[nd0.nem.dongPy] || null) : null;
      cd.push({ ma: 'nem-dung-yen', muc: 'thong-tin', nhip: nd0.nhip, soLan: nemDung.length, cho: cho(mnd), choNem: cho(mndn),
        loi: 'Ở nhịp ' + nd0.nhip + ': lệnh ' + (nd0.nem ? nd0.nem.ten + '() (ở ' + viTri(mndn) + ') ' : 'máy ném ') + 'và lệnh ' + (nd0.lenh ? nd0.lenh.ten + '() (ở ' + viTri(mnd) + ') ' : 'bánh ') + 'nằm chung một nhịp, nên xe đứng yên và lệnh bánh bị bỏ.' +
          (nemDung.length > 1 ? ' Chuyện này xảy ra ' + nemDung.length + ' lần.' : '') + ' Nhịp có load() hay throw() chỉ nạp hoặc ném, xe không đi.' });
    }
    var banLai = res.suKien.filter(function (e) { return e.ma === 'ban-goi-lai'; });
    if (banLai.length) {
      var bl0 = banLai[0], mbl = g.anhXa[bl0.dongPy] || null, mblt = bl0.truoc ? (g.anhXa[bl0.truoc.dongPy] || null) : null;
      them('ban-goi-lai', 'Ở ' + viTri(mbl) + ': súng đã nhận lệnh ' + bl0.truoc.ten + '() (ở ' + viTri(mblt) + ') trong nhịp này rồi, nên lệnh ' + bl0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp súng chỉ bắn một phát; wait() mới sang nhịp kế.', { cho: cho(mbl), choTruoc: cho(mblt), nhip: bl0.nhip });
    }
    var hetDan = res.suKien.filter(function (e) { return e.ma === 'het-dan'; });
    if (hetDan.length) {
      var hd0 = hetDan[0];
      them('het-dan', 'Ở nhịp ' + hd0.nhip + ', súng đã hết đạn nên không bắn được gì (và xe cũng không giật).' + (hetDan.length > 1 ? ' Chuyện này xảy ra ' + hetDan.length + ' lần.' : '') +
        ' Màn này chỉ có ' + (man.danToiDa || 0) + ' viên: dùng cho đúng chỗ.', { nhip: hd0.nhip, soLan: hetDan.length, cho: cho(hd0.lenh ? (g.anhXa[hd0.lenh.dongPy] || null) : null) });
    }
    var banHut = res.suKien.filter(function (e) { return e.ma === 'ban-hut'; });
    if (banHut.length) {
      var bh0 = banHut[0];
      cd.push({ ma: 'ban-hut', muc: 'thong-tin', nhip: bh0.nhip, soLan: banHut.length, huong: bh0.huong, cho: cho(bh0.lenh ? (g.anhXa[bh0.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + bh0.nhip + ', quả bóng bay thẳng về phía ' + SanHoc.TEN_HUONG[bh0.huong] + (bh0.sau ? ' (ra sau đuôi xe)' : '') + ' từ ô (' + bh0.tu.x + ', ' + bh0.tu.y + ') rồi ra khỏi sân mà không trúng gì.' +
          (banHut.length > 1 ? ' Chuyện này xảy ra ' + banHut.length + ' lần.' : '') + ' Bóng chỉ bay thẳng: shoot() bắn ra trước mũi xe, shoot_back() bắn ra sau đuôi xe. Xem xe đang quay mặt về đâu.' });
    }
    var banChan = res.suKien.filter(function (e) { return e.ma === 'ban-bi-chan'; });
    if (banChan.length) {
      var bc0 = banChan[0];
      cd.push({ ma: 'ban-bi-chan', muc: 'thong-tin', nhip: bc0.nhip, soLan: banChan.length, o: bc0.o, vat: bc0.vat, cho: cho(bc0.lenh ? (g.anhXa[bc0.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + bc0.nhip + ', quả bóng dừng ở ô (' + bc0.o.x + ', ' + bc0.o.y + ') vì đó là ' + (LY_BAN[bc0.vat] || bc0.vat) + ', nên không tới được nút.' +
          (banChan.length > 1 ? ' Chuyện này xảy ra ' + banChan.length + ' lần.' : '') + ' Bóng bay thẳng và dừng ở vật cản đầu tiên (hàng rào thấp và băng chuyền thì bóng bay qua).' });
    }
    var giatChan = res.suKien.filter(function (e) { return e.ma === 'giat-chan'; });
    if (giatChan.length) {
      var gc0 = giatChan[0];
      cd.push({ ma: 'giat-chan', muc: 'thong-tin', nhip: gc0.nhip, soLan: giatChan.length, o: gc0.den, vat: gc0.vat, huong: gc0.huong, cho: cho(gc0.lenh ? (g.anhXa[gc0.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + gc0.nhip + ', xe định giật về phía ' + SanHoc.TEN_HUONG[gc0.huong] + ' nhưng ô (' + gc0.den.x + ', ' + gc0.den.y + ') là ' + (LY_GIAT[gc0.vat] || gc0.vat) + ' nên xe đứng yên.' +
          (giatChan.length > 1 ? ' Chuyện này xảy ra ' + giatChan.length + ' lần.' : '') + ' Bắn ra trước thì xe giật lùi một ô, bắn ra sau thì xe giật tới một ô; ô giật vào bị chặn thì xe không nhúc nhích.' });
    }
    var banDung = res.suKien.filter(function (e) { return e.ma === 'ban-dung-yen'; });
    if (banDung.length) {
      var bd0 = banDung[0], mbd = bd0.lenh ? (g.anhXa[bd0.lenh.dongPy] || null) : null, mbdn = bd0.ban ? (g.anhXa[bd0.ban.dongPy] || null) : null;
      cd.push({ ma: 'ban-dung-yen', muc: 'thong-tin', nhip: bd0.nhip, soLan: banDung.length, cho: cho(mbd), choBan: cho(mbdn),
        loi: 'Ở nhịp ' + bd0.nhip + ': lệnh ' + (bd0.ban ? bd0.ban.ten : 'shoot') + '() (ở ' + viTri(mbdn) + ') và lệnh ' + (bd0.lenh ? bd0.lenh.ten + '() (ở ' + viTri(mbd) + ') ' : 'bánh ') + 'nằm chung một nhịp, nên xe không tự đi và lệnh kia bị bỏ.' +
          (banDung.length > 1 ? ' Chuyện này xảy ra ' + banDung.length + ' lần.' : '') + ' Nhịp có lệnh bắn chỉ bắn (và giật), bánh nghỉ.' });
    }
    var nutDoi = res.suKien.filter(function (e) { return e.ma === 'nut-doi'; }), demNut = {};
    nutDoi.forEach(function (e) { var k = e.o.x + ',' + e.o.y; demNut[k] = (demNut[k] || 0) + 1; });
    var nutLap = Object.keys(demNut).filter(function (k) { return demNut[k] >= 2; })[0];
    if (nutLap && !res.thang) {
      var nl = nutDoi.filter(function (e) { return e.o.x + ',' + e.o.y === nutLap; })[0];
      cd.push({ ma: 'ban-nut-lai', muc: 'thong-tin', o: nl.o, soLan: demNut[nutLap], cho: cho(nl.lenh ? (g.anhXa[nl.lenh.dongPy] || null) : null),
        loi: 'Nút ở (' + nl.o.x + ', ' + nl.o.y + ') bị bắn trúng ' + demNut[nutLap] + ' lần: mỗi phát trúng đổi nút một lần (bật rồi tắt), nên bắn số lần chẵn thì cửa và băng chuyền nối với nút trở về như lúc đầu.' });
    }
    var cuaKet = res.suKien.filter(function (e) { return e.ma === 'cua-ket'; });
    if (cuaKet.length) {
      var ck0 = cuaKet[0];
      cd.push({ ma: 'cua-ket', muc: 'thong-tin', nhip: ck0.nhip, soLan: cuaKet.length, o: ck0.o, cho: cho(ck0.lenh ? (g.anhXa[ck0.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + ck0.nhip + ', cửa ở (' + ck0.o.x + ', ' + ck0.o.y + ') đáng lẽ đóng lại nhưng ' + (ck0.voi === 'xe' ? 'xe đang đứng ngay ô cửa' : 'có vật nằm ở ô cửa') + ' nên cửa giữ mở.' +
          (cuaKet.length > 1 ? ' Chuyện này xảy ra ' + cuaKet.length + ' lần.' : '') + ' Cửa không bao giờ đóng đè lên xe hay vật.' });
    }
    var thaChan = res.suKien.filter(function (e) { return e.ma === 'tha-bi-chan'; });
    if (thaChan.length) {
      var tb0 = thaChan[0], mtb = tb0.lenh ? (g.anhXa[tb0.lenh.dongPy] || null) : null;
      if (tb0.kieu === 'kep') {
        var tbTrai = tb0.huongTay !== undefined && tb0.huongTay !== 'truoc';       // tay xoay đang chỉ sang bên
        them('tha-bi-chan', 'Ở nhịp ' + tb0.nhip + ', release() không thả được vật: ô ' + (tbTrai ? oTayNgan(tb0.huongTay) : 'ngay trước mặt xe') + ', (' + tb0.o.x + ', ' + tb0.o.y + '), là ' + (LY_THA[tb0.vat] || tb0.vat) +
          ' nên vật vẫn nằm trong kẹp.' + (thaChan.length > 1 ? ' Chuyện này xảy ra ' + thaChan.length + ' lần.' : '') +
          (tbTrai ? ' Vật chỉ đặt xuống được ô sàn trống mà tay đang chỉ: xoay tay sang hướng khác hay đi tới chỗ khác rồi thả.' : ' Vật chỉ đặt xuống được ô sàn trống ngay trước mặt: xoay hay đi tới chỗ khác rồi thả.'), { nhip: tb0.nhip, soLan: thaChan.length, o: tb0.o, vat: tb0.vat, kieu: 'kep', huongTay: tb0.huongTay, cho: cho(mtb) });
      } else if (man.loaiRobot === 'drone') {
        them('tha-bi-chan', 'Ở nhịp ' + tb0.nhip + ', magnet_off() không thả được vật: ô ngay dưới drone, (' + tb0.o.x + ', ' + tb0.o.y + '), là ' + (LY_THA[tb0.vat] || tb0.vat) +
          ' nên vật vẫn dính ở nam châm (nam châm vẫn bật).' + (thaChan.length > 1 ? ' Chuyện này xảy ra ' + thaChan.length + ' lần.' : '') +
          ' Nam châm treo dưới bụng drone chỉ thả được vật xuống ô sàn trống ngay bên dưới: bay sang ô khác rồi thả.', { nhip: tb0.nhip, soLan: thaChan.length, o: tb0.o, vat: tb0.vat, cho: cho(mtb) });
      } else {
      them('tha-bi-chan', 'Ở nhịp ' + tb0.nhip + ', magnet_off() không thả được vật: ô ngay trước mũi xe, (' + tb0.o.x + ', ' + tb0.o.y + '), là ' + (LY_THA[tb0.vat] || tb0.vat) +
        ' nên vật vẫn dính ở nam châm (nam châm vẫn bật).' + (thaChan.length > 1 ? ' Chuyện này xảy ra ' + thaChan.length + ' lần.' : '') +
        ' Vật chỉ thả được xuống ô trống ngay trước mặt: xoay hay đi tới chỗ khác rồi thả.', { nhip: tb0.nhip, soLan: thaChan.length, o: tb0.o, vat: tb0.vat, cho: cho(mtb) });
      }
    }
    var hutGo = res.suKien.filter(function (e) { return e.ma === 'hut-go'; });
    if (hutGo.length) {
      var hg0 = hutGo[0];
      cd.push({
        ma: 'hut-go', muc: 'thong-tin', nhip: hg0.nhip, soLan: hutGo.length, o: hg0.o, khoang: hg0.khoang,
        loi: man.loaiRobot === 'drone'
          ? 'Ở nhịp ' + hg0.nhip + ', nam châm đang bật nhưng vật ngay dưới drone, ở ô (' + hg0.o.x + ', ' + hg0.o.y + '), là vật GỖ: nam châm chỉ hút vật sắt hay vật nam châm khác cực.' +
            (hutGo.length > 1 ? ' Chuyện này xảy ra ' + hutGo.length + ' lần.' : '') + ' Nam châm treo dưới bụng chỉ hút vật nằm ngay dưới drone: bay tới đúng ô có vật sắt.'
          : 'Ở nhịp ' + hg0.nhip + ', nam châm đang bật nhưng vật đầu tiên trước mặt, ở ô (' + hg0.o.x + ', ' + hg0.o.y + '), là vật GỖ: gỗ không có từ, nên nam châm cực nào cũng không làm gì được nó, và vật gỗ còn chắn các vật đứng sau nó.' +
          (hutGo.length > 1 ? ' Chuyện này xảy ra ' + hutGo.length + ' lần.' : '') + ' Dùng front_metal() hay front_pole() (nếu có) để biết trước mặt là gì.'
      });
    }
    var ngoaiTam = res.suKien.filter(function (e) { return e.ma === 'ngoai-tam'; });
    if (ngoaiTam.length) {
      var nt0 = ngoaiTam[0];
      cd.push({ ma: 'ngoai-tam', muc: 'thong-tin', nhip: nt0.nhip, soLan: ngoaiTam.length, o: nt0.o, khoang: nt0.khoang,
        loi: 'Ở nhịp ' + nt0.nhip + ', vật sắt ở ô (' + nt0.o.x + ', ' + nt0.o.y + ') cách xe ' + nt0.khoang + ' ô, ngoài tầm hút của sắt (chỉ ' + SanHoc.TAM_HUT + ' ô).' + (ngoaiTam.length > 1 ? ' Chuyện này xảy ra ' + ngoaiTam.length + ' lần.' : '') +
          ' Tiến thêm một ô rồi hút. Vật nam châm có chữ N, S thì tầm xa hơn: tới ' + SanHoc.TAM_CUC + ' ô.' });
    }
    var dayBiChan = res.suKien.filter(function (e) { return e.ma === 'day-bi-chan'; });
    if (dayBiChan.length && !res.thang) {                                   // chỉ nói khi chưa thắng (lời giải đúng có thể để nam châm bật sát tường)
      var db0 = dayBiChan[0];
      cd.push({ ma: 'day-bi-chan', muc: 'thong-tin', nhip: db0.nhip, soLan: dayBiChan.length, o: db0.o, lyDo: db0.lyDo, tuMui: !!db0.tuMui, cho: cho(db0.lenh ? (g.anhXa[db0.lenh.dongPy] || null) : null),
        loi: db0.tuMui
          ? 'Ở nhịp ' + db0.nhip + ', vật nam châm đang dính ở mũi xe bị đẩy ra nhưng ô trước mũi xe, (' + db0.o.x + ', ' + db0.o.y + '), là ' + (LY_THA[db0.lyDo] || db0.lyDo) + ' nên nó không bắn ra được, vẫn dính.' + (dayBiChan.length > 1 ? ' Chuyện này xảy ra ' + dayBiChan.length + ' lần.' : '') + ' Quay xe về phía ô trống rồi đổi cực.'
          : 'Ở nhịp ' + db0.nhip + ', nam châm đẩy vật nam châm ở ô (' + db0.o.x + ', ' + db0.o.y + ') nhưng ô sát sau nó là ' + (LY_THA[db0.lyDo] || db0.lyDo) + ' nên vật không nhúc nhích được.' + (dayBiChan.length > 1 ? ' Chuyện này xảy ra ' + dayBiChan.length + ' lần.' : '') +
            ' Vật bị đẩy trượt thẳng ra xa xe và dừng trước vật cản.' });
    }
    var dayVatSk = res.suKien.filter(function (e) { return e.ma === 'day-vat'; });
    if (dayVatSk.length && !res.thang) {                                    // đẩy / bắn vật mà chưa thắng: nói vì sao vật đi (chương thắng thì đó là ý định)
      var dv0 = dayVatSk[0];
      cd.push({ ma: 'day-vat', muc: 'thong-tin', nhip: dv0.nhip, soLan: dayVatSk.length, cuc: dv0.cuc, tuMui: !!dv0.tuMui, den: dv0.den, soO: dv0.soO, cho: cho(dv0.lenh ? (g.anhXa[dv0.lenh.dongPy] || null) : null),
        loi: dv0.tuMui
          ? 'Ở nhịp ' + dv0.nhip + ', nam châm đổi sang cực ' + dv0.cuc + ', trùng chữ ' + dv0.cuc + ' trên vật đang dính, nên vật bị bắn ra khỏi mũi xe và trượt ' + dv0.soO + ' ô.'
          : 'Ở nhịp ' + dv0.nhip + ', nam châm cực ' + dv0.cuc + ' đẩy vật nam châm có chữ ' + dv0.cuc + ' ở ô (' + dv0.tu.x + ', ' + dv0.tu.y + ') đi ' + dv0.soO + ' ô: cực giống nhau thì đẩy nhau.' +
            (dayVatSk.length > 1 ? ' Chuyện này xảy ra ' + dayVatSk.length + ' lần.' : '') + ' Muốn kéo vật về thì bật cực KHÁC chữ trên vật.' });
    }
    var satKhongDay = res.suKien.filter(function (e) { return e.ma === 'sat-khong-day'; });
    if (satKhongDay.length) {
      var sd0 = satKhongDay[0];
      cd.push({ ma: 'sat-khong-day', muc: 'thong-tin', nhip: sd0.nhip, soLan: satKhongDay.length, cuc: sd0.cuc, cho: cho(sd0.lenh ? (g.anhXa[sd0.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + sd0.nhip + ', em đổi nam châm sang cực ' + sd0.cuc + ' nhưng vật đang dính là vật SẮT: sắt bị hút bởi cực nào cũng được và không bao giờ bị đẩy, nên nó vẫn dính.' + (satKhongDay.length > 1 ? ' Chuyện này xảy ra ' + satKhongDay.length + ' lần.' : '') +
          ' Chỉ vật nam châm (có chữ N hay S) mới bị đẩy, khi cùng cực với nam châm của xe.' });
    }
    var cungCuc = res.suKien.filter(function (e) { return e.ma === 'cung-cuc'; });
    if (cungCuc.length) {
      var cc0 = cungCuc[0];
      cd.push({ ma: 'cung-cuc', muc: 'thong-tin', nhip: cc0.nhip, soLan: cungCuc.length, o: cc0.o, cuc: cc0.cuc,
        loi: 'Ở nhịp ' + cc0.nhip + ', vật nam châm ngay dưới drone, ở ô (' + cc0.o.x + ', ' + cc0.o.y + '), có cực ' + cc0.cuc + ' giống nam châm đang bật: cùng cực thì không hút.' + (cungCuc.length > 1 ? ' Chuyện này xảy ra ' + cungCuc.length + ' lần.' : '') + ' Bật cực còn lại.' });
    }
    var magnetLai = res.suKien.filter(function (e) { return e.ma === 'magnet-goi-lai'; });
    if (magnetLai.length) {
      var ml0 = magnetLai[0], mml = g.anhXa[ml0.dongPy] || null, mmlt = ml0.truoc ? (g.anhXa[ml0.truoc.dongPy] || null) : null;
      them('magnet-goi-lai', 'Ở ' + viTri(mml) + ': nam châm đã nhận lệnh ' + ml0.truoc.ten + '() (ở ' + viTri(mmlt) + ') trong nhịp này rồi, nên lệnh ' + ml0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp nam châm chỉ nhận một lệnh (bật cực N, bật cực S hoặc ngắt điện); wait() mới sang nhịp kế.', { cho: cho(mml), choTruoc: cho(mmlt), nhip: ml0.nhip });
    }
    var goiLai = res.suKien.filter(function (e) { return e.ma === 'banh-goi-lai'; });
    if (goiLai.length) {
      var b0 = goiLai[0], mb = g.anhXa[b0.dongPy] || null;
      var mt = b0.truoc ? (g.anhXa[b0.truoc.dongPy] || null) : null;     // lệnh đã giữ bánh này trong nhịp
      them('banh-goi-lai', 'Ở ' + viTri(mb) + ': bánh ' + (b0.banh === 'trai' ? 'trái' : 'phải') +
        ' đã nhận lệnh' + (mt ? ' ' + b0.truoc.ten + '() (ở ' + viTri(mt) + ')' : '') +
        ' trong nhịp này rồi, nên lệnh ' + b0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp một bánh chỉ nhận một lệnh; wait() mới sang nhịp kế.', { cho: cho(mb), choTruoc: cho(mt), nhip: b0.nhip });
    }
    var slideGoiLai = res.suKien.filter(function (e) { return e.ma === 'slide-goi-lai'; });
    if (slideGoiLai.length) {
      var s0 = slideGoiLai[0], ms = g.anhXa[s0.dongPy] || null, mst = s0.truoc ? (g.anhXa[s0.truoc.dongPy] || null) : null;
      them('slide-goi-lai', 'Ở ' + viTri(ms) + ': xe đã nhận lệnh ' + s0.truoc.ten + '() (ở ' + viTri(mst) + ') trong nhịp này rồi, nên lệnh ' + s0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp xe omni chỉ trượt một lần, sang một bên; wait() mới sang nhịp kế.', { cho: cho(ms), choTruoc: cho(mst), nhip: s0.nhip });
    }
    var tayGoiLai = res.suKien.filter(function (e) { return e.ma === 'tay-goi-lai'; });
    if (tayGoiLai.length) {
      var t0 = tayGoiLai[0], mt0 = g.anhXa[t0.dongPy] || null, mtt = t0.truoc ? (g.anhXa[t0.truoc.dongPy] || null) : null;
      them('tay-goi-lai', 'Ở ' + viTri(mt0) + ': tay đã nhận lệnh ' + t0.truoc.ten + '() (ở ' + viTri(mtt) +
        ') trong nhịp này rồi, nên lệnh ' + t0.ten + '() này bị bỏ qua. ' +
        (t0.nhom === 'tu-the' ? 'Mỗi nhịp tay chỉ đổi tư thế một lần' : t0.nhom === 'xoay' ? 'Mỗi nhịp khớp xoay chỉ xoay một nấc' : 'Mỗi nhịp tay chỉ kẹp hoặc thả một lần') + '; wait() mới sang nhịp kế.',
        { cho: cho(mt0), choTruoc: cho(mtt), nhip: t0.nhip, nhom: t0.nhom });
    }
    var vuong = res.suKien.filter(function (e) { return e.ma === 'tay-vuong'; });
    if (vuong.length) {
      var ml = vuong[0].lenh ? (g.anhXa[vuong[0].lenh.dongPy] || null) : null;
      var laNhen = man.loaiRobot === 'nhen', laTruot = vuong[0].lenh && /^slide_/.test(vuong[0].lenh.ten);
      them('tay-vuong', 'Ở nhịp ' + vuong[0].nhip + ', tay đang hạ sát đất nên ' + (laNhen ? 'nhện không bước được' : man.loaiRobot === 'omni' ? 'xe không đi, quay hay trượt được' : 'xe không đi hay quay được') + ' (tay vướng sàn): ' +
        (laNhen ? 'lệnh' : laTruot ? 'lệnh trượt' : 'lệnh bánh') + (vuong[0].lenh ? ' ' + vuong[0].lenh.ten + '() (ở ' + viTri(ml) + ')' : '') + ' của nhịp đó bị bỏ.' +
        (vuong.length > 1 ? ' Chuyện này xảy ra ' + vuong.length + ' lần.' : '') +
        (laNhen ? ' Xem lại tư thế tay trước khi cho nhện bước.' : ' Xem lại tư thế tay trước khi cho xe chạy.'), { nhip: vuong[0].nhip, soLan: vuong.length, cho: cho(ml) });
    }
    var xoayKet = res.suKien.filter(function (e) { return e.ma === 'tay-xoay-ket'; });
    if (xoayKet.length) {
      var xk = xoayKet[0], mxk = xk.lenh ? (g.anhXa[xk.lenh.dongPy] || null) : null;
      them('tay-xoay-ket', 'Ở nhịp ' + xk.nhip + ', tay đang hạ sát đất nên khớp xoay bị kẹt: lệnh ' + (xk.lenh ? xk.lenh.ten + '() (ở ' + viTri(mxk) + ') ' : 'xoay tay ') + 'bị bỏ.' +
        (xoayKet.length > 1 ? ' Chuyện này xảy ra ' + xoayKet.length + ' lần.' : '') + ' Khớp chỉ xoay được khi tay đang nâng: nâng tay (arm_up) trước, cùng nhịp cũng được, rồi mới xoay.',
        { nhip: xk.nhip, soLan: xoayKet.length, huong: xk.huong, cho: cho(mxk) });
    }
    var xoayHet = res.suKien.filter(function (e) { return e.ma === 'xoay-het-nac'; });
    if (xoayHet.length) {
      var xh = xoayHet[0];
      cd.push({ ma: 'xoay-het-nac', muc: 'thong-tin', nhip: xh.nhip, soLan: xoayHet.length, huong: xh.huong, cho: cho(xh.lenh ? (g.anhXa[xh.lenh.dongPy] || null) : null),
        loi: 'Ở nhịp ' + xh.nhip + ', khớp tay đã xoay hết cỡ sang bên ' + (xh.huong === 'phai' ? 'phải' : 'trái') + ' (tay đang chỉ ' + (xh.nac === 'phai' ? 'bên phải' : xh.nac === 'trai' ? 'bên trái' : 'phía trước') + '), nên ' +
          (xh.lenh ? xh.lenh.ten + '()' : 'lệnh xoay') + ' không xoay thêm được.' + (xoayHet.length > 1 ? ' Chuyện này xảy ra ' + xoayHet.length + ' lần.' : '') +
          ' Khớp chỉ có ba nấc: trái, trước, phải; mỗi lệnh xoay một nấc.' });
    }
    var chanLai = res.suKien.filter(function (e) { return e.ma === 'chan-goi-lai'; });
    if (chanLai.length) {
      var cl0 = chanLai[0], mcl = g.anhXa[cl0.dongPy] || null, mclt = cl0.truoc ? (g.anhXa[cl0.truoc.dongPy] || null) : null;
      them('chan-goi-lai', 'Ở ' + viTri(mcl) + ': chân nhện đã nhận lệnh ' + cl0.truoc.ten + '() (ở ' + viTri(mclt) + ') trong nhịp này rồi, nên lệnh ' + cl0.ten + '() này bị bỏ qua. ' +
        'Mỗi nhịp chân chỉ nhận một lệnh (co hoặc duỗi); wait() hay một bước go_*() mới sang nhịp kế.', { cho: cho(mcl), choTruoc: cho(mclt), nhip: cl0.nhip });
    }
    var dauTran = res.suKien.filter(function (e) { return e.ma === 'dau-dung-tran'; });
    if (dauTran.length) {
      var dt0 = dauTran[0], mdt = dt0.lenh ? (g.anhXa[dt0.lenh.dongPy] || null) : null;
      them('dau-dung-tran', 'Ở nhịp ' + dt0.nhip + ', nhện đang ở trong ô gầm thấp (' + dt0.o.x + ', ' + dt0.o.y + ') mà ' + (dt0.lenh ? dt0.lenh.ten + '()' : 'duỗi chân') + ': đầu đụng trần nên chân vẫn co.' +
        (dauTran.length > 1 ? ' Chuyện này xảy ra ' + dauTran.length + ' lần.' : '') + ' Bò ra khỏi ô gầm rồi mới duỗi chân.', { nhip: dt0.nhip, soLan: dauTran.length, o: dt0.o, cho: cho(mdt) });
    }
    var nhayHut = res.suKien.filter(function (e) { return e.ma === 'nhay-hut'; });
    if (nhayHut.length) {
      var nh1 = nhayHut[0], mnh = nh1.lenh ? (g.anhXa[nh1.lenh.dongPy] || null) : null;
      them('nhay-hut', 'Ở nhịp ' + nh1.nhip + ', nhện bật lên định nhảy từ ô (' + nh1.tu.x + ', ' + nh1.tu.y + ') qua ô (' + nh1.qua.x + ', ' + nh1.qua.y + ') xuống ô (' + nh1.den.x + ', ' + nh1.den.y + ') nhưng ' +
        (nh1.giua ? 'ô ở giữa' : 'ô để đáp') + ' là ' + (LY_NHAY[nh1.vat] || nh1.vat) + ', nên nhện rơi xuống lại đúng ô cũ (vẫn mất hai nhịp).' +
        (nhayHut.length > 1 ? ' Chuyện này xảy ra ' + nhayHut.length + ' lần.' : '') + ' Cú nhảy bay qua đúng MỘT ô, và ô đáp phải là sàn trống: đếm lại số ô trước khi nhảy.', { nhip: nh1.nhip, soLan: nhayHut.length, tu: nh1.tu, den: nh1.den, vat: nh1.vat, cho: cho(mnh) });
    }
    var roiHo = res.suKien.filter(function (e) { return e.ma === 'roi-ho'; });
    if (roiHo.length) {
      var rh0 = roiHo[0], mrh = rh0.lenh ? (g.anhXa[rh0.lenh.dongPy] || null) : null;
      them('roi-ho', 'Ở nhịp ' + rh0.nhip + ', ' + (man.loaiRobot === 'nhen' ? 'nhện' : 'robot') + ' rơi xuống hố ở ô (' + rh0.o.x + ', ' + rh0.o.y + ')' + (rh0.lenh ? ' (lệnh ' + rh0.lenh.ten + '() ở ' + viTri(mrh) + ')' : '') +
        (sanThu ? '.' : ' nên chương trình dừng ở đó.') + ' Đặt chân vào ô hố là rơi. Muốn qua hố, nhện phải nhảy: co chân (crouch()), rồi duỗi chân (stand()) cùng một bước go_*() để bật qua ô hố.', { nhip: rh0.nhip, o: rh0.o, cho: cho(mrh) });
    }
    var omniCheo = res.suKien.filter(function (e) { return e.ma === 'omni-khong-cheo'; });
    if (omniCheo.length) {
      var oc = omniCheo[0], moc = oc.lenh ? (g.anhXa[oc.lenh.dongPy] || null) : null, mos = oc.truot ? (g.anhXa[oc.truot.dongPy] || null) : null;
      cd.push({
        ma: 'omni-khong-cheo', muc: 'thong-tin', nhip: oc.nhip, soLan: omniCheo.length, cho: cho(moc), choTruot: cho(mos),
        loi: 'Ở nhịp ' + oc.nhip + ': lệnh ' + (oc.lenh ? oc.lenh.ten + '() (ở ' + viTri(moc) + ') ' : 'bánh ') + 'và lệnh ' + oc.truot.ten + '() (ở ' + viTri(mos) + ') nằm chung một nhịp, nên xe chỉ trượt còn lệnh bánh bị bỏ.' +
          (omniCheo.length > 1 ? ' Chuyện này xảy ra ' + omniCheo.length + ' lần.' : '') +
          ' Bánh omni không đi chéo: một nhịp chỉ trượt ngang HOẶC tiến/quay.'
      });
    }
    var xichDo = res.suKien.filter(function (e) { return e.ma === 'xich-quay-do'; });
    if (xichDo.length) {
      var xd = xichDo[0], mxd = xd.lenh ? (g.anhXa[xd.lenh.dongPy] || null) : null;
      var mat = xd.cuoi
        ? 'chương trình kết thúc khi xe xích mới quay nửa vòng ' + (xd.huong > 0 ? 'sang phải' : 'sang trái') + ' (ở nhịp ' + xd.nhipNua + ')'
        : 'xe xích mới quay nửa vòng ' + (xd.huong > 0 ? 'sang phải' : 'sang trái') + ' ở nhịp ' + xd.nhipNua + ', nhịp kế lại làm việc khác nên phần quay dở mất';
      cd.push({
        ma: 'xich-quay-do', muc: 'thong-tin', nhip: xd.nhip, nhipNua: xd.nhipNua, soLan: xichDo.length, cuoi: !!xd.cuoi, cho: cho(mxd),
        loi: 'Ở nhịp ' + xd.nhip + ': ' + mat + (mxd ? ' (lệnh ' + xd.lenh.ten + '() ở ' + viTri(mxd) + ')' : '') + ', xe vẫn quay mặt như cũ.' +
          (xichDo.length > 1 ? ' Chuyện này xảy ra ' + xichDo.length + ' lần.' : '') +
          ' Xe xích cần 2 nhịp liên tiếp cùng một lệnh để quay đủ 90°.'
      });
    }
    var hetPin = res.suKien.filter(function (e) { return e.ma === 'het-pin'; });
    if (hetPin.length) {
      var hp0 = hetPin[0], mhp = hp0.lenh ? (g.anhXa[hp0.lenh.dongPy] || null) : null;
      var soDungYen = res.vet.filter(function (e) { return e.loai === 'nhip' && e.suKien.some(function (k) { return k.ma === 'dung-yen'; }); }).length;
      them('het-pin', 'Ở nhịp ' + hp0.nhip + ', pin của drone về 0 khi đang ở ô (' + hp0.o.x + ', ' + hp0.o.y + ') mà chưa xong việc: drone hạ cánh khẩn nên chương trình dừng ở đó' +
        (mhp ? ' (nhịp cuối là lệnh ' + hp0.lenh.ten + '() ở ' + viTri(mhp) + ')' : '') + '. Mỗi nhịp bay tốn 1 pin' +
        (soDungYen ? ', kể cả ' + soDungYen + ' nhịp chỉ lơ lửng đứng yên (wait())' : ', kể cả nhịp đứng yên hay đâm tường') + '; chỉ ô sạc (P) mới sạc đầy lại. Tìm đường ngắn hơn, bỏ nhịp thừa hoặc ghé ô sạc giữa đường.',
        { nhip: hp0.nhip, o: hp0.o, cho: cho(mhp) });
    }
    var vatVo = res.suKien.filter(function (e) { return e.ma === 'vat-vo'; });
    if (vatVo.length) {
      them('vat-vo', 'Ở nhịp ' + vatVo[0].nhip + ', vật bị thả từ trên cao nên rơi xuống ô ' + oTayNgan(vatVo[0].huongTay) + ' và vỡ' +
        (sanThu ? '.' : '; vật vỡ rồi thì không đưa tới đích được nữa, chương trình dừng ở đó.'),
        { nhip: vatVo[0].nhip, id: vatVo[0].id, o: vatVo[0].o, cho: cho(vatVo[0].lenh ? (g.anhXa[vatVo[0].lenh.dongPy] || null) : null) });
    }
    var kepHut = res.suKien.filter(function (e) { return e.ma === 'kep-hut'; });
    if (kepHut.length) {
      var kh = kepHut[0];
      cd.push({
        ma: 'kep-hut', muc: 'thong-tin', nhip: kh.nhip, lyDo: kh.lyDo, o: kh.o, cho: cho(kh.lenh ? (g.anhXa[kh.lenh.dongPy] || null) : null),
        loi: kh.lyDo === 'qua-nang'
          ? 'Ở nhịp ' + kh.nhip + ', tay kẹp không gắp nổi thùng nặng ở ô trước mặt (' + kh.o.x + ', ' + kh.o.y + '): thùng nặng chỉ đẩy được, không nhấc được.'
          : 'Ở nhịp ' + kh.nhip + ', tay kẹp vào không khí: ' +
          (kh.lyDo === 'tay-nang' ? 'vật nằm ' + oTayNgan(kh.huongTay) + (kh.huongTay && kh.huongTay !== 'truoc' ? '' : ' xe') + ', ở ô (' + kh.o.x + ', ' + kh.o.y + '), mà tay đang nâng (hạ tay trước khi gắp).'
            : kh.huongTay && kh.huongTay !== 'truoc' ? 'ô ' + oTayNgan(kh.huongTay) + ', (' + kh.o.x + ', ' + kh.o.y + '), không có vật nào để gắp. Tay xoay gắp vật ở ô mà tay đang chỉ, không phải ô xe đứng: xem tay đang chỉ sang bên nào.'
            : 'ô ngay trước mặt xe, (' + kh.o.x + ', ' + kh.o.y + '), không có vật nào để gắp. Tay gắp vật ở ô TRƯỚC mặt, không phải ô xe đứng.')
      });
    }
    var datSaiMau = res.suKien.filter(function (e) { return e.ma === 'dat-sai-mau'; });
    if (datSaiMau.length) {
      var sm = datSaiMau[0];
      var smNC = sm.chat === 'nam-cham';
      them('dat-sai-mau', 'Ở nhịp ' + sm.nhip + ', vật ' + (smNC ? 'nam châm cực ' + sm.cuc + ' (màu ' + TEN_MAU_VI[sm.mauVat] + ')' : sm.mauVat === 'none' ? 'không màu' : 'màu ' + TEN_MAU_VI[sm.mauVat]) + (smNC ? ' nằm xuống ô đích màu ' : ' được thả xuống ô đích màu ') + TEN_MAU_VI[sm.mauDich] +
        ' ở (' + sm.o.x + ', ' + sm.o.y + '): ô đích màu nào thì chỉ nhận vật cùng màu, nên vật này chưa được tính.' +
        (datSaiMau.length > 1 ? ' Chuyện này xảy ra ' + datSaiMau.length + ' lần.' : '') + (smNC ? ' Nhớ: cực N màu đỏ, cực S màu xanh dương. Kéo vật về rồi đưa tới đúng ô đích.' : ' Nhặt vật lên và mang tới đúng ô đích.'), { nhip: sm.nhip, id: sm.id, o: sm.o, mauVat: sm.mauVat, mauDich: sm.mauDich });
    }
    if (!sanThu && !res.thang && (hamGoc.indexOf('color') >= 0 || hamGoc.indexOf('look') >= 0)) {
      var cs = chuoiMauSai(g.dong), hamMauTen = ['color', 'look'].filter(function (t) { return hamGoc.indexOf(t) >= 0; }).map(function (t) { return t + '()'; }).join(' và ');     // hàm trả tên màu của màn: color() và / hoặc look()
      if (cs.length) {
        var c0 = cs[0], mcs = g.anhXa[c0.dongPy] || null;
        them('ten-mau-sai', 'Ở ' + viTri(mcs) + ': so sánh với "' + c0.chuoi + '", nhưng ' + hamMauTen + ' chỉ trả về các chữ thường "red", "green", "blue", "yellow" hoặc "none". ' +
          'Hai chuỗi chỉ bằng nhau khi giống từng chữ, kể cả chữ hoa chữ thường, nên phép so sánh này không khớp với màu nào.' +
          (cs.length > 1 ? ' Còn ' + (cs.length - 1) + ' chỗ tương tự.' : ''), { chuoi: c0.chuoi, cho: cho(mcs), soCho: cs.length });
      }
    }
    var quen = res.suKien.filter(function (e) { return e.ma === 'quen-wait'; });
    if (quen.length) {
      var q = quen[0], mq = g.anhXa[q.lenh[0].dongPy] || null;
      var soTay = q.lenh.filter(function (x) { return SanHoc.TAY_LENH.indexOf(x.ten) >= 0 || SanHoc.TAY_NAM_CHAM.indexOf(x.ten) >= 0 || SanHoc.TAY_NEM.indexOf(x.ten) >= 0 || SanHoc.TAY_HOI.indexOf(x.ten) >= 0 || SanHoc.TAY_SON.indexOf(x.ten) >= 0; }).length;
      var tenTay = q.lenh.some(function (x) { return SanHoc.TAY_SON.indexOf(x.ten) >= 0; }) ? 'sơn' : 'tay';       // máy sơn: "lệnh sơn"
      var loaiLenh = soTay === 0 ? 'bánh' : soTay === q.lenh.length ? tenTay : 'bánh và ' + tenTay;
      if (man.loaiRobot === 'drone') {
        // drone: lệnh nam châm làm ở nhịp kế tiếp, là một lệnh bay go_*() hay wait()
        them('quen-wait', 'Chương trình kết thúc khi còn lệnh nam châm (' +
          q.lenh.map(function (x) { return x.ten + '()'; }).join(', ') + ', bắt đầu từ ' + viTri(mq) + ') chưa có wait() hay lệnh bay go_*() theo sau, nên lệnh đó không chạy. ' +
          'Lệnh nam châm chỉ có tác dụng khi có một nhịp wait() hoặc một lệnh bay go_*() đi sau nó.', { lenh: q.lenh.map(function (x) { return x.ten; }), cho: cho(mq) });
      } else if (man.loaiRobot === 'nhen') {
        // nhện: lệnh tay làm ở nhịp đầu của bước go_* kế tiếp hoặc ở nhịp wait() kế tiếp
        var chiChan = q.lenh.every(function (x) { return SanHoc.CHAN_LENH.indexOf(x.ten) >= 0; }), lenhNhen = chiChan ? 'chân' : q.lenh.some(function (x) { return SanHoc.CHAN_LENH.indexOf(x.ten) >= 0; }) ? 'tay và chân' : 'tay';
        them('quen-wait', 'Chương trình kết thúc khi còn lệnh ' + lenhNhen + ' (' +
          q.lenh.map(function (x) { return x.ten + '()'; }).join(', ') + ', bắt đầu từ ' + viTri(mq) + ') chưa có wait() hay bước go_*() theo sau, nên những lệnh đó không chạy. ' +
          'Lệnh ' + lenhNhen + ' chỉ có tác dụng khi có một nhịp wait() hoặc một bước go_*() đi sau nó.', { lenh: q.lenh.map(function (x) { return x.ten; }), cho: cho(mq) });
      } else {
        them('quen-wait', 'Chương trình kết thúc khi còn lệnh ' + loaiLenh + ' (' +
          q.lenh.map(function (x) { return x.ten + '()'; }).join(', ') + ', bắt đầu từ ' + viTri(mq) + ') chưa có wait() theo sau, nên những lệnh đó không chạy. ' +
          'Lệnh ' + (soTay === 0 ? 'bánh' : loaiLenh) + ' chỉ có tác dụng khi nhịp kết thúc bằng wait().', { lenh: q.lenh.map(function (x) { return x.ten; }), cho: cho(mq) });
      }
    }

    // --- chạy xong mà chưa tới cờ
    if (!sanThu && !res.thang && !res.loi && man.mucTieu === 'dua-vat') {
      if (!res.dungSom) {
        var vcan = man.vatCan, tenVatCan = vcan === 'sat' ? 'vật sắt' : vcan === 'nam-cham' ? 'vật nam châm' : vcan === 'tu' ? 'vật có từ (sắt và nam châm)' : 'vật';
        var canVat = vcan === 'sat' ? res.vat.filter(function (v) { return v.chat === 'sat'; }) : vcan === 'nam-cham' ? res.vat.filter(function (v) { return v.chat === 'nam-cham'; }) : vcan === 'tu' ? res.vat.filter(function (v) { return v.chat === 'sat' || v.chat === 'nam-cham'; }) : res.vat;
        var chuaXong = canVat.filter(function (v) { return !(v.trangThai === 'dat' && res.dich.some(function (d) { return d.x === v.x && d.y === v.y && (!d.mau || d.mau === v.mau); })); }).length;
        them('chua-dua-vat', 'Chương trình chạy xong mà chưa đưa hết ' + tenVatCan + ' tới ô đích: còn ' + chuaXong + ' trong ' + canVat.length +
          ' ' + tenVatCan + ' chưa nằm yên trên đích.' + (res.dich.some(function (d) { return d.mau; }) ? ' Đích có màu chỉ tính vật cùng màu.' : '') + ' Thử chạy lại và theo dõi tay cùng xe từng nhịp.', { conLai: chuaXong, tong: res.vat.length });
      }
    } else if (!sanThu && !res.thang && !res.loi && man.mucTieu === 'to-hinh') {
      if (!res.dungSom && res.hinh) {
        var daTo = {}, thieuTo = 0, saiTo = 0, oThieu = null, oSai = null;
        (res.daSon || []).forEach(function (q) { daTo[q.x + ',' + q.y] = q.mau; });
        res.hinh.forEach(function (hang, hy) {
          hang.forEach(function (mh, hx) {
            if (!mh) return;
            var co = daTo[hx + ',' + hy];
            if (!co) { thieuTo++; if (!oThieu) oThieu = { x: hx, y: hy, mau: mh }; }
            else if (co !== mh) { saiTo++; if (!oSai) oSai = { x: hx, y: hy, mau: mh, co: co }; }
          });
        });
        them('chua-to-hinh', 'Chương trình chạy xong mà hình mờ chưa tô xong: ' +
          (thieuTo ? 'còn ' + thieuTo + ' ô chưa tô (ví dụ ô (' + oThieu.x + ', ' + oThieu.y + ') cần màu ' + TEN_MAU_VI[oThieu.mau] + ')' : '') + (thieuTo && saiTo ? ', ' : '') +
          (saiTo ? saiTo + ' ô tô sai màu (ví dụ ô (' + oSai.x + ', ' + oSai.y + ') đang màu ' + TEN_MAU_VI[oSai.co] + ', cần ' + TEN_MAU_VI[oSai.mau] + ')' : '') +
          '.' + (saiTo ? ' Ô tô sai màu thì tô lại được: chọn đúng màu bằng ink() rồi tô đè lên.' : ' Thử chạy lại và xem từng nhịp xe tô những ô nào.'), { thieu: thieuTo, saiMau: saiTo, o: oThieu || oSai });
      }
    } else if (!sanThu && !res.thang && !res.loi && man.mucTieu === 'day-thung') {
      if (!res.dungSom) {
        var chuaThung = res.thung.filter(function (t) { return !res.dich.some(function (d) { return d.x === t.x && d.y === t.y; }); }).length;
        them('chua-day-thung', 'Chương trình chạy xong mà chưa đưa hết thùng nặng tới ô đích: còn ' + chuaThung + ' trong ' + res.thung.length +
          ' thùng chưa nằm trên đích. Thử chạy lại và theo dõi xe cùng thùng từng nhịp.', { conLai: chuaThung, tong: res.thung.length });
      }
    } else if (!sanThu && !res.thang && !res.loi && man.mucTieu === 'bong-mo') {
      if (!res.dungSom) {
        var rbm = res.robot, bmo = res.bongMo;
        if (bmo) {
          var dxy = lechBongMo(bmo, rbm, res);
          if (man.loaiRobot === 'drone') dxy.loi = dxy.loi.replace(/\bXe\b/g, 'Drone').replace(/\bxe\b/g, 'drone');       // drone: nói "Drone dừng lệch…", "drone mờ"
          if (dxy.lech) them('lech-bong-mo', dxy.loi, { robot: { x: rbm.x, y: rbm.y, huong: rbm.huong }, bongMo: { x: bmo.x, y: bmo.y, huong: bmo.huong }, dx: dxy.dx, dy: dxy.dy, saiHuong: dxy.saiHuong, soVatLech: dxy.soVatLech, camLech: dxy.camLech });
          var chuaQua = (res.diQua || []).filter(function (q) { return !q.da; });
          if (chuaQua.length) them('chua-qua-diem', (man.loaiRobot === 'drone' ? 'Drone' : 'Xe') + ' chưa đi qua điểm ◆' + (chuaQua.length > 1 ? ' (còn thiếu ' + chuaQua.length + ' điểm)' : '') + ' trên đường. Chương trình phải đưa ' + (man.loaiRobot === 'drone' ? 'drone' : 'xe') + ' ghé qua mọi điểm ◆ rồi mới tới bóng mờ.', { conLai: chuaQua.length, o: { x: chuaQua[0].x, y: chuaQua[0].y } });
        }
      }
    } else if (!sanThu && !res.thang && !res.loi) {
      var r = res.robot;
      them('chua-toi-co', 'Chương trình chạy xong mà robot chưa tới cờ: robot đang ở ô (' + r.x + ', ' + r.y + ')' +
        (man.loaiRobot === 'nhen' || man.loaiRobot === 'drone' ? '' : ', quay mặt hướng ' + SanHoc.TEN_HUONG[r.huong]) +
        '. Thử chạy lại và theo dõi từng nhịp xem robot đi lệch ở đâu.', { robot: { x: r.x, y: r.y, huong: r.huong } });
    }
    // nhện chạy xong mà chưa có bước go_* nào: thường do hàm đi nhận chữ không khớp nhánh nào (viết thường thay vì hoa…)
    if (man.loaiRobot === 'nhen' && !sanThu && !res.thang && !res.loi && !res.dungSom &&
        !res.vet.some(function (e) { return e.loai === 'lenh' && /^go_/.test(e.ten); })) {
      them('nhen-khong-buoc', 'Chương trình chạy xong mà nhện chưa bước lần nào: không có lệnh go_up(), go_down(), go_left() hay go_right() nào được chạy. ' +
        'Nếu em dùng hàm để đi, kiểm tra hàm đó có thật sự gọi go_* không, và chữ em đưa vào có khớp một nhánh if / elif không (chữ hoa và chữ thường là khác nhau).', {});
    }
    // drone chạy xong mà chưa có lệnh bay nào: thường do hàm đi nhận chữ không khớp nhánh nào
    if (man.loaiRobot === 'drone' && !sanThu && !res.thang && !res.loi && !res.dungSom &&
        !res.vet.some(function (e) { return e.loai === 'lenh' && /^go_/.test(e.ten); })) {
      them('drone-khong-bay', 'Chương trình chạy xong mà drone chưa bay đi đâu: không có lệnh go_up(), go_down(), go_left() hay go_right() nào được chạy. ' +
        'Nếu em dùng hàm để bay, kiểm tra hàm đó có thật sự gọi go_* không, và chữ em đưa vào có khớp một nhánh if / elif không (chữ hoa và chữ thường là khác nhau).', {});
    }
    // cảm biến lắp ngược (man.daoChieu có 'cam'): chương trình đã hỏi cảm biến mà chưa thắng (hay đang thử ở Xưởng) → kể lại CHÍNH lần hỏi đầu tiên, một lần, mức thông tin
    if (man.daoChieu && man.daoChieu.indexOf('cam') >= 0 && (sanThu || (!res.thang && !res.loi))) {
      var docNguoc = null;
      res.vet.forEach(function (e) { if (!docNguoc && e.loai === 'lenh' && e.docCamBien && e.docCamBien.daoNguoc) docNguoc = e; });
      if (docNguoc) {
        var dn = docNguoc.docCamBien, mDn = g.anhXa[docNguoc.dongPy] || null;
        var oDo = dn.ham === 'left_clear' ? 'bên trái' : dn.ham === 'right_clear' ? 'bên phải' : 'trước mặt';
        them('cam-bien-nguoc', 'Cảm biến này lắp ngược. Ở ' + viTri(mDn) + ', ô ' + oDo + (dn.thuc ? ' đang trống mà ' : ' bị chặn mà ') + dn.ham + '() lại trả về ' + (dn.trong ? 'True' : 'False') + '.',
          { ten: dn.ham, cho: sanThu ? null : cho(mDn), thuc: dn.thuc, traVe: dn.trong, nhip: dn.nhip });       // sân thử: không tô đỏ dòng (code có thể đã đúng, chỉ là cảm biến vẫn ngược)
        cd[cd.length - 1].muc = 'thong-tin';
      }
    }
    return cd;
  }

  /* ------------------------------------------------------------ chuẩn bị bài */

  function chuanHoa(baiLam) {
    return {
      chinh: ((baiLam && baiLam.chinh) || []).slice(),
      hamCuaMan: ((baiLam && baiLam.hamCuaMan) || []).map(saoHam)
    };
  }
  function saoHam(h) { return { ten: h.ten, thamSo: (h.thamSo || []).slice(), than: (h.than || []).slice() }; }

  /** Chẩn đoán loại "thông tin": hàm của màn che hàm của em cùng tên. */
  function thongTinChe(che) {
    return che.map(function (ten) {
      return {
        ma: 'ham-man-che-ham-em', muc: 'thong-tin', ten: ten,
        loi: 'Màn này có sẵn hàm ' + ten + '() riêng, nên trong màn này hàm ' + ten + '() của em được thay bằng hàm của màn.'
      };
    });
  }

  /** Dòng đầu của mỗi khối (chương trình, thân từng hàm) mà thụt lề → Python sẽ hiểu sai khối. */
  function loiDauKhoi(baiLam, hamEmDung, chiHam) {
    var kq = [];
    function xet(ds, tenKhoi, cotInfo) {
      for (var i = 0; i < ds.length; i++) {
        if (KhungCode.laTrong(ds[i])) continue;
        if (/^\s/.test(ds[i])) {
          var c = { cot: cotInfo.cot, dong: i + 1 };
          if (cotInfo.ten) c.ten = cotInfo.ten;
          kq.push({
            ma: 'loi-thut-le', muc: 'loi', cho: c,
            loi: 'Ở ' + tenKhoi + ', dòng ' + (i + 1) + ': dòng đầu tiên không được thụt lề — chưa có khối nào cần nó.'
          });
        }
        break;
      }
    }
    hamEmDung.forEach(function (h) {
      if (chiHam !== undefined && h.ten !== chiHam) return;
      xet(h.than, 'hàm ' + h.ten, { cot: 'hamEm', ten: h.ten });
    });
    baiLam.hamCuaMan.forEach(function (h) {
      if (chiHam !== undefined && h.ten !== chiHam) return;
      xet(h.than, 'hàm ' + h.ten + ' của màn', { cot: 'hamMan', ten: h.ten });
    });
    if (chiHam === undefined) xet(baiLam.chinh, 'chương trình', { cot: 'chinh' });
    return kq;
  }

  function chuyenVet(vet, g) {
    return vet.map(function (e) {
      if (e.loai === 'lenh') {
        var mucLenh = {
          loai: 'lenh', ten: e.ten, cho: cho(g.anhXa[e.dongPy]),
          ngan: e.nganPy.map(function (d) { return cho(g.anhXa[d]); }).filter(function (x) { return x && x.cot !== 'thu'; })
        };
        if (e.aimTam !== undefined) mucLenh.aimTam = e.aimTam;
        if (e.inkMau !== undefined) mucLenh.inkMau = e.inkMau;           // ink(c): giao diện đổi màu đầu sơn ngay           // aim(n): giao diện đổi số ngắm trên xe
        if (e.docCamBien) mucLenh.docCamBien = e.docCamBien;             // đọc cảm biến: giao diện nháy cảm biến
        return mucLenh;
      }
      return e;
    });
  }

  /** Các hàm (cot + ten) xuất hiện trong vết: nơi đặt lệnh và mọi khung đang mở. */
  function hamTrongVet(vet, dung) {
    function ghi(m) { if (m && (m.cot === 'hamEm' || m.cot === 'hamMan')) dung[m.cot + ':' + m.ten] = true; }
    vet.forEach(function (e) {
      if (e.loai !== 'lenh') return;
      ghi(e.cho);
      e.ngan.forEach(ghi);
    });
  }

  /* ------------------------------------------------------------------- chấm */

  /** man.chinhCoDinh: chương trình chính luôn là bản mẫu của màn; man.khoaHamMan: các hàm của màn này luôn là bản mẫu (người chơi chỉ xem). */
  function ganCoDinh(man, baiLam) {
    if (man.chinhCoDinh === true && man.maMau && man.maMau.chinh) baiLam.chinh = man.maMau.chinh.slice();
    (man.khoaHamMan || []).forEach(function (ten) {
      var mau = ((man.maMau && man.maMau.hamCuaMan) || []).filter(function (h) { return h.ten === ten; })[0];
      if (!mau) return;
      var vi = -1;
      baiLam.hamCuaMan.forEach(function (h, i) { if (h.ten === ten && vi < 0) vi = i; });
      if (vi >= 0) baiLam.hamCuaMan[vi] = saoHam(mau); else baiLam.hamCuaMan.push(saoHam(mau));
    });
    return baiLam;
  }

  function cham(man, baiLam, hamCuaEm) {
    if (Array.isArray(man.doi)) return chamDoi(man, baiLam, hamCuaEm);
    baiLam = ganCoDinh(man, chuanHoa(baiLam));
    var cam = !!man.camHamCuaEm;
    var kho = cam ? [] : (hamCuaEm || []).map(saoHam);
    var biCamTen = cam ? tenCua(hamCuaEm || []) : [];
    var khung = Object.assign({ chinh: 10, moiHam: 10 }, man.khung || {}, { moXuong: man.moXuong !== false });
    if (man.gioiHanHam !== undefined) khung.gioiHanHam = man.gioiHanHam;       // giới hạn theo màn: số hàm của em KHÁC NHAU mà chương trình chính được gọi trực tiếp (lỗi khung qua-gioi-han-ham)

    // hàm nào được ghép: mọi hàm của màn; hàm của em chỉ khi bài làm gọi tới (trực tiếp hay gián tiếp)
    var tap = KhungCode.tapHamDung(baiLam, kho, { tatCaHamMan: true });
    var tinh = KhungCode.tapHamDung(baiLam, kho);             // chỉ những hàm với tới được từ chương trình
    var thongTin = cam ? [] : thongTinChe(tap.che);
    var bc = {
      hamMan: tenCua(baiLam.hamCuaMan), biCam: biCamTen,
      hamEm: tenCua(kho).filter(function (t) { return tap.che.indexOf(t) < 0; })
    };

    function chiTiet(dsHam) {
      return dsHam.map(function (h) { return { ten: h.ten, cot: tap.em.indexOf(h) >= 0 ? 'hamEm' : 'hamMan', o: KhungCode.soOHam(h) }; });
    }
    function dienO(kq, dsHam) {
      kq.soO = KhungCode.demO(baiLam, dsHam);
      kq.hamDaDung = tenCua(dsHam);
      kq.chiTietO = { chinh: KhungCode.soDong(baiLam.chinh), ham: chiTiet(dsHam) };
    }
    var ketQua = { thang: false, sao: 0, soO: 0, soNhip: 0, hamDaDung: [], chiTietO: null, chanDoan: [], vet: [], theoSan: [], py: '', anhXa: [], pin: null, pinToiDa: null, sac: [], bongMo: null, diQua: [] };
    var tinhDs = tinh.em.concat(tinh.man);
    dienO(ketQua, tinhDs);                                      // tạm: dò tĩnh, chạy xong sẽ thay bằng dò theo vết
    function xong() { ketQua.chanDoan = ketQua.chanDoan.concat(thongTin); return ketQua; }

    // 1. khung
    var loiKhung = KhungCode.kiemTra(khung, baiLam, man.hamGoc, tap.em);
    if (loiKhung.length) { ketQua.chanDoan = loiKhung.map(gan); return xong(); }

    // 2. ghép Python
    var g = KhungCode.ghep(baiLam, tap.em);
    ketQua.py = g.ma; ketQua.anhXa = g.anhXa;
    var loiDau = loiDauKhoi(baiLam, tap.em);
    if (loiDau.length) { ketQua.chanDoan = loiDau; return xong(); }

    // 3. chạy từng sân
    var nhieu = Array.isArray(man.san[0]);
    var dsSan = nhieu ? man.san : [man.san];
    var thangHet = true, nhipMax = 0, nhipTong = 0, gom = [], dsMa = {}, dung = {};
    dsSan.forEach(function (rows, i) {
      var bd = Array.isArray(man.batDau) ? man.batDau[i] : man.batDau;
      var lm = SanHoc.lopMauCuaSan(man, i);
      var res = SanHoc.chay({
        san: rows, batDau: bd, loaiRobot: man.loaiRobot || 'banh',
        hamGoc: man.hamGoc, nhipToiDa: man.nhipToiDa || 200, mucTieu: man.mucTieu || 'toi-co',
        mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatCan: man.vatCan, vat: lm.vatThem || undefined, roBanDau: Array.isArray(man.roBanDau) ? man.roBanDau[i] : man.roBanDau,
        cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || undefined, danToiDa: man.danToiDa,
        pin: Array.isArray(man.pin) ? man.pin[i] : man.pin,
        camBien: man.robot ? man.robot.camBien : undefined,
        bongMo: lm.bongMo || undefined, hinh: lm.hinh || undefined, sonBanDau: lm.sonBanDau || undefined, mucBanDau: man.mucBanDau, daoChieu: man.daoChieu, phanCung: SanHoc.phanCungCua(man), nguonDong: nguonDongCua(g)
      }, g.ma);
      var cd = chanDoanSan(man, res, g, false, bc);
      var vet = chuyenVet(res.vet, g);
      hamTrongVet(vet, dung);
      ketQua.theoSan.push({ thang: res.thang, soNhip: res.nhip, chanDoan: cd, vet: vet, robot: res.robot, tay: res.tay, namCham: res.namCham, nem: res.nem, sung: res.sung, vat: res.vat, vatBanDau: res.vatBanDau, dich: res.dich, thung: res.thung, thungBanDau: res.thungBanDau, mauO: res.mauO,
        cua: res.cua, nut: res.nut, bangTat: res.bangTat, cuaBanDau: res.cuaBanDau, nutBanDau: res.nutBanDau,
        pin: res.pin, pinToiDa: res.pinToiDa, sac: res.sac, bongMo: res.bongMo, diQua: res.diQua, son: res.son, daSon: res.daSon, hinh: res.hinh, sonBanDau: res.sonBanDau });
      if (!res.thang) thangHet = false;
      if (res.nhip > nhipMax) nhipMax = res.nhip;
      nhipTong += res.nhip;
      cd.forEach(function (c) {
        if (dsMa[c.ma]) return;
        dsMa[c.ma] = true;
        gom.push(nhieu ? Object.assign({}, c, { loi: 'Sân ' + (i + 1) + ': ' + c.loi, san: i }) : c);
      });
    });
    ketQua.thang = thangHet;
    ketQua.nhipMax = nhipMax; ketQua.nhipTong = nhipTong;
    ketQua.soNhip = man.nhipTheo === 'tong' ? nhipTong : nhipMax;       // nhiều sân: mặc định sân dài nhất; nhipTheo 'tong' = tổng mọi sân
    ketQua.chanDoan = gom;
    ketQua.batDau = Array.isArray(man.batDau) ? man.batDau[0] : man.batDau;
    var viec = ketQua.theoSan.filter(function (s) { return !s.thang; })[0] || ketQua.theoSan[0];
    ketQua.vet = viec.vet;
    ketQua.vatBanDau = viec.vatBanDau; ketQua.dich = viec.dich; ketQua.tay = viec.tay; ketQua.namCham = viec.namCham; ketQua.nem = viec.nem; ketQua.vat = viec.vat;
    ketQua.thungBanDau = viec.thungBanDau; ketQua.thung = viec.thung; ketQua.mauO = viec.mauO;
    ketQua.pin = viec.pin; ketQua.pinToiDa = viec.pinToiDa; ketQua.sac = viec.sac;
    ketQua.bongMo = viec.bongMo; ketQua.diQua = viec.diQua;
    ketQua.son = viec.son; ketQua.daSon = viec.daSon; ketQua.hinh = viec.hinh; ketQua.sonBanDau = viec.sonBanDau;
    ketQua.sung = viec.sung; ketQua.cua = viec.cua; ketQua.nut = viec.nut; ketQua.bangTat = viec.bangTat; ketQua.cuaBanDau = viec.cuaBanDau; ketQua.nutBanDau = viec.nutBanDau;

    // hàm thực sự được gọi (hợp mọi sân) → số ô
    var daDung = tap.em.concat(tap.man).filter(function (h) {
      return dung[(tap.em.indexOf(h) >= 0 ? 'hamEm' : 'hamMan') + ':' + h.ten];
    });
    dienO(ketQua, daDung);
    var thieu = thangHet ? thieuTaoHam(man, dung) : [];
    if (thieu.length) { thangHet = false; ketQua.thang = false; ketQua.chanDoan.unshift(loiTaoHam(thieu)); }
    if (thangHet) {
      var sao = man.sao || {}, re = sao.re;
      var laRe = !!(re && typeof man.giaLap === 'number' && man.giaLap <= re.gia);                   // màn lắp ráp: robot lắp rẻ (≤ sao.re.gia xu)
      var nguongO = laRe && re.o !== undefined ? Math.max(sao.o === undefined ? re.o : sao.o, re.o) : sao.o;
      ketQua.re = laRe; ketQua.nguongO = nguongO;
      ketQua.sao = 1 + (nguongO !== undefined && ketQua.soO <= nguongO ? 1 : 0) + ((sao.nhip !== undefined && ketQua.soNhip <= sao.nhip) || laRe ? 1 : 0);
    } else {
      var khongQua = lyDoKhongQua(man);
      if (khongQua) ketQua.chanDoan.unshift({ muc: 'loi', ma: 'lap-khong-qua', loi: 'Robot lắp thế này không qua được màn, viết code nào cũng vậy. ' + khongQua + ' Bấm Lắp lại để đổi bộ phận.' });
    }
    return xong();
  }

  /* ------------------------------------------------------------------- chấm NHIỀU ROBOT (KE-HOACH-HAI-ROBOT.md)
     man.doi = [{ batDau (một sân: ô; nhiều sân: mảng), loaiRobot?, hamGoc?, robot?, daoChieu?, pin? }, …]: phần riêng từng robot, thiếu thì lấy của màn.
     baiLam = { doi: [{ chinh }, { chinh }], hamCuaMan }: mỗi robot một chương trình chính; hàm của màn và hàm của em dùng chung.
     soO = ô mọi chương trình chính + thân các hàm thực sự được gọi (mỗi hàm một lần); soNhip = nhịp chung. Sao như một robot.
     Chẩn đoán của từng robot ghi "R1: …"; lời giống hệt nhau ở mọi robot (vd vật chưa về đích) thì ghi một lần. Kết quả có thêm ketQua.doi (vết, xe của từng robot). */
  function manCuaXe(man, i) { var o = Object.assign({}, man, man.doi[i]); delete o.doi; return o; }
  function gopChanDoan(dsTheoXe) {
    var n = dsTheoXe.length, kq = [], daGop = {};
    dsTheoXe.forEach(function (ds, i) {
      ds.forEach(function (c) {
        var khoa = c.ma + '|' + c.loi;
        var chung = n > 1 && dsTheoXe.every(function (d) { return d.some(function (x) { return x.ma + '|' + x.loi === khoa; }); });
        if (chung) { if (!daGop[khoa]) { daGop[khoa] = true; kq.push(c); } }
        else kq.push(Object.assign({}, c, { loi: 'R' + (i + 1) + ': ' + c.loi, xe: i }));
      });
    });
    return kq;
  }
  function chamDoi(man, baiLam, hamCuaEm) {
    var ds = (baiLam && baiLam.doi) || [];
    var hamCuaMan = ((baiLam && baiLam.hamCuaMan) || []).map(saoHam);
    var bais = man.doi.map(function (r, i) { return { chinh: ((ds[i] && ds[i].chinh) || []).slice(), hamCuaMan: hamCuaMan.map(saoHam) }; });
    var mans = man.doi.map(function (r, i) { return manCuaXe(man, i); });
    var cam = !!man.camHamCuaEm;
    var kho = cam ? [] : (hamCuaEm || []).map(saoHam);
    var biCamTen = cam ? tenCua(hamCuaEm || []) : [];
    var khung = Object.assign({ chinh: 10, moiHam: 10 }, man.khung || {}, { moXuong: man.moXuong !== false });
    if (man.gioiHanHam !== undefined) khung.gioiHanHam = man.gioiHanHam;
    var taps = bais.map(function (b) { return KhungCode.tapHamDung(b, kho, { tatCaHamMan: true }); });
    var tinhs = bais.map(function (b) { return KhungCode.tapHamDung(b, kho); });
    var che = [];
    taps.forEach(function (t) { t.che.forEach(function (x) { if (che.indexOf(x) < 0) che.push(x); }); });
    var thongTin = cam ? [] : thongTinChe(che);
    var bc = { hamMan: tenCua(hamCuaMan), biCam: biCamTen, hamEm: tenCua(kho).filter(function (t) { return che.indexOf(t) < 0; }) };
    function laEm(h) { return taps.some(function (t) { return t.em.indexOf(h) >= 0; }); }
    function hop(dsDs) { var kq = []; dsDs.forEach(function (d) { d.forEach(function (h) { if (kq.indexOf(h) < 0) kq.push(h); }); }); return kq; }
    function dienO(kq, dsHam) {
      var o = 0, thay = {};
      bais.forEach(function (b) { o += KhungCode.soDong(b.chinh); });
      dsHam.forEach(function (h) { if (!thay[h.ten]) { thay[h.ten] = true; o += KhungCode.soOHam(h); } });
      kq.soO = o;
      kq.hamDaDung = tenCua(dsHam);
      kq.chiTietO = { chinh: bais.map(function (b) { return KhungCode.soDong(b.chinh); }), ham: dsHam.map(function (h) { return { ten: h.ten, cot: laEm(h) ? 'hamEm' : 'hamMan', o: KhungCode.soOHam(h) }; }) };
    }
    var ketQua = { thang: false, sao: 0, soO: 0, soNhip: 0, hamDaDung: [], chiTietO: null, chanDoan: [], vet: [], doi: [], theoSan: [], py: [], anhXa: [], pin: null, pinToiDa: null, sac: [], bongMo: null, diQua: [] };
    dienO(ketQua, hop(tinhs.map(function (t) { return t.em.concat(t.man); })));     // tạm: dò tĩnh, chạy xong sẽ thay bằng dò theo vết
    function xong() { ketQua.chanDoan = ketQua.chanDoan.concat(thongTin); return ketQua; }

    // 1. khung từng robot
    var loiKhung = bais.map(function (b, i) { return KhungCode.kiemTra(khung, b, mans[i].hamGoc, taps[i].em).map(gan); });
    if (loiKhung.some(function (l) { return l.length; })) { ketQua.chanDoan = gopChanDoan(loiKhung); return xong(); }

    // 2. ghép Python từng robot
    var gs = bais.map(function (b, i) { return KhungCode.ghep(b, taps[i].em); });
    ketQua.py = gs.map(function (g) { return g.ma; }); ketQua.anhXa = gs.map(function (g) { return g.anhXa; });
    var loiDau = bais.map(function (b, i) { return loiDauKhoi(b, taps[i].em); });
    if (loiDau.some(function (l) { return l.length; })) { ketQua.chanDoan = gopChanDoan(loiDau); return xong(); }

    // 3. chạy chung từng sân
    var nhieu = Array.isArray(man.san[0]);
    var dsSan = nhieu ? man.san : [man.san];
    var thangHet = true, nhipMax = 0, nhipTong = 0, gom = [], dsMa = {}, dung = {};
    function theoSan(v, i) { return Array.isArray(v) ? v[i] : v; }
    dsSan.forEach(function (rows, si) {
      var lm = SanHoc.lopMauCuaSan(man, si);
      var res = SanHoc.chay({
        san: rows, nhipToiDa: man.nhipToiDa || 200, mucTieu: man.mucTieu || 'toi-co',
        mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatCan: man.vatCan, vat: lm.vatThem || undefined, dich: man.dich,
        cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || undefined, hinh: lm.hinh || undefined, sonBanDau: lm.sonBanDau || undefined,
        doi: mans.map(function (mi, i) {
          return {
            batDau: Array.isArray(mi.batDau) && nhieu ? mi.batDau[si] : mi.batDau, loaiRobot: mi.loaiRobot || 'banh', hamGoc: mi.hamGoc,
            camBien: mi.robot ? mi.robot.camBien : undefined, pin: theoSan(mi.pin, si), roBanDau: theoSan(mi.roBanDau, si), danToiDa: mi.danToiDa, mucBanDau: mi.mucBanDau,
            co: SanHoc.coCuaSan(mi.co, si, nhieu),
            daoChieu: mi.daoChieu, phanCung: SanHoc.phanCungCua(mi), nguonDong: nguonDongCua(gs[i])
          };
        })
      }, gs.map(function (g) { return g.ma; }));
      var cdXe = mans.map(function (mi, i) {
        var l = res.loi && (res.loi.robot === undefined || res.loi.robot === i) ? res.loi : null;
        var xongPhan = res.thang || (mi.mucTieu || 'toi-co') === 'toi-co' && res.doi[i].toiCo;        // tới cờ: phần của robot này đã xong
        return chanDoanSan(mi, Object.assign({}, res, res.doi[i], { thang: xongPhan, nhip: res.nhip, loi: l }), gs[i], false, bc);
      });
      var cd = gopChanDoan(cdXe);
      var doi = res.doi.map(function (d, i) {
        var vet = chuyenVet(d.vet, gs[i]);
        hamTrongVet(vet, dung);
        return { ten: d.ten, loaiRobot: d.loaiRobot, vet: vet, robot: d.robot, batDau: d.batDau, tay: d.tay, namCham: d.namCham, nem: d.nem, sung: d.sung, pin: d.pin, pinToiDa: d.pinToiDa, toiCo: d.toiCo };
      });
      ketQua.theoSan.push({ thang: res.thang, soNhip: res.nhip, chanDoan: cd, vet: doi[0].vet, doi: doi, robot: res.robot, tay: res.tay, namCham: res.namCham, nem: res.nem, sung: res.sung,
        vat: res.vat, vatBanDau: res.vatBanDau, dich: res.dich, thung: res.thung, thungBanDau: res.thungBanDau, mauO: res.mauO,
        cua: res.cua, nut: res.nut, bangTat: res.bangTat, cuaBanDau: res.cuaBanDau, nutBanDau: res.nutBanDau,
        pin: res.pin, pinToiDa: res.pinToiDa, sac: res.sac, bongMo: null, diQua: [], daSon: res.daSon, hinh: res.hinh });
      if (!res.thang) thangHet = false;
      if (res.nhip > nhipMax) nhipMax = res.nhip;
      nhipTong += res.nhip;
      cd.forEach(function (c) {
        var k = c.ma + '|' + (c.xe === undefined ? '' : c.xe);
        if (dsMa[k]) return;
        dsMa[k] = true;
        gom.push(nhieu ? Object.assign({}, c, { loi: 'Sân ' + (si + 1) + ': ' + c.loi, san: si }) : c);
      });
    });
    ketQua.thang = thangHet;
    ketQua.nhipMax = nhipMax; ketQua.nhipTong = nhipTong;
    ketQua.soNhip = man.nhipTheo === 'tong' ? nhipTong : nhipMax;
    ketQua.chanDoan = gom;
    ketQua.batDau = mans.map(function (mi) { return Array.isArray(mi.batDau) && nhieu ? mi.batDau[0] : mi.batDau; });
    var viec = ketQua.theoSan.filter(function (s) { return !s.thang; })[0] || ketQua.theoSan[0];
    ['vet', 'doi', 'vatBanDau', 'dich', 'tay', 'namCham', 'nem', 'vat', 'thungBanDau', 'thung', 'mauO', 'pin', 'pinToiDa', 'sac', 'sung', 'cua', 'nut', 'bangTat', 'cuaBanDau', 'nutBanDau', 'daSon', 'hinh']
      .forEach(function (k) { ketQua[k] = viec[k]; });

    // hàm thực sự được gọi (hợp mọi robot, mọi sân) → số ô
    var daDung = hop(taps.map(function (t) { return t.em.concat(t.man); })).filter(function (h) {
      return dung[(laEm(h) ? 'hamEm' : 'hamMan') + ':' + h.ten];
    });
    dienO(ketQua, daDung);
    var thieuDoi = thangHet ? thieuTaoHam(man, dung) : [];
    if (thieuDoi.length) { thangHet = false; ketQua.thang = false; ketQua.chanDoan.unshift(loiTaoHam(thieuDoi)); }
    if (thangHet) {
      var sao = man.sao || {};
      ketQua.re = false; ketQua.nguongO = sao.o;
      ketQua.sao = 1 + (sao.o !== undefined && ketQua.soO <= sao.o ? 1 : 0) + (sao.nhip !== undefined && ketQua.soNhip <= sao.nhip ? 1 : 0);
    }
    return xong();
  }

  /** man.taoHam: màn dạy TẠO các hàm đó. Robot tới đích mà chương trình không gọi hàm của em mang đúng tên đó thì CHƯA thắng
   *  (22/10: 4.6 qua được bằng cách gói việc khác vào hàm rồi viết thẳng việc thả, màn sau gọi drop() thì lỗi; 23/10: áp cho MỌI màn có taoHam,
   *  trước đây chỉ màn bật batBuocTaoHam nên 2.9, 6.6… vẫn qua được mà kho không có hàm màn sau cần). Màn khai batBuocTaoHam: false thì bỏ kiểm. Trả về tên hàm còn thiếu. */
  function thieuTaoHam(man, dung) {
    if (man.camHamCuaEm || man.batBuocTaoHam === false) return [];
    return (man.taoHam || []).filter(function (t) { return !dung['hamEm:' + t]; });
  }
  function loiTaoHam(thieu) {
    var ds = thieu.map(function (t) { return t + '()'; }).join(', ');
    return { muc: 'loi', ma: 'chua-tao-ham', ham: thieu.slice(), loi: 'Robot làm xong việc rồi, nhưng màn này dạy tạo hàm ' + ds + '. Chương trình của em chưa gọi ' + ds + ': tạo hàm đó ở Xưởng hàm rồi dùng nó trong chương trình nhé.' };
  }

  /** Hàm của em đã bị SỬA HỎNG cho màn `man` (23/10: sửa nhầm hàm cũ ở màn cho sửa, sang màn sau hàm đó bị khóa chỉ xem nên không giải được).
   *  kho: kho thật của người chơi · thamChieu: kho tham chiếu lúc tới màn (ManHoc.khoThamChieu) · khoa: tên các hàm màn này khóa (TP.khoaKhay).
   *  Lời giải mẫu chạy trên kho thật mà không thắng, còn thay các hàm khóa đang khác bản tham chiếu bằng bản đó thì thắng → tên các hàm đã thay mà lời giải dùng tới.
   *  Hàm em viết khác mà vẫn chạy đúng thì không tính. Không chắc (kho thiếu hàm khác, màn lắp ráp, màn cấm hàm của em…) → []. */
  function hamHong(man, kho, thamChieu, khoa) {
    if (!man || !man.loiGiai || man.camHamCuaEm || man.moXuong === false || man.lapRap) return [];
    var ref = {}, giong = function (a, b) { return JSON.stringify([a.thamSo || [], a.than || []]) === JSON.stringify([b.thamSo || [], b.than || []]); };
    (thamChieu || []).forEach(function (f) { ref[f.ten] = f; });
    kho = kho || [];
    var khac = kho.filter(function (f) { return ref[f.ten] && (khoa || []).indexOf(f.ten) >= 0 && !giong(f, ref[f.ten]); }).map(function (f) { return f.ten; });
    if (!khac.length) return [];
    var moi = man.loiGiai.hamCuaEmMoi || [];
    function chay(ds) {
      var k = ds.map(saoHam);
      moi.forEach(function (f) { var i = tenCua(k).indexOf(f.ten); if (i >= 0) k[i] = saoHam(f); else k.push(saoHam(f)); });
      try { return cham(man, man.loiGiai, k); } catch (e) { return null; }
    }
    var r = chay(kho);
    if (!r || r.thang) return [];
    var r2 = chay(kho.map(function (f) { return khac.indexOf(f.ten) >= 0 ? ref[f.ten] : f; }));
    if (!r2 || !r2.thang) return [];
    var dung = khac.filter(function (t) { return (r2.hamDaDung || []).indexOf(t) >= 0; });
    return dung.length ? dung : khac;
  }

  function gan(c) { if (!c.muc) c.muc = 'loi'; return c; }

  /** Cho lõi biết một dòng Python nằm ở đâu: 'chinh' | 'hamMan' | 'hamEm' | 'thu' (khay và phần cứng: xem san-hoc.js). */
  function nguonDongCua(g) { return function (dongPy) { var m = g.anhXa[dongPy]; return m ? m.cot : null; }; }

  /** "Sân thử" của Xưởng hàm: xem mô tả ở đầu tệp. */
  function thuHam(man, baiLam, tenHam, hamCuaEm, tuyChon) {
    tuyChon = tuyChon || {};
    baiLam = chuanHoa(baiLam);
    var cam = !!man.camHamCuaEm;
    var kho = cam ? [] : (hamCuaEm || []).map(saoHam);
    var st = chuanSanThu(tuyChon.sanThu || SAN_THU_MAC_DINH);
    var ketQua = { vet: [], robot: Object.assign({}, st.batDau), batDau: Object.assign({}, st.batDau), sanThu: st, soNhip: 0, chanDoan: [], py: '', anhXa: [], tay: null, namCham: null, nem: null, sung: null, vat: [], thung: [], cua: [], nut: [], bangTat: [], pin: null, pinToiDa: null, sac: [] };
    var khung = Object.assign({ chinh: 10, moiHam: 10 }, man.khung || {}, { moXuong: man.moXuong !== false });

    var tap = KhungCode.tapHamDung(baiLam, kho, { goc: [tenHam] });
    var thongTin = cam ? [] : thongTinChe(tap.che);
    var bc = {
      hamMan: tenCua(baiLam.hamCuaMan), biCam: cam ? tenCua(hamCuaEm || []) : [],
      hamEm: tenCua(kho).filter(function (t) { return tap.che.indexOf(t) < 0; })
    };
    function xong() { ketQua.chanDoan = ketQua.chanDoan.concat(thongTin); return ketQua; }

    var rieng = { chinh: [], hamCuaMan: tap.man };
    var loiKhung = KhungCode.kiemTra(khung, rieng, man.hamGoc, tap.em).filter(function (e) {
      return e.ma !== 'tran-khung' || e.ten === tenHam;
    });
    if (loiKhung.length) { ketQua.chanDoan = loiKhung.map(gan); return xong(); }

    var doiSo = (tuyChon.doiSo || []).map(String);
    rieng.chinh = [tenHam + '(' + doiSo.join(', ') + ')'];
    var g = KhungCode.ghep(rieng, tap.em);
    g.anhXa[g.anhXa.length - 1] = { cot: 'thu', dong: 1 };
    ketQua.py = g.ma; ketQua.anhXa = g.anhXa;
    var loiDau = loiDauKhoi({ chinh: [], hamCuaMan: tap.man }, tap.em, tenHam);
    if (loiDau.length) { ketQua.chanDoan = loiDau; return xong(); }

    var nhipToiDa = tuyChon.nhipToiDa || 100;
    var res = SanHoc.chay({
      san: hangSanThu(st), batDau: st.batDau, loaiRobot: man.loaiRobot || 'banh',
      hamGoc: man.hamGoc, nhipToiDa: nhipToiDa, vat: st.vat, thung: st.thung, mau: lopMauSanThu(st), roBanDau: st.ro === true ? true : undefined,
      danToiDa: man.danToiDa, camBien: man.robot ? man.robot.camBien : undefined, mucBanDau: man.mucBanDau,
      daoChieu: man.daoChieu, phanCung: SanHoc.phanCungCua(man), nguonDong: nguonDongCua(g),
      pin: man.loaiRobot === 'drone' ? (st.pin !== undefined ? st.pin : (Array.isArray(man.pin) ? man.pin[0] : man.pin)) : undefined
    }, g.ma);
    res.nhipToiDa = nhipToiDa;
    ketQua.chanDoan = chanDoanSan(man, res, g, true, bc);
    ketQua.vet = chuyenVet(res.vet, g);
    ketQua.robot = res.robot;
    ketQua.soNhip = res.nhip;
    ketQua.tay = res.tay; ketQua.namCham = res.namCham; ketQua.nem = res.nem; ketQua.sung = res.sung; ketQua.vat = res.vat; ketQua.thung = res.thung;
    ketQua.cua = res.cua; ketQua.nut = res.nut; ketQua.bangTat = res.bangTat;
    ketQua.pin = res.pin; ketQua.pinToiDa = res.pinToiDa; ketQua.sac = res.sac;
    ketQua.son = res.son; ketQua.daSon = res.daSon;
    return xong();
  }

  var API = { cham: cham, thuHam: thuHam, hamHong: hamHong, chuanSanThu: chuanSanThu, hangSanThu: hangSanThu, SAN_THU_MAC_DINH: SAN_THU_MAC_DINH };
  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ChamHoc = API;
})();
