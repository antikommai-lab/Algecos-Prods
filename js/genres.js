/* ===== genres : multi-tags + playlists auto (tags + styles) + lecture selection ===== */
function pickV(k,a,b,c){var h=0;for(var i=0;i<k.length;i++)h=(h*31+k.charCodeAt(i))>>>0;return [a,b,c][h%3];}
function autoCov(k){k=String(k||'').toLowerCase();
 if(/jazzidtribe|jazzytribe|jazzid tribe/.test(k))return 'logo-jazzidtribe.jpg';
 if(/jazzidcore|jazzcore|jazz/.test(k)&&/hard|speed|angry|dark/.test(k))return 'logo-jazzidcore2.jpg';
 if(/jazzidcore|jazzcore|jazzycore/.test(k))return 'logo-jazzidcore.jpg';
 if(/manouch/.test(k))return 'Manouchecore_logo.jpg';
 if(/ragcore|ragtekcore|ragtime/.test(k))return 'logo-ragcore.jpg';
 if(/gypsy/.test(k))return pickV(k,'logo-gypsycore.jpg','logo-gypsycore2.jpg','logo-gypsycore3.jpg');
 if(/cel[ei]?t[ei]c/.test(k))return pickV(k,'logo-celticore.jpg','logo-celticore2.jpg','logo-celticore3.jpg');
 return '';}function genrePlaylists(){
 var cnt={},disp={},order=[];
 TRACKS.forEach(function(t){(t.tags||[]).forEach(function(k){var kk=tgN(k);if(!kk)return;if(!cnt[kk]){cnt[kk]=[];order.push(kk);disp[kk]=k;}
  if(cnt[kk].indexOf(t.title)<0)cnt[kk].push(t.title);});});
 return order.sort().map(function(k){var k=disp[k]||k;return {title:'GENRE \u00b7 '+k,desc:'G\u00E9n\u00E9r\u00E9e automatiquement \u2014 tous les morceaux taggu\u00E9s '+k,auto:'tag',cover:autoCov(k),tracks:cnt[k]};});}
function stylePlaylists(){
 var cnt={},disp={},order=[];
 TRACKS.forEach(function(t){var k=String(t.style||'').trim();var kk=tgN(k);if(!kk)return;if(!cnt[kk]){cnt[kk]=[];order.push(kk);disp[kk]=k;}
  if(cnt[kk].indexOf(t.title)<0)cnt[kk].push(t.title);});
 return order.sort().map(function(k){var k=disp[k]||k;return {title:'STYLE \u00b7 '+k,desc:'G\u00E9n\u00E9r\u00E9e automatiquement \u2014 tous les morceaux de style '+k,auto:'style',cover:autoCov(k),tracks:cnt[k]};});}
function tgN(s){return String(s==null?'':s).toLowerCase().trim()
 .replace(/[\u00E0-\u00FC]/g,function(c){return 'aaaeeeeiioouuuaaaeeeeiioouuu'['\u00E0\u00E1\u00E2\u00E3\u00E4\u00E7\u00E8\u00E9\u00EA\u00EB\u00EC\u00ED\u00EE\u00EF\u00F1\u00F2\u00F3\u00F4\u00F5\u00F6\u00F9\u00FA\u00FB\u00FC'.indexOf(c)]||c;});}
function comboPlaylists(){
 var cnt={};
 var disp={},disp2={};
 TRACKS.forEach(function(t){var tg=(t.tags||[]).map(tgN).filter(Boolean).sort();
  for(var i=0;i<tg.length;i++)for(var j=i+1;j<tg.length;j++){var k=tg[i]+' + '+tg[j];
   if(!cnt[k]){cnt[k]=[];disp[k]=(t.tags||[]).filter(function(x){return tgN(x)===tg[i];})[0]||tg[i];disp2[k]=(t.tags||[]).filter(function(x){return tgN(x)===tg[j];})[0]||tg[j];}
   if(cnt[k].indexOf(t.title)<0)cnt[k].push(t.title);}});
 var out=[];Object.keys(cnt).sort().forEach(function(k){if(cnt[k].length>=2)
  out.push({title:'S\u00c9LECTION \u00b7 '+(disp[k]||k)+' \u00b7 '+(disp2[k]||''),desc:'Playlist s\u00e9lection auto \u2014 combo '+(disp[k]||k)+' + '+(disp2[k]||'')+' ('+cnt[k].length+' morceaux)',auto:'combo',tracks:cnt[k]});});
 return out;}
