/* Arte pixel: fábrica de sprites dibujados por código (1 píxel de arte = 2 px del mundo).
   Todo se genera una vez en lienzos pequeños y se cachea; luego se dibuja ampliado sin suavizar. */
window.G = window.G || {};

G.Pix = (function () {
  const P = {}, K = 2;                       // K: px del mundo por píxel de arte
  P.K = K;
  const hash = (x, y, s) => { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  P.hash = hash;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
  P.mk = mk;
  const rect = (x, col, i, j, w, h) => { x.fillStyle = col; x.fillRect(i, j, w, h); };
  const dot = (x, col, i, j) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
  P.draw = (ctx, cv, x, y, sx) => ctx.drawImage(cv, Math.round(x), Math.round(y), cv.width * K * (sx || 1), cv.height * K);
  /* dibuja un sprite con su ancla (ax, ay en píxeles de arte) en el punto (x, y) del mundo */
  P.drawAt = (ctx, spr, x, y) => ctx.drawImage(spr.cv, Math.round(x - spr.ax * K), Math.round(y - spr.ay * K), spr.cv.width * K, spr.cv.height * K);

  /* ---- Fuente 3x5 ---- */
  const GL = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
    0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
    '¡': '010000010010010', '¿': '010000010100010', "'": '010010000000000', '"': '101101000000000', '(': '001010010010001', ')': '100010010010100', ';': '000010000010100', '=': '000111000111000', '€': '011110110110011', '#': '101111101111101', '*': '000101010101000', '_': '000000000000111', '&': '010101010101011', '→': '000010111010000', '×': '000101010101000',
    '.': '000000000000010', '-': '000000111000000', ':': '000010000010000', '·': '000000010000000', '!': '010010010000010', '?': '110001010000010', '/': '001001010100100', '%': '101001010100101', '+': '000010111010000', ',': '000000000010100',
  };
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  P.textW = (s) => norm(s).length * 4 - 1;
  P.text = (x, s, i, j, col) => {
    x.fillStyle = col; let cx = i;
    for (const ch of norm(s)) {
      const g = GL[ch];
      if (g) for (let k = 0; k < 15; k++) if (g[k] === '1') x.fillRect(cx + (k % 3), j + Math.floor(k / 3), 1, 1);
      cx += 4;
    }
  };
  /* texto suelto sobre el mundo (con sombra) */
  P.worldText = (ctx, s, x, y, col, sh) => {
    const w = P.textW(s), [c, g] = mk(w + 2, 7);
    P.text(g, s, 1, 2, sh || '#1b1410'); P.text(g, s, 1, 1, sh || '#1b1410'); P.text(g, s, 0, 1, sh || '#1b1410'); P.text(g, s, 2, 1, sh || '#1b1410');
    P.text(g, s, 1, 1, col || '#fff');
    ctx.drawImage(c, Math.round(x - (w + 2) * K / 2), Math.round(y), c.width * K, c.height * K);
  };
  /* Todo el texto de los lienzos (rótulos, globos de diálogo, avisos flotantes) se dibuja con la fuente pixel para que se lea con nitidez */
  (function () {
    const proto = CanvasRenderingContext2D.prototype, _fill = proto.fillText, _stroke = proto.strokeText, _measure = proto.measureText;
    const fpx = (f) => { const m = /(\d+(?:\.\d+)?)px/.exec(f || ''); return m ? parseFloat(m[1]) : 12; };
    const unit = (ctx) => K * Math.max(1, Math.round(fpx(ctx.font) / 12));
    const tc = {}; let tn = 0;
    const spr = (s, col) => { const k = s + '|' + col; if (tc[k]) return tc[k]; if (++tn > 700) { for (const q in tc) delete tc[q]; tn = 0; } const w = P.textW(s) , [c, g] = mk(Math.max(1, w), 5); P.text(g, s, 0, 0, col); return (tc[k] = c); };
    const place = (ctx, str, x, y) => { const u = unit(ctx), w = P.textW(str) * u, a = ctx.textAlign, b = ctx.textBaseline; return { u, x: Math.round(a === 'center' ? x - w / 2 : (a === 'right' || a === 'end') ? x - w : x), y: Math.round(b === 'middle' ? y - 2.5 * u : (b === 'top' || b === 'hanging') ? y : y - 5 * u) }; };
    proto.fillText = function (s, x, y, mw) {
      if (!G.retro || typeof this.fillStyle !== 'string') return _fill.apply(this, arguments);
      const str = String(s); if (!str) return; const o = place(this, str, x, y), sp = spr(str, this.fillStyle);
      const sv = this.imageSmoothingEnabled; this.imageSmoothingEnabled = false; this.drawImage(sp, o.x, o.y, sp.width * o.u, 5 * o.u); this.imageSmoothingEnabled = sv;
    };
    proto.strokeText = function (s, x, y) {
      if (!G.retro || typeof this.strokeStyle !== 'string') return _stroke.apply(this, arguments);
      const str = String(s); if (!str) return; const o = place(this, str, x, y), sp = spr(str, this.strokeStyle), sv = this.imageSmoothingEnabled; this.imageSmoothingEnabled = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) this.drawImage(sp, o.x + dx * o.u, o.y + dy * o.u, sp.width * o.u, 5 * o.u);
      this.imageSmoothingEnabled = sv;
    };
    proto.measureText = function (s) { if (!G.retro) return _measure.apply(this, arguments); const str = String(s), w = P.textW(str) * unit(this); return { width: w, actualBoundingBoxAscent: 5 * unit(this), actualBoundingBoxDescent: 0, actualBoundingBoxLeft: 0, actualBoundingBoxRight: w }; };
  })();
  const tcache = {};
  P.textSprite = (s, col, sh) => { const k = s + col + sh; if (tcache[k]) return tcache[k]; const w = P.textW(s), [c, g] = mk(w + 2, 7); P.text(g, s, 0, 1, sh); P.text(g, s, 2, 1, sh); P.text(g, s, 1, 0, sh); P.text(g, s, 1, 2, sh); P.text(g, s, 1, 1, col); return (tcache[k] = c); };

  /* ---- Blob con contorno y 3 tonos ---- */
  P.blob = (w, h, inside, pal, seed, light) => {
    const [c, x] = mk(w, h), m = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) m[j * w + i] = inside(i, j) ? 1 : 0;
    const at = (i, j) => (i < 0 || j < 0 || i >= w || j >= h ? 0 : m[j * w + i]);
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (m[j * w + i]) { minX = Math.min(minX, i); maxX = Math.max(maxX, i); minY = Math.min(minY, j); maxY = Math.max(maxY, j); }
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, rx = Math.max(1, (maxX - minX) / 2), ry = Math.max(1, (maxY - minY) / 2);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (!m[j * w + i]) continue;
      const edge = !at(i - 1, j) || !at(i + 1, j) || !at(i, j - 1) || !at(i, j + 1);
      if (edge) { dot(x, pal[3], i, j); continue; }
      const lv = ((cx - i) / rx) * (light ? light[0] : 0.5) + ((cy - j) / ry) * (light ? light[1] : 0.9) + (hash(i, j, seed || 1) - 0.5) * 0.55;
      dot(x, lv > 0.42 ? pal[0] : lv < -0.2 ? pal[2] : pal[1], i, j);
    }
    return c;
  };

  const cache = {};
  const memo = (k, f) => cache[k] || (cache[k] = f());

  /* ---------------- Terreno (tiles de 16x16) ---------------- */
  const GR = [
    { b: '#78b844', d: '#5e9c36', l: '#92cc58', k: '#4c8a2e' },
    { b: '#62a63a', d: '#4a8a2e', l: '#7cc04a', k: '#3a7626' },
    { b: '#a8963c', d: '#8c7a2e', l: '#c2b052', k: '#6e5e22' },
    { b: '#dde7ee', d: '#c0d0dc', l: '#f4f8fb', k: '#a9bccb' },
  ];
  const mix = (a, b, f) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
  /* v = tipo*4 + variante; tipo 0 normal, 1 frondosa (más oscura y con más hierba), 2 seca (más clara y amarillenta) */
  P.grass = (sn, v) => memo('g' + sn + v, () => {
    const [c, x] = mk(16, 16), ty = Math.floor(v / 4), vv = v % 4; let p = GR[sn];
    if (ty === 1) p = { b: tone(p.b, -0.1), d: tone(p.d, -0.12), l: tone(p.l, -0.04), k: tone(p.k, -0.1) };
    else if (ty === 2) { const dry = sn === 3 ? '#ffffff' : '#d8c860'; p = { b: mix(p.b, dry, 0.28), d: mix(p.d, dry, 0.2), l: mix(p.l, dry, 0.4), k: mix(p.k, dry, 0.15) }; }
    rect(x, p.b, 0, 0, 16, 16);
    for (let n = 0; n < 8 + ty * 2; n++) dot(x, hash(vv, n, 3 + ty) > 0.5 ? p.d : p.l, Math.floor(hash(vv, n, 11) * 16), Math.floor(hash(vv, n, 12 + ty) * 16));
    for (let n = 0; n < 2 + (ty === 1 ? 2 : 0); n++) { const i = 1 + Math.floor(hash(vv, n, 21 + ty) * 12), j = 2 + Math.floor(hash(vv, n, 22 + ty) * 12); dot(x, p.k, i, j + 1); dot(x, p.d, i + 1, j); dot(x, p.k, i + 2, j + 1); if (ty === 1) dot(x, p.l, i + 1, j - 1); }
    if (sn === 3 && ty !== 1) for (let n = 0; n < 3; n++) dot(x, '#ffffff', Math.floor(hash(vv, n, 25) * 16), Math.floor(hash(vv, n, 26) * 16));
    return c;
  });
  /* mata de hierba alta que se mece con el viento (2 fotogramas) */
  P.tuft = (sn, v, fr) => memo('T' + sn + v + fr, () => {
    const [c, x] = mk(11, 9), p = sn === 3 ? { d: '#8fa8b8', m: '#c4d6e0', l: '#f4f8fb' } : sn === 2 ? { d: '#7a5e22', m: '#b08a30', l: '#d8b450' } : sn === 1 ? { d: '#2f6a22', m: '#4a9a34', l: '#7acb52' } : { d: '#3f8a2c', m: '#62b040', l: '#92d462' };
    const blades = [[2, 7, -1], [4, 8, 0], [6, 8, 1], [8, 7, 1], [5, 8, 0]];
    for (const [bx, by, lean] of blades) { const h = 4 + Math.floor(hash(v, bx, 61) * 3); for (let k = 0; k < h; k++) { const sx = bx + Math.round(lean * k * 0.45) + (fr ? Math.round(k * 0.35) : 0); dot(x, k === h - 1 ? p.l : (k % 2 ? p.m : p.d), sx, by - k); } }
    return { cv: c, ax: 5, ay: 8 };
  });
  P.reed = (fr) => memo('R' + fr, () => {
    const [c, x] = mk(9, 20);
    for (const [bx, h] of [[2, 14], [4, 18], [6, 12]]) { for (let k = 0; k < h; k++) dot(x, k % 3 ? '#4f8a2e' : '#3a6e22', bx + (fr && k > h * 0.6 ? 1 : 0), 19 - k); const tx = bx + (fr ? 1 : 0); rect(x, '#3b2412', tx, 19 - h - 3, 2, 4); dot(x, '#7a4e2a', tx, 19 - h - 3); }
    rect(x, '#3a6e22', 1, 19, 7, 1);
    return { cv: c, ax: 4, ay: 19 };
  });
  P.lily = (v, fr) => memo('L' + v + fr, () => {
    const [c, x] = mk(11, 8), b = P.blob(11, 6, (i, j) => ((i - 5) / 5) ** 2 + ((j - 3) / 2.6) ** 2 <= 1 && !(i >= 5 && i <= 6 && j <= 2 && fr), ['#9ae068', '#58b040', '#368a30', '#1f5428'], v + 4, [0, 0.6]); x.drawImage(b, 0, 2);
    if (v % 3 === 0) { rect(x, '#ffffff', 4, 0, 3, 2); dot(x, '#ff9fc2', 5, 0); dot(x, '#ffe052', 5, 1); }
    return { cv: c, ax: 5, ay: 5 };
  });
  P.shadowFish = (dir) => memo('S' + dir, () => {
    const [c, x] = mk(12, 5); rect(x, 'rgba(10,40,70,.5)', 2, 1, 7, 3); rect(x, 'rgba(10,40,70,.5)', 0, 0, 3, 5); rect(x, 'rgba(10,40,70,.5)', 8, 2, 3, 1);
    if (dir < 0) { const [m, g] = mk(12, 5); g.translate(12, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return { cv: m, ax: 6, ay: 2 }; }
    return { cv: c, ax: 6, ay: 2 };
  });
  P.mushroom = (v) => memo('M' + v, () => {
    const [c, x] = mk(7, 7); rect(x, '#f2ead0', 3, 4, 2, 3); rect(x, '#3b2412', 1, 1, 5, 1); rect(x, '#d03a2a', 1, 2, 5, 2); rect(x, '#e8604a', 2, 2, 2, 1); dot(x, '#ffffff', 2, 3); dot(x, '#ffffff', 4, 3);
    if (v % 2) { rect(x, '#8a6a3a', 1, 2, 5, 2); rect(x, '#b08a50', 2, 2, 2, 1); dot(x, '#ffffff', 0, 0); dot(x, '#8a6a3a', 2, 3); dot(x, '#8a6a3a', 4, 3); }
    return { cv: c, ax: 3, ay: 6 };
  });
  P.log = () => memo('log', () => {
    const [c, x] = mk(24, 12);
    shadow(x, 12, 10, 10, 2);
    rect(x, '#2b1a0c', 1, 2, 22, 8); rect(x, '#7a4e2a', 2, 3, 20, 6); rect(x, '#9a6a3c', 2, 3, 20, 2); rect(x, '#5a3a1c', 2, 8, 20, 1); for (const i of [6, 11, 16]) dot(x, '#4a2e16', i, 5);
    rect(x, '#2b1a0c', 0, 3, 3, 6); rect(x, '#c9a068', 1, 4, 1, 4); rect(x, '#e0c088', 1, 5, 1, 2);
    return { cv: c, ax: 12, ay: 10 };
  });


  P.sand = (sn, v) => memo('s' + sn + v, () => {
    const [c, x] = mk(16, 16), b = sn === 3 ? ['#e4ecef', '#cddae0', '#f6fafb'] : ['#e8d9a2', '#d4c184', '#f4eac0']; rect(x, b[0], 0, 0, 16, 16);
    for (let n = 0; n < 9; n++) dot(x, hash(v, n, 5) > 0.5 ? b[1] : b[2], Math.floor(hash(v, n, 6) * 16), Math.floor(hash(v, n, 7) * 16));
    return c;
  });
  P.path = (sn, v) => memo('p' + sn + v, () => {
    const [c, x] = mk(16, 16), b = sn === 3 ? ['#d8d2c4', '#bfb8a8', '#ece8de'] : ['#d3b883', '#b9996a', '#e6d0a0']; rect(x, b[0], 0, 0, 16, 16);
    for (let n = 0; n < 8; n++) { const i = Math.floor(hash(v, n, 8) * 15), j = Math.floor(hash(v, n, 9) * 15); dot(x, b[1], i, j); if (hash(v, n, 10) > 0.5) dot(x, b[1], i + 1, j); }
    for (let n = 0; n < 5; n++) dot(x, b[2], Math.floor(hash(v, n, 13) * 16), Math.floor(hash(v, n, 14) * 16));
    return c;
  });
  P.plaza = (sn, v) => memo('z' + sn + v, () => {
    const [c, x] = mk(16, 16), b = sn === 3 ? ['#d2d6dc', '#aab2bc', '#e8ecf0'] : ['#b9b2a6', '#8f887c', '#d2ccc0']; rect(x, b[1], 0, 0, 16, 16);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const ox = i * 8 + (j % 2) * 0, oy = j * 8; rect(x, b[0], ox + 1, oy + 1, 6, 6); rect(x, b[2], ox + 1, oy + 1, 6, 1); dot(x, b[2], ox + 1, oy + 2); dot(x, b[1], ox + 6, oy + 6); }
    if (v % 2) { dot(x, b[1], 3, 3); dot(x, b[2], 11, 12); }
    return c;
  });
  P.bridge = (v) => memo('b' + v, () => {
    const [c, x] = mk(16, 16); rect(x, '#a27a4a', 0, 0, 16, 16);
    for (let k = 0; k < 4; k++) { rect(x, k % 2 ? '#b88a55' : '#c39662', 0, k * 4, 16, 3); rect(x, '#6e4a28', 0, k * 4 + 3, 16, 1); dot(x, '#6e4a28', 2 + (k * 5) % 11, k * 4 + 1); dot(x, '#6e4a28', 13 - (k * 3) % 9, k * 4 + 1); }
    rect(x, '#5e3f20', 0, 0, 1, 16); rect(x, '#5e3f20', 15, 0, 1, 16);
    return c;
  });
  /* agua animada: 4 fotogramas; shade 0..2 según profundidad; kind 1 = río, 2 = lago */
  P.water = (frame, shade, kind, winter) => memo(`w${frame}${shade}${kind}${winter ? 1 : 0}`, () => {
    const [c, x] = mk(16, 16);
    const base = winter ? [['#a8d4ea', '#bfe0f0'], ['#93c4de', '#aed6ea'], ['#80b4d2', '#9ccae0']][shade] : kind === 1 ? [['#4aa8dc', '#6cc0ec'], ['#3d94cc', '#5ab0e0'], ['#3380bc', '#4a9ad0']][shade] : [['#3a92d0', '#58aae2'], ['#2f80c0', '#4a98d4'], ['#2870ac', '#3c86c2']][shade];
    rect(x, base[0], 0, 0, 16, 16);
    const hl = winter ? '#ffffff' : base[1];
    for (let n = 0; n < 5; n++) { const i = (Math.floor(hash(n, shade, 31) * 14) + (kind === 1 ? 0 : frame)) % 14, j = Math.floor(hash(n, shade, 32) * 15); const jj = (j + (kind === 1 ? frame * 2 : 0)) % 16; rect(x, hl, i, jj, 3, 1); }
    if (frame % 2 === 0) { dot(x, '#ffffff', Math.floor(hash(frame, shade, 40) * 15), Math.floor(hash(frame, kind, 41) * 15)); }
    return c;
  });

  /* ---------------- Árboles y vegetación ---------------- */
  const CANOPY = [
    { oak: ['#a8de6c', '#7cc04c', '#559a3a', '#2c5e2c'], alt: ['#ffd9e8', '#f5a8c6', '#d97ca4', '#7e3a5c'] },
    { oak: ['#8ed25c', '#5fae3f', '#3f8a34', '#1f5428'], alt: ['#8ed25c', '#5fae3f', '#3f8a34', '#1f5428'] },
    { oak: ['#ffd36a', '#f09a2c', '#c9601f', '#6e2c12'], alt: ['#ff9d70', '#e2552b', '#a8321a', '#5a1a10'] },
    { oak: ['#f4f8fb', '#cfe0e9', '#9fbccb', '#587588'], alt: ['#f4f8fb', '#cfe0e9', '#9fbccb', '#587588'] },
  ];
  const line = (x, col, x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) dot(x, col, Math.round(x0 + (x1 - x0) * i / Math.max(1, n)), Math.round(y0 + (y1 - y0) * i / Math.max(1, n))); };
  const shadow = (x, cx, cy, rx, ry) => { x.fillStyle = 'rgba(0,18,30,.26)'; for (let j = -ry; j <= ry; j++) { const w = Math.round(rx * Math.sqrt(1 - (j * j) / (ry * ry + .01))); x.fillRect(cx - w, cy + j, w * 2 + 1, 1); } };
  P.tree = (kind, sn, v) => memo('t' + kind + sn + v, () => {
    const W = 32, H = 42, [c, x] = mk(W, H), cx = 16, spr = { cv: c, ax: cx, ay: H - 3 };
    shadow(x, cx + 1, H - 3, 11, 3);
    if (kind === 1) { // pino
      rect(x, '#3b2412', cx - 2, H - 9, 4, 7); rect(x, '#6e4a28', cx - 1, H - 9, 2, 6);
      const pal = sn === 3 ? ['#eef5f8', '#c6dbe3', '#86b2a2', '#2d5a46'] : sn === 2 ? ['#58b56a', '#3a9150', '#27703c', '#143c22'] : ['#4cba68', '#33944f', '#237140', '#103c24'];
      const tiers = [[0, 14, 6], [8, 24, 9], [16, 34, 12]];
      const tri = (i, j) => { for (const [y0, y1, hw] of tiers) { if (j >= y0 && j <= y1) { const w = (j - y0) / (y1 - y0) * hw + 0.5; if (Math.abs(i - cx) <= w) return true; } } return false; };
      const b = P.blob(W, H, (i, j) => j < 36 && tri(i, j), pal, v + 3, [0.2, 1.1]); x.drawImage(b, 0, 0);
      if (sn === 3) for (let n = 0; n < 8; n++) dot(x, '#ffffff', 8 + Math.floor(hash(v, n, 50) * 16), 6 + Math.floor(hash(v, n, 51) * 24));
      return spr;
    }
    // tronco
    rect(x, '#3b2412', cx - 3, H - 14, 6, 12); rect(x, '#7a4e2a', cx - 2, H - 14, 4, 12); rect(x, '#9a6a3c', cx - 2, H - 14, 1, 12); rect(x, '#5a3a1c', cx + 1, H - 14, 1, 12);
    if (sn === 3) { // árbol desnudo con nieve
      for (const [dx, dy] of [[-10, -18], [-6, -26], [0, -30], [7, -26], [11, -18], [-3, -22], [4, -20]]) line(x, '#3b2412', cx, H - 14, cx + dx, H - 14 + dy);
      for (const [dx, dy] of [[-10, -18], [-6, -26], [0, -30], [7, -26], [11, -18]]) { dot(x, '#ffffff', cx + dx, H - 14 + dy - 1); dot(x, '#dfeef6', cx + dx + 1, H - 14 + dy - 1); }
      rect(x, '#ffffff', cx - 3, H - 15, 6, 1);
      return spr;
    }
    const circ = v === 1 ? [[16, 14, 11], [9, 19, 7], [23, 19, 8], [16, 8, 7]] : v === 2 ? [[16, 15, 12], [8, 18, 7], [24, 17, 7], [14, 7, 6], [21, 9, 6]] : [[16, 14, 10], [10, 18, 8], [22, 19, 8], [17, 8, 7]];
    const pal = (v === 2 ? CANOPY[sn].alt : CANOPY[sn].oak);
    const b = P.blob(W, 30, (i, j) => circ.some(([ci, cj, r]) => (i - ci) * (i - ci) + (j - cj) * (j - cj) <= r * r), pal, v + 7); x.drawImage(b, 0, 2);
    if (sn === 0 && v !== 2) for (let n = 0; n < 5; n++) dot(x, '#ffd9e8', 8 + Math.floor(hash(v, n, 60) * 16), 6 + Math.floor(hash(v, n, 61) * 14));
    if (sn === 2) for (let n = 0; n < 4; n++) dot(x, '#ffe9a0', 8 + Math.floor(hash(v, n, 62) * 16), 6 + Math.floor(hash(v, n, 63) * 14));
    return spr;
  });
  P.rock = (sn, v) => memo('r' + sn + v, () => {
    const W = 18, H = 14, [c, x] = mk(W, H), cx = 9, rx = v ? 7 : 8, ry = v ? 5 : 4;
    shadow(x, cx + 1, 12, 7, 2);
    const b = P.blob(W, 11, (i, j) => ((i - cx) / rx) ** 2 + ((j - 6) / ry) ** 2 <= 1, ['#d4d7dc', '#a6aab2', '#7c808a', '#3a3e46'], v + 2); x.drawImage(b, 0, 1);
    if (sn === 3) { rect(x, '#ffffff', cx - 5, 2, 10, 2); rect(x, '#dfeef6', cx - 3, 4, 6, 1); }
    return { cv: c, ax: cx, ay: 12 };
  });
  P.bush = (sn, v) => memo('u' + sn + v, () => {
    const W = 20, H = 14, [c, x] = mk(W, H);
    shadow(x, 11, 12, 8, 2);
    const pal = sn === 3 ? ['#f4f8fb', '#cfe0e9', '#9fbccb', '#587588'] : sn === 2 ? ['#d8a23a', '#b9771f', '#8e4e18', '#4c2810'] : ['#76cc54', '#4fa83c', '#34832e', '#1b4f22'];
    const b = P.blob(W, 12, (i, j) => ((i - 10) / 9) ** 2 + ((j - 7) / 5.2) ** 2 <= 1 || ((i - 6) / 5) ** 2 + ((j - 5) / 4) ** 2 <= 1, pal, v + 9); x.drawImage(b, 0, 0);
    if (sn < 2) for (let n = 0; n < 4; n++) dot(x, sn === 0 ? '#ff6f91' : '#ffd23a', 4 + Math.floor(hash(v, n, 70) * 12), 3 + Math.floor(hash(v, n, 71) * 6));
    return { cv: c, ax: 10, ay: 12 };
  });
  P.flower = (sn, v) => memo('f' + sn + v, () => {
    const [c, x] = mk(9, 9), cols = sn === 2 ? ['#e8742a', '#d9a03a', '#c0392b'] : ['#ffffff', '#ff7aa8', '#ffe052', '#8aa8ff', '#d98aff'], col = cols[v % cols.length];
    for (const [ox, oy] of [[1, 3], [5, 1], [4, 5]]) { dot(x, '#3a7a2e', ox + 1, oy + 2); dot(x, '#3a7a2e', ox + 1, oy + 3); dot(x, col, ox, oy + 1); dot(x, col, ox + 2, oy + 1); dot(x, col, ox + 1, oy); dot(x, col, ox + 1, oy + 2 - 1 + 1 - 1); dot(x, '#ffe27a', ox + 1, oy + 1); }
    return c;
  });
  P.lamp = () => memo('lamp', () => {
    const [c, x] = mk(10, 26);
    shadow(x, 5, 24, 4, 1);
    rect(x, '#2b2e36', 4, 8, 2, 16); rect(x, '#3d414c', 3, 22, 4, 2); rect(x, '#2b2e36', 2, 4, 6, 4); rect(x, '#ffe9a8', 3, 5, 4, 2); rect(x, '#2b2e36', 3, 2, 4, 2); dot(x, '#2b2e36', 4, 1); dot(x, '#2b2e36', 5, 1);
    return { cv: c, ax: 5, ay: 24 };
  });
  P.barrel = () => memo('barrel', () => {
    const [c, x] = mk(12, 14);
    shadow(x, 6, 12, 5, 1);
    rect(x, '#3b2412', 1, 2, 10, 10); rect(x, '#9a6a3c', 2, 2, 8, 10); rect(x, '#b68450', 2, 2, 2, 10); rect(x, '#5a3a1c', 2, 4, 8, 1); rect(x, '#5a3a1c', 2, 9, 8, 1); rect(x, '#3b2412', 2, 1, 8, 2); rect(x, '#c89a62', 3, 1, 6, 1);
    return { cv: c, ax: 6, ay: 12 };
  });
  P.crate = () => memo('crate', () => {
    const [c, x] = mk(14, 13);
    shadow(x, 7, 11, 6, 1);
    rect(x, '#3b2412', 1, 2, 12, 10); rect(x, '#b88a55', 2, 3, 10, 8); rect(x, '#8a6234', 2, 6, 10, 1); rect(x, '#8a6234', 6, 3, 1, 8); dot(x, '#5a3a1c', 3, 4); dot(x, '#5a3a1c', 10, 9);
    return { cv: c, ax: 7, ay: 11 };
  });
  P.bench = () => memo('bench', () => {
    const [c, x] = mk(22, 12);
    shadow(x, 11, 10, 10, 1);
    rect(x, '#3b2412', 1, 2, 20, 4); rect(x, '#a8773f', 2, 2, 18, 3); rect(x, '#3b2412', 1, 6, 20, 3); rect(x, '#c39662', 2, 6, 18, 2); rect(x, '#3b2412', 2, 9, 2, 2); rect(x, '#3b2412', 18, 9, 2, 2);
    return { cv: c, ax: 11, ay: 10 };
  });
  P.well = () => memo('well', () => {
    const [c, x] = mk(26, 30);
    shadow(x, 13, 27, 11, 2);
    rect(x, '#3b2412', 4, 12, 18, 14); rect(x, '#9c9488', 5, 13, 16, 12);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { rect(x, (i + j) % 2 ? '#b8b0a2' : '#8a8478', 5 + i * 4, 13 + j * 4, 4, 4); }
    rect(x, '#2a5aa0', 7, 11, 12, 3); rect(x, '#3b2412', 4, 4, 2, 10); rect(x, '#3b2412', 20, 4, 2, 10); rect(x, '#8a5a34', 5, 4, 1, 8); rect(x, '#8a5a34', 21, 4, 1, 8);
    for (let k = 0; k < 8; k++) { rect(x, '#3b2412', 3 + k, 3 - Math.floor(k / 4) * 0 - (k < 4 ? k : 7 - k) * 0, 1, 1); }
    rect(x, '#b83a2e', 2, 1, 22, 3); rect(x, '#d85a42', 3, 1, 20, 1); rect(x, '#8a2218', 2, 4, 22, 1);
    rect(x, '#c9a24a', 12, 5, 2, 7);
    return { cv: c, ax: 13, ay: 27 };
  });

  /* ---------------- Edificios ---------------- */
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const tone = (h, f) => { const [r, g, b] = hex(h); const m = (v) => Math.max(0, Math.min(255, Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)))); return '#' + [m(r), m(g), m(b)].map(v => v.toString(16).padStart(2, '0')).join(''); };
  P.tone = tone;
  P.building = (b, night, winter) => memo('B' + b.kind + (night ? 1 : 0) + (winter ? 1 : 0), () => {
    const W = Math.round(b.w / K), H = Math.round(b.h / K), [c, x] = mk(W, H + 6);
    const wall = b.wall, roof = b.roof, ol = '#2a1a12';
    shadow(x, Math.round(W / 2) + 3, H + 2, Math.round(W / 2) - 2, 3);
    const roofH = 24, wy = roofH - 2;
    // pared con tablones
    rect(x, ol, 0, wy, W, H - wy); rect(x, wall, 1, wy, W - 2, H - wy - 1);
    for (let j = wy + 2; j < H - 2; j += 4) rect(x, tone(wall, -0.1), 1, j, W - 2, 1);
    for (let j = wy + 2; j < H - 2; j += 4) for (let i = 3 + ((j / 4) % 2) * 5; i < W - 2; i += 11) dot(x, tone(wall, -0.16), i, j + 1);
    rect(x, tone(wall, 0.25), 1, wy, W - 2, 1); rect(x, tone(wall, -0.22), 1, H - 3, W - 2, 2);
    // zócalo de piedra
    rect(x, '#8c867a', 1, H - 5, W - 2, 3); for (let i = 2; i < W - 2; i += 5) rect(x, '#a8a296', i, H - 5, 3, 2);
    // tejado: trapecio con tejas
    for (let j = 0; j < roofH; j++) {
      const inset = Math.round((roofH - 1 - j) * 0.32), x0 = inset - 3 < 0 ? 0 : inset - 3;
      const shingle = j % 4 === 3, col = shingle ? tone(roof, -0.28) : (Math.floor(j / 4) % 2 ? tone(roof, -0.06) : roof);
      rect(x, ol, x0, j, W - x0 * 2, 1); rect(x, col, x0 + 1, j, W - x0 * 2 - 2, 1);
      if (!shingle) for (let i = x0 + 2 + (Math.floor(j / 4) % 2) * 3; i < W - x0 - 2; i += 6) dot(x, tone(roof, -0.28), i, j);
    }
    rect(x, ol, 0, roofH - 1, W, 1); rect(x, tone(roof, -0.4), 1, roofH, W - 2, 2); rect(x, tone(roof, 0.3), 5, 0, W - 10, 1);
    if (winter) { rect(x, '#ffffff', 4, 0, W - 8, 2); for (let j = 2; j < roofH - 2; j += 4) for (let i = 4 + (j % 8); i < W - 6; i += 9) rect(x, '#e8f3f9', i, j, 4, 1); rect(x, '#cfe0e9', 3, roofH - 1, W - 6, 1); }
    // chimenea
    rect(x, ol, W - 16, 0, 7, 9); rect(x, '#a2523a', W - 15, 1, 5, 8); rect(x, '#c4684a', W - 15, 1, 5, 2); rect(x, '#6e3626', W - 15, 4, 5, 1);
    if (winter) rect(x, '#ffffff', W - 16, 0, 7, 1);
    // toldo a rayas
    const ay = roofH + 3, awn = b.awn || '#c2477e';
    rect(x, ol, 4, ay, W - 8, 8); for (let i = 5; i < W - 5; i += 5) rect(x, ((i - 5) / 5) % 2 ? '#f6f1e4' : awn, i, ay + 1, 5, 6);
    for (let i = 5; i < W - 5; i += 5) { rect(x, ((i - 5) / 5) % 2 ? '#f6f1e4' : awn, i + 1, ay + 7, 3, 2); dot(x, ol, i + 2, ay + 9); }
    rect(x, 'rgba(255,255,255,.25)', 5, ay + 1, W - 10, 1);
    // cartel colgante
    const label = b.label.split(' · ')[0], tw = P.textW(label) + 6, sx = Math.round((W - tw) / 2), sy = ay + 11;
    rect(x, ol, sx, sy, tw, 9); rect(x, '#6e4a28', sx + 1, sy + 1, tw - 2, 7); rect(x, '#8a6234', sx + 1, sy + 1, tw - 2, 1); P.text(x, label, sx + 3, sy + 2, '#fff2c8');
    dot(x, ol, sx + 2, sy - 1); dot(x, ol, sx + tw - 3, sy - 1);
    // ventanas
    const winY = wy + 29, winW = 13, winH = 13;
    for (const wx of [8, W - 8 - winW]) {
      rect(x, ol, wx, winY, winW, winH); rect(x, '#e8d8b8', wx + 1, winY + 1, winW - 2, winH - 2);
      rect(x, night ? '#ffd877' : '#9fd6ea', wx + 2, winY + 2, winW - 4, winH - 4); if (!night) { rect(x, '#c9ecf6', wx + 2, winY + 2, 3, 1); dot(x, '#ffffff', wx + 3, winY + 3); }
      rect(x, '#e8d8b8', wx + Math.floor(winW / 2), winY + 1, 1, winH - 2); rect(x, '#e8d8b8', wx + 1, winY + 7, winW - 2, 1);
      rect(x, ol, wx - 1, winY + winH, winW + 2, 4); rect(x, '#8a5a34', wx, winY + winH + 1, winW, 2);
      for (let i = 0; i < winW; i += 3) dot(x, ['#ff6f91', '#ffe052', '#ffffff', '#c27bff'][(i / 3 + wx) % 4 | 0], wx + i, winY + winH);
      rect(x, '#2f7a3a', wx + 1, winY + winH + 1, winW - 2, 1);
    }
    // puerta
    const dw = 14, dh = 22, dx = Math.round((W - dw) / 2), dy = H - dh - 3;
    rect(x, ol, dx - 1, dy - 1, dw + 2, dh + 1); rect(x, '#6e4a28', dx, dy, dw, dh); rect(x, '#8a6234', dx + 1, dy + 1, dw - 2, dh - 2);
    for (let j = dy + 3; j < dy + dh - 2; j += 5) rect(x, '#6e4a28', dx + 1, j, dw - 2, 1);
    rect(x, '#6e4a28', dx + Math.floor(dw / 2), dy + 1, 1, dh - 2); rect(x, '#ffd36a', dx + dw - 4, dy + 11, 2, 2);
    rect(x, '#9c9488', dx - 2, H - 3, dw + 4, 2); rect(x, '#b8b0a2', dx - 1, H - 3, dw + 2, 1);
    return { cv: c, ax: 0, ay: 0 };
  });

  /* ---------------- Personas ---------------- */
  const OL = '#2b1a12';
  const outline = (src) => {
    const w = src.width, h = src.height, [c, x] = mk(w + 2, h + 2), sd = src.getContext('2d').getImageData(0, 0, w, h).data;
    const A = (i, j) => (i < 0 || j < 0 || i >= w || j >= h ? 0 : sd[(j * w + i) * 4 + 3] > 10);
    x.fillStyle = OL;
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) if (!A(i, j) && (A(i - 1, j) || A(i + 1, j) || A(i, j - 1) || A(i, j + 1))) x.fillRect(i + 1, j + 1, 1, 1);
    x.drawImage(src, 1, 1);
    return c;
  };
  const sh = (hexc, f) => tone(hexc, f);
  function personDraw(L, dir, f) {
    const [c, x] = mk(16, 26), skin = L.skin, skinD = sh(skin, -0.14), hair = L.hair, hairL = sh(hair, 0.22);
    const shirt = L.shirt.color || '#f2f2f2', shirt2 = L.shirt.color2 || null, style = L.shirt.style || 'plain', pants = L.pants.color, short = !!L.pants.short;
    const shoe = L.shoes.color, st = L.shoes.type || 'shoe', step = f === 1 ? 1 : f === 3 ? -1 : 0, up = f % 2 ? 1 : 0;
    const side = dir >= 2;
    const torso = (x0, w) => {
      rect(x, shirt, x0, 10 - up, w, 7);
      if (style === 'stripes') for (let j = 11 - up; j < 17 - up; j += 2) rect(x, shirt2 || '#27508f', x0, j, w, 1);
      else if (style === 'hawaii') for (const [i, j] of [[1, 12], [4, 11], [2, 15], [5, 14]]) if (i < w) dot(x, shirt2 || '#ffd54a', x0 + i, j - up);
      rect(x, sh(shirt, -0.18), x0, 16 - up, w, 1);
    };
    // piernas (antes que el torso)
    const legs = (lx, rx, lw) => {
      const ll = 5 - (step > 0 ? 1 : 0), rl = 5 - (step < 0 ? 1 : 0);
      rect(x, pants, lx, 17, lw, ll); rect(x, pants, rx, 17, lw, rl);
      if (short) { rect(x, skin, lx, 19, lw, ll - 2); rect(x, skin, rx, 19, lw, rl - 2); }
      const sy = (n) => (st === 'boot' ? 19 : 21), ll2 = 17 + ll, rl2 = 17 + rl;
      rect(x, shoe, lx - 1, st === 'boot' ? 19 : ll2 - 1, lw + 1, st === 'boot' ? ll2 - 19 + 1 : 2); rect(x, shoe, rx, st === 'boot' ? 19 : rl2 - 1, lw + 1, st === 'boot' ? rl2 - 19 + 1 : 2);
      if (st === 'flip') { rect(x, skin, lx - 1, ll2 - 1, lw + 1, 2); rect(x, skin, rx, rl2 - 1, lw + 1, 2); rect(x, shoe, lx - 1, ll2, lw + 1, 1); rect(x, shoe, rx, rl2, lw + 1, 1); }
      void sy;
    };
    if (!side) {
      legs(5, 8, 3);
      torso(4, 8);
      // brazos
      const al = step > 0 ? 1 : 0, ar = step < 0 ? 1 : 0;
      rect(x, shirt, 2, 11 - up + al, 2, 4); rect(x, skin, 2, 15 - up + al, 2, 2); rect(x, shirt, 12, 11 - up + ar, 2, 4); rect(x, skin, 12, 15 - up + ar, 2, 2);
      rect(x, sh(shirt, -0.12), 2, 11 - up + al, 1, 4); rect(x, sh(shirt, -0.12), 12, 11 - up + ar, 1, 4);
      // cabeza
      const hy = 2 - up;
      rect(x, skin, 4, hy + 2, 8, 7); rect(x, skinD, 4, hy + 8, 8, 1); rect(x, skin, 3, hy + 5, 1, 2); rect(x, skin, 12, hy + 5, 1, 2); rect(x, skin, 7, hy + 9, 2, 1);
      if (dir === 0) {
        rect(x, hair, 3, hy, 10, 3); rect(x, hair, 3, hy + 3, 2, 2); rect(x, hair, 11, hy + 3, 2, 2); rect(x, hairL, 5, hy, 4, 1); rect(x, hair, 5, hy + 3, 3, 1); rect(x, hair, 9, hy + 3, 2, 1);
        dot(x, '#1c1410', 5, hy + 5); dot(x, '#1c1410', 10, hy + 5); dot(x, '#ffffff', 5, hy + 5 + 0 === 0 ? hy + 5 : hy + 5);
        dot(x, '#1c1410', 5, hy + 5); dot(x, '#1c1410', 10, hy + 5); dot(x, sh(skin, -0.25), 7, hy + 7); dot(x, '#c0584a', 8, hy + 8);
      } else {
        rect(x, hair, 3, hy, 10, 9); rect(x, hairL, 5, hy + 1, 4, 1); rect(x, sh(hair, -0.15), 3, hy + 7, 10, 2);
      }
    } else {
      legs(5 + (step > 0 ? -1 : 0), 8 + (step < 0 ? 1 : 0), 3);
      torso(5, 6);
      const sw = step === 0 ? 0 : step > 0 ? -1 : 1;
      rect(x, sh(shirt, -0.12), 7 + sw, 11 - up, 2, 4); rect(x, skin, 7 + sw, 15 - up, 2, 2);
      const hy = 2 - up;
      rect(x, skin, 4, hy + 2, 8, 7); rect(x, skinD, 4, hy + 8, 8, 1); rect(x, skin, 7, hy + 9, 2, 1);
      rect(x, hair, 4, hy, 9, 3); rect(x, hair, 8, hy + 3, 5, 5); rect(x, hairL, 5, hy, 4, 1); rect(x, hair, 4, hy + 3, 2, 1);
      dot(x, '#1c1410', 5, hy + 5); dot(x, skinD, 3, hy + 6); dot(x, skin, 3, hy + 5); dot(x, sh(skin, -0.2), 9, hy + 6);
    }
    // sombrero
    const hat = L.hat || {}, hc = hat.color || '#2f6fa8', hy = 2 - up;
    if (hat.type === 'cap') { rect(x, hc, 3, hy - 1, 10, 4); rect(x, sh(hc, -0.2), 3, hy + 2, 10, 1); if (dir === 0) rect(x, sh(hc, -0.25), 4, hy + 3, 8, 1); else if (dir === 2) rect(x, sh(hc, -0.25), 1, hy + 3, 5, 1); else if (dir === 3) rect(x, sh(hc, -0.25), 10, hy + 3, 5, 1); }
    else if (hat.type === 'straw') { rect(x, hc, 0, hy + 1, 16, 2); rect(x, sh(hc, -0.2), 0, hy + 3, 16, 1); rect(x, hc, 3, hy - 2, 10, 4); rect(x, hat.band || '#c0392b', 3, hy + 1, 10, 1); }
    else if (hat.type === 'bucket') { rect(x, hc, 3, hy - 1, 10, 4); rect(x, sh(hc, -0.2), 1, hy + 3, 14, 1); rect(x, hc, 2, hy + 2, 12, 1); }
    else if (hat.type === 'bandana') { rect(x, hc, 3, hy + 1, 10, 2); if (dir !== 0) { rect(x, hc, 12, hy + 2, 2, 3); } }
    else if (hat.type === 'captain') { rect(x, '#f4f4f4', 3, hy - 2, 10, 4); rect(x, '#1c2840', 3, hy + 2, 10, 1); rect(x, '#1c2840', 4, hy + 3, 8, 1); dot(x, '#ffd23a', 7, hy - 1); dot(x, '#ffd23a', 8, hy - 1); }
    const o = outline(c);
    if (dir === 3) { const [m, g] = mk(o.width, o.height); g.translate(o.width, 0); g.scale(-1, 1); g.drawImage(o, 0, 0); return m; }
    return o;
  }
  P.person = (L, dir, f) => {
    const k = 'P' + dir + f + L.skin + L.hair + L.shirt.id + L.pants.id + L.shoes.id + (L.hat ? L.hat.id : '');
    return memo(k, () => ({ cv: personDraw(L, dir, f), ax: 9, ay: 25 }));
  };
  P.dirOf = (ang) => { const dx = Math.cos(ang), dy = Math.sin(ang); return Math.abs(dx) > Math.abs(dy) * 1.05 ? (dx < 0 ? 2 : 3) : (dy > 0 ? 0 : 1); };
  P.frameOf = (walk, moving) => (moving ? [1, 0, 3, 0][Math.floor(walk / 2.4) % 4] : 0);

  /* ---------------- Fauna ---------------- */
  P.duck = (dir) => memo('d' + dir, () => {
    const [c, x] = mk(12, 10);
    rect(x, OL, 2, 3, 8, 5); rect(x, '#f6f1e4', 3, 4, 6, 3); rect(x, '#d9d2c0', 3, 6, 6, 1);
    rect(x, OL, 8, 1, 4, 4); rect(x, '#2d7a3a', 9, 1, 2, 3); dot(x, '#ffffff', 10, 2); rect(x, '#f0a020', 11, 3, 1, 1); rect(x, OL, 11, 3, 2, 1); rect(x, '#f0a020', 11, 3, 1, 1);
    dot(x, OL, 3, 3); dot(x, OL, 2, 5);
    if (dir < 0) { const [m, g] = mk(12, 10); g.translate(12, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return { cv: m, ax: 6, ay: 8 }; }
    return { cv: c, ax: 6, ay: 8 };
  });
  P.butterfly = (f, col) => memo('y' + f + col, () => {
    const [c, x] = mk(7, 5); dot(x, '#2b1a12', 3, 2);
    if (f === 0) { rect(x, col, 0, 0, 3, 2); rect(x, col, 4, 0, 3, 2); rect(x, sh(col, -0.2), 1, 2, 2, 2); rect(x, sh(col, -0.2), 4, 2, 2, 2); } else { rect(x, col, 2, 1, 1, 2); rect(x, col, 4, 1, 1, 2); }
    return { cv: c, ax: 3, ay: 2 };
  });
  P.fishJump = () => memo('fj', () => { const [c, x] = mk(8, 4); rect(x, '#2b1a12', 0, 1, 7, 2); rect(x, '#9fb4c8', 1, 1, 5, 2); rect(x, '#ffffff', 2, 1, 3, 1); dot(x, '#2b1a12', 7, 0); dot(x, '#2b1a12', 7, 3); return { cv: c, ax: 4, ay: 2 }; });
  P.chest = (open) => memo('c' + open, () => {
    const [c, x] = mk(16, 16);
    shadow(x, 8, 14, 7, 2);
    rect(x, OL, 1, open ? 5 : 4, 14, 10); rect(x, '#8a5a2a', 2, open ? 8 : 6, 12, 7); rect(x, '#b27a3c', 2, open ? 8 : 6, 12, 2);
    rect(x, '#ffd36a', 2, open ? 11 : 9, 12, 1); rect(x, '#ffd36a', 7, open ? 10 : 8, 2, 3); rect(x, '#c9a24a', 7, open ? 12 : 10, 2, 1);
    if (open) { rect(x, OL, 1, 1, 14, 5); rect(x, '#a06a32', 2, 2, 12, 3); rect(x, '#ffe27a', 4, 6, 8, 2); dot(x, '#ffffff', 6, 6); dot(x, '#ffffff', 10, 7); }
    else { rect(x, '#b27a3c', 2, 4, 12, 2); rect(x, '#8a5a2a', 2, 5, 12, 1); }
    return { cv: c, ax: 8, ay: 14 };
  });
  /* ---------------- Iconos del HUD (14x14, se amplían con CSS sin suavizar) ---------------- */
  const icons = {}, iconCv = {};
  const IC = {
    coin(x) { const b = P.blob(14, 14, (i, j) => (i - 6.5) ** 2 + (j - 6.5) ** 2 <= 36, ['#fff6b0', '#ffd23a', '#e0a020', '#6a4210'], 3); x.drawImage(b, 0, 0); rect(x, '#b9781a', 6, 3, 2, 8); rect(x, '#fff6b0', 5, 3, 1, 3); },
    gem(x) { const b = P.blob(14, 14, (i, j) => j >= 2 && j <= 12 && Math.abs(i - 6.5) <= (j < 5 ? 3 + (j - 2) * 1.2 : 6.6 - (j - 5) * 0.85), ['#e6d6ff', '#a47af4', '#6a3fc8', '#2d1a66'], 5); x.drawImage(b, 0, 0); rect(x, '#e6d6ff', 4, 4, 2, 2); rect(x, '#5a30b0', 6, 7, 3, 3); },
    sun(x) { const b = P.blob(14, 14, (i, j) => (i - 6.5) ** 2 + (j - 6.5) ** 2 <= 13, ['#fff6b0', '#ffd23a', '#f0a020', '#8a4a10'], 7); x.drawImage(b, 0, 0); for (const [i, j] of [[6, 0], [7, 0], [6, 13], [7, 13], [0, 6], [0, 7], [13, 6], [13, 7], [2, 2], [11, 2], [2, 11], [11, 11]]) dot(x, '#f0a020', i, j); },
    sunset(x) { const b = P.blob(14, 14, (i, j) => (i - 6.5) ** 2 + (j - 8) ** 2 <= 16 && j < 11, ['#ffd0a0', '#ff8a4a', '#d8502a', '#6a2210'], 8); x.drawImage(b, 0, 0); rect(x, '#6a2210', 0, 11, 14, 1); rect(x, '#ff8a4a', 1, 12, 12, 1); rect(x, '#d8502a', 3, 13, 8, 1); },
    moon(x) { const b = P.blob(14, 14, (i, j) => (i - 6.5) ** 2 + (j - 6.5) ** 2 <= 30 && (i - 9.5) ** 2 + (j - 4.5) ** 2 > 22, ['#f4f8ff', '#cdd8f0', '#98a8d0', '#2a3560'], 9); x.drawImage(b, 0, 0); dot(x, '#fff', 11, 2); dot(x, '#fff', 12, 9); },
    worm(x) { const pts = [[2, 9], [3, 8], [4, 9], [5, 10], [6, 9], [7, 8], [8, 7], [9, 8], [10, 9], [11, 8]]; for (const [i, j] of pts) { rect(x, '#5a2a20', i - 1, j - 1, 3, 3); } for (const [i, j] of pts) dot(x, j % 2 ? '#f0a09a' : '#d97a76', i, j); dot(x, '#2a1410', 11, 7); },
    sardine(x) { rect(x, '#2a3a50', 2, 4, 9, 6); rect(x, '#9fb4c8', 3, 5, 7, 4); rect(x, '#dfe9f2', 3, 5, 7, 1); rect(x, '#2a3a50', 10, 3, 3, 8); rect(x, '#9fb4c8', 11, 4, 1, 6); dot(x, '#101820', 4, 6); },
    crab(x) { rect(x, '#5a1e14', 3, 5, 8, 6); rect(x, '#e0583a', 4, 6, 6, 4); rect(x, '#5a1e14', 1, 3, 3, 3); rect(x, '#e0583a', 2, 3, 1, 2); rect(x, '#5a1e14', 10, 3, 3, 3); rect(x, '#e0583a', 11, 3, 1, 2); dot(x, '#fff', 5, 4); dot(x, '#fff', 8, 4); for (const i of [3, 5, 8, 10]) dot(x, '#5a1e14', i, 11); },
    cooler(x) { rect(x, '#1a3a68', 1, 4, 12, 9); rect(x, '#3a7ad0', 2, 6, 10, 6); rect(x, '#e8eef4', 1, 3, 12, 3); rect(x, '#9fb4c8', 1, 5, 12, 1); rect(x, '#1a3a68', 5, 1, 4, 3); rect(x, '#c8d4de', 6, 2, 2, 1); rect(x, '#8cc0f0', 3, 7, 2, 1); },
    scroll(x) { rect(x, '#5a3a18', 2, 2, 10, 10); rect(x, '#f2e2b0', 3, 3, 8, 8); rect(x, '#d9c288', 3, 10, 8, 1); rect(x, '#5a3a18', 1, 1, 12, 2); rect(x, '#5a3a18', 1, 11, 12, 2); rect(x, '#b9781a', 2, 2, 10, 1); for (const j of [5, 7, 9]) rect(x, '#8a6a3a', 4, j, 6, 1); },
    map(x) { rect(x, '#5a3a18', 1, 2, 12, 10); rect(x, '#f2e2b0', 2, 3, 10, 8); rect(x, '#8fc86a', 2, 3, 4, 8); rect(x, '#6cb0e0', 6, 3, 3, 4); rect(x, '#c9b070', 9, 3, 3, 8); rect(x, '#5a3a18', 5, 2, 1, 10); rect(x, '#5a3a18', 8, 2, 1, 10); dot(x, '#d03a2a', 3, 8); dot(x, '#d03a2a', 4, 7); dot(x, '#d03a2a', 4, 9); dot(x, '#d03a2a', 2, 7); dot(x, '#d03a2a', 2, 9); },
    gear(x) { const c = (i, j) => { const d = (i - 6.5) ** 2 + (j - 6.5) ** 2; return d <= 30 && d >= 6; }; const b = P.blob(14, 14, (i, j) => { const d = (i - 6.5) ** 2 + (j - 6.5) ** 2; const a = Math.atan2(j - 6.5, i - 6.5), tooth = Math.cos(a * 8) > 0.05 ? 49 : 31; return d <= tooth && d >= 7; }, ['#e4e8ee', '#aab4c2', '#7a8494', '#2a303c'], 4); x.drawImage(b, 0, 0); void c; },
    plus(x) { rect(x, '#3b2412', 5, 2, 4, 10); rect(x, '#3b2412', 2, 5, 10, 4); rect(x, '#fff2c8', 6, 3, 2, 8); rect(x, '#fff2c8', 3, 6, 8, 2); },
    minus(x) { rect(x, '#3b2412', 2, 5, 10, 4); rect(x, '#fff2c8', 3, 6, 8, 2); },
    wave(x) { rect(x, '#1a4a7a', 0, 4, 14, 3); rect(x, '#4aa8dc', 1, 4, 12, 1); rect(x, '#1a4a7a', 0, 9, 14, 3); rect(x, '#4aa8dc', 1, 9, 12, 1); for (const [i, j] of [[2, 3], [3, 2], [4, 3], [8, 8], [9, 7], [10, 8]]) dot(x, '#9fd6f0', i, j); },
    leaf(x) { const b = P.blob(14, 14, (i, j) => (i - 6.5) ** 2 / 36 + (j - 6.5) ** 2 / 12 <= 1, ['#c8f08a', '#7cc04a', '#4a9a38', '#1f5428'], 6, [0.3, 0.6]); x.drawImage(b, 0, 0); line(x, '#1f5428', 1, 12, 12, 2); },
    flower(x) { for (const [i, j] of [[6, 2], [3, 5], [9, 5], [4, 8], [8, 8]]) rect(x, '#ff7aa8', i, j, 2, 2); rect(x, '#ffe052', 6, 5, 2, 2); rect(x, '#3a7a2e', 6, 9, 2, 4); },
    snow(x) { for (const [i, j] of [[6, 1], [6, 12], [1, 6], [12, 6], [3, 3], [10, 3], [3, 10], [10, 10]]) rect(x, '#dff0fa', i, j, 2, 2); rect(x, '#9fd0ec', 5, 5, 4, 4); rect(x, '#dff0fa', 6, 6, 2, 2); },
    bag(x) { rect(x, '#3b2412', 2, 4, 10, 9); rect(x, '#b9484a', 3, 5, 8, 7); rect(x, '#8a2e32', 3, 9, 8, 3); rect(x, '#3b2412', 4, 2, 6, 3); rect(x, '#e0c070', 5, 3, 4, 1); rect(x, '#e0c070', 6, 8, 2, 2); },
    rod(x) { const dk = '#3b2412'; for (let k = 0; k <= 10; k++) { rect(x, dk, 1 + k - 1, 12 - k, 3, 2); } for (let k = 0; k <= 10; k++) { dot(x, k % 3 === 2 ? '#d9b070' : '#a8743e', 1 + k, 12 - k); dot(x, '#c39662', 1 + k, 11 - k); } rect(x, '#5a3a1c', 1, 12, 2, 2); rect(x, '#e0d8c0', 11, 3, 1, 6); dot(x, dk, 11, 10); dot(x, '#cfd6de', 10, 11); dot(x, '#cfd6de', 9, 10); dot(x, dk, 10, 12); dot(x, '#ff5a3a', 11, 9); },
    bolt(x) { const pts = [[8, 0], [7, 1], [6, 2], [5, 3], [4, 4], [3, 5], [3, 6], [4, 6], [5, 6], [6, 6], [5, 7], [4, 8], [4, 9], [3, 10], [3, 11], [2, 12], [6, 8], [6, 7]]; for (const [i, j] of pts) rect(x, '#5a3a00', i - 1, j - 1, 3, 3); const fill = [[8, 0], [7, 1], [6, 2], [5, 3], [4, 4], [4, 5], [5, 5], [6, 5], [7, 5], [6, 6], [5, 7], [5, 8], [4, 9], [4, 10], [3, 11], [7, 4], [8, 4], [9, 4], [6, 4]]; for (const [i, j] of fill) dot(x, '#ffe24a', i, j); dot(x, '#fff8b0', 7, 1); dot(x, '#fff8b0', 5, 4); },
    reel(x) { const b = P.blob(14, 14, (i, j) => { const d = (i - 6.5) ** 2 + (j - 6.5) ** 2; return d <= 30 && d >= 5; }, ['#e4e8ee', '#aab4c2', '#7a8494', '#2a303c'], 12); x.drawImage(b, 0, 0); rect(x, '#2a303c', 5, 5, 4, 4); rect(x, '#cfd6de', 6, 6, 2, 2); for (const [i, j] of [[6, 1], [6, 12], [1, 6], [12, 6]]) dot(x, '#2a303c', i, j); rect(x, '#2a303c', 11, 6, 3, 3); rect(x, '#d4502c', 12, 7, 1, 1); },
    trophy(x) { rect(x, '#5a3a00', 3, 1, 8, 7); rect(x, '#ffd23a', 4, 1, 6, 6); rect(x, '#fff2a0', 4, 1, 2, 4); rect(x, '#d89a1c', 8, 3, 2, 4); rect(x, '#5a3a00', 1, 2, 3, 4); rect(x, '#5a3a00', 10, 2, 3, 4); rect(x, '#ffd23a', 2, 3, 1, 2); rect(x, '#ffd23a', 11, 3, 1, 2); rect(x, '#5a3a00', 6, 7, 2, 3); rect(x, '#d89a1c', 6, 7, 2, 2); rect(x, '#5a3a00', 3, 10, 8, 3); rect(x, '#b9781a', 4, 11, 6, 1); },
    book(x) { rect(x, '#2a1a40', 1, 2, 12, 10); rect(x, '#f6f1e4', 2, 3, 5, 8); rect(x, '#e6dcc4', 7, 3, 5, 8); rect(x, '#2a1a40', 6, 2, 2, 10); for (const j of [5, 7, 9]) { rect(x, '#8a7a5a', 3, j, 3, 1); rect(x, '#8a7a5a', 8, j, 3, 1); } rect(x, '#d03a2a', 11, 2, 1, 4); },
    bed(x) { rect(x, '#3b2412', 0, 6, 14, 7); rect(x, '#8a5a34', 1, 10, 12, 2); rect(x, '#3b2412', 0, 3, 2, 10); rect(x, '#2f7fd0', 2, 7, 11, 3); rect(x, '#4a96e0', 2, 7, 11, 1); rect(x, '#f6f1e4', 2, 5, 4, 3); rect(x, '#3b2412', 12, 10, 2, 3); },
    house(x) { rect(x, '#3b2412', 1, 6, 12, 7); rect(x, '#f6e3c4', 2, 7, 10, 5); rect(x, '#3b2412', 0, 5, 14, 1); for (let j = 0; j < 5; j++) rect(x, j % 2 ? '#a8452c' : '#c4573a', 1 + j, 1 + (4 - j) * 0, 12 - j * 2, 1); rect(x, '#3b2412', 6, 0, 2, 1); for (let j = 0; j < 5; j++) { rect(x, '#3b2412', 6 - j - 1, 1 + j, 1, 1); rect(x, '#3b2412', 7 + j + 1, 1 + j, 1, 1); rect(x, '#c4573a', 6 - j, 1 + j, 2 + j * 2, 1); } rect(x, '#3b2412', 6, 8, 3, 5); rect(x, '#8a5a34', 6, 9, 2, 4); rect(x, '#9fd6ea', 3, 8, 2, 2); rect(x, '#9fd6ea', 10, 8, 2, 2); },
    lock(x) { rect(x, '#2a303c', 3, 1, 8, 6); rect(x, '#9aa4b2', 4, 2, 2, 5); rect(x, '#9aa4b2', 8, 2, 2, 5); rect(x, '#2a303c', 2, 6, 10, 7); rect(x, '#e0b030', 3, 7, 8, 5); rect(x, '#fff2a0', 3, 7, 8, 1); rect(x, '#2a303c', 6, 8, 2, 3); },
    unlock(x) { rect(x, '#2a303c', 7, 0, 6, 6); rect(x, '#9aa4b2', 8, 1, 4, 5); rect(x, '#2a303c', 2, 6, 10, 7); rect(x, '#4cb04a', 3, 7, 8, 5); rect(x, '#bff0a0', 3, 7, 8, 1); rect(x, '#2a303c', 6, 8, 2, 3); },
    check(x) { for (const [i, j] of [[2, 7], [3, 8], [4, 9], [5, 8], [6, 7], [7, 6], [8, 5], [9, 4], [10, 3]]) { rect(x, '#14381e', i - 1, j - 1, 3, 3); } for (const [i, j] of [[2, 7], [3, 8], [4, 9], [5, 8], [6, 7], [7, 6], [8, 5], [9, 4], [10, 3]]) dot(x, '#5ee070', i, j); for (const [i, j] of [[3, 7], [4, 8], [9, 3]]) dot(x, '#c8ffd0', i, j); },
    cross(x) { for (let k = 2; k <= 11; k++) { rect(x, '#4a0e0a', k - 1, k - 1, 3, 3); rect(x, '#4a0e0a', 13 - k - 1, k - 1, 3, 3); } for (let k = 2; k <= 11; k++) { dot(x, '#ff5a4a', k, k); dot(x, '#ff5a4a', 13 - k, k); } },
    gift(x) { rect(x, '#3b0e2a', 1, 5, 12, 8); rect(x, '#d03a7a', 2, 6, 10, 6); rect(x, '#e86a9a', 2, 6, 10, 1); rect(x, '#3b0e2a', 0, 3, 14, 3); rect(x, '#e8508a', 1, 4, 12, 1); rect(x, '#ffd23a', 6, 3, 2, 10); rect(x, '#ffd23a', 4, 1, 2, 2); rect(x, '#ffd23a', 8, 1, 2, 2); },
    anchor(x) { rect(x, '#1a2a44', 6, 1, 2, 11); rect(x, '#9fb4cc', 6, 2, 1, 9); rect(x, '#1a2a44', 4, 3, 6, 2); rect(x, '#9fb4cc', 5, 3, 4, 1); rect(x, '#1a2a44', 1, 8, 2, 3); rect(x, '#1a2a44', 11, 8, 2, 3); rect(x, '#1a2a44', 2, 11, 10, 2); rect(x, '#9fb4cc', 3, 11, 8, 1); rect(x, '#1a2a44', 5, 0, 4, 2); rect(x, '#d9e6f4', 6, 0, 2, 1); },
    chest(x) { rect(x, '#2b1a0c', 1, 3, 12, 10); rect(x, '#8a5a2a', 2, 6, 10, 6); rect(x, '#b27a3c', 2, 4, 10, 3); rect(x, '#ffd36a', 2, 7, 10, 1); rect(x, '#ffd36a', 6, 6, 2, 4); rect(x, '#2b1a0c', 6, 8, 2, 1); },
    speech(x) { rect(x, '#2b1a0c', 1, 1, 12, 9); rect(x, '#f6f1e4', 2, 2, 10, 7); rect(x, '#2b1a0c', 3, 10, 3, 3); rect(x, '#f6f1e4', 3, 10, 2, 2); for (const i of [4, 6, 8]) rect(x, '#5a4a30', i, 5, 1, 1); },
    door(x) { rect(x, '#2b1a0c', 2, 0, 10, 14); rect(x, '#8a5a34', 3, 1, 8, 12); rect(x, '#a8743e', 3, 1, 3, 12); rect(x, '#6e4526', 7, 2, 1, 10); rect(x, '#ffd23a', 9, 7, 1, 2); },
    shirt(x) { rect(x, '#2b1a0c', 0, 2, 14, 5); rect(x, '#2b1a0c', 3, 1, 8, 12); rect(x, '#f6f1e4', 4, 3, 6, 9); rect(x, '#e0583a', 1, 3, 3, 3); rect(x, '#e0583a', 10, 3, 3, 3); rect(x, '#e0583a', 4, 3, 6, 4); rect(x, '#2b1a0c', 5, 1, 4, 2); },
    star(x) { const pts = [[6, 1], [7, 1], [6, 3], [7, 3], [5, 4], [8, 4], [1, 5], [2, 5], [3, 5], [4, 5], [9, 5], [10, 5], [11, 5], [12, 5], [3, 7], [10, 7], [3, 8], [10, 8], [4, 9], [9, 9], [4, 10], [9, 10]]; void pts; const b = P.blob(14, 14, (i, j) => { const a = Math.atan2(j - 7, i - 6.5), r = Math.hypot(i - 6.5, j - 7); return r <= 3.2 + 3.6 * Math.max(0, Math.cos((a + Math.PI / 2) * 5)) ** 2; }, ['#fff6b0', '#ffd23a', '#e0a020', '#6a4210'], 14); x.drawImage(b, 0, 0); },
    warn(x) { for (let j = 0; j < 12; j++) { const w = Math.round(j * 0.55) + 1; rect(x, '#3a2a00', 7 - w - 1, 1 + j, 2 * w + 2, 1); } for (let j = 1; j < 11; j++) { const w = Math.round(j * 0.55); rect(x, '#ffd23a', 7 - w, 1 + j, 2 * w, 1); } rect(x, '#3a2a00', 6, 4, 2, 4); rect(x, '#3a2a00', 6, 9, 2, 2); },
    bird(x) { rect(x, '#2b3a50', 1, 5, 4, 3); rect(x, '#f2f5f8', 2, 5, 3, 2); rect(x, '#2b3a50', 5, 4, 5, 4); rect(x, '#f2f5f8', 5, 5, 4, 2); rect(x, '#2b3a50', 9, 3, 4, 4); rect(x, '#f2f5f8', 10, 4, 2, 2); rect(x, '#f0a020', 13, 5, 1, 1); dot(x, '#101820', 11, 4); rect(x, '#2b3a50', 4, 1, 4, 4); rect(x, '#d9e2ea', 5, 2, 2, 2); },
    shop(x) { rect(x, '#3b2412', 1, 5, 12, 8); rect(x, '#f2e2b0', 2, 7, 10, 5); rect(x, '#8a5a34', 6, 8, 3, 4); for (let i = 1; i < 13; i += 2) rect(x, i % 4 === 1 ? '#d03a2a' : '#f6f1e4', i, 2, 2, 4); rect(x, '#3b2412', 1, 1, 12, 1); rect(x, '#6cb0e0', 3, 8, 2, 2); },
  };
  P.icon = (name) => {
    if (icons[name]) return icons[name];
    const [c, x] = mk(14, 14); (IC[name] || IC.coin)(x); iconCv[name] = c;
    return (icons[name] = c.toDataURL());
  };
  /* ---- Sustituye los emojis del texto por iconos pixel ---- */
  const EMO = { '🎣': 'rod', '💪': 'rod', '↩': 'reel', '⚡': 'bolt', '🌀': 'reel', '🕊': 'bird', '✔': 'check', '✅': 'check', '❌': 'cross', '🎒': 'bag', '🏪': 'shop', '💶': 'coin', '💰': 'coin', '💎': 'gem', '🪱': 'worm', '🐟': 'sardine', '🐠': 'sardine', '🦀': 'crab', '🧊': 'cooler', '📜': 'scroll', '🏆': 'trophy', '📖': 'book', '🗺': 'map', '⚙': 'gear', '🛏': 'bed', '🏠': 'house', '🔒': 'lock', '🔓': 'unlock', '🎁': 'gift', '⚓': 'anchor', '🌙': 'moon', '☀': 'sun', '🌅': 'sunset', '🌇': 'sunset', '🌊': 'wave', '🧰': 'chest', '💬': 'speech', '🚪': 'door', '👕': 'shirt', '⭐': 'star', '🌟': 'star', '⚠': 'warn', '🏖': 'sun', '🏞': 'leaf', '🌸': 'flower', '🍂': 'leaf', '❄': 'snow', '🌲': 'leaf', '🪷': 'flower', '🌿': 'leaf', '♻': 'leaf', '🏊': 'wave', '🤿': 'wave', '🏄': 'wave', '🏰': 'house', '🌉': 'house', '🏝': 'sun', '🎏': 'sardine', '🔱': 'anchor', '🔦': 'sun', '🥽': 'wave', '🌤': 'sun', '🪧': 'scroll', '🔥': 'sun', '🚚': 'shop', '🧴': 'cooler', '🥫': 'cooler', '🛍': 'bag', '💨': 'wave', '📅': 'scroll', '📆': 'scroll', '💜': 'gem', '💙': 'gem', '🚔': 'warn', '🛟': 'wave', '🛡': 'check', '⚖': 'coin', '📈': 'trophy', '🅿': 'house', '🐧': 'sardine', '🐢': 'sardine', '🦈': 'sardine', '🏅': 'trophy', '👨': 'shirt', '🕹': 'gear', '😕': '', '😴': '', '😅': '' };
  for (const k of Object.keys(EMO)) { const n = k.replace(/[\uFE0F\u200D]/g, ''); if (n !== k) { EMO[n] = EMO[k]; delete EMO[k]; } }
  const EMO_RE = /(?:\p{Extended_Pictographic})[\uFE0F\u200D]*(?:\p{Extended_Pictographic}[\uFE0F]*)*/gu;
  const hasEmo = (s) => /\p{Extended_Pictographic}/u.test(s);
  function emojifyNode(n) {
    const s = n.nodeValue; if (!hasEmo(s)) return;
    const frag = document.createDocumentFragment(); let last = 0, m; EMO_RE.lastIndex = 0;
    while ((m = EMO_RE.exec(s))) {
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      const key = [...m[0]][0].replace(/[\uFE0F\u200D]/g, ''), name = EMO[key];
      if (name) { const im = document.createElement('img'); im.className = 'pxi inl'; im.src = P.icon(name); im.alt = ''; frag.appendChild(im); }
      last = m.index + m[0].length;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    n.replaceWith(frag);
  }
  function emojifyTree(root) {
    if (root.nodeType === 3) { if (root.parentNode && !/^(SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(root.parentNode.nodeName)) emojifyNode(root); return; }
    if (root.nodeType !== 1 || /^(CANVAS|SCRIPT|STYLE|IMG)$/.test(root.nodeName)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = []; let t; while ((t = w.nextNode())) if (hasEmo(t.nodeValue)) list.push(t);
    list.forEach(emojifyNode);
  }
  P.emojify = emojifyTree;
  P.watchEmoji = function () {
    emojifyTree(document.body);
    new MutationObserver((muts) => { for (const m of muts) { if (m.type === 'characterData') emojifyTree(m.target); else m.addedNodes.forEach(emojifyTree); } }).observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  P.iconCanvas = (name) => { P.icon(name); return iconCv[name]; };
  P.iconHtml = (name, px) => `<img class="pxi" src="${P.icon(name)}" width="${px || 28}" height="${px || 28}" alt="">`;
  return P;
})();
