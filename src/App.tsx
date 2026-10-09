import {useEffect,useState} from 'react';
import {ArrowUpRight,TrainFront,Plane,Sun,Github,Linkedin} from 'lucide-react';
import Subway from './components/Subway';
import Airspace from './components/Airspace';
import CityWindow from './components/CityWindow';
// Add future projects, including playable games, here with their own component.
const projects=[
 {id:'window',n:'01',name:'Weather',icon:Sun,component:CityWindow},
 {id:'subway',n:'02',name:'Subway',icon:TrainFront,component:Subway},
 {id:'airspace',n:'03',name:'Flights',icon:Plane,component:Airspace}
] as const;
export type Project=typeof projects[number]['id'];
function initialProject():Project {return projects.find(p=>p.id===window.location.hash.slice(1))?.id??'window';}
function ProfileLinks(){return <nav className="profile-links" aria-label="Social profiles"><a href="https://github.com/clarisse-chia" target="_blank" rel="noopener noreferrer" aria-label="Clarisse on GitHub" title="GitHub"><Github size={21} strokeWidth={1.6} aria-hidden="true"/></a><a href="https://www.linkedin.com/in/clarissechia/" target="_blank" rel="noopener noreferrer" aria-label="Clarisse on LinkedIn" title="LinkedIn"><Linkedin size={21} strokeWidth={1.6} aria-hidden="true"/></a></nav>;}
export default function App(){
 const [project,setProject]=useState<Project>(initialProject);const [about,setAbout]=useState(false);
 useEffect(()=>{const update=()=>{const match=projects.find(p=>p.id===window.location.hash.slice(1));if(match)setProject(match.id);};window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
 const ActiveProject=projects.find(p=>p.id===project)!.component;
 return <div className="site-shell" id="top"><a className="skip-link" href="#project">Skip to project</a>
 <header className="site-header"><div className="header-right portfolio-navigation"><ProfileLinks/><button className="text-button about-link" onClick={()=>setAbout(!about)} aria-expanded={about} aria-controls="about-clarisse">About <ArrowUpRight size={14}/></button></div></header>
 {about&&<section id="about-clarisse" className="about-panel" aria-label="About Clarisse"><div><p>A little corner of the internet for things I’m curious enough to build.</p></div><p>First up: New York. More experiments—and perhaps a few playable games—to come.</p><button className="text-button" onClick={()=>setAbout(false)}>Close ×</button></section>}
 <main><section className="hero portfolio-hero"><div><h1>Clarisse <span>Chia.</span></h1><p className="portfolio-tagline">building one project at a time; sometimes useful, always whimsy.</p></div></section>
 <section className="work-intro" id="work" aria-labelledby="work-title"><div><h2 id="work-title">Hey there Delilah, what's it like in New York City?</h2></div><p></p></section>
 <nav className="project-tabs" aria-label="Explore the New York collection">{projects.map(p=><button key={p.id} className={`project-tab ${project===p.id?'active':''}`} aria-pressed={project===p.id} onClick={()=>{setProject(p.id);window.history.replaceState(null,'',`#${p.id}`);}}><p.icon size={19}/><span><strong>{p.name}</strong></span></button>)}</nav>
 <section id="project" className="project-section" tabIndex={-1}><ActiveProject/></section>
 </main>
 
 </div>;
}
