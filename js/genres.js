/* ===== genres : multi-tags + playlists auto + lecture selection ===== */
function genrePlaylists(){
 var cnt={},order=[];
 TRACKS.forEach(function(t){(t.tags||[]).forEach(function(k){if(!cnt[k]){cnt[k]=[];order.push(k);}cnt[k].push(t.title);});});
 return order.sort().map(function(k){return {title:'GENRE · '+k,desc:'Générée automatiquement — tous les morceaux taggués '+k,auto:true,tracks:cnt[k]};});}
var SELALL=[];
function renderSels(){SELALL=SELS.concat(PLAYLISTS).concat(genrePlaylists());
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
 if(!list.length){alert('AUCUN MORCEAU DANS LA SÉLECTION');return;}
 play(list[0],list);}
function initGenres(){
 var bar=document.querySelector('.search-bar');
 if(!bar)return;
 var b=document.createElement('button');b.className='btn';b.textContent='▶ LIRE SÉLECTION';b.onclick=playFiltered;
 bar.appendChild(b);}
document.addEventListener('DOMContentLoaded',initGenres);