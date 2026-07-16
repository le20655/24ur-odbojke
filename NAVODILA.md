# Navodila — 24 ur odbojke

Stran: **https://le20655.github.io/24ur-odbojke/**

Vse podatke (imena, urnik, rezultate) hrani ena datoteka: **`data.js`**.
Ureja se direktno na GitHubu — stran se posodobi ~1 minuto po commitu.

## Kako vpišeš rezultat

1. Odpri https://github.com/le20655/24ur-odbojke/blob/main/data.js
2. Klikni **svinčnik** (Edit this file) zgoraj desno.
3. V razdelku `REZULTATI` poišči tekmo: ključ je `krog` + `igrišče`
   (`a` = igrišče 1, `b` = igrišče 2). Primer: tekma 5. kroga na igrišču 2 = `"5b"`.
4. Med narekovaje vpiši točke po koncu 35 minut, npr.:

   ```js
   "5b": "28:24",
   ```

   Prva številka = točke **prvega** (levega) para na strani, druga = drugega.
   Prazen niz `""` pomeni, da tekma še ni odigrana.
5. Klikni **Commit changes** (dvakrat zeleno).

Točke se prištejejo **obema** članoma para; lestvici (punce in fantje ločeno)
se razvrščata po skupnih točkah, nato po razliki.

## Imena igralcev

V razdelku `IMENA` v `data.js` zamenjaj placeholderje (`"Punca A"`, `"Fant 1"` …)
s pravimi imeni — oznake (`"A"`, `"1"` …) pusti pri miru.

## Zamik urnika

V razdelku `URNIK`:

```js
const ZACETEK = "17:30";      // začetek 1. kroga
const TRAJANJE_KROGA = 40;    // 35 min igre + 5 min menjava
```

Stran čase vseh 33 krogov izračuna sama. Če urnik zamuja, popravi `ZACETEK`
(velja za cel turnir) — posamičnih krogov se ne da zamikati.

## Največji premori po igralcih

Premor = koliko krogov igralec čaka med dvema svojima zaporednima tekmama
(1 krog = 40 min). Večina premorov je dolgih 1–3 kroge; spodaj je za vsakega
igralca njegov **najdaljši** premor v turnirju.

Prva/zadnja tekma = krog, v katerem igralec igra prvič oz. zadnjič
(krog 1 = 17:30, vsak naslednji +40 min).

**Punce**

| Punca | Ime | Prva tekma (krog) | Zadnja tekma (krog) | Najdaljši premor |
|---|---|---|---|---|
| A | NEŽA BERCE | 2 | 28 | 3 |
| B | NINA TOMAŽIN | 6 | 33 | 3 |
| C | ERIKA MOHORIČ | 1 | 28 | 3 |
| D | MARUŠA DOLINAR | 2 | 33 | 3 |
| E | LIZA POLJANČŠEK | 3 | 32 | 3 |
| F | LIA BERCE | 1 | 32 | 4 |
| G | LOTI GRUŠKO VANJAK | 2 | 33 | 3 |
| H | MAŠA VEGELJ | 1 | 32 | 4 |
| I | PUNCA 9 | 1 | 31 | 3 |
| J | PUNCA 10 | 4 | 32 | **5** |
| K | PUNCA 11 | 2 | 33 | 4 |

**Fantje**

| Fant | Ime | Prva tekma (krog) | Zadnja tekma (krog) | Najdaljši premor |
|---|---|---|---|---|
| 1 | JAKA KOPAČ | 9 | 32 | 3 |
| 2 | ROK MROULE | 2 | 31 | 4 |
| 3 | MATIC ENIKO | 2 | 33 | 3 |
| 4 | JAN GOVEKAR | 1 | 32 | 4 |
| 5 | JUŠ BURJEK | 4 | 33 | 4 |
| 6 | DOMEN DOLENC | 3 | 32 | 4 |
| 7 | KRIŠTOF GANTAR | 1 | 31 | 3 |
| 8 | DAVID ŠENK | 5 | 33 | 3 |
| 9 | JAN DOLENC | 3 | 33 | 3 |
| 10 | URBAN JEREB | 1 | 22 | 3 |
| 11 | LUYGGY | 4 | 32 | 3 |
| 12 | JAKA ENIKO | 1 | 29 | 3 |

Edini premor dolžine 5 v celem turnirju ima punca J (PUNCA 10), vsi ostali
čakajo največ 4 kroge. (Tabela velja za trenutni razpored; po morebitni
regeneraciji z `razpored.py` jo je treba preračunati.)

## Za razvijalce

- `razpored.py` — generator razporeda (prepiše `data.js`! rezultate prej shrani),
- `preveri.py` — verifikator: `python preveri.py` preveri vse kriterije
  (vsak par punca–fant natanko 1×, 8 različnih igralcev na krog,
  max 2 kroga zapored, premor ≤ 5 krogov …).
