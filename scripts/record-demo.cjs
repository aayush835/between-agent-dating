const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Aayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const chapters=JSON.parse(fs.readFileSync('scripts/video-narration.json','utf8'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 fs.mkdirSync('artifacts/video',{recursive:true});
 const durations=chapters.map((_,i)=>Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',`artifacts/audio/${i}.wav`],{encoding:'utf8'}).trim()));
 const total=durations.reduce((s,d)=>s+d,0);if(total>177)throw Error(`Narration is ${total}s; increase speech rate before recording.`);
 console.log('Narration duration: '+total.toFixed(2)+' seconds');
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'artifacts/video',size:{width:1440,height:900}}});
 const page=await context.newPage();const video=page.video();
 const started=Date.now();await page.goto('http://localhost:4173');await page.locator('.person-card').first().waitFor();await page.evaluate(()=>document.fonts.ready);
 const preroll=(Date.now()-started)/1000;
 const actions=[
  async()=>{await sleep(2500);await page.evaluate(()=>window.scrollTo({top:580,behavior:'smooth'}));await sleep(3500);await page.getByRole('button',{name:'London',exact:true}).click();await sleep(2500);await page.getByRole('button',{name:'All cities',exact:true}).click();await page.evaluate(()=>window.scrollTo({top:580,behavior:'smooth'}));},
  async()=>{await page.evaluate(()=>window.scrollTo(0,0));await page.getByRole('button',{name:'Add a person'}).click();await sleep(2000);await page.locator('#linkedin-url').fill('https://linkedin.example/in/maya-chen');await page.locator('#instagram-url').fill('https://instagram.example/maya-chen');await sleep(3000);await page.locator('#fictional-check').check();await page.getByRole('button',{name:'Read sources & build agent'}).click();await page.waitForURL('**/#profile/maya-chen');},
  async()=>{await page.getByRole('button',{name:'LinkedIn fixture'}).click();await sleep(5000);await page.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('button',{name:'Instagram fixture'}).click();await sleep(5000);await page.getByRole('button',{name:'Close dialog'}).click();await page.evaluate(()=>window.scrollTo({top:420,behavior:'smooth'}));},
  async()=>{await page.getByRole('button',{name:'Watch my agent date'}).click();await page.getByRole('button',{name:'Start a date'}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();await page.evaluate(()=>window.scrollTo({top:220,behavior:'smooth'}));for(let i=0;i<5;i++){await sleep(2600);await page.getByRole('button',{name:'Next turn'}).click();}await page.locator('.turn').last().locator('summary').click();},
  async()=>{await page.locator('#date-a').selectOption('samir-patel');await page.locator('#date-b').selectOption('inez-alvarez');await page.getByRole('button',{name:'Start a date'}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();for(let i=0;i<5;i++){await sleep(2100);await page.getByRole('button',{name:'Next turn'}).click();}await page.locator('.date-result').scrollIntoViewIfNeeded();},
  async()=>{await page.getByRole('link',{name:'Connections',exact:true}).click();await page.locator('.ranking-row').first().waitFor();await sleep(3000);await page.getByRole('button',{name:'Why this fit'}).first().click();await page.evaluate(()=>window.scrollTo({top:220,behavior:'smooth'}));await sleep(6000);await page.locator('#rank-person').selectOption('leo-martins');},
  async()=>{await page.getByRole('button',{name:'Add a person'}).click();await page.locator('#custom-sources summary').click();await page.locator('#linkedin-url').fill('https://linkedin.example/in/alex-rivers');await page.locator('#instagram-url').fill('https://instagram.example/alex-rivers');await page.locator('#linkedin-text').fill('Name: Alex Rivers\nAge: 28\nCity: London\nRole: Designer\nAbout: Designing spaces for people.\nValues: curiosity, kindness');await page.locator('#instagram-text').fill('Bio: Weekend baker and long-distance walker.\nInterests: baking, hiking\nPace: steady\nSocial energy: quiet\nLooking for: committed\nNeeds: Time together and room to create.');await sleep(6000);await page.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('button',{name:'Download all results'}).click();},
  async()=>{await page.getByRole('link',{name:'The people',exact:true}).click();await page.locator('.person-card').first().waitFor();await page.evaluate(()=>window.scrollTo(0,0));}
 ];
 const timeline=[];
 for(let i=0;i<chapters.length;i++){
   const start=Date.now();console.log('Chapter '+(i+1)+': '+chapters[i].title);
   await page.evaluate(({title,index})=>{let el=document.getElementById('recording-caption');if(!el){el=document.createElement('div');el.id='recording-caption';el.style.cssText='position:fixed;bottom:0;left:0;right:0;padding:12px 32px;background:#292d28;color:#fffdf8;z-index:99999;display:flex;justify-content:space-between;font:13px Arial;letter-spacing:.5px;pointer-events:none';document.body.appendChild(el);}el.replaceChildren();const a=document.createElement('span');a.textContent=title;const b=document.createElement('span');b.textContent='FICTIONAL DEMO · '+index+' / 8';el.append(a,b);},{title:chapters[i].title,index:i+1});
   await actions[i]();const elapsed=(Date.now()-start)/1000;if(elapsed>durations[i])console.warn(`Chapter ${i} actions overrun by ${elapsed-durations[i]}s`);await sleep(Math.max(0,(durations[i]-elapsed)*1000));timeline.push({chapter:i,seconds:(Date.now()-start)/1000});
 }
 await context.close();await video.saveAs('artifacts/demo-raw.webm');await browser.close();fs.writeFileSync('artifacts/video-timing.json',JSON.stringify({preroll,durations,timeline,total},null,2));console.log('Video captured at artifacts/demo-raw.webm');
})().catch(e=>{console.error(e);process.exit(1);});
