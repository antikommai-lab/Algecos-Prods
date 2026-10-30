/* ===== auth Supabase ===== */
function sbReady(){return !!SB;}
function isAdmin(){if(!USER)return false;var e=String(USER.email||'').toLowerCase(),m=USER.user_metadata||{},u=String(m.user_name||m.preferred_username||m.full_name||'').toLowerCase();return ADMIN_EMAILS.indexOf(e)>-1||ADMIN_GH.indexOf(u)>-1;}
async function initAuth(){
 try{SB=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);}catch(e){SB=null;renderAuth();return;}
 SB.auth.onAuthStateChange(function(ev,ses){USER=(ses&&ses.user)||null;renderAuth();});
 var s=await SB.auth.getSession();USER=(s&&s.data&&s.data.session&&s.data.session.user)||null;
 renderAuth();}
function loginProv(p){if(!SB)return;if(p==='azure'&&!confirm('Connexion Microsoft ?'))return;SB.auth.signInWithOAuth({provider:p,options:{redirectTo:location.href}});}
function loginGoogle(){loginProv('google');}
function doLogout(){if(SB)SB.auth.signOut();USER=null;localStorage.removeItem('adm_tmp');renderAuth();}
/* logos marques (SVG inline) */
var SQLOGO={
apple:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#e8e6e0" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.638-.026 2.676-1.48 3.678-2.936 1.156-1.675 1.625-3.314 1.65-3.398-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.383-2.376-2-.156-3.675 1.09-4.607 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.672.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>',
google:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg>',
azure:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#F25022" d="M1 1h10.5v10.5H1z"/><path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z"/><path fill="#00A4EF" d="M1 12.5h10.5V23H1z"/><path fill="#FFB900" d="M12.5 12.5H23V23H12.5z"/></svg>',
facebook:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h4.047V9.056c0-3.988 2.386-6.192 6.032-6.192 1.749 0 3.574.312 3.574.312v3.93h-2.014c-1.973 0-2.587 1.225-2.587 2.481v2.987h4.405l-.705 3.469h-3.7v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'};
function sqRow(){return '<div class="sqrow">'
+'<button class="sqbtn" onclick="loginProv(\'apple\')" title="Continuer avec Apple">'+SQLOGO.apple+'</button>'
+'<button class="sqbtn" onclick="loginProv(\'google\')" title="Continuer avec Google">'+SQLOGO.google+'</button>'
+'<button class="sqbtn" onclick="loginProv(\'azure\')" title="Continuer avec Microsoft">'+SQLOGO.azure+'</button>'
+'<button class="sqbtn" onclick="loginProv(\'facebook\')" title="Continuer avec Facebook">'+SQLOGO.facebook+'</button>'
+'</div>';}
function tmpFold(){var d=document.getElementById('tmpFold');if(d)d.style.display='block';var b=document.getElementById('tmpDots');if(b)b.style.display='none';}
function renderAuth(){
 var z=$('authZone');
 document.body.classList.toggle('adm',isAdmin()||tmpAdm());
 if(!SB){z.innerHTML=tmpAdm()?'<div class="status ok">\u26a1 MODE ADMIN TEMPORAIRE ACTIF</div><button class="lbtn" onclick="tmpLogout()">\u26bf Verrouiller</button>':tmpForm(true);$('admTitle').style.display=tmpAdm()?'block':'none';$('admZone').style.display=tmpAdm()?'block':'none';return;}
 if(USER){
  var av=(USER.user_metadata&&USER.user_metadata.avatar_url)||'';
  var nm=(USER.user_metadata&&USER.user_metadata.full_name)||USER.email;
  z.innerHTML='<div id="uMe">'+(av?'<img src="'+esc(av)+'" alt="">':'')+'<div><b>'+esc(nm)+'</b><br><small style="color:var(--dim);font-size:.62rem">'+esc(USER.email)+'</small>'+(isAdmin()?' <span style="color:var(--y);font-size:.62rem">\u2605 ADMIN</span>':'')+'</div></div><button class="lbtn" onclick="doLogout()">\u23fb D\u00e9connexion</button>';
  if(isAdmin()){$('admTitle').style.display='block';$('admZone').style.display='block';}
  else{$('admTitle').style.display='none';$('admZone').style.display='none';}
 }else{
  z.innerHTML=sqRow()+tmpForm(false);
  $('admTitle').style.display='none';$('admZone').style.display='none';}
 if(TRACKS.length||PLAYLISTS.length){render();renderPlaylist();renderPlists();renderHomeGrid();renderVersions();renderColls();}}
function saveTok(){GHTOK=$('ghTok').value.trim();
 if(GHTOK){localStorage.setItem('gh_pat',GHTOK);$('tokStatus').className='status ok';$('tokStatus').textContent='M\u00c9MORIS\u00c9 \u2713';}
 else{$('tokStatus').className='status err';$('tokStatus').textContent='VIDE';}}

/* ===== admin temporaire : zone pliee derriere ... ===== */
function tmpAdm(){return localStorage.getItem('adm_tmp')==='1';}
function tmpForm(withMsg){var h='';
 if(!tmpAdm())h+='<button id="tmpDots" class="btn2" style="width:100%;text-align:center;letter-spacing:.35em;color:var(--dim);border-color:var(--line)" title="Zone r\u00e9serv\u00e9e" onclick="tmpFold()">\u00b7 \u00b7 \u00b7</button>';
 h+='<div id="tmpFold" style="display:'+(tmpAdm()?'block':'none')+';margin-top:8px">';
 if(withMsg)h+='<div class="status" style="color:var(--dim)">CONNEXION BIENT\u00d4T DISPONIBLE</div>';
 h+='<label>Acc\u00e8s admin temporaire</label><input id="tmpPass" type="password" placeholder="mot de passe" onkeydown="if(event.key===\'Enter\')tmpLogin()">';
 h+='<div class="row"><button class="btn" style="width:100%" onclick="tmpLogin()">\u26bf D\u00e9verrouiller</button></div><div class="status" id="tmpStatus"></div></div>';return h;}
async function tmpLogin(){
 var p=$('tmpPass')?$('tmpPass').value:'';
 if(!p){$('tmpStatus').className='status err';$('tmpStatus').textContent='VIDE';return;}
 try{
  var buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));
  var hex=[].slice.call(new Uint8Array(buf)).map(function(b){return ('0'+b.toString(16)).slice(-2);}).join('');
  if(hex!==ADMIN_PASS_HASH){$('tmpStatus').className='status err';$('tmpStatus').textContent='MAUVAIS MOT DE PASSE';alert('MAUVAIS MOT DE PASSE');return;}
  localStorage.setItem('adm_tmp','1');renderAuth();alert('MODE ADMIN ACTIF \u2014 roues crant\u00e9es et menu Admin disponibles');}
 catch(e){$('tmpStatus').className='status err';$('tmpStatus').textContent=e.message;alert('ERREUR : '+e.message);}}
function tmpLogout(){localStorage.removeItem('adm_tmp');renderAuth();}
