/* Đo bằng node tools/do-lo-trinh.mjs --ghi-sao; chạy lại sau khi đổi bài. */
(function () {
  var ds = {
  "vong-lap.1": {
    "o": 5,
    "nhip": 6
  },
  "vong-lap.8": {
    "o": 22,
    "nhip": 14
  },
  "vong-lap.9": {
    "o": 21,
    "nhip": 21
  },
  "khoang-cach.1": {
    "o": 6,
    "nhip": 3
  },
  "khoang-cach.2": {
    "o": 5,
    "nhip": 6
  },
  "khoang-cach.8": {
    "o": 10,
    "nhip": 8
  },
  "khoang-cach.5": {
    "o": 12,
    "nhip": 12
  },
  "khoang-cach.6": {
    "o": 10,
    "nhip": 10
  },
  "khoang-cach.10": {
    "o": 21,
    "nhip": 24
  },
  "che-cam-bien.1": {
    "o": 8,
    "nhip": 4
  },
  "che-cam-bien.2": {
    "o": 5,
    "nhip": 6
  },
  "che-cam-bien.7": {
    "o": 8,
    "nhip": 1
  },
  "che-cam-bien.3": {
    "o": 13,
    "nhip": 17
  },
  "nut-de.1": {
    "o": 26,
    "nhip": 10
  },
  "che-tay.1": {
    "o": 19,
    "nhip": 8
  },
  "che-tay.3": {
    "o": 36,
    "nhip": 21
  },
  "che-tay.4": {
    "o": 13,
    "nhip": 6
  },
  "che-tay.6": {
    "o": 31,
    "nhip": 22
  },
  "che-tay.8": {
    "o": 17,
    "nhip": 6
  },
  "che-tay.10": {
    "o": 38,
    "nhip": 32
  },
  "che-xe.8": {
    "o": 6,
    "nhip": 3
  },
  "tay-xoay.1": {
    "o": 10,
    "nhip": 3
  },
  "tay-xoay.7": {
    "o": 10,
    "nhip": 3
  },
  "che-tay-xoay.8": {
    "o": 16,
    "nhip": 4
  },
  "cam-bien-ben.1": {
    "o": 11,
    "nhip": 5
  },
  "che-cam-bien.4": {
    "o": 6,
    "nhip": 11
  },
  "cam-bien-ben.2": {
    "o": 13,
    "nhip": 5
  },
  "cam-bien-ben.3": {
    "o": 11,
    "nhip": 5
  },
  "cam-bien-ben.4": {
    "o": 18,
    "nhip": 11
  },
  "cam-bien-ben.5": {
    "o": 15,
    "nhip": 10
  },
  "cam-bien-ben.6": {
    "o": 16,
    "nhip": 20
  },
  "cam-bien-ben.7": {
    "o": 12,
    "nhip": 10
  },
  "cam-bien-ben.8": {
    "o": 18,
    "nhip": 8
  },
  "cam-bien-ben.9": {
    "o": 27,
    "nhip": 15
  },
  "me-cung.1": {
    "o": 8,
    "nhip": 2
  },
  "me-cung.2": {
    "o": 9,
    "nhip": 3
  },
  "me-cung.3": {
    "o": 8,
    "nhip": 1
  },
  "me-cung.4": {
    "o": 13,
    "nhip": 2
  },
  "me-cung.5": {
    "o": 12,
    "nhip": 2
  },
  "me-cung.6": {
    "o": 16,
    "nhip": 5
  },
  "me-cung.7": {
    "o": 14,
    "nhip": 5
  },
  "me-cung.8": {
    "o": 16,
    "nhip": 17
  },
  "me-cung.9": {
    "o": 16,
    "nhip": 21
  },
  "me-cung.10": {
    "o": 16,
    "nhip": 70
  },
  "hai-robot.4": {
    "o": 30,
    "nhip": 12
  },
  "hai-robot.5": {
    "o": 11,
    "nhip": 5
  },
  "hai-robot.6": {
    "o": 11,
    "nhip": 5
  },
  "hai-robot.7": {
    "o": 27,
    "nhip": 18
  },
  "hai-robot.9": {
    "o": 23,
    "nhip": 8
  },
  "che-cam-bien.10": {
    "o": 30,
    "nhip": 13
  },
  "robot-hoan-thien.1": {
    "o": 23,
    "nhip": 11
  },
  "robot-hoan-thien.2": {
    "o": 28,
    "nhip": 11
  },
  "robot-hoan-thien.3": {
    "o": 21,
    "nhip": 8
  },
  "robot-hoan-thien.4": {
    "o": 40,
    "nhip": 24
  },
  "robot-hoan-thien.5": {
    "o": 28,
    "nhip": 23
  },
  "robot-hoan-thien.6": {
    "o": 28,
    "nhip": 12
  },
  "robot-hoan-thien.7": {
    "o": 27,
    "nhip": 8
  },
  "robot-hoan-thien.8": {
    "o": 31,
    "nhip": 27
  },
  "cam-bien-ben.10": {
    "o": 20,
    "nhip": 36
  },
  "xich.1": {
    "o": 8,
    "nhip": 5
  },
  "xich.2": {
    "o": 8,
    "nhip": 6
  },
  "xich.3": {
    "o": 11,
    "nhip": 8
  },
  "xich.9": {
    "o": 13,
    "nhip": 13
  },
  "che-xich.8": {
    "o": 12,
    "nhip": 7
  },
  "che-cam-bien.6": {
    "o": 13,
    "nhip": 8
  },
  "che-cam-bien.5": {
    "o": 13,
    "nhip": 10
  },
  "che-cam-bien.9": {
    "o": 25,
    "nhip": 14
  },
  "robot-hoan-thien.9": {
    "o": 25,
    "nhip": 11
  },
  "sung-hoi.1": {
    "o": 3,
    "nhip": 3
  },
  "sung-hoi.3": {
    "o": 7,
    "nhip": 4
  },
  "sung-hoi.8": {
    "o": 7,
    "nhip": 8
  },
  "tham-so.1": {
    "o": 14,
    "nhip": 11
  },
  "tham-so.5": {
    "o": 18,
    "nhip": 19
  },
  "bang-chuyen.1": {
    "o": 7,
    "nhip": 7
  },
  "bang-chuyen.2": {
    "o": 5,
    "nhip": 8
  },
  "bang-chuyen.8": {
    "o": 23,
    "nhip": 20
  },
  "che-sung-hoi.7": {
    "o": 11,
    "nhip": 4
  },
  "ban-xoay.1": {
    "o": 5,
    "nhip": 5
  },
  "ban-xoay.2": {
    "o": 6,
    "nhip": 7
  },
  "ban-xoay.3": {
    "o": 9,
    "nhip": 6
  },
  "ban-xoay.4": {
    "o": 27,
    "nhip": 11
  },
  "ban-xoay.5": {
    "o": 19,
    "nhip": 5
  },
  "ban-xoay.6": {
    "o": 24,
    "nhip": 22
  },
  "ban-xoay.7": {
    "o": 23,
    "nhip": 13
  },
  "ban-xoay.8": {
    "o": 28,
    "nhip": 20
  },
  "ban-xoay.9": {
    "o": 24,
    "nhip": 14
  },
  "ban-xoay.10": {
    "o": 27,
    "nhip": 64
  },
  "che-ban-xoay.1": {
    "o": 6,
    "nhip": 3
  },
  "che-ban-xoay.2": {
    "o": 6,
    "nhip": 5
  },
  "che-ban-xoay.3": {
    "o": 18,
    "nhip": 5
  },
  "che-ban-xoay.4": {
    "o": 6,
    "nhip": 7
  },
  "che-ban-xoay.5": {
    "o": 24,
    "nhip": 12
  },
  "che-ban-xoay.6": {
    "o": 28,
    "nhip": 25
  },
  "che-ban-xoay.7": {
    "o": 29,
    "nhip": 18
  },
  "che-ban-xoay.8": {
    "o": 25,
    "nhip": 15
  },
  "che-ban-xoay.9": {
    "o": 26,
    "nhip": 17
  },
  "che-ban-xoay.10": {
    "o": 23,
    "nhip": 48
  },
  "che-nhen.8": {
    "o": 14,
    "nhip": 6
  },
  "che-list.4": {
    "o": 21,
    "nhip": 14
  },
  "che-list.5": {
    "o": 18,
    "nhip": 15
  },
  "che-list.6": {
    "o": 21,
    "nhip": 16
  },
  "che-list.8": {
    "o": 21,
    "nhip": 14
  },
  "che-list.9": {
    "o": 21,
    "nhip": 18
  },
  "mau.4": {
    "o": 13,
    "nhip": 12
  },
  "mau.5": {
    "o": 14,
    "nhip": 14
  },
  "mau.6": {
    "o": 10,
    "nhip": 7
  },
  "mau.7": {
    "o": 10,
    "nhip": 7
  },
  "mau.8": {
    "o": 23,
    "nhip": 5
  },
  "mau.9": {
    "o": 14,
    "nhip": 10
  },
  "che-mau.1": {
    "o": 6,
    "nhip": 4
  },
  "che-mau.2": {
    "o": 7,
    "nhip": 4
  },
  "che-mau.3": {
    "o": 18,
    "nhip": 10
  },
  "che-mau.4": {
    "o": 11,
    "nhip": 6
  },
  "che-mau.5": {
    "o": 15,
    "nhip": 9
  },
  "che-mau.6": {
    "o": 25,
    "nhip": 6
  },
  "che-mau.7": {
    "o": 25,
    "nhip": 20
  },
  "che-mau.8": {
    "o": 14,
    "nhip": 8
  },
  "che-mau.9": {
    "o": 17,
    "nhip": 9
  },
  "rap-nao.5": {
    "o": 11,
    "nhip": 5
  },
  "rap-nao.6": {
    "o": 14,
    "nhip": 19
  },
  "rap-nao.9": {
    "o": 14,
    "nhip": 7
  },
  "nam-cham.6": {
    "o": 16,
    "nhip": 6
  },
  "che-nam-cham.5": {
    "o": 18,
    "nhip": 4
  },
  "che-nam-cham.7": {
    "o": 11,
    "nhip": 3
  },
  "nam-cham.10": {
    "o": 23,
    "nhip": 31
  },
  "may-nem.6": {
    "o": 6,
    "nhip": 1
  },
  "may-nem.7": {
    "o": 9,
    "nhip": 2
  },
  "may-nem.10": {
    "o": 25,
    "nhip": 45
  },
  "che-may-nem.6": {
    "o": 16,
    "nhip": 4
  },
  "drone.6": {
    "o": 7,
    "nhip": 8
  },
  "drone.10": {
    "o": 25,
    "nhip": 42
  },
  "che-drone.5": {
    "o": 15,
    "nhip": 8
  },
  "che-drone.10": {
    "o": 24,
    "nhip": 74
  },
  "flycam.1": {
    "o": 3,
    "nhip": 4
  },
  "flycam.2": {
    "o": 8,
    "nhip": 6
  },
  "flycam.3": {
    "o": 10,
    "nhip": 6
  },
  "flycam.4": {
    "o": 13,
    "nhip": 8
  },
  "flycam.5": {
    "o": 19,
    "nhip": 25
  },
  "flycam.6": {
    "o": 12,
    "nhip": 22
  },
  "flycam.7": {
    "o": 10,
    "nhip": 12
  },
  "flycam.8": {
    "o": 7,
    "nhip": 8
  },
  "rap-du.3": {
    "o": 16,
    "nhip": 11
  },
  "rap-du.8": {
    "o": 17,
    "nhip": 3
  },
  "rap-du.9": {
    "o": 12,
    "nhip": 3
  },
  "rap-du.10": {
    "o": 37,
    "nhip": 42
  }
};
  if (typeof module !== "undefined" && module.exports) module.exports = ds;
  if (typeof window !== "undefined") window.NguongSaoLoTrinh = ds;
})();
