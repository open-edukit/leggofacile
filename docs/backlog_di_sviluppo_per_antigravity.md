# 🚀 Backlog di Sviluppo per Antigravity

Questo documento traccia i task pronti per essere elaborati e implementati su **Antigravity**.

---

## 📌 Sprint 1: Persistenza e PWA (Progressive Web App)

- [ ] **Task 1.1 — Manifest & Service Worker**:
  - Creare `manifest.json` con icone vettoriali per permettere l'installazione come app su tablet iPad / Android.
  - Implementare Service Worker per la cache offline delle librerie CDN (`tesseract.min.js`, `tesseract-core.wasm`, dizionario italiano).
- [ ] **Task 1.2 — LocalStorage & Profilo Bambino**:
  - Salvare il numero di stelline, i badge sbloccati e l'ultima storia aperta.
  - Creare un selettore profilo (es. "Profilo bimbo 1", "Profilo bimbo 2").

---

## 📌 Sprint 2: Miglioramenti Speech & AI Locale

- [ ] **Task 2.1 — Fallback STT Offline**:
  - Integrare un modello compatto WebAssembly (es. `@xenova/transformers` con Whisper tiny-it) per il riconoscimento vocale quando manca la connessione a internet (la Web Speech API di Chrome spesso richiede connessione ai server Google).
- [ ] **Task 2.2 — Rilevamento Intonazione / Pausa**:
  - Aggiungere un timer di attesa dinamico: se il bambino tace per più di 8 secondi sulla parola sillabata, far lampeggiare dolcemente la sillaba successiva per dare un indizio visivo.

---

## 📌 Sprint 3: Pannello Genitore / Logopedista

- [ ] **Task 3.1 — Tracciamento Errori & Fonemi Critici**:
  - Memorizzare le parole in cui è scattata la pernacchia più di due volte.
  - Mostrare una dashboard riepilogativa protetta da PIN:
    - Parole riuscite al primo colpo.
    - Fonemi o nessi sillabici che hanno richiesto più tentativi (es. gruppi con "gn", "tr", "s impura").
- [ ] **Task 3.2 — Esportazione Report**:
  - Possibilità di esportare un resoconto sintetico in PDF/CSV per il logopedista o l'insegnante di sostegno.

---

## 📌 Sprint 4: Raffinamento Grafico & Accessibilità

- [ ] **Task 4.1 — Interruttore Font OpenDyslexic**:
  - Aggiungere un toggle rapido per passare da `Lexend` a `OpenDyslexic` o `Biancoenero`.
- [ ] **Task 4.2 — Dimensione Testo Dinamica**:
  - Slider per ingrandire o rimpicciolire i badge delle sillabe per bambini ipovedenti o schermi smartphone.