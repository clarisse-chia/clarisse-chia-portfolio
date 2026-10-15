import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAddresses} from '../server/addresses';
import {parseWalking,walkingConnections} from '../server/walking';
import {validLocation,nearestStations,type JourneyLocation} from '../src/data/journeyLocations';
import {addressJourneys,distinctJourneys,type Journey,type RideLeg} from '../src/data/journeyPlanner';
const origin:JourneyLocation={kind:'address',id:'address:test',label:'120 Broadway, Manhattan',lon:-74.010542,lat:40.708233};
const destination:JourneyLocation={kind:'station',id:'127',label:'Times Sq',lon:-73.987,lat:40.755};
function geometry(){return {features:[{geometry:{type:'LineString',coordinates:[[-74.010542,40.708233],[-74.009,40.71]]},properties:{summary:{duration:240,distance:300},segments:[{steps:[{instruction:'Head north',distance:300}]}]}}]};}
test('NYC addresses are bounded, have borough labels, and nearest candidates are capped at three',()=>{
 assert.equal(validLocation(origin),true);assert.equal(validLocation({...origin,lon:-75}),false);assert.equal(validLocation({kind:'station',id:'invalid'}),false);assert.equal(nearestStations(origin).length,3);
 const feature={geometry:{type:'Point',coordinates:[origin.lon,origin.lat]},properties:{gid:'test',label:'120 Broadway',name:'120 Broadway',borough:'Manhattan'}};
 assert.equal(parseAddresses({features:[feature]}).length,1);assert.match(parseAddresses({features:[feature]})[0].label,/Manhattan/);assert.equal(parseAddresses({features:[{...feature,properties:{...feature.properties,borough:'New Jersey'}}]}).length,0);
});
test('walking responses need valid geometry and cannot disguise excessive detours as nearby',()=>{assert.equal(parseWalking(geometry(),'229').seconds,240);assert.throws(()=>parseWalking({},'229'));const far=geometry();far.features[0].properties.summary.duration=1900;assert.throws(()=>parseWalking(far,'229'));});
test('address itineraries include walking time, geometry and destination',()=>{
 const walking=parseWalking(geometry(),'138');const plans=addressJourneys(origin,destination,{from:[walking],to:[{stationId:'127',seconds:0,meters:0,points:[],steps:[]}],partial:false});assert.ok(plans.length);for(const p of plans){assert.equal(p.legs[0].kind,'walk');assert.equal(p.legs[0].from,origin.id);assert.equal(p.legs.at(-1)?.to,'127');assert.equal(p.seconds,p.legs.reduce((n,l)=>n+l.seconds,0));}
});
test('walking service requires a key, coalesces/cache-hits and stops on provider rate limits',async()=>{
 const oldKey=process.env.ORS_API_KEY,oldFetch=globalThis.fetch;let calls=0;
 try{delete process.env.ORS_API_KEY;await assert.rejects(walkingConnections(origin,destination),/not connected/);process.env.ORS_API_KEY='test-key';globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify(geometry()),{status:200});};
 await Promise.all([walkingConnections(origin,destination),walkingConnections(origin,destination)]);assert.equal(calls,3);await walkingConnections(origin,destination);assert.equal(calls,3);
 globalThis.fetch=async()=>{calls++;return new Response('{}',{status:429,headers:{'Retry-After':'60'}});};const other={...origin,id:'address:other',lat:40.709};await assert.rejects(walkingConnections(other,destination),/limit/);const capped=calls;await assert.rejects(walkingConnections({...other,lat:40.71},destination),/limit/);assert.equal(calls,capped);
 }finally{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.ORS_API_KEY;else process.env.ORS_API_KEY=oldKey;}
});

test('equivalent rides prefer verified direct access and preserve different train routes',()=>{
 const ride:RideLeg={kind:'ride',from:'F09',to:'F15',route:'F',direction:'S',headsign:'Coney Island',stops:['F09','F15'],seconds:1200,points:[]};
 const direct:Journey={legs:[ride],seconds:1500,changes:0,stops:1,key:'direct'};
 const detour:Journey={...direct,key:'detour',seconds:1400,legs:[{kind:'transfer',from:'719',to:'F09',seconds:180},ride]};
 const exitDetour:Journey={...direct,key:'exit',seconds:1600,legs:[ride,{kind:'transfer',from:'F15',to:'M18',seconds:180}]};
 const other:Journey={...direct,key:'other',seconds:1700,legs:[{...ride,route:'E'}]};
 const result=distinctJourneys([detour,exitDetour,direct,other]);assert.deepEqual(result.map(p=>p.key),['direct','other']);
 assert.equal(distinctJourneys([detour])[0],detour,'retain a verified transfer when no direct street walk exists');
});
