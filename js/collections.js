/* ===== collections : playlists + tracks en vrac, nom propre par creation ===== */
function collFromSel(s){
 var items=[];
 (Array.isArray(s.playlists)?s.playlists:[]).forEach(function(r){
  items.push({t:'pl',r:entRef(r)||String(r),label:entLabel(r)||undefined});});
 return {title:s.title||'COLLECTION',desc:s.desc||'',author:s.ref||'',items:items,upd:s.upd||''};}
function collItemsOf(c){
 if(Array.isArray(c.items))return c.items;
 if(Array.isArray(c.playlists))return collFromSel(c).items;
 if(Array.isArray(c.tracks))return c.tracks.map(function(r){return {t:'tr',r:entRef(r)};});
 return [];}
function collFlat(c){
 var out=[],seen={};
 collItemsOf(c).forEach(function(it){
  var trs=(it.t==='tr')?[plMatch(String(it.r||''))]:plFlatOf(plByName(String(it.r||''))||{tracks:[]});
  trs.forEach(function(t){if(t&&!seen[t.title]){seen[t.title]=1;out.push(t);}});});
 return out;}
function collCardHTML(c){
 var its=collItemsOf(c),flat=collFlat(c),nPl=0,nTr=0;
 its.forEach(function(it){if(it.t==='tr')nTr++;else nPl++;});
 var rows=its.map(function(it){
  if(it.t==='tr'){var t=plMatch(String(it.r||''));
   return '<div class="srow" data-ctr="'+esc(String(it.r||''))+'">&#9834; <b>'+esc(t?t.title:String(it.r||''))+'</b>'+(t&&t.style?' <small style="color:var(--dim)">'+esc(t.style)+'</small>':'')+'</div>';}
  var p=plByName(String(it.r||'')),tr=p?plFlatOf(p):[];
  return '<div class="srow" data-cpl="'+esc(String(it.r||''))+'">'+(it.label?'<span class="plabel">'+esc(it.label)+'</span>':'')+'&#9776; <b>'+esc(p?p.title:String(it.r||''))+'</b>&nbsp;<small style="color:var(--dim)">'+tr.length+' morceaux</small></div>';}).join('');
 var adm=(typeof document!=='undefined')&&document.body.classList.contains('adm');
 var ci=COLLS.indexOf(c);
 return '<div class="plh" data-coll="'+esc(c.title)+'">'
 +((adm&&ci>-1)?'<button class="edit" style="position:absolute;top:10px;right:10px" onclick="event.stopPropagation();editCollIdx('+ci+')" title="Editer cette collection">&#9881;</button>':'')
 +'<h3>'+esc(c.title)+(c.author?' <small style="color:var(--dim);font-size:.6rem">par '+esc(c.author)+'</small>':'')+(c.auto?' <span style="color:var(--y);font-size:.55rem;border:1px solid var(--y);padding:1px 4px">AUTO</span>':'')+'</h3>'
 +'<div class="m">'+esc(c.desc||'')+' &#183; '+(nPl?nPl+' playlist(s)':'')+(nPl&&nTr?' + ':'')+(nTr?nTr+' track(s)':'')+' &#183; '+flat.length+' morceaux'+(c.upd?' &#183; '+esc(c.upd):'')+'</div>'
 +'<div class="plFoldBtn" onclick="event.stopPropagation();this.closest('+"'"+'.plh'+"'"+').classList.toggle('+"'"+'open'+"'"+')" title="Voir le contenu"><span class="plArr">&#9662;</span> CONTENU</div><div class="seltracks">'+rows+'</div>'
 +'<div class="row" style="margin-top:8px"><button class="btn" data-cplay="'+esc(c.title)+'">&#9654;</button><button class="btn" data-cshuf="'+esc(c.title)+'" title="Lecture al&#233;atoire">&#8676;</button><button class="btn" data-crep="'+esc(c.title)+'" title="R&#233;p&#233;ter en boucle">&#8635;</button></div></div>';}
var COLLREG={};
function renderColls(){
 COLLREG={};var autos=[];
 COLLS.forEach(function(c){COLLREG[c.title]=c;});
 if(typeof comboPlaylists==='function')comboPlaylists().forEach(function(p){
  var a={title:p.title,desc:p.desc,auto:'combo',items:(p.tracks||[]).map(function(r){return {t:'tr',r:entRef(r)};})};
  COLLREG[a.title]=a;autos.push(a);});
 var h=COLLS.map(collCardHTML).join('')+autos.map(collCardHTML).join('');
 $('collGrid').innerHTML=h||'<div style="color:var(--dim);font-size:.75rem">AUCUNE COLLECTION ENCORE &#8212; menu &#9776; pour en cr&#233;er une.</div>';
 var hdr=document.querySelector('#collWrap .secH');
 if(hdr)hdr.innerHTML='&#9670; Collections &#8212; '+(COLLS.length+autos.length)+' ('+autos.length+' auto)';
 bindCollCards($('collGrid'));}
