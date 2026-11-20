'use strict';
/* Bergtage – Konten und Online-Speicher (Supabase).
   Der App-Zustand bleibt als Zwischenspeicher im Browser und wird nach jeder Änderung hochgeladen.
   Leert der Browser seinen Speicher, holt die App nach dem Anmelden alles wieder vom Server. */

const Cloud = {
  sb: null, user: null, err: '', pushing: false, pushT: null, pulledAt: 0,

  init() {
    const c = window.BERGTAGE_CONFIG || {};
    if (!c.supabaseUrl || !c.supabaseKey || !window.supabase) return false;
    this.appUrl = c.appUrl || location.href.split('#')[0];
    this.sb = window.supabase.createClient(c.supabaseUrl, c.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'bergtage.auth' },
    });
    return true;
  },
  get on() { return !!this.sb; },
  get signedIn() { return !!this.user; },

  /* ---------- Anmeldung ---------- */
  async signUp(name, email, password) {
    const { data, error } = await this.sb.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: this.appUrl } });
    if (error) throw error;
    // Supabase meldet bei bereits bestätigten Adressen keinen Fehler, liefert aber keine Identitäten zurück
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw { code: 'user_already_exists' };
    return { needsConfirm: !data.session };
  },
  async signIn(email, password) {
    const { error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async forgot(email) {
    const { error } = await this.sb.auth.resetPasswordForEmail(email, { redirectTo: this.appUrl });
    if (error) throw error;
  },
  async setPassword(password) {
    const { error } = await this.sb.auth.updateUser({ password });
    if (error) throw error;
  },
  async signOut() { await this.sb.auth.signOut({ scope: 'local' }); },
  async deleteAccount() {
    const { error } = await this.sb.rpc('delete_my_account');
    if (error) throw error;
    await this.sb.auth.signOut({ scope: 'local' });
  },

  /* ---------- Abgleich ---------- */
  stateForServer() {
    const { dirtyAt, ...rest } = S;    // lokale Hilfswerte nicht hochladen
    return rest;
  },
  /* Holt den Zustand vom Server. Lokale Änderungen, die noch nicht hochgeladen sind, gehen vor. */
  async pull() {
    const uid = this.user.id;
    const { data, error } = await this.sb.from('user_state').select('state, updated_at').eq('user_id', uid).maybeSingle();
    if (error) throw error;
    const localOwned = S.owner === uid, localDirty = localOwned && S.dirtyAt && (!data || S.dirtyAt > Date.parse(data.updated_at));
    if (!data) {
      // Neues Konto: Was bisher auf diesem Gerät ohne Konto erfasst wurde, wird übernommen
      if (S.owner && !localOwned) S = Object.assign(DEFAULT_STATE(), { theme: S.theme, mode: S.mode });
    } else if (localDirty) {
      // eigene, noch nicht hochgeladene Änderungen behalten
    } else if (!S.owner && S.days.length) {
      S = mergeStates(data.state, S);    // Daten von vor dem Konto dazunehmen
    } else {
      S = Object.assign(DEFAULT_STATE(), data.state, { theme: S.theme });
    }
    S.owner = uid; S.profile.id = uid;
    if (!S.profile.name) S.profile.name = (this.user.user_metadata && this.user.user_metadata.name) || '';
    this.pulledAt = Date.now();
    save(true);
    if (!data || localDirty || S.dirtyAt) { S.dirtyAt = Date.now(); await this.push(); }
  },
  schedulePush() {
    if (!this.signedIn) return;
    clearTimeout(this.pushT);
    this.pushT = setTimeout(() => this.push().catch(() => {}), 900);
  },
  async push() {
    if (!this.signedIn || this.pushing) { if (this.pushing) this.schedulePush(); return; }
    this.pushing = true;
    const stamp = S.dirtyAt;
    try {
      const now = new Date().toISOString(), uid = this.user.id;
      const r1 = await this.sb.from('user_state').upsert({ user_id: uid, state: this.stateForServer(), updated_at: now });
      if (r1.error) throw r1.error;
      const me = myMember();
      const r2 = await this.sb.from('profiles').upsert({ id: uid, name: (S.profile.name || '').slice(0, 40), color: S.profile.color, shared: me.data, updated_at: now });
      if (r2.error) throw r2.error;
      if (S.dirtyAt === stamp) { S.dirtyAt = 0; save(true); }
      this.err = '';
    } catch (e) {
      this.err = 'Nicht gespeichert, weil keine Verbindung zum Server besteht. Die App versucht es erneut.';
      throw e;
    } finally {
      this.pushing = false;
      if (typeof soon === 'function') soon();
    }
  },
};

function mergeStates(remote, local) {
  const out = Object.assign(DEFAULT_STATE(), local, remote);
  const byId = (a, b) => { const m = new Map(); (b || []).forEach(x => m.set(x.id, x)); (a || []).forEach(x => m.set(x.id, x)); return [...m.values()]; };
  out.days = byId(remote.days, local.days);
  out.custom = byId(remote.custom, local.custom);
  out.favs = [...new Set([...(remote.favs || []), ...(local.favs || [])])];
  out.prices = Object.assign({}, local.prices, remote.prices);
  out.ops = Object.assign({}, local.ops, remote.ops);
  out.topcard = { price: (remote.topcard && remote.topcard.price) || (local.topcard && local.topcard.price) || null };
  return out;
}

/* ---------- Gruppen (gleiche Schnittstelle wie früher) ---------- */
const Sync = {
  online: () => Cloud.signedIn,
  async myGroups() {
    const { data, error } = await Cloud.sb.from('groups').select('code, name').order('created_at');
    if (error) throw error;
    return data || [];
  },
  async createGroup(name) {
    const { data, error } = await Cloud.sb.rpc('create_group', { p_name: name });
    if (error) throw error;
    return { code: data, name };
  },
  async joinGroup(code) {
    const { data, error } = await Cloud.sb.rpc('join_group', { p_code: code });
    if (error) throw error;
    return data;   // Name der Gruppe oder null
  },
  async fetchGroup(code) {
    const g = await Cloud.sb.from('groups').select('code, name').eq('code', code).maybeSingle();
    if (g.error) throw g.error;
    if (!g.data) return null;
    const m = await Cloud.sb.from('group_members').select('user_id').eq('group_code', code);
    if (m.error) throw m.error;
    const ids = (m.data || []).map(x => x.user_id);
    const p = ids.length ? await Cloud.sb.from('profiles').select('id, name, color, shared, updated_at').in('id', ids) : { data: [] };
    if (p.error) throw p.error;
    return { code, name: g.data.name, members: (p.data || []).map(x => ({ id: x.id, name: x.name || 'Ohne Namen', color: x.color, data: x.shared || {}, updated: x.updated_at })) };
  },
  async pushMember() { await Cloud.push(); },
  async leave(code) {
    const { error } = await Cloud.sb.from('group_members').delete().eq('group_code', code).eq('user_id', Cloud.user.id);
    if (error) throw error;
  },
};

/* Fehlermeldungen von Supabase in verständliches Deutsch */
function authMessage(e) {
  const code = (e && (e.code || e.error_code)) || '', msg = String((e && e.message) || '');
  if (code === 'invalid_credentials' || /invalid login/i.test(msg)) return 'E-Mail oder Passwort stimmt nicht.';
  if (code === 'email_not_confirmed' || /not confirmed/i.test(msg)) return 'Bestätige zuerst deine E-Mail-Adresse. Den Link dazu haben wir dir per Mail geschickt.';
  if (code === 'user_already_exists' || /already registered/i.test(msg)) return 'Für diese E-Mail-Adresse gibt es schon ein Konto. Melde dich an oder setze das Passwort zurück.';
  if (code === 'weak_password' || /password/i.test(msg) && /least|weak|short/i.test(msg)) return 'Das Passwort ist zu schwach. Nimm mindestens 8 Zeichen mit Buchstaben und Ziffern.';
  if (code === 'over_email_send_rate_limit' || /rate limit|too many/i.test(msg)) return 'Zu viele Versuche in kurzer Zeit. Warte ein paar Minuten und versuche es dann erneut.';
  if (code === 'validation_failed' || /invalid.*email|email.*invalid/i.test(msg)) return 'Diese E-Mail-Adresse ist ungültig.';
  if (code === 'same_password') return 'Das neue Passwort muss sich vom alten unterscheiden.';
  if (/fetch|network/i.test(msg)) return 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.';
  return 'Das hat nicht geklappt. Versuche es erneut.' + (msg ? ` (${msg})` : '');
}
