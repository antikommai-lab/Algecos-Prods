/* ===== mode lots : cocher des morceaux dans la liste ===== */
var LOTSMODE=false,LOTCARD=[],LASTLIST=[];
function toggleLots(){LOTSMODE=!LOTSMODE;LOTCARD=[];render();updLotsBtns();}
function updLotsBtns(){
 var b=$('btnLots');if(!b)return;
 b.innerHTML=LOTSMODE?'\u2611 LOTS':'\u2610 LOTS';
 $('btnLotsAll').style.display=LOTSMODE?'inline-block':'none';
 $('btnLotsGo').style.display=(LOTSMODE||LOTCARD.length)?'inline-block':'none';
 $('btnLotsAll').textContent=(LOTCARD.length&&LOTCARD.length===LASTLIST.length)?'\u2610 TOUT D\u00C9COCHER':'\u2713 TOUT COCHER';}
function lotsAll(){
 if(LOTCARD.length&&LOTCARD.length===LASTLIST.length)LOTCARD=[];
 else LOTCARD=LASTLIST.map(function(o){return o.i;});
 render();updLotsBtns();}
function lotsGo(){
 if(!LOTCARD.length){alert('RIEN COCH\u00C9');return;}
 MGSEL=LOTCARD.slice().sort(function(a,b){return a-b;});
 LOTSMODE=false;LOTCARD=[];updLotsBtns();
 openManage('tr');mgUpdEdit();}

/* ===== timestamp d'ajout ===== */
function upTime(t){var u=t.uploadTime;if(u)return String(u);
 return t.added?String(t.added)+'T00:00:00':'1970-01-01T00:00:00';}
function upClock(t){return (t.uploadTime&&t.uploadTime.indexOf('T00:00')<0)?' '+t.uploadTime.slice(11,16):'';}

