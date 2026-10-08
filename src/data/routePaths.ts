import {HUBS, type Route} from './transit';

export type Point = readonly [number, number];
type Waypoint = Point | string;
export type RouteTrace = {name:string;termini:string;paths:Waypoint[][];note?:string};
const TS='times-square', US='union-square', YS='yankee-stadium', JH='jackson-heights', BJ='broadway-junction', DB='hoyt-schermerhorn', WB='williamsburg', LIC='long-island-city', LM='lower-manhattan', HM='harlem';

// Art-directed paths in the map's coordinate space, not geographic track geometry.
// Named waypoints attach to neighborhood markers; other points shape the corridor.
// Regular service overview, reviewed against MTA line maps on 2026-10-08.
export const ROUTE_TRACES:Record<Route,RouteTrace> = {
 '1':{name:'Broadway / Seventh Avenue',termini:'Van Cortlandt Park–242 St ↔ South Ferry',paths:[[[520,36],[475,118],[452,190],TS,[400,352],[383,410],LM,[390,505]]]},
 '2':{name:'Seventh Avenue express',termini:'Wakefield–241 St ↔ Flatbush Av–Brooklyn College',paths:[[[615,30],[580,104],[542,151],HM,TS,[402,355],[386,418],LM,DB,[570,555],[597,655]]]},
 '3':{name:'Seventh Avenue express',termini:'Harlem–148 St ↔ New Lots Av',paths:[[[502,143],HM,TS,[402,355],[386,418],LM,DB,[585,552],[649,607],[730,640]]]},
 '4':{name:'Lexington Avenue express',termini:'Woodlawn ↔ Crown Hts–Utica Av',paths:[[[560,32],YS,[515,190],[506,268],[480,345],US,[445,435],LM,DB,[580,550],[652,617]]]},
 '5':{name:'Lexington Avenue express',termini:'Dyre Av / Nereid Av ↔ Flatbush Av–Brooklyn College',paths:[[[620,55],[570,136],[537,170],[510,220],[506,268],[480,345],US,[445,435],LM,DB,[570,555],[597,655]],[[590,28],[558,105],[570,136]]],note:'Includes the northern branch; service varies by time of day.'},
 '6':{name:'Lexington Avenue / Pelham',termini:'Pelham Bay Park ↔ Brooklyn Bridge–City Hall',paths:[[[651,146],[593,165],[537,170],[510,220],[506,268],[480,345],US,[430,445]]]},
 '7':{name:'Flushing',termini:'Flushing–Main St ↔ 34 St–Hudson Yards',paths:[[[841,300],JH,[650,320],LIC,[556,347],[485,310],TS,[382,315]]]},
 A:{name:'Eighth Avenue express',termini:'Inwood–207 St ↔ Lefferts Blvd / the Rockaways',paths:[[[484,68],[465,124],HM,[448,248],TS,[396,351],[380,400],LM,DB,[572,527],BJ,[704,620],[818,642]],[[704,620],[655,655],[655,790],[790,804]],[[655,790],[603,819]]],note:'Queens branches are simplified; Rockaway Park service is limited.'},
 C:{name:'Eighth Avenue local',termini:'168 St ↔ Euclid Av',paths:[[[484,123],HM,[448,248],TS,[396,351],[380,400],LM,DB,[572,527],BJ,[703,620]]]},
 E:{name:'Queens Boulevard / Eighth Avenue',termini:'Jamaica Center ↔ World Trade Center',paths:[[[839,329],[790,305],JH,[642,318],LIC,[527,269],[483,257],TS,[396,351],[380,400],LM]]},
 B:{name:'Sixth Avenue / Brighton',termini:'Bedford Park Blvd ↔ Brighton Beach',paths:[[[566,57],YS,HM,[465,246],TS,[433,338],[426,398],[462,434],[493,476],[557,525],[573,621],[603,694]]],note:'Weekday service; the Bronx extension operates during rush hours.'},
 D:{name:'Sixth Avenue / West End',termini:'Norwood–205 St ↔ Coney Island–Stillwell Av',paths:[[[579,34],YS,HM,[465,246],TS,[433,338],[426,398],[462,434],[493,476],[557,525],[531,590],[527,642],[578,706]]]},
 F:{name:'Queens Boulevard / Sixth Avenue / Culver',termini:'Jamaica–179 St ↔ Coney Island–Stillwell Av',paths:[[[848,302],[785,291],JH,[642,318],LIC,[527,269],[483,257],TS,[433,338],[426,398],[472,424],[472,461],DB,[490,555],[548,594],[560,630],[578,706]]]},
 M:{name:'Queens Boulevard / Sixth Avenue / Myrtle',termini:'Forest Hills–71 Av ↔ Middle Village–Metropolitan Av',paths:[[[786,321],JH,[635,286],[566,257],[518,229],[478,244],TS,[433,338],[426,398],[472,424],[548,455],[604,480],[640,458],[651,416]]],note:'Regular weekday route; late-night and weekend service differs.'},
 G:{name:'Brooklyn–Queens crosstown',termini:'Court Sq ↔ Church Av',paths:[[LIC,[605,354],[602,387],WB,[602,462],[570,488],DB,[490,555],[548,594],[560,630]]]},
 J:{name:'Nassau Street / Jamaica',termini:'Jamaica Center ↔ Broad St',paths:[[[831,645],[761,622],[675,610],BJ,[603,504],[604,480],[548,455],[472,424],[438,444],LM,[398,493]]]},
 Z:{name:'Nassau Street / Jamaica skip-stop',termini:'Jamaica Center ↔ Broad St',paths:[[[831,645],[761,622],[675,610],BJ,[603,504],[604,480],[548,455],[472,424],[438,444],LM,[398,493]]],note:'Weekday rush-hour service; this trace does not show individual skipped stops.'},
 L:{name:'Fourteenth Street / Canarsie',termini:'8 Av ↔ Canarsie–Rockaway Pkwy',paths:[[[399,376],US,[535,401],WB,[626,444],[652,498],BJ,[651,618],[671,673]]]},
 N:{name:'Broadway / Sea Beach',termini:'Astoria–Ditmars Blvd ↔ Coney Island–Stillwell Av',paths:[[[637,237],[614,274],LIC,[549,284],[506,249],[468,262],TS,[438,343],US,[446,435],[493,476],[557,525],[520,570],[522,652],[578,706]]]},
 Q:{name:'Second Avenue / Broadway / Brighton',termini:'96 St ↔ Coney Island–Stillwell Av',paths:[[[531,208],[513,235],[477,258],TS,[438,343],US,[446,435],[493,476],[557,525],[573,621],[603,694],[578,706]]]},
 R:{name:'Queens Boulevard / Broadway / Fourth Avenue',termini:'Forest Hills–71 Av ↔ Bay Ridge–95 St',paths:[[[786,321],JH,[648,311],LIC,[549,284],[506,249],[468,262],TS,[438,343],US,[445,435],LM,DB,[535,544],[493,611],[480,655]]]},
 W:{name:'Astoria / Broadway local',termini:'Astoria–Ditmars Blvd ↔ Whitehall St–South Ferry',paths:[[[637,237],[614,274],LIC,[549,284],[506,249],[468,262],TS,[438,343],US,[445,435],LM,[390,505]]],note:'Weekday service.'}
};

export function tracePoints(path:Waypoint[]):Point[]{return path.map(p=>{if(typeof p!=='string')return p;const h=HUBS.find(h=>h.id===p);if(!h)throw new Error(`Unknown route waypoint: ${p}`);return [h.x,h.y] as const;});}
export function pixelPath(points:Point[]):string {
 if(!points.length)return '';
 let d=`M${points[0][0]} ${points[0][1]}`;
 for(let i=1;i<points.length;i++){
  const [x0,y0]=points[i-1], [x1,y1]=points[i];
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))/12));
  for(let step=1;step<=steps;step++)d+=` H${Math.round(x0+(x1-x0)*step/steps)} V${Math.round(y0+(y1-y0)*step/steps)}`;
 }
 return d;
}
