// Podatki turnirja 24 ur odbojke.
// ROCNO UREJAJ SAMO razdelka IMENA in REZULTATI.

// ===== IMENA: placeholderje zamenjaj s pravimi imeni =====
const IMENA = {
  "A": "NEŽA BERCE",
  "B": "NINA TOMAŽIN",
  "C": "LIA BERCE",
  "D": "MARUŠA DOLINAR", // PLAČANO
  "E": "TIA MOČNIK", // PLAČANO
  "F": "ERIKA MOHORIČ", // PLAČANO
  "G": "LOTI GRUŠKOVNJAK", // PLAČANO
  "H": "MAŠA VEGELJ", // PLAČANO
  "I": "LIZA POLJANŠEK",
  "J": "LENA KRISTAN",
  "K": "EMA KAVČIČ",
  "1": "KRIŠTOF GANTAR", // PLAČANO
  "2": "ROK MROULE",
  "3": "MATIC ENIKO",
  "4": "JAN GOVEKAR",
  "5": "JUŠ BURJEK",
  "6": "DOMEN DOLENC", // PLAČANO
  "7": "JAKA KOPAČ", 
  "8": "DAVID ŠENK", // PLAČANO
  "9": "JAN DOLENC", // PLAČANO
  "10": "URBAN JEREB",
  "11": "LUYGGY",
  "12": "BRIC KROLNIK",
};

// ===== URNIK: datum in zacetek prvega kroga, trajanje kroga v minutah =====
// Ob zamiku urnika popravi te vrednosti (stran case izracuna sama).
const DATUM = "2026-07-17";
const ZACETEK = "17:30";
const TRAJANJE_KROGA = 40;

