// Mental Health Professional onboarding UX copy overrides.
// Loaded after content.js and before app.js by counsellor.html.
// Keeps internal role as `counsellor`; only user-facing copy is adjusted.
(function applyMentalHealthProfessionalOnboardingUxCopy(){
 if(typeof MENTAL_HEALTH_PROFESSIONAL_ONBOARDING==='undefined') return;
 Object.assign(MENTAL_HEALTH_PROFESSIONAL_ONBOARDING,{
  editProfileReviewNotice:'This top form is your editable Mental Health Professional profile draft. The private licence PDF section below is only a review helper for extracted document details; apply reviewed values upward, then save the draft here. Publication requires Wayfinder review.',
  fieldLicenseNumber:'Licence / registration number',
  licenseSectionIntro:'Upload your licence or registration certificate as a private PDF. Extracted details below are a review helper, not a second profile form, and your PDF is not shown to parents.',
  licenseExtractionDraftSuccess:'Draft details extracted. Review the document details below, adjust them only if needed, then apply them to the profile draft above.',
  licenseExtractionReviewTitle:'Review extracted licence details',
  licenseExtractionAccuracyWarning:'AI extraction may be inaccurate and is not licence verification. Adjust document details here only if needed; use the button to copy reviewed values to the profile draft above, then save the top form.',
  licenseApplyReviewWorkflowNote:'This review area does not save your profile, verify a licence, activate membership, or publish a public profile. The top profile form remains the place to edit and save your draft.'
 });
})();
