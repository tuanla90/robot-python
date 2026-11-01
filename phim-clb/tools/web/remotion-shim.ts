// Shim 'remotion' cho bản web (dong-goi.mjs nối mọi import 'remotion' vào đây): staticFile trỏ vào hoc/game/phim-clb/a/, ảnh đổi đuôi .webp (nen-anh.py).
export * from 'remotion';

const GOC = (() => {
  const s = typeof document !== 'undefined' && document.currentScript as HTMLScriptElement | null;
  return s && s.src ? s.src.replace(/[^/]*$/, '') + 'a' : 'phim-clb/a';
})();

export const staticFile = (p: string) => `${GOC}/${p.replace(/^\/+/, '').replace(/\.(png|jpe?g)$/i, '.webp')}`;
