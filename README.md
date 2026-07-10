# 24 ur odbojke

Spletni razpored in lestvica za mešani odbojkarski turnir »24 ur odbojke«.

## 🔗 Živa stran za igralce

**<https://le20655.github.io/24ur-odbojke/>**

Tu igralci vidijo urnik in lestvico. Stran se osvežuje sama vsakih 60 sekund.

## Kako je sestavljeno

| Stran | Za koga | Kaj počne |
|-------|---------|-----------|
| [`index.html`](https://le20655.github.io/24ur-odbojke/) | igralci | javni pogled — razpored + lestvica (bere `data.js`) |
| `uredi.html` | organizator | urejevalnik: generira razpored, vpisuje rezultate, objavlja |
| `24ur-odbojke.html` | organizator | offline kopija urejevalnika |

`index.html`, `uredi.html` in `24ur-odbojke.html` so **zgenerirane** — ureja se le
`app.html` (predloga) in `core.js` (logika turnirja, brez DOM-a).

## Gradnja

```sh
python build.py "https://le20655.github.io/24ur-odbojke/"
```

Zgradi tri strani iz `app.html` + `core.js`. Argument je javna povezava (za gumb »Deli razpored«).

## Objava rezultatov

V urejevalniku (`uredi.html`) sta dva načina:

- **Objavi na splet** — potisne `data.js` naravnost v repo prek GitHub API (en klik).
  Ob prvi uporabi vpišeš fine-grained token z dovoljenjem *Contents: write*;
  shrani se samo v tvoj brskalnik.
- **Kopiraj za objavo** — skopira vsebino `data.js`, ki jo ročno prilepiš in `git push`.

Javna stran je sveža v ~1 minuti po objavi.

## Testi

```sh
node test.js    # logika turnirja (generiranje razporeda, lestvica)
node smoke.js   # izris urejevalnika in javne strani
```
