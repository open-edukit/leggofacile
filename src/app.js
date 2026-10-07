/**
 * LeggoFacile - Main Application Orchestrator
 * Integrates Syllables, Web Speech, Web Audio, LocalStorage, PWA, Logopedic Analytics,
 * and specialized ADHD Concentration & Reading features (Horizontal Ribbon, Reading Ruler, Pacer).
 */

import { syllabifyItalian, parseStructuredText, spellPhonemes } from './syllables.js';
import { playPlayfulRaspberry, playSuccessChime, playSyllablePop, speakText, getAudioContext } from './audio.js';
import { verifyFullWordSpeech, SpeechController } from './speech.js';
import { StorageService, DEFAULT_BADGES, WORLDS, categorizePhoneme } from './storage.js';

export const PRESETS = [
  {
    title: "🐱 La gatta Luna",
    text: "La gatta Luna, con la sua coda morbida, dorme sopra una sedia calda nel salotto.\nQuando sente un piccolo rumore, apre gli occhi e fa le fusa piano piano."
  },
  {
    title: "🐶 Il cane Briciola",
    text: "Il cane Briciola corre veloce nel grande prato fiorito.\nVede una palla rossa rimbalzare allegra e scodinzola felice verso il suo amico."
  },
  {
    title: "🌲 Nel Bosco Magico",
    text: "Nel cuore del bosco fitto cresce un fungo gigante color ametista.\nVicino scorre un ruscello limpido dove gli scoiattoli saltano di ramo in ramo."
  },
  {
    title: "🦊 La volpe furba",
    text: "Una volpe furba, con il pelo rossiccio, cammina silenziosa tra le foglie dorate.\nSalta con agilità sopra un vecchio sasso muschioso e osserva il tramonto."
  }
];

class LeggoFacileApp {
  constructor() {
    this.storage = new StorageService();
    this.speech = null;

    this.tokens = [];
    this.words = [];
    this.currentIndex = 0;
    this.ttsHelpRemaining = 6;
    this.wordAttempts = 0;
    this.consecutiveMistakes = 0;
    this.usedTTSOnCurrentWord = false;
    this.hesitationTimer = null;
    this.lastEvaluatedTranscript = "";
    this.isAdvancing = false;

    // ADHD & Reading Assist State
    this.readingRulerActive = true;
    this.zenModeActive = false;
    this.pacerActive = false;
    this.pacerInterval = null;
    this.pacerSpeedMs = 2500; // default 2.5s per word
    this.activeWorldFilter = 'all';

    this.initPWA();
    this.initSpeech();
    this.applySettings();
    this.bindEvents();
    this.updateHeaderProfileUI();
  }

