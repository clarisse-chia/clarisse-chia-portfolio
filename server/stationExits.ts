import data from './subwayExits.json' with {type:'json'};
import {distanceMeters,type SuggestedExit} from '../src/data/journeyLocations.js';
import {NETWORK_STATIONS} from '../src/data/subwayNetwork.js';
type ExitRecord={stationId:string;lat:number;lon:number;type:string};
// Only exit-enabled rows are bundled. Do not borrow exits from other platforms
// or other stations in a transfer complex: interior connections are unknown.
export function suggestExit(stationId:string,destination:{lat:number;lon:number},exits:ExitRecord[]=data.exits):SuggestedExit|undefined{
 const station=NETWORK_STATIONS.find(s=>s.id===stationId);if(!station)return;
 const candidates=exits.filter(e=>e.stationId===stationId&&Number.isFinite(e.lat)&&Number.isFinite(e.lon)&&distanceMeters(e,station)<1000);
 const exit=candidates.sort((a,b)=>distanceMeters(a,destination)-distanceMeters(b,destination))[0];if(!exit)return;
 const angle=Math.atan2((exit.lon-station.lon)*Math.cos(station.lat*Math.PI/180),exit.lat-station.lat)*180/Math.PI;
 const side=['North','Northeast','East','Southeast','South','Southwest','West','Northwest'][Math.round((angle+360)/45)%8];
 return {...exit,label:`${side} side · ${exit.type.toLowerCase()}`,sourceDate:data.retrievedAt};
}
