export const VERSION='between-harness/1.0';
const field=(text,key)=>text.split('\n').find(l=>l.toLowerCase().startsWith(key.toLowerCase()+':'))?.split(':').slice(1).join(':').trim()||'';
const list=s=>s.split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
const common=(a,b)=>a.filter(v=>b.includes(v));
const safeEnum=(v,allowed)=>allowed.includes(v)?v:'unknown';
export function analyze(person){
 if(person.sources?.length!==2||person.sources[0].kind!=='linkedin'||person.sources[1].kind!=='instagram')throw Error('Exactly one LinkedIn and one Instagram source are required.');
 const [li,ig]=person.sources;
 if(!person.fictional||ig.public!==true)throw Error('Use fictional profiles with a public Instagram fixture.');
 const age=Number(field(li.text,'Age'));if(!Number.isInteger(age)||age<18||age>100)throw Error('The fictional participant must have an age from 18 to 100.');
 const evidence=(key,value,source)=>({key,value:value||'Not specified',source,quote:person.sources[source].text.split('\n').find(l=>l.toLowerCase().startsWith(key.toLowerCase()+':'))||'No explicit statement in either source.',confidence:value?'Explicit statement':'Unknown'});
 const name=field(li.text,'Name');if(!name)throw Error('Add a Name: line to the LinkedIn fixture.');
 return {...person,name,age,city:field(li.text,'City')||'Not specified',role:field(li.text,'Role')||'Not specified',about:field(li.text,'About'),caption:field(ig.text,'Bio'),hobbies:list(field(ig.text,'Interests')),values:list(field(li.text,'Values')),pace:safeEnum(field(ig.text,'Pace'),['steady','flexible','spontaneous']),social:safeEnum(field(ig.text,'Social energy'),['quiet','balanced','social']),intent:safeEnum(field(ig.text,'Looking for'),['committed','exploring']),needs:field(ig.text,'Needs')||'Not specified — the agent should ask.',evidence:[evidence('About',field(li.text,'About'),0),evidence('Values',field(li.text,'Values'),0),evidence('Interests',field(ig.text,'Interests'),1),evidence('Pace',field(ig.text,'Pace'),1),evidence('Social energy',field(ig.text,'Social energy'),1),evidence('Looking for',field(ig.text,'Looking for'),1),evidence('Needs',field(ig.text,'Needs'),1)]};
}
function alignment(a,b,bridge){if(a==='unknown'||b==='unknown')return null;return a===b?1:(a===bridge||b===bridge)?0.7:0.2;}
export function runDate(a,b,venue='coffee'){
 if(a.id===b.id)throw Error('A person cannot date themselves.');
 const interests=common(a.hobbies,b.hobbies),values=common(a.values,b.values);
 const intent=a.intent==='unknown'||b.intent==='unknown'?null:a.intent===b.intent?1:0;
 const pace=alignment(a.pace,b.pace,'flexible'),energy=alignment(a.social,b.social,'balanced');
 const negotiation=pace===null||energy===null?null:(pace+energy)/2;
 const turn=(p,phase,text,source,decision)=>({speaker:p.id,name:p.name,phase,text,source,decision});
 const location={coffee:'a quiet neighborhood café',walk:'a walk through the botanical garden',gallery:'a small independent gallery'}[venue]||'a quiet neighborhood café';
 const activity=interests[0]||b.hobbies[0]||'a new shared interest';
 const transcript=[
  turn(a,'Discover',`I picked ${location}. ${a.name.split(' ')[0]} says, “${a.caption||a.about}” ${interests.length?`I noticed we both enjoy ${interests.join(' and ')}.`:`I noticed your interest in ${activity}.`} What does a good day together look like?`,1,'Observe the other profile; open with shared evidence.'),
  turn(b,'Respond',`${b.hobbies.length?`For ${b.name.split(' ')[0]}, I would start with ${b.hobbies[0]}.`:'I would ask my person about their interests first.'} ${b.needs} ${b.social==='quiet'?'Could we keep it just the two of us?':b.social==='social'?'Would you be comfortable meeting a few friends afterward?':'We could mix one-on-one time with seeing friends.'}`,1,'Answer from stated needs; test social fit.'),
  turn(a,'Negotiate',`${energy===null?'I don’t have enough information about social energy yet.':energy<0.5?`That stretches ${a.name.split(' ')[0]}’s ${a.social} social preference. Could we start one-on-one, then make the group part optional?`:`That works with ${a.name.split(' ')[0]}’s ${a.social} social preference.`} ${a.pace==='steady'?'I would like to choose a day ahead of time.':a.pace==='spontaneous'?'Could we leave the afternoon open to a spontaneous detour?':a.pace==='flexible'?'I can work with a little structure and room to improvise.':'I need to ask about scheduling preferences.'}`,1,'Adapt to the last reply; propose a concrete boundary.'),
  turn(b,'Resolve',`${pace===null?'Let’s ask for more information before settling the schedule.':pace<0.5?`Our scheduling styles differ: ${b.pace} versus ${a.pace}. Let’s fix a start time and keep the rest optional.`:`A plan with that amount of flexibility suits ${b.name.split(' ')[0]}.`} ${values.length?`We also share ${values.join(' and ')}, which gives us something deeper to explore.`:'Our stated values differ; I would ask what those values look like in daily life.'}`,0,'Resolve or retain friction; compare explicitly stated values.'),
  turn(a,'Clarify intention',`${a.intent==='unknown'?'My person hasn’t stated a relationship intention.':`I should be clear: ${a.name.split(' ')[0]} is ${a.intent==='committed'?'looking for a committed relationship':'exploring without rushing a commitment'}.`} How does that line up with what your person wants?`,1,'Check intention directly; never infer it from hobbies or career.'),
  turn(b,'Decide',`${intent===null?'We need a direct answer before recommending a romantic next step.':intent===0?`We want different things right now. ${b.name.split(' ')[0]} is ${b.intent==='committed'?'seeking commitment':'still exploring'}. I would flag this rather than pretend the chemistry resolves it.`:`We are aligned on ${b.intent==='committed'?'commitment':'taking time to explore'}. ${interests.length?`A second date around ${activity} feels worth trying.`:'I would suggest another conversation to find a shared activity.'}`} ${negotiation!==null&&negotiation<0.5?'The energy and scheduling differences still need an honest check-in.':''}`,1,'Return a recommendation with unresolved questions, not certainty.')
 ];
 const dimensions=[{key:'Shared values',value:a.values.length&&b.values.length?values.length/Math.max(a.values.length,b.values.length):null,weight:25},{key:'Shared interests',value:a.hobbies.length&&b.hobbies.length?interests.length/Math.max(a.hobbies.length,b.hobbies.length):null,weight:20},{key:'Relationship intention',value:intent,weight:25},{key:'Everyday rhythm',value:pace,weight:10},{key:'Social energy',value:energy,weight:10},{key:'Date negotiation',value:negotiation,weight:10}];
 const raw=dimensions.reduce((s,d)=>s+(d.value??0)*d.weight,0);
 const score=Math.round(intent===0?Math.min(raw,49):raw);
 const confidence=Math.round(dimensions.filter(d=>d.value!==null).reduce((s,d)=>s+d.weight,0));
 const friction=[...(intent===0?['Different relationship intentions']:[]),...(pace!==null&&pace<0.5?['Different planning styles']:[]),...(energy!==null&&energy<0.5?['Different social energy']:[]),...(a.city!==b.city?['Different cities; distance preference is unknown']:[]),...(confidence<100?['Missing statements; ask before recommending']:[])];
 const directional=(p,q)=>{const coverage=p.hobbies.length?common(p.hobbies,q.hobbies).length/p.hobbies.length:0;return Math.round(Math.min(intent===0?49:100,score*0.9+coverage*10));};
 return {id:[a.id,b.id].sort().join('__'),a:a.id,b:b.id,venue,location,transcript,dimensions,score,confidence,forA:directional(a,b),forB:directional(b,a),interests,values,friction,verdict:intent===0?'Intentions differ':confidence<70?'More information needed':score>=70?'Worth a second date':score>=45?'A little more to explore':'Better as a conversation',version:VERSION};
}
export function runExperiment(people){const dates=[];for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++)dates.push(runDate(people[i],people[j]));return dates;}
export function rankFor(id,people,dates){return dates.filter(d=>d.a===id||d.b===id).map(d=>({person:people.find(p=>p.id===(d.a===id?d.b:d.a)),date:d,score:d.a===id?d.forA:d.forB})).sort((a,b)=>b.score-a.score||a.person.name.localeCompare(b.person.name));}
export function validateSources(li,ig){let a,b;try{a=new URL(li);b=new URL(ig);}catch{throw Error('Enter two valid HTTPS fixture links.');}if(a.protocol!=='https:'||b.protocol!=='https:'||a.hostname!=='linkedin.example'||b.hostname!=='instagram.example')throw Error('This fictional demo uses linkedin.example and instagram.example links. Real social profiles are not scraped.');return true;}
