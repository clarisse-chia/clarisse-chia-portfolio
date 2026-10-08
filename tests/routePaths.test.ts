import test from 'node:test';
import assert from 'node:assert/strict';
import {HUBS,ROUTES} from '../src/data/transit';
import {ROUTE_TRACES,pixelPath,tracePoints} from '../src/data/routePaths';

test('every non-shuttle route has a trace visiting exactly its supported neighborhood markers',()=>{
 assert.deepEqual(Object.keys(ROUTE_TRACES).sort(),[...ROUTES].sort());
 for(const route of ROUTES){
  const trace=ROUTE_TRACES[route];
  const visited=[...new Set(trace.paths.flat().filter(p=>typeof p==='string'))].sort();
  assert.deepEqual(visited,HUBS.filter(h=>h.routes.includes(route)).map(h=>h.id).sort(),route);
  for(const path of trace.paths){
   const points=tracePoints(path);assert.ok(points.length>1);
   for(const [x,y] of points)assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&x>0&&x<960&&y>0&&y<830,route);
   assert.ok(!pixelPath(points).includes('NaN'));
  }
 }
});
test('G stays east of Manhattan; A preserves its three southern branches',()=>{
 assert.ok(ROUTE_TRACES.G.paths.flatMap(tracePoints).every(([x])=>x>=490));
 const aEnds=ROUTE_TRACES.A.paths.map(path=>tracePoints(path).at(-1));
 assert.equal(aEnds.length,3);assert.equal(new Set(aEnds.map(p=>p?.join(','))).size,3);
});
