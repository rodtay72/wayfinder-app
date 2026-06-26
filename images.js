// ============================================
// WAY FINDER - IMAGE DATA / SMALL SHARED UI HELPERS
// ============================================
// Image data stored as base64-encoded SVG.
// You can replace these with actual image files later.

(function wayfinderInviteSharePrompt(){
 function parentSignupLink(){
  try{return new URL('index.html',window.location.origin+'/').toString();}
  catch(_){return 'index.html';}
 }
 function openPrompt(role){
  const label=role==='counsellor'?'Invite parents to Wayfinder':'Invite another parent';
  window.prompt(label+' - copy this parent signup link:',parentSignupLink());
 }
 function addButton(host,role,className,beforeSignOut){
  if(!host||host.querySelector('[data-wayfinder-invite-share="1"]'))return;
  const button=document.createElement('button');
  button.type='button';
  button.dataset.wayfinderInviteShare='1';
  button.className=className;
  button.textContent=role==='counsellor'?'Invite parents to Wayfinder':'Invite another parent';
  button.title='Shares only the parent signup link. No referral tracking, journal sharing, or professional account creation.';
  button.addEventListener('click',()=>openPrompt(role));
  if(beforeSignOut){
   const signOut=Array.from(host.querySelectorAll('button')).find((node)=>/sign out/i.test(node.textContent||''));
   if(signOut){host.insertBefore(button,signOut);return;}
  }
  host.appendChild(button);
 }
 function scan(){
  const activeRole=String(window.PORTAL_ROLE||'parent').toLowerCase()==='counsellor'?'counsellor':'parent';
  if(activeRole==='counsellor'){
   addButton(document.querySelector('.counsellor-nav'),'counsellor','counsellor-nav-btn',false);
  }else{
   addButton(document.querySelector('.dashboard-actions'),'parent','switch switch-trail',true);
  }
 }
 function start(){scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});}
 if(typeof window==='undefined'||typeof document==='undefined')return;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {  };
}
