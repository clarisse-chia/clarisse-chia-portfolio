import {useEffect,useRef} from 'react';
import {drawNYCScene,type SceneOptions} from '../art/nycScene';
export default function PixelScene({season,sky,light,paused}:SceneOptions&{paused:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);const elapsed=useRef(0);
 useEffect(()=>{const ctx=ref.current!.getContext('2d');if(!ctx)return;let frame=0,last:number|null=null;let lastDraw=-Infinity;
 const draw=()=>drawNYCScene(ctx,{season,sky,light},elapsed.current);
 function animate(now:number){if(last!==null)elapsed.current+=Math.min(100,now-last);last=now;if(now-lastDraw>=80){draw();lastDraw=now;}frame=requestAnimationFrame(animate);}
 draw();if(!paused)frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);
 },[season,sky,light,paused]);
 return <canvas ref={ref} width="384" height="216" role="img" aria-label={`${paused?'Paused':'Animated'} pixel panorama of Manhattan from the East River waterfront in ${season.toLowerCase()}, ${sky.toLowerCase()} weather, ${light} lighting. One World Trade Center, the Empire State Building, Chrysler Building, UN Secretariat, and Brooklyn Bridge. A ferry, two walkers${sky==='Rain'||sky==='Storm'?' carrying umbrellas':''}, and a small corgi on a leash${sky==='Rain'||sky==='Storm'?' wearing a raincoat':''}.`}/>;
}
