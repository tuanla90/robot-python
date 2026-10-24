/* Hai robot chia nhau vuot ho va bang chuyen. */
(function () {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var M = node ? require('./man-chuoi-1.js') : window.ManHoc;
  var NHEN = ['go_up','go_down','go_left','go_right','wait','crouch','stand'];
  var BANH = ['left_move','right_move','left_back','right_back','wait'];
  var nhay = ['crouch()','go_right()','stand()','go_right()','go_right()','go_right()'];
  var bang = ['for i in range(4):','    left_move()','    right_move()','    wait()'];
  var ds = [];
  for (var i = 1; i <= 10; i++) {
    var maNhen = nhay;
    var maBanh = bang;
    var maMau = { doi: [{ chinh: i === 1 ? maBanh : [] }, { chinh: maNhen }] };
    var m = {
      chuong:'doi-ho-bang', so:i,
      ten:i === 10 ? 'Hai thân xe, hai địa hình' : i === 1 ? 'Chạy thử hai robot' : i <= 3 ? 'Nhện bật qua hố' : i <= 6 ? 'Bánh vượt băng chuyền' : 'Chia việc theo địa hình',
      hang:i <= 3 ? 'lam-quen' : i <= 6 ? 'luyen' : i <= 9 ? 'bien-the' : 'trum',
      deBai:'Sân có hai làn riêng. Nhện phải co chân trước khi bước vào hố để bật qua; xe bánh phải dùng đủ ba lệnh để đi trên băng chuyền. Đưa cả hai robot tới cờ.',
      veMaMau:'Chạy thử robot có chương trình mẫu, rồi viết chương trình cho robot còn lại.',
      san:['#######','#..u.F#','#######','#>>>>F#','#######'],
      mucTieu:'toi-co', batDau:{x:1,y:3,huong:1}, loaiRobot:'banh', robot:{than:'hai-banh',tay:null}, hamGoc:BANH,
      vatChat:undefined,
      doi:[
        {batDau:{x:1,y:3,huong:1},loaiRobot:'banh',robot:{than:'hai-banh',tay:null},hamGoc:BANH},
        {batDau:{x:1,y:1,huong:1},loaiRobot:'nhen',robot:{than:'nhen',tay:null},hamGoc:NHEN}
      ],
      cauTruc:['for','if','while'],moXuong:true,camHamCuaEm:false,khung:{chinh:10,moiHam:10},bienDem:true,
      maMau:{doi:[{chinh:maBanh},{chinh:i===1?[]:maNhen}]},
      loiGiai:{doi:[{chinh:maBanh},{chinh:maNhen}],hamCuaMan:[],hamCuaEmMoi:[]},
      hamCuaEmCan:[],taoHam:[],loiSai:[],sao:{o:maBanh.length+maNhen.length,nhip:30},nhipToiDa:100,nhipTheoLoiGiai:true,
      goiY:['Nhện co chân trước khi bước tới ô hố, rồi duỗi chân để bật qua.','Xe bánh cần left_move(), right_move() và wait() để băng chuyền đẩy xe đi.']
    };
    if (i === 10) m.huyHieu={ma:'doi-ho-bang',ten:'Huy hiệu Đội vượt hố và băng chuyền'};
    ds.push(M.chuanHoa(m));
  }
  M.them(ds);
  if (node) module.exports=M;
  if (typeof window!=='undefined') window.ManHoc=M;
})();
