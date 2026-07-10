/* core.js — logika turnirja "24 ur odbojke" (čisti JS, brez DOM; deluje v node in brskalniku) */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- pomožno ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clockToMin(str) { // "17:00" -> 1020
    const m = /^(\d{1,2}):(\d{2})$/.exec((str || '').trim());
    if (!m) return null;
    return (+m[1] % 24) * 60 + (+m[2] % 60);
  }
  function minToClock(min) { // minute v dnevu -> "HH:MM"
    const t = ((min % 1440) + 1440) % 1440;
    const h = Math.floor(t / 60), mm = t % 60;
    return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  // ---------- generator: partnerstva + nasprotniki ----------
  // n punc (0..n-1), n fantov (0..n-1). Krog r: punca i + fant (i+r) mod n.
  // Tekma: {id, round, g1,b1,g2,b2, makeup} — par1 (g1,b1) proti par2 (g2,b2).

  function minCostMatching(items, cost) {
    const m = items.length;
    const used = new Array(m).fill(false);
    let best = null, bestCost = Infinity;
    const cur = [];
    (function dfs(acc) {
      if (acc >= bestCost) return;
      const i = used.indexOf(false);
      if (i === -1) { bestCost = acc; best = cur.slice(); return; }
      used[i] = true;
      for (let j = i + 1; j < m; j++) {
        if (used[j]) continue;
        used[j] = true; cur.push([i, j]);
        dfs(acc + cost(items[i], items[j]));
        cur.pop(); used[j] = false;
      }
      used[i] = false;
    })(0);
    return best.map(([i, j]) => [items[i], items[j]]);
  }

  function generateMatches(n, rng) {
    const oppG = Array.from({ length: n }, () => new Array(n).fill(0)); // punca-punca nasprotnici
    const oppB = Array.from({ length: n }, () => new Array(n).fill(0)); // fant-fant
    const oppX = Array.from({ length: n }, () => new Array(n).fill(0)); // punca-fant (nasproti)
    const matches = [];
    const byePairs = [];
    let id = 0;

    const cost = (p, q) => {
      let c = oppG[p.g][q.g] * oppG[p.g][q.g] * 10
            + oppB[p.b][q.b] * oppB[p.b][q.b] * 10
            + (oppX[p.g][q.b] ** 2 + oppX[q.g][p.b] ** 2) * 3;
      return c + rng() * 0.5;
    };
    const record = (p, q, round, makeup) => {
      oppG[p.g][q.g]++; oppG[q.g][p.g]++;
      oppB[p.b][q.b]++; oppB[q.b][p.b]++;
      oppX[p.g][q.b]++; oppX[q.g][p.b]++;
      matches.push({ id: id++, round, g1: p.g, b1: p.b, g2: q.g, b2: q.b, makeup: !!makeup, res: null });
    };

    for (let r = 0; r < n; r++) {
      let pairs = Array.from({ length: n }, (_, i) => ({ g: i, b: (i + r) % n }));
      if (n % 2 === 1) {
        byePairs.push(pairs[r]); // punca r počiva 1x, fant (2r mod n) 1x
        pairs = pairs.filter((_, i) => i !== r);
      }
      for (const [p, q] of minCostMatching(pairs, cost)) record(p, q, r, false);
    }

    // nadomestne tekme za "bye" pare (lihi n): min-cost razporeditev, en par ostane
    if (n % 2 === 1) {
      let bestPlan = null, bestC = Infinity;
      for (let skip = 0; skip < byePairs.length; skip++) {
        const rest = byePairs.filter((_, i) => i !== skip);
        let tot = 0;
        const plan = minCostMatching(rest, (p, q) => { const c = cost(p, q); return c; });
        for (const [p, q] of plan) tot += cost(p, q);
        if (tot < bestC) { bestC = tot; bestPlan = { plan, leftover: byePairs[skip] }; }
      }
      for (const [p, q] of bestPlan.plan) record(p, q, n, true);
      // preostali bye par dobi nasprotnika iz obstoječih partnerstev (ta dva igralca igrata n+1 tekem)
      const L = bestPlan.leftover;
      let bo = null, boc = Infinity;
      for (let g = 0; g < n; g++) {
        if (g === L.g) continue;
        for (let b = 0; b < n; b++) {
          if (b === L.b) continue;
          const c = cost({ g, b }, L);
          if (c < boc) { boc = c; bo = { g, b }; }
        }
      }
      record(bo, L, n, true);
    }
    return { matches, oppG, oppB };
  }

  // ---------- razporejanje v slote ----------
  // grid[s][c] = indeks tekme ali -1; sloti gosti (prazna celica le v zadnjem slotu).
  // Trde omejitve: igralec 2x v istem slotu; mehke/kaznovane: sosednja slota,
  // nočni počitek < 120 min v kosu, slaba razpršenost.

  function matchPlayers(m, n) { return [m.g1, n + m.b1, m.g2, n + m.b2]; }

  function assignSlots(matches, opts, rng) {
    const n = opts.n;
    const M = matches.length;
    const cells = M + (opts.extraCells || 0);
    const S = Math.ceil(cells / 2);
    const P = 2 * n;
    const eveSlots = opts.eveningSlots || 0; // reže pred nočno pavzo (vrhunec) — tam prazna igrišča kaznujemo
    const emptyW = opts.emptyW || 0;         // teža: prazno igrišče čez večer naj se raje preseli v jutro

    // začetni razpored: po vrsti (krogi skupaj), prazne celice na koncu
    const grid = [];
    for (let s = 0; s < S; s++) grid.push([2 * s < M ? 2 * s : -1, 2 * s + 1 < M ? 2 * s + 1 : -1]);

    const players = matches.map(m => matchPlayers(m, n)); // matchIdx -> [p1..p4]
    const pslots = Array.from({ length: P }, () => []);
    for (let s = 0; s < S; s++) for (let c = 0; c < 2; c++) {
      const mi = grid[s][c];
      if (mi >= 0) for (const p of players[mi]) pslots[p].push(s);
    }

    // kazni: isti slot 1e6, sosednja slota 4000, razmik 2 slota → 1 (mehko)
    function penPlayer(p) {
      const sl = pslots[p].slice().sort((a, b) => a - b);
      let pen = 0;
      for (let i = 1; i < sl.length; i++) {
        const g = sl[i] - sl[i - 1];
        if (g === 0) pen += 1e6;
        else if (g === 1) pen += 4000;
        else if (g === 2) pen += 1;
      }
      return pen;
    }

    // pozicijska kazen praznih rež: prazno igrišče v slotu pred nočno pavzo je (rahlo) nezaželeno
    const emptyPen = s => (emptyW && s < eveSlots) ? emptyW : 0;
    function gridEmptyPen() {
      let e = 0;
      for (let s = 0; s < S; s++) { if (grid[s][0] < 0) e += emptyPen(s); if (grid[s][1] < 0) e += emptyPen(s); }
      return e;
    }

    const pens = new Array(P);
    let total = 0;
    for (let p = 0; p < P; p++) { pens[p] = penPlayer(p); total += pens[p]; }
    total += gridEmptyPen();

    function replaceSlot(p, from, to) {
      const arr = pslots[p];
      arr[arr.indexOf(from)] = to;
    }

    const iters = opts.iters || 150000;
    let best = { total, grid: grid.map(r => r.slice()) };
    let T = 2500;
    const cool = Math.pow(1 / 2500, 1 / iters);
    let badPlayers = [];

    // poskusi zamenjavo tekem v celicah (s1,c1) <-> (s2,c2); prazna celica je dovoljena na eni strani
    function trySwap(s1, c1, s2, c2) {
      const m1 = grid[s1][c1], m2 = grid[s2][c2];
      if (m1 < 0 && m2 < 0) return false;
      const aff = new Set();
      if (m1 >= 0) for (const p of players[m1]) aff.add(p);
      if (m2 >= 0) for (const p of players[m2]) aff.add(p);
      let delta = 0;
      for (const p of aff) delta -= pens[p];
      if (emptyW && s1 !== s2) { // premik prazne reže proti jutru/repu
        const be = (m1 < 0 ? emptyPen(s1) : 0) + (m2 < 0 ? emptyPen(s2) : 0);
        const af = (m2 < 0 ? emptyPen(s1) : 0) + (m1 < 0 ? emptyPen(s2) : 0);
        delta += af - be;
      }
      if (m1 >= 0) for (const p of players[m1]) replaceSlot(p, s1, s2);
      if (m2 >= 0) for (const p of players[m2]) replaceSlot(p, s2, s1);
      const newPens = {};
      for (const p of aff) { newPens[p] = penPlayer(p); delta += newPens[p]; }
      if (delta <= 0 || rng() < Math.exp(-delta / T)) {
        grid[s1][c1] = m2; grid[s2][c2] = m1;
        for (const p of aff) pens[p] = newPens[p];
        total += delta;
        if (total < best.total) best = { total, grid: grid.map(r => r.slice()) };
        return true;
      }
      if (m1 >= 0) for (const p of players[m1]) replaceSlot(p, s2, s1);
      if (m2 >= 0) for (const p of players[m2]) replaceSlot(p, s1, s2);
      return false;
    }

    // hitra ocena konfliktov tekme mi v okolici slota s (za predizbor kandidatk)
    function conflictScore(mi, s, ignoreSlot) {
      let c = 0;
      for (const p of players[mi]) {
        for (const q of pslots[p]) {
          if (q === ignoreSlot) continue;
          if (q === s) c += 100;
          else if (q === s - 1 || q === s + 1) c++;
        }
      }
      return c;
    }

    let sinceImprove = 0, lastBest = total;
    for (let it = 0; it < iters; it++) {
      T *= cool;
      if (it % 500 === 0) {
        badPlayers = [];
        for (let p = 0; p < P; p++) if (pens[p] >= 4000) badPlayers.push(p);
        if (!badPlayers.length && total < 4000) break; // ni trdih kršitev
        if (best.total < lastBest) { lastBest = best.total; sinceImprove = 0; } else sinceImprove += 500;
        if (sinceImprove > 20000) { T = Math.max(T, 900); sinceImprove = 0; } // ponovno segrevanje
      }
      if (rng() < 0.15) {
        // zamenjava celih slotov (obe igrišči hkrati)
        const s1 = (rng() * S) | 0, s2 = (rng() * S) | 0;
        if (s1 === s2) continue;
        trySwap(s1, 0, s2, 0);
        trySwap(s1, 1, s2, 1);
        continue;
      }
      if (badPlayers.length && rng() < 0.5) {
        // popravljalna poteza: tekmo kršitelja preseli na najmanj konflikten cilj
        const p = badPlayers[(rng() * badPlayers.length) | 0];
        const sl = pslots[p].slice().sort((a, b) => a - b);
        let s1 = -1;
        for (let i = 1; i < sl.length; i++) if (sl[i] - sl[i - 1] <= 1) { s1 = sl[i]; break; }
        if (s1 < 0) s1 = sl[(rng() * sl.length) | 0];
        const c1 = grid[s1][0] >= 0 && players[grid[s1][0]].includes(p) ? 0 : 1;
        const m1 = grid[s1][c1];
        if (m1 < 0) continue;
        let bs = -1, bc = 0, bscore = Infinity;
        for (let k = 0; k < 20; k++) {
          const s2 = (rng() * S) | 0, c2 = (rng() * 2) | 0;
          if (s2 === s1) continue;
          const m2 = grid[s2][c2];
          const sc = conflictScore(m1, s2, s1) + (m2 >= 0 ? conflictScore(m2, s1, s2) : 0);
          if (sc < bscore) { bscore = sc; bs = s2; bc = c2; }
        }
        if (bs >= 0) trySwap(s1, c1, bs, bc);
        continue;
      }
      // naključna zamenjava
      const s1 = (rng() * S) | 0, c1 = (rng() * 2) | 0;
      const s2 = (rng() * S) | 0, c2 = (rng() * 2) | 0;
      if (s1 === s2) continue;
      trySwap(s1, c1, s2, c2);
    }

    // zaključno glajenje: obnovi najboljšo rešitev in izčrpno išči izboljšave za kršitelje
    for (let s = 0; s < S; s++) { grid[s][0] = best.grid[s][0]; grid[s][1] = best.grid[s][1]; }
    for (let p = 0; p < P; p++) pslots[p].length = 0;
    for (let s = 0; s < S; s++) for (let c = 0; c < 2; c++) {
      const mi = grid[s][c];
      if (mi >= 0) for (const p of players[mi]) pslots[p].push(s);
    }
    total = 0;
    for (let p = 0; p < P; p++) { pens[p] = penPlayer(p); total += pens[p]; }
    total += gridEmptyPen();
    T = 1e-9; // sprejmi le stroge izboljšave
    let guard = 0, improvedAny = true;
    while (improvedAny && guard++ < 30) {
      improvedAny = false;
      for (let s1 = 0; s1 < S && !improvedAny; s1++) for (let c1 = 0; c1 < 2 && !improvedAny; c1++) {
        const m1 = grid[s1][c1];
        if (m1 < 0) continue;
        if (!players[m1].some(p => pens[p] >= 4000)) continue;
        for (let s2 = 0; s2 < S && !improvedAny; s2++) {
          if (s2 === s1) continue;
          for (let c2 = 0; c2 < 2 && !improvedAny; c2++) {
            const before = total;
            trySwap(s1, c1, s2, c2);
            if (total < before) improvedAny = true;
          }
        }
      }
    }
    if (total < best.total) best = { total, grid: grid.map(r => r.slice()) };
    return best;
  }

  // generate: glavni vstop. cfg: {girls, boys, matchMin, gapMin, startClock, seed}
  // Prazne celice ("prosto igrišče") zrahljajo razpored, da so premori izvedljivi;
  // koliko jih je, omejuje časovni proračun (privzeto 23,5 h minus nočni premor).
  function generate(cfg) {
    const n = cfg.girls.length;
    const slotMin = cfg.matchMin + cfg.gapMin;
    const restarts = cfg.restarts || 4;
    const budgetMin = cfg.budgetMin || 1410;
    const pauseMin = cfg.pauseMin != null ? cfg.pauseMin : 120;
    // prazne reže (prosto igrišče) naj se raje selijo v jutro po nočni pavzi, ne v večerni vrhunec
    const emptyW = cfg.emptyW != null ? cfg.emptyW : 50;
    let eveningSlots = 0;
    if (cfg.pauseOn && cfg.pauseClock) {
      const relNight = ((clockToMin(cfg.pauseClock) - clockToMin(cfg.startClock)) + 1440) % 1440;
      eveningSlots = Math.round(relNight / slotMin);
    }
    let bestAll = null;
    let extraCells = 0;
    for (let r = 0; r < restarts; r++) {
      const rng = mulberry32((cfg.seed || 1) + r * 7919);
      const { matches } = generateMatches(n, rng);
      const maxCells = 2 * Math.floor((budgetMin - pauseMin) / slotMin);
      extraCells = Math.max(0, Math.min(Math.max(4, 16 - n), maxCells - matches.length));
      const sol = assignSlots(matches, { n, iters: cfg.iters, extraCells, eveningSlots, emptyW }, rng);
      if (!bestAll || sol.total < bestAll.total) bestAll = { total: sol.total, grid: sol.grid, matches };
      if (bestAll.total < 4000) break; // brez trdih kršitev
    }
    // trmasti primeri: še dva poskusa z 3x več iteracijami
    if (bestAll.total >= 8000) {
      for (let r = restarts; r < restarts + 2; r++) {
        const rng = mulberry32((cfg.seed || 1) + r * 7919);
        const { matches } = generateMatches(n, rng);
        const sol = assignSlots(matches, { n, iters: (cfg.iters || 150000) * 3, extraCells, eveningSlots, emptyW }, rng);
        if (sol.total < bestAll.total) bestAll = { total: sol.total, grid: sol.grid, matches };
        if (bestAll.total < 8000) break;
      }
    }
    // preostale sosednje tekme razreši z vstavljanjem praznega slota med njiju (če čas dopušča)
    const grid = bestAll.grid.map(row => row.slice());
    for (let guard = 0; guard < 12; guard++) {
      const ps = Array.from({ length: 2 * n }, () => []);
      for (let s = 0; s < grid.length; s++) for (let c = 0; c < 2; c++) {
        const mi = grid[s][c];
        if (mi >= 0) for (const p of matchPlayers(bestAll.matches[mi], n)) ps[p].push(s);
      }
      let boundary = -1;
      for (let p = 0; p < 2 * n && boundary < 0; p++) {
        const sl = ps[p].sort((a, b) => a - b);
        for (let i = 1; i < sl.length; i++) if (sl[i] - sl[i - 1] === 1) { boundary = sl[i - 1]; break; }
      }
      if (boundary < 0) break;
      if ((grid.length + 1) * slotMin + pauseMin > budgetMin) break;
      grid.splice(boundary + 1, 0, [-1, -1]);
    }
    // v vrsti (queues): [igrišče0, igrišče1]; prazna celica -> premor "Prosto igrišče"
    const queues = [[], []];
    const breaks = {};
    let bid = 1000;
    // prazne celice na repu odrežemo (ne podaljšujejo razporeda)
    const lastUsed = [0, 1].map(c => {
      for (let s = grid.length - 1; s >= 0; s--) if (grid[s][c] >= 0) return s;
      return -1;
    });
    for (let s = 0; s < grid.length; s++) for (let c = 0; c < 2; c++) {
      const mi = grid[s][c];
      if (mi >= 0) queues[c].push({ t: 'm', id: bestAll.matches[mi].id });
      else if (s < lastUsed[c]) {
        breaks[bid] = { id: bid, dur: slotMin, label: 'Prosto igrišče' };
        queues[c].push({ t: 'b', id: bid++ });
      }
    }
    const matchesById = {};
    for (const m of bestAll.matches) matchesById[m.id] = m;
    return { matches: matchesById, queues, breaks, quality: bestAll.total };
  }

  // vstavi premor v vrsto igrišča `court` pred prvi element, ki se začne ob/po timeMin
  function insertBreakAtTime(state, court, timeMin, dur, label, id) {
    const { matchMin, gapMin } = state.cfg;
    const q = state.queues[court];
    let t = 0, idx = q.length;
    for (let i = 0; i < q.length; i++) {
      if (t >= timeMin) { idx = i; break; }
      t += q[i].t === 'b' ? state.breaks[q[i].id].dur : matchMin + gapMin;
    }
    state.breaks[id] = { id, dur, label: label || '' };
    q.splice(idx, 0, { t: 'b', id });
    return id;
  }

  // ---------- časi, preverjanje, lestvica ----------
  // state: {cfg, matches:{id:m}, queues:[[item]], breaks:{id:{id,dur,label}}}
  function computeTimes(state) {
    const { matchMin, gapMin } = state.cfg;
    const times = {}, breakTimes = {};
    const courtEnd = [0, 0];
    for (let c = 0; c < 2; c++) {
      let t = 0;
      for (const it of state.queues[c]) {
        if (it.t === 'b') {
          const br = state.breaks[it.id];
          breakTimes[it.id] = { start: t, end: t + br.dur, court: c };
          t += br.dur;
        } else {
          times[it.id] = { start: t, end: t + matchMin, court: c };
          t += matchMin + gapMin;
        }
      }
      courtEnd[c] = t;
    }
    return { times, breakTimes, courtEnd };
  }

  function playerName(cfg, p) { // p: 0..n-1 punce, n..2n-1 fantje
    const n = cfg.girls.length;
    return p < n ? cfg.girls[p] : cfg.boys[p - n];
  }

  function validate(state) {
    const cfg = state.cfg;
    const n = cfg.girls.length;
    const { times } = computeTimes(state);
    const startMin = clockToMin(cfg.startClock);
    const warnings = [];
    // intervali po igralcih
    const per = Array.from({ length: 2 * n }, () => []);
    for (const id in state.matches) {
      const m = state.matches[id], tm = times[id];
      if (!tm) continue;
      for (const p of matchPlayers(m, n)) per[p].push(tm);
    }
    let NS = null, NE = null;
    const nsc = clockToMin(cfg.nightStartClock), nec = clockToMin(cfg.nightEndClock);
    if (nsc != null && nec != null) {
      NS = ((nsc - startMin) + 1440) % 1440;
      NE = ((nec - startMin) + 1440) % 1440;
      if (NE <= NS) NE += 1440;
    }
    for (let p = 0; p < 2 * n; p++) {
      const iv = per[p].slice().sort((a, b) => a.start - b.start);
      for (let i = 1; i < iv.length; i++) {
        const rest = iv[i].start - iv[i - 1].end;
        const at = minToClock(startMin + iv[i].start);
        if (rest < 0) warnings.push({ lvl: 'err', msg: playerName(cfg, p) + ' igra dve tekmi hkrati (ob ' + at + ')' });
        else if (rest < 25) warnings.push({ lvl: 'warn', msg: playerName(cfg, p) + ' ima le ' + rest + ' min premora pred tekmo ob ' + at });
      }
      if (NS != null) {
        const busy = iv.filter(t => t.end > NS && t.start < NE);
        if (busy.length) {
          let maxFree = busy[0].start - NS, prevEnd = busy[0].end;
          for (let i = 1; i < busy.length; i++) { maxFree = Math.max(maxFree, busy[i].start - prevEnd); prevEnd = Math.max(prevEnd, busy[i].end); }
          maxFree = Math.max(maxFree, NE - prevEnd);
          if (maxFree < 120) warnings.push({ lvl: 'night', msg: playerName(cfg, p) + ' ponoči nima 2 h počitka v kosu (najdaljši ' + Math.max(0, Math.round(maxFree)) + ' min)' });
        }
      }
    }
    return warnings;
  }

  function standings(state) {
    const cfg = state.cfg;
    const n = cfg.girls.length;
    const rows = Array.from({ length: 2 * n }, (_, p) => ({
      p, name: playerName(cfg, p), played: 0, w: 0, d: 0, l: 0, mp: 0, diff: 0, pf: 0
    }));
    for (const id in state.matches) {
      const m = state.matches[id];
      if (!m.res) continue;
      const { a, b } = m.res;
      const side1 = [m.g1, n + m.b1], side2 = [m.g2, n + m.b2];
      const apply = (ps, f, ag) => {
        for (const p of ps) {
          const r = rows[p];
          r.played++; r.pf += f; r.diff += f - ag;
          if (f > ag) { r.w++; r.mp += 2; } else if (f === ag) { r.d++; r.mp += 1; } else r.l++;
        }
      };
      apply(side1, a, b); apply(side2, b, a);
    }
    const enrich = r => ({
      ...r,
      avgMp: r.played ? r.mp / r.played : 0,
      avgDiff: r.played ? r.diff / r.played : 0,
      avgPf: r.played ? r.pf / r.played : 0
    });
    const cmp = (x, y) => (y.avgMp - x.avgMp) || (y.avgDiff - x.avgDiff) || (y.avgPf - x.avgPf) || x.name.localeCompare(y.name, 'sl');
    return {
      girls: rows.slice(0, n).map(enrich).sort(cmp),
      boys: rows.slice(n).map(enrich).sort(cmp)
    };
  }

  // ---------- kodiranje stanja za deljenje (URL hash) ----------
  function b64urlEncode(bytes) {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const b0 = bytes[i], b1 = i + 1 < bytes.length ? bytes[i + 1] : 0, b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
      out += A[b0 >> 2] + A[((b0 & 3) << 4) | (b1 >> 4)];
      if (i + 1 < bytes.length) out += A[((b1 & 15) << 2) | (b2 >> 6)];
      if (i + 2 < bytes.length) out += A[b2 & 63];
    }
    return out;
  }
  function b64urlDecode(str) {
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const idx = {};
    for (let i = 0; i < A.length; i++) idx[A[i]] = i;
    const out = [];
    for (let i = 0; i < str.length; i += 4) {
      const c = [idx[str[i]], idx[str[i + 1]], i + 2 < str.length ? idx[str[i + 2]] : 0, i + 3 < str.length ? idx[str[i + 3]] : 0];
      out.push((c[0] << 2) | (c[1] >> 4));
      if (i + 2 < str.length) out.push(((c[1] & 15) << 4) | (c[2] >> 2));
      if (i + 3 < str.length) out.push(((c[2] & 3) << 6) | c[3]);
    }
    return new Uint8Array(out);
  }

  function encodeState(state) {
    const ms = Object.values(state.matches).map(m =>
      [m.id, m.round, m.g1, m.b1, m.g2, m.b2, m.makeup ? 1 : 0, m.res ? m.res.a : -1, m.res ? m.res.b : -1]);
    const qs = state.queues.map(q => q.map(it => (it.t === 'b' ? 'b' : 'm') + it.id));
    const bs = Object.values(state.breaks).map(b => [b.id, b.dur, b.label || '']);
    const payload = [1, state.cfg, ms, qs, bs];
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    return b64urlEncode(bytes);
  }
  function decodeState(token) {
    const json = new TextDecoder().decode(b64urlDecode(token));
    const [v, cfg, ms, qs, bs] = JSON.parse(json);
    if (v !== 1) throw new Error('Neznana različica podatkov');
    const matches = {};
    for (const a of ms) matches[a[0]] = {
      id: a[0], round: a[1], g1: a[2], b1: a[3], g2: a[4], b2: a[5],
      makeup: !!a[6], res: a[7] >= 0 ? { a: a[7], b: a[8] } : null
    };
    const queues = qs.map(q => q.map(s => ({ t: s[0], id: +s.slice(1) })));
    const breaks = {};
    for (const b of bs) breaks[b[0]] = { id: b[0], dur: b[1], label: b[2] };
    return { cfg, matches, queues, breaks };
  }

  return {
    mulberry32, clockToMin, minToClock, matchPlayers, playerName,
    generate, insertBreakAtTime, computeTimes, validate, standings, encodeState, decodeState
  };
});
