# 📝 Changelog LeggoFacile

## [2.1.2] - 2026-10-07

### Added & Improved
- **Uniformazione Globale dei Font (CSS Variables)**: rimossi tutti i font hardcoded; ogni elemento (sillabe, nastro, titoli, pulsanti, dialoghi) eredita e applica coerentemente il font selezionato dall'utente (`Lexend`, `OpenDyslexic`, `Fredoka`).
- **Accessibilità Semantica & Screen Reader (ARIA)**:
  - `role="status"` e `aria-live="polite"` su transcript vocale e feedback toast.
  - `aria-label` descrittivi su tutti i controlli iconici e su ciascun badge sillabico.
- **Touch Targets Ergonomici**: ingranditi i comandi di navigazione a 44x44px (`min-h-[44px]`).
- **Navigazione da Tastiera & Focus Rings**:
  - `focus-visible` ad alto contrasto per navigazione da tastiera e switch.
  - Scorciatoie rapide: `Freccia Destra` (prossima parola), `Freccia Sinistra` (parola precedente), `Barra Spaziatrice` (ascolta TTS).
- **Riduzione Movimento**: supporto a `@media (prefers-reduced-motion: reduce)`.

## [2.1.1] - 2026-10-07


### Fixed
- **Prevenzione del doppio avanzamento vocale (Double-Advance Lock)**: introdotto flag atomico `isAdvancing` e reset del buffer vocale (`resetBuffer()`) tra una parola e la successiva per evitare il salto involontario di due parole durante il flusso continuo di WebSpeech.
- **Supporto completo agli accenti e monosillabi**:
  - Normalizzazione fonetica dei diacritici (`normalizeAccents`): parole come `è`, `cos'è` / `cosè`, `perché` / `perchè` vengono ora verificate correttamente rispetto all'equivalente fonetico captato.
  - Rimozione della caduta silenziosa sui monosillabi di una lettera (`è`, `e`, `a`): non vengono più ignorati come rumore di fondo.
- **Rigore Fonetico sulle Doppie Consonanti**: rifiuto esplicito di consonanti scempie al posto di doppie (es. `"gato"` per `"gatto"` viene respinto a fini didattico-logopedici, mentre è pienamente supportata la scansione sillaba-per-sillaba `"gat to"`).

## [2.1.0] - 2026-09-23


### Added
- **32 Trofei Progressivi & 4 Mondi Tematici**:
  - *La Radura dei Cuccioli* (W1, 8 badge, 1–19 ⭐)
  - *La Foresta Incantata* (W2, 8 badge, 23–71 ⭐)
  - *L'Odissea Stellare* (W3, 8 badge, 83–239 ⭐)
  - *Il Regno delle Leggende* (W4, 8 badge, 275–713 ⭐)
  - Modal con filtro a schede per mondo e barra traguardo verso il prossimo trofeo.
- **Feedback Costruttivo e Riconoscimento Sillabico Concatenato**:
  - Riconoscimento di parole lette sillaba per sillaba con pause (es. `"gat to"` per `"gatto"`).
  - Riconoscimento del prefisso/sillaba corretta (`isPartial: true, reason: 'partial_syllable'`): incoraggiamento positivo immediato, evidenziazione sillaba, nessun suono di errore.
  - Soglia errori consecutivi: l'avviso di rilettura è paziente per i primi 2 tentativi, suono di errore attivato solo al 3° errore reale consecutivo.
- **Distribuzione Portale Unificato & Sicurezza**:
  - Deploy sincronizzato su Firebase Hosting (`caccia-bersaglio-82f3a.web.app`).
  - Accesso riservato via Google Sign-In limitato alla famiglia Carlettini.

## [2.0.0] - 2026-09-21

### Added
- **Nastro Orizzontale a Scorrimento Fluido (Reading Ribbon)**: carousel teleprompter orizzontale con maschera di dissolvenza laterale che mantiene la parola corrente al centro dello schermo e scorre fluidamente da destra a sinistra.
- **Preservazione Integrale della Punteggiatura e Layout**: il brano completo mantiene il 100% della punteggiatura originale (virgole, punti, dialoghi, a capo e spaziature) con evidenziazione morbida senza barrature distruttive.
- **Strumenti per ADHD & Concentrazione**:
  - *Mascherino di Focalizzazione (Reading Ruler)*: attenua le parole periferiche per ridurre il crowding visivo e prevenire salti di riga accidentali.
  - *Pacer Ritmico Guidato*: scorrimento automatico temporizzato a velocità regolabile (Lento, Normale, Veloce) per scandire il ritmo di lettura.
  - *Modalità Zen*: elimina ogni distrazione periferica lasciando solo la striscia di lettura e l'ascolto vocale.
- **Architettura Modulare ES6**: suddivisione completa in moduli riusabili (`syllables.js`, `speech.js`, `audio.js`, `storage.js`, `app.js`).
- **Suite di Test Unitari**: 17 test automatizzati per sillabazione fonotattica, Levenshtein distance, validazione anti-falso positivo e categorizzazione fonetica.
- **PWA Offline-First**: `manifest.json`, icona ad alta risoluzione `icons/icon.svg` e `sw.js` per installazione su iPad e tablet Android con cache delle risorse.
- **Supporto Multi-Profilo**: memorizzazione LocalStorage per più bambini con avatar personalizzabili, stelle, badge e impostazioni individuali.
- **Tocco Sillabico Ritmico**: interazione al click/tap su ogni badge sillaba con pronuncia isolata rallentata e sintesi audio pop.
- **Suggerimento Visivo su Esitazione**: timer dinamico a 8 secondi che illumina la prima sillaba in caso di blocco del lettore.
- **Impostazioni di Accessibilità Avanzate**: selettore font inclusivo (`Lexend`, `OpenDyslexic`, `Fredoka`) e slider proporzionale per la dimensione delle sillabe.
- **Dashboard Riservata Logopedista & Genitore**:
  - Accesso protetto da PIN (`1234`).
  - Metriche su accuratezza al primo tentativo e conteggio aiuti vocali.
  - Registro errori con mappatura automatica dei fonemi critici.
  - Esportazione istantanea in formato CSV e layout ottimizzato per la stampa/PDF.