  initPWA() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log('LeggoFacile Service Worker registered:', reg.scope);
      }).catch((err) => {
        console.warn('Service Worker registration skipped/failed:', err);
      });
    }

    if (window.location.protocol === 'file:') {
      const banner = document.getElementById('fileProtocolBanner');
      if (banner) banner.classList.remove('hidden');
    }
  }

  initSpeech() {
    this.speech = new SpeechController({
      onResult: (transcript) => this.onSpeechResult(transcript),
      onError: (err) => this.onSpeechError(err),
      onStateChange: (isListening) => this.updateAutoListenUI(isListening)
    });
  }

  applySettings() {
    const { settings } = this.storage.state;
    // Apply font
    document.body.classList.remove('font-lexend', 'font-opendyslexic', 'font-fredoka');
    if (settings.fontFamily === 'OpenDyslexic') {
      document.body.classList.add('font-opendyslexic');
    } else if (settings.fontFamily === 'Fredoka') {
      document.body.classList.add('font-fredoka');
    } else {
      document.body.classList.add('font-lexend');
    }

    this.applySyllableScale(settings.syllableScale || 100);

    const fontSelect = document.getElementById('fontSelector');
    if (fontSelect) fontSelect.value = settings.fontFamily || 'Lexend';

    const scaleSlider = document.getElementById('syllableScaleSlider');
    if (scaleSlider) scaleSlider.value = settings.syllableScale || 100;
  }

  applySyllableScale(scale) {
    const container = document.getElementById('syllableContainer');
    if (container) {
      container.style.transform = `scale(${scale / 100})`;
      container.style.transformOrigin = 'center center';
    }
    const valBadge = document.getElementById('syllableScaleVal');
    if (valBadge) valBadge.innerText = `${scale}%`;
  }

  bindEvents() {
    // Header actions
    document.getElementById('headerLogo')?.addEventListener('click', () => this.goToSetupView());
    document.getElementById('profileSelectorBtn')?.addEventListener('click', () => this.openProfileModal());
    document.getElementById('badgeModalBtn')?.addEventListener('click', () => this.openBadgeAlbum());
    document.getElementById('newStoryBtn')?.addEventListener('click', () => this.goToSetupView());
    document.getElementById('settingsBtn')?.addEventListener('click', () => this.openSettingsModal());
    document.getElementById('logopedistaBtn')?.addEventListener('click', () => this.openPinModal());

    // ADHD Toolbar Controls
    document.getElementById('toggleRulerBtn')?.addEventListener('click', () => this.toggleReadingRuler());
    document.getElementById('toggleZenBtn')?.addEventListener('click', () => this.toggleZenMode());
    document.getElementById('pacerToggleBtn')?.addEventListener('click', () => this.togglePacer());
    document.getElementById('pacerSpeedSelect')?.addEventListener('change', (e) => {
      this.pacerSpeedMs = parseInt(e.target.value, 10);
      if (this.pacerActive) {
        this.stopPacer();
        this.startPacer();
      }
    });

    // Setup section actions
    document.getElementById('startPlayBtn')?.addEventListener('click', () => this.startPlaySession());
    document.getElementById('ocrFileInput')?.addEventListener('change', (e) => this.runInBrowserOCR(e));

    // Presets
    document.querySelectorAll('[data-preset-index]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-preset-index'), 10);
        this.loadStoryPreset(idx);
      });
    });

    // Play section controls
    document.getElementById('autoListenToggle')?.addEventListener('click', () => this.toggleContinuousListening());
    document.getElementById('ttsHelpButton')?.addEventListener('click', () => this.useTTSHelp());
    document.getElementById('manualCorrectBtn')?.addEventListener('click', () => this.triggerSuccessAdvance());
    document.getElementById('manualMistakeBtn')?.addEventListener('click', () => this.triggerFartMistake("Riprova a voce alta!"));

    // Next / Prev word buttons
    document.getElementById('prevWordBtn')?.addEventListener('click', () => this.prevWord());
    document.getElementById('nextWordBtn')?.addEventListener('click', () => this.nextWord());

    // Settings Modal
    document.getElementById('fontSelector')?.addEventListener('change', (e) => {
      this.storage.updateSettings({ fontFamily: e.target.value });
      this.applySettings();
    });

    document.getElementById('syllableScaleSlider')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.storage.updateSettings({ syllableScale: val });
      this.applySyllableScale(val);
    });

    // PIN modal
    document.getElementById('pinSubmitBtn')?.addEventListener('click', () => this.verifyPinAndOpenDashboard());
    document.getElementById('pinInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.verifyPinAndOpenDashboard();
    });

    // Export CSV
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
      const url = this.storage.exportCSV(this.storage.state.activeProfileId);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_leggofacile_${this.storage.getActiveProfile().name.toLowerCase().replace(/\s+/g, '_')}.csv`;
      a.click();
    });

    // Print Report
    document.getElementById('printReportBtn')?.addEventListener('click', () => window.print());

    // Create Profile form
    document.getElementById('createProfileBtn')?.addEventListener('click', () => this.handleCreateProfile());

    // Accessible Keyboard Navigation (ArrowLeft / ArrowRight / Space)
    window.addEventListener('keydown', (e) => {
      // Ignore when typing inside input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      const playSection = document.getElementById('playSection');
      if (playSection && !playSection.classList.contains('hidden')) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextWord();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevWord();
        } else if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          this.useTTSHelp();
        }
      }
    });

    // Load first preset
    this.loadStoryPreset(0);
  }


  loadStoryPreset(idx) {
    if (PRESETS[idx]) {
      const input = document.getElementById('storyTextInput');
      if (input) input.value = PRESETS[idx].text;
    }
  }

  updateHeaderProfileUI() {
    const profile = this.storage.getActiveProfile();
    const nameEl = document.getElementById('currentProfileName');
    const avatarEl = document.getElementById('currentProfileAvatar');
    const starsEl = document.getElementById('starsDisplay');
    const badgeEl = document.getElementById('badgeCounter');

    if (nameEl) nameEl.innerText = profile.name;
    if (avatarEl) avatarEl.innerText = profile.avatar || '🦁';
    if (starsEl) starsEl.innerText = profile.stars;
    if (badgeEl) badgeEl.innerText = `${profile.badgesUnlocked}/${DEFAULT_BADGES.length}`;
  }

  openProfileModal() {
    const list = document.getElementById('profilesList');
    list.innerHTML = "";

    this.storage.state.profiles.forEach(p => {
      const isCurrent = p.id === this.storage.state.activeProfileId;
      const item = document.createElement('div');
      item.className = `p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
        isCurrent ? 'bg-amber-100 border-amber-400 font-black' : 'bg-white border-slate-200 hover:bg-slate-50'
      }`;
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-3xl">${p.avatar || '⭐'}</span>
          <div>
            <div class="text-base text-slate-800">${p.name}</div>
            <div class="text-xs text-slate-500 font-semibold">⭐ ${p.stars} stelle • 🎁 ${p.badgesUnlocked}/6 cuccioli</div>
          </div>
        </div>
        ${isCurrent ? '<span class="text-amber-800 text-xs px-2 py-1 bg-amber-200 rounded-lg">Attivo</span>' : ''}
      `;
      item.onclick = () => {
        this.storage.switchProfile(p.id);
        this.updateHeaderProfileUI();
        this.closeModal('profileModal');
      };
      list.appendChild(item);
    });

    this.openModal('profileModal');
  }

  handleCreateProfile() {
    const nameInput = document.getElementById('newProfileNameInput');
    const avatarSelect = document.getElementById('newProfileAvatarSelect');
    const name = nameInput.value.trim();
    if (!name) return;

    this.storage.createProfile(name, avatarSelect.value);
    nameInput.value = "";
    this.updateHeaderProfileUI();
    this.openProfileModal();
  }

  goToSetupView() {
    if (this.speech && this.speech.isListening) {
      this.speech.stop();
    }
    this.stopPacer();
    clearTimeout(this.hesitationTimer);
    document.getElementById('setupSection').classList.remove('hidden');
    document.getElementById('playSection').classList.add('hidden');
  }

  startPlaySession() {
    getAudioContext();
    const rawText = document.getElementById('storyTextInput').value.trim();
    if (!rawText) {
      alert("Inserisci del testo o seleziona una storia!");
      return;
    }

    // Preserve 100% of punctuation, spaces and newlines
    const structured = parseStructuredText(rawText);
    if (structured.words.length === 0) {
      alert("Nessuna parola valida trovata!");
      return;
    }

    this.tokens = structured.tokens;
    this.words = structured.words;
    this.currentIndex = 0;
    this.ttsHelpRemaining = 6;
    this.wordAttempts = 0;
    this.usedTTSOnCurrentWord = false;

    this.updateTTSHelpUI();
    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('playSection').classList.remove('hidden');
    document.getElementById('playSection').classList.add('flex');

    this.renderCurrentStage();
  }

  prevWord() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentStage();
    }
  }

  nextWord() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.renderCurrentStage();
    }
  }

  renderCurrentStage() {
    clearTimeout(this.hesitationTimer);
    this.isAdvancing = false;
    if (this.speech && typeof this.speech.resetBuffer === 'function') {
      this.speech.resetBuffer();
    }

    const target = this.words[this.currentIndex];
    if (!target) return;

    this.wordAttempts = 0;
    this.consecutiveMistakes = 0;
    this.usedTTSOnCurrentWord = false;

    const sylContainer = document.getElementById('syllableContainer');
    const phonemeSpelling = document.getElementById('phonemeSpelling');
    const hintBox = document.getElementById('hesitationHint');
    const heardTranscript = document.getElementById('heardTranscript');

    if (hintBox) hintBox.classList.add('hidden');
    if (heardTranscript) heardTranscript.innerText = `In attesa di voce...`;
    sylContainer.innerHTML = "";

    // Syllables with Interactive Karaoke Touch
    const syllables = syllabifyItalian(target.clean);
    syllables.forEach((s, idx) => {
      const badge = document.createElement('button');
      badge.id = `syl-badge-${idx}`;
      badge.className = `syl-pill-${idx % 4} text-4xl sm:text-6xl md:text-7xl font-black px-4 py-2.5 rounded-3xl tracking-wider uppercase shadow-sm bubble-btn cursor-pointer transition-transform active:scale-95`;
      badge.innerText = s;
      badge.title = `Tocca per ascoltare la sillaba "${s}"`;
      badge.setAttribute('aria-label', `Sillaba ${idx + 1} di ${syllables.length}: ${s}. Premi per ascoltare`);

      badge.onclick = () => {
        getAudioContext();
        playSyllablePop(idx);
        speakText(s, 0.70);
        badge.classList.add('scale-110', 'ring-4', 'ring-amber-400');
        setTimeout(() => badge.classList.remove('scale-110', 'ring-4', 'ring-amber-400'), 500);
      };

      sylContainer.appendChild(badge);
    });

    if (phonemeSpelling) {
      phonemeSpelling.innerText = spellPhonemes(target.clean);
    }

    // Progress bar & badge
    const total = this.words.length;
    const cur = this.currentIndex + 1;
    document.getElementById('wordIndexBadge').innerText = `Parola ${cur} di ${total}`;
    document.getElementById('karaokeProgress').style.width = `${Math.round((cur / total) * 100)}%`;

    // 1. Horizontal Reading Ribbon (Smooth Lateral Scrolling)
    this.renderHorizontalRibbon();

    // 2. Full Story with 100% Punctuation & ADHD Focus Mask
    this.renderFullStoryWithPunctuation();

    // Start 8-sec hesitation timer
    this.startHesitationTimer();
  }

  /**
   * Continuous Horizontal Ribbon / Teleprompter
   * Keeps target word centrally aligned and smoothly scrolls left/right.
   */
  renderHorizontalRibbon() {
    const ribbon = document.getElementById('horizontalReadingRibbon');
    if (!ribbon) return;

    ribbon.innerHTML = "";

    this.words.forEach((w, idx) => {
      const item = document.createElement('button');
      item.id = `ribbon-word-${idx}`;
      item.className = "shrink-0 transition-all duration-300 rounded-2xl px-3 py-1.5 cursor-pointer ";
      item.setAttribute('aria-label', `Parola ${idx + 1}: ${w.raw}`);

      if (idx === this.currentIndex) {
        // Active Center Word
        item.className += "text-2xl sm:text-3xl font-black text-amber-950 bg-amber-200 border-2 border-amber-400 shadow-md scale-110";
      } else if (idx < this.currentIndex) {
        // Read words on the left
        item.className += "text-base sm:text-lg font-bold text-slate-400 opacity-60 hover:opacity-90";
      } else {
        // Upcoming words on the right
        item.className += "text-base sm:text-lg font-bold text-slate-700 opacity-80 hover:opacity-100";
      }

      item.innerText = w.raw;
      item.onclick = () => {
        this.currentIndex = idx;
        this.renderCurrentStage();
      };

      ribbon.appendChild(item);
    });

    // Smoothly center the active word in the horizontal ribbon
    const activeEl = document.getElementById(`ribbon-word-${this.currentIndex}`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  /**
   * Renders the complete story text preserving 100% of original spaces,
   * newlines and punctuation, applying ADHD reading ruler and word highlights.
   */
  renderFullStoryWithPunctuation() {
    const container = document.getElementById('fullStoryContainer');
    if (!container) return;

    container.innerHTML = "";

    let currentParagraph = document.createElement('div');
    currentParagraph.className = "story-paragraph mb-3 transition-opacity duration-300";

    this.tokens.forEach((token) => {
      if (token.type === 'newline') {
        container.appendChild(currentParagraph);
        currentParagraph = document.createElement('div');
        currentParagraph.className = "story-paragraph mb-3 transition-opacity duration-300";
      } else if (token.type === 'space') {
        currentParagraph.appendChild(document.createTextNode(token.text));
      } else if (token.type === 'punct') {
        const spanPunct = document.createElement('span');
        spanPunct.className = "text-amber-900/70 font-semibold";
        spanPunct.innerText = token.text;
        currentParagraph.appendChild(spanPunct);
      } else if (token.type === 'word') {
        const spanWord = document.createElement('span');
        spanWord.id = `story-word-${token.wordIndex}`;
        spanWord.className = "cursor-pointer rounded-lg px-1 py-0.5 transition-all inline-block select-text ";

        if (token.wordIndex === this.currentIndex) {
          // Active word in full text
          spanWord.className += "font-black text-amber-950 bg-amber-200 ring-2 ring-amber-400 scale-105 shadow-xs";
        } else if (token.wordIndex < this.currentIndex) {
          // Already read word (subtle calming teal, NOT crossed out!)
          spanWord.className += "text-emerald-800/80 font-medium";
        } else {
          // Upcoming word
          spanWord.className += "text-slate-800 font-medium hover:text-amber-700";
        }

        spanWord.innerText = token.raw;
        spanWord.onclick = () => {
          this.currentIndex = token.wordIndex;
          this.renderCurrentStage();
        };

        currentParagraph.appendChild(spanWord);
      }
    });

    if (currentParagraph.childNodes.length > 0) {
      container.appendChild(currentParagraph);
    }

    // Apply ADHD Reading Ruler (Focus Band)
    if (this.readingRulerActive) {
      this.applyReadingRulerHighlight();
    }
  }

  applyReadingRulerHighlight() {
    const allWords = document.querySelectorAll('[id^="story-word-"]');
    allWords.forEach(el => {
      const idx = parseInt(el.id.replace('story-word-', ''), 10);
      // Distance from current word
      const dist = Math.abs(idx - this.currentIndex);
      if (dist === 0) {
        el.style.opacity = "1";
      } else if (dist <= 4) {
        el.style.opacity = "0.85";
      } else {
        el.style.opacity = "0.35"; // Soft dimming of peripheral text
      }
    });
  }

  toggleReadingRuler() {
    this.readingRulerActive = !this.readingRulerActive;
    const btn = document.getElementById('toggleRulerBtn');
    if (btn) {
      btn.classList.toggle('bg-teal-500', this.readingRulerActive);
      btn.classList.toggle('text-white', this.readingRulerActive);
      btn.classList.toggle('bg-slate-100', !this.readingRulerActive);
      btn.classList.toggle('text-slate-700', !this.readingRulerActive);
    }

    if (!this.readingRulerActive) {
      document.querySelectorAll('[id^="story-word-"]').forEach(el => {
        el.style.opacity = "1";
      });
    } else {
      this.applyReadingRulerHighlight();
    }
  }

  toggleZenMode() {
    this.zenModeActive = !this.zenModeActive;
    const btn = document.getElementById('toggleZenBtn');
    const header = document.querySelector('header');
    const storyCard = document.getElementById('storyContextCard');
    const parentControls = document.getElementById('parentControlsRow');

    if (btn) {
      btn.classList.toggle('bg-purple-500', this.zenModeActive);
      btn.classList.toggle('text-white', this.zenModeActive);
      btn.classList.toggle('bg-slate-100', !this.zenModeActive);
      btn.classList.toggle('text-slate-700', !this.zenModeActive);
    }

    if (this.zenModeActive) {
      header?.classList.add('hidden');
      storyCard?.classList.add('hidden');
      parentControls?.classList.add('hidden');
    } else {
      header?.classList.remove('hidden');
      storyCard?.classList.remove('hidden');
      parentControls?.classList.remove('hidden');
    }
  }

  togglePacer() {
    if (this.pacerActive) {
      this.stopPacer();
    } else {
      this.startPacer();
    }
  }

  startPacer() {
    this.pacerActive = true;
    const btn = document.getElementById('pacerToggleBtn');
    if (btn) {
      btn.classList.add('bg-amber-500', 'text-white');
      btn.classList.remove('bg-slate-100', 'text-slate-700');
      btn.innerHTML = `<span>⏸️</span> Stop Pacer`;
    }

    this.pacerInterval = setInterval(() => {
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++;
        this.renderCurrentStage();
      } else {
        this.stopPacer();
      }
    }, this.pacerSpeedMs);
  }

  stopPacer() {
    this.pacerActive = false;
    clearInterval(this.pacerInterval);
    const btn = document.getElementById('pacerToggleBtn');
    if (btn) {
      btn.classList.remove('bg-amber-500', 'text-white');
      btn.classList.add('bg-slate-100', 'text-slate-700');
      btn.innerHTML = `<span>⏱️</span> Pacer Ritmico`;
    }
  }

  startHesitationTimer() {
    clearTimeout(this.hesitationTimer);
    this.hesitationTimer = setTimeout(() => {
      const firstBadge = document.getElementById('syl-badge-0');
      const hintBox = document.getElementById('hesitationHint');
      if (firstBadge) {
        firstBadge.classList.add('animate-pulse', 'ring-4', 'ring-amber-400');
      }
      if (hintBox) {
        hintBox.classList.remove('hidden');
        const firstSyl = firstBadge ? firstBadge.innerText : '';
        hintBox.innerHTML = `💡 <em>Suggerimento:</em> inizia provando a pronunciare <strong>"${firstSyl}"</strong>!`;
      }
    }, 8000);
  }

  toggleContinuousListening() {
    getAudioContext();
    if (!this.speech || !this.speech.isSupported) {
      alert("Il riconoscimento vocale WebSpeech non è supportato in questo browser. Ti consigliamo Chrome o Edge!");
      return;
    }
    this.speech.toggle();
  }

  updateAutoListenUI(isListening) {
    const btn = document.getElementById('autoListenToggle');
    const title = document.getElementById('autoListenTitle');
    const desc = document.getElementById('autoListenDesc');
    const wave = document.getElementById('autoListenWave');
    const icon = document.getElementById('autoListenIcon');

    if (!btn) return;

    if (isListening) {
      btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600', 'shadow-emerald-200');
      btn.classList.add('bg-rose-500', 'hover:bg-rose-600', 'shadow-rose-200');
      title.innerText = "AUTO-ASCOLTO ATTIVO!";
      desc.innerText = "Parla al microfono, ascolta sempre...";
      wave?.classList.remove('hidden');
      icon.innerText = "🔴";
    } else {
      btn.classList.add('bg-emerald-500', 'hover:bg-emerald-600', 'shadow-emerald-200');
      btn.classList.remove('bg-rose-500', 'hover:bg-rose-600', 'shadow-rose-200');
      title.innerText = "ATTIVA AUTO-ASCOLTO";
      desc.innerText = "Ascolta sempre senza cliccare!";
      wave?.classList.add('hidden');
      icon.innerText = "🎙️";
    }
  }

  onSpeechResult(transcript) {
    if (this.isAdvancing) return;
    if (this.words.length === 0 || this.currentIndex >= this.words.length) return;

    const currentTarget = this.words[this.currentIndex];
    const heardEl = document.getElementById('heardTranscript');
    if (heardEl) heardEl.innerText = `"${transcript}"`;

    const result = verifyFullWordSpeech(transcript, currentTarget.clean);

    if (result.isMatch) {
      this.isAdvancing = true;
      this.consecutiveMistakes = 0;
      this.triggerSuccessAdvance();
    } else if (result.reason === "partial_syllable" || result.isPartial) {
      // The child successfully read the initial syllable/prefix!
      // This is positive reading exploration: NEVER trigger error or fart!
      this.consecutiveMistakes = 0;
      playSyllablePop(0);

      // Highlight the first syllable badge
      const firstBadge = document.getElementById('syl-badge-0');
      if (firstBadge) {
        firstBadge.classList.add('ring-4', 'ring-emerald-400', 'bg-emerald-100', 'scale-105');
        setTimeout(() => firstBadge.classList.remove('scale-105'), 700);
      }

      this.showToast(`👏 Ottimo: "${result.token}"! Continua con la parola intera!`, "progress");
    } else {
      // Discard background noise or short sounds, unless target word is a single letter (e.g. "è", "e", "a")
      const minLen = currentTarget.clean.length === 1 ? 1 : 2;
      if (!result.token || result.token.length < minLen) return;

      this.consecutiveMistakes++;

      if (this.consecutiveMistakes < 3) {
        // First or second attempt: patient feedback without fart sound or card shaking
        this.showToast(`👂 Ti ascolto... rileggi con calma`, "neutral");
      } else {
        // Only after 3 consecutive failed attempts: gentle comic sound
        this.wordAttempts++;
        this.triggerFartMistake(`Ho sentito "${result.token}"! Riproviamo insieme!`);
      }
    }
  }


  onSpeechError(error) {
    if (error === 'not-allowed') {
      alert("Permesso microfono negato. Consenti l'accesso o apri tramite https://.");
    }
  }

  triggerSuccessAdvance() {
    clearTimeout(this.hesitationTimer);
    playSuccessChime();

    const currentWord = this.words[this.currentIndex];
    this.storage.recordWordOutcome(currentWord.clean, Math.max(1, this.wordAttempts), this.usedTTSOnCurrentWord);
    const starOutcome = this.storage.addStar();
    this.updateHeaderProfileUI();

    if (starOutcome.newBadgeUnlocked && starOutcome.badge) {
      this.showToast(`🎉 NUOVO TROFEO SBLOCCATO: ${starOutcome.badge.icon} ${starOutcome.badge.name}!`, "success");
      if (typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      this.showToast("⭐ Bravissimo! Hai letto tutta la parola!", "success");
    }

    if (this.currentIndex < this.words.length - 1) {
      setTimeout(() => {
        this.currentIndex++;
        this.renderCurrentStage();
      }, 550);
    } else {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 180, spread: 100, origin: { y: 0.5 } });
      }
      this.showToast("🎉 COMPLIMENTI! HAI LETTO TUTTA LA STORIA!", "success");
      setTimeout(() => { this.openBadgeAlbum(); }, 1200);
    }
  }

  triggerFartMistake(message) {
    this.wordAttempts++;
    playPlayfulRaspberry();
    this.showToast(`💨 ${message} • Riprova!`, "fart");

    const card = document.getElementById('focusCard');
    if (card) {
      card.classList.remove('wobble-anim');
      void card.offsetWidth;
      card.classList.add('wobble-anim');
    }
  }

  useTTSHelp() {
    getAudioContext();
    if (this.words.length === 0 || this.currentIndex >= this.words.length) return;

    if (this.ttsHelpRemaining <= 0) {
      this.showToast("Hai usato tutti i 6 aiuti! Ora prova a leggere tu, sei bravissimo!", "fart");
      return;
    }

    this.ttsHelpRemaining--;
    this.usedTTSOnCurrentWord = true;
    this.updateTTSHelpUI();

    const word = this.words[this.currentIndex];
    speakText(word.clean, 0.76);
  }

  updateTTSHelpUI() {
    const badge = document.getElementById('ttsQuotaBadge');
    const btn = document.getElementById('ttsHelpButton');
    const sub = document.getElementById('ttsHelpSub');
    if (!badge || !btn) return;

    const remaining = this.ttsHelpRemaining;
    const hearts = "❤️".repeat(remaining) + "🖤".repeat(6 - remaining);
    badge.innerHTML = `${hearts} ${remaining}/6`;

    if (remaining === 0) {
      btn.classList.remove('bg-sky-500', 'hover:bg-sky-600', 'shadow-sky-200');
      btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed', 'opacity-70');
      btn.disabled = true;
      if (sub) sub.innerText = "Aiuti terminati! Leggi tu!";
    } else {
      btn.disabled = false;
      btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed', 'opacity-70');
      btn.classList.add('bg-sky-500', 'hover:bg-sky-600', 'shadow-sky-200');
      if (sub) sub.innerText = "Pronuncia vocale rallentata";
    }
  }

  showToast(text, type) {
    const toast = document.getElementById('liveFeedbackToast');
    const toastText = document.getElementById('feedbackText');
    const toastEmoji = document.getElementById('feedbackEmoji');
    if (!toast) return;

    toast.classList.remove(
      'hidden',
      'bg-emerald-100', 'text-emerald-900', 'border-emerald-300',
      'bg-sky-100', 'text-sky-900', 'border-sky-300',
      'bg-slate-100', 'text-slate-800', 'border-slate-300',
      'bg-amber-100', 'text-amber-900', 'border-amber-300'
    );

    if (type === 'success') {
      toast.classList.add('bg-emerald-100', 'text-emerald-900', 'border-2', 'border-emerald-300');
      if (toastEmoji) toastEmoji.innerText = "⭐";
    } else if (type === 'progress') {
      toast.classList.add('bg-sky-100', 'text-sky-900', 'border-2', 'border-sky-300');
      if (toastEmoji) toastEmoji.innerText = "👏";
    } else if (type === 'neutral') {
      toast.classList.add('bg-slate-100', 'text-slate-800', 'border-2', 'border-slate-300');
      if (toastEmoji) toastEmoji.innerText = "👂";
    } else {
      toast.classList.add('bg-amber-100', 'text-amber-900', 'border-2', 'border-amber-300');
      if (toastEmoji) toastEmoji.innerText = "💨";
    }

    if (toastText) toastText.innerText = text;
    toast.classList.remove('hidden');
  }

  openBadgeAlbum() {
    this.renderBadgeAlbumView();
    this.openModal('badgeModal');
  }

  renderBadgeAlbumView() {
    const profile = this.storage.getActiveProfile();
    const nextInfo = this.storage.getNextBadgeInfo();

    // Goal banner
    const goalBanner = document.getElementById('badgeGoalBanner');
    if (goalBanner) {
      if (nextInfo.hasNext) {
        goalBanner.innerHTML = `
          <div class="flex items-center justify-between text-xs font-bold text-purple-950 mb-1">
            <span>🎯 Prossimo Trofeo: <strong>${nextInfo.nextBadge.icon} ${nextInfo.nextBadge.name}</strong></span>
            <span>⭐ ${profile.stars} / ${nextInfo.nextBadge.starsRequired}</span>
          </div>
          <div class="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
            <div class="bg-purple-600 h-full transition-all duration-300" style="width: ${Math.min(100, Math.round((profile.stars / nextInfo.nextBadge.starsRequired) * 100))}%"></div>
          </div>
          <p class="text-[11px] text-purple-800 font-semibold mt-1">${nextInfo.message}</p>
        `;
      } else {
        goalBanner.innerHTML = `<div class="text-xs font-bold text-emerald-800">🏆 Complimenti! Hai completato tutti i 32 trofei leggendari!</div>`;
      }
    }

    // World filter buttons
    const filterContainer = document.getElementById('worldFilterTabs');
    if (filterContainer) {
      filterContainer.innerHTML = "";
      const allBtn = document.createElement('button');
      allBtn.className = `px-3 py-1 rounded-xl text-xs font-black bubble-btn transition-all ${
        this.activeWorldFilter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`;
      allBtn.innerText = `Tutti (${DEFAULT_BADGES.length})`;
      allBtn.onclick = () => {
        this.activeWorldFilter = 'all';
        this.renderBadgeAlbumView();
      };
      filterContainer.appendChild(allBtn);

      WORLDS.forEach(w => {
        const btn = document.createElement('button');
        btn.className = `px-3 py-1 rounded-xl text-xs font-black bubble-btn transition-all flex items-center gap-1 ${
          this.activeWorldFilter === w.id ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`;
        btn.innerHTML = `<span>${w.icon}</span> <span>${w.name.split(':')[0]}</span>`;
        btn.onclick = () => {
          this.activeWorldFilter = w.id;
          this.renderBadgeAlbumView();
        };
        filterContainer.appendChild(btn);
      });
    }

    // Badges grid
    const grid = document.getElementById('stickersGrid');
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = this.activeWorldFilter === 'all'
      ? DEFAULT_BADGES
      : DEFAULT_BADGES.filter(b => b.world === this.activeWorldFilter);

    filtered.forEach((b) => {
      const unlocked = profile.stars >= b.starsRequired;
      const card = document.createElement('div');
      card.className = `p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all ${
        unlocked 
          ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-300 shadow-xs scale-100' 
          : 'bg-slate-50 border-dashed border-slate-300 opacity-55 scale-95'
      }`;
      
      const missing = b.starsRequired - profile.stars;
      card.innerHTML = `
        <div class="text-3xl mb-1">${unlocked ? b.icon : '🔒'}</div>
        <div class="font-black text-xs text-slate-900 leading-tight">${b.name}</div>
        <div class="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug line-clamp-2">${b.desc}</div>
        <div class="mt-2 text-[9px] font-black px-2 py-0.5 rounded-full ${
          unlocked 
            ? 'bg-amber-200 text-amber-900' 
            : 'bg-slate-200 text-slate-600'
        }">
          ${unlocked ? '⭐ Sbloccato!' : `⭐ Richiede ${b.starsRequired} (-${missing})`}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  openSettingsModal() {
    this.openModal('settingsModal');
  }

  openPinModal() {
    const input = document.getElementById('pinInput');
    if (input) input.value = "";
    const err = document.getElementById('pinError');
    if (err) err.classList.add('hidden');
    this.openModal('pinModal');
  }

  verifyPinAndOpenDashboard() {
    const input = document.getElementById('pinInput');
    const entered = input.value.trim();
    const expected = this.storage.state.settings.pin || '1234';

    if (entered === expected) {
      this.closeModal('pinModal');
      this.renderLogopedistaDashboard();
      this.openModal('logopedistaModal');
    } else {
      const err = document.getElementById('pinError');
      if (err) err.classList.remove('hidden');
    }
  }

  renderLogopedistaDashboard() {
    const profile = this.storage.getActiveProfile();
    document.getElementById('dashProfileName').innerText = `${profile.avatar || '⭐'} ${profile.name}`;
    document.getElementById('dashTotalWords').innerText = profile.totalWordsRead;

    const acc = profile.totalWordsRead > 0
      ? Math.round((profile.firstTrySuccesses / profile.totalWordsRead) * 100)
      : 100;
    document.getElementById('dashAccuracy').innerText = `${acc}%`;
    document.getElementById('dashTtsUsed').innerText = profile.ttsHelpsUsed || 0;

    const tableBody = document.getElementById('dashMistakesBody');
    tableBody.innerHTML = "";

    if (!profile.mistakesLog || profile.mistakesLog.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">Nessun errore registrato finora. Ottimo lavoro!</td></tr>`;
      return;
    }

    profile.mistakesLog.forEach(m => {
      const tr = document.createElement('tr');
      tr.className = "border-b border-slate-100 hover:bg-slate-50";
      tr.innerHTML = `
        <td class="p-2.5 font-black text-slate-800">${m.word}</td>
        <td class="p-2.5 text-center"><span class="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-xs font-bold">${m.attempts}</span></td>
        <td class="p-2.5 text-xs text-slate-600">${(m.categories || []).join(', ')}</td>
        <td class="p-2.5 text-xs text-slate-400">${new Date(m.lastDate).toLocaleDateString('it-IT')}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  async runInBrowserOCR(event) {
    const file = event.target.files[0];
    if (!file) return;

    const progressBox = document.getElementById('ocrProgressBox');
    const progressBar = document.getElementById('ocrProgressBar');
    const progressLabel = document.getElementById('ocrStatusLabel');
    const percentLabel = document.getElementById('ocrPercentLabel');

    if (progressBox) {
      progressBox.classList.remove('hidden');
      progressBox.classList.add('flex');
    }
    if (progressLabel) progressLabel.innerText = "Caricamento Tesseract OCR...";

    try {
      if (typeof Tesseract === 'undefined') {
        alert("Libreria OCR in caricamento o non disponibile offline.");
        return;
      }

      const result = await Tesseract.recognize(
        file,
        'ita',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              const perc = Math.round((m.progress || 0) * 100);
              if (progressBar) progressBar.style.width = perc + '%';
              if (percentLabel) percentLabel.innerText = perc + '%';
              if (progressLabel) progressLabel.innerText = `Riconoscimento testo: ${perc}%`;
            } else if (progressLabel) {
              progressLabel.innerText = m.status;
            }
          }
        }
      );

      const extracted = result.data.text.trim();
      if (!extracted) {
        alert("Nessun testo rilevato. Assicurati che la foto sia ben illuminata!");
        return;
      }

      document.getElementById('storyTextInput').value = extracted;
      if (progressLabel) progressLabel.innerText = "Testo estratto con successo!";
      if (progressBar) progressBar.style.width = "100%";
    } catch (err) {
      console.error("OCR error:", err);
      alert("Errore OCR: " + err.message);
    } finally {
      setTimeout(() => {
        if (progressBox) progressBox.classList.add('hidden');
      }, 1500);
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }
}

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
};

window.addEventListener('DOMContentLoaded', () => {
  window.app = new LeggoFacileApp();
});
