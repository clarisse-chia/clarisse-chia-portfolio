import test from 'node:test';
import assert from 'node:assert/strict';
import {travelDirection} from '../server/subwayDirection';
test('Manhattan trains show uptown or downtown plus next borough',()=>{
 assert.equal(travelDirection('127N',['126N','101N'],'1'),'Uptown · Bronx-bound');
 assert.equal(travelDirection('127S',['128S','138S'],'1'),'Downtown');
 assert.equal(travelDirection('127S',['128S','247S'],'2'),'Downtown · Brooklyn-bound');
});
test('crosstown and G trains use borough directions instead of generic uptown',()=>{
 assert.equal(travelDirection('725N',['724N','718N','701N'],'7'),'Queens-bound');
 assert.equal(travelDirection('718S',['724S','726S'],'7'),'Manhattan-bound');
 assert.equal(travelDirection('G26N',['G22N'],'G'),'Queens-bound');
 assert.equal(travelDirection('G22S',['G26S','A42S'],'G'),'Brooklyn-bound');
 assert.equal(travelDirection('L03S',['L05S','L10S'],'L'),'Brooklyn-bound');
 assert.equal(travelDirection('F12N',['F09N','G14N'],'F'),'Queens-bound');
});
test('unknown or terminating trips do not invent a direction',()=>{
 assert.equal(travelDirection('unknown',[],'A'),'Toward terminal');
 assert.equal(travelDirection('127N',[],'1'),'Toward terminal');
});
