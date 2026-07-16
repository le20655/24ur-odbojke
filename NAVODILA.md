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

## Za razvijalce

- `razpored.py` — generator razporeda (prepiše `data.js`! rezultate prej shrani),
- `preveri.py` — verifikator: `python preveri.py` preveri vse kriterije
  (vsak par punca–fant natanko 1×, 8 različnih igralcev na krog,
  max 2 kroga zapored, premor ≤ 5 krogov …).
