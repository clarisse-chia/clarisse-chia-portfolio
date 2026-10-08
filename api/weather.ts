import type {IncomingMessage,ServerResponse} from 'node:http';
import {getWeather} from '../server/weather.js';
export default async function handler(req:IncomingMessage,res:ServerResponse){
 res.setHeader('Content-Type','application/json');
 if(req.method!=='GET'){res.statusCode=405;res.end(JSON.stringify({error:'Method not allowed'}));return;}
 try{const data=await getWeather();res.setHeader('Cache-Control','public, s-maxage=600');res.end(JSON.stringify(data));}catch{res.statusCode=503;res.end(JSON.stringify({error:'Weather unavailable'}));}
}
