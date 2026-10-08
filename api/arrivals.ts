import type {IncomingMessage,ServerResponse} from 'node:http';
import {getArrivals} from '../server/transit.js';
import {HUBS} from '../src/data/transit.js';
export default async function handler(req:IncomingMessage,res:ServerResponse){
 res.setHeader('Content-Type','application/json');
 if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');res.end(JSON.stringify({error:'Method not allowed'}));return;}
 const hub=new URL(req.url??'','https://localhost').searchParams.get('hub')??'';
 if(!HUBS.some(h=>h.id===hub)){res.statusCode=400;res.end(JSON.stringify({error:'Unknown station hub'}));return;}
 try{const data=await getArrivals(hub);res.setHeader('Cache-Control',data.status==='unavailable'?'no-store':'public, s-maxage=15, stale-while-revalidate=10');res.end(JSON.stringify(data));}
 catch{res.statusCode=503;res.end(JSON.stringify({error:'Arrival service unavailable'}));}
}
