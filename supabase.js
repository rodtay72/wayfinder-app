// =============================================
// WAY FINDER - Supabase Client
// Auth and database helpers
// =============================================

const SUPABASE_URL = 'https://mhvjmakraociizeqbvbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odmptYWtyYW9jaWl6ZXFidmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODQ5ODgsImV4cCI6MjA5NTQ2MDk4OH0.WgUnHsG4SiiEO1pjBxHQkWe8eXgqVii0asbG9cNIeBQ';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
let activeAuthSession = null;

const AuthDebug = {
  enabled: () => {
    try {
      return localStorage.getItem('wayfinder_debug_auth') === '1';
    } catch {
      return false;
    }
  },
  log: (...args) => {
    if (AuthDebug.enabled()) console.info(...args);
  }
};

const authHashParams = () => {
  if (typeof window === 'undefined' || !window.location?.hash) return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const hasAuthHash = params.has('access_token') || params.has('refresh_token') || params.has('type');
  return hasAuthHash ? params : null;
};

const authHashType = () => authHashParams()?.get('type') || '';

const clearAuthHashFromUrl = () => {
  if (typeof window === 'undefined' || !authHashParams()) return;
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, cleanUrl);
};

const isEmailConfirmedUser = (user) => !!(user?.email_confirmed_at || user?.confirmed_at);

const withFreshSessionUser = async (session) => {
  if (!session?.access_token) return session || null;

  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) {
    AuthDebug.log('[auth] fresh user check failed:', {
      sessionExists: !!session,
      accessTokenExists: !!session?.access_token,
      sessionUserId: session?.user?.id || null,
      errorMessage: error?.message || null
    });
    return session;
  }

  return {
    ...session,
    user: data.user
  };
};

const profileTimestampOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizeObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const normalizeArray = (value) => Array.isArray(value) ? value : [];
const firstValue = (...values) => values.find(value => value !== undefined && value !== null && value !== '') || null;

const normalizeJournalEntryRow = (row, fallbackParentId = null) => {
  const data = normalizeObject(row?.data);
  const submittedAt = firstValue(data.submittedAt, data.created_at, row?.created_at);
  const date = firstValue(data.date, submittedAt ? String(submittedAt).slice(0, 10) : null);
  const cab = normalizeObject(data.cab);
  const markers = normalizeObject(data.markers);
  const parentId = firstValue(data.parentId, data.parent_id, row?.parent_id, fallbackParentId);
  const childId = firstValue(data.childId, data.child_id, data.dyadId, data.dyad_id, row?.child_id);

  return {
    ...data,
    id: firstValue(data.id, row?.id),
    parentId,
    childId,
    date,
    submittedAt,
    created_at: row?.created_at || data.created_at || null,
    activity: firstValue(data.activity, data.activityTitle, data.title, 'Untitled activity'),
    phase: firstValue(data.phase, data.phaseKey, ''),
    cab: {
      thoughts: cab.thoughts || '',
      feelings: cab.feelings || '',
      actions: cab.actions || '',
      meaning: cab.meaning || ''
    },
    markers,
    autoWords: normalizeArray(data.autoWords || data.valueWords),
    valueWords: normalizeArray(data.valueWords || data.autoWords)
  };
};

const getAuthenticatedReadSession = async (userId, context, providedSession = null, parentId = null) => {
  const providedSessionUserId = providedSession?.user?.id || null;
  const providedHasAccessToken = !!providedSession?.access_token;
  const providedMatchesUser = !userId || providedSessionUserId === userId;

  AuthDebug.log('[db] authenticated read provided session:', {
    context,
    sessionExists: !!providedSession,
    accessTokenExists: providedHasAccessToken,
    sessionUserId: providedSessionUserId,
    requestedUserId: userId || null,
    parentId: parentId || null,
    userMatches: providedMatchesUser
  });

  if (providedSession && providedHasAccessToken) {
    if (!providedMatchesUser) {
      throw new Error(`Provided authenticated read user mismatch. requested=${userId} session=${providedSessionUserId}`);
    }
    activeAuthSession = providedSession;
    return providedSession;
  }

  const cachedSession = activeAuthSession || null;
  const cachedSessionUserId = cachedSession?.user?.id || null;
  const cachedHasAccessToken = !!cachedSession?.access_token;
  const cachedMatchesUser = !userId || cachedSessionUserId === userId;

  AuthDebug.log('[db] authenticated read cached session:', {
    context,
    sessionExists: !!cachedSession,
    accessTokenExists: cachedHasAccessToken,
    sessionUserId: cachedSessionUserId,
    requestedUserId: userId || null,
    parentId: parentId || null,
    userMatches: cachedMatchesUser
  });

  if (cachedSession && cachedHasAccessToken && cachedMatchesUser) {
    return cachedSession;
  }

  const { data: sessionData, error } = await sb.auth.getSession();
  if (error) throw error;

  const session = sessionData?.session || null;
  const sessionUserId = session?.user?.id || null;
  const hasAccessToken = !!session?.access_token;

  AuthDebug.log('[db] authenticated read session:', {
    context,
    source: 'getSession',
    sessionExists: !!session,
    accessTokenExists: hasAccessToken,
    sessionUserId,
    requestedUserId: userId || null,
    parentId: parentId || null
  });

  if (!session || !hasAccessToken) {
    throw new Error(`Authenticated read session not ready for ${context}.`);
  }
  if (userId && sessionUserId !== userId) {
    throw new Error(`Authenticated read user mismatch. requested=${userId} session=${sessionUserId}`);
  }

  activeAuthSession = session;
  return session;
};

const authenticatedSelect = async ({ table, query, userId = null, parentId = null, context, session: providedSession = null }) => {
  const session = await getAuthenticatedReadSession(userId, context, providedSession, parentId);
  const params = new URLSearchParams(query);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json'
    }
  });

  const responseText = await response.text();
  let data = null;
  try {
    data = responseText ? JSON.parse(responseText) : [];
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    AuthDebug.log('[db] authenticated read failed:', {
      context,
      status: response.status,
      statusText: response.statusText,
      requestedUserId: userId || null,
      parentId: parentId || null
    });
    throw new Error(`Authenticated ${context} read failed with status ${response.status}: ${responseText || response.statusText}`);
  }

  AuthDebug.log('[db] authenticated read result:', {
    context,
    requestedUserId: userId || null,
    parentId: parentId || null,
    rowsReturned: Array.isArray(data) ? data.length : 0
  });

  return Array.isArray(data) ? data : [];
};

const isMhpProfileContractUnavailable = (status, responseText) => {
  const text = String(responseText || '').toLowerCase();
  if (status === 404) return true;
  if (text.includes('pgrst205')) return true;
  if (text.includes('42p01')) return true;
  const names = [
    'mental_health_professional_profiles',
    'mental_health_professional_memberships',
    'mental_health_professional_license_documents',
    'professional-license-documents',
    'get_my_mental_health_professional_status'
  ];
  return names.some((name) => text.includes(name) && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('not found') ||
    text.includes('schema cache')
  ));
};

const normalizeMhpProfileRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  return {
    userId: row.user_id || row.userId || null,
    profileSlug: row.profile_slug || row.profileSlug || '',
    photoUrl: row.photo_url || row.photoUrl || '',
    fullName: row.full_name || row.fullName || '',
    professionalTitle: row.professional_title || row.professionalTitle || '',
    licenseRegistrationNumber: row.license_registration_number || row.licenseRegistrationNumber || '',
    issuingBody: row.issuing_body || row.issuingBody || '',
    shortBio: row.short_bio || row.shortBio || '',
    countryOfOrigin: row.country_of_origin || row.countryOfOrigin || '',
    ethnicity: row.ethnicity || '',
    enquiryEmail: row.enquiry_email || row.enquiryEmail || 'ask.anything@psytec.com.sg',
    enquiryMobile: row.enquiry_mobile || row.enquiryMobile || '+65 91681166',
    profileVisible: !!row.profile_visible,
    profileStatus: row.profile_status || row.profileStatus || 'draft',
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null
  };
};

const normalizeMhpStatusRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  return {
    profileStatus: row.profile_status || row.profileStatus || null,
    profileVisible: row.profile_visible ?? row.profileVisible ?? null,
    fullName: row.full_name || row.fullName || '',
    professionalTitle: row.professional_title || row.professionalTitle || '',
    photoUrl: row.photo_url || row.photoUrl || '',
    membershipStatus: row.membership_status || row.membershipStatus || null,
    institutionName: row.institution_name || row.institutionName || '',
    membershipExpiresAt: row.membership_expires_at || row.membershipExpiresAt || null,
    latestDocumentStatus: row.latest_document_status || row.latestDocumentStatus || null,
    latestExtractionStatus: row.latest_extraction_status || row.latestExtractionStatus || null
  };
};

const fetchMhpProfilesSafe = async ({ query, userId, authSession, context }) => fetchReviewGrantsSafe({
  table: 'mental_health_professional_profiles',
  query,
  userId,
  authSession,
  context,
  unavailableCheck: isMhpProfileContractUnavailable
});

const mhpProfileWriteSafe = async ({ method, userId, authSession, context, body, query = '' }) => reviewGrantWriteSafe({
  method,
  userId,
  authSession,
  context,
  body,
  query,
  table: 'mental_health_professional_profiles',
  unavailableCheck: isMhpProfileContractUnavailable
});

const MHP_LICENSE_BUCKET = 'professional-license-documents';
const MHP_LICENSE_MAX_BYTES = 10 * 1024 * 1024;
const MHP_EXTRACTION_REQUEST_TIMEOUT_MS = 25000;

const normalizeMhpLicenseDocumentRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  const extractedJson = row.extracted_json || row.extractedJson || null;
  return {
    id: row.id || null,
    userId: row.user_id || row.userId || null,
    storageBucket: row.storage_bucket || row.storageBucket || MHP_LICENSE_BUCKET,
    storagePath: row.storage_path || row.storagePath || '',
    originalFilename: row.original_filename || row.originalFilename || '',
    mimeType: row.mime_type || row.mimeType || 'application/pdf',
    fileSizeBytes: row.file_size_bytes ?? row.fileSizeBytes ?? null,
    documentStatus: row.document_status || row.documentStatus || 'uploaded',
    extractionStatus: row.extraction_status || row.extractionStatus || 'pending',
    extractedJson: extractedJson && typeof extractedJson === 'object' ? extractedJson : null,
    extractionConfidence: row.extraction_confidence || row.extractionConfidence || null,
    extractionModel: row.extraction_model || row.extractionModel || '',
    extractedAt: row.extracted_at || row.extractedAt || null,
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null
  };
};

const fetchMhpLicenseDocumentsSafe = async ({ query, userId, authSession, context }) => fetchReviewGrantsSafe({
  table: 'mental_health_professional_license_documents',
  query,
  userId,
  authSession,
  context,
  unavailableCheck: isMhpProfileContractUnavailable
});

const mhpLicenseDocumentInsertSafe = async ({ userId, authSession, context, body }) => reviewGrantWriteSafe({
  method: 'POST',
  userId,
  authSession,
  context,
  body,
  table: 'mental_health_professional_license_documents',
  unavailableCheck: isMhpProfileContractUnavailable
});

