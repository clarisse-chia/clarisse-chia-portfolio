export type Season='Spring'|'Summer'|'Autumn'|'Winter';
export type Sky='Clear'|'Cloudy'|'Fog'|'Rain'|'Snow'|'Storm';
export type Light='day'|'night'|'dawn'|'dusk';
export type ForecastHour={time:number;temperature:number;code:number;isDay:boolean;precipitationProbability:number|null};
export type ForecastDay={date:string;sunrise:number;sunset:number;high?:number|null;low?:number|null;code?:number|null};
export type Weather={temperature:number;code:number;isDay:boolean;observedAt:number;status:'live';fetchedAt:number;hourly:ForecastHour[];days:ForecastDay[]};
export const NYC_TIMEZONE='America/New_York';
export function nyParts(date=new Date()){const p=new Intl.DateTimeFormat('en-US',{timeZone:NYC_TIMEZONE,hour:'numeric',month:'numeric',hourCycle:'h23'}).formatToParts(date);return {hour:Number(p.find(x=>x.type==='hour')?.value??12),month:Number(p.find(x=>x.type==='month')?.value??1)};}
export function nyDateKey(time:number){const p=new Intl.DateTimeFormat('en-US',{timeZone:NYC_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(time*1000));return ['year','month','day'].map(k=>p.find(v=>v.type===k)?.value).join('-');}
export function seasonFor(month:number):Season{return month>=3&&month<=5?'Spring':month>=6&&month<=8?'Summer':month>=9&&month<=11?'Autumn':'Winter';}
export function skyFor(code:number):Sky{return [71,73,75,77,85,86].includes(code)?'Snow':[95,96,99].includes(code)?'Storm':[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)?'Rain':[45,48].includes(code)?'Fog':code>=2?'Cloudy':'Clear';}
export const WEATHER_CODES:Record<number,string>={0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',56:'Light freezing drizzle',57:'Freezing drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',66:'Light freezing rain',67:'Freezing rain',71:'Light snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Light rain showers',81:'Rain showers',82:'Heavy rain showers',85:'Light snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm with hail',99:'Thunderstorm with heavy hail'};
export function weatherLabel(code:number){return WEATHER_CODES[code]??'Conditions unavailable';}
export function availableHours(weather:Weather|null,now:number):ForecastHour[]{return (weather?.hourly??[]).filter(h=>h.time>=now);}
export function lightFor(time:number,isDay:boolean,day?:ForecastDay):Light{if(!isDay)return 'night';if(day&&time-day.sunrise>=0&&time-day.sunrise<=3600)return 'dawn';if(day&&day.sunset-time>=0&&day.sunset-time<=3600)return 'dusk';return 'day';}
