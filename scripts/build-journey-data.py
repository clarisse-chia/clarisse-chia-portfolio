"""Extract directed ride patterns, scheduled ride times, and explicit GTFS transfers.
Usage: python3 scripts/build-journey-data.py /path/to/gtfs_subway.zip
"""
import csv,io,json,sys,zipfile,statistics
from collections import defaultdict
from pathlib import Path
z=zipfile.ZipFile(sys.argv[1]);root=Path(__file__).resolve().parents[1]
def rows(name):return csv.DictReader(io.TextIOWrapper(z.open(name),encoding='utf-8-sig'))
allowed=set('1 2 3 4 5 6 7 A C E B D F M G J Z L N Q R W'.split())
trips={t['trip_id']:t for t in rows('trips.txt') if t['route_id'].removesuffix('X') in allowed}
stops={s['stop_id']:s for s in rows('stops.txt')}
def parent(id):return stops[id]['parent_station'] or id
def sec(value):
 h,m,s=map(int,value.split(':'));return h*3600+m*60+s
calls=defaultdict(list)
for r in rows('stop_times.txt'):
 if r['trip_id'] in trips:calls[r['trip_id']].append(r)
patterns={}
for tid,seq in calls.items():
 seq.sort(key=lambda r:int(r['stop_sequence']));t=trips[tid];ids=tuple(parent(s['stop_id']) for s in seq)
 key=(t['route_id'].removesuffix('X'),ids)
 durations=[max(1,sec(b['arrival_time'])-sec(a['departure_time'])) for a,b in zip(seq,seq[1:])]
 if key not in patterns:patterns[key]={'route':key[0],'stops':ids,'direction':seq[0]['stop_id'][-1],'headsign':t['trip_headsign'],'shape':t['shape_id'],'samples':[]}
 patterns[key]['samples'].append(durations)
shapes=defaultdict(list)
for r in rows('shapes.txt'):shapes[r['shape_id']].append((int(r['shape_pt_sequence']),float(r['shape_pt_lon']),float(r['shape_pt_lat'])))
result=[];geometry=[];geometry_ids={}
for p in patterns.values():
 p['seconds']=[round(statistics.median(samples)) for samples in zip(*p.pop('samples'))]
 shape_id=p.pop('shape');points=[list(v[1:]) for v in sorted(shapes[shape_id])];indices=[];start=0
 if shape_id not in geometry_ids:geometry_ids[shape_id]=len(geometry);geometry.append(points)
 for sid in p['stops']:
  s=stops[sid];lon=float(s['stop_lon']);lat=float(s['stop_lat'])
  start=min(range(start,len(points)),key=lambda i:(points[i][0]-lon)**2+(points[i][1]-lat)**2)
  indices.append(start)
 p['shape']=geometry_ids[shape_id];p['indices']=indices;result.append(p)
ids={s for p in result for s in p['stops']};transfers=[]
for t in rows('transfers.txt'):
 a,b=parent(t['from_stop_id']),parent(t['to_stop_id'])
 if a in ids and b in ids and t['transfer_type']!='3':transfers.append({'from':a,'to':b,'seconds':int(t['min_transfer_time'] or 180)})
(root/'src/data/subwayJourneys.json').write_text(json.dumps({'patterns':result,'transfers':transfers,'shapes':geometry},separators=(',',':')))
print(len(result),'directed patterns;',len(transfers),'explicit transfer links')
