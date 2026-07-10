// Smoke test: zažene script bloka iz zgrajenih strani z mini DOM-om (brez brskalnika).
// - uredi.html  (editor): glava, zavihki, nastavitev, razpored, filter igrišč, objava
// - index.html  (viewer): naloži data.js, bralni razpored + lestvica
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = __dirname;

function makeCtx(dataJs){
  const els = {};
  function el(sel){
    if (!els[sel]) els[sel] = {
      innerHTML: '', textContent: '', className: '', value: '',
      appendChild(){}, remove(){}, classList: { contains: () => false },
    };
    return els[sel];
  }
  const ctx = {
    document: {
      querySelector: sel => el(sel),
      querySelectorAll: () => [],
      createElement: () => el('#tmp' + Math.random()),
      addEventListener(){},
      activeElement: null,
      body: { innerHTML: '', appendChild(){} },
    },
    console,
    location: { hash: '', href: 'https://le20655.github.io/24ur-odbojke/' },
    localStorage: { getItem: () => null, setItem(){}, removeItem(){} },
    navigator: {},
    fetch: dataJs
      ? () => Promise.resolve({ text: () => Promise.resolve(dataJs) })
      : () => Promise.reject(new Error('brez mreže')),
    setInterval(){}, setTimeout(){}, alert(){}, confirm: () => false, prompt: () => null,
    Date, JSON, Math, Object, Array, String, Number, URL, Blob: class {},
    TextEncoder, TextDecoder, Uint8Array,
  };
  ctx.addEventListener = () => {};
  ctx.window = ctx;
  ctx.self = ctx; // kot v brskalniku: self === window
  vm.createContext(ctx);
  return { ctx, el };
}

async function runPage(file, dataJs){
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (scripts.length !== 2) throw new Error(file + ': pričakovana 2 script bloka, najdenih ' + scripts.length);
  const { ctx, el } = makeCtx(dataJs);
  vm.runInContext(scripts[0], ctx, { filename: 'core.js' });
  vm.runInContext(scripts[1], ctx, { filename: 'app.js' });
  for (let i = 0; i < 10; i++) await new Promise(r => setImmediate(r)); // fetch verige
  return { ctx, el };
}

