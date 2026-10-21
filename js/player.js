/* ===== player ===== */
function play(t,list){
 if(!t)return;
 CURRENT=t;CURRENTLIST=list||CURRENTLIST||[];
 var a=$('audio');
 a.src=encodeURI(t.file||'');a.play();
 $('player').classList.add('show');
 $('pt').textContent=t.title;
 $('pv').textContent=(t.version?'['+t.version+'] ':'')+(t.style||'');
 $('ptags').textContent=(t.tags||[]).join(' / ')+((t.tags||[]).length&&(t.moods||[]).length?' / ':'')+(t.moods||[]).join(' / ');
 $('pdesc').textContent=t.desc||'';
 $('pinfo').textContent='VO:'+(t.lyricsCreator||'\u2014')+' / SND:'+(t.soundCreator||'\u2014')+' / '+(t.recordDate||'\u2014')+' / '+(t.prov==='A'?'HUMAIN':(t.prov==='B'?'HYBRIDE':'IA \u2014 NON VENDABLE'));
 $('pstars').innerHTML=stars(t.rating);$('pAvg').textContent='';
 var seq=++PCV;
 var pl=$('player');
 tryCovers(trackCoverPaths(t),function(u){if(seq!==PCV)return;var c=$('tCover');
  if(u){c.src=u;c.style.display='block';}else c.style.display='none';
  if(u)pl.style.backgroundImage='linear-gradient(rgba(0,0,0,.82),rgba(0,0,0,.82)),url("'+encodeURI(u)+'")';
  else if(PLAYLIST){var cps=PLAYLIST.img?(PLAYLIST.img.indexOf('/')>0?[PLAYLIST.img]:plCoverPaths(PLAYLIST.img)):plCoverPaths(PLAYLIST.cover||'');
   if(cps&&cps.length)tryCovers(cps,function(u2){if(seq!==PCV)return;pl.style.backgroundImage=u2?'linear-gradient(rgba(0,0,0,.82),rgba(0,0,0,.82)),url("'+encodeURI(u2)+'")':'';});
   else pl.style.backgroundImage='';}
  else pl.style.backgroundImage='';});
 if(sbReady())SB.from('ratings').select('stars').eq('track',t.title).then(function(res){
  if(seq!==PCV||!res.data||!res.data.length)return;
  var avg=res.data.reduce(function(a,b){return a+b.stars;},0)/res.data.length;
  $('pAvg').textContent='MOY '+Math.round(avg*10)/10+'/5 ('+res.data.length+')';});
 updateCtl();spiralUpd();
 document.querySelectorAll('.prow').forEach(function(r){r.classList.toggle('on',r.getAttribute('data-t')===t.title&&r.getAttribute('data-f')===(t.file||''));});}
function updateCtl(){var i=CURRENTLIST.indexOf(CURRENT);
 $('prevBtn').disabled=i<=0;
 $('nextBtn').disabled=i<0||i>=CURRENTLIST.length-1;}
function plPrev(){var i=CURRENTLIST.indexOf(CURRENT);if(i>0)play(CURRENTLIST[i-1],CURRENTLIST);}
function plNext(){var i=CURRENTLIST.indexOf(CURRENT);if(i>-1&&i<CURRENTLIST.length-1)play(CURRENTLIST[i+1],CURRENTLIST);}
/* ===== ecoute isolee : intercale le morceau dans la playlist en cours sans la perdre ===== */
function playSingle(t){
 if(!t)return;
 var a=$('audio');
 if(a.src&&!a.paused&&CURRENT&&CURRENTLIST.length>1){
  var L=CURRENTLIST.slice();
  var ix=L.indexOf(t);
  if(ix>-1)L.splice(ix,1);
  var ci=L.indexOf(CURRENT);
  L.splice(ci+1,0,t);
  play(t,L);}
 else play(t,[t]);}
function sk(d){var a=$('audio');if(isFinite(a.duration))a.currentTime=Math.max(0,Math.min(a.duration,a.currentTime+d));}
async function rate(k){
 if(!CURRENT)return;
 if(!USER){openCmt();return;}
 if(!sbReady())return;
 var ti=CURRENT.title,em=USER.email,r=null;
 try{
  var ex=await SB.from('ratings').select('id').eq('track',ti).eq('email',em).limit(1);
  if(!ex.error&&ex.data&&ex.data.length)r=await SB.from('ratings').update({stars:k}).eq('track',ti).eq('email',em);
  else r=await SB.from('ratings').insert({track:ti,email:em,stars:k});
  if(r&&r.error&&/email|column|relationship/i.test(r.error.message||'')){
   r=await SB.from('ratings').insert({track:ti,stars:k});
   if(!r.error)$('pAvg').className='status';}
 }catch(e){r={error:{message:String((e&&e.message)||e)}};}
 if(r&&r.error){$('pAvg').className='status err';
  var mm=r.error.message||'';
  $('pAvg').textContent=/email|column|relationship/i.test(mm)?'NOTE KO : Supabase \u2014 relancer le sch\u00e9ma (SQL: NOTIFY pgrst, \'reload schema\')':'NOTE KO : '+mm;return;}
 $('pAvg').className='';$('pstars').innerHTML=stars(k);
 SB.from('ratings').select('stars').eq('track',CURRENT.title).then(function(res){
  if(!res.data||!res.data.length)return;
  var avg=res.data.reduce(function(a,b){return a+b.stars;},0)/res.data.length;
  $('pAvg').textContent='MOY '+Math.round(avg*10)/10+'/5 ('+res.data.length+')';});}

