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
  "trum-mua-6.10": { "o": 40, "nhip": 63 },
  "can-cau.1": { "o": 3, "nhip": 3 },
  "can-cau.2": { "o": 3, "nhip": 3 },
  "can-cau.3": { "o": 3, "nhip": 3 },
  "can-cau.4": { "o": 4, "nhip": 4 },
  "can-cau.5": { "o": 4, "nhip": 4 },
  "can-cau.6": { "o": 4, "nhip": 4 },
  "can-cau.7": { "o": 4, "nhip": 7 },
  "can-cau.8": { "o": 6, "nhip": 7 },
  "can-cau.9": { "o": 7, "nhip": 10 },
  "can-cau.10": { "o": 7, "nhip": 18 },
  "so-am.1": { "o": 7, "nhip": 3 },
  "so-am.2": { "o": 3, "nhip": 5 },
  "so-am.3": { "o": 5, "nhip": 5 },
  "so-am.4": { "o": 6, "nhip": 7 },
  "so-am.5": { "o": 10, "nhip": 7 },
  "so-am.6": { "o": 15, "nhip": 7 },
  "so-am.7": { "o": 18, "nhip": 7 },
  "so-am.8": { "o": 18, "nhip": 11 },
  "so-am.9": { "o": 19, "nhip": 13 },
  "so-am.10": { "o": 19, "nhip": 32 },
  "moc-cau.1": { "o": 4, "nhip": 4 },
  "moc-cau.2": { "o": 4, "nhip": 4 },
  "moc-cau.3": { "o": 4, "nhip": 4 },
  "moc-cau.4": { "o": 13, "nhip": 10 },
  "moc-cau.5": { "o": 13, "nhip": 12 },
  "moc-cau.6": { "o": 13, "nhip": 15 },
  "moc-cau.7": { "o": 11, "nhip": 10 },
  "moc-cau.8": { "o": 15, "nhip": 18 },
  "moc-cau.9": { "o": 19, "nhip": 18 },
  "moc-cau.10": { "o": 25, "nhip": 50 },
  "chia-du.1": { "o": 6, "nhip": 5 },
  "chia-du.2": { "o": 18, "nhip": 7 },
  "chia-du.3": { "o": 10, "nhip": 17 },
  "chia-du.4": { "o": 12, "nhip": 12 },
  "chia-du.5": { "o": 15, "nhip": 18 },
  "chia-du.6": { "o": 19, "nhip": 20 },
  "chia-du.7": { "o": 19, "nhip": 20 },
  "chia-du.8": { "o": 22, "nhip": 16 },
  "chia-du.9": { "o": 32, "nhip": 26 },
  "chia-du.10": { "o": 31, "nhip": 48 },
  "quet-ma.1": { "o": 13, "nhip": 3 },
  "quet-ma.2": { "o": 15, "nhip": 6 },
  "quet-ma.3": { "o": 10, "nhip": 7 },
  "quet-ma.4": { "o": 12, "nhip": 7 },
  "quet-ma.5": { "o": 19, "nhip": 10 },
  "quet-ma.6": { "o": 14, "nhip": 20 },
  "quet-ma.7": { "o": 18, "nhip": 24 },
  "quet-ma.8": { "o": 14, "nhip": 12 },
  "quet-ma.9": { "o": 22, "nhip": 18 },
  "quet-ma.10": { "o": 15, "nhip": 28 },
  "che-quet-ma.1": { "o": 19, "nhip": 16 },
  "che-quet-ma.2": { "o": 21, "nhip": 48 },
  "che-quet-ma.3": { "o": 22, "nhip": 48 },
  "che-quet-ma.4": { "o": 17, "nhip": 48 },
  "che-quet-ma.5": { "o": 16, "nhip": 22 },
  "che-quet-ma.6": { "o": 21, "nhip": 50 },
  "che-quet-ma.7": { "o": 23, "nhip": 28 },
  "che-quet-ma.8": { "o": 19, "nhip": 58 },
  "che-quet-ma.9": { "o": 29, "nhip": 80 },
  "che-quet-ma.10": { "o": 32, "nhip": 94 },
  "ben-tau.1": { "o": 10, "nhip": 3 },
  "ben-tau.2": { "o": 12, "nhip": 5 },
  "ben-tau.3": { "o": 13, "nhip": 6 },
  "ben-tau.4": { "o": 15, "nhip": 8 },
  "ben-tau.5": { "o": 14, "nhip": 7 },
  "ben-tau.6": { "o": 14, "nhip": 7 },
  "ben-tau.7": { "o": 18, "nhip": 22 },
  "ben-tau.8": { "o": 15, "nhip": 9 },
  "ben-tau.9": { "o": 16, "nhip": 12 },
  "ben-tau.10": { "o": 16, "nhip": 26 },
  "che-ben-tau.1": { "o": 14, "nhip": 7 },
  "che-ben-tau.2": { "o": 17, "nhip": 8 },
  "che-ben-tau.3": { "o": 19, "nhip": 8 },
  "che-ben-tau.4": { "o": 20, "nhip": 16 },
  "che-ben-tau.5": { "o": 27, "nhip": 44 },
  "che-ben-tau.6": { "o": 17, "nhip": 13 },
  "che-ben-tau.7": { "o": 19, "nhip": 12 },
  "che-ben-tau.8": { "o": 21, "nhip": 15 },
  "che-ben-tau.9": { "o": 19, "nhip": 58 },
  "che-ben-tau.10": { "o": 27, "nhip": 46 },
  "duong-ray.1": { "o": 10, "nhip": 8 },
  "duong-ray.2": { "o": 11, "nhip": 11 },
  "duong-ray.3": { "o": 7, "nhip": 12 },
  "duong-ray.4": { "o": 13, "nhip": 33 },
  "duong-ray.5": { "o": 21, "nhip": 21 },
  "duong-ray.6": { "o": 11, "nhip": 8 },
  "duong-ray.7": { "o": 13, "nhip": 36 },
  "duong-ray.8": { "o": 11, "nhip": 13 },
  "duong-ray.9": { "o": 15, "nhip": 18 },
  "duong-ray.10": { "o": 11, "nhip": 32 },
  "che-duong-ray.1": { "o": 6, "nhip": 12 },
  "che-duong-ray.2": { "o": 7, "nhip": 24 },
  "che-duong-ray.3": { "o": 6, "nhip": 8 },
  "che-duong-ray.4": { "o": 14, "nhip": 33 },
  "che-duong-ray.5": { "o": 7, "nhip": 12 },
  "che-duong-ray.6": { "o": 10, "nhip": 16 },
  "che-duong-ray.7": { "o": 15, "nhip": 23 },
  "che-duong-ray.8": { "o": 28, "nhip": 44 },
  "che-duong-ray.9": { "o": 17, "nhip": 44 },
  "che-duong-ray.10": { "o": 32, "nhip": 104 },
  "nhac-doi.1": { "o": 9, "nhip": 6 },
  "nhac-doi.2": { "o": 10, "nhip": 8 },
  "nhac-doi.3": { "o": 7, "nhip": 12 },
  "nhac-doi.4": { "o": 11, "nhip": 20 },
  "nhac-doi.5": { "o": 9, "nhip": 8 },
  "nhac-doi.6": { "o": 12, "nhip": 33 },
  "nhac-doi.7": { "o": 14, "nhip": 18 },
  "nhac-doi.8": { "o": 15, "nhip": 33 },
  "nhac-doi.9": { "o": 8, "nhip": 12 },
  "nhac-doi.10": { "o": 11, "nhip": 16 },
  "che-nhac-doi.1": { "o": 10, "nhip": 6 },
  "che-nhac-doi.2": { "o": 15, "nhip": 20 },
  "che-nhac-doi.3": { "o": 23, "nhip": 20 },
  "che-nhac-doi.4": { "o": 6, "nhip": 8 },
  "che-nhac-doi.5": { "o": 10, "nhip": 8 },
  "che-nhac-doi.6": { "o": 26, "nhip": 32 },
  "che-nhac-doi.7": { "o": 17, "nhip": 20 },
  "che-nhac-doi.8": { "o": 13, "nhip": 33 },
  "che-nhac-doi.9": { "o": 10, "nhip": 16 },
  "che-nhac-doi.10": { "o": 28, "nhip": 80 },
  "can-tai.1": { "o": 10, "nhip": 6 },
  "can-tai.2": { "o": 15, "nhip": 20 },
  "can-tai.3": { "o": 9, "nhip": 8 },
  "can-tai.4": { "o": 3, "nhip": 4 },
  "can-tai.5": { "o": 20, "nhip": 24 },
  "can-tai.6": { "o": 24, "nhip": 43 },
  "can-tai.7": { "o": 9, "nhip": 16 },
  "can-tai.8": { "o": 23, "nhip": 39 },
  "can-tai.9": { "o": 20, "nhip": 29 },
  "can-tai.10": { "o": 24, "nhip": 96 },
  "che-can-tai.1": { "o": 13, "nhip": 6 },
  "che-can-tai.2": { "o": 20, "nhip": 20 },
  "che-can-tai.3": { "o": 19, "nhip": 14 },
  "che-can-tai.4": { "o": 10, "nhip": 16 },
  "che-can-tai.5": { "o": 21, "nhip": 18 },
  "che-can-tai.6": { "o": 25, "nhip": 43 },
  "che-can-tai.7": { "o": 25, "nhip": 32 },
  "che-can-tai.8": { "o": 33, "nhip": 44 },
  "che-can-tai.9": { "o": 27, "nhip": 60 },
  "che-can-tai.10": { "o": 34, "nhip": 70 },
  "cang-cu.1": { "o": 11, "nhip": 8 },
  "cang-cu.2": { "o": 11, "nhip": 8 },
  "cang-cu.3": { "o": 12, "nhip": 9 },
  "cang-cu.4": { "o": 11, "nhip": 9 },
  "cang-cu.5": { "o": 15, "nhip": 14 },
  "cang-cu.6": { "o": 16, "nhip": 9 },
  "cang-cu.7": { "o": 14, "nhip": 39 },
  "cang-cu.8": { "o": 26, "nhip": 24 },
  "cang-cu.9": { "o": 19, "nhip": 21 },
  "cang-cu.10": { "o": 18, "nhip": 78 },
  "che-cang-cu.1": { "o": 18, "nhip": 8 },
  "che-cang-cu.2": { "o": 12, "nhip": 8 },
  "che-cang-cu.3": { "o": 12, "nhip": 8 },
  "che-cang-cu.4": { "o": 21, "nhip": 22 },
  "che-cang-cu.5": { "o": 17, "nhip": 36 },
  "che-cang-cu.6": { "o": 25, "nhip": 38 },
  "che-cang-cu.7": { "o": 28, "nhip": 52 },
  "che-cang-cu.8": { "o": 15, "nhip": 39 },
  "che-cang-cu.9": { "o": 29, "nhip": 38 },
  "che-cang-cu.10": { "o": 31, "nhip": 126 },
  "doi-cang.1": { "o": 22, "nhip": 7 },
  "doi-cang.2": { "o": 23, "nhip": 7 },
  "doi-cang.3": { "o": 27, "nhip": 14 },
  "doi-cang.4": { "o": 26, "nhip": 11 },
  "doi-cang.5": { "o": 31, "nhip": 17 },
  "doi-cang.6": { "o": 28, "nhip": 18 },
  "doi-cang.7": { "o": 39, "nhip": 26 },
  "doi-cang.8": { "o": 28, "nhip": 13 },
  "doi-cang.9": { "o": 36, "nhip": 26 },
  "doi-cang.10": { "o": 43, "nhip": 68 },
  "che-doi-cang.1": { "o": 27, "nhip": 10 },
  "che-doi-cang.2": { "o": 30, "nhip": 12 },
  "che-doi-cang.3": { "o": 27, "nhip": 9 },
  "che-doi-cang.4": { "o": 28, "nhip": 10 },
  "che-doi-cang.5": { "o": 31, "nhip": 12 },
  "che-doi-cang.6": { "o": 30, "nhip": 18 },
  "che-doi-cang.7": { "o": 36, "nhip": 12 },
  "che-doi-cang.8": { "o": 30, "nhip": 14 },
  "che-doi-cang.9": { "o": 46, "nhip": 40 },
  "che-doi-cang.10": { "o": 47, "nhip": 44 },
  "tong-hop-cang.1": { "o": 23, "nhip": 30 },
  "tong-hop-cang.2": { "o": 25, "nhip": 64 },
  "tong-hop-cang.3": { "o": 21, "nhip": 30 },
  "tong-hop-cang.4": { "o": 33, "nhip": 80 },
  "tong-hop-cang.5": { "o": 30, "nhip": 50 },
  "tong-hop-cang.6": { "o": 9, "nhip": 8 },
  "tong-hop-cang.7": { "o": 30, "nhip": 68 },
  "tong-hop-cang.8": { "o": 27, "nhip": 31 },
  "tong-hop-cang.9": { "o": 25, "nhip": 139 },
  "tong-hop-cang.10": { "o": 34, "nhip": 158 },
  "trum-mua-cang.1": { "o": 25, "nhip": 34 },
  "trum-mua-cang.2": { "o": 36, "nhip": 84 },
  "trum-mua-cang.3": { "o": 34, "nhip": 60 },
  "trum-mua-cang.4": { "o": 29, "nhip": 46 },
  "trum-mua-cang.5": { "o": 27, "nhip": 86 },
  "trum-mua-cang.6": { "o": 38, "nhip": 114 },
  "trum-mua-cang.7": { "o": 35, "nhip": 92 },
  "trum-mua-cang.8": { "o": 34, "nhip": 102 },
  "trum-mua-cang.9": { "o": 36, "nhip": 79 },
  "trum-mua-cang.10": { "o": 40, "nhip": 166 },
  "xuong.1": { "o": 9, "nhip": 4 },
  "xuong.2": { "o": 8, "nhip": 5 },
  "xuong.3": { "o": 15, "nhip": 8 },
  "xuong.4": { "o": 10, "nhip": 9 },
  "xuong.5": { "o": 16, "nhip": 12 },
  "xuong.6": { "o": 14, "nhip": 6 },
  "xuong.7": { "o": 16, "nhip": 10 },
  "xuong.8": { "o": 14, "nhip": 14 },
  "xuong.9": { "o": 18, "nhip": 17 },
  "xuong.10": { "o": 21, "nhip": 36 },
  "ham-tra-ve.1": { "o": 7, "nhip": 6 },
  "ham-tra-ve.2": { "o": 12, "nhip": 8 },
  "ham-tra-ve.3": { "o": 13, "nhip": 9 },
  "ham-tra-ve.4": { "o": 17, "nhip": 12 },
  "ham-tra-ve.5": { "o": 12, "nhip": 7 },
  "ham-tra-ve.6": { "o": 15, "nhip": 9 },
  "ham-tra-ve.7": { "o": 21, "nhip": 11 },
  "ham-tra-ve.8": { "o": 17, "nhip": 10 },
  "ham-tra-ve.9": { "o": 16, "nhip": 10 },
  "ham-tra-ve.10": { "o": 23, "nhip": 28 },
  "day-keo.1": { "o": 9, "nhip": 5 },
  "day-keo.2": { "o": 8, "nhip": 5 },
  "day-keo.3": { "o": 12, "nhip": 5 },
  "day-keo.4": { "o": 11, "nhip": 5 },
  "day-keo.5": { "o": 16, "nhip": 8 },
  "day-keo.6": { "o": 20, "nhip": 9 },
  "day-keo.7": { "o": 22, "nhip": 12 },
  "day-keo.8": { "o": 19, "nhip": 8 },
  "day-keo.9": { "o": 17, "nhip": 14 },
  "day-keo.10": { "o": 17, "nhip": 18 },
  "bo-co-dinh.1": { "o": 11, "nhip": 6 },
  "bo-co-dinh.2": { "o": 21, "nhip": 9 },
  "bo-co-dinh.3": { "o": 16, "nhip": 6 },
  "bo-co-dinh.4": { "o": 27, "nhip": 15 },
  "bo-co-dinh.5": { "o": 21, "nhip": 8 },
  "bo-co-dinh.6": { "o": 24, "nhip": 11 },
  "bo-co-dinh.7": { "o": 11, "nhip": 6 },
  "bo-co-dinh.8": { "o": 23, "nhip": 11 },
  "bo-co-dinh.9": { "o": 32, "nhip": 12 },
  "bo-co-dinh.10": { "o": 29, "nhip": 26 },
  "dong-chay.1": { "o": 10, "nhip": 3 },
  "dong-chay.2": { "o": 10, "nhip": 7 },
  "dong-chay.3": { "o": 21, "nhip": 11 },
  "dong-chay.4": { "o": 24, "nhip": 9 },
  "dong-chay.5": { "o": 10, "nhip": 10 },
  "dong-chay.6": { "o": 21, "nhip": 8 },
  "dong-chay.7": { "o": 16, "nhip": 9 },
  "dong-chay.8": { "o": 17, "nhip": 9 },
  "dong-chay.9": { "o": 26, "nhip": 11 },
  "dong-chay.10": { "o": 30, "nhip": 24 },
  "che-dong-chay.1": { "o": 17, "nhip": 9 },
  "che-dong-chay.2": { "o": 22, "nhip": 11 },
  "che-dong-chay.3": { "o": 11, "nhip": 9 },
  "che-dong-chay.4": { "o": 19, "nhip": 12 },
  "che-dong-chay.5": { "o": 16, "nhip": 7 },
  "che-dong-chay.6": { "o": 24, "nhip": 9 },
  "che-dong-chay.7": { "o": 20, "nhip": 10 },
  "che-dong-chay.8": { "o": 21, "nhip": 11 },
  "che-dong-chay.9": { "o": 34, "nhip": 14 },
  "che-dong-chay.10": { "o": 41, "nhip": 24 },
  "cong-thuy-loi.1": { "o": 17, "nhip": 5 },
  "cong-thuy-loi.2": { "o": 17, "nhip": 5 },
  "cong-thuy-loi.3": { "o": 17, "nhip": 5 },
  "cong-thuy-loi.4": { "o": 21, "nhip": 7 },
  "cong-thuy-loi.5": { "o": 22, "nhip": 12 },
  "cong-thuy-loi.6": { "o": 9, "nhip": 4 },
  "cong-thuy-loi.7": { "o": 23, "nhip": 8 },
  "cong-thuy-loi.8": { "o": 20, "nhip": 8 },
  "cong-thuy-loi.9": { "o": 27, "nhip": 7 },
  "cong-thuy-loi.10": { "o": 31, "nhip": 34 },
  "che-cong.1": { "o": 17, "nhip": 6 },
  "che-cong.2": { "o": 18, "nhip": 12 },
  "che-cong.3": { "o": 18, "nhip": 11 },
  "che-cong.4": { "o": 23, "nhip": 11 },
  "che-cong.5": { "o": 24, "nhip": 7 },
  "che-cong.6": { "o": 24, "nhip": 10 },
  "che-cong.7": { "o": 21, "nhip": 7 },
  "che-cong.8": { "o": 25, "nhip": 7 },
  "che-cong.9": { "o": 31, "nhip": 20 },
  "che-cong.10": { "o": 42, "nhip": 39 },
  "tha-neo.1": { "o": 13, "nhip": 7 },
  "tha-neo.2": { "o": 13, "nhip": 6 },
  "tha-neo.3": { "o": 11, "nhip": 4 },
  "tha-neo.4": { "o": 14, "nhip": 7 },
  "tha-neo.5": { "o": 14, "nhip": 8 },
  "tha-neo.6": { "o": 22, "nhip": 9 },
  "tha-neo.7": { "o": 15, "nhip": 13 },
  "tha-neo.8": { "o": 21, "nhip": 9 },
  "tha-neo.9": { "o": 18, "nhip": 12 },
  "tha-neo.10": { "o": 34, "nhip": 18 },
  "che-tha-neo.1": { "o": 14, "nhip": 6 },
  "che-tha-neo.2": { "o": 13, "nhip": 4 },
  "che-tha-neo.3": { "o": 15, "nhip": 6 },
  "che-tha-neo.4": { "o": 16, "nhip": 5 },
  "che-tha-neo.5": { "o": 21, "nhip": 12 },
  "che-tha-neo.6": { "o": 26, "nhip": 9 },
  "che-tha-neo.7": { "o": 16, "nhip": 6 },
  "che-tha-neo.8": { "o": 26, "nhip": 10 },
  "che-tha-neo.9": { "o": 29, "nhip": 19 },
  "che-tha-neo.10": { "o": 36, "nhip": 18 },
  "buoc-duoi.1": { "o": 7, "nhip": 3 },
  "buoc-duoi.2": { "o": 8, "nhip": 4 },
  "buoc-duoi.3": { "o": 20, "nhip": 8 },
  "buoc-duoi.4": { "o": 11, "nhip": 7 },
  "buoc-duoi.5": { "o": 9, "nhip": 4 },
  "buoc-duoi.6": { "o": 24, "nhip": 12 },
  "buoc-duoi.7": { "o": 22, "nhip": 14 },
  "buoc-duoi.8": { "o": 25, "nhip": 7 },
  "buoc-duoi.9": { "o": 19, "nhip": 15 },
  "buoc-duoi.10": { "o": 24, "nhip": 15 },
  "che-buoc-duoi.1": { "o": 9, "nhip": 5 },
  "che-buoc-duoi.2": { "o": 9, "nhip": 3 },
  "che-buoc-duoi.3": { "o": 13, "nhip": 7 },
  "che-buoc-duoi.4": { "o": 23, "nhip": 7 },
  "che-buoc-duoi.5": { "o": 27, "nhip": 12 },
  "che-buoc-duoi.6": { "o": 35, "nhip": 9 },
  "che-buoc-duoi.7": { "o": 35, "nhip": 9 },
  "che-buoc-duoi.8": { "o": 30, "nhip": 12 },
  "che-buoc-duoi.9": { "o": 38, "nhip": 18 },
  "che-buoc-duoi.10": { "o": 38, "nhip": 25 },
  "suc-nuoc.1": { "o": 7, "nhip": 4 },
  "suc-nuoc.2": { "o": 7, "nhip": 9 },
  "suc-nuoc.3": { "o": 8, "nhip": 10 },
  "suc-nuoc.4": { "o": 10, "nhip": 9 },
  "suc-nuoc.5": { "o": 15, "nhip": 7 },
  "suc-nuoc.6": { "o": 15, "nhip": 7 },
  "suc-nuoc.7": { "o": 20, "nhip": 11 },
  "suc-nuoc.8": { "o": 30, "nhip": 15 },
  "suc-nuoc.9": { "o": 24, "nhip": 13 },
  "suc-nuoc.10": { "o": 20, "nhip": 12 },
  "che-suc-nuoc.1": { "o": 9, "nhip": 10 },
  "che-suc-nuoc.2": { "o": 18, "nhip": 7 },
  "che-suc-nuoc.3": { "o": 18, "nhip": 7 },
  "che-suc-nuoc.4": { "o": 21, "nhip": 9 },
  "che-suc-nuoc.5": { "o": 24, "nhip": 11 },
  "che-suc-nuoc.6": { "o": 23, "nhip": 11 },
  "che-suc-nuoc.7": { "o": 24, "nhip": 11 },
  "che-suc-nuoc.8": { "o": 30, "nhip": 15 },
  "che-suc-nuoc.9": { "o": 24, "nhip": 12 },
  "che-suc-nuoc.10": { "o": 25, "nhip": 17 },
  "ben-cu.1": { "o": 25, "nhip": 8 },
  "ben-cu.2": { "o": 31, "nhip": 8 },
  "ben-cu.3": { "o": 23, "nhip": 11 },
  "ben-cu.4": { "o": 28, "nhip": 10 },
  "ben-cu.5": { "o": 19, "nhip": 13 },
  "ben-cu.6": { "o": 32, "nhip": 13 },
  "ben-cu.7": { "o": 32, "nhip": 15 },
  "ben-cu.8": { "o": 33, "nhip": 21 },
  "ben-cu.9": { "o": 26, "nhip": 15 },
  "ben-cu.10": { "o": 25, "nhip": 17 },
  "che-ben-cu.1": { "o": 20, "nhip": 11 },
  "che-ben-cu.2": { "o": 16, "nhip": 6 },
  "che-ben-cu.3": { "o": 28, "nhip": 15 },
  "che-ben-cu.4": { "o": 31, "nhip": 13 },
  "che-ben-cu.5": { "o": 40, "nhip": 19 },
  "che-ben-cu.6": { "o": 32, "nhip": 17 },
  "che-ben-cu.7": { "o": 27, "nhip": 15 },
  "che-ben-cu.8": { "o": 33, "nhip": 16 },
  "che-ben-cu.9": { "o": 39, "nhip": 22 },
  "che-ben-cu.10": { "o": 44, "nhip": 43 },
  "doi-xuong.1": { "o": 36, "nhip": 8 },
  "doi-xuong.2": { "o": 37, "nhip": 10 },
  "doi-xuong.3": { "o": 31, "nhip": 7 },
  "doi-xuong.4": { "o": 41, "nhip": 8 },
  "doi-xuong.5": { "o": 33, "nhip": 6 },
  "doi-xuong.6": { "o": 47, "nhip": 24 },
  "doi-xuong.7": { "o": 57, "nhip": 11 },
  "doi-xuong.8": { "o": 48, "nhip": 28 },
  "doi-xuong.9": { "o": 42, "nhip": 12 },
  "doi-xuong.10": { "o": 56, "nhip": 44 },
  "che-doi-xuong.1": { "o": 37, "nhip": 9 },
  "che-doi-xuong.2": { "o": 39, "nhip": 20 },
  "che-doi-xuong.3": { "o": 50, "nhip": 15 },
  "che-doi-xuong.4": { "o": 33, "nhip": 7 },
  "che-doi-xuong.5": { "o": 43, "nhip": 24 },
  "che-doi-xuong.6": { "o": 51, "nhip": 14 },
  "che-doi-xuong.7": { "o": 51, "nhip": 28 },
  "che-doi-xuong.8": { "o": 56, "nhip": 16 },
  "che-doi-xuong.9": { "o": 60, "nhip": 38 },
  "che-doi-xuong.10": { "o": 64, "nhip": 48 },
  "tong-hop-song.1": { "o": 30, "nhip": 11 },
  "tong-hop-song.2": { "o": 31, "nhip": 16 },
  "tong-hop-song.3": { "o": 33, "nhip": 16 },
  "tong-hop-song.4": { "o": 42, "nhip": 19 },
  "tong-hop-song.5": { "o": 42, "nhip": 23 },
  "tong-hop-song.6": { "o": 41, "nhip": 27 },
  "tong-hop-song.7": { "o": 30, "nhip": 18 },
  "tong-hop-song.8": { "o": 34, "nhip": 15 },
  "tong-hop-song.9": { "o": 51, "nhip": 38 },
  "tong-hop-song.10": { "o": 51, "nhip": 60 },
  "trum-mua-song.1": { "o": 22, "nhip": 9 },
  "trum-mua-song.2": { "o": 31, "nhip": 13 },
  "trum-mua-song.3": { "o": 35, "nhip": 16 },
  "trum-mua-song.4": { "o": 42, "nhip": 23 },
  "trum-mua-song.5": { "o": 41, "nhip": 19 },
  "trum-mua-song.6": { "o": 59, "nhip": 43 },
  "trum-mua-song.7": { "o": 32, "nhip": 13 },
  "trum-mua-song.8": { "o": 43, "nhip": 36 },
  "trum-mua-song.9": { "o": 53, "nhip": 38 },
  "trum-mua-song.10": { "o": 54, "nhip": 63 }
};
  if (typeof module !== "undefined" && module.exports) module.exports = ds;
  if (typeof window !== "undefined") window.NguongSaoLoTrinh = ds;
})();
