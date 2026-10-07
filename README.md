# 🦉 LeggoFacile

> **Strumento inclusivo e open-source di lettura facilitata, sillabazione fonetica interattiva e auto-ascolto vocale.**  
> Progettato per bambini della scuola primaria, lettori con **DSA (Dislessia)** e bisogni educativi legati ad **ADHD e concentrazione**.

Parte dell'iniziativa **[Open-EduKit](https://github.com/open-edukit)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.1.2-emerald.svg)](https://github.com/open-edukit/leggofacile/releases)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-blue.svg)](./manifest.json)
[![Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-purple.svg)](https://open-edukit.github.io/leggofacile/)

---

## 🎯 Finalità Didattiche e Logopediche

LeggoFacile nasce per superare la frustrazione della lettura faticosa e frammentata attraverso un approccio ludico, rispettoso e scientificamente orientato:

- 🧩 **Sillabazione Fonetica Italiana Precisa**: suddivisione automatica delle parole secondo le regole fonotattiche della lingua italiana (doppie, nesso "CQ", digrammi *GN/GL/SC/CH/GH*, nessi consonantici liquidi, *S* impura, iati vocalici).
- 🎙️ **Auto-Ascolto Vocale in Tempo Reale**: sfrutta le Web Speech API con tolleranza progressiva e blocco del falso avanzamento (verifica sillaba-per-sillaba ed estrazione fonetica rigorosa).
- 📏 **Strumenti per ADHD e Concentrazione Visiva**:
  - **Nastro Orizzontale Continuo (Reading Ribbon)**: scorrimento laterale morbido stile teleprompter che mantiene la parola corrente al centro.
  - **Mascherino di Focalizzazione (Reading Ruler)**: attenua le parole periferiche riducendo il sovraccarico visivo.
  - **Pacer Ritmico Guidato**: aiuta a scandire il ritmo di decodifica visiva.
- 🔤 **Uniformità Tipografica & Font Inclusivi**: supporto integrato a `OpenDyslexic`, `Lexend` e `Fredoka`, con ridimensionamento proporzionale delle sillabe (80% - 140%).
- 🏆 **Gamification Non Punitiva**: 32 trofei collezionabili distribuiti su 4 mondi fantastici (*La Radura dei Cuccioli*, *La Foresta Incantata*, *L'Odissea Stellare*, *Il Regno delle Leggende*).
- 🩺 **Area Riservata Genitore / Logopedista**: statistiche di accuratezza, conteggio aiuti TTS, raggruppamento errori per categoria fonetica ed esportazione report in formato CSV o scheda PDF stampabile.

---

## 🚀 Avvio Rapido

LeggoFacile è una **Progressive Web App (PWA)** priva di dipendenze pesanti o framework di build: gira interamente nel browser e funziona offline.

### Prerequisiti
Per abilitare il riconoscimento vocale continuo del microfono, i browser moderni richiedono un contesto **HTTPS** o `localhost`.

### 1. Clona il repository
```bash
git clone https://github.com/open-edukit/leggofacile.git
cd leggofacile
```

### 2. Avvia un server locale
Puoi usare qualsiasi server web statico:

**Con Node.js (npx):**
```bash
npx serve -p 8000 .
```

**Con Python 3:**
```bash
python3 -m http.server 8000
```

Apri quindi il browser su `http://localhost:8000`.


---

## 🧪 Test Unitari

La logica fonetica, la sillabazione italiana e il motore di verifica vocale sono coperti da test unitari nativi Node.js:

```bash
node --test test/*.test.js
```

---

## ♿ Accessibilità (WCAG 2.1)

- Supporto alla navigazione completa da **tastiera** (`Freccia Destra`: avanti, `Freccia Sinistra`: indietro, `Spazio`: ascolta parola).
- Regioni `aria-live="polite"` e ruoli `role="status"` per screen reader.
- Touch targets ottimizzati per schermi touch e bambini (minimo 44x44px).
- Riconoscimento preferenza `prefers-reduced-motion`.

---

## 🔒 Privacy, Trasparenza Dati & Funzionamento Offline

LeggoFacile adotta un'architettura rigorosamente orientata alla **massima tutela della privacy dei minori**:

### 1. Cosa succede alle foto caricate (OCR)?
- **Zero Cloud**: le immagini caricate (da fotocamera o galleria) **non lasciano mai il dispositivo**.
- L'estrazione del testo dai libri avviene interamente in memoria locale (RAM) tramite **Tesseract.js** (motore OCR compilato in WebAssembly che opera in un Web Worker isolato del browser).
- Nessun server backend, nessun database remoto e nessun archivio cloud: una volta estratto il testo o chiusa la sessione, l'immagine svanisce dalla memoria temporanea.

### 2. Dati di Profilo e Statistiche
- Tutti i dati (nomi dei profili, conteggio delle stelle, album dei trofei, storico degli errori fonetici) risiedono unicamente nel `localStorage` del browser sul dispositivo dell'utente.
- **Zero Cookie di profilazione o tracciamento**: nessun pixel pubblicitario, né Google Analytics o telemetria di terze parti.

### 3. Funzionamento Offline & Riconoscimento Vocale
- **Architettura Offline-First**: grazie al Service Worker integrato, una volta caricata l'applicazione, l'interfaccia, i font, la logica didattica e il motore di sillabazione funzionano senza connessione a Internet.
- **Microfono e Web Speech API**: la sintesi vocale (TTS audio) e il riconoscimento vocale sfruttano i motori nativi forniti dal browser o dal sistema operativo (on-device su Apple/iOS e Android con dizionari offline; su alcuni browser Chromium su desktop la trascrizione vocale può richiedere connettività di rete del browser).

---

## ⚠️ Disclaimer Medico e Limitazione di Responsabilità (Medical Disclaimer)


> **AVVISO IMPORTANTE**:
> 
> 1. **Finalità Esclusivamente Didattica e Ludica**:  
>    **LeggoFacile** è un software sperimentale open-source concepito unicamente come strumento ludico-educativo, di supporto allo studio e di allenamento alla lettura autonoma.
>
> 2. **Assenza di Valenza Medica o Diagnostica**:  
>    Gli autori e i contributori del progetto **NON sono medici, logopedisti, psicologi né operatori sanitari**.  
>    Nessuna funzionalità presente nell'applicazione (inclusi l'algoritmo di decomposizione sillabica, le statistiche di accuratezza, l'indice degli errori fonetici o i report scaricabili) costituisce, sostituisce o intende sostituire:
>    - un parere medico, clinico o sanitario;
>    - una diagnosi di Disturbi Specifici dell'Apprendimento (DSA), ADHD o altre condizioni neuroevolutive;
>    - un piano di riabilitazione o trattamento logopedico professionale.
>
> 3. **Esonero Totale da Responsabilità**:  
>    L'applicazione viene fornita «così com'è» (*as is*), a titolo gratuito e senza garanzie di alcun tipo. Gli autori e i contributori declinano qualsiasi responsabilità diretta o indiretta per eventuali danni, pretese, incomprensioni, ritardi diagnostici o conseguenze derivanti dall'uso o dall'impossibilità di utilizzo del software o delle metriche da esso generate.  
>    Per qualsiasi dubbio relativo all'apprendimento, allo sviluppo del linguaggio o a sospetti DSA, è sempre indispensabile rivolgersi a medici specialisti, neuropsichiatri infantili e logopedisti abilitati.

---

## 📄 Licenza

Rilasciato sotto licenza [MIT](./LICENSE).  
Sviluppato con passione per l'inclusione didattica dalla community **Open-EduKit**.

