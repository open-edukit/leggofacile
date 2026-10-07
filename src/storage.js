/**
 * LeggoFacile - State Persistence & Profiles & Logopedic Analytics
 * Manages LocalStorage, multi-profile tracking, speech therapist metrics & CSV export.
 */

const STORAGE_KEY = 'leggofacile_v2_data';

export const WORLDS = [
  { id: 'w1', name: 'Mondo 1: La Radura dei Cuccioli', icon: '🐾', color: 'from-amber-100 to-orange-100', border: 'border-amber-300' },
  { id: 'w2', name: 'Mondo 2: La Foresta Incantata', icon: '🌲', color: 'from-emerald-100 to-teal-100', border: 'border-emerald-300' },
  { id: 'w3', name: 'Mondo 3: L\'Odissea Stellare', icon: '🌌', color: 'from-indigo-100 to-sky-100', border: 'border-indigo-300' },
  { id: 'w4', name: 'Mondo 4: Il Regno delle Leggende', icon: '👑', color: 'from-purple-100 to-pink-100', border: 'border-purple-300' }
];

export const DEFAULT_BADGES = [
  // --- MONDO 1: LA RADURA DEI CUCCIOLI (Livello Base) ---
  { id: 'b1', name: 'Cucciolo Leone', icon: '🦁', desc: 'Ruggito iniziale di lettura!', world: 'w1', starsRequired: 4 },
  { id: 'b2', name: 'Leprotto Veloce', icon: '🐰', desc: 'Lettura a balzi rapidi!', world: 'w1', starsRequired: 9 },
  { id: 'b3', name: 'Gattino Agile', icon: '🐱', desc: 'Sillabe feline a passo felpato!', world: 'w1', starsRequired: 15 },
  { id: 'b4', name: 'Orsetto Goloso', icon: '🐻', desc: 'Un vasetto di miele e parole!', world: 'w1', starsRequired: 22 },
  { id: 'b5', name: 'Volpe Saggia', icon: '🦊', desc: 'Astuzia e attenzione nei boschi!', world: 'w1', starsRequired: 30 },
  { id: 'b6', name: 'Gufo Sapiente', icon: '🦉', desc: 'Occhi aperti e decodifica perfetta!', world: 'w1', starsRequired: 39 },
  { id: 'b7', name: 'Scoiattolo Acrobata', icon: '🐿️', desc: 'Salta da una sillaba all\'altra!', world: 'w1', starsRequired: 49 },
  { id: 'b8', name: 'Riccio Gentile', icon: '🦔', desc: 'Custode dei primi passi di lettura!', world: 'w1', starsRequired: 60 },

  // --- MONDO 2: LA FORESTA INCANTATA (Livello Intermedio) ---
  { id: 'b9', name: 'Unicorno della Luce', icon: '🦄', desc: 'Magia scintillante tra le righe!', world: 'w2', starsRequired: 72 },
  { id: 'b10', name: 'Cervo d\'Argento', icon: '🦌', desc: 'Passo fiero nella lettura fluida!', world: 'w2', starsRequired: 85 },
  { id: 'b11', name: 'Procione Scaltro', icon: '🦝', desc: 'Non ti sfugge nessun nesso sillabico!', world: 'w2', starsRequired: 99 },
  { id: 'b12', name: 'Lupo della Luna', icon: '🐺', desc: 'Ululato potente e sicuro!', world: 'w2', starsRequired: 114 },
  { id: 'b13', name: 'Aquila dei Venti', icon: '🦅', desc: 'Sguardo dall\'alto su tutto il testo!', world: 'w2', starsRequired: 130 },
  { id: 'b14', name: 'Pavone Arcobaleno', icon: '🦚', desc: 'La lettura si tinge di colori vivaci!', world: 'w2', starsRequired: 147 },
  { id: 'b15', name: 'Delfino Smeraldo', icon: '🐬', desc: 'Nuoto veloce tra le onde delle frasi!', world: 'w2', starsRequired: 165 },
  { id: 'b16', name: 'Tartaruga Saggia', icon: '🐢', desc: 'Chi va piano legge sano e lontano!', world: 'w2', starsRequired: 184 },

  // --- MONDO 3: L'ODISSEA STELLARE (Livello Avanzato) ---
  { id: 'b17', name: 'Razzo Stellare', icon: '🚀', desc: 'Decollo verso storie intergalattiche!', world: 'w3', starsRequired: 205 },
  { id: 'b18', name: 'Pianeta di Cristallo', icon: '🪐', desc: 'Mondo splendente di parole pure!', world: 'w3', starsRequired: 228 },
  { id: 'b19', name: 'Disco Volante Amico', icon: '🛸', desc: 'Velocità supersonica di decodifica!', world: 'w3', starsRequired: 252 },
  { id: 'b20', name: 'Alieno Simpatico', icon: '👾', desc: 'Anche nello spazio si legge benissimo!', world: 'w3', starsRequired: 277 },
  { id: 'b21', name: 'Stella Cadente Fulminea', icon: '🌠', desc: 'Un desiderio di lettura esaudito!', world: 'w3', starsRequired: 304 },
  { id: 'b22', name: 'Astronauta Intrepido', icon: '👨‍🚀', desc: 'Camminata lunare tra paragrafi complessi!', world: 'w3', starsRequired: 332 },
  { id: 'b23', name: 'Nebulosa Infinita', icon: '🌌', desc: 'Polvere di stelle su ogni pagina!', world: 'w3', starsRequired: 362 },
  { id: 'b24', name: 'Satellite Guardiano', icon: '🛰️', desc: 'Rilevamento perfetto di tutti i fonemi!', world: 'w3', starsRequired: 393 },

  // --- MONDO 4: IL REGNO DELLE LEGGENDE (Livello Maestro Supremo) ---
  { id: 'b25', name: 'Corona d\'Oro Reale', icon: '👑', desc: 'Sovrano indiscusso della lettura!', world: 'w4', starsRequired: 426 },
  { id: 'b26', name: 'Mago dei Libri Sacri', icon: '🧙‍♂️', desc: 'Incantesimo di lettura istantanea!', world: 'w4', starsRequired: 461 },
  { id: 'b27', name: 'Drago Custode', icon: '🐉', desc: 'Fiamma calda di pura passione per i libri!', world: 'w4', starsRequired: 498 },
  { id: 'b28', name: 'Coppa d\'Oro Suprema', icon: '🏆', desc: 'Il trofeo dei grandi lettori!', world: 'w4', starsRequired: 537 },
  { id: 'b29', name: 'Diamante del Sapere', icon: '💎', desc: 'Luce che non tramonta mai!', world: 'w4', starsRequired: 578 },
  { id: 'b30', name: 'Fenice Immortale', icon: '🌟', desc: 'Rinasce sempre più forte dopo ogni errore!', world: 'w4', starsRequired: 621 },
  { id: 'b31', name: 'Castello Incantato', icon: '🏰', desc: 'Le porte del sapere sono spalancate!', world: 'w4', starsRequired: 666 },
  { id: 'b32', name: 'Maestro delle Fiabe', icon: '🧙‍♀️', desc: 'La leggenda vivente di LeggoFacile!', world: 'w4', starsRequired: 713 }
];

