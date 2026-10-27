/* ===== versions + s\u00e9lections + home grid ===== */
var PLREP=false;
function shufArr(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

function vidOf(t){return (t.vid||'').trim()||norm(t.title);}
function showVersions(){showView('ver');renderVersions();}
function showSels(){showView('sel');renderSels();}
function renderVersions(){
 var groups={},order=[];
 TRACKS.forEach(function(t){var k=vidOf(t);if(!groups[k]){groups[k]={name:(t.vid||'').trim()||t.title,tracks:[]};order.push(k);}groups[k].tracks.push(t);});
 var h='';
 order.forEach(function(k){var g=groups[k];
  h+='<div class="vg"><h3>'+esc(g.name)+' <small>('+g.tracks.length+' version'+(g.tracks.length>1?'s':'')+')</small></h3>';
  g.tracks.forEach(function(t){var mine=localStorage.getItem('vote_'+t.title)?' mine':'';
   h+='<div class="vrow'+mine+'"><div class="vt"><b>'+esc(t.title)+'</b>'+(t.version?' <span class="ver">'+esc(t.version)+'</span>':'')+'<small>'+esc(t.recordDate||'')+' \u00b7 '+esc(t.style||'')+' \u00b7 '+stars(t.rating)+'</small></div>'+(mine?'<span class="vc">\u2605 TON VOTE</span>':'')+'<button class="vbtn" data-vv="'+esc(t.title)+'">\u2605 VOTER</button></div>';});
  h+='</div>';});
 $('verGrid').innerHTML=h||'<div style="color:var(--dim);font-size:.75rem">AUCUN MORCEAU.</div>';
 document.querySelectorAll('.vbtn').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();voteVer(b.getAttribute('data-vv'));};});}
async function voteVer(ti){
 var t=TRACKS.find(function(x){return x.title===ti;});if(!t)return;
 if(sbReady()&&USER){
  var r=await SB.from('ratings').upsert({track:ti,email:USER.email,stars:5});
  if(r.error){alert('ERREUR VOTE : '+r.error.message);return;}}
 localStorage.setItem('vote_'+ti,'1');
 alert(sbReady()&&USER?'VOTE ENREGISTR\u00c9 \u2713':'VOTE LOCAL \u2713 \u2014 il sera synchronis\u00e9 quand la connexion sera active');
 renderVersions();}
/* (cartes playlists deplacees dans js/playlist.js, accueil dans js/home.js) */
/* ===== ONE TRACK, MANY VARIATIONS ===== */
function varGroups(){var gs={},order=[];
 TRACKS.forEach(function(t){var k=vidOf(t);if(!gs[k]){gs[k]={name:(t.vid||'').trim()||t.title,tracks:[]};order.push(k);}gs[k].tracks.push(t);});
 return order.map(function(k){return gs[k];}).filter(function(g){return g.tracks.length>1;})
  .sort(function(a,b){return b.tracks.length-a.tracks.length;});}
function showVars(){showView('var');renderVars();}
function renderVars(){
 var gs=varGroups(),h='';
 gs.forEach(function(g,gi){
  h+='<div class="vg" data-vgid="'+gi+'"><h3 class="vgH" style="cursor:pointer">'+esc(g.name)+' <small>('+g.tracks.length+' variations)</small><span class="plArr">\u25be</span></h3><div class="vgRows" style="display:none">';
  g.tracks.forEach(function(t){var i=TRACKS.indexOf(t);
   h+='<div class="vrow"><div class="vt"><b>'+esc(t.title)+'</b>'+(t.version?' <span class="ver">'+esc(t.version)+'</span>':'')+'<small>'+esc(t.recordDate||'')+' \u00b7 '+esc(t.style||'')+'</small></div>'+hearts(t)+'<button class="vbtn" data-vp="'+i+'">\u25b6 \u00c9COUTER</button></div>';});
  h+='</div></div>';});
 $('varGrid').innerHTML=h||'<div style="color:var(--dim);font-size:.75rem">AUCUNE VARIATION POUR L\u0027INSTANT \u2014 lie des morceaux via un groupe de versions.</div>';
 document.querySelectorAll('#varGrid .vgH').forEach(function(eh){eh.onclick=function(ev){ev.stopPropagation();var vg=eh.closest('.vg');var rw=vg.querySelector('.vgRows');var o=rw.style.display==='none';rw.style.display=o?'block':'none';vg.classList.toggle('open',o);};});
 document.querySelectorAll('#varGrid [data-vp]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();var t=TRACKS[+b.getAttribute('data-vp')];if(!t)return;
  if(CURRENTLIST.length>1)playSingle(t);else{var grp=varGroups().reduce(function(a,gg){return a||gg.tracks.indexOf(t)>-1?gg:null;},null);play(t,grp?grp.tracks:[t]);}};});}
