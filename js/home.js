/* Tu casa: cama para dormir y pecera para guardar peces */
window.G = window.G || {};

G.Home = (function () {
  const U = G.U, H = {};
  H.tankCap = () => 8 + (G.unlocked('tank2') ? 8 : 0) + (G.unlocked('tank3') ? 14 : 0);
  const tank = () => { const s = G.S; if (!s.tank) s.tank = []; return s.tank; };
  H.tank = tank;

  /* Dormir: solo de 19:00 a 07:00; avanza el reloj hasta las 7 de la mañana */
  H.sleep = function () {
    const h = G.env.hour;
    if (h >= 7 && h < 19) { G.UI.toast('🛏️ Aún no tienes sueño: puedes dormir de 19:00 a 07:00', 'warn'); return false; }
    const hrs = h >= 19 ? 31 - h : 7 - h;
    G.Ach.count('slept');
    G.addTime(hrs);
    G.Audio.play('gem');
    G.save(); G.UI.refreshHud();
    G.UI.showMsg('😴 ¡Buenos días!', `Has dormido hasta las ${U.clock(G.env.hour)}. Es el día ${G.S.day}.`);
    return true;
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
