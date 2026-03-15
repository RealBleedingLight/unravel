// === SUPABASE SYNC ===
const SUPABASE_URL = 'https://ryxqfjgsgvtoscehttus.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eHFmamdzZ3Z0b3NjZWh0dHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzU4MTAsImV4cCI6MjA4OTE1MTgxMH0.OLbg840mRZDvcxt4HXLELoN8QpsmmEHqK8bg1MTFhXU';

const Sync = {
  client: null,
  session: null,
  _initialized: false,

  async init() {
    if (this._initialized) return this.session;
    this._initialized = true;

    this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

    const { data: { session } } = await this.client.auth.getSession();
    this.session = session;

    this.client.auth.onAuthStateChange(async (event, session) => {
      this.session = session;
      if (event === 'SIGNED_IN') {
        await this._pullAndMerge();
        window.dispatchEvent(new CustomEvent('sync:updated'));
      } else if (event === 'SIGNED_OUT') {
        window.dispatchEvent(new CustomEvent('sync:signout'));
      }
    });

    return this.session;
  },

  get isLoggedIn() { return !!this.session; },
  get userEmail() { return this.session?.user?.email || null; },

  async sendMagicLink(email) {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/toolkit/notebook' }
    });
    return error;
  },

  async signOut() {
    await this.client.auth.signOut();
    this.session = null;
  },

  async saveChapter(chapter) {
    if (!this.isLoggedIn) return;
    const { error } = await this.client.from('chapters').upsert(this._chapterToCloud(chapter));
    if (error) console.warn('[sync] saveChapter:', error.message);
  },

  async saveLevel(level) {
    if (!this.isLoggedIn) return;
    const { error } = await this.client.from('levels').upsert(this._levelToCloud(level));
    if (error) console.warn('[sync] saveLevel:', error.message);
  },

  async deleteChapter(id) {
    if (!this.isLoggedIn) return;
    await this.client.from('chapters').delete().eq('id', id);
  },

  async deleteLevel(id) {
    if (!this.isLoggedIn) return;
    await this.client.from('levels').delete().eq('id', id);
  },

  async _pullAndMerge() {
    const [{ data: cloudChapters, error: e1 }, { data: cloudLevels, error: e2 }] = await Promise.all([
      this.client.from('chapters').select('*'),
      this.client.from('levels').select('*')
    ]);
    if (e1 || e2) { console.warn('[sync] pull error', e1 || e2); return; }

    const localChapters = Store.get('chapters', []);
    const localLevels   = Store.get('levels', []);

    Store.set('chapters', this._merge(localChapters, cloudChapters || [], 'chapter'));
    Store.set('levels',   this._merge(localLevels,   cloudLevels   || [], 'level'));

    // Push items that exist locally but not yet in the cloud
    const cloudChapterIds = new Set((cloudChapters || []).map(c => c.id));
    const cloudLevelIds   = new Set((cloudLevels   || []).map(l => l.id));

    const newChapters = localChapters.filter(c => !cloudChapterIds.has(c.id));
    const newLevels   = localLevels.filter(l => !cloudLevelIds.has(l.id));

    if (newChapters.length)
      await this.client.from('chapters').upsert(newChapters.map(c => this._chapterToCloud(c)));
    if (newLevels.length)
      await this.client.from('levels').upsert(newLevels.map(l => this._levelToCloud(l)));
  },

  _merge(local, cloud, type) {
    const map = {};
    local.forEach(item => { map[item.id] = item; });
    cloud.forEach(item => {
      const converted = type === 'chapter' ? this._chapterFromCloud(item) : this._levelFromCloud(item);
      const existing  = map[item.id];
      if (!existing || new Date(item.updated_at) > new Date(existing.updated)) {
        map[item.id] = converted;
      }
    });
    return Object.values(map);
  },

  _chapterToCloud(c) {
    return {
      id:          c.id,
      user_id:     this.session.user.id,
      name:        c.name        || '',
      description: c.description || '',
      url:         c.url         || '',
      color:       c.color       || '#2dffc2',
      created_at:  c.created,
      updated_at:  c.updated
    };
  },

  _chapterFromCloud(c) {
    return {
      id:          c.id,
      name:        c.name        || '',
      description: c.description || '',
      url:         c.url         || '',
      color:       c.color       || '#2dffc2',
      created:     c.created_at,
      updated:     c.updated_at
    };
  },

  _levelToCloud(l) {
    return {
      id:           l.id,
      chapter_id:   l.chapterId,
      user_id:      this.session.user.id,
      title:        l.title       || '',
      level_number: l.levelNumber || '',
      url:          l.url         || '',
      status:       l.status      || 'unsolved',
      solution:     l.solution    || '',
      notes:        l.notes       || '',
      created_at:   l.created,
      updated_at:   l.updated
    };
  },

  _levelFromCloud(l) {
    return {
      id:          l.id,
      chapterId:   l.chapter_id,
      title:       l.title        || '',
      levelNumber: l.level_number || '',
      url:         l.url          || '',
      status:      l.status       || 'unsolved',
      solution:    l.solution     || '',
      notes:       l.notes        || '',
      created:     l.created_at,
      updated:     l.updated_at
    };
  }
};
