/* ===== genres : multi-tags + playlists auto (tags + styles) + lecture selection ===== */
function genrePlaylists(){
 var cnt={},order=[];
 TRACKS.forEach(function(t){(t.tags||[]).forEach(function(k){if(!cnt[k]){cnt[k]=[];order.push(k);}cnt[k].push(t.title);});});
 return order.sort().map(function(k){return {title:'GENRE · '+k,desc:'G\u00E9n\u00E9r\u00E9e automatiquement \u2014 tous les morceaux taggu\u00E9s '+k,auto:'tag',tracks:cnt[k]};});}
function stylePlaylists(){
 var cnt={},order=[];
 TRACKS.forEach(function(t){var k=String(t.style||'').trim();if(!k)return;if(!cnt[k]){cnt[k]=[];order.push(k);}cnt[k].push(t.title);});
 return order.sort().map(function(k){return {title:'STYLE · '+k,desc:'G\u00E9n\u00E9r\u00E9e automatiquement \u2014 tous les morceaux de style '+k,auto:'style',tracks:cnt[k]};});}
function autoPlaylists(){return genrePlaylists().concat(stylePlaylists());}
var SELALL=[];
function renderSels(){SELALL=SELS.concat(PLAYLISTS).concat(autoPlaylists());
 $('selGrid').innerHTML=SELALL.map(selCardHTML).join('')||'<div style="color:var(--dim);font-size:.75rem">AUCUNE PLAYLIST.</div>';
 bindSelCards($('selGrid'));}
function bindSelCards(root){
 root.querySelectorAll('.plh').forEach(function(cd){
  var p=SELALL.find(function(x){return x.title===cd.getAttribute('data-sel');})||PLAYLISTS.find(function(x){return x.title===cd.getAttribute('data-sel');})||null;
  cd.onclick=function(ev){if(ev.target.closest('button')||ev.target.closest('.srow'))return;cd.classList.toggle('open');};
  var pb=cd.querySelector('[data-spp]');
  if(pb)pb.onclick=function(ev){ev.stopPropagation();var pl=plFlatOf(p||{tracks:[]});if(pl.length){PLAYLIST=p;renderPlaylist();play(pl[0],pl);}};
  cd.querySelectorAll('.srow').forEach(function(r){r.onclick=function(ev){ev.stopPropagation();var t=TRACKS.find(function(x){return x.title===r.getAttribute('data-spt');});if(t){PLAYLIST=p;renderPlaylist();play(t,plFlatOf(p));}};});});}
function playFiltered(){
 var q=$('q').value.toLowerCase().trim();
 var list=TRACKS.filter(function(t){return (!q||match(t,q))&&(activeTags.length===0||activeTags.some(function(a){return (t.tags||[]).indexOf(a)>-1;}));});
 if(!list.length){alert('AUCUN MORCEAU DANS LA S\u00C9LECTION');return;}
 play(list[0],list);}
function initGenres(){
 var bar=document.querySelector('.search-bar');
 if(!bar)return;
 var b=document.createElement('button');b.className='btn';b.textContent='\u25B6 LIRE S\u00C9LECTION';b.onclick=playFiltered;
 bar.appendChild(b);}
document.addEventListener('DOMContentLoaded',initGenres);