const isMhpLicenseStorageUnavailable = (status, responseText) => {
  if (isMhpProfileContractUnavailable(status, responseText)) return true;
  const text = String(responseText || '').toLowerCase();
  if (text.includes('bucket') && (
    text.includes('not found') ||
    text.includes('does not exist') ||
    text.includes('could not find')
  )) return true;
  if (text.includes('professional-license-documents') && (
    text.includes('not found') ||
    text.includes('policy') ||
    text.includes('row-level security')
  )) return true;
  return false;
};

const uploadMhpLicensePdfSafe = async ({ userId, storagePath, file, authSession, context }) => {
  try {
    const session = await getAuthenticatedReadSession(userId, context, authSession);
    const encodedPath = String(storagePath || '')
      .split('/')
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join('/');
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${MHP_LICENSE_BUCKET}/${encodedPath}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/pdf',
        'x-upsert': 'false'
      },
      body: file
    });
    const responseText = await response.text();
    if (!response.ok) {
      if (isMhpLicenseStorageUnavailable(response.status, responseText)) {
        AuthDebug.log('[db] MHP licence storage unavailable:', { context, status: response.status });
        return { ok: false, unavailable: true, responseText };
      }
      AuthDebug.log('[db] MHP licence storage upload failed:', { context, status: response.status, responseText });
      return { ok: false, unavailable: false, responseText };
    }
    return { ok: true, unavailable: false, responseText: null };
  } catch (err) {
    const message = String(err?.message || err);
    if (isMhpLicenseStorageUnavailable(0, message)) {
      return { ok: false, unavailable: true, responseText: message };
    }
    AuthDebug.log('[db] MHP licence storage upload exception:', { context, message });
    return { ok: false, unavailable: false, responseText: message };
  }
};

const fetchMhpOnboardingRowsSafe = async ({ userId, authSession, context }) => {
  try {
    const session = await getAuthenticatedReadSession(userId, context, authSession);
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json'
    };
    const profileParams = new URLSearchParams({
      select: 'profile_status,profile_visible',
      user_id: `eq.${userId}`,
      limit: '1'
    });
    const membershipParams = new URLSearchParams({
      select: 'membership_status,institutional_membership_expires_at',
      user_id: `eq.${userId}`,
      limit: '1'
    });
    const [profileResponse, membershipResponse] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/mental_health_professional_profiles?${profileParams.toString()}`, {
        method: 'GET',
        headers
      }),
      fetch(`${SUPABASE_URL}/rest/v1/mental_health_professional_memberships?${membershipParams.toString()}`, {
        method: 'GET',
        headers
      })
    ]);
    const profileText = await profileResponse.text();
    const membershipText = await membershipResponse.text();
    if (!profileResponse.ok) {
      if (isMhpProfileContractUnavailable(profileResponse.status, profileText)) {
        return { unavailable: true, profile: null, membership: null };
      }
      AuthDebug.log('[db] MHP onboarding profile read failed:', {
        context,
        status: profileResponse.status
      });
      return { unavailable: false, profile: null, membership: null, error: true };
    }
    if (!membershipResponse.ok) {
      if (isMhpProfileContractUnavailable(membershipResponse.status, membershipText)) {
        return { unavailable: true, profile: null, membership: null };
      }
      AuthDebug.log('[db] MHP onboarding membership read failed:', {
        context,
        status: membershipResponse.status
      });
      return { unavailable: false, profile: null, membership: null, error: true };
    }
    const profileRows = profileText ? JSON.parse(profileText) : [];
    const membershipRows = membershipText ? JSON.parse(membershipText) : [];
    return {
      unavailable: false,
      profile: Array.isArray(profileRows) && profileRows.length ? profileRows[0] : null,
      membership: Array.isArray(membershipRows) && membershipRows.length ? membershipRows[0] : null,
      error: false
    };
  } catch (err) {
    AuthDebug.log('[db] MHP onboarding read exception:', {
      context,
      message: err?.message || String(err)
    });
    return { unavailable: false, profile: null, membership: null, error: true };
  }
};

const isHostedEventsUnavailable = (status, responseText) => {
  const text = String(responseText || '').toLowerCase();
  if (status === 404) return true;
  if (text.includes('pgrst205')) return true;
  if (text.includes('42p01')) return true;
  if (text.includes('hosted_activity_events') && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('not found') ||
    text.includes('schema cache')
  )) return true;
  return false;
};

const normalizeHostedEventRow = (row) => {
  const venueType = row?.venue_type === 'online' ? 'online' : 'physical';
  const venueLabel = String(row?.venue_address_or_link || '').trim();
  const feeType = row?.fee_type === 'paid' ? 'paid' : 'free';
  const registrationUrl = String(row?.registration_url || '').trim();
  const eventbriteUrl = String(row?.eventbrite_url || '').trim();
  return {
    id: row?.id,
    activity_id: row?.activity_id,
    venueType,
    venueLabel,
    venueUrl: venueType === 'online' ? venueLabel : '',
    date: row?.start_date,
    startTime: row?.start_time || '',
    endTime: row?.end_time || '',
    timezone: row?.timezone || 'Asia/Singapore',
    feeType,
    registrationUrl,
    eventbriteUrl,
    paymentUrl: feeType === 'paid' ? (registrationUrl || eventbriteUrl) : '',
    status: row?.status || 'draft',
    facilitatorLabel: 'Wayfinder facilitator',
    published_at: row?.published_at || null,
    archived_at: row?.archived_at || null,
    created_at: row?.created_at || null,
    updated_at: row?.updated_at || null
  };
};

const fetchHostedEventsSafe = async ({ query, userId, authSession, context }) => {
  try {
    const session = await getAuthenticatedReadSession(userId, context, authSession);
    const params = new URLSearchParams(query);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/hosted_activity_events?${params.toString()}`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json'
      }
    });
    const responseText = await response.text();
    if (!response.ok) {
      if (isHostedEventsUnavailable(response.status, responseText)) {
        AuthDebug.log('[db] hosted events table unavailable:', { context, status: response.status });
        return { events: [], unavailable: true };
      }
      AuthDebug.log('[db] hosted events read failed:', { context, status: response.status, responseText });
      return { events: [], unavailable: false };
    }
    let data = [];
    try {
      data = responseText ? JSON.parse(responseText) : [];
    } catch {
      data = [];
    }
    const events = (Array.isArray(data) ? data : []).map(normalizeHostedEventRow);
    return { events, unavailable: false };
  } catch (err) {
    const message = String(err?.message || err);
    if (isHostedEventsUnavailable(0, message)) {
      return { events: [], unavailable: true };
    }
    AuthDebug.log('[db] hosted events read exception:', { context, message });
    return { events: [], unavailable: false };
  }
};

const hostedEventWriteSafe = async ({ method, userId, authSession, context, body, eventId = null }) => {
  try {
    const session = await getAuthenticatedReadSession(userId, context, authSession);
    const url = eventId
      ? `${SUPABASE_URL}/rest/v1/hosted_activity_events?id=eq.${encodeURIComponent(eventId)}`
      : `${SUPABASE_URL}/rest/v1/hosted_activity_events`;
    const response = await fetch(url, {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(body)
    });
    const responseText = await response.text();
    if (!response.ok) {
      if (isHostedEventsUnavailable(response.status, responseText)) {
        return { ok: false, unavailable: true, event: null };
      }
      AuthDebug.log('[db] hosted events write failed:', { context, status: response.status, responseText });
      return { ok: false, unavailable: false, event: null };
    }
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return { ok: true, unavailable: false, event: row ? normalizeHostedEventRow(row) : null };
  } catch (err) {
    const message = String(err?.message || err);
    if (isHostedEventsUnavailable(0, message)) {
      return { ok: false, unavailable: true, event: null };
    }
    AuthDebug.log('[db] hosted events write exception:', { context, message });
    return { ok: false, unavailable: false, event: null };
  }
};

const isReviewGrantsUnavailable = (status, responseText) => {
  const text = String(responseText || '').toLowerCase();
  if (status === 404) return true;
  if (text.includes('pgrst205')) return true;
  if (text.includes('42p01')) return true;
  if (text.includes('counsellor_review_grant') && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('not found') ||
    text.includes('schema cache')
  )) return true;
  if (text.includes('resolve_counsellor_user_id') && text.includes('does not exist')) return true;
  if (text.includes('list_available_counsellors') && text.includes('does not exist')) return true;
  if (text.includes('create_parent_review_grant') && text.includes('does not exist')) return true;
  if (text.includes('infinite recursion')) return true;
  if (text.includes('parent_can_link_journal_entry_to_grant') && text.includes('does not exist')) return true;
  return false;
};

const isReviewResponsesUnavailable = (status, responseText) => {
  if (isReviewGrantsUnavailable(status, responseText)) return true;
  const text = String(responseText || '').toLowerCase();
  if (text.includes('counsellor_review_responses') && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('not found') ||
    text.includes('schema cache')
  )) return true;
  if (text.includes('publish_counsellor_review_response') && text.includes('does not exist')) return true;
  if (text.includes('revoke_counsellor_review_response') && text.includes('does not exist')) return true;
  if (text.includes('get_parent_published_review_responses') && text.includes('does not exist')) return true;
  if (text.includes('get_counsellor_review_response_for_grant_entry') && text.includes('does not exist')) return true;
  if (text.includes('counsellor_review_grant_is_writable') && text.includes('does not exist')) return true;
  if (text.includes('parent_can_read_published_review_response') && text.includes('does not exist')) return true;
  if (text.includes('grant_entry_id') && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('schema cache') ||
    text.includes('column')
  )) return true;
  return false;
};

const isRpcSignatureUnavailable = (responseText) => {
  const text = String(responseText || '').toLowerCase();
  return (
    text.includes('function') ||
    text.includes('procedure')
  ) && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('not found') ||
    text.includes('no function matches') ||
    text.includes('function matching') ||
    text.includes('argument') ||
    text.includes('parameter')
  );
};

const isMhpRpcUnavailable = (status, responseText) => {
  if (isMhpProfileContractUnavailable(status, responseText)) return true;
  return isRpcSignatureUnavailable(responseText);
};

const isAuthSessionLike = (value) => !!(value && typeof value === 'object' && value.access_token);

const parseParentFeedbackReflectionArgs = (arg3, arg4, arg5) => {
  if (isAuthSessionLike(arg3) || (typeof arg3 === 'string' && (arg4 === undefined || isAuthSessionLike(arg4)))) {
    return {
      grantEntryId: null,
      reflectionText: typeof arg3 === 'string' ? arg3 : '',
      authSession: isAuthSessionLike(arg4) ? arg4 : (isAuthSessionLike(arg3) ? arg3 : null)
    };
  }
  return {
    grantEntryId: arg3,
    reflectionText: typeof arg4 === 'string' ? arg4 : '',
    authSession: isAuthSessionLike(arg5) ? arg5 : (isAuthSessionLike(arg4) ? arg4 : null)
  };
};

const COUNSELLOR_REVIEW_RESPONSE_LEGACY_SELECT = 'id,grant_id,counsellor_user_id,parent_user_id,parent_id,counsellor_wayfinder_id,status,response_sections,parent_facing_text,ai_draft_json,counsellor_working_notes,published_at,revoked_at,created_at,updated_at';

