import {networkHub} from '../src/data/subwayNetwork.js';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {getArrivals} from '../server/transit.js';
import {HUBS} from '../src/data/transit.js';
export default async function handler(req:IncomingMessage,res:ServerResponse){
 res.setHeader('Content-Type','application/json');
 if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');res.end(JSON.stringify({error:'Method not allowed'}));return;}
 const params=new URL(req.url??'','https://localhost').searchParams;
 if(params.has('stations')){
  const ids=[...new Set((params.get('stations')??'').split(','))];
  if(!ids.length||ids.length>100||ids.some(id=>!networkHub(`station-${id}`))){res.statusCode=400;res.end(JSON.stringify({error:'Invalid station list'}));return;}
  try{const results=await Promise.all(ids.map(id=>getArrivals(`station-${id}`)));res.setHeader('Cache-Control',results.some(r=>r.status==='unavailable')?'no-store':'public, s-maxage=15, stale-while-revalidate=10');res.end(JSON.stringify({stations:results}));}catch{res.statusCode=503;res.end(JSON.stringify({error:'Arrival service unavailable'}));}return;
 }
 const hub=params.get('hub')??'';
 if(!HUBS.some(h=>h.id===hub)&&!networkHub(hub)){res.statusCode=400;res.end(JSON.stringify({error:'Unknown station hub'}));return;}
 try{const data=await getArrivals(hub);res.setHeader('Cache-Control',data.status==='unavailable'?'no-store':'public, s-maxage=15, stale-while-revalidate=10');res.end(JSON.stringify(data));}
 catch{res.statusCode=503;res.end(JSON.stringify({error:'Arrival service unavailable'}));}
}
