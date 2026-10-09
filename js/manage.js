/* ===== gestion par lots : tracks + playlists ===== */
var MGTAB='tr',MGSEL=[],MGPL=null;
var Q=String.fromCharCode(34);
function openManage(tab){openModal('manageModal');mgTab(tab||'tr');}
function mgTab(t){MGTAB=t;MGSEL=[];
 $('mgTabTr').className=t==='tr'?'btn':'btn2';$('mgTabPl').className=t==='pl'?'btn':'btn2';
 $('mgTr').style.display=t==='tr'?'block':'none';$('mgPl').style.display=t==='pl'?'block':'none';
 $('mgTitle').textContent=t==='tr'?'Gestion des tracks':'Gestion des playlists';
 $('mgStatus').textContent='';$('mgPlStatus').textContent='';
 if(t==='tr'){renderMgList();}
 else{MGPL=null;$('mgPlEdit').style.display='none';renderMgPlList();}}
function mgFiltered(){var q=($('mgQ').value||'').toLowerCase().trim();
 var L=TRACKS.map(function(t,i){return {t:t,i:i};}).filter(function(o){return !q||match(o.t,q);});
 var s=$('mgSort').value;
 if(s==='date')L.sort(function(a,b){return String(b.t.recordDate||'').localeCompare(String(a.t.recordDate||''));});
 else if(s==='rating')L.sort(function(a,b){return (b.t.rating||0)-(a.t.rating||0);});
 else L.sort(function(a,b){return String(a.t.title||'').localeCompare(String(b.t.title||''));});
 return L;}
function renderMgList(){
 var L=mgFiltered();
 $('mgList').innerHTML=L.map(function(o){
  return '<div class='+Q+'mgrow'+Q+'><input type='+Q+'checkbox'+Q+' data-mi='+Q+''+o.i+''+Q+(MGSEL.indexOf(o.i)>-1?' checked':'')+' onchange='+Q+'mgPick('+o.i+',this.checked)'+Q+'><div class='+Q+'mt'+Q+'><b>'+esc(o.t.title)+'</b>'+(o.t.version?' <span class='+Q+'ver'+Q+'>'+esc(o.t.version)+'</span>':'')+'</div><div class='+Q+'ms'+Q+'>'+esc(o.t.recordDate||'')+' \u00B7 '+stars(o.t.rating)+'</div></div>';}).join('')||'<div style='+Q+'color:var(--dim);padding:12px;font-size:.74rem'+Q+'>AUCUN R\u00C9SULTAT</div>';
 $('mgAll').checked=L.length>0&&L.every(function(o){return MGSEL.indexOf(o.i)>-1;});}
function mgPick(i,on){var ix=MGSEL.indexOf(i);if(on&&ix<0)MGSEL.push(i);if(!on&&ix>-1)MGSEL.splice(ix,1);$('mgAll').checked=mgFiltered().every(function(o){return MGSEL.indexOf(o.i)>-1;});}
function mgAll(on){if(on)MGSEL=mgFiltered().map(function(o){return o.i;});else MGSEL=[];renderMgList();}
function mgEditSel(){if(MGSEL.length!==1){$('mgStatus').className='status err';$('mgStatus').textContent='S\u00C9LECTIONNE 1 MORCEAU';return;}editTrack(MGSEL[0]);}
async function mgDelSel(){if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var names=MGSEL.map(function(i){return TRACKS[i].title;}).join(', ');
 if(!confirm('Supprimer '+MGSEL.length+' morceau(x) ?\n'+names+'\n\n(Audio non touch\u00E9 \u2014 seulement tracks.json)'))return;
 MGSEL.slice().sort(function(a,b){return b-a;}).forEach(function(i){TRACKS.splice(i,1);});MGSEL=[];
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('suppression tracks : '+names);renderMgList();$('mgStatus').textContent='\u2713 SUPPRIM\u00C9';await load();}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
async function mgAddToPl(){
 var pl=$('mgPlSel').value;
 if(!pl){$('mgStatus').className='status err';$('mgStatus').textContent='CHOISIS UNE PLAYLIST';return;}
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var P=PLAYLISTS.find(function(x){return x.title===pl;});
 if(!P){$('mgStatus').className='status err';$('mgStatus').textContent='PLAYLIST INTROUVABLE';return;}
 var refs=MGSEL.map(function(i){return TRACKS[i].title;});
 P.tracks=P.tracks||[];refs.forEach(function(r){if(P.tracks.indexOf(r)<0)P.tracks.push(r);});
 P.upd=new Date().toISOString().slice(0,10);
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('playlist '+pl+' : ajout tracks');$('mgStatus').textContent='\u2713 '+refs.length+' AJOUT\u00C9S \u00C0 '+pl;MGSEL=[];renderMgList();await load();}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
function fillMgPlSel(){$('mgPlSel').innerHTML='<option value='+Q+''+Q+'>\u2014 playlist \u2014</option>'+PLAYLISTS.map(function(p){return '<option value='+Q+''+esc(p.title)+''+Q+'>'+esc(p.title)+'</option>';}).join('');}
function renderMgPlList(){
 $('mgPlList').innerHTML=PLAYLISTS.map(function(p,i){
  return '<div class='+Q+'mgrow'+Q+'><div class='+Q+'mt'+Q+'><b>'+esc(p.title)+'</b> <span class='+Q+'ms'+Q+'>'+((p.tracks||[]).length)+' tracks \u00B7 '+esc(p.upd||'')+'</span></div><button class='+Q+'btn2'+Q+' onclick='+Q+'mgEditPlMeta('+i+')'+Q+'>\u270E</button><button class='+Q+'btn2'+Q+' onclick='+Q+'mgOpenPE('+i+')'+Q+'>\u2611 TRACKLIST</button><button class='+Q+'btn2'+Q+' onclick='+Q+'mgDelPlAsk('+i+')'+Q+'>\u{1F5D1}</button></div>';}).join('')||'<div style='+Q+'color:var(--dim);padding:12px;font-size:.74rem'+Q+'>AUCUNE PLAYLIST</div>';
 fillMgPlSel();}