/* ===== playlist accueil ===== */
function renderPlaylist(){
 if(!PLAYLIST)return;
 var adm=document.body.classList.contains('adm');
 var pi=PLAYLISTS.indexOf(PLAYLIST);
 if(adm&&pi>-1){
  $('plTitle').innerHTML=esc(PLAYLIST.title||'PLAYLIST')+' <button class="edit" onclick="editPl('+pi+')" title="Editer cette playlist">\u2699</button>';
 }
 else $('plTitle').textContent=PLAYLIST.title||'PLAYLIST';
 $('plDesc').textContent=PLAYLIST.desc||'';
 /* fond d'ecran : cover playlist (img explicite ou convention) */
 var covP=PLAYLIST.img?(PLAYLIST.img.indexOf('/')>0?PLAYLIST.img:plCoverPaths(PLAYLIST.img)):plCoverPaths(PLAYLIST.cover||'');
 if(covP&&covP.length)tryCovers(covP,function(u){var c=$('plCover'),w=$('plist');
  if(u){c.src=u;c.style.display='block';w.style.backgroundImage='linear-gradient(rgba(16,16,16,.92),rgba(16,16,16,.92)),url("'+encodeURI(u)+'")';}
  else{c.style.display='none';w.style.backgroundImage='';}});
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
   +'<span class="pt"><b>'+esc(t.title)+'</b><small>'+esc(t.style||'')+' Â· '+esc((t.tags||[]).slice(0,3).join(' / '))+'</small></span>'
   +(t.version?'<span class="pver">'+esc(t.version)+'</span>':'')
   +(adm?'<button class="edit" data-et="'+TRACKS.indexOf(t)+'" title="Editer ce morceau">\u2699</button>':'')+'</div>';});
 $('plist').innerHTML=h||'<div style="padding:16px;color:var(--dim);font-size:.75rem">PLAYLIST VIDE</div>';
 if(adm)document.querySelectorAll('#plist .edit[data-et]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();editTrack(+b.getAttribute('data-et'));};});}
function playPlaylist(){var pl=plFlat();if(!pl.length)return;play(pl[0],pl);}

/* ===== toutes les playlists ===== */
function renderPlists(){
 var all=PLAYLISTS.concat(autoPlaylists());
 $('plGrid').innerHTML=all.map(function(p,i){
  var nb=((p.tracks)||[]).map(function(r){return plMatch(entRef(r))?1:0;}).reduce(function(a,b){return a+b;},0);
 return '<div class="plcard" data-i="'+i+'">'+(p.auto?'':'<button class="edit" data-pe="'+i+'" title="Editer cette playlist">&#9881;</button>')+'<button class="pbtn shB2" data-shp="'+i+'" title="Partager cette playlist">&#10548;</button><img class="plc" alt="" style="display:none"><div class="plbox"><h3>'+esc(p.title||'â')+(p.auto?' <span style="color:var(--y);font-size:.55rem;border:1px solid var(--y);padding:1px 4px">AUTO</span>':'')+'</h3><div class="pld">'+esc(p.desc||'')+'</div><div class="pln">'+nb+' morceaux</div><button class="btn">Ouvrir</button></div></div>';}).join('')||'<div style="color:var(--dim);padding:20px;text-transform:uppercase;font-size:.75rem">AUCUNE PLAYLIST.</div>';
 document.querySelectorAll('.plcard').forEach(function(cd){
  var p=all[+cd.getAttribute('data-i')];
  if(p&&p.cover&&!p.auto)tryCovers(plCoverPaths(p.cover),function(u){var im=cd.querySelector('.plc');if(u){im.src=u;im.style.display='block';}});
  var eb=cd.querySelector('.edit');
  if(eb)eb.onclick=function(ev){ev.stopPropagation();editPl(PLAYLISTS.indexOf(p));};
  var sb=cd.querySelector('[data-shp]');
  if(sb)sb.onclick=function(ev){ev.stopPropagation();sharePl(p);};
  cd.onclick=function(){PLAYLIST=p||PLAYLIST;renderPlaylist();showView('home');};});}

/* ===== navigation ===== */
function showView(v){
 $('home').classList.toggle('hidden',v!=='home');
 $('listWrap').classList.toggle('open',v==='list');
 $('plistsWrap').classList.toggle('open',v==='plists');
 $('verWrap').classList.toggle('open',v==='ver');
 $('selWrap').classList.toggle('open',v==='sel');
 $('newsWrap').classList.toggle('open',v==='news');
 $('varWrap').classList.toggle('open',v==='var');
 $('orderWrap').classList.toggle('open',v==='order');
 window.scrollTo({top:0});toggleMenuOff();}
function showList(full){showView(full===true?'list':'home');}
function showPlaylists(){showView('plists');}
function showNews(){showView('news');renderNews();}
function toggleMenu(){$('menu').classList.toggle('open');}
function toggleMenuOff(){var m=$('menu');if(m.classList.contains('open'))m.classList.remove('open');}

/* ===== liste des morceaux ===== */
function stars(n){var s='';for(var i=1;i<=5;i++)s+='<span class="'+(i<=(n||0)?'on':'')+'">â</span>';return s;}
function match(t,q){var hay=[t.title,(t.tags||[]).join(' '),(t.moods||[]).join(' '),t.desc||'',t.style||'',t.version||'',t.lyricsCreator||'',t.soundCreator||''].join(' ').toLowerCase();return hay.indexOf(q)>-1;}
function cardHTML(t,i){
 var h='<div class="card" data-i="'+i+'">';
 if(LOTSMODE||document.body.classList.contains('adm'))h+='<input type="checkbox" class="lotck" data-li="'+i+'"'+(LOTCARD.indexOf(i)>-1?' checked':'')+' style="position:absolute;top:10px;left:10px;z-index:5;width:20px;height:20px;cursor:pointer">';
 if(t.version)h+='<span class="ver">'+esc(t.version)+'</span>';
 h+='<div class="stars">'+stars(t.rating)+'</div><h3>'+esc(t.title)+'</h3>';
 h+=provBadge(t);
 if(t.style)h+='<div class="style fold" title="cliquer pour dÃ©plier">[ '+esc(t.style)+' ]</div>';
 h+='<div class="meta fold">'+(t.tags||[]).map(function(k){return '<em>'+esc(k)+'</em>';}).join('')+'</div>';
 if((t.moods||[]).length)h+='<div class="meta fold">'+(t.moods||[]).map(function(k){return '<em style="color:var(--y);border-color:var(--y)">'+esc(k)+'</em>';}).join('')+'</div>';
 h+='<div class="info">VO:'+esc(t.lyricsCreator||'â')+' / SND:'+esc(t.soundCreator||'â')+' / '+esc(t.recordDate||'â')+(t.added?' / +'+esc(t.added)+upClock(t):'')+'</div>';
 h+='<div class="desc fold" title="cliquer pour dÃ©plier">'+esc(t.desc||'')+'</div>';
 h+='<button class="play" data-i="'+i+'">â¶ Ãcouter</button>';
 h+='<button class="edit" data-e="'+i+'" title="Ãditer ce morceau">â</button><button class="shB" data-shtr="'+i+'" title="Partager ce morceau">&#10548;</button>';
 if(document.body.classList.contains('adm'))h+='<button class="edit" data-vg="'+i+'" title="Ajouter au groupe de versions" style="top:76px">&#9854;</button><button class="edit" data-qpl="'+i+'" title="Ajouter Ã  une playlist" style="top:108px">&#9776;</button>';
 h+='</div>';return h;}
function bindCards(root){
 root.querySelectorAll('.card').forEach(function(card){
  var t=TRACKS[+card.getAttribute('data-i')];if(!t)return;
  var cps=t.img?(t.img.indexOf('/')>0?[t.img]:trackCoverPaths(t.img)):trackCoverPaths(t);
  tryCovers(cps,function(u){if(u)card.style.backgroundImage='linear-gradient(rgba(16,16,16,.86),rgba(16,16,16,.86)),url("'+encodeURI(u)+'")';});});
 root.querySelectorAll('.edit[data-e]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();editTrack(+b.getAttribute('data-e'));};});
 root.querySelectorAll('.card .fold').forEach(function(el){el.onclick=function(ev){ev.stopPropagation();el.classList.toggle('open');};setTimeout(function(){if(el.scrollHeight<=el.clientHeight+2)el.classList.add('nofold');},120);});
 root.querySelectorAll('.card .play').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();play(TRACKS[+b.getAttribute('data-i')],[TRACKS[+b.getAttribute('data-i')]]);};});
 root.querySelectorAll('.card [data-vg]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();openVG(+b.getAttribute('data-vg'));};});
 root.querySelectorAll('.card [data-qpl]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();quickAddPl(+b.getAttribute('data-qpl'));};});
 root.querySelectorAll('.lotck').forEach(function(ck){
  ck.onclick=function(ev){ev.stopPropagation();};
  ck.onchange=function(){var i=+ck.getAttribute('data-li');var ix=LOTCARD.indexOf(i);
   if(ck.checked&&ix<0)LOTCARD.push(i);
   if(!ck.checked&&ix>-1)LOTCARD.splice(ix,1);
   updLotsBtns();};});}
function render(){
 var q=$('q').value.toLowerCase().trim();
 var mo=$('moreOpts')?$('moreOpts').value:'';
 var st=$('sortSel')?$('sortSel').value:'';
 var list=TRACKS.map(function(t,i){return {t:t,i:i};}).filter(function(o){
  var ok=activeTags.length===0||activeTags.some(function(a){return (o.t.tags||[]).indexOf(a)>-1;});
  if(mo==='note4')ok=ok&&(o.t.rating||0)>=4;
  if(mo==='notelow')ok=ok&&(o.t.rating||0)<3;
  if(mo==='noversion')ok=ok&&!(o.t.version||'').trim();
  if(mo==='grp'){var k=vidOf(o.t);ok=ok&&TRACKS.filter(function(x){return vidOf(x)===k;}).length>1;}
  return (!q||match(o.t,q))&&ok;});
 /* --- tri --- */
 if(st==='az')list.sort(function(a,b){return String(a.t.title).localeCompare(String(b.t.title),'fr');});
 else if(st==='za')list.sort(function(a,b){return String(b.t.title).localeCompare(String(a.t.title),'fr');});
 else if(st==='rec')list.sort(function(a,b){return String(b.t.recordDate||'').localeCompare(String(a.t.recordDate||''));});
 else if(st==='old')list.sort(function(a,b){return String(a.t.recordDate||'').localeCompare(String(b.t.recordDate||''));});
 else if(st==='add')list.sort(function(a,b){return upTime(b.t).localeCompare(upTime(a.t));});
 else if(st==='note')list.sort(function(a,b){return (b.t.rating||0)-(a.t.rating||0);});
 else if(st==='style')list.sort(function(a,b){return String(a.t.style||'').localeCompare(String(b.t.style||''),'fr')||String(a.t.title).localeCompare(String(b.t.title),'fr');});
 if(mo==='recent')list=list.slice().sort(function(a,b){return upTime(b.t).localeCompare(upTime(a.t));}).slice(0,10);
 LASTLIST=list;
 $('count').textContent=list.length+'/'+TRACKS.length+' morceaux';
 $('grid').innerHTML=list.map(function(o){return cardHTML(o.t,o.i);}).join('');
 $('empty').style.display=list.length?'none':'block';
 bindCards($('grid'));
}

/* ===== onglet nouveautes ===== */
function renderNews(){
 var list=TRACKS.slice().sort(function(a,b){return upTime(b).localeCompare(upTime(a));}).slice(0,30);
 $('countNews').textContent=list.length+' DERNIERS AJOUTS';
 $('newsGrid').innerHTML=list.map(function(t){return cardHTML(t,TRACKS.indexOf(t));}).join('');
 bindCards($('newsGrid'));}

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
 var lt=null;TRACKS.forEach(function(t){if(!lt||upTime(t)>upTime(lt))lt=t;});
 var lp=null;PLAYLISTS.forEach(function(p){if(!lp||String(p.upd||'')>String(lp.upd||''))lp=p;});
 var parts=[];
 if(lt)parts.push('â¬ LAST UPLOAD : '+lt.title+(lt.version?' ['+lt.version+']':'')+' â '+(lt.uploadTime?lt.uploadTime.slice(0,10):(lt.added||lt.recordDate||'')));
 if(lp)parts.push('â¡ LAST PLAYLIST : '+lp.title+(lp.upd?' â '+lp.upd:''));
 if(!parts.length){tk.classList.remove('show');return;}
 inner.textContent=parts.join('   â¦   ');
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
 if(!NEWS_ENDPOINT){$('subStatus').className='status err';$('subStatus').textContent='SERVICE MAIL EN COURS DE CONFIGURATION â RÃESSAIE BIENTÃT';return;}
 $('subStatus').className='status ok';$('subStatus').textContent='â³ INSCRIPTIONâ¦';
 try{var r=await fetch(NEWS_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em})});
  if(!r.ok)throw new Error('ERREUR ('+r.status+')');
  $('subStatus').className='status ok';$('subStatus').textContent='â INSCRIT â bienvenue !';}
 catch(e){$('subStatus').className='status err';$('subStatus').textContent=e.message;}}

