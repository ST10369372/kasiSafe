"use strict";
/* ============================================================
   KasiSafe — app.js
   Modular OOP Architecture
   ============================================================ */


/* ============================================================
   1. STORE — localStorage persistence layer
   ============================================================ */
class Store {
  constructor() {
    this.key  = "kasisafe_reg_v2";
    this.data = this._load();
  }

  _load() {
    const raw = localStorage.getItem(this.key);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fall through */ }
    }
    return null;
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }

  set(seed) {
    this.data = seed;
    this.save();
  }
}


/* ============================================================
   2. SEED DATA
   ============================================================ */
class SeedData {
  static build() {
    const now = Date.now();
    return {
      users: [
        { id: 1, name: "Thandi Mokoena",  phone: "072 123 4567", email: "thandi@kasi.co.za", area: "Zone 6", role: "resident",  suspended: false, reports: 2, trustedContacts: [], lastLocation: null },
        { id: 2, name: "Sipho Dlamini",   phone: "083 555 0199", email: "sipho@kasi.co.za",  area: "Zone 6", role: "resident",  suspended: false, reports: 0, trustedContacts: [], lastLocation: null },
        { id: 3, name: "Moderator Ncube", phone: "011 555 0134", email: "mod@kasi.co.za",    area: "Zone 6", role: "moderator", suspended: false, reports: 0, trustedContacts: [], lastLocation: null },
        { id: 4, name: "Admin Kasi",      phone: "011 555 0100", email: "admin@kasi.co.za",  area: "Zone 6", role: "admin",     suspended: false, reports: 0, trustedContacts: [], lastLocation: null }
      ],
      incidents: [
        { id: 1, cat: "robbery",    desc: "Armed robbery reported near the shops. Suspects left in a white bakkie. Avoid the area.",             loc: "Main St & Vilakazi St",  dist: 0.6, time: "10 min ago",  status: "approved",  confirms: 4,  flags: [],                      severity: "high",   author: "anonymous",       x: .62, y: .30, history: [{ s: "pending", by: "anonymous",       t: "submitted" }] },
        { id: 2, cat: "road",       desc: "Large pothole causing tyre blowouts. Drive with caution.",                                             loc: "Mokoena Rd",             dist: 1.2, time: "32 min ago",  status: "verified",  confirms: 11, flags: [],                      severity: "medium", author: "Thandi Mokoena",  x: .30, y: .52, history: [{ s: "pending", by: "Thandi Mokoena", t: "submitted" }] },
        { id: 3, cat: "suspicious", desc: "Unknown person checking car doors along the street.",                                                  loc: "Extension 4, Zone 6",    dist: 0.9, time: "1 hr ago",    status: "approved",  confirms: 1,  flags: [],                      severity: "medium", author: "anonymous",       x: .48, y: .68, history: [] },
        { id: 4, cat: "fire",       desc: "Shack fire reported. Fire services on scene.",                                                         loc: "Kasi St",                dist: 2.1, time: "2 hrs ago",   status: "resolved",  confirms: 9,  flags: [],                      severity: "high",   author: "Sipho Dlamini",   x: .75, y: .58, history: [] },
        { id: 5, cat: "missing",    desc: "Missing child last seen at the taxi rank wearing a blue jacket. Contact CPF.",                         loc: "Taxi Rank",              dist: 1.6, time: "3 hrs ago",   status: "verified",  confirms: 23, flags: [],                      severity: "high",   author: "anonymous",       x: .40, y: .22, history: [] },
        { id: 6, cat: "theft",      desc: "Vehicle broken into overnight. CCTV footage requested.",                                              loc: "Church parking lot",     dist: 2.4, time: "5 hrs ago",   status: "resolved",  confirms: 6,  flags: [],                      severity: "low",    author: "anonymous",       x: .22, y: .35, history: [] },
        { id: 7, cat: "infra",      desc: "Exposed electrical cable after storm. Municipality notified.",                                         loc: "Ndlovu Ave",             dist: 3.1, time: "Yesterday",   status: "approved",  confirms: 7,  flags: [],                      severity: "medium", author: "Thandi Mokoena",  x: .68, y: .78, history: [] },
        { id: 8, cat: "robbery",    desc: "Mandla from extension 4 is a criminal and everyone knows it, he robbed my cousin last week!!!",       loc: "Extension 4",            dist: 1.1, time: "20 min ago",  status: "pending",   confirms: 0,  flags: ["naming", "accusation"], severity: "high",   author: "Sipho Dlamini",   x: .55, y: .40, history: [] }
      ],
      notifications: [
        {
          id: 1,
          icon: "🚨",
          title: "High-priority alert near you",
          body: "Armed robbery reported ±600 m away. Avoid Main St & Vilakazi St.",
          time: "10 min ago",
          read: false,
          author: "KasiSafe Moderator",
          category: "robbery",
          location: "Main St & Vilakazi St",
          severity: "high",
          incidentId: 1,
          createdAt: new Date(now - 10 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          icon: "✅",
          title: "Report resolved",
          body: "The fire on Kasi St has been marked resolved by moderators.",
          time: "2 hrs ago",
          read: false,
          author: "Moderator Ncube",
          category: "fire",
          location: "Kasi St",
          severity: "high",
          incidentId: 4,
          createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          icon: "🛡️",
          title: "Welcome to KasiSafe",
          body: "Your account is active. Set your alert radius on the map.",
          time: "1 day ago",
          read: true,
          author: "KasiSafe System",
          category: "welcome",
          location: null,
          severity: null,
          incidentId: null,
          createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      nextIds: { user: 5, incident: 9, notif: 4, contact: 1 }
    };
  }
}


/* ============================================================
   3. REGISTRATION SERVICE
   ============================================================ */
class RegistrationService {
  constructor(store) {
    this.store       = store;
    this.currentUser = null;
  }

  register({ name, phone, email, area }) {
    email = email.toLowerCase().trim();
    if (!name || !phone || !email) return { ok: false, msg: "Please fill in name, phone and email." };
    if (this.store.data.users.some(x => x.email === email)) return { ok: false, msg: "An account with this email already exists." };

    const u = {
      id:        this.store.data.nextIds.user++,
      name:      name.trim(),
      phone:     phone.trim(),
      email,
      area:      area?.trim() || "Zone 6",
      role:      "resident",
      suspended: false,
      reports:   0,
      trustedContacts: [],
      lastLocation: null
    };
    this.store.data.users.push(u);
    this.store.save();
    this.currentUser = u;
    return { ok: true, user: u };
  }

  canModerate() { return this.currentUser && ["moderator", "admin"].includes(this.currentUser.role); }
  isAdmin()     { return this.currentUser && this.currentUser.role === "admin"; }
}


/* ============================================================
   4. TRUSTED CONTACTS SERVICE
   ============================================================ */
class TrustedContactsService {
  constructor(store, auth) {
    this.store = store;
    this.auth  = auth;
  }

  get all() {
    if (!this.auth.currentUser) return [];
    return this.auth.currentUser.trustedContacts || [];
  }

  get count() { return this.all.length; }
  get maxed() { return this.count >= 3; }

  add({ name, phone, relation }) {
    if (!this.auth.currentUser) return { ok: false, msg: "Not logged in." };
    if (!name || !phone)          return { ok: false, msg: "Please fill in name and phone." };
    if (this.maxed)               return { ok: false, msg: "Maximum of 3 trusted contacts reached." };

    const contact = {
      id:       this.store.data.nextIds.contact++,
      name:     name.trim(),
      phone:    phone.trim(),
      relation: relation || "Other"
    };
    this.auth.currentUser.trustedContacts.push(contact);
    this.store.save();
    return { ok: true, contact };
  }

  remove(id) {
    if (!this.auth.currentUser) return;
    this.auth.currentUser.trustedContacts =
      this.auth.currentUser.trustedContacts.filter(c => c.id !== id);
    this.store.save();
  }
}


/* ============================================================
   5. LOCATION SERVICE — simulates live GPS
   ============================================================ */
class LocationService {
  static _cached = null;

  static getCurrent() {
    // Simulated current location (Soweto Zone 6 area)
    const base = { lat: -26.2678, lng: 27.8585 };
    const jitter = () => (Math.random() - 0.5) * 0.002;
    const loc = {
      lat: +(base.lat + jitter()).toFixed(6),
      lng: +(base.lng + jitter()).toFixed(6),
      accuracy: Math.floor(Math.random() * 20) + 5,
      timestamp: new Date().toISOString(),
      label: "Soweto Zone 6, Main St & Vilakazi St"
    };
    LocationService._cached = loc;
    return loc;
  }

  static getCached() {
    return LocationService._cached;
  }

  static setCached(loc) {
    LocationService._cached = loc;
  }

  static mapLink(loc) {
    const l = loc || LocationService._cached || LocationService.getCurrent();
    return `https://maps.google.com/?q=${l.lat},${l.lng}`;
  }

  static format(loc) {
    const l = loc || LocationService._cached;
    if (!l) return "Location not set";
    return `${l.label} (±${l.accuracy} m)`;
  }
}


/* ============================================================
   6. PUSH SERVICE — simulated push notification banner + log
   ============================================================ */
class PushService {
  static _timer = null;

  /**
   * Show an in-app push banner AND record a notification in the store.
   * @param {NotifyService} notify
   * @param {object} opts { icon, title, body, type, meta }
   */
  static send(notify, { icon = "🔔", title, body, type = "info", meta = {} }) {
    // Record in notification store
    if (notify) notify.push(icon, title, body, meta);

    // Show banner
    const banner = document.getElementById("pushBanner");
    const titleEl = document.getElementById("pushTitle");
    const bodyEl  = document.getElementById("pushBody");
    if (!banner) return;

    titleEl.textContent = title;
    bodyEl.textContent  = body;
    banner.classList.add("show");

    clearTimeout(PushService._timer);
    PushService._timer = setTimeout(() => banner.classList.remove("show"), 4200);
  }

  /**
   * Broadcast a push to every registered user (simulated via notification list).
   */
  static broadcast(store, { icon = "📢", title, body }) {
    // In a real app this hits a backend push gateway. Here we just log.
    console.log(`[KasiSafe Push Broadcast] ${icon} ${title} — ${body}`);
  }
}


/* ============================================================
   7. EMERGENCY SERVICE — orchestrates SOS + location sharing
   ============================================================ */
class EmergencyService {
  constructor(store, auth, contacts, notify) {
    this.store    = store;
    this.auth     = auth;
    this.contacts = contacts;
    this.notify   = notify;
    this.active   = false;
    this._watch   = null;
  }

  /**
   * Trigger a full SOS:
   *  1. Grab live location (cached or fresh)
   *  2. Send it to all trusted contacts (simulated SMS/WhatsApp)
   *  3. Broadcast a push notification to ALL app users
   *  4. Start live location tracking for 5 minutes
   */
  trigger({ reason = "SOS button pressed" } = {}) {
    const user = this.auth.currentUser;
    if (!user) return { ok: false, msg: "Not registered." };

    // Use cached location if available, otherwise fetch fresh
    const loc = LocationService.getCached() || LocationService.getCurrent();
    const link = LocationService.mapLink(loc);

    // Keep App.state in sync
    if (typeof App !== "undefined" && App.state) {
      App.state.currentLocation = loc;
    }

    this.active = true;

    // 1. Notify trusted contacts
    const recipients = this.contacts.all;
    const contactsNotified = recipients.length;
    recipients.forEach(c => {
      console.log(`[SMS→${c.name} ${c.phone}] 🚨 EMERGENCY from ${user.name}. Live location: ${link} (${loc.label})`);
    });

    // 2. Community-wide push
    PushService.broadcast(this.store, {
      icon: "🚨",
      title: `Emergency alert — ${user.area}`,
      body: `${user.name} triggered SOS near ${loc.label}. Live location shared with their trusted contacts.`
    });
    PushService.send(this.notify, {
      icon: "🚨",
      title: "SOS activated — community notified",
      body: `Your live location was sent to ${contactsNotified} trusted contact${contactsNotified !== 1 ? "s" : ""} and broadcast to all KasiSafe users nearby.`,
      meta: {
        author: user.name,
        category: "sos",
        location: loc.label,
        severity: "high"
      }
    });

    // 3. Live tracking (simulated) — refresh location every 15 s for 5 minutes
    clearInterval(this._watch);
    let ticks = 0;
    this._watch = setInterval(() => {
      ticks++;
      const l = LocationService.getCurrent();
      LocationService.setCached(l);
      if (typeof App !== "undefined" && App.state) {
        App.state.currentLocation = l;
        if (App.instance && App.instance._renderLocationsEverywhere) {
          App.instance._renderLocationsEverywhere();
        }
      }
      console.log(`[LIVE→${recipients.map(r => r.name).join(",") || "no contacts"}] update #${ticks} ${LocationService.mapLink(l)}`);
      if (ticks >= 20) this.stop();
    }, 15000);

    this.store.save();
    return {
      ok: true,
      location: loc,
      link,
      contactsNotified,
      totalContacts: recipients.length
    };
  }

  /**
   * Called when a CALL button is tapped on an emergency service.
   * Sends live location to trusted contacts + push broadcast.
   */
  callService(service) {
    const user = this.auth.currentUser;
    const loc  = LocationService.getCached() || LocationService.getCurrent();
    const link = LocationService.mapLink(loc);
    const recipients = this.contacts.all;

    if (typeof App !== "undefined" && App.state) {
      App.state.currentLocation = loc;
    }

    recipients.forEach(c => {
      console.log(`[SMS→${c.name} ${c.phone}] 📞 Calling ${service.name} (${service.num}). My location: ${link}`);
    });

    PushService.broadcast(this.store, {
      icon: "📞",
      title: `${user.name} is calling ${service.name}`,
      body: `Emergency call to ${service.num}. Live location shared with trusted contacts.`
    });
    PushService.send(this.notify, {
      icon: "📞",
      title: `Calling ${service.name}`,
      body: `Live location sent to ${recipients.length} trusted contact${recipients.length !== 1 ? "s" : ""}. Community has been alerted.`,
      meta: {
        author: user.name,
        category: "emergency-call",
        location: loc.label,
        severity: "high"
      }
    });

    return { loc, link, contactsNotified: recipients.length };
  }

  stop() {
    clearInterval(this._watch);
    this._watch = null;
    this.active = false;
  }
}


/* ============================================================
   8. MODERATION SERVICE
   ============================================================ */
class ModerationService {
  static BANNED = [
    "criminal", "rapist", "thief is", "drug dealer",
    "kill him", "take justice", "his name is", "her name is", "address is"
  ];

  static scan(text) {
    const t     = text.toLowerCase();
    const flags = [];
    ModerationService.BANNED.forEach(w => { if (t.includes(w)) flags.push(w); });
    if (/[A-Z][a-z]+ [A-Z][a-z]+ is/.test(text)) flags.push("possible-name");
    return flags;
  }

  static flagReasons(flags) {
    const map = {
      naming:          "Names an alleged offender",
      accusation:      "Direct unverified accusation",
      "possible-name": "Possible naming of a person"
    };
    return flags.map(f => map[f] || `Flagged term: "${f}"`);
  }
}


/* ============================================================
   9. INCIDENT SERVICE
   ============================================================ */
class IncidentService {
  constructor(store) { this.store = store; }

  get all() { return this.store.data.incidents; }

  visible(radiusKm) {
    return this.all
      .filter(i => i.status !== "pending" && i.status !== "rejected" && i.dist <= radiusKm)
      .sort((a, b) => a.dist - b.dist);
  }

  queue(filter) {
    return this.all.filter(i =>
      filter === "pending"  ? i.status === "pending" :
      filter === "active"   ? ["approved", "confirmed", "verified"].includes(i.status) :
      filter === i.status
    );
  }

  byId(id) { return this.all.find(i => i.id === id); }

  create({ cat, desc, loc, severity, author, anonymous }) {
    const flags = ModerationService.scan(desc);
    const inc = {
      id:       this.store.data.nextIds.incident++,
      cat, desc, loc, severity,
      time:     "just now",
      dist:     +(Math.random() * 2.5 + 0.3).toFixed(1),
      status:   "pending",
      confirms: 0,
      flags,
      author:   anonymous ? "anonymous" : author,
      x:        .15 + Math.random() * .7,
      y:        .15 + Math.random() * .7,
      history:  [{ s: "pending", by: anonymous ? "anonymous" : author, t: "submitted" }]
    };
    this.all.unshift(inc);
    const u = this.store.data.users.find(x => x.name === author);
    if (u) u.reports++;
    this.store.save();
    return inc;
  }

  transition(id, action, by) {
    const inc  = this.byId(id); if (!inc) return;
    const flow = {
      approve: ["pending",   "approved"],
      reject:  ["pending",   "rejected"],
      confirm: ["approved",  "confirmed"],
      verify:  ["confirmed", "verified"],
      resolve: ["verified",  "resolved"]
    };
    if (!flow[action]) return;
    inc.status = flow[action][1];
    inc.history.push({ s: inc.status, by, t: "just now" });
    this.store.save();
  }

  confirm(id) {
    const inc = this.byId(id); if (!inc) return;
    inc.confirms++;
    if (inc.confirms >= 3  && inc.status === "approved")   this.transition(id, "confirm", "community");
    if (inc.confirms >= 10 && inc.status === "confirmed")  this.transition(id, "verify",  "system");
    this.store.save();
  }

  hotspots() {
    const count = {};
    this.all.forEach(i => { if (i.status !== "resolved") count[i.loc] = (count[i.loc] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }

  catStats() {
    const c = {};
    this.all.forEach(i => { if (i.status !== "pending" && i.status !== "rejected") c[i.cat] = (c[i.cat] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }
}


/* ============================================================
   10. NOTIFY SERVICE
   ============================================================ */
class NotifyService {
  constructor(store) { this.store = store; }

  push(icon, title, body, meta = {}) {
    this.store.data.notifications.unshift({
      id: this.store.data.nextIds.notif++,
      icon,
      title,
      body,
      time: "just now",
      read: false,
      // Detailed metadata
      author: meta.author || "KasiSafe System",
      category: meta.category || "general",
      location: meta.location || null,
      severity: meta.severity || null,
      incidentId: meta.incidentId || null,
      createdAt: new Date().toISOString()
    });
    this.store.save();
  }

  unreadCount() { return this.store.data.notifications.filter(n => !n.read).length; }

  markAllRead() {
    this.store.data.notifications.forEach(n => n.read = true);
    this.store.save();
  }

  // Mark a single notification as read
  markRead(id) {
    const n = this.store.data.notifications.find(x => x.id === id);
    if (n) { n.read = true; this.store.save(); }
  }

  // Get a single notification by id
  byId(id) { return this.store.data.notifications.find(n => n.id === id); }
}


/* ============================================================
   11. UI HELPERS
   ============================================================ */
class UI {
  static toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(UI._tt);
    UI._tt = setTimeout(() => t.classList.remove("show"), 2600);
  }

  static modal(icon, title, html) {
    document.getElementById("modalIcon").innerHTML   = icon;
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalText").innerHTML   = html;
    document.getElementById("modal").classList.add("show");
  }
}


/* ============================================================
   12. ROUTER
   ============================================================ */
class Router {
  static go(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));

    const nav = document.getElementById("navbar");
    const hideNav = ["splash", "register", "emergencySetup", "admin"];
    nav.style.display = hideNav.includes(id) ? "none" : "flex";

    document.querySelectorAll(".navbtn").forEach(b => b.classList.toggle("active", b.dataset.go === id));
    document.getElementById("detailPanel").classList.remove("show");

    App.instance.onScreen(id);
  }
}

document.addEventListener("click", e => {
  const g = e.target.closest("[data-go]");
  if (g) Router.go(g.dataset.go);
});


/* ============================================================
   13. MAP RENDERER
   ============================================================ */
class MapRenderer {
  constructor(service) {
    this.svc    = service;
    this.canvas = document.getElementById("mapCanvas");
    this.ctx    = this.canvas.getContext("2d");
    this._bind();
  }

  _bind() {
    this.canvas.addEventListener("click", e => {
      const r  = this.canvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const hit = this.svc.visible(99).find(i => Math.hypot(i.x * r.width - mx, i.y * r.height - my) < 20);
      if (hit) App.instance.openDetail(hit.id);
      else document.getElementById("detailPanel").classList.remove("show");
    });

    document.querySelectorAll(".radius-pill").forEach(p => p.addEventListener("click", () => {
      App.state.radiusKm = +p.dataset.r;
      document.querySelectorAll(".radius-pill").forEach(x => x.classList.toggle("active", x === p));
      App.instance.renderAll();
    }));

    window.addEventListener("resize", () => {
      if (document.getElementById("map").classList.contains("active")) this.draw();
    });
  }

  draw() {
    const c   = this.canvas;
    const ctx = this.ctx;
    const r   = c.parentElement.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;

    c.width  = r.width  * devicePixelRatio;
    c.height = r.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const w = r.width, h = r.height;

    ctx.fillStyle = "#10161d";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#151d26";
    for (let x = 20; x < w; x += 70)
      for (let y = 20; y < h; y += 70)
        ctx.fillRect(x, y, 52, 52);

    const roads = [[.1,.15,.95,.12],[.05,.4,.9,.45],[.15,.85,.85,.8],[.3,.05,.25,.95],[.6,.02,.65,.98],[.85,.1,.8,.9]];
    roads.forEach(rd => {
      ctx.strokeStyle = "#2b3644"; ctx.lineWidth = 10; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(rd[0]*w, rd[1]*h); ctx.lineTo(rd[2]*w, rd[3]*h); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = "#3a4a5c"; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(rd[0]*w, rd[1]*h); ctx.lineTo(rd[2]*w, rd[3]*h); ctx.stroke();
      ctx.setLineDash([]); ctx.strokeStyle = "#2b3644";
    });

    const you = { x: w * .5, y: h * .5 };
    ctx.beginPath();
    ctx.arc(you.x, you.y, App.state.radiusKm / 10 * (w * .9), 0, Math.PI * 2);
    ctx.fillStyle   = "rgba(59,130,246,.07)"; ctx.fill();
    ctx.strokeStyle = "rgba(59,130,246,.5)";
    ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);

    this.svc.visible(App.state.radiusKm + 60).forEach(inc => {
      const px  = inc.x * w;
      const py  = inc.y * h;
      const col = inc.status === "resolved" ? "#22c55e" : CATS[inc.cat].color;

      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.globalAlpha = .25; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;

      ctx.beginPath(); ctx.arc(px, py, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 2; ctx.stroke();

      if (inc.id === App.state.selectedId) {
        ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      }
    });

    ctx.beginPath(); ctx.arc(you.x, you.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6"; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = "#93c5fd"; ctx.font = "bold 11px Segoe UI"; ctx.textAlign = "center";
    ctx.fillText("YOU", you.x, you.y - 13);
  }
}


/* ============================================================
   14. FEED RENDERER
   ============================================================ */
class FeedRenderer {
  static card(inc) {
    const c = CATS[inc.cat];
    const s = STATUS[inc.status];
    return `<div class="card" onclick="App.instance.openDetail(${inc.id})">
      <div class="row1">
        <div class="cat"><span>${c.icon}</span>${c.label}</div>
        <span class="badge ${s.cls}">${s.label}</span>
      </div>
      <div class="meta">📍 <span style="color:var(--blue)">${inc.dist} km away</span> · ${inc.loc} · ${inc.time} · by ${inc.author}</div>
      <div class="desc">${inc.desc}</div>
      <div class="meta" style="margin-top:8px">👥 ${inc.confirms} community confirmation${inc.confirms !== 1 ? "s" : ""} · Severity: ${inc.severity}</div>
    </div>`;
  }

  static render(service, radiusKm) {
    const vis = service.visible(radiusKm);

    document.getElementById("homeFeed").innerHTML   = vis.slice(0, 3).map(FeedRenderer.card).join("");
    document.getElementById("alertsFeed").innerHTML = vis.map(FeedRenderer.card).join("") ||
      '<p style="color:var(--muted);text-align:center;padding:30px">No incidents in your radius 🎉</p>';
    document.getElementById("alertsRadius").textContent = `±${radiusKm} km radius`;
    document.getElementById("mapCount").textContent     = `${vis.length} incident${vis.length !== 1 ? "s" : ""}`;

    document.getElementById("stResolved").textContent = service.all.filter(i => i.status === "resolved").length;
    document.getElementById("stActive").textContent   = service.all.filter(i => ["approved","confirmed","verified"].includes(i.status)).length;
    document.getElementById("stHigh").textContent     = service.all.filter(i => ["robbery","violence","fire"].includes(i.cat) && i.status !== "resolved" && i.status !== "pending").length;

    document.getElementById("hotspots").innerHTML = service.hotspots().map(([loc, n], i) => {
      const cls = n >= 3 ? "hi" : n === 2 ? "md" : "lo";
      return `<div class="card" style="padding:11px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <span>${["🔴","🟠","🟡"][i] || "📍"} ${loc}</span>
        <span class="heat ${cls}">${n} active</span>
      </div>`;
    }).join("");

    document.getElementById("areaWeekly").textContent  = service.all.filter(i => i.status !== "pending").length;
    document.getElementById("areaResolved").textContent = service.all.filter(i => i.status === "resolved").length;
    document.getElementById("areaActive").textContent   = service.all.filter(i => ["approved","confirmed","verified"].includes(i.status)).length;

    const stats = service.catStats();
    document.getElementById("catStats").innerHTML = stats.map(([cat, n]) => {
      const c   = CATS[cat];
      const max = stats[0][1];
      return `<div style="margin-bottom:10px;font-size:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${c.icon} ${c.label}</span><b>${n}</b></div>
        <div style="height:6px;background:var(--border);border-radius:6px">
          <div style="height:100%;width:${(n / max) * 100}%;background:${c.color};border-radius:6px"></div>
        </div>
      </div>`;
    }).join("");
  }
}


/* ============================================================
   15. ADMIN MODULE
   ============================================================ */
class AdminModule {
  constructor(app) {
    this.app    = app;
    this.filter = "pending";
    this._bind();
  }

  _bind() {
    document.querySelectorAll("#adminFilters .f-pill").forEach(p => p.addEventListener("click", () => {
      this.filter = p.dataset.f;
      document.querySelectorAll("#adminFilters .f-pill").forEach(x => x.classList.toggle("active", x === p));
      this.render();
    }));
  }

  _kpi() {
    const d = this.app.store.data;
    document.getElementById("kpiPending").textContent  = d.incidents.filter(i => i.status === "pending").length;
    document.getElementById("kpiFlagged").textContent  = d.incidents.filter(i => i.flags.length && i.status === "pending").length;
    document.getElementById("kpiResolved").textContent = d.incidents.filter(i => i.status === "resolved").length;
    document.getElementById("kpiUsers").textContent    = d.users.length;
  }

  render() {
    this._kpi();
    const el = document.getElementById("adminList");

    if (this.filter === "users")     { el.innerHTML = this._renderUsers();     return; }
    if (this.filter === "broadcast") { el.innerHTML = this._renderBroadcast(); return; }

    const list = this.app.incidents.queue(this.filter);
    el.innerHTML = list.length
      ? list.map(inc => {
          const c = CATS[inc.cat];
          const s = STATUS[inc.status];
          return `<div class="card" style="cursor:default">
            <div class="row1">
              <div class="cat"><span>${c.icon}</span>${c.label}</div>
              <span class="badge ${s.cls}">${s.label}</span>
            </div>
            <div class="meta">📍 ${inc.loc} · ${inc.dist} km · by ${inc.author} · ${inc.time} · severity: ${inc.severity}</div>
            <div class="desc">${inc.desc}</div>
            ${inc.flags.length ? `<div class="flag-note">🚩 Auto-flagged: ${ModerationService.flagReasons(inc.flags).join("; ")}</div>` : ""}
            <div class="admin-actions">${this._actionButtons(inc)}</div>
          </div>`;
        }).join("")
      : '<p style="color:var(--muted);text-align:center;padding:30px">Nothing here 🎉</p>';
  }

  _actionButtons(inc) {
    const a = [];
    if (inc.status === "pending") {
      a.push(`<button class="a-approve" onclick="App.instance.adminAct(${inc.id},'approve')">✔ Approve</button>`);
      a.push(`<button class="a-reject"  onclick="App.instance.adminAct(${inc.id},'reject')">✖ Reject</button>`);
    }
    if (["approved","confirmed"].includes(inc.status))
      a.push(`<button class="a-verify"  onclick="App.instance.adminAct(${inc.id},'verify')">🛡️ Mark Verified</button>`);
    if (["approved","confirmed","verified"].includes(inc.status))
      a.push(`<button class="a-resolve" onclick="App.instance.adminAct(${inc.id},'resolve')">✅ Resolve</button>`);
    if (inc.status !== "rejected")
      a.push(`<button onclick="App.instance.adminAct(${inc.id},'reject')">❌ Remove</button>`);
    return a.join("");
  }

  _renderUsers() {
    return `<div class="card mod-table" style="cursor:default">` +
      this.app.store.data.users.map(u => `
        <div class="mod-row">
          <div class="who">
            <b>${u.name} ${u.suspended ? "🚫" : ""}</b>
            <small>${u.phone || "—"} · ${u.email} · ${u.reports} reports</small>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <span class="role-chip role-${u.role === "moderator" ? "mod" : u.role === "resident" ? "user" : u.role}">${u.role}</span>
            ${u.role !== "admin" ? `<button class="suspend-btn" onclick="App.instance.toggleSuspend(${u.id})">${u.suspended ? "Reinstate" : "Suspend"}</button>` : ""}
          </div>
        </div>`).join("") +
      `</div>`;
  }

  _renderBroadcast() {
    return `<div class="card" style="cursor:default">
      <div class="field"><label>Broadcast title</label><input id="bcTitle" placeholder="e.g. Planned power outage"></div>
      <div class="field"><label>Message (goes to all users)</label><textarea id="bcBody" rows="3" placeholder="Type the community announcement..."></textarea></div>
      <button class="submit-btn" id="bcSend">📢 Send Broadcast</button>
    </div>`;
  }
}


/* ============================================================
   16. CONSTANTS
   ============================================================ */
const CATS = {
  robbery:    { icon: "🔴", label: "Robbery",              color: "#ef4444" },
  suspicious: { icon: "🟠", label: "Suspicious Activity",  color: "#f59e0b" },
  theft:      { icon: "🔴", label: "Vehicle Theft",        color: "#ef4444" },
  accident:   { icon: "🔴", label: "Accident",             color: "#ef4444" },
  fire:       { icon: "🔴", label: "Fire",                 color: "#ef4444" },
  road:       { icon: "🟡", label: "Road Hazard",          color: "#eab308" },
  missing:    { icon: "🔵", label: "Missing Person",       color: "#3b82f6" },
  violence:   { icon: "🔴", label: "Violence",             color: "#ef4444" },
  infra:      { icon: "🟡", label: "Infrastructure Hazard",color: "#eab308" },
  other:      { icon: "🔵", label: "Other Emergency",      color: "#3b82f6" }
};

const STATUS = {
  pending:   { cls: "b-pend", label: "Pending" },
  unverified:{ cls: "b-unv",  label: "Unverified" },
  approved:  { cls: "b-conf", label: "Approved" },
  confirmed: { cls: "b-conf", label: "Community Confirmed" },
  verified:  { cls: "b-ver",  label: "Verified" },
  resolved:  { cls: "b-res",  label: "Resolved" },
  rejected:  { cls: "b-rej",  label: "Rejected" }
};

const TIPS = [
  "💡 Vary your route and travel times when walking home late.",
  "💡 Keep emergency numbers on speed dial — SAPS 10111, Ambulance 10177.",
  "💡 If you see something suspicious, report it — do NOT confront.",
  "💡 Share your live location with a trusted contact when commuting.",
  "💡 Check the KasiSafe map before leaving work or school."
];

const SOS_CONTACTS = [
  { icon: "🚓", bg: "#1e3a8a", name: "Police (SAPS)",            num: "10111" },
  { icon: "🚑", bg: "#7f1d1d", name: "Ambulance",                num: "10177" },
  { icon: "🚒", bg: "#7c2d12", name: "Fire Department",          num: "112" },
  { icon: "🛡️", bg: "#14532d", name: "Community Policing Forum", num: "011 555 0134" },
  { icon: "💜", bg: "#4a044e", name: "GBV Assistance",           num: "0800 150 150" },
  { icon: "📍", bg: "#1e3a8a", name: "Share My Location",        num: "Send live GPS to contacts" }
];


/* ============================================================
   17. MAIN APP — composition root
   ============================================================ */
class App {
  static instance;
  static state = {
    radiusKm: 3,
    selectedId: null,
    reportCat: null,
    currentLocation: null   // stores the last detected/shared location
  };

  constructor() {
    App.instance = this;

    this.store     = new Store();
    if (!this.store.data) this.store.set(SeedData.build());

    this.auth      = new RegistrationService(this.store);
    this.contacts  = new TrustedContactsService(this.store, this.auth);
    this.incidents = new IncidentService(this.store);
    this.notify    = new NotifyService(this.store);
    this.emergency = new EmergencyService(this.store, this.auth, this.contacts, this.notify);
    this.map       = new MapRenderer(this.incidents);
    this.admin     = new AdminModule(this);

    this._buildStatic();
    this._bind();

    setTimeout(() => Router.go("register"), 2000);
  }

  /* ---- build once-only static content ---- */
  _buildStatic() {
    // Report category chips
    Object.entries(CATS).forEach(([key, c]) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.innerHTML = `<span>${c.icon}</span>${c.label}`;
      b.onclick = () => {
        App.state.reportCat = key;
        document.querySelectorAll(".chip").forEach(x => x.classList.remove("sel"));
        b.classList.add("sel");
      };
      document.getElementById("catChips").appendChild(b);
    });

    document.getElementById("repTime").value = new Date().toLocaleString();

    // SOS emergency service contacts
    document.getElementById("sosContacts").innerHTML = SOS_CONTACTS.map((c, i) =>
      `<div class="contact" data-sos-index="${i}">
        <div class="ci" style="background:${c.bg}">${c.icon}</div>
        <div><b>${c.name}</b><small>${c.num}</small></div>
        <span class="call">CALL</span>
      </div>`
    ).join("");

    // Safety tips
    document.getElementById("tipsFeed").innerHTML = TIPS.map(t => `<div class="tip">${t}</div>`).join("");
  }

  /* ---- event bindings ---- */
  _bind() {
    /* ----- REGISTRATION ----- */
    document.getElementById("registerBtn").onclick = () => {
      const name  = document.getElementById("regName").value.trim();
      const phone = document.getElementById("regPhone").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const area  = document.getElementById("regArea").value.trim() || "Zone 6";

      if (!name || !phone || !email) return UI.toast("⚠️ Please fill in name, phone and email.");

      const r = this.auth.register({ name, phone, email, area });
      if (!r.ok) return UI.toast("⚠️ " + r.msg);
      this._onRegister();
    };

    /* ----- EMERGENCY CONTACTS SETUP ----- */
    document.getElementById("addContactBtn").onclick = () => this._addTrustedContact();
    document.getElementById("finishSetupBtn").onclick = () => this._finishSetup();

    /* ----- REPORT ----- */
    document.getElementById("detectBtn").onclick = () => {
      const loc = LocationService.getCurrent();
      const repLoc = document.getElementById("repLoc");
      repLoc.dataset.auto = "true";
      this._setMyLocation(loc);
    };
    document.getElementById("anonSwitch").onclick = e => e.target.classList.toggle("on");
    document.getElementById("repLoc").addEventListener("input", e => {
      e.target.dataset.auto = "false";
    });
    document.getElementById("submitReport").onclick = () => this._submitReport();

    /* ----- SOS BUTTON ----- */
    document.getElementById("sosBtn").onclick = () => this._triggerSOS();

    /* ----- SOS SERVICE CALL BUTTONS (delegated) ----- */
    document.getElementById("sosContacts").addEventListener("click", e => {
      const card = e.target.closest(".contact");
      if (!card) return;
      const idx = +card.dataset.sosIndex;
      this._callEmergencyService(SOS_CONTACTS[idx]);
    });

    /* ----- MANAGE CONTACTS ----- */
    document.getElementById("sosManageContacts").onclick = () => Router.go("emergencySetup");
    document.getElementById("editContactsLink").onclick  = () => Router.go("emergencySetup");

    /* ----- MODAL OK ----- */
    document.getElementById("modalOk").onclick = () => document.getElementById("modal").classList.remove("show");

    /* ----- DETAIL PANEL CLOSE ----- */
    document.getElementById("detailClose").onclick = () => {
      App.state.selectedId = null;
      document.getElementById("detailPanel").classList.remove("show");
      this.map.draw();
    };

    /* ----- NOTIFICATIONS ----- */
    document.getElementById("markReadBtn").onclick = () => { this.notify.markAllRead(); this._renderNotifs(); };

    /* ----- AVATAR → PROFILE ----- */
    document.getElementById("homeAvatar").onclick = () => {
      const u = this.auth.currentUser; if (!u) return;
      const loc = App.state.currentLocation;
      const locLine = loc
        ? `<div style="background:var(--panel);border:1px solid var(--blue);border-radius:10px;padding:10px;margin:8px 0;font-size:12px;text-align:left">
             <div style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">📍 Current location</div>
             <b>${loc.label}</b><br>
             <small style="color:var(--muted)">GPS: ${loc.lat}, ${loc.lng} · ±${loc.accuracy}m</small>
           </div>`
        : `<div style="background:var(--panel);border:1px dashed var(--border);border-radius:10px;padding:10px;margin:8px 0;font-size:12px;color:var(--muted)">
             📍 No location set yet — tap Detect on the Report screen.
           </div>`;

      UI.modal(
        '<i class="fas fa-user" style="color:var(--blue);"></i>',
        u.name,
        `Role: <b>${u.role}</b> · ${u.phone}<br>
         Trusted contacts: <b>${this.contacts.count}</b>/3<br>
         ${locLine}
        ${this.auth.canModerate() ? `<button style="background:var(--purple);border:none;color:#fff;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:700;margin:4px"
          onclick="document.getElementById('modal').classList.remove('show');Router.go('admin')">🛡️ Open Admin Console</button>` : ""}
        <button style="background:var(--panel2);border:1px solid var(--border);color:var(--text);padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:700;margin:4px"
          onclick="document.getElementById('modal').classList.remove('show');Router.go('emergencySetup')">👥 Manage Contacts</button>
        <button style="background:var(--panel2);border:1px solid var(--border);color:var(--text);padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:700;margin:4px"
          onclick="location.reload()">🚪 New Registration</button>`
      );
    };

    /* ----- BROADCAST ----- */
    document.getElementById("adminList").addEventListener("click", e => {
      if (e.target.id === "bcSend") {
        const t = document.getElementById("bcTitle").value.trim();
        const b = document.getElementById("bcBody").value.trim();
        if (!t || !b) return UI.toast("⚠️ Fill in title and message");
        this.notify.push("📢", t, b, {
          author: this.auth.currentUser.name,
          category: "broadcast"
        });
        PushService.send(this.notify, {
          icon: "📢",
          title: t,
          body: b,
          meta: { author: this.auth.currentUser.name, category: "broadcast" }
        });
        UI.toast("📢 Broadcast sent to all users");
      }
    });
  }

  /* ---- called after successful registration ---- */
  _onRegister() {
    const u = this.auth.currentUser;

    document.getElementById("homeAvatar").textContent = u.name[0].toUpperCase();
    document.getElementById("greetName").textContent  = `Good morning, ${u.name.split(" ")[0]} 👋`;

    if (u.email.includes("mod") || u.email.includes("admin")) {
      u.role = u.email.includes("admin") ? "admin" : "moderator";
      this.store.save();
    }

    // Restore saved location OR auto-detect a fresh one
    if (u.lastLocation) {
      LocationService.setCached(u.lastLocation);
      App.state.currentLocation = u.lastLocation;
    } else {
      const loc = LocationService.getCurrent();
      this._setMyLocation(loc, { silent: true });
    }

    // Build admin quick button
    const grid = document.getElementById("quickGrid");
    grid.querySelectorAll(".qbtn.admin").forEach(x => x.remove());
    if (this.auth.canModerate()) {
      const b = document.createElement("button");
      b.className     = "qbtn admin";
      b.dataset.go    = "admin";
      b.innerHTML     = '<span class="qi"><i class="fas fa-shield"></i></span>Admin Console';
      grid.appendChild(b);
    }

    // Push notification welcome
    PushService.send(this.notify, {
      icon: "🛡️",
      title: "Welcome to KasiSafe",
      body: "Now add up to 3 trusted contacts so we can share your live location in an emergency.",
      meta: {
        author: "KasiSafe System",
        category: "welcome"
      }
    });

    this.renderAll();
    Router.go("emergencySetup"); // Force contact setup after registration
    UI.toast(`✅ Welcome, ${u.name.split(" ")[0]} (${u.role})`);
  }

  /* ---- emergency contact setup ---- */
  _addTrustedContact() {
    const name     = document.getElementById("contactName").value.trim();
    const phone    = document.getElementById("contactPhone").value.trim();
    const relation = document.getElementById("contactRelation").value;

    const r = this.contacts.add({ name, phone, relation });
    if (!r.ok) return UI.toast("⚠️ " + r.msg);

    // Clear form
    document.getElementById("contactName").value  = "";
    document.getElementById("contactPhone").value = "";

    this._renderTrustedContactsList();
    this._renderSosTrustedList();
    UI.toast(`✅ ${r.contact.name} added as trusted contact`);
  }

  _removeTrustedContact(id) {
    const c = this.contacts.all.find(x => x.id === id);
    this.contacts.remove(id);
    this._renderTrustedContactsList();
    this._renderSosTrustedList();
    if (c) UI.toast(`🗑️ ${c.name} removed`);
  }

  _finishSetup() {
    if (this.contacts.count === 0) {
      return UI.modal(
        '<i class="fas fa-triangle-exclamation" style="color:var(--yellow);"></i>',
        "Add at least one contact",
        "We strongly recommend adding at least <b>1 trusted contact</b> so your live location can be shared in an emergency. Tap <b>Add Trusted Contact</b> to continue, or tap below to skip."
      );
    }
    Router.go("home");
    UI.toast("🎉 Setup complete — you're all set!");
  }

  _renderTrustedContactsList() {
    const el = document.getElementById("trustedContactsList");
    const list = this.contacts.all;

    if (!list.length) {
      el.innerHTML = `<div class="empty-contacts">
        <i class="fas fa-user-shield"></i>
        No trusted contacts yet. Add up to 3 below.
      </div>`;
    } else {
      el.innerHTML = list.map(c => `
        <div class="trusted-contact-card">
          <div class="tc-avatar">${c.name[0].toUpperCase()}</div>
          <div class="tc-info">
            <b>${c.name}</b>
            <small>${c.phone} <span class="tc-rel">${c.relation}</span></small>
          </div>
          <button class="tc-remove" onclick="App.instance._removeTrustedContact(${c.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join("");
    }

    const addBtn = document.getElementById("addContactBtn");
    addBtn.disabled = this.contacts.maxed;
    addBtn.innerHTML = this.contacts.maxed
      ? '<i class="fas fa-check-circle"></i> Maximum 3 contacts reached'
      : '<i class="fas fa-plus-circle"></i> Add Trusted Contact';

    // Disable form fields if maxed
    ["contactName", "contactPhone", "contactRelation"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = this.contacts.maxed;
    });
  }

  _renderSosTrustedList() {
    const el = document.getElementById("sosTrustedList");
    if (!el) return;
    const list = this.contacts.all;

    if (!list.length) {
      el.innerHTML = `<div class="sos-trusted-empty">
        No trusted contacts yet.<br>
        <a onclick="Router.go('emergencySetup')">Tap here to add some →</a>
      </div>`;
      return;
    }

    el.innerHTML = list.map(c => `
      <div class="trusted-contact-card">
        <div class="tc-avatar">${c.name[0].toUpperCase()}</div>
        <div class="tc-info">
          <b>${c.name}</b>
          <small>${c.phone} <span class="tc-rel">${c.relation}</span></small>
        </div>
        <span style="font-size:11px;color:var(--green);font-weight:700;padding-right:4px">
          <i class="fas fa-satellite-dish"></i> LIVE
        </span>
      </div>
    `).join("");
  }

  /* ---- set location everywhere ---- */
  _setMyLocation(loc, { silent = false } = {}) {
    App.state.currentLocation = loc;
    LocationService.setCached(loc);

    // Save to user profile so it persists across screens
    if (this.auth.currentUser) {
      this.auth.currentUser.lastLocation = loc;
      this.store.save();
    }

    // Update all visible location displays
    this._renderLocationsEverywhere();

    if (!silent) UI.toast(`📍 Location set: ${loc.label}`);
  }

  /* ---- render location everywhere ---- */
  _renderLocationsEverywhere() {
    const loc = App.state.currentLocation;
    const shortLabel = loc ? loc.label.split(",")[0] : "Unknown";
    const accuracy = loc ? `±${loc.accuracy} m` : "";

    // 1. HOME topbar location
    const homeLoc = document.querySelector("#home .loc");
    if (homeLoc) {
      homeLoc.innerHTML = `<i class="fas fa-location-dot"></i> ${shortLabel}${accuracy ? " · " + accuracy : ""}`;
    }

    // 2. MAP topbar location (keeps incident count too)
    const mapCount = document.getElementById("mapCount");
    if (mapCount && loc) {
      const vis = this.incidents.visible(App.state.radiusKm);
      mapCount.innerHTML = `<i class="fas fa-location-dot" style="color:var(--blue)"></i> ${shortLabel} · ${vis.length} incident${vis.length !== 1 ? "s" : ""}`;
    } else if (mapCount && !loc) {
      mapCount.textContent = "Location not set";
    }

    // 3. MAP overlay "you are here" badge
    this._renderMapLocationBadge(loc);

    // 4. AREA screen hero subtitle
    const areaHeroSub = document.querySelector("#area .area-hero .sub");
    if (areaHeroSub) {
      areaHeroSub.innerHTML = loc
        ? `📍 ${loc.label} · ${accuracy} · Privacy-safe aggregated data`
        : `📍 Location not set · Privacy-safe aggregated data`;
    }

    // 5. REPORT screen location field (only auto-fill if not manually edited)
    const repLoc = document.getElementById("repLoc");
    if (repLoc && loc && repLoc.dataset.auto !== "false") {
      repLoc.value = LocationService.format(loc);
    }

    // 6. SOS screen — live location card
    this._renderSosLocationCard(loc);

    // 7. ALERTS screen topbar
    const alertsRadius = document.getElementById("alertsRadius");
    if (alertsRadius) {
      alertsRadius.innerHTML = loc
        ? `<i class="fas fa-location-dot" style="color:var(--blue)"></i> ${shortLabel} · ±${App.state.radiusKm} km`
        : `±${App.state.radiusKm} km radius`;
    }
  }

  /* ---- small "you are here" badge on map overlay ---- */
  _renderMapLocationBadge(loc) {
    const wrap = document.getElementById("mapCanvasWrap");
    if (!wrap) return;

    let badge = document.getElementById("mapLocBadge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "mapLocBadge";
      badge.style.cssText = `
        position:absolute; bottom: 170px; left:12px; right:12px;
        background: rgba(22,27,34,.94); border:1px solid var(--blue);
        border-radius:12px; padding:10px 12px; z-index:5;
        display:flex; align-items:center; gap:10px; font-size:12px;
        backdrop-filter: blur(8px);
      `;
      wrap.appendChild(badge);
    }

    if (!loc) {
      badge.innerHTML = `
        <i class="fas fa-location-crosshairs" style="color:var(--muted);font-size:16px"></i>
        <div style="flex:1">
          <div style="color:var(--muted);font-size:11px">Location not set</div>
          <div style="color:var(--text);font-weight:600">Tap Detect on the Report screen</div>
        </div>`;
      return;
    }

    badge.innerHTML = `
      <i class="fas fa-location-dot" style="color:var(--blue);font-size:18px"></i>
      <div style="flex:1;min-width:0">
        <div style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">You are here</div>
        <div style="color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${loc.label}</div>
        <div style="color:var(--muted);font-size:10.5px">GPS ${loc.lat}, ${loc.lng} · ±${loc.accuracy} m</div>
      </div>
      <a href="${LocationService.mapLink(loc)}" target="_blank"
         style="background:var(--panel2);border:1px solid var(--border);color:var(--blue);
                padding:6px 10px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:700;white-space:nowrap">
        Open
      </a>`;
  }

  /* ---- SOS screen live location card ---- */
  _renderSosLocationCard(loc) {
    const hero = document.querySelector("#sos .sos-hero");
    if (!hero) return;

    let card = document.getElementById("sosLocCard");
    if (!card) {
      card = document.createElement("div");
      card.id = "sosLocCard";
      card.style.cssText = `
        background: var(--panel); border:1px solid var(--blue);
        border-radius:14px; padding:12px 14px; margin-top:16px;
        display:flex; align-items:center; gap:12px; text-align:left;
      `;
      hero.appendChild(card);
    }

    if (!loc) {
      card.innerHTML = `
        <i class="fas fa-location-crosshairs" style="color:var(--muted);font-size:22px"></i>
        <div style="flex:1">
          <b style="font-size:13px">Live location not set</b>
          <small style="color:var(--muted);font-size:11.5px;display:block;margin-top:2px">
            Tap Detect on the Report screen to enable live tracking.
          </small>
        </div>`;
      return;
    }

    card.innerHTML = `
      <i class="fas fa-location-dot" style="color:var(--blue);font-size:22px"></i>
      <div style="flex:1;min-width:0">
        <b style="font-size:13px">Live location active</b>
        <small style="color:var(--muted);font-size:11.5px;display:block;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${loc.label}
        </small>
        <small style="color:var(--blue);font-size:10.5px;display:block;margin-top:2px">
          GPS: ${loc.lat}, ${loc.lng} · accuracy ±${loc.accuracy}m
        </small>
      </div>
      <span style="background:#14532d;color:#4ade80;font-size:10px;font-weight:700;
                   padding:3px 8px;border-radius:10px;letter-spacing:.5px">LIVE</span>`;
  }

  /* ---- SOS triggers ---- */
  _triggerSOS() {
    const user = this.auth.currentUser;
    if (!user) return UI.toast("⚠️ Please register first.");

    if (this.contacts.count === 0) {
      return UI.modal(
        '<i class="fas fa-user-shield" style="color:var(--yellow);"></i>',
        "No trusted contacts yet",
        "You haven't added any trusted contacts. Add at least one so your live location can be shared in an emergency.<br><br>You can still call emergency services from this screen.",
      );
    }

    const result = this.emergency.trigger({ reason: "SOS button pressed" });

    if (!result.ok) return UI.toast("⚠️ " + result.msg);

    // Show detailed confirmation modal
    UI.modal(
      '<i class="fas fa-circle-exclamation" style="color:#ef4444;"></i>',
      "🚨 Emergency alert sent",
      `<div style="text-align:left;font-size:13px;line-height:1.7">
        <b>Live location shared:</b><br>
        <span style="color:var(--blue)">${result.location.label}</span><br>
        <small style="color:var(--muted)">GPS: ${result.location.lat}, ${result.location.lng} (±${result.location.accuracy}m)</small><br><br>

        <b>📱 Trusted contacts notified (${result.contactsNotified}/${result.totalContacts}):</b><br>
        ${this.contacts.all.map(c => `• ${c.name} — ${c.phone}`).join("<br>")}<br><br>

        <b>📢 Community push sent:</b><br>
        <span style="color:var(--green)">All KasiSafe users within 5 km have been alerted.</span><br><br>

        <b>📡 Live tracking:</b> Active for 5 minutes — location updates every 15 seconds.
      </div>`
    );

    // Update the SOS button state
    const btn = document.getElementById("sosBtn");
    btn.style.animation = "none";
    setTimeout(() => { btn.style.animation = ""; }, 2000);
  }

  _callEmergencyService(service) {
    const user = this.auth.currentUser;
    if (!user) return UI.toast("⚠️ Please register first.");

    const result = this.emergency.callService(service);

    const contactsLine = this.contacts.count
      ? `${this.contacts.count} trusted contact${this.contacts.count !== 1 ? "s" : ""}`
      : "no trusted contacts (add some!)";

    UI.modal(
      `<i class="fas fa-phone-volume" style="color:var(--blue);"></i>`,
      `Calling ${service.name}`,
      `<div style="text-align:left;font-size:13px;line-height:1.7">
        <b>Dialing:</b> <span style="color:var(--green)">${service.num}</span><br><br>
        <b>📍 Live location sent to ${contactsLine}:</b><br>
        <span style="color:var(--blue)">${result.link}</span><br><br>
        <b>📢 Community push sent</b> — everyone within 5 km has been alerted.<br><br>
        <small style="color:var(--muted)">In production this dials directly and shares your live GPS with the service.</small>
      </div>`
    );
  }

  /* ---- screen lifecycle hook ---- */
  onScreen(id) {
    // Always re-render location displays (location should be visible everywhere)
    this._renderLocationsEverywhere();

    if (id === "map")           setTimeout(() => this.map.draw(), 30);
    if (id === "area")          setTimeout(() => { document.getElementById("meterFill").style.width = "62%"; }, 100);
    if (id === "notifications") this._renderNotifs();
    if (id === "admin")         this.admin.render();
    if (id === "sos")           this._renderSosTrustedList();
    if (id === "emergencySetup") this._renderTrustedContactsList();
  }

  /* ---- full re-render ---- */
  renderAll() {
    FeedRenderer.render(this.incidents, App.state.radiusKm);
    this._renderNotifDot();
    this._renderSosTrustedList();
    this._renderTrustedContactsList();
    this._renderLocationsEverywhere();
  }

  _renderNotifDot() {
    const n = this.notify.unreadCount();
    const d = document.getElementById("notifDot");
    d.style.display = n ? "flex" : "none";
    d.textContent   = n;
  }

  _renderNotifs() {
    document.getElementById("notifFeed").innerHTML =
      this.store.data.notifications.map(n =>
        `<div class="notif ${n.read ? "" : "unread"}" onclick="App.instance.openNotification(${n.id})" style="cursor:pointer">
          <div class="ni2">${n.icon}</div>
          <div style="flex:1;min-width:0">
            <b>${n.title}</b>
            <small>${n.body}</small>
            <small style="color:var(--muted);display:block;margin-top:4px">🕐 ${n.time}</small>
          </div>
          <i class="fas fa-chevron-right" style="color:var(--muted);font-size:12px;align-self:center;flex-shrink:0"></i>
        </div>`
      ).join("") || '<p style="color:var(--muted);text-align:center;padding:30px">No notifications</p>';
    this._renderNotifDot();
  }

  /* ---- open notification detail ---- */
  openNotification(id) {
    const n = this.notify.byId(id);
    if (!n) return;

    // Mark as read
    this.notify.markRead(id);
    this._renderNotifs();

    // Format the date nicely
    const dateObj = n.createdAt ? new Date(n.createdAt) : new Date();
    const formattedDate = dateObj.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const formattedTime = dateObj.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit"
    });

    // Category badge styling
    const catColors = {
      robbery: "#ef4444",
      fire: "#ef4444",
      suspicious: "#f59e0b",
      road: "#eab308",
      missing: "#3b82f6",
      welcome: "#22c55e",
      sos: "#ef4444",
      "emergency-call": "#3b82f6",
      broadcast: "#a855f7",
      general: "#8b98a9"
    };
    const catColor = catColors[n.category] || catColors.general;

    // Build incident link if available
    const incidentLink = n.incidentId
      ? `<button style="background:var(--panel2);border:1px solid var(--border);color:var(--text);padding:10px 16px;border-radius:10px;cursor:pointer;font-weight:700;margin-top:12px;width:100%"
          onclick="document.getElementById('modal').classList.remove('show');App.instance.openDetail(${n.incidentId})">
          🔍 View Related Incident
         </button>`
      : "";

    UI.modal(
      `<div style="width:64px;height:64px;border-radius:50%;background:${catColor}22;border:2px solid ${catColor};display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto">${n.icon}</div>`,
      n.title,
      `<div style="text-align:left;font-size:13px;line-height:1.8">

        <!-- Message body -->
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:14px">
          ${n.body}
        </div>

        <!-- Metadata rows -->
        <div style="display:flex;flex-direction:column;gap:0">

          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
            <i class="fas fa-user-circle" style="color:var(--blue);width:20px;text-align:center;font-size:16px"></i>
            <div>
              <small style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">Sent by</small>
              <div style="font-weight:600">${n.author || "KasiSafe System"}</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
            <i class="fas fa-calendar-alt" style="color:var(--purple);width:20px;text-align:center;font-size:16px"></i>
            <div>
              <small style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">Date</small>
              <div style="font-weight:600">${formattedDate}</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
            <i class="fas fa-clock" style="color:var(--orange);width:20px;text-align:center;font-size:16px"></i>
            <div>
              <small style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">Time</small>
              <div style="font-weight:600">${formattedTime}</div>
            </div>
          </div>

          ${n.location ? `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
            <i class="fas fa-map-pin" style="color:var(--red);width:20px;text-align:center;font-size:16px"></i>
            <div>
              <small style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">Location</small>
              <div style="font-weight:600">${n.location}</div>
            </div>
          </div>` : ""}

          ${n.category ? `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
            <i class="fas fa-tag" style="color:${catColor};width:20px;text-align:center;font-size:16px"></i>
            <div>
              <small style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">Category</small>
              <div style="font-weight:600;text-transform:capitalize">${n.category.replace("-", " ")}</div>
            </div>
          </div>` : ""}

          ${n.severity ? `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 0">
            <i class="fas fa-exclamation-triangle" style="color:${n.severity === 'high' ? '#ef4444' : n.severity === 'medium' ? '#f59e0b' : '#22c55e'};width:20px;text-align:center;font-size:16px"></i>
            <div>
              <small style="color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.5px">Severity</small>
              <div style="font-weight:600;text-transform:capitalize;color:${n.severity === 'high' ? '#ef4444' : n.severity === 'medium' ? '#f59e0b' : '#22c55e'}">${n.severity}</div>
            </div>
          </div>` : ""}

        </div>

        ${incidentLink}
      </div>`
    );
  }

  /* ---- report submission ---- */
  _submitReport() {
    if (!App.state.reportCat) return UI.toast("⚠️ Please select an incident type");
    const desc = document.getElementById("repDesc").value.trim();
    if (!desc) return UI.toast("⚠️ Please add a short description");

    const inc = this.incidents.create({
      cat:       App.state.reportCat,
      desc,
      loc:       document.getElementById("repLoc").value || "Zone 6 (approximate)",
      severity:  document.getElementById("repSeverity").value,
      author:    this.auth.currentUser.name,
      anonymous: document.getElementById("anonSwitch").classList.contains("on")
    });

    document.getElementById("repDesc").value = "";
    document.getElementById("repLoc").value  = "";
    document.getElementById("repLoc").dataset.auto = "true"; // reset to auto
    App.state.reportCat = null;
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("sel"));

    this.renderAll();

    if (inc.flags.length) {
      UI.modal(
        '<i class="fas fa-flag" style="color:var(--purple);"></i>',
        "Held for moderation",
        "Your report contains potentially problematic content (possible naming/accusation). It has been <b>flagged and sent to moderators</b> and will not appear publicly until reviewed."
      );
    } else {
      UI.modal(
        '<i class="fas fa-hourglass-half" style="color:var(--yellow);"></i>',
        "Report submitted",
        "Your report is now <b>pending moderator approval</b>. It will appear publicly once approved, then move through Community Confirmed → Verified → Resolved as it is confirmed."
      );
    }
  }

  openDetail(id) {
    App.state.selectedId = id;
    const inc = this.incidents.byId(id); if (!inc) return;
    const c   = CATS[inc.cat];
    const s   = STATUS[inc.status];

    const hist = ["pending","approved","confirmed","verified","resolved"].map(step => {
      const done = inc.history.some(h => h.s === step) || (inc.status !== "rejected" && step === "pending");
      const rec  = inc.history.find(h => h.s === step);
      return `<div class="step">
        <div class="sdot" style="background:${done ? "var(--green)" : "var(--border)"}">${done ? "✔" : ""}</div>
        <span>${STATUS[step]?.label || step}${rec ? ` — ${rec.by}, ${rec.t}` : ""}</span>
      </div>`;
    }).join("");

    document.getElementById("detailBody").innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:8px">
        <b style="font-size:16px">${c.icon} ${c.label}</b>
        <span class="badge ${s.cls}">${s.label}</span>
      </div>
      <div class="meta" style="color:var(--muted);font-size:12px;margin-top:6px">📍 ${inc.loc} · ${inc.dist} km away · ${inc.time} · by ${inc.author}</div>
      <div style="font-size:13.5px;margin-top:8px;color:#c7d0dc">${inc.desc}</div>
      ${inc.flags.length ? `<div class="flag-note">🚩 ${ModerationService.flagReasons(inc.flags).join("; ")}</div>` : ""}
      <div class="timeline">
        <b style="color:var(--text);font-size:12px">VERIFICATION TIMELINE</b>
        ${hist}
      </div>
      <div class="btn-row">
        <button class="act-btn" onclick="App.instance.confirm(${inc.id})">✔ Confirm (${inc.confirms})</button>
        ${this.auth.canModerate() ? `<button class="act-btn" onclick="App.instance.adminAct(${inc.id},'resolve')">✅ Resolve</button>` : ""}
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:10px">🔒 Approximate street-segment location shown for privacy.</div>`;

    document.getElementById("detailPanel").classList.add("show");
    if (document.getElementById("map").classList.contains("active")) this.map.draw();
  }

  confirm(id) {
    this.incidents.confirm(id);
    this.openDetail(id);
    this.renderAll();
    UI.toast("✔ Thanks — your confirmation helps verify this report");
  }

  adminAct(id, action) {
    const label = { approve: "approved", reject: "rejected", verify: "verified", resolve: "resolved", confirm: "confirmed" }[action];
    this.incidents.transition(id, action, this.auth.currentUser.name);
    this.renderAll();
    this.admin.render();
    if (App.state.selectedId === id) this.openDetail(id);
    UI.toast(`✅ Report ${label}`);
  }

  toggleSuspend(uid) {
    const u = this.store.data.users.find(x => x.id === uid);
    u.suspended = !u.suspended;
    this.store.save();
    this.admin.render();
    UI.toast(u.suspended ? `🚫 ${u.name} suspended` : `✅ ${u.name} reinstated`);
  }
}

/* ---------- expose globals ---------- */
window.UI          = UI;
window.Router      = Router;
window.App         = App;
window.PushService = PushService;
window.LocationService = LocationService;

/* ---------- BOOT ---------- */
new App();