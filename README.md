# 24 ur odbojke

Spletni razpored in lestvica za mešani odbojkarski turnir »24 ur odbojke«:
11 punc × 12 fantov, vsak mešani par igra natanko enkrat → 66 tekem,
33 krogov po 2 igrišči, cikel 40 minut (35 min igre + 5 min menjava).

## 🔗 Živa stran

**<https://le20655.github.io/24ur-odbojke/>**

Razpored po krogih s časi, iskalnik igralca in lestvici (punce/fantje ločeno).

## Datoteke

| Datoteka | Kaj je |
|----------|--------|
| `index.html` | javna stran (bere `data.js`, brez gradnje) |
| `data.js` | vsi podatki: imena, urnik, rezultati, razpored — ureja se ročno na GitHubu |
| `razpored.py` | generator razporeda (prepiše `data.js`) |
| `preveri.py` | verifikator kriterijev razporeda |
| `NAVODILA.md` | kako vpisati rezultat, zamakniti urnik, vnesti imena |

## Rezultati in urnik

Vse se ureja neposredno v `data.js` na GitHubu — glej **[NAVODILA.md](NAVODILA.md)**.
Stran je sveža ~1 minuto po commitu.

## Kriteriji razporeda

- vsak par punca–fant natanko enkrat (132 parov, 66 tekem),
- v vsakem krogu 8 različnih igralcev (4 punce + 4 fantje),
- nihče ne igra več kot 2 kroga zapored,
- premor med tekmama ≤ 5 krogov (večinoma 1–3),
- vsak fant igra proti vsakemu fantu natanko 1×, punca proti punci 1–2×.

Preverba: `python preveri.py`
