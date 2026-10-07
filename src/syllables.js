/**
 * LeggoFacile - Italian Syllabification Engine
 * Implements standard Italian phonotactic & orthographic rules for early readers (DSA/Primary School).
 */

export const VOWELS = "aeiouyàèéìòùáéíóú";
export const STRONG_VOWELS = "aeoàèéòáéó";
export const WEAK_VOWELS = "iuìùíú";

export function isVowel(char) {
  if (!char) return false;
  return VOWELS.includes(char.toLowerCase());
}

export function isStrongVowel(char) {
  if (!char) return false;
  return STRONG_VOWELS.includes(char.toLowerCase());
}

export function isWeakVowel(char) {
  if (!char) return false;
  return WEAK_VOWELS.includes(char.toLowerCase());
}

/**
 * Syllabifies an Italian word into an array of syllables.
 * @param {string} word - The input word
 * @returns {string[]} - Array of lowercase syllables
 */
export function syllabifyItalian(word) {
  if (!word) return [];
  const clean = word.toLowerCase().trim().replace(/[^a-zàèéìòùáéíóú]/gi, '');
  if (clean.length <= 1) return [clean];

  const n = clean.length;
  // breaks[i] is true if there is a syllable boundary between clean[i] and clean[i+1]
  const breaks = new Array(n).fill(false);

  const liquidClusters = ['b', 'c', 'd', 'f', 'g', 'p', 't', 'v'];

  for (let i = 0; i < n - 1; i++) {
    const c1 = clean[i];
    const c2 = clean[i + 1];
    const c3 = i + 2 < n ? clean[i + 2] : null;
    const c4 = i + 3 < n ? clean[i + 3] : null;
    const prev = i > 0 ? clean[i - 1] : null;

    // 1. Double consonants: ALWAYS split (gat-to, ros-so, tet-to, poz-zo)
    if (c1 === c2 && !isVowel(c1)) {
      breaks[i] = true;
      continue;
    }

    // 2. 'cq' cluster: ALWAYS split as double consonant (ac-qua, nac-que)
    if (c1 === 'c' && c2 === 'q') {
      breaks[i] = true;
      continue;
    }

    // 3. Digraphs and trigraphs: ch, gh, gn, gl (+i), sc (+e/i)
    // If preceded by a vowel, the boundary is BEFORE the digraph (e.g. le-gno, ba-gno, pe-sce, a-glio, o-che)
    const isDigraphStart = (
      (c2 === 'c' && c3 === 'h') ||
      (c2 === 'g' && c3 === 'h') ||
      (c2 === 'g' && c3 === 'n') ||
      (c2 === 'g' && c3 === 'l' && c4 === 'i') ||
      (c2 === 's' && c3 === 'c' && (c4 === 'e' || c4 === 'i'))
    );
    if (isVowel(c1) && isDigraphStart) {
      breaks[i] = true;
      continue;
    }

    // Do NOT split internally within digraphs/trigraphs (c1+c2)
    if (
      (c1 === 'c' && c2 === 'h') ||
      (c1 === 'g' && c2 === 'h') ||
      (c1 === 'g' && c2 === 'n') ||
      (c1 === 'g' && c2 === 'l' && c3 === 'i') ||
      (c1 === 's' && c2 === 'c' && (c3 === 'e' || c3 === 'i' || (c3 === 'h' && c4 && (c4 === 'e' || c4 === 'i'))))
    ) {
      continue;
    }

    // 4. 'S' impura: 's' followed by another consonant (fe-sta, ba-sto-ne, pe-sca, scuo-la, spal-la)
    // The 's' ALWAYS belongs to the following syllable if preceded by a vowel!
    // Example: fe-sta (break between e and s), but if preceded by consonant (in-sta-bi-le): break between n and s
    if (c2 === 's' && c3 && !isVowel(c3) && c3 !== 's') {
      // If c1 is a vowel, break before the 's'
      if (isVowel(c1)) {
        breaks[i] = true;
        continue;
      }
      // If c1 is a consonant (e.g. con-sta-re), break after c1
      if (!isVowel(c1)) {
        breaks[i] = true;
        continue;
      }
    }

    // If current is 's' and followed by consonant, do NOT split between s and the consonant!
    if (c1 === 's' && !isVowel(c2) && c2 !== 's') {
      continue;
    }

    // 5. Consonant + liquid (b/c/d/f/g/p/t/v + l/r): NEVER split (li-bro, ca-pra, te-a-tro, cre-ma, a-pri-re)
    // If preceded by vowel, break was before c1
    if (liquidClusters.includes(c2) && c3 && (c3 === 'l' || c3 === 'r')) {
      if (isVowel(c1)) {
        breaks[i] = true;
        continue;
      }
      if (!isVowel(c1) && c1 !== 's') {
        breaks[i] = true; // e.g. sem-pre, in-cro-cio
        continue;
      }
    }

    if (liquidClusters.includes(c1) && (c2 === 'l' || c2 === 'r')) {
      continue; // Don't split between consonant and liquid
    }

    // 6. Two consecutive consonants between vowels: split unless covered by rules above
    // Examples: can-to, par-te, al-to, den-te, mon-do, cor-so
    if (!isVowel(c1) && !isVowel(c2)) {
      if (prev && isVowel(prev)) {
        if (c1 !== 's') {
          breaks[i] = true;
          continue;
        }
      }
    }

    // 7. Standard Vowel + single consonant + Vowel: break between Vowel and Consonant (ca-ne, ma-no, ro-sa, a-mi-co)
    if (isVowel(c1) && !isVowel(c2) && c3 && isVowel(c3)) {
      breaks[i] = true;
      continue;
    }

    // 8. Vowel + Vowel (Hiatus: two strong vowels a, e, o always split: po-e-ta, ma-e-stro, le-o-ne, be-a-to)
    if (isStrongVowel(c1) && isStrongVowel(c2)) {
      breaks[i] = true;
      continue;
    }
  }

  // Reconstruct syllables based on break boundaries
  const syllables = [];
  let currentSyllable = "";
  for (let i = 0; i < n; i++) {
    currentSyllable += clean[i];
    if (breaks[i]) {
      syllables.push(currentSyllable);
      currentSyllable = "";
    }
  }

  if (currentSyllable.length > 0) {
    // If trailing consonant without a vowel at the end of word, attach to previous syllable (e.g. per, non, bar)
    const hasVowel = currentSyllable.split('').some(ch => isVowel(ch));
    if (syllables.length > 0 && !hasVowel) {
      syllables[syllables.length - 1] += currentSyllable;
    } else {
      syllables.push(currentSyllable);
    }
  }

  return syllables.length > 0 ? syllables : [clean];
}

