const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome'});const c=await browser.newContext();const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+require('node:path').resolve('guide.html')+'#review');await p.locator('#review:visible').waitFor();
const budgets={search:7,analyze:12,review:7,create:9,verify:5};
for(const [id,time] of Object.entries(budgets)){const total=await p.locator('#'+id+' .practice-plan li strong').evaluateAll(els=>els.reduce((sum,e)=>sum+parseInt(e.textContent),0));assert.equal(total,time,id);}
assert.equal(Object.values(budgets).reduce((a,b)=>a+b),40);
await p.locator('#emails').fill('approved@example.invalid');assert.match(await p.locator('#p-review').textContent(),/approved@example.invalid/);assert.match(await p.locator('#p-review').textContent(),/実行|実際|実施|일정 생성·수정·초대·메일 발송은 하지 마/);
await p.evaluate(()=>{window.lastCopy='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.lastCopy=text;}}});});await p.locator('[data-copy="review"]').click();assert.equal(await p.evaluate(()=>window.lastCopy),await p.locator('#p-review').textContent());
await p.locator('[data-product="claude"]').click();assert.equal(await p.locator('[data-product="claude"]').getAttribute('aria-pressed'),'true');assert.match(await p.locator('#start').textContent(),/같은 대화에 붙여넣습니다/);
await p.locator('#emails').fill('invalid');assert.equal(await p.locator('[data-copy="review"]').isDisabled(),true);await p.locator('#emails').fill('');assert.match(await p.locator('#p-review').textContent(),/ゲスト|게스트 초대하지 않음/);
await p.locator('#nav a[href="#create"]').click();assert.equal(await p.locator('#create details[open] [data-copy="approve"]').isVisible(),true);
await p.locator('#nav a[href="#analyze"]').click();await p.locator('#analyze details').filter({has:p.locator('[data-copy="analysis-fix"]')}).locator('summary').click();await p.locator('[data-copy="analysis-fix"]').click();assert.match(await p.evaluate(()=>window.lastCopy),/이미 맞는 정보는 억지로 바꾸지 마/);
assert.deepEqual(errors,[]);console.log('PASS: 40-minute activity budgets, review and correction prompts, copy payload, selected-product paste guidance, email safety, explicit approval');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