const isParentFeedbackUnavailable = (status, responseText) => {
  if (isReviewResponsesUnavailable(status, responseText)) return true;
  const text = String(responseText || '').toLowerCase();
  const rpcOrTableMissing = (name) => text.includes(name) && (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('not found') ||
    text.includes('schema cache')
  );
  if (rpcOrTableMissing('parent_counsellor_feedback_reads')) return true;
  if (rpcOrTableMissing('parent_counsellor_feedback_reflections')) return true;
  if (rpcOrTableMissing('parent_counsellor_grant_entry_locks')) return true;
  if (rpcOrTableMissing('parent_owns_published_feedback_response')) return true;
  if (rpcOrTableMissing('get_parent_unread_counsellor_feedback_count')) return true;
  if (rpcOrTableMissing('get_parent_unread_counsellor_feedback_summary')) return true;
  if (rpcOrTableMissing('get_parent_counsellor_feedback_detail')) return true;
  if (rpcOrTableMissing('mark_parent_counsellor_feedback_read')) return true;
  if (rpcOrTableMissing('save_parent_counsellor_feedback_reflection')) return true;
  if (rpcOrTableMissing('get_parent_counsellor_feedback_reflection')) return true;
  if (rpcOrTableMissing('get_parent_entry_review_lock_map')) return true;
  return false;
};

const parentFeedbackUnavailableReason = (responseText) => {
  const text = String(responseText || '').toLowerCase();
  if (
    text.includes('does not exist') ||
    text.includes('could not find') ||
    text.includes('not found') ||
    text.includes('schema cache')
  ) {
    return 'feedback_data_contract_not_applied';
  }
  return 'feedback_request_failed';
};

const parseParentFeedbackRpcCount = (data) => {
  if (typeof data === 'number' && Number.isFinite(data)) return Math.max(0, Math.trunc(data));
  if (typeof data === 'string') {
    const trimmed = data.trim().replace(/^"|"$/g, '');
    if (trimmed === '') return 0;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return Math.max(0, Math.trunc(parsed));
  }
  return 0;
};

const normalizeParentFeedbackSummaryRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  return {
    responseId: row.response_id || row.responseId || null,
    grantId: row.grant_id || row.grantId || null,
    grantEntryId: row.grant_entry_id || row.grantEntryId || null,
    journalEntryId: row.journal_entry_id || row.journalEntryId || null,
    counsellorWayfinderId: row.counsellor_wayfinder_id || row.counsellorWayfinderId || '',
    publishedAt: row.published_at || row.publishedAt || null,
    contextLabel: row.context_label || row.contextLabel || ''
  };
};

const normalizeLinkedGrantEntries = (value) => {
  let source = value;
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      source = [];
    }
  }
  if (!Array.isArray(source)) return [];
  return source.map((item) => {
    if (!item || typeof item !== 'object') return null;
    const grantEntryId = item.grant_entry_id || item.grantEntryId || null;
    const journalEntryId = item.journal_entry_id || item.journalEntryId || null;
    if (!grantEntryId || !journalEntryId) return null;
    return { grantEntryId, journalEntryId };
  }).filter(Boolean);
};

const normalizeParentFeedbackDetailRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  const grantEntryId = row.grant_entry_id || row.grantEntryId || null;
  const journalEntryId = row.journal_entry_id || row.journalEntryId || null;
  let linkedJournalEntryIds = Array.isArray(row.linked_journal_entry_ids)
    ? row.linked_journal_entry_ids.map(String)
    : (Array.isArray(row.linkedJournalEntryIds) ? row.linkedJournalEntryIds.map(String) : []);
  let linkedGrantEntries = normalizeLinkedGrantEntries(row.linked_grant_entries ?? row.linkedGrantEntries);
  if (grantEntryId && journalEntryId) {
    if (!linkedGrantEntries.length) {
      linkedGrantEntries = [{ grantEntryId, journalEntryId }];
    }
    if (!linkedJournalEntryIds.length) {
      linkedJournalEntryIds = [String(journalEntryId)];
    }
  } else if (linkedGrantEntries.length) {
    // Legacy bundled detail rows remain available until per-entry SQL is applied.
  }
  return {
    responseId: row.response_id || row.responseId || null,
    grantId: row.grant_id || row.grantId || null,
    grantEntryId: grantEntryId || linkedGrantEntries[0]?.grantEntryId || null,
    journalEntryId: journalEntryId || linkedGrantEntries[0]?.journalEntryId || null,
    counsellorWayfinderId: row.counsellor_wayfinder_id || row.counsellorWayfinderId || '',
    parentFacingText: row.parent_facing_text || row.parentFacingText || '',
    publishedAt: row.published_at || row.publishedAt || null,
    isRead: !!(row.is_read ?? row.isRead),
    readAt: row.read_at || row.readAt || null,
    linkedJournalEntryIds,
    linkedGrantEntries
  };
};

const normalizeParentFeedbackReadRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  return {
    responseId: row.response_id || row.responseId || null,
    grantId: row.grant_id || row.grantId || null,
    readAt: row.read_at || row.readAt || null,
    entriesLocked: !!(row.entries_locked ?? row.entriesLocked)
  };
};

const normalizeParentFeedbackReflectionRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  return {
    reflectionId: row.reflection_id || row.reflectionId || row.id || null,
    journalEntryId: row.journal_entry_id || row.journalEntryId || null,
    reflectionText: row.reflection_text || row.reflectionText || '',
    updatedAt: row.updated_at || row.updatedAt || null
  };
};

const normalizeParentEntryReviewLockRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  return {
    journalEntryId: row.journal_entry_id || row.journalEntryId || null,
    isLocked: !!(row.is_locked ?? row.isLocked),
    lockReason: row.lock_reason || row.lockReason || null,
    lockedAt: row.locked_at || row.lockedAt || null
  };
};

const parentFeedbackRpcRows = (data) => (Array.isArray(data) ? data : (data ? [data] : []));

const normalizeCounsellorReviewResponseRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  const responseId = row.response_id || row.responseId || row.id || null;
  return {
    id: responseId,
    responseId,
    grantId: row.grant_id || row.grantId || null,
    grantEntryId: row.grant_entry_id || row.grantEntryId || null,
    journalEntryId: row.journal_entry_id || row.journalEntryId || null,
    counsellorUserId: row.counsellor_user_id || row.counsellorUserId || null,
    parentUserId: row.parent_user_id || row.parentUserId || null,
    parentId: row.parent_id || row.parentId || '',
    counsellorWayfinderId: row.counsellor_wayfinder_id || row.counsellorWayfinderId || '',
    status: row.status || 'draft',
    responseSections: row.response_sections || row.responseSections || {},
    parentFacingText: row.parent_facing_text || row.parentFacingText || '',
    aiDraftJson: row.ai_draft_json ?? row.aiDraftJson ?? null,
    counsellorWorkingNotes: row.counsellor_working_notes ?? row.counsellorWorkingNotes ?? null,
    publishedAt: row.published_at || row.publishedAt || null,
    revokedAt: row.revoked_at || row.revokedAt || null,
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null
  };
};

const normalizeCounsellorGrantLinkRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  const grantEntryId = row.id || row.grant_entry_id || row.grantEntryId || null;
  const journalEntryId = row.journal_entry_id || row.journalEntryId || null;
  const grantId = row.grant_id || row.grantId || null;
  if (!grantEntryId || !journalEntryId || !grantId) return null;
  return {
    id: grantEntryId,
    grant_id: grantId,
    grantEntryId,
    grantId,
    journal_entry_id: journalEntryId,
    journalEntryId
  };
};

const normalizeParentPublishedReviewResponseRow = (row) => {
  if (!row || typeof row !== 'object') return null;
  return {
    responseId: row.response_id || row.responseId || row.id || null,
    grantId: row.grant_id || row.grantId || null,
    grantEntryId: row.grant_entry_id || row.grantEntryId || null,
    journalEntryId: row.journal_entry_id || row.journalEntryId || null,
    counsellorWayfinderId: row.counsellor_wayfinder_id || row.counsellorWayfinderId || '',
    parentFacingText: row.parent_facing_text || row.parentFacingText || '',
    publishedAt: row.published_at || row.publishedAt || null
  };
};

const fetchReviewResponsesSafe = async ({ query, userId, authSession, context }) => fetchReviewGrantsSafe({
  table: 'counsellor_review_responses',
  query,
  userId,
  authSession,
  context,
  unavailableCheck: isReviewResponsesUnavailable
});

const reviewResponseWriteSafe = async ({ method, userId, authSession, context, body, query = '' }) => reviewGrantWriteSafe({
  method,
  userId,
  authSession,
  context,
  body,
  query,
  table: 'counsellor_review_responses',
  unavailableCheck: isReviewResponsesUnavailable
});

const callReviewResponseRpcSafe = async ({
  rpcName,
  userId,
  authSession,
  context,
  body = {},
  unavailableCheck = isReviewResponsesUnavailable
}) => {
  try {
    const session = await getAuthenticatedReadSession(userId, context, authSession);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const responseText = await response.text();
    if (!response.ok) {
      if (unavailableCheck(response.status, responseText)) {
        AuthDebug.log('[db] review responses RPC unavailable:', { context, rpcName, status: response.status });
        return { ok: false, unavailable: true, data: null, responseText };
      }
      AuthDebug.log('[db] review responses RPC failed:', { context, rpcName, status: response.status, responseText });
      return { ok: false, unavailable: false, data: null, responseText };
    }
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = responseText || null;
    }
    return { ok: true, unavailable: false, data, responseText };
  } catch (err) {
    const message = String(err?.message || err);
    if (unavailableCheck(0, message)) {
      return { ok: false, unavailable: true, data: null, responseText: message };
    }
    AuthDebug.log('[db] review responses RPC exception:', { context, rpcName, message });
    return { ok: false, unavailable: false, data: null, responseText: message };
  }
};

const callMhpRpcSafe = (args) => callReviewResponseRpcSafe({
  ...args,
  unavailableCheck: isMhpRpcUnavailable
});

const callParentFeedbackRpcSafe = (args) => callReviewResponseRpcSafe({
  ...args,
  unavailableCheck: isParentFeedbackUnavailable
});

const fetchReviewGrantsSafe = async ({ table, query, userId, authSession, context, unavailableCheck = isReviewGrantsUnavailable }) => {
  try {
    const session = await getAuthenticatedReadSession(userId, context, authSession);
    const params = new URLSearchParams(query);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json'
      }
    });
    const responseText = await response.text();
    if (!response.ok) {
      if (unavailableCheck(response.status, responseText)) {
        AuthDebug.log('[db] review grants table unavailable:', { context, status: response.status });
        return { rows: [], unavailable: true, ok: false };
      }
      AuthDebug.log('[db] review grants read failed:', { context, status: response.status, responseText });
      return { rows: [], unavailable: false, ok: false };
    }
    let data = [];
    try {
      data = responseText ? JSON.parse(responseText) : [];
    } catch {
      data = [];
    }
    return { rows: Array.isArray(data) ? data : [], unavailable: false, ok: true };
  } catch (err) {
    const message = String(err?.message || err);
    if (unavailableCheck(0, message)) {
      return { rows: [], unavailable: true, ok: false };
    }
    AuthDebug.log('[db] review grants read exception:', { context, message });
    return { rows: [], unavailable: false, ok: false };
  }
};

