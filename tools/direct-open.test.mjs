import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openApp} from './helpers/dom.mjs';

test('classic scripts initialize the new interface and save existing-schema progress without a server', () => {
  const html = fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.equal(html.includes('type="module"'),false);
  const app = openApp(), first = app.sets[0].words[0], second = app.sets[0].words[1];
  assert.equal(app.$('#set-title').textContent,app.sets[0].title);
  assert.ok(app.$('.term').textContent.includes(first.term));
  assert.equal(app.$('#known').disabled,true);
  app.click('#flip'); assert.equal(app.$('.term').textContent,first.meaning);
  app.click('#known');
  assert.equal(app.progress().words[first.id].streak,1);
  assert.equal(app.$('.term').textContent,second.term);
});

test('old favorites and progress survive navigation, grading and export', async () => {
  const baseline = {version:1,words:{'ot-conversely':{star:true,attempts:4,correct:4,streak:3,due:9999999999999},'old-id':{star:true}}};
  const app = openApp({'kelime-atolyesi-progress-v1':JSON.stringify(baseline)});
  assert.equal(app.$('#favorite-count').textContent,'1');
  assert.equal(app.$('#card-star').getAttribute('aria-pressed'),'true');
  app.click('[data-view="library"]');
  assert.equal(app.$$('.set-tile').length,3);
  app.click('[data-view="favorites"]'); assert.ok(app.$('#library-view').textContent.includes('conversely'));
  app.click('[data-action="study-collection"]'); app.click('#flip'); app.click('#known');
  assert.equal(app.progress().words['ot-conversely'].streak,4);
  assert.equal(app.progress().words['old-id'].star,true);
  app.click('#export');
  const exported = JSON.parse(await app.downloads[0].text());
  assert.equal(exported.words['old-id'].star,true);
});

test('audio preferences, reverse direction and position remain after card changes and reload', () => {
  const app = openApp();
  app.$('#accent').value = 'en-US'; app.$('#accent').onchange({target:app.$('#accent')});
  app.$('#slow').checked = true; app.$('#slow').onchange({target:app.$('#slow')});
  app.click('#next'); app.click('#flip'); app.click('[data-speak]');
  assert.equal(app.voices.at(-1).lang,'en-US'); assert.equal(app.voices.at(-1).rate,.7);
  app.click('[data-action="reverse"]');
  assert.equal(app.$('.term').textContent,app.sets[0].words[1].meaning);
  const restored = openApp(app.persisted());
  assert.equal(restored.$('.term').textContent,restored.sets[0].words[1].meaning);
  assert.equal(restored.$('#slow').checked,true);
});

test('quiz feedback grades once, highlights the right answer and lets the learner continue', () => {
  const app = openApp();
  app.click('[data-mode="learn"]');
  const meaning = app.$('.question').textContent;
  const word = app.sets[0].words.find(w=>w.meaning === meaning);
  const right = app.$$('.answer-option').find(b=>b.textContent.endsWith(word.term));
  right.click(); right.click();
  assert.equal(app.progress().words[word.id].attempts,1);
  assert.ok(app.$('.answer-option.correct'));
  assert.equal(app.$('#continue').hidden,false);
  app.click('#continue');
  assert.ok(app.$('.question-meta').textContent.startsWith('2 /'));
});

test('write and listening modes reject wrong answers, play actual terms, and test mode completes a short test', () => {
  const app = openApp();
  app.click('[data-mode="write"]');
  app.$('#answer').value = 'not the answer';
  app.$('#answer-form').onsubmit({preventDefault(){}});
  assert.ok(app.$('#feedback').classList.contains('bad'));
  app.click('[data-mode="listen"]'); app.click('.listen-button');
  assert.ok(app.sets[0].words.some(w=>w.term===app.voices.at(-1).text));
  const spoken = app.voices.at(-1).text;
  app.$('#answer').value = spoken;
  app.$('#answer-form').onsubmit({preventDefault(){}});
  assert.ok(app.$('#feedback').classList.contains('good'));
  app.click('[data-mode="test"]'); app.click('[data-action="begin-test"]');
  for (let i=0;i<10;i++) {
    app.click('#skip-question'); app.click('#continue');
  }
  assert.match(app.$('.result').textContent,/0.*10/);
  assert.ok(app.$('[data-action="retry-wrong"]'));
});

test('matching adds penalties and stops its timer on completion or when leaving the mode', () => {
  const app = openApp();
  app.click('[data-mode="match"]');
  const buttons = app.$$('.match-tile');
  const firstWord = app.sets[0].words.find(w=>[w.term,w.meaning].includes(buttons[0].textContent));
  const other = buttons.find(b=>![firstWord.term,firstWord.meaning].includes(b.textContent));
  buttons[0].click(); other.click(); app.advance(2000);
  assert.ok(Number(app.$('#match-time').textContent) >= 3);
  for (const word of app.sets[0].words) {
    const pair = app.$$('.match-tile').filter(b=>[word.term,word.meaning].includes(b.textContent) && !b.disabled);
    if (pair.length===2) {pair[0].click(); pair[1].click();}
  }
  assert.equal(app.$$('.match-tile.matched').length,12);
  assert.equal(app.timers.size,0);
  app.click('[data-action="new-match"]'); app.click('.match-tile'); assert.equal(app.timers.size,1);
  app.click('[data-mode="cards"]'); assert.equal(app.timers.size,0);
});

test('search, reading tabs, favorites filters and keyboard controls work with the new layout', () => {
  const app = openApp(), first = app.sets[0].words[0];
  app.key(' '); assert.equal(app.$('.term').textContent,first.meaning);
  app.key('ArrowRight'); assert.equal(app.$('.term').textContent,app.sets[0].words[1].term);
  app.key('f'); assert.equal(app.$('#favorite-count').textContent,'1');
  app.$('#word-search').value = 'no-such-term'; app.$('#word-search').oninput();
  assert.ok(app.$('#words .empty'));
  app.$('#word-search').value = ''; app.$('#word-search').oninput();
  app.click('#notes-tab'); assert.equal(app.$('#study-notes').hidden,false); assert.equal(app.$('#terms-panel').hidden,true);
  app.$('#global-search').value = 'taught'; app.$('#global-search').oninput();
  assert.equal(app.$('#search-results').hidden,false);
  app.click('#search-results [data-open-word]');
  assert.equal(app.$('.term').textContent,'teach');
  app.click('#focus'); assert.ok(app.document.body.classList.contains('focus-mode'));
  app.key('Escape'); assert.equal(app.document.body.classList.contains('focus-mode'),false);
});

test('import merges known schema safely and malformed imports do not overwrite existing records', async () => {
  const app = openApp();
  const incoming = {version:1,words:{'ot-teach':{star:true,streak:2,attempts:2,correct:2,due:0}}};
  await app.$('#import').onchange({target:{files:[{size:100,text:async()=>JSON.stringify(incoming)}],value:''}});
  assert.equal(app.progress().words['ot-teach'].star,true);
  const saved = app.storage.get('kelime-atolyesi-progress-v1');
  await app.$('#import').onchange({target:{files:[{size:10,text:async()=>'{"broken":true}'}],value:''}});
  assert.equal(app.storage.get('kelime-atolyesi-progress-v1'),saved);
});
