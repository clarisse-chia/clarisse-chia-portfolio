import type {Arrival,ArrivalResponse} from './transit';
import {matchesFirstLeg,type Journey,type RideLeg} from './journeyPlanner';
export type LiveStations=Record<string,ArrivalResponse|null>;
export function liveLegAvailable(leg:RideLeg,feeds:LiveStations,now:number,after=now):boolean{
 const feed=feeds[leg.from];return !!feed&&feed.status!=='unavailable'&&!!feed.updatedAt&&now-feed.updatedAt<=180&&feed.updatedAt<=now+60&&feed.arrivals.some(a=>a.time>=after&&matchesFirstLeg(a,leg));
}
export function liveJourneyAvailable(plan:Journey,feeds:LiveStations,now:number):boolean{
 const first=plan.legs.findIndex(l=>l.kind==='ride');const approach=plan.legs.slice(0,Math.max(0,first)).reduce((sum,l)=>sum+l.seconds,0);
 return plan.legs.every((leg,i)=>leg.kind!=='ride'||liveLegAvailable(leg,feeds,now,now+(i===first?approach+120:0)));
}

export type RideTiming={train:Arrival;laterTrains:Arrival[];readyAt:number;boardAt:number;alightAt:number;waitSeconds:number;rideSeconds:number;estimatedRide:boolean};
export type TimedJourney=Journey&{timing:{departAt:number;arriveAt:number;walkSeconds:number;waitSeconds:number;rideSeconds:number;entrySeconds:number;rides:Record<number,RideTiming>}};
export function timeJourney(plan:Journey,feeds:LiveStations,now:number,departAt:number,onMissing?:(leg:RideLeg)=>void):TimedJourney|null{
 let at=Math.max(now,departAt),walkSeconds=0,waitSeconds=0,rideSeconds=0,first=true;const start=at;const rides:Record<number,RideTiming>={};const legs:Journey['legs']=[];
 const entrySeconds=plan.legs.some(l=>l.kind==='ride')?120:0;
 for(let i=0;i<plan.legs.length;i++){const leg=plan.legs[i];if(leg.kind!=='ride'){at+=leg.seconds;walkSeconds+=leg.seconds;legs.push(leg);continue;}
 if(first){at+=entrySeconds;walkSeconds+=entrySeconds;first=false;}
 if(!liveLegAvailable(leg,feeds,now,at)){onMissing?.(leg);return null;}
 const choices=feeds[leg.from]!.arrivals.filter(t=>t.time>=at&&matchesFirstLeg(t,leg)).map(train=>{const predicted=train.remainingTimes?.[leg.to];const valid=Number.isFinite(predicted)&&predicted!>=train.time;return {train,alightAt:valid?predicted!:train.time+leg.seconds,estimatedRide:!valid};}).sort((a,b)=>a.alightAt-b.alightAt||a.train.time-b.train.time);
 const choice=choices[0];if(!choice){onMissing?.(leg);return null;}
 const waiting=choice.train.time-at,riding=choice.alightAt-choice.train.time;
 const laterTrains=choices.map(c=>c.train).filter(t=>t.id!==choice.train.id&&t.time>choice.train.time).sort((a,b)=>a.time-b.time).slice(0,3);
 rides[i]={...choice,laterTrains,readyAt:at,boardAt:choice.train.time,waitSeconds:waiting,rideSeconds:riding};waitSeconds+=waiting;rideSeconds+=riding;at=choice.alightAt;legs.push({...leg,seconds:riding});
 }
 return {...plan,legs,seconds:walkSeconds+waitSeconds+rideSeconds,timing:{departAt:start,arriveAt:at,walkSeconds,waitSeconds,rideSeconds,entrySeconds,rides}};
}
export function journeyLegKey(leg:RideLeg){return `${leg.route}:${leg.direction}:${leg.from}:${leg.to}`;}
export function nycTime(time:number){return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}).format(new Date(time*1000));}
// Round the categories together so the visible minute breakdown sums to the total.
export function durationBreakdown(timing:TimedJourney['timing']){const values=[timing.walkSeconds,timing.waitSeconds,timing.rideSeconds].map(s=>s/60);const parts=values.map(Math.floor);const total=Math.ceil(values.reduce((a,b)=>a+b,0));const order=values.map((v,i)=>({i,f:v-parts[i]})).sort((a,b)=>b.f-a.f);let left=total-parts.reduce((a,b)=>a+b,0);for(let n=0;left>0;n++,left--)parts[order[n%3].i]++;return {walk:parts[0],wait:parts[1],ride:parts[2],total};}