export function getInitialState() {
  return {
    activeProfileId: 'profile_1',
    profiles: [
      {
        id: 'profile_1',
        name: 'Campione 1',
        avatar: '🦁',
        stars: 0,
        badgesUnlocked: 0,
        totalWordsRead: 0,
        firstTrySuccesses: 0,
        mistakesLog: [], // { word, attempts, date, category }
        ttsHelpsUsed: 0
      }
    ],
    settings: {
      fontFamily: 'Lexend',
      syllableScale: 100, // 80% to 140%
      pin: '1234',
      ttsQuotaMax: 6,
      contrastMode: 'cream' // 'cream' | 'contrast'
    }
  };
}

/**
 * Phoneme categorizer for logopedic tracking
 */
export function categorizePhoneme(word) {
  const clean = (word || '').toLowerCase();
  const categories = [];

  // Check double consonants
  if (/(.)\1/.test(clean.replace(/[aeiouàèéìòù]/g, ''))) {
    categories.push('Doppie consonanti');
  }
  // Check 'cq'
  if (clean.includes('cq')) {
    categories.push('Nesso "CQ"');
  }
  // Check S impura
  if (/s[^aeiouàèéìòù]/.test(clean)) {
    categories.push('S impura');
  }
  // Check Digraphs / Trigraphs
  if (/ch|gh|gn|gli|sci|sce/.test(clean)) {
    categories.push('Digrammi / Trigrammi (GN, GL, SC, CH, GH)');
  }
  // Check Consonant + Liquid (L/R)
  if (/[bcdfgtpv][lr]/.test(clean)) {
    categories.push('Nesso consonante + liquida (L/R)');
  }
  // Check Hiatus
  if (/[aeo][aeo]/.test(clean)) {
    categories.push('Iato vocalico');
  }

  return categories.length > 0 ? categories : ['Sillabe semplici (CV)'];
}

export class StorageService {
  constructor() {
    this.state = this.load();
  }

