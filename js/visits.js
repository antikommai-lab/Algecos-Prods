/* ===== premiere visite : bienvenue (site + valeurs) + visite + gouts ===== */
function vsOpen(html){
 vsClose();
 var ov=document.createElement('div');ov.className='modal';ov.id='vsModal';
 ov.innerHTML='<div class="mbox">'+html+'</div>';
 ov.onclick=function(e){if(e.target===ov)vsClose();};
 document.body.appendChild(ov);}
function vsClose(){var m=document.getElementById('vsModal');if(m)m.remove();}
function vsNever(on){try{if(on)localStorage.setItem('ap_nowelcome','1');else localStorage.removeItem('ap_nowelcome');}catch(e){}}
function vsInit(){
 var seen=null,nw=null;
 try{seen=localStorage.getItem('ap_visit');nw=localStorage.getItem('ap_nowelcome');}catch(e){}
 if(!seen){try{localStorage.setItem('ap_visit','1');}catch(e){}
  if(nw!=='1')vsWelcome();}}
function vsWelcome(){
 vsOpen('<h3>BIENVENUE SUR ALGECOS-PRODS</h3>'+
  '<h4 style="font-size:.7rem;color:var(--y);letter-spacing:.12em;text-transform:uppercase;margin:2px 0 6px">1 \u2014 Le site</h4>'+
  '<p style="font-size:.74rem;line-height:1.8">ALGECOS-PRODS est le labo musical exp\u00e9rimental de la collective ANTIKOMM : cr\u00e9er, \u00e9couter et explorer de nouveaux sous-genres \u2014 <b style="color:var(--y)">Jazzidcore, Manouchecore, Gypsycore, Ragcore, Slavicore...</b> Tout le catalogue s\u2019\u00e9coute <b style="color:var(--y)">gratuitement</b>, sans compte ni mail : playlists, cr\u00e9ations, votes, visualiseur, commandes sur mesure.</p>'+
  '<h4 style="font-size:.7rem;color:var(--y);letter-spacing:.12em;text-transform:uppercase;margin:12px 0 6px">2 \u2014 Nos valeurs</h4>'+
  '<p style="font-size:.72rem;line-height:1.8;color:var(--dim)">Nous sommes tr\u00e8s attach\u00e9s \u00e0 nos valeurs \u2014 Co-Bergerie, \u00e9conomie de contribution, gratuit\u00e9 par d\u00e9faut, Privacy by Design. Elles sont r\u00e9dig\u00e9es dans la charte ANTIKOMM :</p>'+
  '<a class="lbtn" href="https://antikommai-lab.github.io/Technoisme/" target="_blank" rel="noopener">\u2794 Lire la charte ANTIKOMM</a>'+
  '<div class="row"><button class="btn" onclick="vsFeatures()">Visite rapide du site</button>'+
  '<button class="btn2" onclick="vsTastes()">Personnaliser mes \u00e9coutes</button>'+
  '<button class="btn2" onclick="vsClose()">Passer \u2715</button></div>'+
  '<label style="display:flex;align-items:center;gap:8px;margin-top:12px;font-size:.66rem;color:var(--dim);cursor:pointer"><input type="checkbox" style="width:16px;height:16px;accent-color:var(--y)" onchange="vsNever(this.checked)"> Ne plus jamais afficher cette pop-up</label>');}
