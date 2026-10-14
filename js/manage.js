/* ===== gestion par lots : tracks + playlists (mode explorateur) ===== */
var MGTAB='tr',MGSEL=[],MGPL=null,MGPLSEL=[];
var Q=String.fromCharCode(34);
var _mgTab=mgTab;
function openManage(tab){openModal('manageModal');try{mgTab(tab||'tr');}catch(e){var es=$('mgStatus');es.className='status err';es.textContent='ERREUR : '+e.message;}}
function mgTab(t){try{MGTAB=t;MGSEL=[];MGPLSEL=[];
 $('mgTabTr').className=t==='tr'?'btn':'btn2';$('mgTabPl').className=t==='pl'?'btn':'btn2';
 $('mgTr').style.display=t==='tr'?'block':'none';$('mgPl').style.display=t==='pl'?'block':'none';
 $('mgTitle').textContent=t==='tr'?'Gestion des tracks':'Gestion des playlists';
 $('mgStatus').textContent='';$('mgPlStatus').textContent='';
 if(t==='tr'){renderMgList();}
 else{MGPL=null;$('mgPlEdit').style.display='none';renderMgPlList();}mgFabUpd();}
 catch(e){var es=$('mgStatus');es.className='status err';es.textContent='ERREUR : '+e.message+' \u2014 copie ce message';}}
function mgFiltered(){var q=($('mgQ').value||'').toLowerCase().trim();
 var L=TRACKS.map(function(t,i){return {t:t,i:i};}).filter(function(o){return !q||match(o.t,q);});
 var s=$('mgSort').value;
 if(s==='date')L.sort(function(a,b){return String(b.t.recordDate||'').localeCompare(String(a.t.recordDate||''));});
 else if(s==='rating')L.sort(function(a,b){return (b.t.rating||0)-(a.t.rating||0);});
 else if(s==='added')L.sort(function(a,b){return upTime(b.t).localeCompare(upTime(a.t));});
 else if(s==='id')L.sort(function(a,b){return (a.t.id||a.i)-(b.t.id||b.i);});
 else L.sort(function(a,b){return String(a.t.title||'').localeCompare(String(b.t.title||''));});
 return L;}
function renderMgList(){
 try{var L=mgFiltered();
 $('mgList').innerHTML=L.map(function(o){
  return '<div class='+Q+'mgrow'+Q+(MGSEL.indexOf(o.i)>-1?' data-on='+Q+'1'+Q:'')+' data-mi='+Q+''+o.i+''+Q+'>'
  +'<input type='+Q+'checkbox'+Q+' data-mi='+Q+''+o.i+''+Q+(MGSEL.indexOf(o.i)>-1?' checked':'')+'>'
  +'<span class='+Q+'mnum'+Q+'>'+(o.t.id||'?')+'</span>'
  +'<div class='+Q+'mt'+Q+'><b>'+esc(o.t.title)+'</b>'+(o.t.version?' <span class='+Q+'ver'+Q+'>'+esc(o.t.version)+'</span>':'')+'</div>'
  +'<div class='+Q+'ms'+Q+'>'+esc(o.t.recordDate||'')+' \u00B7 '+stars(o.t.rating)+'</div>'
  +'<button class='+Q+'mgdel'+Q+' data-del='+Q+''+o.i+''+Q+' title='+Q+'Supprimer (track + audio)'+Q+'>\u{1F5D1}</button>'
  +'</div>';}).join('')||'<div style='+Q+'color:var(--dim);padding:12px;font-size:.74rem'+Q+'>AUCUN R\u00C9SULTAT</div>';
 $('mgAll').checked=L.length>0&&L.every(function(o){return MGSEL.indexOf(o.i)>-1;});
 bindMgRows();mgFabUpd();}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent='RENDER KO : '+e.message;}}
