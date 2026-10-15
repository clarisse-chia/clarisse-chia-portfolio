import {suggestExit} from './stationExits.js';
import {NETWORK_STATIONS} from '../src/data/subwayNetwork.js';
import {nearestStations,stationLocation,type JourneyLocation,type WalkingConnection,type WalkingResponse} from '../src/data/journeyLocations.js';
export class WalkingError extends Error{constructor(public status:number,message:string){super(message);}}
// These are per-instance safeguards, not a distributed account quota counter.
// The provider's free-account quota remains the global limit across deployments.
const cache=new Map<string,{at:number;value:WalkingConnection}>(),pending=new Map<string,Promise<WalkingConnection>>();
let requests:number[]=[],blockedUntil=0;
export function parseWalking(data:any,stationId:string):WalkingConnection{
 const feature=data?.features?.[0],summary=feature?.properties?.summary,points=feature?.geometry?.coordinates;
 if(feature?.geometry?.type!=='LineString'||!Array.isArray(points)||points.length<2||points.some((p:any)=>!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1]))||!Number.isFinite(summary?.duration)||summary.duration<0||!Number.isFinite(summary?.distance)||summary.distance<0)throw new WalkingError(502,'Walking directions returned an incomplete route.');
 if(summary.duration>1800||summary.distance>3000)throw new WalkingError(422,'No nearby station within a 30-minute street walk.');
 const steps=(feature.properties.segments??[]).flatMap((s:any)=>s.steps??[]).filter((s:any)=>typeof s.instruction==='string'&&Number.isFinite(s.distance)).map((s:any)=>({instruction:s.instruction,meters:s.distance}));
 return {stationId,seconds:Math.ceil(summary.duration),meters:Math.round(summary.distance),points,steps};
}
async function walk(location:JourneyLocation,stationId:string,outbound:boolean):Promise<WalkingConnection>{
 const station=NETWORK_STATIONS.find(s=>s.id===stationId)!;const exit=outbound?undefined:suggestExit(stationId,location);const stationPoint=exit??stationLocation(station),a=outbound?location:stationPoint,b=outbound?stationPoint:location;
 const key=`${a.lon.toFixed(6)},${a.lat.toFixed(6)}:${b.lon.toFixed(6)},${b.lat.toFixed(6)}:${stationId}`;
 const hit=cache.get(key);if(hit&&Date.now()-hit.at<86400000)return hit.value;const existing=pending.get(key);if(existing)return existing;
 const job=(async()=>{const apiKey=process.env.ORS_API_KEY?.trim();if(!apiKey)throw new WalkingError(503,'Walking directions are not connected yet. Station-to-station planning still works.');const now=Date.now();requests=requests.filter(t=>now-t<86400000);if(now<blockedUntil||requests.length>=1800||requests.filter(t=>now-t<60000).length>=30)throw new WalkingError(429,'The free walking service is at its request limit. Please try later, or choose stations.');requests.push(now);
 const response=await fetch('https://api.heigit.org/openrouteservice/v2/directions/foot-walking/geojson',{method:'POST',headers:{Authorization:apiKey,'Content-Type':'application/json'},body:JSON.stringify({coordinates:[[a.lon,a.lat],[b.lon,b.lat]],instructions:true,radiuses:exit?[30,150]:[100,150]}),signal:AbortSignal.timeout(12000)});
 if(response.status===429||response.status===403){const retry=Number(response.headers.get('retry-after'));blockedUntil=Date.now()+(Number.isFinite(retry)&&retry>0?Math.min(retry,86400):response.status===403?3600:60)*1000;throw new WalkingError(response.status===403?503:429,'The free walking service is unavailable or at its limit. Please try later, or choose stations.');}
 if(!response.ok)throw new WalkingError(response.status===404?422:502,'A walking connection could not be found. Try a nearby address or choose a station.');
 const value=parseWalking(await response.json(),stationId);if(exit&&value.points.length&&Math.hypot(value.points[0][0]-exit.lon,value.points[0][1]-exit.lat)<0.0004)value.exit=exit;if(cache.size>=500)cache.delete(cache.keys().next().value!);cache.set(key,{at:Date.now(),value});return value;})();pending.set(key,job);try{return await job;}finally{pending.delete(key);}
}
export async function walkingConnections(from:JourneyLocation,to:JourneyLocation):Promise<WalkingResponse>{
 const candidates=(l:JourneyLocation)=>l.kind==='station'?NETWORK_STATIONS.filter(s=>s.id===l.id):nearestStations(l);
 const origins=candidates(from),destinations=candidates(to);if(!origins.length||!destinations.length)throw new WalkingError(422,'No subway station close enough to this address. Try a station or an address nearer the subway.');
 let partial=false;
 async function side(location:JourneyLocation,stations:typeof origins,outbound:boolean){if(location.kind==='station')return [{stationId:location.id,seconds:0,meters:0,points:[],steps:[]}];const results=await Promise.allSettled(stations.map(s=>walk(location,s.id,outbound)));const good=results.flatMap(r=>r.status==='fulfilled'?[r.value]:[]);if(good.length<results.length)partial=true;if(!good.length){const reason=results.find(r=>r.status==='rejected') as PromiseRejectedResult;throw reason.reason;}return good;}
 const [a,b]=await Promise.all([side(from,origins,true),side(to,destinations,false)]);return {from:a,to:b,partial};
}
