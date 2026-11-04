/* Valle del Pescador: mapa de estilo Stardew (casa, pueblo, río, lago, estanque), estaciones y peces de agua dulce.
   Reutiliza el motor de pesca: este mundo implementa la misma interfaz que G.World (la Costa del Sol). */
window.G = window.G || {};

(function () {
  const U = G.U;
  const TS = 32, MW = 100, MH = 76;                       // tamaño de tile y del mapa (en tiles)
  const T = { GRASS: 0, WATER: 1, PATH: 3, TREE: 4, BRIDGE: 5, SAND: 6, BLDG: 7, ROCK: 8, FLOWER: 9 };
  const MPT = TS / G.PXM;                                  // metros por tile

  /* ---------------- Estaciones ---------------- */
  G.SEASONS = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
  G.SEASON_ICON = ['🌸', '☀️', '🍂', '❄️'];
  G.season = () => (G.mapId === 'valle' ? Math.floor((G.S.day - 1) / 28) % 4 : -1);
  G.dateText = () => { const d = G.S.day - 1; return G.SEASONS[Math.floor(d / 28) % 4] + ' ' + (d % 28 + 1) + (d >= 112 ? ' · año ' + (Math.floor(d / 112) + 1) : ''); };

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
    const path = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!inMap(x, y)) continue; const i = ix(x, y); tiles[i] = tiles[i] === T.WATER ? T.BRIDGE : T.PATH; } };
    path(6, 36, 86, 37);
    path(6, 34, 50, 35);                       // explanada frente a las tiendas
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
  const walkTile = (t) => t === T.GRASS || t === T.PATH || t === T.BRIDGE || t === T.SAND || t === T.FLOWER;
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

  /* ---------------- Dibujo ---------------- */
  const GRASS = [['#8dc65a', '#86be54', '#93ca60'], ['#6fb54a', '#68ac45', '#76bb50'], ['#b8a24a', '#b09a44', '#c1ab52'], ['#e4edf2', '#dbe6ec', '#eef4f7']];
  const CANOPY = [['#6fbf4a', '#f0a8c8', '#5aaa40'], ['#3f9a3a', '#4aa840', '#36883a'], ['#d9822b', '#c4562a', '#e0a93a'], ['#eef4f7', '#dbe6ec', '#cfdde6']];
  const SANDC = ['#e8d9a2', '#e6d29a', '#e0d09a', '#e8eef0'];
  function drawGround(ctx, vis, E) {
    const sn = G.season(), t = E.t;
    const tx0 = Math.max(0, Math.floor(vis.x0 / TS)), tx1 = Math.min(MW - 1, Math.floor(vis.x1 / TS)), ty0 = Math.max(0, Math.floor(vis.y0 / TS)), ty1 = Math.min(MH - 1, Math.floor(vis.y1 / TS));
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const i = ix(tx, ty), tp = tiles[i], x = tx * TS, y = ty * TS, h = hash(tx, ty, 1);
      if (tp === T.WATER) {
        const d = dist[i], r = wk[i] === 1;
        const base = sn === 3 ? [138, 190, 220] : r ? [66, 150, 200] : [46, 128, 178], k = Math.min(1, d / 60);
        ctx.fillStyle = `rgb(${base[0] - k * 18 | 0},${base[1] - k * 26 | 0},${base[2] - k * 26 | 0})`; ctx.fillRect(x, y, TS + 1, TS + 1);
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.4; ctx.beginPath();
        const ox = Math.sin(t * (r ? 1.2 : 0.6) + h * 9) * 5; ctx.moveTo(x + 5 + ox, y + 9 + h * 8); ctx.quadraticCurveTo(x + 14 + ox, y + 5 + h * 8, x + 23 + ox, y + 9 + h * 8);
        if (h > 0.5) { ctx.moveTo(x + 8 - ox, y + 22); ctx.quadraticCurveTo(x + 16 - ox, y + 18, x + 26 - ox, y + 22); } ctx.stroke();
        if (r) { ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); const fl = (t * 30 + h * 40) % 40; ctx.moveTo(x + 4, y + fl - 6); ctx.lineTo(x + 28, y + fl); ctx.stroke(); }
        // espuma en la orilla
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        if (tileAt(tx, ty - 1) !== T.WATER && tileAt(tx, ty - 1) !== T.BRIDGE) ctx.fillRect(x, y, TS, 3);
        if (tileAt(tx, ty + 1) !== T.WATER && tileAt(tx, ty + 1) !== T.BRIDGE) ctx.fillRect(x, y + TS - 3, TS, 3);
        if (tileAt(tx - 1, ty) !== T.WATER && tileAt(tx - 1, ty) !== T.BRIDGE) ctx.fillRect(x, y, 3, TS);
        if (tileAt(tx + 1, ty) !== T.WATER && tileAt(tx + 1, ty) !== T.BRIDGE) ctx.fillRect(x + TS - 3, y, 3, TS);
        continue;
      }
      if (tp === T.BRIDGE) {
        const wi = wk[i] || 1; ctx.fillStyle = sn === 3 ? '#9ec6dd' : '#3d8fc4'; ctx.fillRect(x, y, TS + 1, TS + 1);
        ctx.fillStyle = '#9b7348'; ctx.fillRect(x, y, TS, TS); ctx.fillStyle = '#b08455'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 1, y + k * 8 + 1, TS - 2, 6);
        ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(x, y, 3, TS); ctx.fillRect(x + TS - 3, y, 3, TS); void wi;
        continue;
      }
      let col;
      if (tp === T.PATH) col = sn === 3 ? '#d8d2c4' : '#d6bd8a'; else if (tp === T.SAND) col = SANDC[sn]; else col = GRASS[sn][Math.floor(h * 3)];
      ctx.fillStyle = col; ctx.fillRect(x, y, TS + 1, TS + 1);
      if (tp === T.PATH) { ctx.fillStyle = 'rgba(120,90,50,.18)'; ctx.fillRect(x + h * 20, y + 8 + h * 14, 4, 3); ctx.fillRect(x + 6 + h * 12, y + 22, 3, 3); }
      else if (tp === T.GRASS || tp === T.FLOWER || tp === T.TREE || tp === T.ROCK) {
        if (h > 0.7) { ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fillRect(x + h * 22, y + 6 + h * 10, 5, 2); }
        if (tp === T.FLOWER && sn !== 3) { const cols = sn === 2 ? ['#e0742a', '#d9a03a'] : ['#f2e052', '#ff7aa8', '#ffffff', '#8aa8ff']; ctx.fillStyle = cols[Math.floor(h * 97) % cols.length]; ctx.fillRect(x + 8, y + 10, 4, 4); ctx.fillRect(x + 20, y + 20, 4, 4); }
        if (tp === T.ROCK) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x + 17, y + 25, 12, 5, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = '#8d9096'; ctx.beginPath(); ctx.ellipse(x + 16, y + 19, 12, 9, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = '#a9adb3'; ctx.beginPath(); ctx.ellipse(x + 13, y + 16, 6, 4, 0, 0, 6.3); ctx.fill(); if (sn === 3) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x + 16, y + 13, 9, 4, 0, 0, 6.3); ctx.fill(); } }
      }
    }
  }

  function drawTree(ctx, tx, ty, sn) {
    const i = ix(tx, ty), v = tv[i], h = hash(tx, ty, 7), x = tx * TS + TS / 2 + (h - 0.5) * 6, y = (ty + 1) * TS - 2, s = 0.9 + h * 0.4;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x + 3, y, 18 * s, 6 * s, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(x - 4 * s, y - 20 * s, 8 * s, 20 * s);
    const c = CANOPY[sn];
    if (v === 1) { // pino
      const g = sn === 3 ? ['#f2f6f8', '#dde8ee', '#c9d8e0'] : ['#2f7d46', '#38904f', '#42a15a'];
      for (let k = 0; k < 3; k++) { ctx.fillStyle = g[k]; ctx.beginPath(); ctx.moveTo(x, y - 62 * s + k * 14 * s); ctx.lineTo(x + (16 + k * 5) * s, y - 20 * s + k * 4 * s - (2 - k) * 2); ctx.lineTo(x - (16 + k * 5) * s, y - 20 * s + k * 4 * s - (2 - k) * 2); ctx.closePath(); ctx.fill(); }
    } else {
      const cols = sn === 3 ? c : v === 2 && sn === 0 ? [c[1], c[0], c[1]] : sn === 2 ? c : [c[0], c[2], c[0]];
      ctx.fillStyle = cols[0]; ctx.beginPath(); ctx.arc(x, y - 36 * s, 21 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.arc(x - 9 * s, y - 28 * s, 13 * s, 0, 6.3); ctx.arc(x + 10 * s, y - 42 * s, 12 * s, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(x - 7 * s, y - 46 * s, 9 * s, 0, 6.3); ctx.fill();
    }
  }
  const treeLayer = (ctx, vis, sn, front) => {
    const tx0 = Math.max(0, Math.floor(vis.x0 / TS) - 1), tx1 = Math.min(MW - 1, Math.floor(vis.x1 / TS) + 1), ty0 = Math.max(0, Math.floor(vis.y0 / TS)), ty1 = Math.min(MH - 1, Math.floor(vis.y1 / TS) + 3), py = G.P.y;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (tiles[ix(tx, ty)] === T.TREE) { const base = (ty + 1) * TS - 2; if ((base > py) === front) drawTree(ctx, tx, ty, sn); }
  };

  const ICON_OF = { bait: 'worm', rods: 'rod', fashion: 'shirt', lonja: 'anchor', stall: 'fish', home: 'house' };
  function drawBuilding(ctx, b, E) {
    const x = b.x, y = b.y, w = b.w, h = b.h;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(x + 6, y + h - 4, w, 12);
    ctx.fillStyle = b.wall; ctx.fillRect(x, y + 34, w, h - 34);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < h - 34; k += 12) ctx.fillRect(x, y + 34 + k, w, 1);
    // tejado
    ctx.fillStyle = b.roof; ctx.beginPath(); ctx.moveTo(x - 8, y + 40); ctx.lineTo(x + 10, y); ctx.lineTo(x + w - 10, y); ctx.lineTo(x + w + 8, y + 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < w; k += 16) ctx.fillRect(x + k, y + 6, 2, 30);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + 10, y, w - 20, 5);
    // toldo
    ctx.fillStyle = b.awn; ctx.fillRect(x, y + 40, w, 12); for (let k = 0; k < w; k += 20) { ctx.fillStyle = (k / 20) % 2 ? '#fff' : b.awn; ctx.fillRect(x + k, y + 40, 20, 12); }
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x, y + 52, w, 4);
    // cartel y ventanas
    ctx.fillStyle = '#16384f'; ctx.fillRect(x + 8, y + 62, w - 16, 20); ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.label, x + w / 2, y + 72.5);
    const night = G.env.night > 0.4;
    for (const wx of [x + 14, x + w - 38]) { ctx.fillStyle = night ? '#ffd877' : '#9fd6ea'; ctx.fillRect(wx, y + 92, 24, 26); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(wx + 11, y + 92, 2, 26); ctx.fillRect(wx, y + 104, 24, 2); }
    // puerta
    const dx = x + w / 2 - 14; ctx.fillStyle = '#6b4a2b'; ctx.fillRect(dx, y + h - 46, 28, 46); ctx.fillStyle = '#8a5e36'; ctx.fillRect(dx + 3, y + h - 43, 22, 40); ctx.fillStyle = '#ffd36a'; ctx.fillRect(dx + 20, y + h - 24, 3, 4);
    G.Icons.draw(ctx, ICON_OF[b.kind] || 'anchor', x + w / 2, y + 114, 24);
    if (b.kind === 'stall') { ctx.fillStyle = '#16384f'; ctx.font = '700 9px system-ui'; }
    const bob = Math.sin(E.t * 4) * 3; ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 9, y - 22 + bob); ctx.lineTo(x + w / 2 + 9, y - 22 + bob); ctx.lineTo(x + w / 2, y - 8 + bob); ctx.closePath(); ctx.fill();
  }
  function drawNpc(ctx, n, E) {
    const dx = G.P.x - n.x, dy = G.P.y - n.y, near = Math.hypot(dx, dy) < 130, hd = near ? Math.atan2(dy, dx) : Math.PI / 2 + Math.sin(E.t * 0.5 + n.ph) * 0.4;
    G.World.drawPerson(ctx, n.x, n.y, hd, near ? 0 : E.t * 0.2, n, 1, 1.15);
    ctx.font = '700 10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(0,0,0,.55)'; const tw = ctx.measureText(n.name).width + 10; ctx.fillRect(n.x - tw / 2, n.y - 30, tw, 13); ctx.fillStyle = '#fff'; ctx.fillText(n.name, n.x, n.y - 23);
  }
  function drawChest(ctx, E) {
    const open = !chestReady(), x = CHEST.x, y = CHEST.y;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 10, 16, 6, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(x - 13, y - 6, 26, 15); ctx.fillStyle = '#a0642e'; ctx.fillRect(x - 13, y - (open ? 16 : 11), 26, open ? 6 : 7);
    ctx.fillStyle = '#ffd36a'; ctx.fillRect(x - 2, y - 4, 4, 6); ctx.fillRect(x - 13, y - 2, 26, 2);
    if (!open) { ctx.fillStyle = 'rgba(255,255,200,.9)'; const s = 3 + Math.sin(E.t * 4) * 1.5; ctx.fillRect(x + 8, y - 18 + Math.sin(E.t * 3) * 2, s, s); }
  }
  function drawLand(ctx, vis, E) {
    const sn = G.season(), py = G.P.y;
    for (const b of buildings) if (b.x + b.w > vis.x0 && b.x < vis.x1 && b.y + b.h > vis.y0 && b.y < vis.y1 && b.y + b.h <= py + 8) drawBuilding(ctx, b, E);
    treeLayer(ctx, vis, sn, false);
    drawChest(ctx, E);
    for (const n of npcs) if (n.y <= py) drawNpc(ctx, n, E);
  }
  function drawTall(ctx, vis, E) {
    const sn = G.season(), py = G.P.y;
    for (const b of buildings) if (b.x + b.w > vis.x0 && b.x < vis.x1 && b.y + b.h > vis.y0 && b.y < vis.y1 && b.y + b.h > py + 8) drawBuilding(ctx, b, E);
    for (const n of npcs) if (n.y > py) drawNpc(ctx, n, E);
    treeLayer(ctx, vis, sn, true);
    // hojas que caen en otoño y nieve en invierno
    if (sn === 2 || sn === 3) {
      ctx.fillStyle = sn === 2 ? '#e0742a' : 'rgba(255,255,255,.85)';
      for (let k = 0; k < 30; k++) { const fx = vis.x0 + ((k * 97 + E.t * (sn === 3 ? 18 : 30)) % (vis.x1 - vis.x0)), fy = vis.y0 + ((k * 53 + E.t * (sn === 3 ? 45 : 28)) % (vis.y1 - vis.y0)); ctx.fillRect(fx + Math.sin(E.t + k) * 8, fy, sn === 3 ? 3 : 4, sn === 3 ? 3 : 2); }
    }
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
