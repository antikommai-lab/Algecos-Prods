/* ===== commits GitHub (admin) ===== */
async function ghPut(path,contentB64,msg){
 var r=await fetch('https://api.github.com/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+path+'?ref=main&t='+Date.now(),{headers:{Authorization:'Bearer '+GHTOK,Accept:'application/vnd.github+json'}});
 var meta=await r.json();
 if(!meta.sha)throw new Error('SHA INTROUVABLE ('+(meta.message||r.status)+') — token ?');
 var pu=await fetch('https://api.github.com/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+path,{method:'PUT',headers:{Authorization:'Bearer '+GHTOK,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({message:msg,content:contentB64,sha:meta.sha,branch:'main'})});
 if(!pu.ok)throw new Error('COMMIT KO ('+pu.status+')');
 return pu.json();}
function toB64(str){var B='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';var b64='';var bytes=[].slice.call(new TextEncoder().encode(str));
 for(var i=0;i<bytes.length;i+=3){var b1=bytes[i],b2=bytes[i+1],b3=bytes[i+2];
  b64+=B.charAt(b1>>2)+B.charAt(((b1&3)<<4)|(b2==null?0:b2>>4))+(b2==null?'=':B.charAt(((b2&15)<<2)|(b3==null?0:b3>>6)))+(b3==null?'=':B.charAt(b3&63));}
 return b64;}
function buildFeed(){
 var items=TRACKS.slice().sort(function(a,b){return String(b.recordDate||'').localeCompare(String(a.recordDate||''));}).slice(0,20).map(function(t){
  var d=t.recordDate?new Date(t.recordDate+'T12:00:00Z'):new Date();
  return '<item><title>'+esc(t.title)+(t.version?' ['+esc(t.version)+']':'')+'</title><link>'+SITE_URL+'</link><guid isPermaLink="false">algecos-'+esc(t.title)+'-'+esc(t.version||'')+'</guid><pubDate>'+d.toUTCString()+'</pubDate><description>'+esc((t.style||'')+' — '+(t.desc||''))+'</description></item>';}).join('');
 var plItems=PLAYLISTS.slice().sort(function(a,b){return String(b.upd||'').localeCompare(String(a.upd||''));}).slice(0,10).map(function(p){var d=p.upd?new Date(p.upd+'T12:00:00Z'):new Date();return '<item><title>PLAYLIST — '+esc(p.title)+'</title><link>'+SITE_URL+'</link><guid isPermaLink="false">algecos-pl-'+esc(p.title)+'</guid><pubDate>'+d.toUTCString()+'</pubDate><description>'+esc(p.desc||'')+'</description></item>';}).join('');
 return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ALGECOS-PRODS</title><link>'+SITE_URL+'</link><description>Nouveaux morceaux ANTIKOMM — division ALGECOS</description>'+items+plItems+'</channel></rss>';}
async function publishAll(msg){
 if(!GHTOK)throw new Error('TOKEN GITHUB REQUIS (☰ Admin)');
 await ghPut('tracks.json',toB64(JSON.stringify(TRACKS,null,2)),msg);
 await ghPut('playlists.json',toB64(JSON.stringify(PLAYLISTS,null,2)),msg);
 await ghPut('selections.json',toB64(JSON.stringify(SELS,null,2)),msg);
 await ghPut('feed.xml',toB64(buildFeed()),'flux RSS : '+msg);}

/* ===== formulaires admin ===== */
var tmIdx=-1;
function fillTrackVals(t){
 $('f_title').value=t.title;$('f_file').value=t.file||'';
 $('f_tags').value=(t.tags||[]).join(', ');
 $('f_style').value=t.style||'';$('f_version').value=t.version||'';$('f_desc').value=t.desc||'';
 $('f_vid').value=t.vid||'';
 $('f_lyr').value=t.lyricsCreator||'';$('f_snd').value=t.soundCreator||'';
 $('f_date').value=t.recordDate||'';$('f_rating').value=t.rating||3;
 $('f_lyrFile').value='';}
function openTrackForm(mode){
 if(mode===-1){tmIdx=-1;$('tmTitle').textContent='+ Ajouter un morceau';$('tmSelWrap').style.display='none';
  ['f_title','f_file','f_tags','f_style','f_version','f_vid','f_desc','f_lyr','f_snd','f_date'].forEach(function(id){$(id).value='';});
  $('f_rating').value=3;$('f_lyrFile').value='';}
 else{$('tmTitle').textContent='✎ Modifier un morceau';$('tmSelWrap').style.display='block';
  $('tmSel').innerHTML=TRACKS.map(function(t,i){return '<option value="'+i+'">'+esc(t.title)+'</option>';}).join('');
  tmIdx=0;fillTrack();}
 $('mStatus').textContent='';fillLyricsSel();openModal('trackModal');}
function editTrack(i){
 var t=TRACKS[i];if(!t)return;
 tmIdx=i;$('tmTitle').textContent='✎ Modifier : '+t.title;$('tmSelWrap').style.display='none';
 fillTrackVals(t);$('mStatus').textContent='';fillLyricsSel();openModal('trackModal');}
function fillTrack(){tmIdx=+$('tmSel').value;var t=TRACKS[tmIdx];if(t)fillTrackVals(t);}
async function saveTrack(){
 var ti=$('f_title').value.trim();
 if(!ti||!$('f_file').value.trim()){$('mStatus').className='status err';$('mStatus').textContent='TITRE + FICHIER REQUIS';return;}
 var o=tmIdx>-1?Object.assign({},TRACKS[tmIdx]):{};
 o.title=ti;o.file=$('f_file').value.trim();
 o.tags=$('f_tags').value.split(',').map(function(s){return s.trim();}).filter(Boolean);
 o.style=$('f_style').value.trim();o.version=$('f_version').value.trim();o.desc=$('f_desc').value.trim();o.vid=$('f_vid').value.trim();
 o.lyricsCreator=$('f_lyr').value.trim();o.soundCreator=$('f_snd').value.trim();
 o.recordDate=$('f_date').value;o.rating=+$('f_rating').value||0;
 if(tmIdx>-1)TRACKS[tmIdx]=o;else TRACKS.push(o);
 $('mStatus').className='status ok';$('mStatus').textContent='⏳ PUBLICATION…';
 try{await publishAll((tmIdx>-1?'edit':'add')+' : '+ti);
  closeModal('trackModal');await load();}
 catch(e){$('mStatus').className='status err';$('mStatus').textContent=e.message;}}

/* ===== upload lyrics ===== */
function lyrExtOf(name){var m=String(name||'').match(/\.([a-z0-9]+)$/i);return m?m[1].toLowerCase():'';}
async function lyrExists(title){
 for(var i=0;i<LYREXTS.length;i++){var ext=LYREXTS[i];
  try{var r=await fetch(encodeURI('lyrics/'+title+'.'+ext)+'?t='+Date.now(),{cache:'no-store'});
   if(r.ok)return ext;}catch(e){}}
 return null;}
async function saveLyrics(){
 var ti=$('f_title').value.trim();
 if(!ti){$('mStatus').className='status err';$('mStatus').textContent='RENSIGNE D&#39;ABORD LE TITRE DU MORCEAU';return;}
 if(!GHTOK){$('mStatus').className='status err';$('mStatus').textContent='TOKEN GITHUB REQUIS (☰ Admin)';return;}
 var f=$('f_lyrFile').files[0];
 if(!f){$('mStatus').className='status err';$('mStatus').textContent='CHOISIS UN FICHIER (.md, .txt, .json, .html)';return;}
 var ext=lyrExtOf(f.name)||'md';
 if(LYREXTS.indexOf(ext)<0)ext='md';
 var old=await lyrExists(ti);
 if(old&&!confirm('Des paroles existent déjà pour « '+ti+' » ('+old+').\n\nRemplacer par ce nouveau fichier ?'))return;
 $('mStatus').className='status ok';$('mStatus').textContent='⏳ UPLOAD LYRICS…';
 try{
  var txt=await f.text();
  await ghPut('lyrics/'+ti+'.'+ext,toB64(txt),'lyrics : '+ti);
  await ghPut('lyrics/'+ti+'.lyrics',toB64(normLyrics(txt,ext)),'lyrics normalises : '+ti);
  $('mStatus').className='status ok';$('mStatus').textContent='✓ LYRICS PUBLIÉS ('+ext+')';
  $('f_lyrFile').value='';}
 catch(e){$('mStatus').className='status err';$('mStatus').textContent=e.message;}}
async function fillLyricsSel(){
 var sl=$('f_lyrSel');
 try{
  var r=await fetch('https://api.github.com/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/lyrics?t='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error('KO');
  var L=await r.json();
  if(!Array.isArray(L)||!L.length)throw new Error('KO');
  sl.innerHTML='<option value="">— choisir un fichier lyrics —</option>'+L.map(function(f){return '<option value="'+esc(f.name)+'">'+esc(f.name)+'</option>';}).join('');
 }catch(e){sl.innerHTML='<option value="">(liste indisponible — upload direct)</option>';}}
async function applyLyricsSel(){
 var ti=$('f_title').value.trim();
 if(!ti){$('mStatus').className='status err';$('mStatus').textContent='TITRE DU MORCEAU REQUIS';return;}
 if(!GHTOK){$('mStatus').className='status err';$('mStatus').textContent='TOKEN GITHUB REQUIS';return;}
 var nm=$('f_lyrSel').value;
 if(!nm){$('mStatus').className='status err';$('mStatus').textContent='CHOISIS UN LYRICS DANS LA LISTE';return;}
 var ext=lyrExtOf(nm)||'md';
 if(LYREXTS.indexOf(ext)<0)ext='md';
 var old=await lyrExists(ti);
 if(old&&!confirm('Des paroles existent d\u00E9j\u00E0 pour « '+ti+' » ('+old+').\n\nRemplacer par « '+nm+' » ?'))return;
 $('mStatus').className='status ok';$('mStatus').textContent='⏳ COPIE LYRICS…';
 try{
  var src=await fetch(encodeURI('lyrics/'+nm)+'?t='+Date.now(),{cache:'no-store'});
  if(!src.ok)throw new Error('FICHIER SOURCE INTROUVABLE');
  var txt=await src.text();
  await ghPut('lyrics/'+ti+'.'+ext,toB64(txt),'lyrics : '+ti+' (reutilise '+nm+')');
  await ghPut('lyrics/'+ti+'.lyrics',toB64(normLyrics(txt,ext)),'lyrics normalises : '+ti);
  $('mStatus').className='status ok';$('mStatus').textContent='✓ LYRICS PUBLIÉS ('+ext+') — source : '+nm;
  $('f_lyrSel').value='';}
 catch(e){$('mStatus').className='status err';$('mStatus').textContent=e.message;}}

var pmIdx=-1;
function fillPlVals(p){
 $('p_title').value=p.title||'';$('p_desc').value=p.desc||'';$('p_cover').value=p.cover||'';
 $('p_tracks').value=(p.tracks||[]).map(function(r){
  if(typeof r==='string')return r;
  if(entSec(r))return 'SECTION: '+entSec(r);
  if(entLabel(r))return 'LABEL: '+entLabel(r)+' :: '+entRef(r);
  return entRef(r)||'';}).join(String.fromCharCode(10));}
function openPlForm(mode){
 if(mode===-1){pmIdx=-1;$('pmTitle').textContent='+ Nouvelle playlist';$('pmSelWrap').style.display='none';
  $('p_title').value='';$('p_desc').value='';$('p_cover').value='';$('p_tracks').value='';}
 else{$('pmTitle').textContent='✎ Modifier une playlist';$('pmSelWrap').style.display='block';
  $('pmSel').innerHTML=PLAYLISTS.map(function(p,i){return '<option value="'+i+'">'+esc(p.title)+'</option>';}).join('');
  pmIdx=0;fillPl();}
 $('pStatus').textContent='';openModal('plModal');}
function editPl(i){
 var p=PLAYLISTS[i];if(!p)return;
 pmIdx=i;$('pmTitle').textContent='✎ Modifier : '+p.title;$('pmSelWrap').style.display='none';
 fillPlVals(p);$('pStatus').textContent='';openModal('plModal');}
function fillPl(){pmIdx=+$('pmSel').value;var p=PLAYLISTS[pmIdx];if(p)fillPlVals(p);}
async function savePl(){
 var ti=$('p_title').value.trim();
 if(!ti){$('pStatus').className='status err';$('pStatus').textContent='TITRE REQUIS';return;}
 var lines=$('p_tracks').value.split(String.fromCharCode(10)).map(function(s){return s.trim();}).filter(Boolean);
 var tracks=lines.map(function(l){
  var m=l.match(/^SECTION\s*:\s*(.+)$/i);
  if(m){var o={};o.SECTION=m[1].trim();return o;}
  m=l.match(/^LABEL\s*:\s*(.+?)\s*::\s*(.+)$/i);
  if(m)return {label:m[1].trim(),ref:m[2].trim()};
  return l;});
 var p={title:ti,desc:$('p_desc').value.trim(),cover:$('p_cover').value.trim()||undefined,tracks:tracks};
 p.upd=new Date().toISOString().slice(0,10);
 if(pmIdx>-1)PLAYLISTS[pmIdx]=p;else PLAYLISTS.push(p);
 $('pStatus').className='status ok';$('pStatus').textContent='⏳ PUBLICATION…';
 try{await publishAll('playlist : '+ti);
  closeModal('plModal');PLAYLIST=PLAYLISTS[0];await load();}
 catch(e){$('pStatus').className='status err';$('pStatus').textContent=e.message;}}

/* ===== formulaires sélections ===== */
var smSelIdx=-1;
function fillSelVals(p){
 $('s_title').value=p.title||'';$('s_desc').value=p.desc||'';
 $('s_tracks').value=(p.tracks||[]).map(function(r){return typeof r==='string'?r:entRef(r);}).filter(Boolean).join(String.fromCharCode(10));}
function openSelForm(mode){
 if(mode===-1){smSelIdx=-1;$('smSelTitle').textContent='+ Nouvelle sélection';$('smSelSelWrap').style.display='none';
  $('s_title').value='';$('s_desc').value='';$('s_tracks').value='';}
 else{$('smSelTitle').textContent='✎ Modifier une sélection';$('smSelSelWrap').style.display='block';
  $('smSelSel').innerHTML=SELS.map(function(p,i){return '<option value="'+i+'">'+esc(p.title)+'</option>';}).join('');
  smSelIdx=0;fillSel();}
 $('sStatus').textContent='';openModal('selModal');}
function fillSel(){smSelIdx=+$('smSelSel').value;var p=SELS[smSelIdx];if(p)fillSelVals(p);}
async function saveSel(){
 var ti=$('s_title').value.trim();
 if(!ti){$('sStatus').className='status err';$('sStatus').textContent='TITRE REQUIS';return;}
 var lines=$('s_tracks').value.split(String.fromCharCode(10)).map(function(s){return s.trim();}).filter(Boolean);
 var p={title:ti,desc:$('s_desc').value.trim(),tracks:lines};
 p.upd=new Date().toISOString().slice(0,10);
 if(smSelIdx>-1)SELS[smSelIdx]=p;else SELS.push(p);
 $('sStatus').className='status ok';$('sStatus').textContent='⏳ PUBLICATION…';
 try{await publishAll('sélection : '+ti);
  closeModal('selModal');await load();}
 catch(e){$('sStatus').className='status err';$('sStatus').textContent=e.message;}}