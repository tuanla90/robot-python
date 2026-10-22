/* ============================================================================
   man-thu-doi.js — "Đường học": MÀN TẠM để thử giao diện HAI ROBOT (KE-HOACH-HAI-ROBOT.md). window.ManThuDoi.
   KHÔNG nằm trong ManHoc.danhSach (không có chương, không tính sao, máy kiểm chương không quét). Mở bằng địa chỉ
   choi.html?debug=1&man=thu-doi.1 (go-loi.js). Cần kho hàm có pick / drop / move / turn_right / u_turn (bảng Gỡ lỗi: "Nạp hàm chuẩn").
   Dữ liệu màn nhiều robot: man.doi = [phần riêng R1, phần riêng R2] (batDau, hamGoc, robot…); maMau / loiGiai = { doi: [{ chinh }, { chinh }], hamCuaMan }.
   ========================================================================== */
(function () {
  'use strict';

  var HG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
  var DS = [
    {
      ma: 'thu-doi.1', id: 'T.1', so: 1, ten: 'Thử: bàn giao', chuong: 'thu-doi', hang: 'lam-quen',
      deBai: 'R1 nhặt vật, đặt xuống ngay trước mặt R2. R2 chờ tới khi thấy vật trước mặt thì kẹp lên, quay lại, đặt vào ô đích.',
      veMaMau: 'Mỗi robot một chương trình: chạm R1 / R2 ở khung code để đổi.',
      san: ['......', '......', '.o....', '.....D'],
      doi: [
        { batDau: { x: 1, y: 3, huong: 0 }, robot: { than: 'hai-banh', tay: 'kep', camBien: [] } },
        { batDau: { x: 4, y: 3, huong: 3 }, hamGoc: HG.concat(['front_clear']), robot: { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] } }
      ],
      hamGoc: HG, mucTieu: 'dua-vat', cauTruc: ['for', 'if', 'while'],
      sao: { o: 27, nhip: 9 },
      maMau: { doi: [{ chinh: [] }, { chinh: [] }], hamCuaMan: [] },
      loiGiai: { doi: [{ chinh: ['pick()', 'turn_right()', 'move()', 'drop()'] }, { chinh: ['while front_clear():', '    wait()', 'pick()', 'u_turn()', 'drop()'] }], hamCuaMan: [], hamCuaEmMoi: [] },
      goiY: ['R2 không biết lúc nào R1 đặt vật xong: cho R2 chờ trong khi trước mặt còn trống.', 'while front_clear(): wait() — vật vừa xuất hiện trước mặt thì vòng lặp dừng.']
    }
  ];
  function tim(ma) { for (var i = 0; i < DS.length; i++) if (DS[i].ma === ma || DS[i].id === ma) return DS[i]; return null; }

  var API = { ds: DS, tim: tim };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.ManThuDoi = API;
})();
