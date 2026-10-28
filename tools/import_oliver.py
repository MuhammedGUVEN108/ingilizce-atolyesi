"""Import the reviewed Oliver Twist material; no extraction guesses are accepted.
Curated records are data/analysis/oliver-twist/*.json. Original bytes are archived.
Run after reviewing curated.json and grammar.json; then run build_local.py.
"""
import pathlib,json,re,hashlib,shutil
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=pathlib.Path(r"C:\Users\Muhammed\Desktop\oliver twist.txt")
ANALYSIS=ROOT/"data/analysis/oliver-twist"
RAW=ROOT/"data/inbox/2026-10-28-oliver-twist.txt"
def read(path):return json.loads(path.read_text(encoding="utf-8"))
def write(path,data):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def norm(s):return re.sub(r"\s+"," ",s.strip().lower())
def slug(s):return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")
raw=SOURCE.read_bytes()
if RAW.exists():assert RAW.read_bytes()==raw,"Original archive differs; review before replacing"
else:RAW.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(SOURCE,RAW)
assert SOURCE.read_bytes()==RAW.read_bytes()
lines=raw.decode("utf-8-sig").splitlines()
aliases={"bleeding":"bleed","taught":"teach","kidnapped":"kidnap","collapsed":"collapse","bent":"bend","embraced":"embrace","dragged":"drag","rang":"ring","compelled":"compel","squeezing":"squeeze","handkerchiefs":"handkerchief","hang (hung)":"hang","grasped":"grasp","coffins":"coffin","panted":"pant","chaunt / chant":"chant","grasp":"grasp","have to + v1":"have to"}
curated=read(ANALYSIS/"curated.json")
byterm={w["term"]:w for w in curated}
assert len(byterm)==len(curated)
inventory=[];groups={term:[] for term in byterm};kind="vocabulary"
for n,line in enumerate(lines,1):
    if not line.strip().startswith("|"):continue
    cells=[v.strip() for v in line.strip().strip("|").split("|")]
    if all(re.fullmatch(r"[- :]+",v) for v in cells):continue
    if cells[0] in ["#","Kelime","Kalıp","Kelime / Kalıp","İngilizce","Gramer","İngilizce (düzeltilmiş)"]:
        if cells[0]=="Gramer":kind="grammar"
        elif cells[0]=="İngilizce (düzeltilmiş)":kind="sentences"
        elif "Örnek cümle" in cells and "Türkçe anlamı" not in cells:kind="example"
        else:kind="vocabulary"
        continue
    rowcells=cells[1:] if cells[0].isdigit() else cells
    term=norm(rowcells[0]);canonical=aliases.get(term,term)
    row={"line":n,"cells":cells,"sourceType":kind}
    if kind in ["vocabulary","example"] and canonical in byterm:
        row.update(disposition="study-card",canonical=canonical);groups[canonical].append({"line":n,"originalTerm":rowcells[0],"cells":rowcells,"role":"summary-supplement" if 207<=n<=216 or 357<=n<=369 or 418<=n<=426 or 524<=n<=537 else "summary-listed"})
    elif term in ["foryos","convet"]:row["disposition"]="unresolved"
    elif kind=="sentences":row["disposition"]="sentence-evidence"
    elif kind=="grammar" or "+ v" in term or "v-ing" in term:row["disposition"]="grammar-note"
    else:row["disposition"]="unmapped"
    inventory.append(row)
