import type {Season,Sky,Light} from '../data/weather';
export type SceneOptions={season:Season;sky:Sky;light:Light;greeting?:boolean};
export function dogWalkerX(t:number){const cycle=t%18000;const walkTime=Math.floor(t/18000)*15000+Math.min(cycle,15000);const x=178+(walkTime/220)%470;return x>424?x-470:x;}
export function drawNYCScene(ctx:CanvasRenderingContext2D,{season,sky,light,greeting=false}:SceneOptions,t:number){
 ctx.imageSmoothingEnabled=false;
 const px=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 const night=light==='night',warm=light==='dawn'||light==='dusk',wet=sky==='Rain'||sky==='Storm';
 const overcast=['Cloudy','Fog','Rain','Storm'].includes(sky);
 const palette=night?['#142231','#25364b','#3b4d61','#586479']:warm?['#626b89','#a58b99','#d9ad9a','#efcba3']:overcast?['#6c8592','#91a7ac','#b1bfbb','#ced1bf']:['#789faa','#a0bfc0','#c0d1c5','#e4e1be'];
 for(let i=0;i<4;i++)px(0,i*39,384,40,palette[i]);
 if(night&&sky==='Clear'){
  for(let i=0;i<26;i++)px((i*67+13)%384,(i*29+7)%84,1,1,'#d4dbc5');
  px(329,23,13,13,'#e8e2c2');px(325,20,12,12,palette[0]);
 }else if(!night&&sky==='Clear'){px(167,warm?77:27,20,20,'#f7e5b1');px(164,warm?81:31,26,12,'#f7e5b1');}
 if(overcast||!night)for(let i=0;i<4;i++){
  const x=((i*119+t/1100+38)%480)-65,y=24+i%3*16,c=night?'#3e4e60':overcast?'#a4b6b7':'#e0e6d5';
  px(x,y,36,5,c);px(x+6,y-4,25,5,c);px(x+13,y-8,11,5,c);
 }
 // Gulls drift above the river in dry weather.
 if(!wet&&sky!=='Snow')for(let i=0;i<2;i++){const gx=(t/100+i*47)%430-20,gy=91+i*9;const wing=Math.floor(t/350)%2;px(gx,gy,1,1,'#e3e5d3');px(gx-3,gy-wing,3,1,'#e3e5d3');px(gx+1,gy-wing,3,1,'#e3e5d3');}
 const distant=night?'#364a56':warm?'#a49394':'#8ca8a7';
 for(let i=0;i<40;i++){const height=12+(i*19)%29;px(i*10-4,151-height,9,height,distant);}
 const body=night?'#28434d':warm?'#657981':'#577e86',side=night?'#1c333e':warm?'#4d646c':'#3e666f';
 const trim=night?'#819190':warm?'#c3b19c':'#b7c5b9';
 const window=(x:number,y:number,i:number)=>{px(x,y,1,2,night||warm?((i+Math.floor(t/8000))%4?'#e2ca8c':'#536568'):'#adc7bd');};
 function block(x:number,top:number,w:number,seed:number){px(x,top,w,154-top,body);px(x+w-4,top,4,154-top,side);px(x+2,top-3,w-4,3,body);for(let yy=top+5;yy<150;yy+=6)for(let xx=x+3;xx<x+w-5;xx+=4)window(xx,yy,xx+yy+seed);}
 // South (left) to north (right), compressed into an original East River panorama.
 for(const [i,b] of [[2,109,13],[18,96,17],[38,116,16],[82,91,19],[104,107,16],[124,118,13],[143,126,18],[167,111,15],[186,92,19],[207,107,15],[247,103,18],[265,117,15],[303,112,15],[355,94,17],[374,112,14]].entries())block(b[0],b[1],b[2],i);
 // One World Trade Center: antenna, flat roof, tapered glass faces.
 const glass=night?'#4b6977':warm?'#9ba8b1':'#86adb6',facet=night?'#344f61':warm?'#778998':'#638e9d';
 px(66,22,1,24,trim);px(64,42,5,4,trim);px(61,46,11,6,glass);
 for(let y=52;y<154;y++){const spread=Math.floor((y-52)/18);px(60-spread,y,13+spread*2,1,glass);px(67,y,6+spread,1,facet);}
 for(let y=57;y<151;y+=6){px(59-Math.floor((y-52)/18),y,15+Math.floor((y-52)/18)*2,1,night?'#60828b':'#b1c6c8');}
 px(65,48,1,103,night?'#91aaab':'#d0dcce');
 // Woolworth-like stepped roof in the downtown cluster.
 block(93,96,15,2);px(96,86,9,10,body);px(98,81,5,6,trim);px(100,75,1,7,trim);
 // Empire State Building: broad setbacks, limestone crown and narrow mast.
 const limestone=night?'#5c737a':warm?'#b6aaa0':'#9bafa8';
 px(223,80,25,74,limestone);px(245,80,4,74,side);px(226,66,19,16,limestone);px(229,55,13,12,limestone);px(232,46,7,10,trim);px(234,34,3,13,trim);px(235,22,1,14,night?'#e9dabc':trim);
 for(let y=70;y<150;y+=5)for(let x=228;x<=240;x+=4)window(x,y,x+y);for(let y=85;y<150;y+=5){window(224,y,y);window(243,y,y);}
 px(230,56,1,96,night?'#9a9c8a':'#c4cdc0');px(240,64,1,88,side);
 // Chrysler Building: layered stainless-steel crown, triangular fan lights, spire.
 block(282,87,18,4);const steel=night?'#aab9bd':warm?'#d4c2b1':'#cfdbce';
 px(283,81,16,7,steel);px(285,75,12,7,steel);px(287,69,8,7,steel);px(289,63,4,7,steel);px(290,47,1,17,steel);
 for(const [y,w] of [[83,12],[77,8],[71,4]]){px(291-w/2,y,w,1,side);px(290,y-2,2,2,side);}px(280,87,3,2,steel);px(298,87,4,2,steel);
 // UN Secretariat: unmistakable broad, flat glass slab on the riverfront.
 px(322,84,27,70,night?'#3d606b':'#78a4ad');px(347,84,4,70,side);px(321,83,28,2,trim);
 for(let y=89;y<152;y+=4){px(324,y,21,1,night?'#9daf9f':'#b6d0c8');}px(327,86,1,66,'#92b9b6');
 // Low East River piers and the Manhattan shoreline.
 px(0,153,384,4,side);for(let x=4;x<384;x+=14)px(x,157,3,3,side);
 const water=night?'#233f50':warm?'#8e9298':overcast?'#789aa0':'#75a2a7';px(0,158,384,35,water);
 for(let i=0;i<45;i++){const x=((i*41+t/(i%2?125:175))%410)-16;px(x,160+i%8*4,3+i%5*3,1,night?'#577579':warm?'#d0b6a0':'#b4cec5');}
 if(night||warm)for(const x of [66,235,291])for(let i=0;i<6;i++)px(x-4+(i%3),160+i*4,3+i%4*2,1,night?'#a29c73':'#d8b990');
 // Brooklyn Bridge: two masonry towers, paired Gothic arches, suspension cables.
 const stone=night?'#8c9488':warm?'#c2aa89':'#b3b9a0',cable=night?'#708785':'#516b69';
 function tower(x:number,top:number){px(x,top,19,4,stone);px(x+1,top+4,17,3,stone);px(x,top+7,3,155-(top+7),stone);px(x+8,top+7,3,155-(top+7),stone);px(x+16,top+7,3,155-(top+7),stone);for(const offset of [3,11]){px(x+offset,top+7,5,2,stone);px(x+offset,top+9,1,3,stone);px(x+offset+4,top+9,1,3,stone);}px(x-2,155,23,5,stone);}
 tower(24,111);tower(123,120);
 const arch=(from:number,to:number,topA:number,topB:number)=>{for(let x=from;x<=to;x++){const u=(x-from)/(to-from);const y=topA+(topB-topA)*u+22*4*u*(1-u);px(x,y,1,1,cable);if((x-from)%7===0)px(x,y,1,Math.max(1,153-Math.round(y)),cable);}};
 arch(-15,33,140,113);arch(33,132,113,122);arch(132,202,122,157);px(0,153,175,3,side);for(let x=176;x<209;x++)px(x,153+(x-175)/5,1,3,side);
 const ferryX=(t/160+253)%445-35;px(ferryX-7,184,33,1,'#bbd0c8');px(ferryX,178,27,6,night?'#b4bfbc':'#e0e4d4');px(ferryX+4,172,18,6,'#d5ded0');px(ferryX+7,173,12,3,'#406d85');px(ferryX+2,181,23,2,'#527f99');
 // Near-bank park rail, trees and promenade.
 px(0,194,384,22,night?'#283a3b':wet?'#687c7c':'#7f8d78');px(0,191,384,3,night?'#819082':'#cad0b9');px(0,200,384,1,night?'#3e5350':'#9caa92');
 for(let x=0;x<384;x+=14)px(x,187,1,5,night?'#71827b':'#6c817a');px(0,187,384,1,night?'#788c82':'#6b8277');
 const leaves=season==='Spring'?['#aba783','#d6b6b0','#91a681']:season==='Summer'?['#527b62','#789d73','#a2b880']:season==='Autumn'?['#ac794f','#d19b61','#c2b37b']:['#82938c','#b6c0b3','#95a8a0'];
 for(const x of [15,365]){px(x,174,3,25,'#6a6650');px(x-9,168,22,16,leaves[0]);px(x-5,159,15,15,leaves[1]);px(x+7,170,8,10,leaves[2]);if(sky==='Snow')px(x-5,159,15,3,'#e3e8db');}
 px(104,191,23,3,'#9a805b');px(106,185,19,3,'#ad9165');px(108,188,2,11,side);px(121,188,2,11,side);
 for(const x of [85,314]){px(x,174,2,24,night?'#8e9b88':'#5b7570');px(x-2,169,6,6,night?'#edd49a':'#b4c4aa');px(x-3,168,8,1,side);}
 if(wet){for(const x of [64,149,277]){px(x,210,19,1,'#a5bbba');px(x+4,212,12,1,'#b6c9c5');}}
 const humanA=95+((t/240)%470)-40,humanB=dogWalkerX(t);
 const aX=humanA>424?humanA-470:humanA,bX=humanB>424?humanB-470:humanB;
 if(wet||sky==='Snow')for(let i=0;i<92;i++){
  const x=((i*59+t/(sky==='Snow'?150:120))%404)-10,y=(i*31+t/(sky==='Snow'?80:14))%216;
  if(wet&&[aX,bX].some(h=>x>h-14&&x<h+14&&y>182&&y<209))continue;
  px(x,y,sky==='Snow'?2:1,sky==='Snow'?2:4,sky==='Snow'?'#e5eadf':'#b7cece');
 }
 const gait=Math.floor(t/210)%2;
 function umbrella(x:number,color:string){px(x-4,172,8,2,color);px(x-9,174,18,3,color);px(x-12,177,24,4,color);px(x-13,180,26,2,color);for(let k=-10;k<12;k+=7)px(x+k,182,4,1,color);px(x,172,1,1,'#e2d6ad');px(x,176,1,6,'#e4cfa4');px(x,183,1,13,'#dac9a7');px(x,195,3,1,'#dac9a7');}
 function person(x:number,coat:string,canopy:string,dog=false){const bob=gait;px(x-2,188+bob,5,5,'#d7b69b');px(x-2,187+bob,5,2,'#544139');px(x-3,193+bob,7,8,coat);px(x-5,194+bob,2,5,coat);px(x+4,194+bob,2,4,coat);if(season==='Winter'){px(x-3,192+bob,7,2,'#e0bd64');px(x+2,194+bob,2,4,'#e0bd64');}px(x-2-gait,201,2,6,'#283d45');px(x+2+gait,201,2,6,'#283d45');px(x-3-gait,207,3,1,'#d0c4a5');px(x+2+gait,207,3,1,'#d0c4a5');
  if(dog){const dx=x+21,dy=200+bob;ctx.strokeStyle='#d8b985';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(Math.round(x+5),198+bob);ctx.lineTo(Math.round(dx-2),dy+2);ctx.stroke();
   // A cream-chested corgi with upright ears, a scarf/collar and little alternating paws.
   px(dx-6,dy+1,10,5,'#c99760');px(dx+2,dy-2,6,6,'#d5aa73');px(dx+2,dy-5,2,4,'#bb8959');px(dx+6,dy-5,2,4,'#bb8959');px(dx+4,dy+1,5,3,'#f0dfb6');px(dx+7,dy,1,1,'#263b3b');px(dx+9,dy+2,1,2,'#293d3b');px(dx+1,dy+3,3,3,'#efdeb8');px(dx-5-gait,dy+6,2,2,'#f0dfb6');px(dx+1+gait,dy+6,2,2,'#f0dfb6');px(dx-9,dy+((greeting?Math.floor(t/75)%2:gait)?0:2),4,2,'#d7b17c');if(greeting){px(dx,dy-13,2,2,'#d59580');px(dx+3,dy-13,2,2,'#d59580');px(dx+1,dy-11,3,2,'#d59580');px(dx+2,dy-9,1,1,'#d59580');}px(dx+1,dy+2,2,2,'#b36b5c');if(wet){px(dx-6,dy,9,3,'#e0bd64');px(dx-5,dy,7,1,'#f0d887');}
  }
  if(wet)umbrella(x,canopy);
 }
 person(aX,'#ad7969','#d59580');person(bX,'#83a9a0','#e2bd73',true);
 if(sky==='Fog'){ctx.fillStyle=night?'rgba(150,168,180,.18)':'rgba(205,216,210,.32)';ctx.fillRect(0,65,384,124);}
}
