import type {JourneyLocation,WalkingResponse,WalkingConnection,SuggestedExit} from './journeyLocations.js';
import data from './subwayJourneys.json';
import {NETWORK_STATIONS} from './subwayNetwork';
import type {Arrival,Route} from './transit';
export type RideLeg={kind:'ride';from:string;to:string;route:Route;direction:string;headsign:string;stops:string[];seconds:number;points:number[][]};
export type TransferLeg={kind:'transfer';from:string;to:string;seconds:number};
export type WalkLeg={exit?:SuggestedExit;kind:'walk';from:string;to:string;fromLabel:string;toLabel:string;seconds:number;meters:number;points:number[][];steps:{instruction:string;meters:number}[]};
export type Journey={legs:(RideLeg|TransferLeg|WalkLeg)[];seconds:number;changes:number;stops:number;key:string};
const ids=new Set(NETWORK_STATIONS.map(s=>s.id));
const boardings=new Map<string,{pattern:number;index:number}[]>();
data.patterns.forEach((p,pattern)=>p.stops.forEach((id,index)=>{if(index<p.stops.length-1)boardings.set(id,[...(boardings.get(id)??[]),{pattern,index}]);}));
const transfers=new Map<string,TransferLeg[]>();
data.transfers.filter(t=>t.from!==t.to).forEach(t=>transfers.set(t.from,[...(transfers.get(t.from)??[]),{kind:'transfer',...t}]));
const selfTransfer=new Map(data.transfers.filter(t=>t.from===t.to).map(t=>[t.from,t.seconds]));
function search(from:string,to:string,boardingPenalty:number,allowRide?:(leg:RideLeg)=>boolean):Journey|null{
 const dist=new Map([[from,0]]),previous=new Map<string,{id:string;leg:RideLeg|TransferLeg}>(),done=new Set<string>();
 while(true){let current='',cost=Infinity;for(const [id,d] of dist)if(!done.has(id)&&d<cost){current=id;cost=d;}if(!current)return null;if(current===to)break;done.add(current);
 const relax=(next:string,leg:RideLeg|TransferLeg,extra:number)=>{if(leg.kind==='ride'&&allowRide&&!allowRide(leg))return;const d=cost+leg.seconds+extra;if(d<(dist.get(next)??Infinity)){dist.set(next,d);previous.set(next,{id:current,leg});}};
 for(const t of transfers.get(current)??[])relax(t.to,t,0);
 for(const b of boardings.get(current)??[]){const p=data.patterns[b.pattern];let seconds=0;for(let j=b.index+1;j<p.stops.length;j++){seconds+=p.seconds[j-1];relax(p.stops[j],{kind:'ride',from:current,to:p.stops[j],route:p.route as Route,direction:p.direction,headsign:p.headsign,seconds,stops:p.stops.slice(b.index,j+1),points:data.shapes[p.shape].slice(p.indices[b.index],p.indices[j]+1)},boardingPenalty);}}
 }
 const legs:(RideLeg|TransferLeg)[]=[];let at=to;while(at!==from){const prev=previous.get(at);if(!prev)return null;legs.unshift(prev.leg);at=prev.id;}
 for(let i=legs.length-1;i>0;i--){if(legs[i].kind==='ride'&&legs[i-1].kind==='ride')legs.splice(i,0,{kind:'transfer',from:legs[i].from,to:legs[i].from,seconds:selfTransfer.get(legs[i].from)??180});}
 const rides=legs.filter((l):l is RideLeg=>l.kind==='ride');
 return {legs,seconds:legs.reduce((n,l)=>n+l.seconds,0),changes:Math.max(0,rides.length-1),stops:rides.reduce((n,l)=>n+l.stops.length-1,0),key:legs.map(l=>`${l.kind}:${l.kind==='ride'?l.route:''}:${l.from}:${l.to}`).join('|')};
}
export function planJourneys(from:string,to:string,allowRide?:(leg:RideLeg)=>boolean):Journey[]{
 if(from===to||!ids.has(from)||!ids.has(to))return [];
 const results=[search(from,to,240,allowRide),search(from,to,1200,allowRide)].filter((p):p is Journey=>!!p);
 return [...new Map(results.map(p=>[p.key,p])).values()];
}
export function matchesFirstLeg(arrival:Arrival,leg:RideLeg){return arrival.route===leg.route&&arrival.stopId===`${leg.from}${leg.direction}`&&!!arrival.remainingStops?.includes(leg.to);}

export function addressJourneys(from:JourneyLocation,to:JourneyLocation,connections:WalkingResponse,allowRide?:(leg:RideLeg)=>boolean):Journey[]{
 const results:Journey[]=[];
 const walkLeg=(location:JourneyLocation,c:WalkingConnection,outbound:boolean):WalkLeg=>({kind:'walk',exit:outbound?undefined:c.exit,from:outbound?location.id:c.stationId,to:outbound?c.stationId:location.id,fromLabel:outbound?location.label:NETWORK_STATIONS.find(s=>s.id===c.stationId)!.name,toLabel:outbound?NETWORK_STATIONS.find(s=>s.id===c.stationId)!.name:location.label,seconds:c.seconds,meters:c.meters,points:c.points,steps:c.steps});
 for(const a of connections.from)for(const b of connections.to){const rides=a.stationId===b.stationId?[{legs:[],seconds:0,changes:0,stops:0,key:'same-station'} as Journey]:planJourneys(a.stationId,b.stationId,allowRide);
  for(const ride of rides){const legs:Journey['legs']=[...(from.kind==='address'?[walkLeg(from,a,true)]:[]),...ride.legs,...(to.kind==='address'?[walkLeg(to,b,false)]:[])];results.push({...ride,legs,seconds:ride.seconds+a.seconds+b.seconds,key:`${a.stationId}:${ride.key}:${b.stationId}`});}
 }
 return distinctJourneys(results);
}

// Station-complex access paths are not separate subway routes. Keep the simplest
// verified access path for an identical sequence of rides; never invent a walk.
export function distinctJourneys(results:Journey[]):Journey[]{
 const edgeTransfers=(p:Journey)=>{const first=p.legs.findIndex(l=>l.kind==='ride');let last=-1;p.legs.forEach((l,i)=>{if(l.kind==='ride')last=i;});return p.legs.filter((l,i)=>l.kind==='transfer'&&(i<first||i>last)).length;};
 const groups=new Map<string,Journey>();
 for(const p of results){const rides=p.legs.filter((l):l is RideLeg=>l.kind==='ride');const key=rides.length?rides.map(l=>`${l.route}:${l.direction}:${l.from}:${l.to}`).join('|'):'walking';const old=groups.get(key);
 if(!old||edgeTransfers(p)<edgeTransfers(old)||(edgeTransfers(p)===edgeTransfers(old)&&p.seconds<old.seconds))groups.set(key,p);
 }
 return [...groups.values()].sort((a,b)=>(a.seconds+a.changes*240)-(b.seconds+b.changes*240)).slice(0,3);
}
