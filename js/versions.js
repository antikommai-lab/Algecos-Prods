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
function plFlatOf(p){var old=PLAYLIST,out=[];try{PLAYLIST=p;out=plFlat();}catch(e){}PLAYLIST=old;return out;}
function selCardHTML(p){
 var tr=plFlatOf(p);
 var h='<div class="plh" data-sel="'+esc(p.title)+'">'+(p.cover?'<img class="plc" data-plc="'+esc(p.cover)+'" style="display:none">':'')+'<h3>'+esc(p.title)+'</h3><div class="m">'+esc(p.desc||'')+' \u00b7 '+tr.length+' morceaux'+(p.upd?' \u00b7 '+esc(p.upd):'')+'</div><div class="seltracks">'
  +tr.map(function(t){return '<div class="srow" data-spt="'+esc(t.title)+'"><b>'+esc(t.title)+'</b>'+(t.version?' <span class="ver">'+esc(t.version)+'</span>':'')+'</div>';}).join('')
  +'</div><div class="row" style="margin-top:8px"><button class="btn" data-spp="'+esc(p.title)+'">\u25b6</button><button class="btn" data-sps="'+esc(p.title)+'" title="Lecture al\u00e9atoire">\u21c4</button><button class="btn" data-spr="'+esc(p.title)+'" title="R\u00e9p\u00e9ter en boucle">\u21bb</button></div></div>';
 return h;}

function renderHomeGrid(){var ps=PLAYLISTS.slice().sort(function(a,b){return String(b.upd||'').localeCompare(String(a.upd||''));});$('plGridH').innerHTML=ps.map(selCardHTML).join('');bindSelCards($('plGridH'));
 $('plGridH').querySelectorAll('.plh').forEach(function(cd,i){var p=ps[i];if(!p)return;
  if(p.cover)tryCovers(plCoverPaths(p.cover),function(u){if(u){var im=cd.querySelector('.plc');if(im){im.src=encodeURI(u);im.style.display='block';}}});
  if(p.img)cd.style.backgroundImage='linear-gradient(rgba(16,16,16,.88),rgba(16,16,16,.88)),url("'+encodeURI(p.img.indexOf('/')>0?p.img:'img/'+p.img)+'")';});}

/* ===== ONE TRACK, MANY VARIATIONS ===== */
function varGroups(){var gs={},order=[];
 TRACKS.forEach(function(t){var k=vidOf(t);if(!gs[k]){gs[k]={name:(t.vid||'').trim()||t.title,tracks:[]};order.push(k);}gs[k].tracks.push(t);});
 return order.map(function(k){return gs[k];}).filter(function(g){return g.tracks.length>1;})
  .sort(function(a,b){return b.tracks.length-a.tracks.length;});}
function showVars(){showView('var');renderVars();}
function renderVars(){
 var gs=varGroups(),h='';
 gs.forEach(function(g){
  h+='<div class="vg"><h3>'+esc(g.name)+' <small>('+g.tracks.length+' variations)</small></h3>';
  g.tracks.forEach(function(t){var i=TRACKS.indexOf(t);
   h+='<div class="vrow"><div class="vt"><b>'+esc(t.title)+'</b>'+(t.version?' <span class="ver">'+esc(t.version)+'</span>':'')+'<small>'+esc(t.recordDate||'')+' \u00B7 '+esc(t.style||'')+' \u00B7 '+stars(t.rating)+'</small></div><button class="vbtn" data-vp="'+i+'">\u25B6 \u00C9COUTER</button></div>';});
  h+='</div>';});
 $('varGrid').innerHTML=h||'<div style="color:var(--dim);font-size:.75rem">AUCUNE VARIATION POUR L\u0027INSTANT \u2014 lie des morceaux via un groupe de versions.</div>';
 document.querySelectorAll('#varGrid [data-vp]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();var t=TRACKS[+b.getAttribute('data-vp')];var grp=varGroups().reduce(function(a,gg){return a||gg.tracks.indexOf(t)>-1?gg:null;},null);play(t,grp?grp.tracks:[t]);};});}
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
