// trace-banh.mjs — công cụ nội bộ: mô phỏng up()/down()/turn_left()/turn_right() để tính vị trí
// cuối (và vị trí "ô trước mặt" mỗi bước) khi THIẾT KẾ màn, tránh phải nhẩm tay (hay sai).
// Dùng: node hoc/trace-banh.mjs
const VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // 0 up, 1 right, 2 down, 3 left

export function trace(batDau, lenh) {
  var x = batDau.x, y = batDau.y, h = batDau.huong;
  var log = [{ cmd: '(bắt đầu)', x: x, y: y, huong: h, oTruoc: oTruoc() }];
  function oTruoc() { return { x: x + VEC[h][0], y: y + VEC[h][1] }; }
  lenh.forEach(function (c) {
    if (c === 'up()') { x += VEC[h][0]; y += VEC[h][1]; }
    else if (c === 'down()') { x -= VEC[h][0]; y -= VEC[h][1]; }
    else if (c === 'turn_right()') { h = (h + 1) % 4; }
    else if (c === 'turn_left()') { h = (h + 3) % 4; }
    else if (c === 'pick()' || c === 'drop()' || c === 'wait()') { /* không đổi vị trí/hướng */ }
    else { throw new Error('Lệnh lạ trong trace: ' + c); }
    log.push({ cmd: c, x: x, y: y, huong: h, oTruoc: oTruoc() });
  });
  return log;
}

if (process.argv[1] && process.argv[1].endsWith('trace-banh.mjs')) {
  // ví dụ chạy thử khi gọi trực tiếp
  var ex = trace({ x: 0, y: 0, huong: 0 }, ['up()', 'up()', 'turn_right()', 'up()']);
  ex.forEach(function (s) { console.log(s.cmd.padEnd(14), 'x=' + s.x, 'y=' + s.y, 'huong=' + s.huong, 'oTruoc=' + JSON.stringify(s.oTruoc)); });
}
