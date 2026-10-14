/* ============================================================================
   san-ve.js — "Đường học": VẼ SÂN VÀ PHÁT LẠI VẾT (window.SanVe).
   Vẽ từ cấu hình sân của lõi { san, batDau, loaiRobot }: tường #, cờ F, bậc thang S,
   băng chuyền > < ^ v, vật o (thùng gỗ), ô đích D (khung vàng nét đứt), X (đích có sẵn vật, khung vàng đặc), robot.
   Robot luôn vẽ qua VeRobot.ve() (ve-robot.js), trên LỚP PHỦ cả sân (một canvas thứ hai nằm đè lên canvas sân, có lề tràn ra ngoài sân
   để tay kẹp nhô ra mép sân không bị cắt; độ phân giải = pixel thiết bị nên hình part luôn nguyên lần, rõ nét). Hạt, chớp đỏ, dấu ?/! cũng vẽ ở lớp phủ. Phát lại từng sự kiện 'nhip' của vết (kể cả tay gắp và vật).
   Chương cảm biến màu: ô sàn màu (ký hiệu r g b y trong sân hoặc lớp cfg.mau), vật có màu (cfg.vatMau, hay vat[i].mau), đích có màu (khung nét đứt tô màu đích;
   vật đúng màu nằm trên thì khung đặc, sai màu thì dấu ✗), vòng sáng + bong chữ màu khi cảm biến màu đọc (docCamBien.cam === 'mau').
   Chương nam châm: vật có chất (vatChat s sắt / g gỗ, hay vat[i].chat; sắt vẽ khối kim loại xám xanh, gỗ vẫn là thùng gỗ); tay nam châm (robot.tay === 'nam-cham'):
   vòng sóng tỏa 2 ô phía trước khi bật (dừng ở vật gỗ / tường), vật sắt bị hút bay về ô sát mũi xe rồi DÍNH (vẽ trên lớp phủ, theo xe và quay theo xe),
   thả thì rơi xuống, hut-go = sóng chạm vật gỗ rồi tắt + dấu ?, tha-bi-chan = vật rung + dấu !, cảm biến từ front_metal() = tia bạc (sắt) / nâu (gỗ).
   Chương máy ném: hàng rào thấp '=' (cọc + thanh ngang, thấy sàn phía sau, thanh nối liền ô kề), cfg.roBanDau = rổ có sẵn vật; robot.tay === 'nem': rổ ở đầu cần ném
   (vật trong rổ đi theo xe và quay theo xe), vạch ngắm mờ + vòng ở ô rơi theo tầm aim(n) (Field.datTam), nap-vat = vật nhảy vào rổ, nem-vat = vật bay vòng cung (to dần rồi nhỏ lại,
   bóng đổ dưới đất) qua rào / tường, nem-roi = nảy nhẹ, nem-vo = vỡ mảnh + ô rơi tô đỏ (ngoài sân thì ở mép), nem-hut / nap-hut = dấu ?, ro-day = dấu !.
   Chương súng bóng: nút bắn N (nằm trên tường, bật / tắt theo vết `nut`), cửa C đóng / c mở (trượt mở / đóng theo vết `cua`; cửa nhịp có hàng đèn đếm nhịp), băng chuyền tắt (vết `bangTat`)
   đứng yên và mờ; robot.tay === 'bong': ban = bóng tròn bay thẳng từ miệng súng tới ô `den` (trúng nút thì nút lóe rồi đổi, băng đổi ngay, cửa đổi ở cuối nhịp;
   bị chặn thì nảy ra; ra khỏi sân thì bay mất ở mép), cua-ket = cửa rung đỏ, ban-hut / ban-bi-chan = dấu ?, het-dan / ban-goi-lai = dấu !, số đạn còn (cfg.danToiDa) ở góc sân.
   Không chứa luật chơi: mọi kết quả (vị trí, hướng, sự kiện) đến từ lõi (SanHoc).
   ========================================================================== */
