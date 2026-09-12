import assert from 'node:assert/strict';
import { initStorageBrowser } from '../public/account-storage-ui.js';
class Element {
  constructor(tag='div'){this.tag=tag;this.children=[];this.dataset={};this.events={};this.classList={add(){},remove(){}};}
  append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  setAttribute(){}
  addEventListener(name,callback){this.events[name]=callback;}
  after(node){this.parent.append(node);}
  remove(){this.parent.children=this.parent.children.filter(n=>n!==this);}
  focus(){}
  async click(){await this.events.click?.({preventDefault(){}});}
}
const tree=new Element(),status=new Element();
globalThis.document={createElement:tag=>new Element(tag)};
const node={name:'Example.scad',kind:'workspaces',key:1,id:'one',bytes:25,deletable:true,children:[]};
const payload={groups:[{name:'Projects',children:[node]}],usedBytes:25};
let posts=0;
const browser=initStorageBrowser({root:{querySelector:id=>id==='#accountStorageTree'?tree:status},fetchJson:async(url,options)=>{if(options){posts++;assert.equal(JSON.parse(options.body).confirm,true);return {groups:[],usedBytes:0};}return payload;},updateUsage(){}});
await browser.load();
const find=(el,text)=>el.children.flatMap(n=>[n,...find(n,text)]).filter(n=>n.textContent===text);
let button=find(tree,'Delete')[0];
await button.click();assert.equal(posts,0);assert.equal(button.textContent,'Confirm delete');
await find(tree,'Cancel')[0].click();assert.equal(posts,0);assert.equal(button.textContent,'Delete');
await button.click();assert.equal(posts,0);
await button.click();assert.equal(posts,1);assert.equal(tree.textContent,'No saved data yet.');
console.log('Storage UI: first click arms, Cancel keeps data, second click deletes once.');
