/* ===== auth Supabase ===== */
function sbReady(){return !!SB;}
function isAdmin(){if(!USER)return false;var e=String(USER.email||'').toLowerCase(),m=USER.user_metadata||{},u=String(m.user_name||m.preferred_username||m.full_name||'').toLowerCase();return ADMIN_EMAILS.indexOf(e)>-1||ADMIN_GH.indexOf(u)>-1;}
async function initAuth(){
 try{SB=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);}catch(e){SB=null;renderAuth();return;}
 SB.auth.onAuthStateChange(function(ev,ses){USER=(ses&&ses.user)||null;renderAuth();});
 var s=await SB.auth.getSession();USER=(s&&s.data&&s.data.session&&s.data.session.user)||null;
 renderAuth();}
function loginGoogle(){if(!SB)return;SB.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}});}
function loginGithub(){if(!SB)return;SB.auth.signInWithOAuth({provider:'github',options:{redirectTo:location.href}});}
function doLogout(){if(SB)SB.auth.signOut();USER=null;localStorage.removeItem('adm_tmp');renderAuth();}
function renderAuth(){
 var z=$('authZone');
 document.body.classList.toggle('adm',isAdmin()||tmpAdm());
 if(!SB){z.innerHTML=tmpAdm()?'<div class="status ok">⚡ MODE ADMIN TEMPORAIRE ACTIF</div><button class="lbtn" onclick="tmpLogout()">⚿ Verrouiller</button>':tmpForm(true);$('admTitle').style.display=tmpAdm()?'block':'none';$('admZone').style.display=tmpAdm()?'block':'none';return;}
 if(USER){
  var av=(USER.user_metadata&&USER.user_metadata.avatar_url)||'';
  var nm=(USER.user_metadata&&USER.user_metadata.full_name)||USER.email;
  z.innerHTML='<div id="uMe">'+(av?'<img src="'+esc(av)+'" alt="">':'')+'<div><b>'+esc(nm)+'</b><br><small style="color:var(--dim);font-size:.62rem">'+esc(USER.email)+'</small>'+(isAdmin()?' <span style="color:var(--y);font-size:.62rem">★ ADMIN</span>':'')+'</div></div><button class="lbtn" onclick="doLogout()">⏻ Déconnexion</button>';
  if(isAdmin()){$('admTitle').style.display='block';$('admZone').style.display='block';}
  else{$('admTitle').style.display='none';$('admZone').style.display='none';}
 }else{
  z.innerHTML='<button class="lbtn" onclick="loginGoogle()">G Se connecter avec Google</button><button class="lbtn" onclick="loginGithub()">⌥ Se connecter avec GitHub</button>'+tmpForm(false);
  $('admTitle').style.display='none';$('admZone').style.display='none';}
 if(TRACKS.length||PLAYLISTS.length){render();renderPlaylist();renderPlists();renderHomeGrid();renderVersions();renderSels();}}
function saveTok(){GHTOK=$('ghTok').value.trim();
 if(GHTOK){localStorage.setItem('gh_pat',GHTOK);$('tokStatus').className='status ok';$('tokStatus').textContent='MÉMORISÉ ✓';}
 else{$('tokStatus').className='status err';$('tokStatus').textContent='VIDE';}}

/* ===== admin temporaire + ticker + normalisation lyrics ===== */
function tmpAdm(){return localStorage.getItem('adm_tmp')==='1';}
function tmpForm(withMsg){var h=withMsg?'<div class="status" style="color:var(--dim)">CONNEXION BIENTÔT DISPONIBLE</div>':'';
 h+='<label>Accès admin temporaire</label><input id="tmpPass" type="password" placeholder="mot de passe" onkeydown="if(event.key===\'Enter\')tmpLogin()">';
 h+='<div class="row"><button class="btn" style="width:100%" onclick="tmpLogin()">⚿ Déverrouiller</button></div><div class="status" id="tmpStatus"></div>';return h;}
async function tmpLogin(){
 var p=$('tmpPass')?$('tmpPass').value:'';
 if(!p){$('tmpStatus').className='status err';$('tmpStatus').textContent='VIDE';return;}
 try{
  var buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));
  var hex=[].slice.call(new Uint8Array(buf)).map(function(b){return ('0'+b.toString(16)).slice(-2);}).join('');
  var r=await fetch('admin_pass.hash?t='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error('FICHIER HASH INTROUVABLE');
  var ref=(await r.text()).trim();
  if(hex!==ref){$('tmpStatus').className='status err';$('tmpStatus').textContent='MAUVAIS MOT DE PASSE';alert('\u26A0 MAUVAIS MOT DE PASSE \u2014 v\u00E9rifie la saisie (attention aux caract\u00E8res proches : 0/O, l/1).');return;}
  localStorage.setItem('adm_tmp','1');renderAuth();alert('\u2713 MODE ADMIN ACTIF \u2014 les roues crant\u00E9es \u2699 et le menu Admin sont disponibles.');}
 catch(e){$('tmpStatus').className='status err';$('tmpStatus').textContent=e.message;}}
function tmpLogout(){localStorage.removeItem('adm_tmp');renderAuth();}
