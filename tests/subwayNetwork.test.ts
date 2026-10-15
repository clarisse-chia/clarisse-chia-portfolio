import test from 'node:test';
import assert from 'node:assert/strict';
import {NETWORK_STATIONS,networkHub,project,nearbyStations} from '../src/data/subwayNetwork';
import {ROUTES} from '../src/data/transit';
import geometry from '../src/data/subwayGeometry.json';
import {parseFeed} from '../server/transit';
test('all 22 routes have geometry and selectable stations, excluding shuttle and rail services',()=>{
 assert.deepEqual([...new Set(geometry.tracks.flatMap(t=>t.routes))].sort(),[...ROUTES].sort());
 assert.deepEqual([...new Set(NETWORK_STATIONS.flatMap(s=>s.routes))].sort(),[...ROUTES].sort());
 assert.equal(new Set(NETWORK_STATIONS.map(s=>s.id)).size,NETWORK_STATIONS.length);
 for(const s of NETWORK_STATIONS){const [x,y]=project(s.lon,s.lat);assert.ok(x>=0&&x<=1000&&y>=0&&y<=1000,s.name);assert.ok(networkHub(`station-${s.id}`)?.feeds.length,s.id);}
});
test('new full-network stop only returns its own live platform predictions',()=>{
 const now=1800000000,hub=networkHub('station-G26')!;assert.ok(hub);assert.ok(hub.routes.includes('G'));
 const result=parseFeed({header:{timestamp:now},entity:[{id:'g',tripUpdate:{trip:{tripId:'g1',routeId:'G'},stopTimeUpdate:[{stopId:'G26N',arrival:{time:now+90}},{stopId:'G28N',arrival:{time:now+180}},{stopId:'G22N',arrival:{time:now+900}}]}}]},hub,now);
 assert.equal(result.length,1);assert.equal(result[0].stationId,'G26');assert.equal(result[0].time,now+90);
 assert.equal(networkHub('station-invalid'),undefined);assert.equal(networkHub('station-127N'),undefined);
});

test('walking estimates exclude the selected stop, sort by distance and bound results to 15 minutes',()=>{
 const origin={id:'origin',name:'Origin',lat:40.75,lon:-74,routes:['G'] as const};
 const base={...origin,routes:[...origin.routes]};
 const candidates=[base,{...base,id:'near',lat:40.752},{...base,id:'middle',lat:40.755},{...base,id:'far',lat:40.758},{...base,id:'outside',lat:40.77}];
 const result=nearbyStations(base,candidates);
 assert.deepEqual(result.map(s=>s.station.id),['near','middle','far']);
 assert.ok(result[0].minutes<=5);assert.ok(result[1].minutes>5&&result[1].minutes<=10);assert.ok(result[2].minutes>10&&result[2].minutes<=15);
 assert.equal(nearbyStations(base,[base]).length,0);
});
