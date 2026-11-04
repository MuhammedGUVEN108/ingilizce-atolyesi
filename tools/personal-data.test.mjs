import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {createProgressStore,DB_NAME,PROGRESS_KEY,PREFERENCE_KEY,THEME_KEY,MAX_PERSONAL_BYTES} from '../site/js/storage.js';
import {schedule,getWordStats,difficultyScore} from '../site/js/core.js';
import {openApp} from './helpers/dom.mjs';
function local(values={}) {
  const map=new Map(Object.entries(values));
  return {map,getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)};
}
test('legacy incorrect counts are derived accurately and consecutive wrong answers reset on success',()=>{
  const old={attempts:8,correct:5,star:true,streak:0};
  assert.equal(getWordStats(old).wrong,3);
  const wrong=schedule(old,false,1234);
  assert.equal(wrong.wrong,4);assert.equal(wrong.attempts,9);assert.equal(wrong.correct,5);
  assert.equal(wrong.wrongStreak,1);assert.equal(wrong.lastReviewedAt,1234);
  const right=schedule(wrong,true,2345);
  assert.equal(right.wrong,4);assert.equal(right.wrongStreak,0);assert.equal(right.star,true);
  assert.ok(difficultyScore(wrong)>difficultyScore(right));
});
test('existing progress migrates to IndexedDB and original local record is removed only after successful writing',async()=>{
  const legacy={version:1,words:{'ot-teach':{attempts:8,correct:5,star:true}}};
  const storage=local({[PROGRESS_KEY]:JSON.stringify(legacy),[PREFERENCE_KEY]:'{"slow":true}','another-site':'keep'});
  const indexedDB=new IDBFactory();
  const store=createProgressStore({indexedDB,localStorage:storage});
  assert.deepEqual(await store.ready,legacy);
  assert.equal(store.mode,'indexedDB');
  assert.equal(storage.getItem(PROGRESS_KEY),null);
  assert.equal(storage.getItem(PREFERENCE_KEY),'{"slow":true}');
  const reopened=createProgressStore({indexedDB,localStorage:storage});
  assert.equal((await reopened.ready).words['ot-teach'].star,true);
  store.close();reopened.close();
});
test('failed migration preserves original browser data',async()=>{
  const raw=JSON.stringify({version:1,words:{'ot-teach':{star:true}}});
  const storage=local({[PROGRESS_KEY]:raw}), warnings=[];
  const store=createProgressStore({indexedDB:new IDBFactory(),localStorage:storage,limit:10,onWarning:m=>warnings.push(m)});
  await store.ready;
  assert.equal(storage.getItem(PROGRESS_KEY),raw);
  assert.ok(warnings.length>0);
  store.close();
});
test('IndexedDB supports more than 5 MB, but a write above the 10 MB app limit leaves prior data untouched',async()=>{
  const store=createProgressStore({indexedDB:new IDBFactory(),localStorage:local()});
  await store.ready;
  const large={version:1,words:{'ot-teach':{star:true,padding:'a'.repeat(3_000_000)}}};
  await store.update(()=>large);
  assert.ok(store.usageBytes>5*1024*1024);
  assert.ok(store.usageBytes<MAX_PERSONAL_BYTES);
  await assert.rejects(store.update(()=>({version:1,words:{'ot-teach':{padding:'b'.repeat(6_000_000)}}})),e=>e.code==='APP_LIMIT');
  assert.equal((await store.read()).words['ot-teach'].padding.length,3_000_000);
  store.close();
});
test('two tabs update counts transactionally and stale state does not restore deleted history',async()=>{
  const indexedDB=new IDBFactory(), storage=local();
  const a=createProgressStore({indexedDB,localStorage:storage}),b=createProgressStore({indexedDB,localStorage:storage});
  await Promise.all([a.ready,b.ready]);
  const update=old=>({version:1,words:{...old.words,'ot-teach':schedule(old.words['ot-teach']||{},false,1000)}});
  await Promise.all([a.update(update),b.update(update)]);
  assert.equal((await a.read()).words['ot-teach'].wrong,2);
  await a.clear();
  await b.update(old=>({version:1,words:{...old.words,'ot-ring':{star:true}}}));
  assert.deepEqual(Object.keys((await b.read()).words),['ot-ring']);
  a.close();b.close();
});
test('clear removes only this app database record and three owned browser keys',async()=>{
  const storage=local({[PREFERENCE_KEY]:'{}',[THEME_KEY]:'dark','another-site':'do not delete'});
  const store=createProgressStore({indexedDB:new IDBFactory(),localStorage:storage});
  await store.ready;
  await store.update(()=>({version:1,words:{'ot-teach':{star:true}}}));
  await store.clear();
  assert.equal(storage.getItem(PREFERENCE_KEY),null);assert.equal(storage.getItem(THEME_KEY),null);
  assert.equal(storage.getItem('another-site'),'do not delete');
  assert.deepEqual(await store.read(),{version:1,words:{}});
  assert.equal(store.usageBytes,0);
  store.close();
});
test('wrong counts survive reload and even a single difficult term produces a four-option test',async()=>{
  const legacy={version:1,words:{'ot-teach':{attempts:7,correct:2,streak:0,lastResult:false}}};
  const app=await openApp({[PROGRESS_KEY]:JSON.stringify(legacy)});
  await app.click('[data-view="difficult"]');
  assert.match(app.$('.collection-row').textContent,/5 yanlış/);
  await app.click('[data-action="study-collection"]');
  await app.click('[data-action="begin-test"]');
  assert.equal(app.$$('.answer-option').length,4);
  assert.equal(app.$('#answer'),null);
  const wrong=app.$$('.answer-option').find(b=>b.querySelector('span:last-child').textContent!=='teach');
  wrong.click();await app.settle();
  assert.equal(app.progress().words['ot-teach'].wrong,6);
  assert.equal(app.progress().words['ot-teach'].correct,2);
  const reloaded=await openApp(app.persisted());
  await reloaded.click('[data-view="difficult"]');
  assert.match(reloaded.$('.collection-row').textContent,/6 yanlış/);
});
test('deletion requires a second button, cancel preserves data, confirmation resets only personal data',async()=>{
  const app=await openApp({[PROGRESS_KEY]:JSON.stringify({version:1,words:{'ot-teach':{star:true,attempts:3,correct:1}}}),'another-site':'keep'});
  await app.click('#data-open');await app.click('#delete-data-open');
  assert.equal(app.progress().words['ot-teach'].star,true);
  await app.click('#cancel-delete');
  assert.equal(app.progress().words['ot-teach'].attempts,3);
  await app.click('#delete-data-open');await app.click('#confirm-delete');
  assert.equal(app.storage.get(PROGRESS_KEY),undefined);
  assert.equal(app.storage.get(PREFERENCE_KEY),undefined);
  assert.equal(app.storage.get(THEME_KEY),undefined);
  assert.equal(app.storage.get('another-site'),'keep');
  assert.equal(app.$('#difficult-count').textContent,'0');
  assert.equal(app.$('#favorite-count').textContent,'0');
  assert.equal(app.$('#storage-size').textContent,'0 KB / 10 MB');
  assert.equal(app.sets[0].words.length,70);
});
test('oversized imports retain existing browser progress instead of replacing it',async()=>{
  const app=await openApp({[PROGRESS_KEY]:JSON.stringify({version:1,words:{'ot-teach':{star:true}}})});
  const raw=JSON.stringify({version:1,words:{'ot-teach':{padding:'x'.repeat(6_000_000)}}});
  await app.$('#import').onchange({target:{files:[{size:raw.length,text:async()=>raw}],value:''}});
  assert.equal(app.progress().words['ot-teach'].star,true);
  assert.match(app.$('#status').textContent,/10 MB/);
});