/* --- selection facon explorateur : clic = selection unique, ctrl/clic = multiple, shift = plage --- */
var MGLASTCLICK=-1;
function bindMgRows(){
 document.querySelectorAll('#mgList .mgrow').forEach(function(row){
  var i=+row.getAttribute('data-mi');
  row.onclick=function(ev){
   if(ev.target.tagName==='INPUT')return;
   if(ev.target.closest('.mgdel'))return;
   ev.preventDefault();
   if(ev.ctrlKey||ev.metaKey){mgToggle(i);MGLASTCLICK=i;}
   else if(ev.shiftKey&&MGLASTCLICK>-1){
    var L=mgFiltered().map(function(o){return o.i;});
    var a=L.indexOf(MGLASTCLICK),b=L.indexOf(i);
    if(a>-1&&b>-1){var s=Math.min(a,b),e=Math.max(a,b);
     MGSEL=L.slice(s,e+1);renderMgList();}}
   else{MGSEL=[i];MGLASTCLICK=i;renderMgList();}
   mgUpdEdit();};
  row.querySelector('input').onchange=function(){mgToggle(i);MGLASTCLICK=i;mgUpdEdit();};
  var del=row.querySelector('.mgdel');
  if(del)del.onclick=function(ev){ev.stopPropagation();mgDelTrackAsk(i);};});
 $('mgAll').checked=mgFiltered().every(function(o){return MGSEL.indexOf(o.i)>-1;});}
function mgToggle(i){var ix=MGSEL.indexOf(i);if(ix>-1)MGSEL.splice(ix,1);else MGSEL.push(i);mgFabUpd();}
function mgAll(on){if(on)MGSEL=mgFiltered().map(function(o){return o.i;});else MGSEL=[];renderMgList();mgUpdEdit();}
/* --- interface d'edition : apparait des qu'on a selectionne --- */
function mgUpdEdit(){
 var n=MGSEL.length;
 $('mgSelBar').style.display=n?'block':'none';
 if(!n){$('mgEditBox').style.display='none';return;}
 $('mgSelBar').textContent=n+' S\u00C9LECTIONN\u00C9(S)';
 $('mgEditBox').style.display='block';
 mgFillEdit();}
function mgFillEdit(){
 var rows=MGSEL.slice().sort(function(a,b){return a-b;});
 var one=rows.length===1;
 var t0=one?TRACKS[rows[0]]:null;
 var g=function(id){var e=$(id);return e?e.value:'';};
 /* si 1 seul : pre-remplir ; si plusieurs : vide + placeholder commun */
 var setv=function(id,val,ph){var e=$(id);if(!e)return;e.value=one?(val||''):'';e.placeholder=one?'':(ph||'');};
 setv('e_title',t0&&t0.title);
 setv('e_file',t0&&t0.file);
 setv('e_tags',t0&&(t0.tags||[]).join(', '));
 setv('e_moods',t0&&(t0.moods||[]).join(', '));
 var ep=$('e_prov');if(ep)ep.value=one?(t0&&t0.prov||'C'):'';
 setv('e_style',t0&&t0.style);
 setv('e_version',t0&&t0.version);
 setv('e_vid',t0&&t0.vid);
 setv('e_desc',t0&&t0.desc);
 setv('e_lyr',t0&&t0.lyricsCreator);
 setv('e_snd',t0&&t0.soundCreator);
 setv('e_date',t0&&t0.recordDate);
 setv('e_img',t0&&t0.img);
 var r=$('e_rating');if(r)r.value=one?(t0&&t0.rating||0):'';
 var rc=$('e_rcommon');if(rc)rc.checked=false;
 var h=one?('MORCEAU #'+(t0.id||'?')+' \u2014 '+esc(t0.title)):rows.length+' morceaux s\u00E9lectionn\u00E9s \u2014 seuls les champs remplis seront appliqu\u00E9s';
 $('mgEditTitle').textContent=h;
 $('mgEditMeta').textContent=one?('fichier : '+(t0.file||'\u2014')+(t0.uploadTime?' \u00B7 upload\u00E9 '+esc(t0.uploadTime.slice(0,16)).replace('T',' '):'')):'';}
