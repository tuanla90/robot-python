/* ============================================================================
   man-che-nhen.js — "Robot Chấn Hưng": CHƯƠNG `che-nhen` · CHẾ LỆNH NHỆN (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5b.1), làm 15/10.
   Chương thứ 14 (ngay sau Thân nhện, man-nhen.js). Robot là NHỆN: robot { than: 'nhen', tay: null } (tay 'kep' ở che-nhen.6). Xưởng hàm mở, được dùng hàm của em.
   Luật thiết kế (như che-xe): lệnh gốc chỉ đổi MỘT trạng thái (co / duỗi chân, một bước); động tác hay (bò qua gầm, nhảy hố, nhảy liên tiếp…) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (máy kiểm kiem-che-nhen.mjs chạy từng cách).
   Màn dùng HÀM CỦA MÀN (7, 8, 9: hàm chỉ đúng cho màn đó, không vào kho) khai cách khác bằng `{ moTa, baiLam: { chinh, hamCuaMan } }`.
   Mục tiêu `bong-mo` với bongMo.chan: nhện phải đứng đúng ô VÀ chân phải ở đúng tư thế (duỗi, hay co ở màn 9) như nhện mờ. `chinhCoDinh: true` — chương trình chính khóa; 3 và 10 để người chơi tự viết.
   LUẬT CHÂN NHỆN (san-hoc.js): crouch() / stand() chỉ ra lệnh, làm ở nhịp đầu của bước go_*() kế tiếp hay nhịp wait() kế tiếp (mỗi nhịp một lệnh chân). Gầm thấp n chỉ nhện đang co chui qua được;
   hố u bước vào là rơi; NHẢY = đang co mà stand() ngay trước một bước go_*() thì bật qua MỘT ô. stand() cùng nhịp đầu với bước đi lúc đang co LUÔN là cú nhảy.

   Hàm của em MỚI (tên cốt truyện, khóa trong kho). go(d) và walk(path) lấy từ chương nhen:
     che-nhen.1 crawl(d)       = crouch(), go(d), go(d), stand(), wait()          bò qua gầm một ô theo hướng d rồi duỗi chân lại (5 nhịp)
     che-nhen.2 jump(d)        = crouch(), wait(), stand(), go(d)                  nhảy qua một ô theo hướng d, đáp xuống ô kế (3 nhịp)
     che-nhen.4 leap(path)     = for c in path: jump(c)                            nhảy liên tiếp theo từng chữ của path
     che-nhen.5 crawl_jump(d)  = crouch(), go(d), go(d), stand(), go(d)            bò qua gầm rồi nhảy luôn qua hố ngay sau gầm (6 nhịp, nhanh hơn crawl rồi jump 2 nhịp)
     che-nhen.6 bring(path)    = pick(), walk(path), drop()                        nhặt vật, đi theo path, đặt vật xuống
   HÀM CỦA MÀN (15/10: không vào kho, `maMau.hamCuaMan`, không `taoHam`):
     che-nhen.7 go_in()        khóa, xem được: walk("RR"), crawl("D"), jump("R"); come_back() thân ban đầu `pass`, lời giải jump("L"), crawl("U"), walk("LL") (đi ngược: đảo thứ tự và hướng)
     che-nhen.8 fixed_jump(d)  thân ban đầu = jump(d) cũ (crouch, wait, stand, go(d)), chạy sai vì chân đấu ngược; lời giải stand(), wait(), crouch(), go(d)
     che-nhen.9 crawl_safe(d)  thân ban đầu = crawl(d) cũ (có stand()), lỗi vì khớp duỗi chân kẹt (phanCung không có stand); lời giải bỏ stand() và wait()

   Sao: sao.nhip = nhịp chạy thật của lời giải cách 1; máy kiểm kiem-hoc.mjs dò BFS (do-duong-nhen.mjs / do-duong-che-nhen.mjs) rằng không có đường tắt (BFS = sao.nhip, hoặc ≤ khi nhipTheoLoiGiai).
   sao.o = ô chương trình + thân các hàm thực sự được gọi (kể cả go 8 ô, walk 2 ô, hàm lồng nhau).
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHAN_DU = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait'];
  var CHAN_KET = ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'wait'];                 // 9: khớp duỗi chân kẹt, không có stand
  var CHAN_TAY = CHAN_DU.concat(['arm_down', 'arm_up', 'grab', 'release']);                     // 6: nhện gắn tay kẹp

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_CRAWL = ['crouch()', 'go(d)', 'go(d)', 'stand()', 'wait()'];
  var T_JUMP = ['crouch()', 'wait()', 'stand()', 'go(d)'];
  var T_LEAP = ['for c in path:', '    jump(c)'];
  var T_CRAWL_JUMP = ['crouch()', 'go(d)', 'go(d)', 'stand()', 'go(d)'];
  var T_BRING = ['pick()', 'walk(path)', 'drop()'];
  function hCrawl(than) { return H('crawl', ['d'], than || T_CRAWL); }
  function hJump(than) { return H('jump', ['d'], than || T_JUMP); }
  function hLeap(than) { return H('leap', ['path'], than || T_LEAP); }
  function hCrawlJump(than) { return H('crawl_jump', ['d'], than || T_CRAWL_JUMP); }
  function hBring(than) { return H('bring', ['path'], than || T_BRING); }

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'che-nhen';
    m.loaiRobot = 'nhen';
    m.robot = { than: 'nhen', tay: m.tay || null };
    delete m.tay;
    m.hamGoc = m.hamGoc || CHAN_DU;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if'];
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    else m.mucTieu = 'bong-mo';
    return ManHoc.chuanHoa(m);
  }

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['crawl("R")'];
  var C_2 = ['jump("R")'];
  var C_4 = ['leap("RRD")'];
  var C_5 = ['crawl_jump("R")'];
  var C_6 = ['walk("DRRDDDR")', 'bring("DLL")'];
  var C_7 = ['go_in()', 'come_back()'];
  var C_8 = ['fixed_jump("R")', 'fixed_jump("R")'];
  var C_9 = ['crawl_safe("R")', 'crawl_safe("R")'];
  // 3 (người chơi tự viết): đi hai ô, chui gầm xuống, nhảy qua hố sang phải
  var L_3 = ['walk("RR")', 'crawl("D")', 'jump("R")'];
  // 10 (người chơi tự viết): nhảy hai phiến đá, đi vòng xuống, chui gầm nhảy hố, đi nốt tới cờ
  var L_10 = ['leap("RR")', 'walk("RRDDL")', 'crawl_jump("L")', 'walk("LDD")'];

  // hàm của màn
  var T_GO_IN = ['crawl("D")', 'jump("R")'];
  function hGoIn() { return H('go_in', [], T_GO_IN); }
  var T_COME_BACK = ['jump("L")', 'crawl("U")'];
  function hComeBack(than) { return H('come_back', [], than || T_COME_BACK); }
  var T_FIXED_JUMP = ['stand()', 'wait()', 'crouch()', 'go(d)'];
  var T_FIXED_JUMP_CU = ['crouch()', 'wait()', 'stand()', 'go(d)'];                  // thân ban đầu của fixed_jump(d): jump cũ, chạy sai vì chân đấu ngược
  function hFixedJump(than) { return H('fixed_jump', ['d'], than || T_FIXED_JUMP_CU); }
  var T_CRAWL_SAFE = ['crouch()', 'go(d)', 'go(d)'];
  var T_CRAWL_SAFE_CU = ['crouch()', 'go(d)', 'go(d)', 'stand()', 'wait()'];          // thân ban đầu của crawl_safe(d): crawl cũ, lỗi vì khớp duỗi chân kẹt
  function hCrawlSafe(than) { return H('crawl_safe', ['d'], than || T_CRAWL_SAFE_CU); }

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Bò qua gầm', hang: 'lam-quen',
      hamCuaEmCan: ['go'], taoHam: ['crawl'],
      deBai: 'Chương trình chính chỉ gọi crawl("R"). Em tự chế lệnh crawl(d): nhện chui qua gầm theo hướng d rồi đứng đúng chỗ bóng mờ, chân duỗi thẳng như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi crawl("R"). Mở Xưởng hàm, tạo crawl(d) rồi bấm Chạy.',
      san: ['####', '.n..', '####'],
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 0, chan: 'dung' },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 14, nhip: 5 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [hCrawl()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [hCrawl(nhieu(['# bò qua gầm'], T_CRAWL))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng go_right(), không gọi go(d)', hamCuaEmMoi: [hCrawl(['crouch()', 'go_right()', 'go_right()', 'stand()', 'wait()'])] },
        { moTa: 'Hai bước đi nằm trong một vòng for', hamCuaEmMoi: [hCrawl(['crouch()', 'for i in range(2):', '    go(d)', 'stand()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi crawl("R") mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên crouch(): nhện đứng thẳng nên đâm vào gầm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hCrawl(['go(d)', 'go(d)', 'stand()', 'wait()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Chui qua rồi quên duỗi chân: nhện tới nơi nhưng chân còn co', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hCrawl(['crouch()', 'go(d)', 'go(d)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'stand() mà quên wait(): lệnh chân chưa kịp chạy', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hCrawl(['crouch()', 'go(d)', 'go(d)', 'stand()'])], phaiCoMa: ['quen-wait', 'lech-bong-mo'] },
        { moTa: 'Duỗi chân ngay trong gầm: đầu đụng trần nên chân vẫn co', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hCrawl(['crouch()', 'go(d)', 'stand()', 'wait()', 'go(d)'])], phaiCoMa: ['dau-dung-tran', 'lech-bong-mo'] }
      ],
      goiY: ['Nhện phải đi qua hai ô: ô gầm rồi ô sau nó. Chân cần co lúc nào và duỗi lúc nào?',
        'Bóng mờ có chân duỗi thẳng. Lệnh chân chỉ chạy khi có một nhịp, nhớ wait().']
    }),

    man({
      so: 2, ten: 'Nhảy qua hố', hang: 'lam-quen',
      hamCuaEmCan: ['go'], taoHam: ['jump'],
      deBai: 'Chương trình chính chỉ gọi jump("R"). Em tự chế lệnh jump(d): nhện nhảy qua hố theo hướng d rồi đứng đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi jump("R"). Mở Xưởng hàm, tạo jump(d) rồi bấm Chạy.',
      san: ['####', '.u..', '####'],
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 0, chan: 'dung' },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 13, nhip: 3 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [hJump()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [hJump(nhieu(['# nhảy qua một ô'], T_JUMP))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng go_right(), không gọi go(d)', hamCuaEmMoi: [hJump(['crouch()', 'wait()', 'stand()', 'go_right()'])] },
        { moTa: 'Bước nhảy gọi walk(d) (đã chế ở chương trước)', hamCuaEmMoi: [hJump(['crouch()', 'wait()', 'stand()', 'walk(d)'])] }
      ],
      loiSai: [
        { moTa: 'Gọi jump("R") mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên crouch(): stand() lúc chân đang duỗi không làm nhện nhảy', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hJump(['wait()', 'stand()', 'go(d)'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'crouch() rồi stand() liền nhau: hai lệnh chân cùng một nhịp nên stand() bị bỏ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hJump(['crouch()', 'stand()', 'go(d)'])], phaiCoMa: ['chan-goi-lai', 'roi-ho'] },
        { moTa: 'Co chân rồi đi thường: nhện bước thẳng vào hố', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hJump(['crouch()', 'go(d)'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'Duỗi chân sau bước đi thay vì trước: nhện đã rơi rồi', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hJump(['crouch()', 'wait()', 'go(d)', 'stand()', 'wait()'])], phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['Nhện cần co chân trước, rồi duỗi chân đúng lúc bước tới hố.',
        'Hai lệnh chân không đứng chung một nhịp: chen một lệnh vào giữa.']
    }),

    man({
      so: 3, ten: 'Hang động', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: ['go', 'walk', 'crawl', 'jump'],
      deBai: 'Hang động có một gầm thấp và một cái hố. Tự viết chương trình chính, dùng walk(), crawl() và jump() em đã chế để đưa nhện tới cờ; chương trình chỉ có 10 ô.',
      san: ['...##', '##n##', '...uF'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 22, nhip: 12 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn đầu chia làm hai lần gọi walk()',
        baiLam: { chinh: nhieu(['walk("R")', 'walk("R")'], L_3.slice(1)) }
      },
      congThucKhac: [
        { moTa: 'crawl() và jump() viết thẳng lệnh gốc, không gọi go(d)', hamCuaEmMoi: [hCrawl(['crouch()', 'go_down()', 'go_down()', 'stand()', 'wait()']), hJump(['crouch()', 'wait()', 'stand()', 'go_right()'])] }
      ],
      loiSai: [
        { moTa: 'Đi thẳng xuống, không co chân: nhện đâm vào gầm', baiLam: { chinh: ['walk("RRDD")'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Qua gầm rồi đi thẳng, không nhảy: nhện rơi xuống hố', baiLam: { chinh: ['walk("RR")', 'crawl("D")', 'walk("R")'] }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Chui qua gầm rồi dừng, chưa nhảy hố tới cờ', baiLam: { chinh: ['walk("RR")', 'crawl("D")'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng hàm đã chế, viết từng lệnh gốc: quá 10 ô', baiLam: { chinh: ['go_right()', 'go_right()', 'crouch()', 'go_down()', 'go_down()', 'stand()', 'wait()', 'crouch()', 'wait()', 'stand()', 'go_right()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đi hết đoạn đầu, rồi gầm là việc của crawl(), hố là việc của jump(). Mỗi lệnh nhận một hướng.',
        'Chui xuống thì hướng là "D", nhảy sang phải thì hướng là "R".']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Đá lót đường', hang: 'luyen',
      hamCuaEmCan: ['go', 'jump'], taoHam: ['leap'],
      deBai: 'Mặt đất đầy hố nên nhện phải nhảy từ phiến đá này sang phiến đá kia. Chương trình chính gọi leap("RRD"): em chế leap(path) để nhện nhảy liên tiếp theo từng chữ của path tới chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi leap("RRD"). Mở Xưởng hàm, tạo leap(path) rồi bấm Chạy.',
      san: ['.u.u.', '####u', '####.'],
      batDau: { x: 0, y: 0, huong: 0 },
      bongMo: { x: 4, y: 2, huong: 0, chan: 'dung' },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 15, nhip: 9 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [hLeap()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [hLeap(nhieu(['# nhảy từng chữ'], T_LEAP))]
      },
      congThucKhac: [
        { moTa: 'Không gọi jump(): mỗi chữ co chân, chờ, duỗi chân rồi bước', hamCuaEmMoi: [hLeap(['for c in path:', '    crouch()', '    wait()', '    stand()', '    go(c)'])] },
        { moTa: 'Đặt tên khác cho chữ đang nhảy', hamCuaEmMoi: [hLeap(['for ch in path:', '    jump(ch)'])] }
      ],
      loiSai: [
        { moTa: 'Gọi leap("RRD") mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đưa cả chuỗi vào một lần nhảy: không nhánh nào khớp nên nhện không đi', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hLeap(['jump(path)'])], phaiCoMa: ['nhen-khong-buoc', 'lech-bong-mo'] },
        { moTa: 'Mỗi lần nhảy đều sang phải, bỏ qua chữ D: nhảy lần ba ra ngoài sân', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hLeap(['for c in path:', '    jump("R")'])], phaiCoMa: ['nhay-hut', 'lech-bong-mo'] },
        { moTa: 'Nhảy cứng hai lần sang phải, bỏ qua chữ D: nhện dừng giữa đường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hLeap(['jump("R")', 'jump("R")'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Mỗi chữ trong path là một cú nhảy theo hướng đó. Vòng for đi qua từng chữ.',
        'Cú nhảy đã có sẵn trong hàm jump(d) của em.']
    }),

    man({
      so: 5, ten: 'Bò rồi nhảy', hang: 'luyen',
      hamCuaEmCan: ['go', 'crawl', 'jump'], taoHam: ['crawl_jump'],
      deBai: 'Ngay sau gầm là một cái hố. Chương trình chính gọi crawl_jump("R"): em chế lệnh này để nhện chui qua gầm rồi nhảy qua hố, đúng chỗ bóng mờ. Nhanh hơn crawl() rồi jump() thì được thêm sao.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi crawl_jump("R"). Mở Xưởng hàm, tạo crawl_jump(d) rồi bấm Chạy.',
      san: ['#####', '.n.u.', '#####'],
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 4, y: 1, huong: 0, chan: 'dung' },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 14, nhip: 6 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [hCrawlJump()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [hCrawlJump(nhieu(['# bò rồi nhảy'], T_CRAWL_JUMP))]
      },
      congThucKhac: [
        { moTa: 'Gọi crawl() rồi jump() (chậm hơn hai nhịp nhưng vẫn tới)', hamCuaEmMoi: [hCrawlJump(['crawl(d)', 'jump(d)'])] },
        { moTa: 'Viết thẳng go_right(), không gọi go(d)', hamCuaEmMoi: [hCrawlJump(['crouch()', 'go_right()', 'go_right()', 'stand()', 'go_right()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi crawl_jump("R") mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên stand(): nhện còn đang co và đi thẳng vào hố', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hCrawlJump(['crouch()', 'go(d)', 'go(d)', 'go(d)'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'Duỗi chân ngay trong gầm: đầu đụng trần nên không nhảy được', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hCrawlJump(['crouch()', 'go(d)', 'stand()', 'go(d)', 'go(d)'])], phaiCoMa: ['dau-dung-tran', 'roi-ho'] },
        { moTa: 'Chui qua gầm rồi dừng, chưa nhảy: nhện chưa tới chỗ bóng mờ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hCrawlJump(['crouch()', 'go(d)', 'go(d)', 'stand()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Chui ra khỏi gầm thì chân vẫn đang co. Có cần co chân thêm một lần nữa trước khi nhảy không?',
        'stand() đứng ngay trước một bước đi, khi chân đang co, chính là cú nhảy.']
    }),

    man({
      so: 6, ten: 'Nhện giao hàng', hang: 'luyen', tay: 'kep', hamGoc: CHAN_TAY, nhipTheoLoiGiai: true,
      hamCuaEmCan: ['go', 'walk', 'pick', 'drop'], taoHam: ['bring'],
      deBai: 'Nhện có tay kẹp gắn phía trên đầu. Chương trình chính đưa nhện tới chỗ dưới vật rồi gọi bring("DLL"). Em chế bring(path): nhặt vật, đi theo path rồi đặt vật xuống đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: walk("DRRDDDR") rồi bring("DLL"). Mở Xưởng hàm, tạo bring(path) rồi bấm Chạy.',
      san: ['.###', 'S..#', '##.#', '##.o', '#...', '#...'],
      batDau: { x: 0, y: 0, huong: 0 },
      bongMo: { x: 1, y: 5, huong: 0, vat: [{ x: 1, y: 4 }], chan: 'dung' },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 25, nhip: 24 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [hBring()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [hBring(nhieu(['# nhặt, mang, đặt'], T_BRING))]
      },
      congThucKhac: [
        { moTa: 'Không gọi pick() và drop(): viết thẳng lệnh tay', hamCuaEmMoi: [hBring(['arm_down()', 'grab()', 'wait()', 'arm_up()', 'walk(path)', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'])] },
        { moTa: 'Đi bằng vòng for c in path: go(c) thay cho walk(path)', hamCuaEmMoi: [hBring(['pick()', 'for c in path:', '    go(c)', 'drop()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi bring("DLL") mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên drop(): vật vẫn nằm trên tay', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hBring(['pick()', 'walk(path)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên pick(): nhện đi tay không, vật vẫn ở chỗ cũ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hBring(['walk(path)', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi trước rồi mới nhặt: nhện nhặt ở chỗ sai', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [hBring(['walk(path)', 'pick()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Việc của bring(): nhặt vật, mang đi theo path, đặt xuống. Nhặt và đặt đã có pick() và drop().',
        'Đi theo path là việc của walk(path).']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the',
      hamCuaEmCan: ['go', 'walk', 'crawl', 'jump'],
      deBai: 'Hàm go_in() của màn đưa nhện vào hang và đã bị khóa. Em chế come_back() để nhện đi ngược về đúng chỗ ban đầu, chân duỗi như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_in() rồi come_back(). Hàm come_back() của màn còn trống: mở Xưởng hàm và viết thân hàm.',
      san: ['...', 'n##', '.u.'],
      batDau: { x: 0, y: 0, huong: 0 },
      bongMo: { x: 0, y: 0, huong: 0, chan: 'dung' },
      chinhCoDinh: true, khoaHamMan: ['go_in'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), H('come_back', [], ['pass'])] },
      sao: { o: 23, nhip: 16 }, nhipTheoLoiGiai: true,
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), hComeBack()] },
      loiGiaiKhac: {
        moTa: 'Cùng đường về, thêm một dòng chú thích',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), hComeBack(nhieu(['# đi ngược go_in()'], T_COME_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Đoạn chui lên viết bằng lệnh gốc', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), hComeBack(['jump("L")', 'crouch()', 'go_up()', 'go_up()', 'stand()', 'wait()'])] } },
        { moTa: 'Về bằng lệnh gốc, không gọi crawl() và jump()', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), hComeBack(['crouch()', 'wait()', 'stand()', 'go_left()', 'crouch()', 'go_up()', 'go_up()', 'stand()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: nhện đứng yên ở cuối go_in(), chưa về', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), H('come_back', [], ['pass'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi lại đúng đường cũ thay vì đi ngược: nhện đâm vào tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), hComeBack(T_GO_IN)] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Đảo hướng nhưng giữ thứ tự cũ: nhện chui lên đâm tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), hComeBack(['crawl("U")', 'jump("L")'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Đảo thứ tự nhưng giữ hướng cũ: nhện nhảy sang phải ra ngoài sân', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn(), hComeBack(['jump("R")', 'crawl("D")'])] }, phaiCoMa: ['nhay-hut', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [hGoIn()] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Đi ngược lại: đoạn cuối của go_in() phải làm đầu tiên, và mỗi hướng đổi sang hướng ngược lại.',
        'Nhảy sang phải thì nhảy lại sang trái; chui xuống thì chui lên.']
    }),

    man({
      so: 8, ten: 'Chân lắp ngược', hang: 'bien-the',
      hamCuaEmCan: ['go'],
      daoChieu: ['chan'], canhBao: 'Dây chân đấu ngược',
      deBai: 'Dây điều khiển chân nhện bị đấu ngược: crouch() làm chân duỗi, còn stand() làm chân co. Hàm fixed_jump(d) của màn đang nhảy sai nên nhện rơi xuống hố. Sửa nó để nhện nhảy qua cả hai hố.',
      veMaMau: 'Chương trình chính bị khóa: fixed_jump("R") hai lần. Hàm fixed_jump(d) của màn đang là cú nhảy cũ: sửa thân hàm trong Xưởng.',
      san: ['#####', '.u.u.', '#####'],
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 4, y: 1, huong: 0, chan: 'dung' },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [hFixedJump()] },
      sao: { o: 14, nhip: 6 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [hFixedJump(T_FIXED_JUMP)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [hFixedJump(nhieu(['# dây chân đấu ngược'], T_FIXED_JUMP))] }
      },
      congThucKhac: [
        { moTa: 'Chờ thêm một nhịp (chậm hơn nhưng vẫn nhảy được)', baiLam: { chinh: C_8.slice(), hamCuaMan: [hFixedJump(['stand()', 'wait()', 'wait()', 'crouch()', 'go(d)'])] } },
        { moTa: 'Viết thẳng go_right(), không gọi go(d)', baiLam: { chinh: C_8.slice(), hamCuaMan: [hFixedJump(['stand()', 'wait()', 'crouch()', 'go_right()'])] } }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: dây ngược nên cú nhảy cũ thành bước thường vào hố', baiLam: { chinh: C_8.slice(), hamCuaMan: [hFixedJump()] }, phaiCoMa: ['roi-ho'] },
        { moTa: 'Bỏ hết lệnh chân: nhện bước thẳng vào hố', baiLam: { chinh: C_8.slice(), hamCuaMan: [hFixedJump(['go(d)'])] }, phaiCoMa: ['roi-ho'] },
        { moTa: 'Đổi chỗ hai lệnh nhưng bỏ wait(): hai lệnh chân cùng một nhịp', baiLam: { chinh: C_8.slice(), hamCuaMan: [hFixedJump(['stand()', 'crouch()', 'go(d)'])] }, phaiCoMa: ['chan-goi-lai', 'roi-ho'] },
        { moTa: 'Xóa mất hàm fixed_jump() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_8.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Dây ngược nên lệnh nào làm việc gì cũng ngược lại. Muốn chân co thì gọi lệnh nào?',
        'Cú nhảy vẫn là: co chân, chờ một nhịp, duỗi chân rồi bước.']
    }),

    man({
      so: 9, ten: 'Khớp duỗi bị kẹt', hang: 'bien-the',
      hamCuaEmCan: ['go'], hamGoc: CHAN_KET, phanCung: CHAN_KET, canhBao: 'Khớp duỗi chân bị kẹt',
      deBai: 'Khớp duỗi chân của nhện bị kẹt: stand() không chạy được. Hàm crawl_safe(d) của màn vẫn gọi nó nên bị lỗi. Sửa crawl_safe(d) để nhện chui qua hai gầm, chân vẫn co như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: crawl_safe("R") hai lần. Hàm crawl_safe(d) của màn đang là crawl() cũ: chạy thử, xem lệnh nào bị báo hỏng rồi sửa thân hàm.',
      san: ['#####', '.n.n.', '#####'],
      batDau: { x: 0, y: 1, huong: 0 },
      bongMo: { x: 4, y: 1, huong: 0, chan: 'co' },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe()] },
      sao: { o: 13, nhip: 8 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe(T_CRAWL_SAFE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe(nhieu(['# stand() hỏng, bỏ đi'], T_CRAWL_SAFE))] }
      },
      congThucKhac: [
        { moTa: 'Hai bước đi nằm trong một vòng for', baiLam: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe(['crouch()', 'for i in range(2):', '    go(d)'])] } },
        { moTa: 'Viết thẳng go_right(), không gọi go(d)', baiLam: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe(['crouch()', 'go_right()', 'go_right()'])] } }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: stand() bị hỏng nên chương trình dừng với lỗi', baiLam: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe()] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Bỏ stand() nhưng giữ một wait() thừa: nhện vẫn tới nhưng chậm hơn', baiLam: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe(['crouch()', 'go(d)', 'wait()', 'go(d)'])] }, phaiCoMa: [] },
        { moTa: 'Bỏ luôn crouch(): nhện đứng thẳng nên đâm vào gầm', baiLam: { chinh: C_9.slice(), hamCuaMan: [hCrawlSafe(['go(d)', 'go(d)'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm crawl_safe() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Khớp duỗi chân kẹt thì nhện chỉ co được, không duỗi được. Bóng mờ cũng có chân co.',
        'Sửa crawl_safe(d): bỏ những lệnh dùng khớp đã hỏng.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Hang nhện lớn', hang: 'trum', mucTieu: 'toi-co', gioiHanHam: 3, nhipTheoLoiGiai: true,
      hamCuaEmCan: ['go', 'walk', 'crawl', 'jump', 'leap', 'crawl_jump'],
      deBai: 'Hang nhện có hai phiến đá giữa các hố, một đường vòng dài, rồi một gầm thấp sát ngay một cái hố. Tự viết chương trình chính đưa nhện tới cờ; em chỉ được gọi tối đa ba hàm khác nhau.',
      veMaMau: 'Chương trình có sẵn mới nhảy qua hai phiến đá đầu tiên. Viết tiếp đường tới cờ: chương trình chính chỉ được gọi tối đa ba hàm khác nhau.',
      san: ['.u.u...', '######.', '..u.n..', '.######', 'F......'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: ['leap("RR")'] },
      sao: { o: 25, nhip: 28 },
      huyHieu: { ma: 'che-nhen', ten: 'Huy hiệu Chế lệnh nhện' },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn cuối chia làm hai lần gọi walk()',
        baiLam: { chinh: nhieu(L_10.slice(0, 3), ['walk("L")', 'walk("DD")']) }
      },
      congThucKhac: [
        { moTa: 'Nhảy hai phiến đá bằng jump() hai lần (vẫn ba hàm khác nhau: jump, walk, crawl_jump)', baiLam: { chinh: ['jump("R")', 'jump("R")', 'walk("RRDDL")', 'crawl_jump("L")', 'walk("LDD")'] } }
      ],
      loiSai: [
        { moTa: 'Dùng tới bốn hàm khác nhau (leap, walk, crawl, jump): quá giới hạn của màn', baiLam: { chinh: ['leap("RR")', 'walk("RRDDL")', 'crawl("L")', 'jump("L")', 'walk("LDD")'] }, phaiCoMa: ['qua-gioi-han-ham'] },
        { moTa: 'Đi thẳng vào hố đầu, không nhảy: nhện rơi', baiLam: { chinh: ['walk("RR")'] }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Chui gầm rồi đi thẳng, không nhảy hố sau gầm: nhện rơi', baiLam: { chinh: ['leap("RR")', 'walk("RRDDL")', 'crawl("L")', 'walk("LLDD")'] }, phaiCoMa: ['roi-ho', 'chua-toi-co'] },
        { moTa: 'Quên co chân trước gầm: nhện đâm vào gầm', baiLam: { chinh: ['leap("RR")', 'walk("RRDDLL")'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Bốn hàm cùng làm được việc, nhưng chỉ cần ba: có hàm đã gộp sẵn hai việc.',
        'Gầm rồi hố liền nhau là việc của một hàm em đã chế.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
