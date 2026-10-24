/* Hai robot chia nhau chuyen vat bang tay kep va may nem. */
(function () {
  'use strict';
  var node=typeof module!=='undefined'&&module.exports;
  var M=node?require('./man-chuoi-1.js'):window.ManHoc;
  var BANH=['left_move','right_move','left_back','right_back','wait'];
  var GAP=BANH.concat(['arm_down','arm_up','grab','release']);
  var NEM=BANH.concat(['aim','throw','load']);
  var ROBOT_GAP={than:'hai-banh',tay:'kep',camBien:[]};
  var ROBOT_NEM={than:'hai-banh',tay:'nem',camBien:[]};
  var ds=[];
  for(var i=1;i<=10;i++){
    var gap=['pick()','move()','drop()'];
    var hamGap=[
      {ten:'pick',thamSo:[],than:['arm_down()','grab()','wait()','arm_up()']},
      {ten:'drop',thamSo:[],than:['arm_down()','release()','wait()','arm_up()']}
    ];
    var nem=['aim(3)','load()','wait()','throw()','wait()'];
    var mau={doi:[{chinh:gap.slice()},{chinh:nem.slice()}]};
    var m={
      chuong:'doi-gap-nem',so:i,
      ten:i===10?'Chuyền hàng bằng gắp và ném':i===1?'Tự động một xe, sửa một xe':i<=3?'Chia việc gắp và ném':i<=6?'Sửa chương trình máy ném':'Chuyền hàng phối hợp',
      hang:i<=3?'lam-quen':i<=6?'luyen':i<=9?'bien-the':'trum',
      deBai:'Hai robot nhận hai vật trên hai làn riêng. R1 kẹp vật rồi đưa tới ô đích. R2 nạp vật và ném qua rào vào ô đích. Mỗi robot chạy chương trình riêng.',
      veMaMau:'Chương trình R2 đã tự động ném vật. Hãy viết chương trình cho R1 để gắp và giao vật còn lại.',
      san:['########','#.oD...#','#....D.#','#......#','#.o=D..#','########'],vatChat:['........','..g.....','........','........','..s.....','........'],
      mucTieu:'dua-vat',batDau:{x:1,y:1,huong:1},loaiRobot:'banh',robot:ROBOT_GAP,hamGoc:GAP,
      doi:[
        {batDau:{x:1,y:1,huong:1},loaiRobot:'banh',robot:ROBOT_GAP,hamGoc:GAP},
        {batDau:{x:1,y:4,huong:1},loaiRobot:'banh',robot:ROBOT_NEM,hamGoc:NEM}
      ],
      cauTruc:['for','if','while'],moXuong:true,camHamCuaEm:false,khung:{chinh:10,moiHam:10},bienDem:true,
      maMau:Object.assign({},mau,{doi:[{chinh:i===1?[]:gap.slice()},{chinh:nem.slice()}],hamCuaMan:[]}),
      loiGiai:{doi:[{chinh:gap},{chinh:nem}],hamCuaMan:[],hamCuaEmMoi:[]},
      hamCuaEmCan:['pick','move','drop'],taoHam:[],loiSai:[],sao:{o:21,nhip:4},nhipToiDa:100,nhipTheoLoiGiai:true,
      goiY:['Hạ tay, gắp vật, chờ rồi nâng tay trước khi di chuyển.','R2 quay mặt về rào, nạp vật, chọn aim(3), chờ rồi ném.']
    };
    if(i===10)m.huyHieu={ma:'doi-gap-nem',ten:'Huy hiệu Đội tay gắp và máy ném'};
    ds.push(M.chuanHoa(m));
  }
  M.them(ds);
  if(node)module.exports=M;
  if(typeof window!=='undefined')window.ManHoc=M;
})();
