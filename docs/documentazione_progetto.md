# 🦉 LeggoFacile — Web App di Lettura Facilitata e Sillabazione per Bambini con DSA

**LeggoFacile** è un'applicazione web interattiva, pensata per bambini di circa 6 anni con Disturbi Specifici dell'Apprendimento (Dislessia evolutiva, difficoltà di sintesi fonemica e fusione sillabica).

L'app trasforma la lettura in un'esperienza giocosa e priva di ansia da prestazione: acquisisce il testo tramite foto (OCR in-browser), rimuove la punteggiatura superflua, spezza ogni parola in sillabe colorate ad alto contrasto e ascolta la voce del bambino premiando la lettura corretta o riproducendo un simpatico suono di pernacchia in stile cartone animato per sdrammatizzare l'errore.

---

## 🎯 Obiettivi Chiave del Progetto

1. **Autonomia di lettura**: supporto visivo e fonetico senza bisogno della presenza costante dell'adulto.
2. **Nessuna frustrazione**: l'errore non penalizza il punteggio; viene segnalato con un effetto sonoro buffo (pernacchia cartoonesca) che incoraggia a riprovare.
3. **Decodifica fonologica assistita**:
   - Visualizzazione simultanea della parola intera, della scansione sillabica colorata e dello spelling fonematico scandito (`L • E • T • T • E • R • E`).
4. **Verifica rigorosa della parola completa**: impedisce l'avanzamento fittizio quando il bambino pronuncia soltanto la prima sillaba.
5. **Autoregolazione dell'aiuto vocale**: massimo 6 aiuti audio sintetizzati per sessione per stimolare la lettura attiva.

---

## 🚀 Avvio Rapido & Nota sui Permessi Microfono

Nei browser moderni (Google Chrome, Microsoft Edge, Safari), le API di riconoscimento vocale (**Web Speech API**) richiedono un contesto di origine sicuro (`https://` oppure `http://localhost`). L'apertura diretta con doppio click (`file:///...`) blocca l'accesso al microfono per ragioni di sicurezza.

### Come avviare l'ambiente di sviluppo in locale:

#### Metodo 1: Node.js / npx
```bash
npx serve .
# oppure: npx http-server -p 8080
```

#### Metodo 2: Python 3
```bash
python3 -m http.server 8080
```

#### Metodo 3: Estensione VS Code / IDE
- Usa l'estensione **Live Server** (avvio su porta 5500).

Apri il browser su `http://localhost:8080` (o l'URL indicato dalla console) e consenti l'accesso al microfono quando richiesto.

---

## 🛠️ Stack Tecnologico

- **Frontend Core**: HTML5, CSS3, JavaScript ES6+ (architettura stand-alone a file singolo).
- **Stile & Layout**: Tailwind CSS (via CDN) con font inclusivi (`Lexend`, `Fredoka`) e palette cromatica crema/antiriflesso.
- **OCR Locale**: `Tesseract.js v5` con modello linguistico `ita` elaborato direttamente nel browser.
- **Riconoscimento Vocale (STT)**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) con loop di auto-ascolto continuo.
- **Sintesi Vocale (TTS)**: Web Speech Synthesis API (`SpeechSynthesisUtterance`) con velocità rallentata ($0.78\times$) per la prima elementare.
- **Motore Audio FX**: Web Audio API nativo (sintesi oscillatoria senza file audio esterni).
- **Gamification**: Canvas-Confetti, stelle accumulate e album premi con 6 cuccioli sbloccabili.

---

## 📂 Struttura della Documentazione

- `SPECIFICHE_TECNICHE.md`: Requisiti dettagliati, regole fonotattiche di sillabazione, logica di calcolo Levenshtein e gestione dello stato.
- `ROADMAP_BACKLOG.md`: Task prioritari per l'ambiente Antigravity (PWA offline, STT offline locale con Whisper, persistenza dati logopedici).