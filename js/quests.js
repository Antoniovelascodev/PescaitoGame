/* Misiones: objetivos guiados con premios y cosas que se desbloquean (cañas pro, tabla, Cabopino, pecera grande) */
window.G = window.G || {};

G.unlocked = (id) => !!(G.S.unlocks && G.S.unlocks[id]);

G.Quests = (function () {
  const U = G.U, Q = {};
  const S = () => G.S;
  const cnt = (k) => (S().cnt && S().cnt[k]) || 0;
  const rar = (r) => Object.entries(S().album).reduce((a, [id, rec]) => a + (G.SPECIES_BY_ID[id] && G.SPECIES_BY_ID[id].rar === r ? rec.n : 0), 0);
  const maxKg = () => Object.values(S().album).reduce((a, r) => Math.max(a, r.maxKg || 0), 0);
  const gearBought = () => (S().owned.rods.length - 1) + (S().owned.lines.length - 1) + (S().owned.hooks.length - 1);

  const UNLOCKS = {
    deep: '🎣 Ya puedes comprar la caña, el hilo y el anzuelo avanzados en la tienda de pesca',
    pro: '🏆 Ya puedes comprar el equipo profesional (Carbono Élite, trenzado marino, anzuelo nº 1 y Arpón Pro)',
    tabla: '🏄 Ya puedes comprar la tabla de paddle surf',
    cabopino: '⚓ Nuevo destino en el mapa: Puerto de Cabopino',
    tank2: '🐠 Tu pecera ahora tiene 8 plazas más',
    tank3: '🐠 Tu pecera ahora tiene 14 plazas más',
  };
  Q.UNLOCKS = UNLOCKS;

  const L = [];
  const def = (id, icon, name, desc, cur, max, reward, unlock) => L.push({ id, icon, name, desc, cur, max, reward, unlock });

  def('fish3', '🎣', 'Primeras capturas', 'Pesca 3 peces. ¡Lanza la caña al mar!', () => S().stats.fish, 3, { money: 40 });
  def('sell1', '🚚', 'Primera venta', 'Vende un pez en la lonja o en tu pescadería.', () => cnt('lonja') + cnt('stallSales'), 1, { money: 50 });
  def('gear1', '🧰', 'Equípate', 'Compra una caña, un hilo o un anzuelo mejor.', gearBought, 1, { money: 60 });
  def('sleep1', '🛏️', 'Dulces sueños', 'Duerme una noche en tu casa (de 19:00 a 07:00).', () => cnt('slept'), 1, { money: 80, gems: 1 });
  def('tank3', '🐠', 'Mi pecera', 'Guarda 3 peces en la pecera de tu casa.', () => cnt('tankIn'), 3, { money: 100 }, 'tank2');
  def('sp10', '📖', 'Naturalista', 'Consigue 10 especies distintas en el álbum.', () => G.speciesCount(), 10, { money: 150, gems: 1 }, 'deep');
  def('fresh5', '🏞️', 'Pescador de río', 'Pesca 5 peces de agua dulce en el valle (río, lago o estanque).', () => cnt('fresh'), 5, { money: 120 });
  def('chest1', '🧰', 'Cazatesoros', 'Abre el cofre del islote del lago, al final del muelle.', () => cnt('chests'), 1, { money: 200, gems: 1 });
  def('talk3', '💬', 'Vecino del valle', 'Habla con 3 vecinos del pueblo.', () => cnt('talk'), 3, { money: 100 });
  def('night3', '🌙', 'Pescador nocturno', 'Pesca 3 peces de noche.', () => cnt('night'), 3, { money: 120 });
  def('trash10', '♻️', 'Mar limpio', 'Retira 10 basuras del mar.', () => S().stats.trash || 0, 10, { money: 150, gems: 1 });
  def('stall5', '🏪', 'Tendero', 'Vende 5 pescados en tu pescadería.', () => cnt('stallSales'), 5, { money: 200, gems: 1 });
  def('sail3', '⚓', 'Amigo del marinero', 'Cumple 3 encargos del marinero.', () => cnt('sailor'), 3, { money: 300, gems: 2 });
  def('rare5', '💙', 'Cazador de raros', 'Pesca 5 peces raros.', () => rar('raro'), 5, { money: 350, gems: 2 }, 'tabla');
  def('spear5', '🔱', 'Cazador submarino', 'Pesca 5 peces con el arpón.', () => cnt('spear'), 5, { money: 400, gems: 2 });
  def('earn2k', '💶', 'Buen negocio', 'Gana 2.000 € vendiendo pescado.', () => S().stats.earned || 0, 2000, { money: 300 }, 'tank3');
  def('sp25', '🗺️', 'Explorador', 'Consigue 25 especies distintas.', () => G.speciesCount(), 25, { money: 500, gems: 3 }, 'cabopino');
  def('epic1', '💜', 'Pez épico', 'Pesca un pez épico.', () => rar('epico'), 1, { money: 600, gems: 3 }, 'pro');
  def('kg20', '⚖️', 'Pieza de 20 kg', 'Pesca un pez de 20 kg o más.', maxKg, 20, { money: 800, gems: 4 });
  def('koi1', '🎏', 'Un koi en el estanque', 'Pesca una carpa koi en el valle.', () => (S().album.koi || {}).n || 0, 1, { money: 900, gems: 3 });
  def('leg1', '🌟', 'Leyenda del mar', 'Pesca un pez legendario.', () => rar('leyenda'), 1, { money: 3000, gems: 10 });

  for (const q of L) if (['fresh5', 'chest1', 'talk3', 'koi1'].includes(q.id)) q.valle = true;   // solo se ven en el Valle
  Q.list = L;
  Q.done = (q) => !!(S().quests && S().quests[q.id]);
  const curOf = (q) => { try { return q.cur(); } catch (e) { return 0; } };
  Q.progress = (q) => Math.min(q.max, curOf(q));
  Q.ready = (q) => !Q.done(q) && curOf(q) >= q.max;
  /* Las 3 primeras misiones sin cobrar son las activas */
  Q.active = () => L.filter(q => !Q.done(q) && (!q.valle || G.mapId === 'valle')).slice(0, 3);
  Q.readyCount = () => Q.active().filter(Q.ready).length;
  Q.rewardText = (r) => [r.money ? '💶 ' + U.money(r.money) : '', r.gems ? '💎 ' + r.gems : ''].filter(Boolean).join(' · ');

  Q.claim = function (id) {
    const q = Q.active().find(x => x.id === id), s = S();
    if (!q || !Q.ready(q)) return null;
    s.quests = s.quests || {}; s.quests[q.id] = s.day || 1;
    if (q.reward.money) s.money = Math.round((s.money + q.reward.money) * 100) / 100;
    if (q.reward.gems) s.gems = (s.gems || 0) + q.reward.gems;
    if (q.unlock) { s.unlocks = s.unlocks || {}; s.unlocks[q.unlock] = true; }
    G.Audio.play('gem'); G.save(); G.UI.refreshHud();
    return q;
  };

  /* Cuenta atrás para avisar una sola vez cuando hay misiones listas */
  let lastReady = -1;
  Q.check = function () {
    const n = Q.readyCount();
    if (n !== lastReady) {
      if (n > lastReady && lastReady >= 0) G.UI.toast('📜 ¡Misión completada! Reclama tu premio en Misiones', 'good');
      lastReady = n; G.UI.refreshHud();
    }
  };

  /* ---- Panel ---- */
  const UI = G.UI;
  const card = (q, ready) => {
    const p = Q.progress(q), pct = Math.round(p / q.max * 100);
    const fmt = (v) => q.max >= 100 ? Math.floor(v).toLocaleString('es-ES') : Math.floor(v * 10) / 10;
    return `<div class="item ${ready ? 'ready' : ''}"><div style="font-size:30px;width:36px;text-align:center">${q.icon}</div><div class="meta"><div class="nm">${q.name}</div><div class="ds">${q.desc}</div>
      ${ready ? '' : `<div class="bar" style="margin-top:6px;height:7px"><i style="width:${pct}%"></i></div><div class="ds">${fmt(p)} / ${fmt(q.max)}</div>`}
      <div class="ds" style="color:#ffd36a;font-weight:800">Premio: ${Q.rewardText(q.reward)}</div>${q.unlock ? `<div class="ds" style="color:#6df0b6;font-weight:700">🔓 ${UNLOCKS[q.unlock]}</div>` : ''}</div>
      ${ready ? `<button class="btn sm" style="background:linear-gradient(160deg,#ffd36a,#f0a020);color:#3a2a00" data-act="q_claim" data-v="${q.id}">Reclamar</button>` : ''}</div>`;
  };
  UI.panels.quests = {
    title: () => '📜 Misiones',
    body() {
      const vis = L.filter(q => !q.valle || G.mapId === 'valle'), act = Q.active(), done = vis.filter(Q.done), left = vis.length - done.length - act.length;
      let h = `<div class="sum"><span>Completadas ${done.length} / ${vis.length}</span><span>${left > 0 ? left + ' más por descubrir' : ''}</span></div><div class="bar" style="margin-bottom:8px"><i style="width:${done.length / vis.length * 100}%"></i></div>`;
      h += `<div class="sec">Misiones activas</div>` + (act.map(q => card(q, Q.ready(q))).join('') || `<p class="ds" style="color:var(--mut);text-align:center">¡Has completado todas las misiones! 🎉</p>`);
      if (done.length) h += `<div class="sec">Completadas</div>` + done.slice().reverse().map(q => `<div class="item on"><div style="font-size:26px;width:36px;text-align:center">✅</div><div class="meta"><div class="nm">${q.name}</div><div class="ds">${q.desc}</div></div></div>`).join('');
      return h;
    },
    act(act, d) {
      if (act === 'q_claim') {
        const q = Q.claim(d.v);
        if (q) { UI.toast('📜 ' + q.name + ' · ' + Q.rewardText(q.reward), 'good'); if (q.unlock) setTimeout(() => UI.toast('🔓 ' + UNLOCKS[q.unlock], 'good'), 900); Q.check(); UI.render(); }
        return true;
      }
    },
  };
  return Q;
})();
