// Parent signup invite/share helper.
// UI-only enhancement: no referral tracking, no journal sharing, no account creation for professionals.
(function wayfinderInviteShare(){
 const PARENT_LABEL='Invite another parent';
 const MHP_LABEL='Invite parents to Wayfinder';
 const INVITE_LINK_LABEL='Parent signup link';

 function parentSignupUrl(){
  try{
   return new URL('index.html',window.location.origin+'/').toString();
  }catch(_){
   return 'index.html';
  }
 }

 function role(){
  return String(window.PORTAL_ROLE||'parent').trim().toLowerCase()==='counsellor'?'counsellor':'parent';
 }

 function modalCopyFor(activeRole){
  if(activeRole==='counsellor'){
   return {
    title:MHP_LABEL,
    body:'Share this parent signup link with families. It only opens the parent Wayfinder entry point. It does not create a Mental Health Professional account, invite another professional, share journals, or track referrals.',
    shareText:'Join Wayfinder as a parent to reflect on moments with your child through ALIGN and CAB.'
   };
  }
  return {
   title:PARENT_LABEL,
   body:'Share this signup link with another parent. It only opens the parent Wayfinder entry point. It does not share your journal, child records, profile, or counsellor review access.',
   shareText:'I thought you might like Wayfinder, a parent reflection space for understanding moments with your child through ALIGN and CAB.'
  };
 }

 function removeModal(){
  document.querySelectorAll('.invite-share-modal').forEach((node)=>node.remove());
  document.removeEventListener('keydown',handleEscape);
 }

 function handleEscape(event){
  if(event.key==='Escape') removeModal();
 }

 function setStatus(modal,message,isError){
  const status=modal.querySelector('.invite-share-status');
  if(!status) return;
  status.textContent=message||'';
  status.classList.toggle('invite-share-status--error',!!isError);
 }

 function fallbackCopy(text){
  const area=document.createElement('textarea');
  area.value=text;
  area.setAttribute('readonly','readonly');
  area.style.position='fixed';
  area.style.left='-9999px';
  area.style.top='0';
  document.body.appendChild(area);
  area.select();
  let ok=false;
  try{ok=document.execCommand('copy');}catch(_){ok=false;}
  area.remove();
  return ok;
 }

 async function copyLink(modal,url){
  try{
   if(navigator.clipboard&&window.isSecureContext){
    await navigator.clipboard.writeText(url);
   }else if(!fallbackCopy(url)){
    throw new Error('copy_failed');
   }
   setStatus(modal,'Signup link copied.');
  }catch(_){
   setStatus(modal,'Copy was not available. Select the link and copy it manually.',true);
   const input=modal.querySelector('.invite-share-url');
   if(input){input.focus();input.select();}
  }
 }

 async function shareLink(modal,url,copy){
  if(navigator.share){
   try{
    await navigator.share({title:'Wayfinder',text:copy.shareText,url});
    setStatus(modal,'Share sheet opened.');
    return;
   }catch(err){
    if(err&&err.name==='AbortError') return;
   }
  }
  await copyLink(modal,url);
 }

 function openInviteModal(activeRole){
  removeModal();
  const url=parentSignupUrl();
  const copy=modalCopyFor(activeRole);
  const modal=document.createElement('div');
  modal.className='invite-share-modal';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-label',copy.title);
  modal.innerHTML=`
   <div class="invite-share-backdrop" data-invite-close="true"></div>
   <div class="invite-share-card">
    <button type="button" class="invite-share-close" aria-label="Close invite dialog" data-invite-close="true">×</button>
    <p class="pill invite-share-pill">Share Wayfinder</p>
    <h2>${copy.title}</h2>
    <p class="invite-share-body">${copy.body}</p>
    <label class="invite-share-link-field">
     <span>${INVITE_LINK_LABEL}</span>
     <input class="invite-share-url" type="text" readonly value="${url.replace(/"/g,'&quot;')}" />
    </label>
    <div class="invite-share-actions">
     <button type="button" class="btn btn-primary invite-share-copy">Copy signup link</button>
     <button type="button" class="btn btn-secondary invite-share-native">Share</button>
    </div>
    <p class="invite-share-status" role="status" aria-live="polite"></p>
    <p class="invite-share-privacy">No referral tracking is added. Nothing from your account is shared by this link.</p>
   </div>`;
  modal.addEventListener('click',(event)=>{
   if(event.target&&event.target.matches('[data-invite-close="true"]')) removeModal();
  });
  modal.querySelector('.invite-share-copy')?.addEventListener('click',()=>copyLink(modal,url));
  modal.querySelector('.invite-share-native')?.addEventListener('click',()=>shareLink(modal,url,copy));
  document.body.appendChild(modal);
  document.addEventListener('keydown',handleEscape);
  modal.querySelector('.invite-share-copy')?.focus();
 }

 function buildButton(activeRole){
  const button=document.createElement('button');
  button.type='button';
  button.dataset.inviteShareButton='true';
  button.textContent=activeRole==='counsellor'?MHP_LABEL:PARENT_LABEL;
  button.addEventListener('click',()=>openInviteModal(activeRole));
  return button;
 }

 function enhanceParentDashboard(){
  const actions=document.querySelector('.dashboard-actions');
  if(!actions||actions.querySelector('[data-invite-share-button="true"]')) return;
  const button=buildButton('parent');
  button.className='switch switch-trail invite-share-dashboard-btn';
  const signOut=Array.from(actions.querySelectorAll('button')).find((node)=>/sign out/i.test(node.textContent||''));
  if(signOut) actions.insertBefore(button,signOut);
  else actions.appendChild(button);
 }

 function enhanceCounsellorWorkspace(){
  const nav=document.querySelector('.counsellor-nav');
  if(!nav||nav.querySelector('[data-invite-share-button="true"]')) return;
  const button=buildButton('counsellor');
  button.className='counsellor-nav-btn invite-share-dashboard-btn';
  nav.appendChild(button);
 }

 function enhance(){
  if(role()==='counsellor') enhanceCounsellorWorkspace();
  else enhanceParentDashboard();
 }

 function start(){
  enhance();
  const observer=new MutationObserver(enhance);
  observer.observe(document.body,{childList:true,subtree:true});
 }

 if(typeof window==='undefined'||typeof document==='undefined') return;
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