function mgEditPlMeta(i){closeModal('manageModal');editPl(i);}
function mgDelPlAsk(i){var p=PLAYLISTS[i];
 if(!confirm('Supprimer la playlist \u00AB '+p.title+' \u00BB ?'))return;
 PLAYLISTS.splice(i,1);
 mgPublish('suppression playlist : '+p.title,'mgPlStatus');}
function mgOpenPE(i){MGPL=i;var p=PLAYLISTS[i];
 $('mgPlEdit').style.display='block';$('mgPEQ').value='';
 $('mgPlStatus').textContent='\u00C9DITION TRACKLIST : '+p.title;renderMgPE();}
function mgPEFiltered(){var q=($('mgPEQ').value||'').toLowerCase().trim();
 return TRACKS.map(function(t,i){return {t:t,i:i};}).filter(function(o){return !q||match(o.t,q);});}
function renderMgPE(){var p=PLAYLISTS[MGPL];if(!p){$('mgPlEdit').style.display='none';return;}
 var inPl=(p.tracks||[]).map(function(r){var t=plMatch(entRef(r));return t?t.title:null;}).filter(Boolean);
 $('mgPEList').innerHTML=mgPEFiltered().map(function(o){
  return '<div class='+Q+'mgrow'+Q+'><input type='+Q+'checkbox'+Q+' data-pe='+Q+''+o.i+''+Q+(inPl.indexOf(o.t.title)>-1?' checked':'')+'><div class='+Q+'mt'+Q+'><b>'+esc(o.t.title)+'</b>'+(o.t.version?' <span class='+Q+'ver'+Q+'>'+esc(o.t.version)+'</span>':'')+'</div></div>';}).join('');}
function mgPEAll(on){document.querySelectorAll('#mgPEList input[data-pe]').forEach(function(x){x.checked=on;});}
async function mgPESave(){var p=PLAYLISTS[MGPL];if(!p)return;
 var sel=[];document.querySelectorAll('#mgPEList input[data-pe]').forEach(function(x){if(x.checked)sel.push(TRACKS[+x.getAttribute('data-pe')].title);});
 p.tracks=sel;p.upd=new Date().toISOString().slice(0,10);
 mgPublish('playlist '+p.title+' : tracklist ('+sel.length+')','mgPlStatus');}
async function mgPublish(msg,st){$(st).className='status ok';$(st).textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll(msg);$(st).textContent='\u2713 PUBLI\u00C9';renderMgPlList();await load();}
 catch(e){$(st).className='status err';$(st).textContent=e.message;}}
async function mgApplyTags(){
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var raw=$('mgTagIn').value.trim();
 if(!raw){$('mgStatus').className='status err';$('mgStatus').textContent='RENSIGNE AU MOINS 1 TAG';return;}
 var adds=raw.split(',').map(function(s){return s.trim();}).filter(Boolean);
 var n=0;
 MGSEL.forEach(function(i){var t=TRACKS[i];t.tags=t.tags||[];
  adds.forEach(function(a){if(t.tags.map(function(x){return x.toLowerCase();}).indexOf(a.toLowerCase())<0){t.tags.push(a);n++;}});});
 if(!n){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN \u00C0 AJOUTER (d\u00E9j\u00E0 taggu\u00E9s)';return;}
 if(!confirm('Ajouter '+adds.join(', ')+' \u00E0 '+MGSEL.length+' morceau(x) ?'))return;
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('tags en lot : '+adds.join(', '));$('mgStatus').textContent='\u2713 '+n+' TAG(S) AJOUT\u00C9S';renderMgList();await load();}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}
async function mgApplyStyle(){
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 var st=$('mgStyleIn').value.trim();
 if(!st){$('mgStatus').className='status err';$('mgStatus').textContent='RENSIGNE UN STYLE';return;}
 if(!confirm('Remplacer le style par \u00AB '+st+' \u00BB sur '+MGSEL.length+' morceau(x) ?'))return;
 MGSEL.forEach(function(i){TRACKS[i].style=st;});
 $('mgStatus').className='status ok';$('mgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('style en lot : '+st);$('mgStatus').textContent='\u2713 STYLE APPLIQU\u00C9 ('+MGSEL.length+')';renderMgList();await load();}
 catch(e){$('mgStatus').className='status err';$('mgStatus').textContent=e.message;}}

/* ===== dossiers audio : deplacement par lots ===== */
async function mgMoveFolder(){
 if(!MGSEL.length){$('mgStatus').className='status err';$('mgStatus').textContent='RIEN S\u00C9LECTIONN\u00C9';return;}
 if(!GHTOK){$('mgStatus').className='status err';$('mgStatus').textContent='TOKEN GITHUB REQUIS';return;}
 var F=$('mgFolder').value;
 if(!F){$('mgStatus').className='status err';$('mgStatus').textContent='CHOISIS UN DOSSIER';return;}
 if(!confirm('D\u00E9placer '+MGSEL.length+' morceau(x) vers audio/'+F+'/ ?\n\nChaque fichier est recopi\u00E9 dans le sous-dossier puis l\u0027original est supprim\u00E9.'))return;
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
