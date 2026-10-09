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
 var msgItems=MSGS.map(function(m){var d=m.date?new Date(m.date+'T12:00:00Z'):new Date();return '<item><title>NEWS — '+esc(m.title)+'</title><link>'+SITE_URL+'</link><guid isPermaLink="false">algecos-msg-'+esc(m.date)+'-'+esc(m.title)+'</guid><pubDate>'+d.toUTCString()+'</pubDate><description>'+esc(m.body||'')+'</description></item>';}).join('');
var plItems=PLAYLISTS.slice().sort(function(a,b){return String(b.upd||'').localeCompare(String(a.upd||''));}).slice(0,10).map(function(p){var d=p.upd?new Date(p.upd+'T12:00:00Z'):new Date();return '<item><title>PLAYLIST — '+esc(p.title)+'</title><link>'+SITE_URL+'</link><guid isPermaLink="false">algecos-pl-'+esc(p.title)+'</guid><pubDate>'+d.toUTCString()+'</pubDate><description>'+esc(p.desc||'')+'</description></item>';}).join('');
 return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ALGECOS-PRODS</title><link>'+SITE_URL+'</link><description>Nouveaux morceaux ANTIKOMM — division ALGECOS</description>'+items+msgItems+plItems+'</channel></rss>';}
async function publishAll(msg){
 if(!GHTOK)throw new Error('TOKEN GITHUB REQUIS (☰ Admin)');
 await ghPut('tracks.json',toB64(JSON.stringify(TRACKS,null,2)),msg);
 await ghPut('playlists.json',toB64(JSON.stringify(PLAYLISTS,null,2)),msg);
 await ghPut('selections.json',toB64(JSON.stringify(SELS,null,2)),msg);
 await ghPut('messages.json',toB64(JSON.stringify(MSGS,null,2)),msg);
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
 $('f_lyrFile').value='';$('f_pladd').value='';$('f_plnew').value='';}
function openTrackForm(mode){
 if(mode===-1){tmIdx=-1;$('tmTitle').textContent='+ Ajouter un morceau';$('tmSelWrap').style.display='none';
  ['f_title','f_file','f_tags','f_style','f_version','f_vid','f_desc','f_lyr','f_snd','f_date'].forEach(function(id){$(id).value='';});
  $('f_rating').value=3;$('f_lyrFile').value='';$('f_pladd').value='';$('f_plnew').value='';}
 else{$('tmTitle').textContent='✎ Modifier un morceau';$('tmSelWrap').style.display='block';
  $('tmSel').innerHTML=TRACKS.map(function(t,i){return '<option value="'+i+'">'+esc(t.title)+'</option>';}).join('');
  tmIdx=0;fillTrack();}
 $('mStatus').textContent='';fillLyricsSel();fillPlAdd();openModal('trackModal');}
function editTrack(i){
 var t=TRACKS[i];if(!t)return;
 tmIdx=i;$('tmTitle').textContent='✎ Modifier : '+t.title;$('tmSelWrap').style.display='none';
 fillTrackVals(t);$('mStatus').textContent='';fillLyricsSel();fillPlAdd();openModal('trackModal');}
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
 var plSel=$('f_pladd')?$('f_pladd').value:'';
 var plNew=$('f_plnew')?$('f_plnew').value.trim():'';
 if(plSel==='__new'&&plNew){PLAYLISTS.push({title:plNew,desc:'',tracks:[o.title],upd:new Date().toISOString().slice(0,10)});}
 else if(plSel){var PP=PLAYLISTS.find(function(x){return x.title===plSel;});
  if(PP){(PP.tracks=PP.tracks||[]).push(o.title);PP.upd=new Date().toISOString().slice(0,10);}}
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
/* ===== ajout playlist au morceau + messages RSS ===== */
function fillPlAdd(){var s=$('f_pladd');if(!s)return;
 s.innerHTML='<option value="">— aucune —</option>'+PLAYLISTS.map(function(p){return '<option value="'+esc(p.title)+'">'+esc(p.title)+'</option>';}).join('')+'<option value="__new">+ Nouvelle playlist…</option>';
 s.value='';}
