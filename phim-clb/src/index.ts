// Entry Remotion của phim CLB Mật Lệnh Robot (kế hoạch: hoc/KE-HOACH-PHIM-CLB.md). Duyệt bằng Studio (launch.json 'phim-clb', cổng 4210).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CacPhim, Phim} from './may-phim';
import {PHIM_MO_DAU} from './PhimMoDau';
import {Mua, taoBanDo} from './BanDoMua';
import {PHIM_M1} from './doc/m1';
import {PHIM_M2} from './doc/m2';
import {PHIM_M3} from './doc/m3';
import {PHIM_CANG} from './doc/cang';
import {PHIM_M4} from './doc/m4';
import {PHIM_M5} from './doc/m5';
import {PHIM_M6} from './doc/m6';
import {PHIM_M7} from './doc/m7';
import {PHIM_M8} from './doc/m8';

/**
 * Gộp các phim kết gói 1..9 (`M<m>G<n>-Ket`) vào đầu phim mở của gói kế tiếp (`M<m>G<n+1>-Mo`),
 * chỉ giữ lại `M<m>G10-Ket` làm phim tổng kết cuối mùa.
 */
const gopKetVaoMoSau = (ds: Phim[]): Phim[] => {
  const kq: Phim[] = [];
  let ketCho: Phim | null = null;
  for (const p of ds) {
    if (/^M[0-9C]+G([1-9])-Ket$/.test(p.id)) {
      ketCho = p;
      continue;
    }
    if (ketCho && /^M[0-9C]+G\d+-Mo$/.test(p.id)) {
      const canhKet = ketCho.canh.map((c, idx) => ({...c, id: `ket-truoc-${idx}-${c.id}`}));
      kq.push({...p, canh: [...canhKet, ...p.canh]});
      ketCho = null;
    } else {
      if (ketCho) {
        kq.push(ketCho);
        ketCho = null;
      }
      kq.push(p);
    }
  }
  if (ketCho) kq.push(ketCho);
  return kq;
};

// bản đồ hành trình: user 31/10 chốt bản A (mùa 2 bản A, xe trạm A); mùa 3 chốt bản B (bản A có phế liệu tràn xuống luống đất nông trại); mùa 4 bản sinh lại (đường vào đúng chỗ 3B ra, nền đất nâu sẫm suốt mùa); bản 4b vào lệch 84 px, uốn làm xiêu nhà kính nên chưa dùng. Xe đỗ ở gói 4 mùa 1.
const MUA_CLB: Mua = {anh: 'mua-clb.jpg', khoa: 'mua-clb', ten: 'CLB Robot', icon: 'Home', mau: '#0284C7'};
const MUA_1: Mua = {anh: 'mua-1.jpg', khoa: 'mua-1', ten: 'Kho hàng', icon: 'Warehouse', mau: '#F59E0B'};
const MUA_2: Mua = {anh: 'mua-2a.jpg', khoa: 'mua-2a', ten: 'Nhà máy', icon: 'Factory', mau: '#EF4444'};
const MUA_3: Mua = {anh: 'mua-3b.jpg', khoa: 'mua-3b', ten: 'Bãi tái chế', icon: 'Recycle', mau: '#16A34A'};
const MUA_CANG: Mua = {anh: 'mua-cang.jpg', khoa: 'mua-cang', ten: 'Cảng biển', icon: 'Anchor', mau: '#0891B2'};
const MUA_SONG: Mua = {anh: 'mua-song.jpg', khoa: 'mua-song', ten: 'Bến sông', icon: 'Waves', mau: '#0D9488'};
const MUA_4: Mua = {anh: 'mua-4a.jpg', khoa: 'mua-4a', ten: 'Nông trại hoa', icon: 'Flower2', mau: '#EC4899'};
const MUA_MO: Mua = {anh: 'mua-mo.jpg', khoa: 'mua-mo', ten: 'Mỏ đá', icon: 'Mountain', mau: '#7C3AED'};
const MUA_HANG: Mua = {anh: 'mua-hang.jpg', khoa: 'mua-hang', ten: 'Hang động', icon: 'Compass', mau: '#DC2626'};
const XE = {anh: 'xe-tram-a.png', mua: 1, nut: 3};
const BAN_DO_4 = taoBanDo([MUA_CLB, MUA_1, MUA_2, MUA_3, MUA_CANG, MUA_SONG, MUA_4, MUA_MO, MUA_HANG], 'dai-9.jpg', XE);
const KHUNG_DOC = {fps: 30, width: 1080, height: 1920, durationInFrames: 600};

const DS_PHIM = [
  PHIM_MO_DAU,
  ...gopKetVaoMoSau(PHIM_M1),
  ...gopKetVaoMoSau(PHIM_M2),
  ...gopKetVaoMoSau(PHIM_M3),
  ...gopKetVaoMoSau(PHIM_CANG),
  ...gopKetVaoMoSau(PHIM_M4),
  ...gopKetVaoMoSau(PHIM_M5),
  ...gopKetVaoMoSau(PHIM_M6),
  ...gopKetVaoMoSau(PHIM_M7),
  ...gopKetVaoMoSau(PHIM_M8),
];

registerRoot(() => React.createElement(React.Fragment, null,
  React.createElement(CacPhim, {ds: DS_PHIM}),
  React.createElement(Composition, {id: 'BanDoMua-4', component: BAN_DO_4.BanDo, ...KHUNG_DOC})));
