/**
 * LeggoFacile - Speech Recognition & Phonetic Verification Engine
 * Web Speech API wrapper with Levenshtein-based tolerance for 6-year-olds
 * and strict full-word verification to prevent false-advances on partial syllables.
 */

import { syllabifyItalian } from './syllables.js';

export function computeLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function calculateWordSimilarity(s1, s2) {
  const longer = s1.length >= s2.length ? s1 : s2;
  if (longer.length === 0) return 1.0;
  const distance = computeLevenshteinDistance(s1, s2);
  return (longer.length - distance) / longer.length;
}

export function normalizeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Strict check ensuring the child has read the ENTIRE target word.
 * Prevents false-advances on reading just the first syllable (e.g. "gat" for "gatto").
 * Correctly matches accented words (e.g. "è" vs "e", "perché" vs "perchè", "cos'è" vs "cosè").
 * Strictly enforces double consonants ("gato" != "gatto") for logopedic rigor.
 *
 * @param {string} heardText - Transcript from speech recognition
 * @param {string} targetWord - The target word to read
 * @returns {{ isMatch: boolean, reason?: string, token?: string, heardWord?: string, isPartial?: boolean }}
 */
export function verifyFullWordSpeech(heardText, targetWord) {
  const cleanTarget = (targetWord || '').toLowerCase().replace(/[^a-zàèéìòùáéíóú]/gi, '');
  if (!cleanTarget) return { isMatch: false, reason: "invalid_target" };

  const normTarget = normalizeAccents(cleanTarget);

  const rawTokens = (heardText || '').toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"«»“”–—\\[\]]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 0);

  if (rawTokens.length === 0) return { isMatch: false, reason: "silent" };

  // Expand tokens: both keep words as-is and split on apostrophes (e.g. "cos'è" -> ["cos'è", "cose", "cos", "è"])
  const heardTokens = [];
  for (const rt of rawTokens) {
    const withoutApos = rt.replace(/['’]/g, '');
    const cleanNoApos = withoutApos.replace(/[^a-zàèéìòùáéíóú]/gi, '');
    if (cleanNoApos) heardTokens.push(cleanNoApos);

    if (rt.includes("'") || rt.includes("’")) {
      const parts = rt.split(/['’]/).map(p => p.replace(/[^a-zàèéìòùáéíóú]/gi, '')).filter(p => p.length > 0);
      for (const p of parts) {
        if (!heardTokens.includes(p)) heardTokens.push(p);
      }
    }
  }

  if (heardTokens.length === 0) return { isMatch: false, reason: "silent" };
  const lastToken = heardTokens[heardTokens.length - 1];

  const targetSyllables = syllabifyItalian(cleanTarget);
  const isMultisyllabic = targetSyllables.length > 1;
  const firstSyllable = targetSyllables.length > 0 ? targetSyllables[0] : '';
  const lastSyllable = targetSyllables.length > 0 ? targetSyllables[targetSyllables.length - 1] : '';

  // 0. Check concatenated tokens for syllable-by-syllable reading (e.g. "gat" + "to" -> "gatto")
  const concatenated = heardTokens.join('');
  const normConcatenated = normalizeAccents(concatenated);
  if (concatenated === cleanTarget || normConcatenated === normTarget) {
    return { isMatch: true, heardWord: concatenated };
  }
  const concatSim = calculateWordSimilarity(normConcatenated, normTarget);
  if (concatenated.length >= cleanTarget.length * 0.85 && concatSim >= 0.85) {
    if (!isMultisyllabic || concatenated.endsWith(lastSyllable) || calculateWordSimilarity(concatenated.slice(-lastSyllable.length), lastSyllable) >= 0.6) {
      return { isMatch: true, heardWord: concatenated };
    }
  }

  for (const token of heardTokens) {
    const normToken = normalizeAccents(token);

    // 1. Exact match with the full word (or exact match ignoring accents: e.g. "perche" vs "perché", "e" vs "è")
    if (token === cleanTarget || normToken === normTarget) {
      return { isMatch: true, heardWord: token };
    }

    // 2. Strict logopedic check: If target has a double consonant, the spoken token MUST preserve it!
    // E.g. "gatto" (double t) cannot match "gato" (single t).
    const targetHasDouble = /(.)\1/.test(normTarget);
    const tokenHasDouble = /(.)\1/.test(normToken);
    if (targetHasDouble && !tokenHasDouble) {
      continue; // Strictly reject missing double consonants
    }

    // 3. If multisyllabic, ensure the spoken token is NOT just the first syllable
    if (isMultisyllabic) {
      if (token === firstSyllable || normToken === normalizeAccents(firstSyllable) ||
         (firstSyllable.startsWith(token) && token.length >= 2) ||
         (token.startsWith(firstSyllable) && token.length < cleanTarget.length * 0.8)) {
        continue;
      }

      // Check length: must cover at least 82% of the full word
      const lengthRatio = token.length / cleanTarget.length;
      if (lengthRatio < 0.82) {
        continue; // Too short to have read all syllables
      }

      // Must end with or phonetically match the ending/last syllable of the target word
      const tokenEnding = token.slice(-Math.max(2, lastSyllable.length));
      const endingSim = calculateWordSimilarity(tokenEnding, lastSyllable);
      if (endingSim < 0.5 && !token.endsWith(lastSyllable) && !normToken.endsWith(normalizeAccents(lastSyllable))) {
        continue; // Child did not pronounce the end of the word
      }

      const similarity = calculateWordSimilarity(normToken, normTarget);
      if (similarity >= 0.85) {
        return { isMatch: true, heardWord: token };
      }
    } else {
      // Monosyllabic word (e.g. "re", "blu", "tre")
      if (cleanTarget.length === 1) {
        // Single character words like "è", "e", "a", "o": require exact accent-normalized match
        if (normToken === normTarget) {
          return { isMatch: true, heardWord: token };
        }
      } else {
        const similarity = calculateWordSimilarity(normToken, normTarget);
        if (similarity >= 0.80) {
          return { isMatch: true, heardWord: token };
        }
      }
    }
  }

  // Check if spoken text matches an initial syllable or prefix (e.g. "gat" for "gatto")
  for (const token of heardTokens) {
    if ((cleanTarget.startsWith(token) || normTarget.startsWith(normalizeAccents(token))) && token.length >= 2) {
      return { isMatch: false, reason: "partial_syllable", token: token, isPartial: true };
    }
    if (firstSyllable && (token === firstSyllable || calculateWordSimilarity(token, firstSyllable) >= 0.8)) {
      return { isMatch: false, reason: "partial_syllable", token: token, isPartial: true };
    }
  }

  return { isMatch: false, reason: "wrong_word", token: lastToken };
}

/**
 * Speech Recognition Controller with auto-restart loop
 */
export class SpeechController {
  constructor({ onResult, onError, onStateChange }) {
    this.onResult = onResult;
    this.onError = onError;
    this.onStateChange = onStateChange;
    this.isListening = false;
    this.recognition = null;
    this.keepAliveTimeout = null;
    this.lastEvaluated = "";


    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    this.isSupported = !!SpeechRecognition;
  }

  init() {
    if (!this.isSupported) return false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'it-IT';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    this.recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        const transcript = res[0].transcript.trim();
        if (res.isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }

      const candidate = (finalText || interimText).trim().toLowerCase();
      if (!candidate || candidate === this.lastEvaluated) return;

      this.lastEvaluated = candidate;
      if (this.onResult) this.onResult(candidate);
    };

    this.recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      if (this.onError) this.onError(e.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        clearTimeout(this.keepAliveTimeout);
        this.keepAliveTimeout = setTimeout(() => {
          try {
            if (this.isListening) this.recognition.start();
          } catch (err) {}
        }, 200);
      } else {
        if (this.onStateChange) this.onStateChange(false);
      }
    };

    return true;
  }

  start() {
    if (!this.recognition && !this.init()) return false;
    this.isListening = true;
    try {
      this.recognition.start();
      if (this.onStateChange) this.onStateChange(true);
      return true;
    } catch (err) {
      console.warn("Recognition start err:", err);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    clearTimeout(this.keepAliveTimeout);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {}
    }
    if (this.onStateChange) this.onStateChange(false);
  }

  resetBuffer() {
    this.lastEvaluated = "";
  }

  toggle() {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }
}

