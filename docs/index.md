# 🦉 LeggoFacile — Web App di Lettura Facilitata e Sillabazione per Bambini con DSA

> **Progetto**: LeggoFacile  
> **Committente / Namespace**: Protezione Cloud (`PC`)  
> **Destinatari**: Bambini di prima elementare (circa 6 anni) con DSA (dislessia evolutiva, difficoltà di sintesi fonemica).

---

## 🏗️ Architettura di Sistema

L'applicazione è strutturata come Progressive Web App (PWA) client-side modulare ES6, senza dipendenze backend, zero telemetria invasiva e privacy-first:

```
app-leggi-facile/
├── index.html                   # Shell applicativa unificata
├── manifest.json                # PWA Web App Manifest
├── sw.js                        # Service Worker offline-first
├── icons/
│   └── icon.svg                 # Icona vettoriale PWA
├── src/
│   ├── app.js                   # Orchestratore UI & flusso applicativo
│   ├── syllables.js             # Motore fonotattico di sillabazione italiana
│   ├── speech.js                # Web Speech API & Levenshtein elastico
│   ├── audio.js                 # Sintesi oscillatoria Web Audio API (senza file)
│   └── storage.js               # Persistenza LocalStorage, profili & logopedia
├── test/
│   ├── syllables.test.js        # Test sillabazione italiana (doppie, s-impura, nessi)
│   ├── speech.test.js           # Test Levenshtein e anti-falso positivo sillaba
│   └── storage.test.js          # Test categorizzazione fonetica e profilo
└── docs/
    ├── index.md                 # Fonte di verità del progetto
    ├── backlog.md               # Tracciamento evolutive
    └── changelog.md             # Storico versioni e rilasci
```

---

## 🎯 Funzionalità Chiave

1. **Sillabazione Precisa e Alta Leggibilità**:
   - Motore `syllabifyItalian` per divisione di doppie, nesso "cq", digrammi/trigrammi (`gn`, `gl`, `sc`, `ch`, `gh`), "s" impura, consonante + liquida e iati forti.
   - Badge cromatici alternati ad alto contrasto.
2. **Karaoke Sillabico Interattivo (Tocco Sillaba)**:
   - Toccando ogni singola sillaba il bambino ascolta la pronuncia lenta dedicata accompagnata da un suono "pop".
3. **Timer di Suggerimento Visivo (Inattività > 8s)**:
   - Se il bambino tace per più di 8 secondi, la prima sillaba inizia a pulsare per facilitare l'attacco.
4. **Prevenzione Falsi Positivi**:
   - Verifica di ampiezza minima ($\ge 68\%$) e similarità Levenshtein ($\ge 0.72$) per bloccare l'avanzamento fittizio quando viene letta solo la prima parte della parola.
5. **Anti-Frustrazione Comica**:
   - Pernacchia cartoonesca sintetizzata nativamente (oscillatore a dente di sega + LFO $32\text{ Hz}$).
6. **Accessibilità Visiva Personalizzabile**:
   - Supporto nativo ai font `Lexend`, `OpenDyslexic` e `Fredoka`.
   - Regolazione proporzionale della dimensione delle sillabe (80% - 140%).
7. **PWA Offline-First & Multi-Profilo**:
   - Installabile a schermo intero su tablet Android e iPad.
   - Salvataggio profili multipli con stelle, cuccioli sbloccati e cronologia.
8. **Area Riservata Genitore / Logopedista (PIN `1234`)**:
   - Analisi accuratezza al primo colpo.
   - Tabella delle parole con errori catalogate per fonema critico.
   - Esportazione in formato CSV e visualizzazione per la stampa/PDF.

---

## 🧪 Esecuzione Test Unitari

I test utilizzano il test runner nativo di Node.js (senza dipendenze esterne):

```bash
node --test test/*.test.js
```
