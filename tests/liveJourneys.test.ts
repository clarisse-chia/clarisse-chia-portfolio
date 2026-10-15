import test from 'node:test';
import assert from 'node:assert/strict';
import {liveLegAvailable,liveJourneyAvailable,timeJourney,durationBreakdown} from '../src/data/liveJourneys';
import {planJourneys,type RideLeg,type Journey} from '../src/data/journeyPlanner';
import type {ArrivalResponse} from '../src/data/transit';
const leg:RideLeg={kind:'ride',route:'N',from:'R09',to:'R21',direction:'S',headsign:'Coney Island',seconds:900,stops:['R09','R21'],points:[]};
const now=10000;
const feed=(route='N',remainingStops=['R21'])=>({status:'live',updatedAt:now,arrivals:[{route,stopId:'R09S',time:now+600,remainingStops}]} as ArrivalResponse);
test('a line running without serving the destination cannot validate a journey leg',()=>{
 assert.equal(liveLegAvailable(leg,{R09:feed('N',['R20'])},now),false);
 assert.equal(liveLegAvailable(leg,{R09:feed()},now),true);
 assert.equal(liveLegAvailable(leg,{R09:{...feed(),updatedAt:now-181}},now),false);
 assert.equal(liveLegAvailable(leg,{},now),false);
});
test('every leg must have evidence and the first train must allow approach time',()=>{
 const plan:Journey={legs:[leg,{...leg,from:'missing'}],seconds:1800,changes:1,stops:2,key:'test'};
 assert.equal(liveJourneyAvailable(plan,{R09:feed()},now),false);
 assert.equal(liveJourneyAvailable({...plan,legs:[leg]},{R09:feed()},now),true);
 assert.equal(liveLegAvailable(leg,{R09:feed()},now,now+601),false);
});
test('search can replace a disallowed local 4 with a different route',()=>{
 const plans=planJourneys('F09','634',l=>l.route!=='4');assert.ok(plans.length);
 assert.ok(plans.every(p=>p.legs.every(l=>l.kind!=='ride'||l.route!=='4')));
 assert.deepEqual(planJourneys('F09','634',()=>false),[]);
});

const arrival=(id:string,from:string,to:string,board:number,alight:number)=>({id,route:'N' as const,express:false,direction:'S' as const,destination:'Test terminal',stationId:from,stationName:from,stopId:`${from}S`,time:now+board,remainingStops:[to],remainingTimes:{[to]:now+alight}});
test('total includes approach, entry, waits, transfer walks and rides in sequence',()=>{
 const second={...leg,from:'R21',to:'R22'};
 const walk={kind:'walk' as const,from:'address:a',to:'R09',fromLabel:'A',toLabel:'R09',seconds:180,meters:200,points:[],steps:[]};
 const p:Journey={legs:[walk,leg,{kind:'transfer',from:'R21',to:'R21',seconds:180},second,{...walk,from:'R22',to:'address:b',seconds:60}],seconds:0,changes:1,stops:2,key:'two'};
 const feeds={R09:{...feed(),arrivals:[arrival('first','R09','R21',600,900)]},R21:{...feed(),arrivals:[arrival('miss','R21','R22',1050,1350),arrival('catch','R21','R22',1200,1500)]}} as Record<string,ArrivalResponse>;
 const result=timeJourney(p,feeds,now,now)!;assert.ok(result);assert.equal(result.timing.rides[3].train.id,'catch');assert.equal(result.timing.walkSeconds,540);assert.equal(result.timing.waitSeconds,420);assert.equal(result.timing.rideSeconds,600);assert.equal(result.seconds,1560);assert.equal(result.timing.arriveAt,now+1560);assert.equal(result.seconds,result.timing.arriveAt-result.timing.departAt);
 const display=durationBreakdown(result.timing);assert.equal(display.total,display.walk+display.wait+display.ride);
});
test('delaying departure chooses a later train and fails honestly outside prediction coverage',()=>{
 const p:Journey={legs:[leg],seconds:900,changes:0,stops:1,key:'one'};
 const feeds={R09:{...feed(),arrivals:[arrival('now','R09','R21',600,900),arrival('later','R09','R21',1200,1500)]}} as Record<string,ArrivalResponse>;
 assert.equal(timeJourney(p,feeds,now,now)!.timing.rides[0].train.id,'now');
 const later=timeJourney(p,feeds,now,now+900)!;assert.equal(later.timing.rides[0].train.id,'later');assert.equal(later.seconds,600);assert.equal(later.timing.departAt,now+900);
 assert.equal(timeJourney(p,feeds,now,now+1800),null);
 const withoutPrediction={R09:{...feed(),arrivals:[{...arrival('estimate','R09','R21',600,900),remainingTimes:undefined}]}} as Record<string,ArrivalResponse>;
 assert.equal(timeJourney(p,withoutPrediction,now,now)!.timing.rides[0].estimatedRide,true);
});

test('backup trains depart later and still match direction and destination',()=>{
 const p:Journey={legs:[leg],seconds:900,changes:0,stops:1,key:'backup'};
 const trains=[arrival('planned','R09','R21',600,900),arrival('later','R09','R21',1000,1300),arrival('skips-stop','R09','R20',1100,1400),{...arrival('wrong-way','R09','R21',1200,1500),stopId:'R09N'},arrival('last','R09','R21',1400,1700)];
 const result=timeJourney(p,{R09:{...feed(),arrivals:trains}},now,now)!;
 assert.deepEqual(result.timing.rides[0].laterTrains.map(t=>t.id),['later','last']);assert.equal(result.seconds,900);
});
