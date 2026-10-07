import test from 'node:test';
import assert from 'node:assert/strict';
import { syllabifyItalian, sanitizeAndTokenizeText, spellPhonemes, parseStructuredText } from '../src/syllables.js';

test('Italian Syllabification - Double Consonants', () => {
  assert.deepEqual(syllabifyItalian('gatto'), ['gat', 'to']);
  assert.deepEqual(syllabifyItalian('tetto'), ['tet', 'to']);
  assert.deepEqual(syllabifyItalian('rosso'), ['ros', 'so']);
  assert.deepEqual(syllabifyItalian('palla'), ['pal', 'la']);
  assert.deepEqual(syllabifyItalian('pozzo'), ['poz', 'zo']);
});

test('Italian Syllabification - "CQ" cluster', () => {
  assert.deepEqual(syllabifyItalian('acqua'), ['ac', 'qua']);
  assert.deepEqual(syllabifyItalian('nacque'), ['nac', 'que']);
});

test('Italian Syllabification - Simple CV syllables', () => {
  assert.deepEqual(syllabifyItalian('cane'), ['ca', 'ne']);
  assert.deepEqual(syllabifyItalian('mano'), ['ma', 'no']);
  assert.deepEqual(syllabifyItalian('luna'), ['lu', 'na']);
  assert.deepEqual(syllabifyItalian('sole'), ['so', 'le']);
  assert.deepEqual(syllabifyItalian('mela'), ['me', 'la']);
});

test('Italian Syllabification - Digraphs and Trigraphs', () => {
  assert.deepEqual(syllabifyItalian('pesche'), ['pe', 'sche']);
  assert.deepEqual(syllabifyItalian('pesce'), ['pe', 'sce']);
  assert.deepEqual(syllabifyItalian('legno'), ['le', 'gno']);
  assert.deepEqual(syllabifyItalian('bagno'), ['ba', 'gno']);
});

test('Italian Syllabification - S impura', () => {
  assert.deepEqual(syllabifyItalian('festa'), ['fe', 'sta']);
  assert.deepEqual(syllabifyItalian('bastone'), ['ba', 'sto', 'ne']);
  assert.deepEqual(syllabifyItalian('pesca'), ['pe', 'sca']);
  assert.deepEqual(syllabifyItalian('scuola'), ['scuo', 'la']);
  assert.deepEqual(syllabifyItalian('spalla'), ['spal', 'la']);
});

test('Italian Syllabification - Consonant + Liquid (L/R)', () => {
  assert.deepEqual(syllabifyItalian('libro'), ['li', 'bro']);
  assert.deepEqual(syllabifyItalian('capra'), ['ca', 'pra']);
  assert.deepEqual(syllabifyItalian('crema'), ['cre', 'ma']);
  assert.deepEqual(syllabifyItalian('treno'), ['tre', 'no']);
  assert.deepEqual(syllabifyItalian('teatro'), ['te', 'a', 'tro']);
});

test('Italian Syllabification - Hiatus (Strong Vowels A, E, O)', () => {
  assert.deepEqual(syllabifyItalian('poeta'), ['po', 'e', 'ta']);
  assert.deepEqual(syllabifyItalian('maestro'), ['ma', 'e', 'stro']);
  assert.deepEqual(syllabifyItalian('leone'), ['le', 'o', 'ne']);
});

test('Italian Syllabification - Complex Multi-syllabic Words', () => {
  assert.deepEqual(syllabifyItalian('bambino'), ['bam', 'bi', 'no']);
  assert.deepEqual(syllabifyItalian('farfalla'), ['far', 'fal', 'la']);
  assert.deepEqual(syllabifyItalian('albero'), ['al', 'be', 'ro']);
  assert.deepEqual(syllabifyItalian('elefante'), ['e', 'le', 'fan', 'te']);
  assert.deepEqual(syllabifyItalian('castello'), ['ca', 'stel', 'lo']);
  assert.deepEqual(syllabifyItalian('ombrello'), ['om', 'brel', 'lo']);
  assert.deepEqual(syllabifyItalian('finestra'), ['fi', 'ne', 'stra']);
});

test('parseStructuredText preserves all punctuation, spaces and newlines', () => {
  const input = "La gatta Luna, che dormiva sopra il divano... si alzò!\nDisse: «Miao!»";
  const { tokens, words } = parseStructuredText(input);

  // Check 100% string reconstruction
  const reconstructed = tokens.map(t => t.raw || t.text).join('');
  assert.equal(reconstructed, input);

  // Check indexed words
  assert.equal(words.length, 12);
  assert.equal(words[0].raw, 'La');
  assert.equal(words[0].clean, 'la');
  assert.equal(words[1].raw, 'gatta');
  assert.equal(words[2].raw, 'Luna');
  assert.equal(words[11].raw, 'Miao');
});

test('Phoneme Spelling', () => {
  assert.equal(spellPhonemes('gatto'), 'G • A • T • T • O');
  assert.equal(spellPhonemes('sole'), 'S • O • L • E');
});