/* ===== header : styles + partage ===== */
function goStyles(){showList(true);var t=document.getElementById('tags');
 if(t){t.scrollIntoView({behavior:'smooth',block:'center'});t.style.outline='2px solid var(--y)';t.style.outlineOffset='4px';
 setTimeout(function(){t.style.outline='';t.style.outlineOffset='';},1800);}}
function shareSite(){var u=location.href,d="ALGECOS-PRODS \u2014 la division musicale d'ANTIKOMM";
 if(navigator.share){navigator.share({title:"ALGECOS-PRODS",text:d,url:u}).catch(function(){});}
 else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){alert("LIEN COPI\u00C9 \u2713\n\nColle-le o\u00F9 tu veux pour partager ALGECOS-PRODS !");},function(){prompt("Copie le lien :",u);});}
 else{prompt("Copie le lien :",u);}}

/* ===== partage morceaux / playlists / site ===== */
var SHARE={title:'',url:''};
function openShare(title,url){SHARE={title:title,url:url};
 var sw=document.getElementById('shareWhat');if(sw)sw.textContent=title+' \u2014 '+url;
 var t=encodeURIComponent(title),u=encodeURIComponent(url);
 document.getElementById('shX').href='https://twitter.com/intent/tweet?text='+t+'&url='+u;
 document.getElementById('shFb').href='https://www.facebook.com/sharer/sharer.php?u='+u;
 document.getElementById('shWa').href='https://wa.me/?text='+t+'%20'+u;
 document.getElementById('shTg').href='https://t.me/share/url?url='+u+'&text='+t;
 document.getElementById('shMail').href='mailto:?subject='+t+'&body='+u;
 document.getElementById('shareModal').classList.add('open');}
