/* ===== player ===== */
function play(t,list){
 if(!t)return;
 CURRENT=t;CURRENTLIST=list||CURRENTLIST||[];
 var a=$('audio');
 a.src=encodeURI(t.file||'');a.play();
 $('player').classList.add('show');
 $('pt').textContent=t.title;
 $('pv').textContent=(t.version?'['+t.version+'] ':'')+(t.style||'');
 $('ptags').textContent=(t.tags||[]).join(' / ');
 $('pdesc').textContent=t.desc||'';
 $('pinfo').textContent='VO:'+(t.lyricsCreator||'—')+' / SND:'+(t.soundCreator||'—')+' / '+(t.recordDate||'—');
 $('pstars').innerHTML=stars(t.rating);$('pAvg').textContent='';
 var seq=++PCV;
 tryCovers(trackCoverPaths(t),function(u){if(seq!==PCV)return;var c=$('tCover');if(u){c.src=u;c.style.display='block';}else c.style.display='none';});
 if(sbReady())SB.from('ratings').select('stars').eq('track',t.title).then(function(res){
  if(seq!==PCV||!res.data||!res.data.length)return;
  var avg=res.data.reduce(function(a,b){return a+b.stars;},0)/res.data.length;
  $('pAvg').textContent='MOY '+Math.round(avg*10)/10+'/5 ('+res.data.length+')';});
 updateCtl();
 document.querySelectorAll('.prow').forEach(function(r){r.classList.toggle('on',r.getAttribute('data-t')===t.title&&r.getAttribute('data-f')===(t.file||''));});}
function updateCtl(){var i=CURRENTLIST.indexOf(CURRENT);
 $('prevBtn').disabled=i<=0;
 $('nextBtn').disabled=i<0||i>=CURRENTLIST.length-1;}
function plPrev(){var i=CURRENTLIST.indexOf(CURRENT);if(i>0)play(CURRENTLIST[i-1],CURRENTLIST);}
function plNext(){var i=CURRENTLIST.indexOf(CURRENT);if(i>-1&&i<CURRENTLIST.length-1)play(CURRENTLIST[i+1],CURRENTLIST);}
function sk(d){var a=$('audio');if(isFinite(a.duration))a.currentTime=Math.max(0,Math.min(a.duration,a.currentTime+d));}
async function rate(k){
 if(!CURRENT)return;
 if(!USER){openCmt();return;}
 if(!sbReady())return;
 var r=await SB.from('ratings').upsert({track:CURRENT.title,email:USER.email,stars:k});
 if(r.error){$('pAvg').textContent='ERREUR NOTE';return;}
 $('pstars').innerHTML=stars(k);
 SB.from('ratings').select('stars').eq('track',CURRENT.title).then(function(res){
  if(!res.data||!res.data.length)return;
  var avg=res.data.reduce(function(a,b){return a+b.stars;},0)/res.data.length;
  $('pAvg').textContent='MOY '+Math.round(avg*10)/10+'/5 ('+res.data.length+')';});}

/* ===== lyrics ===== */
function stripHtml(s){return String(s).replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<br\s*\/?>/gi,String.fromCharCode(10)).replace(/<\/p>/gi,String.fromCharCode(10)).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');}
function toggleLyr(){var m=$('lyrModal');
 if(m.classList.contains('open')){m.classList.remove('open');LYR.open=false;return;}
 m.classList.add('open');LYR.open=true;
 var b=$('lyrBox');b.textContent='…';
 if(!CURRENT){b.textContent='—';return;}
 $('lyrTitle').textContent='Lyrics — '+CURRENT.title;
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
 if(!sbReady()){$('cmtList').innerHTML='<div style="color:var(--dim);font-size:.75rem">Bientôt disponible.</div>';$('cmtForm').innerHTML='';return;}
 if(!USER){$('cmtForm').innerHTML='<div style="color:var(--dim);font-size:.75rem;line-height:1.6">Connecte-toi (☰ → Google ou GitHub) pour noter et commenter.</div>';$('cmtList').innerHTML='';return;}
 $('cmtForm').innerHTML='<label>Ton commentaire</label><textarea id="cmtTxt" rows="3"></textarea><div class="row"><button class="btn" onclick="sendCmt()">Envoyer</button></div>';
 $('cmtList').innerHTML='<div style="color:var(--dim);font-size:.75rem">…</div>';
 if(!CURRENT)return;
 var res=await SB.from('comments').select('*').eq('track',CURRENT.title).order('created_at',{ascending:false}).limit(50);
 if(res.error){$('cmtList').innerHTML='<div style="color:var(--warn);font-size:.75rem">'+esc(res.error.message)+'</div>';return;}
 if(!res.data.length){$('cmtList').innerHTML='<div style="color:var(--dim);font-size:.75rem">Aucun commentaire — sois le premier !</div>';return;}
 $('cmtList').innerHTML=res.data.map(function(c){
  return '<div class="cmt"><div class="cH">'+esc(c.name||c.email||'?')+' · '+String(c.created_at||'').slice(0,10)+'</div><div class="cB">'+esc(c.body)+'</div></div>';}).join('');}
async function sendCmt(){
 if(!USER||!CURRENT||!sbReady())return;
 var el=$('cmtTxt');var b=el?el.value.trim():'';
 if(!b){$('cmtStatus').className='status err';$('cmtStatus').textContent='VIDE';return;}
 var r=await SB.from('comments').insert({track:CURRENT.title,body:b,name:(USER.user_metadata&&USER.user_metadata.full_name)||USER.email.split('@')[0],email:USER.email});
 if(r.error){$('cmtStatus').className='status err';$('cmtStatus').textContent=r.error.message;return;}
 openCmt();}
function closeModal(id){$(id).classList.remove('open');if(id==='lyrModal')LYR.open=false;}
function openModal(id){$(id).classList.add('open');}
