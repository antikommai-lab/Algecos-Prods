/* ===== accueil : derniers ajouts + grilles albums/playlists ===== */
var PGEXP=false;
function renderHomeGrid(){
 var albums=PLAYLISTS.filter(function(p){return p.album;});
 var pls=PLAYLISTS.filter(function(p){return !p.album;}).slice().sort(function(a,b){return String(b.upd||'').localeCompare(String(a.upd||''));});
 var hl=$('homeLast');
 if(hl){
  var lastAl=albums[albums.length-1]||null;
  var lastPl=pls[0]||null;
  var lt=null;TRACKS.forEach(function(t){if(!lt||upTime(t)>upTime(lt))lt=t;});
  var h='<h2 class="secH">\u2605 Derniers ajouts</h2><div id="hlGrid">';
  if(lastAl)h+='<div class="hlCard hlAl"><img class="hlcv" data-hcv="al" style="display:none"><small>DERNIER ALBUM</small><b>'+esc(lastAl.title)+'</b><span class="m">'+plFlatOf(lastAl).length+' morceaux</span><button class="btn" data-hlp="al">\u25b6 \u00c9COUTER</button></div>';
  else h+='<div class="hlCard"><small>DERNIER ALBUM</small><b>\u2014</b></div>';
  if(lastPl)h+='<div class="hlCard"><img class="hlcv" data-hcv="pl" style="display:none"><small>DERNI\u00c8RE PLAYLIST</small><b>'+esc(lastPl.title)+'</b><span class="m">'+plFlatOf(lastPl).length+' morceaux</span><button class="btn" data-hlp="pl">\u25b6 \u00c9COUTER</button></div>';
  else h+='<div class="hlCard"><small>DERNI\u00c8RE PLAYLIST</small><b>\u2014</b></div>';
  if(lt)h+='<div class="hlCard"><img class="hlcv" data-hcv="tr" style="display:none"><small>DERNIER TRACK</small><b>'+esc(lt.title)+'</b><span class="m">'+esc(lt.style||'')+(lt.bpm?' \u00b7 '+Math.round(lt.bpm)+' BPM':'')+(lt.version?' ['+esc(lt.version)+']':'')+'</span><button class="btn" data-hlt="'+TRACKS.indexOf(lt)+'">\u25b6 \u00c9COUTER</button></div>';
  else h+='<div class="hlCard"><small>DERNIER TRACK</small><b>\u2014</b></div>';
  h+='</div>';
  if(albums.length){h+='<h2 class="secH">\u{1F4BF} Albums</h2><div id="hlAl">'+albums.map(function(p){return selCardHTML(p);}).join('')+'</div>';}
  hl.innerHTML=h;
  if(albums.length){bindSelCards($('hlAl'));
   $('hlAl').querySelectorAll('.plh').forEach(function(cd,i){var p=albums[i];if(!p)return;
    if(p.cover)tryCovers(plCoverPaths(p.cover),function(u){if(u){var im=cd.querySelector('.plc');if(im){im.src=encodeURI(u);im.style.display='block';}}});
    if(p.img)cd.style.backgroundImage='linear-gradient(rgba(16,16,16,.88),rgba(16,16,16,.88)),url("'+encodeURI(p.img.indexOf('/')>0?p.img:'img/'+p.img)+'")';});}
  var hlBg=function(im,u){if(!im||!u)return;im.src=encodeURI(u);im.style.display='block';var cd=im.closest('.hlCard');if(cd)cd.style.backgroundImage='linear-gradient(rgba(16,16,16,.86),rgba(16,16,16,.86)),url("'+encodeURI(u)+'")';};
  var hcv=function(sel,p){var im=hl.querySelector('[data-hcv="'+sel+'"]');if(!im||!p)return;
   if(p.cover)tryCovers(plCoverPaths(p.cover),function(u){if(u){im.src=encodeURI(u);im.style.display='block';}});
   var cd=im.closest('.hlCard');
   if(p.img&&cd)cd.style.backgroundImage='linear-gradient(rgba(16,16,16,.86),rgba(16,16,16,.86)),url("'+encodeURI(p.img.indexOf('/')>0?p.img:'img/'+p.img)+'")';
   else if(p.cover)tryCovers(plCoverPaths(p.cover),function(u){if(u&&cd)cd.style.backgroundImage='linear-gradient(rgba(16,16,16,.86),rgba(16,16,16,.86)),url("'+encodeURI(u)+'")';});};
  hcv('al',lastAl);hcv('pl',lastPl);
  var tim=hl.querySelector('[data-hcv="tr"]');
  if(tim&&lt){var tcs=lt.img?((lt.img.indexOf('/')>0?[lt.img]:trackCoverPaths(lt.img))):trackCoverPaths(lt);
   if(tcs&&tcs.length)tryCovers(tcs,function(u){hlBg(tim,u);});}
  var ab=hl.querySelector('[data-hlp="al"]');
  if(ab&&lastAl)ab.onclick=function(ev){ev.stopPropagation();var pl=plFlatOf(lastAl);if(pl.length){PLAYLIST=lastAl;renderPlaylist();showView('home');play(pl[0],pl);}};
  var pb=hl.querySelector('[data-hlp="pl"]');
  if(pb&&lastPl)pb.onclick=function(ev){ev.stopPropagation();var pl=plFlatOf(lastPl);if(pl.length){PLAYLIST=lastPl;renderPlaylist();showView('home');play(pl[0],pl);}};
  var tb=hl.querySelector('[data-hlt]');
  if(tb)tb.onclick=function(ev){ev.stopPropagation();playSingle(TRACKS[+tb.getAttribute('data-hlt')]);};}
 var PG6=6,pshown=PGEXP?pls:pls.slice(0,PG6);
 $('plGridH').innerHTML='<h2 class="secH">\u2630 PLAYLISTS</h2>'+pshown.map(selCardHTML).join('')+((!PGEXP&&pls.length>PG6)?'<button class="btn" id="pgMore" style="display:block;margin:12px auto">\u25be VOIR LES '+(pls.length-PG6)+' AUTRES PLAYLISTS</button>':'');
 bindSelCards($('plGridH'));
 $('plGridH').querySelectorAll('.plh').forEach(function(cd,i){var p=pshown[i];if(!p)return;
  if(p.cover)tryCovers(plCoverPaths(p.cover),function(u){if(u){var im=cd.querySelector('.plc');if(im){im.src=encodeURI(u);im.style.display='block';}}});
  if(p.img)cd.style.backgroundImage='linear-gradient(rgba(16,16,16,.88),rgba(16,16,16,.88)),url("'+encodeURI(p.img.indexOf('/')>0?p.img:'img/'+p.img)+'")';});
 var pgmb=$('pgMore');if(pgmb)pgmb.onclick=function(ev){ev.stopPropagation();PGEXP=true;renderHomeGrid();};
 document.querySelectorAll('#plGridH [data-epl]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();var ix=PLAYLISTS.findIndex(function(x){return x.title===b.getAttribute('data-epl');});if(ix>-1)editPl(ix);};});}
