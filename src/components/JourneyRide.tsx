import {NETWORK_STATIONS} from '../data/subwayNetwork';
import {travelDirection} from '../data/travelDirection';
import type {RideLeg} from '../data/journeyPlanner';
import {nycTime,type RideTiming} from '../data/liveJourneys';
const byId=new Map(NETWORK_STATIONS.map(s=>[s.id,s]));
export default function JourneyRide({leg,timing}:{leg:RideLeg;timing:RideTiming}){
 const direction=timing.train.travelDirection||travelDirection(`${leg.from}${leg.direction}`,leg.stops.slice(1),leg.route);
 return <div><strong>Board at {byId.get(leg.from)?.name}</strong><div className="journey-platform-sign"><small>PLATFORM DIRECTION</small><strong>{direction==='Toward terminal'?`Toward ${timing.train.destination}`:direction}</strong><span>Look for “{timing.train.destination}” on the train</span></div>
 <section className="journey-live" aria-label={`Connecting ${leg.route} train`}><h4>Your connecting train · live prediction</h4><dl className="journey-clock"><div><dt>Reach platform</dt><dd>{nycTime(timing.readyAt)}</dd></div><div><dt>Wait</dt><dd>{timing.waitSeconds<60?'<1':`~${Math.round(timing.waitSeconds/60)}`} min</dd></div><div><dt>Board {leg.route}</dt><dd>{nycTime(timing.boardAt)}</dd></div></dl><div className="journey-backups"><h4>If you miss it</h4>{timing.laterTrains.length?<><div className="journey-backup-times">{timing.laterTrains.map(train=><span key={train.id}><strong>{nycTime(train.time)}</strong><small>To {train.destination}</small></span>)}</div><small>Same direction · all stop at {byId.get(leg.to)?.name}. Taking a later train changes your remaining connections and total time.</small></>:<small>No later matching trains in the current feed. Check again shortly.</small>}</div><small>This train is predicted to stop at {byId.get(leg.to)?.name}. Predictions can change.</small></section>
 <p>Get off at <b>{byId.get(leg.to)?.name}</b></p><small>{nycTime(timing.alightAt)} · {leg.stops.length-1} {leg.stops.length===2?'stop':'stops'} · ~{Math.round(timing.rideSeconds/60)} min riding{timing.estimatedRide?' (scheduled estimate)':''}</small></div>;
}
