const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const source = fs.readFileSync(__dirname + '/../plugin/image-viewer.js', 'utf8');
const rootUri = 'content://com.android.externalstorage.documents/tree/primary%3AMeu%20Projeto';
class E {
  constructor(attrs={},kind='',parent=null){this.attrs=attrs;this.kind=kind;this.parentElement=parent;this.classList={removed:[],remove:x=>this.classList.removed.push(x)};this.handlers={};}
  getAttribute(k){return this.attrs[k]||null;}
  addEventListener(k,fn,capture){this.handlers[k+Boolean(capture)]=fn;}
  removeEventListener(k,fn,capture){assert.equal(this.handlers[k+Boolean(capture)],fn);delete this.handlers[k+Boolean(capture)];}
  contains(){return true;}
  closest(selector){if(selector==='[data-delete]')return this.kind==='delete'?this:null;if(selector==='.file-item[data-file]')return this.kind==='file'?this:this.parentElement?.closest(selector);return null;}
}
const list=new E();const sidebar=new E();const overlay=new E();const rendered=[];let closed=0;const listeners=new Map();const commands=[];const actions={};let plugin;
const window={
  Android:{
    runTerminalCommandAsync(command,dir){commands.push({command,dir});return JSON.stringify({accepted:true,requestId:'test-'+commands.length});}
  },
  setTimeout,clearTimeout,
  addEventListener(name,fn){const a=listeners.get(name)||[];a.push(fn);listeners.set(name,a);},
  removeEventListener(name,fn){listeners.set(name,(listeners.get(name)||[]).filter(x=>x!==fn));},
  dispatchEvent(event){for(const fn of listeners.get(event.type)||[])fn(event);}
};
const api={
  getFiles(){return [{name:'imgs/foto com espaços.png',projectRoot:rootUri},{name:'teste.py',projectRoot:rootUri},{name:'img/teste-ruim.png',projectRoot:'content://cloud/tree/id%3Aabc'}]},
  renderHtml(item){rendered.push(item);},
  closePreview(){closed++;window.dispatchEvent({type:'code-editor:preview-closed'});}
};
const CodeEditorAPI={addPlugin(config){plugin=config;}};
vm.runInNewContext(source,{CodeEditorAPI,document:{getElementById:id=>({fileList:list,sidebar,overlay}[id])},window,Element:E,console});
assert.equal(plugin.id,'image-viewer');
assert.equal(plugin.name,'Visualizador de imagens');
const dispose=plugin.activate({api,isTerminalAvailable:()=>true});
function click(name,kind='file'){
  const item=new E({'data-file':name},'file');const target=kind==='delete'?new E({},'delete',item):item;
  const event={target,canceled:false,stopped:false,preventDefault(){this.canceled=true;},stopImmediatePropagation(){this.stopped=true;}};
  list.handlers.clicktrue(event);return event;
}
async function run(){
  const clickImage=click('imgs/foto com espaços.png');
  await Promise.resolve();
  await Promise.resolve();
  assert(clickImage.canceled && clickImage.stopped);
  assert.equal(commands.length,1);
  assert.equal(commands[0].dir,'/sdcard/Meu Projeto');
  assert.match(commands[0].command,/python3 -c/);
  assert(rendered.at(-1).html.includes('Carregando imagem'));
  assert(sidebar.classList.removed.includes('open'));
  const output='__MCODE_IMAGE_VIEWER_V1__'+JSON.stringify({ok:true,mime:'image/png',data:'iVBORw0KGgo='});
  window.dispatchEvent({type:'android:terminal-result',detail:{requestId:'test-1',success:true,output,exitCode:0}});
  await new Promise(resolve=>setImmediate(resolve));
  assert(rendered.at(-1).html.includes('data:image/png;base64,iVBORw0KGgo='));
  assert.equal(rendered.at(-1).title,'imgs/foto com espaços.png');
  const codeClick=click('teste.py');
  assert(!codeClick.canceled && !codeClick.stopped);
  assert.equal(closed,1);
  const deleteClick=click('imgs/foto com espaços.png','delete');
  assert(!deleteClick.canceled && !deleteClick.stopped);
  assert.equal(commands.length,1);
  const other=click('img/teste-ruim.png');
  assert(other.stopped);
  assert(rendered.at(-1).html.includes('não está acessível'));
  assert.equal(commands.length,1);
  window.dispatchEvent({type:'android:project-loading'});
  assert.equal(closed,2);
  dispose();
  assert.equal(list.handlers.clicktrue,undefined);
  // Check the embedded python -c source compiles after shell quoting.
  const check=spawnSync('python3',['-c',`import ast,shlex,sys\na=shlex.split(sys.argv[1]);assert a[:2]==['python3','-c'];ast.parse(a[2]);print('embedded python OK')`,commands[0].command],{encoding:'utf8'});
  assert.equal(check.status,0,check.stderr);
  console.log('PASS: clicks, binary preview, normal files, delete, SAF mapping, unsupported roots, uninstall, Python source syntax');
}
run().catch(err=>{console.error(err);process.exitCode=1});