(async () => {
const checks = [];

// ===== editor (uredi.html) =====
{
  const { ctx, el } = await runPage('uredi.html');
  checks.push(
    ['editor: ura v glavi', /clock mono/.test(el('#topstats').innerHTML)],
    ['editor: zavihki', /Nastavitev/.test(el('#tabs').innerHTML)],
    ['editor: nastavitev', /Igralci in nastavitve/.test(el('#main').innerHTML)],
    ['editor: privzeta imena', /NEŽA/.test(el('#main').innerHTML) && /JAKA/.test(el('#main').innerHTML)],
    ['editor: Core na voljo', vm.runInContext('typeof Core.generate === "function" && typeof Core.encodeState === "function"', ctx)],
  );
  // razpored z 2 tekmama, izbirnik igrišč, objava
  vm.runInContext(`
    S.matches = { 1: {id:1,g1:0,b1:0,g2:1,b2:1,round:0,res:null},
                  2: {id:2,g1:2,b1:2,g2:3,b2:3,round:0,res:{a:21,b:15}} };
    S.queues = [[{t:'m',id:1}],[{t:'m',id:2}]];
    S.breaks = {};
    tab = 'sched'; courtView = 'all'; renderMain();
    __all = document.querySelector('#main').innerHTML;
    courtView = '1'; renderMain();
    __b = document.querySelector('#main').innerHTML;
    __pub = publishText();
  `, ctx, { filename: 'faza2.js' });
  const all = vm.runInContext('__all', ctx), b = vm.runInContext('__b', ctx), pub = vm.runInContext('__pub', ctx);
  checks.push(
    ['editor: izbirnik igrišč', /Obe igrišči/.test(all) && /data-act="cview"/.test(all)],
    ['editor: obe igrišči vidni', /IGRIŠČE 1/.test(all) && /IGRIŠČE 2/.test(all)],
    ['editor: filter samo 2', !/IGRIŠČE 1/.test(b) && /IGRIŠČE 2/.test(b) && / single/.test(b)],
    ['editor: rezultat izpisan', /21 : 15/.test(b)],
    ['editor: publishText format', /^PUB = \{$/m.test(pub) && /rezultati: \{/.test(pub) && / 2: \[21, 15\],/.test(pub) && / 1: null,/.test(pub)],
  );
  // zaklep turnirja: skrije Nastavitev + generiranje/uvoz, preusmeri s Nastavitve, ostane vpisovanje
  vm.runInContext(`
    tab = 'setup'; locked = true; renderAll();
    __ltabs = document.querySelector('#tabs').innerHTML;
    __ltools = document.querySelector('#toolbar').innerHTML;
    __lmain = document.querySelector('#main').innerHTML;
    __ltab = tab;
    locked = false; renderAll();
    __utabs = document.querySelector('#tabs').innerHTML;
  `, ctx, { filename: 'faza3.js' });
  const ltabs = vm.runInContext('__ltabs', ctx), ltools = vm.runInContext('__ltools', ctx);
  const lmain = vm.runInContext('__lmain', ctx), ltab = vm.runInContext('__ltab', ctx);
  const utabs = vm.runInContext('__utabs', ctx);
  checks.push(
    ['editor: zaklep skrije Nastavitev', !/Nastavitev/.test(ltabs)],
    ['editor: zaklep ponudi Odkleni in skrije Uvoz', /Odkleni turnir/.test(ltools) && !/data-act="import"/.test(ltools)],
    ['editor: zaklep preusmeri s Nastavitve', ltab === 'sched' && !/Igralci in nastavitve/.test(lmain)],
    ['editor: odklep vrne Nastavitev', /Nastavitev/.test(utabs)],
  );
}

// ===== viewer (index.html + pravi data.js) =====
{
  const dataJs = fs.readFileSync(path.join(dir, 'data.js'), 'utf8');
  const { ctx, el } = await runPage('index.html', dataJs);
  const main = el('#main').innerHTML, tabs = el('#tabs').innerHTML;
  const top = el('#topstats').innerHTML, tools = el('#toolbar').innerHTML;
  vm.runInContext('courtView = "1"; renderMain(); __b = document.querySelector("#main").innerHTML; courtView = "0";', ctx);
  const courtB = vm.runInContext('__b', ctx);
  vm.runInContext('tab = "board"; renderMain();', ctx);
  const board = el('#main').innerHTML;
  checks.push(
    ['viewer: privzeto samo igrišče 1', /IGRIŠČE 1/.test(main) && !/IGRIŠČE 2/.test(main)],
    ['viewer: preklop na igrišče 2', /IGRIŠČE 2/.test(courtB) && !/IGRIŠČE 1/.test(courtB)],
    ['viewer: brez možnosti obeh hkrati', !/Obe igrišči/.test(main)],
    ['viewer: izbirnik v lepljivi glavi', /data-act="cview"/.test(el('#segbar').innerHTML) && !/data-act="cview"/.test(main)],
    ['viewer: brez ure in brez Natisni', !/clock mono/.test(top) && tools === ''],
    ['viewer: odigrane in konec v glavi', /odigranih/.test(top) && /konec ob/.test(top)],
    ['viewer: pasica z objavo', /Zadnja objava/.test(main)],
    ['viewer: bralni pogled (brez urejanja)', !/Nastavitev/.test(tabs) && !/data-act="rsave"/.test(main)],
    ['viewer: rezultati vidni', /\d+ : \d+/.test(main.replace(/\d+:\d+/g, ''))],
    ['viewer: lestvica', /Punce/.test(board) && /Fantje/.test(board) && /Točke\/T/.test(board)],
  );
  // brez mreže: prijazno sporočilo, ne prazna stran
  const off = await runPage('index.html', null);
  checks.push(['viewer: brez data.js pokaže sporočilo', /ni objavljen/.test(off.el('#main').innerHTML)]);
}

let ok = true;
for (const [name, pass] of checks){ console.log((pass ? 'OK  ' : 'FAIL') + ' ' + name); if (!pass) ok = false; }
process.exit(ok ? 0 : 1);
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
