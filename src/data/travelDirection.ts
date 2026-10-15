import boroughs from './boroughs.json' with {type:'json'};
import {NETWORK_STATIONS} from './subwayNetwork.js';
import type {Route} from './transit.js';
function inside(lon:number,lat:number,ring:number[][]){let result=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [x,y]=ring[i],[px,py]=ring[j];if((y>lat)!==(py>lat)&&lon<(px-x)*(lat-y)/(py-y)+x)result=!result;}return result;}
const stations=new Map(NETWORK_STATIONS.map(s=>[s.id,{...s,borough:boroughs.find(b=>b.rings.some(r=>inside(s.lon,s.lat,r)))?.name}]));
export function travelDirection(stopId:string,remainingStops:string[],route:Route):string {
 const origin=stations.get(stopId.replace(/[NS]$/,''));
 const future=remainingStops.map(id=>stations.get(id.replace(/[NS]$/,''))).filter(s=>s&&s.id!==origin?.id);
 if(!origin||!future.length)return 'Toward terminal';
 // Use the next borough actually present in this trip, not a route-wide assumption.
 const nextBorough=future.find(s=>s?.borough&&s.borough!==origin.borough)?.borough;
 if(origin.borough==='Manhattan'&&!['7','L'].includes(route)&&future[0]?.borough!=='Queens'){
  const next=future.find(s=>s&&Math.abs(s.lat-origin.lat)>.0002);
  const local=next?(next.lat>origin.lat?'Uptown':'Downtown'):null;
  if(local)return nextBorough?`${local} · ${nextBorough==='The Bronx'?'Bronx':nextBorough}-bound`:local;
 }
 const borough=nextBorough??future.at(-1)?.borough;
 return borough?`${borough==='The Bronx'?'Bronx':borough}-bound`:'Toward terminal';
}
