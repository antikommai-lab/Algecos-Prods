/* ===== likes : coeur compteur public (Abacus, sans backend) ===== */
var LKHOST='https://abacus.jasoncameron.dev',LKNS='AlgecosProds';
function likeKeyOf(t){return norm(t.title).replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60)||'track';}
function isLiked(t){try{return localStorage.getItem('lk_'+t.title)==='1';}catch(e){return false;}}
function likesFetch(t,inc){try{fetch(LKHOST+(inc?'/hit/':'/get/')+LKNS+'/like_'+likeKeyOf(t)).then(function(r){return r.json();}).then(function(d){var n=$('plikeN');if(n&&d&&typeof d.value==='number')n.textContent=d.value;}).catch(function(){});}catch(e){}}
function renderLike(t){var el=$('plike');if(!el)return;if(!t){el.innerHTML='';return;}
 var on=isLiked(t);
 el.innerHTML='<button class="lkB'+(on?' on':'')+'" id="plikeBtn" title="'+(on?'Tu aimes':'Aimer ce morceau')+'">\u2665 <b id="plikeN"></b></button>';
 var b=$('plikeBtn');if(b)b.onclick=function(ev){ev.stopPropagation();toggleLike(t);};
 likesFetch(t,false);}
function toggleLike(t){var on=isLiked(t);
 try{if(on)localStorage.removeItem('lk_'+t.title);else localStorage.setItem('lk_'+t.title,'1');}catch(e){}
 renderLike(t);
 if(!on)likesFetch(t,true);}
