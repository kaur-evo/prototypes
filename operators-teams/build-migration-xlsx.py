import csv, collections, statistics, datetime, sys
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment
from openpyxl.utils import get_column_letter

SRC='operators_data_202608141724-noname.csv'
# Stamped with the export time and never overwritten, so earlier exports stay
# around to diff against.
STAMP=datetime.datetime.now().strftime('%Y%m%d-%H%M')
OUT=f'operator-group-migration-{STAMP}.xlsx'
DROP_PREFIX='IT-AGR-'; DROP_FACTORY='IT-Agribios'

raw=[]
with open(SRC,encoding='utf-8-sig') as fh:
    rd=csv.reader(fh,delimiter=';'); next(rd)
    for c in rd:
        if not c or not c[0]: continue
        raw.append({'tenantName':c[0],'operatorId':c[1],'stations':c[4],
                    'factories':c[5],'factoryCount':c[6]})
sp=lambda v:[x.strip() for x in (v or '').split(',') if x.strip()]

recs=[]; yara_touched=0; yara_stations_removed=0; emptied=0; already_empty=0
for r in raw:
    st,fa=sp(r['stations']),sp(r['factories']); note=''
    had_st=bool(st)
    if r['tenantName']=='yara' and DROP_FACTORY in fa:
        n=len([s for s in st if s.startswith(DROP_PREFIX)])
        st=[s for s in st if not s.startswith(DROP_PREFIX)]
        fa=[f for f in fa if f!=DROP_FACTORY]
        yara_touched+=1; yara_stations_removed+=n; note='IT-Agribios stations removed'
    fa=sorted(set(fa))
    if not st:
        group=''; note=(note+'; ' if note else '')+'no stations, no group'
        if had_st: emptied+=1
        else: already_empty+=1
    else: group=', '.join(fa)
    recs.append({'tenantName':r['tenantName'],'operatorId':r['operatorId'],
                 'stations':', '.join(st),'factories':', '.join(fa),
                 'factoryCount':len(fa),'operatorGroup':group,'note':note})

counts=collections.Counter((r['tenantName'],r['operatorGroup']) for r in recs if r['operatorGroup'])
per_tenant=collections.Counter(); [per_tenant.__setitem__(t,per_tenant[t]+1) for t,_ in counts]
gv=sorted(per_tenant.values())
combo=[g for (_,g) in counts if ',' in g]
grouped=[r for r in recs if r['operatorGroup']]

wb=Workbook()
ws=wb.active; ws.title='Operators'
cols=['tenantName','operatorId','stations','factories','factoryCount','operatorGroup','note']
ws.append(cols)
for r in recs: ws.append([r[c] for c in cols])

ws2=wb.create_sheet('Groups')
ws2.append(['tenantName','tenantGroups','operatorGroup','operators'])
# tenantGroups repeats the tenant's total on every one of its rows, so a single
# row tells you both the group and how big a change this tenant is getting.
for (t,g),n in sorted(counts.items(), key=lambda x:(x[0][0],-x[1],x[0][1])):
    ws2.append([t,per_tenant[t],g,n])

# The summary lives in Notion (Shaping Teams & Operators -> Migration of
# operator groups -> Migration output) so there is one place to read it.

for sheet,widths in ((ws,[18,12,60,40,12,42,32]),(ws2,[24,14,46,12])):
    sheet.freeze_panes='A2'
    for i,w in enumerate(widths,1): sheet.column_dimensions[get_column_letter(i)].width=w
    for c in sheet[1]: c.font=Font(bold=True)
ws.auto_filter.ref=ws.dimensions; ws2.auto_filter.ref=ws2.dimensions
wb.save(OUT)
print(f"kirjutatud: {OUT}")
print(f"Operators {len(recs)} | Groups {len(counts)} | Tenants {len(per_tenant)} | ilma grupita {len(recs)-len(grouped)}")
print(f"Yara: {yara_touched} operaatorit, {yara_stations_removed} jaamaseost eemaldatud, {emptied} jäi tühjaks, grupid 63 -> {per_tenant.get('yara',0)}")
