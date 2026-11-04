import{validateProgress}from './core.js';

// Personal data never leaves this browser. This database belongs only to this app.
export const MAX_PERSONAL_BYTES = 10*1024*1024;
export const PROGRESS_KEY = 'kelime-atolyesi-progress-v1';
export const PREFERENCE_KEY = 'ka-preferences-v2';
export const THEME_KEY = 'ka-theme';
export const DB_NAME = 'kelime-atolyesi-personal-v1';
export const OWNED_LOCAL_KEYS = [PROGRESS_KEY,PREFERENCE_KEY,THEME_KEY];
export const storagePayloadBytes = text => 2*String(text).length;
export function createProgressStore({indexedDB,localStorage,limit=MAX_PERSONAL_BYTES,onWarning=()=>{}}={}) {
  let database=null, mode='memory', cache={version:1,words:{}}, persisted=false;
  let queue=Promise.resolve();
  const readLocal = key => {try {return localStorage?.getItem(key) ?? null;} catch {return null;}};
  const extras = () => OWNED_LOCAL_KEYS.filter(key=>key!==PROGRESS_KEY || mode==='indexedDB')
    .reduce((sum,key)=>{const raw=readLocal(key);return sum+(raw===null?0:storagePayloadBytes(key+raw));},0);
  function encode(value) {
    validateProgress(value);
    const raw=JSON.stringify(value);
    if (storagePayloadBytes(raw)+extras()>limit) {
      const error=Error('Kişisel kayıt 10 MB sınırını aşıyor. Mevcut kaydın korundu.');
      error.code='APP_LIMIT';throw error;
    }
    return raw;
  }
  function openDatabase() {
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('records'))request.result.createObjectStore('records');};
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(Error('Kayıt veritabanı başka bir sekmede güncelleniyor.'));
      request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};
    });
  }
  function readDatabase() {
    return new Promise((resolve,reject)=>{
      const tx=database.transaction('records','readonly');
      const request=tx.objectStore('records').get('progress');
      let value;
      request.onsuccess=()=>{value=request.result;};
      tx.oncomplete=()=>resolve(value);
      tx.onerror=()=>reject(tx.error || request.error);
      tx.onabort=()=>reject(tx.error || Error('Kayıt okunamadı.'));
    });
  }
  function databaseUpdate(updater,remove=false) {
    return new Promise((resolve,reject)=>{
      const tx=database.transaction('records','readwrite'), store=tx.objectStore('records');
      let next, validationError;
      const request=store.get('progress');
      request.onsuccess=()=>{
        try {
          const previous=!remove && request.result ? validateProgress(JSON.parse(request.result)) : {version:1,words:{}};
          next=remove ? {version:1,words:{}} : updater(previous);
          if(remove)store.delete('progress');else store.put(encode(next),'progress');
        } catch(error) {validationError=error;tx.abort();}
      };
      tx.oncomplete=()=>{cache=next;persisted=!remove;resolve(next);};
      tx.onerror=()=>reject(validationError || tx.error || Error('Kayıt yazılamadı.'));
      tx.onabort=()=>reject(validationError || tx.error || Error('Kayıt işlemi tamamlanamadı.'));
    });
  }
  const ready=(async()=>{
    const legacy=readLocal(PROGRESS_KEY);
    if(indexedDB) {
      try {database=await openDatabase();mode='indexedDB';}
      catch {onWarning('Tarayıcı veritabanı açılamadı; daha sınırlı yerel kayıt kullanılacak.');}
    }
    if(database) {
      const stored=await readDatabase();
      if(stored) {cache=validateProgress(JSON.parse(stored));persisted=true;return cache;}
      if(legacy) {
        const migrated=validateProgress(JSON.parse(legacy));
        await databaseUpdate(()=>migrated);
        const verified=await readDatabase();
        if(verified!==JSON.stringify(migrated))throw Error('Eski kayıt taşınamadı; özgün kayıt korundu.');
        if(readLocal(PROGRESS_KEY)===legacy) {
          try {localStorage.removeItem(PROGRESS_KEY);} catch {}
        }
      }
      return cache;
    }
    try {
      const probe=localStorage?.getItem(PROGRESS_KEY);
      if(!localStorage)throw Error('Yerel kayıt yok');
      if(probe) {cache=validateProgress(JSON.parse(probe));persisted=true;}
      mode='localStorage';
    } catch {mode='memory';onWarning('Kalıcı kayıt kullanılamıyor. Bu oturumun sonunda verilerini dışa aktar.');}
    return cache;
  })().catch(error=>{onWarning('Eski kayıt okunamadı; özgün veri korundu. '+error.message);return cache;});
  function enqueue(operation) {
    const pending=queue.catch(()=>{}).then(()=>ready).then(operation);
    queue=pending;return pending;
  }
  return {
    ready,
    get mode(){return mode;},
    get usageBytes(){return (persisted?storagePayloadBytes(JSON.stringify(cache)):0)+extras();},
    get limitBytes(){return limit;},
    async read() {
      await ready;
      if(database) {const raw=await readDatabase();cache=raw?validateProgress(JSON.parse(raw)):{version:1,words:{}};persisted=!!raw;}
      else if(mode==='localStorage') {const raw=readLocal(PROGRESS_KEY);cache=raw?validateProgress(JSON.parse(raw)):{version:1,words:{}};persisted=!!raw;}
      return cache;
    },
    update(updater) {
      return enqueue(async()=>{
        if(database)return databaseUpdate(updater);
        const raw=mode==='localStorage'?readLocal(PROGRESS_KEY):null;
        const previous=raw?validateProgress(JSON.parse(raw)):cache;
        const next=updater(previous), encoded=encode(next);
        if(mode==='localStorage')localStorage.setItem(PROGRESS_KEY,encoded);
        cache=next;persisted=mode!=='memory';return next;
      });
    },
    clear() {
      return enqueue(async()=>{
        if(database)await databaseUpdate(null,true);
        for(const key of OWNED_LOCAL_KEYS)if(localStorage)localStorage.removeItem(key);
        if(!database && localStorage)mode='localStorage';
        cache={version:1,words:{}};persisted=false;return cache;
      });
    },
    close(){database?.close();}
  };
}