/* --- gestionnaire admin --- */
var VGCHK=[];
function openVG(pre){openModal('vgModal');VGCHK=(typeof pre==='number'&&pre>-1)?[pre]:[];$('vgQ').value='';$('vgNew').value='';$('vgAdd').value='';renderVG();}
function vgGroups(){var s={},o=[];VGROUPS.forEach(function(g){if(g&&g.name&&!s[g.name]){s[g.name]=0;o.push(g.name);}});TRACKS.forEach(function(t){var v=(t.vid||'').trim();if(!v)return;if(!s[v]){s[v]=0;o.push(v);}s[v]++;});return o.sort();}
function renderVG(){
 $('vgGroup').innerHTML='<option value="">\u2014 groupe existant \u2014</option>'+vgGroups().map(function(g){var n=TRACKS.filter(function(t){return (t.vid||'').trim()===g;}).length;return '<option value="'+esc(g)+'">'+esc(g)+' ('+n+')</option>';}).join('');
 var q=($('vgQ').value||'').toLowerCase().trim();
 $('vgList').innerHTML=TRACKS.map(function(t,i){return {t:t,i:i};}).filter(function(o){return !q||match(o.t,q);}).map(function(o){
  return '<div class="mgrow" data-vi="'+o.i+'"><input type="checkbox" data-vci="'+o.i+'"'+(VGCHK.indexOf(o.i)>-1?' checked':'')+'><span class="mnum">'+(o.t.id||'?')+'</span><div class="mt"><b>'+esc(o.t.title)+'</b>'+(o.t.vid?' <small style="color:var(--dim)">vid:'+esc(o.t.vid)+'</small>':'')+'</div></div>';}).join('')||'<div style="color:var(--dim);padding:10px;font-size:.7rem">AUCUN R\u00C9SULTAT</div>';
 document.querySelectorAll('#vgList [data-vci]').forEach(function(ck){ck.onclick=function(ev){ev.stopPropagation();var i=+ck.getAttribute('data-vci');var ix=VGCHK.indexOf(i);if(ck.checked&&ix<0)VGCHK.push(i);if(!ck.checked&&ix>-1)VGCHK.splice(ix,1);$('vgCount').textContent=VGCHK.length+' S\u00C9LECTIONN\u00C9(S)';};});
 document.querySelectorAll('#vgList .mgrow').forEach(function(row){row.onclick=function(ev){if(ev.target.tagName==='INPUT')return;var i=+row.getAttribute('data-vi');var ix=VGCHK.indexOf(i);if(ix>-1)VGCHK.splice(ix,1);else VGCHK.push(i);renderVG();};});
 $('vgCount').textContent=VGCHK.length+' S\u00C9LECTIONN\u00C9(S)';
 $('vgStatus').textContent='';$('vgStatus').className='status';}
function vgErr(m){$('vgStatus').className='status err';$('vgStatus').textContent=m;}
function vgQuickAdd(){
 var v=$('vgAdd').value.trim();if(!v){vgErr('TAPE UN ID OU UN NOM');return;}
 var t=null;
 if(/^\d+$/.test(v))t=trById(+v);
 if(!t)t=TRACKS.find(function(x){return x.title===v;});
 if(!t)t=TRACKS.find(function(x){return norm(x.title)===norm(v);});
 if(!t){vgErr('INTROUVABLE : '+v+' \u2014 (utilise le formulaire morceau pour le cr\u00E9er d\u0027abord)');return;}
 var i=TRACKS.indexOf(t);
 if(VGCHK.indexOf(i)<0)VGCHK.push(i);
 $('vgAdd').value='';renderVG();}