/**
 * Parses raw text preserving 100% of original punctuation, casing, newlines and spaces,
 * while extracting the list of indexed target words for reading.
 *
 * @param {string} rawText
 * @returns {{ tokens: Array<{type: string, text?: string, raw?: string, clean?: string, wordIndex?: number}>, words: Array<{wordIndex: number, raw: string, clean: string}> }}
 */
export function parseStructuredText(rawText) {
  if (!rawText) return { tokens: [], words: [] };

  const tokens = [];
  const words = [];
  // Tokenize words vs punctuation vs whitespace
  const tokenRegex = /([a-zàèéìòùáéíóúA-ZÀÈÉÌÒÙÁÉÍÓÚ]+)|(\r\n|\r|\n)|(\s+)|([^a-zàèéìòùáéíóúA-ZÀÈÉÌÒÙÁÉÍÓÚ\s]+)/g;
  let match;
  let wordIdx = 0;

  while ((match = tokenRegex.exec(rawText)) !== null) {
    const [full, wordMatch, newlineMatch, spaceMatch, punctMatch] = match;

    if (wordMatch) {
      const clean = wordMatch.toLowerCase();
      const token = {
        type: 'word',
        raw: wordMatch,
        clean: clean,
        wordIndex: wordIdx
      };
      tokens.push(token);
      words.push({
        wordIndex: wordIdx,
        raw: wordMatch,
        clean: clean
      });
      wordIdx++;
    } else if (newlineMatch) {
      tokens.push({ type: 'newline', text: newlineMatch });
    } else if (spaceMatch) {
      tokens.push({ type: 'space', text: spaceMatch });
    } else if (punctMatch) {
      tokens.push({ type: 'punct', text: punctMatch });
    }
  }

  return { tokens, words };
}

/**
 * Strips all punctuation and returns a sanitized list of word tokens.
 * @param {string} rawText
 * @returns {string[]}
 */
export function sanitizeAndTokenizeText(rawText) {
  if (!rawText) return [];

  const normalized = rawText.replace(/[\n\r\t]+/g, ' ');

  // Strip all punctuation marks preserving accented letters
  return normalized
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"«»“”'’–—\\[\]]/g, " ")
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0 && /[a-zàèéìòùáéíóú]/i.test(w));
}

/**
 * Phonetic/orthographic decomposition with dots (L • E • T • T • E • R • E)
 * @param {string} word
 * @returns {string}
 */
export function spellPhonemes(word) {
  if (!word) return "";
  return word.toUpperCase().replace(/[^A-ZÀÈÉÌÒÙÁÉÍÓÚ]/g, '').split('').join(' • ');
}
