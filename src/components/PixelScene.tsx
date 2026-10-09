import {useEffect,useRef,useState} from 'react';
import {drawNYCScene,dogWalkerX,type SceneOptions} from '../art/nycScene';
export default function PixelScene({season,sky,light,paused}:SceneOptions&{paused:boolean}){
 const [greeting,setGreeting]=useState(false);
 useEffect(()=>{if(!greeting)return;const timer=setTimeout(()=>setGreeting(false),3500);return()=>clearTimeout(timer);},[greeting]);
 const ref=useRef<HTMLCanvasElement>(null);const elapsed=useRef(0);
 useEffect(()=>{const ctx=ref.current!.getContext('2d');if(!ctx)return;let frame=0,last:number|null=null;let lastDraw=-Infinity;
 const draw=()=>drawNYCScene(ctx,{season,sky,light,greeting},elapsed.current);
 function animate(now:number){if(last!==null)elapsed.current+=Math.min(100,now-last);last=now;if(now-lastDraw>=80){draw();lastDraw=now;}frame=requestAnimationFrame(animate);}
 draw();if(!paused)frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);
 },[season,sky,light,paused,greeting]);
 return <div className="waterfront-scene"><canvas ref={ref} onPointerDown={e=>{const bounds=e.currentTarget.getBoundingClientRect();const x=(e.clientX-bounds.left)*384/bounds.width,y=(e.clientY-bounds.top)*216/bounds.height;if(Math.abs(x-(dogWalkerX(elapsed.current)+21))<18&&y>180)setGreeting(true);}} width="384" height="216" role="img" aria-label={`${paused?'Paused':'Animated'} pixel panorama of Manhattan from the East River waterfront in ${season.toLowerCase()}, ${sky.toLowerCase()} weather, ${light} lighting. One World Trade Center, the Empire State Building, Chrysler Building, UN Secretariat, and Brooklyn Bridge. A ferry, two walkers${sky==='Rain'||sky==='Storm'?' carrying umbrellas':''}, and a small corgi on a leash${sky==='Rain'||sky==='Storm'?' wearing a raincoat':''}.`}/><div className="waterfront-greeting"><span role="status">{greeting?'A tiny hello, just for you. ♥':'A little life along the East River.'}</span><button onClick={()=>setGreeting(true)} disabled={greeting} aria-label="Say hello to the corgi">{greeting?'♥ Hello, friend':'Say hello to the dog ♡'}</button></div></div>;
}
