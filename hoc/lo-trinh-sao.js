/* Đo bằng node tools/do-lo-trinh.mjs --ghi-sao; chạy lại sau khi đổi bài. */
(function () {
  var ds = {
  "che-sung-hoi.10": {
    "o": 27,
    "nhip": 16
  },
  "che-sung-hoi.8": {
    "o": 15,
    "nhip": 11
  },
  "che-sung-hoi.9": {
    "o": 23,
    "nhip": 9
  },
  "che-sung-hoi.7": {
    "o": 17,
    "nhip": 8
  },
  "che-sung-hoi.6": {
    "o": 17,
    "nhip": 8
  },
  "che-sung-hoi.5": {
    "o": 17,
    "nhip": 14
  },
  "che-sung-hoi.4": {
    "o": 19,
    "nhip": 10
  },
  "che-sung-hoi.3": {
    "o": 16,
    "nhip": 7
  },
  "che-sung-hoi.2": {
    "o": 12,
    "nhip": 5
  },
  "che-sung-hoi.1": {
    "o": 12,
    "nhip": 5
  },
  "che-hong-ngoai.10": {
    "o": 16,
    "nhip": 32
  },
  "che-hong-ngoai.9": {
    "o": 13,
    "nhip": 14
  },
  "che-hong-ngoai.8": {
    "o": 12,
    "nhip": 13
  },
  "che-hong-ngoai.7": {
    "o": 22,
    "nhip": 15
  },
  "che-hong-ngoai.6": {
    "o": 11,
    "nhip": 13
  },
  "che-hong-ngoai.5": {
    "o": 13,
    "nhip": 13
  },
  "che-hong-ngoai.4": {
    "o": 22,
    "nhip": 15
  },
  "che-hong-ngoai.3": {
    "o": 12,
    "nhip": 13
  },
  "che-hong-ngoai.2": {
    "o": 13,
    "nhip": 13
  },
  "che-hong-ngoai.1": {
    "o": 16,
    "nhip": 13
  },
  "hong-ngoai.10": {
    "o": 12,
    "nhip": 38
  },
  "hong-ngoai.9": {
    "o": 22,
    "nhip": 27
  },
  "hong-ngoai.8": {
    "o": 12,
    "nhip": 21
  },
  "hong-ngoai.7": {
    "o": 13,
    "nhip": 28
  },
  "hong-ngoai.6": {
    "o": 12,
    "nhip": 19
  },
  "hong-ngoai.5": {
    "o": 11,
    "nhip": 13
  },
  "hong-ngoai.4": {
    "o": 10,
    "nhip": 12
  },
  "hong-ngoai.3": {
    "o": 10,
    "nhip": 13
  },
  "hong-ngoai.2": {
    "o": 10,
    "nhip": 18
  },
  "hong-ngoai.1": {
    "o": 11,
    "nhip": 13
  },
  "tham-so.10": {
    "o": 21,
    "nhip": 19
  },
  "tham-so.9": {
    "o": 17,
    "nhip": 16
  },
  "tham-so.8": {
    "o": 18,
    "nhip": 22
  },
  "tham-so.7": {
    "o": 14,
    "nhip": 26
  },
  "tham-so.6": {
    "o": 16,
    "nhip": 19
  },
  "tham-so.4": {
    "o": 16,
    "nhip": 21
  },
  "tham-so.3": {
    "o": 13,
    "nhip": 14
  },
  "tham-so.2": {
    "o": 13,
    "nhip": 14
  },
  "sung-hoi.10": {
    "o": 17,
    "nhip": 10
  },
  "sung-hoi.9": {
    "o": 16,
    "nhip": 14
  },
  "sung-hoi.7": {
    "o": 11,
    "nhip": 10
  },
  "sung-hoi.8": {
    "o": 18,
    "nhip": 11
  },
  "sung-hoi.6": {
    "o": 15,
    "nhip": 11
  },
  "sung-hoi.5": {
    "o": 16,
    "nhip": 10
  },
  "sung-hoi.4": {
    "o": 12,
    "nhip": 8
  },
  "sung-hoi.3": {
    "o": 13,
    "nhip": 8
  },
  "sung-hoi.2": {
    "o": 8,
    "nhip": 4
  },
  "che-xich.6": {
    "o": 14,
    "nhip": 11
  },
  "xich.10": {
    "o": 18,
    "nhip": 23
  },
  "xich.7": {
    "o": 14,
    "nhip": 14
  },
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
  "hai-robot.1": {
    "o": 7,
    "nhip": 4
  },
  "hai-robot.2": {
    "o": 19,
    "nhip": 4
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
    "nhip": 30
  },
  "robot-hoan-thien.2": {
    "o": 28,
    "nhip": 30
  },
  "robot-hoan-thien.3": {
    "o": 21,
    "nhip": 25
  },
  "robot-hoan-thien.4": {
    "o": 40,
    "nhip": 74
  },
  "robot-hoan-thien.5": {
    "o": 28,
    "nhip": 51
  },
  "robot-hoan-thien.6": {
    "o": 28,
    "nhip": 33
  },
  "robot-hoan-thien.7": {
    "o": 27,
    "nhip": 26
  },
  "robot-hoan-thien.8": {
    "o": 31,
    "nhip": 61
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
    "o": 12,
    "nhip": 10
  },
  "che-cam-bien.5": {
    "o": 12,
    "nhip": 16
  },
  "che-cam-bien.9": {
    "o": 12,
    "nhip": 16
  },
  "robot-hoan-thien.9": {
    "o": 17,
    "nhip": 19
  },
  "sung-hoi.1": {
    "o": 11,
    "nhip": 5
  },
  "tham-so.1": {
    "o": 16,
    "nhip": 13
  },
  "tham-so.5": {
    "o": 20,
    "nhip": 23
  },
  "bang-chuyen.1": {
    "o": 2,
    "nhip": 8
  },
  "bang-chuyen.2": {
    "o": 6,
    "nhip": 12
  },
  "bang-chuyen.6": {
    "o": 10,
    "nhip": 10
  },
  "bang-chuyen.5": {
    "o": 7,
    "nhip": 10
  },
  "bang-chuyen.7": {
    "o": 12,
    "nhip": 8
  },
  "bang-chuyen.8": {
    "o": 17,
    "nhip": 7
  },
  "bang-chuyen.3": {
    "o": 12,
    "nhip": 6
  },
  "bang-chuyen.4": {
    "o": 17,
    "nhip": 8
  },
  "bang-chuyen.9": {
    "o": 13,
    "nhip": 6
  },
  "bang-chuyen.10": {
    "o": 19,
    "nhip": 10
  },
  "che-nhen.8": {
    "o": 14,
    "nhip": 6
  },
  "che-nhen.6": {
    "o": 17,
    "nhip": 22
  },
  "nam-cham.6": {
    "o": 16,
    "nhip": 6
  },
  "nam-cham.10": {
    "o": 23,
    "nhip": 31
  },
  "che-nam-cham.7": {
    "o": 11,
    "nhip": 3
  },
  "che-nam-cham.5": {
    "o": 18,
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
  "che-list.4": {
    "o": 21,
    "nhip": 10
  },
  "che-list.5": {
    "o": 18,
    "nhip": 11
  },
  "che-list.6": {
    "o": 21,
    "nhip": 14
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
  },
  "omni.11": { "o": 11, "nhip": 5 },
  "omni.12": { "o": 16, "nhip": 10 },
  "luoi-2d.1": { "o": 12, "nhip": 8 },
  "luoi-2d.2": { "o": 13, "nhip": 8 },
  "luoi-2d.3": { "o": 12, "nhip": 11 },
  "luoi-2d.4": { "o": 11, "nhip": 11 },
  "luoi-2d.5": { "o": 14, "nhip": 12 },
  "luoi-2d.6": { "o": 13, "nhip": 12 },
  "luoi-2d.7": { "o": 14, "nhip": 12 },
  "luoi-2d.8": { "o": 13, "nhip": 7 },
  "luoi-2d.9": { "o": 14, "nhip": 11 },
  "luoi-2d.10": { "o": 16, "nhip": 13 },
  "may-nem.11": { "o": 4, "nhip": 2 },
  "may-nem.12": { "o": 4, "nhip": 2 },
  "may-nem.13": { "o": 8, "nhip": 4 },
  "may-nem.14": { "o": 12, "nhip": 10 },
  "may-nem.15": { "o": 8, "nhip": 5 },
  "may-nem.16": { "o": 17, "nhip": 9 },
  "may-nem.17": { "o": 11, "nhip": 11 },
  "may-nem.18": { "o": 17, "nhip": 8 },
  "may-nem.19": { "o": 17, "nhip": 11 },
  "may-nem.20": { "o": 17, "nhip": 15 },
  "che-may-nem.11": { "o": 12, "nhip": 10 },
  "che-may-nem.12": { "o": 14, "nhip": 9 },
  "che-may-nem.13": { "o": 14, "nhip": 6 },
  "che-may-nem.14": { "o": 17, "nhip": 9 },
  "che-may-nem.15": { "o": 16, "nhip": 13 },
  "che-may-nem.16": { "o": 11, "nhip": 11 },
  "che-may-nem.17": { "o": 23, "nhip": 20 },
  "che-may-nem.18": { "o": 9, "nhip": 4 },
  "che-may-nem.19": { "o": 14, "nhip": 9 },
  "che-may-nem.20": { "o": 27, "nhip": 13 },
  "radar-tron.1": { "o": 10, "nhip": 2 },
  "radar-tron.2": { "o": 11, "nhip": 1 },
  "radar-tron.3": { "o": 16, "nhip": 3 },
  "radar-tron.4": { "o": 16, "nhip": 3 },
  "radar-tron.5": { "o": 12, "nhip": 6 },
  "radar-tron.6": { "o": 18, "nhip": 9 },
  "radar-tron.7": { "o": 14, "nhip": 7 },
  "radar-tron.8": { "o": 11, "nhip": 4 },
  "radar-tron.9": { "o": 23, "nhip": 8 },
  "radar-tron.10": { "o": 22, "nhip": 16 },
  "che-radar-tron.1": { "o": 13, "nhip": 6 },
  "che-radar-tron.2": { "o": 19, "nhip": 9 },
  "che-radar-tron.3": { "o": 12, "nhip": 4 },
  "che-radar-tron.4": { "o": 15, "nhip": 7 },
  "che-radar-tron.5": { "o": 14, "nhip": 10 },
  "che-radar-tron.6": { "o": 25, "nhip": 20 },
  "che-radar-tron.7": { "o": 18, "nhip": 4 },
  "che-radar-tron.8": { "o": 33, "nhip": 10 },
  "che-radar-tron.9": { "o": 15, "nhip": 11 },
  "che-radar-tron.10": { "o": 32, "nhip": 12 },
  "ban-xoay.11": { "o": 11, "nhip": 5 },
  "ban-xoay.12": { "o": 13, "nhip": 9 },
  "ban-xoay.13": { "o": 5, "nhip": 3 },
  "ban-xoay.14": { "o": 6, "nhip": 7 },
  "ban-xoay.15": { "o": 8, "nhip": 3 },
  "ban-xoay.16": { "o": 17, "nhip": 7 },
  "ban-xoay.17": { "o": 12, "nhip": 10 },
  "ban-xoay.18": { "o": 12, "nhip": 6 },
  "ban-xoay.19": { "o": 12, "nhip": 7 },
  "ban-xoay.20": { "o": 12, "nhip": 12 },
  "che-ban-xoay.11": { "o": 14, "nhip": 9 },
  "che-ban-xoay.12": { "o": 13, "nhip": 6 },
  "che-ban-xoay.13": { "o": 15, "nhip": 10 },
  "che-ban-xoay.14": { "o": 19, "nhip": 9 },
  "che-ban-xoay.15": { "o": 21, "nhip": 14 },
  "che-ban-xoay.16": { "o": 25, "nhip": 11 },
  "che-ban-xoay.17": { "o": 24, "nhip": 12 },
  "che-ban-xoay.18": { "o": 16, "nhip": 8 },
  "che-ban-xoay.19": { "o": 25, "nhip": 15 },
  "che-ban-xoay.20": { "o": 30, "nhip": 17 },
  "di-cheo.1": { "o": 7, "nhip": 4 },
  "di-cheo.2": { "o": 6, "nhip": 3 },
  "di-cheo.3": { "o": 4, "nhip": 4 },
  "di-cheo.4": { "o": 2, "nhip": 4 },
  "di-cheo.5": { "o": 12, "nhip": 6 },
  "di-cheo.6": { "o": 3, "nhip": 6 },
  "di-cheo.7": { "o": 9, "nhip": 4 },
  "di-cheo.8": { "o": 6, "nhip": 4 },
  "di-cheo.9": { "o": 13, "nhip": 7 },
  "di-cheo.10": { "o": 19, "nhip": 9 },
  "che-di-cheo.1": { "o": 3, "nhip": 3 },
  "che-di-cheo.2": { "o": 3, "nhip": 3 },
  "che-di-cheo.3": { "o": 17, "nhip": 8 },
  "che-di-cheo.4": { "o": 4, "nhip": 4 },
  "che-di-cheo.5": { "o": 8, "nhip": 9 },
  "che-di-cheo.6": { "o": 14, "nhip": 6 },
  "che-di-cheo.7": { "o": 21, "nhip": 7 },
  "che-di-cheo.8": { "o": 16, "nhip": 10 },
  "che-di-cheo.9": { "o": 19, "nhip": 11 },
  "che-di-cheo.10": { "o": 22, "nhip": 9 },
  "chinh-luc.1": { "o": 12, "nhip": 6 },
  "chinh-luc.2": { "o": 15, "nhip": 5 },
  "chinh-luc.3": { "o": 12, "nhip": 6 },
  "chinh-luc.4": { "o": 12, "nhip": 9 },
  "chinh-luc.5": { "o": 13, "nhip": 5 },
  "chinh-luc.6": { "o": 16, "nhip": 11 },
  "chinh-luc.7": { "o": 13, "nhip": 3 },
  "chinh-luc.8": { "o": 18, "nhip": 11 },
  "chinh-luc.9": { "o": 12, "nhip": 10 },
  "chinh-luc.10": { "o": 21, "nhip": 12 },
  "che-chinh-luc.1": { "o": 12, "nhip": 6 },
  "che-chinh-luc.2": { "o": 16, "nhip": 11 },
  "che-chinh-luc.3": { "o": 19, "nhip": 11 },
  "che-chinh-luc.4": { "o": 14, "nhip": 10 },
  "che-chinh-luc.5": { "o": 20, "nhip": 11 },
  "che-chinh-luc.6": { "o": 11, "nhip": 9 },
  "che-chinh-luc.7": { "o": 23, "nhip": 12 },
  "che-chinh-luc.8": { "o": 21, "nhip": 8 },
  "che-chinh-luc.9": { "o": 20, "nhip": 11 },
  "che-chinh-luc.10": { "o": 23, "nhip": 12 },
  "nhan-dang.1": { "o": 18, "nhip": 6 },
  "nhan-dang.2": { "o": 10, "nhip": 2 },
  "nhan-dang.3": { "o": 21, "nhip": 6 },
  "nhan-dang.4": { "o": 15, "nhip": 8 },
  "nhan-dang.5": { "o": 19, "nhip": 11 },
  "nhan-dang.6": { "o": 20, "nhip": 5 },
  "nhan-dang.7": { "o": 12, "nhip": 6 },
  "nhan-dang.8": { "o": 16, "nhip": 10 },
  "nhan-dang.9": { "o": 15, "nhip": 6 },
  "nhan-dang.10": { "o": 19, "nhip": 11 },
  "che-nhan-dang.1": { "o": 16, "nhip": 6 },
  "che-nhan-dang.2": { "o": 21, "nhip": 8 },
  "che-nhan-dang.3": { "o": 16, "nhip": 8 },
  "che-nhan-dang.4": { "o": 22, "nhip": 6 },
  "che-nhan-dang.5": { "o": 14, "nhip": 9 },
  "che-nhan-dang.6": { "o": 16, "nhip": 9 },
  "che-nhan-dang.7": { "o": 15, "nhip": 8 },
  "che-nhan-dang.8": { "o": 16, "nhip": 6 },
  "che-nhan-dang.9": { "o": 23, "nhip": 10 },
  "che-nhan-dang.10": { "o": 31, "nhip": 19 },
  "mo-cu.1": { "o": 17, "nhip": 6 },
  "mo-cu.2": { "o": 11, "nhip": 4 },
  "mo-cu.3": { "o": 17, "nhip": 6 },
  "mo-cu.4": { "o": 15, "nhip": 7 },
  "mo-cu.5": { "o": 16, "nhip": 6 },
  "mo-cu.6": { "o": 22, "nhip": 12 },
  "mo-cu.7": { "o": 16, "nhip": 6 },
  "mo-cu.8": { "o": 17, "nhip": 11 },
  "mo-cu.9": { "o": 27, "nhip": 18 },
  "mo-cu.10": { "o": 28, "nhip": 28 },
  "che-mo-cu.1": { "o": 18, "nhip": 6 },
  "che-mo-cu.2": { "o": 19, "nhip": 10 },
  "che-mo-cu.3": { "o": 22, "nhip": 10 },
  "che-mo-cu.4": { "o": 13, "nhip": 10 },
  "che-mo-cu.5": { "o": 26, "nhip": 11 },
  "che-mo-cu.6": { "o": 16, "nhip": 7 },
  "che-mo-cu.7": { "o": 24, "nhip": 20 },
  "che-mo-cu.8": { "o": 25, "nhip": 20 },
  "che-mo-cu.9": { "o": 24, "nhip": 20 },
  "che-mo-cu.10": { "o": 33, "nhip": 30 },
  "doi-omni.11": { "o": 17, "nhip": 6 },
  "doi-omni.12": { "o": 19, "nhip": 6 },
  "doi-omni.13": { "o": 24, "nhip": 8 },
  "doi-omni.14": { "o": 21, "nhip": 7 },
  "doi-omni.15": { "o": 24, "nhip": 8 },
  "doi-omni.16": { "o": 23, "nhip": 12 },
  "doi-omni.17": { "o": 18, "nhip": 12 },
  "doi-omni.18": { "o": 22, "nhip": 10 },
  "doi-omni.19": { "o": 24, "nhip": 10 },
  "doi-omni.20": { "o": 36, "nhip": 33 },
  "che-doi-omni.11": { "o": 27, "nhip": 10 },
  "che-doi-omni.12": { "o": 28, "nhip": 10 },
  "che-doi-omni.13": { "o": 31, "nhip": 14 },
  "che-doi-omni.14": { "o": 29, "nhip": 11 },
  "che-doi-omni.15": { "o": 28, "nhip": 14 },
  "che-doi-omni.16": { "o": 30, "nhip": 16 },
  "che-doi-omni.17": { "o": 31, "nhip": 12 },
  "che-doi-omni.18": { "o": 35, "nhip": 20 },
  "che-doi-omni.19": { "o": 43, "nhip": 26 },
  "che-doi-omni.20": { "o": 45, "nhip": 42 },
  "tong-hop-6.1": { "o": 23, "nhip": 10 },
  "tong-hop-6.2": { "o": 13, "nhip": 12 },
  "tong-hop-6.3": { "o": 18, "nhip": 16 },
  "tong-hop-6.4": { "o": 14, "nhip": 8 },
  "tong-hop-6.5": { "o": 20, "nhip": 22 },
  "tong-hop-6.6": { "o": 28, "nhip": 22 },
  "tong-hop-6.7": { "o": 27, "nhip": 18 },
  "tong-hop-6.8": { "o": 23, "nhip": 22 },
  "tong-hop-6.9": { "o": 17, "nhip": 12 },
  "tong-hop-6.10": { "o": 32, "nhip": 57 },
  "trum-mua-6.1": { "o": 24, "nhip": 12 },
  "trum-mua-6.2": { "o": 20, "nhip": 22 },
  "trum-mua-6.3": { "o": 29, "nhip": 22 },
  "trum-mua-6.4": { "o": 25, "nhip": 20 },
  "trum-mua-6.5": { "o": 25, "nhip": 30 },
  "trum-mua-6.6": { "o": 26, "nhip": 24 },
  "trum-mua-6.7": { "o": 29, "nhip": 22 },
  "trum-mua-6.8": { "o": 31, "nhip": 32 },
  "trum-mua-6.9": { "o": 35, "nhip": 32 },
  "trum-mua-6.10": { "o": 40, "nhip": 63 }
};
  if (typeof module !== "undefined" && module.exports) module.exports = ds;
  if (typeof window !== "undefined") window.NguongSaoLoTrinh = ds;
})();