async function mgSaveEdit(){
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var rows=MGSEL.slice().sort(function(a,b){return a-b;});
 var one=rows.length===1;
 var v=function(id){var e=$(id);return e?(e.value||'').trim():'';};
 var rc=$('e_rcommon')?$('e_rcommon').checked:false;
 var n=0;
 rows.forEach(function(i){var t=TRACKS[i];if(!t)return;
  if(one){t.title=v('e_title')||t.title;t.file=v('e_file')||t.file;t.desc=v('e_desc');t.vid=v('e_vid');
   t.lyricsCreator=v('e_lyr');t.soundCreator=v('e_snd');t.recordDate=v('e_date');}
  if(v('e_tags')!==''||one)t.tags=v('e_tags')!==''?v('e_tags').split(',').map(function(s){return s.trim();}).filter(Boolean):(one?t.tags||[]:t.tags||[]);
  if(v('e_moods')!==''||one)t.moods=v('e_moods')!==''?v('e_moods').split(',').map(function(s){return s.trim();}).filter(Boolean):(one?t.moods||[]:t.moods||[]);
  if(one)t.prov=v('e_prov')||t.prov||'C';
  else if(v('e_prov')!=='')t.prov=v('e_prov');
  if(v('e_style')!==''||one)t.style=v('e_style');
  if(v('e_version')!==''||one)t.version=v('e_version');
  if(v('e_img')!==''||one)t.img=v('e_img');
  if(one){var rv=$('e_rating').value;if(rv!==''&&!isNaN(+rv))t.rating=+rv;}
  if(rc&&$('e_rating').value!==''){t.rating=+$('e_rating').value;}
  n++;});
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('edition '+(one?'':'en lot ')+n+' morceau(x)');
  await load();renderMgList();$('mgStatus').textContent='\u2713 '+n+' MODIFI\u00C9(S)';}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
async function mgDelSel(){
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var rows=MGSEL.slice().sort(function(a,b){return b-a;});
 var names=rows.map(function(i){return TRACKS[i].title;});
 var withAudio=confirm('Supprimer '+rows.length+' morceau(x) ?\n'+names.join(', ')+'\n\nOK = supprimer AUSSI les fichiers audio\nAnnuler = ne rien faire');
 if(!withAudio)return;
 var audioToo=confirm('SUPPRIMER AUSSI LES FICHIERS AUDIO ?\n\nOK = oui, effacer les .mp3 du repo\nAnnuler = garder les audios, supprimer seulement les entr\u00E9es JSON');
 for(var k=0;k<rows.length;k++){var i=rows[k];var t=TRACKS[i];if(!t)continue;
  if(audioToo&&t.file&&GHTOK){try{await ghDelete(t.file,'suppression audio : '+t.title);}catch(e){}}
  TRACKS.splice(i,1);}
 MGSEL=[];
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('suppression tracks : '+names.join(', '));
  await load();renderMgList();mgUpdEdit();$('mgStatus').textContent='\u2713 SUPPRIM\u00C9';}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
async function mgDelTrackAsk(i){
 var t=TRACKS[i];if(!t)return;
 if(!confirm('Supprimer \u00AB '+t.title+' \u00BB ?'))return;
 var audioToo=confirm('SUPPRIMER AUSSI LE FICHIER AUDIO ('+(t.file||'?')+') ?\n\nOK = oui\nAnnuler = garder l\u0027audio, supprimer seulement l\u0027entr\u00E9e');
 if(audioToo&&t.file&&GHTOK){try{await ghDelete(t.file,'suppression audio : '+t.title);}catch(e){}}
 TRACKS.splice(i,1);MGSEL=[];
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('suppression track : '+t.title);
  await load();renderMgList();mgUpdEdit();$('mgStatus').textContent='\u2713 SUPPRIM\u00C9';}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
