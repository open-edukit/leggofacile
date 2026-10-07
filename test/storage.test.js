import test from 'node:test';
import assert from 'node:assert/strict';
import { categorizePhoneme, getInitialState } from '../src/storage.js';

test('categorizePhoneme - Identifies correct phonotactic groups', () => {
  const gatto = categorizePhoneme('gatto');
  assert.ok(gatto.includes('Doppie consonanti'));

  const acqua = categorizePhoneme('acqua');
  assert.ok(acqua.includes('Nesso "CQ"'));

  const festa = categorizePhoneme('festa');
  assert.ok(festa.includes('S impura'));

  const pesche = categorizePhoneme('pesche');
  assert.ok(pesche.includes('Digrammi / Trigrammi (GN, GL, SC, CH, GH)'));

  const libro = categorizePhoneme('libro');
  assert.ok(libro.includes('Nesso consonante + liquida (L/R)'));

  const poeta = categorizePhoneme('poeta');
  assert.ok(poeta.includes('Iato vocalico'));
});

test('getInitialState provides expected schema', () => {
  const state = getInitialState();
  assert.equal(state.profiles.length, 1);
  assert.equal(state.settings.pin, '1234');
  assert.equal(state.settings.fontFamily, 'Lexend');
});