function bindCollCards(root){
 root.querySelectorAll('.plh').forEach(function(cd){
  var c=COLLREG[cd.getAttribute('data-coll')]||null;
  cd.onclick=function(ev){if(ev.target.closest('button')||ev.target.closest('.srow'))return;cd.classList.toggle('open');};
  var eb=cd.querySelector('.edit');if(eb)eb.onclick=function(ev){ev.stopPropagation();};
  var flat=function(){return collFlat(c||{});};
  var goPlay=function(shuf){var fl=flat();if(!fl.length){alert('COLLECTION VIDE OU CONTENU INTROUVABLE');return;}
   if(shuf)shufArr(fl);
   PLAYLIST={title:(c&&c.title)||'COLLECTION',desc:(c&&c.desc)||'',tracks:fl.map(function(t){return t.title;})};
   renderPlaylist();showView('home');play(fl[0],fl);};
  var pb=cd.querySelector('[data-cplay]');if(pb)pb.onclick=function(ev){ev.stopPropagation();goPlay(false);};
  var sb=cd.querySelector('[data-cshuf]');if(sb)sb.onclick=function(ev){ev.stopPropagation();goPlay(true);};
  var rb=cd.querySelector('[data-crep]');if(rb)rb.onclick=function(ev){ev.stopPropagation();PLREP=!PLREP;document.querySelectorAll('[data-crep]').forEach(function(x){x.classList.toggle('on',PLREP);});};
  cd.querySelectorAll('.srow').forEach(function(r){
   var spl=r.getAttribute('data-cpl');
   if(spl){r.onclick=function(ev){ev.stopPropagation();var pl=plByName(spl);if(pl){PLAYLIST=pl;renderPlaylist();showView('home');}};return;}
   var stt=r.getAttribute('data-ctr');
   if(stt)r.onclick=function(ev){ev.stopPropagation();var t=plMatch(stt);if(!t)return;var fl=flat();play(t,fl.length?fl:[t]);};});});}
/* --- formulaire collection --- */
var cmCollIdx=-1,CLORD=[],CLDRAG=-1,CLCHK=[];
function clLineOf(it){return (it.label?'LABEL: '+it.label+' :: ':'')+(it.t==='tr'?'TR: ':'PL: ')+String(it.r||'');}
function clParse(l){
 var m=String(l).match(/^LABEL\s*:\s*(.+?)\s*::\s*(PL|TR)\s*:\s*(.+)$/i);
 if(m)return {label:m[1].trim(),t:m[2].toLowerCase(),r:m[3].trim()};
 m=String(l).match(/^(PL|TR)\s*:\s*(.+)$/i);
 if(m)return {t:m[1].toLowerCase(),r:m[2].trim()};
 return {t:'pl',r:String(l)};}
function clOrdSync(){CLORD=($('s_tracks').value||'').split(String.fromCharCode(10)).map(function(s){return s.trim();}).filter(Boolean);CLCHK=[];clOrdRender();clExpRender();}
function clOrdOut(){$('s_tracks').value=CLORD.join(String.fromCharCode(10));}
function clOrdDisp(l){var it=clParse(l);return (it.t==='tr'?'[TR] ':'[PL] ')+(it.label?it.label+' :: ':'')+it.r;}
function clOrdRender(){var w=$('s_order');if(!w)return;
 w.innerHTML=CLORD.map(function(l,ix){return '<div class="mgrow peord" draggable="true" data-oi="'+ix+'"><span class="mnum">'+(ix+1)+'</span><span style="color:var(--dim)">&#9776;</span><div class="mt"><b>'+esc(clOrdDisp(l))+'</b></div><button class="mgdel" data-ox="'+ix+'">&#10005;</button></div>';}).join('')||'<div style="color:var(--dim);padding:10px;font-size:.68rem">VIDE &#8212; coche des playlists ou des tracks ci-dessous puis &#171; + Ajouter coch&#233;s &#187;</div>';
 w.querySelectorAll('.peord').forEach(function(row){var ix=+row.getAttribute('data-oi');
  row.ondragstart=function(){CLDRAG=ix;};
  row.ondragover=function(ev){ev.preventDefault();};
  row.ondrop=function(ev){ev.preventDefault();if(CLDRAG<0||CLDRAG===ix)return;var it=CLORD.splice(CLDRAG,1)[0];CLORD.splice(ix,0,it);CLDRAG=-1;clOrdRender();};
  var rm=row.querySelector('[data-ox]');if(rm)rm.onclick=function(){CLORD.splice(ix,1);clOrdRender();};});}
