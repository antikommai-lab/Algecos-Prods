var TRACKS=[],PLAYLISTS=[],PLAYLIST=null,activeTags=[],SELS=[],MSGS=[],VGROUPS=[];
var CURRENT=null,CURRENTLIST=[],PCV=0;
var LYR={open:false,el:null};
var VIEW={imgs:[],i:0};
var EXTS=['jpg','jpeg','png','webp','gif'];
var LYREXTS=['txt','md','json','html'];
var SB=null,USER=null,GHTOK=localStorage.getItem('gh_pat')||'';
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function fmt(s){s=Math.max(0,Math.floor(s||0));var m=Math.floor(s/60),r=s%60;return (m<10?'0':'')+m+':'+(r<10?'0':'')+r;}
function stripExt(s){s=String(s);var l=s.toLowerCase();var E=['.mp3','.wav','.ogg','.m4a','.flac'];
 for(var i=0;i<E.length;i++){if(l.slice(-E[i].length)===E[i])return s.slice(0,s.length-E[i].length);}return s;}
function base(s){s=String(s);var p=s.lastIndexOf('/');return p<0?s:s.slice(p+1);}
function norm(s){return stripExt(String(s==null?'':s)).toLowerCase().trim();}
/* ===== ID unique auto-incremente ===== */
function nextId(){var m=0;TRACKS.forEach(function(t){if(typeof t.id==='number'&&t.id>m)m=t.id;});
 if(!m){var i=0;TRACKS.forEach(function(t,k){t.id=k+1;if(t.id>i)i=t.id;});m=i;}
 return m+1;}
function trById(n){var v=parseInt(n,10);if(isNaN(v))return null;
 return TRACKS.find(function(x){return x.id===v;})||null;}
/* ===== matching robuste : ID OU titre OU chemin fichier ===== */
function plMatch(ref){
 if(ref==null||typeof ref==='object')return null;
 var s=String(ref),t;
 /* 1. ID numerique (ex : 42) */
 t=trById(s);if(t)return t;
 /* 2. titre exact ou chemin exact */
 t=TRACKS.find(function(x){return x.title===s||x.file===s;});if(t)return t;
 /* 3. nom de fichier (base, sans extension) */
 var b=norm(base(s));
 t=TRACKS.find(function(x){return norm(base(x.file))===b;});if(t)return t;
 t=TRACKS.find(function(x){return norm(x.title)===norm(s);});if(t)return t;
 /* 4. recherche partielle (titres longs) */
 if(s.trim().length>=8){var ns=norm(s);
  t=TRACKS.find(function(x){return norm(x.title).indexOf(ns)>-1;});if(t)return t;
  t=TRACKS.find(function(x){return norm(base(x.file)).indexOf(ns)>-1;});}
 return t||null;}
function entSec(r){return (r&&typeof r==='object')?(r.section||r.SECTION||r.Section||''):'';}
function entLabel(r){return (r&&typeof r==='object')?(r.label||r.LABEL||''):'';}
function entRef(r){if(typeof r==='string')return r;if(r&&typeof r==='object')return r.ref||r.title||r.file||r.id||null;return null;}
function plFlat(){var out=[];((PLAYLIST&&PLAYLIST.tracks)||[]).forEach(function(r){var t=plMatch(entRef(r));if(t)out.push(t);});return out;}
/* ===== covers : resolution instantanee via imglist.json (fini le sondage sequentiel) ===== */
var IMGS=[],IMGSI={},COVCACHE={};
function tryCovers(paths,cb){
 var key=paths.join('|');
 if(COVCACHE[key]!==undefined){cb(COVCACHE[key]);return;}
 if(IMGS.length){
  var hit=null;
  for(var i=0;i<paths.length&&!hit;i++){var le=IMGSI[base(paths[i]).toLowerCase()];if(le)hit=le;}
  if(hit){COVCACHE[key]=hit;cb(hit);return;}}
 var done=false,n=paths.length;
 paths.forEach(function(p){var im=new Image();
  im.onload=function(){if(done)return;done=true;COVCACHE[key]=p;cb(p);};
  im.onerror=function(){n--;if(n===0&&!done){done=true;COVCACHE[key]=null;cb(null);}};
  im.src=encodeURI(p);});}
