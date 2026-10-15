import test from 'node:test';
import assert from 'node:assert/strict';
import {planJourneys,matchesFirstLeg,type RideLeg} from '../src/data/journeyPlanner';
import data from '../src/data/subwayJourneys.json';
import type {Arrival} from '../src/data/transit';
test('same and unknown stations do not create journeys',()=>{assert.deepEqual(planJourneys('127','127'),[]);assert.deepEqual(planJourneys('missing','127'),[]);});
test('direct option and reverse option follow directed stop patterns',()=>{
 for(const [from,to] of [['127','138'],['138','127']]){const plan=planJourneys(from,to).find(p=>p.changes===0);assert.ok(plan);assert.equal(plan.legs[0].from,from);assert.equal(plan.legs.at(-1)?.to,to);assert.ok(plan.seconds>0);}
});
test('G to L itinerary uses a documented transfer and continuous legs',()=>{
 const plans=planJourneys('G26','L03');assert.ok(plans.length);for(const plan of plans){assert.equal(plan.legs[0].from,'G26');assert.equal(plan.legs.at(-1)?.to,'L03');assert.ok(plan.changes>=1);for(let i=0;i<plan.legs.length;i++){const leg=plan.legs[i];if(i)assert.equal(plan.legs[i-1].to,leg.from);if(leg.kind==='transfer')assert.ok(data.transfers.some(t=>t.from===leg.from&&t.to===leg.to));else if(leg.kind==='ride'){assert.ok(leg.points.length>1);assert.ok(data.patterns.some(p=>p.route===leg.route&&p.stops.join(',').includes(leg.stops.join(','))));}}assert.equal(plan.seconds,plan.legs.reduce((n,l)=>n+l.seconds,0));}
});
test('same-station train changes include platform transfer time',()=>{const p=planJourneys('127','138').find(p=>p.changes>0);assert.ok(p);assert.ok(p.legs.some(l=>l.kind==='transfer'&&l.from===l.to&&l.seconds>0));});
test('live boarding match requires correct direction and confirmed downstream stop',()=>{
 const leg=planJourneys('127','138').find(p=>p.changes===0)!.legs.find((l):l is RideLeg=>l.kind==='ride')!;
 const a={route:leg.route,stopId:`${leg.from}${leg.direction}`,remainingStops:[leg.to]} as Arrival;
 assert.ok(matchesFirstLeg(a,leg));assert.equal(matchesFirstLeg({...a,remainingStops:[]},leg),false);assert.equal(matchesFirstLeg({...a,stopId:`${leg.from}${leg.direction==='N'?'S':'N'}`},leg),false);
});