function shareNative(){if(navigator.share){navigator.share({title:SHARE.title,text:SHARE.title,url:SHARE.url}).catch(function(){});}
 else copyShare();}
function copyShare(){
 if(navigator.clipboard){navigator.clipboard.writeText(SHARE.url).then(function(){alert('LIEN COPI\u00C9 \u2713');},function(){prompt('Copie le lien :',SHARE.url);});}
 else prompt('Copie le lien :',SHARE.url);}
function shareTrack(t){if(!t)return;openShare(t.title,location.origin+location.pathname+'?t='+encodeURIComponent(t.title));}
function sharePl(p){if(!p)return;openShare(p.title,location.origin+location.pathname+'?p='+encodeURIComponent(p.title));}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-shtr]');
 if(b){e.stopPropagation();shareTrack(TRACKS[+b.getAttribute('data-shtr')]);}});
function applyDeepLink(){
 try{var q=new URLSearchParams(location.search);var t=q.get('t'),p=q.get('p');
  if(t){var tr=TRACKS.find(function(x){return x.title===t;});if(tr)play(tr,[tr]);}
  else if(p){var pl=PLAYLISTS.find(function(x){return x.title===p;})||(typeof autoPlaylists==='function'?autoPlaylists():[]).find(function(x){return x.title===p;});
   if(pl){PLAYLIST=pl;renderPlaylist();showView('home');var fl=plFlat();if(fl.length)play(fl[0],fl);}}}
 catch(e){}}
