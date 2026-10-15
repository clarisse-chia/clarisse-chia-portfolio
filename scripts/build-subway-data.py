"""Rebuild bundled geometry from the MTA regular subway GTFS archive.
Usage: python3 scripts/build-subway-data.py /path/to/gtfs_subway.zip
Source: https://www.mta.info/developers (regular subway GTFS).
Includes scheduled variants; not a live service-change map.
"""
import csv, io, json, sys, zipfile
from collections import defaultdict
from pathlib import Path
from datetime import date
z=zipfile.ZipFile(sys.argv[1])
def rows(name): return csv.DictReader(io.TextIOWrapper(z.open(name),encoding='utf-8-sig'))
allowed='1 2 3 4 5 6 7 A C E B D F M G J Z L N Q R W'.split()
trips={}; shape_routes=defaultdict(set)
for r in rows('trips.txt'):
 route=r['route_id'].removesuffix('X')
 if route in allowed:
  trips[r['trip_id']]=route
  shape_routes[r['shape_id']].add(route)
stops={r['stop_id']:r for r in rows('stops.txt')}
station_routes=defaultdict(set)
for r in rows('stop_times.txt'):
 if r['trip_id'] in trips:
  stop=stops[r['stop_id']]
  station_routes[stop['parent_station'] or stop['stop_id']].add(trips[r['trip_id']])
stations=[dict(id=k,name=stops[k]['stop_name'],lat=float(stops[k]['stop_lat']),lon=float(stops[k]['stop_lon']),routes=[r for r in allowed if r in routes]) for k,routes in station_routes.items()]
stations.sort(key=lambda s:s['id'])
shapes=defaultdict(list)
for r in rows('shapes.txt'):
 if r['shape_id'] in shape_routes:
  shapes[r['shape_id']].append((int(r['shape_pt_sequence']),round(float(r['shape_pt_lon']),5),round(float(r['shape_pt_lat']),5)))
# Shared track is stored once with all of its routes, not painted repeatedly.
edges=defaultdict(set)
for key,pts in shapes.items():
 pts=[(p[1],p[2]) for p in sorted(pts)]
 for a,b in zip(pts,pts[1:]):
  if a!=b: edges[tuple(sorted((a,b)))].update(shape_routes[key])
groups=defaultdict(list)
for (a,b),routes in edges.items(): groups[tuple(r for r in allowed if r in routes)].append([a,b])
root=Path(__file__).resolve().parents[1]/'src/data'
(root/'subwayStations.json').write_text(json.dumps(stations,separators=(',',':')))
(root/'subwayGeometry.json').write_text(json.dumps(dict(source='https://rrgtfsfeeds.s3.amazonaws.com/gtfs_subway.zip',retrieved=str(date.today()),tracks=[dict(routes=k,segments=v) for k,v in groups.items()]),separators=(',',':')))
print(f'{len(stations)} station stops, {len(edges)} track segments, {len(set(trips.values()))} routes')