function plCoverPaths(c){c=String(c||'');var out=[],i;
 if(c.indexOf('.')>0){out.push('img/'+c,c);}
 else{for(i=0;i<EXTS.length;i++){out.push('img/'+c+'.'+EXTS[i]);}for(i=0;i<EXTS.length;i++){out.push(c+'.'+EXTS[i]);}}
 return out;}
function trackCoverPaths(t){var out=[],i,b=String(t.title||'')+'_cover';
 for(i=0;i<EXTS.length;i++)out.push('img/'+b+'.'+EXTS[i]);
 for(i=0;i<EXTS.length;i++)out.push(b+'.'+EXTS[i]);
 return out;}

/* ===== chargement ===== */
async function load(){
 try{var r=await fetch('tracks.json?nc='+Date.now(),{cache:'no-store'});TRACKS=await r.json();}catch(e){TRACKS=[];}
 try{var p=await fetch('playlists.json?nc='+Date.now(),{cache:'no-store'});PLAYLISTS=await p.json();}catch(e){PLAYLISTS=[];}
 if(!Array.isArray(PLAYLISTS))PLAYLISTS=[];
 try{var sl=await fetch('selections.json?nc='+Date.now(),{cache:'no-store'});SELS=await sl.json();}catch(e){SELS=[];}
 if(!Array.isArray(SELS))SELS=[];
 try{var mg=await fetch('messages.json?nc='+Date.now(),{cache:'no-store'});MSGS=await mg.json();}catch(e){MSGS=[];}
 if(!Array.isArray(MSGS))MSGS=[];
 try{var vgd=await fetch('vg.json?nc='+Date.now(),{cache:'no-store'});VGROUPS=await vgd.json();}catch(e){VGROUPS=[];}
 if(!Array.isArray(VGROUPS))VGROUPS=[];
 try{var il=await fetch('imglist.json?nc='+Date.now(),{cache:'no-store'});IMGS=await il.json();if(!Array.isArray(IMGS))IMGS=[];IMGS.forEach(function(p){IMGSI[base(p).toLowerCase()]=p;});}catch(e){IMGS=[];}
 if(!PLAYLIST||PLAYLISTS.indexOf(PLAYLIST)<0)PLAYLIST=PLAYLISTS[0]||{title:'\u2014',desc:'',tracks:[]};
 renderPlaylist();renderPlists();renderHomeGrid();renderVersions();renderSels();
 var allTags=[];TRACKS.forEach(function(t){(t.tags||[]).forEach(function(k){if(allTags.indexOf(k)<0)allTags.push(k);});});
 allTags.sort();
 $('tags').innerHTML=allTags.map(function(t){return '<span class="tag" data-t="'+esc(t)+'">'+esc(t)+'</span>';}).join('');
 document.querySelectorAll('#tags .tag').forEach(function(el){el.onclick=function(){
  var v=el.getAttribute('data-t');var ix=activeTags.indexOf(v);
  if(ix>-1)activeTags.splice(ix,1);else activeTags.push(v);
  document.querySelectorAll('#tags .tag').forEach(function(x){x.classList.toggle('on',activeTags.indexOf(x.getAttribute('data-t'))>-1);});
  render();};});
 render();updTicker();}

function normLyrics(txt,ext){try{
 if(ext==='json'){var j=JSON.parse(txt);var v=j.lyrics||j.text||j.content||(Array.isArray(j.lines)?j.lines.join(String.fromCharCode(10)):null);return v!=null?String(v):txt;}
 if(ext==='html')return stripHtml(txt);
 return txt;}catch(e){return txt;}}
