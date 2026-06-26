// Mental Health Professional onboarding UX copy and interaction overrides.
// Loaded after content.js and before app.js by counsellor.html.
// Keeps internal role as `counsellor`; only user-facing copy is adjusted.
(function applyMentalHealthProfessionalOnboardingUx(){
 if(typeof MENTAL_HEALTH_PROFESSIONAL_ONBOARDING!=='undefined'){
  Object.assign(MENTAL_HEALTH_PROFESSIONAL_ONBOARDING,{
   editProfileReviewNotice:'This top form is your editable Mental Health Professional profile draft. The private licence PDF section below is only a review helper for extracted document details; apply reviewed values upward, then save the draft here. Publication requires Wayfinder review.',
   fieldLicenseNumber:'Licence / registration number',
   licenseSectionIntro:'Upload your licence or registration certificate as a private PDF. Extracted details below are a review helper, not a second profile form, and your PDF is not shown to parents.',
   licenseExtractionDraftSuccess:'Draft details extracted. Review the document details below, adjust them only if needed, then apply them to the profile draft above.',
   licenseExtractionReviewTitle:'Review extracted licence details',
   licenseExtractionAccuracyWarning:'AI extraction may be inaccurate and is not licence verification. Adjust document details only when needed; use the button to copy reviewed values to the profile draft above, then save the top form.',
   licenseApplyReviewWorkflowNote:'This review area does not save your profile, verify a licence, activate membership, or publish a public profile. The top profile form remains the place to edit and save your draft.'
  });
 }

 function setPanelLocked(panel,locked){
  if(!panel) return;
  panel.classList.toggle('mhp-license-review-panel--locked',!!locked);
  panel.classList.toggle('mhp-license-review-panel--editing',!locked);
  panel.querySelectorAll('.mhp-license-review-input').forEach((input)=>{
   input.readOnly=!!locked;
   input.setAttribute('aria-readonly',locked?'true':'false');
   input.classList.toggle('mhp-license-review-input--readonly',!!locked);
  });
  const toggle=panel.querySelector('.mhp-license-review-toggle');
  if(toggle){
   toggle.textContent=locked?'Adjust extracted details':'Done adjusting';
   toggle.setAttribute('aria-expanded',locked?'false':'true');
  }
  const note=panel.querySelector('.mhp-license-review-toggle-note');
  if(note){
   note.textContent=locked
    ? 'Values below are shown for review only. The profile draft is edited and saved in the top form.'
    : 'Correction mode is on for this document review only. Apply values upward, then save from the top form.';
  }
 }

 function enhanceReviewPanel(panel){
  if(!panel||panel.dataset.mhpReviewEnhanced==='1') return;
  const grid=panel.querySelector('.mhp-license-review-grid');
  if(!grid) return;
  panel.dataset.mhpReviewEnhanced='1';
  const toggleRow=document.createElement('div');
  toggleRow.className='mhp-license-review-toggle-row';
  const note=document.createElement('span');
  note.className='mhp-license-review-toggle-note';
  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='btn btn-secondary btn-sm mhp-license-review-toggle';
  toggle.setAttribute('aria-expanded','false');
  toggle.addEventListener('click',()=>{
   const locked=!panel.classList.contains('mhp-license-review-panel--locked');
   setPanelLocked(panel,locked);
  });
  toggleRow.appendChild(note);
  toggleRow.appendChild(toggle);
  panel.insertBefore(toggleRow,grid);
  setPanelLocked(panel,true);
 }

 function enhanceReviewPanels(){
  document.querySelectorAll('.mhp-license-review-panel').forEach(enhanceReviewPanel);
  document.querySelectorAll('.mhp-license-review-panel--locked .mhp-license-review-input').forEach((input)=>{
   input.readOnly=true;
   input.setAttribute('aria-readonly','true');
   input.classList.add('mhp-license-review-input--readonly');
  });
 }

 if(typeof document!=='undefined'){
  const start=()=>{
   enhanceReviewPanels();
   const observer=new MutationObserver(enhanceReviewPanels);
   observer.observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading'){
   document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
   start();
  }
 }
})();
