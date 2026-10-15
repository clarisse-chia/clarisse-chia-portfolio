import {useEffect,useState} from 'react';
import type {ArrivalResponse} from '../data/transit';
import type {Journey,RideLeg} from '../data/journeyPlanner';
import {liveLegAvailable,timeJourney,journeyLegKey,type TimedJourney,type LiveStations} from '../data/liveJourneys';
// Unknown boardings may be explored, but a route is never displayed until every
// boarding has fresh evidence for its direction and downstream destination.
export default function useLiveJourneyPlans(generate:(allow?:(leg:RideLeg)=>boolean)=>Journey[],enabled:boolean,departureAt:number|null){
 const [result,setResult]=useState<{generate:typeof generate;departureAt:number|null;plans:TimedJourney[];busy:boolean}>({generate,departureAt,plans:[],busy:true});
 useEffect(()=>{if(!enabled){setResult({generate,departureAt,plans:[],busy:false});return;}let disposed=false;let controller:AbortController|undefined;
 async function check(){controller?.abort();const request=new AbortController();controller=request;setResult({generate,departureAt,plans:[],busy:true});const feeds:LiveStations={};const confirmed=new Map<string,TimedJourney>();const blocked=new Set<string>();
 try{for(let round=0;round<6;round++){if(request.signal.aborted)return;const now=Date.now()/1000;const depart=Math.max(now,departureAt??now);const candidates=generate(leg=>!blocked.has(journeyLegKey(leg))&&(!(leg.from in feeds)||liveLegAvailable(leg,feeds,now,depart)));
 const missing=[...new Set(candidates.flatMap(p=>p.legs.filter((l):l is RideLeg=>l.kind==='ride').map(l=>l.from)))].filter(id=>!(id in feeds)).slice(0,100);
 if(missing.length){
 const timeout=setTimeout(()=>request.abort(),15000);try{const response=await fetch(`/api/arrivals?stations=${missing.join(',')}`,{signal:request.signal});if(!response.ok)throw Error();const body=await response.json() as {stations:ArrivalResponse[]};if(!Array.isArray(body.stations))throw Error();for(const id of missing)feeds[id]=body.stations.find(f=>f.hubId===`station-${id}`&&Array.isArray(f.arrivals))??null;}finally{clearTimeout(timeout);}
 }
 const previousBlocked=blocked.size;for(const p of candidates){const timed=timeJourney(p,feeds,Date.now()/1000,depart,leg=>blocked.add(journeyLegKey(leg)));if(timed)confirmed.set(p.key,timed);}
 if(!missing.length&&blocked.size===previousBlocked)break;
 }}catch{confirmed.clear();}if(!disposed&&controller===request)setResult({generate,departureAt,plans:[...confirmed.values()].sort((a,b)=>a.seconds-b.seconds).slice(0,3),busy:false});}
 void check();const timer=setInterval(()=>{if(document.visibilityState==='visible')void check();},30000);return()=>{disposed=true;controller?.abort();clearInterval(timer);};},[generate,enabled,departureAt]);
 return result.generate===generate&&result.departureAt===departureAt?result:{plans:[],busy:enabled};
}
