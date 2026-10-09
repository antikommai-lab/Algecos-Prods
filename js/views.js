/* ===== playlist accueil ===== */
function renderPlaylist(){
 if(!PLAYLIST)return;
 $('plTitle').textContent=PLAYLIST.title||'PLAYLIST';
 $('plDesc').textContent=PLAYLIST.desc||'';
 if(PLAYLIST.cover){tryCovers(plCoverPaths(PLAYLIST.cover),function(u){var c=$('plCover');if(u){c.src=u;c.style.display='block';}else c.style.display='none';});}
 else $('plCover').style.display='none';
 var n=0,h='';
 ((PLAYLIST.tracks)||[]).forEach(function(r){
  var sec=entSec(r);
  if(sec){h+='<div class="psec">'+esc(sec)+'</div>';return;}
  var t=plMatch(entRef(r));if(!t)return;n++;
  var lab=entLabel(r);
  h+='<div class="prow" data-t="'+esc(t.title)+'" data-f="'+esc(t.file||'')+'">'
   +(lab?'<span class="plabel">'+esc(lab)+'</span>':'')
   +'<span class="pidx">'+String(n).padStart(2,'0')+'</span>'
   +'<span class="pt"><b>'+esc(t.title)+'</b><small>'+esc(t.style||'')+' · '+esc((t.tags||[]).slice(0,3).join(' / '))+'</small></span>'
   +(t.version?'<span class="pver">'+esc(t.version)+'</span>':'')+'</div>';});
 $('plist').innerHTML=h||'<div style="padding:16px;color:var(--dim);font-size:.75rem">PLAYLIST VIDE</div>';}
function playPlaylist(){var pl=plFlat();if(!pl.length)return;play(pl[0],pl);}

/* ===== toutes les playlists ===== */
function renderPlists(){
 $('plGrid').innerHTML=PLAYLISTS.map(function(p,i){
  var nb=((p.tracks)||[]).map(function(r){return plMatch(entRef(r))?1:0;}).reduce(function(a,b){return a+b;},0);
  return '<div class="plcard" data-i="'+i+'"><button class="edit" data-pe="'+i+'" title="Éditer cette playlist">⚙</button><img class="plc" alt="" style="display:none"><div class="plbox"><h3>'+esc(p.title||'—')+'</h3><div class="pld">'+esc(p.desc||'')+'</div><div class="pln">'+nb+' morceaux</div><button class="btn">Ouvrir</button></div></div>';}).join('')||'<div style="color:var(--dim);padding:20px;text-transform:uppercase;font-size:.75rem">AUCUNE PLAYLIST.</div>';
 document.querySelectorAll('.plcard').forEach(function(cd){
  var p=PLAYLISTS[+cd.getAttribute('data-i')];
  if(p&&p.cover)tryCovers(plCoverPaths(p.cover),function(u){var im=cd.querySelector('.plc');if(u){im.src=u;im.style.display='block';}});
  var eb=cd.querySelector('.edit');
  if(eb)eb.onclick=function(ev){ev.stopPropagation();editPl(+cd.getAttribute('data-i'));};
  cd.onclick=function(){PLAYLIST=PLAYLISTS[+cd.getAttribute('data-i')]||PLAYLIST;renderPlaylist();showView('home');};});}

/* ===== navigation ===== */
function showView(v){
 $('home').classList.toggle('hidden',v!=='home');
 $('listWrap').classList.toggle('open',v==='list');
 $('plistsWrap').classList.toggle('open',v==='plists');
 $('verWrap').classList.toggle('open',v==='ver');
 $('selWrap').classList.toggle('open',v==='sel');
 window.scrollTo({top:0});toggleMenuOff();}
function showList(full){showView(full===true?'list':'home');}
function showPlaylists(){showView('plists');}
function toggleMenu(){$('menu').classList.toggle('open');}
function toggleMenuOff(){var m=$('menu');if(m.classList.contains('open'))m.classList.remove('open');}

/* ===== liste des morceaux ===== */
function stars(n){var s='';for(var i=1;i<=5;i++)s+='<span class="'+(i<=(n||0)?'on':'')+'">★</span>';return s;}
function match(t,q){var hay=[t.title,(t.tags||[]).join(' '),t.desc||'',t.style||'',t.version||'',t.lyricsCreator||'',t.soundCreator||''].join(' ').toLowerCase();return hay.indexOf(q)>-1;}
function cardHTML(t,i){
 var h='<div class="card" data-i="'+i+'">';
 if(t.version)h+='<span class="ver">'+esc(t.version)+'</span>';
 h+='<div class="stars">'+stars(t.rating)+'</div><h3>'+esc(t.title)+'</h3>';
 if(t.style)h+='<div class="style fold" title="cliquer pour déplier">[ '+esc(t.style)+' ]</div>';
 h+='<div class="meta">'+(t.tags||[]).map(function(k){return '<em>'+esc(k)+'</em>';}).join('')+'</div>';
 h+='<div class="info">VO:'+esc(t.lyricsCreator||'—')+' / SND:'+esc(t.soundCreator||'—')+' / '+esc(t.recordDate||'—')+'</div>';
 h+='<div class="desc fold" title="cliquer pour déplier">'+esc(t.desc||'')+'</div>';
 h+='<button class="play" data-i="'+i+'">▶ Écouter</button>';
 h+='<button class="edit" data-e="'+i+'" title="Éditer ce morceau">⚙</button></div>';return h;}
