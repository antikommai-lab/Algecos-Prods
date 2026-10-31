/* ===== visualiseur audio : overlay plein ecran, GIF spirale en fond + spirale blanche reactive ===== */
var VISM=0,VISA=null,VIAN=null,VIDATA=null,VIRAF=0,VIROT=0,VIARMS=[],VISPB=0;
var VIHU=[305,185,95,35,268,335];
function visOpen(){
 var ov=$('visOv');if(!ov)return;
 ov.style.display='block';VISM=1;visApply();}
function visClose(){
 VISM=0;var ov=$('visOv');if(ov)ov.style.display='none';
 if(VIRAF){cancelAnimationFrame(VIRAF);VIRAF=0;}}
function visApply(){
 var cv=$('visCv');if(!cv)return;
 if(!VISM){if(VIRAF){cancelAnimationFrame(VIRAF);VIRAF=0;}return;}
 if(!VISA){try{
  VISA=new (window.AudioContext||window.webkitAudioContext)();
  var src=VISA.createMediaElementSource($('audio'));
  VIAN=VISA.createAnalyser();VIAN.fftSize=512;VIAN.smoothingTimeConstant=.72;
  VIDATA=new Uint8Array(VIAN.frequencyBinCount);
  src.connect(VIAN);VIAN.connect(VISA.destination);}
 catch(e){VISA=null;VIAN=null;VIDATA=null;}}
 if(VISA&&VISA.state==='suspended')VISA.resume();
 if(!VISPB){VISPB=1;var au2=$('audio');
  if(au2)au2.addEventListener('play',function(){if(VISA&&VISA.state==='suspended')VISA.resume();});}
 if(!VIARMS.length){
  var nb=VIAN?VIAN.frequencyBinCount:128;
  for(var i=0;i<6;i++)VIARMS.push({
   b:.4+Math.random()*1.1,
   ph:Math.random()*6.283,
   k:1+Math.floor(Math.random()*Math.min(48,nb)),
   h:VIHU[i%VIHU.length],
   dir:Math.random()<.5?-1:1});}
 cv.style.display='block';
 if(!VIRAF)VIRAF=requestAnimationFrame(viDraw);}
function viDraw(){
 VIRAF=requestAnimationFrame(viDraw);
 var cv=$('visCv');if(!cv||!VISM)return;
 var w=cv.width=innerWidth,h=cv.height=innerHeight,cx=cv.getContext('2d');
 var a=$('audio');
 var amp=.06+Math.random()*.04,en=0;
 if(VIAN&&VIDATA&&a&&!a.paused){
  VIAN.getByteFrequencyData(VIDATA);
  var n=VIDATA.length,s=0;
  for(var i=0;i<n;i++)s+=VIDATA[i]/255;
  amp=Math.max(amp,s/n);
  en=VIDATA[0]/255;}
 VIROT+=.0022+amp*.02;
 /* fondu des trainees sans masquer le GIF : destination-out */
 cx.globalCompositeOperation='destination-out';
 cx.fillStyle='rgba(0,0,0,'+(.16+amp*.14)+')';
 cx.fillRect(0,0,w,h);
 cx.globalCompositeOperation='source-over';
 var cxp=w/2,cyp=h/2,R=Math.min(w,h)*.46;
 cx.lineCap='round';
 var nb2=VIAN?VIAN.frequencyBinCount:128;
 VIARMS.forEach(function(ar){
  var kk=ar.k%nb2;
  var e2=(VIAN&&VIDATA&&a&&!a.paused)?VIDATA[kk]/255:amp;
  var th=ar.b+e2*(9+Math.random()*7)+amp*3;
  cx.lineWidth=Math.max(.4,th);
  /* spirale generee : palette LSD (magenta, cyan, vert acide, orange, violet, rose) */
  var hue=Math.floor(ar.h+VIROT*20)%360;
  cx.strokeStyle='hsla('+hue+',100%,'+(50+e2*30)+'%,.9)';
  cx.beginPath();
  for(var s2=0;s2<=140;s2++){
   var p=s2/140;
   var ang=ar.ph+VIROT*ar.dir+p*11+e2*Math.sin(p*9+VIROT*3)*.6;
   var rr=R*p*(.92+e2*.16*Math.sin(p*6+ar.ph));
   var x=cxp+Math.cos(ang)*rr,y=cyp+Math.sin(ang)*rr;
   if(s2)cx.lineTo(x,y);else cx.moveTo(x,y);}
  cx.stroke();});}
