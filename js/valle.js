/* Valle del Pescador: mapa de estilo Stardew (casa, pueblo, río, lago, estanque), estaciones y peces de agua dulce.
   Reutiliza el motor de pesca: este mundo implementa la misma interfaz que G.World (la Costa del Sol). */
window.G = window.G || {};

(function () {
  const U = G.U;
  const TS = 32, MW = 100, MH = 76;                       // tamaño de tile y del mapa (en tiles)
  const T = { GRASS: 0, WATER: 1, PATH: 3, TREE: 4, BRIDGE: 5, SAND: 6, BLDG: 7, ROCK: 8, FLOWER: 9, PLAZA: 10 };
  const MPT = TS / G.PXM;                                  // metros por tile

  /* ---------------- Estaciones ---------------- */
  G.SEASONS = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
  G.SEASON_ICON = ['🌸', '☀️', '🍂', '❄️'];
  G.season = () => (G.mapId === 'valle' ? Math.floor((G.S.day - 1) / 28) % 4 : -1);
  G.dateText = () => { const d = G.S.day - 1; return G.SEASONS[Math.floor(d / 28) % 4] + ' ' + (d % 28 + 1) + (d >= 112 ? ' · año ' + (Math.floor(d / 112) + 1) : ''); };

  /* Clima del día: lluvia en algunos días (nunca en invierno, que nieva) */
  G.weather = () => {
    if (G.mapId !== 'valle') return 'clear';
    const sn = G.season(), r = hash1(G.S.day);
    return sn === 3 ? 'snow' : r < (sn === 1 ? 0.1 : 0.22) ? 'rain' : 'clear';
  };
  function hash1(n) { let x = Math.imul(n | 0, 2654435761) ^ 0x5bd1e995; x = Math.imul(x ^ (x >>> 15), 2246822519); return ((x ^ (x >>> 13)) >>> 0) / 4294967296; }
  G.weatherName = () => ({ rain: 'Lluvia', snow: 'Nieve', clear: 'Despejado' })[G.weather()];

  /* ---------------- Peces de agua dulce ---------------- */
  (function () {
    const OR = ['orilla'];
    const S = (id, name, sci, rar, hab, dmin, dmax, time, diff, hook, cm, kg, eurKg, shape, color, bait, o) =>
      ({ id, name, sci, rar, hab, dmin, dmax, time, modes: OR, diff, hook, cm, kg, eurKg, shape, color, bait, fresh: true, ...(o || {}) });
    const A = [0, 1, 2, 3];
    G.SPECIES.push(
      S('gobio', 'Gobio', 'Gobio lozanoi', 'comun', 'FL', 0, 40, 'any', 8, 0, [8, 15], [.01, .04], 48, 'fish', '#a9a58a', [1.6, .5, .3], { sea: A, desc: 'Pececillo de fondo que vive en bancos en ríos y lagos. Se alimenta de larvas y gusanitos.' }),
      S('alburno', 'Alburno', 'Alburnus alburnus', 'comun', 'FL', 0, 50, 'dia', 9, 0, [10, 20], [.02, .09], 44, 'fish', '#c4d0d6', [1.5, .6, .3], { sea: A, desc: 'Plateado y veloz, salta a por los insectos que caen al agua en los días de calor.' }),
      S('perca', 'Perca', 'Perca fluviatilis', 'poco', 'L', 3, 60, 'dia', 15, 0, [15, 35], [.1, .9], 36, 'fish', '#8fa04a', [1.0, 1.4, 1.0], { sea: A, desc: 'Rayas verticales y aletas anaranjadas. Es una gran cazadora y no perdona un buen cebo.' }),
      S('carpa', 'Carpa común', 'Cyprinus carpio', 'poco', 'L', 4, 70, 'any', 20, 1, [35, 80], [1, 9], 14, 'fish', '#b89a5a', [1.3, .6, .8], { sea: [1, 2, 0], desc: 'Un pez grande y desconfiado que rebusca en el fondo del lago. Cuando pica, da guerra.' }),
      S('barbo', 'Barbo común', 'Luciobarbus bocagei', 'poco', 'F', 0, 60, 'any', 18, 1, [25, 60], [.3, 3.5], 18, 'fish', '#8f8a6a', [1.5, .6, 1.0], { sea: A, desc: 'Le encantan las corrientes rápidas del río. Sus barbillas le ayudan a buscar comida entre las piedras.' }),
      S('tenca', 'Tenca', 'Tinca tinca', 'poco', 'L', 2, 45, 'noche', 16, 0, [20, 45], [.2, 1.5], 24, 'fish', '#6a8a4a', [1.5, .6, .4], { sea: [0, 1, 2], desc: 'Verdosa y tranquila, sale al anochecer entre las plantas del lago.' }),
      S('trucha', 'Trucha común', 'Salmo trutta', 'raro', 'F', 0, 55, 'dia', 28, 2, [20, 55], [.15, 2.5], 38, 'fish', '#b8a070', [.8, 1.4, 1.0], { sea: [0, 1, 2], pat: 'spot', desc: 'Puntitos rojos y negros. Solo vive en aguas limpias y frías: un buen síntoma de un río sano.' }),
      S('blackbass', 'Black bass', 'Micropterus salmoides', 'raro', 'L', 4, 55, 'dia', 32, 2, [30, 60], [.8, 4], 30, 'fish', '#5f7f45', [.6, 1.4, 1.4], { sea: [0, 1, 2], desc: 'Un depredador americano que se esconde cerca de los troncos. Salta fuera del agua cuando pica.' }),
      S('anguila_rio', 'Anguila europea', 'Anguilla anguilla', 'raro', 'FL', 5, 70, 'noche', 30, 2, [50, 100], [.3, 1.8], 45, 'long', '#4a5a4a', [1.4, .6, 1.3], { sea: A, desc: 'Nace en el mar de los Sargazos y sube a los ríos. De noche recorre el fondo buscando presas.' }),
      S('lucio', 'Lucio', 'Esox lucius', 'epico', 'L', 8, 70, 'any', 52, 4, [60, 110], [2, 12], 22, 'long', '#5f7a3a', [.4, 1.2, 1.5], { sea: [2, 3, 0], desc: 'El tigre del agua dulce: emboscador con una boca llena de dientes. Una captura memorable.' }),
      S('siluro', 'Siluro', 'Silurus glanis', 'epico', 'FL', 12, 80, 'noche', 62, 5, [100, 200], [10, 60], 8, 'long', '#4a4f4a', [.3, .8, 1.8], { sea: [1, 2], desc: 'Un gigante bigotudo que de noche acecha en las pozas más hondas. Pesa más que muchos pescadores.' }),
      S('koi', 'Carpa koi', 'Cyprinus rubrofuscus', 'epico', 'L', 3, 50, 'dia', 38, 3, [40, 80], [2, 9], 120, 'fish', '#e8742a', [1.4, .8, .8], { sea: [1, 2], pat: 'spot', desc: 'Escapada de un jardín japonés, esta carpa de colores vale una fortuna entre los coleccionistas.' }),
      S('esturion', 'Esturión', 'Acipenser sturio', 'leyenda', 'F', 14, 80, 'any', 75, 5, [120, 220], [30, 150], 70, 'long', '#7a8088', [.3, .7, 1.6], { sea: [0, 3], desc: 'Un pez prehistórico que lleva 200 millones de años en los ríos. Verlo es un privilegio.' }),
      S('carpa_dorada', 'Carpa dorada', 'Carassius auratus aureus', 'leyenda', 'L', 10, 60, 'dia', 70, 3, [25, 45], [.4, 1.2], 2600, 'fish', '#ffc83a', [1.0, 1.0, 1.0], { sea: [1], pat: 'spot', desc: 'La leyenda del valle dice que solo muerde en pleno verano. Brilla como una moneda de oro.' }),
    );
    G.SPECIES_BY_ID = Object.fromEntries(G.SPECIES.map(s => [s.id, s]));
    G.HAB_NAMES.F = 'Río'; G.HAB_NAMES.L = 'Lago / estanque';
  })();

  /* ---------------- Generación del mapa ---------------- */
  const tiles = new Uint8Array(MW * MH), wk = new Uint8Array(MW * MH), dist = new Float32Array(MW * MH), tv = new Uint8Array(MW * MH);
  const ix = (tx, ty) => ty * MW + tx;
  const inMap = (tx, ty) => tx >= 0 && ty >= 0 && tx < MW && ty < MH;
  const tileAt = (tx, ty) => (inMap(tx, ty) ? tiles[ix(tx, ty)] : T.TREE);
  const hash = (x, y, s) => { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const rng = U.rng(20260);
  const sm = (t) => t * t * (3 - 2 * t);
  const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi); const a = hash(xi, yi, 3), b = hash(xi + 1, yi, 3), c = hash(xi, yi + 1, 3), d = hash(xi + 1, yi + 1, 3); return U.lerp(U.lerp(a, b, fx), U.lerp(c, d, fx), fy); };
  const grassType = (tx, ty) => { const n = vnoise(tx / 7, ty / 7) * 0.7 + vnoise(tx / 3, ty / 3) * 0.3; return n < 0.36 ? 1 : n > 0.66 ? 2 : 0; };
  const disc = (cx, cy, r, f) => { for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) if (inMap(x, y) && Math.hypot(x + .5 - cx, y + .5 - cy) <= r) f(x, y); };
  const buildings = [], lamps = [], npcs = [], treeList = [];
  const BX = { home: 7, bait: 19, rods: 25, lonja: 31, fashion: 37, stall: 43 };   // columna (tile) de cada edificio
  const BROW = 29, BH = 5;                                                       // fila superior y alto (tiles)

  (function gen() {
    tiles.fill(T.GRASS);
    // lago grande (NE) con un islote
    const lcx = 78, lcy = 14;
    disc(lcx, lcy, 17, (x, y) => { const a = Math.atan2(y - lcy, x - lcx), r = 9 * (1 + 0.15 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 5)); if (Math.hypot((x - lcx) / 1.75, y - lcy) <= r) { tiles[ix(x, y)] = T.WATER; wk[ix(x, y)] = 2; } });
    disc(80, 13, 3.4, (x, y) => { tiles[ix(x, y)] = T.GRASS; wk[ix(x, y)] = 0; });
    // río: baja del lago hasta el borde sur, con meandros
    const pts = [[64, 19], [60, 26], [62, 34], [57, 43], [50, 51], [43, 59], [38, 67], [36, 76]];
    for (let s = 0; s < pts.length - 1; s++) {
      const [ax, ay] = pts[s], [bx, by] = pts[s + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
      for (let i = 0; i <= n; i++) {
        const u = i / n, cx = U.lerp(ax, bx, u) + Math.sin((s + u) * 2.4) * 1.3, cy = U.lerp(ay, by, u), r = 2.3 + 0.7 * Math.sin((s + u) * 1.7) + s * 0.08;
        disc(cx, cy, r, (x, y) => { tiles[ix(x, y)] = T.WATER; if (!wk[ix(x, y)]) wk[ix(x, y)] = 1; });
      }
    }
    // estanque de la granja
    disc(11, 53, 4.3, (x, y) => { tiles[ix(x, y)] = T.WATER; wk[ix(x, y)] = 2; });
    // distancia a la orilla (en metros)
    const INF = 1e9, q = [];
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const i = ix(x, y);
      if (tiles[i] !== T.WATER) { dist[i] = 0; continue; }
      let near = false;
      for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) if (tileAt(x + dx, y + dy) !== T.WATER) { near = true; break; }
      dist[i] = near ? 0.5 : INF; if (near) q.push([x, y]);
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const i = ix(x, y); if (tiles[i] !== T.WATER) continue; for (const [dx, dy, w] of [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.41], [1, -1, 1.41]]) if (inMap(x + dx, y + dy)) dist[i] = Math.min(dist[i], dist[ix(x + dx, y + dy)] + w); }
      for (let y = MH - 1; y >= 0; y--) for (let x = MW - 1; x >= 0; x--) { const i = ix(x, y); if (tiles[i] !== T.WATER) continue; for (const [dx, dy, w] of [[1, 0, 1], [0, 1, 1], [1, 1, 1.41], [-1, 1, 1.41]]) if (inMap(x + dx, y + dy)) dist[i] = Math.min(dist[i], dist[ix(x + dx, y + dy)] + w); }
    }
    for (let i = 0; i < dist.length; i++) if (tiles[i] === T.WATER) dist[i] = Math.min(dist[i], 40) * MPT;
    // arena en las orillas
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (tiles[ix(x, y)] === T.GRASS) { let w = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (tileAt(x + dx, y + dy) === T.WATER) w = true; if (w && hash(x, y, 5) < 0.85) tiles[ix(x, y)] = T.SAND; }
    // camino principal (y 36-37) con puente sobre el río, y caminos secundarios
    const path = (x0, y0, x1, y1, tp) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!inMap(x, y)) continue; const i = ix(x, y); tiles[i] = tiles[i] === T.WATER ? T.BRIDGE : (tp || T.PATH); } };
    path(6, 36, 86, 37);
    path(6, 34, 50, 35, T.PLAZA);              // plaza frente a las tiendas
    path(9, 34, 10, 36);
    path(29, 38, 30, 52);                      // bajada al estanque y al sur
    path(10, 47, 30, 47);
    path(80, 24, 81, 40);                      // sendero que sube al lago
    // muelle al islote
    for (let y = 17; y <= 24; y++) for (const x of [78, 79]) { const i = ix(x, y); tiles[i] = T.BRIDGE; }
    for (let y = 15; y <= 17; y++) for (const x of [78, 79]) if (tiles[ix(x, y)] === T.WATER) tiles[ix(x, y)] = T.BRIDGE;
    // edificios (huella sólida)
    for (const [kind, tx] of Object.entries(BX)) {
      const w = kind === 'home' ? 7 : 5;
      for (let y = BROW; y < BROW + BH; y++) for (let x = tx; x < tx + w; x++) tiles[ix(x, y)] = T.BLDG;
    }
    // rocas, flores, bosque
    const free = (x, y) => tiles[ix(x, y)] === T.GRASS;
    for (let n = 0; n < 160; n++) { const x = Math.floor(rng() * MW), y = Math.floor(rng() * MH); if (free(x, y) && y > 4 && y < MH - 4) tiles[ix(x, y)] = T.ROCK; }
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (free(x, y) && rng() < 0.07) tiles[ix(x, y)] = T.FLOWER;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const i = ix(x, y);
      if (tiles[i] !== T.GRASS && tiles[i] !== T.FLOWER) continue;
      const border = Math.min(x, y, MW - 1 - x, MH - 1 - y);
      const nearCenter = Math.hypot(x - 36, y - 40) < 26 && y > 24 && y < 56;
      let p = border < 2 ? 1 : border < 4 ? 0.7 : x > 66 && y > 26 ? 0.34 : y < 12 && x < 60 ? 0.3 : y > 62 ? 0.28 : nearCenter ? 0.025 : 0.09;
      let nearW = false; for (let dy = -2; dy <= 2 && !nearW; dy++) for (let dx = -2; dx <= 2; dx++) if (tileAt(x + dx, y + dy) === T.WATER) { nearW = true; break; }
      if (nearW) p *= 0.25;
      if (Math.abs(y - 36.5) < 3 && x > 4) p = border < 2 ? 1 : 0;
      if (y >= BROW - 1 && y <= BROW + BH + 1 && x > 4 && x < 52) p = 0;
      if (rng() < p) { tiles[i] = T.TREE; tv[i] = Math.floor(rng() * 3); }
    }
    // despejar la cabecera del muelle y la zona de la casa
    for (let y = 24; y <= 27; y++) for (let x = 77; x <= 80; x++) if (tiles[ix(x, y)] === T.TREE) tiles[ix(x, y)] = T.GRASS;
    for (const [x, y] of [[80, 13], [79, 12], [81, 14], [80, 14]]) if (inMap(x, y) && tiles[ix(x, y)] === T.TREE) tiles[ix(x, y)] = T.GRASS;
    // edificios (datos para dibujar y entrar)
    const info = {
      home: ['TU CASA', '#f6e3c4', '#c2477e', '#b24a30'], bait: ['EL CEBO · BÁSICOS', '#e7f1df', '#2f9e5b', '#4a8f5a'], rods: ['PESCA EL ANZUELO', '#e4ecf7', '#2d6fc4', '#3a5f9a'],
      lonja: ['LONJA · PROVEEDORES', '#e1e9ea', '#2c8c6a', '#5a7f86'], fashion: ['MODA MARINERA', '#f4e1ec', '#c2477e', '#9a3a6a'], stall: ['TU PESCADERÍA', '#eef3f6', '#2d7fc4', '#2d6fa4'],
    };
    for (const [kind, tx] of Object.entries(BX)) {
      const [label, wall, awn, roof] = info[kind], w = kind === 'home' ? 7 : 5;
      buildings.push({ x: tx * TS, y: BROW * TS, w: w * TS, h: BH * TS, label, kind, wall, awn, roof });
    }
    // farolas
    for (const tx of [10, 22, 34, 46, 58, 72]) lamps.push({ x: tx * TS + 16, y: 35 * TS, r: 110 });
    lamps.push({ x: 78.5 * TS, y: 25 * TS, r: 100 }, { x: 29.5 * TS, y: 48 * TS, r: 90 }, { x: 11 * TS, y: 47 * TS, r: 90 });
    // vecinos
    npcs.push(
      { id: 'marino', name: 'Marino', x: 46 * TS, y: 39 * TS, shirt: '#2d6fa4', skin: '#d9a074', hair: '#cfcfcf', ph: 1, role: 'sailor' },
      { id: 'lucia', name: 'Lucía', x: 33 * TS, y: 39 * TS, shirt: '#c2477e', skin: '#f2c9a0', hair: '#5a3b22', ph: 2 },
      { id: 'paco', name: 'Don Paco', x: 14 * TS, y: 46 * TS, shirt: '#6b8f5a', skin: '#c68863', hair: '#3a2a1c', ph: 3 },
      { id: 'ines', name: 'Inés', x: 70 * TS, y: 34 * TS, shirt: '#e0b030', skin: '#8d5a3b', hair: '#222', ph: 4 },
    );
    for (const n of npcs) disc(Math.floor(n.x / TS), Math.floor(n.y / TS), 2.5, (x, y) => { if (tiles[ix(x, y)] === T.TREE || tiles[ix(x, y)] === T.ROCK) tiles[ix(x, y)] = T.GRASS; });
  })();

  /* ---------------- Consultas ---------------- */
  const walkTile = (t) => t === T.GRASS || t === T.PATH || t === T.PLAZA || t === T.BRIDGE || t === T.SAND || t === T.FLOWER;
  const walkAt = (x, y) => walkTile(tileAt(Math.floor(x / TS), Math.floor(y / TS)));
  function canWalk(x, y) { return walkAt(x, y) && walkAt(x - 7, y + 5) && walkAt(x + 7, y + 5); }
  function freeSpot(x, y) {
    if (canWalk(x, y)) return { x, y };
    for (let r = 16; r <= 320; r += 16) for (let a = 0; a < 6.28; a += 0.4) { const nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r; if (canWalk(nx, ny)) return { x: nx, y: ny }; }
    return { x, y };
  }
  const isWater = (x, y) => tileAt(Math.floor(x / TS), Math.floor(y / TS)) === T.WATER;
  function habitatAt(x, y) {
    const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    if (inMap(tx, ty) && tiles[ix(tx, ty)] === T.WATER) return { hab: wk[ix(tx, ty)] === 1 ? 'F' : 'L', depth: Math.max(1, dist[ix(tx, ty)]), fresh: true };
    return { hab: 'A', depth: 0, fresh: true };
  }
  const depthAt = (x, y) => habitatAt(x, y).depth;
  const validCast = (p) => isWater(p.x, p.y);
  const nearWater = (P) => { for (let a = 0; a < 6.28; a += 0.8) if (isWater(P.x + Math.cos(a) * 60, P.y + Math.sin(a) * 60)) return true; return false; };
  /* Punto del agua más cercano hacia donde mira el jugador (para soltar un pez) */
  function releasePoint(P) {
    for (let r = 20; r <= 200; r += 12) for (const da of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.4, -2.4, 3.14]) { const x = P.x + Math.cos(P.ang + da) * r, y = P.y + Math.sin(P.ang + da) * r; if (isWater(x, y)) return { x, y }; }
    return { x: P.x, y: P.y - 60 };
  }
  const shopAt = (p) => buildings.find(b => p.x > b.x - 6 && p.x < b.x + b.w + 6 && p.y >= b.y + b.h - 2 && p.y < b.y + b.h + 70) || null;
  const nearNpc = (p) => npcs.find(n => Math.hypot(p.x - n.x, p.y - n.y) < 56) || null;
  function zoneAt(x, y) {
    const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    let name = 'Valle del Pescador';
    if (tx >= 66 && ty < 26) name = 'Lago del Valle';
    else if (inMap(tx, ty) && tiles[ix(tx, ty)] === T.WATER) name = wk[ix(tx, ty)] === 1 ? 'Río' : 'Agua';
    else if (ty >= 28 && ty <= 40 && tx > 4 && tx < 56) name = 'Pueblo · Tiendas';
    else if (tx < 26 && ty > 40) name = 'Granja y estanque';
    else if (tx > 62 && ty > 28) name = 'Bosque del este';
    else if (ty > 56) name = 'Río sur';
    return { name, beach: 'none', prom: 'none' };
  }

  /* Puntos de viaje rápido: se colocan en tierra firme junto al agua */
  const spotAt = (id, name, sub, icon, tx, ty) => { const f = freeSpot(tx * TS + 16, ty * TS + 16); return { id, name, sub, icon, x: f.x, y: f.y }; };
  function riverBank(row, side) { let a = -1, b = -1; for (let x = 0; x < MW; x++) if (tiles[ix(x, row)] === T.WATER && wk[ix(x, row)] === 1) { if (a < 0) a = x; b = x; } return side < 0 ? a - 2 : b + 2; }
  const SPOTS = [
    spotAt('casa', 'Mi casa', 'Cama, pecera y armario', '🏠', 10, 35),
    spotAt('estanque', 'Estanque de la granja', 'Agua tranquila · carpas y tencas', '🪷', 11, 47),
    spotAt('puente', 'Río junto al puente', 'Barbos y truchas', '🌉', riverBank(40, -1), 40),
    spotAt('rio_sur', 'Río sur', 'Corriente fuerte', '🌊', riverBank(60, -1), 60),
    spotAt('bosque', 'Bosque del este', 'Orilla tranquila', '🌲', riverBank(47, 1), 47),
    spotAt('lago', 'Orilla del lago', 'Lucios y black bass', '🏞️', 78, 25),
    spotAt('islote', 'Muelle del islote', 'Aguas profundas · el tesoro', '🏝️', 79, 18),
  ];
  const PREP_SPAWN = { x: 30 * TS, y: 36 * TS + 16 };
  const HOME_DOOR = { x: (BX.home + 3.5) * TS, y: (BROW + BH) * TS + 20 };
  const CHEST = { x: 80.5 * TS, y: 13 * TS };

  /* ---------------- Dibujo (arte pixel de G.Pix) ---------------- */
  const PX = G.Pix, K = PX.K;
  const isW = (tx, ty) => { const t = tileAt(tx, ty); return t === T.WATER || t === T.BRIDGE; };
  const BANK = ['#4f7a2c', '#3f6a24', '#7a5a22', '#9fb4c0'];
  function drawGround(ctx, vis, E) {
    const sn = G.season(), t = E.t, fr = Math.floor(t * 2.5) % 4, win = sn === 3, rain = G.weather() === 'rain';
    const tx0 = Math.max(0, Math.floor(vis.x0 / TS)), tx1 = Math.min(MW - 1, Math.floor(vis.x1 / TS)), ty0 = Math.max(0, Math.floor(vis.y0 / TS)), ty1 = Math.min(MH - 1, Math.floor(vis.y1 / TS));
    const reeds = [], tufts = [];
    ctx.imageSmoothingEnabled = false;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const i = ix(tx, ty), tp = tiles[i], x = tx * TS, y = ty * TS, h = hash(tx, ty, 1), v = Math.floor(h * 4);
      let spr;
      if (tp === T.WATER) {
        const d = dist[i];
        spr = PX.water(fr, d < 12 ? 0 : d < 28 ? 1 : 2, wk[i], win);
        ctx.drawImage(spr, x, y, TS, TS);
        // olas de espuma que van y vienen en la orilla
        const wv = Math.round(Math.sin(t * 1.8 + tx * 0.7 + ty * 0.5) * 1.5 + 1.5);
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        if (!isW(tx, ty - 1)) { ctx.fillRect(x, y, TS, 2); ctx.fillRect(x + ((tx * 7) % 3) * 8, y + 2, 12, wv > 1 ? 2 : 0); }
        if (!isW(tx, ty + 1)) { ctx.fillRect(x, y + TS - 2, TS, 2); ctx.fillRect(x + 4 + ((tx * 5) % 3) * 8, y + TS - 4, 12, wv > 1 ? 2 : 0); }
        if (!isW(tx - 1, ty)) { ctx.fillRect(x, y, 2, TS); ctx.fillRect(x + 2, y + 4 + ((ty * 5) % 3) * 8, wv > 1 ? 2 : 0, 12); }
        if (!isW(tx + 1, ty)) { ctx.fillRect(x + TS - 2, y, 2, TS); ctx.fillRect(x + TS - 4, y + 6 + ((ty * 3) % 3) * 8, wv > 1 ? 2 : 0, 12); }
        // nenúfares en el lago y el estanque
        if (wk[i] === 2 && !win && d > 5 && d < 40 && hash(tx, ty, 41) < 0.12) { const lb = Math.round(Math.sin(t * 1.3 + tx)); PX.drawAt(ctx, PX.lily(Math.floor(hash(tx, ty, 42) * 6), Math.floor(t * 0.7 + tx) % 2), x + 10 + hash(tx, ty, 43) * 12, y + 14 + lb + hash(tx, ty, 44) * 8); }
        // piedras que asoman en el río
        if (wk[i] === 1 && d > 8 && hash(tx, ty, 45) < 0.05) PX.drawAt(ctx, PX.rock(sn, 1), x + 16, y + 26);
        // gotas de lluvia en el agua
        if (rain && hash(tx, ty, Math.floor(t * 3)) < 0.1) { const r = Math.round(((t * 3) % 1) * 6) + 1; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x + 8 + hash(tx, ty, 9) * 12 - r, y + 14, r * 2, 2); }
        continue;
      }
      if (tp === T.BRIDGE) { ctx.drawImage(PX.water(fr, 1, 1, win), x, y, TS, TS); ctx.drawImage(PX.bridge(v), x, y, TS, TS); continue; }
      if (tp === T.PATH) spr = PX.path(sn, v); else if (tp === T.PLAZA) spr = PX.plaza(sn, v); else if (tp === T.SAND) spr = PX.sand(sn, v); else spr = PX.grass(sn, grassType(tx, ty) * 4 + v);
      ctx.drawImage(spr, x, y, TS, TS);
      if (rain && (tp === T.PATH || tp === T.PLAZA)) { ctx.fillStyle = 'rgba(30,24,16,.16)'; ctx.fillRect(x, y, TS, TS); if (h > 0.72) { ctx.fillStyle = 'rgba(90,150,200,.55)'; ctx.fillRect(x + 6, y + 14, 18, 6); ctx.fillRect(x + 10, y + 12, 10, 2); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x + 10, y + 15, 4, 2); } }
      // bordes: orilla (hierba junto al agua) y caminos junto a la hierba (con matas)
      for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const t2 = tileAt(tx + dx, ty + dy);
        if (t2 === T.WATER) { ctx.fillStyle = BANK[sn === 3 ? 3 : tp === T.SAND ? 2 : 1]; if (dy < 0) ctx.fillRect(x, y, TS, 4); else if (dy > 0) ctx.fillRect(x, y + TS - 4, TS, 4); else if (dx < 0) ctx.fillRect(x, y, 4, TS); else ctx.fillRect(x + TS - 4, y, 4, TS); }
        else if ((tp === T.PATH || tp === T.PLAZA) && (t2 === T.GRASS || t2 === T.FLOWER || t2 === T.TREE || t2 === T.ROCK)) {
          ctx.fillStyle = tp === T.PLAZA ? '#6e675c' : '#a2804e'; if (dy < 0) ctx.fillRect(x, y, TS, 2); else if (dy > 0) ctx.fillRect(x, y + TS - 2, TS, 2); else if (dx < 0) ctx.fillRect(x, y, 2, TS); else ctx.fillRect(x + TS - 2, y, 2, TS);
          if (tp === T.PATH) { ctx.fillStyle = sn === 3 ? '#e8f0f4' : sn === 2 ? '#b09a3c' : '#5fae3f'; for (let k = 0; k < 3; k++) { const o = 2 + Math.floor(hash(tx, ty, 50 + k) * 24) ; if (hash(tx, ty, 55 + k) < 0.55) { if (dy < 0) ctx.fillRect(x + o, y + 2, 2, 4); else if (dy > 0) ctx.fillRect(x + o, y + TS - 6, 2, 4); else if (dx < 0) ctx.fillRect(x + 2, y + o, 4, 2); else ctx.fillRect(x + TS - 6, y + o, 4, 2); } } }
        }
      }
      if (tp === T.GRASS || tp === T.FLOWER) {
        const gt = grassType(tx, ty), h2 = hash(tx, ty, 31);
        if (h2 < (gt === 1 ? 0.55 : gt === 2 ? 0.12 : 0.3)) tufts.push([x + 6 + hash(tx, ty, 32) * 18, y + 14 + hash(tx, ty, 33) * 14, Math.floor(h * 4), tx, ty]);
        if (h2 > 0.3 && h2 < 0.3 + (gt === 1 ? 0.14 : 0.07) && sn < 3 && tp === T.GRASS) tufts.push([x + 10 + hash(tx, ty, 34) * 12, y + 20 + hash(tx, ty, 35) * 8, Math.floor(h * 4) + 4, tx, ty]);
        if (tp === T.GRASS && sn === 0 && h2 > 0.88) { const pc = ['#ffffff', '#ffe052', '#ff9fc2'][Math.floor(h * 7) % 3]; ctx.fillStyle = pc; const fx = x + 6 + hash(tx, ty, 36) * 18, fy = y + 6 + hash(tx, ty, 37) * 18; ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2); ctx.fillRect(Math.round(fx) + 4, Math.round(fy) + 6, 2, 2); }
        if (tp === T.GRASS && sn === 2) { if (h2 > 0.9) { ctx.fillStyle = ['#e0742a', '#c9501f', '#f0b43a'][Math.floor(h * 9) % 3]; ctx.fillRect(x + 4 + Math.floor(h * 20), y + 8 + Math.floor(h2 * 14), 4, 2); ctx.fillRect(x + 20, y + 22, 2, 2); } else if (h2 < 0.04 && gt === 1) PX.drawAt(ctx, PX.mushroom(Math.floor(h * 9)), x + 16, y + 26); }
        if (tp === T.GRASS && sn === 3 && h2 > 0.82) { const tw = Math.floor(t * 1.5 + h * 9) % 3; if (tw === 0) { ctx.fillStyle = '#ffffff'; const fx = x + 6 + hash(tx, ty, 38) * 18, fy = y + 6 + hash(tx, ty, 39) * 18; ctx.fillRect(Math.round(fx), Math.round(fy), 2, 2); ctx.fillRect(Math.round(fx) - 2, Math.round(fy), 6, 0); } }
        if (tp === T.GRASS && h2 > 0.985) PX.drawAt(ctx, PX.log(), x + 16, y + 28);
      }
      if (tp === T.FLOWER && sn !== 3) {
        if (h > 0.72) PX.drawAt(ctx, PX.bush(sn, v), x + 16, y + 28);
        else { const sw = Math.round(Math.sin(t * 1.6 + h * 20)); ctx.drawImage(PX.flower(sn, Math.floor(h * 17)), x + 4 + sw, y + 6, 18, 18); }
      }
      if (tp === T.ROCK) PX.drawAt(ctx, PX.rock(sn, v % 2), x + 16, y + 28);
      // juncos junto al agua
      if ((tp === T.SAND || tp === T.GRASS) && sn < 3 && hash(tx, ty, 46) < 0.4) { const dxy = [[0, -1, 0], [0, 1, 30], [-1, 0, 4], [1, 0, 28]]; for (const [dx, dy, off] of dxy) if (tileAt(tx + dx, ty + dy) === T.WATER && wk[ix(tx + dx, ty + dy)] !== 0) { reeds.push([x + (dy ? 6 + hash(tx, ty, 47) * 18 : off), y + (dy < 0 ? 8 : dy > 0 ? 30 : 12 + hash(tx, ty, 48) * 14), tx, ty]); break; } }
    }
    // mechas de hierba y juncos (se mecen con el viento)
    const wind = (tx, ty) => (Math.sin(tx * 0.55 + ty * 0.3 - t * 2.2) > 0.25 ? 1 : 0);
    for (const [x, y, v2, tx, ty] of tufts) PX.drawAt(ctx, PX.tuft(sn, v2, wind(tx, ty)), x, y);
    for (const [x, y, tx, ty] of reeds) PX.drawAt(ctx, PX.reed(wind(tx, ty)), x, y);
    // sombras de peces bajo el agua (pistas de dónde pescar)
    if (!win) for (const f of shadows) {
      if (f.x < vis.x0 - 60 || f.x > vis.x1 + 60 || f.y < vis.y0 - 60 || f.y > vis.y1 + 60) continue;
      const x = f.x + Math.cos(t * f.sp + f.ph) * 36, y = f.y + Math.sin(t * f.sp * 0.8 + f.ph) * 14;
      if (!isWater(x, y)) continue;
      ctx.globalAlpha = 0.5; PX.drawAt(ctx, PX.shadowFish(-Math.sin(t * f.sp + f.ph) >= 0 ? 1 : -1), x, y); if (f.big) PX.drawAt(ctx, PX.shadowFish(-Math.sin(t * f.sp + f.ph) >= 0 ? 1 : -1), x + 14, y + 4); ctx.globalAlpha = 1;
    }
  }

  function treeSprite(tx, ty, sn) {
    const i = ix(tx, ty), v = tv[i], h = hash(tx, ty, 7);
    return v === 1 ? PX.tree(1, sn, Math.floor(h * 3)) : PX.tree(0, sn, v === 2 ? 2 : (h > 0.5 ? 1 : 0));
  }
  const treeLayer = (ctx, vis, sn, front) => {
    const tx0 = Math.max(0, Math.floor(vis.x0 / TS) - 1), tx1 = Math.min(MW - 1, Math.floor(vis.x1 / TS) + 1), ty0 = Math.max(0, Math.floor(vis.y0 / TS)), ty1 = Math.min(MH - 1, Math.floor(vis.y1 / TS) + 3), py = G.P.y;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (tiles[ix(tx, ty)] === T.TREE) {
      const base = (ty + 1) * TS - 2;
      if ((base > py) === front) { const h = hash(tx, ty, 8); PX.drawAt(ctx, treeSprite(tx, ty, sn), tx * TS + 16 + (h - 0.5) * 6, base); }
    }
  };

  /* Objetos sueltos (barriles, farolas, bancos...) con su posición base */
  const decor = [];
  for (const b of buildings) {
    decor.push({ s: PX.barrel, x: b.x + 14, y: b.y + b.h + 18 }, { s: PX.crate, x: b.x + b.w - 16, y: b.y + b.h + 16 });
  }
  for (const l of lamps) decor.push({ s: PX.lamp, x: l.x, y: l.y + 6 });
  decor.push({ s: PX.bench, x: 25 * TS, y: 36 * TS - 4 }, { s: PX.bench, x: 41 * TS, y: 36 * TS - 4 }, { s: PX.well, x: 36 * TS, y: 36 * TS - 6 });
  const drawDecor = (ctx, vis, front) => { const py = G.P.y; for (const d of decor) { if (d.x < vis.x0 - 60 || d.x > vis.x1 + 60 || d.y < vis.y0 - 20 || d.y > vis.y1 + 80) continue; if ((d.y > py) === front) PX.drawAt(ctx, d.s(), d.x, d.y); } };

  function drawBuilding(ctx, b, E) {
    const spr = PX.building(b, G.env.night > 0.4, G.season() === 3);
    ctx.drawImage(spr.cv, b.x, b.y, spr.cv.width * K, spr.cv.height * K);
    // humo de la chimenea
    const W2 = Math.round(b.w / K);
    for (let k = 0; k < 4; k++) { const u = (E.t * 0.22 + k / 4 + b.x * 0.01) % 1; ctx.fillStyle = `rgba(235,235,240,${(1 - u) * 0.7})`; const s = 4 + u * 6; ctx.fillRect(Math.round(b.x + (W2 - 13) * K + Math.sin(u * 6 + k) * 5), Math.round(b.y - u * 44), s, s); }
    const bob = Math.round(Math.sin(E.t * 4) * 3); ctx.fillStyle = '#2b1a0c'; ctx.fillRect(b.x + b.w / 2 - 10, b.y - 24 + bob, 20, 4); ctx.fillStyle = '#ffd23a'; ctx.fillRect(b.x + b.w / 2 - 8, b.y - 22 + bob, 16, 2);
    ctx.fillStyle = '#2b1a0c'; ctx.fillRect(b.x + b.w / 2 - 6, b.y - 20 + bob, 12, 4); ctx.fillStyle = '#ffd23a'; ctx.fillRect(b.x + b.w / 2 - 4, b.y - 20 + bob, 8, 2); ctx.fillStyle = '#2b1a0c'; ctx.fillRect(b.x + b.w / 2 - 2, b.y - 16 + bob, 4, 4);
  }
  const NLOOK = {
    marino: { skin: '#d9a074', hair: '#cfcfcf', shirt: { id: 'n1', color: '#f2f2f2', color2: '#27508f', style: 'stripes' }, pants: { id: 'n1', color: '#1c2b4a' }, shoes: { id: 'n1', color: '#2f6b3b', type: 'boot' }, hat: { id: 'n1', type: 'captain', color: '#f4f4f4' } },
    lucia: { skin: '#f2c9a0', hair: '#5a3b22', shirt: { id: 'n2', color: '#c2477e', style: 'plain' }, pants: { id: 'n2', color: '#3a62a0' }, shoes: { id: 'n2', color: '#f4f4f4', type: 'shoe' }, hat: { id: 'n2', type: 'bandana', color: '#e0463a' } },
    paco: { skin: '#c68863', hair: '#3a2a1c', shirt: { id: 'n3', color: '#6b8f5a', style: 'plain' }, pants: { id: 'n3', color: '#b59a63' }, shoes: { id: 'n3', color: '#6b4226', type: 'shoe' }, hat: { id: 'n3', type: 'straw', color: '#e8cf8a', band: '#c0392b' } },
    ines: { skin: '#8d5a3b', hair: '#151515', shirt: { id: 'n4', color: '#e0b030', color2: '#ffffff', style: 'hawaii' }, pants: { id: 'n4', color: '#d8342c', short: true }, shoes: { id: 'n4', color: '#2d9cdb', type: 'flip' }, hat: { id: 'n4', type: 'none' } },
  };
  function drawNpc(ctx, n, E) {
    const dx = G.P.x - n.x, dy = G.P.y - n.y, near = Math.hypot(dx, dy) < 150, dir = near ? PX.dirOf(Math.atan2(dy, dx)) : 0;
    const bob = near ? 0 : Math.round(Math.sin(E.t * 1.6 + n.ph) * 0.6);
    ctx.fillStyle = 'rgba(0,18,30,.28)'; ctx.fillRect(n.x - 12, n.y + 8, 24, 5); ctx.fillRect(n.x - 8, n.y + 13, 16, 2);
    PX.drawAt(ctx, PX.person(NLOOK[n.id] || NLOOK.lucia, dir, 0), n.x, n.y + 14 + bob);
    PX.worldText(ctx, n.name, n.x, n.y - 52, '#fff2c8');
  }
  function drawChest(ctx, E) {
    const open = !chestReady();
    PX.drawAt(ctx, PX.chest(open), CHEST.x, CHEST.y + 14);
    if (!open) { const k = Math.floor(E.t * 3) % 3; ctx.fillStyle = '#fffbd0'; const sx = [CHEST.x - 12, CHEST.x + 8, CHEST.x - 2][k], sy = [CHEST.y - 12, CHEST.y - 18, CHEST.y - 22][k]; ctx.fillRect(sx, sy, 4, 4); ctx.fillRect(sx - 2, sy + 1, 8, 2); ctx.fillRect(sx + 1, sy - 2, 2, 8); }
  }

  /* patos, mariposas, luciérnagas, peces saltando, sombras de nubes */
  const ducks = (function () { const out = [], r = U.rng(77); let n = 0, tries = 0; while (n < 16 && tries++ < 4000) { const tx = Math.floor(r() * MW), ty = Math.floor(r() * MH); if (tiles[ix(tx, ty)] === T.WATER && dist[ix(tx, ty)] >= 8) { out.push({ x: tx * TS + 16, y: ty * TS + 16, ph: r() * 6.3, sp: 0.25 + r() * 0.25 }); n++; } } return out; })();
  const shadows = (function () { const out = [], r = U.rng(99); let n = 0, tries = 0; while (n < 44 && tries++ < 6000) { const tx = Math.floor(r() * MW), ty = Math.floor(r() * MH); if (tiles[ix(tx, ty)] === T.WATER && dist[ix(tx, ty)] >= 10) { out.push({ x: tx * TS + 16, y: ty * TS + 16, ph: r() * 6.3, sp: 0.12 + r() * 0.16, big: r() < 0.2 }); n++; } } return out; })();
  const BFC = ['#ffd23a', '#ff8ab4', '#ffffff', '#8ac8ff', '#ffa040'];
  function ambient(ctx, vis, E) {
    const t = E.t, sn = G.season(), day = 1 - E.night;
    // patos
    for (const d of ducks) {
      if (d.x < vis.x0 - 80 || d.x > vis.x1 + 80 || d.y < vis.y0 - 80 || d.y > vis.y1 + 80) continue;
      let x = d.x + Math.cos(t * d.sp + d.ph) * 30, y = d.y + Math.sin(t * d.sp * 1.3 + d.ph) * 14; if (!isWater(x, y)) { x = d.x; y = d.y; }
      const dir = -Math.sin(t * d.sp + d.ph) >= 0 ? 1 : -1, bob = Math.round(Math.sin(t * 3 + d.ph));
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(Math.round(x) - 14, Math.round(y) + 8, 28, 2);
      PX.drawAt(ctx, PX.duck(dir), x, y + 8 + bob);
    }
    // peces que saltan cerca del jugador
    const gx = Math.floor(G.P.x / 320) * 320, gy = Math.floor(G.P.y / 320) * 320;
    for (let k = 0; k < 3; k++) {
      const per = 3.3 + k * 0.9, tt = t + k * 1.7, id = Math.floor(tt / per), u = (tt % per) / per;
      const x = gx - 160 + hash(id, k, 1) * 640, y = gy - 160 + hash(id, k, 2) * 640;
      if (u > 0.3 || !isWater(x, y) || dist[ix(Math.floor(x / TS), Math.floor(y / TS))] < 6) continue;
      const a = u / 0.3, hh = Math.sin(a * Math.PI) * 22;
      ctx.fillStyle = 'rgba(255,255,255,.7)'; const rr = Math.round(4 + a * 12); ctx.fillRect(Math.round(x) - rr, Math.round(y), rr * 2, 2);
      PX.drawAt(ctx, PX.fishJump(), x, y - hh);
    }
    // lluvia
    if (G.weather() === 'rain') {
      ctx.fillStyle = 'rgba(20,40,80,.16)'; ctx.fillRect(vis.x0, vis.y0, vis.x1 - vis.x0, vis.y1 - vis.y0);
      ctx.fillStyle = 'rgba(190,220,255,.75)';
      for (let k = 0; k < 110; k++) { const fx = vis.x0 + (hash(k, 1, 120) * (vis.x1 - vis.x0) + t * 60) % (vis.x1 - vis.x0), fy = vis.y0 + (hash(k, 2, 121) * (vis.y1 - vis.y0) + t * 420) % (vis.y1 - vis.y0); ctx.fillRect(Math.round(fx), Math.round(fy), 2, 8); ctx.fillRect(Math.round(fx) - 2, Math.round(fy) + 8, 2, 2); }
    }
    // mariposas (de día, primavera y verano, sin lluvia)
    if (sn < 2 && day > 0.5 && G.weather() !== 'rain') for (let i = 0; i < 70; i++) {
      const bx = hash(i, 1, 90) * MW * TS, by = hash(i, 2, 91) * MH * TS;
      if (bx < vis.x0 - 40 || bx > vis.x1 + 40 || by < vis.y0 - 40 || by > vis.y1 + 40) continue;
      const x = bx + Math.sin(t * 1.1 + i) * 22, y = by + Math.cos(t * 1.5 + i * 1.7) * 14;
      if (!walkAt(x, y)) continue;
      PX.drawAt(ctx, PX.butterfly(Math.floor(t * 7 + i) % 2, BFC[i % BFC.length]), x, y - 14 + Math.sin(t * 5 + i) * 2);
    }
    // luciérnagas de noche
    if (E.night > 0.35 && sn !== 3) for (let i = 0; i < 80; i++) {
      const bx = hash(i, 3, 92) * MW * TS, by = hash(i, 4, 93) * MH * TS;
      if (bx < vis.x0 - 40 || bx > vis.x1 + 40 || by < vis.y0 - 40 || by > vis.y1 + 40) continue;
      const x = Math.round(bx + Math.sin(t * 0.7 + i) * 26), y = Math.round(by + Math.cos(t * 0.9 + i * 1.3) * 18), bl = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 2.1);
      ctx.fillStyle = `rgba(255,240,120,${0.16 * bl * E.night})`; ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.fillStyle = `rgba(255,248,170,${bl * E.night})`; ctx.fillRect(x, y, 2, 2);
    }
    // sombras de nubes
    if (day > 0.4) for (let i = 0; i < 6; i++) {
      const cx = ((hash(i, 5, 94) * MW * TS + t * (7 + i)) % (MW * TS + 600)) - 300, cy = hash(i, 6, 95) * MH * TS, w = 150 + hash(i, 7, 96) * 150, h = 70 + hash(i, 8, 97) * 50;
      if (cx + w < vis.x0 || cx - w > vis.x1 || cy + h < vis.y0 || cy - h > vis.y1) continue;
      ctx.fillStyle = `rgba(10,30,60,${0.1 * day})`; ctx.beginPath(); ctx.ellipse(Math.round(cx), Math.round(cy), w, h, 0, 0, 6.3); ctx.ellipse(Math.round(cx) + w * 0.5, Math.round(cy) + h * 0.2, w * 0.6, h * 0.7, 0, 0, 6.3); ctx.fill();
    }
    // pétalos, hojas y nieve
    if (sn === 0 || sn === 2 || sn === 3) {
      const cols = sn === 0 ? ['#ffc1d8', '#ff9fc2'] : sn === 2 ? ['#e0742a', '#c9501f', '#f0b43a'] : ['#ffffff', '#e8f3f9'];
      for (let k = 0; k < 44; k++) {
        const sp = sn === 3 ? 40 : 26, fx = vis.x0 + (hash(k, 1, 98) * (vis.x1 - vis.x0) + t * (sn === 3 ? 6 : 16)) % (vis.x1 - vis.x0), fy = vis.y0 + (hash(k, 2, 99) * (vis.y1 - vis.y0) + t * sp) % (vis.y1 - vis.y0);
        ctx.fillStyle = cols[k % cols.length]; const s = sn === 3 ? 2 + (k % 2) * 2 : 4; ctx.fillRect(Math.round(fx + Math.sin(t * 1.3 + k) * 10), Math.round(fy), s, sn === 3 ? s : 2);
      }
    }
  }

  function drawLand(ctx, vis, E) {
    const sn = G.season(), py = G.P.y;
    for (const b of buildings) if (b.x + b.w > vis.x0 && b.x < vis.x1 && b.y + b.h > vis.y0 - 60 && b.y < vis.y1 && b.y + b.h <= py + 8) drawBuilding(ctx, b, E);
    drawDecor(ctx, vis, false);
    treeLayer(ctx, vis, sn, false);
    drawChest(ctx, E);
    for (const n of npcs) if (n.y <= py) drawNpc(ctx, n, E);
  }
  function drawTall(ctx, vis, E) {
    const sn = G.season(), py = G.P.y;
    for (const b of buildings) if (b.x + b.w > vis.x0 && b.x < vis.x1 && b.y + b.h > vis.y0 - 60 && b.y < vis.y1 && b.y + b.h > py + 8) drawBuilding(ctx, b, E);
    drawDecor(ctx, vis, true);
    for (const n of npcs) if (n.y > py) drawNpc(ctx, n, E);
    treeLayer(ctx, vis, sn, true);
    ambient(ctx, vis, E);
  }

  /* ---------------- Tesoro del islote y diálogos ---------------- */
  const chestReady = () => !G.S.valle || (G.S.day - (G.S.valle.chestDay || -99)) >= 7;
  function openChest() {
    if (!chestReady()) { G.UI.toast('🧰 El cofre está vacío. Vuelve dentro de unos días: el mar siempre deja algo.', 'warn'); return; }
    const v = G.S.valle = G.S.valle || {}; v.chestDay = G.S.day;
    const r = Math.random(); let msg;
    if (r < 0.5) { const n = Math.round(U.rand(120, 420)); G.S.money = Math.round((G.S.money + n) * 100) / 100; msg = '💶 ' + U.money(n); }
    else if (r < 0.8) { const n = U.randi(1, 3); G.S.gems = (G.S.gems || 0) + n; msg = '💎 ' + n + ' gemas'; }
    else { const b = U.pick(['sardina', 'cangrejo']), n = U.randi(8, 15); G.S.baits[b] = (G.S.baits[b] || 0) + n; msg = n + ' ' + (b === 'sardina' ? 'sardinas' : 'cangrejos') + ' de cebo'; }
    G.Ach.count('chests'); G.Audio.play('gem'); G.save(); G.UI.refreshHud();
    G.UI.showMsg('🧰 ¡Tesoro del islote!', 'Entre las raíces había un viejo cofre con ' + msg + '. Aparece uno nuevo cada semana.');
  }
  const LINES = {
    lucia: [
      () => ['Primavera: las truchas suben por el río. ¡Usa cangrejo o sardina!', 'En verano la carpa dorada sale del lago. Dicen que solo muerde ese día…', 'Con las hojas del otoño el lucio sale a cazar al lago.', 'En invierno el agua está tan fría que casi no pica nada. Prueba en el estanque.'][G.season()],
      () => 'Las anguilas y los siluros solo salen de noche. Si tienes lámpara, aprovecha.',
      () => 'Vende en la lonja si tienes prisa, o monta tu pescadería y fija tú el precio.',
      () => 'He oído que la carpa koi se esconde en el estanque de Don Paco.',
    ],
    paco: [
      () => 'El estanque parece pequeño pero tiene carpas enormes. Paciencia, hijo, paciencia.',
      () => 'Una buena caña no hace al pescador, pero ayuda. ¡Cuida tus anzuelos!',
      () => 'En el islote del lago hay un cofre. Cada semana aparece uno nuevo. ¡Cruza el muelle!',
    ],
    ines: [
      () => 'Me encantaría ver peces raros en un acuario… ¡Algún día lo montarás, ya verás!',
      () => 'El bosque del este es un buen sitio para pescar sin que nadie te moleste.',
      () => 'Hoy es ' + G.dateText() + '. ¡Qué bonito está el valle!',
    ],
  };
  function talk(n) {
    if (n.role === 'sailor') { G.UI.open('sailor'); return; }
    const pool = LINES[n.id] || [() => '¡Buenas!'], idx = (G.S.day + n.ph) % pool.length;
    G.UI.showMsg('💬 ' + n.name, pool[idx]());
    G.S.valle = G.S.valle || {}; G.S.valle.talk = G.S.valle.talk || {};
    if (G.S.valle.talk[n.id] !== G.S.day) { G.S.valle.talk[n.id] = G.S.day; G.Ach.count('talk'); }
  }

  const API = {
    kind: 'valle', TS, MW, MH, tileAt: (x, y) => tileAt(Math.floor(x / TS), Math.floor(y / TS)),
    buildings, lamps, npcs, SPOTS, PREP_SPAWN, HOME_DOOR, CHEST,
    PADDLE_SPAWN: { x: -9999, y: -9999 }, DIVE: { x: 0, y: 0 }, DIVES: [], PIERS: [], PIER: null, ZONES: [], LANDMARKS: [],
    FENCE_L: 0, PORT_FENCE_X: 1e9, LONJA_X: 0, STALL_X: 0, PROM_Y1: 0,
    canWalk, canPaddle: () => false, freeSpot, habitatAt, depthAt, shoreY: () => 1e7, inPier: () => false,
    validCast, nearWater, releasePoint, shopAt, nearNpc, talk, openChest, chestReady, zoneAt, nearestSpot: () => SPOTS[1],
    crabNear: () => null, grabCrab: () => false, wormNear: () => null, digWorms: () => 0,
    updateSchools() { }, schoolAt: () => null, swimmerAt: () => null, hitTowel: () => null, peopleNow: () => [], sunbathersNow: () => [], drawPerson: null,
    drawSea: drawGround, drawLand, drawBuoys() { }, drawTall, fishingLights() { },
  };
  G.Worlds = G.Worlds || {};
  API.drawPerson = (...a) => G.Worlds.costa.drawPerson(...a);
  G.Worlds.valle = API;
  G.WORLDS_DIM = { valle: { w: MW * TS, h: MH * TS, shore: 1e7, buoyM: 0 } };
})();

