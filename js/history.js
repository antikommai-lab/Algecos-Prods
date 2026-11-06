/* ===== history : URLs partageables (morceau / playlist / recherche / vue) ===== */
var HISTSUP=0;
function histURL(params){
 var u=new URL(location.href);u.search='';
 Object.keys(params).forEach(function(k){if(params[k])u.searchParams.set(k,params[k]);});
 return u.pathname+u.search+u.hash;}
function histPush(params){
 if(HISTSUP)return;
 try{var nu=histURL(params);
  if(nu===location.pathname+location.search+location.hash)return;
  history.pushState({vi:1},'',nu);}catch(e){}}
function histState(){try{return new URLSearchParams(location.search);}catch(e){return {get:function(){return null;}};}}
window.addEventListener('popstate',function(){
 HISTSUP=1;
 try{
  var st=histState(),q=st.get('q'),v=st.get('v'),t=st.get('t'),p=st.get('p');
  if(typeof applyDeepLink==='function')applyDeepLink();
  var qi=typeof $==='function'?$('q'):null;if(qi)qi.value=q||'';
  if(v&&typeof showView==='function')showView(v);
  if((q||(!t&&!p&&!v))&&typeof render==='function')render();
 }catch(e){}
 HISTSUP=0;});
/* wrappers : maj de l URL sur les actions utilisateur */
var _histPlay=typeof play==='function'?play:null;
if(_histPlay)play=function(t,l){_histPlay(t,l);if(t)histPush({t:t.title});};
var _histRP=typeof renderPlaylist==='function'?renderPlaylist:null;
if(_histRP)renderPlaylist=function(){var r=_histRP();if(typeof PLAYLIST!=='undefined'&&PLAYLIST)histPush({p:PLAYLIST.title});return r;};
var _histSV=typeof showView==='function'?showView:null;
if(_histSV)showView=function(v){_histSV(v);if(v&&v!=="home")histPush({v:v});else histPush({});};
/* recherche : URL en direct (debounce) */
(function(){var qi=document.getElementById('q');if(!qi)return;var tm;
 qi.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(function(){histPush({q:qi.value.trim()});},600);});})();
