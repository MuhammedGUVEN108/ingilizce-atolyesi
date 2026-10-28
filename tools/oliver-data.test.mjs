import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const read = name => JSON.parse(fs.readFileSync(new URL(name, root), 'utf8'));
const words = read('data/sets/oliver-twist-words.json').words;
const phrases = read('data/sets/oliver-twist-phrases.json').words;
const cards = [...words, ...phrases];

test('every imported card is traceable and all extracted table rows are accounted for', () => {
  const manifest = read('data/analysis/oliver-twist/manifest.json');
  assert.equal(words.length, manifest.vocabularyCards);
  assert.equal(phrases.length, manifest.phraseCards);
  assert.equal(new Set(cards.map(w => w.id)).size, cards.length);
  for (const w of cards) {
    assert.ok(w.provenance.lines.length > 0);
    assert.ok(w.sourceForms.length > 0);
    assert.equal(w.verificationDetails.allFieldsDictionaryVerified, false);
    assert.equal(w.examples[0].origin, 'created-for-study');
  }
  const rows = read('data/analysis/oliver-twist/source-rows.json');
  assert.ok(rows.every(r => r.disposition !== 'unmapped'));
  const terms = new Set(cards.map(w => w.term));
  for (const row of rows.filter(r => r.disposition === 'study-card')) assert.ok(terms.has(row.canonical));
});

test('uncertain spellings do not become scored answers and inflections retain evidence', () => {
  const answers = cards.flatMap(w => w.acceptedAnswers);
  for (const bad of ['foryos', 'convet', 'furious', 'convict', 'convert', 'convent']) assert.ok(!answers.includes(bad));
  for (const [term,form] of [['teach','Taught'],['ring','Rang'],['drag','Dragged']]) {
    assert.ok(cards.find(w => w.term === term).sourceForms.includes(form));
  }
  assert.ok(cards.find(w => w.term === 'chant').acceptedAnswers.includes('chaunt'));
});

test('sentence rewrites retain originals and unresolved text has no invented correction', () => {
  const sentences = read('data/analysis/oliver-twist/sentences.json');
  assert.equal(sentences.length, 19);
  for (const s of sentences) assert.ok(s.sourceLines.length);
  for (const s of sentences.filter(s => s.status === 'unresolved')) {
    assert.equal(s.studyVersion, null);
    assert.equal(s.tr, null);
  }
  const changed = sentences.find(s => s.original.includes('hanged'));
  assert.ok(changed.studyVersion.includes('hanging'));
  assert.notEqual(changed.original, changed.studyVersion);
});