// ===== REZULTATI: vpisi tocke po koncu tekme, npr. "28:24" =====
// Prva stevilka = tocke prvega para (v komentarju levo), druga = drugega.
// Prazen niz "" pomeni, da tekma se ni odigrana.
// Komentarji (ura in para) so informativni; veljajo za zacetek ob 17:30.
const REZULTATI = {
  "1a": "54:27",           // 17:30 ig.1 | LIA BERCE & JAN GOVEKAR — ERIKA MOHORIČ & JAKA KOPAČ
  "1b": "62:41",           // 17:30 ig.2 | LIZA POLJANŠEK & BRIC KROLNIK — MAŠA VEGELJ & URBAN JEREB
  "2a": "49:46",           // 18:10 ig.1 | MARUŠA DOLINAR & URBAN JEREB — LOTI GRUŠKOVNJAK & ROK MROULE
  "2b": "28:47",           // 18:10 ig.2 | EMA KAVČIČ & MATIC ENIKO — NEŽA BERCE & JAN GOVEKAR
  "3a": "24:53",           // 18:50 ig.1 | TIA MOČNIK & JAN DOLENC — LIA BERCE & JAKA KOPAČ
  "3b": "49:35",           // 18:50 ig.2 | NEŽA BERCE & BRIC KROLNIK — EMA KAVČIČ & DOMEN DOLENC
  "4a": "41:34",           // 19:30 ig.1 | LIA BERCE & URBAN JEREB — MARUŠA DOLINAR & LUYGGY
  "4b": "41:30",           // 19:30 ig.2 | LENA KRISTAN & BRIC KROLNIK — LIZA POLJANŠEK & JUŠ BURJEK
  "5a": "41:36",           // 20:10 ig.1 | ERIKA MOHORIČ & JAN GOVEKAR — MARUŠA DOLINAR & ROK MROULE
  "5b": "44:67",           // 20:10 ig.2 | TIA MOČNIK & JUŠ BURJEK — MAŠA VEGELJ & DAVID ŠENK
  "6a": "25:54",           // 20:50 ig.1 | EMA KAVČIČ & JAKA KOPAČ — LOTI GRUŠKOVNJAK & MATIC ENIKO
  "6b": "43:27",           // 20:50 ig.2 | MAŠA VEGELJ & DOMEN DOLENC — NINA TOMAŽIN & LUYGGY
  "7a": "23:47",           // 21:30 ig.1 | ERIKA MOHORIČ & LUYGGY — LIZA POLJANŠEK & MATIC ENIKO
  "7b": "47:26",           // 21:30 ig.2 | NEŽA BERCE & JAN DOLENC — NINA TOMAŽIN & URBAN JEREB
  "8a": "50:30",           // 22:10 ig.1 | MARUŠA DOLINAR & BRIC KROLNIK — LIA BERCE & ROK MROULE
  "8b": "37:60",           // 22:10 ig.2 | TIA MOČNIK & URBAN JEREB — LENA KRISTAN & JAN GOVEKAR
  "9a": "30:52",           // 22:50 ig.1 | EMA KAVČIČ & DAVID ŠENK — LIA BERCE & LUYGGY
  "9b": "47:23",           // 22:50 ig.2 | LOTI GRUŠKOVNJAK & KRIŠTOF GANTAR — MAŠA VEGELJ & ROK MROULE
  "10a": "66:23",          // 23:30 ig.1 | NEŽA BERCE & JAKA KOPAČ — LENA KRISTAN & JUŠ BURJEK
  "10b": "41:54",          // 23:30 ig.2 | ERIKA MOHORIČ & URBAN JEREB — NINA TOMAŽIN & DOMEN DOLENC
  "11a": "37:41",          // 00:10 ig.1 | LIA BERCE & JAN DOLENC — MAŠA VEGELJ & MATIC ENIKO
  "11b": "29:52",          // 00:10 ig.2 | EMA KAVČIČ & KRIŠTOF GANTAR — LIZA POLJANŠEK & URBAN JEREB
  "12a": "46:66",          // 00:50 ig.1 | TIA MOČNIK & BRIC KROLNIK — MARUŠA DOLINAR & DAVID ŠENK
  "12b": "36:29",          // 00:50 ig.2 | NINA TOMAŽIN & ROK MROULE — EMA KAVČIČ & LUYGGY
  "13a": "42:46",          // 01:30 ig.1 | MAŠA VEGELJ & BRIC KROLNIK — LOTI GRUŠKOVNJAK & JAN GOVEKAR
  "13b": "38:36",          // 01:30 ig.2 | NEŽA BERCE & MATIC ENIKO — MARUŠA DOLINAR & DOMEN DOLENC
  "14a": "26:43",          // 02:10 ig.1 | LIZA POLJANŠEK & JAKA KOPAČ — NEŽA BERCE & URBAN JEREB
  "14b": "23:46",          // 02:10 ig.2 | LOTI GRUŠKOVNJAK & JUŠ BURJEK — LIA BERCE & KRIŠTOF GANTAR
  "15a": "26:50",          // 02:50 ig.1 | MAŠA VEGELJ & JUŠ BURJEK — ERIKA MOHORIČ & MATIC ENIKO
  "15b": "40:33",          // 02:50 ig.2 | NINA TOMAŽIN & JAN DOLENC — TIA MOČNIK & KRIŠTOF GANTAR
  "16a": "39:46",          // 03:30 ig.1 | EMA KAVČIČ & BRIC KROLNIK — LENA KRISTAN & LUYGGY
  "16b": "39:30",          // 03:30 ig.2 | NEŽA BERCE & DAVID ŠENK — ERIKA MOHORIČ & ROK MROULE
  "17a": "",          // 04:10 ig.1 | NINA TOMAŽIN & DAVID ŠENK — LIZA POLJANŠEK & JAN GOVEKAR
  "17b": "",          // 04:10 ig.2 | MARUŠA DOLINAR & JUŠ BURJEK — TIA MOČNIK & DOMEN DOLENC
  "18a": "",          // 04:50 ig.1 | ERIKA MOHORIČ & DOMEN DOLENC — LOTI GRUŠKOVNJAK & JAKA KOPAČ
  "18b": "",          // 04:50 ig.2 | LIA BERCE & MATIC ENIKO — LENA KRISTAN & URBAN JEREB
  "19a": "",          // 05:30 ig.1 | LENA KRISTAN & KRIŠTOF GANTAR — ERIKA MOHORIČ & DAVID ŠENK
  "19b": "",          // 05:30 ig.2 | NEŽA BERCE & ROK MROULE — MAŠA VEGELJ & JAN DOLENC
  "20a": "",          // 06:10 ig.1 | TIA MOČNIK & JAN GOVEKAR — NEŽA BERCE & LUYGGY
  "20b": "",          // 06:10 ig.2 | LIA BERCE & BRIC KROLNIK — NINA TOMAŽIN & JAKA KOPAČ
  "21a": "",          // 06:50 ig.1 | ERIKA MOHORIČ & JUŠ BURJEK — EMA KAVČIČ & URBAN JEREB
  "21b": "",          // 06:50 ig.2 | MARUŠA DOLINAR & JAN GOVEKAR — LIZA POLJANŠEK & JAN DOLENC
  "22a": "",          // 07:30 ig.1 | LIZA POLJANŠEK & ROK MROULE — LENA KRISTAN & MATIC ENIKO
  "22b": "",          // 07:30 ig.2 | LOTI GRUŠKOVNJAK & URBAN JEREB — TIA MOČNIK & DAVID ŠENK
  "23a": "",          // 08:10 ig.1 | LOTI GRUŠKOVNJAK & DOMEN DOLENC — LENA KRISTAN & JAN DOLENC
  "23b": "",          // 08:10 ig.2 | NINA TOMAŽIN & BRIC KROLNIK — NEŽA BERCE & KRIŠTOF GANTAR
  "24a": "",          // 08:50 ig.1 | LIZA POLJANŠEK & KRIŠTOF GANTAR — LIA BERCE & DOMEN DOLENC
  "24b": "",          // 08:50 ig.2 | MAŠA VEGELJ & LUYGGY — MARUŠA DOLINAR & JAKA KOPAČ
  "25a": "",          // 09:30 ig.1 | LENA KRISTAN & DAVID ŠENK — EMA KAVČIČ & JAN DOLENC
  "25b": "",          // 09:30 ig.2 | NINA TOMAŽIN & JAN GOVEKAR — LIA BERCE & JUŠ BURJEK
  "26a": "",          // 10:10 ig.1 | ERIKA MOHORIČ & BRIC KROLNIK — TIA MOČNIK & MATIC ENIKO
  "26b": "",          // 10:10 ig.2 | LENA KRISTAN & JAKA KOPAČ — MARUŠA DOLINAR & KRIŠTOF GANTAR
  "27a": "",          // 10:50 ig.1 | LOTI GRUŠKOVNJAK & LUYGGY — NEŽA BERCE & JUŠ BURJEK
  "27b": "",          // 10:50 ig.2 | LIZA POLJANŠEK & DOMEN DOLENC — TIA MOČNIK & ROK MROULE
  "28a": "",          // 11:30 ig.1 | LIA BERCE & DAVID ŠENK — NEŽA BERCE & DOMEN DOLENC
  "28b": "",          // 11:30 ig.2 | MAŠA VEGELJ & KRIŠTOF GANTAR — EMA KAVČIČ & JAN GOVEKAR
  "29a": "",          // 12:10 ig.1 | LOTI GRUŠKOVNJAK & BRIC KROLNIK — ERIKA MOHORIČ & JAN DOLENC
  "29b": "",          // 12:10 ig.2 | LENA KRISTAN & ROK MROULE — NINA TOMAŽIN & JUŠ BURJEK
  "30a": "",          // 12:50 ig.1 | MARUŠA DOLINAR & MATIC ENIKO — NINA TOMAŽIN & KRIŠTOF GANTAR
  "30b": "",          // 12:50 ig.2 | MAŠA VEGELJ & JAKA KOPAČ — LIZA POLJANŠEK & DAVID ŠENK
  "31a": "",          // 13:30 ig.1 | LIZA POLJANŠEK & LUYGGY — LOTI GRUŠKOVNJAK & JAN DOLENC
  "31b": "",          // 13:30 ig.2 | EMA KAVČIČ & ROK MROULE — TIA MOČNIK & JAKA KOPAČ
  "32a": "",          // 14:10 ig.1 | TIA MOČNIK & LUYGGY — ERIKA MOHORIČ & KRIŠTOF GANTAR
  "32b": "",          // 14:10 ig.2 | LENA KRISTAN & DOMEN DOLENC — MAŠA VEGELJ & JAN GOVEKAR
  "33a": "",          // 14:50 ig.1 | NINA TOMAŽIN & MATIC ENIKO — LOTI GRUŠKOVNJAK & DAVID ŠENK
  "33b": "",          // 14:50 ig.2 | MARUŠA DOLINAR & JAN DOLENC — EMA KAVČIČ & JUŠ BURJEK
};

