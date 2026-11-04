/* xem-to-hop-ds.js — DANH SÁCH BỘ BA mùa 9 sẽ dùng (thân + tay + cảm biến; null = không gắn) cho trang xem hoc/game/xem-to-hop.html và máy kiểm hoc/kiem-hinh-to-hop.mjs (M9H2, 4/11).
   Gom từ hoc/MUA-9-200-CAU-DO.md cột "Chương 2" (màn 11–20) của G1–G8, cộng các lai ★ chưa xếp màn (L11, L13, L14, L15) và xe có loa (song ca màn 10 mỗi gói).
   Mỗi dòng: [than, tay, camBien, 'nơi dùng']. Chỉ là dữ liệu xem; luật ghép ở hoc/bang-ghep.js. */
(function (root) {
  var DS = [
    ['gai', 'xoay', 'khoang-cach', 'G1.11'], ['hai-banh', 'xoay', null, 'G1.12'], ['gai', 'xoay', null, 'G1.12'], ['gai', 'kep', null, 'G1.13'], ['omni', 'kep', null, 'G1.14 · G3.19'],
    ['hai-banh', 'day-keo', null, 'G1.15 · G4.14 · G5.16 (L3)'], ['nhen', 'kep', null, 'G1.16 · G3.12'], ['drone', 'nam-cham', null, 'G1.17 · G2.18 · G6.16'], ['xich', 'kep', null, 'G1.18 · G3.18'],
    ['xich', 'hoi', null, 'G1.18'], ['gai', 'hoi', null, 'G1.18 · G2.16'], ['hai-banh', 'loa', null, 'G1.20 · G4.20'], ['gai', 'loa', null, 'G1.20 · G7.20 · G8.20'],
    ['cau', 'nam-cham', null, 'G2.11 · G3.16 · G7.14 (L1)'], ['cau', 'moc-cau', null, 'G2.12'], ['cau', 'nam-cham', 'tu', 'G2.13 (L1 + L13)'], ['cau', 'kep', null, 'G2.14 (L8)'],
    ['omni', 'hoi', 'hong-ngoai', 'G2.15'], ['hai-banh', 'nam-cham', 'tu', 'G2.17 · G3.15'], ['drone', 'son', null, 'G2.18 · G6.12'], ['nhen', 'nam-cham', null, 'G2.19 · G3.12'],
    ['xich', 'loa', null, 'G2.20 · G6.20'], ['omni', 'loa', null, 'G2.20 · G5.20 · G6.20 · G7.20'],
    ['nhen', 'kep', 'tu', 'G3.11 · G3.13'], ['nhen', 'kep', 'camera-4', 'G3.14 (L12)'], ['nhen', 'son', null, 'G3.17 · G6.13 (L6)'], ['nhen', 'loa', null, 'G3.20 · G6.20 · G8.17 (L7)'],
    ['xuong', 'day-keo', 'quet-ma', 'G4.11 · G4.13 (L2)'], ['xuong', 'day-keo', 'dong-chay', 'G4.12 · G5.14'], ['drone', 'day-keo', null, 'G4.15 · G5.17 (L10)'], ['cau', 'day-keo', null, 'G4.16 · G7.16 (L9)'],
    ['omni', 'nam-cham', 'radar', 'G4.17'], ['cau', 'moc-cau', 'camera-bay', 'G4.18 (L13)'], ['xuong', 'day-keo', null, 'G4.19'], ['xuong', 'loa', null, 'G4.20 · G8.15 (L5)'],
    ['omni', 'day-keo', 'radar', 'G5.11 (L3)'], ['omni', 'day-keo', null, 'G5.12'], ['xich', 'day-keo', 'hong-ngoai', 'G5.13 (L3)'], ['xuong', 'day-keo', 'camera', 'G5.15 (L14)'], ['gai', 'day-keo', null, 'G5.18 (L3)'],
    ['xich', 'son', 'camera', 'G6.11'], ['xich', 'son', null, 'G6.12'], ['nhen', 'son', 'camera-4', 'G6.14 (L6 + L12)'], ['hai-banh', 'son', 'khoang-cach', 'G6.15'], ['omni', 'kep', 'radar', 'G6.17'], ['gai', 'son', null, 'G6.18'],
    ['gai', 'nem', 'radar', 'G7.11'], ['omni', 'nem', null, 'G7.12'], ['gai', 'nem', null, 'G7.12'], ['nhen', 'nam-cham', 'radar', 'G7.13 (L12)'], ['xich', 'nem', null, 'G7.15'], ['omni', 'hoi', null, 'G7.17'],
    ['drone', 'nam-cham', 'radar', 'G7.18 (L11)'], ['gai', 'nam-cham', null, 'G7.19'],
    ['nhen', 'nam-cham', 'am-thanh', 'G8.11 (L4)'], ['nhen', 'nam-cham', 'tu', 'G8.12'], ['nhen', null, 'am-thanh', 'G8.13 (L4)'], ['xuong', 'loa', 'am-thanh', 'G8.14 (L5)'], ['xuong', 'day-keo', 'am-thanh', 'G8.16 (L5)'],
    ['omni', 'loa', 'am-thanh', 'G8.18'], ['nhen', 'loa', 'am-thanh', 'G8.19 (L4 + L7)'], ['xuong', null, 'am-thanh', 'G8.19 (L5)'],
    ['drone', 'hoi', null, 'L15 bình xịt bụng (chưa xếp màn)'], ['drone', null, 'radar', 'L11'], ['nhen', null, 'radar', 'L12'], ['xuong', null, 'radar', 'L14'], ['cau', 'moc-cau', 'tu', 'L13'], ['cau', 'day-keo', 'camera-bay', 'L9 + L13']
  ];
  var API = { DS: DS };
  if (typeof module === 'object' && module.exports) module.exports = API;
  root.XemToHopDs = API;
})(typeof window !== 'undefined' ? window : globalThis);
