import fs from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
export async function openApp(saved={},options={}) {
  const root = new URL('../../',import.meta.url);
  const html = fs.readFileSync(new URL('index.html',root),'utf8');
  const {window,document} = parseHTML(html);
  const storage = new Map(Object.entries(saved)), timers = new Map(), voices = [], downloads = [];
  let clock = 1000, timer = 0, focused = document.body;
  Object.defineProperty(document,'activeElement',{get:() => focused});
  window.HTMLElement.prototype.focus = function(){focused = this;};
  window.HTMLElement.prototype.scrollIntoView = function(){};
  const selectPrototype = window.HTMLSelectElement.prototype;
  if (!Object.getOwnPropertyDescriptor(selectPrototype,'value')?.set) Object.defineProperty(selectPrototype,'value',{
    configurable:true,
    get(){return this.querySelector('option[selected]')?.getAttribute('value') || this.querySelector('option')?.getAttribute('value') || '';},
    set(value){this.querySelectorAll('option').forEach(o => o.toggleAttribute('selected',o.getAttribute('value') === String(value)));}
  });
  window.SpeechSynthesisUtterance = class {constructor(text){this.text = text;}};
  window.speechSynthesis = {cancel(){},getVoices:() => [],speak:u => voices.push(u)};
  window.indexedDB=options.indexedDB;
  window.BroadcastChannel=undefined;
  const localStorage = {getItem:key => storage.get(key) ?? null,setItem:(key,value) => storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
  const context = vm.createContext({
    window,document,localStorage,console,Blob,URL:{createObjectURL:blob => {downloads.push(blob); return 'blob:test';},revokeObjectURL(){}},
    performance:{now:() => clock},setTimeout:() => ++timer,clearTimeout(){},
    setInterval:fn => {timers.set(++timer,fn);return timer;},clearInterval:id => timers.delete(id)
  });
  for (const tag of html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)) {
    const code = fs.readFileSync(new URL(tag[1],root),'utf8');
    if (/\bfetch\s*\(/.test(code)) throw Error('Direct-open runtime must not use fetch');
    vm.runInContext(code,context,{filename:tag[1]});
  }
  await window.KA_READY;
  const settle=async()=>{
    await Promise.resolve();
    for(let i=0;i<1000 && document.querySelector('#main').getAttribute('aria-busy')==='true';i++)await new Promise(setImmediate);
    await new Promise(setImmediate);
    if(document.querySelector('#main').getAttribute('aria-busy')==='true')throw Error('Storage operation did not settle');
  };
  return {document,window,storage,voices,downloads,timers,sets:window.KA_SETS,
    settle,
    $:s=>document.querySelector(s), $$:s=>[...document.querySelectorAll(s)],
    click:async s => {const el = document.querySelector(s); if(!el)throw Error('Missing control: '+s); el.click();await settle();},
    key:(key,target=document.body) => {const e = new window.Event('keydown',{bubbles:true,cancelable:true});e.key=key;target.dispatchEvent(e);return e;},
    advance:ms => {clock += ms; for (const fn of timers.values()) fn();},
    persisted:()=>Object.fromEntries(storage),
    progress:()=>JSON.parse(storage.get('kelime-atolyesi-progress-v1') || '{"version":1,"words":{}}'),
  };
}