function vsFeatures(){
 vsOpen('<h3>VISITE RAPIDE</h3>'+
  '<div style="font-size:.74rem;line-height:1.9">'+
  '\u25b6 <b>\u00e9couter</b> : playlists, albums, collections, nouveaut\u00e9s.<br>'+
  '\u2630 <b>Cr\u00e9er</b> tes propres playlists et collections \u00e0 partir du catalogue.<br>'+
  '\u266a <b>Versions</b> : \u00e9coute les variations d\u2019un m\u00eame morceau et <b>vote</b> pour ta pr\u00e9f\u00e9r\u00e9e.<br>'+
  '\u270d <b>Lyrics</b> d\u00e9filantes, commentaires, likes, filtres par mots-cl\u00e9s et tri.<br>'+
  '<b>Partager</b> : chaque morceau, playlist ou recherche a son lien URL direct.<br>'+
  '<b>Visualiseur</b> plein \u00e9cran synchronis\u00e9 au morceau (bouton dans le player).</div>'+
  '<p style="font-size:.72rem;line-height:1.7;color:var(--dim);margin-top:10px">Tout est <b style="color:var(--y)">gratuit</b>, sans abonnement \u2014 mais sans abonnement : moins de fiabilit\u00e9 et certaines fonctionnalit\u00e9s indisponibles.</p>'+
  '<div class="row"><button class="btn" onclick="vsTastes()">Personnaliser mes \u00e9coutes</button>'+
  '<button class="btn2" onclick="vsClose()">Fermer \u2715</button></div>');}
function vsTastes(){
 var tags=(typeof TAGS!=='undefined'&&TAGS&&TAGS.length)?TAGS.slice(0,24):['jazzidcore','jazzidtribe','manouchecore','gypsycore','ragcore','celticore','slavicore','rap','instru','techno','jazz','dark','epic','happy'];
 var saved=[];try{saved=JSON.parse(localStorage.getItem('ap_tastes')||'[]');}catch(e){}
 var cb='';
 tags.forEach(function(t){
  cb+='<label style="display:inline-flex;align-items:center;gap:4px;margin:3px;border:1px solid var(--line);padding:3px 8px;font-size:.66rem;cursor:pointer"><input type="checkbox" class="vstk" value="'+t+'"'+(saved.indexOf(t)>-1?' checked':'')+'>'+t+'</label>';});
 vsOpen('<h3>TES GOUTS, TES SUGGESTIONS</h3>'+
  '<p style="font-size:.72rem;line-height:1.7;color:var(--dim)">Coche ce qui te pla\u00eet \u2014 stock\u00e9 sur ton appareil, jamais envoy\u00e9.</p>'+
  '<div>'+cb+'</div>'+
  '<div class="row"><button class="btn" onclick="vsSaveTastes()">Enregistrer mes go\u00fbts</button>'+
  '<button class="btn2" onclick="vsClose()">Plus tard</button></div>');}
function vsSaveTastes(){
 var sel=[];
 document.querySelectorAll('.vstk:checked').forEach(function(c){sel.push(c.value);});
 try{localStorage.setItem('ap_tastes',JSON.stringify(sel));}catch(e){}
 vsClose();}
function vsValues(){
 vsOpen('<h3>NOS VALEURS \u2014 LA CHARTE ANTIKOMM</h3>'+
  '<div style="font-size:.74rem;line-height:1.8">Co-Bergerie du vivant et des machines, \u00e9conomie de la contribution, gratuit\u00e9 par d\u00e9faut, <b style="color:var(--y)">Privacy by Design</b> (tes donn\u00e9es restent sur ton appareil), redevabilit\u00e9 bi-directionnelle humain-IA.</div>'+
  '<p style="font-size:.7rem;line-height:1.8;color:var(--dim);margin-top:8px">La charte compl\u00e8te \u2014 techno\u00efsme et Charte de l\u2019Atome-Terre \u2014 est publique :</p>'+
  '<a class="lbtn" href="https://antikommai-lab.github.io/Technoisme/" target="_blank" rel="noopener">Wiki du techno\u00efsme</a>'+
  '<a class="lbtn" href="https://github.com/projetlumieres/charte-ethique" target="_blank" rel="noopener">Charte de l\u2019Atome-Terre</a>'+
  '<div class="row"><button class="btn" onclick="vsFeatures()">Fonctionnalit\u00e9s</button>'+
  '<button class="btn2" onclick="vsClose()">Fermer \u2715</button></div>');}
if(typeof document!=='undefined')vsInit();
