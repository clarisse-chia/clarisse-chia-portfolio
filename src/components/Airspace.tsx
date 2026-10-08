import {useEffect,useRef,useState} from 'react';
import {Plane,Pause,Play,Info} from 'lucide-react';
import RadarGeography from './RadarGeography';
import {aircraftMovement,movementDescription,MOVEMENT_STYLES,type AircraftMovement} from '../data/aircraftMovement';
import {AIRPORTS,MAX_POSITION_AGE,REFRESH_SECONDS,NEAR_AIRPORT_NM,projectPosition,distanceNm,inAirportArea,appendObservation,type AircraftResponse,type AirportId,type Observation} from '../data/airspace';
const format=(n:number|null,suffix='')=>n===null?'Not reported':`${Math.round(n).toLocaleString()}${suffix}`;
export default function Airspace(){
 const [airport,setAirport]=useState<AirportId|'ALL'>('ALL');
 const [movement,setMovement]=useState<AircraftMovement|'all'>('all');
 const [selected,setSelected]=useState<string|null>(null);
 const [data,setData]=useState<AircraftResponse|null>(null);
 const [error,setError]=useState<string|null>(null);
 const [paused,setPaused]=useState(false);
 const [now,setNow]=useState(Date.now()/1000);
 const [nextAt,setNextAt]=useState(0);
 const history=useRef<Record<string,Observation[]>>({});
 // Kept across pause/resume so the button cannot accelerate requests.
 const nextAllowed=useRef(0);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()/1000),5000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{
  if(paused)return;
  let stopped=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
  async function update(){
   if(stopped)return;
   const delay=nextAllowed.current-Date.now();
   if(delay>0){timer=setTimeout(update,delay);return;}
   if(document.visibilityState!=='visible'){timer=setTimeout(update,5000);return;}
   let wait=REFRESH_SECONDS;
   try{
    const response=await fetch('/api/aircraft',{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
    const body=await response.json();
    if(!response.ok){
     const retry=Number(response.headers.get('Retry-After')??body.retryAfter);
     if(Number.isFinite(retry)&&retry>0)wait=Math.max(wait,retry);
     throw new Error(typeof body.error==='string'?body.error:'Aircraft feed unavailable.');
    }
    if(body.status!=='live'||body.provider!=='ADSB.lol'||!Array.isArray(body.aircraft)||typeof body.updatedAt!=='number'||Math.abs(Date.now()/1000-body.updatedAt)>MAX_POSITION_AGE)throw new Error('Aircraft feed is out of date.');
    if(stopped)return;
    const value=body as AircraftResponse;
    for(const a of value.aircraft)history.current[a.id]=appendObservation(history.current[a.id]??[],a);
    for(const [id,points] of Object.entries(history.current))if(Date.now()/1000-(points.at(-1)?.observedAt??0)>600)delete history.current[id];
    setData(value);setError(null);setNow(Date.now()/1000);
   }catch(e){if(stopped)return;setError(e instanceof Error?e.message:'Aircraft feed unavailable.');setData(null);}
   finally{if(!stopped){nextAllowed.current=Date.now()+wait*1000;setNextAt(nextAllowed.current/1000);timer=setTimeout(update,wait*1000);}}
  }
  timer=setTimeout(update,0);return()=>{stopped=true;controller.abort();clearTimeout(timer);};
 },[paused]);
 const expired=!!data&&now-data.updatedAt>MAX_POSITION_AGE;
 const all=data&&!error?data.aircraft.filter(a=>paused||now-a.observedAt<=MAX_POSITION_AGE):[];
 const areaAircraft=all.filter(a=>inAirportArea(a,airport));
 const visible=areaAircraft.filter(a=>movement==='all'||aircraftMovement(a)===movement);
 const flight=visible.find(a=>a.id===selected)??visible[0];
 const selectedMovement=flight?aircraftMovement(flight):null;
 const selectedColor=selectedMovement?MOVEMENT_STYLES[selectedMovement].color:'#a3ada5';
 const points=flight?history.current[flight.id]??[]:[];
 const trail=points.map(p=>projectPosition(p.lat,p.lon).join(',')).join(' ');
 const nearest=flight?[...AIRPORTS].sort((a,b)=>distanceNm(flight.lat,flight.lon,a.lat,a.lon)-distanceNm(flight.lat,flight.lon,b.lat,b.lon))[0]:null;
 const loading=!data&&!error;
 const countdown=Math.max(0,Math.ceil(nextAt-now));
 const status=paused?'UPDATES PAUSED':error?'LIVE FEED UNAVAILABLE':expired?'WAITING FOR FRESH POSITIONS':loading?'CONNECTING TO LIVE FEED':'LIVE AIRCRAFT POSITIONS';
 function filter(id:AirportId|'ALL'){setAirport(id);setSelected(null);}
 return <><div className="project-heading"><div><h2>Above the City<span className="heading-dot">.</span></h2><p className="project-description">Real aircraft. Three gateways. A new view every minute.</p></div></div>
 <div className="airport-directory live-airport-directory"><div><p className="eyebrow">EXPLORE NEAR AN AIRPORT</p><span>Within {NEAR_AIRPORT_NM} nautical miles · includes passing traffic</span></div><div className="airport-filters"><button aria-pressed={airport==='ALL'} onClick={()=>filter('ALL')}>NYC airspace <small>{all.length} aircraft</small></button>{AIRPORTS.map(a=><button key={a.id} aria-label={`Near ${a.id}`} aria-pressed={airport===a.id} onClick={()=>filter(a.id)}><strong>{a.id}</strong><span>{all.filter(f=>f.nearbyAirports.includes(a.id)).length} nearby</span></button>)}</div></div>
 <div className="transit-workbench radar-workbench live-radar"><div className="map-panel"><div className="map-toolbar"><span><span className={`status-dot ${error||expired?'offline':paused?'amber':''}`}/> {status}</span><button className="text-button" onClick={()=>setPaused(!paused)} aria-pressed={paused} aria-label={paused?'Resume aircraft updates':'Pause aircraft updates'}>{paused?<Play size={12}/>:<Pause size={12}/>} {paused?'RESUME':'PAUSE'}</button></div><div className="movement-controls" aria-label="Filter aircraft by vertical movement"><div className="movement-filter-buttons"><button aria-pressed={movement==='all'} onClick={()=>{setMovement('all');setSelected(null);}}>All <span>{areaAircraft.length}</span></button>{(Object.keys(MOVEMENT_STYLES) as AircraftMovement[]).map(key=>{const style=MOVEMENT_STYLES[key];return <button key={key} aria-label={`Show ${style.label.toLowerCase()} aircraft`} aria-pressed={movement===key} onClick={()=>{setMovement(key);setSelected(null);}} style={{'--movement-color':style.color} as React.CSSProperties}><span className="movement-symbol" aria-hidden="true">{style.symbol}</span>{style.label}<span>{areaAircraft.filter(a=>aircraftMovement(a)===key).length}</span></button>;})}</div><p>Color shows vertical movement, not confirmed arrivals or departures.</p></div><div className="map-scroll"><svg className="hub-map radar-map" viewBox="0 0 760 650" aria-label="Live reported aircraft positions around New York City"><RadarGeography/>
 {AIRPORTS.map(a=>{const [x,y]=projectPosition(a.lat,a.lon);return <g key={a.id} opacity={airport==='ALL'||airport===a.id?1:.35} pointerEvents="none"><rect x={x-7} y={y-7} width="14" height="14" fill="#121714" stroke="#d4d1ad" strokeWidth="2"/><text x={x+13} y={y+5} fontSize="12" fill="#e2dfbf">{a.id}</text></g>;})}
 {points.length>1&&<polyline className="observed-trail" points={trail} fill="none" stroke={selectedColor} strokeWidth="1.5" strokeDasharray="2 5" pointerEvents="none"/>}
 {[...visible].sort((a,b)=>Number(a.id===flight?.id)-Number(b.id===flight?.id)).map(f=>{const active=f.id===flight?.id;const [x,y]=projectPosition(f.lat,f.lon);const movementStyle=MOVEMENT_STYLES[aircraftMovement(f)];const color=movementStyle.color;const labelX=x>590?x-113:x+19;const labelY=Math.max(18,Math.min(610,y));return <g key={f.id} role="button" tabIndex={0} aria-label={`Select aircraft ${f.callsign}`} aria-pressed={active} className="flight-marker live-flight-marker" data-movement={aircraftMovement(f)} onClick={()=>setSelected(f.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(f.id);}}}>
 <title>{f.callsign} · {movementDescription(f)} · {format(f.altitude,' ft')}</title><rect x={x-14} y={y-14} width="28" height="28" fill="transparent"/>{active&&<rect x={x-17} y={y-17} width="34" height="34" fill="#111714" fillOpacity=".65" stroke="#eef0d2" strokeWidth="1.5" strokeDasharray="6 6"/>}
 {f.track===null?<rect x={x-4} y={y-4} width="8" height="8" fill={color}/>:<path d="M-2-12H2V-3L11 3V6L2 3V9L5 11V13L0 11L-5 13V11L-2 9V3L-11 6V3L-2-3Z" transform={`translate(${x} ${y}) rotate(${f.track}) scale(${active ? .85 : .58})`} fill={color}/>}
 {active&&<g pointerEvents="none"><rect x={labelX} y={labelY-19} width="108" height="37" fill="#111714" opacity=".94"/><text x={labelX+5} y={labelY-4} fontSize="11" fill={color}>{f.callsign}</text><text x={labelX+5} y={labelY+10} fontSize="8" fill="#a6b999">{movementStyle.symbol} {format(f.altitude,' FT')}</text></g>}</g>;})}
 </svg></div><div className="map-caption"><span><span className="legend-square"/> {visible.length} REPORTED AIRCRAFT</span><span>POSITIONS UPDATE EVERY 60S</span></div>{(loading||error||expired||!visible.length)&&<div className="radar-notice" role="status">{loading?'Listening for aircraft…':error?`${error} Retrying in ${countdown}s.`:expired?'Last snapshot is old. Waiting for fresh reports.':areaAircraft.length&&movement!=='all'?'No aircraft match this movement filter right now.':'No fresh airborne positions in this area right now.'}</div>}</div>
 <aside className="arrival-panel flight-panel"><div className="station-intro"><p className="eyebrow"><Plane size={13}/> SELECTED AIRCRAFT</p><h3 className="flight-callsign">{flight?.callsign??'Watching the sky'}</h3><span className="station-borough">{paused?'PAUSED SNAPSHOT':flight?'LAST REPORTED POSITION':'AWAITING A FRESH REPORT'}</span><div className="boarding-filter"><label htmlFor="live-aircraft">EXPLORE AIRCRAFT</label><select id="live-aircraft" value={flight?.id??''} disabled={!visible.length} onChange={e=>setSelected(e.target.value)}>{!visible.length&&<option value="">No aircraft available</option>}{visible.map(f=><option key={f.id} value={f.id}>{f.callsign} · {f.aircraftType??'type unknown'}</option>)}</select></div></div>
 {flight&&nearest?<><div className="movement-detail" style={{'--movement-color':selectedColor} as React.CSSProperties}><span className="movement-symbol" aria-hidden="true">{MOVEMENT_STYLES[selectedMovement!].symbol}</span><div><strong>{movementDescription(flight)}</strong><small>{flight.verticalRate===null?'This aircraft has no reported vertical rate.':`${format(flight.verticalRate,' ft/min')} · reported vertical rate`}</small></div></div><div className="live-flight-location"><p className="eyebrow">NEAREST OF THE THREE AIRPORTS</p><strong>{nearest.id}<span>{distanceNm(flight.lat,flight.lon,nearest.lat,nearest.lon).toFixed(1)} NM AWAY</span></strong><p>{nearest.name}</p><small>Proximity only · origin and destination not supplied</small></div><dl className="flight-specs"><div><dt>AIRCRAFT TYPE</dt><dd>{flight.aircraftType??'Not reported'}</dd></div><div><dt>REGISTRATION</dt><dd>{flight.registration??'Not reported'}</dd></div><div><dt>BAROMETRIC ALTITUDE</dt><dd>{format(flight.altitude,' FT')}</dd></div><div><dt>GROUND SPEED</dt><dd>{format(flight.speed,' KT')}</dd></div><div><dt>GROUND TRACK</dt><dd>{format(flight.track,'°')}</dd></div><div><dt>VERTICAL RATE</dt><dd>{format(flight.verticalRate,' FT/MIN')}</dd></div><div><dt>POSITION AGE</dt><dd>{Math.max(0,Math.floor(now-flight.observedAt))} <small>SECONDS</small></dd></div></dl><div className="flight-chart observed-chart"><p className="eyebrow">OBSERVED ALTITUDE · THIS VISIT</p>{points.filter(p=>p.altitude!==null).length<2?<p className="history-wait">The chart appears after two reported positions. No flight history is invented.</p>:<AltitudeHistory points={points} color={selectedColor}/>}</div></>:<div className="empty-state"><Plane size={24}/><h4>{error?'The feed is taking a break.':'A little open sky.'}</h4><p>{error?'We’ll retry automatically at the provider’s pace.':movement!=='all'?'Try All movement or another airport area.':'Choose an airport area or wait for the next position update.'}</p></div>}
 <div className="panel-footnote"><Info size={13}/><p>{paused?'Updates are paused; position ages continue to increase.':error?`Free feed temporarily unavailable. Next attempt in ${countdown}s.`:loading?'Connecting to the free ADSB.lol feed.':`Next check in ${countdown}s. ${all.length} fresh reports in this map area.`} Trails contain positions received during this visit.</p></div></aside></div>
 <p className="source-note">Aircraft data: <a href="https://www.adsb.lol/docs/open-data/api/" target="_blank" rel="noreferrer">ADSB.lol ↗</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer">ODbL 1.0 ↗</a> · Community receiver coverage varies · <a href="https://data.cityofnewyork.us/City-Government/Borough-Boundaries/gthc-hcne" target="_blank" rel="noreferrer">NYC DCP boundaries ↗</a> · Nearby shoreline simplified</p></>;
}
function AltitudeHistory({points,color}:{points:Observation[];color:string}){const values=points.filter((p):p is Observation&{altitude:number}=>p.altitude!==null);const start=values[0].observedAt;const duration=Math.max(1,values.at(-1)!.observedAt-start);const low=Math.min(...values.map(p=>p.altitude))-100,high=Math.max(...values.map(p=>p.altitude))+100;const d=values.map((p,i)=>`${i?'L':'M'}${((p.observedAt-start)/duration*270+5).toFixed(1)} ${(85-(p.altitude-low)/(high-low)*75).toFixed(1)}`).join(' ');return <svg viewBox="0 0 280 105" role="img" aria-label="Altitude samples received during this visit"><path d="M0 20H280M0 50H280M0 80H280" stroke="#344138" strokeDasharray="2 4"/><path d={d} fill="none" stroke={color} strokeWidth="2"/><text x="0" y="102" fill="#9ca893" fontSize="8">{Math.round(duration/60)} MIN AGO</text><text x="243" y="102" fill="#9ca893" fontSize="8">LATEST</text></svg>;}