async function mgAddToPl(){
 var pl=$('mgPlSel').value;
 if(!pl){$('mgStatus').className='status err';$('mgStatus').textContent='CHOISIS UNE PLAYLIST';return;}
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var P=PLAYLISTS.find(function(x){return x.title===pl;});
 if(!P){$('mgStatus').className='status err';$('mgStatus').textContent='PLAYLIST INTROUVABLE';return;}
 var refs=MGSEL.map(function(i){return TRACKS[i].id||TRACKS[i].title;});
 P.tracks=P.tracks||[];refs.forEach(function(r){if(P.tracks.indexOf(r)<0)P.tracks.push(r);});
 P.upd=new Date().toISOString().slice(0,10);
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('playlist '+pl+' : ajout tracks');$('mgStatus').textContent='\u2713 AJOUT\u00C9S \u00C0 '+pl;await load();renderMgList();}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
function fillMgPlSel(){$('mgPlSel').innerHTML='<option value='+Q+''+Q+'>\u2014 playlist \u2014</option>'+PLAYLISTS.map(function(p){return '<option value='+Q+''+esc(p.title)+''+Q+'>'+esc(p.title)+'</option>';}).join('');}

/* ===== playlists ===== */
function renderMgPlList(){
 try{$('mgPlList').innerHTML=PLAYLISTS.map(function(p,i){
  return '<div class='+Q+'mgrow'+Q+(MGPLSEL.indexOf(i)>-1?' data-on='+Q+'1'+Q:'')+'>'
  +'<input type='+Q+'checkbox'+Q+' data-pi='+Q+''+i+''+Q+(MGPLSEL.indexOf(i)>-1?' checked':'')+' onchange='+Q+'mgPlPick('+i+',this.checked)'+Q+'>'
  +'<div class='+Q+'mt'+Q+'><b>'+esc(p.title)+'</b> <span class='+Q+'ms'+Q+'>'+((p.tracks||[]).length)+' tracks \u00B7 '+esc(p.upd||'')+'</span></div>'
  +'<button class='+Q+'mgdel'+Q+' data-pdel='+Q+''+i+''+Q+' title='+Q+'Supprimer cette playlist'+Q+'>\u{1F5D1}</button>'
  +'<button class='+Q+'btn2 mgs'+Q+' onclick='+Q+'mgEditPlMeta('+i+')'+Q+'>\u270E</button>'
  +'<button class='+Q+'btn2 mgs'+Q+' onclick='+Q+'mgOpenPE('+i+')'+Q+'>\u2611 TRACKLIST</button>'
  +'</div>';}).join('')||'<div style='+Q+'color:var(--dim);padding:12px;font-size:.74rem'+Q+'>AUCUNE PLAYLIST</div>';
 fillMgPlSel();
 document.querySelectorAll('#mgPlList [data-pdel]').forEach(function(b){
  b.onclick=function(ev){ev.stopPropagation();mgDelPlAsk(+b.getAttribute('data-pdel'));};});}
 catch(e){$('mgPlStatus').className='status err';$('mgPlStatus').textContent='RENDER KO : '+e.message;}}
