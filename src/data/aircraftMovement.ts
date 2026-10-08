import type {Aircraft} from './airspace';
export type AircraftMovement='descending'|'climbing'|'level-unknown';
export const MOVEMENT_STYLES:Record<AircraftMovement,{label:string;color:string;symbol:string}>={
 descending:{label:'Descending',color:'#8fd5ba',symbol:'↓'},
 climbing:{label:'Climbing',color:'#e5b977',symbol:'↑'},
 'level-unknown':{label:'Level / unknown',color:'#a3ada5',symbol:'—'}
};
// A visual noise threshold, not an airport arrival/departure classification.
// Positive barometric vertical rate is a climb; negative is a descent (ft/min).
export function aircraftMovement(a:Pick<Aircraft,'verticalRate'>):AircraftMovement{
 if(a.verticalRate===null||!Number.isFinite(a.verticalRate))return 'level-unknown';
 if(a.verticalRate<=-300)return 'descending';
 if(a.verticalRate>=300)return 'climbing';
 return 'level-unknown';
}
export function movementDescription(a:Pick<Aircraft,'verticalRate'>):string{
 if(a.verticalRate===null||!Number.isFinite(a.verticalRate))return 'Vertical movement not reported';
 const movement=aircraftMovement(a);
 return movement==='level-unknown'?'Level / small altitude change':MOVEMENT_STYLES[movement].label;
}
