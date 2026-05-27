// =============================================
// WAY FINDER - Supabase Client
// Auth and database helpers
// =============================================

const SUPABASE_URL = 'https://crcieucwontxbdzkqttd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyY2lldWN3b250eGJkemtxdHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzEzNzUsImV4cCI6MjA5MDQ0NzM3NX0.uxFI5p9WphxCjOEA9GANcIMb0yfeifccNrSBh0mAW4A';

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
    const { data } = await sb.from('profiles').select('parent_id').eq('user_id', userId).maybeSingle();
    return data ? data.parent_id : null;
  },
  create: async (userId) => {
    const parentId = genParentId();
    await sb.from('profiles').insert({ user_id: userId, parent_id: parentId });
    return parentId;
  },
  getOrCreate: async (userId) => {
    let id = await Profile.get(userId);
    if (!id) id = await Profile.create(userId);
    return id;
  },
};

// ---- DATABASE ----
const DB = {
  // Dyads
  getDyad: async (userId, parentId) => {
    const { data, error } = await sb.from('dyads')
      .select('data')
      .eq('user_id', userId)
      .eq('parent_id', parentId)
      .maybeSingle();
    if (error) console.error('getDyad error:', error);
    return data ? data.data : null;
  },

  saveDyad: async (userId, parentId, dyad) => {
    const { error } = await sb.from('dyads')
      .upsert({ user_id: userId, parent_id: parentId, data: dyad }, { onConflict: 'user_id,parent_id' });
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
