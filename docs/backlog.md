# 📋 Backlog & Evolutive LeggoFacile

## ✅ Completati (Sprint D, B, A, C)

- [x] **Refactoring Modulare (Sprint D)**:
  - Estrazione logiche in `src/syllables.js`, `src/speech.js`, `src/audio.js`, `src/storage.js`, `src/app.js`.
  - Suite di test completa (17 test unitari con `node --test`).
- [x] **Didattica & Accessibilità (Sprint B)**:
  - Tocco interattivo delle sillabe con pronuncia e suono pop.
  - Timer visivo di 8s per suggerimento sillabico su esitazione.
  - Font switcher (`Lexend`, `OpenDyslexic`, `Fredoka`).
  - Slider scalatura taglia sillabe (80% - 140%).
- [x] **Persistenza & PWA Offline-First (Sprint A)**:
  - `manifest.json`, icona SVG e `sw.js` (Service Worker con caching offline).
  - Gestione profili bambino multipli su LocalStorage con avatar emoji, stelle e album cuccioli.
- [x] **Area Genitore & Logopedista (Sprint C)**:
  - Accesso protetto da PIN (`1234`).
  - Statistiche accuratezza, parole lette, aiuti TTS.
  - Raggruppamento errori per categoria fonetica (doppie, s impura, nessi liquidi, digrammi, iati).
  - Esportazione report CSV e modalità stampa/PDF scheda logopedica.

---

## 🔮 Future Evolutive (Prossimi Sprint)

- [ ] **Whisper WebAssembly Offline**:
  - Integrazione modello locale compatto per riconoscimento vocale completo senza server Google.
- [ ] **Modalità Bicolore Sillabico nel Testo Completo**:
  - Colorazione alternata delle sillabe anche nella vista panoramica dell'intera storia.
- [ ] **Generatore di Storie con Parole Target**:
  - Integrazione opzionale con modello LLM leggero locale per generare brevi frasi centrate sui fonemi critici individuati dal logopedista.
