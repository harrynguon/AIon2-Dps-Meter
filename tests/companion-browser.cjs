const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const base=path.resolve(__dirname,'../AionDpsMeter.UI/wwwroot/companion');
// The synthetic bridge mirrors CompanionStore.Save: only schema version 2 is accepted.
const harness=`<!doctype html><html><head><link rel="stylesheet" href="/companion.css"></head><body style="margin:0;height:100vh"><div id="root" style="height:100%"></div><script type="module">import {mount} from '/companion.mjs';window.instance=await mount(document.querySelector('#root'),{invokeMethodAsync:async(name,json)=>{if(name==='Load')return localStorage.getItem('state');if(name==='Save'){if(window.failSaves)throw Error('Simulated disk failure');if(JSON.parse(json).version!==2)throw Error('Unsupported companion data version.');localStorage.setItem('state',json);};}});</script></body></html>`;
fs.mkdirSync(path.resolve(__dirname,'../.artifacts'),{recursive:true});
const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end(harness);return;}const file=path.resolve(base,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(base+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp'})[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));});
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1060,height:820}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.locator('.wc-event').first().waitFor();assert.equal(await page.locator('.wc-event').count(),9);
 await page.screenshot({path:path.resolve(__dirname,'../.artifacts/schedule.png'),fullPage:true});
 assert.equal(await page.locator('[data-tab=cubes]').count(),0);
 // The Next Up banner keeps its native progress bar.
 assert.equal(await page.locator('.wc-hero progress').count(),1);assert.ok(Number(await page.locator('.wc-hero progress').getAttribute('value'))>=0);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.locator('[data-event="daily"] [name="hours"]').fill('16');await page.getByRole('button',{name:'Save schedule',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('state')).events.find(e=>e.id==='daily').hours[0]===16);
 // Preview must not save; explicit application survives reload.
 await page.getByRole('button',{name:'Load Global preset',exact:true}).click();
 assert.equal(await page.locator('[data-event="daily"] [name="hours"]').inputValue(),'7');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('state')).events.find(e=>e.id==='daily').hours[0]),16);
 await page.getByRole('button',{name:'Save schedule',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('state')).events.find(e=>e.id==='daily').hours[0]===7);
 await page.reload();await page.getByRole('button',{name:'Settings',exact:true}).click();
 assert.equal(await page.locator('[data-event="shugo"] [name="entryDuration"]').inputValue(),'3');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export backup',exact:true}).click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'ratmeter-companion-backup.json');
 await page.locator('.wc-import-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"version":9}')});await page.waitForFunction(()=>document.querySelector('.wc-save-status').textContent.startsWith('Import failed'));
 assert.deepEqual(errors,[]);
 const valid=await page.evaluate(()=>localStorage.getItem('state'));
const corrupt=JSON.parse(valid);corrupt.events=null;const corruptJson=JSON.stringify(corrupt);
await page.evaluate(raw=>localStorage.setItem('state',raw),corruptJson);await page.reload();
await page.locator('.wc-recovery:not([hidden])').waitFor();
await page.getByRole('button',{name:'Settings',exact:true}).click();
await page.getByRole('button',{name:'Save schedule',exact:true}).click();
assert.equal(await page.evaluate(()=>localStorage.getItem('state')),corruptJson);
const originalDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Export original file',exact:true}).click();
const original=await originalDownload;const stream=await original.createReadStream();let originalText='';for await(const chunk of stream)originalText+=chunk;assert.equal(originalText,corruptJson);
await page.getByRole('button',{name:'Settings',exact:true}).click();page.once('dialog',d=>d.accept());
await page.locator('.wc-import-file').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(valid)});
await page.waitForFunction(()=>document.querySelector('.wc-recovery').hidden);assert.equal(await page.evaluate(()=>localStorage.getItem('state')),valid);
await page.evaluate(()=>localStorage.setItem('state','broken json'));await page.reload();await page.locator('.wc-recovery:not([hidden])').waitFor();
page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Start fresh',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('.wc-recovery').hidden);assert.equal(JSON.parse(await page.evaluate(()=>localStorage.getItem('state'))).version,2);
await page.getByRole('button',{name:'Settings',exact:true}).click();await page.evaluate(()=>window.failSaves=true);
await page.getByRole('button',{name:'Save schedule',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.wc-save-status').textContent.startsWith('Save failed'));
await page.evaluate(()=>window.failSaves=false);await page.getByRole('button',{name:'Save schedule',exact:true}).click();
await page.waitForFunction(()=>document.querySelector('.wc-save-status').textContent==='Saved on this PC');
assert.deepEqual(errors,[]);
await page.evaluate(()=>window.instance.dispose());assert.equal(await page.locator('.wc-shell').count(),0);
 console.log('Browser checks passed: timers, preset, save/reload, export/import, recovery, retry, disposal; cube UI absent.');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
