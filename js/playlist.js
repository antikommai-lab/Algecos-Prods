/* ===== playlists : helpers + cartes ===== */
function plFlatOf(p){var old=PLAYLIST,out=[];try{PLAYLIST=p;out=plFlat();}catch(e){}PLAYLIST=old;return out;}
function selCardHTML(p){
 var tr=plFlatOf(p);
 var h='<div class="plh" data-sel="'+esc(p.title)+'">'+(p.cover?'<img class="plc" data-plc="'+esc(p.cover)+'" style="display:none">':'')+(document.body.classList.contains('adm')?'<button class="edit" data-epl="'+esc(p.title)+'" style="position:absolute;top:10px;right:10px">&#9881;</button>':'')+'<h3>'+esc(p.title)+'</h3><div class="m">'+esc(p.desc||'')+' \u00b7 '+tr.length+' morceaux'+(p.upd?' \u00b7 '+esc(p.upd):'')+'</div><div class="plFoldBtn" onclick="event.stopPropagation();this.closest(\'.plh\').classList.toggle(\'open\')" title="Voir les morceaux"><span class="plArr">&#9662;</span> TRACKLIST</div><div class="seltracks">'
  +tr.map(function(t){return '<div class="srow" data-spt="'+esc(t.title)+'"><b>'+esc(t.title)+'</b>'+(t.version?' <span class="ver">'+esc(t.version)+'</span>':'')+'</div>';}).join('')
  +'</div><div class="row"><button class="btn" data-spp="'+esc(p.title)+'">\u25b6</button><button class="btn" data-sps="'+esc(p.title)+'" title="Lecture al\u00e9atoire">\u21c4</button><button class="btn" data-spr="'+esc(p.title)+'" title="R\u00e9p\u00e9ter en boucle">\u21bb</button></div></div>';
 return h;}
