import type {IncomingMessage,ServerResponse} from 'node:http';
import {validLocation} from '../src/data/journeyLocations.js';
import {WalkingError,walkingConnections} from '../server/walking.js';
export default async function handler(req:IncomingMessage,res:ServerResponse){res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');if(req.method!=='POST'){res.statusCode=405;res.setHeader('Allow','POST');res.end(JSON.stringify({error:'Method not allowed'}));return;}
 try{let body=(req as IncomingMessage&{body?:unknown}).body;if(!body){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8000)throw new WalkingError(413,'Request too large');}try{body=JSON.parse(raw);}catch{throw new WalkingError(400,'Invalid request');}}
 const value=body as {from?:unknown;to?:unknown};if(!validLocation(value?.from)||!validLocation(value?.to))throw new WalkingError(400,'Choose valid NYC addresses or subway stations.');res.end(JSON.stringify(await walkingConnections(value.from,value.to)));
 }catch(e){res.statusCode=e instanceof WalkingError?e.status:503;if(res.statusCode===429)res.setHeader('Retry-After','60');res.end(JSON.stringify({error:e instanceof WalkingError?e.message:'Walking directions are temporarily unavailable. Please try again.'}));}}