async function vgApply(){
 if(!VGCHK.length){vgErr('COCHE DES MORCEAUX (ou ajout rapide ID/nom)');return;}
 var nn=$('vgNew').value.trim(),ex=$('vgGroup').value,g=nn||ex;
 if(!g){vgErr('CHOISIS UN GROUPE EXISTANT OU TAPE UN NOM DE NOUVEAU GROUPE');return;}
 if(!GHTOK){vgErr('TOKEN GITHUB REQUIS');return;}
 var names=VGCHK.map(function(i){return TRACKS[i].title;});
 var gi=VGROUPS.findIndex(function(x){return x&&x.name===g;});
 if(gi<0)VGROUPS.push({name:g,upd:new Date().toISOString()});else VGROUPS[gi].upd=new Date().toISOString();
 VGCHK.forEach(function(i){TRACKS[i].vid=g;});
 $('vgStatus').className='status ok';$('vgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('groupe de versions '+g+' : '+names.join(', '));
  VGCHK=[];await load();renderVG();renderVersions();
  $('vgStatus').textContent='\u2713 GROUPE \u00AB '+g+' \u00BB MIS \u00C0 JOUR';}
 catch(e){vgErr(e.message);}}
async function vgClear(){
 if(!VGCHK.length){vgErr('COCHE DES MORCEAUX \u00C0 RETIRER DE LEUR GROUPE');return;}
 if(!GHTOK){vgErr('TOKEN GITHUB REQUIS');return;}
 if(!confirm('Retirer '+VGCHK.length+' morceau(x) de leur groupe de versions ?'))return;
 VGCHK.forEach(function(i){TRACKS[i].vid='';});
 $('vgStatus').className='status ok';$('vgStatus').textContent='\u23F3 PUBLICATION\u2026';
 try{await publishAll('retrait groupe de versions : '+VGCHK.map(function(i){return TRACKS[i].title;}).join(', '));
  VGCHK=[];await load();renderVG();renderVersions();
  $('vgStatus').textContent='\u2713 RETIR\u00C9(S) DU GROUPE';}
 catch(e){vgErr(e.message);}}

async function vgNewGroup(){
 var nn=$('vgNew').value.trim();if(!nn){vgErr('TAPE UN NOM DE NOUVEAU GROUPE');return;}
 if(!GHTOK){vgErr('TOKEN GITHUB REQUIS');return;}
 if(VGROUPS.some(function(x){return x&&x.name===nn;})){vgErr('CE GROUPE EXISTE DEJA');return;}
 VGROUPS.push({name:nn,upd:new Date().toISOString()});
 $('vgStatus').className='status ok';$('vgStatus').textContent='PUBLICATION\u2026';
 try{await publishAll('nouveau groupe de versions : '+nn);await load();renderVG();
  $('vgStatus').textContent='GROUPE \u00ab '+nn+' \u00bb CREE (vide)';}
 catch(e){vgErr(e.message);}}

/* ===== bouton versions (\u266a\u2665) sur cartes + lignes de playlist ===== */
function versOf(t){var k=vidOf(t);return TRACKS.filter(function(x){return vidOf(x)===k;});}
function vqBtn(t){try{if(!t||versOf(t).length<2)return '';}catch(e){return '';}
 return '<button class="vq" data-vqi="'+TRACKS.indexOf(t)+'" title="'+versOf(t).length+' versions \u2014 \u00e9coute-les toutes et vote pour ta pr\u00e9f\u00e9r\u00e9e"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M7 20.5C4.6 18.3 3 16.7 3 15c0-1.2.9-2.1 2-2.1c.6 0 1.3.3 2 .9c.7-.6 1.4-.9 2-.9c1.1 0 2 .9 2 2.1c0 1.7-1.6 3.3-4 5.5z"/><rect x="9.6" y="4" width="1.6" height="10.8"/><path d="M11.2 4c3 1 4.6 2.8 5 5.4c-1.2-1.6-2.8-2.5-5-2.7z"/></svg></button>';}
