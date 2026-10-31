/* ===== visualiseur audio : overlay plein ecran, GIF spirale en fond + spirale blanche reactive ===== */
var VISM=0,VISA=null,VIAN=null,VIDATA=null,VIRAF=0,VIROT=0,VIARMS=[];
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
 if(!VIARMS.length){
  var nb=VIAN?VIAN.frequencyBinCount:128;
  for(var i=0;i<6;i++)VIARMS.push({
   b:.5+Math.random()*2.4,
   ph:Math.random()*6.283,
   k:Math.floor(Math.random()*nb),
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
  var th=ar.b*(.5+Math.random()*.95)+e2*7*(.7+Math.random()*.6)+amp*4.5;
  cx.lineWidth=Math.max(.4,th);
  /* spirale generee : couleurs selon la bande de frequence (graves rouges -> aigus violets) */
  var hue=Math.floor((kk/nb2)*360+VIROT*18)%360;
  cx.strokeStyle='hsla('+hue+',90%,'+(40+e2*40)+',.9)';
  cx.beginPath();
  for(var s2=0;s2<=140;s2++){
   var p=s2/140;
   var ang=ar.ph+VIROT*ar.dir+p*11+e2*Math.sin(p*9+VIROT*3)*.6;
   var rr=R*p*(.92+e2*.16*Math.sin(p*6+ar.ph));
   var x=cxp+Math.cos(ang)*rr,y=cyp+Math.sin(ang)*rr;
   if(s2)cx.lineTo(x,y);else cx.moveTo(x,y);}
  cx.stroke();});}
