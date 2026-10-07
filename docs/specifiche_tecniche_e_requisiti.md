# 📋 Specifiche Tecniche & Architettura di Sistema

## 1. Linee Guida Pedagogiche e Accessibilità (DSA)

### 1.1 Tipografia & Spaziatura
- **Font principale**: `Lexend` (Google Fonts), disegnato specificamente per ridurre il sovraffollamento visivo (*visual crowding*).
- **Font titoli & bottoni**: `Fredoka`, geometrico, morbido e adatto all'infanzia.
- **Colori di contrasto**:
  - Sfondo principale crema rilassante: `#FAF7EE` (riduce l'abbagliamento da contrasto bianco puro).
  - Testo ad alto contrasto scuro ma non nero puro: `#242E38`.
  - Spaziatura lettere: `0.08em` - `0.12em`.
  - Interlinea: `1.8` - `2.2`.

### 1.2 Depurazione Punteggiatura
I bambini con difficoltà di decodifica si bloccano frequentemente davanti a segni di interpunzione non alfabetici. La funzione `sanitizeAndTokenizeText` esegue una purificazione totale a monte:
- Rimozione di: `.,\/#!$%\^&\*;:{}=\-_`~()?"«»“”'’–—\\[\]`
- Mantenimento esclusivo di caratteri alfabetici e vocali accentate italiane (`a-z`, `àèéìòù`).

---

## 2. Motore di Sillabazione Fonotattica Italiana

Il modulo `syllabifyItalian(word)` implementa le regole ortografiche e fonotattiche italiane:

1. **Doppie consonanti**: divisione obbligatoria (`gat-to`, `tet-to`, `ros-so`).
2. **Nesso "cq"**: equiparato a consonante doppia (`ac-qua`).
3. **Digrammi e Trigrammi inseparabili**:
   - `ch`, `gh`, `gn`, `gl`, `sc` rimangono legati alla vocale seguente (`a-gno`, `pe-sche`).
4. **S impura**: la consonante `s` seguita da altra consonante appartiene alla sillaba successiva (`fe-sta`, `ba-sto-ne`, `pe-sca`, `scuo-la`).
5. **Nessi consonante + liquida**: i gruppi `b, c, d, f, g, p, t, v` seguiti da `l` o `r` non si separano mai (`li-bro`, `a-pri-re`, `te-a-tro`, `cre-ma`).
6. **Iati vocalici**: separazione delle vocali forti contigue (`a`, `e`, `o`) come in `po-e-ta`, `ma-e-stro`.

Ogni sillaba generata viene incapsulata in un badge cromatico alternato (`syl-pill-0` fino a `syl-pill-3`).

---

## 3. Motore di Valutazione Vocale & Prevenzione Falsi Positivi

### 3.1 Il Problema della Sillaba Singola
Nei lettori emergenti dislessici, l'ascolto vocale automatico standard tende ad avanzare anche se il bambino legge solo la prima parte della parola (es. dice solo "gat" per "gatto").

### 3.2 Algoritmo di Validazione
La funzione `verifyFullWordSpeech(heardText, targetWord)` applica tre livelli di controllo:

1. **Exact match**: confronto diretto normalizzato.
2. **Controllo di ampiezza minima**:
   $$\text{Length Ratio} = \frac{\text{len}(\text{token})}{\text{len}(\text{target})} \ge 0.68$$
   Se il rapporto è inferiore a $0.68$, il token viene identificato come `partial_syllable` e rifiutato.
3. **Similarità fonetica elastica (Levenshtein Distance)**:
   Calcolo della distanza di modifica normalizzata:
   $$\text{Similarity}(S_1, S_2) = \frac{\max(|S_1|, |S_2|) - \text{Levenshtein}(S_1, S_2)}{\max(|S_1|, |S_2|)}$$
   Soglia di accettazione: $\text{Similarity} \ge 0.72$. Permette lievi imprecisioni tipiche dell'articolazione a 6 anni senza promuovere parole troncate.

---

## 4. Audio Engine & Gamification (Sintesi Pura Web Audio API)

Non vengono caricati file audio esterni (mp3/wav) per garantire zero latenza, compatibilità offline immediata e nessuna dipendenza di rete:

- **Pernacchia Cartoonesca (`playPlayfulRaspberry`)**:
  - Oscillatore a dente di sega (`sawtooth`) con frequenza che scende da $135\text{ Hz}$ a $45\text{ Hz}$.
  - Modulazione LFO ad onda quadra a $32\text{ Hz}$ per simulare la vibrazione comica della bocca/lingua.
  - Genera risata e disinnesca la sensazione di fallimento.
- **Fanfara di Successo (`playSuccessChime`)**:
  - Arpeggio ad onda triangolare sulle frequenze di do maggiore: $C_5 (523.25\text{ Hz}) \to E_5 (659.25\text{ Hz}) \to G_5 (783.99\text{ Hz}) \to C_6 (1046.50\text{ Hz})$.

---

## 5. Quota Aiuto Vocale (TTS)

- Massimo **6 gettoni di aiuto** a sessione.
- Rappresentati visivamente da cuoricini (`❤️❤️❤️❤️❤️❤️`).
- Al sesto utilizzo il bottone si disabilita graficamente e passa in stato `disabled`, incoraggiando la prosecuzione autonoma.