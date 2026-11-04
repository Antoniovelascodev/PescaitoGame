/* Interior de las tiendas: entras por la puerta, caminas hasta el mostrador y compras ahí */
window.G = window.G || {};

G.Interior = (function () {
  const U = G.U;
  const RW = 360, RH = 300;
  const COUNTER = { x0: 96, x1: 264, y0: 104, y1: 140 };
  const TABLES = [{ x0: 20, x1: 76, y0: 160, y1: 232 }, { x0: 284, x1: 340, y0: 160, y1: 232 }];
  const DOOR = { x0: 146, x1: 214 };
  const ROOM = { x0: 16, x1: RW - 16, y0: 80, y1: RH - 6 };

  const KINDS = {
    bait:   { title: 'EL CEBO · BÁSICOS', wall: '#cfe3c8', floor: ['#c9a679', '#bf9b6d'], awn: '#2f9e5b', shelf: ['worm', 'crab', 'sardine', 'cooler', 'lamp'], tl: 'worm', tr: 'cooler', hi: '¡Buenas! ¿Cebo fresco hoy?', go: () => G.UI.openShop('bait'), cl: { skin: 1, hair: 1, shirt: 'sh2', pants: 'pa1', shoes: 'so1', hat: 'ha0' } },
    rods:   { title: 'PESCA EL ANZUELO · CAÑAS', wall: '#cdd9ee', floor: ['#c9a679', '#bf9b6d'], awn: '#2d6fc4', shelf: ['rod', 'spool', 'hook', 'spool', 'rod'], tl: 'rod', tr: 'hook', hi: '¿Qué pez buscas, quillo?', go: () => G.UI.openShop('rods'), cl: { skin: 0, hair: 4, shirt: 'sh3', pants: 'pa2', shoes: 'so0', hat: 'ha0' } },
    spear:  { title: 'ARPÓN Y BUCEO', wall: '#f3dcc4', floor: ['#b9a98f', '#ad9d83'], awn: '#e07a2b', shelf: ['mask', 'fin', 'spear', 'wetsuit', 'trident'], tl: 'wetsuit', tr: 'mask', hi: 'Ojo con el arpón, que pincha.', go: () => G.UI.openShop('spear'), cl: { skin: 2, hair: 3, shirt: 'sh5', pants: 'pa3', shoes: 'so2', hat: 'ha0' } },
    paddle: { title: 'PADDLE SURF', wall: '#d2f0f0', floor: ['#d9c9a0', '#cfbf96'], awn: '#1fb5c4', shelf: ['board', 'wave', 'board', 'lotion', 'wave'], tl: 'board', tr: 'wave', hi: 'Tablas nuevas, ¡a remar!', go: () => G.UI.openShop('paddle'), cl: { skin: 1, hair: 2, shirt: 'sh1', pants: 'pa0', shoes: 'so3', hat: 'ha0' } },
    fashion: { title: 'MODA MARINERA', wall: '#f4e1ec', floor: ['#d8b9c6', '#cfaebb'], awn: '#c2477e', shelf: ['shirt', 'pants', 'shoe', 'cap', 'shirt'], tl: 'shirt', tr: 'pants', hi: '¡Estás guapísimo, cariño!', go: () => G.UI.open('fashion'), cl: { skin: 0, hair: 2, shirt: 'sh4', pants: 'pa4', shoes: 'so4', hat: 'ha0' } },
    lonja:  { title: 'LONJA · PROVEEDORES', wall: '#e1e9ea', floor: ['#aeb8ba', '#a3aeb0'], awn: '#2c8c6a', shelf: ['sardine', 'crab', 'cooler', 'fish', 'sardine'], tl: 'fish', tr: 'cooler', hi: 'Pescao fresco, ¿qué traes?', go: () => G.UI.open('lonja'), cl: { skin: 3, hair: 1, shirt: 'sh0', pants: 'pa1', shoes: 'so1', hat: 'ha0' } },
    animal: { title: 'ANIMALLIFE · ACUARIO', wall: '#bfe6f5', floor: ['#9fc4d4', '#94b9c9'], awn: '#1d8fc9', shelf: ['whale', 'fish', 'penguin', 'sardine', 'shell'], tl: 'penguin', tr: 'whale', tanks: true, hi: '¿Ya has visto a los pingüinos?', go: () => G.Interior.visit(), cl: { skin: 0, hair: 3, shirt: 'sh1', pants: 'pa1', shoes: 'so1', hat: 'ha0' } },
    home:   { title: 'TU CASA', home: true, wall: '#f3e8d2', floor: ['#c9a679', '#bf9b6d'], awn: '#c2477e', shelf: [], hi: '' },
    kayak:  { title: 'PUERTO · KAYAKS', wall: '#d6e4ee', floor: ['#9fb4c0', '#94a9b5'], awn: '#2a5d9e', shelf: ['kayak', 'anchor', 'buoy', 'sonar', 'kayak'], tl: 'kayak', tr: 'buoy', hi: 'Muy pronto: kayaks y sonar de peces.', go: () => G.UI.toast('🛶 Los kayaks y el sonar llegarán con el puerto. ¡Muy pronto!', 'warn'), cl: { skin: 2, hair: 0, shirt: 'sh6', pants: 'pa5', shoes: 'so1', hat: 'ha0' } },
  };

  /* Tu casa: cama, pecera, armario y álbum */
  const HOME = {
    bed: { x0: 262, x1: 342, y0: 96, y1: 186, get ctx() { return '🛏️ Dormir hasta las ' + (G.mapId === 'valle' ? '06:00' : '07:00'); }, run: () => G.Home.sleep() },
    tank: { x0: 104, x1: 256, y0: 72, y1: 108, ctx: '🐠 Abrir la pecera', run: () => G.UI.open('tank') },
    ward: { x0: 18, x1: 70, y0: 92, y1: 170, ctx: '👕 Cambiarme de ropa', run: () => G.UI.open('fashion') },
    book: { x0: 24, x1: 78, y0: 200, y1: 238, ctx: '📖 Álbum de capturas', run: () => G.UI.open('inv', 'album') },
  };
  const homeNear = () => {
    const p = I.p;
    for (const k of ['bed', 'tank', 'ward', 'book']) {
      const o = HOME[k], dx = Math.max(o.x0 - p.x, 0, p.x - o.x1), dy = Math.max(o.y0 - p.y, 0, p.y - o.y1);
      if (Math.hypot(dx, dy) < 30) return o;
    }
    return null;
  };

  const I = { active: false, kind: null, p: { x: 180, y: 262, ang: -Math.PI / 2, walk: 0, moving: false }, t: 0 };

  function enter(kind) {
    if (!KINDS[kind]) return;
    I.active = true; I.kind = kind; I.t = 0;
    I.p.x = 180; I.p.y = 262; I.p.ang = -Math.PI / 2; I.p.moving = false;
    G.Input.castHeld = false;
    G.Audio.play('click');
  }
  function leave() {
    I.active = false; I.kind = null;
    G.UI.setCtx(null); G.ctxRun = null;
    G.Audio.play('click');
  }

  const hits = (x, y) => {
    if (x < ROOM.x0 || x > ROOM.x1 || y < ROOM.y0) return true;
    if (y > ROOM.y1 && !(x > DOOR.x0 && x < DOOR.x1)) return true;
    if (I.kind === 'home') { for (const k in HOME) { const o = HOME[k]; if (x > o.x0 - 4 && x < o.x1 + 4 && y > o.y0 - 4 && y < o.y1 + 4) return true; } return false; }
    if (x > COUNTER.x0 - 6 && x < COUNTER.x1 + 6 && y > COUNTER.y0 - 8 && y < COUNTER.y1 + 4) return true;
    for (const t of TABLES) if (x > t.x0 - 6 && x < t.x1 + 6 && y > t.y0 - 6 && y < t.y1 + 6) return true;
    return false;
  };
  const nearCounter = () => I.p.y > COUNTER.y1 && I.p.y < COUNTER.y1 + 42 && I.p.x > COUNTER.x0 - 10 && I.p.x < COUNTER.x1 + 10;

  function update(dt) {
    const In = G.Input, p = I.p, K = KINDS[I.kind];
    I.t += dt;
    In.update();
    p.moving = false;
    if (In.mag > 0) {
      const sp = 120 * In.mag;
      const nx = p.x + In.x * sp * dt, ny = p.y + In.y * sp * dt;
      if (!hits(nx, p.y)) p.x = nx;
      if (!hits(p.x, ny)) p.y = ny;
      p.ang = Math.atan2(In.y, In.x); p.moving = true; p.walk += dt * 10 * In.mag;
    }
    if (p.y > RH - 4) { leave(); return; }
    if (K.home) {
      const o = homeNear();
      if (o) { G.ctxRun = o.run; G.UI.setCtx(o.ctx); }
      else if (p.y > RH - 40 && p.x > DOOR.x0 - 20 && p.x < DOOR.x1 + 20) { G.ctxRun = leave; G.UI.setCtx('🚪 Salir de casa'); }
      else { G.ctxRun = null; G.UI.setCtx(null); }
      G.UI.syncButtons();
      return;
    }
    if (nearCounter()) { G.ctxRun = K.go; G.UI.setCtx('🛒 Comprar en el mostrador'); }
    else if (p.y > RH - 40 && p.x > DOOR.x0 - 20 && p.x < DOOR.x1 + 20) { G.ctxRun = leave; G.UI.setCtx('🚪 Salir de la tienda'); }
    else { G.ctxRun = null; G.UI.setCtx(null); }
    G.UI.syncButtons();
  }

  function draw(ctx, vw, vh, dpr) {
    const K = KINDS[I.kind]; if (!K) return;
    const s = Math.min((vw * 0.97) / RW, (vh * 0.56) / RH), ox = (vw - RW * s) / 2, oy = Math.max(vh * 0.21, 150);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#17110c'; ctx.fillRect(0, 0, vw, vh);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, ox * dpr, oy * dpr);
    if (K.home) { drawHome(ctx); return; }
    // suelo
    for (let y = 0; y < RH; y += 24) for (let x = 0; x < RW; x += 24) { ctx.fillStyle = K.floor[((x + y) / 24) % 2]; ctx.fillRect(x, y, 24, 24); }
    // pared del fondo y estanterías
    ctx.fillStyle = K.wall; ctx.fillRect(0, 0, RW, 72);
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, 68, RW, 8);
    ctx.fillStyle = K.awn; ctx.fillRect(0, 0, RW, 16);
    for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? '#fff' : K.awn; ctx.fillRect(i * 20, 0, 20, 12); }
    ctx.fillStyle = '#fff'; ctx.font = '800 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(RW / 2 - 118, 18, 236, 16);
    ctx.fillStyle = '#fff'; ctx.fillText(K.title, RW / 2, 26.5);
    for (let i = 0; i < K.shelf.length; i++) {
      const x = 22 + i * 63;
      ctx.fillStyle = '#7a5230'; ctx.fillRect(x - 4, 56, 52, 5);
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x - 4, 61, 52, 3);
      if (!K.tanks) G.Icons.draw(ctx, K.shelf[i], x + 22, 42, 32);
    }
    if (K.tanks) {
      for (let i = 0; i < 4; i++) {
        const tx = 20 + i * 83, g = ctx.createLinearGradient(0, 36, 0, 66); g.addColorStop(0, '#5cc4ee'); g.addColorStop(1, '#1a6fa8');
        ctx.fillStyle = '#2a3a48'; ctx.fillRect(tx - 3, 34, 70, 36); ctx.fillStyle = g; ctx.fillRect(tx, 37, 64, 30);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let b = 0; b < 3; b++) { ctx.beginPath(); ctx.arc(tx + 10 + b * 20, 64 - ((I.t * 9 + b * 11 + i * 5) % 26), 1.6, 0, 6.3); ctx.fill(); }
        G.Icons.draw(ctx, K.shelf[i], tx + 32 + Math.sin(I.t * 0.8 + i) * 12, 52 + Math.sin(I.t * 1.3 + i) * 3, 24);
      }
    }
    // mesas de producto
    for (let i = 0; i < 2; i++) {
      const T = TABLES[i];
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(T.x0 + 3, T.y0 + 5, T.x1 - T.x0, T.y1 - T.y0);
      ctx.fillStyle = '#8a5a34'; ctx.fillRect(T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0);
      ctx.fillStyle = '#a06c40'; ctx.fillRect(T.x0 + 3, T.y0 + 3, T.x1 - T.x0 - 6, T.y1 - T.y0 - 6);
      const e = i ? K.tr : K.tl;
      for (let k = 0; k < 3; k++) G.Icons.draw(ctx, e, (T.x0 + T.x1) / 2, T.y0 + 15 + k * 22, 24);
    }
    // dependiente tras el mostrador
    const bob = Math.sin(I.t * 2) * 0.8;
    ctx.save(); ctx.translate(180, 92 + bob); ctx.scale(G.PS * 1.25, G.PS * 1.25);
    const CL = G.Char.lookOf(K.cl), co = { ang: Math.PI / 2, walk: 0, moving: false };
    G.Char.legs(ctx, CL, co); G.Char.body(ctx, CL, { ...co, hands: null, twist: 0 });
    ctx.restore();
    // mostrador
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(COUNTER.x0 + 3, COUNTER.y0 + 5, COUNTER.x1 - COUNTER.x0, COUNTER.y1 - COUNTER.y0);
    ctx.fillStyle = '#6e4526'; ctx.fillRect(COUNTER.x0, COUNTER.y0, COUNTER.x1 - COUNTER.x0, COUNTER.y1 - COUNTER.y0);
    ctx.fillStyle = '#b57a46'; ctx.fillRect(COUNTER.x0, COUNTER.y0, COUNTER.x1 - COUNTER.x0, 14);
    ctx.fillStyle = '#2a2018'; ctx.fillRect(COUNTER.x0 + 70, COUNTER.y0 + 2, 26, 10);
    ctx.font = '12px serif'; ctx.fillStyle = '#000'; ctx.fillText('💶', COUNTER.x0 + 83, COUNTER.y0 + 8);
    // puerta
    ctx.fillStyle = '#3b2a1c'; ctx.fillRect(DOOR.x0 - 4, RH - 8, DOOR.x1 - DOOR.x0 + 8, 8);
    ctx.fillStyle = 'rgba(255,240,180,0.55)'; ctx.fillRect(DOOR.x0, RH - 6, DOOR.x1 - DOOR.x0, 6);
    ctx.font = '700 9px system-ui'; ctx.fillStyle = '#5a3b22'; ctx.fillText('SALIDA', 180, RH - 14);
    // jugador
    const p = I.p, L = G.Char.lookOf();
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(G.PS * 1.25, G.PS * 1.25);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(3, 6, 15, 12, 0, 0, 6.3); ctx.fill();
    G.Char.legs(ctx, L, { ang: p.ang, walk: p.walk, moving: p.moving, seated: false });
    G.Char.body(ctx, L, { ang: p.ang, walk: p.walk, moving: p.moving, hands: null, twist: 0 });
    ctx.restore();
    // saludo del dependiente
    if (nearCounter()) {
      const w = Math.min(RW - 20, K.hi.length * 5.6 + 18);
      ctx.fillStyle = '#fff'; ctx.fillRect(180 - w / 2, 60, w, 15);
      ctx.fillStyle = '#16384f'; ctx.font = '700 9px system-ui'; ctx.fillText(K.hi, 180, 68);
    }
  }

  function drawHome(ctx) {
    const t = I.t, night = G.env.night > 0.5, B = HOME;
    const box = (o, col) => { ctx.fillStyle = col; ctx.fillRect(o.x0, o.y0, o.x1 - o.x0, o.y1 - o.y0); };
    // suelo de madera y pared
    for (let y = 0; y < RH; y += 24) for (let x = 0; x < RW; x += 24) { ctx.fillStyle = KINDS.home.floor[((x + y) / 24) % 2]; ctx.fillRect(x, y, 24, 24); }
    ctx.fillStyle = KINDS.home.wall; ctx.fillRect(0, 0, RW, 72);
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, 68, RW, 8);
    ctx.fillStyle = '#c2477e'; ctx.fillRect(0, 0, RW, 8);
    // alfombra
    ctx.fillStyle = '#b5524a'; ctx.beginPath(); ctx.ellipse(180, 200, 74, 30, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#e6c9a0'; ctx.beginPath(); ctx.ellipse(180, 200, 58, 21, 0, 0, 6.3); ctx.fill();
    // ventana al mar
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(274, 14, 66, 46);
    const sky = ctx.createLinearGradient(0, 17, 0, 57); sky.addColorStop(0, night ? '#10203e' : '#8fd4f2'); sky.addColorStop(1, night ? '#0a1a33' : '#2d97cf');
    ctx.fillStyle = sky; ctx.fillRect(277, 17, 60, 40);
    ctx.fillStyle = night ? '#1a3358' : '#3aa6d8'; ctx.fillRect(277, 38, 60, 19);
    if (night) { ctx.fillStyle = '#fff'; ctx.fillRect(290, 24, 2, 2); ctx.fillRect(318, 28, 2, 2); } else { ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(322, 27, 5, 0, 6.3); ctx.fill(); }
    ctx.fillStyle = '#6b4a2b'; ctx.fillRect(306, 17, 2, 40); ctx.fillRect(277, 36, 60, 2);
    // cuadro y cartel
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(RW / 2 - 40, 10, 80, 0);
    // pecera en la pared
    ctx.fillStyle = '#2a3a48'; ctx.fillRect(100, 12, 160, 60);
    const wg = ctx.createLinearGradient(0, 15, 0, 68); wg.addColorStop(0, '#6fd0f2'); wg.addColorStop(1, '#1a6fa8');
    ctx.fillStyle = wg; ctx.fillRect(104, 16, 152, 52);
    ctx.fillStyle = '#d9c9a0'; ctx.fillRect(104, 62, 152, 6);
    ctx.fillStyle = '#2f9e5b'; for (const px of [112, 130, 232, 246]) { ctx.beginPath(); ctx.moveTo(px, 62); ctx.quadraticCurveTo(px + 4 + Math.sin(t + px) * 3, 50, px, 40); ctx.lineTo(px + 3, 40); ctx.quadraticCurveTo(px + 8, 50, px + 4, 62); ctx.fill(); }
    ctx.save(); ctx.beginPath(); ctx.rect(104, 16, 152, 52); ctx.clip();
    const fish = (G.S.tank || []).slice(0, 14);
    fish.forEach((f, i) => {
      const sp = G.SPECIES_BY_ID[f.sp]; if (!sp) return;
      const sz = 5 + Math.min(9, f.cm / 7), sp2 = 0.22 + (i % 5) * 0.06, ph = i * 1.9;
      const x = 108 + sz + (Math.sin(t * sp2 + ph) + 1) / 2 * (144 - sz * 2), dir = Math.cos(t * sp2 + ph) >= 0 ? 1 : -1;
      const y = 24 + (i % 4) * 9 + Math.sin(t * 1.3 + i) * 2;
      ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
      ctx.fillStyle = sp.color || '#ccc'; ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.45, 0, 0, 6.3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-sz * 0.8, 0); ctx.lineTo(-sz * 1.5, -sz * 0.45); ctx.lineTo(-sz * 1.5, sz * 0.45); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(sz * 0.45, -sz * 0.18, 1.8, 1.8);
      ctx.restore();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let b = 0; b < 4; b++) { ctx.beginPath(); ctx.arc(120 + b * 40, 64 - ((t * 9 + b * 13) % 46), 1.6, 0, 6.3); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(108, 18, 8, 46);
    ctx.fillStyle = '#6e4526'; ctx.fillRect(B.tank.x0, 72, B.tank.x1 - B.tank.x0, 36); ctx.fillStyle = '#8a5a34'; ctx.fillRect(B.tank.x0, 72, B.tank.x1 - B.tank.x0, 6);
    ctx.fillStyle = '#fff'; ctx.font = '800 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🐠 ' + (G.S.tank || []).length + '/' + G.Home.tankCap(), 180, 92);
    // armario
    box(B.ward, '#7a5230'); ctx.fillStyle = '#946a3f'; ctx.fillRect(B.ward.x0 + 3, B.ward.y0 + 3, 21, 72); ctx.fillRect(B.ward.x0 + 28, B.ward.y0 + 3, 21, 72);
    ctx.fillStyle = '#ffd36a'; ctx.fillRect(B.ward.x0 + 20, B.ward.y0 + 36, 3, 8); ctx.fillRect(B.ward.x0 + 28, B.ward.y0 + 36, 3, 8);
    // cama
    box(B.bed, '#5a3b22'); ctx.fillStyle = '#f2f2f2'; ctx.fillRect(B.bed.x0 + 3, B.bed.y0 + 3, 74, 30);
    ctx.fillStyle = '#fff'; ctx.fillRect(B.bed.x0 + 8, B.bed.y0 + 8, 30, 20); ctx.fillRect(B.bed.x0 + 42, B.bed.y0 + 8, 30, 20);
    ctx.fillStyle = '#2f7fd0'; ctx.fillRect(B.bed.x0 + 3, B.bed.y0 + 34, 74, 54);
    ctx.fillStyle = '#4a96e0'; for (let i = 0; i < 4; i++) ctx.fillRect(B.bed.x0 + 3, B.bed.y0 + 42 + i * 13, 74, 5);
    // mesita con el álbum
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(B.book.x0 + 3, B.book.y0 + 4, 54, 38);
    box(B.book, '#8a5a34'); ctx.fillStyle = '#a06c40'; ctx.fillRect(B.book.x0 + 3, B.book.y0 + 3, 48, 32);
    ctx.fillStyle = '#2d6fc4'; ctx.fillRect(B.book.x0 + 12, B.book.y0 + 8, 30, 22); ctx.fillStyle = '#fff'; ctx.fillRect(B.book.x0 + 14, B.book.y0 + 10, 12, 18); ctx.fillRect(B.book.x0 + 28, B.book.y0 + 10, 12, 18);
    // puerta
    ctx.fillStyle = '#3b2a1c'; ctx.fillRect(DOOR.x0 - 4, RH - 8, DOOR.x1 - DOOR.x0 + 8, 8);
    ctx.fillStyle = 'rgba(255,240,180,0.55)'; ctx.fillRect(DOOR.x0, RH - 6, DOOR.x1 - DOOR.x0, 6);
    ctx.font = '700 9px system-ui'; ctx.fillStyle = '#5a3b22'; ctx.fillText('SALIDA', 180, RH - 14);
    // jugador
    const p = I.p, L = G.Char.lookOf();
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(G.PS * 1.25, G.PS * 1.25);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(3, 6, 15, 12, 0, 0, 6.3); ctx.fill();
    G.Char.legs(ctx, L, { ang: p.ang, walk: p.walk, moving: p.moving, seated: false });
    G.Char.body(ctx, L, { ang: p.ang, walk: p.walk, moving: p.moving, hands: null, twist: 0 });
    ctx.restore();
  }

  let seen = false;
  function visit() {
    const facts = ['🐧 Los pingüinos de Humboldt viven en las costas frías de Chile y Perú.', '🐢 Las tortugas bobas del Mediterráneo anidan en playas tranquilas, como las de Andalucía.', '🦈 En el Mediterráneo viven más de 40 especies de tiburones y rayas.', '🐙 Un pulpo tiene tres corazones y puede abrir un tarro por dentro.'];
    G.UI.toast(U.pick(facts), 'good');
    if (!G.S.cnt) G.S.cnt = {};
    if (!G.S.cnt.animal) { G.S.cnt.animal = 1; G.S.gems = (G.S.gems || 0) + 1; G.UI.toast('💎 +1 gema por tu primera visita a AnimalLife', 'good'); G.UI.refreshHud(); }
  }
  return { visit, get active() { return I.active; }, enter, leave, update, draw, KINDS };
})();