const reviewGrantWriteSafe = async ({
  method,
  userId,
  authSession,
  context,
  body,
  table = 'counsellor_review_grants',
  query = '',
  unavailableCheck = isReviewGrantsUnavailable
}) => {
  try {
    const session = await getAuthenticatedReadSession(userId, context, authSession);
    const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        Prefer: method === 'POST' ? 'return=representation' : 'return=representation'
      },
      body: JSON.stringify(body)
    });
    const responseText = await response.text();
    if (!response.ok) {
      if (unavailableCheck(response.status, responseText)) {
        return { ok: false, unavailable: true, rows: null };
      }
      AuthDebug.log('[db] review grants write failed:', { context, status: response.status, responseText });
      return { ok: false, unavailable: false, rows: null, responseText };
    }
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = null;
    }
    const rows = Array.isArray(data) ? data : (data ? [data] : []);
    return { ok: true, unavailable: false, rows };
  } catch (err) {
    const message = String(err?.message || err);
    if (unavailableCheck(0, message)) {
      return { ok: false, unavailable: true, rows: null };
    }
    AuthDebug.log('[db] review grants write exception:', { context, message });
    return { ok: false, unavailable: false, rows: null, responseText: message };
  }
};

const parseApiJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

// ---- AUTH ----
const Auth = {
  signUp: (email, password) => sb.auth.signUp({ email, password }),
  signIn: (email, password) => sb.auth.signInWithPassword({ email, password }),
  requestPasswordReset: async (email) => {
    const target = String(email || '').trim();
    if (!target) {
      return {
        data: null,
        error: new Error('Enter your email address.')
      };
    }
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;
    const options = redirectTo ? { redirectTo } : undefined;
    const { data, error } = await sb.auth.resetPasswordForEmail(target, options);
    return { data, error };
  },
  updatePassword: (password) => sb.auth.updateUser({ password }),
  resendVerification: async (target) => {
    const session = target && typeof target === 'object' ? target : null;
    const email = (typeof target === 'string' ? target : session?.user?.email || '').trim();
    if (!email) {
      return {
        data: null,
        error: new Error('Email address is unavailable. Please sign in again.')
      };
    }

    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;
    const resendRequest = {
      type: 'signup',
      email
    };
    if (redirectTo) resendRequest.options = { emailRedirectTo: redirectTo };
    const { data, error } = await sb.auth.resend(resendRequest);
    return { data, error };
  },
  signOut: () => {
    activeAuthSession = null;
    return sb.auth.signOut();
  },
  getSession: () => sb.auth.getSession(),
  getFreshSession: async () => {
    const { data, error } = await sb.auth.getSession();
    if (error) return { data: { session: null }, error };
    const session = await withFreshSessionUser(data?.session || null);
    activeAuthSession = session || null;
    return { data: { session }, error: null };
  },
  consumeAuthRedirect: async () => {
    const params = authHashParams();
    const hashDetected = !!params;
    const hashType = params?.get('type') || '';
    let session = null;
    let error = null;

    AuthDebug.log('[auth] callback/hash detected:', { hashDetected, hashType });

    try {
      const current = await Auth.getFreshSession();
      if (current.error) throw current.error;
      session = current.data?.session || null;

      if (!session?.access_token && params?.has('access_token') && params?.has('refresh_token') && sb.auth.setSession) {
        const result = await sb.auth.setSession({
          access_token: params.get('access_token'),
          refresh_token: params.get('refresh_token')
        });
        if (result.error) throw result.error;
        session = await withFreshSessionUser(result.data?.session || null);
        activeAuthSession = session || null;
      }
    } catch (err) {
      error = err;
    } finally {
      if (hashDetected) clearAuthHashFromUrl();
    }

    AuthDebug.log('[auth] callback/hash session result:', {
      hashDetected,
      hashType,
      sessionExists: !!session,
      accessTokenExists: !!session?.access_token,
      sessionUserId: session?.user?.id || null,
      emailConfirmedFieldsPresent: isEmailConfirmedUser(session?.user),
      errorMessage: error?.message || null
    });

    return { hashDetected, hashType, session, error };
  },
  getAuthHashType: authHashType,
  isEmailConfirmed: isEmailConfirmedUser,
  clearAuthHashFromUrl,
  setActiveSession: (session) => {
    activeAuthSession = session || null;
    AuthDebug.log('[auth] active session cache updated:', {
      sessionExists: !!activeAuthSession,
      accessTokenExists: !!activeAuthSession?.access_token,
      sessionUserId: activeAuthSession?.user?.id || null
    });
  },
  getActiveSession: () => activeAuthSession,
  onAuthChange: (cb) => sb.auth.onAuthStateChange(cb),
};

