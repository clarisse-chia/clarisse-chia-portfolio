import {useId} from 'react';
export default function MapBase({radar=false,labels=true}:{radar?:boolean;labels?:boolean}){
 const id=useId().replace(/:/g,'');
 return <g aria-hidden="true"><defs><pattern id={`land-${id}`} width="7" height="7" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="1.3" height="1.3" fill="#485e53"/></pattern><pattern id={`water-${id}`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M0 14h3m11-14v3" stroke="#35493f" strokeWidth=".6"/></pattern></defs>
 <rect width="760" height="650" fill="#111714"/><rect width="760" height="650" fill={`url(#water-${id})`} opacity=".46"/>
 <g fill={`url(#land-${id})`} stroke="#33463c" strokeWidth="1.2" strokeLinejoin="miter">
 <path d="M0 0H356L339 45 319 86 293 132 274 174 249 218 227 259 202 308 180 349 156 394 126 426 87 455 47 491 0 518Z"/>
 <path d="M406 0H760V188L682 178 635 182 603 158 563 161 531 137 504 149 474 128 465 94 432 108 421 84 396 65Z"/>
 <path d="M404 77L423 90 411 117 390 158 372 198 354 240 338 280 363 298 371 330 356 369 328 407 301 443 283 459 269 448 278 416 297 371 307 335 285 316 286 287 302 248 322 203 341 161 365 116Z"/>
 <path d="M483 183L522 170 559 195 606 187 654 199 697 192 760 221V650H255L271 598 304 562 327 518 344 477 371 446 400 414 428 385 434 355 422 327 413 299 427 270 448 249 453 210Z"/>
 <path d="M0 555L49 530 99 541 124 571 132 615 115 650H0Z"/>
 </g>
 <path d="M339 247L366 189 378 196 351 255Z" fill="#2a3e2b" stroke="#586b45" strokeDasharray="2 3"/>
 <path d="M425 539L440 518 456 526 443 551Z" fill="#283b2d"/>
 <g style={{display:labels?undefined:'none'}} fill="#87988c" fontFamily="IBM Plex Mono,monospace" fontSize="11" letterSpacing="4"><text x="451" y="34">THE BRONX</text><text x="576" y="350">QUEENS</text><text x="463" y="625">BROOKLYN</text><text x="202" y="160" transform="rotate(-64 202 160)">MANHATTAN</text></g>
 <g style={{display:labels?undefined:'none'}} fill="#68877d" fontFamily="IBM Plex Mono,monospace" fontSize="9" letterSpacing="3"><text x="175" y="500" transform="rotate(-63 175 500)">HUDSON RIVER</text><text x="385" y="346" transform="rotate(-61 385 346)">EAST RIVER</text><text x="548" y="138">LONG ISLAND SOUND</text><text x="23" y="111">NEW JERSEY</text></g>
 <g transform="translate(44 40)" stroke="#8d998f" fill="none"><path d="M0 27V0m-5 7L0 0l5 7"/><text x="-4" y="-10" stroke="none" fill="#9da79b" fontSize="10">N</text></g>
 {!radar&&labels&&<g fill="#758478" fontSize="9" fontFamily="IBM Plex Mono,monospace"><text x="24" y="623">SELECTED HUBS / GEOGRAPHY SIMPLIFIED</text><text x="24" y="638">INTERMEDIATE STOPS OMITTED</text></g>}
 </g>;
}
