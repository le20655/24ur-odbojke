---
name: deploy
description: Objavi "24 ur odbojke" na GitHub Pages — build, commit, push in počakaj, da je nova verzija živa.
---

Stran živi na **https://le20655.github.io/24ur-odbojke/** (repo `le20655/24ur-odbojke`,
veja `main`, koren). Lenart NE želi claude.ai artifacts.

1. Najprej poženi projektni skill `verify` (build + smoke test).
2. Commit in push (`gh` je v `~/.local/bin/gh`, credential helper je že nastavljen):

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