function mgPlPick(i,on){var ix=MGPLSEL.indexOf(i);if(on&&ix<0)MGPLSEL.push(i);if(!on&&ix>-1)MGPLSEL.splice(ix,1);}
async function mgDelPlsSel(){
 if(!MGPLSEL.length){$('mgPlStatus').className='status err';$('mgPlStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var names=MGPLSEL.map(function(i){return PLAYLISTS[i].title;}).join(', ');
 if(!confirm('Supprimer '+MGPLSEL.length+' playlist(s) ?\n'+names))return;
 MGPLSEL.slice().sort(function(a,b){return b-a;}).forEach(function(i){PLAYLISTS.splice(i,1);});MGPLSEL=[];
 mgPublish('suppression playlists : '+names,'mgPlStatus');}
async function mgDelPlAsk(i){var p=PLAYLISTS[i];
 if(!confirm('Supprimer la playlist \u00AB '+p.title+' \u00BB ? (les morceaux ne sont PAS touch\u00E9s)'))return;
 PLAYLISTS.splice(i,1);
 mgPublish('suppression playlist : '+p.title,'mgPlStatus');}
function mgEditPlMeta(i){closeModal('manageModal');editPl(i);}
var MGPEORD=[],MGPEDRAG=-1;
function mgOpenPE(i){MGPL=i;var p=PLAYLISTS[i];
 $('mgPlEdit').style.display='block';$('mgPEQ').value='';
 MGPEORD=(p.tracks||[]).slice();
 $('mgPlStatus').textContent='\u00C9DITION TRACKLIST : '+p.title;renderMgPE();}
function mgPEFiltered(){var q=($('mgPEQ').value||'').toLowerCase().trim();
 return TRACKS.map(function(t,i){return {t:t,i:i};}).filter(function(o){return !q||match(o.t,q);});}
function renderMgPE(){var p=PLAYLISTS[MGPL];if(!p){$('mgPlEdit').style.display='none';return;}
 var inPl=MGPEORD.map(function(r){var t=plMatch(entRef(r));return t?t.title:null;}).filter(Boolean);
 $('mgPEOrder').innerHTML=MGPEORD.map(function(e,ix){
  var sec=e.section||e.SECTION||e.Section;var t=plMatch(entRef(e));
  var disp=sec?('\u258C '+esc(sec)):(entLabel(e)?esc(entLabel(e))+' :: ':'')+(t?esc(t.title):esc(String(entRef(e)!=null?entRef(e):'?')));
  return '<div class='+Q+'mgrow peord'+Q+' draggable='+Q+'true'+Q+' data-oi='+Q+''+ix+''+Q+'><span class='+Q+'mnum'+Q+'>'+(ix+1)+'</span><span style='+Q+'color:var(--dim)'+Q+'>\u2630</span><div class='+Q+'mt'+Q+'><b>'+disp+'</b></div><button class='+Q+'mgdel'+Q+' data-ox='+Q+''+ix+''+Q+'>\u2715</button></div>';}).join('')||'<div style='+Q+'color:var(--dim);padding:10px;font-size:.68rem'+Q+'>VIDE \u2014 coche des morceaux ci-dessous</div>';
 document.querySelectorAll('#mgPEOrder .peord').forEach(function(row){
  var ix=+row.getAttribute('data-oi');
  row.ondragstart=function(){MGPEDRAG=ix;};
  row.ondragover=function(ev){ev.preventDefault();row.style.outline='2px dashed var(--y)';};
  row.ondragleave=function(){row.style.outline='';};
  row.ondrop=function(ev){ev.preventDefault();row.style.outline='';
   if(MGPEDRAG<0||MGPEDRAG===ix)return;
   var it=MGPEORD.splice(MGPEDRAG,1)[0];MGPEORD.splice(ix,0,it);MGPEDRAG=-1;renderMgPE();};
  var rm=row.querySelector('[data-ox]');
  if(rm)rm.onclick=function(ev){ev.stopPropagation();MGPEORD.splice(ix,1);renderMgPE();};});
 $('mgPEList').innerHTML=mgPEFiltered().map(function(o){
  return '<div class='+Q+'mgrow'+Q+'><input type='+Q+'checkbox'+Q+' data-pe='+Q+''+o.i+''+Q+(inPl.indexOf(o.t.title)>-1?' checked':'')+' onchange='+Q+'mgPEPick('+o.i+',this.checked)'+Q+'><div class='+Q+'mt'+Q+'><b>'+esc(o.t.title)+'</b></div></div>';}).join('');}
function mgPEPick(i,on){var t=TRACKS[i];var r=t.id||t.title;var ix=-1;
 MGPEORD.forEach(function(e,k){if(String(entRef(e))===String(r))ix=k;});
 if(on&&ix<0)MGPEORD.push(r);
 if(!on&&ix>-1)MGPEORD.splice(ix,1);
 renderMgPE();}
function mgPEAll(on){mgPEFiltered().forEach(function(o){var t=TRACKS[o.i];var r=t.id||t.title;var ix=-1;
  MGPEORD.forEach(function(e,k){if(String(entRef(e))===String(r))ix=k;});
  if(on&&ix<0)MGPEORD.push(r);
  if(!on&&ix>-1)MGPEORD.splice(ix,1);});
 renderMgPE();}
async function mgPESave(){var p=PLAYLISTS[MGPL];if(!p)return;
 p.tracks=MGPEORD.slice();p.upd=new Date().toISOString().slice(0,10);
 mgPublish('playlist '+p.title+' : tracklist ('+p.tracks.length+')','mgPlStatus');}
async function mgPublish(msg,st){$(st).className='status ok';$(st).textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll(msg);$(st).textContent='\u2713 PUBLI\u00C9';renderMgPlList();await load();}
 catch(e){$(st).className='status err';$(st).textContent=e.message;}}

/* ===== dossiers audio : deplacement par lots ===== */
async function mgMoveFolder(){
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 if(!GHTOK){$('mgStatus').className='status err';$('mgStatus').textContent='TOKEN GITHUB REQUIS';return;}
 var F=$('mgFolder').value;
 if(!F){$('mgStatus').className='status err';$('mgStatus').textContent='CHOISIS UN DOSSIER';return;}
 if(!confirm('D\u00E9placer '+MGSEL.length+' morceau(x) vers audio/'+F+'/ ?'))return;
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 D\u00C9PLACEMENT 0/'+MGSEL.length+'\u2026';
 var done=0,fail=0;
 for(var k=0;k<MGSEL.length;k++){var t=TRACKS[MGSEL[k]];
  try{
   var name=String(t.file||'').split('/').pop();
   var dst='audio/'+F+'/'+name;
   if(t.file!==dst){
    var r=await fetch(encodeURI(t.file)+'?t='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error('DL KO');
    await ghCreate(dst,toB64Buf(await r.arrayBuffer()),'dossier '+F+' : '+name);
    await ghDelete(t.file,'dossier '+F+' : suppression original');
    t.file=dst;}
   done++;
  }catch(e){fail++;}
  $('mgStatus').textContent='\u23F3 D\u00C9PLACEMENT '+(k+1)+'/'+MGSEL.length+'\u2026';}
 try{await publishAll('dossiers audio : '+done+' morceau(x) vers audio/'+F);}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent='PUBLISH KO : '+e.message;return;}
 $('mgStatus').textContent='\u2713 '+done+' D\u00C9PLAC\u00C9(S)'+(fail?' \u2014 '+fail+' \u00C9CHEC(S)':'');
 await load();renderMgList();}

/* ===== remplacement audio : version retravaillee ===== */
async function mgRepAudio(input){
 var f=input.files[0];input.value='';
 if(!f)return;
 if(MGSEL.length!==1){$('mgStatus').className='status err';$('mgStatus').textContent='S\u00C9LECTIONNE EXACTEMENT 1 MORCEAU';return;}
 var t=TRACKS[MGSEL[0]];if(!t||!t.file){$('mgStatus').className='status err';$('mgStatus').textContent='PAS DE FICHIER AUDIO ASSOCI\u00C9';return;}
 if(!GHTOK){$('mgStatus').className='status err';$('mgStatus').textContent='TOKEN GITHUB REQUIS';return;}
 var keep=confirm('REMPLACER L\u0027AUDIO DE \u00AB '+t.title+' \u00BB ?\n\nOK = garder l\u0027original en *_original.ext\nAnnuler = \u00E9craser sans sauvegarde');
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 REMPLACEMENT\u2026';
 try{
  if(keep){var r=await fetch(encodeURI(t.file)+'?t='+Date.now(),{cache:'no-store'});
   if(r.ok){var orig=String(t.file).replace(/\.([a-z0-9]+)$/i,'_original.$1');
    await ghCreate(orig,toB64Buf(await r.arrayBuffer()),'audio original conserv\u00E9 : '+t.title);}}
  await ghCreate(t.file,toB64Buf(await f.arrayBuffer()),'audio retravaill\u00E9 : '+t.title);
  if(confirm('Marquer ce morceau HYBRIDE (B \u2014 retravaill\u00E9, vendable) ?')){t.prov='B';
   try{await publishAll('provenance B : '+t.title);}catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;return;}}
  $('mgStatus').textContent='\u2713 AUDIO REMPLAC\u00C9';
  await load();renderMgList();mgUpdEdit();}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}

