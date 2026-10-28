import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('HTML classic scripts initialize cards and save progress without fetch or module loading', () => {
  const root = new URL('../', import.meta.url);
  const html = fs.readFileSync(new URL('index.html', root), 'utf8');
  assert.equal(html.includes('type="module"'), false);
  const elements = new Map();
  const storage = new Map();
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', checked: false, textContent: '', innerHTML: '',
      querySelectorAll: () => [], focus() {},
    });
    return elements.get(selector);
  }
  const context = vm.createContext({
    window: {},
    document: {querySelector: element, body: {classList: {add() {}}}},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    setTimeout: () => 0, clearTimeout() {}, console,
  });
  for (const match of html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)) {
    const code = fs.readFileSync(new URL(match[1], root), 'utf8');
    assert.equal(/\bfetch\s*\(/.test(code), false);
    vm.runInContext(code, context, {filename: match[1]});
  }
  const active = context.window.KA_SETS[0];
  const first = active.words[0], second = active.words[1];
  assert.equal(element('#set-title').textContent, active.title);
  assert.ok(element('#workspace').innerHTML.includes(first.term));
  element('#flip').onclick();
  assert.ok(element('#workspace').innerHTML.includes(first.meaning));
  element('#known').onclick();
  const saved = JSON.parse(storage.get('kelime-atolyesi-progress-v1'));
  assert.equal(saved.words[first.id].streak, 1);
  assert.ok(element('#workspace').innerHTML.includes(second.term));
});
