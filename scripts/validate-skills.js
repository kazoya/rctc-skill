#!/usr/bin/env node
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');
const SKIP=new Set(['.git','node_modules','.venv','dist']);
const errors=[], warnings=[], skills=[];
function walk(dir){
 for(const name of fs.readdirSync(dir)){
  if(SKIP.has(name)) continue;
  const p=path.join(dir,name); let st;
  try{st=fs.statSync(p)}catch{continue}
  if(st.isDirectory()) walk(p);
  else {
   const rel=path.relative(ROOT,p).replace(/\\/g,'/');
   const text=fs.readFileSync(p,'utf8');
   if(/^(<<<<<<<|=======|>>>>>>>)( |$)/m.test(text)) errors.push(rel+': merge-conflict marker');
   if(name==='SKILL.md') inspectSkill(rel,text);
  }
 }
}
function frontmatter(text){
 if(!text.startsWith('---\n')&&!text.startsWith('---\r\n')) return null;
 const m=text.match(/^---\r?\n([\s\S]*?)\r?\n---/); if(!m) return null;
 const out={}; let key=null;
 for(const line of m[1].split(/\r?\n/)){
  const kv=line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
  if(kv){key=kv[1]; out[key]=kv[2].replace(/^['"]|['"]$/g,'').trim(); continue}
  if(key&&/^\s+/.test(line)) out[key]+=' '+line.trim();
 }
 return out;
}
function inspectSkill(rel,text){
 const fm=frontmatter(text);
 if(!fm){errors.push(rel+': missing/invalid YAML frontmatter');return}
 if(!fm.name) errors.push(rel+': frontmatter.name missing');
 if(!fm.description) errors.push(rel+': frontmatter.description missing');
 const hash=crypto.createHash('sha256').update(text).digest('hex');
 skills.push({id:fm.name,path:rel,hash});
}
walk(ROOT);
const byId=new Map(), byHash=new Map();
for(const s of skills){
 (byId.get(s.id)||byId.set(s.id,[]).get(s.id)).push(s);
 (byHash.get(s.hash)||byHash.set(s.hash,[]).get(s.hash)).push(s);
}
for(const [id,items] of byId) if(items.length>1)
 warnings.push('multi-install '+id+': '+items.map(x=>x.path).join(', '));
for(const items of byHash.values()) if(items.length>1)
 warnings.push('byte-identical: '+items.map(x=>x.path).join(', '));
console.log('skills:',skills.length,'errors:',errors.length,'warnings:',warnings.length);
for(const x of warnings) console.log('WARN',x);
for(const x of errors) console.error('ERROR',x);
if(errors.length) process.exit(1);
