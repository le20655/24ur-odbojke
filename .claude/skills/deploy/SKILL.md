---
name: deploy
description: Objavi "24 ur odbojke" na GitHub Pages — build, commit, push in počakaj, da je nova verzija živa.
---

Javna stran za igralce: **https://le20655.github.io/24ur-odbojke/** (repo
`le20655/24ur-odbojke`, veja `main`, koren). Lenart NE želi claude.ai artifacts.

Strani (vse zgradi `build.py`):
- `index.html` — javni pogled za igralce (razpored + lestvica); podatke bere iz `data.js`
- `uredi.html` — urejevalnik za organizatorja (localStorage)
- `24ur-odbojke.html` — offline kopija urejevalnika

Podatki turnirja so v **`data.js`**: `token` (zakodiran razpored, ne urejaj ročno)
+ `rezultati` (id → `[a, b]` ali `null`, vsaka vrstica ima komentar kdo/kdaj igra).
Lenart jih med turnirjem posodablja ročno: uredi `data.js` → commit → push.
Celotno svežo vsebino `data.js` naredi gumb **"Kopiraj za objavo"** v `uredi.html`.

Postopek objave kode:

1. Poženi projektni skill `verify` (build + smoke test).
2. Commit in push (`gh` je v `~/.local/bin/gh`, credential helper je nastavljen):

   ```bash
   git add -A && git commit -m "..." && git push origin main
   ```

3. Počakaj, da Pages postreže novo verzijo (~30–60 s). Preverjaj niz, ki je nov
   v tej spremembi (ne le HTTP 200 — stara verzija tudi vrača 200):

   ```bash
   for i in $(seq 1 40); do
     curl -s https://le20655.github.io/24ur-odbojke/ | grep -q 'NEK-NOV-NIZ' && echo ZIVO && break
     sleep 5
   done
   ```

4. Uporabniku omeni, naj na telefonu osveži stran, če vidi staro verzijo.

`build.py` vzame SHARE_BASE kot argument — pri objavi vedno
`python3 build.py 'https://le20655.github.io/24ur-odbojke/'`, sicer gumb
"Deli razpored" izgubi javno povezavo v offline kopiji.
