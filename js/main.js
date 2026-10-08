/* ===== init ===== */
var a=$('audio');
a.ontimeupdate=function(){
 $('tTime').textContent=fmt(a.currentTime)+' / '+(isFinite(a.duration)&&a.duration?fmt(a.duration):'--:--');
 scrollLyr();};
a.onended=function(){var i=CURRENTLIST.indexOf(CURRENT);if(i>-1&&i<CURRENTLIST.length-1)play(CURRENTLIST[i+1],CURRENTLIST);}
$('grid').addEventListener('click',function(e){var b=e.target.closest('.play');if(b)play(TRACKS[+b.getAttribute('data-i')],TRACKS);});
$('plist').addEventListener('click',function(e){var r=e.target.closest('.prow');if(!r)return;
 var t=TRACKS.find(function(x){return x.title===r.getAttribute('data-t')&&String(x.file||'')===r.getAttribute('data-f');});
 if(t)play(t,plFlat());});
$('pstars').addEventListener('click',function(e){
 var sp=e.target;if(sp.tagName!=='SPAN')return;
 var k=1,el=sp;while(el.previousSibling){el=el.previousSibling;if(el.tagName==='SPAN')k++;}
 rate(k);});
$('btnSearch').onclick=render;
$('q').addEventListener('input',render);
$('btnReset').onclick=function(){$('q').value='';activeTags=[];
 document.querySelectorAll('#tags .tag').forEach(function(x){x.classList.remove('on');});render();};
document.querySelectorAll('.modal').forEach(function(m){m.onclick=function(e){if(e.target===m)closeModal(m.id);};});
$('imgBig').onclick=function(){$('imgBig').classList.toggle('zoom');};
$('imgModal').addEventListener('mousemove',function(e){
 var w=this.clientWidth,x=e.clientX-this.getBoundingClientRect().left;
 $('vL').style.display=(x<w*0.15&&VIEW.imgs.length>1)?'block':'none';
 $('vR').style.display=(x>w*0.85&&VIEW.imgs.length>1)?'block':'none';});
document.addEventListener('click',function(e){
 var t=e.target;
 if(t&&t.tagName==='IMG'&&!t.closest('.modal'))openViewer(t);});
if(GHTOK)$('ghTok').value=GHTOK;
initAuth();
load();
