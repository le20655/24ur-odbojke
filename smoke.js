// Smoke test: zažene oba <script> bloka iz index.html z mini DOM-om
// in preveri, da boot() izriše glavo, zavihke in vsebino.
const fs = require('fs'), vm = require('vm'), path = require('path');
const file = process.argv[2] || path.join(__dirname, 'index.html');
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length !== 2) { console.error('FAIL: pričakovana 2 script bloka, najdenih ' + scripts.length); process.exit(1); }

const els = {};
function el(sel){
  if (!els[sel]) els[sel] = {
    innerHTML: '', textContent: '', className: '', value: '',
    appendChild(){}, remove(){}, classList: { contains: () => false },
  };
  return els[sel];
}
const document = {
  querySelector: sel => el(sel),
  createElement: () => el('#tmp' + Math.random()),
  addEventListener(){},
  activeElement: null,
  body: { innerHTML: '', appendChild(){} },
};
const ctx = {
  document, console,
  self: {},
  window: { addEventListener(){} },
  location: { hash: '', href: 'https://le20655.github.io/24ur-odbojke/' },
  localStorage: { getItem: () => null, setItem(){}, removeItem(){} },
  navigator: {},
  setInterval(){}, setTimeout(fn){ }, alert(){}, confirm: () => false, prompt: () => null,
  Date, JSON, Math, Object, Array, String, Number, URL, Blob: class {},
};
ctx.addEventListener = () => {};
ctx.window = ctx;
ctx.self = ctx; // kot v brskalniku: self === window
vm.createContext(ctx);
try {
  vm.runInContext(scripts[0], ctx, { filename: 'core.js' });
  vm.runInContext(scripts[1], ctx, { filename: 'app.js' });
} catch (e) {
  console.error('FAIL: napaka ob zagonu strani:', e.message);
  process.exit(1);
}
const top = el('#topstats').innerHTML, tabs = el('#tabs').innerHTML, main = el('#main').innerHTML;
const checks = [
  ['ura v glavi', /clock mono/.test(top)],
  ['zavihki', /Nastavitev/.test(tabs)],
  ['vsebina (setup)', /Igralci in nastavitve/.test(main)],
  ['privzeta imena', /NEŽA/.test(main) && /JAKA/.test(main)],
  ['Core na voljo', vm.runInContext(
     'typeof Core.generate === "function" && typeof Core.encodeState === "function" && typeof Core.standings === "function"', ctx)],
];
// faza 2: razpored z 2 tekmama, izbirnik igrišč
let schedAll = '', schedB = '';
try {
  vm.runInContext(`
    S.matches = { 1: {id:1,g1:0,b1:0,g2:1,b2:1,round:0,res:null},
                  2: {id:2,g1:2,b1:2,g2:3,b2:3,round:0,res:{a:21,b:15}} };
    S.queues = [[{t:'m',id:1}],[{t:'m',id:2}]];
    S.breaks = {};
    tab = 'sched'; courtView = 'all'; renderMain();
    __sched_all = document.querySelector('#main').innerHTML;
    courtView = '1'; renderMain();
    __sched_b = document.querySelector('#main').innerHTML;
  `, ctx, { filename: 'phase2.js' });
  schedAll = el('#main').innerHTML && vm.runInContext('__sched_all', ctx);
  schedB = vm.runInContext('__sched_b', ctx);
} catch (e) { console.error('FAIL: napaka pri izrisu razporeda:', e.message); process.exit(1); }
checks.push(
  ['razpored: izbirnik igrišč', /Obe igrišči/.test(schedAll) && /data-act="cview"/.test(schedAll)],
  ['razpored: obe igrišči vidni', /IGRIŠČE A/.test(schedAll) && /IGRIŠČE B/.test(schedAll)],
  ['razpored: filter samo B', !/IGRIŠČE A/.test(schedB) && /IGRIŠČE B/.test(schedB) && / single/.test(schedB)],
  ['razpored: rezultat izpisan', /21 : 15/.test(schedB)],
);
let ok = true;
for (const [name, pass] of checks){ console.log((pass ? 'OK  ' : 'FAIL') + ' ' + name); if (!pass) ok = false; }
process.exit(ok ? 0 : 1);
