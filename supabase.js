// =============================================
// WAY FINDER - Supabase Client
// Auth and database helpers
// =============================================

const SUPABASE_URL = 'https://mhvjmakraociizeqbvbz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odmptYWtyYW9jaWl6ZXFidmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODQ5ODgsImV4cCI6MjA5NTQ2MDk4OH0.WgUnHsG4SiiEO1pjBxHQkWe8eXgqVii0asbG9cNIeBQ';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- AUTH ----
const Auth = {
  signUp: (email, password) => sb.auth.signUp({ email, password }),
  signIn: (email, password) => sb.auth.signInWithPassword({ email, password }),
  signOut: () => sb.auth.signOut(),
  getSession: () => sb.auth.getSession(),
  onAuthChange: (cb) => sb.auth.onAuthStateChange(cb),
};

// ---- PROFILES ----
const Profile = {
  get: async (userId) => {
    console.info('[profile] query existing:', { userId });
    const { data, error, count } = await sb.from('profiles')
      .select('parent_id, role', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);
    const profile = data && data.length > 0 ? data[0] : null;
    console.info('[profile] query existing result:', {
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

    console.info('[profile] auth session source check:', {
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

      console.info('[profile] auth session source check:', {
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

    console.info('[profile] confirmed auth session:', {
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

    console.info('[profile] ensure_profile fetch attempt:', { userId, role: profileRole });
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
    console.info('[profile] ensure_profile fetch result:', {
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
        insight_latest_entry_at: latestEntryAt || null
      })
      .eq('user_id', userId);
    if (error) console.error('saveInsight error:', error);
  },
};
// ---- DATABASE ----
const DB = {
  // Dyads
  getAllDyads: async (userId) => {
    const { data, error } = await sb.from('dyads')
      .select('child_id, data')
      .eq('user_id', userId)
      .order('id', { ascending: true });
    if (error) console.error('getAllDyads error:', error);
    return (data || []).map(r => r.data);
  },

  getDyad: async (userId, childId) => {
    const { data, error } = await sb.from('dyads')
      .select('data')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .maybeSingle();
    if (error) console.error('getDyad error:', error);
    return data ? data.data : null;
  },

  saveDyad: async (userId, parentId, dyad) => {
    const { error } = await sb.from('dyads')
      .upsert({ user_id: userId, parent_id: parentId, child_id: dyad.childId, data: dyad }, { onConflict: 'user_id,child_id' });
    if (error) console.error('saveDyad error:', error);
  },

  // Journal entries
  getEntries: async (userId) => {
    const { data, error } = await sb.from('journal_entries')
      .select('data')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    if (error) console.error('getEntries error:', error);
    return (data || []).map(r => r.data);
  },

  getAllEntries: async () => {
    const { data, error } = await sb.from('journal_entries')
      .select('data')
      .order('id', { ascending: false });
    if (error) console.error('getAllEntries error:', error);
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
