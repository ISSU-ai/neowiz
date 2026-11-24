const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function tool(page,id){await page.locator('#utility-settings').evaluate(el=>el.open=true);await page.locator('#'+id).click();}
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.TRAINING_URL||'file://'+require('node:path').resolve('guide.html');
 await page.goto(base);await page.locator('#start:visible').waitFor();
 assert.equal(await page.locator('.lesson:visible').count(),1);
 await page.locator('[data-check="ready"]').check();
 await page.locator('#nav a[href="#search"]').click();
 assert.equal(await page.locator('.lesson:visible').count(),1);assert.equal(await page.locator('#search:visible').count(),1);assert.match(page.url(),/#search$/);assert.match(await page.title(),/01 메일 찾기/);
 await page.locator('#next').click();assert.equal(await page.locator('#prompt:visible').count(),1);await page.locator('#next').click();assert.equal(await page.locator('#analyze:visible').count(),1);assert.match(await page.locator('#page-status').textContent(),/05 \/ 09/);
 await page.goBack();await page.locator('#prompt:visible').waitFor();await page.goBack();await page.locator('#search:visible').waitFor();await page.goForward();await page.locator('#prompt:visible').waitFor();await page.goForward();await page.locator('#analyze:visible').waitFor();
 await page.reload();await page.locator('#analyze:visible').waitFor();assert.equal(await page.locator('.lesson:visible').count(),1);assert.equal(await page.locator('[data-check="ready"]').isChecked(),true);
 await page.locator('#nav a[href="#review"]').click();await page.locator('#emails').fill('test@example.invalid');await page.locator('#next').click();assert.match(await page.locator('#p-create').textContent(),/test@example.invalid/);
 await tool(page,'focus');assert.equal(await page.locator('.lesson:visible').count(),9);await tool(page,'focus');assert.equal(await page.locator('.lesson:visible').count(),1);
 await page.locator('[data-set-course="B"]').click();assert.equal(await page.locator('#b-start:visible').count(),1);await page.locator('#next').click();assert.equal(await page.locator('#b-data:visible').count(),1);await page.reload();await page.locator('#b-data:visible').waitFor();assert.match(await page.locator('#page-status').textContent(),/02 \/ 06/);
 await page.goto(base.replace(/#.*$/,'')+'#create');await page.locator('#create:visible').waitFor();
 await page.screenshot({path:'previews/pages-desktop.png'});
 await page.setViewportSize({width:390,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'previews/pages-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: individual pages, routes, history, reload, progress, email continuity, both courses, full view, mobile');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