/* ===== ajout rapide : 1 morceau -> playlist (depuis les cartes) ===== */

function quickAddPl(i){
 var t=TRACKS[i];if(!t)return;QPLI=i;
 fillQplSel();$('qplNew').style.display='none';$('qplNewIn').value='';
 $('qplWhich').textContent='MORCEAU : '+t.title;
 $('qplStatus').textContent='';$('qplStatus').className='status';
 openModal('qplModal');}
var QPLI=-1;
function fillQplSel(){var sel=$('qplSel');
 sel.innerHTML='<option value="">\u2014 choisir une playlist \u2014</option>'+PLAYLISTS.map(function(p,i){return '<option value="'+i+'">'+esc(p.title)+'</option>';}).join('')+'<option value="__new">+ Nouvelle playlist\u2026</option>';}
function qplSelChg(){$('qplNew').style.display=($('qplSel').value==='__new')?'block':'none';}
async function qplAdd(){
 var st=$('qplStatus'),v=$('qplSel').value,t=TRACKS[QPLI];if(!t)return;
 var p=null;
 if(v==='__new'){var nn=$('qplNewIn').value.trim();
  if(!nn){st.className='status err';st.textContent='TAPE UN NOM DE PLAYLIST';return;}
  p=PLAYLISTS.find(function(x){return x.title===nn;});
  if(!p){p={title:nn,desc:'',tracks:[],upd:new Date().toISOString().slice(0,10)};PLAYLISTS.push(p);}}
 else if(v!==''){p=PLAYLISTS[+v];}
 if(!p){st.className='status err';st.textContent='CHOISIS UNE PLAYLIST';return;}
 if((p.tracks=p.tracks||[]).indexOf(t.title)<0)p.tracks.push(t.title);
 p.upd=new Date().toISOString().slice(0,10);
 st.className='status ok';st.textContent='\u23f3 PUBLICATION\u2026';
 try{await publishAll('ajout : '+t.title+' \u2192 '+p.title);
  st.textContent='\u2713 AJOUT\u00c9 \u00c0 '+p.title;
  setTimeout(function(){closeModal('qplModal');},800);
  await load();}
 catch(e){st.className='status err';st.textContent=e.message;}}


