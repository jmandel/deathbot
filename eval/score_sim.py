import json,re,sys,glob
def score(path):
    d=json.load(open(path)); turns=[t for t in d['log'] if 'deathbot' in t]
    n=len(turns); c=dict(turns=n, menu=0, sit=0, buttons=0, multi_q=0, tube=0, odds=0, figures_repeated=0, words=0)
    seen=set()
    for t in turns:
        x=t['deathbot']; last=x.strip().split('\n')[-1]
        if re.search(r'look at next|go next|like to (look|start|explore|talk about) (at |with )?(next|first)?|which (one|would you like)|where would you like',last,re.I): c['menu']+=1
        if re.search(r'sit with|land(s|ed)? (with|for) you',x,re.I): c['sit']+=1
        if t.get('replies'): c['buttons']+=1
        if len(re.findall(r'\?',x))>=2: c['multi_q']+=1
        if re.search(r'\bthe tube\b',x,re.I): c['tube']+=1
        if re.search(r'\bodds\b',x,re.I): c['odds']+=1
        figs=set(re.findall(r'\b\d+ in 100\b',x))
        if figs & seen: c['figures_repeated']+=1
        seen|=figs; c['words']+=len(x.split())
    c['words']=round(c['words']/max(n,1)); c['errors']=sum(1 for t in d['log'] if 'error' in t)
    return c
rows=[]
for p in sys.argv[1:]:
    for f in sorted(glob.glob(f'{p}*/conversation.json')):
        s=score(f); rows.append((f.split('/')[-2],s))
keys=['turns','menu','sit','buttons','multi_q','tube','odds','figures_repeated','words','errors']
print('run'.ljust(18)+''.join(k[:9].rjust(10) for k in keys))
for name,s in rows: print(name.ljust(18)+''.join(str(s[k]).rjust(10) for k in keys))