function openMsgForm(){$('msgTitle').value='';$('msgBody').value='';$('msgStatus').textContent='';openModal('msgModal');}
async function saveMsg(){var t=$('msgTitle').value.trim(),b=$('msgBody').value.trim();
 if(!t){$('msgStatus').className='status err';$('msgStatus').textContent='TITRE REQUIS';return;}
 MSGS.unshift({title:t,body:b,date:new Date().toISOString().slice(0,10)});
 $('msgStatus').className='status ok';$('msgStatus').textContent='⏳ PUBLICATION…';
 try{await publishAll('message : '+t);
  closeModal('msgModal');await load();}
 catch(e){$('msgStatus').className='status err';$('msgStatus').textContent=e.message;}}

/* ===== dashboard admin (roue crantee header, construit a la demande) ===== */
function closeAdmDash(){var d=document.getElementById('admDash');if(d)d.classList.remove('open');}
function openAdmDash(){buildAdmDash();document.getElementById('admDash').classList.add('open');}
function admManage(pl){closeAdmDash();openManage(pl?'pl':'tr');}
function admForm(t,m){closeAdmDash();if(t===0)openTrackForm(m);else if(t===1)openPlForm(m);else if(t===2)openSelForm(m);else openMsgForm();}
function buildAdmDash(){
 var d=document.getElementById('admDash');
 var h='<div class="mbox" id="adashBox" style="width:min(680px,100%)">'
 +'<button class="close" onclick="closeAdmDash()">&#10005;</button>'
 +'<h3>&#9881; DASHBOARD ADMIN</h3>'
 +'<div class="adstats">'
 +'<div><b>'+TRACKS.length+'</b>morceaux</div>'
 +'<div><b>'+PLAYLISTS.length+'</b>playlists</div>'
 +'<div><b>'+SELS.length+'</b>s\u00E9lections</div>'
 +'<div><b>'+MSGS.length+'</b>messages</div>'
 +'</div>'
 +'<h4>Gestion</h4>'
 +'<button class="mitem" onclick="admManage(0)">&#128194; Gestion des tracks (unitaire ou par lots)</button>'
 +'<button class="mitem" onclick="admManage(1)">&#128194; Gestion des playlists</button>'
 +'<h4>Cr\u00E9er / modifier</h4>'
 +'<button class="mitem" onclick="admForm(0,-1)">+ Ajouter un morceau</button>'
 +'<button class="mitem" onclick="admForm(0,0)">&#9998; Modifier un morceau</button>'
 +'<button class="mitem" onclick="admForm(1,-1)">+ Nouvelle playlist</button>'
 +'<button class="mitem" onclick="admForm(1,0)">&#9998; Modifier une playlist</button>'
 +'<button class="mitem" onclick="admForm(2,-1)">+ Nouvelle s\u00E9lection</button>'
 +'<button class="mitem" onclick="admForm(2,0)">&#9998; Modifier une s\u00E9lection</button>'
 +'<button class="mitem" onclick="admForm(3)">&#9993; Message RSS / newsletter</button>'
 +'<h4>Token GitHub (fine-grained, Contents R/W)</h4>'
 +'<input id="ghTok2" type="password" placeholder="github_pat\u2026">'
 +'<div class="row"><button class="btn" style="width:100%" onclick="saveTok2()">M\u00E9moriser le token</button></div>'
 +'<div class="status" id="tokStatus2"></div>'
 +'</div>';
 d.innerHTML=h;
}
function saveTok2(){GHTOK=document.getElementById('ghTok2').value.trim();
 if(GHTOK){localStorage.setItem('gh_pat',GHTOK);document.getElementById('tokStatus2').className='status ok';document.getElementById('tokStatus2').textContent='M\u00C9MORIS\u00C9 \u2713';}
 else{document.getElementById('tokStatus2').className='status err';document.getElementById('tokStatus2').textContent='VIDE';}}


/* ===== dossiers audio : creation + suppression via API GitHub ===== */
function toB64Buf(buf){var B='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';var u=new Uint8Array(buf);var b64='';var rem=u.length%3,ln=u.length-rem;
 for(var i=0;i<ln;i+=3){var b1=u[i],b2=u[i+1],b3=u[i+2];b64+=B.charAt(b1>>2)+B.charAt(((b1&3)<<4)|(b2>>4))+B.charAt(((b2&15)<<2)|(b3>>6))+B.charAt(b3&63);}
 if(rem===1){var x=u[ln];b64+=B.charAt(x>>2)+B.charAt((x&3)<<4)+'==';}
 else if(rem===2){var y1=u[ln],y2=u[ln+1];b64+=B.charAt(y1>>2)+B.charAt(((y1&3)<<4)|(y2>>4))+B.charAt((y2&15)<<2)+'=';}
 return b64;}