assert not [r for r in inventory if r["disposition"]=="unmapped"],[r for r in inventory if r["disposition"]=="unmapped"]
assert all(groups.values()),[term for term,rows in groups.items() if not rows]
notes={
"bleed":"Kaynak biçim bleeding. Bleed → bled → bled; was bleeding = kanıyordu.",
"teach":"Kaynak biçim taught. Teach → taught → taught; was taught = öğretildi. Kartta yalın teach biçimini yaz.",
"mug":"Kaynakta kupa anlamı da verilmiş; fiil kartı gasp etmek anlamına odaklanır. Kupa anlamı ayrı isim kullanımıdır.",
"purse":"Britanya bağlamında küçük para çantası/para kesesi. Bazı Amerikan kullanımlarında el çantası anlamına gelebilir; kitap bağlamı görülmeden tek karşılık dayatılmaz.",
"enterprise":"Bu bağlamda girişim/teşebbüs anlamı olasıdır. Kaynak cümledeki have another enterprise doğal bir modern eşdizim değildir; özgün kitap metni doğrulanmadı.",
"kidnap":"Kaynak biçim kidnapped. Kidnap → kidnapped → kidnapped; was kidnapped = kaçırıldı.",
"shot":"Bu kart silah atışı anlamında isimdir. Shot aynı zamanda shoot fiilinin V2/V3 biçimidir. İğne, fotoğraf ve şut anlamları bağlama bağlı diğer kullanımlardır.",
"permit":"Fiil olarak izin vermek. İsim olarak izin belgesi de demektir. Permit someone to do something kalıbına dikkat et; isim/fiil vurgu yeri farklıdır.",
"creature":"Canlı/yaratık; poor little creature gibi ifadelerde acınan bir insanı da anlatabilir, her zaman canavar değildir.",
"geese":"Goose kelimesinin düzensiz çoğulu. Kart çoğul geese biçimini sorar; goose aynı cevap değildir.",
"collapse":"Kaynak biçimler collapsed; yinelenen kayıtlar tek başlıkta birleştirildi.",
"bend":"Kaynak biçim bent. Bend → bent → bent.",
"shut":"Shut → shut → shut. He was shut tek başına yeterli bir hapsedilme örneği değildir; bağlam gerekir.",
"whom":"Who'nun nesne biçimi; resmî/yazılı dilde yaygındır. Türkçe karşılığı cümlenin bütününe bağlıdır.",
"accept":"Except (hariç) ile karıştırma. Accept bir fiildir.",
"except":"Accept (kabul etmek) ile karıştırma. Bu kartta except, hariç anlamında edattır.",
"embrace":"Kaynak biçim embraced. Etken: sarıldı/kucakladı. Edilgen anlam için be gibi yardımcı yapı gerekir.",
"drag":"Kaynak biçim dragged. Drag → dragged → dragged. Dragged = sürükledi; was dragged = sürüklendi.",
"ring":"Kaynak biçim rang. Ring → rang → rung. Bu kart zil/çan çalma fiilidir; yüzük ismi ayrı anlamdır.",
"compel":"Kaynak biçim compelled. Be compelled to do something = bir şeyi yapmaya mecbur bırakılmak.",
"squeeze":"Kaynak biçim squeezing. Squeeze into/out ayrıca kalıp setinde bulunur.",
"coffin":"Coffin ve coffins tek başlıkta birleştirildi. Coffins = tabutlar.",
"handkerchief":"Kaynak biçim handkerchiefs; kart tekil handkerchief biçimini sorar.",
"hang":"Hang → hung → hung eşya asma bağlamındaki güncel standarttır. Hanged çoğunlukla idamla ilgilidir. Hanging on a string = bir ipte asılı duran.",
"admit":"Bir şeyi yaptığını/gerçeği kabul etmek veya birini içeri almak. Birinin çalışmasına izin vermek anlamına doğrudan eşitlenmez.",
"grasp":"Grasp ve grasped birleştirildi. Fiziksel olarak kavramak veya bir düşünceyi anlamak olabilir.",
"pant":"Kaynak biçim panted; bağlama göre nefes nefese kalmak veya nefes nefese söylemek.",
"chant":"Chaunt eski yazım varyantıdır. Standart çalışma biçimi chant; eski biçim kaybolmadı.",
"long-lasting":"Kaynak özetin açıklamasından türetilmiş; longig lasting step ifadesinin doğrulanmış düzeltmesi değildir.",
"deeply":"Özet tarafından cümleden türetilen ek kelime; doğrudan sorulduğu kesin değil.",
"as if":"Knew gibi geçmiş biçim her zaman geçmiş zamanı anlatmaz; gerçekdışı/mesafeli bir benzetme kurabilir.",
"as much as":"Bu kart aynı ölçüde/kadar anlamına odaklanır; bağlama göre başka kullanımlar bulunabilir.",
"the old":"Topluluk bildiren sıfat yapısıdır; olds biçimi bu anlamda kullanılmaz. Older people daha nötr olabilir.",
"would die":"Ölecekti/ölürdü ayrımı için bağlam gerekir; tek başına tek bir zaman anlamı yoktur.",
"grasp an opportunity":"Grasped biçimi cümlede geçmiş zamana göre kullanılır; kalıp yalın biçimde tutuldu.",
"on a string":"Yalnız ipin üstünde konumlanmak anlamıyla sınırlı değildir; ipe bağlı/asılı durmayı anlatabilir.",
"badness":"Dilbilgisel olarak geçerli bir isimdir; bağlama göre evil veya wickedness daha doğal olabilir, sessizce başka kelimeye dönüştürülmedi."
}
source_urls={
"drag":["https://dictionary.cambridge.org/dictionary/english/drag"],
"admit":["https://dictionary.cambridge.org/us/dictionary/english/admit"],
"whom":["https://dictionary.cambridge.org/us/grammar/british-grammar/who-whom"],
"hang":["https://www.merriam-webster.com/grammar/hung-or-hanged"],
"chant":["https://www.merriam-webster.com/dictionary/chaunt"],
"enterprise":["https://dictionary.cambridge.org/dictionary/english/enterprise"]
}
words=[];phrases=[]
for row in curated:
    term=row["term"];evidence=groups[term]
    card={**row,"id":"ot-"+slug(term),"ipa":"","pronunciationTr":"","level":"unknown","acceptedAnswers":[term],"tags":["Oliver Twist","kalıp" if " " in term else "kelime"],"verification":"unverified","sourceForms":list(dict.fromkeys(v["originalTerm"] for v in evidence)),"provenance":{"file":"data/inbox/2026-10-28-oliver-twist.txt","lines":[v["line"] for v in evidence],"origin":"AI-conversation-summary","examples":"created-for-study"},"notes":notes.get(term,""),"sources":source_urls.get(term,[])}
    if term=="admit":card["ipa"]="/ədˈmɪt/"
    if term=="drag":card["ipa"]="/dræɡ/"
    if term=="enterprise":card["ipa"]="/ˈen.tə.praɪz/"
    if term=="chant":card["acceptedAnswers"].append("chaunt")
    card["verificationDetails"]={"scope":"selected-usage-note" if term in source_urls else "editorial-cleaning-only","allFieldsDictionaryVerified":False}
    (phrases if " " in term else words).append(card)
