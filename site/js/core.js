export const normalize = s => s.toLocaleLowerCase('en-US').normalize('NFKC').trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
export function shuffle(items) {
  const a = [...items];
  for (let i=a.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
export function checkAnswer(word,answer) {
  return [...(word.acceptedAnswers || []),word.term].some(x=>normalize(x)===normalize(answer));
}
export function getWordStats(previous={}) {
  const attempts = previous.attempts || 0, correct = previous.correct || 0;
  const wrong = previous.wrong ?? Math.max(0,attempts-correct);
  return {attempts,correct,wrong,wrongStreak:previous.wrongStreak || 0,errorRate:attempts ? wrong/attempts : 0};
}
export function difficultyScore(previous={}) {
  const {wrong,errorRate,wrongStreak} = getWordStats(previous);
  return wrong*errorRate + wrongStreak;
}
export function schedule(previous,correct,now=Date.now()) {
  const old = getWordStats(previous);
  const streak = correct ? (previous.streak || 0)+1 : 0;
  const days = correct ? [1,3,7,14,30,60][Math.min(streak-1,5)] : 0;
  return {...previous,streak,attempts:old.attempts+1,correct:old.correct+(correct?1:0),wrong:old.wrong+(correct?0:1),
    wrongStreak:correct?0:old.wrongStreak+1,due:now+(correct?days*86400000:600000),lastResult:correct,lastReviewedAt:now};
}
export function validateProgress(p) {
  if (!p || p.version!==1 || typeof p.words!=='object' || !p.words || Array.isArray(p.words)) throw Error('Geçersiz ilerleme dosyası');
  for (const [id,v] of Object.entries(p.words)) {
    if (!/^[a-z0-9-]+$/.test(id) || ['constructor','prototype'].includes(id) || !v || typeof v!=='object' || Array.isArray(v)) throw Error('Geçersiz kelime kaydı');
    for (const key of ['streak','attempts','correct','wrong','wrongStreak','due','lastReviewedAt']) {
      if (v[key]!==undefined && (!Number.isSafeInteger(v[key]) || v[key]<0)) throw Error('Geçersiz ilerleme değeri');
    }
    if (v.correct!==undefined && v.attempts!==undefined && v.correct>v.attempts) throw Error('Doğru sayısı deneme sayısını aşamaz');
    if (v.wrong!==undefined && v.attempts!==undefined && v.correct!==undefined && v.wrong!==v.attempts-v.correct) throw Error('Yanlış sayısı toplamla uyuşmuyor');
    for (const key of ['star','lastResult']) if (v[key]!==undefined && typeof v[key]!=='boolean') throw Error('Geçersiz kayıt değeri');
  }
  return p;
}
