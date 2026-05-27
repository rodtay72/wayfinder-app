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
const genParentId = () => 'P-' + Math.random().toString(36).substr(2,5).toUpperCase();

const Profile = {
  get: async (userId) => {
    const { data } = await sb.from('profiles').select('parent_id, role').eq('user_id', userId).maybeSingle();
    return data || null;
  },
  create: async (userId, role) => {
    const parentId = genParentId();
    await sb.from('profiles').insert({ user_id: userId, parent_id: parentId, role: role || 'parent' });
    return { parent_id: parentId, role: role || 'parent' };
  },
  getOrCreate: async (userId, role) => {
    let profile = await Profile.get(userId);
    if (!profile) {
      profile = await Profile.create(userId, role);
    } else if (profile.role !== role) {
      await sb.from('profiles').update({ role }).eq('user_id', userId);
      profile.role = role;
    }
    return profile;
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