function autoPlaylists(){return comboPlaylists().concat(genrePlaylists()).concat(stylePlaylists());}
/* ===== selections : collections de playlists ===== */
function plByName(nm){
 var n=String(nm||'').toLowerCase().trim();
 return PLAYLISTS.concat(autoPlaylists()).find(function(x){return String(x.title||'').toLowerCase()===n;})||null;}
/* (cartes collections : js/collections.js) */
function bindSelCards(root){
 root.querySelectorAll('.plh').forEach(function(cd){
  var s=COLLS.find(function(x){return x.title===cd.getAttribute('data-sel');})||PLAYLISTS.find(function(x){return x.title===cd.getAttribute('data-sel');})||comboPlaylists().find(function(x){return x.title===cd.getAttribute('data-sel');})||null;
  cd.onclick=function(ev){if(ev.target.closest('button')||ev.target.closest('.srow'))return;cd.classList.toggle('open');};
  var eb=cd.querySelector('.edit');
  if(eb)eb.onclick=function(ev){ev.stopPropagation();};
  var pb=cd.querySelector('[data-spp]');
  if(pb)pb.onclick=function(ev){ev.stopPropagation();var pl=plFlatOf(s||{tracks:[]});if(pl.length){PLAYLIST=s;renderPlaylist();play(pl[0],pl);}};
  var shb=cd.querySelector('[data-sps]');
  if(shb)shb.onclick=function(ev){ev.stopPropagation();var pl=plFlatOf(s||{tracks:[]});if(pl.length){shufArr(pl);PLAYLIST=s;renderPlaylist();play(pl[0],pl);}};
  var shs=cd.querySelector('[data-selsh]');
  if(shs)shs.onclick=function(ev){ev.stopPropagation();var flat=selFlat(s||{});if(flat.length){shufArr(flat);PLAYLIST={title:s.title,desc:s.desc||'',tracks:flat.map(function(t){return t.title;})};renderPlaylist();showView('home');play(flat[0],flat);}};
  [cd.querySelector('[data-spr]'),cd.querySelector('[data-selrep]')].forEach(function(rb){if(rb)rb.onclick=function(ev){ev.stopPropagation();PLREP=!PLREP;document.querySelectorAll('[data-spr],[data-selrep]').forEach(function(x){x.classList.toggle('on',PLREP);});};});
  var sb2=cd.querySelector('[data-selplay]');
  if(sb2)sb2.onclick=function(ev){ev.stopPropagation();
   var flat=selFlat(s||{});if(!flat.length){alert('AUCUN MORCEAU DANS CETTE PLAYLIST S\u00c9LECTION');return;}
   PLAYLIST={title:s.title,desc:s.desc||'',tracks:flat.map(function(t){return t.title;})};
   renderPlaylist();showView('home');play(flat[0],flat);};
  cd.querySelectorAll('.srow').forEach(function(r){
   var spl=r.getAttribute('data-spl');
   if(spl){r.onclick=function(ev){ev.stopPropagation();var pl=plByName(spl);if(pl){PLAYLIST=pl;renderPlaylist();showView('home');}};return;}
   r.onclick=function(ev){ev.stopPropagation();var t=TRACKS.find(function(x){return x.title===r.getAttribute('data-spt');});if(t){PLAYLIST=s;renderPlaylist();play(t,plFlatOf(s));}};});});}
/* (edition collection : js/collections.js) */
function playFiltered(){
 var q=$('q').value.toLowerCase().trim();
 var list=TRACKS.filter(function(t){return (!q||match(t,q))&&tagFilterOK(t);});
 if(!list.length){alert('AUCUN MORCEAU DANS LA S\u00C9LECTION');return;}
 play(list[0],list);}
function initGenres(){
 var bar=document.querySelector('.search-bar');
 if(!bar)return;
 var b=document.createElement('button');b.className='btn';b.textContent='\u25B6 LIRE PLAYLIST S\u00c9LECTION';b.onclick=playFiltered;
 bar.appendChild(b);}
document.addEventListener('DOMContentLoaded',initGenres);

