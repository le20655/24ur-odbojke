/* test.js — preverjanje logike (node test.js) */
const Core = require('./core.js');

let fails = 0;
function assert(cond, msg) {
  if (!cond) { console.error('  ✗ ' + msg); fails++; }
}

function mkCfg(n) {
  return {
    girls: Array.from({ length: n }, (_, i) => 'Punca' + (i + 1)),
    boys: Array.from({ length: n }, (_, i) => 'Fant' + (i + 1)),
    startClock: '17:00', matchMin: 20, gapMin: 10,
    nightStartClock: '00:00', nightEndClock: '04:00', seed: 42
  };
}

for (let n = 8; n <= 13; n++) {
  const t0 = Date.now();
  const cfg = mkCfg(n);
  const gen = Core.generate(cfg);
  const state = { cfg, matches: gen.matches, queues: gen.queues, breaks: gen.breaks };
  // globalni nočni premor 01:00–03:00 (480 min po startu ob 17:00)
  Core.insertBreakAtTime(state, 0, 480, 120, 'Nočni premor', 9000);
  Core.insertBreakAtTime(state, 1, 480, 120, 'Nočni premor', 9001);
  const ms = Object.values(gen.matches);
  console.log(`n=${n} (${2 * n} igralcev): ${ms.length} tekem, kakovost=${gen.quality}, ${Date.now() - t0} ms`);

  // 1. pokritost partnerstev
  const part = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const m of ms) { part[m.g1][m.b1]++; part[m.g2][m.b2]++; }
  let twice = 0;
  for (let g = 0; g < n; g++) for (let b = 0; b < n; b++) {
    assert(part[g][b] >= 1, `partnerstvo P${g + 1}+F${b + 1} nikoli ne igra`);
    assert(part[g][b] <= 2, `partnerstvo P${g + 1}+F${b + 1} igra ${part[g][b]}x`);
    if (part[g][b] === 2) twice++;
  }
  assert(twice === (n % 2 === 1 ? 1 : 0), `ponovljenih partnerstev: ${twice}`);

  // 2. število tekem po igralcih
  const cnt = new Array(2 * n).fill(0);
  for (const m of ms) for (const p of Core.matchPlayers(m, n)) cnt[p]++;
  const extra = cnt.filter(c => c === n + 1).length;
  assert(cnt.every(c => c === n || c === n + 1), 'igralec z napačnim številom tekem: ' + JSON.stringify(cnt));
  assert(extra === (n % 2 === 1 ? 2 : 0), `igralcev z dodatno tekmo: ${extra}`);

  // 3. vrsti: vse tekme razporejene, brez podvajanja
  const qIds = state.queues.flat().filter(it => it.t === 'm').map(it => it.id);
  assert(qIds.length === ms.length, 'v vrstah ni vseh tekem');
  assert(new Set(qIds).size === qIds.length, 'tekma v vrsti večkrat');
  const qm = state.queues.map(q => q.length);
  assert(Math.abs(qm[0] - qm[1]) <= 3, 'igrišči neuravnoteženi: ' + qm);

  // 4. validacija: brez prekrivanj; opozorila štej
  const w = Core.validate(state);
  const errs = w.filter(x => x.lvl === 'err');
  const night = w.filter(x => x.lvl === 'night');
  const rest = w.filter(x => x.lvl === 'warn');
  assert(errs.length === 0, 'prekrivanja: ' + errs.map(e => e.msg).join('; '));
  console.log(`  premalo premora: ${rest.length}, nočni počitek krši: ${night.length}`);
  assert(night.length === 0, 'nočni počitek nezagotovljen pri n=' + n);
  assert(rest.length <= (n === 13 ? 2 : 0), 'prekratki premori pri n=' + n + ': ' + rest.length);

  // 5. trajanje
  const { courtEnd } = Core.computeTimes(state);
  const end = Math.max(...courtEnd);
  console.log(`  konec čiste igre: ${(end / 60).toFixed(1)} h po startu (ob ${Core.minToClock(Core.clockToMin(cfg.startClock) + end)})`);
  assert(end <= 24 * 60, 'turnir daljši od 24 h');

  // 6. kodiranje round-trip
  const tok = Core.encodeState(state);
  const dec = Core.decodeState(tok);
  assert(JSON.stringify(dec.cfg) === JSON.stringify(state.cfg), 'cfg round-trip');
  assert(JSON.stringify(dec.queues) === JSON.stringify(state.queues), 'queues round-trip');
  assert(JSON.stringify(Object.values(dec.matches)) === JSON.stringify(Object.values(state.matches)), 'matches round-trip');
  console.log(`  delilni žeton: ${tok.length} znakov`);
}

