/* 실행: NODE_PATH=/tmp/neowiz-qa/node_modules node tests/qa.cjs
   Playwright 및 Chrome 필요. 사이트 자체는 설치 없이 실행됩니다. */
const {chromium}=require('playwright');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
async function tool(page,id){await page.locator('#utility-settings').evaluate(el=>el.open=true);await page.locator('#'+id).click();}
const path=require('node:path');
const fs=require('node:fs');
const file='file://'+path.resolve('guide.html');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(file);
 await page.locator('#h-start').waitFor();
 assert.equal(await page.locator('.lesson:visible').count(),1);
 await tool(page,'focus');
 assert.equal((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.length,0);
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.locator('[data-copy="search"]').click();
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),await page.locator('#p-search').textContent());
 await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('복사했습니다'));
 await page.locator('[data-product="claude"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-product="claude"]').getAttribute('aria-pressed'),'true');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');
 await page.evaluate(()=>{document.querySelector('#toast').textContent='';window.scrollTo({top:0,behavior:'instant'});});
 if(process.argv.includes('--export-email'))fs.writeFileSync('instructor-email.txt',await page.locator('#p-fullmail').textContent()+'\n');
 assert.equal(fs.readFileSync('instructor-email.txt','utf8').trim(),(await page.locator('#p-fullmail').textContent()).trim());
 assert.equal(await page.locator('.lesson:visible').count(),9);
 await page.locator('[data-product="claude"]').click();
 assert.equal(await page.locator('[data-platform="chatgpt"]:visible').count(),0);
 assert.ok(await page.locator('[data-platform="claude"]:visible').count()>0);
 await page.locator('[data-product="both"]').click();
 assert.equal(await page.locator('[data-platform]:visible').count(),4);
 await page.locator('[data-product="chatgpt"]').click();
 await page.screenshot({path:'previews/desktop.png',fullPage:false});
 await page.locator('[data-check="ready"]').check();
 await page.reload();
 assert.equal(await page.locator('[data-check="ready"]').isChecked(),true);
 assert.match(await page.locator('#progress-label').textContent(),/1\/17/);
 if(await page.locator('#focus').getAttribute('aria-pressed')==='false')await tool(page,'focus');
 assert.equal(await page.locator('.lesson:visible').count(),1);
 await page.locator('#nav a[href="#prompt"]').click();
 await page.locator('#h-prompt').waitFor({state:'visible'});
 await page.locator('[data-part="5"]').click();
 assert.match(await page.locator('#part-explain').textContent(),/最終|최종/);
 assert.equal(await page.locator('[data-part-block="5"]').getAttribute('class'),'promptpart emphasis');
 await page.locator('#prompt').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));await page.screenshot({path:'previews/prompt.png'});
 await page.locator('#nav a[href="#search"]').click();
 assert.equal(await page.locator('#search:visible').count(),1);
 await page.screenshot({path:'previews/gmail.png'});
 await page.locator('#nav a[href="#review"]').click();
 await page.locator('#emails').fill('training@example.invalid; learner@example.invalid');
 await page.locator('#nav a[href="#create"]').click();
 assert.match(await page.locator('#p-create').textContent(),/training@example.invalid, learner@example.invalid/);
 assert.ok(!(await page.evaluate(()=>localStorage.getItem('ai-training-v3'))).includes('@'));
 const href=await page.locator('#calendar-template').getAttribute('href');
 const u=new URL(href);assert.equal(u.origin,'https://calendar.google.com');assert.equal(u.searchParams.get('action'),'TEMPLATE');assert.equal(u.searchParams.get('dates'),'20261204T100000/20261204T103000');assert.equal(u.searchParams.get('ctz'),'Asia/Seoul');assert.equal(u.searchParams.get('text'),'[AI 교육 테스트] 프로젝트 A 차기 검토회의');assert.equal(u.searchParams.has('add'),false);
 await page.screenshot({path:'previews/calendar.png'});
 await page.locator('#nav a[href="#review"]').click();await page.locator('#emails').fill('invalid');await page.locator('#nav a[href="#create"]').click();assert.equal(await page.locator('[data-copy="create"]').isDisabled(),true);
 await page.locator('#nav a[href="#review"]').click();await page.locator('#emails').fill('');await page.locator('#nav a[href="#create"]').click();assert.match(await page.locator('#p-create').textContent(),/미확인 — 게스트 초대하지 않음/);
 // Test each copy payload through actual browser event handlers (clipboard captured in memory).
 await page.evaluate(()=>{window.qaCopies=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.qaCopies.push(text)}});});
 if(await page.locator('#focus').getAttribute('aria-pressed')==='true')await tool(page,'focus');await tool(page,'instructor');
 await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
 for(const button of await page.locator('[data-course="A"] [data-copy]').all()){await button.click();}
 await page.locator('[data-set-course="B"]').click();
 await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
 for(const button of await page.locator('[data-course="B"] [data-copy]').all()){await button.click();}
 const copies=await page.evaluate(()=>window.qaCopies);assert.ok(copies.length>=17);assert.ok(copies.every(s=>typeof s==='string'&&s.length>30));
 // B has a separate progress denominator and cannot overwrite A.
 assert.match(await page.locator('#progress-label').textContent(),/0\/12/);
 assert.equal((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.length,0);
 await page.locator('[data-check="b-ready"]').check();await page.locator('[data-set-course="A"]').click();assert.equal(await page.locator('[data-check="ready"]').isChecked(),true);
 await tool(page,'reset');await page.locator('#cancel-reset').click();assert.equal(await page.locator('[data-check="ready"]').isChecked(),true);
 await tool(page,'reset');await page.locator('#confirm-reset').click();assert.equal(await page.locator('[data-check="ready"]').isChecked(),false);
 await page.locator('[data-set-course="B"]').click();assert.equal(await page.locator('[data-check="b-ready"]').isChecked(),true);
 // Print shows both courses, products, full details even from focus mode.
 await tool(page,'focus');
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('.lesson:visible').count(),15);assert.equal(await page.locator('.hero:visible').count(),1);assert.equal(await page.locator('[data-platform]:visible').count(),6);
 assert.equal(await page.locator('details:not([open])').count(),0);
 await page.pdf({path:'/tmp/neowiz-print.pdf',format:'A4',printBackground:true});
 await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 // Responsive overflow + button contrast (all states, including keyboard focus).
 for(const width of [1440,1024,768,390]){
 await page.setViewportSize({width,height:1000});await page.locator('[data-set-course="A"]').click();if(await page.locator('#focus').getAttribute('aria-pressed')==='true')await tool(page,'focus');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
 for(const product of ['chatgpt','claude','both']){
 await page.locator(`[data-product="${product}"]`).click();
 const bad=await page.evaluate(()=>[...document.querySelectorAll('button,a.button')].filter(e=>e.getClientRects().length).filter(e=>{const s=getComputedStyle(e);const rgb=c=>(c.match(/[\d.]+/g)||[]).slice(0,3).map(Number);const lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);const a=lum(s.color),b=lum(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)<4.5;}).map(e=>e.textContent));assert.deepEqual(bad,[],`contrast ${width} ${product}`);
 }
 await page.locator('#nav a[href="#create"]').click();if(width===390){await page.evaluate(()=>document.querySelector('#toast').textContent='');await page.screenshot({path:'previews/mobile.png'});}
 }
 // Native copy fallback succeeds only if execCommand reports success.
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}}});document.execCommand=()=>false;});
 await page.locator('[data-copy="create"]').click();assert.equal(await page.locator('#manual-dialog').isVisible(),true);assert.match(await page.locator('#manual-text').inputValue(),/동일한 날짜/);await page.locator('#manual-dialog button').click();
 // Blocked localStorage must not break in-session progress.
 const isolated=await browser.newContext();await isolated.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}}));const blocked=await isolated.newPage();await blocked.goto(file);await blocked.locator('[data-check="ready"]').check();assert.match(await blocked.locator('#progress-label').textContent(),/1\/17/);
 // Offline boot needs no requests.
 await context.setOffline(true);await page.reload();assert.equal(await page.locator('.lesson:visible').count(),1);await context.setOffline(false);
 // Change common dates: derived mail, answer, prompt and link must follow.
 const changed=await context.newPage();let html=fs.readFileSync('guide.html','utf8').replaceAll('2026-12-04','2027-01-08').replace('"start":"10:00","end":"10:30"','"start":"11:00","end":"11:45"');
 await changed.route('https://qa.invalid/',r=>r.fulfill({body:html,contentType:'text/html'}));await changed.goto('https://qa.invalid/');const changedURL=new URL(await changed.locator('#calendar-template').getAttribute('href'));assert.equal(changedURL.searchParams.get('dates'),'20270108T110000/20270108T114500');assert.match(await changed.locator('#p-mail').textContent(),/2027年|2027년 1월 8일/);assert.match(await changed.locator('#p-verify').textContent(),/11:00~11:45/);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'PASS',copiedPayloads:copies.length,widths:[1440,1024,768,390],pageErrors:errors,accessibilityViolations:0,nativeClipboard:'PASS',calendarURL:href},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
