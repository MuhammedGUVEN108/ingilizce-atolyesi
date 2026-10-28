import json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
catalog=json.loads((ROOT/'data/catalog.json').read_text(encoding='utf-8'))
assert catalog['schemaVersion']==1
ids=set(); sets=set(); count=0
for item in catalog['sets']:
    assert re.fullmatch(r'[a-z0-9-]+',item['id'])
    assert item['id'] not in sets
    sets.add(item['id'])
    path=(ROOT/item['file']).resolve()
    assert path.is_relative_to((ROOT/'data/sets').resolve()) and path.suffix=='.json'
    data=json.loads(path.read_text(encoding='utf-8'))
    assert data['id']==item['id']
    for key in ['title','folder','description']: assert isinstance(data[key],str) and data[key]
    assert isinstance(data['words'],list)
    for w in data['words']:
        assert re.fullmatch(r'[a-z0-9-]+',w['id']) and w['id'] not in ids
        ids.add(w['id']);count+=1
        for key in ['term','meaning','partOfSpeech']: assert isinstance(w[key],str) and w[key].strip()
        for key in ['ipa','pronunciationTr']: assert isinstance(w[key],str)
        assert w['level'] in ['A1','A2','B1','B2','C1','C2','unknown']
        assert w['verification'] in ['verified','unverified','illustrative']
        assert isinstance(w['examples'],list) and len(w['examples'])>=1
        for example in w['examples']:
            assert all(isinstance(example[k],str) and example[k] for k in ['en','tr'])
        for key in ['acceptedAnswers','tags']:
            assert isinstance(w[key],list) and all(isinstance(v,str) and v for v in w[key])
        if w['verification']=='verified': assert w.get('sources')
print(f'OK: {len(sets)} sets, {count} unique words')