function hitCounter(){
 try{fetch('https://abacus.jasoncameron.dev/hit/AlgecosProds/visites').then(function(r){return r.json();}).then(function(d){
  var e=document.getElementById('vCount');if(e&&d.value)e.textContent='\u{1F441} '+d.value+' visites';}).catch(function(){});}
 catch(e){}}

/* ===== provenance (A humain / B hybride / C IA) ===== */
function provOf(t){return t&&t.prov==='A'||t&&t.prov==='B'?t.prov:'C';}
function provBadge(t){var p=provOf(t);
 var lbl=p==='A'?'HUMAIN':(p==='B'?'HYBRIDE â VENDABLE':'IA â NON VENDABLE');
 var tip=p==='A'?'CrÃ©ation humaine':(p==='B'?'IA retravaillÃ©e par l\u0027artiste â vendable, non exclusif':'GÃ©nÃ©rÃ© par IA â non vendable, partage gratuit uniquement');
 return '<span class="pbadge pb'+p+'" title="'+tip+'">'+lbl+'</span>';}
/* ===== commande sur mesure ===== */
function goOrder(){showView('order');}
function sendOrder(){
 var ty=$('o_type').value,d=$('o_desc').value.trim(),st=$('o_style').value.trim();
 if(!d){$('oStatus').className='status err';$('oStatus').textContent='D\u00C9CRIS TA COMMANDE D\u0027ABORD';return;}
 var body='COMMANDE : '+ty+String.fromCharCode(10)+String.fromCharCode(10)+d+(st?String.fromCharCode(10)+String.fromCharCode(10)+'Styles : '+st:'')+String.fromCharCode(10)+String.fromCharCode(10)+'â envoy\u00E9 depuis le site ALGECOS-PRODS';
 window.location.href='mailto:algecosprods@gmail.com?subject='+encodeURIComponent('[COMMANDE] '+ty)+'&body='+encodeURIComponent(body);
 $('oStatus').className='status ok';$('oStatus').textContent='TON LOGICIEL MAIL S\u0027OUVRE â ENVOIE LE MESSAGE';}

