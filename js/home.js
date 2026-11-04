/* Tu casa: cama para dormir y pecera para guardar peces */
window.G = window.G || {};

G.Home = (function () {
  const U = G.U, H = {};
  H.tankCap = () => 8 + (G.unlocked('tank2') ? 8 : 0) + (G.unlocked('tank3') ? 14 : 0);
  const tank = () => { const s = G.S; if (!s.tank) s.tank = []; return s.tank; };
  H.tank = tank;

  /* Dormir: de 19:00 a 07:00 en la costa y de 18:00 a 06:00 en el valle; avanza el reloj hasta la mañana */
  H.sleep = function () {
    const h = G.env.hour, valle = G.mapId === 'valle', wake = valle ? 6 : 7, from = valle ? 18 : 19;
    if (h >= wake && h < from) { G.UI.toast(`🛏️ Aún no tienes sueño: puedes dormir de ${U.clock(from)} a ${U.clock(wake)}`, 'warn'); return false; }
    const hrs = h >= from ? 24 + wake - h : wake - h;
    G.Ach.count('slept');
    G.addTime(hrs);
    if (valle) G.newDay();
    G.Audio.play('gem');
    G.save(); G.UI.refreshHud();
    G.UI.showMsg('😴 ¡Buenos días!', `Has dormido hasta las ${U.clock(G.env.hour)}. Es el día ${G.S.day}.`);
    return true;
  };

  /* Te caes de sueño a las 02:00 en el valle: despiertas en casa a las 06:00 */
  H.passOut = function () {
    const P = G.P;
    if (G.Fish.state !== 'idle') { G.Fish.state = 'idle'; G.Fish.cur = null; G.Fish.rings.length = 0; G.UI.fishHud(null); }
    if (G.Interior.active) G.Interior.leave();
    G.addTime(6 - G.env.hour); G.newDay();
    const d = G.World.HOME_DOOR; P.x = d.x; P.y = d.y; P.ang = Math.PI / 2; if (G.snapCam) G.snapCam();
    G.save(); G.UI.refreshHud();
    G.UI.showMsg('😴 ¡Te has quedado dormido!', `Se hizo muy tarde y te desmayaste de sueño. Despiertas en casa a las ${U.clock(G.env.hour)} de ${G.dateText()}.`);
  };

  const UI = G.UI;
  const row = (f, btn) => { const sp = G.SPECIES_BY_ID[f.sp]; return `<div class="item">${UI.fishPh(sp.id, 52, false)}<div class="meta"><div class="nm">${sp.name} <span class="rar" style="color:${G.RARITY[sp.rar].color}">${G.RARITY[sp.rar].name}</span></div><div class="ds">${f.cm} cm · ${U.kg(f.kg)}</div></div>${btn}</div>`; };
  UI.panels.tank = {
    title: () => '🐠 Tu pecera',
    body() {
      const t = tank(), cap = H.tankCap(), bag = G.S.bag;
      let h = `<div class="sum"><span>🐠 Pecera ${t.length}/${cap}</span><span>🧊 Nevera ${bag.length}/${G.coolerCap()}</span></div>
        <p class="ds" style="color:var(--mut);margin:0 2px 8px">Guarda tus mejores peces en la pecera para presumir de ellos. No ocupan sitio en la nevera y no se pierden.</p>`;
      h += `<div class="sec">En la pecera</div>` + (t.length ? t.map(f => row(f, `<button class="btn sm" data-act="tank_out" data-v="${f.id}" ${bag.length >= G.coolerCap() ? 'disabled' : ''}>A la nevera</button>`)).join('') : `<p class="ds" style="color:var(--mut);text-align:center">La pecera está vacía.</p>`);
      h += `<div class="sec">En tu nevera</div>` + (bag.length ? bag.map(f => row(f, `<button class="btn sm" data-act="tank_in" data-v="${f.id}" ${t.length >= cap ? 'disabled' : ''}>A la pecera</button>`)).join('') : `<p class="ds" style="color:var(--mut);text-align:center">No llevas peces.</p>`);
      return h;
    },
    act(act, d) {
      const t = tank(), S = G.S;
      if (act === 'tank_in') {
        const i = S.bag.findIndex(x => x.id === d.v); if (i < 0 || t.length >= H.tankCap()) return true;
        t.push(S.bag.splice(i, 1)[0]); G.Ach.count('tankIn'); G.Quests.check(); G.Audio.play('click'); G.save(); UI.refreshHud(); UI.render(); return true;
      }
      if (act === 'tank_out') {
        const i = t.findIndex(x => x.id === d.v); if (i < 0 || S.bag.length >= G.coolerCap()) return true;
        S.bag.push(t.splice(i, 1)[0]); G.Audio.play('click'); G.save(); UI.refreshHud(); UI.render(); return true;
      }
    },
  };
  return H;
})();