/* ---------------- Selector de mapas ---------------- */
(function () {
  G.Worlds.costa = G.World;
  G.WORLDS_DIM.costa = Object.assign({}, G.WORLD);
  const COSTA_BUOY = G.BUOY_Y;
  G.mapId = 'costa';
  G.World = new Proxy({}, { get: (_, k) => G.Worlds[G.mapId][k], has: (_, k) => k in G.Worlds[G.mapId] });
  /* Cambia de mapa; con spawn=true el jugador aparece en el punto de inicio del mapa */
  G.setMap = function (id, spawn) {
    if (!G.Worlds[id]) id = 'costa';
    G.mapId = id; if (G.S) G.S.map = id;
    Object.assign(G.WORLD, G.WORLDS_DIM[id]);
    G.BUOY_Y = id === 'costa' ? COSTA_BUOY : -1e9;
    if (id === 'valle' && G.S) { G.S.swell = 0; G.S.onPaddle = false; }
    if (G.Fish) { G.Fish.state = 'idle'; G.Fish.cur = null; if (G.Fish.rings) G.Fish.rings.length = 0; }
    if (G.UI && G.UI.fishHud) G.UI.fishHud(null);
    if (spawn && G.P) { const s = G.Worlds[id].PREP_SPAWN, f = G.Worlds[id].freshSpot ? s : G.World.freeSpot(s.x, s.y); G.P.x = f.x; G.P.y = f.y; G.P.ang = Math.PI / 2; }
    if (G.snapCam) G.snapCam();
    if (G.UI && G.UI.refreshHud) G.UI.refreshHud();
  };
})();
