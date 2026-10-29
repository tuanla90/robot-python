/* ============================================================================
   man-dem-tu-thu.js — "Robot Chấn Hưng": gói THỬ "Thử đệm từ" (đầu mùa 3, ẩn; hiện khi Gỡ lỗi bật "Mở hết"), chương `dem-tu-thu`.
   Bản thử cho user chơi thử LUẬT ĐỆM TỪ (cơ chế mùa 3; luật ở san-hoc.js phần ĐỆM TỪ, cờ màn `demTu = [{ x, y, cuc: 'N' | 'S' }]`):
     - ô đệm là KHỐI (đâm như tường), kéo / đẩy robot đứng cùng hàng hay cột trong 2 ô, 1 ô mỗi nhịp, sau hành động của robot (sau băng chuyền);
     - robot không bật nam châm hay bật KHÁC cực đệm → bị HÚT về sát đệm; bật CÙNG cực → bị ĐẨY ra xa tới khi ra khỏi tầm; bị chặn thì đứng im;
     - đệm gần hơn thắng; bị kéo vào hố thì rơi. Xe hai bánh gắn tay nam châm (magnet_n / magnet_s / magnet_off), chỉ Python mùa 1–2.
   Đăng ký: ManHoc.chuongCoChe (lo-trinh-hoc.js chenGoi) sau 'tham-so' → gói đứng đầu mùa 3, sao 0 (khối mùa 2 đặt gói đầu mùa 3 = 0 sao).
   Mã màn `dem-tu-thu.1` … `dem-tu-thu.6` là khóa lưu sao: gói thử, có thể đổi khi làm gói thật.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'magnet_n', 'magnet_s', 'magnet_off'];
  var KHUNG = { chinh: 10, moiHam: 10 };

  function man(m) {
    m.chuong = 'dem-tu-thu';
    m.cauTruc = m.cauTruc || ['for', 'if', 'while'];
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC; m.khung = KHUNG;
    m.robot = { than: 'hai-banh', tay: 'nam-cham', camBien: [] };
    m.moXuong = true; m.camHamCuaEm = false;
    m.nhipTheoLoiGiai = true;
    return ManHoc.chuanHoa(m);
  }

  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  /* Sân: ô đệm ghi '.' trên sân, khai ở demTu. Ký hiệu: u hố, # tường, F cờ. Xe xuất phát bên trái, quay mặt sang phải (huong 1). */
  var DS = [
    // 1 TRÌNH DIỄN: mã mẫu đã đúng. Xe đi ngang qua dưới đệm S (2,0) cách 2 ô: tới (2,2) thì bị hút lên (2,1), đi tiếp tới cờ (4,1). Bấm Chạy là thắng.
    man({
      so: 1, ten: 'Xem đệm từ hút xe', hang: 'lam-quen',
      hamCuaEmCan: ['move'],
      deBai: 'Ô có chữ S là ĐỆM TỪ. Bấm Chạy, xem robot đi qua đệm từ: xe không bật nam châm thì bị đệm hút về phía nó như một cục sắt, lệch sang làn trên và tới đúng cờ.',
      veMaMau: 'Chương trình mẫu đã đúng: xe đi thẳng 4 bước. Hãy để ý nhịp xe bước tới cột của đệm.',
      san: [
        '.....',
        '....F',
        '.....',
        '.....'
      ],
      demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: FOR(4, ['move()']) },
      sao: { o: 5, nhip: 4 },
      loiGiai: { chinh: FOR(4, ['move()']) },
      loiSai: [
        { moTa: 'Bật cực S (cùng cực với đệm S) nên bị đẩy xuống làn dưới, đi hết đường mà không tới cờ', baiLam: { chinh: ['magnet_s()'].concat(FOR(4, ['move()'])) }, phaiCoMa: ['chua-toi-co', 'dem-keo'] },
        { moTa: 'Đi thiếu một bước, dừng trước cờ', baiLam: { chinh: FOR(3, ['move()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Không cần sửa gì: bấm Chạy và xem xe bị hút lên một ô khi đứng cùng cột với đệm.', 'Đệm hút được xe đứng cùng hàng hay cùng cột, cách tối đa 2 ô.']
    }),
    // 2 ÉP HIỂU HÚT: đi thẳng thì tới (2,2) bị hút lên hố (2,1). Bật cùng cực S: bị đẩy xuống nhưng tường chặn nên đứng yên, đi tiếp tới cờ. Bật N (khác cực) vẫn bị hút.
    man({
      so: 2, ten: 'Hố dưới đệm', hang: 'lam-quen',
      hamCuaEmCan: ['move'],
      deBai: 'Giữa đệm S và đường đi có một cái hố. Xe không bật nam châm sẽ bị hút lên hố. Nam châm cùng cực thì đẩy nhau: bật cực S trước khi đi để đệm đẩy xe ra xa (tường bên dưới giữ xe lại), rồi đi tới cờ.',
      veMaMau: 'Chương trình mẫu đi thẳng 4 bước và rơi hố ở bước thứ hai. Thêm một lệnh bật nam châm.',
      san: [
        '.....',
        '..u..',
        '....F',
        '#####'
      ],
      demTu: [{ x: 2, y: 0, cuc: 'S' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: FOR(4, ['move()']) },
      sao: { o: 6, nhip: 4 },
      loiGiai: { chinh: ['magnet_s()'].concat(FOR(4, ['move()'])) },
      loiSai: [
        { moTa: 'Không bật nam châm: bị hút lên hố', baiLam: { chinh: FOR(4, ['move()']) }, phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Bật cực N (khác cực đệm S): vẫn bị hút lên hố', baiLam: { chinh: ['magnet_n()'].concat(FOR(4, ['move()'])) }, phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Đệm S hút xe tắt nam châm và xe bật cực N; chỉ xe bật cực S mới bị đẩy ra.', 'Bị đẩy mà phía sau là tường thì xe đứng yên tại chỗ.']
    }),
    // 3 ĐẨY LÀM CÔNG CỤ: bật N để đệm N (2,0) đẩy xe từ làn 1 xuống làn 2 có cờ (4,2); tường (4,1) chặn đường thẳng. Đi vòng (rẽ phải, rẽ trái) tốn 7 nhịp.
    man({
      so: 3, ten: 'Mượn đệm đổi làn', hang: 'luyen',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Cờ ở làn dưới, cuối làn trên có tường. Bật cực N để đệm N đẩy xe xuống làn dưới ngay khi xe đi ngang qua nó: nhanh hơn rẽ đi vòng.',
      veMaMau: 'Chương trình mẫu đi thẳng và đâm tường. Thêm lệnh bật nam châm đúng cực.',
      san: [
        '.....',
        '....#',
        '....F',
        '.....'
      ],
      demTu: [{ x: 2, y: 0, cuc: 'N' }],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: FOR(4, ['move()']) },
      sao: { o: 6, nhip: 4 },
      loiGiai: { chinh: ['magnet_n()'].concat(FOR(4, ['move()'])) },
      loiGiaiKhac: { moTa: 'Đi vòng không dùng đệm: 7 nhịp và nhiều ô hơn, chỉ 1 sao', sao: 1, baiLam: { chinh: FOR(3, ['move()']).concat(['turn_right()', 'move()', 'turn_left()', 'move()']) } },
      loiSai: [
        { moTa: 'Không bật nam châm: đệm giữ xe ở làn trên, xe đâm tường', baiLam: { chinh: FOR(4, ['move()']) }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bật cực S (khác cực đệm N): bị hút, vẫn ở làn trên, đâm tường', baiLam: { chinh: ['magnet_s()'].concat(FOR(4, ['move()'])) }, phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Đệm N đẩy xe bật cực N ra xa một ô mỗi nhịp.', 'Xe tới cột của đệm thì bị đẩy xuống làn dưới, hướng mặt không đổi, cứ đi tiếp là tới cờ.']
    }),
    // 4 HAI ĐỆM N VÀ S: hố dưới mỗi đệm, tường dưới làn xe. Qua đệm N phải bật N, qua đệm S phải bật S: đổi cực giữa đường.
    man({
      so: 4, ten: 'Đổi cực giữa đường', hang: 'luyen',
      hamCuaEmCan: ['move'],
      deBai: 'Hai đệm, hai hố. Đệm N chỉ đẩy xe bật cực N, đệm S chỉ đẩy xe bật cực S. Bật đúng cực trước khi tới mỗi đệm, đổi cực giữa đường.',
      veMaMau: 'Chương trình mẫu bật cực N rồi đi thẳng: qua được đệm N nhưng bị đệm S hút xuống hố. Đổi cực trước khi tới đệm thứ hai.',
      san: [
        '.......',
        '.u...u.',
        '......F',
        '#######'
      ],
      demTu: [{ x: 1, y: 0, cuc: 'N' }, { x: 5, y: 0, cuc: 'S' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: ['magnet_n()'].concat(FOR(6, ['move()'])) },
      sao: { o: 9, nhip: 6 },
      loiGiai: { chinh: ['magnet_n()'].concat(FOR(4, ['move()'])).concat(['magnet_s()']).concat(FOR(2, ['move()'])) },
      loiSai: [
        { moTa: 'Chỉ bật N: qua đệm N nhưng đệm S hút xe lên hố thứ hai', baiLam: { chinh: ['magnet_n()'].concat(FOR(6, ['move()'])) }, phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Chỉ bật S: đệm N hút xe lên hố thứ nhất', baiLam: { chinh: ['magnet_s()'].concat(FOR(6, ['move()'])) }, phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Đổi cực muộn một bước: tới cột đệm S vẫn đang N, bị hút lên hố thứ hai', baiLam: { chinh: ['magnet_n()'].concat(FOR(5, ['move()'])).concat(['magnet_s()', 'move()']) }, phaiCoMa: ['dem-roi-ho'] }
      ],
      goiY: ['Xe đứng cùng cột với đệm, cách 2 ô, là đệm tác động ngay nhịp đó.', 'Đếm bước: tới cột 1 phải đang N, tới cột 5 phải đang S. magnet_s() đổi cực ngay trong nhịp của lệnh move() kế tiếp.']
    }),
    // 5 HÚT LÀM CÔNG CỤ: hai đệm S. Qua đệm thứ nhất phải bật S (hố). Cờ nằm giữa đệm thứ hai và làn xe: tắt nam châm (hay đổi sang N) trước khi tới cột 5 để được kéo lên cờ. Giữ S thì bị đẩy vào tường, phải rẽ lên: 7 nhịp.
    man({
      so: 5, ten: 'Tắt nam châm để được kéo', hang: 'bien-the',
      hamCuaEmCan: ['move', 'turn_left'],
      deBai: 'Cờ nằm ngay dưới đệm S thứ hai. Qua đệm thứ nhất bằng cực S, rồi tắt nam châm (hay đổi cực) để đệm thứ hai kéo xe lên đúng ô cờ.',
      veMaMau: 'Chương trình mẫu bật S và đi thẳng: qua hố an toàn nhưng tới cuối vẫn bị đẩy, không lên được cờ. Thêm lệnh tắt nam châm đúng lúc.',
      san: [
        '.......',
        '.u...F.',
        '.......',
        '#######'
      ],
      demTu: [{ x: 1, y: 0, cuc: 'S' }, { x: 5, y: 0, cuc: 'S' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: ['magnet_s()'].concat(FOR(5, ['move()'])) },
      sao: { o: 8, nhip: 5 },
      loiGiai: { chinh: ['magnet_s()'].concat(FOR(4, ['move()'])).concat(['magnet_off()', 'move()']) },
      loiGiaiKhac: { moTa: 'Đổi sang cực N thay vì tắt: đệm S hút xe bật N, cũng lên cờ', sao: 3, baiLam: { chinh: ['magnet_s()'].concat(FOR(4, ['move()'])).concat(['magnet_n()', 'move()']) } },
      loiSai: [
        { moTa: 'Giữ cực S tới cuối: đệm thứ hai đẩy xe vào tường, xe đứng yên dưới cờ', baiLam: { chinh: ['magnet_s()'].concat(FOR(5, ['move()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không bật nam châm ngay từ đầu: đệm thứ nhất hút xe lên hố', baiLam: { chinh: ['magnet_off()'].concat(FOR(5, ['move()'])) }, phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Giữ S rồi rẽ trái đi lên cờ: đệm S đẩy xe bật S xuống lại, không lên được', baiLam: { chinh: ['magnet_s()'].concat(FOR(5, ['move()'])).concat(['turn_left()', 'move()']) }, phaiCoMa: ['chua-toi-co', 'dem-keo'] }
      ],
      goiY: ['Xe tắt nam châm (hay bật cực N) thì đệm S hút xe về phía nó, dừng ở ô sát đệm: đó chính là ô cờ.', 'magnet_off() ngay trước lệnh move() cuối cùng.']
    }),
    // 6 TRÙM NHỎ: ba đệm. N (1,0) trên hố: bật N. S (5,0): đổi sang S để được đẩy xuống làn 3. N (6,5): xe bật S bị hút lên ô cờ (6,4).
    man({
      so: 6, ten: 'Ba đệm một đường', hang: 'bien-the',
      hamCuaEmCan: ['move'],
      deBai: 'Ba đệm từ, một hố, một cờ ở góc. Dùng cả ba: qua hố bằng cùng cực, mượn đệm S đổi làn, rồi để đệm N kéo xe lên cờ. Mỗi bước bật đúng cực.',
      veMaMau: 'Chương trình mẫu mới bật N và đi 4 bước. Viết tiếp phần đổi cực và đi tới cờ.',
      san: [
        '.......',
        '.u.....',
        '.......',
        '.#.....',
        '......F',
        '.......'
      ],
      demTu: [{ x: 1, y: 0, cuc: 'N' }, { x: 5, y: 0, cuc: 'S' }, { x: 6, y: 5, cuc: 'N' }],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { chinh: ['magnet_n()'].concat(FOR(4, ['move()'])) },
      sao: { o: 9, nhip: 6 },
      loiGiai: { chinh: ['magnet_n()'].concat(FOR(4, ['move()'])).concat(['magnet_s()', 'move()', 'move()']) },
      loiSai: [
        { moTa: 'Không bật nam châm: rơi hố thứ nhất', baiLam: { chinh: FOR(6, ['move()']) }, phaiCoMa: ['dem-roi-ho'] },
        { moTa: 'Giữ N suốt: đệm S hút xe lên làn trên, đi hết đường không tới cờ', baiLam: { chinh: ['magnet_n()'].concat(FOR(6, ['move()'])) }, phaiCoMa: ['chua-toi-co', 'dem-keo'] },
        { moTa: 'Tắt nam châm khi tới đệm S thay vì bật S: bị hút lên làn trên, không xuống được làn cờ', baiLam: { chinh: ['magnet_n()'].concat(FOR(4, ['move()'])).concat(['magnet_off()', 'move()', 'move()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thứ tự cực: N (qua hố), S (bị đẩy xuống làn dưới), rồi cứ giữ S: đệm N ở góc hút xe bật S.', 'Xe bị đẩy xuống làn dưới xong, đi thêm một bước là đứng cùng cột với đệm N ở góc, cách 2 ô.']
    })
  ];

  ManHoc.manDemTuThu = DS;
  ManHoc.chuongCoChe = (ManHoc.chuongCoChe || []).concat([{
    sau: 'tham-so', ds: DS,
    chuong: [{ ma: 'dem-tu-thu', ten: 'Thử đệm từ' }],
    goi: { ma: 'dem-tu-thu', ten: 'Thử đệm từ', loai: 'khai-niem', hinh: 'nam-cham' }
  }]);
  if (laNode) module.exports = ManHoc;
})();
