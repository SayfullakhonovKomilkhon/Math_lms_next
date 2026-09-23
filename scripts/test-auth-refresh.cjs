const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
const axios = require('axios');
const source = ts.transpileModule(fs.readFileSync('src/lib/api.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
function setup(refreshStatus) {
  const data = new Map([['accessToken','old'], ['refreshToken','refresh-old']]);
  let refreshes = 0; let logouts = 0;
  const client = axios.create({ adapter: async config => {
    if (config.headers.Authorization !== 'Bearer new') throw new axios.AxiosError('Expired', undefined, config, null, {status:401, data:{}, headers:{}, config});
    return {status:200,data:{ok:true},headers:{},config};
  }});
  const mock = { create: () => client, isAxiosError: axios.isAxiosError, post: async () => {
    refreshes++; await new Promise(r => setTimeout(r, 10));
    if (refreshStatus !== 200) throw new axios.AxiosError('Refresh failure', undefined, {}, null, {status:refreshStatus, data:{}, headers:{'retry-after':'60'}});
    return {data:{data:{accessToken:'new',refreshToken:'refresh-new'}}};
  }};
  const module = {exports:{}};
  vm.runInNewContext(source, {exports:module.exports, require: name => name === 'axios' ? mock : {clearClientSession: () => {logouts++;data.clear();}}, process:{env:{}}, window:{location:{href:''}}, localStorage:{getItem:k=>data.get(k) ?? null,setItem:(k,v)=>data.set(k,v)}, Date, Promise, Error, Number, String });
  return {api:module.exports.default, data, refreshes:()=>refreshes, logouts:()=>logouts};
}
test('30 parallel expired requests perform one refresh and all recover', async () => {
 const f=setup(200); const results=await Promise.all(Array.from({length:30},()=>f.api.get('/data')));
 assert.equal(results.length,30); assert.equal(f.refreshes(),1); assert.equal(f.logouts(),0);
});
for (const status of [429,500]) test(`${status} preserves the session and suppresses immediate refresh retries`, async()=>{
 const f=setup(status); await Promise.allSettled(Array.from({length:10},()=>f.api.get('/data')));
 await assert.rejects(f.api.get('/data')); assert.equal(f.refreshes(),1); assert.equal(f.logouts(),0); assert.equal(f.data.get('refreshToken'),'refresh-old');
});
test('invalid refresh token clears the expired session',async()=>{
 const f=setup(401); await assert.rejects(f.api.get('/data')); assert.equal(f.logouts(),1);
});
