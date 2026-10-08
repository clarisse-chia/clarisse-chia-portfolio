import type {IncomingMessage,ServerResponse} from 'node:http';
import {getAircraft,AircraftFeedError} from '../server/aircraft.js';
export default async function handler(req:IncomingMessage,res:ServerResponse){
 res.setHeader('Content-Type','application/json');
 if(req.method!=='GET'){res.setHeader('Allow','GET');res.statusCode=405;res.end(JSON.stringify({error:'Method not allowed'}));return;}
 try{const data=await getAircraft();res.setHeader('Cache-Control','public, max-age=0, s-maxage=15, must-revalidate');res.end(JSON.stringify(data));}
 catch(error){const e=error instanceof AircraftFeedError?error:new AircraftFeedError('Aircraft feed unavailable.');res.statusCode=e.statusCode;res.setHeader('Retry-After',String(e.retryAfter));res.setHeader('Cache-Control',`public, max-age=0, s-maxage=${Math.min(60,e.retryAfter)}`);res.end(JSON.stringify({status:'unavailable',error:e.message,retryAfter:e.retryAfter}));}
}
