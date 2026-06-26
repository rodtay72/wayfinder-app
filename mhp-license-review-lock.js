// MHP licence extraction review lock.
// Keeps the top profile form as the only normal edit/save form.
(function(){
 function setLocked(panel,locked){
  if(!panel) return;
  panel.classList.toggle('mhp-license-review-panel--locked',locked);
  panel.classList.toggle('mhp-license-review-panel--editing',!locked);
  panel.querySelectorAll('.mhp-license-review-input').forEach(function(input){
   input.readOnly=locked;
   input.setAttribute('aria-readonly',locked?'true':'false');
  });
  var button=panel.querySelector('.mhp-license-review-toggle');
  if(button){
   button.textContent=locked?'Adjust extracted details':'Done adjusting';
   button.setAttribute('aria-expanded',locked?'false':'true');
  }
  var note=panel.querySelector('.mhp-license-review-toggle-note');
  if(note){
   note.textContent=locked
    ? 'Review values only. Edit and save the profile in the top form.'
    : 'Correction mode is on for this document review only.';
  }
 }
 function enhance(panel){
  if(!panel||panel.dataset.reviewLockReady==='1') return;
  var grid=panel.querySelector('.mhp-license-review-grid');
  if(!grid) return;
  panel.dataset.reviewLockReady='1';
  var row=document.createElement('div');
  row.className='mhp-license-review-toggle-row';
  var note=document.createElement('span');
  note.className='mhp-license-review-toggle-note';
  var button=document.createElement('button');
  button.type='button';
  button.className='btn btn-secondary btn-sm mhp-license-review-toggle';
  button.setAttribute('aria-expanded','false');
  button.addEventListener('click',function(){
   setLocked(panel,!panel.classList.contains('mhp-license-review-panel--locked'));
  });
  row.appendChild(note);
  row.appendChild(button);
  panel.insertBefore(row,grid);
  setLocked(panel,true);
 }
 function scan(){
  document.querySelectorAll('.mhp-license-review-panel').forEach(enhance);
 }
 function start(){
  scan();
  new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
