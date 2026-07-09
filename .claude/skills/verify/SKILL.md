---
name: verify
description: Preveri spremembe aplikacije "24 ur odbojke" — build, DOM smoke test in (ob spremembi core.js) testi generatorja.
---

Vse poganjaj iz mape projekta. Node ni sistemski:

```bash
export PATH="$HOME/.local/opt/node-v22.17.0-linux-x64/bin:$PATH"
```

1. **Vedno** — zgradi in poženi smoke test (izriše stran v mini-DOM brez brskalnika,
   preveri glavo, zavihke, nastavitev, razpored, filter igrišč A/B in rezultate):

   ```bash
   python3 build.py 'https://le20655.github.io/24ur-odbojke/'
   node smoke.js          # privzeto testira index.html
   ```

   Vsa preverjanja morajo biti `OK`. Ob novi vidni funkciji v `app.html` dodaj
   ustrezno preverjanje v `smoke.js`.

2. **Če je spremenjen `core.js`** — testi generatorja (trajajo ~1,5 min):

   ```bash
   node test.js
   ```

   Uspeh je izpis `VSI TESTI OK`.

Pasti iz preteklosti:
- top-level `const` pred zagonsko IIFE v `app.html` je enkrat že povzročil TDZ
  napako in prazno stran — smoke test to ujame, zato ga ne preskakuj;
- headless Firefox na tem sistemu ne dela (snap peskovnik) — ne izgubljaj časa
  s posnetki zaslona, razen če je na voljo Playwright/Chromium.