/* ===== vote 3 coeurs (gris / eclair-neutre / rouge) ===== */
function vote3get(t){try{return localStorage.getItem('vote3_'+t.title)||'';}catch(e){return '';}}
function hearts(t){var v=vote3get(t);
 var P='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
 function b(id,inner,tip){return '<button class="hB'+(v===id?' on':'')+'" data-hb="'+id+'" data-ht="'+esc(t.title)+'" title="'+tip+'">'+inner+'</button>';}
 var G='<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#3a3833" d="'+P+'"/></svg>';
 var N='<svg viewBox="0 0 24 24" width="14" height="14"><defs><linearGradient id="hgr" x1="0" x2="1"><stop offset=".5" stop-color="#3a3833"/><stop offset=".5" stop-color="#ff4d5e"/></linearGradient></defs><path fill="url(#hgr)" d="'+P+'"/><path d="M13 2l-4 9h3l-2 8 7-11h-4z" fill="#FFD700" stroke="#000" stroke-width="1"/></svg>';
 var R='<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#ff4d5e" d="'+P+'"/></svg>';
 return '<span class="hRow">'+b('g',G,'Pas pour moi')+b('n',N,'Vote neutre')+b('r',R,'Ma pr\u00e9f\u00e9r\u00e9e')+'</span>';}
async function vote3(ti,v){
 var t=TRACKS.find(function(x){return x.title===ti;});if(!t)return;
 var old=vote3get(t);
 if(old===v){try{localStorage.removeItem('vote3_'+ti);}catch(e){}}
 else{try{localStorage.setItem('vote3_'+ti,v);}catch(e){}}
 if(sbReady()&&USER){var sv=v==='g'?1:(v==='n'?2:3);if(old===v)sv=0;
  try{await SB.from('ratings').upsert({track:ti,email:USER.email,stars:sv});}catch(e){}}
 if(typeof renderVars==='function')renderVars();
 var p=document.getElementById('pVers');if(p&&p.style.display==='block'&&typeof togglePVers==='function'){p.style.display='none';togglePVers();}
 if(typeof render==='function')render();}
document.addEventListener('click',function(ev){var b=(ev.target&&ev.target.closest)?ev.target.closest('.hB'):null;if(!b)return;ev.stopPropagation();ev.preventDefault();vote3(b.getAttribute('data-ht'),b.getAttribute('data-hb'));},true);
function openVers(i){var t=TRACKS[i];if(!t)return;var grp=versOf(t);
 $('versInfo').textContent=grp.length+' VERSIONS \u2014 \u00e9coute et choisis ta pr\u00e9f\u00e9r\u00e9e';
 $('versList').innerHTML=grp.map(function(u){var j=TRACKS.indexOf(u);
  return '<div class="vrow"><div class="vt"><b>'+esc(u.title)+'</b>'+(u.version?' <span class="ver">'+esc(u.version)+'</span>':'')+(u.bpm?' <small>'+Math.round(u.bpm)+' BPM</small>':'')+'<small>'+esc(u.style||'')+(u.recordDate?' \u00b7 '+esc(u.recordDate):'')+'</small></div>'+hearts(u)+'<button class="vbtn" data-vp2="'+j+'">\u25b6 \u00c9COUTER</button><button class="vbtn" data-vv2="'+esc(u.title)+'">\u2605 VOTER</button></div>';}).join('');
 document.querySelectorAll('#versList [data-vp2]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();var u=TRACKS[+b.getAttribute('data-vp2')];play(u,versOf(u));closeModal('versModal');};});
 document.querySelectorAll('#versList [data-vv2]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();voteVer(b.getAttribute('data-vv2'));};});
 openModal('versModal');}
function closeVers(){closeModal('versModal');}
document.addEventListener('click',function(ev){var b=(ev.target&&ev.target.closest)?ev.target.closest('[data-vqi]'):null;if(b){ev.stopPropagation();ev.preventDefault();openVers(+b.getAttribute('data-vqi'));}},true);