  load() {
    if (typeof localStorage === 'undefined') {
      return getInitialState();
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return getInitialState();
      const parsed = JSON.parse(data);
      // Merge with defaults in case of missing keys
      return {
        ...getInitialState(),
        ...parsed,
        settings: { ...getInitialState().settings, ...(parsed.settings || {}) }
      };
    } catch (e) {
      console.warn('Failed to load storage:', e);
      return getInitialState();
    }
  }

  save() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  getActiveProfile() {
    const profile = this.state.profiles.find(p => p.id === this.state.activeProfileId);
    return profile || this.state.profiles[0];
  }

  switchProfile(profileId) {
    if (this.state.profiles.some(p => p.id === profileId)) {
      this.state.activeProfileId = profileId;
      this.save();
    }
  }

  createProfile(name, avatar = '⭐') {
    const newId = 'profile_' + Date.now();
    const newProfile = {
      id: newId,
      name: name.trim() || `Bimbo ${this.state.profiles.length + 1}`,
      avatar: avatar,
      stars: 0,
      badgesUnlocked: 0,
      totalWordsRead: 0,
      firstTrySuccesses: 0,
      mistakesLog: [],
      ttsHelpsUsed: 0
    };
    this.state.profiles.push(newProfile);
    this.state.activeProfileId = newId;
    this.save();
    return newProfile;
  }

  deleteProfile(profileId) {
    if (this.state.profiles.length <= 1) return false;
    this.state.profiles = this.state.profiles.filter(p => p.id !== profileId);
    if (this.state.activeProfileId === profileId) {
      this.state.activeProfileId = this.state.profiles[0].id;
    }
    this.save();
    return true;
  }

  recordWordOutcome(word, attempts, usedTTS = false) {
    const profile = this.getActiveProfile();
    profile.totalWordsRead++;

    if (attempts === 1 && !usedTTS) {
      profile.firstTrySuccesses++;
    }

    if (attempts > 1) {
      const categories = categorizePhoneme(word);
      const existing = profile.mistakesLog.find(m => m.word === word);
      if (existing) {
        existing.attempts += attempts;
        existing.timesEncountered++;
        existing.lastDate = new Date().toISOString();
      } else {
        profile.mistakesLog.push({
          word,
          attempts,
          timesEncountered: 1,
          categories,
          lastDate: new Date().toISOString()
        });
      }
    }

    if (usedTTS) {
      profile.ttsHelpsUsed = (profile.ttsHelpsUsed || 0) + 1;
    }

    this.save();
  }

  addStar() {
    const profile = this.getActiveProfile();
    profile.stars++;

    const previousUnlocked = profile.badgesUnlocked || 0;
    const newUnlocked = DEFAULT_BADGES.filter(b => profile.stars >= b.starsRequired).length;
    const hasNewBadge = newUnlocked > previousUnlocked;
    profile.badgesUnlocked = newUnlocked;

    const unlockedBadge = hasNewBadge ? DEFAULT_BADGES[newUnlocked - 1] : null;

    this.save();
    return {
      stars: profile.stars,
      badgesUnlocked: profile.badgesUnlocked,
      newBadgeUnlocked: hasNewBadge,
      badge: unlockedBadge,
      totalBadges: DEFAULT_BADGES.length
    };
  }

  getNextBadgeInfo() {
    const profile = this.getActiveProfile();
    const nextBadge = DEFAULT_BADGES.find(b => profile.stars < b.starsRequired);
    if (!nextBadge) {
      return { hasNext: false, message: "Hai conquistato tutti i 32 trofei leggendari! 🏆" };
    }
    const needed = nextBadge.starsRequired - profile.stars;
    return {
      hasNext: true,
      nextBadge,
      neededStars: needed,
      message: `Mancano ${needed} ⭐ per sbloccare ${nextBadge.icon} "${nextBadge.name}"`
    };
  }

  updateSettings(partialSettings) {
    this.state.settings = { ...this.state.settings, ...partialSettings };
    this.save();
  }

  exportCSV(profileId) {
    const profile = this.state.profiles.find(p => p.id === profileId) || this.getActiveProfile();
    const headers = ["Parola", "Numero Errori/Tentativi", "Volte Incontrata", "Categorie Fonetiche", "Ultima Data"];
    const rows = profile.mistakesLog.map(m => [
      `"${m.word}"`,
      m.attempts,
      m.timesEncountered,
      `"${(m.categories || []).join('; ')}"`,
      `"${new Date(m.lastDate).toLocaleDateString('it-IT')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    return encodeURI(csvContent);
  }
}