/* ===== fab flottant selection manage ===== */
function mgFabUpd(){var f=$('mgFab');if(!f)return;var mm=$('manageModal');var show=mm&&mm.classList.contains('open')&&MGTAB==='tr'&&MGSEL.length>0;f.className=show?'show':'';var b=f.querySelector('b');if(b)b.textContent=MGSEL.length;}
function mgFabEdit(){if(!MGSEL.length)return;var eb=$('mgEditBox');mgUpdEdit();if(eb&&eb.scrollIntoView)eb.scrollIntoView({behavior:'smooth',block:'nearest'});}
async function mgFabPl(){if(!MGSEL.length)return;var nn=prompt('Nom de la playlist (existante ou nouvelle) :');if(!nn)return;nn=nn.trim();if(!nn)return;
 var P=PLAYLISTS.find(function(x){return x.title===nn;});if(!P){P={title:nn,desc:'',tracks:[],upd:new Date().toISOString().slice(0,10)};PLAYLISTS.push(P);}
 P.tracks=P.tracks||[];MGSEL.forEach(function(i){var t=TRACKS[i];var r=t.id||t.title;if(P.tracks.indexOf(r)<0)P.tracks.push(r);});
 P.upd=new Date().toISOString().slice(0,10);
 $('mgStatus').className='status ok';$('mgStatus').textContent='PUBLICATION...';
 try{await publishAll('playlist '+nn+' : ajout '+MGSEL.length+' morceau(x)');await load();renderMgList();mgFabUpd();$('mgStatus').textContent='AJOUTE(S) A '+nn;}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
