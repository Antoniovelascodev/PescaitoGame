/* El barco: astillero del puerto, navegar hasta la Isla Esmeralda y las misiones del capitán */
window.G = window.G || {};

(function () {
  const U = G.U, UI = G.UI;
  const Island = {};
  const BOAT_PRICE = 12000;
  G.EXTRAS.push({ id: 'barco', name: 'Barco «Estrella del Sur»', price: BOAT_PRICE, icon: '⛵', ico: 'kayak', desc: 'Navega por el mar abierto hasta la Isla Esmeralda y pesca especies exóticas.' });

  const st = () => {
    const s = G.S; if (!s.island) s.island = {};
    const I = s.island;
    I.idx = I.idx || 0; I.flags = I.flags || {}; I.cnt = I.cnt || {}; I.chests = I.chests || {}; I.notified = I.notified || {}; I.base = I.base || {};
    return I;
  };
  const hasBoat = () => G.S.owned.extras.includes('barco');
  const P = () => G.P, W = () => G.Worlds.isla, PT = () => G.Worlds.isla.PTS;

  /* ---------------- Misiones del capitán ---------------- */
  const C = (k) => st().cnt[k] || 0, Fl = (k) => (st().flags[k] ? 1 : 0), Ch = (k) => (st().chests[k] ? 1 : 0);
  const MIS = [
    { id: 'bt1', title: 'Bautizo del «Estrella del Sur»', desc: 'Pesca 1 pez desde tu barco.', goal: 1, prog: () => C('boat'), reward: { money: 300 },
      story: '«¡Huele a pintura nueva y a mar abierto!» El primer pez desde cubierta trae buena suerte. Ahora a navegar de verdad.' },
    { id: 'bt2', title: 'La boya roja', desc: 'Navega hasta la boya roja, al sur del muelle.', goal: 1, prog: () => Fl('buoy'), at: 'buoy', reward: { money: 450 },
      story: 'La boya marca el límite del mar conocido. Más allá de ella, el agua cambia de color y los peces, de tamaño.' },
    { id: 'bt3', title: 'Mensaje en una botella', desc: 'Una botella flota al noreste. Recógela.', goal: 1, prog: () => Fl('bottle'), at: 'bottle', reward: { money: 600, gems: 1 },
      story: 'Dentro había un mapa mojado: «Isla Esmeralda, al este. Peces que nadie ha visto, y un cofre en la cumbre. Cuidado con el pecio del Albatros.»' },
    { id: 'bt4', title: 'El pecio del Albatros', desc: 'Pesca 3 peces desde el barco cerca del pecio hundido.', goal: 3, prog: () => C('wreck'), at: 'wreck', reward: { money: 900, gems: 2 },
      story: 'Entre las cuadernas rotas del Albatros viven meros y barracudas enormes. Un buen sitio para pescar… y para no chocar.' },
    { id: 'bt5', title: 'Tierra a la vista', desc: 'Atraca en el muelle de la Isla Esmeralda y baja a tierra.', goal: 1, prog: () => Fl('landed'), at: 'dock', reward: { money: 800, gems: 1 },
      story: 'Arena blanca, palmeras y una aldea de cabañas. La Capitana Marea te recibe con un coco fresco: «Aquí se pesca como en ningún sitio».' },
    { id: 'bt6', title: 'El río de la selva', desc: 'Pesca 3 peces en el río de la isla.', goal: 3, prog: () => C('river'), at: 'river', reward: { money: 1500 },
      story: 'El río baja de la montaña haciendo una cascada. Aquí viven bagres, cíclidos y dorados que no existen en ningún otro lugar.' },
    { id: 'bt7', title: 'La laguna escondida', desc: 'Pesca 2 peces en la laguna del interior de la isla.', goal: 2, prog: () => C('lagoon'), at: 'lagoon', reward: { money: 2200, gems: 2 },
      story: 'Agua oscura y quieta rodeada de selva. Los tetras brillan como luciérnagas y, en el fondo, algo muy grande se mueve.' },
    { id: 'bt8', title: 'La cumbre del capitán', desc: 'Sube por el sendero hasta la cumbre y abre el cofre.', goal: 1, prog: () => Ch('summit'), at: 'summit', reward: { money: 4000, gems: 8 },
      story: 'Desde la cumbre se ve toda la isla, el islote del tesoro y, muy lejos, la costa. El viejo capitán sabía elegir dónde esconder su cofre.' },
    { id: 'bt9', title: 'Colección exótica', desc: 'Pesca 5 peces exóticos de la isla (arrecife, río o laguna).', goal: 5, prog: () => C('exotic'), reward: { money: 8000, gems: 12 },
      story: 'Tu cuaderno de pesca es la envidia de todos los acuarios del Mediterráneo. FishLife pagaría una fortuna por verlo.' },
    { id: 'bt10', title: 'La gran leyenda', desc: 'Pesca un pez LEGENDARIO exótico (arapaima, marlín azul o tiburón martillo).', goal: 1, prog: () => C('legend'), reward: { money: 25000, gems: 40 },
      story: '¡Lo has conseguido! La Capitana Marea te nombra capitán honorario de la Isla Esmeralda. Tu barco ya se paga solo… y con intereses.' },
  ];
  Island.MIS = MIS;
  Island.current = () => (hasBoat() ? MIS[st().idx] || null : null);
  Island.ready = () => { const m = Island.current(); return !!m && m.prog() >= m.goal; };
  Island.claim = function () {
    const m = Island.current(); if (!m || m.prog() < m.goal) return null;
    const I = st(), r = m.reward;
    if (r.money) { G.S.money = Math.round((G.S.money + r.money) * 100) / 100; G.S.stats.earned += r.money; }
    if (r.gems) G.S.gems = (G.S.gems || 0) + r.gems;
    I.idx++; G.Audio.play(r.gems ? 'gem' : 'coin'); UI.refreshHud(); G.save();
    return m;
  };
  Island.target = function () { const m = Island.current(); return m && m.at ? PT()[m.at] : null; };
  Island.currentLine = function () {
    const m = Island.current();
    if (!m) return '¡Capitán! Has completado todas mis misiones. La isla es tuya: pesca lo que quieras.';
    return `«${m.title}»: ${m.desc} ${m.at ? 'Mira el mapa 🗺️: te marco el sitio con una "!".' : 'Sigue pescando, te irá bien.'}`;
  };

  /* ---------------- Cuentas de pesca y llegadas ---------------- */
  const landed0 = G.Fish.landed;
  G.Fish.landed = function (catchObj, source) {
    landed0.apply(this, arguments);
    if (G.mapId !== 'isla') return;
    try {
      const I = st(), sp = G.SPECIES_BY_ID[catchObj.sp], t = G.Fish.target || G.P, h = G.World.habitatAt(t.x, t.y);
      if (G.S.onPaddle) { I.cnt.boat = (I.cnt.boat || 0) + 1; const w = PT().wreck; if (Math.hypot(G.P.x - w.x, G.P.y - w.y) < 340) I.cnt.wreck = (I.cnt.wreck || 0) + 1; }
      if (h.hab === 'F') I.cnt.river = (I.cnt.river || 0) + 1;
      if (h.hab === 'L') I.cnt.lagoon = (I.cnt.lagoon || 0) + 1;
      if (sp && sp.isla) { I.cnt.exotic = (I.cnt.exotic || 0) + 1; if (sp.rar === 'leyenda') I.cnt.legend = (I.cnt.legend || 0) + 1; }
      Island.check();
    } catch (e) { /* no rompe la captura */ }
  };

  const flag = (k, msg) => { const I = st(); if (I.flags[k]) return; I.flags[k] = 1; UI.toast(msg, 'good'); G.save(); Island.check(); };
  Island.update = function () {
    if (G.mapId !== 'isla') return;
    const p = G.P, T = PT();
    if (Math.hypot(p.x - T.buoy.x, p.y - T.buoy.y) < 110) flag('buoy', '🔴 ¡Llegaste a la boya roja!');
    if (Math.hypot(p.x - T.bottle.x, p.y - T.bottle.y) < 90) flag('bottle', '🍾 ¡Recoges la botella con el mensaje!');
    if (!G.S.onPaddle && p.x > 66 * 32 && G.World.canWalk(p.x, p.y)) flag('landed', '🏝️ ¡Pisas la Isla Esmeralda!');
  };
  Island.check = function () {
    const m = Island.current(), I = st();
    if (m && Island.ready() && !I.notified[m.id]) { I.notified[m.id] = 1; UI.toast('⛵ ¡Misión del capitán «' + m.title + '» completada! Reclama el premio en Misiones', 'good'); UI.refreshHud(); }
  };

  /* ---------------- Acciones de contexto (botón verde) ---------------- */
  function depart() {
    const S = G.S;
    S.onPaddle = true; S.boat = null;
    G.setMap('isla', false);
    const sp = G.Worlds.isla.PREP_SPAWN;
    G.P.x = sp.x; G.P.y = sp.y; G.P.ang = 0;
    if (G.snapCam) G.snapCam();
    UI.toast('⛵ ¡Zarpas! Navega con el joystick. Al este te espera la Isla Esmeralda.', 'good');
    G.save();
  }
  function goHome() {
    const S = G.S;
    S.onPaddle = false; S.boat = null;
    G.setMap('costa', false);
    const f = G.World.freeSpot(2680, 1420); G.P.x = f.x; G.P.y = f.y; G.P.ang = Math.PI / 2;
    if (G.snapCam) G.snapCam();
    UI.toast('🏖️ Puerto de Fuengirola', 'good'); G.save();
  }
  function disembark() {
    const S = G.S, p = G.P, w = G.World;
    let best = null;
    for (let r = 30; r <= 150 && !best; r += 12) for (let a = 0; a < 6.28; a += 0.3) { const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r; if (w.canWalk(x, y)) { best = { x, y }; break; } }
    if (!best) { UI.toast('No hay tierra firme cerca para bajar', 'warn'); return; }
    S.boat = { x: p.x, y: p.y, ang: p.ang };
    S.onPaddle = false; p.x = best.x; p.y = best.y; p.ang = Math.atan2(best.y - S.boat.y, best.x - S.boat.x);
    UI.toast('🚶 Bajas del barco. Se queda amarrado aquí.', 'good');
  }
  function embark() {
    const S = G.S, b = S.boat; if (!b) return;
    S.onPaddle = true; G.P.x = b.x; G.P.y = b.y; G.P.ang = b.ang || 0; S.boat = null;
    UI.toast('⛵ ¡A bordo!', 'good');
  }
  function landNear(p) { const w = G.World; for (let r = 40; r <= 110; r += 14) for (let a = 0; a < 6.28; a += 0.45) if (w.canWalk(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r)) return true; return false; }
  Island.ctx = function () {
    const S = G.S, p = G.P;
    if (G.mapId === 'costa') {
      if (!S.onPaddle && p.x > 2570 && p.x < 2790 && p.y > 1340) return hasBoat()
        ? { label: '⛵ Zarpar hacia el mar', run: depart }
        : { label: '⚓ Muelle del puerto', run: () => UI.toast('⚓ Necesitas un barco: cómpralo en el Astillero, junto al muelle (12.000 €).', 'warn') };
      return null;
    }
    if (G.mapId !== 'isla') return null;
    const W2 = G.Worlds.isla, T = PT();
    if (S.onPaddle) {
      if (Math.hypot(p.x - T.homeDock.x, p.y - T.homeDock.y) < 190) return { label: '⚓ Volver a la Costa del Sol', run: goHome };
      if (landNear(p)) return { label: '🚶 Bajar a tierra', run: disembark };
      return null;
    }
    const ch = W2.nearChest(p); if (ch) return { label: '🧰 Abrir el cofre', run: () => { W2.openChest(ch.id); Island.check(); } };
    const n = W2.nearNpc(p); if (n) return { label: '💬 Hablar con ' + n.name, run: () => W2.talk(n) };
    if (S.boat && Math.hypot(p.x - S.boat.x, p.y - S.boat.y) < 100) return { label: '⛵ Subir al barco', run: embark };
    return null;
  };

  /* Baliza de la misión: haz de luz sobre el objetivo y flecha hacia él */
  Island.drawMarks = function (ctx, E) {
    const tg = Island.target(); if (!tg) return;
    const t = E.t, p = G.P, d = Math.hypot(tg.x - p.x, tg.y - p.y);
    const by = tg.y - 20 + Math.sin(t * 4) * 3;
    const g = ctx.createLinearGradient(0, tg.y - 170, 0, tg.y); g.addColorStop(0, 'rgba(255,224,90,0)'); g.addColorStop(1, 'rgba(255,224,90,.4)');
    ctx.fillStyle = g; ctx.fillRect(tg.x - 7, tg.y - 170, 14, 170);
    ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(tg.x, by - 40, 13, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#4a3600'; ctx.font = '900 17px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', tg.x, by - 39);
    if (d > 260) {
      const a = Math.atan2(tg.y - p.y, tg.x - p.x), ax = p.x + Math.cos(a) * 92, ay = p.y + Math.sin(a) * 92 - 6;
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-6, -9); ctx.lineTo(-2, 0); ctx.lineTo(-6, 9); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      G.Pix.worldText(ctx, Math.round(d / G.PXM) + ' m', ax, ay + 18, '#fff2c8');
    }
  };

  /* ---------------- Panel del astillero ---------------- */
  UI.panels.boats = {
    title: () => '⛵ Astillero · Estrella del Sur',
    body() {
      const owned = hasBoat(), S = G.S;
      let h = `<div class="card" style="margin-bottom:10px"><div class="lbl"><span>⛵ Barco de pesca «Estrella del Sur»</span><b>${U.money(BOAT_PRICE)}</b></div>
        <div class="ds" style="line-height:1.5;margin-top:6px">Un barco de verdad: casco blanco, cabina y motor. Con él puedes:<br>🌊 navegar por el mar abierto<br>🏝️ llegar a la <b>Isla Esmeralda</b>, que solo se alcanza por mar<br>🐠 pescar especies exóticas: peces del arrecife, de la selva y de la laguna, mucho más valiosos<br>🐟 pescar peces de altura (atún, pez vela, marlín…) desde cubierta<br>📜 hacer las misiones del capitán</div>
        ${owned ? `<button class="btn ghost" style="width:100%;margin-top:8px" disabled>Ya es tuyo · sal desde el muelle del puerto</button>` : `<button class="btn primary" style="width:100%;margin-top:8px" data-act="boat_buy" ${S.money >= BOAT_PRICE ? '' : 'disabled'}>Comprar por ${U.money(BOAT_PRICE)}</button>`}</div>`;
      h += `<p class="ds" style="color:var(--mut);line-height:1.5">Consejo: en la isla los peces son difíciles. Lleva buen equipo (caña, hilo y anzuelo) y mucho cebo de cangrejo y sardina.</p>`;
      return h;
    },
    act(act) {
      if (act !== 'boat_buy') return;
      const S = G.S; if (hasBoat() || S.money < BOAT_PRICE) return true;
      S.money -= BOAT_PRICE; S.owned.extras.push('barco'); G.Audio.play('buy'); UI.toast('⛵ ¡Ya tienes barco! Zarpa desde el muelle del puerto.', 'good');
      Island.check(); G.save(); UI.refreshHud(); UI.render(); return true;
    },
  };

  /* ---------------- Tarjeta en el panel de misiones ---------------- */
  const rew = (r) => [r.money ? '💶 ' + U.money(r.money) : '', r.gems ? '💎 ' + r.gems : ''].filter(Boolean).join(' · ');
  function boatCard(ms) {
    let h = `<div class="sec">⛵ Capitán</div>`;
    if (ms.boatStory) h += `<div class="card" style="margin-bottom:10px;border:1px solid #ffd36a"><div class="lbl"><span>✅ ${ms.boatStory.title}</span><span>${rew(ms.boatStory.reward)}</span></div><div class="ds" style="line-height:1.5;margin-top:6px">${ms.boatStory.story}</div></div>`;
    if (!hasBoat()) return h + `<div class="card" style="margin-bottom:10px"><div class="ds" style="line-height:1.5">Compra un barco en el <b>Astillero</b> del Puerto de Fuengirola (${U.money(BOAT_PRICE)}) y navega hasta la <b>Isla Esmeralda</b>: peces exóticos, río, laguna y montañas.</div></div>`;
    const m = Island.current();
    if (!m) return h + `<div class="card" style="margin-bottom:10px"><div class="lbl"><span>🏆 ¡Capitán honorario!</span></div><div class="ds" style="margin-top:6px">Has completado todas las misiones del barco.</div></div>`;
    const p = Math.min(m.prog(), m.goal), rd = p >= m.goal;
    return h + `<div class="card" style="margin-bottom:10px"><div class="lbl"><span>${m.title}</span><b>${p}/${m.goal}</b></div><div class="ds" style="line-height:1.45;margin-top:4px">${m.desc}</div><div class="bar" style="margin:6px 0"><i style="width:${U.clamp(p / m.goal * 100, 0, 100)}%"></i></div><div class="ds" style="color:#ffd36a;font-weight:800">Premio: ${rew(m.reward)}</div>${m.at ? `<div class="ds" style="color:var(--mut);margin-top:4px">📍 Míralo en el 🗺️ mapa de la isla</div>` : ''}${rd ? `<button class="btn primary" style="width:100%;margin-top:8px" data-act="bt_claim">🎁 Reclamar premio</button>` : ''}</div>`;
  }
  const PQ = UI.panels.quests, body0 = PQ.body, act0 = PQ.act;
  PQ.body = function (ms) {
    // la tarjeta del capitán se coloca antes de la lista de objetivos de Story
    const b = body0(ms), mark = '<div class="sec">🎯 Objetivos y desbloqueos</div>', k = b.indexOf(mark);
    const card = boatCard(ms);
    return k >= 0 ? b.slice(0, k) + card + b.slice(k) : card + b;
  };
  PQ.act = function (act, d, ms) {
    if (act === 'bt_claim') { const m = Island.claim(); if (m) ms.boatStory = { title: m.title, story: m.story, reward: m.reward }; UI.render(); Island.check(); return true; }
    return act0 ? act0(act, d, ms) : undefined;
  };

  const Q = G.Quests, check0 = Q.check, ready0 = Q.readyCount;
  Q.check = function () { check0(); Island.check(); };
  Q.readyCount = function () { return ready0() + (Island.ready() ? 1 : 0); };

  G.Island = Island;
})();