// 7. lestvica — ročno preverjen primer (n=2 ni podprt za generate, sestavimo ročno)
{
  const cfg = { girls: ['Ana', 'Beti'], boys: ['Cene', 'Dan'], startClock: '17:00', matchMin: 20, gapMin: 10, nightStartClock: null, nightEndClock: null };
  const matches = {
    0: { id: 0, round: 0, g1: 0, b1: 0, g2: 1, b2: 1, makeup: false, res: { a: 21, b: 15 } }, // Ana+Cene 21:15 Beti+Dan
    1: { id: 1, round: 1, g1: 0, b1: 1, g2: 1, b2: 0, makeup: false, res: { a: 18, b: 18 } }  // Ana+Dan 18:18 Beti+Cene
  };
  const st = Core.standings({ cfg, matches, queues: [[], []], breaks: {} });
  const ana = st.girls.find(r => r.name === 'Ana'), beti = st.girls.find(r => r.name === 'Beti');
  assert(ana.mp === 3 && ana.w === 1 && ana.d === 1, 'Ana: mp=' + ana.mp);
  assert(beti.mp === 1 && beti.l === 1 && beti.d === 1, 'Beti: mp=' + beti.mp);
  assert(ana.diff === 6 && beti.diff === -6, 'razlika');
  assert(st.girls[0].name === 'Ana', 'vrstni red lestvice');
  const cene = st.boys.find(r => r.name === 'Cene');
  assert(cene.mp === 3 && cene.pf === 39, 'Cene: mp=' + cene.mp + ' pf=' + cene.pf);
}

// 8. premori in časi
{
  const cfg = mkCfg(8);
  const gen = Core.generate(cfg);
  const state = { cfg, matches: gen.matches, queues: gen.queues, breaks: { ...gen.breaks, 100: { id: 100, dur: 45, label: 'Nočni premor' } } };
  state.queues[0].splice(0, 0, { t: 'b', id: 100 });
  const { times, breakTimes } = Core.computeTimes(state);
  assert(breakTimes[100].start === 0 && breakTimes[100].end === 45, 'čas premora');
  const firstMatch = state.queues[0].find(it => it.t === 'm');
  let exp = 0;
  for (const it of state.queues[0]) {
    if (it === firstMatch) break;
    exp += it.t === 'b' ? state.breaks[it.id].dur : 30;
  }
  assert(times[firstMatch.id].start === exp, `premor zamakne čase: ${times[firstMatch.id].start} != ${exp}`);
}

// 9. tekma odpade (off) + združljivost s starimi tokeni
{
  const cfg = { girls: ['Ana', 'Beti'], boys: ['Cene', 'Dan'], startClock: '17:00', matchMin: 20, gapMin: 10, nightStartClock: null, nightEndClock: null };
  const matches = {
    0: { id: 0, round: 0, g1: 0, b1: 0, g2: 1, b2: 1, makeup: false, res: { a: 21, b: 15 }, off: false },
    1: { id: 1, round: 1, g1: 0, b1: 1, g2: 1, b2: 0, makeup: false, res: { a: 18, b: 18 }, off: true } // odpadla
  };
  const state = { cfg, matches, queues: [[{ t: 'm', id: 0 }], [{ t: 'm', id: 1 }]], breaks: {} };
  const st = Core.standings(state);
  const ana = st.girls.find(r => r.name === 'Ana');
  assert(ana.played === 1 && ana.mp === 2, 'odpadla tekma šteje v lestvico: ' + JSON.stringify(ana));
  // validate: odpadla tekma ne veže igralcev (isti igralci hkrati na obeh igriščih ni napaka, če ena odpade)
  const state2 = { cfg, matches: {
    0: { id: 0, round: 0, g1: 0, b1: 0, g2: 1, b2: 1, makeup: false, res: null, off: false },
    1: { id: 1, round: 1, g1: 0, b1: 1, g2: 1, b2: 0, makeup: false, res: null, off: true }
  }, queues: [[{ t: 'm', id: 0 }], [{ t: 'm', id: 1 }]], breaks: {} };
  const errs = Core.validate(state2).filter(w => w.lvl === 'err');
  assert(errs.length === 0, 'odpadla tekma povzroča prekrivanje: ' + errs.map(e => e.msg).join('; '));
  // encode/decode round-trip z off
  const dec = Core.decodeState(Core.encodeState(state));
  assert(dec.matches[1].off === true && dec.matches[0].off === false, 'off round-trip');
  // star 9-elementni zapis tekme (brez off) se še vedno prebere
  const oldPayload = [1, cfg, [[0, 0, 0, 0, 1, 1, 0, 21, 15]], [['m0'], []], []];
  const oldTok = Buffer.from(JSON.stringify(oldPayload)).toString('base64url');
  const oldDec = Core.decodeState(oldTok);
  assert(oldDec.matches[0].off === false && oldDec.matches[0].res.a === 21, 'stari token brez polja off');
  console.log('tekma odpade: lestvica/validate/round-trip OK');
}

console.log(fails === 0 ? '\nVSI TESTI OK' : `\n${fails} NAPAK`);
process.exit(fails ? 1 : 0);
