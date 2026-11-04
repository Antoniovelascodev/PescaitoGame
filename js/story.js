/* Historia con dos caminos (FishLife o Naturalistas), mapa de las dos zonas y paso a pie entre el Valle y la Costa del Sol */
window.G = window.G || {};

(function () {
  const U = G.U, UI = G.UI;
  const Story = {};

  const st = () => {
    const s = G.S; if (!s.story) s.story = {};
    const q = s.story;
    q.path = q.path || null; q.idx = Object.assign({ pr: 0, fl: 0, na: 0 }, q.idx); q.base = q.base || {}; q.notified = q.notified || {};
    q.fl = q.fl || {}; q.fl.cnt = Object.assign({ raro: 0, epico: 0, leyenda: 0 }, q.fl.cnt); q.fl.fish = q.fl.fish || [];
    q.nat = q.nat || {}; q.nat.healed = q.nat.healed || 0; q.nat.fish = q.nat.fish || [];
    return q;
  };
  const STAT = { fish: () => G.S.stats.fish || 0, trash: () => G.S.stats.trash || 0, released: () => G.S.stats.released || 0 };
  const WHERE = { fishlife: 'FishLife (Benalmádena, en la Costa del Sol)', nature: 'Naturalistas (Benalmádena, en la Costa del Sol)' };
  const INCOME = [0, 20, 60, 140, 320, 700];

  const TRACKS = {
    pr: [
      { id: 'pr1', title: 'Tu primer día', desc: 'Pesca 3 peces.', stat: 'fish', goal: 3, reward: { money: 40 },
        story: '«¡Bien, grumete! Hace años aquí había peces de todos los colores. Sigue pescando y verás cómo está el mar.»' },
      { id: 'pr2', title: 'Algo no huele bien', desc: 'Pesca 2 basuras del mar (a veces pican latas, bolsas o vapers).', stat: 'trash', goal: 2, reward: { money: 50 },
        story: '«¿Lo ves? Latas, plásticos, vapers… El mar está sucio y los peces lo notan. Hay gente que quiere arreglarlo, cada uno a su manera.»' },
      { id: 'pr3', title: 'Conoce a la gente', desc: 'Pesca 8 peces más para ganarte la confianza del pueblo.', stat: 'fish', goal: 8, reward: { money: 80, gems: 2 },
        story: '«Ya eres de aquí. Camino al este del valle, en la Costa del Sol, hay dos grupos que necesitan ayuda: el acuario FishLife, que se cae a trozos y quiere recuperar sus peces, y los Naturalistas, que rescatan peces heridos y limpian la costa. Solo puedes elegir un camino.»' },
    ],
    fl: [
      { id: 'fl1', title: 'Cartel de reapertura', desc: 'Entrega 2 peces RAROS en FishLife.', cnt: ['raro', 2], where: 'fishlife', reward: { money: 250, gems: 1 },
        story: 'Los tanques empiezan a tener vida otra vez. «¡Mira cómo se mueven! Con esto ya podemos limpiar los cristales y poner un cartel.»' },
      { id: 'fl2', title: 'Más especies', desc: 'Entrega 5 peces RAROS en total.', cnt: ['raro', 5], where: 'fishlife', reward: { money: 600, gems: 2 },
        story: 'Vuelven las primeras visitas. Los niños pegan la nariz al cristal y el agua ya es más clara.' },
      { id: 'fl3', title: 'El primer épico', desc: 'Entrega 1 pez ÉPICO.', cnt: ['epico', 1], where: 'fishlife', reward: { money: 1500, gems: 3 },
        story: '«¡Un ejemplar así no se ve todos los días!» El acuario sale en el periódico local y llegan turistas de Fuengirola.' },
      { id: 'fl4', title: 'Atracción estrella', desc: 'Entrega 3 peces ÉPICOS en total.', cnt: ['epico', 3], where: 'fishlife', reward: { money: 4000, gems: 8 },
        story: 'Los tanques grandes se llenan. Aparece una ballena en el cartel y FishLife vuelve a ser el orgullo de Benalmádena.' },
      { id: 'fl5', title: 'La leyenda del Mediterráneo', desc: 'Entrega 1 pez LEGENDARIO.', cnt: ['leyenda', 1], where: 'fishlife', reward: { money: 12000, gems: 25 },
        story: '¡FishLife reabre a lo grande! Hay cola hasta la playa. Has devuelto la vida al acuario y el pueblo te lo agradece. Las entradas de cada día son ahora tu recompensa.' },
    ],
    na: [
      { id: 'na1', title: 'Manos limpias', desc: 'Recoge 5 basuras del mar.', stat: 'trash', goal: 5, reward: { money: 150 },
        story: '«Cada lata menos es un pez que respira mejor.» Los voluntarios te dan la bienvenida con bocadillos de calamares.' },
      { id: 'na2', title: 'Devuélvelos al mar', desc: 'Suelta 5 peces vivos de vuelta al agua.', stat: 'released', goal: 5, reward: { money: 200, gems: 1 },
        story: 'Los naturalistas anotan tus liberaciones. «Un pez que vuelve al agua es un pez que cría.»' },
      { id: 'na3', title: 'Primeros auxilios', desc: 'Lleva 3 peces heridos 🩹 al centro de rescate.', heal: 3, where: 'nature', reward: { money: 500, gems: 2 },
        story: 'Las piscinas de recuperación huelen a algas limpias. «Dentro de una semana nadarán como nuevos.»' },
      { id: 'na4', title: 'Costa limpia', desc: 'Recoge 20 basuras del mar.', stat: 'trash', goal: 20, reward: { money: 1200, gems: 4 },
        story: 'El agua se ve más clara desde el espigón. Los voluntarios te regalan un cubo de gusanos cada mañana.' },
      { id: 'na5', title: 'El gran rescate', desc: 'Lleva 10 peces heridos en total al centro de rescate.', heal: 10, where: 'nature', reward: { money: 3500, gems: 15 },
        story: '¡Lo has conseguido! Eres oficialmente miembro de honor de los Naturalistas. La costa respira, y tú también.' },
    ],
  };

  const prog = (m) => { const q = st(); if (m.stat) return Math.max(0, STAT[m.stat]() - (q.base[m.id] == null ? 0 : q.base[m.id])); if (m.cnt) return q.fl.cnt[m.cnt[0]]; if (m.heal) return q.nat.healed; return 0; };
  const goal = (m) => m.goal || (m.cnt && m.cnt[1]) || m.heal;
  const keyOf = (m) => m.id.slice(0, 2);

  Story.current = function () {
    const q = st();
    let m = null;
    if (q.idx.pr < TRACKS.pr.length) m = TRACKS.pr[q.idx.pr];
    else if (q.path) m = TRACKS[q.path][q.idx[q.path]] || null;
    if (m && m.stat && q.base[m.id] == null) q.base[m.id] = STAT[m.stat]();
    return m;
  };
  Story.needsChoice = () => { const q = st(); return q.idx.pr >= TRACKS.pr.length && !q.path; };
  Story.ready = () => { const m = Story.current(); return !!m && prog(m) >= goal(m); };
  Story.flLevel = () => { const q = st(); return q.path === 'fl' ? q.idx.fl : 0; };
  Story.flFish = () => st().fl.fish;
  Story.naLevel = () => { const q = st(); return q.path === 'na' ? q.idx.na : 0; };
  Story.tankInfo = (kind) => {
    const q = st();
    if (kind === 'fl') return { fish: q.fl.fish.slice(-12), clean: Story.flLevel() / 5 };
    return { fish: q.nat.fish.slice(-8), clean: Story.naLevel() / 5 };
  };
  Story.target = function () {
    if (Story.needsChoice()) return 'fishlife';
    const m = Story.current();
    return m && m.where || null;
  };

  Story.claim = function () {
    const m = Story.current(); if (!m || prog(m) < goal(m)) return null;
    const q = st(), r = m.reward;
    if (r.money) { G.S.money = Math.round((G.S.money + r.money) * 100) / 100; G.S.stats.earned += r.money; }
    if (r.gems) G.S.gems = (G.S.gems || 0) + r.gems;
    q.idx[keyOf(m)]++;
    Story.current();
    G.Audio.play(r.gems ? 'gem' : 'coin'); UI.refreshHud(); G.save();
    return m;
  };

  /* Cada día nuevo: entradas de FishLife y gusanos de los naturalistas */
  function dailyPay() {
    const q = st(), d = G.S.day;
    if (q.lastDay == null) { q.lastDay = d; return; }
    if (d <= q.lastDay) return;
    const n = Math.min(d - q.lastDay, 3); q.lastDay = d;
    const inc = INCOME[Story.flLevel()] * n;
    if (inc > 0) { G.S.money = Math.round((G.S.money + inc) * 100) / 100; G.S.stats.earned += inc; UI.toast('🐠 Entradas de FishLife: +' + U.money(inc), 'good'); }
    const w = Story.naLevel() * 3 * n;
    if (w > 0) { G.S.baits.gusano = (G.S.baits.gusano || 0) + w; UI.toast('🌿 Los naturalistas te regalan ' + w + ' gusanos', 'good'); }
  }

  Story.check = function () {
    const q = st(), m = Story.current();
    dailyPay();
    if (m && Story.ready() && !q.notified[m.id]) { q.notified[m.id] = 1; UI.toast('📜 ¡Historia: «' + m.title + '» completada! Reclama el premio en Misiones', 'good'); UI.refreshHud(); }
    if (Story.needsChoice() && !q.notified.choice) { q.notified.choice = 1; UI.toast('📜 Elige tu camino en Misiones: FishLife o Naturalistas', 'good'); UI.refreshHud(); }
  };

  /* Se engancha al sistema de misiones que ya existe */
  const Q = G.Quests;
  const check0 = Q.check, ready0 = Q.readyCount;
  Q.check = function () { check0(); Story.check(); };
  Q.readyCount = function () { return ready0() + (Story.ready() || Story.needsChoice() ? 1 : 0); };

  const bar = (p, g) => `<div class="bar" style="margin:6px 0"><i style="width:${U.clamp(p / g * 100, 0, 100)}%"></i></div>`;
  const rew = (r) => [r.money ? '💶 ' + U.money(r.money) : '', r.gems ? '💎 ' + r.gems : ''].filter(Boolean).join(' · ');

  function storyCard(ms) {
    const q = st(), m = Story.current();
    Story.check();
    let h = '';
    if (ms.story) h += `<div class="card" style="margin-bottom:10px;border:1px solid #ffd36a"><div class="lbl"><span>✅ ${ms.story.title}</span><span>${rew(ms.story.reward)}</span></div><div class="ds" style="line-height:1.5;margin-top:6px">${ms.story.story}</div></div>`;
    h += `<div class="sec">📖 Historia</div>`;
    if (Story.needsChoice()) {
      const cs = ms.cs;
      h += `<p class="ds" style="color:var(--mut)">Elige tu camino. Solo puedes seguir uno de los dos.</p>`;
      h += `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>🐠 FishLife</span></div><div class="ds" style="line-height:1.5;margin:6px 0">Un acuario de Benalmádena a punto de cerrar. Entrégale peces raros, épicos y legendarios y volverá a llenarse de vida y visitantes. Cada día te paga entradas.</div><button class="btn" data-act="st_choose" data-v="fl">${cs === 'fl' ? '¿Seguro? Pulsa otra vez' : 'Ayudar a FishLife'}</button></div>`;
      h += `<div class="card" style="margin-bottom:10px"><div class="lbl"><span>🌿 Naturalistas</span></div><div class="ds" style="line-height:1.5;margin:6px 0">Voluntarios que rescatan peces heridos y limpian el mar. Recoge basura, suelta peces vivos y cura a los heridos. Cada día te regalan cebo.</div><button class="btn" data-act="st_choose" data-v="na">${cs === 'na' ? '¿Seguro? Pulsa otra vez' : 'Unirme a los Naturalistas'}</button></div>`;
      return h;
    }
    if (m) {
      const p = Math.min(prog(m), goal(m)), g = goal(m), rd = p >= g;
      const lab = q.idx.pr < TRACKS.pr.length ? 'Historia' : q.path === 'fl' ? 'FishLife' : 'Naturalistas';
      h += `<div class="card" style="margin-bottom:10px"><div class="lbl"><span>${lab} · ${m.title}</span><b>${p}/${g}</b></div><div class="ds" style="line-height:1.45;margin-top:4px">${m.desc}</div>${bar(p, g)}<div class="ds" style="color:#ffd36a;font-weight:800">Premio: ${rew(m.reward)}</div>${m.where ? `<div class="ds" style="color:var(--mut);margin-top:4px">📍 ${WHERE[m.where]} — míralo en el 🗺️ mapa</div>` : ''}${rd ? `<button class="btn primary" style="width:100%;margin-top:8px" data-act="st_claim">🎁 Reclamar premio</button>` : ''}</div>`;
    } else if (q.path) h += `<div class="card" style="margin-bottom:10px"><div class="lbl"><span>🏆 ¡Historia completada!</span></div><div class="ds" style="margin-top:6px">Has terminado todas las misiones de ${q.path === 'fl' ? 'FishLife' : 'los Naturalistas'}. ¡Gracias por cuidar la costa!</div></div>`;
    if (q.path === 'fl') h += `<div class="item"><div class="meta"><div class="nm">🐠 FishLife · nivel ${Story.flLevel()}/5</div><div class="ds">Entradas cada día: ${U.money(INCOME[Story.flLevel()])} · Peces entregados: ${q.fl.cnt.raro + q.fl.cnt.epico + q.fl.cnt.leyenda}</div></div></div>`;
    if (q.path === 'na') h += `<div class="item"><div class="meta"><div class="nm">🌿 Naturalistas · nivel ${Story.naLevel()}/5</div><div class="ds">Gusanos gratis cada día: ${Story.naLevel() * 3} · Peces curados: ${q.nat.healed}</div></div></div>`;
    return h;
  }
  const P = UI.panels.quests, body0 = P.body, act0 = P.act;
  P.body = function (ms) { return storyCard(ms) + `<div class="sec">🎯 Objetivos y desbloqueos</div>` + body0(ms); };
  P.act = function (act, d, ms) {
    if (act === 'st_claim') { const m = Story.claim(); if (m) ms.story = { title: m.title, story: m.story, reward: m.reward }; UI.render(); Story.check(); return true; }
    if (act === 'st_choose') {
      if (ms.cs !== d.v) { ms.cs = d.v; UI.render(); return true; }
      const q = st(); q.path = d.v; ms.cs = null; Story.current();
      UI.toast(d.v === 'fl' ? '🐠 Ayudarás a FishLife en Benalmádena' : '🌿 Te unes a los Naturalistas en Benalmádena', 'good');
      G.save(); UI.refreshHud(); UI.render(); return true;
    }
    return act0 ? act0(act, d, ms) : undefined;
  };

  /* ------- FishLife: entregar peces raros, épicos y legendarios ------- */
  const RAR_ORDER = ['raro', 'epico', 'leyenda'];
  UI.panels.fishlife = {
    title: () => '🐠 FishLife · Acuario',
    body() {
      const q = st(), m = Story.current();
      if (q.path !== 'fl') {
        return `<div class="card"><div class="lbl"><span>Cerrado por obras</span></div><div class="ds" style="line-height:1.5;margin-top:6px">${q.path === 'na' ? 'Has elegido ayudar a los Naturalistas. El acuario sigue necesitando ayuda, pero tú ya tienes otro camino.' : 'Los tanques están sucios y casi vacíos. Cuando conozcas la historia podrás elegir si ayudas al acuario. Mira tus 📜 Misiones.'}</div></div>`;
      }
      let h = `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>Nivel del acuario</span><b>${Story.flLevel()}/5</b></div>${bar(Story.flLevel(), 5)}<div class="ds" style="color:var(--mut)">Entregados: ${q.fl.cnt.raro} raros · ${q.fl.cnt.epico} épicos · ${q.fl.cnt.leyenda} legendarios</div>${m ? `<div class="ds" style="margin-top:6px">📜 ${m.desc} (${Math.min(prog(m), goal(m))}/${goal(m)})</div>` : ''}</div>`;
      const els = G.S.bag.filter(f => RAR_ORDER.includes(G.SPECIES_BY_ID[f.sp].rar));
      if (!els.length) return h + `<p class="ds" style="text-align:center;color:var(--mut)">No llevas peces raros, épicos ni legendarios en la nevera.</p>`;
      for (const f of els) {
        const sp = G.SPECIES_BY_ID[f.sp], bad = f.hurt ? 'Está herido: llévalo a los naturalistas' : null;
        h += `<div class="item">${UI.fishPh(sp.id, 52, false)}<div class="meta"><div class="nm">${sp.name} ${UI.rarChip(sp.rar)}</div><div class="ds">${f.cm} cm · ${U.kg(f.kg)}</div>${bad ? `<div class="ds" style="color:#ff8a6b;font-weight:700">${bad}</div>` : ''}</div><button class="btn sm" data-act="fl_give" data-v="${f.id}" ${bad ? 'disabled' : ''}>Entregar</button></div>`;
      }
      return h;
    },
    act(act, d) {
      if (act !== 'fl_give') return;
      const q = st(), i = G.S.bag.findIndex(f => f.id === d.v); if (i < 0) return true;
      const f = G.S.bag[i], sp = G.SPECIES_BY_ID[f.sp];
      if (f.hurt || !RAR_ORDER.includes(sp.rar)) return true;
      G.S.bag.splice(i, 1); q.fl.cnt[sp.rar]++; q.fl.fish.push(sp.id);
      G.Audio.play('rare'); UI.toast('🐠 ' + sp.name + ' ya nada en FishLife', 'good');
      UI.refreshHud(); Story.check(); G.save(); UI.render();
      return true;
    },
  };

  /* ------- Naturalistas: curar peces heridos ------- */
  const payOf = (sp) => Math.round((5 + 8 * G.RAR_ORDER.indexOf(sp.rar)) * 2) / 2;
  UI.panels.nature = {
    title: () => '🌿 Naturalistas · Rescate',
    body() {
      const q = st(), m = Story.current();
      if (q.path !== 'na') {
        return `<div class="card"><div class="lbl"><span>Centro de rescate</span></div><div class="ds" style="line-height:1.5;margin-top:6px">${q.path === 'fl' ? 'Has elegido ayudar a FishLife. Los naturalistas te saludan desde lejos.' : 'Aquí curan peces heridos y limpian la costa. Cuando conozcas la historia podrás unirte desde 📜 Misiones.'}</div></div>`;
      }
      let h = `<div class="card" style="margin-bottom:8px"><div class="lbl"><span>Nivel de los naturalistas</span><b>${Story.naLevel()}/5</b></div>${bar(Story.naLevel(), 5)}<div class="ds" style="color:var(--mut)">Peces curados: ${q.nat.healed}</div>${m ? `<div class="ds" style="margin-top:6px">📜 ${m.desc} (${Math.min(prog(m), goal(m))}/${goal(m)})</div>` : ''}</div>`;
      const hurt = G.S.bag.filter(f => f.hurt);
      if (!hurt.length) return h + `<p class="ds" style="text-align:center;color:var(--mut)">No llevas peces heridos 🩹. A veces los peces salen mordidos o con la piel dañada: tráelos aquí en vez de venderlos.</p>`;
      for (const f of hurt) {
        const sp = G.SPECIES_BY_ID[f.sp];
        h += `<div class="item">${UI.fishPh(sp.id, 52, false)}<div class="meta"><div class="nm">${sp.name}</div><div class="ds">${f.cm} cm · 🩹 ${f.hurt.toLowerCase()}</div><div class="ds" style="color:#6df0b6">Donativo: ${U.money(payOf(sp))}</div></div><button class="btn sm" data-act="na_heal" data-v="${f.id}">Curar y soltar</button></div>`;
      }
      return h;
    },
    act(act, d) {
      if (act !== 'na_heal') return;
      const q = st(), i = G.S.bag.findIndex(f => f.id === d.v); if (i < 0) return true;
      const f = G.S.bag[i]; if (!f.hurt) return true;
      const sp = G.SPECIES_BY_ID[f.sp], pay = payOf(sp);
      G.S.bag.splice(i, 1); q.nat.healed++; q.nat.fish.push(sp.id);
      G.S.money = Math.round((G.S.money + pay) * 100) / 100; G.S.stats.earned += pay;
      G.Audio.play('coin'); UI.toast('🌿 ' + sp.name + ' curado y devuelto al mar · +' + U.money(pay), 'good');
      UI.refreshHud(); Story.check(); G.save(); UI.render();
      return true;
    },
  };

  /* ------- Paso a pie entre el Valle y la Costa del Sol ------- */
  const VALLE_GATE = { x: 3140, y0: 1100, y1: 1262 };    // final del camino del este
  const COSTA_GATE = { x: 585, y0: 1330 };               // inicio del paseo de Benalmádena
  let cool = 0;
  Story.gates = function (dt) {
    cool = Math.max(0, cool - dt);
    if (cool > 0 || G.Fish.busy() || (G.Dive && G.Dive.active)) return;
    const P = G.P;
    if (G.mapId === 'valle' && P.x > VALLE_GATE.x && P.y > VALLE_GATE.y0 && P.y < VALLE_GATE.y1) { Story.go('costa'); }
    else if (G.mapId === 'costa' && P.x < COSTA_GATE.x && P.y > COSTA_GATE.y0 && !G.S.onPaddle) { Story.go('valle'); }
  };
  Story.go = function (id) {
    G.S.onPaddle = false;
    G.setMap(id, false);
    const to = id === 'costa' ? { x: 650, y: 1420 } : { x: 3070, y: 1184 };
    const f = G.World.freeSpot(to.x, to.y); G.P.x = f.x; G.P.y = f.y; G.P.ang = id === 'costa' ? 0 : Math.PI;
    if (G.snapCam) G.snapCam();
    cool = 2;
    UI.toast(id === 'costa' ? '🏖️ Costa del Sol · Benalmádena' : '🏞️ Valle del Pescador', 'good');
    G.save();
  };
  Story.goto = function (map, spot) { if (map !== G.mapId) { G.setMap(map, false); } G.travel(spot); G.save(); };

  /* Carteles de salida y marca de misión sobre el edificio objetivo */
  Story.draw = function (ctx) {
    const t = G.env.t;
    const sign = (x, y, txt) => {
      ctx.save(); ctx.translate(Math.round(x), Math.round(y));
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-14, 16, 30, 6);
      ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-2, -4, 4, 22);
      ctx.fillStyle = '#e8d6a0'; ctx.fillRect(-34, -22, 68, 18); ctx.strokeStyle = '#6b4a2b'; ctx.lineWidth = 2; ctx.strokeRect(-34, -22, 68, 18);
      ctx.fillStyle = '#3a2a14'; ctx.font = '800 9px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, -12.5);
      ctx.restore();
    };
    if (G.mapId === 'valle') sign(3100, 1160, 'COSTA DEL SOL →');
    else {
      sign(620, 1395, '← VALLE');
      const tg = Story.target(), b = tg && G.World.buildings.find(x => x.kind === tg);
      if (b) { const px = b.x + b.w / 2, py = b.y - 62 + Math.sin(t * 4) * 3; ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(px, py, 12, 0, 6.3); ctx.fill(); ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#4a3600'; ctx.font = '900 16px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', px, py + 1); }
    }
  };

  /* ------- Mapa de las dos zonas ------- */
  const MAP_S = 0.13, MAP_Y0 = 560, MAP_H = 205;
  const ICONS = { fishing: 'rod', fashion: 'shirt', stall: 'fish', fishlife: 'fish', nature: 'shell', home: 'house' };
  const PROM_COL = { paseo: '#b9b9b2', wood: '#a9784a', none: '#7a9a5c', port: '#6d8fa3', portmid: '#b9b9b2' };
  function drawCosta(cv) {
    const W = G.Worlds.costa;
    const dpr = Math.min(2, window.devicePixelRatio || 1), Wc = Math.round(W.ZONES[W.ZONES.length - 1].x1 * MAP_S);
    cv.width = Wc * dpr; cv.height = MAP_H * dpr; cv.style.width = Wc + 'px'; cv.style.height = MAP_H + 'px';
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const X = (x) => x * MAP_S, Y = (y) => (y - MAP_Y0) * MAP_S, t = G.env.t || 0;
    c.fillStyle = '#1f86b4'; c.fillRect(0, 0, Wc, MAP_H);
    for (const z of W.ZONES) {
      const x0 = X(z.x0), w = X(z.x1) - x0;
      if (z.beach === 'port') { c.fillStyle = '#2b6f8f'; c.fillRect(x0, Y(840), w, Y(1480) - Y(840)); c.fillStyle = '#5a7f94'; c.fillRect(x0, Y(1340), w, Y(1480) - Y(1340)); continue; }
      c.fillStyle = z.beach === 'rock' ? '#8d877b' : z.beach === 'stone' ? '#9a958c' : z.beach === 'nude' ? '#f0d9a0' : '#ead9a4';
      c.beginPath(); c.moveTo(x0, Y(1480));
      for (let x = z.x0; x <= z.x1; x += 12) c.lineTo(X(x), Y(W.shoreY(x)));
      c.lineTo(X(z.x1), Y(1480)); c.closePath(); c.fill();
      c.fillStyle = PROM_COL[z.prom] || '#b9b9b2'; c.fillRect(x0, Y(1340), w, Y(W.PROM_Y1) - Y(1340));
      c.fillStyle = '#d6ccb9'; c.fillRect(x0, Y(W.PROM_Y1), w, MAP_H);
      if (z.posi) { c.fillStyle = 'rgba(40,110,60,.55)'; for (let x = z.x0 + 40; x < z.x1 - 40; x += 55) { c.beginPath(); c.ellipse(X(x), Y(W.shoreY(x) - 120), 8, 4, 0, 0, 6.3); c.fill(); } }
    }
    c.fillStyle = '#9a9a96'; for (const p of W.PIERS) c.fillRect(X(p.x0), Y(p.y0), X(p.x1) - X(p.x0), Math.max(3, Y(p.y1) - Y(p.y0)));
    c.textAlign = 'center'; c.font = '700 8px system-ui'; c.textBaseline = 'middle';
    W.ZONES.forEach((z, i) => {
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(X(z.x0), 0); c.lineTo(X(z.x0), MAP_H); c.stroke(); c.setLineDash([]);
      const nm = z.name.replace(/ · .*/, ''), yy = MAP_H - 30 + (i % 3) * 10, cx = (X(z.x0) + X(z.x1)) / 2;
      c.fillStyle = 'rgba(0,0,0,.55)'; const tw = c.measureText(nm).width + 6; c.fillRect(cx - tw / 2, yy - 5, tw, 10);
      c.fillStyle = '#fff'; c.fillText(nm, cx, yy);
    });
    for (const b of W.buildings) {
      if (!b.label) continue;
      if (b.kind === 'castle') { c.font = '16px serif'; c.fillText('🏰', X(b.x + b.w / 2), Y(b.y) + 12); continue; }
      c.fillStyle = b.awn || '#888'; c.fillRect(X(b.x), Y(b.y), Math.max(8, b.w * MAP_S), 8);
      G.Icons.draw(c, ICONS[b.kind] || 'anchor', X(b.x + b.w / 2), Y(b.y) + 20, 15);
    }
    c.font = '15px serif';
    for (const [e, x, y] of [['🗼', 4780, W.shoreY(4780) + 34], ['🏯', 7500, W.shoreY(7500) + 110], ['🥁', 8450, W.shoreY(8450) + 70], ['☀️', 5850, W.shoreY(5850) - 40]]) c.fillText(e, X(x), Y(y));
    c.font = '12px serif'; for (const d of W.DIVES) c.fillText('🤿', X(d.x), Y(d.y - 50));
    // salida al valle
    c.fillStyle = '#ffe9a8'; c.fillRect(X(585) - 2, Y(1340), 4, Y(1480) - Y(1340)); c.font = '700 8px system-ui'; c.fillStyle = '#fff'; c.fillText('← Valle', X(620), Y(1320));
    const tg = Story.target(), tb = tg && W.buildings.find(b => b.kind === tg);
    if (tb) {
      const px = X(tb.x + tb.w / 2), py = Y(tb.y) - 14 + Math.sin(t * 4) * 2;
      c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(px, py, 9, 0, 6.3); c.fill(); c.strokeStyle = '#7a5a00'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#4a3600'; c.font = '900 12px system-ui'; c.fillText('!', px, py + 1);
    }
    if (G.mapId === 'costa') marker(c, X(G.P.x), Y(U.clamp(G.P.y, MAP_Y0, 1700)), t);
  }
  const TCOL = { 0: '#5f9f3f', 1: '#2f86c0', 3: '#b99a62', 4: '#2f6f2f', 5: '#8a6a3a', 6: '#e6d49a', 7: '#b24a30', 8: '#8a8a8a', 9: '#7cc04f', 10: '#9a9488' };
  function drawValle(cv) {
    const V = G.Worlds.valle, S = 4, dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = V.MW * S * dpr; cv.height = V.MH * S * dpr; cv.style.width = V.MW * S + 'px'; cv.style.height = V.MH * S + 'px';
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const t = G.env.t || 0;
    for (let ty = 0; ty < V.MH; ty++) for (let tx = 0; tx < V.MW; tx++) { c.fillStyle = TCOL[V.tileAt(tx * V.TS + 4, ty * V.TS + 4)] || '#5f9f3f'; c.fillRect(tx * S, ty * S, S, S); }
    const k = S / V.TS;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const b of V.buildings) { G.Icons.draw(c, ICONS[b.kind] || 'house', (b.x + b.w / 2) * k, (b.y + b.h / 2) * k, 18); }
    c.font = '700 9px system-ui';
    const lab = (txt, x, y) => { const w = c.measureText(txt).width + 6; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(x - w / 2, y - 6, w, 12); c.fillStyle = '#fff'; c.fillText(txt, x, y); };
    lab('Pueblo y tiendas', 26 * 8 * 1 + 40, 31 * S * 1 + 0);
    lab('Lago', 76 * S, 5 * S + 4); lab('Granja', 11 * S, 44 * S); lab('Río', 58 * S, 44 * S);
    for (const n of V.npcs) { c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(n.x * k, n.y * k, 2.5, 0, 6.3); c.fill(); }
    c.font = '12px serif'; c.fillText('🧰', V.CHEST.x * k, V.CHEST.y * k);
    // camino a la costa
    c.fillStyle = '#ffe9a8'; c.fillRect(VALLE_GATE.x * k - 2, VALLE_GATE.y0 * k, 4, (VALLE_GATE.y1 - VALLE_GATE.y0) * k); c.font = '700 9px system-ui'; lab('Costa del Sol →', 90 * S, 33 * S);
    if (G.mapId === 'valle') marker(c, G.P.x * k, G.P.y * k, t);
  }
  function marker(c, x, y, t) {
    c.strokeStyle = 'rgba(255,60,60,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 8 + Math.sin(t * 5) * 2, 0, 6.3); c.stroke();
    c.fillStyle = '#ff3b3b'; c.beginPath(); c.arc(x, y, 4.5, 0, 6.3); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke();
  }

  UI.panels.map = {
    title: () => '🗺️ Mapa',
    init(ms) { ms.tab = G.mapId; },
    tabs: () => [['costa', '🏖️ Costa del Sol'], ['valle', '🏞️ Valle del Pescador']],
    body(ms) {
      const tab = ms.tab || G.mapId, m = Story.current(), tg = Story.target();
      let h = `<div class="card" style="margin-bottom:8px"><div class="ds" style="line-height:1.45">${Story.needsChoice() ? '📜 <b>Elige tu camino</b> en Misiones: FishLife o Naturalistas.' : m ? `📜 <b>${m.title}</b>: ${m.desc}${m.where ? ` <span style="color:#ffd36a">📍 ${WHERE[m.where]}</span>` : ''}` : '📜 Sin historia pendiente.'}</div></div>`;
      h += `<div id="mapScroll" style="overflow-x:auto;border-radius:12px;margin-bottom:6px;-webkit-overflow-scrolling:touch"><canvas id="mapC"></canvas></div>`;
      h += `<p class="ds" style="color:var(--mut);margin:0 2px 8px">🔴 tú · 🟡 misión · desliza el mapa. ${tab === 'costa' ? 'Para volver al valle camina hacia el oeste por el paseo de Benalmádena.' : 'Para ir a la costa sigue el camino principal hacia el este.'}</p>`;
      const spots = G.Worlds[tab].SPOTS;
      h += `<div class="item"><div style="font-size:30px">🏪</div><div class="meta"><div class="nm">${tab === 'valle' ? 'Pueblo y tiendas' : 'Paseo de las tiendas'}</div><div class="ds">Tienda de pesca, moda, tu pescadería</div></div><button class="btn sm" data-act="st_travel" data-m="${tab}" data-v="tiendas">Ir</button></div>`;
      h += spots.map(s => { const lk = s.locked && !G.unlocked('cabopino'); return `<div class="item"><div style="font-size:30px">${s.icon}</div><div class="meta"><div class="nm">${s.name}</div><div class="ds">${s.sub}${lk ? ' · 🔒 misión «Explorador»' : ''}</div></div><button class="btn sm" data-act="st_travel" data-m="${tab}" data-v="${s.id}" ${lk ? 'disabled' : ''}>Ir</button></div>`; }).join('');
      if (tab === 'costa') h += `<div class="item"><div style="font-size:30px">🤿</div><div class="meta"><div class="nm">Zona de buceo</div><div class="ds">Rocas de Benalmádena · pesca submarina</div></div><button class="btn sm" data-act="st_travel" data-m="costa" data-v="dive">Ir</button></div>`;
      return h;
    },
    after(root, ms) {
      const cv = root.querySelector('#mapC'); if (!cv) return;
      const tab = ms.tab || G.mapId;
      if (tab === 'costa') drawCosta(cv); else drawValle(cv);
      const sc = root.querySelector('#mapScroll');
      if (sc && tab === G.mapId) { const k = tab === 'costa' ? MAP_S : 4 / 32; sc.scrollLeft = Math.max(0, G.P.x * k - sc.clientWidth / 2); }
    },
    act(act, d) {
      if (act === 'st_travel') { UI.close(); Story.goto(d.m, d.v); return true; }
    },
  };

  G.Story = Story;
})();
