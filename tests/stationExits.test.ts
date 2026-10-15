import test from 'node:test';
import assert from 'node:assert/strict';
import {suggestExit} from '../server/stationExits';
import {addressJourneys} from '../src/data/journeyPlanner';
import {stationLocation} from '../src/data/journeyLocations';
import {NETWORK_STATIONS} from '../src/data/subwayNetwork';
test('exit suggestions stay at the exact station and choose the closest listed exit',()=>{
 const destination={lat:40.7182,lon:-73.9882};const exits=[{stationId:'F15',lat:40.7189,lon:-73.9878,type:'Stair'},{stationId:'F15',lat:40.7181,lon:-73.9883,type:'Stair'},{stationId:'M18',...destination,type:'Stair'}];
 assert.equal(suggestExit('F15',destination,exits)?.lon,-73.9883);
 assert.equal(suggestExit('F15',destination,[]),undefined);
 assert.equal(suggestExit('missing',destination,exits),undefined);
 assert.equal(suggestExit('F15',destination,[{stationId:'F15',lat:0,lon:0,type:'Stair'}]),undefined);
});
test('the exit and routed street walk survive into the final itinerary',()=>{
 const from=stationLocation(NETWORK_STATIONS.find(s=>s.id==='F09')!);const to={kind:'address' as const,id:'address:test',label:'Test address',lat:40.7182,lon:-73.9882};const exit=suggestExit('F15',to)!;
 const points=[[exit.lon,exit.lat],[to.lon,to.lat]];const result=addressJourneys(from,to,{from:[{stationId:from.id,seconds:0,meters:0,points:[],steps:[]}],to:[{stationId:'F15',seconds:60,meters:75,points,steps:[],exit}],partial:false});
 assert.ok(result.length);for(const plan of result){const last=plan.legs.at(-1)!;assert.equal(last.kind,'walk');if(last.kind==='walk'){assert.deepEqual(last.exit,exit);assert.deepEqual(last.points,points);}}
});
