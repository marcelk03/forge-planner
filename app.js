'use strict';
const $ = id => document.getElementById(id);
const MAX_LEVEL = 140;
const format = n => n.toLocaleString(undefined,{maximumFractionDigits:2});
const defaults = Object.fromEntries(WORKBOOK.inputs.map(x=>[x.key,x.value]));
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{$('save-status').textContent='Browser storage unavailable; changes will not survive closing this page.';}}
const oldValues=read('forge-inputs',null);
let values={...defaults,...read('forge-inputs-v2',oldValues?{...oldValues,N:Math.max(1,oldValues.N-1)}:defaults)};
let timer=read('forge-upgrade-v2',{level:values.N,started:false,remaining:0,end:null});
if(!timer||timer.level!==values.N||typeof timer.started!=='boolean'||!Number.isFinite(timer.remaining)||timer.remaining<0||(timer.end!==null&&!Number.isFinite(timer.end)))timer={level:values.N,started:false,remaining:0,end:null,total:0};
if(!Number.isFinite(timer.total)||timer.total<0)timer.total=timer.remaining;
// Previous bank and automatic earnings do not affect the split targets.
delete timer.earned;
function upgradeHours(v){return v.N < MAX_LEVEL ? (WORKBOOK.levels.find(x=>x.level===v.N+1)?.hours??0)*v.B : 0;}
function remaining(){return timer.end===null?timer.remaining:Math.max(0,timer.end-Date.now());}
function calculate(v,started=false,remainingMs=0,targetCurrentMs=remainingMs){
 const gold=v.D+v.G*86400+v.J/7+v.M+v.Q, hammers=v.E+v.H*1440+v.K/7+v.L/7+v.P;
 const perHammer=20*v.C*1.01**v.I/v.F;
 const nextLevel=v.N+(started?2:1);
 const nextCost=(WORKBOOK.levels.find(x=>x.level===nextLevel)?.cost??0)*v.A;
 const cutoff=nextLevel;
 const cost=WORKBOOK.levels.filter(x=>x.level>cutoff).reduce((a,x)=>a+x.cost,0)*v.A+3000000*(3-v.O);
 const days=WORKBOOK.levels.filter(x=>x.level>v.N+1&&x.level<MAX_LEVEL).reduce((a,x)=>a+x.hours,0)*v.B/24+(v.N+1<MAX_LEVEL?(started?remainingMs/86400000:upgradeHours(v)/24):0);
 const targetCurrentDays=started&&v.N+1<MAX_LEVEL?targetCurrentMs/86400000:0;
 const targetFutureDays=WORKBOOK.levels.filter(x=>x.level>=cutoff&&x.level<MAX_LEVEL).reduce((a,x)=>a+x.hours,0)*v.B/24;
 const projectionDays=targetCurrentDays+targetFutureDays;
 const generated=gold*projectionDays, totalHammers=hammers*projectionDays, hammerGold=totalHammers*perHammer, missing=cost-generated-hammerGold;
 return [gold,hammers,perHammer,nextCost,days,generated,totalHammers,hammerGold,missing+nextCost,Math.max(0,missing/perHammer)];
}
const labels=['Gold per day','Hammers per day','Gold per hammer','Cash for next unpaid upgrade','Time remaining to max','Gold earned before max','Hammers earned before max','Gold from those hammers','Missing gold till max','Hammers for remaining upgrades'];
function render(){
 const valid=$('inputs').checkValidity()&&$('input-N').checkValidity();
 const results=calculate(values,timer.started,remaining(),timer.started?timer.total:remaining());
 const cashLevel=values.N+(timer.started?2:1);
 labels[3]=cashLevel<=MAX_LEVEL?`Cash for ${cashLevel-1} -> ${cashLevel}`:'Cash for next upgrade (none)';
 $('error').textContent=valid&&results.every(Number.isFinite)?'':'Enter valid numbers in every input to calculate.';
 $('results').innerHTML=[0,1,2,4,5,6,7,3,9].map(i=>`<div class="metric${i===3||i===9?' target':''}"><small>${labels[i]}</small><strong>${valid&&Number.isFinite(results[i])?(i===4?durationText(results[i]*86400000):format(i===9?Math.ceil(results[i]):results[i])):'—'}</strong></div>`).join('');
}
for(const item of WORKBOOK.inputs){
 const wrapper=document.createElement('div');
 const integer=['I','N','O'].includes(item.key);
 wrapper.innerHTML=`<label for="input-${item.key}">${item.label}</label><input id="input-${item.key}" type="number" required min="${['C','F'].includes(item.key)?'0.000001':integer&&item.key!=='O'?'1':'0'}" ${item.key==='O'?'max="3"':item.key==='N'?`max="${MAX_LEVEL}"`:''} step="${integer?'1':'any'}">`;
 const input=wrapper.querySelector('input');input.value=values[item.key];
 input.addEventListener('input',()=>{values[item.key]=input.valueAsNumber;if(item.key==='N')resetUpgrade();else tick();if($('inputs').checkValidity()&&$('input-N').checkValidity())save('forge-inputs-v2',values);});
 $(item.key==='N'?'forge-level':'inputs').append(wrapper);
}
$('inputs').addEventListener('submit',e=>e.preventDefault());
$('defaults').onclick=()=>{values={...defaults};for(const item of WORKBOOK.inputs)$('input-'+item.key).value=values[item.key];save('forge-inputs-v2',values);resetUpgrade();};
$('levels').innerHTML=WORKBOOK.levels.map(x=>`<tr><td>${x.level}</td><td>${format(x.cost)}</td><td>${format(x.hours)}</td></tr>`).join('');
function parseDuration(text){
 text=text.trim().toLowerCase();if(!/^(?:\d+(?:\.\d+)?\s*[dhms]\s*)+$/.test(text))return NaN;
 return [...text.matchAll(/(\d+(?:\.\d+)?)\s*([dhms])/g)].reduce((sum,m)=>sum+Number(m[1])*{d:86400,h:3600,m:60,s:1}[m[2]],0)*1000;
}
function persistTimer(){save('forge-upgrade-v2',timer);}
function durationText(ms){
 const s=Math.ceil(ms/1000);
 return `${Math.floor(s/86400)}d ${Math.floor(s%86400/3600)}h ${Math.floor(s%3600/60)}m ${s%60}s`;
}
function resetUpgrade(){
 
 timer={level:values.N,started:false,remaining:0,end:null,total:0};persistTimer();
 $('duration').setCustomValidity('');syncTimerInputs();tick();
}
function syncTimerInputs(){
 $('upgrade-state').value=timer.started?'started':'not-started';
 $('duration').value=durationText(timer.started?remaining():upgradeHours(values)*3600000);
}
function tick(){
 
 const canUpgrade=Number.isInteger(values.N)&&values.N>=1&&values.N<MAX_LEVEL;
 if(timer.started&&timer.end!==null&&remaining()===0){timer.end=null;timer.remaining=0;persistTimer();}
 const ms=timer.started?remaining():upgradeHours(values)*3600000;
 $('clock').textContent=!timer.started?'Not started':Number.isFinite(ms)?durationText(ms):'-';
 $('upgrade-title').textContent=canUpgrade?`Forge ${values.N} -> ${values.N+1}`:'No further forge upgrade';
 $('timer-status').textContent=!canUpgrade?'Maximum forge level reached.':!timer.started?'Not started. Save the cash target to begin this upgrade.':timer.end!==null?'Upgrade finishes '+new Date(timer.end).toLocaleString():remaining()>0?'Countdown paused.':'Upgrade time is complete. Update Forge Level when collected.';
 $('upgrade-state').disabled=!canUpgrade;
 $('duration').disabled=!timer.started||!canUpgrade;
 $('start').disabled=!timer.started||timer.end!==null||remaining()<=0;
 $('pause').disabled=!timer.started||timer.end===null;
 $('use-level').disabled=!timer.started||!canUpgrade;
 render();
}
function setDuration(ms){
 
 timer={level:values.N,started:true,remaining:ms,end:ms>0?Date.now()+ms:null,total:ms};
 persistTimer();tick();
}
$('upgrade-state').onchange=()=>{
 if($('upgrade-state').value==='started'){
  setDuration(upgradeHours(values)*3600000);syncTimerInputs();
 }else resetUpgrade();
};
$('duration').addEventListener('input',()=>{
 const ms=parseDuration($('duration').value);
 const valid=Number.isFinite(ms)&&ms>=0&&ms<=315360000000;
 $('duration').setCustomValidity(valid?'':'Enter a duration such as 2d 3h 15m (up to 10 years).');
 if(valid)setDuration(ms);
 else $('timer-status').textContent='Invalid duration. Projections still use the previous duration.';
});
$('start').onclick=()=>{if(!$('duration').reportValidity()||!timer.started||remaining()<=0)return;timer.end=Date.now()+timer.remaining;persistTimer();tick();};
$('pause').onclick=()=>{timer.remaining=remaining();timer.end=null;persistTimer();syncTimerInputs();tick();};
$('use-level').onclick=()=>{if(!$('inputs').checkValidity())return;$('duration').setCustomValidity('');setDuration(upgradeHours(values)*3600000);syncTimerInputs();};
syncTimerInputs();tick();setInterval(tick,1000);
