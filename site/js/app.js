import{shuffle,checkAnswer,schedule,validateProgress,normalize,getWordStats,difficultyScore}from './core.js';
import{createProgressStore,MAX_PERSONAL_BYTES,PROGRESS_KEY,PREFERENCE_KEY,THEME_KEY,storagePayloadBytes}from './storage.js';

// Runtime stays dependency-free. build_local.py produces classic scripts for file://.
const $ = selector => document.querySelector(selector);
const KEY = PROGRESS_KEY;
const PREF_KEY = PREFERENCE_KEY;
const defaults = {accent:'en-GB',slow:false,autoAudio:false,reverse:false,positions:{},lastSet:''};
let progress = {version:1,words:{}};
let preferences = {...defaults};
let sets = [], current = null, page = 'set', mode = 'cards', deck = [];
let index = 0, flipped = false, cardResults = new Map(), session = null, match = null;
let noticeTimer, matchTimer, listLimit = 12, activeTab = 'terms', menuOpen = false;
let restoreFocus = null;
let busyCount=1, dataEpoch=0, storageFailure='', difficultFilter='all';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => '<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const searchText = s => normalize(String(s)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
const state = w => progress.words[w.id] || {};
const due = w => !state(w).due || state(w).due <= Date.now();
const allWords = () => [...new Map(sets.flatMap(s => s.words).map(w => [w.id,w])).values()];
const getWord = id => allWords().find(w => w.id === id);
const owner = id => sets.find(s => s.words.some(w => w.id === id));
const modeInfo = [
  ['cards','cards','Kartlar','Çevir, hatırla, kendini değerlendir.'],
  ['learn','spark','Öğren','Anlamını tanı, İngilizcesini hatırla.'],
  ['write','pen','Yaz','Aklındaki kelimeyi yazıya dök.'],
  ['listen','headphones','Dinle','Kulağını İngilizceye alıştır.'],
  ['test','test','Test','Öğrendiklerini kısa bir testle ölç.'],
  ['match','match','Eşleştir','Doğru çiftleri en kısa sürede bul.'],
  ['review','repeat','Tekrar','Tekrar zamanı gelen kelimelere dön.']
];
const typeLabels = {verb:'fiil',noun:'isim',adjective:'sıfat',adverb:'zarf',preposition:'edat',pronoun:'zamir',conjunction:'bağlaç','plural noun':'çoğul isim','phrasal verb':'phrasal verb','noun phrase':'isim grubu','verb pattern':'fiil kalıbı',phrase:'kalıp',collocation:'eşdizim'};
function notify(message) {
  $('#status').textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { $('#status').textContent = ''; }, 4500);
}
try {
  const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
  preferences = {...defaults,...saved,positions:saved.positions && typeof saved.positions === 'object' ? saved.positions : {}};
  if (!['en-GB','en-US'].includes(preferences.accent)) preferences.accent = 'en-GB';
  if (localStorage.getItem('ka-theme') === 'dark') document.body.classList.add('dark');
} catch { preferences = {...defaults,positions:{}}; }
let browserDatabase, browserLocalStorage;
try {browserDatabase=window.indexedDB;} catch {}
try {browserLocalStorage=localStorage;} catch {}
const personalStore=createProgressStore({indexedDB:browserDatabase,localStorage:browserLocalStorage,onWarning:message=>{storageFailure=message;notify(message);}});
let broadcast;
try {if(window.BroadcastChannel)broadcast=new window.BroadcastChannel('kelime-atolyesi-personal');} catch {}
function updateBusy() {$('#main').setAttribute('aria-busy',String(busyCount>0));}
updateBusy();
async function mutateProgress(updater) {
  busyCount++;updateBusy();
  try {
    progress=await personalStore.update(updater);storageFailure='';
    broadcast?.postMessage({type:'updated'});return true;
  } catch(error) {
    storageFailure=error.code==='APP_LIMIT'?error.message:'Kayıt yazılamadı. Mevcut kaydın korundu; tarayıcı alanını kontrol et veya yedeğini indir.';
    notify(storageFailure);return false;
  } finally {busyCount--;updateBusy();renderDataSummary();}
}
function savePreferences() {
  try {
    const raw=JSON.stringify(preferences), old=localStorage.getItem(PREF_KEY);
    if(personalStore.usageBytes-(old?storagePayloadBytes(PREF_KEY+old):0)+storagePayloadBytes(PREF_KEY+raw)>MAX_PERSONAL_BYTES)throw Error('Ayarlar 10 MB kayıt sınırını aşıyor.');
    localStorage.setItem(PREF_KEY,raw);
  } catch(error) {notify(error.message || 'Ayarlar kaydedilemedi.');}
}
function cancelSpeech() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
function speak(text,lang) {
  if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
    notify('Bu tarayıcı sesli okumayı desteklemiyor.'); return;
  }
  cancelSpeech();
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = lang || preferences.accent;
  utterance.rate = preferences.slow ? 0.7 : 0.9;
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.toLowerCase() === utterance.lang.toLowerCase());
  if (voice) utterance.voice = voice;
  utterance.onerror = e => { if (!['canceled','interrupted'].includes(e.error)) notify('Ses oynatılamadı. Cihazındaki İngilizce sesleri kontrol edebilirsin.'); };
  window.speechSynthesis.speak(utterance);
}
async function record(w,correct) {
  const saved=await mutateProgress(old=>({version:1,words:{...old.words,[w.id]:schedule(old.words[w.id] || {},correct)}}));
  renderSidebar();
  renderAside();
  renderWords();
  return saved;
}
async function toggleStar(id) {
  const w = getWord(id);
  if (!w) return;
  await mutateProgress(old=>({version:1,words:{...old.words,[id]:{...old.words[id],star:!old.words[id]?.star}}}));
  renderSidebar();
  if (page === 'set') {
    renderAside(); renderWords();
    const button = $('#card-star');
    if (button && deck[index]?.id === id) {
      button.classList.toggle('starred',!!state(w).star);
      button.setAttribute('aria-pressed',String(!!state(w).star));
      button.setAttribute('aria-label',state(w).star ? 'Favorilerden çıkar' : 'Favorilere ekle');
    }
  } else if (page === 'favorites' || page === 'difficult') renderCollection(page);
}
function wordMeta(w) {
  return [w.ipa,typeLabels[w.partOfSpeech] || w.partOfSpeech,w.level && w.level !== 'unknown' ? w.level : ''].filter(Boolean).join(' · ');
}
function starredButton(w,extra='') {
  return '<button class="icon-button '+(state(w).star ? 'starred ' : '')+extra+'" data-star="'+esc(w.id)+'" aria-pressed="'+!!state(w).star+'" aria-label="'+esc(w.term)+(state(w).star ? ' favorilerden çıkar' : ' favorilere ekle')+'">'+icon('star')+'</button>';
}
function empty(title,text,action='') {
  return '<div class="empty">'+icon('cards')+'<strong>'+esc(title)+'</strong><p>'+esc(text)+'</p>'+action+'</div>';
}
function renderSidebar() {
  const all = allWords();
  $('#favorite-count').textContent = all.filter(w => state(w).star).length;
  $('#due-count').textContent = all.filter(due).length;
  $('#difficult-count').textContent = all.filter(w=>getWordStats(state(w)).wrong>0).length;
  $('#main-nav').querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === page;
    button.classList.toggle('active',active);
    if (active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
  const folders = [...new Set(sets.map(s => s.folder))];
  $('#folders').innerHTML = folders.map(folder => '<div class="folder-group"><div class="folder-heading">'+icon('folder')+esc(folder.replace('Kitaplar · ',''))+'</div><div class="folder-children">'+sets.filter(s => s.folder === folder).map(s => '<button data-open-set="'+esc(s.id)+'" class="'+(page === 'set' && current?.id === s.id ? 'active' : '')+'" '+(page === 'set' && current?.id === s.id ? 'aria-current="page"' : '')+'>'+icon(s.id.includes('phrases') ? 'note' : 'cards')+'<span>'+esc(s.title.includes(' · ') ? s.title.split(' · ').slice(1).join(' · ') : s.title)+'</span><small>'+s.words.length+'</small></button>').join('')+'</div></div>').join('');
}
function clearTimer() { clearInterval(matchTimer); matchTimer = undefined; }
function closeSearch() { $('#search-results').hidden = true; }
function closeMenu() {
  menuOpen = false;
  document.body.classList.remove('menu-open');
  $('#menu-scrim').hidden = true;
  $('#menu-toggle').setAttribute('aria-expanded','false');
}
function showPage(next) {
  clearTimer(); cancelSpeech(); closeMenu(); closeSearch();
  page = next;
  $('#set-view').hidden = next !== 'set';
  $('#library-view').hidden = next === 'set';
  if (next !== 'set') setFocus(false);
  renderSidebar();
}
function statsFor(words) {
  const known = words.filter(w => state(w).streak >= 3).length;
  const learning = words.filter(w => (state(w).attempts || 0) > 0 && (state(w).streak || 0) < 3).length;
  return {known,learning,newWords:words.length-known-learning,percent:words.length ? Math.round(known/words.length*100) : 0};
}
function renderLibrary() {
  showPage('library');
  const words = allWords(), stats = statsFor(words);
  const resume = sets.find(s => s.id === preferences.lastSet) || sets[0];
  const example = resume?.words.find(w => (state(w).streak || 0) < 3) || resume?.words[0];
  $('#library-view').innerHTML = '<section class="library-header"><div class="eyebrow">SANA AİT BİR ÖĞRENME ALANI</div><h1>Kütüphanem</h1><p>Kelimelerin bir arada. Bir sonraki adımın hazır.</p></section>'+
    (resume ? '<section class="library-hero"><div class="library-hero-copy"><div class="eyebrow">'+icon('spark')+' KALDIĞIN YERDEN DEVAM ET</div><h2>Bir kelime daha,<br>bir adım ileri.</h2><p>'+esc(resume.title)+' setinle kısa bir tekrar yap.</p><button class="button button-primary" data-open-set="'+esc(resume.id)+'">Çalışmaya devam et '+icon('arrow')+'</button></div><div class="hero-stack" aria-hidden="true"><div class="hero-card"></div><div class="hero-card second"></div><div class="hero-card front"><small>İNGİLİZCE</small><strong>'+esc(example?.term || '')+'</strong><span>'+esc(example?.meaning || '')+'</span></div></div></section>' : '')+
    '<div class="overview-stats">'+[[words.length,'Kütüphanendeki terim','cards'],[stats.known,'Öğrendiğin terim','check'],[words.filter(w => state(w).star).length,'Favori terimin','star']].map(([count,label,name]) => '<div class="overview-stat"><span class="stat-icon">'+icon(name)+'</span><div><strong>'+count+'</strong><small>'+label+'</small></div></div>').join('')+'</div>'+
    '<div class="section-heading"><h2>Çalışma setlerin</h2><span>'+sets.length+' set</span></div><section class="set-grid" aria-label="Çalışma setleri">'+sets.map((s,i) => {
      const stat = statsFor(s.words);
      return '<button class="set-tile" data-open-set="'+esc(s.id)+'"><span class="set-tile-icon">'+icon(i === 1 ? 'note' : 'book')+'</span><h3>'+esc(s.title)+'</h3><span class="pill">'+s.words.length+' terim · İngilizce → Türkçe</span><div class="set-tile-foot"><span>'+stat.known+' / '+s.words.length+' öğrenildi</span>'+icon('arrow')+'</div><div class="progress-track"><span style="width:'+stat.percent+'%"></span></div></button>';
    }).join('')+'</section>';
}
function difficultWords() {
  return allWords().filter(w=>{
    const stats=getWordStats(state(w));
    return stats.wrong>0 && (difficultFilter==='repeated'?stats.wrong>=2:difficultFilter==='last-wrong'?state(w).lastResult===false:true);
  }).sort((a,b)=>difficultyScore(state(b))-difficultyScore(state(a)) || getWordStats(state(b)).wrong-getWordStats(state(a)).wrong || a.term.localeCompare(b.term));
}
function performanceLine(w) {
  const stats=getWordStats(state(w));
  if(!stats.attempts)return '<p class="word-performance muted">Henüz değerlendirilmedi</p>';
  return '<div class="word-performance"><span class="performance-correct">'+stats.correct+' doğru</span><span class="performance-wrong">'+stats.wrong+' yanlış</span><span>'+stats.attempts+' deneme</span></div>';
}
function renderCollection(type) {
  showPage(type);
  const favorite=type==='favorites', difficult=type==='difficult';
  const words=difficult?difficultWords():allWords().filter(favorite?w=>state(w).star:due);
  const title=difficult?'Zorlandıklarım':favorite?'Favorilerim':'Tekrar zamanı';
  $('#library-view').innerHTML='<section class="library-header"><h1>'+title+'</h1><p>'+words.length+' terim · bu tarayıcıdaki kaydından</p></section>'+
    (difficult?'<div class="difficulty-tools"><p>Yanlış sayısı, hata oranı ve art arda yanlışlarına göre sıralanır. Yeni doğruların test önceliğini azaltır.</p><label for="difficulty-filter">Göster <select id="difficulty-filter"><option value="all">Yanlış yaptığım tüm kelimeler</option><option value="repeated">En az 2 kez yanlış yaptıklarım</option><option value="last-wrong">Son cevabım yanlış olanlar</option></select></label></div>':'')+
    (words.length?'<div class="collection-start"><p>'+(difficult?'Bu kelimelerden sana özel, çoktan seçmeli bir test hazır.':favorite?'Yıldızladığın kelimeler, tek bir yerde.':'Yeni terimler ve tekrar zamanı gelenler burada.')+'</p><button class="button button-primary" data-action="study-collection" data-kind="'+type+'">'+icon(difficult?'test':favorite?'cards':'repeat')+' '+(difficult?'Zorlandıklarımdan test yap':favorite?'Favorileri çalış':'Tekrara başla')+'</button></div><div class="collection-list">'+words.map(w=>'<article class="collection-row"><div><strong>'+esc(w.term)+'</strong><small>'+esc(owner(w.id)?.title || '')+'</small>'+performanceLine(w)+'</div><span class="meaning">'+esc(w.meaning)+'</span><button class="icon-button" data-speak="'+esc(w.id)+'" aria-label="'+esc(w.term)+' telaffuzunu dinle">'+icon('sound')+'</button>'+starredButton(w)+'</article>').join('')+'</div>':
      empty(difficult?'Bu filtrede yanlış kaydın yok':favorite?'Henüz favori kelimen yok':'Şimdilik tüm tekrarlar tamam',difficult?'Çalıştıkça yanlışların burada görünecek. İstersen filtreyi de değiştirebilirsin.':'Bir sete dönerek çalışmaya devam edebilirsin.','<button class="button button-primary" data-view="library">Kütüphaneme dön '+icon('arrow')+'</button>'));
  if(difficult) {
    $('#difficulty-filter').value=difficultFilter;
    $('#difficulty-filter').onchange=e=>{difficultFilter=e.target.value;renderCollection('difficult');};
  }
}
function startCollection(type) {
  const difficult=type==='difficult';
  const words=difficult?difficultWords():allWords().filter(type==='favorites'?w=>state(w).star:due);
  if(!words.length)return renderCollection(type);
  current={id:'collection-'+type,title:difficult?'Zorlandıklarım':type==='favorites'?'Favorilerim':'Tekrar zamanı',folder:'Koleksiyon',words,studyNotes:[],
    description:difficult?'Yanlış sayısı ve hata oranına göre seçilen kişisel çalışma testi. Yalnız çoktan seçmeli sorular içerir.':'Tüm setlerindeki '+(type==='favorites'?'favori terimlerin.':'yeni ve tekrar zamanı gelen terimlerin.')};
  openCurrent(difficult?'test':type==='due'?'review':'cards',false);
}

function selectSet(id,wordId) {
  const next = sets.find(s => s.id === id);
  if (!next) return;
  current = next;
  preferences.lastSet = id;
  savePreferences();
  openCurrent('cards',true);
  if (wordId) {
    const found = deck.findIndex(w => w.id === wordId);
    if (found >= 0) {index = found; flipped = false; renderCard(); savePosition();}
  }
}
function openCurrent(nextMode,restorePosition) {
  showPage('set');
  const parts = current.title.split(' · ');
  $('#set-title').innerHTML = esc(parts[0])+(parts.length > 1 ? '<span class="title-type"> · '+esc(parts.slice(1).join(' · '))+'</span>' : '');
  $('#breadcrumb-set').textContent = current.title;
  $('#set-eyebrow').innerHTML = icon('book')+' '+(current.id.startsWith('collection-') ? 'KİŞİSEL KOLEKSİYONUN' : current.id === 'demo' ? 'DENEMEN İÇİN HAZIRLANDI' : 'KİTAPLIĞINDAN BİR SET');
  $('#set-meta').innerHTML = '<span class="pill">'+current.words.length+' terim</span><span>İngilizce → Türkçe</span><span class="meta-divider"></span><span class="meta-author"><span class="mini-avatar">M</span>Senin kütüphanenden</span>';
  $('#description').textContent = current.description;
  $('#study-filter').value = 'all';
  $('#word-search').value = '';
  $('#only-stars').checked = false;
  listLimit = 12;
  renderAside(); renderStudyNotes(); showTab('terms'); renderWords();
  startMode(nextMode,restorePosition);
}
function renderAside() {
  if (!current) return;
  const stat = statsFor(current.words), dueCount = current.words.filter(due).length;
  $('#study-sidebar').innerHTML = '<section class="progress-panel"><div class="panel-title">Set ilerlemen '+icon('chart')+'</div><div class="progress-heading"><strong>'+stat.percent+'%</strong><span>öğrenildi</span></div><div class="progress-track" role="progressbar" aria-label="Öğrenilen terimler" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+stat.percent+'"><span style="width:'+stat.percent+'%"></span></div>'+[[stat.known,'Öğrenilen','known'],[stat.learning,'Çalışmaya devam','learning'],[stat.newWords,'Henüz çalışılmadı','']].map(([n,label,cls]) => '<div class="progress-line"><span class="status-dot '+cls+'"></span>'+label+'<strong>'+n+'</strong></div>').join('')+'<button class="button button-soft" data-action="mode" data-mode="review">'+icon('repeat')+' Hızlı tekrar '+icon('arrow')+'</button></section>'+
    '<section class="mini-panel"><div class="mini-panel-header">'+icon('clock')+' Tekrarla, hatırla.</div><p>'+(dueCount ? dueCount+' terim çalışmanı bekliyor. Kısa bir tekrarla başla.' : 'Bu setin tekrarları tamam. Biraz dinlenip geri gelebilirsin.')+'</p><button data-action="mode" data-mode="review">Tekrara geç '+icon('arrow')+'</button></section>'+
    '<section class="mini-panel"><div class="mini-panel-header">'+icon('note')+' Kelimenin ötesinde</div><p>Örnek cümleler ve okuma notlarıyla bağlamı da hatırla.</p><button data-action="show-notes">Notları incele '+icon('arrow')+'</button></section>';
}
function studyDeck() {
  const filter = $('#study-filter').value;
  return (current?.words || []).filter(w => filter === 'stars' ? !!state(w).star : filter === 'due' ? due(w) : true);
}
function renderModes() {
  $('#modes').innerHTML = modeInfo.map(([id,name,label]) => '<button data-action="mode" data-mode="'+id+'" class="'+(id === mode ? 'active' : '')+'" aria-pressed="'+(id === mode)+'">'+icon(name)+label+'</button>').join('');
  const info = modeInfo.find(m => m[0] === mode);
  $('#mode-heading').innerHTML = icon(info[1])+' '+info[2]+' <span class="sr-only">'+info[3]+'</span>';
  $('#keyboard-hint').hidden = mode !== 'cards';
}
function startMode(next,restorePosition=false) {
  clearTimer(); cancelSpeech();
  mode = next; index = 0; flipped = false; cardResults = new Map(); session = null; match = null;
  deck = studyDeck();
  if (mode === 'review') deck = deck.filter(due);
  if (restorePosition && mode === 'cards') {
    const position = Number(preferences.positions[current.id]);
    if (Number.isInteger(position) && position >= 0 && position < deck.length) index = position;
  }
  renderModes();
  if (!deck.length) {
    $('#workspace').innerHTML = empty(mode === 'review' ? 'Tekrarların tamamlandı' : 'Bu filtrede terim yok',mode === 'review' ? 'Yeni tekrar zamanı geldiğinde terimlerin burada olacak.' : 'Tüm terimler filtresine geçebilir veya yıldızlayarak favoriler ekleyebilirsin.','<button class="button button-outline" data-action="reset-filter">Tüm terimleri göster</button>');
    return;
  }
  if (mode === 'cards') renderCard();
  else if (mode === 'match') renderMatch();
  else if (mode === 'test') renderTestSetup();
  else beginQuiz();
}
function savePosition() {
  if (current && !current.id.startsWith('collection-') && $('#study-filter').value === 'all') {
    preferences.positions[current.id] = index;
    savePreferences();
  }
}
function renderCard() {
  const w = deck[index];
  const reverse = !!preferences.reverse;
  const showMeaning = reverse ? !flipped : flipped;
  const answered = cardResults.has(w.id);
  $('#workspace').innerHTML = '<div class="flashcard '+(flipped ? 'flipped' : '')+'"><div class="card-top"><span class="card-language">'+(showMeaning ? 'TÜRKÇE' : 'İNGİLİZCE')+' '+icon('arrow')+' '+(showMeaning ? 'İNGİLİZCE' : 'TÜRKÇE')+'</span><div class="card-top-actions"><button id="card-star" class="icon-button '+(state(w).star ? 'starred' : '')+'" data-star="'+esc(w.id)+'" aria-label="'+(state(w).star ? 'Favorilerden çıkar' : 'Favorilere ekle')+'" aria-pressed="'+!!state(w).star+'">'+icon('star')+'</button><button class="icon-button" data-speak="'+esc(w.id)+'" aria-label="İngilizce telaffuzu dinle" title="Telaffuzu dinle">'+icon('sound')+'</button></div></div>'+
    '<button id="flip" class="flip-area" data-action="flip" aria-label="Kartı çevir" aria-pressed="'+flipped+'"><span class="term '+(showMeaning ? 'is-meaning' : '')+'" lang="'+(showMeaning ? 'tr' : 'en')+'">'+esc(showMeaning ? w.meaning : w.term)+'</span>'+
    (!flipped ? '<span class="term-tag">'+esc(typeLabels[w.partOfSpeech] || w.partOfSpeech)+'</span>' : (w.ipa ? '<span class="pronunciation">'+esc(w.ipa)+'</span>' : '')+(w.examples[0] ? '<span class="card-example" lang="en">'+esc(w.examples[0].en)+'</span><span class="card-translation">'+esc(w.examples[0].tr)+'</span>' : ''))+'</button>'+
    '<div class="flip-caption">'+icon('flip')+' '+(flipped ? 'Diğer yüzü görmek için dokun' : reverse ? 'İngilizcesini görmek için karta dokun' : 'Anlamını görmek için karta dokun')+'</div><div class="card-progress"><span style="width:'+Math.round((index+1)/deck.length*100)+'%"></span></div></div>'+
    '<div class="card-controls"><div class="card-tools"><button class="icon-button" data-action="shuffle" aria-label="Kartları karıştır" title="Karıştır">'+icon('shuffle')+'</button></div><div class="card-navigation"><button class="icon-button" id="prev" data-action="previous" aria-label="Önceki kart" '+(index === 0 ? 'disabled' : '')+'>'+icon('left')+'</button><span class="card-counter">'+(index+1)+' <span>/ '+deck.length+'</span></span><button class="icon-button" id="next" data-action="next" aria-label="Sonraki kart" '+(index === deck.length-1 ? 'disabled' : '')+'>'+icon('chevron')+'</button></div><div class="card-tools"><button class="icon-button" data-action="reverse" aria-label="Kart dil yönünü değiştir" title="Dil yönünü değiştir">'+icon('swap')+'</button></div></div>'+
    '<div class="grading"><button id="again" class="grade-button grade-again" data-action="grade-again" '+(!flipped || answered ? 'disabled' : '')+'>'+icon('repeat')+' '+(answered ? 'Bu turda kaydedildi' : 'Tekrar et')+'</button><button id="known" class="grade-button grade-known" data-action="grade-known" '+(!flipped || answered ? 'disabled' : '')+'>'+icon('check')+' Biliyorum</button></div>'+performanceLine(w);
}
function moveCard(delta) {
  const next = index + delta;
  if (mode !== 'cards' || next < 0 || next >= deck.length) return;
  index = next; flipped = false; renderCard(); savePosition();
  if (preferences.autoAudio) speak(deck[index].term);
}
async function gradeCard(correct) {
  if (mode !== 'cards' || !flipped || !deck[index]) return;
  const w = deck[index];
  if (cardResults.has(w.id)) return;
  const epoch=dataEpoch;
  cardResults.set(w.id,correct); await record(w,correct);
  if(epoch!==dataEpoch)return;
  if (index < deck.length-1) moveCard(1);
  else {
    session = {items:deck.filter(item => cardResults.has(item.id)),correct:[...cardResults.values()].filter(Boolean).length,wrong:deck.filter(item => cardResults.get(item.id) === false),kind:'cards'};
    preferences.positions[current.id] = 0; savePreferences();
    renderResult();
  }
}
function renderTestSetup() {
  const counts = [...new Set([Math.min(10,deck.length),Math.min(20,deck.length),deck.length])];
  $('#workspace').innerHTML = '<div class="test-setup"><span class="mode-emblem">'+icon('test')+'</span><h2>Kendini denemeye hazır mısın?</h2><p>Çoktan seçmeli sorularla bu sette öğrendiklerini gözden geçir.</p><label>Soru sayısı <select id="test-count">'+counts.map(n => '<option value="'+n+'">'+n+' soru'+(n === deck.length ? ' · tümü' : '')+'</option>').join('')+'</select></label><button class="button button-primary" data-action="begin-test">Teste başla '+icon('arrow')+'</button></div>';
}
function beginQuiz(items) {
  const count = mode === 'test' ? Number($('#test-count')?.value || 10) : deck.length;
  const selected=items || (current.id==='collection-difficult'?deck.slice(0,count):deck);
  session = {items:shuffle(selected).slice(0,items ? items.length : count),pos:0,correct:0,wrong:[],answered:false,kind:'quiz'};
  renderQuestion();
}
function answerChoices(w) {
  const candidates=new Map();
  for(const candidate of [...(owner(w.id)?.words || current.words),...allWords()]) {
    const key=normalize(candidate.term);
    if(key!==normalize(w.term) && !candidates.has(key))candidates.set(key,candidate);
  }
  return shuffle([w,...shuffle([...candidates.values()]).slice(0,3)]);
}
function renderQuestion() {
  if (session.pos >= session.items.length) { renderResult(); return; }
  const w = session.items[session.pos];
  session.answered = false;
  session.type = mode === 'listen' ? 'listen' : mode === 'write' || mode === 'review' ? 'write' : mode === 'test' ? 'choice' : state(w).streak >= 2 ? 'write' : 'choice';
  const choices = session.type === 'choice' ? answerChoices(w) : [];
  session.choices = choices;
  $('#workspace').innerHTML = '<div class="question-card"><div class="question-meta"><span>'+ (session.pos+1)+' / '+session.items.length+' soru</span><strong>'+session.correct+' doğru</strong></div><p class="question-label">'+(session.type === 'listen' ? 'DİNLE VE İNGİLİZCESİNİ YAZ' : 'İNGİLİZCE KARŞILIĞINI '+(session.type === 'choice' ? 'SEÇ' : 'YAZ'))+'</p><div class="question">'+(session.type === 'listen' ? '<button class="listen-button" data-speak="'+esc(w.id)+'">'+icon('sound')+' Kelimeyi dinle</button>' : esc(w.meaning))+'</div>'+
    (session.type === 'choice' ? '<div class="options">'+choices.map((choice,i) => '<button class="answer-option" data-answer="'+i+'"><span class="option-letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(choice.term)+'</span></button>').join('')+'</div>' :
    '<form class="answer-form" id="answer-form"><input id="answer" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="İngilizce cevabın" placeholder="İngilizcesini yaz…"><button class="button button-primary" type="submit">Kontrol et</button></form>')+
    '<div id="feedback" class="answer-feedback" role="status" hidden></div><div class="question-bottom"><button class="text-button" id="skip-question" data-action="skip">Bilmiyorum</button><button id="continue" class="button button-primary" data-action="continue" hidden>Devam '+icon('arrow')+'</button></div></div><div class="progress-track quiz-progress"><span style="width:'+Math.round(session.pos/session.items.length*100)+'%"></span></div>';
  const form = $('#answer-form');
  if (form) form.onsubmit = async event => {
    event.preventDefault();
    if (!$('#answer').value.trim()) return;
    await answerQuiz(checkAnswer(w,$('#answer').value));
  };
}
async function answerQuiz(correct,selectedIndex) {
  if (!session || session.answered || session.pos >= session.items.length) return;
  session.answered = true;
  const w = session.items[session.pos];
  if (correct) session.correct++; else session.wrong.push(w);
  const epoch=dataEpoch;
  await record(w,correct);
  if(epoch!==dataEpoch)return;
  $('#workspace').querySelectorAll('[data-answer]').forEach(button => {
    const candidate = session.choices[Number(button.dataset.answer)];
    button.disabled = true;
    if (candidate.id === w.id) button.classList.add('correct');
    else if (Number(button.dataset.answer) === selectedIndex) button.classList.add('incorrect');
  });
  $('#workspace').querySelectorAll('#answer-form input,#answer-form button').forEach(el => {el.disabled = true;});
  $('#feedback').hidden = false;
  $('#feedback').className = 'answer-feedback '+(correct ? 'good' : 'bad');
  $('#feedback').innerHTML = '<strong>'+(correct ? 'Doğru, '+esc(w.term)+'!' : 'Doğru cevap: '+esc(w.term))+'</strong><p>'+esc(w.meaning)+'</p>'+(w.examples[0] ? '<p lang="en">'+esc(w.examples[0].en)+'</p>' : '');
  $('#skip-question').hidden = true;
  $('#continue').hidden = false;
  $('#continue').focus({preventScroll:true});
}
function renderResult() {
  const count = session.items.length, percent = count ? Math.round(session.correct/count*100) : 0;
  $('#workspace').innerHTML = '<div class="result">'+icon('trophy')+'<h2>Bu tur tamamlandı!</h2><div class="result-score">'+session.correct+' <span class="muted">/ '+count+'</span></div><p>'+count+' terimi değerlendirdin · %'+percent+' doğru</p><div class="result-actions"><button class="button button-primary" data-action="restart">Bir tur daha '+icon('repeat')+'</button>'+(session.wrong.length ? '<button class="button button-outline" data-action="retry-wrong">Yanlışları çalış ('+session.wrong.length+')</button>' : '')+'</div></div>';
}
function renderMatch() {
  clearTimer();
  const selected = shuffle(deck).slice(0,6);
  match = {tiles:shuffle(selected.flatMap(w => [{id:w.id,side:'term',text:w.term},{id:w.id,side:'meaning',text:w.meaning}])),selected:null,done:new Set(),startedAt:null,penalty:0,finished:false};
  $('#workspace').innerHTML = '<div class="match-header"><span class="match-time">'+icon('clock')+' <span id="match-time">0.0</span><small class="hint">sn</small></span><button class="button button-outline" data-action="new-match">'+icon('repeat')+' Yeni oyun</button></div><div class="match-grid">'+match.tiles.map((tile,i) => '<button class="match-tile" data-tile="'+i+'" aria-pressed="false">'+esc(tile.text)+'</button>').join('')+'</div><div class="match-status" id="match-status" role="status">Süre ilk seçimde başlar. Yanlış eşleştirme +1 saniye.</div>';
}
function updateMatchTime() {
  if (!match || match.startedAt === null || match.finished) return;
  $('#match-time').textContent = ((performance.now()-match.startedAt)/1000+match.penalty).toFixed(1);
}
function chooseTile(i) {
  if (!match || match.finished) return;
  const tile = match.tiles[i], button = $('#workspace').querySelector('[data-tile="'+i+'"]');
  if (!tile || match.done.has(tile.id) || match.selected === i) return;
  if (match.startedAt === null) {
    match.startedAt = performance.now();
    matchTimer = setInterval(updateMatchTime,100);
  }
  $('#workspace').querySelectorAll('.wrong').forEach(el => el.classList.remove('wrong'));
  if (match.selected === null) {
    match.selected = i; button.classList.add('selected'); button.setAttribute('aria-pressed','true'); return;
  }
  const previous = match.tiles[match.selected];
  const previousButton = $('#workspace').querySelector('[data-tile="'+match.selected+'"]');
  previousButton.classList.remove('selected'); previousButton.setAttribute('aria-pressed','false');
  if (previous.id === tile.id && previous.side !== tile.side) {
    match.done.add(tile.id);
    $('#workspace').querySelectorAll('[data-tile]').forEach(el => {
      if (match.tiles[Number(el.dataset.tile)].id === tile.id) {
        el.classList.add('matched'); el.disabled = true;
      }
    });
    $('#match-status').textContent = 'Eşleşti! '+match.done.size+' / '+match.tiles.length/2+' çift';
    if (match.done.size === match.tiles.length/2) {
      updateMatchTime(); match.finished = true; clearTimer();
      $('#match-status').textContent = 'Tüm çiftler eşleşti. Süren: '+$('#match-time').textContent+' saniye.';
    }
  } else {
    match.penalty++; button.classList.add('wrong'); previousButton.classList.add('wrong');
    $('#match-status').textContent = 'Bu iki terim eşleşmiyor. Sürene 1 saniye eklendi.';
    updateMatchTime();
  }
  match.selected = null;
}
function renderWords() {
  if (!current) return;
  const q = searchText($('#word-search').value);
  const words = current.words.filter(w => (!$('#only-stars').checked || state(w).star) && (!q || searchText(w.term+' '+w.meaning+' '+(w.sourceForms || []).join(' ')).includes(q)));
  $('#term-count').textContent = current.words.length;
  $('#words').innerHTML = words.length ? words.slice(0,listLimit).map((w,i) => '<article class="word-row"><span class="word-number">'+String(i+1).padStart(2,'0')+'</span><div class="word-term"><strong lang="en">'+esc(w.term)+'</strong><small>'+esc(wordMeta(w))+'</small></div><div class="word-meaning">'+esc(w.meaning)+(w.examples[0] ? '<p class="word-example" lang="en">'+esc(w.examples[0].en)+'</p>' : '')+performanceLine(w)+((w.notes || w.sourceForms?.length) ? '<details class="word-notes"><summary>Kullanım notu</summary>'+(w.sourceForms?.length ? '<p>Okurken karşılaştığın biçim: '+esc(w.sourceForms.join(', '))+'</p>' : '')+(w.notes ? '<p>'+esc(w.notes)+'</p>' : '')+'<p>Örnek cümle çalışma amacıyla oluşturuldu; kitap alıntısı olarak doğrulanmadı.</p></details>' : '')+'</div><div class="word-row-actions">'+starredButton(w)+'<button class="icon-button" data-speak="'+esc(w.id)+'" aria-label="'+esc(w.term)+' telaffuzunu dinle">'+icon('sound')+'</button></div></article>').join('') : empty('Eşleşen terim yok','Aramanı değiştirebilir veya favori filtresini kaldırabilirsin.');
  $('#more-words').hidden = words.length <= listLimit;
}
function renderStudyNotes() {
  const notes = current?.studyNotes || [];
  $('#note-count').textContent = notes.length;
  $('#study-notes').innerHTML = notes.length ? notes.map(note => '<details class="reading-note"><summary>'+esc(note.title)+'</summary>'+(note.original ? '<p class="note-original">Kaynak kaydı: '+esc(note.original)+'</p>' : '')+'<p>'+esc(note.text)+'</p>'+(note.en ? '<p lang="en">'+esc(note.en)+'</p>' : '')+(note.tr ? '<p>'+esc(note.tr)+'</p>' : '')+'</details>').join('') : empty('Bu sette okuma notu yok','Örnek cümleleri terim listesinden inceleyebilirsin.');
}
function showTab(tab,focus=false) {
  activeTab = tab;
  for (const id of ['terms','notes']) {
    const button = $('#'+id+'-tab'), selected = tab === id;
    button.setAttribute('aria-selected',String(selected)); button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  }
  $('#terms-panel').hidden = tab !== 'terms';
  $('#study-notes').hidden = tab !== 'notes';
}
function setFocus(enabled) {
  document.body.classList.toggle('focus-mode',enabled);
  $('#focus').setAttribute('aria-pressed',String(enabled));
  $('#focus').innerHTML = icon(enabled ? 'close' : 'expand')+'<span>'+(enabled ? 'Odaktan çık' : 'Odak modu')+'</span>';
}
function openDialog(id,trigger) {
  const dialog = $('#'+id);
  restoreFocus = trigger || document.activeElement;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
}
function closeDialog(dialog) {
  if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
  restoreFocus?.focus?.({preventScroll:true});
}
function renderSearch() {
  const q = searchText($('#global-search').value), target = $('#search-results');
  if (!q) { closeSearch(); return; }
  const foundSets = sets.filter(s => searchText(s.title).includes(q));
  const words = allWords().filter(w => searchText(w.term+' '+w.meaning+' '+(w.sourceForms || []).join(' ')).includes(q)).slice(0,7);
  target.innerHTML = foundSets.map(s => '<button class="search-result" data-open-set="'+esc(s.id)+'">'+icon('folder')+'<span><strong>'+esc(s.title)+'</strong><small>'+s.words.length+' terim</small></span></button>').join('')+
    words.map(w => '<button class="search-result" data-open-set="'+esc(owner(w.id).id)+'" data-open-word="'+esc(w.id)+'">'+icon('cards')+'<span><strong>'+esc(w.term)+' · '+esc(w.meaning)+'</strong><small>'+esc(owner(w.id).title)+'</small></span></button>').join('');
  if (!foundSets.length && !words.length) target.innerHTML = '<p class="no-result">Bu aramada bir set veya kelime bulunamadı.</p>';
  target.hidden = false;
}

function renderDataSummary() {
  const values=Object.values(progress.words), totals=values.reduce((sum,value)=>{
    const stat=getWordStats(value);sum.correct+=stat.correct;sum.wrong+=stat.wrong;sum.attempts+=stat.attempts;return sum;
  },{correct:0,wrong:0,attempts:0});
  $('#personal-summary').innerHTML=[[values.filter(v=>v.star).length,'Favori'],[totals.attempts,'Değerlendirme'],[totals.correct,'Doğru'],[totals.wrong,'Yanlış']].map(([count,label])=>'<div><strong>'+count.toLocaleString('tr-TR')+'</strong><span>'+label+'</span></div>').join('');
  const bytes=personalStore.usageBytes;
  const value=bytes<1024*1024?(bytes/1024).toLocaleString('tr-TR',{maximumFractionDigits:1})+' KB':(bytes/1024/1024).toLocaleString('tr-TR',{maximumFractionDigits:2})+' MB';
  $('#storage-size').textContent=value+' / 10 MB';
  $('#storage-state').textContent=storageFailure || (personalStore.mode==='memory'?'Kalıcı kayıt kullanılamıyor; bu oturumun verilerini dışa aktar.':'Kişisel kaydın yalnız bu tarayıcıda saklanıyor.');
  $('#storage-state').classList.toggle('storage-warning',!!storageFailure || personalStore.mode==='memory');
}
function resetLocalView() {
  progress={version:1,words:{}};
  preferences={...defaults,positions:{}};
  current=null;deck=[];session=null;match=null;cardResults=new Map();index=0;flipped=false;difficultFilter='all';
  clearTimer();cancelSpeech();storageFailure='';
  document.body.classList.remove('dark');
  $('#accent').value=preferences.accent;$('#slow').checked=false;$('#auto-audio').checked=false;
  $('#global-search').value='';$('#workspace').innerHTML='';$('#words').innerHTML='';
  updateTheme();renderLibrary();renderDataSummary();
}
async function deletePersonalData() {
  if(busyCount>0)return;
  dataEpoch++;busyCount++;updateBusy();
  try {
    await personalStore.clear();
    resetLocalView();
    for(const dialog of document.querySelectorAll('dialog[open]'))closeDialog(dialog);
    $('#data-open').focus({preventScroll:true});
    broadcast?.postMessage({type:'cleared'});
    notify('Bu tarayıcıdaki favorilerin, sayaçların ve ayarların silindi.');
  } catch {
    storageFailure='Bazı kayıtlar silinemedi. Tarayıcının site verileri ayarından bu siteyi temizleyebilirsin.';
    notify(storageFailure);renderDataSummary();
  } finally {busyCount--;updateBusy();}
}
async function refreshFromAnotherTab(type) {
  if(type==='cleared')dataEpoch++;
  busyCount++;updateBusy();
  try {
    progress=await personalStore.read();
    if(type==='cleared')resetLocalView();
    else if(page==='set'){renderSidebar();renderAside();renderWords();renderDataSummary();}
    else if(page==='library'){renderLibrary();renderDataSummary();}
    else {renderCollection(page);renderDataSummary();}
  } catch {notify('Diğer sekmedeki kayıt okunamadı. Sayfayı yenileyebilirsin.');}
  finally {busyCount--;updateBusy();}
}
if(broadcast)broadcast.onmessage=event=>{if(['updated','cleared'].includes(event.data?.type))refreshFromAnotherTab(event.data.type);};
window.addEventListener('storage',event=>{
  if(personalStore.mode==='localStorage' && event.key===KEY)refreshFromAnotherTab(event.newValue===null?'cleared':'updated');
});
document.addEventListener('click',event=>{
  if(busyCount>0){event.preventDefault();event.stopImmediatePropagation();}
},true);

// Static controls and dynamic controls share one event delegation path.
document.addEventListener('click',event => {
  const button = event.target.closest('button,[data-close-dialog]');
  if (button?.disabled) return;
  if (button?.hasAttribute('data-close-dialog')) {closeDialog(button.closest('dialog')); return;}
  if (button?.dataset.view) {
    if (button.dataset.view === 'library') renderLibrary(); else renderCollection(button.dataset.view);
    return;
  }
  if (button?.dataset.openSet) {selectSet(button.dataset.openSet,button.dataset.openWord); $('#global-search').value = ''; return;}
  if (button?.dataset.star) {toggleStar(button.dataset.star); return;}
  if (button?.dataset.speak) {const w = getWord(button.dataset.speak); if (w) speak(w.term); return;}
  if (button?.dataset.answer !== undefined) {const i = Number(button.dataset.answer); answerQuiz(session.choices[i].id === session.items[session.pos].id,i); return;}
  if (button?.dataset.tile !== undefined) {chooseTile(Number(button.dataset.tile)); return;}
  const action = button?.dataset.action;
  if (action === 'mode') startMode(button.dataset.mode);
  else if (action === 'flip' && mode === 'cards') {flipped = !flipped; renderCard();}
  else if (action === 'previous') moveCard(-1);
  else if (action === 'next') moveCard(1);
  else if (action === 'shuffle') {deck = shuffle(deck); index = 0; flipped = false; cardResults = new Map(); renderCard(); savePosition(); if (preferences.autoAudio) speak(deck[index].term);}
  else if (action === 'reverse') {preferences.reverse = !preferences.reverse; savePreferences(); flipped = false; renderCard();}
  else if (action === 'grade-again') gradeCard(false);
  else if (action === 'grade-known') gradeCard(true);
  else if (action === 'begin-test') beginQuiz();
  else if (action === 'skip') answerQuiz(false);
  else if (action === 'continue' && session?.answered) {session.pos++; renderQuestion();}
  else if (action === 'restart') startMode(mode);
  else if (action === 'retry-wrong') {const wrong = session.wrong; if (mode === 'cards') {deck = wrong; index = 0; flipped = false; cardResults = new Map(); session = null; renderCard();} else beginQuiz(wrong);}
  else if (action === 'new-match') renderMatch();
  else if (action === 'study-collection') startCollection(button.dataset.kind);
  else if (action === 'reset-filter') {$('#study-filter').value = 'all'; startMode('cards');}
  else if (action === 'show-notes') {setFocus(false); showTab('notes'); $('#notes-tab').scrollIntoView?.({behavior:'smooth',block:'start'});}
  if (!event.target.closest('.global-search-wrap')) closeSearch();
});
$('#brand-home').onclick = event => {event.preventDefault(); renderLibrary();};
$('#back-library').onclick = renderLibrary;
$('#focus').onclick = () => setFocus(!document.body.classList.contains('focus-mode'));
$('#settings-open').onclick = event => openDialog('settings-dialog',event.currentTarget);
$('#data-open').onclick = event => {renderDataSummary();openDialog('data-dialog',event.currentTarget);};
$('#delete-data-open').onclick = event => openDialog('delete-dialog',event.currentTarget);
$('#confirm-delete').onclick = deletePersonalData;
$('#help-open').onclick = event => openDialog('help-dialog',event.currentTarget);
$('#menu-toggle').onclick = () => {
  menuOpen = !menuOpen;
  document.body.classList.toggle('menu-open',menuOpen);
  $('#menu-toggle').setAttribute('aria-expanded',String(menuOpen));
  $('#menu-scrim').hidden = !menuOpen;
  if (menuOpen) $('#main-nav button')?.focus();
};
$('#menu-scrim').onclick = () => {closeMenu(); $('#menu-toggle').focus();};
function updateTheme() {
  const dark = document.body.classList.contains('dark');
  $('#theme').innerHTML = icon(dark ? 'sun' : 'moon');
  $('#theme').setAttribute('aria-label',dark ? 'Açık temaya geç' : 'Koyu temaya geç');
  document.querySelector('meta[name="theme-color"]').setAttribute('content',dark ? '#121625' : '#4255ff');
}
$('#theme').onclick = () => {
  document.body.classList.toggle('dark'); updateTheme();
  try {localStorage.setItem('ka-theme',document.body.classList.contains('dark') ? 'dark' : 'light');} catch {}
};
$('#accent').value = preferences.accent;
$('#slow').checked = preferences.slow;
$('#auto-audio').checked = preferences.autoAudio;
for (const [id,key] of [['accent','accent'],['slow','slow'],['auto-audio','autoAudio']]) {
  $('#'+id).onchange = event => {
    preferences[key] = id === 'accent' ? event.target.value : event.target.checked;
    savePreferences();
  };
}
$('#study-filter').onchange = () => startMode(mode);
$('#word-search').oninput = () => {listLimit = 12; renderWords();};
$('#only-stars').onchange = () => {listLimit = 12; renderWords();};
$('#more-words').onclick = () => {listLimit += 12; renderWords();};
$('#terms-tab').onclick = () => showTab('terms');
$('#notes-tab').onclick = () => showTab('notes');
for (const id of ['terms','notes']) $('#'+id+'-tab').onkeydown = event => {
  if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {event.preventDefault(); showTab(event.key === 'Home' ? 'terms' : event.key === 'End' ? 'notes' : id === 'terms' ? 'notes' : 'terms',true);}
};
$('#global-search').oninput = renderSearch;
$('#global-search').onfocus = () => {if ($('#global-search').value) renderSearch();};
$('#export').onclick = () => {
  const blob = new Blob([JSON.stringify({...progress,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = 'kelime-ilerleme-'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  notify('İlerleme dosyan indirildi.');
};
$('#import').onchange = async event => {
  const epoch=dataEpoch;
  try {
    const file = event.target.files[0]; if (!file) return;
    if (file.size > MAX_PERSONAL_BYTES) throw Error('Dosya 10 MB sınırını aşıyor.');
    const incoming = validateProgress(JSON.parse(await file.text()));
    if(epoch!==dataEpoch)return;
    const saved=await mutateProgress(old=>({version:1,words:{...old.words,...incoming.words}}));
    if(!saved || epoch!==dataEpoch)return;
    if (page === 'set') {renderAside(); renderSidebar(); renderWords(); startMode(mode);}
    else if (page === 'library') renderLibrary(); else renderCollection(page);
    notify('İlerleme yüklendi. Aynı terimlerde dosyadaki kayıt kullanıldı.');
  } catch (error) {notify('Yüklenemedi: '+error.message);}
  finally {event.target.value = '';}
};
document.addEventListener('keydown',event => {
  if(busyCount>0)return;
  if (event.key === 'Escape') {
    closeSearch();
    if (menuOpen) {closeMenu(); $('#menu-toggle').focus();}
    if (document.body.classList.contains('focus-mode')) setFocus(false);
    return;
  }
  if (menuOpen && event.key === 'Tab') {
    const targets = [...$('#sidebar').querySelectorAll('button,a')];
    if (event.shiftKey && document.activeElement === targets[0]) {event.preventDefault(); targets.at(-1)?.focus();}
    else if (!event.shiftKey && document.activeElement === targets.at(-1)) {event.preventDefault(); targets[0]?.focus();}
  }
  if (document.querySelector('dialog[open]') || event.target.closest('input,select,textarea,a,summary') || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target.closest('button') && [' ','Enter'].includes(event.key)) return;
  if (event.key === '/') {event.preventDefault(); $('#global-search').focus(); return;}
  if (event.key === '?') {event.preventDefault(); openDialog('help-dialog'); return;}
  if (page !== 'set' || mode !== 'cards' || !deck.length || session?.kind === 'cards') return;
  if (event.key === ' ') {event.preventDefault(); flipped = !flipped; renderCard();}
  else if (event.key === 'ArrowLeft') {event.preventDefault(); moveCard(-1);}
  else if (event.key === 'ArrowRight') {event.preventDefault(); moveCard(1);}
  else if (event.key.toLowerCase() === 'f') toggleStar(deck[index].id);
  else if (event.key === '1') gradeCard(false);
  else if (event.key === '2') gradeCard(true);
});
async function initializeApp() {
  try {
    progress=await personalStore.ready;
    sets=window.KA_SETS;
    if(!Array.isArray(sets))throw Error('Kelime verisi bulunamadı');
    updateTheme();renderSidebar();renderDataSummary();
    if(sets.length)selectSet(sets.find(s=>s.id===preferences.lastSet)?.id || sets[0].id);
    else renderLibrary();
  } catch(error) {
    $('#workspace').innerHTML=empty('Kelimeler yüklenemedi','index.html ile birlikte site ve data klasörlerinin de bulunduğundan emin ol.');
    notify(error.message);
  } finally {busyCount--;updateBusy();}
}
// Readiness hook for local integration tests; contains no personal data.
window.KA_READY=initializeApp();
