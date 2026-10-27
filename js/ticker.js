/* ===== ticker : bandeau defilant (rendu + editeur admin) ===== */
function updTicker(){
 var tk=$('ticker'),inner=$('tickInner');if(!tk||!inner)return;
 var lt=null;TRACKS.forEach(function(t){if(!lt||upTime(t)>upTime(lt))lt=t;});
 var lp=null;PLAYLISTS.forEach(function(p){if(!lp||String(p.upd||'')>String(lp.upd||''))lp=p;});
 var parts=[];
 if(typeof TICKER!=='undefined')TICKER.forEach(function(x){if(x)parts.push({h:1,t:String(x)});});
 if(lt)parts.push({t:'\u2b07 LAST UPLOAD : '+lt.title+(lt.version?' ['+lt.version+']':'')+' \u2014 '+(lt.uploadTime?lt.uploadTime.slice(0,10):(lt.added||lt.recordDate||''))});
 if(lp)parts.push({t:'\u26a1 LAST PLAYLIST : '+lp.title+(lp.upd?' \u2014 '+lp.upd:'')});
 if(!parts.length){tk.classList.remove('show');return;}
 inner.innerHTML=parts.map(function(p){return p.h?p.t:esc(p.t);}).join('   \u2726   ');
 tk.classList.add('show');}

/* ===== ticker editable ===== */
var TKEDIT=-1;
function openTick(){TKEDIT=-1;$('tickTxt').value='';tickRender();openModal('tickModal');}
function tickRender(){
 var L=(typeof TICKER!=='undefined')?TICKER:[];
 $('tickList').innerHTML=L.map(function(x,i){return '<div class="tkrow"><span class="tkord">'+(i+1)+'</span><div class="tktxt">'+x+'</div><span class="tkops"><button class="btn" data-tk="top,'+i+'">\u2b06</button><button class="btn" data-tk="up,'+i+'">\u2191</button><button class="btn" data-tk="dn,'+i+'">\u2193</button><button class="btn" data-tk="edit,'+i+'">\u270e</button><button class="btn" data-tk="del,'+i+'">\u2715</button></span></div>';}).join('')||'<div style="color:var(--dim);font-size:.7rem;padding:8px">AUCUN ITEM &#8212; TAPE UN TEXTE CI-DESSOUS PUIS \u00ab AJOUTER \u00bb</div>';
 $('tickList').querySelectorAll('[data-tk]').forEach(function(b){b.onclick=function(ev){ev.stopPropagation();
  var a=b.getAttribute('data-tk').split(','),i=+a[1];
  if(a[0]==='top'){TICKER.unshift(TICKER.splice(i,1)[0]);}
  else if(a[0]==='up'&&i>0){var u=TICKER[i];TICKER[i]=TICKER[i-1];TICKER[i-1]=u;}
  else if(a[0]==='dn'&&i<TICKER.length-1){var d=TICKER[i];TICKER[i]=TICKER[i+1];TICKER[i+1]=d;}
  else if(a[0]==='edit'){$('tickTxt').value=TICKER[i];TKEDIT=i;return;}
  else if(a[0]==='del'){TICKER.splice(i,1);}
  tickRender();updTicker();};});
 $('tickPrev').innerHTML=L.join('   \u2726   ')||'&#8212;';}
function tickAdd(){var v=$('tickTxt').value;if(!v.trim())return;
 if(TKEDIT>-1){TICKER[TKEDIT]=v;TKEDIT=-1;}else TICKER.push(v);
 $('tickTxt').value='';tickRender();updTicker();}
function tickFmt(tag){var ta=$('tickTxt');if(!ta)return;var s=ta.selectionStart,e=ta.selectionEnd;
 var sel=ta.value.slice(s,e),nm=String(tag).split(/[\s>]/)[0];
 ta.value=ta.value.slice(0,s)+'<'+tag+'>'+sel+'</'+nm+'>'+ta.value.slice(e);ta.focus();}
function tickColor(){var c=prompt('COULEUR (nom CSS ou #hex ou var(--y)) :','var(--y)');if(!c)return;tickFmt('span style="color:'+c+'"');}
async function tickPub(){try{
 if(!GHTOK)throw new Error('TOKEN GITHUB REQUIS');
 $('tickStatus').className='status ok';$('tickStatus').textContent='PUBLICATION...';
 await ghPut('ticker.json',toB64(JSON.stringify(TICKER,null,2)),'ticker mis a jour');
 $('tickStatus').textContent='PUBLI\u00c9 \u2713';setTimeout(function(){closeModal('tickModal');},800);}
 catch(e){$('tickStatus').className='status err';$('tickStatus').textContent=e.message;}}
