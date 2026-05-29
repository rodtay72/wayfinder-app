// =============================================
// WAY FINDER - Supabase Client
// Auth and database helpers
// =============================================

const SUPABASE_URL = 'https://mhvjmakraociizeqbvbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odmptYWtyYW9jaWl6ZXFidmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODQ5ODgsImV4cCI6MjA5NTQ2MDk4OH0.WgUnHsG4SiiEO1pjBxHQkWe8eXgqVii0asbG9cNIeBQ';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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

const profileTimestampOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getAuthenticatedReadSession = async (userId, context, parentId) => {
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

const authenticatedSelect = async ({ table, query, userId = null, parentId = null, context }) => {
  const session = await getAuthenticatedReadSession(userId, context, parentId);
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

// ---- AUTH ----
const Auth = {
  signUp: (email, password) => sb.auth.signUp({ email, password }),
  signIn: (email, password) => sb.auth.signInWithPassword({ email, password }),
  resendVerification: (email) => sb.auth.resend({ type: 'signup', email }),
  signOut: () => {
    activeAuthSession = null;
    return sb.auth.signOut();
  },
  getSession: () => sb.auth.getSession(),
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
  getAllDyads: async (userId, parentId) => {
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
      context: 'getAllDyads user_id'
    });
    return mapDyads(data);
  },

  getDyad: async (userId, childId, parentId) => {
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
      context: 'getDyad user_id'
    });
    if (data.length === 0) return null;
    const row = data[0];
    return { ...(row.data || {}), parentId: row.data?.parentId || row.parent_id, childId: row.data?.childId || row.child_id };
  },

  saveDyad: async (userId, parentId, dyad) => {
    const { error } = await sb.from('dyads')
      .upsert({ user_id: userId, parent_id: parentId, child_id: dyad.childId, data: dyad }, { onConflict: 'user_id,child_id' });
    if (error) console.error('saveDyad error:', error);
  },

  // Journal entries
  getEntries: async (userId, parentId) => {
    const mapEntries = rows => (rows || []).map(r => ({
      id: r.data?.id || r.id,
      parentId: r.data?.parentId || r.parent_id || parentId,
      created_at: r.created_at,
      ...(r.data || {})
    }));

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
      context: 'getEntries user_id'
    });
    return mapEntries(data);
  },

  getAllEntries: async () => {
    const data = await authenticatedSelect({
      table: 'journal_entries',
      query: {
        select: 'data',
        order: 'id.desc'
      },
      context: 'getAllEntries'
    });
    return (data || []).map(r => r.data);
  },

  saveEntry: async (userId, entry) => {
    const { error } = await sb.from('journal_entries')
      .insert({ id: entry.id, user_id: userId, parent_id: entry.parentId, data: entry });
    if (error) console.error('saveEntry error:', error);
  },

  // Reviews
  getReview: async (userId, entryId) => {
    const { data, error } = await sb.from('reviews')
      .select('data')
      .eq('user_id', userId)
      .eq('entry_id', entryId)
      .maybeSingle();
    if (error) console.error('getReview error:', error);
    return data ? data.data : null;
  },

  saveReview: async (userId, entryId, review) => {
    const { error } = await sb.from('reviews')
      .upsert({ entry_id: entryId, user_id: userId, data: review }, { onConflict: 'entry_id' });
    if (error) console.error('saveReview error:', error);
  },
};
