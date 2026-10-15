import addresses from './api/addresses';
import walking from './api/walking';
import {realpathSync} from 'node:fs';
import {defineConfig,loadEnv,type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import arrivals from './api/arrivals';
import weather from './api/weather';
import aircraft from './api/aircraft';
function localApi():Plugin {const install=(server:any)=>{server.middlewares.use((req:any,res:any,next:any)=>{const path=(req.url??'').split('?')[0];if(path==='/api/addresses')void addresses(req,res);else if(path==='/api/walking')void walking(req,res);else if(path==='/api/arrivals')void arrivals(req,res);else if(path==='/api/weather')void weather(req,res);else if(path==='/api/aircraft')void aircraft(req,res);else next();});};return {name:'local-api',configureServer:install,configurePreviewServer:install};}
export default defineConfig(({mode})=>{const env=loadEnv(mode,process.cwd(),'ORS_');if(env.ORS_API_KEY)process.env.ORS_API_KEY=env.ORS_API_KEY;return {plugins:[react(),localApi()],server:{port:5173,strictPort:true,fs:{allow:[process.cwd(),realpathSync('node_modules')]}},preview:{port:4173,strictPort:true}};});
