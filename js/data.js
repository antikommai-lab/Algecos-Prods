var TRACKS=[],PLAYLISTS=[],PLAYLIST=null,activeTags=[];
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
/* ===== matching robuste titre OU chemin fichier ===== */
function plMatch(ref){
 if(ref==null||typeof ref==='object')return null;
 var s=String(ref),t;
 t=TRACKS.find(function(x){return x.title===s||x.file===s;});if(t)return t;
 var b=norm(base(s));
 t=TRACKS.find(function(x){return norm(base(x.file))===b;});if(t)return t;
 t=TRACKS.find(function(x){return norm(x.title)===norm(s);});if(t)return t;
 if(s.trim().length>=8){var ns=norm(s);
  t=TRACKS.find(function(x){return norm(x.title).indexOf(ns)>-1;});if(t)return t;
  t=TRACKS.find(function(x){return norm(base(x.file)).indexOf(ns)>-1;});}
 return t||null;}
function entSec(r){return (r&&typeof r==='object')?(r.section||r.SECTION||r.Section||''):'';}
function entLabel(r){return (r&&typeof r==='object')?(r.label||r.LABEL||''):'';}
function entRef(r){if(typeof r==='string')return r;if(r&&typeof r==='object')return r.ref||r.title||r.file||null;return null;}
function plFlat(){var out=[];((PLAYLIST&&PLAYLIST.tracks)||[]).forEach(function(r){var t=plMatch(entRef(r));if(t)out.push(t);});return out;}
/* ===== covers ===== */
function tryCovers(paths,cb){var i=0;
 (function next(){if(i>=paths.length){cb(null);return;}
  var im=new Image();im.onload=function(){cb(paths[i]);};im.onerror=function(){i++;next();};im.src=encodeURI(paths[i]);})();}
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
 try{var r=await fetch('tracks.json',{cache:'no-store'});TRACKS=await r.json();}catch(e){TRACKS=[];}
 try{var p=await fetch('playlists.json',{cache:'no-store'});PLAYLISTS=await p.json();}catch(e){PLAYLISTS=[];}
 if(!Array.isArray(PLAYLISTS))PLAYLISTS=[];
 if(!PLAYLIST||PLAYLISTS.indexOf(PLAYLIST)<0)PLAYLIST=PLAYLISTS[0]||{title:'—',desc:'',tracks:[]};
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
