// Entry Remotion của phim CLB Mật Lệnh Robot (kế hoạch: hoc/KE-HOACH-PHIM-CLB.md). Duyệt bằng Studio (launch.json 'phim-clb', cổng 4210).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CacPhim} from './may-phim';
import {PHIM_MO_DAU} from './PhimMoDau';
import {PHIM_XE} from './PhimXe';
import {Mua, taoBanDo} from './BanDoMua';
import {PHIM_M1} from './doc/m1';
import {PHIM_M2} from './doc/m2';
import {PHIM_M3} from './doc/m3';

// bản đồ hành trình: user 31/10 chốt bản A (mùa 2 bản A, xe trạm A); mùa 3 chốt bản B (bản A có phế liệu tràn xuống luống đất nông trại); mùa 4 bản sinh lại (đường vào đúng chỗ 3B ra, nền đất nâu sẫm suốt mùa); bản 4b vào lệch 84 px, uốn làm xiêu nhà kính nên chưa dùng. Xe đỗ ở gói 4 mùa 1.
const MUA_1: Mua = {anh: 'mua-1.jpg', khoa: 'mua-1', ten: 'Kho hàng', icon: 'Warehouse', mau: '#F59E0B'};
const MUA_2: Mua = {anh: 'mua-2a.jpg', khoa: 'mua-2a', ten: 'Nhà máy', icon: 'Factory', mau: '#EF4444'};
const MUA_3: Mua = {anh: 'mua-3b.jpg', khoa: 'mua-3b', ten: 'Bãi tái chế', icon: 'Recycle', mau: '#16A34A'};
const XE = {anh: 'xe-tram-a.png', mua: 0, nut: 3};
const mua4 = (b: 'a'): Mua => ({anh: `mua-4${b}.jpg`, khoa: `mua-4${b}`, ten: 'Nông trại hoa', icon: 'Flower2', mau: '#EC4899'});
const BAN_DO_4 = taoBanDo([MUA_1, MUA_2, MUA_3, mua4('a')], 'dai-4a.jpg', XE);
const KHUNG_DOC = {fps: 30, width: 1080, height: 1920, durationInFrames: 600};

registerRoot(() => React.createElement(React.Fragment, null,
  React.createElement(CacPhim, {ds: [PHIM_MO_DAU, PHIM_XE, ...PHIM_M1, ...PHIM_M2, ...PHIM_M3]}),
  React.createElement(Composition, {id: 'BanDoMua-4', component: BAN_DO_4.BanDo, ...KHUNG_DOC})));
