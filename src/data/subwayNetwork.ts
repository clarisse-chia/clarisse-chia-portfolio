import stations from './subwayStations.json' with {type:'json'};
import {type Hub,type Route} from './transit.js';
export type NetworkStation={id:string;name:string;lat:number;lon:number;routes:Route[]};
export const NETWORK_STATIONS=stations as NetworkStation[];
const FEEDS:Record<Route,string>={'1':'','2':'','3':'','4':'','5':'','6':'','7':'',A:'-ace',C:'-ace',E:'-ace',B:'-bdfm',D:'-bdfm',F:'-bdfm',M:'-bdfm',G:'-g',J:'-jz',Z:'-jz',L:'-l',N:'-nqrw',Q:'-nqrw',R:'-nqrw',W:'-nqrw'};
export function networkHub(id:string):Hub|undefined {
 const s=NETWORK_STATIONS.find(s=>`station-${s.id}`===id);if(!s)return;
 return {id,name:s.name,shortName:s.name,borough:'NYC',routes:s.routes,stops:[s.id],feeds:[...new Set(s.routes.map(r=>FEEDS[r]))],stations:[{id:s.id,name:s.name,routes:s.routes,stops:[s.id],walkMinutes:0}],x:0,y:0,labelX:0,labelY:0,directions:{N:'Northbound platform',S:'Southbound platform'},note:'Station platforms are shown separately, including platforms in transfer complexes. Scheduled services may vary by time of day.'};
}
export function project(lon:number,lat:number):[number,number]{return [(lon+74.1)*2300,(40.92-lat)*2700];}

const WALK_METERS_PER_MINUTE=80, WALK_DETOUR_FACTOR=1.3;
export function walkingRadius(origin:{lon:number;lat:number},minutes:number):[number,number][]{
 if(minutes<=0)return [];
 const rad=Math.PI/180,lat=origin.lat*rad,lon=origin.lon*rad,d=minutes*WALK_METERS_PER_MINUTE/WALK_DETOUR_FACTOR/6371000;
 return Array.from({length:73},(_,i)=>{const bearing=i*2*Math.PI/72;const phi=Math.asin(Math.sin(lat)*Math.cos(d)+Math.cos(lat)*Math.sin(d)*Math.cos(bearing));const lambda=lon+Math.atan2(Math.sin(bearing)*Math.sin(d)*Math.cos(lat),Math.cos(d)-Math.sin(lat)*Math.sin(phi));return project(lambda/rad,phi/rad);});
}

// Proximity estimates only: 80 m/min with a 1.3 allowance for indirect streets.
// This does not calculate a walking route, entrances, or river crossings.
export function nearbyStations(origin:Pick<NetworkStation,'id'|'lat'|'lon'>,stations:NetworkStation[]=NETWORK_STATIONS){
 const rad=Math.PI/180;
 return stations.filter(s=>s.id!==origin.id).map(s=>{
  const dlat=(s.lat-origin.lat)*rad,dlon=(s.lon-origin.lon)*rad;
  const a=Math.sin(dlat/2)**2+Math.cos(origin.lat*rad)*Math.cos(s.lat*rad)*Math.sin(dlon/2)**2;
  const meters=6371000*2*Math.asin(Math.sqrt(Math.min(1,a)));
  return {station:s,meters,minutes:Math.max(1,Math.ceil(meters*WALK_DETOUR_FACTOR/WALK_METERS_PER_MINUTE))};
 }).filter(s=>s.minutes<=15).sort((a,b)=>a.meters-b.meters||a.station.id.localeCompare(b.station.id));
}