async function ghCreate(path,b64,msg){
 var g=await fetch('https://api.github.com/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path)+'?ref=main&t='+Date.now(),{headers:{Authorization:'Bearer '+GHTOK,Accept:'application/vnd.github+json'}});
 var meta=await g.json();var sha=(meta&&meta.sha)||null;
 var pu=await fetch('https://api.github.com/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path),{method:'PUT',headers:{Authorization:'Bearer '+GHTOK,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({message:msg,content:b64,sha:sha,branch:'main'})});
 if(!pu.ok)throw new Error('UPLOAD KO ('+pu.status+')');}
async function ghDelete(path,msg){
 var g=await fetch('https://api.github.com/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path)+'?ref=main&t='+Date.now(),{headers:{Authorization:'Bearer '+GHTOK,Accept:'application/vnd.github+json'}});
 var meta=await g.json();
 if(!meta.sha)throw new Error('SHA INTROUVABLE ('+(meta.message||g.status)+')');
 var de=await fetch('https://api.github.com/repos/'+GH_OWNER+'/'+GH_REPO+'/contents/'+encodeURI(path),{method:'DELETE',headers:{Authorization:'Bearer '+GHTOK,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({message:msg,sha:meta.sha,branch:'main'})});
 if(!de.ok)throw new Error('SUPPRESSION KO ('+de.status+')');}


/* ===== upload audio par lots (base du workflow) ===== */
function upSet(cls,txt){var e=document.getElementById('upStatus');if(e){e.className=cls;e.textContent=txt;}}
async function uploadTracks(){
 var fs=document.getElementById('upFiles').files;
 if(!fs.length){upSet('status err','CHOISIS AU MOINS 1 FICHIER');return;}
 if(fs.length>10){upSet('status err','MAX 10 FICHIERS PAR LOT (s\u00E9lection : '+fs.length+')');return;}
 if(!GHTOK){upSet('status err','TOKEN GITHUB REQUIS');return;}
 var F=document.getElementById('upDir').value,alb='',dir;
 if(F==='album'){alb=document.getElementById('upAlbum').value.trim();
  if(!alb){upSet('status err','NOM D\u0027ALBUM REQUIS');return;}
  dir='audio/album/'+alb.replace(/[\\/:*?''<>|]/g,'-');}
 else{dir='audio'+(F?'/'+F:'');}
 if(!confirm('Uploader '+fs.length+' fichier(s) vers '+dir+'/ ?\n\nLes entr\u00E9es tracks.json seront cr\u00E9\u00E9es avec le titre = nom de fichier.'+(alb?'\nUne playlist \u00AB '+alb+' \u00BB sera cr\u00E9\u00E9e/r\u00E9utilis\u00E9e.':'')+' ?'))return;
 upSet('status ok','\u23F3 UPLOAD 0/'+fs.length+'\u2026');
 var done=0,fail=0,titles=[];
 for(var i=0;i<fs.length;i++){var f=fs[i];
  try{var dst=dir+'/'+f.name;
   await ghCreate(dst,toB64Buf(await f.arrayBuffer()),'upload : '+f.name);
   var ti=f.name.replace(/\.[a-z0-9]+$/i,'');
   TRACKS.push({title:ti,file:dst,tags:[],rating:0});
   titles.push(ti);done++;}
  catch(e){fail++;}
  upSet('status ok','\u23F3 UPLOAD '+(i+1)+'/'+fs.length+'\u2026');}
 if(alb&&titles.length){var PP=PLAYLISTS.find(function(x){return x.title===alb;});
  if(!PP){PP={title:alb,desc:'Album',tracks:[],upd:new Date().toISOString().slice(0,10)};PLAYLISTS.push(PP);}
  titles.forEach(function(t){if(PP.tracks.indexOf(t)<0)PP.tracks.push(t);});PP.upd=new Date().toISOString().slice(0,10);}
 try{await publishAll('upload : '+done+' fichier(s)');}
 catch(e){upSet('status err','PUBLISH KO : '+e.message);return;}
 upSet('status ok','\u2713 '+done+' UPLOAD\u00C9(S)'+(fail?' \u2014 '+fail+' \u00C9CHEC(S)':''));
 document.getElementById('upFiles').value='';
 await load();render();renderPlaylist();}
