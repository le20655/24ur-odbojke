# -*- coding: utf-8 -*-
"""
Generator razporeda za turnir 24 ur odbojke.

11 punc (A-K) x 12 fantov (1-12) -> 132 mesanih parov, vsak par igra natanko
enkrat -> 66 tekem -> 33 krogov po 2 igrisci.

Faza A (algebraicna, brez iskanja):
  Fantje so razdeljeni v 11 "rund" kroznega round-robina (K12): v vsaki rundi
  6 tekem, vsak par fantov se sreca natanko enkrat. Punca partnerka fanta b
  v rundi s je (s+b) mod 11 za b=0..10, za fanta 11 pa (2s+1) mod 11.
  To zagotovi: vsak mesani par natanko enkrat, na tekmi 2 razlicni punci,
  vsak fant igra proti vsakemu fantu natanko 1x, vsaka punca proti vsaki
  punci 1x ali 2x (manj se matematicno ne da).

Faza B (simulirano ohlajanje):
  66 tekem razporedi v 33 krogov x 2 igrisci tako, da:
    - v krogu igra 8 razlicnih oseb,
    - nihce ne igra vec kot 2 kroga zapored,
    - premor med tekmama istega igralca <= 5 krogov (cilj vecinoma 1-3).

Uporaba:  python razpored.py          (zapise data.js in pozene preveri.py)
"""

import random
import subprocess
import sys

PUNCE = [chr(ord("A") + i) for i in range(11)]   # A..K
FANTJE = [str(i + 1) for i in range(12)]          # 1..12

# prava imena po oznakah A-K / 1-12 (vrstni red je uskladil organizator
# na GitHubu 16. 7. 2026 -- ob spremembi uskladi z IMENA v data.js!)
IMENA_PUNCE = ["NEŽA BERCE", "NINA TOMAŽIN", "LIA BERCE", "MARUŠA DOLINAR",
               "TIA MOČNIK", "ERIKA MOHORIČ", "LOTI GRUŠKOVNJAK", "MAŠA VEGELJ",
               "LIZA POLJANŠEK", "LENA KRISTAN", "EMA KAVČIČ"]
IMENA_FANTJE = ["KRIŠTOF GANTAR", "ROK MROULE", "MATIC ENIKO", "JAN GOVEKAR",
                "JUŠ BURJEK", "DOMEN DOLENC", "JAKA KOPAČ", "DAVID ŠENK",
                "JAN DOLENC", "URBAN JEREB", "LUYGGY", "BRIC KROLNIK"]

N_KROGOV = 33

# utezi cenilke (trdi kriteriji morajo na 0)
W_PREKRIVANJE = 1000   # skupen igralec na obeh igriscih v krogu
W_ZAPORED = 1000       # vec kot 2 kroga zapored (na krog cez mejo)
W_PREMOR = 1000        # premor > 5 krogov (na krog cez mejo)
W_MEHKO_5 = 3          # premor tocno 5 (dovoljeno, a nezazeleno)
W_MEHKO_4 = 1          # premor tocno 4 (izjemoma)


def faza_a():
    """Vrne seznam 66 tekem: (punca1, fant1, punca2, fant2) kot indeksi."""
    tekme = []
    for s in range(11):
        # fant 11 (indeks) proti fantu s
        g1 = (2 * s + 1) % 11   # partnerka fanta 11
        g2 = (2 * s) % 11       # partnerka fanta s
        tekme.append((g1, 11, g2, s))
        for k in range(1, 6):
            b1 = (s + k) % 11
            b2 = (s - k) % 11
            tekme.append(((2 * s + k) % 11, b1, (2 * s - k) % 11, b2))
    return tekme


def igralci(tekma):
    g1, b1, g2, b2 = tekma
    return (("P", g1), ("F", b1), ("P", g2), ("F", b2))


def cena_igralca(krogi):
    """Kazen za enega igralca glede na (urejen) seznam krogov, ko igra."""
    kazen = 0
    zapored = 1
    for i in range(1, len(krogi)):
        d = krogi[i] - krogi[i - 1]
        if d == 1:
            zapored += 1
            if zapored > 2:
                kazen += W_ZAPORED
        else:
            zapored = 1
            premor = d - 1
            if premor > 5:
                kazen += W_PREMOR * (premor - 5)
            elif premor == 5:
                kazen += W_MEHKO_5
            elif premor == 4:
                kazen += W_MEHKO_4
    return kazen


def krogi_igralcev(razpored):
    """Za vsakega igralca urejen seznam krogov (0-indeksirano), ko igra."""
    kr = {}
    for pos, tekma in enumerate(razpored):
        krog = pos // 2
        for ig in igralci(tekma):
            kr.setdefault(ig, []).append(krog)
    for v in kr.values():
        v.sort()
    return kr