function render(){
 var q=$('q').value.toLowerCase().trim();
 var mo=$('moreOpts')?$('moreOpts').value:'';
 var list=TRACKS.map(function(t,i){return {t:t,i:i};}).filter(function(o){
  var ok=activeTags.length===0||activeTags.some(function(a){return (o.t.tags||[]).indexOf(a)>-1;});
  if(mo==='note4')ok=ok&&(o.t.rating||0)>=4;
  if(mo==='notelow')ok=ok&&(o.t.rating||0)<3;
  if(mo==='noversion')ok=ok&&!(o.t.version||'').trim();
  if(mo==='grp'){var k=vidOf(o.t);ok=ok&&TRACKS.filter(function(x){return vidOf(x)===k;}).length>1;}
  return (!q||match(o.t,q))&&ok;});
 if(mo==='recent')list=list.slice().sort(function(a,b){return String(b.t.recordDate||'').localeCompare(String(a.t.recordDate||''));}).slice(0,10);
 $('count').textContent=list.length+'/'+TRACKS.length+' morceaux';
 $('grid').innerHTML=list.map(function(o){return cardHTML(o.t,o.i);}).join('');
 $('empty').style.display=list.length?'none':'block';
 document.querySelectorAll('.card').forEach(function(card){
  var t=TRACKS[+card.getAttribute('data-i')];if(!t)return;
  tryCovers(trackCoverPaths(t),function(u){if(u)card.style.backgroundImage='linear-gradient(rgba(16,16,16,.86),rgba(16,16,16,.86)),url("'+encodeURI(u)+'")';});});
 document.querySelectorAll('.edit[data-e]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();editTrack(+b.getAttribute('data-e'));};});
 document.querySelectorAll('.card .fold').forEach(function(el){el.onclick=function(ev){ev.stopPropagation();el.classList.toggle('open');};});}

/* ===== viewer images ===== */
function openViewer(im){var all=[].slice.call(document.images).filter(function(x){return x.src;});
 VIEW.imgs=all;VIEW.i=Math.max(0,all.indexOf(im));showViewer();}
function showViewer(){var im=VIEW.imgs[VIEW.i];if(!im)return closeViewer();
 $('imgBig').src=im.src;$('imgBig').classList.remove('zoom');
 $('imgCap').textContent=im.alt||'';
 $('imgModal').classList.add('open');}
function closeViewer(){$('imgModal').classList.remove('open');$('vL').style.display='none';$('vR').style.display='none';}
function vnav(d){if(!VIEW.imgs.length)return;VIEW.i=(VIEW.i+d+VIEW.imgs.length)%VIEW.imgs.length;showViewer();}

function updTicker(){
 var tk=$('ticker'),inner=$('tickInner');if(!tk||!inner)return;
 var lt=null;TRACKS.forEach(function(t){if(t.recordDate&&(!lt||String(t.recordDate)>String(lt.recordDate)))lt=t;});
 var lp=PLAYLISTS.length?PLAYLISTS[PLAYLISTS.length-1]:null;
 var parts=[];
 if(lt)parts.push('⬇ LAST UPLOAD : '+lt.title+(lt.version?' ['+lt.version+']':'')+' — '+lt.recordDate);
 if(lp)parts.push('⚡ LAST PLAYLIST : '+lp.title+(lp.upd?' — '+lp.upd:''));
 if(!parts.length){tk.classList.remove('show');return;}
 inner.textContent=parts.join('   ✦   ');
 tk.classList.add('show');}

/* ===== rester informe : RSS + mail ===== */
function openSub(){$('subChoice').style.display='block';$('subForm').style.display='none';$('subEmail').value='';$('subOk').checked=false;$('subStatus').textContent='';openModal('subModal');}
function subRss(){window.open('feed.xml','_blank');}
function subMail(){$('subChoice').style.display='none';$('subForm').style.display='block';$('subStatus').textContent='';}
function backSub(){$('subChoice').style.display='block';$('subForm').style.display='none';}
async function sendSub(){
 var em=$('subEmail').value.trim();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('subStatus').className='status err';$('subStatus').textContent='ADRESSE MAIL INVALIDE';return;}
 if(!$('subOk').checked){$('subStatus').className='status err';$('subStatus').textContent='IL FAUT COCHER L\'ACCORD POUR RECEVOIR LES MAILS';return;}
 if(!NEWS_ENDPOINT){$('subStatus').className='status err';$('subStatus').textContent='SERVICE MAIL EN COURS DE CONFIGURATION — RÉESSAIE BIENTÔT';return;}
 $('subStatus').className='status ok';$('subStatus').textContent='⏳ INSCRIPTION…';
 try{var r=await fetch(NEWS_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em})});
  if(!r.ok)throw new Error('ERREUR ('+r.status+')');
  $('subStatus').className='status ok';$('subStatus').textContent='✓ INSCRIT — bienvenue !';}
 catch(e){$('subStatus').className='status err';$('subStatus').textContent=e.message;}}

/* ===== header : styles + partage ===== */
function goStyles(){showList(true);var t=document.getElementById('tags');
 if(t){t.scrollIntoView({behavior:'smooth',block:'center'});t.style.outline='2px solid var(--y)';t.style.outlineOffset='4px';
 setTimeout(function(){t.style.outline='';t.style.outlineOffset='';},1800);}}
function shareSite(){var u=location.href,d="ALGECOS-PRODS \u2014 la division musicale d'ANTIKOMM";
 if(navigator.share){navigator.share({title:"ALGECOS-PRODS",text:d,url:u}).catch(function(){});}
 else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){alert("LIEN COPI\u00C9 \u2713\n\nColle-le o\u00F9 tu veux pour partager ALGECOS-PRODS !");},function(){prompt("Copie le lien :",u);});}
 else{prompt("Copie le lien :",u);}}
