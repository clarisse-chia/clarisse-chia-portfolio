import {nyDateKey,WEATHER_CODES,type Weather,type ForecastHour,type ForecastDay} from '../src/data/weather.js';
export type {Weather} from '../src/data/weather.js';
const URL='https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,is_day,weather_code&hourly=temperature_2m,weather_code,is_day,precipitation_probability&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York&timeformat=unixtime&forecast_days=7';
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const validCode=(v:unknown):v is number=>finite(v)&&v in WEATHER_CODES;
export function parseWeather(body:any,now:number):Weather{
 const c=body?.current;
 if(!c||!finite(c.temperature_2m)||!validCode(c.weather_code)||![0,1].includes(c.is_day)||!finite(c.time)||c.time<now-10800||c.time>now+900)throw new Error('Weather unavailable');
 const hourly:ForecastHour[]=[];const h=body.hourly;
 if(Array.isArray(h?.time))for(let i=0;i<h.time.length;i++){
  const time=h.time[i],temperature=h.temperature_2m?.[i],code=h.weather_code?.[i],isDay=h.is_day?.[i],probability=h.precipitation_probability?.[i];
  if(!finite(time)||time<now-86400||time>now+8*86400||!finite(temperature)||!validCode(code)||![0,1].includes(isDay))continue;
  hourly.push({time,temperature:Math.round(temperature),code,isDay:isDay===1,precipitationProbability:finite(probability)&&probability>=0&&probability<=100?Math.round(probability):null});
 }
 const days:ForecastDay[]=[];const d=body.daily;
 if(Array.isArray(d?.sunrise))for(let i=0;i<d.sunrise.length;i++){const sunrise=d.sunrise[i],sunset=d.sunset?.[i];if(finite(sunrise)&&finite(sunset)&&sunset>sunrise&&sunset-sunrise<86400)days.push({date:nyDateKey(sunrise),sunrise,sunset,high:finite(d.temperature_2m_max?.[i])?Math.round(d.temperature_2m_max[i]):null,low:finite(d.temperature_2m_min?.[i])?Math.round(d.temperature_2m_min[i]):null,code:validCode(d.weather_code?.[i])?d.weather_code[i]:null});}
 return {temperature:Math.round(c.temperature_2m),code:c.weather_code,isDay:c.is_day===1,observedAt:c.time,status:'live',fetchedAt:now,hourly:[...new Map(hourly.map(h=>[h.time,h])).values()].sort((a,b)=>a.time-b.time),days};
}
let cache:{at:number;value:Weather}|undefined;let pending:Promise<Weather>|undefined;
export async function getWeather():Promise<Weather>{
 if(cache&&Date.now()-cache.at<600000)return cache.value;
 if(pending)return pending;
 pending=(async()=>{try{const r=await fetch(URL,{signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('Weather unavailable');const value=parseWeather(await r.json(),Date.now()/1000);cache={at:Date.now(),value};return value;}finally{pending=undefined;}})();return pending;
}