/* ===== lyrics ===== */
function stripHtml(s){return String(s).replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<br\s*\/?>/gi,String.fromCharCode(10)).replace(/<\/p>/gi,String.fromCharCode(10)).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');}
function toggleLyr(){var m=$('lyrModal');
 if(m.classList.contains('open')){m.classList.remove('open');LYR.open=false;return;}
 m.classList.add('open');LYR.open=true;
 var b=$('lyrBox');b.textContent='\u2026';
 if(!CURRENT){b.textContent='\u2014';return;}
 $('lyrTitle').textContent='Lyrics \u2014 '+CURRENT.title;
 var tb=encodeURI('lyrics/'+CURRENT.title);
 var get=function(ext){return fetch(tb+'.'+ext+'?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.text():null;});};
 get('lyrics').then(function(x){return x!=null?x:get('txt');}).then(function(x){return x!=null?x:get('md');}).then(function(x){return x!=null?x:get('json');}).then(function(x){return x!=null?x:get('html');}).then(function(tx){
  if(tx==null){b.textContent='Pas de paroles disponibles pour ce morceau.';return;}
  if(tb.toLowerCase().endsWith('.html')||/<html|<body|<div|<p[ >]/i.test(tx.slice(0,500)))tx=stripHtml(tx);
  if(tb.toLowerCase().endsWith('.json')){try{var j=JSON.parse(tx);var v=j.lyrics||j.text||j.content||null;
   if(v==null&&Array.isArray(j.lines))v=j.lines.join(String.fromCharCode(10));
   tx=v!=null?String(v):JSON.stringify(j,null,1);}catch(e){}}
  b.textContent=tx;LYR.el=b;scrollLyr();});}
function scrollLyr(){var a=$('audio');
 if(!LYR.open||!LYR.el||!isFinite(a.duration)||!a.duration)return;
 LYR.el.scrollTop=(a.currentTime/a.duration)*(LYR.el.scrollHeight-LYR.el.clientHeight);}

/* ===== commentaires ===== */
async function openCmt(){
 $('cmtModal').classList.add('open');
 $('cmtStatus').textContent='';
 if(!sbReady()){$('cmtList').innerHTML='<div style="color:var(--dim);font-size:.75rem">Bient\u00f4t disponible.</div>';$('cmtForm').innerHTML='';return;}
 if(!USER){$('cmtForm').innerHTML='<div style="color:var(--dim);font-size:.75rem;line-height:1.6">Connecte-toi (\u2630 \u2192 Google ou GitHub) pour noter et commenter.</div>';$('cmtList').innerHTML='';return;}
 $('cmtForm').innerHTML='<label>Ton commentaire</label><textarea id="cmtTxt" rows="3"></textarea><div class="row"><button class="btn" onclick="sendCmt()">Envoyer</button></div>';
 $('cmtList').innerHTML='<div style="color:var(--dim);font-size:.75rem">\u2026</div>';
 if(!CURRENT)return;
 var res=await SB.from('comments').select('*').eq('track',CURRENT.title).order('created_at',{ascending:false}).limit(50);
 if(res.error){$('cmtList').innerHTML='<div style="color:var(--warn);font-size:.75rem">'+esc(res.error.message)+'</div>';return;}
 if(!res.data.length){$('cmtList').innerHTML='<div style="color:var(--dim);font-size:.75rem">Aucun commentaire \u2014 sois le premier !</div>';return;}
 $('cmtList').innerHTML=res.data.map(function(c){
  return '<div class="cmt"><div class="cH">'+esc(c.name||c.email||'?')+' \u00b7 '+String(c.created_at||'').slice(0,10)+'</div><div class="cB">'+esc(c.body)+'</div></div>';}).join('');}
async function sendCmt(){
 if(!USER||!CURRENT||!sbReady())return;
 var el=$('cmtTxt');var b=el?el.value.trim():'';
 if(!b){$('cmtStatus').className='status err';$('cmtStatus').textContent='VIDE';return;}
 var r=await SB.from('comments').insert({track:CURRENT.title,body:b,name:(USER.user_metadata&&USER.user_metadata.full_name)||USER.email.split('@')[0],email:USER.email});
 if(r.error){$('cmtStatus').className='status err';$('cmtStatus').textContent=r.error.message;return;}
 openCmt();}
function closeModal(id){$(id).classList.remove('open');if(id==='lyrModal')LYR.open=false;}
function openModal(id){$(id).classList.add('open');}


/* ===== spirale mentale plein ecran ===== */
function spiralUpd(){/* bouton permanent */}
function openSpiral(){var src=(PLAYLIST&&PLAYLIST.img&&/\.gif$/i.test(PLAYLIST.img))?PLAYLIST.img:'img/animated-spiral.gif';
 $('spiralImg').src=encodeURI(src)+'?nc='+Date.now();$('spiralOv').classList.add('open');}
function imgFS(){var m=$('imgModal');
 if(document.fullscreenElement){document.exitFullscreen();return;}
 m.classList.toggle('fs');
 if(m.requestFullscreen)m.requestFullscreen().catch(function(){});}
function closeSpiral(){$('spiralOv').classList.remove('open');}


/* ===== player : poignee de redimensionnement (drag) ===== */
function plGripInit(){
 var g=$('pGrip'),pl=$('player');if(!g||!pl)return;
 var sy=0,sh=0,dr=false;
 try{var h=localStorage.getItem('plh');
  if(h){pl.style.height=h;pl.style.maxHeight=h;}}catch(e){}
 g.addEventListener('pointerdown',function(e){dr=true;sy=e.clientY;sh=pl.offsetHeight;g.setPointerCapture(e.pointerId);e.preventDefault();});
 g.addEventListener('pointermove',function(e){if(!dr)return;
  var h=Math.max(70,Math.min(Math.round(window.innerHeight*0.92),sh+(sy-e.clientY)));
  pl.style.height=h+'px';pl.style.maxHeight=h+'px';});
 g.addEventListener('pointerup',function(){if(!dr)return;dr=false;
  try{localStorage.setItem('plh',pl.style.height||'');}catch(e){}});
 g.addEventListener('dblclick',function(){pl.style.height='';pl.style.maxHeight='';
  try{localStorage.removeItem('plh');}catch(e){}});
 g.title='Glisser pour redimensionner \u2014 double-clic : r\u00e9initialiser';}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',plGripInit);

/* ===== panneau versions dans le player ===== */
function pvMenu(){var p=$('pVers');if(!p||!CURRENT)return;
 p.setAttribute('data-mode','menu');
 p.innerHTML='<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:2px 0"><button class="vbtn" id="pvlBtn">\u25b8 LISTE DES VERSIONS</button>'+hearts(CURRENT)+'<button class="vbtn" id="pvxBtn" title="Fermer">\u2715</button></div>';
 p.style.display='block';
 $('pvlBtn').onclick=function(ev){ev.stopPropagation();showPVList();};
 $('pvxBtn').onclick=function(ev){ev.stopPropagation();p.style.display='none';};}
function pvHover(){var p=$('pVers');if(!p)return;if(p.style.display!=='block'&&CURRENT)pvMenu();}
function showPVList(){var p=$('pVers');if(!p||!CURRENT)return;
 var grp=versOf(CURRENT);
 p.setAttribute('data-mode','list');
 p.innerHTML='<div style="color:var(--y);font-size:.68rem;letter-spacing:.06em;margin-bottom:6px"><b>'+esc(CURRENT.title)+'</b> \u2014 '+grp.length+' VERSION(S)</div>'+
  '<button class="vbtn" id="pvmBtn" style="margin-bottom:6px">\u25b8 MENU</button>'+
  grp.map(function(u){var j=TRACKS.indexOf(u);var cur=(u===CURRENT);
  return '<div class="vrow" style="padding:6px 0;border-bottom:1px solid var(--line)'+(cur?';border-left:2px solid var(--y);padding-left:6px':'')+'"><div class="vt"><b>'+esc(u.title)+'</b>'+(u.version?' <span class="ver">'+esc(u.version)+'</span>':'')+(u.style?' <span style="color:var(--dim);font-size:.6rem">'+esc(u.style)+'</span>':'')+'</div>'+hearts(u)+'<button class="vbtn" data-pvp="'+j+'">\u25b6</button></div>';}).join('');
 p.style.display='block';
 $('pvmBtn').onclick=function(ev){ev.stopPropagation();pvMenu();};
 p.querySelectorAll('[data-pvp]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();playSingle(TRACKS[+b.getAttribute('data-pvp')]);};});}
function togglePVers(){var p=$('pVers');if(!p)return;
 if(p.style.display==='block'){p.style.display='none';return;}
 if(!CURRENT){p.innerHTML='<div style="color:var(--dim);font-size:.72rem">AUCUN MORCEAU EN LECTURE</div>';p.style.display='block';return;}
 pvMenu();}
