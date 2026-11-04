/* Mar abierto e Isla Esmeralda: se llega navegando en barco. Playa, selva, río con cascada, laguna escondida,
   montañas, un islote con tesoro, arrecifes y un pecio hundido. Implementa la misma interfaz que G.World. */
window.G = window.G || {};

(function () {
  const U = G.U, PX = G.Pix, K = PX.K;
  const TS = 32, MW = 140, MH = 100, MPT = TS / G.PXM;       // tiles de 32 px, mapa de 140x100 tiles, 8 m por tile
  const T = { GRASS: 0, WATER: 1, PATH: 3, TREE: 4, BRIDGE: 5, SAND: 6, ROCK: 8, FLOWER: 9, MOUNT: 11 };

  /* ---------------- Peces exóticos de la isla (solo aparecen allí) ---------------- */
  (function () {
    const OB = ['orilla', 'barco'], B = ['barco'], O = ['orilla'];
    const S = (id, name, sci, rar, hab, dmin, dmax, time, modes, diff, hook, cm, kg, eurKg, shape, color, bait, o) =>
      ({ id, name, sci, rar, hab, dmin, dmax, time, modes, diff, hook, cm, kg, eurKg, shape, color, bait, isla: true, fresh: hab === 'L' || hab === 'F', ...(o || {}) });
    G.SPECIES.push(
      // arrecife (sale del barco o desde la playa)
      S('payaso', 'Pez payaso', 'Amphiprion ocellaris', 'poco', 'X', 0, 14, 'dia', OB, 14, 0, [6, 11], [.01, .04], 900, 'fish', '#ff7a1a', [1.5, .5, .3], { pat: 'hlines', desc: 'Vive entre las anémonas, que lo protegen con sus tentáculos. En el arrecife de la isla hay colonias enteras.' }),
      S('mariposa', 'Pez mariposa', 'Chaetodon auriga', 'poco', 'X', 0, 24, 'dia', OB, 18, 0, [10, 22], [.03, .2], 420, 'round', '#f4e48a', [1.4, .6, .5], { pat: 'band', desc: 'Delgado como una hoja y amarillo como el sol. Siempre nada en pareja entre los corales.' }),
      S('cirujano', 'Pez cirujano azul', 'Paracanthurus hepatus', 'raro', 'X', 2, 34, 'dia', OB, 40, 1, [15, 30], [.15, .7], 520, 'round', '#2f7ff0', [1.2, .6, .6], { desc: 'Azul eléctrico con la cola amarilla. Se esconde en las grietas del coral cuando algo lo asusta.' }),
      S('angel', 'Pez ángel emperador', 'Pomacanthus imperator', 'raro', 'X', 3, 40, 'dia', OB, 50, 2, [25, 40], [.5, 1.8], 340, 'round', '#3a6fd8', [1.0, .7, .8], { pat: 'hlines', desc: 'De joven lleva círculos blancos y de adulto, rayas doradas. Es uno de los peces más fotografiados del mundo.' }),
      S('loro_t', 'Pez loro arcoíris', 'Scarus guacamaia', 'raro', 'X', 3, 44, 'dia', OB, 52, 2, [40, 100], [1.5, 8], 110, 'fish', '#2fb5a0', [1.0, .6, 1.2], { desc: 'Muerde el coral con su pico y deja arena blanca: gran parte de las playas de la isla son obra suya.' }),
      S('leon', 'Pez león', 'Pterois volitans', 'raro', 'X', 2, 44, 'noche', OB, 48, 2, [20, 38], [.3, 1.2], 260, 'fish', '#c0392b', [.4, 1.4, 1.0], { pat: 'hlines', desc: 'Bellísimo y venenoso: sus espinas pican. De noche caza gambas entre las rocas del arrecife.' }),
      S('globo', 'Pez globo gigante', 'Arothron stellatus', 'raro', 'X', 2, 34, 'any', OB, 46, 2, [30, 90], [1, 9], 95, 'round', '#c9b98a', [.8, .6, 1.5], { pat: 'spot', desc: 'Se hincha como un balón cuando se asusta. Cuidado: su carne es peligrosa si no se prepara bien.' }),
      S('caballito', 'Caballito de mar dorado', 'Hippocampus kuda', 'epico', 'X', 0, 12, 'dia', O, 70, 3, [8, 16], [.01, .05], 4000, 'fish', '#e8b030', [1.0, .6, .3], { prot: true, desc: 'Nada en vertical y es el papá quien lleva los huevos. Una especie protegida: mejor devolverlo al agua.' }),
      S('barracuda_g', 'Barracuda gigante', 'Sphyraena barracuda', 'raro', 'X', 10, 80, 'any', OB, 58, 3, [90, 170], [5, 25], 70, 'long', '#8fa3ad', [.2, 1.8, .8], { desc: 'Una flecha plateada llena de dientes. Es curiosa y suele seguir a los buceadores a distancia.' }),
      S('napoleon', 'Pez napoleón', 'Cheilinus undulatus', 'epico', 'X', 5, 64, 'dia', OB, 78, 4, [80, 200], [12, 80], 90, 'fish', '#2f8a8a', [.4, 1.2, 1.6], { desc: 'Un gigante amable con un bulto en la frente. Puede vivir más de 30 años y es muy codiciado.' }),
      S('mero_goliat', 'Mero goliat', 'Epinephelus itajara', 'epico', 'X', 8, 70, 'any', OB, 88, 5, [100, 250], [40, 250], 60, 'fish', '#7a6a3a', [.2, 1.0, 1.8], { desc: 'El rey de los arrecifes: pesa lo que tres personas y se esconde bajo las rocas del pecio.' }),
      // mar abierto (solo en barco)
      S('manta', 'Raya manta', 'Mobula birostris', 'epico', 'O', 10, 120, 'dia', B, 80, 4, [200, 500], [120, 600], 22, 'flat', '#2a2f3a', [.2, 1.6, .6], { prot: true, desc: 'Planea como si volara. Es inofensiva y se acerca a los barcos con curiosidad. Protegida.' }),
      S('vela', 'Pez vela', 'Istiophorus platypterus', 'epico', 'O', 40, 190, 'dia', B, 86, 5, [220, 340], [40, 90], 55, 'sword', '#2d5fa8', [0, 1.8, .4], { desc: 'El pez más rápido del océano: su gran aleta dorsal parece una vela de barco.' }),
      S('marlin', 'Marlín azul', 'Makaira nigricans', 'leyenda', 'O', 70, 190, 'dia', B, 104, 5, [250, 450], [100, 500], 48, 'sword', '#1f4a8a', [0, 1.8, .2], { desc: 'El gran trofeo del mar abierto. Pelea durante horas y salta una y otra vez fuera del agua.' }),
      S('martillo', 'Tiburón martillo', 'Sphyrna lewini', 'leyenda', 'O', 50, 190, 'noche', B, 102, 5, [250, 400], [80, 300], 40, 'shark', '#6a7a88', [0, 1.8, .4], { prot: true, desc: 'Su cabeza en forma de martillo le da una visión de 360 grados. Especie en peligro: respétala.' }),
      // laguna escondida
      S('tetra', 'Tetra neón', 'Paracheirodon innesi', 'comun', 'L', 0, 15, 'dia', O, 8, 0, [3, 5], [.001, .003], 6000, 'fish', '#37c8ff', [1.5, .4, .3], { pat: 'hlines', desc: 'Una rayita azul eléctrica que brilla en la penumbra de la selva. Nada en bancos enormes.' }),
      S('piranha', 'Piraña roja', 'Pygocentrus nattereri', 'poco', 'L', 1, 25, 'any', O, 34, 1, [15, 30], [.2, 1.2], 160, 'fish', '#b83a2a', [.6, 1.6, 1.0], { desc: 'Mucho menos temible de lo que cuentan, pero su mordisco es de verdad. Aparece cuando huele sangre.' }),
      S('disco', 'Pez disco', 'Symphysodon discus', 'raro', 'L', 2, 24, 'dia', O, 46, 2, [12, 20], [.2, .6], 700, 'round', '#e0742a', [1.0, .6, .5], { pat: 'spot', desc: 'Redondo como un plato y de colores increíbles. Los coleccionistas pagan fortunas por uno.' }),
      S('arowana', 'Arowana plateada', 'Osteoglossum bicirrhosum', 'epico', 'L', 4, 40, 'dia', O, 74, 4, [60, 120], [3, 10], 220, 'long', '#d9c9a0', [.4, 1.4, .6], { desc: 'Se la llama pez dragón. Salta fuera del agua para atrapar insectos de las ramas.' }),
      S('arapaima', 'Arapaima', 'Arapaima gigas', 'leyenda', 'L', 8, 45, 'any', O, 98, 5, [180, 300], [60, 200], 45, 'long', '#6a5a4a', [.2, 1.2, 1.4], { desc: 'Uno de los peces de agua dulce más grandes del mundo. Sube a respirar aire a la superficie cada pocos minutos.' }),
      // río de la selva
      S('cichlid', 'Cíclido pavo real', 'Cichla ocellaris', 'poco', 'F', 0, 30, 'dia', O, 30, 1, [25, 50], [.5, 3], 95, 'fish', '#d9a03a', [.8, 1.6, 1.0], { desc: 'Una mancha como el ojo de un pavo real cerca de la cola. Ataca cualquier cosa que se mueva.' }),
      S('bagre', 'Bagre tigre', 'Pseudoplatystoma fasciatum', 'raro', 'F', 3, 35, 'noche', O, 56, 3, [60, 130], [5, 30], 70, 'long', '#7a6a4a', [.8, 1.2, 1.6], { pat: 'hlines', desc: 'Rayas de tigre y bigotes largos. De noche patrulla el fondo del río buscando presas.' }),
      S('anguila_e', 'Anguila eléctrica', 'Electrophorus electricus', 'epico', 'F', 5, 40, 'noche', O, 76, 4, [90, 180], [8, 20], 140, 'long', '#4a5a3a', [.8, 1.0, 1.2], { desc: 'Genera descargas de más de 600 voltios. Mejor no tocarla con las manos mojadas.' }),
      S('dorado_r', 'Dorado del río', 'Salminus brasiliensis', 'epico', 'F', 4, 40, 'dia', O, 82, 5, [60, 110], [5, 20], 130, 'fish', '#e8b030', [.4, 1.6, 1.0], { desc: 'El tigre dorado de los ríos: da saltos espectaculares y rompe hilos flojos con facilidad.' }),
    );
    G.SPECIES_BY_ID = Object.fromEntries(G.SPECIES.map(s => [s.id, s]));
    G.HAB_NAMES.X = 'Arrecife de coral';
  })();

  /* ---------------- Generación del mapa ---------------- */
  const tiles = new Uint8Array(MW * MH), wk = new Uint8Array(MW * MH), dist = new Float32Array(MW * MH), tv = new Uint8Array(MW * MH), el = new Float32Array(MW * MH), fall = new Uint8Array(MW * MH);
  const ix = (tx, ty) => ty * MW + tx;
  const inMap = (tx, ty) => tx >= 0 && ty >= 0 && tx < MW && ty < MH;
  const tileAt = (tx, ty) => (inMap(tx, ty) ? tiles[ix(tx, ty)] : T.WATER);
  const hash = PX.hash;
  const rng = U.rng(9091);
  const sm = (t) => t * t * (3 - 2 * t);
  const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi); const a = hash(xi, yi, 3), b = hash(xi + 1, yi, 3), c = hash(xi, yi + 1, 3), d = hash(xi + 1, yi + 1, 3); return U.lerp(U.lerp(a, b, fx), U.lerp(c, d, fx), fy); };
  const disc = (cx, cy, r, f) => { for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) if (inMap(x, y) && Math.hypot(x + .5 - cx, y + .5 - cy) <= r) f(x, y); };

  const ISL = { cx: 100, cy: 51, rx: 27, ry: 21 };
  const ISLET = { x: 50, y: 20, r: 6.5 };
  const HOME_DOCK = { x: 8.5, y: 48.5 };            // muelle de la Costa del Sol (tiles)
  const ISLE_DOCK = { x: 72, y: 50.5 };             // muelle de la isla
  const SUMMIT = { x: 98, y: 36 };
  const LAGOON = { x: 113, y: 57, r: 4.3 };
  const WRECK = { x: 60, y: 72 };
  const BUOY = { x: 40, y: 63 }, BOTTLE = { x: 80, y: 22 };
  const BARS = [[80, 84, 3.4], [28, 44, 2.6], [122, 16, 2.8], [66, 8, 2.4], [20, 82, 2.2]];

  const eIsland = (x, y) => { const dx = (x - ISL.cx) / ISL.rx, dy = (y - ISL.cy) / ISL.ry, a = Math.atan2(dy, dx); const wob = 1 + 0.16 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 5 + 2) + 0.06 * Math.sin(a * 9); return 1 - Math.hypot(dx, dy) / wob + (vnoise(x / 6, y / 6) - 0.5) * 0.22; };
  const eMount = (x, y) => 1.12 - Math.hypot((x - 97) / 14, (y - 41) / 10.5) + (vnoise(x / 3.5, y / 3.5) - 0.5) * 0.34;

  const lamps = [], npcs = [], palmsExtra = [];
  const huts = []; let VC = { x: 78, y: 50 };
  (function gen() {
    tiles.fill(T.WATER);
    // tierra: costa de la Costa del Sol (oeste), isla grande, islote y bancos de arena
    for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
      const i = ix(tx, ty);
      const e = eIsland(tx, ty), dxs = tx - ISLET.x, dys = ty - ISLET.y, e2 = 1 - Math.hypot(dxs, dys * 1.15) / ISLET.r + (vnoise(tx / 4, ty / 4) - 0.5) * 0.3;
      const west = tx < 4 + vnoise(ty / 5, 2) * 3;
      let bar = false; for (const [bx, by, br] of BARS) if (Math.hypot(tx - bx, ty - by) < br + (vnoise(tx / 3, ty / 3) - 0.5)) bar = true;
      if (west) { tiles[i] = tx < 3 ? T.SAND : T.GRASS; el[i] = 0.3; }
      else if (bar) { tiles[i] = T.SAND; el[i] = 0.12; }
      else if (e2 > 0.12) { tiles[i] = e2 < 0.28 ? T.SAND : T.GRASS; el[i] = e2; }
      else if (e > 0.1) { tiles[i] = e < 0.2 ? T.SAND : T.GRASS; el[i] = e; }
    }
    // montañas (con el centro más alto) y rocas sueltas alrededor
    for (let ty = 0; ty < MH; ty++) for (let tx = 90; tx < 112; tx++) {
      const i = ix(tx, ty); if (tiles[i] !== T.GRASS) continue;
      const m = eMount(tx, ty), e = eIsland(tx, ty);
      if (e > 0.3 && m > 0.5) { tiles[i] = T.MOUNT; el[i] = m; }
      else if (e > 0.28 && m > 0.34 && hash(tx, ty, 11) < 0.35) tiles[i] = T.ROCK;
    }
    // laguna escondida y río con cascada
    disc(LAGOON.x, LAGOON.y, LAGOON.r, (x, y) => { tiles[ix(x, y)] = T.WATER; wk[ix(x, y)] = 2; });
    const pts = [[95, 41], [96, 46], [100, 52], [99, 59], [102, 66], [101, 72], [103, 79]];
    for (let s = 0; s < pts.length - 1; s++) {
      const [ax, ay] = pts[s], [bx, by] = pts[s + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
      for (let i = 0; i <= n; i++) {
        const u = i / n, cx = U.lerp(ax, bx, u) + Math.sin((s + u) * 2.2) * 1.1, cy = U.lerp(ay, by, u), r = 1.25 + 0.35 * Math.sin((s + u) * 1.7) + s * 0.1;
        disc(cx, cy, r, (x, y) => { const j = ix(x, y), land = tiles[j] !== T.WATER; if (land) { tiles[j] = T.WATER; wk[j] = 1; if (y <= 47) fall[j] = 1; } });
      }
    }
    // distancia a la orilla (en tiles) para todo el agua
    const INF = 1e9;
    for (let i = 0; i < dist.length; i++) dist[i] = tiles[i] === T.WATER ? INF : 0;
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const i = ix(x, y); if (tiles[i] !== T.WATER) continue; for (const [dx, dy, w] of [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.41], [1, -1, 1.41]]) if (inMap(x + dx, y + dy)) dist[i] = Math.min(dist[i], dist[ix(x + dx, y + dy)] + w); else dist[i] = Math.min(dist[i], 60); }
      for (let y = MH - 1; y >= 0; y--) for (let x = MW - 1; x >= 0; x--) { const i = ix(x, y); if (tiles[i] !== T.WATER) continue; for (const [dx, dy, w] of [[1, 0, 1], [0, 1, 1], [1, 1, 1.41], [-1, 1, 1.41]]) if (inMap(x + dx, y + dy)) dist[i] = Math.min(dist[i], dist[ix(x + dx, y + dy)] + w); }
    }
    for (let i = 0; i < dist.length; i++) if (tiles[i] === T.WATER) dist[i] = Math.min(dist[i], 40);
    // caminos (con puentes sobre el río) y muelles
    const trail = (pts2, w) => { for (let s = 0; s < pts2.length - 1; s++) { const [ax, ay] = pts2[s], [bx, by] = pts2[s + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2); for (let i = 0; i <= n; i++) disc(U.lerp(ax, bx, i / n), U.lerp(ay, by, i / n), w, (x, y) => { const j = ix(x, y); if (tiles[j] === T.WATER) { if (wk[j] !== 0) tiles[j] = T.BRIDGE; } else tiles[j] = T.PATH; }); } };
    trail([[74, 50], [82, 50], [88, 48], [92, 45], [95, 41], [97, 38], [98, 36]], 0.95);
    trail([[90, 48], [100, 54], [108, 56]], 0.8);
    trail([[86, 50], [88, 60], [96, 69]], 0.8);
    disc(SUMMIT.x, SUMMIT.y, 2.2, (x, y) => { tiles[ix(x, y)] = T.PATH; });
    for (let x = 66; x <= 73; x++) for (const y of [50, 51]) { const j = ix(x, y); if (tiles[j] === T.WATER || tiles[j] === T.SAND) tiles[j] = T.BRIDGE; }
    for (let x = 3; x <= 12; x++) for (const y of [48, 49]) { const j = ix(x, y); if (tiles[j] === T.WATER || tiles[j] === T.SAND) tiles[j] = T.BRIDGE; }
    // aldea: justo detrás del muelle, siempre sobre tierra firme
    {
      const solid = (x, y) => { const t = tileAt(x, y); return t === T.GRASS || t === T.SAND || t === T.FLOWER || t === T.PATH; };
      const okAround = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (!solid(x + dx, y + dy)) return false; return true; };
      let vx = 74; while (vx < 96 && !okAround(vx, 50, 2)) vx++;
      VC = { x: vx + 1, y: 50 };
      for (const [ox, oy] of [[-1, -5], [4, 4], [6, -4]]) { let best = null; for (let r = 0; r < 9 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r; dx++) { const x = VC.x + ox + dx, y = VC.y + oy + dy; if (okAround(x, y, 2)) { best = { x, y }; break; } } huts.push(best || { x: VC.x + ox, y: VC.y + oy }); }
    }
    // vegetación: palmeras en la playa, selva tropical dentro, flores
    for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
      const i = ix(tx, ty); if (tiles[i] !== T.GRASS && tiles[i] !== T.SAND) continue;
      const e = el[i], nearW = (() => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (inMap(tx + dx, ty + dy) && tiles[ix(tx + dx, ty + dy)] === T.WATER && wk[ix(tx + dx, ty + dy)] !== 0) return true; return false; })();
      if (tx < 7 && ty > 44 && ty < 54) continue;
      if (Math.hypot(tx - VC.x, ty - VC.y) < 5.5) continue;
      if (Math.hypot(tx - SUMMIT.x, ty - SUMMIT.y) < 3.2) continue;
      for (const h of huts) if (Math.hypot(tx - h.x, ty - h.y) < 3.4) { tiles[i] = tiles[i] === T.SAND ? T.SAND : T.GRASS; tv[i] = 0; }
      if (tiles[i] === T.SAND) { if (hash(tx, ty, 21) < 0.035 && e > 0.1) { tiles[i] = T.TREE; tv[i] = 0; } continue; }
      let p = e > 0.34 ? 0.44 : 0.14; if (nearW) p = Math.max(p, 0.5);
      if (tx < 7) p = 0.2;
      if (rng() < p) { tiles[i] = T.TREE; tv[i] = e < 0.36 ? (rng() < 0.7 ? 0 : 2) : (rng() < 0.4 ? 0 : 1); }
      else if (rng() < 0.1) tiles[i] = T.FLOWER;
    }
    // tesoro del islote: claro con palmeras alrededor
    disc(ISLET.x, ISLET.y, 1.8, (x, y) => { const j = ix(x, y); if (tiles[j] === T.TREE || tiles[j] === T.ROCK) tiles[j] = T.GRASS; });
    npcs.push({ id: 'capitana', name: 'Capitana Marea', x: (VC.x - 1.2) * TS, y: VC.y * TS, ph: 1 });
    // luces: antorchas del muelle, aldea, cumbre, pecio
    for (const [x, y, r] of [[67.5, 50.4, 120], [72.5, 50.4, 120], [VC.x + 0.8, VC.y - 1.6, 130], [VC.x + 5, VC.y - 3.5, 90], [SUMMIT.x + 1.6, SUMMIT.y + 1.2, 110], [11.5, 48.4, 110], [ISLET.x - 1.8, ISLET.y + 1.2, 90]]) lamps.push({ x: x * TS, y: y * TS, r });
  })();

  /* ---------------- Consultas ---------------- */
  const solids = [];
  const solidAt = (x, y) => { const fy = y + 6; for (const o of solids) { if (o.w) { if (x > o.x - o.w && x < o.x + o.w && fy > o.y - o.h && fy < o.y + 4) return true; } else if (Math.hypot(x - o.x, fy - o.y) < o.r) return true; } return false; };
  const walkTile = (t) => t === T.GRASS || t === T.PATH || t === T.BRIDGE || t === T.SAND || t === T.FLOWER;
  const walkAt = (x, y) => walkTile(tileAt(Math.floor(x / TS), Math.floor(y / TS)));
  const canWalk = (x, y) => walkAt(x, y) && walkAt(x - 7, y + 5) && walkAt(x + 7, y + 5) && !solidAt(x, y);
  const seaAt = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return tx > 0 && ty > 0 && tx < MW - 1 && ty < MH - 1 && tiles[ix(tx, ty)] === T.WATER && wk[ix(tx, ty)] === 0; };
  const wreckHit = (x, y) => Math.hypot(x - WRECK.x * TS, y - WRECK.y * TS) < 78;
  const canPaddle = (x, y) => seaAt(x, y) && seaAt(x - 16, y) && seaAt(x + 16, y) && seaAt(x, y - 12) && seaAt(x, y + 12) && !wreckHit(x, y);
  function freeSpot(x, y) {
    const ok = G.S && G.S.onPaddle ? canPaddle : canWalk;
    if (ok(x, y)) return { x, y };
    for (let r = 16; r <= 480; r += 16) for (let a = 0; a < 6.28; a += 0.4) { const nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r; if (ok(nx, ny)) return { x: nx, y: ny }; }
    return { x, y };
  }
  const isWater = (x, y) => tileAt(Math.floor(x / TS), Math.floor(y / TS)) === T.WATER;
  function habitatAt(x, y) {
    const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    if (!inMap(tx, ty) || tiles[ix(tx, ty)] !== T.WATER) return { hab: 'A', depth: 0, fresh: false };
    const i = ix(tx, ty), d = dist[i];
    if (wk[i] === 1) return { hab: 'F', depth: Math.max(1, d * MPT), fresh: true };
    if (wk[i] === 2) return { hab: 'L', depth: Math.max(1, d * MPT), fresh: true };
    const dm = Math.max(1, Math.min(190, d * MPT));
    if (Math.hypot(x - WRECK.x * TS, y - WRECK.y * TS) < 200) return { hab: 'X', depth: Math.max(8, dm), fresh: false };
    if (d <= 6 && tx > 18) return { hab: 'X', depth: dm, fresh: false };
    return { hab: 'A', depth: dm, fresh: false };
  }
  const depthAt = (x, y) => habitatAt(x, y).depth;
  const validCast = (p) => isWater(p.x, p.y) && inMap(Math.floor(p.x / TS), Math.floor(p.y / TS));
  const nearWater = (P) => { for (let a = 0; a < 6.28; a += 0.8) if (isWater(P.x + Math.cos(a) * 60, P.y + Math.sin(a) * 60)) return true; return false; };
  function releasePoint(P) {
    for (let r = 20; r <= 200; r += 12) for (const da of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.4, -2.4, 3.14]) { const x = P.x + Math.cos(P.ang + da) * r, y = P.y + Math.sin(P.ang + da) * r; if (isWater(x, y)) return { x, y }; }
    return { x: P.x, y: P.y - 60 };
  }
  const nearNpc = (p) => npcs.find(n => Math.hypot(p.x - n.x, p.y - n.y) < 60) || null;
  function zoneAt(x, y) {
    const tx = x / TS, ty = y / TS, i = inMap(Math.floor(tx), Math.floor(ty)) ? ix(Math.floor(tx), Math.floor(ty)) : -1;
    let name = 'Mar abierto';
    if (i >= 0 && tiles[i] === T.WATER && wk[i] === 1) name = 'Río de la selva';
    else if (i >= 0 && tiles[i] === T.WATER && wk[i] === 2) name = 'Laguna escondida';
    else if (Math.hypot(tx - WRECK.x, ty - WRECK.y) < 7) name = 'Pecio del Albatros';
    else if (Math.hypot(tx - ISLET.x, ty - ISLET.y) < 11) name = 'Islote del Tesoro';
    else if (tx < 14) name = 'Costa del Sol · Muelle';
    else if (i >= 0 && tiles[i] !== T.WATER) {
      const m = eMount(tx, ty);
      name = m > 0.5 ? 'Montañas de la isla' : tiles[i] === T.SAND ? 'Playa de la Isla Esmeralda' : 'Selva de la Isla Esmeralda';
    } else if (Math.hypot(tx - ISL.cx, ty - ISL.cy) < 36) name = 'Arrecife de la Isla Esmeralda';
    return { name, beach: 'none', prom: 'none' };
  }
  const SPOTS = [
    { id: 'muelle', name: 'Muelle de la Costa del Sol', sub: 'Salida del barco', icon: '⚓', x: 12 * TS, y: 48.5 * TS },
    { id: 'isla', name: 'Muelle de la Isla Esmeralda', sub: 'Aldea y sendero', icon: '🏝️', x: 64 * TS, y: 50.5 * TS },
  ];
  const PREP_SPAWN = { x: 12 * TS, y: 48.5 * TS };
  const PTS = { homeDock: { x: HOME_DOCK.x * TS, y: HOME_DOCK.y * TS }, buoy: { x: BUOY.x * TS, y: BUOY.y * TS }, bottle: { x: BOTTLE.x * TS, y: BOTTLE.y * TS }, wreck: { x: WRECK.x * TS, y: WRECK.y * TS }, dock: { x: ISLE_DOCK.x * TS, y: ISLE_DOCK.y * TS }, river: { x: 99.5 * TS, y: 58 * TS }, lagoon: { x: LAGOON.x * TS, y: (LAGOON.y + 3) * TS }, summit: { x: SUMMIT.x * TS, y: SUMMIT.y * TS }, islet: { x: ISLET.x * TS, y: ISLET.y * TS } };

  /* ---------------- Dibujo ---------------- */
  const rect = (x, col, i, j, w, h) => { x.fillStyle = col; x.fillRect(i, j, w, h); };
  const dot = (x, col, i, j) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
  const MC = {};
  const MBASE = [['#8a8176', '#a39a8c', '#6a6258'], ['#948b80', '#b1a99b', '#766e63'], ['#a49f97', '#c6c1b8', '#857f77'], ['#c4bfb7', '#e6e2da', '#9b968e']];
  function mountSpr(band, v, n, so, w, e) {
    const k = band + '_' + v + '_' + (n ? 1 : 0) + (so ? 1 : 0) + (w ? 1 : 0) + (e ? 1 : 0); if (MC[k]) return MC[k];
    const [c, x] = PX.mk(16, 16), tn = PX.tone, bb = MBASE[band], vr = (hash(v, band, 3) - 0.5) * 0.1, b0 = tn(bb[0], vr), b1 = tn(bb[1], vr), b2 = tn(bb[2], vr);
    rect(x, b0, 0, 0, 16, 16);
    for (let q = 0; q < 30; q++) dot(x, hash(v, q, 5) > 0.5 ? b1 : b2, Math.floor(hash(v, q, 6) * 16), Math.floor(hash(v, q, 7) * 16));
    for (let q = 0; q < 3; q++) { const i = Math.floor(hash(v, q, 8) * 11) + 2, j = Math.floor(hash(v, q, 9) * 9) + 2; for (let r = 0; r < 4; r++) dot(x, b2, i + r, j + (r >> 1)); }
    for (let q = 0; q < 6; q++) dot(x, b1, Math.floor(hash(v, q, 12) * 14) + 1, Math.floor(hash(v, q, 13) * 10) + 1);
    if (n) { rect(x, b1, 0, 0, 16, 2); for (let i = 0; i < 16; i += 2) dot(x, b0, i, 2); }
    if (so) { rect(x, b2, 0, 11, 16, 5); rect(x, tn(bb[2], -0.25), 0, 14, 16, 2); for (let i = 1; i < 16; i += 3) { rect(x, tn(bb[2], -0.2), i, 11, 1, 3); } }
    if (w) rect(x, b1, 0, 0, 1, 16);
    if (e) { rect(x, b2, 15, 0, 1, 16); }
    return (MC[k] = c);
  }
  const PC = {};
  function palmSpr(v) {
    if (PC[v]) return PC[v];
    const W = 38, H = 46, [c, x] = PX.mk(W, H), lean = [-5, 4, 7][v % 3], bx = 17, by = 42;
    x.fillStyle = 'rgba(0,18,30,.26)'; for (let j = -2; j <= 2; j++) { const w = Math.round(9 * Math.sqrt(1 - (j * j) / 5)); x.fillRect(bx + 2 - w, by + j, w * 2, 1); }
    const topX = bx + lean, topY = 12;
    for (let j = by; j >= topY; j--) { const u = (by - j) / (by - topY), cx = Math.round(bx + lean * u * u); rect(x, '#6e4a28', cx - 1, j, 3, 1); dot(x, '#9a6a3c', cx - 1, j); if (j % 4 === 0) dot(x, '#4a2e16', cx + 1, j); }
    const cols = ['#2f9a3a', '#3fb84a', '#6fd25a'];
    const fr = [-2.9, -2.2, -1.45, -0.7, 0.0, 0.7, 1.45, 2.2, 2.9];
    fr.forEach((a0, k) => {
      const a = a0 + (v % 2) * 0.15, len = 13 + (k % 3);
      for (let s = 0; s <= len; s++) {
        const px = Math.round(topX + Math.cos(a) * s * 1.05), py = Math.round(topY + Math.sin(a) * s * 0.42 + s * s * 0.03);
        const col = cols[(k + (s > len * 0.6 ? 1 : 0)) % 3];
        dot(x, col, px, py); if (s % 2 === 0) dot(x, col, px, py + 1); if (s > 2 && s < len - 2) dot(x, cols[0], px, py + 2);
      }
    });
    dot(x, '#c9783a', topX - 1, topY + 1); dot(x, '#c9783a', topX + 1, topY + 1); dot(x, '#8a4a22', topX, topY + 2);
    return (PC[v] = { cv: c, ax: bx, ay: by });
  }
  const BC = {};
  function bottleSpr() {
    if (BC.b) return BC.b;
    const [c, x] = PX.mk(10, 14);
    rect(x, '#5ec8a0', 3, 3, 4, 9); rect(x, '#7fe0bc', 3, 3, 1, 9); rect(x, '#5ec8a0', 4, 1, 2, 2); rect(x, '#8a5a30', 4, 0, 2, 1); rect(x, '#f4e8c0', 4, 5, 2, 4); dot(x, '#c0392b', 5, 7);
    return (BC.b = { cv: c, ax: 5, ay: 12 });
  }
  function buoySpr() {
    if (BC.u) return BC.u;
    const [c, x] = PX.mk(16, 26);
    rect(x, '#d8342c', 3, 8, 10, 8); rect(x, '#f4f4f4', 3, 12, 10, 4); rect(x, '#d8342c', 5, 16, 6, 4); rect(x, '#2b2e36', 7, 2, 2, 7); rect(x, '#ffd23a', 6, 0, 4, 3); dot(x, '#ffffff', 4, 9); dot(x, '#ffffff', 5, 9);
    return (BC.u = { cv: c, ax: 8, ay: 20 });
  }
  const wreckSpr = (function () {
    let s = null;
    return () => {
      if (s) return s;
      const W = 70, H = 56, [c, x] = PX.mk(W, H);
      x.fillStyle = 'rgba(0,18,30,.3)'; x.fillRect(6, 44, 58, 6);
      // casco partido con costillas
      rect(x, '#4a301a', 6, 30, 58, 12); rect(x, '#5e3f22', 8, 28, 52, 4); rect(x, '#3a2412', 6, 40, 58, 3);
      for (let i = 0; i < 9; i++) { rect(x, '#3a2412', 10 + i * 6, 16 + (i % 3) * 3, 2, 18); dot(x, '#6e4a28', 10 + i * 6, 16 + (i % 3) * 3); }
      rect(x, '#2b1a0c', 30, 34, 10, 8);                                 // agujero
      // mástil roto
      for (let j = 0; j < 30; j++) rect(x, '#3b2412', 44 + Math.round(j * 0.25), 28 - j, 3, 1); rect(x, '#5e3f22', 44, 0, 3, 3);
      for (let k = 0; k < 6; k++) rect(x, '#d8cfae', 47 + k, 6 + k * 2, 8 - k, 1);        // jirón de vela
      for (let n = 0; n < 24; n++) dot(x, hash(n, 3, 9) > 0.5 ? '#3f8a4a' : '#2f6a3a', 6 + Math.floor(hash(n, 4, 9) * 58), 28 + Math.floor(hash(n, 5, 9) * 14));
      return (s = { cv: c, ax: 35, ay: 44 });
    };
  })();
  const hutSpr = (function () {
    const m = {};
    return (v) => {
      if (m[v]) return m[v];
      const W = 40, H = 40, [c, x] = PX.mk(W, H);
      x.fillStyle = 'rgba(0,18,30,.28)'; x.fillRect(4, 33, 34, 4);
      rect(x, '#9a6a3c', 6, 18, 28, 16); rect(x, '#7a4e2a', 6, 18, 28, 2); for (let i = 0; i < 7; i++) rect(x, '#6e4a28', 8 + i * 4, 20, 1, 14);
      rect(x, '#2b1a0c', 17, 24, 7, 10); rect(x, '#4fb0e0', 9, 22, 5, 5); rect(x, '#4fb0e0', 27, 22, 5, 5);
      const roof = v ? ['#e0b84a', '#c99a2e', '#9a7420'] : ['#d8a63a', '#bb8a26', '#8a6418'];
      for (let j = 0; j < 14; j++) { const w = 4 + j * 2.2; rect(x, roof[j % 3 === 0 ? 1 : 0], Math.round(20 - w), 4 + j, Math.round(w * 2), 1); }
      for (let j = 3; j < 18; j += 3) for (let i = 4; i < 36; i += 4) dot(x, roof[2], i + (j % 2) * 2, j + 3);
      rect(x, '#5e3f22', 19, 1, 2, 4);
      return (m[v] = { cv: c, ax: 20, ay: 34 });
    };
  })();

  /* barco del jugador: hull blanco con franja azul, cubierta de madera y cabina */
  function drawBoat(c, x, y, ang, t, moving) {
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(ang);
    const bob = Math.sin(t * 2) * 0.7;
    c.fillStyle = 'rgba(0,18,30,0.28)'; c.beginPath(); c.ellipse(4, 8, 66, 22, 0, 0, 6.3); c.fill();
    if (moving) { c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-58, s * 12); c.lineTo(-110, s * 26 + Math.sin(t * 6) * 2); c.stroke(); } c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-74, -5, 10, 10); c.fillRect(-90, -3, 8, 6); }
    c.fillStyle = '#23324a'; c.beginPath(); c.moveTo(70, 0); c.quadraticCurveTo(48, -22, -52, -19 + bob); c.lineTo(-62, -12); c.lineTo(-62, 12); c.lineTo(-52, 19 - bob); c.quadraticCurveTo(48, 22, 70, 0); c.fill();
    c.fillStyle = '#f2efe6'; c.beginPath(); c.moveTo(66, 0); c.quadraticCurveTo(46, -18, -50, -15 + bob); c.lineTo(-58, -9); c.lineTo(-58, 9); c.lineTo(-50, 15 - bob); c.quadraticCurveTo(46, 18, 66, 0); c.fill();
    c.strokeStyle = '#2a6fc4'; c.lineWidth = 4; c.beginPath(); c.moveTo(60, 0); c.quadraticCurveTo(44, -14, -48, -11); c.moveTo(60, 0); c.quadraticCurveTo(44, 14, -48, 11); c.stroke();
    c.fillStyle = '#b98a52'; c.beginPath(); c.moveTo(52, 0); c.quadraticCurveTo(38, -10, -46, -8); c.lineTo(-46, 8); c.quadraticCurveTo(38, 10, 52, 0); c.fill();
    c.strokeStyle = '#8a6234'; c.lineWidth = 1; for (let i = -40; i < 44; i += 9) { c.beginPath(); c.moveTo(i, -8); c.lineTo(i, 8); c.stroke(); }
    c.fillStyle = '#e8e4d8'; c.fillRect(-46, -9, 22, 18); c.fillStyle = '#c0392b'; c.fillRect(-48, -11, 26, 4); c.fillStyle = '#4fb0e0'; c.fillRect(-30, -6, 4, 12); c.fillRect(-42, -6, 4, 12);
    c.fillStyle = '#2b2e36'; c.fillRect(-60, -4, 5, 8);                                           // motor
    c.fillStyle = '#ffd23a'; c.fillRect(54, -1, 3, 2);                                           // luz de proa
    c.restore();
  }

  function drawGround(ctx, vis, E) {
    const t = E.t, fr = Math.floor(t * 2.5) % 4;
    ctx.imageSmoothingEnabled = false;
    const tx0 = Math.max(0, Math.floor(vis.x0 / TS)), tx1 = Math.min(MW - 1, Math.floor(vis.x1 / TS)), ty0 = Math.max(0, Math.floor(vis.y0 / TS)), ty1 = Math.min(MH - 1, Math.floor(vis.y1 / TS));
    // fuera del mapa: océano profundo
    ctx.fillStyle = '#12457a'; ctx.fillRect(vis.x0 - 40, vis.y0 - 40, vis.x1 - vis.x0 + 80, vis.y1 - vis.y0 + 80);
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const i = ix(tx, ty), tp = tiles[i], x = tx * TS, y = ty * TS, h = hash(tx, ty, 1), v = Math.floor(h * 4);
      if (tp === T.WATER || tp === T.BRIDGE) {
        const d = dist[i], kind = wk[i], shade = kind === 0 ? 1 : (d < 3 ? 0 : d < 8 ? 1 : 2);
        ctx.drawImage(PX.water(fr, shade, kind === 1 ? 1 : kind === 2 ? 2 : 0, false), x, y, TS, TS);
        if (kind === 0) {
          const u = Math.min(1, d / 13); ctx.fillStyle = 'rgba(' + Math.round(90 - 90 * u) + ',' + Math.round(240 - 218 * u) + ',' + Math.round(214 - 134 * u) + ',' + (0.42 - 0.14 * u).toFixed(2) + ')'; ctx.fillRect(x, y, TS, TS);
          if (d > 0.8 && d < 5.5 && tx > 14) {                                            // corales bajo el agua
            if (hash(tx, ty, 61) < 0.17) { const cols = ['#ff7aa8', '#ffb347', '#b57aff', '#ff5a6a', '#ffd23a']; for (let q = 0; q < 3; q++) { ctx.fillStyle = cols[Math.floor(hash(tx, ty, 62 + q) * 5)]; ctx.globalAlpha = 0.55; ctx.fillRect(x + 4 + Math.floor(hash(tx, ty, 66 + q) * 20), y + 4 + Math.floor(hash(tx, ty, 70 + q) * 20), 4 + (q % 2) * 2, 4); } ctx.globalAlpha = 1; }
          }
          if (d > 7 && hash(tx, ty, 80 + Math.floor(t * 0.5)) < 0.05) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x + 6 + Math.floor(h * 14), y + 10 + Math.floor(h * 8), 8, 2); }
        }
        const wv = Math.round(Math.sin(t * 1.8 + tx * 0.7 + ty * 0.5) * 1.5 + 1.5);
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        const isW = (a, b) => { const q = tileAt(a, b); return q === T.WATER || q === T.BRIDGE; };
        if (!isW(tx, ty - 1)) { ctx.fillRect(x, y, TS, 2); ctx.fillRect(x + ((tx * 7) % 3) * 8, y + 2, 12, wv > 1 ? 2 : 0); }
        if (!isW(tx, ty + 1)) { ctx.fillRect(x, y + TS - 2, TS, 2); ctx.fillRect(x + 4 + ((tx * 5) % 3) * 8, y + TS - 4, 12, wv > 1 ? 2 : 0); }
        if (!isW(tx - 1, ty)) { ctx.fillRect(x, y, 2, TS); ctx.fillRect(x + 2, y + 4 + ((ty * 5) % 3) * 8, wv > 1 ? 2 : 0, 12); }
        if (!isW(tx + 1, ty)) { ctx.fillRect(x + TS - 2, y, 2, TS); ctx.fillRect(x + TS - 4, y + 6 + ((ty * 3) % 3) * 8, wv > 1 ? 2 : 0, 12); }
        if (fall[i]) { ctx.fillStyle = 'rgba(255,255,255,.75)'; for (let q = 0; q < 4; q++) ctx.fillRect(x + 3 + q * 8, y + ((t * 70 + q * 11) % TS), 3, 12); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, y, TS, TS); }
        if (kind === 2 && d > 4 && hash(tx, ty, 41) < 0.14) { const lb = Math.round(Math.sin(t * 1.3 + tx)); PX.drawAt(ctx, PX.lily(Math.floor(hash(tx, ty, 42) * 6), Math.floor(t * 0.7 + tx) % 2), x + 10 + hash(tx, ty, 43) * 12, y + 14 + lb + hash(tx, ty, 44) * 8); }
        if (tp === T.BRIDGE) ctx.drawImage(PX.bridge(v), x, y, TS, TS);
        continue;
      }
      if (tp === T.MOUNT) {
        const m = el[i], band = m < 0.64 ? 0 : m < 0.8 ? 1 : m < 0.95 ? 2 : 3;
        const isM = (a2, b2) => tileAt(a2, b2) === T.MOUNT;
        ctx.drawImage(mountSpr(band, v, !isM(tx, ty - 1), !isM(tx, ty + 1), !isM(tx - 1, ty), !isM(tx + 1, ty)), x, y, TS, TS);
        continue;
      }
      let spr;
      if (tp === T.PATH) spr = PX.path(0, v); else if (tp === T.SAND) spr = PX.sand(0, v);
      else { const jungle = el[i] > 0.42 ? 1 : 0; spr = PX.grass(0, (jungle ? 1 : 0) * 4 + v); }
      ctx.drawImage(spr, x, y, TS, TS);
      if (tp === T.SAND) {                                                                // arena mojada junto al agua
        for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) if (tileAt(tx + dx, ty + dy) === T.WATER) { ctx.fillStyle = 'rgba(120,96,50,.22)'; if (dy < 0) ctx.fillRect(x, y, TS, 5); else if (dy > 0) ctx.fillRect(x, y + TS - 5, TS, 5); else if (dx < 0) ctx.fillRect(x, y, 5, TS); else ctx.fillRect(x + TS - 5, y, 5, TS); }
      }
      if (tp === T.FLOWER) ctx.drawImage(PX.flower(h > 0.5 ? 0 : 1, Math.floor(h * 17)), x + 4, y + 6, 18, 18);
      if (tp === T.GRASS && h > 0.9) PX.drawAt(ctx, PX.bush(1, v % 3), x + 16, y + 28);
    }
    // sombras de peces: se ven mejor en el arrecife
    for (const f of shadows) {
      if (f.x < vis.x0 - 60 || f.x > vis.x1 + 60 || f.y < vis.y0 - 60 || f.y > vis.y1 + 60) continue;
      const x = f.x + Math.cos(t * f.sp + f.ph) * 40, y = f.y + Math.sin(t * f.sp * 0.8 + f.ph) * 16;
      if (!isWater(x, y)) continue;
      ctx.globalAlpha = 0.5; PX.drawAt(ctx, PX.shadowFish(-Math.sin(t * f.sp + f.ph) >= 0 ? 1 : -1), x, y); if (f.big) PX.drawAt(ctx, PX.shadowFish(-Math.sin(t * f.sp + f.ph) >= 0 ? 1 : -1), x + 14, y + 4); ctx.globalAlpha = 1;
    }
  }
  const shadows = (function () { const out = [], r = U.rng(31); let n = 0, tries = 0; while (n < 110 && tries++ < 9000) { const tx = Math.floor(r() * MW), ty = Math.floor(r() * MH); if (tiles[ix(tx, ty)] === T.WATER && wk[ix(tx, ty)] === 0 && dist[ix(tx, ty)] >= 2 && tx > 14) { out.push({ x: tx * TS + 16, y: ty * TS + 16, ph: r() * 6.3, sp: 0.12 + r() * 0.16, big: r() < 0.25 }); n++; } } return out; })();

  const treeSprite = (tx, ty) => { const v = tv[ix(tx, ty)], h = hash(tx, ty, 7); return v === 1 ? PX.tree(0, 1, Math.floor(h * 3)) : palmSpr(v === 2 ? 1 + (h > 0.5 ? 1 : 0) : (h > 0.5 ? 0 : 2)); };
  const treeLayer = (ctx, vis, front) => {
    const tx0 = Math.max(0, Math.floor(vis.x0 / TS) - 1), tx1 = Math.min(MW - 1, Math.floor(vis.x1 / TS) + 1), ty0 = Math.max(0, Math.floor(vis.y0 / TS)), ty1 = Math.min(MH - 1, Math.floor(vis.y1 / TS) + 3), py = G.P.y;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (tiles[ix(tx, ty)] === T.TREE) {
      const base = (ty + 1) * TS - 2;
      if ((base > py) === front) { const h = hash(tx, ty, 8); PX.drawAt(ctx, treeSprite(tx, ty), tx * TS + 16 + (h - 0.5) * 6, base); }
      if (!front) continue;
    }
    for (const r of rocks) { if (r.x < vis.x0 - 40 || r.x > vis.x1 + 40 || r.y < vis.y0 - 40 || r.y > vis.y1 + 60) continue; if ((r.y > py) === front) PX.drawAt(ctx, PX.rock(1, r.v), r.x, r.y); }
  };
  const rocks = (function () { const out = []; for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) if (tiles[ix(tx, ty)] === T.ROCK) out.push({ x: tx * TS + 16, y: ty * TS + 28, v: (tx + ty) % 2 }); return out; })();

  const NLOOK = { capitana: { skin: '#e8b088', hair: '#c0392b', shirt: { id: 'c1', color: '#f2f2f2', color2: '#1f4a8a', style: 'stripes' }, pants: { id: 'c1', color: '#f4f4f4' }, shoes: { id: 'c1', color: '#2f6b3b', type: 'boot' }, hat: { id: 'c1', type: 'captain', color: '#1f4a8a' } } };
  function drawNpc(ctx, n, E) {
    const dx = G.P.x - n.x, dy = G.P.y - n.y, near = Math.hypot(dx, dy) < 150, dir = near ? PX.dirOf(Math.atan2(dy, dx)) : 0;
    ctx.fillStyle = 'rgba(0,18,30,.28)'; ctx.fillRect(n.x - 12, n.y + 8, 24, 5); ctx.fillRect(n.x - 8, n.y + 13, 16, 2);
    PX.drawAt(ctx, PX.person(NLOOK[n.id], dir, 0), n.x, n.y + 14 + (near ? 0 : Math.round(Math.sin(E.t * 1.6 + n.ph) * 0.6)));
    PX.worldText(ctx, n.name, n.x, n.y - 52, '#fff2c8');
  }
  const decor = [];
  for (const [kx, ky] of [[68.4, 50.7], [70.6, 51.5], [6.4, 48.6], [9.2, 49.5]]) decor.push({ s: PX.barrel, x: kx * TS, y: ky * TS }, { s: PX.crate, x: kx * TS + 18, y: ky * TS + 6 });
  for (const l of lamps) decor.push({ s: PX.lamp, x: l.x, y: l.y + 6, lamp: true });
  for (const h of huts) solids.push({ x: h.x * TS, y: h.y * TS + 20, w: 32, h: 40 });
  for (const d of decor) solids.push({ x: d.x, y: d.y, r: d.lamp ? 9 : 14 });
  const CHESTS = [{ id: 'summit', x: SUMMIT.x * TS, y: (SUMMIT.y - 0.3) * TS }, { id: 'islet', x: ISLET.x * TS, y: ISLET.y * TS }];
  for (const c of CHESTS) solids.push({ x: c.x, y: c.y + 14, r: 16 });
  for (const n of npcs) solids.push({ x: n.x, y: n.y + 6, r: 14 });
  solids.push({ x: (VC.x + 0.8) * TS, y: (VC.y + 0.6) * TS, r: 14 });
  const chestOpen = (id) => !!((G.S.island && G.S.island.chests) || {})[id];
  const objects = (front) => {
    const py = G.P.y, list = [];
    for (const d of decor) list.push([d.y, (c) => PX.drawAt(c, d.s(), d.x, d.y)]);
    for (const h of huts) list.push([h.y * TS + 20, (c) => PX.drawAt(c, hutSpr(h.x % 2), h.x * TS, h.y * TS + 20)]);
    list.push([WRECK.y * TS + 6, (c, E) => { PX.drawAt(c, wreckSpr(), WRECK.x * TS, WRECK.y * TS + 12 + Math.round(Math.sin(E.t * 1.2) * 1)); }]);
    for (const ch of CHESTS) list.push([ch.y + 14, (c, E) => { const open = chestOpen(ch.id); PX.drawAt(c, PX.chest(open), ch.x, ch.y + 14); if (!open) { const k = Math.floor(E.t * 3) % 3; c.fillStyle = '#fffbd0'; c.fillRect(ch.x + [-12, 8, -2][k], ch.y + [-12, -18, -22][k], 4, 4); } }]);
    for (const n of npcs) list.push([n.y, (c, E) => drawNpc(c, n, E)]);
    // boyas, botella
    for (const [pt, kind] of [[PTS.buoy, 'buoy'], [PTS.bottle, 'bottle']]) list.push([pt.y, (c, E) => { const b = Math.round(Math.sin(E.t * 2 + pt.x) * 2); c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(pt.x - 12, pt.y + 2 + b, 24, 2); PX.drawAt(c, kind === 'buoy' ? buoySpr() : bottleSpr(), pt.x, pt.y + 6 + b); }]);
    // barco amarrado cuando vas a pie
    if (G.S && !G.S.onPaddle && G.S.boat) { const b = G.S.boat; list.push([b.y, (c, E) => drawBoat(c, b.x, b.y, b.ang || 0, E.t, false)]); }
    return list.filter(o => (o[0] > py) === front);
  };
  function drawLand(ctx, vis, E) {
    treeLayer(ctx, vis, false);
    for (const o of objects(false)) o[1](ctx, E);
  }
  function drawTall(ctx, vis, E) {
    for (const o of objects(true)) o[1](ctx, E);
    treeLayer(ctx, vis, true);
    // hoguera de la aldea
    const fx = (VC.x + 0.8) * TS, fy = (VC.y + 0.6) * TS;
    ctx.fillStyle = '#4a3220'; ctx.fillRect(fx - 8, fy + 2, 16, 4);
    for (let k = 0; k < 3; k++) { const a = Math.sin(E.t * 9 + k * 2) * 2, hh = 10 + k * 3 + Math.round(Math.sin(E.t * 12 + k) * 2); ctx.fillStyle = ['#ff7a1a', '#ffb02a', '#ffe27a'][k]; ctx.fillRect(Math.round(fx - 6 + k * 4 + a), fy - hh + 4, 6 - k, hh); }
    ambient(ctx, vis, E);
    if (G.Island && G.Island.drawMarks) G.Island.drawMarks(ctx, E);
  }
  function ambient(ctx, vis, E) {
    const t = E.t, day = 1 - E.night;
    // peces que saltan cerca del jugador
    const gx = Math.floor(G.P.x / 320) * 320, gy = Math.floor(G.P.y / 320) * 320;
    for (let k = 0; k < 4; k++) {
      const per = 3.1 + k * 0.8, tt = t + k * 1.7, id = Math.floor(tt / per), u = (tt % per) / per;
      const x = gx - 160 + hash(id, k, 1) * 640, y = gy - 160 + hash(id, k, 2) * 640;
      if (u > 0.3 || !isWater(x, y) || dist[ix(Math.floor(x / TS), Math.floor(y / TS))] < 3) continue;
      const a = u / 0.3, hh = Math.sin(a * Math.PI) * 24;
      ctx.fillStyle = 'rgba(255,255,255,.7)'; const rr = Math.round(4 + a * 12); ctx.fillRect(Math.round(x) - rr, Math.round(y), rr * 2, 2);
      PX.drawAt(ctx, PX.fishJump(), x, y - hh);
    }
    // gaviotas y pájaros tropicales que cruzan la isla
    if (day > 0.3) for (let k = 0; k < 5; k++) {
      const span = MW * TS + 500, fx = ((t * (30 + k * 8) + k * 1300) % span) - 250, fy = 300 + hash(k, 9, 130) * (MH * TS - 600);
      for (let b = 0; b < 3; b++) {
        const x = fx - b * 26, y = fy + Math.sin(t * 0.9 + k + b) * 12 + b * 9, fl = Math.floor(t * 6 + b) % 2;
        if (x < vis.x0 - 40 || x > vis.x1 + 40 || y < vis.y0 - 80 || y > vis.y1 + 80) continue;
        ctx.fillStyle = 'rgba(0,18,30,.18)'; ctx.fillRect(Math.round(x), Math.round(y + 46), 10, 3);
        ctx.fillStyle = k % 2 ? '#f4f4f4' : '#d8342c'; if (fl) { ctx.fillRect(Math.round(x), Math.round(y), 4, 4); ctx.fillRect(Math.round(x) + 8, Math.round(y), 4, 4); ctx.fillRect(Math.round(x) + 4, Math.round(y) + 4, 4, 2); } else { ctx.fillRect(Math.round(x), Math.round(y) + 4, 4, 4); ctx.fillRect(Math.round(x) + 8, Math.round(y) + 4, 4, 4); ctx.fillRect(Math.round(x) + 4, Math.round(y), 4, 4); }
      }
    }
    // destellos del sol sobre el agua turquesa (anclados al mundo para que no se deslicen con la cámara)
    if (day > 0.4) {
      const c0 = Math.floor(vis.x0 / 480), c1 = Math.floor(vis.x1 / 480), r0 = Math.floor(vis.y0 / 480), r1 = Math.floor(vis.y1 / 480);
      for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) for (let k = 0; k < 2; k++) {
        const bx = cx * 480 + hash(cx, cy, 150 + k) * 480, by = cy * 480 + hash(cx, cy, 160 + k) * 480;
        if (!isWater(bx, by) || Math.sin(t * 1.6 + hash(cx, cy, 170 + k) * 6.3) < 0.8) continue;
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(Math.round(bx), Math.round(by), 2, 2); ctx.fillRect(Math.round(bx) - 2, Math.round(by), 6, 0);
      }
    }
    // mariposas tropicales
    if (day > 0.5) for (let i = 0; i < 40; i++) {
      const bx = 74 * TS + hash(i, 1, 90) * 52 * TS, by = 30 * TS + hash(i, 2, 91) * 40 * TS;
      if (bx < vis.x0 - 40 || bx > vis.x1 + 40 || by < vis.y0 - 40 || by > vis.y1 + 40) continue;
      const x = bx + Math.sin(t * 1.1 + i) * 22, y = by + Math.cos(t * 1.5 + i * 1.7) * 14;
      if (!walkAt(x, y)) continue;
      PX.drawAt(ctx, PX.butterfly(Math.floor(t * 7 + i) % 2, ['#ffd23a', '#ff8ab4', '#8ac8ff', '#ffa040'][i % 4]), x, y - 14 + Math.sin(t * 5 + i) * 2);
    }
    // luciérnagas de noche
    if (E.night > 0.35) for (let i = 0; i < 70; i++) {
      const bx = 74 * TS + hash(i, 3, 92) * 52 * TS, by = 30 * TS + hash(i, 4, 93) * 40 * TS;
      if (bx < vis.x0 - 40 || bx > vis.x1 + 40 || by < vis.y0 - 40 || by > vis.y1 + 40) continue;
      const x = Math.round(bx + Math.sin(t * 0.7 + i) * 26), y = Math.round(by + Math.cos(t * 0.9 + i * 1.3) * 18), bl = 0.5 + 0.5 * Math.sin(t * 2.4 + i * 2.1);
      ctx.fillStyle = `rgba(255,240,120,${0.16 * bl * E.night})`; ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.fillStyle = `rgba(255,248,170,${bl * E.night})`; ctx.fillRect(x, y, 2, 2);
    }
  }

  /* ---------------- Diálogos y cofres ---------------- */
  function talk(n) {
    const Mis = G.Island && G.Island.currentLine ? G.Island.currentLine() : '¡Bienvenido a la Isla Esmeralda!';
    G.UI.showMsg('💬 ' + n.name, Mis);
  }
  const chestReady = (id) => !chestOpen(id) || (id === 'islet' && (G.S.day - (G.S.island.chests.isletDay || -99)) >= 7);
  function openChest(id) {
    const I = G.S.island = G.S.island || {}; I.chests = I.chests || {};
    if (id === 'islet') {
      if (I.chests.islet && (G.S.day - (I.isletDay || -99)) < 7) { G.UI.toast('🧰 El cofre está vacío. Vuelve dentro de unos días: la marea siempre deja algo.', 'warn'); return; }
      I.chests.islet = 1; I.isletDay = G.S.day;
      const r = Math.random(); let msg;
      if (r < 0.5) { const n = Math.round(U.rand(300, 900)); G.S.money = Math.round((G.S.money + n) * 100) / 100; msg = '💶 ' + U.money(n); }
      else if (r < 0.85) { const n = U.randi(2, 5); G.S.gems = (G.S.gems || 0) + n; msg = '💎 ' + n + ' gemas'; }
      else { const n = U.randi(10, 20); G.S.baits.cangrejo = (G.S.baits.cangrejo || 0) + n; msg = n + ' cangrejos de cebo'; }
      G.Audio.play('gem'); G.save(); G.UI.refreshHud();
      G.UI.showMsg('🧰 ¡Tesoro del islote!', 'Entre las raíces había un viejo cofre con ' + msg + '. Aparece uno nuevo cada semana.');
      return;
    }
    if (I.chests.summit) { G.UI.toast('🧰 Ya abriste el tesoro de la cumbre.', 'warn'); return; }
    I.chests.summit = 1;
    G.S.money = Math.round((G.S.money + 3000) * 100) / 100; G.S.gems = (G.S.gems || 0) + 8; G.Audio.play('gem'); G.save(); G.UI.refreshHud();
    G.UI.showMsg('🏔️ ¡Tesoro de la cumbre!', 'Desde aquí se ve toda la isla y el mar hasta la costa. En el cofre del viejo capitán había 💶 3.000 € y 💎 8 gemas.');
  }
  const nearChest = (p) => CHESTS.find(c => Math.hypot(p.x - c.x, p.y - c.y) < 62) || null;

  /* ---------------- Mapa pequeño (para el panel de mapa) ---------------- */
  const TCOL = { 0: '#4f9a3a', 3: '#b99a62', 4: '#2f7a3a', 5: '#8a6a3a', 6: '#e8d9a2', 8: '#8a8a8a', 9: '#7cc04f' };
  function drawMap(cv) {
    const S = 4, dpr = Math.min(2, window.devicePixelRatio || 1), t = G.env.t || 0;
    cv.width = MW * S * dpr; cv.height = MH * S * dpr; cv.style.width = MW * S + 'px'; cv.style.height = MH * S + 'px';
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let ty = 0; ty < MH; ty++) for (let tx = 0; tx < MW; tx++) {
      const i = ix(tx, ty), tp = tiles[i];
      let col;
      if (tp === T.WATER) { const d = dist[i]; col = wk[i] === 1 ? '#4aa8dc' : wk[i] === 2 ? '#3a92d0' : d < 2.5 ? '#5fe0d0' : d < 6 ? '#3cc0d8' : d < 11 ? '#2a8cc8' : '#1b5fa0'; }
      else if (tp === T.MOUNT) col = el[i] < 0.64 ? '#8a8176' : el[i] < 0.8 ? '#a39a8c' : el[i] < 0.95 ? '#c0bbb2' : '#e6e2da';
      else col = TCOL[tp] || '#4f9a3a';
      c.fillStyle = col; c.fillRect(tx * S, ty * S, S, S);
    }
    const k = S / TS;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 9px system-ui';
    const lab = (txt, x, y) => { const w = c.measureText(txt).width + 6; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(x - w / 2, y - 6, w, 12); c.fillStyle = '#fff'; c.fillText(txt, x, y); };
    lab('Costa del Sol', 8 * S + 22, 44 * S); lab('Isla Esmeralda', 100 * S, 18 * S); lab('Islote del Tesoro', ISLET.x * S, (ISLET.y - 8) * S); lab('Pecio', WRECK.x * S, (WRECK.y + 6) * S);
    c.font = '13px serif';
    c.fillText('⚓', HOME_DOCK.x * S, HOME_DOCK.y * S - 8); c.fillText('🧰', SUMMIT.x * S, SUMMIT.y * S); c.fillText('🧰', ISLET.x * S, ISLET.y * S);
    c.fillText('🔴', PTS.buoy.x * k, PTS.buoy.y * k); c.fillText('🍾', PTS.bottle.x * k, PTS.bottle.y * k); c.fillText('⚓', ISLE_DOCK.x * S, ISLE_DOCK.y * S - 8); c.fillText('🏔️', 97 * S, 40 * S);
    const tg = G.Island && G.Island.target && G.Island.target();
    if (tg) { const px = tg.x * k, py = tg.y * k - 10 + Math.sin(t * 4) * 2; c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(px, py, 9, 0, 6.3); c.fill(); c.strokeStyle = '#7a5a00'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = '#4a3600'; c.font = '900 12px system-ui'; c.fillText('!', px, py + 1); }
    const bx = G.S.onPaddle || G.mapId !== 'isla' ? null : G.S.boat;
    if (bx) { c.font = '12px serif'; c.fillText('⛵', bx.x * k, bx.y * k); }
    if (G.mapId === 'isla') { const px = G.P.x * k, py = G.P.y * k; c.strokeStyle = 'rgba(255,60,60,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 8 + Math.sin(t * 5) * 2, 0, 6.3); c.stroke(); c.fillStyle = '#ff3b3b'; c.beginPath(); c.arc(px, py, 4.5, 0, 6.3); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); }
  }

  const API = {
    kind: 'isla', TS, MW, MH, tileAt: (x, y) => tileAt(Math.floor(x / TS), Math.floor(y / TS)),
    buildings: [], lamps, npcs, SPOTS, PREP_SPAWN, HOME_DOOR: { x: 0, y: 0 }, CHEST: { x: -9999, y: -9999 }, PTS,
    PADDLE_SPAWN: { x: -9999, y: -9999 }, DIVE: { x: 0, y: 0 }, DIVES: [], PIERS: [], PIER: null, ZONES: [], LANDMARKS: [],
    FENCE_L: 0, PORT_FENCE_X: 1e9, STALL_X: 0, PROM_Y1: 0,
    canWalk, canPaddle, freeSpot, habitatAt, depthAt, shoreY: () => 1e7, inPier: () => false,
    validCast, nearWater, releasePoint, shopAt: () => null, nearNpc, talk, openChest, nearChest, chestReady, zoneAt, nearestSpot: () => SPOTS[0],
    crabNear: () => null, grabCrab: () => false, wormNear: () => null, digWorms: () => 0,
    updateSchools() { }, schoolAt: () => null, swimmerAt: () => null, hitTowel: () => null, peopleNow: () => [], sunbathersNow: () => [], drawPerson: null,
    drawSea: drawGround, drawLand, drawBuoys() { }, drawTall, fishingLights() { },
    drawBoat, drawMap, ISLE_DOCK: PTS.dock,
  };
  G.Worlds = G.Worlds || {};
  API.drawPerson = (...a) => G.Worlds.costa.drawPerson(...a);
  G.Worlds.isla = API;
  G.WORLDS_DIM = G.WORLDS_DIM || {};
  G.WORLDS_DIM.isla = { w: MW * TS, h: MH * TS, shore: 1e7, buoyM: 0 };
})();
