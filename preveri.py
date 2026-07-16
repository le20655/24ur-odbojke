# -*- coding: utf-8 -*-
"""
Neodvisen verifikator razporeda: prebere RAZPORED iz data.js in preveri
vse kriterije turnirja. Uporaba: python preveri.py
"""

import re
import sys
from collections import Counter, defaultdict

PUNCE = [chr(ord("A") + i) for i in range(11)]
FANTJE = [str(i + 1) for i in range(12)]
N_KROGOV = 33

napake = []


def ok(pogoj, opis):
    print(("  OK   " if pogoj else "  NAPAKA ") + opis)
    if not pogoj:
        napake.append(opis)


def preberi_razpored(pot="data.js"):
    with open(pot, encoding="utf-8") as f:
        vsebina = f.read()
    m = re.search(r"const RAZPORED = \[(.*?)\];", vsebina, re.S)
    if not m:
        sys.exit("V data.js ni RAZPORED.")
    tekme = []
    for vrstica in re.findall(r"\[([^\]]+)\]", m.group(1)):
        deli = [d.strip().strip('"') for d in vrstica.split(",")]
        krog, igrisce, g1, b1, g2, b2 = deli
        tekme.append((int(krog), igrisce, g1, b1, g2, b2))
    return tekme


def main():
    tekme = preberi_razpored()

    print("1. Struktura")
    ok(len(tekme) == 66, "66 tekem (je %d)" % len(tekme))
    po_krogih = defaultdict(list)
    for t in tekme:
        po_krogih[t[0]].append(t)
    ok(sorted(po_krogih) == list(range(1, N_KROGOV + 1)), "krogi 1-33")
    ok(all(sorted(t[1] for t in po_krogih[k]) == ["a", "b"] for k in po_krogih),
       "v vsakem krogu igrisci a in b")

    print("2. Tekme in pari")
    pari = Counter()
    vsi_razlicni = True
    for _, _, g1, b1, g2, b2 in tekme:
        pari[(g1, b1)] += 1
        pari[(g2, b2)] += 1
        if g1 == g2 or b1 == b2:
            vsi_razlicni = False
    ok(vsi_razlicni, "na vsaki tekmi 2 razlicni punci in 2 razlicna fanta")
    ok(len(pari) == 132 and all(v == 1 for v in pari.values()),
       "vseh 132 parov punca-fant natanko enkrat")

    print("3. Obremenitev")
    nastopi = Counter()
    for _, _, g1, b1, g2, b2 in tekme:
        nastopi["P" + g1] += 1
        nastopi["P" + g2] += 1
        nastopi["F" + b1] += 1
        nastopi["F" + b2] += 1
    ok(all(nastopi["P" + p] == 12 for p in PUNCE), "vsaka punca 12 tekem")
    ok(all(nastopi["F" + f] == 11 for f in FANTJE), "vsak fant 11 tekem")

    print("4. Krogi")
    krogi_igralca = defaultdict(list)
    prekrivanje = True
    for k in range(1, N_KROGOV + 1):
        osebe = []
        for _, _, g1, b1, g2, b2 in po_krogih[k]:
            osebe += ["P" + g1, "P" + g2, "F" + b1, "F" + b2]
        if len(set(osebe)) != 8:
            prekrivanje = False
        for o in set(osebe):
            krogi_igralca[o].append(k)
    ok(prekrivanje, "v vsakem krogu 8 razlicnih igralcev")

    print("5. Dinamika")
    max_zapored = 0
    premori = Counter()
    max_premor = 0
    for krogi in krogi_igralca.values():
        krogi.sort()
        zapored = 1
        for i in range(1, len(krogi)):
            d = krogi[i] - krogi[i - 1]
            if d == 1:
                zapored += 1
                max_zapored = max(max_zapored, zapored)
            else:
                zapored = 1
                premori[d - 1] += 1
                max_premor = max(max_premor, d - 1)
    ok(max_zapored <= 2, "nihce ne igra vec kot 2 kroga zapored (max %d)" % max_zapored)
    ok(max_premor <= 5, "premor med tekmama <= 5 krogov (max %d)" % max_premor)

    print("6. Statistika (informativno)")
    print("     premori med tekmama:",
          ", ".join("%d krogov: %dx" % (p, premori[p]) for p in sorted(premori)))
    nasprotniki_p = Counter()
    nasprotniki_f = Counter()
    for _, _, g1, b1, g2, b2 in tekme:
        nasprotniki_p[frozenset((g1, g2))] += 1
        nasprotniki_f[frozenset((b1, b2))] += 1
    print("     punca proti punci: min %dx, max %dx (parov: %d/55)"
          % (min(nasprotniki_p.values()), max(nasprotniki_p.values()), len(nasprotniki_p)))
    print("     fant proti fantu:  min %dx, max %dx (parov: %d/66)"
          % (min(nasprotniki_f.values()), max(nasprotniki_f.values()), len(nasprotniki_f)))

    print()
    if napake:
        print("SKUPAJ: %d NAPAK!" % len(napake))
        sys.exit(1)
    print("SKUPAJ: vsi kriteriji izpolnjeni.")


if __name__ == "__main__":
    main()
