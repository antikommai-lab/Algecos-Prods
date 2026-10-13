/* ===== genres : multi-tags + playlists auto (tags + styles) + lecture selection ===== */
function genrePlaylists(){
 var cnt={},disp={},order=[];
 TRACKS.forEach(function(t){(t.tags||[]).forEach(function(k){var kk=tgN(k);if(!kk)return;if(!cnt[kk]){cnt[kk]=[];order.push(kk);disp[kk]=k;}
  if(cnt[kk].indexOf(t.title)<0)cnt[kk].push(t.title);});});
 return order.sort().map(function(k){var k=disp[k]||k;return {title:'GENRE · '+k,desc:'G\u00E9n\u00E9r\u00E9e automatiquement \u2014 tous les morceaux taggu\u00E9s '+k,auto:'tag',tracks:cnt[k]};});}
function stylePlaylists(){
 var cnt={},disp={},order=[];
 TRACKS.forEach(function(t){var k=String(t.style||'').trim();var kk=tgN(k);if(!kk)return;if(!cnt[kk]){cnt[kk]=[];order.push(kk);disp[kk]=k;}
  if(cnt[kk].indexOf(t.title)<0)cnt[kk].push(t.title);});
 return order.sort().map(function(k){var k=disp[k]||k;return {title:'STYLE · '+k,desc:'G\u00E9n\u00E9r\u00E9e automatiquement \u2014 tous les morceaux de style '+k,auto:'style',tracks:cnt[k]};});}
function tgN(s){return String(s==null?'':s).toLowerCase().trim()
 .replace(/[\u00E0-\u00FC]/g,function(c){return 'aaaeeeeiioouuuaaaeeeeiioouuu'['\u00E0\u00E1\u00E2\u00E3\u00E4\u00E7\u00E8\u00E9\u00EA\u00EB\u00EC\u00ED\u00EE\u00EF\u00F1\u00F2\u00F3\u00F4\u00F5\u00F6\u00F9\u00FA\u00FB\u00FC'.indexOf(c)]||c;});}
function comboPlaylists(){
 var cnt={};
 var disp={};
 TRACKS.forEach(function(t){var tg=(t.tags||[]).map(tgN).filter(Boolean).sort();
  for(var i=0;i<tg.length;i++)for(var j=i+1;j<tg.length;j++){var k=tg[i]+' + '+tg[j];
   if(!cnt[k]){cnt[k]=[];disp[k]=(t.tags||[]).filter(function(x){return tgN(x)===tg[i];})[0]||tg[i];}
   if(cnt[k].indexOf(t.title)<0)cnt[k].push(t.title);}});
 var out=[];Object.keys(cnt).sort().forEach(function(k){if(cnt[k].length>=2)
  out.push({title:'SÉLECTION · '+(disp[k]||k),desc:'Playlist sélection auto — combo '+(disp[k]||k)+' ('+cnt[k].length+' morceaux)',auto:'combo',tracks:cnt[k]});});
 return out;}
function autoPlaylists(){return comboPlaylists().concat(genrePlaylists()).concat(stylePlaylists());}
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
 +((typeof document!=='undefined'&&document.body.classList.contains('adm')&&SELS.indexOf(s)>-1)?'<button class="edit" style="position:absolute;top:10px;right:10px" onclick="event.stopPropagation();editSelIdx('+SELS.indexOf(s)+')" title="Editer cette s\u00E9lection">\u2699</button>':'')
 +'<h3>'+esc(s.title)+(s.ref?' <small style="color:var(--dim);font-size:.6rem">['+esc(s.ref)+']</small>':'')+(s.auto?' <small style="color:var(--y);font-size:.55rem;border:1px solid var(--y);padding:1px 4px">AUTO</small>':'')+'</h3><div class="m">'+esc(s.desc||'')+' \u00B7 '+en.length+' playlist(s) \u00B7 '+flat.length+' morceaux'+(s.upd?' \u00B7 '+esc(s.upd):'')+'</div><div class="seltracks">'
 +en.map(function(e){var tr=plFlatOf(e.pl);
   return '<div class="srow" data-spl="'+esc(e.pl.title)+'">'+(e.label?'<span class="plabel">'+esc(e.label)+'</span>':'')+'<b>'+esc(e.pl.title)+'</b>&nbsp;<small style="color:var(--dim)">'+tr.length+' morceaux</small></div>';}).join('')
 +'</div><div class="row" style="margin-top:8px"><button class="btn" data-selplay="'+esc(s.title)+'">\u25B6 LIRE</button></div></div>';
 return h;}
function renderSels(){
 var autos=comboPlaylists();
 var h=SELS.map(selSelCardHTML).join('');
 h+=autos.map(function(p){return selSelCardHTML({title:p.title,desc:p.desc,auto:'combo',tracks:p.tracks});}).join('');
 $('selGrid').innerHTML=h||'<div style="color:var(--dim);font-size:.75rem">AUCUNE PLAYLIST SÉLECTION.</div>';
 var hdr=document.querySelector('#selWrap .secH');
 if(hdr)hdr.textContent='⧉ Playlists sélections — '+(SELS.length+autos.length)+' ('+autos.length+' auto)';
 bindSelCards($('selGrid'));}
function bindSelCards(root){
 root.querySelectorAll('.plh').forEach(function(cd){
  var s=SELS.find(function(x){return x.title===cd.getAttribute('data-sel');})||PLAYLISTS.find(function(x){return x.title===cd.getAttribute('data-sel');})||comboPlaylists().find(function(x){return x.title===cd.getAttribute('data-sel');})||null;
  cd.onclick=function(ev){if(ev.target.closest('button')||ev.target.closest('.srow'))return;cd.classList.toggle('open');};
  var eb=cd.querySelector('.edit');
  if(eb)eb.onclick=function(ev){ev.stopPropagation();};
  var pb=cd.querySelector('[data-spp]');
  if(pb)pb.onclick=function(ev){ev.stopPropagation();var pl=plFlatOf(s||{tracks:[]});if(pl.length){PLAYLIST=s;renderPlaylist();play(pl[0],pl);}};
  var sb2=cd.querySelector('[data-selplay]');
  if(sb2)sb2.onclick=function(ev){ev.stopPropagation();
   var flat=selFlat(s||{});if(!flat.length){alert('AUCUN MORCEAU DANS CETTE PLAYLIST SÉLECTION');return;}
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
 var b=document.createElement('button');b.className='btn';b.textContent='\u25B6 LIRE PLAYLIST SÉLECTION';b.onclick=playFiltered;
 bar.appendChild(b);}
document.addEventListener('DOMContentLoaded',initGenres);
