import test from 'node:test';
import assert from 'node:assert/strict';
import { computeLevenshteinDistance, calculateWordSimilarity, verifyFullWordSpeech } from '../src/speech.js';

test('Levenshtein distance & word similarity', () => {
  assert.equal(computeLevenshteinDistance('gatto', 'gatto'), 0);
  assert.equal(computeLevenshteinDistance('gatto', 'gattoh'), 1);
  assert.equal(calculateWordSimilarity('gatto', 'gatto'), 1.0);
  assert.ok(calculateWordSimilarity('gatto', 'gato') >= 0.8);
});

test('verifyFullWordSpeech - Exact matches', () => {
  const res = verifyFullWordSpeech('gatto', 'gatto');
  assert.equal(res.isMatch, true);
  assert.equal(res.heardWord, 'gatto');
});

test('verifyFullWordSpeech - Prevents single syllable false-advance', () => {
  // If child says only "gat" for "gatto"
  const res = verifyFullWordSpeech('gat', 'gatto');
  assert.equal(res.isMatch, false);
  assert.equal(res.reason, 'partial_syllable');

  // If child says only "scuo" for "scuola"
  const res2 = verifyFullWordSpeech('scuo', 'scuola');
  assert.equal(res2.isMatch, false);
  assert.equal(res2.reason, 'partial_syllable');
});

test('verifyFullWordSpeech - Strictly rejects missing double consonants (logopedic rigor)', () => {
  // Child says "gato" (single t) instead of "gatto"
  const res = verifyFullWordSpeech('gato', 'gatto');
  assert.equal(res.isMatch, false);

  // Child says "bala" instead of "palla"
  const res2 = verifyFullWordSpeech('pala', 'palla');
  assert.equal(res2.isMatch, false);

  // Still accepts correct target within spoken sentence
  const res3 = verifyFullWordSpeech('ho detto albero', 'albero');
  assert.equal(res3.isMatch, true);
});

test('verifyFullWordSpeech - Handles Italian accents and single-letter words', () => {
  // Single letter words like "è" / "e"
  assert.equal(verifyFullWordSpeech('e', 'è').isMatch, true);
  assert.equal(verifyFullWordSpeech('è', 'e').isMatch, true);
  assert.equal(verifyFullWordSpeech('a', 'a').isMatch, true);

  // Truncated / accented words: "perché" vs "perchè" / "perche"
  assert.equal(verifyFullWordSpeech('perche', 'perché').isMatch, true);
  assert.equal(verifyFullWordSpeech('perché', 'perchè').isMatch, true);

  // "cos'è" vs "cosè" vs "cose"
  assert.equal(verifyFullWordSpeech("cos'è", 'cosè').isMatch, true);
  assert.equal(verifyFullWordSpeech("cos'è", 'cosa').isMatch, false);
  assert.equal(verifyFullWordSpeech('cosè', 'cosè').isMatch, true);
});

test('verifyFullWordSpeech - Accepts syllable-by-syllable reading (e.g. "gat to" for "gatto")', () => {
  const res = verifyFullWordSpeech('gat to', 'gatto');
  assert.equal(res.isMatch, true);

  const res2 = verifyFullWordSpeech('fe sta', 'festa');
  assert.equal(res2.isMatch, true);
});

test('verifyFullWordSpeech - Rejects completely wrong words', () => {
  const res = verifyFullWordSpeech('casa', 'gatto');
  assert.equal(res.isMatch, false);
  assert.equal(res.reason, 'wrong_word');
});