def cena(razpored):
    kazen = 0
    for krog in range(N_KROGOV):
        a, b = razpored[2 * krog], razpored[2 * krog + 1]
        skupni = set(igralci(a)) & set(igralci(b))
        kazen += W_PREKRIVANJE * len(skupni)
    for kr in krogi_igralcev(razpored).values():
        kazen += cena_igralca(kr)
    return kazen


def faza_b(tekme, seed):
    """Simulirano ohlajanje: permutacija 66 tekem -> 33 krogov x 2 igrisci."""
    rnd = random.Random(seed)
    razpored = tekme[:]
    rnd.shuffle(razpored)
    trenutna = cena(razpored)
    najboljsa = trenutna
    najboljsi = razpored[:]

    T = 60.0
    for korak in range(400_000):
        T = max(0.02, T * 0.99997)
        i = rnd.randrange(66)
        j = rnd.randrange(66)
        if i == j:
            continue
        razpored[i], razpored[j] = razpored[j], razpored[i]
        nova = cena(razpored)
        if nova <= trenutna or rnd.random() < pow(2.718, (trenutna - nova) / T):
            trenutna = nova
            if nova < najboljsa:
                najboljsa = nova
                najboljsi = razpored[:]
                if najboljsa == 0:
                    break
        else:
            razpored[i], razpored[j] = razpored[j], razpored[i]
    return najboljsi, najboljsa


def zapisi_data_js(razpored, pot="data.js"):
    vrstice = []
    vrstice.append("// Podatki turnirja 24 ur odbojke.")
    vrstice.append("// ROCNO UREJAJ SAMO razdelka IMENA in REZULTATI.")
    vrstice.append("")
    vrstice.append("// ===== IMENA: placeholderje zamenjaj s pravimi imeni =====")
    vrstice.append("const IMENA = {")
    for p, ime in zip(PUNCE, IMENA_PUNCE):
        vrstice.append('  "%s": "%s",' % (p, ime))
    for f, ime in zip(FANTJE, IMENA_FANTJE):
        vrstice.append('  "%s": "%s",' % (f, ime))
    vrstice.append("};")
    vrstice.append("")
    vrstice.append("// ===== URNIK: datum in zacetek prvega kroga, trajanje kroga v minutah =====")
    vrstice.append("// Ob zamiku urnika popravi te vrednosti (stran case izracuna sama).")
    vrstice.append('const DATUM = "2026-07-17";')
    vrstice.append('const ZACETEK = "17:30";')
    vrstice.append("const TRAJANJE_KROGA = 40;")
    vrstice.append("")
    vrstice.append('// ===== REZULTATI: vpisi tocke po koncu tekme, npr. "28:24" =====')
    vrstice.append("// Prva stevilka = tocke prvega para (levo), druga = drugega para.")
    vrstice.append('// Prazen niz "" pomeni, da tekma se ni odigrana.')
    vrstice.append("const REZULTATI = {")
    for krog in range(1, N_KROGOV + 1):
        vrstice.append('  "%da": "",  "%db": "",' % (krog, krog))
    vrstice.append("};")
    vrstice.append("")
    vrstice.append("// ===== RAZPORED: generiran z razpored.py - NE spreminjaj rocno =====")
    vrstice.append("// [krog, igrisce, punca1, fant1, punca2, fant2]")
    vrstice.append("const RAZPORED = [")
    for pos, (g1, b1, g2, b2) in enumerate(razpored):
        krog = pos // 2 + 1
        igrisce = "a" if pos % 2 == 0 else "b"
        vrstice.append('  [%d, "%s", "%s", "%s", "%s", "%s"],'
                       % (krog, igrisce, PUNCE[g1], FANTJE[b1], PUNCE[g2], FANTJE[b2]))
    vrstice.append("];")
    vrstice.append("")
    with open(pot, "w", encoding="utf-8") as f:
        f.write("\n".join(vrstice))


def main():
    tekme = faza_a()
    assert len(tekme) == 66

    for seed in range(1, 50):
        razpored, kazen = faza_b(tekme, seed)
        print("seed %d: kazen %d" % (seed, kazen))
        if kazen < W_PREKRIVANJE:  # < 1000 pomeni 0 trdih krsitev
            zapisi_data_js(razpored)
            print("Razpored zapisan v data.js (seed %d, mehka kazen %d)." % (seed, kazen))
            break
    else:
        print("NEUSPEH: v 49 poskusih ni razporeda brez krsitev.")
        sys.exit(1)

    print()
    subprocess.call([sys.executable, "preveri.py"])


if __name__ == "__main__":
    main()