grammar=read(ANALYSIS/"grammar.json")
issues=read(ANALYSIS/"review.json")
sentences=read(ANALYSIS/"sentences.json")
for sentence in sentences:
    sentence["sourceLines"]=[n for n,line in enumerate(lines,1) if sentence["original"] in line]
    assert sentence["sourceLines"],sentence["original"]
write(ANALYSIS/"sentences.json",sentences)
study_notes=[{"title":g["title"],"text":g["explanation"],"en":g["example"]["en"],"tr":g["example"]["tr"]} for g in grammar]
study_notes+=[{"title":"İnceleme: "+i["original"],"text":i["note"]} for i in issues if i["needsUserContext"]]
study_notes+=[{"title":"Cümle bağlamı "+str(i+1),"text":s["note"],"original":s["original"],"en":s["studyVersion"] or "", "tr":s["tr"] or ""} for i,s in enumerate(sentences)]
description="Kitap okurken oluşan sohbet özetlerinden temizlendi. Örnek cümleler çalışma için oluşturuldu; kitaptan kesin alıntı değildir. İnceleme notları aşağıda."
for suffix,title,items in [("words","Oliver Twist · Kelimeler",words),("phrases","Oliver Twist · Kalıplar",phrases)]:
    write(ROOT/("data/sets/oliver-twist-"+suffix+".json"),{"id":"oliver-twist-"+suffix,"title":title,"folder":"Kitaplar · Oliver Twist","description":description,"words":items,"studyNotes":study_notes})
catalog=read(ROOT/"data/catalog.json")
entries=[{"id":"oliver-twist-"+s,"file":"data/sets/oliver-twist-"+s+".json"} for s in ["words","phrases"]]
catalog["sets"]=entries+[e for e in catalog["sets"] if e["id"] not in {v["id"] for v in entries}]
write(ROOT/"data/catalog.json",catalog)
write(ANALYSIS/"source-rows.json",inventory)
write(ANALYSIS/"source-evidence.json",groups)
manifest={"source":"C:/Users/Muhammed/Desktop/oliver twist.txt","archive":str(RAW.relative_to(ROOT)).replace("\\","/"),"sha256":hashlib.sha256(raw).hexdigest(),"sourceBytes":len(raw),"sourceLines":len(lines),"vocabularyCards":len(words),"phraseCards":len(phrases),"grammarNotes":len(grammar),"reviewIssues":len(issues),"unresolvedSpellings":["Foryos","Convet"],"counts":{key:sum(r["disposition"]==key for r in inventory) for key in sorted({r["disposition"] for r in inventory})},"verification":"All fields are not dictionary-verified; selected usage corrections have sources. CEFR and missing IPA not guessed."}
write(ANALYSIS/"manifest.json",manifest)
manifest["sentenceContexts"]=len(sentences)
write(ANALYSIS/"manifest.json",manifest)
print(json.dumps(manifest,ensure_ascii=True,indent=2))

