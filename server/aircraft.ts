import {AIRPORTS,MAX_POSITION_AGE,NEAR_AIRPORT_NM,REFRESH_SECONDS,distanceNm,isOnMap,type Aircraft,type AircraftResponse} from '../src/data/airspace.js';
const ENDPOINT='https://api.adsb.lol/v2/point/40.72/-74.0/35';
const number=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const numeric=(v:unknown,min:number,max:number):number|null=>number(v)&&v>=min&&v<=max?v:null;
const text=(v:unknown,max:number)=>typeof v==='string'&&v.trim()?v.trim().slice(0,max):null;
export class AircraftFeedError extends Error {constructor(message:string,public retryAfter=60,public statusCode=503){super(message);}}
export function retryDelay(value:string|null,nowMs:number){
 if(value){const numericSeconds=Number(value);if(Number.isFinite(numericSeconds)&&numericSeconds>=0)return Math.max(60,Math.ceil(numericSeconds));const date=Date.parse(value);if(Number.isFinite(date))return Math.max(60,Math.ceil((date-nowMs)/1000));}
 return 300;
}
export function parseAircraftFeed(body:unknown,now:number):AircraftResponse{
 if(!body||typeof body!=='object')throw new AircraftFeedError('Aircraft feed is unavailable.');
 const feed=body as Record<string,unknown>;
 if(!number(feed.now)||!Array.isArray(feed.ac))throw new AircraftFeedError('Aircraft feed has an unexpected format.');
 // The v2 endpoint reports milliseconds; accept Unix seconds for compatible fixtures.
 const updatedAt=feed.now>1e12?feed.now/1000:feed.now;
 if(updatedAt<now-90||updatedAt>now+30)throw new AircraftFeedError('Aircraft feed is out of date.');
 const found=new Map<string,Aircraft>();
 for(const item of feed.ac){
  if(!item||typeof item!=='object')continue;const a=item as Record<string,unknown>;
  if(typeof a.hex!=='string'||!/^~?[a-f0-9]{6}$/i.test(a.hex))continue;
  if(!number(a.lat)||!number(a.lon)||a.lat< -90||a.lat>90||a.lon< -180||a.lon>180||!isOnMap(a.lat,a.lon))continue;
  if(!number(a.seen_pos)||a.seen_pos<0)continue;
  const observedAt=updatedAt-a.seen_pos;if(now-observedAt>MAX_POSITION_AGE||observedAt>now+30)continue;
  // Ground vehicles and aircraft on the surface are outside this airborne view.
  if(a.alt_baro==='ground'||['C1','C2','C3'].includes(String(a.category)))continue;
  const id=a.hex.toLowerCase();
  const candidate:Aircraft={id,callsign:text(a.flight,12)??id.toUpperCase(),registration:text(a.r,16),aircraftType:text(a.t,12),lat:a.lat,lon:a.lon,altitude:numeric(a.alt_baro,-1500,70000),speed:numeric(a.gs,0,1500),track:numeric(a.track,0,360),verticalRate:numeric(a.baro_rate,-20000,20000),observedAt,source:text(a.type,24)??'unknown',nearbyAirports:AIRPORTS.filter(p=>distanceNm(a.lat as number,a.lon as number,p.lat,p.lon)<=NEAR_AIRPORT_NM).map(p=>p.id)};
  const existing=found.get(id);if(!existing||candidate.observedAt>existing.observedAt)found.set(id,candidate);
 }
 const aircraft=[...found.values()].sort((a,b)=>a.callsign.localeCompare(b.callsign));
 return {status:'live',provider:'ADSB.lol',updatedAt,fetchedAt:now,refreshSeconds:REFRESH_SECONDS,aircraft};
}
export function createAircraftService(fetcher:typeof fetch=fetch,clock:()=>number=Date.now){
 let cached:{until:number;value:AircraftResponse}|undefined;
 let pending:Promise<AircraftResponse>|undefined;
 let blockedUntil=0,failures=0,lastError:AircraftFeedError|undefined;
 return async function get():Promise<AircraftResponse>{
  const now=clock();
  if(now<blockedUntil)throw new AircraftFeedError(lastError?.message??'Aircraft feed is taking a break.',Math.max(1,Math.ceil((blockedUntil-now)/1000)),lastError?.statusCode??503);
  if(cached&&now<cached.until)return cached.value;
  if(pending)return pending;
  pending=(async()=>{
   try{
    const response=await fetcher(ENDPOINT,{headers:{'User-Agent':'NYCObservatory/0.1 (personal portfolio prototype)','Accept':'application/json'},signal:AbortSignal.timeout(10000)});
    if(response.status===429||response.status===503)throw new AircraftFeedError(response.status===429?'The free aircraft feed asked us to slow down.':'The aircraft provider is temporarily unavailable.',retryDelay(response.headers.get('Retry-After'),clock()),response.status);
    if(!response.ok)throw new AircraftFeedError('The aircraft provider is temporarily unavailable.');
    const value=parseAircraftFeed(await response.json(),clock()/1000);
    cached={until:clock()+REFRESH_SECONDS*1000,value};failures=0;lastError=undefined;return value;
   }catch(error){
    failures++;
    const e=error instanceof AircraftFeedError?error:new AircraftFeedError('We could not reach the aircraft feed.');
    e.retryAfter=Math.max(e.retryAfter,Math.min(1200,60*2**Math.min(failures-1,5)));
    blockedUntil=clock()+e.retryAfter*1000;lastError=e;throw e;
   }finally{pending=undefined;}
  })();return pending;
 };
}
export const getAircraft=createAircraftService();