// ===== RAZPORED: generiran z razpored.py - NE spreminjaj rocno =====
// [krog, igrisce, punca1, fant1, punca2, fant2]
const RAZPORED = [
  [1, "a", "C", "4", "F", "7"],
  [1, "b", "I", "12", "H", "10"],
  [2, "a", "D", "10", "G", "2"],
  [2, "b", "K", "3", "A", "4"],
  [3, "a", "E", "9", "C", "7"],
  [3, "b", "A", "12", "K", "6"],
  [4, "a", "C", "10", "D", "11"],
  [4, "b", "J", "12", "I", "5"],
  [5, "a", "F", "4", "D", "2"],
  [5, "b", "E", "5", "H", "8"],
  [6, "a", "K", "7", "G", "3"],
  [6, "b", "H", "6", "B", "11"],
  [7, "a", "F", "11", "I", "3"],
  [7, "b", "A", "9", "B", "10"],
  [8, "a", "D", "12", "C", "2"],
  [8, "b", "E", "10", "J", "4"],
  [9, "a", "K", "8", "C", "11"],
  [9, "b", "G", "1", "H", "2"],
  [10, "a", "A", "7", "J", "5"],
  [10, "b", "F", "10", "B", "6"],
  [11, "a", "C", "9", "H", "3"],
  [11, "b", "K", "1", "I", "10"],
  [12, "a", "E", "12", "D", "8"],
  [12, "b", "B", "2", "K", "11"],
  [13, "a", "H", "12", "G", "4"],
  [13, "b", "A", "3", "D", "6"],
  [14, "a", "I", "7", "A", "10"],
  [14, "b", "G", "5", "C", "1"],
  [15, "a", "H", "5", "F", "3"],
  [15, "b", "B", "9", "E", "1"],
  [16, "a", "K", "12", "J", "11"],
  [16, "b", "A", "8", "F", "2"],
  [17, "a", "B", "8", "I", "4"],
  [17, "b", "D", "5", "E", "6"],
  [18, "a", "F", "6", "G", "7"],
  [18, "b", "C", "3", "J", "10"],
  [19, "a", "J", "1", "F", "8"],
  [19, "b", "A", "2", "H", "9"],
  [20, "a", "E", "4", "A", "11"],
  [20, "b", "C", "12", "B", "7"],
  [21, "a", "F", "5", "K", "10"],
  [21, "b", "D", "4", "I", "9"],
  [22, "a", "I", "2", "J", "3"],
  [22, "b", "G", "10", "E", "8"],
  [23, "a", "G", "6", "J", "9"],
  [23, "b", "B", "12", "A", "1"],
  [24, "a", "I", "1", "C", "6"],
  [24, "b", "H", "11", "D", "7"],
  [25, "a", "J", "8", "K", "9"],
  [25, "b", "B", "4", "C", "5"],
  [26, "a", "F", "12", "E", "3"],
  [26, "b", "J", "7", "D", "1"],
  [27, "a", "G", "11", "A", "5"],
  [27, "b", "I", "6", "E", "2"],
  [28, "a", "C", "8", "A", "6"],
  [28, "b", "H", "1", "K", "4"],
  [29, "a", "G", "12", "F", "9"],
  [29, "b", "J", "2", "B", "5"],
  [30, "a", "D", "3", "B", "1"],
  [30, "b", "H", "7", "I", "8"],
  [31, "a", "I", "11", "G", "9"],
  [31, "b", "K", "2", "E", "7"],
  [32, "a", "E", "11", "F", "1"],
  [32, "b", "J", "6", "H", "4"],
  [33, "a", "B", "3", "G", "8"],
  [33, "b", "D", "9", "K", "5"],
];