(function () {
  'use strict';

  var T = Ve.T;
  var K_INK = '#1b120a';
  var BANG = { '>': 1, 'v': 2, '<': 3, '^': 0 };
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  var FIELDS = [];
  var MAU_KY = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
  var MAU_RA = { red: 'r', green: 'g', blue: 'b', yellow: 'y' };
  function chuanMau(m) { return typeof m === 'string' ? (MAU_KY[m] || (MAU_RA[m] ? m : null)) : null; }
  /** Lớp màu (mảng chuỗi r g b y '.') + ký hiệu r g b y trong hàng sân → mảng hàng tên màu / null; null nếu sân không có ô màu. */
  function dungLopMau(rows, lop) {
    var h = rows.length, w = rows[0].length, kq = [], co = false;
    for (var y = 0; y < h; y++) {
      var hang = [];
      for (var x = 0; x < w; x++) {
        var m = MAU_KY[rows[y][x]] || (lop && lop[y] ? MAU_KY[lop[y][x]] : null) || null;
        if (m && rows[y][x] === '#') m = null;
        if (m) co = true;
        hang.push(m);
      }
      kq.push(hang);
    }
    return co ? kq : null;
  }
  var HIEU_UNG = { 'dinh-vat': 1, 'nhat-vat': 1, 'dat-vat': 1, 'vat-vo': 1, 'kep-hut': 1, 'xong-dua-vat': 1, 'xich-quay-do': 1, 'omni-khong-cheo': 1, 'xong-day-thung': 1, 'day-dung-yen': 1, 'nem-dung-yen': 1, 'doc-cam-bien': 1, 'ban-hut': 1, 'ban-bi-chan': 1, 'ban-goi-lai': 1, 'ban-dung-yen': 1, 'nut-doi': 1, 'bang-doi': 1, 'cua-doi': 1, 'cua-ket': 1 };   // sự kiện tức thì của tay (không chiếm thời gian của nhịp)

  function ngu(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  function Field(cv, tuyChon) {
    tuyChon = tuyChon || {};
    this.cv = cv; this.g = cv.getContext('2d');
    this.kich = tuyChon.kich || 210;           // cạnh khung (px màn hình) dành cho sân
    this.coNhoNhat = tuyChon.coNhoNhat || 0;   // >0: sân đông ô thì thu nhỏ ô (không nguyên lần) tới cỡ này (px màn hình)
    this.lamps = tuyChon.lamps || null;        // { T, P } phần tử đèn bánh
    this.rid = 0; this.cfg = null;
    this.lop = null; this.lg = null; this.lopOK = false; this.lopKhoa = ''; this.dem = 0;   // lớp phủ robot
    this.lst = { L: -1, R: -1 };
    this.clearFx();
    FIELDS.push(this);
  }
  Field.prototype = {
    /** Nạp một sân: cfg = { san: [chuỗi], batDau: {x,y,huong}, loaiRobot,
     *  danhDau: {x,y} (tuỳ chọn: vòng mờ đánh dấu ô xuất phát), vat: [{x,y}] (tuỳ chọn: khối hàng vẽ trên sàn, không ảnh hưởng luật), cat: {trai,phai,tren,duoi} (tuỳ chọn: cạnh nào bị cắt → vẽ dấu …) }. */
    nap: function (cfg) {
      var rows = cfg.san, w = rows[0].length, h = rows.length;
      var loai = cfg.loaiRobot || 'banh';
      this.cfg = { rows: rows, w: w, h: h, bd: cfg.batDau, loai: loai, co: null, dd: cfg.danhDau || null, cat: cfg.cat || null, vat: cfg.vat || [], mauO: dungLopMau(rows, cfg.mau), vatMau: cfg.vatMau || null, vatChat: cfg.vatChat || null, roBanDau: cfg.roBanDau || null, danToiDa: typeof cfg.danToiDa === 'number' ? cfg.danToiDa : null,
        robot: cfg.robot || { than: loai === 'nhen' ? 'nhen' : 'hai-banh', tay: null, camBien: [] }, dich: [] };
      this.vat0 = []; this.thung0 = [];
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var ch = rows[y][x];
        if (ch === 'F' && !this.cfg.co) this.cfg.co = { x: x, y: y };
        if (ch === 'D' || ch === 'X' || ch === 'h') this.cfg.dich.push({ x: x, y: y, mau: this.mauNen(x, y) });
        if (ch === 'o' || ch === 'X') this.themVat(x, y, this.cfg.vatMau && this.cfg.vatMau[y] ? MAU_KY[this.cfg.vatMau[y][x]] : null, this.cfg.vatChat && this.cfg.vatChat[y] && this.cfg.vatChat[y][x] === 's' ? 'sat' : null);
        if (ch === 'H' || ch === 'h') this.themThung(x, y);
      }
      (cfg.vat || []).forEach(function (o) { this.themVat(Math.floor(o.x), Math.floor(o.y), chuanMau(o.mau), o.chat === 'sat' ? 'sat' : null); }, this);   // cùng thứ tự với SanHoc.chay: id 1, 2, ...
      if (cfg.roBanDau && this.cfg.robot.tay === 'nem') {          // máy ném: rổ có sẵn một vật lúc xuất phát (id cuối cùng, như SanHoc.chay)
        var rb = typeof cfg.roBanDau === 'object' ? cfg.roBanDau : {};
        this.vat0.push({ id: this.vat0.length + 1, x: cfg.batDau.x, y: cfg.batDau.y, mau: chuanMau(rb.mau), chat: rb.chat === 'sat' ? 'sat' : 'go', ro: true });
      }
      this.dungCua(rows, cfg.cuaNhip);
      (cfg.thung || []).forEach(function (o) { this.themThung(Math.floor(o.x), Math.floor(o.y)); }, this);   // thùng nặng thêm ngoài sân (sân thử của Xưởng): cùng thứ tự với SanHoc.chay
      this.cv.width = w * T; this.cv.height = h * T;
      var thoGoc = this.kich / (Math.max(w, h) * T), k = Math.max(1, Math.floor(thoGoc));
      if (this.coNhoNhat && thoGoc < 1) k = Math.max(thoGoc, this.coNhoNhat / T);   // ô nhỏ lại cho vừa khung, không dưới coNhoNhat
      this.k = k;
      this.cv.style.width = (w * T * k) + 'px'; this.cv.style.height = (h * T * k) + 'px';
      this.g = this.cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
      this.lopKhoa = ''; this.doiCo();
      this.datLai();
    },
    /** Màu sàn của ô (x, y) (tên màu của lõi) hoặc null. */
    mauNen: function (x, y) {
      var m = this.cfg.mauO;
      return m && m[y] && m[y][x] ? m[y][x] : null;
    },
    /** Thêm một vật ban đầu (mỗi ô tối đa một, không nằm trong tường / ngoài sân), id = thứ tự thêm. mau: tên màu của vật hoặc null. */
    themVat: function (x, y, mau, chat) {
      var c = this.cfg;
      if (!(x >= 0 && y >= 0 && x < c.w && y < c.h) || c.rows[y][x] === '#' || c.rows[y][x] === '=') return;
      for (var i = 0; i < this.vat0.length; i++) if (this.vat0[i].x === x && this.vat0[i].y === y) return;
      this.vat0.push({ id: this.vat0.length + 1, x: x, y: y, mau: mau || null, chat: chat === 'sat' ? 'sat' : 'go' });
    },
    /** Thêm một thùng nặng ban đầu (mỗi ô tối đa một, không nằm trong tường / ngoài sân), id = thứ tự thêm. */
    themThung: function (x, y) {
      var c = this.cfg;
      if (!(x >= 0 && y >= 0 && x < c.w && y < c.h) || c.rows[y][x] === '#') return;
      for (var i = 0; i < this.thung0.length; i++) if (this.thung0[i].x === x && this.thung0[i].y === y) return;
      this.thung0.push({ id: this.thung0.length + 1, x: x, y: y });
    },
    /** Súng bóng: danh sách cửa (C đóng / c mở) và hướng đi qua cửa, cùng chu kỳ của cửa nhịp [{ x, y, mo, dong, pha }]. Cửa đi theo chiều dọc (doc: hai cánh trượt ngang)
     *  khi hai bên trái / phải là tường, đi theo chiều ngang khi hai bên trên / dưới là tường; không rõ thì coi là chiều dọc. */
    dungCua: function (rows, cuaNhip) {
      var w = rows[0].length, h = rows.length, x, y, ch;
      function tuong(a, b) { if (a < 0 || b < 0 || a >= w || b >= h) return true; var c = rows[b][a]; return c === '#' || c === 'N'; }
      this.cuaDS = []; this.cuaNhipBy = {};
      for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
        ch = rows[y][x];
        if (ch !== 'C' && ch !== 'c') continue;
        var ngang = tuong(x - 1, y) && tuong(x + 1, y), dung = tuong(x, y - 1) && tuong(x, y + 1);
        this.cuaDS.push({ x: x, y: y, mo0: ch === 'c', doc: !(dung && !ngang) });
      }
      (cuaNhip || []).forEach(function (cn) { this.cuaNhipBy[cn.x + ',' + cn.y] = { mo: cn.mo, dong: cn.dong, pha: cn.pha || 0 }; }, this);
    },
    /** Trạng thái hiển thị ban đầu của nút, cửa, băng chuyền: nút tắt, cửa theo ký hiệu (cửa nhịp: theo pha), băng chạy hết. */
    datLaiCua: function () {
      this.nutT = {}; this.cuaT = {}; this.bangTat = {}; this.bangLoe = {}; this.nhipDa = 0;
      var self = this;
      this.cuaDS.forEach(function (d) {
        var nh = self.cuaNhipBy[d.x + ',' + d.y], mo = nh ? (nh.pha % (nh.mo + nh.dong)) < nh.mo : d.mo0;
        self.cuaT[d.x + ',' + d.y] = { x: d.x, y: d.y, mo: mo, k: mo ? 1 : 0, doc: d.doc, nhip: nh || null, ket: 0, rung: 0 };
      });
    },
    datLai: function () {
      this.rid++;
      var b = this.cfg.bd;
      this.vis = { x: b.x, y: b.y, d: b.huong || 0, goc: 0, chan: 0, hop: 0, dx: 0, dy: 0, tay: { tuThe: 'tren', kep: false, cam: null }, tayDo: 0, bao: null, baoDen: 0, ra: 0 };
      this.objs = this.vat0.map(function (o) { return { id: o.id, x: o.x, y: o.y, tt: o.ro ? 'ro' : 'dat', voLuc: 0, mau: o.mau || null, chat: o.chat || 'go', nang: 0, dx: 0, dy: 0 }; });
      this.vis.nem = this.cfg.robot.tay === 'nem' ? { tam: 1, ang: null, dang: 0, rung: 0, loi: 0, doi: 0 } : null;      // máy ném: tam = tầm đang đặt; ang = góc đầu cần khi đang quay; dang = tới lúc nào cần còn vung lên; rung = rổ rung; doi = lúc vừa đổi tầm
      this.oVo = [];                                                                                          // ô rơi vỡ (nem-vo): tô đỏ tới khi chạy lại
      this.vis.nc = this.cfg.robot.tay === 'nam-cham' ? { bat: false, ang: null, rung: 0 } : null;       // tay nam châm: bat = đang bật; ang = góc mũi xe khi đang quay (null: theo hướng xe); rung = tới lúc nào vật dính còn rung
      this.vis.sung = this.cfg.robot.tay === 'bong' ? { dan: this.cfg.danToiDa, ban: 0, het: 0 } : null;      // súng bóng: dan = số viên còn (null: vô hạn); ban = tới lúc nào nòng còn lóe; het = hết đạn, nhấp nháy đỏ
      this.bong = null;                                                                                         // quả bóng đang bay: { x, y, r, a } (pixel sân)
      this.datLaiCua();
      this.canhBao = null;
      this.thungs = this.thung0.map(function (o) { return { id: o.id, x: o.x, y: o.y, dx: 0, dy: 0, ket: false }; });
      this.clearFx();
    },
    clearFx: function () { this.wh = { L: 0, R: 0 }; this.parts = []; this.bounce = 0; this.flash = 0; this.docs = []; },
    /**
     * Cảm biến khoảng cách vừa đọc (mục lệnh có `docCamBien` của vết): cảm biến ở hông sáng và một tia mờ chạy tới ô được đo
     * (xanh nếu trống, đỏ nếu chặn) trong ms mili giây. Đọc nhiều lần liên tiếp thì GỘP: cảm biến sáng liền một lượt, mỗi ô được đo một tia
     * (đọc lại đúng ô cũ chỉ làm tia sáng lại).
     */
    docCamBien: function (d, ms) {
      if (!d || !d.tu || (!d.o && d.cam !== 'tu')) return;           // cảm biến từ không thấy vật thì o = null: vẫn có tia (tới chỗ tường hay hết tầm)
      var now = performance.now(), key = d.tu.x + ',' + d.tu.y + '>' + (d.o ? d.o.x + ',' + d.o.y : '-' + d.huong), ds = this.docs, i;
      ms = Math.max(140, ms || 360);
      for (i = ds.length - 1; i >= 0; i--) if (ds[i].key === key) { ds.splice(i, 1); break; }
      ds.push({ key: key, tu: d.tu, o: d.o, huong: d.huong, trong: !!d.trong, vat: d.vat || null, cam: d.cam || null, mau: d.mau || null, chat: d.chat || null, dai: d.cam === 'tu' ? this.tamTrong(d.tu, d.huong) : 0, t0: now, ms: ms });
      while (ds.length > 6) ds.shift();
      if (d.cam === 'mau' && this.vis) this.vis.bongMau = { mau: d.mau || 'none', den: now + Math.max(ms, 300) };      // bong chữ màu vừa đọc nổi trên xe trong khoảng một nhịp
    },
    /** Còn tia cảm biến đang sáng không (cảm biến trên thân xe sáng cùng lúc). */
    camBienSang: function (now) {
      for (var i = 0; i < this.docs.length; i++) if (now - this.docs[i].t0 < this.docs[i].ms * 0.85) return true;
      return false;
    },
    /** Vẽ các tia cảm biến (theo pixel sân): vệt mờ dần từ mũi xe tới ô được đo; ô bị chặn có dấu X ở sát mép ô đó. */
    veTia: function (g, now) {
      var ds = this.docs, i;
      for (i = ds.length - 1; i >= 0; i--) if (now - ds[i].t0 >= ds[i].ms) ds.splice(i, 1);
      for (i = 0; i < ds.length; i++) {
        var d = ds[i], u = (now - d.t0) / d.ms, a = u < 0.55 ? 1 : Math.max(0, 1 - (u - 0.55) / 0.45), rgb = d.trong ? '93,255,122' : '255,74,60';
        if (d.cam === 'mau') continue;                                           // cảm biến màu: vòng sáng vẽ dưới robot (veVongMauDuoi)
        if (d.cam === 'tu') { this.veTiaTu(g, d, u, a); continue; }              // cảm biến từ: tia bạc tới vật sắt / tia nâu tới vật gỗ
        var vx = DX[d.huong], vy = DY[d.huong], x0 = d.tu.x * T + 7 + vx * 5, y0 = d.tu.y * T + 7 + vy * 5;
        var cx = d.o.x * T + 7, cy = d.o.y * T + 7, x1 = d.trong ? cx : cx - vx * 6, y1 = d.trong ? cy : cy - vy * 6;
        g.fillStyle = 'rgba(' + rgb + ',' + (0.3 * a).toFixed(3) + ')'; g.fillRect(d.o.x * T, d.o.y * T, T, T);     // ô được đo ám nhẹ
        g.save();
        g.strokeStyle = 'rgba(' + rgb + ',' + (0.95 * a).toFixed(3) + ')'; g.lineWidth = 1.5; g.setLineDash([3, 1]); g.lineDashOffset = -((now / 40) % 3);
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.setLineDash([]); g.lineWidth = 1;
        g.lineWidth = 1.5;
        if (d.trong) g.strokeRect(Math.round(cx) - 3, Math.round(cy) - 3, 6, 6);
        else { g.beginPath(); g.moveTo(x1 - 2.5, y1 - 2.5); g.lineTo(x1 + 2.5, y1 + 2.5); g.moveTo(x1 + 2.5, y1 - 2.5); g.lineTo(x1 - 2.5, y1 + 2.5); g.stroke(); }
        g.restore();
      }
    },
    /** Số pixel (từ mũi xe) mà tia / sóng nam châm đi được theo hướng h từ ô `tu`, tối đa 2 ô: tường, mép sân, thùng nặng chắn thì dừng sát mép ô đó (không xét vật). */
    tamTrong: function (tu, h) {
      var c = this.cfg, d, x, y;
      for (d = 1; d <= 2; d++) {
        x = tu.x + DX[h] * d; y = tu.y + DY[h] * d;
        if (x < 0 || y < 0 || x >= c.w || y >= c.h || c.rows[y][x] === '#' || this.thungTaiO(x, y)) return (d - 1) * T + 1;
      }
      return 2 * T + 2;
    },
    /** Tia của cảm biến từ front_metal(): nét đứt từ mũi xe tới vật được đo (bạc nếu sắt, nâu nếu gỗ); không có vật thì tia mờ chạy hết tầm. u = tiến độ 0..1, a = độ đậm. */
    veTiaTu: function (g, d, u, a) {
      var vx = DX[d.huong], vy = DY[d.huong], sat = d.chat === 'sat', go = d.chat === 'go', rgb = sat ? '226,238,252' : go ? '196,134,72' : '150,176,206';
      var x0 = d.tu.x * T + 7 + vx * 7, y0 = d.tu.y * T + 7 + vy * 7, dai, x1, y1;
      if (d.o) { x1 = d.o.x * T + 7; y1 = d.o.y * T + 7; g.fillStyle = 'rgba(' + rgb + ',' + ((sat ? 0.34 : 0.26) * a).toFixed(3) + ')'; g.fillRect(d.o.x * T, d.o.y * T, T, T); }
      else { dai = d.dai || 0; x1 = x0 + vx * dai; y1 = y0 + vy * dai; }
      g.save();
      var dm = Math.min(1, u / 0.35);                                           // tia chạy ra trong 35% đầu
      var xe = x0 + (x1 - x0) * dm, ye = y0 + (y1 - y0) * dm;
      g.strokeStyle = 'rgba(' + rgb + ',' + ((d.o ? 0.95 : 0.55) * a).toFixed(3) + ')'; g.lineWidth = sat ? 2 : 1.5; g.setLineDash(sat ? [4, 1] : [3, 2]); g.lineDashOffset = -((performance.now() / 40) % 5);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(xe, ye); g.stroke();
      g.setLineDash([]);
      if (d.o && dm >= 1) {
        var cx = x1, cy = y1;
        if (sat) {                                                              // lóe bốn cánh trên vật sắt
          var s = 2 + Math.round(Math.abs(Math.sin(u * 9)) * 2);
          g.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(cx - s - 2, cy); g.lineTo(cx + s + 2, cy); g.moveTo(cx, cy - s - 2); g.lineTo(cx, cy + s + 2); g.stroke();
        } else {                                                                // dấu X nâu trên vật gỗ: không hút được
          g.strokeStyle = 'rgba(120,70,30,' + a.toFixed(3) + ')'; g.lineWidth = 2;
          g.beginPath(); g.moveTo(cx - 3, cy - 3); g.lineTo(cx + 3, cy + 3); g.moveTo(cx + 3, cy - 3); g.lineTo(cx - 3, cy + 3); g.stroke();
        }
      } else if (!d.o && dm >= 1) {                                             // không thấy gì: gạch cụt ở cuối tia
        g.strokeStyle = 'rgba(' + rgb + ',' + (0.7 * a).toFixed(3) + ')'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(x1 - vy * 3, y1 + vx * 3); g.lineTo(x1 + vy * 3, y1 - vx * 3); g.stroke();
      }
      g.restore();
    },
    /** Màu hiển thị của một lần đọc màu: 'none' (ô không màu) là xám nhạt. */
    mauHien: function (mau) { return Ve.MAU[mau] ? Ve.MAU[mau].vi : '#d8dfeb'; },
    /** Vòng sáng của cảm biến màu ở ô vừa đọc (vẽ DƯỚI robot): vòng nở ra rồi mờ dần, tô màu vừa đọc được (ô không màu: xám nhạt). */
    veVongMauDuoi: function (g, now) {
      var ds = this.docs, i;
      for (i = 0; i < ds.length; i++) {
        var d = ds[i]; if (d.cam !== 'mau') continue;
        var u = Math.min(1, (now - d.t0) / d.ms), a = u < 0.5 ? 1 : Math.max(0, 1 - (u - 0.5) / 0.5), col = this.mauHien(d.mau), cx = d.o.x * T + 7, cy = d.o.y * T + 7 + 1;
        g.save();
        g.globalAlpha = (d.mau === 'none' ? 0.32 : 0.5) * a; g.fillStyle = col;
        g.beginPath(); g.ellipse(cx, cy, 6.2, 5.2, 0, 0, 6.2832); g.fill();
        g.globalAlpha = 0.95 * a; g.strokeStyle = col; g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(cx, cy, 4 + u * 3.4, 3.4 + u * 2.8, 0, 0, 6.2832); g.stroke();
        g.restore();
      }
    },
    /** Bong chữ màu cảm biến vừa đọc, nổi trên xe: "red" ... (một nhịp). cao = khoảng cách từ tâm xe tới đáy bong. */
    veBongMau: function (g, cx, cy, now, cao) {
      var b = this.vis.bongMau; if (!b || b.den <= now) return;
      var col = this.mauHien(b.mau), txt = '"' + b.mau + '"';
      g.save();
      g.font = '8px VT323, monospace'; g.textBaseline = 'middle'; g.textAlign = 'center';
      var w = Math.ceil(g.measureText(txt).width) + 5, hh = 9, x = Math.round(cx - w / 2), y = Math.max(1, Math.round(cy - cao - hh));
      x = Math.max(1, Math.min(this.cv.width - w - 1, x));
      g.globalAlpha = Math.min(1, (b.den - now) / 120);
      g.fillStyle = '#1b120a'; g.fillRect(x - 1, y - 1, w + 2, hh + 2);
      g.fillStyle = '#2a2236'; g.fillRect(x, y, w, hh);
      g.fillStyle = col; g.fillRect(x, y, w, 1); g.fillRect(x, y + hh - 1, w, 1); g.fillRect(x, y, 1, hh); g.fillRect(x + w - 1, y, 1, hh);
      g.fillText(txt, Math.round(x + w / 2), y + hh / 2 + 0.5);
      g.restore();
    },
    /** Phun hạt. Tùy chọn: sz = cạnh hạt (px sân), mo = true thì hạt mờ dần khi sắp hết. */
    burst: function (cx, cy, n, cols, sp, sz, mo) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, s = (sp || 1) * (0.3 + Math.random() * 0.9);
        this.parts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.5, life: 28 + Math.random() * 30, c: cols[i % cols.length], s: sz || 1, mo: !!mo });
      }
    },
    mungThang: function () {
      this.bounce = performance.now() + 900;
      var cols = ['#ffd23f', '#fff6e3', '#38c6de', '#ff7ac8', '#6fe06a', '#ff5a4a'];
      var f = this.cfg.co;
      if (f) { this.burst(f.x * T + 7, f.y * T + 5, 60, cols, 1.2); return; }
      var ds = this.cfg.dich;                                   // mục tiêu đưa vật: pháo giấy trên các ô đích
      for (var i = 0; i < ds.length; i++) this.burst(ds[i].x * T + 7, ds[i].y * T + 5, Math.max(12, Math.floor(60 / ds.length)), cols, 1.2);
    },
    /** Đặt dấu nổi trên xe ('?' kẹp hụt, '!' ô đã có vật) trong ms mili giây. */
    baoHieu: function (kieu, ms) { this.vis.bao = kieu; this.vis.baoDen = performance.now() + (ms || 1200); },
    /** Chớp đỏ (đâm tường / lỗi). */
    chopDo: function (ms) { this.flash = performance.now() + (ms || 160); },

    /* ---- ô đích, vật, dấu nổi */
    /** Ô đích còn trống: nền vàng nhạt + khung nét đứt chạy chậm. Đích có màu: ô đã là tấm màu, khung nét đứt tô màu đích (sáng hơn nền). */
    veDichTrong: function (g, now) {
      var ds = this.cfg.dich; if (!ds.length) return;
      g.save(); g.lineWidth = 1; g.setLineDash([3, 2]); g.lineDashOffset = -((now / 140) % 5);
      for (var i = 0; i < ds.length; i++) {
        var d = ds[i], x = d.x * T, y = d.y * T, vo = this.vatTaiO(d.x, d.y);
        if ((vo && this.vatDungMau(vo, d)) || this.thungTaiO(d.x, d.y)) continue;
        if (d.mau) {
          g.setLineDash([]); g.strokeStyle = '#1b120a'; g.strokeRect(x + 2.5, y + 2.5, T - 5, T - 5);     // viền tối trong để khung sáng nổi trên nền cùng màu
          g.setLineDash([3, 2]); g.strokeStyle = Ve.MAU[d.mau].vi; g.lineWidth = 1.5; g.strokeRect(x + 1.25, y + 1.25, T - 2.5, T - 2.5); g.lineWidth = 1;
          continue;
        }
        g.fillStyle = 'rgba(255,210,63,.22)'; g.fillRect(x, y, T, T);
        g.strokeStyle = '#ffd23f'; g.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
      }
      g.restore();
    },
    /** Vật o có hợp ô đích d không (đích không màu nhận mọi vật; đích có màu chỉ nhận vật cùng màu). */
    vatDungMau: function (o, d) { return !d.mau || o.mau === d.mau; },
    /** Khung đặc của ô đích đã có vật nằm (đích có màu: màu đích, có viền tối cho nổi). */
    veKhungDay: function (g, d) {
      if (d.mau) {
        g.lineWidth = 3; g.strokeStyle = '#1b120a'; g.strokeRect(d.x * T + 1.5, d.y * T + 1.5, T - 3, T - 3);
        g.lineWidth = 2; g.strokeStyle = Ve.MAU[d.mau].vi;
      } else { g.lineWidth = 2; g.strokeStyle = '#ffd23f'; }
      g.strokeRect(d.x * T + 1, d.y * T + 1, T - 2, T - 2); g.lineWidth = 1;
    },
    /** Dấu ✗ nhỏ ở góc trên phải ô (x, y): vật thả sai màu đích. */
    veDauSai: function (g, x, y) {
      var X = [[0, 0], [1, 1], [2, 2], [3, 3], [0, 3], [1, 2], [2, 1], [3, 0]], i, ox = x * T + T - 6, oy = y * T + 2;
      g.fillStyle = '#1b120a';
      for (i = 0; i < X.length; i++) { g.fillRect(ox + X[i][0] - 1, oy + X[i][1], 3, 1); g.fillRect(ox + X[i][0], oy + X[i][1] - 1, 1, 3); }
      g.fillStyle = '#ff4a3c';
      for (i = 0; i < X.length; i++) g.fillRect(ox + X[i][0], oy + X[i][1], 1, 1);
    },
    /** Ô đích đã có vật nằm: khung đặc đè lên viền thùng (đích có màu mà vật sai màu: giữ khung nét đứt, thêm ✗). */
    veDichDay: function (g) {
      var ds = this.cfg.dich;
      for (var i = 0; i < ds.length; i++) {
        var d = ds[i], o = this.vatTaiO(d.x, d.y);
        if (!o && !this.thungTaiO(d.x, d.y)) continue;
        if (o && !this.vatDungMau(o, d)) {
          g.save(); g.lineWidth = 1; g.setLineDash([3, 2]); g.strokeStyle = Ve.MAU[d.mau].vi; g.strokeRect(d.x * T + 1.25, d.y * T + 1.25, T - 2.5, T - 2.5); g.restore();
          this.veDauSai(g, d.x, d.y);
          continue;
        }
        this.veKhungDay(g, d);
      }
    },
    /** Thùng nặng đang nằm đúng ô (x, y) (đã dừng hẳn, không đang trượt). */
    thungTaiO: function (x, y) {
      var ds = this.thungs || [];
      for (var i = 0; i < ds.length; i++) if (Math.abs(ds[i].x - x) < 0.01 && Math.abs(ds[i].y - y) < 0.01) return ds[i];
      return null;
    },
    thungTheoId: function (id) {
      var ds = this.thungs || [];
      for (var i = 0; i < ds.length; i++) if (ds[i].id === id) return ds[i];
      return null;
    },
    /** Thùng nặng: thép xám có đinh tán và sọc vàng đen. Thùng kẹt góc thì ô tô đỏ nhấp nháy và thùng ngả đỏ. */
    veThung: function (g, TL, now) {
      var ds = this.thungs || [];
      var nhun = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 2) : 0;
      for (var i = 0; i < ds.length; i++) {
        var o = ds[i], px = Math.round(o.x * T + o.dx), py = Math.round(o.y * T + o.dy);
        if (o.ket) {
          var nhay = 0.28 + 0.14 * Math.sin(now / 120);
          g.fillStyle = 'rgba(255,40,30,' + nhay.toFixed(2) + ')'; g.fillRect(Math.round(o.x) * T, Math.round(o.y) * T, T, T);
        }
        g.drawImage(TL.thung, px, py + (this.thungTaiDich(o) ? nhun : 0));
        if (o.ket) { g.fillStyle = 'rgba(230,30,20,.42)'; g.fillRect(px + 1, py + 1, T - 2, T - 2); g.strokeStyle = '#ff3b30'; g.lineWidth = 1; g.strokeRect(Math.round(o.x) * T + 0.5, Math.round(o.y) * T + 0.5, T - 1, T - 1); }
      }
    },
    thungTaiDich: function (o) {
      for (var i = 0; i < this.cfg.dich.length; i++) if (this.cfg.dich[i].x === o.x && this.cfg.dich[i].y === o.y) return true;
      return false;
    },
    vatTaiO: function (x, y) {
      for (var i = 0; i < this.objs.length; i++) { var o = this.objs[i]; if (o.tt === 'dat' && o.x === x && o.y === y) return o; }
      return null;
    },
    dichTaiO: function (x, y) {
      for (var i = 0; i < this.cfg.dich.length; i++) if (this.cfg.dich[i].x === x && this.cfg.dich[i].y === y) return this.cfg.dich[i];
      return null;
    },
    vatTaiDich: function (o) {
      for (var i = 0; i < this.cfg.dich.length; i++) if (this.cfg.dich[i].x === o.x && this.cfg.dich[i].y === o.y) return true;
      return false;
    },
    /** Vật nằm đất (luật vật 14/10): nhỏ, khoảng 57% ô (8 trên 14 pixel sân), giữa ô, có bóng đổ; vật vỡ mờ dần trong 0,8 giây; vật đang cầm (kẹp) vẽ ở lớp phủ
     *  ngay dưới ảnh robot (veVatKep); vật đang trượt vào / ra kẹp (tt 'anim', o.k 0 = nằm đất, 1 = trong kẹp) vẽ ở đây theo vị trí xe hiện tại. */
    veVat: function (g, TL, now) {
      var nhun = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 2) : 0;
      for (var i = 0; i < this.objs.length; i++) {
        var o = this.objs[i], rg = o.rung > now ? Math.sin(now / 22) * 1.3 : 0;
        if (o.tt === 'dat') this.veMotVat(g, o, 8, o.x * T + 7 + (o.dx || 0) + rg, o.y * T + 6 + (o.dy || 0) - (o.nang || 0) + (this.vatTaiDich(o) ? nhun : 0), 8, 2);
        else if (o.tt === 'anim') this.veVatTruot(g, o, now);
        else if (o.tt === 'vo' && o.voLuc) {
          var k = (now - o.voLuc) / 800;
          if (k < 1) { g.globalAlpha = 0.7 * (1 - k); g.drawImage(this.hinhVat(o, 8), Math.round(o.x * T + 3), Math.round(o.y * T + 2 - k * 4)); g.globalAlpha = 1; }
        }
      }
    },
    /** Hình của vật o: sắt (khối kim loại) hay gỗ (thùng), có dải màu nếu vật mang màu; n = cạnh (8: nằm đất, 10: trong kẹp tính theo pixel part). */
    hinhVat: function (o, n) { return Ve.makeVatNho(n || 8, o.chat, o.mau); },
    /** Vẽ một vật: sprite n×n phóng thành cạnh sz, tâm (x, y), bóng đổ = bản đen mờ của vật lệch (so / 2, so) về phía phải-dưới (ánh sáng từ trái trên, như mọi hình trong game):
     *  vật nằm sát đất so ≈ 1/4 cạnh, bóng đậm; vật nhấc cao so ≈ 0,45 cạnh, bóng nhạt, rời xa. Mọi số theo đơn vị của g.
     *  dd: độ đậm lớp tô đỏ phủ lên vật (thả bị chặn), 0 = không tô. */
    veMotVat: function (g, o, n, x, y, sz, so, dd) {
      var h = Math.max(2, Math.round(sz)), x0 = Math.round(x - sz / 2), y0 = Math.round(y - sz / 2);
      g.fillStyle = so > sz * 0.3 ? 'rgba(0,28,10,.2)' : 'rgba(0,28,10,.38)';
      g.fillRect(x0 + Math.round(so * 0.5), y0 + Math.round(so), h, h);
      g.drawImage(this.hinhVat(o, n), x0, y0, h, h);
      if (dd) { g.fillStyle = 'rgba(255,60,50,' + dd.toFixed(2) + ')'; g.fillRect(x0, y0, h, h); }
    },
    /** Tâm vật trong kẹp theo pixel THIẾT BỊ của lớp phủ, cho xe có thân tâm (X, Y): { x, y, n, sz, so, a } (a = góc mũi xe, n = cạnh sprite, so = độ lệch bóng).
     *  Tay hạ: vật sát đất, nhỏ hơn một chút (9 pixel part), bóng sát; tay nâng: vật cao hơn nên to hơn (10), bóng nhạt và xa. */
    tamVatKep: function (X, Y) {
      var v = this.vis, a = this.gocMui(), low = v.tay.tuThe === 'duoi', vk = VeRobot.vatKep(this.cfg.robot, v.tay.tuThe), p = this.p, A = vk.ahead * p, n = low ? 9 : 10;
      return { x: X + Math.sin(a) * A, y: Y - Math.cos(a) * A, n: n, sz: n * p, so: (low ? 2 : 4.5) * p, a: a };
    },
    /** Vật đang nằm trong kẹp (robot kẹp, trangThai 'cam'), hoặc null. */
    vatCamKep: function () {
      if (this.cfg.robot.tay !== 'kep') return null;
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].tt === 'cam') return this.objs[i];
      return null;
    },
    /** Vật trong kẹp, vẽ trên lớp phủ NGAY DƯỚI ảnh robot (hai càng đè lên mép vật): đi theo xe, quay theo xe; thả bị chặn thì rung + tô đỏ. (X, Y) = tâm thân, pixel thiết bị. */
    veVatKep: function (g, X, Y, now) {
      var o = this.vatCamKep(); if (!o) return;
      var t = this.tamVatKep(X, Y), rung = this.vis.kepRung > now, lech = rung ? Math.sin(now / 22) * 1.3 * this.kk * this.u : 0;
      g.imageSmoothingEnabled = false;
      this.veMotVat(g, o, t.n, t.x + Math.cos(t.a) * lech, t.y + Math.sin(t.a) * lech, t.sz, t.so, rung ? 0.3 + 0.2 * Math.abs(Math.sin(now / 60)) : 0);
    },
    /** Vật đang trượt giữa ô trước mặt và kẹp (nhặt / đặt / thả vỡ): vị trí, cỡ và độ cao của bóng nội suy theo o.k (0 = nằm đất ở ô (tx, ty), 1 = trong kẹp). Vẽ trên sân, dưới lớp robot. */
    veVatTruot: function (g, o, now) {
      var v = this.vis, f = this.kk * this.u, k = o.k || 0, gx = o.tx * T + 7, gy = o.ty * T + 6;
      if (!this.lopOK || !this.p) { this.veMotVat(g, o, 8, gx, gy, 8, 2); return; }
      var t = this.tamVatKep((v.x * T + v.dx + 7) * f, (v.y * T + v.dy + 7 - v.hop) * f);       // đo theo pixel thiết bị gốc (không cộng lề: chỉ cần hiệu), rồi đổi về pixel sân
      var cx = t.x / f, cy = t.y / f, sz = t.sz / f, so = t.so / f;
      this.veMotVat(g, o, k > 0.5 ? t.n : 8, gx + (cx - gx) * k, gy + (cy - gy) * k, 8 + (sz - 8) * k, 2 + (so - 2) * k);
    },
    /** Vật nằm ngay dưới xe (xe đứng đúng giữa ô, chưa cầm): thân xe che hết thùng nên robot được vẽ hơi trong suốt, thùng lộ ra. */
    vatDuoiXe: function () {
      var v = this.vis, o = this.vatTaiO(Math.round(v.x), Math.round(v.y));
      return (o && Math.abs(v.x - o.x) < 0.01 && Math.abs(v.y - o.y) < 0.01) ? o : null;
    },

    /* ---- LỚP PHỦ ROBOT */
    taoLop: function () {
      if (this.lop) return;
      var l = document.createElement('canvas'); l.className = 'tex lop-robot';
      this.cv.parentNode.insertBefore(l, this.cv.nextSibling);
      this.lop = l; this.lg = l.getContext('2d');
    },
    /** Đo lại cỡ hiển thị của sân (kể cả co giãn khung 360×640 và devicePixelRatio) rồi dựng lớp phủ: lề tràn ra, độ phân giải = pixel thiết bị,
     *  tỉ lệ robot (pixel thiết bị / pixel part) nguyên lần cho vừa một ô. Gọi khi nạp sân và cứ ~30 khung một lần (đổi cỡ cửa sổ). */
    doiCo: function () {
      var cv = this.cv, ow = cv.offsetWidth, c = this.cfg;
      if (!c) return;
      if (!ow) { this.lopOK = false; return; }
      this.taoLop();
      var r = cv.getBoundingClientRect(), f = Math.max(0.5, (r.width / ow) * (window.devicePixelRatio || 1));
      var khoa = [ow, cv.offsetHeight, cv.offsetLeft, cv.offsetTop, f.toFixed(3), c.robot.than, c.robot.tay].join('|');
      if (khoa === this.lopKhoa && this.lopOK) return;
      this.lopKhoa = khoa;
      var kk = ow / cv.width, S = T * kk * f, p = VeRobot.tiLeChoO(S, c.robot);
      var mc = Math.max(4, Math.ceil((VeRobot.REACH * p - S / 2) / f) + 3);          // lề (px CSS): tay nhô ra khi xe sát mép sân
      var cw = ow + 2 * mc, ch = cv.offsetHeight + 2 * mc, l = this.lop;
      l.width = Math.max(1, Math.round(cw * f)); l.height = Math.max(1, Math.round(ch * f));
      l.style.width = cw + 'px'; l.style.height = ch + 'px';
      l.style.left = (cv.offsetLeft - mc) + 'px'; l.style.top = (cv.offsetTop - mc) + 'px';
      this.kk = kk; this.u = l.width / cw; this.mc = mc; this.p = p;
      this.mz = 24 * p / (kk * this.u);                                              // súng bóng: từ tâm xe tới miệng súng (pixel sân) = 24 pixel part
      this.bk = 23.5 * p / (kk * this.u);                                            // máy ném: từ tâm xe tới rổ ở đầu cần (pixel sân) = 23,5 pixel part
      this.lopOK = true;
    },
    /** Vẽ robot + hạt + chớp đỏ + dấu nổi lên lớp phủ. */
    veLop: function (now) {
      var v = this.vis, c = this.cfg, g = this.lg;
      if ((this.dem = (this.dem + 1) % 30) === 0 || !this.lopOK) this.doiCo();
      var ok = this.lopOK, kk = this.kk, u = this.u, ku = kk * u, mcu = this.mc * u, i;
      var rx = v.x * T + v.dx, ry = v.y * T + v.dy, cx = rx + 7, cy = ry + 7;           // tâm ô (pixel sân)
      if (ok) {
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.lop.width, this.lop.height);
        var X = Math.round(mcu + cx * ku), Y = Math.round(mcu + cy * ku - v.hop * ku), p = this.p;
        var ph = (now / 90 | 0) & 1, duoi = this.vatDuoiXe();
        if (this.docs.length) { g.setTransform(ku, 0, 0, ku, mcu, mcu); this.veVongMauDuoi(g, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // cảm biến màu vừa đọc: vòng sáng dưới gầm
        if (v.nc) { g.setTransform(ku, 0, 0, ku, mcu, mcu); this.veSongTu(g, cx, cy - v.hop, now); this.veVatTu(g, cx, cy - v.hop, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // nam châm: sóng hút ở phía trước, vật dính / đang bị hút bay (dưới thân xe: hai càng nam châm ôm lên vật)
        if (v.nem) { g.setTransform(ku, 0, 0, ku, mcu, mcu); this.veNgam(g, cx, cy - v.hop, now); this.veOVo(g, now); g.setTransform(1, 0, 0, 1, 0, 0); }       // máy ném: vạch ngắm + ô rơi vỡ dưới thân xe
        if (this.canhBao) { g.setTransform(ku, 0, 0, ku, mcu, mcu); this.veOCanhBao(g, now); g.setTransform(1, 0, 0, 1, 0, 0); }          // ô trước mặt bị chặn khi thả (kẹp lẫn nam châm): ô đỏ nhấp nháy dưới thân xe
        var wL = this.wh.L, wR = this.wh.R, phC = ph;
        if (c.robot.than === 'nhen') { wL = wR = v.chan ? 2 : 0; if (v.chan === 1) phC = 1; }   // nhện: chan 1 = nhấc chân (khung `buoc` đứng yên), 2 = chân bước luân phiên
        var spr = VeRobot.ve(c.robot, { wl: wL, wr: wR, ph: phC, tay: v.sung ? { tuThe: 'tren', kep: false, cam: null, dangBan: v.sung.ban > now } : v.nem ? { tuThe: 'tren', kep: false, cam: !!this.vatRo(), ngam: v.nem.tam, dangNem: v.nem.dang > now } : v.nc ? { tuThe: 'tren', kep: false, cam: null, bat: v.nc.bat } : v.ra ? { tuThe: v.tay.tuThe, kep: v.tay.kep, cam: v.tay.cam, ra: true } : v.tay, camBien: (v.camBien || this.camBienSang(now)) ? { bat: true } : null, loi: v.tayDo > now && ((now / 130 | 0) & 1) === 0 ? 'tay' : null }, v.d, p);
        g.imageSmoothingEnabled = false;
        if (spr.laPart && c.robot.tay === 'kep') this.veVatKep(g, X, Y, now);                 // vật trong kẹp: dưới ảnh part, hai càng đè lên mép vật
        var w = spr.width, h = spr.height, sc = spr.laPart ? 1 : ku;
        g.fillStyle = 'rgba(0,30,10,.35)';                                                // bóng dưới thân
        if (spr.laPart) g.fillRect(Math.round(X - 9 * p), Math.round(Y + 7 * p), Math.round(18 * p), Math.max(1, Math.round(2.5 * p)));
        else g.fillRect(Math.round(X - 5 * ku), Math.round(Y + 6 * ku), Math.round(10 * ku), Math.max(1, Math.round(2 * ku)));
        if (duoi) g.globalAlpha = 0.66;
        if (v.goc) {                                                                      // xích quay dở: xoay thêm góc `goc` (rad) quanh tâm thân
          g.save(); g.translate(X, Y); g.rotate(v.goc);
          g.drawImage(spr, 0, 0, w, h, Math.round(-w * sc / 2), Math.round(-h * sc / 2), Math.round(w * sc), Math.round(h * sc));
          g.restore();
        } else g.drawImage(spr, 0, 0, w, h, Math.round(X - w * sc / 2), Math.round(Y - h * sc / 2), Math.round(w * sc), Math.round(h * sc));
        g.globalAlpha = 1;
        g.setTransform(ku, 0, 0, ku, mcu, mcu);                                           // từ đây vẽ theo pixel sân
        var tx = Math.round(v.x), ty = Math.round(v.y);                                   // ô đích đã có vật dưới xe: khung vàng đặc nằm TRÊN xe
        if (this.vatTaiO(tx, ty) && this.vatTaiDich(this.vatTaiO(tx, ty)) && Math.abs(v.x - tx) < 0.01 && Math.abs(v.y - ty) < 0.01) {
          var dd = this.dichTaiO(tx, ty);
          if (dd && !this.vatDungMau(this.vatTaiO(tx, ty), dd)) this.veDauSai(g, tx, ty); else this.veKhungDay(g, dd || { x: tx, y: ty });
        }
        if (v.nem) this.veVatNem(g, cx, cy - v.hop, now);                                 // máy ném: vật trong rổ / vật đang bay phía TRÊN thân xe
        if (v.sung) { this.veBong(g, now); this.veDan(g, now); }                          // súng bóng: quả bóng đang bay (trên cả cửa, nút), số đạn còn
        if (this.docs.length) this.veTia(g, now);
        if (v.bongMau && v.bongMau.den > now) this.veBongMau(g, cx, cy, now, c.robot.tay ? 24 : 20);
        if (v.bao && v.baoDen > now) this.veDau(g, v.bao, cx, cy, now, c.robot.tay ? 25 : 21);
        if (this.flash > now) { g.fillStyle = 'rgba(255,60,50,.32)'; g.fillRect(0, 0, this.cv.width, this.cv.height); }
      }
      for (i = this.parts.length - 1; i >= 0; i--) {
        var q = this.parts[i]; q.life--; q.vy += 0.05; q.x += q.vx; q.y += q.vy;
        if (q.life <= 0) { this.parts.splice(i, 1); continue; }
        if (!ok) continue;
        if (q.mo) g.globalAlpha = Math.min(1, q.life / 18);
        g.fillStyle = q.c; g.fillRect(Math.round(q.x), Math.round(q.y), q.s, q.s);
        if (q.mo) g.globalAlpha = 1;
      }
    },
    /* ---- NAM CHÂM: sóng hút, vật dính, vật bay */
    /** Góc (rad, 0 = lên, quay thuận chiều kim đồng hồ) của hướng mũi xe: theo hướng xe, cộng góc xích quay dở; đang quay thì dùng góc đang nội suy. */
    gocMui: function () {
      var v = this.vis, q = v.nc || v.nem, base = q && q.ang !== null && q.ang !== undefined ? q.ang : (v.d || 0) * Math.PI / 2;
      return base + (v.goc || 0);
    },
    /** Nhìn từ ô xe (làm tròn) theo hướng mặt: vật đầu tiên trong 2 ô (tường, mép sân, thùng nặng chắn). { khoang, chan, vat } (khoang 3 = hết tầm trống). */
    nhinTruoc: function () {
      var v = this.vis, c = this.cfg, bx = Math.round(v.x), by = Math.round(v.y), h = v.d || 0, d, x, y, o;
      for (d = 1; d <= 2; d++) {
        x = bx + DX[h] * d; y = by + DY[h] * d;
        if (x < 0 || y < 0 || x >= c.w || y >= c.h || c.rows[y][x] === '#' || this.thungTaiO(x, y)) return { khoang: d, chan: 'tuong', vat: null };
        o = this.vatTaiO(x, y);
        if (o) return { khoang: d, chan: null, vat: o };
      }
      return { khoang: 3, chan: null, vat: null };
    },
    /** Có vật đang dính ở nam châm không. */
    vatDinh: function () {
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].tt === 'cam' || this.objs[i].tt === 'bay') return this.objs[i];
      return null;
    },
    /** Vòng sóng của nam châm bật mà chưa dính vật: ba cung tỏa ra từ mũi xe tới hết 2 ô phía trước; dừng ở tường, và dừng sát vật đầu tiên
     *  (vật gỗ: sóng chuyển xám, chập chờn rồi tắt ngay trước vật, không hút được). (cx, cy) = tâm ô xe (pixel sân). */
    veSongTu: function (g, cx, cy, now) {
      var v = this.vis, nc = v.nc;
      if (!nc || !nc.bat || this.vatDinh()) return;
      var ang = this.gocMui(), dx = Math.sin(ang), dy = -Math.cos(ang), nt = this.nhinTruoc();
      var tamMax = (nt.chan || nt.vat) ? (nt.khoang - 1) * T + 1 : 2 * T + 2, go = !!(nt.vat && nt.vat.chat !== 'sat');
      if (tamMax < 4) return;
      var nx = cx + dx * 8, ny = cy + dy * 8, a0 = Math.atan2(dy, dx), i;
      g.save(); g.lineCap = 'round';
      for (i = 0; i < 3; i++) {
        var ph = ((now / 900) + i / 3) % 1, r = 2 + ph * (tamMax - 2), nua = Math.min(1.0, 8 / Math.max(r, 3)), al = Math.pow(1 - ph, 0.8) * (go ? 0.55 : 0.9);
        if (go && ph > 0.7) al *= 0.4 + 0.6 * Math.abs(Math.sin(now / 50));
        g.strokeStyle = (go ? 'rgba(182,168,150,' : 'rgba(150,222,255,') + al.toFixed(3) + ')'; g.lineWidth = 1.4;
        g.beginPath(); g.arc(nx, ny, r, a0 - nua, a0 + nua); g.stroke();
        g.strokeStyle = (go ? 'rgba(235,225,205,' : 'rgba(235,250,255,') + (al * 0.7).toFixed(3) + ')'; g.lineWidth = 0.6;
        g.beginPath(); g.arc(nx, ny, r, a0 - nua * 0.7, a0 + nua * 0.7); g.stroke();
      }
      g.restore();
    },
    /** Ô bị chặn khi thả (tha-bi-chan): ô đỏ nhấp nháy một lúc. */
    veOCanhBao: function (g, now) {
      var b = this.canhBao; if (!b) return;
      if (now > b.den) { this.canhBao = null; return; }
      var al = 0.18 + 0.2 * Math.abs(Math.sin(now / 90));
      g.fillStyle = 'rgba(255,50,40,' + al.toFixed(3) + ')'; g.fillRect(b.x * T, b.y * T, T, T);
      g.strokeStyle = 'rgba(255,70,55,.9)'; g.lineWidth = 1; g.strokeRect(b.x * T + 0.5, b.y * T + 0.5, T - 1, T - 1);
    },
    /** Vật dính ở mũi xe (vẽ sát mũi, đi theo xe, quay theo xe) và vật đang bị hút bay: vẽ trên thân xe. */
    veVatTu: function (g, cx, cy, now) {
      var v = this.vis, i, o, px, py;
      var ang = this.gocMui(), dx = Math.sin(ang), dy = -Math.cos(ang);
      for (i = 0; i < this.objs.length; i++) {
        o = this.objs[i];
        if (o.tt === 'cam') {
          var rung = v.nc.rung > now, lech = rung ? Math.sin(now / 22) * 1.3 : 0;
          px = cx + dx * T + (rung ? -dy : 0) * lech; py = cy + dy * T + (rung ? dx : 0) * lech;
          this.veMotVat(g, o, 8, px, py - 1, 8, 2, rung ? 0.3 : 0);
        } else if (o.tt === 'bay' && o.bay) {
          var b = o.bay;
          px = b.x * T + 7; py = b.y * T + 7 - b.cao;
          g.fillStyle = 'rgba(0,30,10,.25)'; g.fillRect(Math.round(b.x * T + 4), Math.round(b.y * T + 10), 6, 2);
          g.drawImage(this.hinhVat(o, 8), Math.round(px - 4 + (b.rx || 0)), Math.round(py - 5 + (b.ry || 0)));
          if (b.vong) {
            g.strokeStyle = 'rgba(200,236,255,' + (0.35 + 0.35 * Math.abs(Math.sin(now / 60))).toFixed(3) + ')'; g.lineWidth = 1;
            g.strokeRect(Math.round(px - 6) + 0.5, Math.round(py - 7) + 0.5, 11, 11);
          }
        }
      }
    },
    /** Vật bị hút (hut-vat): rung tại chỗ, rồi bay về ô sát mũi xe (cung nhẹ, bụi sáng phía sau), rồi dính. ms = thời gian dành cho cả sự kiện. */
    hutVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id), v = this.vis, self = this;
      if (!o) { await ngu(ms); return; }
      var x0 = s.tu.x, y0 = s.tu.y, x1 = s.den.x, y1 = s.den.y;
      o.tt = 'bay'; o.bay = { x: x0, y: y0, cao: 0, vong: true, rx: 0, ry: 0 };
      await this.tween(ms * 0.28, my, function (k) { o.bay.rx = Math.sin(k * Math.PI * 7) * (0.4 + k) * 0.8; o.bay.ry = Math.cos(k * Math.PI * 5) * 0.4; o.bay.cao = k * 1.5; });
      if (my !== this.rid) return;
      o.bay.rx = 0; o.bay.ry = 0;
      await this.tween(ms * 0.72, my, function (k) {
        var k2 = k * k * (3 - 2 * k);
        o.bay.x = x0 + (x1 - x0) * k2; o.bay.y = y0 + (y1 - y0) * k2;
        o.bay.cao = 1.5 + Math.sin(k * Math.PI) * 2.5;
        if (Math.random() < 0.7) self.burst(o.bay.x * T + 7 - (x1 - x0) * 3 * (1 - k), o.bay.y * T + 7 - (y1 - y0) * 3 * (1 - k), 1, ['#dff3ff', '#8fd8ff', '#ffffff'], 0.3);
      });
      if (my !== this.rid) return;
      o.bay = null; o.tt = 'cam'; o.x = Math.round(v.x); o.y = Math.round(v.y);
      this.burst(x1 * T + 7, y1 * T + 7, 8, ['#dff3ff', '#8fd8ff', '#ffffff'], 0.8, 1, true);
      v.nc.rung = 0;
    },
    /** Thả vật (tha-vat): vật dính rời mũi xe, rơi xuống ô sát mũi xe (nảy nhẹ, bụi). */
    thaVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id);
      if (!o) { await ngu(ms); return; }
      var self = this, bui = false;
      o.tt = 'dat'; o.x = s.den.x; o.y = s.den.y; o.nang = 5;
      this.vis.nc.rung = 0;
      await this.tween(ms * 0.8, my, function (k) {
        o.nang = k < 0.7 ? 5 * (1 - Math.pow(k / 0.7, 2)) : Math.abs(Math.sin((k - 0.7) / 0.3 * Math.PI)) * 1.2 * (1 - k);
        if (k >= 0.7 && !bui) { bui = true; self.burst(o.x * T + 7, o.y * T + 11, 4, ['#fff6e3', '#bfe8b0'], 0.5); }
      });
      o.nang = 0;
    },
    objTheoId: function (id) {
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].id === id) return this.objs[i];
      return null;
    },

    /* ---- MÁY NÉM: rổ, vạch ngắm, vật bay */
    /** Vật đang nằm trong rổ (trangThai 'ro'), hoặc null. */
    vatRo: function () {
      for (var i = 0; i < this.objs.length; i++) if (this.objs[i].tt === 'ro') return this.objs[i];
      return null;
    },
    /** Vị trí rổ (pixel sân) ở đầu cần ném, theo hướng mũi xe (theo xe, quay theo xe); dang = đang vung cần thì rổ ra xa thêm 4 pixel part. */
    viTriRo: function (dang) {
      var v = this.vis, a = this.gocMui(), bk = (this.bk || 15) * (dang ? 27.5 / 23.5 : 1);
      return { x: v.x * T + 7 + v.dx + Math.sin(a) * bk, y: v.y * T + 7 + v.dy - Math.cos(a) * bk - v.hop };
    },
    /** Đổi tầm (aim(n) vừa chạy): số ngắm của cần đổi ngay, vòng ở ô rơi nháy to một lúc. */
    datTam: function (n) {
      var q = this.vis && this.vis.nem; if (!q || !(n >= 1 && n <= 3) || q.tam === n) return;
      q.tam = n; q.doi = performance.now();
    },
    /** Vạch ngắm mờ từ xe tới ô rơi (tầm n ô trước mặt): chấm ở từng ô đi qua, vòng + số n ở ô rơi (vẽ dưới thân xe; ô rơi có thể ở ngoài sân). */
    veNgam: function (g, cx, cy, now) {
      var q = this.vis.nem; if (!q) return;
      var a = this.gocMui(), dx = Math.sin(a), dy = -Math.cos(a), n = q.tam, i, nho = now - q.doi < 420 ? (1 - (now - q.doi) / 420) : 0;
      var tx = cx + dx * n * T, ty = cy + dy * n * T, al = 0.5 + 0.12 * Math.sin(now / 260);
      g.save();
      g.strokeStyle = 'rgba(127,240,255,' + (al * 0.8).toFixed(3) + ')'; g.lineWidth = 1; g.setLineDash([2, 2]); g.lineDashOffset = -((now / 120) % 4);
      g.beginPath(); g.moveTo(cx + dx * 9, cy + dy * 9); g.lineTo(tx - dx * 5, ty - dy * 5); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(127,240,255,' + (al * 0.9).toFixed(3) + ')';
      for (i = 1; i < n; i++) g.fillRect(Math.round(cx + dx * i * T) - 1, Math.round(cy + dy * i * T) - 1, 2, 2);
      var col = nho ? '255,246,168' : '127,240,255', a2 = Math.min(1, al + nho) * (this.vatRo() ? 1 : 0.6), x0 = Math.round(tx) - 7, y0 = Math.round(ty) - 7, k = 4 + (nho ? 1 : 0);
      g.strokeStyle = 'rgba(' + col + ',' + a2.toFixed(3) + ')'; g.lineWidth = 1.5;                  // bốn góc khung ô rơi (không che vật nằm trong ô)
      g.beginPath();
      g.moveTo(x0, y0 + k); g.lineTo(x0, y0); g.lineTo(x0 + k, y0);
      g.moveTo(x0 + 14 - k, y0); g.lineTo(x0 + 14, y0); g.lineTo(x0 + 14, y0 + k);
      g.moveTo(x0 + 14, y0 + 14 - k); g.lineTo(x0 + 14, y0 + 14); g.lineTo(x0 + 14 - k, y0 + 14);
      g.moveTo(x0 + k, y0 + 14); g.lineTo(x0, y0 + 14); g.lineTo(x0, y0 + 14 - k);
      g.stroke();
      g.fillStyle = 'rgba(15,40,52,' + (0.85 * Math.min(1, a2 + 0.2)).toFixed(3) + ')'; g.fillRect(x0 + 1, y0 + 1, 6, 8);               // thẻ số tầm ở góc trên trái ô rơi
      g.font = '8px VT323, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(' + (nho ? '255,246,168' : '214,250,255') + ',' + Math.min(1, a2 + 0.3).toFixed(3) + ')';
      g.fillText(String(n), x0 + 4, y0 + 5.5);
      g.restore();
    },
    /** Ô rơi vỡ (nem-vo): ô tô đỏ nhấp nháy + khung đỏ, giữ tới khi chạy lại. Ô ngoài sân thì vạch đỏ + mũi nhọn ở mép sân. */
    veOVo: function (g, now) {
      var ds = this.oVo || [], c = this.cfg, i, o, al = 0.2 + 0.14 * Math.abs(Math.sin(now / 200));
      for (i = 0; i < ds.length; i++) {
        o = ds[i];
        if (!o.ngoai) {
          g.fillStyle = 'rgba(255,50,40,' + al.toFixed(3) + ')'; g.fillRect(o.x * T, o.y * T, T, T);
          g.strokeStyle = 'rgba(255,70,55,.9)'; g.lineWidth = 1; g.strokeRect(o.x * T + 0.5, o.y * T + 0.5, T - 1, T - 1);
        } else {
          var px = Math.max(0, Math.min(c.w * T, o.px)), py = Math.max(0, Math.min(c.h * T, o.py)), ngang = o.x < 0 || o.x >= c.w;
          g.fillStyle = 'rgba(255,50,40,' + (al + 0.25).toFixed(3) + ')';
          if (ngang) g.fillRect(o.x < 0 ? 0 : c.w * T - 2, Math.round(py) - 6, 2, 12); else g.fillRect(Math.round(px) - 6, o.y < 0 ? 0 : c.h * T - 2, 12, 2);
        }
      }
    },
    /** Vật trong rổ (nhỏ, ở đầu cần, đi theo xe, quay theo xe, rung khi rổ đầy) và vật đang bay (nb: bóng đổ dưới đất + vật to dần ở đỉnh cung rồi nhỏ lại). */
    veVatNem: function (g, cx, cy, now) {
      var v = this.vis, i, o, q = v.nem;
      g.imageSmoothingEnabled = false;
      for (i = 0; i < this.objs.length; i++) {
        o = this.objs[i];
        if (o.tt === 'ro') {
          var a = this.viTriRo(q.dang > now), sz = Math.max(4, Math.round((this.bk || 15) * 0.34)), rg = q.rung > now ? Math.sin(now / 20) * 1.2 : 0;
          g.drawImage(this.hinhVat(o, 8), Math.round(a.x - sz / 2 + rg), Math.round(a.y - sz / 2), sz, sz);
          if (q.loi > now) { g.strokeStyle = 'rgba(255,70,55,.9)'; g.lineWidth = 1; g.strokeRect(Math.round(a.x - sz / 2 + rg) - 0.5, Math.round(a.y - sz / 2) - 0.5, sz + 1, sz + 1); }
        } else if (o.tt === 'bay' && o.nb) {
          var b = o.nb, d = Math.max(3, Math.round(8 * b.esc));
          g.fillStyle = 'rgba(0,28,10,' + Math.max(0.12, 0.34 - b.cao * 0.012).toFixed(3) + ')';
          var sw = Math.max(3, Math.round(d * 0.7 * (1 - Math.min(0.5, b.cao * 0.03))));
          g.fillRect(Math.round(b.px - sw / 2), Math.round(b.py + 5), sw, 2);
          g.drawImage(this.hinhVat(o, 8), Math.round(b.px - d / 2), Math.max(-1, Math.round(b.py - d / 2 - b.cao)), d, d);          // vật bay cao không vượt khỏi mép trên của lớp phủ
        }
      }
    },
    /** load(): vật ở ô TRƯỚC MẶT nhảy lên rổ ở đầu cần (cung nhẹ, nhỏ dần). */
    napVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id), v = this.vis, self = this;
      if (!o) { await ngu(ms); return; }
      var x0 = o.x * T + 7, y0 = o.y * T + 6, a = this.viTriRo(false), sz = Math.max(4, (this.bk || 15) * 0.34) / 8;
      o.tt = 'bay'; o.nb = { px: x0, py: y0, cao: 0, esc: 1 };
      await this.tween(ms * 0.9, my, function (k) {
        var k2 = k * k * (3 - 2 * k);
        o.nb.px = x0 + (a.x - x0) * k2; o.nb.py = y0 + (a.y - y0) * k2;
        o.nb.cao = Math.sin(k * Math.PI) * 6; o.nb.esc = 1 + (sz - 1) * k2;
        if (Math.random() < 0.5) self.burst(o.nb.px, o.nb.py - o.nb.cao, 1, ['#fff6e3', '#e8b574'], 0.3);
      });
      if (my !== this.rid) return;
      o.nb = null; o.tt = 'ro';
      v.nem.rung = performance.now() + 140;
      this.burst(a.x, a.y, 5, ['#fff6e3', '#bfe8b0'], 0.5);
    },
    /** throw(): cần vung lên, xe giật lùi nhẹ, vật bay vòng cung từ rổ tới ô rơi (to dần rồi nhỏ lại, bóng đổ dưới đất), bay qua mọi thứ ở giữa. */
    nemVat: async function (s, ms, my) {
      var o = this.objTheoId(s.id), v = this.vis, self = this, c = this.cfg;
      if (!o) { await ngu(ms); return; }
      var hx = DX[Math.round(((v.d || 0) % 4 + 4) % 4)], hy = DY[Math.round(((v.d || 0) % 4 + 4) % 4)];
      var tx = s.den.x * T + 7, ty = s.den.y * T + 7;
      if (s.den.x < 0 || s.den.y < 0 || s.den.x >= c.w || s.den.y >= c.h) { tx = Math.max(3, Math.min(c.w * T - 3, tx)); ty = Math.max(3, Math.min(c.h * T - 3, ty)); }   // ngoài sân: bay tới mép
      v.nem.dang = performance.now() + ms + 260;
      var a = this.viTriRo(true), t1 = ms * 0.2, esc0 = Math.max(4, (this.bk || 15) * 0.34) / 8, hcao = 5 + 3 * (s.tam || 1);
      o.tt = 'bay'; o.nb = { px: a.x, py: a.y, cao: 0, esc: esc0 };
      await this.tween(t1, my, function (k) { v.dx = -hx * Math.sin(k * Math.PI) * 1.4; v.dy = -hy * Math.sin(k * Math.PI) * 1.4; });        // vung cần: giật lùi nhẹ
      if (my !== this.rid) return;
      v.dx = 0; v.dy = 0;
      await this.tween(ms - t1, my, function (k) {
        o.nb.px = a.x + (tx - a.x) * k; o.nb.py = a.y + (ty - a.y) * k;
        o.nb.cao = Math.sin(k * Math.PI) * hcao;
        o.nb.esc = esc0 + (1 - esc0) * k + 0.4 * Math.sin(k * Math.PI);
        if (Math.random() < 0.55) self.burst(o.nb.px, o.nb.py - o.nb.cao, 1, ['#fff6e3', '#cfe9ff'], 0.25);
      });
      if (my !== this.rid) return;
      o.nb = { px: tx, py: ty, cao: 0, esc: 1 }; o.x = s.den.x; o.y = s.den.y;
    },
    /** Vật chạm đất ở ô rơi: nảy nhẹ một lần, bụi. */
    nemRoi: async function (s, ms, my) {
      var o = this.objTheoId(s.id);
      if (!o) { await ngu(ms); return; }
      var self = this;
      o.nb = null; o.tt = 'dat'; o.x = s.o.x; o.y = s.o.y; o.nang = 0;
      this.burst(o.x * T + 7, o.y * T + 11, 5, ['#fff6e3', '#bfe8b0'], 0.5);
      await this.tween(ms, my, function (k) { o.nang = Math.sin(k * Math.PI) * 3 * (1 - k); });
      o.nang = 0;
    },
    /** Vật rơi vào ô không nhận: vỡ thành mảnh ngay chỗ rơi (ngoài sân thì ở mép), ô rơi tô đỏ giữ tới khi chạy lại. */
    nemVo: async function (s, ms, my) {
      var o = this.objTheoId(s.id), c = this.cfg, ngoai = s.o.x < 0 || s.o.y < 0 || s.o.x >= c.w || s.o.y >= c.h;
      var px = Math.max(3, Math.min(c.w * T - 3, s.o.x * T + 7)), py = Math.max(3, Math.min(c.h * T - 3, s.o.y * T + 7));
      var cols = o && o.chat === 'sat' ? ['#7f97b2', '#dcecfa', '#3f536c', '#a9c0d8'] : ['#c98a45', '#8a5a24', '#e8b574', '#5a3a14'];
      if (o) { o.nb = null; o.tt = 'vo'; o.x = s.o.x; o.y = s.o.y; o.voLuc = performance.now(); }
      this.burst(px, py, 22, cols, 1.9, 2, true);
      this.burst(px, py, 8, ['#fff6e3', '#ffd23f'], 1.1, 1, true);
      this.oVo.push({ x: s.o.x, y: s.o.y, px: s.o.x * T + 7, py: s.o.y * T + 7, ngoai: ngoai });
      this.chopDo(180);
      await ngu(ms);
    },
    /* ---- SÚNG BÓNG: bóng bay thẳng, nút, cửa */
    /** Quả bóng (vẽ trên lớp phủ, tâm (x, y) pixel sân; 5×5 pixel: viền tối, lõi vàng, đốm sáng trái trên, bóng tối phải dưới). b.a = độ đậm. */
    veBong: function (g, now) {
      var b = this.bong; if (!b) return;
      var x = Math.round(b.x), y = Math.round(b.y), sq = b.sq || 0;
      g.save(); g.globalAlpha = Math.max(0, Math.min(1, b.a === undefined ? 1 : b.a));
      g.fillStyle = 'rgba(0,28,10,.3)'; g.fillRect(x - 1, y + 3, 4, 1);                                  // bóng đổ nhỏ dưới đất
      g.fillStyle = K_INK;
      g.fillRect(x - 1, y - 2, 3, 5); g.fillRect(x - 2, y - 1, 5, 3);
      if (sq) g.fillRect(x - 2, y - 2, 5, 5);                                                             // lúc đập vào vật: bẹp ra một chút
      g.fillStyle = '#ffe14a'; g.fillRect(x - 1, y - 1, 3, 3);
      g.fillStyle = '#fffbd0'; g.fillRect(x - 1, y - 1, 1, 1);
      g.fillStyle = '#d19a1a'; g.fillRect(x + 1, y + 1, 1, 1);
      g.restore();
    },
    /** Số đạn còn (màn có danToiDa): thẻ nhỏ ở góc trên trái của sân, quả bóng + "x n"; hết đạn thì đỏ và nháy. */
    veDan: function (g, now) {
      var sg = this.vis.sung; if (!sg || sg.dan === null || sg.dan === undefined) return;
      var txt = '×' + sg.dan, het = sg.dan <= 0, nhay = sg.het > now && ((now / 110 | 0) & 1) === 0;
      g.save();
      g.font = '8px VT323, monospace'; g.textBaseline = 'middle'; g.textAlign = 'left';
      var w = Math.ceil(g.measureText(txt).width) + 10, hh = 9, x = 1, y = 1;
      g.fillStyle = K_INK; g.fillRect(x - 1, y - 1, w + 2, hh + 2);
      g.fillStyle = het || nhay ? '#7a1f1a' : '#2a2236'; g.fillRect(x, y, w, hh);
      g.fillStyle = het ? '#9a8a86' : '#ffe14a'; g.fillRect(x + 2, y + 3, 3, 3);
      g.fillStyle = K_INK; g.fillRect(x + 2, y + 3, 1, 1);
      g.fillStyle = het ? '#ff8a7a' : '#fff6e3'; g.fillText(txt, x + 7, y + hh / 2 + 0.5);
      g.restore();
    },
    nutO: function (x, y) { var k = x + ',' + y; return this.nutT[k] || (this.nutT[k] = { bat: false, loe: 0 }); },
    /** Chỗ bóng dừng (pixel sân) khi trúng ô den, đi theo hướng bay (dx, dy): cách tâm ô một đoạn bằng nửa bề rộng vật cản cộng bán kính bóng. */
    banDung: function (s, dx, dy) {
      var nua = s.trung === 'vat' ? 4 : s.trung === 'thung' ? 6 : 7;
      return { x: s.den.x * T + 7 - dx * (nua + 3), y: s.den.y * T + 7 - dy * (nua + 3) };
    },
    /** shoot(): nòng giật lại và lóe, quả bóng bay thẳng từ miệng súng tới ô `den`; chạm vật cản thì nảy ra / lóe; trúng nút thì nút lóe rồi đổi (băng chuyền đổi ngay);
     *  hụt (ra khỏi sân) thì bay mờ dần ở mép. evs = các sự kiện của nhịp (nut-doi, bang-doi, ban-hut, ban-bi-chan). */
    banBong: async function (s, evs, ms, my) {
      var v = this.vis, c = this.cfg, self = this, h = Math.round(((v.d || 0) % 4 + 4) % 4), dx = DX[h], dy = DY[h], sg = v.sung;
      var x0 = s.tu.x * T + 7 + dx * (this.mz || 8), y0 = s.tu.y * T + 7 + dy * (this.mz || 8);
      var tx, ty, hut = !s.trung;
      if (hut) { tx = dx ? (dx > 0 ? c.w * T + 5 : -5) : x0; ty = dy ? (dy > 0 ? c.h * T + 5 : -5) : y0; }
      else { var st = this.banDung(s, dx, dy); tx = st.x; ty = st.y; }
      if ((tx - x0) * dx + (ty - y0) * dy < 0) { tx = x0; ty = y0; }                                    // vật cản dính sát miệng súng: bóng không bay được đoạn nào
      if (sg) sg.ban = performance.now() + ms * 0.3;
      this.burst(x0, y0, 5, ['#fff6a8', '#ffe14a', '#ffffff'], 0.55, 1, true);
      await this.tween(ms * 0.14, my, function (k) { v.dx = -dx * Math.sin(k * Math.PI) * 1.5; v.dy = -dy * Math.sin(k * Math.PI) * 1.5; });          // giật lùi nhẹ
      if (my !== this.rid) return;
      v.dx = 0; v.dy = 0;
      this.bong = { x: x0, y: y0, a: 1 };
      var dai = Math.abs(tx - x0) + Math.abs(ty - y0), tBay = Math.max(110, Math.min(ms * 0.5, 80 + dai * 6));
      await this.tween(tBay, my, function (k) {
        if (!self.bong) return;
        self.bong.x = x0 + (tx - x0) * k; self.bong.y = y0 + (ty - y0) * k;
        if (hut && k > 0.7) self.bong.a = 1 - (k - 0.7) / 0.3;
        if (Math.random() < 0.8) self.burst(self.bong.x - dx * 2, self.bong.y - dy * 2, 1, ['#fff6a8', '#ffe14a'], 0.12, 1, true);
      });
      if (my !== this.rid || !this.bong) return;
      if (hut) { this.bong = null; this.baoHieu('?', 1400); return; }
      // chạm vật cản
      var kind = s.trung, tNay = performance.now(), og = null;
      var nutEv = evs.filter(function (q) { return q.ma === 'nut-doi'; })[0];
      if (kind === 'nut') {
        var nt = this.nutO(s.den.x, s.den.y); nt.loe = tNay + 340;
        this.burst(tx + dx * 2, ty + dy * 2, 14, ['#ffffff', '#ffe14a', '#fff6a8', '#7cff86'], 1.3, 1, true);
        this.bong.sq = 1;
        await ngu(ms * 0.1); if (my !== this.rid) return;
        if (nutEv) nt.bat = !!nutEv.bat;
        evs.filter(function (q) { return q.ma === 'bang-doi'; }).forEach(function (q) { var k2 = q.o.x + ',' + q.o.y; if (q.bat) delete self.bangTat[k2]; else self.bangTat[k2] = true; self.bangLoe[k2] = performance.now() + 300; });
      } else if (kind === 'cua') {
        var cd = this.cuaT[s.den.x + ',' + s.den.y]; if (cd) cd.rung = tNay + 220;
        this.burst(tx + dx * 2, ty + dy * 2, 9, ['#ffe27a', '#ffffff', '#f2b533'], 1.0, 1, true);
        this.bong.sq = 1;
      } else if (kind === 'vat' || kind === 'thung') {
        og = kind === 'vat' ? this.vatTaiO(s.den.x, s.den.y) : this.thungTaiO(s.den.x, s.den.y);
        this.burst(tx + dx * 2, ty + dy * 2, 7, ['#e8b574', '#fff6e3', '#c98a45'], 0.6);
        this.bong.sq = 1;
      } else {
        this.burst(tx + dx * 2, ty + dy * 2, 8, ['#ffffff', '#d0d6e4', '#9ba3b4'], 0.8, 1, true);
        this.bong.sq = 1;
      }
      var bx = this.bong.x, by = this.bong.y;
      await this.tween(ms * 0.3, my, function (k) {                                                      // nảy ngược lại một đoạn nhỏ rồi mờ đi
        if (!self.bong) return;
        var bd = Math.sin(Math.min(1, k * 1.3) * Math.PI * 0.5) * 4;
        self.bong.x = bx - dx * bd; self.bong.y = by - dy * bd; self.bong.a = k < 0.4 ? 1 : 1 - (k - 0.4) / 0.6; self.bong.sq = k < 0.25 ? 1 : 0;
        if (og) { var r = Math.sin(k * Math.PI * 6) * (1 - k) * 0.9; og.dx = dx * r; og.dy = dy * r; }
      });
      if (og) { og.dx = 0; og.dy = 0; }
      this.bong = null;
      if (my !== this.rid) return;
      if (kind !== 'nut' && evs.some(function (q) { return q.ma === 'ban-bi-chan'; })) this.baoHieu('?', 1400);       // bắn trúng thứ khác, không phải nút
    },
    /** Cuối nhịp: các cửa đổi (cua-doi: trượt mở / đóng, theo nút hay theo nhịp) và cửa kẹt (cua-ket: rung, đỏ, vẫn mở vì có xe / vật dưới cửa). */
    cuaBatch: async function (cuaEvs, ms, my) {
      var self = this, jobs = [];
      cuaEvs.forEach(function (q) {
        var d = self.cuaT[q.o.x + ',' + q.o.y]; if (!d) return;
        if (q.ma === 'cua-doi') jobs.push({ d: d, k0: d.k, k1: q.mo ? 1 : 0, mo: !!q.mo, ket: false });
        else jobs.push({ d: d, ket: true });
      });
      if (!jobs.length) { await ngu(ms); return; }
      var tn = performance.now();
      jobs.forEach(function (j) { if (j.ket) { j.d.rung = tn + ms; self.baoHieu('!', Math.max(1200, ms * 1.5)); } });
      await this.tween(ms, my, function (k) {
        jobs.forEach(function (j) {
          if (j.ket) j.d.ket = Math.sin(Math.min(1, k * 1.2) * Math.PI);
          else j.d.k = j.k0 + (j.k1 - j.k0) * ease(k);
        });
      });
      jobs.forEach(function (j) { if (j.ket) j.d.ket = 0; else { j.d.k = j.k1; j.d.mo = j.mo; } });
    },
    /** Đưa nút, cửa, băng chuyền, số nhịp (đèn cửa nhịp), số đạn về đúng vết ở cuối nhịp. */
    dongBoSung: function (e) {
      var self = this, d;
      if (e.nut) e.nut.forEach(function (n) { self.nutO(n.x, n.y).bat = !!n.bat; });
      if (e.bangTat) { this.bangTat = {}; e.bangTat.forEach(function (q) { self.bangTat[q.x + ',' + q.y] = true; }); }
      if (e.cua) e.cua.forEach(function (q) { d = self.cuaT[q.x + ',' + q.y]; if (d) { d.mo = !!q.mo; d.k = q.mo ? 1 : 0; d.ket = 0; d.rung = 0; } });
      if (typeof e.nhip === 'number') this.nhipDa = e.nhip;
      if (this.vis.sung && e.robot && e.robot.sung && e.robot.sung.dan !== undefined) this.vis.sung.dan = e.robot.sung.dan;
      this.bong = null;
    },
    /** Dấu '?' (kẹp hụt) / '!' (ô đã có vật) nổi trên xe. */
    veDau: function (g, kieu, cx, cy, now, cao) {
      var Q = ['.##.', '#..#', '...#', '..#.', '.#..', '....', '.#..'], B = ['.#.', '.#.', '.#.', '.#.', '...', '.#.', '...'];
      var rows = kieu === '!' ? B : Q, w = rows[0].length;
      var bob = Math.round(Math.sin(now / 110));
      var x = Math.round(cx - w / 2) + 6, y = Math.max(1, cy - (cao || 21) + bob);
      var i, j;
      g.fillStyle = '#1b120a';
      for (j = 0; j < rows.length; j++) for (i = 0; i < w; i++) if (rows[j][i] === '#') {
        g.fillRect(x + i - 1, y + j, 3, 1); g.fillRect(x + i, y + j - 1, 1, 3);
      }
      g.fillStyle = kieu === '!' ? '#ff8a6a' : '#fff6a8';
      for (j = 0; j < rows.length; j++) for (i = 0; i < w; i++) if (rows[j][i] === '#') g.fillRect(x + i, y + j, 1, 1);
    },

    /** Băng chuyền đã tắt (bóng trúng nút): mờ đi, không có mũi tên chạy, đèn đỏ nhỏ ở góc; vừa tắt / bật lại thì sáng trắng một chút. */
    veBangTat: function (g, x, y, now) {
      g.fillStyle = 'rgba(28,34,52,.5)'; g.fillRect(x * T + 1, y * T + 1, T - 2, T - 2);
      g.fillStyle = K_INK; g.fillRect(x * T + 2, y * T + 2, 4, 4);
      g.fillStyle = '#ff5a4a'; g.fillRect(x * T + 3, y * T + 3, 2, 2);
      var l = this.bangLoe[x + ',' + y];
      if (l > now) { g.fillStyle = 'rgba(255,255,255,' + (0.45 * (l - now) / 300).toFixed(3) + ')'; g.fillRect(x * T, y * T, T, T); }
    },
    /** Một ô cửa: cánh trượt theo độ mở d.k (0 đóng .. 1 mở), rung / đỏ khi kẹt; cửa nhịp có hàng đèn đếm nhịp (xanh = mở, đỏ = đóng). */
    veMotCua: function (g, d, now) {
      if (!d) return;
      var nh = d.nhip ? { mo: d.nhip.mo, dong: d.nhip.dong, p: (this.nhipDa + d.nhip.pha) % (d.nhip.mo + d.nhip.dong) } : null;
      Ve.veCua(g, d.x * T, d.y * T, d.k, { doc: d.doc, nhip: nh, ket: d.ket, rung: d.rung > now ? Math.sin(now / 22) * 1.2 : 0, now: now });
      if (d.ket > 0.02) {                                                       // cửa kẹt: khung đỏ quanh ô (không bị xe che)
        g.save(); g.strokeStyle = 'rgba(255,60,48,' + Math.min(1, d.ket + 0.15).toFixed(3) + ')'; g.lineWidth = 2; g.strokeRect(d.x * T + 1, d.y * T + 1, T - 2, T - 2); g.restore();
      }
    },
    draw: function (now) {
      if (!this.cfg || !this.vis) return;
      var g = this.g, c = this.cfg, TL = Ve.tiles(), cf = Math.floor(now / 130) % 5, ff = Math.floor(now / 180) & 3;
      g.clearRect(0, 0, this.cv.width, this.cv.height);
      for (var y = 0; y < c.h; y++) for (var x = 0; x < c.w; x++) {
        var ch = c.rows[y][x], t;
        var kO = x + ',' + y, bangTat = BANG[ch] !== undefined && this.bangTat[kO];
        if (BANG[ch] !== undefined) t = Ve.makeConv(BANG[ch], bangTat ? 0 : cf);                 // băng tắt (nút đã đổi): đứng yên ở một khung
        else if (ch === '#') t = TL.wall;
        else if (ch === 'N') { var nt = this.nutT[kO]; t = TL.nut(!!(nt && nt.bat), !!(nt && nt.loe > now)); }                 // nút bắn nằm trên tường
        else if (ch === 'C' || ch === 'c') t = TL.rug[(x + y * 2) & 3];                           // cửa: sàn ở dưới, cánh cửa + khung vẽ đè lên
        else if (ch === '=') t = TL.rug[(x + y * 2) & 3];                // hàng rào thấp: sàn nguyên, cọc + thanh vẽ đè lên (thấy sàn phía sau)
        else if (ch === 'S') t = TL.stair;
        else if (ch === 'F') t = TL.pad;
        else t = TL.rug[(x + y * 2) & 3];
        var mn = (ch === '#' || ch === 'S' || ch === '=' || ch === 'N' || ch === 'C' || ch === 'c' || BANG[ch] !== undefined) ? null : this.mauNen(x, y);
        if (mn) t = TL.mau[mn][(x + y) & 1];                  // sàn tô màu (kể cả dưới cờ và ô đích)
        g.drawImage(t, x * T, y * T);
        if (bangTat) this.veBangTat(g, x, y, now);
        else if (ch === 'C' || ch === 'c') this.veMotCua(g, this.cuaT[kO], now);
        if (ch === '=') g.drawImage(TL.rao((x > 0 && c.rows[y][x - 1] === '=' ? 1 : 0) | (x < c.w - 1 && c.rows[y][x + 1] === '=' ? 2 : 0) | (y > 0 && c.rows[y - 1][x] === '=' ? 4 : 0) | (y < c.h - 1 && c.rows[y + 1][x] === '=' ? 8 : 0)), x * T, y * T);
      }
      this.veDichTrong(g, now);
      this.veVat(g, TL, now);
      this.veThung(g, TL, now);
      this.veDichDay(g);
      if (c.dd) {                                              // vòng mờ nét đứt: ô xuất phát
        g.save(); g.strokeStyle = 'rgba(255,246,227,.7)'; g.lineWidth = 1; g.setLineDash([2, 2]);
        g.strokeRect(c.dd.x * T + 1.5, c.dd.y * T + 1.5, T - 3, T - 3); g.restore();
      }
      if (c.cat) {                                             // dấu … ở cạnh bị cắt
        g.fillStyle = 'rgba(255,246,227,.85)';
        var cw = this.cv.width, ch2 = this.cv.height, m = 3;
        for (var q2 = -1; q2 <= 1; q2++) {
          if (c.cat.tren) g.fillRect(cw / 2 + q2 * 4 - 1, m, 2, 2);
          if (c.cat.duoi) g.fillRect(cw / 2 + q2 * 4 - 1, ch2 - m - 2, 2, 2);
          if (c.cat.trai) g.fillRect(m, ch2 / 2 + q2 * 4 - 1, 2, 2);
          if (c.cat.phai) g.fillRect(cw - m - 2, ch2 / 2 + q2 * 4 - 1, 2, 2);
        }
      }
      if (c.co) {
        var fy = this.bounce > now ? -Math.round(Math.abs(Math.sin((this.bounce - now) / 80)) * 3) : 0;
        g.drawImage(TL.flags[ff], Math.max(0, Math.min(this.cv.width - 18, c.co.x * T - 2)), Math.max(0, Math.min(this.cv.height - 18, c.co.y * T - 2)) + fy);
      }
      this.veLop(now);
      if (this.lamps) {
        var wl = this.wh.L > 0 ? 1 : 0, wr = this.wh.R > 0 ? 1 : 0;
        if (wl !== this.lst.L) { this.lst.L = wl; this.lamps.T.classList.toggle('on', !!wl); }
        if (wr !== this.lst.R) { this.lst.R = wr; this.lamps.P.classList.toggle('on', !!wr); }
      }
    },

    tween: function (ms, my, fn) {
      var self = this;
      return new Promise(function (res) {
        var t0 = performance.now();
        (function f() {
          if (my !== self.rid) { res(); return; }
          var k = ms <= 0 ? 1 : Math.min(1, (performance.now() - t0) / ms);
          fn(k);
          if (k < 1) setTimeout(f, 16); else res();
        })();
      });
    },

    /**
     * Phát lại MỘT sự kiện 'nhip' của vết trong `ms` mili giây.
     * Trả về Promise; nếu sân bị datLai() giữa chừng thì dừng sớm.
     */
    phatNhip: async function (e, ms) {
      var my = this.rid, v = this.vis, self = this, evs = e.suKien || [];
      var b = (e.robot && e.robot.banh) || { trai: 0, phai: 0 };
      if (v.nc && e.robot && e.robot.namCham) v.nc.bat = !!e.robot.namCham.bat;     // nam châm: trạng thái bật / tắt của nhịp (lệnh bật tắt chạy ĐẦU nhịp)
      v.camBien = (e.robot && e.robot.camBien) ? { bat: true } : null;       // cảm biến sáng trong nhịp có lệnh đọc cảm biến (lõi chưa có: chương sau điền e.robot.camBien)
      this.wh.L = b.trai !== 0 ? 2 : 0; this.wh.R = b.phai !== 0 ? 2 : 0;
      if (e.robot && e.robot.truot) { this.wh.L = 2; this.wh.R = 2; }       // omni trượt ngang: cả bốn bánh nhỏ cùng quay
      var list = evs.filter(function (s) { return s.ma !== 'toi-co' && !HIEU_UNG[s.ma]; });
      var thungXe = evs.filter(function (s) { return s.ma === 'thung-di' && s.nguon === 'xe'; });          // thùng đi cùng lúc với xe (xe tiến đẩy)
      var thungBang = evs.filter(function (s) { return s.ma === 'thung-di' && s.nguon === 'bang'; });      // thùng nằm trên băng: băng đưa đi 1 ô
      list = list.filter(function (s) { return !(s.ma === 'thung-di' && (s.nguon === 'xe' || s.nguon === 'bang')); });
      if (thungBang.length && !list.some(function (s) { return s.ma === 'bang-day'; })) list.push({ ma: 'thung-bang' });
      var cuaEvs = evs.filter(function (s) { return s.ma === 'cua-doi' || s.ma === 'cua-ket'; });                // súng bóng: cửa đổi ở CUỐI nhịp, gom làm một bước
      if (cuaEvs.length) list.push({ ma: 'cua-batch' });
      var dsT = function (arr) {
        return arr.map(function (q) { var th = self.thungTheoId(q.id); return th ? { th: th, x0: q.tu.x, y0: q.tu.y, x1: q.den.x, y1: q.den.y } : null; }).filter(function (q) { return q; });
      };
      var capT = function (m, k2) { m.forEach(function (q) { q.th.x = q.x0 + (q.x1 - q.x0) * k2; q.th.y = q.y0 + (q.y1 - q.y0) * k2; }); };
      var xongT = function (m) { m.forEach(function (q) { q.th.x = q.x1; q.th.y = q.y1; }); };
      var tgian = ms;
      if (e.robot && e.robot.tay) {                                 // (a) tay đổi tư thế, (b) kẹp / thả: xong rồi mới tới bánh
        tgian = await this.apTay(e, ms, my);
        if (tgian < 0) return;
      }
      var laNhen = this.cfg.robot.than === 'nhen', laXich = this.cfg.robot.than === 'xich', d = v.d;
      if (v.nem && e.robot && e.robot.nem) { var nvs = evs.filter(function (s) { return s.ma === 'nem-vat'; })[0]; v.nem.tam = nvs ? nvs.tam : e.robot.nem.tam; }   // tầm hiển thị khi ném = tầm LÚC GỌI throw()
      if (evs.some(function (s) { return s.ma === 'omni-khong-cheo' || s.ma === 'nem-dung-yen' || s.ma === 'ban-dung-yen'; })) this.baoHieu('?', 1100);
      else if (evs.some(function (s) { return s.ma === 'ban-goi-lai'; })) this.baoHieu('!', 1300);                  // súng bóng: lệnh shoot thứ hai trong nhịp bị bỏ
      if (v.sung && e.robot && e.robot.sung && e.robot.sung.dan !== undefined) v.sung.dan = e.robot.sung.dan;        // omni: lệnh bánh cùng nhịp với slide bị bỏ
      if (evs.some(function (s) { return s.ma === 'xich-quay-do'; })) {                            // xích: phần quay dở bị mất, xoay ngược về thẳng, dấu ?
        var g0 = v.goc, tq = Math.min(tgian * 0.3, 90);
        this.baoHieu('?', 1300);
        await this.tween(tq, my, function (k) { v.goc = g0 * (1 - ease(k)); });
        if (my !== this.rid) return;
        v.goc = 0; tgian = Math.max(ms * 0.3, tgian - tq);
      }
      var TRONG = function (s) { return s.ma === 'bang-khong-day' ? 0.5 : s.ma === 'hut-vat' ? 1.5 : s.ma === 'tha-vat' ? 0.8 : s.ma === 'nem-vat' ? 2.4 : s.ma === 'nem-roi' ? 0.8 : s.ma === 'nem-vo' ? 1.2 : s.ma === 'ban' ? 2.2 : s.ma === 'cua-batch' ? 1.2 : 1; };
      var tong = 0; list.forEach(function (s) { tong += TRONG(s); });
      if (!list.length) await ngu(tgian);
      for (var i = 0; i < list.length; i++) {
        var s = list[i], per = tgian * TRONG(s) / tong;
        if (my !== this.rid) return;
        if (s.den && (s.ma === 'tien' || s.ma === 'lui' || s.ma === 'di' || s.ma === 'bang-day' || s.ma === 'truot')) {
          var x0 = v.x, y0 = v.y, sx = Math.sign(s.den.x - x0), sy = Math.sign(s.den.y - y0), laTruot = s.ma === 'truot';
          var mt = (s.ma === 'tien' && thungXe.length) ? dsT(thungXe.splice(0)) : (s.ma === 'bang-day' && thungBang.length) ? dsT(thungBang.splice(0)) : [];
          if (laNhen && s.ma === 'di') v.chan = 2;                    // nhịp 2 của bước nhện: trượt sang ô mới, chân bước
          if (s.ma === 'bang-day') await ngu(per * 0.15);
          await this.tween(per * (s.ma === 'bang-day' ? 0.85 : 1), my, function (k) {
            var k2 = ease(k); v.x = x0 + (s.den.x - x0) * k2; v.y = y0 + (s.den.y - y0) * k2;
            if (mt.length) {
              capT(mt, k2);
              if (s.ma === 'tien' && Math.random() < 0.45) self.burst(mt[0].th.x * T + 7 - sx * 5, mt[0].th.y * T + 10 - sy * 5, 1, ['#fff6e3', '#d8d8d8'], 0.4);       // thùng bị đẩy: bụi nhẹ
            }
            if (laTruot && Math.random() < 0.5) self.burst(v.x * T + 7 - sx * 6, v.y * T + 9 - sy * 6, 1, ['#fff6e3', '#bfe8b0'], 0.5);      // omni: bụi phía sau, xe giữ nguyên hướng mặt
          });
          if (my !== this.rid) return;
          v.x = s.den.x; v.y = s.den.y; v.chan = 0; xongT(mt);
        } else if (s.ma === 'thung-di') {                            // push(): tấm đẩy giật ra, thùng trượt soO ô thật nhanh, vệt bụi phía sau
          var m1 = dsT([s]), th1 = m1.length ? m1[0].th : null, ux = Math.sign(s.den.x - s.tu.x), uy = Math.sign(s.den.y - s.tu.y);
          this.giat(180);
          await this.tween(per, my, function (k) {
            capT(m1, 1 - Math.pow(1 - k, 2.2));
            if (th1 && Math.random() < 0.85) self.burst(th1.x * T + 7 - ux * 7, th1.y * T + 10 - uy * 7, 1, ['#fff6e3', '#d8d8d8', '#bfe8b0'], 0.5);
          });
          xongT(m1);
        } else if (s.ma === 'thung-bang') {                          // băng chuyền đưa thùng đi 1 ô (xe đứng ngoài băng)
          var m2 = dsT(thungBang.splice(0));
          await ngu(per * 0.15);
          await this.tween(per * 0.85, my, function (k) { capT(m2, ease(k)); });
          xongT(m2);
        } else if (s.ma === 'thung-chan' || s.ma === 'thung-bang-chan') {      // thùng không đi được: xe và thùng rung nhẹ, dấu '!'
          var th2 = this.thungTheoId(s.id), laXe = s.ma === 'thung-chan';
          var cx2 = Math.sign(s.den.x - s.o.x), cy2 = Math.sign(s.den.y - s.o.y);
          if (laXe) { this.baoHieu('!', 1400); if (s.kieu === 'push') this.giat(220); }
          await this.tween(per, my, function (k) {
            var a = Math.sin(k * Math.PI * 3) * (1 - k);
            if (laXe) { v.dx = cx2 * a * 1.6; v.dy = cy2 * a * 1.6; }
            if (th2) { th2.dx = cx2 * a * 1.2; th2.dy = cy2 * a * 1.2; }
          });
          v.dx = 0; v.dy = 0; if (th2) { th2.dx = 0; th2.dy = 0; }
        } else if (s.ma === 'thung-ket') {                           // thùng kẹt góc: ô tô đỏ (giữ tới khi chạy lại), thùng rung
          var tk = this.thungTheoId(s.id);
          if (tk) tk.ket = true;
          await this.tween(per, my, function (k) { if (tk) { tk.dx = Math.sin(k * Math.PI * 9) * (1 - k) * 1.6; tk.dy = Math.cos(k * Math.PI * 7) * (1 - k) * 0.8; } });
          if (tk) { tk.dx = 0; tk.dy = 0; }
        } else if (s.ma === 'day-hut') {                             // push() mà trước mặt không có thùng: tấm đẩy giật hụt, dấu '?'
          this.giat(200); this.baoHieu('?', 1100);
          await ngu(per);
        } else if (s.ma === 'quay-nua') {                             // xích: nhịp quay thứ nhất, xoay 45° (nhịp kế cùng lệnh mới đủ 90°)
          var q0 = v.goc, q1 = (s.huong > 0 ? 1 : -1) * Math.PI / 4;
          await this.tween(per, my, function (k) {
            v.goc = q0 + (q1 - q0) * ease(k); v.hop = Math.sin(k * Math.PI) * 1.5;
            if (Math.random() < 0.4) self.burst(v.x * T + (s.huong < 0 ? 3 : 11), v.y * T + 12, 1, ['#fff6e3', '#7fe8ff'], 0.6);
          });
          if (my !== this.rid) return;
          v.goc = q1; v.hop = 0;
        } else if (s.ma === 'bang-khong-day') {                       // xích: băng chạy dưới xích mà xe đứng yên, xích bám chặt rung nhẹ
          await this.tween(per, my, function (k) {
            v.dx = Math.sin(k * Math.PI * 6) * (1 - k) * 1.1;
            if (Math.random() < 0.35) self.burst(v.x * T + 3 + Math.random() * 8, v.y * T + 12, 1, ['#d8d8d8', '#fff6e3'], 0.4);
          });
          v.dx = 0;
        } else if (s.ma === 'hut-vat') {                             // nam châm hút được vật sắt: vật rung rồi bay về mũi xe và dính
          await this.hutVat(s, per, my);
        } else if (s.ma === 'nap-vat') {                             // load(): vật ở ô trước mặt nhảy lên rổ
          await this.napVat(s, ms * 1.7, my);
        } else if (s.ma === 'nem-vat') {                             // throw(): vật bay vòng cung tới ô rơi
          await this.nemVat(s, ms * 2.8, my);
        } else if (s.ma === 'nem-roi') {                             // vật chạm đất, nảy nhẹ
          await this.nemRoi(s, ms * 1.1, my);
        } else if (s.ma === 'nem-vo') {                              // vật vỡ ở ô rơi
          await this.nemVo(s, ms * 2.2, my);
        } else if (s.ma === 'nem-hut' || s.ma === 'nap-hut') {       // throw() khi rổ trống / load() khi ô trước mặt không có vật: cần vung hụt, dấu '?'
          this.baoHieu('?', 1400);
          if (v.nem) v.nem.dang = performance.now() + Math.min(per, 400);
          await ngu(per);
        } else if (s.ma === 'ro-day') {                              // load() khi rổ đã có vật: vật trong rổ rung, dấu '!'
          this.baoHieu('!', 1500);
          if (v.nem) { v.nem.rung = performance.now() + Math.max(per, 500); v.nem.loi = v.nem.rung; }
          await ngu(per);
        } else if (s.ma === 'ban') {                                  // shoot(): bóng bay thẳng từ miệng súng tới ô den
          await this.banBong(s, evs, ms * 2.1, my);
        } else if (s.ma === 'cua-batch') {                            // cuối nhịp: cửa trượt mở / đóng, cửa kẹt rung đỏ
          if (typeof e.nhip === 'number') this.nhipDa = e.nhip;
          await this.cuaBatch(cuaEvs, ms * 0.95, my);
        } else if (s.ma === 'het-dan') {                              // shoot() khi hết đạn: nòng chỉ lóe xám, thẻ đạn nháy đỏ, dấu '!'
          var mzx = Math.round(v.x) * T + 7 + DX[d] * (this.mz || 8), mzy = Math.round(v.y) * T + 7 + DY[d] * (this.mz || 8);
          if (v.sung) v.sung.het = performance.now() + 900;
          this.baoHieu('!', 1500); this.burst(mzx, mzy, 5, ['#9a8a86', '#d0d6e4', '#ffffff'], 0.4, 1, true);
          await ngu(per);
        } else if (s.ma === 'tha-vat') {                             // magnet_off(): vật dính rơi xuống ô sát mũi xe
          await this.thaVat(s, per, my);
        } else if (s.ma === 'hut-go') {                              // nam châm bật mà trước mặt là vật gỗ: sóng chạm vật rồi tắt, vật gỗ rung nhẹ, dấu '?'
          var og = this.vatTaiO(s.o.x, s.o.y), hx = Math.sign(s.o.x - Math.round(v.x)), hy = Math.sign(s.o.y - Math.round(v.y));
          this.baoHieu('?', 1400);
          await this.tween(per, my, function (k) {
            if (og) { og.dx = Math.sin(k * Math.PI * 6) * (1 - k) * 0.9; }
            if (Math.random() < 0.3 * (1 - k)) self.burst(s.o.x * T + 7 - hx * 6, s.o.y * T + 7 - hy * 6, 1, ['#d8d0c0', '#fff6e3'], 0.35);
          });
          if (og) og.dx = 0;
        } else if (s.ma === 'tha-bi-chan') {                         // magnet_off() / release() mà ô trước mũi xe bị chặn: vật dính / trong kẹp rung đỏ, ô trước nhấp nháy đỏ, dấu '!'
          var tn = performance.now();
          this.baoHieu('!', 1500); this.canhBao = { x: s.o.x, y: s.o.y, den: tn + 1300 };
          if (v.nc) v.nc.rung = tn + Math.max(per, 500); else if (s.kieu === 'kep') v.kepRung = tn + Math.max(per, 500);          // kẹp: vật trong kẹp rung đỏ
          await ngu(per);
        } else if (s.ma === 'quay-phai' || s.ma === 'quay-trai' || s.ma === 'quay-dau') {
          var d1 = (d + (s.ma === 'quay-phai' ? 1 : s.ma === 'quay-trai' ? 3 : 2)) % 4, lt = s.ma === 'quay-trai' ? 'L' : 'R';
          var h0 = v.goc, h1 = (s.ma === 'quay-trai' ? -1 : 1) * Math.PI / 2, xoayDan = laXich && s.ma !== 'quay-dau';
          var dq = s.ma === 'quay-phai' ? 1 : s.ma === 'quay-trai' ? -1 : 2;
          await this.tween(per, my, function (k) {
            v.hop = Math.sin(k * Math.PI) * 2;
            if ((v.nc || v.nem) && !xoayDan) (v.nc || v.nem).ang = (d + dq * ease(k)) * Math.PI / 2;      // vật dính / vật trong rổ quay theo mũi xe (vòng cung), không nhảy cóc
            if (xoayDan) v.goc = h0 + (h1 - h0) * ease(k);            // xích: nhịp quay thứ hai, xoay nốt từ 45° tới 90°
            else if (k > 0.5) v.d = d1;
            if (Math.random() < 0.4) self.burst(v.x * T + (lt === 'L' ? 3 : 11), v.y * T + 12, 1, ['#fff6e3', '#7fe8ff'], 0.6);
          });
          if (my !== this.rid) return;
          v.d = d1; v.hop = 0; v.goc = 0; d = d1;
          if (v.nc) v.nc.ang = null;
          if (v.nem) v.nem.ang = null;
        } else if (s.ma === 'dam-tuong' || s.ma === 'bang-chan') {
          var ddx = s.den ? Math.sign(s.den.x - (s.tu ? s.tu.x : v.x)) : 0, ddy = s.den ? Math.sign(s.den.y - (s.tu ? s.tu.y : v.y)) : 0;
          var bad = s.ma === 'dam-tuong', thd = (bad && s.vat === 'thung-nang' && s.den) ? this.thungTaiO(s.den.x, s.den.y) : null;
          var cdr = (bad && s.vat === 'cua' && s.den) ? this.cuaT[s.den.x + ',' + s.den.y] : null;                                // xe húc cửa đang đóng: cánh cửa rung
          if (cdr) cdr.rung = performance.now() + per;
          var vv = (s.vat === 'vat' && s.den) ? (this.objTheoId(s.idVat) || this.vatTaiO(s.den.x, s.den.y)) : null;                         // vướng vật nằm đất: xe giật lại, vật rung, bụi
          if (vv) this.burst(vv.x * T + 7 - ddx * 3, vv.y * T + 7 - ddy * 3, 4, vv.chat === 'sat' ? ['#dcecfa', '#a9c0d8', '#fff6e3'] : ['#e8b574', '#fff6e3', '#c98a45'], 0.5);
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) {
            var a = Math.sin(k * Math.PI * 3) * (1 - k) * 3; v.dx = ddx * a; v.dy = ddy * a;
            if (thd) { thd.dx = ddx * a * 0.4; thd.dy = ddy * a * 0.4; }
            if (vv) { vv.dx = ddx * a * 0.5; vv.dy = ddy * a * 0.5; }
            if (bad && k > 0.1 && k < 0.6) self.flash = performance.now() + 120;
          });
          v.dx = 0; v.dy = 0; v.chan = 0; if (thd) { thd.dx = 0; thd.dy = 0; } if (vv) { vv.dx = 0; vv.dy = 0; }
          if (bad && this.onRung) this.onRung();
        } else if (s.ma === 'chuan-bi') {                            // nhện: nhịp 1 của bước, nhấc chân (đổi khung `buoc`), chưa rời ô
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) { v.hop = Math.sin(k * Math.PI) * 1; });
          v.hop = 0;
        } else if (s.ma === 'tay-vuong') {                           // tay hạ sát đất: xe rung tại chỗ, tay nháy đỏ
          v.tayDo = performance.now() + per + 700;
          if (laNhen) v.chan = 1;
          await this.tween(per, my, function (k) { v.dx = Math.sin(k * Math.PI * 7) * (1 - k) * 2.5; });
          v.dx = 0; v.chan = 0;
        } else {
          await ngu(per);
        }
      }
      if (my !== this.rid) return;
      // đồng bộ với vết (an toàn nếu có sự kiện lạ)
      v.x = e.robot.x; v.y = e.robot.y; v.d = laNhen ? (this.cfg.bd.huong || 0) : e.robot.huong; v.hop = 0; v.dx = 0; v.dy = 0; v.chan = 0;
      v.goc = laXich && e.robot.quayDo ? (e.robot.quayDo > 0 ? 1 : -1) * Math.PI / 4 : 0;       // xích còn quay dở: nghiêng 45° chờ nhịp kế   // nhện không quay: mặt trước (cạnh gắn tay) cố định theo batDau.huong
      if (e.thung) this.dongBoThung(e.thung);
      if (v.nc) {                                                       // nam châm: đưa vật (dính / nằm) và trạng thái bật về đúng vết
        v.nc.ang = null; if (e.robot.namCham) v.nc.bat = !!e.robot.namCham.bat;
        this.dongBoVat(e.vat);
        for (var oi = 0; oi < this.objs.length; oi++) { this.objs[oi].bay = null; this.objs[oi].nang = 0; this.objs[oi].dx = 0; this.objs[oi].dy = 0; }
      }
      this.dongBoSung(e);                                               // súng bóng: nút, cửa, băng chuyền tắt, số nhịp, số đạn
      if (v.nem) {                                                      // máy ném: đưa vật (nằm / trong rổ / vỡ) và tầm về đúng vết
        v.nem.ang = null; v.nem.dang = 0; if (e.robot.nem) v.nem.tam = e.robot.nem.tam;
        this.dongBoVat(e.vat);
        for (var ni = 0; ni < this.objs.length; ni++) { this.objs[ni].nb = null; this.objs[ni].nang = 0; this.objs[ni].dx = 0; this.objs[ni].dy = 0; }
      }
      if (e.robot.tay) v.tay = { tuThe: e.robot.tay.tuThe, kep: e.robot.tay.kep, cam: e.robot.tay.cam };
      v.camBien = null;
      this.wh.L = 0; this.wh.R = 0;
    },

    /** Tấm đẩy giật ra trước một khung trong ms mili giây (lúc push() chạy). */
    giat: function (ms) {
      var my = this.rid, v = this.vis, self = this;
      v.ra = 1;
      setTimeout(function () { if (my === self.rid) v.ra = 0; }, ms);
    },
    /** Đưa vị trí các thùng nặng về đúng vết (theo id). */
    dongBoThung: function (ds) {
      for (var i = 0; i < ds.length; i++) {
        var o = this.thungTheoId(ds[i].id);
        if (o) { o.x = ds[i].x; o.y = ds[i].y; o.dx = 0; o.dy = 0; }
      }
    },

    /** Xích: chương trình dừng khi còn quay dở thì phần quay dở mất: xoay ngược về thẳng kèm dấu '?'. */
    quayVe: async function () {
      var v = this.vis, my = this.rid, g0 = v ? v.goc : 0;
      if (!g0) return;
      this.baoHieu('?', 1400);
      await this.tween(260, my, function (k) { v.goc = g0 * (1 - ease(k)); });
      if (my === this.rid) v.goc = 0;
    },

    /**
     * Áp phần TAY của một nhịp: tay đổi tư thế (qua một khung nửa chừng), kẹp / thả, cập nhật vật và hiệu ứng.
     * Trả về thời gian còn lại cho bánh chạy, hoặc -1 nếu sân bị datLai() giữa chừng.
     */
    apTay: async function (e, ms, my) {
      var v = this.vis, tm = e.robot.tay, cu = v.tay, con = ms, evs = e.suKien || [];
      var doiThe = cu.tuThe !== tm.tuThe, doiKep = cu.kep !== tm.kep || (cu.cam !== null) !== (tm.cam !== null);
      if (doiThe) {
        v.tay = { tuThe: 'giua', kep: cu.kep, cam: cu.cam };
        await ngu(ms * 0.14); con -= ms * 0.14;
        if (my !== this.rid) return -1;
      }
      var nhat = evs.filter(function (s) { return s.ma === 'nhat-vat'; })[0], dat = evs.filter(function (s) { return s.ma === 'dat-vat'; })[0], vo = evs.filter(function (s) { return s.ma === 'vat-vo'; })[0];
      var ev1 = nhat || dat || vo, ob = ev1 && ev1.o ? this.objTheoId(ev1.id) : null, tr = ms * 0.65;
      if (ob && this.lopOK) {                                    // vật TRƯỢT giữa ô trước mặt và kẹp (nhặt: vào kẹp; đặt / thả vỡ: ra khỏi kẹp xuống ô trước mặt)
        ob.tx = ev1.o.x; ob.ty = ev1.o.y; con -= tr;
        if (nhat) {
          v.tay = { tuThe: tm.tuThe, kep: true, cam: nhat.id }; ob.tt = 'anim'; ob.k = 0;                   // hai càng khép lại ôm vật trong lúc vật trượt vào
          await this.tween(tr, my, function (k) { ob.k = ease(k); });
        } else {
          var mo = false;
          v.tay = { tuThe: tm.tuThe, kep: cu.kep, cam: cu.cam }; ob.tt = 'anim'; ob.k = 1;
          await this.tween(tr, my, function (k) { ob.k = 1 - ease(k); if (k > 0.4 && !mo) { mo = true; v.tay = { tuThe: tm.tuThe, kep: tm.kep, cam: tm.cam }; } });       // vật rời kẹp, rồi hai càng mở
        }
        if (my !== this.rid) return -1;
        ob.k = nhat ? 1 : 0;
      }
      v.tay = { tuThe: tm.tuThe, kep: tm.kep, cam: tm.cam };
      this.dongBoVat(e.vat);
      this.hieuUngTay(evs);
      if (!ob && (doiThe || doiKep)) { await ngu(ms * 0.1); con -= ms * 0.1; if (my !== this.rid) return -1; }
      return Math.max(ms * 0.3, con);
    },
    /** Đưa vị trí / trạng thái các vật về đúng vết (theo id). */
    dongBoVat: function (ds) {
      if (!ds) return;
      var now = performance.now();
      for (var i = 0; i < ds.length; i++) {
        var it = ds[i], o = null;
        for (var j = 0; j < this.objs.length; j++) if (this.objs[j].id === it.id) { o = this.objs[j]; break; }
        if (!o) continue;
        var cu = o.tt;
        o.x = it.x; o.y = it.y; o.tt = it.trangThai === 'vo' ? 'vo' : it.trangThai === 'cam' ? 'cam' : it.trangThai === 'ro' ? 'ro' : 'dat';
        if (o.tt === 'vo' && cu !== 'vo') o.voLuc = now;
      }
    },
    /** Hiệu ứng tức thì của các sự kiện tay: nhặt, đặt, vỡ (mảnh vỡ rồi mờ), kẹp hụt (?), ô đã có vật (!). */
    hieuUngTay: function (evs) {
      for (var i = 0; i < evs.length; i++) {
        var s = evs[i], o = s.o, px = o ? o.x * T + 7 : 0, py = o ? o.y * T + 7 : 0;
        if (s.ma === 'nhat-vat' && o) this.burst(px, py, 8, ['#e8b574', '#fff6e3', '#c98a45'], 0.7);
        else if (s.ma === 'dat-vat' && o) this.burst(px, py + 3, 6, ['#fff6e3', '#bfe8b0'], 0.5);
        else if (s.ma === 'vat-vo' && o) {
          this.burst(px, py, 16, ['#c98a45', '#8a5a24', '#e8b574', '#5a3a14'], 1.7, 2, true);
          this.chopDo(160);
        } else if (s.ma === 'kep-hut') {
          this.baoHieu('?', 1300);
          var oh = (s.lyDo === 'tay-nang' && o) ? this.vatTaiO(o.x, o.y) : null;                          // tay còn nâng: vật ngay trước mặt rung nhẹ như bị chạm hụt
          if (oh) oh.rung = performance.now() + 450;
        }
      }
    }
  };

  /** Vật trong ảnh nhỏ của sân: ô vuông nhỏ giữa ô; gỗ nâu, SẮT xám xanh có viền sáng; mv = tên màu của vật (dải ngang). */
  function thuVat(g, px, py, s, mv, sat) {
    var q = s >> 2, w2 = s >> 1;
    g.fillStyle = sat ? '#8aa2bd' : '#c98a45'; g.fillRect(px + q, py + q, w2, w2);
    if (sat) { g.fillStyle = '#e4f0fb'; g.fillRect(px + q, py + q, w2, Math.max(1, s >> 4)); g.fillRect(px + q, py + q, Math.max(1, s >> 4), w2); g.fillStyle = '#4a617c'; g.fillRect(px + q + w2 - Math.max(1, s >> 4), py + q, Math.max(1, s >> 4), w2); g.fillRect(px + q, py + q + w2 - Math.max(1, s >> 4), w2, Math.max(1, s >> 4)); }
    if (mv) { g.fillStyle = Ve.MAU[mv].s; g.fillRect(px + q, py + (s >> 1) - 1, w2, Math.max(2, s >> 3)); }
  }

  /**
   * Ảnh nhỏ của một sân (cho dải chọn sân): vẽ lên canvas cv, mỗi ô vuông nguyên px CSS (vừa khung rong × cao px CSS), hai px canvas mỗi px CSS.
   * rows = hàng sân của lõi, bd = { x, y, huong } ô xuất phát (chấm xanh lơ có mũi chỉ hướng mặt). Không có luật chơi, chỉ để nhận ra sân.
   */
  function thuSan(cv, rows, bd, rong, cao, lopMau) {
    var w = rows[0].length, h = rows.length, c = Math.max(2, Math.floor(Math.min((rong || 29) / w, (cao || 28) / h))), q = 2, s = c * q;
    cv.width = w * s; cv.height = h * s; cv.style.width = (w * c) + 'px'; cv.style.height = (h * c) + 'px';
    var g = cv.getContext('2d'), x, y, ch, px, py;
    var mauO = dungLopMau(rows, lopMau && lopMau.mau), vm = lopMau && lopMau.vatMau, vc = lopMau && lopMau.vatChat;       // sân có ô màu / vật màu (chương cảm biến màu), chất vật (chương nam châm)
    var them = (lopMau && lopMau.vatThem) || [], cuaNhip = {};
    ((lopMau && lopMau.cuaNhip) || []).forEach(function (cn) { cuaNhip[cn.x + ',' + cn.y] = cn; });                      // cửa nhịp: ảnh nhỏ vẽ trạng thái lúc đầu (theo pha), khung xanh lơ                                                                          // vật thêm ngoài ký hiệu (vd trên băng chuyền)
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      ch = rows[y][x]; px = x * s; py = y * s;
      if (ch === '#') { g.fillStyle = '#4a5368'; g.fillRect(px, py, s, s); g.fillStyle = '#7a85a3'; g.fillRect(px, py, s, Math.max(1, s >> 3)); continue; }
      if (ch === '=') {                                                       // hàng rào thấp: sàn xanh + thanh gỗ ngang + cọc (khác ô tường đặc)
        g.fillStyle = '#2f7a46'; g.fillRect(px, py, s, s);
        var rh = Math.max(1, s >> 3), ry = py + (s >> 1) - (rh >> 1);
        g.fillStyle = '#1b120a'; g.fillRect(px, ry - 1, s, rh + 2);
        g.fillStyle = '#e8b574'; g.fillRect(px, ry, s, rh);
        g.fillStyle = '#1b120a'; g.fillRect(px + (s >> 1) - (s >> 3) - 1, py + (s >> 2), (s >> 2) + 2, (s >> 1));
        g.fillStyle = '#c98a45'; g.fillRect(px + (s >> 1) - (s >> 3), py + (s >> 2) + 1, s >> 2, (s >> 1) - 2);
        continue;
      }
      if (ch === 'N') {                                                       // nút bắn: tường xám + nút tròn đỏ ở giữa
        g.fillStyle = '#4a5368'; g.fillRect(px, py, s, s); g.fillStyle = '#7a85a3'; g.fillRect(px, py, s, Math.max(1, s >> 3));
        g.fillStyle = K_INK; g.fillRect(px + (s >> 2), py + (s >> 2), s >> 1, s >> 1);
        g.fillStyle = '#e8604a'; g.fillRect(px + (s >> 2) + 1, py + (s >> 2) + 1, Math.max(1, (s >> 1) - 2), Math.max(1, (s >> 1) - 2));
        continue;
      }
      if (ch === 'C' || ch === 'c') {                                         // cửa: đóng = khối xám khung vàng; mở = sàn có hai cột khung vàng
        var nhT = cuaNhip[x + ',' + y], moT = nhT ? (nhT.pha % (nhT.mo + nhT.dong)) < nhT.mo : ch === 'c', kh = nhT ? '#38c6de' : '#f2b533', cd = Math.max(1, s >> 3);
        g.fillStyle = '#2f7a46'; g.fillRect(px, py, s, s);
        if (!moT) { g.fillStyle = K_INK; g.fillRect(px, py, s, s); g.fillStyle = '#9aa3b6'; g.fillRect(px + cd, py, s - 2 * cd, s); g.fillStyle = K_INK; g.fillRect(px + (s >> 1) - 1, py, 1, s); }
        g.fillStyle = kh; g.fillRect(px, py, cd, s); g.fillRect(px + s - cd, py, cd, s);
        continue;
      }
      var mn = mauO && mauO[y][x] && BANG[ch] === undefined && ch !== 'S' ? mauO[y][x] : null;
      g.fillStyle = mn ? Ve.MAU[mn].n : BANG[ch] !== undefined ? '#2f5fb0' : ch === 'S' ? '#9aa0b0' : '#2f7a46'; g.fillRect(px, py, s, s);
      if (mn) { g.fillStyle = Ve.MAU[mn].t; g.fillRect(px, py, s, 1); g.fillRect(px, py + s - 1, s, 1); g.fillRect(px, py, 1, s); g.fillRect(px + s - 1, py, 1, s); }
      if (ch === 'H' || ch === 'h') { g.fillStyle = '#8d97a8'; g.fillRect(px + (s >> 3), py + (s >> 3), s - (s >> 2), s - (s >> 2)); }
      if (ch === 'o' || ch === 'X') {
        var mv = vm && vm[y] ? MAU_KY[vm[y][x]] : null, sat = !!(vc && vc[y] && vc[y][x] === 's');
        thuVat(g, px, py, s, mv, sat);
      }
      if (ch === 'D' || ch === 'X' || ch === 'h') { g.strokeStyle = mn ? Ve.MAU[mn].vi : '#ffd23f'; g.lineWidth = Math.max(1, s >> 3); g.strokeRect(px + g.lineWidth / 2, py + g.lineWidth / 2, s - g.lineWidth, s - g.lineWidth); }
      if (ch === 'F') {
        g.fillStyle = '#fff6e3'; g.fillRect(px + (s >> 1) - 1, py + 1, Math.max(1, s >> 3), s - 2);
        g.fillStyle = '#ff4a3c'; g.fillRect(px + (s >> 1), py + 1, s >> 1, s >> 1);
      }
    }
    them.forEach(function (o) {
      var ox = Math.floor(o.x), oy = Math.floor(o.y);
      if (ox < 0 || oy < 0 || ox >= w || oy >= h || rows[oy][ox] === '#' || rows[oy][ox] === 'o' || rows[oy][ox] === 'X') return;
      thuVat(g, ox * s, oy * s, s, chuanMau(o.mau), o.chat === 'sat');
    });
    if (bd) {
      var cx = bd.x * s + s / 2, cy = bd.y * s + s / 2, r = s * 0.28;
      g.fillStyle = '#7ff0ff'; g.fillRect(Math.round(cx - r), Math.round(cy - r), Math.round(r * 2), Math.round(r * 2));
      g.fillStyle = '#1b120a'; g.fillRect(Math.round(cx + DX[bd.huong || 0] * r - 1), Math.round(cy + DY[bd.huong || 0] * r - 1), 2, 2);
    }
  }

  (function loop(now) { FIELDS.forEach(function (f) { f.draw(now || performance.now()); }); requestAnimationFrame(loop); })();

  window.SanVe = { Field: Field, ngu: ngu, ease: ease, DX: DX, DY: DY, thuSan: thuSan };
})();
