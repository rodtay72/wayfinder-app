// ============================================
// WAY FINDER - APPLICATION CODE
// ============================================
// This file contains the React components and application logic.
// Content (text, activities, etc.) is loaded from content.js
// Most edits should be done in content.js, not here.

// Content constants (BRAND, ACTIVITIES, MARKERS, etc.) are loaded from content.js


const { useState, useEffect, useMemo, useRef } = React;

/* ============ DATA ============ */
// PHASES, ACTIVITIES, MARKERS, VALUE_GROUPS, CHILD_NEEDS_WORDS, CULTURE, SHIFT_WORDS
// are all loaded from content.js (edit that file to change content)

// Auto-word analysis: detect DISC patterns in CAB content
function analyzeCAB(cab){
 const text=(cab.thoughts+' '+cab.feelings+' '+cab.actions+' '+cab.meaning).toLowerCase();
 const scores={D:0,C:0,I:0,S:0};
 
 // D indicators: control, direction, telling, fixing, managing
 const dWords=['should','must','tell','told','correct','fix','manage','direct','command','take over','jump in','control','insisted','pushed','made sure'];
 const cWords=['wrong','right','proper','correct','mistake','error','should have','supposed to','ought','explain','instruct','teach','show how'];
 const iWords=['play','fun','enthusias','excit','laugh','joy','express','spontan','togeth','connect','engage'];
 const sWords=['patient','wait','gentle','calm','listen','accept','support','stay','present','slow','stead'];
 
 dWords.forEach(w=>{if(text.includes(w))scores.D+=2;});
 cWords.forEach(w=>{if(text.includes(w))scores.C+=2;});
 iWords.forEach(w=>{if(text.includes(w))scores.I+=1;});
 sWords.forEach(w=>{if(text.includes(w))scores.S+=1;});
 
 // Default to D/C if very short or no clear signal
 if(text.length<30){scores.D+=1;scores.C+=1;}
 
 // Pick top 2 quadrants
 const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
 const top2=[sorted[0][0],sorted[1][0]];
 
 // Return 4 words from the dominant patterns
 const pool=VALUE_GROUPS.filter(g=>top2.includes(g.k)).flatMap(g=>g.words);
 const picked=pool.slice(0,4);
 return picked.length<4 ? [...picked,...VALUE_GROUPS.find(g=>g.k==='D').words.slice(0,4-picked.length)] : picked;
}

// Shift guidance words (sourced from content.js SHIFT_WORDS)
const SHIFT_LOWER_DC = SHIFT_WORDS.lowerDC; // lower D&C gear
const SHIFT_RAISE_IS = SHIFT_WORDS.raiseIS; // raise I&S gear

const VALUE_GROUPS_OLD=[
 {k:'I',cls:'wg-i',on:'on-i',title:'Warmth & Connection',hint:'emotional warmth the child can feel',words:['Enthusiastic','Optimistic','Encouraging','Warm','Playful','Expressive','Friendly','Generous']},
 {k:'S',cls:'wg-s',on:'on-s',title:'Steadiness & Safety',hint:'emotional safety and calm the child can borrow',words:['Calm','Patient','Steady','Listening','Dependable','Reassuring','Gentle','Present']},
 {k:'D',cls:'wg-d',on:'on-d',title:'Drive & Direction',hint:'watch the high end — can tip into control',words:['Decisive','Direct','Determined','Taking-charge','Demanding','Forceful','Pushing','Controlling']},
 {k:'C',cls:'wg-c',on:'on-c',title:'Standards & Precision',hint:'watch the high end — can tip into criticism',words:['Careful','Accurate','High-standards','Analytical','Correcting','Critical','Exacting','Fault-finding']},
];
const WORD_Q={}; VALUE_GROUPS.forEach(g=>g.words.forEach(w=>WORD_Q[w]=g.k));
const D_HARSH=['Taking-charge','Demanding','Forceful','Pushing','Controlling'];
const C_HARSH=['Correcting','Critical','Exacting','Fault-finding'];

// DISC quadrant fears + soften/raise shift map (from spreadsheet intensity ladder)
const QUAD={
 D:{name:'Dominance',fear:'Loss of control',satir:'Blaming',high:['Domineering','Demanding','Forceful','Argumentative','Egocentric'],soft:['Determined','Self-reliant','Calculates risks','Questioning']},
 I:{name:'Influence',fear:'Rejection',satir:'Distracting',high:['Enthusiastic','Optimistic','Encouraging','Persuasive','Charming'],soft:[]},
 S:{name:'Steadiness',fear:'Loss of security',satir:'Placating',high:['Calming','Patient','Steady','Listener','Loyal'],soft:[]},
 C:{name:'Conscientiousness',fear:'Criticism',satir:'Super-reasonable',high:['Exacting','Critical','Fault-finder','Precise','Accurate'],soft:['Sensitive','Tactful','Diplomatic','Self-assured']},
};
// Satir stance descriptions
const SATIR={
 Blaming:'Self over Other (D). "Do it this way / that\'s wrong." Protects against loss of control.',
 'Super-reasonable':'Logic over feeling (C). Correcting, detached, fact-driven. Protects against criticism.',
 Placating:'Other over Self (S). Giving in, smoothing, self-erasing. Protects against loss of security.',
 Distracting:'Off the point (I). Deflecting with humour or change of topic. Protects against rejection.',
 Congruent:'Self + Other + Context held together. Honest feeling, owned, while staying connected and fitting the moment.',
};
// CULTURE is loaded from content.js

// Child developmental capacity by age band
function childNeed(yrs){
 if(yrs===null) return {band:'—',need:'co-regulation and a steady, predictable presence',cap:'still learning that feelings are safe'};
 if(yrs<3) return {band:'Infant–toddler',need:'co-regulation — borrowing your calm; soothing, predictable presence',cap:'cannot yet self-regulate; learns safety from your body and tone'};
 if(yrs<7) return {band:'Early childhood (3–6)',need:'emotional naming and warmth over correction; safe exploration',cap:'emerging language for feelings; learns feelings are safe to have'};
 if(yrs<13) return {band:'Middle childhood (7–12)',need:'validation plus collaborative problem-solving; autonomy with support',cap:'logical but still needs emotional scaffolding; learns mistakes are survivable'};
 return {band:'Adolescence (13+)',need:'respect, non-reactive listening, presence over control',cap:'abstract reasoning and autonomy-seeking; learns identity inside a safe relationship'};
}

/* ============ STORAGE ============ */
const LS={
 dyads:()=>{try{return JSON.parse(localStorage.getItem('sj_v2_dyads')||'{}')}catch{return{}}},
 saveDyads:(o)=>localStorage.setItem('sj_v2_dyads',JSON.stringify(o)),
 entries:()=>{try{return JSON.parse(localStorage.getItem('sj_v2_entries')||'[]')}catch{return[]}},
 saveEntries:(a)=>localStorage.setItem('sj_v2_entries',JSON.stringify(a)),
 reviews:()=>{try{return JSON.parse(localStorage.getItem('sj_v2_reviews')||'{}')}catch{return{}}},
 saveReviews:(o)=>localStorage.setItem('sj_v2_reviews',JSON.stringify(o)),
};

/* ============ HELPERS ============ */
const parseStoredDate=(value)=>{
 if(!value)return null;
 if(value instanceof Date)return isNaN(value)?null:value;
 const raw=String(value).trim();
 if(!raw)return null;
 const direct=new Date(raw);
 if(!isNaN(direct))return direct;
 const legacy=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
 if(!legacy)return null;
 const [,day,month,year,hour='0',minute='0',second='0']=legacy;
 const parsed=new Date(Number(year),Number(month)-1,Number(day),Number(hour),Number(minute),Number(second));
 return isNaN(parsed)?null:parsed;
};
const firstStoredDateValue=(...values)=>values.find(v=>parseStoredDate(v))||values.find(Boolean)||null;
const toIsoTimestampOrNull=(value)=>{const date=parseStoredDate(value);return date?date.toISOString():null;};
const ageFrom=(dob,at)=>{if(!dob)return null;const b=new Date(dob),r=at?new Date(at):new Date();if(isNaN(b))return null;const totalMonths=Math.floor((r.getFullYear()-b.getFullYear())*12+(r.getMonth()-b.getMonth())-(r.getDate()<b.getDate()?1:0));if(totalMonths<0)return null;const y=Math.floor(totalMonths/12);const m=totalMonths%12;if(y===0)return m===1?'1 month':`${m} months`;if(m===0)return y===1?'1 year':`${y} years`;return y===1?(m===1?'1 year 1 month':`1 year ${m} months`):(m===1?`${y} years 1 month`:`${y} years ${m} months`);};
const ageCompact=(dob,at)=>{if(!dob)return null;const b=new Date(dob),r=at?new Date(at):new Date();if(isNaN(b))return null;const totalMonths=Math.floor((r.getFullYear()-b.getFullYear())*12+(r.getMonth()-b.getMonth())-(r.getDate()<b.getDate()?1:0));if(totalMonths<0)return null;const y=Math.floor(totalMonths/12);const m=totalMonths%12;if(y===0)return `${m}m`;if(m===0)return `${y}y`;return `${y}y ${m}m`;};
const fmtAge=(y)=>y===null||y===undefined?'—':y;
const genId=(p)=>{const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=c[Math.floor(Math.random()*c.length)];return p+'-'+s;};
const yearsFrom=(dob,at)=>{if(!dob)return null;const b=new Date(dob),r=at?new Date(at):new Date();if(isNaN(b)||isNaN(r))return null;let y=r.getFullYear()-b.getFullYear();const beforeBirthday=r.getMonth()<b.getMonth()||(r.getMonth()===b.getMonth()&&r.getDate()<b.getDate());if(beforeBirthday)y-=1;return y>=0?y:null;};
const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeGeneratedId=(value,prefix,fallback)=>{const id=String(value||'').trim();if(!id||UUID_RE.test(id))return fallback;const re=new RegExp('^'+prefix+'-[A-Z0-9-]{3,}$','i');return re.test(id)?id.toUpperCase():fallback;};
const safeParentId=(value)=>safeGeneratedId(value,'P','Parent ID unavailable');
const safeChildId=(value)=>safeGeneratedId(value,'C','Child ID unavailable');
const safeObject=(value)=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const safeArray=(value)=>Array.isArray(value)?value:[];

/* ============ ILLUSTRATIONS (original, flat + grain, warm palette) ============ */
// A simple warm figure: head with hair-cap, gentle face, rounded torso
const Figure=({x,y,s=1,skin,hair,top})=>(
 <g transform={`translate(${x} ${y}) scale(${s})`}>
  <path d="M-27 80 Q-27 22 0 22 Q27 22 27 80 Z" fill={top}/>
  <ellipse cx="0" cy="-7" rx="29" ry="23" fill={hair}/>
  <circle cx="0" cy="0" r="26" fill={skin}/>
  <circle cx="-9" cy="1" r="2.4" fill="#3a2a1c"/>
  <circle cx="9" cy="1" r="2.4" fill="#3a2a1c"/>
  <path d="M-8 11 Q0 18 8 11" stroke="#8a4f30" strokeWidth="2" fill="none" strokeLinecap="round"/>
  <circle cx="-14" cy="9" r="4.5" fill="#E8836F" opacity="0.32"/>
  <circle cx="14" cy="9" r="4.5" fill="#E8836F" opacity="0.32"/>
 </g>
);
// Hero — parent + child close (the dyad), warm room
const HeroDyad=()=>(
 <svg className="illus" viewBox="0 0 440 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A parent and child together, warmly connected">
  <rect x="0" y="0" width="440" height="220" rx="16" fill="#FBEFDD"/>
  <circle cx="64" cy="60" r="44" fill="#F3D9C2"/>
  <circle cx="392" cy="170" r="56" fill="#DCEDE8"/>
  <ellipse cx="220" cy="206" rx="150" ry="20" fill="#EAD9C0"/>
  {/* picture frames on the wall, like the reference */}
  <rect x="44" y="40" width="42" height="32" rx="5" fill="#5FB6B0"/><rect x="50" y="46" width="30" height="20" rx="2" fill="#cfe7e3"/>
  <rect x="96" y="32" width="32" height="42" rx="5" fill="#E8836F"/><rect x="102" y="38" width="20" height="30" rx="2" fill="#f4cfc6"/>
  <rect x="360" y="44" width="36" height="30" rx="5" fill="#D4A24E"/><rect x="366" y="50" width="24" height="18" rx="2" fill="#efdcb3"/>
  {/* child (left, smaller) + parent (right) */}
  <Figure x="186" y="120" s={0.82} skin="#E0AC69" hair="#2A2118" top="#5FB6B0"/>
  {/* parent arm around child */}
  <path d="M236 150 Q205 140 182 150 L186 168 Q210 158 236 168 Z" fill="#E8836F"/>
  <Figure x="258" y="102" s={1.06} skin="#C68642" hair="#3a2a1c" top="#E8836F"/>
 </svg>
);
// Parent spot — adult bending toward a small child
const SpotParent=()=>(
 <svg className="illus" viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A parent leaning toward their child">
  <circle cx="60" cy="58" r="46" fill="#F6E7DC"/>
  <Figure x="44" y="46" s={0.62} skin="#E0AC69" hair="#2A2118" top="#5FB6B0"/>
  <Figure x="74" y="38" s={0.78} skin="#C68642" hair="#3a2a1c" top="#E8836F"/>
 </svg>
);
// Counsellor spot — a wayfinder compass
const SpotCompass=()=>(
 <svg className="illus" viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A compass, for finding the way">
  <circle cx="60" cy="55" r="46" fill="#EAF0EB"/>
  <circle cx="60" cy="55" r="38" fill="none" stroke="#7C9885" strokeWidth="3"/>
  <line x1="60" y1="20" x2="60" y2="27" stroke="#5E7A68" strokeWidth="3" strokeLinecap="round"/>
  <line x1="60" y1="83" x2="60" y2="90" stroke="#5E7A68" strokeWidth="3" strokeLinecap="round"/>
  <line x1="25" y1="55" x2="32" y2="55" stroke="#5E7A68" strokeWidth="3" strokeLinecap="round"/>
  <line x1="88" y1="55" x2="95" y2="55" stroke="#5E7A68" strokeWidth="3" strokeLinecap="round"/>
  <path d="M60 28 L68 57 L60 50 L52 57 Z" fill="#D98E6F"/>
  <path d="M60 82 L52 53 L60 60 L68 53 Z" fill="#5E7A68"/>
  <circle cx="60" cy="55" r="4" fill="#3A332B"/>
 </svg>
);
// Seedling — growth/closure motif
const SpotSeedling=()=>(
 <svg className="illus" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A seedling growing">
  <circle cx="60" cy="60" r="50" fill="#E6EFE7"/>
  <path d="M60 96 L60 56" stroke="#5E7A68" strokeWidth="4" strokeLinecap="round"/>
  <path d="M60 70 Q40 64 34 46 Q56 46 60 68 Z" fill="#7C9885"/>
  <path d="M60 62 Q80 54 88 38 Q64 40 60 60 Z" fill="#5E9C76"/>
  <path d="M48 96 Q60 88 72 96 Z" fill="#D4A24E"/>
  <circle cx="60" cy="42" r="7" fill="#E8A23D"/>
 </svg>
);

/* ============ APP ============ */
const IMG={hero:"data:image/jpeg;base64,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",signin:"data:image/jpeg;base64,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",hope:"data:image/jpeg;base64,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",forward:"data:image/jpeg;base64,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",parent:"data:image/jpeg;base64,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",loginParent:"data:image/jpeg;base64,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"};

function ProfileSettings({user,profile,dyads=[],entries=[],compact}){
 if(!user||!profile)return null;
 const parentSource=dyads.find(d=>d?.parentDob||d?.parentGender)||entries.find(e=>e?.parentDob||e?.parentGender)||{};
 const parentAge=ageFrom(parentSource.parentDob,null);
 const parentGender=parentSource.parentGender||'Not added';
 if(compact){
  return <div className="dashboard-profile-strip" aria-label="Profile">
   <span className="dashboard-profile-item"><span className="dashboard-profile-label">Wayfinder ID</span> <b>{profile.parent_id}</b></span>
   <span className="dashboard-profile-item"><span className="dashboard-profile-label">Role</span> <b>{profile.role}</b></span>
   <span className="dashboard-profile-item"><span className="dashboard-profile-label">Age</span> <b>{parentAge||'Not added'}</b></span>
   <span className="dashboard-profile-item"><span className="dashboard-profile-label">Gender</span> <b>{parentGender}</b></span>
  </div>;
 }
 return <div className="card" style={{padding:16}}>
  <div>
   <div style={{fontWeight:800,marginBottom:6}}>Profile</div>
   <div className="sub" style={{fontSize:13}}>Wayfinder ID: <b>{profile.parent_id}</b></div>
   <div className="sub" style={{fontSize:13}}>Role: <b>{profile.role}</b></div>
   <div className="sub" style={{fontSize:13}}>Parent age: <b>{parentAge||'Not added'}</b></div>
   <div className="sub" style={{fontSize:13}}>Parent gender: <b>{parentGender}</b></div>
  </div>
 </div>;
}

function Landing({onEnter,user,profile,onSignOut,authReady,role}){
 return <div className="wrap">
  <div className="lp-nav">
   <div className="lp-brand">Way Finder<span className="wf-dot">.</span></div>
   <div className="lp-tag">A space to find your way back to each other</div>
  </div>
  <ProfileSettings user={user} profile={profile} onSignOut={onSignOut}/>

  {/* Hero — The Art of Connection */}
  <div className="card" style={{position:'relative',overflow:'hidden'}}>
   <svg className="squiggle" width="120" height="26" viewBox="0 0 120 26"><path d="M4 14 Q16 2 28 14 T52 14 T76 14 T100 14" fill="none" stroke="#E59BAA" strokeWidth="4" strokeLinecap="round"/></svg>
   <div className="lp-hero">
    <div>
     <div className="lp-eyebrow">Welcome</div>
     <div className="lp-h1">The Art of<br/>Connection</div>
     <p className="lp-lead">Guiding children with structure, while staying emotionally connected.</p>
    </div>
    <div className="lp-art">
     <svg className="lamp" width="46" height="40" viewBox="0 0 46 40"><line x1="23" y1="0" x2="23" y2="9" stroke="#5E7A68" strokeWidth="2"/><path d="M6 24 Q23 6 40 24 Z" fill="#5E9C76"/><rect x="17" y="24" width="12" height="7" rx="3" fill="#E8A23D"/></svg>
     <img src={IMG.hero} alt="A parent guiding their child, warmly, as they write together"/>
    </div>
   </div>
  </div>

  {/* Empathy + hope */}
  <div className="card">
   <div className="lp-section flip">
    <div className="lp-art"><img src={IMG.hope} alt="A parent and child playing joyfully together"/></div>
    <div>
     <div className="lp-h2">Parenting shouldn't feel like repeating yourself every day.</div>
     <p className="lp-body">When effort doesn't lead to understanding, even the most caring parents feel tired, confused and alone.</p>
     <p className="lp-soft">You're not failing — you're carrying a lot. This is a place to slow down, notice what's happening between you and your child, and find your way back to each other, gently.</p>
    </div>
   </div>
  </div>

  {/* A gentle way forward */}
  <div className="card">
   <div className="lp-section">
    <div>
     <div className="lp-h2">A gentle way to see together</div>
     <p className="lp-body">Way Finder isn't about doing more or trying harder. It's about noticing — your thoughts, your feelings, what you do — and learning, little by little, to meet your child from a place of calm rather than pressure. Your steadiness becomes their safety.</p>
    </div>
    <div className="lp-art"><img src={IMG.forward} alt="A parent and child looking at the world side by side"/></div>
   </div>
  </div>

  {/* Safe transition + CTA */}
  <div className="lp-safe">
   <p>Take a breath. There's nothing to prove here, and no score to chase. When you're ready, step in gently — at your own pace.</p>
   <div className="lp-cta"><button onClick={onEnter}>Enter Way Finder</button></div>
   <div className="lp-reassure">Your privacy is held — only a code is ever stored, never your name.</div>
  </div>
  <div className="lp-foot">Way Finder · a Shared Journeys space</div>
 </div>;
}

const parseInviteTokenFromUrl=()=>{
 if(typeof window==='undefined') return '';
 try{
  const url=new URL(window.location.href);
  const fromQuery=url.searchParams.get('invite');
  if(fromQuery&&String(fromQuery).trim()) return String(fromQuery).trim();
  const hash=url.hash&&url.hash.startsWith('#')?url.hash.slice(1):'';
  if(hash){
   const hashParams=new URLSearchParams(hash);
   const fromHash=hashParams.get('invite');
   if(fromHash&&String(fromHash).trim()) return String(fromHash).trim();
  }
 }catch(err){
  AuthDebug.log('[auth] invite parse failed:', { message: err?.message || String(err) });
 }
 return '';
};

const clearInviteFromUrl=()=>{
 if(typeof window==='undefined') return;
 try{
  const url=new URL(window.location.href);
  if(!url.searchParams.has('invite')) return;
  url.searchParams.delete('invite');
  window.history.replaceState({},'',`${url.pathname}${url.search}${url.hash}`);
 }catch(_){}
};

function AuthScreen({onAuth, role, message, messageEmail, inviteToken}){
 const [mode,setMode]=useState('signin');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const [resendStatus,setResendStatus]=useState('');
 const [resendLoading,setResendLoading]=useState(false);
 const [pdpaAcknowledged,setPdpaAcknowledged]=useState(false);
 const [pdpaNoticePrompt,setPdpaNoticePrompt]=useState('');
 const [forgotOpen,setForgotOpen]=useState(false);
 const [resetLoading,setResetLoading]=useState(false);
 const [resetStatus,setResetStatus]=useState('');
 const mhpMeta=typeof MENTAL_HEALTH_PROFESSIONAL_ONBOARDING!=='undefined'?MENTAL_HEALTH_PROFESSIONAL_ONBOARDING:{};
 const allowSignup=(role!=='counsellor'&&role!=='admin')||!!inviteToken;
 const activeMode=allowSignup?mode:'signin';
 const portalLabel=role==='admin'
  ? 'Wayfinder Owner Admin'
  : role==='counsellor'
  ? (inviteToken?(mhpMeta.onboardingPortalLabel||'Mental Health Professional Portal'):'Counsellor Portal')
  : 'A space to find your way back to each other';
 const pdpaNotice=typeof PDPA_SIGNUP_NOTICE!=='undefined'?PDPA_SIGNUP_NOTICE:{};
 const pdpaTitle=String(pdpaNotice.title||'Before you create your account').trim();
 const pdpaBody=String(pdpaNotice.body||'').trim();
 const pdpaCheckboxLabel=String(pdpaNotice.checkboxLabel||'I have read and understood this privacy and data-use notice.').trim();
 const pdpaUncheckedMessage=String(pdpaNotice.uncheckedMessage||'Please read the privacy and data-use notice and confirm you understand it before creating your account.').trim();
 const switchMode=(nextMode)=>{
  setMode(nextMode);
  setError('');
  setPdpaNoticePrompt('');
  if(nextMode==='signin')setPdpaAcknowledged(false);
 };
 const submit=async()=>{
  setError('');
  setPdpaNoticePrompt('');
  if(activeMode==='signup'&&!pdpaAcknowledged){
   setPdpaNoticePrompt(pdpaUncheckedMessage);
   return;
  }
  setLoading(true);
  try{
   const {data,error:err}=activeMode==='signin'?await Auth.signIn(email,password):await Auth.signUp(email,password);
   if(err)throw err;
   if(activeMode==='signup'&&!data.session){
    setError('Check your email for the current confirmation link, then sign in. Wayfinder verification will run after login.');
    setLoading(false);
    return;
   }
   // onAuthStateChange is the single source of truth for authenticated user
   // and profile setup. Updating user here can race ahead of getOrCreateProfile.
  }catch(e){setError(e.message||'Something went wrong.');}
  setLoading(false);
 };
 const resendVerification=async()=>{
  const target=(messageEmail||email||'').trim();
  setError('');
  setResendStatus('');
  if(!target){setError('Enter your email address, then try again.');return;}
  setResendLoading(true);
  try{
   const {error:err}=await Auth.resendVerification(target);
   if(err)throw err;
   setResendStatus('If this email exists, a verification link has been sent.');
  }catch(e){setError(e.message||'Could not send verification email. Please try again.');}
  setResendLoading(false);
 };
 const requestPasswordReset=async()=>{
  setError('');
  setResetStatus('');
  const target=email.trim();
  if(!target){setError('Enter your email address, then try again.');return;}
  setResetLoading(true);
  try{
   const {error:err}=await Auth.requestPasswordReset(target);
   if(err){
    AuthDebug.log('[auth] password reset request failed:', { message: err?.message || String(err) });
   }
   setResetStatus(mhpMeta.forgotPasswordSuccess||mhpMeta.forgotPasswordPrompt||'If an account exists, we will send a password reset link.');
  }catch(e){
   AuthDebug.log('[auth] password reset request exception:', { message: e?.message || String(e) });
   setResetStatus(mhpMeta.forgotPasswordSuccess||'If an account exists, we will send a password reset link.');
  }finally{
   setResetLoading(false);
  }
 };
 return <div className="wrap">
  <div className="card banner"><h1>Way Finder</h1><p style={{opacity:.85,fontSize:14,marginTop:4}}>{portalLabel}</p></div>
  {inviteToken ? <div className="card mhp-invite-card">
   <h2>{mhpMeta.inviteTitle||"You've been invited as a Mental Health Professional"}</h2>
   <p className="dashboard-helper">{mhpMeta.inviteSubtitle||'Sign in or create an account using the email address your invitation was sent to.'}</p>
   <p className="sub mhp-invite-note">{mhpMeta.inviteSignInNote||'Use the invited email address. Your invite link has been received — you do not need to enter it again.'}</p>
  </div> : null}
  <div className="card" style={{padding:0,overflow:'hidden'}}>
   <img src={role==='counsellor'?'login-hero.jpg':'parent-hero.jpg'} alt={role==='counsellor'?'Counselling team':'Parent and child'} style={{width:'100%',height:'auto',display:'block'}}/>
   <div style={{padding:24}}>
   {forgotOpen ? <>
    <h2>{mhpMeta.forgotPasswordTitle||'Reset your password'}</h2>
    <p className="sub auth-forgot-copy">{mhpMeta.forgotPasswordPrompt||'Enter the email you used for Wayfinder. If an account exists, we will send a password reset link.'}</p>
    <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e=>e.key==='Enter'&&requestPasswordReset()}/></div>
    {error&&<div style={{color:'#c0392b',fontSize:13,marginBottom:12,padding:'8px 12px',background:'#fdecea',borderRadius:6}}>{error}</div>}
    {resetStatus&&<div style={{color:'#4f7a5e',fontSize:13,marginBottom:12,padding:'8px 12px',background:'#edf7ef',borderRadius:6}}>{resetStatus}</div>}
    <button className="btn btn-primary btn-block" onClick={requestPasswordReset} disabled={resetLoading}>{resetLoading?'Please wait…':(mhpMeta.forgotPasswordSubmit||'Send reset link')}</button>
    <button type="button" className="btn btn-ghost btn-block auth-forgot-back" onClick={()=>{setForgotOpen(false);setResetStatus('');setError('');}}>{mhpMeta.forgotPasswordBack||'Back to sign in'}</button>
   </> : <>
   <h2>{activeMode==='signin'?'Sign in':'Create account'}</h2>
   <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
   <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="8+ characters" onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
   {activeMode==='signin' && <p className="auth-forgot-wrap"><button type="button" className="auth-forgot-link" onClick={()=>{setForgotOpen(true);setError('');setResetStatus('');}}>{mhpMeta.forgotPasswordLink||'Forgot password?'}</button></p>}
   {message&&<div style={{color:'#8a5a00',fontSize:13,marginBottom:12,padding:'8px 12px',background:'#fff4d6',borderRadius:6}}>
    <div>{message}</div>
    <button className="btn btn-secondary" style={{marginTop:10,width:'100%'}} onClick={resendVerification} disabled={resendLoading}>{resendLoading?'Sending...':'Resend verification email'}</button>
    {resendStatus&&<div style={{marginTop:8,color:'#4f7a5e'}}>{resendStatus}</div>}
   </div>}
   {error&&<div style={{color:'#c0392b',fontSize:13,marginBottom:12,padding:'8px 12px',background:'#fdecea',borderRadius:6}}>{error}</div>}
   {activeMode==='signup'&&pdpaBody ? <div className="pdpa-notice-block" role="region" aria-label={pdpaTitle}>
    <h3 className="pdpa-notice-title">{pdpaTitle}</h3>
    <p className="pdpa-notice-body">{pdpaBody}</p>
    <label className="pdpa-notice-check">
     <input
      type="checkbox"
      checked={pdpaAcknowledged}
      onChange={(event)=>{setPdpaAcknowledged(event.target.checked);if(event.target.checked)setPdpaNoticePrompt('');}}
     />
     <span>{pdpaCheckboxLabel}</span>
    </label>
    {pdpaNoticePrompt ? <p className="pdpa-notice-prompt" role="status">{pdpaNoticePrompt}</p> : null}
   </div> : null}
   <button className="btn btn-primary btn-block" onClick={submit} disabled={loading||(activeMode==='signup'&&!pdpaAcknowledged)}>{loading?'Please wait…':activeMode==='signin'?'Sign in':'Create account'}</button>
   {allowSignup ? <p style={{textAlign:'center',marginTop:16,fontSize:13,color:'#666'}}>
    {activeMode==='signin'?<span>No account? <span style={{color:'var(--sage)',cursor:'pointer',fontWeight:600}} onClick={()=>switchMode('signup')}>Sign up</span></span>:<span>Have an account? <span style={{color:'var(--sage)',cursor:'pointer',fontWeight:600}} onClick={()=>switchMode('signin')}>Sign in</span></span>}
   </p> : role==='admin' ? <p className="sub" style={{textAlign:'center',marginTop:16,fontSize:13}}>Owner admin sign-in only. No public signup.</p> : <p className="sub" style={{textAlign:'center',marginTop:16,fontSize:13}}>{inviteToken?'Create an account with your invited email, or sign in if you already have one.':'Counsellor accounts are provisioned by the Wayfinder administrator.'}</p>}
   </>}
   </div>
  </div>
 </div>;
}

function VerificationRequiredScreen({authSession, role, onRefreshSession, onSignOut}){
 const [status,setStatus]=useState('Check your inbox for your Wayfinder verification link.');
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const [refreshing,setRefreshing]=useState(false);

 const send=async()=>{
  if(!authSession?.user?.email){
   setError('Your email address is unavailable. Please sign in again, then request a new verification email.');
   return;
  }
  setLoading(true);
  setError('');
  setStatus('');
  try{
   const {error:err}=await Auth.resendVerification(authSession);
   if(err)throw err;
   setStatus('If this account exists, a verification link has been sent. Please check your inbox.');
  }catch(e){
   setError(e.message||'We could not send the verification email. Please try again later.');
  }finally{
   setLoading(false);
  }
 };

 const refresh=async()=>{
  setRefreshing(true);
  setError('');
  setStatus('Checking your latest email confirmation status...');
  try{
   const verified=await onRefreshSession();
   if(!verified){
    setStatus('We still cannot see a confirmed email for this session. If you just clicked the link, wait a moment and try again.');
   }
  }catch(e){
   setError(e.message||'We could not refresh your confirmation status. Please sign in again.');
  }finally{
   setRefreshing(false);
  }
 };

 return <div className="wrap">
  <div className="card banner"><h1>Verify your Wayfinder account</h1><p style={{opacity:.85,fontSize:14,marginTop:4}}>{role==='counsellor'?'Counsellor Portal':'A space to find your way back to each other'}</p></div>
  <div className="card" style={{textAlign:'center',padding:32}}>
   <h2 style={{marginBottom:10}}>Email verification required</h2>
   <p className="sub" style={{lineHeight:1.6}}>Please use the verification link sent to your inbox before opening your Wayfinder workspace. This keeps parent and counsellor records protected.</p>
   {status&&<div style={{color:'#4f7a5e',fontSize:13,marginTop:16,padding:'10px 12px',background:'#edf7ef',borderRadius:6}}>{status}</div>}
   {error&&<div style={{color:'#8a5a00',fontSize:13,marginTop:16,padding:'10px 12px',background:'#fff4d6',borderRadius:6}}>{error}</div>}
   <div style={{marginTop:22,display:'flex',flexDirection:'column',gap:10}}>
    <button className="btn btn-primary" onClick={send} disabled={loading||refreshing}>{loading?'Sending...':'Resend verification email'}</button>
    <button className="btn btn-secondary" onClick={refresh} disabled={loading||refreshing}>{refreshing?'Checking...':'I have verified - refresh'}</button>
    <button className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
   </div>
   <p className="hint" style={{marginTop:18}}>Need help? Contact ask.anything@psytec.com.sg.</p>
  </div>
 </div>;
}

function PasswordRecoveryScreen({status, role, onSubmit, onSignOut}){
 const [password,setPassword]=useState('');
 const [confirmPassword,setConfirmPassword]=useState('');
 const [error,setError]=useState(status?.error||'');
 const [loading,setLoading]=useState(false);
 const completedRole=status?.completedRole||'';
 const hasSession=!!status?.session?.access_token;

 const submit=async()=>{
  setError('');
  const nextPassword=password.trim();
  if(!nextPassword){setError('Enter a new password.');return;}
  if(nextPassword.length<8){setError('Use at least 8 characters.');return;}
  if(nextPassword!==confirmPassword){setError('Passwords do not match.');return;}
  setLoading(true);
  try{
   await onSubmit(nextPassword);
  }catch(e){
   setError(e.message||'We could not update your password. Please request a new reset link and try again.');
  }finally{
   setLoading(false);
  }
 };

 if(status?.completed&&completedRole==='counsellor'&&role!=='counsellor'){
  return <div className="wrap">
   <div className="card banner"><h1>Password updated</h1><p style={{opacity:.85,fontSize:14,marginTop:4}}>Wayfinder by PsyTec</p></div>
   <div className="card" style={{textAlign:'center',padding:32}}>
    <h2 style={{marginBottom:10}}>Continue to the counsellor portal</h2>
    <p className="sub" style={{lineHeight:1.6}}>Your password has been updated. This account is registered for the counsellor portal.</p>
    <div style={{marginTop:22,display:'flex',flexDirection:'column',gap:10}}>
     <a className="btn btn-primary" href="counsellor.html" style={{textDecoration:'none'}}>Go to counsellor portal</a>
     <button className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
    </div>
   </div>
  </div>;
 }

 if(status?.pending){
  return <div className="wrap">
   <div className="card banner"><h1>Preparing password reset</h1><p style={{opacity:.85,fontSize:14,marginTop:4}}>Wayfinder by PsyTec</p></div>
   <div className="card" style={{textAlign:'center',padding:32}}>
    <h2 style={{marginBottom:10}}>Checking your reset link...</h2>
    <p className="sub" style={{lineHeight:1.6}}>Please wait while Wayfinder prepares your password reset session.</p>
   </div>
  </div>;
 }

 if(!hasSession){
  return <div className="wrap">
   <div className="card banner"><h1>Reset link expired</h1><p style={{opacity:.85,fontSize:14,marginTop:4}}>Wayfinder by PsyTec</p></div>
   <div className="card" style={{textAlign:'center',padding:32}}>
    <h2 style={{marginBottom:10}}>Request a new reset link</h2>
    <p className="sub" style={{lineHeight:1.6}}>This password reset link is missing or has expired. Please return to sign in and request a new reset email.</p>
    <button className="btn btn-primary" style={{marginTop:22}} onClick={onSignOut}>Return to sign in</button>
   </div>
  </div>;
 }

 return <div className="wrap">
  <div className="card banner"><h1>Set a new password</h1><p style={{opacity:.85,fontSize:14,marginTop:4}}>Wayfinder by PsyTec</p></div>
  <div className="card" style={{padding:24}}>
   <h2>Set New Password</h2>
   <p className="sub" style={{lineHeight:1.6,marginBottom:16}}>Choose a new password before continuing to your Wayfinder workspace.</p>
   <div className="field"><label>New password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
   <div className="field"><label>Confirm new password</label><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter password" onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
   {error&&<div style={{color:'#8a5a00',fontSize:13,marginBottom:12,padding:'10px 12px',background:'#fff4d6',borderRadius:6}}>{error}</div>}
   <button className="btn btn-primary btn-block" onClick={submit} disabled={loading}>{loading?'Updating...':'Update password'}</button>
   <button className="btn btn-ghost btn-block" style={{marginTop:10}} onClick={onSignOut} disabled={loading}>Cancel</button>
  </div>
 </div>;
}

const isSafeHttpsPhotoUrl=(value)=>{
 try{
  const url=new URL(String(value||'').trim());
  return url.protocol==='https:';
 }catch(_){
  return false;
 }
};

const formatOwnerAdminTimestamp=(value)=>{
 const dt=parseStoredDate(value);
 if(!dt||isNaN(dt)) return '-';
 return dt.toLocaleString('en-SG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
};

const ownerMhpMatchesFilter=(row,filter)=>{
 const status=String(row?.profileStatus||'').toLowerCase();
 if(filter==='pending_draft') return status==='draft'||status==='pending_review';
 if(filter==='published') return status==='published';
 if(filter==='hidden_suspended') return status==='hidden'||status==='suspended';
 return true;
};

const OWNER_MHP_FILTERS=[
 {id:'pending_draft',label:'Pending / Draft'},
 {id:'published',label:'Published'},
 {id:'hidden_suspended',label:'Hidden / Suspended'},
 {id:'all',label:'All'}
];

function OwnerAdminMhpCard({row,actionState,onAction}){
 const busy=actionState?.busy;
 const cardError=actionState?.error||'';
 const cardSuccess=actionState?.success||'';
 const bioPreview=String(row.shortBio||'').trim();
 const bioShort=bioPreview.length>160?`${bioPreview.slice(0,157)}…`:bioPreview;
 return <article className="card owner-admin-mhp-card">
  <div className="owner-admin-mhp-card-head">
   <div>
    <p className="pill owner-admin-mhp-pill">{row.wayfinderId||'MHP profile'}</p>
    <h3>{row.fullName||'Name not saved yet'}</h3>
    {row.professionalTitle ? <p className="owner-admin-mhp-subtitle">{row.professionalTitle}</p> : null}
   </div>
   {isSafeHttpsPhotoUrl(row.photoUrl) ? <img className="owner-admin-photo-preview" src={row.photoUrl} alt="" loading="lazy"/> : null}
  </div>
  <dl className="owner-admin-mhp-meta">
   <div><dt>Licence / registration</dt><dd>{row.licenseRegistrationNumber||'-'}</dd></div>
   <div><dt>Accreditation number</dt><dd>{row.accreditationNumber||'-'}</dd></div>
   <div><dt>Issuing body</dt><dd>{row.issuingBody||'-'}</dd></div>
   <div><dt>Institution</dt><dd>{row.institutionName||'-'}</dd></div>
   <div><dt>Profile status</dt><dd>{row.profileStatus||'-'}</dd></div>
   <div><dt>Membership status</dt><dd>{row.membershipStatus||'-'}</dd></div>
   <div><dt>Profile visible</dt><dd>{row.profileVisible?'Yes':'No'}</dd></div>
   <div><dt>Licence document</dt><dd>{row.latestDocumentStatus||'-'} {row.latestOriginalFilename?`· ${row.latestOriginalFilename}`:''}</dd></div>
   <div><dt>Extraction</dt><dd>{row.latestExtractionStatus||'-'} {row.latestExtractedAt?`· ${formatOwnerAdminTimestamp(row.latestExtractedAt)}`:''}</dd></div>
   <div><dt>Enquiry email</dt><dd>{row.enquiryEmail||'-'}</dd></div>
   <div><dt>Enquiry mobile</dt><dd>{row.enquiryMobile||'-'}</dd></div>
  </dl>
  {bioShort ? <p className="owner-admin-bio-preview"><span className="owner-admin-bio-label">Short bio</span> {bioShort}</p> : null}
  {cardError ? <p className="review-share-error" role="alert">{cardError}</p> : null}
  {cardSuccess ? <p className="review-share-status" role="status">{cardSuccess}</p> : null}
  <div className="owner-admin-mhp-actions">
   <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={()=>onAction(row,'publish')}>Publish + activate</button>
   <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={()=>onAction(row,'pending')}>Keep pending review</button>
   <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={()=>onAction(row,'hide')}>Unpublish / hide</button>
   <button type="button" className="btn btn-ghost btn-sm owner-admin-action-danger" disabled={busy} onClick={()=>onAction(row,'suspend')}>Suspend</button>
  </div>
 </article>;
}

function OwnerAdminApp({user,authSession,onSignOut}){
 const [adminGate,setAdminGate]=useState({loading:true,isAdmin:false,unavailable:false});
 const [profiles,setProfiles]=useState([]);
 const [queueLoading,setQueueLoading]=useState(false);
 const [filter,setFilter]=useState('pending_draft');
 const [banner,setBanner]=useState({type:'',message:''});
 const [actionState,setActionState]=useState({});

 const loadQueue=async()=>{
  if(!user?.id||!authSession?.access_token) return;
  setQueueLoading(true);
  setBanner({type:'',message:''});
  try{
   const result=await DB.listOwnerMhpProfiles(user.id,authSession);
   if(result.unavailable){
    setProfiles([]);
    setBanner({type:'error',message:'MHP review storage is not available yet. Apply the owner admin SQL contract in Supabase.'});
    return;
   }
   if(!result.ok){
    setProfiles([]);
    setBanner({type:'error',message:'We could not load the Mental Health Professional review queue right now.'});
    return;
   }
   setProfiles(result.rows||[]);
  }catch(err){
   AuthDebug.log('[owner admin] queue load failed:', { message: err?.message || String(err) });
   setProfiles([]);
   setBanner({type:'error',message:'We could not load the Mental Health Professional review queue right now.'});
  }finally{
   setQueueLoading(false);
  }
 };

 useEffect(()=>{
  let cancelled=false;
  const checkAdmin=async()=>{
   if(!user?.id||!authSession?.access_token){
    if(!cancelled) setAdminGate({loading:false,isAdmin:false,unavailable:false});
    return;
   }
   setAdminGate({loading:true,isAdmin:false,unavailable:false});
   try{
    const result=await DB.isOwnerAdmin(user.id,authSession);
    if(cancelled) return;
    if(result.unavailable){
     setAdminGate({loading:false,isAdmin:false,unavailable:true});
     return;
    }
    setAdminGate({loading:false,isAdmin:!!result.isAdmin,unavailable:false});
   }catch(err){
    AuthDebug.log('[owner admin] admin check failed:', { message: err?.message || String(err) });
    if(!cancelled) setAdminGate({loading:false,isAdmin:false,unavailable:false});
   }
  };
  checkAdmin();
  return ()=>{cancelled=true;};
 },[user?.id,authSession?.access_token]);

 useEffect(()=>{
  if(!adminGate.isAdmin) return;
  loadQueue();
 },[user?.id,authSession?.access_token,adminGate.isAdmin]);

 const filteredProfiles=profiles.filter(row=>ownerMhpMatchesFilter(row,filter));

 const runPublicationAction=async(row,actionKey)=>{
  const mhpUserId=row?.mhpUserId;
  if(!mhpUserId||!user?.id) return;
  const actionMap={
   publish:{profileStatus:'published',profileVisible:true,membershipStatus:'active',confirm:'Publish and activate this Mental Health Professional for parent selection?'},
   pending:{profileStatus:'pending_review',profileVisible:false,membershipStatus:'pending_review',confirm:null},
   hide:{profileStatus:'hidden',profileVisible:false,membershipStatus:'pending_review',confirm:null},
   suspend:{profileStatus:'suspended',profileVisible:false,membershipStatus:'suspended',confirm:'Suspend this Mental Health Professional? They will be removed from parent selection.'}
  };
  const action=actionMap[actionKey];
  if(!action) return;
  if(action.confirm&&!window.confirm(action.confirm)) return;

  setActionState(prev=>({...prev,[mhpUserId]:{busy:true,error:'',success:''}}));
  setBanner({type:'',message:''});
  try{
   const result=await DB.ownerSetMhpPublication(
    user.id,
    mhpUserId,
    action.profileStatus,
    action.profileVisible,
    action.membershipStatus,
    authSession
   );
   if(result.unavailable){
    setActionState(prev=>({...prev,[mhpUserId]:{busy:false,error:'Publication controls are not available yet. Apply the owner admin SQL contract in Supabase.',success:''}}));
    return;
   }
   if(!result.ok){
    setActionState(prev=>({...prev,[mhpUserId]:{busy:false,error:'This publication change could not be saved right now.',success:''}}));
    return;
   }
   const successLabels={
    publish:'Published and activated.',
    pending:'Set to pending review.',
    hide:'Unpublished and hidden.',
    suspend:'Suspended.'
   };
   setActionState(prev=>({...prev,[mhpUserId]:{busy:false,error:'',success:successLabels[actionKey]||'Saved.'}}));
   await loadQueue();
  }catch(err){
   AuthDebug.log('[owner admin] publication action failed:', { message: err?.message || String(err) });
   setActionState(prev=>({...prev,[mhpUserId]:{busy:false,error:'This publication change could not be saved right now.',success:''}}));
  }
 };

 if(adminGate.loading){
  return <div className="wrap owner-admin-wrap"><div className="card" style={{textAlign:'center',padding:40,color:'#666'}}>Checking owner admin access…</div></div>;
 }

 if(adminGate.unavailable){
  return <div className="wrap owner-admin-wrap"><div className="card owner-admin-access-card">
   <h2>Owner admin unavailable</h2>
   <p className="dashboard-helper">The owner admin contract is not available yet. Apply the owner publication SQL in Supabase, then reload this page.</p>
   <button type="button" className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
  </div></div>;
 }

 if(!adminGate.isAdmin){
  return <div className="wrap owner-admin-wrap"><div className="card owner-admin-access-card">
   <h2>Owner admin access required.</h2>
   <p className="dashboard-helper">This page is for Wayfinder owner administrators only. Mental Health Professional profiles are not shown here unless your account is listed in owner admin settings.</p>
   <button type="button" className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
  </div></div>;
 }

 return <div className="wrap owner-admin-wrap">
  <div className="card banner owner-admin-hero">
   <div className="owner-admin-hero-copy">
    <p className="dashboard-kicker">Wayfinder Owner Admin</p>
    <h1>Mental Health Professional review queue</h1>
    <p className="dashboard-helper">Review draft and pending profiles, then publish or suspend only through owner-controlled publication. MHP draft completion is not publication.</p>
   </div>
   <div className="owner-admin-hero-actions">
    <button type="button" className="switch switch-muted" onClick={loadQueue} disabled={queueLoading}>{queueLoading?'Refreshing…':'Refresh queue'}</button>
    <button type="button" className="switch switch-muted" onClick={onSignOut}>Sign out</button>
   </div>
  </div>

  {banner.message ? <div className={`card review-share-notice owner-admin-banner${banner.type==='error'?' review-share-notice--legacy':''}`} role={banner.type==='error'?'alert':'status'}>{banner.message}</div> : null}

  <div className="owner-admin-filters" role="tablist" aria-label="MHP review filters">
   {OWNER_MHP_FILTERS.map(item=><button
    key={item.id}
    type="button"
    role="tab"
    aria-selected={filter===item.id}
    className={`owner-admin-filter${filter===item.id?' is-active':''}`}
    onClick={()=>setFilter(item.id)}
   >{item.label}</button>)}
  </div>

  {queueLoading && !profiles.length ? <div className="card owner-admin-empty">Loading Mental Health Professional profiles…</div> : null}

  {!queueLoading && !filteredProfiles.length ? <div className="card owner-admin-empty">
   <h2>No profiles in this view</h2>
   <p className="dashboard-helper">Try another filter, or refresh after an MHP completes their profile draft.</p>
  </div> : null}

  <div className="owner-admin-queue">
   {filteredProfiles.map(row=>{
    const key=row.mhpUserId||row.wayfinderId||row.fullName;
    return <OwnerAdminMhpCard
     key={key}
     row={row}
     actionState={actionState[row.mhpUserId]||{}}
     onAction={runPublicationAction}
    />;
   })}
  </div>
 </div>;
}

function App(){
 const [entered,setEntered]=useState(false);
 const [user,setUser]=useState(null);
 const [authReady,setAuthReady]=useState(false);
 const [profile,setProfile]=useState(null);
 const [authSession,setAuthSession]=useState(null);
 const [emailVerified,setEmailVerified]=useState(false);
 const [passwordRecovery,setPasswordRecovery]=useState({active:false,session:null,error:'',completed:false,completedRole:'',pending:false});
 const [profileError,setProfileError]=useState('');
 const [accessDenied,setAccessDenied]=useState('');
 const [authMessage,setAuthMessage]=useState('');
 const [authMessageEmail,setAuthMessageEmail]=useState('');
 const [pendingInviteToken,setPendingInviteToken]=useState('');
 const profileLoadRef = useRef({ userId: null, promise: null });
 const passwordRecoveryRef = useRef(false);
 const pendingInviteTokenRef = useRef('');
 const APP_ROLE = typeof PORTAL_ROLE !== 'undefined' ? PORTAL_ROLE : 'parent';
 const mhpMeta=typeof MENTAL_HEALTH_PROFESSIONAL_ONBOARDING!=='undefined'?MENTAL_HEALTH_PROFESSIONAL_ONBOARDING:{};

 useEffect(()=>{
  const token=parseInviteTokenFromUrl();
  if(token){
   pendingInviteTokenRef.current=token;
   setPendingInviteToken(token);
   clearInviteFromUrl();
  }
 },[]);

 const startPasswordRecovery=async(rawSession,source='auth-state')=>{
  let session=rawSession||null;
  if(session?.access_token){
   Auth.setActiveSession(session);
   const fresh=await Auth.getFreshSession();
   if(fresh.error)throw fresh.error;
   if(fresh.data?.session?.user?.id===session.user?.id){
    session=fresh.data.session;
   }
  }

  const hasSession=!!session;
  const hasAccessToken=!!session?.access_token;
  const sessionUserId=session?.user?.id||null;
  passwordRecoveryRef.current=true;
  Auth.clearAuthHashFromUrl();

  AuthDebug.log('[auth] PASSWORD_RECOVERY detected:', {
   source,
   sessionExists: hasSession,
   accessTokenExists: hasAccessToken,
   sessionUserId
  });

  setAuthMessage('');
  setAuthMessageEmail('');
  setAccessDenied('');
  setProfile(null);
  setProfileError('');
  setAuthSession(session);
  setUser(session?.user||null);
  setEmailVerified(Auth.isEmailConfirmed(session?.user));
  profileLoadRef.current={userId:null,promise:null};
  setPasswordRecovery({
   active:true,
   session,
   error: hasAccessToken?'':'This reset link is missing or has expired. Please request a new reset email.',
   completed:false,
   completedRole:'',
   pending:false
  });
  setAuthReady(true);
  return hasAccessToken;
 };

 const completePasswordRecovery=async(newPassword)=>{
  const recoverySession=passwordRecovery.session||authSession;
  if(!recoverySession?.access_token){
   throw new Error('This reset session is missing or expired. Please request a new reset link.');
  }

  Auth.setActiveSession(recoverySession);
  const {error:updateError}=await Auth.updatePassword(newPassword);
  if(updateError)throw updateError;
  Auth.clearAuthHashFromUrl();

  const fresh=await Auth.getFreshSession();
  if(fresh.error)throw fresh.error;
  const session=fresh.data?.session||recoverySession;
  if(!session?.access_token||!session?.user){
   throw new Error('Your password was updated, but the session could not be refreshed. Please sign in again.');
  }

  setAuthSession(session);
  setUser(session.user);
  setEmailVerified(Auth.isEmailConfirmed(session.user));
  profileLoadRef.current={userId:null,promise:null};

  const existingProfile=await Profile.getExisting(session.user.id,session).catch(error=>{
   AuthDebug.log('[profile] recovery role lookup failed:', { message:error?.message||String(error) });
   return null;
  });

  if(existingProfile?.role==='counsellor'&&APP_ROLE!=='counsellor'){
   passwordRecoveryRef.current=true;
   setProfile(existingProfile);
   setPasswordRecovery({
    active:true,
    session,
    error:'',
    completed:true,
    completedRole:'counsellor',
    pending:false
   });
   setAuthReady(true);
   return true;
  }

  passwordRecoveryRef.current=false;
  setPasswordRecovery({active:false,session:null,error:'',completed:false,completedRole:'',pending:false});
  return handleAuthSession('USER_UPDATED',session,'password-recovery-complete');
 };

 const handleAuthSession=async(event,rawSession,source='auth-state')=>{
  let session=rawSession||null;
  const profileEvents=['SIGNED_IN','INITIAL_SESSION','TOKEN_REFRESHED','USER_UPDATED','URL_HASH_SESSION','MANUAL_SESSION_REFRESH'];

  if(session?.access_token){
   Auth.setActiveSession(session);
   const fresh=await Auth.getFreshSession();
   if(fresh.error)throw fresh.error;
   if(fresh.data?.session?.user?.id===session.user?.id){
    session=fresh.data.session;
   }
  }

  const hasSession=!!session;
  const hasAccessToken=!!session?.access_token;
  const sessionUserId=session?.user?.id||null;
  const confirmed=Auth.isEmailConfirmed(session?.user);

  AuthDebug.log('[auth] session check:', {
   event,
   source,
   sessionExists: hasSession,
   accessTokenExists: hasAccessToken,
   sessionUserId,
   emailConfirmedFieldsPresent: confirmed
  });

  if(profileEvents.includes(event)&&session?.user&&hasAccessToken){
   setAuthMessage('');
   setAuthMessageEmail('');
   setAccessDenied('');
   setAuthSession(session);
   Auth.setActiveSession(session);
   setUser(session.user);
   setEmailVerified(confirmed);

   if(!confirmed){
    setProfile(null);
    setProfileError('');
    profileLoadRef.current={userId:null,promise:null};
    setEntered(false);
    setAuthReady(true);
    return false;
   }

   localStorage.removeItem('sj_v2_dyads');
   localStorage.removeItem('sj_v2_entries');
   localStorage.removeItem('sj_v2_reviews');
   try{
    let profilePromise=profileLoadRef.current.promise;

    if(profileLoadRef.current.userId!==session.user.id||!profilePromise){
     const counsellorUsesExisting=APP_ROLE==='counsellor'&&!pendingInviteTokenRef.current;
     const adminUsesExisting=APP_ROLE==='admin';
     profilePromise=adminUsesExisting||counsellorUsesExisting
      ? Profile.getExisting(session.user.id,session)
      : Profile.getOrCreate(session.user.id,APP_ROLE,session);
     profileLoadRef.current={userId:session.user.id,promise:profilePromise};
    }

    const p=await profilePromise;
    if(APP_ROLE==='counsellor'&&(!p||p.role!=='counsellor')){
     throw new Error('Counsellor role required');
    }
    setProfile(p);
    setProfileError('');
    setAccessDenied('');
    setEntered(true);
    setAuthReady(true);
    return true;
   }catch(e){
    profileLoadRef.current={userId:null,promise:null};
    const message=e?.message||'';
    if(APP_ROLE==='counsellor'){
     AuthDebug.log('[profile] counsellor access confirmation failed:', { event, sessionUserId, message });
     setProfile(null);
     setProfileError('');
     setAccessDenied('Access denied: counsellor role required.');
     setEntered(false);
    }else if(message.includes('Auth session not ready')||message.includes('No authenticated Supabase session')){
     AuthDebug.log('[profile] waiting for auth session:', { event, sessionUserId, message });
    }else{
     console.error('Profile load failed:', e);
     setProfileError('We could not load your Wayfinder profile. Please refresh and try signing in again.');
    }
    setAuthReady(true);
    return false;
   }
  }

  if(session?.user){
   AuthDebug.log('[profile] waiting for auth session:', {
    event,
    source,
    sessionExists: hasSession,
    accessTokenExists: hasAccessToken,
    sessionUserId,
    emailConfirmedFieldsPresent: confirmed
   });
   setAuthSession(session);
   setUser(session.user);
   setEmailVerified(confirmed);
   setAuthReady(true);
   return false;
  }

  setAuthSession(null);
  Auth.setActiveSession(null);
  setUser(null);
  setEmailVerified(false);
  setProfile(null);
  setProfileError('');
  setAccessDenied('');
  profileLoadRef.current={userId:null,promise:null};
  setEntered(false);
  setAuthReady(true);
  return false;
 };

 useEffect(()=>{
  if(Auth.getAuthHashType()==='recovery'){
   passwordRecoveryRef.current=true;
   setPasswordRecovery({active:true,session:null,error:'',completed:false,completedRole:'',pending:true});
  }

  const {data:{subscription}}=Auth.onAuthChange(async (event,session)=>{
   try{
    if(event==='PASSWORD_RECOVERY'){
     await startPasswordRecovery(session,'auth-state');
     return;
    }
    if(passwordRecoveryRef.current){
     AuthDebug.log('[auth] password recovery active; normal routing paused:', {
      event,
      sessionExists: !!session,
      accessTokenExists: !!session?.access_token,
      sessionUserId: session?.user?.id||null
     });
     if(session?.user){
      setAuthSession(session);
      setUser(session.user);
     }
     setAuthReady(true);
     return;
    }
    await handleAuthSession(event,session,'auth-state');
   }catch(e){
    console.error('Auth session handling failed:', e);
    setProfileError('We could not refresh your sign-in session. Please sign in again.');
    setAuthReady(true);
   }
  });

  Auth.consumeAuthRedirect().then(result=>{
   if(result.error){
    AuthDebug.log('[auth] callback/hash processing failed:', { message: result.error.message || String(result.error) });
   }
   if(result.hashType==='recovery'){
    return startPasswordRecovery(result.session,'url-hash');
   }
   if(passwordRecoveryRef.current){
    return null;
   }
   if(result.hashDetected||result.session){
    return handleAuthSession(result.hashDetected?'URL_HASH_SESSION':'INITIAL_SESSION',result.session,result.hashDetected?'url-hash':'startup');
   }
   return null;
  }).catch(e=>{
   console.error('Auth redirect handling failed:', e);
   setProfileError('We could not process your email confirmation. Please sign in again.');
   setAuthReady(true);
  });

  return ()=>subscription.unsubscribe();
 },[]);

 const refreshAuthSession=async()=>{
  const {data,error}=await Auth.getFreshSession();
  if(error)throw error;
  return handleAuthSession('MANUAL_SESSION_REFRESH',data?.session||null,'manual-refresh');
 };

 const signOut=()=>{
  passwordRecoveryRef.current=false;
  setPasswordRecovery({active:false,session:null,error:'',completed:false,completedRole:'',pending:false});
  setAuthMessage('');
  setAuthMessageEmail('');
  setAccessDenied('');
  setAuthSession(null);
  setEmailVerified(false);
  Auth.setActiveSession(null);
  Auth.signOut();
 };

 // Auto sign-out after 60 minutes of inactivity
 useEffect(()=>{
  if(!user) return;
  const TIMEOUT=60*60*1000; // 60 minutes
  let timer=setTimeout(signOut,TIMEOUT);
  const reset=()=>{clearTimeout(timer);timer=setTimeout(signOut,TIMEOUT);};
  const events=['mousemove','keydown','click','touchstart','scroll'];
  events.forEach(e=>window.addEventListener(e,reset,{passive:true}));
  return()=>{clearTimeout(timer);events.forEach(e=>window.removeEventListener(e,reset));};
 },[user]);

 AuthDebug.log('[render] App branch state:', {
  authReady,
  userExists: !!user,
  profileExists: !!profile,
  entered,
  emailVerified,
  passwordRecoveryActive: !!passwordRecovery.active,
  profileError: !!profileError
 });

 if(!authReady){AuthDebug.log('[render] branch: auth loading');return <div className="wrap"><div className="card" style={{textAlign:'center',padding:40,color:'#666'}}>Loading…</div></div>;}
  if(passwordRecovery.active){AuthDebug.log('[render] branch: password recovery');return <PasswordRecoveryScreen status={passwordRecovery} role={APP_ROLE} onSubmit={completePasswordRecovery} onSignOut={signOut}/>;}
  if(!user){AuthDebug.log('[render] branch: auth screen');return <AuthScreen onAuth={setUser} role={APP_ROLE} message={authMessage} messageEmail={authMessageEmail} inviteToken={pendingInviteToken||null}/>;}
  if(!emailVerified){AuthDebug.log('[render] branch: verification required');return <VerificationRequiredScreen authSession={authSession} role={APP_ROLE} onRefreshSession={refreshAuthSession} onSignOut={signOut}/>;}
  if(accessDenied){AuthDebug.log('[render] branch: access denied');return <div className="wrap"><div className="card" style={{textAlign:'center',padding:32}}>
   <h2 style={{marginBottom:12}}>{accessDenied}</h2>
   <p className="sub">This portal is limited to verified counsellor accounts.</p>
   <button className="btn btn-ghost" style={{marginTop:20}} onClick={signOut}>Sign out</button>
  </div></div>;}
  if(profileError){AuthDebug.log('[render] branch: profile error');return <div className="wrap"><div className="card" style={{textAlign:'center',padding:40}}>
  <h2 style={{marginBottom:10}}>Profile loading issue</h2>
  <p className="sub">{profileError}</p>
  <button className="btn btn-primary" style={{marginTop:18}} onClick={()=>location.reload()}>Refresh</button>
 </div></div>;}
 if(!profile&&APP_ROLE!=='admin'){AuthDebug.log('[render] branch: profile loading');return <div className="wrap"><div className="card" style={{textAlign:'center',padding:40,color:'#666'}}>Loading your Wayfinder profile…</div></div>;}

  // Wrong portal check
  if(APP_ROLE!=='admin'&&profile.role !== APP_ROLE){AuthDebug.log('[render] branch: wrong portal');return <div className="wrap"><div className="card" style={{textAlign:'center',padding:32}}>
   <h2 style={{marginBottom:12}}>{APP_ROLE==='counsellor'?'Access denied: counsellor role required':'Wrong portal'}</h2>
   <p className="sub">Your account is registered as a <b>{profile.role}</b>.</p>
  <p className="sub" style={{marginTop:8}}>{profile.role==='parent'?'Please go to the main app to sign in.':'Please go to the counsellor portal to sign in.'}</p>
  <button className="btn btn-ghost" style={{marginTop:20}} onClick={signOut}>Sign out</button>
 </div></div>;}

 if(APP_ROLE==='admin'){AuthDebug.log('[render] branch: owner admin app');return <OwnerAdminApp user={user} authSession={authSession} onSignOut={signOut}/>;}
 if(APP_ROLE==='counsellor'){AuthDebug.log('[render] branch: counsellor app');return <CounsellorApp back={()=>setEntered(false)} user={user} profile={profile} authSession={authSession} onSignOut={signOut}/>;}
 AuthDebug.log('[render] branch: client dashboard');
 return <ClientApp back={()=>setEntered(false)} user={user} parentId={profile.parent_id} profile={profile} authReady={authReady} authSession={authSession} onSignOut={signOut}/>;
}

function RoleGate({onPick,back,onSignOut,parentId}){
 return <div className="wrap">
  <div className="card banner" style={{position:'relative'}}><h1>Way Finder</h1><p style={{opacity:.85,fontSize:14,marginTop:4}}>Guiding children with structure, while staying emotionally connected.</p>
   {parentId&&<p style={{opacity:.7,fontSize:12,marginTop:4}}>Your ID: <b>{parentId}</b></p>}
   <div style={{position:'absolute',top:18,right:18,display:'flex',gap:8}}>
    {back && <button className="switch" onClick={back}>← Home</button>}
    {onSignOut && <button className="switch" onClick={onSignOut} style={{background:'rgba(0,0,0,.08)'}}>Sign out</button>}
   </div>
  </div>
  <div className="card">
   <div className="illus-band"><img src={IMG.signin} alt="A parent and child together at home" style={{display:'block',width:'100%',height:'auto'}}/></div>
   <h2>Who is signing in?</h2>
   <p className="sub" style={{marginBottom:18}}>Two perspectives on the same journey. (Prototype — both run on this device; real sync comes later.)</p>
   <div className="role-gate">
    <div className="role-opt" onClick={()=>onPick('client')}>
     <div className="illus-wrap"><img src={IMG.parent} alt="A parent" style={{width:88,height:88,borderRadius:'50%',objectFit:'cover',display:'block',margin:'0 auto',border:'3px solid #fff',boxShadow:'0 4px 12px rgba(42,59,54,.12)'}}/></div><div className="t">I'm the parent</div>
     <div className="d">Journal my thoughts, feelings and actions as I go through an activity with my child.</div>
    </div>
    <div className="role-opt" onClick={()=>onPick('counsellor')}>
     <div className="illus-wrap"><SpotCompass/></div><div className="t">I'm the counsellor</div>
     <div className="d">Notice congruence, offer gentle questions, and coach toward emotional safety for the child.</div>
    </div>
   </div>
  </div>
 </div>;
}

/* ---------- CLIENT ---------- */
function discDescriptor(discStr){
 if(!discStr) return null;
 const key=discStr.toUpperCase().trim();
 const blends={
  D:{name:'The Driver',desc:'You bring decisiveness, structure and direction. Your growth edge is softening urgency during activity moments, so your child can stay curious rather than feel rushed.'},
  C:{name:'The Analyser',desc:'You bring precision, reliability and care for quality. Your growth edge is reducing correction in the moment, so your child can experience mistakes as part of learning.'},
  I:{name:'The Inspirer',desc:'You bring warmth, playfulness and emotional openness. Your growth edge is slowing your enthusiasm enough for your child\'s pace to be included.'},
  S:{name:'The Supporter',desc:'You bring calm, patience and emotional safety. Your growth edge is naming your own feelings and boundaries clearly, so your child sees calm confidence.'},
  DC:{name:'The Challenger',desc:'You bring drive and precision together. Your growth edge is softening both urgency and correction during shared activities, so the child can explore without feeling they must perform.'},
  CD:{name:'The Designer',desc:'You lead with standards and follow through with determination. Your growth edge is letting the activity be imperfect, so your child learns that connection remains safe even when outcomes are not perfect.'},
  IS:{name:'The Collaborator',desc:'You bring warmth and steadiness together. This is naturally supportive for co-regulation, with the growth edge of holding gentle boundaries when needed.'},
  SI:{name:'The Harmoniser',desc:'You bring steadiness and warmth together. Your growth edge is expressing your own perspective clearly while keeping the emotional tone calm.'},
  CS:{name:'The Perfectionist',desc:'You bring consistency and standards. Your growth edge is allowing more unfinished or imperfect process during shared activities, so your child feels safe to try.'},
  SC:{name:'The Specialist',desc:'You bring patient consistency and careful attention. Your growth edge is noticing when helpful guidance becomes too much guidance.'}
 };
 return blends[key]||{name:`${key} blend`,desc:'Your DISC blend shapes how you respond under pressure. More journal entries and DISC detail will help personalise this insight.'};
}

function DISCIntensityChart({bars}){
 const BASELINE={D:48,I:52,S:55,C:50};
 const HOT=['D','C'];
 if(!bars) return null;
 return <div style={{marginTop:16}}>
  <p style={{fontSize:12,color:'#888',marginBottom:8}}>Grey band = approximate population average. Higher D/C intensity may feel emotionally strong to children during pressured moments.</p>
  <div style={{display:'flex',gap:12,alignItems:'flex-end',height:120}}>
   {['D','I','S','C'].map(q=>{
    const val=bars[q];
    if(val===null||val===undefined) return null;
    const base=BASELINE[q];
    const isHighDC=HOT.includes(q)&&val>base+10;
    const isLowIS=!HOT.includes(q)&&val<base-10;
    const col=isHighDC?'#e07b54':isLowIS?'#5ba89e':'#94bfba';
    const heightPct=Math.max(4,Math.min(100,val));
    return <div key={q} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',position:'relative',height:'100%'}}>
     <div style={{width:'100%',height:100,position:'relative',background:'#f5f5f5',borderRadius:6,overflow:'visible'}}>
      <div style={{position:'absolute',bottom:`${Math.max(0,base-8)}%`,left:0,right:0,height:'16%',background:'rgba(0,0,0,0.07)',borderRadius:3,zIndex:1}} />
      <div style={{position:'absolute',bottom:0,left:'10%',right:'10%',height:`${heightPct}%`,background:col,borderRadius:'4px 4px 0 0',transition:'height 0.5s ease',zIndex:2}} />
     </div>
     <div style={{marginTop:4,fontSize:11,fontWeight:600,color:col}}>{q}</div>
     {isHighDC&&<div style={{fontSize:10,color:'#e07b54',marginTop:2}}>soften</div>}
     {isLowIS&&<div style={{fontSize:10,color:'#5ba89e',marginTop:2}}>support</div>}
    </div>;
   })}
  </div>
  <p style={{fontSize:11,color:'#999',marginTop:8}}>This chart is reflective, not diagnostic. Use it to notice pressure patterns, not to label yourself.</p>
 </div>;
}

function DISCImageUpload({userId,existingBars,onBarsUpdated}){
 const [uploading,setUploading]=useState(false);
 const [manualMode,setManualMode]=useState(false);
 const [manual,setManual]=useState(existingBars||{D:'',I:'',S:'',C:''});
 const [status,setStatus]=useState('');

 const handleFile=async(e)=>{
  const file=e.target.files?.[0];
  if(!file) return;
  setUploading(true);
  setStatus('Reading your DISC profile image...');
  try{
   const reader=new FileReader();
   reader.onload=async(ev)=>{
    try{
     const base64=ev.target.result.split(',')[1];
     const mediaType=file.type||'image/png';
     const resp=await fetch('/api/disc-vision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:base64,imageMediaType:mediaType})});
     const {bars,error}=await resp.json();
     const hasUsableBars=bars&&['D','I','S','C'].some(q=>bars[q]!==null&&bars[q]!==undefined);
     if(error||!hasUsableBars){
      setStatus('Could not read the image reliably. Please enter the values manually.');
      setManualMode(true);
     }else{
      setStatus('');
      await Profile.saveDiscBars(userId,bars);
      onBarsUpdated(bars);
     }
    }catch{
     setStatus('Could not read the image reliably. Please enter the values manually.');
     setManualMode(true);
    }finally{
     setUploading(false);
    }
   };
   reader.readAsDataURL(file);
  }catch{
   setStatus('Upload failed. Please try manual entry.');
   setManualMode(true);
   setUploading(false);
  }
 };

 const handleManualSave=async()=>{
  const bars={
   D:Math.max(0,Math.min(100,parseInt(manual.D)||0)),
   I:Math.max(0,Math.min(100,parseInt(manual.I)||0)),
   S:Math.max(0,Math.min(100,parseInt(manual.S)||0)),
   C:Math.max(0,Math.min(100,parseInt(manual.C)||0))
  };
  await Profile.saveDiscBars(userId,bars);
  onBarsUpdated(bars);
  setManualMode(false);
 };

 if(manualMode) return <div style={{marginTop:12}}>
  <p style={{fontSize:13,color:'#666',marginBottom:8}}>Enter your DISC bar heights from 0 to 100:</p>
  <div style={{display:'flex',gap:8,marginBottom:10}}>{['D','I','S','C'].map(q=><div key={q} style={{flex:1,textAlign:'center'}}>
   <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>{q}</div>
   <input type="number" min="0" max="100" value={manual[q]} onChange={e=>setManual(m=>({...m,[q]:e.target.value}))} style={{width:'100%',padding:'6px 4px',border:'1px solid #ddd',borderRadius:6,textAlign:'center',fontSize:14}} />
  </div>)}</div>
  <button className="btn btn-primary" style={{width:'100%'}} onClick={handleManualSave}>Save DISC values</button>
  <button className="btn btn-secondary" style={{width:'100%',marginTop:6}} onClick={()=>setManualMode(false)}>Cancel</button>
 </div>;

 return <div style={{marginTop:12}}>
  {status&&<p style={{fontSize:13,color:'#e07b54',marginBottom:8}}>{status}</p>}
  <label style={{display:'block',padding:'10px 16px',border:'1px dashed #bbb',borderRadius:8,textAlign:'center',cursor:'pointer',color:'#666',fontSize:13}}>
   {uploading?'Reading image...':'+ Upload your DISC profile image'}
   <input type="file" accept="image/*" style={{display:'none'}} onChange={handleFile} disabled={uploading} />
  </label>
  <button style={{marginTop:6,fontSize:12,color:'#888',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',padding:0}} onClick={()=>setManualMode(true)}>Enter values manually instead</button>
 </div>;
}

const DECODE_CONTEXT_OPTIONS=['Morning','School transition','Mealtime','Bedtime','Screen time','Social situation','Leaving / transition','Other'];
const DECODE_NOTICE_OPTIONS=['Refusal','Meltdown','Withdrawal','Repeating questions','Deflecting','Restlessness','Clinging','Arguing','Physical complaint','Other'];
const DECODE_NEED_OPTIONS=['Safety','Connection','Control / agency','Predictability','Emotional regulation','Sensory regulation','Avoidance of overwhelm','Help expressing something','I am not sure yet'];
const DECODE_PARENT_AFFECT_OPTIONS=['Frustrated','Worried','Rushed','Angry','Helpless','Embarrassed','Confused','Tired','Disappointed','Other'];
const DECODE_INTENSITY_OPTIONS=['Frustration','Anxiety','Helplessness','Embarrassment','Anger'];
const DECODE_PARENT_BEHAVIOUR_OPTIONS=['Raised my voice','Corrected quickly','Explained too much','Threatened consequence','Withdrew','Gave in','Rushed the child','Tried to fix immediately','Stayed calm','Paused','Connected first','Other'];
const DECODE_GROWTH_OPTIONS=['Pause before responding','Stay curious','Name the feeling','Offer predictability','Connect before correcting','Reduce urgency','Give choice','Co-regulate first','Repair after rupture','Ask instead of assume'];
const DECODE_AWARENESS_MARKERS=['I was here in the moment','I watched without racing ahead to fix','I let go of managing how everyone was doing','I named what I expected','I found the thought beneath my feeling','We worked it out together'];
const DECODE_NEXT_OPTIONS=['Pause for 10 seconds','Lower my voice','Name what I see','Offer two choices','Say what is happening next','Move closer instead of shouting','Ask what feels hard','Repair afterwards'];
const DECODE_REPAIR_OPTIONS=['No repair needed','I may need to reconnect','I may need to apologise','I may need to explain calmly','I may need to try again later'];
const DECODE_STEPS=[
 {label:'Intro',title:'Decode a Moment'},
 {label:'A',title:'Awareness'},
 {label:'L',title:'Locate'},
 {label:'I',title:'Integrate'},
 {label:'G',title:'Growth'},
 {label:'N',title:'Navigate'},
 {label:'Summary',title:'Summary'}
];

const emptyDecodeMoment=()=>({
 awareness:{observedBehaviour:'',context:'',initialObservation:''},
 locate:{possibleNeeds:[],parentAffects:[]},
 integrate:{parentCognition:'',affectIntensity:{},parentBehaviours:[]},
 growth:{capacities:[],awarenessMarkers:[]},
 navigate:{nextOption:'',nextAction:'',repairIntention:'',observeNextTime:''}
});

const DECODE_ENTRY_TYPE='behaviour_decode';
const cleanDecodeText=(value)=>String(value||'').trim();
const decodeList=(value)=>safeArray(value).filter(Boolean);
const decodeAffectText=(decode)=>{
 const locate=safeObject(decode?.locate);
 const integrate=safeObject(decode?.integrate);
 const rated=Object.entries(safeObject(integrate.affectIntensity))
  .filter(([,v])=>v!==undefined&&v!==null)
  .map(([k,v])=>`${k} ${v}/5`);
 if(rated.length)return rated.join(', ');
 return decodeList(locate.parentAffects).join(', ');
};
const decodeNextActionText=(decode)=>{
 const navigate=safeObject(decode?.navigate);
 return [navigate.nextOption,cleanDecodeText(navigate.nextAction)].filter(Boolean).join(' - ');
};
const decodeAlignmentGapText=(decode)=>{
 const locate=safeObject(decode?.locate);
 const integrate=safeObject(decode?.integrate);
 const needs=decodeList(locate.possibleNeeds);
 const responses=decodeList(integrate.parentBehaviours);
 const affects=decodeList(locate.parentAffects);
 const needText=needs.length?needs.join(', '):'an emerging need';
 const responseText=responses.length?responses.join(', ').toLowerCase():affects.length?affects.join(', ').toLowerCase():'a protective response';
 return `Your child may have needed ${needText}, while your response may have moved toward ${responseText}.`;
};
const buildDecodeReminderEntry=({decode,parentId,childId=''})=>{
 const createdAt=new Date().toISOString();
 const awareness=safeObject(decode?.awareness);
 const locate=safeObject(decode?.locate);
 const integrate=safeObject(decode?.integrate);
 const growth=safeObject(decode?.growth);
 const navigate=safeObject(decode?.navigate);
 const possibleNeeds=decodeList(locate.possibleNeeds);
 const possibleSignal=[awareness.initialObservation,awareness.context].filter(Boolean);
 const feelings=decodeAffectText(decode);
 const alignmentGap=decodeAlignmentGapText(decode);
 const nextAction=decodeNextActionText(decode);
 const reminder={
  observed_behaviour:cleanDecodeText(awareness.observedBehaviour),
  moment_noticed:cleanDecodeText(awareness.observedBehaviour),
  awareness_signals:possibleSignal,
  possible_signal_explored:possibleSignal,
  possible_need_worth_staying_curious_about:possibleNeeds,
  thinking:cleanDecodeText(integrate.parentCognition),
  feelings,
  affect_intensity:safeObject(integrate.affectIntensity),
  behaviour_what_i_did:decodeList(integrate.parentBehaviours),
  possible_alignment_gap:alignmentGap,
  stabilising_response_to_practise:decodeList(growth.capacities),
  next_action:nextAction,
  next_option:navigate.nextOption||'',
  next_action_note:cleanDecodeText(navigate.nextAction),
  repair_intention:navigate.repairIntention||'',
  what_i_will_observe_next_time:cleanDecodeText(navigate.observeNextTime),
  awareness_markers:decodeList(growth.awarenessMarkers),
  created_at:createdAt
 };
 return {
  id:Date.now(),
  parentId,
  childId,
  entry_type:DECODE_ENTRY_TYPE,
  entryType:DECODE_ENTRY_TYPE,
  title:'Alignment Reminder',
  activity:'Alignment Reminder',
  phase:'Decode a Moment',
  date:createdAt.split('T')[0],
  submittedAt:createdAt,
  timestamp:createdAt,
  createdAt,
  autoWords:[],
  markers:{},
  reminder,
  align:{
   awareness:{
    observed_behaviour:reminder.observed_behaviour,
    context:awareness.context||'',
    initial_observation:awareness.initialObservation||'',
    awareness_signals:reminder.awareness_signals
   },
   locate:{
    possible_child_need:possibleNeeds,
    parent_affect:decodeList(locate.parentAffects)
   },
   integrate:{
    parent_cognition:reminder.thinking,
    parent_affect:feelings,
    parent_affect_intensity:reminder.affect_intensity,
    parent_behaviour:reminder.behaviour_what_i_did,
    possible_misalignment:alignmentGap
   },
   growth:{
    growth_capacity:reminder.stabilising_response_to_practise,
    awareness_markers:reminder.awareness_markers
   },
   navigate:{
    next_action:reminder.next_action,
    repair_intention:reminder.repair_intention,
    observe_next_time:reminder.what_i_will_observe_next_time
   }
  }
 };
};
const isBehaviourDecodeEntry=(entry)=>[entry?.entry_type,entry?.entryType,entry?.type].includes(DECODE_ENTRY_TYPE);
const decodeReminderFromEntry=(entry)=>{
 const reminder=safeObject(entry?.reminder);
 if(Object.keys(reminder).length)return reminder;
 const align=safeObject(entry?.align);
 const awareness=safeObject(align.awareness);
 const locate=safeObject(align.locate);
 const integrate=safeObject(align.integrate);
 const growth=safeObject(align.growth);
 const navigate=safeObject(align.navigate);
 return {
  observed_behaviour:awareness.observed_behaviour||'',
  awareness_signals:decodeList(awareness.awareness_signals||[awareness.initial_observation,awareness.context]),
  possible_signal_explored:decodeList(awareness.awareness_signals||[awareness.initial_observation,awareness.context]),
  possible_need_worth_staying_curious_about:decodeList(locate.possible_child_need),
  thinking:integrate.parent_cognition||'',
  feelings:integrate.parent_affect||'',
  affect_intensity:safeObject(integrate.parent_affect_intensity),
  behaviour_what_i_did:decodeList(integrate.parent_behaviour),
  possible_alignment_gap:integrate.possible_misalignment||'',
  stabilising_response_to_practise:decodeList(growth.growth_capacity),
  next_action:navigate.next_action||'',
  repair_intention:navigate.repair_intention||'',
  what_i_will_observe_next_time:navigate.observe_next_time||''
 };
};
const decodeDisplayText=(value,fallback='-')=>{
 if(Array.isArray(value)){
  const text=value.filter(Boolean).join(', ');
  return text||fallback;
 }
 if(value&&typeof value==='object'){
  const text=Object.entries(value)
   .filter(([,v])=>v!==undefined&&v!==null&&v!=='')
   .map(([k,v])=>`${k} ${v}/5`)
   .join(', ');
  return text||fallback;
 }
 return cleanDecodeText(value)||fallback;
};

const ALIGN_JOURNEY_REASSURANCE='These reflections are not labels or scores. They are gentle prompts to help you notice alignment over time.';
const alignJourneyEntryTime=(entry)=>{
 const d=parseStoredDate(firstStoredDateValue(entry?.timestamp,entry?.submittedAt,entry?.date,entry?.created_at));
 return d&&!isNaN(d)?d.getTime():0;
};
const alignJourneyText=(value)=>{
 const text=decodeDisplayText(value,'');
 return text==='-'?'':text;
};
const ALIGN_JOURNEY_PHASE_FOCUS={
 A:{label:'Awareness',phrase:'you may be building the habit of noticing and reflecting'},
 L:{label:'Locate',phrase:'you may be practising staying curious during structured activities'},
 I:{label:'Integrate',phrase:'you may be practising connecting what you notice with what happened in you'},
 G:{label:'Growth',phrase:'you may be practising a stabilising capacity through recent activities'},
 N:{label:'Navigate',phrase:'you may be practising choosing a next step or repair gently'}
};
const alignJourneyValidPhase=(entry)=>{
 const phase=String(entry?.phase||'').trim().toUpperCase();
 return ['A','L','I','G','N'].includes(phase)?phase:'';
};
const getActivityJournalEntries=(entries)=>{
 const safeEntries=Array.isArray(entries)?entries:[];
 return safeEntries.filter(e=>!isBehaviourDecodeEntry(e)).sort((a,b)=>alignJourneyEntryTime(b)-alignJourneyEntryTime(a));
};
const alignJourneyModeCount=(items)=>{
 const counts={};
 items.forEach(item=>{
  if(item) counts[item]=(counts[item]||0)+1;
 });
 return Object.entries(counts).sort((a,b)=>b[1]-a[1]);
};
const getMostCommonPossibleNeed=(decodes,minCount=2)=>{
 const needs=[];
 decodes.forEach(entry=>{
  decodeList(decodeReminderFromEntry(entry).possible_need_worth_staying_curious_about).forEach(need=>{
   if(need) needs.push(need);
  });
 });
 const top=alignJourneyModeCount(needs)[0];
 return top&&top[1]>=minCount?top[0]:'';
};
const getMostCommonGrowthCapacity=(decodes,minCount=2)=>{
 const capacities=[];
 decodes.forEach(entry=>{
  decodeList(decodeReminderFromEntry(entry).stabilising_response_to_practise).forEach(capacity=>{
   if(capacity) capacities.push(capacity);
  });
 });
 const top=alignJourneyModeCount(capacities)[0];
 return top&&top[1]>=minCount?top[0]:'';
};
const getClaimedMarkerLabels=(entry)=>{
 const markerSource=typeof MARKERS!=='undefined'?MARKERS:[];
 const markers=entry?.markers||{};
 return markerSource.filter(m=>markers[m.key]?.claimed).map(m=>m.label);
};
const getMostCommonActivityPhase=(activities,minCount=2)=>{
 const phases=activities.map(alignJourneyValidPhase).filter(Boolean);
 const top=alignJourneyModeCount(phases)[0];
 return top&&top[1]>=minCount?top[0]:'';
};
const getBehaviourDecodeEntries=(entries)=>{
 const safeEntries=Array.isArray(entries)?entries:[];
 return safeEntries.filter(isBehaviourDecodeEntry).sort((a,b)=>alignJourneyEntryTime(b)-alignJourneyEntryTime(a));
};
const getLatestDecodeEntry=(entries)=>getBehaviourDecodeEntries(entries)[0]||null;
const getMostCommonRepairIntention=(decodes,minCount=2)=>{
 const repairs=[];
 decodes.forEach(entry=>{
  const repair=alignJourneyText(decodeReminderFromEntry(entry).repair_intention);
  if(repair&&!/^no repair needed$/i.test(repair)) repairs.push(repair);
 });
 const top=alignJourneyModeCount(repairs)[0];
 return top&&top[1]>=minCount?top[0]:'';
};
const alignJourneyPracticeFocusFromPhase=(phaseKey)=>{
 const focus=ALIGN_JOURNEY_PHASE_FOCUS[phaseKey]||ALIGN_JOURNEY_PHASE_FOCUS.A;
 return 'From your recent activities, '+focus.label.toLowerCase()+' may be a practice context for you — '+focus.phrase+'.';
};
const getMostCommonCABSignal=(decodes,minCount=2)=>{
 const signals=[];
 decodes.forEach(entry=>{
  const r=decodeReminderFromEntry(entry);
  const gap=alignJourneyText(r.possible_alignment_gap);
  const thinking=alignJourneyText(r.thinking);
  if(gap) signals.push(gap);
  if(thinking) signals.push(thinking);
 });
 const top=alignJourneyModeCount(signals)[0];
 return top&&top[1]>=minCount?top[0]:'';
};
const alignJourneyDecodeReflectiveFocus=(decodes)=>{
 if(!decodes.length) return '';
 const latestReminder=decodeReminderFromEntry(decodes[0])||{};
 const latestNeeds=decodeList(latestReminder.possible_need_worth_staying_curious_about);
 const commonNeed=getMostCommonPossibleNeed(decodes,2);
 const focusNeed=latestNeeds[0]||commonNeed;
 if(focusNeed){
  return 'You may be exploring locate: staying curious about a possible need beneath behaviour. A possible need worth staying curious about: '+focusNeed.toLowerCase()+'.';
 }
 const commonCAB=getMostCommonCABSignal(decodes,2);
 if(commonCAB){
  return 'You may be practising integrate: connecting a possible need with what happened in you. A theme that may be worth noticing: '+commonCAB.toLowerCase()+'.';
 }
 const commonCapacity=getMostCommonGrowthCapacity(decodes,2);
 if(commonCapacity){
  return 'You may be practising growth: building a stabilising capacity. A capacity that may be emerging: '+commonCapacity.toLowerCase()+'.';
 }
 if(alignJourneyText(latestReminder.observed_behaviour)){
  return 'You may be exploring awareness: pausing and noticing what happened.';
 }
 return 'You may be beginning to explore awareness: pausing and noticing in parenting moments.';
};
const alignJourneyReflectiveFocus=(decodes,activities)=>{
 if(decodes.length){
  let focus=alignJourneyDecodeReflectiveFocus(decodes);
  if(activities.length) focus+=' Recent activity reflections may support this practice.';
  return focus;
 }
 if(activities.length){
  const latestPhase=alignJourneyValidPhase(activities[0])||'A';
  return alignJourneyPracticeFocusFromPhase(latestPhase);
 }
 return '';
};
const alignJourneyActivityRhythmPattern=(activities)=>{
 let pattern='You may be building a rhythm of reflection through recent activities.';
 const commonPhase=getMostCommonActivityPhase(activities,2);
 if(commonPhase){
  const focus=ALIGN_JOURNEY_PHASE_FOCUS[commonPhase];
  if(focus) pattern+=' Recent activities may suggest you are beginning to explore '+focus.label.toLowerCase()+' practice.';
 }
 return pattern;
};
const alignJourneyNextStepFallback=(decodes,activities)=>{
 const directions={
  a:'pausing and noticing before responding',
  l:'staying curious about a possible need beneath what you notice',
  i:'connecting a possible need with what happened in you',
  g:'practising one stabilising capacity gently',
  n:'choosing one repair or next action when you are ready'
 };
 if(!decodes.length&&activities.length){
  return 'When you are ready, Decode a Moment may help you notice a possible need and your CAB response more clearly.';
 }
 if(activities.length){
  const phase=alignJourneyValidPhase(activities[0])||getMostCommonActivityPhase(activities,2)||'A';
  return 'A gentle next step could be: '+(directions[phase.toLowerCase()]||directions.a)+'.';
 }
 if(getMostCommonGrowthCapacity(decodes,2)) return 'A gentle next step could be: '+directions.g+'.';
 if(getMostCommonCABSignal(decodes,2)) return 'A gentle next step could be: '+directions.i+'.';
 const latestNeeds=decodeList(decodeReminderFromEntry(decodes[0]).possible_need_worth_staying_curious_about);
 if(latestNeeds.length||getMostCommonPossibleNeed(decodes,2)) return 'A gentle next step could be: '+directions.l+'.';
 return 'A gentle next step could be: '+directions.a+'.';
};
const alignJourneyDecodeRecentPattern=(decodes)=>{
 const count=decodes.length;
 const latestReminder=decodeReminderFromEntry(decodes[0])||{};
 const latestNeeds=decodeList(latestReminder.possible_need_worth_staying_curious_about);
 const commonNeed=getMostCommonPossibleNeed(decodes,2);
 const gap=alignJourneyText(latestReminder.possible_alignment_gap);
 const thinking=alignJourneyText(latestReminder.thinking);
 if(count===1){
  return 'One reflection is a starting point. A few more decoded moments may help something worth noticing appear more safely here.';
 }
 if(count<=3){
  if(/urgency|rush|quick|late|hurry/i.test(gap)||/urgency|rush|quick|late|hurry/i.test(thinking)){
   return 'An early signal may involve urgency when predictability may be needed.';
  }
  if(gap){
   return 'A recent reflection may involve a possible alignment gap worth noticing — without judging yourself or your child.';
  }
  if(thinking&&/predict|transition|control|plan|expect/i.test(thinking)){
   return 'An early signal may involve how thinking and a possible need might not yet align.';
  }
  if(latestNeeds.length){
   return 'Recent reflections may be touching possible needs worth staying curious about.';
  }
  return 'Recent reflections may be showing moments where pause and noticing are still forming.';
 }
 if(commonNeed){
  return 'A possible theme across recent reflections: '+commonNeed.toLowerCase()+' may have appeared as a need worth staying curious about.';
 }
 if(/urgency|rush|quick|late|hurry/i.test(gap)||/urgency|rush|quick|late|hurry/i.test(thinking)){
  return 'A recent pattern may involve urgency when predictability may be needed.';
 }
 if(gap){
  return 'A possible theme across recent reflections may involve moments where your response and a possible need might not yet align.';
 }
 if(thinking){
  return 'A possible theme may involve pausing to notice how your thinking may shape the moment.';
 }
 return 'Recent reflections may be showing moments where pause and noticing are still forming.';
};
const getMostCommonClaimedMarkerLabel=(activities)=>{
 const labels=[];
 activities.forEach(entry=>{
  getClaimedMarkerLabels(entry).forEach(label=>{
   if(label) labels.push(label);
  });
 });
 const top=alignJourneyModeCount(labels)[0];
 return top?top[0]:'';
};
const buildAlignJourneySummary=(entries)=>{
 const emptyResult={
  currentFocus:'',
  recentPattern:'',
  growthPractice:'',
  nextStep:'',
  hasDecodeEntries:false,
  showEmpty:true
 };
 try{
  const decodes=getBehaviourDecodeEntries(entries);
  const activities=getActivityJournalEntries(entries);
  const decodeCount=decodes.length;
  const activityCount=activities.length;
  if(decodeCount===0&&activityCount===0) return emptyResult;
  const currentFocus=alignJourneyReflectiveFocus(decodes,activities);
  let recentPattern;
  if(decodeCount===0){
   recentPattern=alignJourneyActivityRhythmPattern(activities);
  }else if(activityCount===0){
   recentPattern=alignJourneyDecodeRecentPattern(decodes);
  }else if(decodeCount===1){
   recentPattern=alignJourneyDecodeRecentPattern(decodes)+' '+alignJourneyActivityRhythmPattern(activities);
  }else{
   recentPattern=alignJourneyDecodeRecentPattern(decodes);
  }
  const latestReminder=decodeCount?decodeReminderFromEntry(decodes[0])||{}:{};
  const latestCapacities=decodeCount?decodeList(latestReminder.stabilising_response_to_practise):[];
  const commonCapacity=decodeCount?getMostCommonGrowthCapacity(decodes,2):'';
  let growthPractice;
  if(latestCapacities.length){
   growthPractice='Your current growth practice may be '+latestCapacities[0].toLowerCase()+'.';
  }else if(commonCapacity&&decodeCount>=4){
   growthPractice='A growth practice that may be emerging: '+commonCapacity.toLowerCase()+'.';
  }else{
   const markerLabel=getMostCommonClaimedMarkerLabel(activities);
   if(markerLabel){
    growthPractice='A practice you may be tending: '+markerLabel+'.';
   }else if(decodeCount>0&&decodeCount<=3){
    growthPractice='A practice direction may emerge here as you decode more moments.';
   }else if(activityCount>0){
    growthPractice='A practice direction may emerge here as you reflect on more activities.';
   }else{
    growthPractice='Pausing before correcting may be a practice worth tending as you reflect.';
   }
  }
  let nextStep;
  if(decodeCount){
   const nextAction=alignJourneyText(latestReminder.next_action);
   const repair=alignJourneyText(latestReminder.repair_intention);
   if(nextAction){
    nextStep='A gentle next step could be: '+nextAction+'.';
   }else if(repair&&!/^no repair needed$/i.test(repair)){
    nextStep='A gentle next step could be: '+repair+'.';
   }else{
    nextStep=alignJourneyNextStepFallback(decodes,activities);
   }
  }else{
   nextStep=alignJourneyNextStepFallback(decodes,activities);
  }
  return {
   currentFocus,
   recentPattern,
   growthPractice,
   nextStep,
   hasDecodeEntries:decodeCount>0,
   showEmpty:false
  };
 }catch(err){
  return emptyResult;
 }
};
function AlignJourneySection({entries,onStartDecode}){
 const summary=buildAlignJourneySummary(entries);
 return <div className="card dashboard-section align-journey-section" role="region" aria-label="Your ALIGN Journey">
  <div className="dashboard-section-head">
   <div>
    <h2>Your ALIGN Journey</h2>
    <p className="dashboard-helper">A gentle read on where you may be practising emotional regulation through ALIGN.</p>
   </div>
  </div>
  {summary.showEmpty ? <div className="dashboard-empty align-journey-empty">
   <p className="align-journey-empty-title">Your ALIGN Journey is beginning</p>
   <p className="align-journey-empty-body">After you decode a few moments, Wayfinder will reflect back possible patterns in needs, CAB responses, growth practices, and next actions.</p>
   {onStartDecode ? <button type="button" className="btn btn-primary align-journey-empty-cta" onClick={onStartDecode}>Start Decode</button> : null}
  </div> : <>
   <div className="align-journey-grid">
    <div className="align-journey-card align-journey-item">
     <span className="align-journey-label">Current Focus</span>
     <p className="align-journey-text">{summary.currentFocus}</p>
    </div>
    <div className="align-journey-card align-journey-item">
     <span className="align-journey-label">Recent Pattern</span>
     <p className="align-journey-text">{summary.recentPattern}</p>
    </div>
    <div className="align-journey-card align-journey-item">
     <span className="align-journey-label">Growth Practice</span>
     <p className="align-journey-text">{summary.growthPractice}</p>
    </div>
    <div className="align-journey-card align-journey-item">
     <span className="align-journey-label">Next Step</span>
     <p className="align-journey-text">{summary.nextStep}</p>
    </div>
   </div>
   <p className="align-journey-note">{ALIGN_JOURNEY_REASSURANCE}</p>
  </>}
 </div>;
}



function appVersionEntryStatus(entry){
 const status=String(entry?.status||'').trim().toLowerCase();
 if(status==='released'||status==='planned')return status;
 if(String(entry?.version||'').trim().toLowerCase()==='upcoming')return 'planned';
 return 'released';
}
function activityEventPad2(n){return String(n).padStart(2,'0');}
function activityEventDateTimeParts(event){
 const date=String(event?.date||'').trim();
 const parts=date.split('-').map(Number);
 const y=parts[0]||2026,m=parts[1]||1,d=parts[2]||1;
 const st=String(event?.startTime||'10:00').split(':');
 const et=String(event?.endTime||'11:00').split(':');
 return {y,m,d,sh:Number(st[0]||10),sm:Number(st[1]||0),eh:Number(et[0]||11),em:Number(et[1]||0)};
}
function activityEventIcsStamp({y,m,d,h,min}){
 return `${y}${activityEventPad2(m)}${activityEventPad2(d)}T${activityEventPad2(h)}${activityEventPad2(min)}00`;
}
function escapeIcsText(value){
 return String(value||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
}
function buildActivityEventCalendarPayload(event){
 const details=typeof enrichHostedActivityEvent==='function'?enrichHostedActivityEvent(event):event;
 const p=activityEventDateTimeParts(event);
 const start=activityEventIcsStamp({y:p.y,m:p.m,d:p.d,h:p.sh,min:p.sm});
 const end=activityEventIcsStamp({y:p.y,m:p.m,d:p.d,h:p.eh,min:p.em});
 const summary=String(details.activityTitle||'Wayfinder activity session');
 const location=String(event.venueLabel||'').trim();
 const feeLabel=event.feeType==='paid'?'Paid':'Free';
 const description=[
  details.practiceFocus?`Practice focus: ${details.practiceFocus}`:'',
  details.possibleNeedContext?`Possible need context: ${details.possibleNeedContext}`:'',
  `Fee: ${feeLabel}`,
  `Hosted by: ${event.facilitatorLabel||'Wayfinder facilitator'}`,
  'Privacy: Event logistics only. No child names, IDs, journal, or reflection content.'
 ].filter(Boolean).join('\n');
 return {summary,description,location,start,end,details};
}
function downloadActivityEventIcs(event){
 const {summary,description,location,start,end}=buildActivityEventCalendarPayload(event);
 const uid=`wf-hosted-${event.id}@wayfinder-modular.vercel.app`;
 const dtstamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const lines=[
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Wayfinder//Events Listing//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  `UID:${uid}`,
  `DTSTAMP:${dtstamp}`,
  `DTSTART:${start}`,
  `DTEND:${end}`,
  `SUMMARY:${escapeIcsText(summary)}`,
  `DESCRIPTION:${escapeIcsText(description)}`
 ];
 if(location) lines.push(`LOCATION:${escapeIcsText(location)}`);
 lines.push('END:VEVENT','END:VCALENDAR');
 const blob=new Blob([lines.join('\r\n')],{type:'text/calendar;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;
 a.download=`wayfinder-${event.id}.ics`;
 document.body.appendChild(a);
 a.click();
 a.remove();
 URL.revokeObjectURL(url);
}
function googleCalendarUrlForActivityEvent(event){
 const {summary,description,location,start,end}=buildActivityEventCalendarPayload(event);
 return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(summary)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
}
function outlookCalendarUrlForActivityEvent(event){
 const {summary,description,location,start,end}=buildActivityEventCalendarPayload(event);
 const startDt=`${start.slice(0,4)}-${start.slice(4,6)}-${start.slice(6,8)}T${start.slice(9,11)}:${start.slice(11,13)}:00`;
 const endDt=`${end.slice(0,4)}-${end.slice(4,6)}-${end.slice(6,8)}T${end.slice(9,11)}:${end.slice(11,13)}:00`;
 return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(summary)}&body=${encodeURIComponent(description)}&startdt=${encodeURIComponent(startDt)}&enddt=${encodeURIComponent(endDt)}&location=${encodeURIComponent(location)}`;
}
function formatHostedActivityEventDate(event){
 const date=parseStoredDate(event?.date);
 if(!date||isNaN(date)) return String(event?.date||'Date TBC');
 return date.toLocaleDateString('en-SG',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
}
function ActivityEventCard({event,pageMeta}){
 const details=typeof enrichHostedActivityEvent==='function'?enrichHostedActivityEvent(event):event;
 const feeLabel=event.feeType==='paid'?'Paid':'Free';
 const regUrl=String(event.registrationUrl||event.eventbriteUrl||event.paymentUrl||'').trim();
 const externalReg=regUrl&&/^https?:\/\//i.test(regUrl);
 return <article className="activity-event-card">
  <div className="activity-event-card-head">
   <span className="pill">{details.alignStageLabel||details.alignStage||'ALIGN practice'}</span>
   <span className={`activity-event-fee activity-event-fee--${event.feeType==='paid'?'paid':'free'}`}>{feeLabel}</span>
  </div>
  <h3 className="activity-event-title">{details.activityTitle}</h3>
  {details.practiceFocus?<p className="activity-event-focus"><strong>Practice focus:</strong> {details.practiceFocus}</p>:null}
  {details.possibleNeedContext?<p className="activity-event-context sub"><strong>Possible need context:</strong> {details.possibleNeedContext}</p>:null}
  {details.cabDomain?<p className="activity-event-cab sub">CAB domain: {details.cabDomain}</p>:null}
  <dl className="activity-event-meta">
   <div><dt>Date</dt><dd>{formatHostedActivityEventDate(event)}</dd></div>
   <div><dt>Time</dt><dd>{event.startTime||'—'} – {event.endTime||'—'} ({event.timezone||'Asia/Singapore'})</dd></div>
   <div><dt>Venue</dt><dd>{event.venueType==='online'?'Online':'In person'} · {event.venueLabel}</dd></div>
   <div><dt>Facilitator</dt><dd>{event.facilitatorLabel||'Wayfinder facilitator'}</dd></div>
  </dl>
  {externalReg?<p className="activity-event-register"><a href={regUrl} target="_blank" rel="noopener noreferrer" className="activity-event-link">{event.feeType==='paid'?'Registration / payment link':'Registration link'}</a></p>:null}
  <div className="activity-event-calendar-actions">
   <span className="activity-event-calendar-label">Add to calendar</span>
   <div className="activity-event-calendar-btns">
    <button type="button" className="btn btn-secondary btn-sm" onClick={()=>downloadActivityEventIcs(event)}>{pageMeta.calendarDownloadLabel||'Download .ics'}</button>
    <a className="btn btn-secondary btn-sm" href={googleCalendarUrlForActivityEvent(event)} target="_blank" rel="noopener noreferrer">{pageMeta.googleCalendarLabel||'Google Calendar'}</a>
    <a className="btn btn-secondary btn-sm" href={outlookCalendarUrlForActivityEvent(event)} target="_blank" rel="noopener noreferrer">{pageMeta.outlookCalendarLabel||'Outlook web'}</a>
   </div>
  </div>
 </article>;
}
function ActivityEventsPage({back,onSignOut,authSession}){
 const pageMeta=typeof ACTIVITY_EVENTS_PAGE!=='undefined'?ACTIVITY_EVENTS_PAGE:{};
 const [events,setEvents]=useState([]);
 const [loading,setLoading]=useState(true);
 const pageTitle=String(pageMeta.title||'Events Listing').trim()||'Events Listing';
 useEffect(()=>{
  let cancelled=false;
  (async()=>{
   setLoading(true);
   try{
    const result=await DB.getPublishedHostedEvents(authSession);
    if(cancelled)return;
    const rows=(result?.events||[]).map(ev=>typeof enrichHostedActivityEvent==='function'?enrichHostedActivityEvent(ev):ev);
    setEvents(rows);
   }catch(err){
    AuthDebug.log('[events] parent listing load failed:', { message: err?.message || String(err) });
    if(!cancelled)setEvents([]);
   }finally{
    if(!cancelled)setLoading(false);
   }
  })();
  return ()=>{cancelled=true;};
 },[authSession?.access_token]);
 return <div className="wrap activity-events-wrap">
  <Bar title={pageTitle} back={back} onSignOut={onSignOut}/>
  <div className="card activity-events-intro">
   <h1>{pageTitle}</h1>
   <p className="sub activity-events-subtitle">{pageMeta.subtitle||''}</p>
   <p className="activity-events-privacy">{pageMeta.privacyNote||''}</p>
  </div>
  {loading?<div className="card activity-events-empty"><p className="sub">Loading events…</p></div>:events.length===0?<div className="card activity-events-empty"><p className="sub">{pageMeta.emptyState||'No events are available yet. Check back when a facilitator publishes a hosted Wayfinder activity.'}</p></div>:<div className="activity-events-grid">
   {events.map(ev=><ActivityEventCard key={ev.id} event={ev} pageMeta={pageMeta}/>)}
  </div>}
 </div>;
}
function hostedEventStatusLabel(status,pageMeta){
 if(status==='published')return pageMeta.statusPublished||'Published';
 if(status==='archived')return pageMeta.statusArchived||'Archived';
 return pageMeta.statusDraft||'Draft';
}
function emptyCounsellorHostForm(){
 return {activity_id:'',venue_type:'physical',venue_address_or_link:'',start_date:'',start_time:'10:00',end_time:'11:00',timezone:'Asia/Singapore',fee_type:'free',registration_url:'',eventbrite_url:''};
}
function CounsellorHostEventForm({user,authSession,eventId,existingEvent,unavailable,onBack,onSaved}){
 const pageMeta=typeof COUNSELLOR_EVENTS_HOSTING!=='undefined'?COUNSELLOR_EVENTS_HOSTING:{};
 const catalog=typeof ACTIVITY_PRACTICE_CATALOG!=='undefined'?ACTIVITY_PRACTICE_CATALOG:[];
 const [form,setForm]=useState(()=>{
  if(existingEvent){
   return {activity_id:existingEvent.activity_id||'',venue_type:existingEvent.venueType==='online'?'online':'physical',venue_address_or_link:existingEvent.venueLabel||'',start_date:existingEvent.date||'',start_time:existingEvent.startTime||'10:00',end_time:existingEvent.endTime||'11:00',timezone:existingEvent.timezone||'Asia/Singapore',fee_type:existingEvent.feeType==='paid'?'paid':'free',registration_url:existingEvent.registrationUrl||'',eventbrite_url:existingEvent.eventbriteUrl||''};
  }
  return emptyCounsellorHostForm();
 });
 const [saving,setSaving]=useState(false);
 const [saveError,setSaveError]=useState('');
 const set=(key,val)=>setForm(prev=>({...prev,[key]:val}));
 const selectedPractice=typeof getActivityPracticeById==='function'?getActivityPracticeById(form.activity_id):null;
 const buildPayload=(status)=>{
  const nowIso=new Date().toISOString();
  const payload={
   activity_id:String(form.activity_id||'').trim(),
   venue_type:form.venue_type==='online'?'online':'physical',
   venue_address_or_link:String(form.venue_address_or_link||'').trim(),
   start_date:form.start_date,
   start_time:form.start_time,
   end_time:form.end_time||null,
   timezone:form.timezone||'Asia/Singapore',
   fee_type:form.fee_type==='paid'?'paid':'free',
   registration_url:String(form.registration_url||'').trim()||null,
   eventbrite_url:String(form.eventbrite_url||'').trim()||null,
   status
  };
  if(status==='published')payload.published_at=nowIso;
  return payload;
 };
 const save=async(status)=>{
  setSaveError('');
  if(unavailable){setSaveError(pageMeta.setupUnavailable||'Hosted events are not ready yet.');return;}
  if(!form.activity_id){setSaveError('Please select a Wayfinder activity.');return;}
  if(!form.start_date||!form.start_time||!form.venue_address_or_link){setSaveError('Please add venue, date, and start time.');return;}
  setSaving(true);
  try{
   const payload=buildPayload(status);
   const result=eventId
    ?await DB.updateHostedEvent(user.id,eventId,payload,authSession)
    :await DB.createHostedEvent(user.id,payload,authSession);
   if(result?.unavailable){setSaveError(pageMeta.setupUnavailable||'Hosted events are not ready yet.');return;}
   if(!result?.ok){setSaveError('We could not save this hosted event. Please try again.');return;}
   onSaved(result.event);
  }catch(err){
   setSaveError('We could not save this hosted event. Please try again.');
   AuthDebug.log('[counsellor] hosted event save failed:', { message: err?.message || String(err) });
  }finally{
   setSaving(false);
  }
 };
 if(unavailable){
  return <div className="wrap counsellor-hosting-wrap">
   <Bar title={pageMeta.title||'Events hosting'} back={onBack}/>
   <div className="card counsellor-hosting-setup"><p className="sub">{pageMeta.setupUnavailable||'Hosted events are not ready yet. The database setup still needs to be completed.'}</p></div>
  </div>;
 }
 return <div className="wrap counsellor-hosting-wrap">
  <Bar title={eventId?'Edit hosted event':pageMeta.newEventLabel||'Host new event'} back={onBack}/>
  <div className="card counsellor-hosting-intro">
   <p className="sub">{pageMeta.subtitle||''}</p>
   <p className="counsellor-hosting-privacy">{pageMeta.privacyNote||''}</p>
  </div>
  <div className="card counsellor-hosting-form">
   <div className="field"><label>{pageMeta.activityLabel||'Wayfinder activity'}</label>
    <select value={form.activity_id} onChange={e=>set('activity_id',e.target.value)}>
     <option value="">Select an activity…</option>
     {catalog.map(item=><option key={item.activity_id} value={item.activity_id}>{item.activity_id} — {item.label}</option>)}
    </select>
   </div>
   {selectedPractice?<div className="counsellor-hosting-activity-preview">
    <p><strong>{selectedPractice.label}</strong></p>
    <p className="sub">ALIGN: {typeof ALIGN_STAGE_LABELS!=='undefined'?ALIGN_STAGE_LABELS[selectedPractice.align_stage]||selectedPractice.align_stage:selectedPractice.align_stage}</p>
    {selectedPractice.growth_capacity?<p className="sub"><strong>Practice focus:</strong> {selectedPractice.growth_capacity}</p>:null}
    {selectedPractice.possible_need_context?<p className="sub"><strong>Possible need context:</strong> {selectedPractice.possible_need_context}</p>:null}
   </div>:null}
   <div className="field"><label>{pageMeta.venueTypeLabel||'Venue type'}</label>
    <select value={form.venue_type} onChange={e=>set('venue_type',e.target.value)}>
     <option value="physical">{pageMeta.venuePhysical||'Physical'}</option>
     <option value="online">{pageMeta.venueOnline||'Online'}</option>
    </select>
   </div>
   <div className="field"><label>{pageMeta.venueDetailLabel||'Venue address or online meeting note'}</label><textarea rows={2} value={form.venue_address_or_link} onChange={e=>set('venue_address_or_link',e.target.value)}/></div>
   <div className="field-row">
    <div className="field"><label>{pageMeta.dateLabel||'Date'}</label><input type="date" value={form.start_date} onChange={e=>set('start_date',e.target.value)}/></div>
    <div className="field"><label>{pageMeta.startTimeLabel||'Start time'}</label><input type="time" value={form.start_time} onChange={e=>set('start_time',e.target.value)}/></div>
    <div className="field"><label>{pageMeta.endTimeLabel||'End time'}</label><input type="time" value={form.end_time} onChange={e=>set('end_time',e.target.value)}/></div>
   </div>
   <div className="field"><label>{pageMeta.feeTypeLabel||'Fee type'}</label>
    <select value={form.fee_type} onChange={e=>set('fee_type',e.target.value)}>
     <option value="free">{pageMeta.feeFree||'Free'}</option>
     <option value="paid">{pageMeta.feePaid||'Paid'}</option>
    </select>
   </div>
   <div className="field"><label>{pageMeta.registrationUrlLabel||'Registration link (optional)'}</label><input type="url" value={form.registration_url} onChange={e=>set('registration_url',e.target.value)} placeholder="https://"/></div>
   <div className="field"><label>{pageMeta.eventbriteUrlLabel||'Eventbrite link (optional)'}</label><input type="url" value={form.eventbrite_url} onChange={e=>set('eventbrite_url',e.target.value)} placeholder="https://"/></div>
   {saveError?<p className="counsellor-hosting-error">{saveError}</p>:null}
   <div className="counsellor-hosting-actions">
    <button type="button" className="btn btn-secondary" disabled={saving} onClick={()=>save('draft')}>{saving?'Saving…':pageMeta.saveDraftLabel||'Save draft'}</button>
    <button type="button" className="btn btn-primary" disabled={saving} onClick={()=>save('published')}>{saving?'Saving…':pageMeta.publishLabel||'Publish event'}</button>
   </div>
  </div>
 </div>;
}
function CounsellorHostedEventsPage({user,authSession,onBack,onNew,onEdit,onSignOut,invitePanel}){
 const pageMeta=typeof COUNSELLOR_EVENTS_HOSTING!=='undefined'?COUNSELLOR_EVENTS_HOSTING:{};
 const [events,setEvents]=useState([]);
 const [loading,setLoading]=useState(true);
 const [unavailable,setUnavailable]=useState(false);
 const [actionError,setActionError]=useState('');
 const load=async()=>{
  setLoading(true);
  setActionError('');
  try{
   const result=await DB.getCounsellorHostedEvents(user.id,authSession);
   setUnavailable(!!result?.unavailable);
   setEvents(result?.events||[]);
  }catch(err){
   AuthDebug.log('[counsellor] hosted events load failed:', { message: err?.message || String(err) });
   setEvents([]);
   setUnavailable(false);
  }finally{
   setLoading(false);
  }
 };
 useEffect(()=>{if(authSession?.access_token)load();},[user.id,authSession?.access_token]);
 const updateStatus=async(event,status)=>{
  setActionError('');
  if(unavailable){setActionError(pageMeta.setupUnavailable||'Hosted events are not ready yet.');return;}
  const payload={status};
  if(status==='published')payload.published_at=new Date().toISOString();
  if(status==='archived')payload.archived_at=new Date().toISOString();
  const result=await DB.updateHostedEvent(user.id,event.id,payload,authSession);
  if(result?.unavailable){setActionError(pageMeta.setupUnavailable||'Hosted events are not ready yet.');return;}
  if(!result?.ok){setActionError('We could not update this hosted event.');return;}
  load();
 };
 return <div className="wrap counsellor-hosting-wrap">
  <Bar title={pageMeta.title||'Events hosting'} back={onBack} onSignOut={onSignOut}/>
  {invitePanel||null}
  <div className="card counsellor-hosting-intro">
   <div className="topbar"><h2>{pageMeta.title||'Events hosting'}</h2><button className="btn btn-primary btn-sm" disabled={unavailable} onClick={onNew}>{pageMeta.newEventLabel||'Host new event'}</button></div>
   <p className="sub">{pageMeta.subtitle||''}</p>
  </div>
  {unavailable?<div className="card counsellor-hosting-setup"><p className="sub">{pageMeta.setupUnavailable||'Hosted events are not ready yet. The database setup still needs to be completed.'}</p></div>:null}
  {actionError?<div className="card counsellor-hosting-error-card"><p className="sub">{actionError}</p></div>:null}
  {loading&&!unavailable?<div className="card activity-events-empty"><p className="sub">Loading hosted events…</p></div>:null}
  {!loading&&!unavailable&&events.length===0?<div className="card activity-events-empty"><p className="sub">{pageMeta.emptyList||'No hosted events yet.'}</p></div>:null}
  {!unavailable&&events.length>0?<div className="counsellor-hosted-list">
   {events.map(ev=>{
    const details=typeof enrichHostedActivityEvent==='function'?enrichHostedActivityEvent(ev):ev;
    return <article key={ev.id} className="card counsellor-hosted-item">
     <div className="counsellor-hosted-item-head">
      <span className={`counsellor-hosted-status counsellor-hosted-status--${ev.status||'draft'}`}>{hostedEventStatusLabel(ev.status,pageMeta)}</span>
      <span className="sub">{formatHostedActivityEventDate(ev)} · {ev.startTime||'—'}</span>
     </div>
     <h3>{details.activityTitle||ev.activity_id}</h3>
     <p className="sub">{ev.venueType==='online'?'Online':'In person'} · {ev.venueLabel}</p>
     <div className="counsellor-hosting-actions">
      <button type="button" className="btn btn-secondary btn-sm" onClick={()=>onEdit(ev)}>{pageMeta.editLabel||'Edit'}</button>
      {ev.status!=='published'?<button type="button" className="btn btn-primary btn-sm" onClick={()=>updateStatus(ev,'published')}>{pageMeta.publishLabel||'Publish event'}</button>:null}
      {ev.status!=='archived'?<button type="button" className="btn btn-ghost btn-sm" onClick={()=>updateStatus(ev,'archived')}>{pageMeta.archiveLabel||'Archive'}</button>:null}
     </div>
    </article>;
   })}
  </div>:null}
 </div>;
}
function appVersionTagClass(tag,status){
 const t=String(tag||'').trim().toLowerCase();
 if(t.includes('privacy')||t.includes('consent'))return 'app-version-tag app-version-tag--privacy';
 if(t.includes('security'))return 'app-version-tag app-version-tag--security';
 if(t.includes('research'))return 'app-version-tag app-version-tag--research';
 if(t.includes('decode'))return 'app-version-tag app-version-tag--decode';
 if(status==='planned')return 'app-version-tag app-version-tag--planned';
 return 'app-version-tag app-version-tag--default';
}
function appVersionValidEntry(entry){
 return entry&&String(entry.title||'').trim()&&String(entry.body||'').trim();
}
function AppVersionEntryCard({entry,planned}){
 const title=String(entry.title||'').trim();
 const body=String(entry.body||'').trim();
 const parentAction=String(entry.parentAction||'').trim();
 const tag=String(entry.tag||'').trim();
 const version=String(entry.version||'').trim();
 const date=String(entry.date||'').trim();
 const itemKey=String(entry.id||title).trim()||title;
 const status=appVersionEntryStatus(entry);
 return <article key={itemKey} className={'app-version-entry'+(planned?' app-version-entry--planned':'')}>
  <div className="app-version-meta">
   {version ? <span className="app-version-label">{version}</span> : null}
   {date ? <span className="app-version-date">{date}</span> : null}
  </div>
  {tag ? <span className={appVersionTagClass(tag,status)}>{tag}</span> : null}
  <h3 className="app-version-entry-title">{title}</h3>
  <p className="app-version-entry-body">{body}</p>
  {parentAction ? <p className="app-version-entry-action">{parentAction}</p> : null}
 </article>;
}
function AppVersionPage({back,onSignOut}){
 const versions=typeof WAYFINDER_APP_VERSIONS!=='undefined'?WAYFINDER_APP_VERSIONS:[];
 const pageMeta=typeof APP_VERSION_PAGE!=='undefined'?APP_VERSION_PAGE:{};
 const valid=Array.isArray(versions)?versions.filter(appVersionValidEntry):[];
 const released=valid.filter(e=>appVersionEntryStatus(e)==='released');
 const planned=valid.filter(e=>appVersionEntryStatus(e)==='planned');
 const pageTitle=String(pageMeta.title||'App Version').trim()||'App Version';
 const subtitle=String(pageMeta.subtitle||'').trim();
 const releasedHeading=String(pageMeta.releasedHeading||'Recent updates').trim();
 const plannedHeading=String(pageMeta.plannedHeading||'Planned').trim();
 const reassurance=String(pageMeta.reassurance||'').trim();
 const workflowNote=String(pageMeta.workflowNote||'').trim();
 return <div className="wrap">
  <Bar title={pageTitle} back={back} onSignOut={onSignOut}/>
  <div className="card dashboard-section app-version-intro">
   {subtitle ? <p className="dashboard-helper app-version-subtitle">{subtitle}</p> : null}
   {reassurance ? <p className="app-version-reassurance">{reassurance}</p> : null}
   {workflowNote ? <p className="app-version-workflow-note">{workflowNote}</p> : null}
  </div>
  {released.length>0 ? <div className="card dashboard-section app-version-section">
   <h2 className="app-version-section-title">{releasedHeading}</h2>
   <div className="app-version-list">
    {released.map(entry=><AppVersionEntryCard key={String(entry.id||entry.title)} entry={entry}/>)}
   </div>
  </div> : null}
  {planned.length>0 ? <div className="card dashboard-section app-version-section app-version-section--planned">
   <h2 className="app-version-section-title">{plannedHeading}</h2>
   <p className="dashboard-helper app-version-planned-note">These items are planned and may change as Wayfinder develops.</p>
   <div className="app-version-list">
    {planned.map(entry=><AppVersionEntryCard key={String(entry.id||entry.title)} entry={entry} planned/>)}
   </div>
  </div> : null}
  {released.length===0&&planned.length===0 ? <div className="card dashboard-section app-version-empty">
   <p className="sub">No version notes are available right now.</p>
  </div> : null}
 </div>;
}

function DecodeMomentFlow({user,parentId,authSession,dyads=[],back,onViewTrail,onShareForReview,onSaved,onSignOut}){
 const [step,setStep]=useState(0);
 const [decode,setDecode]=useState(emptyDecodeMoment);
 const [saveState,setSaveState]=useState('idle');
 const [saveError,setSaveError]=useState('');
 const [savedEntry,setSavedEntry]=useState(null);
 const [selectedChildId,setSelectedChildId]=useState(()=>dyads.length===1?dyads[0]?.childId||'':'');
 const update=(section,key,value)=>setDecode(p=>({...p,[section]:{...p[section],[key]:value}}));
 const toggle=(section,key,value)=>setDecode(p=>{
  const current=p[section][key]||[];
  const next=current.includes(value)?current.filter(v=>v!==value):[...current,value];
  return {...p,[section]:{...p[section],[key]:next}};
 });
 const setAffectIntensity=(emotion,value)=>setDecode(p=>({
  ...p,
  integrate:{...p.integrate,affectIntensity:{...p.integrate.affectIntensity,[emotion]:value}}
 }));
 const goNext=()=>setStep(s=>Math.min(s+1,DECODE_STEPS.length-1));
 const goBack=()=>setStep(s=>Math.max(s-1,0));
 const textOrEmpty=(value)=>String(value||'').trim()||'Not written yet';
 const listOrEmpty=(value)=>value&&value.length?value.join(', '):'Not selected yet';
 const affectSummary=()=>{
  const rated=Object.entries(decode.integrate.affectIntensity||{})
   .filter(([,v])=>v!==undefined&&v!==null)
   .map(([k,v])=>`${k} ${v}/5`);
  if(rated.length)return rated.join(', ');
  if(decode.locate.parentAffects.length)return decode.locate.parentAffects.join(', ');
  return 'Not selected yet';
 };
 const nextAction=[decode.navigate.nextOption,decode.navigate.nextAction.trim()].filter(Boolean).join(' - ')||'Not written yet';

 const Chip=({active,onClick,children})=><button type="button" className={'chip decode-chip'+(active?' selected':'')} onClick={onClick}>{children}</button>;
 const StepButtons=({primary})=><div className="decode-actions">
  <button type="button" className="btn btn-secondary" onClick={goBack}>Back</button>
  <button type="button" className="btn btn-primary" onClick={goNext}>{primary}</button>
 </div>;
 const Stepper=()=>step>0?<div className="decode-stepper" aria-label="Decode a Moment progress">
  {DECODE_STEPS.slice(1).map((s,i)=><div key={s.label} className={'align-step'+(step===i+1?' active':'')+(step>i+1?' done':'')}>
   <span>{s.label}</span>
   <small>{s.title}</small>
  </div>)}
 </div>:null;
 const saveDecode=async()=>{
  if(saveState==='saving')return;
  setSaveState('saving');
  setSaveError('');
  const entry=buildDecodeReminderEntry({decode,parentId,childId:selectedChildId});
  try{
   const {data:freshData}=await Auth.getFreshSession();
   const freshSession=freshData?.session||authSession;
   await DB.saveEntry(user.id,entry,freshSession);
   const savedEntries=await DB.getEntries(user.id,parentId,authSession);
   const found=(savedEntries||[]).some(saved=>String(saved.id)===String(entry.id)||saved.submittedAt===entry.submittedAt||saved.timestamp===entry.timestamp);
   if(!found)throw new Error('Saved Decode reminder was not returned by Journal Trail read.');
   setSaveState('saved');
   setSavedEntry(entry);
   if(onSaved)onSaved(entry,savedEntries);
  }catch(err){
   console.error('decode save error:',err);
   setSaveState('error');
   setSaveError('We could not save this reminder yet. Please try again.');
  }
 };

 const screen=()=>{
  if(step===0)return <div className="card decode-step-card">
   <h1>Decode a Moment</h1>
   <p className="decode-lead">Sometimes a child’s behaviour is the visible part of something they cannot yet explain. This is not about finding what is wrong with your child. It is about slowing the moment down, noticing what may have been happening for them, and noticing what happened in your thinking, feelings, and behaviour.</p>
   <div className="decode-teach">
    <h2>Why realignment matters</h2>
    <p>Stress can spill into relationships. The way we handle pressure, conflict, or urgency elsewhere can sometimes follow us home. Your child may not yet think through big emotions like an adult. Their emotional stability can strongly shape how they react in the moment. Wayfinder helps you notice where your thinking, feelings, and behaviour may need to realign with what your child was experiencing.</p>
   </div>
   <div className="decode-actions">
    <button type="button" className="btn btn-primary" onClick={goNext}>Begin</button>
    <button type="button" className="btn btn-secondary" onClick={back}>Back to Dashboard</button>
   </div>
  </div>;

  if(step===1)return <div className="card decode-step-card">
   <div className="align-kicker">A: Awareness</div>
   <h1>Awareness</h1>
   <h2>What did you notice?</h2>
   <p className="sub">Describe what happened without judging the child.</p>
   <div className="field">
    <label>What did your child do?</label>
    <textarea value={decode.awareness.observedBehaviour} onChange={e=>update('awareness','observedBehaviour',e.target.value)} />
    <p className="hint">{UI_TEXT.decode.privacyNudge}</p>
   </div>
   <div className="field">
    <label>When did this happen?</label>
    <div className="chips decode-grid">{DECODE_CONTEXT_OPTIONS.map(option=><Chip key={option} active={decode.awareness.context===option} onClick={()=>update('awareness','context',option)}>{option}</Chip>)}</div>
   </div>
   <div className="field">
    <label>What did you first notice?</label>
    <div className="chips decode-grid">{DECODE_NOTICE_OPTIONS.map(option=><Chip key={option} active={decode.awareness.initialObservation===option} onClick={()=>update('awareness','initialObservation',option)}>{option}</Chip>)}</div>
   </div>
   <StepButtons primary="Continue to Locate"/>
  </div>;

  if(step===2)return <div className="card decode-step-card">
   <div className="align-kicker">L: Locate</div>
   <h1>Locate</h1>
   <h2>What might this behaviour have been trying to solve for your child?</h2>
   <p className="sub">Choose what feels possible. This is a hypothesis, not a diagnosis.</p>
   <div className="field">
    <label>Possible need underneath the behaviour</label>
    <div className="chips decode-grid">{DECODE_NEED_OPTIONS.map(option=><Chip key={option} active={decode.locate.possibleNeeds.includes(option)} onClick={()=>toggle('locate','possibleNeeds',option)}>{option}</Chip>)}</div>
   </div>
   <div className="field">
    <label>What was happening in you at the same time?</label>
    <div className="chips decode-grid">{DECODE_PARENT_AFFECT_OPTIONS.map(option=><Chip key={option} active={decode.locate.parentAffects.includes(option)} onClick={()=>toggle('locate','parentAffects',option)}>{option}</Chip>)}</div>
   </div>
   <StepButtons primary="Continue to Integrate"/>
  </div>;

  if(step===3)return <div className="card decode-step-card">
   <div className="align-kicker">I: Integrate</div>
   <h1>Integrate</h1>
   <h2>What happened in your response?</h2>
   <p className="sub">Now connect the child's possible need with your thinking, feelings, and behaviour.</p>
   <div className="decode-grid cab-panel-grid">
    <div className="cab-panel c-cog">
     <h3>My thinking</h3>
     <label>What thought appeared in your mind?</label>
     <p className="hint">Examples: "They should know better." "We are going to be late." "This always happens." "I need to stop this now." "I am failing as a parent."</p>
     <textarea value={decode.integrate.parentCognition} onChange={e=>update('integrate','parentCognition',e.target.value)} />
    </div>
    <div className="cab-panel c-aff">
     <h3>My feelings</h3>
     <label>What did you feel emotionally or in your body?</label>
     <div className="decode-scale-list">{DECODE_INTENSITY_OPTIONS.map(emotion=><div key={emotion} className="decode-scale-row">
      <div className="decode-scale-label">{emotion}</div>
      <div className="decode-scale-options">{[0,1,2,3,4,5].map(value=><button key={value} type="button" className={'decode-scale-dot'+(decode.integrate.affectIntensity[emotion]===value?' selected':'')} onClick={()=>setAffectIntensity(emotion,value)}>{value}</button>)}</div>
     </div>)}</div>
    </div>
    <div className="cab-panel c-beh">
     <h3>My behaviour / what I did</h3>
     <label>What did you do next?</label>
     <div className="chips">{DECODE_PARENT_BEHAVIOUR_OPTIONS.map(option=><Chip key={option} active={decode.integrate.parentBehaviours.includes(option)} onClick={()=>toggle('integrate','parentBehaviours',option)}>{option}</Chip>)}</div>
    </div>
   </div>
   <StepButtons primary="Continue to Growth"/>
  </div>;

  if(step===4)return <div className="card decode-step-card">
   <div className="align-kicker">G: Growth</div>
   <h1>Growth</h1>
   <h2>What capacity might help you meet this need next time?</h2>
   <p className="sub">Growth is not about blaming yourself. It is about building alignment capacity.</p>
   <div className="field">
    <label>Capacity to practise</label>
    <div className="chips decode-grid">{DECODE_GROWTH_OPTIONS.map(option=><Chip key={option} active={decode.growth.capacities.includes(option)} onClick={()=>toggle('growth','capacities',option)}>{option}</Chip>)}</div>
   </div>
   <div className="field">
    <label>What are you becoming aware of?</label>
    <div className="chips decode-grid">{DECODE_AWARENESS_MARKERS.map(option=><Chip key={option} active={decode.growth.awarenessMarkers.includes(option)} onClick={()=>toggle('growth','awarenessMarkers',option)}>{option}</Chip>)}</div>
   </div>
   <StepButtons primary="Continue to Navigate"/>
  </div>;

  if(step===5)return <div className="card decode-step-card">
   <div className="align-kicker">N: Navigate</div>
   <h1>Navigate</h1>
   <h2>What will you try next time?</h2>
   <p className="sub">Choose one small next action. Keep it realistic.</p>
   <div className="field">
    <label>Possible next action</label>
    <div className="chips decode-grid">{DECODE_NEXT_OPTIONS.map(option=><Chip key={option} active={decode.navigate.nextOption===option} onClick={()=>update('navigate','nextOption',option)}>{option}</Chip>)}</div>
   </div>
   <div className="field">
    <label>My next action</label>
    <textarea value={decode.navigate.nextAction} onChange={e=>update('navigate','nextAction',e.target.value)} />
   </div>
   <div className="field">
    <label>Is there anything to repair with your child?</label>
    <div className="chips decode-grid">{DECODE_REPAIR_OPTIONS.map(option=><Chip key={option} active={decode.navigate.repairIntention===option} onClick={()=>update('navigate','repairIntention',option)}>{option}</Chip>)}</div>
   </div>
   <div className="field">
    <label>What will I observe next time?</label>
    <textarea value={decode.navigate.observeNextTime} onChange={e=>update('navigate','observeNextTime',e.target.value)} />
   </div>
   <StepButtons primary="Show Summary"/>
  </div>;

  return <div className="card decode-step-card">
   <div className="align-kicker">Reminder</div>
   <h1>My Alignment Reminder</h1>
   <p className="sub">Let's explore this as a reflection, not a conclusion.</p>
   {saveState==='saved'
    ? <p className="decode-note">Saved to your Journal Trail. You can return to this reminder and notice what changes over time.</p>
    : saveError
     ? <p className="decode-note">{saveError}</p>
     : null}
   <div className="decode-summary">
    <div><span>The moment I noticed</span><p>{textOrEmpty(decode.awareness.observedBehaviour)}</p></div>
    <div><span>One possible signal I explored</span><p>{[decode.awareness.initialObservation,decode.awareness.context].filter(Boolean).join(', ')||'Not selected yet'}</p></div>
    <div><span>A possible need worth staying curious about</span><p>{listOrEmpty(decode.locate.possibleNeeds)}</p></div>
    <div><span>What was happening in me</span><p><b>Thinking:</b> {textOrEmpty(decode.integrate.parentCognition)}<br/><b>Feelings:</b> {affectSummary()}<br/><b>Behaviour / What I did:</b> {listOrEmpty(decode.integrate.parentBehaviours)}</p></div>
    <div><span>Possible alignment gap</span><p>{decodeAlignmentGapText(decode)}</p></div>
    <div><span>What I want to practise</span><p>{listOrEmpty(decode.growth.capacities)}</p></div>
    <div><span>My next action</span><p>{nextAction}</p></div>
    <div><span>Repair intention</span><p>{decode.navigate.repairIntention||'Not selected yet'}</p></div>
    <div><span>What I will observe next time</span><p>{textOrEmpty(decode.navigate.observeNextTime)}</p></div>
   </div>
   <p className="decode-note">This is a reflection, not an assessment of your child.</p>
   <p className="decode-note">{UI_TEXT.decode.counsellorReminder}</p>
   {saveState!=='saved'&&(dyads.length===0
    ?<p className="decode-note" style={{color:'#b44',marginBottom:12}}>Add a child before saving this reminder to Journal Trail.</p>
    :<div className="field" style={{marginBottom:16}}>
     <label>Which child is this reminder connected to?</label>
     {dyads.length===1
      ?<p style={{marginTop:8,fontWeight:600,color:'#40514b'}}>Connected to Child ID: {dyads[0].childId}{[dyads[0].childGender,ageFrom(dyads[0].childDob,null)].filter(Boolean).length?' ('+[dyads[0].childGender,ageFrom(dyads[0].childDob,null)].filter(Boolean).join(', ')+')':''}</p>
      :<div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:8}}>{dyads.map(d=>{const meta=[d.childGender,ageFrom(d.childDob,null)].filter(Boolean);return<button type="button" key={d.childId} className={'chip decode-chip'+(selectedChildId===d.childId?' selected':'')} onClick={()=>setSelectedChildId(d.childId)}>Child ID: {d.childId}{meta.length?' · '+meta.join(', '):''}</button>;})}</div>
     }
    </div>
   )}
   <div className="decode-actions">
    {saveState==='saved' ? <>
     <button type="button" className="btn btn-primary" onClick={onViewTrail}>View Journal Trail</button>
     <button type="button" className="btn btn-secondary" onClick={()=>onShareForReview?.(savedEntry)}>{typeof PARENT_REVIEW_SHARING!=='undefined'?PARENT_REVIEW_SHARING.postSaveButtonLabel:'Share this reflection for counsellor review'}</button>
     <button type="button" className="btn btn-secondary" onClick={back}>Return to Dashboard</button>
    </> : <>
     <button type="button" className="btn btn-secondary" onClick={goBack} disabled={saveState==='saving'}>Back</button>
     <button type="button" className="btn btn-primary" onClick={saveDecode} disabled={saveState==='saving'||!selectedChildId}>{saveState==='saving'?'Saving...':'Save to Journal Trail'}</button>
    </>}
   </div>
  </div>;
 };

 return <div className="wrap decode-shell">
  <Bar title="Decode a Moment" back={back} onSignOut={onSignOut}/>
  <Stepper/>
  {screen()}
 </div>;
}

const GARDEN_ALIGN_RANK={A:1,L:2,I:3,G:4,N:5};
const GARDEN_STAGE_BY_RANK={
 0:{visual:'seed',label:'Ready to be tended'},
 1:{visual:'sprout',label:'Awareness is opening'},
 2:{visual:'leaves',label:'Curiosity is growing'},
 3:{visual:'leaves',label:'Connection is forming'},
 4:{visual:'bud',label:'A growth practice is being tended'},
 5:{visual:'bloom',label:'Repair is being practised'}
};
const gardenEntryChildId=(entry)=>{
 const bag=entry&&typeof entry==='object'?entry:{};
 const data=bag.data&&typeof bag.data==='object'?bag.data:{};
 return String(
  bag.childId||bag.child_id||bag.dyadId||bag.dyad_id||
  data.childId||data.child_id||data.dyadId||data.dyad_id||''
 ).trim();
};
const gardenActivityPhaseLetter=(entry)=>{
 if(isBehaviourDecodeEntry(entry)) return null;
 const bag=entry&&typeof entry==='object'?entry:{};
 const data=bag.data&&typeof bag.data==='object'?bag.data:{};
 const raw=String(bag.phase||bag.phaseKey||data.phase||data.phaseKey||'').trim().toUpperCase();
 return ['A','L','I','G','N'].includes(raw)?raw:null;
};
const gardenDecodeExploredLetters=(entry)=>{
 if(!isBehaviourDecodeEntry(entry)) return [];
 const align=safeObject(entry?.align)||safeObject(entry?.data?.align);
 const reminder=decodeReminderFromEntry(entry);
 const letters=[];
 const hasText=(v)=>!!String(v||'').trim();
 const hasList=(v)=>decodeList(v).length>0;
 if(hasText(reminder.observed_behaviour||reminder.moment_noticed)||hasList(reminder.awareness_signals||reminder.possible_signal_explored)) letters.push('A');
 if(hasList(reminder.possible_need_worth_staying_curious_about)||hasList(safeObject(align.locate).possible_child_need)) letters.push('L');
 if(hasText(reminder.thinking)||hasText(reminder.feelings)||hasList(reminder.behaviour_what_i_did)) letters.push('I');
 if(hasList(reminder.stabilising_response_to_practise)||hasList(safeObject(align.growth).growth_capacity)) letters.push('G');
 if(hasText(reminder.next_action)||hasText(reminder.repair_intention)||hasText(reminder.what_i_will_observe_next_time)) letters.push('N');
 return letters;
};
const deriveGardenEvidenceForChild=(childId,entries)=>{
 const target=String(childId||'').trim();
 const matched=(entries||[]).filter(e=>gardenEntryChildId(e)===target);
 const activityPhases=[...new Set(matched.map(gardenActivityPhaseLetter).filter(Boolean))];
 const decodeExplored=[...new Set(matched.flatMap(gardenDecodeExploredLetters))];
 let rank=0;
 activityPhases.forEach(phase=>{rank=Math.max(rank,GARDEN_ALIGN_RANK[phase]||0);});
 // Decode may gently suggest awareness explored only; it does not advance beyond sprout without activity practice.
 if(rank===0&&decodeExplored.includes('A')) rank=1;
 return {matched,activityPhases,decodeExplored,rank};
};
const gardenStageFromEvidence=(evidence)=>{
 const rank=evidence?.rank||0;
 const meta=GARDEN_STAGE_BY_RANK[rank]||GARDEN_STAGE_BY_RANK[0];
 return {visual:meta.visual,label:meta.label,rank};
};
const gardenDebugEnabled=()=>{try{return localStorage.getItem('wayfinder_debug_garden')==='1';}catch{return false;}};
const logGardenDebug=(childId,evidence,stage)=>{
 if(!gardenDebugEnabled()) return;
 console.log('[garden]',{
  child_id:childId,
  matched_entry_count:evidence.matched.length,
  activity_phases:evidence.activityPhases,
  decode_explored:evidence.decodeExplored,
  garden_stage:stage.visual,
  garden_rank:stage.rank
 });
};

function RelationshipGarden({dyads,entries}){
 const PLANT_COLORS=['#7FA87A','#BF8066','#8880A0','#5888B4'];
 const colorOf=(id)=>{let h=0;for(let j=0;j<id.length;j++)h=(h*31+id.charCodeAt(j))&0xffff;return PLANT_COLORS[h%PLANT_COLORS.length];};
 const stageOf=(dyad)=>{
  const childId=String(dyad.childId||dyad.child_id||'');
  const evidence=deriveGardenEvidenceForChild(childId,entries);
  const stage=gardenStageFromEvidence(evidence);
  logGardenDebug(childId,evidence,stage);
  return stage;
 };
 const renderPlant=(stage,color)=><svg viewBox="0 0 100 140" className="garden-pot-svg" aria-hidden="true" focusable="false">
  <path d="M 22 92 L 29 130 L 71 130 L 78 92 Z" fill="#C88066" stroke="#A86850" strokeWidth="1"/>
  <rect x="17" y="83" width="66" height="9" rx="4" fill="#D49070" stroke="#A86850" strokeWidth="1"/>
  <ellipse cx="50" cy="93" rx="23" ry="4" fill="#7A5438" opacity=".65"/>
  {stage==='seed'&&<ellipse cx="50" cy="86" rx="5" ry="3.5" fill={color} opacity=".84"/>}
  {stage==='sprout'&&<g>
   <line x1="50" y1="85" x2="50" y2="65" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
   <ellipse cx="41" cy="71" rx="8" ry="4.5" fill={color} opacity=".82" transform="rotate(-32 41 71)"/>
   <ellipse cx="59" cy="67" rx="8" ry="4.5" fill={color} opacity=".82" transform="rotate(32 59 67)"/>
  </g>}
  {stage==='leaves'&&<g>
   <line x1="50" y1="85" x2="50" y2="48" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
   <ellipse cx="39" cy="76" rx="9" ry="5" fill={color} opacity=".72" transform="rotate(-35 39 76)"/>
   <ellipse cx="61" cy="70" rx="9" ry="5" fill={color} opacity=".72" transform="rotate(35 61 70)"/>
   <ellipse cx="40" cy="62" rx="9" ry="4.5" fill={color} opacity=".80" transform="rotate(-28 40 62)"/>
   <ellipse cx="60" cy="56" rx="8" ry="4.5" fill={color} opacity=".80" transform="rotate(28 60 56)"/>
  </g>}
  {stage==='bud'&&<g>
   <line x1="50" y1="85" x2="50" y2="44" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
   <ellipse cx="40" cy="72" rx="8" ry="4.5" fill={color} opacity=".70" transform="rotate(-32 40 72)"/>
   <ellipse cx="60" cy="66" rx="8" ry="4.5" fill={color} opacity=".70" transform="rotate(32 60 66)"/>
   <ellipse cx="50" cy="36" rx="9" ry="12" fill={color} opacity=".88"/>
   <ellipse cx="50" cy="33" rx="5.5" ry="4.5" fill="#F9F2E4" opacity=".9"/>
  </g>}
  {stage==='bloom'&&<g>
   <line x1="50" y1="85" x2="50" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
   <ellipse cx="39" cy="76" rx="8" ry="4.5" fill={color} opacity=".65" transform="rotate(-32 39 76)"/>
   <ellipse cx="61" cy="70" rx="8" ry="4.5" fill={color} opacity=".65" transform="rotate(32 61 70)"/>
   {[0,72,144,216,288].map((deg,i)=>{const rad=deg*Math.PI/180;const px=50+Math.sin(rad)*14;const py=32-Math.cos(rad)*14;return <circle key={i} cx={px} cy={py} r="10" fill={color} opacity=".84" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>;})}
   <circle cx="50" cy="32" r="7.5" fill="#F9F2E4" stroke={color} strokeWidth="1.5"/>
  </g>}
 </svg>;
 if(!dyads||dyads.length===0) return null;
 return <div className="card garden-card" role="region" aria-label="Your Relationship Garden">
  <div className="garden-header">
   <h2>Your Relationship Garden</h2>
   <p className="dashboard-helper">Each relationship can be tended through pause, reflection, repair, and ALIGN.</p>
  </div>
  <div className="garden-pots" role="list">
   {dyads.map((dyad,i)=>{
    const childId=String(dyad.childId||dyad.child_id||'');
    const color=colorOf(childId||String(i));
    const stage=stageOf(dyad);
    const stageLabel=stage.label;
    const meta=[dyad.childGender,ageFrom(dyad.childDob,null)].filter(Boolean).join(' · ');
    return <div key={childId||i} className="garden-pot" role="listitem" style={{'--pot-i':i}}
     aria-label={'Relationship tended with Child ID '+childId+': '+stageLabel}>
     {renderPlant(stage.visual,color)}
     <div className="garden-pot-id">Child ID: {childId||'—'}</div>
     {meta&&<div className="garden-pot-meta">{meta}</div>}
     <div className="garden-pot-stage">{stageLabel}</div>
    </div>;
   })}
  </div>
  <div className="garden-guide" aria-label="How the garden grows">
   <span className="garden-guide-title">How the garden grows</span>
   <span className="garden-guide-steps">Seed → Sprout → Leaves → Bud → Bloom</span>
  </div>
  <p className="garden-foot">Growth here does not mean perfection. It means the relationship is being tended with more steadiness and repair.</p>
 </div>;
}

const parentCounsellorFeedbackMeta=()=>(typeof PARENT_COUNSELLOR_FEEDBACK!=='undefined'?PARENT_COUNSELLOR_FEEDBACK:{});
const signupPrivacyAcknowledgementMeta=()=>(typeof SIGNUP_PRIVACY_ACKNOWLEDGEMENT!=='undefined'?SIGNUP_PRIVACY_ACKNOWLEDGEMENT:{});
const signupPrivacyNoticeMeta=()=>(typeof PDPA_SIGNUP_NOTICE!=='undefined'?PDPA_SIGNUP_NOTICE:{});
const buildSignupPrivacyConsentSnapshot=(notice)=>{
 const title=String(notice?.title||'').trim();
 const body=String(notice?.body||'').trim();
 const checkbox=String(notice?.checkboxLabel||'').trim();
 const parts=[];
 if(title) parts.push(`Title: ${title}`);
 if(body) parts.push(`Body: ${body}`);
 if(checkbox) parts.push(`Checkbox: ${checkbox}`);
 return parts.join('\n\n');
};

const isGenericCounsellorDisplayLabel=(label)=>{
 const t=String(label||'').trim();
 if(!t) return true;
 if(/^Counsellor\s+[A-Z]\s*[·:.]\s*/i.test(t)) return true;
 if(/^Counsellor\s*[·:.]\s*/i.test(t)) return true;
 return false;
};
const isUnsafePractitionerDisplayValue=(value)=>{
 const t=String(value||'').trim();
 if(!t) return true;
 if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return true;
 if(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t)) return true;
 return false;
};
const pickSafePractitionerDisplayValue=(...values)=>{
 for(const value of values){
  const t=String(value||'').trim();
  if(t&&!isUnsafePractitionerDisplayValue(t)) return t;
 }
 return '';
};
const practitionerNameFromDisplayLabel=(label,wayfinderId)=>{
 const raw=String(label||'').trim();
 const wid=String(wayfinderId||'').trim();
 if(!raw||isGenericCounsellorDisplayLabel(raw)) return '';
 if(wid){
  const withoutId=raw.replace(new RegExp('\\s*[·:.]\\s*'+wid.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$'),'').trim();
  if(withoutId&&!isGenericCounsellorDisplayLabel(withoutId)&&withoutId!==wid&&!isUnsafePractitionerDisplayValue(withoutId)) return withoutId;
 }
 if(!isGenericCounsellorDisplayLabel(raw)&&raw!==wid&&!isUnsafePractitionerDisplayValue(raw)) return raw;
 return '';
};
const practitionerSelectOptionLabel=(row)=>{
 const wid=String(row?.wayfinder_id||row?.wayfinderId||'').trim();
 const fullName=pickSafePractitionerDisplayValue(row?.full_name,row?.fullName);
 const professionalTitle=pickSafePractitionerDisplayValue(row?.professional_title,row?.professionalTitle,row?.credential_label,row?.credentialLabel);
 const organizationName=pickSafePractitionerDisplayValue(row?.institution_name,row?.institutionName,row?.organization_name,row?.organizationName);
 const profileName=pickSafePractitionerDisplayValue(row?.display_name,row?.displayName,row?.profile_name,row?.profileName,row?.name);
 const labelName=practitionerNameFromDisplayLabel(row?.display_label||row?.displayLabel,wid);
 if(fullName) return fullName;
 if(professionalTitle) return professionalTitle;
 if(organizationName) return organizationName;
 if(profileName) return profileName;
 if(labelName) return labelName;
 return wid?('Mental Health Professional '+wid):'Mental Health Professional';
};

const formatCounsellorFeedbackDate=(value)=>{
 const dt=parseStoredDate(value);
 if(!dt||isNaN(dt)) return '-';
 return dt.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'});
};

function SignupPrivacyAcknowledgement({meta,loading,showBanner,submitting,successMessage,errorMessage,fetchFailed,onAcknowledge,onRetry}){
 if(loading) return null;
 if(successMessage){
  return <div className="card review-share-notice privacy-ack-notice" role="status">{successMessage}</div>;
 }
 if(showBanner){
  return <div className="card parent-feedback-notification privacy-ack-banner">
   <div className="parent-feedback-notification-copy">
    <p className="pill parent-feedback-notification-pill">Privacy</p>
    <h2>{meta.title||'Privacy and data-use acknowledgement'}</h2>
    <p className="dashboard-helper">{meta.body||''}</p>
    <p className="review-share-expiry">{meta.secondaryNote||'You can keep using Wayfinder while this is shown.'}</p>
    {errorMessage ? <p className="review-share-error" role="alert">{errorMessage}</p> : null}
   </div>
   <button type="button" className="btn btn-primary" disabled={submitting} onClick={onAcknowledge}>
    {submitting?'Saving…':(meta.button||'Acknowledge')}
   </button>
  </div>;
 }
 if(fetchFailed&&errorMessage){
  return <div className="card review-share-notice review-share-notice--legacy privacy-ack-notice" role="status">
   <p className="dashboard-helper" style={{margin:0}}>{errorMessage}</p>
   {onRetry ? <button type="button" className="btn btn-ghost btn-sm" style={{marginTop:10}} onClick={onRetry}>{meta.retryButton||'Try again'}</button> : null}
  </div>;
 }
 return null;
}

function ParentCounsellorFeedbackNotification({meta,loading,available,unreadCount,unreadRows,onOpenFeedback}){
 if(loading||!available||!unreadCount) return null;
 const badgeLabel=unreadCount===1
  ? (meta.notificationBadgeSingular||'1 unread reflection')
  : `${unreadCount}${meta.notificationBadgePlural||' unread reflections'}`;
 return <div className="card parent-feedback-notification">
  <div className="parent-feedback-notification-copy">
   <p className="pill parent-feedback-notification-pill">{badgeLabel}</p>
   <h2>{meta.notificationTitle||'Counsellor feedback to review'}</h2>
   <p className="dashboard-helper">{meta.notificationSubtitle||'Your counsellor has shared a contextual reflection on entries you chose to share.'}</p>
   {unreadRows.length>0 && <ul className="parent-feedback-notification-list">
    {unreadRows.slice(0,3).map(row=><li key={row.responseId}>
     <button type="button" className="parent-feedback-notification-link" onClick={()=>onOpenFeedback(row.responseId)}>
      {row.contextLabel||meta.openFeedbackButton||'Read counsellor feedback'}
      {row.publishedAt ? <span className="parent-feedback-notification-date"> · {formatCounsellorFeedbackDate(row.publishedAt)}</span> : null}
     </button>
    </li>)}
   </ul>}
  </div>
  {unreadRows[0]?.responseId && <button type="button" className="btn btn-primary" onClick={()=>onOpenFeedback(unreadRows[0].responseId)}>
   {meta.openFeedbackButton||'Read counsellor feedback'}
  </button>}
 </div>;
}

function ParentCounsellorFeedbackLibrary({meta,loading,available,rows,unreadResponseIds,entries,entryTitle,entryDateValue,onOpenFeedback}){
 if(loading||!available||!rows.length) return null;
 const unreadSet=new Set((unreadResponseIds||[]).map(id=>String(id)));
 const sortedRows=[...rows].sort((a,b)=>{
  const ta=parseStoredDate(a.publishedAt)?.getTime()||0;
  const tb=parseStoredDate(b.publishedAt)?.getTime()||0;
  return tb-ta;
 });
 const contextLabelForRow=(row)=>{
  if(row.contextLabel) return row.contextLabel;
  const journalEntryId=row.journalEntryId;
  if(journalEntryId&&entries?.length){
   const entry=entries.find(e=>String(e.id)===String(journalEntryId));
   if(entry){
    const title=entryTitle?entryTitle(entry):'Wayfinder activity';
    const date=entryDateValue?entryDateValue(entry):entry?.date;
    return `${title} · ${formatCounsellorFeedbackDate(date)}`;
   }
  }
  return meta.feedbackLibraryTitle||'Counsellor feedback';
 };
 return <div className="card parent-feedback-library">
  <div className="parent-feedback-library-head">
   <div>
    <h2>{meta.feedbackLibraryTitle||'Counsellor feedback'}</h2>
    <p className="dashboard-helper">{meta.feedbackLibrarySubtitle||'Feedback your counsellor has shared on entries you chose to share.'}</p>
   </div>
   <span className="pill parent-feedback-library-count">{sortedRows.length} {sortedRows.length===1?'item':'items'}</span>
  </div>
  <ul className="parent-feedback-library-list">
   {sortedRows.map(row=>{
    const responseId=row.responseId?String(row.responseId):'';
    if(!responseId) return null;
    const isNew=unreadSet.has(responseId);
    const statusLabel=isNew?(meta.feedbackStatusNew||'New'):(meta.feedbackStatusAvailable||'Available');
    return <li key={responseId} className="parent-feedback-library-item">
     <div className="parent-feedback-library-item-copy">
      <div className="parent-feedback-library-item-title">{contextLabelForRow(row)}</div>
      <div className="parent-feedback-library-item-meta">
       {row.publishedAt ? <span>{meta.publishedLabel||'Published'}: {formatCounsellorFeedbackDate(row.publishedAt)}</span> : null}
       <span className={'parent-feedback-library-status parent-feedback-library-status--'+(isNew?'new':'available')} aria-label={'Feedback status: '+statusLabel}>{statusLabel}</span>
      </div>
     </div>
     <button type="button" className="btn btn-secondary parent-feedback-library-open" onClick={()=>onOpenFeedback(responseId)}>
      {meta.feedbackLibraryOpen||'Open feedback'}
     </button>
    </li>;
   })}
  </ul>
 </div>;
}

function ParentCounsellorFeedbackReader({user,authSession,responseId,entries,entryTitle,entryDateValue,meta,onBack,onMarkedRead,onSignOut}){
 const [loading,setLoading]=useState(true);
 const [available,setAvailable]=useState(false);
 const [detail,setDetail]=useState(null);
 const [loadError,setLoadError]=useState('');
 const [markReadError,setMarkReadError]=useState('');
 const [markingRead,setMarkingRead]=useState(false);
 const [reflectionText,setReflectionText]=useState('');
 const [reflectionStatus,setReflectionStatus]=useState('');
 const [savingReflection,setSavingReflection]=useState(false);

 const fmtEntryDate=(value)=>{
  const dt=parseStoredDate(value);
  if(!dt||isNaN(dt)) return '-';
  return dt.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'});
 };

 const linkedEntryLabel=(journalEntryId)=>{
  const entry=(entries||[]).find(e=>String(e.id)===String(journalEntryId));
  if(!entry) return meta.sharedEntryFallbackLabel||'Shared reflection';
  const title=entryTitle?entryTitle(entry):'Wayfinder activity';
  const date=entryDateValue?entryDateValue(entry):entry?.date;
  return `${title} · ${fmtEntryDate(date)}`;
 };

 const loadDetail=async()=>{
  setLoading(true);
  setLoadError('');
  setMarkReadError('');
  setReflectionStatus('');
  try{
   const result=await DB.getParentCounsellorFeedbackDetail(user.id,responseId,authSession);
   if(!result.available){
    setAvailable(false);
    setDetail(null);
    setLoadError(meta.unavailable||'Counsellor feedback is not available yet. Your journal and shared reflections remain unchanged.');
    return;
   }
   setAvailable(true);
   setDetail(result.detail||null);
   if(!result.detail){
    setLoadError(meta.detailUnavailable||'This counsellor feedback could not be loaded right now.');
   }
  }catch(err){
   setAvailable(false);
   setDetail(null);
   setLoadError(meta.unavailable||'Counsellor feedback is not available yet. Your journal and shared reflections remain unchanged.');
   AuthDebug.log('[parent feedback] detail load failed:', { message: err?.message || String(err) });
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{ if(responseId&&authSession?.access_token) loadDetail(); },[user?.id,responseId,authSession?.access_token]);

 useEffect(()=>{
  if(!detail?.responseId||!responseId||!authSession?.access_token) return;
  let cancelled=false;
  (async()=>{
   try{
    const result=await DB.getParentCounsellorFeedbackReflection(user.id,responseId,authSession);
    if(!cancelled&&result.available&&result.reflection){
     setReflectionText(result.reflection.reflectionText||'');
    }
   }catch(err){
    AuthDebug.log('[parent feedback] reflection load failed:', { message: err?.message || String(err) });
   }
  })();
  return ()=>{ cancelled=true; };
 },[detail?.responseId,responseId,user?.id,authSession?.access_token]);

 const handleMarkRead=async()=>{
  if(!responseId||detail?.isRead||markingRead) return;
  setMarkingRead(true);
  setMarkReadError('');
  try{
   const result=await DB.markParentCounsellorFeedbackRead(user.id,responseId,authSession);
   if(!result.available||!result.ok){
    setMarkReadError(meta.markReadError||'Mark as read could not be completed right now. Your counsellor feedback remains visible.');
    return;
   }
   setDetail(prev=>prev?({...prev,isRead:true,readAt:result.readAt||prev.readAt}):prev);
   onMarkedRead?.();
  }catch(err){
   setMarkReadError(meta.markReadError||'Mark as read could not be completed right now. Your counsellor feedback remains visible.');
   AuthDebug.log('[parent feedback] mark read failed:', { message: err?.message || String(err) });
  }finally{
   setMarkingRead(false);
  }
 };

 const handleSaveReflection=async()=>{
  if(!responseId||savingReflection) return;
  setSavingReflection(true);
  setReflectionStatus('saving');
  try{
   const result=await DB.saveParentCounsellorFeedbackReflection(user.id,responseId,reflectionText,authSession);
   if(!result.available||!result.ok){
    setReflectionStatus('error');
    return;
   }
   setReflectionStatus('saved');
  }catch(err){
   setReflectionStatus('error');
   AuthDebug.log('[parent feedback] reflection save failed:', { message: err?.message || String(err) });
  }finally{
   setSavingReflection(false);
  }
 };

 const journalEntryId=detail?.journalEntryId||detail?.linkedGrantEntries?.[0]?.journalEntryId||detail?.linkedJournalEntryIds?.[0]||null;

 if(loading) return <div className="wrap"><div className="card parent-feedback-reader"><p className="sub">Loading counsellor feedback…</p></div></div>;

 return <div className="wrap parent-feedback-reader-wrap">
  <Bar title={meta.readerTitle||'Counsellor feedback'} back={onBack} onSignOut={onSignOut}/>
  <div className="card parent-feedback-reader">
   {!available || !detail ? <p className="sub parent-feedback-unavailable">{loadError||meta.unavailable}</p> : <>
    <p className="parent-feedback-reader-intro sub">{meta.readerIntro||'This reflection relates only to the Wayfinder entries you chose to share.'}</p>
    <div className="parent-feedback-confidentiality">
     <h3>Context and confidentiality</h3>
     <p>{meta.confidentialityNotice}</p>
    </div>
    <div className="parent-feedback-meta-row">
     {detail.counsellorWayfinderId ? <span className="pill">{meta.counsellorLabelPrefix||'Counsellor'} · {detail.counsellorWayfinderId}</span> : null}
     {detail.publishedAt ? <span className="sub">{meta.publishedLabel||'Published'}: {formatCounsellorFeedbackDate(detail.publishedAt)}</span> : null}
     {detail.isRead ? <span className="pill parent-feedback-read-pill">{meta.markReadDone||'Marked as read'}</span> : null}
    </div>
    {journalEntryId ? <p className="sub parent-feedback-linked-entry">{linkedEntryLabel(journalEntryId)}</p> : null}
    <div className="parent-feedback-body">
     <pre className="parent-feedback-text">{detail.parentFacingText||''}</pre>
    </div>
    {!detail.isRead && <div className="parent-feedback-mark-read">
     <p className="sub">{meta.markReadHelper}</p>
     <button type="button" className="btn btn-primary" disabled={markingRead} onClick={handleMarkRead}>
      {markingRead?(meta.markReadSaving||'Marking as read…'):(meta.markReadButton||'Mark as read')}
     </button>
     {markReadError ? <p className="parent-feedback-error">{markReadError}</p> : null}
    </div>}
    <div className="parent-feedback-reflections">
     <h3>{meta.reflectionSectionTitle||'My reflection after reading this feedback'}</h3>
     <label className="parent-feedback-reflection-field">
      <textarea
       rows={4}
       value={reflectionText}
       placeholder={meta.reflectionPlaceholder||'Your private reflection — only you can see this.'}
       onChange={ev=>{ setReflectionText(ev.target.value); if(reflectionStatus==='saved') setReflectionStatus(''); }}
      />
     </label>
     <div className="parent-feedback-reflection-actions">
      <button type="button" className="btn btn-secondary" disabled={savingReflection} onClick={handleSaveReflection}>
       {savingReflection?(meta.reflectionSaving||'Saving…'):(meta.reflectionSaveButton||'Save my reflection')}
      </button>
      {reflectionStatus==='saved' && <span className="parent-feedback-reflection-status">{meta.reflectionSaved||'Saved'}</span>}
      {reflectionStatus==='error' && <span className="parent-feedback-reflection-status parent-feedback-reflection-status--error">{meta.reflectionError||'Your reflection could not be saved right now.'}</span>}
     </div>
    </div>
   </>}
  </div>
 </div>;
}

const parentSignupInviteMeta=()=>typeof PARENT_SIGNUP_INVITE!=='undefined'?PARENT_SIGNUP_INVITE:{};

const wayfinderParentSignupLink=()=>{
 try{return new URL('index.html',window.location.origin+'/').toString();}
 catch(_){return 'index.html';}
};

function ParentSignupInviteModal({open,context,onClose}){
 const meta=parentSignupInviteMeta();
 const [copyState,setCopyState]=useState('');
 const link=useMemo(()=>wayfinderParentSignupLink(),[]);
 const isCounsellor=String(context||'').toLowerCase()==='counsellor';
 const title=isCounsellor
  ? (meta.modalTitleCounsellor||'Invite parents to Wayfinder')
  : (meta.modalTitleParent||'Invite another parent');

 useEffect(()=>{if(!open) setCopyState('');},[open]);

 useEffect(()=>{
  if(!open) return undefined;
  const onKey=(event)=>{if(event.key==='Escape') onClose();};
  window.addEventListener('keydown',onKey);
  return ()=>window.removeEventListener('keydown',onKey);
 },[open,onClose]);

 if(!open) return null;

 const copyLink=async()=>{
  try{
   if(navigator.clipboard&&navigator.clipboard.writeText){
    await navigator.clipboard.writeText(link);
    setCopyState('copied');
    return;
   }
  }catch(_){}
  try{
   const input=document.createElement('textarea');
   input.value=link;
   input.setAttribute('readonly','');
   input.style.position='absolute';
   input.style.left='-9999px';
   document.body.appendChild(input);
   input.select();
   document.execCommand('copy');
   document.body.removeChild(input);
   setCopyState('copied');
  }catch(_){
   setCopyState('failed');
  }
 };

 const shareLink=async()=>{
  if(!navigator.share){
   setCopyState('share-unavailable');
   await copyLink();
   return;
  }
  try{
   await navigator.share({
    title: meta.shareTitle||'Join Wayfinder',
    text: meta.shareText||'Create your Wayfinder parent account using this link.',
    url: link
   });
  }catch(err){
   if(err&&err.name==='AbortError') return;
   setCopyState('share-unavailable');
  }
 };

 return <div className="invite-share-overlay" role="presentation" onClick={onClose}>
  <div className="invite-share-modal card" role="dialog" aria-modal="true" aria-labelledby="invite-share-title" onClick={(event)=>event.stopPropagation()}>
   <div className="invite-share-head">
    <h2 id="invite-share-title">{title}</h2>
    <button type="button" className="btn btn-ghost btn-sm invite-share-close" onClick={onClose}>{meta.closeButton||'Close'}</button>
   </div>
   <p className="dashboard-helper invite-share-intro">{meta.modalIntro||'Share the parent signup link below. This is only the Wayfinder parent entry point.'}</p>
   <p className="sub invite-share-privacy">{meta.privacyNote||'No referral tracking, automatic journal sharing, professional account creation, or counsellor provisioning is included.'}</p>
   <label className="field invite-share-link-field">
    <span>{meta.linkLabel||'Parent signup link'}</span>
    <input type="text" className="invite-share-link-input" readOnly value={link} onFocus={(event)=>event.target.select()}/>
   </label>
   <div className="invite-share-actions">
    <button type="button" className="btn btn-primary" onClick={copyLink}>{copyState==='copied'?(meta.copiedButton||'Link copied'):(meta.copyButton||'Copy link')}</button>
    {typeof navigator!=='undefined'&&typeof navigator.share==='function'
     ? <button type="button" className="btn btn-secondary" onClick={shareLink}>{meta.shareButton||'Share link'}</button>
     : null}
   </div>
   {copyState==='share-unavailable' ? <p className="sub invite-share-status">{meta.shareUnavailable||'Copy the link below to share it manually.'}</p> : null}
  </div>
 </div>;
}

const mhpProfessionalInviteMeta=()=>typeof MENTAL_HEALTH_PROFESSIONAL_INVITE_REQUEST!=='undefined'?MENTAL_HEALTH_PROFESSIONAL_INVITE_REQUEST:{};

// Admin-mediated only: local draft text, clipboard, and mailto. No signup link, invite token, Supabase write, role change, membership, or profile publication.
function MentalHealthProfessionalInviteRequestModal({open,onClose}){
 const meta=mhpProfessionalInviteMeta();
 const [form,setForm]=useState({colleagueName:'',colleagueEmail:'',note:''});
 const [copyState,setCopyState]=useState('');

 useEffect(()=>{
  if(!open){
   setForm({colleagueName:'',colleagueEmail:'',note:''});
   setCopyState('');
  }
 },[open]);

 useEffect(()=>{
  if(!open) return undefined;
  const onKey=(event)=>{if(event.key==='Escape') onClose();};
  window.addEventListener('keydown',onKey);
  return ()=>window.removeEventListener('keydown',onKey);
 },[open,onClose]);

 if(!open) return null;

 const buildRequestDraft=()=>{
  const lines=[
   meta.requestDraftIntro||'Wayfinder Mental Health Professional invitation request',
   '',
   `${meta.fieldColleagueName||'Colleague name'}: ${String(form.colleagueName||'').trim()||'-'}`,
   `${meta.fieldColleagueEmail||'Colleague email'}: ${String(form.colleagueEmail||'').trim()||'-'}`,
   ...(String(form.note||'').trim()?[`${meta.fieldNote||'Optional note for Wayfinder admin'}: ${String(form.note||'').trim()}`]:[]),
   '',
   meta.requestDraftFooter||'Please review and send a Wayfinder admin invitation to this colleague if appropriate.'
  ];
  return lines.join('\n');
 };

 const copyRequest=async()=>{
  const draft=buildRequestDraft();
  try{
   if(navigator.clipboard&&navigator.clipboard.writeText){
    await navigator.clipboard.writeText(draft);
    setCopyState('copied');
    return;
   }
  }catch(_){}
  try{
   const input=document.createElement('textarea');
   input.value=draft;
   input.setAttribute('readonly','');
   input.style.position='absolute';
   input.style.left='-9999px';
   document.body.appendChild(input);
   input.select();
   document.execCommand('copy');
   document.body.removeChild(input);
   setCopyState('copied');
  }catch(_){
   setCopyState('failed');
  }
 };

 const emailAdmin=()=>{
  const subject=meta.requestDraftIntro||'Wayfinder Mental Health Professional invitation request';
  const body=buildRequestDraft();
  window.location.href=`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 };

 const setField=(key,value)=>setForm((prev)=>({...prev,[key]:value}));

 return <div className="invite-share-overlay" role="presentation" onClick={onClose}>
  <div className="invite-share-modal invite-request-modal card" role="dialog" aria-modal="true" aria-labelledby="mhp-invite-request-title" onClick={(event)=>event.stopPropagation()}>
   <div className="invite-share-head">
    <h2 id="mhp-invite-request-title">{meta.modalTitle||'Invite counsellors to Wayfinder'}</h2>
    <button type="button" className="btn btn-ghost btn-sm invite-share-close" onClick={onClose}>{meta.closeButton||'Close'}</button>
   </div>
   <p className="dashboard-helper invite-share-intro">{meta.modalIntro||'Mental Health Professional accounts are created by Wayfinder administrator invitation only.'}</p>
   <p className="invite-request-note">{meta.modalAdminNote||'There is no public counsellor or Mental Health Professional signup link.'}</p>
   <div className="invite-request-fields">
    <label className="field"><span>{meta.fieldColleagueName||'Colleague name'}</span><input type="text" value={form.colleagueName} onChange={(event)=>setField('colleagueName',event.target.value)}/></label>
    <label className="field"><span>{meta.fieldColleagueEmail||'Colleague email'}</span><input type="email" value={form.colleagueEmail} onChange={(event)=>setField('colleagueEmail',event.target.value)}/></label>
    <label className="field"><span>{meta.fieldNote||'Optional note for Wayfinder admin'}</span><textarea rows={3} value={form.note} onChange={(event)=>setField('note',event.target.value)}/></label>
   </div>
   <div className="invite-share-actions">
    <button type="button" className="btn btn-primary" onClick={copyRequest}>{copyState==='copied'?(meta.copiedRequestButton||'Request message copied'):(meta.copyRequestButton||'Copy request message')}</button>
    <button type="button" className="btn btn-secondary" onClick={emailAdmin}>{meta.emailAdminButton||'Email Wayfinder admin'}</button>
   </div>
  </div>
 </div>;
}

function MentalHealthProfessionalInvitePanel({inviteShareMeta,professionalInviteMeta,onInviteParents,onInviteProfessionals}){
 const parentMeta=inviteShareMeta||parentSignupInviteMeta();
 const professionalMeta=professionalInviteMeta||mhpProfessionalInviteMeta();
 return <div className="card mhp-invite-panel">
  <h2>{professionalMeta.panelTitle||'Invite others to Wayfinder'}</h2>
  <p className="mhp-invite-panel-intro">{professionalMeta.panelIntro||'Share the parent signup link with parents you know. Mental Health Professional colleagues must be invited by the Wayfinder administrator.'}</p>
  <div className="mhp-invite-panel-actions">
   <button type="button" className="btn btn-secondary" title={professionalMeta.parentButtonTitle||parentMeta.counsellorButtonTitle||'Share only the Wayfinder parent signup link.'} onClick={onInviteParents}>{professionalMeta.parentButtonLabel||parentMeta.counsellorButtonLabel||'Invite parents to Wayfinder'}</button>
   <button type="button" className="btn btn-ghost" title={professionalMeta.professionalButtonTitle||'Prepare an admin invitation request.'} onClick={onInviteProfessionals}>{professionalMeta.professionalButtonLabel||'Invite counsellors to Wayfinder'}</button>
  </div>
 </div>;
}

function ClientApp({back,user,parentId,profile,authReady,authSession,onSignOut}){
 const [dyads,setDyads]=useState([]);
 const [dyad,setDyad]=useState(null);
 const [entries,setEntries]=useState([]);
 const [aiInsight,setAiInsight]=useState('');
 const [insightLoading,setInsightLoading]=useState(false);
 const [discBars,setDiscBars]=useState(null);
 const [stage,setStage]=useState('loading'); // loading | dashboard | decode | selectChild | register | trail | counsellorFeedback | appVersion | events | journal | done
 const [trailShareEntryId,setTrailShareEntryId]=useState(null);
 const [trailScrollToShare,setTrailScrollToShare]=useState(false);
 const [lastSavedEntryId,setLastSavedEntryId]=useState(null);
 const [activeFeedbackResponseId,setActiveFeedbackResponseId]=useState(null);
 const [feedbackNotice,setFeedbackNotice]=useState({loading:false,available:false,unreadCount:0,rows:[]});
 const [feedbackLibrary,setFeedbackLibrary]=useState({loading:false,available:false,rows:[]});
 const feedbackMeta=parentCounsellorFeedbackMeta();
 const inviteShareMeta=parentSignupInviteMeta();
 const privacyAckMeta=signupPrivacyAcknowledgementMeta();
 const privacyNotice=signupPrivacyNoticeMeta();
 const privacyNoticeVersion=String(privacyNotice.version||'').trim();
 const [inviteShareOpen,setInviteShareOpen]=useState(false);
 const [privacyAck,setPrivacyAck]=useState({loading:true,showBanner:false,submitting:false,successMessage:'',errorMessage:'',fetchFailed:false});

 const refreshSignupPrivacyAcknowledgement=async()=>{
  if(!user?.id||!authSession?.access_token||!privacyNoticeVersion){
   setPrivacyAck({loading:false,showBanner:false,submitting:false,successMessage:'',errorMessage:'',fetchFailed:false});
   return;
  }
  setPrivacyAck(prev=>({...prev,loading:true,successMessage:'',errorMessage:'',fetchFailed:false}));
  try{
   const result=await DB.hasAcceptedSignupPrivacyConsent(user.id,privacyNoticeVersion,authSession);
   if(result.unavailable||!result.ok){
    setPrivacyAck({
     loading:false,
     showBanner:false,
     submitting:false,
     successMessage:'',
     errorMessage:privacyAckMeta.fetchFailureMessage||privacyAckMeta.failureMessage||'',
     fetchFailed:true
    });
    return;
   }
   if(result.accepted){
    setPrivacyAck({loading:false,showBanner:false,submitting:false,successMessage:'',errorMessage:'',fetchFailed:false});
    return;
   }
   setPrivacyAck({loading:false,showBanner:true,submitting:false,successMessage:'',errorMessage:'',fetchFailed:false});
  }catch(err){
   AuthDebug.log('[privacy ack] fetch failed:', { message: err?.message || String(err) });
   setPrivacyAck({
    loading:false,
    showBanner:false,
    submitting:false,
    successMessage:'',
    errorMessage:privacyAckMeta.fetchFailureMessage||privacyAckMeta.failureMessage||'',
    fetchFailed:true
   });
  }
 };

 const acknowledgeSignupPrivacy=async()=>{
  if(!user?.id||!authSession?.access_token||!privacyNoticeVersion) return;
  const snapshot=buildSignupPrivacyConsentSnapshot(privacyNotice);
  if(!snapshot.trim()) return;
  setPrivacyAck(prev=>({...prev,submitting:true,errorMessage:''}));
  try{
   const result=await DB.insertSignupPrivacyConsent(user.id,parentId,{
    consentVersion:privacyNoticeVersion,
    consentTextSnapshot:snapshot,
    sourcePage:'dashboard_privacy_acknowledgement'
   },authSession);
   if(result.ok){
    setPrivacyAck({
     loading:false,
     showBanner:false,
     submitting:false,
     successMessage:privacyAckMeta.successMessage||'Privacy acknowledgement saved.',
     errorMessage:'',
     fetchFailed:false
    });
    return;
   }
   setPrivacyAck(prev=>({
    ...prev,
    submitting:false,
    errorMessage:privacyAckMeta.failureMessage||'We could not save this acknowledgement right now. You can keep using Wayfinder and try again later.'
   }));
  }catch(err){
   AuthDebug.log('[privacy ack] insert failed:', { message: err?.message || String(err) });
   setPrivacyAck(prev=>({
    ...prev,
    submitting:false,
    errorMessage:privacyAckMeta.failureMessage||'We could not save this acknowledgement right now. You can keep using Wayfinder and try again later.'
   }));
  }
 };

 const refreshFeedbackNotice=async()=>{
  if(!user?.id||!authSession?.access_token){
   setFeedbackNotice({loading:false,available:false,unreadCount:0,rows:[]});
   setFeedbackLibrary({loading:false,available:false,rows:[]});
   return;
  }
  setFeedbackNotice(prev=>({...prev,loading:true}));
  setFeedbackLibrary(prev=>({...prev,loading:true}));
  try{
   const [countResult,summaryResult,publishedResult]=await Promise.all([
    DB.getParentUnreadCounsellorFeedbackCount(user.id,authSession),
    DB.getParentUnreadCounsellorFeedbackSummary(user.id,authSession),
    DB.getParentPublishedReviewResponses(user.id,null,authSession).catch(err=>{
     AuthDebug.log('[parent feedback] library load failed:', { message: err?.message || String(err) });
     return { rows: [], unavailable: true };
    })
   ]);
   if(!countResult.available){
    setFeedbackNotice({loading:false,available:false,unreadCount:0,rows:[]});
   }else{
    setFeedbackNotice({
     loading:false,
     available:!!summaryResult.available,
     unreadCount:countResult.count||0,
     rows:summaryResult.available?(summaryResult.rows||[]):[]
    });
   }
   if(publishedResult.unavailable){
    setFeedbackLibrary({loading:false,available:false,rows:[]});
   }else{
    setFeedbackLibrary({
     loading:false,
     available:true,
     rows:publishedResult.rows||[]
    });
   }
  }catch(err){
   AuthDebug.log('[parent feedback] notice load failed:', { message: err?.message || String(err) });
   setFeedbackNotice({loading:false,available:false,unreadCount:0,rows:[]});
   setFeedbackLibrary({loading:false,available:false,rows:[]});
  }
 };

 const openCounsellorFeedback=(responseId)=>{
  if(!responseId) return;
  setActiveFeedbackResponseId(String(responseId));
  setStage('counsellorFeedback');
 };

 const blankDyad=()=>({childId:'',parentDob:'',childDob:'',parentGender:'',childGender:'',disc:'',ethnicity:'Chinese'});
 const entryDateValue=(entry)=>firstStoredDateValue(entry?.timestamp,entry?.submittedAt,entry?.date,entry?.created_at);
 const entryTime=(entry)=>{
  const date=parseStoredDate(entryDateValue(entry));
  return date&&!isNaN(date)?date.getTime():0;
 };
 const entryChildId=(entry)=>entry?.childId||entry?.child_id||entry?.dyadId||entry?.dyad_id||'';
 const entryTitle=(entry)=>isBehaviourDecodeEntry(entry)?'Alignment Reminder':entry?.activity||entry?.activityTitle||entry?.title||'Wayfinder activity';
 const entryPhaseLabel=(entry)=>isBehaviourDecodeEntry(entry)?'Decode a Moment':entry?.phase&&PHASES[entry.phase]?PHASES[entry.phase]:entry?.phase||'';
 const childMatchesEntry=(child,entry)=>{
  const childId=child?.childId||child?.child_id||'';
  const id=entryChildId(entry);
  return childId&&id&&String(id)===String(childId);
 };
 const formatEntryDate=(value)=>{
  const date=parseStoredDate(value);
  if(!date||isNaN(date)) return 'Date not saved';
  return date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
 };
 const loadDashboard=async()=>{
  setAiInsight('');
  setInsightLoading(false);
  let allDyads=[];
  let extProfile=null;
  let allEntries=[];
  try{
   allDyads=await DB.getAllDyads(user.id,parentId,authSession);
  }catch(err){
   AuthDebug.log('[dashboard] failed to load dyads:', err);
  }
  setDyads(allDyads);

  try{
   extProfile=await Profile.getExtended(user.id);
  }catch(err){
   AuthDebug.log('[dashboard] failed to load extended profile:', err);
  }
  setDiscBars(extProfile?.disc_bars||null);

  try{
   allEntries=await DB.getEntries(user.id,parentId,authSession);
  }catch(err){
   AuthDebug.log('[dashboard] failed to load past activities:', err);
  }
  setEntries(allEntries);

  if(allDyads.length===0){setDyad(blankDyad());setStage('dashboard');return;}

  const primaryDyad=allDyads[0];
  if(primaryDyad?.disc){
   const currentCount=allEntries.length;
   const sortedEntries=[...allEntries].sort((a,b)=>entryTime(b)-entryTime(a));
   const latestRaw=entryDateValue(sortedEntries[0]);
   const latestEntryAt=toIsoTimestampOrNull(latestRaw);
   const cachedLatest=toIsoTimestampOrNull(extProfile?.insight_latest_entry_at);

   const cacheValid=extProfile?.insight_text&&
    extProfile.insight_entry_count===currentCount&&
    String(cachedLatest||'')===String(latestEntryAt||'');

   if(cacheValid){
    setAiInsight(extProfile.insight_text);
   }else{
    setInsightLoading(true);
    const childAgeYrs=primaryDyad.childDob
     ? Math.floor((new Date()-new Date(primaryDyad.childDob))/(1000*60*60*24*365.25))
     : null;
    try{
     const resp=await fetch('/api/disc-insight',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
       disc:primaryDyad.disc,
       childAge:childAgeYrs,
       childGender:primaryDyad.childGender,
       entryCount:currentCount
      })
     });
     const {insight}=await resp.json();
     if(insight){
      setAiInsight(insight);
      await Profile.saveInsight(user.id,insight,currentCount,latestEntryAt);
     }
    }catch(err){
     console.error('disc insight error:',err);
    }finally{
     setInsightLoading(false);
    }
   }
  }

  setStage('dashboard');
 };
 const startNewEntry=()=>{
  if(dyads.length===0){startNewChild();return;}
  if(dyads.length===1){setDyad(dyads[0]);setStage('journal');}
  else setStage('selectChild');
 };
 const startNewChild=()=>{setDyad(blankDyad());setStage('register');};
 const startDecode=()=>setStage('decode');
 const reviewShareMeta=typeof PARENT_REVIEW_SHARING!=='undefined'?PARENT_REVIEW_SHARING:{};
 const openTrailForReview=(entryId)=>{
  setTrailShareEntryId(entryId||null);
  setTrailScrollToShare(true);
  setStage('trail');
 };

 useEffect(()=>{
  if(!authSession?.access_token) return;
  if(stage==='loading') loadDashboard();
 },[user.id,parentId,authSession?.access_token,stage]);

 useEffect(()=>{
  if(!authSession?.access_token||stage!=='dashboard') return;
  refreshFeedbackNotice();
 },[user.id,authSession?.access_token,stage]);

 useEffect(()=>{
  if(!authSession?.access_token||stage!=='dashboard') return;
  refreshSignupPrivacyAcknowledgement();
 },[user.id,parentId,authSession?.access_token,stage]);

 if(stage==='loading') return <div className="wrap"><div className="card" style={{textAlign:'center',padding:40,color:'#666'}}>Loading your space...</div></div>;

 if(stage==='dashboard'){
  const discDyad=dyads.find(d=>d.disc)||dyads[0]||{};
  const shiftWords=SHIFT_WORDS.raiseIS||SHIFT_RAISE_IS||[];
  const recentEntries=[...entries]
   .sort((a,b)=>entryTime(b)-entryTime(a))
   .slice(0,5);
  return <><div className="wrap dashboard-wrap">
   <div className="card banner dashboard-hero">
    <div className="dashboard-hero-copy">
     <p className="dashboard-kicker">Welcome back</p>
     <h1>Parent {parentId}</h1>
     <ProfileSettings user={user} profile={profile} dyads={dyads} entries={entries} compact/>
    </div>
    <div className="dashboard-actions">
     <button className="switch" onClick={startNewChild}>+ New child</button>
     <button className="switch" onClick={startNewEntry}>Start new activity</button>
     <button className="switch switch-trail" onClick={()=>setStage('trail')}>Journal trail</button>
     <button className="switch switch-trail" onClick={()=>openTrailForReview(null)}>{reviewShareMeta.dashboardActionLabel||'Share for counsellor review'}</button>
     <button type="button" className="switch switch-trail" title={inviteShareMeta.parentButtonTitle||'Share only the Wayfinder parent signup link.'} onClick={()=>setInviteShareOpen(true)}>{inviteShareMeta.parentButtonLabel||'Invite another parent'}</button>
     <button className="switch switch-trail" onClick={()=>setStage('events')}>Events</button>
     <button className="switch switch-muted" onClick={()=>setStage('appVersion')}>App Version</button>
     <button className="switch switch-muted" onClick={onSignOut}>Sign out</button>
   </div>
  </div>

   <SignupPrivacyAcknowledgement
    meta={privacyAckMeta}
    loading={privacyAck.loading}
    showBanner={privacyAck.showBanner}
    submitting={privacyAck.submitting}
    successMessage={privacyAck.successMessage}
    errorMessage={privacyAck.errorMessage}
    fetchFailed={privacyAck.fetchFailed}
    onAcknowledge={acknowledgeSignupPrivacy}
    onRetry={refreshSignupPrivacyAcknowledgement}
   />

   <ParentCounsellorFeedbackNotification
    meta={feedbackMeta}
    loading={feedbackNotice.loading}
    available={feedbackNotice.available}
    unreadCount={feedbackNotice.unreadCount}
    unreadRows={feedbackNotice.rows}
    onOpenFeedback={openCounsellorFeedback}
   />

   <ParentCounsellorFeedbackLibrary
    meta={feedbackMeta}
    loading={feedbackLibrary.loading}
    available={feedbackLibrary.available}
    rows={feedbackLibrary.rows}
    unreadResponseIds={feedbackNotice.rows.map(row=>row.responseId).filter(Boolean)}
    entries={entries}
    entryTitle={entryTitle}
    entryDateValue={entryDateValue}
    onOpenFeedback={openCounsellorFeedback}
   />

   <RelationshipGarden dyads={dyads} entries={entries}/>

   <AlignJourneySection entries={entries} onStartDecode={startDecode}/>


   <div className="card decode-card">
    <div>
     <p className="pill">Guided reflection</p>
     <h2>Decode a Moment</h2>
     <p className="decode-card-subtitle">"My child did something and I don't know why."</p>
     <p className="dashboard-helper">Pause, notice what may have been happening, and choose one steady next step.</p>
    </div>
    <button className="btn btn-primary" onClick={startDecode}>Start Decode</button>
   </div>

   <div className="card review-share-dashboard-card">
    <div>
     <p className="pill">Optional support</p>
     <h2>{reviewShareMeta.dashboardCardTitle||'Share for counsellor review'}</h2>
     <p className="dashboard-helper">{reviewShareMeta.dashboardCardSubtitle||'Choose saved journal or Decode entries to share with your counsellor for time-limited ALIGN/CAB review.'}</p>
    </div>
    <button type="button" className="btn btn-secondary" onClick={()=>openTrailForReview(null)}>{reviewShareMeta.dashboardCardButton||'Open sharing in Journal Trail'}</button>
   </div>

   <div className="card dashboard-section">
    <div className="dashboard-section-head">
     <div>
      <h2>Past activities</h2>
      <p className="dashboard-helper">Recent moments you have reflected on.</p>
     </div>
     {recentEntries.length>0 && <span className="pill">{recentEntries.length} recent</span>}
    </div>
    {recentEntries.length>0 ? <div className="dashboard-list">
     {recentEntries.map(e=><div key={e.id||`${entryChildId(e)}-${entryDateValue(e)}-${entryTitle(e)}`} className="dashboard-list-item">
      <div className="dashboard-item-title">{entryTitle(e)}</div>
      <div className="sub dashboard-item-meta">{formatEntryDate(entryDateValue(e))}{entryPhaseLabel(e)?' · '+entryPhaseLabel(e):''} · Child ID: {entryChildId(e)||'Not saved'}</div>
     </div>)}
    </div> : <div className="dashboard-empty">
     <p className="sub">No activities yet. Start when you are ready.</p>
    </div>}
   </div>

   <div className="card dashboard-section">
    <div className="dashboard-insight">
     {discDyad.disc ? <>
      <h2>{discDyad.disc.toUpperCase()} · {discDescriptor(discDyad.disc)?.name||discDyad.disc.toUpperCase()}</h2>
      <p className="dashboard-helper">Responses under pressure — what your child may observe.</p>
      {insightLoading
       ? <p className="sub">Personalising your insight...</p>
       : aiInsight
        ? <p className="dashboard-insight-text">{aiInsight}</p>
        : <p className="sub">{discDescriptor(discDyad.disc)?.desc||'More reflections will help personalise this insight.'}</p>
      }
      <DISCIntensityChart bars={discBars}/>
      <DISCImageUpload userId={user.id} existingBars={discBars} onBarsUpdated={(bars)=>setDiscBars(bars)}/>
     </> : <>
      <h2>Responses under pressure</h2>
      <p className="dashboard-helper">Add your DISC blend to unlock personalised insight.</p>
      <DISCIntensityChart bars={discBars}/>
      <DISCImageUpload userId={user.id} existingBars={discBars} onBarsUpdated={(bars)=>setDiscBars(bars)}/>
     </>}
    </div>

    <div className="dashboard-section-head dashboard-section-head-spaced">
     <div>
      <h2>Your children</h2>
      <p className="dashboard-helper">Each child has a generated Child ID — codes only, no names.</p>
     </div>
     {dyads.length>0 && <span className="pill">{dyads.length} {dyads.length===1?'child':'children'}</span>}
    </div>
    {dyads.length===0 ? <div className="dashboard-empty">
     <p className="sub">No children added yet. Use + New child when you are ready.</p>
    </div> : <div className="dashboard-list">
     {dyads.map(child=>{
      const childEntries=[...entries].filter(e=>childMatchesEntry(child,e)).sort((a,b)=>entryTime(b)-entryTime(a)).slice(0,3);
      return <div key={child.childId} className="dashboard-list-item child-summary-card">
       <div className="child-summary-top">
        <div>
         <div className="child-summary-id">Child ID: {child.childId}</div>
         <div className="sub child-summary-meta">{child.childGender||'Gender not added'} · {ageFrom(child.childDob,null)||'Age not added'}</div>
        </div>
        <button className="btn btn-secondary" onClick={()=>{setDyad(child);setStage('journal');}}>Journal</button>
       </div>
       {childEntries.length>0 ? <div className="child-reflections">
        <div className="child-reflections-title">Recent reflections</div>
        <div className="child-reflections-list">
         {childEntries.map(e=><div key={e.id||`${entryChildId(e)}-${entryDateValue(e)}-${entryTitle(e)}`} className="child-reflection-row">{formatEntryDate(entryDateValue(e))} · {entryTitle(e)}</div>)}
        </div>
       </div> : <p className="sub child-reflections-empty">No reflections yet for this Child ID.</p>}
      </div>;
     })}
    </div>}
    <button className="btn btn-secondary btn-block dashboard-trail-btn" onClick={()=>setStage('trail')}>Open my journal trail</button>
   </div>

   <div className="card dashboard-lean-card">
    <h2>This week, lean into</h2>
    <p className="dashboard-lean-words">{shiftWords.join(' · ')}</p>
    <p className="dashboard-helper">Possible needs to stay curious about: {CHILD_NEEDS_WORDS.join(' · ')}</p>
   </div>
  </div>
  <ParentSignupInviteModal open={inviteShareOpen} context="parent" onClose={()=>setInviteShareOpen(false)}/>
 </>;
 }

 if(stage==='decode') return <DecodeMomentFlow
  user={user}
  parentId={parentId}
  authSession={authSession}
  dyads={dyads}
  back={()=>setStage('dashboard')}
  onViewTrail={()=>setStage('trail')}
  onShareForReview={(entry)=>openTrailForReview(entry?.id)}
  onSaved={(entry)=>setEntries(prev=>[entry,...prev.filter(e=>String(e.id)!==String(entry.id))])}
  onSignOut={onSignOut}
 />;

 if(stage==='selectChild') return <div className="wrap">
  <Bar title="Who are you journalling for?" back={()=>setStage('dashboard')} onSignOut={onSignOut}/>
  <div className="card">
   <h2 style={{marginBottom:16}}>Who are you journalling for?</h2>
   {dyads.map(d=>{
    const age=ageFrom(d.childDob,null);
    return <button key={d.childId} className="btn btn-secondary btn-block" style={{marginBottom:10,textAlign:'left',padding:'14px 18px'}} onClick={()=>{setDyad(d);setStage('journal');}}>
     <div style={{fontWeight:700,fontSize:15}}>Child ID: {d.childId} <span style={{fontWeight:400,color:'#666'}}>&middot; {d.childGender||'Not added'}</span></div>
     <div style={{fontSize:13,color:'#555',marginTop:4}}>{age||'Age not added'}</div>
    </button>;
   })}
  </div>
 </div>;

 if(stage==='appVersion') return <AppVersionPage back={()=>setStage('dashboard')} onSignOut={onSignOut}/>;

 if(stage==='events') return <ActivityEventsPage back={()=>setStage('dashboard')} onSignOut={onSignOut} authSession={authSession}/>;

 if(stage==='counsellorFeedback') return <ParentCounsellorFeedbackReader
  user={user}
  authSession={authSession}
  responseId={activeFeedbackResponseId}
  entries={entries}
  entryTitle={entryTitle}
  entryDateValue={entryDateValue}
  meta={feedbackMeta}
  onBack={()=>{setActiveFeedbackResponseId(null);setStage('dashboard');refreshFeedbackNotice();}}
  onMarkedRead={refreshFeedbackNotice}
  onSignOut={onSignOut}
 />;

if(stage==='trail') return <JournalTrail user={user} parentId={parentId} dyads={dyads} authSession={authSession} back={()=>setStage('dashboard')} onSignOut={onSignOut} initialShareEntryId={trailShareEntryId} scrollToSharePanel={trailScrollToShare} onShareNavHandled={()=>{setTrailShareEntryId(null);setTrailScrollToShare(false);}} feedbackMeta={feedbackMeta}/>;

 if(stage==='register') return <RegisterDyad parentId={parentId} initial={dyad} onSave={async(dy)=>{await DB.saveDyad(user.id,parentId,dy,authSession);setDyad(dy);await loadDashboard();}} back={()=>dyads.length>0?setStage('dashboard'):back()} onSignOut={onSignOut}/>;

 if(stage==='done') return <div className="wrap">
  <Bar title="Entry saved" back={()=>loadDashboard()} onSignOut={onSignOut}/>
  <div className="card" style={{textAlign:'center'}}>
   <div className="thank-illus"><SpotSeedling/></div>
   <h2>Thank you for taking this step.</h2>
   <p className="sub" style={{marginTop:12,lineHeight:1.6}}>By attending to your own emotional patterns, you're becoming a steadier, warmer structure for your child to emulate. This is how change happens - one reflection at a time.</p>
   <div style={{marginTop:24,display:'flex',flexDirection:'column',gap:10}}>
    <button className="btn btn-primary" onClick={()=>setStage('journal')}>Journal another entry</button>
    <button className="btn btn-secondary" onClick={()=>loadDashboard()}>Back to dashboard</button>
    {dyads.length>1&&<button className="btn btn-secondary" onClick={()=>setStage('selectChild')}>Switch child</button>}
    <button className="btn btn-secondary" onClick={()=>openTrailForReview(lastSavedEntryId)}>{reviewShareMeta.postSaveButtonLabel||UI_TEXT.buttons.askTherapist}</button>
    <p className="sub" style={{fontSize:13,marginTop:-4}}>{reviewShareMeta.postSaveHelper||'Preview what will be shared and give consent in Journal Trail.'}</p>
    <button className="btn btn-ghost" onClick={back}>Done for now</button>
   </div>
  </div>
 </div>;

 return <ClientJournal parentId={parentId} dyad={dyad} onDone={(entry)=>{setLastSavedEntryId(entry?.id||null);setStage('done');}} back={()=>setStage('dashboard')} user={user} onSignOut={onSignOut}/>;
}

function ParentReviewSharePanel({user,parentId,entries,authSession,entryTitle,entryDateValue,fmt,focusEntryId,scrollIntoView,onScrollHandled,entryLocks={},feedbackMeta:feedbackMetaProp}){
 const meta=typeof PARENT_REVIEW_SHARING!=='undefined'?PARENT_REVIEW_SHARING:{};
 const feedbackMeta=feedbackMetaProp||parentCounsellorFeedbackMeta();
 const panelRef=useRef(null);
 const [highlight,setHighlight]=useState(false);
 const [unavailable,setUnavailable]=useState(false);
 const [grants,setGrants]=useState([]);
 const [loadingGrants,setLoadingGrants]=useState(true);
 const [selectedIds,setSelectedIds]=useState([]);
 const [counsellorId,setCounsellorId]=useState('');
 const [counsellors,setCounsellors]=useState([]);
 const [loadingCounsellors,setLoadingCounsellors]=useState(true);
 const [counsellorsUnavailable,setCounsellorsUnavailable]=useState(false);
 const [consent,setConsent]=useState(false);
 const [status,setStatus]=useState('');
 const [error,setError]=useState('');
 const [submitting,setSubmitting]=useState(false);
 const [revoking,setRevoking]=useState(null);
 const shareableEntries=entries.filter(e=>e.id!==undefined&&e.id!==null&&e.id!=='');
 const entryIdMatches=(a,b)=>String(a)===String(b);
 const isEntryLocked=(id)=>!!entryLocks[String(id)]?.isLocked;
 const toggleId=(id)=>{
  if(isEntryLocked(id)) return;
  setSelectedIds(prev=>prev.some(x=>entryIdMatches(x,id))?prev.filter(x=>!entryIdMatches(x,id)):[...prev,id]);
 };
 const previewSnippet=(text,max=140)=>{
  const clean=String(text||'').trim();
  if(!clean) return '';
  return clean.length>max?clean.slice(0,max)+'…':clean;
 };
 const previewEntryContent=(e)=>{
  if(isBehaviourDecodeEntry(e)){
   const reminder=decodeReminderFromEntry(e);
   return [
    reminder.observed_behaviour||reminder.moment_noticed?('Behaviour: '+previewSnippet(reminder.observed_behaviour||reminder.moment_noticed)):null,
    reminder.possible_need_worth_staying_curious_about?('Possible need: '+previewSnippet(decodeDisplayText(reminder.possible_need_worth_staying_curious_about))):null,
    reminder.thinking||reminder.feelings||reminder.behaviour_what_i_did?('In me: '+previewSnippet([reminder.thinking,reminder.feelings,reminder.behaviour_what_i_did].filter(Boolean).join(' · '))):null
   ].filter(Boolean);
  }
  const cab=e.cab||{};
  return [
    cab.thoughts?('Thinking: '+previewSnippet(cab.thoughts)):null,
    cab.feelings?('Feelings: '+previewSnippet(cab.feelings)):null,
    cab.actions?('Behaviour: '+previewSnippet(cab.actions)):null,
    cab.meaning?('Meaning: '+previewSnippet(cab.meaning)):null
  ].filter(Boolean);
 };
 useEffect(()=>{
  if(!focusEntryId&&!scrollIntoView) return;
  if(focusEntryId&&shareableEntries.some(e=>entryIdMatches(e.id,focusEntryId)&&!isEntryLocked(e.id))){
   setSelectedIds(prev=>prev.some(id=>entryIdMatches(id,focusEntryId))?prev:[...prev,focusEntryId]);
  }
  if(scrollIntoView&&panelRef.current){
   panelRef.current.scrollIntoView({behavior:'smooth',block:'start'});
   setHighlight(true);
   const timer=setTimeout(()=>setHighlight(false),2400);
   onScrollHandled?.();
   return ()=>clearTimeout(timer);
  }
 },[focusEntryId,scrollIntoView,entries.length,entryLocks]);

 useEffect(()=>{
  setSelectedIds(prev=>{
   const next=prev.filter(id=>!isEntryLocked(id));
   return next.length===prev.length?prev:next;
  });
 },[entryLocks]);
 const loadGrants=async()=>{
  setLoadingGrants(true);
  const r=await DB.getParentReviewGrants(user.id,authSession);
  setUnavailable(!!r.unavailable);
  if(!r.unavailable){
   const now=Date.now();
   setGrants((r.rows||[]).filter(g=>g.status==='active'&&g.expires_at&&new Date(g.expires_at).getTime()>now));
  }
  setLoadingGrants(false);
 };
 useEffect(()=>{loadGrants();},[user.id,authSession?.access_token]);
 useEffect(()=>{
  let cancelled=false;
  (async()=>{
   setLoadingCounsellors(true);
   const r=await DB.listAvailableCounsellors(authSession);
   if(cancelled)return;
   setCounsellorsUnavailable(!!r.unavailable);
   setCounsellors(r.unavailable?[]:(r.rows||[]));
   setLoadingCounsellors(false);
  })();
  return ()=>{cancelled=true;};
 },[authSession?.access_token]);
 const handleGrant=async()=>{
  setError('');setStatus('');
  if(unavailable){setError(meta.setupUnavailable);return;}
  if(counsellorsUnavailable){setError(meta.setupUnavailable);return;}
  if(!counsellors.length){setError(meta.noCounsellorsAvailable);return;}
  if(!consent){setError(meta.consentRequired||'Please confirm consent before sharing.');return;}
  if(!selectedIds.length){setError(meta.noEntriesSelected||'Select at least one entry to share.');return;}
  const grantEntryIds=selectedIds.filter(id=>!isEntryLocked(id));
  if(!grantEntryIds.length){setError(meta.noEntriesSelected||'Select at least one entry to share.');return;}
  const wid=String(counsellorId||'').trim();
  if(!wid){setError(meta.counsellorRequired||'Please choose a counsellor before sharing.');return;}
  setSubmitting(true);
  try{
   const resolved=await DB.resolveCounsellorUserId(wid,authSession);
   if(resolved.unavailable){setError(meta.setupUnavailable);return;}
   if(!resolved.userId){setError(meta.counsellorNotFound);return;}
   const expiryDays=meta.grantExpiryDays||30;
   const payload={
    parent_user_id:user.id,
    parent_id:parentId,
    counsellor_user_id:resolved.userId,
    counsellor_wayfinder_id:wid,
    status:'active',
    consent_version:meta.consentVersion||'2026-06-1',
    consent_text_snapshot:meta.consentBody||'',
    expires_at:new Date(Date.now()+expiryDays*24*60*60*1000).toISOString()
   };
   const result=await DB.createReviewGrant(user.id,parentId,payload,grantEntryIds,authSession);
   if(result.unavailable){setError(meta.setupUnavailable);return;}
   if(!result.ok){
    AuthDebug.log('[review] grant failed:', { errorStage: result.errorStage || 'unknown', unavailable: !!result.unavailable });
    setError(meta.grantError);
    return;
   }
   setStatus(meta.grantCreated||'Review access granted.');
   setSelectedIds([]);setConsent(false);setCounsellorId('');
   loadGrants();
  }catch(_){
   setError(meta.grantError||'We could not complete review sharing.');
  }finally{
   setSubmitting(false);
  }
 };
 const handleRevoke=async(grantId)=>{
  setRevoking(grantId);setError('');setStatus('');
  const r=await DB.revokeReviewGrant(user.id,grantId,authSession);
  if(r.unavailable)setError(meta.setupUnavailable);
  else if(r.ok){setStatus(meta.grantRevoked||'Review access revoked.');loadGrants();}
  else setError(meta.grantError);
  setRevoking(null);
 };
 if(unavailable) return <div ref={panelRef} id="parent-review-share-panel" className="card review-share-card review-share-card--unavailable">
  <h2>{meta.title||'Share for counsellor review'}</h2>
  <p className="sub">{meta.setupUnavailable}</p>
 </div>;
 return <div ref={panelRef} id="parent-review-share-panel" className={'card review-share-card review-share-card--focused'+(highlight?' is-focused':'')}>
  <h2>{meta.title||'Share for counsellor review'}</h2>
  <p className="sub">{meta.shareModeIntro||meta.subtitle}</p>
  <p className="review-share-privacy">{meta.privacyNote}</p>
  {shareableEntries.length===0 ? <p className="sub">Save journal or Decode entries first — then you can select which to share.</p> : <>
   <div className="review-share-section">
    <h3>{meta.selectEntriesLabel||'Select entries to share'}</h3>
    <div className="review-share-entry-list">
     {shareableEntries.map(e=>{
      const id=e.id;
      const locked=isEntryLocked(id);
      const checked=!locked&&selectedIds.some(x=>entryIdMatches(x,id));
      const isDecode=isBehaviourDecodeEntry(e);
      return <label key={id} className={'review-share-entry'+(checked?' is-selected':'')+(locked?' is-locked':'')}>
       <input type="checkbox" checked={checked} disabled={locked} onChange={()=>toggleId(id)} aria-label={'Share '+entryTitle(e)+' for counsellor review'}/>
       <span className="review-share-entry-text">
        <span className="review-share-entry-title">{entryTitle(e)}</span>
        <span className="review-share-entry-meta">{fmt(entryDateValue(e))}{isDecode?' · Decode a Moment':' · Activity journal'}</span>
        {locked ? <span className="parent-feedback-lock-note review-share-lock-note">{feedbackMeta.entryLockNotice||feedbackMeta.entryLockedShareNote}</span> : null}
       </span>
      </label>;
     })}
    </div>
   </div>
   {selectedIds.length>0 && <div className="review-share-section review-share-preview">
    <h3>{meta.previewLabel||'What will be shared'}</h3>
    <div className="review-share-preview-items">
     {shareableEntries.filter(e=>selectedIds.some(id=>entryIdMatches(id,e.id))).map(e=>{
      const isDecode=isBehaviourDecodeEntry(e);
      const lines=previewEntryContent(e);
      return <div key={e.id} className="review-share-preview-item">
       <div className="review-share-preview-head">
        <strong>{entryTitle(e)}</strong>
        <span>{fmt(entryDateValue(e))} · {isDecode?(meta.previewTypeDecode||'Decode a Moment'):(meta.previewTypeActivity||'Activity journal')}</span>
       </div>
       {lines.length>0 ? <ul className="review-share-preview-detail">{lines.map((line,i)=><li key={i}>{line}</li>)}</ul> : <p className="sub review-share-preview-empty">Reflection summary will be shared as saved.</p>}
      </div>;
     })}
    </div>
   </div>}
   <div className="field review-share-counsellor-field">
    <label>{meta.counsellorSelectLabel||'Choose your Mental Health Professional'}</label>
    {loadingCounsellors ? <p className="sub">{meta.counsellorSelectLoading||'Loading practitioners…'}</p> : counsellorsUnavailable ? <p className="sub review-share-error">{meta.setupUnavailable}</p> : counsellors.length===0 ? <p className="sub review-share-error">{meta.noCounsellorsAvailable}</p> : <>
     <select value={counsellorId} onChange={ev=>setCounsellorId(ev.target.value)}>
      <option value="">{meta.counsellorSelectPlaceholder||'Select a practitioner…'}</option>
      {counsellors.map(c=><option key={c.wayfinder_id} value={c.wayfinder_id}>{practitionerSelectOptionLabel(c)}</option>)}
     </select>
     <p className="hint">{meta.counsellorSelectHint}</p>
    </>}
   </div>
   <div className="review-share-consent">
    <h3>{meta.consentTitle}</h3>
    <p className="sub">{meta.consentBody}</p>
    <p className="review-share-expiry">{meta.consentExpiryNotice||'Shared access lasts 30 days unless you revoke it earlier.'}</p>
    <label className="review-share-consent-check">
     <input type="checkbox" checked={consent} onChange={ev=>setConsent(ev.target.checked)} aria-label={meta.consentCheckbox||'I consent to share selected reflections for counsellor review'}/>
     <span>{meta.consentCheckbox}</span>
    </label>
   </div>
   {error&&<p className="review-share-error">{error}</p>}
   {status&&<p className="review-share-status">{status}</p>}
   <button type="button" className="btn btn-primary btn-block review-share-submit" disabled={submitting||!selectedIds.length||!consent||!counsellorId||!counsellors.length||loadingCounsellors||counsellorsUnavailable} onClick={handleGrant}>{submitting?'Granting…':(meta.grantButton||'Grant review access')}</button>
  </>}
  <div className="review-share-section review-share-grants">
   <h3>{meta.activeGrantsTitle||'Active review access'}</h3>
   {loadingGrants ? <p className="sub">Loading…</p> : grants.length===0 ? <p className="sub">{meta.emptyGrants}</p> : grants.map(g=><div key={g.id} className="review-share-grant-row">
    <div>
     <strong>{g.counsellor_wayfinder_id}</strong>
     <span className="review-share-grant-meta"> · expires {fmt(g.expires_at)}</span>
    </div>
    <button type="button" className="btn btn-ghost review-share-revoke" disabled={revoking===g.id} onClick={()=>handleRevoke(g.id)}>{revoking===g.id?'Revoking…':(meta.revokeButton||'Revoke access')}</button>
   </div>)}
  </div>
 </div>;
}

function JournalTrail({user,parentId,dyads,authSession,back,onSignOut,initialShareEntryId=null,scrollToSharePanel=false,onShareNavHandled,feedbackMeta:feedbackMetaProp}){
 const reviewMeta=typeof PARENT_REVIEW_SHARING!=='undefined'?PARENT_REVIEW_SHARING:{};
 const feedbackMeta=feedbackMetaProp||parentCounsellorFeedbackMeta();
 const [entries,setEntries]=useState([]);
 const [loading,setLoading]=useState(true);
 const [openId,setOpenId]=useState(null);
 const [entryLocks,setEntryLocks]=useState({});
 const [shareFocusEntryId,setShareFocusEntryId]=useState(initialShareEntryId);
 const [shareScroll,setShareScroll]=useState(scrollToSharePanel);
 const [shareMode,setShareMode]=useState(!!scrollToSharePanel||!!initialShareEntryId);
 const entryDateValue=(entry)=>firstStoredDateValue(entry?.timestamp,entry?.submittedAt,entry?.date,entry?.created_at);
 const entryTime=(entry)=>{
  const date=parseStoredDate(entryDateValue(entry));
  return date&&!isNaN(date)?date.getTime():0;
 };
 const entryChildId=(entry)=>entry?.childId||entry?.child_id||entry?.dyadId||entry?.dyad_id||'';
 const entryTitle=(entry)=>isBehaviourDecodeEntry(entry)?'Alignment Reminder':entry?.activity||entry?.activityTitle||entry?.title||'Wayfinder activity';
 const entryPhaseLabel=(entry)=>isBehaviourDecodeEntry(entry)?'Decode a Moment':entry?.phase&&PHASES[entry.phase]?PHASES[entry.phase]:entry?.phase||'';
 const dyadByChildId=Object.fromEntries((dyads||[]).map(d=>[String(d.childId||d.child_id||''),d]));
 const entryChildAge=(entry)=>{
  const childId=entryChildId(entry);
  const childDob=entry?.childDob||entry?.child_dob||dyadByChildId[String(childId)]?.childDob||null;
  return ageFrom(childDob,entryDateValue(entry));
 };

 useEffect(()=>{
  DB.getEntries(user.id,parentId,authSession).then(data=>{
   setEntries(data.sort((a,b)=>entryTime(b)-entryTime(a)));
   setLoading(false);
  });
 },[user.id,parentId,authSession?.access_token]);

 useEffect(()=>{
  const ids=entries.map(e=>String(e.id)).filter(Boolean);
  if(!ids.length||!authSession?.access_token){
   setEntryLocks({});
   return;
  }
  DB.getParentEntryReviewLockMap(user.id,ids,authSession).then(result=>{
   if(!result.available||!result.locks?.length){
    setEntryLocks({});
    return;
   }
   const map={};
   result.locks.forEach(lock=>{
    if(lock?.journalEntryId) map[String(lock.journalEntryId)]=lock;
   });
   setEntryLocks(map);
  }).catch(()=>setEntryLocks({}));
 },[entries,user.id,authSession?.access_token]);

 useEffect(()=>{
  if(initialShareEntryId||scrollToSharePanel){
   setShareFocusEntryId(initialShareEntryId||null);
   setShareScroll(!!scrollToSharePanel);
   setShareMode(true);
  }
 },[initialShareEntryId,scrollToSharePanel]);

 const enterShareMode=(entryId)=>{
  setShareFocusEntryId(entryId||null);
  setShareScroll(true);
  setShareMode(true);
 };

 const exitShareMode=()=>{
  setShareMode(false);
  setShareFocusEntryId(null);
  setShareScroll(false);
  onShareNavHandled?.();
 };

 const activityEntries=entries.filter(e=>!isBehaviourDecodeEntry(e));
 const wordCounts={};
 activityEntries.forEach(e=>(e.autoWords||[]).forEach(w=>{wordCounts[w]=(wordCounts[w]||0)+1;}));
 const topWords=Object.entries(wordCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);

 const patternGroups={I:[],S:[],D:[],C:[]};
 topWords.forEach(([w])=>{const q=WORD_Q[w];if(q&&patternGroups[q])patternGroups[q].push(w);});

 const markerCounts={};
 activityEntries.forEach(e=>{
  Object.entries(e.markers||{}).forEach(([k,v])=>{
   if(v.claimed) markerCounts[k]=(markerCounts[k]||0)+1;
  });
 });
 const totalEntries=entries.length;
 const totalActivityEntries=activityEntries.length;

 // Phase 2: read-only filtering of the Past entries list only. Does not affect the
 // emotional-pattern or congruence summaries above, which stay based on activityEntries.
 const [typeFilter,setTypeFilter]=useState('all'); // all | activity | decode
 const [childFilter,setChildFilter]=useState('all');
 const [needFilter,setNeedFilter]=useState([]);
 const [growthFilter,setGrowthFilter]=useState([]);
 const decodeNeedsOf=(e)=>decodeList(decodeReminderFromEntry(e).possible_need_worth_staying_curious_about);
 const decodeGrowthOf=(e)=>decodeList(decodeReminderFromEntry(e).stabilising_response_to_practise);
 const decodeEntries=entries.filter(isBehaviourDecodeEntry);
 const needOptions=[...new Set(decodeEntries.flatMap(decodeNeedsOf))].filter(Boolean);
 const growthOptions=[...new Set(decodeEntries.flatMap(decodeGrowthOf))].filter(Boolean);
 const childOptions=(dyads||[]).map(d=>{const id=String(d.childId||d.child_id||'');const meta=[d.childGender,ageFrom(d.childDob,null)].filter(Boolean);return {id,label:'Child ID: '+id+(meta.length?' · '+meta.join(', '):'')};}).filter(o=>o.id);
 const hasUnassigned=entries.some(e=>!entryChildId(e));
 const toggleArr=(arr,setArr,v)=>setArr(arr.includes(v)?arr.filter(x=>x!==v):[...arr,v]);
 const matchesType=(e)=>typeFilter==='all'?true:typeFilter==='decode'?isBehaviourDecodeEntry(e):!isBehaviourDecodeEntry(e);
 const matchesChild=(e)=>childFilter==='all'?true:childFilter==='__unassigned__'?!entryChildId(e):String(entryChildId(e))===String(childFilter);
 const matchesNeed=(e)=>needFilter.length===0?true:(isBehaviourDecodeEntry(e)&&decodeNeedsOf(e).some(n=>needFilter.includes(n)));
 const matchesGrowth=(e)=>growthFilter.length===0?true:(isBehaviourDecodeEntry(e)&&decodeGrowthOf(e).some(g=>growthFilter.includes(g)));
 const filteredEntries=entries.filter(e=>matchesType(e)&&matchesChild(e)&&matchesNeed(e)&&matchesGrowth(e));
 const anyFilterActive=typeFilter!=='all'||childFilter!=='all'||needFilter.length>0||growthFilter.length>0;
 const clearFilters=()=>{setTypeFilter('all');setChildFilter('all');setNeedFilter([]);setGrowthFilter([]);};

 const fmt=d=>{
  if(!d) return '-';
  const date=parseStoredDate(d);
  if(!date||isNaN(date)) return '-';
  return date.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'});
 };

 if(loading) return <div className="wrap"><div className="card" style={{textAlign:'center',padding:40,color:'#666'}}>Loading your journal trail...</div></div>;

 if(shareMode) return <div className="wrap review-share-mode-wrap">
  <Bar title={reviewMeta.title||'Share for counsellor review'} back={exitShareMode} onSignOut={onSignOut}/>
  <ParentReviewSharePanel user={user} parentId={parentId} entries={entries} authSession={authSession} entryTitle={entryTitle} entryDateValue={entryDateValue} fmt={fmt} focusEntryId={shareFocusEntryId} scrollIntoView={shareScroll} onScrollHandled={()=>setShareScroll(false)} entryLocks={entryLocks} feedbackMeta={feedbackMeta}/>
  <button type="button" className="btn btn-ghost review-share-exit" onClick={exitShareMode}>{reviewMeta.browseTrailLink||'View full journal trail'}</button>
 </div>;

 return <div className="wrap">
  <Bar title={'Journal trail - '+parentId} back={back} onSignOut={onSignOut}/>
  <div className="card review-share-cta">
   <div>
    <h2>{reviewMeta.title||'Share for counsellor review'}</h2>
    <p className="sub">{reviewMeta.dashboardCardSubtitle||reviewMeta.subtitle}</p>
   </div>
   <button type="button" className="btn btn-secondary" onClick={()=>enterShareMode(null)}>{reviewMeta.dashboardCardButton||'Open sharing'}</button>
  </div>

  {topWords.length>0 && <div className="card" style={{background:'#f0f4f2'}}>
   <h2 style={{marginBottom:4}}>Your emotional patterns</h2>
   <p className="sub" style={{marginBottom:14}}>Words that show up most in your reflections.</p>
   <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
    {topWords.map(([w,count])=>{
     const q=WORD_Q[w]||'D';
     const colors={I:{bg:'#E8F5E9',color:'#2E7D32'},S:{bg:'#E3F2FD',color:'#1565C0'},D:{bg:'#FBE9E7',color:'#BF360C'},C:{bg:'#F3E5F5',color:'#6A1B9A'}};
     const c=colors[q]||colors.D;
     return <span key={w} style={{background:c.bg,color:c.color,borderRadius:20,padding:'5px 14px',fontSize:13,fontWeight:600}}>
      {w} <span style={{fontWeight:400,opacity:.7}}>x{count}</span>
     </span>;
    })}
   </div>
   {patternGroups.D.length>0||patternGroups.C.length>0 ? <p className="sub" style={{marginTop:12,fontSize:12}}>
    Your D/C patterns: {[...patternGroups.D,...patternGroups.C].join(', ')}. Growth edge: softening intensity so warmth and steadiness have more room.
   </p> : patternGroups.I.length>0||patternGroups.S.length>0 ? <p className="sub" style={{marginTop:12,fontSize:12}}>
    Your I/S patterns: {[...patternGroups.I,...patternGroups.S].join(', ')}. These can support emotional safety when paced and bounded.
   </p> : null}
   {activityEntries.length>=4 && (()=>{
    const chronological=[...activityEntries].sort((a,b)=>entryTime(a)-entryTime(b));
    const countWords=(list)=>{
     const counts={};
     list.forEach(e=>(e.autoWords||[]).forEach(w=>{counts[w]=(counts[w]||0)+1;}));
     return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    };
    const firstWords=countWords(chronological.slice(0,3));
    const recentWords=countWords(chronological.slice(-3));
    const chip=([w,count])=>{
     const q=WORD_Q[w];
     const bg=q==='D'||q==='C'?'#FBE9E7':q==='I'||q==='S'?'#E0F2F1':'#eee';
     const color=q==='D'||q==='C'?'#BF360C':q==='I'||q==='S'?'#00796B':'#666';
     return <span key={w} style={{background:bg,color,borderRadius:20,padding:'4px 10px',fontSize:12,fontWeight:600}}>{w} <span style={{fontWeight:400,opacity:.7}}>x{count}</span></span>;
    };
    return <div style={{marginTop:16,paddingTop:12,borderTop:'1px solid rgba(0,0,0,.08)'}}>
     <h3 style={{fontSize:15,marginBottom:8}}>Early entries vs recent entries</h3>
     <div style={{display:'grid',gap:10}}>
      <div><div style={{fontSize:12,fontWeight:700,marginBottom:6,color:'#777'}}>First 3 entries</div><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{firstWords.map(chip)}</div></div>
      <div><div style={{fontSize:12,fontWeight:700,marginBottom:6,color:'#777'}}>Last 3 entries</div><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{recentWords.map(chip)}</div></div>
     </div>
     <p className="sub" style={{fontSize:12,marginTop:10}}>Patterns are reflective signals, not fixed traits.</p>
    </div>;
   })()}
  </div>}

  {totalActivityEntries>0 && <div className="card">
   <h2 style={{marginBottom:4}}>Congruence markers</h2>
   <p className="sub" style={{marginBottom:14}}>How often you claimed each marker across {totalActivityEntries} {totalActivityEntries===1?'activity entry':'activity entries'}.</p>
   <div style={{display:'grid',gap:8}}>
    {MARKERS.map(m=>{
     const count=markerCounts[m.key]||0;
     const pct=totalActivityEntries>0?Math.round((count/totalActivityEntries)*100):0;
     return <div key={m.key}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:3}}>
       <span style={{fontWeight:600}}>{m.label}</span>
       <span style={{color:'#888'}}>{count}/{totalActivityEntries}</span>
      </div>
      <div style={{background:'#eee',borderRadius:4,height:6}}>
       <div style={{background:'var(--sage)',borderRadius:4,height:6,width:pct+'%',transition:'width .4s'}}/>
      </div>
     </div>;
    })}
   </div>
  </div>}

  {totalEntries>0 && <div className="card trail-filterbar">
   <p className="trail-filter-intro">Gently review reflection moments — filter without changing your records.</p>
   <div className="trail-filter-row">
    <span className="trail-filter-label" id="trail-type-label">{UI_TEXT.trail.showLabel}</span>
    <div className="trail-filter-chips" role="group" aria-labelledby="trail-type-label">
     <button type="button" className={'chip trail-chip'+(typeFilter==='all'?' selected':'')} onClick={()=>setTypeFilter('all')}>{UI_TEXT.trail.filterAll}</button>
     <button type="button" className={'chip trail-chip'+(typeFilter==='activity'?' selected':'')} onClick={()=>setTypeFilter('activity')}>{UI_TEXT.trail.filterActivity}</button>
     <button type="button" className={'chip trail-chip'+(typeFilter==='decode'?' selected':'')} onClick={()=>setTypeFilter('decode')}>{UI_TEXT.trail.filterDecode}</button>
    </div>
   </div>
   {(childOptions.length>0||hasUnassigned) && <div className="trail-filter-row">
    <span className="trail-filter-label" id="trail-child-label">{UI_TEXT.trail.childLabel}</span>
    <div className="trail-filter-chips" role="group" aria-labelledby="trail-child-label">
     <button type="button" className={'chip trail-chip'+(childFilter==='all'?' selected':'')} onClick={()=>setChildFilter('all')}>{UI_TEXT.trail.childAll}</button>
     {childOptions.map(o=><button type="button" key={o.id} className={'chip trail-chip'+(childFilter===o.id?' selected':'')} onClick={()=>setChildFilter(o.id)}>{o.label}</button>)}
     {hasUnassigned && <button type="button" className={'chip trail-chip'+(childFilter==='__unassigned__'?' selected':'')} onClick={()=>setChildFilter('__unassigned__')}>{UI_TEXT.trail.childUnassigned}</button>}
    </div>
   </div>}
   {needOptions.length>0 && <div className="trail-filter-row">
    <span className="trail-filter-label" id="trail-need-label">{UI_TEXT.trail.needLabel}</span>
    <div className="trail-filter-chips" role="group" aria-labelledby="trail-need-label">
     {needOptions.map(n=><button type="button" key={n} className={'chip trail-chip'+(needFilter.includes(n)?' selected':'')} onClick={()=>toggleArr(needFilter,setNeedFilter,n)}>{n}</button>)}
    </div>
   </div>}
   {growthOptions.length>0 && <div className="trail-filter-row">
    <span className="trail-filter-label" id="trail-growth-label">{UI_TEXT.trail.growthLabel}</span>
    <div className="trail-filter-chips" role="group" aria-labelledby="trail-growth-label">
     {growthOptions.map(g=><button type="button" key={g} className={'chip trail-chip'+(growthFilter.includes(g)?' selected':'')} onClick={()=>toggleArr(growthFilter,setGrowthFilter,g)}>{g}</button>)}
    </div>
   </div>}
   <div className="trail-filter-meta">
    <span className="trail-filter-count">{'Showing '+filteredEntries.length+' of '+totalEntries+' '+(totalEntries===1?'entry':'entries')}</span>
    {anyFilterActive && <button type="button" className="trail-clear" onClick={clearFilters}>{UI_TEXT.trail.clearFilters}</button>}
   </div>
  </div>}

  <div className="card trail-entries-card">
   <h2 className="trail-entries-title">Past entries <span className="trail-entries-count">({filteredEntries.length}{filteredEntries.length!==totalEntries?' of '+totalEntries:''})</span></h2>
   {totalEntries===0 ? <p className="sub">No entries yet. Your journal trail will build here as you reflect.</p> : filteredEntries.length===0 ? <p className="sub">{UI_TEXT.trail.emptyFiltered}</p> : <div className="trail-entry-list">{filteredEntries.map(e=>{
    const isOpen=openId===e.id;
    const childAge=entryChildAge(e);
    const childId=entryChildId(e);
    const phaseLabel=entryPhaseLabel(e);
    const isDecode=isBehaviourDecodeEntry(e);
    const reminder=isDecode?decodeReminderFromEntry(e):null;
    const entryKey=e.id||`${childId}-${entryDateValue(e)}-${entryTitle(e)}`;
    const canShare=e.id!==undefined&&e.id!==null&&e.id!=='';
    const lockInfo=entryLocks[String(e.id)];
    const isLocked=!!lockInfo?.isLocked;
    return <article key={entryKey} className={'trail-entry'+(isOpen?' is-open':'')+(isDecode?' is-decode':'')+(isLocked?' is-locked':'')}>
     <button type="button" className="trail-entry-toggle" aria-expanded={isOpen} onClick={()=>setOpenId(isOpen?null:e.id)}>
      <span className="trail-entry-main">
       <span className="trail-entry-title">{entryTitle(e)}</span>
       <span className="trail-entry-meta">{fmt(entryDateValue(e))}{phaseLabel?' · '+phaseLabel:''} · Child ID: {childId||'Not saved'} · {childAge||'-'} old</span>
      </span>
      <span className="trail-entry-chevron" aria-hidden="true">{isOpen?'−':'+'}</span>
     </button>
     <div className="trail-entry-actions">
      {isLocked ? <p className="parent-feedback-lock-note sub">{feedbackMeta.entryLockNotice}</p>
       : canShare ? <button type="button" className="btn btn-secondary trail-entry-review-btn" onClick={()=>enterShareMode(e.id)}>{reviewMeta.entryActionLabel||'Share this reflection for review'}</button>
       : <span className="trail-entry-review-note">{reviewMeta.entryNotShareable||'This saved entry cannot be shared yet.'}</span>}
     </div>
     {isDecode && <div className="decode-trail-card">
      <div className="decode-trail-header">
       <span className="pill">Alignment Reminder</span>
       <span className="decode-trail-type">Decode a Moment · Child ID: {childId||'Not saved'}</span>
      </div>
      <div className="decode-trail-summary">
       <div className="decode-trail-field"><span>Behaviour</span><p>{decodeDisplayText(reminder.observed_behaviour||reminder.moment_noticed)}</p></div>
       <div className="decode-trail-field"><span>A possible need worth staying curious about</span><p>{decodeDisplayText(reminder.possible_need_worth_staying_curious_about)}</p></div>
       <div className="decode-trail-field"><span>Possible CAB misalignment</span><p>{decodeDisplayText(reminder.possible_alignment_gap)}</p></div>
       <div className="decode-trail-field"><span>Growth capacity</span><p>{decodeDisplayText(reminder.stabilising_response_to_practise)}</p></div>
       <div className="decode-trail-field decode-trail-highlight"><span>Next action</span><p>{decodeDisplayText(reminder.next_action)}</p></div>
       <div className="decode-trail-field decode-trail-highlight"><span>Repair intention</span><p>{decodeDisplayText(reminder.repair_intention)}</p></div>
      </div>
      <p className="decode-trail-foot">This is a reflection, not an assessment of your child.</p>
     </div>}
     {isOpen && (isDecode ? <div className="trail-entry-detail trail-entry-detail-decode">
      <div className="decode-trail-summary decode-trail-summary-secondary">
       <div className="decode-trail-field"><span>One possible signal I explored</span><p>{decodeDisplayText(reminder.possible_signal_explored||reminder.awareness_signals)}</p></div>
       <div className="decode-trail-field"><span>What was happening in me</span><p><b>Thinking:</b> {decodeDisplayText(reminder.thinking)}<br/><b>Feelings:</b> {decodeDisplayText(reminder.feelings||reminder.affect_intensity)}<br/><b>Behaviour / What I did:</b> {decodeDisplayText(reminder.behaviour_what_i_did)}</p></div>
       <div className="decode-trail-field"><span>What I will observe next time</span><p>{decodeDisplayText(reminder.what_i_will_observe_next_time)}</p></div>
      </div>
     </div> : <div className="trail-entry-detail">
      <div className="trail-activity-detail">
       <div><strong>Thoughts:</strong> {e.cab?.thoughts||'-'}</div>
       <div><strong>Feelings:</strong> {e.cab?.feelings||'-'}</div>
       <div><strong>Actions:</strong> {e.cab?.actions||'-'}</div>
       <div><strong>Meaning:</strong> {e.cab?.meaning||'-'}</div>
       {(e.autoWords||[]).length>0 && <div className="trail-activity-words"><strong>Trait words:</strong> {e.autoWords.join(', ')}</div>}
       {Object.values(e.markers||{}).filter(m=>m.claimed).length>0 && <div className="trail-activity-markers">
        <strong>Markers claimed:</strong> {Object.entries(e.markers).filter(([,v])=>v.claimed).map(([k])=>MARKERS.find(m=>m.key===k)?.label||k).join(', ')}
       </div>}
      </div>
     </div>)}
    </article>;
   })}</div>}
  </div>
 </div>;
}

function RegisterDyad({parentId,initial,onSave,back,onSignOut}){
 const [f,setF]=useState({childId:initial.childId||genId('C'),parentDob:'',childDob:'',parentGender:'',childGender:'',disc:'',ethnicity:'Chinese'});
 const [saveError,setSaveError]=useState('');
 const [saving,setSaving]=useState(false);
 const set=(k,v)=>setF(p=>({...p,[k]:v}));
 const handleSave=async()=>{
  setSaveError('');
  setSaving(true);
  try{
   await onSave(f);
  }catch(err){
   setSaveError('We could not save this child yet. Please try again.');
  }finally{
   setSaving(false);
  }
 };
 return <div className="wrap">
  <Bar title="Set up your space" back={back} onSignOut={onSignOut}/>
  <div className="card">
   <p className="sub" style={{marginBottom:16}}>A one-time setup for <b>{parentId}</b>. No names — codes only.</p>
   <div className="field"><label>Child ID</label>
    <div style={{display:'flex',gap:8}}><input value={f.childId} onChange={e=>set('childId',e.target.value.toUpperCase())}/><button className="btn btn-ghost" style={{flexShrink:0}} onClick={()=>set('childId',genId('C'))}>New</button></div>
   </div>
   <div className="grid2">
    <div className="field"><label>Your birthdate</label><input type="date" value={f.parentDob} onChange={e=>set('parentDob',e.target.value)}/></div>
    <div className="field"><label>Child's birthdate</label><input type="date" value={f.childDob} onChange={e=>set('childDob',e.target.value)}/></div>
   </div>
   <div className="grid2">
    <div className="field"><label>Your gender</label><select value={f.parentGender} onChange={e=>set('parentGender',e.target.value)}><option value="">Prefer not to say</option><option value="Male">Male</option><option value="Female">Female</option><option value="Non-binary">Non-binary</option></select></div>
    <div className="field"><label>Child's gender</label><select value={f.childGender} onChange={e=>set('childGender',e.target.value)}><option value="">Prefer not to say</option><option value="Male">Male</option><option value="Female">Female</option><option value="Non-binary">Non-binary</option></select></div>
   </div>
   <div className="grid2">
    <div className="field"><label>DISC blend (if known)</label><input placeholder="optional — e.g. DSC" value={f.disc} onChange={e=>set('disc',e.target.value.toUpperCase())}/></div>
    <div className="field"><label>Cultural background</label><select value={f.ethnicity} onChange={e=>set('ethnicity',e.target.value)}>{Object.keys(CULTURE).map(c=><option key={c}>{c}</option>)}</select><p className="hint">Helps your counsellor offer culturally-attuned reflections.</p></div>
   </div>
   {saveError&&<p style={{color:'#c0392b',marginBottom:8}}>{saveError}</p>}
   <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>{saving?'Saving…':'Save & begin'}</button>
  </div>
 </div>;
}

function ClientJournal({parentId,dyad,onDone,back,user,onSignOut}){
 const [stage,setStage]=useState('entry'); // entry | review
 const [phase,setPhase]=useState('A');
 const [activity,setActivity]=useState('');
 const [cab,setCab]=useState({thoughts:'',feelings:'',actions:'',meaning:''});
 const [markers,setMarkers]=useState(Object.fromEntries(MARKERS.map(m=>[m.key,{claimed:false,evidence:''}])));
 const [autoWords,setAutoWords]=useState([]);
 const [tried,setTried]=useState(false);

 const setCabF=(k,v)=>setCab(p=>({...p,[k]:v}));
 const toggleMarker=(k)=>setMarkers(p=>({...p,[k]:{...p[k],claimed:!p[k].claimed,evidence:p[k].claimed?'':p[k].evidence}}));
 const setEv=(k,v)=>setMarkers(p=>({...p,[k]:{...p[k],evidence:v}}));

 const submitCAB=()=>{
  setTried(true);
  if(!activity){alert('Please pick the activity you did together.');return;}
  const anyCAB=cab.thoughts.trim()||cab.feelings.trim()||cab.actions.trim()||cab.meaning.trim();
  if(!anyCAB){alert('Please write something in at least one of the CAB fields to capture what happened.');return;}
  
  // Auto-analyze and generate descriptive words
  const words=analyzeCAB(cab);
  setAutoWords(words);
  setStage('review');
 };

 const finalSubmit=async()=>{
  const submittedAt=new Date().toISOString();
  const entry={id:Date.now(),parentId,childId:dyad.childId,date:submittedAt.split('T')[0],phase,activity,
    cab,autoWords,markers,disc:dyad.disc,ethnicity:dyad.ethnicity,childDob:dyad.childDob,parentDob:dyad.parentDob,parentGender:dyad.parentGender,childGender:dyad.childGender,submittedAt};
  await DB.saveEntry(user.id, entry);
  onDone(entry);
 };

 const childAge=dyad.childDob?ageFrom(dyad.childDob,new Date().toISOString().split('T')[0]):null;

 if(stage==='entry') return <div className="wrap">
  <Bar title={'Journalling · '+parentId} back={back} onSignOut={onSignOut}/>
  
  <div className="card">
   <h2>What were we doing?</h2>
   <div className="grid2">
    <div className="field"><label>ALIGN phase</label><select value={phase} onChange={e=>{setPhase(e.target.value);setActivity('');}}>{Object.entries(PHASES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
    <div className="field"><label>Activity <span className="req-star">*</span></label><select value={activity} onChange={e=>setActivity(e.target.value)}><option value="">Choose…</option>{ACTIVITIES[phase].map(a=><option key={a}>{a}</option>)}</select></div>
   </div>
  </div>

  <div className="card">
   <h2>What I noticed in myself</h2>
   <p className="sub" style={{marginBottom:18}}>Write what actually happened — not what you wish happened. Be honest and specific.</p>
   
   <div className="cab-block cog">
    <label>My thoughts — what went through my mind when I saw {activity?'my child during this activity':'what was happening'}</label>
    <textarea placeholder="Example: I worried they weren't doing it right, or that I should have explained better" value={cab.thoughts} onChange={e=>setCabF('thoughts',e.target.value)}/>
   </div>
   
   <div className="cab-block aff">
    <label>My feelings — what I felt when I saw {activity?'my child during this activity':'what was happening'}</label>
    <textarea placeholder="Example: Anxious, a bit frustrated, like I was failing as a parent" value={cab.feelings} onChange={e=>setCabF('feelings',e.target.value)}/>
   </div>
   
   <div className="cab-block beh">
    <label>My actions — what I actually did when I saw {activity?'my child during this activity':'what was happening'}</label>
    <textarea placeholder="Example: I jumped in and started directing, then took over when they hesitated" value={cab.actions} onChange={e=>setCabF('actions',e.target.value)}/>
   </div>
   
   <div className="cab-block mng">
    <label>The meaning I made — what I think this means when I saw {activity?'my child during this activity':'what was happening'}</label>
    <textarea placeholder="Example: I assumed their hesitation meant they couldn't do it without me helping" value={cab.meaning} onChange={e=>setCabF('meaning',e.target.value)}/>
    <p className="hint">Your own interpretation — there's no right answer.</p>
   </div>
   
   <button className="btn btn-primary btn-block" onClick={submitCAB}>Continue to reflection</button>
  </div>
 </div>;

 // Stage: review (after CAB submitted)
 return <div className="wrap">
  <Bar title={'Reflection · '+parentId} back={()=>setStage('entry')} onSignOut={onSignOut}/>
  
  {/* Section 2: Mirror - How I was */}
  <div className="card" style={{borderLeft:'4px solid var(--alert)'}}>
   <h2>How I was</h2>
   <p className="sub" style={{marginBottom:12}}>Based on what you wrote, these words describe your stance:</p>
   <div className="chips" style={{marginBottom:0}}>{autoWords.map(w=><div key={w} className="chip drive" style={{cursor:'default'}}>{w}</div>)}</div>
  </div>

  {/* NEW Section: Desired emotional scaffolding */}
  <div className="card" style={{borderLeft:'4px solid var(--sage)'}}>
   <h2>Desired emotional scaffolding for {childAge?`my ${childAge} old`:'my child'}</h2>
   <p className="sub" style={{marginBottom:12}}>What your child needs from you to feel safe and seen:</p>
   <div className="chips" style={{marginBottom:0}}>{CHILD_NEEDS_WORDS.map(w=><div key={w} className="chip warmth" style={{cursor:'default'}}>{w}</div>)}</div>
  </div>

  {/* Section 3: What I became aware of (stability markers) */}
  <div className="card">
   <h2>What I became aware of</h2>
   <p className="sub" style={{marginBottom:16}}>Tick what was genuinely there as you emotionally attended to your child:</p>
   
   {MARKERS.map(m=>{
    const st=markers[m.key];
    return <div key={m.key} className={'awareness-row'+(st.claimed?' on':'')}>
     <label className="awareness-checkline">
      <input type="checkbox" checked={st.claimed} onChange={()=>toggleMarker(m.key)}/>
      <span className="awareness-statement">{m.label}</span>
     </label>
     {st.claimed && <>
      <div className="awareness-input-wrap">
       <div className="awareness-input-label">What I will do:</div>
       <textarea className="awareness-textarea" placeholder="Write the concrete next step you want to remember." value={st.evidence} onChange={e=>setEv(m.key,e.target.value)} rows={3}/>
      </div>
      <p className="awareness-helper">{m.guide}</p>
     </>}
    </div>;
   })}
   
   <div style={{marginTop:20}}>
    <div style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',marginBottom:8}}>To support this shift:</div>
    <div style={{marginBottom:12}}>
     <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>Lower the gear on directing & correcting:</div>
     <div className="chips">{SHIFT_LOWER_DC.map(w=><div key={w} className="chip precise" style={{cursor:'default',opacity:0.6,fontSize:13}}>{w}</div>)}</div>
    </div>
    <div>
     <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:4}}>Raise the gear on warmth & presence:</div>
     <div className="chips">{SHIFT_RAISE_IS.map(w=><div key={w} className="chip warmth" style={{cursor:'default',opacity:0.6,fontSize:13}}>{w}</div>)}</div>
    </div>
   </div>
  </div>

  {/* Summary card */}
  <div className="card" style={{background:'linear-gradient(135deg, #FBF5EA 0%, #F5EFE3 100%)',border:'2px solid #E8DCC8'}}>
   <h3 style={{fontSize:16,marginBottom:12,color:'var(--forest)'}}>Remember for next time</h3>
   <div style={{fontSize:14,lineHeight:1.7}}>
    {Object.entries(markers).filter(([k,v])=>v.claimed && v.evidence.trim()).length>0 && <div style={{marginBottom:12}}>
     <strong>What I will do:</strong>
     <div style={{marginTop:4,fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>
      {Object.entries(markers).filter(([k,v])=>v.claimed && v.evidence.trim()).map(([k,v])=>v.evidence).join(' ')}
     </div>
    </div>}
    <div style={{marginBottom:10}}><strong>What my child needs:</strong> {CHILD_NEEDS_WORDS.join(', ')}</div>
    <div><strong>My shift:</strong> Lower D&C ({SHIFT_LOWER_DC.slice(0,2).join(', ')}), Raise I&S ({SHIFT_RAISE_IS.slice(0,2).join(', ')})</div>
   </div>
  </div>

  <button className="btn btn-primary btn-block" onClick={finalSubmit}>Add to my journal entry</button>
 </div>;
}

/* ---------- COUNSELLOR ---------- */
function toCounsellorEntry(raw){
 const entry=safeObject(raw);
 const cab=safeObject(entry.cab);
 const markers=safeObject(entry.markers);
 const parentId=safeParentId(entry.parentId||entry.parent_id);
 const childId=safeChildId(entry.childId||entry.child_id||entry.dyadId||entry.dyad_id);
 const date=firstStoredDateValue(entry.date,entry.submittedAt,entry.created_at)||'';
 const activity=entry.activity||entry.activityTitle||entry.title||'Untitled activity';
 return {
  ...entry,
  _key:String(entry.id||`${parentId}-${childId}-${date}-${activity}`),
  id:entry.id,
  parentId,
  childId,
  date,
  activity,
  phase:entry.phase||entry.phaseKey||'',
  parentGender:entry.parentGender||entry.parent_gender||'',
  childGender:entry.childGender||entry.child_gender||'',
  parentDob:entry.parentDob||entry.parent_dob||'',
  childDob:entry.childDob||entry.child_dob||'',
  cab:{thoughts:cab.thoughts||'',feelings:cab.feelings||'',actions:cab.actions||'',meaning:cab.meaning||''},
  markers,
  autoWords:safeArray(entry.autoWords||entry.valueWords),
  valueWords:safeArray(entry.valueWords||entry.autoWords)
 };
}

function buildCounsellorGrantGroups(grants,grantLinks,entries){
 const entryById=Object.fromEntries((entries||[]).map(e=>[String(e.id),e]));
 return (grants||[]).map(grant=>{
  const links=(grantLinks||[]).filter(l=>(l.grant_id||l.grantId)===grant.id);
  const grantEntries=links.map(link=>{
   const journalId=String(link.journal_entry_id||link.journalEntryId||'');
   const base=entryById[journalId];
   if(!base) return null;
   return {
    ...base,
    grantId:grant.id,
    grantEntryId:link.grantEntryId||link.id||link.grant_entry_id||null,
    journalEntryId:journalId
   };
  }).filter(Boolean);
  const childrenMap={};
  grantEntries.forEach(e=>{
   const childId=safeChildId(e.childId||e.child_id||e.dyadId||e.dyad_id)||'Not saved';
   if(!childrenMap[childId]){
    childrenMap[childId]={
     childId,
     childGender:e.childGender||e.child_gender||'',
     childDob:e.childDob||e.child_dob||'',
     ethnicity:e.ethnicity||'',
     disc:e.disc||'',
     entryCount:0
    };
   }
   childrenMap[childId].entryCount+=1;
  });
  const sample=grantEntries[0]||{};
  return {
   grant,
   entries:grantEntries,
   parentId:safeParentId(grant.parent_id||sample.parentId),
   parentUserId:grant.parent_user_id||null,
   parentGender:sample.parentGender||sample.parent_gender||'',
   parentDob:sample.parentDob||sample.parent_dob||'',
   ethnicity:sample.ethnicity||'',
   disc:sample.disc||'',
   children:Object.values(childrenMap)
  };
 }).filter(g=>g.entries.length>0);
}

const REVIEW_RESPONSE_SECTION_KEYS=[
 {key:'noticed',label:'What I noticed',placeholder:'Parent-approved moments you observed — use cautious, non-diagnostic language.'},
 {key:'possibleChildNeed',label:'Possible child need',placeholder:'A possible need that may have been emerging in the shared reflections.'},
 {key:'parentCabPattern',label:'Parent CAB pattern',placeholder:'What may have been happening in the parent’s thinking, feeling, and doing.'},
 {key:'alignmentGap',label:'Possible alignment gap',placeholder:'Where parent CAB may or may not have met the emerging need.'},
 {key:'repairAlignmentStrength',label:'What supports repair/alignment',placeholder:'What the parent may already be practising that supports repair or alignment.'},
 {key:'growthEdge',label:'Parent growth edge',placeholder:'One growth edge that might support emotional regulation — not a score or label.'},
 {key:'reflectionQuestion',label:'One reflection question',placeholder:'A curious question the parent might sit with.'},
 {key:'nextAction',label:'One next action / repair step',placeholder:'One specific, doable next step or repair idea.'}
];

const emptyReviewResponseSections=()=>Object.fromEntries(REVIEW_RESPONSE_SECTION_KEYS.map(s=>[s.key,'']));

const reviewResponseSectionsHaveContent=(sections)=>REVIEW_RESPONSE_SECTION_KEYS.some((s)=>(sections?.[s.key]||'').trim());

const buildReviewResponsePrefillFromContext=({entry,rv,aiAnalysis})=>{
 const sections=emptyReviewResponseSections();
 if(!entry) return sections;
 const cab=entry.cab||{};
 const trim=(value)=>String(value||'').trim();
 const joinParts=(parts)=>parts.map(trim).filter(Boolean).join(' ');
 const childYears=yearsFrom(entry.childDob,entry.date);
 const need=childYears!==null?childNeed(childYears):null;
 const moments=(rv?.moments||[]);
 const incongruent=moments.filter((m)=>m.congruence==='incongruent');
 const stanceKey=rv?.stance||'';
 const stancePhrase=stanceKey==='critical'
  ? 'a more directing or controlling parent response may have been present'
  : stanceKey==='rescuing'
   ? 'a rescuing or over-functioning parent response may have been present'
   : stanceKey==='nurturing'
    ? 'a nurturing, alongside presence may have been present'
    : '';

 if(isBehaviourDecodeEntry(entry)){
  const reminder=decodeReminderFromEntry(entry);
  const observed=trim(reminder.observed_behaviour||reminder.moment_noticed);
  const possibleNeed=trim(decodeDisplayText(reminder.possible_need_worth_staying_curious_about));
  const alignmentGap=trim(decodeDisplayText(reminder.possible_alignment_gap));
  const growth=trim(decodeDisplayText(reminder.stabilising_response_to_practise));
  const nextAction=trim(decodeDisplayText(reminder.next_action||reminder.repair_intention));
  if(observed) sections.noticed=`In this Decode a Moment reflection, the parent noticed ${observed}.`;
  if(possibleNeed) sections.possibleChildNeed=`A possible need worth staying curious about may be ${possibleNeed}.`;
  sections.parentCabPattern=joinParts([
   trim(reminder.thinking)?`The parent may have been thinking: "${trim(reminder.thinking)}"`:'',
   trim(reminder.feelings)?`They may have been feeling: "${trim(reminder.feelings)}"`:'',
   trim(reminder.behaviour_what_i_did)?`They may have responded by: "${trim(reminder.behaviour_what_i_did)}"`:''
  ]);
  if(alignmentGap) sections.alignmentGap=`This may suggest a possible alignment gap: ${alignmentGap}.`;
  if(trim(reminder.repair_intention)) sections.repairAlignmentStrength=`They may already be practising ${trim(reminder.repair_intention)}.`;
  if(growth) sections.growthEdge=`One growth edge might be ${growth}.`;
  if(trim(reminder.what_i_will_observe_next_time)) sections.reflectionQuestion=trim(reminder.what_i_will_observe_next_time);
  if(nextAction) sections.nextAction=nextAction;
  return sections;
 }

 const noticedParts=[];
 if(trim(cab.thoughts)||trim(cab.feelings)||trim(cab.actions)){
  noticedParts.push('In this shared reflection, the parent described their thinking, feelings, and actions in the moment.');
 }
 if(trim(cab.meaning)) noticedParts.push(`They may have made meaning of it this way: "${trim(cab.meaning)}".`);
 if(aiAnalysis?.cabCongruence) noticedParts.push(`This may suggest ${trim(aiAnalysis.cabCongruence)}`);
 if(incongruent.length) noticedParts.push('There may have been a moment where cognition, affect, and behaviour did not fully align.');
 sections.noticed=joinParts(noticedParts);

 if(need?.need) sections.possibleChildNeed=`A possible need worth staying curious about may be ${need.need.toLowerCase()}.`;
 if(aiAnalysis?.developmentalConsiderations) sections.possibleChildNeed=joinParts([sections.possibleChildNeed, trim(aiAnalysis.developmentalConsiderations)]);

 sections.parentCabPattern=joinParts([
  stancePhrase?`This may suggest ${stancePhrase}.`:'',
  trim(cab.thoughts)?`Thinking: "${trim(cab.thoughts)}"`:'',
  trim(cab.feelings)?`Feelings: "${trim(cab.feelings)}"`:'',
  trim(cab.actions)?`Behaviour: "${trim(cab.actions)}"`:'',
  trim(rv?.satir?.instinct)?`They may have been thinking: "${trim(rv.satir.instinct)}"`:''
 ]);

 sections.alignmentGap=joinParts([
  trim(rv?.gap)?trim(rv.gap):'',
  aiAnalysis?.possibleCopingPattern?`This may suggest ${trim(aiAnalysis.possibleCopingPattern)}`:''
 ]);

 sections.repairAlignmentStrength=joinParts([
  aiAnalysis?.protectiveFactors?trim(aiAnalysis.protectiveFactors):'',
  trim(rv?.satir?.congruent)?`They may already be practising: "${trim(rv.satir.congruent)}"`:'',
  trim(entry.cab?.meaning)?`They may already be noticing their own meaning-making: "${trim(entry.cab.meaning)}"`:''
 ]);

 sections.growthEdge=joinParts([
  trim(rv?.gap)?trim(rv.gap):'',
  aiAnalysis?.counsellorReflectionFocus?trim(aiAnalysis.counsellorReflectionFocus):''
 ]);

 const reflectionQ=incongruent.map((m)=>trim(m.question)).find(Boolean);
 if(reflectionQ) sections.reflectionQuestion=reflectionQ;

 sections.nextAction=joinParts([
  trim(rv?.satir?.cultural)?trim(rv.satir.cultural):'',
  trim(rv?.satir?.congruent)?trim(rv.satir.congruent):'',
  trim(rv?.gap)?trim(rv.gap):''
 ]);

 return sections;
};

const reviewSectionsFromRecord=(record)=>{
 const source=record?.responseSections||record?.response_sections||{};
 return {
  noticed:source.noticed||source.approved_observations||'',
  possibleChildNeed:source.possibleChildNeed||source.possible_child_need||'',
  parentCabPattern:source.parentCabPattern||source.parent_cab_pattern||source.parent_cab_evidence||'',
  alignmentGap:source.alignmentGap||source.alignment_gap||source.alignment_check||'',
  repairAlignmentStrength:source.repairAlignmentStrength||source.existing_capacity||source.repair_alignment_strength||'',
  growthEdge:source.growthEdge||source.growth_edge||'',
  reflectionQuestion:source.reflectionQuestion||source.reflection_question||'',
  nextAction:source.nextAction||source.next_action||source.repair_or_next_action||''
 };
};

function counsellorResponseStatusMeta(status,reviewMeta){
 const raw=String(status||'').trim().toLowerCase();
 const known=['pending','draft','published','revoked','unavailable'];
 const normalized=known.includes(raw)?raw:'unavailable';
 const labelMap={
  pending:reviewMeta?.responseStatusPending||'Pending response',
  draft:reviewMeta?.responseStatusDraft||'Draft saved',
  published:reviewMeta?.responseStatusPublished||'Published',
  revoked:reviewMeta?.responseStatusRevoked||'Revoked',
  unavailable:reviewMeta?.responseStatusUnavailable||'Status unavailable'
 };
 return {status:normalized,label:labelMap[normalized]};
}

const reviewSectionsToPayload=(sections)=>({
 noticed:sections.noticed||'',
 possible_child_need:sections.possibleChildNeed||'',
 parent_cab_pattern:sections.parentCabPattern||'',
 alignment_gap:sections.alignmentGap||'',
 repair_alignment_strength:sections.repairAlignmentStrength||'',
 growth_edge:sections.growthEdge||'',
 reflection_question:sections.reflectionQuestion||'',
 next_action:sections.nextAction||''
});

const buildParentFacingPreview=(sections)=>{
 const s=sections||{};
 const lines=[];
 lines.push('Counsellor reflection for your ALIGN/CAB review');
 lines.push('');
 lines.push('Parent-reported reflections you chose to share · for reflection, not diagnosis');
 lines.push('');
 if(s.noticed?.trim()) lines.push('What stood out\nThis may suggest '+s.noticed.trim());
 if(s.possibleChildNeed?.trim()) lines.push('\nA possible need that may have been emerging\nA possible need could be '+s.possibleChildNeed.trim());
 if(s.parentCabPattern?.trim()) lines.push('\nYour CAB in that moment\nThis may suggest a parent CAB pattern of '+s.parentCabPattern.trim());
 if(s.alignmentGap?.trim()) lines.push('\nAlignment check\nThis may suggest a possible alignment gap: '+s.alignmentGap.trim());
 if(s.repairAlignmentStrength?.trim()) lines.push('\nWhat you may already be practising\nYou may already be practising '+s.repairAlignmentStrength.trim());
 if(s.growthEdge?.trim()) lines.push('\nA possible growth edge\nOne growth edge might be '+s.growthEdge.trim());
 if(s.reflectionQuestion?.trim()) lines.push('\nOne reflection question\n'+s.reflectionQuestion.trim());
 if(s.nextAction?.trim()) lines.push('\nOne next step or repair idea\n'+s.nextAction.trim());
 lines.push('');
 lines.push('This reflection supports your ALIGN/CAB pathway. It is not a diagnosis of you or your child.');
 return lines.join('\n').trim();
};

function CounsellorReviewResponseComposer({user,authSession,grantContext,reviewMeta,prefillContext,embedded=false}){
 const grantId=grantContext?.grantId;
 const grantEntryId=grantContext?.grantEntryId;
 const journalEntryId=grantContext?.journalEntryId;
 const [sections,setSections]=useState(emptyReviewResponseSections());
 const [responseRecord,setResponseRecord]=useState(null);
 const [uiState,setUiState]=useState('loading');
 const [error,setError]=useState('');
 const [previewOpen,setPreviewOpen]=useState(false);
 const prefillAppliedRef=useRef(false);
 const parentFacingPreview=useMemo(()=>buildParentFacingPreview(sections),[sections]);
 const status=responseRecord?.status||'none';
 const responseRowId=responseRecord?.id||responseRecord?.responseId||null;
 const isDraftEditable=status==='draft'||status==='none';
 const canPublish=isDraftEditable&&!!parentFacingPreview.trim();
 const canRevoke=status==='published';
 const composerClass='counsellor-response-composer'+(embedded?' counsellor-response-composer--embedded':'')+(uiState==='unavailable'?' counsellor-response-composer--unavailable':'');

 const applyPrefillFromContext=()=>{
  if(!prefillContext) return emptyReviewResponseSections();
  return buildReviewResponsePrefillFromContext(prefillContext);
 };

 const loadResponse=async()=>{
  if(!grantEntryId||!user?.id||!authSession?.access_token){
   setUiState('error');
   setError('Review response could not be loaded.');
   return;
  }
  setUiState('loading');
  setError('');
  try{
   const result=await DB.getCounsellorReviewResponseForGrantEntry(user.id,grantEntryId,authSession);
   if(result.unavailable){
    setUiState('unavailable');
    setResponseRecord(null);
    return;
   }
   if(result.response){
    setResponseRecord(result.response);
    setSections(reviewSectionsFromRecord(result.response));
    prefillAppliedRef.current=true;
    setUiState(result.response.status==='published'?'published':result.response.status==='revoked'?'revoked':'draft');
   }else{
    setResponseRecord(null);
    const prefill=applyPrefillFromContext();
    const hasPrefill=reviewResponseSectionsHaveContent(prefill);
    setSections(hasPrefill?prefill:emptyReviewResponseSections());
    prefillAppliedRef.current=hasPrefill;
    setUiState('none');
   }
  }catch(err){
   setUiState('error');
   setError('Review response could not be loaded.');
   AuthDebug.log('[counsellor] review response load failed:', { message: err?.message || String(err) });
  }
 };

 useEffect(()=>{prefillAppliedRef.current=false;loadResponse();},[user?.id,grantEntryId,authSession?.access_token]);

 const handleRegeneratePrefill=()=>{
  if(!isDraftEditable)return;
  const prefill=applyPrefillFromContext();
  if(!reviewResponseSectionsHaveContent(prefill)) return;
  setSections(prefill);
  prefillAppliedRef.current=true;
  if(uiState!=='saving'&&uiState!=='publishing'&&uiState!=='revoking') setUiState(status==='draft'?'draft':'none');
 };

 const grantMeta=()=>({
  grantId,
  grantEntryId,
  journalEntryId,
  parentUserId:responseRecord?.parentUserId||grantContext?.parentUserId||null,
  parentId:responseRecord?.parentId||grantContext?.parentId||null,
  counsellorWayfinderId:responseRecord?.counsellorWayfinderId||grantContext?.counsellorWayfinderId||null
 });

 const handleSaveDraft=async()=>{
  if(!isDraftEditable)return;
  const meta=grantMeta();
  if(!meta.grantId||!meta.grantEntryId||!meta.journalEntryId||!meta.parentUserId||!meta.parentId||!meta.counsellorWayfinderId){
   setError('Grant entry context is incomplete. Save is not available right now.');
   return;
  }
  setUiState('saving');
  setError('');
  try{
   const result=await DB.saveCounsellorReviewResponseDraft(user.id,meta,{
    responseSections:reviewSectionsToPayload(sections),
    parentFacingText:parentFacingPreview
   },authSession);
   if(result.unavailable){
    setUiState('unavailable');
    return;
   }
   if(!result.ok||!result.response){
    setUiState(status==='none'?'none':'draft');
    const perEntryStage=String(result.errorStage||'').startsWith('perEntry');
    setError(
     result.errorStage==='notDraft'
      ? 'This response is no longer a draft.'
      : perEntryStage
       ? (reviewMeta?.responseComposerUnavailable||'Counsellor response storage is not available yet. Existing grant review remains available.')
       : 'Draft could not be saved. Please try again.'
    );
    if(perEntryStage) setUiState('unavailable');
    return;
   }
   setResponseRecord(result.response);
   setSections(reviewSectionsFromRecord(result.response));
   setUiState('draft');
  }catch(err){
   setUiState(status==='none'?'none':'draft');
   setError('Draft could not be saved. Please try again.');
   AuthDebug.log('[counsellor] review response save failed:', { message: err?.message || String(err) });
  }
 };

 const handlePublish=async()=>{
  if(!canPublish)return;
  setUiState('publishing');
  setError('');
  try{
   const saveResult=await DB.saveCounsellorReviewResponseDraft(user.id,grantMeta(),{
    responseSections:reviewSectionsToPayload(sections),
    parentFacingText:parentFacingPreview
   },authSession);
   if(saveResult.unavailable){
    setUiState('unavailable');
    return;
   }
   if(!saveResult.ok||!(saveResult.response?.id||saveResult.response?.responseId)){
    setUiState('draft');
    const perEntryStage=String(saveResult.errorStage||'').startsWith('perEntry');
    setError(
     perEntryStage
      ? (reviewMeta?.responseComposerUnavailable||'Counsellor response storage is not available yet. Existing grant review remains available.')
      : 'Response could not be prepared for publishing.'
    );
    if(perEntryStage) setUiState('unavailable');
    return;
   }
   const publishResult=await DB.publishCounsellorReviewResponse(user.id,saveResult.response.id||saveResult.response.responseId,authSession);
   if(publishResult.unavailable){
    setUiState('unavailable');
    return;
   }
   if(!publishResult.ok){
    setUiState('draft');
    setError('Response could not be published. The grant may no longer be active.');
    return;
   }
   await loadResponse();
  }catch(err){
   setUiState('draft');
   setError('Response could not be published. Please try again.');
   AuthDebug.log('[counsellor] review response publish failed:', { message: err?.message || String(err) });
  }
 };

 const handleRevoke=async()=>{
  if(!responseRowId||!canRevoke)return;
  setUiState('revoking');
  setError('');
  try{
   const result=await DB.revokeCounsellorReviewResponse(user.id,responseRowId,authSession);
   if(result.unavailable){
    setUiState('unavailable');
    return;
   }
   if(!result.ok){
    setUiState('published');
    setError('Published response could not be revoked.');
    return;
   }
   await loadResponse();
  }catch(err){
   setUiState('published');
   setError('Published response could not be revoked.');
   AuthDebug.log('[counsellor] review response revoke failed:', { message: err?.message || String(err) });
  }
 };

 if(uiState==='unavailable') return <div className={composerClass}>
  {!embedded && <h4>{reviewMeta?.responseComposerTitle||'Parent-facing response'}</h4>}
  <p className="sub">{reviewMeta?.responseComposerUnavailable||'Counsellor response storage is not available yet. Existing grant review remains available.'}</p>
 </div>;

 if(uiState==='loading') return <div className={composerClass}>
  {!embedded && <h4>{reviewMeta?.responseComposerTitle||'Parent-facing response'}</h4>}
  <p className="sub">Loading response…</p>
 </div>;

 return <div className={composerClass}>
  <div className="counsellor-response-composer-head">
   {!embedded && <h4>{reviewMeta?.responseComposerTitle||'Parent-facing response'}</h4>}
   <span className={'counsellor-response-status counsellor-response-status--'+((uiState==='saving'||uiState==='publishing'||uiState==='revoking')?status:uiState)}>
    {uiState==='saving'?'Saving draft…':uiState==='publishing'?'Publishing…':uiState==='revoking'?'Revoking…':
     status==='published'?'Published':status==='revoked'?'Revoked':status==='draft'?'Draft saved':'No response yet'}
   </span>
  </div>
  <p className="counsellor-response-note sub">{embedded?(reviewMeta?.responsePrefillNote||reviewMeta?.responseComposerNote):reviewMeta?.responseComposerNote||'Draft a bounded, non-diagnostic reflection for the parent. You remain responsible for what is shared.'}</p>
  {error&&<p className="counsellor-response-error">{error}</p>}
  {isDraftEditable&&prefillContext&&<div className="counsellor-response-regenerate-wrap">
   <button type="button" className="btn btn-ghost counsellor-response-regenerate" disabled={uiState==='saving'||uiState==='publishing'||uiState==='revoking'} onClick={handleRegeneratePrefill}>{reviewMeta?.responseRegeneratePrefill||'Regenerate draft from review context'}</button>
  </div>}
  <div className="counsellor-response-fields">
   {REVIEW_RESPONSE_SECTION_KEYS.map(field=><label key={field.key} className="counsellor-response-field">
    <span className="counsellor-response-field-label">{field.label}</span>
    <textarea
     rows={3}
     value={sections[field.key]||''}
     placeholder={field.placeholder}
     disabled={!isDraftEditable||uiState==='saving'||uiState==='publishing'||uiState==='revoking'}
     onChange={ev=>setSections(prev=>({...prev,[field.key]:ev.target.value}))}
    />
   </label>)}
  </div>
  <div className="counsellor-response-preview-wrap">
   <button type="button" className="counsellor-response-preview-toggle" aria-expanded={previewOpen} onClick={()=>setPreviewOpen(v=>!v)}>
    {previewOpen?'Hide':'Show'} parent-facing preview
   </button>
   {previewOpen&&<pre className="counsellor-response-preview">{parentFacingPreview||'Complete the fields above to generate a cautious parent-facing preview.'}</pre>}
  </div>
  <div className="counsellor-response-actions">
   <button type="button" className="btn btn-ghost" disabled={!isDraftEditable||uiState==='saving'||uiState==='publishing'||uiState==='revoking'} onClick={handleSaveDraft}>Save draft</button>
   <button type="button" className="btn btn-primary" disabled={!canPublish||uiState==='saving'||uiState==='publishing'||uiState==='revoking'} onClick={handlePublish}>Publish response</button>
   <button type="button" className="btn btn-ghost" disabled={!canRevoke||uiState==='revoking'||uiState==='publishing'} onClick={handleRevoke}>Revoke response</button>
  </div>
 </div>;
}

function CounsellorReviewGrantGroup({group,reviewMeta,onOpenEntry,flags,responseStatuses}){
 const [expanded,setExpanded]=useState(false);
 const fmtDate=(value)=>{
  const dt=parseStoredDate(value);
  return dt?dt.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'}):'-';
 };
 const referenceDate=group.entries[0]?.date;
 const parentAgeCompact=ageCompact(group.parentDob,referenceDate);
 const grantExpires=group.grant?.expires_at?fmtDate(group.grant.expires_at):'-';
 const entryMatchesChild=(entry,childId)=>safeChildId(entry.childId||entry.child_id||entry.dyadId||entry.dyad_id)===childId;
 const parentReportedParts=(gender,ageText,ethnicity,disc)=>{
  const parts=[];
  if(gender)parts.push(gender);
  if(ageText)parts.push(ageText);
  if(ethnicity)parts.push(ethnicity);
  if(disc)parts.push('DISC '+disc);
  return parts.length?parts.join(' · '):'Not saved';
 };
 return <div className="counsellor-grant-group card">
  <div className="counsellor-grant-group-head">
   <button type="button" className="counsellor-grant-toggle" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>
    <span className="counsellor-grant-toggle-icon" aria-hidden="true">{expanded?'v':'>'}</span>
    <span className="counsellor-grant-toggle-title">{reviewMeta.contextProfileTitle||'Wayfinder review context'}</span>
   </button>
   <span className="pill">{reviewMeta.grantExpiresLabel||'Review access expires'}: {grantExpires}</span>
  </div>
  {!expanded && <div className="counsellor-grant-collapsed-summary">
   <p className="counsellor-grant-collapsed-note">{reviewMeta.contextProfileNote||'Parent-reported context only — for ALIGN/CAB review, not diagnosis or profiling.'}</p>
   <div className="counsellor-grant-summary-line"><strong>{reviewMeta.parentSummaryLabel||'Parent'}</strong> {group.parentId||'Not saved'}{parentAgeCompact?' · '+parentAgeCompact:''}</div>
   {group.children.map(child=>{
    const childAgeCompact=ageCompact(child.childDob,referenceDate);
    const entryLabel=child.entryCount===1?(reviewMeta.entryCountSingular||'entry'):(reviewMeta.entryCountPlural||'entries');
    return <div key={child.childId} className="counsellor-grant-summary-line"><strong>{reviewMeta.childSummaryLabel||'Child'}</strong> {child.childId}{childAgeCompact?' · '+childAgeCompact:''} · {child.entryCount} {entryLabel}</div>;
   })}
  </div>}
  {expanded && <>
   <p className="counsellor-grant-context-note">{reviewMeta.contextProfileNote||'Parent-reported context only — for ALIGN/CAB review, not diagnosis or profiling.'}</p>
   <div className="counsellor-grant-context-grid">
    <div className="counsellor-grant-context-block">
     <h4>{reviewMeta.parentContextLabel||'Parent context'}</h4>
     <p><strong>{reviewMeta.parentWayfinderLabel||'Wayfinder Parent ID'}:</strong> {group.parentId||'Not saved'}</p>
     <p>{reviewMeta.parentReportedLabel||'Parent-reported'}: {parentReportedParts(group.parentGender,ageFrom(group.parentDob,referenceDate),group.ethnicity,group.disc)}</p>
    </div>
   </div>
   {group.children.map(child=>{
    const childAge=ageFrom(child.childDob,referenceDate);
    const childEntries=group.entries.filter(e=>entryMatchesChild(e,child.childId));
    return <div key={child.childId} className="counsellor-grant-child-group">
     <div className="counsellor-grant-context-block">
      <h4>{reviewMeta.childContextLabel||'Child context'}</h4>
      <p><strong>{reviewMeta.childWayfinderLabel||'Child ID'}:</strong> {child.childId}</p>
      <p>{reviewMeta.parentReportedLabel||'Parent-reported'}: {parentReportedParts(child.childGender,childAge,child.ethnicity,child.disc)}</p>
      <p className="sub">{child.entryCount} {child.entryCount===1?(reviewMeta.entryCountSingular||'shared entry'):(reviewMeta.entryCountPluralShared||'shared entries')}</p>
     </div>
     <div className="counsellor-grant-entries">
      <h4>{reviewMeta.sharedEntriesLabel||'Parent-approved entries'}</h4>
      {childEntries.map(e=>{
       const isDecode=isBehaviourDecodeEntry(e);
       const activityLabel=isDecode?'Decode a Moment · Alignment Reminder':e.activity;
       const entryChildAge=ageFrom(e.childDob,e.date);
       const rawStatus=responseStatuses?.[e._key]??responseStatuses?.[e.grantEntryId];
       const entryStatus=rawStatus===undefined?'unavailable':rawStatus;
       const statusMeta=counsellorResponseStatusMeta(entryStatus,reviewMeta);
       return <button type="button" key={e._key} className="counsellor-grant-entry-row" onClick={()=>onOpenEntry(e._key)}>
        <div className="counsellor-grant-entry-row-head">
         <span className="counsellor-grant-entry-title">{activityLabel}</span>
         <span className={'counsellor-grant-entry-status counsellor-grant-entry-status--'+statusMeta.status} aria-label={'Response status: '+statusMeta.label}>{statusMeta.label}</span>
        </div>
        <span className="counsellor-grant-entry-meta">{fmtDate(e.date)}{entryChildAge?' · '+entryChildAge:''}</span>
        {flags?.[e._key]&&<span className="counsellor-grant-entry-flag">{flags[e._key]}</span>}
        <span className="counsellor-grant-entry-action">{reviewMeta.openEntryLabel||'Open for ALIGN/CAB review'}</span>
       </button>;
      })}
     </div>
    </div>;
   })}
  </>}
 </div>;
}

function counsellorLongitudinalParentIds(entries,summaries){
 const counts=(entries||[]).reduce((acc,e)=>{
  const pid=safeParentId(e.parentId||e.parent_id);
  if(!pid)return acc;
  acc[pid]=(acc[pid]||0)+1;
  return acc;
 },{});
 const eligible=Object.keys(counts).filter(pid=>counts[pid]>=2);
 const withSummary=Object.keys(summaries||{});
 return [...new Set([...eligible,...withSummary])];
}

function CounsellorLongitudinalSection({entries,summaries,openState,onToggle,reviewMeta}){
 const parentIds=counsellorLongitudinalParentIds(entries,summaries);
 if(!parentIds.length)return null;
 return <div className="counsellor-longitudinal-section">
  <h3 className="counsellor-section-title">{reviewMeta.longitudinalTitle||'Longitudinal AI Reflections'}</h3>
  <p className="counsellor-section-note sub">{reviewMeta.longitudinalNote||'Assistive reflection across parent-granted entries — for ALIGN/CAB review support, not diagnosis or profiling.'}</p>
  {parentIds.map(pid=>{
   const summary=summaries?.[pid];
   const isOpen=!!openState[pid];
   return <div key={pid} className="counsellor-longitudinal-item">
    <button type="button" className="counsellor-longitudinal-toggle" aria-expanded={isOpen} onClick={()=>onToggle(pid)}>
     <span className="counsellor-longitudinal-toggle-icon" aria-hidden="true">{isOpen?'v':'>'}</span>
     <span>Parent {pid}</span>
    </button>
    {isOpen && summary && <div className="counsellor-longitudinal-body">
     <p><strong>Recurring Patterns:</strong> {summary.recurringPatterns}</p>
     <p><strong>Coping Evolution:</strong> {summary.copingEvolution}</p>
     <p><strong>DISC Pattern:</strong> {summary.discPatternAcrossEntries}</p>
     <p><strong>Blind Spots:</strong> {summary.blindSpots}</p>
     <p><strong>Protective Factors:</strong> {summary.protectiveFactors}</p>
     <p><strong>Developmental Considerations:</strong> {summary.developmentalConsiderations}</p>
     <p><strong>Counsellor Focus:</strong> {summary.counsellorFocus}</p>
    </div>}
    {isOpen && !summary && <p className="sub counsellor-longitudinal-unavailable">{reviewMeta.longitudinalUnavailable||'Assistive reflection is not available for this parent right now.'}</p>}
   </div>;
  })}
 </div>;
}

const mhpStatusLabel=(value)=>{
 const raw=String(value||'').trim().toLowerCase();
 if(!raw) return 'Not saved';
 return raw.split('_').map(part=>part?part.charAt(0).toUpperCase()+part.slice(1):'').join(' ');
};

const mhpApplyExtractedFieldsToProfileDraft=(form,fields)=>{
 const next={...form};
 if(fields?.fullName) next.fullName=fields.fullName;
 if(fields?.professionalTitle) next.professionalTitle=fields.professionalTitle;
 if(fields?.licenseRegistrationNumber) next.licenseRegistrationNumber=fields.licenseRegistrationNumber;
 if(fields?.accreditationNumber) next.accreditationNumber=fields.accreditationNumber;
 if(fields?.issuingBody) next.issuingBody=fields.issuingBody;
 return next;
};

const mhpDateInputValue=(value)=>{
 const raw=String(value||'').trim();
 if(/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
 const dt=parseStoredDate(raw);
 if(!dt||isNaN(dt)) return '';
 const y=dt.getFullYear();
 const m=String(dt.getMonth()+1).padStart(2,'0');
 const d=String(dt.getDate()).padStart(2,'0');
 return `${y}-${m}-${d}`;
};

const mhpExtractedLicenseFields=(extracted,extractionFallback)=>{
 const source=extracted&&typeof extracted==='object'?extracted:{};
 const fallback=extractionFallback&&typeof extractionFallback==='object'?extractionFallback:{};
 const pick=(key)=>String(source[key]||fallback[key]||'').trim();
 return {
  fullName:pick('full_name'),
  professionalTitle:pick('professional_title')||pick('credential_label'),
  credentialLabel:pick('credential_label'),
  issuingBody:pick('issuing_body'),
  licenseRegistrationNumber:pick('license_registration_number'),
  accreditationNumber:pick('accreditation_number'),
  validFrom:pick('valid_from'),
  validTo:pick('valid_to'),
  rawValidityText:pick('raw_validity_text')
 };
};

const mhpDedupeLicenseDocuments=(docs)=>{
 const seen=new Map();
 (Array.isArray(docs)?docs:[]).forEach((doc)=>{
  if(doc?.id&&!seen.has(doc.id)) seen.set(doc.id,doc);
 });
 return [...seen.values()].sort((a,b)=>{
  const ad=parseStoredDate(a?.createdAt);
  const bd=parseStoredDate(b?.createdAt);
  const aTime=ad&&!isNaN(ad)?ad.getTime():0;
  const bTime=bd&&!isNaN(bd)?bd.getTime():0;
  return bTime-aTime;
 });
};

const mhpMergeLicenseDocuments=(existing,incoming)=>{
 return mhpDedupeLicenseDocuments([...(Array.isArray(incoming)?incoming:[]),...(Array.isArray(existing)?existing:[])]);
};

const mhpUploadFallbackDocument=(uploadSuccess)=>{
 if(!uploadSuccess?.documentId) return null;
 return {
  id: uploadSuccess.documentId,
  originalFilename: uploadSuccess.filename||'Licence document.pdf',
  documentStatus: 'uploaded',
  extractionStatus: 'pending',
  createdAt: uploadSuccess.uploadedAt||new Date().toISOString(),
  extractedJson: null
 };
};

const MentalHealthProfessionalLicenseExtractionReview=({doc,meta,fmtDate,editable,onApplyExtractedDetails,appliedDocId})=>{
 const [reviewFields,setReviewFields]=useState(()=>mhpExtractedLicenseFields(doc?.extractedJson));
 const [isAdjusting,setIsAdjusting]=useState(false);
 useEffect(()=>{
  setReviewFields(mhpExtractedLicenseFields(doc?.extractedJson));
  setIsAdjusting(false);
 },[doc?.id, doc?.extractedJson]);
 const setReviewField=(key,value)=>setReviewFields((prev)=>({...prev,[key]:value}));
 const display=(value)=>value||'-';
 const showInputs=!!editable&&isAdjusting;
 const canApply=!!editable&&typeof onApplyExtractedDetails==='function'&&!!(
  reviewFields.fullName
  ||reviewFields.professionalTitle
  ||reviewFields.licenseRegistrationNumber
  ||reviewFields.accreditationNumber
  ||reviewFields.issuingBody
 );
 const showApplySuccess=!!appliedDocId&&doc?.id===appliedDocId;
 const reviewInput=(key,type='text')=><input
  type={type}
  className="mhp-license-review-input"
  value={type==='date'?mhpDateInputValue(reviewFields[key]):(reviewFields[key]||'')}
  onChange={(e)=>setReviewField(key,e.target.value)}
 />;
 const reviewViewerField=(label,value,{wide=false,date=false}={})=><div className={'mhp-license-review-field mhp-license-review-field--viewer'+(wide?' mhp-license-review-field-wide':'')}>
  <span className="mhp-license-review-label">{label}</span>
  <span className="mhp-license-review-value">{date?(value?fmtDate(value):'-'):display(value)}</span>
 </div>;
 const reviewEditorField=(label,key,{wide=false,type='text'}={})=><label className={'mhp-license-review-field mhp-license-review-field--editing'+(wide?' mhp-license-review-field-wide':'')}>
  <span className="mhp-license-review-label">{label}</span>
  {type==='date' ? <>
   <input type="date" className="mhp-license-review-input" value={mhpDateInputValue(reviewFields[key])} onChange={(e)=>setReviewField(key,e.target.value)}/>
   {reviewFields[key] ? <span className="mhp-license-review-date-hint">{fmtDate(reviewFields[key])}</span> : null}
  </> : reviewInput(key,type)}
 </label>;
 return <div className={'mhp-license-review-panel'+(showInputs?' mhp-license-review-panel--adjusting':' mhp-license-review-panel--viewer')}>
  <h5>{meta.licenseExtractionReviewTitle||'Review extracted details'}</h5>
  <div className="mhp-license-review-intro">
   <p>{meta.licenseReviewIntroPrivatePdf||'Review values from your private licence PDF.'}</p>
   <p>{meta.licenseReviewIntroAdjustOnly||'Adjust only if extraction is wrong.'}</p>
   <p>{meta.licenseReviewIntroApplyAbove||'Apply values to the profile draft above, then save from the top form.'}</p>
  </div>
  {editable ? <div className="mhp-license-review-mode-actions">
   {showInputs
    ? <button type="button" className="btn btn-secondary btn-sm" onClick={()=>setIsAdjusting(false)}>{meta.licenseReviewDoneAdjusting||'Done adjusting'}</button>
    : <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setIsAdjusting(true)}>{meta.licenseReviewAdjustDetails||'Adjust extracted details'}</button>}
  </div> : null}
  <div className={'mhp-license-review-grid'+(showInputs?' mhp-license-review-grid--adjusting':' mhp-license-review-grid--viewer')}>
   {showInputs ? <>
    {reviewEditorField(meta.licenseReviewFullName||'Full name','fullName')}
    {reviewEditorField(meta.licenseReviewProfessionalTitle||'Professional title / credential','professionalTitle')}
    {reviewEditorField(meta.licenseReviewIssuingBody||'Issuing body','issuingBody')}
    {reviewEditorField(meta.licenseReviewLicenseNumber||'Licence / certificate number','licenseRegistrationNumber')}
    {reviewEditorField(meta.licenseReviewAccreditationNumber||'Accreditation number','accreditationNumber')}
    {reviewEditorField(meta.licenseReviewValidFrom||'Valid from','validFrom',{type:'date'})}
    {reviewEditorField(meta.licenseReviewValidTo||'Valid to','validTo',{type:'date'})}
    {reviewEditorField(meta.licenseReviewRawValidityText||'Raw validity text','rawValidityText',{wide:true})}
   </> : <>
    {reviewViewerField(meta.licenseReviewFullName||'Full name',reviewFields.fullName)}
    {reviewViewerField(meta.licenseReviewProfessionalTitle||'Professional title / credential',reviewFields.professionalTitle)}
    {reviewViewerField(meta.licenseReviewIssuingBody||'Issuing body',reviewFields.issuingBody)}
    {reviewViewerField(meta.licenseReviewLicenseNumber||'Licence / certificate number',reviewFields.licenseRegistrationNumber)}
    {reviewViewerField(meta.licenseReviewAccreditationNumber||'Accreditation number',reviewFields.accreditationNumber)}
    {reviewViewerField(meta.licenseReviewValidFrom||'Valid from',reviewFields.validFrom,{date:true})}
    {reviewViewerField(meta.licenseReviewValidTo||'Valid to',reviewFields.validTo,{date:true})}
    {reviewViewerField(meta.licenseReviewRawValidityText||'Raw validity text',reviewFields.rawValidityText,{wide:true})}
   </>}
  </div>
  {canApply ? <div className="mhp-license-review-actions">
   <button type="button" className="btn btn-secondary" onClick={()=>onApplyExtractedDetails(doc.id,reviewFields)}>{meta.licenseApplyToProfileDraft||'Use reviewed details in my profile draft'}</button>
  </div> : null}
  {showApplySuccess ? <p className="mhp-license-apply-success" role="status" aria-live="polite">{meta.licenseApplyToProfileDraftSuccess||'Reviewed details applied to your profile draft. Please save your draft.'}</p> : null}
  <span className="mhp-license-human-review-pill">{meta.licenseHumanReviewRequired||'Human review required'}</span>
  <p className="sub mhp-license-review-workflow-note">{meta.licenseApplyReviewWorkflowNote||'Submit for Wayfinder review will be available after profile and licence review workflow is enabled.'}</p>
  <p className="mhp-license-review-warning">{meta.licenseExtractionAccuracyWarning||'AI extraction may be inaccurate. Check names, registration numbers, issuing body, and expiry dates before submitting.'}</p>
 </div>;
};

const mhpDefaultProfileForm=()=>({
 photoUrl:'',
 fullName:'',
 professionalTitle:'',
 licenseRegistrationNumber:'',
 accreditationNumber:'',
 issuingBody:'',
 shortBio:'',
 countryOfOrigin:'',
 ethnicity:'',
 enquiryEmail:'ask.anything@psytec.com.sg',
 enquiryMobile:'+65 91681166'
});

const mhpProfileFormFromRow=(profile)=>({
 photoUrl:profile?.photoUrl||'',
 fullName:profile?.fullName||'',
 professionalTitle:profile?.professionalTitle||'',
 licenseRegistrationNumber:profile?.licenseRegistrationNumber||'',
 accreditationNumber:profile?.accreditationNumber||'',
 issuingBody:profile?.issuingBody||'',
 shortBio:profile?.shortBio||'',
 countryOfOrigin:profile?.countryOfOrigin||'',
 ethnicity:profile?.ethnicity||'',
 enquiryEmail:profile?.enquiryEmail||'ask.anything@psytec.com.sg',
 enquiryMobile:profile?.enquiryMobile||'+65 91681166'
});

function CounsellorWorkspaceNav({activeStage,reviewMeta,hostingMeta,mhpMeta,onStageChange}){
 return <div className="counsellor-nav">
  <button type="button" className={'counsellor-nav-btn'+(activeStage==='reflections'?' counsellor-nav-btn--active':'')} onClick={()=>onStageChange('reflections')}>{reviewMeta.title||hostingMeta.backToReflections||'Parent shared reflections'}</button>
  <button type="button" className={'counsellor-nav-btn'+(activeStage==='editProfile'?' counsellor-nav-btn--active':'')} onClick={()=>onStageChange('editProfile')}>{mhpMeta.editProfileNavLabel||'Edit profile'}</button>
  <button type="button" className={'counsellor-nav-btn'+(activeStage==='hostedEvents'?' counsellor-nav-btn--active':'')} onClick={()=>onStageChange('hostedEvents')}>{hostingMeta.title||'Events hosting'}</button>
  </div>;
}

function MentalHealthProfessionalLicenseSection({user,authSession,meta,editable,onApplyExtractedDetails,appliedExtractDocId}){
 const [documents,setDocuments]=useState([]);
 const [loading,setLoading]=useState(true);
 const [storageUnavailable,setStorageUnavailable]=useState(false);
 const [selectedFile,setSelectedFile]=useState(null);
 const [uploading,setUploading]=useState(false);
 const [uploadSuccess,setUploadSuccess]=useState(null);
 const [uploadError,setUploadError]=useState('');
 const [extractingDocId,setExtractingDocId]=useState('');
 const [extractionSuccessDocId,setExtractionSuccessDocId]=useState('');
 const [extractionErrors,setExtractionErrors]=useState({});
 const fileInputRef=useRef(null);

 const fmtDate=(value)=>{
  const dt=parseStoredDate(value);
  if(!dt||isNaN(dt)) return '-';
  return dt.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'});
 };

 const fmtDateTime=(value)=>{
  const dt=parseStoredDate(value);
  if(!dt||isNaN(dt)) return '-';
  return dt.toLocaleString('en-SG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
 };

 const clearFileInput=()=>{
  setSelectedFile(null);
  if(fileInputRef.current) fileInputRef.current.value='';
 };

 const mergeDocument=(doc)=>{
  if(!doc?.id) return;
  setDocuments((prev)=>mhpMergeLicenseDocuments(prev,[doc]));
 };

 const loadDocuments=async()=>{
  setLoading(true);
  try{
   const result=await DB.getMyMentalHealthProfessionalLicenseDocuments(user.id,authSession);
   if(result.unavailable){
    setStorageUnavailable(true);
    return;
   }
   if(!result.ok){
    AuthDebug.log('[mhp] licence documents read failed without unavailable flag');
    return;
   }
   setStorageUnavailable(false);
   const serverDocs=mhpDedupeLicenseDocuments(result.documents||[]);
   setDocuments((prev)=>serverDocs.length?serverDocs:mhpMergeLicenseDocuments(prev,serverDocs));
  }catch(err){
   AuthDebug.log('[mhp] licence documents load failed:', { message: err?.message || String(err) });
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{if(user?.id&&authSession?.access_token)loadDocuments();},[user?.id,authSession?.access_token]);

 const handleFileSelect=(event)=>{
  const file=event.target.files&&event.target.files[0];
  event.target.value='';
  if(!file) return;
  setSelectedFile(file);
  setUploadError('');
 };

 const handleUpload=async()=>{
  if(!selectedFile||uploading) return;
  const file=selectedFile;
  setUploading(true);
  setUploadError('');
  try{
   const result=await DB.uploadMentalHealthProfessionalLicenseDocument(user.id,file,authSession);
   if(result.unavailable||result.errorStage==='storageUnavailable'||result.errorStage==='metadataUnavailable'){
    setStorageUnavailable(true);
    setUploadError(meta.licenseStorageUnavailable||'Licence upload storage is not ready yet.');
    return;
   }
   if(!result.ok){
    setUploadError(result.errorStage==='invalidType'||result.errorStage==='tooLarge'
     ? (meta.licensePdfOnly||'Please choose a PDF file up to 10 MB.')
     : (meta.licenseUploadFailed||'Upload failed'));
    return;
   }
   const uploadedDoc=result.document||null;
   const successFilename=uploadedDoc?.originalFilename||file.name||'Licence document.pdf';
   const successUploadedAt=uploadedDoc?.createdAt||new Date().toISOString();
   const successDocumentId=uploadedDoc?.id||result.documentId||null;
   const nextUploadSuccess={
    filename: successFilename,
    uploadedAt: successUploadedAt,
    documentId: successDocumentId
   };
   setUploadSuccess(nextUploadSuccess);
   clearFileInput();
   const mergedDoc=uploadedDoc||mhpUploadFallbackDocument(nextUploadSuccess);
   if(mergedDoc) mergeDocument(mergedDoc);
   await loadDocuments();
  }catch(err){
   setUploadError(meta.licenseUploadFailed||'Upload failed');
   AuthDebug.log('[mhp] licence upload failed:', { message: err?.message || String(err) });
  }finally{
   setUploading(false);
  }
 };

 const handleExtract=async(documentId)=>{
  if(!documentId||extractingDocId) return;
  setExtractingDocId(documentId);
  setExtractionErrors((prev)=>({...prev,[documentId]:null}));
  const setExtractionFailure=(errorCode,errorMessage)=>{
   const message=errorCode==='openai_timeout'||errorCode==='extraction_timeout_guard'||errorCode==='pdf_text_parse_timeout'
    ? (meta.licenseExtractionTimeout||'Extraction took too long. Please try again later.')
    : (errorMessage||meta.licenseExtractionFailed||'Extraction failed. Please try again or contact Wayfinder support.');
   setExtractionErrors((prev)=>({
    ...prev,
    [documentId]:{
     message,
     errorCode: errorCode||null
    }
   }));
  };
  try{
   const result=await DB.requestMhpLicenseExtraction(user.id,documentId,authSession);
   if(result.unavailable){
    setStorageUnavailable(true);
    setExtractionErrors((prev)=>({...prev,[documentId]:{
     message: meta.licenseStorageUnavailable||'Licence upload storage is not ready yet.',
     errorCode: null
    }}));
    return;
   }
   if(!result.ok){
    setExtractionFailure(result.errorCode||result.errorStage||null,result.errorMessage||null);
    AuthDebug.log('[mhp] licence extraction failed:', {
     errorCode: result.errorCode || null,
     errorStage: result.errorStage || null
    });
    await loadDocuments();
    return;
   }
   if(result.document) mergeDocument(result.document);
   setExtractionSuccessDocId(documentId);
   setExtractionErrors((prev)=>({...prev,[documentId]:null}));
   await loadDocuments();
  }catch(err){
   setExtractionFailure(null);
   AuthDebug.log('[mhp] licence extraction failed:', { message: err?.message || String(err) });
  }finally{
   setExtractingDocId('');
  }
 };

 const canUpload=!!selectedFile&&!uploading&&!storageUnavailable;
 const chooseLabel=uploadSuccess&&!selectedFile
  ? (meta.licenseChooseAnother||'Choose another PDF')
  : (meta.licenseChooseFile||'Choose PDF');
 const displayDocuments=(()=>{
  let list=mhpDedupeLicenseDocuments(documents);
  if(uploadSuccess?.documentId&&!list.some((doc)=>doc.id===uploadSuccess.documentId)){
   const fallback=mhpUploadFallbackDocument(uploadSuccess);
   if(fallback) list=mhpMergeLicenseDocuments(list,[fallback]);
  }
  return list;
 })();
 const showDocumentList=displayDocuments.length>0;

 return <div className="card mhp-license-section">
  <h3>{meta.licenseSectionTitle||'Licence / registration document'}</h3>
  <p className="dashboard-helper">{meta.licenseSectionIntro||'Upload your licence or registration certificate as a PDF.'}</p>
  <p className="sub mhp-license-privacy-note">{meta.licensePrivacyNote||'Your PDF is private and not visible to parents.'}</p>
  {storageUnavailable ? <p className="sub mhp-license-unavailable">{meta.licenseStorageUnavailable||'Licence upload storage is not ready yet.'}</p> : <>
   {uploadSuccess ? <div className="mhp-license-upload-success" role="status" aria-live="polite">
    <p className="mhp-license-upload-success-message">{meta.licenseUploadSuccess||'Licence document uploaded. Extraction is pending.'}</p>
    <p className="mhp-license-upload-success-detail">{uploadSuccess.filename} · {fmtDateTime(uploadSuccess.uploadedAt)}</p>
   </div> : null}
   <div className="mhp-license-upload-row">
    <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="mhp-license-file-input" onChange={handleFileSelect} disabled={uploading}/>
    <button type="button" className="btn btn-secondary" disabled={uploading} onClick={()=>fileInputRef.current?.click()}>{chooseLabel}</button>
    <button type="button" className="btn btn-primary" disabled={!canUpload} onClick={handleUpload}>{uploading?(meta.licenseUploading||'Uploading…'):(meta.licenseUploadButton||'Upload PDF')}</button>
    {selectedFile ? <span className="mhp-license-selected-file">{selectedFile.name}</span> : null}
    {uploadError ? <span className="mhp-license-upload-status mhp-license-upload-status--error">{uploadError}</span> : null}
   </div>
   <p className="sub mhp-license-duplicate-hint">{meta.licenseUploadDuplicateHint||'Upload another document only if you are replacing or adding a newer certificate.'}</p>
   {loading&&!showDocumentList ? <p className="sub">Loading uploaded documents…</p> : !showDocumentList ? <p className="sub">{meta.licenseDocumentsEmpty||'No licence PDF uploaded yet.'}</p> : <>
    <h4 className="mhp-license-list-title">{meta.licenseUploadListTitle||'Uploaded licence documents'}</h4>
    <ul className="mhp-license-document-list">
    {displayDocuments.map(doc=>{
     const extractionStatus=String(doc.extractionStatus||'pending').trim().toLowerCase();
     const canExtract=extractionStatus==='pending'||extractionStatus==='failed'||extractionStatus==='processing';
     const isExtracting=extractingDocId===doc.id;
     const showExtractionSuccess=extractionSuccessDocId===doc.id||extractionStatus==='completed';
     const showReviewPanel=extractionStatus==='completed'&&doc.extractedJson;
     return <li key={doc.id} className={'mhp-license-document-item'+(uploadSuccess?.documentId&&doc.id===uploadSuccess.documentId?' mhp-license-document-item--recent':'')}>
     <div className="mhp-license-document-title">{doc.originalFilename||'Licence document.pdf'}</div>
     <div className="mhp-license-document-meta">
      <span>{meta.licenseDocumentStatusLabel||'Document status'}: {mhpStatusLabel(doc.documentStatus)}</span>
      <span>{meta.licenseExtractionStatusLabel||'Extraction status'}: {extractionStatus==='pending'?(meta.licenseExtractionPending||'Extraction pending'):mhpStatusLabel(doc.extractionStatus)}</span>
      <span>{meta.licenseUploadedDateLabel||'Uploaded'}: {fmtDate(doc.createdAt)}</span>
     </div>
     {canExtract ? <div className="mhp-license-extract-row">
      <button type="button" className="btn btn-secondary" disabled={!!extractingDocId||storageUnavailable} onClick={()=>handleExtract(doc.id)}>{isExtracting?(meta.licenseExtracting||'Extracting…'):(meta.licenseExtractDetails||'Extract details')}</button>
      {isExtracting ? <span className="mhp-license-extract-status">{meta.licenseExtracting||'Extracting…'}</span> : null}
      {extractionErrors[doc.id] ? <span className="mhp-license-extract-status mhp-license-extract-status--error">
       {extractionErrors[doc.id]?.message||extractionErrors[doc.id]}
       {AuthDebug.enabled()&&extractionErrors[doc.id]?.errorCode ? <span className="mhp-license-extract-debug"> · {meta.licenseExtractionDebugLabel||'Diagnostic'}: {extractionErrors[doc.id].errorCode}</span> : null}
      </span> : null}
     </div> : null}
     {showExtractionSuccess && extractionStatus==='completed' ? <div className="mhp-license-extraction-success" role="status" aria-live="polite">
      <p className="mhp-license-extraction-success-message">{meta.licenseExtractionDraftSuccess||'Draft details extracted. Please review before submitting for Wayfinder review.'}</p>
     </div> : null}
     {showReviewPanel ? <MentalHealthProfessionalLicenseExtractionReview doc={doc} meta={meta} fmtDate={fmtDate} editable={editable} onApplyExtractedDetails={onApplyExtractedDetails} appliedDocId={appliedExtractDocId}/> : null}
    </li>;
    })}
   </ul>
   </>}
  </>}
 </div>;
}

function MentalHealthProfessionalProfileEditor({user,authSession,meta}){
 const [loading,setLoading]=useState(true);
 const [unavailable,setUnavailable]=useState(false);
 const [status,setStatus]=useState(null);
 const [form,setForm]=useState(mhpDefaultProfileForm());
 const [profileStatus,setProfileStatus]=useState('draft');
 const [saveState,setSaveState]=useState('');
 const [saveError,setSaveError]=useState('');
 const [photoBroken,setPhotoBroken]=useState(false);
 const [appliedExtractDocId,setAppliedExtractDocId]=useState('');

 const fmtDate=(value)=>{
  const dt=parseStoredDate(value);
  if(!dt||isNaN(dt)) return '';
  return dt.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'});
 };

 const load=async()=>{
  setLoading(true);
  setUnavailable(false);
  setSaveError('');
  try{
   const [statusResult,profileResult]=await Promise.all([
    DB.getMyMentalHealthProfessionalStatus(user.id,authSession),
    DB.getMyMentalHealthProfessionalProfile(user.id,authSession)
   ]);
   if(statusResult.unavailable||profileResult.unavailable){
    setUnavailable(true);
    setStatus(null);
    setForm(mhpDefaultProfileForm());
    return;
   }
   setUnavailable(false);
   setStatus(statusResult.status||null);
   const profile=profileResult.profile;
   setForm(profile?mhpProfileFormFromRow(profile):mhpDefaultProfileForm());
   setProfileStatus(profile?.profileStatus||statusResult.status?.profileStatus||'draft');
   setPhotoBroken(false);
  }catch(err){
   setUnavailable(true);
   AuthDebug.log('[mhp] profile editor load failed:', { message: err?.message || String(err) });
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{if(user?.id&&authSession?.access_token)load();},[user?.id,authSession?.access_token]);

 const editable=['hidden','draft','pending_review'].includes(String(profileStatus||'').toLowerCase());
 const headerName=form.fullName||status?.fullName||'';
 const headerTitle=form.professionalTitle||status?.professionalTitle||'';
 const headerPhoto=form.photoUrl||status?.photoUrl||'';

 const handleSave=async()=>{
  if(!editable||saveState==='saving') return;
  setSaveState('saving');
  setSaveError('');
  try{
   const result=await DB.saveMyMentalHealthProfessionalProfileDraft(user.id,form,authSession);
   if(result.unavailable){
    setUnavailable(true);
    setSaveState('');
    setSaveError(meta.editProfileUnavailable||'Professional profile storage is not available yet.');
    return;
   }
   if(!result.ok){
    setSaveState('');
    setSaveError(result.errorStage==='notEditable'
     ? (meta.editProfileReadOnlyNotice||'This profile can no longer be edited here.')
     : (meta.editProfileSaveError||'Your profile draft could not be saved right now.'));
    return;
   }
   if(result.profile){
    setForm(mhpProfileFormFromRow(result.profile));
    setProfileStatus(result.profile.profileStatus||'draft');
   }
   setSaveState('saved');
   await load();
  }catch(err){
   setSaveState('');
   setSaveError(meta.editProfileSaveError||'Your profile draft could not be saved right now.');
   AuthDebug.log('[mhp] profile save failed:', { message: err?.message || String(err) });
  }
 };

 const setField=(key,value)=>{setForm(prev=>({...prev,[key]:value}));if(saveState==='saved')setSaveState('');};

 const handleApplyExtractedDetails=(documentId,fields)=>{
  if(!editable) return;
  setForm((prev)=>mhpApplyExtractedFieldsToProfileDraft(prev,fields));
  setAppliedExtractDocId(documentId||'');
  if(saveState==='saved') setSaveState('');
 };

 if(loading) return <><div className="card mhp-profile-editor"><p className="sub">Loading profile…</p></div><MentalHealthProfessionalLicenseSection user={user} authSession={authSession} meta={meta} editable={false} onApplyExtractedDetails={null} appliedExtractDocId=""/></>;

 const licenseSectionProps={
  user,
  authSession,
  meta,
  editable,
  onApplyExtractedDetails: editable ? handleApplyExtractedDetails : null,
  appliedExtractDocId
 };

 return <>
  <div className="card mhp-profile-editor">
  {unavailable ? <p className="sub">{meta.editProfileUnavailable||'Professional profile storage is not available yet.'}</p> : <>
  <div className="topbar mhp-profile-editor-head">
   <div>
    <h2>{meta.editProfileTitle||'Mental Health Professional profile'}</h2>
    <p className="dashboard-helper">{meta.editProfileSubtitle||'Update your professional profile draft.'}</p>
   </div>
  </div>
  <div className="mhp-profile-status-header">
   {headerPhoto&&!photoBroken ? <img className="mhp-profile-photo" src={headerPhoto} alt="" onError={()=>setPhotoBroken(true)}/> : <div className="mhp-profile-photo mhp-profile-photo--placeholder" aria-hidden="true">{headerName?headerName.charAt(0).toUpperCase():'M'}</div>}
   <div className="mhp-profile-status-copy">
    {headerName ? <h3 className="mhp-profile-display-name">{headerName}</h3> : null}
    {headerTitle ? <p className="sub mhp-profile-display-title">{headerTitle}</p> : null}
    <div className="mhp-profile-status-badges">
     <span className="pill mhp-profile-status-pill">{meta.profileStatusLabel||'Profile status'}: {mhpStatusLabel(profileStatus||status?.profileStatus)}</span>
     <span className="pill mhp-profile-status-pill">{meta.membershipStatusLabel||'Membership status'}: {mhpStatusLabel(status?.membershipStatus)}</span>
     {status?.membershipExpiresAt ? <span className="sub mhp-profile-expiry">{meta.membershipExpiresLabel||'Membership expires'}: {fmtDate(status.membershipExpiresAt)}</span> : null}
    </div>
   </div>
  </div>
  <p className="mhp-profile-review-notice">{meta.editProfileReviewNotice||'Profile publication requires Wayfinder review. Upload your licence PDF below. AI extraction is coming in the next step.'}</p>
  {!editable ? <p className="sub mhp-profile-readonly-note">{meta.editProfileReadOnlyNotice||'This profile is under review or published.'}</p> : null}
  {appliedExtractDocId ? <p className="mhp-profile-extracted-apply-notice" role="status" aria-live="polite">{meta.licenseApplyToProfileDraftSuccess||'Extracted details applied to your profile draft. Please review before saving.'}</p> : null}
  <div className="mhp-profile-fields">
   <label className="field"><span>{meta.fieldPhotoUrl||'Photo URL'}</span><input type="url" value={form.photoUrl} disabled={!editable} onChange={e=>{setPhotoBroken(false);setField('photoUrl',e.target.value);}}/></label>
   <label className="field"><span>{meta.fieldFullName||'Full name'}</span><input type="text" value={form.fullName} disabled={!editable} onChange={e=>setField('fullName',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldProfessionalTitle||'Professional title'}</span><input type="text" value={form.professionalTitle} disabled={!editable} onChange={e=>setField('professionalTitle',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldLicenseNumber||'License / registration number'}</span><input type="text" value={form.licenseRegistrationNumber} disabled={!editable} onChange={e=>setField('licenseRegistrationNumber',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldAccreditationNumber||'Accreditation number'}</span><input type="text" value={form.accreditationNumber} disabled={!editable} onChange={e=>setField('accreditationNumber',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldIssuingBody||'Issuing body'}</span><input type="text" value={form.issuingBody} disabled={!editable} onChange={e=>setField('issuingBody',e.target.value)}/></label>
   <label className="field mhp-profile-field-wide"><span>{meta.fieldShortBio||'Short bio'}</span><textarea rows={4} value={form.shortBio} disabled={!editable} onChange={e=>setField('shortBio',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldCountryOfOrigin||'Country of origin'}</span><input type="text" value={form.countryOfOrigin} disabled={!editable} onChange={e=>setField('countryOfOrigin',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldEthnicity||'Ethnicity'}</span><input type="text" value={form.ethnicity} disabled={!editable} onChange={e=>setField('ethnicity',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldEnquiryEmail||'Enquiry email'}</span><input type="email" value={form.enquiryEmail} disabled={!editable} onChange={e=>setField('enquiryEmail',e.target.value)}/></label>
   <label className="field"><span>{meta.fieldEnquiryMobile||'Enquiry mobile'}</span><input type="text" value={form.enquiryMobile} disabled={!editable} onChange={e=>setField('enquiryMobile',e.target.value)}/></label>
  </div>
  <div className="mhp-profile-actions">
   <button type="button" className="btn btn-primary" disabled={!editable||saveState==='saving'} onClick={handleSave}>{saveState==='saving'?(meta.editProfileSaving||'Saving…'):(meta.editProfileSaveDraft||'Save draft')}</button>
   {saveState==='saved' ? <span className="mhp-profile-save-status">{meta.editProfileSaved||'Draft saved'}</span> : null}
   {saveError ? <span className="mhp-profile-save-status mhp-profile-save-status--error">{saveError}</span> : null}
  </div>
  </>}
  </div>
  <MentalHealthProfessionalLicenseSection {...licenseSectionProps}/>
 </>;
}

function CounsellorApp({back,user,profile,authSession,onSignOut}){
 const [entries,setEntries]=useState([]);
 const [grantGroups,setGrantGroups]=useState([]);
 const [openId,setOpenId]=useState(null);
 const [loadingEntries,setLoadingEntries]=useState(true);
 const [loadError,setLoadError]=useState('');
 const [flags,setFlags]=useState({});
 const [responseStatuses,setResponseStatuses]=useState({});
 const [longitudinalSummaries,setLongitudinalSummaries]=useState({});
 const [longitudinalOpen,setLongitudinalOpen]=useState({});
 const [counsellorStage,setCounsellorStage]=useState('reflections');
 const [editHostedEvent,setEditHostedEvent]=useState(null);
 const [hostingUnavailable,setHostingUnavailable]=useState(false);
 const [reviewGrantsUnavailable,setReviewGrantsUnavailable]=useState(false);
 const [usingLegacyJournalAccess,setUsingLegacyJournalAccess]=useState(false);
 const [inviteShareOpen,setInviteShareOpen]=useState(false);
 const [mhpInviteRequestOpen,setMhpInviteRequestOpen]=useState(false);

 const entryChildAge=(e)=>{
  if(!e.childDob||!e.date) return 'unknown';
  const yrs=Math.floor((new Date(e.date)-new Date(e.childDob))/(1000*60*60*24*365.25));
  return Number.isFinite(yrs) ? yrs+' years' : 'unknown';
 };
 const refresh=async()=>{
  setLoadingEntries(true);
  setLoadError('');
  setFlags({});
  setResponseStatuses({});
  setLongitudinalSummaries({});
  try{
   const grantResult=await DB.getCounsellorGrantedEntries(user.id,authSession);
   let data=[];
   let legacyAccess=false;
   if(grantResult.unavailable){
    setReviewGrantsUnavailable(true);
    legacyAccess=true;
    data=await DB.getAllEntries(user.id,authSession);
   }else{
    setReviewGrantsUnavailable(false);
    data=grantResult.entries||[];
   }
   setUsingLegacyJournalAccess(legacyAccess);
   const withChildAge=data.map(e=>toCounsellorEntry({...e,childAge:entryChildAge(e)}));
   setEntries(withChildAge);
   const groups=legacyAccess?[]:buildCounsellorGrantGroups(grantResult.grants,grantResult.grantLinks,withChildAge);
   setGrantGroups(groups);

   if(!legacyAccess && withChildAge.length>0){
    const flagResults=await Promise.all(
     withChildAge.map(e=>
      fetch('/api/counsellor-analysis',{
       method:'POST',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify({mode:'entry',entry:e})
      })
       .then(r=>r.json())
       .then(d=>({id:e._key,flag:d.flag||''}))
       .catch(()=>({id:e._key,flag:''}))
     )
    );
    const flagMap={};
    flagResults.forEach(f=>{flagMap[f.id]=f.flag;});
    setFlags(flagMap);

    const statusEntries=groups.flatMap(g=>g.entries||[]).filter(e=>e.grantEntryId);
    if(statusEntries.length>0&&user?.id&&authSession?.access_token){
     const statusResults=await Promise.all(
      statusEntries.map(async(e)=>{
       try{
        const result=await DB.getCounsellorReviewResponseForGrantEntry(user.id,e.grantEntryId,authSession);
        if(result.unavailable){
         AuthDebug.log('[counsellor] response status lookup unavailable:', { grantEntryId: e.grantEntryId });
         return {key:e._key,status:'unavailable'};
        }
        if(!result.available){
         AuthDebug.log('[counsellor] response status lookup not available:', { grantEntryId: e.grantEntryId });
         return {key:e._key,status:'unavailable'};
        }
        if(!result.response) return {key:e._key,status:'pending'};
        const rowStatus=String(result.response.status||'').trim().toLowerCase();
        if(rowStatus==='draft'||rowStatus==='published'||rowStatus==='revoked') return {key:e._key,status:rowStatus};
        AuthDebug.log('[counsellor] response status unexpected:', { grantEntryId: e.grantEntryId, rowStatus });
        return {key:e._key,status:'unavailable'};
       }catch(err){
        AuthDebug.log('[counsellor] response status lookup failed:', { grantEntryId: e.grantEntryId, message: err?.message||String(err) });
        return {key:e._key,status:'unavailable'};
       }
      })
     );
     const statusMap={};
     statusResults.forEach(r=>{if(r.key) statusMap[r.key]=r.status;});
     setResponseStatuses(statusMap);
    }else if(statusEntries.length>0){
     const statusMap={};
     statusEntries.forEach(e=>{if(e._key) statusMap[e._key]='unavailable';});
     setResponseStatuses(statusMap);
     AuthDebug.log('[counsellor] response status lookup skipped: missing auth session');
    }else{
     setResponseStatuses({});
    }

    const groupedByParent=withChildAge.reduce((acc,e)=>{
     const key=e.parentId||'Parent ID unavailable';
     if(!acc[key]) acc[key]=[];
     acc[key].push(e);
     return acc;
    },{});
    const longitudinalResults=await Promise.all(
     Object.entries(groupedByParent)
      .filter(([pid,parentEntries])=>pid!=='Parent ID unavailable'&&parentEntries.length>=2)
      .map(([pid,parentEntries])=>
       fetch('/api/counsellor-analysis',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({mode:'longitudinal',parentId:pid,entries:parentEntries})
       })
        .then(r=>r.json())
        .then(d=>({parentId:pid,summary:d.recurringPatterns?d:null}))
        .catch(()=>({parentId:pid,summary:null}))
      )
    );
    const longMap={};
    longitudinalResults.forEach(r=>{if(r.summary) longMap[r.parentId]=r.summary;});
    setLongitudinalSummaries(longMap);
   }else{
    setFlags({});
    setResponseStatuses({});
    setLongitudinalSummaries({});
   }
  }catch(err){
   setEntries([]);
   setGrantGroups([]);
   setLoadError('We could not load counsellor records. Please refresh or contact the Wayfinder administrator.');
   AuthDebug.log('[counsellor] load failed:', { message: err?.message || String(err) });
  }finally{
   setLoadingEntries(false);
  }
 };
 useEffect(()=>{if(authSession?.access_token)refresh();},[user.id,authSession?.access_token]);
 useEffect(()=>{
  let cancelled=false;
  (async()=>{
   if(!authSession?.access_token)return;
   try{
    const result=await DB.getCounsellorHostedEvents(user.id,authSession);
    if(!cancelled)setHostingUnavailable(!!result?.unavailable);
   }catch(_){
    if(!cancelled)setHostingUnavailable(false);
   }
  })();
  return ()=>{cancelled=true;};
 },[user.id,authSession?.access_token]);
 const open=entries.find(e=>e._key===openId);
 const openGrantGroup=open?grantGroups.find((g)=>(g.entries||[]).some((e)=>e._key===open._key)):null;
 const hostingMeta=typeof COUNSELLOR_EVENTS_HOSTING!=='undefined'?COUNSELLOR_EVENTS_HOSTING:{};
 const reviewMeta=typeof COUNSELLOR_REVIEW_SHARING!=='undefined'?COUNSELLOR_REVIEW_SHARING:{};
 const mhpMeta=typeof MENTAL_HEALTH_PROFESSIONAL_ONBOARDING!=='undefined'?MENTAL_HEALTH_PROFESSIONAL_ONBOARDING:{};
 const inviteShareMeta=parentSignupInviteMeta();
 const professionalInviteMeta=mhpProfessionalInviteMeta();
 const inviteShareModal=<ParentSignupInviteModal open={inviteShareOpen} context="counsellor" onClose={()=>setInviteShareOpen(false)}/>;
 const mhpInviteRequestModal=<MentalHealthProfessionalInviteRequestModal open={mhpInviteRequestOpen} onClose={()=>setMhpInviteRequestOpen(false)}/>;
 const openInviteShare=()=>setInviteShareOpen(true);
 const openMhpInviteRequest=()=>setMhpInviteRequestOpen(true);
 const invitePanel=<MentalHealthProfessionalInvitePanel inviteShareMeta={inviteShareMeta} professionalInviteMeta={professionalInviteMeta} onInviteParents={openInviteShare} onInviteProfessionals={openMhpInviteRequest}/>;
 const workspaceModals=<>{inviteShareModal}{mhpInviteRequestModal}</>;

 if(open) return <CounsellorReview entry={open} back={()=>{setOpenId(null);refresh();}} user={user} authSession={authSession} aiEnabled={!usingLegacyJournalAccess} grantGroup={openGrantGroup} reviewMeta={reviewMeta}/>;

 if(counsellorStage==='hostForm') return <CounsellorHostEventForm user={user} authSession={authSession} eventId={editHostedEvent?.id||null} existingEvent={editHostedEvent} unavailable={hostingUnavailable} onBack={()=>{setEditHostedEvent(null);setCounsellorStage('hostedEvents');}} onSaved={()=>{setEditHostedEvent(null);setCounsellorStage('hostedEvents');}}/>;

 if(counsellorStage==='hostedEvents') return <>{workspaceModals}<CounsellorHostedEventsPage user={user} authSession={authSession} onBack={()=>setCounsellorStage('reflections')} onNew={()=>{setEditHostedEvent(null);setCounsellorStage('hostForm');}} onEdit={(ev)=>{setEditHostedEvent(ev);setCounsellorStage('hostForm');}} onSignOut={onSignOut} invitePanel={invitePanel}/></>;

 if(counsellorStage==='editProfile') return <><div className="wrap">
  <Bar title="Counsellor workspace" back={back} onSignOut={onSignOut}/>
  <CounsellorWorkspaceNav activeStage="editProfile" reviewMeta={reviewMeta} hostingMeta={hostingMeta} mhpMeta={mhpMeta} onStageChange={setCounsellorStage}/>
  {invitePanel}
  <MentalHealthProfessionalProfileEditor user={user} authSession={authSession} meta={mhpMeta}/>
 </div>{workspaceModals}</>;

 return <><div className="wrap">
  <Bar title="Counsellor workspace" back={back} onSignOut={onSignOut}/>
  <CounsellorWorkspaceNav activeStage="reflections" reviewMeta={reviewMeta} hostingMeta={hostingMeta} mhpMeta={mhpMeta} onStageChange={setCounsellorStage}/>
  {invitePanel}
  <div className="card">
   <div className="topbar"><h2>{reviewMeta.title||'Parent shared reflections'}</h2><button className="btn btn-ghost" onClick={refresh}>Refresh</button></div>
   <p className="sub" style={{marginBottom:16}}>{reviewMeta.subtitle||'Reflections a parent has chosen to share with you for time-limited ALIGN/CAB review.'}</p>
   {reviewGrantsUnavailable && <div className="review-share-notice review-share-notice--legacy">{reviewMeta.legacyNotice||reviewMeta.setupUnavailable}</div>}
   {!reviewGrantsUnavailable && !usingLegacyJournalAccess && <div className="review-share-notice">{reviewMeta.grantScopedNotice}</div>}
   {!usingLegacyJournalAccess && <p className="review-share-ai-note">{reviewMeta.aiDisabledNotice}</p>}

   {loadError && !loadingEntries ? <div className="empty">{loadError}</div> : loadingEntries ? <div className="empty">Loading entries...</div> : entries.length===0 ? <div className="empty">{reviewGrantsUnavailable?(reviewMeta.setupUnavailable||'No reflections available.'):(reviewMeta.emptyList||'No parent has shared reflections with you yet.')}</div> :
    <>
     {!usingLegacyJournalAccess && <CounsellorLongitudinalSection entries={entries} summaries={longitudinalSummaries} openState={longitudinalOpen} onToggle={pid=>setLongitudinalOpen(prev=>({...prev,[pid]:!prev[pid]}))} reviewMeta={reviewMeta}/>}
     {!usingLegacyJournalAccess && grantGroups.length>0 ? <div className="counsellor-review-context-section">
      {grantGroups.map(group=><CounsellorReviewGrantGroup key={group.grant.id} group={group} reviewMeta={reviewMeta} flags={flags} responseStatuses={responseStatuses} onOpenEntry={setOpenId}/>)}
     </div> :
     entries.map(e=>{
      const childAge=ageFrom(e.childDob,e.date);
      const parentAge=ageFrom(e.parentDob,e.date);
      const fmt=d=>{const dt=parseStoredDate(d);return dt?dt.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'}):'-';};
      const phaseLabel=PHASES[e.phase]||e.phase||'Phase not saved';
      const isDecode=isBehaviourDecodeEntry(e);
      const activityLabel=isDecode?'Decode a Moment · Alignment Reminder':e.activity;
      return <div className="entry-row" key={e._key} onClick={()=>setOpenId(e._key)}>
       <div className="er-top">{e.parentId} &amp; {e.childId} &middot; <span style={{fontWeight:400}}>{activityLabel}</span></div>
       <div className="er-sub" style={{marginTop:4}}>
        <span>{fmt(e.date)}</span>
        <span style={{margin:'0 8px'}}>&middot;</span>
       <span>Child: {childAge||'-'}{e.childGender?' / '+e.childGender:''}</span>
        <span style={{margin:'0 8px'}}>&middot;</span>
       <span>Parent: {parentAge||'-'}{e.parentGender?' / '+e.parentGender:''}</span>
       </div>
      {flags[e._key] && <div style={{fontSize:12,color:'#8B6914',background:'#FFF8E7',borderRadius:4,padding:'3px 8px',marginTop:6,display:'inline-block'}}>{flags[e._key]}</div>}
      <div className="er-sub" style={{marginTop:2,fontSize:12,color:'#999'}}>{phaseLabel} &middot; {(e.autoWords||[]).length} trait words &middot; {Object.values(e.markers||{}).filter(m=>m&&m.claimed).length}/6 markers</div>
     </div>;
    })}
    </>
   }
  </div>
 </div>{workspaceModals}</>;
}
function CounsellorReview({entry,back,user,authSession,aiEnabled=true,grantGroup=null,reviewMeta={}}){
 const responseTabLabel=reviewMeta.responseTabLabel||'Parent-Facing Response';
 const entryGrantContext=useMemo(()=>{
  if(!entry||!grantGroup) return null;
  const grantId=entry.grantId||entry.grant_id||grantGroup.grant?.id||null;
  const grantEntryId=entry.grantEntryId||entry.grant_entry_id||null;
  const journalEntryId=entry.journalEntryId||entry.journal_entry_id||String(entry.id||'');
  if(!grantId||!grantEntryId||!journalEntryId) return null;
  return {
   grantId,
   grantEntryId,
   journalEntryId,
   parentUserId:grantGroup.parentUserId||grantGroup.grant?.parent_user_id||null,
   parentId:grantGroup.parentId||grantGroup.grant?.parent_id||entry.parentId||null,
   counsellorWayfinderId:grantGroup.grant?.counsellor_wayfinder_id||null
  };
 },[entry,grantGroup]);
 const TABS=['Review','AI Analysis','Congruence','DISC Shift','Congruent Response','Stance','Gap & Narrative',responseTabLabel];
 const visibleTabs=aiEnabled?TABS:TABS.filter(t=>t!=='AI Analysis');
 const [tab,setTab]=useState('Review');
 const [aiAnalysis,setAiAnalysis]=useState(null);
 const [aiLoading,setAiLoading]=useState(false);
 const [aiError,setAiError]=useState('');
 const [reviewError,setReviewError]=useState('');
 const [rv,setRv]=useState({moments:[{cog:'',aff:'',beh:'',congruence:null,note:'',question:''}],satir:{instinct:'',congruent:'',cultural:''},stance:null,gap:'',narrative:''});
 const canSaveReview=entry.id!==undefined&&entry.id!==null&&entry.id!=='';
 useEffect(()=>{
  setReviewError('');
  if(!canSaveReview)return;
  DB.getReview(user.id,entry.id,authSession).then(r=>{if(r)setRv(r);}).catch(err=>{
   setReviewError('Saved review notes could not be loaded.');
   AuthDebug.log('[counsellor] review load failed:', { message: err?.message || String(err) });
  });
 },[user.id,entry.id,authSession?.access_token]);
 const saveRv=async(next)=>{
  setRv(next);
  setReviewError('');
  if(!canSaveReview){setReviewError('Review notes cannot be saved for this older record because no entry id is available.');return;}
  try{
   await DB.saveReview(user.id,entry.id,next,authSession);
  }catch(err){
   setReviewError('Review notes could not be saved. Please try again.');
   AuthDebug.log('[counsellor] review save failed:', { message: err?.message || String(err) });
  }
 };
 const setM=(i,k,v)=>{const m=structuredClone(rv.moments);m[i][k]=v;saveRv({...rv,moments:m});};
 const addM=()=>saveRv({...rv,moments:[...rv.moments,{cog:'',aff:'',beh:'',congruence:null,note:'',question:''}]});
 const rmM=(i)=>saveRv({...rv,moments:rv.moments.filter((_,x)=>x!==i)});

 const childY=ageFrom(entry.childDob,entry.date);
 const childYears=yearsFrom(entry.childDob,entry.date);
 const need=childNeed(childYears);
 const discQ=(entry.disc||'').toUpperCase().replace(/[^DISC]/g,'');
 const dominant=[...new Set(discQ.split(''))];
 const valueWords=entry.valueWords||entry.autoWords||[];

 // word analysis
 const wq=k=>valueWords.filter(w=>WORD_Q[w]===k);
 const warmN=wq('I').length, steadyN=wq('S').length;
 const dHarsh=valueWords.filter(w=>D_HARSH.includes(w));
 const cHarsh=valueWords.filter(w=>C_HARSH.includes(w));
 const claimed=Object.entries(entry.markers||{}).filter(([k,v])=>v&&v.claimed).map(([k])=>k);
 const nurtureMk=['collaborates','thoughtsBeneath','noManaging','present'].filter(k=>claimed.includes(k)).length;
 const criticalScore=dHarsh.length*2 + cHarsh.length*2;
 const nurtureScore=warmN+steadyN+nurtureMk;
 const rescueScore=(warmN>=2 && !claimed.includes('collaborates') && !claimed.includes('noManaging'))?warmN+1:0;
 const suggested = criticalScore>=nurtureScore && criticalScore>=rescueScore && criticalScore>0 ? 'critical'
    : rescueScore>nurtureScore && rescueScore>0 ? 'rescuing' : 'nurturing';

 const suggestQuestion=(m)=>{
  const aff=(m.aff||'').toLowerCase(),beh=(m.beh||'').toLowerCase(),cog=(m.cog||'').toLowerCase();
  if(/tight|tense|brace|shallow|grip|clench|stiff/.test(aff)) return 'When your body tightened in that moment, what was it asking for — without needing words?';
  if(/direct|correct|help|fix|take over|guide|instruct|redo|adjust/.test(beh)) return 'I noticed a moment your hands wanted to step in. What would it have been like to wait one more breath, and just watch?';
  if(/calm|fine|okay|relaxed/.test(cog) && /tense|tight|withhold|brace/.test(aff)) return 'There was a moment the outside and the inside felt a little different. What was happening underneath, just then?';
  if(/rush|fast|quick|speed|hurry/.test(beh)) return 'Things sped up around there. What were you moving away from, or toward, in that quickening?';
  return 'Was there a moment where what you felt and what you did pulled in slightly different directions? What was that like?';
 };

 async function loadAiAnalysis(){
  if(aiAnalysis||aiLoading) return;
  setAiLoading(true);
  setAiError('');
  try{
   const childAge=entry.childDob
    ? Math.floor((new Date(entry.date)-new Date(entry.childDob))/(1000*60*60*24*365.25))+' years'
    : 'unknown';
   const res=await fetch('/api/counsellor-analysis',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({mode:'entry',entry:{...entry,childAge}})
   });
   const data=await res.json();
   if(!res.ok) throw new Error(data.error||'AI analysis unavailable');
   setAiAnalysis(data);
  }catch(err){
   setAiError(err.message);
  }finally{
   setAiLoading(false);
  }
 }
 const selectTab=(t)=>{
  if(t==='AI Analysis'){setTab('aiAnalysis');loadAiAnalysis();return;}
  if(t===responseTabLabel){
   setTab(responseTabLabel);
   if(aiEnabled&&!aiAnalysis&&!aiLoading) loadAiAnalysis();
   return;
  }
  setTab(t);
 };

 const buildNarrative=()=>{
  const childRef='your child';
  const qs=rv.moments.filter(m=>m.congruence==='incongruent'&&m.question).map(m=>m.question.trim());
  let p=['Dear [parent\'s name],',''];
  if(nurtureScore>=3) p.push('There was a settledness in you this time — moments you could simply be with '+childRef+' rather than work at it. That groundedness is the soil everything grows from.');
  else p.push('This activity asked a lot of you. Being present without steering is unfamiliar, and your system worked hard. That effort is worth naming gently.');
  if(entry.cab.meaning) p.push('\nThe meaning you made — "'+entry.cab.meaning.trim()+'" — matters, because noticing your own meaning is where change begins.');
  if(warmN+steadyN>0) p.push('\nThe warmth and steadiness you brought ('+valueWords.filter(w=>['I','S'].includes(WORD_Q[w])).join(', ')+') is exactly what '+childRef+' can feel and borrow.');
  if(dHarsh.length+cHarsh.length>0) p.push('\nWhen pressure rose, the old protective grip showed ('+[...dHarsh,...cHarsh].join(', ')+'). Not a flaw — an old way of staying safe. The invitation is to let safety come from presence instead.');
  if(qs.length){p.push('\nA few things to simply sit with this week — nothing to answer in words:');qs.forEach(q=>p.push('  · '+q));}
  p.push('\nFor this week: nothing to perform. Just notice the moments where connection feels easier than effort.');
  return p.join('\n');
 };

 const phaseLabel=PHASES[entry.phase]||entry.phase||'Phase not saved';
 const claimedMarkers=MARKERS.filter(m=>entry.markers?.[m.key]?.claimed);

 return <div className="wrap">
  <Bar title={entry.parentId+' · '+entry.activity} back={back}/>
  <div className="card">
   <div className="tab-row">{visibleTabs.map(t=><div key={t} className={'tab'+((tab===t)||(t==='AI Analysis'&&tab==='aiAnalysis')?' on':'')} onClick={()=>selectTab(t)}>{t}</div>)}</div>
   {reviewError&&<div style={{background:'#FDECEC',color:'#8A1F1F',padding:10,borderRadius:6,marginTop:12}}>{reviewError}</div>}

   {tab==='Review' && <>
    <h2>What the parent reflected</h2>
    <p className="sub" style={{marginBottom:16}}>{entry.date} · {phaseLabel} · child {fmtAge(childY)}{entry.childGender?' · '+entry.childGender:''}{entry.disc?' · DISC '+entry.disc:''}{entry.ethnicity?' · '+entry.ethnicity:''}</p>
    <div className="readout"><h4>THOUGHTS (COGNITIVE)</h4><div className="body">{entry.cab.thoughts||'—'}</div></div>
    <div className="readout"><h4>FEELINGS (AFFECT)</h4><div className="body">{entry.cab.feelings||'—'}</div></div>
    <div className="readout"><h4>ACTIONS (BEHAVIOUR)</h4><div className="body">{entry.cab.actions||'—'}</div></div>
    <div className="readout"><h4>MEANING THEY MADE</h4><div className="body">{entry.cab.meaning||'—'}</div></div>
    <h3>Self-declared markers (with their evidence)</h3>
    {claimedMarkers.length===0?<p className="sub">None claimed this time.</p>:
     claimedMarkers.map(m=>(
      <div className="readout" key={m.key}><h4>{m.label.toUpperCase()}</h4><div className="body">{entry.markers?.[m.key]?.evidence||'—'}</div></div>
     ))}
    <h3>Words they chose</h3>
    <div>{valueWords.map(w=><span key={w} className={'tagline tag-'+String(WORD_Q[w]||'').toLowerCase()}>{w}</span>)}{!valueWords.length&&<span className="sub">none selected</span>}</div>
   </>}

   {tab==='aiAnalysis' && <div style={{marginTop:16}}>
    {aiLoading && <p>Loading AI analysis...</p>}
    {aiError && <div style={{background:'#FDECEC',color:'#8A1F1F',padding:10,borderRadius:6}}>{aiError}</div>}
    {!aiLoading && !aiError && aiAnalysis && <div style={{display:'grid',gap:12}}>
     <section><h4>CAB Congruence</h4><p>{aiAnalysis.cabCongruence}</p></section>
     <section><h4>DISC Pattern</h4><p>{aiAnalysis.discPattern}</p></section>
     <section><h4>Possible Coping Pattern</h4><p>{aiAnalysis.possibleCopingPattern}</p></section>
     <section style={{background:'#FFF8E7',border:'1px solid #E8D9B5',borderRadius:8,padding:12}}><h4>Developmental Considerations</h4><p>{aiAnalysis.developmentalConsiderations}</p></section>
     <section><h4>Protective Factors</h4><p>{aiAnalysis.protectiveFactors}</p></section>
     <section><h4>Counsellor Reflection Focus</h4><p>{aiAnalysis.counsellorReflectionFocus}</p></section>
    </div>}
   </div>}

   {tab==='Congruence' && <>
    <h2>Noticing congruence</h2>
    <p className="sub" style={{marginBottom:8}}>Read their thoughts/feelings/actions together. Where they align = congruent. A gap = performance mode — held only as a gentle question, never told.</p>
    {rv.moments.map((m,i)=>(
     <div className="moment-card" key={i}>
      {rv.moments.length>1 && <button className="rm" onClick={()=>rmM(i)}>×</button>}
      <div style={{fontWeight:650,fontSize:13,marginBottom:10,color:'var(--sage-deep)'}}>Moment {i+1}</div>
      <div className="cab3">
       <div className="cab-col c-cog"><h5>COGNITIVE</h5><textarea value={m.cog} onChange={e=>setM(i,'cog',e.target.value)} placeholder="what they thought/said"/></div>
       <div className="cab-col c-aff"><h5>AFFECT</h5><textarea value={m.aff} onChange={e=>setM(i,'aff',e.target.value)} placeholder="body, tone, feeling"/></div>
       <div className="cab-col c-beh"><h5>BEHAVIOUR</h5><textarea value={m.beh} onChange={e=>setM(i,'beh',e.target.value)} placeholder="what they did"/></div>
      </div>
      <div className="congruence-row">
       <div className={'cbtn'+(m.congruence==='congruent'?' on-congruent':'')} onClick={()=>setM(i,'congruence','congruent')}>Congruent — aligned</div>
       <div className={'cbtn'+(m.congruence==='incongruent'?' on-incongruent':'')} onClick={()=>setM(i,'congruence','incongruent')}>Incongruent — a gap</div>
      </div>
      {m.congruence==='incongruent' && <div style={{marginTop:12,background:'var(--warm-soft)',borderRadius:10,padding:13}}>
       <div className="field" style={{marginBottom:10}}><label>Facilitator note (private)</label><textarea value={m.note} onChange={e=>setM(i,'note',e.target.value)} placeholder="Your clinical read of the gap."/></div>
       <div className="field" style={{marginBottom:0}}><label>Gentle question to pose (somatic, no "why")</label><textarea value={m.question} onChange={e=>setM(i,'question',e.target.value)}/>
        <button className="add-moment" style={{marginTop:8,padding:8,fontSize:12}} onClick={()=>setM(i,'question',suggestQuestion(m))}>✦ Suggest a gentle question</button></div>
      </div>}
     </div>
    ))}
    <button className="add-moment" onClick={addM}>+ Add another moment</button>
   </>}

   {tab==='DISC Shift' && <>
    <h2>Soften D &amp; C · heighten I &amp; S</h2>
    <p className="sub" style={{marginBottom:14}}>For age-appropriate emotional support, the goal is to ease the controlling (D) and critical (C) end, and raise warmth (I) and steadiness (S) — so {entry.childId} ({fmtAge(childY)}) has emotional safety to emulate.</p>
    {dominant.length>0 && <div className="readout"><h4>THIS PARENT'S BLEND</h4><div className="body">{dominant.map(q=>QUAD[q]?<span key={q}>{QUAD[q].name} (fear: {QUAD[q].fear.toLowerCase()}; under stress → Satir "{QUAD[q].satir}"). </span>:null)}</div></div>}
    {(dHarsh.length>0||cHarsh.length>0) ? <div className="shift">
     <div className="shift-box shift-from"><div className="sh-t">SOFTEN (D / C END)</div>{dHarsh.map(w=><span key={w} className="tagline tag-d">{w}</span>)}{cHarsh.map(w=><span key={w} className="tagline tag-c">{w}</span>)}<div style={{fontSize:11.5,marginTop:8,color:'var(--ink-soft)'}}>These showed in their own words — the protective/critical end.</div></div>
     <div className="arrow">→</div>
     <div className="shift-box shift-to"><div className="sh-t">HEIGHTEN (I / S END)</div>{QUAD.I.high.slice(0,4).map(w=><span key={w} className="tagline tag-i">{w}</span>)}{QUAD.S.high.slice(0,4).map(w=><span key={w} className="tagline tag-s">{w}</span>)}<div style={{fontSize:11.5,marginTop:8,color:'var(--ink-soft)'}}>Warmth + steadiness the child can feel and borrow.</div></div>
    </div> : <div className="readout"><div className="body">No high-D/high-C words selected this time — warmth and steadiness already leading. Reinforce it.</div></div>}
    <h3>Age-fit note</h3>
    <div className="readout"><div className="body"><b>{need.band}:</b> {childYears!==null&&childYears<7?'At this age, warmth and calm regulate the child far more than correction. Every softened "C" moment teaches that feelings are safe.':'Validation and collaboration matter more than directives now — the "I/S" stance builds the autonomy-with-safety this age needs.'}</div></div>
   </>}

   {tab==='Congruent Response' && <>
    <h2>Toward a congruent response</h2>
    <p className="sub" style={{marginBottom:14}}>Satir's model: the goal is <b>Congruent / Leveling</b> — {SATIR.Congruent} Coach the shift from instinct → congruent → culturally-attuned.</p>
    {dominant.map(q=>QUAD[q]&&<div key={q} style={{fontSize:13,marginBottom:6}}><b>{QUAD[q].name}</b> tends toward Satir's <b>{QUAD[q].satir}</b> — {SATIR[QUAD[q].satir]}</div>)}
    <div className="satir-card sc-instinct" style={{marginTop:14}}><div className="sc-label" style={{color:'var(--alert)'}}>WHAT THEY MAY THINK IS APPROPRIATE</div><textarea value={rv.satir.instinct} onChange={e=>saveRv({...rv,satir:{...rv.satir,instinct:e.target.value}})} placeholder="e.g. 'I should correct her so she learns to do it properly.'"/></div>
    <div className="satir-card sc-congruent"><div className="sc-label" style={{color:'var(--sage-deep)'}}>SATIR'S CONGRUENT (LEVELING) RESPONSE</div><textarea value={rv.satir.congruent} onChange={e=>saveRv({...rv,satir:{...rv.satir,congruent:e.target.value}})} placeholder="Name the real feeling, own it, stay connected, fit the moment — Self + Other + Context."/></div>
    <div className="satir-card sc-cultural"><div className="sc-label" style={{color:'var(--c)'}}>CULTURALLY-ATTUNED · {entry.ethnicity||'SG'}</div>
     <div style={{fontSize:13,marginBottom:10,fontStyle:'italic',color:'var(--ink-soft)'}}>{CULTURE[entry.ethnicity]||CULTURE.Other} <span style={{fontStyle:'normal'}}>(a starting point, not a rule)</span></div>
     <textarea value={rv.satir.cultural} onChange={e=>saveRv({...rv,satir:{...rv.satir,cultural:e.target.value}})} placeholder="Adapt the congruent response so honesty preserves face and relational warmth in this family's context."/></div>
   </>}

   {tab==='Stance' && <>
    <h2>Parent stance this session</h2>
    <p className="sub" style={{marginBottom:14}}>Read from their own markers and chosen words. Confirm or override.</p>
    <div className="readout"><h4>SUGGESTED READ</h4><div className="body">
     Leaning <b>{suggested==='critical'?'Critical / controlling':suggested==='rescuing'?'Rescuing / over-functioning':'Nurturing'}</b>.
     <div style={{fontSize:12.5,color:'var(--ink-soft)',marginTop:6}}>Nurture signals: {nurtureScore} (warmth {warmN}, steadiness {steadyN}, nurturing markers {nurtureMk}) · Critical signals: {criticalScore} ({[...dHarsh,...cHarsh].join(', ')||'none'}) · Rescue signals: {rescueScore}.</div>
    </div></div>
    <div className="stance-read">
     {[['critical','Critical Parent','Correcting, directing toward "right". Care hidden under control.'],
       ['rescuing','Rescuing Parent','Over-functioning, smoothing, doing-for. Removes safe struggle.'],
       ['nurturing','Nurturing Parent ✦','Alongside, steady, collaborative. Accompanies, neither corrects nor rescues.']].map(([k,nm,ds])=>(
      <div key={k} className={'stance-opt'+(rv.stance===k?' on':'')+(suggested===k&&!rv.stance?' suggested':'')} onClick={()=>saveRv({...rv,stance:k})}>
       <div className="nm">{nm}</div><div className="ds">{ds}</div>{suggested===k&&<div style={{fontSize:10.5,color:'var(--gold)',fontWeight:700,marginTop:6}}>SUGGESTED</div>}
      </div>
     ))}
    </div>
   </>}

   {tab==='Gap & Narrative' && <>
    <h2>The gap — and the gentle next step</h2>
    <p className="sub" style={{marginBottom:14}}>The distance between where the parent's emotional structuring is now and what {entry.childId}'s developing capacity needs to emulate.</p>
    <div className="gap-flow">
     <div className="gap-stage gap-here"><div className="gs-t">WHERE THEY ARE NOW</div><div className="gs-b">{(rv.stance||suggested)==='critical'?'A controlling/critical lean — high D/C protection under pressure.':(rv.stance||suggested)==='rescuing'?'A rescuing lean — warmth that over-functions and smooths.':'A nurturing presence beginning to hold — warmth and steadiness leading.'}{entry.cab.meaning?' Their own meaning: "'+entry.cab.meaning.trim()+'"':''}</div></div>
     <div className="gap-stage"><div className="gs-t">WHAT THE CHILD NEEDS ({need.band})</div><div className="gs-b">{need.need}. At this stage the child is {need.cap}.</div></div>
     <div className="gap-stage"><div className="gs-t">THE GAP</div><div className="gs-b">{(rv.stance||suggested)==='nurturing'?'Small — mostly about consistency. Keep softening any flickers of control and let presence be enough.':'Soften the D/C grip ('+([...dHarsh,...cHarsh].join(', ')||'control/criticism')+') and raise warmth + steadiness, so the child can borrow regulation rather than meet performance.'}</div></div>
     <div className="gap-stage"><div className="gs-t">GENTLE NEXT STEP</div><div className="gs-b"><textarea value={rv.gap} onChange={e=>saveRv({...rv,gap:e.target.value})} placeholder="One small, doable shift toward presence for next session."/></div></div>
    </div>
    <h3>Client narrative</h3>
    <button className="btn btn-primary" style={{marginBottom:14}} onClick={()=>saveRv({...rv,narrative:buildNarrative()})}>Generate from this reflection</button>
    {rv.narrative && <>
     <div className="narrative-out">{rv.narrative}</div>
     <textarea style={{marginTop:12,minHeight:150}} value={rv.narrative} onChange={e=>saveRv({...rv,narrative:e.target.value})}/>
     <p className="hint">Edit into your own voice. Growth reads as "becoming more emotionally present," never "performing better." Replace [parent's name] before sharing.</p>
    </>}
   </>}

   <div style={{display:tab===responseTabLabel?'block':'none'}}>
    {entryGrantContext
     ? <CounsellorReviewResponseComposer user={user} authSession={authSession} grantContext={entryGrantContext} reviewMeta={reviewMeta} prefillContext={{entry,rv,aiAnalysis}} embedded/>
     : <p className="sub counsellor-response-grant-required">{grantGroup?(reviewMeta.responseEntryLinkRequired||'Parent-facing response is available when this approved entry has a review grant link.'):(reviewMeta.responseGrantRequired||'Parent-facing response is available when you open a parent-approved grant entry.')}</p>}
   </div>
  </div>
 </div>;
}

function Bar({title,back,onSignOut}){
 return <div className="card banner" style={{padding:'18px 22px'}}>
  <div className="topbar"><div><div style={{fontSize:18,fontWeight:700}}>Shared Journeys</div><div style={{opacity:.82,fontSize:13}}>{title}</div></div>
  <div style={{display:'flex',gap:8}}>
   <button className="switch" onClick={back}>← Back</button>
   {onSignOut&&<button className="switch" onClick={onSignOut} style={{background:'rgba(0,0,0,.08)'}}>Sign out</button>}
  </div></div>
 </div>;
}

// Mounted by each HTML page (see index.html / counsellor.html)