function clExpRender(){var w=$('s_expList');if(!w)return;
 var q=($('s_expQ').value||'').toLowerCase().trim();
 var inC={};CLORD.forEach(function(l){inC[String(l).toLowerCase()]=1;});
 var pls=PLAYLISTS.filter(function(p){if(inC[('PL: '+p.title).toLowerCase()])return false;return !q||String(p.title||'').toLowerCase().indexOf(q)>-1;});
 var trs=TRACKS.filter(function(t){if(inC[('TR: '+t.title).toLowerCase()])return false;return !q||String(t.title||'').toLowerCase().indexOf(q)>-1;});
 w.innerHTML=pls.map(function(p){return '<label class="mgrow" style="cursor:pointer"><input type="checkbox" data-cxp="'+esc(p.title)+'"><span class="mnum" style="color:var(--y)">PL</span><div class="mt"><b>'+esc(p.title)+'</b></div></label>';}).join('')
 +trs.map(function(t){return '<label class="mgrow" style="cursor:pointer"><input type="checkbox" data-cxt="'+esc(t.title)+'"><span class="mnum" style="color:var(--warn)">TR</span><div class="mt"><b>'+esc(t.title)+'</b>'+(t.style?' <small style="color:var(--dim)">'+esc(t.style)+'</small>':'')+'</div></label>';}).join('')
 ||'<div style="color:var(--dim);padding:10px;font-size:.68rem">AUCUN R&#233;SULTAT</div>';
 w.querySelectorAll('[data-cxp]').forEach(function(ck){ck.onchange=function(){var l='PL: '+ck.getAttribute('data-cxp');var i2=CLCHK.indexOf(l);if(ck.checked&&i2<0)CLCHK.push(l);if(!ck.checked&&i2>-1)CLCHK.splice(i2,1);};});
 w.querySelectorAll('[data-cxt]').forEach(function(ck){ck.onchange=function(){var l='TR: '+ck.getAttribute('data-cxt');var i2=CLCHK.indexOf(l);if(ck.checked&&i2<0)CLCHK.push(l);if(!ck.checked&&i2>-1)CLCHK.splice(i2,1);};});}
function clExpAdd(){if(!CLCHK.length)return;CLCHK.forEach(function(l){CLORD.push(l);});CLCHK=[];clOrdRender();clExpRender();}
function fillCollVals(c){
 $('s_title').value=c.title||'';$('s_desc').value=c.desc||'';$('s_ref').value=c.author||'';
 $('s_tracks').value=collItemsOf(c).map(clLineOf).join(String.fromCharCode(10));
 clOrdSync();}
function openCollForm(mode){
 if(mode===-1){cmCollIdx=-1;$('smSelTitle').textContent='+ Nouvelle collection';$('smSelSelWrap').style.display='none';
  $('s_title').value='';$('s_desc').value='';$('s_ref').value='';$('s_tracks').value='';clOrdSync();}
 else{$('smSelTitle').textContent='Modifier une collection';$('smSelSelWrap').style.display='block';
  $('smSelSel').innerHTML=COLLS.map(function(c,i){return '<option value="'+i+'">'+esc(c.title)+'</option>';}).join('');
  cmCollIdx=0;fillColl();}
 $('sStatus').textContent='';openModal('selModal');}
function fillColl(){cmCollIdx=+$('smSelSel').value;var c=COLLS[cmCollIdx];if(c)fillCollVals(c);}
async function saveColl(){
 var ti=$('s_title').value.trim();
 if(!ti){$('sStatus').className='status err';$('sStatus').textContent='NOM REQUIS';return;}
 clOrdOut();
 var lines=$('s_tracks').value.split(String.fromCharCode(10)).map(function(s){return s.trim();}).filter(Boolean);
 var items=lines.map(clParse);
 var c={title:ti,desc:$('s_desc').value.trim(),author:$('s_ref').value.trim(),items:items};
 c.upd=new Date().toISOString().slice(0,10);
 if(cmCollIdx>-1)COLLS[cmCollIdx]=c;else COLLS.push(c);
 $('sStatus').className='status ok';$('sStatus').textContent='PUBLICATION...';
 try{await publishAll('collection : '+ti);
  closeModal('selModal');await load();}
 catch(e){$('sStatus').className='status err';$('sStatus').textContent=e.message;}}
function editCollIdx(i){
 var c=COLLS[i];if(!c)return;
 cmCollIdx=i;$('smSelTitle').textContent='Modifier : '+c.title;
 fillCollVals(c);$('sStatus').textContent='';openModal('selModal');}
