export type AirportId='JFK'|'LGA'|'EWR';
export const AIRPORTS=[
 {id:'JFK' as const,name:'John F. Kennedy',lat:40.6398,lon:-73.7789},
 {id:'LGA' as const,name:'LaGuardia',lat:40.7769,lon:-73.8740},
 {id:'EWR' as const,name:'Newark Liberty',lat:40.6895,lon:-74.1745}
];
export const REFRESH_SECONDS=60;
export const MAX_POSITION_AGE=120;
export const NEAR_AIRPORT_NM=10;
export const RADAR_CENTER={lat:40.72,lon:-74};
export const PIXELS_PER_NM=650/36;
export function projectPosition(lat:number,lon:number):[number,number]{return [380+(lon-RADAR_CENTER.lon)*60*Math.cos(RADAR_CENTER.lat*Math.PI/180)*PIXELS_PER_NM,325-(lat-RADAR_CENTER.lat)*60*PIXELS_PER_NM];}
export function isOnMap(lat:number,lon:number){const [x,y]=projectPosition(lat,lon);return x>=16&&x<=744&&y>=16&&y<=634;}
export function distanceNm(lat1:number,lon1:number,lat2:number,lon2:number){const rad=Math.PI/180;const a=Math.sin((lat2-lat1)*rad/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin((lon2-lon1)*rad/2)**2;return 3440.065*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));}
export type Aircraft={id:string;callsign:string;registration:string|null;aircraftType:string|null;lat:number;lon:number;altitude:number|null;speed:number|null;track:number|null;verticalRate:number|null;observedAt:number;source:string;nearbyAirports:AirportId[]};
export type AircraftResponse={status:'live';provider:'ADSB.lol';updatedAt:number;fetchedAt:number;refreshSeconds:number;aircraft:Aircraft[]};
export function inAirportArea(a:Aircraft,airport:AirportId|'ALL'){return airport==='ALL'||a.nearbyAirports.includes(airport);}
export type Observation={lat:number;lon:number;altitude:number|null;observedAt:number};
export function appendObservation(previous:Observation[],a:Aircraft):Observation[]{
 const last=previous.at(-1);if(last&&a.observedAt<=last.observedAt)return previous;
 const recent=last&&a.observedAt-last.observedAt>150?[]:previous.filter(p=>a.observedAt-p.observedAt<=600);
 return [...recent,{lat:a.lat,lon:a.lon,altitude:a.altitude,observedAt:a.observedAt}].slice(-10);
}
