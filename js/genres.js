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
/* ===== selections : collections de playlists ===== */
function plByName(nm){
 var n=String(nm||'').toLowerCase().trim();
 return PLAYLISTS.concat(autoPlaylists()).find(function(x){return String(x.title||'').toLowerCase()===n;})||null;}
function selEntries(s){
 var out=[];
 if(Array.isArray(s.playlists)){
  s.playlists.forEach(function(r){var pl=plByName(entRef(r));
   if(pl)out.push({label:entLabel(r),pl:pl});});
  return out;}
 if(Array.isArray(s.tracks)&&s.tracks.length)return [{label:'',pl:{title:s.title,desc:s.desc||'',tracks:s.tracks}}];
 return out;}
function selFlat(s){var out=[];
 selEntries(s).forEach(function(e){plFlatOf(e.pl).forEach(function(t){if(out.indexOf(t)<0)out.push(t);});});
 return out;}
function selSelCardHTML(s){
 var en=selEntries(s),flat=selFlat(s);
 var h='<div class="plh" data-sel="'+esc(s.title)+'">'
 +((typeof document!=='undefined'&&document.body.classList.contains('adm'))?'<button class="edit" style="position:absolute;top:10px;right:10px" onclick="event.stopPropagation();editSelIdx('+SELS.indexOf(s)+')" title="Editer cette s\u00E9lection">\u2699</button>':'')
 +'<h3>'+esc(s.title)+(s.ref?' <small style="color:var(--dim);font-size:.6rem">['+esc(s.ref)+']</small>':'')+'</h3><div class="m">'+esc(s.desc||'')+' \u00B7 '+en.length+' playlist(s) \u00B7 '+flat.length+' morceaux'+(s.upd?' \u00B7 '+esc(s.upd):'')+'</div><div class="seltracks">'
 +en.map(function(e){var tr=plFlatOf(e.pl);
   return '<div class="srow" data-spl="'+esc(e.pl.title)+'">'+(e.label?'<span class="plabel">'+esc(e.label)+'</span>':'')+'<b>'+esc(e.pl.title)+'</b>&nbsp;<small style="color:var(--dim)">'+tr.length+' morceaux</small></div>';}).join('')
 +'</div><div class="row" style="margin-top:8px"><button class="btn" data-selplay="'+esc(s.title)+'">\u25B6 LIRE</button></div></div>';
 return h;}
function renderSels(){
 $('selGrid').innerHTML=SELS.map(selSelCardHTML).join('')||'<div style="color:var(--dim);font-size:.75rem">AUCUNE S\u00C9LECTION.</div>';
 bindSelCards($('selGrid'));}
function bindSelCards(root){
 root.querySelectorAll('.plh').forEach(function(cd){
  var s=SELS.find(function(x){return x.title===cd.getAttribute('data-sel');})||PLAYLISTS.find(function(x){return x.title===cd.getAttribute('data-sel');})||null;
  cd.onclick=function(ev){if(ev.target.closest('button')||ev.target.closest('.srow'))return;cd.classList.toggle('open');};
  var eb=cd.querySelector('.edit');
  if(eb)eb.onclick=function(ev){ev.stopPropagation();};
  var pb=cd.querySelector('[data-spp]');
  if(pb)pb.onclick=function(ev){ev.stopPropagation();var pl=plFlatOf(s||{tracks:[]});if(pl.length){PLAYLIST=s;renderPlaylist();play(pl[0],pl);}};
  var sb2=cd.querySelector('[data-selplay]');
  if(sb2)sb2.onclick=function(ev){ev.stopPropagation();
   var flat=selFlat(s||{});if(!flat.length){alert('AUCUN MORCEAU DANS CETTE S\u00C9LECTION');return;}
   PLAYLIST={title:s.title,desc:s.desc||'',tracks:flat.map(function(t){return t.title;})};
   renderPlaylist();showView('home');play(flat[0],flat);};
  cd.querySelectorAll('.srow').forEach(function(r){
   var spl=r.getAttribute('data-spl');
   if(spl){r.onclick=function(ev){ev.stopPropagation();var pl=plByName(spl);if(pl){PLAYLIST=pl;renderPlaylist();showView('home');}};return;}
   r.onclick=function(ev){ev.stopPropagation();var t=TRACKS.find(function(x){return x.title===r.getAttribute('data-spt');});if(t){PLAYLIST=s;renderPlaylist();play(t,plFlatOf(s));}};});});}
/* edition d'une selection depuis sa carte (admin) */
function editSelIdx(i){
 var s=SELS[i];if(!s)return;
 smSelIdx=i;$('smSelTitle').textContent='\u270E Modifier : '+s.title;
 fillSelVals(s);$('sStatus').textContent='';openModal('selModal');}
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
