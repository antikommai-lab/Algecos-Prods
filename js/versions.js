/* ===== versions + sélections + home grid ===== */
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
   h+='<div class="vrow'+mine+'"><div class="vt"><b>'+esc(t.title)+'</b>'+(t.version?' <span class="ver">'+esc(t.version)+'</span>':'')+'<small>'+esc(t.recordDate||'')+' · '+esc(t.style||'')+' · '+stars(t.rating)+'</small></div>'+(mine?'<span class="vc">★ TON VOTE</span>':'')+'<button class="vbtn" data-vv="'+esc(t.title)+'">★ VOTER</button></div>';});
  h+='</div>';});
 $('verGrid').innerHTML=h||'<div style="color:var(--dim);font-size:.75rem">AUCUN MORCEAU.</div>';
 document.querySelectorAll('.vbtn').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();voteVer(b.getAttribute('data-vv'));};});}
async function voteVer(ti){
 var t=TRACKS.find(function(x){return x.title===ti;});if(!t)return;
 if(sbReady()&&USER){
  var r=await SB.from('ratings').upsert({track:ti,email:USER.email,stars:5});
  if(r.error){alert('ERREUR VOTE : '+r.error.message);return;}}
 localStorage.setItem('vote_'+ti,'1');
 alert(sbReady()&&USER?'VOTE ENREGISTRÉ ✓':'VOTE LOCAL ✓ — il sera synchronisé quand la connexion sera active');
 renderVersions();}
function plFlatOf(p){var old=PLAYLIST,out=[];try{PLAYLIST=p;out=plFlat();}catch(e){}PLAYLIST=old;return out;}
function selCardHTML(p){
 var tr=plFlatOf(p);
 var h='<div class="plh" data-sel="'+esc(p.title)+'"><h3>'+esc(p.title)+'</h3><div class="m">'+esc(p.desc||'')+' · '+tr.length+' morceaux'+(p.upd?' · '+esc(p.upd):'')+'</div><div class="seltracks">'
  +tr.map(function(t){return '<div class="srow" data-spt="'+esc(t.title)+'"><b>'+esc(t.title)+'</b>'+(t.version?' <span class="ver">'+esc(t.version)+'</span>':'')+'</div>';}).join('')
  +'</div><div class="row" style="margin-top:8px"><button class="btn" data-spp="'+esc(p.title)+'">▶ LIRE</button></div></div>';
 return h;}

function renderHomeGrid(){var ps=PLAYLISTS.slice().sort(function(a,b){return String(b.upd||'').localeCompare(String(a.upd||''));});$('plGridH').innerHTML=ps.map(selCardHTML).join('');bindSelCards($('plGridH'));}