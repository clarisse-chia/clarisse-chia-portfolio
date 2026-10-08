import bindings from 'gtfs-realtime-bindings';
import { HUBS, normalizeRoute, stationForStop, type Arrival, type ArrivalResponse, type Hub } from '../src/data/transit.js';
import stops from './stops.json' with {type:'json'};
const {transit_realtime:rt}=bindings;
const names=stops as Record<string,string>;
export type Feed={header:{timestamp?:unknown};entity?:any[]};
export function seconds(value:unknown):number { if(value==null)return 0;const v=Number(String(value));return Number.isFinite(v)?v:0; }
export function parseFeed(feed:Feed,hub:Hub,now:number):Arrival[] {
 const rows:Arrival[]=[];const allowed=new Set(hub.stops);const unique=new Set<string>();
 for(const entity of feed.entity??[]){
  if(entity.isDeleted)continue;
  const update=entity.tripUpdate;const trip=update?.trip;
  if(!trip||[3,7].includes(trip.scheduleRelationship))continue;
  const route=normalizeRoute(trip.routeId??'');if(!route||!hub.routes.includes(route))continue;
  const updates=update.stopTimeUpdate??[];
  const last=[...updates].reverse().find((s:any)=>s.stopId&&s.scheduleRelationship!==1);
  const destination=last?names[last.stopId]??names[last.stopId.replace(/[NS]$/,'')]:undefined;
  for(const s of updates){
   if(s.scheduleRelationship===1||s.scheduleRelationship===2)continue;
   const stopId=s.stopId??'';if(!allowed.has(stopId.slice(0,-1)))continue;
   const station=stationForStop(hub,stopId);if(!station)continue;
   const direction=stopId.slice(-1);if(direction!=='N'&&direction!=='S')continue;
   const time=seconds(s.arrival?.time??s.departure?.time);
   if(time<now-20||time>now+7200)continue;
   const id=`${trip.tripId??entity.id}-${stopId}`;if(unique.has(id))continue;unique.add(id);
   rows.push({id,route,express:(trip.routeId??'').endsWith('X'),direction,destination:destination??`${direction==='N'?'Northbound':'Southbound'} · destination unavailable`,time,stopId,stationId:station.id,stationName:station.name});
  }
 }
 return rows.sort((a,b)=>a.time-b.time);
}
const cache=new Map<string,{at:number;promise:Promise<Feed>}>();
export function freshFeed(timestamp:number,now:number){return timestamp>0 && now-timestamp<=180 && timestamp<=now+60;}
async function getFeed(suffix:string):Promise<Feed>{
 const cached=cache.get(suffix);if(cached&&Date.now()-cached.at<25000)return cached.promise;
 const promise=(async()=>{const response=await fetch(`https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs${suffix}`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error(`MTA feed ${response.status}`);return rt.FeedMessage.decode(new Uint8Array(await response.arrayBuffer())) as unknown as Feed;})();
 cache.set(suffix,{at:Date.now(),promise});promise.catch(()=>{if(cache.get(suffix)?.promise===promise)cache.delete(suffix);});return promise;
}
export async function getArrivals(hubId:string):Promise<ArrivalResponse>{
 const hub=HUBS.find(h=>h.id===hubId);if(!hub)throw new Error('Unknown hub');
 const now=Math.floor(Date.now()/1000);const results=await Promise.allSettled(hub.feeds.map(getFeed));
 let missingFeeds=0;const timestamps:number[]=[];let arrivals:Arrival[]=[];
 for(const result of results){if(result.status==='rejected'){missingFeeds++;continue;}const ts=seconds(result.value.header.timestamp);if(!freshFeed(ts,now)){missingFeeds++;continue;}timestamps.push(ts);arrivals.push(...parseFeed(result.value,hub,now));}
 const seen=new Set<string>();arrivals=arrivals.filter(a=>{if(seen.has(a.id))return false;seen.add(a.id);return true;}).sort((a,b)=>a.time-b.time);
 return {hubId,arrivals,status:missingFeeds===hub.feeds.length?'unavailable':missingFeeds?'partial':'live',updatedAt:timestamps.length?Math.min(...timestamps):null,fetchedAt:now,missingFeeds,message:missingFeeds===hub.feeds.length?'The MTA feed is unavailable or out of date. Please try again shortly.':missingFeeds?'Some route feeds are unavailable. Only fresh predictions are shown.':undefined};
}
