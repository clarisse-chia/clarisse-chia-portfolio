import {NETWORK_STATIONS,type NetworkStation} from './subwayNetwork.js';
export type JourneyLocation={kind:'station'|'address';id:string;label:string;lon:number;lat:number};
export type SuggestedExit={stationId:string;lat:number;lon:number;type:string;label:string;sourceDate:string};
export type WalkingConnection={exit?:SuggestedExit;stationId:string;seconds:number;meters:number;points:number[][];steps:{instruction:string;meters:number}[]};
export type WalkingResponse={from:WalkingConnection[];to:WalkingConnection[];partial:boolean};
export function stationLocation(s:NetworkStation):JourneyLocation{return {kind:'station',id:s.id,label:s.name,lon:s.lon,lat:s.lat};}
export function distanceMeters(a:{lon:number;lat:number},b:{lon:number;lat:number}){const rad=Math.PI/180,dlat=(b.lat-a.lat)*rad,dlon=(b.lon-a.lon)*rad;return 12742000*Math.asin(Math.sqrt(Math.min(1,Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2)));}
export function nearestStations(location:JourneyLocation){return NETWORK_STATIONS.map(s=>({s,d:distanceMeters(location,s)})).filter(s=>s.d<=2000).sort((a,b)=>a.d-b.d).slice(0,3).map(s=>s.s);}
export function validLocation(value:unknown):value is JourneyLocation{
 if(!value||typeof value!=='object')return false;const v=value as JourneyLocation;
 if(v.kind==='station')return NETWORK_STATIONS.some(s=>s.id===v.id);
 return v.kind==='address'&&typeof v.id==='string'&&v.id.startsWith('address:')&&v.id.length<=200&&typeof v.label==='string'&&v.label.length>0&&v.label.length<=250&&Number.isFinite(v.lon)&&Number.isFinite(v.lat)&&v.lon>=-74.26&&v.lon<=-73.69&&v.lat>=40.49&&v.lat<=40.93;
}