// ---- PROFILES ----
const Profile = {
  get: async (userId) => {
    AuthDebug.log('[profile] query existing:', { userId });
    const { data, error, count } = await sb.from('profiles')
      .select('parent_id, role', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);
    const profile = data && data.length > 0 ? data[0] : null;
    AuthDebug.log('[profile] query existing result:', {
      userId,
      found: !!profile,
      rowCount: count || 0,
      parentId: profile?.parent_id || null,
      errorCode: error?.code || null,
      errorMessage: error?.message || null
    });
    if (error) throw error;
    return profile;
  },
  getExtended: async (userId) => {
    const { data, error } = await sb.from('profiles')
      .select('parent_id, role, disc_image_url, disc_bars, insight_text, insight_generated_at, insight_entry_count, insight_latest_entry_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);
    if (error) console.error('getExtended error:', error);
    return data && data.length > 0 ? data[0] : null;
  },
  waitForSession: async (userId, providedSession) => {
    const providedUserId = providedSession?.user?.id || null;
    const providedHasAccessToken = !!providedSession?.access_token;

    AuthDebug.log('[profile] auth session source check:', {
      source: 'callback session',
      sessionExists: !!providedSession,
      accessTokenExists: providedHasAccessToken,
      sessionUserId: providedUserId,
      requestedUserId: userId
    });

    if (providedSession && providedHasAccessToken) {
      if (providedUserId !== userId) {
        throw new Error(`Authenticated session user mismatch. requested=${userId} session=${providedUserId}`);
      }
      return providedSession;
    }

    const maxAttempts = 5;
    const delayMs = 150;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { data: sessionData, error: sessionError } = await sb.auth.getSession();
      if (sessionError) throw sessionError;

      const session = sessionData?.session || null;
      const sessionUserId = session?.user?.id || null;
      const hasAccessToken = !!session?.access_token;

      AuthDebug.log('[profile] auth session source check:', {
        source: 'getSession',
        attempt,
        sessionExists: !!session,
        accessTokenExists: hasAccessToken,
        sessionUserId,
        requestedUserId: userId
      });

      if (session && hasAccessToken) {
        if (sessionUserId !== userId) {
          throw new Error(`Authenticated session user mismatch. requested=${userId} session=${sessionUserId}`);
        }
        return session;
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }

    throw new Error(`Auth session not ready for user ${userId}.`);
  },
  getExisting: async (userId, session) => {
    const authSession = await Profile.waitForSession(userId, session);
    const data = await authenticatedSelect({
      table: 'profiles',
      query: {
        select: 'parent_id,role',
        user_id: `eq.${userId}`,
        limit: '1'
      },
      userId,
      session: authSession,
      context: 'getExisting profile'
    });
    return data.length > 0 ? data[0] : null;
  },
  getOrCreate: async (userId, role, session) => {
    const profileRole = role || 'parent';
    const authSession = await Profile.waitForSession(userId, session);
    const confirmedAccessToken = authSession?.access_token || null;
    const confirmedUserId = authSession?.user?.id || null;

    AuthDebug.log('[profile] confirmed auth session:', {
      confirmedSessionExists: !!authSession,
      confirmedAccessTokenExists: !!confirmedAccessToken,
      confirmedUserId,
      requestedUserId: userId
    });

    if (!confirmedAccessToken) {
      throw new Error(`Confirmed Supabase session missing access token for user ${userId}.`);
    }
    if (confirmedUserId !== userId) {
      throw new Error(`Confirmed session user mismatch. requested=${userId} confirmed=${confirmedUserId}`);
    }

    AuthDebug.log('[profile] ensure_profile fetch attempt:', { userId, role: profileRole });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ensure_profile`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${confirmedAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_role: profileRole })
    });

    const responseText = await response.text();
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      data = responseText;
    }

    if (!response.ok) {
      console.error('[profile] ensure_profile fetch failed:', {
        userId,
        role: profileRole,
        status: response.status,
        statusText: response.statusText,
        errorBody: data
      });
      throw new Error(`ensure_profile failed with status ${response.status}: ${responseText || response.statusText}`);
    }

    const profile = Array.isArray(data) ? data[0] : data;
    AuthDebug.log('[profile] ensure_profile fetch result:', {
      userId,
      found: !!profile,
      parentId: profile?.parent_id || null,
      role: profile?.role || null
    });
    if (!profile) throw new Error('ensure_profile returned no row.');
    return profile;
  },
  saveDiscBars: async (userId, bars) => {
    const { error } = await sb.from('profiles')
      .update({ disc_bars: bars })
      .eq('user_id', userId);
    if (error) console.error('saveDiscBars error:', error);
  },
  saveDiscImageUrl: async (userId, url) => {
    const { error } = await sb.from('profiles')
      .update({ disc_image_url: url })
      .eq('user_id', userId);
    if (error) console.error('saveDiscImageUrl error:', error);
  },
  saveInsight: async (userId, text, entryCount, latestEntryAt) => {
    const { error } = await sb.from('profiles')
      .update({
        insight_text: text,
        insight_generated_at: new Date().toISOString(),
        insight_entry_count: entryCount,
        insight_latest_entry_at: profileTimestampOrNull(latestEntryAt)
      })
      .eq('user_id', userId);
    if (error) console.error('saveInsight error:', error);
  },
};
// ---- DATABASE ----
const DB = {
  // Dyads
  getAllDyads: async (userId, parentId, authSession = null) => {
    const mapDyads = rows => (rows || []).map(r => ({
      ...(r.data || {}),
      parentId: r.data?.parentId || r.parent_id || parentId,
      childId: r.data?.childId || r.child_id
    }));

    if (parentId) {
      try {
        const data = await authenticatedSelect({
          table: 'dyads',
          query: {
            select: 'child_id,parent_id,data',
            parent_id: `eq.${parentId}`,
            order: 'id.asc'
          },
          userId,
          parentId,
          session: authSession,
          context: 'getAllDyads parent_id'
        });
        if (data.length > 0) return mapDyads(data);
      } catch (error) {
        console.error('getAllDyads parent_id error:', error);
      }
    }

    const data = await authenticatedSelect({
      table: 'dyads',
      query: {
        select: 'child_id,parent_id,data',
        user_id: `eq.${userId}`,
        order: 'id.asc'
      },
      userId,
      parentId,
      session: authSession,
      context: 'getAllDyads user_id'
    });
    return mapDyads(data);
  },

  getDyad: async (userId, childId, parentId, authSession = null) => {
    if (parentId) {
      try {
        const data = await authenticatedSelect({
          table: 'dyads',
          query: {
            select: 'child_id,parent_id,data',
            parent_id: `eq.${parentId}`,
            child_id: `eq.${childId}`,
            limit: '1'
          },
          userId,
          parentId,
          session: authSession,
          context: 'getDyad parent_id'
        });
        if (data.length > 0) {
          const row = data[0];
          return { ...(row.data || {}), parentId: row.data?.parentId || row.parent_id, childId: row.data?.childId || row.child_id };
        }
      } catch (error) {
        console.error('getDyad parent_id error:', error);
      }
    }

    const data = await authenticatedSelect({
      table: 'dyads',
      query: {
        select: 'child_id,parent_id,data',
        user_id: `eq.${userId}`,
        child_id: `eq.${childId}`,
        limit: '1'
      },
      userId,
      parentId,
      session: authSession,
      context: 'getDyad user_id'
    });
    if (data.length === 0) return null;
    const row = data[0];
    return { ...(row.data || {}), parentId: row.data?.parentId || row.parent_id, childId: row.data?.childId || row.child_id };
  },

  saveDyad: async (userId, parentId, dyad, authSession = null) => {
    let session = null;
    try {
      session = await getAuthenticatedReadSession(userId, 'saveDyad', authSession);
    } catch (_) {}

    if (session?.access_token) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/dyads?on_conflict=user_id,child_id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ user_id: userId, parent_id: parentId, child_id: dyad.childId, data: dyad })
      });
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Authenticated saveDyad failed with status ${response.status}: ${responseText || response.statusText}`);
      }
      return;
    }

    const { error } = await sb.from('dyads')
      .upsert({ user_id: userId, parent_id: parentId, child_id: dyad.childId, data: dyad }, { onConflict: 'user_id,child_id' });
    if (error) throw error;
  },

  // Journal entries
  getEntries: async (userId, parentId, authSession = null) => {
    const mapEntries = rows => (rows || []).map(r => normalizeJournalEntryRow(r, parentId));

    if (parentId) {
      try {
        const data = await authenticatedSelect({
          table: 'journal_entries',
          query: {
            select: 'id,parent_id,data,created_at',
            parent_id: `eq.${parentId}`,
            order: 'id.desc'
          },
          userId,
          parentId,
          session: authSession,
          context: 'getEntries parent_id'
        });
        if (data.length > 0) return mapEntries(data);
      } catch (error) {
        console.error('getEntries parent_id error:', error);
      }
    }

    const data = await authenticatedSelect({
      table: 'journal_entries',
      query: {
        select: 'id,parent_id,data,created_at',
        user_id: `eq.${userId}`,
        order: 'id.desc'
      },
      userId,
      parentId,
      session: authSession,
      context: 'getEntries user_id'
    });
    return mapEntries(data);
  },

  getAllEntries: async (userId, authSession = null) => {
    const data = await authenticatedSelect({
      table: 'journal_entries',
      query: {
        select: 'id,parent_id,data,created_at',
        order: 'id.desc'
      },
      userId,
      session: authSession,
      context: 'getAllEntries'
    });
    return (data || []).map(r => normalizeJournalEntryRow(r));
  },

  saveEntry: async (userId, entry, authSession = null) => {
    let session = null;
    try {
      session = await getAuthenticatedReadSession(userId, 'saveEntry', authSession);
    } catch (_) {}

    if (session?.access_token) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/journal_entries`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ id: entry.id, user_id: userId, parent_id: entry.parentId, data: entry })
      });
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Authenticated saveEntry failed with status ${response.status}: ${responseText || response.statusText}`);
      }
      return;
    }

    const { error } = await sb.from('journal_entries')
      .insert({ id: entry.id, user_id: userId, parent_id: entry.parentId, data: entry });
    if (error) console.error('saveEntry error:', error);
  },

  // Reviews
  getReview: async (userId, entryId, authSession = null) => {
    const data = await authenticatedSelect({
      table: 'reviews',
      query: {
        select: 'data',
        user_id: `eq.${userId}`,
        entry_id: `eq.${entryId}`,
        limit: '1'
      },
      userId,
      session: authSession,
      context: 'getReview'
    });
    return data.length > 0 ? data[0].data : null;
  },

  saveReview: async (userId, entryId, review, authSession = null) => {
    const session = await getAuthenticatedReadSession(userId, 'saveReview', authSession);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews?on_conflict=entry_id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ entry_id: entryId, user_id: userId, data: review })
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Authenticated saveReview failed with status ${response.status}: ${responseText || response.statusText}`);
    }
  },

  getPublishedHostedEvents: async (authSession = null) => fetchHostedEventsSafe({
    query: {
      select: 'id,activity_id,facilitator_user_id,venue_type,venue_address_or_link,start_date,start_time,end_time,timezone,fee_type,registration_url,eventbrite_url,status,published_at,archived_at,created_at,updated_at',
      status: 'eq.published',
      order: 'start_date.asc,start_time.asc'
    },
    userId: authSession?.user?.id || null,
    authSession,
    context: 'getPublishedHostedEvents'
  }),

  getCounsellorHostedEvents: async (userId, authSession = null) => fetchHostedEventsSafe({
    query: {
      select: 'id,activity_id,facilitator_user_id,venue_type,venue_address_or_link,start_date,start_time,end_time,timezone,fee_type,registration_url,eventbrite_url,status,published_at,archived_at,created_at,updated_at',
      facilitator_user_id: `eq.${userId}`,
      order: 'start_date.desc,start_time.desc'
    },
    userId,
    authSession,
    context: 'getCounsellorHostedEvents'
  }),

  createHostedEvent: async (userId, payload, authSession = null) => hostedEventWriteSafe({
    method: 'POST',
    userId,
    authSession,
    context: 'createHostedEvent',
    body: {
      ...payload,
      facilitator_user_id: userId,
      updated_at: new Date().toISOString()
    }
  }),

  updateHostedEvent: async (userId, eventId, payload, authSession = null) => hostedEventWriteSafe({
    method: 'PATCH',
    userId,
    authSession,
    context: 'updateHostedEvent',
    eventId,
    body: {
      ...payload,
      updated_at: new Date().toISOString()
    }
  }),

  resolveCounsellorUserId: async (wayfinderId, authSession = null) => {
    try {
      const session = await getAuthenticatedReadSession(null, 'resolveCounsellorUserId', authSession);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/resolve_counsellor_user_id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_wayfinder_id: String(wayfinderId || '').trim() })
      });
      const responseText = await response.text();
      if (!response.ok) {
        if (isReviewGrantsUnavailable(response.status, responseText)) {
          return { userId: null, unavailable: true };
        }
        return { userId: null, unavailable: false };
      }
      const userId = responseText ? JSON.parse(responseText) : null;
      return { userId: userId || null, unavailable: false };
    } catch (err) {
      const message = String(err?.message || err);
      if (isReviewGrantsUnavailable(0, message)) {
        return { userId: null, unavailable: true };
      }
      return { userId: null, unavailable: false };
    }
  },

  listAvailableCounsellors: async (authSession = null) => {
    try {
      const session = await getAuthenticatedReadSession(null, 'listAvailableCounsellors', authSession);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/list_available_counsellors`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const responseText = await response.text();
      if (!response.ok) {
        if (isReviewGrantsUnavailable(response.status, responseText)) {
          return { rows: [], unavailable: true };
        }
        return { rows: [], unavailable: false };
      }
      let data = [];
      try {
        data = responseText ? JSON.parse(responseText) : [];
      } catch {
        data = [];
      }
      return { rows: Array.isArray(data) ? data : [], unavailable: false };
    } catch (err) {
      const message = String(err?.message || err);
      if (isReviewGrantsUnavailable(0, message)) {
        return { rows: [], unavailable: true };
      }
      return { rows: [], unavailable: false };
    }
  },

  getParentReviewGrants: async (userId, authSession = null) => fetchReviewGrantsSafe({
    table: 'counsellor_review_grants',
    query: {
      select: 'id,parent_id,counsellor_wayfinder_id,status,consent_version,created_at,expires_at,revoked_at',
      parent_user_id: `eq.${userId}`,
      order: 'created_at.desc'
    },
    userId,
    authSession,
    context: 'getParentReviewGrants'
  }),

  createReviewGrant: async (userId, parentId, payload, entryIds, authSession = null) => {
    const entryIdList = (entryIds || []).map((id) => String(id)).filter(Boolean);
    if (!entryIdList.length) {
      return { ok: false, unavailable: false, grant: null, errorStage: 'entries' };
    }

    try {
      const session = await getAuthenticatedReadSession(userId, 'createReviewGrant', authSession);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_parent_review_grant`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_parent_id: parentId,
          p_counsellor_wayfinder_id: payload.counsellor_wayfinder_id,
          p_consent_version: payload.consent_version,
          p_consent_text_snapshot: payload.consent_text_snapshot,
          p_expires_at: payload.expires_at,
          p_journal_entry_ids: entryIdList
        })
      });
      const responseText = await response.text();
      if (response.ok) {
        let grantId = null;
        try {
          grantId = responseText ? JSON.parse(responseText) : null;
        } catch {
          grantId = responseText || null;
        }
        return {
          ok: true,
          unavailable: false,
          grant: grantId ? { id: grantId, ...payload } : { ...payload },
          errorStage: null
        };
      }
      if (isReviewGrantsUnavailable(response.status, responseText)) {
        return { ok: false, unavailable: true, grant: null, errorStage: 'rpc' };
      }
      AuthDebug.log('[db] createReviewGrant RPC failed:', { status: response.status, responseText });
    } catch (err) {
      const message = String(err?.message || err);
      if (isReviewGrantsUnavailable(0, message)) {
        return { ok: false, unavailable: true, grant: null, errorStage: 'rpc' };
      }
      AuthDebug.log('[db] createReviewGrant RPC exception:', { message });
    }

    const grantResult = await reviewGrantWriteSafe({
      method: 'POST',
      userId,
      authSession,
      context: 'createReviewGrant',
      body: payload
    });
    if (grantResult.unavailable || !grantResult.ok || !grantResult.rows?.[0]?.id) {
      AuthDebug.log('[db] createReviewGrant grant insert failed:', {
        unavailable: !!grantResult.unavailable,
        responseText: grantResult.responseText || null
      });
      return {
        ok: false,
        unavailable: !!grantResult.unavailable,
        grant: null,
        errorStage: 'grant'
      };
    }
    const grant = grantResult.rows[0];
    const rows = entryIdList.map((journalEntryId) => ({
      grant_id: grant.id,
      journal_entry_id: journalEntryId
    }));
    const entriesResult = await reviewGrantWriteSafe({
      method: 'POST',
      userId,
      authSession,
      context: 'createReviewGrantEntries',
      table: 'counsellor_review_grant_entries',
      body: rows
    });
    if (entriesResult.unavailable || !entriesResult.ok) {
      AuthDebug.log('[db] createReviewGrant entry insert failed:', {
        unavailable: !!entriesResult.unavailable,
        responseText: entriesResult.responseText || null,
        grantId: grant.id
      });
      await reviewGrantWriteSafe({
        method: 'PATCH',
        userId,
        authSession,
        context: 'createReviewGrantRollback',
        query: `id=eq.${encodeURIComponent(grant.id)}`,
        body: {
          status: 'revoked',
          revoked_at: new Date().toISOString()
        }
      });
      return {
        ok: false,
        unavailable: !!entriesResult.unavailable,
        grant: null,
        errorStage: 'entries'
      };
    }
    return { ok: true, unavailable: false, grant, errorStage: null };
  },

  revokeReviewGrant: async (userId, grantId, authSession = null) => reviewGrantWriteSafe({
    method: 'PATCH',
    userId,
    authSession,
    context: 'revokeReviewGrant',
    query: `id=eq.${encodeURIComponent(grantId)}`,
    body: {
      status: 'revoked',
      revoked_at: new Date().toISOString()
    }
  }).then((result) => ({
    ok: !!result.ok,
    unavailable: !!result.unavailable
  })),

  getCounsellorGrantedEntries: async (userId, authSession = null) => {
    const grantsResult = await fetchReviewGrantsSafe({
      table: 'counsellor_review_grants',
      query: {
        select: 'id,parent_user_id,parent_id,counsellor_wayfinder_id,expires_at,created_at',
        counsellor_user_id: `eq.${userId}`,
        status: 'eq.active',
        expires_at: `gt.${new Date().toISOString()}`,
        order: 'created_at.desc'
      },
      userId,
      authSession,
      context: 'getCounsellorGrantedEntries grants'
    });
    if (grantsResult.unavailable) {
      return { entries: [], grants: [], grantLinks: [], unavailable: true };
    }
    const grantIds = (grantsResult.rows || []).map((g) => g.id).filter(Boolean);
    if (!grantIds.length) {
      return { entries: [], grants: [], grantLinks: [], unavailable: false };
    }
    const linksResult = await fetchReviewGrantsSafe({
      table: 'counsellor_review_grant_entries',
      query: {
        select: 'id,grant_id,journal_entry_id',
        grant_id: `in.(${grantIds.map((id) => `"${id}"`).join(',')})`
      },
      userId,
      authSession,
      context: 'getCounsellorGrantedEntries links'
    });
    if (linksResult.unavailable) {
      return { entries: [], grants: [], grantLinks: [], unavailable: true };
    }
    const grantLinks = (linksResult.rows || []).map(normalizeCounsellorGrantLinkRow).filter(Boolean);
    const linkByJournalId = Object.fromEntries(
      grantLinks.map((link) => [String(link.journalEntryId), link])
    );
    const entryIds = [...new Set(grantLinks.map((link) => link.journalEntryId).filter(Boolean))];
    if (!entryIds.length) {
      return { entries: [], grants: grantsResult.rows || [], grantLinks, unavailable: false };
    }
    try {
      const session = await getAuthenticatedReadSession(userId, 'getCounsellorGrantedEntries journal', authSession);
      const params = new URLSearchParams({
        select: 'id,parent_id,data,created_at',
        id: `in.(${entryIds.map((id) => `"${String(id).replace(/"/g, '\\"')}"`).join(',')})`,
        order: 'id.desc'
      });
      const response = await fetch(`${SUPABASE_URL}/rest/v1/journal_entries?${params.toString()}`, {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Accept: 'application/json'
        }
      });
      const responseText = await response.text();
      if (!response.ok) {
        if (isReviewGrantsUnavailable(response.status, responseText)) {
          return { entries: [], grants: [], grantLinks: [], unavailable: true };
        }
        AuthDebug.log('[db] granted journal read failed:', { status: response.status, responseText });
        return { entries: [], grants: grantsResult.rows || [], grantLinks, unavailable: false };
      }
      let data = [];
      try {
        data = responseText ? JSON.parse(responseText) : [];
      } catch {
        data = [];
      }
      const entries = (Array.isArray(data) ? data : []).map((r) => {
        const entry = normalizeJournalEntryRow(r);
        const link = linkByJournalId[String(entry.id)];
        if (!link) return entry;
        return {
          ...entry,
          grantId: link.grantId,
          grantEntryId: link.grantEntryId,
          journalEntryId: link.journalEntryId
        };
      });
      return {
        entries,
        grants: grantsResult.rows || [],
        grantLinks,
        unavailable: false
      };
    } catch (err) {
      const message = String(err?.message || err);
      if (isReviewGrantsUnavailable(0, message)) {
        return { entries: [], grants: [], grantLinks: [], unavailable: true };
      }
      return { entries: [], grants: [], grantLinks: [], unavailable: false };
    }
  },

  // Legacy grant-scoped lookup — retained until counsellor UI keys by grantEntryId (Phase 2d.3.2c).
  getCounsellorReviewResponseForGrant: async (userId, grantId, authSession = null) => {
    const grantKey = String(grantId || '').trim();
    if (!grantKey) {
      return { response: null, unavailable: false };
    }
    const result = await fetchReviewResponsesSafe({
      query: {
        select: COUNSELLOR_REVIEW_RESPONSE_LEGACY_SELECT,
        grant_id: `eq.${grantKey}`,
        counsellor_user_id: `eq.${userId}`
      },
      userId,
      authSession,
      context: 'getCounsellorReviewResponseForGrant'
    });
    if (result.unavailable) {
      return { response: null, unavailable: true };
    }
    const row = (result.rows || [])[0];
    return {
      response: row ? normalizeCounsellorReviewResponseRow(row) : null,
      unavailable: false
    };
  },

  getCounsellorReviewResponseForGrantEntry: async (userId, grantEntryId, authSession = null) => {
    const grantEntryKey = String(grantEntryId || '').trim();
    if (!grantEntryKey) {
      return { available: false, response: null, unavailable: false };
    }
    const rpcResult = await callReviewResponseRpcSafe({
      rpcName: 'get_counsellor_review_response_for_grant_entry',
      userId,
      authSession,
      context: 'getCounsellorReviewResponseForGrantEntry',
      body: { p_grant_entry_id: grantEntryKey }
    });
    if (rpcResult.unavailable) {
      return { available: false, response: null, unavailable: true };
    }
    if (!rpcResult.ok) {
      if (isRpcSignatureUnavailable(rpcResult.responseText)) {
        return { available: false, response: null, unavailable: true };
      }
      return { available: false, response: null, unavailable: false };
    }
    const row = parentFeedbackRpcRows(rpcResult.data)[0];
    return {
      available: true,
      response: row ? normalizeCounsellorReviewResponseRow(row) : null,
      unavailable: false
    };
  },

  saveCounsellorReviewResponseDraft: async (userId, grantMeta, draftPayload, authSession = null) => {
    const grantId = String(grantMeta?.grantId || grantMeta?.grant_id || '').trim();
    if (!grantId) {
      return { ok: false, unavailable: false, response: null, errorStage: 'grant' };
    }
    const grantEntryId = String(grantMeta?.grantEntryId || grantMeta?.grant_entry_id || '').trim();
    const journalEntryId = String(grantMeta?.journalEntryId || grantMeta?.journal_entry_id || '').trim();
    const parentUserId = grantMeta?.parentUserId || grantMeta?.parent_user_id;
    const parentId = grantMeta?.parentId || grantMeta?.parent_id;
    const counsellorWayfinderId = grantMeta?.counsellorWayfinderId || grantMeta?.counsellor_wayfinder_id;
    if (!parentUserId || !parentId || !counsellorWayfinderId) {
      return { ok: false, unavailable: false, response: null, errorStage: 'grantMeta' };
    }

    const perEntryMode = !!(grantEntryId && journalEntryId);
    const existing = await fetchReviewResponsesSafe({
      query: perEntryMode ? {
        select: 'id,status',
        grant_entry_id: `eq.${grantEntryId}`,
        counsellor_user_id: `eq.${userId}`
      } : {
        select: 'id,status',
        grant_id: `eq.${grantId}`,
        counsellor_user_id: `eq.${userId}`
      },
      userId,
      authSession,
      context: perEntryMode
        ? 'saveCounsellorReviewResponseDraft per-entry lookup'
        : 'saveCounsellorReviewResponseDraft legacy lookup'
    });
    if (existing.unavailable) {
      return {
        ok: false,
        unavailable: true,
        response: null,
        errorStage: perEntryMode ? 'perEntryLookup' : 'lookup'
      };
    }

    const body = {
      response_sections: draftPayload?.responseSections ?? draftPayload?.response_sections ?? {},
      parent_facing_text: draftPayload?.parentFacingText ?? draftPayload?.parent_facing_text ?? '',
      counsellor_working_notes: draftPayload?.counsellorWorkingNotes ?? draftPayload?.counsellor_working_notes ?? null,
      updated_at: new Date().toISOString()
    };
    const aiDraft = draftPayload?.aiDraftJson ?? draftPayload?.ai_draft_json;
    if (aiDraft !== undefined) body.ai_draft_json = aiDraft;

    const existingRow = (existing.rows || [])[0];
    if (existingRow?.id) {
      if (existingRow.status !== 'draft') {
        return { ok: false, unavailable: false, response: null, errorStage: 'notDraft' };
      }
      const updateResult = await reviewResponseWriteSafe({
        method: 'PATCH',
        userId,
        authSession,
        context: perEntryMode
          ? 'saveCounsellorReviewResponseDraft per-entry update'
          : 'saveCounsellorReviewResponseDraft legacy update',
        query: `id=eq.${encodeURIComponent(existingRow.id)}`,
        body
      });
      if (updateResult.unavailable) {
        return {
          ok: false,
          unavailable: true,
          response: null,
          errorStage: perEntryMode ? 'perEntryUpdate' : 'update'
        };
      }
      if (!updateResult.ok || !updateResult.rows?.[0]) {
        return {
          ok: false,
          unavailable: false,
          response: null,
          errorStage: perEntryMode ? 'perEntryUpdate' : 'update'
        };
      }
      return {
        ok: true,
        unavailable: false,
        response: normalizeCounsellorReviewResponseRow(updateResult.rows[0]),
        errorStage: null
      };
    }

    const insertBody = {
      grant_id: grantId,
      counsellor_user_id: userId,
      parent_user_id: parentUserId,
      parent_id: parentId,
      counsellor_wayfinder_id: counsellorWayfinderId,
      status: 'draft',
      ...body
    };
    if (perEntryMode) {
      insertBody.grant_entry_id = grantEntryId;
      insertBody.journal_entry_id = journalEntryId;
    }

    const insertResult = await reviewResponseWriteSafe({
      method: 'POST',
      userId,
      authSession,
      context: perEntryMode
        ? 'saveCounsellorReviewResponseDraft per-entry insert'
        : 'saveCounsellorReviewResponseDraft legacy insert',
      body: insertBody
    });
    if (insertResult.unavailable) {
      return {
        ok: false,
        unavailable: true,
        response: null,
        errorStage: perEntryMode ? 'perEntryInsert' : 'insert'
      };
    }
    if (!insertResult.ok || !insertResult.rows?.[0]) {
      return {
        ok: false,
        unavailable: false,
        response: null,
        errorStage: perEntryMode ? 'perEntryInsert' : 'insert'
      };
    }
    return {
      ok: true,
      unavailable: false,
      response: normalizeCounsellorReviewResponseRow(insertResult.rows[0]),
      errorStage: null
    };
  },

  publishCounsellorReviewResponse: async (userId, responseId, authSession = null) => {
    const id = String(responseId || '').trim();
    if (!id) {
      return { ok: false, unavailable: false, responseId: null };
    }
    const result = await callReviewResponseRpcSafe({
      rpcName: 'publish_counsellor_review_response',
      userId,
      authSession,
      context: 'publishCounsellorReviewResponse',
      body: { p_response_id: id }
    });
    if (result.unavailable) {
      return { ok: false, unavailable: true, responseId: null };
    }
    if (!result.ok) {
      return { ok: false, unavailable: false, responseId: null };
    }
    const publishedId = result.data ? String(result.data).replace(/^"|"$/g, '') : id;
    return { ok: true, unavailable: false, responseId: publishedId || id };
  },

  revokeCounsellorReviewResponse: async (userId, responseId, authSession = null) => {
    const id = String(responseId || '').trim();
    if (!id) {
      return { ok: false, unavailable: false, responseId: null };
    }
    const result = await callReviewResponseRpcSafe({
      rpcName: 'revoke_counsellor_review_response',
      userId,
      authSession,
      context: 'revokeCounsellorReviewResponse',
      body: { p_response_id: id }
    });
    if (result.unavailable) {
      return { ok: false, unavailable: true, responseId: null };
    }
    if (!result.ok) {
      return { ok: false, unavailable: false, responseId: null };
    }
    const revokedId = result.data ? String(result.data).replace(/^"|"$/g, '') : id;
    return { ok: true, unavailable: false, responseId: revokedId || id };
  },

  getParentPublishedReviewResponses: async (userId, grantId = null, authSession = null) => {
    const body = {};
    const grantKey = grantId ? String(grantId).trim() : '';
    if (grantKey) body.p_grant_id = grantKey;

    const result = await callReviewResponseRpcSafe({
      rpcName: 'get_parent_published_review_responses',
      userId,
      authSession,
      context: 'getParentPublishedReviewResponses',
      body
    });
    if (result.unavailable) {
      return { rows: [], unavailable: true };
    }
    if (!result.ok) {
      return { rows: [], unavailable: false };
    }
    const rows = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
    return {
      rows: rows.map(normalizeParentPublishedReviewResponseRow).filter(Boolean),
      unavailable: false
    };
  },

  getParentUnreadCounsellorFeedbackCount: async (userId, authSession = null) => {
    const result = await callParentFeedbackRpcSafe({
      rpcName: 'get_parent_unread_counsellor_feedback_count',
      userId,
      authSession,
      context: 'getParentUnreadCounsellorFeedbackCount',
      body: {}
    });
    if (result.unavailable) {
      return {
        available: false,
        count: 0,
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    if (!result.ok) {
      return {
        available: false,
        count: 0,
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    return {
      available: true,
      count: parseParentFeedbackRpcCount(result.data)
    };
  },

  getParentUnreadCounsellorFeedbackSummary: async (userId, authSession = null) => {
    const result = await callParentFeedbackRpcSafe({
      rpcName: 'get_parent_unread_counsellor_feedback_summary',
      userId,
      authSession,
      context: 'getParentUnreadCounsellorFeedbackSummary',
      body: {}
    });
    if (result.unavailable) {
      return {
        available: false,
        rows: [],
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    if (!result.ok) {
      return {
        available: false,
        rows: [],
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    return {
      available: true,
      rows: parentFeedbackRpcRows(result.data).map(normalizeParentFeedbackSummaryRow).filter(Boolean)
    };
  },

  getParentCounsellorFeedbackDetail: async (userId, responseId, authSession = null) => {
    const id = String(responseId || '').trim();
    if (!id) {
      return { available: false, detail: null, reason: 'feedback_response_id_required' };
    }
    const result = await callParentFeedbackRpcSafe({
      rpcName: 'get_parent_counsellor_feedback_detail',
      userId,
      authSession,
      context: 'getParentCounsellorFeedbackDetail',
      body: { p_response_id: id }
    });
    if (result.unavailable) {
      return {
        available: false,
        detail: null,
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    if (!result.ok) {
      return {
        available: false,
        detail: null,
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    const detail = normalizeParentFeedbackDetailRow(parentFeedbackRpcRows(result.data)[0]);
    return {
      available: true,
      detail
    };
  },

  markParentCounsellorFeedbackRead: async (userId, responseId, authSession = null) => {
    const id = String(responseId || '').trim();
    if (!id) {
      return {
        available: false,
        ok: false,
        responseId: null,
        grantId: null,
        readAt: null,
        entriesLocked: false,
        reason: 'feedback_response_id_required'
      };
    }
    const result = await callParentFeedbackRpcSafe({
      rpcName: 'mark_parent_counsellor_feedback_read',
      userId,
      authSession,
      context: 'markParentCounsellorFeedbackRead',
      body: { p_response_id: id }
    });
    if (result.unavailable) {
      return {
        available: false,
        ok: false,
        responseId: null,
        grantId: null,
        readAt: null,
        entriesLocked: false,
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    if (!result.ok) {
      return {
        available: false,
        ok: false,
        responseId: null,
        grantId: null,
        readAt: null,
        entriesLocked: false,
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    const row = normalizeParentFeedbackReadRow(parentFeedbackRpcRows(result.data)[0]);
    return {
      available: true,
      ok: true,
      responseId: row?.responseId || id,
      grantId: row?.grantId || null,
      readAt: row?.readAt || null,
      entriesLocked: !!row?.entriesLocked
    };
  },

  saveParentCounsellorFeedbackReflection: async (userId, responseId, arg3, arg4, arg5 = null) => {
    const responseKey = String(responseId || '').trim();
    const { grantEntryId, reflectionText, authSession } = parseParentFeedbackReflectionArgs(arg3, arg4, arg5);
    if (!responseKey) {
      return {
        available: false,
        ok: false,
        reflection: null,
        reason: 'feedback_reflection_context_required'
      };
    }

    const finish = (result, usedLegacy = false) => {
      if (result.unavailable) {
        return {
          available: false,
          ok: false,
          reflection: null,
          reason: parentFeedbackUnavailableReason(result.responseText)
        };
      }
      if (!result.ok) {
        return {
          available: false,
          ok: false,
          reflection: null,
          reason: parentFeedbackUnavailableReason(result.responseText)
        };
      }
      const reflection = normalizeParentFeedbackReflectionRow(parentFeedbackRpcRows(result.data)[0]);
      return {
        available: true,
        ok: !!reflection,
        reflection,
        usedLegacyRpc: usedLegacy
      };
    };

    const perEntryResult = await callParentFeedbackRpcSafe({
      rpcName: 'save_parent_counsellor_feedback_reflection',
      userId,
      authSession,
      context: 'saveParentCounsellorFeedbackReflection per-entry',
      body: {
        p_response_id: responseKey,
        p_reflection_text: reflectionText ?? ''
      }
    });
    if (perEntryResult.ok) {
      return finish(perEntryResult, false);
    }
    if (!isRpcSignatureUnavailable(perEntryResult.responseText)) {
      return finish(perEntryResult, false);
    }

    const grantEntryKey = String(grantEntryId || '').trim();
    if (!grantEntryKey) {
      return {
        available: false,
        ok: false,
        reflection: null,
        reason: parentFeedbackUnavailableReason(perEntryResult.responseText)
      };
    }

    const legacyResult = await callParentFeedbackRpcSafe({
      rpcName: 'save_parent_counsellor_feedback_reflection',
      userId,
      authSession,
      context: 'saveParentCounsellorFeedbackReflection legacy',
      body: {
        p_response_id: responseKey,
        p_grant_entry_id: grantEntryKey,
        p_reflection_text: reflectionText ?? ''
      }
    });
    return finish(legacyResult, true);
  },

  getParentCounsellorFeedbackReflection: async (userId, responseId, arg3, arg4 = null) => {
    const responseKey = String(responseId || '').trim();
    let grantEntryId = null;
    let authSession = null;
    if (isAuthSessionLike(arg4)) {
      grantEntryId = arg3;
      authSession = arg4;
    } else if (isAuthSessionLike(arg3)) {
      authSession = arg3;
    }
    if (!responseKey) {
      return {
        available: false,
        reflection: null,
        reason: 'feedback_reflection_context_required'
      };
    }

    const finish = (result, usedLegacy = false) => {
      if (result.unavailable) {
        return {
          available: false,
          reflection: null,
          reason: parentFeedbackUnavailableReason(result.responseText)
        };
      }
      if (!result.ok) {
        return {
          available: false,
          reflection: null,
          reason: parentFeedbackUnavailableReason(result.responseText)
        };
      }
      const reflection = normalizeParentFeedbackReflectionRow(parentFeedbackRpcRows(result.data)[0]);
      return {
        available: true,
        reflection,
        usedLegacyRpc: usedLegacy
      };
    };

    const perEntryResult = await callParentFeedbackRpcSafe({
      rpcName: 'get_parent_counsellor_feedback_reflection',
      userId,
      authSession,
      context: 'getParentCounsellorFeedbackReflection per-entry',
      body: { p_response_id: responseKey }
    });
    if (perEntryResult.ok) {
      return finish(perEntryResult, false);
    }
    if (!isRpcSignatureUnavailable(perEntryResult.responseText)) {
      return finish(perEntryResult, false);
    }

    const grantEntryKey = String(grantEntryId || '').trim();
    if (!grantEntryKey) {
      return {
        available: false,
        reflection: null,
        reason: parentFeedbackUnavailableReason(perEntryResult.responseText)
      };
    }

    const legacyResult = await callParentFeedbackRpcSafe({
      rpcName: 'get_parent_counsellor_feedback_reflection',
      userId,
      authSession,
      context: 'getParentCounsellorFeedbackReflection legacy',
      body: {
        p_response_id: responseKey,
        p_grant_entry_id: grantEntryKey
      }
    });
    return finish(legacyResult, true);
  },

  getMentalHealthProfessionalOnboardingStatus: async (userId, authSession = null) => {
    const result = await fetchMhpOnboardingRowsSafe({
      userId,
      authSession,
      context: 'getMentalHealthProfessionalOnboardingStatus'
    });
    if (result.unavailable) {
      return {
        available: false,
        requiresOnboarding: false,
        reason: 'mhp_contract_unavailable'
      };
    }
    if (result.error) {
      return {
        available: false,
        requiresOnboarding: false,
        reason: 'read_failed'
      };
    }
    const profile = result.profile;
    const membership = result.membership;
    if (!profile && !membership) {
      return {
        available: true,
        requiresOnboarding: false,
        reason: 'legacy_counsellor'
      };
    }
    const membershipExpires = membership?.institutional_membership_expires_at
      ? new Date(membership.institutional_membership_expires_at)
      : null;
    const membershipActive = membership?.membership_status === 'active'
      && (!membershipExpires || membershipExpires.getTime() > Date.now());
    const profilePublished = profile?.profile_status === 'published'
      && profile?.profile_visible === true;
    if (profilePublished && membershipActive) {
      return {
        available: true,
        requiresOnboarding: false,
        reason: 'complete'
      };
    }
    return {
      available: true,
      requiresOnboarding: true,
      reason: 'incomplete',
      profileStatus: profile?.profile_status || null,
      membershipStatus: membership?.membership_status || null
    };
  },

  getMyMentalHealthProfessionalStatus: async (userId, authSession = null) => {
    const result = await callMhpRpcSafe({
      rpcName: 'get_my_mental_health_professional_status',
      userId,
      authSession,
      context: 'getMyMentalHealthProfessionalStatus',
      body: {}
    });
    if (result.unavailable) {
      return { available: false, unavailable: true, status: null };
    }
    if (!result.ok) {
      return { available: false, unavailable: false, status: null };
    }
    const rows = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
    return {
      available: true,
      unavailable: false,
      status: rows.length ? normalizeMhpStatusRow(rows[0]) : null
    };
  },

  getMyMentalHealthProfessionalProfile: async (userId, authSession = null) => {
    const result = await fetchMhpProfilesSafe({
      query: {
        select: 'user_id,profile_slug,photo_url,full_name,professional_title,license_registration_number,issuing_body,short_bio,country_of_origin,ethnicity,enquiry_email,enquiry_mobile,profile_visible,profile_status,created_at,updated_at',
        user_id: `eq.${userId}`,
        limit: '1'
      },
      userId,
      authSession,
      context: 'getMyMentalHealthProfessionalProfile'
    });
    if (result.unavailable) {
      return { available: false, unavailable: true, profile: null };
    }
    if (!result.ok) {
      return { available: false, unavailable: false, profile: null };
    }
    const row = (result.rows || [])[0];
    return {
      available: true,
      unavailable: false,
      profile: row ? normalizeMhpProfileRow(row) : null
    };
  },

  saveMyMentalHealthProfessionalProfileDraft: async (userId, draftPayload, authSession = null) => {
    const existingResult = await fetchMhpProfilesSafe({
      query: {
        select: 'user_id,profile_status,profile_visible',
        user_id: `eq.${userId}`,
        limit: '1'
      },
      userId,
      authSession,
      context: 'saveMyMentalHealthProfessionalProfileDraft lookup'
    });
    if (existingResult.unavailable) {
      return { ok: false, unavailable: true, profile: null, errorStage: 'unavailable' };
    }
    if (!existingResult.ok) {
      return { ok: false, unavailable: false, profile: null, errorStage: 'lookup' };
    }
    const existing = (existingResult.rows || [])[0];
    const payload = draftPayload || {};
    const body = {
      photo_url: String(payload.photoUrl || '').trim() || null,
      full_name: String(payload.fullName || '').trim() || null,
      professional_title: String(payload.professionalTitle || '').trim() || null,
      license_registration_number: String(payload.licenseRegistrationNumber || '').trim() || null,
      issuing_body: String(payload.issuingBody || '').trim() || null,
      short_bio: String(payload.shortBio || '').trim() || null,
      country_of_origin: String(payload.countryOfOrigin || '').trim() || null,
      ethnicity: String(payload.ethnicity || '').trim() || null,
      enquiry_email: String(payload.enquiryEmail || 'ask.anything@psytec.com.sg').trim() || 'ask.anything@psytec.com.sg',
      enquiry_mobile: String(payload.enquiryMobile || '+65 91681166').trim() || '+65 91681166',
      profile_visible: false
    };
    let writeResult;
    if (!existing) {
      writeResult = await mhpProfileWriteSafe({
        method: 'POST',
        userId,
        authSession,
        context: 'saveMyMentalHealthProfessionalProfileDraft insert',
        body: {
          user_id: userId,
          ...body,
          profile_status: 'draft'
        }
      });
    } else {
      const currentStatus = existing.profile_status || existing.profileStatus || 'draft';
      if (currentStatus === 'published' || currentStatus === 'suspended') {
        return { ok: false, unavailable: false, profile: null, errorStage: 'notEditable' };
      }
      writeResult = await mhpProfileWriteSafe({
        method: 'PATCH',
        userId,
        authSession,
        context: 'saveMyMentalHealthProfessionalProfileDraft update',
        body: {
          ...body,
          profile_status: ['hidden', 'draft', 'pending_review'].includes(currentStatus) ? currentStatus : 'draft'
        },
        query: `user_id=eq.${userId}`
      });
    }
    if (writeResult.unavailable) {
      return { ok: false, unavailable: true, profile: null, errorStage: 'write' };
    }
    if (!writeResult.ok || !(writeResult.rows || []).length) {
      return { ok: false, unavailable: false, profile: null, errorStage: 'write' };
    }
    return {
      ok: true,
      unavailable: false,
      profile: normalizeMhpProfileRow(writeResult.rows[0]),
      errorStage: null
    };
  },

  getMyMentalHealthProfessionalLicenseDocuments: async (userId, authSession = null) => {
    const result = await fetchMhpLicenseDocumentsSafe({
      query: {
        select: 'id,user_id,storage_bucket,storage_path,original_filename,mime_type,file_size_bytes,document_status,extraction_status,extracted_json,extraction_confidence,extraction_model,extracted_at,created_at,updated_at',
        user_id: `eq.${userId}`,
        order: 'created_at.desc'
      },
      userId,
      authSession,
      context: 'getMyMentalHealthProfessionalLicenseDocuments'
    });
    if (result.unavailable) {
      return { available: false, unavailable: true, ok: false, documents: [] };
    }
    if (!result.ok) {
      return { available: false, unavailable: false, ok: false, documents: [] };
    }
    return {
      available: true,
      unavailable: false,
      ok: true,
      documents: (result.rows || []).map(normalizeMhpLicenseDocumentRow).filter(Boolean)
    };
  },

  uploadMentalHealthProfessionalLicenseDocument: async (userId, file, authSession = null) => {
    const source = file && typeof file === 'object' ? file : null;
    const mimeType = String(source?.type || '').trim().toLowerCase();
    const fileName = String(source?.name || '').trim();
    const fileSize = Number(source?.size || 0);
    const looksPdf = mimeType === 'application/pdf' || /\.pdf$/i.test(fileName);
    if (!source || !looksPdf) {
      return { ok: false, unavailable: false, document: null, errorStage: 'invalidType' };
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return { ok: false, unavailable: false, document: null, errorStage: 'invalidFile' };
    }
    if (fileSize > MHP_LICENSE_MAX_BYTES) {
      return { ok: false, unavailable: false, document: null, errorStage: 'tooLarge' };
    }

    const documentId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const ownerId = String(userId || '').trim();
    if (!ownerId) {
      return { ok: false, unavailable: false, document: null, errorStage: 'auth' };
    }
    const storagePath = `${ownerId}/${documentId}.pdf`;

    const uploadResult = await uploadMhpLicensePdfSafe({
      userId: ownerId,
      storagePath,
      file: source,
      authSession,
      context: 'uploadMentalHealthProfessionalLicenseDocument storage'
    });
    if (uploadResult.unavailable) {
      return { ok: false, unavailable: true, document: null, errorStage: 'storageUnavailable' };
    }
    if (!uploadResult.ok) {
      return { ok: false, unavailable: false, document: null, errorStage: 'storageUpload' };
    }

    const insertResult = await mhpLicenseDocumentInsertSafe({
      userId: ownerId,
      authSession,
      context: 'uploadMentalHealthProfessionalLicenseDocument metadata',
      body: {
        id: documentId,
        user_id: ownerId,
        storage_bucket: MHP_LICENSE_BUCKET,
        storage_path: storagePath,
        original_filename: fileName || `${documentId}.pdf`,
        mime_type: 'application/pdf',
        file_size_bytes: fileSize,
        document_status: 'uploaded',
        extraction_status: 'pending'
      }
    });
    if (insertResult.unavailable) {
      return { ok: false, unavailable: true, document: null, errorStage: 'metadataUnavailable' };
    }
    if (!insertResult.ok || !(insertResult.rows || []).length) {
      return { ok: false, unavailable: false, document: null, errorStage: 'metadataInsert' };
    }
    return {
      ok: true,
      unavailable: false,
      document: normalizeMhpLicenseDocumentRow(insertResult.rows[0]),
      documentId,
      errorStage: null
    };
  },

  requestMhpLicenseExtraction: async (userId, documentId, authSession = null) => {
    const ownerId = String(userId || '').trim();
    const docId = String(documentId || '').trim();
    if (!ownerId || !docId) {
      return { ok: false, unavailable: false, extraction: null, document: null, errorStage: 'invalidRequest' };
    }
    try {
      const session = await getAuthenticatedReadSession(ownerId, 'requestMhpLicenseExtraction', authSession);
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller
        ? setTimeout(() => controller.abort(), MHP_EXTRACTION_REQUEST_TIMEOUT_MS)
        : null;
      let response;
      try {
        response = await fetch('/api/extract-mhp-license', {
          method: 'POST',
          signal: controller?.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ documentId: docId })
        });
      } catch (err) {
        if (err?.name === 'AbortError') {
          return {
            ok: false,
            unavailable: false,
            extraction: null,
            document: null,
            errorStage: 'timeout',
            errorCode: 'openai_timeout',
            errorMessage: 'Extraction took too long. Please try again later.'
          };
        }
        throw err;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
      const responseText = await response.text();
      let data = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }
      if (response.status === 404 || response.status === 503 || response.status === 502 || response.status === 504) {
        if (isMhpProfileContractUnavailable(response.status, responseText)) {
          return { ok: false, unavailable: true, extraction: null, document: null, errorStage: 'unavailable' };
        }
      }
      if (!response.ok || !data?.ok) {
        const errorCode = String(data?.error_code || '').trim() || null;
        const stage = errorCode
          || (response.status === 401 || response.status === 403
            ? 'auth'
            : response.status === 409
              ? 'processing'
              : response.status === 422
                ? 'pdfText'
                : 'extract');
        return {
          ok: false,
          unavailable: false,
          extraction: null,
          document: null,
          errorStage: stage,
          errorCode,
          errorMessage: data?.error || null
        };
      }
      const extraction = data.extraction && typeof data.extraction === 'object' ? data.extraction : null;
      const refresh = await fetchMhpLicenseDocumentsSafe({
        query: {
          select: 'id,user_id,storage_bucket,storage_path,original_filename,mime_type,file_size_bytes,document_status,extraction_status,extracted_json,extraction_confidence,extraction_model,extracted_at,created_at,updated_at',
          id: `eq.${docId}`,
          user_id: `eq.${ownerId}`,
          limit: '1'
        },
        userId: ownerId,
        authSession,
        context: 'requestMhpLicenseExtraction refresh'
      });
      const document = !refresh.unavailable && refresh.ok && (refresh.rows || []).length
        ? normalizeMhpLicenseDocumentRow(refresh.rows[0])
        : null;
      return {
        ok: true,
        unavailable: false,
        extraction,
        document,
        requiresHumanReview: data.requires_human_review !== false,
        errorStage: null
      };
    } catch (err) {
      const message = String(err?.message || err);
      if (isMhpProfileContractUnavailable(0, message)) {
        return { ok: false, unavailable: true, extraction: null, document: null, errorStage: 'unavailable' };
      }
      AuthDebug.log('[db] MHP licence extraction request failed:', { message });
      return { ok: false, unavailable: false, extraction: null, document: null, errorStage: 'network' };
    }
  },

  getParentEntryReviewLockMap: async (userId, journalEntryIds, authSession = null) => {
    const ids = [...new Set((Array.isArray(journalEntryIds) ? journalEntryIds : [])
      .map((id) => String(id || '').trim())
      .filter(Boolean))];
    if (!ids.length) {
      return { available: true, locks: [] };
    }
    const result = await callParentFeedbackRpcSafe({
      rpcName: 'get_parent_entry_review_lock_map',
      userId,
      authSession,
      context: 'getParentEntryReviewLockMap',
      body: { p_journal_entry_ids: ids }
    });
    if (result.unavailable) {
      return {
        available: false,
        locks: [],
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    if (!result.ok) {
      return {
        available: false,
        locks: [],
        reason: parentFeedbackUnavailableReason(result.responseText)
      };
    }
    return {
      available: true,
      locks: parentFeedbackRpcRows(result.data).map(normalizeParentEntryReviewLockRow).filter(Boolean)
    };
  }
};
